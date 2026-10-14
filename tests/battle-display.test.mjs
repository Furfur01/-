import test from 'node:test';
import assert from 'node:assert/strict';
import {groupBattleShips,visibleBattleShips} from '../game/battle-display.mjs';

test('distant representation preserves every member and expands without altering combat state',()=>{
 const metadata=Array.from({length:96},(_,id)=>({id,formation:`${Math.floor(id/32)}`,side:id<64?'attacker':'defender',owner:id<64?'a':'d',batch:Math.floor(id/32),type:'Light_Fighter',profile:{length:1}}));
 const rows=metadata.map(m=>[m.id,(m.id%8)*2,0,Math.floor(m.id/8)*2,0,0,100,10,-1,0]),before=JSON.stringify(rows),groups=groupBattleShips(metadata);
 const far=visibleBattleShips(groups,rows,{eye:[0,0,4000],pinned:[19]});
 assert.equal(far.alive,96);assert.equal(far.labels.reduce((n,g)=>n+g.count,0),96);assert.equal(far.visible.size,96);assert.ok(far.visible.has(19));
 const near=visibleBattleShips(groups,rows,{eye:[0,0,20],previous:far.levels});assert.equal(near.visible.size,96);assert.equal(JSON.stringify(rows),before);
 rows[19][6]=0;const after=visibleBattleShips(groups,rows,{eye:[0,0,4000],pinned:[19]});assert.equal(after.alive,95);assert.equal(after.visible.has(19),false);
 assert.equal(groups.length,3,'ownership and mission batches remain distinct');
});

test('display hysteresis prevents flickering near the expansion threshold',()=>{
 const group={key:'g',ids:[0,1,2,3,4,5],length:10},rows=group.ids.map(id=>[id,id,0,0,0,0,100]);
 const a=visibleBattleShips([group],rows,{eye:[0,0,2000]});assert.equal(a.levels.get('g'),'individual');
 const b=visibleBattleShips([group],rows,{eye:[0,0,3000],previous:a.levels});assert.equal(b.levels.get('g'),'far');
 const c=visibleBattleShips([group],rows,{eye:[0,0,2000],previous:b.levels});assert.equal(c.levels.get('g'),'far');
});
