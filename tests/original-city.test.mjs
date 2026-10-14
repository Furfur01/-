import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DEFAULT_LAYOUT,BUILDING_WIDTHS,FIXED_PLOTS,LAYOUT_VERSION,getLayout,migrateLayout,validatePlacement} from '../game/layout.mjs';
import {createWorld,createPlayer,migrateWorld} from '../game/engine.mjs';

const scene=JSON.parse(fs.readFileSync(new URL('../game/original-city.json',import.meta.url)));
test('the original scene retains animated bitmap timelines and all referenced atlases',()=>{
  assert.equal(scene.fps,30);
  function displayed(id,age,path=[]){
    if(scene.shapes[id])return [[id,...path]];
    const frames=scene.sprites[id];if(!frames)return [];
    const frame=age%frames.length;
    return frames[frame].flatMap(p=>displayed(p.id,frames.length===1?age:Math.max(0,frame-p.start),[...path,...p.m,p.alpha]));
  }
  // The ground effects and asteroid layers must actually change with time.
  for(const id of [800,266,482])assert.notDeepEqual(displayed(id,0),displayed(id,15));
  for(const atlas of scene.atlases)assert.ok(fs.existsSync(new URL('../opendesign/mockups/galaxy-empire/assets/original/scenes/atlases/'+atlas,import.meta.url)));
  for(const shapes of Object.values(scene.shapes))assert.ok(scene.atlases.includes(shapes.atlas));
  assert.ok(scene.roots.length>0&&scene.foreground.length>0);
  assert.equal(Object.keys(scene.placement_sources).length,14);
  assert.ok(DEFAULT_LAYOUT.Crystal_Mine[0]<800&&DEFAULT_LAYOUT.Crystal_Mine[1]>700);
  assert.ok(DEFAULT_LAYOUT.Gas_Mine[0]>1000&&DEFAULT_LAYOUT.Gas_Mine[1]<350);
});
test('legacy building coordinates remain bounded while all planet slots are fixed',()=>{
  const p={layoutVersion:LAYOUT_VERSION,buildings:Object.fromEntries(Object.keys(DEFAULT_LAYOUT).map(id=>[id,1]))};
  for(const [id,point] of Object.entries(DEFAULT_LAYOUT)){
    assert.ok(BUILDING_WIDTHS[id]>0);
    assert.deepEqual(FIXED_PLOTS[id],point);
    assert.match(validatePlacement(p,id,...point),/固定球面/);
  }
  assert.match(validatePlacement(p,'Command_Center',360,275),/固定球面/);
});
test('legacy layout migration preserves progress and retains old positions for recovery',()=>{
  const w=createWorld(1000),player=createPlayer(w,'测试',1000),p=w.planets[player.home];
  delete p.layoutVersion;p.layout={Command_Center:[800,420],Solar_Plant:[640,170]};
  const progress=structuredClone({resources:p.resources,buildings:p.buildings,ships:p.ships}),old=structuredClone(p.layout);
  migrateWorld(w);
  assert.deepEqual({resources:p.resources,buildings:p.buildings,ships:p.ships},progress);
  assert.deepEqual(p.previousLayout,old);
  assert.deepEqual(getLayout(p),DEFAULT_LAYOUT);
  p.layout.Command_Center=[800,650];migrateLayout(p);
  assert.deepEqual(getLayout(p).Command_Center,DEFAULT_LAYOUT.Command_Center);
  const moon={moon:true,layout:{Moon_Base:[780,440]}};migrateLayout(moon);
  assert.deepEqual(getLayout(moon).Moon_Base,[780,440]);
});
