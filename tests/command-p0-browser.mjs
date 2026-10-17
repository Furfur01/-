// DOM-driven integration checks against an isolated real server, never a personal save.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createWorld,createPlayer} from '../game/engine.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const defenseOnly=process.argv.includes('--defense-only');
const output=path.resolve('output/command-p0-verification');
fs.mkdirSync(output,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'command-p0-browser-'));
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
const findings={checks:[],actions:[],errors:[],assetFailures:[],modelLoads:[],screenshots:[],layouts:[],startedAt:new Date().toISOString()};
let server,browser,page,serverLog='';
const record=message=>{findings.checks.push(message);console.log('PASS '+message);};

try{
  const world=createWorld(),player=createPlayer(world,'P0隔离浏览器验收',world.at,()=>.431),home=world.planets[player.home];
  home.name='P0验收母星';home.resources=[2000000,2000000,2000000];home.biome='terrestrial';
  home.buildings={Command_Center:3,Metal_Mine:10,Crystal_Mine:10,Gas_Mine:10,Solar_Plant:18,Robotics_Facility:8,Shipyard:9,Research_Lab:8,Nanite_Factory:5,Missile_Silo:4};
  home.ships={Light_Fighter:20,Cruiser:3,Cargo_Ship:5};home.defense={Small_Shield_Dome:1,Interceptor_Missile:39};home.shipQueue=[];
  player.tech={Energy_Tech:6,Computer_Tech:4,Combustion_Drive:6,Impulse_Drive:6,Hyperspace_Tech:6,Hyperspace_Drive:6,Espionage_Tech:4,Weapons_Tech:4,Strength_Tech:4,Shielding_Tech:6,Laser_Tech:6,Ion_Tech:4,Plasma_Tech:7};
  const colony={...structuredClone(home),id:'p0-browser-colony',name:'P0验收边境星',position:[1,333,8],resources:[11111,22222,33333],buildings:{Command_Center:1,Shipyard:1,Research_Lab:1},ships:{Light_Fighter:2},defense:{},shipQueue:[{id:'Rocket_Launcher',count:3,remaining:3,each:3600,start:world.at,end:world.at+3600000}]};
  world.planets[colony.id]=colony;
  fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
  const probe=net.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  assert(![8289,8390].includes(port));findings.port=port;
  server=spawn(process.execPath,['server.mjs'],{cwd:path.resolve('.'),env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,GODOT_BIN:'missing-godot-p0-browser'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  server.stderr.on('data',chunk=>serverLog+=chunk);server.stdout.on('data',chunk=>serverLog+=chunk);
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw new Error(serverLog||'Isolated server exited');}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Isolated server startup timeout')),15000);timer.unref();})]);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(15000);
  page.on('pageerror',error=>findings.errors.push(error.message));
  page.on('request',request=>{if(new URL(request.url()).pathname==='/api/action')findings.actions.push(request.postDataJSON());});
  page.on('response',response=>{if(response.url().includes('/assets/p0/')&&!response.ok())findings.assetFailures.push({url:response.url(),status:response.status()});if(response.url().includes('/assets/p0/models/')&&response.ok())findings.modelLoads.push(path.basename(new URL(response.url()).pathname));});
  const nav=label=>page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:new RegExp(label)}).click();
  const operation=page.locator('.p0-operation-root');
  const primary=()=>operation.locator('.primary-action');
  const quantity=operation.getByRole('spinbutton',{name:'建造数量',exact:true});
  const read=()=>page.evaluate(()=>({planet:EmpireAPI.planet,player:EmpireAPI.state.player,now:EmpireAPI.state.now}));
  const selectPlanet=async id=>{
    const previous=await page.evaluate(()=>CommandApp.page);
    await page.getByRole('combobox',{name:'当前殖民地'}).selectOption(id);await page.waitForFunction(id=>EmpireAPI.planet.id===id,id);
    assert.equal(await page.evaluate(()=>CommandApp.page),previous,'switching colony must retain the research/shipyard page');
  };
  const perform=async click=>{const responsePromise=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/action');await click();const response=await responsePromise,data=await response.json();assert.equal(response.status(),200,data.error);await page.waitForFunction(()=>!EmpireAPI.busy);return data;};
  const resourceDelta=(before,after,cost,refund=false)=>{
    const elapsed=Math.max(0,(after.now-before.now)/1000)+2;
    cost.forEach((value,i)=>{
      const expected=before.planet.resources[i]+(refund?value:-value),actual=after.planet.resources[i];
      const allowance=Math.max(5,Math.abs(before.planet.economy.rate[i])*elapsed/3600+5);
      assert.ok(actual>=expected-2&&actual<=expected+allowance,`Resource ${i}: expected ${expected} plus production <= ${allowance}; got ${actual}`);
    });
  };
  const screenshot=async name=>{await page.waitForFunction(()=>!document.querySelector('#notification').classList.contains('show'),null,{timeout:6000});const file=path.join(output,name+'.png');await page.screenshot({path:file,fullPage:false,animations:'disabled'});findings.screenshots.push(file);};
  const layout=async name=>{
    const result=await page.evaluate(()=>{const host=document.querySelector('.p0-operation-root'),shadow=host.shadowRoot,vw=innerWidth;return {width:vw,height:innerHeight,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,panels:[...shadow.querySelectorAll('.operations-context,.research-workspace,.tech-detail,.research-dock,.fleet-catalog,.ship-main,.production-panel,.queue-dock')].map(e=>{const r=e.getBoundingClientRect();return {class:e.className,left:r.left,right:r.right,width:r.width};}),font:[...shadow.querySelectorAll('.tech-node .node-info strong')].slice(0,1).map(e=>({css:getComputedStyle(e).fontSize,scale:shadow.querySelector('.tree-blueprint').style.transform}))};});
    findings.layouts.push({name,...result});assert.ok(result.documentWidth<=result.width+1&&result.bodyWidth<=result.width+1,`${name}: horizontal document overflow`);assert.ok(result.panels.every(r=>r.left>=-1&&r.right<=result.width+1),`${name}: panel outside viewport ${JSON.stringify(result.panels)}`);
    await screenshot(name);
  };
  const readyModel=async()=>{await operation.locator('.stage-canvas canvas').waitFor({state:'visible'});await operation.locator('.stage-loading').waitFor({state:'hidden'});assert.equal(await operation.locator('.stage-fallback').count(),0,'3D model must render rather than failed-load fallback');};
  const ship=async name=>{await operation.locator('.fleet-card').filter({has:page.locator('b',{hasText:new RegExp('^'+name+'$')})}).click();await operation.locator('.ship-heading h1').filter({hasText:name}).waitFor();};

  await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>EmpireAPI.state?.player.name==='P0隔离浏览器验收');
  await nav('建设');
  if(!defenseOnly){
  await nav('研究');await operation.locator('.tech-node').first().waitFor();
  assert.equal(await page.locator('.p0-operation-root').count(),1);
  const tiers=await page.evaluate(()=>{
    const root=document.querySelector('.p0-operation-root').shadowRoot,tech=EmpireAPI.catalog.tech,memo={};
    function tier(id){return memo[id]??=Math.max(-1,...tech[id].req.filter(([p])=>tech[p]).map(([p])=>tier(p)))+1;}
    return Object.values(tech).map(t=>{const node=[...root.querySelectorAll('.tech-node')].find(n=>n.getAttribute('aria-label').startsWith(t.name+'，'));return {id:t.id,expected:tier(t.id),aria:node.getAttribute('aria-label'),x:parseFloat(node.style.left)};});
  });
  for(const t of tiers)assert.ok(t.aria.includes(`，${t.expected} 级科技，`),`${t.id}: prerequisite tier mismatch`);
  const firstX=Math.min(...tiers.map(t=>t.x));assert(tiers.filter(t=>t.expected===0).every(t=>t.x===firstX));
  assert.deepEqual(tiers.filter(t=>t.expected===0).map(t=>t.id).sort(),['Energy_Tech','Espionage_Tech','Computer_Tech','Weapons_Tech','Strength_Tech','Graviton_Tech'].sort());
  assert.equal(await operation.locator('.tree-tabs').count(),0);assert.equal(await operation.locator('.tree-links path').count(),15);
  record('正式主导航挂载研究树；16 项科技按真实前置分为 0/1/2/3 级，6 项无科技前置在最左，无四类筛选，15 条依赖线');
  await layout('research-1440');
  await page.setViewportSize({width:1280,height:720});await layout('research-1280x720');
  await page.setViewportSize({width:390,height:844});await layout('research-390');
  await primary().click({trial:true});await screenshot('research-390-action');
  await page.setViewportSize({width:1440,height:900});
  const originalTransform=await operation.locator('.tree-blueprint').getAttribute('style');await operation.getByRole('button',{name:'放大科技树'}).click();assert.notEqual(await operation.locator('.tree-blueprint').getAttribute('style'),originalTransform);
  const zoomedTransform=await operation.locator('.tree-blueprint').getAttribute('style'),treeBox=await operation.locator('.tree-viewport').boundingBox();await page.mouse.move(treeBox.x+10,treeBox.y+20);await page.mouse.down();await page.mouse.move(treeBox.x+55,treeBox.y+55,{steps:4});await page.mouse.up();assert.notEqual(await operation.locator('.tree-blueprint').getAttribute('style'),zoomedTransform);await operation.getByRole('button',{name:'定位选中科技'}).click();
  await operation.getByRole('textbox',{name:'搜索科技或舰型'}).fill('引力子');assert.match(await operation.locator('.tech-count').innerText(),/1 项匹配/);assert.equal(await operation.locator('.tech-node:not(.dimmed)').count(),1);await operation.getByRole('button',{name:'清空科技搜索'}).click();
  record('科技树缩放和搜索由真实 DOM 操作生效');
  const beforeResearch=await read(),cost=beforeResearch.planet.researchOptions.Energy_Tech.cost;
  const shownCost=await operation.locator('.research-action .cost-list strong').allTextContents();assert.deepEqual(shownCost,cost.map(n=>Math.floor(n).toLocaleString('en-US')));
  const started=await perform(()=>primary().click());assert.equal(started.player.researchQueue.id,'Energy_Tech');assert.deepEqual(started.player.researchQueue.cost,cost);resourceDelta(beforeResearch,await read(),cost);
  assert.match(await operation.locator('.research-dock').innerText(),/能量科技|能源科技/);
  await selectPlanet(colony.id);assert.match(await operation.locator('.operations-context').innerText(),/P0验收边境星.*研究实验室 Lv 1/s);assert.equal(await operation.getByRole('button',{name:'其他星球研究中',exact:true}).isDisabled(),true);assert.match(await primary().innerText(),/实验室正在研究/);
  assert.equal((await read()).player.researchQueue.planet,home.id);
  await selectPlanet(home.id);const beforeCancel=await read();const canceled=await perform(()=>operation.getByRole('button',{name:'取消研究',exact:true}).click());assert.equal(canceled.player.researchQueue,null);resourceDelta(beforeCancel,await read(),cost,true);
  record('研究成本来自服务器；开始真实扣费，全帝国共享队列；其他殖民地无法取消，回原星取消全额返还');

  // Hold the real action request while testing busy state; all mutation still goes through DOM.
  let releaseRequest;const gate=new Promise(resolve=>releaseRequest=resolve);
  await page.route('**/api/action',async route=>{await gate;await route.continue();},{times:1});
  const beforeBusy=findings.actions.length,responsePending=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/action');
  await primary().click();await page.waitForFunction(()=>EmpireAPI.busy);assert.equal(await primary().isDisabled(),true);assert.match(await primary().innerText(),/正在提交/);
  const busyBox=await primary().boundingBox();await page.mouse.click(busyBox.x+busyBox.width/2,busyBox.y+busyBox.height/2,{clickCount:2});assert.equal(findings.actions.length,beforeBusy+1,'busy UI must not submit duplicate actions');releaseRequest();assert.equal((await responsePending).status(),200);await page.waitForFunction(()=>!EmpireAPI.busy);await perform(()=>operation.getByRole('button',{name:'取消研究',exact:true}).click());
  await page.route('**/api/action',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'P0隔离验收：服务器拒绝该操作'})}),{times:1});
  const rejectWait=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/action');await primary().click();assert.equal((await rejectWait).status(),400);await page.waitForFunction(()=>!EmpireAPI.busy);assert.match(await page.locator('#notification').innerText(),/P0隔离验收：服务器拒绝该操作/);assert.equal((await read()).player.researchQueue,null);assert.equal(await primary().isDisabled(),false);
  record('提交中禁用按钮并阻止重复请求；服务器错误显示，失败后按钮恢复且无虚假队列');

  await nav('造舰');await readyModel();assert.match(await operation.locator('.ship-heading').innerText(),/巡洋舰/);
  await quantity.fill('7');await quantity.press('Tab');
  const poll=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/state');await poll;await page.waitForFunction(()=>!EmpireAPI.busy);assert.equal(await quantity.inputValue(),'7','quantity survives server polling');
  record('造舰导航进入真实舰船面板；数量输入在服务器轮询后保留');
  await quantity.fill('2');await quantity.press('Tab');await layout('shipyard-1440');
  await page.setViewportSize({width:1280,height:720});await layout('shipyard-1280x720');
  const quantityBox=await quantity.boundingBox(),detailBox=await operation.locator('.production-detail-body').boundingBox();assert(quantityBox.y>=detailBox.y&&quantityBox.y+quantityBox.height<=detailBox.y+detailBox.height,'720p quantity input should be visible before scrolling');
  await quantity.fill('2');await primary().click({trial:true});await screenshot('shipyard-1280x720-production');await page.setViewportSize({width:390,height:844});await layout('shipyard-390');await quantity.fill('2');await primary().click({trial:true});await screenshot('shipyard-390-production');await page.setViewportSize({width:1440,height:900});
  await ship('轻型战机');await readyModel();await quantity.fill('2');await quantity.press('Tab');
  const beforeShips=await read(),shipCost=await page.evaluate(()=>EmpireAPI.catalog.units.Light_Fighter.cost.map(n=>n*2)),initialStock=beforeShips.planet.ships.Light_Fighter;
  const built=await perform(()=>primary().click()),builtHome=built.planets.find(p=>p.id===home.id);assert.equal(builtHome.shipQueue[0].id,'Light_Fighter');assert.equal(builtHome.shipQueue[0].count,2);resourceDelta(beforeShips,await read(),shipCost);
  assert.match(await operation.locator('.queue-dock').innerText(),/轻型战机/);assert.equal(await operation.locator('.queue-dock button').count(),0,'production cannot be canceled');
  await page.waitForFunction(({id,count})=>EmpireAPI.planet.id===id&&EmpireAPI.planet.ships.Light_Fighter===count&&EmpireAPI.planet.shipQueue.length===0,{id:home.id,count:initialStock+2},{timeout:20000});
  record('2 艘轻型战机真实扣费进入本星队列，完成后驻港库存 +2；生产队列无取消入口');
  await selectPlanet(colony.id);assert.match(await operation.locator('.operations-context').innerText(),/P0验收边境星.*太空电梯 Lv 1/s);assert.match(await operation.locator('.queue-dock').innerText(),/火箭/);assert.equal((await read()).planet.resources[2],33333);assert.equal(await operation.locator('.fleet-card[aria-pressed="true"] em').innerText(),'驻港 2 艘');
  await ship('巡洋舰');assert.match(await primary().innerText(),/前置条件未满足/);assert.equal(await primary().isDisabled(),true);await selectPlanet(home.id);assert.match(await operation.locator('.queue-dock').innerText(),/船坞空闲/);assert.equal(await primary().isDisabled(),false);
  record('切换殖民地保持研究/造舰当前页，并同步设施等级、资源、驻港库存和独立生产队列；低级船坞限制立即生效');

  for(const [category,names]of [['战斗舰船',['轻型战机','重型战机','巡洋舰','战列舰','无畏舰','行星轰炸机','驱逐舰']],['民用舰船',['轻型运输舰','重型运输舰','殖民舰','回收舰','探测器','太阳能卫星']]]){
    await operation.getByRole('button',{name:category,exact:true}).click();
    const visibleNames=await operation.locator('.fleet-card b').allTextContents();
    for(const name of names){assert(visibleNames.includes(name),`missing ship ${name}`);await ship(name);await readyModel();assert.equal(await operation.locator('.fleet-card[aria-pressed="true"] img').evaluate(img=>img.complete&&img.naturalWidth>0),true);}
  }
  assert.equal(findings.assetFailures.length,0,JSON.stringify(findings.assetFailures));record('13 舰型 APK 列表图和对应项目重建 GLB 均加载成功，无失败降级图');
  }else{await nav('造舰');await readyModel();}
  await operation.getByRole('button',{name:'行星防御',exact:true}).click();
  const defenseModels=[['Rocket_Launcher','火箭发射器'],['Light_Laser','轻型激光炮'],['Heavy_Laser','重型激光炮'],['MK2_Cannon','磁轨炮'],['Ion_Cannon','中子炮'],['Plasma_Cannon','等离子炮塔'],['Small_Shield_Dome','小型防护盾'],['Large_Shield_Dome','大型防护盾']];
  const settleFrames=()=>page.evaluate(()=>new Promise(resolve=>{let left=18;const frame=()=>--left?requestAnimationFrame(frame):resolve();requestAnimationFrame(frame);}));
  const stageImage=async name=>{const file=path.join(output,name+'.png');await settleFrames();await operation.locator('.ship-stage').screenshot({path:file,animations:'disabled'});findings.screenshots.push(file);};
  for(const[id,name]of defenseModels){
    await ship(name);await readyModel();assert.equal(await operation.locator('.stage-canvas canvas').count(),1);assert(findings.modelLoads.includes(id+'.glb'),`correct model request missing: ${id}`);
    const bytes=fs.readFileSync(path.resolve('opendesign/mockups/galactic-command/assets/p0/models',id+'.glb')),json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());assert(json.nodes.some(n=>n.extras?.previewShipId===id),`GLB identity mismatch: ${id}`);
    await stageImage('defense-'+id+'-stage');await screenshot('defense-'+id+'-1440');
  }
  record('6 种炮台和大小防护盾共 8 个现有模型均加载正确 ID，无静态降级图，逐个保留三维截图');
  await ship('等离子炮塔');await readyModel();await settleFrames();
  const defenseCanvas=operation.locator('.stage-canvas canvas'),initialDefense=await defenseCanvas.screenshot({animations:'disabled'}),canvasBox=await defenseCanvas.boundingBox();
  await page.mouse.move(canvasBox.x+canvasBox.width*.55,canvasBox.y+canvasBox.height*.45);await page.mouse.down();await page.mouse.move(canvasBox.x+canvasBox.width*.75,canvasBox.y+canvasBox.height*.57,{steps:15});await page.mouse.up();await settleFrames();assert.notDeepEqual(await defenseCanvas.screenshot({animations:'disabled'}),initialDefense,'drag changes the defense viewpoint');
  await operation.getByRole('button',{name:'复位防御设施视角',exact:true}).click();await stageImage('defense-Plasma_Cannon-reset');
  await operation.getByRole('button',{name:'自动旋转',exact:true}).click();assert.equal(await operation.getByRole('button',{name:'自动旋转',exact:true}).getAttribute('aria-pressed'),'true');await settleFrames();await operation.getByRole('button',{name:'自动旋转',exact:true}).click();assert.equal(await operation.getByRole('button',{name:'自动旋转',exact:true}).getAttribute('aria-pressed'),'false');
  await operation.getByRole('button',{name:'复位防御设施视角',exact:true}).click();
  await page.mouse.move(canvasBox.x+canvasBox.width*.5,canvasBox.y+canvasBox.height*.5);await page.mouse.wheel(0,-240);await settleFrames();assert.notDeepEqual(await defenseCanvas.screenshot({animations:'disabled'}),initialDefense,'wheel zoom changes the defense viewpoint');await operation.getByRole('button',{name:'复位防御设施视角',exact:true}).click();
  for(const[id,name]of [['Rocket_Launcher','火箭发射器'],['Plasma_Cannon','等离子炮塔'],['Small_Shield_Dome','小型防护盾'],['Large_Shield_Dome','大型防护盾']]){
    await ship(name);await readyModel();await page.setViewportSize({width:1280,height:720});await layout('defense-'+id+'-1280x720');await stageImage('defense-'+id+'-720-stage');
    await page.setViewportSize({width:390,height:844});await operation.getByRole('button',{name:'复位防御设施视角',exact:true}).click();await layout('defense-'+id+'-390');await stageImage('defense-'+id+'-390-stage');await page.setViewportSize({width:1440,height:900});
  }
  await operation.getByRole('button',{name:'战斗舰船',exact:true}).click();await ship('巡洋舰');await readyModel();assert.equal(await operation.getByRole('button',{name:'复位舰船视角',exact:true}).count(),1);await stageImage('defense-switch-Cruiser');
  await operation.getByRole('button',{name:'行星防御',exact:true}).click();
  for(const name of ['拦截导弹','星际导弹']){await ship(name);assert.equal(await operation.locator('.stage-canvas canvas').count(),0);assert.equal(await operation.locator('.stage-fallback').evaluate(img=>img.complete&&img.naturalWidth>0),true);assert.equal(await operation.getByRole('button',{name:'自动旋转',exact:true}).count(),0);await screenshot('defense-static-'+(name==='拦截导弹'?'Interceptor_Missile':'Interplanetary_Missile'));}
  for(const name of ['火箭发射器','大型防护盾','磁轨炮','拦截导弹','轻型激光炮'])await ship(name);
  await readyModel();assert.equal(await operation.locator('.stage-canvas canvas').count(),1);await stageImage('defense-rapid-return-Light_Laser');
  record('防御拖动旋转、滚轮缩放、自动旋转与复位可操作；720/390 布局可见；舰船→防御→两种导弹→防御切换仅保留当前模型');
  await ship('小型防护盾');assert.match(await primary().innerText(),/每种护盾罩限建一个/);assert.equal(await primary().isDisabled(),true);
  await ship('拦截导弹');await quantity.fill('2');assert.match(await primary().innerText(),/导弹储位不足/);assert.equal(await primary().isDisabled(),true);await quantity.fill('1');assert.equal(await primary().isDisabled(),false);
  await ship('星际导弹');assert.match(await primary().innerText(),/导弹储位不足/);assert.equal(await primary().isDisabled(),true);
  record('行星防御入口可用；已有护盾限制、导弹储位和星际导弹双倍占位符合真实库存');
  const operationText=await operation.innerText();assert.doesNotMatch(operationText,/重置示例|示例速度|加速演示|取消生产|取消建造/);
  await operation.getByRole('button',{name:'战斗舰船',exact:true}).click();await ship('巡洋舰');await readyModel();await screenshot('shipyard-final-1440');
  if(!defenseOnly){await nav('研究');await screenshot('research-final-1440');}
  assert.equal(findings.errors.length,0,findings.errors.join('\n'));assert.equal(findings.assetFailures.length,0);
  record(defenseOnly?'防御模型三尺寸面板无横向越界，无页面异常或模型加载失败':'1440×900、1280×720、390×844 研究/造舰面板无横向越界；无示例速度或重置控件；无页面异常');
  findings.passed=true;
}catch(error){
  findings.passed=false;findings.failure=error.stack;
  if(page)try{const file=path.join(output,'failure.png');await page.screenshot({path:file,fullPage:false});findings.screenshots.push(file);}catch{}
  console.error(error.stack);process.exitCode=1;
}finally{
  await browser?.close();
  if(server&&server.exitCode===null){const exited=once(server,'exit');server.kill();await exited;}
  const absolute=path.resolve(directory),tmp=path.resolve(os.tmpdir());assert.ok(absolute.startsWith(tmp+path.sep)&&path.basename(absolute).startsWith('command-p0-browser-'),'cleanup target must remain in dedicated OS temp directory');
  fs.rmSync(absolute,{recursive:true,force:true});findings.cleanedUp=!fs.existsSync(absolute);findings.finishedAt=new Date().toISOString();
  const reportName=defenseOnly?'defense-model-verification':'verification';
  fs.writeFileSync(path.join(output,reportName+'.json'),JSON.stringify(findings,null,2));
  fs.writeFileSync(path.join(output,reportName+'.md'),`# 正式 P0 ${defenseOnly?'防御模型专项':'浏览器集成'}验收\n\n自动检查：${findings.passed?'通过':'未通过'}。独立随机端口 ${findings.port}，测试账号 P0隔离浏览器验收，临时存档与会话；finally 已关闭浏览器/服务并清理目录：${findings.cleanedUp}。\n\n${findings.checks.map(c=>'- '+c).join('\n')}\n\n${findings.failure?'## 未通过项\n\n```\n'+findings.failure+'\n```\n':''}模型为项目已有重建，不能视为 APK 原生 3D 或承诺与原图外形完全一致。截图取景还应独立人工检查。\n`);
  console.log(JSON.stringify({passed:findings.passed,checks:findings.checks.length,errors:findings.errors,cleanedUp:findings.cleanedUp,output},null,2));
}
