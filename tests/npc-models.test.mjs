import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {npcTypes} from '../game/npc-types.mjs';
const source=fs.readFileSync(new URL('../opendesign/mockups/planet-construction-review/aurora-npcs.js',import.meta.url),'utf8');
const api=vm.runInNewContext(`(()=>{const TAU=Math.PI*2,add=(a,b)=>a.map((n,i)=>n+b[i]);${source}return {identity:auroraNpcIdentity,pose:auroraNpcPatrolPose};})()`);
test('decorative patrols stay outside every approved silhouette and move continuously',()=>{
 for(const t of npcTypes){const p={npc:true,npcType:t.id,radius:.65,position:[-6750,40,9260],coordinates:[1,16,4]},before=JSON.stringify(p);
  for(let i=0;i<t.patrols;i++){const a=api.pose(p,4,i),b=api.pose(p,4.01,i),distance=Math.hypot(...a.position.map((x,k)=>x-p.position[k]));assert(distance>.65*1.8);assert(distance<.65*2.4);assert(Math.hypot(...a.position.map((x,k)=>x-b.position[k]))>0);assert(Number.isFinite(a.yaw)&&Number.isFinite(a.pitch));assert.equal(a.count,t.patrols);}
  assert.equal(JSON.stringify(p),before);
 }assert.equal(api.identity({npc:false,npcType:'fracture'}),null);assert.equal(api.identity({npc:true,moon:true,npcType:'fracture'}),null);
});
test('production buffers preserve approved triangle counts and contain valid render attributes',()=>{
 const dir=new URL('../opendesign/mockups/galactic-command/assets/npc-planets/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',dir))),approved=JSON.parse(fs.readFileSync(new URL('../models/generated/npc-planets-apk-v1/manifest.json',import.meta.url)));
 for(const type of npcTypes){const m=manifest.models[type.id],binary=fs.readFileSync(new URL(m.file,dir)),data=new Float32Array(binary.buffer,binary.byteOffset,binary.byteLength/4);assert.equal(m.triangles,approved.models.find(m=>m.id===type.id).triangles);assert.equal(data.length,m.vertices*12);assert(data.every(Number.isFinite));assert.equal(m.level,type.level);assert.equal(m.name,type.name);}
});
