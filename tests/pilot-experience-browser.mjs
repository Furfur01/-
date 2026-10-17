import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial} from '../game/battle-trial.mjs';
import {clickConsole,consoleLayout} from './fighter-console-harness.mjs';
import {playwright,freePort,frameMetrics} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/pilot-experience');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'pilot-experience-test-'));
let server,browser,page;const errors=[],result={};
try{
 const now=Date.now(),w=createWorld(now),p=createPlayer(w,'驾驶体验隔离测试',now,()=>.5);
 const b=startTrial(w,p,{attacker:{Battleship:1,Heavy_Fighter:2},defender:{Heavy_Fighter:3}},now);
 const fighter=b.ships.find(s=>s.side==='attacker'&&s.type==='Heavy_Fighter'),capital=b.ships.find(s=>s.type==='Battleship'),enemies=b.ships.filter(s=>s.side==='defender');
 for(const s of b.ships){s.hp=s.maxHp=1e9;s.shield=s.maxShield=1e9;s.x=-500;s.y=0;s.z=s.id*100;s.station={...s.station,y:0,z:s.z};}
 Object.assign(fighter,{x:0,y:0,z:0,yaw:Math.PI/2});
 enemies.forEach((s,i)=>{s.x=[160,1500,800][i];s.y=0;s.z=0;s.profile.speed=0;s.attack=0;});
 const file=path.join(temp,'universe.json'),session=path.join(temp,'session.json');
 fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));
 const port=await freePort();assert(![8289,8390].includes(port));const base=`http://127.0.0.1:${port}`;
 server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});server.stderr.on('data',d=>errors.push(String(d)));
 let ready=false;for(let i=0;i<150&&!ready;i++){ready=await fetch(base+'/api/health').then(r=>r.json()).then(r=>r.isolated&&r.pid===server.pid).catch(()=>false);if(!ready)await new Promise(r=>setTimeout(r,100));}assert(ready);
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 // Instrument the actual shipped draw path to verify camera/hull attachment.
 const source=fs.readFileSync(new URL('./heavy-fighter-bridge-browser.mjs',import.meta.url),'utf8');
 let probe=source.match(/const probeModule=`([\s\S]*?)`;/)[1];
 probe=probe.replace('const expected=row?.slice(1,4).map((v,i)=>old[i+1]+(v-old[i+1])*alpha);','const expected=data.pilotRow?.[0]===view.shipId?data.pilotRow.slice(1,4):row?.slice(1,4).map((v,i)=>old[i+1]+(v-old[i+1])*alpha);').replace('frames:[],delay:8','frames:[],delay:0');
 await page.route(url=>url.pathname.endsWith('/map-fleet.bundle.js')&&!url.search,route=>route.fulfill({contentType:'text/javascript',body:probe}));
 await page.goto(base+'/?battle='+b.id);await page.waitForFunction(()=>window.CommandApp?.scene?.combat?.entry?.data&&CommandApp.scene.renderer?.ready);
 await page.locator('#map-combat-vessel').selectOption(String(fighter.id));
 await page.waitForFunction(id=>CommandApp.scene.combat.controlled===id,fighter.id);
 await page.evaluate(()=>{CommandApp.scene.combat.throttle=0;});
 await clickConsole(page,'select',enemies[1].id,'contacts');
 await clickConsole(page,'fire');assert.match(await page.evaluate(()=>CommandApp.scene.combat.lastCommand),/超出射程/);
 assert.equal(await page.evaluate(()=>CommandApp.scene.combat.fighterHUD.state.weapon.range),230);
 await page.screenshot({path:path.join(out,'out-of-range.png')});
 // Physical screens move with cabin perspective, and remain clickable while looking down.
 const frontPanels=await consoleLayout(page),frontRadar=frontPanels.find(p=>p.id==='radar');
 const viewBox=await page.locator('.aurora-game-frame').boundingBox();
 await page.mouse.move(viewBox.x+viewBox.width*.5,viewBox.y+viewBox.height*.4);await page.mouse.down({button:'middle'});
 await page.mouse.move(viewBox.x+viewBox.width*.5+100,viewBox.y+viewBox.height*.4,{steps:10});await page.mouse.up({button:'middle'});await page.waitForTimeout(150);
 const sideRadar=(await consoleLayout(page)).find(p=>p.id==='radar');assert(sideRadar.corners[0].x<frontRadar.corners[0].x-80,'screens move with cockpit yaw');
 await page.screenshot({path:path.join(out,'console-look-right.png')});await page.keyboard.press('KeyC');
 await page.mouse.move(viewBox.x+viewBox.width*.5,viewBox.y+viewBox.height*.4);await page.mouse.down({button:'middle'});
 await page.mouse.move(viewBox.x+viewBox.width*.5,viewBox.y+viewBox.height*.4+78,{steps:10});await page.mouse.up({button:'middle'});await page.waitForTimeout(150);
 const downRadar=(await consoleLayout(page)).find(p=>p.id==='radar');assert(downRadar.corners[0].y<frontRadar.corners[0].y-60,'screens rise naturally when looking down');
 await clickConsole(page,'select',enemies[1].id,'contacts');assert.equal(await page.evaluate(()=>CommandApp.scene.combat.mouseFire),false);
 await page.screenshot({path:path.join(out,'console-look-down.png')});await page.keyboard.press('KeyC');
 result.modelScreens={count:frontPanels.length,perspective:true,physicalClick:true};

 await clickConsole(page,'select',enemies[0].id,'contacts');await clickConsole(page,'lock');
 await page.waitForFunction(()=>CommandApp.scene.combat.weaponStatus().ready);
 const before=await page.evaluate(()=>CommandApp.scene.combat.entry.data.eventSeq);
 await clickConsole(page,'fire');
 await page.waitForFunction(({before,id})=>CommandApp.scene.combat.entry.data.events.some(e=>e.seq>before&&e.type==='fire'&&e.shipId===id),{before,id:fighter.id});
 result.actualShot=true;
 assert.equal(await page.locator('#fighter-flight-hud canvas, #fighter-flight-hud .u-canopy, #fighter-flight-hud .u-instrument, #fighter-flight-hud .u-pilot-systems, #fighter-flight-hud .f-target').count(),0);assert.equal((await consoleLayout(page)).length,5);
 assert.equal(await page.locator('#fighter-flight-hud .u-avatar, #fighter-flight-hud .u-pilot-comms, #fighter-flight-hud .u-pilot-mini').count(),0);
 // Real keyboard input, authority and rendered instrumentation must agree.
 await page.evaluate(()=>{const c=CommandApp.scene.combat;c.locked=false;c.throttle=.65;});
 const origin=await page.evaluate(()=>{const c=CommandApp.scene.combat;return c.rows.get(c.controlled).slice();});
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(600);await page.keyboard.up('ArrowUp');
 await page.waitForFunction(old=>{const c=CommandApp.scene.combat,r=c.rows.get(c.controlled);return r[5]>old[5]+.12&&r[2]>old[2]+1;},origin);
 const up=await page.evaluate(()=>{const c=CommandApp.scene.combat;return c.rows.get(c.controlled).slice();});
 await page.keyboard.down('ArrowDown');await page.waitForTimeout(1300);await page.keyboard.up('ArrowDown');
 await page.waitForFunction(old=>{const c=CommandApp.scene.combat,r=c.rows.get(c.controlled);return r[5]<-.1&&r[5]<old[5]-.2;},up);
 const down=await page.evaluate(()=>{const c=CommandApp.scene.combat;return c.rows.get(c.controlled).slice();});
 await page.waitForFunction(y=>{const c=CommandApp.scene.combat;return c.rows.get(c.controlled)[2]<y-1;},down[2]);
 result.pitch={up:up[5],down:down[5],climbed:up[2]-origin[2]};
 assert.match(await page.locator('#fighter-flight-hud [data-value=pitch]').first().innerText(),/°/);
 const canvas=page.frames().find(f=>f.url().includes('planet-construction-review')).locator('#world'),box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width*.52,box.y+box.height*.43);await page.mouse.down({button:'right'});await page.mouse.move(box.x+box.width*.52,box.y+box.height*.43-70,{steps:8});await page.mouse.up({button:'right'});
 await page.waitForFunction(before=>{const c=CommandApp.scene.combat;return c.rows.get(c.controlled)[5]>before+.1;},down[5]);
 result.mousePitch=true;

 await page.locator('#map-combat-camera').selectOption('follow');assert.equal(await page.evaluate(()=>CommandApp.scene.combat.controlled),fighter.id);
 await page.locator('#map-combat-camera').selectOption('bridge');
 // Delaying network input must not delay local steering.
 await page.route('**/control',async route=>{if(route.request().postDataJSON()?.type==='input')await new Promise(r=>setTimeout(r,300));await route.continue();});
 const response=await page.evaluate(async()=>{const c=CommandApp.scene.combat;c.locked=false;const old=c.predicted.row[5];c.elevation=old;c.keys.add('KeyQ');await new Promise(r=>setTimeout(r,100));const delta=c.predicted.row[5]-old;c.keys.delete('KeyQ');return {delta,elapsedMs:100};});
 assert(response.delta>.02,'local pitch responds before delayed network input');result.response=response;
 await page.unroute('**/control');
 await page.keyboard.down('KeyW');await page.keyboard.down('KeyA');await page.keyboard.down('KeyQ');await page.waitForTimeout(900);await page.keyboard.up('KeyA');await page.keyboard.up('KeyQ');await page.keyboard.up('KeyW');
 await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'cockpit.png')});
 const samples=await page.evaluate(()=>{const s=CommandApp.scene;return {frames:s.frame.contentWindow.fleetProbe.frames,frameTimes:s.snapshot.navigation.frameTimes};});
 const bridge=samples.frames.filter(s=>s.mode==='bridge'&&s.type==='Heavy_Fighter'&&s.fullHull&&s.eye);
 assert(bridge.length>12);const seat=await page.evaluate(()=>CommandApp.scene.frame.contentWindow.fleetProbe.frames.filter(s=>s.mode==='bridge'&&s.type==='Heavy_Fighter'&&s.eye).map(s=>s.eye));
 const reference=seat[0];result.maxSeatDrift=Math.max(...seat.map(p=>Math.hypot(...p.map((v,i)=>v-reference[i]))));
 result.maxSampleError=Math.max(...bridge.map(s=>s.sampleError));assert(result.maxSeatDrift<.001);assert(result.maxSampleError<.001);
 result.frameMetrics=frameMetrics(samples.frameTimes.filter(x=>typeof x==='number'));
 for(const size of [{width:1280,height:720},{width:1920,height:1080}]){
  await page.setViewportSize(size);await page.waitForTimeout(250);
  const panels=await consoleLayout(page);assert.equal(panels.length,5);for(const panel of panels)for(const point of panel.corners)assert(point.x>=0&&point.y>=0&&point.x<=size.width&&point.y<=size.height,JSON.stringify({panel:panel.id,point,size}));
  await page.screenshot({path:path.join(out,'fighter-'+size.width+'.png')});
 }
 await page.setViewportSize({width:1600,height:1000});
 // Quick list changes cannot leave control on an earlier ship.
 await page.evaluate(async ids=>{const c=CommandApp.scene.combat;await Promise.all(ids.map(id=>c.selectVessel(id)));},[capital.id,fighter.id,capital.id]);
 assert.equal(await page.evaluate(()=>CommandApp.scene.combat.controlled),capital.id);
 await page.locator('#map-combat-camera').selectOption('follow');await page.locator('#map-combat-pilot').click();
 await page.waitForFunction(()=>CommandApp.scene.combat.controlled==null);
 await page.waitForTimeout(900);
 // Double-click a rendered friendly ship, through the real canvas hit test.
 const hit=await page.evaluate(id=>CommandApp.scene.snapshot.navigation.targets.find(t=>t.type==='vessel'&&t.id===id),capital.id);assert(hit,'selected capital must have a visible hit target');
 const frame=page.frames().find(f=>f.url().includes('planet-construction-review'));
 await frame.locator('#world').dblclick({position:{x:hit.x,y:hit.y}});
 await page.waitForFunction(id=>CommandApp.scene.combat.controlled===id,capital.id);result.doubleClick=true;
 await page.locator('#map-combat-camera').selectOption('follow');await page.screenshot({path:path.join(out,'third-person.png')});
 await page.keyboard.press('Escape');await page.waitForFunction(()=>CommandApp.scene.combat.controlled==null);
 // Exercise the standalone fallback for battles whose planet is absent from today's map.
 await page.route('**/api/star-map',route=>route.fulfill({json:{planets:[]}}));
 await page.goto(base+'/opendesign/mockups/galactic-command/battlefield-three.html?battle='+b.id);
 await page.waitForFunction(()=>window.flightController?.metadata?.length&&window.flightController.snapshot);
 const formation=await page.evaluate(id=>flightController.metadata[id].formation,fighter.id);
 await page.locator('#native-formation').selectOption(formation);
 await page.locator('#native-vessel').selectOption(String(fighter.id));await page.locator('#native-claim').click();
 await page.waitForFunction(id=>flightController.controlled===id,fighter.id);
 await page.waitForSelector('#fighter-flight-hud:not([hidden])');
 await clickConsole(page,'select',enemies[0].id,'contacts');
 const initialPitch=await page.evaluate(()=>GalacticDemo.state.flight.pitch);
 const pitchKey=initialPitch<-.7?'ArrowUp':'ArrowDown',direction=pitchKey==='ArrowUp'?1:-1;
 await page.keyboard.down(pitchKey);await page.waitForTimeout(600);await page.keyboard.up(pitchKey);
 await page.waitForFunction(({initial,direction})=>(flightController.rows[flightController.controlled][5]-initial)*direction>.1,{initial:initialPitch,direction});
 await page.screenshot({path:path.join(out,'standalone-fighter.png')});
 await page.locator('#fighter-flight-hud [data-action=auto]').click();await page.waitForFunction(()=>flightController.controlled===null);
 result.standalone=true;
 // The archive's practice fighter also receives live telemetry on the same model.
 await page.goto(base+'/opendesign/mockups/galactic-command/hangar-three.html?ship=Heavy_Fighter');
 await page.waitForFunction(()=>window.GalacticDemo?.state.mode==='flight'&&GalacticDemo.renderer.fighterConsole.state?.name?.includes('靶场'));
 await page.waitForSelector('#fighter-flight-hud:not([hidden])');
 assert.equal(await page.locator('#fighter-flight-hud .u-instrument, #fighter-flight-hud canvas').count(),0);
 for(const selector of ['.flight-reticle','.flight-systems','.vessel-condition'])assert.equal(await page.locator(selector).isVisible(),false,'legacy practice HUD must stay hidden: '+selector);
 await clickConsole(page,'select','1','contacts');assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.targetIndex),1);
 await page.waitForTimeout(800);
 const practicePanels=await consoleLayout(page),leadBox=await page.locator('#fighter-flight-hud .u-lead-label').boundingBox();
 assert(leadBox.y+leadBox.height<Math.min(...practicePanels.flatMap(p=>p.corners.map(c=>c.y))),'head-up caption must not cover model displays');
 await page.screenshot({path:path.join(out,'practice-console.png')});result.practiceConsole=true;
 await page.locator('#fighter-flight-hud [data-action=exit]').click();await page.waitForURL('**/ships.html?ship=Heavy_Fighter');
 assert.deepEqual(errors,[]);result.errors=errors;console.log(JSON.stringify(result));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
}catch(error){if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.error(errors);throw error;}
finally{try{await browser?.close();}finally{try{if(server&&server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}finally{const resolved=fs.realpathSync(temp),root=fs.realpathSync(os.tmpdir());assert(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('pilot-experience-test-'));fs.rmSync(resolved,{recursive:true,force:true});}}}
