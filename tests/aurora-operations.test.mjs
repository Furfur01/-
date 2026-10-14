import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const runtime=readFileSync(new URL('aurora-runtime.js',base),'utf8');
const head=runtime.slice(0,runtime.indexOf('/*__AURORA_TERRAIN__*/')).replace('function createAuroraRuntime(options={}) {','((options={}) => {');
const terrain=readFileSync(new URL('aurora-terrain.js',base),'utf8');
const ground=runtime.slice(runtime.indexOf('function ground('),runtime.indexOf('const canvas='));
const routes=runtime.slice(runtime.indexOf('function samplePath('),runtime.indexOf('// District scenery'));
const updates=runtime.slice(runtime.indexOf('function canProduce('),runtime.indexOf('function renderActors('));
function fixture(kind='truck',phase=.02){
 return vm.runInNewContext(`${head}\n${terrain}\n${ground}\n${routes}\nlet actors=[],rotors=[],playing=true,speed=1;\n${updates}
 const d=districts.find(d=>d.type==='${kind==='truck'?'metal':'crystal'}');
 const b={state:'active',d},store={state:'active'};d.buildings=[b,store];
 const a={kind:'${kind}',d,i:0,t:${phase},period:${kind==='truck'?24:27},position:[0,0],storageAvailable:true};actors.push(a);updateActors(0);
 const rotor={kind:'bucket',b};rotors.push(rotor);updateRotors(0);
 return {a,b,store,rotor,updateActors,updateRotors,setPlaying(value){playing=value},setSpeed(value){speed=value}};})();`);
}
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} should equal ${b}`);

test('diagnostic advance preserves requested fractional seconds for all simulation clocks',()=>{
 const advance=runtime.slice(runtime.indexOf('_advance:')+9,runtime.indexOf(',setState:',runtime.indexOf('_advance:')));
 const fixture=vm.runInNewContext(`let playing=true,animTime=0,speed=1,shadowDirty=false;
 const productionRate=()=>1,auroraNavigationUpdate=()=>false;
 const districts=[{type:'gas',buildings:[{state:'active'}],gasClock:0}],elevators=[{clock:0}],rotorSteps=[],actorSteps=[];
 function canProduce(){return true}function updateRotors(dt){rotorSteps.push(dt)}function updateActors(dt){actorSteps.push(dt)}
 function updateSpaceElevator(e,time){e.clock=time}function render(){}function updatePhases(){}
 const advance=${advance};globalThis.api={advance,rotorSteps,actorSteps,districts,elevators,get time(){return animTime}};api;`);
 fixture.advance(.5,false);near(fixture.time,.5);assert.equal(fixture.rotorSteps.length,10);
 fixture.advance(.073,false);near(fixture.time,.573);
 near(fixture.rotorSteps.reduce((a,b)=>a+b,0),.573);
 near(fixture.actorSteps.reduce((a,b)=>a+b,0),.573);
 near(fixture.districts[0].gasClock,.573);near(fixture.elevators[0].clock,.573);
 assert(fixture.actorSteps.every(step=>step>0&&step<=.05));
});

test('rotors freeze without resetting phase, resume continuously and honor low power and warehouse capacity',()=>{
 const f=fixture();f.updateRotors(5);near(f.rotor.clock,5);
 f.b.state='paused';f.updateRotors(9);near(f.rotor.clock,5);
 f.b.state='active';f.updateRotors(.05);near(f.rotor.clock,5.05);
 f.b.state='lowpower';f.updateRotors(2);near(f.rotor.clock,5.75);
 f.b.state='upgrade';f.updateRotors(1);near(f.rotor.clock,6.45);
 f.store.state='full';f.updateRotors(6);near(f.rotor.clock,6.45);
 assert.equal(f.rotor.active,false);
 f.store.state='active';f.b.state='active';f.setPlaying(false);f.updateRotors(8);near(f.rotor.clock,6.45);
 f.setPlaying(true);f.setSpeed(2);f.updateRotors(.5);near(f.rotor.clock,7.45);
});

for(const kind of ['truck','robot']){
 test(`${kind}: warehouse filling during unload freezes remaining cargo and unloading pose`,()=>{
  const f=fixture(kind,.96),a=f.a,carry=a.carrying,tilt=a.unload,phase=a.t;
  assert(carry>0&&carry<1);
  f.store.state='full';for(let i=0;i<30;i++)f.updateActors(.05);
  near(a.carrying,carry);near(a.unload,tilt);near(a.t,phase);
  assert.match(a.phase,/等待卸货/);
  f.store.state='active';f.updateActors(.05);assert(a.carrying<carry);
 });

 test(`${kind}: a warehouse removed mid-trip uses a continuous connector to temporary unloading`,()=>{
  const f=fixture(kind,.78),a=f.a,phases=new Set();f.store.state='unbuilt';
  let previous=[...a.position],largest=0,usedConnector=false,completed=false;
  for(let i=0;i<400;i++){
   f.updateActors(.05);const step=Math.hypot(a.position[0]-previous[0],a.position[1]-previous[1])*2.05;largest=Math.max(largest,step);
   assert(step<.16,`visible teleport: ${step} world units in 50 ms`);
   if(a.relocation){usedConnector=true;assert(a.carrying>.95,'reroute loaded cargo before unloading');}
   phases.add(a.phase);previous=[...a.position];
   if(usedConnector&&!a.relocation&&!a.storageAvailable&&a.t<.1){completed=true;break;}
  }
  assert(usedConnector&&completed);assert(phases.has('临时卸料点卸货'));
  assert(largest>.005,'actor genuinely traveled instead of hiding the teleport');
 });

 test(`${kind}: reverse warehouse switches and pause during relocation retain position and cargo`,()=>{
  const f=fixture(kind,.96),a=f.a,remaining=a.carrying;f.store.state='unbuilt';
  for(let i=0;i<10;i++)f.updateActors(.05);
  assert(a.relocation);near(a.carrying,remaining);
  f.setPlaying(false);const p=[...a.position],tilt=a.unload;f.updateActors(5);
  p.forEach((v,i)=>near(v,a.position[i]));near(a.unload,tilt);near(a.carrying,remaining);
  f.store.state='active';f.updateActors(0);p.forEach((v,i)=>near(v,a.position[i]));
  f.setPlaying(true);let previous=[...a.position];
  for(let i=0;i<220;i++){
   f.updateActors(.05);assert(Math.hypot(a.position[0]-previous[0],a.position[1]-previous[1])*2.05<.16);
   previous=[...a.position];
   if(!a.relocation&&a.storageAvailable){assert(a.carrying<=remaining+1e-9);return;}
  }
  assert.fail('re-routed actor never reached the restored warehouse');
 });

 test(`${kind}: ordinary operations retain complete collection, return, and unload phases`,()=>{
  const f=fixture(kind,.02),phases=new Set();let wraps=0,previous=f.a.t;
  for(let i=0;i<600;i++){
   f.updateActors(.05);phases.add(f.a.phase);if(f.a.t<previous)wraps++;previous=f.a.t;
   assert(f.a.matrix.every(Number.isFinite));assert(f.a.carrying>=0&&f.a.carrying<=1);
  }
  assert(wraps>=1);
  for(const expected of kind==='truck'?['空车驶向矿山','矿山装载','满载运回仓库','仓库卸货']:['驶向晶簇','钻头接触晶簇 · 采集','收起钻头 · 装载','携带晶体返回','卸下晶体'])assert(phases.has(expected));
 });
}
