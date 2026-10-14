import test from 'node:test';
import assert from 'node:assert/strict';
import {geometryFromNative} from '../scripts/three-flight/shared-resources.js';
import {ShipModelCache} from '../scripts/three-flight/shared-models.js';
import {freezeWebGLBaseline} from '../scripts/freeze-webgl-baseline.mjs';

test('native vertex layout preserves hull positions, normals, color and material tags',()=>{
  const data=new Float32Array([1,2,3,0,1,0,.2,.4,.6,.8,2,-5,0]);
  const geometry=geometryFromNative(data);
  assert.equal(geometry.getAttribute('position').getZ(0),3);
  assert.equal(geometry.getAttribute('aNormal').getY(0),1);
  assert.equal(geometry.getAttribute('aTag').getX(0),2);
  assert.equal(geometry.getAttribute('aUV').getX(0),-5);
  assert.equal(geometry.getAttribute('position').data.array,data);
  geometry.dispose();
});

test('releasing a viewer instance does not dispose cached geometry or other instance materials',()=>{
  const cache=new ShipModelCache(),first=cache.acquire('Light_Fighter'),second=cache.acquire('Light_Fighter');
  let a,b;first.traverse(o=>{if(!a&&o.isMesh)a=o;});second.traverse(o=>{if(!b&&o.isMesh)b=o;});
  assert.equal(a.geometry,b.geometry);assert.notEqual(a.material,b.material);
  let disposals=0;a.geometry.addEventListener('dispose',()=>disposals++);
  a.material.wireframe=true;assert.notEqual(a.material.wireframe,b.material.wireframe);
  cache.release(first);assert.equal(disposals,0);assert.equal(cache.instances.size,1);
  cache.dispose();assert.equal(disposals,1);assert.equal(cache.models.size,0);
});

test('frozen WebGL baseline verifies its own immutable resource hashes',()=>{
  const baseline=freezeWebGLBaseline();
  assert.equal(baseline.version,'webgl-before-three-20261015');
  assert.ok(baseline.files['flight-fleet.bin'].sha256);
  assert.ok(baseline.files['sky/multi-nebulae-2-rgbm.png'].sha256);
});
