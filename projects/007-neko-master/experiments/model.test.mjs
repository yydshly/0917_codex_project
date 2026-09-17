import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, ingest, flush, total, scenarios } from '../web/model.mjs';

test('cumulative 10, 13, 13, 18 contributes 10, 3, 0, 5 with one connection', () => {
  let state = initialState(); const deltas = [];
  for (const value of scenarios.normal.frames) { state = ingest(state, value); deltas.push(state.delta); }
  assert.deepEqual(deltas, [10,3,0,5]); assert.equal(total(state),18); assert.equal(state.connections,1);
});
test('counter reset counts current value and allows another connection count', () => {
  let state = initialState();
  for (const value of scenarios.reset.frames) state = ingest(state,value);
  assert.equal(total(state),17); assert.equal(state.connections,2); assert.equal(state.baseline,4);
});
test('zero traffic is not counted until first positive delta, and idle does not double count', () => {
  let state = ingest(initialState(),0);
  assert.equal(state.connections,0);
  state = ingest(state,0); assert.equal(total(state),0);
  state = ingest(state,3); state = ingest(state,3);
  assert.equal(state.connections,1); assert.equal(total(state),3);
});
test('flushing at every possible cut preserves total and baseline, including repeated flushes', () => {
  for (const scenario of Object.values(scenarios)) {
    for (let cut=0;cut<=scenario.frames.length;cut++) {
      let actual = initialState(), reference = initialState();
      for (let i=0;i<scenario.frames.length;i++) {
        if(i===cut) { const before=total(actual); actual=flush(flush(actual)); assert.equal(total(actual),before); }
        actual=ingest(actual,scenario.frames[i]); reference=ingest(reference,scenario.frames[i]);
      }
      actual=flush(actual);
      assert.equal(total(actual),total(reference)); assert.equal(actual.pending,0);
      assert.equal(actual.connections,reference.connections); assert.equal(actual.baseline,reference.baseline);
    }
  }
});
test('fresh experiment has no retained statistics and rejects invalid cumulative inputs', () => {
  assert.equal(total(initialState()),0); assert.equal(initialState().baseline,null);
  for (const value of [-1,NaN,Infinity]) assert.throws(()=>ingest(initialState(),value),RangeError);
});
