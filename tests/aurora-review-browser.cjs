const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

// Independent static review only. Deliberately block all production API traffic.
const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:8289/opendesign/mockups/planet-construction-review/';
const referenceMode = process.argv.includes('--reference');
const visualMode = process.argv.includes('--visual');
const miningMode = process.argv.includes('--mining');
const recordMode = process.argv.includes('--record')||miningMode;
const mobileMode = process.argv.includes('--mobile');
const deliveryMode = process.argv.includes('--deliver');
const output = path.join(root, 'output/playwright/aurora-review', referenceMode ? 'reference' : visualMode?'visual':'final');
fs.mkdirSync(output, {recursive:true});
const report = {mode:referenceMode?'reference':'final',startedAt:new Date().toISOString(),checks:[],screenshots:[],pageErrors:[],consoleErrors:[],apiRequests:[]};
const evidence=path.join(root,'opendesign/mockups/planet-construction-review/evidence-aurora');
let browser;
const check=(name,detail={})=>report.checks.push({name,passed:true,...detail});
const state=page=>page.evaluate(()=>window.AURORA.snapshot);
const settle=page=>page.evaluate(()=>window.AURORA._settleView());
async function focus(page,type){await page.evaluate(type=>{window.AURORA.focus(type);window.AURORA._settleView();},type);}
async function screenshot(page,name) {
  const target = path.join(output, name+'.png');
  await page.screenshot({path:target,fullPage:true});report.screenshots.push(target);
}
async function open(page,url) {
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))report.apiRequests.push(r.url());});
  await page.route('**/api/**',r=>r.abort('blockedbyclient'));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.AURORA?.snapshot.frameNo>2);
  await page.waitForFunction(()=>!document.querySelector('#loading') || getComputedStyle(document.querySelector('#loading')).opacity==='0');
  await page.waitForTimeout(500);
}
async function finalChecks(page,context){
  const initial=await state(page);const districts=initial.districts,buildings=districts.flatMap(d=>d.buildings);
  assert.equal(districts.length,14);assert.equal(buildings.length,17);check('14 surface districts and 17 fixed building slots');
  await page.locator('#play').click();const paused=await state(page);await page.waitForTimeout(450);
  assert.equal(paused.playing,false);assert.equal((await state(page)).animTime,paused.animTime);
  await page.locator('#play').click();await page.waitForTimeout(450);assert.ok((await state(page)).animTime>paused.animTime);check('Pause freezes animation and resume advances it');
  await page.locator('#speed').click();assert.match(await page.locator('#speed').innerText(),/0.35/);
  await page.locator('#speed').click();assert.match(await page.locator('#speed').innerText(),/2.0/);
  await page.locator('#speed').click();assert.match(await page.locator('#speed').innerText(),/1.0/);check('All speed controls work');
  await page.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});
  await screenshot(page,'global-front');await page.locator('#backside').click();await settle(page);await screenshot(page,'global-back');
  await page.locator('#south').click();await settle(page);await screenshot(page,'global-south');check('Overview, opposite hemisphere and south-pole controls');
  for(const type of ['metal','crystal','gas']){await page.locator(`[data-jump="${type}"]`).click();await settle(page);assert.equal((await state(page)).selected,districts.find(d=>d.type===type).buildings[0].id);await screenshot(page,type);}
  check('All three resource shortcuts select their own mining district');
  report.buildingSelection=[];
  for(let i=0;i<buildings.length;i++){
    await page.locator('#listToggle').click();assert.equal(await page.locator('[data-building]').count(),17);
    await page.locator(`[data-building="${i}"]`).click();await settle(page);assert.equal((await state(page)).selected,buildings[i].id);
    report.buildingSelection.push({id:buildings[i].id,type:buildings[i].type});
  }check('Every building slot is selectable using its public directory button',{count:17});
  await focus(page,'metal');
  for(const mode of ['unbuilt','construction','upgrade','lowpower','full','paused','active']){
    await page.locator(`[data-state="${mode}"]`).click();await settle(page);
    assert.equal((await state(page)).districts.find(d=>d.type==='metal').buildings[0].state,mode);
    if(['unbuilt','construction','upgrade'].includes(mode))await screenshot(page,'status-'+mode);
  }check('All seven construction and operation state buttons');
  const memoryBefore=(await state(page)).bufferCount;
  for(let i=0;i<30;i++){await focus(page,['metal','crystal','gas'][i%3]);await page.evaluate(()=>{window.AURORA.home();window.AURORA._settleView();});}
  const memoryAfter=(await state(page)).bufferCount;assert.equal(memoryAfter,memoryBefore);check('30 global/resource focus round trips without GPU buffer growth',{before:memoryBefore,after:memoryAfter,cycles:30});
  report.cycles={};
  for(const [type,kind,expected] of [['metal','truck',['空车驶向矿山','矿山装载','满载运回仓库','仓库卸货']],['crystal','robot',['驶向晶簇','钻头接触晶簇 · 采集','收起钻头 · 装载','携带晶体返回','卸下晶体']]]){
    await focus(page,type);const samples=[],phases=new Set(),wraps=[0,0];let prev=(await state(page)).actors.filter(a=>a.kind===kind);assert.equal(prev.length,2);
    for(let i=0;i<64;i++){
      await page.evaluate(()=>window.AURORA._advance(.5));const actors=(await state(page)).actors.filter(a=>a.kind===kind);
      for(let j=0;j<actors.length;j++){if(actors[j].t<prev[j].t)wraps[j]++;phases.add(actors[j].phase);}
      samples.push({seconds:(i+1)*.5,actors});prev=actors;
    }
    assert.ok(wraps.every(n=>n>=1));for(const phase of expected)assert.ok(phases.has(phase),type+' missing '+phase);
    assert.ok(samples.some(s=>s.actors.some(a=>a.carrying>.95)));assert.ok(samples.some(s=>s.actors.some(a=>a.carrying<.05)));
    report.cycles[type]={seconds:32,phases:[...phases],wraps,samples};check(type+' full collection, loaded return and unloading cycles for both actors',{wraps,phases:[...phases]});
  }
  await focus(page,'gas');
  const gasClock=async()=> (await state(page)).districts.find(d=>d.type==='gas').gasClock;
  const g0=await gasClock();await page.evaluate(()=>window.AURORA._advance(1));const g1=await gasClock();assert.ok(g1>g0);
  await page.locator('[data-state="lowpower"]').click();await page.evaluate(()=>window.AURORA._advance(1));const g2=await gasClock();assert.ok(Math.abs((g2-g1)/(g1-g0)-.35)<.001);
  await page.locator('[data-state="paused"]').click();await page.evaluate(()=>window.AURORA._advance(1));assert.equal(await gasClock(),g2);
  await page.locator('[data-state="active"]').click();await settle(page);check('Gas pump animation advances, runs at 35% under low power and freezes when stopped',{normalDelta:g1-g0,lowPowerDelta:g2-g1});
  report.elevator={views:{},samples:[]};
  for(const view of ['full','ground','station']){
    await page.evaluate(view=>{window.AURORA.focusElevator(view);window.AURORA._settleView();},view);
    report.elevator.views[view]=(await state(page));await screenshot(page,'elevator-'+view);
  }
  let minimumCabinSeparation=Infinity;
  const cabinPhases=[new Set(),new Set()];
  for(let i=0;i<50;i++){
    await page.evaluate(()=>window.AURORA._advance(.5));const e=(await state(page)).elevator;assert.ok(e);assert.equal(e.cabins.length,2);assert.equal(e.cables.length,2);assert.equal(e.arms.length,2);
    const a=e.cabins[0].position,b=e.cabins[1].position;
    const separation=Math.hypot(...a.map((v,j)=>v-b[j]));minimumCabinSeparation=Math.min(minimumCabinSeparation,separation);
    assert.ok(separation>.34);assert.equal(a[0],-.24);assert.equal(b[0],.24);
    e.cabins.forEach((c,j)=>{assert.ok(c.position[1]-.245>=e.rails[j].bottom[1]);assert.ok(c.position[1]+.245<=e.rails[j].top[1]);cabinPhases[j].add(c.phase);});
    report.elevator.samples.push(e);
  }
  for(const phases of cabinPhases)for(const p of ['地面装载','上行运料','轨道卸料','下行返回'])assert.ok(phases.has(p));
  check('Both elevator cabins complete loading, ascent, unloading and descent on separate continuous rails',{minimumCabinSeparation,cabinWidth:.34,phases:cabinPhases.map(s=>[...s])});
  report.finalSnapshot=await state(page);
  await context.close();
  const laptop=await browser.newContext({viewport:{width:1365,height:900},deviceScaleFactor:1});const lp=await laptop.newPage();await open(lp,base);await lp.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});
  await screenshot(lp,'laptop-global');await lp.evaluate(()=>{window.AURORA.focusElevator('full');window.AURORA._settleView();});await screenshot(lp,'laptop-elevator');await laptop.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const mp=await mobile.newPage();await open(mp,base);await mp.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});await screenshot(mp,'mobile-global');
  assert.equal(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  for(const type of ['metal','crystal','gas']){await mp.locator(`[data-jump="${type}"]`).click();await settle(mp);assert.equal((await state(mp)).selected,districts.find(d=>d.type===type).buildings[0].id);}
  await screenshot(mp,'mobile-gas');check('390px mobile layout and all resource navigation controls',{width:390,height:844});await mobile.close();
}
async function recordCycles(){
  fs.mkdirSync(evidence,{recursive:true});report.videos=[];
  const recordings=miningMode?[['metal',32],['crystal',32],['gas',8]]:[['metal',32],['crystal',32],['gas',8],['elevator',60]];
  for(const [type,seconds] of recordings){
    const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,recordVideo:{dir:path.join(output,'video-raw'),size:{width:1440,height:1000}}});
    const page=await context.newPage();await open(page,base);
    await page.evaluate(type=>{window.__AURORA_TEST_FREEZE=true;if(type==='elevator')window.AURORA.focusElevator('full');else window.AURORA.focus(type);window.AURORA._settleView();},type);
    const video=page.video(),started=Date.now(),before=await state(page),samples=[],phases=new Set();
    for(let i=0;i<seconds*5;i++){
      if(type==='elevator'&&i===120)await page.evaluate(()=>{window.AURORA.focusElevator('station');window.AURORA._settleView();});
      await page.evaluate(()=>window.AURORA._advance(.2));
      if(i%5===0){const s=await state(page);samples.push({seconds:(i+1)/5,actors:type==='elevator'?s.elevator:s.actors.filter(a=>a.district===type),gasClock:s.districts.find(d=>d.type==='gas').gasClock});
        for(const a of type==='elevator'?s.elevator.cabins:s.actors.filter(a=>a.district===type)){
          if(!phases.has(a.phase)){phases.add(a.phase);await screenshot(page,`${type}-phase-${phases.size}`);}
        }
      }
      await page.waitForTimeout(80);
    }
    const after=await state(page),wallSeconds=(Date.now()-started)/1000;await context.close();
    const target=path.join(evidence,type+'.webm');await video.saveAs(target);
    const item={type,path:target,simulationSeconds:seconds,wallSeconds,bytes:fs.statSync(target).size,simulationStep:.2,phases:[...phases],before,after,samples};report.videos.push(item);
    console.log(JSON.stringify({recorded:type,simulationSeconds:seconds,wallSeconds,bytes:item.bytes,phases:item.phases}));
  }
  const playbackContext=await browser.newContext();const pp=await playbackContext.newPage();report.playback=[];
  for(const type of ['metal','crystal','gas','elevator']){
    await pp.setContent(`<video muted src="${base}evidence-aurora/${type}.webm"></video>`);
    const metadata=await pp.locator('video').evaluate(async v=>{await v.play();await new Promise(resolve=>setTimeout(resolve,350));v.pause();return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,readyState:v.readyState,currentTime:v.currentTime,error:v.error?.message||null};});
    assert.ok(metadata.duration>4&&metadata.width===1440&&metadata.height===1000&&metadata.readyState>=2&&metadata.currentTime>0&&!metadata.error);report.playback.push({type,...metadata});
  }
  await playbackContext.close();check('All four full-cycle recordings decode and play in Chromium');
}
(async()=>{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const context=await browser.newContext({viewport:mobileMode?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:1,...mobileMode?{isMobile:true,hasTouch:true}:{}});
  const page=await context.newPage();await open(page,base+(referenceMode?'reference/aurora-original.html':''));
  if(deliveryMode){
    await page.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});await screenshot(page,'global-front');
    for(const [button,name] of [['#backside','global-back'],['#south','global-south']]){await page.locator(button).click();await settle(page);await page.waitForTimeout(2700);await screenshot(page,name);}
    for(const type of ['metal','crystal','gas']){await focus(page,type);await screenshot(page,type);}
    await page.evaluate(()=>window.AURORA._advance(60));
    for(const view of ['full','station']){await page.evaluate(view=>{window.AURORA.focusElevator(view);window.AURORA._settleView();},view);await screenshot(page,'elevator-'+view);}
    fs.mkdirSync(evidence,{recursive:true});for(const name of ['global-front','global-back','global-south','metal','crystal','gas','elevator-full','elevator-station'])fs.copyFileSync(path.join(output,name+'.png'),path.join(evidence,name+'.png'));
    await context.close();report.passed=true;return;
  }
  if(mobileMode){
    await page.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});await screenshot(page,'mobile-global');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    for(const type of ['metal','crystal','gas','spaceport']){await page.locator(`[data-jump="${type}"]`).click();await settle(page);assert.equal(await page.locator('.mapbox').isVisible(),false);await screenshot(page,'mobile-'+type);}
    check('Updated 390px resource/elevator navigation, unoccluded inspector and no horizontal overflow');
    assert.equal(report.pageErrors.length,0);assert.equal(report.consoleErrors.length,0);assert.equal(report.apiRequests.length,0);
    fs.mkdirSync(evidence,{recursive:true});fs.copyFileSync(path.join(output,'mobile-global.png'),path.join(evidence,'mobile-global.png'));await context.close();report.passed=true;return;
  }
  if(visualMode){
    await page.evaluate(()=>window.__AURORA_TEST_FREEZE=true);
    await screenshot(page,'global');
    for(const type of ['metal','crystal','gas']){await focus(page,type);await screenshot(page,type);}
    for(const view of ['full','ground','station']){await page.evaluate(view=>{window.AURORA.focusElevator(view);window.AURORA._settleView();},view);await screenshot(page,'elevator-'+view);}
    await context.close();report.passed=true;return;
  }
  if(!referenceMode){await finalChecks(page,context);if(recordMode)await recordCycles();assert.equal(report.pageErrors.length,0);assert.equal(report.consoleErrors.length,0);assert.equal(report.apiRequests.length,0);check('Zero page errors, console errors and API requests');report.passed=true;
    fs.mkdirSync(evidence,{recursive:true});for(const name of ['global-front','global-back','global-south','metal','crystal','gas','elevator-full','elevator-station','mobile-global'])fs.copyFileSync(path.join(output,name+'.png'),path.join(evidence,name+'.png'));return;}
  await page.evaluate(()=>{window.__AURORA_TEST_FREEZE=true;window.AURORA.home();window.AURORA._settleView();});
  report.snapshots={global:await page.evaluate(()=>window.AURORA.snapshot)};
  await screenshot(page,'global');
  for(const type of ['metal','crystal','gas']){
    await page.locator(`[data-jump="${type}"]`).click();
    await page.evaluate(()=>window.AURORA._settleView());
    report.snapshots[type]=await page.evaluate(()=>window.AURORA.snapshot);
    await screenshot(page,type);
  }
  assert.equal(report.snapshots.global.districts.length,14);
  assert.equal(report.snapshots.global.districts.flatMap(d=>d.buildings).length,17);
  report.checks.push({name:'Unmodified AURORA baseline: global plus all three mining districts',passed:true});
  assert.equal(report.pageErrors.length,0);assert.equal(report.consoleErrors.length,0);assert.equal(report.apiRequests.length,0);
  report.passed=true;await context.close();
})().catch(e=>{report.passed=false;report.failure={message:e.message,stack:e.stack};process.exitCode=1;}).finally(async()=>{
  if(browser)await browser.close();report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(output,mobileMode?'mobile-verification.json':deliveryMode?'selected-screenshots.json':'verification.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:report.passed,output,checks:report.checks,failure:report.failure,pageErrors:report.pageErrors,consoleErrors:report.consoleErrors,apiRequests:report.apiRequests},null,2));
});
