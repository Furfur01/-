import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {playwright,sourceFingerprint} from './three-battle-harness.mjs';
import {battleStorage} from '../game/battle-storage.mjs';

const linksFile=path.resolve(process.argv[2]??''),oldBase=process.argv[3];
if(!process.argv[2])throw Error('Usage: node tests/three-battle-launch-verification.mjs PATH/links.json [OLD_BASE]');
const links=JSON.parse(fs.readFileSync(linksFile,'utf8')),directory=path.dirname(linksFile),base=new URL(links.command).origin;
const report={verifiedAt:new Date().toISOString(),linksFile,serverPID:links.pid,source:sourceFingerprint().sha256,launches:{},oldServerRestart:null,command:null,practice:null,errors:[]};
const {chromium}=playwright(),browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,args:['--use-angle=d3d11']});
function watch(page){const result={errors:[],httpErrors:[],posts:[]};page.on('pageerror',error=>result.errors.push(error.message));page.on('console',message=>{if(message.type()==='error')result.errors.push(message.text()+' ['+(message.location().url??'')+']');});page.on('response',response=>{if(response.status()>=400)result.httpErrors.push({status:response.status(),url:response.url()});});page.on('request',request=>{if(request.method()==='POST')result.posts.push({url:request.url(),body:request.postDataJSON()});});return result;}
async function openCold(url,engine){
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});assert.deepEqual(await context.cookies(),[],'context starts without cookies');
  const page=await context.newPage(),observed=watch(page);
  try{
    await page.goto(url);await page.waitForFunction(()=>window.GalacticDemo?.renderer&&window.flightController?.metadata?.length===1000,null,{timeout:60000});await page.waitForTimeout(350);
    const state=await page.evaluate(()=>{const c=flightController,r=GalacticDemo.renderer;return {url:location.href,battle:new URL(location.href).searchParams.get('battle'),snapshotBattle:c.snapshot?.id,metadata:c.metadata.length,initialSides:Object.fromEntries(['attacker','defender'].map(side=>[side,c.metadata.filter(m=>m.side===side).length])),alive:c.rows.filter(row=>row[6]>0).length,controlled:c.controlled,renderer:r.three?'three':'native',gl:r.gl.getError(),ready:document.documentElement.dataset.ready};});
    report.lastLaunchAttempt={url,engine,state,observed};
    assert.equal(state.renderer,engine==='three'?'three':'native');assert.equal(state.metadata,1000);assert.deepEqual(state.initialSides,{attacker:500,defender:500});assert.equal(state.battle,state.snapshotBattle);assert.equal(state.controlled,null);assert.equal(state.gl,0);assert.deepEqual(observed.errors,[]);assert.deepEqual(observed.httpErrors,[]);assert.ok(observed.posts.every(post=>/\/api\/(session\/local|battle-trial)$/.test(post.url)),'launch never claims control');
    return {...state,...observed,coldContext:true};
  }finally{await context.close();}
}
try{
  for(const engine of ['three','legacy']){report.launches[engine]=await openCold(links[engine],engine);console.log(JSON.stringify({engine,battle:report.launches[engine].battle,ships:report.launches[engine].metadata}));}
  assert.equal(report.launches.three.battle,report.launches.legacy.battle,'both helpers reuse the same active trial');
  const commandContext=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),commandPage=await commandContext.newPage(),commandObserved=watch(commandPage);
  try{
    await commandPage.goto(base+'/');await commandPage.waitForFunction(()=>window.CommandApp&&window.EmpireAPI?.state?.player,null,{timeout:60000});
    await commandPage.locator('[data-page="battle"]').first().click();await commandPage.locator('[data-renderer]').waitFor();
    report.command=await commandPage.evaluate(()=>({defaultRenderer:document.querySelector('[data-renderer]').value,links:[...document.querySelectorAll('.battle-lobby header a')].map(a=>({label:a.textContent,href:a.href}))}));
    Object.assign(report.command,commandObserved);assert.equal(report.command.defaultRenderer,'three');assert.ok(report.command.links.find(link=>link.label.includes('原版靶场'))?.href.includes('/legacy-webgl/hangar.html'));assert.ok(report.command.links.find(link=>link.label.includes('进入靶场'))?.href.includes('/hangar-three.html'));assert.deepEqual(commandObserved.errors,[]);assert.deepEqual(commandObserved.httpErrors,[]);
  }finally{await commandContext.close();}
  const practiceContext=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),practicePage=await practiceContext.newPage(),practiceObserved=watch(practicePage),apiRequests=[];
  practicePage.on('request',request=>{if(new URL(request.url()).pathname.startsWith('/api/'))apiRequests.push(request.url());});
  try{
    await practicePage.goto(links.practice);await practicePage.waitForFunction(()=>window.GalacticDemo?.renderer&&GalacticDemo.state.mode==='flight',null,{timeout:60000});await practicePage.evaluate(()=>GalacticDemo.fireMain());await practicePage.waitForTimeout(500);
    report.practice={...await practicePage.evaluate(()=>({url:location.href,controllerAbsent:!window.flightController,renderer:!!GalacticDemo.renderer.three,frames:GalacticDemo.state.frames,gl:GalacticDemo.renderer.gl.getError(),ship:GalacticDemo.ships[GalacticDemo.state.shipIndex].id,charging:GalacticDemo.state.flight.charging,mainShots:GalacticDemo.state.flight.mainShots})),apiRequests,...practiceObserved};
    assert.equal(report.practice.controllerAbsent,true);assert.equal(report.practice.renderer,true);assert.equal(report.practice.gl,0);assert.equal(report.practice.ship,'Dreadnought');assert.ok(report.practice.frames>3);assert.deepEqual(apiRequests,[]);assert.deepEqual(practiceObserved.errors,[]);assert.deepEqual(practiceObserved.httpErrors,[]);
  }finally{await practiceContext.close();}
  if(oldBase){
    const oldThree=new URL(links.three),oldLegacy=new URL(links.legacy);oldThree.host=new URL(oldBase).host;oldLegacy.host=new URL(oldBase).host;
    const first=await openCold(oldThree.href,'three'),second=await openCold(oldLegacy.href,'legacy');
    const creations=first.posts.filter(post=>post.url.endsWith('/api/battle-trial'));
    assert.equal(creations.length,1,'finished old trial triggers exactly one new trial');assert.equal(second.posts.filter(post=>post.url.endsWith('/api/battle-trial')).length,0,'second renderer reuses the restarted trial');assert.equal(first.battle,second.battle);
    assert.equal(creations[0].body.seed,42);for(const side of ['attacker','defender'])assert.equal(Object.values(creations[0].body[side]).reduce((sum,n)=>sum+n,0),500);
    report.oldServerRestart={base:oldBase,three:first,legacy:second,createdSeed:creations[0].body.seed,createdInitialSides:{attacker:500,defender:500},automaticRestart:true};console.log(JSON.stringify({oldServerRestart:true,battle:first.battle,ships:first.metadata}));
  }
  const world=JSON.parse(fs.readFileSync(links.save,'utf8')),stored=world.battles[report.launches.three.battle],trial=stored.storage?battleStorage(links.save).read(stored.storage):stored;
  report.savedTrial={id:trial.id,seed:trial.seed,initial:trial.initial,ships:trial.ships.length};assert.equal(trial.seed,42);assert.equal(trial.ships.length,1000);
}catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();report.browserClosed=true;report.passed=report.errors.length===0;report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(directory,'launch-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,report:path.join(directory,'launch-verification.json'),errors:report.errors}));}
