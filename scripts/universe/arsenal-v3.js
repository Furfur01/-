// Extracted from the user-provided stellar_arsenal (3).html.
// Geometry and shaders retained; imported Three.js replaces the embedded library.
import {AdditiveBlending as mt, DoubleSide as Lt, Float32BufferAttribute as rt, Vector3 as T, Quaternion as tn, Group as pt, Object3D as At, MeshStandardMaterial as Rt, MeshBasicMaterial as St, BoxGeometry as Sn, CylinderGeometry as pn, TorusGeometry as kn, CircleGeometry as Ps, Mesh as Qe, BufferGeometry as ft, ShaderMaterial as ct, SphereGeometry as nn, PointLight as Ei, Shape as Sr, ExtrudeGeometry as No, CatmullRomCurve3 as Is, TubeGeometry as br, InstancedMesh as Tt, Color as Ke, Points as In, PointsMaterial as Mr} from 'three';
import {missileFlight,missileFlightTime} from './arsenal-motion.js';
  function gu({ target: i }) {
    let r = new T(1, 0, 0), o = new T(0, 1, 0), a = new T(-390, 42, 290), l = i.clone().sub(a).normalize(), c = new tn().setFromUnitVectors(r, l), h = c.clone().invert(), u = new pt();
    u.name = "ASTERION \xB7 \u5FAE\u6838\u53D1\u5C04\u8230", u.position.copy(a), u.quaternion.copy(c);
    let d = new pt();
    d.name = "Continuous armoured twin-spine launch hull", u.add(d);
    let f = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set(), M = (C) => (f.add(C), C), m = (C) => (g.add(C), C), p = (C) => Math.min(1, Math.max(0, C)), S = (C, j, J) => {
      let he = p((J - C) / (j - C));
      return he * he * (3 - 2 * he);
    }, E = (C) => C.clone().applyQuaternion(c).add(a), _ = (C) => C.clone().applyQuaternion(c), A = new At(), P = new tn(), D = -1, N = false, v = m(new Rt({ color: 2700094, metalness: 0.82, roughness: 0.37 })), x = m(new Rt({ color: 5464427, metalness: 0.83, roughness: 0.31 })), R = m(new Rt({ color: 7569546, metalness: 0.9, roughness: 0.29 })), U = m(new Rt({ color: 1120547, metalness: 0.64, roughness: 0.48 })), V = m(new Rt({ color: 593686, metalness: 0.32, roughness: 0.66 })), G = m(new Rt({ color: 1118998, metalness: 0.27, roughness: 0.72, emissive: 9580560, emissiveIntensity: 8e-3 })), O = m(new Rt({ color: 9070140, metalness: 0.87, roughness: 0.32 })), X = m(new Rt({ color: 12174533, metalness: 0.79, roughness: 0.29 })), te = m(new Rt({ color: 464161, metalness: 0.64, roughness: 0.16, emissive: 730944, emissiveIntensity: 0.18 })), W = m(new St({ color: 5482442, toneMapped: false })), fe = m(new St({ color: 12026171, toneMapped: false })), Ee = m(new St({ color: 10936043, toneMapped: false })), Re = M(new Sn(1, 1, 1)), We = M(new pn(1, 1, 1, 20).rotateZ(-Math.PI / 2)), De = M(new pn(0.72, 1, 1, 24, 1, true).rotateZ(-Math.PI / 2)), He = M(new kn(1, 0.055, 6, 40).rotateY(Math.PI / 2)), Ze = M(new kn(1, 0.022, 5, 32).rotateY(Math.PI / 2)), Q = M(new Ps(1, 32).rotateY(Math.PI / 2)), re = /* @__PURE__ */ new Map();
    function ae(C, j, J, he = [1, 1, 1], Ve = P) {
      let lt = C.uuid + ":" + j.uuid;
      re.has(lt) || re.set(lt, { geometry: C, material: j, matrices: [] }), A.position.set(...J), A.scale.set(...he), A.quaternion.copy(Ve), A.updateMatrix(), re.get(lt).matrices.push(A.matrix.clone());
    }
    function de(C, j, J, he) {
      ae(Re, C, j, J, he);
    }
    function be(C, j, J, he = 1) {
      let Ve = new T(...j), lt = new T(...J), zt = lt.clone().sub(Ve);
      ae(Re, C, Ve.add(lt).multiplyScalar(0.5).toArray(), [zt.length(), he, he], new tn().setFromUnitVectors(r, zt.normalize()));
    }
    function et(C, j, J = d, he = [0, 0, 0], Ve = [1, 1, 1]) {
      let lt = new Qe(M(C), j);
      return lt.position.set(...he), lt.scale.set(...Ve), J.add(lt), lt;
    }
    function Ye(C, j, J, he) {
      C.push(...j, ...J, ...he);
    }
    function I(C, j, J, he, Ve) {
      Ye(C, j, J, he), Ye(C, j, he, Ve);
    }
    function le(C, j, J) {
      let he = C.map(([wt, Pt, Mt, hn, un]) => [[wt, hn + un, Pt - Mt * 0.67], [wt, hn + un, Pt + Mt * 0.67], [wt, hn + un * 0.48, Pt + Mt], [wt, hn - un * 0.5, Pt + Mt], [wt, hn - un, Pt + Mt * 0.7], [wt, hn - un, Pt - Mt * 0.7], [wt, hn - un * 0.5, Pt - Mt], [wt, hn + un * 0.48, Pt - Mt]]), Ve = [];
      for (let wt = 0; wt < he.length - 1; wt++) for (let Pt = 0; Pt < 8; Pt++) I(Ve, he[wt][(Pt + 1) % 8], he[wt + 1][(Pt + 1) % 8], he[wt + 1][Pt], he[wt][Pt]);
      let lt = C[0], zt = C.at(-1);
      for (let wt = 0; wt < 8; wt++) Ye(Ve, [lt[0], lt[3], lt[1]], he[0][(wt + 1) % 8], he[0][wt]), Ye(Ve, [zt[0], zt[3], zt[1]], he.at(-1)[wt], he.at(-1)[(wt + 1) % 8]);
      let Zt = new ft();
      Zt.setAttribute("position", new rt(Ve, 3)), Zt.computeVertexNormals();
      let cn = et(Zt, j);
      return cn.name = J, cn;
    }
    function se(C, j, J, he, Ve, lt = "Bevelled armour plate") {
      let zt = 0;
      for (let qt = 0; qt < C.length; qt++) {
        let sn = C[qt], wi = C[(qt + 1) % C.length];
        zt += sn[0] * wi[1] - wi[0] * sn[1];
      }
      let Zt = zt > 0 ? [...C].reverse() : C, cn = Zt.reduce((qt, sn) => qt + sn[0], 0) / Zt.length, wt = Zt.reduce((qt, sn) => qt + sn[1], 0) / Zt.length, Pt = Zt.map(([qt, sn]) => [qt, j, sn]), Mt = Zt.map(([qt, sn]) => [qt, j + J - he, sn]), hn = Zt.map(([qt, sn]) => {
        let wi = cn - qt, qr = wt - sn, aa = Math.hypot(wi, qr);
        return [qt + wi / aa * he, j + J, sn + qr / aa * he];
      }), un = [];
      for (let qt = 0; qt < Zt.length; qt++) {
        let sn = (qt + 1) % Zt.length;
        I(un, Pt[qt], Pt[sn], Mt[sn], Mt[qt]), I(un, Mt[qt], Mt[sn], hn[sn], hn[qt]), Ye(un, [cn, j + J, wt], hn[qt], hn[sn]), Ye(un, [cn, j, wt], Pt[sn], Pt[qt]);
      }
      let Wn = new ft();
      Wn.setAttribute("position", new rt(un, 3)), Wn.computeVertexNormals();
      let Xr = et(Wn, Ve);
      return Xr.name = lt, Xr;
    }
    let oe = (C, j) => C.map(([J, he]) => [J, he * j]);
    for (let C of [-1, 1]) {
      le([[-215, C * 34, 25, -3, 18], [-162, C * 36, 28, -1, 22], [-72, C * 32, 25, 0, 20], [55, C * 26, 20, -1, 15], [153, C * 18, 12, -2, 9], [224, C * 9.5, 4, -2, 3.5]], v, C < 0 ? "Port continuous hull" : "Starboard continuous hull"), le([[-204, C * 34, 20, -13, 10], [-132, C * 33, 22, -13, 12], [-15, C * 28, 19, -13, 10], [104, C * 21, 13, -11, 6], [184, C * 13, 5, -7, 2]], U, "Layered ventral armour");
      let j = [{ p: [[-210, 14], [-210, 52], [-166, 63], [-132, 56], [-136, 14]], y: 16, h: 6, m: x }, { p: [[-129, 14], [-130, 56], [-68, 56], [-42, 47], [-49, 13]], y: 18, h: 5, m: v }, { p: [[-46, 13], [-40, 46], [33, 43], [62, 33], [37, 10]], y: 15, h: 5, m: x }, { p: [[41, 10], [65, 33], [130, 29], [155, 17], [128, 8]], y: 10, h: 4, m: v }, { p: [[131, 8], [158, 17], [214, 12], [225, 7], [186, 5]], y: 5, h: 3, m: x }];
      for (let J of j) se(oe(J.p, C), J.y, J.h, 1.5, J.m);
      be(R, [-194, 15, C * 60], [-82, 15, C * 56], 0.75), be(O, [-129, 22, C * 14], [-49, 20, C * 13], 0.48), be(O, [46, 16, C * 10.4], [126, 13, C * 8.4], 0.42), be(R, [72, 2, C * 43], [179, -1, C * 22], 0.8), be(U, [-174, -3, C * 62], [-35, -2, C * 54], 3.6), be(W, [-161, -2.1, C * 63], [-116, -1.7, C * 60.6], 0.26), be(W, [-82, -1.5, C * 58.7], [-49, -1.2, C * 56], 0.26), be(fe, [79, 1.8, C * 42.6], [132, 0.6, C * 31.6], 0.23);
      for (let [J, he, Ve] of [[-158, 69, 76], [-75, 53, 66]]) {
        let lt = [[J - 35, C * 45], [J - 18, C * Ve], [J + he, C * (Ve - 8)], [J + he - 16, C * 41]];
        se(lt, -6, 3.2, 0.75, x, "Swept radiator frame");
        let zt = [[J - 29, C * 47], [J - 14, C * (Ve - 2.8)], [J + he - 6, C * (Ve - 10)], [J + he - 17, C * 44]];
        se(zt, -2.8, 0.8, 0.2, G, "Recessed radiator field");
        for (let Zt = 0; Zt < 20; Zt++) {
          let cn = (Zt + 0.5) / 20, wt = J - 18 + cn * (he + 3), Pt = Ve - 3 - cn * 7;
          be(O, [wt, -1.83, C * 47.5], [wt + 8, -1.83, C * Pt], 0.25);
        }
        be(O, [J - 18, -1.6, C * (Ve - 2)], [J + he - 6, -1.6, C * (Ve - 10)], 0.55), be(v, [J - 17, -7, C * 35], [J - 3, -5, C * (Ve - 5)], 2.7), be(v, [J + he - 24, -7, C * 31], [J + he - 11, -5, C * (Ve - 13)], 2.7), be(O, [J - 16, -0.7, C * 38], [J - 12, -0.7, C * (Ve - 4)], 1), be(O, [J + he - 22, -0.7, C * 35], [J + he - 16, -0.7, C * (Ve - 12)], 1);
      }
      for (let J = 0; J < 15; J++) {
        let he = -180 + J * 13, Ve = C * (60 - J * 0.55);
        de(V, [he, -4, Ve], [7.7, 8.5, 0.8]), de(x, [he, -8.5, Ve + C * 0.55], [8.2, 0.55, 0.9]), de(O, [he - 3.7, -4, Ve + C * 0.55], [0.35, 8.2, 0.8]), J % 3 === 1 && de(W, [he + 1, -1.1, Ve + C * 0.65], [2.7, 0.24, 0.1]);
      }
      for (let J of [-170, -118]) {
        ae(We, U, [J, 14, C * 46], [31, 4, 4]);
        for (let he of [-12, 12]) ae(He, O, [J + he, 14, C * 46], [4.3, 4.3, 4.3]);
        de(v, [J, 9.5, C * 46], [34, 2.5, 12]);
      }
    }
    le([[-208, 0, 18, -16, 10], [-126, 0, 20, -17, 10], [20, 0, 15, -13, 9], [153, 0, 9, -9, 5], [210, 0, 3.5, -4, 2]], U, "Unbroken central keel"), se([[-216, -57], [-216, 57], [-177, 62], [-150, 50], [-150, -50], [-177, -62]], -15, 21, 3, U, "Aft drive spine"), se([[-200, -34], [-200, 34], [-115, 34], [-96, 24], [-96, -24], [-115, -34]], 9, 11, 2, U, "Reactor load-bearing saddle");
    for (let C of [-1, 1]) se(oe([[-91, 40], [-91, 50], [-46, 48], [-36, 40], [-48, 37]], C), 21, 5, 1, v, "Recessed service and reactor-control pod"), be(te, [-86, 25.3, C * 48], [-47, 25.3, C * 46.6], 1.3), be(W, [-82, 26, C * 48.9], [-68, 26, C * 48.4], 0.18), be(x, [-81, 26, C * 44], [-85, 36, C * 44], 0.45), de(V, [-85, 36, C * 44], [3.7, 0.7, 1.7]), de(fe, [-85, 36.45, C * 44], [0.6, 0.13, 0.6]);
    for (let C = 0; C < 11; C++) {
      let j = -134 + C * 29;
      de(U, [j, -6, 0], [4, 6.5, 35 - C * 1.9]), be(x, [j, -5, -15 + C * 0.7], [j, 8, -7], 1), be(x, [j, -5, 15 - C * 0.7], [j, 8, 7], 1);
    }
    let ie = m(new St({ color: 5943241, transparent: true, opacity: 0.5, side: Lt, blending: mt, depthWrite: false, toneMapped: false }));
    for (let C of [-47, -24, 24, 47]) for (let j of [-10, 6]) {
      ae(De, V, [-219, j, C], [21, 6.4, 6.4]), ae(He, v, [-230, j, C], [6.6, 6.6, 6.6]), ae(He, x, [-229.7, j, C], [5.7, 5.7, 5.7]), ae(Ze, W, [-229.4, j, C], [4.9, 4.9, 4.9]), ae(Q, ie, [-219.8, j, C], [4.7, 4.7, 4.7]);
      for (let J = 0; J < 6; J++) {
        let he = J * Math.PI / 3;
        be(O, [-228, j + Math.cos(he) * 6.4, C + Math.sin(he) * 6.4], [-211, j + Math.cos(he) * 4.5, C + Math.sin(he) * 4.5], 0.45);
      }
    }
    let Pe = new T(-150, 48, 0), ve = m(new Rt({ color: 5661034, metalness: 0.9, roughness: 0.3, emissive: 3171203, emissiveIntensity: 0.12 })), Ae = m(new ct({ uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec3 vP,vN,vV;void main(){vP=position;vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-p.xyz;gl_Position=projectionMatrix*p;}", fragmentShader: "uniform float uTime,uPower;varying vec3 vP,vN,vV;void main(){float band=pow(.5+.5*sin(vP.x*27.+sin(vP.y*16.+uTime*.8)*1.8+uTime*(.6+uPower*2.)),11.);float filament=pow(.5+.5*sin(vP.z*35.+vP.x*22.-uTime*2.7+sin(vP.y*13.)*3.),23.);float fresnel=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);vec3 c=mix(vec3(.018,.045,.075),vec3(.15,.40,.59),uPower*.72);c+=vec3(.15,.40,.59)*(band*.28+fresnel*.2)*( .25+uPower*.75);c+=vec3(.62,.32,.11)*filament*.34*uPower;gl_FragColor=vec4(c,1.);}", toneMapped: false })), pe = et(new nn(1, 64, 40), Ae, d, Pe.toArray(), [40, 26, 26]);
    pe.name = "Visible magnetically confined reactor core";
    let Ce = new Ei(6004427, 150, 135, 2);
    Ce.position.copy(Pe), d.add(Ce);
    for (let C of [-198, -179, -160, -141, -122, -103]) {
      ae(He, ve, [C, 48, 0], [42, 42, 42]), ae(Ze, O, [C + 0.5, 48, 0], [38, 38, 38]);
      for (let j of [-1, 1]) be(v, [C, 21, j * 27], [C, 41, j * 41], 4.5), de(x, [C, 22, j * 28], [8, 5, 13]);
    }
    for (let C = 0; C < 10; C++) {
      let j = C * Math.PI / 5, J = 48 + Math.cos(j) * 42, he = Math.sin(j) * 42;
      be(C % 2 ? v : x, [-201, J, he], [-100, J, he], 2.4);
      for (let Ve of [-198, -160, -122]) {
        let lt = new tn().setFromAxisAngle(r, -j);
        de(O, [Ve, J, he], [6, 2.9, 6.4], lt);
      }
    }
    function w(C, j, J, he, Ve, lt) {
      let zt = new Sr(), Zt = 10;
      for (let Pt = 0; Pt <= Zt; Pt++) {
        let Mt = he + Ve * Pt / Zt, hn = -Math.sin(Mt) * J, un = Math.cos(Mt) * J;
        Pt ? zt.lineTo(hn, un) : zt.moveTo(hn, un);
      }
      for (let Pt = Zt; Pt >= 0; Pt--) {
        let Mt = he + Ve * Pt / Zt;
        zt.lineTo(-Math.sin(Mt) * (J - lt), Math.cos(Mt) * (J - lt));
      }
      zt.closePath();
      let cn = new No(zt, { depth: j, steps: 1, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.5, bevelThickness: 0.6, curveSegments: 8 });
      cn.rotateY(Math.PI / 2);
      let wt = et(cn, v, d, [C, 48, 0]);
      return wt.name = "Thick segmented reactor shielding", wt;
    }
    for (let C = 0; C < 6; C++) {
      let j = C * Math.PI / 3 + 0.12;
      w(-202, 14, 44, j, 0.63, 3.4), w(-113, 14, 44, j, 0.63, 3.4), (C === 1 || C === 2 || C === 4 || C === 5) && w(-181, 51, 43.7, j + 0.13, 0.31, 2.7);
    }
    ae(We, U, [-203, 48, 0], [8, 18, 18]), ae(He, O, [-207.5, 48, 0], [20, 20, 20]), ae(We, v, [-100, 48, 0], [8, 17, 17]), ae(He, R, [-95.5, 48, 0], [17.6, 17.6, 17.6]), ae(Ze, W, [-95.1, 48, 0], [13.5, 13.5, 13.5]);
    function y(C, j, J, he) {
      let Ve = new Is(C.map((zt) => new T(...zt)), false, "catmullrom", 0.18), lt = et(new br(Ve, 48, j, 9, false), J);
      return lt.name = he, lt;
    }
    for (let C of [-1, 1]) {
      y([[-103, 48, C * 16], [-86, 45, C * 25], [-70, 36, C * 28], [-18, 31, C * 23], [7, 22, C * 12], [45, 18, C * 7]], 2.2, O, "Primary reactor-to-capacitor energy bus"), y([[-101, 38, C * 19], [-81, 28, C * 32], [-29, 23, C * 31], [11, 17, C * 15], [51, 14, C * 8]], 1.35, x, "Shielded pulse bus return"), y([[-170, 17, C * 30], [-164, 6, C * 43], [-154, 2, C * 60], [-133, 0, C * 68]], 1.25, O, "Reactor coolant to radiator header"), y([[-109, 19, C * 33], [-101, 9, C * 46], [-85, 0, C * 53], [-62, 0, C * 60]], 1, x, "Secondary radiator coolant loop");
      for (let j of [-79, -50, -21]) {
        ae(We, V, [j, 30, C * 24], [23, 7.3, 7.3]);
        for (let J of [-11.6, -6.6, 6.6, 11.6]) ae(He, J === -6.6 || J === 6.6 ? O : x, [j + J, 30, C * 24], [7.5, 7.5, 7.5]);
        de(U, [j, 23, C * 24], [25, 3, 18]);
        for (let J = 0; J < 6; J++) {
          let he = J * Math.PI / 3;
          be(x, [j - 10, 30 + Math.cos(he) * 7.45, C * 24 + Math.sin(he) * 7.45], [j + 10, 30 + Math.cos(he) * 7.45, C * 24 + Math.sin(he) * 7.45], 0.55);
        }
      }
    }
    let H = m(new St({ color: 16777215, toneMapped: false })), q = new Tt(Ze, H, 18);
    q.name = "Pulse energy storage charge indicators", d.add(q);
    for (let C = 0; C < 18; C++) {
      let j = Math.floor(C / 3), J = j < 3 ? -1 : 1, he = -79 + j % 3 * 29 + (C % 3 - 1) * 4;
      A.position.set(he, 30, J * 24), A.scale.setScalar(7.53), A.quaternion.identity(), A.updateMatrix(), q.setMatrixAt(C, A.matrix), q.setColorAt(C, new Ke(0.02, 0.05, 0.07));
    }
    let ee = [];
    for (let C = 0; C <= 40; C++) {
      let j = 0.88 + (Math.PI * 2 - 1.76) * C / 40;
      ee.push(new T(0, Math.cos(j), Math.sin(j)));
    }
    let Z = M(new br(new Is(ee), 64, 0.13, 8, false)), Ne = m(new St({ color: 16777215, toneMapped: false })), Me = new Tt(Z, Ne, 20);
    Me.name = "Sequential open linear accelerator stages", d.add(Me);
    for (let C = 0; C < 20; C++) {
      let j = -84 + C * 14.5, J = 12.2 - C * 0.35;
      ae(Z, v, [j, 16.8, 0], [16, J, J]), ae(Z, O, [j + 2.15, 16.8, 0], [3, J * 0.92, J * 0.92]);
      for (let he of [-1, 1]) de(x, [j, 16.8 + J * 0.69, he * J * 0.79], [4.8, 2.4, 3.2]), be(U, [j, 6, he * (J + 0.6)], [j, 16.8, he * J], 2.5);
      A.position.set(j + 2.7, 16.8, 0), A.scale.set(2, J * 0.79, J * 0.79), A.quaternion.identity(), A.updateMatrix(), Me.setMatrixAt(C, A.matrix), Me.setColorAt(C, new Ke(0.018, 0.04, 0.06));
    }
    for (let C of [-1, 1]) de(V, [15, 11.7, C * 5], [397, 3.6, 3.7]), be(x, [-185, 14.2, C * 5], [215, 14.2, C * 1.8], 0.9), be(O, [-176, 13, C * 3.8], [211, 15.3, C * 1.25], 0.44), be(W, [-173, 14.8, C * 3.5], [209, 16.15, C * 0.9], 0.14);
    let Fe = M(new Sn(1, 1, 1)), ge = m(new St({ color: 16777215, transparent: true, opacity: 0.8, blending: mt, depthWrite: false, toneMapped: false })), ce = new Tt(Fe, ge, 72);
    ce.name = "Sequential axial charging cells", d.add(ce);
    let Se = new Ke();
    for (let C = 0; C < 36; C++) {
      let j = -172 + C * 10.7, J = 3.35 - (j + 172) / 384 * 2.3;
      for (let he of [-1, 1]) {
        de(v, [j, 15, he * (J + 1.2)], [1.8, 5, 1.7]), de(x, [j, 17.55, he * (J + 1.2)], [2.1, 0.4, 1.9]);
        let Ve = C * 2 + (he > 0 ? 1 : 0);
        A.position.set(j, 16.3, he * J), A.quaternion.identity(), A.scale.set(2.8, 0.28, 0.18), A.updateMatrix(), ce.setMatrixAt(Ve, A.matrix), ce.setColorAt(Ve, Se.setRGB(0.03, 0.08, 0.11));
      }
    }
    se([[197, -4.5], [197, 4.5], [214, 3.2], [220, 1.3], [220, -1.3], [214, -3.2]], 13.5, 1.6, 0.4, V, "Open micro-projectile loading bed");
    for (let C of [-1, 1]) {
      de(x, [206.7, 15.3, C * 1.8], [17.5, 0.35, 0.28]), de(O, [212, 15.6, C * 0.5], [5.2, 0.16, 0.16]);
      for (let j = 0; j < 6; j++) de(R, [200 + j * 2.3, 15.1, C * 1.55], [0.21, 0.35, 0.45]);
    }
    for (let C of [208.2, 211.9, 216.1]) {
      ae(He, x, [C, 16.8, 0], [1.65, 1.65, 1.65]);
      for (let j = 0; j < 6; j++) {
        let J = j * Math.PI / 3, he = 1.65;
        j < 4 && de(U, [C, 16.8 + Math.cos(J) * 1.8, Math.sin(J) * 1.8], [0.65, 0.5, 0.45]);
      }
      ae(Ze, W, [C + 0.17, 16.8, 0], [1.36, 1.36, 1.36]);
    }
    for (let C of [-1, 1]) {
      de(fe, [210, 3, C * 13], [3.8, 0.22, 0.35]), de(W, [-193, 13, C * 60], [4, 0.25, 0.35]);
      for (let j = 0; j < 24; j++) {
        let J = -194 + j * 14.5, he = C * (48 - Math.max(0, J + 70) * 0.105);
        ae(We, O, [J, 18 - Math.max(0, J + 70) * 0.035, he], [0.4, 0.42, 0.42]);
      }
    }
    for (let C of re.values()) {
      let j = new Tt(C.geometry, C.material, C.matrices.length);
      for (let J = 0; J < C.matrices.length; J++) j.setMatrixAt(J, C.matrices[J]);
      j.name = "Instanced ship fittings", d.add(j);
    }
    let ke = new T(213, 16.8, 0), Oe = E(ke), Le = i.clone().sub(Oe).normalize(), je = Le.clone().applyQuaternion(h), L = new tn().setFromUnitVectors(r, je), ye = Oe.distanceTo(i) - 17, me = new pt();
    me.name = "Single 1.55-unit relativistic penetrator", u.add(me);
    let Ie = new pt();
    Ie.name = "Tiny segmented penetrator", me.add(Ie);
    function B(C, j, J, he, Ve = he, lt = 20) {
      return et(new pn(he, Ve, J, lt).rotateZ(-Math.PI / 2), C, Ie, [j, 0, 0]);
    }
    B(U, -0.02, 1.22, 0.102);
    for (let C = 0; C < 4; C++) {
      let j = -0.48 + C * 0.28;
      B(X, j, 0.235, 0.112 + (C === 0 ? 0.013 : 0)), B(O, j - 0.123, 0.026, 0.119), B(V, j + 0.119, 0.022, 0.119);
    }
    B(x, 0.57, 0.32, 0.018, 0.108, 24), B(O, 0.42, 0.028, 0.122), B(Ee, 0.74, 0.035, 0.028), B(U, -0.65, 0.14, 0.132);
    for (let C = 0; C < 4; C++) {
      let j = 0.11 + C * 0.023, J = new Qe(Ze, x);
      J.position.x = -0.68 - C * 0.076, J.scale.setScalar(j), Ie.add(J);
      let he = new Qe(Ze, W);
      he.position.x = -0.688 - C * 0.076, he.scale.setScalar(j * 0.86), Ie.add(he);
    }
    for (let C = 0; C < 4; C++) {
      let j = C * Math.PI / 2, J = new Qe(Re, O);
      J.position.set(-0.05, Math.cos(j) * 0.116, Math.sin(j) * 0.116), J.scale.set(0.95, 0.012, 0.012), Ie.add(J);
    }
    let F = B(Ee, -0.79, 0.025, 0.084), K = new Qe(Ze, O);
    K.position.x = -0.93, K.scale.setScalar(0.21), Ie.add(K);
    for (let C = 0; C < 6; C++) {
      let j = C * Math.PI / 3, J = new Qe(Re, x);
      J.position.set(-0.84, Math.cos(j) * 0.18, Math.sin(j) * 0.18), J.scale.set(0.18, 0.028, 0.047), J.rotation.x = j, Ie.add(J);
    }
    let we = new pt();
    Ie.add(we);
    let Be = M(new nn(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.47).rotateZ(-Math.PI / 2)), Je = m(new ct({ uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec3 vP,vN,vV;void main(){vP=position;vec4 p=modelViewMatrix*instanceMatrix*vec4(position,1.);mat3 im=mat3(instanceMatrix);vec3 nn=normal/max(vec3(1.e-9),vec3(dot(im[0],im[0]),dot(im[1],im[1]),dot(im[2],im[2])));vN=normalize(normalMatrix*im*nn);vV=-p.xyz;gl_Position=projectionMatrix*p;}", fragmentShader: "uniform float uTime,uPower;varying vec3 vP,vN,vV;void main(){float edge=pow(max(0.,1.-abs(dot(normalize(vN),normalize(vV)))),2.2);float grid=pow(.5+.5*sin(vP.y*39.+sin(vP.z*34.)*1.8),22.)*.55+pow(.5+.5*sin(vP.z*41.),24.)*.35;float scan=pow(max(0.,sin(length(vP.yz)*31.-uTime*5.)),18.);gl_FragColor=vec4(vec3(.23,.52,1.1)*(1.+edge*.75),(.015+edge*.34+grid*.055+scan*.065)*uPower);}", transparent: true, depthWrite: false, side: Lt, blending: mt, toneMapped: false, forceSinglePass: true })), tt = new Tt(Be, Je, 6);
    tt.frustumCulled = false, we.add(tt);
    let Nt = m(new St({ color: 7379962, transparent: true, opacity: 0, depthWrite: false, blending: mt, toneMapped: false })), Vt = new Tt(Ze, Nt, 6);
    we.add(Vt), Vt.frustumCulled = false;
    for (let C = 0; C < 6; C++) {
      let j = 0.17 + C * 0.055;
      A.position.set(0.9 + C * 0.15, 0, 0), A.scale.set(0.055 + C * 0.011, j, j), A.quaternion.identity(), A.updateMatrix(), tt.setMatrixAt(C, A.matrix), A.position.x += 8e-3, A.scale.setScalar(j * 0.996), A.updateMatrix(), Vt.setMatrixAt(C, A.matrix);
    }
    let kt = [];
    for (let C of [-1, 1]) {
      let j = new pt();
      j.position.set(-77,16.8,0).add(new T(-0.18, -0.14, C * 0.18)), d.add(j);
      let J = new Qe(Re, x);
      J.scale.set(0.5, 0.12, 0.22), j.add(J);
      let he = new Qe(Re, O);
      he.position.y = -0.3, he.scale.set(0.11, 0.55, 0.11), j.add(he), kt.push({ object: j, side: C });
    }
    let bn = M(new pn(6e-3, 0.15, 1, 16, 24, true).rotateZ(Math.PI / 2).translate(-0.5, 0, 0)), Bn = m(new ct({ uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uBoost: { value: 0 } }, vertexShader: "uniform float uTime,uBoost;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.y+=sin(p.x*31.+uTime*(16.+uBoost*38.))*(.003+.01*abs(p.x));p.z+=sin(p.x*23.-uTime*19.)*(.002+.009*abs(p.x));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}", fragmentShader: "uniform float uTime,uPower,uBoost;varying vec2 vUv;void main(){float a=clamp(vUv.y,0.,1.);float cells=pow(.5+.5*sin(a*(34.+uBoost*65.)-uTime*(16.+uBoost*76.)),5.);vec3 c=mix(vec3(.7,1.3,1.65),vec3(.09,.3,1.05),a);gl_FragColor=vec4(c*(1.+uBoost*.45),pow(1.-a,1.45)*(.29+cells*.44)*uPower);}", transparent: true, depthWrite: false, side: Lt, blending: mt, toneMapped: false, forceSinglePass: true })), mi = new Qe(bn, Bn);
    mi.position.x = -0.83, Ie.add(mi);
    let _e = m(new St({ color: 14940671, transparent: true, opacity: 0, blending: mt, depthWrite: false, toneMapped: false })), Te = new Qe(bn, _e);
    Te.position.x = -0.83, Ie.add(Te);
    let $e = m(Bn.clone()), dt = [];
    for (let C of [-47, -24, 24, 47]) for (let j of [-10, 6]) {
      let J = new Qe(bn, $e);
      J.position.set(-230, j, C), J.scale.set(8, 26, 26), d.add(J), dt.push(J);
    }
    let ht = M(new pn(1, 1, 1, 12, 1, true).rotateZ(-Math.PI / 2)), ut = m(new ct({ uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform float uTime,uPower;varying vec2 vUv;void main(){float a=pow(clamp(vUv.y,0.,1.),1.5)*smoothstep(0.,.035,vUv.y);float cell=.78+.22*sin(vUv.y*137.-uTime*71.);gl_FragColor=vec4(vec3(.18,.69,1.35)*cell,a*uPower*.58);}", transparent: true, depthWrite: false, side: Lt, blending: mt, toneMapped: false, forceSinglePass: true })), nt = new Qe(ht, ut);
    nt.frustumCulled = false, me.add(nt);
    let vt = m(new St({ color: 14087935, transparent: true, opacity: 0, depthWrite: false, blending: mt, toneMapped: false })), Ct = new Qe(ht, vt);
    Ct.frustumCulled = false, me.add(Ct);
    let Hn = m(new ct({ uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform float uTime,uPower;varying vec2 vUv;void main(){float pulse=.22+.78*pow(.5+.5*sin(vUv.y*120.-uTime*47.),12.);gl_FragColor=vec4(.13,.34,.61,pulse*uPower);}", transparent: true, depthWrite: false, side: Lt, blending: mt, toneMapped: false, forceSinglePass: true })), wn = new Qe(ht, Hn);
    wn.name = "Low-luminance remote beam-energy coupling", wn.frustumCulled = false, me.add(wn);
    let b = m(new St({ color: 4296401, transparent: true, opacity: 0, depthWrite: false, blending: mt, toneMapped: false })), k = new Tt(Ze, b, 22);
    k.frustumCulled = false, me.add(k);
    let Y = M(new ft());
    Y.setAttribute("position", new rt([0, 0, 0], 3));
    let $ = m(new ct({ uniforms: { uPower: { value: 0 } }, vertexShader: "void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(70./max(1.,-p.z),1.5,5.);}", fragmentShader: "uniform float uPower;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(.7,1.1,1.5,(1.-smoothstep(.04,.5,r))*uPower);}", transparent: true, depthWrite: false, blending: mt, toneMapped: false })), z = new In(Y, $);
    z.frustumCulled = false, me.add(z);
    let xe = [], Ue = [], Xe = new T().crossVectors(je, o).normalize(), qe = new T().crossVectors(Xe, je).normalize(), ot = 17381;
    function at() {
      return ot = Math.imul(ot, 1664525) + 1013904223 >>> 0, ot / 4294967296;
    }
    for (let C = 0; C < 260; C++) {
      let j = 24 + Math.pow(at(), 1.7) * 3100, J = at() * Math.PI * 2, he = 5 + Math.pow(at(), 0.65) * 28, Ve = ke.clone().addScaledVector(je, j).addScaledVector(Xe, Math.cos(J) * he).addScaledVector(qe, Math.sin(J) * he);
      xe.push(...Ve.toArray());
      let lt = 0.25 + at() * 0.35;
      Ue.push(lt * 0.72, lt * 0.83, lt);
    }
    let it = M(new ft());
    it.setAttribute("position", new rt(xe, 3)), it.setAttribute("color", new rt(Ue, 3));
    let yt = m(new Mr({ vertexColors: true, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.4, depthWrite: false })), Dt = new In(it, yt);
    Dt.name = "Stationary near-flight dust", me.add(Dt);
    function en(C) {
      return missileFlight(C,ye).progress;
    }
    function Xt(C = D) {
      return C < 0 ? { reactor: 0.08, storage: 0, accelerator: 0, recoil: 0, radiatorHeat: 0 } : { reactor: 0.08 + S(0.1, 2.6, C) * (1 - S((6+missileFlightTime(ye)), 18, C)) * 0.92, storage: S(1.5, 5.6, C) * (1 - S(6, 6.9, C)), accelerator: S(3.6, 5.9, C) * (1 - S((6+missileFlightTime(ye)), (6+missileFlightTime(ye)) + 0.4, C)), recoil: S(5.92, 6.12, C) * (1 - S((6+missileFlightTime(ye)), (6+missileFlightTime(ye)) + 1.2, C)) * (0.28 + 0.72 * Math.exp(-Math.max(0, C - 6.2) * 1.2)), radiatorHeat: S(6, 13.2, C) * (1 - S(18, 42, C) * 0.7) };
    }
    function Ht(C = D) {
      const flight=missileFlight(C,ye);
      return {position:E(st(C,new T())),direction:Le.clone(),progress:flight.progress,speedFraction:flight.speed/missileFlight((6+missileFlightTime(ye)),ye).speed*.9998,accelerationFraction:flight.acceleration/missileFlight((6+missileFlightTime(ye)),ye).acceleration,launched:C>=6,impacted:C>=(6+missileFlightTime(ye))};
    }
    function st(C, j) {
      if(C < 6) return j.set(missileFlight(C,ye).trackX,16.8,0);
      return j.copy(ke).addScaledVector(je, missileFlight(C,ye).distance);
    }
    function Jt(C = D) {
      return Ht(C).position;
    }
    let Et = new T(), yn = new T(), gi = new T();
    function An({ time: C = 0, shotTime: j = -1, selected: J = false, quality: he = "high" } = {}) {
      if (N) return;
      D = j;
      let Ve = j, lt = Ve < 0, zt = lt ? C : Ve, Zt = lt ? 0 : S(0, 5.6, Ve) * (1 - S(6.1, 8.6, Ve)), cn = Ve >= 6 && Ve < (6+missileFlightTime(ye)), wt = Ve < (6+missileFlightTime(ye)), Pt = p((Ve - 6) / ((6+missileFlightTime(ye)) - 6)), Mt = S(8, 11.8, Ve), hn = Math.pow(Pt, 5), un = cn ? 0.2 + Mt * 0.8 : lt ? 0.012 : Ve < 6 ? 0.03 + Zt * 0.14 : 0, Wn = Xt(Ve);
      Ae.uniforms.uTime.value = zt, Ae.uniforms.uPower.value = Wn.reactor, ve.emissiveIntensity = 0.05 + Wn.reactor * 0.21, Ce.intensity = 140 + Wn.reactor * 760, G.emissiveIntensity = 8e-3 + Wn.radiatorHeat * 0.63, $e.uniforms.uTime.value = zt, $e.uniforms.uPower.value = 0.035 + Wn.recoil * 0.4, $e.uniforms.uBoost.value = Wn.recoil * 0.5;
      for (let Ft of dt) Ft.scale.set(6 + Wn.recoil * 31, 24, 24);
      for (let Ft = 0; Ft < 18; Ft++) {
        let Wi = Ft % 9 * 0.12, Xi = lt ? 0 : S(1.5 + Wi, 4.2 + Wi, Ve) * (1 - S(6, 6.8, Ve)), si = 0.025 + Xi * 0.67, Bc = Xi * Math.pow(Math.max(0, Math.sin(zt * 3.2 - Ft * 0.8)), 9) * 0.2;
        Se.setRGB(si * 0.19 + Bc * 0.5, si * 0.55 + Bc, si * 0.8 + Bc), q.setColorAt(Ft, Se);
      }
      q.instanceColor.needsUpdate = true;
      for (let Ft = 0; Ft < 20; Ft++) {
        let Wi = lt ? 0 : S(3.2 + Ft * 0.09, 4.3 + Ft * 0.081, Ve), Xi = Math.pow(Math.max(0, Math.cos((zt - 5.6) * (14 + Mt * 32) - Ft * 0.82)), 14), si = 0.022 + Wn.accelerator * Wi * (0.19 + Xi * 0.95) * (Ve < 6.6 ? 1 : 0.36);
        Se.setRGB(si * 0.18, si * 0.55, si * 0.9), Me.setColorAt(Ft, Se);
      }
      Me.instanceColor.needsUpdate = true, st(Ve, Et), Ie.position.copy(Et), Ie.quaternion.copy(L), Ie.visible = wt;
      let Xr = lt ? 0.09 : Ve < 6 ? 0.1 + Zt * 0.65 : cn ? 0.78 + Mt * 0.22 : 0;
      Je.uniforms.uTime.value = zt, Je.uniforms.uPower.value = Xr, Nt.opacity = Xr * 0.45, F.scale.setScalar(0.9 + un * 0.13);
      let qt = cn ? 0.6 + Math.pow(Mt, 1.7) * 56 : 0.18;
      mi.scale.set(qt, 1 + Mt * 0.6, 1 + Mt * 0.6), Te.scale.set(qt * 0.72, 0.3, 0.3), Bn.uniforms.uTime.value = zt, Bn.uniforms.uPower.value = un, Bn.uniforms.uBoost.value = Mt, _e.opacity = un * (0.17 + Mt * 0.28);
      let sn = lt ? 0 : S(3.35, 3.7, Ve);
      for (let Ft of kt) Ft.object.position.set(-77,16.8,0).add(new T(-0.18, -0.14 - sn * 0.4, Ft.side * (0.18 + sn * 0.35)));
      for (let Ft = 0; Ft < 36; Ft++) {
        let Wi = lt ? 0 : S(Ft * 0.095, 3.2 + Ft * 0.065, Ve) * (1 - S(6, 7.1, Ve)), Xi = Math.pow(Math.max(0, Math.cos(zt * (3.5 + Zt * 14) - Ft * 0.6)), 8), si = 0.04 + Wi * (0.22 + Xi * 0.9) + J * 0.025;
        Se.setRGB(si * 0.25, si * 0.65, si), ce.setColorAt(Ft * 2, Se), ce.setColorAt(Ft * 2 + 1, Se);
      }
      ce.instanceColor.needsUpdate = true, ie.opacity = 0.3 + Wn.recoil * 0.5 + 0.025 * Math.sin(zt * 0.6);
      let wi = Math.max(1e-5, Et.distanceTo(ke) - 1);
      wn.visible = cn && wi > 0.4, wn.position.copy(ke).addScaledVector(je, wi * 0.5), wn.quaternion.copy(L), wn.scale.set(wi, 0.022 + Mt * 0.018, 0.022 + Mt * 0.018), Hn.uniforms.uTime.value = zt, Hn.uniforms.uPower.value = 0.075 + Mt * 0.035, Dt.visible = cn, yt.opacity = 0.23 + Mt * 0.22;
      let qr = Math.min(Ve, (6+missileFlightTime(ye))), aa = Math.max(6, Ve - (0.13 + Mt * 0.13));
      st(qr, gi), st(Math.min(aa, (6+missileFlightTime(ye))), yn);
      let Au = Math.max(1e-5, gi.distanceTo(yn)), Yr = 1 - 0.9 * S(10.8, 11.2, Ve), Oc = 1 - S((6+missileFlightTime(ye)), (6+missileFlightTime(ye)) + 0.15, Ve), Kf = !lt && Ve > 8.1 && Ve < (6+missileFlightTime(ye)) + 0.15;
      nt.visible = Ct.visible = k.visible = Kf, nt.position.copy(yn).lerp(gi, 0.5), nt.quaternion.copy(L), nt.scale.set(Au, (0.06 + hn * 0.09) * Yr, (0.06 + hn * 0.09) * Yr), Ct.position.copy(nt.position), Ct.quaternion.copy(L), Ct.scale.set(Au, (0.015 + hn * 0.025) * Yr, (0.015 + hn * 0.025) * Yr), ut.uniforms.uTime.value = zt, ut.uniforms.uPower.value = Mt * Oc, vt.opacity = Mt * 0.49 * Oc, b.opacity = Mt * 0.12 * Oc;
      for (let Ft = 0; Ft < 22; Ft++) {
        let Wi = Math.max(6, qr - Ft * (0.011 + 9e-3 * (1 - Mt)));
        st(Wi, A.position), A.quaternion.copy(L);
        let Xi = (0.28 + Ft / 22 * 1.1 + Mt * 0.4) * Yr;
        A.scale.setScalar(Xi), A.updateMatrix(), k.setMatrixAt(Ft, A.matrix);
      }
      k.instanceMatrix.needsUpdate = true, z.position.copy(Et), z.visible = cn, $.uniforms.uPower.value = cn ? 0.28 + Mt * 0.6 : 0, tt.visible = he === "high" || J || cn;
    }
    function Gi() {
      An({ time: 0, shotTime: -1, selected: false });
    }
    function jt() {
      N || (N = true, f.forEach((C) => C.dispose()), g.forEach((C) => C.dispose()), u.removeFromParent(), u.clear());
    }
    return Gi(), { id: "missile", group: u, focus: E(new T(-10, 0, 0)), cameraOffset: new T(350, 260, 420), detailFocus: Oe.clone(), detailOffset: _(new T(4.6, 3.6, 7.5)), muzzle: Oe, reactorFocus: E(Pe), reactorOffset: _(new T(76, 62, 105)), duration: 32, launchAt: 6, impactAt: (6+missileFlightTime(ye)), update: An, reset: Gi, dispose: jt, getProjectileSample: Ht, getFlightFocus: Jt, getPowerState: Xt, userData: { shipLength: 454, shipWidth: 154, shipHeight: 119, reactorDiameter: 90, acceleratorLength: 290, projectileLength: 1.55, shieldLayers: 6, projectileCount: 1, accelerationExponent: 2 } };
  }
export {gu as createLaunchVessel};
