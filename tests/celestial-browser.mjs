import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import isolatedBrowserUrl from './isolated-browser-url.cjs';
const testBase=await isolatedBrowserUrl();
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='output/playwright/celestial';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),result={errors:[],types:[],requests:[]};
page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/INVALID|GL_/.test(m.text()))result.errors.push(m.text());});page.on('request',r=>{if(r.url().endsWith('/api/action'))result.requests.push(r.postData());});
const get=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
try{
 await page.goto(testBase);await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled);
 await page.evaluate(()=>{window.__frame=CommandApp.scene.frame;window.__canvas=__frame.contentWindow.document.querySelector('#world');window.__context=__canvas.getContext('webgl');});
 await page.waitForTimeout(1000);await page.screenshot({path:out+'/galaxy.png'});
 await page.evaluate(()=>CommandApp.scene.renderer.focusSystem(16));await page.waitForTimeout(2400);await page.screenshot({path:out+'/system.png'});
 const initial=await get(),box=await page.locator('.aurora-game-frame').boundingBox();
 const target=initial.targets.find(t=>t.type==='planet'&&t.x>box.width*.3&&t.x<box.width*.7&&t.y>150&&t.y<box.height-150);
 assert(target,'visible planet for actual pointer click');await page.mouse.click(box.x+target.x,box.y+target.y);await page.waitForTimeout(1700);
 const selected=await get();assert.equal(selected.selectedPlanetId,target.id);assert(Math.abs(selected.goal.dist-initial.camera.dist)<.02);const centered=selected.targets.find(t=>t.id===target.id);assert(Math.abs(centered.x-box.width/2)<3&&Math.abs(centered.y-box.height/2)<3);
 for(const type of ['terrestrial','mercury','mars','gas']){
  const id=await page.evaluate(type=>CommandApp.scene.targets.find(p=>p.position[1]===16&&p.biome===type&&p.kind!=='belt')?.key,type);assert(id,type);
  await page.evaluate(id=>CommandApp.scene.enterPlanet(id),id);await page.waitForFunction(type=>CommandApp.scene.snapshot.navigation.visibleDetails.some(d=>d.biome===type&&d.weight>.99),type,{timeout:40000});await page.waitForTimeout(600);
  await page.screenshot({path:out+'/'+type+'-high.png'});
  const b=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
  for(let i=0;i<5;i++){await page.mouse.wheel(0,200);await page.waitForTimeout(100);}await page.waitForTimeout(800);await page.screenshot({path:out+'/'+type+'-orbit.png'});
  const n=await get();result.types.push({type,loads:n.detailLoads,bufferCount:n.bufferCount});
 }
 await page.evaluate(()=>CommandApp.scene.renderer.focusSystem(16));await page.waitForTimeout(2200);
 const star=(await get()).targets.find(t=>t.type==='system'&&t.id===16);await page.mouse.click(box.x+star.x,box.y+star.y);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);for(let i=0;i<4;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(100);}await page.waitForTimeout(1000);await page.screenshot({path:out+'/star.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>CommandApp.scene.showSystem());await page.waitForTimeout(2200);await page.screenshot({path:out+'/mobile.png'});
 const n=await get(),t=n.frameTimes.slice(-100).sort((a,b)=>a-b);result.frameMs={median:t[Math.floor(t.length*.5)],p95:t[Math.floor(t.length*.95)]};
 assert(await page.evaluate(()=>CommandApp.scene.frame===__frame&&__frame.contentWindow.document.querySelector('#world')===__canvas&&__canvas.getContext('webgl')===__context));assert.deepEqual(result.errors,[]);assert.deepEqual(result.requests,[]);result.passed=true;
}catch(e){result.failure=e.stack;throw e;}finally{fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify(result,null,2));}
