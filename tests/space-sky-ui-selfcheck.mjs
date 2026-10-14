import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial} from '../game/battle-trial.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/space-sky');fs.mkdirSync(dir,{recursive:true});
const world=createWorld(),player=createPlayer(world,'星空验收'),save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');
const battle=startTrial(world,player,{attacker:{Reaper:2,Dreadnought:8},defender:{Reaper:2,Dreadnought:8},seed:42});
fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],result={};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});
async function sky(frame,selector,name){
 await frame.waitForFunction(selector=>{const canvas=document.querySelector(selector),gl=canvas?.getContext('webgl')||canvas?.getContext('webgl2');return window.SpaceSky?.inspect(gl)?.ready;},selector,{timeout:60000});
 result[name]=await frame.evaluate(selector=>{const c=document.querySelector(selector),gl=c.getContext('webgl')||c.getContext('webgl2'),s=SpaceSky.inspect(gl);return {source:s.source,ready:s.ready,draws:s.draws,error:s.error,gl:gl.getError()};},selector);
 assert.equal(result[name].gl,0,name);assert.ok(result[name].draws>0,name);await page.screenshot({path:path.join(dir,name+'.png')});
}
try{
 await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);
 const map=await(await page.locator('.aurora-game-frame').elementHandle()).contentFrame();await sky(map,'#world','galaxy');
 await page.locator('.aurora-game-controls [data-view="system"]').click();await page.waitForTimeout(2200);await sky(map,'#world','system');
 await page.getByRole('button',{name:'01 星球',exact:true}).click();await page.waitForTimeout(2500);await sky(map,'#world','planet');
 await page.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/battlefield.html?battle=${battle.id}`);
 await page.waitForFunction(()=>window.flightController?.rows.length===20);await sky(page,'canvas','battle');
 await page.locator('#native-claim').click();await page.waitForFunction(()=>flightController.controlled!==null);await sky(page,'canvas','pilot');
 await page.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/hangar.html?entry=direct-flight-01`);
 await page.waitForFunction(()=>window.GalacticDemo?.state.mode==='flight');await sky(page,'canvas','practice');
 for(const scene of ['planet','nebula','belt']){await page.locator('#scene-select').selectOption(scene);await sky(page,'canvas','practice-'+scene);}
 await page.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/astral.html`);await page.waitForFunction(()=>window.ASTRAL?.isReady());await sky(page,'#space','legacy-map');
 const loaded=page.waitForResponse(r=>r.url().endsWith('/multi-nebulae-2.webp')&&r.ok());
 await page.goto(`http://127.0.0.1:${port}/opendesign/mockups/galactic-command/ships.html`);await loaded;await page.waitForFunction(()=>document.querySelector('#stage canvas')?.width>0);await page.waitForTimeout(500);
 result.archive={gl:await page.evaluate(()=>document.querySelector('#stage canvas').getContext('webgl2').getError())};assert.equal(result.archive.gl,0);await page.screenshot({path:path.join(dir,'archive.png')});
 assert.equal(serverErrors,'');assert.deepEqual(errors,[]);console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({result,errors,serverErrors},null,2));await browser.close();child.kill();await once(child,'exit');}
