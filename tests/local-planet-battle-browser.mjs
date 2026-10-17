import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {startServer,playwright} from './three-battle-harness.mjs';
const out=path.resolve('output/playwright/local-planet-battle');
const server=await startServer({directory:path.join(out,'server'),live:true,fleet:{Cruiser:4,Battleship:2}});
let browser;const errors=[];
try{
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(server.base+'/opendesign/mockups/galactic-command/battlefield-three.html?battle='+server.battle.id);
 await page.waitForURL('**/galactic-command/index.html?battle=*');
 await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation.battles.visible.some(b=>b.ships.length));
 await page.evaluate(()=>CommandApp.scene.renderer._advance(3));
 await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.visibleDetails.some(d=>d.weight>0));
 await page.screenshot({path:path.join(out,'live-local-planet.png')});
 const live=await page.evaluate(()=>{const s=CommandApp.scene,n=s.snapshot.navigation;return {frame:s.frame.src,selected:n.selectedPlanetId,details:n.visibleDetails,ships:n.battles.visible[0].ships};});
 assert(live.ships.length>0);assert(live.details.some(d=>d.key===live.selected));
 // Finish only this isolated trial by starting another one, then follow its saved replay link.
 const response=await page.evaluate(async()=>{const r=await fetch('/api/battle-trial',{method:'POST',headers:{'Content-Type':'application/json','X-Empire-Client':'galactic-command'},body:JSON.stringify({attacker:{Cruiser:1},defender:{Cruiser:1},seed:7})});return {ok:r.ok,body:await r.json()};});
 assert(response.ok,JSON.stringify(response));
 const state=await fetch(server.base+'/api/state',{headers:{'X-Empire-Client':'galactic-command'}}).then(r=>r.json());
 const report=state.reports.find(r=>r.battleId===server.battle.id);assert(report);
 await page.goto(server.base+'/opendesign/mockups/galactic-command/battlefield-three.html?replay='+report.id);
 await page.waitForFunction(()=>window.flightController?.replay&&window.GalacticDemo?.renderer);
 assert.match(page.url(),/battlefield-three\.html\?replay=/);
 await page.evaluate(()=>{flightController.paused=true;flightController.seek(1);});
 await page.screenshot({path:path.join(out,'replay-local-planet.png')});
 const replay=await page.evaluate(()=>({id:flightController.report.id,environment:flightController.replay.environment,overview:flightController.overview,gl:GalacticDemo.renderer.gl.getError()}));
 assert.equal(replay.id,report.id);assert.equal(replay.environment.planetId,server.player.home);
 assert.equal(replay.overview,true);assert.equal(replay.gl,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,live,replay,errors},null,2));
 console.log('Live battles use the local map; historical playback keeps its recorded environment in the read-only player.');
}finally{await browser?.close();await server.stop();}
