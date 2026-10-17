import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {units} from '../game/catalog.mjs';
import {presentPilot} from '../game/pilot-presentation.mjs';
import {pilotWeaponStatus} from '../game/weapon-solution.mjs';
import {MapCombat} from '../opendesign/mockups/galactic-command/map-combat.js';

function battle(fleet={Battleship:4,Heavy_Fighter:12}){
 const b=createSpatialBattle({id:'pilot-test',target:'test',attacker:'a',defender:'d',start:0,environment:planetBattleEnvironment()});
 for(const [owner,side]of [['a','attacker'],['d','defender']])addSpatialFleet(b,{fleet,owner,side},units);
 return b;
}
test('empty or still-loading combat state has no vessel and no pilot HUD',()=>{
 const c=Object.assign(Object.create(MapCombat.prototype),{scene:{},live:new Map(),active:null});
 assert.equal(c.vessel,undefined);assert.equal(c.status,null);assert.deepEqual(c.navigation,{});
});
test('capital autopilots settle into range without mutual altitude escalation or spinning hulls',()=>{
 const b=battle();for(const s of b.ships)s.attack=0;
 for(let i=0;i<4000;i++)stepSpatialBattle(b);
 const capitals=b.ships.filter(s=>s.type==='Battleship'),poses=capitals.map(s=>[s.x,s.y,s.z,s.yaw,s.pitch]);
 assert(capitals.every(s=>Math.abs(s.y)<300&&Math.abs(s.pitch)<.1),'capital hulls hold a level firing line');
 for(let i=0;i<200;i++)stepSpatialBattle(b);
 capitals.forEach((s,i)=>{assert(Math.abs(s.yaw-poses[i][3])<.05,'turrets track without rotating the hull');assert(Math.hypot(s.x-poses[i][0],s.y-poses[i][1],s.z-poses[i][2])<2);});
});
test('a distant remaining enemy does not strand a capital at an unreachable station',()=>{
 const b=battle({Battleship:1}),s=b.ships[0],t=b.ships[1];
 s.z=s.station.z=-1500;t.z=t.station.z=1500;t.profile.speed=0;t.attack=0;s.attack=0;
 for(let i=0;i<4400;i++)stepSpatialBattle(b);
 assert(Math.hypot(s.x-t.x,s.y-t.y,s.z-t.z)<s.profile.range,'AI must close lateral distance into weapon range');
});
test('HUD explains range, alignment, cooldown, terrain and missing weapons using firing rules',()=>{
 const b=battle({Heavy_Fighter:1}),m=b.ships[0],r=[0,0,0,0,Math.PI/2,0,100,100,1,0,0,0],t=[1,1000,0,0,0,0,100];
 assert.equal(pilotWeaponStatus(null,m,r,t).reason,'range');t[1]=100;r[4]=0;
 assert.equal(pilotWeaponStatus(null,m,r,t).reason,'aim');r[4]=Math.PI/2;r[10]=.4;
 assert.equal(pilotWeaponStatus(null,m,r,t).reason,'cooldown');r[10]=0;
 assert.equal(pilotWeaponStatus(null,m,r,t).reason,'ready');
 assert.equal(pilotWeaponStatus(null,{profile:{...m.profile,missile:false,secondaryMissile:false}},r,t,true).reason,'unavailable');
 assert.equal(pilotWeaponStatus({center:[50,0,0],radius:25},m,r,t).reason,'terrain');
 t[6]=0;assert.equal(pilotWeaponStatus(null,m,r,t).reason,'target');
});
test('local steering responds on the next frame without waiting for a 200 ms snapshot',()=>{
 const profile={role:'fighter',speed:110,turn:2.2},row=[0,0,0,0,0,0,100,100,-1,0,0,0,0];
 const input={throttle:1,heading:1,elevation:.5,yaw:0,pitch:0,roll:1};
 let old=presentPilot(null,row,profile,{...input,heading:0,elevation:0,roll:0},0,0);
 for(const fps of [30,60,120]){const next=presentPilot(old,row,profile,input,1000/fps,0);assert(next.row[4]>0&&next.row[5]>0&&next.row[12]>0);assert(next.row[4]<.15,'turn rate is bounded');}
 const stale=presentPilot(old,row,profile,input,3000,0);assert(stale.row[4]<=profile.turn*.4+1e-9,'network loss cannot extrapolate indefinitely');
});
test('latest ship selection wins overlapping claims; changing camera preserves control',async()=>{
 const b=battle({Heavy_Fighter:2});const ships=b.ships.map(s=>[s.id,s.x,s.y,s.z,s.yaw,s.pitch,s.hp,s.shield,s.target,s.speed]);
 const renderer={navigationState:{combatCamera:null},setMapVessel(id,shipId,mode){this.navigationState.combatCamera={id,shipId,mode};},setMapPilot(){},setMapCabin(){},setMapTarget(){}};
 const c=Object.assign(Object.create(MapCombat.prototype),{scene:{active:true,renderer,universe:{player:{id:'a'}}},active:b.id,live:new Map([[b.id,{id:b.id,data:{ships,metadata:b.ships,status:'active'}}]]),keys:new Set(),clientId:'test',notify(){},sendInput(){},request:async(url,body)=>{await new Promise(r=>setTimeout(r,5));return {control:{seq:0}};}});
 await Promise.all([c.selectVessel(0),c.selectVessel(1)]);assert.equal(c.controlled,1);assert.equal(c.selected,1);
 await Promise.all([c.selectVessel(0),c.selectVessel(1)]);assert.equal(c.controlled,1,'reselecting the currently controlled ship cancels an earlier pending switch');
 c.view('follow');assert.equal(c.controlled,1);assert.equal(renderer.navigationState.combatCamera.mode,'follow');
 let serverControl=1;
 c.request=async(url,body)=>{if(body.type==='release'){await new Promise(r=>setTimeout(r,20));serverControl=null;}else if(body.type==='claim')serverControl=body.shipId;return {control:{seq:0}};};
 await Promise.all([c.release(),c.selectVessel(0)]);assert.equal(serverControl,0,'a delayed old release must finish before a new claim');assert.equal(c.controlled,0);
 await c.release();assert.equal(c.controlled,null);
});
test('a clicked shot survives an in-flight input request longer than the old 250 ms pulse',async()=>{
 const prior=globalThis.document;globalThis.document={hidden:false};
 try{let resolve;const sent=[];
 const c=Object.assign(Object.create(MapCombat.prototype),{controlled:0,controlBattle:'test',controlGeneration:1,seq:0,clientId:'test',keys:new Set(),notify(){},weaponStatus:()=>({ready:true}),pilotIntent(){return {fire:!!this.fireQueued,missile:!!this.missileQueued};},request:async(u,body)=>{sent.push(body);if(sent.length===1)await new Promise(r=>resolve=r);}});
 const pending=c.sendInput();c.fire();await new Promise(r=>setTimeout(r,280));assert(c.fireQueued);resolve();await pending;await new Promise(r=>setTimeout(r,1));assert.equal(sent.length,2);assert.equal(sent[1].input.fire,true);
 }finally{globalThis.document=prior;}
});
