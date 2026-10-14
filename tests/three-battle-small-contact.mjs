import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {output,root,views,playwright,startServer,mountReplay,configureProbe,frameMetrics,median,summarizeComparison,sourceFingerprint,hash} from './three-battle-harness.mjs';

// Browser regression for a real, recorded battle that shrinks from five enemy
// contacts to one. Run separately from node --test so GPU work stays sequential.
// --quick adds the standard 1s/2.5s smoke comparison in its own evidence folder.
const directory=path.join(output,'hud-contact-fix'),quick=process.argv.includes('--quick');
fs.mkdirSync(directory,{recursive:true});
const replay=JSON.parse(fs.readFileSync(path.join(root,'output/playwright/three-battle-video/fixture-special.json'),'utf8'));
const fixture={replay,manifest:{name:'small-contact',sha256:hash(replay)}};
const report={kind:'post-acceptance-hud-guard-regression',createdAt:new Date().toISOString(),sourceStart:sourceFingerprint(),fixtureSha256:fixture.manifest.sha256,cases:[],legacyReproduction:null,errors:[]};
const resultPath=path.join(directory,'small-contact-results.json');
const server=await startServer({directory:path.join(directory,'server')}),{chromium}=playwright();
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!process.argv.includes('--headed'),args:['--use-angle=d3d11','--disable-background-timer-throttling','--disable-renderer-backgrounding']});report.browser=browser.version();

async function inspect(page,label,view,expectedContacts){
  const before=await page.evaluate(()=>GalacticDemo.state.frames);await page.waitForTimeout(400);
  const actual=await page.evaluate(()=>{const d=window.GalacticDemo,c=window.flightController,p=d?.state.flight;return {ready:document.documentElement.dataset.ready,active:!!d&&!!c,frames:d?.state.frames,selected:c?.selected,replayTime:c?.playTime,alive:c?.rows.filter(row=>row[6]>0).length,targets:p?.targets.map(t=>t.shipId),targetIndex:p?.targetIndex,external:p?.external,markerDisplays:[...document.querySelectorAll('#secondary-markers .secondary-contact')].map(e=>e.style.display),gl:d?.renderer.gl.getError()};});
  report.cases.push({label,view,...actual});assert.equal(actual.active,true,label+' runtime remains active');assert.ok(actual.frames>before+3,label+' animation continues');assert.equal(actual.gl,0,label+' GL');assert.equal(actual.external,view==='follow',label+' retains requested view');
  if(expectedContacts!==null)assert.equal(actual.targets.length,expectedContacts,label+' contacts');
  if(expectedContacts===1)assert.deepEqual(actual.markerDisplays,['none','none','none'],label+' missing secondary markers are hidden');
  console.log(JSON.stringify({label,view,targets:actual.targets,frames:actual.frames}));return actual;
}

async function runContactCases(view){
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});page.on('response',response=>{if(response.status()>=400)errors.push('HTTP '+response.status()+': '+response.url());});
  try{
    const mounted=await mountReplay(page,server,fixture,'three');
    await page.evaluate(async view=>{const c=flightController,p=GalacticDemo.state.flight;c.paused=true;await c.select(4);c.seek(0);c.refreshContacts();c.overview=false;p.external=view==='follow';p.cameraBlend=p.external?1:0;p.cameraVelocity=0;p.orbitYaw=0;p.orbitPitch=0;},view);
    await inspect(page,'five-enemy-contacts',view,5);
    await page.locator('[data-contact="2"]').click();assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.targetIndex),2,'UI selects a secondary contact');
    await page.evaluate(()=>{const c=flightController;c.seek(11.5);c.refreshContacts();});
    const one=await inspect(page,'recorded-deaths-leave-one-target',view,1);assert.deepEqual(one.targets,[9]);assert.equal(one.targetIndex,0,'contact selection is valid after deaths');
    await page.evaluate(async view=>{await flightController.select(9);flightController.overview=false;const p=GalacticDemo.state.flight;p.external=view==='follow';p.cameraBlend=p.external?1:0;},view);
    const switched=await inspect(page,'switch-selected-reaper',view,1);assert.deepEqual(switched.targets,[4]);
    await page.evaluate(async view=>{const c=flightController;await c.select(4);c.overview=false;const p=GalacticDemo.state.flight;p.external=view==='follow';p.cameraBlend=p.external?1:0;},view);
    await inspect(page,'switch-back-after-seek',view,1);
    await page.screenshot({path:path.join(directory,'one-contact-'+view+'.png')});
    // The saved sample's last two Reapers survive. Extend only this page's
    // recorded death lookup to exercise authoritative row -> zero contacts;
    // neither fixture bytes nor simulation/game statistics are changed.
    await page.evaluate(()=>{const c=flightController;c.deathTicks.set(9,240);c.seek(12);c.refreshContacts();});
    await inspect(page,'last-enemy-dies-zero-targets',view,0);
    await page.evaluate(()=>{const c=flightController;c.deathTicks.set(4,240);c.seek(12);c.refreshContacts();});
    const empty=await inspect(page,'selected-vessel-also-dies',view,0);assert.equal(empty.alive,0);
    assert.deepEqual(mounted.requests,[],'replay remains read-only');assert.deepEqual(errors,[],view+' browser errors');
  }finally{report.errors.push(...errors);await page.close();}
}

async function reproduceLegacy(){
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack}));
  try{
    await mountReplay(page,server,fixture,'legacy');
    await page.evaluate(async()=>{const c=flightController;c.paused=true;await c.select(4);c.playTime=11.5;c.replayCursor=0;c.update(0);c.refreshContacts();c.overview=false;GalacticDemo.state.flight.external=true;GalacticDemo.state.flight.cameraBlend=1;});
    await page.waitForTimeout(700);
    report.legacyReproduction={expectedFailure:true,errors,source:'Frozen baseline unchanged',targets:await page.evaluate(()=>GalacticDemo.state.flight.targets.map(t=>t.shipId))};
    assert.ok(errors.some(error=>error.message.includes("reading 'pos'")&&error.stack?.includes('positionHUD')),'frozen native baseline reproduces the same HUD bug');
  }finally{await page.close();}
}

async function runQuickComparison(){
  const dir=path.join(directory,'quick');fs.mkdirSync(dir,{recursive:true});
  const normal={replay:JSON.parse(fs.readFileSync(path.join(output,'fixture-normal.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(output,'fixture-normal-manifest.json'),'utf8'))};
  assert.equal(hash(normal.replay),normal.manifest.sha256,'reuse the exact certified normal fixture');
  const before=JSON.parse(fs.readFileSync(path.join(directory,'before-fingerprint.json'),'utf8'));
  const result={mode:'post-acceptance patch smoke — not a full acceptance run',certified:false,createdAt:new Date().toISOString(),browser:browser.version(),originalFullSource:before.sha256,sourceStart:sourceFingerprint(),conditions:{width:1920,height:1080,dpr:1,warmMs:1000,sampleMs:2500,rounds:1,fixedQuality:1,visualSeed:42,recordVideo:false},fixture:normal.manifest,results:[],errors:[]};
  for(const adaptive of [false,true])for(const view of adaptive?['cinema']:views)for(const engine of ['legacy','three']){
    const key=engine+'-'+view+(adaptive?'-adaptive':'-fixed'),entry={fixture:'normal',fixtureSha256:normal.manifest.sha256,engine,view,adaptive,round:1,errors:[]},page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    page.on('pageerror',error=>entry.errors.push(error.message));page.on('console',message=>{if(message.type()==='error')entry.errors.push(message.text());});
    try{
      const mounted=await mountReplay(page,server,normal,engine);entry.loadMs=mounted.loadMs;entry.environment=await page.evaluate(configureProbe,{view,startTime:normal.manifest.combatStart,adaptive});
      await page.evaluate(()=>__battleProbe.start(1000));await page.waitForTimeout(3500);entry.end=await page.evaluate(t=>__battleProbe.finish(t),normal.manifest.combatStart+3.5);
      const samples=await page.evaluate(()=>__battleProbe.samples);entry.metrics=frameMetrics(samples);entry.renderMetrics={medianCalls:median(samples.map(s=>s.calls)),medianTriangles:median(samples.map(s=>s.triangles)),medianQuality:median(samples.map(s=>s.quality))};entry.postRequests=mounted.requests;
      fs.writeFileSync(path.join(dir,key+'-frames.json'),JSON.stringify(samples));await page.screenshot({path:path.join(dir,key+'.png')});assert.equal(entry.end.glError,0);assert.deepEqual(entry.errors,[]);assert.deepEqual(mounted.requests,[]);
      if(!adaptive){assert.equal(entry.end.quality,1);assert.equal(entry.end.render.instances,entry.end.render.alive);}
      console.log(JSON.stringify({quick:key,fps:entry.metrics.averageFPS,p95:entry.metrics.p95Ms,errors:entry.errors}));
    }catch(error){entry.error=error.stack;result.errors.push(key+': '+error.message);}
    finally{result.results.push(entry);await page.close();fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2));}
  }
  result.sourceEnd=sourceFingerprint();result.sourceUnchanged=result.sourceStart.sha256===result.sourceEnd.sha256;result.summaries=summarizeComparison(result.results,{full:false});result.passedSmoke=result.sourceUnchanged&&result.errors.length===0&&result.results.length===10;
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2));assert.equal(result.passedSmoke,true,'post-patch quick smoke passes');report.quick={file:path.join(dir,'results.json'),passedSmoke:result.passedSmoke,source:result.sourceStart.sha256};
}

try{
  await reproduceLegacy();for(const view of ['follow','bridge'])await runContactCases(view);
  if(quick)await runQuickComparison();
}catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();await server.stop();if(server.stderr)report.errors.push(server.stderr);report.sourceEnd=sourceFingerprint();report.sourceUnchanged=report.sourceStart.sha256===report.sourceEnd.sha256;report.finishedAt=new Date().toISOString();report.passed=report.errors.length===0&&report.cases.length===12&&report.sourceUnchanged;fs.writeFileSync(resultPath,JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;console.log('Small-contact regression: '+resultPath);}
