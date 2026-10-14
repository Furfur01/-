import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {createWorld,createPlayer,act,advance} from '../game/engine.mjs';
import {createSpatialBattle,addSpatialFleet} from '../game/spatial-battle.mjs';
import {units} from '../game/catalog.mjs';

const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/battlefield-flow');fs.mkdirSync(dir,{recursive:true});
const now=Date.now(),start=now-700000,w=createWorld(start),a=createPlayer(w,'流程验收',start,()=>.1),d=createPlayer(w,'对手',start,()=>.2),home=w.planets[a.home],target=w.planets[d.home];
home.ships={Cruiser:3};home.resources=[1e8,1e8,1e8];target.ships={Light_Fighter:10};target.defense={};
act(w,a,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{Cruiser:3}},start);w.missions[0].end=start;advance(w,now);
const report=a.reports.find(r=>r.type==='battle');assert.ok(report);
home.ships.Probe=1;act(w,a,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'spy',ships:{Probe:1}},now);const traveling=w.missions.find(m=>m.phase==='outbound');traveling.end=now+120000;
const id='00000000-0000-4000-8000-000000000001',b=createSpatialBattle({id,target:target.id,attacker:a.id,defender:d.id,start:now});
const playable=Object.values(units).filter(u=>u.type==='combat').map(u=>u.id),fleet=Object.fromEntries(playable.map(id=>[id,1]));
for(const side of ['attacker','defender'])addSpatialFleet(b,{fleet,owner:side==='attacker'?a.id:d.id,side},units);
// A static, harmless fixture lets the UI inspect every official hull, independent of combat outcomes.
for(const ship of b.ships){ship.attack=0;ship.profile.speed=0;}w.battles[id]=b;
const save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${a.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await once(child.stdout,'data');await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled);await page.evaluate(()=>CommandApp.scene.showGalaxy());await page.waitForFunction(id=>CommandApp.scene.snapshot.navigation.flights.some(f=>f.id===id&&!f.controllable),traveling.id);await page.screenshot({path:path.join(dir,'strategic-flight.png')});await page.locator('[data-page="battle"]').click();await page.locator(`[data-open-battle="${id}"]`).click();let frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows.length);
 for(const type of playable){await frame.evaluate(type=>flightController.chooseType(type),type);await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);await frame.waitForTimeout(120);const result=await frame.evaluate(()=>({type:flightController.metadata[flightController.controlled].type,hp:flightController.rows[flightController.controlled][6],external:GalacticDemo.state.flight.external,weapon:document.querySelector('#weapon-primary-name').textContent,expectedWeapon:flightController.metadata[flightController.controlled].profile.primaryName}));assert.equal(result.type,type);assert.ok(result.hp>0);assert.equal(result.external,false);assert.equal(result.weapon,result.expectedWeapon);await frame.locator('#native-release').click();await frame.waitForFunction(()=>flightController.controlled===null);}
 assert.equal(await frame.evaluate(()=>GalacticDemo.renderer.gl.getError()),0);await page.screenshot({path:path.join(dir,'official-hulls.png')});await frame.locator('#native-leave').click();await page.locator(`[data-open-replay="${report.id}"]`).click();frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.replay);
 assert.equal(await frame.locator('#native-claim').isDisabled(),true);await frame.locator('#native-pause').click();const tick=await frame.evaluate(()=>flightController.playTime);await frame.waitForTimeout(300);assert.equal(await frame.evaluate(()=>flightController.playTime),tick);
 await frame.evaluate(()=>{flightController.playTime=flightController.report.duration;});await frame.waitForTimeout(100);const survivors=await frame.evaluate(()=>{const b=flightController,out={attacker:{},defender:{}};for(const row of b.rows)if(row[6]>0){const m=b.metadata[row[0]];out[m.side][m.type]=(out[m.side][m.type]||0)+1;}return out;});assert.deepEqual(survivors,report.survivors);
 await frame.locator('#native-speed').selectOption('4');await frame.locator('#native-follow').click();await page.screenshot({path:path.join(dir,'replay.png')});await frame.locator('#native-leave').click();
 assert.deepEqual(errors,[]);assert.equal(serverErrors,'');fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({strategicFlight:{visible:true,controllable:false},playable,reportId:report.id,replaySurvivors:survivors,errors,serverErrors},null,2));console.log('All official hulls, independent entry, replay pause/speed/follow and final survivors verified.');
}finally{await browser.close();child.kill();await once(child,'exit');}
