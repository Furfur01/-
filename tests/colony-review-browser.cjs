const {chromium} = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

// Independent review scene only. Never visit the production game or /api/*.
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/playwright/colony-review');
const base = process.env.COLONY_REVIEW_URL || 'http://127.0.0.1:8389/opendesign/mockups/planet-construction-review/colony-v1.html';
fs.mkdirSync(output, {recursive:true});
const result = {startedAt:new Date().toISOString(), url:base, scope:'Independent colony review; global/mining focus switches only, not galaxy navigation.', checks:[], pageErrors:[], apiRequests:[], consoleErrors:[], screenshots:[]};
const check = (name, detail={}) => result.checks.push({name, passed:true, ...detail});
let browser;

async function ready(page){
  page.on('pageerror', e=>result.pageErrors.push({message:e.message,stack:e.stack}));
  page.on('console', m=>{if(m.type()==='error')result.consoleErrors.push(m.text());});
  page.on('request', r=>{if(new URL(r.url()).pathname.startsWith('/api/'))result.apiRequests.push(r.url());});
  await page.route('**/api/**', route=>route.abort('blockedbyclient'));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.ColonyReview?.getState().frameCount>5);
  await page.waitForTimeout(1200);
}
async function state(page){return page.evaluate(()=>window.ColonyReview.getState());}
async function clickFocus(page,id){await page.locator(`[data-focus="${id}"]`).click();await page.waitForTimeout(1150);assert.equal((await state(page)).selected,id);}
async function shot(page,name){const file=path.join(output,name+'.png');await page.screenshot({path:file,fullPage:true});result.screenshots.push(file);}
async function memory(page){return page.evaluate(()=>({...window.ColonyReview.getState().memory,programs:window.ColonyReview.renderer.info.programs.length}));}

(async()=>{
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page=await context.newPage();await ready(page);
  const initial=await state(page);assert.equal(initial.buildings,17);assert.equal(initial.districts.length,14);
  assert.equal(await page.locator('[data-building]').count(),17);check('17 buildings / 14 districts / 17 UI slots');
  await shot(page,'global-front');
  await page.locator('#opposite').click();await page.waitForTimeout(1150);await shot(page,'global-back');check('Opposite hemisphere UI');
  for(const id of ['metal','crystal','gas']){await clickFocus(page,id);await shot(page,id);}
  check('Resource shortcut UI',{ids:['metal','crystal','gas']});
  await clickFocus(page,'metal');
  await page.locator('#pause').click();const paused=await state(page);assert.equal(paused.paused,true);
  await page.waitForTimeout(600);assert.equal((await state(page)).elapsed,paused.elapsed);
  await page.locator('#pause').click();await page.waitForTimeout(400);assert.ok((await state(page)).elapsed>paused.elapsed);check('UI pause freezes simulation and resume advances');
  await page.locator('#speed').selectOption('2');assert.equal((await state(page)).speed,2);await page.locator('#speed').selectOption('1');check('UI speed selection');
  await page.locator('#storage').uncheck();assert.equal((await state(page)).districts.find(d=>d.id==='metal').storageBuilt,false);
  await page.locator('#storage').check();assert.equal((await state(page)).districts.find(d=>d.id==='metal').storageBuilt,true);check('Warehouse UI toggle');
  for(const status of ['low-power','stopped','full','unbuilt','construction','upgrading','running']){
    await page.locator('#status').selectOption(status);assert.equal((await state(page)).districts.find(d=>d.id==='metal').status,status);
    if(status==='unbuilt'){
      await shot(page,'unbuilt');
      const hidden=await page.evaluate(()=>{
        const found=[];window.ColonyReview.scene.traverse(o=>{if(o.userData.building==='Metal_Mine'||o.userData.building==='Metal_Storage'){
          if(o.isGroup&&o.children.some(c=>c.name===o.userData.building))found.push({id:o.userData.building,children:o.children.map(c=>({name:c.name,type:c.type,visible:c.visible}))});
        }});return found;
      });assert.equal(hidden.length,2);assert.ok(hidden.every(b=>b.children.filter(c=>c.type==='Group').every(c=>c.visible===false)));
      check('Unbuilt hides both building bodies and scaffold',{foundations:hidden});
    }
    if(status==='construction'){
      await page.locator('#progress').fill('67');await page.locator('#progress').dispatchEvent('input');
      assert.equal(await page.locator('#progress-value').textContent(),'67%');await shot(page,'construction');
    }
  }check('All seven UI statuses and construction progress');
  const ids=await page.locator('[data-building]').evaluateAll(items=>items.map(n=>n.dataset.building));
  for(const id of ids){await page.locator(`[data-building="${id}"]`).click();assert.equal((await state(page)).selectedBuilding,id);await page.waitForTimeout(1100);}
  check('Every fixed building selectable by UI',{ids});
  await page.locator('#overview').click();await page.waitForTimeout(1100);
  await page.locator('#pause').click();
  // Warm every material/state before comparing renderer allocations.
  for(const status of ['unbuilt','construction','upgrading','running']){await page.locator('#status').selectOption(status);await page.waitForTimeout(150);}
  for(const id of ['metal','crystal','gas']){await clickFocus(page,id);}
  await page.locator('#overview').click();await page.waitForTimeout(1100);
  const before=await memory(page),elapsedBefore=(await state(page)).elapsed;
  for(let i=0;i<20;i++){
    await page.locator(`[data-focus="${['metal','crystal','gas'][i%3]}"]`).click();await page.waitForTimeout(1050);
    await page.locator('#overview').click();await page.waitForTimeout(1050);
  }
  const after=await memory(page);assert.deepEqual(after,before);assert.equal((await state(page)).elapsed,elapsedBefore);
  check('20 complete global / mining focus round trips without renderer allocation growth',{before,after,cycles:20});
  result.cameraChecks=await page.evaluate(()=>({position:window.ColonyReview.camera.position.toArray(),up:window.ColonyReview.camera.up.toArray(),near:window.ColonyReview.camera.near,far:window.ColonyReview.camera.far}));
  await context.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mp=await mobile.newPage();await ready(mp);await shot(mp,'mobile');
  assert.equal(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await clickFocus(mp,'crystal');assert.equal((await state(mp)).selected,'crystal');check('390 px mobile layout has no horizontal overflow and resource UI works');await mobile.close();
  const dc=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const dp=await dc.newPage();
  dp.on('pageerror',e=>result.pageErrors.push(e.message));dp.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))result.apiRequests.push(r.url());});await dp.route('**/api/**',r=>r.abort());
  await dp.goto(new URL('data-review.html',base).href,{waitUntil:'networkidle'});assert.equal(await dp.locator('details.row').count(),179);
  const category=await dp.locator('#category option').nth(1).getAttribute('value');await dp.locator('#category').selectOption(category);const filtered=await dp.locator('details.row').count();assert.ok(filtered>0&&filtered<179);
  await dp.locator('#category').selectOption('');await dp.locator('#search').fill('Moon_Base');assert.ok(await dp.locator('details.row').count()>0);await dp.locator('#search').fill('unlikely_no_match_67890');assert.equal(await dp.locator('details.row').count(),0);await dp.locator('#search').fill('');
  const first=dp.locator('details.row').first();await first.locator('summary').click();await first.getByRole('button',{name:'通过这项',exact:true}).click();await first.locator('textarea').fill('浏览器自动化验证：本地临时测试记录');
  const download=dp.waitForEvent('download');await dp.locator('#export').click();const file=await download;const exportPath=path.join(output,'data-review-test-export.json');await file.saveAs(exportPath);const payload=JSON.parse(fs.readFileSync(exportPath,'utf8'));
  assert.equal(payload.appliedToProduction,false);assert.equal(payload.entries.length,179);assert.equal(payload.approvedIds.length,1);check('Data review filters, search, isolated local approval and JSON export',{entries:179,category,filtered,exportPath});await dc.close();
  assert.equal(result.pageErrors.length,0);assert.equal(result.apiRequests.length,0);check('Zero page errors and zero API requests');result.passed=true;
})().catch(error=>{result.passed=false;result.failure={message:error.message,stack:error.stack};process.exitCode=1;}).finally(async()=>{
  if(browser)await browser.close();result.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
});
