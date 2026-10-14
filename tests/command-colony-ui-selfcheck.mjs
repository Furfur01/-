import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {createWorld,createPlayer,snapshot,act} from '../game/engine.mjs';
import {publicCatalog} from '../game/catalog.mjs';

// Exercise production UI against an in-memory universe. No real save or server is opened.
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/galactic-command');
const output=path.join(root,'output/galactic-command-verification');fs.mkdirSync(output,{recursive:true});
const world=createWorld(),player=createPlayer(world,'综合体验收',world.at,()=>.5),home=world.planets[player.home];
home.biome='mercury';home.name='金属综合体验收';home.resources=[1e7,1e7,1e7];home.fields=1000;
home.buildings={Command_Center:3,Metal_Mine:2,Crystal_Mine:2,Gas_Mine:2,Metal_Storage:4,Crystal_Storage:4,Gas_Storage:4,Solar_Plant:15,Shipyard:8,Robotics_Facility:4,Research_Lab:8,Missile_Silo:4};
player.tech={Energy_Tech:12,Computer_Tech:8,Combustion_Drive:6};
const moon=structuredClone(home);Object.assign(moon,{id:'colony-ui-moon',name:'月球兼容验收',moon:true,biome:null,parent:home.id,buildings:{Moon_Base:8,Metal_Storage:2,Crystal_Storage:2,Gas_Storage:2,Shipyard:4,Robotics_Facility:2}});world.planets[moon.id]=moon;
const requests=[],errors=[],checks=[];
const stub=`window.PlanetScene=class{constructor(container,callbacks){this.callbacks=callbacks;this.selections=[];this.close=false;container.innerHTML='<canvas aria-label="隔离场景占位"></canvas>';}updatePlanet(p){this.appearance=p.biome;this.planet=p;}selectBuilding(id){this.selections.push(id);}setMode(mode){this.mode=mode;}approach(){this.close=true;this.callbacks.onApproach(true);}orbit(){this.close=false;this.callbacks.onApproach(false);}};`;
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost'),json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
  try{
    if(url.pathname==='/api/session/local')return json({source:'isolated-ui'});
    if(url.pathname==='/api/catalog')return json(publicCatalog);
    if(url.pathname==='/api/state')return json(snapshot(world,player));
    if(url.pathname==='/api/action'){let data='';for await(const chunk of req)data+=chunk;const action=JSON.parse(data);requests.push(action);act(world,player,action,world.at);return json(snapshot(world,player));}
    const name=url.pathname.split('/').at(-1)||'index.html';
    if(name==='planet.bundle.js'){res.setHeader('Content-Type','text/javascript');return res.end(stub);}
    if(!['index.html','command.js','command.css','api.js','mass-battle.js'].includes(name)){res.statusCode=404;return res.end();}
    res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(path.join(dir,name)));
  }catch(error){res.statusCode=400;json({error:error.message});}
});
server.listen(0,'127.0.0.1');await once(server,'listening');let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CommandApp?.scene&&EmpireAPI.state);
  const nav=label=>page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:label,exact:false}).click();
  await nav('建设');assert.equal(await page.locator('#content-page.colony-sidebar.active').count(),1);
  assert.equal(await page.locator('#page-body [data-build]').count(),14,'all 14 functional surface buildings appear once');
  for(const id of ['Metal_Storage','Crystal_Storage','Gas_Storage'])assert.equal(await page.locator(`[data-build="${id}"]`).count(),0,'ordinary worlds have no independent warehouse upgrade');
  for(const id of ['Metal_Mine','Crystal_Mine','Gas_Mine'])assert.equal(await page.locator(`[data-build="${id}"]`).isDisabled(),false,'import complexes remain upgradeable');
  assert.match(await page.locator('#page-body').innerText(),/行星保障中心/);
  checks.push('14 surface functions, unified upgrade entries, imported-resource storage remains upgradeable');
  await page.locator('#page-body [data-building="Crystal_Mine"]').click();
  assert.equal(await page.locator('#detail-modal').evaluate(el=>el.matches(':modal')),false,'building drawer must not block the planet');
  assert.match(await page.locator('#modal-body').innerText(),/仅作进口仓储/);
  assert.match(await page.locator('#modal-body').innerText(),/升级后容量/);
  const selections=await page.evaluate(()=>CommandApp.scene.selections.length);
  await page.evaluate(()=>EmpireAPI.refresh());
  assert.equal(await page.evaluate(()=>CommandApp.scene.selections.length),selections,'refresh preserves camera position');
  let response=page.waitForResponse(r=>r.url().endsWith('/api/action'));
  await page.locator('#modal-body [data-build="Crystal_Mine"]').click();assert.equal((await response).status(),200);
  assert.equal(requests.at(-1).id,'Crystal_Mine');assert.equal(home.buildQueue.id,'Crystal_Mine');
  assert.equal(snapshot(world,player).planets.find(p=>p.id===home.id).economy.rate[1],0,'warehouse operation never adds foreign-resource production');
  response=page.waitForResponse(r=>r.url().endsWith('/api/action'));await page.locator('#modal-body [data-cancel="build"]').click();assert.equal((await response).status(),200);
  await page.locator('#close-modal').click();
  checks.push('real canonical build/cancel API, no foreign production, non-modal drawer, no refresh refocus');
  await nav('造舰');assert.match(await page.locator('#page-title').innerText(),/太空电梯.*轨道船坞/);assert.equal(await page.locator('#content-page.colony-sidebar.active').count(),1);
  await nav('研究');assert.equal(await page.locator('#content-page.colony-sidebar.active').count(),1);
  await page.locator('#page-actions [data-page="home"]').click();
  for(const id of ['Metal_Storage','Crystal_Storage','Gas_Storage'])assert.equal(await page.locator(`#resource-operations [data-building="${id}"]`).count(),0);
  await page.locator('#resource-operations .storage-link[data-building="Metal_Mine"]').click();assert.match(await page.locator('#modal-title').innerText(),/金属开采综合体/);
  await page.locator('#close-modal').click();
  checks.push('research/shipyard retain planet, resource capacity link opens unified complex');
  await page.locator('#planet-picker').selectOption(moon.id);await nav('建设');
  for(const id of ['Metal_Storage','Crystal_Storage','Gas_Storage'])assert.equal(await page.locator(`#page-body [data-build="${id}"]`).count(),1,'moon keeps independent storage');
  assert.equal(await page.locator('#page-body [data-build="Metal_Mine"]').count(),0);checks.push('moon storage behavior preserved');
  await page.locator('#planet-picker').selectOption(home.id);await nav('建设');await page.setViewportSize({width:390,height:844});
  const bounds=await page.locator('#content-page').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y>=150,'mobile panel leaves an operable planet region');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
  await page.locator('#page-body [data-building="Metal_Mine"]').click();const drawer=await page.locator('#detail-modal').boundingBox();assert.ok(drawer.x>=0&&drawer.x+drawer.width<=390&&drawer.y>150);
  checks.push('mobile panel and drawer fit 390px and leave the planet visible');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(output,'colony-ui-verification.json'),JSON.stringify({checks,requests,errors},null,2));console.log(JSON.stringify({checks,actions:requests.length,errors},null,2));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
