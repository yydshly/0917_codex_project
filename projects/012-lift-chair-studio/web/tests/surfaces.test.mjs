import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {cushionGeometry,cushionFront,backSeamX,seatForm,backForm,headForm,lumbarForm,castLegGeometry} from '../src/surfaces.js';
test('upholstery surfaces are closed indexed meshes with finite normals and declared extents',()=>{
  for(const f of [seatForm,backForm,headForm,lumbarForm]){
    const g=cushionGeometry(f),edges=new Map();
    for(const attr of ['position','normal','uv'])assert.ok([...g.attributes[attr].array].every(Number.isFinite));
    const idx=g.index.array;for(let i=0;i<idx.length;i+=3)for(let j=0;j<3;j++){const a=idx[i+j],b=idx[i+(j+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;edges.set(key,(edges.get(key)||0)+1);}
    assert.ok([...edges.values()].every(n=>n===2),'every edge must belong to two triangles');
    g.computeBoundingBox();assert.ok(g.boundingBox.max.x-g.boundingBox.min.x<=f.width*1.05);assert.ok(g.boundingBox.max.z-g.boundingBox.min.z<=f.length*1.001);g.dispose();
  }
});
test('cast leg stays within hub-to-caster dimensions and has no nonfinite vertices',()=>{const g=castLegGeometry();g.computeBoundingBox();assert.ok(g.boundingBox.max.z<.35);assert.ok(g.boundingBox.min.y>.04);assert.ok([...g.attributes.normal.array].every(Number.isFinite));g.dispose();});
test('back seam follows the rendered cushion surface within one millimetre',()=>{
  const geometry=cushionGeometry(backForm),material=new THREE.MeshBasicMaterial(),body=new THREE.Mesh(geometry,material);
  for(const v of [-.75,-.4,0,.35,.75])for(const sign of [-1,1]){
    const x=sign*backSeamX(v),z=v*backForm.length/2;
    const ray=new THREE.Raycaster(new THREE.Vector3(x,.2,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObject(body)[0];assert.ok(hit,'seam must sit on a closed front surface');
    assert.ok(Math.abs(hit.point.y-cushionFront(backForm,x,z))<.001,'seam and mesh must agree');
  }
  geometry.dispose();material.dispose();
});
