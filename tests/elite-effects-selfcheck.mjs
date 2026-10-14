import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.EMPIRE_TEST_URL;if(!base)throw Error('EMPIRE_TEST_URL must name a running local test server');
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+\/$/.test(base))throw Error('Local test server required');
const directory=path.resolve('output/playwright/elite-effects');fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const errors=[],results=[];
try{
 for(const id of ['Dreadnought','Interceptor','Devourer_Interceptor']){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'opendesign/mockups/galactic-command/hangar.html?ship='+id+'&map=planet&entry=direct-flight-01');
  await page.waitForFunction(()=>window.GalacticDemo?.state.mode==='flight');
  await page.locator('#align-target').click();await page.locator('#fire-spinal').click();
  await page.waitForFunction(()=>GalacticDemo.state.flight.mainShots>0,null,{timeout:15000});
  const result=await page.evaluate(()=>{const g=GalacticDemo,p=g.state.flight;return {shots:p.mainShots,visual:p.profile.visual,impacts:p.weaponImpacts?.length||0,projectiles:p.projectiles.length,webglError:g.renderer.gl.getError()};});
  assert.ok(result.shots>0);assert.ok(result.impacts>0);assert.equal(result.webglError,0);assert.equal(result.visual.elite,id!=='Dreadnought');results.push({id,...result});
  await page.screenshot({path:path.join(directory,id+'-fire.png')});
  // Let the actual projectile/beam complete; effects must not break subsequent frames.
  await page.waitForTimeout(4500);await page.screenshot({path:path.join(directory,id+'-impact.png')});await page.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();}
