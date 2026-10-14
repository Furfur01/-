import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],actions=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(r.url().endsWith('/api/action'))actions.push(r.postDataJSON());});
const ready=biome=>page.waitForFunction(type=>CommandApp.scene?.renderer?.ready&&(!type||CommandApp.scene.renderer.biome===type),biome,{timeout:60000});
try{
 await page.goto('http://127.0.0.1:8292/',{waitUntil:'networkidle'});await ready();
 assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 for(const biome of ['mercury','mars']){
  const id=await page.evaluate(type=>EmpireAPI.state.planets.find(p=>p.biome===type&&!p.moon).id,biome);
  await page.locator('#planet-picker').selectOption(id);await ready(biome);
  const initial=await page.evaluate(()=>CommandApp.scene.snapshot);
  if(biome==='mercury')assert(initial.features.volcanoes[0].radius>=3&&initial.features.volcanoes[0].height>=3.5);
  else assert.equal(initial.features.focusDirection.length,3);
  await page.locator('[data-aurora="environment"]').click();
  await page.evaluate(()=>CommandApp.scene.renderer._settleView());
  const focused=await page.evaluate(()=>CommandApp.scene.snapshot);
  assert.equal(focused.selected,null);assert(focused.camera.dist<40);
  assert(Object.values(focused.camera).every(Number.isFinite));
  for(let i=0;i<20;i++)await page.evaluate(()=>{const r=CommandApp.scene.renderer;r.home();r.focusEnvironment();r._advance(.1,false);});
  assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.bufferCount),initial.bufferCount);
  await page.locator('[data-aurora="home"]').click();
  const home=await page.evaluate(()=>CommandApp.scene.snapshot.targetCamera);
  assert(home.dist>=61);assert.equal(home.elevation,0);
  checks.push(`${biome}: feature shortcut, hero geometry, 20 focus/home cycles, stable GPU buffers`);
 }
 await page.setViewportSize({width:390,height:844});
 const controls=await page.locator('.aurora-game-controls').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,scroll:e.scrollWidth,width:e.clientWidth}));
 assert(controls.left>=0&&controls.right<=390&&controls.scroll<=controls.width+1);
 checks.push('390px viewport: all seven planet controls fit');
 assert.deepEqual(errors,[]);assert.deepEqual(actions,[]);
 const report={passed:true,checks,errors,economyActions:actions.length};
 const out=path.resolve('output/playwright/aurora-plateau-review');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'environment-functional.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
