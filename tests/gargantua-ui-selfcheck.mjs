import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createWorld,createPlayer} from '../game/engine.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=path.resolve('output/playwright/gargantua');fs.mkdirSync(output,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'black-hole-ui-'));
const world=createWorld(),player=createPlayer(world,'隔离探险验收',world.at,()=>.5),home=world.planets[player.home];
home.resources=[1e8,1e8,1e8];home.ships={Large_Cargo_Ship:3,Light_Fighter:5};player.tech={Computer_Tech:4,Astrophysics_Tech:1};
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile},windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser,errors=[];server.stderr.on('data',data=>errors.push(String(data)));
try{
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error(errors.join('\n'));})]);
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',error=>errors.push(error.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const state=()=>page.evaluate(()=>document.querySelector('.aurora-game-frame').contentWindow.AURORA.snapshot.navigation);
 await page.goto(`http://127.0.0.1:${port}/#gargantua`,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('.aurora-game-frame')?.contentWindow?.AURORA?.snapshot.navigation.frames>3);
 await page.waitForTimeout(800);
 assert.equal(await page.locator('[data-observe-black-hole]').count(),0);
 assert.notEqual((await state()).zoomTarget?.type,'blackHole','old hash must not bypass galaxy navigation');
 await page.mouse.move(800,500);await page.mouse.wheel(0,200);await page.waitForTimeout(700);
 let before=await state(),core=before.targets.find(t=>t.type==='blackHole');
 assert.equal(before.blackHole.visible,false);assert.ok(core&&core.x>0&&core.x<1600&&core.y>100&&core.y<900,JSON.stringify(core));
 await page.screenshot({path:path.join(output,'galaxy-core-marker.png')});
 await page.mouse.click(core.x,core.y);await page.waitForTimeout(700);
 let selected=await state();assert.equal(selected.zoomTarget.type,'blackHole');assert.ok(Math.abs(selected.goal.dist-before.goal.dist)<.1);assert.equal(selected.goal.pitch,before.goal.pitch);assert.equal(selected.blackHole.visible,false);
 await page.screenshot({path:path.join(output,'core-selected-no-zoom.png')});
 await page.mouse.move(800,500);
 for(let i=0;i<18&&(await state()).camera.dist>160;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(180);}
 await page.waitForTimeout(700);let close=await state();assert.equal(close.blackHole.visible,true);assert.ok(close.camera.dist<600);assert.equal(close.activePlanetId,home.id);
 await page.screenshot({path:path.join(output,'core-wheel-close.png')});
 for(let i=0;i<14&&(await state()).camera.dist<12000;i++){await page.mouse.wheel(0,200);await page.waitForTimeout(180);}
 await page.waitForTimeout(700);let wide=await state();assert.equal(wide.blackHole.visible,false);core=wide.targets.find(t=>t.type==='blackHole');
 await page.mouse.dblclick(core.x,core.y);await page.waitForTimeout(1100);let focused=await state();assert.equal(focused.goal.dist,112);assert.equal(focused.goal.pitch,wide.goal.pitch);assert.equal(focused.blackHole.visible,true);
 await page.mouse.move(800,650);await page.mouse.down();await page.mouse.move(800,180,{steps:20});await page.mouse.up();await page.waitForTimeout(700);
 await page.screenshot({path:path.join(output,'gargantua-front.png')});
 await page.locator('#black-hole-panel [data-black-hole]').click();assert.equal(await page.locator('#dispatch-task').inputValue(),'explore');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'navigation-check.json'),JSON.stringify({overview:before.blackHole,selected:selected.blackHole,close:close.blackHole,doubleClick:focused.goal,errors},null,2));
 console.log('PASS: overview marker only; click preserves zoom/orientation; wheel reveals and hides detail; double-click matches system focus; exploration entry works.');
}finally{
  await browser?.close();server.kill();await once(server,'exit');
  assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
}
