import * as THREE from 'three';
import {chainRoute,drivetrainCircles,CHAIN_PITCH,FRONT_TEETH,REAR_TEETH,PULLEY_TEETH,pitchRadius,TAU,CASSETTE_TEETH,LINK_COUNT,solveChain} from './mechanics.js';

const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const Z=.1;

export function sprocketGeometry(teeth,depth=.0024,innerRatio=.67){
  const r=pitchRadius(teeth),shape=new THREE.Shape();
  // Tooth gaps and shoulders are visible at inspection scale; not a machining profile.
  for(let i=0;i<teeth*6;i++){
    const phase=i%6,angle=i/(teeth*6)*TAU;
    const radius=r+[-.004,-.003,.0022,.0022,-.003,-.004][phase];
    if(!i)shape.moveTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
    else shape.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);
  }
  shape.closePath();
  const hole=new THREE.Path();hole.absarc(0,0,r*innerRatio,0,TAU,true);shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.00035,bevelThickness:.0003,bevelSegments:1,steps:1,curveSegments:32});
}

function linkGeometry(){
  const p=CHAIN_PITCH/2,r=.0039,neck=.0021,s=new THREE.Shape();
  s.moveTo(-p,r);s.bezierCurveTo(-p*.25,r,-p*.2,neck,0,neck);s.bezierCurveTo(p*.2,neck,p*.25,r,p,r);
  s.absarc(p,0,r,Math.PI/2,-Math.PI/2,true);
  s.bezierCurveTo(p*.25,-r,p*.2,-neck,0,-neck);s.bezierCurveTo(-p*.2,-neck,-p*.25,-r,-p,-r);
  s.absarc(-p,0,r,-Math.PI/2,Math.PI/2,true);s.closePath();
  for(const x of [-p,p]){const hole=new THREE.Path();hole.absarc(x,0,.0013,0,TAU,true);s.holes.push(hole);}
  return new THREE.ExtrudeGeometry(s,{depth:.00065,bevelEnabled:false,curveSegments:10});
}

export function createDrivetrain(parent){
  const steel=new THREE.MeshStandardMaterial({color:0x919ba6,metalness:.92,roughness:.29,envMapIntensity:.8});
  const dark=new THREE.MeshStandardMaterial({color:0x171d25,metalness:.62,roughness:.28});
  const nickel=new THREE.MeshStandardMaterial({color:0xbdab7c,metalness:.74,roughness:.3});
  const pinsMat=new THREE.MeshStandardMaterial({color:0x434b53,metalness:.9,roughness:.24});
  function mesh(group,geometry,material,p){const m=new THREE.Mesh(geometry,material);if(p)m.position.copy(p);m.castShadow=true;group.add(m);return m;}
  function rod(group,a,b,r,material){const d=b.clone().sub(a),m=mesh(group,new THREE.CylinderGeometry(r,r,d.length(),12),material,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1),d.normalize());return m;}
  function cylinder(group,r,depth,material,p,segments=24){const m=mesh(group,new THREE.CylinderGeometry(r,r,depth,segments),material,p);m.rotation.x=Math.PI/2;return m;}
  function bolt(group,p,r=.003){cylinder(group,r,.0025,steel,p,12);cylinder(group,r*.5,.003,pinsMat,p.clone().add(V(0,0,.0015)),6);}
  const crank=new THREE.Group();parent.add(crank);
  for(const [teeth,z] of [[54,Z-.0012],[40,Z-.008]]){
    mesh(crank,sprocketGeometry(teeth),teeth===54?steel:dark,V(0,0,z));
  }
  cylinder(crank,.022,.022,dark,V(0,0,Z-.008));
  for(let i=0;i<5;i++){
    const a=i*TAU/5,p=V(Math.cos(a)*.071,Math.sin(a)*.071,Z-.005);
    const arm=rod(crank,V(0,0,Z-.005),p,.010,dark);arm.scale.z=.6;bolt(crank,p.clone().add(V(0,0,.009)),.0042);
  }
  const pedalBodies=[];
  for(const sign of [-1,1]){
    const z=sign>0?Z+.019:-.077;
    const a=rod(crank,V(0,0,z),V(.1725*sign,0,z),.013,dark);a.scale.z=.62;
    bolt(crank,V(0,0,z+.009),.008);
    const pedal=new THREE.Group();pedal.position.set(.1725*sign,0,z);crank.add(pedal);pedalBodies.push(pedal);
    rod(pedal,V(0,0,-.009),V(0,0,.045*sign),.004,steel);
    const body=mesh(pedal,new THREE.BoxGeometry(.054,.014,.063),dark,V(0,0,.028*sign));
    for(const x of [-.018,.018])rod(pedal,V(x,.008,.005*sign),V(x,.008,.055*sign),.003,steel);
  }
  const cassette=new THREE.Group();cassette.position.set(-.44,.08,0);parent.add(cassette);
  const toothCounts=CASSETTE_TEETH,sprockets=[];
  toothCounts.forEach((teeth,i)=>{
    const z=Z+(5-i)*.0044;
    sprockets.push(mesh(cassette,sprocketGeometry(teeth,.00165,.68),teeth===REAR_TEETH?nickel:steel,V(0,0,z-.0008)));
    const radius=pitchRadius(teeth);
    for(let j=0;j<5;j++){const a=j*TAU/5;rod(cassette,V(Math.cos(a)*.012,Math.sin(a)*.012,z),V(Math.cos(a)*radius*.75,Math.sin(a)*radius*.75,z),.0024,steel);}
  });
  cylinder(cassette,.011,.004,dark,V(0,0,Z+.027));
  for(let i=0;i<12;i++){const a=i*TAU/12;bolt(cassette,V(Math.cos(a)*.008,Math.sin(a)*.008,Z+.03),.0009);}
  // Fixed parallelogram and two rotating jockey wheels with an S-shaped chain route.
  const derailleur=new THREE.Group();parent.add(derailleur);
  const guide=drivetrainCircles.find(c=>c.id==='guide'),tension=drivetrainCircles.find(c=>c.id==='tension');
  rod(parent,V(-.44,.08,.073),V(-.49,.015,.092),.009,dark);
  const shiftLinks=[rod(parent,V(0,0),V(0,1),.011,dark),rod(parent,V(0,0),V(0,1),.006,steel)];

  const cage=new THREE.Group();parent.add(cage);
  const cageBars=[],cageBolts=[];
  for(const z of [-.008,.008]){
    cageBars.push(rod(cage,V(0,0,z),V(0,1,z),.006,dark));
    for(const id of ['guide','tension']){const b=cylinder(cage,.0045,.003,steel,V(0,0,z+.002),12);cageBolts.push({b,id,z:z+.002});}
  }
  const pulleys={};
  for(const c of [guide,tension]){
    const g=new THREE.Group();g.position.set(c.x,c.y,Z);parent.add(g);pulleys[c.id]=g;
    mesh(g,sprocketGeometry(PULLEY_TEETH,.003,.48),dark,V(0,0,-.0015));
    for(let i=0;i<5;i++){const a=i*TAU/5;rod(g,V(0,0),V(Math.cos(a)*c.r*.7,Math.sin(a)*c.r*.7),.0024,steel);}
    cylinder(g,.005,.005,steel,V(0,0));
  }
  const route=chainRoute(drivetrainCircles),count=LINK_COUNT,spacing=CHAIN_PITCH;
  const plateMetal=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.75,roughness:.34,envMapIntensity:.8});
  const plates=new THREE.InstancedMesh(linkGeometry(),plateMetal,count*2);
  const rollerGeo=new THREE.CylinderGeometry(.0036,.0036,.0043,12);rollerGeo.rotateX(Math.PI/2);
  const rollers=new THREE.InstancedMesh(rollerGeo,steel,count);
  const pinGeo=new THREE.CylinderGeometry(.00125,.00125,.009,8);pinGeo.rotateX(Math.PI/2);
  const pins=new THREE.InstancedMesh(pinGeo,pinsMat,count);
  for(const obj of [plates,rollers,pins]){obj.frustumCulled=false;obj.castShadow=true;obj.instanceMatrix.setUsage(THREE.DynamicDrawUsage);parent.add(obj);}
  const outerColor=new THREE.Color(0xbfa574),innerColor=new THREE.Color(0xd5dbe1),masterColor=new THREE.Color(0xff702e);
  for(let i=0;i<count;i++)for(let side=0;side<2;side++)plates.setColorAt(i*2+side,i===0?masterColor:i%2?innerColor:outerColor);
  let travelled=0,crankAngle=0,rearAngle=0,pulleyAngle=0,initialized=false,lastGear=-1;
  const dummy=new THREE.Object3D();
  function update(delta,gear=5){
    if(initialized&&gear===lastGear&&!delta.chain&&!delta.crank&&!delta.rear&&!delta.pulley)return;
    lastGear=gear;
    initialized=true;
    travelled+=delta.chain;crankAngle=(crankAngle+delta.crank)%TAU;rearAngle=(rearAngle+delta.rear)%TAU;pulleyAngle=(pulleyAngle+delta.pulley)%TAU;
    const solved=solveChain(gear,travelled),cs=solved.circles;
    sprockets.forEach((s,i)=>s.material=i===gear?nickel:steel);
    const g=cs[2],t=cs[1];
    pulleys.guide.position.set(g.x,g.y,g.z);pulleys.tension.position.set(t.x,t.y,t.z);
    shiftLinks.forEach((bar,i)=>{const a=i?V(-.465,.018,.082):V(-.49,.015,.092),b=i?V(g.x+.017,g.y,g.z-.017):V(g.x,g.y,g.z-.013),d=b.clone().sub(a);bar.position.copy(a.add(b).multiplyScalar(.5));bar.scale.y=d.length();bar.quaternion.setFromUnitVectors(V(0,1),d.normalize());});
    cageBars.forEach((bar,i)=>{bar.position.set((g.x+t.x)/2,(g.y+t.y)/2,g.z+(i?.008:-.008));bar.scale.y=Math.hypot(t.x-g.x,t.y-g.y);bar.quaternion.setFromUnitVectors(V(0,1),V(t.x-g.x,t.y-g.y).normalize());});
    cageBolts.forEach(({b,id,z})=>{const c=id==='guide'?g:t;b.position.set(c.x,c.y,c.z+z);});
    crank.rotation.z=-crankAngle;cassette.rotation.z=-rearAngle;
    pulleys.guide.rotation.z=pulleyAngle;pulleys.tension.rotation.z=-pulleyAngle;
    // Pedal platforms stay horizontal while their axle goes around the crank.
    pedalBodies.forEach(p=>p.rotation.z=crankAngle);
    for(let i=0;i<count;i++){
      const a=solved.points[i],b=solved.points[(i+1)%count],axis=V(b.x-a.x,b.y-a.y,b.z-a.z).normalize();
      dummy.quaternion.setFromUnitVectors(V(1,0,0),axis);dummy.scale.set(1,1,1);dummy.position.set(a.x,a.y,a.z);dummy.updateMatrix();rollers.setMatrixAt(i,dummy.matrix);pins.setMatrixAt(i,dummy.matrix);
      const normal=V(0,0,1).applyQuaternion(dummy.quaternion);
      for(let side=0;side<2;side++){dummy.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2).addScaledVector(normal,(side?1:-1)*(i%2?.0024:.00335)-(side?0:.00065));dummy.updateMatrix();plates.setMatrixAt(i*2+side,dummy.matrix);}
    }
    plates.instanceMatrix.needsUpdate=rollers.instanceMatrix.needsUpdate=pins.instanceMatrix.needsUpdate=true;
  }
  update({chain:0,crank:0,rear:0,pulley:0});
  return {update,count,route,spacing,reset(){travelled=crankAngle=rearAngle=pulleyAngle=0;initialized=false;update({chain:0,crank:0,rear:0,pulley:0});}};
}
