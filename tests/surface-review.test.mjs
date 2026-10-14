import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDINGS,districts,ground,sampleSurface,DISTRICT_RADIUS} from '../opendesign/mockups/planet-construction-review/surface-layout.js';
import * as THREE from 'three';
test('all seventeen buildings have unique fixed sites across fourteen evenly distributed districts',()=>{
  assert.equal(BUILDINGS.length,17);assert.equal(districts.length,14);
  const ids=districts.flatMap(d=>d.buildings.map(b=>b.id));assert.equal(new Set(ids).size,17);
  const center=new THREE.Vector3();
  for(const d of districts){const n=new THREE.Vector3(...d.direction);assert(Math.abs(n.length()-1)<1e-10);center.add(n);
    for(const other of districts)if(other!==d)assert(n.angleTo(new THREE.Vector3(...other.direction))>.70,'district centers must be at least 40 degrees apart');
    assert(Math.abs(sampleSurface(d.direction).radius-DISTRICT_RADIUS)<1e-9);
  }
  assert(center.length()/14<.025,'distribution must cover both hemispheres');
  assert.deepEqual(ids.slice().sort(),BUILDINGS.map(b=>b[0]).sort());
});
test('district work areas use the same curved surface as the planet terrain',()=>{
  for(const d of districts){const n=new THREE.Vector3(...d.direction),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n);
    for(const [x,z]of [[0,0],[-3,4],[3,4],[-2,-2],[1.8,0]]){
      const point=new THREE.Vector3(x,ground(x,z),z).applyQuaternion(q).add(n.clone().multiplyScalar(DISTRICT_RADIUS));
      const radial=point.length(),s=sampleSurface(point.clone().normalize().toArray());
      assert(Math.abs(radial-s.radius)<.015,'site foundation and ground must coincide');
    }
  }
});
