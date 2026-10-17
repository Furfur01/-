import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';

// An ordinary dispatch and server clock, in an isolated save. No seek or time override.
const out=path.resolve('output/playwright/fleet-journey');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fleet-journey-')),w=createWorld(),p=createPlayer(w,'连续航程验收',Date.now(),()=>.5),home=w.planets[p.home];
home.buildings.Shipyard=9;home.ships={Battleship:3,Cruiser:4,Heavy_Fighter:6};home.resources=[1e6,1e6,1e6];ensureSystemNpcs(w,...home.position.slice(0,2));
const target=Object.values(w.planets).find(t=>t.npcType==='outpost'&&t.position[1]===home.position[1]);
const file=path.join(temp,'universe.json');fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(file+'.session',JSON.stringify({cookie:`empire=${p.id}`}));
const port=await freePort(),base=`http://127.0.0.1:${port}`,headers={'X-Empire-Client':'galactic-command'},server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:file+'.session',EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});
let browser,context;const errors=[],stages=[],samples=[];server.stderr.on('data',d=>errors.push(String(d)));
try{
 await once(server.stdout,'data');browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});context=await browser.newContext({viewport:{width:1600,height:1000},recordVideo:{dir:out,size:{width:1280,height:800}}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
 await page.evaluate(()=>CommandApp.go('fleet'));await page.locator('#dispatch-target').selectOption(target.id);
 for(const [type,count]of Object.entries(home.ships)){await page.locator(`[data-fleet-count="${type}"]`).fill(String(count));await page.locator(`[data-fleet-count="${type}"]`).dispatchEvent('change');}
 await page.locator('#dispatch-form button[type="submit"],#dispatch-form button.primary').click();
 await page.waitForFunction(()=>EmpireAPI.state.missions.length>0);
 const missionId=await page.evaluate(()=>EmpireAPI.state.missions[0].id),deadline=Date.now()+200000;let midBattle=false,piloted=false,finished=false,firstBattlePosition=null,maxMovement=0,maxEffects=0,battleId;
 while(Date.now()<deadline){
  const s=await page.evaluate(id=>{const n=CommandApp.scene.snapshot.navigation,m=EmpireAPI.state.missions.find(m=>m.id===id);return {phase:m?.phase,battleId:m?.battleId,stage:n.flights.find(f=>f.id===id)?.stage,models:n.flights.find(f=>f.id===id)?.models,follow:n.missionFollow,camera:n.combatCamera,battle:n.battles.visible[0],status:CommandApp.scene.combat.status,frame:n.frames};},missionId);
  samples.push({at:Date.now(),phase:s.phase,stage:s.stage,frame:s.frame,camera:s.camera,models:s.models});
  const stage=s.phase==='engaged'?'engaged':s.phase?`${s.phase}:${s.stage}`:'returned';
  if(s.stage||s.phase==='engaged'||!s.phase){if(!stages.includes(stage)){stages.push(stage);await page.screenshot({path:path.join(out,stage.replace(':','-')+'.png')});console.log(stage);}}
  if(s.phase==='engaged'){
   battleId=s.battleId;if(!midBattle&&s.status?.time>35){await page.screenshot({path:path.join(out,'battle-close.png')});await page.locator('#map-combat-camera').selectOption('bridge');await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'bridge-combat.png')});await page.locator('#map-combat-camera').selectOption('follow');midBattle=true;}
   if(s.battle?.ships.length){const ship=s.battle.ships.find(s=>s.side==='attacker');if(!firstBattlePosition)firstBattlePosition=ship.position;else maxMovement=Math.max(maxMovement,Math.hypot(...ship.position.map((v,i)=>v-firstBattlePosition[i])));maxEffects=Math.max(maxEffects,s.battle.effects);}
   if(!piloted&&s.status?.time>8&&s.battle?.ships.length){
    assert(s.status&&!s.status.replay,'Battle HUD must activate without clicking enter battlefield');assert.equal(s.camera?.id,battleId);assert.equal(s.camera.mode,'follow');
    await page.locator('#map-combat-camera').selectOption('bridge');await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.combatCamera?.mode==='bridge');
    await page.waitForTimeout(700);await page.screenshot({path:path.join(out,'bridge.png')});
    assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.battles.visible[0]?.bridgeVessel),s.status.selected);
    await page.locator('#map-combat-pilot').click();await page.waitForFunction(()=>CommandApp.scene.combat.controlled!=null);
    await page.keyboard.down('KeyW');await page.keyboard.down('Space');await page.waitForTimeout(800);await page.keyboard.up('KeyW');await page.keyboard.up('Space');
    const owned=await fetch(`${base}/api/battles/${battleId}`,{headers}).then(r=>r.json());assert.equal(owned.controls[p.id]?.shipId,s.status.selected);assert(owned.controls[p.id].seq>=1);
    await page.screenshot({path:path.join(out,'piloting.png')});await page.getByRole('button',{name:'交还 AI',exact:true}).click();await page.waitForFunction(()=>CommandApp.scene.combat.controlled==null);
    const released=await fetch(`${base}/api/battles/${battleId}`,{headers}).then(r=>r.json());assert(!released.controls[p.id]);
    await page.locator('#map-combat-pilot').click();await page.waitForFunction(()=>CommandApp.scene.combat.controlled!=null);await page.evaluate(()=>CommandApp.go('fleet'));await page.waitForFunction(()=>CommandApp.scene.combat.controlled==null);const hiddenRelease=await fetch(`${base}/api/battles/${battleId}`,{headers}).then(r=>r.json());assert(!hiddenRelease.controls[p.id]);await page.evaluate(()=>CommandApp.go('system',{keepCamera:true}));await page.locator('#map-combat-camera').selectOption('follow');const zoom=await page.evaluate(()=>{const r=CommandApp.scene.renderer;r._advance(2);const before=CommandApp.scene.snapshot.navigation.camera.dist;r.zoomNavigation(-200);r._advance(2);return {before,after:CommandApp.scene.snapshot.navigation.camera.dist};});assert(Math.abs(zoom.after-zoom.before)<zoom.before*.01,'Wheel must not zoom out of fleet follow');await page.locator('#map-combat-camera').selectOption('follow');piloted=true;
   }
  }
  if(!s.phase){finished=true;break;}await page.waitForTimeout(180);
 }
 assert(finished,'The real mission must finish and return');assert(piloted);assert(maxMovement>.05,'Ships must keep moving after arrival');assert(maxEffects>0,'Native combat effects must appear without opening a separate battlefield');
 for(const phase of ['outbound','return'])for(const stage of ['departing','warp-in','cruise','warp-out'])assert(stages.includes(`${phase}:${stage}`),`${phase}:${stage} must be visible`);
 const state=await fetch(base+'/api/state',{headers}).then(r=>r.json()),report=state.reports.find(r=>r.battleId===battleId&&r.type==='battle');assert(report);assert(state.reports.some(r=>r.type==='fleet'&&r.missionId===missionId));assert(report.deliveries.every(d=>d.status==='delivered'));
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({stages,piloted,maxMovement,maxEffects,report:{winner:report.winner,duration:report.duration,losses:report.losses},samples,errors},null,2));console.log('Continuous real-time journey, automatic combat, bridge camera, authoritative piloting and return verified.');
}finally{await context?.close();await browser?.close();server.stdin.end();await once(server,'exit');fs.rmSync(temp,{recursive:true,force:true});}
