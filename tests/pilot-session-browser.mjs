import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {startServer,playwright} from './three-battle-harness.mjs';
const out=path.resolve('output/playwright/pilot-session');fs.mkdirSync(out,{recursive:true});
const server=await startServer({directory:path.join(out,'server'),live:true,fleet:{Light_Fighter:2,Battleship:2}});
let browser;const errors=[],inputs=[[],[]];
try{
 browser=await playwright().chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1400,height:900}});
 const pages=[await context.newPage(),await context.newPage()];
 for(const [i,page]of pages.entries()){
  page.on('pageerror',e=>errors.push(e.message));page.on('response',async r=>{if(r.url().endsWith('/control')&&!r.ok())errors.push(await r.text());});
  page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/control'))inputs[i].push(r.postDataJSON());});
  await page.goto(server.base+'/opendesign/mockups/galactic-command/battlefield-three.html?battle='+server.battle.id);
  await page.waitForFunction(()=>window.flightController?.metadata.length>0);
 }
 const [pilot,observer]=pages;
 await pilot.evaluate(async()=>{const c=flightController;await c.select(c.metadata.find(m=>m.owner===c.owner&&m.type==='Light_Fighter').id);});
 await pilot.locator('#native-claim').click();await pilot.waitForFunction(()=>flightController.controlled!==null);
 await pilot.keyboard.down('KeyA');await pilot.keyboard.down('KeyW');
 const frames=await pilot.evaluate(()=>new Promise(resolve=>{const samples=[],start=performance.now();function sample(t){samples.push({time:t,roll:GalacticDemo.state.flight.roll,controlled:flightController.controlled,seq:flightController.seq});if(t-start<3200)requestAnimationFrame(sample);else resolve(samples);}requestAnimationFrame(sample);}));
 await pilot.keyboard.up('KeyA');await pilot.keyboard.up('KeyW');
 assert(frames.every(f=>f.controlled!==null));assert(frames.length>40);
 const deltas=frames.slice(1).map((f,i)=>Math.abs(Math.atan2(Math.sin(f.roll-frames[i].roll),Math.cos(f.roll-frames[i].roll))));assert(Math.max(...deltas)<.2,'rolling should not jump between server snapshots');
 assert.equal(await observer.evaluate(()=>flightController.controlled),null);assert.equal(inputs[1].filter(a=>a.type==='input').length,0);
 const seq=inputs[0].filter(a=>a.type==='input').map(a=>a.seq);assert(seq.length>15);assert(seq.every((s,i)=>!i||s>seq[i-1]));
 await pilot.locator('#native-release').click();await pilot.waitForFunction(()=>flightController.controlled===null);
 await observer.locator('#native-claim').click();await observer.waitForFunction(()=>flightController.controlled!==null);
 await pilot.waitForTimeout(500);assert.equal(await pilot.evaluate(()=>flightController.controlled),null);
 await observer.locator('#native-release').click();assert.deepEqual(errors,[]);
 await pilot.screenshot({path:path.join(out,'pilot.png')});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,inputCount:seq.length,maxRollFrameDelta:Math.max(...deltas),observerInputs:0,errors},null,2));console.log('Pilot session browser verification passed');
}finally{await browser?.close();await server.stop();}
