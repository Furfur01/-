import test from 'node:test';
import assert from 'node:assert/strict';
import {speedFovOffset,smoothSpeedFov} from '../game/flight-camera.mjs';

test('speed lens widens continuously through cruise and boost, capped for autonomous missiles',()=>{
  for(const [max,capital]of[[75,true],[120,true],[280,false]]){
    assert.equal(speedFovOffset(0,max,capital),0);
    assert.equal(speedFovOffset(max,max,capital),9);
    assert.equal(speedFovOffset(max*(capital?1.65:2.2),max,capital),17);
    assert.equal(speedFovOffset(2000,max,capital),17);
    let previous=0;for(let speed=0;speed<max*3;speed+=.5){const value=speedFovOffset(speed,max,capital);assert.ok(value>=previous&&value<=17);previous=value;}
  }
});
test('lens eases on acceleration and deceleration without frame-rate dependence',()=>{
  for(const target of[0,17]){
    const start=17-target,step=smoothSpeedFov(start,target,1/60);
    assert.ok(step>0&&step<17);
    for(const fps of[30,60,144]){
      let value=start;for(let i=0;i<fps;i++)value=smoothSpeedFov(value,target,1/fps);
      assert.ok(Math.abs(value-smoothSpeedFov(start,target,1))<1e-10);
    }
  }
});
