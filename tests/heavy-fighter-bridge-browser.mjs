import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/heavy-fighter-bridge/after');
fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'heavy-fighter-bridge-test-'));
let server,browser,page;const errors=[],stages=[];
// Wrap the shipped renderer without replacing its math or simulation. Spending
// 8 ms between scenery and fleet submission makes independent clock reads visible.
const probeModule=`
import * as native from './map-fleet.bundle.js?probe-original';
export const {missionVisual,cruiseView}=native;
export async function createMapFleetRenderer(...args){
 const shared=await native.createMapFleetRenderer(...args),r=shared.renderer;
 const probe=window.fleetProbe={frames:[],delay:8};let frame,draws=[];
 const begin=shared.begin.bind(shared),battle=shared.battle.bind(shared),draw=r.drawMesh.bind(r);
 shared.begin=f=>{frame=f;return begin(f);};
 r.drawMesh=(mesh,model,...rest)=>{if(r.shipMeshes.includes(mesh))draws.push(Array.from(model));return draw(mesh,model,...rest);};
 shared.battle=(data,anchor,scale,owner,options)=>{
  draws=[];const start=performance.now();while(performance.now()-start<probe.delay){}
  const result=battle(data,anchor,scale,owner,options),view=options?.camera;
  if(view?.id===data.id){
   const ship=result.ships.find(s=>s.id===view.shipId),meta=data.metadata.find(m=>m.id===view.shipId);
   const pos=ship?.position.map((v,i)=>(v-anchor[i])/scale);
   const model=pos&&draws.find(m=>Math.hypot(...pos.map((v,i)=>v-m[12+i]))<.001);
   const local=v=>[0,4,8].map(j=>v.reduce((s,x,i)=>s+x*model[j+i],0));
   const row=data.ships.find(r=>r[0]===view.shipId),old=data.previous?.find(r=>r[0]===view.shipId)||row;
   const alpha=data.replay?1:Math.max(0,Math.min(1,(frame.sampleTime-data.received)/200));
   const expected=data.pilotRow?.[0]===view.shipId?data.pilotRow.slice(1,4):row?.slice(1,4).map((v,i)=>old[i+1]+(v-old[i+1])*alpha);
   probe.frames.push({mode:view.mode,shipId:view.shipId,type:meta?.type,pose:view.pose,
    age:performance.now()-view.entered,scale,tick:data.tick,
    sampleError:pos&&expected?Math.hypot(...pos.map((v,i)=>v-expected[i])):null,
    fullHull:!!model,eye:model?local(r.eye.map((v,i)=>v-model[12+i])):null,
    forward:model?local(r.cameraForward):null,up:model?local(r.cameraUp):null,
    received:data.received,sampleTime:frame.sampleTime});
   if(probe.frames.length>1800)probe.frames.shift();
  }
  return result;
 };
 return shared;
}`;
try{
 const w=createWorld(),p=createPlayer(w,'重型战机舰桥回归测试',Date.now(),()=>.5),home=w.planets[p.home];
 home.buildings.Shipyard=9;home.ships={Heavy_Fighter:12,Cruiser:3};home.resources=[1e6,1e6,1e6];
 ensureSystemNpcs(w,...home.position.slice(0,2));
 const target=Object.values(w.planets).find(t=>t.npcType==='outpost'&&t.position[1]===home.position[1]);
 const file=path.join(temp,'universe.json'),session=path.join(temp,'session.json');
 fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));
 const port=await freePort();assert(![8289,8390].includes(port));const base=`http://127.0.0.1:${port}`;
 server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});
 server.stderr.on('data',d=>errors.push(String(d)));
 const startup=Date.now()+15000;let ready=false;
 while(Date.now()<startup&&!ready){
  ready=await fetch(base+'/api/health').then(r=>r.json()).then(s=>s.isolated&&s.pid===server.pid).catch(()=>false);
  if(!ready)await new Promise(resolve=>setTimeout(resolve,100));
 }
 assert(ready,'Isolated test server must become ready');
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 page=await browser.newPage({viewport:{width:1600,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route(url=>url.pathname.endsWith('/map-fleet.bundle.js')&&!url.search,route=>route.fulfill({contentType:'text/javascript',body:probeModule}));
 await page.goto(base);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
 await page.evaluate(()=>CommandApp.go('fleet'));await page.locator('#dispatch-target').selectOption(target.id);
 for(const [type,count]of Object.entries(home.ships)){const input=page.locator(`[data-fleet-count="${type}"]`);await input.fill(String(count));await input.dispatchEvent('change');}
 await page.locator('#dispatch-form button[type="submit"],#dispatch-form button.primary').click();
 await page.waitForFunction(()=>EmpireAPI.state.missions.length>0);
 const mission=await page.evaluate(()=>EmpireAPI.state.missions[0].id),deadline=Date.now()+120000;
 while(Date.now()<deadline){
  const s=await page.evaluate(id=>{const n=CommandApp.scene.snapshot.navigation,m=EmpireAPI.state.missions.find(m=>m.id===id);return {phase:m?.phase,stage:n.flights.find(f=>f.id===id)?.stage,battle:n.battles.visible[0],camera:n.combatCamera};},mission);
  const stage=s.phase==='engaged'?'engaged':s.stage;
  if(stage&&!stages.includes(stage)){stages.push(stage);console.log(stage);}
  if(s.phase==='engaged'&&s.battle?.ships.length)break;
  await page.waitForTimeout(100);
 }
 assert(stages.includes('engaged'),'Ordinary dispatch must reach live combat');
 const id=await page.evaluate(()=>CommandApp.scene.combat.vessels.find(m=>m.type==='Heavy_Fighter').id);
 await page.locator('#map-combat-vessel').selectOption(String(id));
 await page.locator('#map-combat-camera').selectOption('follow');await page.waitForTimeout(1300);
 await page.screenshot({path:path.join(out,'follow.png')});
 await page.locator('#map-combat-camera').selectOption('bridge');await page.waitForFunction(id=>CommandApp.scene.combat.controlled===id,id);
 await page.waitForTimeout(150);await page.screenshot({path:path.join(out,'claim.png')});
 await page.keyboard.down('KeyW');await page.keyboard.down('KeyA');await page.keyboard.down('KeyQ');
 await page.waitForTimeout(900);await page.keyboard.up('KeyA');await page.keyboard.up('KeyQ');
 await page.waitForTimeout(1400);await page.keyboard.up('KeyW');
 await page.screenshot({path:path.join(out,'banked.png')});
 const rect=await page.locator('.aurora-game-frame').boundingBox();
 await page.mouse.move(rect.x+rect.width*.45,rect.y+rect.height*.5);await page.mouse.down({button:'middle'});
 await page.mouse.move(rect.x+rect.width*.63,rect.y+rect.height*.57,{steps:8});await page.mouse.up({button:'middle'});
 await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'look.png')});await page.keyboard.press('KeyC');
 await page.locator('#map-combat-pilot').click();await page.waitForTimeout(800);
 await page.locator('#map-combat-camera').selectOption('follow');await page.waitForTimeout(800);
 await page.locator('#map-combat-camera').selectOption('bridge');await page.waitForTimeout(500);
 const frame=page.frames().find(f=>f.url().includes('planet-construction-review'));
 const samples=await frame.evaluate(()=>window.fleetProbe.frames);
 const layout=JSON.parse(fs.readFileSync('opendesign/mockups/galactic-command/flight-fleet.json','utf8')).layouts.find(l=>l.id==='Heavy_Fighter');
 const seat=[layout.bridge[2],layout.bridge[1],-layout.bridge[0]],bridge=samples.filter(s=>s.mode==='bridge'&&s.type==='Heavy_Fighter');
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const maxSeatError=Math.max(...bridge.filter(s=>s.eye).map(s=>distance(s.eye,seat)));
 const centered=bridge.filter(s=>s.eye&&Math.abs(s.pose?.yaw||0)<1e-7&&Math.abs(s.pose?.pitch||0)<1e-7);
 const maxForwardError=Math.max(...centered.map(s=>distance(s.forward,[-1,0,0])));
 const sampled=samples.filter(s=>s.type==='Heavy_Fighter'&&s.sampleError!=null);
 const maxSampleError=Math.max(...sampled.map(s=>s.sampleError));
 const result={stages,bridgeFrames:bridge.length,fullHullFrames:bridge.filter(s=>s.fullHull).length,maxSeatError,maxForwardError,maxSampleError,errors,samples};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({...result,samples:undefined}));
 for(const stage of ['departing','warp-in','cruise','warp-out','engaged'])assert(stages.includes(stage),stage);
 assert(bridge.length>12);assert(bridge.every(s=>s.fullHull),'Every bridge frame must use the complete hull');
 assert(maxSeatError<.001,`Camera must remain attached to the seat, error ${maxSeatError}`);
 assert(maxForwardError<.0001,`Cabin and hull must share heading and bank, error ${maxForwardError}`);
 assert(maxSampleError<.001,`Camera and fleet must sample one time, error ${maxSampleError}`);
 assert.deepEqual(errors,[]);
}catch(error){if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});console.error(errors);throw error;}
finally{
 try{await browser?.close();}finally{
  try{if(server&&server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}
  finally{const resolved=fs.realpathSync(temp),root=fs.realpathSync(os.tmpdir());assert(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('heavy-fighter-bridge-test-'));fs.rmSync(resolved,{recursive:true,force:true});}
 }
}
