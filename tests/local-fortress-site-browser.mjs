import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {startServer,playwright} from './three-battle-harness.mjs';
import {createSpatialBattle,addSpatialFleet,spatialSnapshot} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {units} from '../game/catalog.mjs';
const out=path.resolve('output/playwright/local-fortress-site'),server=await startServer({directory:path.join(out,'server')});
let browser;const errors=[],results=[];
try{
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(server.base);await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.ready&&CommandApp.scene.map);
 const targets=await page.evaluate(()=>{const planets=CommandApp.scene.targets;return [...['terrestrial','mercury','mars','gas'].map(biome=>planets.find(p=>!p.npc&&!p.moon&&p.biome===biome)),...['outpost','garrison','charon','cargo','fracture'].map(npcType=>planets.find(p=>p.npcType===npcType))].filter(Boolean);});
 assert.equal(targets.length,9);
 for(const target of targets){
  const b=createSpatialBattle({id:'site-'+(target.npcType||target.biome),target:target.id||target.key,attacker:server.player.id,defender:'enemy',start:0,environment:planetBattleEnvironment(target)});
  addSpatialFleet(b,{fleet:{Cruiser:2},side:'attacker',owner:server.player.id},units);
  addSpatialFleet(b,{fleet:{Rocket_Launcher:24,Light_Laser:7,Heavy_Laser:7,Ion_Cannon:7,MK2_Cannon:8,Plasma_Cannon:4},side:'defender',owner:'enemy'},units);
  const data={...spatialSnapshot(b),position:target.position},ground=b.ships.find(s=>s.type==='MK2_Cannon').id;
  await page.evaluate(async({data,ground})=>{const s=CommandApp.scene;CommandApp.go('system',{keepCamera:true});await s.renderer.prepareMapFleet();s.renderer.setMapBattle(data.id,data);s.renderer.focusMapBattle(data.id);s.renderer.setMapVessel(data.id,ground,'follow');s.renderer._advance(3);s.renderer._advance(2);},{data,ground});
  await page.waitForFunction(id=>{const n=CommandApp.scene.snapshot.navigation;return n.battles.visible.some(b=>b.id===id&&b.ships.some(s=>s.type==='Heavy_Laser'));},b.id);
  await page.waitForFunction(npc=>{const n=CommandApp.scene.snapshot.navigation;return npc?n.npcs.visible.some(p=>p.loaded):n.visibleDetails.some(p=>p.weight>.9);},!!target.npc,{timeout:60000});
  await page.waitForTimeout(700);await page.evaluate(()=>CommandApp.scene.renderer._advance(.1));
  const view=await page.evaluate(()=>{const n=CommandApp.scene.snapshot.navigation;return {details:n.visibleDetails,npcs:n.npcs.visible};});
  assert.equal(b.environment.fortress.version,2);results.push({type:target.npcType||target.biome,modules:b.environment.fortress.modules.length,...view});
  await page.screenshot({path:path.join(out,(target.npcType||target.biome)+'.png')});
  await page.evaluate(id=>CommandApp.scene.renderer.setMapBattle(id,null),b.id);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,results,errors},null,2));
 console.log('Floating hierarchical fortresses rendered above four biomes and all five NPC models.');
}finally{await browser?.close();await server.stop();}
