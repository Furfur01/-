/** Small deterministic primitives. No module-global random state. */
export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const mix = (a, b, t) => a + (b - a) * t;
export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export function hashSeed(value) {
  const str = String(value);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Mulberry32: independent streams are made by hashing a namespace into seed. */
export function makeRandom(seed) {
  let state = hashSeed(seed);
  return () => {
    let t = state += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Improved gradient noise sampled in Cartesian planet coordinates. */
export function createNoise3D(seed) {
  const rng = makeRandom(seed);
  const base = new Uint16Array(256);
  const perm = new Uint16Array(512);
  for (let i = 0; i < 256; i++) base[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = base[i]; base[i] = base[j]; base[j] = a;
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  return function noise(x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    x -= ix; y -= iy; z -= iz;
    const X = ix & 255, Y = iy & 255, Z = iz & 255;
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const w = z * z * z * (z * (z * 6 - 15) + 10);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    const g000 = grad(perm[AA], x, y, z);
    const g100 = grad(perm[BA], x - 1, y, z);
    const g010 = grad(perm[AB], x, y - 1, z);
    const g110 = grad(perm[BB], x - 1, y - 1, z);
    const g001 = grad(perm[AA + 1], x, y, z - 1);
    const g101 = grad(perm[BA + 1], x - 1, y, z - 1);
    const g011 = grad(perm[AB + 1], x, y - 1, z - 1);
    const g111 = grad(perm[BB + 1], x - 1, y - 1, z - 1);
    const a = mix(mix(g000, g100, u), mix(g010, g110, u), v);
    const b = mix(mix(g001, g101, u), mix(g011, g111, u), v);
    return mix(a, b, w) * 1.18;
  };
}

export function fbm3(noise, x, y, z, octaves = 4, lacunarity = 2.03, gain = 0.5) {
  let amplitude = 1, value = 0, weight = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x, y, z) * amplitude;
    weight += amplitude;
    x *= lacunarity; y *= lacunarity; z *= lacunarity;
    amplitude *= gain;
  }
  return value / weight;
}
