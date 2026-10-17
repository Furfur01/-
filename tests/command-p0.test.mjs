import test from 'node:test';
import assert from 'node:assert/strict';
import {publicCatalog,units,tech} from '../game/catalog.mjs';
import {duration,prerequisites} from '../game/engine.mjs';
import {createData,createView,shipCapacity,shipBlockReason} from '../client/command-p0/data.mjs';
import {createTechLayout} from '../client/command-p0/tech-layout.mjs';

const fixture=()=>{const planet={id:'test',buildings:{Shipyard:9,Nanite_Factory:3,Research_Lab:8,Missile_Silo:2},resources:[0,0,0],availableResources:[1e7,1e7,1e7],ships:{},defense:{},shipQueue:[],researchOptions:{Energy_Tech:{cost:[800,1600,0],seconds:123,energy:0}}},player={tech:Object.fromEntries(Object.keys(tech).map(id=>[id,10])),parts:7};return createData(publicCatalog,planet,player);};

test('research columns follow prerequisite depth, including roots with advanced facility requirements',()=>{
 const layout=createTechLayout(Object.values(tech));
 for(const t of Object.values(tech)){
  const parents=t.req.filter(([id])=>tech[id]);
  assert.equal(layout.tiers[t.id],parents.length?Math.max(...parents.map(([id])=>layout.tiers[id]))+1:0);
  for(const [parent]of parents)assert.ok(layout.positions[parent][0]<layout.positions[t.id][0]);
 }
 for(const id of ['Computer_Tech','Graviton_Tech'])assert.equal(layout.tiers[id],0);
 assert.throws(()=>createTechLayout([{id:'a',req:[['b',1]]},{id:'b',req:[['a',1]]}]),/循环/);
});

test('production uses shared stock and current planet requirements, with authoritative duration parity',()=>{
 const data=fixture();
 assert.ok(shipCapacity(units.Cruiser,data)>0,'local stock can be empty while shared warehouse funds production');
 assert.equal(shipBlockReason(units.Cruiser,1,data,false),'');
 for(const ship of Object.values(units))assert.equal(data.buildSeconds(ship),duration(ship,'ship',data.planet));
 for(const item of [...Object.values(tech),...Object.values(units)])assert.deepEqual(data.requirements(item).map(({id,level,current})=>({id,level,current})),prerequisites(item,data.planet,data.player).map(({id,level,current})=>({id,level,current})));
 data.planet.buildings.Shipyard=0;
 assert.equal(shipBlockReason(units.Cruiser,1,data,false),'前置条件未满足');
 assert.deepEqual(data.techCost('Energy_Tech'),data.planet.researchOptions.Energy_Tech.cost);
});

test('dome uniqueness, missile storage and parts constraints survive the new quantity controls',()=>{
 const data=fixture(),dome=units.Small_Shield_Dome,missile=units.Interplanetary_Missile;
 assert.equal(shipCapacity(dome,data),1);
 data.planet.defense.Small_Shield_Dome=1;assert.equal(shipCapacity(dome,data),0);
 data.planet.buildings.Missile_Silo=4;
 data.planet.defense.Interceptor_Missile=30;
 data.planet.shipQueue=[{id:'Interplanetary_Missile',remaining:3}];
 assert.equal(shipCapacity(missile,data),2);
 assert.equal(shipBlockReason(missile,3,data,false),'导弹储位不足');
 assert.equal(shipCapacity(units.Guardian,data),1);
 assert.ok(!data.ships.some(s=>s.id==='Guardian'||s.id==='Death_Star'));
 assert.equal(shipBlockReason(units.Cruiser,1.2,data,false),'请输入有效数量');
 assert.equal(shipBlockReason(units.Cruiser,1,data,true),'正在提交');
});

test('queue display follows server time and the selected planet without a local simulation',()=>{
 const data=fixture();data.planet.shipQueue=[{id:'Cruiser',start:1000,end:11000,each:10,remaining:3}];
 data.player.researchQueue={id:'Energy_Tech',planet:'other',level:11,start:1000,end:21000};
 const api={planet:data.planet,state:{player:data.player},now:6000,busy:false};
 const view=createView(api,{selectedShip:'Cruiser'});
 assert.equal(view.now,6000);assert.equal(view.queue[0].elapsed,5);
 assert.equal(view.research.elapsed,5);assert.equal(view.research.duration,20);assert.equal(view.research.planet,'other');
 assert.deepEqual(view.resources,data.planet.availableResources);
 assert.deepEqual(data.planet.shipQueue[0],{id:'Cruiser',start:1000,end:11000,each:10,remaining:3});
 data.planet.shipQueue[0].end=21000;data.planet.shipQueue[0].remaining=2;api.now=16000;
 assert.equal(createView(api,{}).queue[0].elapsed,5,'the next hull restarts its progress even though the batch start is unchanged');
});
