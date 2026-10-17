const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'output/playwright/npc-planets-apk-v1');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1600,height:1080},deviceScaleFactor:1});
  const result={errors:[],failedRequests:[],checks:[],models:[]};
  page.on('pageerror',e=>result.errors.push(e.message));page.on('requestfailed',r=>result.failedRequests.push(r.url()));
  await page.goto('http://127.0.0.1:8395/');await page.waitForFunction(()=>window.npcReview?.ready);await page.evaluate(()=>npcReview.pause());
  result.models=await page.evaluate(()=>npcReview.inspect());assert.equal(result.models.length,5);assert(result.models.every(m=>m.finite&&m.triangles>1000));
  for(const [i,id]of ['outpost','garrison','charon','cargo','fracture'].entries()){
    await page.getByRole('button',{name:['废弃前哨','赤铁守备站','卡戎舰队','遗落货仓','苍穹裂隙'][i],exact:true}).click();
    assert.equal(await page.evaluate(()=>npcReview.current()),id);
    await page.locator('#reference').evaluate(img=>img.decode());
    await page.waitForTimeout(160);
    await page.locator('#main-view').screenshot({path:path.join(out,id+'-front.png')});
    const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'下载当前模型 GLB ↓'}).click();const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),id+'.glb');assert.equal(await download.failure(),null);
  }
  result.checks.push('Five model switches and five GLB downloads');
  await page.getByRole('button',{name:'线框',exact:true}).click();assert.equal(await page.locator('#wire').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'线框',exact:true}).click();assert.equal(await page.locator('#wire').getAttribute('aria-pressed'),'false');
  await page.getByRole('button',{name:'自动旋转',exact:true}).click();assert.equal(await page.locator('#rotate').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'自动旋转',exact:true}).click();assert.equal(await page.locator('#rotate').getAttribute('aria-pressed'),'false');
  const rect=await page.locator('#main-view').boundingBox(),x=rect.x+rect.width*.5,y=rect.y+rect.height*.5;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+200,y+50,{steps:15});await page.mouse.up();await page.mouse.wheel(0,-130);await page.waitForTimeout(300);
  await page.locator('#main-view').screenshot({path:path.join(out,'fracture-drag-zoom.png')});
  await page.getByRole('button',{name:'复位',exact:true}).click();result.checks.push('Orbit drag, wheel zoom, wireframe, auto rotate, reset');
  await page.evaluate(()=>npcReview.view(0,.4,-4.65));await page.waitForTimeout(160);await page.locator('#main-view').screenshot({path:path.join(out,'fracture-back.png')});
  await page.evaluate(()=>npcReview.view(0,4.65,.05));await page.waitForTimeout(160);await page.locator('#main-view').screenshot({path:path.join(out,'fracture-top.png')});
  await page.getByRole('button',{name:'复位',exact:true}).click();await page.waitForTimeout(300);
  await page.screenshot({path:path.join(__dirname,'review.png')});await page.locator('#gallery').screenshot({path:path.join(__dirname,'overview.png')});
  await page.setViewportSize({width:390,height:844});await page.locator('#main-view').scrollIntoViewIfNeeded();await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'mobile.png')});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));result.checks.push('390px mobile layout without horizontal overflow');
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.failedRequests,[]);result.checks.push('No page exceptions or failed requests');
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
