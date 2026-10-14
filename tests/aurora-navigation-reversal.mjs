import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),result={errors:[],actions:[],reversals:[]};page.on('pageerror',e=>result.errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/api/action'))result.actions.push(r.postDataJSON())});
const pose=()=>page.evaluate(()=>{const s=CommandApp.scene.snapshot,n=s.navigation,t=n.transition;return {level:n.level,direction:t?.direction,elapsed:t?.elapsed,duration:t?.duration,p:t?(t.direction==='out'?t.elapsed/t.duration:1-t.elapsed/t.duration):(n.level==='planet'?0:1),buffers:s.bufferCount,frameCount:document.querySelectorAll('.aurora-game-frame').length}});
try{
 await page.goto('http://127.0.0.1:8292/?verify=reversal',{waitUntil:'networkidle'});await page.waitForFunction(()=>CommandApp.scene?.renderer?.ready);assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 await page.locator('.bottom-bar [data-page="system"]').click();await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.level==='system');
 await page.evaluate(()=>{window._transitionTrace=[];window._traceActive=true;function sample(){if(!_traceActive)return;const n=CommandApp.scene.snapshot.navigation,t=n.transition;_transitionTrace.push({time:performance.now(),level:n.level,direction:t?.direction,p:t?(t.direction==='out'?t.elapsed/t.duration:1-t.elapsed/t.duration):(n.level==='planet'?0:1)});requestAnimationFrame(sample)}requestAnimationFrame(sample)});
 await page.locator('#system-target [data-map-enter]').click();await page.waitForFunction(()=>{const t=CommandApp.scene.snapshot.navigation.transition;return t?.direction==='in'&&t.elapsed>.45&&t.elapsed<.9});
 const inBefore=await pose();await page.locator('.bottom-bar [data-page="system"]').click();const outAfter=await pose();assert.equal(outAfter.direction,'out');assert(Math.abs(outAfter.p-inBefore.p)<.15,'in to out retains blend progress');result.reversals.push({from:inBefore,to:outAfter});
 await page.waitForTimeout(130);const outBefore=await pose();assert.equal(outBefore.direction,'out');await page.locator('.bottom-bar [data-page="home"]').click();const inAfter=await pose();assert.equal(inAfter.direction,'in');assert(Math.abs(inAfter.p-outBefore.p)<.15,'out to in retains blend progress');result.reversals.push({from:outBefore,to:inAfter});
 await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.level==='planet');const final=await pose();assert.equal(final.frameCount,1);assert.equal(final.buffers,inBefore.buffers);
 const trace=await page.evaluate(()=>{_traceActive=false;return _transitionTrace});result.maxFrameProgressStep=Math.max(...trace.slice(1).map((f,i)=>Math.abs(f.p-trace[i].p)));assert(result.maxFrameProgressStep<.13,'no transition jump on an observed frame');
 result.final=final;assert.deepEqual(result.errors,[]);assert.deepEqual(result.actions,[]);result.passed=true;console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync('output/playwright/aurora-navigation/transition-reversal.json',JSON.stringify(result,null,2));await browser.close()}
