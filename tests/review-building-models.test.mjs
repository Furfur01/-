import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createReviewBuilding } from '../opendesign/mockups/planet-construction-review/building-models.js';

const ids = [
  'Metal_Mine', 'Metal_Storage', 'Crystal_Mine', 'Crystal_Storage', 'Gas_Mine',
  'Gas_Storage', 'Command_Center', 'Solar_Plant', 'Fusion_Reactor', 'Robotics_Facility',
  'Shipyard', 'Research_Lab', 'Radar_Facility', 'Alliance_Depot', 'Nanite_Factory',
  'Terraformer', 'Missile_Silo',
];

test('all 17 review buildings are finite, grounded, detailed, and fit their slots', () => {
  const silhouettes = new Set();
  for (const id of ids) {
    const { group, height, footprint } = createReviewBuilding(id);
    const bounds = new THREE.Box3().setFromObject(group);
    assert(bounds.min.y >= -1e-6, `${id}: no buried geometry`);
    assert(height >= .6 && height <= 2, `${id}: visible building height ${height}`);
    assert(footprint[0] <= (id === 'Shipyard' ? 5.5 : 1.9), `${id}: slot width ${footprint[0]}`);
    assert(footprint[1] <= (id === 'Shipyard' ? 3.8 : 1.9), `${id}: slot depth ${footprint[1]}`);
    let drawCalls = 0, parts = 0;
    group.traverse(object => {
      assert(!object.isLight, 'buildings do not add expensive local lights');
      if (!object.isMesh) return;
      drawCalls++; parts += object.count;
      assert(object.isInstancedMesh);
      assert.equal(object.userData.building, id, 'every visible mesh supports picking');
      assert(object.geometry.userData.sharedReviewBuilding);
      assert(object.material.userData.sharedReviewBuilding);
      assert(object.material.emissiveIntensity === 1 && object.material.emissive.getHex() === 0, 'matte, unlit palette');
      assert(Array.from(object.instanceMatrix.array).every(Number.isFinite));
      assert(Array.from(object.geometry.attributes.position.array).every(Number.isFinite));
    });
    assert(drawCalls <= 15, `${id}: draw calls ${drawCalls}`);
    assert(parts >= 10, `${id}: recognizable functional detail`);
    assert(group.userData.features.length >= 3);
    silhouettes.add([parts, height.toFixed(3), ...footprint.map(n => n.toFixed(3))].join(':'));
  }
  assert.equal(silhouettes.size, ids.length, 'each building has a distinct silhouette');
});

test('animated mechanisms stay above ground and within the building slot through a full turn', () => {
  for (const id of ids) {
    const { group, animations } = createReviewBuilding(id);
    for (let step = 0; step < 32; step++) {
      for (const { mesh, axis, speed } of animations) {
        assert(mesh.parent); assert(['x', 'y', 'z'].includes(axis)); assert(Number.isFinite(speed));
        mesh.rotation[axis] = step / 32 * Math.PI * 2;
      }
      group.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(group), size = bounds.getSize(new THREE.Vector3());
      assert(bounds.min.y >= -1e-6, `${id}: animation must not go below ground`);
      assert(bounds.max.y < 2, `${id}: animation height`);
      assert(size.x <= (id === 'Shipyard' ? 5.5 : 1.9), `${id}: animation width`);
      assert(size.z <= (id === 'Shipyard' ? 3.8 : 1.9), `${id}: animation depth`);
    }
  }
});

test('rebuilding review scenes reuses GPU resources without sharing mutable scene objects', () => {
  const collect = group => {
    const meshes = []; group.traverse(object => { if (object.isMesh) meshes.push(object); }); return meshes;
  };
  for (const id of ids) {
    const first = createReviewBuilding(id), next = createReviewBuilding(id);
    const a = collect(first.group), b = collect(next.group);
    assert.notEqual(first.group, next.group);
    a.forEach((mesh, index) => {
      assert.notEqual(mesh, b[index]);
      assert.equal(mesh.geometry, b[index].geometry);
      assert.equal(mesh.material, b[index].material);
      assert.notEqual(mesh.instanceMatrix.array, b[index].instanceMatrix.array);
    });
  }
  assert.throws(() => createReviewBuilding('Unknown'), /Unknown review building/);
});

test('shipyard runway stays clear of parked shuttles and provides solid paving', () => {
  const { group } = createReviewBuilding('Shipyard');
  const { runway, fighterParking } = group.userData;
  assert.equal(fighterParking.length, 3);
  for (const [x, , z] of fighterParking) {
    assert(Math.abs(x) + .28 < 2.7);
    assert(z + .3 < runway.center[2] - runway.width / 2, 'parked craft clear the runway');
  }
  const raycaster = new THREE.Raycaster();
  for (const x of [-2.5, 0, 2.5]) for (const z of [.4, 1.35]) {
    raycaster.set(new THREE.Vector3(x, 3, z), new THREE.Vector3(0, -1, 0));
    assert(raycaster.intersectObject(group, true).length, 'runway has continuous paving');
  }
});
