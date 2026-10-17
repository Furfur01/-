import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {startServer,playwright,createFixture,mountReplay} from './three-battle-harness.mjs';

const directory=path.resolve('output/playwright/cockpit-middle');
const server=await startServer({directory:path.join(directory,'server')});
const browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await mountReplay(page,server,createFixture({seconds:1,fleet:{Light_Fighter:1,Battleship:1,Reaper:1}}),'three');
 for(const type of ['Light_Fighter','Battleship','Reaper']){
  await page.evaluate(type=>{flightController.chooseType(type);flightController.overview=false;const p=GalacticDemo.state.flight;p.external=false;p.cameraBlend=0;p.cameraVelocity=0;},type);
  await page.waitForTimeout(500);
  const before=await page.evaluate(()=>({heading:GalacticDemo.state.flight.yawTarget,pitch:GalacticDemo.state.flight.pitchTarget,forward:GalacticDemo.renderer.cameraForward,orbit:GalacticDemo.state.flight.orbitYaw}));
  await page.mouse.move(650,500);await page.mouse.down({button:'middle'});await page.mouse.move(850,580,{steps:12});await page.mouse.up({button:'middle'});await page.waitForTimeout(200);
  const after=await page.evaluate(()=>({pose:GalacticDemo.state.flight.cabinPose,heading:GalacticDemo.state.flight.yawTarget,pitch:GalacticDemo.state.flight.pitchTarget,forward:GalacticDemo.renderer.cameraForward,orbit:GalacticDemo.state.flight.orbitYaw,external:GalacticDemo.state.flight.external,gl:GalacticDemo.renderer.gl.getError()}));
  assert(Math.abs(after.pose.yaw)>.5,type+' head yaw');assert(Math.abs(after.pose.pitch)>.2,type+' head pitch');assert.equal(after.heading,before.heading);assert.equal(after.pitch,before.pitch);assert.equal(after.orbit,before.orbit);assert.equal(after.external,false);assert.equal(after.gl,0);assert(Math.hypot(...after.forward.map((v,i)=>v-before.forward[i]))>.2,type+' rendered view moves');
  await page.screenshot({path:path.join(directory,type+'-look.png')});
  await page.keyboard.press('KeyC');assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.cabinPose.yaw),0);assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.cabinPose.pitch),0);
  if(type==='Light_Fighter')assert.deepEqual(await page.evaluate(()=>GalacticDemo.state.flight.cabinPose.eye),[0,0,0]);
  results.push({type,middleLook:true,headingUnchanged:true,externalOrbitUnchanged:true,reset:true});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();await server.stop();}
