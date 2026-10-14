import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {battle} from '../game/combat.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve('output/galactic-command-verification');fs.mkdirSync(output,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'galactic-ui-'));
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
const world=createWorld(),player=createPlayer(world,'隔离UI验收',world.at,()=>.5),home=world.planets[player.home];
home.name='UI验收母星';home.biome='terrestrial';home.position=[1,16,7];home.resources=[1e8,1e8,1e8];
home.buildings={Command_Center:3,Metal_Mine:10,Crystal_Mine:8,Gas_Mine:6,Solar_Plant:12,Robotics_Facility:6,Shipyard:8,Research_Lab:8,Metal_Storage:10,Crystal_Storage:10,Gas_Storage:10};
home.ships={Light_Fighter:20,Cargo_Ship:5,Probe:3,Recycler:2};
player.tech={Energy_Tech:6,Computer_Tech:4,Combustion_Drive:6,Espionage_Tech:4,Weapons_Tech:4,Strength_Tech:4,Shielding_Tech:4};
const resourceOwner=createPlayer(world,'资源测试占位',world.at,()=>.6),resourcePlanet=world.planets[resourceOwner.home];
resourcePlanet.owner=player.id;resourcePlanet.name='资源恢复验收';resourcePlanet.biome='terrestrial';resourcePlanet.resources=[58.9,10000,0];resourcePlanet.buildings={Command_Center:1};
delete world.players[resourceOwner.id];
const ownedByBiome={terrestrial:home};
for(const biome of ['mercury','mars','gas']){
  const slot=Array.from({length:15},(_,i)=>i+1).find(n=>!Object.values(world.planets).some(p=>p.position.join(':')===`1:16:${n}`));
  const planet={...structuredClone(home),id:'ui-'+biome,name:'星图验收-'+biome,biome,position:[1,16,slot]};
  world.planets[planet.id]=planet;ownedByBiome[biome]=planet;
}
const target=Object.values(world.planets).find(p=>p.position.join(':')==='1:16:1');
world.missions.push({id:'incoming-ui-fixture',owner:target.owner,from:target.id,target:home.id,position:home.position,task:'attack',ships:{Light_Fighter:1},cargo:[0,0,0],phase:'outbound',start:Date.now(),end:Date.now()+3600000,travel:3600000,seed:1});
player.reports=[{id:'ui-spy-report',type:'spy',at:Date.now(),read:false,title:'隔离侦察报告',resources:[100,200,300],ships:{Light_Fighter:2},defense:{Rocket_Launcher:1},buildings:{Metal_Mine:4}},{id:'ui-battle-report',type:'battle',at:Date.now(),read:true,title:'隔离战斗报告',...battle({Light_Fighter:8},{Light_Fighter:4},{},{},331),loot:[0,0,0]}];
player.reports.push(
  {id:'ui-mining-report',type:'fleet',at:Date.now(),read:true,title:'隔离采矿报告',body:'回收舰队完成采矿。',cargo:[12345,6789,0]},
  {id:'ui-explore-report',type:'explore',at:Date.now(),read:true,title:'隔离探索奖励',body:'探索发现奖励。',cargo:[111,222,333],darkMatter:17,parts:3,foundShips:{Heavy_Fighter:5}}
);
fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));

const check=net.createServer();check.listen(0,'127.0.0.1');await once(check,'listening');const testPort=String(check.address().port);await new Promise(resolve=>check.close(resolve));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:testPort,EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,GODOT_BIN:'missing-godot-ui-selfcheck'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='';server.stderr.on('data',chunk=>{logs+=chunk;});
let browser;
const findings={actions:[],errors:[],checks:[]};
try{
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw new Error(logs);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('隔离服务启动超时')),10000);timer.unref();})]);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>findings.errors.push(error.message));
  page.on('request',request=>{if(request.url().endsWith('/api/action'))findings.actions.push(request.postDataJSON());});
  const nav=label=>page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:new RegExp(label)}).click();
  const perform=async click=>{const wait=page.waitForResponse(r=>r.url().endsWith('/api/action'));await click();const response=await wait;const data=await response.json();assert.equal(response.status(),200,data.error);await page.waitForFunction(()=>!EmpireAPI.busy);return data;};
  await page.goto(`http://127.0.0.1:${testPort}/`,{waitUntil:'networkidle'});
  assert.match(await page.locator('body').innerText(),/隔离UI验收/);
  await page.getByRole('combobox',{name:'当前殖民地'}).selectOption({label:'资源恢复验收'});
  await nav('建设');
  const firstBuild=page.locator('[data-build="Metal_Mine"]');
  assert.equal(await firstBuild.isDisabled(),true,'fixture must start below build cost');
  await page.waitForFunction(()=>!document.querySelector('[data-build="Metal_Mine"]').disabled,{},{timeout:45000});
  findings.checks.push('资源自然累积后建造按钮自动恢复');
  await page.getByRole('combobox',{name:'当前殖民地'}).selectOption({label:'UI验收母星'});
  assert.equal(await page.locator('[data-biome]').count(),0,'the base does not expose planet type mutations');
  const mineIds=['Metal_Mine','Crystal_Mine','Gas_Mine'],storeIds=['Metal_Storage','Crystal_Storage','Gas_Storage'];
  for(const [biome,specialty,name] of [['mercury',0,'金属岩星'],['mars',1,'火星岩星'],['gas',2,'气态巨星'],['terrestrial',null,'类地星']]){
    const colony=ownedByBiome[biome];
    await nav('太阳系');
    await page.waitForFunction(()=>CommandApp.page==='system'&&CommandApp.scene?.snapshot?.navigation?.level==='system');
    await page.locator(`#system-orbits [data-map-select="${colony.id}"]`).click();
    assert.equal(await page.locator('#system-target h2').innerText(),colony.name);
    assert.match(await page.locator('#system-target').innerText(),new RegExp(name));
    await page.locator(`#system-target [data-map-enter="${colony.id}"]`).click();
    await page.waitForFunction(id=>EmpireAPI.planet.id===id&&CommandApp.page==='home'&&CommandApp.scene?.renderer?.ready&&CommandApp.scene?.snapshot?.biome===EmpireAPI.planet.biome&&CommandApp.scene?.snapshot?.navigation?.level==='planet',colony.id);
    const updated=await page.evaluate(()=>EmpireAPI.planet);
    assert.equal(updated.id,colony.id);
    assert.equal(updated.biome,biome);
    assert.equal(await page.locator('#planet-type').innerText(),name);
    assert.deepEqual(updated.buildings,colony.buildings,'entering a planet preserves its own buildings');
    assert.match(await page.locator('#planet-specialty').innerText(),specialty===null?/三类资源/:/产量 ×3/);
    for(let i=0;i<3;i++){
      assert.equal(updated.economy.rate[i]>0,specialty===null||specialty===i,'only native resources produce');
      assert.ok(updated.resources[i]>0,'imported resources remain stored');
    }
    if(biome==='gas'){
      await page.reload({waitUntil:'networkidle'});
      assert.equal(await page.locator('#planet-type').innerText(),'气态巨星','the selected planet persists after reload');
      assert.equal(await page.locator('#planet-picker').inputValue(),colony.id);
      assert.match(await page.locator('#resource-operations').innerText(),/仅开采气体/);
      await page.setViewportSize({width:390,height:844});
      const boxes=await page.locator('#resource-operations, .planet-intro').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};}));
      assert.ok(boxes.every(r=>r.left>=0&&r.right<=390),'mobile HUD stays in the viewport');
      await page.screenshot({path:path.join(output,'isolated-gas-mobile.png')});
      await page.setViewportSize({width:1440,height:1000});
    }
    await nav('建设');
    for(let i=0;i<3;i++){
      assert.equal(await page.locator(`[data-build="${mineIds[i]}"]`).isDisabled(),false,'all resource complexes remain upgradeable for mining or import storage');
      assert.equal(await page.locator(`[data-build="${storeIds[i]}"]`).count(),0,'ordinary worlds use one combined upgrade per resource');
    }
    assert.equal(await page.locator('[data-build="Moon_Base"]').count(),0,'ordinary planets exclude moon facilities');
  }
  await nav('太阳系');
  await page.waitForFunction(()=>CommandApp.page==='system'&&CommandApp.scene?.snapshot?.navigation?.level==='system');
  await page.locator(`#system-orbits [data-map-select="${target.id}"]`).click();
  assert.equal(await page.locator('#system-target h2').innerText(),target.name);
  assert.match(await page.locator('#system-target').innerText(),/建筑、舰队与防御尚未侦察/);
  assert.equal(await page.locator('#system-target [data-map-enter]').count(),0,'NPC bases cannot be opened as owned colonies');
  const actionsBeforeScout=findings.actions.length;
  await page.locator('#system-target [data-map-task="spy"]').click();
  await page.waitForFunction(()=>CommandApp.page==='fleet');
  assert.equal(findings.actions.length,actionsBeforeScout,'preparing reconnaissance does not dispatch a fleet');
  assert.equal(await page.locator('#dispatch-task').inputValue(),'spy');
  assert.equal(await page.locator('#planet-picker').inputValue(),home.id);
  const empty=await page.evaluate(()=>EmpireAPI.state.map.find(p=>p.unoccupied&&p.position[0]===1&&p.position[1]===16));
  assert(empty,'fixture has an uncolonized orbit');
  await page.locator('#dispatch-target').selectOption(empty.position.join(':'));
  assert.equal(await page.locator('#dispatch-task').inputValue(),'colonize');
  const targetOptions=await page.locator('#dispatch-target option').evaluateAll(options=>options.map(o=>o.value));
  assert.equal(new Set(targetOptions).size,targetOptions.length,'uncolonized orbits have distinct coordinate choices');
  findings.checks.push('星图进入四种真实基地，刷新保持选中星球；野怪只允许侦察准备，空星球按坐标殖民，基地无类型切换');
  findings.checks.push('专属矿产产量、三类综合体统一升级、进口仓储与移动端HUD');

  await nav('建设');
  const built=await perform(()=>page.locator('[data-build="Metal_Mine"]').click());
  assert.equal(built.planets.find(p=>p.id===home.id).buildQueue.id,'Metal_Mine');
  assert.match(await page.locator('#page-body').innerText(),/取消 · 返还资源/);
  const canceled=await perform(()=>page.locator('#page-body [data-cancel="build"]').click());
  assert.equal(canceled.planets.find(p=>p.id===home.id).buildQueue,null);
  findings.checks.push('建筑升级与取消、资源返还状态');

  await nav('研究');
  const researched=await perform(()=>page.locator('[data-research="Energy_Tech"]').click());
  assert.equal(researched.player.researchQueue.id,'Energy_Tech');
  const researchCanceled=await perform(()=>page.locator('#page-body [data-cancel="research"]').click());
  assert.equal(researchCanceled.player.researchQueue,null);
  findings.checks.push('研究与取消');

  await nav('造舰');
  await page.getByRole('spinbutton',{name:'轻型战机建造数量'}).fill('3');
  await page.getByRole('spinbutton',{name:'轻型战机建造数量'}).press('Tab');
  const ships=await perform(()=>page.locator('[data-ship="Light_Fighter"]').click());
  assert.equal(ships.planets.find(p=>p.id===home.id).shipQueue[0].count,3);
  assert.match(await page.locator('#page-body').innerText(),/轻型战机 × 3/);
  findings.checks.push('3艘战机进入真实生产队列');

  await nav('舰队');
  await page.getByRole('spinbutton',{name:'轻型运输舰派遣数量'}).fill('2');
  await page.getByRole('spinbutton',{name:'轻型运输舰派遣数量'}).press('Tab');
  await page.getByRole('combobox',{name:'目的地'}).selectOption(target.id);
  await page.getByRole('combobox',{name:'任务',exact:true}).selectOption('transport');
  await page.getByRole('spinbutton',{name:'装载金属'}).fill('100');
  await page.getByRole('spinbutton',{name:'装载金属'}).press('Tab');
  const dispatched=await perform(()=>page.getByRole('button',{name:'确认派遣'}).click());
  const flight=dispatched.missions.find(m=>!m.inbound);
  assert.equal(flight.task,'transport');assert.deepEqual(flight.ships,{Cargo_Ship:2});assert.equal(flight.cargo[0],100);
  assert.match(await page.locator('#page-body').innerText(),/来袭舰队/);
  assert.match(await page.locator('#page-body').innerText(),/轻型运输舰 × 2/);
  await page.waitForTimeout(700);
  const recalled=await perform(()=>page.getByRole('button',{name:'召回舰队'}).click());
  assert.equal(recalled.missions.find(m=>m.id===flight.id).phase,'return');
  findings.checks.push('含来袭警报的任务列表正常，运输派遣与召回');
  await page.screenshot({path:path.join(output,'isolated-fleet.png')});

  await nav('战报');
  const report=await perform(()=>page.getByRole('button',{name:/隔离侦察报告/}).click());
  assert.equal(report.reports.find(r=>r.id==='ui-spy-report').read,true);
  assert.match(await page.locator('#detail-modal').innerText(),/金属开采综合体/);
  findings.checks.push('侦察报告详情与已读状态');
  await page.screenshot({path:path.join(output,'isolated-report.png')});
  await page.getByRole('button',{name:'关闭详情'}).click();
  await page.getByRole('button',{name:/隔离采矿报告/}).click();
  const mining=await page.locator('#detail-modal').innerText();
  for(const text of ['携带物资','12,345','6,789'])assert.ok(mining.includes(text),text);
  await page.getByRole('button',{name:'关闭详情'}).click();
  await page.getByRole('button',{name:/隔离探索奖励/}).click();
  const exploration=await page.locator('#detail-modal').innerText();
  for(const text of ['携带物资','111','222','333','暗物质','+17','外星部件','+3','重型战机','5'])assert.ok(exploration.includes(text),text);
  await page.screenshot({path:path.join(output,'isolated-exploration-rewards.png')});
  await page.getByRole('button',{name:'关闭详情'}).click();
  await page.getByRole('button',{name:/隔离战斗报告/}).click();
  const battleText=await page.locator('#detail-modal').innerText();
  for(const text of ['进攻方损失','防守方损失','残骸','战利品'])assert.ok(battleText.includes(text),text);
  const defenderLossRow=page.locator('#detail-modal h3').filter({hasText:'防守方损失'}).locator('xpath=following-sibling::table[1]').locator('tbody tr').filter({hasText:'轻型战机'});
  assert.equal(await defenderLossRow.locator('td').last().innerText(),String(player.reports[1].losses.defender.Light_Fighter));
  findings.checks.push('采矿携带物资、探索奖励与战损逐字段显示正确');
  await page.getByRole('button',{name:'观看三维回放'}).click();
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('#battle-page').evaluate(el=>el.classList.contains('active')),true);
  findings.checks.push('已保存战报进入三维回放');

  await nav('造舰');
  await page.getByRole('button',{name:'巡洋舰',exact:true}).click();
  await page.getByRole('button',{name:'三维舰船档案'}).click();
  await page.frameLocator('#hangar').locator('body').waitFor();
  await page.waitForTimeout(1300);
  findings.hangarText=(await page.frameLocator('#hangar').locator('body').innerText()).slice(0,2000);
  await page.screenshot({path:path.join(output,'isolated-first-ship-preview.png')});

  assert.equal(findings.errors.length,0,findings.errors.join('\n'));
  assert.deepEqual(findings.actions.map(a=>a.type),['build','cancel','research','cancel','ship','dispatch','recall','read']);
  findings.savedProgress=JSON.parse(fs.readFileSync(saveFile)).planets[home.id].buildQueue===null;
  assert.equal(findings.savedProgress,true);
  fs.writeFileSync(path.join(output,'ui-selfcheck.json'),JSON.stringify(findings,null,2));
  console.log(JSON.stringify(findings,null,2));
}catch(error){
  findings.failure=error.stack;fs.writeFileSync(path.join(output,'ui-selfcheck.json'),JSON.stringify(findings,null,2));throw error;
}finally{
  await browser?.close();server.kill();await once(server,'exit');
  assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
}
