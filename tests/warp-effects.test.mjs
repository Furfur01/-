import test from 'node:test';
import assert from 'node:assert/strict';
import {appendWarpEffect,stretchAlongHeading,warpEnvelope,WarpRibbonBuffer} from '../scripts/three-flight/warp-effects.js';
import {missionVisual} from '../game/mission-visual.mjs';

test('warp light fades at the cruise boundaries and ends cleanly on arrival',()=>{
  const m={phase:'outbound',start:0,end:20000};
  for(const t of [0,3900,6000,10000,14000,20000])assert.equal(warpEnvelope(missionVisual(m,t)),0);
  assert(warpEnvelope(missionVisual(m,5000))>.9);
  assert(warpEnvelope(missionVisual(m,15000))>.9);
  assert(warpEnvelope(missionVisual(m,5999))<.001);
});

test('warp ribbons follow translated ships and remain finite for vertical and head-on views',()=>{
  for(const heading of [[0,1,0],[0,-1,0],[0,0,-1],[1,0,0]]) {
    const options={position:[20,30,40],heading,eye:[20,100,40],length:24,pose:{stage:'warp-in',warp:.7},slot:2};
    const a=[],b=[];appendWarpEffect(a,options);
    const offset=[1000,-2000,3000];
    appendWarpEffect(b,{...options,position:options.position.map((v,i)=>v+offset[i]),eye:options.eye.map((v,i)=>v+offset[i])});
    assert(a.length>1000);assert.equal(a.length,b.length);
    a.forEach((v,i)=>{assert(Number.isFinite(v));assert(Math.abs(v-b[i])<1e-9);});
  }
});

test('longitudinal stretch preserves world position and transverse distances',()=>{
  const m=new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,31,47,59,1]);
  const h=[Math.SQRT1_2,0,Math.SQRT1_2];stretchAlongHeading(m,h,4);
  assert.deepEqual(Array.from(m.slice(12)),[31,47,59,1]);
  const transform=v=>[0,1,2].map(i=>m[i]*v[0]+m[4+i]*v[1]+m[8+i]*v[2]);
  assert(Math.abs(Math.hypot(...transform(h))-4)<1e-10);
  assert(Math.abs(Math.hypot(...transform([h[0],0,-h[2]]))-1)<1e-10);
});

test('observer cruise keeps moving light beside visible hulls without changing the map pose',()=>{
  const pose=missionVisual({phase:'outbound',start:0,end:600000},300000);
  assert.equal(warpEnvelope(pose),0);
  const data=time=>{const vertices=[];appendWarpEffect(vertices,{position:[0,0,0],heading:[0,0,-1],eye:[20,40,100],length:24,pose:{...pose,observer:true,time},slot:0});return vertices;};
  const a=data(0),b=data(.5);assert(a.length>0);assert.equal(a.length,b.length);assert(a.every(Number.isFinite));assert.notDeepEqual(a,b);
  assert.equal(pose.model,0,'The external map still uses its route icon');
});

test('reused warp storage retains full geometry and never leaks vertices between phases',()=>{
 const buffer=new WarpRibbonBuffer(16);
 for(const stage of ['warp-in','cruise','warp-out','departing']){
  const options={position:[20,30,40],heading:[.4,.5,.3],eye:[50,80,100],length:24,pose:{stage,warp:.6,local:.4,observer:true,time:1},slot:0};
  const expected=[];appendWarpEffect(expected,options);buffer.reset();appendWarpEffect(buffer,options);
  assert.deepEqual(Array.from(buffer.view()),expected.map(Math.fround));
  if(stage==='warp-in')assert.equal(buffer.length,213*54,'all three 64-segment rings, trails, sparks and flare are retained');
 }
 const allocation=buffer.array;for(let i=0;i<120;i++){buffer.reset();appendWarpEffect(buffer,{position:[0,0,0],heading:[0,0,-1],eye:[0,40,100],length:24,pose:{stage:'warp-in',warp:.5},slot:0});assert.equal(buffer.array,allocation);}
 buffer.reset();assert.equal(buffer.view().length,0);
});
