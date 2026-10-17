import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs,act,advance} from '../game/engine.mjs';
import {createSpatialBattle,addSpatialFleet} from '../game/spatial-battle.mjs';
import {units} from '../game/catalog.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';
const out=path.resolve('output/playwright/map-combat');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'map-combat-')),now=Date.now(),start=now-700000,w=createWorld(start),p=createPlayer(w,'星图现场验收',start,()=>.5),home=w.planets[p.home];ensureSystemNpcs(w,...home.position.slice(0,2));
const target=Object.values(w.planets).find(t=>t.npcType==='cargo'&&t.position[1]===home.position[1]);home.ships={Dreadnought:100,Large_Cargo_Ship:20};home.resources=[1e8,1e8,1e8];
act(w,p,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{...home.ships}},start);w.missions[0].end=start;advance(w,now);const report=p.reports.find(r=>r.type==='battle');assert(report);home.ships.Death_Star=2;home.ships.Guardian=1;home.ships.Cruiser=4;
const battle=createSpatialBattle({id:'00000000-0000-4000-8000-000000000023',target:target.id,name:target.name,attacker:p.id,defender:null,start:now});
for(const side of ['attacker','defender'])addSpatialFleet(battle,{fleet:side==='attacker'?{Cruiser:3,Light_Fighter:8,Large_Cargo_Ship:2}:{Light_Fighter:4,Cargo_Ship:5},owner:side==='attacker'?p.id:null,side},units);
for(const ship of battle.ships){ship.x=(ship.id%5-2)*60;ship.z=ship.side==='attacker'?230:-230;ship.y=(ship.id%3-1)*45;ship.hp=ship.maxHp=1e8;ship.shield=ship.maxShield=1e8;}w.battles[battle.id]=battle;
const file=path.join(temp,'universe.json'),session=path.join(temp,'session.json');fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));const port=await freePort(),server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});let browser;const errors=[];server.stderr.on('data',d=>errors.push(String(d)));
try{
 await once(server.stdout,'data');browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/api/**',route=>{const headers={...route.request().headers()};delete headers.cookie;return route.continue({headers});});
 await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>CommandApp.scene?.renderer?.ready&&CommandApp.scene.map);
 const key=target.position.join(':'),sceneId=await page.evaluate(()=>{const f=document.querySelector('.aurora-game-frame');f.dataset.identity='persistent-map';return EmpireAPI.planet.id;});
 await page.evaluate(key=>{CommandApp.go('system',{keepCamera:true});CommandApp.scene.enterPlanet(key);CommandApp.scene.renderer._advance(3);},key);
 await page.locator('[data-map-battle]').click();await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.battles.visible.some(b=>b.ships.length&&b.ships.every(s=>s.loaded)));
 await page.evaluate(()=>CommandApp.scene.renderer._advance(3));await page.waitForTimeout(500);
 assert.equal(await page.locator('.battle-frame:visible').count(),0);assert.equal(await page.locator('.aurora-game-frame').getAttribute('data-identity'),'persistent-map');assert.equal(await page.evaluate(()=>EmpireAPI.planet.id),sceneId);
 const first=await page.evaluate(()=>CommandApp.scene.snapshot.navigation.battles.visible[0]);await page.waitForFunction(tick=>CommandApp.scene.snapshot.navigation.battles.visible.some(b=>b.tick>tick),first.tick);
 assert((await page.evaluate(()=>CommandApp.scene.snapshot.navigation.npcs.visible)).some(p=>p.key===key&&p.loaded),'Combat retains the actual local NPC body');assert.equal(first.renderer,'shared-battlefield');assert.equal(first.ships.length,22);
 const raster=await page.evaluate(()=>{const s=CommandApp.scene;s.renderer._advance(.01);const c=s.frame.contentDocument.querySelector('.map-fleet-renderer'),g=c.getContext('webgl2'),pixels=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,pixels);let lit=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)lit++;return {lit,display:s.frame.contentWindow.getComputedStyle(c).display};});assert.notEqual(raster.display,'none');if(raster.lit<=100){await page.screenshot({path:path.join(out,'fleet-pixel-failure.png')});console.log(JSON.stringify({raster,first,navigation:await page.evaluate(()=>{const n=CommandApp.scene.snapshot.navigation;return {camera:n.camera,goal:n.goal,combat:n.combatCamera,details:n.visibleDetails,npcs:n.npcs};})}));}assert(raster.lit>100,'Shared renderer must actually paint fleet pixels');assert.equal(first.replay,false);assert.equal(first.target,key);assert.match(await page.locator('#map-combat-title').innerText(),/实时交战/);assert.match(await page.locator('.planet-outcome').innerText(),/当前剩余资源/);assert.match(await page.locator('.planet-outcome').innerText(),/已送达出发星球/);
 await page.screenshot({path:path.join(out,'live.png')});
 await page.keyboard.press('Escape');await page.evaluate(()=>CommandApp.scene.renderer._advance(3));await page.screenshot({path:path.join(out,'system-scale.png')});
 await page.locator('[data-map-replay]').click();const replay=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await replay.waitForFunction(()=>window.flightController?.replay&&flightController.playTime>.5);
 await replay.locator('#native-pause').click();const t=await replay.evaluate(()=>flightController.playTime);await page.waitForTimeout(250);assert.equal(await replay.evaluate(()=>flightController.playTime),t);await replay.locator('#native-speed').selectOption('4');await replay.locator('#native-seek').fill('20');assert.equal(await replay.evaluate(()=>flightController.playTime),20);
 await page.screenshot({path:path.join(out,'replay.png')});assert.equal(await page.locator('.aurora-game-frame').getAttribute('data-identity'),'persistent-map');assert.equal(await page.evaluate(()=>EmpireAPI.planet.id),sceneId);
 await replay.locator('#native-leave').click();await page.evaluate(id=>{CommandApp.go('system',{keepCamera:true});CommandApp.scene.combat.focus(id);},battle.id);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-combat="focus"]').click();await page.evaluate(()=>CommandApp.scene.renderer._advance(3));await page.screenshot({path:path.join(out,'mobile.png')});
 await page.setViewportSize({width:1600,height:1000});
 await page.evaluate(()=>{CommandApp.scene.combat.close();CommandApp.go('fleet');});
 assert.equal(await page.locator('[data-fleet-count="Death_Star"]').count(),0);assert.equal(await page.locator('[data-fleet-count="Guardian"]').count(),0);
 await page.locator('#dispatch-target').selectOption(target.id);await page.locator('#dispatch-task').selectOption('transport');await page.locator('[data-fleet-count="Cruiser"]').fill('3');
 await page.locator('#dispatch-form button[type="submit"],#dispatch-form button.primary').click();
 await page.waitForFunction(()=>['home','system'].includes(document.body.dataset.scene)&&CommandApp.scene.snapshot.navigation.flights.some(f=>f.stage==='departing'&&f.models>0));
 await page.evaluate(()=>CommandApp.scene.renderer._advance(2));await page.screenshot({path:path.join(out,'departure.png')});
 const mission=await page.evaluate(()=>EmpireAPI.state.missions.filter(m=>m.phase==='outbound'&&m.task==='transport').at(-1));assert(mission);

 const follow=await page.evaluate(mission=>{const s=CommandApp.scene,r=s.renderer,home=EmpireAPI.state.planets.find(p=>p.id===mission.from),now=EmpireAPI.now;
  r.setNavigationState({missions:[{...mission,fromPosition:home.position,count:3,start:now,end:now+20000}]});r.focusMapMission(mission.id);
  r.setNavigationState({missions:[{...mission,fromPosition:home.position,count:3,start:now-10000,end:now+10000}]});r._advance(.01);const cruise=s.snapshot.navigation.missionFollow?.key;
  r.setNavigationState({missions:[{...mission,fromPosition:home.position,count:3,start:now-18000,end:now+2000}]});r._advance(.01);const arrival=s.snapshot.navigation.missionFollow?.key,planet=s.snapshot.navigation.zoomTarget?.id;
  r.setNavigationState({missions:[{...mission,task:'attack',phase:'engaged',battleId:'00000000-0000-4000-8000-000000000023',fromPosition:home.position,count:3}]});r._advance(.01);const engaged=s.snapshot.navigation.missionFollow?.key;
  const camera=JSON.stringify(s.snapshot.navigation.goal);r.zoomNavigation(20);return {cruise,arrival,planet,engaged,trackingPreserved:s.snapshot.navigation.missionFollow?.key===engaged&&JSON.stringify(s.snapshot.navigation.goal)===camera};
 },mission);assert.equal(follow.cruise,'outbound:cruise');assert.equal(follow.arrival,'outbound:warp-out');assert.equal(follow.planet,target.position.join(':'));assert.equal(follow.engaged,'engaged:holding');assert(follow.trackingPreserved);
 const stages=[];
 for(const [phase,elapsed,expected] of [['outbound',4500,'warp-in'],['outbound',10000,'cruise'],['outbound',18000,'warp-out'],['return',1000,'departing'],['return',4500,'warp-in'],['return',10000,'cruise'],['return',18000,'warp-out']]){
  const result=await page.evaluate(({mission,phase,elapsed,expected})=>{const s=CommandApp.scene,r=s.renderer,now=EmpireAPI.now,home=EmpireAPI.state.planets.find(p=>p.id===mission.from);const m={...mission,phase,start:now-elapsed,end:now+20000-elapsed,fromPosition:home.position,count:3};
   const arriving=expected==='warp-out',at=phase==='return'?(arriving?m.fromPosition:m.position):(arriving?m.position:m.fromPosition);
   if(expected==='cruise')r.focusSystem(at[1]);else r.toPlanet(at.join(':'),{orbit:true});r.setNavigationState({missions:[m]});if(expected!=='cruise')r.focusMapMission(m.id);r._advance(.01);r._advance(2);
   const nav=s.snapshot.navigation;return {...nav.flights.find(f=>f.id===m.id),cameraFocus:nav.goal.center};
  },{mission,phase,elapsed,expected});
  assert(result,phase+' '+expected+' must be on the map');assert.equal(result.stage,expected);
  if(expected==='cruise')assert.equal(result.models,0);else assert(result.models>0);
  if(expected.startsWith('warp-')){assert(result.warpVertices>0);assert(result.warpEnergy>0);assert.deepEqual(result.cameraFocus,result.focus);}
  stages.push({phase,stage:result.stage,models:result.models});await page.screenshot({path:path.join(out,phase+'-'+expected+'.png')});
 }
 const attackArrival=await page.evaluate(mission=>{const s=CommandApp.scene,r=s.renderer,now=EmpireAPI.now,home=EmpireAPI.state.planets.find(p=>p.id===mission.from),m={...mission,task:'attack',phase:'outbound',fromPosition:home.position,count:3,start:now-18000,end:now+2000};r.setNavigationState({missions:[m]});r.focusMapMission(m.id);r._advance(.01);r._advance(2);return s.snapshot.navigation.flights.find(f=>f.id===m.id);},mission);
 assert.equal(attackArrival.stage,'warp-out');assert.equal(attackArrival.models,3);await page.screenshot({path:path.join(out,'attack-arrival.png')});
 assert.equal(await page.evaluate(()=>CommandApp.scene.renderer.getWebGLError()),0);assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({liveShips:first.ships.length,tickAdvances:true,sameMapContext:true,resourcesAndDelivery:true,replayControls:true,realDispatch:true,hiddenRetiredHulls:true,follow,raster,stages,attackArrival,errors},null,2));console.log('Shared battlefield pixels, real dispatch, warp/return phases, roster, persistent map and replay verified.');
}finally{await browser?.close();server.kill();await once(server,'exit');fs.rmSync(temp,{recursive:true,force:true});}
