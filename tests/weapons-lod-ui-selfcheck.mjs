import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial} from '../game/battle-trial.mjs';
import {recordFrame} from '../game/spatial-battle.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/weapons-lod');fs.mkdirSync(dir,{recursive:true});
const now=Date.now(),world=createWorld(now),player=createPlayer(world,'武器与远景验收',now),fleet={Dreadnought:16,Destroyer:10,Battleship:10,Cruiser:10,Bomber:10,Interceptor:4,Devourer_Interceptor:4,Titanenergetic_Frigate:10,Reaper:6};
const b=startTrial(world,player,{attacker:fleet,defender:fleet,seed:42},now);
// Isolated fixture: start in engagement range; keep real server flight and weapon rules.
for(const s of b.ships){s.x*=.3;s.hp=s.maxHp*=8;s.shield=s.maxShield*=8;}recordFrame(b);
const save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],result={};page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.locator('[data-page="battle"]').click();await page.locator(`[data-open-battle="${b.id}"]`).click();const frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows.length===160);
 await frame.evaluate(()=>{const r=GalacticDemo.renderer,draw=r.drawCombatEffects.bind(r);window.sharedEffectFrames=0;r.drawCombatEffects=(...args)=>{sharedEffectFrames++;return draw(...args);};});
 await frame.waitForFunction(()=>GalacticDemo.state.flight.projectiles.filter(q=>q.missile&&q.trail.length>8).length>8,null,{timeout:30000});
 result.weapons=await frame.evaluate(()=>({missiles:GalacticDemo.state.flight.projectiles.filter(q=>q.missile).length,kinds:[...new Set(GalacticDemo.state.flight.projectiles.map(q=>q.kind))],beams:GalacticDemo.state.flight.beams.length,sharedEffectFrames,fullDetail:flightController.fullDetail,gl:GalacticDemo.renderer.gl.getError()}));
 assert.equal(result.weapons.fullDetail,false);assert.ok(result.weapons.sharedEffectFrames>0);assert.ok(result.weapons.missiles>8);await page.screenshot({path:path.join(dir,'mixed-weapons.png')});
 const sample=async()=>frame.evaluate(async()=>{const intervals=[];let prev=performance.now(),start=prev;await new Promise(resolve=>{function tick(now){intervals.push(now-prev);prev=now;if(now-start<10000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});let time=0,n=0,min=Infinity;for(const ms of intervals.slice(5)){time+=ms;n++;if(time>=1000){min=Math.min(min,n*1000/time);time=0;n=0;}}return {average:intervals.length*1000/intervals.reduce((a,b)=>a+b,0),minOneSecond:min,heapMB:performance.memory?.usedJSHeapSize/1048576,display:flightController.renderStats,gl:GalacticDemo.renderer.gl.getError()};});
 result.overview=await sample();
 await frame.evaluate(()=>{flightController.cinematicAnchor=null;flightController.cinemaComposition=false;flightController.center=[0,0,0];flightController.distance=10000;});await page.waitForTimeout(500);
 result.far=await frame.evaluate(()=>({stats:flightController.renderStats,allHaveMeshes:flightController.metadata.every(m=>flightController.meshGroups.has(m.side+':'+m.type)),gl:GalacticDemo.renderer.gl.getError()}));assert.ok(result.far.allHaveMeshes);assert.equal(result.far.stats.instances,result.far.stats.alive);assert.ok(result.far.stats.low>100);await page.screenshot({path:path.join(dir,'far-low-models.png')});
 await frame.evaluate(()=>flightController.chooseType('Cruiser'));await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);await frame.locator('#scene').click({position:{x:950,y:500}});await page.keyboard.press('KeyR');result.pilot=await sample();await page.screenshot({path:path.join(dir,'missile-pilot.png')});await frame.locator('#native-release').click();
 await frame.evaluate(()=>flightController.chooseType('Dreadnought'));await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);await frame.locator('#scene').click({position:{x:950,y:500}});
 const beforePitch=await frame.evaluate(()=>flightController.rows[flightController.controlled][5]);await page.keyboard.down('ArrowUp');await page.keyboard.down('KeyW');await page.waitForTimeout(1600);await page.keyboard.up('ArrowUp');await page.keyboard.up('KeyW');await page.waitForTimeout(250);
 result.pitch=await frame.evaluate(()=>{const p=GalacticDemo.state.flight,row=flightController.rows[flightController.controlled],{M,shipMatrix}=GalaxyRender,m=shipMatrix(p,GalacticDemo.state.shipIndex),origin=M.transform(m,[0,0,0]),bow=M.transform(m,[-1,0,0]);return {server:row[5],predicted:p.pitch,bowRise:bow[1]-origin[1]};});assert.ok(result.pitch.server>beforePitch+.2);assert.ok(Math.abs(result.pitch.bowRise-Math.sin(result.pitch.predicted))<.001);await page.screenshot({path:path.join(dir,'pitched-bow.png')});await frame.locator('#native-release').click();
 const practice=await browser.newPage();practice.on('pageerror',e=>errors.push(e.message));await practice.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/hangar.html?ship=Bomber`);await practice.waitForFunction(()=>window.GalacticDemo);assert.equal(await practice.evaluate(()=>!!window.flightController),false);await practice.close();
 assert.equal(result.weapons.gl,0);assert.equal(result.far.gl,0);assert.equal(result.overview.gl,0);assert.equal(result.pilot.gl,0);assert.equal(errors.length,0);assert.equal(serverErrors,'');assert.ok(result.overview.minOneSecond>=30);assert.ok(result.pilot.minOneSecond>=30);console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({...result,errors,serverErrors},null,2));await browser.close();child.kill();await once(child,'exit');}
