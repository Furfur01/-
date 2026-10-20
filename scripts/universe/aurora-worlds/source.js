// Extracted from the user-supplied AURORA_Worlds (1).html.
// Keep the supplied art and dimensions; integration belongs in aurora-world-surface.js.
import {MathUtils as Ke,Vector3 as P,Vector2 as lt,Quaternion as hn,Matrix4 as me,Box3 as rn,Euler as En,Group as Ne,Object3D as He,Mesh as Xt,InstancedMesh as _s,BufferGeometry as ue,BufferAttribute as ze,Float32BufferAttribute as Jt,Color as ie,MeshStandardMaterial as sn,MeshBasicMaterial as Hi,ShaderMaterial as gn,DataTexture as Rr,SphereGeometry as $e,BoxGeometry as $n,DodecahedronGeometry as Es,ExtrudeGeometry as Fr,RingGeometry as Fs,CircleGeometry as Ms,ConeGeometry as Ss,LatheGeometry as Tn,TorusGeometry as Us,Shape as Vi,IcosahedronGeometry as Wi,CylinderGeometry as un,AdditiveBlending as Ws,BackSide as Je,DoubleSide as on,FrontSide as Ln,NormalBlending as ai,SRGBColorSpace as Ze,NoColorSpace as Hn,RGBAFormat as _n,UnsignedByteType as Rn,RepeatWrapping as Mr,ClampToEdgeWrapping as On,LinearMipmapLinearFilter as Kn,LinearFilter as bn} from 'three';
import {ConvexGeometry as to} from 'three/addons/geometries/ConvexGeometry.js';
import {mergeGeometries as jd} from 'three/addons/utils/BufferGeometryUtils.js';
import {createWorldField as Jc,makeTerrainArrays as $c} from './field.js';
var tr = Object.freeze({ jupiter: { name: "\u6728\u661F", kind: "\u5C42\u53E0\u4E91\u6D77 \xB7 \u94DC\u6A59\u98CE\u66B4", summary: "\u94DC\u6A59\u6DF1\u4E91\u3001\u4E73\u767D\u4E2D\u5C42\u4E91\u5899\u4E0E\u9AD8\u7A7A\u8584\u4E91\u5206\u5C42\u6D41\u52A8\uFF0C\u692D\u5706\u98CE\u66B4\u5377\u8D77\u4E91\u5E26\u3002" }, saturn: { name: "\u571F\u661F", kind: "\u91D1\u8272\u4E91\u5C42 \xB7 \u5206\u5E26\u661F\u73AF", summary: "\u6696\u91D1\u6DF1\u5C42\u5927\u6C14\u3001\u5976\u6CB9\u8272\u4E91\u53F0\u4E0E\u6D45\u8272\u9AD8\u7A7A\u96FE\u5C42\uFF0C\u5916\u4FA7\u73AF\u5E26\u5177\u6709\u758F\u5BC6\u53D8\u5316\u548C\u771F\u5B9E\u95F4\u9699\u3002" }, uranus: { name: "\u5929\u738B\u661F", kind: "\u9752\u78A7\u5927\u6C14 \xB7 \u503E\u659C\u4E91\u8F74", summary: "\u6DF1\u9752\u6C14\u5C42\u3001\u67D4\u548C\u78A7\u8272\u4E91\u6D77\u548C\u6DE1\u9752\u9AD8\u4E91\u6CBF\u503E\u659C\u8F74\u5206\u5C42\u6D41\u52A8\uFF0C\u7EC6\u7A84\u6697\u73AF\u56F4\u7ED5\u8D64\u9053\u3002" }, neptune: { name: "\u6D77\u738B\u661F", kind: "\u6DF1\u84DD\u4E91\u6D77 \xB7 \u9AD8\u7A7A\u6D41\u4E91", summary: "\u6DF1\u84DD\u5E95\u5C42\u3001\u94B4\u84DD\u4E2D\u5C42\u4E91\u56E2\u548C\u51B0\u84DD\u9AD8\u7A7A\u6D41\u4E91\u5177\u6709\u72EC\u7ACB\u9AD8\u5EA6\uFF0C\u6697\u8272\u98CE\u66B4\u7A7F\u8FC7\u4E91\u9699\u3002" } }), Qd = { jupiter: { colors: ["b9a48b", "dfcfae", "bf8056", "ddc09c", "b77049", "e9d9b8", "83939b", "e4d2ab", "c58b60", "e8dbbf", "b9bdb2"], mid: ["d8bb97", "f0e0c2"], high: ["e7d7bc", "fff0d3"], storm: ["bd7254", "9e4c38"], haze: ["dbc5a6", "a8c9dc"], tilt: null, relief: 1, cloud: 1, speed: 1, frequencies: [22, 43], midCut: 0.18, highCut: 0.34 }, saturn: { colors: ["b8aa87", "d9c99f", "bc9c68", "e3cf9f", "c5aa75", "dfcda6", "b3b49f", "decba4", "c4ad7c", "e8d8b3", "c4baa0"], mid: ["d3c099", "f0dfb9"], high: ["e6d7b9", "fff0d0"], storm: ["cbb38a", "b49666"], haze: ["e8d3a8", "d6dedb"], tilt: [0.28, 0.91, -0.3], relief: 0.78, cloud: 0.93, speed: 0.79, frequencies: [28, 52], midCut: 0.12, highCut: 0.38 }, uranus: { colors: ["528d9d", "7cacb8", "5b96a4", "85bac1", "6ba6ae", "94c6ca", "6099a8", "80b9c0", "6da4b1", "a4ced0", "75a7b4"], mid: ["88bbc2", "b5d9d6"], high: ["b0d5d6", "d7ece2"], storm: ["6a9eac", "527d91"], haze: ["8cc9ca", "aad7e2"], tilt: [-0.93, 0.22, 0.3], relief: 0.64, cloud: 0.82, speed: 0.62, frequencies: [17, 36], midCut: 0.24, highCut: 0.44 }, neptune: { colors: ["20416d", "365f9a", "254e8a", "487bb1", "2b5893", "3e76ae", "23497a", "5088bc", "2c609d", "518cbc", "395f95"], mid: ["3c77ad", "73a7c8"], high: ["9bc6d8", "d5e9e6"], storm: ["244679", "152f55"], haze: ["528bbd", "9fcee3"], tilt: null, relief: 1.07, cloud: 0.79, speed: 1.16, frequencies: [24, 48], midCut: 0.31, highCut: 0.41 } }, js = Math.PI * 2, Fn = (i, t = 0, e = 1) => Math.max(t, Math.min(e, i)), Gn = (i, t, e) => i + (t - i) * e, Vn = (i, t, e) => {
  let n = Fn((e - i) / (t - i));
  return n * n * (3 - 2 * n);
}, Xr = (i) => [parseInt(i.slice(0, 2), 16), parseInt(i.slice(2, 4), 16), parseInt(i.slice(4, 6), 16)], Ri = (i, t, e) => [Gn(i[0], t[0], e), Gn(i[1], t[1], e), Gn(i[2], t[2], e)];
function sy(i) {
  let t = i >>> 0, e = () => {
    t = t + 1831565813 >>> 0;
    let a = t;
    return a = Math.imul(a ^ a >>> 15, a | 1), a ^= a + Math.imul(a ^ a >>> 7, a | 61), ((a ^ a >>> 14) >>> 0) / 4294967296;
  }, n = Uint16Array.from({ length: 512 }, (a, l) => l & 255);
  for (let a = 255; a > 0; a--) {
    let l = Math.floor(e() * (a + 1)), c = n[a];
    n[a] = n[l], n[l] = c;
  }
  for (let a = 256; a < 512; a++) n[a] = n[a - 256];
  let r = (a, l, c, h) => {
    a &= 15;
    let u = a < 8 ? l : c, d = a < 4 ? c : a === 12 || a === 14 ? l : h;
    return (a & 1 ? -u : u) + (a & 2 ? -d : d);
  }, s = (a) => a * a * a * (a * (a * 6 - 15) + 10), o = [e() * 73 + 2, e() * 57 + 19, e() * 89 + 7];
  return (a, l, c) => {
    a += o[0], l += o[1], c += o[2];
    let h = Math.floor(a), u = Math.floor(l), d = Math.floor(c), f = h & 255, m = u & 255, g = d & 255;
    a -= h, l -= u, c -= d;
    let _ = s(a), p = s(l), y = s(c), M = n[f] + m, v = n[M] + g, w = n[M + 1] + g, b = n[f + 1] + m, A = n[b] + g, C = n[b + 1] + g;
    return Gn(Gn(Gn(r(n[v], a, l, c), r(n[A], a - 1, l, c), _), Gn(r(n[w], a, l - 1, c), r(n[C], a - 1, l - 1, c), _), p), Gn(Gn(r(n[v + 1], a, l, c - 1), r(n[A + 1], a - 1, l, c - 1), _), Gn(r(n[w + 1], a, l - 1, c - 1), r(n[C + 1], a - 1, l - 1, c - 1), _), p), y);
  };
}
function oy(i, t, e) {
  let n = Qd[t], r = sy(i.seedInt ^ 1699392569), s = n.colors.map(Xr), o = n.mid.map(Xr), a = n.high.map(Xr), l = n.storm.map(Xr), c = e.clone().invert(), h = i.features.storms.map((d, f) => ({ direction: new P(...d.direction).applyQuaternion(c), east: new P(...d.east).applyQuaternion(c), north: new P(...d.north).applyQuaternion(c), radius: d.radius * (t === "uranus" ? 0.65 : t === "saturn" ? 0.74 : 1), aspect: d.aspect, spin: d.spin, main: f === 0 })), u = i.features.bands;
  return (d, f, m) => {
    let g = r(d * 3.2, f * 7.6, m * 3.2), _ = r(d * 8.1 + g * 0.8, f * 24, m * 8.1 - g * 0.6), p = r(d * 17.2 + _, f * 61, m * 17.2 - _), y = r(d * 38, f * 126, m * 38), M = f + g * 0.036 + _ * 0.012, v = 0, w = 0, b = 0;
    for (let ft of h) {
      if (d * ft.direction.x + f * ft.direction.y + m * ft.direction.z < 0.72) continue;
      let Tt = (d * ft.east.x + f * ft.east.y + m * ft.east.z) / ft.radius, qt = (d * ft.north.x + f * ft.north.y + m * ft.north.z) / (ft.radius * ft.aspect), te = Math.hypot(Tt, qt), de = Math.exp(-te * te * 1.25);
      if (te > 1.9) continue;
      let ae = Math.atan2(qt, Tt), F = ft.spin * 3.8 * de;
      M += (Math.sin(ae + F) * te - qt) * ft.radius * 0.4 * de;
      let B = Math.sin(ae * 2 - ft.spin * te * 11.8 + _ * 1.3), V = Vn(0, 0.85, B) * Vn(0.25, 0.61, te) * (1 - Vn(0.9, 1.48, te)), pt = t === "saturn" ? 0.4 : t === "uranus" ? 0.17 : 1;
      v = Math.max(v, (1 - Vn(0.25, 0.91, te + _ * 0.07)) * pt * (ft.main ? 1 : 0.72)), w = Math.max(w, Math.exp(-Math.pow((te - 0.9) / 0.3, 2)) * pt), b = Math.max(b, V * pt);
    }
    let A = u.length - 1;
    for (let ft = 0; ft < u.length; ft++) if (M <= u[ft].end) {
      A = ft;
      break;
    }
    let C = u[A], T = Math.min(s.length - 1, A + 1), E = Vn(C.end - 0.045, C.end + 0.025, M + p * 8e-3), L = Ri(s[A], s[T], E), z = g * 0.55 + _ * 0.36 + p * 0.09, W = 1 + z * 0.14;
    L = L.map((ft) => ft * W);
    let tt = Math.sin(M * n.frequencies[0] + g * 1.7 + _ * 0.8), Q = Math.sin(M * n.frequencies[1] + g * 1.4 + _ * 1.8 + p * 0.32), Y = Vn(n.midCut, n.midCut + 0.45, _ * 0.68 + tt * 0.37 + g * 0.15 + 0.2), ct = Vn(n.highCut, n.highCut + 0.35, p * 0.6 + Q * 0.26 + _ * 0.31 + 0.18);
    Y *= 1 - v * 0.73, ct *= 1 - v * 0.92, Y = Math.max(Y, b * 0.87, w * Vn(-0.12, 0.45, _) * 0.75), ct = Math.max(ct, b * Vn(-0.25, 0.3, p) * 0.95), Y = Fn(Y * n.cloud), ct = Fn(ct * n.cloud), t === "neptune" ? L = Ri(L, Ri(l[0], l[1], 0.55 + _ * 0.15), v * 0.92) : L = Ri(L, Ri(l[0], l[1], 0.28 + _ * 0.22), v * 0.86);
    let j = Ri(o[0], o[1], Fn(0.43 + Y * 0.38 + p * 0.2)), St = Ri(a[0], a[1], Fn(0.4 + ct * 0.4 + y * 0.14));
    return { colors: [L, j, St], density: [1, Y, ct], relief: [z * 0.49 - v * 0.38, Y * 0.9 + _ * 0.18, ct * 0.96 + p * 0.16], bump: [0.5 + _ * 0.19 + p * 0.15 + y * 0.055, Fn(Y * 0.66 + p * 0.12 + y * 0.065 + 0.15), Fn(ct * 0.63 + p * 0.09 + y * 0.055 + 0.17)] };
  };
}
function Zc(i, t, e, n = false) {
  let r = new Rr(i, t, e, _n, Rn);
  return r.colorSpace = n ? Ze : Hn, r.wrapS = Mr, r.wrapT = On, r.minFilter = Kn, r.magFilter = bn, r.generateMipmaps = true, r.anisotropy = 4, r.needsUpdate = true, r;
}
async function ay(i, t, {yieldWork=false, signal}={}) {
  signal?.throwIfAborted();
  let e = t === "low" ? 512 : t === "medium" || t === "mid" ? 768 : 1024, n = e / 2, r = Array.from({ length: 3 }, () => new Uint8Array(e * n * 4)), s = Array.from({ length: 3 }, () => new Uint8Array(e * n * 4)), o = new Float32Array(e), a = new Float32Array(e);
  for (let l = 0; l < e; l++) {
    let c = (l + 0.5) / e * js;
    o[l] = Math.sin(c), a[l] = Math.cos(c);
  }
  for (let l = 0; l < n; l++) {
    if(yieldWork&&l%8===0){await new Promise(resolve=>setTimeout(resolve,0));signal?.throwIfAborted();}
    let c = (1 - (l + 0.5) / n) * Math.PI, h = Math.cos(c), u = Math.sin(c);
    for (let d = 0; d < e; d++) {
      let f = i(-a[d] * u, h, o[d] * u), m = (l * e + d) * 4;
      for (let g = 0; g < 3; g++) {
        let _ = r[g], p = s[g], y = f.colors[g];
        _[m] = Fn(y[0], 0, 255), _[m + 1] = Fn(y[1], 0, 255), _[m + 2] = Fn(y[2], 0, 255), _[m + 3] = g ? Math.round(f.density[g] * (g === 1 ? 242 : 235)) : 255;
        let M = Math.round(Fn(f.bump[g]) * 255);
        p[m] = M, p[m + 1] = M, p[m + 2] = M, p[m + 3] = 255;
      }
    }
  }
  return { color: r.map((l) => Zc(l, e, n, true)), bump: s.map((l) => Zc(l, e, n)), width: e };
}
function ly(i, t, e, n) {
  let r = n === "low" ? 80 : n === "medium" || n === "mid" ? 112 : 160, s = new $e(1, r, Math.round(r * 0.625)), o = s.attributes.position, a = new Float32Array(o.count), l = [99.3, 101.45, 103.6], c = [1, 1.44, 1.6], h = new P();
  for (let u = 0; u < o.count; u++) {
    h.fromBufferAttribute(o, u).normalize();
    let d = i(h.x, h.y, h.z), f = l[t] + d.relief[t] * c[t] * e.relief;
    o.setXYZ(u, h.x * f, h.y * f, h.z * f), a[u] = d.density[t];
  }
  if (t) {
    let u = s.index.array, d = [];
    for (let f = 0; f < u.length; f += 3) Math.max(a[u[f]], a[u[f + 1]], a[u[f + 2]]) > 0.018 && d.push(u[f], u[f + 1], u[f + 2]);
    s.setIndex(d);
  }
  return o.needsUpdate = true, s.computeVertexNormals(), s.computeBoundingSphere(), s;
}
var cy = `
vec2 gasUV(vec3 n) {
  n = normalize(n);
  return vec2(atan(n.z, -n.x) / 6.28318530718, asin(clamp(n.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
}
`;
function hy(i, t, e, n) {
  let r = new sn({ map: i.color[t], bumpMap: i.bump[t], bumpScale: [0.34, 0.7, 0.56][t], roughness: 1, metalness: 0, transparent: t > 0, opacity: 1, alphaTest: t ? 0.018 : 0, depthWrite: t === 0, side: Ln });
  return t < 2 && (r.onBeforeCompile = (s) => {
    s.uniforms.gasSun = { value: e }, s.uniforms.gasMiddleMap = { value: i.color[1] }, s.uniforms.gasHighMap = { value: i.color[2] }, s.uniforms.gasCloudRotations = { value: n }, s.vertexShader = `varying vec3 vGasNormal;
` + s.vertexShader, s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
vGasNormal = normalize(position);`), s.fragmentShader = `uniform vec3 gasSun; uniform sampler2D gasMiddleMap; uniform sampler2D gasHighMap; uniform vec2 gasCloudRotations; varying vec3 vGasNormal;
${cy}
` + s.fragmentShader;
    let o = `
      vec3 gasN = normalize(vGasNormal);
      float gasLightAngle = max(0.25, dot(gasN, normalize(gasSun)));
      vec3 gasRay = normalize(gasSun) - gasN * dot(gasN, normalize(gasSun));
      vec2 gasShadowUV = gasUV(normalize(gasN + gasRay * ${t ? "0.021" : "0.043"} / gasLightAngle));
      gasShadowUV.x += gasCloudRotations.y;
      float gasShadow = texture2D(gasHighMap, gasShadowUV).a * ${t ? "0.17" : "0.20"};
      ${t ? "" : `vec2 gasMiddleUV = gasUV(normalize(gasN + gasRay * 0.022 / gasLightAngle));
      gasMiddleUV.x += gasCloudRotations.x;
      gasShadow += texture2D(gasMiddleMap, gasMiddleUV).a * 0.20;`}
      diffuseColor.rgb *= 1.0 - gasShadow * smoothstep(-0.10, 0.30, dot(gasN, normalize(gasSun)));
    `;
    s.fragmentShader = s.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
` + o);
  }, r.customProgramCacheKey = () => `gas-cloud-deck-${t}-v1`), r;
}
function uy(i, t, e, n) {
  return new gn({ uniforms: { hazeColor: { value: new ie(`#${i}`) }, hazeOpacity: { value: t }, hazePower: { value: e }, gasLight: { value: n } }, vertexShader: `varying vec3 vWorld; varying vec3 vNormal;
    void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vNormal = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`, fragmentShader: `uniform vec3 hazeColor; uniform float hazeOpacity; uniform float hazePower; uniform vec3 gasLight; varying vec3 vWorld; varying vec3 vNormal;
    void main() {
      vec3 n = normalize(vNormal), viewRay = normalize(cameraPosition - vWorld);
      float limb = pow(1.0 - abs(dot(n, viewRay)), hazePower);
      float day = 0.16 + 0.84 * smoothstep(-0.35, 0.50, dot(n, normalize(gasLight)));
      gl_FragColor = vec4(hazeColor * (0.52 + day * 0.40), limb * hazeOpacity * day);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`, side: Ln, transparent: true, depthWrite: false, blending: ai });
}
function dy(i, t, e, n, r) {
  if (t !== "saturn" && t !== "uranus") return { rings: 0, triangles: 0, fitPoints: [] };
  let s = t === "saturn", o = s ? [[134, 148, 0.3], [149.2, 169, 0.83], [173.4, 187.6, 0.65], [190.6, 191.3, 0.42]] : [[124.5, 125, 0.22], [129, 129.5, 0.24], [134, 134.85, 0.42]], a = o[0][0], l = o.at(-1)[1], c = 2048, h = new Uint8Array(c * 4), u = Xr(s ? "d8c7a5" : "869995"), d = Xr(s ? "958673" : "46596b");
  for (let y = 0; y < c; y++) {
    let M = Gn(a, l, (y + 0.5) / c), v = Math.sin(M * 5.7) * 0.13 + Math.sin(M * 18.2) * 0.075 + Math.sin(M * 43.1) * 0.035, w = Fn(0.58 + v + Math.sin(M * 0.95) * 0.17), b = 0;
    for (let [C, T, E] of o) b = Math.max(b, Vn(C, C + 0.15, M) * (1 - Vn(T - 0.15, T, M)) * E * (0.71 + w * 0.29));
    let A = Ri(d, u, w);
    h[y * 4] = A[0], h[y * 4 + 1] = A[1], h[y * 4 + 2] = A[2], h[y * 4 + 3] = b * 255;
  }
  let f = Zc(h, c, 1, true);
  f.wrapS = On;
  let m = new gn({ uniforms: { ringMap: { value: f }, ringInner: { value: a }, ringOuter: { value: l }, gasLight: { value: n } }, vertexShader: `varying vec3 vWorld; varying vec3 vNormal; varying float vRadius;
    void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vNormal = normalize(mat3(modelMatrix) * normal); vRadius = length(position.xz); gl_Position = projectionMatrix * viewMatrix * w; }`, fragmentShader: `uniform sampler2D ringMap; uniform float ringInner; uniform float ringOuter; uniform vec3 gasLight; varying vec3 vWorld; varying vec3 vNormal; varying float vRadius;
    void main() {
      vec4 ring = texture2D(ringMap, vec2((vRadius - ringInner) / (ringOuter - ringInner), 0.5));
      if (ring.a < 0.015) discard;
      vec3 L = normalize(gasLight), n = normalize(vNormal);
      float hit = max(0.0, -dot(vWorld, L));
      float closest = length(vWorld + L * hit);
      float shadow = mix(1.0, smoothstep(98.5, 105.0, closest), step(0.01, hit));
      float lit = 0.30 + 0.88 * abs(dot(n, L)) * mix(0.11, 1.0, shadow);
      gl_FragColor = vec4(ring.rgb * lit, ring.a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`, transparent: true, depthWrite: false, side: on }), g = new Ne();
  g.name = s ? "Saturn_Divided_Ice_Rings" : "Uranus_Narrow_Dust_Rings", i.add(g);
  let _ = 0;
  for (let y = 0; y < o.length; y++) {
    let [M, v] = o[y], w = new Fs(M, v, r === "low" ? 160 : 256, 1);
    w.rotateX(-Math.PI / 2);
    let b = new Xt(w, m);
    b.position.y = y % 2 ? 0.1 : -0.1, b.name = `Ring_Annulus_${y + 1}`, b.renderOrder = 20, b.userData = { decorative: true, atmosphere: true, ring: true, innerRadius: M, outerRadius: v }, g.add(b), _ += w.index.count / 3;
  }
  let p = [];
  for (let y = 0; y < 48; y++) p.push(new P(Math.cos(y / 48 * js) * l, 0, Math.sin(y / 48 * js) * l).applyQuaternion(i.quaternion));
  return { rings: o.length, triangles: _, fitPoints: p, map: f };
}
async function tf(i, { quality: t = "high", yieldWork=false, signal } = {}) {
  let e = tr[i.gasVariant] ? i.gasVariant : "jupiter", n = Qd[e], r = new Ne();
  r.name = `World_Terrain_gas_${e}`, r.userData = { worldType: "gas", gasVariant: e, seed: i.seed, seedInt: i.seedInt, generator: "aurora-gas-2", terrain: true };
  let s = new P(...n.tilt || i.features.axis).normalize();
  r.quaternion.setFromUnitVectors(new P(0, 1, 0), s);
  let o = oy(i, e, r.quaternion), a = await ay(o, t, {yieldWork,signal}), l = new P(1, 1, 1).normalize(), c = l.clone().applyQuaternion(r.quaternion.clone().invert()), h = [], u = [], d = [], f = 0, m = ["Deep_Opaque_Cloud_Deck", "Middle_Broken_Cloud_Banks", "High_Translucent_Cloud_Wisps"];
  for (let w = 0; w < 3; w++) {
    if(yieldWork)await new Promise(resolve=>setTimeout(resolve,0));
    let b = new lt();
    u.push(b);
    let A = c.clone();
    d.push(A);
    let C = ly(o, w, n, t), T = hy(a, w, A, b), E = new Xt(C, T);
    E.name = m[w], E.renderOrder = w ? 10 + w : 0, E.receiveShadow = true, E.castShadow = false, E.userData = { terrainSurface: w === 0, atmosphere: true, worldType: "gas", cloudDeck: w, nominalRadius: [99.3, 101.45, 103.6][w], densityGaps: w > 0 }, r.add(E), h.push(E), f += C.index.count / 3;
  }
  let g = new $e(1, t === "low" ? 64 : 112, t === "low" ? 40 : 72);
  for (let w = 0; w < 2; w++) {
    let b = new Xt(g, uy(n.haze[w], [0.15, 0.085][w], [2.8, 3.6][w], l));
    b.scale.setScalar([106, 108][w]), b.name = w ? "Upper_Atmospheric_Scattering" : "Lower_Atmospheric_Transition", b.renderOrder = 14 + w, b.userData = { atmosphere: true, decorative: true, haze: true }, r.add(b), f += g.index.count / 3;
  }
  let _ = dy(r, e, n, l, t);
  f += _.triangles;
  let p = `aurora-gas-2|${e}|${i.seedInt}`, y = r.quaternion.clone().invert(), M = new P(0, 1, 0), v;
  return e === "saturn" ? v = new P(0.92, 0.53, 1.55).normalize().applyQuaternion(r.quaternion) : e === "uranus" && (v = new P(1.2, 0.3, 1.7).normalize().applyQuaternion(r.quaternion)), { root: r, signature: p, fitPoints: _.fitPoints, viewDirection: v, stats: { triangles: f, terrainTriangles: f - _.triangles, waterTriangles: 0, trees: 0, crystals: 0, rocks: 0, worker: false, quality: t, divisions: a.width, signature: p, cloudDecks: 3, hazeLayers: 2, rings: _.rings, variant: e }, update(w) {
    let b = [7e-4, -11e-4, 162e-5];
    for (let A = 0; A < h.length; A++) h[A].rotation.y = w * b[A] * n.speed;
    for (let A = 0; A < u.length; A++) u[A].set((h[A].rotation.y - h[1].rotation.y) / js, (h[A].rotation.y - h[2].rotation.y) / js);
  }, setLight(w) {
    l.copy(w).normalize(), c.copy(l).applyQuaternion(y);
    for (let b = 0; b < d.length; b++) d[b].copy(c).applyAxisAngle(M, -h[b].rotation.y);
  }, dispose() {
    let w = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Set([...a.color, ...a.bump]);
    _.map && A.add(_.map), r.traverse((C) => {
      if (C.geometry && w.add(C.geometry), C.material) for (let T of Array.isArray(C.material) ? C.material : [C.material]) b.add(T);
    });
    for (let C of w) C.dispose();
    for (let C of b) C.dispose();
    for (let C of A) C.dispose();
    r.clear();
  } };
}
async function fy(field,quality,useWorker,signal) {
 signal?.throwIfAborted();
 if(!useWorker||typeof Worker==='undefined'||typeof Blob==='undefined')return {arrays:$c(field,quality),usedWorker:false};
 const code='const createWorldField='+Jc.toString()+';const makeTerrainArrays='+$c.toString()+';onmessage=event=>{try{const {type,seed,quality}=event.data;const a=makeTerrainArrays(createWorldField(type,seed),quality);postMessage(a,[a.positions.buffer,a.colors.buffer,a.materialIndices.buffer,a.waterPositions.buffer,a.waterColors.buffer]);}catch(e){postMessage({error:String(e.stack||e)});}}';
 const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));let worker,abort;
 try{return {arrays:await new Promise((resolve,reject)=>{
  worker=new Worker(url);abort=()=>reject(signal.reason||new DOMException('Cancelled','AbortError'));signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=e=>e.data.error?reject(new Error(e.data.error)):resolve(e.data);worker.onerror=e=>reject(new Error(e.message));worker.postMessage({type:field.type,seed:field.seed,quality});
 }),usedWorker:true};}catch(error){signal?.throwIfAborted();return {arrays:$c(field,quality),usedWorker:false};}
 finally{signal?.removeEventListener('abort',abort);worker?.terminate();URL.revokeObjectURL(url);}
}
function py() {
  let i = [], t = [];
  for (let r = 0; r < 2; r++) for (let s = 0; s < 5; s++) {
    let o = s / 5 * Math.PI * 2;
    i.push(Math.cos(o) * 0.42, r * 1.55, Math.sin(o) * 0.42);
  }
  i.push(0.12, 2.25, -0.04);
  for (let r = 0; r < 5; r++) {
    let s = (r + 1) % 5;
    t.push(r, s, r + 5, s, s + 5, r + 5, r + 5, s + 5, 10), r > 0 && r < 4 && t.push(0, s, r);
  }
  let n = new ue();
  return n.setAttribute("position", new Jt(i, 3)), n.setIndex(t), n.computeVertexNormals(), n.toNonIndexed();
}
function my(i, t, e, n) {
  let r = e === "low" ? { trees: 650, crystals: 520, rocks: 90, attempts: 18e3 } : e === "medium" || e === "mid" ? { trees: 1200, crystals: 1100, rocks: 150, attempts: 36e3 } : { trees: 1700, crystals: 1650, rocks: 230, attempts: 52e3 };
  if (t.type === "gas") return { trees: 0, crystals: 0, rocks: 0, triangles: 0 };
  let s = (t.seedInt ^ 2535700177) >>> 0, o = () => {
    s = s + 1831565813 >>> 0;
    let v = s;
    return v = Math.imul(v ^ v >>> 15, v | 1), v ^= v + Math.imul(v ^ v >>> 7, v | 61), ((v ^ v >>> 14) >>> 0) / 4294967296;
  }, a = n.map((v) => ({ direction: Array.isArray(v.direction) ? v.direction : [v.direction.x, v.direction.y, v.direction.z], threshold: Math.cos(v.angularRadius || 0) })), l = (v) => a.some((w) => v[0] * w.direction[0] + v[1] * w.direction[1] + v[2] * w.direction[2] > w.threshold), c = [], h = [], u = [];
  for (let v = 0; v < r.attempts; v++) {
    let w = o() * 2 - 1, b = o() * Math.PI * 2, A = Math.sqrt(1 - w * w), C = [Math.cos(b) * A, w, Math.sin(b) * A], T = o(), E = 0.73 + o() * 0.78, L = o() * Math.PI * 2, z = o();
    if (l(C)) continue;
    let W = t.sample(...C);
    if (t.type === "terrestrial" && c.length < r.trees && W.forest > 0.24 && T < W.forest * 0.64) c.push({ p: C, h: W.height, scale: E, turn: L, variant: z });
    else if (t.type === "mars" && h.length < r.crystals && W.crystal > 0.31 && T < W.crystal * 0.86) {
      if (h.push({ p: C, h: W.height, scale: E * (0.8 + W.crystal * 0.67), turn: L, variant: z }), z > 0.65 && h.length < r.crystals) {
        let tt = new P(...C), Q = new P(0, 1, 0).cross(tt).normalize().multiplyScalar(6e-3 * E), Y = tt.add(Q).normalize().toArray();
        l(Y) || h.push({ p: Y, h: t.sample(...Y).height, scale: E * 0.53, turn: L + 0.5, variant: 1 - z });
      }
    } else u.length < r.rocks && T < 9e-3 && W.land && W.lava < 0.05 && W.safe > 0.3 && (t.type !== "terrestrial" || W.height > 4) && u.push({ p: C, h: W.height, scale: E * (t.type === "moon" ? 0.7 : 0.85), turn: L, variant: z });
  }
  let d = new Ne();
  d.name = "Natural_Regions", d.userData = { decorative: true, geologicalChannel: "flora-and-rocks" }, i.add(d);
  let f = new He(), m = new P(0, 1, 0), g = new P(), _ = new ie(), p = 0;
  function y(v, w, b, A, C) {
    if (!A.length) {
      w.dispose(), b.dispose();
      return;
    }
    let T = new _s(w, b, A.length);
    T.name = v, T.userData = { decorative: true, kind: C }, T.castShadow = true, T.receiveShadow = true;
    for (let E = 0; E < A.length; E++) {
      let L = A[E];
      g.fromArray(L.p), f.position.copy(g).multiplyScalar(t.radius + L.h - 0.09), f.quaternion.setFromUnitVectors(m, g), f.rotateY(L.turn), C === "crystal" && f.rotateZ((L.variant - 0.5) * 0.26), f.scale.set(L.scale, L.scale * (C === "rock" ? 0.7 : 1), L.scale), f.updateMatrix(), T.setMatrixAt(E, f.matrix), C === "tree" ? _.set(L.variant > 0.62 ? "#448653" : "#2e784e") : C === "crystal" ? _.set(L.variant > 0.76 ? "#e1a6ff" : L.variant > 0.4 ? "#bd71ef" : "#a14ce0") : C === "rock" ? _.set(t.type === "mars" ? "#ba6248" : t.type === "moon" ? "#a0aaa9" : "#758087") : _.set("#716043"), T.setColorAt(E, _);
    }
    T.instanceMatrix.needsUpdate = true, T.computeBoundingSphere(), d.add(T), p += (w.index ? w.index.count : w.attributes.position.count) / 3 * A.length;
  }
  let M = (v) => new sn({ color: 16777215, roughness: 1, metalness: 0, flatShading: true, ...v });
  if (c.length) {
    let v = new un(0.09, 0.14, 0.8, 4);
    v.translate(0, 0.4, 0);
    let w = new Ss(0.78, 2.7, 5);
    w.translate(0, 1.98, 0), y("Forest_Trunks", v, M(), c, "trunk"), y("Forest_Canopies", w, M(), c, "tree");
  }
  return h.length && y("Rift_Crystal_Clusters", py(), M({ roughness: 0.58, emissive: "#4e136f", emissiveIntensity: 0.07 }), h, "crystal"), u.length && y("Sparse_Geological_Outcrops", new Es(0.7, 0), M(), u, "rock"), { trees: c.length, crystals: h.length, rocks: u.length, triangles: p };
}
async function Kc(i, { quality: t = "high", worker: e = false, exclusions: n = [], signal } = {}) {
  if (i.type === "gas") return tf(i, { quality: t, yieldWork: e, signal });
  let { arrays: r, usedWorker: s } = await fy(i, t, e, signal), o = new Ne();
  o.name = `World_Terrain_${i.type}`, o.userData = { worldType: i.type, seed: i.seed, seedInt: i.seedInt, generator: i.version, terrain: true };
  let a = new ue();
  a.setAttribute("position", new ze(r.positions, 3)), a.setAttribute("color", new ze(r.colors, 3)), a.computeVertexNormals(), a.computeBoundingSphere();
  let l = new sn({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }), c = new sn({ vertexColors: true, roughness: 0.8, metalness: 0, flatShading: true, emissive: "#b53e0d", emissiveIntensity: 0.76 }), h = 0;
  for (let g = 0; g < r.triangleCount; g++) r.materialIndices[g] || h++;
  if (h < r.triangleCount) {
    let g = new Uint32Array(r.triangleCount * 3), _ = 0, p = h * 3;
    for (let y = 0; y < r.triangleCount; y++) {
      let M = r.materialIndices[y] ? p : _;
      g[M] = y * 3, g[M + 1] = y * 3 + 1, g[M + 2] = y * 3 + 2, r.materialIndices[y] ? p += 3 : _ += 3;
    }
    a.setIndex(new ze(g, 1)), a.addGroup(0, h * 3, 0), a.addGroup(h * 3, (r.triangleCount - h) * 3, 1);
  } else a.addGroup(0, r.triangleCount * 3, 0);
  let u = new Xt(a, [l, c]);
  u.name = i.type === "gas" ? "Continuous_Cloud_Tops" : "Continuous_Geological_Surface", u.receiveShadow = true, u.castShadow = false, u.userData = { terrainSurface: true, worldType: i.type }, o.add(u);
  let d = 0;
  if (r.waterPositions.length) {
    let g = new ue();
    g.setAttribute("position", new ze(r.waterPositions, 3)), g.setAttribute("color", new ze(r.waterColors, 3)), g.computeVertexNormals();
    let _ = new Xt(g, new sn({ vertexColors: true, flatShading: true, roughness: 0.82, metalness: 0.02 }));
    _.name = "Ocean_Sea_Level_0", _.userData = { water: true, terrainSurface: true }, _.receiveShadow = true, o.add(_), d = r.waterPositions.length / 9;
  }
  if (i.type === "gas") {
    let g = new Xt(new Wi(102.8, 12), new Hi({ color: "#9bbcca", side: Je, transparent: true, opacity: 0.085, depthWrite: false, blending: Ws }));
    g.name = "Thin_Cloud_Limb", g.userData = { atmosphere: true }, o.add(g);
  }
  let f = my(o, i, t, n), m = `${i.version}|${i.type}|${i.seedInt}`;
  return { root: o, signature: m, stats: { triangles: r.triangleCount + d + f.triangles, terrainTriangles: r.triangleCount, waterTriangles: d, trees: f.trees, crystals: f.crystals, rocks: f.rocks, worker: s, quality: t, divisions: r.divisions, signature: m }, update(g) {
    i.type === "mercury" && (c.emissiveIntensity = 0.76 + Math.sin(g * 0.55) * 0.035);
  }, dispose() {
    let g = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set();
    o.traverse((p) => {
      if (p.geometry && g.add(p.geometry), p.material) for (let y of Array.isArray(p.material) ? p.material : [p.material]) _.add(y);
    });
    for (let p of g) p.dispose();
    for (let p of _) p.dispose();
    o.clear();
  } };
}
var yy = { ivory: [15328470, 0.64, 0.08], white: [16250090, 0.56, 0.06], navy: [2834517, 0.6, 0.22], dark: [1517113, 0.76, 0.16], steel: [6850202, 0.46, 0.5], cyan: [4643054, 0.32, 0.12], blue: [1472681, 0.38, 0.2], yellow: [16760626, 0.48, 0.18], purple: [9128922, 0.46, 0.18], crystal: [13004786, 0.34, 0.15], green: [8894281, 0.86, 0], leaf: [3772004, 0.82, 0], glass: [7590885, 0.22, 0.02], amber: [16099671, 0.38, 0.08], ore: [8744025, 1, 0], rubber: [2109498, 1, 0] }, Ae = Object.fromEntries(Object.entries(yy).map(([i, [t, e, n]]) => {
  let r = new sn({ name: "AURORA_" + i, color: t, roughness: e, metalness: n });
  return i === "cyan" && (r.emissive.setHex(2604760), r.emissiveIntensity = 0.3), i === "crystal" && (r.emissive.setHex(8595630), r.emissiveIntensity = 0.14), i === "glass" && (r.transparent = true, r.opacity = 0.26, r.depthWrite = false, r.side = on), [i, r];
})), th = /* @__PURE__ */ new Map(), ul = (i, t) => (th.has(i) || th.set(i, t()), th.get(i)), vy = (i) => typeof i == "string" ? Ae[i] || Ae.ivory : i;
function N(i, t, e = [0, 0, 0]) {
  let n = new Ne();
  return n.name = t, n.position.fromArray(e), i?.add(n), n;
}
function di(i, t, e, n, r) {
  let s = new Xt(e, vy(r));
  return s.name = t, s.position.fromArray(n || [0, 0, 0]), s.castShadow = r !== "glass", s.receiveShadow = true, r === "glass" && (s.castShadow = false, s.renderOrder = 2), i?.add(s), s;
}
function x(i, t, e = [1, 1, 1], n = [0, 0, 0], r = "ivory", s = 0.06) {
  let o = e.map((c) => Math.max(Math.abs(c), 1e-3)), a = Math.min(s, ...o.map((c) => c * 0.2)), l = ul("b" + o.join(",") + "," + a, () => {
    if (a <= 4e-3) return new $n(...o);
    let c = [];
    for (let h of [-1, 1]) for (let u of [-1, 1]) for (let d of [-1, 1]) c.push(new P(h * (o[0] / 2 - a), u * o[1] / 2, d * (o[2] / 2 - a))), c.push(new P(h * o[0] / 2, u * (o[1] / 2 - a), d * (o[2] / 2 - a))), c.push(new P(h * (o[0] / 2 - a), u * (o[1] / 2 - a), d * o[2] / 2));
    return new to(c);
  });
  return di(i, t, l, n, r);
}
function U(i, t, e, n, r, s = [0, 0, 0], o = "navy", a = 12) {
  let l = ["c", e, n, r, a].join(",");
  return di(i, t, ul(l, () => new un(e, n, r, a, 1)), s, o);
}
function Ye(i, t, e, n = [0, 0, 0], r = "cyan", s = 1) {
  return di(i, t, ul("s" + e + "," + s, () => new Wi(e, s)), n, r);
}
function Re(i, t, e, n, r = [0, 0, 0], s = "ivory", o = 8, a = 32, l = Math.PI * 2) {
  let c = ["t", e, n, o, a, l].join(",");
  return di(i, t, ul(c, () => new Us(e, n, o, a, l)), r, s);
}
function bt(i, t, e, n, r, s = r, o = "navy") {
  let a = new P(...e), l = new P(...n), c = l.clone().sub(a), h = x(i, t, [r, Math.max(1e-3, c.length()), s], a.add(l).multiplyScalar(0.5).toArray(), o, Math.min(r, s) * 0.09);
  return h.quaternion.setFromUnitVectors(new P(0, 1, 0), c.normalize()), h;
}
function ht(i, t, e, n = 0.14, r = "yellow") {
  let s = N(i, t);
  s.userData.purpose = "\u8FDE\u63A5\u4E24\u7AEF\u8BBE\u5907\u7684\u5C01\u95ED\u7BA1\u8DEF";
  for (let o = 0; o < e.length - 1; o++) {
    let a = new P(...e[o]), l = new P(...e[o + 1]), c = l.clone().sub(a);
    if (c.length() < 1e-4) continue;
    U(s, "Pipe_" + o, n, n, c.length(), a.add(l).multiplyScalar(0.5).toArray(), r, 8).quaternion.setFromUnitVectors(new P(0, 1, 0), c.normalize());
  }
  for (let o = 1; o < e.length - 1; o++) Ye(s, "Elbow_" + o, n * 1.04, e[o], r, 1);
  return s;
}
function Vt(i, t, e, n, r = [0, 0, 0], s = "ivory", o = 0.04) {
  let a = new Vi(e.map((c) => new lt(...c))), l = new Fr(a, { depth: Math.max(1e-3, n), bevelEnabled: o > 0, bevelSegments: 1, steps: 1, bevelSize: o, bevelThickness: o, curveSegments: 1 });
  return l.translate(0, 0, -n / 2), di(i, t, l, r, s);
}
function fi(i, t, e, n, r = [0, 0, 0], s = "ivory", o = 0.04) {
  let a = new Vi(e.map(([c, h]) => new lt(c, -h))), l = new Fr(a, { depth: n, bevelEnabled: o > 0, bevelSegments: 1, steps: 1, bevelSize: o, bevelThickness: o, curveSegments: 1 });
  return l.rotateX(-Math.PI / 2), di(i, t, l, r, s);
}
function Ft(i, t, e, n, r = [0, 0, 0], s = 0.28) {
  let o = e / 2, a = n / 2, l = Math.min(0.38, e * 0.12, n * 0.12);
  return fi(i, t, [[-o + l, -a], [o - l, -a], [o, -a + l], [o, a - l], [o - l, a], [-o + l, a], [-o, a - l], [-o, -a + l]], s, r, "navy", 0);
}
function zt(i, t, e, n, r = 0.45, s = 0) {
  let o = N(i, t, e);
  o.rotation.y = s, x(o, "WindowRecess", [n + 0.15, r + 0.16, 0.12], [0, 0, 0], "dark", 0.025), x(o, "Glazing", [n, r, 0.045], [0, 0, 0.079], "cyan", 0.012);
  let a = Math.max(1, Math.round(n / 1.2));
  for (let l = 1; l < a; l++) x(o, "Mullion_" + l, [0.055, r, 0.055], [-n / 2 + n * l / a, 0, 0.092], "navy", 0);
  return o;
}
function fe(i, t, e, n = 1.4, r = 1.8) {
  let s = N(i, t, e);
  s.userData.purpose = "\u5BC6\u95ED\u95E8\u4E0E\u95E8\u6846\uFF0C\u6B63\u524D\u65B9\u7559\u51FA\u901A\u884C\u7A7A\u95F4", x(s, "Recess", [n + 0.48, r + 0.3, 0.33], [0, r / 2, 0], "dark"), x(s, "PressureDoor", [n, r, 0.15], [0, r / 2, 0.19], "steel", 0.035), x(s, "DoorWindow", [n * 0.7, 0.28, 0.035], [0, r * 0.75, 0.285], "cyan", 0), x(s, "DoorSeam", [0.035, r, 0.02], [0, r / 2, 0.285], "navy", 0);
  for (let o of [-1, 1]) x(s, "Jamb_" + o, [0.16, r + 0.18, 0.36], [o * (n / 2 + 0.17), r / 2, 0.2], "yellow", 0.035);
  return x(s, "Lintel", [n + 0.8, 0.22, 0.44], [0, r + 0.12, 0.11], "ivory", 0.05), s;
}
function ce(i, t, e, n, r, s, o = "navy") {
  let a = Vt(i, t, [[-n / 2, 0], [-n / 2, r], [n / 2, 0]], e, [0, 0, 0], o, 0);
  a.rotation.y = -Math.PI / 2, a.position.set(s[0], s[1], s[2] + n / 2);
  let l = N(i, t + "_EdgeMarkers", s);
  for (let c of [-1, 1]) bt(l, "ThresholdRail_" + c, [c * (e / 2 - 0.075), r + 0.025, 0], [c * (e / 2 - 0.075), 0.025, n], 0.09, 0.06, "yellow");
  return a;
}
function ye(i, t, e, n = 1.3, r = 0.9) {
  let s = N(i, t, e);
  x(s, "VentFrame", [n, 0.12, r], [0, 0, 0], "steel", 0.025), x(s, "VentRecess", [n - 0.12, 0.03, r - 0.1], [0, 0.075, 0], "dark", 0);
  for (let o = 0; o < 4; o++) x(s, "Louver_" + o, [n - 0.14, 0.045, 0.055], [0, 0.105, -r * 0.32 + o * r * 0.21], "navy", 0);
  return s;
}
function Zt(i, t, e, n = 2) {
  let r = N(i, t, e);
  return U(r, "Mount", 0.27, 0.35, 0.23, [0, 0.115, 0], "steel", 8), U(r, "Mast", 0.055, 0.09, n, [0, n / 2 + 0.2, 0], "navy", 8), U(r, "Beacon", 0.075, 0.075, 0.23, [0, n + 0.24, 0], "yellow", 8), r;
}
function je(i, t, e, n = 1, r = 3, s = "ivory") {
  let o = N(i, t, e);
  return o.userData.purpose = "\u5E26\u5C01\u5934\u3001\u68C0\u4FEE\u53E3\u4E0E\u843D\u5730\u652F\u5EA7\u7684\u5C01\u95ED\u50A8\u7F50", U(o, "Foot", n * 1.12, n * 1.15, 0.28, [0, 0.14, 0], "navy", 12), U(o, "LowerHead", n, n * 0.77, 0.34, [0, 0.45, 0], s, 12), U(o, "PressureShell", n, n, Math.max(0.1, r - 1), [0, r / 2 + 0.12, 0], s, 12), U(o, "TopHead", n * 0.74, n, 0.4, [0, r - 0.26, 0], s, 12), U(o, "Manhole", n * 0.32, n * 0.42, 0.18, [0, r + 0.02, 0], "navy", 12), U(o, "TopBand", n * 1.015, n * 1.015, 0.17, [0, r - 0.62, 0], "yellow", 12), x(o, "LevelGauge", [0.18, r * 0.48, 0.08], [0, r * 0.48, n + 0.025], "cyan", 0.025), o;
}
function se(i, t, e, n = 3, r = 2.7, s = 2.2, o = "lab") {
  let a = N(i, t, e);
  a.userData.label = t, Ft(a, "LocalFoot", n + 0.35, r + 0.35);
  let l = n / 2;
  if (Vt(a, "PressureShell", [[-l, 0.3], [l, 0.3], [l, s - 0.25], [l - 0.4, s], [-l + 0.4, s], [-l, s - 0.25]], r, [0, 0, 0], o === "cargo" ? "steel" : "ivory", 0.055), x(a, "LowerFrame", [n + 0.03, 0.25, r + 0.04], [0, 0.49, 0], "navy", 0.055), o === "control") x(a, "CabinCap", [n * 0.83, 0.3, r * 0.83], [0, s + 0.17, 0], "navy"), zt(a, "FrontWindows", [0, s - 0.53, r / 2 + 0.065], n * 0.72, 0.42), zt(a, "SideWindows", [n / 2 + 0.035, s - 0.6, 0], r * 0.67, 0.4, Math.PI / 2), Zt(a, "CommsMast", [n * 0.24, s + 0.33, -r * 0.23], 1.1), fe(a, "Access", [-n * 0.25, 0.29, r / 2 + 0.04], Math.min(0.84, n * 0.28), Math.min(1.1, s * 0.45));
  else if (o === "cargo") {
    let c = n * 0.7, h = s * 0.7;
    x(a, "CargoDoorRecess", [c + 0.15, h + 0.2, 0.08], [0, h / 2 + 0.3, r / 2 + 0.06], "dark", 0.025), x(a, "CargoDoor", [c, h, 0.09], [0, h / 2 + 0.3, r / 2 + 0.11], "navy", 0.03);
    for (let u = 1; u < 4; u++) x(a, "RollerDoorSlat_" + u, [c, 0.055, 0.03], [0, 0.3 + h * u / 4, r / 2 + 0.17], "steel", 0);
    for (let u of [-1, 1]) x(a, "DockJamb_" + u, [0.17, h + 0.15, 0.19], [u * (c / 2 + 0.12), h / 2 + 0.35, r / 2 + 0.12], "yellow");
  } else zt(a, "FrontWindows", [0, s - 0.5, r / 2 + 0.06], n * 0.58, 0.36), fe(a, "ServiceDoor", [0, 0.29, r / 2 + 0.07], Math.min(0.9, n * 0.31), Math.min(1.12, s * 0.48)), o === "utility" ? ye(a, "CoolingVent", [0, s + 0.06, 0], n * 0.67, r * 0.52) : zt(a, "SideGlazing", [n / 2 + 0.05, s * 0.61, 0], r * 0.6, 0.42, Math.PI / 2);
  for (let c of [-1, 1]) x(a, "CornerProtection_" + c, [0.22, 0.8, 0.26], [c * (n / 2 - 0.1), 0.7, r / 2 + 0.1], "yellow");
  return a;
}
function ge(i, t, e, n, r = 1.2) {
  let s = new P(...e), o = new P(...n), a = o.clone().sub(s), l = N(i, t, s.add(o).multiplyScalar(0.5).toArray());
  l.rotation.y = Math.atan2(a.x, a.z);
  let c = Math.hypot(a.x, a.z);
  x(l, "Floor", [r, 0.22, c], [0, -0.45, 0], "navy", 0.025), x(l, "PressurePassage", [r * 0.9, 0.82, c], [0, 0, 0], "ivory", 0.08), x(l, "RoofSpine", [r * 0.58, 0.12, c + 0.08], [0, 0.46, 0], "navy", 0.035);
  for (let h of [-1, 1]) x(l, "SideGlass_" + h, [0.035, 0.28, c * 0.68], [h * r * 0.452, 0.05, 0], "cyan", 0), x(l, "EndCoupler_" + h, [r + 0.16, 1.03, 0.15], [0, -0.02, h * (c / 2 - 0.075)], "navy", 0.035);
  return Math.abs(a.y) > 0.01 && (l.rotation.x = -Math.atan2(a.y, c)), l;
}
function eo(i, t, e, n = 1) {
  let r = N(i, t, e);
  return r.userData.purpose = "\u79D1\u5E7B\u60AC\u6D6E\u652F\u6491\uFF1B\u673A\u68B0\u5B89\u88C5\u9762\u4F4D\u4E8E\u9876\u90E8\uFF0C\u5E95\u9762\u6709\u79BB\u5730\u95F4\u9699", U(r, "Mount", n * 0.9, n * 0.95, n * 0.3, [0, -n * 0.15, 0], "steel", 10), U(r, "LiftHousing", n, n * 0.68, n * 0.64, [0, -n * 0.58, 0], "navy", 10), U(r, "FieldEmitter", n * 0.68, n * 0.6, n * 0.17, [0, -n * 0.985, 0], "cyan", 10), U(r, "EmitterGuard", n * 0.6, n * 0.43, n * 0.16, [0, -n * 1.15, 0], "dark", 10), r;
}
function we(i, t) {
  return i.userData.motion = { ...t }, i;
}
function Qn(i, t, e, n = 1, r = 0) {
  let s = N(i, t, e);
  s.rotation.y = r, U(s, "BoltedBase", n * 0.62, n * 0.72, n * 0.35, [0, n * 0.175, 0], "navy", 12);
  let o = N(s, "Azimuth", [0, n * 0.38, 0]);
  U(o, "Turntable", n * 0.49, n * 0.58, n * 0.26, [0, n * 0.08, 0], "steel", 12);
  let a = N(o, "Shoulder", [0, n * 0.32, 0]), l = U(a, "ShoulderPin", n * 0.35, n * 0.35, n * 0.85, [0, 0, 0], "navy", 12);
  l.rotation.z = Math.PI / 2;
  for (let d of [-1, 1]) {
    let f = U(a, "PinCap_" + d, n * 0.26, n * 0.26, n * 0.075, [d * n * 0.46, 0, 0], "yellow");
    f.rotation.z = Math.PI / 2;
  }
  bt(a, "UpperArm", [0, 0, 0], [0, 2.3 * n, 1.4 * n], 0.64 * n, 0.68 * n, "yellow"), ht(a, "HydraulicActuator", [[0.36 * n, 0.3 * n, 0.03 * n], [0.36 * n, 1.9 * n, 1.25 * n]], 0.11 * n, "steel");
  let c = N(a, "Elbow", [0, 2.3 * n, 1.4 * n]), h = U(c, "ElbowPin", n * 0.29, n * 0.29, n * 0.8, [0, 0, 0], "navy");
  h.rotation.z = Math.PI / 2, bt(c, "Forearm", [0, 0, 0], [0, -0.6 * n, 1.3 * n], n * 0.44, n * 0.5, "yellow");
  let u = N(c, "Wrist", [0, -0.6 * n, 1.3 * n]);
  x(u, "ToolCoupler", [n * 0.59, n * 0.43, n * 0.48], [0, 0, 0], "navy");
  for (let d of [-1, 1]) {
    let f = N(u, "Gripper_" + d, [d * 0.35 * n, 0, 0.15 * n]);
    bt(f, "ClampFinger", [0, 0, 0], [-d * 0.08 * n, -0.55 * n, 0.32 * n], n * 0.15, n * 0.18, "steel"), x(f, "JawPad", [n * 0.2, n * 0.12, n * 0.32], [-d * 0.08 * n, -0.52 * n, 0.28 * n], "rubber");
  }
  return we(a, { type: "swing", axis: "x", range: 0.055, speed: 0.55 }), we(c, { type: "swing", axis: "x", range: 0.07, speed: 0.55, phase: Math.PI }), s;
}
function qr(i, t, e, n = 2.2) {
  let r = N(i, t, e);
  U(r, "Foot", n * 0.38, n * 0.55, 0.32, [0, 0.16, 0], "navy", 10), U(r, "Pedestal", n * 0.22, n * 0.32, n * 0.7, [0, n * 0.35 + 0.28, 0], "ivory", 10);
  let s = N(r, "Azimuth", [0, n * 0.7 + 0.3, 0]), o = N(s, "Elevation", [0, n * 0.25, 0]);
  o.rotation.x = -Math.PI * 0.19;
  let a = [];
  for (let f = 0; f <= 12; f++) {
    let m = n * f / 12;
    a.push(new lt(m, 0.29 * n * (m / n) ** 2));
  }
  let l = new Tn([...a].reverse(), 24);
  l.rotateX(Math.PI / 2);
  let c = di(o, "Reflector", l, [0, 0, 0], "ivory");
  c.material = Ae.ivory;
  let h = new Tn(a, 24);
  h.rotateX(Math.PI / 2);
  let u = di(o, "BackShell", h, [0, 0, -0.065], "navy");
  u.scale.set(1.025, 1.025, 1.025), u.material = Ae.navy, Re(o, "RolledRim", n, 0.085, [0, 0, 0.29 * n], "ivory", 6, 24);
  let d = [0, 0, n * 0.68];
  for (let f = 0; f < 3; f++) {
    let m = f * Math.PI * 2 / 3;
    bt(o, "FeedStrut_" + f, [Math.cos(m) * n * 0.85, Math.sin(m) * n * 0.85, 0.29 * n * 0.85 ** 2], d, 0.065, 0.065, "navy");
  }
  return Ye(o, "Feed", n * 0.12, d, "yellow", 1), we(s, { type: "swing", axis: "y", range: 0.22, speed: 0.16 }), r;
}
function Ci(i, t, e, n = 1, r = 4, s = "purple") {
  let o = [];
  for (let a = 0; a < 6; a++) {
    let l = a * Math.PI / 3;
    o.push(new P(Math.cos(l) * n, 0, Math.sin(l) * n)), o.push(new P(Math.cos(l) * n * 0.85, r * 0.64, Math.sin(l) * n * 0.85));
  }
  return o.push(new P(n * 0.12, r, n * 0.08)), di(i, t, new to(o), e, s);
}
function he(i) {
  let t = N(null, i);
  return t.userData = { id: i, coordinateSystem: "Y_UP_FRONT_POSITIVE_Z", unit: "model_unit", origin: "main_foundation_center", design: [] }, { root: t, main: N(t, "Main"), support: N(t, "Support"), links: N(t, "Connections") };
}
function eh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Command_Center");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u57FA\u7840\u6307\u6325\u57FA\u5730", additions: ["\u5B8C\u6574\u7A79\u9876\u4E0E\u56DB\u7247\u627F\u529B\u7FFC", "\u6307\u6325\u8231\u4E0E\u4E3B\u6C14\u95F8", "\u751F\u547D\u7EF4\u6301\u7AD9"] }, { level: 2, label: "\u533A\u57DF\u6307\u6325\u57FA\u5730", additions: ["\u901A\u4FE1\u8231\u4E0E\u53EF\u8F6C\u52A8\u901A\u4FE1\u789F", "\u9876\u90E8\u901A\u4FE1\u5929\u7EBF\u4E0E\u8BBE\u5907\u53F0"] }, { level: 3, label: "\u7EFC\u5408\u6307\u6325\u57FA\u5730", additions: ["\u884C\u653F\u9644\u697C", "\u767B\u9646\u63A5\u5F85\u4EAD\u4E0E\u63A5\u9A73\u6B65\u9053", "\u6269\u5C55\u6307\u6325\u8231"] }], t.userData.design = ["\u56DB\u7247\u5F84\u5411\u6954\u5F62\u627F\u529B\u7FFC\u8FDE\u63A5\u7A79\u9876\u88D9\u8FB9\u4E0E\u72EC\u7ACB\u57FA\u811A\uFF0C\u4E3B\u5165\u53E3\u5E03\u7F6E\u5728\u524D\u65B9\u4E24\u7FFC\u4E4B\u95F4\u3002", "\u751F\u547D\u7EF4\u6301\u53CC\u7F50\u7ECF\u5BC6\u95ED\u7BA1\u9053\u63A5\u5165\u4E3B\u697C\uFF1B\u901A\u4FE1\u3001\u884C\u653F\u53CA\u63A5\u5F85\u8BBE\u65BD\u5404\u6709\u72EC\u7ACB\u529F\u80FD\u548C\u901A\u884C\u8FDE\u63A5\u3002", "\u6240\u6709\u9636\u6BB5\u4FDD\u7559\u5B8C\u6574\u53EF\u8FD0\u884C\u6307\u6325\u697C\uFF1B\u5347\u7EA7\u589E\u52A0\u8BBE\u5907\u5BB9\u91CF\u548C\u914D\u5957\u5EFA\u7B51\u3002"], t.userData.pivots = ["Communications_Dish_Azimuth", "Communications_Dish_Elevation"], U(e, "Dodecagonal_Foundation", 5.95, 6.18, 0.34, [0, 0.17, 0], "navy", 12), U(e, "Foundation_Step", 5.6, 5.85, 0.45, [0, 0.565, 0], "steel", 12), U(e, "Operations_Floor", 5.5, 5.5, 2.05, [0, 1.78, 0], "ivory", 12), U(e, "Window_Recess", 5.55, 5.55, 0.65, [0, 1.8, 0], "navy", 12);
  for (let c = 0; c < 12; c++) {
    let h = (c + 0.5) * Math.PI / 6, u = [Math.sin(h) * 5.38, 1.8, Math.cos(h) * 5.38];
    zt(e, `Operations_Window_${c + 1}`, u, 2.16, 0.46, h);
    let d = x(e, `Skirt_Joint_${c + 1}`, [0.19, 0.87, 0.28], [Math.sin(h + Math.PI / 12) * 5.43, 1.8, Math.cos(h + Math.PI / 12) * 5.43], "steel", 0.025);
    d.rotation.y = h + Math.PI / 12;
  }
  U(e, "Dome_Lower_Ring", 5.37, 5.55, 0.42, [0, 2.89, 0], "navy", 24);
  let s = new Xt(new $e(5.19, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), Ae.ivory);
  s.name = "Pressure_Dome", s.position.y = 3.04, s.castShadow = true, s.receiveShadow = true, e.add(s);
  for (let c = 0; c < 8; c++) {
    let h = new Xt(new $e(5.23, 2, 8, c * Math.PI / 4 - 0.035, 0.07, 0, Math.PI / 2), Ae.navy);
    h.name = `Dome_Meridian_Rib_${c + 1}`, h.position.y = 3.04, h.castShadow = true, h.receiveShadow = true, e.add(h);
  }
  for (let c = 0; c < 4; c++) {
    let h = Math.PI / 4 + c * Math.PI / 2, u = N(e, `Radial_Support_Wing_${c + 1}`, [4.13 * Math.cos(h), 0.36, 4.13 * Math.sin(h)]);
    u.rotation.y = -h, Ft(u, "Local_Wing_Foot", 3.28, 1.93, [1.25, -0.36, 0], 0.36), Vt(u, "Structural_Web", [[-0.42, 0], [2.83, 0], [1.25, 7.46], [0.52, 7.46], [-0.42, 2.7]], 1.46, [0, 0, 0], "ivory", 0.1), Vt(u, "Service_Inset", [[0.66, 0.56], [2.15, 0.56], [1.12, 5.78], [0.8, 5.78], [0.11, 2.45]], 1.74, [0, 0, 0], "navy", 0.03);
    for (let d of [-1, 1]) Vt(u, `Wing_Illuminated_Slit_${d}`, [[0.77, 2.18], [1.36, 2.18], [0.99, 4.9], [0.68, 4.9]], 0.055, [0, 0, d * 0.94], "cyan", 0.012), x(u, `Lower_Inspection_Cover_${d}`, [0.63, 0.32, 0.075], [1.43, 1.08, d * 0.945], "steel", 0.025);
    x(u, "Cap_Marker", [0.84, 0.27, 1.52], [0.88, 7.42, 0], "yellow", 0.055), x(u, "Load_Transfer_Shoe", [2.4, 0.49, 1.83], [1.18, 0.38, 0], "navy", 0.07), x(u, "Foot_Alignment_Marker", [0.53, 0.34, 1.86], [2.09, 0.37, 0], "yellow", 0.045);
  }
  let o = N(e, "Command_Cabin", [0, 7.92, 0]);
  U(o, "Dome_Collar", 1.59, 1.82, 0.36, [0, 0.16, 0], "navy", 8), U(o, "Cabin_Shell", 1.44, 1.44, 1.02, [0, 0.84, 0], "ivory", 8);
  for (let c = 0; c < 8; c++) {
    let h = c * Math.PI / 4;
    zt(o, `Cabin_Window_${c}`, [1.38 * Math.sin(h), 0.87, 1.38 * Math.cos(h)], 1.04, 0.52, h);
  }
  U(o, "Cabin_Roof", 1.63, 1.57, 0.22, [0, 1.45, 0], "navy", 8), x(o, "Navigation_Beacon", [0.55, 0.43, 0.55], [0, 1.78, 0], "yellow", 0.045), i >= 2 && (Zt(o, "Primary_Antenna", [-0.84, 1.55, -0.21], 1.7), Zt(o, "Backup_Antenna", [0.9, 1.55, -0.4], 1.05), x(o, "Equipment_Box", [0.7, 0.44, 0.59], [0.53, 1.72, 0.65], "steel")), i >= 3 && (U(o, "Expanded_Tactical_Crown", 0.89, 1.04, 0.49, [0, 1.77, -0.42], "steel", 8), U(o, "Tactical_Data_Band", 0.91, 0.91, 0.16, [0, 1.92, -0.42], "cyan", 8), Zt(o, "Tactical_Communications_Mast", [0.15, 2.03, -0.49], 1.25));
  let a = N(e, "Main_Airlock", [0, 0.4, 5.28]);
  Vt(a, "Airlock_Shell", [[-1.65, 0], [1.65, 0], [1.38, 2.75], [-1.38, 2.75]], 2.15, [0, 0, 0], "ivory", 0.1), fe(a, "Main_Entrance", [0, 0.1, 1.095], 1.45, 2.05), x(a, "Lintel", [1.48, 0.22, 0.17], [0, 2.41, 1.16], "yellow", 0.03), ce(e, "Entry_Ramp", 2.25, 3.05, 0.5, [0, 0, 6.38]);
  for (let c of [-1.05, 1.05]) bt(e, "Ramp_Edge", [c, 0.53, 6.4], [c, 0.07, 9.37], 0.1, 0.13, "yellow");
  let l = N(n, "Life_Support_Station", [8.6, 0, -3.5]);
  if (l.userData.purpose = "\u6C27\u6C14\u4E0E\u5FAA\u73AF\u6C34\u50A8\u5907\u53CA\u7A7A\u6C14\u5904\u7406", Ft(l, "Station_Foot", 4.4, 4.95, [0, 0, 0]), je(l, "Oxygen_Reservoir", [-0.99, 0.28, -0.65], 0.88, 4.25), je(l, "Water_Reservoir", [1.12, 0.28, 0.41], 0.82, 3.28), x(l, "Air_Processor", [1.35, 1.33, 1.09], [-1, 0.95, 1.31], "steel"), zt(l, "Processor_Status", [-1, 1.08, 1.88], 0.81, 0.27), ht(l, "Reservoir_Manifold", [[-0.99, 1, -0.65], [-0.99, 0.73, 1.61], [1.12, 0.73, 1.61], [1.12, 1.4, 0.41]], 0.14, "yellow"), ht(r, "Life_Support_Supply", [[5, 0.92, -2.5], [6.67, 0.92, -2.5], [6.67, 0.92, -3.5], [8.6, 0.92, -3.5]], 0.24, "navy"), ht(r, "Life_Support_Return", [[4.9, 1.44, -2.75], [6.37, 1.44, -2.75], [6.37, 1.44, -4.05], [7.7, 1.44, -4.05]], 0.12, "yellow"), i >= 2) {
    let c = N(n, "Communications_Module", [-8.8, 0, -3.2]);
    c.userData.purpose = "\u72EC\u7ACB\u536B\u661F\u901A\u4FE1\u7AD9", se(c, "Communications_Cabin", [0, 0, 0], 3.5, 3.4, 2.7, "control");
    let h = qr(c, "Communications_Dish", [0, 3.04, -0.18], 1.78);
    h.rotation.y = -0.35, Zt(c, "Communications_Mast", [1.17, 2.96, -1.12], 1.9), ge(r, "Communications_Corridor", [-4.66, 1, -2.64], [-7.22, 1, -3.2], 1.22);
  }
  if (i >= 3) {
    let c = N(n, "Administration_Annex", [-8.75, 0, 5.16]);
    c.userData.purpose = "\u4EBA\u5458\u884C\u653F\u53CA\u57FA\u5730\u6392\u73ED", se(c, "Office", [0, 0, 0], 4.62, 3.2, 2.41, "lab"), ye(c, "Office_Ventilation", [-0.99, 2.87, -0.41], 1.5, 0.9), x(c, "Roof_Light", [0.51, 0.32, 0.52], [1.48, 2.84, 0.58], "yellow"), Zt(c, "Local_Radio", [-1.7, 2.86, -0.88], 1.05), ge(r, "Administration_Corridor", [-4.13, 1, 3.9], [-6.53, 1, 4.95], 1.25);
    let h = N(n, "Landing_Reception", [8.55, 0, 6.15]);
    h.userData.purpose = "\u7740\u9646\u4EBA\u5458\u68C0\u67E5\u4E0E\u63A5\u5F85\uFF1B\u524D\u65B9\u5C0F\u53F0\u4E3A\u6B65\u884C\u63A5\u9A73\u533A", Ft(h, "Reception_Foot", 4.25, 5.27, [0, 0, 0.72]), x(h, "Reception_Back", [3.48, 2.51, 1.25], [0, 1.59, -0.69], "ivory");
    for (let u of [-1.54, 1.54]) x(h, "Porch_Pier", [0.51, 2.62, 2.16], [u, 1.61, 0.37], "ivory");
    x(h, "Porch_Roof", [3.78, 0.5, 2.59], [0, 3.01, 0.3], "ivory"), x(h, "Porch_Sign_Light", [1.55, 0.17, 0.12], [0, 2.87, 1.65], "cyan", 0.02), fe(h, "Reception_Checkpoint", [0, 0.31, -0.031], 1.4, 1.91);
    for (let u of [-1.79, 1.79]) x(h, "Bollard", [0.25, 0.75, 0.28], [u, 0.66, 2.45], "yellow");
    ce(h, "Reception_Access", 2.2, 1.54, 0.29, [0, 0, 3.32]), ge(r, "Reception_Corridor", [4.19, 1, 3.88], [6.8, 1, 5.62], 1.23);
  }
  return t;
}
function xy(i, t, e, n) {
  let r = N(i, t, e);
  x(r, "Sealed_Housing", [n, 1.48, 1.55], [0, 1.02, 0], "ivory"), x(r, "Viewing_Recess", [n * 0.76, 0.96, 0.1], [0, 1.05, 0.8], "navy", 0.03), Ye(r, "Contained_Sample", 0.4, [0, 1.05, 0.81], "purple"), x(r, "Observation_Glass", [n * 0.69, 0.79, 0.055], [0, 1.06, 1.2], "glass", 0.015);
  for (let s of [-1, 1]) x(r, "Corner_Cushion", [0.23, 0.52, 1.59], [s * (n / 2 - 0.16), 0.47, 0], "yellow", 0.03);
  return r;
}
function nh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Research_Lab");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u57FA\u7840\u7814\u7A76\u7AD9", additions: ["\u5B8C\u6574\u516D\u89D2\u5B9E\u9A8C\u4E3B\u697C\u4E0E\u6C14\u95F8", "\u56FA\u5B9A\u652F\u67B6\u4E0A\u7684\u503E\u659C\u5B9E\u9A8C\u73AF\u4E0E\u72EC\u7ACB\u6837\u672C\u7403", "\u5171\u4EAB\u4EEA\u5668\u8231"] }, { level: 2, label: "\u5206\u6790\u5B9E\u9A8C\u4E2D\u5FC3", additions: ["\u5DE6\u53F3\u5B9E\u9A8C\u7FFC", "\u6837\u672C\u4FDD\u7BA1\u5E93", "\u589E\u52A0\u5206\u6790\u4EEA\u5668\u4E0E\u73AF\u9762\u4F20\u611F\u5668"] }, { level: 3, label: "\u7EFC\u5408\u7814\u7A76\u4E2D\u5FC3", additions: ["\u5BC6\u95ED\u8BD5\u9A8C\u8231", "\u53CC\u7247\u6563\u70ED\u51B7\u5374\u7AD9", "\u72EC\u7ACB\u51B7\u5374\u7BA1\u8DEF"] }], t.userData.design = ["\u5B9E\u9A8C\u73AF\u901A\u8FC7\u4E09\u89D2\u627F\u529B\u652F\u67B6\u56FA\u5B9A\u5230\u5B9E\u9A8C\u4E3B\u697C\u7684\u8BBE\u5907\u73AF\u5EA7\uFF0C\u503E\u659C\u59FF\u6001\u4FDD\u6301\u4E0D\u53D8\u3002", "\u6837\u672C\u7403\u4E3A\u79D1\u5E7B\u573A\u7EA6\u675F\u5B9E\u9A8C\u5BF9\u8C61\uFF0C\u4E09\u7EC4\u671D\u5411\u7403\u5FC3\u7684\u573A\u7EBF\u5708\u5B89\u88C5\u5728\u5B9E\u4F53\u73AF\u4E0A\uFF1B\u7403\u4F53\u72EC\u7ACB\u53EF\u63A7\u3002", "\u5DE6\u7FFC\u8FDB\u884C\u6837\u672C\u5206\u6790\uFF0C\u53F3\u7FFC\u8FDB\u884C\u4EEA\u5668\u64CD\u4F5C\uFF1B\u6837\u672C\u5E93\u3001\u5BC6\u95ED\u8BD5\u9A8C\u8231\u53CA\u51B7\u5374\u7AD9\u6709\u660E\u786E\u63A5\u53E3\u3002"], t.userData.pivots = ["Suspended_Experimental_Sphere"], U(e, "Hexagonal_Foundation", 5.41, 5.7, 0.34, [0, 0.17, 0], "navy", 6).rotation.y = Math.PI / 6, U(e, "Laboratory_Shell", 5.02, 5.24, 2.37, [0, 1.54, 0], "ivory", 6).rotation.y = Math.PI / 6, U(e, "Laboratory_Window_Belt", 5.13, 5.13, 0.55, [0, 1.36, 0], "navy", 6).rotation.y = Math.PI / 6;
  for (let f = 0; f < 6; f++) {
    let m = f * Math.PI / 3;
    zt(e, `Core_Window_${f}`, [4.48 * Math.sin(m), 1.38, 4.48 * Math.cos(m)], 3.57, 0.37, m);
  }
  U(e, "Roof_Equipment_Deck", 4.4, 4.87, 0.48, [0, 2.91, 0], "navy", 6).rotation.y = Math.PI / 6, U(e, "Experiment_Platform", 2.63, 3.13, 0.58, [0, 3.43, -0.34], "steel", 12), U(e, "Experiment_Power_Ring", 2.63, 2.63, 0.18, [0, 3.81, -0.34], "cyan", 24);
  let s = new P(0, 8.26, -0.23), o = new En(0.17, -0.2, -0.25), a = N(e, "Inclined_Experimental_Ring", s.toArray());
  a.rotation.copy(o), Re(a, "Ring_Structural_Core", 3.98, 0.79, [0, 0, 0], "navy", 8, 40), Re(a, "Ring_Front_Armor", 3.98, 0.81, [0, 0, 0.3], "ivory", 6, 40), Re(a, "Inner_Field_Channel", 3.22, 0.12, [0, 0, 0.59], "cyan", 6, 40);
  for (let f = 0; f < 8; f++) {
    let m = f * Math.PI / 4, g = x(a, `Segment_Lock_${f + 1}`, [0.46, 1.78, 2.12], [3.98 * Math.cos(m), 3.98 * Math.sin(m), 0.12], f % 2 ? "yellow" : "steel", 0.045);
    g.rotation.z = m - Math.PI / 2;
  }
  for (let f = 0; f < 3; f++) {
    let m = Math.PI / 2 + f * Math.PI * 2 / 3, g = N(a, `Field_Coil_${f + 1}`, [3.46 * Math.cos(m), 3.46 * Math.sin(m), 0.07]);
    g.rotation.z = m - Math.PI / 2, U(g, "Emitter_Housing", 0.53, 0.65, 0.71, [0, -0.22, 0], "navy", 10), U(g, "Emitter_Terminal", 0.45, 0.45, 0.18, [0, -0.63, 0], "cyan", 10);
  }
  let l = N(e, "Suspended_Experimental_Sphere", s.toArray()), c = Ye(l, "Experimental_Sample", 1.82, [0, 0, 0.09], "cyan", 1);
  c.geometry = c.geometry.clone(), c.geometry.computeVertexNormals(), we(l, { type: "spin", axis: "y", speed: 0.17 }), [[-2.78, -2.73, 0], [2.78, -2.73, 0], [0, -3.97, -0.24]].forEach((f, m) => {
    let g = new P(...f).applyEuler(o).add(s), _ = [m === 0 ? -2.07 : m === 1 ? 2.07 : 0, 3.72, m === 2 ? -1.93 : 0.85];
    bt(e, `Inclined_Ring_Strut_${m + 1}`, _, g.toArray(), m === 2 ? 0.75 : 1.04, 0.96, "navy");
    let p = new P(..._).lerp(g, 0.67);
    bt(e, `Strut_Armor_${m + 1}`, _, p.toArray(), m === 2 ? 0.86 : 1.17, 1.06, "ivory"), Ye(e, `Ring_Mount_Joint_${m + 1}`, 0.48, g.toArray(), "steel", 1), U(e, `Platform_Attachment_${m + 1}`, 0.74, 0.88, 0.35, [_[0], 3.78, _[2]], "yellow", 6);
  });
  let u = N(e, "Main_Airlock", [0, 0.32, 4.25]);
  Vt(u, "Airlock_Pressure_Shell", [[-1.49, 0], [1.49, 0], [1.22, 2.71], [-1.22, 2.71]], 1.79, [0, 0, 0], "ivory"), fe(u, "Lab_Entrance", [0, 0.08, 0.91], 1.35, 1.98), x(u, "Status_Header", [1.08, 0.22, 0.11], [0, 2.36, 0.987], "cyan", 0.015), ce(e, "Lab_Access_Ramp", 2.05, 2.53, 0.42, [0, 0, 5.2]);
  for (let f of [-0.96, 0.96]) bt(e, "Ramp_Safety_Edge", [f, 0.45, 5.23], [f, 0.07, 7.7], 0.09, 0.13, "yellow");
  let d = N(n, "Shared_Instruments", [-8.05, 0, -3.17]);
  d.userData.purpose = "\u663E\u5FAE\u4E0E\u5149\u8C31\u4EEA\u5668\u5171\u4EAB\u8231", U(d, "Instrument_Foot", 1.85, 2.05, 0.29, [0, 0.145, 0], "navy", 8), U(d, "Instrument_Pressure_Cabin", 1.57, 1.73, 2.61, [0, 1.59, 0], "ivory", 8);
  for (let f = 0; f < 4; f++) {
    let m = f * Math.PI / 2;
    zt(d, `Instrument_View_${f}`, [Math.sin(m) * 1.6, 1.62, Math.cos(m) * 1.6], 0.9, 1.16, m);
  }
  if (U(d, "Roof_Instrument", 0.54, 0.85, 0.4, [0, 3.03, 0], "steel", 10), Zt(d, "Survey_Probe", [0, 3.2, 0], 1.04), ge(r, "Instrument_Corridor", [-4.02, 1.02, -2.43], [-6.5, 1.02, -3.17], 1.2), i >= 2) {
    for (let m of [-1, 1]) {
      let g = N(e, m < 0 ? "Sample_Analysis_Wing" : "Instrument_Operations_Wing", [m * 5.96, 0, 1.2]);
      Ft(g, "Laboratory_Wing_Foot", 4.2, 3.4), Vt(g, "Wing_Shell", [[-2, 0.32], [2, 0.32], [2, 2.25], [1.56, 2.88], [-1.56, 2.88], [-2, 2.25]], 3.08, [0, 0, 0], "ivory", 0.085), zt(g, "Wing_Observation_Window", [0, 1.55, 1.59], 3.21, 0.8), ye(g, "Wing_Air_Conditioning", [0.34, 2.9, -0.34], 1.47, 0.9), x(g, "Utility_Corner", [0.28, 1.3, 0.38], [m * 1.8, 1, 1.6], "yellow", 0.03);
    }
    let f = N(n, "Sample_Repository", [-8.56, 0, 6.25]);
    f.userData.purpose = "\u5C01\u95ED\u3001\u5206\u683C\u7684\u6837\u672C\u4FDD\u7BA1\u5E93", Ft(f, "Sample_Repository_Foot", 3.83, 2.95), xy(f, "Sample_Locker", [0, 0, 0], 3.3), x(f, "Environmental_Controller", [1.4, 0.35, 0.75], [0, 2, 0], "steel"), ge(r, "Sample_Transfer_Corridor", [-6.29, 0.97, 2.61], [-7.71, 0.97, 4.93], 1.13);
    for (let m = 0; m < 4; m++) {
      let g = Math.PI / 4 + m * Math.PI / 2, _ = x(a, `Ring_Sensor_${m}`, [0.31, 0.87, 0.33], [4.18 * Math.cos(g), 4.18 * Math.sin(g), 1.18], "cyan", 0.03);
      _.rotation.z = g - Math.PI / 2;
    }
  }
  if (i >= 3) {
    let f = N(n, "Sealed_Test_Chamber", [8.87, 0, 5.86]);
    f.userData.purpose = "\u72EC\u7ACB\u5BC6\u95ED\u73AF\u5883\u8BD5\u9A8C\uFF0C\u8BBE\u89C2\u5BDF\u7A97\u53CA\u9876\u90E8\u538B\u529B\u76D6", U(f, "Test_Chamber_Foot", 1.93, 2.12, 0.33, [0, 0.165, 0], "navy", 8), U(f, "Test_Vessel", 1.53, 1.8, 2.14, [0, 1.41, 0], "ivory", 8);
    for (let g = 0; g < 4; g++) {
      let _ = g * Math.PI / 2;
      zt(f, `Test_Window_${g}`, [Math.sin(_) * 1.56, 1.37, Math.cos(_) * 1.56], 0.78, 1.13, _);
    }
    U(f, "Pressure_Cover_Rim", 1.41, 1.53, 0.21, [0, 2.58, 0], "steel", 12), U(f, "Pressure_Cover", 1.06, 1.17, 0.22, [0, 2.74, 0], "cyan", 12), fe(f, "Test_Airlock", [0, 0.33, 1.72], 0.83, 1.22), ge(r, "Test_Chamber_Corridor", [6.28, 0.99, 2.64], [8.04, 0.99, 4.49], 1.13);
    let m = N(n, "Cooling_Equipment_Station", [8.31, 0, -3.76]);
    m.userData.purpose = "\u5FAA\u73AF\u51B7\u5374\u8BBE\u5907\u4E0E\u72EC\u7ACB\u6563\u70ED\u7247", Ft(m, "Cooling_Foot", 4.39, 3.33), x(m, "Circulation_Pump_Box", [3.75, 1.2, 2.62], [0, 0.9, 0], "ivory");
    for (let g of [-1.13, 1.13]) {
      let _ = N(m, `Radiator_${g < 0 ? "A" : "B"}`, [g, 1.65, -0.19]);
      _.rotation.x = -0.3, x(_, "Radiator_Frame", [1.36, 3.08, 0.57], [0, 1.42, 0], "navy"), x(_, "Heat_Exchange_Core", [1.03, 2.5, 0.08], [0, 1.53, 0.335], "blue", 0.01);
      for (let p = 0; p < 6; p++) x(_, `Cooling_Fin_${p}`, [1.09, 0.075, 0.13], [0, 0.53 + p * 0.39, 0.387], "steel", 5e-3);
      bt(m, "Radiator_Stay", [g, 1.48, 0.96], [g, 3.55, -0.76], 0.23, 0.23, "steel");
    }
    ht(r, "Cooling_Supply", [[3.69, 1, -2.37], [5.7, 1, -2.37], [5.7, 1, -3.78], [6.49, 1, -3.78]], 0.19, "cyan"), ht(r, "Cooling_Return", [[3.61, 0.6, -2.7], [5.36, 0.6, -2.7], [5.36, 0.6, -4.32], [6.49, 0.6, -4.32]], 0.17, "navy");
  }
  return t;
}
function rf(i, t, e, n, r = 1.5) {
  let s = new P(...n).sub(new P(...e)), o = N(i, t, e), a = s.clone().normalize(), l = new P().crossVectors(new P(0, 1, 0), a).normalize(), c = new P().crossVectors(a, l).normalize();
  o.quaternion.setFromRotationMatrix(new me().makeBasis(l, c, a));
  let h = s.length();
  x(o, "BeltBed", [r + 0.22, 0.28, h], [0, 0, h / 2], "navy"), x(o, "ContinuousBelt", [r, 0.11, h], [0, 0.2, h / 2], "rubber", 0.02);
  for (let u = 0; u <= Math.floor(h / 0.48); u++) {
    let d = 0.16 + (h - 0.32) * u / Math.floor(h / 0.48);
    x(o, "BeltCleat_" + u, [r - 0.12, 0.3, 0.14], [0, 0.39, d], "steel", 0.02);
  }
  for (let u of [-r / 2 - 0.1, r / 2 + 0.1]) x(o, "RetainingRail", [0.16, 0.58, h], [u, 0.35, h / 2], "yellow", 0.04);
  for (let u of [0.12, h - 0.12]) {
    let d = U(o, "DriveRoller", 0.3, 0.3, r + 0.55, [0, 0, u], "steel", 10);
    d.rotation.z = Math.PI / 2;
  }
  return o;
}
function My(i) {
  let t = N(i, "Open_Crusher_Hopper", [0.25, 4.5, -1.1]), e = 2.75, n = [2.7, 2.1], r = [1.45, 1.12], s = 0.24, o = (d, f, m = 0) => [[-d[0] + m, f, -d[1] + m], [d[0] - m, f, -d[1] + m], [d[0] - m, f, d[1] - m], [-d[0] + m, f, d[1] - m]], a = o(r, 0), l = o(n, e), c = o(r, 0, s), h = o(n, e, s), u = [0, 1, 2, 0, 2, 3, 4, 7, 6, 4, 6, 5, 0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7, 0, 3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2];
  for (let d = 0; d < 4; d++) {
    let f = (d + 1) % 4, m = [a[d], a[f], l[f], l[d], c[d], c[f], h[f], h[d]].flat(), g = new ue();
    g.setAttribute("position", new Jt(m, 3)), g.setIndex(u), g.computeVertexNormals();
    let _ = new Xt(g, Ae.ivory);
    _.name = "TaperedHopperWall_" + (d + 1), t.add(_);
  }
  x(t, "HopperFloor", [2.9, 0.3, 2.24], [0, 0.04, 0], "dark", 0.02);
  for (let d of [-0.69, 0.69]) {
    let f = N(t, d < 0 ? "CrushingRoll_Left" : "CrushingRoll_Right", [d, 0.65, 0]), m = U(f, "CrusherDrum", 0.61, 0.61, 1.95, [0, 0, 0], "steel", 10);
    m.rotation.x = Math.PI / 2;
    for (let g = 0; g < 5; g++) {
      let _ = U(f, "BreakingDisc_" + g, 0.76, 0.76, 0.18, [0, 0, -0.76 + g * 0.38], "navy", 8);
      _.rotation.x = Math.PI / 2;
    }
    we(f, { type: "spin", axis: "z", speed: d < 0 ? 0.35 : -0.35 });
  }
  for (let d = 0; d < 6; d++) Ye(t, "FeedOre_" + d, 0.4 + 0.1 * (d % 2), [(d % 3 - 1) * 0.9, 1.32 + d % 2 * 0.3, Math.floor(d / 3) * 0.75 - 0.45], "ore", 0).scale.set(1, 0.75, 1);
  for (let d of [-2.1, 2.1]) x(t, "RimImpactRail", [5.55, 0.22, 0.28], [0, e + 0.04, d], "navy", 0.04);
  for (let d of [-2.7, 2.7]) x(t, "RimSideRail", [0.28, 0.22, 4.2], [d, e + 0.04, 0], "ivory", 0.04);
  return t;
}
function ih(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Metal_Mine");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u91C7\u6398\u7AD9", additions: ["\u95ED\u5408\u94BB\u91C7\u548C\u7834\u788E\u8F93\u9001\u6D41\u7A0B", "\u91D1\u5C5E\u4ED3\u50A8\u8231", "\u63A7\u5236\u5BA4"] }, { level: 2, label: "\u7CBE\u70BC\u77FF\u573A", additions: ["\u72EC\u7ACB\u68C0\u4FEE\u8F66\u95F4", "\u52A0\u88C5\u7CBE\u70BC\u5206\u9009\u673A\u4E0E\u9664\u5C18\u7BA1\u8DEF"] }, { level: 3, label: "\u5F00\u91C7\u7EFC\u5408\u4F53", additions: ["\u91D1\u5C5E\u88C5\u8FD0\u7AD9\u4E0E\u8D77\u91CD\u540A\u5177", "\u4ED3\u50A8\u7B2C\u4E8C\u6392\u8D27\u67B6\u548C\u88C5\u5378\u901A\u9053"] }], t.userData.design = ["\u9EC4\u8272\u94BB\u81C2\u7684\u80A9\u3001\u8098\u3001\u94BB\u5934\u5206\u522B\u8BBE\u771F\u5B9E\u8F6C\u8F74\uFF1B\u6DB2\u538B\u8FDE\u6746\u627F\u62C5\u52A8\u4F5C\u652F\u6491\u3002", "\u72EC\u7ACB\u77FF\u4F53\u7ECF\u4E0A\u6599\u5E26\u8FDB\u5165\u655E\u53E3\u53CC\u8F8A\u7834\u788E\u673A\uFF0C\u518D\u7ECF\u51FA\u6599\u5E26\u8FDB\u5165 Metal_Storage\u3002", "\u9AD8\u67B6\u8F93\u9001\u5E26\u6709\u843D\u5730\u652F\u817F\uFF1B\u4ED3\u50A8\u3001\u68C0\u4FEE\u4E0E\u88C5\u8FD0\u5165\u53E3\u671D\u5411\u5916\u4FA7\uFF0C\u907F\u514D\u7A7F\u8FC7\u8BBE\u5907\u3002"], t.userData.pivots = ["DrillShoulder", "DrillElbow", "RotaryDrill", "LoadingHoist"], Ft(e, "MachineFoundation", 9.3, 8, [0.2, 0, -0.65], 0.3), x(e, "CrusherStructuralCore", [4.3, 3.6, 3.7], [0.3, 2.12, -1], "navy", 0.22), x(e, "FrontServicePanel", [3.8, 2.8, 0.28], [0.3, 2.32, 0.99], "ivory", 0.12), fe(e, "CrusherServiceDoor", [0.55, 0.3, 1.2], 1.4, 1.9);
  for (let w of [-2.2, 2.85]) x(e, "HopperColumn", [0.72, 4.6, 1.05], [w, 2.6, -1.25], "navy", 0.13);
  My(e), x(e, "FeedThroat", [2.4, 1, 2.15], [0.25, 4.1, -1.1], "steel", 0.12);
  let s = N(e, "CrusherControlTower", [1.25, 7.3, -2.6]);
  x(s, "Cabin", [2.35, 1.7, 1.8], [0, 0.85, 0], "navy", 0.12), x(s, "CabinRoof", [2.7, 0.32, 2.15], [0, 1.84, 0], "ivory", 0.1), zt(s, "OperatorWindow", [0, 0.83, 0.94], 1.95, 0.75), Zt(s, "PlantLinkAntenna", [0.72, 2, -0.25], 1.2), x(e, "ControlTowerMount", [1.1, 1.5, 1.5], [1.25, 6.64, -2.6], "ivory", 0.1);
  let o = N(e, "DrillMount", [-2.75, 0.3, -2.1]);
  x(o, "TurretPedestal", [2.65, 2.45, 2.75], [0, 1.22, 0], "navy", 0.18), x(o, "MountArmor", [2.25, 0.65, 2.65], [0, 2.45, 0], "yellow", 0.13);
  let a = N(o, "DrillShoulder", [0, 2.9, 0]);
  bt(a, "LowerBoom", [0, 0, 0], [-1.35, 4.35, 0], 1.35, 1.6, "yellow");
  let l = U(a, "ShoulderAxle", 0.92, 0.92, 2.1, [0, 0, 0], "steel", 12);
  l.rotation.x = Math.PI / 2;
  let c = N(a, "DrillElbow", [-1.35, 4.35, 0]), h = U(c, "ElbowBearing", 0.93, 0.93, 1.95, [0, 0, 0], "navy", 12);
  h.rotation.x = Math.PI / 2;
  let u = U(c, "ElbowCap", 0.59, 0.59, 2.05, [0, 0, 0], "yellow", 12);
  u.rotation.x = Math.PI / 2, bt(c, "UpperBoom", [0, 0, 0], [-3, -2.4, 1.8], 1.2, 1.36, "yellow"), bt(a, "LiftCylinder", [-0.85, 0.5, 0.91], [-2, 3.72, 0.91], 0.36, 0.36, "steel"), bt(a, "PistonSleeve", [-0.85, 0.5, 0.91], [-1.5, 2.3, 0.91], 0.58, 0.58, "navy");
  let d = N(c, "RotaryDrill", [-3, -2.4, 1.8]), f = new P(-0.22, -0.52, 0.825).normalize();
  d.quaternion.setFromUnitVectors(new P(0, 0, 1), f);
  for (let [w, b, A, C, T] of [["Motor", 0.94, 1.2, 0.1, "yellow"], ["DrillBarrel", 1.18, 1.2, 1, "navy"], ["CuttingHead", 1.35, 0.55, 1.8, "steel"]]) {
    let E = U(d, w, b, b, A, [0, 0, C], T, 12);
    E.rotation.x = Math.PI / 2;
  }
  for (let w = 0; w < 10; w++) {
    let b = w * Math.PI / 5, A = U(d, "ReplaceableTooth_" + w, 0.03, 0.24, 0.62, [Math.cos(b) * 1.09, Math.sin(b) * 1.09, 2.3], "steel", 5);
    A.rotation.x = Math.PI / 2;
  }
  we(d, { type: "spin", axis: "z", speed: 0.6 });
  let m = N(t, "Metal_Ore_Resource", [-7, 0, 1.7]);
  m.userData.purpose = "\u72EC\u7ACB\u539F\u4F4D\u77FF\u4F53\uFF0C\u53EF\u7531\u6E38\u620F\u77FF\u70B9\u66FF\u6362";
  for (let w = 0; w < 10; w++) {
    let b = w * 2.399, A = w < 6 ? 2.15 : 0.85;
    Ye(m, "OreMass_" + w, w < 6 ? 1.65 : 1.45, [Math.cos(b) * A, 1.22 + (w >= 6 ? 1.55 : 0), Math.sin(b) * A], "ore", 0).scale.set(1.1, 0.82, 1);
  }
  rf(r, "RawOreFeed", [-7.8, 2.35, 4.1], [-1.6, 8.3, -0.2], 1.4), bt(r, "FeedBeltSupport", [-3.6, 0.3, 1.19], [-3.6, 6.3, 1.19], 0.43, 0.43, "navy"), bt(r, "FeedBeltBrace", [-2.5, 0.3, 0], [-3.6, 6.08, 1.19], 0.31, 0.31, "navy"), Ft(r, "FeedBeltFoot", 1.25, 1.1, [-3.6, 0, 1.19], 0.14);
  let g = N(r, "GravityFeedChute", [-1.6, 8.25, -0.2]), _ = new P(0.8, -0.85, -0.36), p = _.clone().normalize(), y = new P().crossVectors(new P(0, 1, 0), p).normalize();
  g.quaternion.setFromRotationMatrix(new me().makeBasis(y, new P().crossVectors(p, y), p)), x(g, "ChuteBed", [1.43, 0.18, _.length()], [0, 0, _.length() / 2], "steel", 0.03);
  for (let w of [-0.68, 0.68]) x(g, "ChuteSideWall", [0.13, 0.48, _.length()], [w, 0.17, _.length() / 2], "yellow", 0.025);
  let M = N(n, "Metal_Storage", [7.15, 0, 1.2]);
  M.userData.label = "\u91D1\u5C5E\u4ED3\u50A8\u8231", Ft(M, "StorageFoot", 5.05, 5.35, [0, 0, 0], 0.28), x(M, "StorageRearWall", [4.6, 3.7, 0.38], [0, 2.1, -2.2], "ivory", 0.08), x(M, "StorageRightWall", [0.42, 3.7, 4.45], [2.13, 2.1, 0], "ivory", 0.08), x(M, "IntakeWallLower", [0.42, 0.54, 4.45], [-2.13, 0.52, 0], "navy", 0.04), x(M, "IntakeWallUpper", [0.42, 1.79, 4.45], [-2.13, 3.05, 0], "ivory", 0.06), x(M, "IntakeWallRear", [0.42, 1.6, 2.05], [-2.13, 1.5, -1.2], "ivory", 0.06), x(M, "IntakeFrontPier", [0.42, 1.6, 0.35], [-2.13, 1.5, 2.05], "ivory", 0.04), x(M, "StorageRoof", [4.65, 0.65, 4.7], [0, 4.07, 0], "yellow", 0.13), x(M, "StorageFrontHeader", [4.65, 0.56, 0.54], [0, 3.68, 2.3], "navy", 0.08), x(M, "CargoDeck", [4.5, 0.3, 4.5], [0, 0.48, 0.1], "navy", 0.06);
  for (let w = 0; w < (i === 3 ? 2 : 1); w++) for (let b = 0; b < 3; b++) x(M, "MetalIngot_" + w + "_" + b, [1.01, 0.62, 0.82], [(b - 1) * 1.12, 0.96, -0.9 + w * 1.16], "steel", 0.1), i >= 2 && x(M, "StackedIngot_" + w + "_" + b, [0.94, 0.51, 0.77], [(b - 1) * 1.12, 1.54, -0.9 + w * 1.16], "steel", 0.09);
  ce(M, "CargoRamp", 3.5, 1.45, 0.55, [0, 0, 2.45]), x(M, "LoadingLintelAccent", [3.9, 0.15, 0.12], [0, 3.94, 2.6], "yellow", 0.03), rf(r, "RefinedMetalBelt", [2.28, 1.38, 2.27], [5, 1, 2.27], 1.32), x(e, "CrusherDischargeChute", [1.3, 0.55, 1.83], [1.75, 1.12, 1.55], "navy", 0.06), x(e, "DischargeSideGuard", [0.16, 0.77, 1.83], [2.36, 1.42, 1.55], "yellow", 0.025), ht(r, "StoragePowerCable", [[2.55, 0.54, -0.28], [4.4, 0.54, -0.28], [4.7, 0.54, -0.7], [5, 0.54, -0.7]], 0.12, "yellow");
  let v = se(n, "OperationsControl", [0.55, 0, 6.75], 3.5, 2.85, 2.7, "control");
  if (Zt(v, "DispatchRadio", [0.65, 3.12, -0.3], 1.3), ht(r, "ControlDataDuct", [[1.8, 0.52, 2.5], [1.8, 0.52, 4.45], [0.6, 0.52, 4.45], [0.6, 0.52, 5.3]], 0.12, "navy"), i >= 2) {
    let w = se(n, "MaintenanceWorkshop", [-4.65, 0, 6.7], 4.4, 3.4, 2.8, "cargo");
    x(w, "ServiceCanopy", [4.5, 0.38, 1], [0, 2.86, 1.88], "ivory", 0.08), ye(w, "WorkshopExtractor", [0.72, 3.17, -0.3], 1.2, 0.86), ht(r, "WorkshopServiceLine", [[-2.25, 0.63, 1.8], [-2.25, 0.63, 4.5], [-3, 0.63, 4.5], [-3, 0.63, 5.2]], 0.18, "yellow");
    let b = N(e, "RefineryFilter", [3.22, 0.3, -2]);
    x(b, "FilterHousing", [1.85, 3.8, 2.2], [0, 1.9, 0], "ivory", 0.14);
    for (let A = 0; A < 4; A++) x(b, "CoolingLouver_" + A, [1.3, 0.17, 0.24], [0, 1 + A * 0.46, 1.14], "navy", 0.03);
    ht(e, "DustReturn", [[2.35, 6.4, -2.2], [3.7, 6.4, -2.2], [3.7, 3.8, -2.2]], 0.25, "yellow");
  }
  if (i >= 3) {
    let w = N(n, "DispatchStation", [7.9, 0, 7.1]);
    Ft(w, "LoadingPad", 5.4, 3.9, [0, 0, 0], 0.23), x(w, "TransferPallet", [2.6, 0.4, 1.85], [0, 0.52, 0.1], "navy", 0.08);
    for (let A = 0; A < 3; A++) x(w, "OutboundIngot_" + A, [0.72, 0.67, 1.25], [(A - 1) * 0.84, 1.02, 0.1], "steel", 0.1);
    for (let A of [-2.15, 2.15]) x(w, "GantryColumn", [0.42, 3.8, 0.55], [A, 2.06, -0.48], "yellow", 0.06);
    x(w, "GantryTop", [4.85, 0.54, 0.7], [0, 4.03, -0.48], "yellow", 0.07);
    let b = N(w, "LoadingHoist", [0, 3.67, -0.48]);
    x(b, "Trolley", [0.85, 0.5, 0.8], [0, 0, 0], "navy", 0.07);
    for (let A of [-0.35, 0.35]) bt(b, "LiftCable", [A, -0.22, 0], [A, -1.4, 0], 0.065, 0.065, "steel");
    x(b, "LiftingSpreader", [1.5, 0.24, 0.75], [0, -1.47, 0], "yellow", 0.04), we(b, { type: "slide", axis: "x", speed: 0.22, range: 0.35 }), x(r, "StorageDispatchDock", [3.15, 0.24, 1.7], [7.48, 0.27, 4.63], "navy", 0.04), ht(r, "DispatchPower", [[9.58, 0.6, 3.6], [9.58, 0.6, 5.1], [10.05, 0.6, 5.1], [10.05, 0.6, 6.2]], 0.12, "yellow");
  }
  return t;
}
function Sy(i, t, e, n = 2.4) {
  let r = N(i, t, e);
  x(r, "CaseFloor", [n, 0.25, 1.8], [0, 0.125, 0], "navy", 0.04), x(r, "CaseLid", [n, 0.22, 1.8], [0, 2, 0], "ivory", 0.05);
  for (let s of [-n / 2 + 0.1, n / 2 - 0.1]) for (let o of [-0.8, 0.8]) x(r, "GlazingPost", [0.17, 1.7, 0.17], [s, 1.06, o], "ivory", 0.025);
  return x(r, "DisplayGlazing", [n - 0.24, 1.56, 0.025], [0, 1.06, 0.88], "glass", 0), Ci(r, "StoredCrystal", [0, 0.28, 0], 0.45, 1.5, "crystal"), r;
}
function rh(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Crystal_Mine");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u6676\u4F53\u91C7\u96C6\u7AD9", additions: ["\u4E09\u722A\u91C7\u96C6\u673A", "\u95ED\u5408\u5206\u9009\u8F93\u9001", "\u6676\u4F53\u4ED3\u50A8\u4E0E\u68C0\u6D4B\u8231"] }, { level: 2, label: "\u7CBE\u5BC6\u5206\u9009\u573A", additions: ["\u7EF4\u62A4\u8F66\u95F4", "\u53CC\u901A\u9053\u5206\u9009\u6A21\u5757", "\u9644\u5C5E\u77FF\u6837\u63D0\u53D6\u5668"] }, { level: 3, label: "\u6676\u4F53\u7EFC\u5408\u4F53", additions: ["\u6210\u54C1\u88C5\u8FD0\u8231", "\u6210\u54C1\u8D27\u67B6\u4E0E\u8F6C\u8FD0\u8F66\u8F86"] }], t.userData.design = ["\u5DE8\u578B\u77FF\u6676\u5355\u72EC\u653E\u5728 Crystal_Ore_Resource\uFF0C\u53EF\u72EC\u7ACB\u663E\u9690\u6216\u66FF\u6362\u77FF\u70B9\u3002", "\u4E09\u4E2A\u91C7\u96C6\u81C2\u56F4\u7ED5\u4E3B\u6676\u4F53\u7559\u6709\u4F5C\u4E1A\u7A7A\u95F4\uFF0C\u80A9\u8F74\u3001\u91C7\u96C6\u5934\u548C\u5E95\u5EA7\u5206\u522B\u5206\u7EC4\u3002", "\u91C7\u96C6\u57FA\u5EA7\u7684\u5C01\u95ED\u5206\u9009\u901A\u9053\u4E0E\u4ED3\u50A8\u76F8\u8FDE\uFF1B\u68C0\u6D4B\u3001\u7EF4\u62A4\u548C\u88C5\u8FD0\u914D\u5957\u6309\u7EA7\u522B\u6DFB\u52A0\u3002"], t.userData.pivots = ["HarvestShoulder_1", "HarvestShoulder_2", "HarvestShoulder_3", "ShipmentLift"];
  let s = N(e, "CollectorBase");
  U(s, "Footprint", 4.8, 5.05, 0.38, [0, 0.19, 0], "navy", 12), U(s, "MachineBase", 4.25, 4.7, 1.15, [0, 0.92, 0], "ivory", 12), U(s, "SortingPlenum", 4.33, 4.33, 0.58, [0, 1.72, 0], "navy", 12), U(s, "CollectorDeck", 3.95, 4.33, 0.42, [0, 2.2, 0], "ivory", 12);
  let o = Re(s, "SamplingRail", 3.56, 0.18, [0, 2.47, 0], "purple", 6, 36);
  o.rotation.x = Math.PI / 2;
  for (let g = 0; g < 9; g++) {
    let _ = g * Math.PI * 2 / 9, p = x(s, "SensorPort_" + g, [1.15, 0.3, 0.12], [Math.sin(_) * 4.32, 1.74, Math.cos(_) * 4.32], "cyan", 0.02);
    p.rotation.y = _;
  }
  for (let g = 0; g < 3; g++) {
    let _ = g * Math.PI * 2 / 3, p = N(e, "CollectorCradle_" + (g + 1));
    p.rotation.y = _, Ft(p, "CollectorFoot", 2, 2.4, [0, 0, 4.07], 0.28), x(p, "RadialButtress", [1.7, 1.9, 2], [0, 1.1, 4], "navy", 0.15), x(p, "OuterArmor", [1.62, 0.5, 1.85], [0, 2.17, 4], "ivory", 0.08);
    let y = N(p, "HarvestShoulder_" + (g + 1), [0, 2.3, 3.7]), M = U(y, "ShoulderBearing", 0.57, 0.57, 1.8, [0, 0, 0], "steel", 12);
    M.rotation.z = Math.PI / 2;
    let v = Vt(y, "TaperedCollectorArm", [[-0.76, 0], [0.8, 0], [1.95, 4.83], [1.5, 5.82], [0.68, 5.52], [-0.5, 1.55]], 1.24, [0, 0, 0], "ivory", 0.06);
    v.rotation.y = Math.PI / 2, bt(y, "InnerStructuralSpine", [0, 0.25, -0.6], [0, 4.95, -1.55], 0.56, 0.48, "navy"), x(y, "CollectorHead", [1.25, 0.63, 0.8], [0, 5.6, -1.46], "yellow", 0.08);
    let w = N(y, "SamplingClamp_" + (g + 1), [0, 4.98, -1.78]);
    x(w, "HeadInsulator", [0.78, 0.83, 0.4], [0, 0, 0], "navy", 0.07), x(w, "ExtractionAperture", [0.53, 0.53, 0.1], [0, 0, -0.25], "purple", 0.03);
    for (let b of [-0.47, 0.47]) bt(w, "GrippingFinger", [b, -0.25, -0.15], [b, -0.45, -0.58], 0.18, 0.18, "yellow");
    ht(p, "ArmHydraulicFeed", [[0.65, 0.85, 3.1], [0.65, 2.25, 3.1], [0.65, 2.25, 3.7]], 0.12, "yellow");
  }
  let a = N(t, "Crystal_Ore_Resource", [0, 2.33, 0]);
  a.userData.purpose = "\u72EC\u7ACB\u6676\u4F53\u77FF\u4F53\uFF0C\u4E0D\u4E0E\u91C7\u96C6\u6846\u67B6\u5408\u5E76";
  let l = Ci(a, "PrimaryPurpleCrystal", [0, 0, 0], 1.8, 9.35, "purple");
  l.rotation.y = 0.15;
  for (let g = 0; g < 5; g++) {
    let _ = 0.5 + g * Math.PI * 2 / 5, p = Ci(a, "SatelliteCrystal_" + g, [Math.sin(_) * 1.95, 0, Math.cos(_) * 1.95], 0.59, 2.6 + g % 3 * 0.68, g % 2 ? "purple" : "crystal");
    p.rotation.z = Math.sin(_) * -0.16, p.rotation.x = Math.cos(_) * 0.16;
  }
  let c = N(e, "SorterServicePortal", [0, 0, 4.2]);
  x(c, "EntryHousing", [2.9, 2.3, 1.5], [0, 1.42, 0], "ivory", 0.14), fe(c, "ServiceAirlock", [0, 0.28, 0.84], 1.35, 1.84), ce(c, "EntryRamp", 1.95, 1.7, 0.34, [0, 0, 0.92]), x(c, "PortalLintel", [2, 0.29, 0.34], [0, 2.65, 0.72], "navy", 0.05);
  let h = N(n, "Crystal_Storage", [7, 0, 0.8]);
  h.userData.label = "\u6676\u4F53\u4ED3\u50A8\u8231", Ft(h, "StorageFoundation", 5, 5.2, [0, 0, 0], 0.28), x(h, "RearShell", [4.5, 3.8, 0.42], [0, 2.2, -2.17], "ivory", 0.1), x(h, "RightShell", [0.46, 3.8, 4.35], [2.08, 2.2, 0], "ivory", 0.1), x(h, "LeftLowerWall", [0.45, 0.54, 4.35], [-2.08, 0.57, 0], "navy", 0.04), x(h, "LeftUpperWall", [0.45, 1.4, 4.35], [-2.08, 3.37, 0], "ivory", 0.06), x(h, "LeftRearPier", [0.45, 1.96, 1.1], [-2.08, 1.82, -1.6], "ivory", 0.05), x(h, "LeftFrontPier", [0.45, 1.96, 1], [-2.08, 1.82, 1.67], "ivory", 0.05), x(h, "StorageRoof", [4.8, 0.56, 4.8], [0, 4.37, 0], "ivory", 0.15);
  for (let g of [-1.5, 1.5]) x(h, "StorageRoofBand", [0.4, 0.62, 4.84], [g, 4.35, 0], "purple", 0.04);
  for (let g of [-2.07, 2.07]) x(h, "DisplayFramePost", [0.3, 3.44, 0.38], [g, 2.13, 2.2], "navy", 0.04);
  for (let g of [0.56, 3.7]) x(h, "DisplayFrameRail", [4.44, 0.3, 0.38], [0, g, 2.2], "navy", 0.04);
  x(h, "FrontGlazing", [3.98, 2.9, 0.05], [0, 2.18, 2.43], "glass", 0), x(h, "DisplayFloor", [4, 0.3, 3.9], [0, 0.69, 0], "navy", 0.04);
  for (let g = 0; g < 3; g++) Ci(h, "ProductCrystal_" + g, [(g - 1) * 1.12, 0.87, 0.25], 0.5, 1.9 + (g === 1 ? 0.42 : 0), "crystal");
  x(h, "PersonnelAirlock", [1.5, 2.25, 1.1], [1.45, 1.4, 2.65], "ivory", 0.08), fe(h, "StorageDoor", [1.45, 0.28, 3.25], 0.96, 1.6), ce(h, "StorageRamp", 1.5, 1.15, 0.28, [1.45, 0, 3.4]);
  let u = N(r, "EnclosedCrystalTransfer");
  x(u, "ConveyorBed", [2.5, 0.32, 1.45], [4.45, 1.12, 0.8], "navy", 0.06), x(u, "TransparentSortingTunnel", [2.4, 1.15, 1.18], [4.45, 1.83, 0.8], "glass", 0);
  for (let g of [3.35, 4.55, 5.4]) {
    for (let _ of [0.15, 1.45]) x(u, "TunnelPost", [0.12, 1.33, 0.12], [g, 1.8, _], "ivory", 0.02);
    x(u, "TunnelHoop", [0.15, 0.15, 1.47], [g, 2.49, 0.8], "ivory", 0.02);
  }
  Ci(u, "InProcessCrystal", [4.45, 1.32, 0.8], 0.29, 0.78, "crystal");
  for (let g of [0.02, 1.58]) x(u, "ConveyorServiceEdge", [2.7, 0.18, 0.15], [4.45, 1.3, g], "yellow", 0.02);
  let d = N(n, "CrystalAssayLab", [-6.2, 0, 1.85]);
  Ft(d, "AssayLabFoot", 3.85, 3.85, [0, 0, 0], 0.3), U(d, "AssayLabBody", 1.55, 1.75, 1.45, [0, 1.02, 0], "ivory", 8);
  let f = new Xt(new $e(1.35, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), Ae.glass);
  f.name = "SampleAnalysisGlazing", f.position.set(0, 1.72, 0), d.add(f);
  let m = Re(d, "SampleChamberRim", 1.36, 0.1, [0, 1.76, 0], "navy", 6, 20);
  m.rotation.x = Math.PI / 2;
  for (let g = 0; g < 5; g++) {
    let _ = g * Math.PI * 2 / 5;
    bt(d, "DomeMullion", [Math.sin(_) * 1.35, 1.76, Math.cos(_) * 1.35], [0, 3.1, 0], 0.1, 0.1, "ivory");
  }
  if (Ci(d, "AssaySample", [0, 1.64, 0], 0.38, 1.06, "crystal"), fe(d, "LabServiceDoor", [0, 0.3, 1.62], 1, 1.17), Zt(d, "AssayTelemetry", [-1.12, 1.56, -0.52], 1.1), ht(r, "AssaySampleLine", [[-4.05, 1.28, 1.3], [-4.56, 1.28, 1.3], [-4.56, 1.28, 1.85], [-4.85, 1.28, 1.85]], 0.25, "purple"), i >= 2) {
    let g = se(n, "CollectorMaintenance", [-4.4, 0, 6.9], 4.2, 3.1, 2.55, "cargo");
    ye(g, "WorkshopVent", [0.7, 2.96, -0.22], 1.1, 0.8), ht(r, "MaintenanceHydraulicFeed", [[-2.35, 0.65, 3.8], [-2.35, 0.65, 5], [-3.2, 0.65, 5], [-3.2, 0.65, 5.4]], 0.17, "yellow");
    let _ = N(e, "PrecisionSortingUnit", [-2.55, 0.38, -3.5]);
    x(_, "SorterHousing", [2.7, 2, 2.1], [0, 1, 0], "ivory", 0.1), x(_, "AnalysisWindow", [1.8, 0.58, 0.16], [0, 1.23, -1.13], "purple", 0.035), ht(e, "SecondarySortLine", [[-1.45, 1.5, -3.45], [0, 1.5, -3.45], [0, 1.5, -2.85]], 0.26, "navy");
  }
  if (i >= 3) {
    let g = N(n, "CrystalDispatch", [5.25, 0, 7.95]);
    Ft(g, "DispatchApron", 5.4, 4, [0, 0, 0], 0.25), x(g, "LoadingRail", [4.5, 0.3, 1.8], [0, 0.42, -0.38], "navy", 0.04), Sy(g, "ShippingCanister", [-0.18, 0.58, -0.38], 2);
    let _ = N(g, "ShipmentLift", [1.85, 0.4, -0.7]);
    x(_, "LiftColumn", [0.45, 2.72, 0.55], [0, 1.36, 0], "yellow", 0.04), bt(_, "Cantilever", [0, 2.6, 0], [-1.45, 2.6, 0], 0.28, 0.3, "yellow"), bt(_, "SuspensionCable", [-1.45, 2.6, 0], [-1.45, 1.97, 0], 0.07, 0.07, "steel"), x(_, "GripSpreader", [0.85, 0.18, 0.85], [-1.45, 1.92, 0], "navy", 0.03);
    let p = N(g, "CrystalTransferCart", [-1.48, 0.25, 1.22]);
    x(p, "CargoChassis", [1.85, 0.3, 1.14], [0, 0.43, 0], "navy", 0.06);
    for (let y of [-0.68, 0.68]) for (let M of [-0.45, 0.45]) {
      let v = U(p, "Wheel", 0.25, 0.25, 0.2, [y, 0.23, M], "rubber", 8);
      v.rotation.z = Math.PI / 2;
    }
    x(p, "CanisterCradle", [1.5, 0.22, 0.93], [0, 0.67, 0], "yellow", 0.04), Ci(p, "TransportCrystal", [0, 0.77, 0], 0.27, 0.77, "crystal"), x(r, "StorageDispatchWalkway", [1.8, 0.22, 1.76], [6.45, 0.25, 5.48], "navy", 0.02), ht(r, "DispatchFeedCable", [[7.7, 0.51, 3.3], [7.7, 0.51, 5.95], [7.24, 0.51, 5.95], [7.24, 0.51, 6.45]], 0.12, "yellow");
  }
  return t;
}
function dl(i, t, e, n, r) {
  let s = N(i, t, e);
  Ft(s, "LoadBearingDeck", n, r, [0, 2, 0], 0.4);
  for (let o of [-n * 0.31, n * 0.31]) for (let a of [-r * 0.27, r * 0.27]) x(s, "ThrusterMount", [1.1, 0.27, 1.1], [o, 1.93, a], "navy", 0.08), eo(s, "LiftUnit", [o, 1.96, a], 0.85);
  for (let o of [-n / 2 + 0.45, n / 2 - 0.45]) x(s, "EdgeImpactMarker", [0.4, 0.3, 1], [o, 2.31, 0], "yellow", 0.04);
  return s;
}
function sh(i, t, e, n, r = 1.6) {
  let s = new P(...e), o = new P(...n), a = o.clone().sub(s), l = N(i, t, e);
  l.quaternion.setFromUnitVectors(new P(0, 0, 1), a.clone().normalize()), x(l, "BridgeDeck", [r, 0.25, a.length()], [0, -0.125, a.length() / 2], "navy", 0.04);
  for (let c of [-r / 2, r / 2]) {
    x(l, "BridgeTopRail", [0.11, 0.12, a.length()], [c, 0.8, a.length() / 2], "yellow", 0.02);
    for (let h of [0, a.length()]) x(l, "BridgeRailPost", [0.13, 0.88, 0.13], [c, 0.37, h], "navy", 0.02);
  }
  return l;
}
function oh(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Gas_Mine");
  t.userData.stage = i, t.userData.platformY = 2.4, t.userData.groundY = 0, t.userData.stages = [{ level: 1, label: "\u6D6E\u7A7A\u91C7\u6C14\u7AD9", additions: ["\u5B8C\u6574\u4E94\u53F6\u8FDB\u6C14\u6DA1\u8F6E\u548C\u538B\u7F29\u673A", "\u5355\u7F50 Gas_Storage", "\u72EC\u7ACB\u91C7\u6C14\u63A7\u5236\u8231"] }, { level: 2, label: "\u51C0\u5316\u91C7\u6C14\u573A", additions: ["\u7B2C\u4E8C\u53EA\u538B\u529B\u50A8\u7F50", "\u6D6E\u7A7A\u53CC\u7B52\u51C0\u5316\u7AD9\u4E0E\u8FDE\u63A5\u6865"] }, { level: 3, label: "\u91C7\u6C14\u7EFC\u5408\u4F53", additions: ["\u7B2C\u4E09\u53EA\u538B\u529B\u50A8\u7F50", "\u6D6E\u7A7A\u88C5\u5378\u63A5\u53E3\u7AD9", "\u72EC\u7ACB\u88C5\u8FD0\u7BA1\u7EBF"] }], t.userData.design = ["\u6240\u6709\u4E3B\u673A\u4E0E\u914D\u5957\u90FD\u5728\u72EC\u7ACB\u6D6E\u53F0\u4E0A\uFF0C\u6D6E\u53F0\u4EE5\u77ED\u6865\u8FDE\u63A5\uFF0C\u60AC\u6D6E\u652F\u5EA7\u4E0B\u65B9\u7559\u6709\u79BB\u5730\u95F4\u9699\u3002", "\u4E94\u7247\u6247\u53F6\u5C5E\u4E8E\u540C\u4E00\u8F6C\u5B50\uFF1B\u8FDB\u6C14\u7F69\u3001\u6269\u538B\u9525\u3001\u538B\u7F29\u673A\u548C\u50A8\u6C14\u603B\u7BA1\u8FDE\u7EED\u76F8\u63A5\u3002", "\u6BCF\u4E00\u7EA7\u5DF2\u88C5\u914D\u7684\u538B\u529B\u7F50\u90FD\u6709\u5C01\u5934\u3001\u5B89\u5168\u9600\u548C\u95ED\u5408\u8FDB\u51FA\u53E3\uFF1B\u65B0\u589E\u50A8\u7F50\u540C\u65F6\u63A5\u5165\u5BF9\u5E94\u652F\u8DEF\u3002"], t.userData.pivots = ["TurbineRotor"];
  let s = dl(e, "PrimaryFloatingDeck", [0, 0, -0.8], 14.8, 9), o = N(e, "IntakeTurbine", [-1.75, 7.05, -1.3]);
  Re(o, "IntakeStructuralShroud", 3.75, 0.56, [0, 0, 0], "ivory", 8, 40), Re(o, "InnerAcousticLiner", 3.37, 0.17, [0, 0, 0.15], "navy", 6, 40), Re(o, "OuterYellowClamp", 3.77, 0.14, [0, 0, 0.5], "yellow", 6, 40);
  let a = [[3.2, 0], [3.4, 0], [3.4, 0.6], [1.78, 2.3], [1.5, 2.3], [3.18, 0.52], [3.2, 0]].map((p) => new lt(...p)), l = new Xt(new Tn(a, 32), Ae.navy);
  l.name = "SealedRearDiffuser", l.rotation.x = -Math.PI / 2, l.position.z = -0.2, o.add(l);
  let c = N(o, "TurbineRotor", [0, 0, 0.22]);
  for (let p = 0; p < 5; p++) {
    let y = N(c, "FanBlade_" + (p + 1));
    y.rotation.z = p * Math.PI * 2 / 5;
    let M = Vt(y, "SweptBlade", [[0.64, -0.21], [2.96, -0.67], [3.28, -0.05], [3.01, 0.65], [1.08, 0.66], [0.63, 0.2]], 0.23, [0, 0, 0], "ivory", 0.035);
    M.rotation.y = 0.045;
    let v = Vt(y, "BladeRoot", [[0.65, -0.2], [1.38, -0.32], [1.65, 0.1], [1.03, 0.36], [0.65, 0.2]], 0.3, [0, 0, 0.04], "steel", 0.02);
  }
  for (let [p, y, M, v, w] of [["RotorHub", 0.94, 0.86, 0.17, "navy"], ["HubFairing", 0.68, 0.94, 0.38, "steel"], ["HubCap", 0.42, 0.17, 0.94, "yellow"]]) {
    let b = U(c, p, y, y, M, [0, 0, v], w, 12);
    b.rotation.x = Math.PI / 2;
  }
  we(c, { type: "spin", axis: "z", speed: 0.33 });
  for (let p = 0; p < 8; p++) {
    let y = p * Math.PI / 4, M = N(o, "HousingLatch_" + p, [Math.cos(y) * 3.82, Math.sin(y) * 3.82, 0]);
    M.rotation.z = y, x(M, "ClampBlock", [0.85, 0.45, 1.24], [0, 0, 0], p % 2 ? "navy" : "yellow", 0.05);
  }
  for (let p of [-4.78, 1.3]) Ft(e, "TurbineSaddleFoot", 1.8, 2.8, [p, 2.4, -1.35], 0.2), bt(e, "TurbineSaddle", [p, 2.55, -1.35], [p, 4.3, -1.35], 0.8, 1.45, "navy"), x(e, "SaddleImpactPlate", [0.5, 1.23, 1.56], [p, 3.02, -1.35], "yellow", 0.06);
  let h = N(e, "CompressorAndDryer", [-0.7, 2.4, -3.1]);
  x(h, "CompressorHousing", [4.25, 2.5, 3.7], [0, 1.45, 0], "ivory", 0.2), x(h, "MotorServicePanel", [3.7, 1.5, 0.28], [0, 1.42, -1.96], "navy", 0.07);
  for (let p = 0; p < 5; p++) x(h, "RearCoolingVent_" + p, [0.42, 1, 0.12], [(p - 2) * 0.59, 1.5, -2.13], "steel", 0.02);
  let u = U(e, "DiffuserCompressorNeck", 1.48, 1.48, 1.5, [-1.75, 6.14, -3.75], "navy", 16);
  u.rotation.x = Math.PI / 2, x(e, "DiffuserLowerMount", [2.7, 1.47, 2.7], [-1.65, 5.24, -3.7], "navy", 0.12), ht(e, "CompressedGasHeader", [[1.35, 3.53, -3.5], [2.7, 3.53, -3.5], [2.7, 3.53, -1.1], [3.4, 3.53, -1.1]], 0.38, "yellow");
  let d = N(e, "StorageIsolationManifold", [3.25, 2.4, -0.75]);
  x(d, "ManifoldSupport", [0.4, 1.16, 3.7], [0, 0.58, 0], "navy", 0.04), ht(d, "MainHeader", [[0, 1.1, -1.65], [0, 1.1, 1.65]], 0.29, "navy");
  let f = N(n, "Gas_Storage");
  f.userData.label = "\u4E09\u8054\u50A8\u6C14\u7F50";
  let m = [{ p: [4.75, 2.4, -2.35], r: 1.2, h: 6.95 }, { p: [5.15, 2.4, 0.45], r: 1.02, h: 4.85 }, { p: [4.42, 2.4, 2.87], r: 0.99, h: 3.32 }];
  for (let p = 0; p < i; p++) {
    let y = m[p], M = je(f, "PressureTank_" + (p + 1), y.p, y.r, y.h, "ivory"), v = Re(M, "TankIdentificationBand", y.r + 0.025, 0.085, [0, y.h * 0.73, 0], "yellow", 5, 20);
    v.rotation.x = Math.PI / 2, x(M, "LevelSightGlass", [0.24, y.h * 0.45, 0.1], [0, y.h * 0.48, y.r + 0.07], "cyan", 0.02), Zt(M, "SafetyValve", [0.4, y.h + 0.06, 0], 0.55), ht(r, "TankBranch_" + (p + 1), [[3.25, 3.5, Math.min(1, y.p[2])], [y.p[0] - y.r - 0.32, 3.5, Math.min(1, y.p[2])], [y.p[0] - y.r - 0.32, 3.5, y.p[2]], [y.p[0] - y.r * 0.86, 3.5, y.p[2]]], 0.25, "yellow");
  }
  let g = se(e, "CompressorOperatorCabin", [-1.15, 2.4, 2.25], 3.5, 1.9, 1.65, "control");
  x(g, "ProcessGauge", [1.45, 0.16, 0.68], [0, 2.06, 0.3], "cyan", 0.03), ht(e, "SensorConduit", [[-1.75, 6.7, -0.45], [-1.75, 4.15, 0.9], [-0.9, 4.15, 1.2], [-0.9, 4, 1.4]], 0.23, "yellow");
  let _ = dl(n, "GasControlPlatform", [-10, 0, 2.3], 4.4, 3.8);
  if (se(_, "SamplingControlCabin", [0, 2.4, 0], 3.55, 2.75, 2.15, "control"), Zt(_, "WeatherTelemetry", [0.62, 5.01, -0.32], 1.75), sh(r, "ControlAccessBridge", [-7.4, 2.4, 2.3], [-7.79, 2.4, 2.3], 1.4), ht(r, "ControlPlatformUtility", [[-7.2, 2.17, 1.72], [-8, 2.17, 1.72]], 0.16, "yellow"), i >= 2) {
    let p = dl(n, "GasPurificationPlatform", [-3.6, 0, 7.43], 5.6, 4.1);
    for (let y of [-1.15, 1.15]) {
      let M = je(p, y < 0 ? "DesiccantBedA" : "DesiccantBedB", [y, 2.4, -0.1], 0.7, 2.05, "ivory");
      x(M, "ServiceValveCover", [0.82, 0.69, 0.3], [0, 1.07, 0.73], "navy", 0.035);
    }
    x(p, "FiltrationControl", [1.6, 1.15, 1.3], [0, 2.98, 1.2], "ivory", 0.08), zt(p, "PurificationStatus", [0, 3.12, 1.91], 1.1, 0.35), ht(p, "DualBedManifold", [[-1.15, 3.11, -0.65], [-1.15, 3.11, -1.2], [1.15, 3.11, -1.2], [1.15, 3.11, -0.65]], 0.18, "yellow"), sh(r, "PurifierAccessBridge", [-3.6, 2.4, 3.7], [-3.6, 2.4, 5.42], 1.55), ht(r, "DryGasReturn", [[-2.8, 3.23, 2.7], [-2.8, 3.23, 5.9], [-2.45, 3.23, 5.9], [-2.45, 3.23, 6.78]], 0.28, "yellow"), ht(r, "PurifierWetFeed", [[-2.79, 3.06, -2.25], [-4.72, 3.06, -2.25], [-4.72, 3.06, 6.77]], 0.24, "navy");
    for (let y of [-0.35, 2.85]) bt(e, "PurifierFeedClamp", [-4.72, 2.41, y], [-4.72, 2.9, y], 0.16, 0.16, "steel");
  }
  if (i >= 3) {
    let p = dl(n, "GasLoadingPlatform", [7.45, 0, 7.38], 5.9, 4.8);
    x(p, "DockServiceCabin", [2.65, 2.3, 1.75], [-0.65, 3.76, -0.82], "ivory", 0.1), zt(p, "DockControlWindow", [-0.65, 3.89, 0.12], 1.95, 0.6);
    let y = N(p, "PressurizedLoadingCoupling", [1.65, 2.4, 0.2]);
    x(y, "CouplingPedestal", [0.8, 1.45, 1.05], [0, 0.73, 0], "yellow", 0.06);
    let M = U(y, "DryBreakPort", 0.47, 0.47, 0.6, [0, 1.5, 0.3], "navy", 10);
    M.rotation.x = Math.PI / 2;
    let v = U(y, "ClosedPortCover", 0.32, 0.32, 0.09, [0, 1.5, 0.63], "steel", 10);
    v.rotation.x = Math.PI / 2, ce(p, "DockApproach", 2.4, 1.25, 0.3, [-0.8, 2.4, 1]), sh(r, "LoadingAccessBridge", [6.65, 2.4, 3.6], [6.65, 2.4, 5.05], 1.65), ht(r, "ProductGasLoadingMain", [[5.36, 3.33, 2.75], [8.98, 3.33, 2.75], [8.98, 3.33, 7.08], [9.1, 3.33, 7.58]], 0.31, "yellow"), ht(p, "DockCouplingRiser", [[1.65, 2.82, -0.3], [1.65, 3.93, -0.3], [1.65, 3.93, 0.2]], 0.26, "navy");
  }
  return t;
}
function ah(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Solar_Plant");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u592A\u9633\u80FD\u7AD9", additions: ["\u56DB\u7247\u5404\u4E00\u6BB5\u7684\u72EC\u7ACB\u592A\u9633\u80FD\u7FFC", "\u5B8C\u6574\u80FD\u6E90\u8231\u548C\u50A8\u80FD\u7AD9"] }, { level: 2, label: "\u6269\u5C55\u592A\u9633\u80FD\u573A", additions: ["\u56DB\u7FFC\u5404\u589E\u52A0\u7B2C\u4E8C\u6BB5\u5149\u4F0F\u677F", "\u72EC\u7ACB\u9006\u53D8\u5668\u8231\u548C\u914D\u7535\u63A5\u53E3"] }, { level: 3, label: "\u592A\u9633\u80FD\u7EFC\u5408\u4F53", additions: ["\u56DB\u7FFC\u5404\u589E\u52A0\u7B2C\u4E09\u6BB5\u5149\u4F0F\u677F", "\u68C0\u4FEE\u8231\u4E0E\u50A8\u80FD\u6269\u5BB9\u6A21\u5757"] }], t.userData.design = ["\u6BCF\u4E00\u7EA7\u5747\u4E3A\u56DB\u7247\u72EC\u7ACB\u592A\u9633\u80FD\u7FFC\uFF1B\u5347\u7EA7\u5728\u7FFC\u7AEF\u589E\u52A0\u5B8C\u6574\u5149\u4F0F\u677F\u6BB5\uFF0C\u4FDD\u7559\u539F\u94F0\u94FE\u4F4D\u7F6E\u3002", "\u56DB\u7FFC\u5728\u4E2D\u592E\u80FD\u6E90\u8231\u56DB\u89D2\u5C55\u5F00\uFF0C\u94F0\u94FE\u8F74\u3001\u4F38\u7F29\u6491\u6746\u3001\u4E3B\u6881\u548C\u7EBF\u7F06\u6709\u660E\u786E\u8FDE\u63A5\u5173\u7CFB\u3002", "\u4E2D\u592E\u6574\u6D41\u8BBE\u5907\u4E0E\u50A8\u80FD\u67DC\u6784\u6210\u5B8C\u6574\u53D1\u7535\u7CFB\u7EDF\uFF0C\u9AD8\u7B49\u7EA7\u589E\u52A0\u72EC\u7ACB\u9006\u53D8\u5668\u548C\u7EF4\u62A4\u8BBE\u65BD\u3002"], t.userData.pivots = ["SolarWingHinge_1", "SolarWingHinge_2", "SolarWingHinge_3", "SolarWingHinge_4"], U(e, "OctagonalFoundation", 4.14, 4.55, 0.4, [0, 0.2, 0], "navy", 8), U(e, "PowerDistributionBase", 3.76, 4.16, 0.98, [0, 0.89, 0], "ivory", 8), U(e, "BatteryBusBand", 3.85, 3.85, 0.43, [0, 1.55, 0], "navy", 8), U(e, "CentralEnergyCabin", 2.77, 3.65, 2.75, [0, 3.02, 0], "ivory", 8), U(e, "CabinUpperNeck", 2.55, 2.75, 0.44, [0, 4.58, 0], "navy", 8), U(e, "OctagonalServiceRoof", 2, 2.48, 0.61, [0, 5.09, 0], "ivory", 8), U(e, "CentralPowerHub", 1.03, 1.35, 0.52, [0, 5.55, 0], "navy", 8), U(e, "HubStatusRing", 0.99, 1.02, 0.14, [0, 5.88, 0], "cyan", 8), U(e, "EnergyHubCap", 0.6, 0.7, 0.5, [0, 6.13, 0], "yellow", 6);
  for (let l = 0; l < 8; l++) {
    let c = l * Math.PI / 4, h = x(e, "PerimeterWindow_" + l, [1.51, 0.36, 0.15], [Math.sin(c) * 3.7, 1.58, Math.cos(c) * 3.7], "cyan", 0.025);
    h.rotation.y = c;
  }
  for (let l of [-2.17, 2.17]) {
    let c = x(e, "FrontShellSeam", [0.14, 2.53, 0.14], [l, 2.95, 2.15], "navy", 0.02);
    c.rotation.z = l < 0 ? -0.13 : 0.13;
  }
  let s = N(e, "MainEnergyAirlock", [0, 0, 3.55]);
  x(s, "AirlockHousing", [2.75, 2.85, 1.52], [0, 1.75, 0], "ivory", 0.15), x(s, "AirlockFrame", [2.48, 2.3, 0.36], [0, 1.69, 0.86], "navy", 0.06), fe(s, "MainDoor", [0, 0.39, 1.08], 1.43, 1.85), ce(s, "MainAccessRamp", 2.17, 2.2, 0.4, [0, 0, 1.25]), x(s, "EntryPowerIndicator", [1.7, 0.2, 0.12], [0, 2.83, 1.04], "cyan", 0.02);
  let o = [-1.12, 1.12, -2.38, 2.38];
  for (let l = 0; l < 4; l++) {
    let c = N(e, "SolarWingSupport_" + (l + 1));
    c.rotation.y = o[l], Ft(c, "WingFoot", 1.65, 2, [0, 0, 3.38], 0.3), x(c, "HingePylon", [1.3, 3.55, 1.25], [0, 2.04, 3.15], "navy", 0.12), x(c, "PylonArmor", [0.89, 3.1, 1.38], [0, 2.05, 3.18], "ivory", 0.1);
    let h = N(c, "SolarWingHinge_" + (l + 1), [0, 4, 3.18]);
    h.rotation.x = -0.46;
    let u = U(h, "HingeAxle", 0.44, 0.44, 3.45, [0, 0, 0], "yellow", 12);
    u.rotation.z = Math.PI / 2;
    for (let _ of [-1.28, 1.28]) {
      let p = U(h, "HingeBearing", 0.56, 0.56, 0.28, [_, 0, 0], "navy", 12);
      p.rotation.z = Math.PI / 2;
    }
    let d = i * 2.32;
    x(h, "ContinuousWingSpar", [0.48, 0.48, d + 0.15], [0, -0.29, d / 2], "navy", 0.06);
    for (let _ = 0; _ < i; _++) {
      let p = N(h, "PhotovoltaicSection_" + (_ + 1), [0, 0, _ * 2.32]);
      x(p, "PanelBackplate", [3.35, 0.24, 2.27], [0, 0, 1.16], "navy", 0.035);
      for (let y of [-1.57, 1.57]) x(p, "PanelEdgeBeam", [0.18, 0.3, 2.3], [y, 0.07, 1.16], "ivory", 0.025);
      for (let y of [0.07, 2.24]) x(p, "CrossFrame", [3.25, 0.3, 0.14], [0, 0.07, y], "navy", 0.025);
      for (let y = 0; y < 3; y++) for (let M = 0; M < 2; M++) x(p, "BluePVCell_" + y + "_" + M, [1.36, 0.05, 0.62], [(M - 0.5) * 1.44, 0.158, 0.46 + y * 0.7], "blue", 0.01);
      if (x(p, "CellBusbar", [0.035, 0.016, 2], [0, 0.19, 1.16], "cyan", 0), _ > 0) for (let y of [-1.05, 1.05]) x(p, "SectionAttachmentLug", [0.3, 0.32, 0.36], [y, -0.11, 0.02], "yellow", 0.03);
    }
    let f = i * 2.32 + 0.03;
    x(h, "FinishedWingTip", [3.35, 0.3, 0.2], [0, 0.015, f], "navy", 0.025);
    let m = 4 + Math.sin(0.46) * 1.8, g = 3.18 + Math.cos(0.46) * 1.8;
    for (let _ of [-0.7, 0.7]) {
      let p = new P(_, 0.65, 3.53), y = new P(_, m, g);
      bt(c, "SupportCylinder", p.toArray(), p.clone().lerp(y, 0.58).toArray(), 0.22, 0.22, "navy"), bt(c, "SupportPiston", p.clone().lerp(y, 0.49).toArray(), y.toArray(), 0.115, 0.115, "steel");
    }
    ht(c, "WingCable", [[0.55, 1.25, 2.43], [0.55, 3.87, 2.43], [0.55, 3.87, 3.18]], 0.12, "yellow");
  }
  let a = N(n, "EnergyStorageStation", [-6.05, 0, 5.45]);
  Ft(a, "BatteryFoundation", 4.65, 3.7, [0, 0, 0], 0.28);
  for (let l = 0; l < (i === 3 ? 3 : 2); l++) {
    let c = i === 3 ? (l - 1) * 1.33 : (l - 0.5) * 1.62, h = N(a, "BatteryCabinet_" + (l + 1), [c, 0.28, 0]);
    x(h, "BatteryHousing", [1.23, 2.65, 2.75], [0, 1.325, 0], "ivory", 0.16), x(h, "CellServicePanel", [0.88, 1.9, 0.16], [0, 1.35, 1.45], "navy", 0.04);
    for (let u = 0; u < 3; u++) x(h, "ChargeIndicator_" + u, [0.53, 0.16, 0.07], [0, 1.06 + u * 0.35, 1.56], "cyan", 0.02);
    x(h, "LiftingCap", [1.03, 0.22, 2.5], [0, 2.77, 0], "yellow", 0.06);
  }
  if (ht(r, "BatteryPowerBus", [[-3.23, 0.68, 2.51], [-4.3, 0.68, 3.4], [-4.3, 0.68, 4.27], [-4.82, 0.68, 4.27]], 0.24, "yellow"), ht(a, "CabinetConnector", [[-1.74, 0.57, -1.6], [1.72, 0.57, -1.6]], 0.18, "navy"), i >= 2) {
    let l = se(n, "GridInverterCabin", [6.06, 0, 5.45], 3.9, 3, 2.6, "utility");
    ye(l, "InverterVent", [0, 2.98, -0.45], 2.2, 0.95), Zt(l, "GridTelemetry", [1.05, 3, -0.6], 1.05), ht(r, "InverterDCBus", [[3.3, 0.74, 2.55], [4.37, 0.74, 3.43], [4.37, 0.74, 4.39], [4.37, 0.74, 5.35]], 0.23, "yellow"), x(l, "GridConnectorBlock", [0.57, 1, 0.8], [2.05, 0.83, 0], "navy", 0.07);
  }
  if (i >= 3) {
    let l = se(n, "SolarMaintenanceCabin", [0.8, 0, 9.15], 3.8, 2.8, 2.5, "cargo");
    x(l, "SparePanelRack", [1.9, 0.38, 1.5], [0.3, 2.97, -0.15], "navy", 0.05), x(l, "ReplacementPanel", [1.72, 0.07, 1.27], [0.3, 3.19, -0.15], "blue", 0.015), ht(r, "MaintenanceServiceBus", [[3, 0.57, 3.65], [3, 0.57, 7.15], [2.15, 0.57, 7.15], [2.15, 0.57, 7.8]], 0.14, "navy");
  }
  return t;
}
function er(i, t, e, n, r, s, o) {
  let a = [[e, -r / 2], [n, -r / 2], [n, r / 2], [e, r / 2], [e, -r / 2]].map((c) => new lt(...c)), l = new Xt(new Tn(a, 40), Ae[o]);
  return l.name = t, l.position.y = s, i.add(l), l;
}
function lh(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Fusion_Reactor");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u805A\u53D8\u7535\u7AD9", additions: ["\u5B8C\u6574\u6C34\u5E73\u73AF\u5F62\u53CD\u5E94\u5806\u53CA\u4E09\u8DB3\u652F\u6491", "\u4E09\u7247\u9996\u7EA7\u6563\u70ED\u7FFC", "\u5355\u7B52\u51B7\u5374\u7AD9\u4E0E\u63A7\u5236\u8231"] }, { level: 2, label: "\u6269\u5BB9\u805A\u53D8\u7AD9", additions: ["\u6563\u70ED\u7FFC\u589E\u52A0\u4E2D\u6BB5\u6362\u70ED\u7EC4", "\u51B7\u5374\u7AD9\u589E\u52A0\u7B2C\u4E8C\u7B52", "\u72EC\u7ACB\u914D\u7535\u8231"] }, { level: 3, label: "\u805A\u53D8\u80FD\u6E90\u7EFC\u5408\u4F53", additions: ["\u6563\u70ED\u7FFC\u4E0A\u6BB5\u6362\u70ED\u7EC4", "\u51B7\u5374\u7AD9\u6CF5\u7EC4\u6269\u5BB9", "\u80CC\u90E8\u8F85\u52A9\u51B7\u5374\u9635\u5217"] }], t.userData.design = ["\u53CD\u5E94\u5806\u4E3A\u6C34\u5E73\u539A\u73AF\uFF0C\u4E2D\u5B54\u5728\u5168\u90E8\u7EA7\u522B\u4FDD\u6301\u8D2F\u901A\uFF1B\u6CA1\u6709\u5B9E\u5FC3\u5706\u76D8\u586B\u4F4F\u4E2D\u5FC3\u3002", "\u4E09\u7247\u6563\u70ED\u7FFC\u540C\u65F6\u662F\u843D\u5730\u627F\u91CD\u652F\u67B6\uFF0C\u673A\u5EA7\u3001\u73AF\u58F3\u4E0E\u7FFC\u7AEF\u4E4B\u95F4\u6709\u8FDE\u7EED\u7ED3\u6784\u3002", "\u72EC\u7ACB\u4F9B\u56DE\u6C34\u7BA1\u5C06\u53CD\u5E94\u5806\u63A5\u5165\u51B7\u5374\u7AD9\uFF0C\u65B0\u589E\u6362\u70ED\u4E0E\u914D\u7535\u8BBE\u5907\u540C\u65F6\u83B7\u5F97\u5BF9\u5E94\u8FDE\u63A5\u3002"], er(e, "OpenAnnularFoundation", 1.6, 3.75, 0.42, 0.21, "navy"), er(e, "LowerServiceGallery", 1.62, 3.34, 1.5, 1.17, "ivory"), er(e, "ServiceGalleryBand", 1.59, 3.39, 0.38, 1.38, "navy"), er(e, "CentralMaintenanceCollar", 1.62, 2.62, 1, 2.3, "navy");
  for (let d = 0; d < 3; d++) {
    let f = d * Math.PI * 2 / 3, m = N(e, "ReactorTripod_" + (d + 1));
    m.rotation.y = f, Ft(m, "TripodGroundFoot", 2.7, 3.35, [0, 0, 5], 0.3), bt(m, "InnerSupportColumn", [0, 1.15, 3.15], [0, 5.36, 3.65], 1.1, 1.3, "navy"), bt(m, "RadialLoadBeam", [0, 1, 2.5], [0, 0.8, 5.2], 1, 0.8, "navy");
    let g = N(m, "StructuralRadiatorFin_" + (d + 1), [0, 0.35, 5]), _ = Vt(g, "FinArmor", [[-1.2, 0], [0.95, 0], [1.65, 2.2], [1.35, 3.6], [0.62, 8.6], [0.03, 9.6], [-0.53, 9.48], [-1.05, 4.75]], 1.38, [0, 0, 0], "ivory", 0.065);
    _.rotation.y = Math.PI / 2;
    for (let p = 0; p < 6; p++) {
      let y = 2.42 + p * 0.92, M = 1.4 - 0.078 * y;
      if (x(g, "RadiatorHousing_" + p, [1.06, 0.79, 0.2], [0, y, M], "navy", 0.03), x(g, "RadiatorPanel_" + p, [0.79, 0.6, 0.11], [0, y, M + 0.15], p < i * 2 ? "cyan" : "ivory", 0.025), p < i * 2) for (let v = 0; v < 2; v++) x(g, "RadiatorCoolingBar_" + p + "_" + v, [0.88, 0.055, 0.13], [0, y - 0.18 + v * 0.36, M + 0.21], "steel", 0.01);
    }
    x(g, "FinTopInsulator", [1.43, 0.38, 0.84], [0, 9.67, 0.1], "yellow", 0.045), x(g, "RingAttachmentBlock", [1.55, 0.63, 1.68], [0, 6.8, -0.15], "navy", 0.07), x(g, "RingAttachmentLatch", [1.62, 0.36, 0.6], [0, 7.13, -0.07], "yellow", 0.04), ht(m, "FinCoolingRiser", [[0.58, 1.1, 4.2], [0.58, 5.95, 4.2], [0.58, 5.95, 4.58]], 0.19, "navy");
  }
  let s = N(e, "HorizontalRingReactor", [0, 6.4, 0]), o = Re(s, "ThickContainmentTorus", 4.22, 1.39, [0, 0, 0], "ivory", 10, 48);
  o.rotation.x = Math.PI / 2, er(s, "OuterEquipmentBelt", 5.51, 5.64, 0.75, 0, "navy"), er(s, "InnerEquipmentBelt", 2.76, 2.95, 0.75, 0, "navy"), er(s, "InnerEnergyMonitor", 2.75, 2.78, 0.26, 0, "cyan");
  for (let d = 0; d < 18; d++) {
    let f = d * Math.PI * 2 / 18, m = x(s, "ContainmentMonitor_" + d, [1.46, 0.34, 0.09], [Math.sin(f) * 5.66, 0, Math.cos(f) * 5.66], "cyan", 0.015);
    m.rotation.y = f;
  }
  for (let d = 0; d < 9; d++) {
    let f = d * Math.PI * 2 / 9, m = N(s, "ContainmentShellJoint_" + d);
    m.rotation.y = f, x(m, "UpperServiceCover", [0.15, 0.15, 1.73], [0, 1.34, 4.23], "navy", 0.025), x(m, "LiftingLug", [0.45, 0.3, 0.55], [0, 1.48, 4.27], d % 3 === 0 ? "yellow" : "ivory", 0.04);
  }
  let a = N(e, "FrontMaintenanceAccess", [0, 0, 5.77]);
  x(a, "AirlockHousing", [2.65, 2.2, 1.65], [0, 1.38, 0], "ivory", 0.14), fe(a, "MaintenanceDoor", [0, 0.3, 0.9], 1.4, 1.67), ce(a, "MaintenanceRamp", 2, 1.6, 0.3, [0, 0, 1.05]), x(a, "UpperAccessPanel", [1.15, 0.68, 0.2], [0, 2.36, 0.77], "navy", 0.03), x(a, "UpperAccessStatus", [0.67, 0.36, 0.08], [0, 2.39, 0.91], "cyan", 0.025);
  let l = N(n, "CoolingStation", [-7.2, 0, 2.45]);
  Ft(l, "CoolingStationFoot", i === 1 ? 3.25 : 4.9, 4.25, [0, 0, 0], 0.29);
  let c = i === 1 ? [0] : [-1.13, 1.13];
  for (let d = 0; d < c.length; d++) {
    let f = je(l, "CoolantReservoir_" + (d + 1), [c[d], 0.29, 0], 0.92, 3.48, "ivory");
    U(f, "CoolantAccessCap", 0.66, 0.69, 0.22, [0, 3.58, 0], "navy", 12), U(f, "CoolantCapIndicator", 0.37, 0.37, 0.08, [0, 3.73, 0], "cyan", 12), x(f, "TankServicePanel", [0.41, 1.63, 0.14], [0, 1.61, 1.01], "navy", 0.04), ht(l, "ReservoirBranch_" + d, [[c[d], 1.12, -0.86], [c[d], 1.12, -1.55], [i === 1 ? 0.7 : 1.5, 1.12, -1.55]], 0.22, "navy");
  }
  let h = -7.2 + (i === 1 ? 0.9 : 2.05);
  ht(r, "ReactorCoolantSupply", [[-3.15, 1.4, 1], [-4.43, 1.4, 1], [-4.43, 1.4, 1.85], [h, 1.4, 1.85]], 0.27, "cyan"), ht(r, "ReactorCoolantReturn", [[-2.63, 1, 1.94], [-4.15, 1, 2.85], [h, 1, 2.85]], 0.29, "navy");
  for (let d of [1.85, 2.85]) Ft(r, "CoolantPipeFoot", 0.85, 0.8, [-4.65, 0, d], 0.15), bt(r, "CoolantPipeSupport", [-4.65, 0.12, d], [-4.65, 1, d], 0.16, 0.16, "steel");
  let u = se(n, "ReactorControlCabin", [6.75, 0, 4.7], 3.9, 3.05, 2.6, "control");
  if (Zt(u, "ControlTelemetry", [0.75, 3.01, -0.4], 1.26), ht(r, "ControlInstrumentDuct", [[2.6, 0.86, 1.9], [2.52, 0.86, 3.2], [4.2, 0.86, 3.2], [4.2, 0.86, 4.38], [4.85, 0.86, 4.38]], 0.18, "navy"), i >= 2) {
    let d = se(n, "PowerDistributionCabin", [7.35, 0, -2.75], 3.6, 2.85, 2.47, "utility");
    x(d, "TransformerShoulder", [0.66, 1.75, 1.2], [-1.93, 1.11, -0.15], "navy", 0.09), ht(r, "HighCurrentBus", [[4.78, 1.22, -2.65], [5.55, 1.22, -2.65]], 0.33, "yellow"), ye(d, "TransformerRoofCooling", [0, 2.88, -0.1], 2, 0.86);
  }
  if (i >= 3) {
    x(l, "CoolantPumpHousing", [2.9, 1.45, 1.35], [0, 1.05, -1.96], "navy", 0.1);
    for (let f of [-0.85, 0.85]) {
      let m = U(l, "CirculationPumpMotor", 0.37, 0.37, 0.95, [f, 1.26, -2.18], "steel", 10);
      m.rotation.x = Math.PI / 2, ht(l, "PumpFeed", [[f, 1.15, -1.9], [f, 1.15, -1.32], [f, 1.12, -0.95]], 0.19, "yellow");
    }
    let d = N(n, "AuxiliaryHeatExchanger", [-6.45, 0, -4.9]);
    Ft(d, "AuxCoolingFoot", 3.85, 3, [0, 0, 0], 0.26);
    for (let f of [-1.23, 1.23]) x(d, "ExchangerLeg", [0.36, 2.6, 0.52], [f, 1.49, -0.08], "navy", 0.04);
    x(d, "FinBankCase", [3, 2.45, 0.93], [0, 2.58, -0.12], "ivory", 0.1);
    for (let f = 0; f < 6; f++) x(d, "HeatExchangeLouver_" + f, [2.52, 0.22, 1.13], [0, 1.69 + f * 0.37, -0.1], "navy", 0.025);
    x(d, "UpperHeader", [3.2, 0.28, 1.25], [0, 3.97, -0.1], "yellow", 0.04), ht(r, "AuxCoolingSupply", [[-4.65, 1.7, -2.5], [-5.2, 1.7, -3.76], [-5.2, 1.7, -4.9]], 0.25, "navy"), ht(r, "AuxCoolingReturn", [[-3.75, 1.13, -3], [-4.65, 1.13, -4.62], [-5.2, 1.13, -4.62]], 0.22, "cyan");
  }
  return t;
}
function ch(i, t, e, n, r = 1.8) {
  let s = new P(...e), o = new P(...n), a = o.clone().sub(s), l = a.length(), c = N(i, t, s.clone().add(o).multiplyScalar(0.5).toArray());
  c.rotation.y = Math.atan2(a.x, a.z), x(c, "Conveyor_Frame", [r + 0.36, 0.29, l], [0, 0, 0], "navy", 0.025), x(c, "Conveyor_Belt", [r, 0.09, l - 0.08], [0, 0.2, 0], "rubber", 0.01);
  for (let h = 0; h <= Math.floor(l / 0.43); h++) {
    let u = -0.5 * l + 0.19 + h * 0.43;
    if (u > l / 2 - 0.08) continue;
    let d = U(c, `Roller_${h}`, 0.105, 0.105, r, [0, 0.21, u], "steel", 8);
    d.rotation.z = Math.PI / 2;
  }
  for (let h of [-r / 2 - 0.11, r / 2 + 0.11]) x(c, "Raised_Side_Rail", [0.13, 0.2, l], [h, 0.23, 0], "yellow", 0.015);
  for (let h of [-l / 2 + 0.45, l / 2 - 0.45]) for (let u of [-r * 0.36, r * 0.36]) x(c, "Conveyor_Leg", [0.2, 0.51, 0.22], [u, -0.35, h], "steel", 0.025);
  return c;
}
function sf(i, t, e, n = 1) {
  let r = N(i, t, e);
  r.scale.setScalar(n);
  for (let s of [-0.28, 0.28]) x(r, "Foot", [0.36, 0.19, 0.64], [s, 0.1, 0.15], "navy"), x(r, "Lower_Leg", [0.22, 0.53, 0.23], [s, 0.42, 0], "ivory"), U(r, "Hip_Joint", 0.18, 0.18, 0.23, [s, 0.8, 0], "steel", 8).rotation.z = Math.PI / 2;
  x(r, "Torso", [0.8, 0.84, 0.49], [0, 1.13, 0], "ivory"), x(r, "Torso_Service_Panel", [0.45, 0.39, 0.06], [0, 1.18, 0.278], "navy", 0.025), x(r, "Head", [0.56, 0.42, 0.5], [0, 1.8, 0], "ivory", 0.065), x(r, "Optical_Visor", [0.45, 0.14, 0.035], [0, 1.83, 0.268], "cyan", 0.01);
  for (let s of [-0.59, 0.59]) U(r, "Shoulder_Joint", 0.18, 0.18, 0.2, [s, 1.37, 0], "yellow", 8).rotation.z = Math.PI / 2, bt(r, "Arm_Link", [s, 1.3, 0], [s, 0.83, 0.16], 0.19, 0.2, "ivory"), x(r, "Service_Gripper", [0.24, 0.25, 0.23], [s, 0.69, 0.2], "steel");
  return r;
}
function hh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Robotics_Facility");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u673A\u5668\u4EBA\u88C5\u914D\u7AD9", additions: ["\u5B8C\u6574\u655E\u53E3\u88C5\u914D\u5927\u5385", "\u4E00\u53EA\u53EF\u8FBE\u751F\u4EA7\u7EBF\u7684\u5173\u8282\u673A\u68B0\u81C2", "\u8FDB\u6599\u5E93\u4E0E\u5B8C\u6574\u77ED\u88C5\u914D\u7EBF"] }, { level: 2, label: "\u53CC\u81C2\u81EA\u52A8\u88C5\u914D\u5382", additions: ["\u7B2C\u4E8C\u53EA\u5173\u8282\u673A\u68B0\u81C2", "\u8BBE\u5907\u4FDD\u969C\u8231", "\u9876\u90E8\u751F\u4EA7\u63A7\u5236\u8231"] }, { level: 3, label: "\u673A\u5668\u4EBA\u5236\u9020\u4E2D\u5FC3", additions: ["\u72EC\u7ACB\u6210\u54C1\u5E93", "\u5E26\u68C0\u6D4B\u673A\u5668\u4EBA\u7684\u6D4B\u8BD5\u53F0", "\u6210\u54C1\u8F6C\u8FD0\u7EBF\u53CA\u72EC\u7ACB\u5DE5\u4EF6"] }], t.userData.design = ["\u88C5\u914D\u5927\u5385\u6B63\u9762\u4E3A\u771F\u5B9E\u655E\u53E3\uFF0C\u5899\u4F53\u3001\u4FA7\u67F1\u3001\u540E\u58C1\u548C\u5C4B\u76D6\u56F4\u5408\uFF0C\u673A\u68B0\u81C2\u524D\u65B9\u6CA1\u6709\u5047\u5899\u3002", "\u673A\u68B0\u81C2\u4ECE\u4E24\u4FA7\u4F38\u5411\u4E2D\u592E\u6EDA\u7B52\u7EBF\uFF1B\u5E95\u5EA7\u907F\u5F00\u7269\u6599\u901A\u9053\uFF0C\u5173\u8282\u4E0E\u5939\u722A\u5206\u522B\u5EFA\u6A21\u3002", "\u897F\u4FA7\u8FDB\u6599\u7ECF\u4E13\u7528\u5899\u6D1E\u63A5\u5165\u5927\u5385\uFF0C\u4E1C\u4FA7\u51FA\u8D27\u7ECF\u72EC\u7ACB\u5899\u6D1E\u63A5\u5165\u6210\u54C1\u5E93\uFF1B\u524D\u65B9\u6D4B\u8BD5\u53F0\u7559\u88C5\u5378\u7A7A\u95F4\u3002"], t.userData.pivots = ["Assembly_Arm_A/Shoulder", "Assembly_Arm_A/Elbow", "Assembly_Arm_A/Wrist", "Assembly_Arm_B/Shoulder", "Assembly_Arm_B/Elbow", "Assembly_Arm_B/Wrist"], Ft(e, "Assembly_Hall_Foundation", 13.58, 10.76, [0, 0, 0.48], 0.3), x(e, "Interior_Floor", [11.63, 0.16, 9.83], [0, 0.4, 0.46], "steel", 0.025), x(e, "Rear_Closure", [11.55, 6.63, 0.57], [0, 3.75, -4.36], "navy"), x(e, "Rear_Service_Wall", [7.65, 3.72, 0.12], [0, 3.1, -4.04], "steel");
  for (let a of [-3.13, 0, 3.13]) x(e, "Rear_Tool_Cabinet", [2.2, 1.61, 0.51], [a, 2.01, -3.75], "navy"), x(e, "Rear_Work_Light", [1.46, 0.16, 0.08], [a, 4.51, -4], "yellow", 0.015);
  for (let a of [-1, 1]) {
    let l = N(e, a < 0 ? "Input_Side_Wall" : "Output_Side_Wall", [a * 6.05, 0, 0]);
    x(l, "Rear_Wall_Section", [0.65, 6.79, 2.68], [0, 3.68, -3.19], "ivory"), x(l, "Front_Wall_Section", [0.65, 6.79, 2.12], [0, 3.68, 2.52], "ivory"), x(l, "Transfer_Port_Header", [0.7, 4.09, 3.36], [0, 5.03, -0.18], "ivory"), x(l, "Transfer_Port_Lintel", [0.85, 0.2, 3.02], [0, 2.89, -0.15], "yellow");
    for (let h of [-1.7, 1.36]) x(l, "Transfer_Port_Jamb", [0.84, 2.34, 0.19], [0, 1.7, h], "navy");
    if (a > 0 && i < 3) {
      x(l, "Closed_Service_Transfer_Shutter", [0.15, 2.35, 2.8], [0.42, 1.66, -0.15], "navy");
      for (let h = 0; h < 5; h++) x(l, `Shutter_Slat_${h}`, [0.055, 0.08, 2.65], [0.53, 0.82 + h * 0.39, -0.15], "steel", 5e-3);
    }
    x(l, "Side_Window", [0.08, 0.63, 3.98], [a * 0.375, 5.1, -0.35], "cyan", 0.025);
    let c = N(e, `Hall_Outer_Rib_${a}`, [a * 5.4, 0.32, 2.8]);
    Vt(c, "Load_Pier", [[-1.08, 0], [1.08, 0], [0.7, 5.55], [0.03, 7.15], [-0.62, 7.15], [-0.48, 5.45]], 1.32, [0, 0, 0], "ivory"), x(c, "Pier_Foot", [1.88, 0.56, 1.74], [0, 0.3, 0], "navy"), x(c, "Foot_Guard", [0.55, 0.54, 1.8], [a * 0.61, 0.39, 0], "yellow");
  }
  x(e, "Closed_Center_Roof", [7.34, 0.55, 7.7], [0, 8.03, -1.04], "ivory");
  for (let a of [-1, 1]) {
    let l = x(e, "Sloped_Roof_Shoulder", [2.88, 0.57, 7.7], [a * 4.62, 7.29, -1.04], "ivory");
    l.rotation.z = -a * 0.55, bt(e, "Roof_Armor_Rib", [a * 3, 8.39, -4.66], [a * 3, 8.39, 2.84], 0.25, 0.33, "navy"), x(e, "Roof_Mechanism_Cover", [0.65, 0.3, 1.09], [a * 3, 8.62, 1.29], "yellow");
  }
  x(e, "Front_Upper_Beam", [9.73, 0.45, 0.65], [0, 6.69, 2.95], "navy"), x(e, "Hall_Header_Light", [5.06, 0.26, 0.12], [0, 6.69, 3.31], "cyan", 0.025), ch(e, "Central_Assembly_Line", [0, 0.82, -2.57], [0, 0.82, 6.11], 1.92);
  for (let a of i >= 2 ? [-3.52, 3.52] : [-3.52]) U(e, `Arm_Anchoring_Pad_${a}`, 1.22, 1.41, 0.35, [a, 0.64, 2.87], "navy", 12), x(e, "Robot_Cell_Safety_Block", [0.5, 0.54, 0.52], [a, 0.68, 4.29], "yellow");
  let s = Qn(e, "Assembly_Arm_A", [-3.52, 0.82, 2.89], 1.08, Math.PI / 2);
  if (s.userData.purpose = "\u88C5\u914D\u7EBF\u5DE6\u4FA7\u673A\u68B0\u81C2\uFF1B\u5939\u722A\u5230\u8FBE\u4E2D\u592E\u5DE5\u4EF6", sf(e, "Production_Robot", [0, 1.13, 2.84], 0.88), i >= 2) {
    let a = Qn(e, "Assembly_Arm_B", [3.52, 0.82, 2.89], 1.08, -Math.PI / 2);
    a.userData.purpose = "\u88C5\u914D\u7EBF\u53F3\u4FA7\u673A\u68B0\u81C2\uFF0C\u4E0E\u5DE6\u81C2\u5171\u7528\u4E2D\u592E\u88C5\u914D\u5DE5\u4F4D";
    let l = N(e, "Production_Control_Cabin", [0, 8.25, -0.81]);
    x(l, "Control_Room", [3.7, 1.47, 2.61], [0, 0.74, 0], "navy"), zt(l, "Control_Window", [0, 0.86, 1.35], 3.16, 0.57), x(l, "Control_Roof", [3.95, 0.26, 2.86], [0, 1.63, 0], "ivory"), Zt(l, "Production_Link", [-1.42, 1.79, -0.91], 1.07), x(l, "Status_Beacon", [0.53, 0.47, 0.53], [0.19, 1.93, -0.17], "yellow");
  }
  let o = N(n, "Raw_Material_Store", [-9, 0, -0.15]);
  o.userData.purpose = "\u5206\u7C7B\u539F\u6599\u4E0E\u90E8\u4EF6\u8F93\u5165\u5E93\uFF0C\u4FA7\u95E8\u5BF9\u5E94\u751F\u4EA7\u7EBF\u8FDB\u6599\u53E3", Ft(o, "Input_Store_Foot", 4.09, 4.29), x(o, "Store_Back", [3.47, 2.79, 0.41], [0, 1.73, -1.65], "ivory"), x(o, "Store_Left", [0.43, 2.77, 3.49], [-1.57, 1.72, -0.1], "ivory"), x(o, "Store_Roof", [3.65, 0.46, 3.67], [0, 3.13, -0.1], "ivory");
  for (let a of [-1.38, 1.22]) x(o, "Right_Side_Post", [0.32, 2.48, 0.3], [1.56, 1.72, a], "navy");
  x(o, "Input_Lintel", [2.78, 0.3, 0.45], [0, 2.74, 1.77], "yellow");
  for (let a = 0; a < 3; a++) x(o, `Component_Tote_${a}`, [0.79, 0.66, 0.85], [-0.56 + a * 0.62, 0.87, -0.9], "steel");
  if (ch(r, "Material_Infeed", [-8.6, 0.84, -0.12], [-0.13, 0.84, -0.12], 1.6), ce(o, "Store_Loading_Ramp", 2.1, 1.81, 0.32, [0, 0, 2.15]), i >= 2) {
    let a = N(n, "Equipment_Service_Module", [-8.68, 0, -5.24]);
    a.userData.purpose = "\u673A\u5668\u4EBA\u6DB2\u538B\u3001\u7535\u529B\u4E0E\u8BBE\u5907\u68C0\u4FEE", U(a, "Service_Foot", 1.65, 1.84, 0.29, [0, 0.145, 0], "navy", 8), U(a, "Service_Cabin", 1.36, 1.53, 2.57, [0, 1.6, 0], "ivory", 8), U(a, "Service_Window_Band", 1.42, 1.46, 0.47, [0, 1.94, 0], "cyan", 8), x(a, "Service_Door", [0.84, 1.57, 0.12], [0, 1.12, 1.48], "navy"), U(a, "Cooling_Lid", 1.1, 1.33, 0.26, [0, 2.99, 0], "navy", 8), Zt(a, "Service_Radio", [0, 3.14, 0], 0.94), ht(r, "Service_Distribution", [[-5.69, 1.01, -3.71], [-7.12, 1.01, -3.71], [-7.12, 1.01, -5.24], [-7.31, 1.01, -5.24]], 0.2, "navy"), ht(r, "Arm_Power_Conduit", [[-5.49, 0.66, -3.84], [-5.49, 0.66, 2.87], [-3.52, 0.66, 2.87]], 0.12, "yellow");
  }
  if (i >= 3) {
    let a = N(n, "Finished_Goods_Store", [9.23, 0, -0.21]);
    a.userData.purpose = "\u6210\u54C1\u5C01\u88C5\u51FA\u5E93\uFF0C\u4FDD\u6301\u4FA7\u5411\u8F6C\u8FD0\u53E3\u4E0E\u524D\u65B9\u88C5\u5378\u53E3", Ft(a, "Finished_Goods_Foot", 4.25, 4.37), x(a, "Store_Rear", [3.58, 3.13, 0.42], [0, 1.86, -1.73], "ivory"), x(a, "Store_Right", [0.45, 3.1, 3.39], [1.58, 1.88, -0.24], "ivory"), x(a, "Store_Roof", [3.82, 0.49, 3.89], [0, 3.58, -0.17], "ivory"), x(a, "Loading_Header", [3.42, 0.43, 0.45], [0, 2.97, 1.71], "yellow");
    for (let h of [-1.54, 1.54]) x(a, "Dock_Pier", [0.33, 2.59, 0.39], [h, 1.64, 1.73], "navy");
    zt(a, "Shipping_Status", [0, 3.61, 1.85], 2.25, 0.2), ch(r, "Finished_Product_Outfeed", [0.3, 0.84, -0.13], [9.38, 0.84, -0.13], 1.6), x(a, "Sealed_Shipping_Crate", [1.15, 0.88, 0.97], [0.63, 1.57, -0.16], "ivory"), x(a, "Crate_Latch", [0.43, 0.19, 0.07], [0.63, 1.55, 0.36], "yellow"), ce(a, "Shipping_Ramp", 2.52, 1.94, 0.33, [0, 0, 2.15]);
    let l = N(n, "Robot_Test_Bench", [6.68, 0, 7.48]);
    l.userData.purpose = "\u673A\u5668\u4EBA\u6B65\u6001\u53CA\u6267\u884C\u5668\u68C0\u6D4B\uFF0C\u5B9E\u4F53\u5939\u5177\u3001\u68C0\u9A8C\u4E3B\u673A\u4E0E\u5F85\u6D4B\u673A\u5668\u4EBA", Ft(l, "Test_Local_Platform", 5.2, 3.97, [0, 0, 0], 0.3), x(l, "Test_Restraint_Track", [2.18, 0.15, 2.25], [-0.48, 0.39, 0.09], "steel"), sf(l, "Independent_Test_Robot", [-0.47, 0.47, 0.24], 1.13), x(l, "Diagnostic_Cabinet", [1.01, 2.44, 0.89], [1.7, 1.52, -0.99], "ivory"), zt(l, "Diagnostic_Display", [1.7, 2.09, -0.51], 0.65, 0.83), Zt(l, "Test_Radio", [1.7, 2.74, -1.03], 1.01), x(l, "Test_Console", [1.25, 0.91, 0.84], [-1.68, 0.77, 1.01], "ivory"), x(l, "Test_Console_Panel", [0.92, 0.15, 0.59], [-1.68, 1.3, 1.01], "cyan");
    for (let h of [-2.28, 2.28]) for (let u of [-1.64, 1.64]) x(l, "Test_Safety_Post", [0.24, 0.52, 0.24], [h, 0.55, u], "yellow");
    let c = x(r, "Test_Walkway", [1.25, 0.2, 2.62], [3.58, 0.15, 5.58], "navy", 0.025);
    c.rotation.y = Math.atan2(1.44, 1.82), ht(r, "Test_Data_Cable", [[5.52, 0.52, 3.51], [5.52, 0.52, 5.15], [8.35, 0.52, 5.15], [8.35, 0.52, 6.44]], 0.12, "yellow");
  }
  return ye(e, "Rear_Hall_Exhaust_A", [-1.76, 8.34, -3.07], 1.54, 1.1), ye(e, "Rear_Hall_Exhaust_B", [1.76, 8.34, -3.07], 1.54, 1.1), t;
}
function by(i, t, e, n) {
  let r = new ue();
  r.setAttribute("position", new Jt(e.flat(), 3)), r.setIndex([0, 1, 2, 0, 2, 3]), r.computeVertexNormals();
  let s = new Xt(r, n);
  return s.name = t, s.castShadow = false, s.receiveShadow = false, s.renderOrder = 2, i.add(s), s;
}
function Ey(i, t, e) {
  let r = N(i, t, [Math.sin(e) * 3.02, 3.23, Math.cos(e) * 3.02]);
  r.rotation.y = e + Math.PI, U(r, "Fixture_Foot", 0.55, 0.7, 0.28, [0, 0.14, 0], "navy", 10);
  let s = N(r, "Shoulder", [0, 0.6, 0]);
  U(s, "Shoulder_Bearing", 0.35, 0.35, 0.63, [0, 0, 0], "steel", 10).rotation.z = Math.PI / 2, bt(s, "Fixture_Link", [0, 0, 0], [0, 1.26, 0.64], 0.37, 0.5, "ivory");
  let o = N(s, "Wrist", [0, 1.26, 0.64]);
  U(o, "Wrist_Bearing", 0.29, 0.29, 0.48, [0, 0, 0], "yellow", 10).rotation.z = Math.PI / 2, bt(o, "Fine_Positioning_Slide", [0, 0.03, 0], [0, 0.34, 0.38], 0.25, 0.3, "steel");
  let a = N(o, "Edge_Roller_Clamp", [0, 0.38, 0.38]);
  return x(a, "Roller_Carriage", [0.5, 0.23, 0.31], [0, -0.04, -0.04], "navy"), U(a, "Lower_Wafer_Roller", 0.12, 0.12, 0.38, [0, 0.05, 0.12], "yellow", 10).rotation.z = Math.PI / 2, U(a, "Upper_Wafer_Roller", 0.095, 0.095, 0.34, [0, 0.27, 0.12], "steel", 10).rotation.z = Math.PI / 2, x(s, "Drive_Status", [0.18, 0.51, 0.07], [0, 0.74, 0.4], "cyan", 0.01), r;
}
function uh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Nanite_Factory");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u6D01\u51C0\u5236\u9020\u7AD9", additions: ["\u5B8C\u6574\u516D\u9762\u900F\u660E\u6D01\u51C0\u8231\u4E0E\u524D\u6C14\u95F8", "\u60AC\u7F6E\u6676\u5706\u4E0E\u4E09\u7EC4\u53EF\u72EC\u7ACB\u8C03\u8282\u5939\u5177", "\u8BBE\u5907\u4FDD\u969C\u8231"] }, { level: 2, label: "\u6750\u6599\u5236\u9020\u5DE5\u5382", additions: ["\u6750\u6599\u5236\u5907\u8231", "\u4E24\u4FA7\u5BC6\u95ED\u539F\u6599\u53CA\u6210\u54C1\u76D2", "\u9876\u90E8\u5DE5\u827A\u63A7\u5236\u8BBE\u5907"] }, { level: 3, label: "\u7EB3\u7C73\u5236\u9020\u4E2D\u5FC3", additions: ["\u5C01\u88C5\u68C0\u6D4B\u8231", "\u5BC6\u95ED\u6210\u54C1\u4F20\u9001\u6BB5", "\u53CC\u8DEF\u6563\u70ED\u4E0E\u68C0\u6D4B\u4F20\u611F\u5668"] }], t.userData.design = ["\u516D\u5757\u72EC\u7ACB\u900F\u660E\u677F\u4E0E\u516D\u6839\u8FB9\u67F1\u5F62\u6210\u5BC6\u95ED\u5236\u9020\u8231\uFF0C\u9876\u90E8\u5C01\u76D6\u3001\u5E95\u90E8\u8BBE\u5907\u5EA7\u548C\u524D\u6C14\u95F8\u5B8C\u6574\u8FDE\u63A5\u3002", "\u6676\u5706\u60AC\u7F6E\u4E8E\u4E09\u7EC4\u53EF\u8C03\u5939\u5177\u7684\u8FB9\u7F18\u6EDA\u8F6E\u4E4B\u95F4\uFF1B\u5939\u5177\u548C\u6676\u5706\u5206\u522B\u53EF\u7F16\u8F91\uFF0C\u4E0D\u60AC\u7A7A\u6446\u653E\u5B9E\u4F53\u8BBE\u5907\u3002", "\u539F\u6599\u4ECE\u5DE6\u4FA7\u5236\u5907\u8231\u8FDB\u5165\u5BC6\u95ED\u6599\u76D2\uFF0C\u5B8C\u6210\u52A0\u5DE5\u540E\u7531\u53F3\u4FA7\u6599\u76D2\u9001\u5F80\u5C01\u88C5\u68C0\u6D4B\u8231\u3002"], t.userData.pivots = ["Suspended_Wafer", "Wafer_Fixture_1/Shoulder", "Wafer_Fixture_2/Shoulder", "Wafer_Fixture_3/Shoulder"], U(e, "Hexagonal_Local_Foundation", 5.15, 5.43, 0.34, [0, 0.17, 0], "navy", 6), U(e, "Process_Equipment_Floor", 4.62, 5.01, 2.3, [0, 1.49, 0], "ivory", 6), U(e, "Process_Service_Belt", 4.75, 4.92, 0.6, [0, 1.17, 0], "navy", 6), U(e, "Chamber_Lower_Flange", 4.53, 4.82, 0.53, [0, 2.91, 0], "navy", 6), U(e, "Cleanroom_Floor", 4.35, 4.47, 0.16, [0, 3.22, 0], "steel", 6), U(e, "Wafer_Base_Controller", 1.79, 2.13, 0.69, [0, 3.65, 0], "navy", 16), U(e, "Controller_Light_Belt", 1.77, 1.91, 0.17, [0, 3.9, 0], "cyan", 16);
  let s = N(e, "Independent_Transparent_Chamber"), o = Math.PI / 6;
  for (let u = 0; u < 6; u++) {
    let d = o + u * Math.PI / 3, f = o + (u + 1) * Math.PI / 3, m = [4.37 * Math.sin(d), 3.3, 4.37 * Math.cos(d)], g = [4.37 * Math.sin(f), 3.3, 4.37 * Math.cos(f)], _ = [3.28 * Math.sin(d), 8.82, 3.28 * Math.cos(d)], p = [3.28 * Math.sin(f), 8.82, 3.28 * Math.cos(f)];
    if (by(s, `Sealed_Glass_Face_${u + 1}`, [m, g, p, _], Ae.glass), bt(e, `Chamber_Edge_Frame_${u + 1}`, m, _, 0.23, 0.27, "navy"), bt(e, `Chamber_Bottom_Seal_${u + 1}`, m, g, 0.16, 0.22, "steel"), bt(e, `Chamber_Top_Seal_${u + 1}`, _, p, 0.18, 0.22, "steel"), x(e, `Frame_Anchor_${u + 1}`, [0.42, 0.4, 0.42], [m[0], 3.39, m[2]], "yellow"), u % 2 === 0) {
      let y = N(e, `External_Chamber_Stay_${u / 2 + 1}`, [4.03 * Math.sin(d), 0.34, 4.03 * Math.cos(d)]);
      y.rotation.y = d, Vt(y, "Reinforced_Stay", [[-0.46, 0], [0.46, 0], [0.32, 5.73], [-0.32, 5.73]], 0.96, [0, 0, 0], "navy"), x(y, "Stay_Armor", [0.78, 3.85, 1.08], [0, 2.29, 0], "ivory"), x(y, "Stay_Service_Light", [0.24, 1.4, 0.08], [0, 3.53, 0.58], "cyan", 0.02), x(y, "Stay_Cap", [0.77, 0.23, 1.07], [0, 5.8, 0], "yellow");
    }
  }
  U(e, "Sealed_Upper_Shoulder", 2.19, 3.44, 1.03, [0, 9.25, 0], "ivory", 6), U(e, "Ceiling_Filter_Plate", 2.26, 2.28, 0.26, [0, 9.9, 0], "navy", 6), U(e, "Filter_Housing", 0.91, 1.32, 0.54, [0, 10.17, 0], "steel", 8), x(e, "Filter_Status", [0.64, 0.25, 0.11], [0, 10.16, 1.02], "cyan");
  let a = N(e, "Suspended_Wafer", [0, 5.61, 0]);
  U(a, "Wafer_Substrate", 2.02, 2.02, 0.13, [0, 0, 0], "yellow", 40);
  for (let u = -5; u <= 5; u++) {
    let d = u * 0.31, f = 2 * Math.sqrt(1.94 * 1.94 - d * d);
    x(a, `Circuit_Grid_X_${u}`, [f, 0.019, 0.021], [0, 0.078, d], "amber", 1e-3), x(a, `Circuit_Grid_Z_${u}`, [0.021, 0.019, f], [d, 0.08, 0], "amber", 1e-3);
  }
  we(a, { type: "spin", axis: "y", speed: 0.055 });
  for (let u = 0; u < 3; u++) Ey(e, `Wafer_Fixture_${u + 1}`, Math.PI / 3 + u * Math.PI * 2 / 3);
  let l = N(e, "Front_Cleanroom_Airlock", [0, 0.34, 4.58]);
  Vt(l, "Double_Seal_Airlock", [[-1.91, 0], [1.91, 0], [1.55, 3.45], [-1.55, 3.45]], 2.7, [0, 0, 0], "ivory"), fe(l, "Cleanroom_Entrance", [0, 0.06, 1.37], 1.64, 2.5), zt(l, "Airlock_Status", [0, 3.08, 1.41], 1.83, 0.28), ce(e, "Airlock_Ramp", 2.61, 2.94, 0.4, [0, 0, 5.97]);
  for (let u of [-1.23, 1.23]) bt(e, "Airlock_Ramp_Edge", [u, 0.46, 5.99], [u, 0.085, 8.87], 0.095, 0.14, "yellow");
  let c = N(n, "Equipment_Support_Module", [7.04, 0, -3.88]);
  c.userData.purpose = "\u6D01\u51C0\u7A7A\u6C14\u8FC7\u6EE4\u3001\u7535\u529B\u8C03\u8282\u548C\u5DE5\u827A\u51B7\u5374", se(c, "Process_Utility_Cabin", [0, 0, 0], 3.5, 3.62, 3.31, "utility");
  let h = i >= 3 ? 3 : 1;
  for (let u = 0; u < h; u++) {
    let d = (u - (h - 1) / 2) * 0.99;
    x(c, `Cooling_Stack_${u + 1}`, [0.57, 2.56, 1.02], [d, 4.94, -0.18], "navy"), x(c, "Cooling_Stack_Header", [0.6, 0.24, 1.06], [d, 6.29, -0.18], "yellow"), x(c, "Cooling_Core", [0.16, 1.83, 0.055], [d, 5.07, 0.358], "cyan", 0.01);
  }
  if (ht(r, "Clean_Air_Supply", [[3.91, 1.64, -1.97], [4.83, 1.64, -1.97], [4.83, 1.64, -3.87], [5.32, 1.64, -3.87]], 0.23, "navy"), ht(r, "Clean_Air_Return", [[3.91, 0.78, -2.53], [4.49, 0.78, -2.53], [4.49, 0.78, -4.57], [5.32, 0.78, -4.57]], 0.14, "yellow"), i >= 2) {
    let u = N(n, "Material_Preparation_Module", [-7.55, 0, -0.46]);
    u.userData.purpose = "\u6D01\u51C0\u539F\u6599\u7684\u6DF7\u5408\u3001\u8FC7\u6EE4\u4E0E\u5BC6\u95ED\u6682\u5B58", U(u, "Preparation_Foot", 1.94, 2.18, 0.3, [0, 0.15, 0], "navy", 8), je(u, "Process_Vessel", [0, 0.3, 0], 1.51, 3.86), zt(u, "Vessel_Process_Window", [0, 2.28, 1.47], 0.66, 1.71), U(u, "Mixer_Drive", 0.53, 0.72, 0.47, [0, 4.57, 0], "navy", 8), x(u, "Mixer_Cap", [0.55, 0.23, 0.55], [0, 4.91, 0], "yellow"), ht(r, "Material_Delivery", [[-3.96, 1.23, 0.32], [-5.48, 1.23, 0.32], [-5.48, 1.23, -0.46], [-6.14, 1.23, -0.46]], 0.24, "navy");
    for (let d of [-1, 1]) {
      let f = N(e, d < 0 ? "Sealed_Raw_Material_Box" : "Sealed_Finished_Wafer_Box", [d * 4.65, 0, 2.36]);
      Ft(f, "Cassette_Local_Foot", 2.3, 2.66), x(f, "Hermetic_Cassette_Housing", [1.94, 2.33, 2.14], [0, 1.47, 0], "ivory"), zt(f, "Cassette_Panel", [0, 1.54, 1.12], 0.97, 0.66), x(f, "Cassette_Latch", [0.61, 0.56, 0.15], [0, 0.59, 1.15], "yellow"), ge(r, `Cassette_Sleeve_${d}`, [d * 3.61, 1.31, 2.29], [d * 4.23, 1.31, 2.29], 0.91);
    }
    Zt(e, "Process_Condition_Probe", [0.86, 10.25, -0.29], 1.17), x(e, "Top_Control_Unit", [0.74, 0.51, 0.69], [-0.64, 10.4, 0.23], "ivory");
  }
  if (i >= 3) {
    let u = N(n, "Packaging_Inspection_Module", [8.03, 0, 4.46]);
    u.userData.purpose = "\u6676\u5706\u5C01\u88C5\u4E0E\u65E0\u635F\u68C0\u9A8C\uFF0C\u524D\u53E3\u8FDB\u884C\u5BC6\u95ED\u76D2\u88C5\u5378", Ft(u, "Inspection_Foot", 4.27, 4.7), x(u, "Inspection_Rear", [3.75, 2.82, 1.46], [0, 1.74, -0.97], "ivory");
    for (let d of [-1.64, 1.64]) x(u, "Loading_Pier", [0.46, 2.71, 2.17], [d, 1.71, 0.71], "ivory");
    x(u, "Inspection_Roof", [4.04, 0.44, 4.17], [0, 3.25, 0.13], "ivory"), zt(u, "Inspection_Header", [0, 3.2, 2.25], 2.4, 0.27), x(u, "Sealed_Box_Conveyor", [1.81, 0.47, 2.96], [0, 0.57, 1.09], "navy"), x(u, "Inspected_Cassette", [1.11, 0.62, 0.89], [0, 1.12, 1.48], "ivory"), x(u, "Cassette_Status_Marker", [0.49, 0.14, 0.06], [0, 1.23, 1.958], "yellow"), ye(u, "Inspection_Air_Filter", [0, 3.49, -0.38], 1.6, 1.2), ge(r, "Finished_Cassette_Transfer", [5.58, 1.31, 2.7], [6.22, 1.31, 3.75], 1.05), ht(r, "Auxiliary_Cooling_Loop", [[3.42, 2.3, -2.31], [4.35, 2.3, -2.31], [4.35, 2.3, -4.31], [5.35, 2.3, -4.31]], 0.12, "cyan");
    for (let d of [-Math.PI / 3, Math.PI / 3]) {
      let f = N(e, "Optical_Wafer_Inspection_Head", [Math.sin(d) * 2.43, 8.64, Math.cos(d) * 2.43]);
      bt(f, "Scanner_Bracket", [0, 0, 0], [0, -0.48, 0], 0.18, 0.22, "navy"), U(f, "Scanner_Head", 0.36, 0.36, 0.26, [0, -0.62, 0], "steel", 8), U(f, "Scanner_Lens", 0.24, 0.24, 0.04, [0, -0.77, 0], "cyan", 8);
    }
  }
  return e.traverse((u) => {
    u.isMesh && u.geometry.parameters?.radialSegments === 6 && (u.rotation.y += Math.PI / 6);
  }), t;
}
function wy(i) {
  let r = [new lt(0, -0.24)];
  for (let M = 1; M <= 10; M++) {
    let v = 5.24 * M / 10;
    r.push(new lt(v, v * v / (4 * 4.46) - 0.24));
  }
  r.push(new lt(5.24, 5.24 * 5.24 / (4 * 4.46)));
  for (let M = 9; M >= 0; M--) {
    let v = 5.24 * M / 10;
    r.push(new lt(v, v * v / (4 * 4.46)));
  }
  let s = new Xt(new Tn(r, 48), Ae.navy);
  s.name = "Closed_Parabolic_Reflector_Shell", s.rotation.x = Math.PI / 2, s.castShadow = true, s.receiveShadow = true, i.add(s);
  let o = [];
  for (let M = 10; M >= 0; M--) {
    let v = 5.24 * M / 10;
    o.push(new lt(v, v * v / (4 * 4.46) + 0.017));
  }
  let a = new Xt(new Tn(o, 48), Ae.ivory);
  a.name = "Concave_Reflective_Surface", a.rotation.x = Math.PI / 2, a.castShadow = true, a.receiveShadow = true, i.add(a);
  let l = 5.24 * 5.24 / (4 * 4.46);
  Re(i, "Reflector_Rim", 5.24, 0.115, [0, 0, l - 0.01], "ivory", 6, 48);
  let c = [], h = [];
  for (let M = 0; M < 12; M++) {
    let v = M * Math.PI / 6, w = c.length / 3;
    for (let b = 0; b <= 6; b++) {
      let A = 0.64 + 4.5200000000000005 * b / 6;
      for (let C of [-1, 1]) c.push(A * Math.cos(v) - C * 0.016 * Math.sin(v), A * Math.sin(v) + C * 0.016 * Math.cos(v), A * A / (4 * 4.46) + 0.034);
      if (b < 6) {
        let C = w + b * 2;
        h.push(C, C + 2, C + 1, C + 1, C + 2, C + 3);
      }
    }
  }
  let u = new ue();
  u.setAttribute("position", new Jt(c, 3)), u.setIndex(h), u.computeVertexNormals();
  let d = new Xt(u, Ae.steel);
  d.name = "Reflector_Radial_Panel_Joints", i.add(d);
  let f = 2.82;
  Re(i, "Reflector_Assembly_Seam", f, 0.012, [0, 0, f * f / (4 * 4.46) + 0.035], "steel", 4, 48);
  for (let M = 0; M < 8; M++) {
    let v = M * Math.PI / 4, w = x(i, `Rim_Mount_${M + 1}`, [0.34, 0.63, 0.46], [5.24 * Math.cos(v), 5.24 * Math.sin(v), l - 0.12], "yellow", 0.045);
    w.rotation.z = v - Math.PI / 2;
    let b = [];
    for (let A = 0; A <= 5; A++) {
      let C = 0.55 + 4.5200000000000005 * A / 5;
      b.push([C * Math.cos(v), C * Math.sin(v), C * C / (4 * 4.46) - 0.31]);
    }
    ht(i, `Rear_Reflector_Rib_${M + 1}`, b, 0.125, "steel");
  }
  let m = 4.46;
  for (let M = 0; M < 3; M++) {
    let v = Math.PI / 2 + M * Math.PI * 2 / 3, w = 5.24 * 0.9;
    bt(i, `Feed_Tripod_Strut_${M + 1}`, [w * Math.cos(v), w * Math.sin(v), w * w / (4 * 4.46) + 0.12], [0, 0, m], 0.14, 0.14, "navy");
  }
  let g = N(i, "Focal_Feed_Assembly", [0, 0, m]), _ = U(g, "Feed_Horn", 0.32, 0.57, 0.67, [0, 0, -0.14], "navy", 12);
  _.rotation.x = Math.PI / 2;
  let p = U(g, "Receiver_Cap", 0.42, 0.42, 0.26, [0, 0, 0.29], "yellow", 12);
  p.rotation.x = Math.PI / 2;
  let y = U(g, "Feed_Aperture", 0.49, 0.49, 0.045, [0, 0, -0.489], "steel", 12);
  return y.rotation.x = Math.PI / 2, i;
}
function dh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Radar_Facility");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u533A\u57DF\u96F7\u8FBE\u7AD9", additions: ["\u5B8C\u6574\u51F9\u9762\u4E3B\u96F7\u8FBE\u3001\u9988\u6E90\u53CA\u53CC\u8F74\u652F\u67B6", "\u6954\u5F62\u6570\u636E\u8231", "\u8BBE\u5907\u7EF4\u4FEE\u8231"] }, { level: 2, label: "\u533A\u57DF\u76D1\u6D4B\u4E2D\u5FC3", additions: ["\u72EC\u7ACB\u6570\u636E\u5904\u7406\u8231", "\u6570\u636E\u4E0E\u51B7\u5374\u8FDE\u63A5", "\u4F3A\u670D\u7CFB\u7EDF\u8BBE\u5907\u67DC"] }, { level: 3, label: "\u7EFC\u5408\u96F7\u8FBE\u4E2D\u5FC3", additions: ["\u72EC\u7ACB\u6821\u51C6\u5929\u7EBF\u53F0", "\u5907\u7528\u4FE1\u53F7\u94FE\u8DEF", "\u5C4B\u9876\u6D4B\u91CF\u5929\u7EBF"] }], t.userData.design = ["\u4E3B\u789F\u4F7F\u7528\u6709\u539A\u5EA6\u7684\u629B\u7269\u9762\u53CD\u5C04\u5668\uFF0C\u4E09\u6839\u7EC6\u9988\u6E90\u652F\u67B6\u6C47\u805A\u5230\u7126\u70B9\uFF0C\u80CC\u9762\u5F84\u5411\u808B\u627F\u62C5\u8F7D\u8377\u3002", "\u5782\u76F4\u65B9\u4F4D\u8F74\u627F\u8FDE\u63A5\u5730\u57FA\uFF0C\u53CC\u8033\u53C9\u67B6\u652F\u6491\u6C34\u5E73\u4FEF\u4EF0\u8F74\uFF1B\u789F\u9762\u548C\u9988\u6E90\u968F\u4FEF\u4EF0\u8F74\u6574\u4F53\u8FD0\u52A8\u3002", "\u6954\u5F62\u6570\u636E\u8231\u4F4D\u4E8E\u57FA\u5EA7\u524D\u65B9\uFF1B\u7EF4\u62A4\u3001\u6570\u636E\u548C\u6821\u51C6\u6A21\u5757\u6309\u7528\u9014\u72EC\u7ACB\u5E03\u7F6E\uFF0C\u4E3B\u95E8\u4FDD\u6301\u901A\u7545\u3002"], t.userData.pivots = ["Main_Radar_Azimuth", "Main_Radar_Elevation", "Calibration_Dish_Azimuth", "Calibration_Dish_Elevation"], Ft(e, "Radar_Local_Foundation", 9.67, 9.39, [0, 0, 0.35], 0.31);
  let s = N(e, "Wedge_Data_Cabin", [0, 0.31, 3.14]);
  Vt(s, "Armored_Wedge_Shell", [[-4.65, 0], [4.65, 0], [3.69, 3.39], [-3.69, 3.39]], 3.39, [0, 0, 0], "ivory", 0.11), zt(s, "Main_Data_Window", [0, 2.55, 1.76], 6.39, 0.65);
  for (let u of [-3.84, 3.84]) Vt(s, "Wedge_Front_Reinforcement", [[-0.47, 0], [0.47, 0], [0.26, 2.68], [-0.26, 2.68]], 0.39, [u, 0.11, 1.8], "navy"), x(s, "Wedge_Foot_Marker", [0.49, 0.45, 0.5], [u, 0.36, 2.02], "yellow");
  fe(s, "Data_Cabin_Entrance", [0, 0.08, 1.76], 1.36, 1.74), ce(e, "Radar_Entry_Ramp", 2.04, 2.56, 0.43, [0, 0, 4.95]);
  for (let u of [-0.96, 0.96]) bt(e, "Radar_Ramp_Edge", [u, 0.45, 4.98], [u, 0.065, 7.48], 0.09, 0.13, "yellow");
  let o = N(e, "Radar_Support_Pedestal", [0, 0.31, -0.68]);
  U(o, "Turntable_Foundation", 2.95, 3.31, 0.45, [0, 0.225, 0], "navy", 12), Vt(o, "Azimuth_Pedestal", [[-2.5, 0.45], [2.5, 0.45], [1.5, 3.27], [-1.5, 3.27]], 3.89, [0, 0, 0], "ivory");
  for (let u of [-1.53, 1.53]) x(o, "Servo_Service_Cover", [0.61, 1.45, 0.17], [u, 1.54, 2.04], "navy");
  U(o, "Fixed_Azimuth_Bearing", 1.62, 1.91, 0.35, [0, 3.33, 0], "steel", 20);
  let a = N(e, "Main_Radar_Azimuth", [0, 3.81, -0.68]);
  U(a, "Azimuth_Rotating_Race", 1.61, 1.72, 0.42, [0, 0.08, 0], "navy", 20), x(a, "Yoke_Crossbeam", [6.24, 0.66, 2.28], [0, 0.5, -0.04], "steel");
  for (let u of [-2.79, 2.79]) {
    let d = N(a, `Elevation_Yoke_${u < 0 ? "Left" : "Right"}`, [u, 0.41, -0.06]);
    Vt(d, "Yoke_Web", [[-0.51, 0], [0.51, 0], [0.46, 4.16], [-0.46, 4.16]], 1.57, [0, 0, 0], "ivory"), x(d, "Yoke_Structural_Core", [0.65, 3.19, 1.66], [0, 1.8, -0.04], "navy"), U(d, "Elevation_Axis_Bearing", 0.63, 0.63, 1.18, [0, 3.94, 0.06], "steel", 16).rotation.z = Math.PI / 2, U(d, "Bearing_Outer_Cap", 0.43, 0.43, 0.16, [Math.sign(u) * 0.7, 3.94, 0.06], "yellow", 12).rotation.z = Math.PI / 2;
  }
  let l = N(a, "Main_Radar_Elevation", [0, 4.35, 0]);
  l.rotation.x = -0.47, x(l, "Dish_Rear_Crossmember", [5.96, 0.7, 0.59], [0, 0, -0.04], "navy"), U(l, "Dish_Rear_Hub", 1.03, 1.25, 0.7, [0, 0, 0.29], "steel", 16).rotation.x = Math.PI / 2;
  let c = N(l, "Main_Parabolic_Dish", [0, 0, 0.78]);
  wy(c), we(a, { type: "swing", axis: "y", speed: 0.1, range: 0.17 }), we(l, { type: "swing", axis: "x", speed: 0.08, range: 0.045, phase: 0.7 }), ht(e, "Radar_Data_Trunk", [[1.92, 0.64, -0.69], [2.67, 0.64, -0.69], [2.67, 0.64, 2.07]], 0.19, "yellow");
  let h = N(n, "Equipment_Maintenance_Cabin", [-8.16, 0, -2.88]);
  if (h.userData.purpose = "\u96F7\u8FBE\u9A71\u52A8\u5668\u548C\u7535\u5B50\u6A21\u5757\u7EF4\u62A4", se(h, "Repair_Workshop", [0, 0, 0], 4.15, 3.71, 2.78, "cargo"), ye(h, "Workshop_Exhaust", [-0.45, 3.15, -0.42], 2.19, 1.33), ge(r, "Maintenance_Corridor", [-2.48, 1.1, -0.86], [-6.22, 1.1, -2.41], 1.23), i >= 2) {
    let u = N(n, "Independent_Data_Cabin", [-8.02, 0, 3.38]);
    u.userData.purpose = "\u72EC\u7ACB\u4FE1\u53F7\u5904\u7406\u4E0E\u6570\u636E\u5B58\u50A8", se(u, "Data_Processing_Room", [0, 0, 0], 4.2, 3.15, 2.21, "control"), x(u, "Roof_Data_Link", [1.65, 0.48, 1.1], [0, 2.81, -0.2], "ivory"), zt(u, "Data_Link_Status", [0, 2.83, 0.41], 1.15, 0.17), ge(r, "Data_Cabin_Corridor", [-4.09, 1.09, 2.69], [-6.06, 1.09, 3.31], 1.3), ht(r, "Dedicated_Cooling_Line", [[-3.41, 0.6, 3.53], [-5.22, 0.6, 3.53], [-5.22, 0.6, 4.28], [-6.07, 0.6, 4.28]], 0.14, "cyan");
    for (let d of [-1.29, 1.29]) x(o, "Servo_Power_Cabinet", [0.95, 1.08, 0.86], [d, 0.99, -2.11], "navy");
  }
  if (i >= 3) {
    let u = N(n, "Calibration_Antenna_Station", [7.34, 0, -2.86]);
    u.userData.purpose = "\u72EC\u7ACB\u5C0F\u5929\u7EBF\u6821\u9A8C\u4E3B\u9635\u5217\u4FE1\u53F7\u4E0E\u6307\u5411", U(u, "Calibration_Foot", 1.86, 2.03, 0.3, [0, 0.15, 0], "navy", 8), U(u, "Calibration_Equipment", 1.46, 1.71, 1.64, [0, 1.12, 0], "ivory", 8);
    for (let f = 0; f < 4; f++) {
      let m = f * Math.PI / 2;
      zt(u, `Calibration_Status_${f}`, [Math.sin(m) * 1.53, 1.28, Math.cos(m) * 1.53], 0.79, 0.47, m);
    }
    let d = qr(u, "Calibration_Dish", [0, 2.14, 0], 1.33);
    d.rotation.y = -0.46, Zt(u, "Calibration_Reference_Mast", [-1.21, 1.99, -0.73], 1.95), ht(r, "Calibration_Signal_Line", [[2.45, 0.77, -0.97], [4.39, 0.77, -0.97], [4.39, 0.77, -2.83], [5.8, 0.77, -2.83]], 0.2, "navy"), Zt(s, "Monitoring_Mast", [3.26, 3.47, -0.64], 1.55), Zt(h, "Backup_Radio", [-1.59, 3.16, -0.95], 1.7), x(s, "Backup_Link_Receiver", [1.29, 0.57, 1.07], [-2.74, 3.6, -0.38], "steel");
  }
  return t;
}
function of(i, t, e = 0.4, n = 3.1) {
  let r = [[-i, e], [-i, n]];
  for (let s = 0; s <= 12; s++) {
    let o = Math.PI - Math.PI * s / 12;
    r.push([i * Math.cos(o), n + i * 0.78 * Math.sin(o)]);
  }
  r.push([i, e], [t, e], [t, n]);
  for (let s = 0; s <= 12; s++) {
    let o = Math.PI * s / 12;
    r.push([t * Math.cos(o), n + t * 0.78 * Math.sin(o)]);
  }
  return r.push([-t, e]), r;
}
function fh(i, t, e, n = 2.6, r = 1.9, s = 3.2) {
  let o = N(i, t, e);
  o.userData.purpose = "\u5E26\u89D2\u4EF6\u3001\u5C01\u95ED\u7BB1\u95E8\u548C\u540A\u88C5\u63A5\u53E3\u7684\u6807\u51C6\u8D27\u7BB1", x(o, "SealedContainer", [n, r, s], [0, r / 2, 0], "blue", 0.08);
  for (let a of [-1, 1]) for (let l of [-1, 1]) x(o, "CornerLock_" + a + "_" + l, [0.23, r + 0.1, 0.23], [a * (n / 2 - 0.08), r / 2, l * (s / 2 - 0.07)], "yellow");
  for (let a of [-1, 1]) x(o, "Door_" + a, [n - 0.4, r - 0.35, 0.08], [0, r / 2, a * (s / 2 + 0.03)], "steel"), x(o, "DoorSeam_" + a, [0.04, r - 0.4, 0.09], [0, r / 2, a * (s / 2 + 0.08)], "navy", 0);
  for (let a of [-1, 1]) for (let l = -1; l <= 1; l++) x(o, "ReinforcingRib_" + a + "_" + l, [0.06, r - 0.3, 0.09], [a * (n / 2 + 0.015), r / 2, l * s * 0.28], "navy", 0);
  return o;
}
function Ty(i) {
  let t = N(i, "Dispatch_Tower", [-8, 0, -0.1]);
  return t.userData.label = "\u88C5\u5378\u8C03\u5EA6\u5854", t.userData.purpose = "\u89C2\u5BDF\u8D27\u4ED3\u5165\u53E3\u5E76\u8C03\u5EA6\u540A\u8F66\uFF0C\u72EC\u7ACB\u5BC6\u95ED\u503C\u73ED\u8231", Ft(t, "TowerFoot", 3.8, 3.8), U(t, "AccessShaft", 1.05, 1.48, 2.8, [0, 1.68, 0], "ivory", 8), U(t, "CabinBelt", 1.72, 1.5, 0.7, [0, 3.18, 0], "navy", 8), U(t, "CabinRoof", 1.5, 1.8, 0.45, [0, 3.75, 0], "ivory", 8), zt(t, "DispatchFront", [0, 3.22, 1.61], 2.25, 0.39), zt(t, "DispatchSide", [1.61, 3.22, 0], 2.25, 0.39, Math.PI / 2), fe(t, "TowerEntry", [0, 0.3, 1.33], 0.93, 1.65), Zt(t, "TrafficAntenna", [0, 4, -0.25], 1.5), t;
}
function ph(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("Alliance_Depot");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u8FD0\u8425\u4ED3\u5E93", additions: ["\u5B8C\u6574\u62F1\u5F62\u8D27\u4ED3\u4E0E\u53EF\u5377\u8D77\u4ED3\u95E8", "\u53EF\u7528\u95E8\u5F0F\u540A\u673A\u548C\u8C03\u5EA6\u5854", "\u72EC\u7ACB\u7535\u6E90\u8231"] }, { level: 2, label: "\u6269\u5C55\u8D27\u8FD0", additions: ["\u5916\u7F6E\u53CC\u8D27\u7BB1\u5806\u653E\u4F4D", "\u8FDE\u7EED\u88C5\u5378\u8FDE\u63A5\u901A\u9053", "\u4ED3\u9876\u901A\u98CE\u673A\u7EC4"] }, { level: 3, label: "\u8054\u76DF\u67A2\u7EBD", additions: ["\u5E26\u68C0\u4FEE\u53F0\u7684\u7EF4\u4FEE\u68DA", "\u7535\u52A8\u7275\u5F15\u8F66", "\u53CC\u8DEF\u4F9B\u7535\u53CA\u4ED3\u5185\u914D\u7535\u67DC"] }], t.userData.design = ["\u8D27\u4ED3\u5177\u6709\u5B8C\u6574\u4FA7\u58C1\u3001\u62F1\u9876\u4E0E\u5C01\u95ED\u540E\u5899\uFF0C\u6B63\u9762\u4FDD\u7559\u540A\u8FD0\u51C0\u7A7A\u3002", "\u53EA\u6709\u4E00\u5EA7\u95E8\u5F0F\u540A\u673A\uFF1B\u6A2A\u5411\u6ED1\u8F66\u3001\u5377\u626C\u7EF3\u3001\u540A\u5177\u3001\u88AB\u540A\u8D27\u7BB1\u5404\u81EA\u5206\u7EC4\u3002", "\u65B0\u589E\u8D27\u7BB1\u4F4D\u4E0E\u7EF4\u4FEE\u68DA\u653E\u5728\u524D\u65B9\u4E24\u4FA7\uFF0C\u4E2D\u592E\u88C5\u5378\u901A\u8DEF\u4FDD\u6301\u5F00\u653E\u3002"], t.userData.pivots = ["Gantry_Crane", "Trolley", "Hoist_Spreader", "Warehouse_Shutter"];
  let s = N(e, "Arched_Warehouse");
  s.userData.purpose = "\u5E72\u71E5\u8D27\u7269\u5B58\u50A8\u53CA\u63A5\u5378\u4E3B\u5E93", Ft(s, "WarehouseFoot", 11.4, 9.4, [0, 0, -1]), x(s, "LoadBearingFloor", [10.7, 0.25, 8.8], [0, 0.4, -1], "steel"), Vt(s, "VaultShell", of(5.4, 4.79), 8.6, [0, 0, -1], "ivory", 0.045);
  let o = [[-5.36, 0.4], [5.36, 0.4], [5.36, 3.1]];
  for (let f = 0; f <= 12; f++) {
    let m = Math.PI * f / 12;
    o.push([5.36 * Math.cos(m), 3.1 + 5.36 * 0.78 * Math.sin(m)]);
  }
  Vt(s, "ClosedRearWall", o, 0.4, [0, 0, -5.25], "navy", 0.035);
  for (let f of [-5.16, -0.9, 3.18]) Vt(s, "StructuralArch_" + f, of(5.57, 5.35), 0.31, [0, 0, f], "navy", 0.02);
  for (let f of [-1, 1]) x(s, "WallPlinth_" + f, [0.48, 0.72, 8.7], [f * 5.35, 0.73, -1], "navy"), x(s, "FrontBumper_" + f, [0.42, 0.78, 0.65], [f * 5.31, 0.86, 3.3], "yellow"), zt(s, "SideStatusWindows_" + f, [f * 5.46, 2.85, -1.8], 3.3, 0.38, f * Math.PI / 2);
  x(s, "RoofRidge", [1.4, 0.28, 8.6], [0, 7.39, -1], "navy");
  for (let f = -4; f <= 2; f += 1.5) x(s, "RoofLight_" + f, [0.88, 0.09, 1], [0, 7.58, f], "cyan");
  let a = N(s, "Warehouse_Shutter", [0, 4.42, 3.2]);
  a.userData.purpose = "\u5377\u5E18\u95E8\u5904\u4E8E\u6536\u7EB3\u5F00\u542F\u4F4D\u7F6E\uFF0C\u53EF\u72EC\u7ACB\u63A7\u5236\u5F00\u95ED";
  for (let f = 0; f < 4; f++) x(a, "StoredDoorSlat_" + f, [8.2, 0.16, 0.23], [0, f * 0.15, 0], f % 2 ? "steel" : "navy", 0.025);
  for (let f of [-1, 1]) x(s, "DoorGuide_" + f, [0.19, 4.12, 0.23], [f * 4.17, 2.56, 3.29], "steel");
  x(s, "RearPowerCabinet", [1.5, 2.35, 0.6], [3.7, 1.69, -4.7], "ivory"), x(s, "RearPowerStatus", [0.7, 0.25, 0.06], [3.7, 2.05, -4.36], "cyan");
  let l = N(e, "Gantry_Crane", [0, 0, 4.45]);
  l.userData.purpose = "\u8DE8\u8D8A\u88C5\u5378\u901A\u8DEF\u7684\u4E00\u5EA7\u95E8\u5F0F\u540A\u8F66";
  for (let f of [-1, 1]) Ft(e, "CraneRailFoot_" + f, 1.2, 3.2, [f * 4.35, 0, 4.4], 0.18), x(e, "CraneRail_" + f, [0.17, 0.13, 3], [f * 4.35, 0.26, 4.4], "steel", 0.015), x(l, "CraneWheelTruck_" + f, [0.78, 0.35, 1.5], [f * 4.35, 0.47, 0], "navy"), x(l, "PortalLeg_" + f, [0.6, 5.1, 0.67], [f * 4.35, 3.15, 0], "yellow"), bt(l, "CornerBrace_" + f, [f * 4.35, 4.7, 0], [f * 3.4, 5.7, 0], 0.26, 0.35, "yellow");
  x(l, "GantryGirder", [9.35, 0.65, 0.8], [0, 5.93, 0], "yellow"), x(l, "TrolleyRail", [8.2, 0.15, 0.24], [0, 5.47, 0.14], "steel");
  let c = N(l, "Trolley", [-0.45, 5.13, 0.1]);
  x(c, "DrivenCarriage", [1.15, 0.5, 0.95], [0, 0, 0], "navy");
  let h = U(c, "WinchDrum", 0.26, 0.26, 0.82, [0, -0.3, 0], "steel");
  h.rotation.z = Math.PI / 2;
  let u = N(c, "Hoist_Spreader", [0, -2.25, 0]);
  for (let f of [-1, 1]) ht(c, "HoistRope_" + f, [[f * 0.35, -0.34, 0], [f * 0.35, -2.25, 0]], 0.035, "dark");
  x(u, "SpreaderBeam", [2.48, 0.25, 2.95], [0, 0, 0], "yellow");
  for (let f of [-1, 1]) for (let m of [-1, 1]) x(u, "TwistLock_" + f + "_" + m, [0.19, 0.32, 0.19], [f * 1.1, -0.14, m * 1.3], "steel");
  fh(u, "Suspended_Cargo", [0, -2.1, 0], 2.45, 1.9, 2.9), we(c, { type: "slide", axis: "x", range: 0.65, speed: 0.32 }), Ty(n), ge(r, "DispatchAccess", [-6.45, 1.3, -1], [-5.27, 1.3, -1], 1.05);
  let d = se(n, "Energy_Supply", [7.7, 0, -0.85], 3.3, 3, 2.55, "utility");
  if (d.userData.purpose = "\u4ED3\u5E93\u7167\u660E\u4E0E\u540A\u8F66\u9A71\u52A8\u4F9B\u7535", ht(r, "PrimaryPowerTrunk", [[6.06, 1, -1.4], [5.35, 1, -1.4]], 0.17, "navy"), i >= 2) {
    let f = N(n, "Cargo_Stacking_Area", [-6.8, 0, 6.5]);
    f.userData.label = "\u5916\u7F6E\u8D27\u7BB1\u5806\u653E\u4F4D", f.userData.purpose = "\u4E24\u4E2A\u6807\u51C6\u8D27\u7BB1\u6682\u5B58\u4F4D\uFF0C\u5185\u4FA7\u7559\u51FA\u53D6\u8D27\u901A\u9053", Ft(f, "CargoStand", 5.8, 4.1), fh(f, "Cargo_Container_A", [-1.42, 0.29, 0], 2.45, 2.25, 3.2), fh(f, "Cargo_Container_B", [1.42, 0.29, 0], 2.35, 1.7, 3.2), x(r, "CargoApron", [2.3, 0.11, 1.5], [-4.2, 0.15, 5.8], "steel", 0.015), ye(s, "RoofExhaust_A", [-1.8, 7.08, -3.4], 1.35, 1.2), ye(s, "RoofExhaust_B", [1.8, 7.08, -3.4], 1.35, 1.2);
  }
  if (i >= 3) {
    let f = N(n, "Maintenance_Shelter", [5.3, 0, 8.6]);
    f.userData.label = "\u7275\u5F15\u8F66\u7EF4\u4FEE\u68DA", f.userData.purpose = "\u8F66\u8F86\u5145\u7535\u3001\u8F6E\u7EC4\u7EF4\u4FEE\u548C\u5907\u4EF6\u5B58\u653E", Ft(f, "WorkshopFoot", 4.4, 3.7), x(f, "RearToolWall", [4, 2.6, 0.3], [0, 1.6, -1.6], "navy");
    for (let g of [-1, 1]) x(f, "CanopyPillar_" + g, [0.25, 2.5, 0.3], [g * 1.8, 1.55, 1.3], "steel");
    Vt(f, "WeatherRoof", [[-2.3, 0], [2.3, 0], [2, 0.5], [-2, 0.5]], 3.9, [0, 2.8, -0.05], "ivory"), x(f, "ServiceBench", [2.3, 0.65, 0.62], [0, 0.91, -1.1], "yellow");
    let m = N(f, "Electric_Cargo_Tug", [0, 0.35, 0.4]);
    x(m, "Chassis", [1.6, 0.55, 2.1], [0, 0.48, 0], "yellow"), x(m, "DriverCab", [1.25, 0.8, 0.95], [0, 1.13, -0.35], "ivory"), zt(m, "Windshield", [0, 1.25, 0.15], 0.94, 0.33);
    for (let g of [-1, 1]) for (let _ of [-1, 1]) {
      let p = U(m, "Wheel_" + g + "_" + _, 0.33, 0.33, 0.27, [g * 0.8, 0.34, _ * 0.65], "rubber");
      p.rotation.z = Math.PI / 2;
    }
    x(d, "WorkshopPowerOutlet", [0.22, 0.55, 0.65], [1.7, 0.85, 0.35], "steel"), ht(r, "WorkshopPower", [[9.43, 0.85, -0.5], [9.7, 0.85, -0.5], [9.7, 0.85, 6.95], [7.3, 0.85, 6.95]], 0.13, "navy");
    for (let g of [2.4, 5.3]) x(r, "PowerTrunkSaddle_" + g, [0.4, 0.72, 0.35], [9.7, 0.36, g], "steel");
    x(d, "BackupConverter", [1.85, 0.65, 1.75], [0, 2.85, 0], "navy"), x(d, "BackupStatus", [1.1, 0.16, 0.04], [0, 2.9, 0.9], "cyan");
  }
  return t;
}
function Ay(i, t, e, n = false) {
  let r = N(i, t);
  r.rotation.y = e, r.userData.purpose = "\u8F68\u9053\u6CCA\u4F4D\u670D\u52A1\u901A\u9053\u3001\u5BFC\u5411\u5939\u5177\u548C\u8D27\u7269\u88C5\u5378\u63A5\u53E3", x(r, "DockServiceSpine", [1.55, 0.9, 4.1], [0, 0, 4.5], "navy"), x(r, "DockTopArmor", [1.35, 0.24, 4.15], [0, 0.56, 4.5], "ivory");
  for (let s of [-1, 1]) x(r, "DockPowerStrip_" + s, [0.045, 0.18, 3.3], [s * 0.79, 0.02, 4.4], "cyan", 0.01);
  x(r, "BerthClampCrosshead", [3.8, 0.55, 1.4], [0, 0.02, 7.05], "steel");
  for (let s of [-1, 1]) {
    let o = N(r, "DockingClamp_" + s, [s * 1.54, 0.14, 7.08]);
    x(o, "ClampArm", [0.42, 2.6, 0.72], [0, 0.8, 0], "yellow"), x(o, "UpperJaw", [0.68, 0.45, 0.85], [-s * 0.2, 2, 0], "yellow"), x(o, "ContactPad", [0.2, 0.55, 0.82], [-s * 0.37, 1.36, 0], "rubber");
    let a = U(o, "ClampHinge", 0.29, 0.29, 0.62, [0, 0, 0], "navy");
    a.rotation.x = Math.PI / 2, we(o, { type: "swing", axis: "z", range: 0.018, speed: 0.32, phase: s > 0 ? Math.PI : 0 });
  }
  if (n) {
    let s = N(r, "Orbital_Hull_Section", [0, 1.35, 7.1]);
    s.userData.purpose = "\u72EC\u7ACB\u8D27\u8FD0\u8231\u6BB5\u5DE5\u4EF6\uFF0C\u6CCA\u4F4D\u8BBE\u65BD\u672C\u4F53\u5DF2\u7ECF\u5EFA\u6210";
    let o = U(s, "PressureModule", 0.85, 0.85, 4.2, [0, 0, 0], "ivory", 12);
    o.rotation.x = Math.PI / 2;
    for (let a of [-1.75, 0, 1.75]) {
      let l = U(s, "HandlingCollar_" + a, 0.96, 0.96, 0.24, [0, 0, a], "navy", 12);
      l.rotation.x = Math.PI / 2;
    }
    for (let a of [-1, 1]) x(s, "ServiceRail_" + a, [0.12, 0.14, 3.7], [a * 0.68, 0.55, 0], "steel");
  }
  return r;
}
function mh(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("Shipyard");
  t.userData.stage = i, t.userData.orbitalSeparation = "compressed_for_viewer", t.userData.orbitalDisplayHeight = 35.4, t.userData.exportGroups = ["Ground_Elevator", "Twin_Cables", "Cable_Carriage", "Orbital_Dock"], t.userData.stages = [{ level: 1, label: "\u5355\u6CCA\u4F4D\u7535\u68AF\u6E2F", additions: ["\u5B8C\u6574\u53CC\u7F06\u7535\u68AF\u53CA\u8D27\u8FD0\u8F7F\u53A2", "\u6B63\u4E0A\u65B9\u4E2D\u592E\u8F68\u9053\u7AD9\u4E0E\u4E00\u4E2A\u53EF\u7528\u6CCA\u4F4D", "\u88C5\u914D\u8231\u4E0E\u63A7\u5236\u8231"] }, { level: 2, label: "\u53CC\u6CCA\u4F4D\u8FD0\u8F93\u6E2F", additions: ["\u7B2C\u4E8C\u4E2A\u72EC\u7ACB\u6CCA\u4F4D", "\u5730\u9762\u8865\u7ED9\u4ED3", "\u88C5\u914D\u8231\u68C0\u6D4B\u5DE5\u4F5C\u53F0"] }, { level: 3, label: "\u5341\u5B57\u8F68\u9053\u8239\u575E", additions: ["\u56DB\u5411\u5B8C\u6574\u6CCA\u4F4D\u4E0E\u5939\u5177", "\u5730\u9762\u7EF4\u4FEE\u673A\u5E93", "\u8F85\u52A9\u8D27\u7269\u88C5\u5378\u673A\u68B0\u81C2"] }], t.userData.design = ["\u5730\u9762\u57FA\u5EA7\u3001\u53CC\u7F06\u3001\u8F7F\u53A2\u548C\u8F68\u9053\u8239\u575E\u53EF\u5206\u522B\u53D6\u51FA\uFF1B\u8F68\u9053\u4E2D\u5FC3\u4E0E\u4E24\u6839\u7F06\u7EBF\u4E25\u683C\u7AD6\u5411\u5BF9\u9F50\u3002", "\u5730\u9762\u4E0E\u8F68\u9053\u95F4\u8DDD\u538B\u7F29\u7528\u4E8E\u540C\u5C4F\u5C55\u793A\uFF0C\u4E0D\u4EE3\u8868\u771F\u5B9E\u8F68\u9053\u9AD8\u5EA6\u6216\u771F\u5B9E\u5DE5\u7A0B\u6BD4\u4F8B\u3002", "\u5404\u7B49\u7EA7\u5747\u53EF\u8F93\u9001\u8D27\u7269\uFF1B\u5347\u7EA7\u589E\u52A0\u6CCA\u4F4D\u548C\u5730\u9762\u914D\u5957\uFF0C\u672A\u6269\u5EFA\u7684\u8FDE\u63A5\u53E3\u4FDD\u6301\u5C01\u95ED\u3002"], t.userData.pivots = ["Cable_Carriage", "DockingClamp_-1", "DockingClamp_1"];
  let s = N(e, "Ground_Elevator");
  U(s, "OctagonalFoot", 5.7, 5.8, 0.36, [0, 0.18, 0], "navy", 8), U(s, "FreightHub", 4.45, 5.28, 3.6, [0, 2.16, 0], "ivory", 8), U(s, "HubBelt", 4.89, 4.96, 0.48, [0, 1.65, 0], "navy", 8), U(s, "UpperRing", 4.6, 4.6, 0.36, [0, 4.06, 0], "navy", 8), fe(s, "FreightEntry", [0, 0.38, 4.75], 2.2, 2.3), ce(s, "FreightEntryRamp", 2.9, 2.5, 0.4, [0, 0, 5]);
  for (let m of [-1, 1]) zt(s, "HubStatus_" + m, [m * 3.46, 2.27, 3.42], 1.45, 0.48, m * Math.PI / 4);
  let o = N(s, "Elevator_Fork");
  for (let m of [-1, 1]) {
    let g = N(o, "ForkPylon_" + m, [m * 2.92, 0, 0]);
    Vt(g, "PylonShell", [[-1.45, 3.8], [1.45, 3.8], [0.7, 18.2], [-0.45, 18.2]], 2.1, [0, 0, 0], "ivory", 0.055), Vt(g, "InnerSpine", [[-0.45, 4], [0.38, 4], [0.35, 17.8], [-0.23, 17.8]], 2.21, [0, 0, 0], "navy", 0.03), x(g, "HeadServiceCap", [1.33, 0.45, 2.31], [0.08, 18.35, 0], "yellow"), x(g, "FoundationLoadBlock", [2.4, 1.85, 2.9], [0, 4.6, 0], "navy"), bt(g, "PylonConduit", [0, 5.1, 1.16], [0, 17.7, 1.16], 0.17, 0.09, "cyan");
  }
  let a = N(r, "Twin_Cables");
  a.userData.purpose = "\u8FDE\u7EED\u53CC\u7F06\uFF0C\u4ECE\u5730\u9762\u9A71\u52A8\u4E95\u76F4\u8FBE\u8F68\u9053\u7AD9\u4E0B\u90E8\u63A5\u53E3";
  for (let m of [-1.08, 1.08]) ht(a, "TensionCable_" + m, [[m, 3.9, 0], [m, 34.35, 0]], 0.075, "cyan"), U(s, "CableDrive_" + m, 0.43, 0.55, 0.8, [m, 4.6, 0], "steel");
  let l = N(e, "Cable_Carriage", [0, 19.4, 0]);
  l.userData.purpose = "\u53CC\u7F06\u5BFC\u9774\u56FA\u5B9A\u5728\u7BB1\u4F53\u4E24\u4FA7\uFF0C\u6CBF\u4E24\u6761\u7F06\u7EBF\u5782\u76F4\u8FD0\u52A8", x(l, "CargoCabin", [1.65, 2.7, 1.8], [0, 0, 0], "yellow"), x(l, "CargoBayDoor", [1.12, 1.98, 0.16], [0, -0.08, 0.93], "navy"), zt(l, "CarriageStatus", [0, 0.73, 1.05], 0.95, 0.34);
  for (let m of [-1, 1]) for (let g of [-0.87, 0.87]) x(l, "CableGuide_" + m + "_" + g, [0.46, 0.55, 0.55], [m * 1.08, g, 0], "steel");
  we(l, { type: "slide", axis: "y", range: 13.2, speed: 0.14, phase: -Math.PI / 2 });
  let c = N(e, "Orbital_Dock", [0, 35.4, 0]);
  c.userData.purpose = "\u4E0E\u7535\u68AF\u540C\u8F74\u7684\u8F68\u9053\u8D27\u8FD0\u7AD9\uFF1B\u6CCA\u4F4D\u4EE5\u5355\u3001\u53CC\u3001\u56DB\u5411\u6269\u5EFA", U(c, "CableReceiver", 1.45, 1.18, 0.75, [0, -0.95, 0], "navy", 12);
  for (let m of [-1.08, 1.08]) U(c, "CableSocket_" + m, 0.22, 0.22, 0.64, [m, -1.22, 0], "yellow");
  U(c, "CentralStation", 2.75, 2.7, 1.55, [0, 0.03, 0], "ivory", 12), U(c, "StationLowerBelt", 2.81, 2.81, 0.31, [0, -0.61, 0], "navy", 12), U(c, "StationUpperBelt", 2.85, 2.85, 0.26, [0, 0.62, 0], "navy", 12), U(c, "ControlTier", 1.66, 1.98, 0.58, [0, 1.12, 0], "steel", 12), U(c, "ControlWindows", 1.63, 1.78, 0.25, [0, 1.22, 0], "cyan", 12), U(c, "AntennaDeck", 1.38, 1.67, 0.25, [0, 1.6, 0], "navy", 12), Zt(c, "NavigationMast", [0, 1.73, 0], 2.1);
  for (let m of [-0.85, 0.85]) Zt(c, "TrafficBeacon_" + m, [m, 1.68, 0], 1.2);
  let h = [1, 2, 4][i - 1], u = [0, Math.PI, Math.PI / 2, -Math.PI / 2];
  for (let m = 0; m < 4; m++) if (m < h) Ay(c, "Orbital_Berth_" + (m + 1), u[m], m === 0);
  else {
    let g = N(c, "ClosedExpansionPort_" + m);
    g.rotation.y = u[m], x(g, "SealedPortDoor", [1.33, 1.25, 0.25], [0, 0.02, 2.62], "navy"), x(g, "PortLock", [0.8, 0.2, 0.06], [0, 0.02, 2.78], "yellow");
  }
  let d = se(n, "Parts_Assembly_Hall", [-8, 0, -1.6], 4.7, 4, 3.1, "cargo");
  d.userData.purpose = "\u8231\u6BB5\u88C5\u914D\u4E0E\u5730\u9762\u8D28\u91CF\u68C0\u67E5", ge(r, "AssemblyTransfer", [-5.6, 1.05, -1.6], [-4.58, 1.05, -1.6], 1.28);
  let f = se(n, "Lift_Control_Cabin", [6.9, 0, 5.2], 3.8, 3.6, 3.3, "control");
  if (f.userData.purpose = "\u7535\u68AF\u9A71\u52A8\u4E0E\u8F68\u9053\u4EA4\u901A\u63A7\u5236", ge(r, "ControlAccess", [5.3, 1.2, 3.52], [3.62, 1.2, 3.32], 1.05), i >= 2) {
    let m = se(n, "Supply_Depot", [8.2, 0, -2.2], 4.3, 3.8, 2.8, "cargo");
    m.userData.purpose = "\u8F68\u9053\u7AD9\u8865\u7ED9\u4E0E\u7535\u68AF\u8D27\u7269\u7F13\u51B2", ge(r, "SupplyTransfer", [6.05, 1.05, -2.2], [4.42, 1.05, -2.2], 1.3), x(d, "InspectionBench", [3.2, 0.42, 1.4], [0, 3.38, 0], "navy");
    let g = U(d, "TestPressureSection", 0.55, 0.55, 2.4, [0, 4.05, 0], "ivory");
    g.rotation.z = Math.PI / 2;
    for (let _ of [-0.85, 0.85]) x(d, "SectionCradle_" + _, [0.3, 0.45, 1.25], [_, 3.62, 0], "yellow");
  }
  if (i >= 3) {
    let m = N(n, "Maintenance_Hangar", [-7.5, 0, 6.3]);
    m.userData.label = "\u7535\u68AF\u8BBE\u5907\u7EF4\u4FEE\u673A\u5E93", m.userData.purpose = "\u5BFC\u9774\u3001\u9A71\u52A8\u8F6E\u4E0E\u7EF4\u4FEE\u8F66\u8F86\u7684\u7EF4\u62A4", Ft(m, "HangarFoot", 5.2, 4.3);
    for (let _ of [-1, 1]) x(m, "SideWall_" + _, [0.55, 2.7, 3.9], [_ * 2.1, 1.6, 0], "ivory");
    x(m, "RearWall", [4.55, 2.7, 0.4], [0, 1.6, -1.8], "navy"), Vt(m, "Roof", [[-2.65, 0], [2.65, 0], [2.3, 0.6], [-2.3, 0.6]], 4.35, [0, 3.05, 0], "ivory"), zt(m, "HangarStatus", [0, 3.3, 2.23], 2.8, 0.3);
    for (let _ of [-1, 1]) x(m, "DriveWheelBench_" + _, [1.4, 0.7, 1.9], [_ * 1.15, 0.63, -0.35], "steel");
    let g = Qn(d, "Cargo_Loading_Arm", [1.5, 3.15, -1.55], 0.7, 0);
    g.userData.purpose = "\u5DF2\u5EFA\u88C5\u914D\u8231\u7684\u8F85\u52A9\u8231\u6BB5\u540A\u88C5\u673A\u68B0\u81C2", ht(r, "HangarPower", [[-5.1, 0.65, 5.1], [-4.7, 0.65, 3.6], [-3.7, 0.65, 3.6]], 0.14, "navy");
  }
  return t;
}
function af(i, t, e, n = 1) {
  let r = N(i, t, e);
  r.scale.setScalar(n), r.userData.purpose = "\u6709\u9A7E\u9A76\u8231\u3001\u8F66\u8F6E\u3001\u8D77\u91CD\u63A5\u53E3\u548C\u5DE5\u5177\u5E8A\u7684\u72EC\u7ACB\u4FDD\u969C\u8F66", x(r, "Frame", [2.5, 0.58, 4.4], [0, 0.85, 0], "navy"), x(r, "ToolBed", [2.5, 0.5, 2.2], [0, 1.34, -0.85], "yellow"), x(r, "Cabin", [2.2, 1.5, 1.95], [0, 1.75, 1], "ivory"), Vt(r, "Nose", [[-1.1, 0], [1.1, 0], [0.97, 0.68], [-0.97, 0.68]], 0.53, [0, 0.95, 2.07], "ivory"), zt(r, "Windshield", [0, 2.05, 1.997], 1.75, 0.59);
  for (let s of [-1, 1]) {
    zt(r, "SideCabGlass_" + s, [s * 1.12, 2.1, 1], 1.2, 0.53, s * Math.PI / 2), x(r, "Headlamp_" + s, [0.38, 0.23, 0.08], [s * 0.76, 1.25, 2.37], "cyan");
    for (let o of [-1.5, 1.4]) {
      let a = U(r, "Wheel_" + s + "_" + o, 0.61, 0.61, 0.47, [s * 1.33, 0.63, o], "rubber", 12);
      a.rotation.z = Math.PI / 2;
      let l = U(r, "WheelHub_" + s + "_" + o, 0.34, 0.34, 0.05, [s * 1.58, 0.63, o], "steel", 10);
      l.rotation.z = Math.PI / 2;
    }
    x(r, "ToolLocker_" + s, [0.62, 0.81, 1.75], [s * 0.85, 1.89, -0.97], "ivory");
  }
  return x(r, "BeaconBase", [0.75, 0.13, 0.25], [0, 2.56, 0.72], "navy"), x(r, "WarningBeacon", [0.42, 0.2, 0.2], [0, 2.69, 0.72], "yellow"), r;
}
function lf(i, t, e, n = 1, r = 0) {
  let s = N(i, t, e);
  s.scale.setScalar(n), s.rotation.y = r, s.userData.purpose = "\u5E95\u5EA7\u56FA\u5B9A\u7684\u53CC\u5173\u8282\u6551\u63F4\u540A\u81C2\uFF0C\u540A\u7D22\u4F4D\u4E8E\u81C2\u7AEF\uFF0C\u65CB\u8F6C\u533A\u907F\u5F00\u4E3B\u5E93", U(s, "CraneFoundation", 0.62, 0.74, 0.35, [0, 0.18, 0], "navy");
  let o = N(s, "CraneAzimuth", [0, 0.38, 0]);
  U(o, "Turntable", 0.53, 0.53, 0.25, [0, 0.08, 0], "steel");
  let a = N(o, "CraneShoulder", [0, 0.38, 0]), l = U(a, "ShoulderPin", 0.29, 0.29, 0.8, [0, 0, 0], "navy");
  l.rotation.z = Math.PI / 2, bt(a, "UpperBoom", [0, 0, 0], [0, 1.65, 1.85], 0.47, 0.57, "yellow"), ht(a, "HydraulicRam", [[0.35, 0.12, 0.1], [0.35, 1.3, 1.5]], 0.11, "steel");
  let c = N(a, "CraneElbow", [0, 1.65, 1.85]), h = U(c, "ElbowPin", 0.26, 0.26, 0.68, [0, 0, 0], "navy");
  h.rotation.z = Math.PI / 2, bt(c, "ForeBoom", [0, 0, 0], [0, -0.28, 2.1], 0.35, 0.44, "yellow");
  let u = N(c, "Rescue_Hook", [0, -0.28, 2.1]);
  return U(u, "TipSheave", 0.21, 0.21, 0.46, [0, 0, 0], "navy").rotation.z = Math.PI / 2, ht(u, "WireRope", [[0, 0, 0.18], [0, -1.45, 0.18]], 0.032, "dark"), ht(u, "SafetyHook", [[0, -1.45, 0.18], [0, -1.74, 0.18], [0, -1.82, 0.38], [0, -1.64, 0.48]], 0.075, "yellow"), we(o, { type: "swing", axis: "y", range: 0.035, speed: 0.22 }), s;
}
function gh(i, t, e) {
  let n = N(i, t, e);
  n.userData.purpose = "\u5B8C\u5168\u5BC6\u95ED\u7684\u9632\u52A1\u7269\u8D44\u67DC\uFF0C\u4E0D\u9648\u5217\u5BFC\u5F39\u6216\u6B66\u5668", Ft(n, "CabinetFoot", 2.1, 2.45), Vt(n, "ArmoredCase", [[-1, 0.28], [1, 0.28], [1, 4.7], [0.62, 5.1], [-0.62, 5.1], [-1, 4.7]], 2.1, [0, 0, 0], "ivory"), x(n, "LowerGuard", [2.07, 0.6, 2.14], [0, 0.65, 0], "navy"), x(n, "SealedDoor", [1.52, 3.6, 0.13], [0, 2.73, 1.11], "steel"), x(n, "DoorSpine", [0.36, 3.3, 0.08], [0, 2.72, 1.21], "navy"), x(n, "SealStatus", [0.13, 2.27, 0.04], [0, 2.94, 1.27], "cyan");
  for (let r of [-0.66, 0.66]) for (let s of [1.05, 4.17]) x(n, "Lock_" + r + "_" + s, [0.24, 0.24, 0.15], [r, s, 1.22], "yellow");
  return n;
}
function _h(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("Missile_Silo");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u57FA\u7840\u4FDD\u969C\u7AD9", additions: ["\u5B8C\u6574\u76FE\u5F62\u7EF4\u4FEE\u5E93\u53CA\u4FDD\u969C\u8F66", "\u53CC\u5173\u8282\u6551\u63F4\u540A\u81C2", "\u5BC6\u95ED\u9632\u52A1\u67DC\u3001\u5907\u4EF6\u5E93\u4E0E\u8C03\u5EA6\u8231"] }, { level: 2, label: "\u6269\u5C55\u7EF4\u62A4\u7AD9", additions: ["\u72EC\u7ACB\u8F66\u8F86\u7EF4\u62A4\u53F0", "\u7B2C\u4E8C\u8F86\u4FDD\u969C\u8F66\u4E0E\u53F0\u8FB9\u540A\u81C2", "\u7B2C\u4E8C\u5957\u5BC6\u95ED\u50A8\u5B58\u67DC"] }, { level: 3, label: "\u884C\u661F\u4FDD\u969C\u4E2D\u5FC3", additions: ["\u7B2C\u4E09\u5957\u5BC6\u95ED\u50A8\u5B58\u67DC", "\u6269\u5C55\u5907\u4EF6\u8BBE\u5907\u4E0E\u5C4B\u9876\u51B7\u5374\u673A\u7EC4", "\u66F4\u9AD8\u7684\u8C03\u5EA6\u89C6\u91CE\u53CA\u72EC\u7ACB\u901A\u4FE1\u5929\u7EBF"] }], t.userData.design = ["\u6CBF\u7528 Missile_Silo \u539F\u59CB ID\uFF1B\u573A\u666F\u6309\u53C2\u8003\u56FE\u8868\u73B0\u7EF4\u4FEE\u548C\u540E\u52E4\u4FDD\u969C\u3002", "\u76FE\u5F62\u5E93\u7684\u9876\u58F3\u3001\u4FA7\u5899\u3001\u540E\u5899\u3001\u5730\u677F\u5168\u90E8\u95ED\u5408\uFF0C\u8F66\u8F86\u53EF\u4ECE\u5B8C\u6574\u6B63\u9762\u5E93\u53E3\u51FA\u5165\u3002", "\u9632\u52A1\u67DC\u95E8\u4FDD\u6301\u5BC6\u95ED\uFF1B\u7EF4\u62A4\u53F0\u8BBE\u673A\u68B0\u652F\u5EA7\uFF0C\u6551\u63F4\u540A\u81C2\u7684\u5404\u65CB\u8F6C\u5173\u8282\u4E0E\u540A\u7D22\u72EC\u7ACB\u3002"], t.userData.pivots = ["Rescue_Crane", "CraneAzimuth", "CraneShoulder", "CraneElbow", "Rescue_Hook", "Service_Vehicle"];
  let s = N(e, "Shield_Repair_Garage");
  Ft(s, "GarageFoot", 12, 9.25, [0, 0, -0.6]), x(s, "MaintenanceFloor", [11.2, 0.25, 8.9], [0, 0.39, -0.6], "steel"), Vt(s, "GarageStructuralShell", [[-5.65, 0.35], [-5.65, 3.1], [-4.45, 6.35], [-2.8, 7], [2.8, 7], [4.45, 6.35], [5.65, 3.1], [5.65, 0.35], [4.05, 0.35], [4.05, 4.13], [3.47, 5.04], [-3.47, 5.04], [-4.05, 4.13], [-4.05, 0.35]], 8.4, [0, 0, -0.6], "ivory", 0.065), Vt(s, "ClosedBackWall", [[-5.65, 0.35], [5.65, 0.35], [5.65, 3.1], [4.45, 6.35], [2.8, 7], [-2.8, 7], [-4.45, 6.35], [-5.65, 3.1]], 0.4, [0, 0, -4.65], "navy");
  for (let u of [-1, 1]) Vt(s, "FrontButtress_" + u, [[-0.6, 0.4], [0.6, 0.4], [0.37, 4.5], [-0.1, 4.9]], 0.72, [u * 4.8, 0, 3.7], "navy", 0.04), x(s, "DoorGuide_" + u, [0.23, 4.52, 0.24], [u * 3.83, 2.7, 3.67], "yellow"), x(s, "Bumper_" + u, [0.68, 0.65, 0.8], [u * 4.82, 0.73, 3.75], "yellow"), x(s, "LiftTrack_" + u, [0.35, 0.14, 7.7], [u * 1.55, 0.58, -0.3], "yellow", 0.025);
  x(s, "ShieldDoorHeader", [6.45, 1.28, 0.5], [0, 5.75, 3.75], "navy"), zt(s, "BayStatus", [0, 5.65, 4.035], 4.75, 0.32);
  let a = N(s, "Garage_Roller_Door", [0, 4.9, 3.5]);
  a.userData.purpose = "\u8F66\u5E93\u5377\u5E18\u95E8\u6536\u7EB3\u5728\u9876\u90E8\uFF1B\u53EF\u72EC\u7ACB\u63A7\u5236";
  for (let u = 0; u < 3; u++) x(a, "RolledSlat_" + u, [7.2, 0.16, 0.27], [0, u * 0.18, 0], "steel", 0.025);
  x(s, "RoofServiceDeck", [6.4, 0.29, 6.2], [0, 7.15, -0.8], "navy");
  let l = se(s, "CraneControlCabin", [0, 7.31, -1.9], 2.5, 2.2, 1.35, "control");
  l.userData.purpose = "\u5B8C\u6574\u8F66\u5E93\u4E0A\u7684\u540A\u81C2\u64CD\u4F5C\u5BA4", lf(s, "Rescue_Crane", [-3.35, 6.9, 1], 0.88, -0.12), af(e, "Service_Vehicle", [0, 0.52, 1], 1), ce(e, "VehicleApronRamp", 7.7, 1.8, 0.52, [0, 0, 3.75]), gh(e, "Closed_Defense_Storage_A", [6.94, 0, -2.7]), ht(r, "DefenseCabinetUtilities_A", [[5.5, 1.3, -2.8], [6, 1.3, -2.8]], 0.13, "navy");
  let c = se(n, "Spare_Parts_Warehouse", [-8.25, 0, 1.9], 3.55, 3.4, 2.9, "cargo");
  c.userData.purpose = "\u4FDD\u969C\u8F66\u548C\u540A\u81C2\u5907\u4EF6\u7684\u5C01\u95ED\u4ED3\u5E93", ge(r, "SparePartsAccess", [-6.45, 1.1, 1.4], [-5.5, 1.1, 1.4], 1.1);
  let h = se(n, "Dispatch_Cabin", [3.1, 0, 7.9], 3.6, 3.3, 2.9, "control");
  if (h.userData.purpose = "\u8C03\u5EA6\u7EF4\u4FEE\u8F66\u8F86\u5E76\u89C2\u5BDF\u4E3B\u5E93\u53CA\u5916\u7F6E\u7EF4\u62A4\u53F0", ht(r, "DispatchData", [[3.1, 0.7, 6.25], [4.9, 0.7, 5.4], [4.9, 0.7, 3.8]], 0.12, "navy"), i >= 2) {
    gh(e, "Closed_Defense_Storage_B", [6.94, 0, 0.3]), ht(r, "DefenseCabinetUtilities_B", [[5.5, 1.3, 0.3], [6, 1.3, 0.3]], 0.13, "navy");
    let u = N(n, "Vehicle_Maintenance_Platform", [9, 0, 6.3]);
    u.userData.label = "\u8F66\u8F86\u7EF4\u62A4\u53F0", u.userData.purpose = "\u72EC\u7ACB\u8F66\u8F86\u68C0\u4FEE\u652F\u5EA7\u4E0E\u4FA7\u7F6E\u540A\u81C2\uFF0C\u8F66\u8F6E\u901A\u8FC7\u5761\u9053\u4E0A\u53F0", U(u, "OctagonalMaintenanceFoot", 3.3, 3.3, 0.35, [0, 0.18, 0], "navy", 8), U(u, "ServiceDeck", 2.99, 3, 0.19, [0, 0.45, 0], "steel", 8);
    for (let d of [-1, 1]) x(u, "HydraulicLiftPad_" + d, [0.55, 0.3, 2.9], [d * 1.1, 0.69, -0.1], "yellow");
    af(u, "Secondary_Service_Vehicle", [0, 0.83, -0.15], 0.62), lf(u, "Platform_Rescue_Crane", [2.2, 0.55, -1.6], 0.68, -0.9), ce(u, "MaintenanceRamp", 2.1, 1.8, 0.55, [0, 0, 2.65]), ht(r, "MaintenanceFeed", [[6.7, 0.6, 5.2], [6.7, 0.6, 3], [5.5, 0.6, 3]], 0.15, "navy");
  }
  if (i >= 3) {
    gh(e, "Closed_Defense_Storage_C", [6.94, 0, -5.7]), ht(r, "DefenseCabinetUtilities_C", [[5.5, 1.3, -4.25], [5.7, 1.3, -5.7], [6, 1.3, -5.7]], 0.13, "navy");
    for (let u of [-1.8, 1.8]) x(s, "VentilationHousing_" + u, [1.65, 0.75, 1.55], [u, 7.66, 1], "ivory"), ye(s, "RoofVent_" + u, [u, 8.07, 1], 1.35, 1.3);
    x(c, "ExternalToolCabinet", [1.05, 1.58, 1.38], [-2.38, 1.07, -0.35], "ivory"), Ft(c, "ToolCabinetFoot", 1.32, 1.63, [-2.38, 0, -0.35]), x(c, "ToolCabinetDoor", [0.82, 1.18, 0.08], [-2.38, 1.08, 0.38], "navy"), x(h, "RaisedTrafficDeck", [2.2, 0.31, 2.1], [0, 3.5, 0], "navy"), zt(h, "TrafficObservation", [0, 3.8, 1.02], 1.88, 0.45), x(h, "ObservationRear", [2.2, 0.6, 1.83], [0, 3.81, -0.1], "ivory"), x(h, "ObservationRoof", [2.4, 0.22, 2.3], [0, 4.22, 0], "ivory"), Zt(h, "EmergencyComms", [-0.7, 4.35, -0.45], 1.2);
  }
  return t;
}
function cf(i, t, e, n, r = false) {
  let s = N(i, t, n), o = new $e(e, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed();
  o.computeVertexNormals();
  let a = new Xt(o, Ae.glass);
  a.name = "ClosedTransparentHemisphere", s.add(a);
  let l = Re(s, "PressureSealRim", e, 0.09, [0, 0, 0], "ivory", 6, 40);
  if (l.rotation.x = Math.PI / 2, r) for (let c = 0; c < 8; c++) {
    let h = c * Math.PI / 4, u = [];
    for (let d = 0; d <= 8; d++) {
      let f = d * Math.PI / 16;
      u.push([Math.cos(h) * e * Math.cos(f), e * Math.sin(f), Math.sin(h) * e * Math.cos(f)]);
    }
    ht(s, "GreenhouseMullion_" + c, u, 0.048, "ivory");
  }
  return s;
}
function hf(i, t, e, n = 1) {
  let r = N(i, t, e);
  return U(r, "Trunk", 0.09 * n, 0.14 * n, 0.95 * n, [0, 0.475 * n, 0], "ore", 6), Ye(r, "TreeCanopy", 0.7 * n, [0, 1.28 * n, 0], "green", 0).scale.set(0.78, 1.05, 0.78), Ye(r, "CanopyHighlight", 0.43 * n, [0.15 * n, 1.7 * n, -0.08 * n], "leaf", 0).scale.set(0.82, 0.8, 0.85), r;
}
function yh(i = 3) {
  i = Ke.clamp(Math.round(i), 1, 3);
  let { root: t, main: e, support: n, links: r } = he("Terraformer");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u751F\u6001\u6539\u9020\u7AD9", additions: ["\u5B8C\u6574\u5BC6\u95ED\u751F\u6001\u7A79\u9876\u548C\u79CD\u690D\u533A", "\u4E09\u7247\u6C14\u5019\u8C03\u8282\u7FFC", "\u5355\u7B52\u6C34\u5904\u7406\u7AD9"] }, { level: 2, label: "\u751F\u6001\u57F9\u80B2\u4E2D\u5FC3", additions: ["\u7B2C\u4E8C\u53EA\u6C34\u5904\u7406\u7F50", "\u72EC\u7ACB\u751F\u6001\u8BD5\u9A8C\u6E29\u5BA4", "\u65B0\u589E\u6210\u719F\u79CD\u690D\u533A"] }, { level: 3, label: "\u5730\u5F62\u6539\u9020\u7EFC\u5408\u4F53", additions: ["\u5DE5\u7A0B\u8BBE\u5907\u68DA", "\u6C14\u5019\u5FAA\u73AF\u6CF5\u7EC4", "\u6C34\u5904\u7406\u8FC7\u6EE4\u548C\u79CD\u690D\u6269\u5BB9"] }], t.userData.design = ["\u900F\u660E\u7A79\u9876\u7F69\u4F4F\u5B9E\u9645\u7EFF\u8272\u79CD\u690D\u5E8A\u3001\u6811\u6728\u548C\u704C\u6E89\u6C60\uFF0C\u7ED3\u6784\u59CB\u7EC8\u5B8C\u6574\u95ED\u5408\u3002", "\u4E09\u679A\u6C14\u5019\u53F6\u7247\u7684\u843D\u5730\u652F\u811A\u4E0E\u73AF\u5F62\u73AF\u5883\u673A\u5EA7\u76F8\u63A5\uFF0C\u53F6\u7247\u5185\u7684\u6362\u70ED\u7247\u4E0E\u5E95\u90E8\u98CE\u9053\u5BF9\u5E94\u3002", "\u6C34\u5904\u7406\u4F9B\u56DE\u7BA1\u8FDB\u5165\u73AF\u5F62\u673A\u5EA7\uFF1B\u72EC\u7ACB\u8BD5\u9A8C\u6E29\u5BA4\u548C\u8BBE\u5907\u68DA\u901A\u8FC7\u77ED\u8FDE\u901A\u8BBE\u65BD\u63A5\u5165\u3002"], U(e, "EnvironmentFoundation", 5.48, 5.77, 0.4, [0, 0.2, 0], "navy", 16), U(e, "CircularServicePlant", 5.12, 5.48, 1.25, [0, 1.04, 0], "ivory", 16), U(e, "EnvironmentalControlBand", 5.16, 5.16, 0.48, [0, 1.74, 0], "navy", 16), U(e, "UpperCultivationDeck", 4.98, 5.16, 0.5, [0, 2.19, 0], "ivory", 16), U(e, "GlazingPressureCollar", 4.91, 4.99, 0.28, [0, 2.59, 0], "navy", 20);
  for (let m = 0; m < 12; m++) {
    let g = m * Math.PI / 6, _ = x(e, "EnvironmentWindow_" + m, [1.65, 0.3, 0.15], [Math.sin(g) * 5.15, 1.75, Math.cos(g) * 5.15], "cyan", 0.025);
    _.rotation.y = g;
  }
  let s = N(e, "CultivationInterior", [0, 2.75, 0]);
  U(s, "SealedGardenFloor", 4.68, 4.68, 0.18, [0, 0, 0], "navy", 20), U(s, "ManagedGrassSubstrate", 4.52, 4.52, 0.12, [0, 0.13, 0], "green", 20), x(s, "MaintenanceWalkway", [0.66, 0.09, 8.15], [0, 0.235, 0], "ivory", 0.025), x(s, "GardenCrossWalkway", [7.1, 0.08, 0.55], [0, 0.24, 0.1], "ivory", 0.025), U(s, "IrrigationBasinWall", 0.96, 1.04, 0.24, [0, 0.35, 0.3], "ivory", 12), U(s, "IrrigationWater", 0.8, 0.8, 0.035, [0, 0.48, 0.3], "cyan", 12);
  let o = [[-1.7, 0.22, -1.43, 1.05], [1.65, 0.22, -1.5, 1.04], [1.55, 0.22, 1.9, 0.84], [-1.8, 0.22, 1.65, 0.75], [-2.9, 0.22, 0.5, 0.58]], a = i === 1 ? 3 : i === 2 ? 4 : 5;
  for (let m = 0; m < a; m++) {
    let [g, _, p, y] = o[m];
    U(s, "TreePlanter_" + m, 0.73 * y, 0.79 * y, 0.18, [g, 0.23, p], "leaf", 8), hf(s, "MatureTree_" + m, [g, _, p], y);
  }
  for (let m of [-2.6, 2.6]) for (let g = 0; g < 3; g++) {
    let _ = N(s, "CultivationTray_" + (m < 0 ? "L" : "R") + "_" + g, [m, 0.25, (g - 1) * 1.05 - 0.12]);
    x(_, "HydroponicTray", [0.82, 0.18, 0.65], [0, 0.07, 0], "ivory", 0.04), x(_, "GrowthMedium", [0.68, 0.07, 0.52], [0, 0.19, 0], "green", 0.015);
    for (let p of [-0.19, 0.19]) Ye(_, "MatureLeaf", 0.2, [p, 0.34, 0], "leaf", 0).scale.set(0.62, 1, 0.84);
  }
  ht(s, "IrrigationFeed", [[-4.3, 0.24, 0], [-3.55, 0.24, 0], [-3.55, 0.24, -2.5], [3.35, 0.24, -2.5], [3.35, 0.24, 0]], 0.065, "navy"), cf(e, "EcologyDome", 4.84, [0, 2.75, 0], false);
  for (let m of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    let g = [];
    for (let _ = 0; _ <= 9; _++) {
      let p = _ * Math.PI / 18;
      g.push([Math.sin(m) * 4.86 * Math.cos(p), 2.75 + 4.86 * Math.sin(p), Math.cos(m) * 4.86 * Math.cos(p)]);
    }
    ht(e, "PressureGlazingRib", g, 0.035, "ivory");
  }
  let l = U(e, "DomePressureVent", 0.22, 0.3, 0.2, [0, 7.62, 0], "navy", 8), c = [-1.16, 1.16, Math.PI];
  for (let m = 0; m < 3; m++) {
    let g = N(e, "ClimateFin_" + (m + 1));
    g.rotation.y = c[m], Ft(g, "ClimateFoot", 2, 2.7, [0, 0, 5.3], 0.27);
    let p = Vt(g, "ClimateBladeHousing", [[-0.66, 0], [0.81, 0], [1.12, 3.23], [0.43, 7.54], [0, 8.46], [-0.72, 8.19], [-1.13, 3.4]], 1.28, [0, 0.28, 5.25], "ivory", 0.06);
    p.rotation.y = Math.PI / 2;
    for (let y of [-0.69, 0.69]) {
      let M = Vt(g, "HeatExchangerRecess", [[-0.54, 2.51], [0.39, 2.81], [0.42, 6.42], [-0.08, 7.48], [-0.49, 6.27]], 0.07, [y, 0.28, 5.25], "navy", 0.025);
      M.rotation.y = Math.PI / 2;
      let v = Vt(g, "ActiveClimateSurface", [[-0.35, 3], [0.2, 3.18], [0.21, 6.25], [-0.07, 6.91], [-0.31, 6.1]], 0.06, [y * 1.045, 0.28, 5.25], "cyan", 0.02);
      v.rotation.y = Math.PI / 2;
    }
    x(g, "ClimateBladeCap", [1.32, 0.32, 0.78], [0, 8.79, 5.57], "yellow", 0.04), x(g, "AirHandlingBase", [1.8, 1.17, 2.1], [0, 0.87, 5.1], "navy", 0.1);
    for (let y = 0; y < 3; y++) x(g, "AirIntakeLouver_" + y, [1.16, 0.13, 0.17], [0, 0.62 + y * 0.25, 6.23], "steel", 0.02);
    ht(g, "ClimateSupplyDuct", [[0, 1.32, 4.38], [0, 1.32, 5.02]], 0.34, "navy"), i >= 3 && (x(g, "ClimateCirculationPump", [0.77, 1.1, 0.89], [0.79, 1.68, 4.97], "yellow", 0.07), ht(g, "PumpRiser", [[0.8, 1.78, 4.64], [0.8, 2.94, 4.64], [0.52, 2.94, 4.64]], 0.16, "navy"));
  }
  let h = N(e, "EnvironmentalControlEntrance", [0, 0, 4.88]);
  x(h, "EntryCabin", [2.93, 2.6, 1.63], [0, 1.61, 0], "ivory", 0.13), x(h, "EntryOuterFrame", [2.48, 2.21, 0.42], [0, 1.43, 0.92], "navy", 0.07), fe(h, "BiosphereAirlock", [0, 0.33, 1.15], 1.55, 1.8), ce(h, "EntranceRamp", 2.27, 2, 0.33, [0, 0, 1.3]), x(h, "ClimateControlPanel", [1.7, 0.35, 0.2], [0, 2.9, 0.75], "cyan", 0.03);
  let u = N(n, "WaterTreatmentStation", [-7.35, 0, 0.35]);
  Ft(u, "WaterTreatmentFoot", i === 1 ? 3.25 : 4.8, 4.1, [0, 0, 0], 0.28);
  let d = i === 1 ? [0] : [-1.06, 1.06];
  for (let m = 0; m < d.length; m++) {
    let g = je(u, "WaterReservoir_" + (m + 1), [d[m], 0.28, 0], 0.86, 3.26, m === 0 ? "navy" : "ivory");
    U(g, "TreatmentAccessCap", 0.62, 0.67, 0.25, [0, 3.32, 0], "ivory", 10), U(g, "ValveCap", 0.26, 0.29, 0.25, [0, 3.55, 0], "yellow", 8), x(g, "ReservoirLevelGauge", [0.19, 1.45, 0.09], [0, 1.63, 0.92], "cyan", 0.02), ht(u, "TankTreatmentBranch_" + m, [[d[m], 1, -0.82], [d[m], 1, -1.51], [i === 1 ? 0.4 : 1.43, 1, -1.51]], 0.2, "navy");
  }
  let f = -7.35 + (i === 1 ? 0.86 : 1.92);
  if (ht(r, "IrrigationSupply", [[-4.95, 1.32, 0.1], [f, 1.32, 0.1]], 0.27, "cyan"), ht(r, "WaterTreatmentReturn", [[-4.79, 0.86, 1.45], [-5.66, 0.86, 1.45], [-5.66, 0.86, 1.08], [f, 0.86, 1.08]], 0.25, "navy"), i >= 2) {
    let m = N(n, "EcologyExperimentGreenhouse", [7.33, 0, -1.52]);
    U(m, "GreenhouseFoot", 2.2, 2.4, 0.3, [0, 0.15, 0], "navy", 10), U(m, "GreenhouseHabitatBase", 1.95, 2.17, 1, [0, 0.8, 0], "ivory", 10), U(m, "SeedBedFloor", 1.82, 1.82, 0.17, [0, 1.35, 0], "green", 10);
    for (let g = 0; g < 5; g++) {
      let _ = g * Math.PI * 2 / 5;
      hf(m, "ExperimentalTree_" + g, [Math.sin(_) * 0.84, 1.4, Math.cos(_) * 0.84], 0.44);
    }
    cf(m, "ExperimentalGreenhouseGlazing", 1.9, [0, 1.43, 0], true), fe(m, "GreenhouseServiceDoor", [0, 0.28, 2.07], 0.95, 1.06), ht(r, "GreenhouseWaterFeed", [[4.74, 1.08, -1.52], [5.22, 1.08, -1.52], [5.45, 1.08, -1.52]], 0.23, "navy"), x(r, "GreenhouseClimateTunnel", [0.77, 1, 1.2], [5.1, 1.08, -1.52], "ivory", 0.06);
  }
  if (i >= 3) {
    let m = se(n, "TerraformingEquipmentShed", [5.57, 0, 6.65], 4.05, 3.25, 2.64, "cargo");
    ye(m, "EngineeringRoofVent", [-0.65, 3.06, -0.32], 1.36, 0.98), x(m, "WaterPumpModule", [0.78, 1.4, 1.26], [2.1, 0.98, -0.26], "navy", 0.08), ht(r, "EquipmentShedUtilities", [[3.65, 0.67, 3.57], [4.72, 0.67, 4.42], [4.72, 0.67, 5.05]], 0.19, "yellow"), x(u, "WaterFilterPack", [2.93, 1.32, 1.13], [0, 0.99, -1.87], "ivory", 0.1);
    for (let g of [-0.81, 0.81]) {
      let _ = U(u, "FilterCartridge", 0.32, 0.32, 1.1, [g, 1.2, -1.94], "navy", 10);
      _.rotation.x = Math.PI / 2, ht(u, "FilterReturn", [[g, 0.99, -1.3], [g, 0.99, -0.83]], 0.16, "cyan");
    }
  }
  return t;
}
function vh(i, t, e, n = false) {
  let r = N(i, t, e);
  r.userData.purpose = n ? "\u8D77\u5C45\u4E0E\u5165\u53E3\u5206\u533A\uFF0C\u53CC\u5C42\u6C14\u95F8\u9694\u79BB\u5916\u90E8\u73AF\u5883" : "\u72EC\u7ACB\u53EF\u9694\u79BB\u7684\u5BC6\u95ED\u5C45\u4F4F\u5206\u533A", U(r, "Local_Lobe_Foundation", 3.45, 3.69, 0.3, [0, 0.15, 0], "navy", 16), U(r, "Lower_Pressure_Shell", 3.2, 3.34, 1.84, [0, 1.25, 0], "ivory", 16), U(r, "View_Belt_Recess", 3.26, 3.28, 0.67, [0, 1.48, 0], "navy", 16);
  for (let o = 0; o < 12; o++) {
    if (n && (o === 0 || o === 11)) continue;
    let a = (o + 0.5) * Math.PI / 6;
    zt(r, `Lobe_Window_${o + 1}`, [3.2 * Math.sin(a), 1.5, 3.2 * Math.cos(a)], 1.39, 0.44, a);
  }
  U(r, "Dome_Skirt_Seal", 3.25, 3.27, 0.2, [0, 2.29, 0], "navy", 16);
  let s = new Xt(new $e(3.19, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), Ae.ivory);
  s.name = "Sealed_Habitat_Dome", s.position.y = 2.37, s.castShadow = true, s.receiveShadow = true, r.add(s);
  for (let o = 0; o < 4; o++) {
    let a = Math.PI / 4 + o * Math.PI / 2, l = new Xt(new $e(3.225, 2, 6, a - 0.062, 0.124, 0, Math.PI / 2), Ae.navy);
    l.name = `Dome_Restraint_Band_${o + 1}`, l.position.y = 2.37, r.add(l);
    let c = x(r, `Skirt_Band_Lock_${o + 1}`, [0.44, 0.44, 0.3], [3.24 * Math.sin(a), 2.02, 3.24 * Math.cos(a)], "yellow", 0.04);
    c.rotation.y = a;
  }
  return x(r, "Top_Service_Lock", [0.65, 0.17, 0.69], [0, 5.64, 0], "yellow"), r;
}
function Ry(i, t) {
  let e = N(i, "Independent_Greenhouse", t);
  e.userData.purpose = "\u5BC6\u95ED\u6C34\u57F9\u6E29\u5BA4\uFF1B\u690D\u7269\u7F6E\u4E8E\u57F9\u80B2\u69FD\uFF0C\u914D\u5907\u704C\u6E89\u4E0E\u6C14\u95F8", U(e, "Greenhouse_Local_Foot", 2.22, 2.43, 0.29, [0, 0.145, 0], "navy", 12), U(e, "Planting_Deck", 2.1, 2.2, 0.5, [0, 0.54, 0], "steel", 12);
  let n = N(e, "Independent_Transparent_Greenhouse_Cover"), r = 2.17, s = 0.83, o = new Xt(new $e(r, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), Ae.glass);
  o.name = "Greenhouse_Glazing", o.position.y = s, o.castShadow = false, o.renderOrder = 2, n.add(o);
  for (let c = 0; c < 12; c++) {
    let h = c * Math.PI / 6, u = [0, s + r, 0];
    for (let d = 1; d <= 4; d++) {
      let f = d * Math.PI / 8, m = [r * Math.sin(f) * Math.sin(h), s + r * Math.cos(f), r * Math.sin(f) * Math.cos(h)];
      if (c % 2 === 0 && bt(n, `Glazing_Meridian_${c}_${d}`, u, m, 0.071, 0.076, "ivory"), u = m, d < 4) {
        let g = h + Math.PI / 6, _ = [r * Math.sin(f) * Math.sin(g), s + r * Math.cos(f), r * Math.sin(f) * Math.cos(g)];
        bt(n, `Glazing_Ring_${d}_${c}`, m, _, 0.068, 0.069, "ivory");
      }
    }
  }
  let a = Re(n, "Sealed_Base_Rim", r, 0.095, [0, s, 0], "ivory", 6, 24);
  a.rotation.x = Math.PI / 2;
  for (let c of [-0.71, 0.71]) for (let h of [-0.64, 0.64]) x(e, "Hydroponic_Tray", [0.84, 0.26, 0.84], [c, 0.91, h], "navy"), x(e, "Growing_Medium", [0.7, 0.06, 0.69], [c, 1.07, h], "green", 0.02), U(e, "Plant_Stem", 0.045, 0.067, 0.65, [c, 1.41, h], "leaf", 6), Ye(e, "Cultivated_Plant_Crown", 0.48, [c, 1.74, h], "green", 0), Ye(e, "Cultivated_Plant_Leaf", 0.28, [c + 0.19, 1.51, h + 0.16], "leaf", 0);
  ht(e, "Irrigation_Manifold", [[-0.72, 0.96, -1.19], [-0.72, 0.96, 1.13], [0.72, 0.96, 1.13], [0.72, 0.96, -1.19]], 0.055, "cyan");
  let l = N(e, "Greenhouse_Airlock", [0, 0.29, 2.01]);
  return Vt(l, "Small_Airlock_Shell", [[-0.68, 0], [0.68, 0], [0.54, 1.22], [-0.54, 1.22]], 0.9, [0, 0, 0], "ivory"), fe(l, "Greenhouse_Door", [0, 0.04, 0.48], 0.64, 0.91), e;
}
function xh(i = 3) {
  i = Math.max(1, Math.min(3, Math.round(i)));
  let { root: t, main: e, support: n, links: r } = he("Moon_Base");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u57FA\u7840\u6708\u7403\u57FA\u5730", additions: ["\u4E09\u74E3\u5B8C\u6574\u5BC6\u95ED\u5C45\u4F4F\u8231", "\u4E2D\u592E\u6C14\u95F8\u4E0E\u524D\u5165\u53E3\u5761\u9053", "\u751F\u547D\u7EF4\u6301\u53CC\u7F50\u4E0E\u80FD\u6E90\u8231"] }, { level: 2, label: "\u6708\u7403\u5B9A\u5C45\u57FA\u5730", additions: ["\u901A\u4FE1\u8231\u4E0E\u72EC\u7ACB\u901A\u4FE1\u789F", "\u50A8\u5907\u4ED3\u53CA\u52A0\u538B\u901A\u9053", "\u4E2D\u592E\u901A\u4FE1\u6845\u6746"] }, { level: 3, label: "\u6708\u7403\u7EFC\u5408\u57FA\u5730", additions: ["\u72EC\u7ACB\u900F\u660E\u6C34\u57F9\u6E29\u5BA4", "\u751F\u547D\u7EF4\u6301\u704C\u6E89\u56DE\u8DEF", "\u6269\u5C55\u80FD\u6E90\u6563\u70ED\u8BBE\u5907"] }], t.userData.design = ["\u4E09\u74E3\u5C45\u4F4F\u8231\u5206\u522B\u662F\u5B8C\u6574\u538B\u529B\u58F3\uFF0C\u7ECF\u77ED\u52A0\u538B\u901A\u9053\u63A5\u5165\u4E2D\u592E\u9694\u79BB\u6C14\u95F8\uFF0C\u8231\u6BB5\u53EF\u72EC\u7ACB\u5C01\u95ED\u3002", "\u5165\u53E3\u4F4D\u4E8E\u524D\u74E3\u6B63\u4E2D\uFF0C\u4E24\u4FA7\u914D\u5957\u8FDE\u63A5\u7559\u51FA\u4E3B\u5761\u9053\uFF1B\u53CC\u7F50\u5E03\u7F6E\u5728\u540E\u90E8\u5E76\u63A5\u5165\u4E2D\u592E\u751F\u547D\u7EF4\u6301\u63A5\u53E3\u3002", "\u6E29\u5BA4\u5185\u7684\u6C34\u57F9\u69FD\u3001\u704C\u6E89\u7BA1\u548C\u53EF\u62C6\u900F\u660E\u7F69\u5206\u522B\u5EFA\u6A21\uFF1B\u901A\u4FE1\u3001\u50A8\u5907\u53CA\u80FD\u6E90\u8231\u4F7F\u7528\u72EC\u7ACB\u5C40\u90E8\u57FA\u811A\u3002"], t.userData.pivots = ["Lunar_Communications_Dish/Azimuth", "Lunar_Communications_Dish/Elevation"], vh(e, "Forward_Habitat_Lobe", [0, 0, 3.3], true), vh(e, "Port_Habitat_Lobe", [-4, 0, -2.36]), vh(e, "Starboard_Habitat_Lobe", [4, 0, -2.36]);
  let s = N(e, "Central_Isolation_Airlock", [0, 0, -0.59]);
  U(s, "Hub_Local_Foot", 1.97, 2.16, 0.3, [0, 0.15, 0], "navy", 8), U(s, "Central_Pressure_Shell", 1.66, 1.91, 4.74, [0, 2.69, 0], "navy", 8), U(s, "Hub_Upper_Equipment_Floor", 1.53, 1.81, 0.63, [0, 5.15, 0], "steel", 8);
  for (let c = 0; c < 4; c++) {
    let h = c * Math.PI / 2, u = x(s, `Hub_Vertical_Service_Light_${c}`, [0.36, 1.05, 0.11], [Math.sin(h) * 1.72, 4.32, Math.cos(h) * 1.72], "cyan", 0.025);
    u.rotation.y = h;
  }
  U(s, "Hub_Roof_Cap", 1.07, 1.51, 0.42, [0, 5.68, 0], "navy", 8), U(s, "Emergency_Beacon", 0.48, 0.64, 0.36, [0, 6.01, 0], "yellow", 8), i >= 2 && (Zt(s, "Lunar_Primary_Mast", [0, 6.17, -0.3], 1.87), Zt(s, "Lunar_Secondary_Mast", [-0.66, 5.75, -0.15], 1.38), Zt(s, "Lunar_Backup_Mast", [0.71, 5.75, -0.08], 1.08)), ge(r, "Forward_Pressurized_Link", [0, 1.18, 0.51], [0, 1.18, 1.63], 1.61), ge(r, "Port_Pressurized_Link", [-1.13, 1.23, -0.95], [-2.53, 1.23, -1.48], 1.45), ge(r, "Starboard_Pressurized_Link", [1.13, 1.23, -0.95], [2.53, 1.23, -1.48], 1.45);
  let o = N(e, "Main_Exterior_Airlock", [0, 0.3, 6.1]);
  Vt(o, "Entrance_Pressure_Shell", [[-1.43, 0], [1.43, 0], [1.03, 2.63], [-1.03, 2.63]], 2.19, [0, 0, 0], "ivory"), fe(o, "Outer_Airlock_Door", [0, 0.06, 1.13], 1.18, 1.91), x(o, "Airlock_Roof_Indicator", [0.83, 0.2, 0.34], [0, 2.5, 0.26], "yellow"), ce(e, "Lunar_Base_Entry_Ramp", 2.22, 3, 0.38, [0, 0, 7.24]);
  for (let c of [-1.04, 1.04]) bt(e, "Entry_Ramp_Safety_Edge", [c, 0.41, 7.26], [c, 0.06, 10.22], 0.1, 0.13, "yellow");
  let a = N(e, "Rear_Life_Support_Reservoirs", [1.49, 0, -6.07]);
  Ft(a, "Life_Support_Local_Foot", 3.81, 2.25), je(a, "Atmosphere_Reserve", [-0.87, 0.28, 0], 0.68, 2.83), je(a, "Water_Reserve", [0.87, 0.28, 0], 0.68, 2.41), ht(a, "Reservoir_Manifold", [[-0.87, 0.87, 0.58], [-0.87, 0.87, 1.02], [0.87, 0.87, 1.02], [0.87, 0.87, 0.58]], 0.11, "yellow"), ht(r, "Central_Life_Support_Supply", [[0, 1.01, -2.15], [0, 1.01, -4.93], [0.65, 1.01, -4.93], [0.65, 1.01, -5.59]], 0.19, "navy");
  let l = N(n, "Energy_Module", [9.28, 0, -1.61]);
  l.userData.purpose = "\u5C45\u4F4F\u533A\u50A8\u80FD\u3001\u914D\u7535\u4E0E\u5E9F\u70ED\u6392\u653E", se(l, "Battery_And_Distribution_Cabin", [0, 0, 0], 3.38, 3.25, 2.39, "utility"), x(l, "Energy_Controller", [1.13, 0.49, 1.36], [0, 2.73, -0.38], "navy"), x(l, "Charge_Status", [0.81, 0.14, 0.06], [0, 2.74, 0.34], "cyan");
  for (let c of [-1.09, 1.09]) x(l, "Shielded_Energy_Rail", [0.31, 0.2, 2.61], [c, 2.47, -0.09], "yellow");
  if (ht(r, "Power_Distribution", [[6.79, 0.86, -1.61], [7.91, 0.86, -1.61]], 0.2, "navy"), ht(r, "Power_Cooling_Return", [[6.52, 0.58, -2.4], [7.21, 0.58, -2.4], [7.21, 0.58, -2.82], [7.69, 0.58, -2.82]], 0.11, "cyan"), i >= 2) {
    let c = N(n, "Communications_Cabin", [-9.13, 0, -0.55]);
    c.userData.purpose = "\u5BF9\u5730\u4E0E\u6708\u9762\u901A\u4FE1\uFF0C\u5929\u7EBF\u5B89\u88C5\u5728\u5B9E\u4F53\u8BBE\u5907\u8231\u9876", U(c, "Communications_Foot", 1.96, 2.15, 0.3, [0, 0.15, 0], "navy", 8), U(c, "Communications_Pressure_Cabin", 1.57, 1.83, 1.79, [0, 1.16, 0], "ivory", 8);
    for (let d = 0; d < 4; d++) {
      let f = d * Math.PI / 2;
      zt(c, `Communications_Status_${d}`, [Math.sin(f) * 1.59, 1.18, Math.cos(f) * 1.59], 0.88, 0.47, f);
    }
    let h = qr(c, "Lunar_Communications_Dish", [0, 2.16, 0], 1.58);
    h.rotation.y = 0.17, ge(r, "Communications_Pressurized_Link", [-6.79, 1.04, -1.17], [-7.43, 1.04, -0.78], 1.24);
    let u = N(n, "Reserve_Store", [7.63, 0, 5.72]);
    u.userData.purpose = "\u5C45\u4F4F\u7269\u8D44\u3001\u5907\u4EF6\u4E0E\u957F\u671F\u50A8\u5907", se(u, "Sealed_Supply_Store", [0, 0, 0], 3.58, 3.3, 2.36, "cargo"), x(u, "Supply_Store_Roof", [3.13, 0.18, 2.61], [0, 2.55, -0.1], "ivory");
    for (let d of [-1.08, 1.08]) x(u, "Cargo_Locking_Strap", [0.3, 0.14, 2.9], [d, 2.67, -0.1], "yellow");
    ge(r, "Supplies_Pressurized_Link", [2.87, 1.04, 4.37], [5.9, 1.04, 5.56], 1.24);
  }
  if (i >= 3) {
    Ry(n, [-7.96, 0, 5.71]), ge(r, "Greenhouse_Pressurized_Link", [-2.89, 1.04, 4.31], [-6.14, 1.04, 5.33], 1.24), ht(r, "Greenhouse_Irrigation_Return", [[-1.22, 0.62, -0.94], [-1.94, 0.62, 0.73], [-3.17, 0.62, 0.73], [-5.14, 0.62, 4.56], [-6.13, 0.62, 4.88]], 0.095, "cyan");
    let c = N(l, "Expanded_Thermal_Radiator", [0, 2.49, -0.94]);
    c.rotation.x = -0.36, x(c, "Heat_Rejection_Frame", [2.67, 2.75, 0.22], [0, 1.38, 0], "navy"), x(c, "Radiator_Core", [2.25, 2.36, 0.07], [0, 1.39, 0.16], "blue");
    for (let h = 0; h < 5; h++) x(c, `Radiator_Pipe_${h}`, [2.3, 0.065, 0.065], [0, 0.5 + h * 0.44, 0.212], "steel", 2e-3);
    bt(l, "Radiator_Back_Stay_A", [-0.93, 2.52, 0.54], [-0.93, 4.64, -1.75], 0.16, 0.2, "steel"), bt(l, "Radiator_Back_Stay_B", [0.93, 2.52, 0.54], [0.93, 4.64, -1.75], 0.16, 0.2, "steel"), x(s, "Environmental_Controller", [0.8, 0.43, 0.65], [0.57, 5.81, 0.88], "ivory"), zt(s, "Environment_Control_Status", [0.57, 5.81, 1.24], 0.51, 0.18);
  }
  return t;
}
function fl(i, t, e, n, r, s, o, a, l) {
  let c = [];
  for (let u = 0; u <= 12; u++) {
    let d = r + (s - r) * u / 12;
    c.push([n * Math.cos(d), n * Math.sin(d)]);
  }
  for (let u = 12; u >= 0; u--) {
    let d = r + (s - r) * u / 12;
    c.push([e * Math.cos(d), e * Math.sin(d)]);
  }
  return Vt(i, t, c, o, [0, 4.65, a], l, 0.025);
}
function Cy(i) {
  let t = N(i, "Receiver_Power_Station", [6.3, 0, 3.9]);
  t.userData.label = "\u9635\u5217\u7535\u6E90\u8231", t.userData.purpose = "\u7A33\u538B\u7535\u6E90\u4E0E\u4E24\u53F0\u5C01\u95ED\u53D8\u6D41\u5668\uFF0C\u9988\u7535\u7EBF\u6CBF\u57FA\u5EA7\u5916\u4FA7\u5E03\u7F6E", Ft(t, "ConverterFoot", 4.4, 3.7);
  for (let e of [-1.02, 1.02]) {
    x(t, "ConverterCradle_" + e, [1.55, 0.47, 2.8], [e, 0.52, 0], "navy");
    let n = U(t, "ConverterHousing_" + e, 0.76, 0.76, 2.6, [e, 1.36, 0], "ivory", 10);
    n.rotation.x = Math.PI / 2;
    let r = U(t, "ConverterEnd_" + e, 0.69, 0.69, 0.2, [e, 1.36, 1.35], "navy", 10);
    r.rotation.x = Math.PI / 2, x(t, "ConverterStatus_" + e, [0.44, 0.35, 0.08], [e, 1.38, 1.49], "cyan");
    for (let s of [-0.85, 0.85]) x(t, "ConverterClamp_" + e + "_" + s, [0.22, 1.4, 0.18], [e - 0.64, 1.16, s], "yellow");
  }
  return t;
}
function Mh(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("The_EU_X_Radar");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u53CC\u5F27\u63A5\u6536\u7AD9", additions: ["\u53CC\u5F27\u9635\u5217\u3001\u5B8C\u6574\u627F\u91CD\u8F6C\u8F74\u4E0E\u9AD8\u4F4D\u63A5\u6536\u7403", "\u4FE1\u53F7\u5904\u7406\u8231", "\u7A33\u538B\u7535\u6E90\u53CA\u8FDE\u7EED\u9988\u7EBF"] }, { level: 2, label: "\u7CBE\u5BC6\u6DF1\u7A7A\u9635\u5217", additions: ["\u72EC\u7ACB\u6821\u51C6\u4FE1\u6807", "\u5F27\u9762\u9644\u52A0\u63A5\u6536\u5355\u5143", "\u63A5\u6536\u7403\u5B9A\u4F4D\u73AF"] }, { level: 3, label: "\u6708\u7403\u6DF1\u7A7A\u96F7\u8FBE", additions: ["\u5B8C\u6574\u591A\u6BB5\u63A5\u6536\u9635\u9762", "\u72EC\u7ACB\u6563\u70ED\u8BBE\u5907", "\u4FE1\u53F7\u5904\u7406\u8231\u5197\u4F59\u8BA1\u7B97\u6A21\u5757"] }], t.userData.design = ["\u5DE6\u53F3\u5F27\u9762\u5747\u8FDE\u63A5\u4E0B\u90E8\u4FEF\u4EF0\u652F\u5EA7\uFF0C\u652F\u5EA7\u901A\u8FC7\u65B9\u4F4D\u8F6C\u53F0\u843D\u5728\u63A7\u5236\u57FA\u5EA7\u4E0A\u3002", "\u9AD8\u4F4D\u63A5\u6536\u7403\u7531\u4E2D\u592E\u7ACB\u67F1\u4E0E\u673A\u68B0\u5B9A\u4F4D\u73AF\u652F\u6491\uFF0C\u6240\u6709\u8F6C\u8F74\u5904\u7559\u6709\u771F\u5B9E\u8F74\u9500\u3002", "\u6821\u51C6\u548C\u4F9B\u7535\u8BBE\u65BD\u4F4D\u4E8E\u9635\u5217\u6295\u5F71\u4E4B\u5916\uFF0C\u4FDD\u6301\u63A5\u6536\u9762\u524D\u65B9\u51C0\u7A7A\u3002"], t.userData.pivots = ["Array_Azimuth", "Array_Elevation", "Receiving_Sphere"];
  let s = N(e, "Radar_Control_Base");
  U(s, "ControlFoot", 4.25, 4.35, 0.36, [0, 0.18, 0], "navy", 8), U(s, "ControlPressureHull", 3.1, 3.85, 2.7, [0, 1.73, 0], "ivory", 8), U(s, "ControlBelt", 3.42, 3.58, 0.4, [0, 1.3, 0], "navy", 8), fe(s, "RadarEntry", [0, 0.37, 3.57], 1.4, 1.8), ce(s, "EntryRamp", 2.1, 2, 0.38, [0, 0, 3.86]);
  for (let h of [-1, 1]) zt(s, "ControlWindows_" + h, [h * 2.55, 1.72, 2.24], 1.4, 0.4, h * Math.PI / 4);
  U(s, "AzimuthBearing", 2.08, 2.45, 0.49, [0, 3.24, 0], "navy", 12);
  let o = N(e, "Array_Azimuth", [0, 3.52, 0]);
  U(o, "RotatingHead", 1.78, 2.08, 0.45, [0, 0.13, 0], "steel", 12);
  for (let h of [-1, 1]) {
    bt(o, "YokeLeg_" + h, [h * 1.2, 0.15, 0], [h * 1.48, 1.38, 0], 0.66, 0.85, "navy");
    let u = U(o, "ElevationTrunnion_" + h, 0.49, 0.49, 0.93, [h * 1.49, 1.4, 0], "navy", 12);
    u.rotation.z = Math.PI / 2;
    let d = U(o, "TrunnionCap_" + h, 0.32, 0.32, 0.13, [h * 2, 1.4, 0], "yellow", 12);
    d.rotation.z = Math.PI / 2;
  }
  let a = N(o, "Array_Elevation", [0, 1.4, 0]);
  bt(a, "CrossShaft", [-1.7, 0, 0], [1.7, 0, 0], 0.49, 0.6, "steel");
  for (let h of [-1, 1]) {
    let u = N(a, h < 0 ? "Left_Arced_Array" : "Right_Arced_Array"), d = (h < 0 ? 105 : -75) * Math.PI / 180, f = (h < 0 ? 255 : 75) * Math.PI / 180;
    fl(u, "StructuralArc", 3.65, 5, d, f, 0.86, 0, "ivory"), fl(u, "RearLoadSpine", 4.7, 5.04, d, f, 0.24, -0.55, "navy"), fl(u, "InnerReceiverBed", 3.56, 3.83, d, f, 0.24, 0.54, "navy"), fl(u, "ContinuousReceiver", 3.61, 3.73, d + 0.04, f - 0.04, 0.09, 0.7, "cyan");
    let m = h < 0 ? f : d;
    bt(u, "PivotToLobe", [h * 1.48, 0, 0], [4.3 * Math.cos(m), 4.65 + 4.3 * Math.sin(m), 0], 0.73, 0.8, "navy");
    let g = [1, 2, 3][i - 1];
    (g === 1 ? [0.5] : g === 2 ? [0.24, 0.76] : [0.12, 0.5, 0.88]).forEach((p, y) => {
      let M = d + (f - d) * p, v = N(u, "ReceivePanel_" + y, [4.32 * Math.cos(M), 4.65 + 4.32 * Math.sin(M), 0.56]);
      v.rotation.z = M - Math.PI / 2, x(v, "PanelMount", [0.76, 1.15, 0.17], [0, 0, 0], "navy"), x(v, "ReceiverTile", [0.46, 0.96, 0.055], [0, 0, 0.13], "cyan"), x(v, "ConnectorCap", [0.79, 0.24, 0.24], [0, 0.6, 0], "yellow");
    });
    for (let p of [d, f]) {
      let y = x(u, "ArcEndCap_" + p, [1.4, 0.31, 1.02], [4.325 * Math.cos(p), 4.65 + 4.325 * Math.sin(p), 0], "yellow");
      y.rotation.z = p;
    }
  }
  let l = N(a, "Receiving_Sphere", [0, 4.65, 0]);
  l.userData.purpose = "\u72EC\u7ACB\u591A\u9762\u4F53\u63A5\u6536\u7403\u4E0E\u56FA\u5B9A\u652F\u6491\u7ED3\u6784", bt(a, "ReceiverStalk", [0, 0, -0.12], [0, 2.96, -0.12], 0.4, 0.52, "steel"), Ye(l, "FacetedReceiver", 1.6, [0, 0, 0], "cyan", 1), Re(l, "ReceiverMountRing", 1.7, 0.17, [0, 0, -0.09], "navy", 6, 16);
  for (let h of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    let u = x(l, "ReceiverRetainer_" + h, [0.3, 0.48, 0.46], [Math.cos(h) * 1.69, Math.sin(h) * 1.69, 0.02], "yellow");
    u.rotation.z = h - Math.PI / 2;
  }
  if (i >= 2) {
    let h = Re(l, "AdditionalReceiverBrace", 1.64, 0.095, [0, 0, 0], "steel", 6, 20);
    h.rotation.y = Math.PI / 2;
  }
  we(o, { type: "swing", axis: "y", range: 0.095, speed: 0.13 }), we(a, { type: "swing", axis: "x", range: 0.022, speed: 0.17 });
  let c = se(n, "Signal_Processing_Cabin", [-6.9, 0, 1.95], 4.1, 3.65, 3, "utility");
  if (c.userData.purpose = "\u63A5\u6536\u4FE1\u53F7\u5904\u7406\u3001\u65F6\u949F\u540C\u6B65\u548C\u503C\u5B88", Zt(c, "ReferenceClockMast", [0, 3.25, -0.3], 1.6), ge(r, "SignalAccess", [-4.85, 1.1, 1.8], [-3.25, 1.1, 1.8], 1), Cy(n), ht(r, "StabilizedPower", [[4.5, 1.1, 3.9], [3.85, 1.1, 1.8], [2.9, 1.1, 1.8]], 0.16, "navy"), i >= 2) {
    let h = N(n, "Calibration_Beacon", [5.8, 0, -4.15]);
    h.userData.label = "\u72EC\u7ACB\u6821\u51C6\u4FE1\u6807", h.userData.purpose = "\u5DF2\u77E5\u65B9\u5411\u7684\u65F6\u949F\u4E0E\u63A5\u6536\u6821\u51C6\u6E90", U(h, "BeaconFoot", 1.5, 1.65, 0.28, [0, 0.14, 0], "navy", 8), U(h, "BeaconEnclosure", 0.7, 1.15, 1.85, [0, 1.2, 0], "ivory", 8), U(h, "BeaconEmitterBand", 0.87, 0.93, 0.24, [0, 1.58, 0], "cyan", 8), Zt(h, "CalibrationMast", [0, 2.18, 0], 1.85), ht(r, "CalibrationFeed", [[5.3, 0.6, -3.5], [4.4, 0.6, -2.4], [2.8, 0.6, -2.4]], 0.12, "navy");
  }
  if (i >= 3) {
    let h = N(n, "Receiver_Thermal_Management", [-6.65, 0, -3.4]);
    h.userData.label = "\u63A5\u6536\u7535\u5B50\u8BBE\u5907\u6563\u70ED\u7AD9", h.userData.purpose = "\u9AD8\u7075\u654F\u63A5\u6536\u4E0E\u4FE1\u53F7\u5904\u7406\u8BBE\u5907\u7684\u5C01\u95ED\u5FAA\u73AF\u6563\u70ED", Ft(h, "ThermalFoot", 4.3, 2.95), x(h, "HeatExchanger", [3.8, 1.4, 2.35], [0, 1.04, 0], "ivory");
    for (let u of [-1, 1]) ye(h, "CoolingBank_" + u, [u, 1.79, 0], 1.45, 1.85);
    ht(r, "ReceiverCoolantSupply", [[-4.76, 0.8, -3.4], [-3.1, 0.8, -2], [-2.8, 2.1, -1.5]], 0.14, "steel"), ht(r, "ProcessingCoolantReturn", [[-6.65, 0.8, -2.22], [-6.65, 0.8, 0.12]], 0.14, "steel"), x(c, "RedundantProcessorModule", [2.6, 0.73, 2.2], [0, 3.43, 0], "navy"), zt(c, "ProcessorState", [0, 3.45, 1.18], 1.98, 0.27);
  }
  return t;
}
function uf(i, t, e) {
  let n = N(i, t, e);
  n.userData.label = "\u53CC\u6A21\u5757\u80FD\u6E90\u8231", n.userData.purpose = "\u4E24\u53EA\u5C01\u95ED\u80FD\u6E90\u8C03\u7406\u6A21\u5757\u3001\u68C0\u4FEE\u53F0\u53CA\u5E76\u8054\u51FA\u7EBF\u63A5\u53E3", Ft(n, "PowerFoot", 3.9, 3.55);
  for (let r of [-0.96, 0.96]) je(n, "EnergyConditioner_" + r, [r, 0.29, 0], 0.74, 3.1, "ivory"), x(n, "EnergyBus_" + r, [0.32, 0.95, 0.45], [r, 0.8, 1], "yellow");
  return ht(n, "CommonPowerManifold", [[-0.96, 0.9, -0.8], [0, 0.9, -1.2], [0.96, 0.9, -0.8]], 0.17, "navy"), n;
}
function Sh(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("Wormhole_Generator");
  t.userData.stage = i, t.userData.stages = [{ level: 1, label: "\u57FA\u7840\u661F\u95E8", additions: ["\u5B8C\u6574\u516D\u8FB9\u5F62\u95E8\u6846\u548C\u4E09\u6839\u843D\u5730\u951A\u67F1", "\u516D\u6BB5\u5185\u73AF\u5355\u5143\u4E0E\u72EC\u7ACB\u6548\u679C\u9762", "\u4E3B\u7535\u6E90\u8231\u53CA\u63A7\u5236\u8231"] }, { level: 2, label: "\u589E\u5F3A\u661F\u95E8", additions: ["\u7B2C\u4E8C\u5EA7\u53CC\u6A21\u5757\u80FD\u6E90\u8231", "\u4E24\u4FA7\u80FD\u6E90\u8C03\u7406\u9644\u4EF6", "\u72EC\u7ACB\u5197\u4F59\u4F9B\u7535\u8DEF\u5F84"] }, { level: 3, label: "\u5B8C\u6574\u866B\u6D1E\u53D1\u751F\u5668", additions: ["\u516D\u4E2A\u5916\u73AF\u8026\u5408\u5668", "\u7A33\u5B9A\u5668\u8BBE\u5907\u8231", "\u7A33\u5B9A\u5668\u4E0E\u63A7\u5236\u8231\u7684\u95ED\u5408\u670D\u52A1\u7BA1\u8DEF"] }], t.userData.design = ["\u516D\u8FB9\u5F62\u95E8\u6846\u7531\u516D\u5757\u95ED\u5408\u5B9E\u4F53\u6784\u6210\uFF0C\u5185\u53E3\u662F\u771F\u5B9E\u51E0\u4F55\u7A7A\u6D1E\u3002", "\u4E24\u4FA7\u9AD8\u951A\u67F1\u53CA\u540E\u90E8\u4F4E\u951A\u67F1\u56FA\u5B9A\u5230\u4E09\u5904\u72EC\u7ACB\u57FA\u811A\uFF0C\u540E\u951A\u4F4D\u4E8E\u95E8\u69DB\u4E0B\u65B9\uFF0C\u8D2F\u901A\u901A\u8DEF\u4FDD\u6301\u7A7A\u95F2\u3002", "Portal_Effect \u6574\u7EC4\u53EF\u5173\u95ED\uFF1B\u6A21\u578B\u6CA1\u6709\u7528\u6574\u9762\u5B9E\u4F53\u5C01\u4F4F\u95E8\u5B54\u3002", "\u80FD\u6E90\u8231\u3001\u7A33\u5B9A\u5668\u53CA\u7EBF\u7F06\u5C5E\u4E8E\u79D1\u5E7B\u8BBE\u5907\u8BBE\u5B9A\uFF0C\u6BCF\u7EC4\u90FD\u5BF9\u5E94\u786E\u5B9A\u7684\u8BBE\u5907\u63A5\u53E3\u3002"], t.userData.effectGroups = ["Portal_Effect"], t.userData.pivots = ["Portal_Effect"];
  let s = N(e, "Hexagonal_Portal_Frame", [0, 7, 0]), o = 4.48, a = 6.08, l = (g, _) => [g * Math.cos(_), g * Math.sin(_)];
  for (let g = 0; g < 6; g++) {
    let _ = Math.PI / 2 + g * Math.PI / 3, p = _ + Math.PI / 3, y = N(s, "Portal_Segment_" + (g + 1));
    y.userData.purpose = "\u539A\u95E8\u73AF\u627F\u529B\u6BB5\u53CA\u671D\u5411\u901A\u9053\u7684\u80FD\u6E90\u6A21\u5757", Vt(y, "DarkStructuralFrame", [l(a, _), l(a, p), l(o, p), l(o, _)], 1.75, [0, 0, 0], "navy", 0.035);
    let M = 0.04;
    Vt(y, "FrontArmorPanel", [l(5.88, _ + M), l(5.88, p - M), l(5.22, p - M), l(5.22, _ + M)], 0.23, [0, 0, 0.97], "ivory", 0.035), Vt(y, "RearArmorPanel", [l(5.9, _ + M), l(5.9, p - M), l(5.25, p - M), l(5.25, _ + M)], 0.2, [0, 0, -0.98], "ivory", 0.025);
    let v = l(o + 0.12, _ + 0.07), w = l(o + 0.12, p - 0.07);
    bt(y, "InnerEmitter", [v[0], v[1], 1.02], [w[0], w[1], 1.02], 0.34, 0.28, "cyan");
    let b = l(5.25, _), A = l(6.12, _);
    bt(y, "CornerClamp", [b[0], b[1], 0], [A[0], A[1], 0], 0.59, 2, "steel");
    let C = l(6, _), T = x(y, "CornerLock", [0.67, 0.64, 2.14], [C[0], C[1], 0], "yellow");
    if (T.rotation.z = _, i >= 3 || i >= 2 && (g === 1 || g === 4)) {
      let E = l(5.5, (_ + p) / 2), L = N(y, "OuterCoupler", [E[0], E[1], -0.04]);
      L.rotation.z = (_ + p) / 2 - Math.PI / 2, x(L, "CouplerCasing", [1.4, 0.8, 2.12], [0, 0, 0], "navy"), x(L, "CouplerCap", [1.15, 0.39, 2.34], [0, 0.35, 0], "ivory"), x(L, "CouplerState", [0.91, 0.24, 0.09], [0, 0, 1.13], "cyan");
    }
  }
  for (let g of [-1, 1]) {
    let _ = N(e, "Anchor_Column_" + (g < 0 ? "Left" : "Right"), [g * 5.28, 0, 0.12]);
    _.userData.purpose = "\u661F\u95E8\u4FA7\u5411\u8F7D\u8377\u548C\u503E\u8986\u529B\u77E9\u7684\u843D\u5730\u951A\u5B9A\u67F1", Ft(_, "AnchorFoot", 3.5, 3.7), Vt(_, "AnchorShell", [[-1.52, 0.29], [1.52, 0.29], [0.76, 3.78], [0.15, 4.9], [-0.56, 4.23]], 2.75, [0, 0, 0], "ivory", 0.045), Vt(_, "AnchorInnerSpine", [[-0.63, 0.3], [0.55, 0.3], [0.25, 4.45], [-0.2, 4.3]], 2.89, [0, 0, 0], "navy", 0.025), x(_, "FoundationLock", [1.14, 0.62, 0.25], [0, 0.75, 1.55], "yellow"), zt(_, "AnchorLoadMonitor", [0, 1.5, 1.49], 0.73, 0.42);
  }
  let c = N(e, "Anchor_Column_Rear", [0, 0, -2.83]);
  c.userData.purpose = "\u95E8\u73AF\u4E0B\u7AEF\u7684\u7B2C\u4E09\u5904\u8F74\u5411\u951A\u5B9A\uFF0C\u9876\u7AEF\u4FDD\u6301\u4F4E\u4E8E\u901A\u884C\u95E8\u69DB", Ft(c, "RearAnchorFoot", 3, 2.75), U(c, "RearAnchorBody", 0.82, 1.17, 1.65, [0, 1.1, 0], "ivory", 8), bt(e, "RearAnchorLink", [0, 1.7, -2.83], [0, 1.53, -0.9], 0.71, 0.72, "navy"), U(c, "RearAnchorCap", 0.82, 0.9, 0.27, [0, 2.01, 0], "navy", 8), x(e, "PortalThreshold", [3.95, 0.29, 2.25], [0, 2.32, 0.1], "steel"), ce(e, "StarGateAccessRamp", 3.87, 5.1, 2.48, [0, 0, 1.22]);
  let h = N(e, "Portal_Effect", [0, 7, 0]);
  h.userData.purpose = "\u53EF\u72EC\u7ACB\u9690\u85CF\u7684\u79D1\u5E7B\u95E8\u5185\u89C6\u89C9\u6548\u679C\uFF1B\u4E0D\u5C5E\u4E8E\u627F\u91CD\u95E8\u6846";
  let u = new sn({ name: "AURORA_Portal_Effect", color: 5232883, emissive: 2402763, emissiveIntensity: 0.65, transparent: true, opacity: 0.3, side: on, roughness: 0.65, metalness: 0, depthWrite: false }), d = new Xt(new Ms(4.43, 6), u);
  d.name = "Portal_Effect_Panel", d.rotation.z = Math.PI / 6, d.renderOrder = 2, h.add(d);
  let f = N(h, "FieldWavefronts");
  for (let g = 0; g < 3; g++) {
    let _ = Re(f, "FieldWave_" + g, 1.02 + g * 0.82, 0.045, [0, 0, 0.1 + g * 0.015], "cyan", 5, 32, Math.PI * 1.6);
    _.rotation.z = g * Math.PI * 0.57;
  }
  we(f, { type: "spin", axis: "z", speed: 0.13 }), uf(n, "Primary_Power_Pod", [-8.68, 0, -1.35]), ht(r, "PrimaryEnergyFeed", [[-7, 0.94, -1.45], [-6.27, 0.94, -1.45], [-5.27, 2.8, -1]], 0.23, "navy");
  let m = se(n, "Portal_Control_Cabin", [8.35, 0, 3.24], 3.8, 3.45, 3.23, "control");
  if (m.userData.purpose = "\u95E8\u73AF\u8FD0\u884C\u3001\u951A\u5B9A\u76D1\u6D4B\u548C\u4EA4\u901A\u8C03\u5EA6", Zt(m, "PortalTimingMast", [0.8, 3.57, -0.85], 1.7), ge(r, "ControlAccess", [6.43, 1.28, 2.8], [5.42, 1.28, 1.72], 1.04), x(e, "ControlPassageCoupler", [1.16, 1.04, 0.38], [5.42, 1.28, 1.57], "navy"), i >= 2 && (uf(n, "Secondary_Power_Pod", [-8.66, 0, 3.92]), ht(r, "RedundantEnergyFeed", [[-6.98, 0.91, 3.55], [-6.1, 0.91, 2.25], [-5.78, 2.4, 1.45]], 0.22, "steel")), i >= 3) {
    let g = N(n, "Stabilizer_Equipment_Pod", [8.14, 0, -2.78]);
    g.userData.label = "\u95E8\u73AF\u7A33\u5B9A\u5668\u8231", g.userData.purpose = "\u53CD\u9988\u63A7\u5236\u4E0E\u80FD\u91CF\u8C03\u7406\u8BBE\u5907\u7684\u5B8C\u6574\u5C01\u95ED\u8231", Ft(g, "StabilizerFoot", 4.05, 3.6), U(g, "StabilizerHull", 1.42, 1.62, 2.35, [0, 1.46, 0], "ivory", 8), U(g, "StabilizerElectronicsBelt", 1.48, 1.48, 0.47, [0, 1.8, 0], "navy", 8), zt(g, "StabilizerState", [0, 1.85, 1.4], 1.75, 0.29), U(g, "StabilizerCap", 1.1, 1.53, 0.36, [0, 2.86, 0], "navy", 8), Zt(g, "TimingReference", [0, 3.06, 0], 1.26), ht(r, "StabilizerRingFeed", [[6.22, 1.15, -2.77], [5.56, 1.15, -2.34], [5.28, 3.6, -0.84]], 0.19, "navy"), ht(r, "StabilizerControlLink", [[8.14, 0.78, -0.98], [8.35, 0.78, 1.51]], 0.13, "steel");
  }
  return t;
}
function ml(i, t, e, n, r) {
  let s = N(i, t, e);
  s.userData.floating = true, Ft(s, "ServicePlatform", n, r, [0, -0.28, 0], 0.4), x(s, "PlatformKeel", [n * 0.77, 0.59, r * 0.79], [0, -0.52, 0], "navy"), eo(s, "Local_Hover_Unit", [0, -0.84, 0], 1.02);
  for (let o of [-1, 1]) x(s, "EdgeGuard_" + o, [0.16, 0.25, r - 0.24], [o * (n / 2 - 0.13), 0.22, 0], "yellow");
  return s;
}
function pl(i, t, e, n) {
  let r = N(i, t);
  r.userData.purpose = "\u4ECE\u4FA7\u8237\u88C5\u914D\u5E73\u53F0\u76F4\u8FBE\u5C0F\u578B\u6D6E\u53F0\u7684\u77ED\u521A\u6027\u6865\u4E0E\u8FDE\u63A5\u7BA1\u7EBF";
  let s = e * 8.86, o = e * 10.95;
  bt(r, "BridgeDeck", [s, -0.06, n], [o, -0.06, n], 0.4, 1.1, "navy"), bt(r, "WalkSurface", [s, 0.17, n], [o, 0.17, n], 0.12, 0.83, "steel");
  for (let a of [-0.48, 0.48]) ht(r, "RigidUtilityLine_" + a, [[s, 0.4, n + a], [o, 0.4, n + a]], 0.14, a < 0 ? "yellow" : "cyan");
  return r;
}
function Py(i) {
  let t = ml(i, "Component_Storage_Pod", [-13, 0, -4.6], 4.9, 4.6);
  t.userData.label = "\u6D6E\u7A7A\u90E8\u4EF6\u4ED3", t.userData.purpose = "\u5E26\u72EC\u7ACB\u60AC\u6D6E\u88C5\u7F6E\u7684\u58F3\u677F\u4E0E\u6A21\u5757\u5E93\uFF0C\u6B63\u9762\u53EF\u88C5\u5378", x(t, "StoreBack", [4.3, 2.49, 0.33], [0, 1.365, -1.95], "navy");
  for (let e of [-1, 1]) x(t, "StoreSide_" + e, [0.3, 2.49, 3.8], [e * 2, 1.365, -0.07], "ivory");
  x(t, "StoreCanopy", [4.8, 0.4, 4.4], [0, 2.81, 0], "ivory"), zt(t, "PartsInventoryStatus", [0, 2.54, 2.05], 3.6, 0.3);
  for (let e of [[-1, 0.62, 0.05], [0.55, 0.62, 0.6], [0.55, 1.6, 0.6]]) x(t, "StoredAssemblyModule_" + e.join("_"), [1.35, 0.98, 1.4], e, e[0] < 0 ? "steel" : "yellow"), x(t, "CrateBelt_" + e.join("_"), [0.15, 1.03, 1.44], [e[0], e[1], e[2]], "navy");
  return t;
}
function Iy(i) {
  let t = ml(i, "Engine_Assembly_Pod", [-13, 0, 5.65], 4.9, 5.3);
  t.userData.label = "\u6D6E\u7A7A\u52A8\u529B\u88C5\u914D\u8231", t.userData.purpose = "\u5E26\u4E13\u7528\u673A\u68B0\u6258\u67B6\u7684\u53D1\u52A8\u673A\u88C5\u914D\u53F0\uFF0C\u91CD\u578B\u5DE5\u4EF6\u7559\u5728\u5E73\u53F0\u8303\u56F4\u5185";
  for (let o of [-1.5, 1.5]) {
    x(t, "EngineCradleBase_" + o, [3.4, 0.3, 0.45], [0, 0.28, o], "yellow");
    for (let a of [-0.95, 0.95]) x(t, "EngineCradleCheek_" + o + "_" + a, [0.4, 0.95, 0.45], [a, 0.75, o], "yellow");
  }
  let e = N(t, "Engine_Module", [0, 1.61, 0]), n = U(e, "EngineCasing", 1.04, 1.04, 3.85, [0, 0, 0], "ivory", 12);
  n.rotation.x = Math.PI / 2;
  for (let o of [-1.5, 0.6, 1.5]) {
    let a = U(e, "EngineClamp_" + o, 1.12, 1.12, 0.24, [0, 0, o], "navy", 12);
    a.rotation.x = Math.PI / 2;
  }
  let r = U(e, "EngineNozzle", 0.56, 0.78, 0.53, [0, 0, 2.13], "navy", 12);
  r.rotation.x = -Math.PI / 2;
  let s = U(e, "NozzleThroat", 0.32, 0.32, 0.04, [0, 0, 2.43], "dark", 12);
  return s.rotation.x = Math.PI / 2, x(t, "EngineTestConsole", [3.6, 0.93, 0.65], [0, 0.65, 2.2], "ivory"), zt(t, "EngineTestStatus", [0, 0.83, 2.56], 2.65, 0.27), t;
}
function Dy(i) {
  let t = ml(i, "Traffic_Control_Pod", [13, 0, -4.5], 4.3, 4.25);
  return t.userData.label = "\u6D6E\u7A7A\u8C03\u5EA6\u8231", t.userData.purpose = "\u89C2\u5BDF\u524D\u65B9\u8FDB\u51FA\u575E\u65B9\u5411\u7684\u9AD8\u4F4D\u8C03\u5EA6\u5BA4", U(t, "TowerShaft", 1, 1.42, 3.05, [0, 1.645, 0], "ivory", 8), U(t, "ObservationCabin", 1.65, 1.52, 0.72, [0, 3.4, 0], "navy", 8), zt(t, "ObservationFront", [0, 3.43, 1.54], 2.1, 0.4), zt(t, "ObservationSide", [1.54, 3.43, 0], 2.1, 0.4, Math.PI / 2), U(t, "CabinRoof", 1.45, 1.76, 0.34, [0, 3.99, 0], "ivory", 8), Zt(t, "ControlAntenna", [0, 4.18, -0.2], 1.5), x(t, "TowerAccess", [1, 1.61, 0.23], [0, 1.04, 1.23], "navy"), x(t, "TowerDoorStatus", [0.61, 0.2, 0.06], [0, 1.4, 1.38], "cyan"), t;
}
function Ly(i) {
  let t = ml(i, "Repair_Canopy_Pod", [13, 0, 5.7], 4.7, 4.6);
  t.userData.label = "\u6D6E\u7A7A\u7EF4\u4FEE\u68DA", t.userData.purpose = "\u5E26\u9876\u68DA\u7684\u673A\u68B0\u81C2\u5DE5\u5177\u548C\u5939\u5177\u7EF4\u4FEE\u53F0", x(t, "RepairToolWall", [4, 2.43, 0.3], [0, 1.335, -1.9], "navy");
  for (let e of [-1, 1]) x(t, "RepairRoofPillar_" + e, [0.22, 2.49, 0.24], [e * 1.88, 1.37, 1.6], "steel");
  Vt(t, "RepairRoof", [[-2.4, 0], [2.4, 0], [1.95, 0.52], [-1.95, 0.52]], 4.5, [0, 2.59, 0], "ivory"), x(t, "RepairBench", [3.2, 0.73, 1.14], [0, 0.62, -0.8], "steel");
  for (let e of [-0.86, 0.7]) x(t, "StoredToolHead_" + e, [1.05, 0.83, 0.94], [e, 1.41, -0.8], "yellow");
  return x(t, "ClampStorage", [1.38, 0.67, 1.12], [0.95, 0.49, 1], "navy"), t;
}
function Fy(i) {
  let t = N(i, "Iron_Behemoth_under_construction");
  t.userData.label = "\u534A\u6210\u54C1\u6DF1\u7A7A\u541E\u566C\u8005", t.userData.purpose = "\u5728\u5EFA\u8230\u8239\u5DE5\u4EF6\uFF0C\u72EC\u7ACB\u4E8E\u5B8C\u6574\u8239\u575E\uFF1B\u4E0D\u66FF\u6362\u5DF2\u6709\u6210\u54C1\u8230\u8239", t.userData.identity = "BROAD_FRONT_NARROW_REAR_WIDELY_SPACED_FORWARD_PRONGS";
  let e = N(t, "Carrier_Keel_And_Ribs");
  bt(e, "CentralKeel", [0, 1.72, -8], [0, 1.72, 6.6], 0.72, 0.9, "navy");
  for (let s of [-1, 1]) bt(e, "ShoulderLongeron_" + s, [s * 0.77, 1.79, -7.65], [s * 4.85, 1.79, 6.4], 0.39, 0.46, "navy"), bt(e, "LowerLongeron_" + s, [s * 0.77, 1.01, -7.65], [s * 4.85, 1.01, 6.4], 0.28, 0.38, "steel");
  bt(e, "BroadFrontBulkhead", [-4.85, 1.61, 6.4], [4.85, 1.61, 6.4], 0.85, 0.96, "navy");
  for (let s = 0; s < 7; s++) {
    let o = -5.8 + s * 1.85, a = 0.77 + (o + 7.65) / 14.05 * 4.08, l = N(e, "StructuralRib_" + (s + 1));
    bt(l, "UpperCrossMember", [-a, 1.98, o], [a, 1.98, o], 0.25, 0.32, "steel"), bt(l, "LowerCrossMember", [-a, 0.98, o], [a, 0.98, o], 0.22, 0.28, "navy");
    for (let c of [-a, a]) bt(l, "WebPost_" + c, [c, 0.98, o], [c, 1.98, o], 0.27, 0.3, "navy");
    s > 0 && bt(l, "ExposedRightDiagonal", [0.26, 1.97, o - 1.65], [a, 1.97, o], 0.2, 0.26, "navy");
  }
  let n = N(t, "Installed_Left_Armor");
  fi(n, "LeftShoulderUnderframe", [[-0.68, -7.4], [-1.42, -5.3], [-4.87, 6.35], [-0.65, 6.35]], 0.38, [0, 1.88, 0], "navy"), fi(n, "LeftShoulderArmor", [[-0.73, -7.16], [-1.35, -5.27], [-4.64, 6.08], [-0.71, 6.08]], 0.4, [0, 2.26, 0], "ivory"), fi(n, "PortArmorOverlay", [[-1.11, -3.86], [-2.12, -0.8], [-3.48, 4.9], [-1.1, 4.9]], 0.11, [0, 2.7, 0], "white"), ye(n, "PortThermalVent", [-2.46, 2.87, 3.08], 1.24, 2.38);
  for (let s of [-1, 1]) {
    let o = N(t, s < 0 ? "Forward_Port_Prong" : "Forward_Starboard_Prong");
    fi(o, "ProngStructuralBody", [[s * 4.15, 5.9], [s * 5.17, 5.9], [s * 5.13, 11.8], [s * 4.47, 12.2]], 0.82, [0, 1.28, 0], "navy"), fi(o, "ProngArmor", [[s * 4.31, 6.08], [s * 5.03, 6.08], [s * 4.99, 11.62], [s * 4.56, 11.89]], 0.34, [0, 2.1, 0], "ivory"), x(o, "ProngTipSensor", [0.39, 0.2, 0.08], [s * 4.79, 1.72, 12.15], "cyan");
  }
  let r = N(t, "Narrow_Aft_Command_Spine", [0, 2.04, -5.45]);
  x(r, "CommandSpine", [1.05, 0.78, 3.65], [0, 0.44, 0], "navy"), x(r, "PartialCommandHousing", [1.62, 0.82, 1.35], [0, 1.04, -1.08], "steel"), zt(r, "CommandWindows", [0, 1.08, -0.37], 1.18, 0.24);
  for (let s of [-0.75, 0.75]) {
    let o = N(t, "InstalledAftEngine_" + s, [s, 1.64, -8.07]), a = U(o, "EngineCasing", 0.44, 0.44, 1.67, [0, 0, 0], "steel", 10);
    a.rotation.x = Math.PI / 2;
    let l = U(o, "EngineNozzle", 0.33, 0.46, 0.32, [0, 0, -0.95], "navy", 10);
    l.rotation.x = Math.PI / 2;
    let c = U(o, "NozzleThroat", 0.23, 0.23, 0.04, [0, 0, -1.13], "dark", 10);
    c.rotation.x = Math.PI / 2;
  }
  for (let s of [-1.25, 1.25]) x(t, "FrontHangarFrame_" + s, [1.84, 0.97, 0.39], [s, 1.53, 6.75], "steel"), x(t, "FrontHangarOpening_" + s, [1.38, 0.61, 0.08], [s, 1.55, 6.99], "dark"), x(t, "HangarNavigationStrip_" + s, [1.07, 0.12, 0.06], [s, 1.94, 7.05], "cyan");
  return t;
}
function bh(i = 3) {
  i = Math.max(1, Math.min(3, Math.trunc(i)));
  let { root: t, main: e, support: n, links: r } = he("Flagship_Center");
  t.userData.stage = i, t.userData.origin = "floating_platform_assembly_center", t.userData.platformY = 0, t.userData.groundReferenceY = -5.5, t.userData.hoverBaseline = 5.5, t.userData.groundClearance = 2.4686, t.userData.hideableGroups = ["Iron_Behemoth_under_construction"], t.userData.stages = [{ level: 1, label: "\u8FD0\u8425\u91CD\u578B\u8239\u575E", additions: ["\u53CC\u4FA7\u5B8C\u6574\u6D6E\u7A7A\u5E73\u53F0\u3001\u540E\u90E8\u6307\u6325\u6865\u4E0E\u4E24\u90E8\u88C5\u914D\u81C2", "\u90E8\u4EF6\u4ED3\u4E0E\u8C03\u5EA6\u6D6E\u53F0", "\u53EF\u72EC\u7ACB\u9690\u85CF\u7684\u5728\u5EFA\u6DF1\u7A7A\u541E\u566C\u8005"] }, { level: 2, label: "\u6269\u5C55\u88C5\u914D\u8239\u575E", additions: ["\u6D6E\u7A7A\u52A8\u529B\u88C5\u914D\u8231", "\u7B2C\u4E09\u90E8\u88C5\u914D\u81C2\u53CA\u5F85\u88C5\u58F3\u677F", "\u53D1\u52A8\u673A\u8FD0\u8F93\u8FDE\u63A5\u6865"] }, { level: 3, label: "\u5B8C\u6574\u65D7\u8230\u4E2D\u5FC3", additions: ["\u7B2C\u56DB\u5EA7\u6D6E\u7A7A\u670D\u52A1\u5E73\u53F0\u4E0E\u7EF4\u4FEE\u68DA", "\u9644\u52A0\u7CBE\u5BC6\u88C5\u914D\u81C2", "\u5B8C\u6574\u5E73\u53F0\u914D\u7535\u53CA\u5DE5\u5177\u670D\u52A1\u8BBE\u5907"] }], t.userData.design = ["\u4E24\u6761\u7EB5\u5411\u88C5\u914D\u5E73\u53F0\u5404\u6709\u4E24\u53F0\u5E95\u90E8\u60AC\u6D6E\u88C5\u7F6E\uFF0C\u540E\u90E8\u901A\u8FC7\u9AD8\u4F4D\u6307\u6325\u6865\u8FDE\u63A5\uFF1B\u4E2D\u592E\u6CA1\u6709\u627F\u6258\u8230\u8239\u7684\u5730\u677F\u3002", "\u6240\u6709\u4FA7\u9762\u670D\u52A1\u5E73\u53F0\u5747\u6709\u81EA\u5DF1\u7684\u60AC\u6D6E\u652F\u6491\uFF0C\u901A\u8FC7\u77ED\u521A\u6027\u6865\u4F9D\u9644\u4E3B\u5E73\u53F0\u3002", "\u5728\u5EFA\u8230\u8239\u5BBD\u524D\u7A84\u540E\uFF0C\u53CC\u53C9\u4F4D\u4E8E +Z \u524D\u7AEF\u5E76\u76F8\u8DDD\u8F83\u5BBD\uFF1B\u5DE6\u80A9\u5B89\u88C5\u88C5\u7532\uFF0C\u53F3\u4FA7\u88F8\u9732\u4E03\u9053\u7ED3\u6784\u808B\u3002", "\u4E09\u4E2A\u7B49\u7EA7\u4E2D\u7684\u8239\u575E\u8BBE\u65BD\u5747\u5B8C\u6574\u53EF\u8FD0\u884C\uFF1B\u672A\u5B8C\u6210\u90E8\u5206\u4EC5\u5C5E\u4E8E\u72EC\u7ACB\u5728\u5EFA\u8230\u8239\u5DE5\u4EF6\u3002"], t.userData.pivots = ["Port_Assembly_Arm", "Starboard_Assembly_Arm", "Plate_Installation_Arm", "Precision_Assembly_Arm"];
  for (let l of [-1, 1]) {
    let c = N(e, l < 0 ? "Port_Service_Pontoon" : "Starboard_Service_Pontoon", [l * 7.38, 0, 0]);
    c.userData.purpose = "\u5C01\u95ED\u670D\u52A1\u8231\u7EC4\u6210\u7684\u7EB5\u5411\u6D6E\u7A7A\u88C5\u914D\u5E73\u53F0";
    let h = [[-1.53, -12], [1.53, -12], [1.66, -10.2], [1.54, 10.6], [0.91, 13.2], [-0.91, 13.2], [-1.54, 10.6], [-1.66, -10.2]];
    fi(c, "PontoonLoadHull", h, 1.75, [0, -1.55, 0], "navy", 0.055), fi(c, "PontoonArmorDeck", h, 0.45, [0, 0.2, 0], "ivory", 0.05);
    for (let d of [-7.8, 7.8]) eo(c, "Main_Hover_" + d, [0, -1.58, d], 1.18);
    for (let d of [-8.8, -2.6, 3.7, 10.1]) x(c, "StructuralCollar_" + d, [3.25, 0.33, 0.42], [0, 0.37, d], "steel"), x(c, "ServiceHatch_" + d, [0.82, 0.16, 1.45], [0, 0.76, d + 0.9], "navy"), x(c, "PowerTap_" + d, [0.7, 0.2, 0.74], [l * 0.89, 0.8, d + 0.76], "yellow");
    x(c, "FrontPontoonBumper", [1.82, 0.63, 0.49], [0, -0.32, 12.76], "navy"), x(c, "PontoonNavigationPanel", [1.31, 0.24, 0.07], [0, -0.47, 13.03], "cyan"), x(c, "SideEnergyBelt", [0.08, 0.26, 18.9], [l * 1.64, -0.82, -0.2], "cyan", 0.01);
    let u = N(c, "RearCommandAccess", [0, 0.67, -10.4]);
    Vt(u, "AccessElevator", [[-1.2, 0], [1.2, 0], [0.82, 3.1], [-0.82, 3.1]], 2.55, [0, 0, 0], "ivory"), x(u, "AccessShaftSpine", [0.74, 2.6, 2.7], [0, 1.4, 0], "navy");
  }
  let s = N(e, "Raised_Rear_Command_Bridge", [0, 3.3, -10.45]);
  s.userData.purpose = "\u8DE8\u63A5\u4E24\u4FA7\u5B8C\u6574\u5347\u964D\u901A\u9053\u7684\u5C01\u95ED\u6307\u6325\u6865\uFF0C\u4F4D\u4E8E\u8230\u5C3E\u4E0A\u65B9", x(s, "BridgeLoadGirder", [14.9, 0.63, 2.5], [0, -0.25, 0], "navy"), x(s, "BridgePressureCabin", [9.8, 1.52, 2.7], [0, 0.7, 0], "ivory"), zt(s, "CommandBridgeFront", [0, 0.74, 1.42], 8.8, 0.62), x(s, "BridgeRoof", [10.5, 0.33, 2.95], [0, 1.65, 0], "ivory");
  for (let l of [-1, 1]) x(s, "SidePressurePassage_" + l, [2.6, 1.24, 1.77], [l * 6.05, 0.39, 0], "navy"), x(s, "BridgeCoupler_" + l, [0.46, 1.3, 1.9], [l * 5.25, 0.39, 0], "yellow"), Zt(s, "BridgeComms_" + l, [l * 3.7, 1.84, -0.4], 1.5);
  let o = Qn(e, "Port_Assembly_Arm", [-6.53, 0.69, 1.5], 1.18, Math.PI / 2), a = Qn(e, "Starboard_Assembly_Arm", [6.53, 0.69, -2.6], 1.26, -Math.PI / 2);
  if (o.userData.purpose = "\u4E3B\u5E73\u53F0\u4E0A\u4F38\u5411\u8230\u4F53\u7684\u673A\u68B0\u88C5\u914D\u81C2", a.userData.purpose = "\u53EF\u8FBE\u88F8\u9732\u808B\u67B6\u7684\u673A\u68B0\u88C5\u914D\u81C2", Py(n), Dy(n), pl(r, "Component_Store_Bridge", -1, -4.6), pl(r, "Traffic_Control_Bridge", 1, -4.5), i >= 2) {
    Iy(n), pl(r, "Engine_Assembly_Bridge", -1, 5.65);
    let c = Qn(e, "Plate_Installation_Arm", [6.54, 0.69, 5], 1.11, -Math.PI / 2).getObjectByName("Wrist"), h = N(c, "Pending_Hull_Armor_Panel", [0, -0.74, 0.62]);
    h.userData.purpose = "\u5939\u6301\u5728\u5B89\u88C5\u673A\u68B0\u81C2\u4E0A\u7684\u72EC\u7ACB\u5F85\u88C5\u8230\u4F53\u58F3\u677F", x(h, "ArmorPlate", [1.82, 0.2, 1.46], [0, 0, 0], "ivory"), x(h, "PlateBackframe", [1.47, 0.16, 1.11], [0, -0.17, 0], "navy");
  }
  if (i >= 3) {
    Ly(n), pl(r, "Repair_Canopy_Bridge", 1, 5.7), Qn(e, "Precision_Assembly_Arm", [-6.52, 0.69, -5.8], 0.78, Math.PI / 2);
    for (let l of [-1, 1]) {
      let c = N(e, "PontoonServiceCabinet_" + l, [l * 7.35, 0.66, 8]);
      x(c, "CabinetShell", [1.08, 1.15, 1.2], [0, 0.58, 0], "navy"), x(c, "CabinetDoor", [0.84, 0.88, 0.08], [0, 0.59, 0.65], "ivory"), x(c, "CabinetStatus", [0.55, 0.16, 0.04], [0, 0.8, 0.71], "cyan");
    }
  }
  return Fy(t), t;
}
var Eh = { Command_Center: eh, Research_Lab: nh, Metal_Mine: ih, Crystal_Mine: rh, Gas_Mine: oh, Solar_Plant: ah, Fusion_Reactor: lh, Robotics_Facility: hh, Nanite_Factory: uh, Radar_Facility: dh, Alliance_Depot: ph, Shipyard: mh, Missile_Silo: _h, Terraformer: yh, Moon_Base: xh, The_EU_X_Radar: Mh, Wormhole_Generator: Sh, Flagship_Center: bh };
function wh(i, t = 3) {
  if (!Eh[i]) throw new Error("Unknown model: " + i);
  t = Math.min(3, Math.max(1, Math.round(t)));
  let e = Eh[i](t);
  if (!e?.isObject3D) throw new Error(i + " did not return an Object3D");
  e.name = i, e.userData.id = i, e.userData.stage = t;
  let n = e.userData.platformY || 0;
  if (n && Number.isFinite(n)) {
    for (let s of e.children) s.position.y -= n;
    e.userData.groundReferenceY = (e.userData.groundY || 0) - n, e.userData.sourcePlatformY = n, e.userData.platformY = 0, e.userData.origin = "main_assembly_platform_center";
  }
  e.userData.groundReferenceY ??= 0, e.userData.coordinateSystem = "Y_UP_FRONT_POSITIVE_Z", e.userData.completeOperationalFacility = true;
  let r = /* @__PURE__ */ new Map();
  return e.traverse((s) => {
    let o = s.name || "Part", a = r.get(o) || 0;
    if (r.set(o, a + 1), a && (s.userData.originalName = o, s.name = o + "_" + String(a + 1).padStart(2, "0")), s.isMesh) {
      let l = Array.isArray(s.material) ? s.material : [s.material];
      s.castShadow = !l.some((c) => c.transparent && c.opacity < 0.6), s.receiveShadow = true;
    }
  }), e.updateMatrixWorld(true), e;
}
function df(i) {
  let t = [];
  return i.traverse((e) => {
    e.userData.motion && t.push({ node: e, data: e.userData.motion, rotation: e.rotation.clone(), position: e.position.clone() });
  }), t;
}
function Uy(i, t) {
  let e = i.speed ?? 0.3;
  return i.type === "spin" ? e * t : (i.range ?? 0.1) * Math.sin(t * e + (i.phase ?? 0));
}
function ff(i, t) {
  for (let { node: e, data: n, rotation: r, position: s } of i) {
    let o = n.axis || "y", a = Uy(n, t);
    n.type === "slide" ? (e.position.copy(s), e.position[o] += a) : (e.rotation.copy(r), e.rotation[o] += a);
  }
}
var gl = [{ number: 1, id: "Command_Center", name: "\u4E3B\u57FA\u5730", signature: "\u5927\u7A79\u9876\uFF0B\u56DB\u7247\u6954\u5F62\u652F\u6491\u7FFC" }, { number: 2, id: "Research_Lab", name: "\u7814\u7A76\u5B9E\u9A8C\u5BA4", signature: "\u503E\u659C\u5B9E\u9A8C\u5706\u73AF\uFF0B\u60AC\u6D6E\u5B9E\u9A8C\u7403" }, { number: 3, id: "Metal_Mine", name: "\u91D1\u5C5E\u5F00\u91C7\u7EFC\u5408\u4F53", signature: "\u9EC4\u8272\u5927\u94BB\u81C2\uFF0B\u7C97\u58EE\u7834\u788E\u6599\u6597" }, { number: 4, id: "Crystal_Mine", name: "\u6676\u4F53\u5F00\u91C7\u7EFC\u5408\u4F53", signature: "\u5DE8\u578B\u7D2B\u6676\uFF0B\u4E09\u722A\u91C7\u96C6\u67B6" }, { number: 5, id: "Gas_Mine", name: "\u6C14\u4F53\u5F00\u91C7\u7EFC\u5408\u4F53", signature: "\u5927\u8FDB\u6C14\u6DA1\u8F6E\uFF0B\u4E09\u8054\u50A8\u6C14\u7F50" }, { number: 6, id: "Solar_Plant", name: "\u592A\u9633\u80FD\u8BBE\u65BD", signature: "\u56DB\u7247\u5927\u592A\u9633\u80FD\u7FFC\uFF0B\u4E2D\u592E\u80FD\u6E90\u8231" }, { number: 7, id: "Fusion_Reactor", name: "\u805A\u53D8\u80FD\u6E90\u8BBE\u65BD", signature: "\u7C97\u5706\u73AF\u53CD\u5E94\u5806\uFF0B\u4E09\u7247\u6563\u70ED\u7FFC" }, { number: 8, id: "Robotics_Facility", name: "\u673A\u5668\u4EBA\u5DE5\u5382", signature: "\u655E\u53E3\u88C5\u914D\u5927\u5385\uFF0B\u4E24\u53EA\u5927\u673A\u68B0\u81C2" }, { number: 9, id: "Nanite_Factory", name: "\u7EB3\u7C73\u5DE5\u5382", signature: "\u900F\u660E\u516D\u9762\u5236\u9020\u8231\uFF0B\u60AC\u6D6E\u6676\u5706" }, { number: 10, id: "Radar_Facility", name: "\u96F7\u8FBE\u8BBE\u65BD", signature: "\u5355\u5EA7\u5927\u96F7\u8FBE\u789F\uFF0B\u6954\u5F62\u6570\u636E\u8231" }, { number: 11, id: "Alliance_Depot", name: "\u8054\u76DF\u4ED3\u5E93", signature: "\u5927\u62F1\u5F62\u8D27\u4ED3\uFF0B\u5355\u5EA7\u95E8\u5F0F\u540A\u673A" }, { number: 12, id: "Shipyard", name: "\u592A\u7A7A\u7535\u68AF\u4E0E\u8F68\u9053\u8239\u575E", signature: "\u7C97\u58EE\u7535\u68AF\u57FA\u5EA7\uFF0B\u53CC\u7F06\uFF0B\u5341\u5B57\u8239\u575E" }, { number: 13, id: "Missile_Silo", name: "\u884C\u661F\u4FDD\u969C\u4E2D\u5FC3", signature: "\u76FE\u5F62\u7EF4\u4FEE\u5E93\uFF0B\u6551\u63F4\u540A\u81C2" }, { number: 14, id: "Terraformer", name: "\u5730\u5F62\u6539\u9020\u5668", signature: "\u900F\u660E\u751F\u6001\u7A79\u9876\uFF0B\u4E09\u679A\u6C14\u5019\u53F6\u7247" }, { number: 15, id: "Moon_Base", name: "\u6708\u7403\u57FA\u5730", signature: "\u4E09\u74E3\u5BC6\u95ED\u5C45\u4F4F\u8231\uFF0B\u4E2D\u592E\u6C14\u95F8" }, { number: 16, id: "The_EU_X_Radar", name: "\u6708\u7403\u96F7\u8FBE", signature: "\u53CC\u5F27\u6DF1\u7A7A\u9635\u5217\uFF0B\u9AD8\u4F4D\u63A5\u6536\u7403" }, { number: 17, id: "Wormhole_Generator", name: "\u866B\u6D1E\u53D1\u751F\u5668", signature: "\u7C97\u516D\u8FB9\u5F62\u661F\u95E8\uFF0B\u4E09\u6839\u951A\u5B9A\u67F1" }, { number: 18, id: "Flagship_Center", name: "\u65D7\u8230\u4E2D\u5FC3", signature: "\u6D6E\u7A7A\u91CD\u578B\u8239\u575E\uFF0B\u534A\u6210\u54C1\u6DF1\u7A7A\u541E\u566C\u8005" }];

// Lunar stores reuse the supplied mine storage modules, with their own game IDs.
for (const [id, owner] of Object.entries({Metal_Storage:'Metal_Mine',Crystal_Storage:'Crystal_Mine',Gas_Storage:'Gas_Mine'})) {
  Eh[id] = stage => {
    const full=wh(owner,stage),part=full.getObjectByName(id);
    part.removeFromParent();part.position.set(0,0,0);part.updateMatrixWorld(true);
    const box=new rn().setFromObject(part),center=box.getCenter(new P());
    part.position.set(-center.x,-box.min.y,-center.z);
    const root=new Ne();root.add(part);root.userData={groundReferenceY:0,stage};
    const shared=new Set(th.values()),unused=new Set();full.traverse(o=>{if(o.geometry&&!shared.has(o.geometry))unused.add(o.geometry)});unused.forEach(g=>g.dispose());
    return root;
  };
  gl.push({id,name:id,number:gl.length+1,signature:'original-storage-module'});
}

var pi = 1.4, Ah = new P(0, 1, 0), gf = "aurora-placement-1", pf = new Map(gl.map((i) => [i.id, i])), Th = /* @__PURE__ */ new Map(), no = { ivory: 14804183, white: 15594204, navy: 4612727, dark: 2242381, steel: 4938083, rubber: 1516853, cyan: 5827539, blue: 2189193, yellow: 16760147, amber: 13728041, purple: 10570976, crystal: 14788351, green: 6858597, leaf: 3045454, glass: 2189193, ore: 4938083 };
function _l(i) {
  let t = 2166136261;
  for (let e of String(i)) t = Math.imul(t ^ e.charCodeAt(0), 16777619);
  return t >>> 0;
}
function mf(i) {
  let t = i >>> 0;
  return () => {
    t += 1831565813;
    let e = Math.imul(t ^ t >>> 15, 1 | t);
    return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
  };
}
var By = (i) => i.map((t) => Math.round(t * 1e4)).join(",");
function Oy(i, t, e) {
  let n = i.geometry, r = n.attributes.position;
  if (!r) return null;
  let s = Array.from({ length: r.count }, (p, y) => new P().fromBufferAttribute(r, y).applyMatrix4(t)), o = new rn().setFromPoints(s), a = o.getSize(new P());
  if (o.min.y < e - 0.21 || o.min.y > e + 0.17 || a.y > 1.05 || a.x * a.z < 0.35 || /OreMass|SatelliteCrystal|PrimaryPurpleCrystal|Hydroponic|Tree|Growing|Marker|Rail|Louver|Slat/.test(i.name)) return null;
  let l = [], c = [], h = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = (p) => {
    let y = By(p.toArray());
    return h.has(y) || (h.set(y, l.length), l.push(p.toArray())), h.get(y);
  }, f = n.index, m = f ? f.count : r.count;
  for (let p = 0; p < m; p += 3) {
    let y = [0, 1, 2].map((v) => s[f ? f.getX(p + v) : p + v]);
    if (!y.every((v) => Math.abs(v.y - o.min.y) < 2e-3)) continue;
    let M = y.map(d);
    if (new Set(M).size === 3) {
      c.push(M);
      for (let v = 0; v < 3; v++) {
        let w = M[v], b = M[(v + 1) % 3], A = [Math.min(w, b), Math.max(w, b)].join(":");
        u.has(A) ? u.get(A).count++ : u.set(A, { a: w, b, count: 1 });
      }
    }
  }
  if (!c.length) return null;
  let g = o.getCenter(new P());
  g.y = o.min.y;
  let _ = [...u.values()].filter((p) => p.count === 1).map(({ a: p, b: y }) => [p, y]);
  return _.length ? { name: i.name, vertices: l, triangles: c, boundary: _, center: g.toArray(), min: o.min.toArray(), max: o.max.toArray(), radius: Math.max(...l.map((p) => Math.hypot(p[0] - g.x, p[2] - g.z))) } : null;
}
function _f(i, t = 0) {
  i.updateMatrixWorld(true);
  let e = i.matrixWorld.clone().invert(), n = [];
  return i.traverse((r) => {
    if (!r.isMesh || !r.visible) return;
    let s = r;
    for (; s && s !== i; ) {
      if (!s.visible) return;
      s = s.parent;
    }
    let o = Oy(r, e.clone().multiply(r.matrixWorld), t);
    o && n.push(o);
  }), n;
}
function yl(i) {
  if (Th.has(i)) return Th.get(i);
  let t = wh(i, 3), e = new rn().setFromObject(t), n = _f(t, i === "Gas_Mine" ? 0 : t.userData.groundReferenceY || 0), r = Math.max(Math.abs(e.min.x), Math.abs(e.max.x), Math.abs(e.min.z), Math.abs(e.max.z)), s = n.map((a) => a.center.slice());
  for (let a of n) {
    let l = Math.max(1, Math.ceil(a.vertices.length / 4));
    for (let c = 0; c < a.vertices.length; c += l) s.push(a.vertices[c]);
  }
  if (!s.length) for (let a of [-r * 0.55, 0, r * 0.55]) for (let l of [-r * 0.55, 0, r * 0.55]) s.push([a, 0, l]);
  let o = { radius: r, contacts: n, probePoints: s, groundReferenceY: t.userData.groundReferenceY || 0 };
  const shared=new Set(th.values()),discarded=new Set();t.traverse(n=>{if(n.geometry&&!shared.has(n.geometry))discarded.add(n.geometry)});discarded.forEach(g=>g.dispose());return Th.set(i, o), o;
}
function zy(i, t) {
  return new hn().setFromUnitVectors(Ah, i).multiply(new hn().setFromAxisAngle(Ah, t));
}
function yf(i, t, e, n) {
  let r = new P(1, 0, 0).applyQuaternion(e), s = new P(0, 0, 1).applyQuaternion(e);
  return (o, a, l = 2) => {
    let c = r.clone().multiplyScalar(o * pi).addScaledVector(s, a * pi), h = c.lengthSq(), u = n, d, f;
    for (let m = 0; m < l; m++) f = c.clone().addScaledVector(t, u).normalize(), d = i.sample(f.x, f.y, f.z), u = Math.sqrt(Math.max(1, (i.radius + d.height) ** 2 - h));
    return { y: (u - n) / pi, sample: d, direction: f };
  };
}
function ky(i) {
  return i !== "moon" ? gl.slice(0, 14).map((t) => ({ id: t.id, instanceKey: t.id })) : [0, 1].flatMap((t) => gl.slice(14).map((e) => ({ id: e.id, instanceKey: `${e.id}:${t + 1}` })));
}
function Hy(i, t) {
  let n = mf(_l(`${gf}|${i.seedInt ?? i.seed}|${i.type}|placement`))() * Math.PI * 2, r = [];
  for (let c = 0; c < 1900; c++) {
    let h = 1 - 2 * (c + 0.5) / 1900, u = c * Math.PI * (3 - Math.sqrt(5)) + n, d = Math.sqrt(1 - h * h), f = new P(Math.cos(u) * d, h, Math.sin(u) * d), m = i.sample(f.x, f.y, f.z);
    (i.type === "gas" || m.land && m.safe > 0.15) && r.push({ direction: f, sample: m });
  }
  let s = t.map((c, h) => ({ entry: c, order: h, sort: _l(`${i.seedInt ?? i.seed}|${c.instanceKey}|sector`) })).sort((c, h) => c.sort - h.sort), o = new Map(s.map(({ entry: c }, h) => {
    let u = 1 - 2 * (h + 0.5) / t.length, d = h * 2.399963229728653 + n;
    return [c.instanceKey, new P(Math.cos(d) * Math.sqrt(1 - u * u), u, Math.sin(d) * Math.sqrt(1 - u * u))];
  })), a = [], l = t.slice().sort((c, h) => yl(h.id).radius - yl(c.id).radius);
  for (let c of l) {
    let h = yl(c.id), u = (h.radius * pi + 3.2) / i.radius, d = o.get(c.instanceKey), f = mf(_l(`${i.seedInt ?? i.seed}|${c.instanceKey}|heading`))() * Math.PI * 2, m = null, g = r.map((_) => {
      let p = Math.min(...a.map((v) => _.direction.angleTo(v.direction) - v.angularRadius - u), Math.PI), y = /Radar/.test(c.id) ? _.sample.height * 0.09 : /Mine/.test(c.id) ? Math.min(3, _.sample.height) * 0.04 : -0.018 * Math.abs(_.sample.height - 1.5), M = c.id === "Crystal_Mine" ? (_.sample.crystal || 0) * 0.7 : 0;
      return { ..._, separation: p, rank: _.direction.dot(d) * 5 + _.sample.safe * 0.45 + y + M };
    }).filter((_) => _.separation > 0.025).sort((_, p) => p.rank - _.rank).slice(0, 210);
    for (let _ of g) {
      let p = zy(_.direction, f), y = i.radius + _.sample.height, M = yf(i, _.direction, p, y), v = -1 / 0, w = 1 / 0, b = 0, A = 0;
      if (i.type === "gas") v = 0, w = 0;
      else for (let L of h.probePoints) {
        let z = M(L[0], L[2], 1);
        v = Math.max(v, z.y), w = Math.min(w, z.y), (!z.sample.land || z.sample.safe < 0.075 || z.sample.lava > 0.3) && b++, A += z.sample.safe;
      }
      if (b) continue;
      let C = v - w, T = c.id === "Solar_Plant" ? 1.55 : 1.2, E = _.rank - C * T + A / Math.max(1, h.probePoints.length) * 0.5;
      (!m || E > m.score) && (m = { entry: c, direction: _.direction.clone(), quaternion: p, radius: y, angularRadius: u, heading: f, lift: Math.max(0.045, v + 0.045), spread: C, score: E });
    }
    if (!m) throw new Error(`No stable land footprint for ${c.instanceKey}; choose a field with sufficient stable land.`);
    a.push(m);
  }
  return t.map((c) => a.find((h) => h.entry.instanceKey === c.instanceKey));
}
function Vy() {
  let i = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Set(), n = (l, c = no[l]) => {
    if (!i.has(l)) {
      let h = new sn({ name: `World_${l}`, color: c, roughness: 0.79, metalness: l === "steel" ? 0.22 : 0.06, flatShading: true });
      l === "cyan" && (h.emissive.setHex(no.cyan), h.emissiveIntensity = 0.21), i.set(l, h);
    }
    return i.get(l);
  }, r = (l) => {
    if (t.has(l)) return t.get(l);
    let c = l.clone(), h = l.name.replace(/^AURORA_/, "");
    return no[h] !== void 0 && c.color.setHex(no[h]), c.roughness = Math.max(0.63, c.roughness ?? 0.7), c.metalness = Math.min(0.27, c.metalness ?? 0.1), c.flatShading = true, c.emissive && (c.emissive.setHex(h === "cyan" ? no.cyan : 0), c.emissiveIntensity = h === "cyan" ? 0.18 : 0), c.name = `World_${h}`, t.set(l, c), c;
  }, s = (l, c, h, u, d = [0, 0, 0]) => {
    e.add(h);
    let f = new Xt(h, typeof u == "string" ? n(u) : u);
    return f.name = c, f.position.fromArray(d), f.castShadow = true, f.receiveShadow = true, l.add(f), f;
  }, o = (l, c, h, u, d = "navy") => s(l, c, new $n(...h), d, u);
  return { get: n, remap: r, mesh: s, box: o, beam: (l, c, h, u, d = 0.19, f = "navy") => {
    let m = new P(...h), g = new P(...u), _ = g.clone().sub(m), p = o(l, c, [d, _.length(), d], m.clone().add(g).multiplyScalar(0.5).toArray(), f);
    return p.quaternion.setFromUnitVectors(Ah, _.normalize()), p;
  }, geometries: e, dispose() {
    e.forEach((l) => l.dispose()), i.forEach((l) => l.dispose()), t.forEach((l) => l.dispose());
  } };
}
function Gy(i, t, e, n, r) {
  let s = [], o = t.vertices.map((h) => [h[0], Math.min(h[1] - 0.015, e(h[0], h[2], 3).y - n - 0.04), h[2]]), a = (h, u, d) => s.push(...h, ...u, ...d);
  for (let [h, u] of t.boundary) a(t.vertices[h], o[u], o[h]), a(t.vertices[h], t.vertices[u], o[u]);
  for (let [h, u, d] of t.triangles) a(o[h], o[u], o[d]);
  let l = new ue();
  l.setAttribute("position", new Jt(s, 3)), l.computeVertexNormals();
  let c = r.mesh(i, `Terrain_Contact_${t.name}`, l, "foundation", [0, 0, 0]);
  c.userData.purpose = "\u4EC5\u6CBF\u8BE5\u627F\u91CD\u57FA\u811A\u7684\u771F\u5B9E\u8FB9\u754C\u8865\u9F50\u77ED\u57FA\u7840\uFF0C\u5730\u5F62\u4E0E\u57FA\u811A\u4E4B\u95F4\u95ED\u5408", c.userData.actualFootprint = true;
}
function Wy(i, t, e, n) {
  let r = new Ne();
  r.name = `Open_Suspension_Frame_${n}`, i.add(r), r.userData.purpose = "\u8BBE\u5907\u539F\u6709\u57FA\u811A\u4E0B\u7684\u5F00\u653E\u6841\u67B6\uFF0C\u683C\u95F4\u53EF\u89C1\u4E91\u5C42\uFF1B\u6709\u72EC\u7ACB\u60AC\u6D6E\u652F\u6491";
  let s = t.min[1] - 0.08, o = s - 1.45;
  for (let [f, m] of t.boundary) {
    let g = t.vertices[f], _ = t.vertices[m];
    Math.hypot(g[0] - _[0], g[2] - _[2]) < 0.32 || e.beam(r, "Foot_Perimeter_Stringer", [g[0], s, g[2]], [_[0], s, _[2]], 0.18);
  }
  let [a, , l] = t.center, c = t.max[0] - t.min[0], h = t.max[2] - t.min[2], u = Math.max(0.19, c * 0.27), d = Math.max(0.19, h * 0.27);
  for (let f of [-1, 1]) e.beam(r, "Longitudinal_Load_Beam", [a + f * u, o, l - d], [a + f * u, o, l + d], 0.23), e.beam(r, "Transverse_Load_Beam", [a - u, o, l + f * d], [a + u, o, l + f * d], 0.23);
  for (let f of [-u, u]) for (let m of [-d, d]) {
    let g = [a + f, s, l + m], _ = [a + f, o, l + m];
    e.beam(r, "Suspension_Post", g, _, 0.22), e.beam(r, "Diagonal_Load_Strut", [a, s, l + m], _, 0.18);
    let p = Math.max(0.22, Math.min(0.7, Math.min(c, h) * 0.13));
    e.mesh(r, "Hover_Unit_Housing", new un(p, p * 0.76, 0.62, 8), "navy", [_[0], o - 0.29, _[2]]), e.mesh(r, "Hover_Field_Emitter", new un(p * 0.68, p * 0.48, 0.16, 8), "cyan", [_[0], o - 0.67, _[2]]);
  }
}
function Xy(i, t, e, n) {
  if (t === "Metal_Mine") {
    let r = i.getObjectByName("Metal_Ore_Resource");
    r && (r.visible = false);
    let s = new Ne();
    s.name = "Imported_Metal_Feedstock", s.position.set(-7, 0, 1.7), i.add(s), s.userData.purpose = "\u8F68\u9053\u8FD0\u8F93\u9001\u8FBE\u7684\u91D1\u5C5E\u576F\u6599\u5904\u7406\u7AD9\uFF0C\u63A5\u5165\u539F\u7834\u788E\u4E0E\u50A8\u8FD0\u6D41\u7A0B", n.box(s, "Feedstock_Local_Foundation", [7.8, 0.28, 5.9], [0, 0.14, 0]);
    for (let a of [-3.6, 3.6]) n.box(s, "Loading_Bay_Sidewall", [0.35, 2.5, 5.4], [a, 1.52, 0], "ivory");
    n.box(s, "Loading_Bay_Backwall", [7.25, 2.5, 0.35], [0, 1.52, -2.52], "ivory");
    for (let a = 0; a < e + 2; a++) n.box(s, "Imported_Metal_Billet", [1, 1.15 + a % 2 * 0.7, 3.4], [(a - (e + 1) / 2) * 1.23, 0.9 + a % 2 * 0.35, -0.2], "steel"), n.box(s, "Cargo_Clamp", [0.18, 1.5, 3.5], [(a - (e + 1) / 2) * 1.23, 1.04, -0.2], "yellow");
    n.box(s, "Cargo_Entry_Sill", [6.8, 0.27, 0.48], [0, 0.41, 2.5], "yellow");
    let o = i.getObjectByName("DrillMount");
    o && (o.userData.purpose = "\u5BF9\u8FDB\u53E3\u91D1\u5C5E\u576F\u6599\u8FDB\u884C\u5206\u5207\u548C\u8FDB\u6599\u5904\u7406");
  }
  if (t === "Crystal_Mine") {
    let r = i.getObjectByName("Crystal_Ore_Resource");
    r && (r.visible = false);
    let s = new Ne();
    s.name = "Imported_Crystal_Refining_Column", s.position.set(0, 2.33, 0), i.add(s), s.userData.purpose = "\u5904\u7406\u5916\u8FD0\u6676\u4F53\u539F\u6599\u7684\u5C01\u95ED\u5206\u9009\u7B52\uFF0C\u4E0E\u5DF2\u6709\u4E09\u722A\u6267\u884C\u673A\u6784\u548C\u4ED3\u50A8\u76F8\u8FDE", n.mesh(s, "Closed_Processing_Column", new un(1.56, 1.83, 7.5, 6), "purple", [0, 3.82, 0]);
    for (let o of [0.2, 2.2, 5.25, 7.61]) n.mesh(s, "Pressure_Column_Collar", new un(1.75, 1.75, 0.28, 6), "ivory", [0, o, 0]);
    n.mesh(s, "Sealed_Column_Cap", new un(0.83, 1.75, 0.6, 6), "ivory", [0, 8, 0]);
    for (let o = 0; o < 6; o++) {
      let a = o * Math.PI / 3, l = n.box(s, "Refining_Inspection_Window", [0.32, 3.2, 0.12], [Math.sin(a) * 1.56, 4, Math.cos(a) * 1.56], "crystal");
      l.rotation.y = a;
    }
  }
}
function qy(i, t) {
  let e = i.getObjectByName("Orbital_Dock"), n = i.getObjectByName("Twin_Cables"), r = i.getObjectByName("Cable_Carriage");
  if (!e || !n || !r) return;
  e.position.y = 47.4, n.clear();
  let s = 3.9, o = e.position.y - 1.05;
  for (let a of [-1.08, 1.08]) t.mesh(n, `Continuous_Tension_Cable_${a}`, new un(0.075, 0.075, o - s, 8), "cyan", [a, (o + s) / 2, 0]);
  r.position.y = (o + s) / 2, r.userData.motion = { type: "slide", axis: "y", range: (o - s) / 2 - 1.65, speed: 0.12, phase: -Math.PI / 2 }, i.userData.orbitalDisplayHeight = e.position.y, i.userData.orbitalSeparation = "world_preview_compressed";
}
function Rh(i, { stage: t = 3, buildings: e = null, placements = null } = {}) {
  let n = Math.max(1, Math.min(3, Math.round(t))), r = (e || ky(i.type)).map((d, f) => {
    let m = typeof d == "string" ? { id: d } : { ...d };
    if (!pf.has(m.id)) throw new Error(`Unknown original building ID: ${m.id}`);
    return m.visualStage = Math.max(1, Math.min(3, Math.round(m.visualStage ?? n))), m.instanceKey ??= m.id + (f && (e || []).filter?.((g) => (g.id || g) === m.id).length > 1 ? `:${f}` : ""), m;
  }), s = new Ne();
  s.name = "AURORA_World_Facilities";
  let o = Vy(), a = [], l = [], c = [];
  o.get("foundation", i.type === "moon" ? 7634301 : i.type === "mars" ? 8673607 : i.type === "mercury" ? 4344658 : 7831408);
  let h = placements || Hy(i, r);
  for (let d of h) {
    let { entry: f } = d, m = pf.get(f.id), g = yl(f.id), _ = f.visualStage, p = wh(f.id, _);
    p.traverse((E) => {
      E.isMesh && (E.material = Array.isArray(E.material) ? E.material.map(o.remap) : o.remap(E.material));
    }), i.type === "gas" && Xy(p, f.id, _, o), f.id === "Shipyard" && qy(p, o);
    let y = f.id === "Gas_Mine" || f.id === "Flagship_Center", M = g.groundReferenceY, v = yf(i, d.direction, d.quaternion, d.radius), w = d.lift, b = _f(p, 0);
    if (i.type === "gas") w = 9 / pi - M, y || b.forEach((E, L) => Wy(p, E, o, L));
    else if (y) w += -M;
    else {
      let E = d.lift;
      for (let L of g.contacts) for (let z of L.vertices) E = Math.max(E, v(z[0], z[2], 3).y + 0.05);
      w = E;
      for (let L of b) Gy(p, L, v, w, o);
    }
    let A = new Ne();
    A.name = `Facility_${f.instanceKey}`, A.quaternion.copy(d.quaternion), A.position.copy(d.direction).multiplyScalar(d.radius + w * pi), A.scale.setScalar(pi), A.add(p), s.add(A), A.userData = { id: f.id, facilityId: f.id, instanceKey: f.instanceKey, name: f.name || m.name, visualStage: _, logicalFacility: true, seed: i.seed, preservedOriginalId: true }, f.level !== void 0 && (A.userData.level = f.level), p.traverse((E) => {
      E.userData.facilityId = f.id, E.userData.instanceKey = f.instanceKey, E.userData.visualStage = _;
    });
    let C = i.type === "gas" ? f.id === "Metal_Mine" || f.id === "Crystal_Mine" ? "\u4E91\u9876\u539F\u6599\u5904\u7406\u8BBE\u65BD\uFF1B\u4FDD\u7559\u539F ID\u3001\u50A8\u8FD0\u6A21\u5757\u548C\u5B8C\u6574\u5347\u7EA7\u7ED3\u6784\uFF0C\u91C7\u6398\u77FF\u4F53\u66FF\u6362\u4E3A\u8FDB\u53E3\u539F\u6599\u5904\u7406\u5355\u5143\u3002" : y ? "\u4FDD\u7559\u539F\u6709\u5206\u7EC4\u6D6E\u53F0\u3001\u72EC\u7ACB\u60AC\u6D6E\u652F\u6491\u548C\u8FDE\u63A5\u6865\uFF0C\u4E91\u5C42\u5728\u4E0B\u65B9\u8FDE\u7EED\u901A\u8FC7\u3002" : "\u4FDD\u7559\u539F\u5EFA\u7B51\u6BD4\u4F8B\u548C\u5C40\u90E8\u673A\u68B0\u5E95\u5EA7\uFF1B\u5404\u627F\u91CD\u4F4D\u7F6E\u4E0B\u8BBE\u7F6E\u5F00\u653E\u6841\u67B6\u548C\u72EC\u7ACB\u60AC\u6D6E\u88C5\u7F6E\u3002" : y ? "\u4EE5\u539F\u6A21\u578B\u79BB\u5730\u53C2\u8003\u60AC\u6D6E\uFF0C\u4FDD\u7559\u4E2D\u592E\u51C0\u7A7A\u4E0E\u72EC\u7ACB\u670D\u52A1\u6A21\u5757\u3002" : "\u6309\u4E09\u7EA7\u5B8C\u6574\u5360\u5730\u9009\u62E9\u7A33\u5B9A\u573A\u5730\uFF1B\u5404\u5B9E\u9645\u57FA\u811A\u4EE5\u77ED\u57FA\u7840\u63A5\u5230\u81EA\u7136\u5730\u9762\uFF0C\u4E3B\u697C\u4E0E\u914D\u5957\u4E4B\u95F4\u4FDD\u7559\u539F\u5730\u5F62\u3002", T = { id: f.id, name: f.name || m.name, instanceKey: f.instanceKey, root: A, anchor: d.direction.clone(), position: A.position.clone(), stage: _, model: p, footprintRadius: g.radius * pi, description: C, groundReferenceY: M, terrainSpread: d.spread, heading: d.heading };
    if (f.level !== void 0 && (T.level = f.level), a.push(T), l.push(...df(p)), i.type !== "gas" && !y) for (let E of g.contacts) {
      let L = v(E.center[0], E.center[2], 2);
      c.push({ direction: L.direction.toArray(), angularRadius: (E.radius * pi + 0.38) / (i.radius + L.sample.height), facilityId: f.id, instanceKey: f.instanceKey, footprint: E.name });
    }
  }
  s.updateMatrixWorld(true);
  let u = `${gf}-${_l(JSON.stringify(h.map((d) => [d.entry.instanceKey, ...d.direction.toArray().map((f) => +f.toFixed(8)), +d.heading.toFixed(8)]))).toString(16)}`;
  return s.userData.layoutSignature = u, { root: s, facilities: a, motions: l, exclusions: c, layoutSignature: u, update(d) {
    ff(l, d);
  }, dispose() {
    s.removeFromParent(), o.dispose();
  } };
}
function Rf(i) {
  let t = i.root;
  t.updateWorldMatrix(true, true);
  let e = new me().copy(t.matrixWorld).invert(), n = /* @__PURE__ */ new Map(), r = [];
  t.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material) || o.material.transparent || !o.visible) return;
    let a = o, l = false, c = true;
    for (; a && a !== t.parent; ) a.userData.motion && (l = true), a.visible || (c = false), a = a.parent;
    if (l || !c) return;
    let h = new me().multiplyMatrices(e, o.matrixWorld), u = o.geometry.clone();
    if (u.index) {
      let f = u.toNonIndexed();
      u.dispose(), u = f;
    }
    for (let f of Object.keys(u.attributes)) f !== "position" && f !== "normal" && u.deleteAttribute(f);
    u.attributes.normal || u.computeVertexNormals(), u.applyMatrix4(h);
    let d = o.material.uuid;
    n.has(d) || n.set(d, { material: o.material, geometries: [], cast: o.castShadow }), n.get(d).geometries.push(u), r.push(o);
  });
  let s = [];
  for (let { material: o, geometries: a, cast: l } of n.values()) {
    let c = jd(a, false);
    for (let u of a) u.dispose();
    if (!c) continue;
    let h = new Xt(c, o);
    h.name = "Stationary_" + o.name, h.castShadow = l, h.receiveShadow = true, h.userData.facilityId = i.id, t.add(h), s.push(c);
  }
  for (let o of r) o.removeFromParent();
  return t.userData.logicalFacility = true, t.userData.facilityId = i.id, t.userData.instanceKey = i.instanceKey || i.id, s;
}

export const sharedModelGeometries=()=>new Set(th.values());

export {Qd as GAS_PALETTES,oy as createGasSampler,dy as createGasRings};

export {Kc as createWorldTerrain,Rh as createWorldFacilities,Hy as createWorldLayout,yl as buildingFootprint,yf as localTerrainSampler,gl as FACILITIES,tr as GAS_VARIANTS,pi as MODEL_SCALE,wh as createFacilityModel,Rf as mergeStationary,df as collectMotions,ff as animateMotions,_l as stableHash};
