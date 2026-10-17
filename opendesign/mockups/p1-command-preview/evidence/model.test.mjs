import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,action,advance,buildQuote,stock,fleetQuote,makeTemplate,planEstimate,economy,units} from '../src/model.mjs';
const total=s=>s.planets.reduce((a,p)=>a.map((n,i)=>n+p.resources[i]),[0,0,0]);

test('construction pays shared inventory and cancellation restores the total',()=>{
 const s=fresh(),p=s.planets[0],before=total(s),q=buildQuote(s,p,'Metal_Mine');
 const started=action(s,{type:'build',id:'Metal_Mine'});
 assert.deepEqual(total(started),before.map((n,i)=>n-q.cost[i]));
 assert.equal(s.planets[0].build,null,'input must stay unchanged');
 const ended=action(started,{type:'cancelBuild'});
 assert.deepEqual(total(ended),before);assert.equal(ended.planets[0].paused,true);assert.equal(ended.planets[0].build,null);
});
test('insufficient resources never create a job or charge a different star system',()=>{
 const s=fresh();s.selected='demo-crystal';const before=total(s);
 const next=action(s,{type:'build',id:'Solar_Plant'});assert.equal(next.notice,'资源不足');assert.deepEqual(total(next),before);assert.equal(next.planets[2].build,null);
});
test('pausing a plan lets paid construction finish and prevents the next job',()=>{
 let s=action(fresh(),{type:'build',id:'Metal_Mine'});const level=s.planets[0].build.level;
 s.planets[0].paused=false;s=action(s,{type:'planPause'});s.speed=60;
 for(let i=0;i<100&&s.planets[0].build;i++)s=advance(s);
 assert.equal(s.planets[0].build,null);assert.equal(s.planets[0].buildings.Metal_Mine,level);assert.ok(s.planets[0].plan.length>0);
});
test('plan target addition, ordering and template application do not spend resources',()=>{
 let s=fresh(),before=total(s);s=action(s,{type:'planAdd',id:'Shipyard',level:10});
 const index=s.planets[0].plan.length-1;s=action(s,{type:'planMove',index,to:0});assert.equal(s.planets[0].plan[0].id,'Shipyard');
 s=action(s,{type:'template',ids:['demo-home','demo-gas'],template:'industry',growth:'incremental',mode:'append'});
 assert.deepEqual(total(s),before);assert.equal(s.planets[0].paused,true);assert.ok(s.planets[3].plan.some(x=>x.id==='Shipyard'));
 assert.ok(planEstimate(s.planets[3],s.planets[3].plan).upgrades>0);
});
test('templates account for committed work and finite growth targets',()=>{
 const p=fresh().planets[0];const items=makeTemplate(p,'resource','incremental');
 assert.ok(items.length>0);assert.ok(items.every(x=>x.level<=50));assert.ok(items.some(x=>x.id==='Metal_Mine'&&x.level>=17));
});
test('defense production pays once and increments the correct deployed unit',()=>{
 let s=fresh();const before=total(s),old=s.planets[0].defense.Plasma_Cannon||0;
 s=action(s,{type:'defense',id:'Plasma_Cannon',count:2});assert.deepEqual(total(s),before.map((n,i)=>n-2*units.Plasma_Cannon.cost[i]));s.speed=60;
 for(let i=0;i<100&&s.planets[0].defenseQueue.length;i++)s=advance(s);
 assert.equal(s.planets[0].defense.Plasma_Cannon,old+2);assert.equal(s.planets[0].defenseQueue.length,0);
 const invalid=action(s,{type:'defense',id:'Small_Shield_Dome',count:2});assert.deepEqual(invalid.planets,s.planets);
});
test('dispatch deducts fuel/cargo, removes ships, and recall returns them',()=>{
 let s=fresh();s.missions=[];const draft={task:'transport',target:'demo-gas',ships:{Large_Cargo_Ship:2},speed:75,cargo:[1000,2000,3000]},q=fleetQuote(s,s.planets[0],draft),before=total(s),owned=s.planets[0].ships.Large_Cargo_Ship;
 s=action(s,{type:'dispatch',draft});assert.equal(s.missions.length,1);assert.equal(s.planets[0].ships.Large_Cargo_Ship,owned-2);
 assert.deepEqual(total(s),before.map((n,i)=>n-draft.cargo[i]-(i===2?q.fuel:0)));
 s=action(s,{type:'recall',id:s.missions[0].id});assert.equal(s.missions[0].phase,'return');s.speed=60;s=advance(s);
 assert.equal(s.missions[0].phase,'completed');assert.equal(s.planets[0].ships.Large_Cargo_Ship,owned);
});
test('transport arrives, unloads and returns without returning cargo twice',()=>{
 let s=fresh();s.missions=[];s=action(s,{type:'dispatch',draft:{task:'transport',target:'demo-gas',ships:{Large_Cargo_Ship:1},speed:100,cargo:[1000,0,0]}});s.speed=60;
 for(let i=0;i<100&&s.missions[0].phase!=='return';i++)s=advance(s);
 assert.equal(s.missions[0].phase,'return');assert.deepEqual(s.missions[0].cargo,[0,0,0]);
 for(let i=0;i<100&&s.missions[0].phase!=='completed';i++)s=advance(s);
 assert.equal(s.planets[0].ships.Large_Cargo_Ship,6);
});
test('invalid and overloaded dispatches leave inventory unchanged',()=>{
 const s=fresh(),p=s.planets[0],draft={task:'transport',target:'demo-gas',ships:{Cargo_Ship:1},speed:100,cargo:[100000000,0,0]};
 assert.equal(fleetQuote(s,p,draft).reason,'装载超过货舱容量');const out=action(s,{type:'dispatch',draft});assert.deepEqual(out.planets,s.planets);assert.deepEqual(out.missions,s.missions);
 assert.equal(fleetQuote(s,p,{...draft,cargo:[0,0,0],ships:{Cargo_Ship:1.5}}).reason,'数量无效');
 assert.equal(fleetQuote(s,p,{...draft,cargo:[0,0,0],ships:{Solar_Satellite:1}}).reason,'数量无效');
});
test('fixtures cover low energy and paused time leaves state untouched',()=>{
 const s=fresh();assert.ok(s.planets.some(p=>economy(p).ratio<1));s.speed=0;assert.equal(advance(s),s);
});
