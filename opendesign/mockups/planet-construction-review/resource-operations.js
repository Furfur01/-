import * as THREE from 'three';

// Review-only scenery. This module deliberately has no economy, network or save access.
const ACTIVE = new Set(['running', 'low-power']);
const STATUSES = new Set(['running', 'low-power', 'stopped', 'full', 'unbuilt', 'construction', 'upgrading']);
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));

export function createResourceOperation(kind, {ground = () => 0, status = 'running'} = {}) {
  if (!['metal', 'crystal', 'gas'].includes(kind)) throw new Error(`Unknown resource operation: ${kind}`);
  if (!STATUSES.has(status)) throw new Error(`Unknown operation status: ${status}`);
  const group = new THREE.Group();
  group.name = `resource-operation-${kind}`;
  group.userData.resourceOperation = kind;
  const scenery = new THREE.Group(), machinery = new THREE.Group();
  scenery.name = 'natural-resource-deposit'; machinery.name = 'extraction-machinery';
  group.add(scenery, machinery);
  const geometries = new Map(), materials = new Map(), batches = new Map();
  const units = [], flowLights = [];
  let storageBuilt = true, elapsed = 0, pumpPhase = 0, disposed = false, dispatchIndex = 0;
  let pumpBeam, pumpRod, compressor;
  const color = {metal: 0xe58b47, crystal: 0x66defa, gas: 0xa0e678}[kind];
  const palette = {
    white: {color: 0xdcd8c8, roughness: .65, metalness: .25},
    steel: {color: 0x586c79, roughness: .54, metalness: .72},
    dark: {color: 0x172733, roughness: .8, metalness: .25},
    orange: {color: 0xf3a042, roughness: .45, metalness: .4},
    glass: {color: 0x70a5b2, emissive: 0x147b9d, emissiveIntensity: .12, roughness: .3, metalness: .5},
    rock: {color: 0x5e5956, roughness: 1},
    rockLight: {color: 0x847263, roughness: .95},
    ore: {color, roughness: kind === 'crystal' ? .3 : .6, metalness: .35, emissive: color, emissiveIntensity: kind === 'crystal' ? .08 : .025},
    glow: {color, emissive: color, emissiveIntensity: .45, roughness: .4},
    paving: {color: 0x283440, roughness: .94},
    line: {color: 0xb6b7a2, roughness: .7},
    rubber: {color: 0x121a1c, roughness: 1}
  };
  function material(key) {
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial(palette[key]));
    return materials.get(key);
  }
  function geometry(key) {
    if (!geometries.has(key)) {
      let g;
      if (key === 'box') g = new THREE.BoxGeometry(1, 1, 1);
      else if (key === 'cylinder') g = new THREE.CylinderGeometry(1, 1, 1, 12);
      else if (key === 'sphere') g = new THREE.IcosahedronGeometry(1, 1);
      else if (key === 'rock') g = new THREE.IcosahedronGeometry(1, 0);
      else if (key === 'cone') g = new THREE.ConeGeometry(1, 1, 7);
      else if (key === 'shard') {
        g = new THREE.CylinderGeometry(.05, 1, 1, 5, 1);
        g.translate(0, .5, 0);
      } else if (key === 'wheel') {
        g = new THREE.CylinderGeometry(1, 1, 1, 12); g.rotateZ(Math.PI / 2);
      } else throw new Error(`Unknown geometry: ${key}`);
      geometries.set(key, g);
    }
    return geometries.get(key);
  }
  const transform = new THREE.Object3D();
  function part(parent, geo, mat, position, scale, rotation = [0, 0, 0]) {
    transform.position.set(...position); transform.scale.set(...scale); transform.rotation.set(...rotation); transform.updateMatrix();
    if (!batches.has(parent)) batches.set(parent, new Map());
    const bin = batches.get(parent), key = `${geo}/${mat}`;
    if (!bin.has(key)) bin.set(key, {geo, mat, matrices: []});
    bin.get(key).matrices.push(transform.matrix.clone());
  }
  function mesh(parent, geo, mat, position, scale, rotation = [0, 0, 0]) {
    const m = new THREE.Mesh(geometry(geo), material(mat));
    m.position.set(...position); m.scale.set(...scale); m.rotation.set(...rotation);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  const h = (x, z) => {
    const value = typeof ground === 'function' ? ground(x, z) : 0;
    return Number.isFinite(value) ? value : 0;
  };
  function surfacePart(parent, geo, mat, x, y, z, sx, sy, sz, rotation) {
    part(parent, geo, mat, [x, h(x, z) + y, z], [sx, sy, sz], rotation);
  }
  function beam(parent, a, b, width, mat = 'steel', round = false) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    transform.position.copy(start).add(end).multiplyScalar(.5);
    transform.quaternion.setFromUnitVectors(UP, end.clone().sub(start).normalize());
    transform.scale.set(width, start.distanceTo(end), width); transform.updateMatrix();
    const geo = round ? 'cylinder' : 'box', key = `${geo}/${mat}`;
    if (!batches.has(parent)) batches.set(parent, new Map());
    const bin = batches.get(parent);
    if (!bin.has(key)) bin.set(key, {geo, mat, matrices: []});
    bin.get(key).matrices.push(transform.matrix.clone());
  }
  function flush() {
    for (const [parent, bin] of batches) for (const {geo, mat, matrices} of bin.values()) {
      const m = new THREE.InstancedMesh(geometry(geo), material(mat), matrices.length);
      matrices.forEach((matrix, i) => m.setMatrixAt(i, matrix));
      m.name = `${kind}/${parent.name || 'detail'}/${geo}/${mat}`;
      m.castShadow = true; m.receiveShadow = true; parent.add(m);
    }
    batches.clear();
  }
  function path(points) {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) lengths.push(lengths.at(-1) + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    return {points, lengths, length: lengths.at(-1)};
  }
  function pointOn(route, fraction) {
    const distance = clamp(fraction) * route.length;
    let index = 1;
    while (index < route.lengths.length - 1 && route.lengths[index] < distance) index++;
    const a = route.points[index - 1], b = route.points[index];
    const t = clamp((distance - route.lengths[index - 1]) / Math.max(.0001, route.lengths[index] - route.lengths[index - 1]));
    return {x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, heading: Math.atan2(b[0] - a[0], b[1] - a[1])};
  }
  function road(points, width = .53) {
    const route = path(points), vertices = [], indices = [], steps = Math.ceil(route.length / .12);
    for (let i = 0; i <= steps; i++) {
      const p = pointOn(route, i / steps);
      const dx = Math.cos(p.heading) * width / 2, dz = -Math.sin(p.heading) * width / 2;
      for (const side of [-1, 1]) {
        const x = p.x + dx * side, z = p.z + dz * side;
        vertices.push(x, h(x, z) + .018, z);
      }
      if (i < steps) {const j = i * 2; indices.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);}
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setIndex(indices); g.computeVertexNormals();
    geometries.set(`road-${geometries.size}`, g);
    const m = new THREE.Mesh(g, material('paving')); m.receiveShadow = true; m.name = 'terrain-conforming-haul-road'; machinery.add(m);
    for (let distance = .3; distance < route.length - .2; distance += .55) {
      const p = pointOn(route, distance / route.length);
      surfacePart(machinery, 'box', 'line', p.x, .023, p.z, .035, .008, .22, [0, p.heading, 0]);
    }
  }
  function depotPosition(index, built = storageBuilt) {return [built ? 1.35 + index * .90 : -2.25 + index * .90, 1.56];}
  function placeUnit(unit, x, z, heading = unit.heading) {
    unit.heading = heading;
    unit.group.position.set(x, h(x, z) + .035, z);
    const step = .025;
    const normal = new THREE.Vector3(-(h(x + step, z) - h(x - step, z)) / (2 * step), 1, -(h(x, z + step) - h(x, z - step)) / (2 * step)).normalize();
    unit.group.quaternion.setFromUnitVectors(UP, normal).multiply(new THREE.Quaternion().setFromAxisAngle(UP, heading));
  }
  function outboundRoute(unit) {
    const [dx, dz] = depotPosition(unit.index), [wx, wz] = unit.work;
    return path([[unit.group.position.x, unit.group.position.z], [dx, 2.52], [.8 - unit.index * .08, 2.52], [wx, 2.39 + unit.index * .16], [wx, wz]]);
  }
  function returnRoute(unit, fromCurrent = false) {
    const [dx, dz] = depotPosition(unit.index), [wx, wz] = unit.work;
    const start = fromCurrent ? [unit.group.position.x, unit.group.position.z] : [wx, wz];
    unit.destination = storageBuilt ? 'warehouse' : 'temporary-depot';
    if (fromCurrent) return path([start, [start[0], Math.max(2.60, start[1])], [2.8, 3.13], [dx, 2.50], [dx, dz]]);
    return path([start, [start[0] + .44, Math.min(3.20, start[1] + .22)], [2.63 + unit.index * .17, 2.93 + unit.index * .20], [dx, 2.50], [dx, dz]]);
  }
  function beginPhase(unit, phase, route = null) {
    unit.phase = phase; unit.time = 0; unit.route = route;
    unit.duration = route ? route.length / (kind === 'metal' ? .72 : .62) : phase === 'loading' ? (kind === 'metal' ? 2.5 : 3.8) : 1.7;
  }
  function createTruck(index) {
    const body = new THREE.Group(); body.name = `haul-truck-${index + 1}`; machinery.add(body);
    part(body, 'box', 'steel', [0, .22, 0], [.48, .12, .74]);
    part(body, 'box', 'orange', [0, .39, .23], [.45, .27, .28]);
    part(body, 'box', 'glass', [0, .455, .378], [.34, .10, .012]);
    part(body, 'box', 'white', [0, .555, .23], [.48, .045, .32]);
    part(body, 'box', 'dark', [0, .355, -.17], [.40, .08, .42]);
    for (const x of [-.22, .22]) part(body, 'box', 'white', [x, .41, -.17], [.035, .18, .45]);
    part(body, 'box', 'white', [0, .41, -.395], [.45, .18, .035]);
    part(body, 'box', 'orange', [0, .29, .405], [.52, .055, .035]);
    for (const x of [-.165, .165]) {
      part(body, 'box', 'glow', [x, .36, .39], [.075, .05, .025]);
      part(body, 'box', 'orange', [x, .32, -.40], [.06, .055, .025]);
    }
    part(body, 'cylinder', 'steel', [-.18, .61, .12], [.018, .15, .018]);
    part(body, 'sphere', 'orange', [-.18, .705, .12], [.027, .025, .027]);
    const wheels = [];
    for (const x of [-.255, .255]) for (const z of [-.25, .235]) {
      const wheel = new THREE.Group(); wheel.position.set(x, .14, z); body.add(wheel); wheels.push(wheel);
      mesh(wheel, 'wheel', 'rubber', [0, 0, 0], [.095, .14, .14]);
      mesh(wheel, 'wheel', 'steel', [Math.sign(x) * .052, 0, 0], [.018, .072, .072]);
      part(wheel, 'box', 'orange', [Math.sign(x) * .064, 0, 0], [.012, .11, .035]);
    }
    const cargo = new THREE.Group(); cargo.name = 'visible-metal-cargo'; body.add(cargo);
    for (let i = 0; i < 7; i++) part(cargo, 'rock', 'ore', [(i % 3 - 1) * .11, .415 + Math.floor(i / 3) * .047, -.12 - Math.floor(i / 3) * .095], [.079, .079, .079], [i, i * .7, 0]);
    cargo.visible = false;
    const standbyLamp = mesh(body, 'sphere', 'orange', [.12, .604, .24], [.032, .028, .032]);
    standbyLamp.name = 'amber-standby-beacon';
    return {group: body, wheels, cargo, standbyLamp, legs: [], index, work: [-2.55 + index * .93, 3.22], heading: 0};
  }
  function createRobot(index) {
    const body = new THREE.Group(); body.name = `crystal-drilling-robot-${index + 1}`; machinery.add(body);
    part(body, 'box', 'steel', [0, .32, 0], [.30, .14, .32]);
    part(body, 'box', 'white', [0, .46, .055], [.33, .21, .25]);
    part(body, 'box', 'glass', [0, .485, .188], [.23, .06, .018]);
    part(body, 'box', 'orange', [0, .58, .055], [.29, .035, .22]);
    part(body, 'box', 'dark', [0, .40, -.22], [.28, .12, .20]);
    for (const x of [-.16, .16]) part(body, 'box', 'white', [x, .45, -.22], [.032, .22, .25]);
    part(body, 'cylinder', 'steel', [-.10, .68, -.01], [.013, .18, .013]);
    part(body, 'sphere', 'glow', [-.10, .775, -.01], [.025, .025, .025]);
    const legs = [];
    for (const x of [-.205, .205]) for (const z of [-.135, .14]) {
      const leg = new THREE.Group(); leg.position.set(x, .32, z); body.add(leg); legs.push(leg);
      part(leg, 'sphere', 'orange', [0, 0, 0], [.058, .058, .058]);
      part(leg, 'box', 'steel', [0, -.115, 0], [.065, .23, .07], [0, 0, Math.sign(x) * .16]);
      part(leg, 'box', 'white', [Math.sign(x) * .018, -.275, .025], [.12, .06, .20]);
    }
    const arm = new THREE.Group(); arm.name = 'telescopic-drill'; arm.position.set(0, .42, .20); body.add(arm);
    part(arm, 'box', 'orange', [0, 0, .05], [.16, .14, .20]);
    const shaft = mesh(arm, 'cylinder', 'steel', [0, 0, .235], [.047, .30, .047], [Math.PI / 2, 0, 0]);
    const drill = new THREE.Group(); drill.position.z = .39; arm.add(drill);
    mesh(drill, 'cone', 'steel', [0, 0, .072], [.075, .145, .075], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) part(drill, 'box', 'orange', [Math.sin(i * 2.1) * .038, Math.cos(i * 2.1) * .038, .01], [.025, .025, .075], [0, 0, i * 2.1]);
    const cargo = new THREE.Group(); cargo.name = 'visible-crystal-cargo'; body.add(cargo);
    for (let i = 0; i < 3; i++) part(cargo, 'shard', 'ore', [(i - 1) * .075, .41, -.23], [.055, .24, .055], [.16, i, -.12 * (i - 1)]);
    cargo.visible = false;
    const sparks = new THREE.Group(); sparks.name = 'drill-contact-fragments'; machinery.add(sparks);
    for (let i = 0; i < 7; i++) {
      mesh(sparks, 'rock', 'glow', [0, 0, 0], [.018, .027, .018]);
    }
    sparks.visible = false;
    const standbyLamp = mesh(body, 'sphere', 'orange', [.10, .615, .055], [.025, .025, .025]);
    standbyLamp.name = 'amber-standby-beacon';
    return {group: body, legs, wheels: [], cargo, arm, shaft, drill, sparks, standbyLamp, index, work: [-2.60 + index * 1.10, 3.06], heading: 0};
  }
  function deposit() {
    if (kind === 'metal') {
      for (let i = 0; i < 10; i++) {
        const x = -3.15 + (i % 5) * .56, z = 4.11 + Math.floor(i / 5) * .37;
        const size = .47 + Math.sin(i * 2.4) * .11;
        surfacePart(scenery, 'rock', i % 3 ? 'rock' : 'rockLight', x, size * .41, z, size, size * (1.25 + (i % 3) * .30), size * .78, [i * .7, i * 1.3, .1]);
        for (let seam = 0; seam < 3; seam++) surfacePart(scenery, 'box', 'ore', x + (seam - 1) * .10, .20 + seam * .15, z - size * .69, .06, .055, .32, [.2, .15, -.55]);
      }
      for (const x of [-2.55, -1.62]) {
        surfacePart(scenery, 'rock', 'ore', x, .16, 3.72, .35, .22, .24, [0, .4, 0]);
        for (const side of [-1, 1]) surfacePart(machinery, 'box', 'orange', x + side * .36, .31, 3.75, .055, .62, .055);
        surfacePart(machinery, 'box', 'steel', x, .62, 3.75, .77, .08, .12);
        surfacePart(machinery, 'box', 'white', x, .51, 3.70, .19, .20, .21);
      }
    } else if (kind === 'crystal') {
      for (let i = 0; i < 13; i++) {
        const x = -3.05 + (i % 5) * .45, z = 4.20 + Math.floor(i / 5) * .37;
        surfacePart(scenery, 'rock', 'rock', x, .08, z, .30, .20, .27, [0, i, .1]);
        surfacePart(scenery, 'shard', 'ore', x, .10, z, .12 + (i % 3) * .045, .55 + (i % 4) * .20, .13 + (i % 3) * .04, [Math.sin(i) * .24, i * 1.7, Math.cos(i) * .22]);
      }
      // Dedicated front faces line up with each robot's extended drill tip.
      for (const x of [-2.60, -1.50]) {
        surfacePart(scenery, 'rock', 'rock', x, .10, 3.95, .40, .25, .35);
        surfacePart(scenery, 'shard', 'ore', x, .15, 3.96, .31, .86, .31, [0, Math.PI / 5, 0]);
      }
    } else {
      for (let i = 0; i < 7; i++) surfacePart(scenery, 'rock', i % 2 ? 'rockLight' : 'rock', -3.2 + i * .37, .10, 4.6 + Math.sin(i) * .19, .30, .20, .29, [0, i, .1]);
    }
  }
  function pipe(points, radius = .065) {
    const coords = points.map(([x, z, y = .31]) => [x, h(x, z) + y, z]);
    for (let i = 1; i < coords.length; i++) {
      beam(machinery, coords[i - 1], coords[i], radius, 'steel', true);
      const a = coords[i - 1], b = coords[i], count = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / .58));
      for (let n = 1; n <= count; n++) {
        const t = n / (count + 1), x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t;
        surfacePart(machinery, 'box', 'white', x, .035, z, .24, .07, .20);
        beam(machinery, [x, h(x, z) + .04, z], [x, y - radius, z], .045);
        const light = mesh(machinery, 'sphere', 'glow', [x, y + radius * .70, z], [.027, .027, .027]);
        flowLights.push(light);
      }
    }
    for (const p of coords) part(machinery, 'sphere', 'orange', p, [radius * 1.35, radius * 1.35, radius * 1.35]);
  }
  function gasMachinery() {
    const x = -2.3, z = 3.72, y = h(x, z);
    surfacePart(machinery, 'box', 'white', x, .07, z, 1.75, .14, .78);
    surfacePart(machinery, 'cylinder', 'steel', x - .55, .31, z, .19, .52, .19);
    surfacePart(machinery, 'cylinder', 'orange', x - .55, .58, z, .25, .07, .25);
    for (const dz of [-.25, .25]) {
      beam(machinery, [x + .20, y + .15, z + dz], [x + .02, y + 1.07, z], .09, 'white');
      beam(machinery, [x - .20, y + .15, z + dz], [x + .02, y + 1.07, z], .09, 'white');
    }
    pumpBeam = new THREE.Group(); pumpBeam.position.set(x, y + 1.07, z); pumpBeam.name = 'rocking-pump-beam'; machinery.add(pumpBeam);
    part(pumpBeam, 'box', 'orange', [0, 0, 0], [1.37, .13, .17]);
    part(pumpBeam, 'box', 'dark', [.49, -.12, 0], [.33, .22, .25]);
    part(pumpBeam, 'box', 'white', [-.61, -.07, 0], [.18, .30, .22]);
    pumpRod = mesh(machinery, 'cylinder', 'steel', [x - .59, y + .68, z], [.024, .68, .024]); pumpRod.name = 'reciprocating-well-rod';
    compressor = new THREE.Group(); compressor.name = 'rotating-compressor'; compressor.position.set(.12, h(.12, 3.68) + .48, 3.68); machinery.add(compressor);
    for (let i = 0; i < 6; i++) part(compressor, 'box', 'white', [Math.sin(i * Math.PI / 3) * .22, Math.cos(i * Math.PI / 3) * .22, 0], [.075, .27, .07], [0, 0, -i * Math.PI / 3]);
    mesh(compressor, 'cylinder', 'orange', [0, 0, .01], [.09, .15, .09], [Math.PI / 2, 0, 0]);
    surfacePart(machinery, 'box', 'steel', .12, .13, 3.80, .78, .26, .54);
    surfacePart(machinery, 'box', 'white', .12, .50, 4.02, .82, .78, .15);
    surfacePart(machinery, 'cylinder', 'white', 1.13, .55, 3.75, .29, 1.08, .29);
    surfacePart(machinery, 'cylinder', 'orange', 1.13, 1.03, 3.75, .31, .06, .31);
    surfacePart(machinery, 'sphere', 'white', 1.13, 1.09, 3.75, .29, .16, .29);
    pipe([[-2.85, 3.72, .55], [-3.32, 3.72], [-3.32, 1.18], [-1.8, 1.18], [-1.8, .73, .31]]);
    pipe([[-1.36, .73], [-1.36, 1.48], [.12, 1.48], [.12, 3.33]]);
    pipe([[.12, 4.03, .44], [.65, 4.03, .44], [1.13, 4.03, .44], [1.13, 3.75, .44]]);
    pipe([[1.13, 3.5], [2.20, 3.5], [2.20, 1.18], [1.8, 1.18], [1.8, .73]]);
    for (const [tx, tz] of [[-3.32, 2.72], [2.20, 2.48]]) {
      surfacePart(machinery, 'cylinder', 'orange', tx, .46, tz, .028, .25, .028);
      surfacePart(machinery, 'cylinder', 'white', tx, .60, tz, .16, .035, .16);
      surfacePart(machinery, 'box', 'dark', tx, .625, tz, .21, .025, .025);
    }
  }
  deposit();
  const temporaryDepot = new THREE.Group(); temporaryDepot.name = 'temporary-unloading-pad'; machinery.add(temporaryDepot);
  surfacePart(temporaryDepot, 'box', 'steel', -1.8, .025, 1.53, 1.72, .05, .66);
  for (const x of [-2.60, -1.00]) surfacePart(temporaryDepot, 'box', 'orange', x, .065, 1.53, .06, .055, .66);
  temporaryDepot.visible = false;
  if (kind === 'gas') gasMachinery();
  else {
    road([[1.35, 1.20], [1.35, 2.52], [.75, 2.52], [-2.66, 2.39], [-2.66, 3.23]], .70);
    road([[-2.66, 3.23], [-2.16, 3.43], [2.74, 3.11], [2.25, 2.50], [2.25, 1.20]], .70);
    road([[1.35, 2.50], [2.74, 3.03]], .70);
    road([[-1.56, 2.45], [-1.56, 3.23]], .59);
    road([[-2.25, 1.20], [-2.25, 2.52], [.78, 2.52]], .58);
    road([[-1.35, 1.20], [-1.35, 2.52]], .58);
    for (const [x, z] of [[2.98, 1.77], [2.98, 3.0], [-3.02, 2.2], [-.18, 1.78]]) {
      surfacePart(machinery, 'cylinder', 'white', x, .24, z, .033, .48, .033);
      surfacePart(machinery, 'box', 'orange', x, .45, z, .08, .15, .08);
    }
    for (let index = 0; index < 2; index++) {
      const unit = kind === 'metal' ? createTruck(index) : createRobot(index);
      Object.assign(unit, {phase: 'parked', time: 0, duration: 0, cargoAmount: 0, completedCycles: 0, wait: index * 6.2, route: null, destination: 'warehouse', relocate: false});
      placeUnit(unit, ...depotPosition(index), 0); units.push(unit);
    }
  }
  flush();

  function advanceUnit(unit, dt) {
    let remaining = dt;
    // Time-slicing at phase boundaries keeps one large update equivalent to many frames.
    while (remaining > 1e-9) {
      if (unit.phase === 'parked') {
        // The shared haul road is a single-lane work zone. Alternating dispatch is
        // intentional: phase offsets alone eventually cause vehicles to collide.
        if (unit.wait > 0) {const step = Math.min(unit.wait, remaining); unit.wait -= step; remaining -= step; if (remaining <= 1e-9) break;}
        if (unit.index !== dispatchIndex) break;
        if (unit.relocate) {unit.relocate = false; beginPhase(unit, 'returning', returnRoute(unit, true));}
        else {
          if (!ACTIVE.has(status)) break;
          beginPhase(unit, 'outbound', outboundRoute(unit));
        }
      }
      const step = Math.min(remaining, unit.duration - unit.time);
      unit.time += step; remaining -= step;
      const progress = clamp(unit.time / unit.duration);
      if (unit.phase === 'outbound' || unit.phase === 'returning') {
        const p = pointOn(unit.route, progress); placeUnit(unit, p.x, p.z, p.heading);
      } else if (unit.phase === 'loading') {
        placeUnit(unit, ...unit.work, 0);
        unit.cargoAmount = kind === 'metal' ? progress : clamp((progress - .70) / .30);
      } else if (unit.phase === 'unloading') unit.cargoAmount = unit.unloadingCargo * (1 - progress);
      if (progress < 1) break;
      if (unit.phase === 'outbound') beginPhase(unit, 'loading');
      else if (unit.phase === 'loading') {unit.cargoAmount = 1; beginPhase(unit, 'returning', returnRoute(unit));}
      else if (unit.phase === 'returning') {unit.unloadingCargo = unit.cargoAmount; beginPhase(unit, 'unloading');}
      else if (unit.phase === 'unloading') {
        if (unit.unloadingCargo > .99) unit.completedCycles++;
        unit.cargoAmount = 0; unit.wait = .55; unit.phase = 'parked'; unit.route = null;
        placeUnit(unit, unit.group.position.x, unit.group.position.z, 0);
        dispatchIndex = 1 - unit.index;
      }
    }
  }
  function animateUnit(unit) {
    const walking = unit.phase === 'outbound' || unit.phase === 'returning';
    const progress = unit.duration ? clamp(unit.time / unit.duration) : 0;
    unit.cargo.visible = unit.cargoAmount > .025;
    unit.cargo.scale.y = Math.max(.01, unit.cargoAmount);
    unit.standbyLamp.visible = unit.phase === 'parked' && Math.sin(elapsed * 3.2 + unit.index) > -.25;
    for (const wheel of unit.wheels) wheel.rotation.x = walking ? -unit.time * 5.1 : wheel.rotation.x;
    unit.legs.forEach((leg, i) => {leg.rotation.x = walking ? Math.sin(unit.time * 10 + (i % 3 === 0 ? 0 : Math.PI)) * .31 : 0;});
    if (unit.arm) {
      const drilling = unit.phase === 'loading' && progress > .12 && progress < .72;
      const extension = unit.phase === 'loading' ? Math.min(clamp(progress / .12), clamp((.83 - progress) / .11)) : 0;
      unit.arm.scale.z = .45 + extension * .55;
      unit.drill.rotation.z = drilling ? unit.time * 35 : 0;
      unit.drillContact = drilling;
      unit.sparks.visible = drilling;
      unit.sparks.position.set(unit.work[0], h(...unit.work) + .46, unit.work[1] + .72);
      unit.sparks.children.forEach((shard, i) => {
        const t = (unit.time * 1.6 + i / 7) % 1;
        shard.position.set(Math.sin(i * 2.4) * t * .22, .07 * Math.sin(t * Math.PI) - t * .19, -t * .25);
        shard.rotation.set(t * 8, i + t * 3, t * 5); shard.scale.setScalar((1 - t) * .025 + .007);
      });
    }
  }
  function update(dt = 0) {
    if (disposed) return;
    if (!Number.isFinite(dt) || dt < 0) throw new Error('Animation delta must be finite and non-negative');
    const visible = status !== 'unbuilt' && status !== 'construction';
    machinery.visible = visible;
    if (!visible) return;
    const delta = dt * (status === 'low-power' ? .3 : 1);
    elapsed += delta;
    // A bounded simulation step gives dispatch the same behavior at 30/60 fps,
    // slow motion and after a long browser frame, without skipping other units.
    let remaining = delta;
    while (remaining > 1e-9) {
      const step = Math.min(.05, remaining);
      for (const unit of units) advanceUnit(unit, step);
      remaining -= step;
    }
    for (const unit of units) animateUnit(unit);
    if (kind === 'gas') {
      if (ACTIVE.has(status)) pumpPhase += delta;
      pumpBeam.rotation.z = Math.sin(pumpPhase * 2.1) * .20;
      pumpRod.position.y = h(-2.3, 3.72) + .68 - Math.sin(pumpPhase * 2.1) * .118;
      compressor.rotation.z = -pumpPhase * 4;
      flowLights.forEach((light, index) => {light.visible = ACTIVE.has(status) && ((pumpPhase * 5 - index) % 6 + 6) % 6 < 2.6;});
    }
    group.updateMatrixWorld(true);
  }
  function setState(next = {}) {
    if (disposed) return;
    if (next.status !== undefined) {
      if (!STATUSES.has(next.status)) throw new Error(`Unknown operation status: ${next.status}`);
      status = next.status;
      if (status === 'unbuilt' || status === 'construction') for (const unit of units) {
        unit.phase = 'parked'; unit.route = null; unit.cargoAmount = 0; unit.time = 0; unit.wait = unit.index * 6.2;
        unit.relocate = false; dispatchIndex = 0;
        placeUnit(unit, ...depotPosition(unit.index), 0);
        animateUnit(unit);
      }
    }
    if (next.storageBuilt !== undefined && storageBuilt !== Boolean(next.storageBuilt)) {
      storageBuilt = Boolean(next.storageBuilt); temporaryDepot.visible = !storageBuilt;
      for (const unit of units) {
        if (unit.phase === 'returning') beginPhase(unit, 'returning', returnRoute(unit, true));
        else if (unit.phase === 'parked' && Math.abs(unit.group.position.x - depotPosition(unit.index)[0]) > .2) unit.relocate = true;
      }
    }
    update(0);
  }
  function getState() {
    return {
      kind, status, storageBuilt, elapsed, disposed, dispatch: 'alternating-single-lane', speed: status === 'low-power' ? .3 : ACTIVE.has(status) ? 1 : 0,
      agents: units.map(unit => ({
        id: unit.group.name, phase: unit.phase, phaseProgress: unit.duration ? clamp(unit.time / unit.duration) : 0,
        cargo: unit.cargoAmount, position: unit.group.position.toArray(), heading: unit.heading,
        drillContact: Boolean(unit.drillContact), completedCycles: unit.completedCycles, destination: unit.destination,
        waitingReason: unit.phase !== 'parked' ? null : status === 'full' ? 'warehouse-full' : !ACTIVE.has(status) ? status : unit.index !== dispatchIndex ? 'shared-lane-reserved' : 'dispatch-countdown'
      })),
      pump: kind === 'gas' ? {phase: pumpPhase, running: ACTIVE.has(status), beamAngle: pumpBeam.rotation.z, rodHeight: pumpRod.position.y, compressorAngle: compressor.rotation.z} : null
    };
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    group.removeFromParent();
    group.traverse(object => {if (object.isInstancedMesh) object.dispose();});
    for (const g of geometries.values()) g.dispose();
    for (const m of materials.values()) m.dispose();
    group.clear();
  }
  setState({status});
  return {group, update, setState, getState, dispose};
}
