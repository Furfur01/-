// Verbatim factory bodies extracted from the user-supplied CONTINUUM-离线预览 (3).html.
// SHA-256 194e180b93b64f0c906fba3d80bc65fd0a18cab04d1fcb9402aa7f2722cf2f4d
// Regenerate with node scripts/extract-continuum-assets.mjs. Extend through adapters, not here.
function Ug({ THREE: i42, type: e = "metal", seed: t = 17, size: n = { width: 6, depth: 4 }, ground: s = { heightAt: () => 0 }, floating: r = false } = {}) {
  if (!i42?.Group) throw new TypeError("createResourceComplex requires a THREE module.");
  if (!["metal", "crystal", "gas"].includes(e)) throw new RangeError("type must be metal, crystal or gas.");
  let o = Math.max(0.25, Number(n?.width) || 6) / 6, a = Math.max(0.25, Number(n?.depth) || 4) / 4;
  r = e === "gas" && !!r;
  let l = (t | 0) >>> 0, c = () => {
    l += 1831565813;
    let w = l;
    return w = Math.imul(w ^ w >>> 15, w | 1), w ^= w + Math.imul(w ^ w >>> 7, w | 61), ((w ^ w >>> 14) >>> 0) / 4294967296;
  }, d = (w, I = 0, H = 1) => Math.max(I, Math.min(H, w)), f = (w) => (w = d(w), w * w * (3 - 2 * w)), h = (w, I, H) => w + (I - w) * H, p = (w) => new i42.Vector3(...w), u = { earth: 8877410, cut: 10783600, gravel: 7565419, dark: 2634813, blue: 5533051, blueLight: 8492192, steel: 10332587, trim: 12765639, concrete: 11644062, pale: 13420985, yellow: 14264899, rubber: 2107180, glass: 2705494, ore: 7562836, crystal: 6918798, white: 14671314, red: 11950143, road: 4541776 }, _ = new i42.Group();
  _.name = `industrial-${e}${r ? "-floating" : ""}-${t}`;
  let g = {};
  for (let w of ["terrain", "structures", "equipment", "storage", "vehicles", "effects", "silhouette"]) g[w] = new i42.Group(), g[w].name = w, g[w].scale.set(o, 1, a), _.add(g[w]);
  let m = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set(), M = (w) => (m.add(w), w), y = (w) => {
    let I = new i42.MeshStandardMaterial({ vertexColors: true, ...w });
    return S.add(I), I;
  }, Y = { soil: y({ roughness: 0.97, metalness: 0 }), concrete: y({ roughness: 0.88, metalness: 0.02 }), painted: y({ roughness: 0.66, metalness: 0.28 }), steel: y({ roughness: 0.39, metalness: 0.68 }), rubber: y({ roughness: 0.9, metalness: 0.05 }), glass: y({ roughness: 0.23, metalness: 0.45 }), lamp: y({ roughness: 0.36, metalness: 0.1, emissive: 3625803, emissiveIntensity: 0.65 }), far: y({ roughness: 0.82, metalness: 0.15 }) }, b = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), A = [], V = [], ie = [], Q = [];
  function ue(w) {
    let I = new Float32Array(w.attributes.position.count * 3);
    return I.fill(1), w.setAttribute("color", new i42.BufferAttribute(I, 3)), M(w);
  }
  function fe(w, I) {
    return b.has(w) || b.set(w, M(I())), b.get(w);
  }
  let He = fe("box", () => new i42.BoxGeometry(1, 1, 1)), he = fe("chamfer", () => {
    let w = new i42.Shape(), I = 0.06, H = 0.5 - I;
    w.moveTo(-H, -0.5), w.lineTo(H, -0.5), w.lineTo(0.5, -H), w.lineTo(0.5, H), w.lineTo(H, 0.5), w.lineTo(-H, 0.5), w.lineTo(-0.5, H), w.lineTo(-0.5, -H), w.closePath();
    let L = new i42.ExtrudeGeometry(w, { depth: 0.88, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelThickness: 0.055, bevelSize: 0.018, curveSegments: 1 });
    L.translate(0, 0, -0.44), L.computeBoundingBox();
    let q = L.boundingBox, J = new i42.Vector3();
    return q.getSize(J), L.scale(1 / J.x, 1 / J.y, 1 / J.z), L;
  }), Ae = fe("cyl16", () => new i42.CylinderGeometry(1, 1, 1, 16, 1)), ke = fe("cyl8", () => new i42.CylinderGeometry(1, 1, 1, 8, 1)), we = fe("cyl12", () => new i42.CylinderGeometry(1, 1, 1, 12, 1)), pt = fe("sphere", () => new i42.SphereGeometry(1, 16, 8)), ot = fe("rock", () => new i42.IcosahedronGeometry(1, 0)), Ce = new i42.Vector3(0, 1, 0), le = new i42.Quaternion(), Be = 0;
  function ze(w, I, H, L = "painted", q = [0, 0, 0], J = [1, 1, 1], Se = null) {
    w.userData.batchId || (w.userData.batchId = ++Be);
    let _e = w.userData.batchId + ":" + L;
    O.has(_e) || O.set(_e, { owner: w, material: L, pieces: [] });
    let Re = Se instanceof i42.Quaternion ? Se : Se ? new i42.Quaternion().setFromEuler(new i42.Euler(...Se)) : le, We = new i42.Matrix4().compose(p(q), Re, p(J));
    O.get(_e).pieces.push({ geometry: I, matrix: We, color: new i42.Color(H) });
  }
  function re(w, I, H, L = u.blue, q = "painted", J = null, Se = true) {
    ze(w, Se ? he : He, L, q, I, H, J);
  }
  function F(w, I, H, L, q = u.steel, J = "steel", Se = null, _e = false) {
    ze(w, _e ? ke : Ae, q, J, I, [H, L, H], Se);
  }
  function ve(w, I, H, L = u.steel, q = "steel") {
    ze(w, pt, L, q, I, H);
  }
  function ae(w, I, H, L = 0.016, q = u.steel, J = "steel", Se = false) {
    let _e = p(I), Re = p(H), We = Re.clone().sub(_e), Ze = We.length();
    if (Ze < 1e-6) return;
    let nt = new i42.Quaternion().setFromUnitVectors(Ce, We.normalize());
    ze(w, Se ? He : we, q, J, _e.add(Re).multiplyScalar(0.5).toArray(), Se ? [L, Ze, L] : [L, Ze, L], nt);
  }
  function $e(w, I, H, L = 7e-3, q = u.steel, J = [Math.PI / 2, 0, 0], Se = "steel") {
    let _e = Math.max(0.014, L / H), Re = `ring-${_e.toFixed(3)}`;
    ze(w, fe(Re, () => new i42.TorusGeometry(1, _e, 5, 24)), q, Se, I, [H, H, H], J);
  }
  function rt(w, I) {
    let H = [];
    for (let q of I) for (let J = 1; J < q.length - 1; J++) for (let Se of [q[0], q[J], q[J + 1]]) H.push(...w[Se]);
    let L = new i42.BufferGeometry();
    return L.setAttribute("position", new i42.Float32BufferAttribute(H, 3)), L.computeVertexNormals(), M(L);
  }
  let Qe = fe("gable", () => rt([[-0.5, 0, -0.5], [0.5, 0, -0.5], [0, 1, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5], [0, 1, 0.5]], [[0, 2, 1], [3, 4, 5], [0, 3, 5, 2], [1, 2, 5, 4], [0, 1, 4, 3]])), _t = fe("cone", () => new i42.CylinderGeometry(1, 0.25, 1, 8));
  function vt() {
    for (let { owner: w, material: I, pieces: H } of O.values()) {
      let L = 0;
      for (let T of H) L += T.geometry.index ? T.geometry.index.count : T.geometry.attributes.position.count;
      let q = new Float32Array(L * 3), J = new Float32Array(L * 3), Se = new Float32Array(L * 3), _e = 0, Re = new i42.Vector3(), We = new i42.Vector3();
      for (let T of H) {
        let N = T.geometry, te = new i42.Matrix3().getNormalMatrix(T.matrix), oe = N.attributes.position, Ne = N.attributes.normal, Ue = N.index ? N.index.count : oe.count;
        for (let x = 0; x < Ue; x++) {
          let D = N.index ? N.index.getX(x) : x;
          Re.fromBufferAttribute(oe, D).applyMatrix4(T.matrix), We.fromBufferAttribute(Ne, D).applyMatrix3(te).normalize(), q.set([Re.x, Re.y, Re.z], _e), J.set([We.x, We.y, We.z], _e), Se.set([T.color.r, T.color.g, T.color.b], _e), _e += 3;
        }
      }
      let Ze = M(new i42.BufferGeometry());
      Ze.setAttribute("position", new i42.BufferAttribute(q, 3)), Ze.setAttribute("normal", new i42.BufferAttribute(J, 3)), Ze.setAttribute("color", new i42.BufferAttribute(Se, 3)), Ze.computeBoundingBox(), Ze.computeBoundingSphere();
      let nt = new i42.Mesh(Ze, Y[I]);
      nt.name = `${w.name || "part"}-${I}`, nt.castShadow = I !== "soil", nt.receiveShadow = true, w.add(nt);
    }
    O.clear();
  }
  function Ye(w, I) {
    let H = new i42.Group();
    return H.name = I, w.add(H), H;
  }
  let ut = e === "metal" ? 8.6 : 6.15, lt = e === "metal" ? 5.6 : 4.2, at = typeof s?.heightAt == "function" ? s.heightAt : () => 0, ct = Number(at(0, 0)) || 0, Ct = (w, I) => (Number(at(w * o, I * a)) || 0) - ct, se = { x: -2.13, z: -0.06, rx: 1.73, rz: 2.13, depth: 1.2 }, Ht = [];
  if (e === "metal") for (let w = 0; w <= 170; w++) {
    let I = w / 170, H = h(1.025, 0.19, I), L = -0.19 * Math.PI + I * Math.PI * 3.35;
    Ht.push([se.x + Math.cos(L) * se.rx * H, -se.depth * I, se.z + Math.sin(L) * se.rz * H]);
  }
  function de(w, I) {
    let H = Math.hypot((w - se.x) / se.rx, (I - se.z) / se.rz);
    if (H >= 1.025) return 0;
    let L = [[0, -1.2], [0.19, -1.2], [0.29, -1.2], [0.4, -0.91], [0.49, -0.91], [0.6, -0.61], [0.69, -0.61], [0.8, -0.31], [0.89, -0.31], [1.025, 0]], q = 0;
    for (let Re = 1; Re < L.length; Re++) if (H <= L[Re][0]) {
      let We = L[Re - 1], Ze = L[Re];
      q = h(We[1], Ze[1], d((H - We[0]) / (Ze[0] - We[0])));
      break;
    }
    let J = 1e9, Se = 0;
    for (let Re = 1; Re < Ht.length; Re++) {
      let We = Ht[Re - 1], Ze = Ht[Re], nt = Ze[0] - We[0], T = Ze[2] - We[2], N = d(((w - We[0]) * nt + (I - We[2]) * T) / (nt * nt + T * T)), te = (w - We[0] - nt * N) ** 2 + (I - We[2] - T * N) ** 2;
      te < J && (J = te, Se = h(We[1], Ze[1], N));
    }
    let _e = Math.sqrt(J);
    return _e < 0.215 && (q = h(q, Se, 1 - f((_e - 0.148) / 0.067))), q;
  }
  function X(w, I) {
    if (r) return 0;
    let H = Math.min(ut / 2 - Math.abs(w), lt / 2 - Math.abs(I));
    if (H < 0) return Ct(w, I);
    let L = Ct(w, I) - 0.09 * (1 - f(H / 0.42)), q = h(L, 0, f(H / 0.42));
    if (e === "metal" && (q += de(w, I)), e === "crystal" && w < -1.35 && I < -0.57) {
      let J = Math.exp(-(((w + 2.28) / 0.62) ** 2 + ((I + 1.25) / 0.57) ** 2));
      q += 0.36 * J;
    }
    return q;
  }
  let G = (w, I) => X(w / o, I / a);
  function Fe(w, I) {
    let H = [], L = [], q = [];
    for (let Se = 0; Se <= I; Se++) for (let _e = 0; _e <= w; _e++) {
      let Re = (_e / w - 0.5) * ut, We = (Se / I - 0.5) * lt, Ze = X(Re, We);
      H.push(Re, Ze, We);
      let nt = 0.96 + 0.055 * Math.sin(Re * 59.2 + We * 82.1 + t) + 0.03 * Math.sin(Re * 148 + We * 39), T = e === "metal" && Ze < -0.1 ? 0.94 + 0.1 * Math.sin(Ze * 64) : 1, N = new i42.Color(Ze < -0.12 ? u.cut : e === "gas" ? 9671044 : u.earth).multiplyScalar(nt * T);
      if (L.push(N.r, N.g, N.b), _e < w && Se < I) {
        let te = Se * (w + 1) + _e, oe = te + w + 1;
        q.push(te, oe, te + 1, oe, oe + 1, te + 1);
      }
    }
    let J = M(new i42.BufferGeometry());
    return J.setAttribute("position", new i42.Float32BufferAttribute(H, 3)), J.setAttribute("color", new i42.Float32BufferAttribute(L, 3)), J.setIndex(q), J.computeVertexNormals(), J.computeBoundingBox(), J.computeBoundingSphere(), J;
  }
  let P = [];
  if (!r) {
    let w = new i42.Mesh(Fe(e === "metal" ? 164 : 72, e === "metal" ? 114 : 50), Y.soil);
    w.name = "graded-ground-and-excavation", w.receiveShadow = true, g.terrain.add(w);
    let I = Fe(e === "metal" ? 42 : 18, e === "metal" ? 30 : 12), H = new i42.Mesh(I, Y.soil);
    H.receiveShadow = true, H.name = "terrain-coarse", g.silhouette.add(H);
  }
  function v(w, I, H, L, q = 0.048, J = g.terrain) {
    let Se = X(w, I);
    return re(J, [w, Se + q / 2 + 4e-3, I], [H, q, L], u.concrete, "concrete"), Q.push({ x: w, z: I, w: H, d: L, y: Se + q + 0.01 }), Se + q + 4e-3;
  }
  function k(w, I, H = u.blue, L = null) {
    re(g.silhouette, w, I, H, "far", L, false);
  }
  function ee(w, I, H, L = u.steel, q = null) {
    F(g.silhouette, w, I, H, L, "far", q, true);
  }
  function ye(w, I, H, L, q, J = "painted", Se = 0.012) {
    let _e = p(I), Re = p(H), We = Re.clone().sub(_e), Ze = We.length(), nt = We.clone().normalize(), T = new i42.Vector3().crossVectors(Ce, nt).normalize(), N = new i42.Vector3().crossVectors(nt, T).normalize(), te = new i42.Quaternion().setFromRotationMatrix(new i42.Matrix4().makeBasis(T, N, nt));
    re(w, _e.add(Re).multiplyScalar(0.5).toArray(), [L, Se, Ze], q, J, te, false);
  }
  function Ee(w, I = 0.43) {
    for (let H = 1; H < w.length; H++) {
      let L = w[H - 1], q = w[H], J = Math.max(1, Math.ceil(Math.hypot(q[0] - L[0], q[1] - L[1]) / 0.11));
      for (let Se = 0; Se < J; Se++) {
        let _e = h(L[0], q[0], Se / J), Re = h(L[1], q[1], Se / J), We = h(L[0], q[0], (Se + 1) / J), Ze = h(L[1], q[1], (Se + 1) / J);
        ye(g.terrain, [_e, X(_e, Re) + 0.013, Re], [We, X(We, Ze) + 0.013, Ze], I, u.road, "concrete");
      }
    }
    for (let H = 1; H < w.length; H++) {
      let L = w[H - 1], q = w[H], J = Math.hypot(q[0] - L[0], q[1] - L[1]), Se = Math.floor(J / 0.22);
      for (let _e = 0; _e < Se; _e++) {
        let Re = (_e + 0.5) / Se, We = h(L[0], q[0], Re), Ze = h(L[1], q[1], Re);
        re(g.terrain, [We, X(We, Ze) + 0.022, Ze], [0.013, 3e-3, 0.09], u.pale, "painted", [0, Math.atan2(q[0] - L[0], q[1] - L[1]), 0], false);
      }
    }
  }
  function De(w, I, H = 0.135, L = u.yellow, q = 0.23) {
    for (let J = 1; J < I.length; J++) {
      let Se = I[J - 1], _e = I[J], Re = p(_e).distanceTo(p(Se)), We = Math.max(1, Math.ceil(Re / q));
      for (let Ze of [0.52, 1]) ae(w, [Se[0], Se[1] + H * Ze, Se[2]], [_e[0], _e[1] + H * Ze, _e[2]], 48e-4, L, "painted");
      for (let Ze = 0; Ze <= We; Ze++) {
        let nt = Ze / We, T = [h(Se[0], _e[0], nt), h(Se[1], _e[1], nt), h(Se[2], _e[2], nt)];
        ae(w, T, [T[0], T[1] + H, T[2]], 54e-4, L, "painted");
      }
    }
  }
  function ce(w, I, H, L, q, J, Se = true, _e = "") {
    re(w, [I, H - 0.013, L], [q, 0.026, J], u.dark, "steel");
    for (let Re = -q / 2 + 0.035; Re < q / 2; Re += 0.06) re(w, [I + Re, H + 1e-3, L], [9e-3, 3e-3, J - 0.025], u.blueLight, "steel", null, false);
    if (_e !== "front" && De(w, [[I - q / 2, H, L + J / 2], [I + q / 2, H, L + J / 2]]), _e !== "back" && De(w, [[I - q / 2, H, L - J / 2], [I + q / 2, H, L - J / 2]]), _e !== "left" && De(w, [[I - q / 2, H, L - J / 2], [I - q / 2, H, L + J / 2]]), _e !== "right" && De(w, [[I + q / 2, H, L - J / 2], [I + q / 2, H, L + J / 2]]), Se) for (let Re of [-q / 2 + 0.03, q / 2 - 0.03]) for (let We of [-J / 2 + 0.03, J / 2 - 0.03]) {
      let Ze = X(I + Re, L + We);
      ae(w, [I + Re, Ze + 0.04, L + We], [I + Re, H - 0.01, L + We], 0.022, u.dark, "steel", true), re(w === g.storage ? g.storage : g.terrain, [I + Re, Ze + 0.02, L + We], [0.09, 0.04, 0.09], u.concrete, "concrete");
    }
  }
  function me(w, I, H, L = 0.23) {
    let q = Math.max(3, Math.ceil(Math.abs(H[1] - I[1]) / 0.042)), J = p(H).sub(p(I)), Se = Math.hypot(J.x, J.z), _e = Math.atan2(J.x, J.z), Re = [Math.cos(_e), 0, -Math.sin(_e)];
    for (let We = 0; We < q; We++) {
      let Ze = (We + 0.5) / q;
      re(w, [h(I[0], H[0], Ze), h(I[1], H[1], (We + 1) / q), h(I[2], H[2], Ze)], [L, 0.016, Se / q + 0.012], u.blueLight, "steel", [0, _e, 0], false);
    }
    for (let We of [-1, 1]) {
      let Ze = [I[0] + Re[0] * L * 0.48 * We, I[1], I[2] + Re[2] * L * 0.48 * We], nt = [H[0] + Re[0] * L * 0.48 * We, H[1], H[2] + Re[2] * L * 0.48 * We];
      ae(w, Ze, nt, 0.018, u.dark, "steel", true), De(w, [Ze, nt], 0.13, u.yellow, 0.16);
    }
  }
  function Te(w, I, H, L, q, J = 0) {
    let Se = Math.cos(J) * 0.05, _e = Math.sin(J) * 0.05;
    for (let Re of [-1, 1]) ae(w, [I + Se * Re, H, L + _e * Re], [I + Se * Re, H + q, L + _e * Re], 6e-3, u.steel);
    for (let Re = 0.025; Re < q; Re += 0.05) ae(w, [I - Se, H + Re, L - _e], [I + Se, H + Re, L + _e], 5e-3, u.yellow, "painted");
  }
  function Ie(w, I, H = 0.026, L = u.blueLight, q = true) {
    for (let J = 1; J < I.length; J++) if (ae(w, I[J - 1], I[J], H, L), q && J === 1) {
      let Se = p(I[J]).sub(p(I[J - 1])).normalize(), _e = p(I[J - 1]).addScaledVector(Se, 0.045), Re = _e.clone().addScaledVector(Se, 0.016);
      ae(w, _e.toArray(), Re.toArray(), H * 1.43, u.dark);
    }
    for (let J = 1; J < I.length - 1; J++) ve(w, I[J], [H * 1.055, H * 1.055, H * 1.055], L);
  }
  function Ve(w, I, H, L, q = 0, J = u.yellow) {
    F(w, [I, H, L], 0.049, 0.09, u.blue, "painted", [0, 0, Math.PI / 2 + q]), ae(w, [I, H, L], [I, H + 0.077, L], 9e-3, u.steel), $e(w, [I, H + 0.08, L], 0.041, 5e-3, J, [Math.PI / 2, 0, 0], "painted"), ae(w, [I - 0.039, H + 0.08, L], [I + 0.039, H + 0.08, L], 3e-3, J, "painted"), ae(w, [I, H + 0.08, L - 0.039], [I, H + 0.08, L + 0.039], 3e-3, J, "painted");
  }
  function qe(w, { x: I, z: H, w: L, d: q, h: J, roof: Se = 0.14, color: _e = u.blue, open: Re = false, name: We = "process-hall", doors: Ze = 1 }) {
    let nt = v(I, H, L + 0.14, q + 0.14, 0.048, w === g.storage ? g.storage : g.terrain), T = H + q / 2;
    if (Re) {
      re(w, [I, nt + 0.16, H - q / 2], [L, 0.31, 0.05], u.concrete, "concrete");
      for (let N of [-1, 1]) re(w, [I + N * L / 2, nt + 0.13, H], [0.035, 0.26, q], u.concrete, "concrete");
    } else {
      re(w, [I, nt + J / 2, H], [L, J, q], _e), re(w, [I, nt + 0.105, T + 0.014], [L - 0.045, 0.2, 0.025], u.dark);
      let N = Math.max(4, Math.ceil(L / 0.13));
      for (let te = 0; te <= N; te++) {
        let oe = I - L / 2 + te * L / N;
        re(w, [oe, nt + J / 2, T + 0.018], [9e-3, J - 0.018, 0.014], u.blueLight, "steel", null, false);
      }
      for (let te of [-1, 1]) for (let oe = H - q / 2 + 0.07; oe < H + q / 2; oe += 0.14) re(w, [I + te * (L / 2 + 9e-3), nt + J / 2, oe], [0.014, J - 0.02, 9e-3], u.blueLight, "steel", null, false);
      re(w, [I, nt + J * 0.78, T + 0.023], [L * 0.84, 0.12, 0.012], u.glass, "glass", null, false);
      for (let te = 0; te < Ze; te++) {
        let oe = I + (te - (Ze - 1) / 2) * Math.min(0.43, L / Ze), Ne = Math.min(0.34, L * 0.3);
        re(w, [oe, nt + 0.195, T + 0.03], [Ne + 0.037, 0.395, 0.02], u.dark), re(w, [oe, nt + 0.19, T + 0.044], [Ne, 0.36, 0.012], u.trim, "painted", null, false);
        for (let Ue = 1; Ue < 7; Ue++) re(w, [oe, nt + Ue * 0.05, T + 0.052], [Ne, 4e-3, 5e-3], u.blueLight, "steel", null, false);
        for (let Ue of [-1, 1]) F(w, [oe + Ue * (Ne / 2 + 0.055), nt + 0.075, T + 0.075], 0.014, 0.15, u.yellow, "painted", null, true);
      }
    }
    for (let N = I - L / 2; N <= I + L / 2 + 0.02; N += L / Math.max(2, Math.ceil(L / 0.42))) for (let te of [-1, 1]) ae(w, [N, nt, H + te * q / 2], [N, nt + J, H + te * q / 2], 0.032, u.dark, "steel", true), re(w, [N, nt + 0.025, H + te * q / 2], [0.085, 0.034, 0.085], u.trim, "steel");
    ze(w, Qe, u.dark, "painted", [I, nt + J, H], [L + 0.09, Se, q + 0.1]);
    for (let N = H - q / 2 - 0.03; N <= H + q / 2 + 0.03; N += 0.085) ae(w, [I - L / 2 - 0.045, nt + J + 8e-3, N], [I, nt + J + Se + 8e-3, N], 7e-3, u.blueLight, "steel"), ae(w, [I, nt + J + Se + 8e-3, N], [I + L / 2 + 0.045, nt + J + 8e-3, N], 7e-3, u.blueLight, "steel");
    for (let N of [-1, 1]) ae(w, [I + N * (L / 2 + 0.036), nt + J + 8e-3, H - q / 2 - 0.04], [I + N * (L / 2 + 0.036), nt + J + 8e-3, H + q / 2 + 0.04], 0.013, u.trim);
    if (!Re) {
      for (let N of [-0.21, 0.21]) if (Math.abs(N) < q * 0.4) {
        re(w, [I, nt + J + Se + 0.042, H + N], [0.22, 0.078, 0.13], u.blueLight);
        for (let te = 0; te < 4; te++) re(w, [I - 0.075 + te * 0.05, nt + J + Se + 0.083, H + N], [9e-3, 7e-3, 0.11], u.dark, "steel", null, false);
      }
    }
    return k([I, nt + J * 0.5, H], [L, J, q], _e), ze(g.silhouette, Qe, u.dark, "far", [I, nt + J, H], [L + 0.07, Se, q + 0.06]), { x: I, y: nt, z: H, w: L, h: J, d: q, name: We };
  }
  function Rt(w, I, H, L = u.ore, q = 24, J = false) {
    let Se = J ? Ye(w, "inventory-stockpile") : w;
    J && (Se.position.set(...I), V.push({ kind: "scale", object: Se }), I = [0, 0, 0]);
    let _e = M(new i42.SphereGeometry(1, 15, 6, 0, Math.PI * 2, 0, Math.PI / 2));
    ze(Se, _e, L, "soil", I, H);
    for (let Re = 0; Re < q; Re++) {
      let We = Math.sqrt(c()) * 0.96, Ze = c() * Math.PI * 2, nt = Math.cos(Ze) * We * H[0], T = Math.sin(Ze) * We * H[2], N = Math.sqrt(1 - We * We) * H[1], te = 0.018 + c() * 0.035;
      ze(Se, ot, new i42.Color(L).multiplyScalar(0.8 + c() * 0.38), "soil", [I[0] + nt, I[1] + N, I[2] + T], [te, te * 0.72, te * 1.3], [c(), c(), c()]);
    }
  }
  function bt(w, I, { width: H = 0.23, covered: L = false, color: q = u.ore, move: J = true } = {}) {
    let Se = g.equipment, _e = p(w), Re = p(I), We = Re.clone().sub(_e), Ze = We.length(), nt = new i42.Vector3().crossVectors(Ce, We).normalize();
    ye(Se, w, I, H, u.rubber, "rubber", 0.029);
    for (let N of [-1, 1]) {
      let te = _e.clone().addScaledVector(nt, H * 0.53 * N), oe = Re.clone().addScaledVector(nt, H * 0.53 * N);
      ae(Se, te.toArray(), oe.toArray(), 0.017, u.blueLight, "steel", true), ae(Se, te.clone().add(new i42.Vector3(0, -0.14, 0)).toArray(), oe.clone().add(new i42.Vector3(0, -0.14, 0)).toArray(), 0.011, u.dark, "steel", true);
      let Ne = Math.ceil(Ze / 0.18);
      for (let Ue = 0; Ue < Ne; Ue++) {
        let x = te.clone().lerp(oe, Ue / Ne), D = te.clone().lerp(oe, (Ue + 1) / Ne);
        (Ue % 2 ? x : D).y -= 0.135, ae(Se, x.toArray(), D.toArray(), 6e-3, u.blueLight, "steel");
      }
    }
    for (let N = 0; N <= Math.ceil(Ze / 0.19); N++) {
      let te = _e.clone().lerp(Re, N / Math.ceil(Ze / 0.19));
      ae(Se, te.clone().addScaledVector(nt, -0.11).add(new i42.Vector3(0, -0.017, 0)).toArray(), te.clone().addScaledVector(nt, 0.11).add(new i42.Vector3(0, -0.017, 0)).toArray(), 0.022, u.dark, "rubber");
    }
    for (let N = 0; N <= Math.ceil(Ze / 0.55); N++) {
      let te = _e.clone().lerp(Re, N / Math.ceil(Ze / 0.55));
      for (let oe of [-1, 1]) {
        let Ne = te.clone().addScaledVector(nt, H * 0.55 * oe), Ue = X(Ne.x, Ne.z) + 0.04;
        ae(Se, [Ne.x, Ue, Ne.z], [Ne.x, Ne.y - 0.06, Ne.z], 0.014, u.dark, "steel", true), re(g.terrain, [Ne.x, Ue - 0.015, Ne.z], [0.085, 0.03, 0.085], u.concrete, "concrete");
      }
    }
    if (L) {
      let N = _e.clone().add(new i42.Vector3(0, 0.11, 0)), te = Re.clone().add(new i42.Vector3(0, 0.11, 0));
      ye(Se, N.toArray(), te.toArray(), H + 0.055, u.blue, "painted", 0.07);
    }
    let T = Re.clone().addScaledVector(nt, H * 0.83);
    if (F(Se, T.toArray(), 0.051, 0.11, u.blue, "painted", [Math.PI / 2, 0, Math.atan2(nt.x, nt.z)]), ye(g.silhouette, w, I, H, u.dark, "far", 0.1), J && !L) {
      let N = ue(new i42.IcosahedronGeometry(0.022, 0)), te = new i42.InstancedMesh(N, Y.soil, Math.max(5, Math.floor(Ze / 0.12)));
      te.name = "conveyor-material", te.castShadow = true;
      let oe = new i42.Color(q);
      for (let x = 0; x < te.count; x++) te.setColorAt(x, oe.clone().multiplyScalar(0.86 + c() * 0.23));
      g.effects.add(te);
      let Ne = new i42.Matrix4(), Ue = (x) => {
        for (let D = 0; D < te.count; D++) {
          let Z = (D / te.count + x * 0.19 / Ze) % 1, j = _e.clone().lerp(Re, Z);
          j.y += 0.036, Ne.compose(j, le, new i42.Vector3(1.2, 0.64, 0.91)), te.setMatrixAt(D, Ne);
        }
        te.instanceMatrix.needsUpdate = true, te.computeBoundingBox(), te.computeBoundingSphere();
      };
      Ue(0), A.push(Ue);
    }
  }
  function kt(w, I, H, L = 0.55, q = 0.44) {
    let J = rt([[-L / 2, 0.27, -q / 2], [L / 2, 0.27, -q / 2], [L / 2, 0.27, q / 2], [-L / 2, 0.27, q / 2], [-0.1, 0, -0.085], [0.1, 0, -0.085], [0.1, 0, 0.085], [-0.1, 0, 0.085]], [[0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0], [4, 7, 6, 5]]);
    ze(g.equipment, J, u.blueLight, "steel", [w, I, H]);
    let Se = new i42.Group();
    re(g.equipment, [w, I + 0.245, H], [L * 0.88, 0.035, q * 0.88], u.rubber, "rubber");
    for (let _e of [-L / 2, L / 2]) for (let Re of [-q / 2, q / 2]) ae(g.equipment, [w + _e, X(w + _e, H + Re) + 0.055, H + Re], [w + _e, I + 0.28, H + Re], 0.02, u.dark, "steel", true);
    for (let _e of [-q / 2, q / 2]) ae(g.equipment, [w - L / 2, I + 0.28, H + _e], [w + L / 2, I + 0.28, H + _e], 0.014, u.yellow, "painted");
    Rt(g.equipment, [w, I + 0.26, H], [L * 0.4, 0.07, q * 0.36], u.ore, 8);
  }
  function pe(w, I, H, L = 1, q = u.yellow, J = "haul-truck", Se = "ore") {
    let _e = Ye(w, J);
    _e.position.set(I, X(I, H) + 9e-3, H), _e.scale.setScalar(L), re(_e, [0, 0.113, 0], [0.204, 0.044, 0.43], u.dark, "steel"), re(_e, [0, 0.205, 0.145], [0.202, 0.14, 0.142], q), re(_e, [0, 0.229, 0.222], [0.174, 0.064, 9e-3], u.glass, "glass");
    for (let We of [-1, 1]) re(_e, [We * 0.105, 0.228, 0.159], [8e-3, 0.062, 0.085], u.glass, "glass");
    if (re(_e, [0, 0.28, 0.14], [0.218, 0.019, 0.155], q), re(_e, [0, 0.166, -0.071], [0.23, 0.037, 0.284], q), Se === "tank") {
      F(_e, [0, 0.234, -0.071], 0.091, 0.245, u.pale, "painted", [Math.PI / 2, 0, 0]);
      for (let We of [-1, 1]) ve(_e, [0, 0.234, -0.071 + We * 0.1225], [0.091, 0.091, 0.038], u.pale, "painted"), F(_e, [0, 0.234, -0.071 + We * 0.072], 0.094, 9e-3, u.blueLight, "steel", [Math.PI / 2, 0, 0]);
      F(_e, [0, 0.337, -0.07], 0.024, 0.026, u.dark, "steel", null, true), ae(_e, [0.102, 0.2, -0.18], [0.102, 0.2, 0.028], 8e-3, u.dark);
    } else if (Se === "ore") {
      re(_e, [0, 0.23, -0.205], [0.232, 0.114, 0.018], q);
      for (let We of [-1, 1]) re(_e, [We * 0.113, 0.224, -0.073], [0.018, 0.103, 0.277], q);
    } else for (let We = 0; We < 6; We++) re(_e, [We % 2 ? 0.05 : -0.05, 0.216, -0.17 + Math.floor(We / 2) * 0.094], [0.09, 0.088, 0.084], u.pale);
    for (let We of [-1, 1]) for (let Ze of [-0.14, -0.025, 0.156]) F(_e, [We * 0.116, 0.067, Ze], 0.064, 0.05, u.rubber, "rubber", [0, 0, Math.PI / 2], true), F(_e, [We * 0.144, 0.067, Ze], 0.032, 5e-3, u.blueLight, "steel", [0, 0, Math.PI / 2], true);
    re(_e, [0, 0.118, 0.233], [0.221, 0.024, 0.024], u.blueLight, "steel");
    for (let We of [-1, 1]) re(_e, [We * 0.074, 0.166, 0.224], [0.037, 0.022, 8e-3], u.pale, "lamp");
    ae(_e, [-0.091, 0.29, 0.13], [-0.091, 0.32, 0.13], 7e-3, u.dark), F(_e, [-0.091, 0.325, 0.13], 0.014, 0.02, u.yellow, "lamp", null, true);
    let Re = Ye(_e, "truck-payload");
    return Re.position.set(0, 0.191, -0.077), Se === "ore" && ze(Re, ot, u.ore, "soil", [0, 0, 0], [0.09, 0.09, 0.121]), { group: _e, load: Re };
  }
  function gt(w, I, H = 0.16, L = 1.1) {
    let q = I.map((Ze) => [Ze[0], Ze[1] ?? X(Ze[0], Ze[2]), Ze[2]]), J = [0];
    for (let Ze = 1; Ze < q.length; Ze++) J.push(J[Ze - 1] + p(q[Ze]).distanceTo(p(q[Ze - 1])));
    let Se = J.at(-1), _e = Se / H, Re = _e * 2 + L * 2;
    ie.push(...q.map((Ze) => [Ze[0], Ze[1], Ze[2]]));
    function We(Ze) {
      let nt = Ze % Re, T = 0, N = 1, te = 0.1;
      nt < L ? (te = h(0.1, 1, nt / L), T = 0) : nt < L + _e ? (T = (nt - L) * H, te = 1) : nt < L * 2 + _e ? (T = Se, te = h(1, 0.1, (nt - L - _e) / L)) : (T = Se - (nt - L * 2 - _e) * H, N = -1, te = 0.1);
      let oe = 1;
      for (; oe < J.length - 1 && J[oe] < T; ) oe++;
      let Ne = d((T - J[oe - 1]) / Math.max(1e-5, J[oe] - J[oe - 1])), Ue = q[oe - 1], x = q[oe], D = h(Ue[0], x[0], Ne), Z = h(Ue[2], x[2], Ne), j = Math.atan2((x[0] - Ue[0]) * N, (x[2] - Ue[2]) * N), z = Math.sin(j), ge = Math.cos(j), xe = Math.cos(j), Me = -Math.sin(j), Je = 0.16 * w.group.scale.x, Mt = 0.115 * w.group.scale.x, dt = -Math.atan2(X(D + z * Je, Z + ge * Je) - X(D - z * Je, Z - ge * Je), Je * 2), yt = Math.atan2(X(D + xe * Mt, Z + Me * Mt) - X(D - xe * Mt, Z - Me * Mt), Mt * 2);
      w.group.position.set(D, X(D, Z) + 9e-3, Z), w.group.rotation.set(dt, j, yt, "YXZ"), w.load.scale.y = te;
    }
    We(0), A.push(We);
  }
  function je(w, I, H = -0.9) {
    let L = Ye(g.vehicles, "pit-crawler-excavator");
    L.position.set(w, X(w, I) + 9e-3, I), L.rotation.y = H;
    for (let _e of [-1, 1]) {
      re(L, [_e * 0.15, 0.069, 0], [0.1, 0.128, 0.46], u.rubber, "rubber");
      for (let Re = 0; Re < 6; Re++) F(L, [_e * 0.202, 0.067, -0.168 + Re * 0.067], 0.042, 8e-3, u.dark, "steel", [0, 0, Math.PI / 2], true);
      for (let Re = 0; Re < 11; Re++) re(L, [_e * 0.15, 0.136, -0.205 + Re * 0.041], [0.106, 0.011, 0.025], u.blueLight, "steel", null, false);
    }
    F(L, [0, 0.157, 0], 0.142, 0.048, u.dark), re(L, [0, 0.225, -0.073], [0.34, 0.12, 0.28], u.yellow), re(L, [-0.1, 0.332, 0.1], [0.155, 0.23, 0.2], u.blue), re(L, [-0.1, 0.364, 0.204], [0.134, 0.14, 7e-3], u.glass, "glass"), re(L, [-0.181, 0.364, 0.1], [6e-3, 0.14, 0.16], u.glass, "glass"), re(L, [-0.1, 0.453, 0.1], [0.178, 0.024, 0.225], u.yellow), re(L, [0.08, 0.292, -0.12], [0.135, 0.025, 0.13], u.dark);
    let q = [0.074, 0.29, 0.065], J = [0.074, 0.72, 0.32], Se = [0.074, 0.32, 0.56];
    ae(L, q, J, 0.075, u.yellow, "painted", true), ae(L, J, Se, 0.06, u.yellow, "painted", true), ae(L, [0.092, 0.28, 0.12], [0.092, 0.63, 0.34], 0.018, u.dark), ae(L, [0.093, 0.45, 0.255], [0.093, 0.65, 0.36], 0.011, u.steel), ae(L, [0.075, 0.69, 0.295], [0.075, 0.35, 0.495], 0.016, u.dark), ae(L, [0.075, 0.57, 0.365], [0.075, 0.36, 0.5], 0.01, u.steel);
    for (let _e of [q, J, Se]) F(L, _e, 0.052, 0.11, u.blueLight, "steel", [0, 0, Math.PI / 2], true);
    re(L, [0.074, 0.27, 0.59], [0.22, 0.13, 0.16], u.dark, "steel", [-0.42, 0, 0]);
    for (let _e = 0; _e < 5; _e++) re(L, [-0.013 + 0.043 * _e, 0.211, 0.67], [0.025, 0.024, 0.085], u.trim, "steel", [-0.18, 0, 0]);
  }
  function Et(w, I, H, L, q, { color: J = u.pale, y: Se = null, bands: _e = 3, ladder: Re = true, storage: We = false } = {}) {
    let Ze = Se ?? v(I, H, L * 2.4, L * 2.4, 0.048, w === g.storage ? g.storage : g.terrain), nt = Ze + q;
    F(w, [I, Ze + q / 2, H], L, q, J, "painted"), ve(w, [I, nt, H], [L, L * 0.22, L], u.trim, "steel"), F(w, [I, Ze + 0.028, H], L * 1.05, 0.046, u.dark, "steel");
    for (let T = 1; T <= _e; T++) F(w, [I, Ze + q * T / (_e + 1), H], L * 1.014, 0.01, u.blueLight, "steel");
    if (F(w, [I + L * 0.24, nt + 0.04, H], L * 0.19, 0.067, u.dark, "steel"), Re && Te(w, I, Ze + 0.02, H + L + 0.016, q + 0.05), Ie(w, [[I + L, Ze + 0.13, H], [I + L + 0.13, Ze + 0.13, H], [I + L + 0.13, 0.2, H + 0.16]], 0.024, u.blueLight), We) {
      let T = Ye(w, "storage-level-gauge");
      T.position.set(I + L * 0.72, Ze + 0.02, H + L * 0.72), re(T, [0, q * 0.44, 0], [0.018, q * 0.88, 0.014], u.yellow, "painted", null, false), V.push({ kind: "scale", object: T }), re(w, [I + L * 0.72, Ze + q * 0.46, H + L * 0.72 + 2e-3], [0.035, q * 0.92, 0.015], u.dark, "steel", null, false), T.position.z += 0.012;
    }
    return ee([I, Ze + q / 2, H], L, q, J), { x: I, z: H, base: Ze, top: nt, r: L };
  }
  function xt(w, I, H = 1.45, L = 0.145) {
    let q = v(w, I, 0.48, 0.5), J = g.equipment;
    F(J, [w, q + 0.11, I], L * 1.02, 0.22, u.dark, "steel"), F(J, [w, q + H / 2 + 0.1, I], L, H - 0.18, u.trim, "painted"), ve(J, [w, q + H, I], [L, 0.115, L], u.trim);
    for (let Se = 0.26; Se < H; Se += 0.135) F(J, [w, q + Se, I], L * 1.02, 7e-3, u.blueLight, "steel");
    for (let Se of [0.54, 1.03]) if (Se < H - 0.1) {
      ce(J, w, q + Se, I, L * 3.5, L * 3.4, false, "front");
      for (let _e of [-L * 1.4, L * 1.4]) ae(J, [w + _e, q + Se - 0.02, I], [w + _e * 0.55, q + Se - 0.22, I], 9e-3, u.dark);
    }
    Te(J, w, q, I + L * 1.9, H + 0.1);
    for (let Se = 0.21; Se < H + 0.05; Se += 0.2) $e(J, [w, q + Se, I + L * 1.9 + 0.045], 0.083, 4e-3, u.blueLight, [Math.PI / 2, 0, 0]);
    return Ie(J, [[w, q + H + 0.075, I], [w, q + H + 0.18, I], [w + 0.24, q + H + 0.18, I], [w + 0.24, 0.67, I], [w + 0.35, 0.67, I + 0.44]], 0.026, u.blueLight), Ve(J, w + 0.24, 0.87, I), ee([w, q + H / 2, I], L, H, u.trim), { x: w, z: I, base: q, top: q + H };
  }
  function ft(w, I, H, L = 0.6, q = 0.115, J = 0.32) {
    v(I, H, q * 3.2, L + 0.18), F(w, [I, J, H], q, L, u.trim, "steel", [Math.PI / 2, 0, 0]);
    for (let Se of [-1, 1]) {
      ve(w, [I, J, H + Se * L / 2], [q, q, q * 0.35], u.blueLight), F(w, [I, J, H + Se * (L / 2 - 0.028)], q * 1.1, 0.023, u.dark, "steel", [Math.PI / 2, 0, 0]), re(w, [I, 0.135, H + Se * L * 0.3], [q * 1.68, 0.175, 0.072], u.blue);
      for (let _e = 0; _e < 8; _e++) {
        let Re = _e * Math.PI / 4;
        F(w, [I + Math.cos(Re) * q * 0.82, J + Math.sin(Re) * q * 0.82, H + Se * (L / 2 + 0.049)], 9e-3, 9e-3, u.dark, "steel", [Math.PI / 2, 0, 0], true);
      }
    }
    for (let Se of [-L * 0.24, L * 0.24]) Ie(w, [[I, J + q, H + Se], [I, J + q + 0.13, H + Se], [I + 0.21, J + q + 0.13, H + Se]], 0.025, u.blueLight);
    ee([I, J, H], q, L, u.trim, [Math.PI / 2, 0, 0]);
  }
  function Ot(w, I) {
    let H = v(w, I, 0.86, 0.62);
    re(g.structures, [w, H + 0.18, I], [0.75, 0.36, 0.5], u.blue), re(g.structures, [w, H + 0.38, I], [0.81, 0.047, 0.57], u.pale), re(g.structures, [w + 0.13, H + 0.238, I + 0.256], [0.38, 0.125, 0.014], u.glass, "glass"), re(g.structures, [w - 0.225, H + 0.147, I + 0.256], [0.115, 0.286, 0.015], u.trim), re(g.structures, [w - 0.374, H + 0.238, I], [0.014, 0.12, 0.34], u.glass, "glass"), re(g.structures, [w + 0.24, H + 0.429, I - 0.09], [0.18, 0.06, 0.19], u.blueLight);
    for (let L = 0; L < 5; L++) re(g.structures, [w + 0.16 + L * 0.04, H + 0.464, I - 0.09], [6e-3, 6e-3, 0.15], u.dark, "steel", null, false);
    ae(g.structures, [w - 0.31, H + 0.41, I - 0.19], [w - 0.31, H + 0.75, I - 0.19], 6e-3, u.blueLight), ae(g.structures, [w - 0.39, H + 0.7, I - 0.19], [w - 0.23, H + 0.7, I - 0.19], 5e-3, u.blueLight), k([w, H + 0.19, I], [0.8, 0.4, 0.56], u.blue);
  }
  function Zt(w, I, H = 0.88) {
    let L = X(w, I);
    re(g.terrain, [w, L + 0.021, I], [0.085, 0.042, 0.085], u.concrete, "concrete"), F(g.structures, [w, L + H / 2, I], 0.012, H, u.blueLight, "steel", null, true), ae(g.structures, [w - 0.085, L + H, I], [w + 0.085, L + H, I], 0.011, u.dark);
    for (let q of [-1, 1]) re(g.structures, [w + q * 0.07, L + H - 0.015, I + 0.015], [0.085, 0.042, 0.038], u.pale, "lamp", [-0.35, 0, 0]);
  }
  function Kt(w, I, H = 0.3) {
    let L = Math.hypot(I[0] - w[0], I[1] - w[1]), q = Math.ceil(L / H);
    for (let J = 0; J <= q; J++) {
      let Se = h(w[0], I[0], J / q), _e = h(w[1], I[1], J / q), Re = X(Se, _e);
      ae(g.structures, [Se, Re + 0.01, _e], [Se, Re + 0.18, _e], 45e-4, u.blueLight);
    }
    for (let J of [0.07, 0.15, 0.18]) ae(g.structures, [w[0], X(...w) + J, w[1]], [I[0], X(...I) + J, I[1]], 28e-4, u.blueLight);
  }
  let Qt = [2.8, 0, 2.22], cn = [2.6, 0.5, -0.75], vn = [4.21, 0, 2.22], gn = [];
  if (e === "metal") {
    Ee([[0.28, 2.3], [4.13, 2.3]], 0.42), Ee([[3.81, 2.3], [3.81, -1.85]], 0.4);
    let w = [], I = [], H = [];
    for (let nt = 0; nt < Ht.length; nt++) {
      let T = Ht[Math.max(0, nt - 1)], N = Ht[Math.min(Ht.length - 1, nt + 1)], te = p(N).sub(p(T)), oe = new i42.Vector3(-te.z, 0, te.x).normalize();
      for (let Ne of [-1, 1]) {
        let Ue = Ht[nt][0] + oe.x * 0.143 * Ne, x = Ht[nt][2] + oe.z * 0.143 * Ne;
        w.push(Ue, X(Ue, x) + 5e-3, x);
        let D = new i42.Color(7168854).multiplyScalar(nt % 7 ? 1 : 0.96);
        I.push(D.r, D.g, D.b);
      }
      if (nt < Ht.length - 1) {
        let Ne = nt * 2;
        H.push(Ne, Ne + 1, Ne + 2, Ne + 1, Ne + 3, Ne + 2);
      }
    }
    let L = M(new i42.BufferGeometry());
    L.setAttribute("position", new i42.Float32BufferAttribute(w, 3)), L.setAttribute("color", new i42.Float32BufferAttribute(I, 3)), L.setIndex(H), L.computeVertexNormals(), L.computeBoundingBox(), L.computeBoundingSphere();
    let q = new i42.Mesh(L, Y.soil);
    q.name = "continuous-spiral-mine-road", q.receiveShadow = true, g.terrain.add(q);
    for (let nt = 2; nt < Ht.length - 6; nt += 5) {
      let T = Ht[nt], N = Ht[nt + 1], te = N[0] - T[0], oe = N[2] - T[2], Ne = Math.hypot(te, oe), Ue = T[0] - oe / Ne * 0.155, x = T[2] + te / Ne * 0.155;
      re(g.structures, [Ue, X(Ue, x) + 0.031, x], [0.043, 0.061, 0.043], nt % 3 ? u.pale : u.yellow, "painted");
    }
    for (let nt = 0; nt < 44; nt++) {
      let T = c() * Math.PI * 2, N = 0.96 + c() * 0.14, te = se.x + Math.cos(T) * se.rx * N, oe = se.z + Math.sin(T) * se.rz * N;
      if (Math.abs(te) > ut / 2 - 0.1 || Math.abs(oe) > lt / 2 - 0.2) continue;
      let Ne = 0.025 + c() * 0.055;
      ze(g.terrain, ot, u.cut, "soil", [te, X(te, oe) + Ne * 0.3, oe], [Ne * 1.4, Ne * 0.7, Ne], [c(), c(), c()]);
    }
    je(-1.98, 0.15, 1.93), g.vehicles.children.at(-1).scale.setScalar(0.78);
    let J = v(0.03, -1.33, 0.75, 0.74);
    re(g.equipment, [0.03, J + 0.22, -1.33], [0.45, 0.41, 0.48], u.blue);
    for (let nt = 0; nt < 6; nt++) re(g.equipment, [0.03, J + 0.19 + nt * 0.028, -1.07], [0.38, 9e-3, 9e-3], u.dark, "steel", null, false);
    kt(0.03, 0.55, -1.33, 0.65, 0.52), F(g.equipment, [0.36, 0.29, -1.33], 0.12, 0.15, u.blueLight, "steel", [0, 0, Math.PI / 2]), ce(g.structures, 0.03, 0.48, -1.33, 0.99, 0.76, true, "front"), me(g.structures, [0.42, 0.055, -0.48], [0.42, 0.48, -0.95], 0.22), k([0.03, 0.47, -1.33], [0.73, 0.82, 0.57], u.blue), bt([0.26, 0.27, -1.16], [1.28, 0.64, -0.66]);
    let Se = v(1.35, -0.65, 0.84, 0.62);
    re(g.equipment, [1.35, 0.62, -0.65], [0.67, 0.27, 0.4], u.blue, "painted", [0, 0, -0.14]);
    for (let nt = 0; nt < 8; nt++) re(g.equipment, [1.07 + nt * 0.08, 0.79 - nt * 0.011, -0.65], [0.025, 0.014, 0.37], u.blueLight, "steel", [0, 0, -0.14], false);
    for (let nt of [1.08, 1.62]) for (let T of [-0.82, -0.48]) ae(g.equipment, [nt, 0.055, T], [nt, 0.55, T], 0.022, u.dark, "steel", true), F(g.equipment, [nt, 0.48, T], 0.044, 0.095, u.yellow, "painted", null, true);
    ce(g.structures, 1.34, 0.45, -0.65, 1, 0.67, false, "front"), bt([1.57, 0.49, -0.39], [2.42, 0.91, 0.59]), kt(2.42, 0.67, 0.6, 0.41, 0.4), Rt(g.equipment, [2.3, 0.05, 0.71], [0.57, 0.37, 0.48], u.ore, 28);
    let _e = qe(g.storage, { x: 2.58, z: -1.16, w: 1.75, d: 1.31, h: 0.68, roof: 0.16, open: true, name: "segregated-product-bins" });
    for (let nt of [-0.51, 0.04, 0.57]) Rt(g.storage, [2.58 + nt, _e.y + 0.014, -1.17], [0.25, 0.38, 0.5], u.ore, 16, true), nt !== 0.57 && re(g.storage, [2.58 + nt + 0.265, _e.y + 0.21, -1.16], [0.045, 0.42, 1.16], u.concrete, "concrete");
    bt([2.58, 0.45, 0.22], [2.58, 0.92, -0.61], { width: 0.19, covered: false }), ce(g.storage, 3.16, 0.65, 1.6, 0.72, 0.48, true, "front"), re(g.storage, [3.16, 0.84, 1.61], [0.45, 0.34, 0.35], u.blue), F(g.storage, [3.16, 0.56, 1.62], 0.07, 0.39, u.dark, "steel"), Ie(g.storage, [[3.15, 0.7, 1.58], [3.15, 0.84, 1], [2.47, 0.84, 0.64]], 0.039, u.blueLight), Ot(0.64, 1.51), Zt(1.33, 1.54, 1.04), Zt(3.48, -0.25, 1.02);
    let Re = pe(g.vehicles, 0, 0, 0.82), We = [...Ht].reverse().map((nt) => [...nt]);
    We.push([-0.41, 0, -1.49], [-0.31, 0, -1.34]), gt(Re, We, 0.19, 1.6);
    let Ze = pe(g.vehicles, 1.1, 2.3, 0.86, u.blueLight, "product-loading-truck");
    gt(Ze, [[0.96, 0, 2.3], [3.17, 0, 2.3]], 0.16, 1.7), Kt([0.1, -2.36], [3.59, -2.36]), Kt([4.05, -2.25], [4.05, 1.7]), gn.push("Four excavated benches and a continuous 1.675-turn haul ramp", "Crawler excavator with boom, bucket and hydraulic cylinders", "Primary jaw crusher, feed hopper and inspection deck", "Vibrating screen on isolated support frame", "Three trussed belt conveyors with moving ore", "Transfer hopper and raw stockpile", "Three separate finished-ore bins under an open-sided corrugated roof", "Product loading gantry, control room and two haul trucks");
  } else if (e === "crystal") {
    Ee([[-2.85, 1.73], [2.88, 1.73]], 0.4), Ee([[-2.73, 1.65], [-2.73, -0.46]], 0.32);
    for (let Re = 0; Re < 19; Re++) {
      let We = -2.45 + c() * 1.15, Ze = -1.57 + c() * 0.7, nt = 0.09 + c() * 0.32, T = 0.13 + c() * 0.2;
      if (ze(g.terrain, ot, new i42.Color(u.cut).multiplyScalar(0.84 + c() * 0.3), "soil", [We, X(We, Ze) + nt * 0.25, Ze], [T * 1.5, nt, T], [0.1, c() * 6, 0.1]), Re % 3 === 0) for (let N = 0; N < 3; N++) ze(g.terrain, ot, u.crystal, "steel", [We + (N - 1) * 0.035, X(We, Ze) + nt * 0.57, Ze + 0.09], [0.031, 0.06 + c() * 0.04, 0.025], [c() * 0.5, c() * 6, 0.3]);
    }
    let w = v(-2.03, -0.31, 0.64, 0.63);
    re(g.equipment, [-2.03, 0.25, -0.31], [0.4, 0.4, 0.42], u.blue), kt(-2.03, 0.42, -0.31, 0.56, 0.47), Rt(g.equipment, [-2.05, 0.04, 0.49], [0.34, 0.21, 0.32], 7832963, 18), bt([-2.05, 0.4, -1.05], [-2.03, 0.25, -0.53], { width: 0.2, color: u.crystal }), bt([-1.8, 0.33, -0.21], [-1.11, 0.54, -0.13], { covered: true, width: 0.22, color: u.crystal }), qe(g.structures, { x: -0.89, z: -0.2, w: 1.43, d: 1.47, h: 0.67, roof: 0.17, color: u.blue, name: "enclosed-optical-sorting-hall" }), re(g.equipment, [-0.88, 0.38, 0.62], [1.1, 0.28, 0.22], u.dark);
    for (let Re = 0; Re < 4; Re++) re(g.equipment, [-1.28 + Re * 0.267, 0.41, 0.738], [0.2, 0.13, 0.011], u.glass, "glass"), F(g.equipment, [-1.28 + Re * 0.267, 0.34, 0.6], 0.074, 0.23, u.blueLight, "steel", [Math.PI / 2, 0, 0]);
    ce(g.structures, -0.88, 0.23, 0.85, 1.31, 0.31, true, "front"), me(g.structures, [-1.29, 0.055, 1.25], [-1.29, 0.23, 1], 0.18), bt([-0.29, 0.41, -0.38], [0.38, 0.6, -0.4], { covered: true, width: 0.18 });
    for (let Re of [-0.32, 0.1]) {
      let We = v(Re, -1.2, 0.33, 0.44);
      F(g.equipment, [Re, 0.77, -1.2], 0.13, 0.38, u.trim, "painted"), ze(g.equipment, _t, u.blueLight, "steel", [Re, 0.47, -1.2], [0.13, 0.26, 0.13]), F(g.equipment, [Re, 0.306, -1.2], 0.035, 0.11, u.dark);
      for (let Ze of [-0.12, 0.12]) ae(g.equipment, [Re + Ze, 0.055, -1.2], [Re + Ze, 0.65, -1.2], 0.012, u.dark, "steel", true);
      Ie(g.equipment, [[Re, 0.985, -1.2], [Re, 1.04, -1.2], [Re - 0.34, 1.04, -0.96], [Re - 0.34, 0.79, -0.7]], 0.05, u.blueLight), ee([Re, 0.65, -1.2], 0.14, 0.7, u.trim);
    }
    qe(g.structures, { x: 0.89, z: -0.41, w: 1.1, d: 1.18, h: 0.67, roof: 0.1, color: u.blueLight, name: "refining-and-purification-hall" }), Et(g.equipment, 1.67, -1.17, 0.19, 0.91, { color: u.pale, bands: 4 }), Et(g.equipment, 2.16, -1.17, 0.19, 0.8, { color: u.pale, bands: 3 }), ce(g.equipment, 1.91, 0.62, -0.77, 0.91, 0.3, true, "front"), me(g.equipment, [2.27, 0.055, -0.14], [2.27, 0.62, -0.64], 0.19), ft(g.equipment, 1.83, -0.15, 0.49, 0.11, 0.32), Ie(g.equipment, [[1.38, 0.49, -0.43], [1.59, 0.49, -0.43], [1.59, 0.55, -1.15], [1.66, 0.55, -1.15]], 0.032, u.blueLight), Ie(g.equipment, [[1.83, 0.49, -0.15], [2.15, 0.49, -0.15], [2.15, 0.51, -1.17]], 0.026, u.blueLight), Ie(g.equipment, [[2.34, 0.23, -1.17], [2.52, 0.23, -1.17], [2.52, 0.44, 0.66], [2.16, 0.44, 0.66]], 0.029, u.blueLight), Ve(g.equipment, 2.52, 0.36, -0.37);
    let I = qe(g.storage, { x: 1.42, z: 0.83, w: 1.96, d: 0.73, h: 0.56, roof: 0.1, color: u.blue, doors: 3, name: "sealed-finished-mineral-warehouse" });
    for (let Re of [0.78, 1.42, 2.06]) re(g.storage, [Re, 0.04, 1.34], [0.52, 0.032, 0.17], u.concrete, "concrete");
    let H = Ye(g.storage, "sealed-mineral-container-inventory"), L = ue(he.clone()), q = new i42.InstancedMesh(L, Y.painted, 12);
    q.name = "sealed-mineral-crates";
    let J = new i42.Matrix4(), Se = new i42.Color(u.pale);
    for (let Re = 0; Re < 12; Re++) {
      let We = Math.floor(Re / 3), Ze = Re % 3;
      J.compose(new i42.Vector3(2.62, 0.112 + We * 0.112, 0.57 + Ze * 0.23), le, new i42.Vector3(0.23, 0.098, 0.19)), q.setMatrixAt(Re, J), q.setColorAt(Re, Se.clone().multiplyScalar(0.88 + 0.12 * (Re % 3) / 2));
    }
    q.instanceMatrix.needsUpdate = true, q.computeBoundingBox(), q.computeBoundingSphere(), q.castShadow = true, H.add(q), V.push({ kind: "count", object: q, maximum: 12 }), re(g.storage, [2.62, 0.042, 0.79], [0.32, 0.045, 0.81], u.dark, "steel"), Ot(-1.95, 1.12), Zt(-0.35, 1.36, 1.03), Zt(2.69, -0.55, 0.92);
    let _e = pe(g.vehicles, -1.3, 1.73, 0.77, u.blueLight, "finished-mineral-carrier", "crates");
    gt(_e, [[-0.65, 0, 1.73], [2.02, 0, 1.73]], 0.15, 1.5), Kt([-2.86, -1.86], [2.86, -1.86]), Kt([2.87, -1.79], [2.87, 1.22]), Qt = [1.44, 0.055, 1.36], cn = [1.42, 0.38, 0.83], vn = [2.98, 0, 1.73], gn.push("Layered geological working face with small mineral veins", "Feed crusher and mineral hopper", "Enclosed sorting hall with four separator modules", "Twin cyclones, dust collection pipes and sealed transfer conveyors", "Refining and purification hall", "Two process vessels and shell-and-tube heat exchanger", "Sealed warehouse, three loading doors and stackable mineral containers", "Control room and animated product carrier");
  } else {
    if (r) {
      re(g.terrain, [0, -0.105, 0], [6.35, 0.21, 4.32], u.dark, "steel"), re(g.terrain, [0, -8e-3, 0], [6.23, 0.024, 4.21], 8292233, "painted");
      for (let L = -2.85; L <= 2.85; L += 0.57) for (let q = -1.92; q <= 1.92; q += 0.64) {
        let J = new i42.Color(Math.round(L * 10 + q * 10) % 3 ? 7898249 : 8753300).multiplyScalar(0.94 + c() * 0.1);
        re(g.terrain, [L, 6e-3, q], [0.552, 5e-3, 0.625], J, "painted", null, false);
      }
      for (let L of [-1, 1]) {
        let q = L * 2.92;
        re(g.structures, [q, -0.41, 0], [0.33, 0.19, 4.24], u.blue);
        for (let J = -1.8; J < 1.95; J += 0.45) ae(g.structures, [q, -0.12, J], [q, -0.5, J + 0.41], 0.035, u.blueLight, "steel", true), ae(g.structures, [q, -0.5, J], [q, -0.12, J + 0.41], 0.024, u.dark, "steel", true);
        re(g.structures, [L * 3.14, -0.38, 0], [0.24, 0.36, 3.13], u.blue);
        for (let J of [-1.42, 1.42]) {
          F(g.equipment, [L * 2.67, -0.44, J], 0.31, 0.34, u.blue, "painted"), F(g.equipment, [L * 2.67, -0.64, J], 0.235, 0.1, u.dark, "steel"), $e(g.equipment, [L * 2.67, -0.69, J], 0.24, 0.021, u.blueLight);
          let Se = Ye(g.effects, "stabilizer-rotor");
          Se.position.set(L * 2.67, -0.694, J);
          for (let _e = 0; _e < 6; _e++) re(Se, [Math.cos(_e * Math.PI / 3) * 0.105, 0, Math.sin(_e * Math.PI / 3) * 0.105], [0.21, 0.021, 0.042], u.blueLight, "steel", [0, -_e * Math.PI / 3, 0.1]);
          F(Se, [0, 0, 0], 0.055, 0.044, u.dark, "steel", null, true), A.push((_e) => {
            Se.rotation.y = _e * 1.65 * L;
          });
        }
        De(g.structures, [[L * 3.11, 0.016, -2.1], [L * 3.11, 0.016, 2.1]], 0.16, u.yellow, 0.3);
      }
      for (let L of [-2.1, 2.1]) De(g.structures, [[-3.1, 0.016, L], [3.1, 0.016, L]], 0.16, u.yellow, 0.3);
      for (let L = -2.25; L <= 2.3; L += 0.75) ae(g.structures, [L, -0.3, -2.05], [L, -0.3, 2.05], 0.06, u.blueLight, "steel", true);
      for (let L = 0; L < 3; L++) {
        let q = -2.43 + L * 0.32;
        Ie(g.equipment, [[q, 0.13, -0.66], [q, -0.38, -0.66], [q + 0.12, -0.61, -0.66], [q + 0.12, -1.66 - L * 0.16, -0.66]], 0.065 - L * 8e-3, u.blueLight), F(g.equipment, [q + 0.12, -1.78 - L * 0.16, -0.66], 0.11, 0.29, u.dark, "steel");
        for (let J = 0; J < 4; J++) F(g.equipment, [q + 0.12, -1.66 - L * 0.16 - J * 0.061, -0.66], 0.115, 0.014, u.blue, "painted", null, true);
      }
      k([0, -0.15, 0], [6.38, 0.31, 4.3], u.dark);
      for (let L of [-1, 1]) k([L * 3.1, -0.35, 0], [0.35, 0.38, 3.15], u.blue);
      for (let L = 0; L < 3; L++) ee([-2.31 + L * 0.32, -1.02 - L * 0.08, -0.66], 0.075, 1.75 + L * 0.15, u.blueLight);
    }
    Ee([[-2.77, 1.69], [2.82, 1.69]], 0.39);
    for (let L = 0; L < 2; L++) for (let q = 0; q < 3; q++) {
      let J = -2.62 + q * 0.42, Se = -1.36 + L * 0.76, _e = v(J, Se, 0.3, 0.31);
      F(g.equipment, [J, _e + 0.033, Se], 0.102, 0.058, u.dark, "steel"), F(g.equipment, [J, 0.2, Se], 0.046, 0.26, u.blue, "painted");
      for (let Re of [0.11, 0.22, 0.31]) F(g.equipment, [J, Re, Se], 0.06, 0.022, u.blueLight, "steel");
      Ve(g.equipment, J, 0.2, Se), Ve(g.equipment, J, 0.31, Se), Ie(g.equipment, [[J, 0.2, Se], [J + 0.11, 0.2, Se], [J + 0.11, 0.155, Se + 0.22], [-1.24, 0.155, Se + 0.22]], 0.022, u.blueLight), re(g.equipment, [J - 0.13, 0.105, Se + 0.13], [0.05, 0.09, 0.04], u.yellow, "painted");
    }
    Ie(g.equipment, [[-1.24, 0.155, -1.15], [-1.24, 0.155, 0.34], [-1.03, 0.155, 0.34], [-1.03, 0.3, 0.65]], 0.045, u.blueLight);
    for (let L of [-0.98, -0.51, -0.12]) Ve(g.equipment, -1.24, 0.155, L), re(g.terrain, [-1.24, 0.066, L], [0.14, 0.13, 0.13], u.concrete, "concrete");
    qe(g.structures, { x: -1.3, z: 0.61, w: 1.27, d: 0.72, h: 0.45, roof: 0.055, color: u.blue, doors: 2, name: "compressor-hall" });
    for (let L of [-0.7, -0.25]) {
      v(L, 0.57, 0.37, 0.71), re(g.equipment, [L, 0.13, 0.57], [0.31, 0.12, 0.59], u.dark, "steel"), F(g.equipment, [L, 0.257, 0.54], 0.102, 0.35, u.blue, "painted", [Math.PI / 2, 0, 0]);
      for (let J = 0; J < 6; J++) F(g.equipment, [L, 0.257, 0.41 + J * 0.05], 0.106, 9e-3, u.blueLight, "steel", [Math.PI / 2, 0, 0]);
      F(g.equipment, [L, 0.252, 0.77], 0.11, 0.1, u.blueLight, "steel", [Math.PI / 2, 0, 0]);
      let q = Ye(g.effects, "compressor-coupling");
      q.position.set(L, 0.252, 0.827);
      for (let J = 0; J < 4; J++) re(q, [Math.cos(J * Math.PI / 2) * 0.04, Math.sin(J * Math.PI / 2) * 0.04, 0], [0.067, 0.014, 0.013], u.dark, "steel", [0, 0, J * Math.PI / 2]);
      A.push((J) => {
        q.rotation.z = J * 4.2;
      }), Ie(g.equipment, [[L, 0.255, 0.82], [L, 0.255, 1.02], [L + 0.19, 0.255, 1.02], [L + 0.19, 0.63, 0.06]], 0.027, u.blueLight);
    }
    ft(g.equipment, -0.63, -1.2, 0.78, 0.137, 0.34);
    let w = xt(0.02, -1.13, 1.55, 0.151), I = xt(0.64, -1.12, 1.31, 0.135);
    ce(g.structures, 0.35, 0.52, -0.51, 1.2, 0.34, true, "front"), me(g.structures, [0.86, 0.055, 0.06], [0.86, 0.52, -0.35], 0.22), ft(g.equipment, 0.37, 0.43, 0.63, 0.12, 0.32), ft(g.equipment, 0.81, 0.5, 0.56, 0.105, 0.31);
    for (let L = -1.18; L <= 2.71; L += 0.6) {
      for (let q of [-0.235, 0.045]) ae(g.structures, [L, 0.048, q], [L, 0.665, q], 0.022, u.dark, "steel", true);
      ae(g.structures, [L, 0.66, -0.3], [L, 0.66, 0.11], 0.025, u.blueLight, "steel", true), re(g.terrain, [L, 0.029, -0.095], [0.135, 0.058, 0.48], u.concrete, "concrete");
    }
    for (let [L, q] of [[0, 0.034], [1, 0.023], [2, 0.027]]) {
      let J = -0.22 + L * 0.112;
      Ie(g.equipment, [[-1.16, 0.7 + L * 0.018, J], [2.56, 0.7 + L * 0.018, J]], q, L === 1 ? u.blue : u.blueLight);
      for (let Se of [-0.84, 0.98, 2.12]) Ve(g.equipment, Se, 0.7 + L * 0.018, J);
    }
    Ie(g.equipment, [[-0.63, 0.34, -0.79], [-0.63, 0.48, -0.6], [0.02, 0.48, -0.6], [0.02, 0.48, -0.98]], 0.036, u.blueLight), Ie(g.equipment, [[0.17, 0.29, -1.14], [0.3, 0.29, -1.14], [0.3, 0.32, 0.1], [0.37, 0.32, 0.12]], 0.029, u.blueLight), Ie(g.equipment, [[0.64, 0.34, -0.99], [0.79, 0.34, -0.99], [0.79, 0.45, -0.22]], 0.028, u.blueLight), Ie(g.equipment, [[0.81, 0.44, 0.5], [1.09, 0.44, 0.5], [1.09, 0.73, -0.106]], 0.027, u.blueLight);
    for (let L of [1.56, 2.29]) {
      let _e = v(L, -1.03, 0.64, 1.56, 0.048, g.storage), Re = 0.4;
      F(g.storage, [L, Re, -1.03], 0.253, 1.1, u.pale, "painted", [Math.PI / 2, 0, 0]);
      for (let Ze of [-1, 1]) ve(g.storage, [L, Re, -1.03 + Ze * 1.1 / 2], [0.253, 0.253, 0.253 * 0.65], u.pale, "painted"), re(g.storage, [L, 0.137, -1.03 + Ze * 1.1 * 0.29], [0.43, 0.16, 0.12], u.blue), F(g.storage, [L, Re, -1.03 + Ze * 1.1 * 0.34], 0.253 * 1.02, 0.026, u.blueLight, "steel", [Math.PI / 2, 0, 0]);
      Ie(g.storage, [[L, Re + 0.253, -1.03], [L, 0.79, -1.03], [L, 0.79, -0.08], [L, 0.718, -0.08]], 0.029, u.blueLight), Ve(g.storage, L, 0.79, -0.74), Te(g.storage, L + 0.253 + 0.04, 0.1, -1.03 + 0.4, 0.63, Math.PI / 2);
      let We = Ye(g.storage, "bullet-vessel-level");
      We.position.set(L + 0.253 + 0.02, 0.21, -1.03 + 0.1), re(We, [0, 0.19, 0], [0.018, 0.38, 0.026], u.yellow, "painted", null, false), V.push({ kind: "scale", object: We }), ee([L, Re, -1.03], 0.253, 1.1 + 0.24, u.pale, [Math.PI / 2, 0, 0]);
    }
    Et(g.storage, 2.35, 0.59, 0.333, 0.88, { color: u.pale, bands: 2, storage: true }), F(g.storage, [2.35, 1.01, 0.59], 0.052, 0.1, u.blue, "painted"), ce(g.storage, 1.53, 0.21, 0.7, 0.62, 0.66, true, "front"), re(g.storage, [1.53, 0.38, 0.7], [0.25, 0.34, 0.25], u.blue), Ie(g.storage, [[2.05, 0.23, 0.58], [1.82, 0.23, 0.58], [1.82, 0.52, 0.68], [1.53, 0.52, 0.68], [1.53, 0.56, 1.15], [1.35, 0.56, 1.22]], 0.032, u.blueLight), Ve(g.storage, 1.82, 0.36, 0.58);
    for (let L of [1.08, 1.82]) ae(g.storage, [L, 0.044, 1.22], [L, 0.79, 1.22], 0.024, u.dark, "steel", true);
    re(g.storage, [1.45, 0.8, 1.25], [0.89, 0.038, 0.58], u.blue), Ot(-2.23, 1.1), Zt(-1.43, 1.18, 1.05), Zt(2.81, 1.11, 1.11);
    let H = pe(g.vehicles, 0, 1.69, 0.76, u.blueLight, "gas-product-transport", "tank");
    gt(H, [[-0.43, 0, 1.69], [1.44, 0, 1.69]], 0.14, 1.9), r || (Kt([-2.86, -1.91], [2.88, -1.91]), Kt([2.91, -1.84], [2.91, 1.27])), Qt = [1.45, 0.052, 1.44], cn = [2.13, 0.55, -0.54], vn = [2.98, 0, 1.69], gn.push("Six well heads with Christmas-tree valves and collection header", "Compressor hall and two exposed compressor skids", "Inlet separator and two distillation columns with access platforms", "Three shell-and-tube exchangers and connected process pipework", "Three-line elevated pipe rack and isolation valves", "Two horizontal pressure-storage vessels and a vertical cryogenic tank", "Loading canopy, product pump station, control room and service truck"), r && gn.push("Segmented welded working deck, deep longitudinal trusses and stability hulls", "Four guarded stabilization rotors and three descending collection risers");
  }
  let mn = new i42.InstancedMesh(ue(new i42.CylinderGeometry(7e-3, 7e-3, 0.01, 6)), Y.steel, Q.length * 4);
  mn.name = "instanced-foundation-fasteners";
  let En = new i42.Matrix4();
  for (let w = 0; w < mn.count; w++) {
    let I = Q[Math.floor(w / 4)], H = I.x + (w % 2 ? 1 : -1) * (I.w / 2 - 0.024), L = I.z + (w % 4 < 2 ? 1 : -1) * (I.d / 2 - 0.024);
    En.makeTranslation(H, I.y, L), mn.setMatrixAt(w, En), mn.setColorAt(w, new i42.Color(u.dark));
  }
  mn.instanceMatrix.needsUpdate = true, mn.computeBoundingBox(), mn.computeBoundingSphere(), g.equipment.add(mn);
  let $t = Ye(g.effects, "construction-survey");
  for (let w of [-ut * 0.4, ut * 0.4]) for (let I of [-lt * 0.39, lt * 0.39]) ae($t, [w, X(w, I), I], [w, X(w, I) + 0.28, I], 0.012, u.yellow, "painted"), re($t, [w, X(w, I) + 0.23, I], [0.09, 0.055, 0.012], u.yellow, "painted");
  vt(), _.updateMatrixWorld(true);
  let en = new i42.Box3().setFromObject(_);
  for (let w of ie) en.expandByPoint(new i42.Vector3(w[0] * o - 0.3 * o, w[1], w[2] * a - 0.3 * a)), en.expandByPoint(new i42.Vector3(w[0] * o + 0.3 * o, w[1] + 0.41, w[2] * a + 0.3 * a));
  let nn = { min: en.min.toArray(), max: en.max.toArray() }, on = [[en.min.x, en.min.z], [en.max.x, en.min.z], [en.max.x, en.max.z], [en.min.x, en.max.z]], xn = (w) => [w[0] * o, w[1], w[2] * a], C = Object.fromEntries(Object.entries(e === "metal" ? { whole: { eye: [7.2, 6.5, 8.5], target: [-0.3, 0.08, -0.04] }, close: { eye: [-4.1, 3.15, 3.35], target: [-1.8, -0.33, -0.25] }, process: { eye: [4.45, 2.8, 3.75], target: [1.65, 0.4, -0.55] }, storage: { eye: [4.55, 1.96, 1.75], target: [2.61, 0.38, -1.04] } } : e === "crystal" ? { whole: { eye: [5.45, 4.3, 6.7], target: [0, 0.25, -0.12] }, close: { eye: [3.5, 2.45, 3.6], target: [0.87, 0.39, -0.21] }, process: { eye: [-3.6, 2.8, 3], target: [-0.78, 0.37, -0.52] }, storage: { eye: [3.32, 1.76, 3.52], target: [1.48, 0.3, 0.83] } } : { whole: { eye: [5.5, r ? 3.55 : 4.45, 6.5], target: [0, r ? -0.24 : 0.34, -0.12] }, close: { eye: [3.33, 2.24, 3.1], target: [0.71, 0.63, -0.34] }, process: { eye: [-3.6, 2.5, 2.7], target: [-0.8, 0.44, -0.42] }, storage: { eye: [4.55, 1.98, 2.7], target: [2.1, 0.53, -0.51] }, underside: { eye: [5.2, -0.9, 5.4], target: [0, -0.48, -0.11] } }).map(([w, I]) => [w, { eye: xn(I.eye), target: xn(I.target) }])), $ = p(C.whole.target).sub(p(C.whole.eye)).normalize().toArray(), Oe = (w, I = [0, 1, 0]) => ({ position: xn(w), normal: I }), Ke = { ground: Oe([0, 0, 0]), view: { position: C.whole.eye, normal: $ }, loading: Oe(Qt, [0, 0, 1]), storage: Oe(cn, [0, 0, 1]), entry: Oe(vn, [1, 0, 0]) }, tt = false, it = 0, Ge = "near", Dt = true, Vt = { running: true, activity: 1, construction: 1, storageFill: 0.5 };
  function Tt() {
    let w = Ge !== "far";
    _.visible = Dt, g.terrain.visible = w, g.structures.visible = w && Vt.construction >= 0.2, g.equipment.visible = w && Vt.construction >= 0.48, g.storage.visible = w && Vt.construction >= 0.7, g.vehicles.visible = w && Vt.construction >= 0.95, g.effects.visible = w, $t.visible = Vt.construction < 0.95;
    for (let I of g.effects.children) I !== $t && (I.visible = Vt.construction >= 0.86);
    g.silhouette.visible = !w;
  }
  function Xt(w = {}) {
    if (!tt) {
      typeof w.running == "boolean" && (Vt.running = w.running);
      for (let I of ["activity", "construction", "storageFill"]) Number.isFinite(w[I]) && (Vt[I] = d(w[I]));
      for (let I of V) I.kind === "scale" ? I.object.scale.y = 0.035 + Vt.storageFill * 0.965 : (I.object.count = Math.round(Vt.storageFill * I.maximum), I.object.visible = I.object.count > 0);
      Y.lamp.emissiveIntensity = Vt.running ? 0.22 + Vt.activity * 0.43 : 0.035, Tt();
    }
  }
  function U(w, { visible: I = true, detail: H = "near", animate: L = true } = {}) {
    if (tt || (Ge = H === "far" ? "far" : "near", Dt = !!I, Tt(), !I || Ge === "far" || !L || !Vt.running || Vt.activity <= 0 || Vt.construction < 0.95)) return;
    let q = Math.min(0.1, Math.max(0, Number(w) || 0));
    it += q * Vt.activity;
    for (let J of A) J(it);
  }
  function be() {
    if (!tt) {
      tt = true, _.traverse((w) => {
        w.isInstancedMesh && w.dispose();
      });
      for (let w of m) w.dispose();
      for (let w of S) w.dispose();
      m.clear(), S.clear(), A.length = 0, V.length = 0, _.clear();
    }
  }
  Xt();
  let Le = { type: e, floating: r, seed: t | 0, inventory: gn, dimensions: en.getSize(new i42.Vector3()).toArray(), animationObjects: A.length, state: { ...Vt }, normalizedGroundOrigin: ct, fixedSeeds: [17, 42, 101], modelScale: "relative model units; root scale stays 1", materialStrategy: "vertex-colored merged geometry, shared primitive cache and instanced repeating items", limitations: ["Vehicles, material transfers and tank gauges are demonstration states, without production or fluid simulation.", "Ground input is normalized by ground.heightAt(0,0); processing pads are graded to local Y=0.", "Storage-only inspection exposes the independent storage group; connecting pipes end at the group interface.", "The far silhouette represents the completed complex; construction progress is detailed in near mode."] };
  return { root: _, groups: g, footprint: on, bounds: nn, anchors: Ke, heightAt: G, setVisualState: Xt, update: U, dispose: be, views: C, meta: Le };
}
function Bg(i42) {
  let { THREE: e, type: t, floating: n, groups: s, C: r, M: o, own: a, box: l, beam: c, cylinder: d, strip: f, road: h, rail: p, hall: u, pipe: _, tank: g, slab: m, farBox: S, H: M, rand: y, decks: Y, bridges: b, nominalWidth: O, nominalDepth: A, mainPit: V, mineRoad: ie, districts: Q, counts: ue } = i42, fe = s.perimeter, He = s.edgeTerrain, he = [], Ae = [], ke = {}, we = [], pt = [], ot = [], Ce = [], le = /* @__PURE__ */ new Map(), Be = new e.Matrix4(), ze = new e.Vector3(0, 1, 0), re = a(new e.BoxGeometry(1, 1, 1)), F = new Float32Array(re.attributes.position.count * 3);
  F.fill(1), re.setAttribute("color", new e.BufferAttribute(F, 3));
  function ve(de, X, G, Fe, P = "painted", v = 0) {
    let k = `${de.name}:${P}`;
    le.has(k) || le.set(k, { owner: de, key: P, items: [] }), le.get(k).items.push({ p: X, s: G, color: Fe, yaw: v });
  }
  function ae() {
    for (let de of le.values()) {
      let X = new e.InstancedMesh(re, o[de.key], de.items.length);
      X.name = `shared-site-${de.owner.name}-${de.key}`;
      for (let G = 0; G < de.items.length; G++) {
        let Fe = de.items[G];
        Be.compose(new e.Vector3(...Fe.p), new e.Quaternion().setFromAxisAngle(ze, Fe.yaw), new e.Vector3(...Fe.s)), X.setMatrixAt(G, Be), X.setColorAt(G, new e.Color(Fe.color));
      }
      X.computeBoundingBox(), X.computeBoundingSphere(), X.castShadow = true, X.receiveShadow = true, de.owner.add(X);
    }
  }
  function $e(de, X, G, Fe = "road", P = de) {
    let v = X.map((k) => k.length === 3 ? [...k] : [k[0], M(...k) + 0.04, k[1]]);
    return we.push({ key: de, name: P, kind: Fe, width: G, points: v }), v;
  }
  function rt(de, X, G, Fe = true) {
    h(X, G, Fe), Ce.push({ key: de, width: G, points: X.map((P) => [P[0], M(...P) + 0.022, P[1]]) });
  }
  function Qe(de, X, G) {
    let Fe = Math.max(1, Math.ceil(Math.hypot(X[0] - de[0], X[1] - de[1]) / 0.32));
    for (let P = 0; P < Fe; P++) {
      let v = P / Fe, k = (P + 1) / Fe, ee = [de[0] + (X[0] - de[0]) * v, de[1] + (X[1] - de[1]) * v], ye = [de[0] + (X[0] - de[0]) * k, de[1] + (X[1] - de[1]) * k];
      f(He, [ee[0], M(...ee) - 0.012, ee[1]], [ye[0], M(...ye) - 0.012, ye[1]], G, 9274481, "soil", 0.034);
    }
  }
  function _t(de, X, G, Fe, P = 1, v = r.pale) {
    let k = M(de, X) + 0.043, ee = 0.34 * P, ye = 0.11 * P;
    f(s.roads, [de - G * ee, k, X - Fe * ee], [de + G * ee * 0.55, k, X + Fe * ee * 0.55], 0.028 * P, v, "painted", 5e-3);
    for (let Ee of [-1, 1]) f(s.roads, [de + G * ee * 0.66, k, X + Fe * ee * 0.66], [de + G * ee * 0.13 - Fe * ye * Ee, k, X + Fe * ee * 0.13 + G * ye * Ee], 0.03 * P, v, "painted", 5e-3);
  }
  function vt(de, X, G = 0.02, Fe = r.pale, P = s.roads) {
    f(P, [de[0], M(...de) + 0.044, de[1]], [X[0], M(...X) + 0.044, X[1]], G, Fe, "painted", 4e-3);
  }
  let Ye = { M: [[[-0.4, -0.5], [-0.4, 0.5], [0, -0.05], [0.4, 0.5], [0.4, -0.5]]], E: [[[-0.4, -0.5], [-0.4, 0.5], [0.4, 0.5]], [[-0.4, 0], [0.3, 0]], [[-0.4, -0.5], [0.4, -0.5]]], T: [[[-0.4, 0.5], [0.4, 0.5]], [[0, 0.5], [0, -0.5]]], A: [[[-0.4, -0.5], [0, 0.5], [0.4, -0.5]], [[-0.24, -0.05], [0.24, -0.05]]], L: [[[-0.4, 0.5], [-0.4, -0.5], [0.4, -0.5]]], G: [[[0.4, 0.32], [0.2, 0.5], [-0.3, 0.5], [-0.4, 0.32], [-0.4, -0.32], [-0.2, -0.5], [0.4, -0.5], [0.4, 0], [0.1, 0]]], S: [[[0.4, 0.5], [-0.4, 0.5], [-0.4, 0], [0.4, 0], [0.4, -0.5], [-0.4, -0.5]]], C: [[[0.4, 0.5], [-0.4, 0.5], [-0.4, -0.5], [0.4, -0.5]]], R: [[[-0.4, -0.5], [-0.4, 0.5], [0.35, 0.5], [0.4, 0.05], [-0.4, 0.05]], [[0, 0.05], [0.4, -0.5]]], Y: [[[-0.4, 0.5], [0, 0.05], [0.4, 0.5]], [[0, 0.05], [0, -0.5]]], O: [[[-0.4, -0.5], [-0.4, 0.5], [0.4, 0.5], [0.4, -0.5], [-0.4, -0.5]]], D: [[[-0.4, -0.5], [-0.4, 0.5], [0.2, 0.5], [0.4, 0.2], [0.4, -0.2], [0.2, -0.5], [-0.4, -0.5]]], K: [[[-0.4, -0.5], [-0.4, 0.5]], [[0.4, 0.5], [-0.4, -0.03], [0.4, -0.5]]], P: [[[-0.4, -0.5], [-0.4, 0.5], [0.4, 0.5], [0.4, 0], [-0.4, 0]]], I: [[[0, -0.5], [0, 0.5]]], N: [[[-0.4, -0.5], [-0.4, 0.5], [0.4, -0.5], [0.4, 0.5]]], 1: [[[-0.2, 0.3], [0, 0.5], [0, -0.5]], [[-0.2, -0.5], [0.2, -0.5]]], 2: [[[-0.4, 0.5], [0.4, 0.5], [0.4, 0], [-0.4, -0.5], [0.4, -0.5]]], 0: [[[-0.4, -0.5], [-0.4, 0.5], [0.4, 0.5], [0.4, -0.5], [-0.4, -0.5]]] };
  function ut(de, X, G, Fe, P = 0.135, v = r.yellow, k = 1) {
    let ee = P * 0.97, ye = G + k * (Fe.length - 1) * ee / 2;
    for (let Ee = 0; Ee < Fe.length; Ee++) for (let De of Ye[Fe[Ee]] || []) for (let ce = 1; ce < De.length; ce++) {
      let me = De[ce - 1], Te = De[ce];
      c(fe, [de, X + me[1] * P, ye - k * Ee * ee - k * me[0] * P], [de, X + Te[1] * P, ye - k * Ee * ee - k * Te[0] * P], 7e-3, v, "painted", true);
    }
  }
  function lt(de = null) {
    let X = [], G = [[-O / 2, -A / 2], [O / 2, -A / 2], [O / 2, A / 2], [-O / 2, A / 2]];
    for (let Ee = 0; Ee < 4; Ee++) {
      let De = G[Ee], ce = G[(Ee + 1) % 4], me = Math.ceil(Math.hypot(ce[0] - De[0], ce[1] - De[1]) / 0.65);
      for (let Te = 0; Te < me; Te++) {
        let Ie = Te / me;
        X.push([De[0] + (ce[0] - De[0]) * Ie, De[1] + (ce[1] - De[1]) * Ie]);
      }
    }
    let Fe = [], P = [], v = [];
    for (let Ee = 0; Ee < X.length; Ee++) {
      let [De, ce] = X[Ee], me = De / (O / 2), Te = ce / (A / 2), Ie = Math.hypot(me, Te), Ve = 0.68 + 0.22 * Math.sin(Ee * 0.71) + y() * 0.27, qe = De + me / Ie * Ve, Rt = ce + Te / Ie * Ve;
      for (let [pe, gt] of [[De, ce], [qe, Rt]]) {
        Fe.push(pe, M(pe, gt) - 4e-3, gt);
        let je = new e.Color(Ee % 3 ? 8944485 : 9732971).multiplyScalar(0.94 + y() * 0.09);
        P.push(je.r, je.g, je.b);
      }
      let bt = Ee * 2, kt = (Ee + 1) % X.length * 2;
      if (v.push(bt, kt, bt + 1, kt, kt + 1, bt + 1), Ee % 3 === 0 && !(de ? de.some((pe) => Math.abs(De - pe.x) < 1.1 && Math.abs(ce - pe.z) < pe.width / 2 + 0.5) : De > O / 2 - 0.1 && [7, 13.9, 18.44].some((pe) => Math.abs(ce - pe) < 1.15))) {
        let pe = 0.035 + y() * 0.035;
        l(He, [qe, M(qe, Rt) + pe * 0.13, Rt], [pe * 1.8, pe * 0.45, pe], Ee % 2 ? r.earth : r.concrete, "soil", [0, y() * 3, 0], false);
      }
    }
    let k = a(new e.BufferGeometry());
    k.setAttribute("position", new e.Float32BufferAttribute(Fe, 3)), k.setAttribute("color", new e.Float32BufferAttribute(P, 3)), k.setIndex(v), k.computeVertexNormals(), k.computeBoundingBox(), k.computeBoundingSphere();
    let ee = new e.Mesh(k, o.soil);
    ee.name = "irregular-gravel-and-earth-transition", ee.receiveShadow = true, He.add(ee);
    let ye = new e.Mesh(k, o.far);
    ye.name = "far-site-earth-transition", s.silhouette.add(ye);
  }
  function at({ key: de, z: X, width: G, clearanceHeight: Fe, label: P, house: v, side: k = 1 }) {
    let ee = k * (O / 2 - 0.5), ye = M(ee, X), Ee = Fe + 0.09;
    ke[de] = { position: [ee, ye + 0.031, X], direction: [k, 0, 0], normal: [k, 0, 0], width: G, clearanceHeight: Fe }, pt.push({ key: de, center: ke[de].position, direction: [k, 0, 0], width: G, height: Fe, length: 2 });
    for (let De of [-1, 1]) l(fe, [ee, ye + Ee * 0.5, X + De * (G / 2 + 0.14)], [0.105, Ee, 0.11], r.blue, "steel"), l(fe, [ee, ye + 0.08, X + De * (G / 2 + 0.14)], [0.2, 0.16, 0.2], r.concrete, "concrete"), l(fe, [ee + k * 0.09, ye + 0.43, X + De * (G / 2 + 0.14)], [0.028, 0.24, 0.035], r.yellow, "painted");
    l(fe, [ee, ye + Ee + 0.055, X], [0.56, 0.11, G + 0.58], r.blue), l(fe, [ee + k * 0.291, ye + Ee + 0.067, X], [0.018, 0.19, Math.min(G + 0.24, 1.56)], r.dark), ut(ee + k * 0.304, ye + Ee + 0.063, X, P, 0.115, r.yellow, k), S([ee, ye + Ee + 0.05, X], [0.56, 0.15, G + 0.56], r.blue);
    for (let De of [-1, 1]) S([ee, ye + Ee * 0.5, X + De * (G / 2 + 0.14)], [0.13, Ee, 0.13], r.blue);
    for (let De of [-1, 1]) l(fe, [ee - k * 0.42, ye + 0.22, X + De * (G / 2 + 0.13)], [0.13, 0.36, 0.12], r.blueLight), l(fe, [ee - k * 0.42, ye + 0.64, X + De * (G / 2 + 0.13)], [0.025, 0.64, 0.026], r.yellow), d(fe, [ee - k * 0.39, ye + 0.38, X + De * (G / 2 + 0.13)], 0.045, 0.037, r.dark, "steel", [Math.PI / 2, 0, 0], true);
    v && u(v[0], v[1], 0.88, 0.94, 0.65, { owner: fe, doors: 1, color: r.blueLight });
    for (let De of [[ee + k * 0.72, X - k * G * 0.22, -k, 0], [ee + k * 2.12, X + k * G * 0.22, k, 0]]) _t(...De, 0.82);
    vt([ee + k * 0.36, X - G / 2 + 0.05], [ee + k * 0.36, X - 0.05], 0.04);
  }
  function ct(de, X, G, Fe = []) {
    let P = Math.hypot(X[0] - de[0], X[1] - de[1]), v = Math.ceil(P / 0.7), k = (X[0] - de[0]) / P, ee = (X[1] - de[1]) / P, ye = Math.atan2(k, ee), Ee = (De, ce) => Fe.some((me) => Math.abs(De - me.x) < 0.6 && Math.abs(ce - me.z) < me.width / 2 + 0.25);
    for (let De = 0; De < v; De++) {
      let ce = De / v, me = (De + 1) / v, Te = de[0] + (X[0] - de[0]) * ce, Ie = de[1] + (X[1] - de[1]) * ce, Ve = de[0] + (X[0] - de[0]) * me, qe = de[1] + (X[1] - de[1]) * me, Rt = (Te + Ve) / 2, bt = (Ie + qe) / 2, kt = M(Rt, bt), pe = P / v;
      if (Ee(Rt, bt) || Ee(Te, Ie) || Ee(Ve, qe)) continue;
      let gt = G === "retaining" ? 0.18 : G === "wall" ? 0.115 : 0.045, je = G === "retaining" ? 0.38 : 0.4;
      G !== "mesh" && ve(fe, [Rt, kt + gt * 0.5, bt], [0.1, gt, pe - 0.014], G === "retaining" ? 8550758 : r.concrete, "concrete", ye);
      for (let [Et, xt] of [[Te, Ie], [Ve, qe]]) ve(fe, [Et, M(Et, xt) + je * 0.5, xt], [0.027, je, 0.027], r.blue, "painted");
      for (let Et of [gt + 0.027, je - 0.025]) ve(fe, [Rt, kt + Et, bt], [0.016, 0.02, pe], r.blueLight, "painted", ye);
      for (let Et = 1; Et < 7; Et++) {
        let xt = Et / 7, ft = Te + (Ve - Te) * xt, Ot = Ie + (qe - Ie) * xt;
        ve(fe, [ft, M(ft, Ot) + (gt + je) * 0.5, Ot], [8e-3, je - gt, 8e-3], 8031374, "painted");
      }
      G !== "mesh" && f(s.silhouette, [Te, M(Te, Ie) + gt * 0.5, Ie], [Ve, M(Ve, qe) + gt * 0.5, qe], 0.105, 8884619, "far", Math.max(0.08, gt));
    }
    ot.push({ kind: G, points: [[de[0], M(...de), de[1]], [X[0], M(...X), X[1]]], height: G === "retaining" ? 0.38 : 0.4 });
  }
  function Ct(de, X, G = []) {
    let Fe = Math.hypot(X[0] - de[0], X[1] - de[1]), P = Math.ceil(Fe / 0.55), v = (X[0] - de[0]) / Fe, k = (X[1] - de[1]) / Fe;
    for (let ee = 0; ee < P; ee++) {
      let ye = ee / P, Ee = (ee + 1) / P, De = de[0] + (X[0] - de[0]) * (ye + Ee) / 2, ce = de[1] + (X[1] - de[1]) * (ye + Ee) / 2;
      if (G.some((Ie) => Math.abs(De - Ie.x) < 1 && Math.abs(ce - Ie.z) < Ie.width / 2 + 0.3)) continue;
      let me = [de[0] + (X[0] - de[0]) * ye, de[1] + (X[1] - de[1]) * ye], Te = [de[0] + (X[0] - de[0]) * Ee, de[1] + (X[1] - de[1]) * Ee];
      f(He, [me[0], M(...me) + 0.01, me[1]], [Te[0], M(...Te) + 0.01, Te[1]], 0.115, 4344131, "concrete", 0.012);
      for (let Ie of [-1, 1]) f(He, [me[0] - k * 0.064 * Ie, M(...me) + 0.023, me[1] + v * 0.064 * Ie], [Te[0] - k * 0.064 * Ie, M(...Te) + 0.023, Te[1] + v * 0.064 * Ie], 0.018, r.concrete, "concrete", 0.026);
      ee % 6 === 0 && ve(He, [De, M(De, ce) + 0.024, ce], [0.15, 0.018, 0.2], r.dark, "steel", Math.atan2(v, k));
    }
  }
  function se(de) {
    for (let X = 1; X < de.length; X++) {
      let G = de[X - 1], Fe = de[X], P = Fe[0] - G[0], v = Fe[1] - G[1], k = Math.hypot(P, v), ee = -v / k, ye = P / k;
      f(s.roads, [G[0], M(...G) + 0.024, G[1]], [Fe[0], M(...Fe) + 0.024, Fe[1]], 0.42, 6711138, "concrete", 0.03);
      for (let De of [-1, 1]) c(s.roads, [G[0] + ee * 0.085 * De, M(...G) + 0.066, G[1] + ye * 0.085 * De], [Fe[0] + ee * 0.085 * De, M(...Fe) + 0.066, Fe[1] + ye * 0.085 * De], 0.012, r.trim, "steel", true);
      let Ee = Math.max(1, Math.ceil(k / 0.15));
      for (let De = 0; De < Ee; De++) {
        let ce = (De + 0.5) / Ee, me = G[0] + P * ce, Te = G[1] + v * ce;
        ve(s.roads, [me, M(me, Te) + 0.051, Te], [0.032, 0.02, 0.29], r.dark, "steel", Math.atan2(v, P) * -1);
      }
      f(s.silhouette, [G[0], M(...G) + 0.027, G[1]], [Fe[0], M(...Fe) + 0.027, Fe[1]], 0.42, 6449254, "far", 0.03);
    }
  }
  if (!n && t === "metal") {
    let de = O / 2 - 0.5, X = A / 2 - 0.45;
    he.push([-de, -X], [de, -X], [de, X], [-de, X]);
    let G = [{ x: de, z: 7, width: 1.5 }, { x: de, z: 13.9, width: 1.8 }, { x: de, z: 18.44, width: 0.8 }];
    ct([-de, -X], [de, -X], "wall"), ct([de, -X], [de, X], "wall", G), ct([de, X], [-de, X], "wall"), ct([-de, X], [-de, 9], "mesh"), ct([-de, 9], [-de, -13], "retaining"), ct([-de, -13], [-de, -X], "mesh"), lt(), Ct([de - 0.29, -X + 0.25], [de - 0.29, X - 0.25], G), Ct([-de + 0.19, -X + 0.22], [-de + 0.19, X - 0.22]), Ct([-de + 0.2, X - 0.18], [de - 0.2, X - 0.18]), Ct([-de + 0.2, -X + 0.18], [de - 0.2, -X + 0.18]);
    for (let [v, k, ee] of [["main-approach", 7, 1.5], ["cargo-approach", 13.9, 1.8]]) rt(v, [[27.4, k], [32, k]], ee), Qe([28.7, k], [32.16, k], ee + 0.65);
    at({ key: "mainEntry", z: 7, width: 1.5, clearanceHeight: 0.98, label: "METAL", house: [26.05, 5.43] }), at({ key: "cargoEntry", z: 13.9, width: 1.8, clearanceHeight: 1.12, label: "CARGO", house: [26.05, 12.2] }), l(s.roads, [25.4, M(25.4, 13.9) + 0.029, 13.9], [2.35, 0.023, 0.68], r.blueLight, "steel", null, false);
    for (let v of [24.25, 26.55]) vt([v, 13.58], [v, 14.22], 0.035, r.yellow);
    for (let v = 0; v < 3; v++) {
      let k = 22.8 + v * 0.85;
      for (let ee of [-1, 1]) vt([k + ee * 0.33, 4.32], [k + ee * 0.33, 5.25], 0.025);
      vt([k - 0.33, 5.25], [k + 0.33, 5.25], 0.025), ve(s.roads, [k, M(k, 5.16) + 0.065, 5.16], [0.37, 0.07, 0.075], r.concrete, "concrete");
    }
    rt("control-forecourt", [[27.4, 4.1], [22.1, 4.1]], 0.68, false), rt("stockyard-frontage", [[6.4, 12.6], [27.4, 12.6]], 0.7, false), rt("stockyard-access", [[6.4, 13.9], [6.4, 12.6]], 0.8, false), rt("warehouse-loading-lane", [[0, 16.64], [27.4, 16.64]], 0.58, false), rt("workshops-connection", [[0, 17.4], [-1.1, 17.4]], 0.8, false), rt("south-inspection-connection", [[0, 20], [-1.1, 20]], 0.72, false);
    let Fe = ie.map((v) => [v[0], v[2]]).reverse(), P = [[ie[0][0], ie[0][2]], [-3.25, -3.56], [-1.55, -5.33], [0.88, -5.33]];
    rt("mine-to-primary-crusher", P, 0.86, false), d(s.roads, [0.25, M(0.25, -5.33) + 0.024, -5.33], 0.65, 0.018, r.asphalt, "concrete", null, false);
    for (let v of [-1, 1]) ve(fe, [1.1, M(1.1, -5.33 + v * 0.47) + 0.08, -5.33 + v * 0.47], [0.11, 0.15, 0.12], r.yellow, "painted");
    for (let v = 0; v < 96; v++) {
      let k = v / 96 * Math.PI * 2, ee = Math.atan2(Math.sin(k + 0.06 * Math.PI), Math.cos(k + 0.06 * Math.PI));
      if (Math.abs(ee) < 0.12) continue;
      let ye = V.x + Math.cos(k) * V.rx * 1.045, Ee = V.z + Math.sin(k) * V.rz * 1.045;
      ve(fe, [ye, M(ye, Ee) + 0.065, Ee], [0.15, 0.13, 0.085], v % 4 === 0 ? r.yellow : r.concrete, "concrete", -k), v % 3 === 0 && ve(fe, [ye, M(ye, Ee) + 0.18, Ee], [0.027, 0.3, 0.027], r.yellow, "painted");
    }
    for (let v = 0; v < 5; v++) {
      let k = 17 + v * 0.72, ee = [];
      for (let ye = 0; ye <= 22; ye++) {
        let Ee = ye / 22, De = Ee * Ee * (3 - 2 * Ee);
        ee.push([23.8 + 4 * Ee, k + (18.44 - k) * De]);
      }
      se(ee);
      for (let ye of [-1, 1]) l(fe, [0.82, M(0.82, k) + 0.15, k + ye * 0.115], [0.12, 0.22, 0.08], r.dark, "steel");
      l(fe, [0.77, M(0.77, k) + 0.24, k], [0.095, 0.095, 0.39], r.red);
    }
    se([[27.8, 18.44], [32.25, 18.44]]), Qe([28.65, 18.44], [32.4, 18.44], 0.94), ke.railEntry = { position: [de, M(de, 18.44) + 0.066, 18.44], direction: [1, 0, 0], normal: [1, 0, 0], width: 0.8, clearanceHeight: 1.05 }, pt.push({ key: "railEntry", center: ke.railEntry.position, direction: [1, 0, 0], width: 0.8, height: 1.05, length: 2 });
    for (let v of [-1, 1]) {
      l(fe, [de, M(de, 18.44) + 0.43, 18.44 + v * 0.58], [0.09, 0.86, 0.09], r.blue), l(fe, [de + 0.058, M(de, 18.44) + 0.7, 18.44 + v * 0.58], [0.025, 0.15, 0.13], r.yellow);
      let k = 26.73, ee = 18.44 + v * 0.6;
      d(fe, [k, M(k, ee) + 0.29, ee], 0.016, 0.58, r.trim, "steel", null, true), l(fe, [k, M(k, ee) + 0.53, ee], [0.12, 0.22, 0.065], r.dark);
      for (let ye of [-0.05, 0.05]) d(fe, [k + 0.038, M(k, ee) + 0.53 + ye, ee], 0.028, 0.012, ye > 0 ? r.red : r.yellow, "painted", [0, 0, Math.PI / 2], true);
    }
    for (let v of [17.93, 18.96]) vt([26.98, v], [27.82, v], 0.035, r.yellow);
    _t(26.8, 7, -1, 0, 0.85), _t(13, 7, -1, 0, 0.85), _t(0.01, 9.4, 0, 1, 0.9), _t(16.2, 13.9, 1, 0, 0.95), $e("main-access", [[32, 7], [de, 7], [27.4, 7], [0, 7], [0, -14.4]], 1.5, "road", "Main entry \u2192 operations \u2192 processing spine"), $e("ore-feed", [...Fe, ...P.slice(1)], 0.86, "haul-road", "Mine ramp \u2192 primary crushing apron"), $e("finished-goods", [[6.4, 12.6], [6.4, 13.9], [27.4, 13.9], [32, 13.9]], 1.8, "cargo-road", "Blending stockyard \u2192 weighbridge \u2192 cargo exit"), $e("warehouse-loading", [[0, 16.64], [27.4, 16.64], [27.4, 13.9]], 0.58, "loading-road", "Finished warehouses \u2192 loading road \u2192 cargo avenue"), $e("rail-export", [[0.82, 18.44], [23.8, 18.44], [27.8, 18.44], [32.25, 18.44]], 0.8, "rail", "Five-track loading yard \u2192 turnout throat \u2192 external railway"), $e("perimeter-inspection", [[-27.7, 13.9], [-27.7, -20], [27.4, -20], [27.4, 20], [0, 20]], 0.85, "inspection", "Mine edge and utility perimeter inspection route"), Q.push({ key: "entry-operations", name: "Main checkpoint, control and maintenance forecourt", kind: "operations", position: [24.1, 0, 3.8], bounds: [21.8, 1, 28.5, 8.1], buildings: 2 });
  }
  if (!n && t !== "metal") {
    let de = O / 2 - 0.5, X = A / 2 - 0.45, G = 7.35, Fe = 13.2, P = 15.99, v = -14.3;
    he.push([-de, -X], [de, -X], [de, X], [-de, X]);
    let k = [{ x: de, z: G, width: 1.5 }, { x: de, z: Fe, width: 1.6 }, { x: de, z: P, width: 0.8 }, { x: -de, z: v, width: 1.35 }];
    ct([-de, -X], [de, -X], "wall"), ct([de, -X], [de, X], "wall", k), ct([de, X], [-de, X], "wall"), ct([-de, X], [-de, -X], "mesh", k), lt(k), Ct([de - 0.2, -X + 0.18], [de - 0.2, X - 0.18], k), Ct([-de + 0.17, -X + 0.18], [-de + 0.17, X - 0.18], k), Ct([-de + 0.3, X - 0.17], [de - 0.3, X - 0.17]), Ct([-de + 0.3, -X + 0.17], [de - 0.3, -X + 0.17]), rt("north-inspection-walk", [[-24.9, -18.25], [24.65, -18.25]], 0.24, false), rt("south-inspection-walk", [[-24.9, 18.12], [24.65, 18.12]], 0.28, false);
    for (let [ee, ye, Ee] of [["main-approach", G, 1.5], ["cargo-approach", Fe, 1.6]]) rt(ee, [[24.65, ye], [29, ye]], Ee), Qe([25.7, ye], [29.16, ye], Ee + 0.65);
    rt("raw-material-approach", [[-29, v], [-24.9, v]], 1.35), Qe([-29.16, v], [-25.7, v], 2), at({ key: "mainEntry", z: G, width: 1.5, clearanceHeight: 0.98, label: t === "crystal" ? "CRYSTAL" : "GAS", house: [23.25, 5.45] }), at({ key: "cargoEntry", z: Fe, width: 1.6, clearanceHeight: 1.12, label: "CARGO" }), at({ key: "rawEntry", z: v, width: 1.35, clearanceHeight: 0.98, label: t === "crystal" ? "ORE" : "INLET", side: -1 }), l(fe, [23.2, M(23.2, 12.3) + 0.21, 12.3], [0.45, 0.42, 0.15], r.blueLight), l(s.roads, [22.9, M(22.9, Fe) + 0.029, Fe], [2.1, 0.023, 0.66], r.blueLight, "steel", null, false);
    for (let ee of [21.87, 23.93]) vt([ee, Fe - 0.31], [ee, Fe + 0.31], 0.035, r.yellow);
    rt("warehouse-frontage", [[-24.9, 11.85], [24.65, 11.85]], 0.62, false);
    for (let ee of t === "gas" ? [-7.4, -2.2, 3, 8.2, 13.4, 18.6, 22.7] : [-22, -17, -11.7, -6.4, -1.1, 4.2, 9.5, 14.8, 20.6]) rt(`warehouse-apron-${ee}`, [[ee, 11.4], [ee, 11.85]], 0.72, false);
    if (t === "crystal") {
      rt("finishing-dispatch", [[0, 6.25], [16.7, 6.25], [16.7, 7.35]], 0.62, false), rt("control-forecourt", [[18.8, 5.15], [22.4, 5.15], [22.4, 7.35]], 0.55, false);
      for (let ee of [19.3, 20.1, 20.9]) {
        for (let ye of [-0.3, 0.3]) vt([ee + ye, 5.45], [ee + ye, 6.2], 0.022);
        vt([ee - 0.3, 6.2], [ee + 0.3, 6.2], 0.022);
      }
      for (let ee of [-22.1, -17.9, -13.7, -9.5]) rt(`covered-feed-apron-${ee}`, [[ee, -14.98], [ee, -14.3]], 0.8, false);
      $e("raw-feed", [[-29, v], [-de, v], [-22.1, v], [-22.1, -15]], 1.35, "cargo-road", "Raw mineral entry \u2192 covered feedstock \u2192 processing streets");
    } else {
      let ce = M(15.5, 3.4);
      l(s.storage, [(8.95 + 22.38) / 2, ce + 0.018, (0.4 + 6.3) / 2], [22.38 - 8.95, 0.036, 6.3 - 0.4], 9608339, "concrete", null, false);
      for (let me of [0.4, 6.3]) l(s.storage, [(8.95 + 22.38) / 2, ce + 0.12, me], [22.38 - 8.95 + 0.1, 0.24, 0.1], r.concrete, "concrete", null, false);
      for (let me of [8.95, 22.38]) l(s.storage, [me, ce + 0.12, (0.4 + 6.3) / 2], [0.1, 0.24, 6.3 - 0.4], r.concrete, "concrete", null, false);
      for (let me of [0.4, 6.3]) S([(8.95 + 22.38) / 2, ce + 0.12, me], [22.38 - 8.95 + 0.1, 0.24, 0.12], r.concrete);
      for (let me of [8.95, 22.38]) S([me, ce + 0.12, (0.4 + 6.3) / 2], [0.12, 0.24, 6.3 - 0.4], r.concrete);
      rt("tank-inspection-east", [[23.05, 0.35], [23.05, 4.6]], 0.3, false), rt("tank-inspection-south", [[9.05, 6.49], [22.85, 6.49]], 0.22, false);
      for (let me of [1.35, 3.4, 5.45]) {
        _([[10.93, 0.43, me + 0.35], [21.73, 0.43, me + 0.35], [21.73, 0.7, me + 0.35], [24.3, 0.7, me + 0.35], [24.3, 1.2, me + 0.35]], 0.041, r.blueLight, s.storage);
        for (let Te of [10.1, 13.7, 17.3, 20.9]) _([[Te + 0.82, 0.378, me + 0.35], [Te + 0.82, 0.43, me + 0.35]], 0.035, r.trim, s.storage);
      }
      for (let me of [-22.4, -18.5, -14.6]) for (let Te of [-17.35, -15.8]) {
        m(me, Te, 1.38, 0.78, 0.045);
        for (let Ie of [-0.43, 0.43]) d(s.equipment, [me + Ie, M(me, Te) + 0.22, Te], 0.082, 0.4, r.blueLight, "painted");
        _([[me - 0.58, 0.38, Te], [me + 0.6, 0.38, Te]], 0.057, r.trim), l(s.equipment, [me + 0.05, 0.53, Te], [0.34, 0.27, 0.27], r.blue), d(s.equipment, [me + 0.05, 0.72, Te], 0.065, 0.14, r.trim, "steel", null, true), d(s.equipment, [me + 0.05, 0.815, Te], 0.13, 0.022, r.red, "painted", null, false);
        for (let Ie of [-0.58, 0.58]) d(s.equipment, [me + Ie, 0.38, Te], 0.089, 0.026, r.dark, "steel", [0, 0, Math.PI / 2], false);
      }
      _([[-29, 0.63, -16.58], [-23.2, 0.63, -16.58], [-23.2, 0.63, -17.35], [-13.85, 0.63, -17.35], [-13.85, 0.63, -15.8]], 0.073, r.blueLight);
      for (let me of [-22.4, -18.5, -14.6]) _([[me, 0.63, -17.35], [me, 0.4, -17.35], [me, 0.4, -15.8]], 0.044, r.trim);
      ke.feedConnection = { position: [-29, 0.63, -16.58], direction: [-1, 0, 0], normal: [-1, 0, 0], width: 0.25 };
      for (let me of [-22, -19.2, -16.4, -13.6]) {
        for (let Te of [-0.6, 0.6]) vt([me + Te, 9.3], [me + Te, 10.8], 0.028);
        vt([me - 0.6, 10.8], [me + 0.6, 10.8], 0.028);
        for (let Te of [-1, 1]) ve(s.roads, [me + Te * 0.34, M(me, 10.7) + 0.06, 10.7], [0.42, 0.075, 0.08], r.concrete, "concrete");
      }
      rt("tanker-staging", [[-24.9, 8.6], [-11, 8.6], [-11, 11.85]], 0.8, false), Q.push({ key: "inlet-metering", name: "External gas inlet and six metering skids", kind: "inlet", meteringSkids: 6, bounds: [-24, -17.9, -13.8, -15.2] }), $e("raw-feed", [[-29, v], [-de, v], [-17.3, v], [-17.3, -7.55], [24.65, -7.55]], 1.35, "service-road", "Inlet service gate \u2192 treatment avenues \u2192 common pipe trunk"), $e("bulk-product", [[24.65, 3.4], [24.65, 7.35], [24.65, 11.85], [-11, 11.85], [-11, 8.6]], 0.86, "cargo-road", "Contained product reserve \u2192 dispatch frontage \u2192 tanker staging");
    }
    for (let ee = 0; ee < 5; ee++) {
      let ye = 14.55 + ee * 0.72, Ee = [];
      for (let De = 0; De <= 22; De++) {
        let ce = De / 22, me = ce * ce * (3 - 2 * ce);
        Ee.push([20.7 + 3.6 * ce, ye + (P - ye) * me]);
      }
      se(Ee);
      for (let De of [-1, 1]) l(fe, [-24.17, M(-24.17, ye) + 0.15, ye + De * 0.115], [0.12, 0.22, 0.08], r.dark, "steel");
      l(fe, [-24.23, M(-24.23, ye) + 0.24, ye], [0.095, 0.095, 0.39], r.red);
    }
    se([[24.3, P], [29, P]]), Qe([25.7, P], [29.16, P], 0.94), ke.railEntry = { position: [de, M(de, P) + 0.066, P], direction: [1, 0, 0], normal: [1, 0, 0], width: 0.8, clearanceHeight: 1.05 }, pt.push({ key: "railEntry", center: ke.railEntry.position, direction: [1, 0, 0], width: 0.8, height: 1.05, length: 2 });
    for (let ee of [-1, 1]) l(fe, [de, M(de, P) + 0.43, P + ee * 0.57], [0.09, 0.86, 0.09], r.blue), l(fe, [de + 0.058, M(de, P) + 0.7, P + ee * 0.57], [0.025, 0.15, 0.13], r.yellow), d(fe, [24, M(24, P) + 0.29, P + ee * 0.56], 0.016, 0.58, r.trim, "steel", null, true), l(fe, [24, M(24, P) + 0.55, P + ee * 0.56], [0.1, 0.18, 0.06], r.dark);
    for (let ee of [P - 0.47, P + 0.47]) vt([24.23, ee], [25.07, ee], 0.032, r.yellow);
    _t(24.2, G, -1, 0, 0.8), _t(10, G, -1, 0, 0.8), _t(16, Fe, 1, 0, 0.9), $e("main-access", [[29, G], [de, G], [24.65, G], [-0.3, G], [-0.3, -14.3]], 1.5, "road", "Main checkpoint \u2192 operations frontage \u2192 process spine"), $e("finished-goods", [[-24.9, 11.85], [24.65, 11.85], [24.65, Fe], [29, Fe]], 1.6, "cargo-road", "Warehouse loading lane \u2192 weighbridge \u2192 cargo exit"), $e("rail-export", [[-24.2, P], [20.7, P], [24.3, P], [29, P]], 0.8, "rail", "Loading sidings \u2192 turnout throat \u2192 external railway"), $e("perimeter-inspection", [[-24.9, 18.12], [-24.9, -18.25], [24.65, -18.25], [24.65, 18.12], [-24.9, 18.12]], 0.24, "inspection", "Fence buffer and drainage inspection circuit"), Q.push({ key: "main-checkpoint", name: "Main gate, guardhouse and controlled forecourt", kind: "entry", buildings: 1, bounds: [22.65, 4.8, 25.5, 8.2] });
  }
  if (n) {
    for (let X of Y) {
      let G = X.x === 0 ? "central" : `${X.x < 0 ? "west" : "east"}-${X.z < 0 ? "inlet" : "product"}`, Fe = X.x - X.w / 2, P = X.x + X.w / 2, v = X.z - X.d / 2, k = X.z + X.d / 2;
      Ae.push({ key: G, points: [[Fe, v], [P, v], [P, k], [Fe, k]], height: X.y });
      let ee = X.x === 0 ? 0.36 : 0.4, ye = Fe + ee, Ee = P - ee, De = v + 0.27, ce = k - 0.27, me = [[ye, De], [Ee, De], [Ee, ce], [ye, ce], [ye, De]];
      for (let Te = 1; Te < me.length; Te++) {
        let Ie = me[Te - 1], Ve = me[Te];
        f(fe, [Ie[0], X.y + 0.033, Ie[1]], [Ve[0], X.y + 0.033, Ve[1]], 0.22, 4150110, "steel", 0.016), vt(Ie, Ve, 0.014, r.yellow, fe);
        let qe = Math.hypot(Ve[0] - Ie[0], Ve[1] - Ie[1]), Rt = Math.ceil(qe / 0.2), bt = (Ve[0] - Ie[0]) / qe, kt = (Ve[1] - Ie[1]) / qe;
        for (let pe = 0; pe < Rt; pe++) {
          let gt = (pe + 0.5) / Rt, je = Ie[0] + (Ve[0] - Ie[0]) * gt, Et = Ie[1] + (Ve[1] - Ie[1]) * gt;
          ve(fe, [je, X.y + 0.044, Et], [0.012, 8e-3, 0.19], 7374220, "steel", Math.atan2(kt, bt) * -1);
        }
      }
      $e(`crew-${G}`, me, 0.22, "inspection", `${X.name} inspection walk`), ot.push({ kind: "deck-edge-truss-and-guardrail", key: G, points: [[Fe, X.y, v], [P, X.y, v], [P, X.y, k], [Fe, X.y, k]], height: 0.23 });
      for (let Te of [Fe + 0.08, P - 0.08]) for (let Ie of [v + 0.08, k - 0.08]) ve(fe, [Te, X.y + 0.2, Ie], [0.065, 0.32, 0.065], r.blueLight, "painted"), ve(fe, [Te, X.y + 0.385, Ie], [0.095, 0.05, 0.095], r.yellow, "painted"), S([Te, X.y + 0.13, Ie], [0.085, 0.26, 0.085], r.blueLight);
    }
    for (let X = 0; X < b.length; X++) {
      let G = b[X], Fe = G.axis === "x", P = Fe ? [[G.x - G.w / 2, G.z], [G.x + G.w / 2, G.z]] : [[G.x, G.z - G.d / 2], [G.x, G.z + G.d / 2]];
      for (let v of [-1, 1]) {
        let k = Fe ? [P[0][0], P[0][1] + v * 0.99] : [P[0][0] + v * 2.12, P[0][1]], ee = Fe ? [P[1][0], P[1][1] + v * 0.99] : [P[1][0] + v * 2.12, P[1][1]], ye = Fe ? 18 : 12;
        for (let me = 0; me < ye; me++) {
          let Te = me / ye, Ie = (me + 1) / ye, Ve = [k[0] + (ee[0] - k[0]) * Te, k[1] + (ee[1] - k[1]) * Te], qe = [k[0] + (ee[0] - k[0]) * Ie, k[1] + (ee[1] - k[1]) * Ie];
          f(fe, [Ve[0], M(...Ve) + 0.03, Ve[1]], [qe[0], M(...qe) + 0.03, qe[1]], 0.28, r.dark, "steel", 0.016);
        }
        let Ee = Fe ? [P[0][0], P[0][1] + v * 0.7] : [P[0][0] + v * 1.45, P[0][1]], De = Fe ? [P[1][0], P[1][1] + v * 0.7] : [P[1][0] + v * 1.45, P[1][1]], ce = [];
        for (let me = 0; me <= 18; me++) {
          let Te = me / 18, Ie = Ee[0] + (De[0] - Ee[0]) * Te, Ve = Ee[1] + (De[1] - Ee[1]) * Te;
          ce.push([Ie, M(Ie, Ve) + 0.78, Ve]);
        }
        _(ce, 0.055, v < 0 ? r.trim : r.blueLight);
        for (let me of [Ee, De]) {
          let Te = me[0], Ie = me[1], Ve = M(Te, Ie), qe = v < 0 ? r.trim : r.blueLight;
          if (Fe) {
            let Rt = Math.sign(G.x);
            if (Math.abs(Te) < 11.2) if (G.z > 0) {
              let bt = Rt * 9.925;
              _([[Te, Ve + 0.78, Ie], [bt, Ve + 0.78, Ie]], 0.055, qe), d(s.storage, [bt, Ve + 0.78, Ie], 0.082, 0.045, r.blueLight, "steel", [0, 0, Math.PI / 2]);
            } else if (Rt > 0) {
              let bt = 9.65 + v * 0.065;
              _([[Te, Ve + 0.78, Ie], [bt, Ve + 0.78, Ie], [bt, Ve + 1.2, Ie]], 0.055, qe);
            } else {
              let bt = -9.85 + v * 0.08, kt = -13.3 + v * 0.13;
              _([[Te, Ve + 0.78, Ie], [bt, Ve + 0.78, Ie], [bt, Ve + 1.2, Ie], [bt, Ve + 1.2, kt], [-9.7, Ve + 1.2, kt]], 0.055, qe);
            }
            else _([[Te, Ve + 0.78, Ie], [Rt * 13, Ve + 0.78, Ie], [Rt * 13, Ve + 1.16, Ie]], 0.055, qe);
          } else {
            let Rt = Ie < 1 ? -3.5 : 4.75, bt = G.x + v * 7;
            _([[Te, Ve + 0.78, Ie], [Te, Ve + 1.16, Ie], [Te, Ve + 1.16, Rt], [bt, Ve + 1.16, Rt]], 0.055, qe);
          }
        }
        for (let me of P) {
          let Te = me[0] + (Fe ? 0 : v * 0.73), Ie = me[1] + (Fe ? v * 0.73 : 0);
          ve(fe, [Te, M(Te, Ie) + 0.36, Ie], [0.055, 0.72, 0.055], r.blue, "painted"), ve(fe, [Te, M(Te, Ie) + 0.74, Ie], [0.105, 0.04, 0.105], r.yellow, "painted");
        }
      }
      $e(`bridge-${X + 1}`, P, Fe ? 0.93 : 0.8, "bridge", `${Fe ? "Central transfer" : "Inter-deck loading"} bridge ${X + 1}`);
      for (let v of P) for (let k of [-1, 1]) {
        let ee = v[0] + (Fe ? 0 : k * 0.29), ye = v[1] + (Fe ? k * 0.29 : 0);
        _t(ee, ye, Fe ? v === P[0] ? 1 : -1 : 0, Fe ? 0 : v === P[0] ? 1 : -1, 0.44, r.yellow);
      }
    }
    for (let X of Y.filter((G) => G.x !== 0)) for (let G of [-1, 1]) {
      let Fe = X.x + G * 7, P = X.z - 7.6, v = X.z + 6.5, k = X.y;
      _([[Fe, k + 1.16, P], [Fe, k + 1.16, v]], 0.055, G < 0 ? r.trim : r.blueLight);
      for (let ee = P + 0.45; ee < v; ee += 2.35) Math.abs(ee - X.z) < 1.3 || (ve(s.structures, [Fe, k + 0.53, ee], [0.037, 1.06, 0.037], r.dark, "steel"), ve(s.structures, [Fe, k + 1.095, ee], [0.16, 0.034, 0.085], r.blueLight, "steel"));
    }
    let de = (X, G, Fe, P) => {
      let v = G * 27.8, k = 12, ee = M(G * 27.65, k), ye = 1.05;
      ke[X] = { position: [v, ee + 0.031, k], direction: [G, 0, 0], normal: [G, 0, 0], width: Fe, clearanceHeight: ye }, pt.push({ key: X, center: ke[X].position, direction: [G, 0, 0], width: Fe, height: ye, length: 1.8 }), rt(`${X}-dock-apron`, [[G * 25.8, k], [v, k]], Fe, false);
      for (let Ee of [-1, 1]) l(fe, [G * 27.54, ee + 0.61, k + Ee * (Fe / 2 + 0.18)], [0.105, 1.22, 0.105], r.blue, "steel"), l(fe, [G * 27.54, ee + 0.08, k + Ee * (Fe / 2 + 0.18)], [0.23, 0.16, 0.2], r.dark, "steel"), d(fe, [G * 27.74, ee + 0.17, k + Ee * 1.35], 0.073, 0.25, r.dark, "steel", null, true), l(fe, [G * 27.84, ee - 0.07, k + Ee * 1.35], [0.1, 0.29, 0.36], r.rubber, "rubber"), S([G * 27.54, ee + 0.61, k + Ee * (Fe / 2 + 0.18)], [0.12, 1.22, 0.12], r.blue);
      l(fe, [G * 27.54, ee + 1.27, k], [0.48, 0.15, Fe + 0.58], r.blue), l(fe, [G * 27.79, ee + 1.27, k], [0.025, 0.2, Fe + 0.28], r.dark), ut(G * 27.81, ee + 1.27, k, P, 0.135, r.yellow, G), S([G * 27.54, ee + 1.27, k], [0.48, 0.15, Fe + 0.58], r.blue);
      for (let Ee of [-0.42, 0.42]) _t(G * 26.7, k + Ee, -G, 0, 0.64);
      l(fe, [G * 27.1, ee + 0.26, 10.68], [0.35, 0.48, 0.25], r.blueLight), ot.push({ kind: "open-docking-interface", key: X, points: [[v, ee, k - Fe / 2], [v, ee, k + Fe / 2]], height: 1.35 });
    };
    de("mainEntry", 1, 1.6, "DOCK 1"), de("cargoEntry", -1, 1.2, "CARGO"), ke.serviceEntry = { position: [-0.42, 0.551, -14.2], direction: [0, 0, -1], normal: [0, 0, -1], width: 0.65, clearanceHeight: 0.95 }, pt.push({ key: "serviceEntry", center: ke.serviceEntry.position, direction: [0, 0, -1], width: 0.65, height: 0.95, length: 0.8 }), rt("central-personnel-port", [[-0.42, -14.2], [-0.42, -13.85]], 0.65, false);
    for (let X of [-1, 1]) ve(fe, [-0.42 + X * 0.47, 0.76, -14.06], [0.055, 0.44, 0.055], r.yellow, "painted");
    $e("main-transfer", [[27.8, 12], [11.2, 12], [10.4, 12], [10.4, 13.5], [-10.4, 13.5], [-10.4, 12], [-27.8, 12]], 0.6, "cargo-road", "Main dock \u2192 warehouse frontage bypass \u2192 west freight dock"), $e("inlet-transfer", [[-27.3, -10], [-11.2, -10], [-10.4, -10], [-10.4, -12.35], [10.4, -12.35], [10.4, -10], [11.2, -10], [27.3, -10]], 0.65, "cargo-road", "Inlet satellite docks \u2192 north central bypass \u2192 treatment decks"), $e("central-spine", [[-0.42, -14.2], [-0.42, 10.65], [10.4, 10.65], [10.4, 13.5]], 1.18, "road", "Personnel port \u2192 central process spine \u2192 warehouse exchange"), Q.push({ key: "east-main-dock", name: "Main docking and cargo inspection interface", kind: "dock", position: [27.1, 0, 12], bounds: [25.7, 10.5, 27.8, 13.5] }), Q.push({ key: "west-freight-dock", name: "Western freight departure interface", kind: "dock", position: [-27.1, 0, 12], bounds: [-27.8, 10.5, -25.7, 13.5] });
  }
  return ae(), { siteBoundary: he, platformBoundaries: Ae, anchors: ke, logisticsRoutes: we, entryClearances: pt, boundaryTreatments: ot, transportSurfaces: Ce, views: t === "metal" && !n ? { top: { eye: [1.5, 72, 0.1], target: [1.5, 0, 0.1], up: [0, 0, -1] }, entry: { eye: [34.3, 4.3, 12.8], target: [27, 0.32, 7] }, edge: { eye: [-33.1, 3.8, 10.9], target: [-27.6, 0.05, 5.3] } } : n ? { top: { eye: [0, 68, 1], target: [0, 0, 1], up: [0, 0, -1] }, entry: { eye: [34.8, 4.8, 18], target: [26.1, 0.5, 12] }, edge: { eye: [17.8, 4.9, 17.8], target: [11.8, 0.18, 12] } } : { top: { eye: [0, 65, 0.1], target: [0, 0, 0.1], up: [0, 0, -1] }, entry: { eye: [31.3, 4.4, 12.8], target: [24.3, 0.32, 7.35] }, edge: t === "gas" ? { eye: [29.5, 8.5, 15], target: [16.6, 0.52, 3.4] } : { eye: [-29.4, 4, -10.2], target: [-24.3, 0.18, -14.3] } } };
}
function Og({ THREE: i42, type: e = "metal", seed: t = 17, floating: n = false, ground: s = { heightAt: () => 0 } } = {}) {
  if (!i42?.Group) throw new TypeError("THREE is required.");
  if (!["metal", "crystal", "gas"].includes(e)) throw new RangeError("Unknown resource type.");
  n = e === "gas" && !!n;
  let r = (t | 0) >>> 0, o = () => {
    r += 1831565813;
    let x = r;
    return x = Math.imul(x ^ x >>> 15, x | 1), x ^= x + Math.imul(x ^ x >>> 7, x | 61), ((x ^ x >>> 14) >>> 0) / 4294967296;
  }, a = (x, D = 0, Z = 1) => Math.max(D, Math.min(Z, x)), l = (x, D, Z) => x + (D - x) * Z, c = (x) => (x = a(x), x * x * (3 - 2 * x)), d = (x) => new i42.Vector3(...x), f = new i42.Vector3(0, 1, 0), h = new i42.Quaternion(), p = { earth: 9009251, cut: 10521200, asphalt: 4673879, concrete: 11184542, dark: 2832707, blue: 5467517, blueLight: 8230047, trim: 12371652, pale: 13750724, yellow: 14068293, rubber: 2370610, glass: 3495782, ore: 7693904, crystal: 7246734, white: 14802898, red: 11100231 }, u = new i42.Group();
  u.name = `resource-city-${e}${n ? "-floating" : ""}-${t}`;
  let _ = {};
  for (let x of ["terrain", "structures", "equipment", "storage", "vehicles", "effects", "silhouette", "perimeter", "roads", "edgeTerrain"]) _[x] = new i42.Group(), _[x].name = x, u.add(_[x]);
  let g = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set(), M = [], y = /* @__PURE__ */ new Map(), Y = /* @__PURE__ */ new Map(), b = [], O = [], A = [], V = [], ie = (x) => (g.add(x), x), Q = /* @__PURE__ */ new Map(), ue = (x) => {
    let D = new i42.MeshStandardMaterial({ vertexColors: true, ...x });
    return m.add(D), D;
  }, fe = { soil: ue({ roughness: 0.97, metalness: 0 }), concrete: ue({ roughness: 0.88, metalness: 0.02 }), painted: ue({ roughness: 0.66, metalness: 0.28 }), steel: ue({ roughness: 0.39, metalness: 0.68 }), rubber: ue({ roughness: 0.9, metalness: 0.05 }), glass: ue({ roughness: 0.23, metalness: 0.45 }), lamp: ue({ roughness: 0.36, metalness: 0.1, emissive: 2704701, emissiveIntensity: 0.4 }), far: ue({ roughness: 0.83, metalness: 0.12 }) };
  function He(x) {
    return x.emissiveIntensity > 0 && x.emissive?.getHex() ? fe.lamp : x.metalness > 0.6 ? fe.steel : x.roughness > 0.95 ? fe.soil : x.roughness > 0.875 ? x.metalness > 0.03 ? fe.rubber : fe.concrete : x.roughness < 0.3 ? fe.glass : fe.painted;
  }
  let he = (x, D) => (Q.has(x) || Q.set(x, ie(D())), Q.get(x)), Ae = he("box", () => new i42.BoxGeometry(1, 1, 1)), ke = he("bevel", () => {
    let x = new i42.Shape(), D = 0.06, Z = 0.5 - D;
    x.moveTo(-Z, -0.5);
    for (let ge of [[Z, -0.5], [0.5, -Z], [0.5, Z], [Z, 0.5], [-Z, 0.5], [-0.5, Z], [-0.5, -Z]]) x.lineTo(...ge);
    x.closePath();
    let j = new i42.ExtrudeGeometry(x, { depth: 0.9, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.015, bevelThickness: 0.04, steps: 1, curveSegments: 1 });
    j.translate(0, 0, -0.45), j.computeBoundingBox();
    let z = j.boundingBox.getSize(new i42.Vector3());
    return j.scale(1 / z.x, 1 / z.y, 1 / z.z), j;
  }), we = he("cyl16", () => new i42.CylinderGeometry(1, 1, 1, 16)), pt = he("cyl8", () => new i42.CylinderGeometry(1, 1, 1, 8)), ot = he("ball", () => new i42.SphereGeometry(1, 16, 8)), Ce = he("rock", () => new i42.IcosahedronGeometry(1, 0));
  function le(x, D) {
    let Z = [];
    for (let z of D) for (let ge = 1; ge < z.length - 1; ge++) for (let xe of [z[0], z[ge], z[ge + 1]]) Z.push(...x[xe]);
    let j = ie(new i42.BufferGeometry());
    return j.setAttribute("position", new i42.Float32BufferAttribute(Z, 3)), j.computeVertexNormals(), j;
  }
  let Be = he("gable", () => le([[-0.5, 0, -0.5], [0.5, 0, -0.5], [0, 1, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5], [0, 1, 0.5]], [[0, 2, 1], [3, 4, 5], [0, 3, 5, 2], [1, 2, 5, 4], [0, 1, 4, 3]])), ze = 0;
  function re(x, D, Z, j = [1, 1, 1], z = p.blue, ge = "painted", xe = null) {
    x.userData.batchId || (x.userData.batchId = ++ze);
    let Me = `${x.userData.batchId}:${ge}`;
    Y.has(Me) || Y.set(Me, { owner: x, matKey: ge, pieces: [] });
    let Je = xe instanceof i42.Quaternion ? xe : xe ? new i42.Quaternion().setFromEuler(new i42.Euler(...xe)) : h;
    Y.get(Me).pieces.push({ geo: D, matrix: new i42.Matrix4().compose(d(Z), Je, d(j)), color: new i42.Color(z) });
  }
  let F = (x, D, Z, j = p.blue, z = "painted", ge = null, xe = true) => re(x, xe ? ke : Ae, D, Z, j, z, ge), ve = (x, D, Z, j, z = p.trim, ge = "steel", xe = null, Me = false) => re(x, Me ? pt : we, D, [Z, j, Z], z, ge, xe), ae = (x, D, Z, j = p.trim, z = "steel") => re(x, ot, D, Z, j, z);
  function $e(x, D, Z, j = 0.025, z = p.trim, ge = "steel", xe = false) {
    let Me = d(D), Je = d(Z), Mt = Je.clone().sub(Me), dt = Mt.length();
    dt < 1e-7 || re(x, xe ? Ae : pt, Me.add(Je).multiplyScalar(0.5).toArray(), [j, dt, j], z, ge, new i42.Quaternion().setFromUnitVectors(f, Mt.normalize()));
  }
  function rt(x, D, Z, j = 0.012, z = p.trim, ge = "steel", xe = [Math.PI / 2, 0, 0]) {
    let Me = j / Z;
    re(x, he(`ring${Me.toFixed(3)}`, () => new i42.TorusGeometry(1, Me, 5, 24)), D, [Z, Z, Z], z, ge, xe);
  }
  function Qe() {
    for (let { owner: x, matKey: D, pieces: Z } of Y.values()) {
      let j = 0;
      for (let wt of Z) j += wt.geo.index?.count ?? wt.geo.attributes.position.count;
      let z = new Float32Array(j * 3), ge = new Float32Array(j * 3), xe = new Float32Array(j * 3), Me = new i42.Vector3(), Je = new i42.Vector3(), Mt = 0;
      for (let wt of Z) {
        let It = wt.geo, Bt = new i42.Matrix3().getNormalMatrix(wt.matrix), qt = It.index?.count ?? It.attributes.position.count;
        for (let dn = 0; dn < qt; dn++) {
          let In = It.index ? It.index.getX(dn) : dn;
          Me.fromBufferAttribute(It.attributes.position, In).applyMatrix4(wt.matrix), Je.fromBufferAttribute(It.attributes.normal, In).applyMatrix3(Bt).normalize(), z.set(Me.toArray(), Mt), ge.set(Je.toArray(), Mt), xe.set([wt.color.r, wt.color.g, wt.color.b], Mt), Mt += 3;
        }
      }
      let dt = ie(new i42.BufferGeometry());
      dt.setAttribute("position", new i42.BufferAttribute(z, 3)), dt.setAttribute("normal", new i42.BufferAttribute(ge, 3)), dt.setAttribute("color", new i42.BufferAttribute(xe, 3)), dt.computeBoundingBox(), dt.computeBoundingSphere();
      let yt = new i42.Mesh(dt, fe[D]);
      yt.name = `${x.name}-${D}`, yt.castShadow = D !== "soil", yt.receiveShadow = true, x.add(yt);
    }
    Y.clear();
  }
  function _t(x, D) {
    let Z = new i42.Group();
    return Z.name = D, x.add(Z), Z;
  }
  let vt = n ? 60 : e === "metal" ? 58 : 52, Ye = n || e === "metal" ? 42 : 38, ut = typeof s?.heightAt == "function" ? s.heightAt : () => 0, lt = +ut(0, 0) || 0, at = (x, D) => (+ut(x, D) || 0) - lt, ct = { x: -15.15, z: -1.1, rx: 11.05, rz: 12.9, depth: 4.75 }, Ct = { x: -19, z: -17.1, rx: 5.9, rz: 2.3, depth: 1.4 }, se = [], Ht = [], de = [];
  if (e === "metal") for (let x = 0; x <= 250; x++) {
    let D = x / 250, Z = l(1.015, 0.22, D), j = -0.06 * Math.PI + D * Math.PI * 4.35;
    se.push([ct.x + Math.cos(j) * ct.rx * Z, -ct.depth * D, ct.z + Math.sin(j) * ct.rz * Z]);
  }
  if (n) {
    Ht.push({ name: "Central process spine", x: 0, z: 0, w: 22.4, d: 28.4, y: 0.52 });
    for (let x of [-20, 20]) for (let D of [-10, 12]) Ht.push({ name: `${x < 0 ? "West" : "East"} ${D < 0 ? "inlet" : "product"} deck`, x, z: D, w: 15.6, d: 16.6, y: 0 });
    for (let x of [-11.7, 11.7]) for (let D of [-10, 12]) de.push({ x, z: D, w: 3.2, d: 2.6, axis: "x" });
    for (let x of [-20, 20]) de.push({ x, z: 1, w: 5, d: 6, axis: "z" });
  }
  function X(x, D, Z, j) {
    let z = Math.hypot((x - Z.x) / Z.rx, (D - Z.z) / Z.rz);
    if (z >= 1.025) return 0;
    let ge = j ? 7 : 3, xe = 0.22, Me = (1.025 - xe) / ge, Je = -Z.depth;
    if (z > xe) {
      let Mt = (z - xe) / Me, dt = Math.floor(Mt), yt = Mt - dt;
      Je = -Z.depth + Z.depth / ge * (dt + c((yt - 0.28) / 0.72));
    }
    if (j) {
      let Mt = 1e9, dt = 0;
      for (let wt = 1; wt < se.length; wt++) {
        let It = se[wt - 1], Bt = se[wt], qt = Bt[0] - It[0], dn = Bt[2] - It[2], In = a(((x - It[0]) * qt + (D - It[2]) * dn) / (qt * qt + dn * dn)), Vn = (x - It[0] - qt * In) ** 2 + (D - It[2] - dn * In) ** 2;
        Vn < Mt && (Mt = Vn, dt = l(It[1], Bt[1], In));
      }
      let yt = Math.sqrt(Mt);
      yt < 0.61 && (Je = l(Je, dt, 1 - c((yt - 0.41) / 0.2)));
    }
    return Je;
  }
  function G(x, D) {
    if (n) {
      for (let z of Ht) if (Math.abs(x - z.x) <= z.w / 2 && Math.abs(D - z.z) <= z.d / 2) return z.y;
      for (let z of de) if (Math.abs(x - z.x) <= z.w / 2 && Math.abs(D - z.z) <= z.d / 2) return z.axis === "x" ? 0.52 * a((12.2 - Math.abs(x)) / 1) : 0;
      return 0;
    }
    let Z = Math.min(vt / 2 - Math.abs(x), Ye / 2 - Math.abs(D)), j = l(at(x, D) - 0.12, 0, c(Z / 1));
    return e === "metal" && (j += X(x, D, ct, true) + X(x, D, Ct, false)), j;
  }
  function Fe(x, D, Z = false) {
    let j = [], z = [], ge = [];
    for (let Je = 0; Je <= D; Je++) for (let Mt = 0; Mt <= x; Mt++) {
      let dt = (Mt / x - 0.5) * vt, yt = (Je / D - 0.5) * Ye, wt = G(dt, yt);
      j.push(dt, wt, yt);
      let It = 1 + 0.035 * Math.sin(dt * 17.2 + yt * 14.7 + t) + 0.022 * Math.sin(dt * 71.4 + yt * 31.2), Bt = wt < -0.25 ? 0.94 + 0.065 * Math.sin(wt * 30) : 1, qt = new i42.Color(wt < -0.25 ? p.cut : e === "gas" ? 9145731 : p.earth).multiplyScalar(It * Bt);
      if (z.push(qt.r, qt.g, qt.b), Mt < x && Je < D) {
        let dn = Je * (x + 1) + Mt, In = dn + x + 1;
        ge.push(dn, In, dn + 1, In, In + 1, dn + 1);
      }
    }
    let xe = ie(new i42.BufferGeometry());
    xe.setAttribute("position", new i42.Float32BufferAttribute(j, 3)), xe.setAttribute("color", new i42.Float32BufferAttribute(z, 3)), xe.setIndex(ge), xe.computeVertexNormals(), xe.computeBoundingBox(), xe.computeBoundingSphere();
    let Me = new i42.Mesh(xe, fe.soil);
    Me.name = Z ? "continuous-city-terrain-far" : "continuous-city-terrain", Me.receiveShadow = true, (Z ? _.silhouette : _.terrain).add(Me);
  }
  n || (Fe(e === "metal" ? 286 : 130, e === "metal" ? 218 : 94), Fe(e === "metal" ? 86 : 26, e === "metal" ? 68 : 20, true));
  let P = (x, D, Z = p.blue, j = null) => F(_.silhouette, x, D, Z, "far", j, false), v = (x, D, Z, j = p.pale, z = null) => ve(_.silhouette, x, D, Z, j, "far", z, true);
  function k(x, D, Z, j, z = 0.055, ge = _.terrain) {
    let xe = G(x, D);
    return F(ge, [x, xe + z / 2 + 8e-3, D], [Z, z, j], p.concrete, "concrete"), xe + z + 8e-3;
  }
  function ee(x, D, Z, j = 0.15, z = p.yellow, ge = 0.38) {
    for (let Me of [0.48, 1]) $e(x, [D[0], D[1] + j * Me, D[2]], [Z[0], Z[1] + j * Me, Z[2]], 5e-3, z, "painted");
    let xe = Math.ceil(d(Z).distanceTo(d(D)) / ge);
    for (let Me = 0; Me <= xe; Me++) {
      let Je = d(D).lerp(d(Z), Me / Math.max(1, xe));
      $e(x, Je.toArray(), [Je.x, Je.y + j, Je.z], 6e-3, z, "painted");
    }
  }
  function ye(x, D, Z, j, z) {
    let ge = D[z], xe = Z[z];
    for (let [Me, Je] of j.sort((Mt, dt) => Mt[0] - dt[0])) {
      if (Me > ge) {
        let Mt = [...D], dt = [...Z];
        Mt[z] = ge, dt[z] = Math.min(Me, xe), dt[z] > Mt[z] && ee(x, Mt, dt, 0.23, p.yellow, 0.65);
      }
      ge = Math.max(ge, Je);
    }
    if (ge < xe) {
      let Me = [...D];
      Me[z] = ge, ee(x, Me, Z, 0.23, p.yellow, 0.65);
    }
  }
  function Ee(x, D, Z, j, z, ge = _.structures, xe = true) {
    F(ge, [x, D - 0.017, Z], [j, 0.033, z], p.dark, "steel");
    for (let Me of [-1, 1]) ee(ge, [x - j / 2, D, Z + Me * z / 2], [x + j / 2, D, Z + Me * z / 2]), ee(ge, [x + Me * j / 2, D, Z - z / 2], [x + Me * j / 2, D, Z + z / 2]);
    if (xe) for (let Me of [-j / 2 + 0.04, j / 2 - 0.04]) for (let Je of [-z / 2 + 0.04, z / 2 - 0.04]) $e(ge, [x + Me, G(x + Me, Z + Je) + 0.04, Z + Je], [x + Me, D, Z + Je], 0.035, p.dark, "steel", true);
  }
  function De(x, D, Z = 0.29, j = _.structures) {
    let z = Math.max(4, Math.ceil((D[1] - x[1]) / 0.048)), ge = D[0] - x[0], xe = D[2] - x[2], Me = Math.hypot(ge, xe), Je = Math.atan2(ge, xe), Mt = Math.cos(Je), dt = -Math.sin(Je);
    for (let yt = 0; yt < z; yt++) F(j, [l(x[0], D[0], (yt + 0.5) / z), l(x[1], D[1], (yt + 1) / z), l(x[2], D[2], (yt + 0.5) / z)], [Z, 0.022, Me / z + 0.012], p.trim, "steel", [0, Je, 0], false);
    for (let yt of [-1, 1]) {
      let wt = [x[0] + Mt * Z * 0.46 * yt, x[1], x[2] + dt * Z * 0.46 * yt], It = [D[0] + Mt * Z * 0.46 * yt, D[1], D[2] + dt * Z * 0.46 * yt];
      $e(j, wt, It, 0.022, p.dark, "steel", true), ee(j, wt, It);
    }
  }
  function ce(x, D = 0.041, Z = p.blueLight, j = _.equipment) {
    for (let z = 1; z < x.length; z++) $e(j, x[z - 1], x[z], D, Z);
    for (let z = 1; z < x.length - 1; z++) ae(j, x[z], [D * 1.07, D * 1.07, D * 1.07], Z);
  }
  function me(x, D, Z, j, z = p.asphalt, ge = "concrete", xe = 0.014) {
    let Me = d(D), Je = d(Z), Mt = Je.clone().sub(Me), dt = Mt.length();
    Mt.normalize();
    let yt = new i42.Vector3().crossVectors(f, Mt).normalize(), wt = new i42.Vector3().crossVectors(Mt, yt).normalize(), It = new i42.Quaternion().setFromRotationMatrix(new i42.Matrix4().makeBasis(yt, wt, Mt));
    F(x, Me.add(Je).multiplyScalar(0.5).toArray(), [j, xe, dt + 1e-3], z, ge, It, false);
  }
  function Te(x, D = 0.9, Z = true) {
    for (let j = 1; j < x.length; j++) {
      let z = x[j - 1], ge = x[j], xe = Math.hypot(ge[0] - z[0], ge[1] - z[1]), Me = Math.max(1, Math.ceil(xe / 0.75));
      for (let Je = 0; Je < Me; Je++) {
        let Mt = l(z[0], ge[0], Je / Me), dt = l(z[1], ge[1], Je / Me), yt = l(z[0], ge[0], (Je + 1) / Me), wt = l(z[1], ge[1], (Je + 1) / Me);
        me(_.roads, [Mt, G(Mt, dt) + 0.022, dt], [yt, G(yt, wt) + 0.022, wt], D), me(_.silhouette, [Mt, G(Mt, dt) + 0.025, dt], [yt, G(yt, wt) + 0.025, wt], D, p.asphalt, "far", 0.018);
      }
      if (Z) {
        let Je = Math.floor(xe / 0.58), Mt = Math.atan2(ge[0] - z[0], ge[1] - z[1]);
        for (let dt = 0; dt < Je; dt++) {
          let yt = l(z[0], ge[0], (dt + 0.5) / Je), wt = l(z[1], ge[1], (dt + 0.5) / Je);
          F(_.roads, [yt, G(yt, wt) + 0.034, wt], [0.018, 4e-3, 0.25], p.pale, "painted", [0, Mt, 0], false);
        }
      }
      j < x.length - 1 && ve(_.roads, [ge[0], G(...ge) + 0.023, ge[1]], D / 2, 0.014, p.asphalt, "concrete");
    }
  }
  function Ie(x, D, Z = 1.15, j = 3) {
    let z = d(x), ge = d(D), xe = ge.clone().sub(z), Me = xe.length(), Je = new i42.Vector3(-xe.z, 0, xe.x).normalize();
    for (let wt = 0; wt < j; wt++) {
      let It = (wt - (j - 1) / 2) * 0.13, Bt = z.clone().addScaledVector(Je, It), qt = ge.clone().addScaledVector(Je, It);
      ce([[Bt.x, G(Bt.x, Bt.z) + Z, Bt.z], [qt.x, G(qt.x, qt.z) + Z, qt.z]], 0.035 + 8e-3 * (wt % 2), wt % 3 ? p.trim : p.blueLight);
    }
    let Mt = Math.ceil(Me / 1.1), dt = n ? [-20, -0.42, 20] : e === "metal" ? [0, 7, 14, 21, 27.9] : [-24.9, -17.3, -8.8, -0.3, 8.2, 16.7, 24.65], yt = n ? [-12.35, -10, -4.55, 3.55, 10.65, 12] : e === "metal" ? [-14.4, -7, 0, 7, 13.9] : [-14.3, -7.55, -0.25, 7.35, 13.2];
    for (let wt = 0; wt <= Mt; wt++) {
      let It = z.clone().lerp(ge, wt / Mt), Bt = G(It.x, It.z);
      if (!(Math.abs(xe.x) > Math.abs(xe.z) ? dt.some((qt) => Math.abs(It.x - qt) < 0.65) : yt.some((qt) => Math.abs(It.z - qt) < 0.65))) {
        for (let qt of !n && e !== "metal" && Math.abs(xe.z) > Math.abs(xe.x) && x[0] > 23 ? [1] : [-1, 1]) {
          let dn = It.x + Je.x * 0.34 * qt, In = It.z + Je.z * 0.34 * qt;
          $e(_.structures, [dn, Bt + 0.03, In], [dn, Bt + Z - 0.06, In], 0.037, p.dark, "steel", true);
        }
        $e(_.structures, [It.x - Je.x * 0.42, Bt + Z - 0.06, It.z - Je.z * 0.42], [It.x + Je.x * 0.42, Bt + Z - 0.06, It.z + Je.z * 0.42], 0.04, p.blueLight, "steel", true);
      }
    }
  }
  let Ve = { buildingCount: 0, warehouseCount: 0, productionLines: 0 }, qe = [], Rt = [];
  function bt(x, D, Z = 3.2, j = 1.65, z = 0.9, { color: ge = p.blue, warehouse: xe = false, owner: Me = _.structures, doors: Je = 3, open: Mt = false } = {}) {
    Ve.buildingCount++, xe && Ve.warehouseCount++;
    let dt = k(x, D, Z + 0.14, j + 0.14, 0.05, Me === _.storage ? _.storage : _.terrain), yt = D + j / 2;
    Mt ? F(Me, [x, dt + 0.2, D - j / 2], [Z, 0.4, 0.065], p.concrete, "concrete") : (F(Me, [x, dt + z / 2, D], [Z, z, j], ge), F(Me, [x, dt + z * 0.8, yt + 8e-3], [Z * 0.89, 0.13, 0.02], p.glass, "glass", null, false), F(Me, [x, dt + 0.105, yt + 0.016], [Z, 0.21, 0.025], p.dark));
    for (let wt = 0, It = Math.max(4, Math.ceil(Z / 0.25)); wt <= It; wt++) {
      let Bt = x - Z / 2 + wt * Z / It;
      for (let qt of [-1, 1]) $e(Me, [Bt, dt, D + qt * j / 2], [Bt, dt + z, D + qt * j / 2], 0.019, p.blueLight, "steel", true);
    }
    for (let wt of [-1, 1]) for (let It = D - j / 2 + 0.15; It < yt; It += 0.27) F(Me, [x + wt * (Z / 2 + 0.01), dt + z / 2, It], [0.016, z, 9e-3], p.blueLight, "steel", null, false);
    re(Me, Be, [x, dt + z, D], [Z + 0.13, Math.min(0.32, Z * 0.075), j + 0.13], p.dark);
    for (let wt = D - j / 2 - 0.04; wt <= D + j / 2 + 0.04; wt += 0.18) $e(Me, [x - Z / 2 - 0.06, dt + z + 0.012, wt], [x, dt + z + Math.min(0.32, Z * 0.075) + 0.012, wt], 9e-3, p.blueLight), $e(Me, [x, dt + z + Math.min(0.32, Z * 0.075) + 0.012, wt], [x + Z / 2 + 0.06, dt + z + 0.012, wt], 9e-3, p.blueLight);
    if (!Mt) for (let wt = 0; wt < Je; wt++) {
      let It = x + (wt - (Je - 1) / 2) * Math.min(0.65, (Z - 0.2) / Je);
      F(Me, [It, dt + 0.26, yt + 0.025], [0.43, 0.52, 0.025], p.dark), F(Me, [It, dt + 0.25, yt + 0.043], [0.385, 0.475, 0.018], p.pale);
      for (let Bt = 1; Bt < 8; Bt++) F(Me, [It, dt + Bt * 0.058, yt + 0.053], [0.38, 5e-3, 5e-3], p.blueLight, "steel", null, false);
      for (let Bt of [-1, 1]) ve(Me, [It + Bt * 0.252, dt + 0.082, yt + 0.13], 0.014, 0.16, p.yellow, "painted", null, true);
    }
    for (let wt = x - Z * 0.3; wt <= x + Z * 0.3; wt += 0.66) {
      F(Me, [wt, dt + z + 0.21, D], [0.33, 0.1, 0.23], p.blueLight);
      for (let It = 0; It < 5; It++) F(Me, [wt - 0.12 + It * 0.06, dt + z + 0.267, D], [0.01, 0.01, 0.19], p.dark, "steel", null, false);
    }
    return P([x, dt + z / 2, D], [Z, z, j], ge), re(_.silhouette, Be, [x, dt + z, D], [Z + 0.1, Math.min(0.32, Z * 0.075), j + 0.1], p.dark, "far"), { x, z: D, y: dt, w: Z, d: j, h: z };
  }
  function kt(x, D, Z = 0.62, j = 1.45, z = _.storage, ge = 3) {
    let xe = k(x, D, Z * 2.4, Z * 2.4, 0.09, z);
    ve(z, [x, xe + j / 2, D], Z, j, p.pale, "painted"), ve(z, [x, xe + 0.06, D], Z * 1.05, 0.1, p.dark), ae(z, [x, xe + j, D], [Z, Z * 0.2, Z], p.trim);
    for (let Me = 1; Me <= ge; Me++) ve(z, [x, xe + j * Me / (ge + 1), D], Z * 1.012, 0.013, p.blueLight);
    for (let Me of [-1, 1]) $e(z, [x + Me * 0.065, xe, D + Z + 0.023], [x + Me * 0.065, xe + j + 0.09, D + Z + 0.023], 7e-3, p.trim);
    for (let Me = 0.05; Me <= j; Me += 0.085) $e(z, [x - 0.065, xe + Me, D + Z + 0.023], [x + 0.065, xe + Me, D + Z + 0.023], 6e-3, p.yellow, "painted");
    return ve(z, [x + Z * 0.25, xe + j + 0.05, D], 0.07, 0.09, p.dark), ce([[x + Z, xe + 0.21, D], [x + Z + 0.23, xe + 0.21, D], [x + Z + 0.23, xe + 0.28, D + 0.35]], 0.041, p.blueLight, z), v([x, xe + j / 2, D], Z, j, p.pale), { x, z: D, y: xe, h: j, r: Z };
  }
  function pe(x, D, Z = 4.4, j = 0.36) {
    let z = k(x, D, j * 3.3, j * 3.3, 0.12);
    ve(_.equipment, [x, z + Z / 2, D], j, Z, p.trim, "painted"), ae(_.equipment, [x, z + Z, D], [j, j * 0.65, j], p.trim), ve(_.equipment, [x, z + 0.16, D], j * 1.06, 0.32, p.dark);
    for (let ge = 0.35; ge < Z; ge += 0.35) ve(_.equipment, [x, z + ge, D], j * 1.016, 0.014, p.blueLight);
    for (let ge = 1; ge < Z - 0.2; ge += 1.2) Ee(x, z + ge, D, j * 3.6, j * 3.4, _.equipment, false);
    for (let ge of [-1, 1]) $e(_.equipment, [x + ge * 0.075, z, D + j * 1.84], [x + ge * 0.075, z + Z + 0.08, D + j * 1.84], 9e-3, p.trim);
    for (let ge = 0.04; ge <= Z; ge += 0.085) $e(_.equipment, [x - 0.075, z + ge, D + j * 1.84], [x + 0.075, z + ge, D + j * 1.84], 7e-3, p.yellow, "painted");
    for (let ge = 0.4; ge <= Z; ge += 0.45) rt(_.equipment, [x, z + ge, D + j * 1.84 + 0.05], 0.115, 6e-3);
    ce([[x, z + Z + 0.2, D], [x + j + 0.28, z + Z + 0.2, D], [x + j + 0.28, z + 0.57, D], [x + j + 0.72, z + 0.57, D + 0.42]], 0.058), v([x, z + Z / 2, D], j, Z, p.trim);
  }
  function gt(x, D, Z, j, z = 0.72, ge = p.ore) {
    let xe = _t(_.storage, "bulk-inventory-stockpile");
    xe.position.y = G(x, D) + 0.045;
    let Me = he("half-dome", () => new i42.SphereGeometry(1, 18, 7, 0, Math.PI * 2, 0, Math.PI / 2));
    re(xe, Me, [x, 0, D], [Z, z, j], ge, "soil");
    for (let Je = 0; Je < 30; Je++) {
      let Mt = Math.sqrt(o()), dt = o() * Math.PI * 2, yt = 0.06 + o() * 0.09;
      re(xe, Ce, [x + Math.cos(dt) * Z * Mt, Math.sqrt(1 - Mt * Mt) * z, D + Math.sin(dt) * j * Mt], [yt, yt * 0.62, yt * 1.2], new i42.Color(ge).multiplyScalar(0.85 + o() * 0.24), "soil", [o(), o(), o()]);
    }
    O.push({ kind: "group", object: xe }), re(_.silhouette, Me, [x, G(x, D) + 0.045, D], [Z, z, j], ge, "far");
  }
  function je(x, D, Z = 0.27, j = p.ore) {
    me(_.equipment, x, D, Z, p.rubber, "rubber", 0.035);
    let z = d(x), ge = d(D), xe = ge.clone().sub(z), Me = xe.length(), Je = new i42.Vector3(-xe.z, 0, xe.x).normalize();
    for (let Bt of [-1, 1]) {
      let qt = z.clone().addScaledVector(Je, Z * 0.56 * Bt), dn = ge.clone().addScaledVector(Je, Z * 0.56 * Bt);
      $e(_.equipment, qt.toArray(), dn.toArray(), 0.02, p.blueLight, "steel", true), $e(_.equipment, qt.clone().add(new i42.Vector3(0, -0.18, 0)).toArray(), dn.clone().add(new i42.Vector3(0, -0.18, 0)).toArray(), 0.015, p.dark, "steel", true);
      let In = Math.ceil(Me / 0.28);
      for (let Vn = 0; Vn < In; Vn++) {
        let Xi = qt.clone().lerp(dn, Vn / In), Ui = qt.clone().lerp(dn, (Vn + 1) / In);
        (Vn % 2 ? Xi : Ui).y -= 0.18, $e(_.equipment, Xi.toArray(), Ui.toArray(), 8e-3, p.trim);
      }
    }
    for (let Bt = 0; Bt <= Math.ceil(Me / 1.1); Bt++) {
      let qt = z.clone().lerp(ge, Bt / Math.ceil(Me / 1.1));
      if (!(e === "metal" && (Math.abs(qt.x) < 0.95 || Math.abs(qt.z - 7) < 0.95 || qt.z < 7.5 && [7, 14, 21, 27.4].some((dn) => Math.abs(qt.x - dn) < 0.65)))) for (let dn of [-1, 1]) {
        let In = qt.x + Je.x * Z * 0.62 * dn, Vn = qt.z + Je.z * Z * 0.62 * dn;
        $e(_.structures, [In, G(In, Vn) + 0.04, Vn], [In, qt.y - 0.05, Vn], 0.028, p.dark, "steel", true);
      }
    }
    me(_.silhouette, x, D, Z, p.dark, "far", 0.14);
    let Mt = ie(new i42.IcosahedronGeometry(0.032, 0)), dt = new Float32Array(Mt.attributes.position.count * 3);
    dt.fill(1), Mt.setAttribute("color", new i42.BufferAttribute(dt, 3));
    let yt = new i42.InstancedMesh(Mt, fe.soil, Math.max(12, Math.min(80, Math.floor(Me / 0.16))));
    yt.name = "city-conveyor-material";
    for (let Bt = 0; Bt < yt.count; Bt++) yt.setColorAt(Bt, new i42.Color(j));
    let wt = new i42.Matrix4(), It = (Bt) => {
      for (let qt = 0; qt < yt.count; qt++) {
        let dn = z.clone().lerp(ge, (qt / yt.count + Bt * 0.2 / Me) % 1);
        dn.y += 0.05, wt.compose(dn, h, new i42.Vector3(1.4, 0.7, 1)), yt.setMatrixAt(qt, wt);
      }
      yt.instanceMatrix.needsUpdate = true;
    };
    It(0), yt.computeBoundingBox(), yt.computeBoundingSphere(), yt.frustumCulled = false, _.effects.add(yt), b.push(It);
  }
  function Et(x, D, Z = 1.6) {
    let j = G(x, D);
    ve(_.structures, [x, j + Z / 2, D], 0.019, Z, p.trim, "steel", null, true), $e(_.structures, [x - 0.16, j + Z, D], [x + 0.16, j + Z, D], 0.015, p.dark);
    for (let z of [-1, 1]) F(_.structures, [x + 0.13 * z, j + Z - 0.04, D + 0.018], [0.16, 0.06, 0.072], p.pale, "lamp", [-0.3, 0, 0]);
  }
  let xt = Ug({ THREE: i42, type: e, seed: t, floating: false });
  xt.setVisualState({ running: false, storageFill: 1, construction: 1 }), xt.root.updateMatrixWorld(true), M.push(xt);
  let ft = e === "metal" ? new i42.Matrix4().makeTranslation(-1.9, 0, 0) : new i42.Matrix4();
  function Ot(x) {
    let D = `crop-${x.uuid}`;
    if (Q.has(D)) return Q.get(D);
    let Z = [], j = [], z = [], ge = x.attributes, xe = x.index?.count ?? ge.position.count;
    for (let Je = 0; Je < xe; Je += 3) {
      let Mt = [0, 1, 2].map((wt) => x.index ? x.index.getX(Je + wt) : Je + wt), dt = Mt.reduce((wt, It) => wt + ge.position.getX(It), 0) / 3, yt = Mt.reduce((wt, It) => wt + ge.position.getZ(It), 0) / 3;
      if (!(dt < -0.55 || dt > 3.96 || yt < -2.14 || yt > 2.1)) for (let wt of Mt) Z.push(ge.position.getX(wt), ge.position.getY(wt), ge.position.getZ(wt)), j.push(ge.normal.getX(wt), ge.normal.getY(wt), ge.normal.getZ(wt)), z.push(ge.color?.getX(wt) ?? 1, ge.color?.getY(wt) ?? 1, ge.color?.getZ(wt) ?? 1);
    }
    let Me = ie(new i42.BufferGeometry());
    return Me.setAttribute("position", new i42.Float32BufferAttribute(Z, 3)), Me.setAttribute("normal", new i42.Float32BufferAttribute(j, 3)), Me.setAttribute("color", new i42.Float32BufferAttribute(z, 3)), Me.computeBoundingBox(), Me.computeBoundingSphere(), Q.set(D, Me), Me;
  }
  function Zt(x, D, Z, j = 1, z = false) {
    let ge = e === "metal" && D === "structures" ? Ot(x.geometry) : x.geometry, xe = z ? fe.far : He(x.material), Me = (() => {
      let Bt = x;
      for (; Bt && Bt !== xt.root; ) {
        if (/stockpile|level-gauge|vessel-level/.test(Bt.name)) return "scale";
        if (/mineral-crates/.test(Bt.name)) return "crates";
        Bt = Bt.parent;
      }
      return "";
    })(), Je = `${D}:${ge.uuid}:${xe.uuid}:${Me}`;
    y.has(Je) || y.set(Je, { owner: _[D], geometry: ge, material: xe, name: `district-${x.name}`, items: [], fillName: Me });
    let Mt = y.get(Je), dt = Z.clone().multiply(ft).multiply(x.matrixWorld), yt = x.isInstancedMesh ? x.count : 1, wt = new i42.Matrix4(), It = new i42.Color();
    for (let Bt = 0; Bt < yt; Bt++) {
      let qt = dt.clone();
      x.isInstancedMesh && (x.getMatrixAt(Bt, wt), qt.multiply(wt)), x.isInstancedMesh && x.instanceColor ? x.getColorAt(Bt, It) : It.setRGB(1, 1, 1), Mt.items.push({ matrix: qt, color: It.clone().multiplyScalar(j), ordinal: Bt, sourceCount: yt });
    }
  }
  function Kt(x, D, Z = 0, j = "") {
    let z = G(x, D), ge = new i42.Matrix4().compose(new i42.Vector3(x, z, D), new i42.Quaternion().setFromAxisAngle(f, Z), new i42.Vector3(1, 1, 1)), xe = 0.95 + o() * 0.09;
    for (let Me of ["structures", "equipment", "storage"]) xt.groups[Me].traverse((Je) => {
      Je.isMesh && Zt(Je, Me, ge, xe);
    });
    xt.groups.silhouette.traverse((Me) => {
      Me.isMesh && Me.name !== "terrain-coarse" && Zt(Me, "silhouette", ge, xe, true);
    }), k(x + (e === "metal" ? 0.02 : 0), D, e === "metal" ? 4.35 : 5.85, 3.72, 0.026), Rt.push({ x, y: z, z: D, yaw: Z, name: j }), Ve.productionLines++, Ve.buildingCount += e === "crystal" ? 4 : 2, Ve.warehouseCount += e === "gas" ? 0 : 1;
  }
  function Qt() {
    for (let x of y.values()) {
      let D = new i42.InstancedMesh(x.geometry, x.material, x.items.length);
      D.name = x.name;
      for (let Z = 0; Z < x.items.length; Z++) D.setMatrixAt(Z, x.items[Z].matrix), D.setColorAt(Z, x.items[Z].color);
      D.instanceMatrix.needsUpdate = true, D.computeBoundingBox(), D.computeBoundingSphere(), D.castShadow = true, D.receiveShadow = true, x.owner.add(D), x.fillName && O.push({ kind: "pool", object: D, items: x.items, mode: x.fillName });
    }
  }
  function cn(x, D, Z, { mine: j = false, scale: z = 1, offset: ge = 0 } = {}) {
    let xe = xt.groups.vehicles.children.find((It) => j ? It.name === "haul-truck" : /product-loading-truck|finished-mineral-carrier|gas-product-transport/.test(It.name));
    if (!xe) return;
    let Me = _t(_.vehicles, j ? "city-mine-hauler" : "city-service-vehicle");
    Me.scale.setScalar(z);
    let Je = xe.matrixWorld.clone().invert();
    xe.traverse((It) => {
      if (It.isMesh) {
        let Bt = new i42.Mesh(It.geometry, He(It.material));
        Bt.matrix.copy(Je).multiply(It.matrixWorld), Bt.matrixAutoUpdate = false, Bt.castShadow = true, Bt.receiveShadow = true, Me.add(Bt);
      }
    });
    let Mt = Z.map((It) => [It[0], G(It[0], It[1]), It[1]]), dt = [0];
    for (let It = 1; It < Mt.length; It++) dt.push(dt.at(-1) + d(Mt[It]).distanceTo(d(Mt[It - 1])));
    let yt = dt.at(-1);
    V.push(...Mt);
    let wt = (It) => {
      let Bt = (It * (j ? 0.4 : 0.53) + ge) % (yt * 2), qt = 1;
      Bt > yt && (Bt = yt * 2 - Bt, qt = -1);
      let dn = 1;
      for (; dn < dt.length - 1 && dt[dn] < Bt; ) dn++;
      let In = a((Bt - dt[dn - 1]) / Math.max(1e-4, dt[dn] - dt[dn - 1])), Vn = Mt[dn - 1], Xi = Mt[dn], Ui = l(Vn[0], Xi[0], In), is = l(Vn[2], Xi[2], In), Ns = Math.atan2((Xi[0] - Vn[0]) * qt, (Xi[2] - Vn[2]) * qt), Ro = Math.sin(Ns) * 0.16, Kn = Math.cos(Ns) * 0.16, ai = -Math.atan2(G(Ui + Ro, is + Kn) - G(Ui - Ro, is - Kn), 0.32);
      Me.position.set(Ui, G(Ui, is) + 0.017, is), Me.rotation.set(ai, Ns, 0, "YXZ");
    };
    wt(0), b.push(wt), A.push(Me);
  }
  function vn(x, D, Z = 0, j = 1) {
    let z = xt.groups.vehicles.children.find((Me) => Me.name === "pit-crawler-excavator");
    if (!z) return;
    let ge = _t(_.vehicles, "city-crawler-excavator"), xe = z.matrixWorld.clone().invert();
    z.traverse((Me) => {
      if (Me.isMesh) {
        let Je = new i42.Mesh(Me.geometry, He(Me.material));
        Je.matrix.copy(xe).multiply(Me.matrixWorld), Je.matrixAutoUpdate = false, Je.castShadow = true, Je.receiveShadow = true, ge.add(Je);
      }
    }), ge.position.set(x, G(x, D) + 0.015, D), ge.rotation.y = Z, ge.scale.setScalar(j);
  }
  function gn(x, D, Z, j = 4) {
    let z = (x + D) / 2, ge = D - x, xe = G(z, Z);
    for (let Me = 0; Me < j; Me++) {
      let Je = Z + Me * 0.72;
      F(_.roads, [z, xe + 0.036, Je], [ge, 0.035, 0.37], 6711142, "concrete", null, false);
      for (let Mt of [-1, 1]) $e(_.roads, [x, xe + 0.066, Je + Mt * 0.085], [D, xe + 0.066, Je + Mt * 0.085], 0.012, p.trim, "steel", true);
      for (let Mt = x; Mt <= D; Mt += 0.16) F(_.roads, [Mt, xe + 0.055, Je], [0.043, 0.022, 0.26], p.dark, "steel", null, false);
      Me % 2 === 0 && mn(x + 2 + Me, Je, Math.min(17, Math.floor(ge / 0.85) - 3), e === "gas");
    }
  }
  function mn(x, D, Z = 12, j = false) {
    let z = G(x, D);
    for (let ge = 0; ge < Z; ge++) {
      let xe = x + ge * 0.7;
      F(_.equipment, [xe, z + 0.145, D], [0.61, 0.064, 0.24], p.dark, "steel");
      for (let Me of [-0.2, 0.2]) for (let Je of [-1, 1]) ve(_.equipment, [xe + Me, z + 0.083, D + Je * 0.115], 0.046, 0.022, p.rubber, "rubber", [Math.PI / 2, 0, 0], true);
      if (j) {
        ve(_.equipment, [xe, z + 0.283, D], 0.113, 0.44, p.pale, "painted", [0, 0, Math.PI / 2]);
        for (let Me of [-1, 1]) ae(_.equipment, [xe + Me * 0.22, z + 0.283, D], [0.065, 0.113, 0.113], p.pale, "painted");
      } else {
        F(_.equipment, [xe, z + 0.31, D], [0.54, 0.25, 0.235], ge % 5 === 0 ? p.red : p.blueLight);
        for (let Me = -0.23; Me < 0.25; Me += 0.07) F(_.equipment, [xe + Me, z + 0.31, D + 0.12], [0.01, 0.23, 0.014], p.trim, "steel", null, false);
      }
    }
  }
  function En(x, D, Z = 5, j = 2) {
    let z = G(x, D);
    for (let ge of [-1, 1]) for (let xe of [-0.27, 0.27]) $e(_.structures, [x + ge * Z / 2, z + 0.02, D + xe], [x + ge * (Z / 2 - 0.23), z + j, D + xe], 0.055, p.blue, "painted", true), F(_.structures, [x + ge * Z / 2, z + 0.12, D + xe], [0.4, 0.16, 0.2], p.dark, "steel");
    F(_.structures, [x, z + j + 0.1, D], [Z + 0.8, 0.23, 0.4], p.blue), ee(_.structures, [x - Z / 2, z + j + 0.22, D + 0.23], [x + Z / 2, z + j + 0.22, D + 0.23]), F(_.equipment, [x + 0.6, z + j - 0.1, D], [0.48, 0.18, 0.43], p.yellow);
    for (let ge of [0.48, 0.73]) $e(_.equipment, [x + ge, z + j - 0.17, D], [x + ge, z + 0.65, D], 6e-3, p.dark);
    F(_.equipment, [x + 0.6, z + 0.62, D], [0.37, 0.08, 0.18], p.yellow), P([x, z + j + 0.1, D], [Z + 0.8, 0.23, 0.4], p.blue);
    for (let ge of [-1, 1]) P([x + ge * (Z / 2 - 0.1), z + j / 2, D], [0.11, j, 0.5], p.blue);
  }
  function $t(x, D, Z = 8, j = 4) {
    k(x, D, Z, j, 0.035), bt(x - Z * 0.32, D, Z * 0.25, j * 0.52, 0.66, { doors: 2, color: p.blueLight });
    for (let z = 0; z < 2; z++) for (let ge = 0; ge < 3; ge++) {
      let xe = x - 0.6 + ge * 1.1, Me = D - 0.85 + z * 1.6, Je = G(xe, Me);
      F(_.equipment, [xe, Je + 0.29, Me], [0.55, 0.46, 0.67], p.blueLight);
      for (let Mt of [-1, 1]) for (let dt = 0; dt < 7; dt++) F(_.equipment, [xe + Mt * 0.33, Je + 0.25, Me - 0.27 + dt * 0.09], [0.06, 0.39, 0.035], p.dark, "steel", null, false);
      for (let Mt of [-0.15, 0.15]) {
        ve(_.equipment, [xe + Mt, Je + 0.69, Me], 0.028, 0.34, p.pale, "painted", null, true);
        for (let dt = 0; dt < 5; dt++) ve(_.equipment, [xe + Mt, Je + 0.56 + dt * 0.048, Me], 0.05, 0.017, p.trim, "painted", null, true);
      }
    }
    for (let z of [D - 1.45, D + 1.45]) $e(_.structures, [x - 0.9, G(x, z) + 0.02, z], [x - 0.9, G(x, z) + 1.42, z], 0.025, p.dark, "steel", true), $e(_.structures, [x + 3, G(x, z) + 0.02, z], [x + 3, G(x, z) + 1.42, z], 0.025, p.dark, "steel", true), $e(_.equipment, [x - 0.9, G(x, z) + 1.42, z], [x + 3, G(x, z) + 1.42, z], 0.017, p.trim);
  }
  function en(x, D, Z = 0.69, j = 2.1) {
    let z = k(x, D, Z * 2.3, Z * 2.3, 0.08), ge = [[Z, 0], [Z * 0.87, 0.25 * j], [Z * 0.63, 0.69 * j], [Z * 0.72, j]].map((Me) => new i42.Vector2(...Me)), xe = ie(new i42.LatheGeometry(ge, 24));
    re(_.equipment, xe, [x, z + 0.15, D], [1, 1, 1], p.pale, "concrete"), rt(_.equipment, [x, z + j + 0.15, D], Z * 0.72, 0.034, p.trim), ve(_.equipment, [x, z + j + 0.11, D], Z * 0.675, 0.014, p.dark, "rubber");
    for (let Me = 0; Me < 12; Me++) {
      let Je = Me * Math.PI / 6;
      $e(_.structures, [x + Math.cos(Je) * Z * 0.86, z, D + Math.sin(Je) * Z * 0.86], [x + Math.cos(Je) * Z, z + 0.29, D + Math.sin(Je) * Z], 0.026, p.dark, "steel", true);
    }
    v([x, z + j / 2, D], Z * 0.78, j, p.pale);
  }
  let nn = [0, 0.3, 0], on = [10.5, 0.4, -4], xn = [13, 0.4, 15.2], Jt = [13, 2, 9], C = [14, 0, 16], $ = [vt / 2 - 0.5, 0, 14];
  if (e === "metal") {
    for (let xe of [-11, -4, 3]) {
      let Me = 0;
      for (let Je of [3.5, 10.5, 17.5, 24.5]) xe === 3 && Je === 24.5 || (Kt(Je, xe, 0, "Ore crushing, screening and transfer"), Me++);
      qe.push({ name: `Ore processing avenue ${xe}`, kind: "production", productionLines: Me, bounds: [1.1, xe - 2.2, xe === 3 ? 19.7 : 26.7, xe + 2.2] });
    }
    bt(24, 2.4, 3.7, 1.8, 1.05, { doors: 3, color: p.blueLight });
    for (let xe of [0, 27.4]) Te([[xe, -20], [xe, 20]], xe === 0 ? 1.42 : 0.86);
    for (let xe of [7, 14, 21]) Te([[xe, -14.4], [xe, 7]], 0.86);
    for (let xe of [-14.4, -7, 0, 7]) Te([[0, xe], [27.4, xe]], xe === 7 ? 1.5 : 0.85);
    Te([[-27.7, 13.9], [27.4, 13.9]], 1.8), Te([[-27.7, 13.9], [-27.7, -20], [27.4, -20]], 0.85);
    let x = [], D = [], Z = [];
    for (let xe = 0; xe < se.length; xe++) {
      let Me = se[Math.max(0, xe - 1)], Je = se[Math.min(se.length - 1, xe + 1)], Mt = Je[0] - Me[0], dt = Je[2] - Me[2], yt = Math.hypot(Mt, dt);
      for (let wt of [-1, 1]) {
        let It = se[xe][0] - dt / yt * 0.405 * wt, Bt = se[xe][2] + Mt / yt * 0.405 * wt;
        x.push(It, G(It, Bt) + 0.012, Bt);
        let qt = new i42.Color(7366488);
        D.push(qt.r, qt.g, qt.b);
      }
      if (xe < se.length - 1) {
        let wt = xe * 2;
        Z.push(wt, wt + 1, wt + 2, wt + 1, wt + 3, wt + 2);
      }
    }
    let j = ie(new i42.BufferGeometry());
    j.setAttribute("position", new i42.Float32BufferAttribute(x, 3)), j.setAttribute("color", new i42.Float32BufferAttribute(D, 3)), j.setIndex(Z), j.computeVertexNormals(), j.computeBoundingBox(), j.computeBoundingSphere();
    let z = new i42.Mesh(j, fe.soil);
    z.name = "large-mine-continuous-haul-ramp", z.receiveShadow = true, _.roads.add(z);
    for (let xe = 3; xe < se.length - 3; xe += 4) {
      let Me = se[xe], Je = se[xe + 1], Mt = Je[0] - Me[0], dt = Je[2] - Me[2], yt = Math.hypot(Mt, dt), wt = Me[0] - dt / yt * 0.46, It = Me[2] + Mt / yt * 0.46;
      F(_.structures, [wt, G(wt, It) + 0.048, It], [0.1, 0.09, 0.095], xe % 3 ? p.pale : p.yellow);
    }
    for (let xe = 0; xe < 170; xe++) {
      let Me = o() * Math.PI * 2, Je = 1.01 + o() * 0.05, Mt = ct.x + Math.cos(Me) * ct.rx * Je, dt = ct.z + Math.sin(Me) * ct.rz * Je, yt = 0.09 + o() * 0.15;
      Math.abs(dt) < 13.2 && re(_.terrain, Ce, [Mt, G(Mt, dt) + yt * 0.3, dt], [yt * 1.4, yt * 0.65, yt], p.cut, "soil", [o(), o(), o()]);
    }
    for (let xe of [[-14.1, -1.8, 1.8], [-16.8, -0.1, -0.5], [-14.8, 1, 2.8], [-19, -17.1, 0.7]]) vn(...xe, 1.12);
    let ge = se.map((xe) => [xe[0], xe[2]]).reverse();
    ge.push([-3.25, -3.56], [-1.55, -5.33], [0.88, -5.33]);
    for (let xe of [0, 11, 24, 37]) cn(0, 0, ge, { mine: true, scale: 1.12, offset: xe });
    je([-7.5, 1.05, -8], [1.63, 0.73, -12.33], 0.3), je([5, 0.95, 5], [10, 1.72, 10], 0.32), je([12.8, 0.85, 5], [15.6, 1.82, 10.3], 0.32), je([20, 0.86, 5], [22.5, 1.65, 10.5], 0.32);
    for (let xe of [9.5, 15.8, 22.1]) gt(xe, 10.05, 2.25, 1.55, 0.91), En(xe, 10.05, 5.6, 2.1);
    bt(3.5, 10.1, 4.25, 2.9, 1.55, { doors: 4, color: p.blueLight }), qe.push({ name: "Central blending and bulk stockyard", kind: "storage", stockpiles: 3, bounds: [0.9, 8.2, 25.1, 12.3] });
    for (let xe of [16, 18.6]) for (let Me of [-24.1, -19.4, -14.7, -10, -5.3]) bt(Me, xe, 3.8, 1.55, 0.9 + (Math.round(Me) % 2 ? 0.1 : 0), { warehouse: xe > 17, owner: xe > 17 ? _.storage : _.structures, doors: 4 });
    Te([[-27.4, 17.4], [-1.1, 17.4]], 0.8), Te([[-27.4, 20], [-1.1, 20]], 0.72), qe.push({ name: "Mine maintenance town and spare-parts depots", kind: "maintenance", buildings: 10, bounds: [-26.2, 15.1, -3.1, 19.5] });
    for (let xe of [2.5, 7.8, 13.1, 18.4, 23.7]) bt(xe, 15.4, 4.4, 1.5, 1.03, { warehouse: true, owner: _.storage, doors: 5 });
    gn(0.8, 23.8, 17, 5);
    for (let xe of [6, 17.5]) En(xe, 18, 5.4, 1.8);
    qe.push({ name: "Rail export terminal and finished-ore warehouses", kind: "logistics", buildings: 5, railTracks: 5, bounds: [0.5, 14.5, 27.7, 20.2] }), $t(5, -17, 8.2, 4);
    for (let xe of [12, 14, 16]) en(xe, -17.2, 0.77, 2.5);
    bt(20.9, -17, 6.1, 3.1, 1.7, { color: p.blueLight, doors: 6 });
    for (let xe of [18.5, 20, 21.5]) ve(_.equipment, [xe, 2.35, -18], 0.18, 3.1, p.trim);
    qe.push({ name: "Central power, water and heavy maintenance", kind: "utilities", buildings: 2, coolingTowers: 3, bounds: [0.6, -19.3, 24.2, -14.8] });
    for (let xe of [-11, -4, 3]) Ie([1, 0, xe + 2.35], [xe === 3 ? 20.2 : 26.7, 0, xe + 2.35], 1.02, 2);
    for (let xe of [0, 9, 22]) cn(0, 0, [[0, 13.9], [27.4, 13.9], [27.4, -14.4], [0, -14.4]], { offset: xe });
    nn = [-0.2, -0.3, 0.1], on = [10.5, 0.53, -4], xn = [13.2, 0.65, 17.2], Jt = [-15.1, -1.3, -1.1], C = [13, 0, 16.6], $ = [28.4, 0, 13.9];
  } else if (n) {
    for (let x of Ht) {
      F(_.terrain, [x.x, x.y - 0.19, x.z], [x.w, 0.38, x.d], p.dark, "steel");
      for (let D = x.x - x.w / 2 + 0.56; D < x.x + x.w / 2; D += 1.1) for (let Z = x.z - x.d / 2 + 0.58; Z < x.z + x.d / 2; Z += 1.13) F(_.terrain, [D, x.y + 0.01, Z], [1.075, 0.025, 1.104], new i42.Color(p.blueLight).multiplyScalar(0.85 + o() * 0.15), "painted", null, false);
      for (let D of [-1, 1]) {
        let Z = x.x + D * (x.w / 2 - 0.15);
        F(_.structures, [Z, x.y - 0.91, x.z], [0.44, 0.37, x.d - 0.2], p.blue);
        let j = x.x === 0 ? [[-11.45, -8.55], [10.55, 13.45]] : x.x < 0 && D > 0 || x.x > 0 && D < 0 ? [[x.z - 1.45, x.z + 1.45]] : x.z > 0 ? [[10.95, 13.05]] : [];
        ye(_.perimeter, [Z, x.y + 0.026, x.z - x.d / 2 + 0.1], [Z, x.y + 0.026, x.z + x.d / 2 - 0.1], j, 2);
        for (let z = x.z - x.d / 2 + 0.2; z < x.z + x.d / 2 - 0.6; z += 1) $e(_.structures, [Z, x.y - 0.19, z], [Z, x.y - 1.03, z + 0.94], 0.064, p.trim, "steel", true), $e(_.structures, [Z, x.y - 1.03, z], [Z, x.y - 0.19, z + 0.94], 0.048, p.blueLight, "steel", true);
        F(_.structures, [x.x + D * (x.w / 2 + 0.35), x.y - 1.4, x.z], [0.78, 1.2, x.d * 0.77], p.blue);
      }
      for (let D of [-1, 1]) {
        let Z = x.x !== 0 && (x.z < 0 && D > 0 || x.z > 0 && D < 0) ? [[x.x - 2.56, x.x + 2.56]] : x.x === 0 && D < 0 ? [[-0.95, 0.11]] : [];
        ye(_.perimeter, [x.x - x.w / 2 + 0.1, x.y + 0.026, x.z + D * (x.d / 2 - 0.12)], [x.x + x.w / 2 - 0.1, x.y + 0.026, x.z + D * (x.d / 2 - 0.12)], Z, 0);
      }
      for (let D = x.z - x.d / 2 + 0.7; D < x.z + x.d / 2; D += 1.6) $e(_.structures, [x.x - x.w / 2 + 0.1, x.y - 0.76, D], [x.x + x.w / 2 - 0.1, x.y - 0.76, D], 0.09, p.blueLight, "steel", true);
      for (let D of [-1, 1]) for (let Z of [-1, 1]) {
        let j = x.x + D * (x.w / 2 - 1.1), z = x.z + Z * (x.d / 2 - 1.2);
        ve(_.equipment, [j, x.y - 0.86, z], 0.65, 0.86, p.blue, "painted"), ve(_.equipment, [j, x.y - 1.37, z], 0.52, 0.18, p.dark), rt(_.equipment, [j, x.y - 1.48, z], 0.56, 0.035);
        let ge = _t(_.effects, "large-platform-stabilizer");
        ge.position.set(j, x.y - 1.5, z);
        for (let xe = 0; xe < 7; xe++) F(ge, [Math.cos(xe * Math.PI * 2 / 7) * 0.22, 0, Math.sin(xe * Math.PI * 2 / 7) * 0.22], [0.43, 0.035, 0.08], p.trim, "steel", [0, -xe * Math.PI * 2 / 7, 0.1]);
        ve(ge, [0, 0, 0], 0.09, 0.055, p.dark), b.push((xe) => {
          ge.rotation.y = xe * 1.2 * D;
        });
      }
      P([x.x, x.y - 0.35, x.z], [x.w, 0.7, x.d], p.dark);
      for (let D of [-1, 1]) P([x.x + D * (x.w / 2 + 0.32), x.y - 1.3, x.z], [0.74, 1.05, x.d * 0.77], p.blue);
      qe.push({ name: x.name, kind: "floating-production-deck", bounds: [x.x - x.w / 2, x.z - x.d / 2, x.x + x.w / 2, x.z + x.d / 2], height: x.y });
    }
    for (let x of de) {
      let D = x.axis === "x" ? 0.26 : 0;
      if (x.axis === "x") for (let j = 0; j < 12; j++) {
        let z = x.x - x.w / 2 + j * x.w / 12, ge = x.x - x.w / 2 + (j + 1) * x.w / 12;
        me(_.terrain, [z, G(z, x.z) - 0.065, x.z], [ge, G(ge, x.z) - 0.065, x.z], x.d, p.blue, "steel", 0.13);
      }
      else F(_.terrain, [x.x, D - 0.1, x.z], [x.w, 0.2, x.d], p.blue);
      for (let Z of [-1, 1]) x.axis === "x" ? ($e(_.structures, [x.x - x.w / 2, -0.55, x.z + Z * x.d / 2], [x.x + x.w / 2, -0.06, x.z + Z * x.d / 2], 0.09, p.dark, "steel", true), ee(_.perimeter, [x.x - x.w / 2, G(x.x - x.w / 2, x.z), x.z + Z * x.d / 2], [x.x + x.w / 2, G(x.x + x.w / 2, x.z), x.z + Z * x.d / 2], 0.22)) : ee(_.perimeter, [x.x + Z * x.w / 2, 0, x.z - x.d / 2], [x.x + Z * x.w / 2, 0, x.z + x.d / 2], 0.22);
      P([x.x, D - 0.1, x.z], [x.w, 0.2, x.d], p.blue);
    }
    for (let x of [-8.8, -0.7, 7.4]) for (let D of [-5.1, 4.2]) x === -8.8 && D === -5.1 || Kt(D, x, 0, "Central gas treatment train");
    for (let x of [-20, 20]) for (let D of [-10, 12]) {
      for (let Z of [D - 3.8, D + 3.8]) for (let j of [x - 3.85, x + 3.85]) Kt(j, Z);
      Te([[x, D - 8.15], [x, D + 8.15]], 0.93), Te([[x - 7.4, D], [x + 7.4, D]], 0.96), Ie([x - 7, 0, D + 6.5], [x + 7, 0, D + 6.5], 1.16, 3);
    }
    for (let x of [-12.35, -4.55, 3.55, 10.65]) Te([[-10.6, x], [10.65, x]], 0.93);
    Te([[-0.42, -14.1], [-0.42, 10.65]], 1.18);
    for (let x of [-10, 12]) Te([[-27.3, x], [-11.2, x]], 0.93), Te([[11.2, x], [27.3, x]], 0.93);
    Te([[-11.2, -10], [-10.4, -10], [-10.4, -12.35]], 0.65), Te([[10.4, -12.35], [10.4, -10], [11.2, -10]], 0.65), Te([[-11.2, 12], [-10.4, 12], [-10.4, 13.5], [10.4, 13.5], [10.4, 12], [11.2, 12]], 0.6);
    for (let x of [-10.4, 10.4]) Te([[x, 10.65], [x, 13.5]], 0.6);
    for (let x of [-20, 20]) Te([[x, -2], [x, 4]], 1);
    for (let x of [-8.2, -4.1, 0, 4.1, 8.2]) bt(x, 12.1, 3.45, 1.82, 1.08, { warehouse: true, owner: _.storage, doors: 4 });
    for (let x of [-10.7, -6.9, -3.1]) pe(8.9, x, x === -6.9 ? 5.6 : 4.65, 0.36);
    for (let x of [-8, -5.85, -3.7]) kt(x, -8.6, 0.57, 1.55);
    bt(-5.85, -10.9, 3.5, 1.25, 0.72, { color: p.blueLight, doors: 3 }), qe.push({ key: "floating-inlet-control", name: "Central reserve tanks and inlet control", kind: "operations", buildings: 1, centralStorageTanks: 3, bounds: [-8.9, -11.6, -2.6, -7.7] }), Ie([-9.7, 0, -13.3], [9.7, 0, -13.3], 1.2, 4), Ie([9.65, 0, -13.3], [9.65, 0, 10.25], 1.2, 4);
    for (let x of [-20, 20]) for (let D = 0; D < 5; D++) {
      let Z = x - 3 + D * 1.5, j = 2.85;
      ce([[Z, -0.3, j - 3], [Z, -1.5, j - 3], [Z, -2.1, j], [Z, -6.7 - D % 3 * 1.1, j]], 0.18, p.blueLight), ve(_.equipment, [Z, -7 - D % 3 * 1.1, j], 0.3, 0.69, p.dark);
      for (let z = 0; z < 5; z++) ve(_.equipment, [Z, -6.76 - D % 3 * 1.1 - z * 0.105, j], 0.32, 0.035, p.blue, "painted", null, true);
      v([Z, -4.7 - D % 3 * 0.55, j], 0.18, 5 + D % 3 * 1.1, p.blueLight);
    }
    for (let x of [-20, 20]) En(x, 1, 3.6, 2.1);
    for (let x of [[-6, -12.35, 0], [6, 13.5, 17], [-20, -10, 5], [20, 12, 13]]) cn(0, 0, x[0] === -20 || x[0] === 20 ? [[x[0] - 6.8, x[1]], [x[0] + 6.8, x[1]]] : [[-9.6, x[1]], [9.6, x[1]]], { offset: x[2] });
    qe.push({ name: "Central warehouse and bridge-loading exchange", kind: "logistics", buildings: 5, loadingCranes: 2, bounds: [-10.5, 10.6, 10.5, 13.4] }), nn = [0, -0.55, 1.1], on = [4.2, 0.95, -0.7], xn = [0, 0.95, 11.8], Jt = [8.9, 2.4, -6.9], C = [0, 0.52, 10.5], $ = [27.6, 0, 12];
  } else {
    let x = [-21, -13, -4.5, 4, 12.5, 21], D = [-11.2, -3.9, 3.4], Z = (j, z) => z !== 3.4 || e === "crystal" && j < 0;
    for (let j of D) {
      let z = x.filter((ge) => Z(ge, j));
      for (let ge of z) Kt(ge, j, 0, e === "gas" ? "Gas treatment and fractionation train" : "Mineral sorting and purification line");
      z.length && qe.push({ key: `process-${j}`, name: `${e === "gas" ? "Gas treatment" : "Mineral refining"} district ${j}`, kind: "production", productionLines: z.length, bounds: [-24, j - 2.2, j === 3.4 ? -1.4 : 24.2, j + 2.2] });
    }
    for (let j of [-24.9, 24.65]) Te([[j, -18.1], [j, 18.12]], 0.86);
    for (let j of [-17.3, -8.8, -0.3, 8.2, 16.7]) Te([[j, -14.3], [j, e === "crystal" && j === 8.2 || e === "gas" && j === 16.7 ? -0.25 : 7.35]], j === -0.3 ? 1.38 : 0.86);
    for (let j of [-14.3, -7.55, -0.25, 7.35, 13.2]) Te([[-24.9, j], [24.65, j]], j === 13.2 ? 1.6 : j === 7.35 ? 1.5 : j === -14.3 ? 1.35 : 0.94);
    for (let j of D) {
      let z = x.filter((ge) => Z(ge, j));
      if (z.length) {
        Ie([-24, 0, j + 2.38], [e === "crystal" && j === 3.4 ? -1.2 : 24.3, 0, j + 2.38], 1.13, e === "gas" ? 3 : 2);
        for (let ge of z) ce([[ge + 2.52, 0.73, j - 0.1], [ge + 2.52, 1.13, j - 0.1], [ge + 2.52, 1.13, j + 2.38]], 0.037);
      }
    }
    if (Ie([24.3, 0, -14], [24.3, 0, 11.1], 1.2, 3), e === "gas") {
      for (let j of [10.1, 13.7, 17.3, 20.9]) for (let z of [1.35, 3.4, 5.45]) kt(j, z, 0.59, 1.54);
      bt(-20.7, 3.4, 5.6, 2.65, 1.3, { doors: 5, color: p.blueLight }), bt(-12.8, 3.4, 6, 2.65, 1.22, { doors: 6, color: p.blue }), $t(-4.9, 3.4, 5.5, 3), bt(3.4, 3.4, 4.1, 2.7, 1.1, { doors: 4, color: p.blueLight }), qe.push({ key: "compression-service", name: "Compressor maintenance, utility yard and control", kind: "maintenance", buildings: 4, bounds: [-23.8, 1.65, 5.6, 5.65] }), qe.push({ key: "reserve-bund", name: "Twelve-tank contained product reserve", kind: "storage", centralStorageTanks: 12, bounds: [8.95, 0.4, 22.38, 6.3] });
      for (let j of [-6.8, -4.2, -1.6]) pe(j, -16.45, 4.6 + (j > -2 ? 0.75 : 0), 0.36);
      bt(3.4, -16.6, 5.15, 2.15, 1.22, { color: p.blueLight, doors: 5 }), $t(10.65, -16.55, 6, 2.55);
      for (let j of [17, 19.3, 21.6]) en(j, -16.4, 0.73, 2.2);
      qe.push({ key: "central-utilities", name: "Central fractionation, power and cooling", kind: "utilities", buildings: 2, distillationLandmarks: 3, coolingTowers: 3, bounds: [-8, -18.4, 23.2, -14.3] });
      for (let j of [-7.4, -2.2, 3, 8.2, 13.4, 18.6, 22.7]) bt(j, 10.2, j > 20 ? 2.7 : 4.35, 2, 1.15, { warehouse: true, owner: _.storage, doors: 5 });
      qe.push({ key: "dispatch", name: "Pressure-product dispatch warehouses and tanker staging", kind: "storage", buildings: 7, bounds: [-24, 8.7, 24.2, 11.6] }), Jt = [-4.2, 2.2, -16.4];
    } else {
      bt(8.25, 2.9, 10, 2.5, 1.5, { doors: 8, color: p.blueLight }), bt(3.1, 5.1, 2, 1.1, 0.73, { doors: 2, color: p.blue }), bt(13.45, 5.1, 2, 1.1, 0.73, { doors: 2, color: p.blue }), bt(21, 3.35, 3.5, 1.85, 1.05, { doors: 3, color: p.blueLight }), qe.push({ key: "finishing-laboratories", name: "Main crystal finishing hall and assay laboratories", kind: "finishing", buildings: 3, bounds: [1.9, 1.5, 14.6, 5.9] }), qe.push({ key: "operations", name: "Control building and visitor forecourt", kind: "operations", buildings: 1, bounds: [18.9, 2.1, 23, 5.9] });
      for (let j of [-22.1, -17.9, -13.7, -9.5]) gt(j, -16.55, 1.7, 1.3, 0.76, p.crystal), bt(j, -16.55, 3.8, 2.9, 1.1, { warehouse: true, owner: _.storage, open: true });
      bt(-3, -16.6, 7.4, 2.25, 1.55, { doors: 7, color: p.blueLight });
      for (let j of [2, 3.8, 5.6]) pe(j, -16.6, 3.7 + (j === 3.8 ? 0.6 : 0), 0.32);
      $t(11.25, -16.6, 6, 2.4);
      for (let j of [18.4, 20.7, 23]) en(j, -16.6, 0.67, 2);
      qe.push({ key: "feed-purification", name: "Covered feedstock, central purification and utilities", kind: "utilities", buildings: 6, stockpiles: 4, distillationLandmarks: 3, coolingTowers: 3, bounds: [-24.2, -18.4, 24.2, -14.6] });
      for (let j of [-22, -17, -11.7, -6.4, -1.1, 4.2, 9.5, 14.8, 20.6]) bt(j, 10.25, 4.4, 2.05, 1.08 + (j > 15 ? 0.2 : 0), { warehouse: true, owner: _.storage, doors: 5 });
      qe.push({ key: "finished-warehouses", name: "Sealed-mineral export warehouses", kind: "storage", buildings: 9, bounds: [-24.3, 8.9, 23.1, 11.6] }), Jt = [3.8, 1.5, -16.5];
    }
    gn(-24.2, 20.7, 14.55, 5);
    for (let j of [-16, -5, 6, 17]) En(j, 15.75, 5.1, 1.95);
    qe.push({ key: "rail-yard", name: "Marshalling yard and rail-loading cranes", kind: "logistics", railTracks: 5, loadingCranes: 4, bounds: [-24.5, 14.1, 24.5, 18.3] });
    for (let j of [0, 11, 24, 39, 55]) cn(0, 0, [[-24.9, 13.2], [24.65, 13.2], [24.65, -14.3], [-24.9, -14.3]], { offset: j });
    on = [4, 0.6, -3.9], xn = [5, 0.4, 14.9], nn = [0, 0.55, 0], C = [5, 0, 13.2], $ = [25.5, 0, 13.2];
  }
  if (n) for (let x of Ht) for (let D of [-1, 1]) Et(x.x + D * (x.w / 2 - 0.45), x.z + 1.55, 1.55);
  else {
    for (let x = -vt / 2 + 2; x < vt / 2 - 1; x += 3.8) Et(x, e === "metal" ? 12.88 : 12.32);
    for (let x = -Ye / 2 + 2; x < Ye / 2 - 1; x += 4.2) (e === "metal" ? [7, 13.9, 18.44] : [7.35, 13.2, 15.99]).some((D) => Math.abs(x - D) < 1.15) || Et(vt / 2 - (e === "metal" ? 1.05 : 0.74), x);
  }
  let Oe = Bg({ THREE: i42, type: e, floating: n, groups: _, C: p, M: fe, own: ie, box: F, beam: $e, cylinder: ve, strip: me, road: Te, rail: ee, hall: bt, pipe: ce, tank: kt, slab: k, farBox: P, H: G, rand: o, nominalWidth: vt, nominalDepth: Ye, mainPit: ct, mineRoad: se, decks: Ht, bridges: de, districts: qe, counts: Ve }), Ke = { "Central blending and bulk stockyard": "\u914D\u77FF\u5806\u573A", "Mine maintenance town and spare-parts depots": "\u68C0\u4FEE\u4E0E\u5907\u4EF6", "Rail export terminal and finished-ore warehouses": "\u94C1\u8DEF\u88C5\u8F66\u533A", "Central power, water and heavy maintenance": "\u52A8\u529B\u4E0E\u673A\u4FEE", "entry-operations": "\u63A7\u5236\u4E0E\u95E8\u5C97", "finishing-laboratories": "\u7CBE\u52A0\u5DE5\u4E3B\u5382\u623F", operations: "\u8FD0\u8425\u63A7\u5236\u533A", "feed-purification": "\u539F\u6599\u4E0E\u516C\u7528\u5DE5\u7A0B", "finished-warehouses": "\u6210\u54C1\u4ED3\u50A8", "compression-service": "\u538B\u7F29\u673A\u68C0\u4FEE", "reserve-bund": "\u96C6\u4E2D\u56F4\u5830\u7F50\u533A", "central-utilities": "\u7CBE\u998F\u4E0E\u52A8\u529B", dispatch: "\u88C5\u8FD0\u4ED3\u50A8", "rail-yard": e === "gas" ? "\u94C1\u8DEF\u69FD\u8F66\u533A" : "\u94C1\u8DEF\u96C6\u914D\u573A", "inlet-metering": "\u8FDB\u6C14\u8BA1\u91CF\u533A", "main-checkpoint": "\u4E3B\u5165\u53E3", "Central process spine": "\u4E2D\u592E\u7CBE\u70BC\u7532\u677F", "West inlet deck": "\u897F\u8FDB\u6C14\u7532\u677F", "West product deck": "\u897F\u4EA7\u54C1\u7532\u677F", "East inlet deck": "\u4E1C\u8FDB\u6C14\u7532\u677F", "East product deck": "\u4E1C\u4EA7\u54C1\u7532\u677F", "floating-inlet-control": "\u8FDB\u6C14\u63A7\u5236\u4E0E\u50A8\u7F50", "Central warehouse and bridge-loading exchange": "\u4ED3\u50A8\u4EA4\u6362\u533A", "east-main-dock": "\u4E3B\u505C\u9760\u53E3", "west-freight-dock": "\u897F\u8D27\u8FD0\u53E3" }, tt = 0;
  for (let x of qe) {
    if (!x.position && Array.isArray(x.bounds)) {
      let D = (x.bounds[0] + x.bounds[2]) / 2, Z = (x.bounds[1] + x.bounds[3]) / 2;
      x.position = [D, (x.height ?? G(D, Z)) + 0.45, Z];
    }
    x.label = Ke[x.key] || Ke[x.name] || (x.kind === "production" ? `${e === "metal" ? "\u7834\u788E\u7B5B\u5206" : e === "gas" ? "\u5206\u79BB\u538B\u7F29" : "\u5206\u9009\u52A0\u5DE5"}${["\u4E00", "\u4E8C", "\u4E09"][tt++]}\u533A` : x.name);
  }
  Qt(), Qe(), u.traverse((x) => {
    x.isInstancedMesh && S.add(x);
  });
  let it = _t(_.effects, "city-construction-markers");
  F(it, [0, 0.18, 0], [0.05, 0.36, 0.05], p.yellow), Qe(), u.updateMatrixWorld(true);
  let Ge = new i42.Box3().setFromObject(u);
  for (let x of V) Ge.expandByPoint(new i42.Vector3(x[0] - 0.43, x[1] - 0.14, x[2] - 0.43)), Ge.expandByPoint(new i42.Vector3(x[0] + 0.43, x[1] + 0.61, x[2] + 0.43));
  let Dt = { min: Ge.min.toArray(), max: Ge.max.toArray() }, Vt = [[Ge.min.x, Ge.min.z], [Ge.max.x, Ge.min.z], [Ge.max.x, Ge.max.z], [Ge.min.x, Ge.max.z]], Tt = Ge.max.x - Ge.min.x, Xt = Ge.max.z - Ge.min.z, U = e === "metal" ? 8.600000381469727 : n ? 6.550000190734863 : 6.150000095367432, be = e === "metal" ? 5.599999904632568 : n ? 4.45439600944519 : 4.199999809265137, Le = U * be, w = Tt * Xt, I = n ? [55, 47, 63] : e === "metal" ? [51, 50, 57] : [46, 44, 54], H = (x, D) => ({ eye: x.map((Z, j) => Z + D[j]), target: x }), L = { whole: { eye: I, target: nn }, close: e === "metal" ? { eye: [-18.8, 4.3, 8.1], target: [-14.5, -2.6, -0.9] } : H(on, [7.9, 5.3, 8.6]), process: H(on, [-8.5, 6.3, 9.6]), logistics: H(xn, [11.8, 7.7, 12.8]), storage: H(xn, [11.8, 7.7, 12.8]), landmark: H(Jt, e === "metal" ? [19.5, 15.7, 17.5] : [10.6, 6.2, 10.8]), underside: { eye: [49, -8.5, 47], target: [0, -3, 1.8] } };
  Object.assign(L, Oe.views);
  let q = (x, D = [0, 1, 0]) => ({ position: x, normal: D }), J = { ground: q([0, 0, 0]), view: q(I, d(nn).sub(d(I)).normalize().toArray()), loading: q(C, [0, 0, 1]), storage: q(xn, [0, 0, 1]), entry: q($, [1, 0, 0]) };
  Object.assign(J, Oe.anchors), Oe.anchors.mainEntry && (J.entry = { ...Oe.anchors.mainEntry });
  let Se = false, _e = 0, Re = "near", We = true, Ze = { running: true, activity: 1, construction: 1, storageFill: 0.5 }, nt = new i42.Matrix4();
  function T() {
    let x = Re === "near";
    u.visible = We, _.terrain.visible = x, _.roads.visible = x, _.edgeTerrain.visible = x, _.perimeter.visible = x && Ze.construction >= 0.12, _.structures.visible = x && Ze.construction >= 0.18, _.equipment.visible = x && Ze.construction >= 0.42, _.storage.visible = We && x && Ze.construction >= 0.65, _.vehicles.visible = x && Ze.construction >= 0.95, _.effects.visible = x, _.silhouette.visible = !x, it.visible = x && Ze.construction < 0.95;
    for (let D of _.effects.children) D !== it && (D.visible = x && Ze.construction >= 0.9);
  }
  function N(x = {}) {
    if (!Se) {
      typeof x.running == "boolean" && (Ze.running = x.running);
      for (let D of ["activity", "construction", "storageFill"]) Number.isFinite(x[D]) && (Ze[D] = a(x[D]));
      for (let D of O) if (D.kind === "group") D.object.scale.y = 0.05 + Ze.storageFill * 0.95;
      else {
        for (let Z = 0; Z < D.items.length; Z++) {
          let j = D.items[Z], z = D.mode === "crates" ? j.ordinal < Math.ceil(Ze.storageFill * j.sourceCount) ? 1 : 0 : 0.035 + Ze.storageFill * 0.965;
          nt.copy(j.matrix).scale(new i42.Vector3(D.mode === "crates" ? z : 1, z, D.mode === "crates" ? z : 1)), D.object.setMatrixAt(Z, nt);
        }
        D.object.instanceMatrix.needsUpdate = true;
      }
      fe.lamp.emissiveIntensity = Ze.running ? 0.18 + 0.28 * Ze.activity : 0.03, T();
    }
  }
  function te(x, { visible: D = true, detail: Z = "near", animate: j = true } = {}) {
    if (!Se && (We = !!D, Re = Z === "far" ? "far" : "near", T(), !(!D || Re === "far" || !j || !Ze.running || Ze.activity <= 0 || Ze.construction < 0.95))) {
      _e += Math.min(0.1, Math.max(0, Number(x) || 0)) * Ze.activity;
      for (let z of b) z(_e);
    }
  }
  function oe() {
    if (!Se) {
      Se = true;
      for (let x of S) x.dispose();
      S.clear();
      for (let x of M) x.dispose();
      for (let x of g) x.dispose();
      for (let x of m) x.dispose();
      g.clear(), m.clear(), b.length = 0, O.length = 0, u.clear();
    }
  }
  let Ne = { width: Tt, depth: Xt, nominalWidth: vt, nominalDepth: Ye, baselineWidth: U, baselineDepth: be, siteArea: w, originalSiteArea: Le, areaRatio: w / Le, districtCount: qe.length, buildingCount: Ve.buildingCount, productionLines: Ve.productionLines, warehouseCount: Ve.warehouseCount }, Ue = { type: e, floating: n, seed: t | 0, city: Ne, siteWidth: Tt, siteDepth: Xt, siteArea: w, originalSiteArea: Le, areaRatio: w / Le, ...Ve, districts: qe, productionPlacements: Rt, animationObjects: b.length, vehicleCount: A.length, fixedSeeds: [17, 42, 101], equipmentScale: 1, units: "relative model units; original equipment is reused without global enlargement", sourceModule: "./resource-complexes.js", note: "Production templates omit all original terrain tiles. Shared geometry is instanced across a common city plan. Building count includes roofed process halls, control buildings, workshops and warehouses; tanks, cranes and equipment towers are excluded.", limitations: ["Demonstration traffic, conveyors and stabilization rotors do not implement a production economy, flow solver or flight dynamics.", "Ground height is normalized to the supplied ground.heightAt(0,0); city processing terrain is graded.", "Far silhouettes show completed buildings; construction staging is presented in near detail."] };
  return Object.assign(Ue, { planLabels: qe.filter((x) => !["entry", "dock"].includes(x.kind)), logisticsRoutes: Oe.logisticsRoutes, entryClearances: Oe.entryClearances, boundaryTreatments: Oe.boundaryTreatments, transportSurfaces: Oe.transportSurfaces, siteBoundary: Oe.siteBoundary, platformBoundaries: Oe.platformBoundaries, siteRevision: "perimeter-and-logistics-1" }), N(), { root: u, groups: _, anchors: J, bounds: Dt, footprint: Vt, siteBoundary: Oe.siteBoundary, platformBoundaries: Oe.platformBoundaries, heightAt: G, setVisualState: N, update: te, dispose: oe, views: L, meta: Ue };
}
function kg(i42 = {}) {
  let e = i42.THREE;
  if (!e?.BufferGeometry) throw new TypeError("createSpaceElevator requires the THREE module.");
  let t = Number.isFinite(i42.seed) ? Math.trunc(i42.seed) : 17, n = Number.isFinite(i42.stationHeight) ? i42.stationHeight : 240, s = { width: 6, depth: 4, ...i42.portSize }, r = { width: 3, height: 2, length: 8, ...i42.dockClearance };
  for (let [R, W] of Object.entries({ stationHeight: n, ...s, ...r })) if (!(Number.isFinite(W) && W > 0)) throw new RangeError(`${R} must be a positive finite number.`);
  let o = typeof i42.ground?.heightAt == "function" ? i42.ground.heightAt : () => 0, a = (R, W) => {
    let Pe = o(R, W);
    return Number.isFinite(Pe) ? Pe : 0;
  }, l = [];
  for (let R = 0; R <= 8; R++) for (let W = 0; W <= 12; W++) l.push(a((W / 12 - 0.5) * s.width, (R / 8 - 0.5) * s.depth));
  let c = Math.max(...l);
  if (n < c + 8) throw new RangeError("stationHeight must leave at least 8 units above the ground port.");
  let d = s.width / 6, f = s.depth / 4, h = t >>> 0 || 1, p = () => (h ^= h << 13, h ^= h >>> 17, h ^= h << 5, (h >>> 0) / 4294967296), u = (R) => Math.min(1, Math.max(0, Number.isFinite(R) ? R : 0)), _ = new e.Group();
  _.name = "TETHER \xB7 orbital logistics complex";
  let g = Object.fromEntries(["groundPort", "cables", "station", "cabins", "shipAssembly", "effects", "silhouette"].map((R) => {
    let W = new e.Group();
    return W.name = R, _.add(W), [R, W];
  })), m = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set(), M = (R) => (m.add(R), R), y = (R) => (S.add(R), R), Y = { paint: y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.56, metalness: 0.34 })), metal: y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.83 })), dark: y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.89, metalness: 0.13 })), concrete: y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0 })), glass: y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.19, metalness: 0.6, transparent: false })), warm: y(new e.MeshStandardMaterial({ vertexColors: true, emissive: 16173691, emissiveIntensity: 0.95, roughness: 0.36 })), cool: y(new e.MeshStandardMaterial({ vertexColors: true, emissive: 7448253, emissiveIntensity: 0.65, roughness: 0.36 })) }, b = { steel: { type: "metal", color: 8161680 }, alloy: { type: "metal", color: 11845056 }, dull: { type: "metal", color: 5398634 }, pale: { type: "paint", color: 11647159 }, white: { type: "paint", color: 13093310 }, navy: { type: "paint", color: 3426644 }, deep: { type: "paint", color: 2372928 }, yellow: { type: "paint", color: 12099662 }, rust: { type: "paint", color: 7953219 }, black: { type: "dark", color: 1515299 }, rubber: { type: "dark", color: 2435884 }, concrete: { type: "concrete", color: 7371385 }, asphalt: { type: "concrete", color: 3423294 }, gravel: { type: "concrete", color: 6844007 }, glass: { type: "glass", color: 3101282 }, warm: { type: "warm", color: 13286809 }, cool: { type: "cool", color: 9087669 } }, O = /* @__PURE__ */ new Map(), A = (R, W, Pe) => new e.Vector3(R, W, Pe), V = A(0, 1, 0), ie = new e.Matrix4(), Q = new e.Matrix3(), ue = new e.Quaternion(), fe = new e.Vector3(), He = new e.Vector3(), he = (R = 0, W = 0, Pe = 0) => new e.Quaternion().setFromEuler(new e.Euler(R, W, Pe)), Ae = new e.Color();
  function ke(R, W, Pe, St = Math.min(R, W, Pe) * 0.09) {
    St = Math.min(St, R * 0.23, W * 0.23, Pe * 0.23);
    let Pt = `b:${[R, W, Pe, St].map((yn) => yn.toFixed(5)).join(",")}`;
    if (O.has(Pt)) return O.get(Pt);
    let zt = [R / 2, W / 2, Pe / 2], Ut = zt.map((yn) => yn - St), sn = [];
    function Sn(yn, E) {
      let B = new e.Vector3(...yn[0]), K = new e.Vector3(...yn[1]), Xe = new e.Vector3(...yn[2]);
      K.sub(B).cross(Xe.sub(B)).dot(new e.Vector3(...E)) < 0 && yn.reverse();
      for (let ht = 1; ht < yn.length - 1; ht++) sn.push(...yn[0], ...yn[ht], ...yn[ht + 1]);
    }
    for (let yn = 0; yn < 3; yn++) for (let E of [-1, 1]) {
      let B = (yn + 1) % 3, K = (yn + 2) % 3, Xe = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([st, mt]) => {
        let Ft = [0, 0, 0];
        return Ft[yn] = E * zt[yn], Ft[B] = st * Ut[B], Ft[K] = mt * Ut[K], Ft;
      }), ht = [0, 0, 0];
      ht[yn] = E, Sn(Xe, ht);
    }
    for (let yn = 0; yn < 3; yn++) for (let E = yn + 1; E < 3; E++) for (let B of [-1, 1]) for (let K of [-1, 1]) {
      let Xe = 3 - yn - E, ht = [];
      for (let [mt, Ft] of [[yn, -1], [E, -1], [E, 1], [yn, 1]]) {
        let fn = [0, 0, 0];
        fn[yn] = B * (mt === yn ? zt[yn] : Ut[yn]), fn[E] = K * (mt === E ? zt[E] : Ut[E]), fn[Xe] = Ft * Ut[Xe], ht.push(fn);
      }
      let st = [0, 0, 0];
      st[yn] = B, st[E] = K, Sn(ht, st);
    }
    for (let yn of [-1, 1]) for (let E of [-1, 1]) for (let B of [-1, 1]) {
      let K = [yn, E, B], Xe = [0, 1, 2].map((ht) => K.map((st, mt) => st * (ht === mt ? zt[mt] : Ut[mt])));
      Sn(Xe, K);
    }
    let kn = M(new e.BufferGeometry());
    return kn.setAttribute("position", new e.Float32BufferAttribute(sn, 3)), kn.computeVertexNormals(), O.set(Pt, kn), kn;
  }
  function we(R, W, Pe, St = 12) {
    let Pt = `c:${R},${W},${Pe},${St}`;
    return O.has(Pt) || O.set(Pt, M(new e.CylinderGeometry(R, W, Pe, St, 1))), O.get(Pt);
  }
  function pt(R, W = 8e-3) {
    let Pe = `r:${R},${W}`;
    return O.has(Pe) || O.set(Pe, M(new e.TorusGeometry(R, W, 5, 16))), O.get(Pe);
  }
  class ot {
    constructor(W) {
      this.name = W, this.data = /* @__PURE__ */ new Map();
    }
    add(W, Pe, St = [0, 0, 0], Pt = ue, zt = [1, 1, 1]) {
      let Ut = Pe.type;
      this.data.has(Ut) || this.data.set(Ut, { p: [], n: [], c: [] });
      let sn = this.data.get(Ut), Sn = W.getAttribute("position"), kn = W.getAttribute("normal"), yn = W.index;
      ie.compose(A(...St), Pt, A(...zt)), Q.getNormalMatrix(ie), Ae.set(Pe.color);
      for (let E = 0, B = yn ? yn.count : Sn.count; E < B; E++) {
        let K = yn ? yn.getX(E) : E;
        fe.fromBufferAttribute(Sn, K).applyMatrix4(ie), He.fromBufferAttribute(kn, K).applyMatrix3(Q).normalize(), sn.p.push(fe.x, fe.y, fe.z), sn.n.push(He.x, He.y, He.z), sn.c.push(Ae.r, Ae.g, Ae.b);
      }
      return this;
    }
    box(W, Pe, St, Pt, zt, Ut, sn) {
      return this.add(ke(W, Pe, St, sn), Pt, zt, Ut ? he(...Ut) : ue);
    }
    flatBox(W, Pe, St, Pt, zt, Ut) {
      let sn = `flat:${W},${Pe},${St}`;
      return O.has(sn) || O.set(sn, M(new e.BoxGeometry(W, Pe, St))), this.add(O.get(sn), Pt, zt, Ut ? he(...Ut) : ue);
    }
    pipe(W, Pe, St, Pt = b.steel, zt = 10) {
      let Ut = A(...Pe).sub(A(...W)), sn = Ut.length();
      return sn < 1e-7 ? this : this.add(we(St, St, sn, zt), Pt, A(...W).addScaledVector(Ut, 0.5).toArray(), new e.Quaternion().setFromUnitVectors(V, Ut.normalize()));
    }
    beam(W, Pe, St, Pt, zt = b.steel) {
      let Ut = A(...Pe).sub(A(...W)), sn = Ut.length();
      return sn < 1e-7 ? this : this.add(ke(St, sn, Pt, Math.min(St, Pt) * 0.1), zt, A(...W).addScaledVector(Ut, 0.5).toArray(), new e.Quaternion().setFromUnitVectors(V, Ut.normalize()));
    }
    ibeam(W, Pe, St = 0.095, Pt = 0.11, zt = b.steel) {
      let Ut = A(...Pe).sub(A(...W)), sn = Ut.length(), Sn = new e.Quaternion().setFromUnitVectors(V, Ut.clone().normalize()), kn = A(...W).addScaledVector(Ut, 0.5);
      for (let yn of [-1, 1]) this.add(ke(St, sn, Pt * 0.16, 2e-3), zt, kn.clone().add(A(0, 0, yn * Pt * 0.42).applyQuaternion(Sn)).toArray(), Sn);
      return this.add(ke(St * 0.14, sn, Pt * 0.88, 15e-4), zt, kn.toArray(), Sn);
    }
    finish(W, Pe = true) {
      let St = [];
      for (let [Pt, zt] of this.data) {
        let Ut = M(new e.BufferGeometry());
        Ut.setAttribute("position", new e.Float32BufferAttribute(zt.p, 3)), Ut.setAttribute("normal", new e.Float32BufferAttribute(zt.n, 3)), Ut.setAttribute("color", new e.Float32BufferAttribute(zt.c, 3)), Ut.computeBoundingBox(), Ut.computeBoundingSphere();
        let sn = new e.Mesh(Ut, Y[Pt]);
        sn.name = `${this.name} / ${Pt}`, sn.castShadow = Pe, sn.receiveShadow = true, W.add(sn), St.push(sn);
      }
      return this.data.clear(), St;
    }
    singleGeometry() {
      let W = [], Pe = [], St = [];
      for (let zt of this.data.values()) {
        for (let Ut of zt.p) W.push(Ut);
        for (let Ut of zt.n) Pe.push(Ut);
        for (let Ut of zt.c) St.push(Ut);
      }
      let Pt = M(new e.BufferGeometry());
      return Pt.setAttribute("position", new e.Float32BufferAttribute(W, 3)), Pt.setAttribute("normal", new e.Float32BufferAttribute(Pe, 3)), Pt.setAttribute("color", new e.Float32BufferAttribute(St, 3)), Pt.computeBoundingBox(), Pt.computeBoundingSphere(), this.data.clear(), Pt;
    }
  }
  let Ce = new e.Group();
  Ce.name = "terraced pad, roads and foundation sockets", g.groundPort.add(Ce);
  let le = new e.Group();
  le.name = "ground handling and terminal buildings", g.groundPort.add(le);
  let Be = new e.Group();
  Be.name = "orbital trusses and transfer depot", g.station.add(Be);
  let ze = new e.Group(), re = new e.Group();
  ze.name = "ground marker lamps", re.name = "dock boundary lamps", g.effects.add(ze, re);
  let F = new ot("Ground equipment"), ve = new ot("Terraced port"), ae = new ot("Open orbital station"), $e = new ot("Parallel tension bundles"), rt = new ot("Ground lamp lenses"), Qe = new ot("Station lamp lenses"), _t = M(new e.CylinderGeometry(7e-3, 7e-3, 9e-3, 6)), vt = [], Ye = [];
  function ut(R, W, Pe = [0, 1, 0], St = 1) {
    R.push({ p: W, q: new e.Quaternion().setFromUnitVectors(V, A(...Pe).normalize()), s: St });
  }
  function lt(R, W, Pe) {
    let St = y(new e.MeshStandardMaterial({ color: 9279125, metalness: 0.82, roughness: 0.31 })), Pt = new e.InstancedMesh(_t, St, R.length);
    return Pt.name = Pe, Pt.castShadow = true, R.forEach((zt, Ut) => {
      ie.compose(A(...zt.p), zt.q, A(zt.s, zt.s, zt.s)), Pt.setMatrixAt(Ut, ie);
    }), Pt.computeBoundingBox(), Pt.computeBoundingSphere(), W.add(Pt), Pt;
  }
  let at = (R, W, Pe) => [R * d, c + W, Pe * f];
  function ct(R, W, Pe, St = 0.135, Pt = 0.29) {
    let zt = A(...Pe).sub(A(...W)), Ut = zt.length(), sn = Math.max(1, Math.ceil(Ut / Pt));
    for (let Sn = 0; Sn <= sn; Sn++) {
      let kn = A(...W).addScaledVector(zt, Sn / sn);
      R.pipe(kn.toArray(), kn.clone().add(A(0, St, 0)).toArray(), 6e-3, b.steel, 6);
    }
    for (let Sn of [0.055, St]) R.pipe(A(...W).add(A(0, Sn, 0)).toArray(), A(...Pe).add(A(0, Sn, 0)).toArray(), 6e-3, Sn === St ? b.yellow : b.steel, 6);
    R.beam(A(...W).add(A(0, 0.018, 0)).toArray(), A(...Pe).add(A(0, 0.018, 0)).toArray(), 9e-3, 0.029, b.dull);
  }
  function Ct(R, W, Pe, St, Pt, zt = 0.105) {
    R.pipe([W - zt / 2, Pe, St], [W - zt / 2, Pe + Pt, St], 6e-3, b.steel, 6), R.pipe([W + zt / 2, Pe, St], [W + zt / 2, Pe + Pt, St], 6e-3, b.steel, 6);
    for (let Ut = Pe + 0.025; Ut < Pe + Pt; Ut += 0.043) R.pipe([W - zt / 2, Ut, St], [W + zt / 2, Ut, St], 4e-3, b.steel, 6);
  }
  function se(R, W, Pe, St, Pt, zt) {
    let [Ut, sn, Sn] = W;
    for (let kn = 0; kn < zt; kn++) R.box(Pe, 0.018, Pt / zt + 0.013, b.steel, [Ut, sn + St * (kn + 1) / zt, Sn - Pt * kn / zt], null, 2e-3);
    for (let kn of [-1, 1]) R.ibeam([Ut + kn * Pe * 0.43, sn, Sn + 0.07], [Ut + kn * Pe * 0.43, sn + St, Sn - Pt], 0.027, 0.04, b.dull), ct(R, [Ut + kn * Pe * 0.49, sn + 0.015, Sn], [Ut + kn * Pe * 0.49, sn + St, Sn - Pt], 0.13, 0.16);
  }
  function Ht(R, W, Pe, St, Pt = 0.06) {
    let zt = new e.Quaternion().setFromUnitVectors(V, A(...St));
    R.add(we(Pt, Pt, 0.016, 14), b.steel, Pe, zt);
    let Ut = A(1, 0, 0).applyQuaternion(zt), sn = A(0, 0, 1).applyQuaternion(zt);
    for (let Sn = 0; Sn < 6; Sn++) ut(W, A(...Pe).addScaledVector(Ut, Pt * 0.75 * Math.cos(Sn * Math.PI / 3)).addScaledVector(sn, Pt * 0.75 * Math.sin(Sn * Math.PI / 3)).addScaledVector(A(...St), 0.011).toArray(), St, 0.65);
  }
  ve.box(s.width, 0.07, s.depth, b.concrete, [0, c - 0.05, 0], null, 0.012), ve.box(s.width - 0.035, 0.019, s.depth - 0.035, b.gravel, [0, c - 0.016, 0], null, 6e-3);
  for (let R of [-s.width / 2 + 0.019, s.width / 2 - 0.019]) {
    let W = Math.min(...l) - 0.08;
    ve.box(0.038, Math.max(0.08, c - W), s.depth, b.concrete, [R, (c + W) / 2 - 0.025, 0], null, 8e-3);
  }
  for (let R of [-s.depth / 2 + 0.0215, s.depth / 2 - 0.0215]) ve.box(s.width, 0.062, 0.043, b.concrete, [0, c - 0.035, R], null, 6e-3);
  ve.box(0.64 * d, 0.015, 3.78 * f, b.asphalt, at(-2.605, -75e-4, 0.025), null, 3e-3), ve.box(5.53 * d, 0.015, 0.54 * f, b.asphalt, at(0.13, -75e-4, 1.58), null, 3e-3), ve.box(2.73 * d, 0.012, 0.38 * f, b.asphalt, at(0.22, -6e-3, 0.17), null, 3e-3);
  for (let R = -1.7; R < 1.76; R += 0.26) ve.box(0.013, 2e-3, 0.11, b.yellow, at(-2.605, 2e-3, R), null, 1e-3);
  for (let R = -2; R < 2.72; R += 0.28) ve.box(0.12, 2e-3, 0.012, b.yellow, at(R, 2e-3, 1.58), null, 1e-3);
  for (let R = 0; R < 7; R++) ve.box(0.044, 2e-3, 0.2, b.white, at(-2.67 + R * 0.068, 25e-4, 1.9), null, 1e-3);
  for (let R of [1, 1.15]) F.ibeam(at(-2.85, 0.024, R), at(2.85, 0.024, R), 0.027, 0.032, b.steel);
  for (let R = -2.82; R < 2.87; R += 0.14) {
    F.box(0.041, 0.014, 0.27, b.dull, at(R, 7e-3, 1.075), null, 2e-3);
    for (let W of [0.992, 1.158]) ut(vt, at(R, 0.029, W), [0, 1, 0], 0.6);
  }
  for (let R of [-2.88, 2.9]) F.box(0.053, 0.052, 0.3, b.yellow, at(R, 0.035, 1.075), null, 8e-3);
  let de = -1.65 * d, X = -0.65 * f, G = c, Fe = 0.78 * d;
  F.box(1.48 * Fe, 0.065, 1.05 * f, b.concrete, [de, G + 0.032, X], null, 0.015), F.box(1.45 * Fe, 0.59, 1 * f, b.navy, [de, G + 0.35, X], null, 0.025), F.box(1.52 * Fe, 0.05, 1.1 * f, b.pale, [de, G + 0.673, X], [0, 0, -0.035], 8e-3);
  for (let R = 0; R < 14; R++) F.box(0.023, 0.017, 1.055 * f, b.steel, [de - 0.7 * Fe + R * 1.4 * Fe / 13, G + 0.707 - 0.035 * (R / 13 - 0.5), X], null, 2e-3);
  for (let R = 0; R < 4; R++) {
    let W = de + (-0.51 + R * 0.34) * Fe, Pe = X + 0.508 * f;
    F.box(0.274 * Fe, 0.37, 0.022, b.black, [W, G + 0.256, Pe], null, 5e-3), F.box(0.249 * Fe, 0.257, 0.025, b.steel, [W, G + 0.34, Pe + 0.016], null, 3e-3);
    for (let St = 0; St < 7; St++) F.box(0.245 * Fe, 9e-3, 0.011, b.dull, [W, G + 0.218 + St * 0.037, Pe + 0.031], null, 1e-3);
    for (let St of [-1, 1]) F.box(0.021, 0.43, 0.036, b.pale, [W + St * 0.147 * Fe, G + 0.263, Pe + 0.02], null, 3e-3);
    F.box(0.31 * Fe, 0.031, 0.18, b.steel, [W, G + 0.077, Pe + 0.087], null, 4e-3), F.box(0.29 * Fe, 0.018, 0.018, b.yellow, [W, G + 0.103, Pe + 0.165], null, 2e-3), rt.box(0.058, 0.016, 0.015, b.warm, [W, G + 0.5, Pe + 0.023], null, 3e-3);
  }
  for (let R of [de - 0.73 * Fe, de + 0.73 * Fe]) for (let W of [X - 0.49 * f, X + 0.49 * f]) {
    F.ibeam([R, G + 0.065, W], [R, G + 0.66, W], 0.045, 0.061, b.dull), F.box(0.085, 0.012, 0.09, b.steel, [R, G + 0.066, W], null, 3e-3);
    for (let Pe of [-0.028, 0.028]) for (let St of [-0.03, 0.03]) ut(vt, [R + Pe, G + 0.078, W + St], [0, 1, 0], 0.65);
  }
  F.box(0.44, 0.085, 0.2, b.deep, [de + 0.28, G + 0.738, X + 0.15], null, 0.012);
  for (let R = 0; R < 8; R++) F.box(0.014, 0.035, 0.17, b.steel, [de + 0.1 + R * 0.048, G + 0.75, X + 0.15], null, 2e-3);
  F.add(we(0.067, 0.087, 0.06, 14), b.dull, [de - 0.4, G + 0.757, X - 0.22]), F.add(we(0.08, 0.08, 0.022, 14), b.steel, [de - 0.4, G + 0.797, X - 0.22]), Ct(F, de + 0.53, G + 0.08, X - 0.531 * f, 0.6);
  let P = [-0.52 * d, 0.52 * d], v = -0.76 * f;
  for (let R of P) {
    F.box(0.36, 0.17, 0.42, b.concrete, [R, c + 0.075, v], null, 0.025), F.box(0.28, 0.035, 0.34, b.steel, [R, c + 0.178, v], null, 6e-3), F.add(we(0.063, 0.115, 0.08, 12), b.dull, [R, c + 0.228, v]), F.box(0.097, 0.03, 0.096, b.deep, [R, c + 0.282, v], null, 5e-3);
    for (let W of [-0.095, 0.095]) for (let Pe of [-0.128, 0.128]) F.add(we(0.012, 0.012, 0.065, 8), b.dull, [R + W, c + 0.217, v + Pe]), ut(vt, [R + W, c + 0.252, v + Pe], [0, 1, 0], 1.5);
  }
  for (let R of [-1, 1]) {
    let W = R * 0.95 * d;
    F.box(0.25, 0.12, 0.43, b.concrete, [W, c + 0.055, -0.83 * f], null, 0.025), F.ibeam([W, c + 0.12, -0.91 * f], [W, c + 1.5, -0.91 * f], 0.12, 0.13, b.pale), F.ibeam([W, c + 0.12, -0.52 * f], [W, c + 1.5, -0.7 * f], 0.1, 0.11, b.dull), F.beam([W, c + 0.39, -0.5 * f], [W, c + 1.2, -0.89 * f], 0.049, 0.055, b.steel);
    for (let Pe of [0.15, 1.29]) F.box(0.15, 0.1, 0.021, b.yellow, [W, c + Pe, -0.445 * f], null, 3e-3);
    Ct(F, W, c + 0.14, -0.979 * f, 1.29);
  }
  F.ibeam([-1.06 * d, c + 1.52, -1.12 * f], [1.06 * d, c + 1.52, -1.12 * f], 0.16, 0.18, b.pale), F.box(1.96 * d, 0.09, 0.21, b.navy, [0, c + 1.56, -1.12 * f], null, 0.013);
  for (let R of P) {
    F.box(0.27, 0.13, 0.15, b.deep, [R, c + 1.54, -1.12 * f], null, 0.014);
    for (let W of [-0.32, 0.32]) F.beam([R + W, c + 1.52, -1.12 * f], [R + W, c + 1.52, v - 0.085], 0.039, 0.053, b.steel);
  }
  for (let R of [-1.01 * d, 0, 1.01 * d]) F.box(0.14, 0.256, 0.58, b.deep, [R, c + 0.141, -0.29 * f], null, 0.012);
  F.box(2.22 * d, 0.045, 0.37, b.steel, [0, c + 0.28, 0.055 * f], null, 6e-3);
  for (let R of P) {
    F.box(0.41, 0.041, 0.37, b.black, [R, c + 0.27, -0.092 * f], null, 6e-3);
    for (let W = 0; W < 9; W++) F.add(we(0.013, 0.013, 0.36, 8), b.steel, [R, c + 0.303, -0.256 * f + W * 0.041], he(0, 0, Math.PI / 2));
    for (let W of [-1, 1]) F.box(0.019, 0.05, 0.43, b.yellow, [R + W * 0.2, c + 0.298, -0.1 * f], null, 3e-3);
  }
  se(F, [1.24 * d, c + 5e-3, 0.44 * f], 0.25, 0.296, 0.3, 8), ct(F, [-1.11 * d, c + 0.303, 0.21 * f], [0.9 * d, c + 0.303, 0.21 * f], 0.125, 0.28);
  let k = 1.41 * d, ee = -1.32 * f;
  F.box(0.59, 0.1, 0.54, b.concrete, [k, c + 0.049, ee], null, 0.025), F.box(0.43, 0.64, 0.4, b.deep, [k, c + 0.406, ee], null, 0.025), F.box(0.68, 0.31, 0.63, b.pale, [k - 0.045, c + 0.88, ee + 0.03], null, 0.025), F.box(0.586, 0.12, 0.019, b.glass, [k - 0.045, c + 0.905, ee + 0.354], null, 8e-3), F.box(0.019, 0.12, 0.47, b.glass, [k + 0.306, c + 0.905, ee + 0.03], null, 7e-3);
  for (let R of [-0.21, 0, 0.21]) F.box(9e-3, 0.129, 0.023, b.deep, [k + R - 0.045, c + 0.905, ee + 0.36], null, 1e-3);
  F.box(0.74, 0.032, 0.69, b.dull, [k - 0.045, c + 1.064, ee + 0.03], null, 6e-3), F.pipe([k + 0.13, c + 1.07, ee], [k + 0.13, c + 1.49, ee], 9e-3, b.steel, 8), F.box(0.14, 0.055, 0.013, b.deep, [k + 0.13, c + 1.32, ee], [0, 0.3, 0], 3e-3), rt.box(0.038, 0.01, 0.018, b.warm, [k - 0.23, c + 1.03, ee + 0.38], null, 2e-3), F.box(0.13, 0.23, 0.018, b.black, [k, c + 0.215, ee + 0.206], null, 6e-3), F.box(0.07, 0.048, 5e-3, b.glass, [k, c + 0.277, ee + 0.219], null, 2e-3);
  for (let R = 0; R < 3; R++) F.box(0.23, 0.032, 0.075, b.steel, [k, c + 0.1 - R * 0.027, ee + 0.255 + R * 0.07], null, 4e-3);
  let ye = 2.23 * d, Ee = -1.18 * f;
  F.box(0.84 * d, 0.48, 0.91 * f, b.pale, [ye, c + 0.267, Ee], null, 0.022), F.box(0.88 * d, 0.029, 0.95 * f, b.dull, [ye, c + 0.526, Ee], null, 5e-3), F.box(0.34, 0.32, 0.018, b.black, [ye, c + 0.225, Ee + 0.466 * f], null, 6e-3);
  for (let R = 0; R < 10; R++) F.box(0.32, 0.018, 0.026, b.navy, [ye, c + 0.081 + 0.029 * R, Ee + 0.48 * f], null, 2e-3);
  for (let R = 0; R < 7; R++) F.box(0.019, 0.16, 0.16, b.dull, [ye - 0.29 + R * 0.044, c + 0.586, Ee + 0.1], null, 3e-3);
  let De = c + 0.085;
  F.pipe([2.71 * d, De, -0.4 * f], [2.71 * d, De, -1.75 * f], 0.027, b.steel), F.pipe([2.71 * d, De, -1.75 * f], [-0.9 * d, De, -1.75 * f], 0.027, b.steel);
  for (let R of [2.25, 1.6, 0.88, 0.1, -0.68]) Ht(F, vt, [R * d, De, -1.75 * f], [1, 0, 0], 0.043), F.box(0.058, 0.025, 0.1, b.deep, [R * d, c + 0.03, -1.75 * f], null, 5e-3);
  for (let R of [1.8 * d, 2.5 * d]) F.add(we(0.068, 0.068, 0.19, 16), b.steel, [R, c + 0.15, -1.78 * f]), F.add(we(0.027, 0.062, 0.026, 16), b.dull, [R, c + 0.257, -1.78 * f]), F.box(0.14, 0.035, 0.14, b.deep, [R, c + 0.038, -1.78 * f], null, 9e-3);
  for (let R of [0.47, 0.91]) {
    F.ibeam(at(0.7, 0.055, R), at(2.73, 0.055, R), 0.039, 0.047, b.dull);
    for (let W of [1, 2.43]) {
      F.box(0.28, 0.1, 0.11, b.deep, at(W, 0.12, R), null, 0.012);
      for (let Pe of [-0.08, 0.08]) F.add(we(0.035, 0.035, 0.025, 12), b.steel, at(W + Pe, 0.1, R), he(Math.PI / 2, 0, 0));
      F.ibeam(at(W, 0.16, R), at(W, 0.84, R), 0.065, 0.085, b.yellow), F.beam(at(W, 0.27, R), at(W + (W < 1.5 ? 0.18 : -0.18), 0.74, R), 0.027, 0.035, b.dull);
    }
    F.ibeam(at(0.78, 0.87, R), at(2.66, 0.87, R), 0.095, 0.12, b.pale), F.box(1.86 * d, 0.024, 0.027, b.yellow, at(1.72, 0.925, R + 0.055), null, 2e-3);
  }
  F.ibeam(at(1.01, 0.82, 0.45), at(1.01, 0.82, 0.93), 0.066, 0.076, b.dull), F.ibeam(at(2.43, 0.82, 0.45), at(2.43, 0.82, 0.93), 0.066, 0.076, b.dull), Ct(F, 2.43 * d, c + 0.18, 0.976 * f, 0.69), ct(F, [0.8 * d, c + 0.943, 0.44 * f], [2.65 * d, c + 0.943, 0.44 * f], 0.1, 0.24);
  for (let [R, W] of [[-2.85, 1.81], [-2.1, 1.81], [-2.02, 0.18], [0.96, 0.36], [2.72, 1.27]]) F.add(we(0.016, 0.022, 0.145, 10), b.yellow, at(R, 0.073, W)), F.add(we(0.017, 0.017, 0.026, 10), b.black, at(R, 0.105, W));
  for (let [R, W] of [[-1.95, 1.24], [0.25, 1.77], [2.68, -0.23]]) {
    F.box(0.21, 6e-3, 0.13, b.black, at(R, 2e-3, W), null, 2e-3);
    for (let Pe = 0; Pe < 7; Pe++) F.box(0.012, 5e-3, 0.12, b.steel, at(R - 0.085 + Pe * 0.028, 7e-3, W), null, 1e-3);
  }
  for (let R = 0; R < 8; R++) F.box(0.045, 5e-3, 0.095, R % 2 ? b.black : b.yellow, at(-0.94 + R * 0.085, 0.313, 0.225), [0, -0.38, 0], 1e-3);
  for (let [R, W] of [[-2.12, 1.45], [2.78, 1.46], [-2.15, -1.74]]) F.pipe(at(R, 0.025, W), at(R, 0.82, W), 0.01, b.dull, 8), F.pipe(at(R, 0.82, W), at(R + 0.13, 0.86, W), 9e-3, b.steel, 8), F.box(0.105, 0.025, 0.04, b.deep, at(R + 0.145, 0.85, W), [0, 0, -0.12], 6e-3), rt.box(0.09, 6e-3, 0.03, b.warm, at(R + 0.145, 0.831, W), null, 2e-3);
  ve.finish(Ce), F.finish(le), lt(vt, le, "Instanced ground anchor bolts and rail clips"), rt.finish(ze, false);
  let ce = new ot("corrugated freight container");
  ce.box(0.4, 0.214, 0.246, b.navy, [0, 0.115, 0], null, 7e-3), ce.box(0.401, 0.019, 0.249, b.dull, [0, 0.014, 0], null, 4e-3);
  for (let R of [-1, 1]) {
    for (let W = 0; W < 12; W++) ce.flatBox(9e-3, 0.176, 8e-3, b.pale, [-0.18 + W * 0.0327, 0.12, R * 0.126]);
    ce.box(0.402, 0.012, 0.018, b.steel, [0, 0.211, R * 0.124], null, 2e-3);
    for (let W of [-0.194, 0.194]) for (let Pe of [0.025, 0.212]) ce.box(0.028, 0.024, 0.026, b.steel, [W, Pe, R * 0.122], null, 4e-3);
    ce.box(0.019, 0.167, 0.242, b.dull, [R * 0.197, 0.118, 0], null, 2e-3);
    for (let W of [-0.061, 0.061]) ce.pipe([R * 0.211, 0.047, W], [R * 0.211, 0.197, W], 4e-3, b.steel, 6);
  }
  for (let R = 0; R < 9; R++) ce.flatBox(0.01, 7e-3, 0.228, b.steel, [-0.17 + R * 0.0425, 0.226, 0]);
  for (let R of [-0.12, 0.12]) ce.box(0.05, 0.02, 0.251, b.black, [R, 0.023, 0], null, 2e-3);
  let me = ce.singleGeometry(), Te = y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.58, metalness: 0.5 })), Ie = [];
  for (let R = 0; R < 4; R++) for (let W = 0; W < 3; W++) Ie.push({ p: [(1.6 + W * 0.55) * d, c + 0.018, (0.6 - R * 0.32) * f], q: he(0, 0, 0) });
  for (let R = 0; R < 4; R++) Ie.push({ p: [(1.6 + R % 2 * 0.55) * d, c + 0.247, (0.6 - Math.floor(R / 2) * 0.32) * f], q: he() });
  let Ve = new e.InstancedMesh(me, Te, Ie.length);
  Ve.name = "Stock-sensitive ground freight boxes", Ve.castShadow = true, Ve.receiveShadow = true, le.add(Ve);
  let qe = [7241605, 11712428, 10193761, 8358277];
  Ie.forEach((R, W) => Ve.setColorAt(W, new e.Color(qe[Math.floor(p() * qe.length)])));
  function Rt(R, W, Pe) {
    let St = Math.round(W.length * Pe);
    R.count = St;
    for (let Pt = 0; Pt < W.length; Pt++) ie.compose(A(...W[Pt].p), W[Pt].q || ue, A(1, 1, 1)), R.setMatrixAt(Pt, ie);
    R.instanceMatrix.needsUpdate = true, R.computeBoundingBox(), R.computeBoundingSphere();
  }
  function bt() {
    let R = new ot("battery freight tractor");
    R.box(0.47, 0.04, 0.181, b.dull, [0, 0.072, 0], null, 0.011), R.box(0.158, 0.125, 0.181, b.pale, [0.146, 0.143, 0], null, 0.022), R.box(0.01, 0.058, 0.145, b.glass, [0.23, 0.167, 0], [0, 0, -0.08], 3e-3);
    for (let W of [-1, 1]) {
      R.box(0.095, 0.052, 7e-3, b.glass, [0.154, 0.167, W * 0.095], null, 6e-3);
      for (let Pe of [-0.155, 0.155]) R.add(we(0.042, 0.042, 0.032, 14), b.rubber, [Pe, 0.05, W * 0.095], he(Math.PI / 2, 0, 0)), R.add(we(0.023, 0.023, 0.036, 12), b.steel, [Pe, 0.05, W * 0.097], he(Math.PI / 2, 0, 0));
      R.box(0.067, 0.012, 0.01, b.yellow, [0.09, 0.108, W * 0.098], null, 2e-3);
    }
    return R.box(0.255, 0.021, 0.172, b.navy, [-0.082, 0.11, 0], null, 4e-3), R.box(0.235, 0.064, 0.14, b.deep, [-0.079, 0.147, 0], null, 8e-3), R.box(0.01, 0.028, 0.17, b.yellow, [-0.24, 0.085, 0], null, 2e-3), R.singleGeometry();
  }
  let kt = new e.Mesh(bt(), Te);
  kt.name = "Autonomous yard tractor / 0.49 \xD7 0.22", kt.castShadow = true, kt.position.set(-1 * d, c + 0.015, 1.57 * f), le.add(kt);
  let pe = new e.Group();
  pe.name = "Gantry trolley, hoist ropes and container spreader", le.add(pe);
  let gt = new ot("ground crane trolley");
  gt.box(0.23, 0.095, 0.55 * f, b.deep, [0, 0, 0], null, 0.012);
  for (let R of [-0.22 * f, 0.22 * f]) for (let W of [-0.078, 0.078]) gt.add(we(0.029, 0.029, 0.025, 12), b.steel, [W, -0.018, R], he(Math.PI / 2, 0, 0));
  for (let R of [-0.15, 0.15]) for (let W of [-0.082, 0.082]) gt.pipe([R * 0.4, -0.044, W], [R, -0.285, W], 28e-4, b.dull, 5);
  gt.box(0.38, 0.041, 0.23, b.yellow, [0, -0.3, 0], null, 7e-3);
  for (let R of [-0.17, 0.17]) for (let W of [-0.097, 0.097]) gt.box(0.023, 0.036, 0.021, b.dull, [R, -0.33, W], null, 3e-3);
  let je = new e.Mesh(gt.singleGeometry(), Te);
  je.castShadow = true, pe.add(je), pe.position.set(1.53 * d, c + 0.947, 0.69 * f);
  let Et = c + 0.297, xt = n, ft = P.map((R) => ({ bottom: [R, Et, v], top: [R, xt, v] }));
  for (let R of ft) {
    let [W, , Pe] = R.bottom;
    for (let St of [-1, 1]) $e.box(0.025, xt - Et, 0.015, St === 1 ? b.steel : b.dull, [W + St * 0.016, (xt + Et) / 2, Pe], null, 12e-4);
    $e.box(5e-3, xt - Et, 0.03, b.deep, [W, (xt + Et) / 2, Pe], null, 1e-3);
    for (let St = Et + 3; St < xt - 1; St += 6) $e.box(0.079, 0.027, 0.053, b.dull, [W, St, Pe], null, 4e-3);
  }
  let Ot = 1.15 * d, Zt = -0.98 * f;
  $e.box(0.017, n - c - 0.16, 0.016, b.dull, [Ot, (n + c + 0.16) / 2, Zt], null, 1e-3);
  for (let R = c + 0.5; R < n - 0.2; R += 1.5) $e.box(0.065, 0.012, 0.034, b.steel, [Ot, R, Zt], null, 1e-3);
  $e.finish(g.cables, false);
  let Kt = n, Qt = r.width, cn = r.height, vn = r.length, gn = 0.58, mn = gn + vn, En = Kt + 0.1, $t = En - cn / 2 - 0.11, en = $t - 0.1, nn = En + cn / 2 + 0.22, on = Qt / 2 + 0.2, xn = on + 0.4, Jt = on + 0.71, C = Kt - 1.03;
  ae.box(5.25, 0.12, 1.09, b.deep, [0, C - 0.075, -1.76], null, 0.025), ae.box(5.25, 0.1, 0.66, b.navy, [0, C - 0.056, 0.17], null, 0.019);
  for (let R of [-1.79, 1.79]) ae.box(1.52, 0.1, 1.77, b.navy, [R, C - 0.056, -0.86], null, 0.02);
  for (let R of [-0.995 * d, 0, 0.995 * d]) ae.box(0.135, 0.09, 1.35, b.steel, [R, C - 0.051, -0.77], null, 8e-3);
  for (let R of P) {
    ae.box(0.35, 0.034, 0.27, b.deep, [R, Kt + 0.017, v], null, 7e-3), ae.add(we(0.055, 0.092, 0.1, 12), b.steel, [R, Kt - 0.02, v]);
    for (let W of [-1, 1]) ae.ibeam([R + W * 0.255, C, v + 0.17], [R + W * 0.255, Kt + 0.05, v], 0.05, 0.06, b.pale);
    ae.ibeam([R - 0.3, Kt + 0.08, v], [R + 0.3, Kt + 0.08, v], 0.09, 0.095, b.dull), ae.box(0.39, 0.036, 0.39, b.black, [R, C + 0.058, -0.035], null, 4e-3);
    for (let W = 0; W < 9; W++) ae.add(we(0.012, 0.012, 0.35, 8), b.steel, [R, C + 0.084, -0.215 + W * 0.041], he(0, 0, Math.PI / 2));
    for (let W of [-1, 1]) ae.box(0.016, 0.042, 0.39, b.yellow, [R + W * 0.205, C + 0.08, -0.028], null, 2e-3);
    Qe.box(0.03, 0.024, 0.035, b.warm, [R + 0.25, Kt + 0.061, v + 0.162], null, 3e-3);
  }
  ae.pipe([Ot, Kt, Zt], [Ot, Kt + 0.09, Zt], 0.033, b.steel);
  for (let R of [-1, 1]) {
    let W = R * 2.01;
    ae.box(0.87, 0.51, 1.19, b.pale, [W, C + 0.308, -1.64], null, 0.042), ae.box(0.91, 0.035, 1.21, b.dull, [W, C + 0.586, -1.64], null, 6e-3), ae.box(0.7, 0.023, 1.04, b.deep, [W, C + 0.615, -1.64], null, 6e-3);
    for (let Pe = 0; Pe < 11; Pe++) ae.box(0.056, 0.015, 1, b.steel, [W - 0.322 + Pe * 0.064, C + 0.635, -1.64], null, 2e-3);
    ae.box(0.018, 0.19, 0.66, b.glass, [W + R * 0.449, C + 0.353, -1.63], null, 8e-3);
    for (let Pe of [-1.89, -1.63, -1.37]) ae.box(0.022, 0.2, 0.011, b.deep, [W + R * 0.458, C + 0.353, Pe], null, 1e-3);
    ae.box(0.16, 0.265, 0.018, b.black, [W, C + 0.189, -1.032], null, 0.01), ae.box(0.092, 0.076, 0.012, b.glass, [W, C + 0.26, -1.014], null, 8e-3);
    for (let Pe of [-0.075, 0.075]) ae.box(0.027, 0.021, 0.026, b.yellow, [W + Pe, C + 0.159, -1.01], null, 3e-3);
    ct(ae, [R * 2.58, C + 0.016, -2.23], [R * 2.58, C + 0.016, 0.4], 0.135, 0.3);
    for (let Pe = 0; Pe < 5; Pe++) {
      ae.box(0.55, 0.08, 0.48, b.deep, [R * 3.02, C + 0.03, -2.13 + Pe * 0.54], null, 0.013), ae.box(0.52, 0.012, 0.45, b.glass, [R * 3.02, C + 0.086, -2.13 + Pe * 0.54], null, 5e-3);
      for (let St = 0; St < 6; St++) ae.box(5e-3, 6e-3, 0.45, b.steel, [R * 3.02 - 0.235 + St * 0.094, C + 0.096, -2.13 + Pe * 0.54], null, 1e-3);
      ae.ibeam([R * 2.57, C - 0.12, -2.13 + Pe * 0.54], [R * 3.05, C + 0.01, -2.13 + Pe * 0.54], 0.045, 0.055, b.steel);
    }
    ae.pipe([R * 2.4, C + 0.09, -2.21], [R * 2.4, C + 0.09, -0.4], 0.029, b.steel);
    for (let Pe of [-2, -1.47, -0.87]) Ht(ae, Ye, [R * 2.4, C + 0.09, Pe], [0, 0, 1], 0.043);
  }
  ae.ibeam([-2.63, C - 0.16, -2.26], [2.63, C - 0.16, -2.26], 0.14, 0.17, b.dull), ae.ibeam([-2.63, C - 0.16, 0.46], [2.63, C - 0.16, 0.46], 0.14, 0.17, b.dull);
  for (let R of [-2.54, -1.3, 0, 1.3, 2.54]) ae.ibeam([R, C - 0.16, -2.24], [R, C - 0.16, 0.46], 0.09, 0.16, b.steel), ae.beam([R, C - 0.33, -2.2], [R, C - 0.06, -0.93], 0.045, 0.052, b.dull), ae.beam([R, C - 0.06, -0.93], [R, C - 0.33, 0.42], 0.045, 0.052, b.dull);
  ct(ae, [-2.56, C + 5e-3, -2.25], [2.56, C + 5e-3, -2.25], 0.135, 0.29);
  let $ = Math.max(4, Math.ceil(vn / 1.63) + 1), Oe = Array.from({ length: $ }, (R, W) => gn + vn * W / ($ - 1));
  for (let R of [-1, 1]) {
    for (let W of [R * on, R * xn]) for (let Pe of [en, nn]) ae.ibeam([W, Pe, gn - 0.2], [W, Pe, mn + 0.13], 0.103, 0.135, b.pale);
    ae.box(0.38, 0.046, vn + 0.32, b.deep, [R * (on + 0.205), $t + 0.025, (gn + mn) / 2], null, 4e-3);
    for (let W = gn - 0.1; W <= mn; W += 0.117) ae.box(0.35, 9e-3, 0.012, b.steel, [R * (on + 0.205), $t + 0.055, W], null, 1e-3);
    ae.ibeam([R * (on + 0.18), $t + 0.069, gn], [R * (on + 0.18), $t + 0.069, mn], 0.026, 0.034, b.steel), ct(ae, [R * (xn + 0.01), $t + 0.062, gn - 0.13], [R * (xn + 0.01), $t + 0.062, mn + 0.11], 0.13, 0.34);
    for (let W = 0; W < Oe.length; W++) {
      let Pe = Oe[W];
      for (let St of [R * on, R * xn]) {
        ae.ibeam([St, en, Pe], [St, nn, Pe], 0.12, 0.14, b.pale);
        for (let Pt of [en, nn]) {
          ae.box(0.195, 0.2, 0.025, b.dull, [St, Pt, Pe + 0.082], null, 0.017);
          for (let zt of [-0.059, 0.059]) for (let Ut of [-0.057, 0.057]) ut(Ye, [St + zt, Pt + Ut, Pe + 0.102], [0, 0, 1], 1.05);
        }
      }
      if (ae.ibeam([R * on, nn, Pe], [R * xn, nn, Pe], 0.11, 0.11, b.steel), ae.ibeam([R * on, en, Pe], [R * xn, en, Pe], 0.11, 0.11, b.steel), W < Oe.length - 1) {
        let St = Oe[W + 1];
        ae.ibeam([R * xn, en + 0.055, Pe + 0.075], [R * xn, nn - 0.055, St - 0.075], 0.045, 0.061, b.steel), ae.ibeam([R * xn, nn - 0.055, Pe + 0.075], [R * xn, en + 0.055, St - 0.075], 0.045, 0.061, b.dull), ae.beam([R * on, nn, Pe + 0.12], [R * xn, nn, St - 0.12], 0.041, 0.045, b.steel), ae.beam([R * on, en, Pe + 0.12], [R * xn, en, St - 0.12], 0.041, 0.045, b.steel);
      }
      Qe.box(0.034, 0.057, 0.035, b.warm, [R * (on + 5e-3), $t + 0.235, Pe + 0.075], null, 4e-3), ae.box(0.106, 0.03, 0.12, b.yellow, [R * on, nn + 0.09, Pe], null, 4e-3);
    }
    for (let W of [-0.05, -0.105]) ae.pipe([R * (xn + 0.07), $t + W, gn], [R * (xn + 0.07), $t + W, mn], 0.016, b.steel, 8);
    for (let W = gn + 0.35; W < mn; W += 0.85) {
      ae.box(0.18, 0.23, 0.24, b.navy, [R * (xn + 0.125), $t + 0.2, W], null, 0.014), ae.box(0.015, 0.16, 0.18, b.deep, [R * (xn + 0.222), $t + 0.2, W], null, 6e-3);
      for (let Pe = 0; Pe < 5; Pe++) ae.box(0.018, 0.014, 0.145, b.steel, [R * (xn + 0.233), $t + 0.141 + 0.029 * Pe, W], null, 2e-3);
    }
  }
  for (let R of Oe) {
    ae.ibeam([-on, en, R], [on, en, R], 0.108, 0.14, b.dull), ae.ibeam([-on, nn, R], [on, nn, R], 0.12, 0.14, b.pale), ae.beam([-on + 0.06, nn + 0.021, R - 0.17], [on - 0.06, nn + 0.021, R + 0.17], 0.041, 0.047, b.steel);
    for (let W of [-0.61, 0.61]) ae.box(0.38, 0.045, 0.2, b.deep, [W, en + 0.083, R], null, 9e-3);
  }
  for (let R of [-1, 1]) {
    ae.box(0.16, cn + 0.18, 0.044, b.deep, [R * (Qt / 2 + 0.11), En, mn + 0.095], null, 8e-3);
    for (let W = 0; W < 8; W++) ae.box(0.12, 0.074, 6e-3, W % 2 ? b.yellow : b.black, [R * (Qt / 2 + 0.11), En - cn / 2 + 0.13 + W * (cn - 0.2) / 8, mn + 0.122], null, 1e-3);
    Qe.box(0.032, 0.032, 0.025, b.cool, [R * (Qt / 2 + 0.11), En + cn / 2 - 0.08, mn + 0.13], null, 4e-3);
  }
  for (let R of [-1, 1]) {
    let W = gn + vn * 0.31;
    ae.box(0.72, 0.068, 1.45, b.navy, [R * Jt, $t + 0.019, W], null, 0.014), ae.ibeam([R * xn, en, W - 0.6], [R * (Jt + 0.27), $t, W - 0.6], 0.069, 0.093, b.steel), ae.ibeam([R * xn, en, W + 0.6], [R * (Jt + 0.27), $t, W + 0.6], 0.069, 0.093, b.steel);
    for (let Pe = 0; Pe < 5; Pe++) {
      ae.box(0.51, 0.046, 0.54, b.pale, [R * Jt, $t + 0.13 + Pe * 0.064, W], [0, 0, R * 0.045], 0.011);
      for (let St of [-0.24, 0.24]) ae.box(0.038, 0.055, 0.033, b.yellow, [R * Jt + 0.24, $t + 0.16 + Pe * 0.064, W + St], null, 3e-3);
    }
    ct(ae, [R * (Jt + 0.35), $t + 0.06, W - 0.72], [R * (Jt + 0.35), $t + 0.06, W + 0.72], 0.13, 0.3);
  }
  for (let R of [-1, 1]) for (let W = 0; W < 2; W++) {
    let Pe = R * (on + 0.66), St = gn + vn * 0.71 + W * 0.43;
    ae.box(0.67, 0.06, 0.4, b.deep, [Pe, $t + 0.018, St], null, 0.012), ae.add(we(0.105, 0.07, 0.25, 18), b.steel, [Pe, $t + 0.185, St], he(Math.PI / 2, 0, 0)), ae.add(we(0.099, 0.099, 8e-3, 18), b.black, [Pe, $t + 0.185, St + 0.13], he(Math.PI / 2, 0, 0)), ae.add(pt(0.087, 7e-3), b.alloy, [Pe, $t + 0.185, St + 0.139]);
    for (let Pt of [-0.15, 0.15]) ae.beam([Pe + Pt, $t + 0.045, St], [Pe + Pt * 0.55, $t + 0.175, St], 0.026, 0.029, b.yellow);
  }
  ae.finish(Be), lt(Ye, Be, "Instanced orbital gusset and flange bolts"), Qe.finish(re, false);
  let Ke = [];
  for (let R of [-1, 1]) for (let W = 0; W < 4; W++) Ke.push({ p: [R * (1.41 + W % 2 * 0.47), C + 0.016, -0.59 + Math.floor(W / 2) * 0.35], q: he() });
  let tt = new e.InstancedMesh(me, Te, Ke.length);
  tt.name = "Orbital freight staging rack", tt.castShadow = true, Be.add(tt);
  let it = c + 0.562, Ge = Kt - 0.688, Dt = Ge - it, Vt = Math.max(10, Dt / 8.5), Tt = [], Xt = [3.8, Vt, 4.4, Vt];
  for (let R = 0; R < 2; R++) {
    let W = new e.Group();
    W.name = R === 0 ? "UP lane freight carriage" : "DOWN lane freight carriage", g.cabins.add(W);
    let Pe = new ot("Freight carriage chassis");
    Pe.box(0.46, 0.05, 0.51, b.deep, [0, -0.29, 0.305], null, 0.012), Pe.box(0.44, 0.037, 0.48, b.steel, [0, 0.337, 0.305], null, 0.011), Pe.box(0.4, 0.08, 0.42, b.pale, [0, 0.386, 0.273], null, 0.019);
    for (let Ut of [-1, 1]) {
      Pe.box(0.045, 0.61, 0.057, b.pale, [Ut * 0.213, 0.017, 0.527], null, 8e-3), Pe.box(0.04, 0.61, 0.07, b.dull, [Ut * 0.213, 0.017, 0.079], null, 7e-3), Pe.box(0.018, 0.185, 0.423, b.navy, [Ut * 0.237, -0.175, 0.312], null, 5e-3), Pe.box(0.021, 0.145, 0.202, b.glass, [Ut * 0.239, 0.183, 0.348], null, 5e-3), Pe.beam([Ut * 0.235, -0.065, 0.078], [Ut * 0.235, 0.284, 0.491], 0.021, 0.027, b.steel), Pe.pipe([Ut * 0.22, -0.27, 0.072], [Ut * 0.22, 0.3, 0.072], 9e-3, b.steel, 8), Pe.box(0.022, 0.041, 0.099, b.yellow, [Ut * 0.239, 0.073, 0.142], null, 3e-3);
      for (let sn of [-0.228, 0.27]) Pe.box(0.22, 0.11, 0.103, b.deep, [0, sn, -0.04], null, 8e-3), Pe.pipe([Ut * 0.048, sn, -0.055], [Ut * 0.048, sn, 0.05], 0.01, b.steel, 8), Pe.add(we(0.035, 0.035, 0.053, 14), b.rubber, [Ut * 0.055, sn, 3e-3], he(Math.PI / 2, 0, 0)), Pe.add(we(0.015, 0.015, 0.065, 12), b.steel, [Ut * 0.055, sn, 3e-3], he(Math.PI / 2, 0, 0)), Pe.beam([Ut * 0.104, sn, 0.01], [Ut * 0.198, sn, 0.13], 0.025, 0.039, b.steel);
    }
    for (let Ut = 0; Ut < 9; Ut++) Pe.add(we(0.01, 0.01, 0.37, 8), b.steel, [0, -0.256, 0.108 + Ut * 0.047], he(0, 0, Math.PI / 2));
    Pe.box(0.318, 0.235, 0.041, b.navy, [0, 0.059, 0.08], null, 0.012);
    for (let Ut = 0; Ut < 7; Ut++) Pe.box(0.017, 0.12, 0.01, b.steel, [-0.13 + Ut * 0.043, 0.093, 0.103], null, 2e-3);
    for (let Ut of [-0.22, 0.288]) Pe.box(0.41, 0.02, 0.016, b.yellow, [0, Ut, 0.548], null, 3e-3);
    Pe.finish(W);
    let St = [];
    for (let Ut of [-1, 1]) {
      let sn = new e.Group();
      sn.name = `Sliding cargo door ${Ut}`, W.add(sn), sn.userData.side = Ut;
      let Sn = new ot("Cargo door");
      Sn.box(0.185, 0.405, 0.02, b.pale, [0, 0, 0], null, 6e-3), Sn.box(0.132, 0.096, 0.012, b.glass, [0, 0.095, 0.014], null, 5e-3), Sn.box(0.019, 0.091, 0.012, b.dull, [Ut * 0.059, -0.042, 0.018], null, 2e-3), Sn.box(0.181, 0.013, 8e-3, b.yellow, [0, -0.124, 0.016], null, 2e-3);
      let kn = new e.Mesh(Sn.singleGeometry(), Te);
      kn.castShadow = true, sn.add(kn), St.push(sn);
    }
    let Pt = new e.Mesh(me, Te);
    Pt.name = "Removable freight payload", Pt.position.set(0, -0.248, 0.296), Pt.scale.set(0.9, 0.94, 1.18), Pt.castShadow = true, W.add(Pt);
    let zt = { root: W, doors: St, cargo: Pt, lane: R, phase: R === 0 ? 0 : 2, t: R === 0 ? 0.8 : 1.7, y: R === 0 ? it : Ge, phaseName: "", cargoOpacity: 1 };
    Tt.push(zt);
  }
  function U(R) {
    return R < 0.14 ? R * R / (2 * 0.14 * (1 - 0.14)) : R > 1 - 0.14 ? 1 - (1 - R) ** 2 / (2 * 0.14 * (1 - 0.14)) : (R - 0.14 / 2) / (1 - 0.14);
  }
  function be(R) {
    let W = u(R.t / Xt[R.phase]);
    R.phase === 0 ? R.y = it : R.phase === 1 ? R.y = it + U(W) * Dt : R.phase === 2 ? R.y = Ge : R.y = Ge - U(W) * Dt, R.phaseName = ["ground loading / dwell", "accelerating, climbing, braking", "orbital unloading / dwell", "accelerating, descending, braking"][R.phase], R.root.position.set(ft[R.lane].bottom[0], R.y, ft[R.lane].bottom[2]);
    let Pe = 0;
    (R.phase === 0 || R.phase === 2) && (Pe = Math.min(1, W / 0.13, (1 - W) / 0.13)), R.doors.forEach((St) => St.position.set(St.userData.side * (0.1 + 0.2 * Pe), -0.015, 0.557)), R.cargo.visible = R.phase === 1 || R.phase === 0 && W > 0.22 || R.phase === 2 && W < 0.78, R.cargo.position.z = 0.296, R.phase === 0 && W > 0.22 && W < 0.7 && (R.cargo.position.z = 0.296 + 0.33 * (1 - (W - 0.22) / 0.48)), R.phase === 2 && W > 0.22 && W < 0.78 && (R.cargo.position.z = 0.296 + 0.33 * ((W - 0.22) / 0.56));
  }
  Tt.forEach(be);
  let Le = new e.Group();
  Le.name = "Permanent assembly robots, cradles and alignment rails", g.shipAssembly.add(Le);
  let w = new e.Group();
  w.name = "OPTIONAL removable demonstration hull", g.shipAssembly.add(w);
  let I = new ot("Dock positioning equipment"), H = [];
  for (let R of [-1, 1]) for (let W of [0.23, 0.56, 0.82]) {
    let Pe = gn + W * vn, St = R * (on + 0.1);
    I.box(0.24, 0.1, 0.44, b.deep, [St, $t + 0.14, Pe], null, 0.013);
    for (let sn of [-0.16, 0.16]) I.add(we(0.055, 0.055, 0.025, 14), b.steel, [St + R * 0.07, $t + 0.096, Pe + sn], he(0, 0, Math.PI / 2));
    I.add(we(0.105, 0.125, 0.12, 16), b.dull, [St, $t + 0.244, Pe]);
    let Pt = new e.Group();
    Pt.name = `Articulated assembly arm ${R}/${W}`, Pt.position.set(St, $t + 0.305, Pe), Le.add(Pt);
    let zt = new ot("robot arm with separate hydraulic actuator");
    zt.add(we(0.082, 0.082, 0.086, 18), b.steel, [0, 0.035, 0], he(Math.PI / 2, 0, 0)), zt.beam([0, 0.052, 0], [R * 0.15, 0.36, 0], 0.097, 0.09, b.pale), zt.box(0.115, 0.21, 0.105, b.navy, [R * 0.052, 0.18, 0], [0, 0, -R * 0.46], 0.014), zt.pipe([R * 0.07, 0.065, 0.056], [R * 0.215, 0.305, 0.056], 0.023, b.dull, 12), zt.pipe([R * 0.14, 0.181, 0.056], [R * 0.23, 0.35, 0.056], 0.013, b.alloy, 10), zt.add(we(0.067, 0.067, 0.094, 16), b.steel, [R * 0.15, 0.37, 0], he(Math.PI / 2, 0, 0)), zt.beam([R * 0.15, 0.37, 0], [R * 0.02, 0.65, 0], 0.074, 0.075, b.yellow), zt.beam([R * 0.185, 0.37, 0.038], [R * 0.07, 0.63, 0.038], 0.022, 0.026, b.dull), zt.add(we(0.049, 0.049, 0.078, 16), b.dull, [R * 0.02, 0.652, 0], he(Math.PI / 2, 0, 0)), zt.box(0.107, 0.074, 0.122, b.pale, [-R * 0.041, 0.681, 0], null, 0.01);
    for (let sn of [-0.045, 0.045]) zt.box(0.058, 0.022, 0.023, b.steel, [-R * 0.098, 0.681, sn], null, 3e-3);
    zt.pipe([R * 0.071, 0.16, -0.065], [R * 0.209, 0.359, -0.065], 8e-3, b.black, 8), zt.pipe([R * 0.209, 0.359, -0.065], [R * 0.063, 0.621, -0.065], 8e-3, b.black, 8);
    let Ut = new e.Mesh(zt.singleGeometry(), Te);
    Ut.castShadow = true, Pt.add(Ut), H.push({ root: Pt, side: R, phase: p() * Math.PI * 2 });
  }
  for (let R of [gn + vn * 0.2, gn + vn * 0.5, gn + vn * 0.77]) for (let W of [-Qt * 0.23, Qt * 0.23]) I.box(0.22, 0.065, 0.27, b.deep, [W, en + 0.035, R], null, 9e-3), I.add(we(0.034, 0.045, 0.069, 12), b.steel, [W, en + 0.087, R]), I.box(0.14, 0.024, 0.17, b.yellow, [W, En - cn / 2 - 0.053, R], null, 5e-3);
  I.finish(Le);
  let L = Math.min(Qt / 3, cn / 2, vn / 8), q = gn + vn * 0.49;
  w.position.set(0, En - 0.04, q), w.scale.setScalar(L);
  let J = new e.Group(), Se = new e.Group(), _e = new e.Group(), Re = new e.Group();
  J.name = "Keel and pressure spine", Se.name = "Exposed frames and propulsion mounts", _e.name = "Individually staged armored hull segments", Re.name = "Separate propulsion modules", w.add(J, Se, _e, Re);
  let We = new ot("ship keel");
  We.box(0.27, 0.2, 5.66, b.steel, [0, -0.11, 0], null, 0.021), We.box(0.37, 0.17, 4.51, b.deep, [0, 0.053, -0.44], null, 0.02);
  for (let R of [-0.15, 0.15]) We.pipe([R, -0.01, -2.74], [R, -0.01, 2.58], 0.019, b.alloy, 10);
  We.beam([0, -0.11, 2.57], [0, -0.015, 3.02], 0.088, 0.13, b.steel);
  for (let R = -2.65; R < 2.2; R += 0.4) We.box(0.54, 0.045, 0.055, b.steel, [0, -0.187, R], null, 5e-3);
  let Ze = new e.Mesh(We.singleGeometry(), Te);
  Ze.castShadow = true, J.add(Ze);
  let nt = new ot("ship structural frames");
  for (let R = 0; R < 12; R++) {
    let W = -2.55 + R * 0.44, Pe = 0.54 + 0.24 * Math.sin(Math.PI * R / 12), St = 0.34 + 0.08 * Math.sin(Math.PI * R / 12), Pt = [[-Pe, -0.2], [-Pe * 0.85, St * 0.68], [-Pe * 0.42, St], [Pe * 0.42, St], [Pe * 0.85, St * 0.68], [Pe, -0.2], [Pe * 0.36, -0.34], [-Pe * 0.36, -0.34]];
    Pt.forEach((zt, Ut) => nt.beam([zt[0], zt[1], W], [Pt[(Ut + 1) % Pt.length][0], Pt[(Ut + 1) % Pt.length][1], W], 0.027, 0.047, b.steel));
    for (let zt of [-1, 1]) nt.beam([0, -0.12, W], [zt * Pe, -0.18, W], 0.032, 0.044, b.dull);
  }
  for (let R of [-0.57, 0.57]) nt.box(0.29, 0.27, 0.63, b.deep, [R, -0.054, -2.41], null, 0.023);
  let T = new e.Mesh(nt.singleGeometry(), Te);
  T.castShadow = true, Se.add(T);
  let N = [];
  for (let R = 0; R < 10; R++) {
    let W = -2.37 + R * 0.46, Pe = 0.51 + 0.2 * Math.sin(Math.PI * R / 10), St = new ot("segmented hull armor");
    for (let zt of [-1, 1]) St.box(Pe * 0.93, 0.069, 0.436, R % 3 === 0 ? b.pale : b.navy, [zt * Pe * 0.49, 0.353, W], [0, 0, -zt * 0.21], 9e-3), St.box(0.079, 0.36, 0.437, b.pale, [zt * (Pe + 0.018), 0.088, W], [0, 0, zt * 0.13], 0.012), St.box(0.38, 0.055, 0.429, b.deep, [zt * 0.26, -0.284, W], [0, 0, zt * 0.16], 6e-3), St.box(0.044, 0.13, 0.017, b.steel, [zt * (Pe + 0.055), 0.111, W + 0.15], [0, 0, zt * 0.13], 3e-3), St.box(0.044, 0.036, 0.03, b.yellow, [zt * (Pe + 0.062), -0.078, W - 0.12], null, 4e-3);
    let Pt = new e.Mesh(St.singleGeometry(), Te);
    Pt.name = `Armor segment ${String(R + 1).padStart(2, "0")}`, Pt.castShadow = true, _e.add(Pt), N.push(Pt);
  }
  let te = new ot("faceted nose cap");
  te.box(0.63, 0.32, 0.54, b.navy, [0, 0.033, 2.23], null, 0.075), te.add(we(0, 0.32, 0.54, 6), b.pale, [0, 0.034, 2.73], he(Math.PI / 2, 0, 0), [1, 1, 0.66]), te.box(0.37, 0.066, 0.37, b.glass, [0, 0.223, 1.95], [0, 0, 0], 0.024), te.box(0.47, 0.14, 0.46, b.deep, [0, 0.391, 1.79], [0.06, 0, 0], 0.028), te.box(0.37, 0.055, 0.016, b.glass, [0, 0.412, 2.023], [0.06, 0, 0], 8e-3);
  for (let R of [-1, 1]) te.box(0.02, 0.07, 0.4, b.steel, [R * 0.201, 0.384, 1.81], [0.06, 0, 0], 4e-3), te.box(0.23, 0.039, 0.69, b.navy, [R * 0.83, 0.02, -1.56], [0, 0, R * 0.16], 9e-3), te.box(0.23, 0.025, 0.43, b.dull, [R * 1, -0.035, -1.69], [0, 0, R * 0.22], 6e-3), te.box(0.014, 0.012, 0.54, b.yellow, [R * 0.921, 0.053, -1.59], [0, 0, R * 0.16], 2e-3);
  let oe = new e.Mesh(te.singleGeometry(), Te);
  oe.name = "Bridge glass and six-facet nose", _e.add(oe), N.push(oe);
  let Ne = new ot("engine bells with recessed cores");
  for (let R of [-0.57, 0.57]) {
    Ne.add(we(0.2, 0.14, 0.47, 20), b.steel, [R, -0.046, -2.79], he(Math.PI / 2, 0, 0)), Ne.add(we(0.184, 0.184, 0.012, 20), b.black, [R, -0.046, -3.025], he(Math.PI / 2, 0, 0)), Ne.add(pt(0.175, 0.012), b.alloy, [R, -0.046, -3.038]), Ne.add(pt(0.1, 0.014), b.dull, [R, -0.046, -3.039]);
    for (let W = 0; W < 12; W++) {
      let Pe = W * Math.PI / 6;
      Ne.beam([R + 0.1 * Math.cos(Pe), -0.046 + 0.1 * Math.sin(Pe), -2.58], [R + 0.2 * Math.cos(Pe), -0.046 + 0.2 * Math.sin(Pe), -2.96], 0.014, 0.016, b.dull);
    }
  }
  let Ue = new e.Mesh(Ne.singleGeometry(), Te);
  Ue.castShadow = true, Re.add(Ue);
  let x = new e.Group(), D = new e.Group(), Z = new e.Group();
  x.name = "far ground port", D.name = "far cable bundles", Z.name = "far open dock", g.silhouette.add(x, D, Z);
  let j = y(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.76, metalness: 0.26 })), z = new ot("far ground");
  z.box(s.width, 0.06, s.depth, b.concrete, [0, c - 0.03, 0], null, 0.01), z.box(1.5 * Fe, 0.67, 1.04 * f, b.navy, [de, c + 0.34, X], null, 0.02), z.box(0.63, 1.05, 0.6, b.pale, [k, c + 0.52, ee], null, 0.015), z.box(0.88 * d, 0.51, 0.92 * f, b.pale, [ye, c + 0.26, Ee], null, 0.012);
  for (let R of [-0.95 * d, 0.95 * d]) z.box(0.14, 1.52, 0.22, b.pale, [R, c + 0.76, -0.8 * f], null, 0.015);
  z.box(2.08 * d, 0.15, 0.25, b.pale, [0, c + 1.54, -0.8 * f], null, 0.012);
  for (let R of [1 * d, 2.43 * d]) z.box(0.12, 0.85, 0.49, b.yellow, [R, c + 0.42, 0.69 * f], null, 0.01);
  z.box(1.8 * d, 0.11, 0.55 * f, b.pale, [1.73 * d, c + 0.86, 0.69 * f], null, 0.01);
  let ge = new e.Mesh(z.singleGeometry(), j);
  ge.name = "One-call ground silhouette", x.add(ge);
  let xe = new ot("far cables");
  for (let R of P) xe.box(0.067, n - Et, 0.047, b.steel, [R, (n + Et) / 2, v], null, 2e-3);
  xe.box(0.023, n - c, 0.023, b.dull, [Ot, (n + c) / 2, Zt], null, 1e-3), D.add(new e.Mesh(xe.singleGeometry(), j));
  let Me = new ot("far station");
  Me.box(5.25, 0.14, 1.07, b.deep, [0, C - 0.08, -1.73], null, 0.01), Me.box(5.25, 0.12, 0.65, b.navy, [0, C - 0.07, 0.17], null, 0.01);
  for (let R of [-1.79, 1.79]) Me.box(1.53, 0.11, 1.75, b.navy, [R, C - 0.06, -0.86], null, 0.01);
  for (let R of [-2.01, 2.01]) Me.box(0.88, 0.58, 1.2, b.pale, [R, C + 0.3, -1.65], null, 0.026);
  for (let R of [-1, 1]) {
    for (let W of [en, nn]) Me.beam([R * on, W, gn], [R * on, W, mn], 0.14, 0.17, b.pale);
    for (let W = 0; W < Oe.length; W++) Me.beam([R * on, en, Oe[W]], [R * on, nn, Oe[W]], 0.15, 0.17, b.pale), W < Oe.length - 1 && Me.beam([R * xn, en, Oe[W]], [R * xn, nn, Oe[W + 1]], 0.075, 0.083, b.dull);
    Me.box(0.39, 0.065, vn + 0.28, b.deep, [R * (on + 0.2), $t, (gn + mn) / 2], null, 5e-3), Me.box(0.67, 0.045, 2.75, b.navy, [R * 3.02, C + 0.04, -0.97], null, 8e-3);
  }
  for (let R of Oe) for (let W of [en, nn]) Me.beam([-on, W, R], [on, W, R], 0.12, 0.13, b.pale);
  Z.add(new e.Mesh(Me.singleGeometry(), j));
  let Je = ke(0.47, 0.73, 0.49, 0.025), Mt = y(new e.MeshStandardMaterial({ color: 11186866, roughness: 0.6, metalness: 0.3 })), dt = new e.InstancedMesh(Je, Mt, 2);
  dt.name = "One-call carriage silhouettes", g.silhouette.add(dt);
  let yt = { running: true, activity: 1, construction: 1, storageFill: 0.5, assemblyProgress: 0, showDemoShip: false }, wt = false, It = 0, Bt = 0, qt = { groundVisible: true, cableVisible: true, stationVisible: true, detail: "near", animate: true };
  function dn(R = {}) {
    if (!wt) {
      for (let W of ["running", "showDemoShip"]) W in R && (yt[W] = !!R[W]);
      for (let W of ["activity", "construction", "storageFill", "assemblyProgress"]) W in R && (yt[W] = u(R[W]));
      Rt(Ve, Ie, yt.storageFill), Rt(tt, Ke, yt.storageFill), le.visible = yt.construction >= 0.18, Be.visible = yt.construction >= 0.42, Le.visible = yt.construction >= 0.73, w.visible = yt.showDemoShip && yt.construction >= 0.73, J.visible = yt.assemblyProgress > 0, Se.visible = yt.assemblyProgress >= 0.12, N.forEach((W, Pe) => W.visible = yt.assemblyProgress >= (W === oe ? 0.6 : 0.32 + Pe / N.length * 0.53)), Re.visible = yt.assemblyProgress >= 0.9, Ui(qt);
    }
  }
  function In(R) {
    return R.y < it + 2 ? "ground" : R.y > Ge - 2 ? "station" : "cable";
  }
  function Vn(R, W) {
    return R === "ground" ? W.groundVisible : R === "station" ? W.stationVisible : W.cableVisible;
  }
  function Xi(R) {
    for (let W = 0; W < Tt.length; W++) {
      let Pe = Tt[W], St = Vn(In(Pe), R) && yt.construction >= 0.58;
      ie.compose(A(Pe.root.position.x, Pe.root.position.y + 0.055, Pe.root.position.z + 0.3), ue, A(St ? 1 : 0, St ? 1 : 0, St ? 1 : 0)), dt.setMatrixAt(W, ie);
    }
    dt.instanceMatrix.needsUpdate = true, dt.computeBoundingBox(), dt.computeBoundingSphere();
  }
  function Ui(R) {
    let W = R.detail !== "far";
    g.groundPort.visible = W && R.groundVisible, g.cables.visible = W && R.cableVisible && yt.construction >= 0.32, g.station.visible = W && R.stationVisible, g.shipAssembly.visible = W && R.stationVisible, g.cabins.visible = W && yt.construction >= 0.58, g.effects.visible = W && yt.construction >= 0.73, ze.visible = R.groundVisible, re.visible = R.stationVisible, Tt.forEach((Pe) => Pe.root.visible = Vn(In(Pe), R)), g.silhouette.visible = !W, x.visible = R.groundVisible, D.visible = R.cableVisible && yt.construction >= 0.32, Z.visible = R.stationVisible && yt.construction >= 0.42, Xi(R);
  }
  function is(R = 0, W = {}) {
    if (wt) return;
    qt = { groundVisible: W.groundVisible === void 0 ? true : !!W.groundVisible, cableVisible: W.cableVisible === void 0 ? true : !!W.cableVisible, stationVisible: W.stationVisible === void 0 ? true : !!W.stationVisible, detail: W.detail === "far" ? "far" : "near", animate: W.animate === void 0 ? true : !!W.animate };
    let Pe = Math.min(0.1, Math.max(0, Number.isFinite(R) ? R : 0)) * yt.activity;
    if (qt.animate && yt.running && qt.detail === "near" && yt.activity > 0 && (qt.groundVisible && yt.construction >= 0.73 && (It += Pe, kt.position.x = (-0.9 + Math.sin(It * 0.15) * 0.94) * d, pe.position.x = (1.71 + Math.sin(It * 0.28) * 0.44) * d), qt.stationVisible && yt.construction >= 0.73 && (Bt += Pe, H.forEach((Pt) => {
      Pt.root.rotation.y = Math.sin(Bt * 0.3 + Pt.phase) * 0.16;
    })), yt.construction >= 0.58)) for (let Pt of Tt) Vn(In(Pt), qt) && (Pt.t += Pe, Pt.t >= Xt[Pt.phase] && (Pt.t -= Xt[Pt.phase], Pt.phase = (Pt.phase + 1) % 4), be(Pt));
    Ui(qt);
  }
  let Ns = [[-s.width / 2, -s.depth / 2], [s.width / 2, -s.depth / 2], [s.width / 2, s.depth / 2], [-s.width / 2, s.depth / 2]], Ro = (R, W) => Math.abs(R) <= s.width / 2 && Math.abs(W) <= s.depth / 2 ? c : a(R, W), Kn = { whole: { eye: [n * 0.35, n * 0.53, n * 0.77], target: [0, n * 0.5, 1.8] }, ground: { eye: [6.1, c + 4.35, 6.6], target: [0, c + 0.5, -0.05] }, station: { eye: [10.5, Kt + 6.1, 13.5], target: [0, Kt - 0.05, 3.15] }, cabin: { eye: [1.01 * d, c + 1.12, 1.29 * f], target: [P[0], c + 0.68, v + 0.31] }, groundLoading: { eye: [2.65, c + 2.05, 2.7], target: [0.05, c + 0.65, -0.22] }, dockRear: { eye: [-7.7, Kt + 3.75, -5.7], target: [0, Kt - 0.04, 2.38] }, orbitalTransfer: { eye: [4.6, Kt + 2.12, -4.36], target: [0.1, Kt - 0.48, -0.56] }, departure: { eye: [4.3, Kt + 2.82, mn + 5.5], target: [0, En, gn + vn * 0.52] } };
  function ai(R, W) {
    return { position: R, normal: A(...W).normalize().toArray() };
  }
  let Po = { ground: ai([0, 0, 0], [0, 1, 0]), viewGround: ai(Kn.ground.eye, A(...Kn.ground.target).sub(A(...Kn.ground.eye)).toArray()), viewStation: ai(Kn.station.eye, A(...Kn.station.target).sub(A(...Kn.station.eye)).toArray()), cableBottom: ai([0, Et, v], [0, 1, 0]), cableTop: ai([0, Kt, v], [0, -1, 0]), station: ai([0, Kt, v], [0, -1, 0]), dock: ai([0, En, gn], [0, 0, 1]), departure: ai([0, En, mn + 0.16], [0, 0, 1]) }, Bu = { up: [0, 1, 0], clearanceRadius: Math.min(Qt, cn) / 2 };
  dn({}), is(0), _.updateMatrixWorld(true);
  let xf = (R) => {
    let W = new e.Box3().setFromObject(R, true);
    return W.isEmpty() ? null : { min: W.min.toArray(), max: W.max.toArray() };
  }, Yi = Object.fromEntries(Object.entries(g).map(([R, W]) => [R, xf(W)])), il = new e.Box3(A(P[0] - 0.53, it - 0.325, v - 0.11), A(P[1] + 0.53, Ge + 0.435, v + 0.86));
  Yi.cabins = { min: il.min.toArray(), max: il.max.toArray() };
  let sl = new e.Box3(A(-Jt - 0.14, $t + 0.055, gn - 0.08), A(Jt + 0.14, En + cn / 2, mn + 0.08));
  Yi.shipAssembly && sl.union(new e.Box3(A(...Yi.shipAssembly.min), A(...Yi.shipAssembly.max))), Yi.shipAssembly = { min: sl.min.toArray(), max: sl.max.toArray() };
  let rl = new e.Box3();
  for (let R of Object.values(Yi)) R && rl.union(new e.Box3(A(...R.min), A(...R.max)));
  let Fs = { min: rl.min.toArray(), max: rl.max.toArray() };
  Yi.silhouette = { min: [...Fs.min], max: [...Fs.max] };
  let ol = { name: "TETHER / \u592A\u7A7A\u7535\u68AF\u7269\u6D41\u6E2F\u4E0E\u5F00\u653E\u5F0F\u8F68\u9053\u8239\u575E", version: "1.0.0", seed: t, stationHeight: n, portSize: s, dockClearance: r, units: "model units; not metres", groundGrade: c, departureDirection: "+Z", dockClearBox: { min: [-Qt / 2, En - cn / 2, gn], max: [Qt / 2, En + cn / 2, mn] }, transport: { cableLanes: 2, maintenanceLane: 1, cabinCount: 2, dwellGround: Xt[0], dwellStation: Xt[2], travelSeconds: Vt, cabinBottomCenter: it, cabinTopCenter: Ge, carriageSize: [0.5, 0.75, 0.65], freightBoxSize: [0.42, 0.23, 0.25], truckSize: [0.49, 0.22, 0.22] }, views: Kn, bounds: Fs, groupBounds: Yi, footprint: Ns, equipment: ["terraced concrete port and retaining edges", "entrance road, turn apron and forklift route", "dual steel freight rails and rail clips", "four-bay warehouse with roller shutters", "battery yard tractor", "rail gantry, spreader and twin hoist ropes", "stock-controlled corrugated freight boxes", "paired tension foundations and headstock", "exposed service pipe flanges and maintenance shop", "elevated glazed control room", "two cable-guided roller carriages with sliding cargo doors", "separate maintenance cable", "open orbital freight-transfer wells", "orbital control locks and radiator wings", "double-chord I-beam drydock with bolted gussets", "grated side catwalks and handrails", "six hydraulic assembly arms on positioning rails", "armor panel transport jigs", "separate engine-module cradles", "optional staged keel, frames, armor and propulsion demonstration craft"], animationObjects: 16, design: "Open-front logistics. Paired anchor blocks; visible flange/web steel; real chamfer and corner faces; mechanically connected bogies, hoist ropes and hydraulic rods. Dock portal and permanent robots remain outside the clearance box. Static geometry is merged by surface material; fasteners and freight boxes are instanced.", limitations: ["Cable transport is an illustrative, nonphysical motion cycle.", "Construction uses explicit visibility stages; assemblyProgress is exclusively host controlled.", "A hidden or far-view region does not accumulate animation time. dt is bounded to 0.10 seconds per call.", "Ground is terraced to the highest supplied terrain sample inside the footprint; terrain is not deformed outside the port.", "Demo ship departure is represented by an unobstructed axis and anchors; automatic ship spawning, build queues and departure are deliberately host owned."] };
  function Zi() {
    if (!wt) {
      wt = true, _.traverse((R) => {
        R.isInstancedMesh && R.dispose();
      });
      for (let R of m) R.dispose();
      for (let R of S) R.dispose();
      m.clear(), S.clear(), O.clear(), _.clear();
    }
  }
  return dn({}), is(0), { root: _, groups: g, footprint: Ns, bounds: Fs, groupBounds: Yi, anchors: Po, cableAnchors: ft, dockAccess: Bu, heightAt: Ro, setVisualState: dn, update: is, dispose: Zi, views: Kn, meta: ol, getVisualState: () => ({ ...yt }), getCabinStates: () => Tt.map((R) => ({ lane: R.lane, position: R.root.position.toArray(), region: In(R), phase: R.phaseName, phaseFraction: R.t / Xt[R.phase], visible: R.root.visible && g.cabins.visible })) };
}
function zg(i42 = {}) {
  let e = i42.THREE;
  if (!e?.InstancedMesh) throw new TypeError("createSpaceportCity requires THREE.");
  let t = Number.isFinite(i42.seed) ? i42.seed | 0 : 17, n = i42.stationHeight ?? 240, s = { width: 48, depth: 36, ...i42.portSize }, r = { width: 3, height: 2, length: 8, ...i42.dockClearance };
  if (!(Number.isFinite(s.width) && Number.isFinite(s.depth) && s.width >= 48 && s.depth >= 36)) throw new RangeError("The city layout needs a finite portSize of at least 48 \xD7 36.");
  for (let E of Object.values(r)) if (!(Number.isFinite(E) && E > 0)) throw new RangeError("dockClearance dimensions must be positive finite numbers.");
  if (s.width / 6 - r.width / 2 < 6.45 || s.width / 4.8 - r.width < 2.1) throw new RangeError("Increase portSize.width to keep all four drydocks clear of the orbital ring and each other.");
  if (!(Number.isFinite(n) && n > 30)) throw new RangeError("stationHeight must be greater than 30.");
  let o = s.width, a = s.depth, l = o / 48, c = a / 36, d = typeof i42.ground?.heightAt == "function" ? i42.ground.heightAt : () => 0, f = (E, B) => {
    let K = Number(d(E, B));
    return Number.isFinite(K) ? K : 0;
  }, h = -1 / 0;
  for (let E = 0; E <= 16; E++) for (let B = 0; B <= 12; B++) h = Math.max(h, f((E / 16 - 0.5) * o, (B / 12 - 0.5) * a));
  if (n <= h + 30) throw new RangeError("The orbital connection must be at least 30 units above the graded city.");
  let p = new e.Group();
  p.name = "TETHER METROPOLIS \xB7 logistics city";
  let u = {};
  for (let E of ["groundPort", "roads", "perimeter", "edgeTerrain", "cables", "station", "orbitalEdges", "cabins", "shipAssembly", "effects", "silhouette"]) u[E] = new e.Group(), u[E].name = E, p.add(u[E]);
  let _ = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set(), m = (E) => (_.add(E), E), S = (E) => (g.add(E), E), M = { paint: S(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.57, metalness: 0.35 })), steel: S(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.82 })), ground: S(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.04 })), light: S(new e.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.2, emissive: 14792303, emissiveIntensity: 0.6 })) }, y = { pale: { mat: "paint", color: 11647159 }, white: { mat: "paint", color: 12896447 }, navy: { mat: "paint", color: 3426644 }, deep: { mat: "paint", color: 2372926 }, steel: { mat: "steel", color: 8293008 }, alloy: { mat: "steel", color: 11713214 }, dull: { mat: "steel", color: 5464426 }, black: { mat: "paint", color: 1515299 }, yellow: { mat: "paint", color: 12034126 }, glass: { mat: "steel", color: 3233386 }, concrete: { mat: "ground", color: 7502712 }, soil: { mat: "ground", color: 6450021 }, road: { mat: "ground", color: 3423294 }, light: { mat: "light", color: 14536877 }, rust: { mat: "paint", color: 8873033 } }, Y = t >>> 0 || 1, b = () => (Y ^= Y << 13, Y ^= Y >>> 17, Y ^= Y << 5, (Y >>> 0) / 4294967296), O = (E, B, K) => new e.Vector3(E, B, K), A = (E = 0, B = 0, K = 0) => new e.Quaternion().setFromEuler(new e.Euler(E, B, K)), V = O(0, 1, 0), ie = new e.Quaternion(), Q = new e.Matrix4(), ue = new e.Matrix3(), fe = new e.Vector3(), He = new e.Vector3(), he = new e.Color(), Ae = /* @__PURE__ */ new Map(), ke = (E) => Math.min(1, Math.max(0, Number.isFinite(E) ? E : 0)), we = (E, B, K) => [E * l, h + B, K * c];
  function pt(E, B, K, Xe = 0) {
    let ht = `box:${E},${B},${K},${Xe}`;
    if (Ae.has(ht)) return Ae.get(ht);
    if (!Xe) {
      let rn = m(new e.BoxGeometry(E, B, K));
      return Ae.set(ht, rn), rn;
    }
    let st = [E / 2, B / 2, K / 2], mt = Math.min(Xe, ...st.map((rn) => rn * 0.45)), Ft = st.map((rn) => rn - mt), fn = [];
    function an(rn, Ln) {
      let _i = O(...rn[0]), Us = O(...rn[1]).sub(_i), ar = O(...rn[2]).sub(_i);
      Us.cross(ar).dot(O(...Ln)) < 0 && rn.reverse();
      for (let Bi = 1; Bi < rn.length - 1; Bi++) fn.push(...rn[0], ...rn[Bi], ...rn[Bi + 1]);
    }
    for (let rn = 0; rn < 3; rn++) for (let Ln of [-1, 1]) {
      let _i = (rn + 1) % 3, Us = (rn + 2) % 3, ar = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([al, Ou]) => {
        let Io = [0, 0, 0];
        return Io[rn] = Ln * st[rn], Io[_i] = al * Ft[_i], Io[Us] = Ou * Ft[Us], Io;
      }), Bi = [0, 0, 0];
      Bi[rn] = Ln, an(ar, Bi);
    }
    for (let rn = 0; rn < 3; rn++) for (let Ln = rn + 1; Ln < 3; Ln++) for (let _i of [-1, 1]) for (let Us of [-1, 1]) {
      let ar = 3 - rn - Ln, Bi = [[rn, -1], [Ln, -1], [Ln, 1], [rn, 1]].map(([Ou, Io]) => {
        let ku = [0, 0, 0];
        return ku[rn] = _i * (Ou === rn ? st[rn] : Ft[rn]), ku[Ln] = Us * (Ou === Ln ? st[Ln] : Ft[Ln]), ku[ar] = Io * Ft[ar], ku;
      }), al = [0, 0, 0];
      al[rn] = _i, al[Ln] = Us, an(Bi, al);
    }
    for (let rn of [-1, 1]) for (let Ln of [-1, 1]) for (let _i of [-1, 1]) an([0, 1, 2].map((Us) => [rn, Ln, _i].map((ar, Bi) => ar * (Us === Bi ? st[Bi] : Ft[Bi]))), [rn, Ln, _i]);
    let Fn = m(new e.BufferGeometry());
    return Fn.setAttribute("position", new e.Float32BufferAttribute(fn, 3)), Fn.computeVertexNormals(), Ae.set(ht, Fn), Fn;
  }
  function ot(E, B, K = 12, Xe = E) {
    let ht = `cyl:${E},${Xe},${B},${K}`;
    return Ae.has(ht) || Ae.set(ht, m(new e.CylinderGeometry(E, Xe, B, K))), Ae.get(ht);
  }
  function Ce(E, B, K = 32) {
    let Xe = `torus:${E},${B},${K}`;
    return Ae.has(Xe) || Ae.set(Xe, m(new e.TorusGeometry(E, B, 6, K))), Ae.get(Xe);
  }
  class le {
    constructor(B) {
      this.name = B, this.a = /* @__PURE__ */ new Map();
    }
    add(B, K, Xe = [0, 0, 0], ht = ie, st = [1, 1, 1]) {
      this.a.has(K.mat) || this.a.set(K.mat, { p: [], n: [], c: [] });
      let mt = this.a.get(K.mat), Ft = B.attributes.position, fn = B.attributes.normal, an = B.index;
      Q.compose(O(...Xe), ht, O(...st)), ue.getNormalMatrix(Q), he.set(K.color);
      for (let Fn = 0, rn = an ? an.count : Ft.count; Fn < rn; Fn++) {
        let Ln = an ? an.getX(Fn) : Fn;
        fe.fromBufferAttribute(Ft, Ln).applyMatrix4(Q), He.fromBufferAttribute(fn, Ln).applyMatrix3(ue).normalize(), mt.p.push(fe.x, fe.y, fe.z), mt.n.push(He.x, He.y, He.z), mt.c.push(he.r, he.g, he.b);
      }
      return this;
    }
    box(B, K, Xe, ht, st, mt = 5e-3, Ft = null) {
      return this.add(pt(B, K, Xe, mt), ht, st, Ft ? A(...Ft) : ie);
    }
    beam(B, K, Xe, ht, st = y.steel) {
      let mt = O(...K).sub(O(...B)), Ft = mt.length();
      return Ft < 1e-8 ? this : this.add(pt(Xe, Ft, ht, Math.min(Xe, ht) * 0.08), st, O(...B).addScaledVector(mt, 0.5).toArray(), new e.Quaternion().setFromUnitVectors(V, mt.normalize()));
    }
    pipe(B, K, Xe, ht = y.steel, st = 8) {
      let mt = O(...K).sub(O(...B)), Ft = mt.length();
      return Ft < 1e-8 ? this : this.add(ot(Xe, Ft, st), ht, O(...B).addScaledVector(mt, 0.5).toArray(), new e.Quaternion().setFromUnitVectors(V, mt.normalize()));
    }
    ibeam(B, K, Xe, ht, st = y.steel) {
      let mt = O(...K).sub(O(...B)), Ft = mt.length(), fn = O(...B).addScaledVector(mt, 0.5), an = new e.Quaternion().setFromUnitVectors(V, mt.normalize());
      for (let Fn of [-1, 1]) this.add(pt(Xe, Ft, ht * 0.16, 3e-3), st, fn.clone().add(O(0, 0, Fn * ht * 0.42).applyQuaternion(an)).toArray(), an);
      return this.add(pt(Xe * 0.14, Ft, ht * 0.87, 2e-3), st, fn.toArray(), an);
    }
    geometry() {
      let B = { p: [], n: [], c: [] };
      for (let K of this.a.values()) for (let Xe of ["p", "n", "c"]) for (let ht of K[Xe]) B[Xe].push(ht);
      return this.make(B);
    }
    make(B) {
      let K = m(new e.BufferGeometry());
      return K.setAttribute("position", new e.Float32BufferAttribute(B.p, 3)), K.setAttribute("normal", new e.Float32BufferAttribute(B.n, 3)), K.setAttribute("color", new e.Float32BufferAttribute(B.c, 3)), K.computeBoundingBox(), K.computeBoundingSphere(), K;
    }
    finish(B, K = true) {
      for (let [Xe, ht] of this.a) {
        let st = new e.Mesh(this.make(ht), M[Xe]);
        st.name = `${this.name} / ${Xe}`, st.castShadow = K, st.receiveShadow = true, B.add(st);
      }
      this.a.clear();
    }
  }
  function Be(E, B, K, Xe = 0.14) {
    let ht = O(...K).sub(O(...B)), st = Math.ceil(ht.length() / 0.32);
    for (let mt = 0; mt <= st; mt++) {
      let Ft = O(...B).addScaledVector(ht, mt / st);
      E.pipe(Ft.toArray(), Ft.clone().add(O(0, Xe, 0)).toArray(), 7e-3, y.steel, 6);
    }
    for (let mt of [0.06, Xe]) E.pipe(O(...B).add(O(0, mt, 0)).toArray(), O(...K).add(O(0, mt, 0)).toArray(), 6e-3, mt === Xe ? y.yellow : y.steel, 6);
  }
  function ze(E, B, K, Xe, ht = M.paint) {
    let st = new e.InstancedMesh(E, ht, B.length);
    return st.name = Xe, st.castShadow = true, st.receiveShadow = true, B.forEach((mt, Ft) => {
      Q.compose(O(...mt.p), mt.q || ie, O(...mt.scale || [1, 1, 1])), st.setMatrixAt(Ft, Q), mt.color && st.setColorAt(Ft, new e.Color(mt.color));
    }), st.computeBoundingBox(), st.computeBoundingSphere(), K.add(st), st;
  }
  let re = [-18, -8, 8, 18].map((E) => [E * l, 0, -3.6 * c]), F = kg({ THREE: e, seed: t, stationHeight: n, portSize: { width: 6, depth: 4 }, dockClearance: r, ground: { heightAt: () => h } });
  F.root.updateMatrixWorld(true);
  let ve = [];
  for (let [E, B] of Object.entries(F.groups)) B.traverse((K) => {
    if (!K.isMesh) return;
    let Xe = K.isInstancedMesh ? K.instanceMatrix.count : 1, ht = new e.InstancedMesh(K.geometry, K.material, Xe * re.length);
    ht.name = `Repeated terminal / ${K.name}`, ht.castShadow = K.castShadow, ht.receiveShadow = K.receiveShadow, u[E].add(ht);
    let st = [];
    if (K.isInstancedMesh) for (let mt = 0; mt < Xe; mt++) {
      let Ft = new e.Matrix4();
      K.getMatrixAt(mt, Ft), st.push(Ft);
    }
    ve.push({ source: K, mesh: ht, kind: E, originalMax: Xe, localMatrices: st });
  });
  function ae(E) {
    for (let B = E; B && B !== F.root; B = B.parent) if (!B.visible) return false;
    return true;
  }
  function $e(E = false) {
    F.root.updateMatrixWorld(true);
    for (let B of ve) {
      if (B.mesh.visible = ae(B.source), !E && !["cabins", "shipAssembly", "silhouette"].includes(B.kind) && !/tractor|trolley/.test(B.source.name.toLowerCase())) continue;
      let K = 0;
      for (let Xe of re) {
        let ht = new e.Matrix4().makeTranslation(...Xe), st = B.source.isInstancedMesh ? B.source.count : 1;
        for (let mt = 0; mt < st; mt++) {
          if (Q.copy(ht).multiply(B.source.matrixWorld), B.source.isInstancedMesh && (B.source.getMatrixAt(mt, B.localMatrices[mt]), Q.multiply(B.localMatrices[mt])), B.mesh.setMatrixAt(K, Q), B.source.instanceColor) {
            let Ft = new e.Color();
            B.source.getColorAt(mt, Ft), B.mesh.setColorAt(K, Ft);
          }
          K++;
        }
      }
      B.mesh.count = K, B.mesh.instanceMatrix.needsUpdate = true, B.mesh.instanceColor && (B.mesh.instanceColor.needsUpdate = true), B.mesh.computeBoundingBox(), B.mesh.computeBoundingSphere();
    }
  }
  let rt = new e.Group(), Qe = new e.Group(), _t = new e.Group(), vt = new e.Group(), Ye = new e.Group(), ut = new e.Group();
  rt.name = "City roads, railbed and graded ground", Qe.name = "City freight districts and utility buildings", _t.name = "Colossal splayed foundation and load frame", vt.name = "Open orbital transfer ring and spine", Ye.name = "Four main heavy-platform tension bundles", ut.name = "Heavy lift platform with four drive nacelles", u.groundPort.add(rt, Qe, _t), u.station.add(vt), u.cables.add(Ye), u.cabins.add(ut);
  let lt = new e.Group();
  lt.name = "Restrained city safety beacons", u.effects.add(lt);
  let at = new le("Graded logistics metropolis"), ct = new le("Connected city streets and railbeds"), Ct = new le("City road and railway furniture"), se = new le("Service aprons and utility connections");
  at.box(o, 0.055, a, y.soil, [0, h - 0.035, 0], 0.01);
  let Ht = [{ x: 0, z: 2.4, w: 47.5, d: 1.1, axis: "x" }, { x: 0, z: -13.2, w: 46.4, d: 0.67, axis: "x" }, { x: 0, z: -10, w: 46.4, d: 0.58, axis: "x" }, { x: 0, z: 14.77, w: 46.4, d: 0.7, axis: "x" }, ...[-21.5, -12.45, 12.45, 21.5].map((E) => ({ x: E, z: 0, w: 0.78, d: 35.3, axis: "z" })), { x: 0, z: -13.2, w: 0.78, d: 9, axis: "z" }, { x: 0, z: 10.1, w: 1.03, d: 15, axis: "z" }, { x: 0, z: -18.73, w: 50.2, d: 0.64, axis: "x" }, { x: 0, z: 18.73, w: 50.2, d: 0.64, axis: "x" }, { x: -24.72, z: 0, w: 0.64, d: 38.1, axis: "z" }, { x: 24.72, z: 0, w: 0.64, d: 38.1, axis: "z" }, { x: 0, z: 20.05, w: 1.03, d: 5.1, axis: "z" }, { x: 0, z: -19.7, w: 0.78, d: 4.9, axis: "z" }, { x: -26.56, z: 2.4, w: 6.62, d: 1.1, axis: "x" }, { x: 24.18, z: 2.4, w: 1.9, d: 1.1, axis: "x" }, ...[-21.5, -12.45, 12.45, 21.5].flatMap((E) => [-18.18, 18.18].map((B) => ({ x: E, z: B, w: 0.78, d: 1.2, axis: "z" })))];
  for (let E of Ht) {
    ct.box(E.w * l, 0.024, E.d * c, y.road, we(E.x, -0.012, E.z), 2e-3);
    let B = E.axis === "x" ? E.w : E.d;
    for (let K = -B / 2 + 0.2; K < B / 2; K += 0.42) Ct.box(E.axis === "x" ? 0.18 : 0.012, 2e-3, E.axis === "x" ? 0.012 : 0.18, y.yellow, we(E.x + (E.axis === "x" ? K : 0), 2e-3, E.z + (E.axis === "z" ? K : 0)), 0);
  }
  for (let E of [-21.5, -12.45, 0, 12.45, 21.5]) {
    for (let B = 0; B < 6; B++) Ct.box(0.052, 2e-3, 0.33, y.white, we(E - 0.26 + B * 0.105, 3e-3, 3.04), 0);
    for (let B of [1.74, 14.29]) for (let K of [-1, 1]) Ct.add(ot(0.012, 0.17, 8), y.yellow, we(E + K * 0.5, 0.086, B)), Ct.add(ot(0.013, 0.037, 8), y.black, we(E + K * 0.5, 0.125, B));
  }
  let de = Array.from({ length: 8 }, (E, B) => 9.2 + B * 0.64);
  ct.box(43 * l, 0.018, 5.45 * c, y.concrete, we(0, -4e-3, 11.44), 0.01);
  for (let E of de) {
    for (let B of [-0.082, 0.082]) Ct.ibeam(we(-21, 0.037, E + B), we(21, 0.037, E + B), 0.022, 0.027, y.steel);
    for (let B = -20.9; B < 21; B += 0.24) {
      Ct.box(0.035, 0.016, 0.3, y.dull, we(B, 0.01, E), 2e-3);
      for (let K of [-0.097, 0.097]) Ct.box(0.034, 0.01, 0.026, y.steel, we(B, 0.044, E + K), 0);
    }
    for (let B of [21.2]) Ct.box(0.066, 0.063, 0.35, y.deep, we(B, 0.037, E), 6e-3), Ct.box(0.05, 0.038, 0.3, y.yellow, we(B, 0.09, E), 3e-3);
    ct.box(9.25 * l, 0.022, 0.47 * c, y.concrete, we(-25.6, -0.013, E), 4e-3);
    for (let B of [-0.082, 0.082]) Ct.ibeam(we(-30.2, 0.037, E + B), we(-21, 0.037, E + B), 0.022, 0.027, y.steel);
    for (let B = -30.15; B < -21; B += 0.24) Ct.box(0.035, 0.016, 0.3, y.dull, we(B, 0.01, E), 2e-3);
  }
  for (let E of [-21.7, 21.7]) for (let B of [8.55, 14.2]) Ct.pipe(we(E, 0.02, B), we(E, 0.52, B), 0.012, y.dull), Ct.box(0.056, 0.116, 0.034, y.deep, we(E, 0.48, B), 6e-3);
  at.finish(rt), ct.finish(u.roads), Ct.finish(u.roads);
  let X = (E, B, K) => [[-E + K, -B], [E - K, -B], [E, -B + K], [E, B - K], [E - K, B], [-E + K, B], [-E, B - K], [-E, -B + K]], G = X(25.65 * l, 19.65 * c, 0.75), Fe = [[-25.9 * l, -21 * c], [24.3 * l, -21.35 * c], [27.15 * l, -19.45 * c], [27.35 * l, 18.35 * c], [24.8 * l, 21.2 * c], [-25.65 * l, 21.4 * c], [-27.25 * l, 18.75 * c], [-27.45 * l, -18.8 * c]], P = [X(o / 2, a / 2, 0.65), G, Fe], v = [], k = [], ee = [h - 8e-3, h - 0.021];
  for (let E = 0; E < 2; E++) for (let B = 0; B < 8; B++) {
    let K = (B + 1) % 8, Xe = [[E, B], [E, K], [E + 1, B], [E, K], [E + 1, K], [E + 1, B]];
    for (let [ht, st] of Xe) {
      let mt = P[ht][st];
      v.push(mt[0], ht === 2 ? f(mt[0], mt[1]) - 8e-3 : ee[ht], mt[1]), he.set(ht === 0 ? 6450021 : ht === 1 ? 7829612 : 5331796), k.push(he.r, he.g, he.b);
    }
  }
  let ye = m(new e.BufferGeometry());
  ye.setAttribute("position", new e.Float32BufferAttribute(v, 3)), ye.setAttribute("color", new e.Float32BufferAttribute(k, 3)), ye.computeVertexNormals();
  let Ee = new e.Mesh(ye, M.ground);
  Ee.name = "Gravel buffer and irregular graded soil edge", Ee.receiveShadow = true, u.edgeTerrain.add(Ee);
  let De = new le("Mixed low retaining edge, open fence and entrance furniture"), ce = new le("Entrance shoulders and drainage culverts");
  function me(E, B, K = false) {
    let Xe = O(...E), ht = O(...B), st = ht.clone().sub(Xe), mt = Math.ceil(st.length() / 0.62);
    K && (De.beam(Xe.clone().add(O(0, 0.12, 0)).toArray(), ht.clone().add(O(0, 0.12, 0)).toArray(), 0.12, 0.25, y.concrete), De.beam(Xe.clone().add(O(0, 0.257, 0)).toArray(), ht.clone().add(O(0, 0.257, 0)).toArray(), 0.14, 0.025, y.pale));
    for (let Ft = 0; Ft <= mt; Ft++) {
      let fn = Xe.clone().addScaledVector(st, Ft / mt);
      De.box(0.039, 0.4, 0.039, y.dull, fn.clone().add(O(0, 0.2, 0)).toArray(), 2e-3);
    }
    for (let Ft of [0.095, 0.23, 0.385]) De.pipe(Xe.clone().add(O(0, Ft, 0)).toArray(), ht.clone().add(O(0, Ft, 0)).toArray(), 8e-3, y.steel, 5);
    if (!K) for (let Ft = 0; Ft < mt; Ft++) {
      let fn = Xe.clone().addScaledVector(st, Ft / mt), an = Xe.clone().addScaledVector(st, (Ft + 1) / mt);
      De.pipe(fn.clone().add(O(0, 0.05, 0)).toArray(), an.clone().add(O(0, 0.36, 0)).toArray(), 37e-4, y.dull, 5), De.pipe(fn.clone().add(O(0, 0.36, 0)).toArray(), an.clone().add(O(0, 0.05, 0)).toArray(), 37e-4, y.dull, 5);
    }
  }
  let Te = [];
  function Ie(E, B, K, Xe, ht = false) {
    let st = we(E, 0, B), mt = we(K, 0, Xe);
    me(st, mt, ht), Te.push({ a: st, b: mt, solid: ht });
  }
  Ie(-24.9, -19.65, -0.65, -19.65), Ie(0.65, -19.65, 24.9, -19.65), Ie(-24.9, 19.65, -0.8, 19.65), Ie(0.8, 19.65, 24.9, 19.65), Ie(25.65, -18.9, 25.65, -8, true), Ie(25.65, -8, 25.65, 8), Ie(25.65, 8, 25.65, 18.9, true), Ie(-25.65, -18.9, -25.65, 1.52, true), Ie(-25.65, 3.28, -25.65, 8.78), Ie(-25.65, 14.14, -25.65, 18.9, true);
  for (let [E, B] of [[[24.9, -19.65], [25.65, -18.9]], [[25.65, 18.9], [24.9, 19.65]], [[-24.9, 19.65], [-25.65, 18.9]], [[-25.65, -18.9], [-24.9, -19.65]]]) Ie(...E, ...B, true);
  for (let E of [-19.22, 19.22]) for (let B of [-1, 1]) ce.box(23.5 * l, 0.026, 0.14, y.deep, we(B * 12.55, -9e-3, E), 1e-3);
  for (let E of [-25.18, 25.18]) for (let [B, K] of [[-8.05, 20.2], [16.35, 4.7]]) ce.box(0.14, 0.026, K * c, y.deep, we(E, -9e-3, B), 1e-3);
  function Ve(E, B, K, Xe, ht) {
    let st = K === "z" ? 1 : 0, mt = K === "x" ? 1 : 0, Ft = we(E, 0, B);
    ce.box(K === "z" ? Xe + 1.4 : 3.2, 0.03, K === "z" ? 3.2 : Xe + 1.4, y.concrete, [Ft[0], h - 0.026, Ft[2]], 6e-3);
    let fn = Ft[0] + st * (Xe / 2 + 0.42) - mt * 0.66, an = Ft[2] + mt * (Xe / 2 + 0.42) + st * 0.35;
    De.box(0.5, 0.43, 0.63, y.navy, [fn, h + 0.215, an], 0.02), De.box(0.56, 0.045, 0.72, y.pale, [fn, h + 0.452, an], 5e-3), De.box(0.4, 0.115, 0.015, y.glass, [fn, h + 0.3, an + 0.326], 3e-3);
    for (let rn of [-1, 1]) {
      let Ln = Ft[0] + st * rn * (Xe / 2 + 0.07), _i = Ft[2] + mt * rn * (Xe / 2 + 0.07);
      De.box(0.07, 0.49, 0.07, y.yellow, [Ln, h + 0.245, _i], 3e-3), De.pipe([Ln, h + 0.5, _i], [Ln, h + 1, _i], 0.016, y.white, 8);
    }
    let Fn = [fn, h + 0.79, an];
    De.pipe([fn, h + 0.47, an], Fn, 0.013, y.dull), De.box(0.67, 0.16, 0.043, y.navy, Fn, 8e-3);
    for (let rn = 0; rn < 4; rn++) De.box(0.09, 0.028, 7e-3, y.yellow, [fn - 0.23 + rn * 0.15, h + 0.79, an + 0.024], 1e-3);
    for (let rn = 0; rn < 5; rn++) {
      let Ln = (rn - 2) * 0.14;
      ce.box(K === "z" ? Xe - 0.1 : 0.045, 2e-3, K === "z" ? 0.045 : Xe - 0.1, y.white, [Ft[0] + mt * Ln, h + 8e-3, Ft[2] + st * Ln], 0);
    }
  }
  Ve(0, 19.65, "z", 1.03, "mainEntry"), Ve(-25.65, 2.4, "x", 1.1, "cargoEntry"), Ve(0, -19.65, "z", 0.78, "serviceEntry");
  for (let E = 0; E < 3; E++) {
    ce.box(0.42, 0.013, 0.78, y.road, we(1.26 + E * 0.51, -6e-3, 20.13), 2e-3);
    for (let B of [-0.2, 0.2]) ce.box(0.014, 2e-3, 0.76, y.white, we(1.26 + E * 0.51 + B, 4e-3, 20.13), 0);
  }
  for (let E of [8.76, 14.14]) De.box(0.072, 0.64, 0.072, y.yellow, we(-25.65, 0.32, E), 3e-3), De.box(0.12, 0.17, 0.08, y.deep, we(-25.65, 0.62, E), 9e-3);
  De.finish(u.perimeter), ce.finish(u.roads);
  let qe = [], Rt = [], bt = [], kt = [], pe = [], gt = [-18, -14.4, -7.2, -3.6, 3.6, 7.2, 14.4, 18];
  function je(E, B, K, Xe, ht, st = 0) {
    let mt = we(B, 0.013, K);
    ht.push({ p: mt, q: A(0, st, 0), color: [12173502, 9149342, 12630698, 9018278][Math.floor(b() * 4)] }), qe.push({ type: E, position: mt, dimensions: Xe });
  }
  for (let E of [-15, -11.5, -8.6]) for (let B of gt) je("warehouse", B, E, [3, 0.96, 2], Rt);
  for (let E of gt) je("freight hall", E, 4.55, [3, 1.3, 2.25], bt);
  for (let E of gt) je("rail transfer warehouse", E, 16.1, [2.8, 0.72, 1.55], kt);
  for (let E of [-1, 1]) for (let B of [-15.4, -11.2, -6.8, -0.7, 5.2, 15.9]) je("utility and maintenance building", E * 22.84, B, [1.32, 0.8, 1.3], pe);
  re.forEach((E, B) => {
    for (let [K, Xe, ht] of [["satellite warehouse", [-1.65, 0, -0.65], [1.19, 0.8, 1.1]], ["satellite control building", [1.41, 0, -1.32], [0.74, 1.49, 0.69]], ["satellite maintenance building", [2.23, 0, -1.18], [0.88, 0.67, 0.95]]]) qe.push({ type: K, site: B, position: [E[0] + Xe[0], h + Xe[1], E[2] + Xe[2]], dimensions: ht });
  });
  function Et(E, B, K, Xe, ht) {
    let st = new le(ht);
    st.box(E + 0.08, 0.05, B + 0.08, y.concrete, [0, 0.022, 0], 0.012), st.box(E, K - 0.12, B, y.navy, [0, (K - 0.12) / 2 + 0.058, 0], 0.028), st.box(E + 0.1, 0.038, B + 0.13, y.pale, [0, K, 0], 7e-3), st.box(E - 0.025, 0.025, B + 0.08, y.white, [0, K + 0.04, 0], 7e-3, [0, 0, -0.025]);
    for (let mt = -E / 2 + 0.07; mt < E / 2; mt += 0.115) st.box(0.016, 0.014, B + 0.055, y.steel, [mt, K + 0.066 - 0.025 * mt, 0], 1e-3);
    for (let mt = 0; mt < Xe; mt++) {
      let Ft = -E / 2 + E * (mt + 0.5) / Xe, fn = B / 2 + 0.018;
      st.box(0.245, 0.37, 0.02, y.black, [Ft, 0.243, fn], 4e-3), st.box(0.212, 0.29, 0.016, y.pale, [Ft, 0.28, fn + 0.015], 3e-3);
      for (let an = 0; an < 8; an++) st.box(0.209, 7e-3, 0.012, y.dull, [Ft, 0.144 + an * 0.037, fn + 0.026], 0);
      for (let an of [-1, 1]) st.box(0.018, 0.405, 0.036, y.steel, [Ft + an * 0.127, 0.256, fn + 5e-3], 2e-3);
      st.box(0.282, 0.031, 0.125, y.dull, [Ft, 0.07, fn + 0.061], 4e-3), st.box(0.255, 0.014, 0.011, y.yellow, [Ft, 0.094, fn + 0.122], 2e-3), st.box(0.052, 0.019, 0.027, y.white, [Ft, 0.49, fn + 0.04], 2e-3);
    }
    for (let mt of [-1, 1]) {
      for (let Ft = -B / 2 + 0.08; Ft < B / 2; Ft += 0.32) st.box(0.027, K - 0.06, 0.042, y.pale, [mt * (E / 2 + 0.012), K / 2, Ft], 3e-3), st.box(0.013, 0.105, 0.21, y.glass, [mt * (E / 2 + 0.026), K * 0.71, Ft + 0.11], 3e-3);
      st.box(0.14, 0.23, 0.016, y.black, [mt * (E * 0.32), 0.17, -B / 2 - 0.015], 6e-3), st.pipe([mt * (E / 2 - 0.08), 0.09, -B / 2 - 0.04], [mt * (E / 2 - 0.08), K - 0.04, -B / 2 - 0.04], 0.011, y.steel);
    }
    for (let mt = -E / 2 + 0.38; mt < E / 2; mt += 0.71) {
      st.box(0.32, 0.065, 0.24, y.deep, [mt, K + 0.101, -0.27], 8e-3);
      for (let Ft = 0; Ft < 6; Ft++) st.box(0.018, 0.029, 0.218, y.steel, [mt - 0.128 + Ft * 0.052, K + 0.143, -0.27], 0);
    }
    return st.geometry();
  }
  ze(Et(3, 2, 0.94, 7, "North freight warehouse"), Rt, Qe, "24 detailed warehouse buildings"), ze(Et(3, 2.25, 1.25, 8, "Large transit hall"), bt, Qe, "8 large freight halls"), ze(Et(2.8, 1.55, 0.7, 6, "Rail distribution shed"), kt, Qe, "8 rail transfer warehouses"), ze(Et(1.32, 1.3, 0.77, 3, "Utility workshop"), pe, Qe, "12 perimeter utility buildings");
  let xt = null, ft = null;
  F.groups.groundPort.traverse((E) => {
    E.isInstancedMesh && /Stock-sensitive/.test(E.name) && (xt = E), E.isMesh && /Autonomous yard tractor/.test(E.name) && (ft = E);
  });
  let Ot = [];
  function Zt(E, B, K = 3, Xe = 0.018, ht = "warehouse yard") {
    Ot.push({ p: we(E, Xe, B), levels: K, bias: b(), label: ht });
  }
  for (let E of gt) for (let B of [-16.55, -16.95]) for (let K = 0; K < 6; K++) Zt(E - 1.2 + K * 0.48, B, 3, 0.018, "north reserve container yard");
  for (let E of [-15, -11.5, -8.6]) for (let B of gt) for (let K of [-1.04, -0.52, 0.52, 1.04]) Zt(B + K, E + 1.27, 3, 0.018, "warehouse outbound stacks");
  for (let E of [-14.4, -3.6, 3.6, 14.4]) for (let B of [6.26, 6.61, 6.96, 7.31]) for (let K = 0; K < 6; K++) Zt(E - 1.2 + K * 0.48, B, 3, 0.018, "freight hall sorting yard");
  let Kt = [];
  for (let E = 0; E < de.length; E++) for (let B = 0; B < 38; B++) {
    let K = -19.4 + B * 1.04, Xe = de[E];
    if (!(Math.abs(K) < 0.7)) {
      Kt.push({ p: we(K, 0.019, Xe) });
      for (let ht of [-0.222, 0.222]) Zt(K + ht, Xe, 1, 0.124, "rail flatcar payload");
    }
  }
  let Qt = Ot.reduce((E, B) => E + B.levels, 0), cn = new e.InstancedMesh(xt.geometry, xt.material, Qt);
  cn.name = "City-wide container columns / stock-controlled", cn.castShadow = true, cn.receiveShadow = true, Qe.add(cn);
  let vn = [10596265, 9544359, 11842980, 10392686];
  function gn(E) {
    let B = 0;
    for (let K of Ot) {
      let Xe = Math.min(K.levels, Math.floor(K.levels * E + K.bias));
      for (let ht = 0; ht < Xe; ht++) Q.makeTranslation(K.p[0], K.p[1] + ht * 0.229, K.p[2]), cn.setMatrixAt(B, Q), cn.setColorAt(B, new e.Color(vn[Math.floor(K.bias * vn.length)])), B++;
    }
    cn.count = B, cn.instanceMatrix.needsUpdate = true, cn.instanceColor.needsUpdate = true, cn.computeBoundingBox(), cn.computeBoundingSphere();
  }
  let mn = new le("Rail flatcar");
  mn.box(0.94, 0.039, 0.255, y.deep, [0, 0.068, 0], 6e-3), mn.box(0.87, 0.012, 0.239, y.steel, [0, 0.096, 0], 2e-3);
  for (let E of [-0.31, 0.31]) for (let B of [-1, 1]) mn.add(ot(0.031, 0.025, 10), y.dull, [E, 0.035, B * 0.11], A(Math.PI / 2, 0, 0)), mn.add(ot(0.016, 0.028, 8), y.steel, [E, 0.035, B * 0.112], A(Math.PI / 2, 0, 0));
  for (let E of [-1, 1]) mn.box(0.062, 0.025, 0.056, y.steel, [E * 0.5, 0.07, 0], 3e-3), mn.box(0.044, 0.042, 0.25, y.yellow, [E * 0.445, 0.09, 0], 3e-3);
  ze(mn.geometry(), Kt, Qe, `${Kt.length} short articulated rail flatcars`);
  let En = [];
  for (let E of [-16.1, -8.7, 7.6, 15.6]) for (let B of [10.15, 12.7]) En.push({ p: we(E, 0, B) });
  let $t = new le("Four-lane rail container gantry");
  for (let E of [-0.75, 0.75]) for (let B of [-1.13, 1.13]) {
    $t.box(0.25, 0.11, 0.27, y.deep, [E, 0.1, B], 0.01), $t.ibeam([E, 0.17, B], [E, 1.42, B], 0.09, 0.12, y.yellow), $t.beam([E, 0.3, B], [E + (E > 0 ? -0.3 : 0.3), 1.24, B], 0.038, 0.047, y.dull);
    for (let K of [-0.07, 0.07]) $t.add(ot(0.045, 0.035, 12), y.steel, [E + K, 0.071, B], A(Math.PI / 2, 0, 0));
  }
  for (let E of [-0.75, 0.75]) $t.ibeam([E, 1.46, -1.29], [E, 1.46, 1.29], 0.13, 0.16, y.pale);
  for (let E of [-1.13, 1.13]) $t.ibeam([-0.77, 1.43, E], [0.77, 1.43, E], 0.1, 0.13, y.dull);
  $t.box(0.71, 0.09, 0.38, y.deep, [0, 1.54, -0.08], 0.012);
  for (let E of [-0.21, 0.21]) for (let B of [-0.1, 0.1]) $t.pipe([E, 1.5, B], [E, 0.92, B], 3e-3, y.steel, 5);
  $t.box(0.64, 0.046, 0.29, y.yellow, [0, 0.9, 0], 7e-3);
  for (let E = 0.22; E < 1.42; E += 0.06) $t.pipe([-0.805, E, 1.02], [-0.805, E, 1.19], 4e-3, y.steel, 6);
  Be($t, [-0.75, 1.55, -1.26], [-0.75, 1.55, 1.26], 0.12), ze($t.geometry(), En, Qe, "8 four-lane freight gantries");
  let en = [-18, -7.2, 7.2, 18].map((E) => we(E, 0, 7.12));
  for (let E of en) {
    let [B, K, Xe] = E;
    se.box(2.54, 0.035, 1.76, y.concrete, [B, K + 0.016, Xe], 0.018), se.box(2.35, 0.012, 1.56, y.road, [B, K + 0.04, Xe], 6e-3);
    for (let ht of [-1, 1]) se.box(0.018, 3e-3, 1.29, y.yellow, [B + ht * 0.88, K + 0.049, Xe], 0), se.box(1.78, 3e-3, 0.018, y.yellow, [B, K + 0.049, Xe + ht * 0.645], 0), se.box(0.025, 3e-3, 0.58, y.white, [B + ht * 0.23, K + 0.05, Xe], 0);
    se.box(0.49, 3e-3, 0.025, y.white, [B, K + 0.05, Xe], 0);
    for (let ht of [-1.16, 1.16]) for (let st of [-0.69, 0.69]) se.box(0.043, 0.025, 0.043, y.deep, [B + ht, K + 0.052, Xe + st], 5e-3), se.box(0.028, 6e-3, 0.028, y.yellow, [B + ht, K + 0.069, Xe + st], 2e-3);
  }
  for (let E of [-1, 1]) {
    se.pipe(we(E * 22.1, 0.17, -16.9), we(E * 22.1, 0.17, 16.9), 0.043, y.steel), se.pipe(we(E * 22.24, 0.12, -16.9), we(E * 22.24, 0.12, 16.9), 0.028, y.dull);
    for (let B of [-15.4, -11.2, -6.8, -0.7, 5.2, 15.9]) {
      se.pipe(we(E * 22.1, 0.17, B), we(E * 22.7, 0.17, B), 0.031, y.steel);
      for (let K = 0; K < 3; K++) {
        let Xe = E * 22.82, ht = B - 0.54 + K * 0.38;
        se.add(ot(0.115, 0.47, 16), y.steel, we(Xe, 0.28, ht)), se.add(ot(0.08, 0.048, 16, 0.116), y.pale, we(Xe, 0.538, ht)), se.box(0.27, 0.027, 0.28, y.deep, we(Xe, 0.03, ht), 6e-3);
      }
    }
  }
  let nn = new le("Road lamp housings and lenses");
  for (let E = -22.5; E <= 22.5; E += 3) for (let B of [1.77, 14.19]) se.pipe(we(E, 0.015, B), we(E, 0.81, B), 0.01, y.dull), se.pipe(we(E, 0.81, B), we(E + 0.12, 0.86, B), 8e-3, y.steel), se.box(0.11, 0.025, 0.042, y.deep, we(E + 0.15, 0.849, B), 4e-3), nn.box(0.082, 5e-3, 0.031, y.light, we(E + 0.15, 0.832, B), 2e-3);
  se.finish(Qe), nn.finish(lt, false);
  let on = [];
  for (let E = 0; E < 32; E++) on.push({ p: we(-21.7 + E % 16 * 2.8, 0.012, E < 16 ? 2.19 : 2.65), q: A(0, E < 16 ? 0 : Math.PI, 0) });
  let xn = ze(ft.geometry, on, Qe, "32 ordinary-scale city freight tractors", ft.material), Jt = new le("Colossal structural base and tower"), C = new le("Main heavy-platform ribbons"), $ = -3.6 * c, Oe = h + 15.4, Ke = [];
  for (let E of [-1, 1]) for (let B of [-1, 1]) {
    let K = [E * 10.7 * l, h + 1.25, $ + B * 3.93 * c], Xe = [E * 8.65 * l, Oe, $ + B * 3.05 * c];
    Ke.push({ foot: K, top: Xe, side: E, front: B }), Jt.box(2.48, 0.44, 2.33, y.concrete, [K[0], h + 0.2, K[2]], 0.09), Jt.box(2.19, 0.68, 2.03, y.concrete, [K[0], h + 0.73, K[2]], 0.11), Jt.box(1.85, 0.51, 1.79, y.deep, [K[0], h + 1.21, K[2]], 0.055), Jt.box(1.55, 0.18, 1.55, y.steel, [K[0], h + 1.55, K[2]], 0.035);
    for (let st of [-0.66, 0.66]) for (let mt of [-0.66, 0.66]) Jt.add(ot(0.058, 0.22, 10), y.dull, [K[0] + st, h + 1.64, K[2] + mt]), Jt.add(ot(0.08, 0.047, 6), y.alloy, [K[0] + st, h + 1.76, K[2] + mt]);
    for (let st of [-1, 1]) {
      let mt = O(...K).add(O(0, 0.21, st * 0.37)), Ft = O(...Xe).add(O(0, 0, st * 0.37));
      Jt.ibeam(mt.toArray(), Ft.toArray(), 0.48, 0.72, y.pale);
      let fn = Ft.clone().sub(mt), an = new e.Quaternion().setFromUnitVectors(V, fn.clone().normalize());
      for (let Fn = 0; Fn < 11; Fn++) {
        let rn = mt.clone().addScaledVector(fn, (Fn + 0.5) / 11);
        Jt.add(pt(0.52, fn.length() / 11 - 0.07, 0.075, 0.012), Fn % 3 === 1 ? y.navy : y.pale, rn.add(O(E * 0.275, 0, 0).applyQuaternion(an)).toArray(), an);
      }
    }
    for (let st = 0; st < 12; st++) {
      let mt = O(...K).lerp(O(...Xe), st / 12), Ft = O(...K).lerp(O(...Xe), (st + 1) / 12);
      Jt.beam(mt.clone().add(O(0, 0.12, -0.39)).toArray(), Ft.clone().add(O(0, 0.12, 0.39)).toArray(), 0.085, 0.1, y.steel), Jt.beam(mt.clone().add(O(0, 0.12, 0.39)).toArray(), Ft.clone().add(O(0, 0.12, -0.39)).toArray(), 0.085, 0.1, y.dull);
    }
    let ht = [E * 5.05 * l, h + 10.2, $ + B * 2.8 * c];
    Jt.ibeam([K[0], h + 1.56, K[2]], ht, 0.31, 0.43, y.dull), Jt.ibeam([K[0] + E * 0.41, h + 1.56, K[2]], [ht[0] + E * 0.31, ht[1], ht[2]], 0.2, 0.31, y.steel), Jt.box(0.17, 0.28, 0.025, y.black, [K[0], h + 0.61, K[2] + B * 1.023], 7e-3), Jt.box(0.086, 0.073, 0.015, y.glass, [K[0], h + 0.67, K[2] + B * 1.041], 4e-3);
    for (let st = 0; st < 9; st++) Jt.box(0.27, 0.03, 0.086, y.steel, [K[0], h + 0.045 + st * 0.042, K[2] + B * (1.57 - st * 0.07)], 3e-3);
    Be(Jt, [K[0] - 0.9, h + 1.015, K[2] + B * 1.1], [K[0] + 0.9, h + 1.015, K[2] + B * 1.1], 0.14);
  }
  for (let E of [-1, 1]) {
    let B = $ + E * 3.05 * c;
    for (let K of [Oe, Oe - 0.66]) Jt.ibeam([-8.75 * l, K, B], [8.75 * l, K, B], 0.36, 0.43, y.pale);
    for (let K = 0; K < 17; K++) {
      let Xe = (-8.5 + K) * l, ht = Xe + l;
      Jt.beam([Xe, Oe - 0.62, B], [ht, Oe - 0.035, B], 0.076, 0.093, y.steel), Jt.box(0.32, 0.23, 0.063, K % 4 === 0 ? y.yellow : y.deep, [Xe, Oe - 0.08, B + E * 0.25], 8e-3);
    }
    Jt.box(17.1 * l, 0.05, 0.7, y.deep, [0, Oe + 0.04, B], 6e-3), Be(Jt, [-8.5 * l, Oe + 0.073, B + E * 0.28], [8.5 * l, Oe + 0.073, B + E * 0.28], 0.16);
  }
  for (let E of [-1, 1]) for (let B of [Oe, Oe - 0.66]) Jt.ibeam([E * 8.65 * l, B, $ - 3.05 * c], [E * 8.65 * l, B, $ + 3.05 * c], 0.36, 0.43, y.pale);
  for (let E of [-1, 1]) Jt.ibeam([-5.05 * l, h + 10.2, $ + E * 2.8 * c], [5.05 * l, h + 10.2, $ + E * 2.8 * c], 0.26, 0.3, y.pale);
  for (let E of [-1, 1]) Jt.ibeam([E * 5.05 * l, h + 10.2, $ - 2.8 * c], [E * 5.05 * l, h + 10.2, $ + 2.8 * c], 0.23, 0.28, y.steel);
  for (let E of Ke) {
    let B = [E.side * 5.05 * l, h + 10.2, $ + E.front * 2.8 * c], K = O(...E.foot).lerp(O(...E.top), (10.2 - 1.25) / (15.4 - 1.25)).toArray();
    Jt.ibeam(B, K, 0.23, 0.28, y.steel), Jt.box(0.42, 0.35, 0.39, y.deep, B, 0.025);
  }
  for (let E of Ke) {
    let B = [E.side * 20 * l, h + 0.33, E.front > 0 ? 5.98 * c : -7 * c];
    Jt.box(0.81, 0.47, 1.18, y.concrete, [B[0], h + 0.219, B[2]], 0.055), Jt.box(0.59, 0.07, 0.8, y.steel, [B[0], h + 0.486, B[2]], 0.017);
    for (let K = 0; K < 7; K++) Jt.pipe([E.top[0], E.top[1] - 0.75 - K * 0.17, E.top[2]], [B[0] + (K - 3) * 0.045, B[1] + 0.23, B[2] + (K - 3) * 0.076], 0.014, K % 2 ? y.dull : y.steel, 7);
  }
  Jt.box(10.42, 0.16, 5.16, y.concrete, [0, h - 0.105, $], 0.025), Jt.box(6.64, 0.024, 3.68, y.black, [0, h - 9e-3, $], 4e-3);
  for (let E of [-1, 1]) Jt.box(0.42, 0.56, 4.58, y.deep, [E * 4.85, h + 0.277, $], 0.022), Jt.box(0.6, 0.048, 4.73, y.steel, [E * 4.85, h + 0.583, $], 7e-3), Be(Jt, [E * 5.13, h + 0.612, $ - 2.3], [E * 5.13, h + 0.612, $ + 2.3], 0.16), Jt.box(0.13, 0.024, 3.5, y.pale, [E * 4.8, h + 0.624, $], 6e-3);
  let tt = 3.08, it = 0.59;
  Jt.box(3.25, 0.095, Math.hypot(tt, it), y.dull, [0, h + it / 2, $ + 3.63], 6e-3, [Math.atan2(it, tt), 0, 0]);
  for (let E of [-1.5, 1.5]) Jt.beam([E, h + 0.635, $ + 2.12], [E, h + 0.045, $ + 5.17], 0.045, 0.055, y.yellow);
  Jt.finish(_t);
  let Ge = new le("Controlled lift loading apron perimeter");
  for (let E of [-5.43, 5.43]) Be(Ge, [E, h + 0.018, $ - 2.77], [E, h + 0.018, $ + 5.33], 0.26);
  for (let E of [-1, 1]) Be(Ge, [E * 1.85, h + 0.018, $ + 5.33], [E * 5.43, h + 0.018, $ + 5.33], 0.26);
  for (let E = 0; E < 13; E++) for (let B of [-1, 1]) Ge.box(0.032, 3e-3, 0.13, y.yellow, [B * (1.9 + E * 0.27), h + 0.013, $ + 5.05], 0, [0, 0, 0]);
  Ge.finish(u.perimeter), qe.push({ type: "central load-bearing megastructure", position: [0, h, $], dimensions: [23.9 * l, 15.6, 11.45 * c] });
  let Dt = [[-3.72, -1.85], [3.72, -1.85], [-3.72, 1.85], [3.72, 1.85]].map(([E, B]) => [E, $ + B]), Vt = Dt.map(([E, B]) => ({ bottom: [E + Math.sign(E) * 0.56, h + 0.08, B], top: [E + Math.sign(E) * 0.56, n, B] }));
  for (let E of Vt) {
    let [B, , K] = E.bottom;
    for (let Xe of [-0.048, 0, 0.048]) for (let ht of [-0.033, 0.033]) C.box(0.027, n - h - 0.08, 0.019, Xe === 0 ? y.steel : y.dull, [B + Xe, (n + h + 0.08) / 2, K + ht], 1e-3);
    for (let Xe = h + 3; Xe < n - 1; Xe += 7) C.box(0.183, 0.045, 0.145, y.deep, [B, Xe, K], 6e-3);
  }
  C.finish(Ye, false);
  let Tt = new le("Heavy cable-guided freight platform");
  Tt.box(6.82, 0.23, 3.52, y.deep, [0, -0.465, 0], 0.05), Tt.box(6.68, 0.055, 3.41, y.steel, [0, -0.322, 0], 0.01);
  for (let E = -3.22; E < 3.23; E += 0.33) Tt.box(0.016, 7e-3, 3.31, y.dull, [E, -0.287, 0], 0);
  for (let E of [-2.78, -1.4, 0, 1.4, 2.78]) Tt.ibeam([E, -0.67, -1.67], [E, -0.67, 1.67], 0.13, 0.2, y.steel);
  for (let E of [-1.56, 1.56]) Tt.ibeam([-3.25, -0.7, E], [3.25, -0.7, E], 0.16, 0.21, y.dull);
  for (let [E, B] of Dt) {
    let K = B - $, Xe = Math.sign(E), ht = Math.sign(K);
    Tt.box(0.87, 1.84, 0.92, y.pale, [E, 0.15, K], 0.087), Tt.box(0.68, 1.6, 0.19, y.navy, [E - Xe * 0.36, 0.15, K], 0.025), Tt.box(0.97, 0.19, 1.01, y.deep, [E, -0.84, K], 0.041), Tt.box(0.96, 0.12, 1, y.deep, [E, 1.13, K], 0.027);
    for (let st of [-0.87, 1.202]) {
      Tt.add(ot(0.323, 0.031, 24), y.black, [E, st, K]), Tt.add(Ce(0.333, 0.028, 32), y.steel, [E, st + (st > 0 ? 0.016 : -0.016), K], A(Math.PI / 2, 0, 0)), Tt.add(ot(0.09, 0.056, 16), y.dull, [E, st, K]);
      for (let mt = 0; mt < 10; mt++) {
        let Ft = mt * Math.PI / 5;
        Tt.box(0.19, 8e-3, 0.046, y.steel, [E + Math.cos(Ft) * 0.17, st + (st > 0 ? 0.015 : -0.015), K + Math.sin(Ft) * 0.17], 2e-3, [0, -Ft - 0.37, 0]);
      }
    }
    for (let st of [-0.43, 0.65]) {
      let mt = E + Xe * 0.56;
      Tt.box(0.2, 0.13, 0.22, y.deep, [E + Xe * 0.46, st, K - 0.11], 0.012);
      for (let Ft of [-0.131, 0.131]) Tt.add(ot(0.063, 0.061, 16), y.dull, [mt + Ft, st, K], A(Math.PI / 2, 0, 0)), Tt.add(ot(0.025, 0.074, 12), y.alloy, [mt + Ft, st, K], A(Math.PI / 2, 0, 0));
      Tt.box(0.073, 0.045, 0.44, y.yellow, [E + Xe * 0.48, st, K], 6e-3);
    }
    for (let st of [-0.56, 0.38]) Tt.ibeam([E - Xe * 0.15, st, K - ht * 0.05], [Xe * 2.93, st - 0.03, ht * 1.43], 0.14, 0.18, y.pale);
    Tt.box(0.19, 0.35, 0.023, y.black, [E, 0.12, K + ht * 0.478], 8e-3), Tt.box(0.11, 0.095, 0.014, y.glass, [E, 0.19, K + ht * 0.499], 5e-3);
    for (let st = 0; st < 4; st++) Tt.box(0.085, 0.014, 0.016, y.steel, [E - 0.22 + st * 0.145, 0.86, K + ht * 0.472], 2e-3);
    for (let st of [-0.65, 0.82]) Tt.pipe([E + Xe * 0.51, st, K - 0.34], [E + Xe * 0.51, st, K + 0.34], 0.014, y.steel);
  }
  for (let E of [-1.72, 1.72]) {
    Tt.box(5.85, 0.42, 0.15, y.pale, [0, -0.048, E], 0.034);
    for (let B = 0; B < 22; B++) Tt.box(0.092, 0.055, 0.019, y.glass, [-2.75 + B * 0.262, 0.07, E + Math.sign(E) * 0.086], 7e-3);
    Tt.box(5.55, 0.038, 0.019, y.yellow, [0, -0.209, E + Math.sign(E) * 0.088], 4e-3);
  }
  Tt.finish(ut);
  let Xt = [];
  if (F.groups.cabins.traverse((E) => {
    E.isMesh && E.parent?.name?.startsWith("Sliding cargo door") && Xt.push(E);
  }), Xt.length) {
    let E = Dt.map(([B, K]) => ({ p: [B, 0.04, K - $ + Math.sign(K - $) * 0.512], q: A(0, K < $ ? Math.PI : 0, 0) }));
    ze(Xt[0].geometry, E, ut, "Original-size inspection doors inside the heavy drive nacelles", Xt[0].material);
  }
  let U = [];
  for (let E of [-2.4, -1.8, -1.2, -0.6, 0.6, 1.2, 1.8, 2.4]) for (let B of [-0.98, -0.3, 0.38, 1.06]) U.push({ p: [E, -0.274, B] });
  let be = ze(xt.geometry, U, ut, "Heavy platform freight cargo", xt.material), Le = new le("Orbital logistics ring, radial arms and connecting spine"), w = n, I = $, H = 5.3, L = 6.08, q = w - 3;
  function J(E, B, K) {
    return [Math.cos(B) * E, K, I + Math.sin(B) * E];
  }
  let Se = 40;
  for (let E = 0; E < Se; E++) {
    let B = E * Math.PI * 2 / Se, K = (E + 1) * Math.PI * 2 / Se;
    for (let st of [H, L]) for (let mt of [q - 0.14, q + 0.42, w + 0.56]) Le.ibeam(J(st, B, mt), J(st, K, mt), 0.1, 0.14, y.pale);
    Le.ibeam(J(H, B, q - 0.12), J(L, B, q - 0.12), 0.11, 0.13, y.steel), E !== 28 && Le.beam(J(L, B, q - 0.1), J(L, K, q + 0.4), 0.05, 0.061, y.steel), Le.beam(J(L, B, w + 0.53), J(L, K, q + 0.42), 0.054, 0.074, y.dull);
    let Xe = (B + K) / 2, ht = (H + L) / 2;
    Le.box(L - H - 0.06, 0.045, 2 * ht * Math.sin(Math.PI / Se) - 0.025, y.deep, J(ht, Xe, q + 0.011), 5e-3, [0, -Xe, 0]), E % 2 === 0 && E !== 28 && (Le.pipe(J(L - 0.03, B, q + 0.05), J(L - 0.03, B, q + 0.21), 7e-3, y.steel, 6), Le.pipe(J(L - 0.03, B, q + 0.21), J(L - 0.03, K, q + 0.21), 7e-3, y.yellow, 6));
  }
  for (let E = 0; E < 8; E++) {
    let B = E * Math.PI / 4;
    Le.ibeam(J(L, B, q - 0.55), J(L, B, w + 1.95), 0.22, 0.28, y.pale), Le.box(0.56, 0.23, 0.62, y.deep, J(L, B, w + 1.93), 0.024, [0, -B, 0]), Le.box(0.39, 1.32, 0.34, y.navy, J(L + 0.15, B, w - 0.39), 0.025, [0, -B, 0]);
  }
  for (let E of Vt) {
    let [B, , K] = E.top, Xe = Math.atan2(K - I, B);
    Le.ibeam([B, w + 0.055, K], J(L, Xe, w + 0.56), 0.15, 0.2, y.steel), Le.box(0.34, 0.16, 0.33, y.deep, [B, w + 0.013, K], 0.016), Le.add(ot(0.105, 0.08, 16), y.steel, [B, w - 0.023, K]);
  }
  let _e = $ - 6.38;
  for (let E of [w - 1.22, w - 0.8]) for (let B of [_e - 0.36, _e + 0.36]) Le.ibeam([-21.4 * l, E, B], [21.4 * l, E, B], 0.11, 0.15, y.pale);
  Le.box(42.7 * l, 0.047, 0.69, y.deep, [0, w - 0.757, _e], 6e-3);
  for (let E = -21; E < 21; E += 0.8) Le.beam([E * l, w - 1.19, _e - 0.37], [(E + 0.8) * l, w - 0.83, _e - 0.37], 0.044, 0.059, y.steel);
  Be(Le, [-21.3 * l, w - 0.729, _e - 0.33], [21.3 * l, w - 0.729, _e - 0.33], 0.14);
  for (let E of re) {
    let B = E[0];
    for (let K of [-1, 1]) Le.ibeam([B + K * 0.34, w - 1.1, _e], [B + K * 0.34, w - 1.1, $ - 2.2], 0.11, 0.15, y.steel);
    Le.box(0.72, 0.058, 4, y.deep, [B, w - 1.02, (_e + $ - 2.2) / 2], 6e-3), Be(Le, [B + 0.36, w - 0.987, _e], [B + 0.36, w - 0.987, $ - 2.25], 0.14);
  }
  for (let E of [-16, -10.6, 10.6, 16]) {
    Le.box(2.8, 0.62, 1.42, y.navy, [E * l, w - 0.37, _e + 0.025], 0.06), Le.box(2.89, 0.045, 1.5, y.pale, [E * l, w - 0.024, _e + 0.025], 9e-3), Le.box(2.51, 0.15, 0.015, y.glass, [E * l, w - 0.26, _e + 0.748], 9e-3);
    for (let B = 0; B < 9; B++) Le.box(0.026, 0.038, 1.31, y.steel, [(E - 1.17 + B * 0.291) * l, w + 0.017, _e + 0.025], 2e-3);
  }
  for (let E of [-1, 1]) for (let B = 0; B < 9; B++) {
    let K = E * (6.5 + B * 1.7) * l, Xe = _e - 1.88;
    Le.ibeam([K, w - 1.2, _e - 0.33], [K, w - 1.2, Xe - 1.25], 0.077, 0.1, y.dull), Le.box(1.42, 0.05, 2.83, y.deep, [K, w - 1.13, Xe], 0.012), Le.box(1.35, 0.013, 2.72, y.glass, [K, w - 1.089, Xe], 6e-3);
    for (let ht = 0; ht < 9; ht++) Le.box(8e-3, 9e-3, 2.7, y.steel, [K - 0.622 + ht * 0.155, w - 1.074, Xe], 0);
    for (let ht = 0; ht < 7; ht++) Le.box(1.35, 9e-3, 0.01, y.steel, [K, w - 1.073, Xe - 1.25 + ht * 0.416], 0);
  }
  Le.finish(vt);
  let Re = new le("Individual dock deck edges, beacons and connected access"), We = [], Ze = F.meta.dockClearBox;
  for (let [E, B] of re.entries()) {
    let K = B[0], Xe = B[2] + Ze.min[2], ht = B[2] + Ze.max[2], st = r.width / 2 + 1.1, mt = Ze.min[1] - 0.17;
    We.push({ key: "dock" + (E + 1), label: "\u8F68\u9053\u8239\u575E " + (E + 1), height: mt + 0.029, points: [[K - st - 0.2, $ - 2.3], [K + st + 0.2, $ - 2.3], [K + st + 0.2, ht + 0.4], [K - st - 0.2, ht + 0.4]] });
    for (let an of [-1, 1]) {
      Re.box(0.34, 0.047, ht - Xe + 0.92, y.deep, [K + an * st, mt, (Xe + ht) / 2 - 0.06], 5e-3), Re.ibeam([K + an * (st + 0.15), mt - 0.08, Xe - 0.52], [K + an * (st + 0.15), mt - 0.08, ht + 0.4], 0.055, 0.075, y.pale), Be(Re, [K + an * (st + 0.17), mt + 0.026, Xe - 0.49], [K + an * (st + 0.17), mt + 0.026, ht + 0.39], 0.17), Re.box(0.34, 0.047, 0.77, y.deep, [K + an * st, mt, $ + 0.14], 5e-3);
      for (let Fn of [Xe - 0.47, ht + 0.35]) Re.box(0.075, 0.095, 0.075, y.deep, [K + an * st, mt + 0.074, Fn], 7e-3), Re.box(0.047, 0.017, 0.047, y.light, [K + an * st, mt + 0.132, Fn], 3e-3);
      for (let Fn = 0; Fn < 9; Fn++) Re.box(0.06, 3e-3, 0.2, y.yellow, [K + an * (st - 0.07), mt + 0.027, Xe + 0.2 + Fn * 0.83], 0);
    }
    for (let an = 0; an < 9; an++) Re.box(0.16, 4e-3, 0.085, y.yellow, [K + (an - 4) * 0.31, Ze.min[1] - 0.083, ht + 0.17], 0);
    let Ft = 0.257, fn = 0.95;
    Re.box(0.7, 0.025, Math.hypot(fn, Ft), y.dull, [K, w - 0.863, _e + 0.45], 3e-3, [Math.atan2(Ft, fn), 0, 0]);
  }
  We.push({ key: "logisticsSpine", label: "\u8F68\u9053\u7269\u6D41\u810A\u6881", height: w - 0.726, points: [[-21.6 * l, _e - 0.49], [21.6 * l, _e - 0.49], [21.6 * l, _e + 0.49], [-21.6 * l, _e + 0.49]] });
  let nt = _e - 0.47, T = q + 0.036, N = w - 0.731;
  Re.box(0.41, 0.046, 1.46, y.deep, [-1.61, T - 0.023, nt + 0.6], 4e-3);
  for (let E = 0; E < 24; E++) Re.box(0.144, 0.065, 0.39, y.dull, [-1.6 + (E + 0.5) * 3.2 / 24, T + (E + 1) * (N - T) / 24 - 0.0325, nt], 3e-3);
  for (let E of [nt - 0.205, nt + 0.205]) {
    Re.beam([-1.64, T - 0.1, E], [1.65, N - 0.1, E], 0.047, 0.07, y.steel), Re.pipe([-1.64, T + 0.18, E], [1.65, N + 0.18, E], 8e-3, y.yellow, 6);
    for (let B = 0; B <= 8; B++) {
      let K = -1.6 + B * 0.4, Xe = T + (N - T) * B / 8;
      Re.pipe([K, Xe, E], [K, Xe + 0.18, E], 7e-3, y.steel, 6);
    }
  }
  Re.box(0.43, 0.044, 0.58, y.deep, [1.68, N - 0.022, _e - 0.3], 4e-3), Re.box(0.54, 0.052, 0.5, y.yellow, [0.15, T, $ - 5.76], 8e-3), Re.box(0.54, 0.052, 0.5, y.dull, [0.15, N, $ - 5.76], 8e-3);
  for (let E of [-0.3, 0.3]) for (let B of [-0.27, 0.27]) Re.ibeam([0.15 + E, T, $ - 5.76 + B], [0.15 + E, N + 0.28, $ - 5.76 + B], 0.04, 0.055, y.pale);
  Re.box(0.54, 0.042, 0.58, y.deep, [0.15, N - 0.01, $ - 6.12], 6e-3), Re.finish(u.orbitalEdges);
  let te = new e.Group(), oe = new e.Group(), Ne = new e.Group(), Ue = new e.Group();
  te.name = "City ground silhouette", oe.name = "City orbital silhouette", Ne.name = "Heavy carrier far silhouette", Ue.name = "Heavy carrier cable silhouettes", u.silhouette.add(te, oe, Ne, Ue);
  let x = new le("City distant ground");
  x.box(o, 0.055, a, y.soil, [0, h - 0.035, 0], 0.01);
  for (let E of Ht) x.box(E.w * l, 0.015, E.d * c, y.road, we(E.x, 3e-3, E.z), 1e-3);
  for (let E of Te) x.beam(O(...E.a).add(O(0, 0.06, 0)).toArray(), O(...E.b).add(O(0, 0.06, 0)).toArray(), 0.1, 0.1, E.solid ? y.concrete : y.dull);
  for (let E of [we(0.94, 0.2, 19.65), we(-25.65, 0.2, 3.31), we(0.94, 0.2, -19.65)]) x.box(0.48, 0.4, 0.6, y.navy, E, 5e-3);
  x.box(9.25 * l, 0.018, 5.2 * c, y.concrete, we(-25.6, -3e-3, 11.44), 2e-3);
  for (let E of qe) !E.type.startsWith("satellite") && E.type !== "central load-bearing megastructure" && x.box(E.dimensions[0], E.dimensions[1], E.dimensions[2], /utility/.test(E.type) ? y.pale : y.navy, [E.position[0], h + E.dimensions[1] / 2, E.position[2]], 0.015);
  for (let E of Ke) x.box(2.4, 1.35, 2.2, y.concrete, [E.foot[0], h + 0.64, E.foot[2]], 0.05), x.beam(E.foot, E.top, 0.82, 0.91, y.pale);
  for (let E of [-1, 1]) x.beam([-8.8 * l, Oe, $ + E * 3.05 * c], [8.8 * l, Oe, $ + E * 3.05 * c], 0.46, 0.58, y.pale);
  let D = new e.Mesh(x.geometry(), M.paint);
  te.add(D);
  let Z = new le("Main tension bundle silhouettes");
  for (let E of Vt) Z.beam(E.bottom, E.top, 0.14, 0.12, y.steel);
  Ue.add(new e.Mesh(Z.geometry(), M.paint));
  let j = new le("Orbital logistics ring silhouette");
  for (let E = 0; E < 24; E++) {
    let B = E * Math.PI / 12, K = (E + 1) * Math.PI / 12;
    for (let Xe of [H, L]) for (let ht of [q, w + 0.56]) j.beam(J(Xe, B, ht), J(Xe, K, ht), 0.14, 0.18, y.pale);
    E % 3 === 0 && j.beam(J(L, B, q - 0.4), J(L, B, w + 1.95), 0.23, 0.27, y.pale);
  }
  j.box(42.7 * l, 0.27, 0.76, y.deep, [0, w - 1, _e], 6e-3);
  for (let E of [-1, 1]) j.box(15.4 * l, 0.071, 2.75, y.navy, [E * 13.3 * l, w - 1.1, _e - 1.88], 0.012);
  oe.add(new e.Mesh(j.geometry(), M.paint));
  let z = new le("Heavy carrier silhouette");
  z.box(6.82, 0.38, 3.55, y.deep, [0, -0.44, 0], 0.05);
  for (let [E, B] of Dt) z.box(0.98, 2.06, 1.03, y.pale, [E, 0.15, B - $], 0.08);
  Ne.add(new e.Mesh(z.geometry(), M.paint));
  let ge = { running: true, activity: 1, construction: 1, storageFill: 0.6, assemblyProgress: 0.96, showDemoShip: true }, xe = false, Me = 0, Je = 0, Mt = 1.1, dt = h + 0.94, yt = w - 2.5, wt = (yt - dt) / 8.5, It = [7, wt, 6, wt], Bt = { groundVisible: true, cableVisible: true, stationVisible: true, detail: "near", animate: true }, qt = { y: dt, region: "ground", phase: "ground loading / dwell" };
  function dn(E) {
    return E < 0.14 ? E * E / (2 * 0.14 * (1 - 0.14)) : E > 1 - 0.14 ? 1 - (1 - E) ** 2 / (2 * 0.14 * (1 - 0.14)) : (E - 0.14 / 2) / (1 - 0.14);
  }
  function In() {
    let E = ke(Mt / It[Je]);
    qt.y = Je === 0 ? dt : Je === 2 ? yt : Je === 1 ? dt + dn(E) * (yt - dt) : yt - dn(E) * (yt - dt), qt.region = qt.y < dt + 4 ? "ground" : qt.y > yt - 4 ? "station" : "cable", qt.phase = ["ground loading / dwell", "heavy lift ascent", "orbital unloading / dwell", "heavy lift descent"][Je], ut.position.set(0, qt.y, $), Ne.position.copy(ut.position), be.visible = Je === 0 || Je === 1 || Je === 2 && E < 0.8;
  }
  let Vn = (E) => E === "ground" ? Bt.groundVisible : E === "station" ? Bt.stationVisible : Bt.cableVisible;
  function Xi() {
    let E = Bt.detail !== "far";
    u.groundPort.visible = E && Bt.groundVisible, u.cables.visible = E && Bt.cableVisible, u.station.visible = E && Bt.stationVisible, u.shipAssembly.visible = E && Bt.stationVisible, u.roads.visible = E && Bt.groundVisible, u.perimeter.visible = E && Bt.groundVisible, u.edgeTerrain.visible = Bt.groundVisible, u.orbitalEdges.visible = E && Bt.stationVisible, u.cabins.visible = E, u.effects.visible = E, u.silhouette.visible = !E && (Bt.groundVisible || Bt.cableVisible || Bt.stationVisible), rt.visible = true, Qe.visible = ge.construction >= 0.16, _t.visible = ge.construction >= 0.3, vt.visible = ge.construction >= 0.45, Ye.visible = ge.construction >= 0.42, ut.visible = ge.construction >= 0.62 && Vn(qt.region), lt.visible = Bt.groundVisible && ge.construction >= 0.73, te.visible = Bt.groundVisible, Ue.visible = Bt.cableVisible, oe.visible = Bt.stationVisible, Ne.visible = ge.construction >= 0.62 && Vn(qt.region);
  }
  function Ui(E = {}) {
    if (!xe) {
      for (let B of ["running", "showDemoShip"]) B in E && (ge[B] = !!E[B]);
      for (let B of ["activity", "construction", "storageFill", "assemblyProgress"]) B in E && (ge[B] = ke(E[B]));
      F.setVisualState(ge), gn(ge.storageFill), be.count = Math.round(U.length * ge.storageFill), $e(true), Xi();
    }
  }
  function is(E = 0, B = {}) {
    if (xe) return;
    Bt = { groundVisible: B.groundVisible ?? true, cableVisible: B.cableVisible ?? true, stationVisible: B.stationVisible ?? true, detail: B.detail === "far" ? "far" : "near", animate: B.animate ?? true }, F.update(E, Bt);
    let K = Math.max(0, Math.min(0.1, Number.isFinite(E) ? E : 0)) * ge.activity;
    ge.running && Bt.animate && Bt.detail === "near" && ge.activity > 0 && (Vn(qt.region) && ge.construction >= 0.62 && (Mt += K, Mt >= It[Je] && (Mt -= It[Je], Je = (Je + 1) % 4)), Bt.groundVisible && ge.construction >= 0.73 && (Me += K, on.forEach((Xe, ht) => {
      let st = ht < 16 ? 1 : -1, mt = ((Xe.p[0] + st * Me * 0.14 + o * 0.475) % (o * 0.95) + o * 0.95) % (o * 0.95) - o * 0.475;
      Q.compose(O(mt, Xe.p[1], Xe.p[2]), Xe.q, O(1, 1, 1)), xn.setMatrixAt(ht, Q);
    }), xn.instanceMatrix.needsUpdate = true)), In(), $e(false), Xi();
  }
  let Ns = [[-30.24 * l, -22.2 * c], [27.45 * l, -22.2 * c], [27.45 * l, 22.65 * c], [-30.24 * l, 22.65 * c]], Ro = (E, B) => {
    if (Math.abs(E) <= o / 2 && Math.abs(B) <= a / 2 || Ht.some((K) => Math.abs(E - K.x * l) <= K.w * l / 2 && Math.abs(B - K.z * c) <= K.d * c / 2) || E >= -30.23 * l && E <= -21 * l && B >= 8.95 * c && B <= 13.94 * c) return h;
    for (let K = 0; K < v.length; K += 9) {
      let Xe = v[K], ht = v[K + 2], st = v[K + 3], mt = v[K + 5], Ft = v[K + 6], fn = v[K + 8], an = (mt - fn) * (Xe - Ft) + (Ft - st) * (ht - fn);
      if (Math.abs(an) < 1e-10) continue;
      let Fn = ((mt - fn) * (E - Ft) + (Ft - st) * (B - fn)) / an, rn = ((fn - ht) * (E - Ft) + (Xe - Ft) * (B - fn)) / an, Ln = 1 - Fn - rn;
      if (Fn >= -1e-7 && rn >= -1e-7 && Ln >= -1e-7) return Fn * v[K + 1] + rn * v[K + 4] + Ln * v[K + 7] + 8e-3;
    }
    return f(E, B);
  }, Kn = { ground: { eye: [60 * l, h + 39, 59 * c], target: [-1, h + 4.8, -0.3 * c] }, top: { eye: [0, h + 101, 0], target: [0, h, 0], up: [0, 0, -1] }, entry: { eye: [7 * l, h + 5.5, 29.5 * c], target: [0.55 * l, h + 0.24, 18.7 * c] }, edge: { eye: [-35.2 * l, h + 8.8, 22.2 * c], target: [-24.4 * l, h + 0.32, 11.8 * c] }, stationTop: { eye: [0, w + 84, $ - 1], target: [0, w - 1, $ - 1], up: [0, 0, -1] }, dockEntry: { eye: [27.3 * l, w + 5.3, 13.4 * c], target: [18 * l, w - 0.24, 3.9 * c] }, close: { eye: [25, h + 18, 19], target: [0, h + 7.2, $] }, logistics: { eye: [24, h + 14, 27], target: [0, h + 1.2, 7.2 * c] }, cabin: { eye: [12.1, h + 6.2, 6], target: [0, dt + 0.24, $] }, station: { eye: [42 * l, w + 23, 31], target: [0, w - 0.2, 1.3 * c] }, dock: { eye: [16 * l, w + 6, 12.5], target: [8 * l, w + 0.1, $ + 3.5] }, ring: { eye: [15, w + 10.5, 12], target: [0, w - 1, $] } }, ai = (E, B = [0, 1, 0]) => ({ position: E, normal: O(...B).normalize().toArray() }), Po = (E, B) => ai(E.position.map((K, Xe) => K + B[Xe]), E.normal), Bu = re[1], xf = { ground: ai([0, h, 0]), viewGround: ai(Kn.ground.eye, O(...Kn.ground.target).sub(O(...Kn.ground.eye)).toArray()), viewStation: ai(Kn.station.eye, O(...Kn.station.target).sub(O(...Kn.station.eye)).toArray()), cableBottom: ai([0, h + 0.08, $], [0, 1, 0]), cableTop: ai([0, w, $], [0, -1, 0]), station: ai([0, w, $], [0, -1, 0]), dock: Po(F.anchors.dock, Bu), departure: Po(F.anchors.departure, Bu), mainEntry: { position: we(0, 0, 22.6), direction: [0, 0, 1], normal: [0, 1, 0], width: 1.03 * l, clearanceHeight: 1.1 }, cargoEntry: { position: we(-29.87, 0, 2.4), direction: [-1, 0, 0], normal: [0, 1, 0], width: 1.1 * c, clearanceHeight: 1.1 }, serviceEntry: { position: we(0, 0, -22.15), direction: [0, 0, -1], normal: [0, 1, 0], width: 0.78 * l, clearanceHeight: 1.1 }, railEntry: { position: we(-30.2, 0.037, 11.44), direction: [-1, 0, 0], normal: [0, 1, 0], width: 5.12 * c, clearanceHeight: 1.2, tracks: 8 } }, Yi = [...re.flatMap((E) => F.cableAnchors.map((B) => ({ bottom: B.bottom.map((K, Xe) => K + E[Xe]), top: B.top.map((K, Xe) => K + E[Xe]) }))), ...Vt], il = re.map((E, B) => ({ index: B, dock: Po(F.anchors.dock, E), departure: Po(F.anchors.departure, E), clearance: { min: F.meta.dockClearBox.min.map((K, Xe) => K + E[Xe]), max: F.meta.dockClearBox.max.map((K, Xe) => K + E[Xe]) } })), sl = { up: [0, 1, 0], clearanceRadius: F.dockAccess.clearanceRadius };
  Ui({}), In(), is(0), p.updateMatrixWorld(true);
  let rl = (E) => {
    let B = new e.Box3().setFromObject(E, true);
    return B.isEmpty() ? null : { min: B.min.toArray(), max: B.max.toArray() };
  }, Fs = Object.fromEntries(Object.entries(u).map(([E, B]) => [E, rl(B)])), ol = new e.Box3(O(-4.7, dt - 1, $ - 2.5), O(4.7, yt + 1.26, $ + 2.5));
  for (let E of re) ol.union(new e.Box3(O(...F.groupBounds.cabins.min).add(O(...E)), O(...F.groupBounds.cabins.max).add(O(...E))));
  Fs.cabins = { min: ol.min.toArray(), max: ol.max.toArray() };
  let Zi = new e.Box3();
  for (let E of Object.values(Fs)) E && Zi.union(new e.Box3(O(...E.min), O(...E.max)));
  let R = { min: Zi.min.toArray(), max: Zi.max.toArray() }, W = Zi.getCenter(O(0, 0, 0)), Pe = O(0.85, 0.23, 1.6).normalize(), St = V.clone().cross(Pe).normalize(), Pt = Pe.clone().cross(St).normalize(), zt = Math.tan(38 * Math.PI / 360) * 0.8, Ut = 0;
  for (let E of [Zi.min.x, Zi.max.x]) for (let B of [Zi.min.y, Zi.max.y]) for (let K of [Zi.min.z, Zi.max.z]) {
    let Xe = O(E, B, K).sub(W);
    Ut = Math.max(Ut, Xe.dot(Pe) + Math.max(Math.abs(Xe.dot(St)), Math.abs(Xe.dot(Pt))) / zt);
  }
  Kn.whole = { eye: W.clone().addScaledVector(Pe, Ut * 1.005).toArray(), target: W.toArray() };
  let sn = ["north reserve warehouses", "north distribution warehouses", "north terminal warehouses", "west outer elevator terminal", "west inner elevator terminal", "east inner elevator terminal", "east outer elevator terminal", "central heavy lift megastructure", "freight transit and landing aprons", "eight-line rail freight yard", "west utility corridor", "east utility corridor"], Sn = { name: "TETHER METROPOLIS / \u5DE8\u578B\u592A\u7A7A\u7535\u68AF\u7269\u6D41\u6E2F\u57CE", version: "2.0.0", seed: t, stationHeight: n, portSize: s, dockClearance: r, groundGrade: h, city: { width: o, depth: a, baselineWidth: 6, baselineDepth: 4, areaRatio: o * a / 24, districtCount: sn.length, buildingCount: qe.length, warehouseCount: qe.filter((E) => /warehouse|freight hall/.test(E.type)).length, orbitalDocks: 4, satelliteTerminals: 4, heavyPlatforms: 1, railwayTracks: 8, railFlatcars: Kt.length, containerCapacity: Qt, landingPads: 4, mainTowerHeight: 15.6, primaryCableRoutes: Yi.length }, districts: sn, buildings: qe, dockAnchors: il, siteBoundary: G, workAreaBoundaries: We, planLabels: [{ label: "\u4ED3\u50A8\u8857\u533A", position: we(0, 1.8, -14) }, { label: "\u91CD\u578B\u5347\u964D\u4F5C\u4E1A\u533A", position: we(0, 16.2, -3.6) }, { label: "\u8D27\u8FD0\u8F6C\u8FD0\u576A", position: we(0, 1.8, 6.6) }, { label: "\u516B\u7EBF\u94C1\u8DEF\u8D27\u573A", position: we(0, 2, 11.44) }], logisticsRoutes: [{ key: "road", label: "\u6E2F\u533A\u8D27\u8FD0\u9053\u8DEF", points: [we(-29.87, 0.08, 2.4), we(0, 0.08, 2.4), we(0, 0.08, 18.73), we(0, 0.08, 22.6)] }, { key: "rail", label: "\u94C1\u8DEF\u5BF9\u5916\u63A5\u53E3", points: [we(-30.2, 0.09, 11.44), we(-23, 0.09, 11.44), we(20.9, 0.09, 11.44)] }, { key: "orbital", label: "\u8F68\u9053\u7269\u6D41\u8FDE\u63A5", points: [[-18 * l, w - 0.69, $ - 1.9], [-18 * l, w - 0.69, _e], [18 * l, w - 0.69, _e], [18 * l, w - 0.69, $ - 1.9]] }], ring: { center: [0, w - 1.5, $], innerRadius: H, outerRadius: L, clearHeavyPlatformWell: true }, heavyPlatform: { size: [9.04, 2.24, 4.78], cornerDrivePods: 4, ordinarySizeCargoSlots: U.length, bottomCenter: dt, topCenter: yt, travelSeconds: wt }, animationObjects: F.meta.animationObjects * re.length + on.length + 1, equipment: ["4 complete satellite freight elevator terminals", "24 detailed north warehouses", "8 large freight transit halls", "8 rail distribution warehouses", "12 utility and maintenance buildings", "4 inclined double-chord colossal load towers", "separate stepped reinforced-concrete foundations", "28 radiating structural stays", "four-corner heavy lift platform with circular fan and brake assemblies", "4 heavy six-ribbon cable bundles", "8 main satellite freight cable lanes and 4 maintenance lanes", "8-track freight yard with flatcars", "8 rail-mounted freight gantries", "stock-controlled stacked cargo distributed through city districts", "4 marked landing and transfer aprons", "32 moving ordinary-size road tractors", "4 open shipbuilding docks, 24 hydraulic assembly arms", "one open orbital logistics ring with clear central platform well", "rear orbital freight spine, transfer locks and radiator farms"], views: Kn, footprint: Ns, bounds: R, groupBounds: Fs, design: "Original heavy industrial city in the established steel, desaturated navy, grey concrete and safety-yellow palette. Colossal inclined foundations, a braced open collar, tension bundles and a four-nacelle carrier take broad formal inspiration from The Wandering Earth 2. All earlier terminals are instanced at their original scale.", limitations: ["The city is a procedural visual asset, without logistics queues or cable physics.", "Storage uses bottom-supported column occupancy; precise stocks and assemblyProgress remain host inputs.", "The central carrier has a kinematic load/ascent/unload/descent cycle. Hidden regions and far detail stop its clock.", "City footprint is terraced to the maximum input terrain sample. No external terrain mesh is modified.", "Far city geometry favors the completed city silhouette; detailed construction phases are shown in near mode."] };
  function kn() {
    return [...re.flatMap((E, B) => F.getCabinStates().map((K) => ({ ...K, site: B, position: K.position.map((Xe, ht) => Xe + E[ht]) }))), { lane: "heavy", site: "central", position: ut.position.toArray(), phase: qt.phase, phaseFraction: Mt / It[Je], region: qt.region, visible: ut.visible && u.cabins.visible }];
  }
  function yn() {
    if (!xe) {
      xe = true, p.traverse((E) => {
        E.isInstancedMesh && E.dispose();
      });
      for (let E of _) E.dispose();
      for (let E of g) E.dispose();
      F.dispose(), _.clear(), g.clear(), Ae.clear(), ve.length = 0, p.clear();
    }
  }
  return { root: p, groups: u, footprint: Ns, siteBoundary: G, workAreaBoundaries: We, bounds: R, groupBounds: Fs, anchors: xf, cableAnchors: Yi, dockAccess: sl, dockAnchors: il, heightAt: Ro, setVisualState: Ui, update: is, dispose: yn, views: Kn, meta: Sn, getCabinStates: kn, getVisualState: () => ({ ...ge }) };
}

export {Og as createOriginalIndustry, zg as createOriginalSpaceport};
