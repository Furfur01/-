import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=import.meta.dirname,base='http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/';
const ships=JSON.parse(await fs.readFile(path.join(dir,'../catalog.json'),'utf8')).ships;
const report={ships:[],requests:[],errors:[],blocked:[]};
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await context.route('**/*',route=>{const url=route.request().url();if(url.startsWith(base)&&!url.includes('/api/'))return route.continue();report.blocked.push(url);return route.abort();});
 const page=await context.newPage();
 page.on('pageerror',error=>report.errors.push(String(error)));
 page.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());});
 page.on('request',request=>{if(request.url().includes('/assets/models/'))report.requests.push(request.url());});
 await page.goto(base+'index.html#shipyard');
 await page.getByLabel('演示速度').selectOption('0');
 await page.locator('.stage-loading').waitFor({state:'hidden'});
 await fs.writeFile(path.join(dir,'ship-assets-initial-dom.txt'),await page.locator('body').ariaSnapshot());
 const waitRendered=async()=>{await page.locator('.stage-loading').waitFor({state:'hidden'});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
 for(const category of ['combat','civilian']){
  await page.getByRole('button',{name:category==='combat'?'战斗舰船':'民用舰船',exact:true}).click();
  const categoryShips=ships.filter(s=>s.type===category);
  for(const ship of categoryShips){
   const button=page.locator('.fleet-card').filter({hasText:ship.name});
   await button.click();await waitRendered();
   const info=await page.evaluate(()=>({selected:document.querySelector('.fleet-card.selected b')?.textContent,title:document.querySelector('.ship-heading h1')?.textContent,img:document.querySelector('.fleet-card.selected img')?.getAttribute('src'),fallback:!!document.querySelector('.stage-fallback'),canvasCount:document.querySelectorAll('.stage-canvas canvas').length,brokenImages:[...document.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).length,auto:document.querySelector('[aria-label="自动旋转"]')?.getAttribute('aria-pressed')}));
   const file=`ship-assets-${ship.id}-1440.png`;
   await page.screenshot({path:path.join(dir,file),animations:'disabled'});
   report.ships.push({id:ship.id,name:ship.name,...info,screenshot:file});
  }
 }
 await page.getByRole('button',{name:'战斗舰船',exact:true}).click();
 await page.locator('.fleet-card').filter({hasText:'驱逐舰'}).click();await waitRendered();
 const before=createHash('sha256').update(await page.locator('.stage-canvas').screenshot()).digest('hex');
 for(const name of ['巡洋舰','无畏舰','驱逐舰','轻型战机','巡洋舰','驱逐舰'])await page.locator('.fleet-card').filter({hasText:name}).click();
 await waitRendered();
 const after=createHash('sha256').update(await page.locator('.stage-canvas').screenshot()).digest('hex');
 report.rapidSwitch={lastTitle:await page.locator('.ship-heading h1').textContent(),sameCanvasPixels:before===after,before,after};
 await page.screenshot({path:path.join(dir,'ship-assets-Destroyer-rapid-switch-1440.png'),animations:'disabled'});
 await page.setViewportSize({width:390,height:844});
 for(const name of ['巡洋舰','驱逐舰']){
  await page.locator('.fleet-card').filter({hasText:name}).click();await waitRendered();
  const id=ships.find(s=>s.name===name).id;
  await page.screenshot({path:path.join(dir,`ship-assets-${id}-390.png`),fullPage:true,animations:'disabled'});
 }
 await page.locator('.fleet-card').filter({hasText:'巡洋舰'}).click();await waitRendered();
 report.mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.querySelector('.ship-heading h1').textContent,canvasCount:document.querySelectorAll('.stage-canvas canvas').length}));
 await fs.writeFile(path.join(dir,'ship-assets-browser-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({ships:report.ships.length,rapidSwitch:report.rapidSwitch,mobile:report.mobile,errors:report.errors,blocked:report.blocked},null,2));
}finally{await browser?.close();}
