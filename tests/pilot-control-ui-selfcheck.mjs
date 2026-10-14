import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,trialPresets} from '../game/battle-trial.mjs';
import {recordFrame} from '../game/spatial-battle.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/pilot-control');fs.mkdirSync(dir,{recursive:true});
const now=Date.now(),world=createWorld(now),player=createPlayer(world,'驾驶修复验收',now);
const b=startTrial(world,player,{attacker:trialPresets[6].fleet,defender:trialPresets[6].fleet,seed:42},now);
for(const s of b.ships){s.hp=s.maxHp*=8;s.shield=s.maxShield*=8;}recordFrame(b);
const save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',b=>stderr+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],results={};page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.locator('[data-page="battle"]').click();await page.locator(`[data-open-battle="${b.id}"]`).click();let frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows.length===622);
 for(const type of ['Light_Fighter','Dreadnought']){
  await frame.evaluate(type=>flightController.chooseType(type),type);await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);
  await frame.locator('#scene').click({position:{x:950,y:500}});
  await frame.evaluate(()=>{window.turnSamples=[];window.sampleTurn=true;const sample=()=>{const p=GalacticDemo.state.flight;turnSamples.push([performance.now(),p.yaw,p.pitch,p.yawTarget,p.pitchTarget,flightController.rows[flightController.selected][4],flightController.controlled]);if(sampleTurn)requestAnimationFrame(sample);};sample();});
  await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowUp');await page.waitForTimeout(1200);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowUp');await page.waitForTimeout(400);
  const keyboard=await frame.evaluate(()=>{sampleTurn=false;const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),samples=turnSamples;let total=0,worst=0;for(let i=1;i<samples.length;i++){const d=wrap(samples[i][1]-samples[i-1][1]);total+=d;worst=Math.min(worst,d);}return {frames:samples.length,yaw:total,pitch:samples.at(-1)[2]-samples[0][2],worstBackward:worst,controlled:flightController.controlled};});
  assert.ok(keyboard.yaw>(type==='Light_Fighter'?1.8:.38),`${type} continuous keyboard turn`);assert.ok(keyboard.worstBackward>-.025,`${type} must not jump backward`);assert.notEqual(keyboard.controlled,null);
  const before=await frame.evaluate(()=>({yaw:GalacticDemo.state.flight.yaw,pitch:GalacticDemo.state.flight.pitch}));
  await page.mouse.move(950,500);await page.mouse.down({button:'right'});await page.mouse.move(1250,620,{steps:12});await page.mouse.up({button:'right'});await page.waitForTimeout(type==='Light_Fighter'?1000:2500);
  const mouse=await frame.evaluate(before=>{const p=GalacticDemo.state.flight;return {yaw:Math.atan2(Math.sin(p.yaw-before.yaw),Math.cos(p.yaw-before.yaw)),pitch:p.pitch-before.pitch,headingError:Math.abs(Math.atan2(Math.sin(p.yaw-p.yawTarget),Math.cos(p.yaw-p.yawTarget))),serverError:Math.abs(Math.atan2(Math.sin(p.yaw-(Math.PI-flightController.rows[flightController.selected][4])),Math.cos(p.yaw-(Math.PI-flightController.rows[flightController.selected][4])))),gl:GalacticDemo.renderer.gl.getError()};},before);
  assert.ok(mouse.yaw>.75,`${type} right mouse yaw responds`);assert.ok(mouse.pitch<-.25,`${type} right mouse pitch responds`);assert.ok(mouse.headingError<.08);assert.ok(mouse.serverError<.15);assert.equal(mouse.gl,0);
  results[type]={keyboard,mouse};await page.screenshot({path:path.join(dir,`${type}-pilot.png`)});await frame.locator('#native-release').click();
 }
 await frame.locator('#native-leave').click();
 for(const side of ['己方','对方'])for(const input of await page.locator(`input[aria-label^="${side}编队 "]`).all())await input.fill('0');
 await page.getByLabel('己方编队 湮灭之星',{exact:true}).fill('1');await page.getByLabel('对方编队 战列舰',{exact:true}).fill('10');await page.getByRole('button',{name:'开始编队测试 ↗'}).click();frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.metadata.length===11);
 await frame.evaluate(()=>{window.blastEvents=[];const b=flightController,effect=b.effect.bind(b);b.effect=e=>{if(['antimatter','antimatter-launch'].includes(e.type))blastEvents.push({type:e.type,tick:e.tick,source:e.source??e.shipId});return effect(e);};});
 await frame.waitForFunction(()=>GalacticDemo.state.flight.specialBlasts.some(e=>!e.harmless&&e.age>.35),null,{timeout:60000});
 results.blast=await frame.evaluate(()=>({events:blastEvents,visuals:GalacticDemo.state.flight.specialBlasts.length,weaponImpacts:GalacticDemo.state.flight.weaponImpacts.length}));assert.equal(results.blast.visuals,1);assert.ok(results.blast.events.find(e=>e.type==='antimatter-launch').tick<=results.blast.events.find(e=>e.type==='antimatter').tick);
 await page.screenshot({path:path.join(dir,'single-antimatter-blast.png')});
 await frame.waitForFunction(()=>flightController.snapshot.status==='finished',null,{timeout:30000});await page.waitForTimeout(1200);assert.equal(await frame.evaluate(()=>!!flightController.replay),false,'finished battle must not automatically rewind and explode again');results.finishNoAutoplay=true;
 const practice=await browser.newPage();practice.on('pageerror',e=>errors.push(e.message));await practice.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/hangar.html?ship=Light_Fighter`);await practice.waitForFunction(()=>window.GalacticDemo);assert.equal(await practice.evaluate(()=>!!window.flightController),false);await practice.close();
 assert.deepEqual(errors,[]);assert.equal(stderr,'');console.log(JSON.stringify(results,null,2));
}finally{fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({results,errors,stderr},null,2));await browser.close();child.kill();await once(child,'exit');}
