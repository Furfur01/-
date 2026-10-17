import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {createSpatialBattle,addSpatialFleet} from '../game/spatial-battle.mjs';
import {trialUnits as units} from '../game/battle-trial.mjs';
import {clickConsole} from './fighter-console-harness.mjs';
import {clickBridge} from './bridge-console-harness.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';
const out=path.resolve('output/playwright/cockpit-classes');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cockpit-classes-')),now=Date.now(),w=createWorld(now),p=createPlayer(w,'舰桥 HUD 隔离测试',now,()=>.5),home=w.planets[p.home];ensureSystemNpcs(w,...home.position.slice(0,2));
const target=Object.values(w.planets).find(t=>t.npcType==='cargo'&&t.position[1]===home.position[1]);
const battle=createSpatialBattle({id:'00000000-0000-4000-8000-000000000023',target:target.id,name:target.name,attacker:p.id,defender:null,start:now});
for(const side of ['attacker','defender'])addSpatialFleet(battle,{fleet:side==='attacker'?{Battleship:1,Light_Fighter:1,Heavy_Fighter:1,Reaper:1}:{Cruiser:5},owner:side==='attacker'?p.id:null,side},units);
for(const ship of battle.ships){ship.x=ship.side==='attacker'?-300:300;ship.z=(ship.id%3-1)*70;ship.y=ship.side==='attacker'?0:35;ship.hp=ship.maxHp=1e8;ship.shield=ship.maxShield=1e8;}w.battles={[battle.id]:battle};
const file=path.join(temp,'universe.json'),session=path.join(temp,'session.json');fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));const port=await freePort(),base=`http://127.0.0.1:${port}`,headers={'X-Empire-Client':'galactic-command'},server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});let browser;const errors=[],results=[];server.stderr.on('data',d=>errors.push(String(d)));
const snapshot=()=>fetch(base+'/api/battles/'+battle.id,{headers}).then(r=>r.json());
try{
 assert(![8289,8390].includes(port));let ready=false;const deadline=Date.now()+15000;
 while(!ready&&Date.now()<deadline){ready=await fetch(base+'/api/health').then(r=>r.json()).then(s=>s.isolated&&s.pid===server.pid).catch(()=>false);if(!ready)await new Promise(resolve=>setTimeout(resolve,100));}assert(ready,'Isolated test server must become ready');
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+'/?battle='+battle.id);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.combat.entry?.data);
 // The battle URL uses the supported entry path, including battles without a mission.
 await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.battles.visible.some(b=>b.ships.length));
 for(const [type,kind]of [['Light_Fighter','fighter'],['Heavy_Fighter','fighter'],['Battleship','horizon'],['Reaper','bastion']]){
  const id=battle.ships.find(s=>s.type===type&&s.owner===p.id).id;
  await page.locator('#map-combat-vessel').selectOption(String(id));await page.waitForFunction(id=>CommandApp.scene.combat.controlled===id,id);await page.waitForTimeout(1100);
  assert.equal(await page.locator('#map-pilot-hud').getAttribute('data-kind'),kind);
  const intentBefore=await page.evaluate(()=>({heading:CommandApp.scene.combat.heading,elevation:CommandApp.scene.combat.elevation}));
  const cabinBounds=await page.locator('.aurora-game-frame').boundingBox();
  await page.mouse.move(cabinBounds.x+cabinBounds.width*.42,cabinBounds.y+cabinBounds.height*.5);
  await page.mouse.down({button:'middle'});await page.mouse.move(cabinBounds.x+cabinBounds.width*.65,cabinBounds.y+cabinBounds.height*.6,{steps:12});await page.mouse.up({button:'middle'});
  const looking=await page.evaluate(()=>({mode:CommandApp.scene.snapshot.navigation.combatCamera.mode,pose:CommandApp.scene.combat.pose,heading:CommandApp.scene.combat.heading,elevation:CommandApp.scene.combat.elevation}));
  assert.equal(looking.mode,'bridge');assert(Math.abs(looking.pose.yaw)>.3);assert(Math.abs(looking.pose.pitch)>.1);assert.equal(looking.heading,intentBefore.heading);assert.equal(looking.elevation,intentBefore.elevation);
  await page.keyboard.press('KeyC');assert.equal(await page.evaluate(()=>CommandApp.scene.combat.pose.yaw),0);assert.equal(await page.evaluate(()=>CommandApp.scene.combat.pose.pitch),0);
  const start=(await snapshot()).ships.find(s=>s[0]===id);
  await page.keyboard.down('KeyW');await page.keyboard.down('KeyA');await page.keyboard.down('KeyQ');await page.waitForTimeout(650);await page.keyboard.up('KeyW');await page.keyboard.up('KeyA');await page.keyboard.up('KeyQ');
  const after=await snapshot(),row=after.ships.find(s=>s[0]===id),control=after.controls[p.id];assert(control?.seq>1);assert.equal(control.input.roll,kind==='fighter'?-1:0);
  if(kind==='fighter'){assert(Math.abs(row[12]-start[12])>.3);assert(row[5]>start[5]+.2);}else{assert.equal(row[12],0);assert(Math.abs(row[5]-start[5])<.001);}
  if(kind==='fighter'){await clickConsole(page,'select',battle.ships.find(s=>s.side==='defender').id,'contacts');await clickConsole(page,'lock');}else{await clickBridge(page,'select',battle.ships.find(s=>s.side==='defender').id,'contacts');await clickBridge(page,'lock');}await page.waitForTimeout(400);assert((await snapshot()).controls[p.id].input.lock);
  await page.screenshot({path:path.join(out,kind+'.png')});
  const poseBefore=await page.evaluate(()=>CommandApp.scene.snapshot.navigation.combatCamera.pose);
  const released=page.waitForResponse(r=>r.url().endsWith('/control')&&r.request().postDataJSON()?.type==='release');await page.keyboard.press('KeyG');await released;await page.waitForFunction(()=>CommandApp.scene.combat.controlled==null);assert(!(await snapshot()).controls[p.id]);
  if(kind==='bastion'){
   await page.waitForFunction(()=>CommandApp.scene.combat.walking);await page.keyboard.down('KeyA');await page.waitForTimeout(650);await page.keyboard.up('KeyA');await page.keyboard.down('KeyS');await page.waitForTimeout(1100);await page.keyboard.up('KeyS');
   const walked=await page.evaluate(()=>CommandApp.scene.snapshot.navigation.combatCamera.pose);assert(walked.eye[2]>poseBefore.eye[2]+1);assert(!(await snapshot()).controls[p.id]);
   const frame=page.frames().find(f=>f.url().includes('planet-construction-review'));const bounds=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.move(bounds.x+bounds.width*.45,bounds.y+bounds.height*.6);await page.mouse.down({button:'right'});await page.mouse.move(bounds.x+bounds.width*.85,bounds.y+bounds.height*.6,{steps:12});await page.mouse.up({button:'right'});await page.waitForTimeout(500);
   assert(Math.abs(await page.evaluate(()=>CommandApp.scene.combat.pose.yaw))>.5);await page.screenshot({path:path.join(out,'bastion-walk.png')});
   await page.keyboard.press('KeyC');assert.deepEqual(await page.evaluate(()=>CommandApp.scene.combat.pose.eye),[0,3.75,2]);
   await page.locator('#map-combat-pilot').click();await page.waitForFunction(()=>CommandApp.scene.combat.controlled!=null);assert.equal(await page.evaluate(()=>CommandApp.scene.combat.walking),false);await page.locator('#map-combat-pilot').click();const bounds2=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.click(bounds2.x+bounds2.width*.45,bounds2.y+bounds2.height*.55);assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.combatCamera.mode),'bridge');
  }
  results.push({type,kind,manual:true,middleLook:true,seatReset:true,locked:true,autoReleased:true,walk:kind==='bastion'});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results));
}catch(error){console.error('Browser errors:',errors);throw error;}finally{
 try{await browser?.close();}finally{
  try{if(server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}
  finally{const resolved=fs.realpathSync(temp);assert(resolved.startsWith(fs.realpathSync(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('cockpit-classes-'));fs.rmSync(resolved,{recursive:true,force:true});}
 }
}


