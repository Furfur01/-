// Complete the unchanged authoritative simulation once, then record its replay.
// No production save, balance value, renderer or benchmark sample is modified.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,finishTrial,trialPresets} from '../game/battle-trial.mjs';
import {stepSpatialBattle,packedShips,spatialMetadata} from '../game/spatial-battle.mjs';
import {fixtureOwner,percentile} from '../tests/three-battle-harness.mjs';

const directory=path.resolve('output/playwright/three-battle-video');
fs.mkdirSync(directory,{recursive:true});
const now=1767225600000,world=createWorld(now),player=createPlayer(world,'千舰完整战斗录像',now);
const battle=startTrial(world,player,{attacker:trialPresets[7].fleet,defender:trialPresets[7].fleet,seed:42},now);
delete world.players[player.id];player.id=fixtureOwner;world.players[player.id]=player;
battle.id='00000000-0000-4000-8000-000000000100';battle.attacker=fixtureOwner;battle.defender='00000000-0000-4000-8000-000000000043';
for(const ship of battle.ships)ship.owner=ship.side==='attacker'?battle.attacker:battle.defender;
const frames=[{tick:0,ships:packedShips(battle)}],times=[];
while(battle.status==='active'&&battle.tick<12020){
  const before=performance.now();stepSpatialBattle(battle);times.push(performance.now()-before);
  if(battle.tick%4===0)frames.push({tick:battle.tick,ships:packedShips(battle)});
  if(battle.tick%1200===0)console.log('Simulated '+(battle.tick*.05)+' seconds; alive '+battle.ships.filter(s=>s.hp>0).length);
}
assert.equal(battle.status,'finished','the full video must end in an authoritative terminal battle');
assert.ok(battle.events.some(e=>e.type==='finish'),'the finish event must be retained');
if(frames.at(-1).tick!==battle.tick)frames.push({tick:battle.tick,ships:packedShips(battle)});
finishTrial(world,battle);
const report={...player.reports[0],id:battle.id,title:'千舰完整战斗 · 种子 42'};
const replay={version:4,record:{metadata:spatialMetadata(battle),frames,events:battle.events.filter(e=>e.type!=='input'),boundary:battle.boundary},report};
const normal=JSON.parse(fs.readFileSync('output/playwright/three-battle-comparison/fixture-normal.json','utf8'));
// Compare compact hashes, never ask assert to format millions of frame cells.
// An assertion diff of a full battle can consume much more memory than the replay.
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const prefixFramesHash=digest(frames.slice(0,normal.record.frames.length)),normalFramesHash=digest(normal.record.frames);
console.log(JSON.stringify({prefixFramesHash,normalFramesHash}));
assert.equal(prefixFramesHash,normalFramesHash,'full battle must extend the certified 80-second sample without changing its simulation');
const prefixEvents=replay.record.events.filter(e=>e.tick<=normal.record.frames.at(-1).tick);
assert.equal(digest(prefixEvents),digest(normal.record.events),'full battle effects must extend the same seed-42 event stream');
const bytes=JSON.stringify(replay),sorted=[...times].sort((a,b)=>a-b);
const manifest={name:'complete',preset:trialPresets[7].name,ships:battle.ships.length,seed:42,status:battle.status,settled:battle.settled,winner:battle.winner,
  duration:battle.tick*.05,finalTick:battle.tick,combatStart:11,snapshotIntervalMs:200,frames:frames.length,events:replay.record.events.length,
  sha256:createHash('sha256').update(bytes).digest('hex'),prefixMatchesCertifiedNormal:true,initial:report.initial,survivors:report.survivors,losses:report.losses,
  simulationMs:{mean:times.reduce((a,b)=>a+b,0)/times.length,p95:percentile(sorted,.95),p99:percentile(sorted,.99)},bytes:Buffer.byteLength(bytes),finishEvent:replay.record.events.findLast(e=>e.type==='finish')};
fs.writeFileSync(path.join(directory,'fixture-complete.json'),bytes);
fs.writeFileSync(path.join(directory,'fixture-complete-manifest.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(directory,'battle-settlement.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(manifest,null,2));
