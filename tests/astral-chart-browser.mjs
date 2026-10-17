import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createWorld,createPlayer,snapshot} from '../game/engine.mjs';
import {npcTypes} from '../game/npc-types.mjs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('output/playwright/astral-integration');fs.mkdirSync(out,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'astral-integration-')),world=createWorld(),player=createPlayer(world,'野怪模型验收',world.at,()=>.5),home=world.planets[player.home];
home.ships={Probe:20,Light_Fighter:200};home.resources=[1e8,1e8,1e8];player.tech.Computer_Tech=5;snapshot(world,player,home.position.slice(0,2));
const file=path.join(directory,'universe.json'),session=path.join(directory,'session.json');fs.writeFileSync(file,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;const result={errors:[],failedRequests:[],checks:[],models:[]};server.stderr.on('data',d=>result.errors.push(String(d)));
try{
 await once(server.stdout,'data');browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});page.on('requestfailed',r=>result.failedRequests.push(r.url()));
 await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('.aurora-game-frame')?.contentWindow?.AURORA?.snapshot.navigation.frames>2);
 const run=(fn,arg)=>page.evaluate(({source,arg})=>{const api=document.querySelector('.aurora-game-frame').contentWindow.AURORA;return new Function('api','arg','return ('+source+')(api,arg)')(api,arg);},{source:fn.toString(),arg});
 const state=()=>run(api=>api.snapshot.navigation);
 assert.equal((await state()).systemCount,256);assert.equal((await state()).strategy.mode,'planar-voronoi');
 await run(api=>{api.toGalaxy();api._advance(4);});await page.screenshot({path:path.join(out,'galaxy.png')});
 const beforeDrag=(await state()).camera;await page.mouse.move(900,420);await page.mouse.down();await page.mouse.move(990,460,{steps:8});await page.mouse.up();await run(api=>api._advance(2));const afterDrag=(await state()).camera;assert(Math.abs(afterDrag.yaw-beforeDrag.yaw)>.1);assert(Math.abs(afterDrag.pitch-beforeDrag.pitch)>.03);assert(afterDrag.center.every((v,i)=>Math.abs(v-beforeDrag.center[i])<1e-5));await run(api=>{api.toGalaxy();api._advance(4);});
 const capital=(await state()).activePlanetId;await page.locator('#galaxy-inspector [data-strategy="territories"]').click();assert.equal((await state()).strategy.territoriesVisible,false);await page.locator('#galaxy-inspector [data-strategy="territories"]').click();assert.equal((await state()).strategy.territoriesVisible,true);
 await page.locator('.home-map[data-strategy="home"]').click();await run(api=>api._advance(3));assert.equal((await state()).zoomTarget.id,home.position[1]);assert.equal((await state()).activePlanetId,capital);
 result.checks.push('256-star chart, planar territories, boundary toggle and actual capital locator');
 await run((api,system)=>{api.focusSystem(system);api._advance(3);},home.position[1]);
 await page.waitForFunction(()=>document.querySelector('.aurora-game-frame').contentWindow.AURORA.snapshot.navigation.npcs.loaded.length===5,{},{timeout:30000});
 assert.equal(await page.locator('.aurora-game-frame').contentFrame().locator('.npc-label-overlay').isVisible(),true);await page.screenshot({path:path.join(out,'system.png')});
 assert.equal((await page.locator('#system-orbits').innerText()).match(/Lv [1-5]/g)?.length,5);result.checks.push('Five distinct identities and levels on the live system list');
 for(const type of npcTypes){
  const p=Object.values(world.planets).find(p=>p.npcType===type.id&&p.position[1]===home.position[1]),key=p.position.join(':');
  await page.locator(`[data-map-select="${key}"]`).click();await run((api,key)=>{api.toPlanet(key);api._advance(3);},key);await page.waitForTimeout(250);
  const nav=await state(),visible=nav.npcs.visible.find(x=>x.key===key),patrols=nav.npcs.patrols.filter(x=>x.key===key);assert(visible?.loaded);assert.equal(visible.type,type.id);assert.equal(patrols.length,type.patrols);assert(patrols.every(p=>p.decorative));assert.equal(nav.activePlanetId,home.id);
  await page.screenshot({path:path.join(out,type.id+'.png')});
  await run(api=>api._advance(2));const later=(await state()).npcs.patrols.find(p=>p.key===key&&p.index===0);assert.notDeepEqual(later.position,patrols[0].position);
  assert.match(await page.locator('#system-target').innerText(),new RegExp('Lv '+type.level));result.models.push({type:type.id,level:type.level,patrols:patrols.length,loaded:true});
 }
 result.checks.push('All five approved meshes, orbit motion, decorative counts and fixed active colony');
 await page.locator('.bottom-bar [data-page="home"]').click();await run(api=>api._advance(3));await page.waitForTimeout(250);assert.equal(await page.locator('#home-page').isVisible(),true);assert.equal(await page.locator('#orbit-dock').isVisible(),true);await page.screenshot({path:path.join(out,'home.png')});
 const stableHome=await state();for(let i=0;i<5;i++){await page.context().clearCookies();await page.evaluate(()=>EmpireAPI.refresh());await run(api=>api._advance(.2));const refreshed=await state();assert.equal(refreshed.activePlanetId,stableHome.activePlanetId);assert.equal(refreshed.strategy.homePlanetId,stableHome.strategy.homePlanetId);assert.deepEqual(refreshed.goal,stableHome.goal);}result.checks.push('Five cookie-free refreshes keep account, home, camera destination and operating colony stable');
 await page.locator(`[data-map-select="1:${home.position[1]}:9"]`).dblclick();await run(api=>api._advance(3));assert.equal(await page.locator('#system-page').isVisible(),true);assert.match(await page.locator('#system-title').innerText(),/苍穹裂隙/);assert.equal((await state()).activePlanetId,capital);
 result.checks.push('Home dossier and shared thumbnail dock; double-click a foreign world switches dossier without switching colony');

 assert.equal(await page.evaluate(()=>EmpireAPI.state.missions.length),0,'orbit decorations do not create missions');
 await page.locator('[data-map-task="attack"]').click();assert.equal(await page.locator('#dispatch-task').inputValue(),'attack');assert.equal(await page.locator('[data-coordinate="2"]').inputValue(),'9');result.checks.push('Fracture attack action uses the real target coordinates');
 await page.getByRole('navigation',{name:'主导航'}).locator('[data-page="system"]').click();await run((api,key)=>{api.toPlanet(key);api._advance(3);},`1:${home.position[1]}:9`);
 const before=(await state()).npcs.bufferCount;for(let i=0;i<3;i++){await run((api,sys)=>{api.focusSystem(sys);api._advance(3);},home.position[1]);await run((api,key)=>{api.toPlanet(key);api._advance(3);},`1:${home.position[1]}:9`);}assert.equal((await state()).npcs.bufferCount,before);result.checks.push('Mesh buffers remain cached across repeated navigation');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await run((api,key)=>{api.toPlanet(key);api._advance(3);},`1:${home.position[1]}:9`);await page.waitForTimeout(300);assert.equal(await page.locator('#system-orbits button.active').getAttribute('data-map-select'),`1:${home.position[1]}:9`);assert.equal((await state()).npcs.visible.length,1);await page.screenshot({path:path.join(out,'mobile.png')});
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.failedRequests,[]);result.checks.push('No console/page errors or failed requests');fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser?.close();server.kill();await once(server,'exit');assert(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});}
