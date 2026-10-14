import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createResourceOperation} from '../opendesign/mockups/planet-construction-review/resource-operations.js';

function until(operation, predicate, limit = 80) {
  for (let i = 0; i < limit * 20; i++) {
    operation.update(.05);
    const state = operation.getState();
    if (predicate(state)) return state;
  }
  assert.fail('Operation did not reach the expected state');
}

test('both harvesters complete real outbound, gathering, loaded return and unloading cycles', () => {
  for (const kind of ['metal', 'crystal']) {
    const operation = createResourceOperation(kind), phases = [new Set(), new Set()];
    const loadedReturn = [false, false], emptyOutbound = [false, false], contacts = [false, false];
    for (let i = 0; i < 2400; i++) {
      operation.update(.05);
      operation.getState().agents.forEach((agent, index) => {
        phases[index].add(agent.phase);
        loadedReturn[index] ||= agent.phase === 'returning' && agent.cargo === 1;
        emptyOutbound[index] ||= agent.phase === 'outbound' && agent.cargo === 0;
        contacts[index] ||= agent.drillContact;
        assert(agent.cargo >= 0 && agent.cargo <= 1);
      });
    }
    for (let index = 0; index < 2; index++) {
      for (const phase of ['parked', 'outbound', 'loading', 'returning', 'unloading']) assert(phases[index].has(phase), `${kind} ${index} ${phase}`);
      assert(loadedReturn[index]); assert(emptyOutbound[index]);
      assert(operation.getState().agents[index].completedCycles >= 2);
      if (kind === 'crystal') assert(contacts[index]);
    }
    operation.dispose();
  }
});

test('crystal drill tip reaches the actual crystal surface, with work particles only during drilling', () => {
  const operation = createResourceOperation('crystal');
  const state = until(operation, state => state.agents[0].drillContact);
  const agent = state.agents[0], robot = operation.group.getObjectByName(agent.id);
  const arm = robot.getObjectByName('telescopic-drill');
  const origin = arm.localToWorld(new THREE.Vector3(0, 0, 0));
  const tip = arm.localToWorld(new THREE.Vector3(0, 0, .535));
  const direction = tip.clone().sub(origin).normalize();
  const intersections = new THREE.Raycaster(origin, direction).intersectObject(operation.group.getObjectByName('natural-resource-deposit'), true);
  assert(intersections.length > 0, 'there must be a physical crystal in front of the drill');
  assert(intersections[0].distance <= origin.distanceTo(tip) + .002, 'drill tip must contact the crystal');
  assert(origin.distanceTo(tip) - intersections[0].distance < .09, 'drill must not penetrate deeply');
  assert(operation.group.children[1].children.some(child => child.name === 'drill-contact-fragments' && child.visible));
  until(operation, state => state.agents.some(agent => agent.phase === 'returning') && state.agents.every(agent => !agent.drillContact));
  assert(operation.group.children[1].children.filter(child => child.name === 'drill-contact-fragments').every(child => !child.visible));
  operation.dispose();
});

test('low power runs at 30 percent speed independent of frame partition', () => {
  for (const kind of ['metal', 'crystal', 'gas']) {
    const normal = createResourceOperation(kind), slow = createResourceOperation(kind, {status: 'low-power'});
    normal.update(3);
    for (let i = 0; i < 100; i++) slow.update(.1);
    const a = normal.getState(), b = slow.getState();
    assert(Math.abs(a.elapsed - b.elapsed) < 1e-9);
    a.agents.forEach((agent, index) => {
      assert.equal(agent.phase, b.agents[index].phase);
      agent.position.forEach((value, axis) => assert(Math.abs(value - b.agents[index].position[axis]) < 1e-9));
    });
    if (a.pump) assert(Math.abs(a.pump.phase - b.pump.phase) < 1e-9);
    normal.dispose(); slow.dispose();
  }
});

test('single-lane dispatch prevents long-run collisions and both units deliver within one minute', () => {
  for (const kind of ['metal', 'crystal']) for (const storageBuilt of [true, false]) {
    const operation = createResourceOperation(kind); operation.setState({storageBuilt});
    let waited = false;
    for (let i = 0; i < 12000; i++) {
      operation.update(.05);
      const agents = operation.getState().agents;
      waited ||= agents.some(agent => agent.waitingReason === 'shared-lane-reserved');
      const distance = Math.hypot(agents[0].position[0] - agents[1].position[0], agents[0].position[2] - agents[1].position[2]);
      assert(distance >= .85, `${kind} requires separate vehicle envelopes, got ${distance}`);
      if (i === 1199 && storageBuilt) assert(agents.every(agent => agent.completedCycles >= 1), `${kind}: both units must complete within 60 seconds`);
    }
    assert(waited); operation.dispose();
  }
});

test('stopped, full and upgrading drain existing work and do not start new jobs', () => {
  for (const kind of ['metal', 'crystal']) for (const status of ['stopped', 'full', 'upgrading']) {
    const operation = createResourceOperation(kind);
    until(operation, state => state.agents.some(agent => agent.phase === 'returning'));
    operation.setState({status}); operation.update(100);
    const stopped = operation.getState();
    assert(stopped.agents.every(agent => agent.phase === 'parked' && agent.cargo === 0));
    operation.update(300);
    assert.deepEqual(operation.getState().agents, stopped.agents);
    operation.setState({status: 'running'}); operation.update(2);
    assert(operation.getState().agents.some(agent => agent.phase === 'outbound'));
    operation.dispose();
  }
});

test('warehouse changes redirect cargo continuously to the temporary depot', () => {
  for (const kind of ['metal', 'crystal']) {
    const operation = createResourceOperation(kind);
    until(operation, state => state.agents[0].phase === 'returning');
    const before = operation.getState().agents[0].position;
    operation.setState({storageBuilt: false});
    const after = operation.getState().agents[0];
    assert.deepEqual(after.position, before, 'switching destination must not teleport');
    assert.equal(after.destination, 'temporary-depot');
    operation.setState({status: 'stopped'}); operation.update(100);
    for (const agent of operation.getState().agents) {
      assert.equal(agent.phase, 'parked'); assert.equal(agent.cargo, 0); assert(agent.position[0] < -1.3);
    }
    assert(operation.group.getObjectByName('temporary-unloading-pad').visible);
    operation.dispose();
  }
});

test('unbuilt and construction retain geology but have no operating machines', () => {
  for (const kind of ['metal', 'crystal', 'gas']) {
    const operation = createResourceOperation(kind);
    operation.update(10);
    for (const status of ['unbuilt', 'construction']) {
      operation.setState({status}); operation.update(100);
      assert(operation.group.getObjectByName('natural-resource-deposit').visible);
      assert(!operation.group.getObjectByName('extraction-machinery').visible);
      assert(operation.getState().agents.every(agent => agent.phase === 'parked' && agent.cargo === 0));
    }
    operation.setState({status: 'running'}); operation.update(1);
    assert(operation.group.getObjectByName('extraction-machinery').visible);
    operation.dispose();
  }
});

test('gas pump, compressor and flow indicators animate and stop together', () => {
  const operation = createResourceOperation('gas');
  const a = operation.getState().pump; operation.update(.4); const b = operation.getState().pump;
  assert.notEqual(a.beamAngle, b.beamAngle); assert.notEqual(a.rodHeight, b.rodHeight); assert.notEqual(a.compressorAngle, b.compressorAngle);
  operation.setState({status: 'full'}); const stopped = operation.getState().pump; operation.update(20);
  assert.deepEqual(operation.getState().pump, stopped);
  operation.setState({status: 'running'}); operation.update(.3);
  assert(operation.getState().pump.running); assert(operation.getState().pump.phase > stopped.phase);
  operation.dispose();
});

test('scenery stays in its plot and units follow curved terrain with bounded draw calls', () => {
  const ground = (x, z) => -(x * x + z * z) / 90;
  for (const kind of ['metal', 'crystal', 'gas']) {
    const operation = createResourceOperation(kind, {ground});
    let meshes = 0; const geometries = new Set(), materials = new Set();
    operation.group.traverse(object => {
      if (object.isMesh) {meshes++; geometries.add(object.geometry); materials.add(object.material);}
    });
    assert(meshes < 90, `${kind} draw-call budget: ${meshes}`);
    assert(geometries.size < 15); assert(materials.size <= 12);
    for (let i = 0; i < 100; i++) {
      operation.update(.41);
      for (const agent of operation.getState().agents) {
        const [x, y, z] = agent.position;
        assert(Math.abs(y - ground(x, z) - .035) < 1e-8);
        assert(agent.position.every(Number.isFinite));
      }
      const bounds = new THREE.Box3().setFromObject(operation.group);
      assert(bounds.min.x >= -4 && bounds.max.x <= 4, `${kind} x bounds`);
      assert(bounds.min.z >= -2 && bounds.max.z <= 5.5, `${kind} z bounds`);
    }
    operation.dispose();
  }
});

test('disposing releases each owned GPU resource once and rejects invalid animation input', () => {
  const operation = createResourceOperation('metal');
  const resources = new Set();
  operation.group.traverse(object => {if (object.isMesh) {resources.add(object.geometry); resources.add(object.material);}});
  let released = 0;
  for (const resource of resources) resource.addEventListener('dispose', () => released++);
  assert.throws(() => operation.update(-1), /delta/); assert.throws(() => operation.update(NaN), /delta/);
  assert.throws(() => operation.setState({status: 'invented'}), /status/);
  operation.dispose(); operation.dispose(); operation.update(5);
  assert.equal(released, resources.size); assert.equal(operation.group.children.length, 0);
  assert(operation.getState().disposed);
  assert.throws(() => createResourceOperation('unknown'), /Unknown resource/);
});
