// User-supplied HELIOS mining machinery; regenerate with scripts/import-helios-megastructures.mjs --industry.
// helios-asteroid-miner
import { ConeGeometry as mi, MathUtils as Ae, Vector2 as Q, Vector3 as R, MeshStandardMaterial as ze, Group as cn, Mesh as se, BoxGeometry as Pn, CylinderGeometry as Ii, TorusGeometry as ro, MeshBasicMaterial as rn, BufferGeometry as Qt, Line as pi, LineBasicMaterial as fi, Float32BufferAttribute as zt, Color as Ct, ShaderMaterial as oe, SphereGeometry as Xn, Shape as ti, ExtrudeGeometry as gi, CatmullRomCurve3 as on, RingGeometry as is, BufferAttribute as we, IcosahedronGeometry as Dn, Object3D as ve, InstancedMesh as Gn, TubeGeometry as qn, Sphere as je, CubicBezierCurve3 as $s, AdditiveBlending as Se, DoubleSide as Pe, DynamicDrawUsage as yo } from "three";
import { mergeGeometries as nc } from "three/addons/utils/BufferGeometryUtils.js";
var ge = Math.PI * 2;
var ps = Ae.clamp;
var lb = Ae.lerp;
function ms(i = 12345) {
  return () => {
    i |= 0, i = i + 1831565813 | 0;
    let t = Math.imul(i ^ i >>> 15, 1 | i);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function Hi(i, t = 0.66, e = 0.43) {
  return new ze({ color: i, metalness: t, roughness: e });
}
function fr(i, t = 2.5) {
  return new ze({ color: i, emissive: i, emissiveIntensity: t, metalness: 0.2, roughness: 0.32 });
}
var y = { hull: Hi("#8296a2"), light: Hi("#c6cdca", 0.5, 0.35), dark: Hi("#1c2c3a", 0.7, 0.48), edge: Hi("#425967"), black: Hi("#091219", 0.42, 0.6), gold: Hi("#b78a43", 0.78, 0.31), copper: Hi("#ba7250", 0.7, 0.4), glass: new ze({ color: "#135e62", emissive: "#063d43", emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.17 }), solar: Hi("#153e56", 0.78, 0.25), cyan: fr("#55eedb"), blue: fr("#4ba3ff", 2.1), amber: fr("#ffc47d", 2.2), red: fr("#ff684e", 1.8), green: fr("#6ed89e", 1.6), white: fr("#d7f4ff", 1.9) };
var Zh = /* @__PURE__ */ new Map();
function $h(i, t) {
  return Zh.has(i) || Zh.set(i, t()), Zh.get(i);
}
function rt(i, t = [0, 0, 0]) {
  let e = new cn();
  return e.position.fromArray(t), i && i.add(e), e;
}
function Me(i, t, e = y.hull, n = [0, 0, 0], s = [0, 0, 0], r = [1, 1, 1]) {
  let o = new se(t, e);
  return o.position.fromArray(n), o.rotation.fromArray(s), o.scale.fromArray(r), i && i.add(o), o;
}
function O(i, t = [1, 1, 1], e = [0, 0, 0], n = y.hull, s = [0, 0, 0]) {
  return Me(i, $h("box", () => new Pn()), n, e, s, t);
}
function wt(i, t, e, n, s = [0, 0, 0], r = y.hull, o = 16, a = [0, 0, 0]) {
  let c = `c${t},${e},${n},${o}`;
  return Me(i, $h(c, () => new Ii(t, e, n, o, 1)), r, s, a);
}
function ae(i, t, e, n = [0, 0, 0], s = y.hull, r = [Math.PI / 2, 0, 0], o = ge) {
  let a = Math.max(16, Math.ceil(96 * o / ge)), c = `t${t},${e},${o}`;
  return Me(i, $h(c, () => new ro(t, e, 8, a, o)), s, n, r);
}
function mt(i, t, e, n = 1, s = y.edge, r = n) {
  let o = new R(...t), a = new R(...e), c = a.clone().sub(o), l = O(i, [n, c.length(), r], o.clone().add(a).multiplyScalar(0.5).toArray(), s);
  return l.quaternion.setFromUnitVectors(new R(0, 1, 0), c.normalize()), l;
}
function Le(i, t, e, n = 2, s = y.edge, r = 6) {
  let o = rt(i, t), a = new R(...e).sub(new R(...t)), c = a.length();
  o.quaternion.setFromUnitVectors(new R(0, 1, 0), a.normalize());
  let l = n / 2, u = Math.max(0.11, n * 0.095);
  for (let h of [-l, l]) for (let d of [-l, l]) mt(o, [h, 0, d], [h, c, d], u, s);
  for (let h = 0; h <= r; h++) {
    let d = c * h / r;
    if (mt(o, [-l, d, -l], [l, d, -l], u, s), mt(o, [-l, d, l], [l, d, l], u, s), mt(o, [-l, d, -l], [-l, d, l], u, s), mt(o, [l, d, -l], [l, d, l], u, s), h < r) {
      let f = c * (h + 1) / r;
      mt(o, [-l, d, -l], [l, f, -l], u, s), mt(o, [l, d, l], [-l, f, l], u, s), mt(o, [-l, d, l], [-l, f, -l], u, s), mt(o, [l, d, -l], [l, f, l], u, s);
    }
  }
  return o;
}
function Ie(i) {
  return i.userData.dynamic = true, i;
}
function Zt(i, t, e) {
  return t.userData.phase = true, i.parts.push({ object: t, threshold: e }), t;
}
function Jn(i, t = 50) {
  let e = rt();
  e.name = i, e.userData.facilityId = i;
  let n = Ie(rt(e));
  return n.name = "effects", n.userData.effect = true, { id: i, group: e, effects: n, parts: [], boundsRadius: t, focus: new R(), time: 0, update() {
  }, setProgress(r) {
    for (let o of this.parts) o.object.visible = r >= o.threshold;
  } };
}
function yi(i, t = 1, e = y.light) {
  let n = rt(i);
  n.scale.setScalar(t), O(n, [1.4, 0.65, 3.8], [0, 0, 0], e), O(n, [1, 0.45, 1.1], [0, 0.45, -1], y.glass);
  for (let s of [-1, 1]) O(n, [0.55, 0.65, 2.8], [s, -0.1, 0.4], y.dark), O(n, [0.38, 0.35, 0.1], [s, -0.1, 1.85], y.cyan);
  return O(n, [2.2, 0.2, 2], [0, -0.4, 0.4], y.edge), n;
}
var Mi = Math.PI * 2;
var Dv = new R(0, 1, 0);
function eu(i, t, e, n, s, r, o, a, c) {
  let l = Math.min(n, s) * 0.18, u = n / 2, h = s / 2, d = [[-u + l, -h], [u - l, -h], [u, -h + l], [u, h - l], [u - l, h], [-u + l, h], [-u, h - l], [-u, -h + l]], f = Math.max(3, Math.ceil(a * 28)), m = [], v = [];
  for (let p = 0; p <= f; p++) {
    let E = o + a * p / f, _ = Math.cos(E), g = Math.sin(E), M = new Q(_ / t, g / e).normalize();
    for (let [w, P] of d) m.push(t * _ + M.x * w, e * g + M.y * w, r + P);
  }
  for (let p = 0; p < f; p++) for (let E = 0; E < 8; E++) {
    let _ = p * 8 + E, g = p * 8 + (E + 1) % 8, M = (p + 1) * 8 + (E + 1) % 8, w = (p + 1) * 8 + E;
    v.push(_, g, w, g, M, w);
  }
  for (let p = 1; p < 7; p++) {
    v.push(0, p + 1, p);
    let E = f * 8;
    v.push(E, E + p, E + p + 1);
  }
  for (let p = 0; p < v.length; p += 3) {
    let E = v[p + 1];
    v[p + 1] = v[p + 2], v[p + 2] = E;
  }
  let x = new Qt();
  return x.setAttribute("position", new zt(m, 3)), x.setIndex(v), x.computeVertexNormals(), Me(i, x, c);
}
function nu(i, t, e, n, s, r, o = 0, a = Mi) {
  let c = [];
  for (let l = 0; l <= 80; l++) {
    let u = o + a * l / 80;
    c.push(new R(t * Math.cos(u), e * Math.sin(u), n));
  }
  return Me(i, new qn(new on(c), 80, s, 6, false), r);
}
function Ro(i, t, e, n = y.hull) {
  let [s, r, o] = e, a = Math.min(s, o) * 0.16, c = new ti();
  c.moveTo(-s / 2 + a, -o / 2), c.lineTo(s / 2 - a, -o / 2), c.lineTo(s / 2, -o / 2 + a), c.lineTo(s / 2, o / 2 - a), c.lineTo(s / 2 - a, o / 2), c.lineTo(-s / 2 + a, o / 2), c.lineTo(-s / 2, o / 2 - a), c.lineTo(-s / 2, -o / 2 + a), c.closePath();
  let l = new gi(c, { depth: r, bevelEnabled: true, bevelSize: 0.28, bevelThickness: 0.22, bevelSegments: 1, steps: 1 });
  return l.rotateX(-Math.PI / 2), l.translate(0, -r / 2, 0), Me(i, l, n, t);
}
function Lv(i, t, e, n, s, r) {
  let o = [], a = [];
  for (let h = 0; h <= 8; h++) {
    let d = h / 8, f = Ae.lerp(t, e, d), m = n + 0.25 * d * d, v = s * (0.75 + 0.25 * d) / (2 * f), x = (d - 0.5) * 2.3;
    for (let [p, E] of [[-1, -0.13], [1, -0.13], [1, 0.13], [-1, 0.13]]) {
      let _ = m + p * v;
      o.push(Math.cos(_) * f, Math.sin(_) * f, x + p * 0.45 + E);
    }
  }
  for (let h = 0; h < 8; h++) for (let d = 0; d < 4; d++) {
    let f = h * 4 + d, m = h * 4 + (d + 1) % 4, v = (h + 1) * 4 + (d + 1) % 4, x = (h + 1) * 4 + d;
    a.push(f, m, x, m, v, x);
  }
  a.push(0, 2, 1, 0, 3, 2);
  let l = 32;
  a.push(l, l + 1, l + 2, l, l + 2, l + 3);
  let u = new Qt();
  return u.setAttribute("position", new zt(o, 3)), u.setIndex(a), u.computeVertexNormals(), Me(i, u, r);
}
function Uv(i, t) {
  let e = [[38, 37], [31, 25], [25, 15], [19, 4], [16, -6], [10, -15], [7.5, -23], [5.5, -33]], n = Math.cos(t), s = Math.sin(t), r = new R(-s, n, 0), o = new R(n, s, 0), a = e.map(([l, u]) => new R(l * n, l * 0.824 * s, u)), c = rt(i);
  for (let l of [-1, 1]) for (let u of [-1, 1]) {
    let h = a.map((d) => d.clone().addScaledVector(o, l * 1.05).addScaledVector(r, u * 0.85));
    Me(c, new qn(new on(h), 36, 0.32, 6, false), y.edge);
  }
  for (let l = 0; l < a.length; l++) {
    let u = a[l], h = u.clone().addScaledVector(r, -1.1), d = u.clone().addScaledVector(r, 1.1);
    if (mt(c, h.toArray(), d.toArray(), 0.55, l % 2 ? y.hull : y.light), l < a.length - 1) {
      let f = a[l + 1];
      for (let m of [-1, 1]) mt(c, u.clone().addScaledVector(r, m * 0.85).addScaledVector(o, 1.05).toArray(), f.clone().addScaledVector(r, -m * 0.85).addScaledVector(o, 1.05).toArray(), 0.19, y.copper);
    }
  }
  for (let l of [0, 2, 4, 6]) {
    let u = a[l], h = O(c, [2.9, 1.5, 3.1], u.toArray(), y.hull);
    h.rotation.z = t - Math.PI / 2;
    for (let d of [-0.95, 0.95]) wt(c, 0.2, 0.2, 0.25, [u.x, u.y, u.z + d], y.dark, 6, [Math.PI / 2, 0, 0]);
  }
  return c;
}
function Of(i) {
  let t = Ie(rt(i.group));
  t.name = "open-whale-collector";
  let e = Ie(rt(t));
  e.name = "collector-structure-effects", e.userData.effect = true;
  let n = Zt(i, rt(t), 0.04);
  for (let _ = 0; _ < 8; _++) Uv(n, (_ + 0.5) * Mi / 8);
  let s = Zt(i, rt(t), 0.16), r = Zt(i, rt(t), 0.27), o = Zt(i, rt(e), 0.62), a = y.cyan.clone();
  a.name = "collector-energy-teeth", a.emissiveIntensity = 1.6;
  for (let _ = 0; _ < 24; _++) {
    let g = _ * Mi / 24, M = g + Mi / 48, w = Math.sin(M) > 0 ? s : r;
    if (_ === 0 || _ === 11 || _ === 12 || _ === 23) continue;
    let P = g + 0.025, C = Mi / 24 - 0.05;
    eu(w, 36.6, 30.3, 4.2, 3.7, 38, P, C, _ % 3 === 0 ? y.light : y.hull), eu(w, 35.5, 29.2, 2.5, 2.2, 32.5, P + 0.018, C - 0.036, y.edge);
    let b = Math.cos(M), S = Math.sin(M), D = 36.6 * b, F = 30.3 * S;
    mt(w, [D, F, 32], [D, F, 38], 0.75, y.copper);
    let B = O(w, [2.9, 3.8, 4.8], [D, F, 36], y.dark);
    B.rotation.z = M - Math.PI / 2;
    let H = O(w, [1.4, 2.1, 4.9], [D, F, 36.1], y.light);
    H.rotation.z = M - Math.PI / 2;
    let W = new se(new mi(0.67, 3.4, 4), y.edge);
    W.position.set(33.2 * b, 27.25 * S, 38.8), W.quaternion.setFromUnitVectors(Dv, new R(-b, -S, 0)), w.add(W), mt(o, [34.1 * b, 28.1 * S, 39.35], [31.35 * b, 25.6 * S, 39.8], 0.17, a), O(w, [0.72, 0.72, 0.32], [37.7 * b, 31.4 * S, 40], y.copper, [0, 0, M]);
    for (let U of [-1.05, 1.05]) wt(w, 0.21, 0.21, 0.3, [D, F, 38 + U], y.black, 6, [Math.PI / 2, 0, 0]);
  }
  let c = Zt(i, rt(t), 0.3);
  for (let _ of [-1, 1]) {
    Ro(c, [_ * 38.5, 0, 31], [7.5, 10, 11], y.dark), wt(c, 3.1, 3.1, 3, [_ * 40, 0, 31], y.hull, 16, [0, 0, Math.PI / 2]), wt(c, 1.9, 1.9, 3.3, [_ * 40, 0, 31], y.copper, 12, [0, 0, Math.PI / 2]);
    for (let g of [-1, 1]) mt(c, [_ * 37.5, g * 5, 33], [_ * 31, g * 12, 17], 1, y.hull), mt(c, [_ * 37.4, g * 5, 33], [_ * 33, g * 10, 21], 0.4, y.copper);
    O(c, [0.32, 6, 2.3], [_ * 42.3, 0, 31], y.amber);
  }
  let l = [], u = [{ z: 15, r: 23, n: 7, threshold: 0.38 }, { z: -6, r: 14, n: 6, threshold: 0.52 }, { z: -21, r: 6, n: 5, threshold: 0.65 }], h = y.blue.clone();
  h.name = "collector-magnetic-coils", h.emissiveIntensity = 1.1, u.forEach((_, g) => {
    let M = Zt(i, rt(t, [0, 0, _.z]), _.threshold);
    nu(M, _.r, _.r * 0.85, -1.1, 0.7, y.edge), nu(M, _.r + 0.65, (_.r + 0.65) * 0.85, 1.6, 0.35, y.copper);
    for (let C = 0; C < 8; C++) {
      let b = (C + 0.5) * Mi / 8;
      eu(M, _.r, _.r * 0.85, g === 2 ? 1 : 1.75, g === 2 ? 1.8 : 3.1, 0, b - 0.15, 0.3, C % 2 ? y.hull : y.light);
      let S = Math.cos(b), D = Math.sin(b);
      mt(M, [S * _.r, D * _.r * 0.85, 0], [S * _.r * 0.79, D * _.r * 0.79, 0], g === 2 ? 0.3 : 0.55, y.dark);
      let F = O(M, [g === 2 ? 1 : 2, 1.6, g === 2 ? 2 : 4.8], [S * (_.r + 1), D * (_.r * 0.85 + 1), 0], y.edge);
      F.rotation.z = b - Math.PI / 2;
    }
    let w = Zt(i, rt(e, [0, 0, _.z]), _.threshold + 0.04);
    for (let C = 0; C < 6; C++) nu(w, _.r - 0.45, (_.r - 0.45) * 0.85, 0.45, g === 2 ? 0.11 : 0.16, h, C * Mi / 6 + 0.1, 0.55);
    let P = Ie(rt(M, [0, 0, g % 2 ? 1.1 : -1]));
    ae(P, _.r * 0.81, g === 2 ? 0.24 : 0.38, [0, 0, 0], y.copper, [0, 0, 0]), ae(P, _.r * 0.39, g === 2 ? 0.14 : 0.24, [0, 0, 0], y.edge, [0, 0, 0]);
    for (let C = 0; C < _.n; C++) {
      let b = C * Mi / _.n;
      Lv(P, _.r * 0.39, _.r * 0.805, b, g === 2 ? 0.8 : g === 1 ? 1.3 : 1.7, C % 2 ? y.hull : y.light), wt(P, g === 2 ? 0.17 : 0.28, g === 2 ? 0.17 : 0.28, 0.5, [Math.cos(b + 0.25) * _.r * 0.81, Math.sin(b + 0.25) * _.r * 0.81, 0], y.dark, 6, [Math.PI / 2, 0, 0]);
    }
    l.push({ object: P, speed: (g % 2 ? -1 : 1) * (0.15 + g * 0.07) });
  });
  let d = Zt(i, rt(t), 0.6);
  for (let _ of [-1, 1]) {
    let g = [[_ * 6.5, -4, -23], [_ * 16, -6, -21], [_ * 32, -7, -17], [_ * 48, -7, -13]];
    for (let M of [-1, 1]) for (let w of [-1, 1]) {
      let P = new on(g.map((C) => new R(C[0], C[1] + M * 0.65, C[2] + w * 1.5)));
      Me(d, new qn(P, 24, 0.22, 6, false), y.edge);
    }
    for (let M = 0; M < 9; M++) {
      let w = M / 8, P = _ * (8 + w * 40), C = -4 - w * 3, b = -23 + w * 10;
      wt(d, 0.32, 0.32, 3.7, [P, C, b], y.hull, 8, [Math.PI / 2, 0, 0]), O(d, [1, 0.25, 3.5], [P, C - 0.5, b], M % 2 ? y.dark : y.copper);
    }
    Ro(d, [_ * 17, -5, -21], [6, 5, 7], y.hull), O(d, [4, 0.2, 3.8], [_ * 17, -2.1, -21], y.black);
    for (let M = 0; M < 4; M++) O(d, [0.32, 0.18, 3], [_ * (15.6 + M * 0.9), -1.9, -21], y.amber);
    Le(d, [_ * 12, 0, -13], [_ * 35, -7, -16], 1.5, y.edge, 5), O(d, [1.2, 3.5, 4.5], [_ * 48, -6.2, -13], y.dark);
    for (let M of [-1.4, 1.4]) O(d, [0.24, 1.3, 0.28], [_ * 48.7, -5.1, -13 + M], y.amber);
  }
  let f = Zt(i, rt(t), 0.7);
  for (let _ of [-1, 1]) {
    Ro(f, [_ * 27, 6, 7], [7, 5.5, 14], y.hull), Ro(f, [_ * 27, 8.5, 8], [6.4, 0.9, 12], y.dark), O(f, [4.5, 0.85, 0.18], [_ * 27, 7.6, 14.2], y.glass), O(f, [0.2, 1.1, 7], [_ * 30.7, 7, 8], y.cyan), mt(f, [_ * 23, 3, 6], [_ * 27, 3, 6], 1.5, y.edge);
    for (let M = 0; M < 5; M++) O(f, [5, 0.25, 0.3], [_ * 27, 9.2, 3 + M * 2], y.edge);
    wt(f, 0.14, 0.14, 6, [_ * 27, 12, 4], y.hull, 6), O(f, [2.5, 0.65, 0.4], [_ * 27, 13, 4], y.light);
    let g = rt(f, [_ * 14, 0, -32]);
    g.rotation.z = _ * 0.22, mt(g, [0, 0, 0], [_ * 13, 0, 0], 1, y.edge);
    for (let M of [-1, 1]) for (let w = 0; w < 6; w++) {
      let P = _ * (3 + w * 1.7);
      O(g, [1.15, 7, 8], [P, M * 4.4, 0], y.dark), O(g, [0.18, 6.5, 7.5], [P + _ * 0.61, M * 4.4, 0], y.copper), mt(g, [P, M * 0.8, 0], [P, M * 8, 0], 0.18, y.edge);
    }
  }
  let m = Zt(i, rt(t), 0.78);
  ae(m, 4.7, 0.4, [0, 0, -29], y.gold, [0, 0, 0]);
  for (let _ = 0; _ < 3; _++) {
    let g = (_ + 0.5) * Mi / 3, M = Math.cos(g), w = Math.sin(g);
    mt(m, [M * 5.6, w * 5.6, -23], [M * 4.7, w * 4.7, -29], 0.55, y.hull), mt(m, [M * 4.7, w * 4.7, -29], [M * 3, w * 3, -35], 0.45, y.copper);
    let P = O(m, [1.1, 2.2, 2.5], [M * 4.7, w * 4.7, -28], y.dark);
    P.rotation.z = g - Math.PI / 2;
  }
  let v = y.gold.clone();
  v.name = "collector-condensed-mineral", v.emissive.set("#b47516"), v.emissiveIntensity = 0.65;
  let x = Ie(Me(m, new Dn(2.5, 1), v, [0, 0, -28])), p = Zt(i, rt(e, [0, 0, -28]), 0.81);
  ae(p, 3.05, 0.09, [0, 0, 0], a, [0, 0, 0]), ae(p, 3.45, 0.08, [0, 0, 0], h, [0, Math.PI / 2, 0]);
  let E = Zt(i, rt(t), 0.84);
  Ro(E, [0, 0, -38], [7.6, 5.8, 9.3], y.hull);
  for (let _ of [-1, 1]) O(E, [1.2, 3.8, 7], [_ * 4.2, 0, -37.7], y.edge), wt(E, 1.2, 1.45, 4.7, [_ * 6, 0, -37.5], y.dark, 12, [Math.PI / 2, 0, 0]), ae(E, 1.2, 0.2, [_ * 6, 0, -39.9], y.copper, [0, 0, 0]), mt(E, [_ * 3, 0, -35], [_ * 6, 0, -37], 0.65, y.hull);
  O(E, [4, 0.25, 4.2], [0, 3.2, -38], y.dark);
  for (let _ = 0; _ < 4; _++) O(E, [3.5, 0.14, 0.25], [0, 3.4, -36.5 - _], y.copper);
  return { group: t, effects: e, mouthRadius: 34, focusLocal: new R(0, 0, 3), detailFocusLocal: new R(3, -1, 4), viewDirectionLocal: new R(1.15, 0.62, 1.5), detailDirectionLocal: new R(1.3, 0.55, 0.85), update(_, g = {}) {
    let M = Ae.clamp(Math.round(g.effectLevel ?? 2), 0, 3), w = g.enabled !== false, P = g.progress ?? 1;
    e.visible = w && M > 0 && P > 0.1, a.emissiveIntensity = w && M > 0 ? [0, 0.8, 1.6, 2.2][M] * (0.93 + 0.07 * Math.sin(_ * 2.8)) : 0.15, h.emissiveIntensity = w && M > 0 ? [0, 0.6, 1.1, 1.6][M] * (0.9 + 0.1 * Math.sin(_ * 2)) : 0.12, v.emissiveIntensity = w ? 0.45 + 0.2 * Math.sin(_ * 0.8) ** 2 : 0.12, w && (l.forEach((C) => {
      C.object.rotation.z = _ * C.speed;
    }), x.rotation.set(_ * 0.07, _ * 0.11, _ * 0.04));
  } };
}
var Co = Math.PI * 2;
var su = Ae.clamp;
var gs = Ae.lerp;
var hc = (i) => i - Math.floor(i);
var _e = (i, t = 0) => hc(Math.sin((i + 1) * 127.1 + t * 311.7) * 43758.5453123);
var mr = (i, t, e) => {
  let n = su((e - i) / (t - i), 0, 1);
  return n * n * (3 - 2 * n);
};
var fn = (i, t, e) => new R(i, t, e);
function Hf(i) {
  return Ie(i), i.userData.keepMesh = true, i;
}
function uc(i, t) {
  return i.add(Hf(t)), t;
}
function Bf(i, t = 1, e = false) {
  let n = new Dn(1, t), s = n.attributes.position, r = new Float32Array(s.count * 3), o = new Ct("#665e54"), a = new Ct("#3e403d"), c = new Ct("#b69a60"), l = new Ct();
  for (let u = 0; u < s.count; u++) {
    let h = s.getX(u), d = s.getY(u), f = s.getZ(u), m = Math.sin(h * 4.3 + d * 3.7 - f * 2.8 + i * 2.5), v = Math.cos(h * 9.1 - d * 6.2 + f * 7.4 + i), x = 0.91 + m * 0.14 + v * 0.065;
    s.setXYZ(u, h * x * (1.05 + i * 0.09), d * x * (0.78 + i * 0.06), f * x * (1 - i * 0.065));
    let p = e && Math.sin(h * 5.1 + f * 4.7 + i) > 0.84 && d > -0.3;
    l.copy(a).lerp(o, 0.48 + v * 0.2), p && l.lerp(c, 0.72), l.toArray(r, u * 3);
  }
  return n.setAttribute("color", new we(r, 3)), n.computeVertexNormals(), n.computeBoundingSphere(), n;
}
function ac(i, t, e, n, s = 1) {
  return new oe({ transparent: true, depthWrite: false, depthTest: true, blending: Se, side: Pe, toneMapped: false, uniforms: { time: { value: 0 }, energy: { value: s }, color: { value: new Ct(i) }, opacity: { value: t }, dashCount: { value: e }, speed: { value: n } }, vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`, fragmentShader: `
      uniform float time, energy, opacity, dashCount, speed;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        float phase = fract(vUv.x * dashCount - time * speed);
        float dash = smoothstep(.05, .17, phase) * (1.0 - smoothstep(.55, .77, phase));
        float pulse = pow(.5 + .5 * sin(vUv.x * 21.0 - time * 1.6), 4.0);
        float edge = .60 + .40 * pow(abs(cos(vUv.y * 6.2831853)), 2.0);
        float alpha = opacity * energy * dash * edge;
        if (alpha < .002) discard;
        gl_FragColor = vec4(color * (1.0 + pulse * .65), alpha);
      }` });
}
function lc(i, t, e = 60) {
  return new qn(new on(i), e, t, 5, false);
}
function cc(i, t, e) {
  let n = nc(t, false);
  for (let r of t) r.dispose();
  let s = uc(i, new se(n, e));
  return s.frustumCulled = true, n.computeBoundingSphere(), s;
}
function zf(i) {
  let t = [{ z: 100, r: 50 }, { z: 38, r: 34 }, { z: 15, r: 23 }, { z: -6, r: 14 }, { z: -21, r: 6 }, { z: -28, r: 2.5 }];
  for (let e = 0; e < t.length - 1; e++) {
    let n = t[e], s = t[e + 1];
    if (i >= s.z) return gs(n.r, s.r, su((n.z - i) / (n.z - s.z), 0, 1));
  }
  return 2.5;
}
function iu(i, t, e, n, s) {
  let r = uc(i, new Gn(t, e, n));
  return r.instanceMatrix.setUsage(yo), r.boundingSphere = s.clone(), r;
}
function kf(i, t = {}) {
  let e = Math.max(0, t.sourceDrop ?? 83), n = Hf(new cn());
  n.name = "collector-flow", n.userData.effect = true, n.userData.sourceDrop = e, i.add(n);
  let s = new je(fn(0, -e * 0.43, 44), Math.max(110, e * 0.75 + 65)), r = new je(fn(0, -6, -20), 83), o = new je(fn(0, 0, -23), 11), a = new ve(), c = new R(), l = new Map([-1, 1].map((U) => [U, new on([fn(U * 6.5, -4, -23), fn(U * 16, -6, -21), fn(U * 32, -7, -17), fn(U * 48, -7, -13)])])), u = ac("#54e8d3", 0.68, 1, 0.045, 1), h = ac("#38b5b8", 0.28, 7, 0.09, 1), d = ac("#419fa8", 0.042, 5, 0.06, 1), f = ac("#f6b951", 0.26, 3, 0.25, 1), m = [];
  for (let U = 0; U < 12; U++) {
    let Z = U * Co / 12 + 0.045, k = Z + Co / 12 - 0.13, ot = [];
    for (let ft = 0; ft <= 18; ft++) {
      let xt = gs(Z, k, ft / 18);
      ot.push(fn(Math.cos(xt) * 34, Math.sin(xt) * 28, 38.1));
    }
    m.push(lc(ot, 0.3, 18));
  }
  cc(n, m, u);
  let v = new oe({ transparent: true, depthWrite: false, side: Pe, blending: Se, toneMapped: false, uniforms: { time: { value: 0 }, energy: { value: 1 } }, vertexShader: "varying vec2 vP;void main(){vP=position.xy/34.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `
      varying vec2 vP;uniform float time,energy;
      void main(){
        float r=length(vP),a=atan(vP.y,vP.x);
        float rim=exp(-pow((r-.935)/.027,2.));
        float spokes=pow(max(0.,sin(a*12.+r*5.-time*.7)),16.);
        float waves=pow(max(0.,sin(r*34.+time*2.5)),20.);
        float taper=smoothstep(.27,.7,r)*(1.-smoothstep(.95,.975,r));
        float alpha=energy*(rim*.34+(spokes*.11+waves*.065)*taper);
        if(alpha<.003)discard;
        vec3 cyan=vec3(.21,1.,.85)*(1.45+rim*1.5+spokes*.45);
        gl_FragColor=vec4(cyan,alpha);
      }` }), x = uc(n, new se(new is(8, 33, 96, 12), v));
  x.name = "collector-intake-energy-field", x.position.z = 38.55, x.scale.y = 28 / 34;
  let p = [], E = [], _ = [];
  for (let U = 0; U < 8; U++) {
    let Z = [];
    for (let k = 0; k <= 64; k++) {
      let ot = k / 64, ft = gs(37, -25.4, ot), xt = U * Co / 8 + ot * 1.75, Wt = zf(ft) * (0.89 - ot * 0.06);
      Z.push(fn(Math.cos(xt) * Wt, Math.sin(xt) * Wt * 0.82, ft));
    }
    p.push(lc(Z, 0.12, 64));
  }
  cc(n, p, h);
  for (let U = 0; U < 3; U++) {
    let Z = -15 + U * 17.5, k = (U - 1) * 19, ot = U === 1 ? -14 : -11, xt = new $s(fn(Z, -e + (U - 1) * 2, 109), fn(Z * 0.45, -e * (72 / 83), 75), fn(k * 0.8, -e * (32 / 83), 55), fn(k, ot, 38)).getPoints(48);
    E.push(lc(xt, 0.065, 40));
  }
  let g = cc(n, E, d);
  for (let U = 0; U < 2; U++) {
    let Z = [];
    for (let k = 0; k <= 36; k++) {
      let ot = k / 36, ft = U * Math.PI + ot * 2.4, xt = 4.2 * Math.pow(1 - ot, 1.2) + 0.4;
      Z.push(fn(Math.cos(ft) * xt, Math.sin(ft) * xt * 0.8, gs(-18.5, -27.8, ot)));
    }
    _.push(lc(Z, 0.055, 36));
  }
  cc(n, _, f);
  let M = new ze({ color: "#cfbda5", vertexColors: true, metalness: 0.13, roughness: 0.96, flatShading: true }), w = new ze({ color: "#b6b3a9", vertexColors: true, metalness: 0.04, roughness: 1, flatShading: true }), P = new ze({ color: "#e1ad4a", emissive: "#ffb53e", emissiveIntensity: 1.8, metalness: 0.58, roughness: 0.3, flatShading: true, toneMapped: false }), C = [], b = [];
  for (let U = 0; U < 3; U++) C.push(iu(n, Bf(U, 1, true), M, 8, s)), b.push(iu(n, Bf(U + 3, 0, false), w, 16, r));
  let S = iu(n, new Dn(1, 0), P, 144, o), D = new rn({ color: "#ffc15b", transparent: true, opacity: 0.14, depthWrite: false, blending: Se, toneMapped: false }), F = uc(n, new se(new Xn(2.62, 24, 16), D));
  F.position.set(0, 0, -28);
  function B(U, Z, k, ot, ft, xt, Wt, ie, Ot, Xt = 1) {
    a.position.set(k, ot, ft), a.rotation.set(Wt, ie, Ot), a.scale.set(xt * Xt, xt, xt * 0.9), a.updateMatrix(), U.setMatrixAt(Z, a.matrix);
  }
  function H(U, Z = {}) {
    let k = su(Math.round(Z.effectLevel ?? 2), 0, 3), ot = Z.enabled !== false && (Z.progress ?? 1) >= 0.82 && k > 0;
    if (n.visible = ot, !ot) return;
    let ft = [0, 0.58, 1, 1.22][k], xt = [0, 9, 15, 21][k], Wt = [0, 16, 30, 44][k], ie = [0, 48, 96, 144][k];
    for (let Ot of [u, h, d, f, v]) Ot.uniforms.time.value = U, Ot.uniforms.energy.value = ft;
    g.visible = k >= 2, P.emissiveIntensity = 1.8 * ft, D.opacity = 0.14 * ft * (0.9 + 0.1 * Math.sin(U * 1.1)), F.scale.setScalar(1 + 0.025 * Math.sin(U * 1.1));
    for (let Ot = 0; Ot < C.length; Ot++) {
      let Xt = C[Ot], K = Math.max(0, Math.ceil((xt - Ot) / 3));
      Xt.count = K;
      for (let tt = 0; tt < K; tt++) {
        let at = tt * 3 + Ot, Rt = 27 + _e(at, 1) * 19, Et = hc(U / Rt + _e(at, 2)), Kt = Math.pow(Et, 1.08), ce = _e(at, 3) * Co, L = 0.12 + _e(at, 4) * 0.54, it = Math.cos(ce) * 34 * L, et = Math.sin(ce) * 34 * L * 0.8, j, J, pt;
        if (Kt < 0.58) {
          let kt = Kt / 0.58, Ht = 1 - kt, I = Ht * Ht * Ht, T = 3 * Ht * Ht * kt, G = 3 * Ht * kt * kt, Y = kt * kt * kt, st = -15 + _e(at, 31) * 35, $ = -e + (_e(at, 32) - 0.5) * 10, Dt = 102 + _e(at, 33) * 13;
          j = st * I + st * 0.45 * T + it * 0.8 * G + it * Y, J = $ * I - e * (72 / 83) * T - e * (32 / 83) * G + et * Y, pt = Dt * I + 75 * T + 55 * G + 38 * Y;
        } else {
          let kt = (Kt - 0.58) / 0.42;
          pt = gs(38, -22.8, kt);
          let Ht = ce + kt * 0.62, I = zf(pt) * L;
          j = Math.cos(Ht) * I, J = Math.sin(Ht) * I * 0.8;
        }
        let lt = mr(0, 0.045, Et) * (1 - mr(0.9, 1, Et)), _t = (1.1 + Math.pow(_e(at, 5), 1.8) * 2.9) * lt;
        B(Xt, tt, j, J, pt, _t, U * (0.09 + _e(at, 7) * 0.11) + at, U * (0.065 + _e(at, 8) * 0.1) + at * 0.71, U * (0.04 + _e(at, 9) * 0.07), 0.82 + _e(at, 10) * 0.45);
      }
      Xt.instanceMatrix.needsUpdate = true;
    }
    for (let Ot = 0; Ot < b.length; Ot++) {
      let Xt = b[Ot], K = Math.max(0, Math.ceil((Wt - Ot) / 3));
      Xt.count = K;
      for (let tt = 0; tt < K; tt++) {
        let at = tt * 3 + Ot, Rt = at % 2 ? 1 : -1, Et = hc(U / (5.4 + _e(at, 12) * 3.2) + _e(at, 13)), Kt = 14 + (_e(at, 15) - 0.5) * 2, ce, L, it;
        if (Et < 0.67) l.get(Rt).getPoint(Et / 0.67, c), ce = c.x, L = c.y + (_e(at, 14) - 0.5) * 0.24, it = c.z + (_e(at, 17) - 0.5) * 0.48;
        else {
          let J = (Et - 0.67) / 0.33;
          ce = Rt * (48 + 8 * J), L = gs(-7, Kt, J) + Math.sin(J * Math.PI) * (_e(at, 16) - 0.5) * 0.5, it = -13 - 19 * J + J * (_e(at, 17) - 0.5) * 1.4;
        }
        let et = mr(0, 0.055, Et) * (1 - mr(0.88, 1, Et)), j = (0.16 + _e(at, 18) * 0.5) * et;
        B(Xt, tt, ce, L, it, j, U * (0.6 + _e(at, 19)) + at, U * (0.4 + _e(at, 20)) + at * 0.9, U * (0.3 + _e(at, 21)) + at * 0.4, 0.75 + _e(at, 22) * 0.65);
      }
      Xt.instanceMatrix.needsUpdate = true;
    }
    S.count = ie;
    for (let Ot = 0; Ot < ie; Ot++) {
      let Xt = hc(U / (2.9 + _e(Ot, 24) * 2.1) + _e(Ot, 25)), K = _e(Ot, 26) * Co + Xt * 2.8, tt = (4.2 * Math.pow(1 - Xt, 1.18) + 0.25) * (0.22 + _e(Ot, 27) * 0.78), at = mr(0, 0.06, Xt) * (1 - mr(0.9, 1, Xt)), Rt = (0.14 + _e(Ot, 28) * 0.22) * at;
      B(S, Ot, Math.cos(K) * tt, Math.sin(K) * tt * 0.82, gs(-18.5, -28, Xt), Rt, U * 0.8 + Ot, U * 0.5 + Ot * 0.9, U * 0.6 + Ot * 0.2, 1.15);
    }
    S.instanceMatrix.needsUpdate = true;
  }
  function W() {
    let U = /* @__PURE__ */ new Set(), Z = /* @__PURE__ */ new Set();
    n.traverse((k) => {
      if (k.geometry && U.add(k.geometry), k.material) for (let ot of Array.isArray(k.material) ? k.material : [k.material]) Z.add(ot);
    });
    for (let k of U) k.dispose();
    for (let k of Z) k.dispose();
    n.removeFromParent();
  }
  return H(0, { enabled: true, progress: 1, effectLevel: 2 }), { group: n, update: H, dispose: W };
}
function ru(i, t, e, n, s = 0) {
  let r = rt(i, n);
  r.rotation.y = s, O(r, [t + 0.7, 0.4, e + 0.7], [0, 0, 0], y.dark);
  let o = Math.max(2, Math.round(t / 2)), a = Math.max(3, Math.round(e / 2.3));
  for (let c = 0; c < o; c++) for (let l = 0; l < a; l++) {
    let u = (c - (o - 1) / 2) * t / o, h = (l - (a - 1) / 2) * e / a;
    O(r, [t / o - 0.13, 0.12, e / a - 0.15], [u, 0.26, h], y.solar), O(r, [0.035, 0.03, e / a - 0.22], [u, 0.34, h], y.hull);
  }
  return mt(r, [-t / 2, -0.3, 0], [t / 2, -0.3, 0], 0.5, y.edge), r;
}
function Ov(i, t = 2) {
  let e = ms(i), n = new Dn(1, t), s = n.attributes.position, r = 0.85 + e() * 0.62, o = 0.65 + e() * 0.45, a = 0.83 + e() * 0.57, c = 3.5 + e() * 2.2, l = e() * 9;
  for (let u = 0; u < s.count; u++) {
    let h = s.getX(u), d = s.getY(u), f = s.getZ(u), m = 1 + 0.13 * Math.sin(h * c + l) * Math.cos(f * c * 1.7 - d * 3) + 0.1 * Math.sin(d * c * 2.4 + f * 4.3) + 0.055 * Math.cos(h * 17 - d * 11 + f * 14), v = 1 - 0.22 * Math.exp(-((h - 0.45) ** 2 + (d - 0.7) ** 2 + (f - 0.4) ** 2) / 0.15);
    s.setXYZ(u, h * m * r * v, d * m * o * v, f * m * a * v);
  }
  return n.computeVertexNormals(), n.computeBoundingSphere(), n;
}
function Bv(i, t, e, n) {
  let s = rt(i, n);
  O(s, [t, 1.1, e], [0, 0, 0], y.edge), O(s, [t - 0.5, 0.22, e - 0.5], [0, 0.65, 0], y.dark);
  for (let r = -t / 2 + 1; r < t / 2; r += 2.8) O(s, [0.65, 0.2, 1.2], [r, 0.8, e / 2 - 0.7], y.gold), O(s, [0.65, 0.2, 1.2], [r, 0.8, -e / 2 + 0.7], y.gold);
  for (let r of [-e / 2 + 0.7, e / 2 - 0.7]) {
    mt(s, [-t / 2, 1.8, r], [t / 2, 1.8, r], 0.13, y.hull);
    for (let o = -t / 2; o <= t / 2; o += 4) mt(s, [o, 0.7, r], [o, 1.8, r], 0.13, y.edge);
  }
  return s;
}
function zv(i, t, e = 3) {
  let n = rt(i, t);
  for (let s = 0; s < e; s++) {
    let r = (s - (e - 1) / 2) * 3.6;
    wt(n, 1.3, 1.3, 6.5, [r, 2.8, 0], y.hull, 14), wt(n, 0.7, 1.3, 0.7, [r, 6.4, 0], y.light, 14), wt(n, 1.3, 0.9, 0.7, [r, -0.8, 0], y.dark, 14);
    for (let o of [0.3, 4.9]) ae(n, 1.35, 0.16, [r, o, 0], y.edge);
    O(n, [0.2, 3.8, 0.1], [r, 3, 1.32], y.cyan), mt(n, [r, -1, 0], [r, -1, 2], 0.35, y.copper);
  }
  return mt(n, [-(e - 1) * 1.8, -1, 2], [(e - 1) * 1.8, -1, 2], 0.6, y.copper), n;
}
function Hv(i, t = 1) {
  let e = rt(i);
  e.scale.setScalar(t), Bv(e, 24, 25, [0, 0, 0]);
  for (let n of [-9, 9]) for (let s of [-9, 9]) Le(e, [n, -6, s], [n, 0, s], 1.3, y.edge, 3);
  O(e, [8, 6, 15], [-5, 3.7, -2], y.hull), O(e, [8.3, 1.1, 15.2], [-5, 7.3, -2], y.dark);
  for (let n = -7; n <= 3; n += 2) O(e, [0.14, 1.2, 1.5], [-0.92, 5.6, n], y.cyan), O(e, [1.8, 0.5, 1.5], [-7, 8, n], y.edge);
  zv(e, [6, 2, 2], 2), wt(e, 3, 3.9, 8, [2, 4.5, -6.5], y.dark, 12), wt(e, 2.6, 3, 1.6, [2, 9.3, -6.5], y.light, 12);
  for (let n = 0; n < 10; n++) {
    let s = n * ge / 10, r = rt(e, [2 + Math.cos(s) * 3.7, 4.5, -6.5 + Math.sin(s) * 3.7]);
    r.rotation.y = -s, O(r, [2, 0.32, 1.6], [0, -2, 0], y.copper), O(r, [2, 0.32, 1.6], [0, 0, 0], y.copper), O(r, [2, 0.32, 1.6], [0, 2, 0], y.copper), O(r, [0.3, 6, 0.4], [0.7, 0, 0], y.edge);
  }
  ae(e, 2.75, 0.17, [2, 9.5, -6.5], y.amber);
  for (let n = 0; n < 3; n++) O(e, [5.5, 2.3, 3.2], [-5, 2, 8 + n * 3.6], n % 2 ? y.gold : y.edge);
  for (let n of [-1, 1]) {
    Le(e, [n * 9, -2, -1], [n * 21, -2, -1], 1.3, y.edge, 4);
    let s = ru(e, 8, 20, [n * 21, -2, -1]);
    s.rotation.z = n * 0.2;
  }
  return e;
}
function Wf({ orbitRadius = 320, beltInnerRadius = 306, beltWidth = 57, stationRadius = 270 } = {}) {
  let i = Jn("asteroid_belt", 86), t = ms(7351), e = [-0.7, 0.5, 2.05, 3.75], n = e.map((p) => new R(Math.cos(p) * stationRadius, 6, Math.sin(p) * stationRadius));
  i.transferAnchor = n[0].clone().add(new R(0, 3, 0)), i.extentRadius = Math.max(orbitRadius + 82, beltInnerRadius + beltWidth + 39), i.followFocus = true, i.detailFocus = new R(), i.detailRadius = 44, i.viewDirection = new R(), i.detailDirection = new R(), i.labelAnchor = new R(), i.collectorSettings = { orbitRadius, orbitHeight: 83, angularSpeed: 0.012, startAngle: -0.65, captureDrop: 83 };
  let s = [new ze({ color: 7830658, roughness: 0.96, metalness: 0.13, flatShading: true }), new ze({ color: 8549478, roughness: 0.94, metalness: 0.19, flatShading: true }), new ze({ color: 9672853, roughness: 0.9, metalness: 0.17, flatShading: true }), new ze({ color: 10718048, roughness: 0.65, metalness: 0.5, flatShading: true })], r = [], o = new ve();
  for (let p = 0; p < 8; p++) {
    let _ = new Gn(Ov(110 + p * 27, 1), s[p % 4], 72);
    _.name = "sparse-asteroids-" + p, _.instanceMatrix.setUsage(yo), _.frustumCulled = false, Ie(_), i.group.add(_);
    let g = [];
    for (let M = 0; M < 72; M++) {
      let w = t() * ge, P = beltInnerRadius + t() * beltWidth, C = 0.22 + Math.pow(t(), 2.5) * 1.25;
      g.push({ x: Math.cos(w) * P, y: (t() - 0.5) * 7, z: Math.sin(w) * P, size: C, sx: 0.7 + t() * 0.9, sy: 0.6 + t() * 0.65, sz: 0.8 + t() * 0.7, rx: t() * ge, ry: t() * ge, rz: t() * ge, speed: (t() - 0.5) * 0.028 }), _.setColorAt(M, new Ct().setHSL(0.08 + t() * 0.04, 0.055 + t() * 0.08, 0.65 + t() * 0.25));
    }
    r.push({ field: _, data: g });
  }
  let a = [];
  for (let p = 0; p < n.length; p++) {
    let E = Zt(i, rt(i.group, n[p].toArray()), 0.16 + p * 0.15);
    E.name = "ore-transfer-station-" + p, E.rotation.y = -e[p], Hv(E, 0.72), Le(E, [0, -3, 9], [0, -3, 23], 1.4, y.edge, 5), O(E, [8, 0.7, 7], [0, -2.1, 22], y.dark);
    for (let _ of [-3.5, 3.5]) mt(E, [_, -1.5, 18.5], [_, -1.5, 25.5], 0.14, y.cyan), O(E, [0.5, 2, 0.6], [_, -0.5, 25.5], y.gold);
    for (let _ = 0; _ < 3; _++) {
      let g = rt(E, [-4 + _ * 4, -0.8, 22]);
      O(g, [2.8, 1.8, 3.2], [0, 0, 0], _ % 2 ? y.gold : y.hull);
      for (let M of [-1, 0, 1]) O(g, [2.9, 0.2, 0.16], [0, 0.7, M], y.edge);
    }
    for (let _ = 0; _ < 2; _++) {
      let g = Ie(yi(E, 0.8));
      O(g, [1.1, 0.6, 1.2], [0, 0.55, 0.5], y.gold), a.push((M) => {
        let w = M * 0.07 + _ * Math.PI + p;
        g.position.set(Math.cos(w) * 23, 8 + Math.sin(w * 2) * 2, 23 + Math.sin(w) * 16), g.rotation.y = -w;
      });
    }
  }
  let c = Of(i);
  c.group.name = "leviathan-collector";
  let l = kf(c.group, { sourceDrop: i.collectorSettings.captureDrop });
  i.collector = c, i.collectorFlow = l;
  let u = c.focusLocal || new R(0, 0, 8), h = c.detailFocusLocal || new R(0, 0, -8), d = c.viewDirectionLocal || new R(1.3, 0.75, 1.6).normalize(), f = c.detailDirectionLocal || new R(1.5, 0.65, 1.2).normalize(), m = new R(0, 43, 15), v = (p) => {
    let E = i.collectorSettings, _ = E.startAngle + p * E.angularSpeed;
    c.group.position.set(Math.cos(_) * E.orbitRadius, E.orbitHeight, Math.sin(_) * E.orbitRadius), c.group.rotation.y = -_, c.group.updateMatrix(), i.focus.copy(u).applyMatrix4(c.group.matrix), i.detailFocus.copy(h).applyMatrix4(c.group.matrix), i.viewDirection.copy(d).applyQuaternion(c.group.quaternion), i.detailDirection.copy(f).applyQuaternion(c.group.quaternion), i.labelAnchor.copy(m).applyMatrix4(c.group.matrix);
  }, x = (p) => {
    for (let { field: E, data: _ } of r) {
      for (let g = 0; g < _.length; g++) {
        let M = _[g];
        o.position.set(M.x, M.y, M.z), o.scale.set(M.size * M.sx, M.size * M.sy, M.size * M.sz), o.rotation.set(M.rx + p * M.speed, M.ry + p * M.speed * 0.7, M.rz + p * M.speed * 0.43), o.updateMatrix(), E.setMatrixAt(g, o.matrix);
      }
      E.instanceMatrix.needsUpdate = true;
    }
  };
  return i.update = (p, E, _) => {
    v(E), x(E), c.update(E, _), l.update(E, _);
    for (let g of a) g(E);
  }, x(0), v(0), i;
}
export {
  Wf as createAsteroidIndustry
};
