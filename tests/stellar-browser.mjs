import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='output/playwright/stellar';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),report={errors:[],types:[],actions:[]};
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.location().url?.endsWith('/favicon.ico'))return;if(m.type()==='error'||/INVALID|GL_/.test(m.text()))report.errors.push(m.text());});
page.on('request',r=>{if(r.url().endsWith('/api/action'))report.actions.push(r.postData());});
const get=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
try{
 await page.goto(process.env.UNIVERSE_TEST_URL||'http://127.0.0.1:8304');await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled);
 await page.evaluate(()=>{window.__frame=CommandApp.scene.frame;window.__canvas=__frame.contentWindow.document.querySelector('#world');window.__gl=__canvas.getContext('webgl');});
 await page.screenshot({path:out+'/galaxy.png'});
 for(const [id,name] of [[15,'main-sequence'],[16,'blue-giant'],[17,'red-giant'],[18,'white-dwarf']]){
  await page.evaluate(id=>CommandApp.scene.renderer.focusSystem(id),id);await page.waitForTimeout(1700);
  const box=await page.locator('.aurora-game-frame').boundingBox();const star=(await get()).targets.find(t=>t.type==='system'&&t.id===id);assert(star);
  await page.mouse.click(box.x+star.x,box.y+star.y);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  for(let i=0;i<4;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(150);}
  await page.waitForTimeout(1100);await page.screenshot({path:out+'/'+name+'.png'});
  const before=await get();await page.waitForTimeout(600);assert((await get()).time>before.time);
  report.types.push({id,name,distance:before.camera.dist,radius:before.targets.find(t=>t.type==='system'&&t.id===id)?.radius});
  // Orbit, approach the surface and reverse the zoom while preserving the target.
  if(id===15){await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.65,{steps:12});await page.mouse.up();await page.waitForTimeout(300);await page.screenshot({path:out+'/orbit.png'});}
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/mobile.png'});
 assert(await page.evaluate(()=>CommandApp.scene.frame===__frame&&__frame.contentWindow.document.querySelector('#world')===__canvas&&__canvas.getContext('webgl')===__gl));
 // Controlled transit uses the production renderer, with a planet placed on the
 // same viewing ray first behind and then in front of the star.
 await page.setViewportSize({width:1000,height:800});
 await page.goto(new URL('/opendesign/mockups/planet-construction-review/?mode=game',page.url()).href);
 await page.waitForFunction(()=>window.AURORA?.ready);
 await page.evaluate(()=>{AURORA.setNavigationState({systems:[{id:15,name:'测试恒星',position:[0,0,0]}],planets:[]});AURORA.focusSystem(15);AURORA._advance(3);});
 await page.locator('#world').dispatchEvent('wheel',{deltaY:-200,clientX:500,clientY:400});
 for(let i=0;i<3;i++)await page.locator('#world').dispatchEvent('wheel',{deltaY:-200,clientX:500,clientY:400});
 await page.waitForTimeout(900);
 report.occlusion=[];
 for(const distance of [-4,4]){
  await page.evaluate(distance=>{
   const c=AURORA.snapshot.navigation.camera,ray=[Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch),Math.cos(c.yaw)*Math.cos(c.pitch)];
   const slot=16,radius=4.7+slot*2.12,phase=slot*2.399963229728653+.117+20*.043;
   const offset=[Math.cos(phase)*radius,Math.sin(slot*1.73)*.07,Math.sin(phase)*radius];
   AURORA.setNavigationState({systems:[{id:15,name:'测试恒星',position:[0,0,0]},{id:20,name:'测试轨道',position:ray.map((v,i)=>v*distance-offset[i])}],planets:[{id:'transit',key:'1:20:16',name:'遮挡测试',position:[1,20,16],biome:'mars'}]});
  },distance);
  await page.waitForTimeout(1600);
  const pixel=await page.evaluate(()=>{const c=document.querySelector('#world'),g=c.getContext('webgl'),p=new Uint8Array(4);g.readPixels(c.width/2|0,c.height/2|0,1,1,g.RGBA,g.UNSIGNED_BYTE,p);return [...p];});
  report.occlusion.push({distance,pixel});await page.screenshot({path:out+`/planet-${distance<0?'behind':'in-front'}.png`});
 }
 assert(report.occlusion[0].pixel[0]>200,'stellar photosphere occludes the distant planet');
 assert(report.occlusion[1].pixel[0]<170,'foreground planet occludes the stellar photosphere');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.actions,[]);report.passed=true;
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
