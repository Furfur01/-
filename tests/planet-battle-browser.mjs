import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,packedShips,spatialMetadata,spatialSnapshot} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {units} from '../game/catalog.mjs';
import {startServer,playwright,mountReplay,fixtureOwner} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/planet-battle');fs.mkdirSync(out,{recursive:true});
const b=createSpatialBattle({id:'00000000-0000-4000-8000-000000000111',attacker:fixtureOwner,defender:'enemy',start:0,environment:planetBattleEnvironment({})});
const technology={Strength_Tech:80,Shielding_Tech:20,Weapons_Tech:8};
addSpatialFleet(b,{fleet:{Bomber:12,Battleship:2,Cruiser:4},side:'attacker',owner:fixtureOwner,technology},units);
addSpatialFleet(b,{fleet:{Rocket_Launcher:6,Light_Laser:4,Heavy_Laser:2,MK2_Cannon:2,Plasma_Cannon:2,Small_Shield_Dome:1,Light_Fighter:4},side:'defender',owner:'enemy',technology:{Strength_Tech:10,Shielding_Tech:2}},units);
const frames=[{tick:0,ships:packedShips(b)}];
while(b.tick<2400&&b.status==='active'){stepSpatialBattle(b);if(b.tick%4===0)frames.push({tick:b.tick,ships:packedShips(b)});}
const record={metadata:spatialMetadata(b),frames,events:b.events,boundary:b.boundary,environment:b.environment};
const fixture={replay:{version:4,record,report:{id:b.id,battleId:b.id,duration:b.tick*.05,initial:b.initial,type:'battle',engine:'spatial-v2'}}};
fs.writeFileSync(path.join(out,'fixture.json'),JSON.stringify(fixture.replay));
const server=await startServer({directory:path.join(out,'server')});let browser;const errors=[];
try{
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await mountReplay(page,server,fixture,'three');
 await page.evaluate(()=>{const c=flightController;c.seek(35);c.overview=true;c.cinematicAnchor=null;c.cinemaComposition=false;c.center=[550,-160,-100];c.distance=1500;c.overviewPitch=.3;c.overviewYaw=-1.1;});
 await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'orbital-battle.png')});
 const state=await page.evaluate(()=>({rendered:[...flightController.renderedIds],ground:flightController.metadata.filter(m=>m.profile.ground&&flightController.rows[m.id]?.[6]>0).map(m=>m.id),errors:GalacticDemo.renderer.shaderErrors,planet:!!GalacticDemo.renderer.battlePlanetMesh}));
 assert(state.planet);assert(state.ground.length>0);assert(state.ground.every(id=>state.rendered.includes(id)));assert.deepEqual(state.errors,[]);
 await page.evaluate(()=>flightController.frameGround());
 await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'ground-defenses.png')});
 const fortress=await page.evaluate(()=>{const r=GalacticDemo.renderer,b=[...r.instanceBatches.entries()].find(([k])=>k.includes('fortress-modules'));return {count:b?.[1].mesh.count,visible:b?.[1].mesh.visible,triangles:r.fortressMeshes.module.count/3};});
 assert.equal(fortress.count,b.environment.fortress.modules.length);assert(fortress.visible);assert(fortress.triangles>2000);
 await page.evaluate(()=>{const c=flightController,m=c.metadata.find(m=>m.type==='Rocket_Launcher');c.center=c.rows[m.id].slice(1,4);c.distance=95;c.overviewPitch=.38;c.overviewYaw=-.7;});
 await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'foundry-enemy-red.png')});
 await page.evaluate(()=>{const c=flightController;c.owner=c.metadata.find(m=>m.type==='Rocket_Launcher').owner;});
 await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'foundry-friendly-blue.png')});
 await page.evaluate(owner=>{flightController.owner=owner;},fixtureOwner);
 await page.evaluate(()=>{const c=flightController;c.seek(56);c.center=[900,-330,0];c.distance=850;c.overviewPitch=.3;c.overviewYaw=-1.15;});
 await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'bomber-mushroom-clouds.png')});
 const bombing=await page.evaluate(()=>({clouds:GalacticDemo.state.flight.mushroomClouds.length,parts:GalacticDemo.renderer.defenseMeshes.size,angles:flightController.rows.filter(r=>flightController.metadata[r[0]].profile.ground).map(r=>r.slice(13))}));
 assert(bombing.clouds>0);assert(bombing.parts>=6);assert(bombing.angles.some(a=>a[1]>.05));
 const blast=await page.evaluate(()=>({...GalacticDemo.state.flight.mushroomClouds[0]}));
 for(const [label,age]of [['flash',.12],['shockwave',.8],['rolling',3.5],['dispersal',14]]){
  await page.evaluate(({blast,age})=>{const c=flightController;c.seek(blast.tick*.05+age);GalacticDemo.state.flight.mushroomClouds=[{...blast,age}];c.center=[blast.pos[0],blast.pos[1]+65,blast.pos[2]];c.distance=430;}, {blast,age});
  await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`blast-${label}.png`)});
 }
 assert.deepEqual(await page.evaluate(()=>GalacticDemo.renderer.shaderErrors),[]);
 // Shader phase uses each cloud's age, so a paused replay remains visually fixed.
 const stopped=await page.evaluate(()=>GalacticDemo.state.flight.mushroomClouds[0].age);
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.mushroomClouds[0].age),stopped);
 await page.evaluate(()=>flightController.seek(56));
 const cloudFrames=await page.evaluate(async()=>{const samples=[];let previous=performance.now();for(let i=0;i<30;i++){const now=await new Promise(requestAnimationFrame);samples.push(now-previous);previous=now;}return samples.slice(3).sort((a,b)=>a-b);});
 fs.writeFileSync(path.join(out,'cloud-performance.json'),JSON.stringify({medianFrameMs:cloudFrames[Math.floor(cloudFrames.length/2)],p95FrameMs:cloudFrames[Math.floor(cloudFrames.length*.95)]},null,2));
 await page.evaluate(snapshot=>{const c=flightController;c.replay=null;c.replayId=null;c.receive({...snapshot,status:'finished',metadata:c.metadata,ships:c.rows});},spatialSnapshot(b));
 await page.waitForTimeout(300);
 assert(await page.evaluate(()=>flightController.metadata.filter(m=>m.profile.ground).every(m=>!flightController.renderedIds.has(m.id))));
 assert(await page.evaluate(()=>[...GalacticDemo.renderer.instanceBatches.entries()].filter(([k])=>k.includes('fortress-')).every(([,b])=>!b.mesh.visible)));
 await page.close();

 const map=await browser.newPage({viewport:{width:1600,height:1000}});map.on('pageerror',e=>errors.push(e.message));
 await map.goto(server.base+'/');await map.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
 const target=await map.evaluate(()=>EmpireAPI.planet);
 const snapshot={...spatialSnapshot(b),target:target.id,position:target.position,status:'active',metadata:record.metadata,ships:frames.find(f=>f.tick===700).ships,events:[]};
 await map.evaluate(async data=>{const s=CommandApp.scene;CommandApp.go('system',{keepCamera:true});s.enterPlanet(data.position.join(':'));await s.renderer.prepareMapFleet();s.renderer.setMapBattle(data.id,data);s.renderer.focusMapBattle(data.id);s.renderer._advance(3);},snapshot);
 await map.waitForFunction(()=>CommandApp.scene.snapshot.navigation.battles.visible.some(b=>b.ships.length));
 await map.waitForTimeout(600);await map.screenshot({path:path.join(out,'map-battle.png')});
 const mapped=await map.evaluate(()=>CommandApp.scene.snapshot.navigation.battles.visible[0]);assert(mapped.ships.every(s=>s.loaded));assert(mapped.ships.some(s=>s.type==='Rocket_Launcher'));
 await map.evaluate(id=>{CommandApp.scene.renderer.setMapBattle(id,null);CommandApp.scene.renderer._advance(.2);},b.id);
 await map.waitForTimeout(200);assert.equal(await map.evaluate(()=>CommandApp.scene.snapshot.navigation.battles.visible.length),0);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,ground:state.ground.length,mappedShips:mapped.ships.length,errors},null,2));console.log('Planet battle browser verification passed');
}finally{await browser?.close();await server.stop();}
