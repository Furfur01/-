import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='output/playwright/universe-seamless';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:out+'/video',size:{width:1440,height:1000}}});
const page=await context.newPage(),result={errors:[],checks:[],types:[],cycles:[],actions:[]};
page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/INVALID|GL_/.test(m.text()))result.errors.push(m.text());});page.on('request',r=>{if(r.url().endsWith('/api/action'))result.actions.push(r.postData());});
const get=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
const settle=()=>page.waitForFunction(()=>{const n=CommandApp.scene.snapshot.navigation;return Math.abs(Math.log(n.camera.dist/n.goal.dist))<.002&&Math.hypot(...n.camera.center.map((v,i)=>v-n.goal.center[i]))<.02;});
try{
 await page.goto(process.env.UNIVERSE_TEST_URL||'http://127.0.0.1:8297');await page.waitForFunction(()=>CommandApp?.scene?.snapshot?.navigation?.enabled);assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 await page.evaluate(()=>{window.__frame=CommandApp.scene.frame;const w=__frame.contentWindow;w.__canvas=w.document.querySelector('#world');w.__context=w.__canvas.getContext('webgl');});
 assert.equal((await get()).systemCount,499);assert.equal((await get()).level,'galaxy');await page.screenshot({path:out+'/galaxy-desktop.png'});
 const colonies=await page.evaluate(()=>EmpireAPI.state.planets.map(p=>({id:p.id,type:p.moon?'moon':p.biome})));
 for(const p of colonies){
  await page.evaluate(id=>CommandApp.scene.enterPlanet(id),p.id);await page.waitForTimeout(3200);
  await page.waitForFunction(type=>CommandApp.scene.snapshot.navigation.visibleDetails.some(d=>d.biome===type&&d.weight>.99&&d.commandCount>0),p.type);
  const n=await get();await page.screenshot({path:out+'/'+p.type+'-desktop.png'});result.types.push({type:p.type,level:n.level,loads:n.detailLoads,details:n.visibleDetails,frames:n.frames});assert.equal(n.level,'planet');
 }
 const own=await page.evaluate(()=>EmpireAPI.planet.id);
 const foreign=await page.evaluate(()=>CommandApp.scene.targets.find(p=>p.position[1]===16&&p.owner!==EmpireAPI.state.player.id&&!p.moon&&p.kind!=='belt').key);
 await page.evaluate(id=>CommandApp.scene.enterPlanet(id),foreign);await page.waitForTimeout(2500);assert.equal(await page.evaluate(()=>EmpireAPI.planet.id),own);assert.equal((await get()).visibleDetails.find(d=>d.key===foreign).buildings,0);await page.screenshot({path:out+'/foreign-desktop.png'});
 // Test real wheel reversal and a resting intermediate scale.
 const box=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.move(box.x+box.width*.53,box.y+box.height*.5);await page.mouse.wheel(0,130);await page.waitForTimeout(100);await page.mouse.wheel(0,-65);await page.waitForTimeout(1500);const stop=await get();await page.waitForTimeout(500);const still=await get();assert(Math.abs(stop.camera.dist-still.camera.dist)<.01);
 for(let i=0;i<30;i++){await page.evaluate(id=>CommandApp.scene.enterPlanet(id),colonies[i%colonies.length].id);await settle();assert.equal((await get()).level,'planet');await page.evaluate(()=>CommandApp.scene.showSystem());await settle();assert.equal((await get()).level,'system');result.cycles.push({cycle:i+1,buffers:(await get()).bufferCount});}
 assert.equal(new Set(result.cycles.map(c=>c.buffers)).size,1);
 assert(await page.evaluate(()=>CommandApp.scene.frame===__frame&&__frame.contentWindow.document.querySelector('#world')===__frame.contentWindow.__canvas&&__frame.contentWindow.__canvas.getContext('webgl')===__frame.contentWindow.__context));
 assert.equal(await page.locator('#astral').count(),0);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>CommandApp.scene.showGalaxy());await page.waitForTimeout(2200);await page.screenshot({path:out+'/galaxy-mobile.png'});
 await page.evaluate(id=>CommandApp.scene.enterPlanet(id),colonies[0].id);await page.waitForTimeout(2300);await page.screenshot({path:out+'/planet-mobile.png'});
 const n=await get(),t=n.frameTimes.filter(t=>t>0).sort((a,b)=>a-b);result.performance={medianMs:t[Math.floor(t.length*.5)],p95Ms:t[Math.floor(t.length*.95)],maxMs:Math.max(...t),detailLoads:n.detailLoads,buffers:n.bufferCount};
 result.checks.push('499 fixed systems; default galaxy; all five body types','Foreign viewing retains operating colony','Wheel reversal settles at intermediate scale','30 round trips: same frame, canvas and context','Desktop and mobile captures with video');
 assert.deepEqual(result.actions,[]);
 // Execute and cancel one real upgrade through the UI, on the isolated fixture.
 await page.setViewportSize({width:1440,height:1000});await page.locator('.bottom-bar [data-page="buildings"]').click();
 await page.locator('#page-body [data-building="Metal_Mine"]').click();await page.locator('#detail-modal [data-build="Metal_Mine"]').click();
 await page.waitForFunction(()=>EmpireAPI.planet.buildQueue?.id==='Metal_Mine');
 await page.locator('#detail-modal [data-cancel="build"]').click();await page.waitForFunction(()=>!EmpireAPI.planet.buildQueue);
 assert.deepEqual(result.actions.map(s=>JSON.parse(s).type),['build','cancel']);result.checks.push('Real UI build/cancel preserves colony operation');
 assert.deepEqual(result.errors,[]);result.passed=true;
}catch(e){result.failure=e.stack;throw e;}finally{fs.writeFileSync(out+'/browser-verification.json',JSON.stringify(result,null,2));await context.close();await browser.close();console.log(JSON.stringify(result,null,2));}
