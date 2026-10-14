import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('output/playwright/aurora-navigation');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),result={checks:[],errors:[],graphicsWarnings:[],camera:[],cycles:[]},actions=[];
page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&/INVALID|GL_|WebGL/i.test(m.text()))result.graphicsWarnings.push(m.text())});
page.on('request',r=>{if(r.url().endsWith('/api/action'))actions.push(r.postDataJSON())});
const ready=()=>page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready,null,{timeout:60000});
const navState=()=>page.evaluate(()=>CommandApp.scene.snapshot.navigation);
const waitLevel=level=>page.waitForFunction(level=>CommandApp.scene.snapshot.navigation?.level===level,level,{timeout:30000});
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const clickWorld=async(id,double=false)=>{const target=await page.evaluate(id=>CommandApp.scene.snapshot.navigation.targets.find(p=>p.id===id),id);assert(target,'target exists '+id);const frame=await page.locator('.aurora-game-frame').boundingBox();await page.mouse[double?'dblclick':'click'](target.x+frame.x,target.y+frame.y);};
const wheelWorld=async(delta)=>{const frame=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.move(frame.x+frame.width*.6,frame.y+frame.height*.55);await page.mouse.wheel(0,delta);};
try{
 await page.goto('http://127.0.0.1:8292/?navigation=verify',{waitUntil:'networkidle'});await ready();assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 const earth=await page.evaluate(()=>EmpireAPI.state.planets.find(p=>p.biome==='terrestrial'&&!p.moon).id);
 if(await page.evaluate(()=>EmpireAPI.planet.id)!==earth){await page.locator('#planet-picker').selectOption(earth);await ready();}
 // The renderer must hold a continuous east-facing basis through polar focus and elevated dock focus.
 for(const initial of ['home','station']){
  await page.evaluate(initial=>{const r=CommandApp.scene.renderer;if(initial==='station')r.focusElevator('station');else r.home();r._settleView();},initial);
  const frames=await page.evaluate(async()=>{CommandApp.scene.selectBuilding('Terraformer');const values=[];await new Promise(resolve=>{let start=performance.now();function tick(){const s=CommandApp.scene.snapshot;values.push({camera:s.camera,view:s.view});if(performance.now()-start<1900)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});return values;});
  assert(frames.length>10);let minDot=1;
  for(let i=0;i<frames.length;i++){const p=frames[i],v=p.view;assert(v&&v.eye&&v.right&&v.up&&v.forward,'diagnostic camera basis');for(const a of Object.values(v))if(Array.isArray(a))assert(a.every(Number.isFinite));assert(dot(v.right,[Math.cos(p.camera.yaw),0,-Math.sin(p.camera.yaw)])>.85);if(i){for(const axis of ['right','up','forward'])minDot=Math.min(minDot,dot(v[axis],frames[i-1].view[axis]));}}
  assert(minDot>.8,'no abrupt image reversal');result.camera.push({initial,frames:frames.length,minAdjacentAxisDot:minDot,final:frames.at(-1)});
 }
 await page.locator('#close-modal').click();await page.screenshot({path:path.join(out,'south-building.png')});
 await page.evaluate(()=>{CommandApp.scene.renderer.focusElevator('station');CommandApp.scene.renderer._settleView()});await page.locator('#close-modal').click();await page.screenshot({path:path.join(out,'orbital-dock.png')});
 result.checks.push('Southern building focus and orbital-dock to southern-building transition: no camera inversion');
 // Map navigation is visual only. No build/research/fleet actions should be sent.
 console.log('Camera checks completed; navigation checks start');
 await page.evaluate(()=>CommandApp.scene.orbit());
 for(let i=0;i<10&&(await navState()).level==='planet';i++){await wheelWorld(180);await page.waitForTimeout(70)}
 await waitLevel('system');await page.waitForTimeout(100);
 const initial=await page.evaluate(()=>({s:CommandApp.scene.snapshot,frame:CommandApp.scene.frame.src,frames:document.querySelectorAll('.aurora-game-frame').length}));
 assert(initial.s.navigation.proxyVertices<=1800);assert.equal(initial.s.navigation.bufferCount,3);assert.equal(initial.frames,1);
 await page.screenshot({path:path.join(out,'solar-system.png')});
 const actorBefore=initial.s.actors.map(a=>a.t);await page.waitForTimeout(350);const actorAfter=await page.evaluate(()=>CommandApp.scene.snapshot.actors.map(a=>a.t));assert.deepEqual(actorAfter,actorBefore,'system view must skip colony actors');
 result.checks.push('Wheel crosses the planet/system threshold; low-poly proxy uses <=1800 vertices and skips colony animation');
 for(let i=0;i<20;i++){
  await clickWorld(earth,true);await waitLevel('planet');
  await page.evaluate(()=>CommandApp.scene.orbit());
  for(let j=0;j<10&&(await navState()).level==='planet';j++){await wheelWorld(180);await page.waitForTimeout(45)}await waitLevel('system');
  const state=await page.evaluate(()=>({id:EmpireAPI.planet.id,n:CommandApp.scene.snapshot.navigation,buffers:CommandApp.scene.snapshot.bufferCount,frame:CommandApp.scene.frame.src,frames:document.querySelectorAll('.aurora-game-frame').length}));
  assert.equal(state.id,earth);assert.equal(state.n.activePlanetId,earth);assert.equal(state.buffers,initial.s.bufferCount);assert.equal(state.frame,initial.frame);assert.equal(state.frames,1);result.cycles.push({cycle:i+1,buffers:state.buffers,activePlanetId:state.n.activePlanetId});
 }
 result.checks.push('20 real double-click/wheel round trips preserve target, one iframe, one rendering context and stable buffer counts');
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.graphicsWarnings,[]);assert.deepEqual(actions,[]);result.passed=true;console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(out,'navigation-functional.json'),JSON.stringify(result,null,2));await browser.close();}
