import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/fleet-trial');fs.mkdirSync(dir,{recursive:true});
const w=createWorld(),p=createPlayer(w,'编队验收'),save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const base=`http://127.0.0.1:${port}`,child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',b=>errors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
const result={};
try{
 await page.goto(base);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.locator('[data-page="battle"]').click();await page.getByRole('heading',{name:'自选编队测试'}).waitFor();
 await page.getByLabel('己方编队 无畏舰',{exact:true}).fill('12');await page.getByRole('button',{name:'己方配比 → 对方'}).click();assert.equal(await page.getByLabel('对方编队 无畏舰',{exact:true}).inputValue(),'12');
 await page.screenshot({path:path.join(dir,'fleet-selector.png')});await page.getByRole('button',{name:'开始编队测试 ↗'}).click();
 let frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows?.length===72,null,{timeout:60000});
 const first=await frame.evaluate(()=>flightController.id);await frame.waitForFunction(()=>flightController.snapshot.elapsed>32,null,{timeout:60000});
 const sample=()=>frame.evaluate(async()=>{const times=[],b=flightController;let last=performance.now(),start=last,controlled=0,peakBlast=0;await new Promise(resolve=>{const measure=now=>{times.push(now-last);last=now;if(b.controlled!==null)controlled++;peakBlast=Math.max(peakBlast,(GalacticDemo.state.flight.weaponImpacts||[]).filter(e=>e.elite).length);if(now-start<30000)requestAnimationFrame(measure);else resolve();};requestAnimationFrame(measure);});let duration=0,count=0;const windows=[];for(const t of times){duration+=t;count++;if(duration>=1000){windows.push(count*1000/duration);duration=0;count=0;}}return {meanFps:times.length*1000/times.reduce((a,b)=>a+b,0),minimumOneSecondFps:Math.min(...windows),controlledFraction:controlled/times.length,peakEliteEffects:peakBlast,heapMB:performance.memory.usedJSHeapSize/1048576,display:b.renderStats,webglError:GalacticDemo.renderer.gl.getError()};});
 result.overview=await sample();await page.screenshot({path:path.join(dir,'battle-lines.png')});
 const group=await frame.locator('#native-formation option').evaluateAll(options=>options.find(o=>o.textContent.includes('己方')&&o.textContent.includes('裂变者')).value);await frame.locator('#native-formation').selectOption(group);await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);
 await frame.locator('#scene').click({position:{x:960,y:500}});await page.keyboard.down('Space');await page.waitForTimeout(1500);await page.keyboard.up('Space');
 result.piloting=await sample();assert.equal(result.piloting.controlledFraction,1);await page.screenshot({path:path.join(dir,'elite-bridge.png')});await frame.locator('#native-release').click();await frame.locator('#native-overview').click();await page.screenshot({path:path.join(dir,'fleet-overview.png')});await frame.locator('#native-leave').click();
 assert.equal(await page.getByLabel('己方编队 无畏舰',{exact:true}).inputValue(),'12');await page.getByLabel('对方编队配比',{exact:true}).selectOption({label:'主力对轰'});await page.getByRole('button',{name:'开始编队测试 ↗'}).click();
 frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows?.length===64);assert.notEqual(await frame.evaluate(()=>flightController.id),first);
 await frame.locator('#native-leave').click();await page.waitForFunction(id=>EmpireAPI.state.reports.some(r=>r.battleId===id),first);
 const report=await page.evaluate(id=>EmpireAPI.state.reports.find(r=>r.battleId===id),first);await page.locator(`[data-open-replay="${report.id}"]`).click();frame=await (await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>!!window.flightController?.replay);assert.equal(await frame.locator('#native-claim').isEnabled(),false);await frame.locator('#native-pause').click();await frame.locator('#native-speed').selectOption('4');await frame.locator('#native-leave').click();
 await page.setViewportSize({width:430,height:900});await page.screenshot({path:path.join(dir,'selector-narrow.png')});
 for(const metrics of [result.overview,result.piloting]){assert.ok(metrics.minimumOneSecondFps>=30);assert.equal(metrics.webglError,0);assert.equal(metrics.display.detail,metrics.display.alive);}
 assert.equal(pageErrors.length,0);assert.equal(errors,'');result.errors=pageErrors;result.replay=report.id;console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({...result,errors:pageErrors,serverErrors:errors},null,2));await browser.close();child.kill();await once(child,'exit');}
