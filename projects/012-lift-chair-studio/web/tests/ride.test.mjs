import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRideMotion,advanceRide,enterRide,RIDE_RANGE} from '../src/ride.js';
import {initialConfig,createMotion,advanceChair} from '../src/model.js';
import {viewSelection} from '../src/inspection.js';

test('occupied travel stays in bounds, reverses, and accumulates traveled distance',()=>{
  const s=createRideMotion(),c={rideEnabled:true,ridePlaying:true,rideSpeed:.6};let positive=false,negative=false;
  for(let i=0;i<2400;i++){advanceRide(s,c,1/60);assert.ok(Math.abs(s.x)<=RIDE_RANGE);assert.ok(Math.abs(s.velocity)<=.601);positive||=s.velocity>.1;negative||=s.velocity<-.1;}
  assert.ok(positive&&negative);assert.ok(s.distance>10);
});
test('pause freezes position and distance; resume has no jump; exiting clears travel',()=>{
  const s=createRideMotion(),c={rideEnabled:true,ridePlaying:true,rideSpeed:.4};
  for(let i=0;i<40;i++)advanceRide(s,c,.02);const {x,distance}=s;
  for(let i=0;i<100;i++)advanceRide(s,{...c,ridePlaying:false},.1);
  assert.equal(s.x,x);assert.equal(s.distance,distance);assert.equal(s.velocity,0);
  advanceRide(s,c,.02);assert.ok(Math.abs(s.x-x)<=.0081);
  advanceRide(s,{...c,rideEnabled:false},.02);assert.deepEqual(s,createRideMotion());
});
test('entering occupied travel closes lift and prevents conflicts with demo and exploded state',()=>{
  const c=enterRide({...initialConfig,lever:true,demo:true,explode:100,swivel:180,recline:22});
  assert.equal(c.explode,0);assert.equal(c.demo,false);assert.equal(c.loaded,true);assert.equal(c.swivel,0);
  const s=createMotion();advanceChair(s,{...c,lever:true},.1);
  assert.equal(s.height,470);assert.equal(s.lever,false);assert.equal(s.loaded,true);assert.equal(s.recline,0);
  const detail=viewSelection({...c,ridePlaying:true},'base');assert.equal(detail.rideEnabled,false);assert.equal(detail.ridePlaying,false);
});
