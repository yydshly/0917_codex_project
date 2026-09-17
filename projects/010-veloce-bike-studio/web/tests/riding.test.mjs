import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3,MeshStandardMaterial} from 'three';
import {initialConfig} from '../src/config.js';
import {createRide,advanceRide,rideReadout,cadenceSpeed} from '../src/riding.js';
import {createCaliper} from '../src/brakes.js';
const run=(state,config,seconds,fps=120)=>{for(let i=0;i<Math.round(seconds*fps);i++)advanceRide(state,config,1/fps);return state;};

test('steady pedaling maintains the selected cadence speed without numerical drift',()=>{
  const state=run(createRide(),initialConfig,10);
  assert.ok(Math.abs(state.speed-cadenceSpeed(78))<1e-9);
  assert.equal(rideReadout(state,initialConfig).speed.toFixed(1),'33.7');
});

test('coasting keeps the wheel moving with stationary crank, cassette and chain',()=>{
  const state=createRide(),before=state.speed,motion=advanceRide(state,{...initialConfig,pedaling:false},.1);
  assert.ok(state.speed>0&&state.speed<before);assert.ok(motion.wheel>0);
  for(const key of ['crank','rear','pulley','chain'])assert.equal(motion[key],0);
  assert.equal(rideReadout(state,{...initialConfig,pedaling:false}).power,0);
});
test('front and rear brake independently decelerate, and combining them brakes more strongly',()=>{
  const coast=run(createRide(),{...initialConfig,pedaling:false},1);
  const front=run(createRide(),{...initialConfig,frontBrake:50},1);
  const rear=run(createRide(),{...initialConfig,rearBrake:50},1);
  const both=run(createRide(),{...initialConfig,frontBrake:50,rearBrake:50},1);
  assert.ok(both.speed<front.speed&&front.speed<rear.speed&&rear.speed<coast.speed);
  assert.equal(front.actualCadence,0);
});
test('full braking stops without reversing; release and pedaling accelerates from rest',()=>{
  const state=run(createRide(),{...initialConfig,frontBrake:100,rearBrake:100},3);
  assert.equal(state.speed,0);assert.equal(state.mode,'held');assert.ok(state.brakeDistance>0);
  const distance=state.brakeDistance;run(state,{...initialConfig,frontBrake:100,rearBrake:100},2);assert.equal(state.brakeDistance,distance);
  run(state,initialConfig,1);assert.ok(state.speed>0&&state.speed<cadenceSpeed(78));
  assert.equal(state.mode,'pedaling');
});
test('pause freezes distance and speed; slow motion advances the same physical trajectory',()=>{
  const state=createRide(),before={...state};const motion=advanceRide(state,{...initialConfig,playing:false},.1);
  assert.equal(state.speed,before.speed);assert.equal(state.distance,before.distance);assert.ok(Object.values(motion).every(v=>v===0));
  const normal=run(createRide(),{...initialConfig,pedaling:false,rearBrake:40},1.5);
  const slow=run(createRide(),{...initialConfig,pedaling:false,rearBrake:40,slow:true},10);
  assert.ok(Math.abs(normal.speed-slow.speed)<.002);assert.ok(Math.abs(normal.brakeDistance-slow.brakeDistance)<.01);
});
test('lowering cadence allows the freewheel to overrun, and simulation is frame-rate stable',()=>{
  const state=createRide(),motion=advanceRide(state,{...initialConfig,cadence:30},.1);
  assert.ok(motion.wheel>motion.rear&&motion.rear>0);
  const a=run(createRide(),{...initialConfig,frontBrake:35},2,30),b=run(createRide(),{...initialConfig,frontBrake:35},2,120);
  assert.ok(Math.abs(a.speed-b.speed)<1e-8);
});
test('caliper pads close symmetrically without crossing the rotor and reopen after release',()=>{
  const parent=new Group(),material=new MeshStandardMaterial(),brake=createCaliper(parent,new Vector3(),true,{carbon:material,metal:material});
  brake.update(0,false);const open=brake.pads.map(p=>p.mesh.position.z);
  brake.update(100,true);assert.ok(brake.pads.every(p=>Math.abs(p.mesh.position.z)<.006));
  // Rotor half-thickness .0008; pad half-thickness .0012.
  assert.ok(brake.pads.every(p=>Math.abs(p.mesh.position.z)-.0012>=.0008-1e-12));
  assert.equal(brake.group.children[0].visible,false);
  brake.update(0,false);assert.deepEqual(brake.pads.map(p=>p.mesh.position.z),open);
});

test('changing rear cog preserves instantaneous road speed, changes gearing and retains braking',()=>{
  const state=createRide(78),speed=state.speed;
  const cfg={...initialConfig,gear:11};
  const delta=advanceRide(state,cfg,0);
  assert.equal(state.speed,speed);assert.equal(delta.wheel,0);
  const shifted=advanceRide(state,cfg,1/60);
  assert.ok(Math.abs(shifted.rear/shifted.crank-54/32)<1e-9);
  advanceRide(state,{...cfg,frontBrake:100,rearBrake:100},.25);
  assert.ok(state.speed<speed);
});
