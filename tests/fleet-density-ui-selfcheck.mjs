import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,trialPresets} from '../game/battle-trial.mjs';
import {recordFrame,stepSpatialBattle} from '../game/spatial-battle.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/fleet-density');fs.mkdirSync(dir,{recursive:true});
const results=[],errors=[];
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
try{
 for(const preset of (process.env.FLAGSHIP_ONLY?[trialPresets[8]]:[trialPresets[6],trialPresets[7],trialPresets[8]])){
  const now=Date.now(),world=createWorld(now),player=createPlayer(world,'舰队密度验收',now);
  const b=startTrial(world,player,{attacker:preset.fleet,defender:preset.fleet,seed:42},now),n=b.ships.length;
  // Isolated load fixture: closer starting positions and eightfold durability to sample sustained combat.
  for(const s of b.ships){s.x*=.3;s.z*=.4;s.hp=s.maxHp*=8;s.shield=s.maxShield*=8;}recordFrame(b);
  const probe=structuredClone(b),times=[];for(let i=0;i<600;i++){const t=performance.now();stepSpatialBattle(probe);times.push(performance.now()-t);}
  times.sort((a,b)=>a-b);
  const save=path.join(dir,`universe-${n}.json`),session=path.join(dir,`session-${n}.json`);fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
  const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',s=>stderr+=s);await once(child.stdout,'data');
  const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>errors.push(e.message));
  const result={name:preset.name,ships:n,simulationMs:{mean:times.reduce((a,b)=>a+b,0)/times.length,p95:times[Math.floor(times.length*.95)]}};
  try{
   await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.locator('[data-page="battle"]').click();
   assert.equal(await page.locator('.trial-stats > .stats-scroll tbody tr').count(),14);
   assert.equal(await page.getByLabel('己方编队 深空吞噬者',{exact:true}).count(),1);
   await page.locator(`[data-open-battle="${b.id}"]`).click();const frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();
   await frame.waitForFunction(n=>window.flightController?.rows.length===n,n);
   await frame.waitForFunction(()=>GalacticDemo.state.flight.projectiles.length>5||GalacticDemo.state.flight.beams.length>2,null,{timeout:40000});
   const sample=()=>frame.evaluate(async()=>{const frames=[];let previous=performance.now(),start=previous,maxParticles=0,maxImpacts=0;await new Promise(resolve=>{function tick(t){frames.push(t-previous);previous=t;maxParticles=Math.max(maxParticles,GalacticDemo.state.flight.particles.length);maxImpacts=Math.max(maxImpacts,GalacticDemo.state.flight.weaponImpacts.length);if(t-start<10000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});let elapsed=0,count=0,min=Infinity;for(const ms of frames.slice(5)){elapsed+=ms;count++;if(elapsed>=1000){min=Math.min(min,count*1000/elapsed);count=0;elapsed=0;}}return {average:frames.length*1000/frames.reduce((a,b)=>a+b,0),minOneSecond:min,heapMB:performance.memory?.usedJSHeapSize/1048576,maxParticles,maxImpacts,render:flightController.renderStats,gl:GalacticDemo.renderer.gl.getError()};});
   result.overview=await sample();await page.screenshot({path:path.join(dir,`overview-${n}.png`)});
   const type=preset.fleet.Iron_Behemoth?'Iron_Behemoth':'Dreadnought';
   await frame.evaluate(type=>flightController.chooseType(type),type);await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);
   assert.equal(await frame.evaluate(()=>flightController.metadata[flightController.controlled].type),type);
   if(type==='Iron_Behemoth'){
    assert.equal(await frame.locator('#fire-spinal').isVisible(),false);
    result.flagship=await frame.evaluate(()=>({length:flightController.metadata[flightController.controlled].profile.length,mesh:flightController.meshGroups.has('attacker:Iron_Behemoth'),bounds:GalacticDemo.state.flight.profile.bounds}));
   }
   result.pilot=await sample();await page.screenshot({path:path.join(dir,`pilot-${n}.png`)});await frame.locator('#native-release').click();
   await frame.evaluate(()=>{flightController.overview=true;flightController.cinematicAnchor=null;flightController.cinemaComposition=false;flightController.center=[0,0,0];flightController.distance=10000;});await page.waitForTimeout(500);
   result.far=await frame.evaluate(()=>flightController.renderStats);assert.equal(result.far.instances,result.far.alive);assert.ok(result.far.low>0);
   assert.equal(result.overview.gl,0);assert.equal(result.pilot.gl,0);assert.equal(stderr,'');
   console.log(JSON.stringify(result));
  }finally{results.push(result);await page.close();child.kill();await once(child,'exit');}
 }
 assert.deepEqual(errors,[]);
}finally{fs.writeFileSync(path.join(dir,process.env.FLAGSHIP_ONLY?'flagship-results.json':'results.json'),JSON.stringify({fixture:'1080p headless Chrome D3D11; closer starts, 8x durability; isolated saves',results,errors},null,2));await browser.close();}
