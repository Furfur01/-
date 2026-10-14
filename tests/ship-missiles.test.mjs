import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {missileTargetValid,missileGuidance,segmentEllipsoidHit,orbitDrag} from '../game/ship-missiles.mjs';

const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const V={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),scale:(a,k)=>a.map(v=>v*k),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length:a=>Math.hypot(...a),norm:a=>a.map(v=>v/(Math.hypot(...a)||1))};

test('missiles reject missing, dead, removed and self targets',()=>{
  const t={hp:10},p={hull:100,targets:[t],projectiles:[]};
  assert.equal(missileTargetValid({target:t},p),true);
  for(const target of [null,p,{hp:10}])assert.equal(missileTargetValid({target},p),false);
  t.hp=0;assert.equal(missileTargetValid({target:t},p),false);
  assert.equal(missileTargetValid({target:p,hostile:true},p),true);
  const incoming={missile:true,hostile:true,age:1,life:5};p.projectiles.push(incoming);
  assert.equal(missileTargetValid({target:incoming,defensive:true},p),true);
  incoming.intercepted=true;assert.equal(missileTargetValid({target:incoming,defensive:true},p),false);
});

test('launch requires an acquired lock; queued rounds cancel and refund when lock is lost',()=>{
  const target={hp:100,pos:[100,0,0]},p={pos:[0,0,0],profile:{salvo:2,missileCapacity:8,missileCooldown:3},missileStock:8,missileCooldown:0,missileLock:null,missileLockTime:0,salvoQueue:[],targets:[target],projectiles:[]};
  const c=vm.createContext({state:{flight:p,shipIndex:0},LAYOUTS:[{tubes:[[0,0,0]]}],V,missileTargetValid,canFire:()=>true,notice:()=>{},updateHUD:()=>{},shipMatrix:()=>{},axes:()=>{}});
  vm.runInContext(section('  function updateMissileLock(','  function burst('),c);
  vm.runInContext('fireMissile()',c);assert.equal(p.missileStock,8);
  p.missileLock=target;vm.runInContext('updateMissileLock(.2);fireMissile()',c);assert.equal(p.missileStock,8);
  vm.runInContext('updateMissileLock(.2);fireMissile()',c);assert.equal(p.missileStock,6);assert.equal(p.salvoQueue.length,2);
  target.hp=0;vm.runInContext('updateMissileLock(.01);salvo=state.flight.salvoQueue;salvo.forEach(launchMissile)',c);
  assert.equal(p.missileStock,8);assert.equal(p.projectiles.length,0);assert.equal(p.missileLock,null);
});

test('live update self-destructs targetless missiles and hits the surface of a 200-unit flagship',()=>{
  const p={pos:[0,0,0],hull:100,shield:100,targets:[],projectiles:[],salvoQueue:[],beams:[],particles:[]};let bursts=0;
  const c=vm.createContext({state:{flight:p,shipIndex:0},V,missileTargetValid,missileGuidance,segmentEllipsoidHit,LAYOUTS:[{bounds:{center:[0,0,0],half:[100,15,70]}}],shipMatrix:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],pdMissile:q=>q.hostile&&q.missile,burst:()=>bursts++,launchMissile:()=>{},$:()=>({classList:{add(){},remove(){}}}),clearTimeout:()=>{},setTimeout:()=>0,damageTimer:0});
  vm.runInContext(section('  function updateProjectiles(','  function updateFlight('),c);
  const missile=()=>({pos:[101,0,0],velocity:[-210,0,0],missile:true,hostile:true,age:0,life:10,trail:[],trailClock:0});
  p.projectiles=[missile()];vm.runInContext('updateProjectiles(.02)',c);assert.equal(p.projectiles.length,0);assert.equal(p.shield,100);
  p.projectiles=[{...missile(),target:p}];vm.runInContext('updateProjectiles(.02)',c);assert.equal(p.projectiles.length,0);assert.equal(p.shield,97.5);assert.equal(bursts,2);assert.equal(p.shieldRegenDelay,4);
});

test('guided missiles turn out of vertical tubes and intercept moving targets without orbiting',()=>{
  for(const dt of [1/30,1/60,1/144])for(const hostile of [false,true]){
    const target={pos:[100,0,0],velocity:hostile?[0,0,0]:[-230,0,0]},q={target,pos:[0,0,0],velocity:[0,42,0],age:0,hostile};let hit=false;
    for(let t=0;t<5;t+=dt){
      const previous=[...q.pos],oldTarget=[...target.pos];q.age+=dt;
      if(!missileGuidance(q,dt))break;
      q.pos=V.add(q.pos,V.scale(q.velocity,dt));target.pos=V.add(target.pos,V.scale(target.velocity,dt));
      assert.ok(q.velocity.every(Number.isFinite));
      if(segmentEllipsoidHit(V.sub(previous,oldTarget),V.sub(q.pos,target.pos),[0,0,0],[1.5,1.5,1.5])){hit=true;break;}
    }assert.equal(hit,true,`dt=${dt} hostile=${hostile}`);
  }
  const q={pos:[0,0,0],velocity:[-100,0,0],age:1,target:{pos:[100,0,0]}};
  assert.equal(missileGuidance(q,1/60),true);assert.ok(q.velocity.every(Number.isFinite));
});

test('middle-drag reverses both observer axes and retains pitch limits',()=>{
  assert.deepEqual(orbitDrag(0,0,10,10),{yaw:-.06,pitch:-.04});
  assert.equal(orbitDrag(0,0,0,1000).pitch,-.26);assert.equal(orbitDrag(0,0,0,-1000).pitch,.75);
});
