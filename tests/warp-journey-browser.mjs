import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/warp-journey');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'warp-journey-')),world=createWorld(),player=createPlayer(world,'曲速动画验收',Date.now(),()=>.5),home=world.planets[player.home];
home.ships={Cruiser:3};home.resources=[1e6,1e6,1e6];home.buildings.Shipyard=9;ensureSystemNpcs(world,...home.position.slice(0,2));
const target=Object.values(world.planets).find(t=>t.npcType==='cargo'&&t.position[1]===home.position[1]),save=path.join(temp,'universe.json');
fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(save+'.session',JSON.stringify({cookie:`empire=${player.id}`}));
const port=await freePort();assert(![8289,8390].includes(port));const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:save+'.session',EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});
let browser;const errors=[],results=[];server.stderr.on('data',d=>errors.push(String(d)));
try{
  let ready=false;for(let i=0;i<150&&!ready;i++){ready=await fetch(`http://127.0.0.1:${port}/api/health`).then(r=>r.json()).then(s=>s.isolated&&s.pid===server.pid).catch(()=>false);if(!ready)await new Promise(r=>setTimeout(r,100));}assert(ready,'Isolated test server must become ready');
  browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});const page=await browser.newPage({viewport:{width:1600,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
  await page.evaluate(()=>CommandApp.go('fleet'));await page.locator('#dispatch-target').selectOption(target.id);await page.locator('#dispatch-task').selectOption('attack');await page.locator('[data-fleet-count="Cruiser"]').fill('3');await page.locator('#dispatch-form button[type="submit"],#dispatch-form button.primary').click();
  await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.flights.some(f=>f.models>0));
  const mission=await page.evaluate(()=>EmpireAPI.state.missions.at(-1));
  for(const phase of ['outbound','return'])for(const [stage,elapsed]of [['warp-in',5200],['warp-out',15000]]){
    const result=await page.evaluate(({mission,phase,elapsed})=>{
      const s=CommandApp.scene,r=s.renderer,now=EmpireAPI.now,home=EmpireAPI.state.planets.find(p=>p.id===mission.from),m={...mission,phase,start:now-elapsed,end:now+20000-elapsed,fromPosition:home.position,count:3};
      r.setNavigationState({missions:[m]});r.focusMapMission(m.id);r._advance(.01);
      // Render each settling step: the dock also rotates with the planet.
      for(let i=0;i<80;i++){const now=EmpireAPI.now;r.setNavigationState({missions:[{...m,start:now-elapsed,end:now+20000-elapsed}]});r._advance(.05);}
      const n=s.snapshot.navigation,flight=n.flights.find(f=>f.id===m.id),c=s.frame.contentDocument.querySelector('.map-fleet-renderer'),g=c.getContext('webgl2'),pixels=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,pixels);
      let lit=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)lit++;
      return {flight,goal:n.goal,camera:n.camera,lit,error:g.getError()};
    },{mission,phase,elapsed});
    await page.screenshot({path:path.join(out,phase+'-'+stage+'.png')});
    if(result.lit<=100)console.log(JSON.stringify({phase,stage,...result}));
    assert.equal(result.flight.stage,stage);assert(result.flight.warpVertices>3000);assert.deepEqual(result.goal.center,result.flight.focus);assert(result.lit>100,'Follow camera must show the actual warp fleet');assert.equal(result.error,0);results.push({phase,stage,...result});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log('Actual dispatch, tracked camera and visible warp pixels verified on outbound and return.');
}finally{try{await browser?.close();}finally{try{if(server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}finally{const resolved=fs.realpathSync(temp),root=fs.realpathSync(os.tmpdir());assert(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('warp-journey-'));fs.rmSync(resolved,{recursive:true,force:true});}}}
