import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialConfig,telemetry,wheels,accessories} from '../src/config.js';

test('wheel changes adjust total mass by the actual wheel mass difference',()=>{
  const base=telemetry(initialConfig);
  assert.equal(base.mass.toFixed(2),'7.84');
  wheels.forEach((wheel,i)=>{
    const result=telemetry({...initialConfig,wheel:i});
    assert.ok(Math.abs((result.mass-base.mass)*1000-(wheel.mass-wheels[0].mass))<1e-9);
    assert.equal(result.saving,wheel.saving);
  });
});
test('installed accessories contribute their mass; inspection extraction does not remove carried water',()=>{
  const total=telemetry(initialConfig).mass;
  for(const accessory of accessories){assert.ok(Math.abs(total-telemetry({...initialConfig,[accessory.id]:false}).mass-accessory.mass)<1e-9);}
  assert.equal(telemetry({...initialConfig,bottleOut:true}).mass,total);
  assert.equal(telemetry({...initialConfig,phone:false,bell:false,bottle:false,frontLight:false,rearLight:false}).mass.toFixed(2),'6.68');
});
