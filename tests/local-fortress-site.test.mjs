import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {allocateFortressSlot,fortressModule,FORTRESS,LEGACY_FORTRESS} from '../game/fortress-layout.mjs';

test('large hex centers and all six vertices accept either a heavy turret or a small hex',()=>{
 const env=planetBattleEnvironment(),types=['Rocket_Launcher','Light_Laser','Heavy_Laser','Ion_Cannon'];
 const slots=Array.from({length:7},(_,i)=>allocateFortressSlot(env,types[i%4]));
 assert(slots.every(s=>s.socket===0&&s.kind==='small'));assert.equal(new Set(slots.map(s=>s.vertex)).size,7);
 assert.equal(allocateFortressSlot(env,'Plasma_Cannon').socket,1);
 assert.equal(allocateFortressSlot(env,'Rocket_Launcher').socket,2);
 for(let i=3;i<7;i++)assert.equal(allocateFortressSlot(env,'MK2_Cannon').socket,i);
 assert.equal(env.fortress.modules.length,1);assert.equal(allocateFortressSlot(env,'Plasma_Cannon').module,1);
 const other=planetBattleEnvironment();assert.equal(allocateFortressSlot(other,'Plasma_Cannon').socket,0);assert.equal(allocateFortressSlot(other,'Ion_Cannon').socket,1);
 assert(FORTRESS.radius<LEGACY_FORTRESS.radius*.8);
 const copy=structuredClone(env);assert.deepEqual(allocateFortressSlot(env,'Light_Laser'),allocateFortressSlot(copy,'Light_Laser'));
});
test('legacy recorded layouts keep their original size and slots',()=>{
 const env=planetBattleEnvironment();env.fortress={version:1,small:0,large:0,modules:[]};
 const center=allocateFortressSlot(env,'Heavy_Laser'),corner=allocateFortressSlot(env,'Rocket_Launcher');
 assert.equal(center.module,0);assert.equal(corner.module,0);assert.equal(corner.x-center.x,82);assert.equal(center.y-corner.y,14);
});
test('floating hexes follow a concentric sphere outside untouched NPC terrain',()=>{
 const env=planetBattleEnvironment();
 for(let i=0;i<105;i++){const m=fortressModule(i,env);assert(Math.abs(Math.hypot(m.x-env.center[0],m.y-env.center[1],m.z-env.center[2])*FORTRESS.orbitScale/env.radius-1.3)<1e-9);}
 for(const id of ['outpost','garrison','charon','cargo','fracture']){
  const b=fs.readFileSync(new URL(`../opendesign/mockups/galactic-command/assets/npc-planets/${id}.bin`,import.meta.url)),a=new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));let checked=0;
  for(let i=0;i<a.length;i+=12)if(a[i+1]>0&&Math.hypot(a[i],a[i+2])<.25){assert(Math.hypot(a[i],a[i+1],a[i+2])<FORTRESS.orbitScale-.06,id);checked++;}
  assert(checked>0);
 }
});
test('all native biomes leave clearance below the orbital shell without flattening',()=>{
 const root=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url),runtime=fs.readFileSync(new URL('aurora-runtime.js',root),'utf8');
 let body=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('const canvas='));
 for(const part of ['moon','biomes','volcanoes','bridges','terrain'])body=body.replace('/*__AURORA_'+part.toUpperCase()+'__*/',()=>fs.readFileSync(new URL('aurora-'+part+'.js',root),'utf8'));
 const routes=runtime.slice(runtime.indexOf('function samplePath('),runtime.indexOf('// District scenery'));
 for(const biome of ['terrestrial','mercury','mars','gas','moon']){
  const s=vm.runInNewContext(`(()=>{const options={biome:'${biome}'},window={__AURORA_CONFIG:options};${body}\n${routes}\nreturn {terrain,R};})()`);
  for(let r=0;r<=.25;r+=.01)for(let a=0;a<Math.PI*2;a+=.05)assert(1+s.terrain([r*Math.cos(a),Math.sqrt(1-r*r),r*Math.sin(a)])/s.R<FORTRESS.orbitScale-.02,biome);
 }
});
