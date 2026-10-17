import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {playwright,freePort,frameMetrics} from './three-battle-harness.mjs';

const label=process.argv.find(v=>v.startsWith('--label='))?.slice(8)||'after';
const out=path.resolve('output/playwright/warp-performance',label);fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'warp-performance-test-'));let server,browser,page;const errors=[];
// Keep production code intact; measure its named render functions in a readable
// build so that the CPU profile can identify transition work and allocations.
const dir=path.resolve('opendesign/mockups/planet-construction-review');
let runtime=fs.readFileSync(path.join(dir,'aurora-runtime.js'),'utf8');
for(const part of ['moon','biomes','volcanoes','bridges','terrain','elevator','geology','game-bridge','celestial','decorations','territory','strategy','gargantua','npcs','battles','logistics','navigation','lod'])runtime=runtime.replace(`/*__AURORA_${part.toUpperCase()}__*/`,()=>fs.readFileSync(path.join(dir,`aurora-${part}.js`),'utf8'));
runtime=runtime.replace('/*__AURORA_DETAIL_CLIENT__*/',()=>fs.readFileSync(path.join(dir,'aurora-detail-client.js'),'utf8'));
runtime=runtime.replace('const runtimeAPI=',`const warpProbe=window.warpProbe={frames:[],longTasks:[],collect:false,costs:{}};
new PerformanceObserver(list=>{if(warpProbe.collect)warpProbe.longTasks.push(...list.getEntries().map(e=>({at:e.startTime,ms:e.duration,stage:auroraNavigation.missionFollow?.key})));}).observe({type:'longtask',buffered:false});
const originalNavigationRender=auroraNavigationRender;auroraNavigationRender=function(){const start=performance.now(),result=originalNavigationRender();if(warpProbe.collect){const n=auroraNavigation,flight=n.flights?.find(f=>f.id===n.missionFollow?.id);warpProbe.frames.push({at:start,ms:start-(warpProbe.last||start),renderMs:performance.now()-start,stage:n.missionFollow?.key,vertices:flight?.warpVertices||0,models:flight?.models||0,loads:n.loads.length,...warpProbe.costs});}warpProbe.costs={};warpProbe.last=start;return result;};
const originalScenery=createAuroraWarpScenery;createAuroraWarpScenery=function(){const start=performance.now(),value=originalScenery(),draw=value.draw;warpProbe.costs.sceneryInit=performance.now()-start;value.draw=function(...args){const start=performance.now();const result=draw(...args);warpProbe.costs.scenery=performance.now()-start;return result;};return value;};
const runtimeAPI=`);
const wrapper=`import * as original from './map-fleet.bundle.js?original';export const {missionVisual,cruiseView}=original;export async function createMapFleetRenderer(...args){const shared=await original.createMapFleetRenderer(...args);for(const key of ['begin','travel','cruise','end']){const fn=shared[key];shared[key]=function(...args){const start=performance.now(),result=fn.apply(this,args);if(window.warpProbe)warpProbe.costs[key]=(warpProbe.costs[key]||0)+performance.now()-start;return result;};}return shared;}`;
try{
 const w=createWorld(),p=createPlayer(w,'曲速性能隔离测试',Date.now(),()=>.5),home=w.planets[p.home];home.ships={Heavy_Fighter:32,Cruiser:8,Battleship:4};home.resources=[1e7,1e7,1e7];home.buildings.Shipyard=9;
 ensureSystemNpcs(w,...home.position.slice(0,2));const target=Object.values(w.planets).find(t=>t.npcType==='outpost'&&t.position[1]===home.position[1]);
 const file=path.join(temp,'universe.json'),session=path.join(temp,'session.json');fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${p.id}`}));
 const port=await freePort();assert(![8289,8390].includes(port));const base=`http://127.0.0.1:${port}`;
 server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});server.stderr.on('data',d=>errors.push(String(d)));
 let ready=false;for(let i=0;i<150&&!ready;i++){ready=await fetch(base+'/api/health').then(r=>r.json()).then(s=>s.isolated&&s.pid===server.pid).catch(()=>false);if(!ready)await new Promise(r=>setTimeout(r,100));}assert(ready);
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.route(url=>url.pathname.endsWith('/review.bundle.js'),route=>route.fulfill({contentType:'text/javascript',body:runtime}));
 await page.route(url=>url.pathname.endsWith('/map-fleet.bundle.js')&&!url.search,route=>route.fulfill({contentType:'text/javascript',body:wrapper}));
 await page.goto(base);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
 const client=await page.context().newCDPSession(page);await client.send('Profiler.enable');await client.send('Profiler.setSamplingInterval',{interval:1000});await client.send('Profiler.start');
 await page.evaluate(()=>{CommandApp.go('fleet');CommandApp.scene.frame.contentWindow.warpProbe.collect=true;});await page.locator('#dispatch-target').selectOption(target.id);
 for(const [type,count]of Object.entries(home.ships)){const input=page.locator(`[data-fleet-count="${type}"]`);await input.fill(String(count));await input.dispatchEvent('change');}
 await page.locator('#dispatch-form button[type="submit"],#dispatch-form button.primary').click();
 let last='';for(let i=0;i<150;i++){const state=await page.evaluate(()=>({stage:CommandApp.scene.renderer.navigationState.missionFollow?.key,battle:!!CommandApp.scene.renderer.navigationState.combatCamera}));if(state.stage!==last){last=state.stage;console.log(last);}if(state.battle)break;await page.waitForTimeout(500);}
 const {profile}=await client.send('Profiler.stop');fs.writeFileSync(path.join(out,'profile.cpuprofile'),JSON.stringify(profile));
 const probe=await page.evaluate(()=>{const p=CommandApp.scene.frame.contentWindow.warpProbe;p.collect=false;return p;});
 const stages={};for(const stage of ['departing','warp-in','cruise','warp-out']){const frames=probe.frames.filter(f=>f.stage?.endsWith(':'+stage));assert(frames.length>3,stage);const sorted=frames.map(f=>f.renderMs).sort((a,b)=>a-b);stages[stage]={...frameMetrics(frames),renderP50:sorted[Math.floor(sorted.length*.5)],renderP95:sorted[Math.floor(sorted.length*.95)],maxFrame:Math.max(...frames.map(f=>f.ms)),travelMean:frames.reduce((s,f)=>s+(f.travel||f.cruise||0),0)/frames.length,endMean:frames.reduce((s,f)=>s+(f.end||0),0)/frames.length,sceneryMax:Math.max(...frames.map(f=>f.scenery||0)),vertices:Math.max(...frames.map(f=>f.vertices))};}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({stages,errors,...probe},null,2));console.log(JSON.stringify({stages,longTasks:probe.longTasks,errors}));assert.deepEqual(errors,[]);
 await page.screenshot({path:path.join(out,'arrived.png')});
}finally{try{await browser?.close();}finally{try{if(server&&server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}}finally{const resolved=fs.realpathSync(temp),root=fs.realpathSync(os.tmpdir());assert(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('warp-performance-test-'));fs.rmSync(resolved,{recursive:true,force:true});}}}
