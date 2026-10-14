import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {createWorld,createPlayer,act} from '../game/engine.mjs';
import {createSpatialBattle,addSpatialFleet,advanceSpatialBattle} from '../game/spatial-battle.mjs';
import {units} from '../game/catalog.mjs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dense=process.env.EMPIRE_BENCH_DENSE==='1',small=process.env.EMPIRE_BENCH_SMALL==='1';
const output=path.resolve('output/playwright/'+(small?'native-battle-small':dense?'native-battle-dense':'native-battle'));fs.mkdirSync(output,{recursive:true});
const results={cases:[],errors:[]};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
function fleet(n){if(small)return {Dreadnought:20,Destroyer:12,Battleship:10,Cruiser:6,Bomber:2};return {Light_Fighter:n*3/10,Heavy_Fighter:n/10,Cruiser:n*7/100,Battleship:n/50-1,Bomber:n/100,Guardian:1};}
try{
 for(const size of (small?[100]:dense?[3000]:[1000,3000])){
  const directory=path.join(output,String(size));fs.mkdirSync(directory,{recursive:true});
  const start=Date.now(),w=createWorld(start),a=createPlayer(w,'战斗验收',start,()=>.1),d=createPlayer(w,'靶舰队',start,()=>.2),home=w.planets[a.home],target=w.planets[d.home];home.ships=fleet(size);home.resources=[1e9,1e9,1e9];target.ships=fleet(size);target.defense={};a.tech.Computer_Tech=3;for(const p of [a,d]){p.tech.Strength_Tech=small?50:dense?100:10;p.tech.Shielding_Tech=small?50:dense?100:10;}
  act(w,a,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:fleet(size)},start);w.missions[0].end=start+8000;
  const saveFile=path.join(directory,'universe.json'),session=path.join(directory,'session.json');fs.writeFileSync(saveFile,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${a.id}`}));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',b=>stderr+=b);
  const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>results.errors.push(e.message));
  try{
   await once(child.stdout,'data');await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.EmpireAPI?.state);
   await page.locator('[data-page="battle"]').click();await page.waitForFunction(()=>window.EmpireAPI.state.battles?.length>0,null,{timeout:30000});
   const id=await page.evaluate(()=>EmpireAPI.state.battles[0].id);await page.locator('[data-open-battle="'+id+'"]').click();const frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows?.length>0,null,{timeout:60000});
   assert.equal(await frame.evaluate(()=>flightController.rows.length),size);
   await page.waitForTimeout(1500);await page.screenshot({path:path.join(directory,'overview.png')});
   const sample=async()=>frame.evaluate(async()=>{const b=flightController,t=[];let pilotedFrames=0,peakEffects=0;let last=performance.now(),start=last;await new Promise(resolve=>{function sample(now){if(b.controlled!==null)pilotedFrames++;peakEffects=Math.max(peakEffects,b.presentation.impacts.length+GalacticDemo.state.flight.beams.length+GalacticDemo.state.flight.projectiles.length);t.push(now-last);last=now;if(now-start<30000)requestAnimationFrame(sample);else resolve();}requestAnimationFrame(sample);});const sorted=t.slice(5).sort((a,c)=>a-c),windows=[];let time=0,frames=0;for(const ms of t){time+=ms;frames++;if(time>=1000){windows.push(frames*1000/time);time=0;frames=0;}}const gl=GalacticDemo.renderer.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');return {peakEffects,sampleSeconds:(performance.now()-start)/1000,pilotedFrameFraction:pilotedFrames/t.length,frames:sorted.length,meanFps:1000/(sorted.reduce((a,c)=>a+c,0)/sorted.length),minimumOneSecondFps:Math.min(...windows),p95FrameMs:sorted[Math.floor(sorted.length*.95)],display:b.renderStats,jsHeapMB:performance.memory?.usedJSHeapSize/1048576,webglError:gl.getError(),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable'};});
   const overview=await sample();await page.screenshot({path:path.join(directory,'engagement.png')});assert.ok(overview.peakEffects>0,'real combat effects are displayed');assert.ok(overview.display.high>0,'readable ships retain original detailed geometry');if(small){assert.equal(overview.display.mode,'native');assert.equal(overview.display.detail,overview.display.alive);}console.log(size+' overview sampled');await frame.evaluate(type=>flightController.chooseType(type),small?'Dreadnought':'Guardian');await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);
   const ship=await frame.evaluate(()=>flightController.controlled);await frame.locator('#scene').click({position:{x:950,y:500}});await page.keyboard.down('KeyW');await page.keyboard.down('Space');await page.waitForTimeout(1200);await page.keyboard.up('KeyW');await page.keyboard.up('Space');
   const control=await frame.evaluate(()=>({id:flightController.controlled,seq:flightController.seq}));assert.ok(control.seq>0);assert.equal(control.id,ship);
   const piloting=await sample();console.log(size+' piloting sampled');assert.equal(piloting.pilotedFrameFraction,1);await page.screenshot({path:path.join(directory,'pilot.png')});await frame.locator('#native-follow').click();await page.waitForTimeout(600);await page.screenshot({path:path.join(directory,'bridge.png')});await frame.locator('#native-release').click();await frame.waitForFunction(()=>flightController.controlled===null);if(small){await frame.locator('#native-cinema').click();await page.waitForTimeout(1500);await page.screenshot({path:path.join(directory,'cinematic-return.png')});}
   await frame.locator('#native-leave').click();await page.waitForFunction(()=>!document.querySelector('#mass-battle').classList.contains('battle-open'));
   const practice=await browser.newPage({viewport:{width:1920,height:1080}});practice.on('pageerror',e=>results.errors.push(e.message));await practice.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/hangar.html?ship=Light_Fighter&battle=ignored`);await practice.waitForFunction(()=>window.GalacticDemo);assert.equal(await practice.evaluate(()=>!!window.flightController),false);await practice.keyboard.press('Space');await practice.screenshot({path:path.join(directory,'practice.png')});await practice.close();
   fs.writeFileSync(path.join(directory,'render-metrics.json'),JSON.stringify({size,overview,piloting},null,2));assert.equal(overview.webglError,0);assert.equal(piloting.webglError,0);assert.ok(overview.minimumOneSecondFps>=30);assert.ok(piloting.minimumOneSecondFps>=30);results.cases.push({size,technology:{Strength_Tech:small?50:dense?100:10,Shielding_Tech:small?50:dense?100:10},overview,piloting,control,serverErrors:stderr});assert.equal(stderr,'');
   const perfBattle=createSpatialBattle({id:'benchmark',attacker:'a',defender:'d',start:0});for(const side of ['attacker','defender'])addSpatialFleet(perfBattle,{fleet:fleet(size),owner:side,side},units);const t=performance.now();advanceSpatialBattle(perfBattle,60000);results.cases.at(-1).simulation={simulatedSeconds:60,wallMs:performance.now()-t,heapMB:process.memoryUsage().heapUsed/1048576,alive:perfBattle.ships.filter(s=>s.hp>0).length};
  }finally{await page.close();child.kill();await once(child,'exit');}
 }
 assert.equal(results.errors.length,0);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));}
