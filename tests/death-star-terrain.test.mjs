import test from 'node:test';
import assert from 'node:assert/strict';
import {DEATH_STAR,segmentHit,solidDistance,trenchPoint,landmark,createTurrets,turretCanFire,nearestContact,shellPatches,patchGeometry,surfacePoint,detailLevel,localMachinery,dishPoint,DISH_DIRECTION,add,mul,ellipsoidContact,emitterObstacles,turretObstacle} from '../game/death-star-terrain.mjs';
test('target contacts return the first fraction, never a boolean or the closest-point fraction',()=>{
 assert.equal(ellipsoidContact([-10,0,0],[10,0,0],[0,0,0],[2,2,2]),.4);
 assert.equal(ellipsoidContact([-10,3,0],[10,3,0],[0,0,0],[2,2,2]),null);
 assert.equal(ellipsoidContact([0,0,0],[10,0,0],[0,0,0],[2,2,2]),0);
});
test('emitter housings and fixed turrets block swept ships',()=>{
 const emitter=emitterObstacles[0],from=add(emitter.center,mul(DISH_DIRECTION,200));assert.ok(segmentHit(from,emitter.center,.5)!==null);
 const t=createTurrets()[0],box=turretObstacle(t);assert.ok(segmentHit(add(t.pos,[0,30,0]),t.pos,.5,[box])!==null);
});
test('death star scale and four landmarks stay outside solid terrain',()=>{
 assert.equal(DEATH_STAR.radius,10000);assert.equal(DEATH_STAR.routeLength/35,60);
 for(const name of ['overview','surface','trench','dish'])assert.ok(solidDistance(landmark(name).pos)>1,name);
});
test('equatorial opening, floor and walls have independent continuous collisions',()=>{
 assert.equal(segmentHit(trenchPoint(0,0,9950),trenchPoint(.02,0,9950)),null);
 assert.ok(segmentHit([0,9950,0],[0,9800,0])!==null,'floor');
 assert.ok(segmentHit([0,9950,0],[0,9950,90])!==null,'wall');
 assert.equal(segmentHit([0,10010,0],[0,10010,90]),null,'above lip');
 assert.ok(segmentHit([0,9950,0],[0,9950,1000],.5)!==null,'boost swept sphere');
 assert.ok(segmentHit([0,30000,200],[0,-30000,200])!==null,'long laser crossing both sides');
});
test('concave dish is open and blocks projectiles at the recessed floor',()=>{
 const p=dishPoint(1000,0),a=add(p,mul(DISH_DIRECTION,2200)),b=add(p,mul(DISH_DIRECTION,5));
 assert.equal(segmentHit(a,b),null);
 assert.ok(segmentHit(a,add(p,mul(DISH_DIRECTION,-10)))!==null);
});
test('nearest contact selects visible targets before terrain and rejects targets behind walls',()=>{
 const a=[0,9950,0],b=[0,9950,120],hit=nearestContact(a,b,[{f:.9}],(a,b,t)=>t.f);
 assert.equal(hit.target,null);assert.ok(Math.abs(hit.fraction-.5)<.001);
 const visible={f:.1};assert.equal(nearestContact(a,b,[{f:.9},visible],(a,b,t)=>t.f).target,visible);
});
test('turrets are deterministic, stationary, and cannot see through armor',()=>{
 const turrets=createTurrets();assert.equal(turrets.length,6);assert.deepEqual(turrets,createTurrets());
 const t=turrets[0];assert.equal(turretCanFire(t,add(t.pos,[0,20,20])),true);
 assert.equal(turretCanFire(t,add(t.pos,[0,0,-180])),false);
 t.hp=0;assert.equal(turretCanFire(t,add(t.pos,[0,20,-20])),false);
});
test('adjacent patch boundaries are shared and finite at different detail levels',()=>{
 const patches=shellPatches(),a=patches[0],b=patches[1];assert.equal(a.a1,b.a0);
 for(let i=0;i<=4;i++)assert.deepEqual(surfacePoint(a.a1,a.b0+(a.b1-a.b0)*i/4),surfacePoint(b.a0,b.b0+(b.b1-b.b0)*i/4));
 for(const n of [4,16,32]){const mesh=patchGeometry(a,n);assert.ok(mesh.data.every(Number.isFinite));assert.equal(mesh.data.length/18,n*n*2+n*8);}
 const p=patches.find(p=>p.id==='1:0:0');assert.equal(detailLevel(p,[0,30000,0],1080,1),4);
 assert.equal(detailLevel(p,surfacePoint((p.a0+p.a1)/2,(p.b0+p.b1)/2,10010),1080,1),32);
});
test('local high detail stays bounded and simplified boxes participate in collision',()=>{
 const pos=landmark('surface').pos,boxes=localMachinery(pos);assert.ok(boxes.length>100&&boxes.length<=625);assert.deepEqual(boxes,localMachinery(pos));
 const box=boxes[0],a=add(box.center,mul(box.axes[1],20));assert.ok(segmentHit(a,box.center,0,[box])!==null);
 assert.equal(localMachinery(landmark('overview').pos).length,0);
});
