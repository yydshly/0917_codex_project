import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,Vector3,MeshStandardMaterial} from 'three';
import {headPivot,steeringRotation,inspectionOffset,isEffectivelyVisible} from '../src/assembly.js';
import {createDrivetrain} from '../src/drivetrain.js';
import {motionDelta} from '../src/mechanics.js';
import {createFittings} from '../src/fittings.js';

test('steering keeps both ends of the head tube fixed at every allowed angle',()=>{
  for(const angle of [-30,-15,0,15,30])for(const point of [headPivot,new Vector3(.48,.32,0)]){
    const moved=point.clone().sub(headPivot).applyQuaternion(steeringRotation(angle)).add(headPivot);
    assert.ok(moved.distanceTo(point)<1e-12);
  }
});
test('exploded inspection tracks the assembly without changing the viewing distance',()=>{
  for(const e of [0,30,100]){
    const offset=inspectionOffset('chain',e),camera=new Vector3(-.3,.18,.35),target=new Vector3(-.32,.055,.1);
    assert.equal(offset.z,e/100*.32);
    assert.ok(Math.abs(camera.distanceTo(target)-camera.add(offset).distanceTo(target.add(offset)))<1e-12);
    assert.equal(inspectionOffset('rear',e).x,-e/100*.22);
    assert.equal(inspectionOffset('saddle',e).y,e/100*.3);
  }
});
test('wheel close-up follows the steered axle and explosion displacement together',()=>{
  const anchor=new Vector3(.58,0,0);
  const expected=anchor.clone().sub(headPivot).applyQuaternion(steeringRotation(30)).add(headPivot).add(new Vector3(.35,0,0));
  assert.ok(anchor.add(inspectionOffset('wheels',100,30)).distanceTo(expected)<1e-12);
});
test('picking excludes descendants of hidden assemblies, but retains visible siblings',()=>{
  const root=new Group(),hidden=new Group(),visible=new Group(),a=new Mesh(),b=new Mesh();
  root.add(hidden,visible);hidden.add(a);visible.add(b);hidden.visible=false;
  assert.equal(isEffectivelyVisible(a),false);assert.equal(isEffectivelyVisible(b),true);
  root.visible=false;assert.equal(isEffectivelyVisible(b),false);
});

test('reset restores chain matrices and crank phase; paused frames do not upload unchanged links',()=>{
  const parent=new Group(),drive=createDrivetrain(parent);
  const plates=parent.children.find(o=>o.isInstancedMesh),crank=parent.children[0];
  const initial=plates.instanceMatrix.array.slice(),version=plates.instanceMatrix.version;
  drive.update(motionDelta(90,1,{playing:false}));
  assert.equal(plates.instanceMatrix.version,version);
  drive.update(motionDelta(90,.123));
  assert.notDeepEqual(plates.instanceMatrix.array,initial);
  assert.notEqual(crank.rotation.z,0);
  drive.reset();
  assert.deepEqual(plates.instanceMatrix.array,initial);
  assert.ok(Math.abs(crank.rotation.z)<1e-12);
});

test('accessories inherit the correct mount, rotate together, and bottle extraction leaves the cage in place',()=>{
  const groups={frame:new Group(),cockpit:new Group(),saddle:new Group()},material=new MeshStandardMaterial();
  const f=createFittings(groups,{carbon:material,metal:material,trim:material,rubber:material,accent:material});
  assert.equal(f.phone.parent,groups.cockpit);assert.equal(f.bell.parent,groups.cockpit);assert.equal(f.bottle.parent,groups.frame);
  const bottleStart=f.bottle.getWorldPosition(new Vector3()),bellStart=f.bell.getWorldPosition(new Vector3());
  groups.cockpit.quaternion.copy(steeringRotation(30));groups.cockpit.position.y=.21;
  assert.ok(f.bell.getWorldPosition(new Vector3()).distanceTo(bellStart)>.1);
  assert.ok(f.bottle.getWorldPosition(new Vector3()).distanceTo(bottleStart)<1e-12);
  for(let i=0;i<180;i++)f.update({phone:true,bell:true,bottle:true,bottleOut:true},1/60);
  assert.ok(Math.abs(f.bottleBody.position.y-.14)<1e-9);
  assert.ok(f.bottle.getWorldPosition(new Vector3()).distanceTo(bottleStart)<1e-12);
  for(let i=0;i<180;i++)f.update({phone:false,bell:false,bottle:false,bottleOut:false},1/60);
  assert.ok(f.bottleBody.position.y<1e-9);assert.equal(f.phone.visible,false);assert.equal(f.bell.visible,false);assert.equal(f.bottle.visible,false);
});
import {createEquipment,equipmentState,seatOffset} from '../src/equipment.js';
test('lights inherit steering/seat mounts, switches extinguish removed lamps, clamp stays on frame',()=>{
  const groups={frame:new Group(),cockpit:new Group(),saddle:new Group()};
  const material=new MeshStandardMaterial(),e=createEquipment(groups,{carbon:material,metal:material});
  assert.equal(e.frontLight.parent,groups.cockpit);assert.equal(e.rearLight.parent,groups.saddle);assert.equal(e.clamp.parent,groups.frame);
  const config={frontLight:true,rearLight:true,lightMode:'steady',seatHeight:80};
  e.update(config);assert.equal(equipmentState(config).frontOn,true);
  e.update({...config,frontLight:false});assert.equal(e.frontLight.visible,false);
  assert.equal(equipmentState({...config,lightMode:'off'}).rearOn,false);
  groups.saddle.position.copy(seatOffset(80));assert.equal(e.clamp.position.y,0);assert.equal(groups.saddle.position.y,.08);assert.ok(groups.saddle.position.x<0);
});

