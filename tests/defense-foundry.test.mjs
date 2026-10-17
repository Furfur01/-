import test from 'node:test';
import assert from 'node:assert/strict';
import {createFoundryModel,defenseIds,foundryMeasurements} from '../scripts/three-flight/foundry-adapter.js';
import {combatProfile} from '../game/spatial-profiles.mjs';
import {units} from '../game/catalog.mjs';
import {battleMount,createSpatialBattle,addSpatialFleet,advanceSpatialBattle,controlBattle} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {createGalaxyRender} from '../scripts/three-flight/renderer.js';

test('all seven foundry turrets retain separate identification and weapon energy materials and aligned muzzles',()=>{
 for(const id of Object.values(defenseIds)){
  const model=createFoundryModel(id),info=foundryMeasurements(id),profile=combatProfile(units[id]||{id,type:'defense'});
  assert(model.children.some(m=>m.material.userData.team));
  assert(model.children.some(m=>!m.material.userData.team&&m.material.userData.emission>0));
  assert.deepEqual(profile.hardpoints.main,info.muzzles);
  const {Renderer,M,shipMatrix}=createGalaxyRender({vertices:[],layouts:[{scale:1}],ships:[{id}]},{ships:[{id,defensePivot:info.pivot}]});
  for(const pitch of [0,.4,.9])for(const yaw of [-2,.7]){
   const poses={},fake={defenseMeshes:new Map([[0,{base:'base',turret:'turret',barrels:'barrels'}]]),drawMesh:(part,m)=>poses[part]=m};
   const ship={x:700,y:-330,z:50,yaw:-Math.PI/2,profile,turretYaw:yaw,turretPitch:pitch};
   Renderer.prototype.drawDefense.call(fake,0,shipMatrix({pos:[ship.x,ship.y,ship.z],yaw:Math.PI-ship.yaw,pitch:0,roll:0},0),yaw-ship.yaw,pitch);
   for(const muzzle of info.muzzles){const visible=M.transform(poses.barrels,muzzle),actual=battleMount(ship,muzzle);assert(Math.hypot(...visible.map((v,i)=>v-actual[i]))<1e-7);}
  }
  model.traverse(m=>{if(m.isMesh){m.geometry.dispose();m.material.dispose();}});
 }
});
test('miniature hex weapons keep visible barrel tips aligned with authoritative firing points',()=>{
 const b=createSpatialBattle({id:'small-hex',start:0,environment:planetBattleEnvironment()});
 addSpatialFleet(b,{fleet:{Rocket_Launcher:1,Light_Laser:1,Heavy_Laser:1,Ion_Cannon:1},side:'defender',owner:'d'},units);
 for(const ship of b.ships){
  const info=foundryMeasurements(ship.type),scale=ship.profile.modelScale;
  const {Renderer,M,shipMatrix}=createGalaxyRender({vertices:[],layouts:[{scale:1}],ships:[{id:ship.type}]},{ships:[{id:ship.type,defensePivot:info.pivot}]});
  for(const yaw of [-2,.7])for(const pitch of [.1,.8]){
   const poses={},fake={defenseMeshes:new Map([[0,{base:'base',turret:'turret',barrels:'barrels'}]]),drawMesh:(part,m)=>poses[part]=m};
   ship.turretYaw=yaw;ship.turretPitch=pitch;
   const matrix=shipMatrix({pos:[ship.x,ship.y,ship.z],yaw:Math.PI-ship.yaw,pitch:0,roll:0},0);
   for(let i=0;i<12;i++)matrix[i]*=scale;
   Renderer.prototype.drawDefense.call(fake,0,matrix,yaw-ship.yaw,pitch);
   info.muzzles.forEach((muzzle,i)=>{const visible=M.transform(poses.barrels,muzzle),actual=battleMount(ship,ship.profile.hardpoints.main[i]);assert(Math.hypot(...visible.map((v,j)=>v-actual[j]))<1e-7);});
  }
 }
});

test('bombers approach and cross a ground fortress instead of parking at the artillery front',()=>{
 const b=createSpatialBattle({id:'run',attacker:'a',defender:'d',start:0,environment:planetBattleEnvironment({})});
 addSpatialFleet(b,{fleet:{Bomber:2},side:'attacker',owner:'a'},units);addSpatialFleet(b,{fleet:{MK2_Cannon:1},side:'defender',owner:'d'},units);
 for(const s of b.ships){s.hp=s.maxHp=1e9;s.attack=1;}
 const turret=b.ships.find(s=>s.profile.ground),xs=[];
 for(let t=1000;t<=240000;t+=1000){advanceSpatialBattle(b,t);xs.push(b.ships[0].x);}
 assert(Math.max(...xs)>turret.x+150);assert(xs.some((x,i)=>i>140&&x<xs[i-1]-5));
 assert(b.events.some(e=>e.type==='fire'&&e.shipId===0));
 const copy=structuredClone(b);advanceSpatialBattle(b,260000);advanceSpatialBattle(copy,260000);assert.deepEqual(b.ships,copy.ships);
});
test('separate browser control sessions cannot fight over input sequences or release the new pilot',()=>{
 const b=createSpatialBattle({id:'sessions',attacker:'a',defender:'d',start:0});
 addSpatialFleet(b,{fleet:{Light_Fighter:1},side:'attacker',owner:'a'},units);
 const input={throttle:1,yaw:0,pitch:0};
 controlBattle(b,'a',{type:'claim',shipId:0,clientId:'map'});
 controlBattle(b,'a',{type:'input',shipId:0,clientId:'map',seq:4,input});
 controlBattle(b,'a',{type:'claim',shipId:0,clientId:'battlefield'});
 assert.throws(()=>controlBattle(b,'a',{type:'input',shipId:0,clientId:'map',seq:5,input}),/其他页面/);
 controlBattle(b,'a',{type:'release',clientId:'map'});assert.equal(b.controls.a.clientId,'battlefield');
 controlBattle(b,'a',{type:'input',shipId:0,clientId:'battlefield',seq:1,input});
 controlBattle(b,'a',{type:'claim',shipId:0,clientId:'battlefield'});assert.equal(b.controls.a.seq,1);
});
