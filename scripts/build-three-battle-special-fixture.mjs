// Persist the small regression recipe for identical legacy/Three.js video input.
// CPU only: no browser, server, production save, renderer or benchmark mutation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {root,createFixture} from '../tests/three-battle-harness.mjs';

const directory=path.join(root,'output/playwright/three-battle-video');
const recipe={stress:true,seconds:35,fleet:{Annihilator:1,Reaper:1,Dreadnought:3}};
const fixture=createFixture(recipe),{record}=fixture.replay;
assert.equal(record.metadata.length,10,'the visual supplement must remain a separate ten-ship fixture');
const detonations=record.events.filter(e=>e.type==='antimatter'&&!e.harmless);
const reaperFires=record.events.filter(e=>e.type==='fire'&&e.kind==='reaper');
assert.ok(detonations.length>0,'the saved fixture must contain a real antimatter detonation');
assert.ok(reaperFires.length>0,'the saved fixture must contain an emitted Reaper fire event');
assert.equal(new Set(detonations.map(e=>`${e.source}:${e.tick}`)).size,detonations.length);

const seconds=tick=>Number((tick/20).toFixed(2));
const counts=events=>Object.fromEntries([...new Set(events.map(e=>`${e.type}:${e.kind??''}`))].sort().map(key=>[key,events.filter(e=>`${e.type}:${e.kind??''}`===key).length]));
const eventInfo=e=>({
  seq:e.seq,tick:e.tick,time:seconds(e.tick),type:e.type,kind:e.kind,
  shipId:e.shipId,source:e.source,target:e.target,projectileId:e.projectileId,
  sourceType:record.metadata[e.source??(e.type==='fire'?e.shipId:-1)]?.type,
  targetType:record.metadata[e.target??(e.type==='fire'?-1:e.shipId)]?.type,
  ...(e.x===undefined?{}:{position:[e.x,e.y,e.z]}),
  ...(e.from?{from:e.from}:{}),...(e.to?{to:e.to}:{}),
  ...(e.radius===undefined?{}:{radius:e.radius}),
  ...(e.harmless===undefined?{}:{harmless:e.harmless}),
  ...(e.shield===undefined?{}:{shield:e.shield}),
});
const duration=fixture.manifest.duration;
const windows=[
  ...detonations.map(e=>({
    id:`annihilator-${e.source}-${e.tick}`,effect:'antimatter',source:e.source,
    eventSeq:e.seq,eventTick:e.tick,eventTime:seconds(e.tick),
    start:Math.max(0,seconds(e.tick)-.75),end:Math.min(duration,seconds(e.tick)+5.35),
    center:[e.x,e.y,e.z],radius:e.radius,
    view:'overview',cameraDistanceSuggestion:e.radius*2.5,
    checkpoints:[0,.15,.45,1.4,4.5,5.25].map(age=>({age,time:Number((seconds(e.tick)+age).toFixed(2))})),
    mustSee:['approach','collapse core','expanding rings','ejecta streamers','fade'],
  })),
  ...reaperFires.map(e=>({
    id:`reaper-${e.shipId}-${e.tick}`,effect:'reaper-beams',shipId:e.shipId,target:e.target,
    eventSeq:e.seq,eventTick:e.tick,eventTime:seconds(e.tick),
    start:Math.max(0,seconds(e.tick)-.5),end:Math.min(duration,seconds(e.tick)+1.2),
    view:'follow',cameraDistanceSuggestion:220,
    mustSee:['two separated muzzle origins','green beams','target alignment','beam fade'],
  })),
];
const bytes=JSON.stringify(fixture.replay);
const sha256=createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256,fixture.manifest.sha256,'manifest hash must describe exact saved replay bytes');
const manifest={
  ...fixture.manifest,name:'special',preset:'独立特殊武器 · 双方各 5 艘',
  purpose:'Visual comparison supplement only; excluded from the certified 1000-ship performance results.',
  recipe,command:'node scripts/build-three-battle-special-fixture.mjs',
  bytes:Buffer.byteLength(bytes),sha256,frames:record.frames.length,
  shipsByType:Object.fromEntries([...new Set(record.metadata.map(m=>m.type))].sort().map(type=>[type,record.metadata.filter(m=>m.type===type).length])),
  shipIds:record.metadata.map(m=>({id:m.id,type:m.type,side:m.side,owner:m.owner,length:m.profile.length})),
  eventKinds:counts(record.events),
  effects:{
    antimatterLaunches:record.events.filter(e=>e.type==='antimatter-launch').map(eventInfo),
    antimatterDetonations:detonations.map(eventInfo),
    harmlessAntimatter:record.events.filter(e=>e.type==='antimatter'&&e.harmless).map(eventInfo),
    reaperFires:reaperFires.map(eventInfo),
    destroyed:record.events.filter(e=>e.type==='destroy').map(eventInfo),
  },
  windows,
  acceptance:{
    status:'not recorded or visually reviewed',
    footageLabel:'10 艘特殊武器补充样本 · 缩距 / 耐久 × 8 · 非千舰性能样本',
    randomSeed:'42 + (event.seq ?? event.tick) * 101',
    checks:[
      'Both renderers load these exact bytes; retain the replay SHA256 with the videos.',
      'Preserve a shared camera path and replay timeline; capture before, peak and fade frames.',
      'Keep a wide overview for the antimatter wavefront; a close camera cannot prove the entire expanding effect.',
      'Do not count the consumed warhead as a second generic explosion; each source:tick has one dedicated blast.',
      'Verify Reaper dual muzzle beams separately from the independent-practice charging rings and spiral cut.',
      'Effect presence in JSON is not visual acceptance; record whether the pixels are visible and match.',
    ],
  },
};
fs.mkdirSync(directory,{recursive:true});
const file=path.join(directory,'fixture-special.json');
fs.writeFileSync(file,bytes);
fs.writeFileSync(path.join(directory,'fixture-special-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({file,sha256,ships:manifest.ships,duration,events:manifest.events,
  detonations:manifest.effects.antimatterDetonations,reaperFires:manifest.effects.reaperFires.length,
  windows:windows.length,simulationMs:manifest.simulationMs},null,2));
