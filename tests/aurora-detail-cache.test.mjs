import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../opendesign/mockups/planet-construction-review/aurora-detail-client.js',import.meta.url),'utf8');
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
