// Run after the performance benchmark, not alongside it:
//   node tests/three-battle-snapshots.mjs [--headed]
// This exercises the browser's snapshot integration and renderer/UI, using
// synthetic snapshots in the existing wire format. It does not claim to test
// the server's reinforcement lifecycle; spatial-battle tests cover that layer.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,startServer,playwright,routes} from './three-battle-harness.mjs';

const directory=path.join(root,'output/playwright/three-battle-snapshots');
fs.mkdirSync(directory,{recursive:true});
const result={scope:'Browser snapshot integration; synthetic reinforcement/death snapshots passed through controller.receive; not server reinforcement E2E',passed:false,errors:[],httpErrors:[],controlRequests:[]};
let server,browser,context;

// Read the actual renderer's live instance slots, rather than just controller
// counters. A distant camera keeps this small fleet on the ordinary LOD path.
function browserState(){
  const c=window.flightController,r=window.GalacticDemo.renderer;
  const batches=[...r.instanceBatches].filter(([,b])=>b.mesh.visible&&b.mesh.count>0).map(([key,b])=>({
    key,count:b.mesh.count,ids:[...b.ids],slots:[...b.idToSlot],
    positions:b.ids.map((id,slot)=>({id,world:[0,1,2].map(i=>b.mesh.instanceMatrix.array[slot*16+12+i]+r.eye[i])})),
  }));
  return {selected:c.selected,shipType:c.metadata[c.selected]?.type,alive:c.rows.filter(row=>row?.[6]>0).map(row=>row[0]).sort((a,b)=>a-b),rendered:[...c.renderedIds].sort((a,b)=>a-b),batches,
    claimDisabled:document.querySelector('#native-claim').disabled,selectorId:Number(document.querySelector('#native-vessel').value),
    formation:document.querySelector('#native-formation').value,frame:r.frame,glError:r.gl.getError(),stats:r.getStats()};
}

function assertAllLiveShipsDrawn(state){
  assert.deepEqual(state.rendered,state.alive,'rendered IDs must equal all live authoritative IDs');
  const ids=state.batches.flatMap(batch=>batch.ids).sort((a,b)=>a-b);
  assert.deepEqual(ids,state.alive,'every live ship must occupy exactly one visible instance slot');
  for(const batch of state.batches){
    assert.equal(batch.count,batch.ids.length);
    for(const [id,slot]of batch.slots)assert.equal(batch.ids[slot],id,'slot lookup must return the same authoritative ID');
  }
  assert.equal(state.glError,0);assert.deepEqual(state.stats.shaderErrors,[]);
}

try{
  server=await startServer({directory:path.join(directory,'server'),live:true,fleet:{Light_Fighter:3,Cruiser:2}});
  const {chromium}=playwright();
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!process.argv.includes('--headed'),args:['--use-angle=d3d11']});
  context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addCookies([{name:'empire',value:server.player.id,url:server.base}]);
  const page=await context.newPage();page.setDefaultTimeout(60000);
  page.on('pageerror',error=>result.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')result.errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)result.httpErrors.push({url:response.url(),status:response.status()});});
  page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/control'))result.controlRequests.push(request.postDataJSON());});

  // Use a real parent frame so clicking the existing leave button can exercise
  // its complete cleanup path while the test retains the disposed document.
  const battlefield=routes.three+'?battle='+encodeURIComponent(server.battle.id);
  await page.route('**/__three_snapshot_host',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;overflow:hidden}</style></head><body><iframe id="battleframe" name="snapshot-battle" src="${battlefield}"></iframe><script>window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===document.querySelector('iframe').contentWindow&&event.data?.type==='battle-exit')window.snapshotExitReceived=true;});</script></body></html>`}));
  await page.goto(server.base+'/__three_snapshot_host');
  const frame=await (await page.locator('#battleframe').elementHandle()).contentFrame();
  await frame.waitForFunction(()=>window.flightController?.metadata?.length>0&&window.GalacticDemo?.renderer&&window.flightController.stream);

  result.frozen=await frame.evaluate(()=>{
    const c=window.flightController;c.stream.close();clearInterval(c.inputTimer);
    const snapshot=structuredClone(c.snapshot);
    snapshot.metadata=structuredClone(c.metadata);snapshot.ships=structuredClone(c.rows);
    snapshot.controls={};snapshot.events=[];snapshot.projectiles=[];snapshot.specialBlasts=[];
    c.receive(snapshot);c.clearVisuals();c.frameBattle(true);c.distance=12000;c.cinematicAnchor=null;
    return {streamState:c.stream.readyState,metadata:c.metadata.length,rows:c.rows.length,controlled:c.controlled};
  });
  assert.equal(result.frozen.streamState,2);assert.equal(result.frozen.controlled,null);
  await frame.waitForFunction(()=>flightController.renderedIds?.size>0&&[...GalacticDemo.renderer.instanceBatches.values()].some(b=>b.mesh.visible&&b.ids.length));
  result.before=await frame.evaluate(browserState);assertAllLiveShipsDrawn(result.before);
  await page.screenshot({path:path.join(directory,'before-reinforcement.png')});

  result.reinforcement=await frame.evaluate(()=>{
    const c=window.flightController,snapshot=structuredClone(c.snapshot);
    snapshot.metadata=structuredClone(c.metadata);snapshot.ships=structuredClone(c.rows);
    const source=snapshot.metadata.find(m=>m.owner===c.owner&&m.profile.piloted&&m.type==='Cruiser'&&snapshot.ships[m.id]?.[6]>0)
      ||snapshot.metadata.find(m=>m.owner===c.owner&&m.profile.piloted&&snapshot.ships[m.id]?.[6]>0);
    if(!source)throw Error('Snapshot fixture has no live owned pilotable hull');
    const id=snapshot.metadata.length,batch=Math.max(...snapshot.metadata.map(m=>m.batch))+1;
    const metadata={...structuredClone(source),id,batch,formation:batch+':'+source.type+':0'};
    const row=[...snapshot.ships[source.id]];row[0]=id;row[1]+=25;row[2]+=3;row[3]+=10;row[6]=metadata.maxHp;row[7]=metadata.maxShield;row[8]=-1;row[9]=0;
    snapshot.metadata.push(metadata);snapshot.ships.push(row);snapshot.tick++;snapshot.elapsed=snapshot.tick*.05;
    snapshot.controls={};snapshot.projectiles=[];snapshot.specialBlasts=[];snapshot.eventSeq=c.eventSeq+1;
    snapshot.events=[{seq:snapshot.eventSeq,tick:snapshot.tick,type:'reinforcement',batch,side:metadata.side,count:1}];
    c.receive(snapshot);c.frameBattle(true);c.distance=12000;c.cinematicAnchor=null;
    window.snapshotAddedShip={id,formation:metadata.formation,type:metadata.type,position:row.slice(1,4)};
    return window.snapshotAddedShip;
  });
  const added=result.reinforcement;
  await frame.waitForFunction(id=>flightController.renderedIds?.has(id)&&[...GalacticDemo.renderer.instanceBatches.values()].some(b=>b.mesh.visible&&b.idToSlot.has(id)),added.id);
  result.afterReinforcement=await frame.evaluate(browserState);assertAllLiveShipsDrawn(result.afterReinforcement);
  assert.deepEqual(result.afterReinforcement.alive,[...result.before.alive,added.id].sort((a,b)=>a-b));
  const instance=result.afterReinforcement.batches.flatMap(batch=>batch.positions).find(position=>position.id===added.id);
  assert.ok(Math.hypot(...instance.world.map((value,index)=>value-added.position[index]))<.02,'new slot must render the new ship position');

  await frame.locator('#native-formation').selectOption(added.formation);
  await frame.locator('#native-vessel').selectOption(String(added.id));
  await frame.waitForFunction(id=>flightController.selected===id&&Number(document.querySelector('#native-vessel').value)===id,added.id);
  result.selection=await frame.evaluate(browserState);
  assert.equal(result.selection.selected,added.id);assert.equal(result.selection.shipType,added.type);
  assert.equal(result.selection.selectorId,added.id);assert.equal(result.selection.claimDisabled,false);
  // Never claim the synthetic ID: this is a receiver/UI test, not server state mutation.
  await frame.evaluate(()=>{flightController.frameBattle(true);flightController.distance=12000;flightController.cinematicAnchor=null;});
  await frame.waitForFunction(id=>[...GalacticDemo.renderer.instanceBatches.values()].some(b=>b.mesh.visible&&b.idToSlot.has(id)),added.id);
  await page.screenshot({path:path.join(directory,'reinforcement-selected.png')});

  await frame.evaluate(id=>{
    const c=window.flightController,snapshot=structuredClone(c.snapshot);
    snapshot.metadata=structuredClone(c.metadata);snapshot.ships=structuredClone(c.rows);
    const row=snapshot.ships[id];row[6]=0;row[7]=0;row[8]=-1;row[9]=0;
    snapshot.tick++;snapshot.elapsed=snapshot.tick*.05;snapshot.controls={};snapshot.projectiles=[];snapshot.specialBlasts=[];snapshot.eventSeq=c.eventSeq+1;
    snapshot.events=[{seq:snapshot.eventSeq,tick:snapshot.tick,type:'destroy',shipId:id,source:0,kind:'shell',x:row[1],y:row[2],z:row[3],shield:false}];
    c.receive(snapshot);
  },added.id);
  await frame.waitForFunction(id=>!flightController.renderedIds?.has(id)&&document.querySelector('#native-claim').disabled&&[...GalacticDemo.renderer.instanceBatches.values()].every(b=>!b.mesh.visible||!b.idToSlot.has(id)),added.id);
  result.afterDeath=await frame.evaluate(browserState);assertAllLiveShipsDrawn(result.afterDeath);
  assert.deepEqual(result.afterDeath.alive,result.before.alive,'the death snapshot must remove only the new ship');
  assert.equal(result.afterDeath.selected,added.id);assert.equal(result.afterDeath.claimDisabled,true);
  result.deadFormationDisabled=await frame.locator('#native-formation option').evaluateAll((options,key)=>options.find(option=>option.value===key)?.disabled,added.formation);
  assert.equal(result.deadFormationDisabled,true);
  await page.screenshot({path:path.join(directory,'after-death.png')});

  await frame.evaluate(()=>{window.snapshotExitProbe={renderer:GalacticDemo.renderer,controller:flightController,state:GalacticDemo.state};});
  await frame.locator('#native-leave').click();
  await page.waitForFunction(()=>window.snapshotExitReceived===true);
  const framesAtExit=await frame.evaluate(()=>window.snapshotExitProbe.state.frames);
  await page.waitForTimeout(350);
  result.exit=await frame.evaluate(()=>{
    const {renderer:r,controller:c,state}=window.snapshotExitProbe;
    return {appRemoved:!window.GalacticDemo,controllerRemoved:!window.flightController,disposed:r.disposed,frames:state.frames,streamState:c.stream.readyState,
      instances:r.instanceBatches.size,meshPools:r.meshPools.size,dynamicPools:r.dynamicPools.size,geometries:r.geometryResources.size,textures:r.textures.size,
      sceneObjects:r.scene.children.length,overlayObjects:r.overlay.children.length,controllerGroups:c.meshGroups.size,barRemoved:!document.querySelector('#native-battle-bar')};
  });
  assert.equal(result.exit.frames,framesAtExit,'leaving the scene must stop its animation loop');
  for(const field of ['appRemoved','controllerRemoved','disposed','barRemoved'])assert.equal(result.exit[field],true,field);
  assert.equal(result.exit.streamState,2);
  for(const field of ['instances','meshPools','dynamicPools','geometries','textures','sceneObjects','overlayObjects','controllerGroups'])assert.equal(result.exit[field],0,field+' must be empty after exit');
  assert.deepEqual(result.controlRequests,[],'synthetic snapshots must never produce server control writes');
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.httpErrors,[]);assert.equal(server.stderr,'');
  result.passed=true;console.log(JSON.stringify(result,null,2));
}catch(error){result.failure=error.stack;process.exitCode=1;console.error(error);}
finally{
  fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify(result,null,2));
  await context?.close();await browser?.close();await server?.stop();
}
