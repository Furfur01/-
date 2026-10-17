import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import isolatedBrowserUrl from './isolated-browser-url.cjs';
const testBase=await isolatedBrowserUrl();
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='output/playwright/navigation-motion';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:out+'/video',size:{width:1440,height:1000}}});
const page=await context.newPage(),report={errors:[],actions:[],lod:[],animations:[]};
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/INVALID|GL_/.test(m.text()))report.errors.push(m.text());});page.on('request',r=>{if(r.url().endsWith('/api/action'))report.actions.push(r.postData());});
const get=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
async function wheel(delta){await page.mouse.wheel(0,delta);await page.waitForTimeout(140);}
try{
 await page.goto(testBase);await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled);
 await page.evaluate(()=>{window.__frame=CommandApp.scene.frame;window.__canvas=__frame.contentWindow.document.querySelector('#world');window.__gl=__canvas.getContext('webgl');});
 await page.evaluate(()=>CommandApp.scene.renderer.focusSystem(16));await page.waitForTimeout(1800);
 const box=await page.locator('.aurora-game-frame').boundingBox(),initial=await get();
 const target=initial.targets.find(t=>t.type==='planet'&&Math.abs(t.x-box.width/2)>80&&t.x>400&&t.x<1000&&t.y>250&&t.y<750);assert(target);
 await page.mouse.click(box.x+target.x,box.y+target.y);
 const center=(await get()).goal.center;await wheel(-200);
 for(let i=0;i<7;i++){await wheel(-200);const n=await get();assert.equal(n.selectedPlanetId,target.id);assert(Math.hypot(...n.camera.center.map((v,i)=>v-center[i]))<.00001);}
 report.anchor={selected:target.id,center,passed:true};await page.screenshot({path:out+'/selected-zoom.png'});
 for(const biome of ['terrestrial','mercury','mars','gas']){
  const id=await page.evaluate(b=>CommandApp.scene.targets.find(p=>p.position[1]===16&&p.biome===b&&p.kind!=='belt')?.key,biome);
  await page.evaluate(id=>CommandApp.scene.enterPlanet(id),id);
  await page.waitForFunction(id=>CommandApp.scene.snapshot.navigation.visibleDetails.some(d=>d.key===id&&d.weight>.99&&d.commandCount>0),id,{timeout:40000});
  await page.waitForTimeout(700);const before=await get();await page.screenshot({path:out+'/'+biome+'-rotation-a.png'});await page.waitForTimeout(2200);const after=await get();await page.screenshot({path:out+'/'+biome+'-rotation-b.png'});
  const a=before.visibleDetails.find(d=>d.key===id),b=after.visibleDetails.find(d=>d.key===id);assert(b.rotation>a.rotation+.025);assert(Math.abs(after.camera.yaw-before.camera.yaw)<.001);report.animations.push({biome,seconds:after.time-before.time,rotation:b.rotation-a.rotation});
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  for(let i=0;i<4;i++)await wheel(200);await page.waitForTimeout(700);
  const samples=[];
  for(const delta of [-70,-70,-70,70,70,70]){await wheel(delta);await page.waitForTimeout(220);const n=await get(),d=n.visibleDetails.find(d=>d.key===id);assert(d&&d.commandCount>0);samples.push({weight:d.weight,radius:d.projectedRadius,rotation:d.rotation});}
  assert(samples.some(s=>s.weight>0&&s.weight<1));assert(samples[2].weight>samples[0].weight);assert(samples[5].weight<samples[2].weight);report.lod.push({biome,samples});await page.screenshot({path:out+'/'+biome+'-blend.png'});
 }
 await page.evaluate(()=>CommandApp.scene.renderer.focusSystem(16));await page.waitForTimeout(1800);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);for(let i=0;i<4;i++)await wheel(-200);await page.waitForTimeout(600);
 await page.screenshot({path:out+'/solar-wind-a.png'});const time=(await get()).time;await page.waitForTimeout(3000);await page.screenshot({path:out+'/solar-wind-b.png'});assert((await get()).time>time+2);
 assert(!fs.readFileSync(out+'/solar-wind-a.png').equals(fs.readFileSync(out+'/solar-wind-b.png')));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>CommandApp.scene.showSystem());await page.waitForTimeout(1800);await page.screenshot({path:out+'/mobile.png'});
 assert(await page.evaluate(()=>CommandApp.scene.frame===__frame&&__frame.contentWindow.document.querySelector('#world')===__canvas&&__canvas.getContext('webgl')===__gl));assert.deepEqual(report.errors,[]);assert.deepEqual(report.actions,[]);report.passed=true;
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));await context.close();await browser.close();console.log(JSON.stringify(report,null,2));}
