import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=path.resolve('output/playwright/superweapon-fleet');fs.mkdirSync(dir,{recursive:true});
const world=createWorld(),player=createPlayer(world,'超级武器测试'),save=path.join(dir,'universe.json'),session=path.join(dir,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});let serverErrors='';child.stderr.on('data',b=>serverErrors+=b);await once(child.stdout,'data');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],result={};page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${port}/`);await page.waitForFunction(()=>window.EmpireAPI?.state);await page.locator('[data-page="battle"]').click();await page.getByRole('heading',{name:'自选编队测试'}).waitFor();assert.equal(await page.locator('.trial-stats > .stats-scroll tbody tr').count(),14);assert.ok((await page.locator('.trial-stats').innerText()).includes('48,000'));await page.locator('.trial-stats').screenshot({path:path.join(dir,'full-stats.png')});
 for(const name of ['己方编队配比','对方编队配比'])await page.getByLabel(name,{exact:true}).selectOption({label:'超级武器展示'});
 for(const side of ['己方','对方'])await page.getByLabel(`${side}编队 死星`,{exact:true}).fill('1');
 await page.screenshot({path:path.join(dir,'military-roster.png')});
 // Isolate the blast camera check from elite interception: ordnance can legitimately be shot down.
 for(const side of ['己方','对方'])for(const input of await page.locator(`input[aria-label^="${side}编队 "]`).all())await input.fill('0');
 await page.getByLabel('己方编队 湮灭之星',{exact:true}).fill('1');await page.getByLabel('对方编队 战列舰',{exact:true}).fill('10');
 await page.getByRole('button',{name:'开始编队测试 ↗'}).click();let frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.rows.length===11);
 const id=await frame.evaluate(()=>flightController.id);
 const camera=await frame.evaluate(()=>{const b=flightController;b.cinematicAnchor=null;b.center=[100,200,300];b.distance=1700;b.overviewPitch=.5;b.overviewYaw=.8;return JSON.stringify([b.center,b.distance,b.overviewPitch,b.overviewYaw]);});
 await frame.waitForFunction(()=>GalacticDemo.state.flight.specialBlasts?.some(b=>!b.harmless&&b.age>1.05&&b.age<1.5),null,{timeout:60000});
 assert.equal(await frame.evaluate(()=>JSON.stringify([flightController.center,flightController.distance,flightController.overviewPitch,flightController.overviewYaw])),camera,'explosion must not take over the camera');
 result.blast=await frame.evaluate(()=>({count:GalacticDemo.state.flight.specialBlasts.length,ages:GalacticDemo.state.flight.specialBlasts.map(b=>b.age),gl:GalacticDemo.renderer.gl.getError(),alive:flightController.rows.filter(s=>s[6]>0).length}));await page.screenshot({path:path.join(dir,'antimatter-wave.png')});
 await frame.locator('#native-leave').click();for(const name of ['己方编队配比','对方编队配比'])await page.getByLabel(name,{exact:true}).selectOption({label:'超级武器展示'});for(const side of ['己方','对方'])await page.getByLabel(`${side}编队 死星`,{exact:true}).fill('1');await page.getByRole('button',{name:'开始编队测试 ↗'}).click();frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.metadata?.some(s=>s.type==='Reaper'));
 for(const type of ['Reaper','Titanenergetic_Frigate','Death_Star']){
  const value=await frame.evaluate(type=>flightController.metadata.find(s=>s.owner===flightController.owner&&s.type===type).formation,type);await frame.locator('#native-formation').selectOption(value);await frame.locator('#native-claim').click();await frame.waitForFunction(()=>flightController.controlled!==null);assert.equal(await frame.evaluate(()=>flightController.metadata[flightController.controlled].type),type);await frame.locator('#native-release').click();
 }
 await frame.locator('#native-leave').click();await page.waitForFunction(id=>EmpireAPI.state.reports.some(r=>r.battleId===id),id);const report=await page.evaluate(id=>EmpireAPI.state.reports.find(r=>r.battleId===id),id);await page.locator(`[data-open-replay="${report.id}"]`).click();frame=await(await page.locator('.battle-frame').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.flightController?.replay);
 const tick=await frame.evaluate(()=>flightController.replay.events.find(e=>e.type==='antimatter'&&!e.harmless).tick);await frame.locator('#native-pause').click();await frame.locator('#native-seek').fill(String(Math.floor(Math.min(tick*.05+.6,report.duration-.1)*10)/10));await frame.waitForFunction(()=>GalacticDemo.state.flight.specialBlasts.some(b=>b.age>.3));
 const age=await frame.evaluate(()=>GalacticDemo.state.flight.specialBlasts[0].age);await page.waitForTimeout(500);assert.equal(await frame.evaluate(()=>GalacticDemo.state.flight.specialBlasts[0].age),age);assert.equal(await frame.locator('#native-claim').isEnabled(),false);await page.screenshot({path:path.join(dir,'antimatter-replay.png')});
 result.replayBlastAge=age;assert.equal(result.blast.gl,0);assert.equal(errors.length,0);assert.equal(serverErrors,'');console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({...result,errors,serverErrors},null,2));await browser.close();child.kill();await once(child,'exit');}
