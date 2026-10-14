// Focused archive/default-route regression. Uses only an isolated save and a
// four-ship replay; does not alter the frozen baseline or certified evidence.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {root,startServer,playwright,createFixture} from './three-battle-harness.mjs';

const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const directory=path.join(root,'output/playwright/three-archive',stamp);
const basePath='/opendesign/mockups/galactic-command/';
const fleet={Dreadnought:1,Reaper:1};
const fixture=createFixture({seconds:2,fleet});
fixture.replay.report.title='归档入口回归 · 四舰独立回放';
fixture.replay.report.at=Date.now();
fixture.replay.report.read=true;
const result={startedAt:new Date().toISOString(),directory,fixture:{ships:4,seconds:2,seed:42},checks:[],errors:[],httpErrors:[],passed:false};
fs.mkdirSync(directory,{recursive:true});

function verifyArchive(){
  const archive=path.join(root,'opendesign/mockups/galactic-command/legacy-webgl');
  const bytes=fs.readFileSync(path.join(archive,'manifest.json'));
  const manifest=JSON.parse(bytes),files={};
  for(const [name,expected] of Object.entries(manifest.files)){
    const data=fs.readFileSync(path.join(archive,name));
    const sha256=createHash('sha256').update(data).digest('hex');
    assert.equal(data.length,expected.bytes,`${name}: frozen byte count`);
    assert.equal(sha256,expected.sha256,`${name}: frozen hash`);
    files[name]={bytes:data.length,sha256};
  }
  return {version:manifest.version,manifestSha256:createHash('sha256').update(bytes).digest('hex'),files};
}

let server,browser,context;
function watch(page,label){
  page.on('pageerror',error=>result.errors.push({label,kind:'pageerror',message:error.message}));
  page.on('console',message=>{if(message.type()==='error')result.errors.push({label,kind:'console',message:message.text()});});
  page.on('response',response=>{if(response.status()>=400)result.httpErrors.push({label,url:response.url(),status:response.status()});});
  return page;
}
async function ready(target,{engine='three',replay=false,battle=false,practice=false}={}){
  await target.waitForFunction(({replay,battle})=>window.GalacticDemo?.renderer&&document.documentElement.dataset.ready==='true'&&(!(replay||battle)||window.flightController?.metadata?.length===4),{replay,battle},{timeout:60000});
  const state=await target.evaluate(()=>{
    const demo=window.GalacticDemo,r=demo.renderer,c=window.flightController;
    return {url:location.href,three:r.three?.isWebGLRenderer===true,glError:r.gl.getError(),shaderErrors:r.shaderErrors??[],replay:!!c?.replay,controller:!!c,ship:demo.ships[demo.state.shipIndex]?.id,mode:demo.state.mode,deathStar:demo.deathActive?.()??false};
  });
  assert.equal(state.three,engine==='three',`${state.url}: actual renderer`);
  assert.equal(state.glError,0);assert.deepEqual(state.shaderErrors,[]);
  if(replay)assert.equal(state.replay,true);
  if(practice)assert.equal(state.controller,false,'practice must not create a live/replay controller');
  return state;
}
async function check(name,run){
  const entry={name};result.checks.push(entry);
  try{entry.evidence=await run();entry.passed=true;console.log(`PASS ${name}`);}
  catch(error){entry.passed=false;entry.error=error.stack;throw error;}
}

try{
  result.archiveBefore=verifyArchive();
  server=await startServer({directory:path.join(directory,'server'),live:true,fleet});
  result.server={base:server.base,save:server.save,battleId:server.battle.id};
  browser=await playwright().chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!process.argv.includes('--headed'),args:['--use-angle=d3d11']});
  context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addCookies([{name:'empire',value:server.player.id,url:server.base}]);
  // Preserve the real isolated player/planet/API state. Add one saved spatial
  // report to the lobby only; both replay renderers receive the same bytes.
  await context.route('**/api/state*',async route=>{
    const response=await route.fetch(),data=await response.json();
    data.reports=[fixture.replay.report,...(data.reports??[]).filter(report=>report.id!==fixture.replay.report.id)];
    await route.fulfill({response,json:data});
  });
  await context.route(`**/api/replay/${fixture.replay.report.id}`,route=>route.fulfill({json:fixture.replay}));
  const main=watch(await context.newPage(),'main');
  await main.goto(server.base+'/');
  await main.waitForFunction(()=>window.EmpireAPI?.state&&window.CommandApp,null,{timeout:60000});
  await main.locator('.bottom-bar [data-page="battle"]').click();
  await check('main default is Three.js',async()=>{
    assert.equal(await main.locator('[data-renderer]').inputValue(),'three');
    assert.match(await main.locator('[data-renderer] option[value="native"]').innerText(),/归档/);
    const practice=await main.locator('.battle-lobby > header > a').getAttribute('href');
    assert.match(practice,/^hangar-three\.html\?/);
    await main.screenshot({path:path.join(directory,'main-default-three.png')});
    return {selected:'three',practice};
  });
  for(const engine of ['three','native'])for(const kind of ['battle','replay']){
    await check(`main ${engine} ${kind} route`,async()=>{
      await main.locator('[data-renderer]').selectOption(engine);
      const id=kind==='battle'?server.battle.id:fixture.replay.report.id;
      await main.locator(`[data-open-${kind}="${id}"]`).click();
      const frame=await main.locator('.battle-frame').elementHandle().then(handle=>handle.contentFrame());
      const expected=engine==='native'?'legacy-webgl/battlefield.html':'battlefield-three.html';
      await frame.waitForURL(url=>url.pathname===basePath+expected&&url.searchParams.get(kind)===id,{timeout:60000});
      const state=await ready(frame,{engine:engine==='native'?'legacy':'three',[kind]:true});
      await main.screenshot({path:path.join(directory,`main-${engine}-${kind}.png`)});
      await frame.locator('#native-leave').click();
      await main.waitForFunction(()=>document.querySelector('.battle-frame')?.hidden===true);
      return state;
    });
  }
  await main.close();

  const aliases=[
    {name:'old battlefield battle alias',from:'battlefield.html',to:'battlefield-three.html',query:`?battle=${server.battle.id}&map=planet&ship=Reaper&proof=a%2Bb`,hash:'#archive-battle',battle:true},
    {name:'old battlefield replay alias',from:'battlefield.html',to:'battlefield-three.html',query:`?replay=${fixture.replay.report.id}&ship=Reaper&proof=a%2Bb`,hash:'#archive-replay',replay:true},
    {name:'old hangar practice alias',from:'hangar.html',to:'hangar-three.html',query:'?ship=Reaper&entry=direct-flight-01&map=nebula&proof=a%2Bb',hash:'#archive-range',practice:true},
    {name:'death-star remains archived',from:'hangar.html',to:'legacy-webgl/hangar.html',query:'?map=death-star&ship=Reaper&entry=direct-flight-01&proof=a%2Bb',hash:'#archive-surface',engine:'legacy',practice:true}
  ];
  for(const item of aliases)await check(item.name,async()=>{
    const page=watch(await context.newPage(),item.name),battleRequests=[];
    page.on('request',request=>{if(/\/api\/(?:battles?|replay)(?:\/|\?|$)/.test(new URL(request.url()).pathname))battleRequests.push(request.url());});
    await page.goto(server.base+basePath+item.from+item.query+item.hash);
    await page.waitForURL(url=>url.pathname===basePath+item.to,{timeout:60000});
    const url=new URL(page.url());assert.equal(url.search,item.query);assert.equal(url.hash,item.hash);
    const state=await ready(page,item);
    if(item.practice)assert.deepEqual(battleRequests,[],'practice never calls battle APIs');
    if(item.engine==='legacy')assert.equal(state.deathStar,true,'old terrain remains available only through archive');
    else if(item.practice)assert.equal(state.ship,'Reaper');
    await page.screenshot({path:path.join(directory,item.name.replaceAll(' ','-')+'.png')});
    await page.close();return {...state,battleRequests};
  });
  await check('Reaper atlas enters independent Three.js practice',async()=>{
    const page=watch(await context.newPage(),'atlas-practice'),battleRequests=[];
    page.on('request',request=>{if(/\/api\/(?:battles?|replay)(?:\/|\?|$)/.test(new URL(request.url()).pathname))battleRequests.push(request.url());});
    await page.goto(server.base+basePath+'ships.html?ship=Reaper');
    await page.waitForFunction(()=>window.ShipAtlas?.selected==='Reaper'&&window.ShipAtlas.current,null,{timeout:60000});
    const href=await page.locator('#enter-range').getAttribute('href');
    const destination=new URL(href,page.url());
    assert.equal(destination.pathname,basePath+'hangar-three.html');assert.equal(destination.searchParams.get('ship'),'Reaper');assert.equal(destination.searchParams.get('entry'),'direct-flight-01');
    await page.locator('#enter-range').click();
    await page.waitForURL(destination.href,{timeout:60000});
    const state=await ready(page,{practice:true});assert.equal(state.ship,'Reaper');
    await page.waitForTimeout(500);assert.deepEqual(battleRequests,[]);
    await page.screenshot({path:path.join(directory,'atlas-reaper-practice.png')});
    await page.close();return {...state,href,battleRequests};
  });
  result.archiveAfter=verifyArchive();assert.deepEqual(result.archiveAfter,result.archiveBefore);
  await check('frozen archive and browser errors',async()=>{
    assert.deepEqual(result.errors,[]);assert.deepEqual(result.httpErrors,[]);
    return {archiveFiles:Object.keys(result.archiveAfter.files).length,manifestUnchanged:true,pageErrors:0,httpErrors:0};
  });
  result.passed=true;
}catch(error){result.failure=error.stack;process.exitCode=1;console.error(error);}
finally{
  await context?.close().catch(()=>{});await browser?.close().catch(()=>{});await server?.stop();
  result.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify(result,null,2));
  console.log(`Archive regression ${result.passed?'passed':'failed'}: ${path.join(directory,'results.json')}`);
}
