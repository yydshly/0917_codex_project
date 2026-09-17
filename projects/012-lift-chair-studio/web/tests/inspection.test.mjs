import {test} from 'node:test';
import assert from 'node:assert/strict';
import {viewSelection,explosionOffsets} from '../src/inspection.js';
import {initialConfig,createMotion,advanceChair} from '../src/model.js';
test('view changes unify selection; reselecting the same view requests a fresh camera focus',()=>{
  const back=viewSelection(initialConfig,'back');assert.equal(back.selectedPart,'back');
  const repeat=viewSelection(back,'back');assert.equal(repeat.focusRevision,back.focusRevision+1);
  assert.equal(viewSelection(repeat,'full').selectedPart,null);
  assert.equal(viewSelection(repeat,'fabric').selectedPart,'seat');
});
test('explosion stages detach upper assembly, then back and arms, then headrest',()=>{
  assert.deepEqual(explosionOffsets(0),{seat:0,column:0,back:0,arms:0,head:0});
  assert.equal(explosionOffsets(35).seat,.26);assert.equal(explosionOffsets(35).back,0);
  assert.equal(explosionOffsets(70).back,.22);assert.equal(explosionOffsets(70).head,0);
  assert.equal(explosionOffsets(100).head,.13);
  assert.deepEqual(explosionOffsets(500),explosionOffsets(100));
});
test('exploded assemblies cannot raise even with a stale open-lever configuration',()=>{
  const state=createMotion();advanceChair(state,{...initialConfig,explode:50,lever:true},.1);
  assert.equal(state.height,470);assert.equal(state.lever,false);
});
