import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {freePort,playwright,root} from './three-battle-harness.mjs';
const output=path.join(root,'output/playwright/barred-galaxy-distance');fs.mkdirSync(output,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'empire-barred-galaxy-'));
const report={errors:[],actions:[]};let child,browser,context;
try{
 const world=createWorld(),player=createPlayer(world,'棒旋星图测试');
 const save=path.join(temporary,'universe.json'),session=path.join(temporary,'session.json');
 fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
 const port=await freePort();assert.notEqual(port,8289);const base=`http://127.0.0.1:${port}`;
 child=spawn(process.execPath,['server.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_SERVER_LOG:path.join(temporary,'server.log')},stdio:'ignore'});
 for(let i=0;i<100;i++){try{const r=await fetch(base+'/api/health');if(r.ok){assert.equal((await r.json()).isolated,true);break;}}catch{}if(child.exitCode!==null)throw Error('Isolated test server stopped');await new Promise(resolve=>setTimeout(resolve,100));}
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/INVALID_OPERATION|GL_INVALID/.test(m.text()))report.errors.push(m.text());});
 page.on('request',r=>{assert(!r.url().startsWith('http://127.0.0.1:8289'));if(r.url().includes('/api/action'))report.actions.push(r.postData());});
 await page.goto(base);await page.waitForFunction(()=>CommandApp?.scene?.snapshot?.navigation?.galaxy?.loaded,{timeout:45000});
 await page.evaluate(()=>CommandApp.scene.showGalaxy());await page.waitForTimeout(2200);
 const state=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
 report.overview=await state();assert.equal(report.overview.galaxy.version,'barred-b-1');assert.equal(report.overview.systemCount,256);
 await page.screenshot({path:path.join(output,'galaxy-desktop.png')});
 assert(report.overview.strategy.constellations.links.length>60);assert.equal(report.overview.strategy.constellations.markers.length,256);
 assert(report.overview.galaxy.opacity>.65);assert.equal(report.overview.strategy.constellations.ringOpacity,0);
 const starTypes=[0,1,2,3,0],starColors=[[1,.62,.24],[.60,.73,1],[1,.39,.16],[.79,.85,1]];
 for(const marker of report.overview.strategy.constellations.markers){const target=report.overview.targets.find(t=>t.type==='system'&&t.id===marker.id);assert(target);assert.equal(marker.x,target.x);assert.equal(marker.y,target.y);assert.equal(marker.ringOpacity,0);assert.equal(marker.type,starTypes[marker.id%5]);assert.deepEqual(marker.color,starColors[marker.type]);}
 const layout=JSON.parse(fs.readFileSync(path.join(root,'opendesign/mockups/planet-construction-review/galaxy-layout.json'),'utf8'));
 const chart=await page.evaluate(()=>CommandApp.scene.chartSystems);
 for(const s of chart){assert.deepEqual(s.position,layout.systems[s.id-1].position);assert.equal(s.galaxyStar.size,layout.systems[s.id-1].size);}
 const box=await page.locator('.aurora-game-frame').boundingBox();
 const pick=report.overview.targets.find(t=>t.type==='system'&&t.x>550&&t.x<1000&&t.y>280&&t.y<680&&report.overview.strategy.constellations.links.some(e=>e.includes(t.id)));assert(pick);
 await page.mouse.move(box.x+pick.x,box.y+pick.y);await page.waitForTimeout(250);
 report.hover=await state();assert(report.hover.strategy.constellations.highlighted.length>0);
 await page.screenshot({path:path.join(output,'galaxy-hover.png')});
 await page.mouse.click(box.x+pick.x,box.y+pick.y);await page.waitForTimeout(500);
 const clicked=await state();assert.equal(clicked.system[1],pick.id);assert.deepEqual(clicked.goal.center,layout.systems[pick.id-1].position);
 await page.keyboard.press('Escape');
 for(let i=0;i<3;i++){await page.evaluate(()=>CommandApp.scene.renderer.zoomNavigation(-175));await page.waitForTimeout(120);}
 await page.waitForTimeout(1200);report.middle=await state();
 assert(report.middle.strategy.constellations.markers.length>0);assert(report.middle.strategy.constellations.ringOpacity>.99);assert(report.middle.galaxy.opacity<report.overview.galaxy.opacity);
 await page.screenshot({path:path.join(output,'galaxy-middle.png')});
 await page.evaluate(id=>CommandApp.scene.renderer.focusSystem(id),pick.id);await page.waitForTimeout(2200);
 report.system=await state();assert.equal(report.system.level,'system');assert(report.system.targets.some(t=>t.type==='planet'));
 assert.equal(report.system.strategy.constellations.markers.length,0);assert.equal(report.system.strategy.constellations.links.length,0);
 assert(report.system.galaxy.opacity<report.middle.galaxy.opacity);assert(report.system.galaxy.opacity<.1);
 await page.screenshot({path:path.join(output,'system-close.png')});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>CommandApp.scene.showGalaxy());await page.waitForTimeout(1800);
 await page.mouse.move(box.x+800,box.y+500);await page.mouse.down();await page.mouse.move(box.x+980,box.y+590,{steps:12});await page.mouse.up();await page.waitForTimeout(600);
 report.rotated=await state();assert(Math.abs(report.rotated.camera.pitch-report.overview.camera.pitch)>.1);
 await page.screenshot({path:path.join(output,'galaxy-rotated.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await page.evaluate(()=>CommandApp.scene.showGalaxy());await page.waitForTimeout(2000);
 report.mobile=await state();
 await page.screenshot({path:path.join(output,'galaxy-mobile.png')});
 assert(report.mobile.strategy.constellations.markers.length>200);assert(report.mobile.strategy.constellations.links.length>20);
 assert.equal(report.mobile.strategy.constellations.ringOpacity,0);assert(report.mobile.galaxy.opacity>.65);
 report.glError=await page.evaluate(()=>CommandApp.scene.renderer.getWebGLError());assert.equal(report.glError,0);assert.deepEqual(report.errors,[]);assert.deepEqual(report.actions,[]);report.passed=true;
}catch(e){report.failure=e.stack;throw e;}finally{
 try{await context?.close();}finally{try{await browser?.close();}finally{
  try{if(child&&child.exitCode===null){const stopped=once(child,'exit');child.kill();await stopped;}}finally{
   const resolved=path.resolve(temporary),tempRoot=path.resolve(os.tmpdir());assert(resolved.startsWith(tempRoot+path.sep)&&path.basename(resolved).startsWith('empire-barred-galaxy-'));
   fs.rmSync(resolved,{recursive:true,force:true});report.temporaryRemoved=!fs.existsSync(resolved);
   fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failure:report.failure,errors:report.errors,temporaryRemoved:report.temporaryRemoved}));
  }
 }}
}
