import * as THREE from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

// Local chair-back coordinates: +Y is up, -Z is the visible rear surface.
export function shellRear(x,y){
  const u=x/.218,v=(.35-y)/.285;
  return -.052+.028*u*u+.023*Math.exp(-(((v-.35)/.47)**2))-.013*Math.exp(-(((v+.5)/.45)**2));
}
export function shellOutline(){
  const s=new THREE.Shape();
  s.moveTo(-.135,.07);s.bezierCurveTo(-.185,.07,-.218,.095,-.219,.16);
  s.bezierCurveTo(-.219,.28,-.212,.46,-.20,.555);
  s.bezierCurveTo(-.197,.61,-.175,.635,-.125,.637);
  s.lineTo(.125,.637);s.bezierCurveTo(.175,.635,.197,.61,.20,.555);
  s.bezierCurveTo(.212,.46,.219,.28,.219,.16);
  s.bezierCurveTo(.218,.095,.185,.07,.135,.07);s.closePath();return s;
}
function slot(x,y,w,h){
  const p=new THREE.Path(),r=h/2;
  p.moveTo(x-w/2+r,y-r);p.lineTo(x+w/2-r,y-r);
  p.absarc(x+w/2-r,y,r,-Math.PI/2,Math.PI/2,false);
  p.lineTo(x-w/2+r,y+r);p.absarc(x-w/2+r,y,r,Math.PI/2,Math.PI*1.5,false);p.closePath();return p;
}
function curvedExtrusion(shape,depth,offset,bevel){
  const source=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:28});
  // Triangulated caps must be subdivided before warping; a flat cap otherwise
  // turns into a few large, visibly faceted triangles on the curved shell.
  const positions=[];
  function divide(a,b,c,level=0){
    const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);
    if(Math.max(ab,bc,ca)>.02**2&&level<12){
      if(ab>=bc&&ab>=ca){const m=a.clone().add(b).multiplyScalar(.5);divide(a,m,c,level+1);divide(m,b,c,level+1);}
      else if(bc>=ca){const m=b.clone().add(c).multiplyScalar(.5);divide(a,b,m,level+1);divide(a,m,c,level+1);}
      else {const m=c.clone().add(a).multiplyScalar(.5);divide(a,b,m,level+1);divide(m,b,c,level+1);}
    }else for(const v of [a,b,c])positions.push(v.x,v.y,v.z);
  }
  const original=source.attributes.position;
  for(let i=0;i<original.count;i+=3)divide(new THREE.Vector3().fromBufferAttribute(original,i),new THREE.Vector3().fromBufferAttribute(original,i+1),new THREE.Vector3().fromBufferAttribute(original,i+2));
  source.dispose();
  const raw=new THREE.BufferGeometry();raw.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const g=mergeVertices(raw,.00001);raw.dispose();
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+shellRear(p.getX(i),p.getY(i))+offset);
  g.computeVertexNormals();return g;
}
export function backShellGeometry(){
  const shape=shellOutline();
  for(const sign of [-1,1])for(let row=0;row<5;row++)shape.holes.push(slot(sign*.103,.395+row*.026,.092-row*.004,.009));
  return curvedExtrusion(shape,.011,0,.0018);
}
export function backSpineGeometry(){
  const s=new THREE.Shape();
  s.moveTo(-.029,.095);s.lineTo(-.033,.29);
  s.bezierCurveTo(-.038,.355,-.11,.415,-.144,.535);
  s.quadraticCurveTo(-.15,.552,-.131,.558);s.quadraticCurveTo(-.115,.56,-.109,.543);
  s.bezierCurveTo(-.079,.451,-.021,.405,0,.37);
  s.bezierCurveTo(.021,.405,.079,.451,.109,.543);
  s.quadraticCurveTo(.115,.56,.131,.558);s.quadraticCurveTo(.15,.552,.144,.535);
  s.bezierCurveTo(.11,.415,.038,.355,.033,.29);s.lineTo(.029,.095);s.closePath();
  return curvedExtrusion(s,.014,-.025,.003);
}
