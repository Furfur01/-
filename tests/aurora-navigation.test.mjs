import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {starMap} from '../game/star-map.mjs';
const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url),runtime=readFileSync(new URL('aurora-runtime.js',base),'utf8'),source=readFileSync(new URL('aurora-navigation.js',base),'utf8');
function fixture(){const head=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('/*__AURORA_MOON__*/'));return vm.runInNewContext(`(()=>{${head}const events=[],window={dispatchEvent:e=>events.push(e.detail)},CustomEvent=function(_,v){this.detail=v.detail;};let W=1440,H=1000,FOV=42*PI/180;${readFileSync(new URL('aurora-logistics.js',base),'utf8')}${source}return {state:auroraNavigation,events,set:auroraNavigationSetState,body:auroraNavigationBody,planet:auroraNavigationToPlanet,system:auroraNavigationFocusSystem,galaxy:auroraNavigationToGalaxy,update:auroraNavigationUpdate,wheel:auroraNavigationWheel,drag:auroraNavigationDrag,stop:auroraNavigationInterrupt,select:auroraNavigationSelect,slot:auroraNavigationSlot,starRadius:auroraStarRadius,public:auroraNavigationPublicPlanet,locate:auroraNavigationLocate,fitColonies:auroraNavigationFitColonies,fit:auroraNavigationFitDistance,logistics:auroraNavigationFocusLogistics,anchor:auroraNavigationAnchor,click:auroraNavigationClick,viewport:(w,h)=>{W=w;H=h;}};})()`,{performance});}
const directory=starMap({biomeSeed:42,planets:{home:{id:'home',name:'母星',position:[1,16,7],biome:'terrestrial',owner:'me'},moon:{id:'moon',name:'月球',position:[1,16,7],moon:true,parent:'home',owner:'me'}},players:{}});
test('standalone detail review retains its own camera and update loop',()=>{const n=fixture();assert.equal(n.update(.016),false);assert.equal(n.drag(10,10),false);assert.equal(n.wheel(100),false);});
function scene(){const n=fixture();n.set({...directory,activePlanetId:'home',homePlanetId:'home',ownedPlanets:[{id:'home'}]});return n;}
test('all 499 systems and 7485 planets persist; home starts at its fixed galaxy coordinate',()=>{const n=scene();assert.equal(n.state.systems.length,499);assert.equal(n.state.planets.length,499*16+1);assert.equal(n.state.level,'galaxy');assert.equal(JSON.stringify(n.state.camera.center),JSON.stringify([-6750,40,9260]));const positions=JSON.stringify(n.state.planets.map(p=>p.position));n.planet('1:42:4');n.update(1);n.system(3);n.update(1);n.galaxy();assert.equal(JSON.stringify(n.state.planets.map(p=>p.position)),positions);});
test('scrolling reverses immediately and rests at any distance with the same camera',()=>{const n=scene(),camera=n.state.camera;n.planet('home');n.update(.05);n.wheel(100,0,0);const dist=n.state.goal.dist;n.update(.01);n.wheel(-100,0,0);assert(n.state.goal.dist<dist);for(let i=0;i<300;i++)n.update(.016);const stopped=n.state.camera.dist;n.update(1);assert(Math.abs(n.state.camera.dist-stopped)<1e-8);assert.equal(n.state.camera,camera);assert.equal(n.events.filter(e=>e.type==='enter'||e.type==='galaxy').length,0);});
test('foreign browsing never changes active colony and does not emit economic events',()=>{const n=scene();n.planet('1:42:9');for(let i=0;i<300;i++)n.update(.016);assert.equal(n.state.activePlanetId,'home');assert.equal(n.state.selectedPlanetId,'1:42:9');assert(n.events.every(e=>e.type==='select'));assert(!('buildings'in n.body('1:42:9')));});
test('refresh and late map data preserve observation, camera and its in-flight destination',()=>{const n=scene();n.planet('1:42:9');n.update(.03);const before=JSON.stringify({c:n.state.camera,g:n.state.goal,selected:n.state.selectedPlanetId});n.set({...directory,activePlanetId:'home'});assert.equal(JSON.stringify({c:n.state.camera,g:n.state.goal,selected:n.state.selectedPlanetId}),before);});
test('moon offset and stable coordinate keys survive ownership changes',()=>{const n=scene(),before=n.body('1:20:8').position.slice();const data=structuredClone(directory);const p=data.planets.find(p=>p.key==='1:20:8');p.id='new-colony';p.owner='me';n.set(data);assert.equal(JSON.stringify(n.body('new-colony').position),JSON.stringify(before));const moon=n.body('moon'),home=n.body('home');assert(Math.hypot(...moon.position.map((v,i)=>v-home.position[i]))>home.radius*3);assert(moon.radius<home.radius);});
test('missions without a target ID fall back to coordinates instead of the first unowned body',()=>{const n=scene();assert.equal(n.body(null),undefined);assert.equal(n.body(undefined),undefined);assert.equal(n.body('1:20:8').coordinates.join(':'),'1:20:8');assert.equal(n.body('home').id,'home');});
test('moon clearance scales with its parent and survives reversed directory ordering',()=>{for(const biome of ['mercury','terrestrial','gas']){const n=scene(),data=structuredClone(directory);data.planets.find(p=>p.id==='home').biome=biome;data.planets.reverse();n.set(data);const home=n.body('home'),moon=n.body('moon'),distance=Math.hypot(...moon.position.map((v,i)=>v-home.position[i]));assert(distance>=home.radius*3.5-1e-9);assert(distance-home.radius-moon.radius>3);}});
test('bad coordinates are rejected and portrait overview fits the complete system',()=>{const n=scene();n.set({planets:[...directory.planets,{position:[1,NaN,2]},{position:[2,3,4]},{position:[1,2,17]}]});assert.equal(n.state.planets.length,directory.planets.length);n.viewport(390,844);assert(n.fit()>200);n.system(16);assert(n.state.goal.dist>200);});
test('drag interrupts automatic travel and right drag translates the same camera target',()=>{const n=scene();n.planet('home');n.update(.1);const old=n.state.camera.center.slice();n.drag(15,4,true);assert.equal(n.state.flight,false);assert.notEqual(JSON.stringify(n.state.goal.center),JSON.stringify(old));n.stop();assert.equal(JSON.stringify(n.state.goal),JSON.stringify(n.state.camera));});
test('select and center preserves zoom and operating colony',()=>{const n=scene(),distance=n.state.camera.dist;n.select('1:42:9',{focus:true});assert.equal(n.state.goal.dist,distance);assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(n.body('1:42:9').position));assert.equal(n.state.selectedPlanetId,'1:42:9');assert.equal(n.state.activePlanetId,'home');n.update(.1);n.stop();assert.equal(n.state.flight,false);});
test('only an explicit map click requests an inspector; wheel navigation stays unobstructed',()=>{
  const n=scene();n.state.screen=[{type:'planet',id:'1:16:7',x:300,y:300,radius:40,depth:100}];
  n.wheel(-100,300,300);assert(!n.events.some(e=>e.type==='inspect'));
  n.click(300,300);assert.equal(n.events.at(-1).type,'inspect');assert.equal(n.state.activePlanetId,'home');
});
test('overlapping galaxy hit areas choose the closest visible star center',()=>{
 const n=scene();n.state.screen=[{type:'system',id:16,x:300,y:300,radius:24,depth:100},{type:'system',id:42,x:313,y:300,radius:10,depth:200}];
 n.click(313,300);assert.equal(n.state.system[1],42);assert.equal(n.state.zoomTarget.id,42);
});
test('a blank map click dismisses overlays without changing the selected colony or zoom',()=>{
  const n=scene();n.select('1:42:9',{focus:true});n.update(2);n.state.screen=[];
  const selected=n.state.selectedPlanetId,distance=n.state.camera.dist;
  n.click(10,10);assert.equal(n.events.at(-1).type,'deselect');assert.equal(n.state.selectedPlanetId,selected);assert.equal(n.state.camera.dist,distance);assert.equal(n.state.activePlanetId,'home');
});
test('wheel during incomplete centering keeps selected body centered even over another target',()=>{const n=scene();n.select('1:42:9',{focus:true});n.update(.03);n.state.screen=[{id:16,type:'system',x:100,y:100,radius:30,depth:10}];const target=n.body('1:42:9');for(let i=0;i<15;i++){n.wheel(-200,100,100);n.update(.025);assert.equal(JSON.stringify(n.state.camera.center),JSON.stringify(target.position));assert.equal(n.state.selectedPlanetId,target.key);}n.wheel(200,100,100);assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(target.position));});
test('explicit pan releases selected zoom anchor; orbit retains it',()=>{const n=scene();n.select('1:16:7',{focus:true});n.update(2);n.drag(20,10);assert.equal(n.state.zoomTarget.id,'1:16:7');n.drag(20,10,true);assert.equal(n.state.zoomTarget,null);const center=n.state.goal.center.slice();n.wheel(-100,-100,-100);assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(center));});
test('navigation animation clock advances at rest without moving world coordinates',()=>{const n=scene(),before=JSON.stringify(n.body('home').position);for(let i=0;i<120;i++)n.update(1/60);assert(Math.abs(n.state.time-2)<1e-10);assert.equal(JSON.stringify(n.body('home').position),before);});

test('capital locator returns to the true home after browsing a foreign system without switching operating colony',()=>{const n=scene();n.set({activePlanetId:'moon'});n.system(42);n.update(2);n.locate();assert.equal(n.state.selectedPlanetId,'1:16:7');assert.equal(n.state.activePlanetId,'moon');assert.equal(n.state.zoomTarget.id,16);assert(n.state.goal.dist>=14500);assert.equal(n.state.goal.pitch,1.25);});
test('fit colonies includes disconnected holdings without changing selection or economic state',()=>{const n=scene();n.set({ownedPlanets:[{id:'home'},{id:'moon'}]});assert.equal(n.fitColonies(),true);assert.equal(n.state.activePlanetId,'home');assert.equal(n.state.zoomTarget.id,16);});

test('raised systems carry planets, moons and camera anchors; colony framing includes height',()=>{
 const n=scene(),data=structuredClone(directory),offset=n.body('home').position.map((v,i)=>v-directory.systems.find(s=>s.id===16).position[i]),moonOffset=n.body('moon').position.map((v,i)=>v-n.body('home').position[i]);
 data.systems.find(s=>s.id===16).position=[0,-3000,0];data.systems.find(s=>s.id===42).position=[300,3000,300];data.planets.find(p=>p.key==='1:42:9').id='remote';
 n.set({...data,ownedPlanets:[{id:'home'},{id:'remote'}]});const home=n.body('home'),star=data.systems.find(s=>s.id===16);
 for(let i=0;i<3;i++){assert(Math.abs(home.position[i]-star.position[i]-offset[i])<1e-9);assert(Math.abs(n.body('moon').position[i]-home.position[i]-moonOffset[i])<1e-9);}
 n.system(16);assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(star.position));n.planet('remote');assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(n.body('remote').position));
 n.fitColonies();assert(n.state.goal.dist>10000);assert.equal(n.state.goal.center[1],0);assert.equal(n.state.activePlanetId,'home');
});

test('expanded orbital spacing clears giant stars; white dwarfs stay compact',()=>{const n=scene();assert.equal(n.starRadius(0),7);assert.equal(n.starRadius(1),10);assert.equal(n.starRadius(2),12);assert.equal(n.starRadius(3),1.4);assert.equal(n.slot(1).orbit,26.5);assert.equal(n.slot(2).orbit-n.slot(1).orbit,8.5);assert(n.slot(1).orbit>n.starRadius(2)*2);});
test('selecting another planet releases the combat camera anchor',()=>{const n=scene();n.state.battleFocus='active';n.select('1:42:9',{focus:true});assert.equal(n.state.battleFocus,null);assert.equal(n.state.zoomTarget.id,'1:42:9');});

test("leaving combat for the galaxy or a colony releases ship following",()=>{for(const navigate of [n=>n.galaxy(),n=>n.locate(),n=>n.fitColonies(),n=>n.select("1:42:9",{focus:true})]){const n=scene();n.state.battleFocus="active";n.state.combatCamera={id:"active",shipId:0,mode:"bridge"};navigate(n);assert.equal(n.state.combatCamera,null);assert.equal(n.state.battleFocus,null);}});


test('logistics close view anchors a completed megastructure without changing the operating colony',()=>{
  const n=scene();n.set({logistics:[{key:'me:1:16',position:[1,16],level:1}]});
  assert.equal(n.logistics('me:1:16'),true);const anchor=n.anchor();
  assert.equal(n.state.zoomTarget.type,'logistics');assert.equal(anchor.radius,16);
  const before=n.state.activePlanetId;n.update(.03);n.wheel(-150);
  assert.equal(JSON.stringify(n.state.goal.center),JSON.stringify(anchor.position));
  assert.equal(n.state.activePlanetId,before);assert.ok(n.state.goal.dist>=anchor.radius*1.24);
  n.drag(20,5);assert.equal(n.state.zoomTarget.type,'logistics');
  n.system(16);assert.equal(n.state.zoomTarget.type,'system');
});

test('logistics focus rejects unbuilt centers and fits its full structure on portrait screens',()=>{
  const n=scene();n.set({logistics:[{key:'me:1:16',position:[1,16],level:0}]});
  assert.equal(n.logistics('me:1:16'),false);
  n.set({logistics:[{key:'me:1:16',position:[1,16],level:0,queue:{start:0,end:60000}}]});
  n.logistics('me:1:16');const landscape=n.state.goal.dist;n.viewport(390,844);n.logistics('me:1:16');
  assert.ok(n.state.goal.dist>landscape*2);
});

test('clicking the logistics structure emits a management event without moving a fleet',()=>{
  const n=scene();n.state.screen=[{type:'logistics',id:'me:1:16',system:16,x:200,y:200,radius:40,depth:100}];
  const before=n.state.activePlanetId;n.click(200,200);
  assert.equal(n.events.at(-1).type,'logistics');assert.equal(n.state.activePlanetId,before);
  assert.equal(n.events.filter(e=>e.type==='logistics').length,1);
});
