import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
// Run only against the named disposable fixture server, never the user's port.
const base='http://127.0.0.1:8292/',out=path.resolve('output/playwright/aurora-integration');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],actions=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/api/action'))actions.push(r.postDataJSON());});
const ready=()=>page.waitForFunction(()=>CommandApp.scene?.renderer?.ready&&CommandApp.scene.snapshot?.districts.every(d=>d.buildings.every(b=>b.gameId)),null,{timeout:60000});
const scene=fn=>page.evaluate(fn);
try{
 await page.goto(base,{waitUntil:'networkidle'});await ready();
 assert.equal(await scene(()=>EmpireAPI.state.player.name),'星球接入验收','test must use the disposable fixture');
 for(const biome of ['terrestrial','mercury','mars','gas']){
  const planetId=await page.evaluate(type=>EmpireAPI.state.planets.find(p=>p.biome===type&&!p.moon).id,biome);
  await page.locator('#planet-picker').selectOption(planetId);await page.waitForFunction(type=>CommandApp.scene?.renderer?.ready&&CommandApp.scene?.renderer?.biome===type,biome,{timeout:60000});await ready();
  const data=await scene(()=>({p:EmpireAPI.planet,s:CommandApp.scene.snapshot}));
  const ids=new Set(data.s.districts.flatMap(d=>d.buildings.map(b=>b.gameId)));assert.equal(ids.size,14);
  for(const d of data.s.districts)for(const b of d.buildings)assert.equal(b.level,data.p.buildings[b.gameId]||0);
  const rates=data.s.districts.filter(d=>['metal','crystal','gas'].includes(d.type)).map(d=>({type:d.type,state:d.buildings[0].state,rate:d.buildings[0].operationRate}));
  if(biome!=='terrestrial')assert.equal(rates.filter(r=>r.state==='active').length,1,'only native resource can animate production');
  assert.equal(data.s.elevator.buildProgress,0,'an empty ship queue has no invented ship assembly');
  checks.push(biome+': actual building levels, 14 canonical slots, native-only extraction, empty orbital dock');
 }
 const earth=await scene(()=>EmpireAPI.state.planets.find(p=>p.biome==='terrestrial'&&!p.moon).id);await page.locator('#planet-picker').selectOption(earth);await ready();
 await scene(()=>CommandApp.go('buildings'));await page.locator('#page-body [data-building="Metal_Mine"]').click();
 assert.equal(await page.locator('#detail-modal').evaluate(e=>e.matches(':modal')),false);
 await page.locator('#close-modal').click();
 const built=page.waitForResponse(r=>r.url().endsWith('/api/action'));await page.locator('#page-body [data-build="Metal_Mine"]').click();const reply=await built;assert.equal(reply.status(),200);
 await page.waitForFunction(()=>CommandApp.scene.snapshot.districts.find(d=>d.type==='metal').buildings.every(b=>b.state==='upgrade'));
 const during=await scene(()=>({q:EmpireAPI.planet.buildQueue,s:CommandApp.scene.snapshot.districts.find(d=>d.type==='metal')}));
 assert.equal(during.q.id,'Metal_Mine');assert(during.s.buildings.every(b=>b.progress>=0&&b.progress<=1));
 const cancelled=page.waitForResponse(r=>r.url().endsWith('/api/action'));await page.locator('#page-body [data-cancel="build"]').click();assert.equal((await cancelled).status(),200);
 await page.waitForFunction(()=>CommandApp.scene.snapshot.districts.find(d=>d.type==='metal').buildings.every(b=>b.state==='active'));
 checks.push('real build/cancel changes both wings of one resource complex, with server progress and no second warehouse action');
 await scene(()=>CommandApp.go('shipyard'));
 const ship=page.waitForResponse(r=>r.url().endsWith('/api/action'));await page.locator('#page-body [data-ship="Light_Fighter"]').click();assert.equal((await ship).status(),200);
 await page.waitForFunction(()=>CommandApp.scene.snapshot.elevator.buildProgress>0&&CommandApp.scene.snapshot.elevator.arms.some(a=>a.welding));
 checks.push('real ship queue enables orbital assembly and welding');
 const count=actions.length;
 await scene(()=>{const p=structuredClone(EmpireAPI.planet);p.economy.ratio=.17;CommandApp.scene.renderer.applyPlanet(p,EmpireAPI.catalog,EmpireAPI.now);CommandApp.scene.renderer._advance(2,false);});
 const low=await scene(()=>CommandApp.scene.snapshot.districts.find(d=>d.type==='gas'));assert.equal(low.buildings[0].operationRate,.17);assert.equal(low.buildings[0].state,'lowpower');
 await scene(()=>{const p=structuredClone(EmpireAPI.planet);p.resources=[...p.economy.capacity];CommandApp.scene.renderer.applyPlanet(p,EmpireAPI.catalog,EmpireAPI.now);});
 const full=await scene(()=>CommandApp.scene.snapshot.districts.filter(d=>['metal','crystal','gas'].includes(d.type)));assert(full.every(d=>d.buildings.every(b=>b.state==='full')));
 assert.equal(actions.length,count,'visual state changes must never send an economy action');await scene(()=>CommandApp.scene.sync());
 checks.push('actual efficiency ratio and capacity drive renderer; visual controls make no economy writes');
 const pre=await scene(()=>CommandApp.scene.snapshot.bufferCount);for(let i=0;i<20;i++)await scene(()=>{CommandApp.scene.selectBuilding('Crystal_Mine');CommandApp.scene.orbit();});
 assert.equal(await scene(()=>CommandApp.scene.snapshot.bufferCount),pre);checks.push('20 focus/orbit round trips retain GPU buffer count');
 await scene(()=>CommandApp.go('fleet'));const frameNo=await scene(()=>CommandApp.scene.snapshot.frameNo);await page.waitForTimeout(400);assert.equal(await scene(()=>CommandApp.scene.snapshot.frameNo),frameNo);
 await scene(()=>CommandApp.go('home'));await page.waitForFunction(n=>CommandApp.scene.snapshot.frameNo>n,frameNo);checks.push('hidden scene stops rendering and resumes on return');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'integration-functional.json'),JSON.stringify({passed:true,checks,errors,actions},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
}finally{await browser.close();}
