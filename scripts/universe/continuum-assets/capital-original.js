// Verbatim factory bodies extracted from the user-supplied CONTINUUM-离线预览 (3).html.
// SHA-256 194e180b93b64f0c906fba3d80bc65fd0a18cab04d1fcb9402aa7f2722cf2f4d
// Regenerate with node scripts/extract-continuum-assets.mjs. Extend through adapters, not here.
function Xg(i42) {
  let e = { concrete: 10856094, concreteDark: 7831164, pale: 12896448, white: 13882569, blue: 5006709, blueLight: 7900825, navy: 3097424, dark: 2569276, steel: 8951194, alloy: 11845051, rust: 9139809, rubber: 2107949, yellow: 12690267, road: 4542033, earth: 9141869, gravel: 11182734, glass: 3428190, solar: 2506580, warm: 13220494, green: 7371113 }, t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), r = (Ce) => (t.add(Ce), Ce), o = (Ce) => {
    let le = new i42.MeshStandardMaterial({ vertexColors: true, ...Ce });
    return n.add(le), le;
  }, a = { paint: o({ roughness: 0.61, metalness: 0.28 }), steel: o({ roughness: 0.39, metalness: 0.75 }), concrete: o({ roughness: 0.91, metalness: 0.015 }), earth: o({ roughness: 0.98, metalness: 0 }), glass: o({ roughness: 0.24, metalness: 0.48 }), lamp: o({ roughness: 0.42, metalness: 0.2, emissive: 10256720, emissiveIntensity: 0.18 }) }, l = (Ce) => new i42.Vector3(...Ce), c = new i42.Vector3(0, 1, 0), d = new i42.Quaternion(), f = new i42.Matrix4(), h = new i42.Matrix3(), p = new i42.Vector3(), u = new i42.Vector3(), _ = new i42.Color(), g = (Ce) => Ce?.isQuaternion ? Ce : Ce ? new i42.Quaternion().setFromEuler(new i42.Euler(...Ce)) : d;
  function m(Ce, le) {
    return s.has(Ce) || s.set(Ce, r(le())), s.get(Ce);
  }
  function S(Ce, le, Be, ze = 0.01) {
    return m(`box:${Ce}:${le}:${Be}:${ze}`, () => {
      if (!ze) return new i42.BoxGeometry(Ce, le, Be);
      let re = [Ce / 2, le / 2, Be / 2], F = Math.min(ze, ...re.map((Qe) => Qe * 0.38)), ve = re.map((Qe) => Qe - F), ae = [];
      function $e(Qe, _t) {
        let vt = l(Qe[0]);
        l(Qe[1]).sub(vt).cross(l(Qe[2]).sub(vt)).dot(l(_t)) < 0 && Qe.reverse();
        for (let Ye = 1; Ye < Qe.length - 1; Ye++) ae.push(...Qe[0], ...Qe[Ye], ...Qe[Ye + 1]);
      }
      for (let Qe = 0; Qe < 3; Qe++) for (let _t of [-1, 1]) {
        let vt = (Qe + 1) % 3, Ye = (Qe + 2) % 3, ut = [0, 0, 0];
        ut[Qe] = _t, $e([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([lt, at]) => {
          let ct = [0, 0, 0];
          return ct[Qe] = _t * re[Qe], ct[vt] = lt * ve[vt], ct[Ye] = at * ve[Ye], ct;
        }), ut);
      }
      for (let Qe = 0; Qe < 3; Qe++) for (let _t = Qe + 1; _t < 3; _t++) for (let vt of [-1, 1]) for (let Ye of [-1, 1]) {
        let ut = 3 - Qe - _t, lt = [0, 0, 0];
        lt[Qe] = vt, lt[_t] = Ye, $e([[Qe, -1], [_t, -1], [_t, 1], [Qe, 1]].map(([at, ct]) => {
          let Ct = [0, 0, 0];
          return Ct[Qe] = vt * (at === Qe ? re[Qe] : ve[Qe]), Ct[_t] = Ye * (at === _t ? re[_t] : ve[_t]), Ct[ut] = ct * ve[ut], Ct;
        }), lt);
      }
      for (let Qe of [-1, 1]) for (let _t of [-1, 1]) for (let vt of [-1, 1]) $e([0, 1, 2].map((Ye) => [Qe, _t, vt].map((ut, lt) => ut * (Ye === lt ? re[lt] : ve[lt]))), [Qe, _t, vt]);
      let rt = new i42.BufferGeometry();
      return rt.setAttribute("position", new i42.Float32BufferAttribute(ae, 3)), rt.computeVertexNormals(), rt;
    });
  }
  let M = (Ce, le, Be = 16, ze = Ce) => m(`cyl:${Ce}:${ze}:${le}:${Be}`, () => new i42.CylinderGeometry(Ce, ze, le, Be)), y = (Ce, le, Be = 32) => m(`torus:${Ce}:${le}:${Be}`, () => new i42.TorusGeometry(Ce, le, 6, Be)), Y = (Ce = 1) => m(`sphere:${Ce}`, () => new i42.SphereGeometry(Ce, 16, 10));
  class b {
    constructor(le) {
      this.name = le, this.parts = /* @__PURE__ */ new Map();
    }
    add(le, Be, ze = e.blue, re = "paint", F = null, ve = [1, 1, 1]) {
      this.parts.has(re) || this.parts.set(re, { p: [], n: [], c: [] });
      let ae = this.parts.get(re), $e = le.attributes.position, rt = le.attributes.normal, Qe = le.index;
      f.compose(l(Be), g(F), l(ve)), h.getNormalMatrix(f), _.set(ze);
      for (let _t = 0, vt = Qe ? Qe.count : $e.count; _t < vt; _t++) {
        let Ye = Qe ? Qe.getX(_t) : _t;
        p.fromBufferAttribute($e, Ye).applyMatrix4(f), u.fromBufferAttribute(rt, Ye).applyMatrix3(h).normalize(), ae.p.push(p.x, p.y, p.z), ae.n.push(u.x, u.y, u.z), ae.c.push(_.r, _.g, _.b);
      }
      return this;
    }
    box(le, Be, ze = e.blue, re = "paint", F = 0.012, ve = null) {
      return this.add(S(...Be, F), le, ze, re, ve);
    }
    cyl(le, Be, ze, re = e.steel, F = "steel", ve = 16, ae = null, $e = Be) {
      return this.add(M(Be, ze, ve, $e), le, re, F, ae);
    }
    torus(le, Be, ze, re = e.steel, F = "steel", ve = [Math.PI / 2, 0, 0], ae = 32) {
      return this.add(y(Be, ze, ae), le, re, F, ve);
    }
    ball(le, Be, ze = e.pale, re = "paint") {
      return this.add(Y(), le, ze, re, null, Be);
    }
    beam(le, Be, ze = 0.03, re = ze, F = e.steel, ve = "steel") {
      let ae = l(Be).sub(l(le)), $e = ae.length();
      return $e < 1e-8 ? this : this.add(S(ze, $e, re, Math.min(ze, re) * 0.12), l(le).addScaledVector(ae, 0.5).toArray(), F, ve, new i42.Quaternion().setFromUnitVectors(c, ae.normalize()));
    }
    pipe(le, Be, ze = 0.035, re = e.steel, F = "steel", ve = 10) {
      let ae = l(Be).sub(l(le)), $e = ae.length();
      return $e < 1e-8 ? this : this.add(M(ze, $e, ve), l(le).addScaledVector(ae, 0.5).toArray(), re, F, new i42.Quaternion().setFromUnitVectors(c, ae.normalize()));
    }
    ibeam(le, Be, ze = 0.12, re = 0.18, F = e.steel) {
      let ve = l(Be).sub(l(le)), ae = ve.length(), $e = new i42.Quaternion().setFromUnitVectors(c, ve.clone().normalize()), rt = l(le).addScaledVector(ve, 0.5);
      for (let Qe of [-1, 1]) this.add(S(ze, ae, re * 0.14, 3e-3), rt.clone().add(new i42.Vector3(0, 0, Qe * re * 0.43).applyQuaternion($e)).toArray(), F, "steel", $e);
      return this.add(S(ze * 0.16, ae, re * 0.83, 2e-3), rt.toArray(), F, "steel", $e);
    }
    make(le) {
      let Be = r(new i42.BufferGeometry());
      return Be.setAttribute("position", new i42.Float32BufferAttribute(le.p, 3)), Be.setAttribute("normal", new i42.Float32BufferAttribute(le.n, 3)), Be.setAttribute("color", new i42.Float32BufferAttribute(le.c, 3)), Be.computeBoundingBox(), Be.computeBoundingSphere(), Be;
    }
    geometry() {
      let le = { p: [], n: [], c: [] };
      for (let Be of this.parts.values()) for (let ze of ["p", "n", "c"]) for (let re of Be[ze]) le[ze].push(re);
      return this.make(le);
    }
    finish(le, Be = true) {
      let ze = [];
      for (let [re, F] of this.parts) {
        let ve = new i42.Mesh(this.make(F), a[re]);
        ve.name = `${this.name} / ${re}`, ve.castShadow = Be && re !== "earth", ve.receiveShadow = true, le.add(ve), ze.push(ve);
      }
      return this.parts.clear(), ze;
    }
  }
  function O(Ce, le) {
    let Be = new i42.Group();
    return Be.name = le, Ce.add(Be), Be;
  }
  function A(Ce, le, Be, ze, re = a.paint) {
    let F = new i42.InstancedMesh(Ce, re, le.length);
    F.name = ze, F.castShadow = true, F.receiveShadow = true;
    for (let ve = 0; ve < le.length; ve++) {
      let ae = le[ve];
      f.compose(l(ae.p), g(ae.r), l(ae.scale || [1, 1, 1])), F.setMatrixAt(ve, f), ae.color !== void 0 && F.setColorAt(ve, new i42.Color(ae.color));
    }
    return F.computeBoundingBox(), F.computeBoundingSphere(), Be.add(F), F;
  }
  function V(Ce, le, Be, ze = 0.18, re = 0.48) {
    let F = l(Be).sub(l(le)), ve = Math.max(1, Math.ceil(F.length() / re));
    for (let ae = 0; ae <= ve; ae++) {
      let $e = l(le).addScaledVector(F, ae / ve);
      Ce.pipe($e.toArray(), $e.clone().add(new i42.Vector3(0, ze, 0)).toArray(), 7e-3);
    }
    for (let ae of [ze * 0.48, ze]) Ce.pipe([le[0], le[1] + ae, le[2]], [Be[0], Be[1] + ae, Be[2]], 6e-3, ae === ze ? e.yellow : e.steel);
  }
  function ie(Ce, le, Be, ze, re, F = 0.16) {
    for (let ve of [-1, 1]) Ce.pipe([le + ve * F / 2, Be, ze], [le + ve * F / 2, Be + re, ze], 8e-3);
    for (let ve = 0.04; ve < re; ve += 0.065) Ce.pipe([le - F / 2, Be + ve, ze], [le + F / 2, Be + ve, ze], 6e-3);
  }
  function Q(Ce, le, Be, ze = 0.46) {
    let re = l(Be).sub(l(le)), F = Math.hypot(re.x, re.z), ve = Math.max(3, Math.ceil(Math.abs(re.y) / 0.05)), ae = Math.atan2(re.x, re.z), $e = new i42.Vector3(Math.cos(ae), 0, -Math.sin(ae));
    for (let rt = 0; rt < ve; rt++) {
      let Qe = l(le).addScaledVector(re, (rt + 0.5) / ve);
      Qe.y = le[1] + re.y * (rt + 1) / ve, Ce.box(Qe.toArray(), [ze, 0.03, F / ve + 0.01], e.concrete, "concrete", 3e-3, [0, ae, 0]);
    }
    for (let rt of [-1, 1]) {
      let Qe = l(le).addScaledVector($e, rt * ze * 0.48).toArray(), _t = l(Be).addScaledVector($e, rt * ze * 0.48).toArray();
      V(Ce, Qe, _t, 0.18);
    }
  }
  function ue(Ce, le, Be, ze, re = 1, F = 0.56) {
    Ce.box([le, Be + 0.16, ze], [re, 0.29, F], e.pale, "paint", 0.016), Ce.box([le, Be + 0.018, ze], [re + 0.06, 0.036, F + 0.06], e.dark, "steel", 4e-3);
    for (let ve = le - re / 2 + 0.09; ve < le + re / 2; ve += 0.075) Ce.box([ve, Be + 0.17, ze + F / 2 + 4e-3], [0.026, 0.2, 0.014], e.dark, "steel", 0);
    Ce.box([le, Be + 0.33, ze], [re * 0.7, 0.045, F * 0.78], e.steel, "steel", 4e-3);
  }
  function fe(Ce, le, Be, ze, re, F, { color: ve = e.blue, floors: ae = Math.max(2, Math.round(F / 0.48)), roof: $e = true } = {}) {
    Ce.box([le, 0.035, Be], [ze + 0.18, 0.07, re + 0.18], e.concrete, "concrete", 0.025), Ce.box([le, F / 2 + 0.07, Be], [ze, F, re], ve, "paint", 0.04);
    for (let rt = 0; rt < ae; rt++) {
      let Qe = 0.2 + (rt + 0.43) * F / ae, _t = Math.min(0.22, F / ae * 0.55);
      for (let vt of [-1, 1]) Ce.box([le, Qe, Be + vt * (re / 2 + 6e-3)], [ze - 0.22, _t, 0.028], e.glass, "glass", 3e-3), Ce.box([le + vt * (ze / 2 + 6e-3), Qe, Be], [0.028, _t, re - 0.22], e.glass, "glass", 3e-3);
    }
    for (let rt = le - ze / 2 + 0.32; rt < le + ze / 2; rt += 0.52) for (let Qe of [-1, 1]) Ce.box([rt, F / 2 + 0.07, Be + Qe * (re / 2 + 0.026)], [0.043, F + 0.03, 0.047], e.pale, "paint", 3e-3);
    for (let rt of [-1, 1]) Ce.box([le, F + 0.09, Be + rt * (re / 2 - 0.04)], [ze + 0.08, 0.1, 0.11], e.pale, "paint", 5e-3), Ce.box([le + rt * (ze / 2 - 0.04), F + 0.09, Be], [0.11, 0.1, re + 0.08], e.pale, "paint", 5e-3);
    Ce.box([le, 0.38, Be + re / 2 + 0.039], [0.64, 0.6, 0.058], e.dark, "paint", 0.01), Ce.box([le, 0.36, Be + re / 2 + 0.072], [0.49, 0.51, 0.018], e.glass, "glass", 3e-3);
    for (let rt of [-1, 1]) Ce.box([le + rt * 0.13, 0.37, Be + re / 2 + 0.088], [8e-3, 0.12, 0.011], e.alloy, "steel", 0);
    Ce.box([le, 0.76, Be + re / 2 + 0.29], [1, 0.065, 0.6], e.pale, "paint", 0.012);
    for (let rt of [-1, 1]) Ce.cyl([le + rt * 0.4, 0.36, Be + re / 2 + 0.46], 0.017, 0.67, e.steel, "steel", 8);
    $e && (Ce.box([le, F + 0.055, Be], [ze - 0.12, 0.028, re - 0.12], e.dark, "paint", 6e-3), ue(Ce, le - ze * 0.23, F + 0.08, Be, 0.85, 0.48), ue(Ce, le + ze * 0.24, F + 0.08, Be, 0.65, 0.44));
  }
  function He(Ce, le, Be, ze, re, F, { color: ve = e.blue, open: ae = false, bays: $e = 4, sawtooth: rt = false } = {}) {
    Ce.box([le, 0.045, Be], [ze + 0.18, 0.09, re + 0.22], e.concrete, "concrete", 0.018), Ce.box([le, F / 2 + 0.09, Be - re / 2], [ze, F, 0.085], ve, "paint", 0.018);
    for (let _t of [-1, 1]) Ce.box([le + _t * (ze / 2 - 0.043), F / 2 + 0.09, Be], [0.085, F, re], ve, "paint", 0.016);
    let Qe = ze / $e;
    for (let _t = 0; _t <= $e; _t++) {
      let vt = le - ze / 2 + _t * Qe;
      for (let Ye of [-1, 1]) Ce.ibeam([vt, 0.06, Be + Ye * re / 2], [vt, F + 0.11, Be + Ye * re / 2], 0.09, 0.12, e.steel);
      Ce.ibeam([vt, F + 0.09, Be - re / 2], [vt, F + 0.09, Be + re / 2], 0.09, 0.14, e.steel);
    }
    for (let _t = 0; _t < $e; _t++) {
      let vt = le - ze / 2 + (_t + 0.5) * Qe;
      if (ae) Ce.box([vt, F + 0.02, Be + re / 2 + 0.024], [Qe - 0.14, 0.18, 0.09], e.navy, "paint", 6e-3);
      else {
        Ce.box([vt, F * 0.54, Be + re / 2 + 8e-3], [Qe - 0.12, F - 0.16, 0.07], ve, "paint", 0.012), Ce.box([vt, 0.48, Be + re / 2 + 0.052], [Math.min(0.95, Qe - 0.2), 0.75, 0.04], e.pale, "paint", 5e-3);
        for (let Ye = 0; Ye < 8; Ye++) Ce.box([vt, 0.14 + Ye * 0.09, Be + re / 2 + 0.078], [Math.min(0.93, Qe - 0.22), 0.01, 9e-3], e.blueLight, "steel", 0);
      }
    }
    for (let _t = le - ze / 2 + 0.12; _t < le + ze / 2; _t += 0.28) for (let vt of ae ? [-1] : [-1, 1]) Ce.box([_t, F * 0.58, Be + vt * (re / 2 + 0.018)], [0.018, F * 0.82, 0.024], e.blueLight, "steel", 0);
    if (Ce.box([le, F + 0.14, Be], [ze + 0.2, 0.09, re + 0.22], e.dark, "steel", 0.012), rt) for (let _t = le - ze / 2 + 0.6; _t < le + ze / 2; _t += 1.32) Ce.box([_t, F + 0.37, Be], [0.79, 0.075, re - 0.15], e.blueLight, "paint", 0.012, [0, 0, -0.31]), Ce.box([_t + 0.42, F + 0.3, Be], [0.055, 0.29, re - 0.24], e.glass, "glass", 5e-3);
    else for (let _t = Be - re / 2 + 0.35; _t < Be + re / 2; _t += 0.44) Ce.box([le, F + 0.196, _t], [ze - 0.18, 0.018, 0.015], e.blueLight, "steel", 0);
    if (!ae) for (let _t of [-1, 1]) ue(Ce, le + _t * ze * 0.27, F + 0.2, Be, 1.1, 0.58);
    ie(Ce, le + ze / 2 + 0.1, 0.1, Be - re * 0.18, F + 0.12, 0.19);
  }
  function he(Ce, le, Be, ze, re, { color: F = e.pale, y: ve = 0, roof: ae = true } = {}) {
    Ce.cyl([le, ve + 0.05, Be], ze + 0.12, 0.1, e.concrete, "concrete", 24), Ce.cyl([le, ve + re / 2 + 0.1, Be], ze, re, F, "paint", 24);
    for (let $e of [0.24, re * 0.5, re - 0.04]) Ce.torus([le, ve + $e + 0.1, Be], ze + 0.012, 0.013, e.steel);
    ae && Ce.cyl([le, ve + re + 0.14, Be], ze, 0.085, e.steel, "steel", 24), ie(Ce, le + ze + 0.034, ve + 0.1, Be, re, 0.14), Ce.pipe([le, ve + 0.22, Be + ze], [le, ve + 0.22, Be + ze + 0.25], 0.04);
  }
  function Ae(Ce, le, Be, ze, re) {
    Ce.box([le, 0.08, Be], [ze, 0.16, re], e.concreteDark, "concrete", 0.025), Ce.box([le, 0.166, Be], [ze - 0.1, 0.013, re - 0.1], e.earth, "earth", 0);
    for (let F = 0; F < Math.ceil(ze / 0.4); F++) {
      let ve = le - ze / 2 + 0.22 + F * 0.38;
      Ce.ball([ve, 0.23, Be], [0.15, 0.085, Math.min(0.15, re * 0.31)], e.green, "earth");
    }
  }
  function ke(Ce = e.blueLight) {
    let le = new b("Original-scale utility tractor");
    le.box([0, 0.095, 0], [0.51, 0.075, 0.21], e.dark, "paint", 0.01), le.box([0.125, 0.196, 0], [0.18, 0.14, 0.196], Ce, "paint", 0.013), le.box([0.149, 0.212, 0.099], [0.115, 0.07, 8e-3], e.glass, "glass", 2e-3), le.box([0.149, 0.212, -0.099], [0.115, 0.07, 8e-3], e.glass, "glass", 2e-3), le.box([0.22, 0.2, 0], [0.013, 0.078, 0.166], e.glass, "glass", 2e-3), le.box([-0.106, 0.163, 0], [0.26, 0.06, 0.198], Ce, "paint", 7e-3);
    for (let Be of [-0.17, 0.17]) for (let ze of [-1, 1]) le.cyl([Be, 0.063, ze * 0.105], 0.05, 0.034, e.rubber, "paint", 12, [Math.PI / 2, 0, 0]), le.cyl([Be, 0.063, ze * 0.125], 0.023, 5e-3, e.steel, "steel", 10, [Math.PI / 2, 0, 0]);
    return le.box([0.252, 0.11, 0], [0.027, 0.035, 0.225], e.steel, "steel", 4e-3), le.box([0.262, 0.145, 0.075], [9e-3, 0.026, 0.037], e.warm, "lamp", 2e-3), le.box([0.262, 0.145, -0.075], [9e-3, 0.026, 0.037], e.warm, "lamp", 2e-3), le.geometry();
  }
  function we() {
    let Ce = new b("Sealed standard freight crate");
    Ce.box([0, 0.125, 0], [0.43, 0.25, 0.24], e.pale, "paint", 0.012);
    for (let le of [-0.16, 0.16]) Ce.box([le, 0.128, 0], [0.023, 0.235, 0.247], e.blueLight, "steel", 3e-3);
    for (let le of [-0.123, 0.123]) Ce.box([0, 0.068, le], [0.31, 0.026, 9e-3], e.navy, "paint", 1e-3), Ce.box([0.13, 0.18, le], [0.04, 0.027, 9e-3], e.yellow, "paint", 2e-3);
    return Ce.geometry();
  }
  function pt(Ce) {
    let le = /* @__PURE__ */ new Set();
    Ce.traverse((Be) => {
      Be.geometry && le.add(Be.geometry);
    });
    for (let Be of t) le.has(Be) || (Be.dispose(), t.delete(Be));
    s.clear();
  }
  function ot(Ce, le = []) {
    let Be = /* @__PURE__ */ new Set([Ce, ...le]), ze = /* @__PURE__ */ new Set();
    for (let re of Be) re.traverse((F) => {
      F.isInstancedMesh && ze.add(F);
    });
    for (let re of ze) re.dispose();
    for (let re of t) re.dispose();
    for (let re of n) re.dispose();
    t.clear(), n.clear(), s.clear();
    for (let re of Be) re.clear(), re.removeFromParent();
  }
  return { T: i42, C: e, mats: a, Batch: b, V: l, Q: g, group: O, instance: A, rail: V, ladder: ie, stairs: Q, roofPlant: ue, office: fe, hall: He, tank: he, planter: Ae, vehicleGeometry: ke, cargoGeometry: we, own: r, boxGeometry: S, cylinderGeometry: M, torusGeometry: y, sphereGeometry: Y, trimCaches: pt, dispose: ot, geometries: t, materials: n };
}
function Yg({ THREE: i42, seed: e = 17, size: t = { width: 60, depth: 44 }, ground: n = { heightAt: () => 0 } } = {}) {
  if (!i42?.Group) throw new TypeError("createCapitalAsset requires THREE.");
  let s = Number(t.width ?? 60), r = Number(t.depth ?? 44);
  if (!Number.isFinite(s) || !Number.isFinite(r) || s < 60 || r < 44) throw new RangeError("Capital spacing requires size.width >= 60 and size.depth >= 44.");
  if (!Number.isFinite(e)) throw new TypeError("seed must be finite.");
  e |= 0;
  let o = e >>> 0 || 1, a = () => (o ^= o << 13, o ^= o >>> 17, o ^= o << 5, (o >>> 0) / 4294967296), l = (C, $ = 0, Oe = 1) => Math.max($, Math.min(Oe, C)), c = (C) => (C = l(C), C * C * (3 - 2 * C)), d = (C, $, Oe) => C + ($ - C) * Oe, f = s / 60, h = r / 44, p = Xg(i42), { C: u, mats: _, Batch: g, V: m, Q: S, group: M, instance: y, office: Y, hall: b, tank: O, rail: A, stairs: V, roofPlant: ie, planter: Q } = p, ue = new i42.Group();
  ue.name = "CONCORD / \u9996\u90FD\u7EFC\u5408\u533A";
  let fe = {};
  for (let C of ["terrain", "perimeter", "roads", "utilities", "districts", "effects", "silhouette"]) fe[C] = M(ue, C);
  let He = typeof n?.heightAt == "function" ? n.heightAt : () => 0, he = (C, $) => {
    let Oe = Number(He(C, $));
    return Number.isFinite(Oe) ? Oe : 0;
  }, Ae = he(0, 0), ke = s / 2 + 3.1, we = r / 2 + 3, pt = [{ key: "mainArrival", label: "\u884C\u653F\u5230\u8FBE\u4E3B\u8F74", width: 2.15, points: [[0, 0, r / 2 + 6.2], [0, 0, 20.4 * h], [0, 0, 7 * h], [0, 0, 5.25 * h]] }, { key: "mineFreight", label: "\u77FF\u4E1A\u8054\u7EDC\u4E0E\u5317\u4FA7\u670D\u52A1\u8DEF", width: 1.4, points: [[-s / 2 - 6.4, 0, -11.5 * h], [-28.3 * f, 0, -11.5 * h], [-7.2 * f, 0, -11.5 * h], [28.3 * f, 0, -11.5 * h]] }, { key: "spaceportFreight", label: "\u6E2F\u53E3\u8054\u7EDC\u4E0E\u5236\u9020\u8D27\u8FD0\u8DEF", width: 1.55, points: [[s / 2 + 6.4, 0, 10.8 * h], [28.3 * f, 0, 10.8 * h], [7.2 * f, 0, 10.8 * h], [7.2 * f, 0, -11.5 * h]] }, { key: "perimeterService", label: "\u5468\u754C\u670D\u52A1\u73AF\u8DEF", width: 1.2, points: [[-26.8 * f, 0, -20.35 * h], [26 * f, 0, -20.35 * h], [28.3 * f, 0, -18.35 * h], [28.3 * f, 0, 18.75 * h], [26.7 * f, 0, 20.35 * h], [-26.7 * f, 0, 20.35 * h], [-28.3 * f, 0, 18.75 * h], [-28.3 * f, 0, -18.35 * h], [-26.8 * f, 0, -20.35 * h]] }, { key: "researchLink", label: "\u79D1\u7814\u4E0E\u516C\u5171\u670D\u52A1\u652F\u8DEF", width: 1.16, points: [[-7.2 * f, 0, -11.5 * h], [-7.2 * f, 0, 5.85 * h], [-28.3 * f, 0, 5.85 * h]] }, { key: "cleanManufacturing", label: "\u6D01\u51C0\u5236\u9020\u540E\u52E4\u652F\u8DEF", width: 1.2, points: [[7.2 * f, 0, 1.18 * h], [28.3 * f, 0, 1.18 * h]] }, { key: "solarMaintenance", label: "\u80FD\u6E90\u4E0E\u534F\u4F5C\u533A\u652F\u8DEF", width: 1.1, points: [[-18.2 * f, 0, 5.85 * h], [-18.2 * f, 0, 20.35 * h]] }];
  function ot(C, $, Oe, Ke) {
    let tt = Ke[0] - Oe[0], it = Ke[2] - Oe[2], Ge = l(((C - Oe[0]) * tt + ($ - Oe[2]) * it) / (tt * tt + it * it));
    return Math.hypot(C - Oe[0] - tt * Ge, $ - Oe[2] - it * Ge);
  }
  function Ce(C, $) {
    let Oe = Math.max(Math.abs(C) - s / 2 + 1.1, Math.abs($) - r / 2 + 1.1), Ke = c((Oe + 0.12) / 3.4), it = (he(C, $) - Ae - 0.2 + 0.14 * Math.sin(C * 0.27 + e * 0.71) * Math.cos($ * 0.33 - e * 0.43) + 0.065 * Math.sin(C * 0.9 + $ * 0.57)) * Ke, Ge = Math.hypot((C - 24 * f) / 2.7, ($ + 16 * h) / 1.85);
    if (Ge < 1.15 && (it -= 0.29 * (1 - c((Ge - 0.4) / 0.75))), Oe > -0.2) {
      let Dt = 0;
      for (let Vt of pt.slice(0, 3)) for (let Tt = 1; Tt < Vt.points.length; Tt++) Dt = Math.max(Dt, 1 - c((ot(C, $, Vt.points[Tt - 1], Vt.points[Tt]) - Vt.width / 2 - 0.1) / 0.65));
      it = d(it, 0, Dt);
    }
    return it;
  }
  let le = [];
  function Be(C, $) {
    let Oe = [], Ke = [], tt = [];
    for (let Ge = 0; Ge <= $; Ge++) for (let Dt = 0; Dt <= C; Dt++) {
      let Vt = Dt / C * 2 - 1, Tt = Ge / $ * 2 - 1, Xt = Tt * we, U = (Vt < 0 ? Math.exp(-(((Xt + 11.5 * h) / 2.6) ** 2)) : Math.exp(-(((Xt - 10.8 * h) / 2.6) ** 2))) * 3.9, be = Vt * (ke + U) + Math.abs(Vt) ** 8 * 0.24 * Math.sin(Xt * 0.61 + e), Le = Xt + (Tt > 0 ? Math.exp(-((be / 3.7) ** 2)) * 3.9 : 0) + Math.abs(Tt) ** 8 * 0.23 * Math.sin(be * 0.38 - e), w = Ce(be, Le);
      Oe.push(be, w - 4e-3, Le);
      let I = Math.max(Math.abs(be) - s / 2 + 1.3, Math.abs(Le) - r / 2 + 1.3), H = 0.97 + 0.04 * Math.sin(be * 2.3 + Le * 1.7 + e) + 0.026 * Math.sin(be * 10.1 - Le * 8.3), L = new i42.Color(I < -0.1 ? u.gravel : u.earth).multiplyScalar(H);
      if (Ke.push(L.r, L.g, L.b), (Dt === 0 || Dt === C || Ge === 0 || Ge === $) && C > 100 && le.push([be, Le]), Dt < C && Ge < $) {
        let q = Ge * (C + 1) + Dt, J = q + C + 1;
        tt.push(q, J, q + 1, J, J + 1, q + 1);
      }
    }
    let it = p.own(new i42.BufferGeometry());
    return it.setAttribute("position", new i42.Float32BufferAttribute(Oe, 3)), it.setAttribute("color", new i42.Float32BufferAttribute(Ke, 3)), it.setIndex(tt), it.computeVertexNormals(), it.computeBoundingBox(), it.computeBoundingSphere(), it;
  }
  let ze = new i42.Mesh(Be(184, 140), _.earth);
  ze.name = "Shared graded terrain and natural shoulders", ze.receiveShadow = true, fe.terrain.add(ze);
  let re = new i42.Mesh(Be(44, 34), _.earth);
  re.name = "Capital terrain silhouette", re.receiveShadow = true, fe.silhouette.add(re);
  let F = M(fe.roads, "road-markings-and-arrival"), ve = M(fe.roads, "far-public-roads"), ae = new g("Continuous public roads"), $e = new g("Public road silhouettes"), rt = new g("Street furniture and shared footways");
  function Qe(C, $, Oe, Ke, tt = u.road, it = "concrete", Ge = 0.01, Dt = 0.015) {
    let Vt = m($), Tt = m(Oe).sub(Vt), Xt = Tt.length(), U = Tt.clone().normalize(), be = new i42.Vector3().crossVectors(new i42.Vector3(0, 1, 0), U).normalize(), Le = new i42.Vector3().crossVectors(U, be).normalize(), w = new i42.Quaternion().setFromRotationMatrix(new i42.Matrix4().makeBasis(be, Le, U));
    C.box(Vt.addScaledVector(Tt, 0.5).add(new i42.Vector3(0, Ge - Dt / 2, 0)).toArray(), [Ke, Dt, Xt + 0.014], tt, it, 0, w);
  }
  function _t(C, $) {
    for (let Oe = 1; Oe < C.length; Oe++) {
      let Ke = C[Oe - 1], tt = C[Oe], it = Math.hypot(tt[0] - Ke[0], tt[2] - Ke[2]), Ge = Math.max(1, Math.ceil(it / 0.7));
      for (let Tt = 0; Tt < Ge; Tt++) {
        let Xt = m(Ke).lerp(m(tt), Tt / Ge), U = m(Ke).lerp(m(tt), (Tt + 1) / Ge);
        Xt.y = Ce(Xt.x, Xt.z), U.y = Ce(U.x, U.z), Qe(ae, Xt.toArray(), U.toArray(), $), Qe($e, Xt.toArray(), U.toArray(), $);
      }
      let Dt = (tt[0] - Ke[0]) / it, Vt = (tt[2] - Ke[2]) / it;
      for (let Tt = 0.32; Tt < it - 0.15; Tt += 0.7) {
        let Xt = Ke[0] + Dt * Tt, U = Ke[2] + Vt * Tt;
        Qe(ae, [Xt, Ce(Xt, U), U], [Xt + Dt * 0.28, Ce(Xt + Dt * 0.28, U + Vt * 0.28), U + Vt * 0.28], 0.016, u.pale, "paint", 0.02, 2e-3);
      }
      for (let Tt of [-1, 1]) {
        let Xt = [-Vt * ($ / 2 + 0.055) * Tt, Dt * ($ / 2 + 0.055) * Tt];
        Qe(ae, [Ke[0] + Xt[0], Ce(Ke[0] + Xt[0], Ke[2] + Xt[1]), Ke[2] + Xt[1]], [tt[0] + Xt[0], Ce(tt[0] + Xt[0], tt[2] + Xt[1]), tt[2] + Xt[1]], 0.09, u.concrete, "concrete", 0.035, 0.025);
      }
    }
  }
  for (let C of pt) _t(C.points, C.width);
  for (let [C, $, Oe] of [[[-6.8 * f, 0, 5.05 * h], [6.8 * f, 0, 5.05 * h], 0.6], [[-6.8 * f, 0, 5.05 * h], [-6.8 * f, 0, 7.2 * h], 0.56], [[6.8 * f, 0, 5.05 * h], [6.8 * f, 0, 10.8 * h], 0.56], [[-17 * f, 0, 18.7 * h], [0, 0, 18.7 * h], 0.5]]) Qe(rt, C, $, Oe, u.concrete, "concrete", 0.025, 0.028);
  function vt(C, $, Oe, Ke = 1.18) {
    let tt = Ce($, Oe);
    C.cyl([$, tt + Ke / 2, Oe], 0.014, Ke, u.steel, "steel", 8), C.beam([$, tt + Ke, Oe], [$ + 0.2, tt + Ke - 0.03, Oe], 0.025, 0.027, u.steel), C.box([$ + 0.18, tt + Ke - 0.045, Oe], [0.22, 0.035, 0.086], u.pale, "paint", 4e-3), C.box([$ + 0.18, tt + Ke - 0.066, Oe], [0.18, 9e-3, 0.063], u.warm, "lamp", 1e-3);
  }
  for (let C = 7.6; C < 21; C += 2.6) for (let $ of [-1.35, 1.35]) vt(rt, $, C * h, 1.26);
  for (let C = -26; C <= 27; C += 4.2) vt(rt, C * f, -10.6 * h), vt(rt, C * f, 19.4 * h);
  for (let C = -18; C <= 18; C += 4.5) for (let $ of [-27.38, 27.38]) vt(rt, $ * f, C * h, 1.1);
  for (let C of [7, 18.5, 21.15]) for (let $ = -4; $ <= 4; $++) rt.box([$ * 0.2, 0.027, C * h], [0.095, 4e-3, 0.66], u.pale, "paint", 0);
  for (let C of [-4, 4]) for (let $ of [9.2, 13, 16.8]) Q(rt, C * f, $ * h, 1.3, 0.44);
  for (let C of [-3.5, 3.5]) for (let $ of [9.3, 13]) {
    rt.box([C * f, 0.15, $ * h], [0.77, 0.045, 0.22], u.rust, "paint", 4e-3);
    for (let Oe of [-1, 1]) rt.box([C * f + Oe * 0.25, 0.075, $ * h], [0.035, 0.15, 0.2], u.steel, "steel", 3e-3);
  }
  for (let C of [-3, 3]) {
    rt.box([C * f, 0.83, 17.4 * h], [1.85, 0.05, 0.58], u.blueLight, "paint", 0.015);
    for (let $ of [-0.82, 0.82]) rt.box([C * f + $, 0.42, 17.4 * h], [0.035, 0.83, 0.035], u.steel, "steel", 3e-3);
    rt.box([C * f, 0.42, 17.12 * h], [1.66, 0.7, 0.018], u.glass, "glass", 2e-3);
  }
  ae.finish(F, false), rt.finish(F), $e.finish(ve, false);
  let Ye = [[-27 * f, -22 * h], [26 * f, -22 * h], [30 * f, -18.4 * h], [30 * f, 18 * h], [26 * f, 22 * h], [-26 * f, 22 * h], [-30 * f, 18 * h], [-30 * f, -18.4 * h]], ut = M(fe.perimeter, "Continuous wall fence drainage and gates"), lt = M(fe.perimeter, "Far city perimeter"), at = new g("Security perimeter"), ct = new g("Distant boundary"), Ct = new g("Capital arrival and freight gates"), se = [[0, r / 2, 2.65], [s / 2, 10.8 * h, 1.88], [-s / 2, -11.5 * h, 1.76]];
  function Ht(C, $) {
    return se.some(([Oe, Ke, tt]) => Math.hypot(C - Oe, $ - Ke) < tt / 2 + 0.2);
  }
  for (let C = 0; C < Ye.length; C++) {
    let $ = Ye[C], Oe = Ye[(C + 1) % Ye.length], Ke = Oe[0] - $[0], tt = Oe[1] - $[1], it = Math.hypot(Ke, tt), Ge = Math.ceil(it / 0.72);
    for (let Dt = 0; Dt < Ge; Dt++) {
      let Vt = (Dt + 0.5) / Ge, Tt = $[0] + Ke * Vt, Xt = $[1] + tt * Vt;
      if (Ht(Tt, Xt)) continue;
      let U = Math.atan2(Ke, tt), be = Ce(Tt, Xt), Le = it / Ge - 0.014;
      at.box([Tt, be + 0.125, Xt], [0.12, 0.25, Le], u.concreteDark, "concrete", 0.012, [0, U, 0]), ct.box([Tt, be + 0.18, Xt], [0.13, 0.36, Le], u.concreteDark, "concrete", 0, [0, U, 0]);
      let w = [$[0] + Ke * Dt / Ge, be + 0.25, $[1] + tt * Dt / Ge], I = [$[0] + Ke * (Dt + 1) / Ge, be + 0.25, $[1] + tt * (Dt + 1) / Ge];
      p.rail(at, w, I, 0.3, 0.72), Dt % 2 === 0 && at.pipe([w[0], be + 0.27, w[2]], [I[0], be + 0.54, I[2]], 4e-3, u.steel, "steel", 6);
    }
  }
  Y(Ct, -2.1, r / 2 - 0.15, 1.3, 0.95, 0.75, { color: u.blueLight, floors: 1, roof: false }), Ct.box([0, 1.02, r / 2 - 0.17], [3.5, 0.19, 0.3], u.navy, "paint", 0.028);
  for (let C of [-1.65, 1.65]) Ct.box([C, 0.52, r / 2 - 0.17], [0.18, 1.04, 0.2], u.concrete, "concrete", 0.015);
  for (let C of [-0.47, 0.47]) Ct.box([C, 0.25, r / 2 - 0.5], [0.055, 0.5, 0.055], u.dark, "paint", 8e-3), Ct.box([C + 0.22, 0.42, r / 2 - 0.5], [0.46, 0.035, 0.04], u.yellow, "paint", 5e-3, [0, 0, C < 0 ? -0.95 : 0.95]);
  for (let C of [-1, 1]) {
    let $ = C * s / 2, Oe = C > 0 ? 10.8 * h : -11.5 * h;
    Y(Ct, $ - C * 0.75, Oe + 1.62, 1.1, 0.8, 0.72, { color: u.concreteDark, floors: 1, roof: false }), Ct.box([$, 0.86, Oe], [0.25, 0.15, 2.4], u.navy, "paint", 0.025);
    for (let Ke of [-1.15, 1.15]) Ct.box([$, 0.42, Oe + Ke], [0.16, 0.84, 0.16], u.concrete, "concrete", 0.012);
  }
  at.finish(ut), Ct.finish(ut), ct.finish(lt);
  let de = M(fe.utilities, "Public utility corridors"), X = M(fe.utilities, "Far utility spine"), G = new g("Shared supply and drainage"), Fe = [[-26.5, 26.5, -12.38], [8.2, 26.5, 2.1]];
  for (let [C, $, Oe] of Fe) {
    for (let Ke of [0, 1, 2]) G.pipe([C * f, 1.1 + Ke * 0.085, Oe * h], [$ * f, 1.1 + Ke * 0.085, Oe * h], 0.034, Ke === 1 ? u.blueLight : u.steel);
    for (let Ke = C + 0.35; Ke < $; Ke += 2.15) if (!(Math.abs(Ke - 7.2) < 0.9 || Math.abs(Ke + 7.2) < 0.9)) {
      for (let tt of [-0.2, 0.2]) G.ibeam([Ke * f, 0.04, Oe * h + tt], [Ke * f, 0.99, Oe * h + tt], 0.045, 0.07, u.steel);
      G.beam([Ke * f, 0.99, Oe * h - 0.27], [Ke * f, 0.99, Oe * h + 0.27], 0.065, 0.06, u.steel);
    }
  }
  for (let C of [-27.3, 27.3]) {
    G.box([C * f, 0.014, 0], [0.13, 0.021, 38.5 * h], u.dark, "concrete", 0);
    for (let $ = -18; $ < 19; $ += 1.2) G.box([C * f, 0.029, $ * h], [0.125, 0.012, 0.19], u.steel, "steel", 2e-3);
  }
  G.finish(de);
  let P = new g("Far supply corridor");
  for (let [C, $, Oe] of Fe) P.box([(C + $) * f / 2, 1.14, Oe * h], [($ - C) * f, 0.19, 0.12], u.steel, "paint", 0);
  P.finish(X, false);
  let v = { command: "\u4E3B\u57FA\u5730\u4E0E\u884C\u653F\u6307\u6325", research: "\u79D1\u7814\u9662\u533A", robotics: "\u673A\u68B0\u5236\u9020\u56ED", nanofab: "\u7CBE\u5BC6\u5236\u9020\u4E0E\u7EB3\u7C73\u5DE5\u5382", solar: "\u592A\u9633\u80FD\u573A\u4E0E\u53D8\u7535", fusion: "\u805A\u53D8\u80FD\u6E90\u533A", radar: "\u884C\u661F\u901A\u4FE1\u4E0E\u63A2\u6D4B", allianceLogistics: "\u8054\u76DF\u534F\u4F5C\u4E0E\u63A5\u9A73", terraforming: "\u5730\u5F62\u4E0E\u73AF\u5883\u5DE5\u7A0B", planetarySupport: "\u884C\u661F\u4FDD\u969C\u4E0E\u7EF4\u4FEE\u4ED3\u50A8" }, k = { command: [0, -3, 13.7, 16], research: [-17.6, -4, 17.5, 13.7], robotics: [18.1, 6, 18, 8.3], nanofab: [17.5, -5.4, 17.6, 10.8], solar: [-23.3, 12.3, 9.5, 14.1], fusion: [-19, -16.5, 16.2, 7], radar: [-0.8, -16.6, 14.8, 7], allianceLogistics: [-9.5, 12.8, 15.5, 10.1], terraforming: [20, -16, 16, 8], planetarySupport: [17, 15.7, 18.4, 8.2] }, ee = {}, ye = [], Ee = p.cargoGeometry(), De = p.vehicleGeometry(), ce = false, me = true, Te = "near", Ie = (C, $ = [0, 1, 0], Oe) => ({ position: C, normal: [...$], direction: [...$], ...Oe === void 0 ? {} : { width: Oe } });
  function Ve(C) {
    let [$, Oe, Ke, tt] = k[C], it = M(fe.districts, C);
    it.position.set($ * f, Ce($ * f, Oe * h), Oe * h), it.userData.moduleKey = C;
    let Ge = M(it, "reserved-site-and-foundations"), Dt = M(it, "building-shells"), Vt = M(it, "process-equipment"), Tt = M(it, "stock-and-logistics"), Xt = M(it, "operating-indicators"), U = M(it, "construction"), be = M(it, "far-module"), Le = { visible: true, running: true, activity: 1, construction: 1, storageFill: 0.5 }, w = { key: C, label: v[C], name: v[C], root: it, w: Ke, d: tt, base: Ge, built: Dt, machines: Vt, stock: Tt, status: Xt, scaffold: U, far: be, state: Le, clock: 0, animate: [], stockSetters: [], b: new g(C + " structure"), e: new g(C + " equipment"), f: new g(C + " foundations"), s: new g(C + " stock shelter"), farB: new g(C + " silhouette"), buildingCount: 0, equipment: [] };
    w.entry = [0, 0, tt / 2], w.entryDirection = [0, 0, 1], w.entryWidth = 1.2, C !== "terraforming" && w.f.box([0, 1e-3, 0], [Ke, 0.014, tt], u.gravel, "earth", 0);
    let I = new g(C + " temporary construction frame");
    for (let L of [-Ke * 0.29, Ke * 0.29]) for (let q of [-tt * 0.26, tt * 0.26]) I.pipe([L, 0.03, q], [L, 1.2, q], 0.015, u.steel);
    for (let L of [-tt * 0.26, tt * 0.26]) I.pipe([-Ke * 0.29, 1.18, L], [Ke * 0.29, 1.18, L], 0.014, u.yellow), I.pipe([-Ke * 0.29, 0.07, L], [Ke * 0.29, 1.18, L], 8e-3, u.steel);
    I.finish(U);
    let H = new g(C + " status");
    return H.cyl([Ke * 0.38, 0.3, tt * 0.35], 0.022, 0.6, u.steel, "steel", 8), H.box([Ke * 0.38, 0.61, tt * 0.35], [0.07, 0.1, 0.07], u.warm, "lamp", 4e-3), H.finish(Xt, false), ye.push(w), ee[C] = { root: it, label: v[C], name: v[C], getState: () => ({ ...Le }) }, w;
  }
  function qe(C, $, Oe, Ke, tt) {
    C.f.box([$, 0.017, Oe], [Ke, 0.03, tt], u.concrete, "concrete", 8e-3);
    for (let it = $ - Ke / 2 + 0.6; it < $ + Ke / 2; it += 0.72) C.f.box([it, 0.034, Oe], [6e-3, 3e-3, tt - 0.05], u.concreteDark, "concrete", 0);
  }
  function Rt(C, $, Oe, Ke = 5, tt = 0) {
    let it = [];
    for (let Ge = 0; Ge < Ke; Ge++) {
      let Dt = $ + Ge * 0.38;
      for (let Vt of [-0.19, 0.19]) C.f.box([Dt + Vt, 0.029, Oe], [0.01, 4e-3, 0.76], u.pale, "paint", 0);
      Ge % 3 !== 2 && it.push({ p: [Dt, 0.03, Oe], r: [0, Math.PI / 2 + tt, 0], scale: [0.9, 0.9, 0.9], color: Ge % 2 ? u.blueLight : u.pale });
    }
    y(De, it, C.stock, `${C.key} parked vehicle bank`);
  }
  function bt(C, $, Oe, Ke = 6, tt = 2, it = 3) {
    let Ge = [];
    for (let Tt = 0; Tt < tt; Tt++) for (let Xt = 0; Xt < Ke; Xt++) Ge.push({ x: $ + Xt * 0.52, z: Oe + Tt * 0.35, levels: it, bias: a() });
    let Dt = new i42.InstancedMesh(Ee, _.paint, Ke * tt * it);
    Dt.name = C.key + " supported inventory", Dt.castShadow = true, Dt.receiveShadow = true, C.stock.add(Dt);
    let Vt = new i42.Matrix4();
    return C.stockSetters.push((Tt) => {
      let Xt = 0;
      for (let U of Ge) for (let be = 0, Le = l(Math.floor(U.levels * Tt + U.bias), 0, U.levels); be < Le; be++) Vt.makeTranslation(U.x, 0.02 + be * 0.255, U.z), Dt.setMatrixAt(Xt, Vt), Dt.setColorAt(Xt, new i42.Color(Xt % 4 === 0 ? u.blueLight : u.pale)), Xt++;
      Dt.count = Xt, Dt.instanceMatrix.needsUpdate = true, Dt.instanceColor && (Dt.instanceColor.needsUpdate = true), Dt.computeBoundingBox(), Dt.computeBoundingSphere();
    }), Dt;
  }
  function kt(C, $, Oe, Ke = 0.045) {
    let tt = M(C.stock, C.key + " local service vehicle"), it = new i42.Mesh(De, _.paint);
    it.castShadow = true, it.receiveShadow = true, tt.add(it);
    let Ge = m(Oe).sub(m($)), Dt = -Math.atan2(Ge.z, Ge.x);
    return C.animate.push((Vt) => {
      let Tt = (Math.sin(Vt * Ke) + 1) / 2;
      tt.position.copy(m($).lerp(m(Oe), Tt)), tt.rotation.y = Dt;
    }), C.animate[C.animate.length - 1](0), tt;
  }
  function pe(C, $, Oe = 0.25, Ke = "y") {
    let tt = M(C.machines, C.key + " ventilator");
    tt.position.set(...$), Ke === "z" && (tt.rotation.x = Math.PI / 2);
    let it = new g("Ventilator rotor");
    it.cyl([0, 0, 0], Oe * 0.21, 0.09, u.steel, "steel", 12);
    for (let Ge = 0; Ge < 6; Ge++) it.box([Math.cos(Ge * Math.PI / 3) * Oe * 0.53, 0.018, Math.sin(Ge * Math.PI / 3) * Oe * 0.53], [Oe * 0.73, 0.018, Oe * 0.2], u.steel, "steel", 4e-3, [0, -Ge * Math.PI / 3 - 0.3, 0]);
    return it.finish(tt), C.animate.push((Ge) => {
      tt.rotation.y = Ge * 1.7;
    }), tt;
  }
  function gt(C, $, Oe = 0) {
    let Ke = M(C.machines, "Industrial assembly manipulator");
    Ke.position.set(...$);
    let tt = new g("Manipulator base");
    tt.cyl([0, 0.09, 0], 0.17, 0.18, u.dark, "paint", 16), tt.cyl([0, 0.23, 0], 0.1, 0.12, u.steel, "steel", 16), tt.finish(Ke);
    let it = M(Ke, "shoulder");
    it.position.y = 0.25;
    let Ge = new g("Upper arm");
    Ge.box([0, 0.29, 0], [0.11, 0.58, 0.15], u.yellow, "paint", 0.013);
    for (let Tt of [-0.083, 0.083]) Ge.cyl([0, 0.02, Tt], 0.1, 0.025, u.steel, "steel", 16, [Math.PI / 2, 0, 0]);
    Ge.finish(it);
    let Dt = M(it, "elbow");
    Dt.position.y = 0.57;
    let Vt = new g("Forearm");
    Vt.box([0.23, 0, 0], [0.46, 0.09, 0.115], u.pale, "paint", 0.012), Vt.cyl([0, 0, 0], 0.095, 0.17, u.steel, "steel", 16, [Math.PI / 2, 0, 0]), Vt.box([0.49, 0, 0], [0.1, 0.16, 0.12], u.dark, "paint", 8e-3);
    for (let Tt of [-1, 1]) Vt.box([0.57, -0.04, Tt * 0.056], [0.13, 0.033, 0.026], u.steel, "steel", 3e-3);
    return Vt.finish(Dt), C.animate.push((Tt) => {
      Ke.rotation.y = 0.24 * Math.sin(Tt * 0.28 + Oe), it.rotation.z = -0.32 + 0.22 * Math.sin(Tt * 0.4 + Oe), Dt.rotation.z = 0.31 + 0.28 * Math.sin(Tt * 0.35 + Oe + 1);
    }), Ke;
  }
  {
    let C = Ve("command");
    qe(C, 0, 3.5, 13.2, 8.6), qe(C, 0, -2.5, 11.2, 5.2), Y(C.b, 0, -3.2, 5.2, 3.7, 3.55, { color: u.navy, floors: 7 }), Y(C.b, -4.6, -1.6, 3.2, 3.6, 1.48, { color: u.blueLight, floors: 3 }), Y(C.b, 4.6, -1.6, 3.2, 3.6, 1.48, { color: u.blueLight, floors: 3 }), C.buildingCount = 3, C.b.box([0, 3.9, -3.2], [3.35, 0.39, 2.35], u.pale, "paint", 0.065), C.b.box([0, 4.14, -3.2], [3.49, 0.1, 2.5], u.navy, "paint", 0.025);
    for (let $ of [-1, 1]) C.b.box([$ * 3.08, 1.08, -1.8], [1.06, 0.67, 1.03], u.pale, "paint", 0.025), C.b.box([$ * 3.08, 1.12, -1.28], [0.93, 0.42, 0.025], u.glass, "glass", 4e-3);
    C.b.box([0, 0.37, -0.77], [6.1, 0.67, 1.15], u.concrete, "concrete", 0.035), C.b.box([0, 0.77, -0.42], [4.2, 0.1, 1.8], u.pale, "paint", 0.02), V(C.b, [0, 0.04, 1.42], [0, 0.4, 0.18], 1.8), C.b.cyl([0, 4.55, -3.4], 0.038, 0.8, u.steel, "steel", 10);
    for (let $ of [-0.65, 0.65]) C.b.box([$, 4.42, -3.4], [0.46, 0.46, 0.1], u.blueLight, "paint", 0.016, [0, 0, 0.08 * $]), C.b.pipe([0, 4.44, -3.4], [$, 4.44, -3.4], 0.02);
    for (let $ of [-4, 4]) Q(C.f, $, 4.05, 2.4, 0.7);
    for (let $ of [-2.6, -1.9, 1.9, 2.6]) C.b.cyl([$, 0.79, 5], 0.014, 1.5, u.steel, "steel", 8), C.b.box([$ + 0.13, 1.3, 5], [0.27, 0.32, 0.014], $ < 0 ? u.navy : u.blueLight, "paint", 2e-3);
    for (let $ = 1.6; $ < 7.7; $ += 0.66) C.f.box([0, 0.036, $], [0.12, 4e-3, 0.3], u.dark, "paint", 0);
    Rt(C, -5.3, 6.7, 4), Rt(C, 4, 6.7, 4), C.equipment = ["seven-storey command block", "two administrative wings", "roof communications mast", "reception terrace and civic plaza", "arrival parking"], C.farB.box([0, 1.82, -3.2], [5.2, 3.64, 3.7], u.navy, "paint", 0.02);
    for (let $ of [-4.6, 4.6]) C.farB.box([$, 0.78, -1.6], [3.2, 1.56, 3.6], u.blueLight, "paint", 0);
    C.farB.box([0, 4.02, -3.2], [3.5, 0.28, 2.5], u.pale, "paint", 0), C.farB.box([0, 0.02, 3.3], [13, 0.04, 8.5], u.concrete, "paint", 0);
  }
  {
    let C = Ve("research");
    qe(C, 0, 0, 16.6, 12.5), Y(C.b, -5, -3.5, 4.1, 2.7, 1.6, { color: u.blueLight, floors: 3 }), Y(C.b, 0.2, -3.5, 4.25, 2.7, 1.85, { color: u.pale, floors: 4 }), Y(C.b, 5.2, -1.3, 3.1, 4.8, 1.4, { color: u.blueLight, floors: 3 }), b(C.b, -4.4, 3.3, 5.2, 3, 1.17, { color: u.blue, bays: 4 }), Y(C.b, 2.1, 4.1, 3.8, 2, 1.01, { color: u.navy, floors: 2 }), C.buildingCount = 5;
    for (let [$, Oe] of [[[-2.85, 0.62, -3.5], [-1.9, 0.62, -3.5]], [[2.3, 0.62, -3.5], [3.72, 0.62, -3.5]], [[5.2, 0.62, 1.25], [5.2, 0.62, 4]]]) C.b.beam($, Oe, 0.78, 0.66, u.pale, "paint"), C.b.beam([$[0], 0.74, $[2] + 0.35], [Oe[0], 0.74, Oe[2] + 0.35], 0.035, 0.026, u.glass, "glass");
    for (let $ of [-3, 0, 3]) Q(C.f, $, 0.7, 2.1, 0.73);
    C.f.box([0, 0.035, 1.25], [6.8, 0.013, 3.1], u.concreteDark, "concrete", 3e-3);
    for (let $ = 0; $ < 4; $++) C.e.box([-1.7 + $ * 0.94, 0.31, 1.25], [0.6, 0.57, 0.71], $ % 2 ? u.pale : u.blueLight, "paint", 0.016), C.e.box([-1.7 + $ * 0.94, 0.63, 1.25], [0.64, 0.08, 0.75], u.steel, "steel", 8e-3);
    C.e.box([-0.3, 0.53, 1.25], [3.9, 0.065, 0.075], u.yellow, "paint", 5e-3), pe(C, [-0.2, 2.27, -3.5], 0.25), Rt(C, -7, 5.9, 5), bt(C, 5, 5.6, 3, 1, 2);
    for (let [$, Oe, Ke, tt, it] of [[-5, -3.5, 4.1, 2.7, 1.65], [0.2, -3.5, 4.25, 2.7, 1.9], [5.2, -1.3, 3.1, 4.8, 1.45], [-4.4, 3.3, 5.2, 3, 1.35], [2.1, 4.1, 3.8, 2, 1.05]]) C.farB.box([$, it / 2, Oe], [Ke, it, tt], u.blueLight, "paint", 0);
    C.equipment = ["three laboratory blocks", "pilot experiment hall", "data and analysis centre", "sealed connecting galleries", "instrument test court"];
  }
  {
    let C = Ve("robotics");
    qe(C, 0, 0.15, 17.5, 7.6), b(C.b, -2.55, -0.4, 9.4, 5.25, 1.84, { color: u.blue, bays: 5, open: true, sawtooth: true }), b(C.b, 5.55, -1.15, 4.2, 3.65, 1.12, { color: u.blueLight, bays: 3 }), C.buildingCount = 2;
    for (let $ of [-5.65, -2.55, 0.55]) C.e.box([$, 0.17, 0.22], [1.6, 0.24, 1.12], u.concreteDark, "concrete", 0.017), C.e.box([$, 0.5, 0.22], [1.22, 0.41, 0.79], u.pale, "paint", 0.025), C.e.box([$, 0.79, 0.22], [0.97, 0.16, 0.7], u.navy, "paint", 0.013), gt(C, [$ - 0.68, 0.12, 1.15], $), gt(C, [$ + 0.64, 0.12, -0.78], $ + 2);
    C.e.ibeam([-7, 1.58, -0.75], [1.92, 1.58, -0.75], 0.11, 0.16, u.yellow);
    for (let $ of [-2.48, 1.65]) C.e.ibeam([-7.03, 1.58, $], [1.93, 1.58, $], 0.11, 0.15, u.steel);
    bt(C, 4, 1.18, 7, 2, 3), Rt(C, 3.9, 3.1, 5), kt(C, [-7.8, 0.03, 3.2], [1.8, 0.03, 3.2], 0.14), C.farB.box([-2.55, 1.03, -0.4], [9.6, 2.06, 5.45], u.blue, "paint", 0.015), C.farB.box([5.55, 0.63, -1.15], [4.3, 1.26, 3.75], u.blueLight, "paint", 0), C.equipment = ["open five-bay assembly hall", "six articulated manipulators", "three assembly beds", "overhead travelling crane", "parts warehouse and outward loading apron"];
  }
  {
    let C = Ve("nanofab");
    qe(C, 0, 0, 17.1, 10.1), b(C.b, -1.5, -0.55, 10.7, 6.5, 1.62, { color: u.pale, bays: 6 }), Y(C.b, 5.5, 1.9, 3.7, 3.5, 1.18, { color: u.blueLight, floors: 2 }), C.buildingCount = 2, C.b.box([-1.5, 1.96, -0.55], [10, 0.53, 5.88], u.blueLight, "paint", 0.028);
    for (let $ = -5.65; $ < 3.1; $ += 1.1) ie(C.b, $, 2.24, -1.58, 0.84, 0.83), ie(C.b, $, 2.24, 1.04, 0.84, 0.83);
    for (let $ of [-2.25, -0.75, 0.75, 2.25]) C.e.cyl([6.3, 0.51, $ - 2.5], 0.27, 1, u.pale, "paint", 16), C.e.torus([6.3, 1.03, $ - 2.5], 0.278, 0.012, u.steel), C.e.pipe([6.3, 0.3, $ - 2.5], [4.8, 0.3, $ - 2.5], 0.035, u.blueLight);
    for (let $ of [-4, -1.7, 0.6]) C.e.box([$, 2.69, -0.25], [1.06, 0.18, 1.15], u.pale, "paint", 0.01), C.e.torus([$, 2.8, -0.25], 0.38, 0.023, u.steel), pe(C, [$, 2.8, -0.25], 0.33);
    C.b.box([4.34, 0.82, 2.1], [1.26, 0.7, 0.82], u.pale, "paint", 0.02), C.b.box([4.34, 0.9, 2.52], [1.05, 0.35, 0.02], u.glass, "glass", 2e-3), bt(C, -5.3, 3.55, 8, 1, 2), Rt(C, 2.1, 4.43, 6), C.farB.box([-1.5, 1.2, -0.55], [10.7, 2.4, 6.5], u.pale, "paint", 0.02), C.farB.box([5.5, 0.63, 1.9], [3.7, 1.26, 3.5], u.blueLight, "paint", 0), C.equipment = ["sealed clean manufacturing hall", "raised equipment floor and roof filtration banks", "utility gas battery", "enclosed materials passage", "receiving and controlled-access building"];
  }
  {
    let C = Ve("solar");
    C.entry = [C.w / 2, 0, 4.3], C.entryDirection = [1, 0, 0], C.entryWidth = 0.9;
    let $ = new g("Photovoltaic table");
    $.box([0, 0, 0], [1.44, 0.036, 0.85], u.dark, "paint", 8e-3), $.box([0, 0.021, 0], [1.39, 8e-3, 0.8], u.solar, "glass", 2e-3);
    for (let Ge of [-0.717, 0.717]) $.box([Ge, 0.028, 0], [0.023, 0.035, 0.86], u.steel, "steel", 4e-3);
    for (let Ge of [-0.415, 0.415]) $.box([0, 0.028, Ge], [1.44, 0.035, 0.025], u.steel, "steel", 4e-3);
    for (let Ge = -0.51; Ge <= 0.6; Ge += 0.17) $.box([Ge, 0.027, 0], [3e-3, 4e-3, 0.78], u.blueLight, "paint", 0);
    for (let Ge = -0.28; Ge <= 0.3; Ge += 0.14) $.box([0, 0.027, Ge], [1.38, 4e-3, 3e-3], u.blueLight, "paint", 0);
    let Oe = $.geometry(), Ke = [];
    for (let Ge of [-3.25, -1.58, 1, 2.67]) for (let Dt = 0; Dt < 9; Dt++) {
      let Vt = -5.92 + Dt * 1.15;
      Ke.push({ p: [Ge, 0.57, Vt], r: [-0.38, 0, 0] });
      for (let Tt of [-0.26, 0.26]) C.e.ibeam([Ge, 0.025, Vt + Tt], [Ge, 0.54, Vt + Tt], 0.04, 0.06, u.steel);
    }
    let tt = y(Oe, Ke, C.machines, "36 independently supported photovoltaic tables", _.glass), it = new i42.Matrix4();
    C.animate.push((Ge) => {
      let Dt = -0.36 + Math.sin(Ge * 0.019) * 0.055;
      Ke.forEach((Vt, Tt) => {
        it.compose(m(Vt.p), S([Dt, 0, 0]), new i42.Vector3(1, 1, 1)), tt.setMatrixAt(Tt, it);
      }), tt.instanceMatrix.needsUpdate = true;
    }), qe(C, -0.31, -0.87, 0.6, 11.8), Y(C.b, -2.42, 5.61, 3.1, 1.7, 0.79, { color: u.blueLight, floors: 1 }), C.buildingCount = 1;
    for (let Ge of [0.3, 1.52, 2.74]) {
      C.e.box([Ge, 0.37, 5.58], [0.71, 0.67, 0.76], u.pale, "paint", 0.025);
      for (let Dt = 5.3; Dt < 5.94; Dt += 0.09) C.e.box([Ge, 0.7, Dt], [0.55, 0.026, 0.015], u.dark, "steel", 0);
      C.e.pipe([Ge, 0.18, 5.2], [Ge, 0.18, 4.53], 0.037, u.steel);
    }
    for (let Ge of [-3.25, -1.58, 1, 2.67]) C.farB.box([Ge, 0.44, -1.3], [1.44, 0.065, 10.1], u.solar, "paint", 0, [0, 0, 0]);
    C.farB.box([-2.42, 0.43, 5.61], [3.1, 0.86, 1.7], u.blueLight, "paint", 0), C.equipment = ["36 photovoltaic tables in four banks", "central maintenance aisle", "inverter and control building", "three transformer/inverter skids", "protected outgoing feeders"];
  }
  {
    let C = Ve("fusion");
    qe(C, 0, 0, 15.7, 6.65), b(C.b, -4.4, -0.2, 5.1, 4.45, 1.62, { color: u.blue, bays: 3 }), C.b.cyl([0.44, 0.92, -0.2], 1.93, 1.79, u.pale, "paint", 16), C.b.cyl([0.44, 1.88, -0.2], 1.97, 0.16, u.steel, "steel", 24), C.b.cyl([0.44, 2.16, -0.2], 1.71, 0.42, u.navy, "paint", 24), C.b.cyl([0.44, 2.42, -0.2], 1.79, 0.12, u.pale, "paint", 24);
    for (let $ = 0; $ < 12; $++) {
      let Oe = $ * Math.PI / 6, Ke = 0.44 + Math.cos(Oe) * 1.92, tt = -0.2 + Math.sin(Oe) * 1.92;
      C.b.box([Ke, 1.08, tt], [0.19, 1.89, 0.2], u.steel, "steel", 0.016, [0, -Oe, 0]);
    }
    C.buildingCount = 3, Y(C.b, 4.53, 2.05, 3.38, 1.45, 0.9, { color: u.blueLight, floors: 2 });
    for (let $ of [4.35, 6.25]) for (let Oe of [-1.72, 0.14]) {
      C.e.box([$, 0.56, Oe], [1.5, 1.09, 1.32], u.pale, "paint", 0.032), C.e.torus([$, 1.16, Oe], 0.49, 0.035, u.steel), pe(C, [$, 1.18, Oe], 0.43);
      for (let Ke = 0.2; Ke < 0.98; Ke += 0.11) C.e.box([$, Ke, Oe + 0.67], [1.29, 0.027, 0.018], u.dark, "steel", 0);
    }
    for (let $ of [-1.22, 0.82]) C.e.pipe([2.4, 0.46, $], [3.57, 0.46, $], 0.13, u.steel, "steel", 14);
    C.e.pipe([-2, 0.5, -0.2], [-1.34, 0.5, -0.2], 0.15, u.blueLight, "steel", 16);
    for (let $ of [-6.5, -5.3, -4.1]) {
      C.e.box([$, 0.36, 2.58], [0.83, 0.67, 0.64], u.concreteDark, "paint", 0.022);
      for (let Oe of [2.35, 2.65]) C.e.cyl([$, 0.93, Oe], 0.063, 0.45, u.dark, "paint", 10);
    }
    C.farB.box([-4.4, 0.88, -0.2], [5.1, 1.76, 4.45], u.blue, "paint", 0.01), C.farB.cyl([0.44, 1.23, -0.2], 1.95, 2.46, u.pale, "paint", 16), C.farB.box([5.3, 0.63, -0.8], [3.4, 1.26, 3.1], u.pale, "paint", 0), C.farB.box([4.53, 0.48, 2.05], [3.38, 0.96, 1.45], u.blueLight, "paint", 0), C.equipment = ["shielded reactor containment hall", "energy conversion/turbine hall", "four dry cooler cells", "control building", "transformer yard and heat-transfer circuits"];
  }
  {
    let C = Ve("radar");
    qe(C, 0, 0, 14.1, 6.65), Y(C.b, -5.14, 1.18, 3.13, 2.46, 0.96, { color: u.blueLight, floors: 2 }), C.buildingCount = 1, C.e.cyl([-0.35, 0.12, -0.42], 1.22, 0.24, u.concrete, "concrete", 32), C.e.cyl([-0.35, 0.59, -0.42], 0.43, 0.92, u.pale, "paint", 24), C.e.torus([-0.35, 1.02, -0.42], 0.73, 0.045, u.steel);
    let $ = M(C.machines, "Main antenna azimuth mount");
    $.position.set(-0.35, 1.14, -0.42);
    let Oe = M($, "Parabolic antenna elevation");
    Oe.rotation.x = -0.42;
    let Ke = [];
    for (let it = 0; it <= 20; it++) {
      let Ge = it / 20 * 2.12;
      Ke.push(new i42.Vector2(Ge, Ge * Ge * 0.18));
    }
    for (let it = 20; it >= 0; it--) {
      let Ge = it / 20 * 2.12;
      Ke.push(new i42.Vector2(Ge, Ge * Ge * 0.18 - 0.04));
    }
    let tt = new g("Large ribbed parabolic receiver");
    tt.add(p.own(new i42.LatheGeometry(Ke, 48)), [0, 0, 0], u.pale, "paint");
    for (let it = 0; it < 12; it++) {
      let Ge = it * Math.PI / 6;
      for (let Dt = 1; Dt < 5; Dt++) {
        let Vt = (Dt - 1) * 0.53, Tt = Dt * 0.53;
        tt.pipe([Math.cos(Ge) * Vt, Vt * Vt * 0.18 - 0.07, Math.sin(Ge) * Vt], [Math.cos(Ge) * Tt, Tt * Tt * 0.18 - 0.07, Math.sin(Ge) * Tt], 0.026, u.steel, "steel", 8);
      }
    }
    for (let it = 0; it < 3; it++) {
      let Ge = it * Math.PI * 2 / 3;
      tt.pipe([Math.cos(Ge) * 1.85, 0.66, Math.sin(Ge) * 1.85], [0, 1.39, 0], 0.026, u.steel, "steel", 8);
    }
    tt.cyl([0, 1.39, 0], 0.15, 0.26, u.dark, "paint", 16), tt.torus([0, 0.82, 0], 2.12, 0.025, u.steel, "steel", [Math.PI / 2, 0, 0], 48), tt.finish(Oe), C.animate.push((it) => {
      $.rotation.y = 0.2 + Math.sin(it * 0.035) * 0.23, Oe.rotation.x = -0.42 + Math.sin(it * 0.027) * 0.035;
    });
    for (let [it, Ge, Dt] of [[4.6, -1.9, -0.1], [5.47, 1.22, 0.12]]) {
      C.e.cyl([it, 0.64, Ge], 0.065, 1.2, u.steel, "steel", 10), C.e.box([it, 1.4, Ge], [1.25, 1.07, 0.12], u.pale, "paint", 0.016, [-0.16, Dt, 0]);
      for (let Vt = -2; Vt <= 2; Vt++) for (let Tt = -2; Tt <= 2; Tt++) C.e.box([it + Vt * 0.215, 1.4 + Tt * 0.18, Ge + 0.072], [0.145, 0.095, 0.025], u.dark, "paint", 4e-3);
    }
    C.farB.cyl([-0.35, 0.65, -0.42], 0.43, 1.3, u.pale, "paint", 12), C.farB.add(p.own(new i42.LatheGeometry(Ke, 20)), [-0.35, 1.14, -0.42], u.pale, "paint", [-0.42, 0.2, 0]), C.farB.box([-5.14, 0.52, 1.18], [3.13, 1.04, 2.46], u.blueLight, "paint", 0);
    for (let it of [4.6, 5.47]) C.farB.box([it, 1.1, 0], [1.2, 1.4, 0.15], u.pale, "paint", 0);
    C.equipment = ["4.24-diameter tracking parabolic antenna", "twelve structural ribs and receiver struts", "two phased receiving arrays", "control building", "clear azimuth maintenance court"];
  }
  {
    let C = Ve("allianceLogistics");
    qe(C, 0, 0, 14.95, 9.55), Y(C.b, -2.8, -1.5, 5.6, 3.65, 1.84, { color: u.blueLight, floors: 4 }), Y(C.b, 3.14, -1.6, 4.65, 3.45, 1.17, { color: u.pale, floors: 2 }), Y(C.b, 4.85, 2.04, 2.2, 2, 0.84, { color: u.navy, floors: 2 }), C.buildingCount = 3, C.b.box([0.55, 0.75, -1.63], [1.26, 0.6, 0.93], u.pale, "paint", 0.016), C.b.box([0.55, 0.82, -1.15], [1.17, 0.31, 0.018], u.glass, "glass", 2e-3), C.b.box([-1.45, 0.86, 1.06], [7.3, 0.065, 0.84], u.blueLight, "paint", 0.012);
    for (let $ of [-4.65, -1.45, 1.72]) C.b.cyl([$, 0.42, 1.36], 0.023, 0.83, u.steel, "steel", 10);
    for (let $ of [-3.3, -2.5, -1.7]) C.e.cyl([$, 2.4, -1.65], 0.018, 0.73, u.steel, "steel", 8), C.e.box([$ + 0.12, 2.51, -1.65], [0.25, 0.27, 0.025], $ === -2.5 ? u.pale : u.blue, "paint", 2e-3);
    Q(C.f, -4.3, 2.23, 3, 0.55), Q(C.f, -0.35, 2.23, 2.2, 0.55), Rt(C, -6, 3.65, 9), bt(C, 4.6, 3.66, 4, 2, 2), kt(C, [-5.9, 0.02, 4.6], [1.2, 0.02, 4.6], 0.1), C.farB.box([-2.8, 0.97, -1.5], [5.6, 1.94, 3.65], u.blueLight, "paint", 0.01), C.farB.box([3.14, 0.63, -1.6], [4.65, 1.26, 3.45], u.pale, "paint", 0), C.farB.box([4.85, 0.46, 2.04], [2.2, 0.92, 2], u.navy, "paint", 0), C.equipment = ["alliance liaison building", "conference and communications wing", "cooperative dispatch office", "covered visitor arrival court", "separate service deliveries"];
  }
  {
    let C = Ve("terraforming");
    C.entry = [7.8, 0, 2.8], C.entryDirection = [1, 0, 0], qe(C, -3.9, -0.25, 7.25, 6.6), Y(C.b, -3.2, -2.4, 5, 1.95, 1.06, { color: u.blueLight, floors: 2 }), C.buildingCount = 1;
    for (let Ge of [-6.2, -4.8, -3.4]) O(C.e, Ge, -0.15, 0.47, 1.77, { color: u.pale }), C.e.pipe([Ge, 0.2, 0.34], [Ge, 0.2, 1.4], 0.065, u.steel);
    C.e.box([-1.1, 0.13, 1], [2.45, 0.24, 3], u.concreteDark, "concrete", 0.02), C.e.box([-1.1, 0.266, 1], [2.19, 0.015, 2.73], 6847864, "glass", 8e-3);
    for (let Ge of [-0.47, 2.47]) A(C.e, [-2.35, 0.27, Ge], [0.12, 0.27, Ge], 0.17);
    C.e.pipe([-6.2, 0.2, 1.4], [-2.37, 0.2, 1.4], 0.072, u.blueLight), C.e.pipe([0.2, 0.22, 1], [2, 0.22, 1], 0.073, u.steel), C.e.box([1.55, 0.28, 1], [0.45, 0.48, 0.44], u.blue, "paint", 0.014);
    let $ = new g("Environmental grading plot");
    for (let Ge = 0; Ge < 7; Ge++) {
      let Dt = [], Vt = [], Tt = -1.35 + Ge * 0.44;
      for (let U = 0; U < 2; U++) for (let be = 0; be <= 20; be++) {
        let Le = 1.45 + be / 20 * 5.1, w = Tt + (U - 0.5) * 0.2;
        Dt.push(Le, Ce(C.root.position.x + Le, C.root.position.z + w) - C.root.position.y + 7e-3, w), !U && be < 20 && Vt.push(be, be + 21, be + 1, be + 21, be + 22, be + 1);
      }
      let Xt = p.own(new i42.BufferGeometry());
      Xt.setAttribute("position", new i42.Float32BufferAttribute(Dt, 3)), Xt.setIndex(Vt), Xt.computeVertexNormals(), $.add(Xt, [0, 0, 0], Ge % 2 ? u.earth : u.gravel, "earth");
    }
    $.finish(C.base, false);
    let Oe = M(C.machines, "Compact environmental excavator");
    Oe.position.set(3.75, Ce(C.root.position.x + 3.75, C.root.position.z + 0.3), 0.3);
    let Ke = new g("Tracked site excavator");
    for (let Ge of [-0.16, 0.16]) Ke.box([0, 0.1, Ge], [0.66, 0.17, 0.14], u.dark, "paint", 0.022);
    Ke.box([0, 0.22, 0], [0.53, 0.13, 0.41], u.yellow, "paint", 0.022), Ke.box([-0.17, 0.4, -0.03], [0.24, 0.29, 0.31], u.blueLight, "paint", 0.017), Ke.box([-0.17, 0.43, 0.13], [0.19, 0.19, 0.014], u.glass, "glass", 2e-3), Ke.finish(Oe);
    let tt = M(Oe, "Hydraulic boom");
    tt.position.set(0.12, 0.29, 0);
    let it = new g("Excavator linkage");
    it.beam([0, 0, 0], [0.22, 0.55, 0], 0.065, 0.09, u.yellow, "paint"), it.beam([0.22, 0.55, 0], [0.75, 0.2, 0], 0.065, 0.075, u.yellow, "paint"), it.box([0.79, 0.1, 0], [0.23, 0.24, 0.3], u.steel, "steel", 0.022), it.pipe([-0.03, 0.02, 0.05], [0.21, 0.46, 0.05], 0.022, u.steel), it.finish(tt), C.animate.push((Ge) => {
      tt.rotation.y = Math.sin(Ge * 0.12) * 0.23;
    }), bt(C, 5, 2.7, 4, 1, 2), C.farB.box([-3.2, 0.57, -2.4], [5, 1.14, 1.95], u.blueLight, "paint", 0);
    for (let Ge of [-6.2, -4.8, -3.4]) C.farB.cyl([Ge, 0.96, -0.15], 0.48, 1.92, u.pale, "paint", 12);
    C.farB.box([-1.1, 0.18, 1], [2.45, 0.36, 3], u.concreteDark, "paint", 0), C.equipment = ["pump and process control house", "three water/environment treatment towers", "lined equalization tank", "exposed valve and pipe network", "graded experiment plot and tracked construction machine"];
  }
  {
    let C = Ve("planetarySupport");
    qe(C, 0, 0, 17.9, 7.65), b(C.b, -3.9, -0.9, 7.2, 4.1, 1.37, { color: u.blueLight, bays: 4, open: true }), b(C.b, 4.32, -1.43, 5.35, 3.25, 1.05, { color: u.navy, bays: 4 }), Y(C.b, 5.78, 1.73, 2.48, 2.03, 1.29, { color: u.blueLight, floors: 3 }), C.buildingCount = 3;
    for (let $ of [-6.35, -4.7, -3.1, -1.45]) {
      C.e.box([$, 0.13, -0.3], [0.85, 0.2, 1.75], u.concreteDark, "concrete", 0.012);
      for (let Oe of [-0.92, 0.35]) C.e.box([$, 0.22, Oe], [0.66, 0.06, 0.19], u.yellow, "paint", 5e-3);
    }
    bt(C, 2.4, 0.63, 5, 3, 3), Rt(C, -6.7, 2.8, 8), y(De, [-6.2, -4.5, -2.8].map(($) => ({ p: [$, 0.027, 1.4], r: [0, Math.PI / 2, 0], color: $ === -4.5 ? 9984843 : u.pale })), C.stock, "Emergency response vehicle bank");
    for (let $ of [-2.2, -0.35]) C.e.box([7.28, 0.21, $], [1.22, 0.4, 0.85], u.concreteDark, "concrete", 0.035);
    C.e.cyl([7.12, 1.69, 2.06], 0.036, 1.05, u.steel, "steel", 10), C.e.box([7.12, 2.22, 2.06], [0.29, 0.22, 0.21], u.pale, "paint", 0.012), C.e.box([7.12, 2.22, 2.18], [0.17, 0.09, 0.04], u.glass, "glass", 5e-3), kt(C, [-7.5, 0.03, 3.46], [2, 0.03, 3.46], 0.11), C.farB.box([-3.9, 0.8, -0.9], [7.2, 1.6, 4.1], u.blueLight, "paint", 0.01), C.farB.box([4.32, 0.6, -1.43], [5.35, 1.2, 3.25], u.navy, "paint", 0), C.farB.box([5.78, 0.69, 1.73], [2.48, 1.38, 2.03], u.blueLight, "paint", 0), C.equipment = ["four-bay repair workshop", "protected reserves warehouse", "emergency dispatch office", "response vehicles and vehicle service beds", "compact perimeter observation equipment"];
  }
  function je(C) {
    let $ = Te !== "far", Oe = Te === "near", Ke = ["solar", "radar", "fusion", "terraforming"].includes(C.key), tt = C.state.construction;
    C.root.visible = me && C.state.visible, C.base.visible = $, C.built.visible = $ && tt >= 0.22, C.machines.visible = $ && (Oe || Ke) && tt >= 0.65, C.stock.visible = Oe && tt >= 0.86, C.status.visible = Oe && tt >= 0.94 && C.state.running && C.state.activity > 0, C.scaffold.visible = $ && tt > 0 && tt < 0.94, C.far.visible = !$, C.far.scale.y = 0.08 + 0.92 * tt;
  }
  function Et(C, $ = {}) {
    if (ce) return;
    let Oe = ye.find((Ke) => Ke.key === C);
    if (!Oe) throw new RangeError(`Unknown capital module: ${C}`);
    for (let Ke of ["visible", "running"]) typeof $[Ke] == "boolean" && (Oe.state[Ke] = $[Ke]);
    for (let Ke of ["activity", "construction", "storageFill"]) Number.isFinite($[Ke]) && (Oe.state[Ke] = l($[Ke]));
    for (let Ke of Oe.stockSetters) Ke(Oe.state.storageFill);
    je(Oe);
  }
  function xt(C) {
    C.updateWorldMatrix(true, true);
    let $ = C.matrixWorld.clone().invert(), Oe = new i42.Box3(), Ke = new i42.Matrix4();
    return C.traverse((tt) => {
      if (!tt.geometry) return;
      tt.isInstancedMesh ? tt.computeBoundingBox() : tt.geometry.boundingBox || tt.geometry.computeBoundingBox();
      let it = tt.isInstancedMesh ? tt.boundingBox : tt.geometry.boundingBox;
      it && !it.isEmpty() && Oe.union(it.clone().applyMatrix4(Ke.copy($).multiply(tt.matrixWorld)));
    }), Oe;
  }
  for (let C of ye) {
    C.f.finish(C.base, false), C.b.finish(C.built), C.e.finish(C.machines), C.s.finish(C.stock), C.farB.finish(C.far), C.root.traverse((Dt) => {
      Dt.userData.moduleKey = C.key;
    });
    for (let Dt of C.stockSetters) Dt(1);
    let $ = xt(C.root);
    $.expandByScalar(0.015), C.key === "radar" && ($.max.y = Math.max($.max.y, 3.55), $.min.z = Math.min($.min.z, -3.75));
    let Oe = [C.w * 0.75, Math.max(4.8, C.d * 0.58), C.d * 1], Ke = [0, C.key === "command" ? 1.3 : 0.7, 0], tt = Ie(C.entry, C.entryDirection, C.entryWidth), it = m(Ke).sub(m(Oe)).normalize().toArray(), Ge = ee[C.key];
    Ge.bounds = { min: $.min.toArray(), max: $.max.toArray() }, Ge.footprint = [[$.min.x, $.min.z], [$.max.x, $.min.z], [$.max.x, $.max.z], [$.min.x, $.max.z]], Ge.anchors = { ground: Ie([0, 0, 0]), view: Ie(Oe, it), entry: tt }, Ge.views = { whole: { eye: Oe, target: Ke, up: [0, 1, 0] } }, Ge.setState = (Dt) => Et(C.key, Dt), Et(C.key, {});
  }
  function ft(C = 0, { visible: $ = true, detail: Oe = "near", animate: Ke = true } = {}) {
    if (ce) return;
    me = !!$, ue.visible = me, Te = Oe === "far" ? "far" : Oe === "district" ? "district" : "near";
    let tt = Te === "near";
    fe.terrain.visible = tt, fe.silhouette.visible = !tt, F.visible = tt, ve.visible = !tt, ut.visible = tt, lt.visible = !tt, de.visible = tt, X.visible = !tt;
    let it = Number.isFinite(C) ? l(C, 0, 0.1) : 0;
    for (let Ge of ye) if (je(Ge), !(!me || !tt || !Ke || !Ge.state.visible || !Ge.state.running || Ge.state.activity <= 0 || Ge.state.construction < 0.94)) {
      Ge.clock += it * Ge.state.activity;
      for (let Dt of Ge.animate) Dt(Ge.clock);
    }
  }
  ft(0), ue.updateMatrixWorld(true);
  let Ot = xt(ue);
  for (let C of ye) {
    let $ = ee[C.key].bounds;
    Ot.union(new i42.Box3(m($.min).add(C.root.position), m($.max).add(C.root.position)));
  }
  let Zt = { min: Ot.min.toArray(), max: Ot.max.toArray() };
  function Kt(C) {
    let $ = C.map((it) => [it[0], it[1]]).sort((it, Ge) => it[0] - Ge[0] || it[1] - Ge[1]), Oe = (it, Ge, Dt) => (Ge[0] - it[0]) * (Dt[1] - it[1]) - (Ge[1] - it[1]) * (Dt[0] - it[0]), Ke = [], tt = [];
    for (let it of $) {
      for (; Ke.length > 1 && Oe(Ke.at(-2), Ke.at(-1), it) <= 0; ) Ke.pop();
      Ke.push(it);
    }
    for (let it = $.length - 1; it >= 0; it--) {
      let Ge = $[it];
      for (; tt.length > 1 && Oe(tt.at(-2), tt.at(-1), Ge) <= 0; ) tt.pop();
      tt.push(Ge);
    }
    return Ke.pop(), tt.pop(), Ke.concat(tt);
  }
  let Qt = Kt(le), cn = [0, 1.55, -4.1 * h], vn = [14.5 * f, 11.4, 19.8 * h], gn = { whole: { eye: [63 * f, 58, 72 * h], target: [0, 0.8, -0.6], up: [0, 1, 0] }, top: { eye: [0, 108 * Math.max(f, h), 0.01], target: [0, 0, 0], up: [0, 0, -1] }, entry: { eye: [10.6 * f, 6.1, 30.8 * h], target: [0, 0.6, 18.8 * h], up: [0, 1, 0] }, administration: { eye: vn, target: cn, up: [0, 1, 0] }, manufacturing: { eye: [38.5 * f, 20.7, 24.6 * h], target: [17.2 * f, 1, -0.6 * h], up: [0, 1, 0] }, energy: { eye: [-42 * f, 19.3, 4 * h], target: [-22 * f, 1, -3.5 * h], up: [0, 1, 0] }, environment: { eye: [34 * f, 12.6, -30.3 * h], target: [17.8 * f, 0.8, -16.2 * h], up: [0, 1, 0] } };
  for (let C of ye) {
    let $ = ee[C.key].views.whole;
    gn[C.key] = { eye: m($.eye).add(C.root.position).toArray(), target: m($.target).add(C.root.position).toArray(), up: [0, 1, 0] };
  }
  let mn = { position: [0, Ce(0, r / 2), r / 2], direction: [0, 0, 1], width: 2.15 }, En = { position: [s / 2, Ce(s / 2, 10.8 * h), 10.8 * h], direction: [1, 0, 0], width: 1.55 }, $t = { mainEntry: mn, cargoEntry: En, mineRoad: { position: [-s / 2 - 6.4, 0, -11.5 * h], direction: [-1, 0, 0], width: 1.4 }, spaceportRoad: { position: [s / 2 + 6.4, 0, 10.8 * h], direction: [1, 0, 0], width: 1.55 }, commandView: { position: vn, direction: m(cn).sub(m(vn)).normalize().toArray() } }, en = (C) => Math.abs(C.reduce(($, Oe, Ke) => {
    let tt = C[(Ke + 1) % C.length];
    return $ + Oe[0] * tt[1] - Oe[1] * tt[0];
  }, 0)) / 2, nn = { name: "CONCORD / \u9996\u90FD\u7EFC\u5408\u533A", version: "1.0.0", seed: e, units: "Relative model units, not metres. Ordinary utility tractor length about 0.52, width 0.255. Reference planet radius 1600 is not created.", coordinateSystem: "Y up. City anchors, siteBoundary, footprint, views and logisticsRoutes are capital-root local. Each modules[key].bounds, footprint, anchors and views are local to that module root. Module roots have only a local placement translation; all root scales are [1,1,1].", moduleLabels: v, city: { width: s, depth: r, footprintWidth: Ot.max.x - Ot.min.x, footprintDepth: Ot.max.z - Ot.min.z, footprintArea: en(Qt), boundaryArea: en(Ye), moduleCount: 10, districtCount: 5, buildingCount: ye.reduce((C, $) => C + $.buildingCount, 0) }, districts: [{ name: "\u884C\u653F\u79D1\u7814", modules: ["command", "research"] }, { name: "\u5236\u9020", modules: ["robotics", "nanofab"] }, { name: "\u80FD\u6E90\u516C\u7528\u5DE5\u7A0B", modules: ["solar", "fusion"] }, { name: "\u901A\u4FE1\u73AF\u5883\u5DE5\u7A0B", modules: ["radar", "terraforming"] }, { name: "\u534F\u4F5C\u540E\u52E4\u4E0E\u4FDD\u969C", modules: ["allianceLogistics", "planetarySupport"] }], modules: ye.map((C) => ({ key: C.key, label: v[C.key], position: C.root.position.toArray(), reservedSize: [C.w, C.d], buildingCount: C.buildingCount, animationObjects: C.animate.length, equipment: C.equipment, entryDirection: C.entryDirection })), logisticsRoutes: pt.map((C) => ({ ...C, points: C.points.map(($) => [$[0], Ce($[0], $[2]), $[2]]) })), defaults: { visible: true, running: true, activity: 1, construction: 1, storageFill: 0.5 }, constructionThresholds: { buildings: 0.22, equipment: 0.65, stocks: 0.86, operation: 0.94 }, limitations: ["Procedural visual asset; no economy, research queue, combat, selection system, planet placement or terrain deformation outside this root.", "Main roads, utilities, boundary and graded terrain remain when individual modules are hidden. Shared road infrastructure has its own group visibility.", "District detail retains architectural bodies and essential PV/radar/energy/environment silhouettes while reducing machinery, vehicles and streetscape detail. Far detail keeps coarse buildings and arrays. Both pause fine animation and preserve independent module visibility/construction state.", "Building and equipment scale stays fixed when size grows; size expands district spacing and shared site infrastructure. Minimum supported city size is 60 \xD7 44.", "The natural terrain outline is enclosed by footprint; siteBoundary is the smaller built perimeter. The environmental earthwork test plot is retained in the shared grade."], views: gn };
  function on(C) {
    let $ = ye.find((Oe) => Oe.key === C);
    if (!$) throw new RangeError(`Unknown capital module: ${C}`);
    return { ...$.state };
  }
  let xn = () => Object.fromEntries(ye.map((C) => [C.key, { ...C.state }]));
  function Jt() {
    if (!ce) {
      ce = true;
      for (let C of ye) C.animate.length = 0, C.stockSetters.length = 0;
      p.dispose(ue, ye.map((C) => C.root));
    }
  }
  return p.trimCaches(ue), { root: ue, groups: fe, modules: ee, footprint: Qt, siteBoundary: Ye, bounds: Zt, anchors: $t, heightAt: Ce, setModuleState: Et, getModuleState: on, getModuleStates: xn, update: ft, dispose: Jt, views: gn, meta: nn };
}

export {Xg as createModelToolkit, Yg as createOriginalCapital};
