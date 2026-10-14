import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createRequire} from 'node:module';
import {publicCatalog} from '../game/catalog.mjs';

// Reuse the browser runtime used by the repository's existing UI self-check.
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'models/generated/apk-ships-v2'),checks=path.join(root,'output/playwright/ship-archive');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(checks,{recursive:true});
const base=path.join(root,'opendesign'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(base,'.'+name);if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
server.listen(0,'127.0.0.1');await once(server,'listening');let browser;
try{
  browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/mockups/galactic-command/ships.html`);await page.waitForFunction(()=>!!window.ShipAtlas);await page.locator('#reference-image').waitFor();
  const manifest=[];
  for(const ship of publicCatalog.shipArchive){
    await page.locator(`[data-model="${ship.id}"]`).click();await page.waitForFunction(id=>ShipAtlas.selected===id,ship.id);
    const encoded=await page.evaluate(async id=>{const data=await ShipAtlas.exportModel(id);return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(new Blob([data]));});},ship.id);
    const glb=Buffer.from(encoded,'base64');assert.equal(glb.toString('ascii',0,4),'glTF');assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
    const json=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));assert.ok(json.meshes.length>0);assert.ok(json.nodes.some(n=>n.name===ship.id),ship.id);
    fs.writeFileSync(path.join(out,ship.id+'.glb'),glb);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.locator('#stage').screenshot({path:path.join(out,ship.id+'.png')});
    const render=await page.evaluate(()=>ShipAtlas.renderer.domElement.toDataURL('image/png').split(',')[1]);fs.writeFileSync(path.join(checks,ship.id+'-transparent.png'),Buffer.from(render,'base64'));
    manifest.push({id:ship.id,name:ship.name,apkId:ship.apkId,file:ship.id+'.glb',preview:ship.id+'.png',bytes:glb.length,meshCount:json.meshes.length,modelSource:ship.modelSource});
    console.log('EXPORTED '+ship.id+' '+glb.length);
  }
  await page.locator('[data-model="Cruiser"]').click();await page.locator('#wireframe').click();assert.equal(await page.locator('#wireframe').getAttribute('aria-pressed'),'true');await page.locator('#wireframe').click();
  await page.locator('#model-version').selectOption('preserved');await page.waitForFunction(()=>document.querySelector('#model-note').textContent.includes('保留的现有模型'));assert.match(await page.locator('#model-note').innerText(),/未删除/);await page.locator('#model-version').selectOption('new');await page.waitForFunction(()=>document.querySelector('#model-note').textContent.includes('APK 重建草案')||document.querySelector('#model-note').textContent.includes('APK 重建'));
  await page.locator('[data-view="top"]').click();await page.locator('#reset-view').click();await page.screenshot({path:path.join(checks,'desktop.png')});
  await page.locator('#matrix-open').click();assert.equal(await page.locator('#counter-matrix tbody tr').count(),21);assert.ok(await page.locator('#counter-matrix td[data-rate="10"]').count()>0);await page.screenshot({path:path.join(checks,'counter-matrix.png')});await page.locator('#matrix-close').click();
  await page.locator('[data-model="Reaper"]').click();assert.match(await page.locator('#counters').innerText(),/免疫湮灭之星/);assert.match(await page.locator('#ship-stats').innerText(),/待取得/);
  await page.setViewportSize({width:390,height:844});await page.locator('[data-model="Solar_Satellite"]').click();await page.screenshot({path:path.join(checks,'mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile horizontal overflow');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));fs.writeFileSync(path.join(checks,'checks.json'),JSON.stringify({ships:manifest.length,glbsValidated:true,matrixRows:21,mobileOverflow:false,errors},null,2));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
