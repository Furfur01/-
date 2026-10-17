import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createSpatialBattle,addSpatialFleet,packedShips,spatialMetadata} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {units} from '../game/catalog.mjs';
import {isShieldGenerator} from '../game/planet-defense.mjs';
import {startServer,playwright,mountReplay,fixtureOwner} from './three-battle-harness.mjs';

const out=path.resolve('output/playwright/fortress-state');fs.mkdirSync(out,{recursive:true});
const b=createSpatialBattle({id:'00000000-0000-4000-8000-000000000112',attacker:fixtureOwner,defender:'enemy',start:0,environment:planetBattleEnvironment()});
addSpatialFleet(b,{fleet:{Bomber:2},side:'attacker',owner:fixtureOwner},units);
addSpatialFleet(b,{fleet:{Rocket_Launcher:50,Plasma_Cannon:2,Small_Shield_Dome:1,Large_Shield_Dome:1},side:'defender',owner:'enemy'},units);
const metadata=spatialMetadata(b),initial=packedShips(b),ruin=structuredClone(initial),empty=structuredClone(initial);
for(const m of metadata.filter(m=>m.fortressSlot?.module===1))ruin[m.id][6]=ruin[m.id][7]=0;
for(const m of metadata.filter(m=>m.profile.ground))empty[m.id][6]=empty[m.id][7]=0;
const unshielded=structuredClone(ruin);for(const m of metadata.filter(m=>isShieldGenerator(m.type)))unshielded[m.id][7]=0;
const record={metadata,frames:[{tick:0,ships:initial},{tick:20,ships:ruin},{tick:40,ships:unshielded},{tick:60,ships:empty}],events:[],boundary:b.boundary,environment:b.environment};
const fixture={replay:{record,report:{id:b.id,battleId:b.id,duration:3,initial:b.initial,type:'battle',engine:'spatial-v2'}}};
const server=await startServer({directory:path.join(out,'server')});let browser;const errors=[];
try{
 browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await mountReplay(page,server,fixture,'three');
 await page.evaluate(()=>{flightController.seek(0);flightController.frameGround();flightController.distance=1150;flightController.overviewPitch=.58;flightController.overviewYaw=-.8;});
 const state=()=>page.evaluate(()=>{const r=GalacticDemo.renderer;return {batches:[...r.instanceBatches].filter(([k,v])=>k.includes('fortress-')&&v.mesh.visible).map(([k,v])=>({key:k,count:v.mesh.count,ids:v.ids})),fields:[...r.meshPools.values()].flatMap(p=>p.items).filter(m=>m.visible&&m.userData.uniforms.uMode===14).length,errors:r.shaderErrors};});
 await page.waitForTimeout(300);let result=await state();assert.equal(result.fields,1);assert.equal(result.batches.find(b=>b.key.includes('fortress-modules')).count,b.environment.fortress.modules.length);
 await page.screenshot({path:path.join(out,'intact-shield.png')});
 await page.evaluate(()=>flightController.seek(1));await page.waitForTimeout(200);result=await state();
 assert.equal(result.batches.find(b=>b.key.includes('fortress-wrecks')).count,1);assert.equal(result.batches.find(b=>b.key.includes('fortress-modules')).count,b.environment.fortress.modules.length-1);assert.equal(result.fields,1);
 await page.screenshot({path:path.join(out,'one-module-destroyed.png')});
 await page.evaluate(()=>flightController.seek(2));await page.waitForTimeout(200);assert.equal((await state()).fields,0);
 await page.screenshot({path:path.join(out,'shield-depleted.png')});
 await page.evaluate(()=>flightController.seek(3));await page.waitForTimeout(200);result=await state();assert.equal(result.batches.find(b=>b.key.includes('fortress-wrecks')).count,b.environment.fortress.modules.length);assert(!result.batches.some(b=>b.key.includes('fortress-modules')));
 await page.screenshot({path:path.join(out,'all-modules-destroyed.png')});
 await page.evaluate(()=>flightController.seek(0));await page.waitForTimeout(200);result=await state();assert.equal(result.fields,1);assert(!result.batches.some(b=>b.key.includes('fortress-wrecks')));assert.equal(result.batches.find(b=>b.key.includes('fortress-modules')).count,b.environment.fortress.modules.length);
 assert.deepEqual(result.errors,[]);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,errors,states:['intact-shield','one-module-destroyed','shield-depleted','all-modules-destroyed','rewind-restored']},null,2));console.log('Fortress shields, ruins and replay verified');
}finally{await browser?.close();await server.stop();}
