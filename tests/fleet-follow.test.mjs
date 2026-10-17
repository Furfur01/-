import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {missionVisual} from '../game/mission-visual.mjs';
import {cruiseView} from '../scripts/three-flight/map-renderer.js';
import {createGalaxyRender} from '../scripts/three-flight/renderer.js';

const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
function fixture(clock=performance){
 const runtime=readFileSync(new URL('aurora-runtime.js',base),'utf8'),head=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('/*__AURORA_MOON__*/'));
 const context={performance:clock,Date,missionVisual,cruiseView};
 return vm.runInNewContext(`(()=>{${head}
 const events=[],window={dispatchEvent:e=>events.push(e.detail)},CustomEvent=function(_,v){this.detail=v.detail;};
 let W=1440,H=1000,FOV=42*PI/180,gameNowOffset=0;const auroraBlackHole={position:[0,0,0]};
 ${readFileSync(new URL('aurora-navigation.js',base),'utf8')}
 ${readFileSync(new URL('aurora-battles.js',base),'utf8')}
 auroraNavigationSetState({playerId:'me',activePlanetId:'home',systems:[{id:16,position:[100,0,0]}],planets:[{id:'home',position:[1,16,7],biome:'terrestrial'},{id:'target',position:[1,16,8],biome:'terrestrial'}]});
 return {n:auroraNavigation,events,focus:auroraMissionFocus,follow:()=>auroraFollowMission(missionVisual,cruiseView),exit:auroraFleetExit,wheel:auroraNavigationWheel,drag:auroraNavigationDrag,click:auroraNavigationClick,battle:auroraBattleSet,vessel:auroraMapVessel,update:auroraUpdateCombatCamera,step:auroraNavigationUpdate,row:(id,ship)=>auroraBattleRow(auroraMapBattles.get(id),ship),placement:id=>{const b=auroraMapBattles.get(id),p=auroraNavigationBody(b.target);return {anchor:auroraBattleAnchor(p,b),scale:auroraBattleScale(p,b)};}};})()`,context);
}
function mission(phase='outbound',elapsed=0){return {id:'fleet',from:'home',fromPosition:[1,16,7],target:'target',position:[1,16,8],task:'attack',ships:{Cruiser:2},phase,start:Date.now()-elapsed,end:Date.now()+20000-elapsed};}
function battle(){return {id:'battle',target:'target',ships:[[0,0,0,0,0,0,100],[1,20,0,0,0,0,100]],metadata:[0,1].map(id=>({id,owner:'me',side:'attacker',type:'Cruiser',profile:{length:20,piloted:true}}))};}

test('cruise scenery looks along the route, reverses on return, and shares the fleet vanishing point',()=>{
 const f=fixture(),m=mission('outbound',10000);f.n.missions=[m];f.focus(m.id);f.follow();
 const yaw=f.n.goal.yaw,pitch=f.n.goal.pitch;
 const a=f.n.planets.find(p=>p.id==='home').position,b=f.n.planets.find(p=>p.id==='target').position;
 const d=b.map((v,i)=>v-a[i]),length=Math.hypot(...d),slope=Math.asin(d[1]/length);
 assert(Math.abs(Math.sin(yaw)*d[2]-Math.cos(yaw)*d[0])<1e-7,'Camera must stay on the route axis');
 assert(Math.sin(yaw)*d[0]+Math.cos(yaw)*d[2]<0,'Camera must be behind the ship');
 assert(Math.abs(pitch+slope-cruiseView.pitch)<1e-9);
 assert(Math.abs(.5-Math.tan(pitch+slope)/(2*Math.tan(cruiseView.fov*Math.PI/360))-cruiseView.vanishingY)<1e-9);
 Object.assign(m,mission('return',10000));f.follow();
 assert(Math.abs(Math.cos(f.n.goal.yaw-yaw)+1)<1e-9);assert(Math.abs(f.n.goal.pitch-slope-cruiseView.pitch)<1e-9);
});

test('follow survives departure, cruise, combat and return; wheel, drag and blank clicks cannot exit',()=>{
 const f=fixture(),m=mission();f.n.missions=[m];assert(f.focus(m.id));f.follow();
 for(const elapsed of [5000,10000,17000]){Object.assign(m,mission('outbound',elapsed));f.follow();const goal=JSON.stringify(f.n.goal);f.wheel(10000);f.wheel(-10000);f.drag(800,800,true);f.click(0,0);assert.equal(JSON.stringify(f.n.goal),goal);assert.equal(f.n.missionFollow.id,m.id);}
 f.battle('battle',battle());Object.assign(m,{phase:'engaged',battleId:'battle'});f.follow();assert.equal(f.n.combatCamera.id,'battle');
 f.wheel(5000);assert.equal(f.n.combatCamera.mode,'follow');
 Object.assign(m,mission('return'));f.follow();assert.equal(f.n.combatCamera,null);assert.equal(f.n.missionFollow.id,m.id);
 f.n.missions=[];f.follow();assert.equal(f.n.missionFollow,null);assert.equal(f.events.at(-1).reason,'completed');
});
test('Esc exit persists across new stages and live combat remains available outside',()=>{
 const f=fixture(),m={...mission('engaged'),battleId:'battle'};f.n.missions=[m];f.battle('battle',battle());f.focus(m.id);f.follow();assert(f.exit());
 f.follow();assert.equal(f.n.missionFollow,null);assert.equal(f.n.combatCamera,null);
 assert(f.vessel('battle',1));assert.equal(f.n.combatCamera.shipId,1);assert.equal(f.n.missionFollow,null,'choosing a vessel detaches the mission camera');
});
test('losing selected ship switches to a survivor; losing the fleet exits',()=>{
 const f=fixture(),m={...mission('engaged'),battleId:'battle'},b=battle();f.n.missions=[m];f.battle('battle',b);f.focus(m.id);b.ships[0][6]=0;f.battle('battle',b);f.update();assert.equal(f.n.combatCamera.shipId,1);
 b.ships[1][6]=0;f.battle('battle',b);f.update();assert.equal(f.n.missionFollow,null);assert.equal(f.n.combatCamera,null);assert.equal(f.events.at(-1).reason,'destroyed');
});
for(const task of ['explore','mine'])test(`${task} follows outbound but exits on arrival at work, and can follow the return`,()=>{
 const f=fixture(),m={...mission(),task};f.n.missions=[m];assert(f.focus(m.id));f.follow();m.phase='holding';f.follow();assert.equal(f.n.missionFollow,null);assert.equal(f.n.combatCamera,null);assert.equal(f.focus(m.id),false);
 Object.assign(m,mission('return'),{task});assert(f.focus(m.id));f.follow();assert.equal(f.n.missionFollow.id,m.id);
});

test('heavy fighter bridge is attached on its first frame and shares the hull clock and bank',()=>{
 let now=1000;const f=fixture({now:()=>now});
 const fleet=JSON.parse(readFileSync(new URL('../opendesign/mockups/galactic-command/flight-fleet.json',import.meta.url)));
 const index=fleet.ships.findIndex(s=>s.id==='Heavy_Fighter'),layout=fleet.layouts[index];
 const {M,shipMatrix}=createGalaxyRender({...fleet,vertices:new Float32Array(0)});
 f.n.resources={battles:{bridgeSeat:()=>layout.bridge}};
 const b={...battle(),tick:1,ships:[[0,0,0,0,.5,.2,100,100,-1,110,0,0,.4]],metadata:[{id:0,type:'Heavy_Fighter',owner:'me',side:'attacker',profile:{length:2,role:'fighter',piloted:true}}]};
 f.battle(b.id,b);now=1200;
 f.battle(b.id,{...b,tick:5,ships:[[0,22,7,-11,1.1,.7,100,100,-1,110,0,0,1.5]]});
 assert(f.vessel(b.id,0,'bridge'));now=1300;f.step(1/60);
 assert.deepEqual(JSON.parse(JSON.stringify(f.n.camera)),JSON.parse(JSON.stringify(f.n.goal)),'No detached cabin during the old 650 ms camera transition');
 const row=f.row(b.id,0),{anchor,scale}=f.placement(b.id),model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:row[12]},index);
 const seat=M.transform(model,[layout.bridge[2],layout.bridge[1],-layout.bridge[0]]).map((v,i)=>anchor[i]+v*scale);
 const c=f.n.camera,eye=[Math.sin(c.yaw)*Math.cos(c.pitch),Math.sin(c.pitch),Math.cos(c.yaw)*Math.cos(c.pitch)].map((v,i)=>c.center[i]+v*c.dist);
 assert(Math.hypot(...eye.map((v,i)=>v-seat[i]))/scale<1e-7,'Camera sits at the authored hull seat');
 const up=[model[4],model[5],model[6]];
 assert(Math.hypot(...up.map((v,i)=>v-f.n.bridgeUp[i]))<1e-10,'Cabin and hull use identical bank');
 assert(Math.abs(f.n.bridgeNear/scale-.035)<1e-10,'Near plane fits the actual fighter scale');
 const before=JSON.stringify(row);now+=70;f.update();assert.equal(JSON.stringify(f.row(b.id,0)),before,'Time spent submitting the frame must not advance its hull');
});

test('duplicate live ticks preserve interpolation instead of snapping to the new snapshot',()=>{
 let now=1000;const f=fixture({now:()=>now}),b={...battle(),tick:1};f.battle(b.id,b);
 now=1200;const next={...b,tick:5,ships:b.ships.map(r=>{const s=r.slice();s[1]+=22;return s;})};f.battle(b.id,next);
 now=1300;f.step(1/60);const before=f.row(b.id,0)[1];assert.equal(before,11);
 f.battle(b.id,{...next,controls:{me:{shipId:0}}});assert.equal(f.row(b.id,0)[1],before);
 now=1350;f.step(1/60);assert.equal(f.row(b.id,0)[1],16.5);
});

test('mission stage changes select the battle camera before this frame is prepared',()=>{
 const f=fixture(),m=mission();f.n.missions=[m];f.focus(m.id);f.follow();
 f.n.resources={battles:{update:f.follow}};
 f.battle('battle',battle());Object.assign(m,{phase:'engaged',battleId:'battle'});
 f.step(1/60);assert.equal(f.n.combatCamera?.id,'battle');assert.equal(f.n.combatCamera.mode,'follow');
});
