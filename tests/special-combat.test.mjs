import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {antimatterDamage,specialBlastPhase,specialRingData} from '../game/special-combat.mjs';
const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8');
const runtime=source.slice(source.indexOf('function antimatterDamage('),source.indexOf('  function updateFlight('));
const V={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),scale:(a,k)=>a.map(v=>v*k),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length:a=>Math.hypot(...a),norm:a=>a.map(v=>v/(Math.hypot(...a)||1))};
function harness(){
  const p={profile:{special:'antimatter',mainCooldown:9},pos:[0,0,0],targets:[],particles:[],beams:[],mainShots:0,gunCooldown:0,missileLockTime:0,specialBlasts:[],kills:0,shield:0};let resets=0;
  const c=vm.createContext({state:{flight:p,shipIndex:0},V,SHIPS:[{id:'Cruiser'},{id:'Reaper'}],LAYOUTS:[{main:[]}],canFire:()=>true,notice:()=>{},tone:()=>{},selectedTarget:()=>p.targets[0],configureFlight:()=>resets++,forward:()=>[0,0,-1],shipMatrix:()=>[],M:{transform:()=>[0,0,0]},burst:()=>{},hitSegment:()=>null,damageTarget:(t,n)=>{t.shield=Math.max(0,t.shield-n);t.hp=Math.max(0,t.hp-n);if(!t.hp)p.kills++;}});
  vm.runInContext(runtime,c);return {p,c,run:s=>vm.runInContext(s,c),resets:()=>resets};
}
test('antimatter falls off, respects radius and preserves Reaper immunity',()=>{
  assert.equal(antimatterDamage(0),180);assert.ok(antimatterDamage(50)>antimatterDamage(500));
  for(const d of[680,1000,NaN,-1])assert.equal(antimatterDamage(d),0);
  assert.equal(antimatterDamage(0,680,'Reaper'),0);
  const geometry=specialRingData();assert.equal(geometry.length%39,0);assert.ok(geometry.every(Number.isFinite));
  assert.equal(specialBlastPhase(0).wave,0);assert.equal(specialBlastPhase(6).fade,0);
});
test('self-propelled warhead requires live acquired lock, then moves its own hull and safely self-destructs on target loss',()=>{
  const h=harness(),t={pos:[0,0,-100],hp:100};h.p.targets=[t];
  assert.equal(h.run('fireSpecial()'),false);h.p.missileLock=t;
  assert.equal(h.run('fireSpecial()'),false);h.p.missileLockTime=.4;
  assert.equal(h.run('fireSpecial()'),true);h.run('dischargeSpecial();guideSpecial(.1)');
  assert.ok(h.p.pos[2]<0);assert.equal(h.p.assault.target,t);
  t.hp=0;h.run('guideSpecial(.1)');assert.equal(h.p.detonated.harmless,true);assert.equal(h.p.hull,0);
  h.run('updateSpecial(1)');assert.equal(h.p.blastHits,0);
});
test('expanding blast hits several ships once, bypasses shield and never damages out-of-range or immune ships',()=>{
  const h=harness();h.p.targets=[0,200,500,900].map(d=>({pos:[d,0,0],hp:100,shield:77,kind:0}));
  const immune={pos:[0,0,0],hp:100,shield:88,kind:1};h.p.targets.push(immune);
  h.run('detonateSpecial();updateSpecial(.1)');assert.equal(h.p.blastHits,0);
  h.run('updateSpecial(1.4)');assert.equal(h.p.blastHits,3);assert.ok(h.p.targets[2].hp<100);
  assert.equal(h.p.targets[3].hp,100);assert.equal(immune.hp,100);
  for(const t of h.p.targets.slice(0,4))assert.equal(t.shield,77);
  const values=h.p.targets.map(t=>t.hp);h.run('updateSpecial(1)');assert.deepEqual(h.p.targets.map(t=>t.hp),values);
  h.run('updateSpecial(3)');assert.equal(h.resets(),1);
});
test('Reaper cut has a forward arc, finite duration and capped shield recovery',()=>{
  const h=harness(),t={pos:[0,0,-400],hp:500,shield:100,kind:0};
  Object.assign(h.p,{profile:{special:'reaper',mainCooldown:5.5,mainDamage:115,visual:{radius:2}},targets:[t],shield:99});
  h.run('fireSpecial();dischargeSpecial();updateSpecial(.25)');assert.ok(t.hp<500);assert.equal(h.p.shield,100);
  t.pos=[0,0,400];h.run('updateSpecial(.1)');assert.equal(h.p.reaperCut,null);
});
