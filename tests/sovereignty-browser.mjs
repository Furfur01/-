import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {claimSystem} from '../game/sovereignty.mjs';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-sovereignty-')),file=path.join(directory,'universe.json'),out=path.resolve('output/playwright/sovereignty');
fs.mkdirSync(out,{recursive:true});
let child,browser,page;const report={errors:[],checks:[]};
try{
  const w=createWorld(),p=createPlayer(w,'测试星系归属',w.at,()=>0),home=w.planets[p.home];
  delete w.sovereignty.claims[home.position.slice(0,2).join(':')];home.position=[1,16,7];claimSystem(w,p,home.position);
  p.tech={Astrophysics_Tech:5,Computer_Tech:12};home.resources=[1e7,1e7,1e7];home.ships={Colony_Ship:12,Probe:5};
  fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(file+'.session',JSON.stringify({cookie:'empire='+p.id}));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));assert.notEqual(port,8289);
  child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stderr='';child.stderr.on('data',d=>stderr+=d);
  await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error(stderr||'Test server exited');}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Startup timeout')),10000).unref())]);
  const base='http://127.0.0.1:'+port,health=await(await fetch(base+'/api/health')).json();assert.equal(health.isolated,true);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled,null,{timeout:60000});
  await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.strategy?.components?.length>0,null,{timeout:60000});
  const info=await page.evaluate(()=>({systems:CommandApp.scene.chartSystems,player:EmpireAPI.state.player,parts:CommandApp.scene.snapshot.navigation.strategy.components}));
  assert.equal(info.player.colonyLimit,51);for(const id of['iron','dawn'])assert.equal(info.systems.filter(s=>s.systemOwner==='faction:'+id).length,16);
  assert(info.parts.every(c=>c.owners.length===1));report.checks.push('real sovereign territories and distant powers visible');
  const distribution=await page.evaluate(()=>Array.from({length:499},(_,i)=>{const system=i+1,local=CommandApp.scene.targets.filter(p=>p.position[1]===system&&!p.moon&&p.position[2]<=15);return {system,levels:local.filter(p=>p.npc).map(p=>p.npcLevel).sort(),biomes:[...new Set(local.filter(p=>!p.npc).map(p=>p.biome))].sort()};}));
  for(const s of distribution){assert.deepEqual(s.levels,[1,2,3,4,5]);assert.deepEqual(s.biomes,['gas','mars','mercury','terrestrial']);}report.checks.push('all 499 systems display five NPC tiers and four ordinary planet types');
  await page.screenshot({path:path.join(out,'galaxy.png')});
  for(const level of [1,5]){
    const camp=await page.evaluate(level=>CommandApp.scene.targets.find(p=>p.position[1]===16&&p.npcLevel===level),level);
    await page.evaluate(p=>{CommandApp.scene.renderer.focusSystem(16);CommandApp.scene.selectPlanet(p.key);},camp);
    await page.locator('[data-chart-panel="orbits"]').click();await page.locator('[data-map-select="'+camp.key+'"]').click();
    assert.match(await page.locator('#system-target .npc-daily-rule').innerText(),/每天北京时间 00:00/);
    assert.deepEqual((await page.locator('#system-target .daily-resources b').allTextContents()).map(n=>Number(n.replaceAll(',',''))),camp.npcDailyResources);
    assert.match(await page.locator('#system-target').innerText(),/当前剩余资源尚未探明/);
    await page.screenshot({path:path.join(out,'daily-npc-level-'+level+'.png')});
  }
  report.checks.push('Lv1 and Lv5 daily stocks and Beijing midnight reset rules shown without exposing unscouted live stocks');
  const foreign=await page.evaluate(()=>CommandApp.scene.targets.find(p=>p.systemOwner&&p.systemOwner!==EmpireAPI.state.player.polityId&&!p.owner&&!p.npc&&!p.moon&&p.position[2]<=15));assert(foreign);
  await page.evaluate(p=>{CommandApp.scene.renderer.focusSystem(p.position[1]);CommandApp.scene.selectPlanet(p.key);},foreign);
  await page.locator('[data-chart-panel="orbits"]').click();await page.locator('[data-map-select="'+foreign.key+'"]').click();
  await page.waitForFunction(()=>document.querySelector('#system-target')?.textContent.includes('不可殖民'));
  assert(await page.locator('#system-target button.primary').isDisabled());await page.screenshot({path:path.join(out,'foreign-system.png')});report.checks.push('foreign empty planets cannot be colonized');
  const empty=await page.evaluate(()=>CommandApp.scene.targets.find(p=>p.position[1]===16&&!p.owner&&!p.npc&&!p.moon&&p.position[2]<=15));
  await page.evaluate(p=>{CommandApp.scene.renderer.focusSystem(16);CommandApp.scene.selectPlanet(p.key);},empty);
  await page.locator('[data-chart-panel="orbits"]').click();await page.locator('[data-map-select="'+empty.key+'"]').click();
  await page.waitForFunction(()=>document.querySelector('#system-target')?.textContent.includes('我方星域 · 可殖民'));
  await page.locator('#system-target [data-map-task="colonize"]').click();
  assert.match(await page.locator('#page-body').innerText(),/殖民地 1 \/ 51/);assert.match(await page.locator('#page-body').innerText(),/每级天体物理增加 10/);
  await page.screenshot({path:path.join(out,'colonization.png')});report.checks.push('own system colonization and expanded capacity displayed');
  await page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:'研究',exact:true}).click();
  await page.getByRole('button',{name:'适应全部科技',exact:true}).click();await page.getByRole('button',{name:/天体物理.*级科技/}).click();await page.waitForFunction(()=>document.querySelector('.p0-operation-root')?.shadowRoot?.querySelector('.tech-description')?.textContent.includes('每级增加10个殖民名额'));assert.match(await page.locator('.tech-description').innerText(),/每级增加10个殖民名额/);report.checks.push('research description matches server rules');
  const response=await fetch(base+'/api/action',{method:'POST',headers:{Cookie:'empire='+p.id,'Content-Type':'application/json'},body:JSON.stringify({type:'dispatch',planet:home.id,task:'colonize',position:foreign.position,ships:{Colony_Ship:1}})});
  assert.equal(response.status,400);assert.match((await response.json()).error,/其他势力/);report.checks.push('API rejects a forged foreign-system colonization request');
  assert.deepEqual(report.errors,[]);report.passed=true;
}catch(e){report.failure=e.stack;if(page){report.diagnostic=await page.evaluate(()=>({description:document.querySelector('.tech-description')?.textContent,catalog:EmpireAPI.catalog.tech.Astrophysics_Tech.description,selected:document.querySelector('.tech-node.selected')?.textContent}));await page.screenshot({path:path.join(out,'failure.png')});}throw e;}finally{
  if(browser)await browser.close();
  if(child&&child.exitCode===null){const exited=once(child,'exit');child.kill();await exited;}
  assert(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
  report.cleanedUp=!fs.existsSync(directory);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
