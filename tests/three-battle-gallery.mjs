import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'http://localhost:55796';
const out=path.resolve('output/playwright/three-battle-gallery');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
  await page.goto(base+'/opendesign/mockups/galactic-command/ships.html?ship=Battleship');
  await page.waitForFunction(()=>window.ShipAtlas?.current);
  const initial=await page.evaluate(()=>({triangles:ShipAtlas.current.children.length,selected:ShipAtlas.selected}));
  assert.equal(initial.selected,'Battleship');
  const selections=[];
  for(const id of ['Cruiser','Reaper','Iron_Behemoth','Light_Fighter','Battleship']){
    await page.evaluate(id=>ShipAtlas.select(id),id);
    await page.waitForFunction(id=>ShipAtlas.selected===id,id);
    selections.push(await page.evaluate(()=>({id:ShipAtlas.selected,geometries:ShipAtlas.renderer.info.memory.geometries,gl:ShipAtlas.renderer.getContext().getError()})));
  }
  const bytes=await page.evaluate(async()=>{const data=await ShipAtlas.exportModel('Battleship');return data.byteLength;});assert.ok(bytes>100);
  await page.locator('#weapon-demo').click();await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(out,'atlas-shared-models.png')});
  await page.locator('#weapon-demo').click();
  await page.locator('#scale-compare').click();await page.waitForTimeout(300);
  await page.locator('#scale-compare').click();await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>ShipAtlas.renderer.getContext().getError()),0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,selections,exportBytes:bytes,errors},null,2));
  console.log(JSON.stringify({passed:true,exportBytes:bytes,selections}));
}finally{await browser.close();}
