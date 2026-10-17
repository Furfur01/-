import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base='opendesign/mockups/planet-construction-review/';
function fixture(){
 const runtime=fs.readFileSync(base+'aurora-runtime.js','utf8'),math=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('/*__AURORA_MOON__*/'));
 return vm.runInNewContext(`(()=>{${math}let W=1600,H=1000,FOV=42*PI/180;const window={dispatchEvent:()=>{}},CustomEvent=function(){};${fs.readFileSync(base+'aurora-gargantua.js','utf8')}\n${fs.readFileSync(base+'aurora-navigation.js','utf8')}return {n:auroraNavigation,focus:auroraNavigationToBlackHole,select:auroraNavigationSelectBlackHole,click:auroraNavigationClick,wheel:auroraNavigationWheel,update:auroraNavigationUpdate,drag:auroraNavigationDrag,viewport:(w,h)=>{W=w;H=h;}};})()`);
}
test('Gargantua focus stays at galactic origin without changing colony or system',()=>{
 const f=fixture();assert.equal(f.focus(),false);Object.assign(f.n,{enabled:true,activePlanetId:'home',system:[1,42]});
 assert.equal(f.focus(),true);assert.equal(f.n.goal.dist,112);assert.deepEqual(Array.from(f.n.goal.center),[0,0,0]);
 f.update(1);f.wheel(-180);assert.equal(f.n.zoomTarget.type,'blackHole');assert.deepEqual(Array.from(f.n.goal.center),[0,0,0]);assert.equal(f.n.activePlanetId,'home');assert.deepEqual(Array.from(f.n.system),[1,42]);
 f.drag(10,10,true);assert.equal(f.n.zoomTarget,null);
});
test('portrait framing fits the disk and zoom clamps outside the horizon',()=>{
 const f=fixture();f.n.enabled=true;f.viewport(390,844);f.focus();assert.ok(f.n.goal.dist>200);
 for(let i=0;i<80;i++){f.update(.1);f.wheel(-200);}
 assert.ok(f.n.goal.dist>=6.5*1.24);assert.deepEqual(Array.from(f.n.goal.center),[0,0,0]);
});

test('single click only selects the core; double click uses the system focus distance',()=>{const f=fixture();f.n.enabled=true;f.n.screen=[{id:'gargantua',type:'blackHole',x:200,y:300,radius:16,depth:1000}];const before={...f.n.camera};f.click(200,300);assert.equal(f.n.goal.dist,before.dist);assert.equal(f.n.goal.yaw,before.yaw);assert.equal(f.n.goal.pitch,before.pitch);assert.equal(f.n.zoomTarget.type,'blackHole');f.click(200,300,true);assert.equal(f.n.goal.dist,112);assert.equal(f.n.goal.pitch,before.pitch);});
