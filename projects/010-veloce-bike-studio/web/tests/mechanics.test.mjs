import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chainRoute,drivetrainCircles,motionDelta,CHAIN_PITCH,TAU,solveChain,CASSETTE_TEETH,LINK_COUNT} from '../src/mechanics.js';
const route=chainRoute(drivetrainCircles);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('all 12 gears retain fixed 3D pin spacing, a closed loop and a rigid derailleur cage across phases',()=>{
  for(let gear=0;gear<12;gear++)for(let phase=0;phase<1.55;phase+=.137){
    const {points,circles,error}=solveChain(gear,phase);
    assert.equal(points.length,LINK_COUNT);assert.ok(Math.abs(error)<1e-6);
    assert.ok(Math.abs(distance(circles[1],circles[2])-.13)<1e-10);
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)-CHAIN_PITCH)<1e-6,`gear ${gear}, pin ${i}`);
    }
    const delta=motionDelta(60,1,{gear});assert.ok(Math.abs(delta.rear/TAU-54/CASSETTE_TEETH[gear])<1e-10);
  }
});
test('chain route is closed, finite and continuous at every tangent/arc boundary',()=>{
  assert.ok(route.length>1&&route.length<2);
  assert.ok(distance(route.sample(0),route.sample(route.length))<1e-10);
  let offset=0;
  for(const segment of route.segments){
    assert.ok(segment.length>0&&Number.isFinite(segment.length));
    offset+=segment.length;
    assert.ok(distance(route.sample(offset-1e-7),route.sample(offset+1e-7))<3e-7);
  }
  for(let i=0;i<1000;i++){
    const a=route.sample(i*route.length/1000),b=route.sample((i+1)*route.length/1000);
    assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));
    assert.ok(distance(a,b)<=route.length/1000+1e-8);
  }
});
test('straight spans are tangent to their entry and exit pitch circles',()=>{
  const lines=route.segments.filter(s=>s.kind==='line');
  lines.forEach((s,i)=>{
    const a=drivetrainCircles[i],b=drivetrainCircles[(i+1)%4],dx=s.b.x-s.a.x,dy=s.b.y-s.a.y;
    assert.ok(Math.abs((s.a.x-a.x)*dx+(s.a.y-a.y)*dy)<1e-10);
    assert.ok(Math.abs((s.b.x-b.x)*dx+(s.b.y-b.y)*dy)<1e-10);
  });
});
test('tension adjustment closes the loop on an even number of nominal chain pitches',()=>{
  const links=route.length/CHAIN_PITCH;
  assert.ok(Math.abs(links-Math.round(links/2)*2)<1e-9);
});
test('one tooth step advances one pitch, with correct crank/cassette/pulley gearing',()=>{
  const d=motionDelta(78,1,{playing:false,steps:1});
  assert.equal(d.chain,CHAIN_PITCH);
  assert.ok(Math.abs(d.crank-TAU/54)<1e-12);
  assert.ok(Math.abs(d.rear-TAU/16)<1e-12);
  assert.ok(Math.abs(d.pulley-TAU/11)<1e-12);
});
test('slow motion scales all moving parts equally and pause does not drift',()=>{
  const a=motionDelta(90,1),b=motionDelta(90,1,{slow:true}),c=motionDelta(90,1,{playing:false});
  for(const key of Object.keys(a)){assert.ok(Math.abs(b[key]-a[key]*.15)<1e-12);assert.equal(c[key],0);}
});
