import { createNoise3D, makeRandom, clamp, mix, smoothstep } from './noise.js';

// Heights are fractions of R. These fields are shared by every LOD, the worker,
// camera clearance and decoration placement; no camera-dependent sculpting.
const sq = x => x * x;
const unit = v => { const r = Math.hypot(...v); return v.map(x => x / r); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const blend = (a, b, t) => a.map((v, k) => mix(v, b[k], clamp(t)));
function frame(seed) {
  const random = makeRandom(`${seed}:geological-frame-v2`);
  const yaw = random() * Math.PI * 2, tilt = (random() - .5) * .65;
  const c = Math.cos(yaw), s = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const U = [c, 0, -s], V = [-s * st, ct, -c * st], W = [s * ct, st, c * ct];
  return {
    local(x, y, z) { return [x * U[0] + y * U[1] + z * U[2], x * V[0] + y * V[1] + z * V[2], x * W[0] + y * W[1] + z * W[2]]; },
    world(p) { const n = unit(p); return U.map((_, k) => U[k] * n[0] + V[k] * n[1] + W[k] * n[2]); },
  };
}
function heading(direction, target) {
  const north = unit([0 - direction[0] * direction[1], 1 - direction[1] ** 2, -direction[2] * direction[1]]);
  return Math.atan2(dot(target, cross(north, direction)), dot(target, north));
}
function landmark(f, id, name, description, position, target) {
  const direction = f.world(position);
  return { id, name, description, direction, ...(target ? { heading: heading(direction, f.world(target)) } : {}) };
}
function field(type, seed, evaluate, landmarks, minHeight, maxHeight) {
  return { type, seed, landmarks, minHeight, maxHeight, lodErrorScale: 3.2,
    sample: (x, y, z) => evaluate(x, y, z, true),
    height: (x, y, z) => evaluate(x, y, z, false) };
}
function surfaceXY(x, y) { return [x, y, Math.sqrt(Math.max(.001, 1 - x * x - y * y))]; }
// Select a real exposed overlook, without changing the terrain to fit the camera.
function overlook(f, evaluate, candidates) {
  let best = candidates[0], bestScore = -Infinity;
  for (const candidate of candidates) {
    const p = unit(candidate.p), target = unit(candidate.target);
    const height = evaluate(...f.world(p), false);
    if (height < .008) continue;
    let obstruction = 0, descent = 0;
    for (const t of [.04, .10, .24, .48, .8]) {
      const d = unit(p.map((v, k) => mix(v, target[k], t)));
      const h = evaluate(...f.world(d), false);
      obstruction = Math.max(obstruction, h - height + .001 * t);
      descent += (height - h) * t;
    }
    const score = descent - obstruction * 25;
    if (score > bestScore) { bestScore = score; best = candidate; }
  }
  return best;
}
function cliffEdge(f, evaluate, view) {
  const start = unit(view.p), target = unit(view.target);
  let p = start, steepest = 0;
  for (let i = 0; i < 120; i++) {
    const t = i / 150;
    const a = unit(start.map((v, k) => mix(v, target[k], t)));
    const b = unit(start.map((v, k) => mix(v, target[k], t + .006)));
    const height = evaluate(...f.world(a), false), drop = height - evaluate(...f.world(b), false);
    if (height > .008 && drop > steepest) { p = a; steepest = drop; }
  }
  return { p, target };
}

export function createMercuryField(seed) {
  const f = frame(`${seed}:obsidian`);
  const plate = createNoise3D(`${seed}:continental-plates-v2`);
  const fracture = createNoise3D(`${seed}:fault-erosion-v2`);
  const grain = createNoise3D(`${seed}:basalt-grain-v2`);
  const random = makeRandom(`${seed}:volcanic-province-v2`);
  const phase = random() * 3, bend = .075 + random() * .06;
  const spine = y => -.10 + bend * Math.sin(y * 4.8 + phase) + .025 * Math.sin(y * 13 + phase);
  const cy = .24 + random() * .08, cx = spine(cy);
  const volcanoes = [
    { p: surfaceXY(cx, cy), radius: .17 + random() * .025, height: .068, active: true },
    { p: surfaceXY(-.39, -.19), radius: .125, height: .053, active: true },
    { p: surfaceXY(.38, .46), radius: .105, height: .060, active: false },
    { p: unit([-.48, .19, -.86]), radius: .19, height: .045, active: false },
  ].map(v => {
    const east = unit(cross([0, 1, 0], v.p));
    return { ...v, east, north: cross(v.p, east), phase: random() * Math.PI * 2 };
  });
  const impacts = Array.from({ length: 7 }, () => {
    const y = random() * 2 - 1, a = random() * Math.PI * 2, r = Math.sqrt(1 - y * y);
    return { p: [r * Math.cos(a), y, r * Math.sin(a)], radius: .035 + random() * .065 };
  });
  const crustRandom = makeRandom(`${seed}:broken-crust-v2`);
  const crustPlates = Array.from({ length: 18 }, () => {
    const y = crustRandom() * 2 - 1, a = crustRandom() * Math.PI * 2, r = Math.sqrt(1 - y * y);
    return [r * Math.cos(a), y, r * Math.sin(a)];
  });
  const seaCenter = unit([.54, -.10, .85]);
  function evaluate(dx, dy, dz, full) {
    const [x, y, z] = f.local(dx, dy, dz);
    const broad = plate(x * 2.4 + 8, y * 2.4, z * 2.4 - 2);
    const blocks = plate(x * 6.5, y * 6.5 + 3, z * 6.5);
    const ridgeNoise = fracture(x * 18, y * 18, z * 18);
    const upland = smoothstep(-.22, .38, broad + blocks * .23);
    const mountainZone = smoothstep(.02, .58, broad) * smoothstep(-.35, .4, blocks);
    const ridges = sq(1 - Math.abs(ridgeNoise));
    let h = -.002 + .013 * smoothstep(-.24, -.03, broad) + .016 * smoothstep(.12, .29, broad + blocks * .20) + .020 * mountainZone * ridges;
    h += .004 * fracture(x * 54, y * 54, z * 54) * (.35 + mountainZone);

    // Sparse, connected plate boundaries and one dominant molten basin. The
    // basin has dark islands and a steep irregular coast, not a painted orange cap.
    let nearest = -2, second = -2;
    const wx = x + .035 * blocks, wy = y + .025 * ridgeNoise, wz = z + .025 * broad;
    for (const p of crustPlates) {
      const d = wx * p[0] + wy * p[1] + wz * p[2];
      if (d > nearest) { second = nearest; nearest = d; } else if (d > second) second = d;
    }
    const broken = (1 - smoothstep(.0018, .011, nearest - second)) * smoothstep(-.45, .25, broad);
    h = mix(h, -.023, broken);
    const seaDistance = Math.sqrt(Math.max(0, 2 - 2 * (x * seaCenter[0] + y * seaCenter[1] + z * seaCenter[2])));
    const sea = 1 - smoothstep(.37, .45, seaDistance + blocks * .055 + ridgeNoise * .012);
    const islands = smoothstep(.28, .52, plate(x * 17 + 6, y * 17, z * 17));
    const moltenSea = sea * (1 - islands);
    h = mix(h, -.026 + islands * .065, sea);

    // A branching fault province, surrounded by comparatively quiet basalt shields.
    const front = smoothstep(.04, .42, z);
    const warp = fracture(x * 9, y * 9, z * 9) * .019;
    const mainDistance = Math.abs(x - spine(y) - warp);
    const branchA = Math.abs(x - spine(y) - (y + .12) * .75 - .023 * Math.sin(y * 16))
      + .3 * (1 - smoothstep(-.20, -.10, y)) + .3 * smoothstep(.30, .49, y);
    const branchB = Math.abs(x - spine(y) + (y + .35) * .64 + .024 * Math.sin(y * 17))
      + .3 * (1 - smoothstep(-.70, -.56, y)) + .3 * smoothstep(-.19, -.07, y);
    const distance = Math.min(mainDistance, branchA, branchB);
    const width = .021 + .010 * (.5 + .5 * Math.sin(y * 11 + phase));
    const trench = (1 - smoothstep(width * .65, width * 3.5, distance)) * front;
    const floor = 1 - smoothstep(width * .25, width * .92, distance);
    h += .009 * Math.exp(-sq((distance - width * 3.4) / (width * 1.35))) * front;
    h = mix(h, -.025 + .0012 * blocks, Math.pow(trench, .85));
    let molten = Math.max(floor * front, moltenSea, broken), volcanic = 0, rimWeight = 0;

    for (const v of volcanoes) {
      const cosine = x * v.p[0] + y * v.p[1] + z * v.p[2];
      if (cosine < 1 - sq(v.radius * 2.6) * .5) continue;
      const angle = Math.atan2(x * v.north[0] + y * v.north[1] + z * v.north[2], x * v.east[0] + y * v.east[1] + z * v.east[2]);
      const irregular = 1 + .11 * Math.sin(angle * 3 + v.phase) + .055 * Math.sin(angle * 7 - v.phase) + blocks * .10;
      const q = Math.sqrt(Math.max(0, 2 - 2 * cosine)) / (v.radius * irregular);
      const shield = Math.exp(-sq(q / 1.35));
      const buttresses = .76 + .24 * sq(.5 + .5 * Math.sin(angle * 11 + fracture(x * 24, y * 24, z * 24) * 2));
      h += v.height * shield * buttresses;
      const crater = 1 - smoothstep(.56, .92, q);
      const rim = Math.exp(-sq((q - .98) / .16));
      const centralRock = Math.exp(-sq(q / .16)) * (v.active ? .012 : .025);
      const craterFloor = v.active ? -.026 : .015;
      h = mix(h, craterFloor + centralRock + ridgeNoise * .001, crater);
      const escarpment = crater * (1 - crater) * 4;
      const columns = fracture(Math.cos(angle) * 29, Math.sin(angle) * 29, q * .7 + v.phase);
      h += escarpment * (.0055 * columns + .0025 * fracture(x * 160, y * 160, z * 160));
      h += rim * .010 * (.65 + .35 * Math.sin(angle * 8 + v.phase) ** 2);
      volcanic = Math.max(volcanic, shield); rimWeight = Math.max(rimWeight, rim);
      if (v.active) molten = Math.max(molten, crater);
    }
    // Old, subtle impacts break the shields without making the entire globe pockmarked.
    for (const c of impacts) {
      const cosine = x * c.p[0] + y * c.p[1] + z * c.p[2];
      if (cosine < 1 - sq(c.radius * 1.5) * .5) continue;
      const q = Math.sqrt(Math.max(0, 2 - 2 * cosine)) / c.radius;
      const mask = (1 - trench) * (1 - clamp(volcanic));
      h += (.007 * Math.exp(-sq((q - 1) / .14)) - .005 * (1 - smoothstep(.55, .92, q))) * mask;
    }
    // Faceted basalt uses the structural plates, rifts and volcanoes above.
    // Omit gravel-scale octaves rather than paying for invisible roughness.
    if (!full) return h;
    const lava = molten * smoothstep(-.0145, -.0205, h);
    const exposed = smoothstep(-.15, .62, blocks) * (.35 + .65 * upland);
    let color = blend([.033, .030, .031], [.12, .13, .14], exposed);
    color = blend(color, [.14, .155, .16], rimWeight * .55 + mountainZone * .18);
    const oxidation = smoothstep(.12, .66, plate(x * 13 + 8, y * 13, z * 13)) * (1 - volcanic * .6);
    color = blend(color, [.105, .043, .021], oxidation * .65);
    color = blend(color, [.014, .011, .015], trench * .45 + volcanic * .12);
    return { height: h, color, liquidHeight: lava > .08 ? -.016 : null, lava, crystal: 0,
      biomeWeights: { basalt: 1 - exposed, metal: exposed, plateau: upland, rift: trench, crater: clamp(volcanic), rim: rimWeight } };
  }
  const main = volcanoes[0];
  const calderaView = overlook(f, evaluate, Array.from({ length: 48 }, (_, i) => {
    const angle = i * Math.PI * 2 / 48, r = main.radius * 1.03;
    const tangent = main.east.map((v, k) => v * Math.cos(angle) + main.north[k] * Math.sin(angle));
    return { p: main.p.map((v, k) => v * Math.cos(r) + tangent[k] * Math.sin(r)), target: main.p };
  }));
  const result = field('mercury', seed, evaluate, [
    landmark(f, 'caldera', '黑冠火山群', '不规则破火山口、放射状岩脊与深处的熔岩海', calderaView.p, main.p),
    landmark(f, 'rift', '熔铁大断裂', '分支熔岩河切穿黑曜岩原，沿断层形成高耸断崖', surfaceXY(spine(-.22) + .055, -.22), surfaceXY(spine(-.22), -.08)),
    landmark(f, 'plateau', '冷铁山脊', '冷灰金属脊与锈色玄武岩台地间保留大片暗部', surfaceXY(.36, .51), surfaceXY(.38, .46)),
  ], -.031, .115);
  result.detailScale = (d, angle) => {
    const [x, y, z] = f.local(...d);
    const volcano = volcanoes.some(v => x * v.p[0] + y * v.p[1] + z * v.p[2] > Math.cos(v.radius * 1.5 + angle));
    return volcano || z > .1 && Math.abs(x - spine(y)) < .13 + angle ? 9 : 3.2;
  };
  return result;
}

export function createMarsField(seed) {
  const f = frame(`${seed}:red-desert`);
  const continent = createNoise3D(`${seed}:red-continental-shelves-v2`);
  const erosion = createNoise3D(`${seed}:tributary-erosion-v2`);
  const sandNoise = createNoise3D(`${seed}:wind-seas-v2`);
  const random = makeRandom(`${seed}:canyon-skeleton-v2`);
  const phase = random() * 2, amplitude = .095 + random() * .065;
  const center = x => -.025 + amplitude * Math.sin(x * 4.4 + phase) + .028 * Math.sin(x * 12.5 + phase);
  const duneCenter = unit([.55, -.47 - random() * .06, .69]);
  const wind = .15 + random() * .35;
  const tributaries = Array.from({ length: 7 }, (_, i) => ({
    x: -.64 + i * .19 + (random() - .5) * .05,
    side: i % 2 ? 1 : -1, length: .10 + random() * .16,
    width: .007 + random() * .007, bend: (random() - .5) * .9,
  }));
  const mesas = [
    { p: surfaceXY(-.29, center(-.29) + .18), size: .085, height: .036 },
    { p: surfaceXY(.30, center(.30) + .16), size: .065, height: .046 },
    { p: surfaceXY(-.50, center(-.50) - .19), size: .12, height: .031 },
    { p: unit([.22, .25, -.94]), size: .19, height: .040 },
  ].map(m => { const east = unit(cross([0, 1, 0], m.p)); return { ...m, east, north: cross(m.p, east), phase: random() * 6 }; });
  const impacts = Array.from({ length: 12 }, () => {
    const y = random() * 2 - 1, a = random() * Math.PI * 2, r = Math.sqrt(1 - y * y);
    return { p: [r * Math.cos(a), y, r * Math.sin(a)], radius: .025 + random() * .045 };
  });
  function evaluate(dx, dy, dz, full) {
    const [x, y, z] = f.local(dx, dy, dz);
    const broad = continent(x * 2.5, y * 2.5 + 6, z * 2.5);
    const province = continent(x * 6.7, y * 6.7, z * 6.7 - 8);
    const upland = smoothstep(-.28, .34, broad + province * .22);
    const corrugation = erosion(x * 23, y * 23 + 7, z * 23);
    const mountain = smoothstep(.1, .55, broad) * smoothstep(-.2, .4, province);
    let h = .002 + .016 * smoothstep(-.24, -.12, broad + province * .22)
      + .020 * smoothstep(.08, .22, broad + province * .22)
      + mountain * .022 * sq(1 - Math.abs(corrugation));
    h += .0023 * erosion(x * 51, y * 51, z * 51) * (.15 + mountain);

    const front = smoothstep(.10, .48, z);
    const warp = erosion(x * 10 + 4, y * 10, z * 10) * .037 + erosion(x * 57, y * 57, z * 57) * .004;
    const mainDistance = Math.abs(y - center(x) - warp);
    const branch1 = Math.abs(y - center(x) - (x + .24) * .68 - .018 * Math.sin(x * 27))
      + .3 * (1 - smoothstep(-.32, -.22, x)) + .3 * smoothstep(.38, .56, x);
    const branch2 = Math.abs(y - center(x) + (x - .15) * .66 + .024 * Math.sin(x * 22))
      + .3 * (1 - smoothstep(-.55, -.38, x)) + .3 * smoothstep(.15, .28, x);
    let distance = Math.min(mainDistance, branch1 + .012, branch2 + .014);
    const width = .056 + .022 * (.5 + .5 * Math.sin(x * 12 + phase));
    // Short tapered tributaries join the main canyon and leave large quiet shelves.
    for (const t of tributaries) {
      const along = (y - center(t.x)) * t.side;
      if (along < -.04 || along > t.length + .035) continue;
      const taper = (1 - smoothstep(t.length * .65, t.length + .02, along)) * smoothstep(-.04, 0, along);
      const channel = Math.abs(x - t.x - along * t.bend - .012 * Math.sin(along * 21 + phase));
      distance = Math.min(distance, width * (1 - taper) + channel * width / t.width);
    }
    const cut = (1 - smoothstep(width * .80, width * 1.12, distance)) * front;
    const wall = cut * (1 - cut) * 4;
    // Broad, steep escarpments with a few resistant ledges, rather than global quantized terraces.
    const strataWarp = erosion(x * 34, y * 34, z * 34);
    const ledges = Math.sin(cut * Math.PI * 5 + strataWarp * .8) * wall * .0016;
    h = mix(h, -.038 + .0012 * province, cut) + ledges;
    const tributary = Math.exp(-sq(erosion(x * 47, y * 47, z * 47) / .16));
    h -= wall * tributary * .006;
    const rampart = Math.exp(-sq((distance - width * 1.55) / (width * .32))) * front;
    h += rampart * (.002 + .003 * sq(1 - Math.abs(corrugation)));
    h += wall * erosion(x * 126, y * 126, z * 126) * .0016;

    let butte = 0;
    for (const m of mesas) {
      const cosine = x * m.p[0] + y * m.p[1] + z * m.p[2];
      if (cosine < 1 - sq(m.size * 2) * .5) continue;
      const theta = Math.atan2(x * m.north[0] + y * m.north[1] + z * m.north[2], x * m.east[0] + y * m.east[1] + z * m.east[2]);
      const outline = 1 + .16 * Math.sin(theta * 3 + m.phase) + .10 * Math.sin(theta * 5 - m.phase);
      const q = Math.sqrt(Math.max(0, 2 - 2 * cosine)) / (m.size * outline);
      const shaped = 1 - smoothstep(.62, 1.08, q + corrugation * .10);
      const hoodoo = shaped * (1 - cut);
      h += m.height * hoodoo;
      butte = Math.max(butte, hoodoo);
    }
    for (const c of impacts) {
      const cosine = x * c.p[0] + y * c.p[1] + z * c.p[2];
      if (cosine < 1 - sq(c.radius * 1.5) * .5) continue;
      const q = Math.sqrt(Math.max(0, 2 - 2 * cosine)) / c.radius;
      h += (.003 * Math.exp(-sq((q - 1) / .15)) - .0035 * (1 - smoothstep(.50, 1, q))) * (1 - cut);
    }
    const duneArea = smoothstep(.88, .982, x * duneCenter[0] + y * duneCenter[1] + z * duneCenter[2]) * (1 - cut);
    const sand = Math.max(duneArea, .32 * (1 - upland) * (1 - cut), cut * smoothstep(.82, 1, cut) * .32);
    h = mix(h, .0008 + sandNoise(x * 12, y * 12, z * 12) * .0012, duneArea);
    const dunePhase = (x * Math.cos(wind) + y * Math.sin(wind) - z * .18) * 175
      + sandNoise(x * 8, y * 8, z * 8) * 3.8 + sandNoise(x * 25, y * 25, z * 25) * .65;
    const crest = Math.pow(.5 + .5 * Math.sin(dunePhase), 2.8);
    h += sand * (crest * (.0021 + .0014 * duneArea) + Math.pow(.5 + .5 * Math.sin(dunePhase * 5.1), 3) * .00012);
    if (!full) return h;

    const vein = Math.exp(-sq(distance / (width * .40))) * front * smoothstep(.70, .97, cut);
    const pockets = .42 + .48 * smoothstep(-.25, .45, erosion(x * 31 + 7, y * 31, z * 31));
    const crystal = clamp(vein * pockets);
    const strata = .5 + .5 * Math.sin(h * 1120 + province * 1.4 + corrugation * .35);
    let color = blend([.20, .046, .024], [.38, .125, .052], upland);
    color = blend(color, [.53, .265, .115], smoothstep(.40, .8, strata) * wall * .45);
    color = blend(color, [.12, .028, .019], (1 - strata) * wall * .5);
    color = blend(color, [.48, .267, .119], sand * .92);
    const pale = smoothstep(.25, .65, province) * (1 - cut) * .17;
    color = blend(color, [.61, .41, .235], pale);
    color = blend(color, [.025, .033, .042], crystal * .90);
    const polar = smoothstep(.967, .997, Math.abs(dy));
    color = blend(color, [.64, .55, .43], polar * .65);
    return { height: h, color, liquidHeight: null, lava: 0, crystal,
      biomeWeights: { sand, dune: duneArea, mesa: Math.max(upland, butte), canyon: cut, mineral: crystal, polar } };
  }
  const crystalX = .10, crystalY = center(crystalX);
  const canyonView = cliffEdge(f, evaluate, overlook(f, evaluate, Array.from({ length: 72 }, (_, i) => {
    const x = -.46 + (i % 18) * .038, side = i < 36 ? -1 : 1;
    const y = center(x) + side * (.077 + (Math.floor(i / 18) % 2) * .018);
    return { p: surfaceXY(x, y), target: surfaceXY(x + .065, center(x + .065)) };
  })));
  const result = field('mars', seed, evaluate, [
    landmark(f, 'canyon', '赤壁天堑', '深切主峡谷与支谷、抗蚀岩台和远处的荒漠山原', canyonView.p, canyonView.target),
    landmark(f, 'dunes', '流金沙海', '宽阔风成沙丘与被沙海包围的孤立台地', duneCenter, surfaceXY(duneCenter[0] - .08, duneCenter[1] + .12)),
    landmark(f, 'crystal', '幽蓝晶峡', '深色晶簇从谷底矿脉生长，尖棱与红色绝壁形成对照', surfaceXY(crystalX, crystalY), surfaceXY(crystalX + .12, center(crystalX + .12))),
    landmark(f, 'mesa', '风蚀孤峰', '不规则高台、垂直风蚀沟与沉积岩层', surfaceXY(.39, center(.30) + .20), mesas[1].p),
  ], -.044, .11);
  result.detailScale = (d, angle) => {
    const [x, y, z] = f.local(...d), a = Math.abs(y - center(x));
    return z > .1 && a < .14 + angle || mesas.some(m => x * m.p[0] + y * m.p[1] + z * m.p[2] > Math.cos(m.size * 1.5 + angle)) ? 10 : 2.2;
  };
  return result;
}
