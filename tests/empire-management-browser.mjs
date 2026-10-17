import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/empire-management');fs.mkdirSync(dir,{recursive:true});
const world=createWorld(),player=createPlayer(world,'王庭浏览器验收'),home=world.planets[player.home];
home.resources=[100000,100000,100000];home.fields=1000;home.constructionPlan={revision:0,paused:true,items:[]};
const metal={...structuredClone(home),id:'verify-metal',name:'金属矿业星',biome:'mercury',position:[1,498,4],buildings:{Command_Center:1,Metal_Mine:3},resources:[500,500,0]};
const gas={...structuredClone(home),id:'verify-gas',name:'气体采集星',biome:'gas',position:[1,498,5],resources:[1000,1000,1000]};
world.planets[metal.id]=metal;world.planets[gas.id]=gas;
const save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],consoleErrors=[],results={port,checks:[]};page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')consoleErrors.push(e.text());});
const requests=[];page.on('request',r=>{if(r.url().endsWith('/api/plan-preview')||r.url().endsWith('/api/action'))requests.push({path:new URL(r.url()).pathname,payload:r.postDataJSON()});});
const check=(name)=>results.checks.push(name);
const state=()=>page.evaluate(()=>EmpireAPI.state);
async function edit(button){await page.locator(button).click();await page.waitForFunction(()=>!EmpireAPI.busy);}
try{
 await page.goto(`http://127.0.0.1:${port}/#empire`);await page.waitForFunction(()=>window.EmpireAPI?.state&&window.CommandApp?.page==='empire');
 assert.equal(await page.locator('.empire-table tbody tr').count(),3);check('3 owned colonies rendered');
 await page.locator('#empire-search').fill('金属');assert.equal(await page.locator('.empire-table tbody tr').count(),1);assert.match(await page.locator('.empire-table tbody').innerText(),/金属矿业星/);
 await page.locator('#empire-search').fill('');await page.locator('#empire-filter').selectOption('energy');assert.equal(await page.locator('.empire-table tbody tr').count(),1);assert.match(await page.locator('.empire-table tbody').innerText(),/金属矿业星/);check('name search and energy filter');
 await page.locator('#empire-filter').selectOption('all');await page.locator('[data-empire-select-all]').click();assert.match(await page.locator('.empire-batch').innerText(),/已选 3 颗/);
 await page.locator('[data-empire-preview]').click();await page.locator('[data-empire-apply]').waitFor();assert.equal(await page.locator('.empire-preview').count(),3);assert.ok((await state()).planets.every(p=>p.constructionPlan.items.length===0));await page.locator('.empire-preview').last().locator('summary').click();await page.screenshot({path:path.join(dir,'template-preview.png')});
 await edit('[data-empire-apply]');await page.waitForFunction(()=>!document.querySelector('#detail-modal').open);assert.ok((await state()).planets.every(p=>p.constructionPlan.items.length>0&&p.constructionPlan.paused));check('batch preview is read-only; applies to 3 planets preserving pause');
 await page.locator('#empire-growth').selectOption('incremental');await page.locator('#page-body').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(dir,'incremental-desktop-selector.png')});await page.setViewportSize({width:390,height:844});await page.locator('.empire-batch').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'incremental-mobile-selector.png')});await page.setViewportSize({width:1440,height:1000});await page.locator('[data-empire-preview]').click();await page.locator('[data-empire-apply]').waitFor();assert.match(await page.locator('#modal-title').innerText(),/增量/);assert.match(await page.locator('#modal-body').innerText(),/再次应用会再增加一轮/);await page.locator('.empire-preview').first().locator('summary').click();await page.screenshot({path:path.join(dir,'incremental-desktop-preview.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,'incremental-mobile-preview.png')});await page.locator('[data-empire-apply]').scrollIntoViewIfNeeded();assert.equal(await page.locator('[data-empire-apply]').isVisible(),true);await page.screenshot({path:path.join(dir,'incremental-mobile-preview-confirm.png')});check('390px incremental preview scrolls to confirmation button');await page.setViewportSize({width:1440,height:1000});
 const beforeIncrement=(await state()).planets.find(p=>p.id===home.id);assert.equal(Math.max(...beforeIncrement.constructionPlan.items.filter(x=>x.id==='Metal_Mine').map(x=>x.level)),12);
 await edit('[data-empire-apply]');await page.waitForFunction(()=>!document.querySelector('#detail-modal').open);
 const afterIncrement=(await state()).planets.find(p=>p.id===home.id);assert.equal(afterIncrement.constructionPlan.growth,'incremental');assert.equal(Math.max(...afterIncrement.constructionPlan.items.filter(x=>x.id==='Metal_Mine').map(x=>x.level)),17);assert.equal(afterIncrement.constructionPlan.paused,true);
 assert.match(await page.locator('.empire-table').innerText(),/增量发展/);const sent=requests.find(x=>x.path==='/api/action'&&x.payload.growth==='incremental');assert.equal(sent.payload.mode,'append');assert.equal(Object.keys(sent.payload.bases).length,3);assert.equal(sent.payload.planets.length,3);results.incrementalRequest=sent.payload;check('incremental preview and batch apply extend planned level 12 to 17 without unpausing');
 await page.locator('#empire-growth').selectOption('fixed');

 await edit(`[data-empire-edit="${home.id}"]`);await edit('[data-empire-clear]');
 await page.locator('#empire-building').selectOption('Metal_Mine');await page.locator('#empire-level').fill('4');await edit('#empire-add-plan button');
 await page.locator('#empire-building').selectOption('Solar_Plant');await page.locator('#empire-level').fill('3');await edit('#empire-add-plan button');
 let p=(await state()).planets.find(p=>p.id===home.id);assert.deepEqual(p.constructionPlan.items,[{id:'Metal_Mine',level:4},{id:'Solar_Plant',level:3}]);
 await edit('[data-empire-move="1"][data-direction="-1"]');await page.locator('#empire-goal-0').fill('2');await edit('[data-empire-level="0"]');p=(await state()).planets.find(p=>p.id===home.id);assert.deepEqual(p.constructionPlan.items,[{id:'Solar_Plant',level:2},{id:'Metal_Mine',level:4}]);
 await edit('[data-empire-remove="1"]');assert.equal((await state()).planets.find(p=>p.id===home.id).constructionPlan.items.length,1);check('plan add, reorder, change goal, remove');
 await edit('[data-empire-pause]');p=(await state()).planets.find(p=>p.id===home.id);assert.equal(p.constructionPlan.paused,false);assert.equal(p.buildQueue.id,'Solar_Plant');await edit('[data-empire-pause]');p=(await state()).planets.find(p=>p.id===home.id);assert.equal(p.constructionPlan.paused,true);assert.equal(p.buildQueue.id,'Solar_Plant');check('resume starts one job; pause preserves running job');
 await page.screenshot({path:path.join(dir,'desktop-plan.png'),fullPage:true});
 await page.locator('#page-body').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(dir,'desktop-overview.png')});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,'mobile-plan.png'),fullPage:true});await page.locator('#page-body').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(dir,'mobile-overview.png')});await page.locator('#page-body').evaluate(el=>el.scrollTop=el.scrollHeight);await page.screenshot({path:path.join(dir,'mobile-editor.png')});results.mobile=await page.evaluate(()=>({width:innerWidth,bodyWidth:document.documentElement.scrollWidth,tableWidth:document.querySelector('.empire-table-wrap').clientWidth,tableScroll:document.querySelector('.empire-table-wrap').scrollWidth}));
 await page.setViewportSize({width:1440,height:1000});await page.locator('.bottom-bar [data-page="buildings"]').click();await page.locator('[data-building="Command_Center"]').waitFor();assert.match(await page.locator('[data-building="Command_Center"]').innerText(),/帝国王庭/);await page.locator('[data-building="Command_Center"]').click();assert.equal(await page.evaluate(()=>CommandApp.page),'empire');check('home Command_Center labeled 帝国王庭 and opens empire overview');

 await page.locator('#planet-picker').selectOption(metal.id);await page.waitForFunction(()=>EmpireAPI.planet.id==='verify-metal');await page.locator('#chart-home-enter').click();await page.waitForFunction(()=>EmpireAPI.planet.id===EmpireAPI.state.player.home);check('mother-card navigation from another colony updates active planet');
 await page.locator('.bottom-bar [data-page=home]').click();await page.waitForFunction(()=>CommandApp.scene?.renderer?.ready,null,{timeout:60000});await page.evaluate(()=>CommandApp.scene.selectBuilding('Command_Center'));await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.visibleDetails?.some(d=>d.biome==='terrestrial'),null,{timeout:60000});await page.evaluate(()=>CommandApp.scene.selectBuilding('Command_Center'));await page.waitForTimeout(2000);
 const frame=page.frames().find(f=>f.url().includes('planet-construction-review/index.html'));
 const pick={x:720,y:500};
 results.courtPick=pick;assert.ok(pick,'3D court must be pickable');await page.screenshot({path:path.join(dir,'court-3d.png')});await frame.locator('#world').click({position:{x:pick.x,y:pick.y}});await page.waitForFunction(()=>CommandApp.page==='empire');check('real 3D court canvas click opens empire overview');
 await page.locator('[data-empire-deselect]').click();assert.equal(await page.locator('[data-empire-preview]').isDisabled(),true);await page.getByLabel('选择金属矿业星',{exact:true}).check();assert.equal(await page.locator('[data-empire-preview]').isEnabled(),true);assert.equal(await page.getByLabel('选择金属矿业星',{exact:true}).isChecked(),true);check('deselect disables preview; individual checkbox enables preview');
 await page.reload();await page.waitForFunction(()=>window.EmpireAPI?.state&&window.CommandApp?.page==='empire');assert.equal((await state()).planets.find(p=>p.id===home.id).constructionPlan.paused,true);check('plan persists after reload');
 results.errors=errors;results.consoleErrors=consoleErrors;assert.equal(errors.length,0);assert.equal(consoleErrors.length,0);assert.equal(serverErrors,'');
}catch(error){results.failure=error.stack;await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true});process.exitCode=1;}finally{results.errors=errors;results.consoleErrors=consoleErrors;results.serverErrors=serverErrors;fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();child.kill();await once(child,'exit');}
