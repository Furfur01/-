import * as ThreeDefault from 'three';

// The enclosing spheres are ray entry/exit proxies. All visible clouds are
// integrated through a three-dimensional density field in planet-local space.
// No textured ground, opaque surface mesh, framebuffer, camera, or RAF is used.

const QUALITY = {
  low: { far: 4, near: 22, fine: 0.35 },
  standard: { far: 6, near: 36, fine: 0.75 },
  high: { far: 10, near: 48, fine: 1.0 },
};

const vertexShader = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vLocalPosition;
void main() {
  vLocalPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #include <logdepthbuf_vertex>
}
`;

const commonFragment = /* glsl */ `
precision highp float;
#include <common>
#include <logdepthbuf_pars_fragment>
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uRadius;
uniform vec3 uEye;
uniform vec3 uSun;
uniform int uClearCount;
uniform vec4 uClearSites[6];
varying vec3 vLocalPosition;

float facilityClearance(vec3 p) {
  float clear = 1.0;
  vec3 n = normalize(p);
  for (int k=0;k<6;k++) {
    if(k>=uClearCount)break;
    float radius=uClearSites[k].w;
    clear=min(clear,smoothstep(radius*.45,radius,distance(n,uClearSites[k].xyz)));
  }
  return mix(1.0,clear,smoothstep(1.035,1.065,length(p)));
}

vec2 raySphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float d = b * b - c;
  if (d < 0.0) return vec2(1.0, -1.0);
  d = sqrt(d);
  return vec2(-b - d, -b + d);
}

// Set depth to the first appreciably scattering sample, rather than the back
// of the proxy. The macro and formula match Three.js r184's depth chunks.
void setVolumeDepth(vec3 p) {
  vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(p * uRadius, 1.0);
  #if defined(USE_LOGARITHMIC_DEPTH_BUFFER)
    gl_FragDepth = vIsPerspective == 0.0
      ? clipPosition.z / clipPosition.w * 0.5 + 0.5
      : log2(max(1e-6, 1.0 + clipPosition.w)) * logDepthBufFC * 0.5;
  #else
    gl_FragDepth = clipPosition.z / clipPosition.w * 0.5 + 0.5;
  #endif
}
`;

const cloudFragmentShader = commonFragment + /* glsl */ `
uniform float uWeatherTime;
uniform float uSeed;
uniform float uFine;
uniform float uNear;
uniform int uSteps;
uniform vec3 uStormDir[5];
uniform vec3 uStormEast[5];
uniform vec3 uStormNorth[5];
uniform vec2 uStormScale[5];

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
        mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
        mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
}

struct Weather {
  float top;
  float hue;
  float cover;
  float eye;
  float wall;
  vec3 advected;
  vec3 wind;
};

Weather weather(vec3 n) {
  float lat = asin(clamp(n.y, -1.0, 1.0));
  float lon = atan(n.z, n.x);
  float jet = 0.0055 * (0.35 + sin(lat * 8.0 + 0.3) * 0.8);
  float advLon = lon + uWeatherTime * jet;
  vec3 q = vec3(cos(advLon) * cos(lat), sin(lat), sin(advLon) * cos(lat));
  vec3 seedShift = vec3(uSeed * 0.031, uSeed * 0.017, uSeed * 0.043);
  float warp = noise3(q * 8.0 + seedShift);
  float broad = sin(lat * 22.0 + 0.85 * sin(lat * 7.0 + uSeed) + warp * 1.2);
  float narrow = sin(lat * 59.0 + warp * 3.0 + sin(advLon * 5.0) * 0.23 * cos(lat));
  float shear = pow(1.0 - abs(broad), 3.0);
  float wisps = noise3(q * vec3(53.0, 137.0, 53.0) + seedShift);
  float band = 0.5 + broad * 0.34 + narrow * 0.12 + (wisps - 0.5) * shear * 0.3;
  Weather w;
  w.top = 1.003 + band * 0.018 + (warp - 0.5) * 0.010;
  w.hue = clamp(band + (warp - 0.5) * 0.16, 0.0, 1.0);
  w.cover = 0.56 + band * 0.5;
  w.eye = 0.0;
  w.wall = 0.0;
  w.advected = q;
  w.wind = q;

  // Geographic centres remain fixed. Only the cyclone's arms rotate. Their
  // elliptical tangent coordinates are seamless on all cube faces/poles.
  for (int k = 0; k < 5; k++) {
    float facing = dot(n, uStormDir[k]);
    if (facing > 0.70) {
      vec2 uv = vec2(dot(n, uStormEast[k]), dot(n, uStormNorth[k]));
      uv /= max(facing, 0.01) * uStormScale[k];
      float r = length(uv);
      if (r < 2.2) {
        float mask = 1.0 - smoothstep(1.15, 1.95, r);
        float a = atan(uv.y, uv.x);
        float spin = uWeatherTime * (k == 0 ? 0.095 : -0.12);
        float winding = a * 3.0 - r * 8.0 + (warp - 0.5) * 1.2 - spin;
        float arm = pow(0.5 + 0.5 * sin(winding), 4.0);
        arm *= smoothstep(0.28, 0.55, r) * (1.0 - smoothstep(1.15, 1.95, r));
        float ring = exp(-pow((r - 0.39) / 0.16, 2.0));
        float eye = 1.0 - smoothstep(0.16, 0.30, r);
        float strength = k == 0 ? 1.0 : 0.65;
        w.top += mask * strength * (ring * 0.023 + arm * 0.012 - eye * 0.047);
        float stormHue = 0.31 + ring * 0.5 + arm * 0.3 - eye * 0.27;
        w.hue = mix(w.hue, stormHue, mask * (k == 0 ? 0.90 : 0.75));
        w.eye = max(w.eye, eye * mask);
        w.wall = max(w.wall, ring * mask);
        w.cover += ring * 0.15;
        // Rotate the local billows with the same spiral as the visible arms.
        float twist = mask * (2.7 / (0.35 + r) + spin * 0.10);
        vec3 swirl = uStormDir[k] +
          uStormEast[k] * (cos(a + twist) * r * uStormScale[k].x) +
          uStormNorth[k] * (sin(a + twist) * r * uStormScale[k].y);
        w.advected = normalize(mix(w.advected, normalize(swirl), mask * 0.85));
      }
    }
  }

  // Polar turbulence, a deep blue hexagonal jet, and small curled tendrils.
  float polar = smoothstep(0.85, 1.28, abs(lat));
  float polarRing = exp(-pow((abs(lat) - 1.23 - 0.025 * cos(lon * 6.0)) / 0.047, 2.0));
  w.hue = mix(w.hue, 0.12 + wisps * 0.32, polar * 0.85);
  w.top += polarRing * 0.010 + polar * (wisps - 0.5) * 0.014;
  // The game's authoritative combat approach stays on the nominal +Y cap.
  // Lower clouds locally there; ship transforms and collision radii stay intact.
  w.top = mix(w.top, 0.978, smoothstep(0.980, 0.992, n.y));
  return w;
}

vec3 palette(float h, float eye, float latitude) {
  // Linear-light palette: cobalt depths, subdued ochre belts, pearl jets.
  vec3 deep = vec3(0.030, 0.068, 0.105);
  vec3 ochre = vec3(0.39, 0.205, 0.104);
  vec3 pearl = vec3(0.87, 0.77, 0.59);
  vec3 c = mix(deep, ochre, smoothstep(0.02, 0.40, h));
  c = mix(c, pearl, smoothstep(0.35, 0.90, h));
  float polar = smoothstep(0.78, 0.99, abs(latitude));
  c = mix(c, vec3(0.105, 0.225, 0.285) * (0.6 + h), polar * 0.75);
  return mix(c, deep * 0.7, eye * 0.85);
}

float billows(vec3 p, Weather w) {
  // Noise is genuinely 3D, including the radial coordinate. Differential jets
  // and cyclonic advection move it without changing the fixed storm centre.
  vec3 q = w.advected * length(p);
  vec3 off = vec3(uSeed * 0.017, uSeed * 0.029, uSeed * 0.011);
  float v = noise3(q * 47.0 + off) * 0.65;
  v += noise3(q * 109.0 - off) * 0.27;
  if (uFine * uNear > 0.2 && uNear < 0.75) v += noise3(q * 293.0 + off.yzx) * 0.08 * uFine;
  return v;
}

// Weighted nearest rounded core in a seeded 3D cellular field. Shared corner
// hashes keep spatial cells coherent. A result contains the position relative
// to the core and its radius, for the density and bounded sunlight query.
vec4 cloudCore(vec3 p) {
  vec3 cell = floor(p), f = fract(p);
  float nearest = 1e6;
  vec4 result = vec4(0.0, 0.0, 0.0, 0.55);
  for (int z = 0; z < 2; z++) {
    for (int y = 0; y < 2; y++) {
      for (int x = 0; x < 2; x++) {
        vec3 corner = vec3(float(x), float(y), float(z));
        float h = hash31(cell + corner);
        vec3 displacement = (fract(vec3(h, h * 7.73, h * 13.37)) - 0.5) * 0.36;
        vec3 delta = f - corner - displacement;
        float coreRadius = 0.46 + 0.17 * fract(h * 31.7);
        float score = dot(delta, delta) / (coreRadius * coreRadius);
        if (score < nearest) {
          nearest = score;
          result = vec4(delta, coreRadius);
        }
      }
    }
  }
  return result;
}

float coreDensity(vec3 delta, float coreRadius, float radius, float layerTop, float erosion) {
  float rounded = 1.0 - smoothstep(0.48, 1.15, length(delta) / coreRadius + erosion);
  float layer = exp(-pow((radius - layerTop - 0.002) / 0.020, 2.0));
  return max(0.0, rounded - 0.18) * 2.8 * layer;
}

void main() {
  vec3 ro = uEye / uRadius;
  vec3 rd = normalize(vLocalPosition / uRadius - ro);
  float nearBody = smoothstep(0.48, 0.95, uNear);
  float outerRadius = mix(1.053, 1.073, nearBody);
  vec2 outer = raySphere(ro, rd, outerRadius);
  if (outer.y <= max(outer.x, 0.0)) discard;
  float begin = max(outer.x, 0.0);
  float end = outer.y;
  vec3 cachedDirection = normalize(ro + rd * begin);
  Weather cachedWeather = weather(cachedDirection);
  // Importance-bound a distant ray column around its own cloud layer. Nearby
  // rays retain the complete shell so horizontal cloud walls stay volumetric.
  float distant = 1.0 - uNear;
  float topBound = mix(outerRadius, min(1.053, cachedWeather.top + 0.018), distant);
  vec2 localTop = raySphere(ro, rd, topBound);
  if (localTop.x > begin) begin = min(localTop.x, end);
  float lowerBound = mix(0.925, clamp(cachedWeather.top - 0.038, 0.925, 0.993), distant);
  vec2 inner = raySphere(ro, rd, lowerBound);
  bool entersDeepGas = inner.y > 0.0;
  if (entersDeepGas && inner.x > begin) end = min(end, inner.x);
  if (length(ro) < 0.925) end = min(end, 0.035);
  float lengthToMarch = end - begin;
  if (lengthToMarch <= 0.0) discard;

  vec3 sum = vec3(0.0);
  float transmittance = 1.0;
  float hit = begin;
  bool hitFound = false;
  // A small fixed dither avoids coherent bands without producing the salt-and-
  // pepper speckle of a full random step offset. There is no temporal noise.
  float jitter = 0.44 + hash31(vec3(gl_FragCoord.xy, uSeed)) * 0.12;
  float travel = begin;
  float previousDensity = 0.0;
  float faceLight = max(0.0, dot(-rd, uSun));
  float forward = pow(faceLight, 7.0) * 0.4;
  // Macroscopic jets vary much more slowly than the 3D billows. Re-evaluate
  // them only after angular travel; preserve the local position offset in the
  // fine density field between updates. This never caches across frames.
  float macroAngularStep = mix(0.016, 0.004, uNear);
  for (int i = 0; i < 48; i++) {
    if (i >= uSteps || transmittance < 0.012) break;
    if (travel >= end) break;
    float remaining = end - travel;
    float uniformStep = lengthToMarch / float(uSteps);
    // Empty air is crossed faster. Once a cloud is encountered, steps shrink
    // to resolve its nearby density/occlusion rather than sampling concentric
    // transparent-looking slabs. More distant portions receive less work.
    float localStep = (previousDensity > 0.02 ? 0.0018 : 0.0048) + max(travel - begin, 0.0) * 0.015;
    float budgetStep = remaining / max(float(uSteps - i), 1.0) * 0.55;
    localStep = min(max(localStep, budgetStep), 0.0058 + max(travel - begin, 0.0) * 0.012);
    float stepLength = min(remaining, mix(uniformStep, localStep, uNear));
    // Do not turn the remaining horizon into one very thick last slab. The
    // fixed work budget may leave remote tenuous gas to the atmospheric tail.
    if (i == uSteps - 1) stepLength = min(remaining, mix(remaining, localStep, uNear));
    float t = travel + stepLength * jitter;
    vec3 p = ro + rd * t;
    float rad = length(p);
    vec3 n = p / rad;
    if (distance(n, cachedDirection) > macroAngularStep) {
      cachedDirection = n;
      cachedWeather = weather(n);
    }
    Weather w = cachedWeather;
    w.advected = normalize(cachedWeather.advected + n - cachedDirection);
    w.wind = normalize(cachedWeather.wind + n - cachedDirection);
    float billow = billows(p, w);
    float d = clamp((w.top - rad) * 73.0 + billow * 2.20 - 1.03, 0.0, 1.6) * w.cover;
    vec4 core = vec4(0.0, 0.0, 1.0, 0.55);
    float bodyDensity = 0.0;
    if (nearBody > 0.001) {
      // The weather field positions this layer without filling it monotonically.
      // Rounded 3D bodies, clear gaps and eroded boundaries govern nearby opacity.
      vec3 coreP = w.wind * rad * 48.0 + vec3(uSeed * 0.061, uSeed * 0.023, uSeed * 0.037);
      core = cloudCore(coreP);
      bodyDensity = coreDensity(core.xyz, core.w, rad, w.top, (billow - 0.46) * 0.22);
      bodyDensity *= 0.65 + w.cover * 0.4;
      d = mix(d, bodyDensity, nearBody);
    }
    float deepDensity = (1.0 - smoothstep(0.946, 0.986, rad)) * 0.72;
    d += deepDensity;
    float bodyLightMix = nearBody * bodyDensity / max(bodyDensity + deepDensity, 0.0001);
    d *= 1.0 - smoothstep(outerRadius - 0.007, outerRadius, rad);
    d *= facilityClearance(p);
    d *= 1.0 - smoothstep(0.980, 0.992, normalize(p).y) * smoothstep(0.982, 0.997, rad);
    if (d > 0.015) {
      float optical = d * stepLength * 147.0;
      float alpha = 1.0 - exp(-optical);
      float sunN = dot(n, uSun);
      float day = smoothstep(-0.12, 0.12, sunN);
      float illum = 0.045 + day * (0.26 + 0.80 * sqrt(max(sunN, 0.0)));
      float layerShade = mix(0.25, 1.0, smoothstep(w.top - 0.029, w.top + 0.002, rad));
      // A short directional density probe gives billows shadowed lee sides.
      vec3 litP = p + uSun * 0.010;
      float shadeNoise = noise3((w.advected * length(litP) + uSun * 0.005) * 47.0 + vec3(uSeed * 0.017));
      float blocker = clamp((w.top - length(litP)) * 66.0 + shadeNoise * 1.7 - 0.85, 0.0, 1.5);
      float selfShade = 0.42 + 0.58 * exp(-blocker * 1.65);
      vec3 color = palette(w.hue + (billow - 0.4) * 0.18, w.eye, n.y);
      if (nearBody > 0.001) {
        // A bounded sunlight probe evaluates the same density core. Highlighted
        // cloud rims and dark lee sides therefore follow the actual body shape.
        float nearBlocker = coreDensity(core.xyz + uSun * (48.0 * 0.011), core.w,
          length(litP), w.top, (billow - 0.46) * 0.22);
        float cloudDiffuse = 0.28 + 0.80 * sqrt(max(dot(normalize(core.xyz + vec3(0.0001)), uSun), 0.0));
        illum = mix(illum, 0.035 + day * cloudDiffuse, bodyLightMix);
        selfShade = mix(selfShade, 0.30 + 0.70 * exp(-nearBlocker * 0.95), bodyLightMix);
        layerShade = mix(layerShade, mix(0.55, 1.0, smoothstep(w.top - 0.034, w.top + 0.005, rad)), bodyLightMix);
        color = mix(color, mix(color, vec3(0.88, 0.87, 0.81), 0.55), bodyLightMix);
      }
      color *= illum * layerShade * selfShade;
      color += vec3(0.06, 0.12, 0.19) * day * forward * (1.0 - layerShade) * 0.3;
      // Rare sub-cloud lightning. The flash moves through no geometry and is
      // governed solely by weather time, so weather pause freezes it too.
      float phase = mod(uWeatherTime + uSeed * 0.7, 21.0);
      float flash = exp(-pow((phase - 1.35) / 0.11, 2.0)) +
                    0.6 * exp(-pow((phase - 1.65) / 0.07, 2.0));
      float lightningArea = pow(max(dot(n, uStormDir[2]), 0.0), 370.0);
      color += vec3(0.23, 0.51, 1.0) * flash * lightningArea * (0.4 + 0.6 * (1.0 - day));
      sum += transmittance * alpha * color;
      if (!hitFound && alpha > 0.025) { hit = t; hitFound = true; }
      transmittance *= 1.0 - alpha;
    }
    previousDensity = d;
    travel += stepLength;
  }

  // Continuing gas below the sampled shell is optically thick. This is an
  // analytic tail of the volume integral, never an opaque rock/surface mesh.
  if (entersDeepGas) {
    vec3 n = normalize(ro + rd * end);
    float day = smoothstep(-0.12, 0.15, dot(n, uSun));
    vec3 deepGas = vec3(0.020, 0.040, 0.067) * (0.12 + day * 0.8);
    sum += transmittance * deepGas;
    if (!hitFound) hit = end;
    transmittance = 0.0;
  }
  float opacity = 1.0 - transmittance;
  if (opacity < 0.009) discard;
  setVolumeDepth(ro + rd * hit);
  gl_FragColor = vec4(sum / max(opacity, 0.0001), opacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const atmosphereFragmentShader = commonFragment + /* glsl */ `
void main() {
  vec3 ro = uEye / uRadius;
  vec3 rd = normalize(vLocalPosition / uRadius - ro);
  vec2 outer = raySphere(ro, rd, 1.086);
  if (outer.y < max(outer.x, 0.0)) discard;
  float begin = max(0.0, outer.x), end = outer.y;
  vec2 clouds = raySphere(ro, rd, 1.025);
  if (clouds.x > begin) end = min(end, clouds.x);
  else if (length(ro) < 1.025 && clouds.y > 0.0) {
    // Interior fog is already integrated by the clouds. Looking outward sees
    // the gas above us; looking into deep gas must not receive a rear halo.
    if (dot(ro, rd) < -0.03) discard;
    begin = max(begin, clouds.y);
  }
  if (end <= begin) discard;
  vec3 col = vec3(0.0);
  float optical = 0.0;
  float stepLength = (end - begin) / 6.0;
  for (int i = 0; i < 6; i++) {
    vec3 p = ro + rd * (begin + (float(i) + 0.5) * stepLength);
    float h = max(0.0, length(p) - 1.025);
    float d = exp(-h * 68.0) * stepLength * 4.1 * facilityClearance(p);
    float day = smoothstep(-0.16, 0.17, dot(normalize(p), uSun));
    optical += d;
    col += mix(vec3(0.028, 0.053, 0.12), vec3(0.26, 0.49, 0.63), day) * d * (0.12 + day);
  }
  float opacity = 1.0 - exp(-optical);
  if (opacity < 0.001) discard;
  float phase = 0.75 + 0.35 * pow(dot(rd, uSun), 2.0);
  setVolumeDepth(ro + rd * begin);
  gl_FragColor = vec4(col / max(optical, 0.001) * phase, min(opacity, 0.58));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function hashSeed(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function randomSequence(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ a >>> 15, a | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Gas asset. +Y is the spin axis. Radius and eyeLocal use scene units.
 * Weather is independent of root.rotation; pass weatherTime to pause/replay it.
 * See getNavigationSurface for cloud-top navigation, not solid terrain sampling.
 */
export function createGasGiant({ THREE = ThreeDefault, seed = 206, radius = 224, quality = 'standard' } = {}) {
  if (!(Number.isFinite(radius) && radius > 0)) throw new Error('Gas radius must be positive.');
  const root = new THREE.Group();
  root.name = 'gas-giant';
  const clouds = new THREE.Group(); clouds.name = 'clouds';
  const atmosphere = new THREE.Group(); atmosphere.name = 'atmosphere';
  root.add(clouds, atmosphere);

  const stormRng = randomSequence(hashSeed(`${seed}:storms`));
  const cloudRng = randomSequence(hashSeed(`${seed}:clouds`));
  const baseLon = (stormRng() - 0.5) * Math.PI * 2;
  const mainLat = -0.18 - stormRng() * 0.16;
  const latitudes = [mainLat, 0.33 + stormRng() * 0.12, -0.56, 0.74, 1.22];
  const longitudes = [baseLon, baseLon + 0.86, baseLon - 0.91, baseLon + 2.0, baseLon - 1.5];
  const scales = [
    [0.31 + stormRng() * 0.025, 0.18 + stormRng() * 0.015],
    [0.11, 0.075], [0.095, 0.069], [0.081, 0.06], [0.09, 0.09],
  ];
  const dirs = latitudes.map((lat, i) => new THREE.Vector3(
    Math.cos(lat) * Math.cos(longitudes[i]), Math.sin(lat), Math.cos(lat) * Math.sin(longitudes[i]),
  ));
  const east = dirs.map(d => new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), d).normalize());
  const north = dirs.map((d, i) => new THREE.Vector3().crossVectors(d, east[i]).normalize());
  const sharedUniforms = {
    uRadius: { value: radius },
    uEye: { value: dirs[0].clone().multiplyScalar(radius * 4) },
    uSun: { value: new THREE.Vector3(-0.4, 0.6, 0.8).normalize() },
    uClearCount: { value: 0 },
    uClearSites: { value: Array.from({length:6},()=>new THREE.Vector4()) },
  };
  const cloudUniforms = {
    ...sharedUniforms,
    uWeatherTime: { value: 0 },
    uSeed: { value: cloudRng() * 300 + 3 },
    uFine: { value: 0.75 },
    uNear: { value: 0 },
    uSteps: { value: 6 },
    uStormDir: { value: dirs },
    uStormEast: { value: east },
    uStormNorth: { value: north },
    uStormScale: { value: scales.map(([x, y]) => new THREE.Vector2(x, y)) },
  };
  const cloudMaterial = new THREE.ShaderMaterial({
    name: 'gas-3d-cloud-integrator', uniforms: cloudUniforms,
    vertexShader, fragmentShader: cloudFragmentShader,
    side: THREE.BackSide, transparent: true, depthWrite: true, depthTest: true,
    toneMapped: true,
  });
  const atmosphereMaterial = new THREE.ShaderMaterial({
    name: 'gas-atmospheric-scattering', uniforms: sharedUniforms,
    vertexShader, fragmentShader: atmosphereFragmentShader,
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: true,
    toneMapped: true,
  });
  // These low-cost bounds stay fixed across quality settings. Detail changes
  // affect only visible ray columns and the volume integration sample budget.
  const cloudGeometry = new THREE.SphereGeometry(radius * 1.075, 80, 48);
  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.086, 64, 40);
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloudMesh.name = 'raymarch-volume'; cloudMesh.renderOrder = 3;
  const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  // The clear-air integral supplies the background. Let the cloud integral
  // composite its own scattering in front, including from inside the shell.
  // This prevents a rear hemisphere halo from painting over opaque cloud walls.
  atmosphereMesh.name = 'atmosphere-integral'; atmosphereMesh.renderOrder = 2;
  clouds.add(cloudMesh); atmosphere.add(atmosphereMesh);

  let disposed = false;
  let visible = true;
  let elapsedWeather = 0;
  let weatherPaused = false;
  let currentQuality = QUALITY[quality] ? quality : 'standard';
  let relativeAltitude = 3;
  let volumeSteps = QUALITY[currentQuality].far;
  let updateCount = 0;
  let lastDt = 0;
  const landmarks = [
    { id: 'great-eye', name: '巨眼风暴', description: '固定的风暴眼、隆起眼墙与三股螺旋云臂；下潜可观察云墙遮挡与深层暗部。', direction: dirs[0].toArray() },
    { id: 'eye-wall', name: '风暴眼墙', description: '主风暴北侧眼墙，适合从云顶水平穿过三维云团。', direction: dirs[0].clone().addScaledVector(north[0], scales[0][1] * 0.40).normalize().toArray() },
    { id: 'polar-vortex', name: '极地蓝涡', description: '深蓝湍流、六角环流与极区小型旋涡。', direction: dirs[4].toArray() },
    { id: 'shear-jets', name: '剪切云带', description: '不同纬度的独立平流速度与多层交错云带。', direction: dirs[1].clone().addScaledVector(east[1], 0.18).normalize().toArray() },
  ];

  function setQuality(q) {
    if (disposed) return;
    currentQuality = QUALITY[q] ? q : 'standard';
    cloudUniforms.uFine.value = QUALITY[currentQuality].fine;
  }

  function update({ dt = 0, time, weatherTime, eyeLocal, visible: inView = true } = {}) {
    if (disposed) return;
    visible = !!inView;
    root.visible = visible;
    if (!visible) return;
    lastDt = dt;
    updateCount++;
    if (eyeLocal) sharedUniforms.uEye.value.copy(eyeLocal);
    relativeAltitude = sharedUniforms.uEye.value.length() / radius - 1;
    const proximity = 1 - smoothstep(0.025, 0.32, relativeAltitude);
    const budget = QUALITY[currentQuality];
    volumeSteps = Math.round(budget.far + (budget.near - budget.far) * proximity);
    cloudUniforms.uSteps.value = volumeSteps;
    cloudUniforms.uNear.value = proximity;
    if (Number.isFinite(weatherTime)) elapsedWeather = weatherTime;
    else if (!weatherPaused) elapsedWeather += Math.min(Math.max(dt, 0), 0.1);
    cloudUniforms.uWeatherTime.value = elapsedWeather;
  }

  function setLighting({ directionLocal } = {}) {
    if (!disposed && directionLocal) sharedUniforms.uSun.value.copy(directionLocal).normalize();
  }

  function setVisible(value) {
    if (disposed) return;
    visible = !!value;
    root.visible = visible;
  }

  function getStats() {
    return {
      type: 'gas', seed, radius, quality: currentQuality, visible: visible && !disposed,
      solidSurface: false, relativeAltitude,
      lod: `volume-${volumeSteps}`, maxLevel: 0,
      activeTiles: 0, activeChunks: 0, activeBlocks: 0, queuedTasks: 0, workers: 0,
      cachedTiles: 0, cacheLimit: 0,
      volumeSteps, volumeDetail: cloudUniforms.uNear.value,
      volumeShell: [0.925 * radius, (1.053 + 0.020 * smoothstep(0.48, 0.95, cloudUniforms.uNear.value)) * radius],
      nominalCloudTop: 1.025 * radius,
      drawCalls: disposed || !visible ? 0 : Number(clouds.visible) + Number(atmosphere.visible),
      triangles: disposed || !visible ? 0 :
        (clouds.visible ? cloudGeometry.index.count / 3 : 0) +
        (atmosphere.visible ? atmosphereGeometry.index.count / 3 : 0),
      weatherTime: elapsedWeather, updateCount, lastDt,
      disposed,
    };
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    visible = false;
    root.visible = false;
    cloudGeometry.dispose(); atmosphereGeometry.dispose();
    cloudMaterial.dispose(); atmosphereMaterial.dispose();
    root.clear();
  }

  setQuality(currentQuality);
  return {
    root, groups: { clouds, atmosphere }, landmarks, radius, seed, type: 'gas',
    sampleSurface: () => null,
    getNavigationSurface: () => ({ solid: false, cloudTopHeight: radius * 0.025, minimumRadius: radius * 0.993 }),
    update, setLighting, setQuality, setVisible, getStats, dispose,
    setFacilityClearance(sites=[]) {
      sharedUniforms.uClearCount.value=Math.min(6,sites.length);
      for(let i=0;i<sharedUniforms.uClearCount.value;i++)sharedUniforms.uClearSites.value[i].set(...sites[i].normal,Math.max(.012,sites[i].footprint/radius*3.5));
    },
    setWeatherPaused(value) { weatherPaused = !!value; },
  };
}

export default createGasGiant;
