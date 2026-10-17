import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial} from '../game/battle-trial.mjs';
import {advanceSpatialBattle,recordFrame,spatialMetadata} from '../game/spatial-battle.mjs';
import {playwright,freePort} from './three-battle-harness.mjs';
import {clickBridge,bridgeLayout} from './bridge-console-harness.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'devourer-isolated-test-'));
const out=path.resolve('output/playwright/devourer');fs.mkdirSync(out,{recursive:true});
let server,browser,page;const errors=[],result={};
try{
  const now=Date.now(),world=createWorld(now),player=createPlayer(world,'深空吞噬者隔离测试',now);
  const b=startTrial(world,player,{attacker:{Iron_Behemoth:1,Cruiser:8},defender:{Iron_Behemoth:1,Battleship:8}},now);
  b.environment=null;
  const own=b.ships.find(s=>s.owner===player.id&&s.type==='Iron_Behemoth'),target=b.ships.find(s=>s.side==='defender'&&s.type==='Battleship');
  for(const s of b.ships){s.x=s.side==='attacker'?-600:600;s.y=160;s.z=(s.id%8)*30;s.hp=s.maxHp=1e8;s.shield=s.maxShield=1e8;s.profile.speed=.01;s.station={...s.station,y:s.y,z:s.z};}
  recordFrame(b);
  const replayBattle=structuredClone(b);advanceSpatialBattle(replayBattle,now+15000);
  const replay={report:{id:'devourer-test-replay',title:'蜂群隔离测试回放',duration:15},record:{metadata:spatialMetadata(replayBattle),frames:replayBattle.frames,events:replayBattle.events,environment:null}};
  const save=path.join(temp,'universe.json'),session=path.join(temp,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
  const port=await freePort();assert(![8289,8390].includes(port));result.port=port;const base=`http://127.0.0.1:${port}`;
  server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_MANAGED_STDIN:'1'},windowsHide:true,stdio:['pipe','pipe','pipe']});server.stdout.resume();server.stderr.on('data',d=>errors.push(String(d)));
  let ready=false;for(let i=0;i<100&&!ready;i++){ready=await fetch(base+'/api/health').then(r=>r.json()).then(r=>r.isolated&&r.pid===server.pid).catch(()=>false);if(!ready)await new Promise(r=>setTimeout(r,100));}assert(ready);
  browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const context=await browser.newContext({viewport:{width:1600,height:1000}});await context.addCookies([{name:'empire',value:player.id,url:base}]);
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  // Exercise the standalone controller too; production live routes open the map.
  await page.route('**/api/star-map',route=>route.fulfill({json:{planets:[]}}));
  await page.goto(base+'/opendesign/mockups/galactic-command/battlefield-three.html?battle='+b.id);
  await page.waitForFunction(()=>window.flightController?.metadata?.some(m=>m.temporary),null,{timeout:60000});
  await page.locator('#native-formation').selectOption(own.formation);
  if(!await page.evaluate(()=>!!flightController.replay)){await page.locator('#native-claim').click();await page.waitForFunction(()=>flightController.controlled!==null);}else{await page.locator('#native-follow').click();if(await page.evaluate(()=>GalacticDemo.state.flight.external))await page.keyboard.press('KeyV');}
  await clickBridge(page,'mode','guard');
  await page.waitForFunction(id=>flightController.snapshot.carriers.find(c=>c.shipId===id)?.mode==='guard',own.id);
  await clickBridge(page,'formation','orbit');
  await page.waitForFunction(id=>flightController.snapshot.carriers.find(c=>c.shipId===id)?.formation==='orbit',own.id);
  await clickBridge(page,'select',target.id,'hologram');
  await page.waitForFunction(()=>{const c=GalacticDemo.renderer.bridgeInstrumentState?.carrier;return c&&(c.focusAutomatic||!c.focusCooldown);},null,{timeout:15000});
  await clickBridge(page,'focus');
  await page.waitForFunction(id=>flightController.snapshot.carriers.some(c=>c.focusTarget===id&&c.focusCooldown>6),target.id);
  result.standalone=await page.evaluate(()=>({readout:GalacticDemo.renderer.bridgeInstrumentState.carrier,swarmVisible:flightController.metadata.filter(m=>m.temporary&&flightController.rows[m.id]?.[6]>0).every(m=>flightController.renderedIds.has(m.id)),errors:GalacticDemo.renderer.shaderErrors}));assert(result.standalone.swarmVisible);
  await page.screenshot({path:path.join(out,'standalone.png')});
  await page.unroute('**/api/star-map');
  await page.goto(base+'/?battle='+b.id);await page.waitForFunction(()=>window.CommandApp?.scene?.combat?.entry?.data&&CommandApp.scene.renderer?.ready,null,{timeout:60000});
  await page.locator('#map-combat-vessel').selectOption(String(own.id));
  await clickBridge(page,'mode','assault');
  await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.carriers.find(c=>c.shipId===id)?.mode==='assault',own.id);
  await clickBridge(page,'formation','wedge');
  await page.waitForFunction(id=>CommandApp.scene.combat.entry.data.carriers.find(c=>c.shipId===id)?.formation==='wedge',own.id);
  result.map=await page.evaluate(()=>CommandApp.scene.combat.bridgeHUD.state.carrier);await page.screenshot({path:path.join(out,'map.png')});
  const titleBox=await page.locator('#map-combat-title').boundingBox();assert(titleBox.width>100&&titleBox.height<30,'carrier controls do not crush the existing battle header');
  assert(!await page.evaluate(()=>CommandApp.scene.combat.lastCommand?.includes('无效')));
  await page.route('**/api/replay/devourer-test-replay',route=>route.fulfill({json:replay}));
  await page.goto(base+'/opendesign/mockups/galactic-command/battlefield-three.html?replay=devourer-test-replay');
  await page.waitForFunction(()=>window.flightController?.replay,null,{timeout:60000});
  await page.evaluate(()=>{flightController.paused=true;flightController.seek(0);});
  assert.equal(await page.evaluate(()=>flightController.rows.filter(r=>r[6]>0).length),b.initial.attacker.Cruiser+b.initial.defender.Battleship+2);
  await page.evaluate(()=>flightController.seek(8));
  await page.locator('#native-formation').selectOption(own.formation);
  if(!await page.evaluate(()=>!!flightController.replay)){await page.locator('#native-claim').click();await page.waitForFunction(()=>flightController.controlled!==null);}else{await page.locator('#native-follow').click();if(await page.evaluate(()=>GalacticDemo.state.flight.external))await page.keyboard.press('KeyV');}
  await page.waitForFunction(()=>GalacticDemo.state.flight.cameraBlend<.001&&GalacticDemo.renderer.bridgeConsoleLayout().length===4);assert.equal((await bridgeLayout(page)).length,4);assert(!(await bridgeLayout(page)).flatMap(p=>p.controls).some(h=>['mode','formation','focus'].includes(h.action)));
  result.replay=await page.evaluate(()=>({count:flightController.rows.filter(r=>r[6]>0).length,swarm:flightController.metadata.filter(m=>m.temporary&&flightController.rows[m.id]?.[6]>0).length}));assert(result.replay.swarm>0);
  await page.screenshot({path:path.join(out,'replay.png')});
  assert.deepEqual(errors,[]);result.ok=true;
}catch(error){
  result.failure=error.message;result.url=page?.url();
  if(page){result.visible=await page.locator('body').innerText().catch(()=>null);await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
  throw error;
}finally{
  await browser?.close();
  if(server&&server.exitCode===null){const exited=once(server,'exit');server.stdin.end();await exited;}
  const resolved=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert(path.dirname(resolved).toLowerCase()===parent.toLowerCase()&&path.basename(resolved).startsWith('devourer-isolated-test-'));
  fs.rmSync(resolved,{recursive:true,force:true});
  result.errors=errors;result.cleaned=!fs.existsSync(temp);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));
}
console.log(JSON.stringify(result,null,2));
