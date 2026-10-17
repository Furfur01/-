import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {logisticsKey,logisticsBuilding} from '../game/system-logistics.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/system-logistics-3d');fs.mkdirSync(dir,{recursive:true});
const world=createWorld(),player=createPlayer(world,'物流浏览器验收'),home=world.planets[player.home];home.position=[1,250,4];home.resources=[0,0,0];home.fields=1000;
const bank={...structuredClone(home),id:'verify-bank',name:'出资殖民地',position:[1,250,5],resources:[20000,20000,20000]},moon={...structuredClone(home),id:'verify-moon',name:'物流月球',moon:true,parent:home.id,buildings:{Moon_Base:1},resources:[100,100,100]},special={...structuredClone(home),id:'verify-special',name:'金属专产星',position:[1,251,4],biome:'mercury',buildings:{Command_Center:1,Metal_Mine:1,Crystal_Mine:1,Gas_Mine:1,Solar_Plant:8},resources:[300,300,300]};
Object.assign(world.planets,{[bank.id]:bank,[moon.id]:moon,[special.id]:special});
world.logisticsCenters={[logisticsKey(home)]:{owner:player.id,position:[1,250],level:1,queue:null}};
const key=logisticsKey(home),save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],consoleErrors=[],requests=[],results={port,checks:[]};page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')consoleErrors.push(e.text());});page.on('request',r=>{if(r.url().endsWith('/api/action'))requests.push(r.postDataJSON());});
const card=()=>page.locator(`[data-logistics-system="${key}"]`),state=()=>page.evaluate(()=>EmpireAPI.state),check=x=>{results.checks.push(x);console.log(x);};
async function edit(selector){await page.locator(selector).click();await page.waitForFunction(()=>!EmpireAPI.busy);}
try{
 await page.goto(`http://127.0.0.1:${port}/#empire`);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&EmpireAPI.state?.logistics);await page.locator('.bottom-bar [data-page="system"]').click();await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.targets.some(t=>t.type==='logistics'),null,{timeout:30000});await page.waitForTimeout(1800);
 const target=await page.evaluate(()=>CommandApp.scene.snapshot.navigation.targets.find(t=>t.type==='logistics'));results.target=target;assert.ok(target.x>0&&target.x<1440&&target.y>0&&target.y<1000);
 const frame=page.frames().find(f=>f.url().includes('planet-construction-review/index.html'));await frame.locator('#world').hover({position:{x:target.x,y:target.y}});await page.screenshot({path:path.join(dir,'logistics-station.png')});await frame.locator('#world').click({position:{x:target.x,y:target.y}});await page.waitForFunction(()=>CommandApp.page==='logistics');assert.match(await page.locator('#page-body').innerText(),/共享仓库已连通/);check('real 3D logistics station canvas click opens its shared warehouse');
 await page.locator('#planet-picker').selectOption(special.id);await page.locator('.bottom-bar [data-page=buildings]').click();await page.locator('.planet-rule').waitFor();assert.match(await page.locator('.planet-rule').innerText(),/其余两种 ×0\.1/);await page.screenshot({path:path.join(dir,'specialized-buildings.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,'specialized-buildings-mobile.png')});check('specialized production x0.1 rule visible in desktop and mobile construction catalog');
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.equal(serverErrors,'');
}catch(e){results.failure=e.stack;await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true});process.exitCode=1;}finally{Object.assign(results,{errors,consoleErrors,serverErrors});fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();child.kill();await once(child,'exit');}
