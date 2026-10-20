import { cubeDirection, directionFaceUV, surfaceNormal } from './cube.js';
import { hashSeed } from './noise.js';
import { QUALITY, qualityConfig } from './config.js';
import {TREE_HEIGHT_UNITS} from '../aurora-district-layout.js';

const CELL_LEVEL = 7;
const CELL_COUNT = 2 ** CELL_LEVEL;
const CELL_SPAN = 2 / CELL_COUNT;
const CANDIDATES_PER_CELL = 256;
const CACHE_CELLS = 42;
const PERMANENT_LIMIT = { low: 80, standard: 220, high: 400 };
const normalize = (a) => {
  const r = 1 / Math.hypot(a[0], a[1], a[2]);
  return [a[0] * r, a[1] * r, a[2] * r];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const advance = (p, t, a) => normalize([p[0] + t[0] * a, p[1] + t[1] * a, p[2] + t[2] * a]);
const clock = () => performance.now();
function hashNumber(x) {
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}
function randomAt(key, index) { return hashNumber(key ^ Math.imul(index + 1, 0x9e3779b1)) / 4294967296; }

function crystalGeometry(THREE) {
  // Closed six-sided prism with an uneven shoulder and a genuine faceted point.
  const positions = [], normals = [];
  const rings = [];
  for (let j = 0; j < 2; j++) {
    const ring = [];
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, r = j ? 0.25 + (i % 2) * 0.07 : 0.43;
      ring.push([Math.cos(a) * r + (j ? .075 : 0), j ? 0.54 + (i % 3) * 0.085 : 0, Math.sin(a) * r]);
    }
    rings.push(ring);
  }
  const tip = [0.19, 1, -0.075];
  function triangle(a, b, c) {
    const n = normalize(cross([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]));
    positions.push(...a, ...b, ...c); normals.push(...n, ...n, ...n);
  }
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    triangle(rings[0][i], rings[1][i], rings[0][next]);
    triangle(rings[0][next], rings[1][i], rings[1][next]);
    triangle(rings[1][i], tip, rings[1][next]);
    triangle([0, 0, 0], rings[0][i], rings[0][next]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function createMaterial(THREE, radius, crystal, nearOnly) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRadius: { value: radius }, uCrystal: { value: crystal ? 1 : 0 }, uNear: { value: nearOnly ? 1 : 0 },
      uSun: { value: new THREE.Vector3(0.5, 0.5, 1).normalize() }, uEye: { value: new THREE.Vector3() },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vP,vN,vColor,vLocal;
      varying float vShape;
      void main(){
        mat3 im=mat3(instanceMatrix);
        vec3 n=normal/vec3(dot(im[0],im[0]),dot(im[1],im[1]),dot(im[2],im[2]));
        vN=normalize(im*n);
        vec4 p=instanceMatrix*vec4(position,1.);
        vP=p.xyz;vShape=position.y;vLocal=position;
        #ifdef USE_INSTANCING_COLOR
          vColor=instanceColor;
        #else
          vColor=vec3(1.);
        #endif
        gl_Position=projectionMatrix*modelViewMatrix*p;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uRadius;
      uniform int uCrystal,uNear;
      uniform vec3 uSun,uEye;
      varying vec3 vP,vN,vColor,vLocal;
      varying float vShape;
      void main(){
        #include <logdepthbuf_fragment>
        float distance=length(uEye-vP)/uRadius;
        if(uNear>0){
          float fade=uNear==2 ? 1.-smoothstep(.035,.08,distance) : uCrystal==1 ? 1.-smoothstep(.004,.014,distance) : 1.-smoothstep(.002,.009,distance);
          float dither=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
          if(dither>fade)discard;
        }
        vec3 n=normalize(vN),view=normalize(uEye-vP),radial=normalize(vP);
        float day=smoothstep(-.11,.07,dot(radial,uSun));
        float light=max(0.,dot(n,uSun))*day;
        vec3 col=vColor*(vec3(.060,.073,.092)+light*vec3(1.30,1.19,1.04));
        if(uCrystal==1){
          float fres=pow(1.-max(0.,dot(n,view)),3.);
          float spec=pow(max(0.,dot(n,normalize(uSun+view))),92.)*day;
          float core=pow(smoothstep(.02,.92,vShape),2.);
          float seam=pow(.5+.5*sin(dot(vLocal,vec3(38.,2.,27.))),18.);
          col+=vec3(.012,.14,.28)*core+vec3(.09,.50,.95)*fres*.80;
          col+=vec3(.32,.75,1.10)*spec+vec3(.018,.15,.30)*seam*.24;
        }
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Bounded, camera-near instancing. No RAF, renderer, DOM, workers or external assets.
 * Positions are fixed by seed + canonical level-7 cube cell + candidate index.
 * Quality changes select a budget-limited subset; they never move an existing anchor.
 */
export function createDecorations({ THREE, field, type, seed, radius, quality = 'standard' }) {
  qualityConfig(quality);
  const root = new THREE.Group(); root.name = `${type}-decorations`;
  const rocksRoot = new THREE.Group(); rocksRoot.name = 'near-rocks';
  const crystalRoot = new THREE.Group(); crystalRoot.name = 'crystals';
  root.add(rocksRoot, crystalRoot);
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rockPositions = rockGeometry.getAttribute('position');
  // The single shared rock primitive is irregular, with small flat faces.
  for (let i = 0; i < rockPositions.count; i++) {
    const x = rockPositions.getX(i), y = rockPositions.getY(i), z = rockPositions.getZ(i);
    const f = 0.91 + 0.09 * Math.sin(x * 11.4 + y * 7.2 - z * 6.7);
    rockPositions.setXYZ(i, x * f, (y * 0.58 + 0.42) * f, z * f);
  }
  rockGeometry.computeVertexNormals(); rockGeometry.computeBoundingSphere();
  const crystalGeo = crystalGeometry(THREE);
  const treeGeometry=new THREE.ConeGeometry(.31,1,6);treeGeometry.translate(0,.5,0);
  const rockMaterial = createMaterial(THREE, radius, false, true);
  const shardMaterial = createMaterial(THREE, radius, true, true);
  const majorMaterial = createMaterial(THREE, radius, true, false);
  const treeMaterial=createMaterial(THREE,radius,false,true);treeMaterial.uniforms.uNear.value=2;
  const maxInstances = QUALITY.high.detailInstances;
  function meshFor(geometry, material, capacity, name) {
    const mesh = new THREE.InstancedMesh(geometry, material, capacity);
    mesh.name = name; mesh.count = 0; mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3).fill(1), 3);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    return mesh;
  }
  const rocks = meshFor(rockGeometry, rockMaterial, maxInstances, 'surface-boulders');
  const shards = meshFor(crystalGeo, shardMaterial, maxInstances, 'near-vein-crystals');
  const major = meshFor(crystalGeo, majorMaterial, PERMANENT_LIMIT.high, 'canyon-crystal-spines');
  const trees=meshFor(treeGeometry,treeMaterial,maxInstances,'aurora-small-forest');root.add(trees);
  rocksRoot.add(rocks); crystalRoot.add(major, shards);
  const materials = [rockMaterial, shardMaterial, majorMaterial,treeMaterial];
  const meshState = { rock: { mesh: rocks, records: [] }, crystal: { mesh: shards, records: [] },tree:{mesh:trees,records:[]} };
  const active = new Map(), cells = new Map();
  let desired = [], desiredKeys = new Set(), activation = [], removal = [];
  let activationCursor = 0, removalCursor = 0, roundRobin = 0, stamp = 0;
  let disposed = false, close = false, lastAnchor = '', lastDirection = null;
  let generationMs = 0, generationMaxMs = 0;
  let config = qualityConfig(quality), totalBudget = config.detailInstances;
  let majorLimit = type === 'mars' ? PERMANENT_LIMIT[quality] : 0;
  let nearBudget = totalBudget - majorLimit;
  const seedHash = hashSeed(`${seed}:${type}:surface-instances`);
  const tempPosition = new THREE.Vector3(), tempNormal = new THREE.Vector3(), tempScale = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), spin = new THREE.Quaternion(), lean = new THREE.Quaternion();
  const orientation = new THREE.Quaternion(), matrix = new THREE.Matrix4();
  const localX = new THREE.Vector3(1, 0, 0), veinAxisLocal = new THREE.Vector3();
  const majorRecords = [];

  function matrixRecord(direction, sample, key, kind, giant = false) {
    const r1 = randomAt(key, 0), r2 = randomAt(key, 1), r3 = randomAt(key, 2), r4 = randomAt(key, 3);
    const ridge = giant && typeof giant === 'object' ? giant : null;
    const n = kind === 'rock' ? surfaceNormal(field, ...direction, 0.00004) : direction;
    tempNormal.set(...n);
    orientation.setFromUnitVectors(up, tempNormal);
    if (ridge?.tangent) {
      // A coherent growth/lean plane follows the mineral fracture. The local
      // +Z direction is aligned with the traced vein before the lean is added.
      veinAxisLocal.set(...ridge.tangent).applyQuaternion(orientation.clone().invert());
      spin.setFromAxisAngle(up, Math.atan2(veinAxisLocal.x, veinAxisLocal.z) + (r1 - 0.5) * 4.8);
    } else spin.setFromAxisAngle(up, r1 * Math.PI * 2);
    lean.setFromAxisAngle(localX, ridge?.tier === 'primary' ? (r2 - .5) * .85 : kind === 'crystal' ? (r2 - 0.5) * (giant ? 1.4 : 1.1) : (r2 - 0.5) * 0.3);
    orientation.multiply(spin).multiply(lean);
    let scale;
    if(kind==='tree'){
      scale=radius/1600*(TREE_HEIGHT_UNITS[0]+r3*(TREE_HEIGHT_UNITS[1]-TREE_HEIGHT_UNITS[0]));tempScale.set(scale,scale,scale);
    } else if (kind === 'rock') {
      scale = radius * (0.00002 + 0.00018 * r3 * r3 * r3);
      tempScale.set(scale * (0.68 + r2 * 0.64), scale * (0.58 + r4 * 0.7), scale * (0.72 + r1 * 0.6));
    } else if (ridge) {
      let width;
      if (ridge.tier === 'primary') {
        const prominence = ridge.prominence ?? 1;
        scale = radius * (.012 + prominence * .019 + r3 * .004);
        width = radius * (.004 + prominence * .0035 + r4 * .0020);
      } else if (ridge.tier === 'shoulder') {
        scale = radius * (.004 + .013 * r3 * r3);
        width = radius * (.0014 + .0024 * r4);
      } else {
        scale = radius * (0.0010 + 0.0036 * r3 * r3);
        width = scale * (0.20 + r4 * 0.23);
      }
      // The base prism spans 0.86 units. Width here means its actual diameter,
      // rather than the transform scale, so the promised R fractions are clear.
      tempScale.set(width / 0.86, scale, width / 0.86 * (0.80 + r2 * 0.20));
    } else {
      scale = radius * (giant ? 0.0011 + 0.0068 * r3 * r3 : 0.00015 + 0.0011 * r3 * r3);
      const slender = giant ? 0.20 + r4 * 0.27 : 0.20 + r4 * 0.45;
      tempScale.set(scale * slender, scale, scale * slender * (0.72 + r2 * 0.48));
    }
    const embed = kind === 'rock' ? 0.000010 : giant ? 0.000065 : 0.000015;
    tempPosition.set(...direction).multiplyScalar(radius * (1 + sample.height - embed));
    matrix.compose(tempPosition, orientation, tempScale);
    const tint = kind==='tree'?[.045+r4*.04,.22+r4*.14,.10+r4*.04]:kind === 'rock'
      ? sample.color.map((v) => Math.max(0.02, v * (0.66 + r4 * 0.28)))
      : [.009 + r4 * .012, .070 + r4 * .075, .12 + r4 * .13];
    return { matrix: new Float32Array(matrix.elements), tint, kind, direction,
      ridgeTier: ridge?.tier || null, crystalStrength: sample.crystal || 0 };
  }

  function writeRow(mesh, slot, record) {
    mesh.instanceMatrix.array.set(record.matrix, slot * 16);
    mesh.instanceColor.array.set(record.tint, slot * 3);
    mesh.instanceMatrix.addUpdateRange(slot * 16, 16);
    mesh.instanceColor.addUpdateRange(slot * 3, 3);
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  }
  function insert(record) {
    if (active.has(record.id) || !desiredKeys.has(record.cellKey) || active.size >= nearBudget) return;
    const state = meshState[record.kind], slot = state.records.length;
    writeRow(state.mesh, slot, record); state.records.push(record); state.mesh.count = state.records.length;
    active.set(record.id, { kind: record.kind, slot, cellKey: record.cellKey });
  }
  function remove(id) {
    const old = active.get(id); if (!old) return;
    const state = meshState[old.kind], last = state.records.pop();
    if (old.slot < state.records.length) {
      state.records[old.slot] = last; writeRow(state.mesh, old.slot, last);
      active.get(last.id).slot = old.slot;
    }
    state.mesh.count = state.records.length; active.delete(id);
  }

  function chooseCells(direction) {
    const [face, u, v] = directionFaceUV(...direction);
    const ix = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((u + 1) * CELL_COUNT / 2)));
    const iy = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((v + 1) * CELL_COUNT / 2)));
    const anchor = `${face}/${ix}/${iy}`;
    if (anchor === lastAnchor && lastDirection && dot(lastDirection, direction) > 0.999992) return;
    lastAnchor = anchor; lastDirection = direction.slice();
    const found = new Map();
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const d = cubeDirection(face, -1 + (ix + ox + 0.5) * CELL_SPAN, -1 + (iy + oy + 0.5) * CELL_SPAN);
      const [f, cu, cv] = directionFaceUV(...d);
      const cx = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((cu + 1) * CELL_COUNT / 2)));
      const cy = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((cv + 1) * CELL_COUNT / 2)));
      const key = `${f}/${cx}/${cy}`;
      let cell = cells.get(key);
      if (!cell) {
        cell = { key, face: f, x: cx, y: cy, cursor: 0, records: [], stamp,
          hash: hashNumber(seedHash ^ Math.imul(f + 1, 131071) ^ Math.imul(cx + 1, 65537) ^ Math.imul(cy + 1, 8191)) };
        cells.set(key, cell);
      }
      cell.stamp = stamp; cell.proximity = dot(d, direction); found.set(key, cell);
    }
    desired = [...found.values()].sort((a, b) => b.proximity - a.proximity);
    desiredKeys = new Set(desired.map((c) => c.key));
    removal = [...active].filter(([, value]) => !desiredKeys.has(value.cellKey)).map(([id]) => id); removalCursor = 0;
    // Interleave cached cells so a lower budget still distributes its stable anchors across the neighborhood.
    activation = []; activationCursor = 0;
    const mostRecords = Math.max(0, ...desired.map((c) => c.records.length));
    for (let i = 0; i < mostRecords; i++) for (const cell of desired) if (cell.records[i]) activation.push(cell.records[i]);
    if (cells.size > CACHE_CELLS) {
      const evictable = [...cells.values()].filter((c) => !desiredKeys.has(c.key)).sort((a, b) => a.stamp - b.stamp);
      while (cells.size > CACHE_CELLS && evictable.length) cells.delete(evictable.shift().key);
    }
  }

  function generateCandidate(cell) {
    if (cell.cursor >= CANDIDATES_PER_CELL) return;
    const index = cell.cursor++, key = hashNumber(cell.hash ^ Math.imul(index + 1, 104729));
    // A permuted jittered 16 x 16 lattice gives stable, reasonably even prefixes.
    const lattice = (index * 73 + (cell.hash & 255)) & 255;
    const uu = -1 + (cell.x + ((lattice & 15) + 0.12 + randomAt(key, 4) * 0.76) / 16) * CELL_SPAN;
    const vv = -1 + (cell.y + ((lattice >>> 4) + 0.12 + randomAt(key, 5) * 0.76) / 16) * CELL_SPAN;
    const direction = cubeDirection(cell.face, uu, vv), sample = field.sample(...direction);
    if (sample.decorationBlocked || (sample.liquidHeight !== null && sample.liquidHeight >= sample.height) || sample.lava > 0.05) return;
    if(type==='terrestrial'&&sample.height>.00025&&sample.height<.025&&(sample.biomeWeights.snow||0)<.25&&randomAt(key,8)<.78){
      const record=matrixRecord(direction,sample,key,'tree');record.id=`${cell.key}/${index}/t`;record.cellKey=cell.key;cell.records.push(record);activation.push(record);return;
    }
    const sand = sample.biomeWeights.sand || 0;
    const rockChance = type === 'mars' ? 0.82 - sand * 0.68 : type === 'terrestrial' ? 0.60 + (sample.biomeWeights.mountain || 0) * 0.30 : 0.93;
    if (randomAt(key, 6) < rockChance) {
      const record = matrixRecord(direction, sample, key, 'rock');
      record.id = `${cell.key}/${index}/r`; record.cellKey = cell.key;
      cell.records.push(record); activation.push(record);
    }
    if (type === 'mars' && sample.crystal > 0.14 && randomAt(key, 7) < sample.crystal * 0.88) {
      const record = matrixRecord(direction, sample, key ^ 0x72331, 'crystal');
      record.id = `${cell.key}/${index}/c`; record.cellKey = cell.key;
      cell.records.push(record); activation.push(record);
    }
  }

  function* createMajorVein() {
    if (type !== 'mars') return;
    const landmark = field.landmarks.find((l) => l.id === 'crystal') || field.landmarks[0];
    if (!landmark) return;
    const start = normalize(landmark.direction), tangentA = normalize(cross(start, Math.abs(start[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
    const tangentB = cross(start, tangentA);
    let bestTangent = tangentA, bestScore = -Infinity;
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 24;
      const t = [tangentA[0] * Math.cos(a) + tangentB[0] * Math.sin(a), tangentA[1] * Math.cos(a) + tangentB[1] * Math.sin(a), tangentA[2] * Math.cos(a) + tangentB[2] * Math.sin(a)];
      const score = field.sample(...advance(start, t, 0.012)).crystal + field.sample(...advance(start, t, -0.012)).crystal;
      if (score > bestScore) { bestScore = score; bestTangent = t; }
      if (i % 6 === 5) yield null;
    }
    // Trace both directions of the actual mineral field. The two fronts advance alternately.
    const fronts = [-1, 1].map((sign) => ({ p: start.slice(), t: bestTangent.map((v) => v * sign), done: false }));
    const shoulders = [], companions = [];
    // Fixed sites, independent of quality or discovery time. Both traced fronts
    // receive a small hierarchy of landmarks; all six primary cores are emitted
    // before the secondary tiers, so even low quality retains every main peak.
    const primarySites = new Map([[3, 1.0], [10, 0.8], [25, 0.6]]);
    for (let step = 0; step < 68; step++) for (let side = 0; side < 2; side++) {
      const front = fronts[side]; if (front.done) continue;
      const predicted = advance(front.p, front.t, 0.0077), lateral = normalize(cross(predicted, front.t));
      let best = null, score = -Infinity;
      for (let j = -4; j <= 4; j++) {
        const d = advance(predicted, lateral, j * 0.00165), sample = field.sample(...d);
        const strength = sample.crystal - Math.abs(j) * 0.018;
        if (strength > score) { score = strength; best = { d, sample }; }
      }
      if (!best || best.sample.crystal < 0.14) { front.done = true; yield null; continue; }
      const forward = normalize([best.d[0] - front.p[0], best.d[1] - front.p[1], best.d[2] - front.p[2]]);
      let t = [front.t[0] * 0.47 + forward[0] * 0.53, front.t[1] * 0.47 + forward[1] * 0.53, front.t[2] * 0.47 + forward[2] * 0.53];
      const normalPart = dot(t, best.d); t = normalize(t.map((v, i) => v - best.d[i] * normalPart));
      front.p = best.d; front.t = t;
      const clusterHash = hashNumber(seedHash ^ Math.imul(step + 1, 100003) ^ Math.imul(side + 1, 51001));
      const crossVein = normalize(cross(best.d, t));
      // Separated outcrops with many splayed crystals and empty reaches between;
      // tracing the same vein must not turn it into an evenly spaced fence.
      const primary = primarySites.has(step);
      if (!primary && randomAt(clusterHash, 12) > .13) { yield null; continue; }
      const offset = (randomAt(clusterHash, 13) - .5) * .012;
      for (let shard = 0; shard < 12; shard++) {
        const key = hashNumber(clusterHash ^ Math.imul(shard + 1, 1299709));
        const spread = shard === 0 ? .001 : .009;
        const d = advance(advance(best.d, crossVein, offset + (randomAt(key, 6) - .5) * spread), t, (randomAt(key, 7) - .5) * spread);
        const sample = field.sample(...d);
        if (sample.crystal > 0.12) {
          const tier = shard === 0 && primary ? 'primary' : shard < 5 ? 'shoulder' : 'companion';
          const record = matrixRecord(d, sample, key, 'crystal', { tier, tangent: t,
            prominence: primarySites.get(step) ?? 0 });
          if (tier === 'primary') yield record;
          else if (tier === 'shoulder') shoulders.push(record);
          else companions.push(record);
        }
      }
      yield null;
    }
    // Coarser quality has the same geographical anchors as finer quality, with
    // primary peaks first, then a distributed spine, then its smaller clusters.
    for (const record of shoulders) yield record;
    for (const record of companions) yield record;
  }
  let majorGenerator = createMajorVein(), majorDone = type !== 'mars';

  function updateMajor(deadline) {
    while (!majorDone && majorRecords.length < PERMANENT_LIMIT.high && clock() < deadline) {
      const result = majorGenerator.next();
      if (result.done) { majorDone = true; break; }
      if (result.value) {
        majorRecords.push(result.value);
        if (majorRecords.length <= majorLimit) {
          writeRow(major, majorRecords.length - 1, result.value); major.count = majorRecords.length;
        }
      }
    }
    if (majorRecords.length >= PERMANENT_LIMIT.high) majorDone = true;
  }

  function update({ eyeLocal, visible = true, dt = 0, time = 0 }) {
    if (disposed) return;
    root.visible = visible; if (!visible || !field || !eyeLocal) return;
    stamp++;
    const ex = eyeLocal.x ?? eyeLocal[0], ey = eyeLocal.y ?? eyeLocal[1], ez = eyeLocal.z ?? eyeLocal[2];
    const distance = Math.hypot(ex, ey, ez); if (distance === 0) return;
    const direction = [ex / distance, ey / distance, ez / distance];
    for (const material of materials) material.uniforms.uEye.value.set(ex, ey, ez);
    const terrainHeight = field.height(...direction);
    const altitude = distance / radius - 1 - terrainHeight;
    close = altitude < (type==='terrestrial'?.06:.025);
    rocks.visible = close; shards.visible = close;trees.visible=close;
    for (const mesh of [rocks, shards, major,trees]) { mesh.instanceMatrix.clearUpdateRanges(); mesh.instanceColor.clearUpdateRanges(); }
    const start = clock(), deadline = start + 0.95;
    // Permanent structure fills incrementally even while observing the whole planet.
    if (!majorDone) updateMajor(start + (close ? 0.28 : 0.88));
    if (close) {
      chooseCells(direction);
      while (removalCursor < removal.length && clock() < deadline) remove(removal[removalCursor++]);
      while (active.size > nearBudget && clock() < deadline) remove(active.keys().next().value);
      while (activationCursor < activation.length && active.size < nearBudget && clock() < deadline) insert(activation[activationCursor++]);
      const quota = Math.ceil(nearBudget / Math.max(1, desired.length) * 1.45);
      let attempts = 0;
      while (desired.length && active.size < nearBudget && clock() < deadline && attempts < 42) {
        const cell = desired[roundRobin++ % desired.length]; attempts++;
        if (cell.records.length >= quota || cell.cursor >= CANDIDATES_PER_CELL) continue;
        generateCandidate(cell);
        while (activationCursor < activation.length && active.size < nearBudget) insert(activation[activationCursor++]);
      }
      if (activationCursor > 2200) { activation = activation.slice(activationCursor); activationCursor = 0; }
    }
    generationMs = clock() - start; generationMaxMs = Math.max(generationMaxMs, generationMs);
  }

  function setQuality(next) {
    if (disposed) return;
    config = qualityConfig(next); quality = next; totalBudget = config.detailInstances;
    majorLimit = type === 'mars' ? PERMANENT_LIMIT[next] : 0; nearBudget = totalBudget - majorLimit;
    // Shrinking the cap drops only trailing slots, with no matrix repack or deferred over-budget state.
    while (active.size > nearBudget) {
      const list = Object.values(meshState).reduce((largest,s)=>s.records.length>largest.length?s.records:largest,[]);
      remove(list[list.length - 1].id);
    }
    major.count = Math.min(majorLimit, majorRecords.length);
    for (let i = 0; i < major.count; i++) writeRow(major, i, majorRecords[i]);
    lastAnchor = ''; // Reuses the same stable cached positions; only the count cap changes.
  }
  function setLighting({ directionLocal }) {
    if (disposed || !directionLocal) return;
    const x = directionLocal.x ?? directionLocal[0], y = directionLocal.y ?? directionLocal[1], z = directionLocal.z ?? directionLocal[2];
    for (const material of materials) material.uniforms.uSun.value.set(x, y, z).normalize();
  }
  function getStats() {
    return {
      instances: disposed ? 0 : rocks.count + shards.count + major.count+trees.count,
      trees:disposed?0:trees.count,treeHeightRange:TREE_HEIGHT_UNITS.map(h=>h*radius/1600),
      rocks: disposed ? 0 : rocks.count, nearCrystals: disposed ? 0 : shards.count,
      majorCrystals: disposed ? 0 : major.count, cachedCells: cells.size,
      queuedCells: disposed || !close || active.size >= nearBudget ? 0 : desired.filter((c) => c.cursor < CANDIDATES_PER_CELL).length,
      budget: totalBudget, cellLevel: CELL_LEVEL, cacheLimit: CACHE_CELLS,
      generationMs, generationMaxMs, nearVisible: close, majorReady: majorDone,
    };
  }
  function dispose() {
    if (disposed) return;
    disposed = true; close = false; generationMs = 0; majorGenerator.return(); majorGenerator = null;
    cells.clear(); active.clear(); desired = []; desiredKeys.clear(); activation = []; removal = []; majorRecords.length = 0;
    for (const state of Object.values(meshState)) state.records.length = 0;
    for (const mesh of [rocks, shards, major,trees]) { mesh.count = 0; mesh.dispose(); }
    rockGeometry.dispose(); crystalGeo.dispose();treeGeometry.dispose(); materials.forEach((m) => m.dispose()); root.clear();
  }
  return { root, update, setQuality, setLighting, getStats, dispose };
}
