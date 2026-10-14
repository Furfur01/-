import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],actions=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/api/action'))actions.push(r.postDataJSON());});
const system=()=>page.waitForFunction(()=>CommandApp.page==='system'&&CommandApp.scene.snapshot?.navigation?.level==='system',null,{timeout:30000});
try{
 await page.goto('http://127.0.0.1:8292/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>CommandApp.scene?.renderer?.ready,null,{timeout:60000});
 assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 const planets=await page.evaluate(()=>EmpireAPI.state.planets.map(p=>({id:p.id,biome:p.biome,moon:p.moon})));
 for(const p of planets.filter(p=>!p.moon)){
  await page.locator('.bottom-bar [data-page="system"]').click();await system();
  const selected=page.locator(`[data-map-select="${p.id}"]`);await selected.click();
  await page.locator(`[data-map-enter="${p.id}"]`).click();
  await page.waitForFunction(({id,biome})=>EmpireAPI.planet.id===id&&CommandApp.scene.renderer?.ready&&CommandApp.scene.renderer.biome===biome&&CommandApp.scene.snapshot.navigation.level==='planet'&&document.querySelectorAll('.aurora-game-frame').length===1,p,{timeout:60000});
  checks.push(`${p.biome}: solar list -> owned colony, one live iframe after handoff`);
 }
 await page.locator('.bottom-bar [data-page="system"]').click();await system();
 const before=await page.evaluate(()=>EmpireAPI.planet.id);
 const enemy=await page.evaluate(()=>EmpireAPI.state.map.find(p=>p.owner&&p.owner!==EmpireAPI.state.player.id&&!p.moon));
 assert(enemy,'fixture contains an enemy');await page.locator(`[data-map-select="${enemy.id}"]`).click();
 assert.equal(await page.locator('#system-target [data-map-enter]').count(),0);
 assert((await page.locator('#system-target').innerText()).includes('尚未侦察'));
 await page.evaluate(id=>CommandApp.scene.enterPlanet(id),enemy.id);await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>EmpireAPI.planet.id),before);
 assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.level),'system');
 checks.push('enemy remains public solar target; no private colony renderer or building action');
 await page.locator('.solar-heading [data-page="galaxy"]').click();
 await page.waitForFunction(()=>document.querySelector('#astral').contentWindow.ASTRAL?.state.level==='galaxy',null,{timeout:60000});
 const map=page.frameLocator('#astral');await map.locator('#primary-action').click();await system();
 checks.push('galaxy -> selected system enters unified solar canvas');
 const moon=planets.find(p=>p.moon);
 if(moon){
  await page.locator('#planet-picker').selectOption(moon.id);await page.waitForFunction(()=>CommandApp.scene.appearance==='moon'&&CommandApp.scene.moon);
  await page.locator('.bottom-bar [data-page="system"]').click();await system();
  await page.waitForTimeout(1600);assert.equal(await page.evaluate(()=>CommandApp.scene.host.hidden),false);
  await page.locator(`[data-map-select="${moon.id}"]`).click();await page.locator(`[data-map-enter="${moon.id}"]`).click();
  assert.equal(await page.evaluate(()=>CommandApp.scene.moonHost.hidden),false);
  checks.push('Moon retains its surface and can return to unified solar navigation');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(actions,[]);
 const result={passed:true,checks,errors,actions};fs.mkdirSync('output/playwright/aurora-navigation',{recursive:true});fs.writeFileSync('output/playwright/aurora-navigation/selection-functional.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
