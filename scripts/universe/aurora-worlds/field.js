// Extracted from the user-supplied AURORA_Worlds (1).html.
// Keep the supplied art and dimensions; integration belongs in aurora-world-surface.js.
function Jc(i = "terrestrial", t = 1047) {
  let e = "aurora-world-1";
  ["terrestrial", "mercury", "mars", "gas", "moon"].includes(i) || (i = "terrestrial");
  let n = (F, B = 0, V = 1) => Math.max(B, Math.min(V, F)), r = (F, B, V) => F + (B - F) * V, s = (F, B, V) => {
    let pt = n((V - F) / (B - F));
    return pt * pt * (3 - 2 * pt);
  }, o = (F) => [parseInt(F.slice(0, 2), 16) / 255, parseInt(F.slice(2, 4), 16) / 255, parseInt(F.slice(4, 6), 16) / 255], a = (F, B, V) => (V = n(V), [r(F[0], B[0], V), r(F[1], B[1], V), r(F[2], B[2], V)]), l = (F) => {
    let B = 1 / (Math.hypot(F[0], F[1], F[2]) || 1);
    return [F[0] * B, F[1] * B, F[2] * B];
  }, c = (F, B) => F[0] * B[0] + F[1] * B[1] + F[2] * B[2], h = (F, B) => [F[1] * B[2] - F[2] * B[1], F[2] * B[0] - F[0] * B[2], F[0] * B[1] - F[1] * B[0]], u = 2166136261, d = `${e}:${i}:${String(t)}`;
  for (let F = 0; F < d.length; F++) u = Math.imul(u ^ d.charCodeAt(F), 16777619);
  let f = u >>> 0, m = (F) => {
    let B = (f ^ F) >>> 0;
    return () => {
      B = B + 1831565813 >>> 0;
      let V = B;
      return V = Math.imul(V ^ V >>> 15, V | 1), V ^= V + Math.imul(V ^ V >>> 7, V | 61), ((V ^ V >>> 14) >>> 0) / 4294967296;
    };
  }, g = m(925606681), _ = m(1990173504), p = () => {
    let F = g() * 2 - 1, B = g() * Math.PI * 2, V = Math.sqrt(1 - F * F);
    return [Math.cos(B) * V, F, Math.sin(B) * V];
  }, y = Array.from({ length: 256 }, (F, B) => B);
  for (let F = 255; F > 0; F--) {
    let B = Math.floor(_() * (F + 1)), V = y[F];
    y[F] = y[B], y[B] = V;
  }
  for (let F = 0; F < 256; F++) y[F + 256] = y[F];
  let M = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  function v(F, B, V) {
    let pt = (F + B + V) / 3, it = Math.floor(F + pt), mt = Math.floor(B + pt), Ut = Math.floor(V + pt), D = (it + mt + Ut) / 6, rt = F - it + D, et = B - mt + D, $ = V - Ut + D, q, at, st, ot, wt, Rt;
    rt >= et ? et >= $ ? (q = 1, at = 0, st = 0, ot = 1, wt = 1, Rt = 0) : rt >= $ ? (q = 1, at = 0, st = 0, ot = 1, wt = 0, Rt = 1) : (q = 0, at = 0, st = 1, ot = 1, wt = 0, Rt = 1) : et < $ ? (q = 0, at = 0, st = 1, ot = 0, wt = 1, Rt = 1) : rt < $ ? (q = 0, at = 1, st = 0, ot = 0, wt = 1, Rt = 1) : (q = 0, at = 1, st = 0, ot = 1, wt = 1, Rt = 0);
    let I = it & 255, S = mt & 255, k = Ut & 255, X = (nt, Z, Mt, dt) => {
      let At = 0.6 - nt * nt - Z * Z - Mt * Mt;
      if (At <= 0) return 0;
      let Pt = M[dt % 12];
      return At *= At, At * At * (Pt[0] * nt + Pt[1] * Z + Pt[2] * Mt);
    };
    return 32 * (X(rt, et, $, y[I + y[S + y[k]]]) + X(rt - q + 1 / 6, et - at + 1 / 6, $ - st + 1 / 6, y[I + q + y[S + at + y[k + st]]]) + X(rt - ot + 1 / 3, et - wt + 1 / 3, $ - Rt + 1 / 3, y[I + ot + y[S + wt + y[k + Rt]]]) + X(rt - 0.5, et - 0.5, $ - 0.5, y[I + 1 + y[S + 1 + y[k + 1]]]));
  }
  let w = [_() * 200 + 13, _() * 200 + 39, _() * 200 + 91], b = (F, B, V, pt, it = 0) => v(F * pt + w[0] + it * 17.21, B * pt + w[1] + it * 7.19, V * pt + w[2] - it * 11.37), A = (F, B, V, pt, it = 0) => b(F, B, V, pt, it) * 0.68 + b(F, B, V, pt * 2.07, it + 1) * 0.24 + b(F, B, V, pt * 4.19, it + 2) * 0.08, C = { sea: o("075779"), shallow: o("208f9b"), shoreWater: o("38acaa"), beach: o("d8c68b"), grass: o("68a765"), grassDark: o("447f52"), high: o("91a985"), rock: o("a0aa9a"), snow: o("e5ebe4"), basalt: o("647079"), basaltDark: o("46515f"), basaltLight: o("859093"), ash: o("5a5861"), lava: o("ff7b22"), lavaHot: o("ffbc53"), mars: o("c96e49"), marsHigh: o("e69765"), marsWall: o("b75842"), marsFloor: o("925248"), marsSand: o("d99060"), moon: o("bfc3bd"), moonHigh: o("dddcd0"), moonMare: o("7b8792"), moonWall: o("929eaa"), cream: o("f4dfb7"), creamLight: o("f7e7c6"), orange: o("df9d65"), copper: o("c77c50"), cloudBlue: o("849eac"), cloudLight: o("b4bdba"), storm: o("c77646") }, T = { generator: e }, E = -0.015 + g() * 0.115, L = 1.13 + g() * 0.48, z = p(), W = p(), tt = 0.052 + g() * 0.05, Q = [];
  function Y(F, B, V, pt, it, mt) {
    let Ut = F.slice(), D = B.slice(), rt = [{ direction: Ut.slice(), forward: D.slice() }], et = pt;
    for (let $ = 0; $ < V; $++) {
      let q = l(h(Ut, D)), at = (g() - 0.5) * 0.84;
      D = l([D[0] + q[0] * at, D[1] + q[1] * at, D[2] + q[2] * at]);
      let st = mt * (0.8 + g() * 0.4), ot = l([Ut[0] * Math.cos(st) + D[0] * Math.sin(st), Ut[1] * Math.cos(st) + D[1] * Math.sin(st), Ut[2] * Math.cos(st) + D[2] * Math.sin(st)]), wt = [ot[0] - Ut[0], ot[1] - Ut[1], ot[2] - Ut[2]], Rt = pt * (0.68 + g() * 0.64);
      Q.push({ a: Ut.slice(), delta: wt, lengthSquared: c(wt, wt), widthA: et, widthB: Rt, depth: it }), D = l([D[0] - ot[0] * c(D, ot), D[1] - ot[1] * c(D, ot), D[2] - ot[2] * c(D, ot)]), Ut = ot, et = Rt, rt.push({ direction: Ut.slice(), forward: D.slice() });
    }
    return rt;
  }
  if (i === "mercury" || i === "mars") {
    let F = i === "mercury" ? 2 + Math.floor(g() * 2) : 1 + Math.floor(g() * 2), B = [];
    for (let V = 0; V < F; V++) {
      let pt = p(), it = l(h(pt, p())), mt = i === "mercury" ? 0.029 + g() * 0.023 : 0.065 + g() * 0.042, Ut = Y(pt, it, 17 + Math.floor(g() * 8), mt, 0.7 + g() * 0.3, 0.19);
      B.push(pt);
      let D = 2 + Math.floor(g() * 2);
      for (let rt = 0; rt < D; rt++) {
        let et = Ut[3 + Math.floor(g() * (Ut.length - 7))], $ = l(h(et.direction, et.forward)), q = rt % 2 ? -1 : 1, at = l([et.forward[0] * 0.45 + $[0] * q * 0.89, et.forward[1] * 0.45 + $[1] * q * 0.89, et.forward[2] * 0.45 + $[2] * q * 0.89]);
        Y(et.direction, at, 4 + Math.floor(g() * 5), mt * (i === "mercury" ? 0.63 : 0.54), 0.45 + g() * 0.3, 0.16);
      }
    }
    T.rifts = { mainCount: F, branchCount: Q.length, origins: B, segments: Q };
  }
  let ct = [];
  if (i === "mercury") {
    let F = 3 + Math.floor(g() * 4);
    for (let B = 0; B < F; B++) {
      let V = Q[Math.floor(g() * Q.length)], pt = B % 3 !== 2 && V ? l([V.a[0] + V.delta[0] * 0.5, V.a[1] + V.delta[1] * 0.5, V.a[2] + V.delta[2] * 0.5]) : p();
      ct.push({ direction: pt, radius: 0.12 + g() * 0.1, height: 10.5 + g() * 4, active: B < 3 });
    }
    T.volcanoes = ct;
  }
  let j = [], St = [];
  if (i === "moon") {
    for (let B = 0; B < 3; B++) St.push({ direction: p(), radius: 0.4 + g() * 0.29, depth: 3 + g() * 2.5 });
    let F = 39 + Math.floor(g() * 15);
    for (let B = 0; B < F; B++) {
      let V = p(), pt = B < 3 ? 0.25 + g() * 0.15 : 0.033 + Math.pow(g(), 1.6) * 0.18;
      if (B > 3 && B < 11) {
        let it = j[B % 3], mt = l(h(it.direction, p())), Ut = it.radius * (0.72 + g() * 0.62);
        V = l([it.direction[0] * Math.cos(Ut) + mt[0] * Math.sin(Ut), it.direction[1] * Math.cos(Ut) + mt[1] * Math.sin(Ut), it.direction[2] * Math.cos(Ut) + mt[2] * Math.sin(Ut)]);
      }
      j.push({ direction: V, radius: pt, depth: Math.min(10.8, pt * (22 + g() * 7)), rim: Math.min(3.8, pt * 11.5) });
    }
    T.craters = j, T.maria = St, T.scarpNormal = p();
  }
  let ft = [], Tt = [], qt = l([(g() - 0.5) * 0.23, 1, (g() - 0.5) * 0.23]);
  if (i === "gas") {
    let F = [C.creamLight, C.cloudLight, C.orange, C.cream, C.copper, C.creamLight, C.cloudBlue, C.cream, C.orange, C.creamLight, C.cloudLight], B = F.map(() => 0.5 + g() * 1.25), V = B.reduce((it, mt) => it + mt, 0), pt = -1.08;
    for (let it = 0; it < F.length; it++) Tt.push({ start: pt, end: pt + B[it] / V * 2.16, color: F[it] }), pt = Tt[it].end;
    for (let it = 0; it < 3; it++) {
      let mt = g() * Math.PI * 2, Ut = -0.62 + g() * 1.18, D = Math.sqrt(1 - Ut * Ut), rt = [Math.cos(mt) * D, Ut, Math.sin(mt) * D], et = l(h(qt, rt)), $ = l(h(rt, et));
      ft.push({ direction: rt, east: et, north: $, radius: it === 0 ? 0.29 + g() * 0.085 : 0.14 + g() * 0.07, aspect: 0.62 + g() * 0.13, spin: g() < 0.5 ? -1 : 1 });
    }
    T.storms = ft, T.bands = Tt, T.axis = qt;
  }
  i === "terrestrial" && (T.continents = { scale: L, seaBias: E }, T.mountainAxes = [z, W]);
  function te(F, B, V) {
    let pt = 100, it = 0, mt = 100;
    for (let Ut = 0; Ut < Q.length; Ut++) {
      let D = Q[Ut], rt = F - D.a[0], et = B - D.a[1], $ = V - D.a[2], q = n((rt * D.delta[0] + et * D.delta[1] + $ * D.delta[2]) / D.lengthSquared), at = D.a[0] + q * D.delta[0], st = D.a[1] + q * D.delta[1], ot = D.a[2] + q * D.delta[2], wt = 1 / Math.hypot(at, st, ot), Rt = Math.hypot(F - at * wt, B - st * wt, V - ot * wt), I = r(D.widthA, D.widthB, q), S = Rt / I;
      S < pt && (pt = S, it = D.depth, mt = Rt);
    }
    return { relative: pt, depth: it, distance: mt };
  }
  function de(F, B, V) {
    let pt = F * F + B * B + V * V;
    if (Math.abs(pt - 1) > 1e-5) {
      let at = 1 / (Math.sqrt(pt) || 1);
      F *= at, B *= at, V *= at;
    }
    let it = 0, mt = C.grass, Ut = true, D = "lowland", rt = 0, et = 0, $ = 0, q = 1;
    if (i === "terrestrial") {
      let at = b(F, B, V, L, 1) * 0.72 + b(F, B, V, L * 2.18, 4) * 0.25 + b(F, B, V, 6.2, 5) * 0.065 + E, st = s(0.01, 0.19, at), ot = Math.abs(F * z[0] + B * z[1] + V * z[2] + b(F, B, V, 2.6, 7) * 0.19), wt = Math.abs(F * W[0] + B * W[1] + V * W[2] + b(F, B, V, 2.1, 12) * 0.13), Rt = Math.max(1 - s(4e-3, tt, ot), (1 - s(6e-3, tt * 0.75, wt)) * 0.76), I = Rt * Rt * st * s(-0.35, 0.15, b(F, B, V, 2, 14)), S = Math.pow(1 - Math.abs(b(F, B, V, 3.5, 18)), 16) * s(0.08, 0.19, at) * (1 - I * 0.5);
      it = at < 0 ? Math.max(-10, at * 24) : at * 13.2 + I * 11.5 + b(F, B, V, 17, 8) * 0.22 * st - S * 0.65, it = Math.min(16.5, it), Ut = it > 0.1;
      let k = A(F, B, V, 2.7, 20);
      Ut ? it < 0.62 ? (mt = a(C.beach, C.grass, s(0.24, 0.66, it)), D = "coast", q = s(0.14, 0.7, it) * 0.65) : (mt = a(C.grass, C.grassDark, s(-0.12, 0.53, k) * 0.58), mt = a(mt, C.high, s(4.2, 8.5, it)), mt = a(mt, C.rock, s(0.3, 0.86, I) * s(5, 9, it)), mt = a(mt, C.snow, s(10.2 + b(F, B, V, 5, 30) * 1.1, 13.4, it)), rt = s(-0.32, 0.3, k) * (1 - s(4.5, 9, it)) * s(0.7, 1.6, it) * (1 - s(0.1, 0.65, I)), D = it > 10.6 ? "snow-ridge" : I > 0.35 ? "mountain-ridge" : rt > 0.46 ? "forest" : S > 0.55 ? "river-valley" : "grassland", q = (1 - s(0.08, 0.47, I)) * s(0.45, 1.5, it) * (0.85 + at * 0.2)) : (mt = a(C.shallow, C.sea, s(-0.4, -6.8, it)), D = "ocean", q = 0);
    } else if (i === "mercury" || i === "mars") {
      let st = F + b(F, B, V, 8.5, 1) * 0.012, ot = B + b(F, B, V, 8.5, 2) * 0.012, wt = V + b(F, B, V, 8.5, 3) * 0.012, Rt = 1 / Math.hypot(st, ot, wt), I = te(st * Rt, ot * Rt, wt * Rt), S = I.relative, k = A(F, B, V, 1.9, 6), X = b(F, B, V, 15, 9);
      if (i === "mercury") {
        let nt = 1 - s(0.36, 1.65, S);
        it = 3.5 + k * 2.65 + X * 0.35 - nt * (8.8 + I.depth * 3.2);
        let Z = s(0.45, 1.95, S);
        mt = a(C.basaltDark, C.basalt, 0.42 + k * 0.6), mt = a(C.ash, mt, Z), mt = a(mt, C.basaltLight, s(0.35, 0.65, k) * 0.45), $ = 1 - s(0.22, 0.63, S), q = s(1.75, 3.4, S), D = $ > 0.3 ? "lava-channel" : nt > 0.2 ? "fault-wall" : "basalt-plateau";
        for (let Mt = 0; Mt < ct.length; Mt++) {
          let dt = ct[Mt], At = Math.sqrt(Math.max(0, 2 - 2 * (F * dt.direction[0] + B * dt.direction[1] + V * dt.direction[2]))), Pt = At / dt.radius;
          if (Pt < 1.35) {
            let gt = Math.pow(Math.max(0, 1 - Pt / 1.22), 1.25) * dt.height, It = 1 - s(0.07, 0.29, Pt);
            it = r(it, 3.3 + k * 2, (1 - s(0.8, 1.2, Pt)) * nt) + gt - It * 7.1, mt = a(mt, C.basaltDark, (1 - s(0.4, 1.25, Pt)) * 0.55), $ = Math.max($ * s(0.16, 0.5, Pt), dt.active ? 1 - s(0.11, 0.26, Pt) : 0), q *= s(0.65, 1.45, Pt), D = Pt < 0.32 ? "volcanic-vent" : "volcanic-slope";
          }
        }
        $ > 0 && (mt = a(mt, a(C.lava, C.lavaHot, s(0.45, 1, $)), $));
      } else {
        let nt = 1 - s(0.44, 1.22, S);
        it = 6.2 + (k * 2.2 + b(F, B, V, 4.2, 10) * 0.45) + X * 0.26 - nt * (10.2 + I.depth * 4);
        let Mt = s(0.15, 0.4, b(F, B, V, 3.1, 11));
        it += Mt * (1 - nt) * 2.1, mt = a(C.mars, C.marsHigh, 0.43 + k * 0.55), mt = a(mt, C.marsWall, nt * 0.78), mt = a(mt, C.marsFloor, (1 - s(0.28, 0.62, S)) * 0.72);
        let dt = 0.5 + 0.5 * Math.sin(it * 1.85 + b(F, B, V, 6, 12) * 0.9);
        mt = a(mt, C.marsSand, dt * nt * 0.19);
        let At = s(-0.18, 0.38, b(F, B, V, 6, 17));
        et = Math.exp(-Math.pow((S - 0.44) / 0.53, 2)) * At, q = s(1.5, 2.8, S) * (1 - Mt * 0.12), D = S < 0.58 ? "crystal-rift" : S < 1.3 ? "stratified-cliff" : Mt > 0.6 ? "red-highland" : "red-plateau";
      }
      it = n(it, -12.5, 18);
    } else if (i === "moon") {
      let at = A(F, B, V, 2.1, 1), st = b(F, B, V, 19, 5);
      it = 1.8 + at * 3.1 + st * 0.34;
      let ot = 0, wt = 0, Rt = 0;
      for (let X = 0; X < St.length; X++) {
        let nt = St[X], Z = Math.sqrt(Math.max(0, 2 - 2 * (F * nt.direction[0] + B * nt.direction[1] + V * nt.direction[2]))), Mt = Z / (nt.radius * (1 + b(F, B, V, 4.5, 13) * 0.12)), dt = 1 - s(0.48, 1.16, Mt);
        it -= dt * nt.depth, ot = Math.max(ot, dt);
      }
      for (let X = 0; X < j.length; X++) {
        let nt = j[X], Z = Math.sqrt(Math.max(0, 2 - 2 * (F * nt.direction[0] + B * nt.direction[1] + V * nt.direction[2]))), Mt = Z / nt.radius;
        if (Mt < 1.43) {
          let dt = 1 - s(0.3, 0.96, Mt), At = Math.exp(-Math.pow((Mt - 1) / 0.105, 2));
          it -= nt.depth * dt, it += nt.rim * At + nt.rim * 0.22 * Math.exp(-Math.pow((Mt - 1.19) / 0.15, 2)), nt.radius > 0.22 && (it += nt.depth * 0.21 * Math.exp(-Mt * Mt * 100)), wt = Math.max(wt, At), Rt = Math.max(Rt, s(0.22, 0.5, Mt) * (1 - s(0.76, 1.05, Mt)));
        }
      }
      let I = T.scarpNormal, S = F * I[0] + B * I[1] + V * I[2] + b(F, B, V, 3.2, 9) * 0.07, k = s(-0.016, 0.018, S) * s(-0.25, 0.1, at);
      it += k * 1.5, it = n(it, -13, 12), mt = a(C.moon, C.moonMare, ot * 0.69), mt = a(mt, C.moonWall, Rt * 0.48), mt = a(mt, C.moonHigh, wt * 0.77), mt = a(mt, C.moonHigh, s(0.3, 0.63, at) * 0.28), q = 1 - n(Rt * 0.83 + wt * 0.8 + (1 - s(0.012, 0.045, Math.abs(S))) * 0.6), D = wt > 0.5 ? "crater-rim" : Rt > 0.5 ? "crater-wall" : ot > 0.45 ? "lunar-mare" : "lunar-regolith";
    } else {
      Ut = false, q = 1;
      let st = F * qt[0] + B * qt[1] + V * qt[2] + b(F, B, V, 4, 2) * 0.038 + b(F, B, V, 12, 3) * 0.01, ot = 0, wt = C.storm;
      for (let I = 0; I < ft.length; I++) {
        let S = ft[I];
        if (F * S.direction[0] + B * S.direction[1] + V * S.direction[2] < 0.82) continue;
        let X = (F * S.east[0] + B * S.east[1] + V * S.east[2]) / S.radius, nt = (F * S.north[0] + B * S.north[1] + V * S.north[2]) / (S.radius * S.aspect), Z = Math.hypot(X, nt), Mt = 1 - s(0.45, 1.55, Z);
        if (Mt <= 0) continue;
        let dt = Math.atan2(nt, X) * S.spin + Z * 10.5 + b(F, B, V, 17, 10) * 0.44, At = 0.5 + 0.5 * Math.sin(dt);
        st += Math.sin(dt) * 0.045 * Mt, Mt > ot && (ot = Mt, wt = a(C.storm, C.orange, At * 0.83), wt = a(wt, C.cream, (1 - s(0.4, 1.45, Z)) * At * 0.19), wt = a(wt, C.copper, (1 - s(0.06, 0.3, Z)) * 0.7));
      }
      mt = Tt[Tt.length - 1].color;
      for (let I = 0; I < Tt.length; I++) {
        let S = Tt[I];
        if (st <= S.end) {
          mt = S.color;
          let k = Tt[Math.min(Tt.length - 1, I + 1)].color;
          mt = a(mt, k, s(S.end - 0.016, S.end + 6e-3, st));
          break;
        }
      }
      let Rt = b(F, B, V, 24, 6) * 0.45 + b(F, B, V, 11, 4) * 0.55;
      mt = a(mt, C.creamLight, s(0.15, 0.65, Rt) * 0.23), mt = a(mt, wt, ot * 0.92), it = b(F, B, V, 10, 8) * 0.35 + b(F, B, V, 27, 10) * 0.09 + ot * 0.45, D = ot > 0.3 ? "cyclonic-storm" : "cloud-band";
    }
    return { height: it, color: mt, land: Ut, biome: D, forest: n(rt), crystal: n(et), lava: n($), safe: n(q) };
  }
  return { type: i, seed: t, seedInt: f, radius: 100, version: e, summary: { terrestrial: "\u8FDE\u8D2F\u5927\u9646\u3001\u6D77\u6E7E\u4E0E\u6D45\u6D77\uFF1B\u5C71\u810A\u63A7\u5236\u68EE\u6797\u548C\u9AD8\u5730\u5206\u5E03\u3002", mercury: "\u7384\u6B66\u5CA9\u53F0\u5730\u88AB\u5206\u652F\u7194\u6C9F\u5207\u5F00\uFF0C\u504F\u5FC3\u706B\u5C71\u6CBF\u771F\u5B9E\u88C2\u9699\u751F\u957F\u3002", mars: "\u8D64\u8272\u9AD8\u539F\u3001\u4E3B\u88C2\u8C37\u4E0E\u652F\u8C37\uFF1B\u7D2B\u6676\u6CBF\u8C37\u5E95\u548C\u5CA9\u5C42\u88C2\u9699\u6210\u7C07\u5206\u5E03\u3002", gas: "\u5976\u6CB9\u767D\u3001\u94DC\u6A59\u4E0E\u84DD\u7070\u4E91\u5E26\uFF0C\u504F\u5FC3\u65CB\u6DA1\u8D2F\u7A7F\u8FDE\u7EED\u4E91\u9876\u3002", moon: "\u7070\u767D\u6708\u58E4\u3001\u6DF1\u8272\u6708\u6D77\uFF0C\u5927\u5C0F\u53E0\u8986\u7684\u649E\u51FB\u5751\u4E0E\u81EA\u7136\u65AD\u5D16\u3002" }[i], features: T, sample: de };
}
function $c(i, t) {
  let e = t === "low" ? 28 : t === "medium" || t === "mid" ? 48 : 64, n = 20 * e * e, r = new Float32Array(n * 9), s = new Float32Array(n * 9), o = new Uint8Array(n), a = [], l = [], c = (p) => p <= 0.04045 ? p / 12.92 : Math.pow((p + 0.055) / 1.055, 2.4), h = (p) => {
    let y = 1 / Math.hypot(...p);
    return p.map((M) => M * y);
  }, u = (1 + Math.sqrt(5)) / 2, d = [[-1, u, 0], [1, u, 0], [-1, -u, 0], [1, -u, 0], [0, -1, u], [0, 1, u], [0, -1, -u], [0, 1, -u], [u, 0, -1], [u, 0, 1], [-u, 0, -1], [-u, 0, 1]].map(h), f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]], m = (p) => p * (e + 1) - p * (p - 1) / 2, g = 0;
  function _(p, y, M) {
    let v = [p, y, M], w = [0, 0, 0];
    for (let b of v) for (let A = 0; A < 3; A++) w[A] += c(b.sample.color[A]) / 3;
    for (let b = 0; b < 3; b++) {
      let A = v[b], C = i.radius + A.sample.height;
      for (let T = 0; T < 3; T++) r[g * 9 + b * 3 + T] = A.direction[T] * C, s[g * 9 + b * 3 + T] = w[T];
    }
    if (o[g] = (p.sample.lava + y.sample.lava + M.sample.lava) / 3 > 0.32 ? 1 : 0, i.type === "terrestrial" && Math.min(p.sample.height, y.sample.height, M.sample.height) < 0.15) {
      let b = Math.max(0, -(p.sample.height + y.sample.height + M.sample.height) / 3), A = Math.min(1, b / 5.5), C = [32 / 255, 143 / 255, 155 / 255], T = [7 / 255, 87 / 255, 121 / 255], E = C.map((L, z) => c(L + (T[z] - L) * A));
      for (let L of v) a.push(...L.direction.map((z) => z * (i.radius + 0.075))), l.push(...E);
    }
    g++;
  }
  for (let p of f) {
    let y = d[p[0]], M = d[p[1]], v = d[p[2]], w = [];
    for (let b = 0; b <= e; b++) for (let A = 0; A <= e - b; A++) {
      let C = b / e, T = A / e, E = 1 - C - T, L = h([y[0] * E + M[0] * C + v[0] * T, y[1] * E + M[1] * C + v[1] * T, y[2] * E + M[2] * C + v[2] * T]);
      w.push({ direction: L, sample: i.sample(...L) });
    }
    for (let b = 0; b < e; b++) for (let A = 0; A < e - b; A++) _(w[m(b) + A], w[m(b + 1) + A], w[m(b) + A + 1]), A < e - b - 1 && _(w[m(b + 1) + A], w[m(b + 1) + A + 1], w[m(b) + A + 1]);
  }
  return { positions: r, colors: s, materialIndices: o, waterPositions: new Float32Array(a), waterColors: new Float32Array(l), triangleCount: n, divisions: e };
}

export {Jc as createWorldField, $c as makeTerrainArrays};
