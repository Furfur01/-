import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../opendesign/mockups/planet-construction-review/aurora-detail-client.js',import.meta.url),'utf8');

test('yielded uploads never overwrite another body or its proxy buffer',()=>{
 let worker,clock=0,serial=0,bound=null;
 const contents=new Map();
 class Worker{constructor(){worker=this;}postMessage(){}terminate(){}}
 const gl={FRAMEBUFFER:1,ARRAY_BUFFER:2,STATIC_DRAW:3,TRIANGLES:4,TEXTURE0:5,
  createBuffer:()=>++serial,bindBuffer:(_,b)=>{bound=b;},
  bufferData:(_,data)=>contents.set(bound,Array.from(data)),bindFramebuffer(){},activeTexture(){}};
 const runtime=vm.runInNewContext(`${source};createWorldDetail('terrestrial',()=>{},e=>{throw e})`,{Worker,performance:{now:()=>clock++},gameBuildingIds:{},gl,canvas:{width:800,height:600},STRIDE:11});
 worker.onmessage({data:{type:'ready',commands:[['createBuffer',[],10],['bindBuffer',[2,{__gl:10}]],['bufferData',[2,[7,8,9],3]]],targets:{},buffers:1,ms:1}});
 runtime.prepare(); // The 3 ms budget ends after bindBuffer, before bufferData.
 const workerBuffer=bound;
 const foreign=gl.createBuffer();gl.bindBuffer(2,foreign);gl.bufferData(2,[42],3);
 worker.onmessage({data:{type:'proxy',geometry:new Float32Array(33).fill(.5)}});
 runtime.prepare();
 assert.deepEqual(contents.get(workerBuffer),[7,8,9]);
 assert.deepEqual(contents.get(foreign),[42]);
 assert.deepEqual(contents.get(runtime.proxy.b),Array(33).fill(.5));
 assert.equal(runtime.ready,true);
});
test('same-biome bodies receive fair worker service and retain more than four detail frames',()=>{
 const sent=[];let worker;
 class Worker{constructor(){worker=this;}postMessage(m){sent.push(m);}terminate(){}}
 const context={Worker,performance,gameBuildingIds:{},gl:{FRAMEBUFFER:1,bindFramebuffer(){}},canvas:{width:800,height:600},W:800,H:600};
 const runtime=vm.runInNewContext(`${source};createWorldDetail('terrestrial',()=>{},e=>{throw e})`,context);
 worker.onmessage({data:{type:'ready',commands:[],targets:{},buffers:0,ms:1}});runtime.prepare();
 const service=new Set();
 for(let tick=0;tick<18;tick++){
  for(let i=0;i<6;i++)runtime.drawWorld({bodyKey:'planet-'+i,buildings:false,time:tick},null,null);
  runtime.prepare();const message=sent.at(-1);assert.equal(message.type,'draw');service.add(message.key);
  worker.onmessage({data:{type:'draw',key:message.key,commands:[],buildings:[]}});
 }
 assert.equal(service.size,6);for(let i=0;i<6;i++)assert(runtime.hasFrame('planet-'+i,false));
});
