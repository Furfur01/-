import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {trialCatalog} from '../game/battle-trial.mjs';
import {output,startServer,playwright,createFixture,mountReplay,routes} from './three-battle-harness.mjs';

const directory=path.join(output,'regression');fs.mkdirSync(directory,{recursive:true});
const fleet=Object.fromEntries(trialCatalog().ships.filter(s=>s.id!=='Death_Star'&&s.id!=='Annihilator').map(s=>[s.id,2]));
// Guardian is formally pilotable but intentionally absent from trial presets.
// Add it through the same authoritative spatial-fleet constructor, without
// weakening trial validation or changing any production catalog values.
const server=await startServer({directory:path.join(directory,'server'),live:true,fleet,extraFleet:{Guardian:2}}),{chromium}=playwright();
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!process.argv.includes('--headed'),args:['--use-angle=d3d11']});
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
await context.addCookies([{name:'empire',value:server.player.id,url:server.base}]);
const page=await context.newPage(),errors=[],result={ships:[],replay:{},practice:{},specials:{},resources:[],httpErrors:[],errors};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',async response=>{if(response.status()>=400)result.httpErrors.push({url:response.url(),status:response.status(),request:response.request().postData(),body:await response.text().catch(()=>null)});});
const inputs=[];page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/control'))inputs.push(r.postDataJSON());});
try{
  await page.goto(server.base+routes.three+'?battle='+server.battle.id);
  await page.waitForFunction(()=>window.flightController?.metadata?.length>0&&window.GalacticDemo?.renderer,null,{timeout:60000});
  const types=await page.evaluate(()=>[...new Set(flightController.metadata.filter(m=>m.owner===flightController.owner&&m.profile.piloted).map(m=>m.type))]);
  for(const type of types){
    const item={type};result.ships.push(item);
    await page.evaluate(type=>flightController.chooseType(type),type);
    await page.locator('#native-claim').click();
    await page.waitForFunction(()=>flightController.controlled===flightController.selected);
    item.before=await page.evaluate(()=>({position:[...GalacticDemo.state.flight.pos],yaw:GalacticDemo.state.flight.yaw,shipId:flightController.controlled}));
    const offset=inputs.length,turnKey=['Light_Fighter','Heavy_Fighter','Titanenergetic_Frigate'].includes(type)?'ArrowRight':'KeyD';
    await page.locator('#scene').click({position:{x:960,y:500}});await page.keyboard.down('KeyW');await page.keyboard.down(turnKey);await page.keyboard.down('Space');
    await page.waitForTimeout(650);await page.keyboard.up('KeyW');await page.keyboard.up(turnKey);await page.keyboard.up('Space');
    await page.evaluate(()=>flightController.fire('primary'));await page.waitForTimeout(150);
    item.after=await page.evaluate(()=>({position:[...GalacticDemo.state.flight.pos],yaw:GalacticDemo.state.flight.yaw,shipId:flightController.controlled,gl:GalacticDemo.renderer.gl.getError()}));
    assert.equal(item.after.shipId,item.before.shipId,type+' must remain controlled');assert.equal(item.after.gl,0);
    assert.ok(Math.abs(Math.atan2(Math.sin(item.after.yaw-item.before.yaw),Math.cos(item.after.yaw-item.before.yaw)))>.002,type+' steering');
    assert.ok(Math.hypot(...item.after.position.map((v,i)=>v-item.before.position[i]))>.01,type+' movement');
    const sent=inputs.slice(offset).filter(i=>i.type==='input');item.inputCount=sent.length;item.fireSent=sent.some(i=>i.input.fire);assert.ok(item.fireSent,type+' weapon input reaches authoritative server');
    await page.locator('#native-release').click();await page.waitForFunction(()=>flightController.controlled===null);
    item.released=true;console.log('Control pass: '+type);
  }
  // Force a real transport failure, then let the existing EventSource reconnect.
  const oldTick=await page.evaluate(()=>flightController.snapshot.tick);
  await context.setOffline(true);await page.waitForTimeout(750);await context.setOffline(false);
  await page.waitForFunction(t=>flightController.stream?.readyState===1&&flightController.snapshot.tick>t,oldTick,{timeout:20000});result.reconnect=true;
  await page.locator('#native-claim').click();await page.waitForFunction(()=>flightController.controlled!==null);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>flightController.controlled===null);result.hiddenPageRelease=true;
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.screenshot({path:path.join(directory,'live-controls.png')});
  result.liveGL=await page.evaluate(()=>GalacticDemo.renderer.gl.getError());assert.equal(result.liveGL,0);

  const replayPage=await context.newPage(),fixture=createFixture({seconds:12});
  replayPage.on('pageerror',e=>errors.push(e.message));
  const mounted=await mountReplay(replayPage,server,fixture,'three');
  assert.equal(await replayPage.locator('#native-claim').isDisabled(),true);
  const before=mounted.requests.length;await replayPage.evaluate(async()=>{await flightController.setAI(false);flightController.fire('primary');await flightController.sendInput();});
  assert.equal(mounted.requests.length,before,'replay must never send control');
  result.replay.readOnly=true;
  result.replay.seek=await replayPage.evaluate(()=>{
    const c=flightController,p=GalacticDemo.state.flight,seek=document.querySelector('#native-seek');
    c.paused=true;c.effect({type:'shot',seq:900000,tick:200,source:0,target:500,kind:'cannon',from:[0,0,0],to:[1,0,0]});
    seek.value='1';seek.dispatchEvent(new Event('input',{bubbles:true}));
    return {cursor:c.replayCursor,time:c.playTime,beams:p.beams.length,particles:p.particles.length,projectiles:p.projectiles.length,impacts:p.weaponImpacts.length,blasts:p.specialBlasts.length};
  });
  assert.equal(result.replay.seek.time,1);for(const key of ['beams','particles','projectiles','impacts','blasts'])assert.equal(result.replay.seek[key],0,'seek clears '+key);
  await replayPage.screenshot({path:path.join(directory,'read-only-replay.png')});await replayPage.close();

  const specialFixture=createFixture({stress:true,seconds:35,fleet:{Annihilator:1,Reaper:1,Dreadnought:3}}),blast=specialFixture.replay.record.events.find(e=>e.type==='antimatter'&&!e.harmless);
  assert.ok(blast,'isolated special fixture contains a real simulation detonation');
  const specialPage=await context.newPage();specialPage.on('pageerror',e=>errors.push(e.message));
  await mountReplay(specialPage,server,specialFixture,'three');
  await specialPage.evaluate(t=>{const seek=document.querySelector('#native-seek');seek.value=t;seek.dispatchEvent(new Event('input',{bubbles:true}));flightController.paused=false;},Math.max(0,blast.tick*.05-.15));
  await specialPage.waitForFunction(()=>GalacticDemo.state.flight.specialBlasts.some(b=>!b.harmless&&b.age>.2),null,{timeout:15000});
  result.specials.annihilator=await specialPage.evaluate(()=>({blasts:GalacticDemo.state.flight.specialBlasts.map(b=>({source:b.source,tick:b.tick})),gl:GalacticDemo.renderer.gl.getError()}));
  assert.equal(result.specials.annihilator.gl,0);const blastKeys=result.specials.annihilator.blasts.map(b=>b.source+':'+b.tick);assert.equal(new Set(blastKeys).size,blastKeys.length,'each warhead has one effect');
  await specialPage.screenshot({path:path.join(directory,'annihilator-detonation.png')});await specialPage.close();
  const deathFixture=createFixture({seconds:1,fleet:{Dreadnought:1},extraFleet:{Death_Star:1}}),deathPage=await context.newPage();deathPage.on('pageerror',e=>errors.push(e.message));
  await mountReplay(deathPage,server,deathFixture,'three');await deathPage.evaluate(()=>flightController.frameBattle(true));await deathPage.waitForTimeout(400);
  result.specials.deathStarHull=await deathPage.evaluate(()=>({ships:flightController.rows.length,deathStars:flightController.metadata.filter(m=>m.type==='Death_Star').length,render:flightController.renderStats,gl:GalacticDemo.renderer.gl.getError()}));
  assert.equal(result.specials.deathStarHull.deathStars,2);assert.equal(result.specials.deathStarHull.gl,0);assert.equal(result.specials.deathStarHull.render.instances,4);
  await deathPage.screenshot({path:path.join(directory,'death-star-basic-hull.png')});await deathPage.close();

  // Each new page checks practice isolation. Explicit dispose, when exposed,
  // additionally verifies renderer-owned GPU counters return to their baseline.
  for(let iteration=0;iteration<3;iteration++){
    const practice=await context.newPage(),battleRequests=[];practice.on('pageerror',e=>errors.push(e.message));practice.on('request',r=>{if(/\/api\/(?:battles|replay)\//.test(r.url()))battleRequests.push(r.url());});
    await practice.goto(server.base+'/opendesign/mockups/galactic-command/hangar-three.html?ship=Dreadnought');
    await practice.waitForFunction(()=>window.GalacticDemo?.renderer,null,{timeout:60000});
    assert.equal(await practice.evaluate(()=>!!window.flightController),false,'practice is independent');
    await practice.evaluate(()=>GalacticDemo.enterFlight());await practice.waitForFunction(()=>GalacticDemo.state.mode==='flight'&&!GalacticDemo.state.transition);
    await practice.evaluate(()=>GalacticDemo.fireMain());await practice.waitForTimeout(500);
    const resources=await practice.evaluate(()=>{const r=GalacticDemo.renderer;return {gl:r.gl.getError(),memory:r.three?.info?.memory??r.info?.memory??null,stats:r.getStats?.()??null};});result.resources.push(resources);assert.equal(resources.gl,0);assert.deepEqual(battleRequests,[]);
    if(iteration===0)await practice.screenshot({path:path.join(directory,'independent-practice.png')});
    resources.afterDispose=await practice.evaluate(()=>{const demo=GalacticDemo,r=demo.renderer;if(!demo.dispose)return {exposed:false};demo.dispose();return {exposed:true,globalsCleared:!window.GalacticDemo&&!window.flightController,memory:r.three?.info?.memory??r.info?.memory??null,stats:r.getStats?.()??null};});
    assert.equal(resources.afterDispose.exposed,true,'runtime exposes complete disposal');assert.equal(resources.afterDispose.globalsCleared,true,'dispose removes active runtime globals');assert.equal(resources.afterDispose.memory.geometries,0);assert.equal(resources.afterDispose.memory.textures,0);assert.equal(resources.afterDispose.stats.programs,0);
    await practice.close();
  }
  result.practice={independent:true,enterAndFire:true,pageCycles:3};
  const memory=result.resources.map(r=>r.memory).filter(Boolean);if(memory.length===3){assert.ok(memory[2].geometries<=memory[0].geometries+2,'repeat practice does not add geometry count');assert.ok(memory[2].textures<=memory[0].textures+2,'repeat practice does not add texture count');}
  const failurePage=await context.newPage();await failurePage.goto(server.base+'/opendesign/mockups/galactic-command/hangar-three.html?ship=Dreadnought');await failurePage.waitForFunction(()=>window.GalacticDemo?.renderer);
  await failurePage.evaluate(()=>{GalacticDemo.renderer.endFrame=()=>{throw Error('injected renderer failure');};});await failurePage.waitForFunction(()=>document.documentElement.dataset.ready==='error');
  result.fatalFailure=await failurePage.evaluate(()=>({globalsCleared:!window.GalacticDemo&&!window.flightController,error:document.querySelector('#webgl-error').textContent,visible:!document.querySelector('#no-webgl').hidden,fallback:document.querySelector('#no-webgl a')?.getAttribute('href')}));
  assert.ok(result.fatalFailure.globalsCleared&&result.fatalFailure.visible);assert.match(result.fatalFailure.error,/injected renderer failure/);assert.ok(result.fatalFailure.fallback);await failurePage.close();
  // Network errors caused by the intentional offline phase are expected; all
  // runtime exceptions and other console errors remain failures.
  result.unexpectedErrors=errors.filter(e=>!/net::ERR_(INTERNET_DISCONNECTED|FAILED)|EventSource|正在重新连接/.test(e));
  assert.deepEqual(result.unexpectedErrors,[]);assert.equal(server.stderr,'');console.log(JSON.stringify(result,null,2));
}catch(error){result.failure=error.stack;process.exitCode=1;console.error(error);}
finally{fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify(result,null,2));await context.close();await browser.close();await server.stop();}
