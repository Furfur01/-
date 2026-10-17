import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance} from '../game/engine.mjs';
import {createSpatialBattle,addSpatialFleet,advanceSpatialBattle,spatialSnapshot,packedShips,controlBattle,battleMount} from '../game/spatial-battle.mjs';
import {createGalaxyRender} from '../scripts/three-flight/renderer.js';
import {groundBlastPhase,GROUND_BLAST_LIFETIME} from '../game/ground-blast.mjs';
import {planetBattleEnvironment,surfaceHeight,terrainBlocks} from '../game/battle-terrain.mjs';
import {planetIntel} from '../game/planet-intel.mjs';
import {units} from '../game/catalog.mjs';
import {createDefenseModel} from '../scripts/three-flight/defense-models.js';
import {FORTRESS,allocateFortressSlot,fortressSocket,fortressConnections} from '../game/fortress-layout.mjs';
import * as THREE from 'three';
const T=1800000000000;
function battle(){
 const b=createSpatialBattle({id:'planet',attacker:'a',defender:'d',start:T,seed:42,environment:planetBattleEnvironment({})});
 addSpatialFleet(b,{fleet:{Cruiser:4,Battleship:2},side:'attacker',owner:'a'},units);
 addSpatialFleet(b,{fleet:{Rocket_Launcher:4,Light_Laser:2,Small_Shield_Dome:1,Light_Fighter:4},side:'defender',owner:'d'},units);
 return b;
}
test('defense emplacements sit on the surface while defending ships start in low orbit',()=>{
 const b=battle(),ground=b.ships.filter(s=>s.profile.ground),ships=b.ships.filter(s=>s.side==='defender'&&!s.profile.ground);
 assert.equal(ground.length,7);assert.equal(new Set(ground.map(s=>`${s.x}:${s.z}`)).size,7);
 for(const a of ground)for(const c of ground)if(a!==c)assert(Math.hypot(a.x-c.x,a.z-c.z)>a.profile.radius+c.profile.radius);
 for(const s of ground){const slot=s.fortressSlot,m=b.environment.fortress.modules[slot.module],base=fortressSocket(m,slot.socket);assert.equal(s.y,base.y+(slot.kind==='small'?4+(slot.vertex===null?FORTRESS.smallCenterHeight:FORTRESS.smallVertexHeight):0)+s.profile.length*.4);assert.equal(s.profile.speed,0);assert.throws(()=>controlBattle(b,'d',{type:'claim',shipId:s.id}),/只能驾驶/);}
 for(const s of ships){assert(s.x>=650);assert(s.y-surfaceHeight(b.environment,s.x,s.z)>200);}
 assert(b.environment.radius/Math.max(...ships.map(s=>s.profile.length))>500);
 assert.deepEqual(spatialSnapshot(b).environment,b.environment);
});
test('modular fortresses grow with counts, preserve occupied slots, and connect adjacent hexagons',()=>{
 const env=planetBattleEnvironment({}),slots=[];
 for(let i=0;i<601;i++)slots.push(allocateFortressSlot(env,'Rocket_Launcher'));
 assert.equal(env.fortress.modules.length,13);
 const positions=modules=>modules.map(({sockets,...position})=>position),before=positions(env.fortress.modules);
 for(let i=0;i<105;i++)slots.push(allocateFortressSlot(env,'Plasma_Cannon'));
 assert.equal(env.fortress.modules.length,28);
 assert.deepEqual(positions(env.fortress.modules.slice(0,13)),before);
 assert.equal(new Set(slots.map(s=>[s.x,s.y,s.z].join(':'))).size,706);
 assert.equal(new Set(env.fortress.modules.map(m=>`${m.q}:${m.r}`)).size,28);
 for(const s of slots){const m=fortressSocket(env.fortress.modules[s.module],s.socket),distance=Math.hypot(s.x-m.x,s.z-m.z);assert(Math.abs(distance-(s.vertex===null?0:FORTRESS.smallVertexRadius))<1e-8);}
 const links=fortressConnections(env.fortress.modules);assert(links.length>=27);
 for(const [a,b]of links)assert(Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-FORTRESS.spacing*Math.sqrt(3))<1e-8);
 const resumed=structuredClone(env);assert.deepEqual(allocateFortressSlot(env,'Light_Laser'),allocateFortressSlot(resumed,'Light_Laser'));
});
test('ground turret barrels and authoritative muzzles share tracking transforms',()=>{
 const {Renderer,M,shipMatrix}=createGalaxyRender({vertices:[],layouts:[{scale:1}]},{});
 const s={x:200,y:-380,z:123,yaw:-Math.PI/2,pitch:0,profile:{ground:true}};
 for(const yaw of [-2,-.5,1,2.8])for(const pitch of [.1,.5,1.2]){
  s.turretYaw=yaw;s.turretPitch=pitch;
  const matrices={},fake={defenseMeshes:new Map([[0,{base:'base',turret:'turret',barrels:'barrels'}]]),drawMesh:(part,m)=>matrices[part]=m};
  const model=shipMatrix({pos:[s.x,s.y,s.z],yaw:Math.PI-s.yaw,pitch:0,roll:0},0);
  Renderer.prototype.drawDefense.call(fake,0,model,yaw-s.yaw,pitch);
  const tip=[-17,5,0],rendered=M.transform(matrices.barrels,tip),actual=battleMount(s,tip);
  assert(Math.hypot(...rendered.map((v,i)=>v-actual[i]))<1e-8);
  assert.deepEqual([...matrices.base],[...model]);
 }
 const b=battle();advanceSpatialBattle(b,T+30000);
 const g=b.ships.find(s=>s.profile.ground&&s.attack>0),target=b.ships[g.target];
 assert(g.turretPitch>.05);assert(Math.abs(g.turretYaw-Math.atan2(target.x-g.x,target.z-g.z))<.2);
});
test('ground blast grows into a cap and stem then fades completely',()=>{
 assert(groundBlastPhase(.12).flash>.4);
 assert(groundBlastPhase(.12).heat>.9);
 assert(groundBlastPhase(.8).shockRadius>groundBlastPhase(.12).shockRadius*2);
 assert.equal(groundBlastPhase(3.3).shockOpacity,0);
 assert(groundBlastPhase(4).height>groundBlastPhase(.2).height);
 assert(groundBlastPhase(4).height>groundBlastPhase(4).radius*1.5);
 assert(groundBlastPhase(.2).heat>groundBlastPhase(4).heat);
 assert(groundBlastPhase(15).radius>groundBlastPhase(6).radius);
 assert(groundBlastPhase(15).opacity<groundBlastPhase(10).opacity*.2);
 assert.equal(groundBlastPhase(GROUND_BLAST_LIFETIME).opacity,0);
});
test('surface defenses fire, take real damage and stay fixed across deterministic resume',()=>{
 const b=battle(),ground=b.ships.filter(s=>s.profile.ground),positions=ground.map(s=>[s.x,s.y,s.z]);
 advanceSpatialBattle(b,T+40000);const copy=structuredClone(b);
 advanceSpatialBattle(b,T+80000);for(let t=40050;t<=80000;t+=50)advanceSpatialBattle(copy,T+t);
 assert.deepEqual(packedShips(b),packedShips(copy));
 assert(b.events.some(e=>e.type==='fire'&&ground.some(s=>s.id===e.shipId)));
 assert(ground.some(s=>s.hp<s.maxHp||s.shield<s.maxShield));
 assert.deepEqual(ground.map(s=>[s.x,s.y,s.z]),positions);
 for(const s of b.ships.filter(s=>s.hp>0&&!s.profile.ground))assert(s.y>=surfaceHeight(b.environment,s.x,s.z));
});
test('planet occludes weapons through its interior',()=>{
 const env=planetBattleEnvironment({});
 assert(terrainBlocks(env,[700,0,0],[700,-25000,0]));
 assert(!terrainBlocks(env,[-500,0,0],[700,-100,0]));
});
test('defense models have distinct visible structures and correct platform clearance',()=>{
 const signatures=[];
 for(const id of ['Rocket_Launcher','Light_Laser','Heavy_Laser','MK2_Cannon','Plasma_Cannon','Small_Shield_Dome']){
  const model=createDefenseModel(id),box=new THREE.Box3().setFromObject(model);
  assert(box.max.y-box.min.y>15);assert(Math.max(box.max.x-box.min.x,box.max.z-box.min.z)>=31.99);assert(Math.abs(box.min.y+12.8)<.001);
  signatures.push(JSON.stringify(model.children.map(m=>[m.name,m.geometry.type,m.geometry.attributes.position.count])));
  model.traverse(m=>{if(m.isMesh){m.geometry.dispose();m.material.dispose();}});
 }
 assert.equal(new Set(signatures).size,signatures.length);
});
test('empty planet raid returns cargo once; engaged defenses never falsely appear as zero',()=>{
 for(const defense of [{},{Rocket_Launcher:3}]){
  const w=createWorld(T),p=createPlayer(w,'Raider',T),home=w.planets[p.home],target=Object.values(w.planets).find(p=>p.npc);
  home.resources=[1e8,1e8,1e8];home.ships={Large_Cargo_Ship:32};target.ships={};target.defense={...defense};
  p.reports.push({type:'battle',winner:'attacker',position:target.position,at:T-1});
  act(w,p,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{...home.ships}},T);
  const m=w.missions[0];advance(w,m.end);
  assert.equal(planetIntel(w,p,target).defenders,defense.Rocket_Launcher||0);
  if(defense.Rocket_Launcher){const b=w.battles[m.battleId];advance(w,m.start+120000);assert(b.events.some(e=>e.type==='hit'||e.type==='destroy'));continue;}
  advance(w,m.start+50);assert.equal(m.phase,'return');assert(m.cargo.some(n=>n>0));
  const report=p.reports[0],before=[...home.resources];assert.equal(report.winner,'attacker');
  advance(w,m.end);assert.deepEqual(home.resources,before.map((n,i)=>n+report.loot[i]));assert.deepEqual(home.ships,{Large_Cargo_Ship:32});
  const delivered=[...home.resources];advance(w,w.at);assert.deepEqual(home.resources,delivered);
 }
});
