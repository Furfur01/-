import { createNoise3D, makeRandom, clamp, mix, smoothstep } from './noise.js';
import { createMercuryField, createMarsField } from './rocky-fields.js';

// All distances/heights here are fractions of the nominal planet radius.
// The asset multiplies them by its configured radius exactly once.
const sq = (x) => x * x;
const normalize = (x, y, z) => {
  const s = 1 / Math.hypot(x, y, z);
  return [x * s, y * s, z * s];
};
function frameFor(seed) {
  const rand = makeRandom(`${seed}:tectonic-frame`);
  const yaw = rand() * Math.PI * 2;
  const tilt = (rand() - 0.5) * 0.62;
  const c = Math.cos(yaw), s = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const u = [c, 0, -s], v = [-s * st, ct, -c * st], w = [s * ct, st, c * ct];
  return {
    u, v, w,
    world(a, b, c1) {
      const q = normalize(a, b, c1);
      return [u[0] * q[0] + v[0] * q[1] + w[0] * q[2],
        u[1] * q[0] + v[1] * q[1] + w[1] * q[2],
        u[2] * q[0] + v[2] * q[1] + w[2] * q[2]];
    },
  };
}
function colorMix(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
function terrace(t, count = 5, start = 0.70) {
  const q = Math.max(0, t) * count;
  const step = Math.floor(q), f = q - step;
  return (step + smoothstep(start, 1, f)) / count;
}
function landmark(frame, id, name, description, x, y, z, extra = {}) {
  return { id, name, description, direction: frame.world(x, y, z), ...extra };
}
// Heading follows the demo's local north/east tangent convention; no camera dependency.
function headingToward(direction, target) {
  const north=normalize(-direction[0]*direction[1],1-direction[1]*direction[1],-direction[2]*direction[1]);
  const east=[north[1]*direction[2]-north[2]*direction[1],north[2]*direction[0]-north[0]*direction[2],north[0]*direction[1]-north[1]*direction[0]];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  return Math.atan2(dot(target,east),dot(target,north));
}
function finalize(type, seed, evaluate, landmarks, minHeight, maxHeight) {
  return {
    type, seed, landmarks, minHeight, maxHeight,
    sample: (x, y, z) => evaluate(x, y, z, true),
    height: (x, y, z) => evaluate(x, y, z, false),
  };
}

function terrestrial(seed) {
  const frame = frameFor(`${seed}:earth`), { u: U, v: V, w: W } = frame;
  const continent = createNoise3D(`${seed}:continents`);
  const mountain = createNoise3D(`${seed}:mountains`);
  const erosion = createNoise3D(`${seed}:erosion`);
  const rand = makeRandom(`${seed}:continental-lobes`);
  const island = normalize(-0.87, 0.24 + rand() * 0.3, -0.48);
  const southern = normalize(0.70 + rand() * 0.3, -0.5, -0.42);
  const evaluate = (dx, dy, dz, full) => {
    const x = dx * U[0] + dy * U[1] + dz * U[2];
    const y = dx * V[0] + dy * V[1] + dz * V[2];
    const z = dx * W[0] + dy * W[1] + dz * W[2];
    const low = continent(x * 2.6 + 8.3, y * 2.6 - 2.7, z * 2.6 + 4.8);
    const coast = continent(x * 7.7 - 4, y * 7.7 + 8, z * 7.7 + 6);
    const coastFine = erosion(x * 24 + 12, y * 24, z * 24 - 4);
    const main = z + x * 0.15 - 0.56 + low * 0.23 + coast * 0.075 + coastFine * 0.022;
    const west = x * island[0] + y * island[1] + z * island[2] - 0.78 + low * 0.17 + coast * 0.070 + coastFine * 0.020;
    const south = x * southern[0] + y * southern[1] + z * southern[2] - 0.87 - low * 0.11 + coast * 0.082;
    const archipelago = z * 0.54 + x * 0.72 + y * 0.13 - 0.81 + coast * 0.090 + coastFine * 0.032;
    const land = Math.max(main, west, south, archipelago);
    const dry = smoothstep(-0.008, 0.045, land);
    // Ocean floors keep shelf/coast geography continuous under the independent sea mesh.
    let h = land >= 0 ? 0.013 * Math.tanh(land * 4.7) : -0.020 * Math.tanh(-land * 9);
    const spine = x - 0.115 * Math.sin(y * 5.7) - 0.028 * mountain(x * 5.1, y * 5.1, z * 5.1);
    const chain = Math.exp(-sq(spine / 0.105)) * smoothstep(0.37, 0.68, z) * dry;
    const ridged = 1 - Math.abs(mountain(x * 29 + 2, y * 29 - 4, z * 29));
    const ridgeSmall = 1 - Math.abs(erosion(x * 83 - 5, y * 83 + 6, z * 83));
    const relief = chain * (0.018 + 0.031 * ridged * ridged + 0.0045 * ridgeSmall);
    h += relief;
    // A coherent drainage field carves the same fjord/river channels at every LOD.
    const riverDistance = Math.abs(erosion(x * 17.4 + 6, y * 17.4, z * 17.4 - 8));
    const valley = Math.exp(-sq(riverDistance / 0.042)) * (0.0008 + 0.0050 * chain) * dry;
    h -= valley;
    const upland = smoothstep(0.1, 0.45, land) * (1 - chain) * dry;
    h += upland * 0.0035 * mountain(x * 14, y * 14, z * 14);
    // Actual micro geometry; amplitudes are deliberately below the large relief.
    // Broad landforms carry the silhouette. Fine tile levels remain available
    // for construction and coasts; metre-scale noise no longer roughens every face.
    const rough = coastFine;
    const latitude = Math.abs(dy);
    const polar = smoothstep(0.88, 0.965, latitude + continent(dx * 11, dy * 11, dz * 11) * 0.035);
    // Polar ice has a modest physical shelf; oceans are still independently drawn.
    h = mix(h, Math.max(h, 0.0012 + polar * 0.0023), polar);
    if (!full) return h;
    const snow = Math.max(polar, smoothstep(0.027, 0.040, h + (latitude - 0.3) * 0.010));
    const rock = smoothstep(0.011, 0.034, h) * (1 - snow);
    const desert = smoothstep(0.16, 0.36, Math.abs(y)) * (1 - smoothstep(0.43, 0.65, Math.abs(y))) * smoothstep(-0.12, 0.28, low) * (1 - chain);
    const shore = (1 - smoothstep(0.00015, 0.0016, h)) * smoothstep(-0.0018, 0.0001, h);
    const forest = [0.07, 0.22, 0.115], grass = [0.23, 0.39, 0.15];
    let color = colorMix(forest, grass, clamp(0.5 + coastFine * 1.1 + rough * 0.17));
    color = colorMix(color, [0.33, 0.265, 0.145], desert * 0.70);
    color = colorMix(color, [0.20, 0.225, 0.23], rock * 0.85);
    color = colorMix(color, [0.38, 0.34, 0.23], shore * 0.76);
    color = colorMix(color, [0.76, 0.85, 0.91], snow);
    if (h < 0) color = colorMix([0.011, 0.043, 0.051], [0.073, 0.16, 0.12], smoothstep(-0.008, 0, h));
    return { height: h, color, liquidHeight: h < 0.0002 && polar < 0.8 ? 0 : null,
      biomeWeights: { ocean: 1 - smoothstep(-0.0006, 0.0002, h), mountain: chain, plain: upland, snow, coast: shore }, crystal: 0, lava: 0 };
  };
  let mountainPoint = [0, 0.17, Math.sqrt(1 - 0.17 * 0.17)], best = -Infinity;
  for (let yy = -0.17; yy <= 0.35; yy += 0.04) for (let xx = -0.13; xx <= 0.17; xx += 0.025) {
    const zz = Math.sqrt(1 - xx * xx - yy * yy), p = frame.world(xx, yy, zz);
    const h = evaluate(...p, false);
    if (h > best) { best = h; mountainPoint = [xx, yy, zz]; }
  }
  // Find an actual shore across the main continent rather than prescribing a camera-only patch.
  let lo = 0.24, hi = 1.45;
  for (let i = 0; i < 22; i++) {
    const a = (lo + hi) * 0.5, p = frame.world(Math.sin(a) * 0.975, -0.22, Math.cos(a) * 0.975);
    if (evaluate(...p, false) > 0.0008) lo = a; else hi = a;
  }
  const coastAngle = (lo + hi) * 0.5;
  const landmarks = [
    landmark(frame, 'spine', '天穹山系', '横贯主大陆的连续雪峰与深切山谷', ...mountainPoint, { heading: headingToward(frame.world(...mountainPoint),frame.world(mountainPoint[0]+.05,mountainPoint[1]+.10,mountainPoint[2])) }),
    landmark(frame, 'coast', '曲岸群岛', '主大陆的海湾、浅海与近岸丘陵', Math.sin(coastAngle) * 0.975, -0.22, Math.cos(coastAngle) * 0.975),
    { id: 'ice', name: '北极冰冠', description: '与地轴一致的冰棚与极地海岸', direction: normalize(0.04, 1, 0.025) },
  ];
  return finalize('terrestrial', seed, evaluate, landmarks, -0.022, 0.071);
}

/** Pure deterministic solid terrain. Gas clouds intentionally have no solid field. */
export function createTerrainField(type, seed = 17) {
  if (type === 'terrestrial') return terrestrial(seed);
  if (type === 'mercury') return createMercuryField(seed);
  if (type === 'mars') return createMarsField(seed);
  if (type === 'gas') return null;
  throw new Error(`Unknown planet type: ${type}`);
}
