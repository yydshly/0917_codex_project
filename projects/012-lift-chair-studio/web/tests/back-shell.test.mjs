import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {backShellGeometry,backSpineGeometry} from '../src/back-shell.js';

test('back shell openings pass through the geometry while its central web remains solid',()=>{
  const g=backShellGeometry(),m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),shell=new THREE.Mesh(g,m);
  const hits=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,-.3),new THREE.Vector3(0,0,1)).intersectObject(shell);
  for(const side of [-1,1])for(let row=0;row<5;row++)assert.equal(hits(side*.103,.395+row*.026).length,0);
  for(const y of [.2,.4,.5,.6])assert.ok(hits(0,y).length>=2,'central shell must retain front and back faces');
  for(const geometry of [g,backSpineGeometry()]){
    for(const attr of ['position','normal'])assert.ok([...geometry.attributes[attr].array].every(Number.isFinite));
    geometry.computeBoundingBox();assert.ok(geometry.boundingBox.max.x<.23);assert.ok(geometry.boundingBox.min.y>.06);assert.ok(geometry.boundingBox.max.y<.65);geometry.dispose();
  }
  m.dispose();
});
