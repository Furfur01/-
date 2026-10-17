import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,ensureSystemNpcs} from '../game/engine.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/fleet-follow');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fleet-follow-')),now=Date.now(),w=createWorld(),p=createPlayer(w,'舰队跟随验收',now,()=>.5),home=w.planets[p.home];
home.buildings.Shipyard=9;ensureSystemNpcs(w,...home.position.slice(0,2));
const target=Object.values(w.planets).find(t=>t.npcType==='outpost'&&t.position[1]===home.position[1]);
w.missions=[0,1].map(i=>({id:'follow-'+i,owner:p.id,from:home.id,target:target.id,position:target.position,task:'transport',ships:{Cruiser:3},cargo:[0,0,0],phase:i?'return':'outbound',start:now-300000,end:now+300000,travel:600000,seed:42}));
const file=path.join(temp,'universe.json');fs.writeFileSync(file,JSON.stringify(w));fs.writeFileSync(file+'.session',JSON.stringify({cookie:`empire=${p.id}`}));
const port=await freePort(),server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:file+'.session',EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});
let browser;const errors=[],cruiseResults=[];server.stderr.on('data',d=>errors.push(String(d)));
async function checkCruise(page,id,name){
 const result=await page.evaluate(id=>{
  const s=CommandApp.scene;for(let i=0;i<50;i++)s.renderer._advance(.05);const n=s.snapshot.navigation,d=s.frame.contentDocument;
  const background=d.querySelector('.map-warp-background'),fleet=d.querySelector('.map-fleet-renderer'),overlay=d.querySelector('.map-battle-overlay');
  const composite=d.createElement('canvas');composite.width=fleet.width;composite.height=fleet.height;const c=composite.getContext('2d');
  const world=d.querySelector('#world');
  for(const layer of [world,background,fleet,overlay])c.drawImage(layer,0,0,composite.width,composite.height);
  const pixels=c.getImageData(0,0,composite.width,composite.height).data;let hullPixels=0;
  for(let i=0;i<pixels.length;i+=4)if(pixels[i]>90&&pixels[i+1]>110&&pixels[i+2]/pixels[i]<1.65&&pixels[i+3]>240)hullPixels++;
  c.clearRect(0,0,composite.width,composite.height);c.drawImage(world,0,0,composite.width,composite.height);
  const scenery=c.getImageData(0,0,composite.width,composite.height).data;let sceneryPixels=0;for(let i=0;i<scenery.length;i+=4)if(scenery[i]+scenery[i+1]+scenery[i+2]>100)sceneryPixels++;
  c.clearRect(0,0,composite.width,composite.height);c.drawImage(fleet,0,0,composite.width,composite.height);
  const propulsion=c.getImageData(0,0,composite.width,composite.height).data;let flamePixels=0;for(let i=0;i<propulsion.length;i+=4)if(propulsion[i]>100&&propulsion[i+1]>15&&propulsion[i+1]<propulsion[i]*.85&&propulsion[i+2]<propulsion[i+1]*.85&&propulsion[i+3]>30)flamePixels++;
  const tint=background.getContext('2d').getImageData(0,0,background.width,background.height).data;let alpha=0;for(let i=3;i<tint.length;i+=4)alpha+=tint[i];alpha/=background.width*background.height;
  const style=element=>s.frame.contentWindow.getComputedStyle(element);
  return {flight:n.flights.find(f=>f.id===id),status:n.warpTunnel?.status,vanishingY:n.warpTunnel?.vanishingY,hullPixels,flamePixels,sceneryPixels,scenery:n.warpTunnel?.scenery,backgroundAlpha:alpha,display:style(background).display,ordered:Number(style(background).zIndex)<Number(style(fleet).zIndex)&&Number(style(fleet).zIndex)<Number(style(overlay).zIndex),width:composite.width,height:composite.height,error:fleet.getContext('webgl2').getError(),worldError:s.renderer.getWebGLError()};
 },id);
 assert(result.flight.observer&&result.flight.models>0,'Cruise must show the followed fleet');assert(result.hullPixels>400,'Composited hulls must remain visible');assert(result.scenery&&result.sceneryPixels>400,'Real scenery must remain visible during warp');assert(result.backgroundAlpha<20,'Flow must stay transparent over the scenery');assert.notEqual(result.display,'none');assert(result.ordered);assert.equal(result.error,0);assert.equal(result.worldError,0);assert(result.status.seconds>0&&result.status.progress>.45&&result.status.progress<.6);
 assert(result.flight.exhausts>0,'Visible ships must emit exhaust');assert(Math.abs(result.flight.view.forward[0])<1e-9,'Observer must look straight along the hull');assert.equal(result.flight.view.vanishingY,result.vanishingY,'Scenery flow must match the fleet heading');
 if(name.includes('probe')||name.includes('cargo'))assert(result.flamePixels>60,'Combustion exhaust must be visible in the actual GPU frame');
 await page.screenshot({path:path.join(out,name+'.png')});cruiseResults.push({name,...result});return result;
}
try{
 const base=`http://127.0.0.1:${port}`;let ready=false;
 for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Isolated server exited');try{if((await fetch(base+'/api/catalog')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 assert(ready,'Isolated server must become ready');browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);await page.evaluate(()=>CommandApp.scene.prepareDeparture());
 for(const id of ['follow-0','follow-1']){
  await page.evaluate(()=>CommandApp.go('fleet'));await page.locator('[data-filter="flights"]').click();await page.locator(`[data-follow-fleet="${id}"]`).click();
  await page.waitForFunction(id=>CommandApp.scene.snapshot.navigation.warpTunnel?.id===id&&CommandApp.scene.snapshot.navigation.warpTunnel.strength===1,id);
  await checkCruise(page,id,id+'-tunnel');
  const before=await page.evaluate(()=>CommandApp.scene.snapshot.navigation.goal.dist);
  await page.mouse.move(800,500);await page.mouse.wheel(0,3000);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.goal.dist),before);assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.missionFollow?.id),id);
  // Key events must work when focus is inside the persistent navigation iframe.
  const frame=page.frames().find(f=>f.url().includes('planet-construction-review/index.html'));
  if(id==='follow-0')await frame.locator('canvas').first().focus();else await page.locator('#refresh').focus();
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!CommandApp.scene.snapshot.navigation.missionFollow&&!CommandApp.scene.snapshot.navigation.warpTunnel);
  const cleared=await page.evaluate(()=>{const s=CommandApp.scene;s.renderer._advance(.016);const c=s.frame.contentDocument.querySelector('.map-warp-background');return c.getContext('2d').getImageData(10,10,1,1).data[3];});assert.equal(cleared,0,'Esc must clear the observer background');
  assert.equal(await page.evaluate(()=>CommandApp.scene.combat.status),null);
  // Re-enter using the external warp marker, with a real pointer event.
  const point=await page.evaluate(id=>{const s=CommandApp.scene,n=s.snapshot.navigation,q=n.targets.find(q=>q.type==='mission'&&q.id===id),r=s.frame.getBoundingClientRect();return {x:r.x+q.x,y:r.y+q.y};},id);
  await page.mouse.click(point.x,point.y);await page.waitForFunction(id=>CommandApp.scene.snapshot.navigation.missionFollow?.id===id,id);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!CommandApp.scene.snapshot.navigation.missionFollow);
 }
 // Place a visible departure fleet using presentation state only; no save mutation.
 const result=await page.evaluate(()=>{
  const s=CommandApp.scene,r=s.renderer,m={...EmpireAPI.state.missions[0],start:EmpireAPI.now-2500,end:EmpireAPI.now+17500,fromPosition:EmpireAPI.planet.position};
  r.setNavigationState({missions:[m]});r.focusMapMission(m.id);for(let i=0;i<45;i++)r._advance(.05);r.exitMapFleet();r._advance(2);
  const n=s.snapshot.navigation,hits=n.targets.filter(t=>t.type==='mission'&&t.ship!=null),q=hits[1],rect=s.frame.getBoundingClientRect();return {models:n.flights[0].models,hits:hits.length,point:{x:rect.x+q.x,y:rect.y+q.y}};
 });assert(result.models>=3);assert(result.hits>=3,'Every displayed travelling ship must be selectable outside follow');
 await page.mouse.click(result.point.x,result.point.y);await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.missionFollow?.id==='follow-0');
 for(const [name,ships]of [['desktop-probe',{Probe:1}],['desktop-cargo',{Cargo_Ship:1}]]){
  await page.evaluate(ships=>{const r=CommandApp.scene.renderer,m={...EmpireAPI.state.missions[1],ships,count:1,fromPosition:EmpireAPI.planet.position};r.setNavigationState({missions:[m]});r.focusMapMission(m.id);r._advance(.05);},ships);
  await checkCruise(page,'follow-1',name);
 }
 await page.setViewportSize({width:390,height:844});
 for(const [name,ships]of [['mobile-probe',{Probe:1}],['mobile-single',{Cruiser:1}],['mobile-mixed',{Battleship:2,Cruiser:5,Heavy_Fighter:8}]]){
  await page.evaluate(ships=>{const s=CommandApp.scene,r=s.renderer,m={...EmpireAPI.state.missions[0],ships,count:Object.values(ships).reduce((a,b)=>a+b,0),fromPosition:EmpireAPI.planet.position};r.setNavigationState({missions:[m]});r.focusMapMission(m.id);r._advance(.05);},ships);
  await checkCruise(page,'follow-0',name);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({cruiseResults,errors},null,2));console.log(JSON.stringify({listSelection:2,warpMarkerReentry:2,wheelLocked:true,escapeInFrame:true,cruise:cruiseResults.map(r=>({name:r.name,models:r.flight.models,hullPixels:r.hullPixels})),...result,errors}));
}finally{try{await browser?.close();}finally{if(server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}fs.rmSync(temp,{recursive:true,force:true});}}
