import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {jointTransforms,slewJoint,hullBlocks} from '../game/ship-turrets.mjs';
const dir=new URL('../opendesign/mockups/galactic-command/',import.meta.url);
const renderer=fs.readFileSync(new URL('ship-renderer.js',dir),'utf8'),game=fs.readFileSync(new URL('hangar.js',dir),'utf8');
const fleet=JSON.parse(fs.readFileSync(new URL('flight-fleet.json',dir))),b=fs.readFileSync(new URL('flight-fleet.bin',dir)),vertices=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);
const context=vm.createContext({});vm.runInContext(renderer.slice(renderer.indexOf('  const V ='),renderer.indexOf('  function seeded'))+';globalThis.math={M,V}',context);const {M,V}=context.math;

test('articulated guns keep their base fixed, slew gradually and fire along the pitched barrel',()=>{
  const t=structuredClone(fleet.layouts[1].joints.find(t=>t.role==='main'));Object.assign(t,{yaw:0,pitch:0});
  const before=jointTransforms(M,M.identity(),t),goal=[-100,25,50];
  slewJoint(t,goal,.1);assert.ok(t.yaw>0&&t.yaw<=.080001);assert.equal(t.aligned,false);
  for(let i=0;i<100;i++)slewJoint(t,goal,.05);
  assert.equal(t.aligned,true);const after=jointTransforms(M,M.identity(),t);
  assert.deepEqual([...after.base],[...before.base]);
  assert.ok(V.length(V.sub(M.transform(before.barrels,t.muzzles[0]),M.transform(after.barrels,t.muzzles[0])))>.05);
  const p=M.transform(after.barrels,t.muzzles[0]),q=M.transform(after.barrels,t.muzzles[0].map((v,i)=>v-(i===0?1:0)));
  assert.ok(V.dot(V.norm(V.sub(q,p)),V.norm(goal))>.99999);
  slewJoint(t,[100,0,0],5);assert.equal(t.aligned,false);assert.equal(t.inArc,false);
});

test('eleven loadouts preserve fixed fighter weapons, rotating main guns and self-defense flagship',()=>{
  const count=(id,role)=>fleet.layouts.find(l=>l.id===id).joints.filter(t=>t.role===role).length;
  assert.equal(count('Cruiser','main'),2);assert.equal(count('Battleship','main'),3);
  for(const id of ['Light_Fighter','Heavy_Fighter','Titanenergetic_Frigate'])assert.equal(fleet.layouts.find(l=>l.id===id).joints.length,0);
  for(const id of ['Battleship','Dreadnought','Destroyer','Interceptor','Devourer_Interceptor','Bomber','Iron_Behemoth']){assert.ok(count(id,'secondary')>=2,id);assert.ok(count(id,'pd')>=2,id);}
  for(const id of ['Cruiser','Destroyer','Devourer_Interceptor','Iron_Behemoth']){const l=fleet.layouts.find(l=>l.id===id);assert.ok(l.tubes.length>0);assert.equal(l.tubes.length,l.tubeDirections.length);}
  for(const l of fleet.layouts)for(const t of l.joints){assert.equal(t.parts.length,2);for(const p of t.parts)assert.ok(fleet.parts[p].floatCount>0);}
  assert.equal(fleet.profiles[fleet.ships.findIndex(s=>s.id==='Iron_Behemoth')].defenseOnly,true);assert.equal(fleet.layouts.find(s=>s.id==='Iron_Behemoth').main.length,0);
});

test('rendered hull occludes guns; real cruise and battleship main guns have usable forward arcs',()=>{
  const tri=new Float32Array(39);tri.set([0,-1,-1],0);tri.set([0,1,-1],13);tri.set([0,0,1],26);
  assert.equal(hullBlocks(tri,{offset:0,floatCount:39},[-1,0,0],[1,0,0],3),true);
  assert.equal(hullBlocks(tri,{offset:0,floatCount:39},[-1,0,3],[1,0,0],3),false);
  for(const id of ['Cruiser','Battleship']){
    const index=fleet.ships.findIndex(s=>s.id===id),l=fleet.layouts[index];let clear=0;
    for(const t of l.joints.filter(t=>t.role==='main')){
      const m=jointTransforms(M,M.identity(),{...t,yaw:0,pitch:.12}).barrels,tip=M.transform(m,t.muzzles[0]),d=V.norm(V.sub(M.transform(m,t.muzzles[0].map((v,i)=>v-(i===0?1:0))),tip));
      if(!hullBlocks(vertices,fleet.ships[index],V.sub(tip,V.scale(d,t.scale*.71)),d,l.length*2))clear++;
    }assert.ok(clear>=2,id+' must not be permanently blocked');
  }
});

test('flagship defensive projectiles cannot damage capital targets',()=>{
  const section=(a,b)=>game.slice(game.indexOf(a),game.indexOf(b,game.indexOf(a)));
  let damage=0;const p={pos:[0,0,0],hull:100,profile:{},projectiles:[],targets:[{kind:0,hp:100,pos:[1,0,0]}],salvoQueue:[],beams:[],particles:[]};
  const c=vm.createContext({state:{flight:p,shipIndex:0},V,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),SHIPS:[{id:'Destroyer'},{id:'Light_Fighter'}],burst:()=>{},hitSegment:()=>0,damageTarget:()=>damage++,launchMissile:()=>{}});
  vm.runInContext(section('  const PD_RANGE=','  function defenseTarget(')+section('  function updateProjectiles(','  function updateFlight('),c);
  const projectile=()=>({pos:[0,0,0],velocity:[50,0,0],age:0,life:1,defensive:true,damage:1,kind:'secondary',color:[1,1,1]});
  p.projectiles=[projectile()];vm.runInContext('updateProjectiles(.01)',c);assert.equal(damage,0);
  p.targets[0].kind=1;p.projectiles=[projectile()];vm.runInContext('updateProjectiles(.01)',c);assert.equal(damage,1);
});
