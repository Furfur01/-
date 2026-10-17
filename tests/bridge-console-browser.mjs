import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial} from '../game/battle-trial.mjs';
import {advanceSpatialBattle,spatialMetadata,recordFrame} from '../game/spatial-battle.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';
import {bridgeLayout,clickBridge} from './bridge-console-harness.mjs';

const out=path.resolve('output/playwright/bridge-console');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bridge-console-test-'));let server,browser,page;const errors=[],result={};
try{
 const now=Date.now(),w=createWorld(now),p=createPlayer(w,'舰桥模型仪表隔离测试',now,()=>.5),b=startTrial(w,p,{attacker:{Battleship:1,Iron_Behemoth:1,Cruiser:2},defender:{Battleship:3}},now);
 const battleship=b.ships.find(s=>s.side==='attacker'&&s.type==='Battleship'),carrier=b.ships.find(s=>s.side==='attacker'&&s.type==='Iron_Behemoth'),enemies=b.ships.filter(s=>s.side==='defender');
 for(const s of b.ships){s.hp=s.maxHp=1e9;s.shield=s.maxShield=1e9;s.x=s.side==='attacker'?0:300;s.y=0;s.z=s.id*60;s.yaw=Math.PI/2;s.station={...s.station,y:0,z:s.z};if(s.side==='defender'){s.profile.speed=0;s.attack=0;}}
 enemies.forEach((s,i)=>{s.x=300+i*200;s.z=0;});recordFrame(b);
 const replayBattle=structuredClone(b);advanceSpatialBattle(replayBattle,now+10000);const replay={report:{id:'bridge-console-replay',title:'舰桥模型仪表隔离回放',duration:10},record:{metadata:spatialMetadata(replayBattle),frames:replayBattle.frames,events:replayBattle.events,environment:b.environment}};
 const save=path.join(temp,'universe.json'),session=path.join(temp,'session.json');fs.writeFileSync(save,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));
 const port=await freePort();assert(![8289,8390].includes(port));const base=`http://127.0.0.1:${port}`;result.port=port;
 server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});server.stdout.resume();server.stderr.on('data',d=>errors.push(String(d)));
 let ready=false;for(let i=0;i<150&&!ready;i++){ready=await fetch(base+'/api/health').then(r=>r.json()).then(r=>r.isolated&&r.pid===server.pid).catch(()=>false);if(!ready)await new Promise(r=>setTimeout(r,100));}assert(ready);
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?battle='+b.id);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.combat.entry?.data);
 for(const ship of [battleship,carrier]){
  await page.locator('#map-combat-vessel').selectOption(String(ship.id));await page.waitForFunction(id=>CommandApp.scene.combat.controlled===id,ship.id);await page.waitForSelector('#bridge-flight-hud:not([hidden])');
  await page.evaluate(()=>{CommandApp.scene.combat.throttle=0;});await page.waitForTimeout(600);
  assert.equal(await page.locator('#map-pilot-hud').isVisible(),false);assert.equal(await page.locator('#carrier-command-panel').count(),0);
  await clickBridge(page,'select',enemies[0].id,'contacts');await page.waitForFunction(id=>CommandApp.scene.combat.target===id,enemies[0].id);
  if(ship===battleship){await clickBridge(page,'lock');await clickBridge(page,'fire');await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.events?.some(e=>e.type==='fire'&&e.shipId===id),ship.id);result.actualShot=true;}
  else{
   await clickBridge(page,'mode','guard');await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.carriers.find(c=>c.shipId===id)?.mode==='guard',ship.id);
   await clickBridge(page,'formation','orbit');await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.carriers.find(c=>c.shipId===id)?.formation==='orbit',ship.id);
   await clickBridge(page,'select',enemies[1].id,'hologram');await page.waitForFunction(id=>CommandApp.scene.combat.target===id,enemies[1].id);
   await page.waitForFunction(()=>CommandApp.scene.combat.bridgeHUD.state.carrier.focusAutomatic||!CommandApp.scene.combat.bridgeHUD.state.carrier.focusCooldown,null,{timeout:15000});
   await clickBridge(page,'focus');await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.carriers.some(c=>c.focusTarget===id&&c.focusCooldown>5),enemies[1].id);result.droneOrders=true;
  }
  for(const size of [{width:1280,height:720},{width:1920,height:1080}]){await page.setViewportSize(size);await page.waitForTimeout(250);const panels=await bridgeLayout(page);assert.equal(panels.length,4);for(const panel of panels)for(const q of panel.corners)assert(q.x>=0&&q.y>=0&&q.x<=size.width&&q.y<=size.height,JSON.stringify({panel:panel.id,q,size}));await page.screenshot({path:path.join(out,ship.type+'-'+size.width+'.png')});}
  await page.setViewportSize({width:1600,height:1000});const before=await bridgeLayout(page),bounds=await page.locator('.aurora-game-frame').boundingBox();
  await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.45);await page.mouse.down({button:'middle'});await page.mouse.move(bounds.x+bounds.width*.5+110,bounds.y+bounds.height*.45+55,{steps:9});await page.mouse.up({button:'middle'});await page.waitForTimeout(150);
  const after=await bridgeLayout(page);assert(Math.abs(after[2].corners[0].x-before[2].corners[0].x)>50);await clickBridge(page,'target');await page.screenshot({path:path.join(out,ship.type+'-look.png')});await page.keyboard.press('KeyC');
  if(ship===carrier){await clickBridge(page,'auto',undefined,'helm');await page.waitForFunction(()=>CommandApp.scene.combat.walking);const z=await page.evaluate(()=>CommandApp.scene.combat.pose.eye[2]);await page.keyboard.down('KeyA');await page.waitForTimeout(650);await page.keyboard.up('KeyA');await page.keyboard.down('KeyS');await page.waitForTimeout(650);await page.keyboard.up('KeyS');assert(await page.evaluate(z=>CommandApp.scene.combat.pose.eye[2]>z+.7,z));await page.screenshot({path:path.join(out,'flagship-hall.png')});result.walk=true;}
 }
 // Standalone battle and read-only replay use the same physical controls.
 await page.route('**/api/star-map',route=>route.fulfill({json:{planets:[]}}));await page.goto(base+'/opendesign/mockups/galactic-command/battlefield-three.html?battle='+b.id);await page.waitForFunction(()=>window.flightController?.snapshot);
 await page.locator('#native-formation').selectOption(carrier.formation);await page.locator('#native-claim').click();await page.waitForFunction(id=>flightController.controlled===id,carrier.id);await page.waitForSelector('#bridge-flight-hud:not([hidden])');
 await clickBridge(page,'mode','assault');await clickBridge(page,'formation','screen');await page.waitForFunction(id=>flightController.snapshot.carriers.find(c=>c.shipId===id)?.formation==='screen',carrier.id);await page.screenshot({path:path.join(out,'flagship-standalone.png')});result.standalone=true;
 await page.route('**/api/replay/bridge-console-replay',route=>route.fulfill({json:replay}));await page.goto(base+'/opendesign/mockups/galactic-command/battlefield-three.html?replay=bridge-console-replay');await page.waitForFunction(()=>window.flightController?.replay);await page.evaluate(()=>{flightController.paused=true;flightController.seek(8);});await page.locator('#native-formation').selectOption(carrier.formation);await page.locator('#native-follow').click();
 await page.waitForSelector('#bridge-flight-hud:not([hidden])');if(await page.evaluate(()=>GalacticDemo.state.flight.external))await page.keyboard.press('KeyV');await page.waitForFunction(()=>GalacticDemo.state.flight.cameraBlend<.001&&GalacticDemo.renderer.bridgeConsoleLayout().length===4);const panels=await bridgeLayout(page);assert.equal(panels.length,4);const controls=panels.flatMap(p=>p.controls);assert(controls.some(h=>h.action==='select'));assert(!controls.some(h=>['mode','formation','focus','auto','fire','missile'].includes(h.action)));result.readonlyReplay=true;await page.screenshot({path:path.join(out,'flagship-replay.png')});
 for(const type of ['Battleship','Iron_Behemoth']){await page.goto(base+'/opendesign/mockups/galactic-command/hangar-three.html?ship='+type);await page.waitForSelector('#bridge-flight-hud:not([hidden])');if(await page.evaluate(()=>GalacticDemo.state.flight.external))await page.keyboard.press('KeyV');await page.waitForFunction(()=>GalacticDemo.renderer.bridgeConsoleLayout().length===4);await page.waitForTimeout(700);assert.equal(await page.locator('.flight-systems').isVisible(),false);await page.screenshot({path:path.join(out,type+'-practice.png')});}result.practice=true;
 assert.deepEqual(errors,[]);result.errors=errors;result.ok=true;
}catch(error){result.failure=error.message;result.url=page?.url();if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});throw error;}
finally{try{await browser?.close();}finally{try{if(server&&server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}finally{const resolved=fs.realpathSync(temp),root=fs.realpathSync(os.tmpdir());assert(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('bridge-console-test-'));fs.rmSync(resolved,{recursive:true,force:true});result.cleaned=!fs.existsSync(temp);result.errors=errors;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));}}}
console.log(JSON.stringify(result));
