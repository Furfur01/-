import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=import.meta.dirname,base='http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/';
const {tech}=JSON.parse(await fs.readFile(path.join(dir,'../catalog.json'),'utf8'));
const expected={},parents=Object.fromEntries(Object.values(tech).map(t=>[t.id,t.req.filter(([id])=>tech[id]).map(([id])=>id)]));
function depth(id){return expected[id]??=parents[id].length?Math.max(...parents[id].map(depth))+1:0;}
Object.keys(tech).forEach(depth);
let browser;const report={errors:[],blocked:[],expected,zeroTier:Object.keys(expected).filter(id=>expected[id]===0)};
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await context.route('**/*',route=>{if(route.request().url().startsWith(base)&&!route.request().url().includes('/api/'))return route.continue();report.blocked.push(route.request().url());return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto(base+'index.html#research');await page.getByLabel('演示速度').selectOption('0');
 await page.locator('.tree-column').first().waitFor();
 report.dom=await page.evaluate(()=>({headings:[...document.querySelectorAll('.tree-column h3')].map(e=>e.textContent),nodes:[...document.querySelectorAll('.tech-node')].map(e=>({name:e.querySelector('strong').textContent,label:e.getAttribute('aria-label'),x:parseFloat(e.style.left),y:parseFloat(e.style.top)})),filters:[...document.querySelectorAll('.tree-tabs button')].map(e=>e.textContent),edgeCount:document.querySelectorAll('.tree-links path').length,edgePaths:[...document.querySelectorAll('.tree-links path')].map(e=>e.getAttribute('d')),overflow:document.documentElement.scrollWidth>innerWidth}));
 report.checks=report.dom.nodes.map(n=>{const t=Object.values(tech).find(t=>t.name===n.name);return {id:t.id,tier:expected[t.id],labelCorrect:n.label.includes(`，${expected[t.id]} 级科技，`),x:n.x};});
 const xById=Object.fromEntries(report.checks.map(n=>[n.id,n.x]));
 report.edgeOrder=Object.entries(parents).flatMap(([to,p])=>p.map(from=>({from,to,forward:xById[from]<xById[to]})));
 await page.screenshot({path:path.join(dir,'research-prerequisite-tiers-1440.png'),animations:'disabled'});
 await page.getByRole('button',{name:'适应全部科技',exact:true}).click();
 await page.screenshot({path:path.join(dir,'research-tiers-overview-1440.png'),animations:'disabled'});
 await page.setViewportSize({width:1280,height:720});
 await page.screenshot({path:path.join(dir,'research-prerequisite-tiers-1280.png'),animations:'disabled'});
 report.desktop720=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:path.join(dir,'research-tiers-mobile-390.png'),fullPage:true,animations:'disabled'});
 report.mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,zeroTier:[...document.querySelectorAll('.tech-node')].filter(e=>e.getAttribute('aria-label').includes('，0 级科技，')).map(e=>e.querySelector('strong').textContent)}));
 await page.setViewportSize({width:1440,height:900});
 await page.getByRole('button',{name:'轨道船坞',exact:true}).click();
 await page.locator('.stage-loading').waitFor({state:'hidden'});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:path.join(dir,'ship-apk-original-colors-Cruiser-1440.png'),animations:'disabled'});
 await fs.writeFile(path.join(dir,'tech-tiers-browser-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:report.checks,headings:report.dom.headings,filters:report.dom.filters,edgeCount:report.dom.edgeCount,allEdgesForward:report.edgeOrder.every(e=>e.forward),mobile:report.mobile,errors:report.errors,blocked:report.blocked},null,2));
}finally{await browser?.close();}
