import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMotion,advanceChair,initialConfig,liftStatus} from '../src/model.js';
const run=(s,c,time)=>{for(let i=0;i<time*100;i++)advanceChair(s,c,.01);return s;};
test('closed valve holds height regardless of load',()=>{for(const loaded of [true,false])assert.equal(run(createMotion(),{...initialConfig,loaded},5).height,470);});
test('open lever raises unloaded and lowers loaded, clamped at end stops',()=>{const s=createMotion();run(s,{...initialConfig,lever:true},10);assert.equal(s.height,550);assert.equal(liftStatus(s),'已达最高位置');run(s,{...initialConfig,lever:true,loaded:true},10);assert.equal(s.height,430);assert.equal(liftStatus(s),'已达最低位置');});
test('release freezes the attained intermediate height',()=>{const s=run(createMotion(),{...initialConfig,lever:true},1);const height=s.height;run(s,initialConfig,4);assert.equal(s.height,height);});
test('recline lock preserves the selected lock angle',()=>{const s=createMotion();advanceChair(s,{...initialConfig,recline:22,lockAngle:12},.01);assert.equal(s.recline,12);advanceChair(s,{...initialConfig,recline:22,tiltLocked:false},.01);assert.equal(s.recline,22);});
test('demo completes all four phases and stopping holds height',()=>{const s=createMotion(),seen=new Set();for(let i=0;i<2000;i++){advanceChair(s,{...initialConfig,demo:true},.01);seen.add(s.stage);assert.ok(s.height>=430&&s.height<=550);}assert.deepEqual([...seen].sort(),['lower','raise','recline','swivel']);const h=s.height;advanceChair(s,initialConfig,.1);assert.equal(s.height,h);assert.equal(s.lever,false);});
