// Retained user-authored HELIOS machinery; extracted by scripts/import-helios-megastructures.mjs.
import { MeshStandardMaterial as Ye, Group as bn, Mesh as oe, BoxGeometry as Rn, CylinderGeometry as Mi, TorusGeometry as jr, Vector3 as C, MeshBasicMaterial as fn, BufferGeometry as te, Line as ai, LineBasicMaterial as oi, Float32BufferAttribute as zt, Color as Ot, ShaderMaterial as ae, SphereGeometry as li, Points as pn, CanvasTexture as Br, Sprite as Or, SpriteMaterial as Os, QuadraticBezierCurve3 as Zi, LineDashedMaterial as no, Shape as bi, ExtrudeGeometry as Ji, ConeGeometry as Yi, CatmullRomCurve3 as Si, CircleGeometry as Hr, RingGeometry as Kr, BufferAttribute as Ae, PointsMaterial as Cn, IcosahedronGeometry as Ki, Object3D as Se, InstancedMesh as ri, TubeGeometry as Qr, Box3 as En, Sphere as Tn, MathUtils as ke, AdditiveBlending as Ce, DoubleSide as Ne, DynamicDrawUsage as lh, SRGBColorSpace as Xe } from "three";
import { mergeGeometries as of } from "three/addons/utils/BufferGeometryUtils.js";
import {attachStellarLifting,createLightExtractor} from './stellar-lifting.js';
var ce = Math.PI * 2, ls = ke.clamp, z1 = ke.lerp;
function Di(i = 12345) {
  return () => {
    i |= 0, i = i + 1831565813 | 0;
    let t = Math.imul(i ^ i >>> 15, 1 | i);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function Ii(i, t = 0.66, e = 0.43) {
  return new Ye({ color: i, metalness: t, roughness: e });
}
function rr(i, t = 2.5) {
  return new Ye({ color: i, emissive: i, emissiveIntensity: t, metalness: 0.2, roughness: 0.32 });
}
var y = { hull: Ii("#8296a2"), light: Ii("#c6cdca", 0.5, 0.35), dark: Ii("#1c2c3a", 0.7, 0.48), edge: Ii("#425967"), black: Ii("#091219", 0.42, 0.6), gold: Ii("#b78a43", 0.78, 0.31), copper: Ii("#ba7250", 0.7, 0.4), glass: new Ye({ color: "#135e62", emissive: "#063d43", emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.17 }), solar: Ii("#153e56", 0.78, 0.25), cyan: rr("#55eedb"), blue: rr("#4ba3ff", 2.1), amber: rr("#ffc47d", 2.2), red: rr("#ff684e", 1.8), green: rr("#6ed89e", 1.6), white: rr("#d7f4ff", 1.9) }, Nh = /* @__PURE__ */ new Map();
function Fh(i, t) {
  return Nh.has(i) || Nh.set(i, t()), Nh.get(i);
}
function ot(i, t = [0, 0, 0]) {
  let e = new bn();
  return e.position.fromArray(t), i && i.add(e), e;
}
function Le(i, t, e = y.hull, n = [0, 0, 0], s = [0, 0, 0], r = [1, 1, 1]) {
  let o = new oe(t, e);
  return o.position.fromArray(n), o.rotation.fromArray(s), o.scale.fromArray(r), i && i.add(o), o;
}
function B(i, t = [1, 1, 1], e = [0, 0, 0], n = y.hull, s = [0, 0, 0]) {
  return Le(i, Fh("box", () => new Rn()), n, e, s, t);
}
function Ct(i, t, e, n, s = [0, 0, 0], r = y.hull, o = 16, a = [0, 0, 0]) {
  let c = `c${t},${e},${n},${o}`;
  return Le(i, Fh(c, () => new Mi(t, e, n, o, 1)), r, s, a);
}
function me(i, t, e, n = [0, 0, 0], s = y.hull, r = [Math.PI / 2, 0, 0], o = ce) {
  let a = Math.max(16, Math.ceil(96 * o / ce)), c = `t${t},${e},${o}`;
  return Le(i, Fh(c, () => new jr(t, e, 8, a, o)), s, n, r);
}
function pt(i, t, e, n = 1, s = y.edge, r = n) {
  let o = new C(...t), a = new C(...e), c = a.clone().sub(o), l = B(i, [n, c.length(), r], o.clone().add(a).multiplyScalar(0.5).toArray(), s);
  return l.quaternion.setFromUnitVectors(new C(0, 1, 0), c.normalize()), l;
}
function ve(i, t, e, n = 2, s = y.edge, r = 6) {
  let o = ot(i, t), a = new C(...e).sub(new C(...t)), c = a.length();
  o.quaternion.setFromUnitVectors(new C(0, 1, 0), a.normalize());
  let l = n / 2, u = Math.max(0.11, n * 0.095);
  for (let h of [-l, l]) for (let d of [-l, l]) pt(o, [h, 0, d], [h, c, d], u, s);
  for (let h = 0; h <= r; h++) {
    let d = c * h / r;
    if (pt(o, [-l, d, -l], [l, d, -l], u, s), pt(o, [-l, d, l], [l, d, l], u, s), pt(o, [-l, d, -l], [-l, d, l], u, s), pt(o, [l, d, -l], [l, d, l], u, s), h < r) {
      let f = c * (h + 1) / r;
      pt(o, [-l, d, -l], [l, f, -l], u, s), pt(o, [l, d, l], [-l, f, l], u, s), pt(o, [-l, d, l], [-l, f, -l], u, s), pt(o, [l, d, -l], [l, f, l], u, s);
    }
  }
  return o;
}
function be(i) {
  return i.userData.dynamic = true, i;
}
function ne(i, t, e) {
  return t.userData.phase = true, i.parts.push({ object: t, threshold: e }), t;
}
function Gn(i, t = 50) {
  let e = ot();
  e.name = i, e.userData.facilityId = i;
  let n = be(ot(e));
  return n.name = "effects", n.userData.effect = true, { id: i, group: e, effects: n, parts: [], boundsRadius: t, focus: new C(), time: 0, update() {
  }, setProgress(r) {
    for (let o of this.parts) o.object.visible = r >= o.threshold;
  } };
}
function _o(i, t = 0.45) {
  return new fn({ color: i, transparent: true, opacity: t, blending: Ce, depthWrite: false, side: Ne, toneMapped: false });
}
function xo(i, t, e = "#53d4cb", n = 0.3) {
  let s = new te().setFromPoints(t.map((o) => Array.isArray(o) ? new C(...o) : o)), r = new ai(s, new oi({ color: e, transparent: true, opacity: n, depthWrite: false }));
  return i.add(r), r;
}
function af(i) {
  let t = 0, e = 0;
  function n(s) {
    s.updateWorldMatrix(true, true);
    let r = s.matrixWorld.clone().invert(), o = /* @__PURE__ */ new Map(), a = [];
    function c(l) {
      if (l !== s && (l.userData.dynamic || l.userData.phase || l.userData.facilityId || l.userData.effect)) {
        a.push(l);
        return;
      }
      if (l.isMesh && !l.isInstancedMesh && !l.isSkinnedMesh && !l.material.isShaderMaterial && !Array.isArray(l.material) && !l.userData.keepMesh && l !== s) {
        let u = l.geometry;
        if (!u.attributes.position) return;
        let h = u.index ? u.toNonIndexed() : u.clone();
        h.attributes.normal || h.computeVertexNormals(), h.attributes.uv || h.setAttribute("uv", new zt(new Float32Array(h.attributes.position.count * 2), 2));
        for (let f of Object.keys(h.attributes)) ["position", "normal", "uv", "color"].includes(f) || h.deleteAttribute(f);
        h.applyMatrix4(r.clone().multiply(l.matrixWorld));
        let d = l.material.uuid + Object.keys(h.attributes).sort().join(",");
        o.has(d) || o.set(d, { material: l.material, items: [], sources: [] }), o.get(d).items.push(h), o.get(d).sources.push(l);
      }
      for (let u of l.children) c(u);
    }
    for (let l of s.children) c(l);
    for (let { material: l, items: u, sources: h } of o.values()) {
      if (u.length < 2) {
        u.forEach((m) => m.dispose());
        continue;
      }
      let d = of(u, false);
      if (u.forEach((m) => m.dispose()), !d) continue;
      d.computeBoundingSphere();
      let f = new oe(d, l);
      f.name = "rigid-batch", s.add(f), e++;
      for (let m of h) m.removeFromParent(), t++;
    }
    for (let l of a) l.children.length && n(l);
  }
  return n(i), { removed: t, added: e };
}
function di(i, t = 1, e = y.light) {
  let n = ot(i);
  n.scale.setScalar(t), B(n, [1.4, 0.65, 3.8], [0, 0, 0], e), B(n, [1, 0.45, 1.1], [0, 0.45, -1], y.glass);
  for (let s of [-1, 1]) B(n, [0.55, 0.65, 2.8], [s, -0.1, 0.4], y.dark), B(n, [0.38, 0.35, 0.1], [s, -0.1, 1.85], y.cyan);
  return B(n, [2.2, 0.2, 2], [0, -0.4, 0.4], y.edge), n;
}
var Oh = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.41,.73));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise3(p);p=p*2.03+vec3(13.7,9.2,7.4);a*=.5;}return n;}
`, Zl = "varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vP=position;vN=normalize(mat3(modelMatrix)*normal);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}";
function lf(i) {
  let t = Di(1701), e = [], n = [], s = [];
  i.background = new Ot("#02070d");
  let r = new ae({ side: Fe, depthWrite: false, uniforms: {}, vertexShader: "varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `varying vec3 vD;${Oh}void main(){vec3 d=normalize(vD);float n=fbm(d*5.0);float band=exp(-pow((d.y+.18*d.x-.04)/.27,2.));float filament=pow(max(0.,n-.28)*2.,2.2)*band;vec3 col=vec3(.002,.006,.013)+filament*mix(vec3(.023,.069,.082),vec3(.095,.047,.024),smoothstep(.4,.72,noise3(d*3.+8.)));gl_FragColor=vec4(col,1.);}` }), o = new oe(new li(2500, 48, 24), r);
  i.add(o), s.push(o);
  let a = [], c = [], l = [];
  for (let I = 0; I < 5e3; I++) {
    let M = t() * 2 - 1, b = t() * ce, D = 1700 + t() * 500;
    a.push(Math.sqrt(1 - M * M) * Math.cos(b) * D, M * D, Math.sqrt(1 - M * M) * Math.sin(b) * D);
    let F = new Ot().setHSL(0.08 + t() * 0.58, 0.15 + t() * 0.24, 0.48 + t() * 0.42);
    c.push(F.r, F.g, F.b), l.push(0.6 + Math.pow(t(), 8) * 3.8);
  }
  let u = new te();
  u.setAttribute("position", new zt(a, 3)), u.setAttribute("color", new zt(c, 3)), u.setAttribute("size", new zt(l, 1));
  let h = new ae({ vertexColors: true, transparent: true, depthWrite: false, uniforms: { uRatio: { value: Math.min(devicePixelRatio, 1.6) } }, vertexShader: "attribute float size;varying vec3 vColor;uniform float uRatio;void main(){vColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=size*uRatio;}", fragmentShader: "varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vColor,pow(1.-d,1.3));}" });
  i.add(new pn(u, h));
  let d = new ae({ uniforms: { uTime: { value: 0 } }, vertexShader: Zl, fragmentShader: `varying vec3 vP;varying vec3 vN;varying vec3 vW;uniform float uTime;${Oh}void main(){vec3 n=normalize(vP);float f=fbm(n*9.+vec3(uTime*.015,0,0));float fine=noise3(n*83.+uTime*.03);float belts=sin(n.y*30.+f*8.)*.06;vec3 color=mix(vec3(.88,.19,.025),vec3(2.15,1.25,.38),smoothstep(.24,.7,f+fine*.14+belts));float limb=pow(max(0.,dot(normalize(vN),normalize(cameraPosition-vW))),.3);gl_FragColor=vec4(color*(.64+.5*limb),1.);}` }), f = new oe(new li(29, 96, 64), d);
  f.name = "Helios", i.add(f);
  let m = document.createElement("canvas");
  m.width = 256, m.height = 256;
  let x = m.getContext("2d"), g = x.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, "rgba(255,174,64,.55)"), g.addColorStop(0.38, "rgba(255,127,36,.24)"), g.addColorStop(0.65, "rgba(255,108,34,.07)"), g.addColorStop(1, "rgba(255,120,40,0)"), x.fillStyle = g, x.fillRect(0, 0, 256, 256);
  let p = new Br(m);
  p.colorSpace = Xe;
  let A = new Or(new Os({ map: p, transparent: true, blending: Ce, depthWrite: false, color: "#ffcb93", toneMapped: false }));
  A.scale.set(165, 165, 1), i.add(A);
  let v = new oe(new li(30.5, 64, 32), new ae({ transparent: true, side: Fe, blending: Ce, depthWrite: false, vertexShader: Zl, fragmentShader: "varying vec3 vN;varying vec3 vW;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(cameraPosition-vW))),2.2);gl_FragColor=vec4(1.,.35,.035,f*.65);}" }));
  i.add(v), e.push((I, M) => {
    d.uniforms.uTime.value = M, f.rotation.y = M * 6e-3;
  });
  let _ = new bn();
  i.add(_);
  for (let I of [126, 229, 435, 552]) {
    let M = [];
    for (let b = 0; b <= 256; b++) M.push([I * Math.cos(b / 256 * ce), 0, I * Math.sin(b / 256 * ce)]);
    xo(_, M, "#406177", 0.17);
  }
  function S(I, M, b = 0, D = 1) {
    let F = new ae({ uniforms: { uType: { value: b }, uSeed: { value: D } }, vertexShader: Zl, fragmentShader: `varying vec3 vP;varying vec3 vN;varying vec3 vW;uniform float uType;uniform float uSeed;${Oh}
    void main(){vec3 n=normalize(vP);float f=fbm(n*3.8+uSeed);vec3 color;
      if(uType<.5){float land=smoothstep(.47,.51,f);float mountains=fbm(n*29.+uSeed);vec3 ground=mix(vec3(.055,.15,.085),vec3(.34,.29,.17),mountains);color=mix(vec3(.012,.085,.15),ground,land);float ice=smoothstep(.79,.96,abs(n.y)+f*.13);color=mix(color,vec3(.65,.77,.8),ice);float clouds=smoothstep(.54,.7,fbm(n*7.2+vec3(1.,8.,4.)));color=mix(color,vec3(.72,.79,.81),clouds*.7);}
      else if(uType<1.5){float bands=sin(n.y*42.+fbm(n*7.)*5.);color=mix(vec3(.18,.24,.3),vec3(.59,.48,.33),bands*.5+.5);color*=.75+f*.6;}
      else {float ridges=pow(abs(f-.5)*3.,.7);color=mix(vec3(.11,.065,.045),vec3(.45,.23,.105),ridges);color+=fbm(n*28.)*.06;}
      vec3 l=normalize(-vW);float daylight=max(dot(normalize(vN),l),0.);color*=.065+daylight*1.5;
      if(uType<.5){float cities=step(.65,noise3(n*280.))*step(.5,f)*(1.-smoothstep(-.15,.15,dot(normalize(vN),l)));color+=vec3(.65,.29,.06)*cities*.38;}
      gl_FragColor=vec4(color,1.);}` }), U = new oe(new li(I, 80, 48), F);
    if (U.position.fromArray(M), i.add(U), n.push({ mesh: U, radius: I }), e.push((z) => {
      U.rotation.y += z * 0.012;
    }), b < 2) {
      let z = new oe(new li(I * 1.045, 64, 32), new ae({ side: Fe, transparent: true, depthWrite: false, blending: Ce, vertexShader: Zl, fragmentShader: "varying vec3 vN;varying vec3 vW;void main(){vec3 n=normalize(vN);float f=pow(1.-abs(dot(n,normalize(cameraPosition-vW))),2.8);float d=.15+max(0.,dot(n,normalize(-vW)));gl_FragColor=vec4(.12,.45,.72,f*.68*d);}" }));
      z.position.copy(U.position), i.add(z);
    }
    return U;
  }
  S(9, [-101, 0, -75], 2, 13);
  let T = S(19, [135, 0, 185], 0, 7);
  S(28, [-376, 0, 219], 1, 9), S(13, [293, 0, -468], 2, 22);
  let R = S(3.3, [170, -4, 198], 2, 5);
  return { sun: f, planets: n, habitatPlanet: T, orbitGroup: _, backgrounds: s, corona: A, update(I, M) {
    e.forEach((b) => b(I, M));
  }, setEffects(I) {
    A.visible = I, v.visible = I;
  } };
}
function cf(i, t) {
  let e = new bn();
  e.name = "interfacility-traffic", i.add(e);
  let n = [], s = new C(-205, 5, 105), r = [new C(135, 22, 185), new C(340, 45, 330), new C(-430, 25, -300), new C(286, 7, -176)];
  for (let o = 0; o < r.length; o++) {
    let a = r[o], c = s.clone().lerp(a, 0.5);
    c.y = 50 + o * 9;
    let l = new Zi(s.clone().add(new C(0, 12 + o * 3, 0)), c, a), u = new te().setFromPoints(l.getPoints(100)), h = new ai(u, new no({ color: o === 2 ? "#577a95" : "#638e93", transparent: true, opacity: 0.2, dashSize: 3, gapSize: 5, depthWrite: false }));
    h.computeLineDistances(), e.add(h);
    for (let d = 0; d < 3; d++) {
      let f = di(e, 0.7, y.hull);
      n.push({ ship: f, curve: l, offset: d / 3, speed: 0.012 / (1 + o * 0.15) });
    }
  }
  return { group: e, update(o, a) {
    for (let c of n) {
      let l = ke.euclideanModulo(a * c.speed + c.offset, 1);
      c.ship.position.copy(c.curve.getPointAt(l));
      let u = c.curve.getPointAt(Math.min(0.9999, l + 1e-3));
      c.ship.lookAt(u), c.ship.rotateY(Math.PI);
    }
  } };
}
var en = Math.PI * 2, X1 = new C(0, 1, 0), rv = new C(0, 0, -1), ov = (i) => new C(...i), xn = (i) => (be(i), i);
function Oe(i, t, e, n, s, r = y.hull, o = 1.2) {
  let a = Math.min(t / 5, e / 5, o * 2.5), c = new bi();
  c.moveTo(-t / 2 + a, -e / 2), c.lineTo(t / 2 - a, -e / 2), c.lineTo(t / 2, -e / 2 + a), c.lineTo(t / 2, e / 2 - a), c.lineTo(t / 2 - a, e / 2), c.lineTo(-t / 2 + a, e / 2), c.lineTo(-t / 2, e / 2 - a), c.lineTo(-t / 2, -e / 2 + a), c.closePath();
  let l = new Ji(c, { depth: n, bevelEnabled: o > 0, bevelSegments: 1, steps: 1, bevelSize: o * 0.25, bevelThickness: o * 0.25 });
  return l.rotateX(-Math.PI / 2), Le(i, l, r, s);
}
function av(i, t, e, n, s = 6, r = "x", o = y.amber) {
  return B(i, r === "x" ? [s, 0.12, 0.32] : [0.32, 0.12, s], [t, e, n], o);
}
function vo(i, t, e = 3, n = 2.3, s = 6, r = y.hull) {
  let o = ot(i, t);
  B(o, [e, n, s], [0, n / 2, 0], r);
  for (let a of [-e / 2, e / 2]) for (let c of [-s / 2, s / 2]) B(o, [0.17, n + 0.15, 0.17], [a, n / 2, c], y.edge);
  for (let a = -s / 2 + 0.55; a < s / 2; a += 0.78) for (let c of [-e / 2 - 0.025, e / 2 + 0.025]) B(o, [0.08, n * 0.8, 0.11], [c, n / 2, a], y.dark);
  return B(o, [e * 0.62, 0.14, 0.075], [0, n * 0.72, -s / 2 - 0.045], y.amber), o;
}
function df(i, t, e = 1) {
  let n = ot(i, t);
  n.scale.setScalar(e), Ct(n, 2.8, 3.6, 1.4, [0, 0, 0], y.edge, 12), Ct(n, 2.1, 2.1, 5, [0, 2.7, 0], y.dark, 12);
  for (let s = 0; s < 6; s++) {
    let r = s * en / 6;
    B(n, [0.75, 4.4, 1.1], [Math.sin(r) * 2.4, 2.8, Math.cos(r) * 2.4], y.light, [0, r, 0]);
  }
  for (let s = 0.8; s < 5.1; s += 1.05) me(n, 2.15, 0.12, [0, s, 0], y.cyan);
  return Ct(n, 1.2, 2.3, 0.9, [0, 5.65, 0], y.hull, 12), n;
}
function Bh(i, t = 1) {
  let e = ot(i);
  e.scale.setScalar(t), Oe(e, 4, 11, 1.2, [0, 0, 0], y.dark, 0.8), Oe(e, 3.4, 3, 1.9, [0, 0.9, -3.8], y.light, 0.6), B(e, [2.2, 0.5, 0.15], [0, 2, -5.4], y.cyan);
  for (let n of [-1.4, 1.4]) for (let s of [-1.3, 2.1]) vo(e, [n, 1.2, s], 2.3, 1.8, 2.8, n > 0 ? y.copper : y.hull);
  for (let n of [-1.7, 1.7]) {
    Ct(e, 0.8, 0.95, 2, [n, 0.5, 5.4], y.edge, 10, [Math.PI / 2, 0, 0]), Ct(e, 0.6, 0.6, 0.13, [n, 0.5, 6.45], y.blue, 12, [Math.PI / 2, 0, 0]);
    let s = Le(e, new Yi(0.65, 3, 10), new fn({ color: 5562367, transparent: true, opacity: 0.38, depthWrite: false }), [n, 0.5, 7.9], [Math.PI / 2, 0, 0]);
    s.userData.effect = true;
  }
  return B(e, [0.22, 0.3, 1.1], [-2.3, 1, -3], y.red), B(e, [0.22, 0.3, 1.1], [2.3, 1, -3], y.green), e;
}
function lv(i, t, e = 1) {
  let n = ot(i, t);
  Ct(n, 2, 2.5, 0.9, [0, 0, 0], y.edge, 12);
  let s = xn(ot(n));
  Ct(s, 1.4, 1.7, 1.1, [0, 0.8, 0], y.amber, 12), pt(s, [0, 1, 0], [e * 2, 8, 0], 1.4, y.hull), pt(s, [e * 2, 8, 0], [e * 8, 8, 0], 1.1, y.light), pt(s, [e * 0.5, 2.5, 0], [e * 4, 7.7, 0], 0.42, y.copper);
  for (let o of [-0.8, 0.8]) pt(s, [e * 2, 8, o], [e * 8, 8, o], 0.24, y.edge);
  let r = xn(ot(s, [e * 7.6, 7.7, 0]));
  Ct(r, 0.12, 0.12, 4, [0, -2, 0], y.edge, 8), B(r, [3, 0.65, 1.8], [0, -4.2, 0], y.amber);
  for (let o of [-1.3, 1.3]) B(r, [0.4, 1.2, 1.8], [o, -4.7, 0], y.dark);
  return { pivot: s, hook: r };
}
function cv(i, t, e = y.cyan) {
  let n = t.getPoints(100), s = new ai(new te().setFromPoints(n), new oi({ color: e.color, transparent: true, opacity: 0.16, depthWrite: false }));
  return i.add(s), s;
}
function ff() {
  let i = Gn("logistics_hub", 82), t = i.group;
  i.focus.set(0, 9, 0), i.viewDirection = new C(1, 0.82, 1.3), i.detailFocus = new C(37, 3, 26), i.detailRadius = 20;
  let e = ot(t);
  ne(i, e, 0.02), Oe(e, 32, 44, 3.2, [0, -3, 0], y.edge, 2.5), Oe(e, 27, 38, 4.2, [0, 0.5, 0], y.hull, 2.2), Oe(e, 22, 25, 5, [0, 5, 0], y.dark, 1.5), Oe(e, 19, 23, 2, [0, 10, 0], y.light, 1.5), Oe(e, 11, 17, 7, [0, 12, -1], y.hull, 1), Oe(e, 13.5, 18.5, 1, [0, 18.5, -1], y.edge, 1), B(e, [10, 0.7, 0.18], [0, 16.7, 7.6], y.cyan);
  for (let h of [-5.55, 5.55]) B(e, [0.14, 0.7, 12], [h, 16.7, -1], y.cyan);
  for (let h = 0; h < 9; h++) B(e, [0.23, 0.8, 0.2], [-4.6 + h * 1.15, 16.7, 7.72], y.dark);
  Ct(e, 1.1, 1.5, 9, [-3, 22, -5], y.edge, 10), Ct(e, 0.12, 0.12, 9, [-3, 29, -5], y.hull, 6), B(e, [3.6, 1.1, 0.8], [-3, 24, -5], y.light), Ct(e, 0.2, 0.2, 8, [4, 22, 3], y.hull, 6), me(e, 1, 0.1, [4, 24, 3], y.cyan, [0, 0, 0]);
  for (let h of [-1, 1]) {
    B(e, [0.6, 2.5, 30], [h * 14.6, 3.7, 0], y.copper);
    for (let d = -15; d <= 15; d += 5) Oe(e, 3.5, 3.8, 0.8, [h * 11.7, 10.5, d * 0.56], y.light, 0.5), B(e, [0.25, 0.3, 3], [h * 13.8, 5.5, d], y.cyan);
  }
  let n = ot(e);
  for (let h of [-10, 10]) pt(n, [h, 0, -12], [h, 20, -12], 2.2, y.edge), pt(n, [h, 1, -22], [h, 18, -12], 1.4, y.hull), B(n, [4, 1, 5], [h, 18, -12], y.light);
  B(n, [22, 2, 6], [0, 18, -12], y.hull);
  let s = [];
  for (let h of [-1, 1]) {
    let d = ot(t);
    ne(i, d, 0.14 + (h + 1) * 0.12), Oe(d, 40, 13, 2, [h * 31, -2, 0], y.hull, 1.6);
    for (let f of [-5, 5]) ve(d, [h * 10, -5, f], [h * 53, -5, f], 2, y.edge, 8);
    for (let f of [-1, 1]) {
      let m = ot(d, [h * 37, 0, f * 26]);
      Oe(m, 25, 39, 1.6, [0, -2, 0], y.dark, 2);
      for (let x of [-11, 11]) {
        pt(m, [x, -1, -18], [x, -1, 18], 1.5, y.hull), pt(m, [x, -5, -18], [x, -5, 18], 0.8, y.edge);
        for (let g = -17; g <= 17; g += 5.7) pt(m, [x, -5, g], [x, -1, g + 2], 0.4, y.copper), B(m, [0.3, 0.16, 2.1], [x, 0.05, g], y.cyan);
      }
      for (let x = -13; x <= 13; x += 6.5) av(m, 0, 0.05, x, 9, "x", y.amber), B(m, [0.25, 0.2, 3], [0, 0.05, x + 1.8], y.light);
      Oe(m, 6.2, 25, 5.5, [h * 7, 0, 0], y.hull, 0.8);
      for (let x = -10; x <= 10; x += 4) B(m, [0.2, 3, 2.7], [h * 3.75, 2.5, x], y.black), B(m, [0.25, 0.45, 2.9], [h * 3.6, 4.3, x], y.amber), Oe(m, 4, 2.4, 0.6, [h * 7, 5.8, x], y.edge, 0.4);
      for (let x = -9; x <= 9; x += 6) vo(m, [-h * 6, 0, x], 3.2, 2.5, 4.5, x === 3 ? y.copper : y.light);
      s.push(lv(m, [-h * 9, 1, -f * 12], h)), B(m, [5, 0.45, 3], [0, 0.2, f * 17], y.copper);
      for (let x of [-8, 8]) pt(m, [x, 0, f * 18], [x, 5, f * 18], 0.3, y.edge), B(m, [0.8, 0.35, 0.6], [x, 5, f * 18], y.amber);
    }
  }
  let r = ot(t);
  ne(i, r, 0.53), Oe(r, 20, 27, 1.8, [0, -3, 32], y.edge, 1.5);
  for (let h of [-6, 6]) {
    df(r, [h, 0, 30], 1.1), Ct(r, 3.2, 3.2, 15, [h, -10, 29], y.hull, 14), me(r, 3.3, 0.4, [h, -4, 29], y.copper), me(r, 3.3, 0.4, [h, -16, 29], y.edge);
    for (let d = 0; d < 6; d++) B(r, [0.3, 8, 0.3], [h + Math.sin(d * en / 6) * 3.25, -10, 29 + Math.cos(d * en / 6) * 3.25], y.light);
  }
  let o = ot(t);
  ne(i, o, 0.68);
  for (let h of [-1, 1]) for (let d = 0; d < 4; d++) vo(o, [h * 10, 11, -8 + d * 5], 3.6, 2.4, 3.8, d % 2 ? y.hull : y.copper);
  let a = [];
  for (let h of [-1, 1]) {
    let d = ot(t, [h * 23, 1, 0]);
    ne(i, d, 0.4), B(d, [21, 0.4, 3.2], [0, 0, 0], y.black);
    for (let f = -9; f < 10; f += 2.1) Ct(d, 0.28, 0.28, 2.8, [f, 0.2, 0], y.edge, 8, [Math.PI / 2, 0, 0]);
    for (let f = 0; f < 2; f++) {
      let m = xn(vo(d, [f * 9 - 8, 0.5, 0], 2, 1.4, 2, y.copper));
      a.push({ crate: m, sx: h, k: f });
    }
  }
  let c = [], l = [];
  return [[[-75, 8, 62], [-38, 5, 39], [-37, 5, 18], [-32, 12, -25], [-10, 39, -37], [0, 75, -40], [0, 75, 2], [35, 55, 54], [70, 20, 65]], [[75, 13, -65], [38, 6, -39], [37, 5, -18], [22, 12, 8], [55, 22, 48], [72, 10, 10]], [[-65, 8, -60], [-37, 5, -38], [-37, 5, -18], [-58, 20, 15], [-80, 14, -8]]].forEach((h, d) => {
    let f = new Si(h.map(ov), true, "catmullrom", 0.4);
    l.push(cv(i.effects, f));
    for (let m = 0; m < 1; m++) {
      let x = xn(Bh(t, 0.53 + d * 0.06));
      ne(i, x, 0.55), c.push({ ship: x, curve: f, offset: m * 0.5 + d * 0.21, speed: 0.016 + d * 4e-3 });
    }
  }), i.update = (h, d, f) => {
    let m = f.enabled === false ? 0 : ke.clamp(Math.round(f.effectLevel ?? 2), 0, 3);
    l.forEach((x) => {
      x.material.opacity = [0, 0.08, 0.16, 0.24][m];
    }), s.forEach((x, g) => {
      x.pivot.rotation.y = Math.sin(d * 0.23 + g * 1.8) * 0.44, x.hook.position.y = 7.7 + Math.sin(d * 0.6 + g) * 1.5;
    }), a.forEach(({ crate: x, sx: g, k: p }) => {
      x.position.x = (d * 1.5 + p * 6) % 19 - 9.5;
    }), c.forEach(({ ship: x, curve: g, offset: p, speed: A }) => {
      let v = ke.euclideanModulo(d * A + p, 1);
      x.position.copy(g.getPointAt(v)), x.quaternion.setFromUnitVectors(rv, g.getTangentAt(v));
    });
  }, i;
}
function hf(i, t, e, n, s, r, o, a) {
  let c = new bi();
  c.absarc(0, 0, e, n, s, false), c.lineTo(Math.cos(s) * t, Math.sin(s) * t), c.absarc(0, 0, t, s, n, true), c.closePath();
  let l = new Ji(c, { depth: r, steps: 1, curveSegments: 5, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.14, bevelThickness: 0.14 });
  return Le(i, l, a, [0, 0, o]);
}
function pf() {
  let i = Gn("stargate_hub", 58), t = i.group;
  i.focus.set(0, -8, 0), i.viewDirection = new C(0.35, 0.24, 1.5), i.detailFocus = new C(22, 20, 0), i.detailRadius = 15;
  let e = ot(t);
  ne(i, e, 0.02);
  for (let v of [-10, 10]) ve(e, [v, -58, 0], [v, -27, 0], 3.6, y.edge, 6), pt(e, [v, -57, -2], [v * 0.7, -26, -4], 1.5, y.hull), pt(e, [v, -56, 2], [v * 1.9, -24, 1], 1.8, y.hull), B(e, [4.5, 1.5, 6], [v, -57, 0], y.light), B(e, [0.5, 22, 0.5], [v, -43, 2.4], y.cyan);
  for (let v = -54; v < -26; v += 7) pt(e, [-10, v, 0], [10, v, 0], 1.1, y.hull);
  ve(e, [-10, -54, 0], [10, -27, 0], 1.6, y.edge, 5), B(e, [23, 3, 7], [0, -28, 0], y.dark), me(e, 31, 1.6, [0, 0, 0], y.edge, [0, 0, 0]), me(e, 28.3, 0.8, [0, 0, 3.2], y.light, [0, 0, 0]), me(e, 29.7, 0.5, [0, 0, -3.1], y.copper, [0, 0, 0]);
  let n = [], s = Array.from({ length: 6 }, (v, _) => {
    let S = ot(t);
    return ne(i, S, 0.08 + _ * 0.12), S;
  });
  for (let v = 0; v < 36; v++) {
    let _ = v * en / 36, S = ot(s[Math.floor(v / 6)]);
    hf(S, 28.7, 33, _ + 0.022, _ + en / 36 - 0.022, 5.5, -2.8, v % 3 === 0 ? y.light : y.hull), hf(S, 33, 34.2, _ + 0.045, _ + en / 36 - 0.045, 2.5, -1.2, y.dark);
    let T = Math.cos(_ + en / 72), R = Math.sin(_ + en / 72);
    B(S, [1.1, 1.8, 6.5], [T * 31, R * 31, 0], y.edge, [0, 0, _ + en / 72 - Math.PI / 2]);
    for (let I of [-3.35, 3.35]) {
      B(S, [1.9, 0.36, 0.28], [T * 30.6, R * 30.6, I], y.cyan, [0, 0, _ + en / 72 - Math.PI / 2]);
      for (let M of [29.6, 32.2]) Ct(S, 0.22, 0.22, 0.25, [T * M, R * M, I], y.dark, 6, [Math.PI / 2, 0, 0]);
    }
    n.push(S);
  }
  let r = [];
  for (let v = 0; v < 8; v++) {
    let _ = (v + 0.5) * en / 8, S = Math.cos(_), T = Math.sin(_), R = ot(t, [S * 34, T * 34, 0]);
    R.rotation.z = _ - Math.PI / 2, ne(i, R, 0.28 + v * 0.06), B(R, [5.6, 7.4, 8.6], [0, 0, 0], y.edge), B(R, [4.6, 6, 9], [0, 0, 0], y.hull), B(R, [3.2, 1.8, 9.5], [0, -1.5, 0], y.dark);
    let I = y.cyan.clone();
    I.name = `stargate-charge-node-${v}`, I.emissiveIntensity = 0.25, r.push(I);
    for (let M of [-4.9, 4.9]) B(R, [3.6, 0.38, 0.28], [0, 2.1, M], y.amber), B(R, [2.1, 2.1, 0.3], [0, -1, M], I);
    pt(t, [S * 27, T * 27, -1], [S * 34, T * 34, -1], 1.3, y.copper);
  }
  let o = xn(ot(t));
  ne(i, o, 0.84), me(o, 26.7, 0.65, [0, 0, 0.8], y.copper, [0, 0, 0]), me(o, 25.5, 0.24, [0, 0, 1.25], y.cyan, [0, 0, 0]);
  for (let v = 0; v < 24; v++) {
    let _ = v * en / 24;
    B(o, [2.3, 0.8, 2], [Math.cos(_) * 26.5, Math.sin(_) * 26.5, 0.6], y.light, [0, 0, _]), B(o, [1.4, 0.25, 2.2], [Math.cos(_) * 26.5, Math.sin(_) * 26.5, 0.65], y.blue, [0, 0, _]);
  }
  let a = new ae({ transparent: true, depthWrite: false, side: Ne, blending: Ce, uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `varying vec2 vUv; uniform float uTime;uniform float uPower;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;float a=atan(p.y,p.x);float spiral=sin(r*48.-uTime*3.+sin(a*6.+uTime)*2.);float ripple=pow(max(0.,spiral),8.);float rim=pow(r,12.);float center=exp(-r*6.);float fleck=step(.987,hash(floor(p*160.)+floor(uTime*9.)));vec3 c=mix(vec3(.025,.09,.22),vec3(.09,.85,1.35),rim*.85+ripple*.24+center*.2);float alpha=(.13+rim*.8+ripple*.13+fleck*.15)*uPower;gl_FragColor=vec4(c*uPower,alpha);}` }), c = Le(i.effects, new Hr(25, 128), a, [0, 0, 0.2]), l = new fn({ color: 4513279, transparent: true, opacity: 0.3, depthWrite: false, blending: Ce, side: Ne }), u = [];
  for (let v = 0; v < 3; v++) {
    let _ = xn(Le(i.effects, new Kr(24.5, 24.75, 96), l.clone(), [0, 0, 1]));
    u.push(_);
  }
  let h = 240, d = new Float32Array(h * 3), f = [];
  for (let v = 0; v < h; v++) f.push([Math.random() * en, Math.random(), Math.random()]);
  let m = new te();
  m.setAttribute("position", new Ae(d, 3));
  let x = new pn(m, new Cn({ color: 9497343, size: 0.45, transparent: true, opacity: 0.8, blending: Ce, depthWrite: false }));
  x.frustumCulled = false, i.effects.add(x);
  let g = xn(Bh(t, 0.85)), p = -100, A = 0;
  return i.triggerTransit = () => {
    p = A;
  }, i.update = (v, _, S) => {
    A = _, o.rotation.z = _ * 0.035;
    let T = ke.clamp(Math.round(S.effectLevel ?? 2), 0, 3), R = S.enabled !== false && S.progress > 0.84, I = [0, 0.6, 1, 1.3][T], M = _ - p < 12 ? _ - p : _ % 22, b = 1 - ke.smoothstep(M, 12, 15), D = R ? ke.smoothstep(M, 1, 4) * b : 0;
    r.forEach((U, z) => {
      let V = R && T > 0 ? ke.smoothstep(M, 0.9 + z * 0.35, 1.15 + z * 0.35) * b : 0;
      U.emissiveIntensity = 0.25 + V * 2.75 * (0.94 + 0.06 * Math.sin(_ * 4 - z * 0.7));
    }), a.uniforms.uTime.value = _, a.uniforms.uPower.value = D * I;
    let F = ke.clamp((M - 4) / 7, 0, 1);
    g.position.set(Math.sin(F * Math.PI) * 1.2, -1, 45 - F * 90), g.rotation.set(0, 0, 0), g.visible = M > 3 && M < 12 && R, g.scale.setScalar(0.85 * (1 - ke.smoothstep(F, 0.53, 0.7))), u.forEach((U, z) => {
      let V = (_ * 0.3 + z / 3) % 1;
      U.scale.setScalar(0.2 + V * 0.8), U.material.opacity = (1 - V) * D * 0.2 * I;
    });
    for (let U = 0; U < h; U++) {
      let [z, V, G] = f[U], J = (V + _ * 0.16) % 1, W = 25 * (1 - J * 0.85);
      d[U * 3] = Math.cos(z + _ * 0.04) * W, d[U * 3 + 1] = Math.sin(z + _ * 0.04) * W, d[U * 3 + 2] = (G - 0.5) * 9 * (1 - J);
    }
    m.attributes.position.needsUpdate = true, x.material.opacity = Math.min(1, D * 0.8 * I);
  }, i;
}
function uf(i, t = 1, e = true) {
  let n = ot(i);
  n.scale.setScalar(t), pt(n, [0, -4, -57], [0, -4, 54], 3.2, y.edge);
  for (let o of [-8, 8]) pt(n, [o, -2, -38], [o, -2, 49], 1.2, y.hull);
  for (let o = -39; o < 52; o += 8) {
    let a = o < -20 ? 10 + (o + 20) * 0.12 : 15;
    pt(n, [-a, 0, o], [0, 6, o], 0.65, y.light), pt(n, [0, 6, o], [a, 0, o], 0.65, y.light), pt(n, [-a, 0, o], [0, -5.5, o], 0.6, y.edge), pt(n, [0, -5.5, o], [a, 0, o], 0.6, y.edge);
    for (let c of [-a, a]) Ct(n, 0.55, 0.55, 1.5, [c, 0, o], y.copper, 8, [Math.PI / 2, 0, 0]);
  }
  let s = new bi();
  s.moveTo(0, 58), s.lineTo(10, 30), s.lineTo(9, 17), s.lineTo(-9, 17), s.lineTo(-10, 30), s.closePath();
  let r = new Ji(s, { depth: 4, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.5, bevelSegments: 1, steps: 1 });
  r.rotateX(-Math.PI / 2), Le(n, r, y.hull, [0, -2, 0]);
  for (let o of [-1, 1]) {
    for (let a = 0; a < 9; a++) {
      if (e && (o === 1 && a > 3 && a < 8 || o === -1 && a === 5)) continue;
      let c = -23 + a * 8;
      B(n, [6.5, 2, 7.5], [o * 10, 1, c], a % 3 === 0 ? y.light : y.hull, [0, 0, -o * 0.22]), B(n, [0.2, 0.35, 4], [o * 13.4, 1.5, c], y.cyan);
      for (let l of [-2.8, 2.8]) B(n, [2.5, 0.2, 0.35], [o * 9, 2.1, c + l], y.edge);
    }
    pt(n, [o * 4, -1, -49], [o * 5, -1, 46], 0.4, y.copper);
  }
  for (let o = -11; o < 43; o += 10) {
    Ct(n, 3.3, 3.3, 6, [0, 0, o], y.dark, 12, [Math.PI / 2, 0, 0]), me(n, 3.5, 0.3, [0, 0, o], y.copper, [0, 0, 0]);
    for (let a of [-5, 5]) B(n, [2.5, 3.4, 5], [a, 0, o], y.edge);
    B(n, [1, 0.45, 4], [0, 3.5, o], y.amber);
  }
  Oe(n, 10, 16, 4, [0, 3.6, 32], y.hull, 1), Oe(n, 8, 9, 3, [0, 7.5, 34], y.dark, 0.7), B(n, [6, 0.7, 0.2], [0, 9.2, 29.3], y.cyan);
  for (let o of [-9, 0, 9]) for (let a of [-2, 3]) Ct(n, 2.6, 2.2, 7, [o, a, 53], y.edge, 12, [Math.PI / 2, 0, 0]), me(n, 2.6, 0.35, [o, a, 56.5], y.hull, [0, 0, 0]), Ct(n, 1.9, 1.9, 0.3, [o, a, 56.8], y.blue, 16, [Math.PI / 2, 0, 0]);
  for (let o of [-17, 17]) Oe(n, 8, 22, 1.5, [o, -1, 31], y.dark, 0.9), B(n, [0.35, 0.5, 17], [o * 1.2, 0.5, 31], y.amber);
  return n;
}
function hv(i, t, e) {
  let n = ot(i, t);
  B(n, [4, 2.4, 5], [0, 0, 0], y.edge);
  let s = xn(ot(n));
  Ct(s, 1.2, 1.6, 2, [0, 2, 0], y.copper, 12), pt(s, [0, 2, 0], [e * 4, 8, 0], 1.15, y.light), Ct(s, 1.1, 1.1, 2, [e * 4, 8, 0], y.dark, 12, [Math.PI / 2, 0, 0]);
  let r = xn(ot(s, [e * 4, 8, 0]));
  return pt(r, [0, 0, 0], [e * 6, -3, 0], 0.9, y.hull), pt(r, [0, -0.7, 0.8], [e * 5.8, -3.5, 0.8], 0.28, y.copper), Ct(r, 0.55, 0.35, 2, [e * 6, -4, 0], y.edge, 10), B(r, [0.6, 0.25, 0.6], [e * 6, -5, 0], y.white), { base: n, yaw: s, elbow: r };
}
function mf() {
  let i = Gn("orbital_shipyard", 112), t = i.group;
  i.focus.set(0, 2, 0), i.viewDirection = new C(1, 0.7, 1.2), i.detailFocus = new C(2, 1, 12), i.detailRadius = 23, i.detailDirection = new C(0.18, 1.9, 1);
  let e = ot(t);
  ne(i, e, 0.02);
  for (let v of [-61, -23, 23, 61]) {
    ve(e, [v, -15, -72], [v, -15, 72], 3.4, y.edge, 18), Oe(e, 6.8, 153, 2, [v, -12, 0], y.hull, 1);
    for (let _ = -68; _ <= 68; _ += 8) B(e, [2.5, 0.2, 3.5], [v, -9.7, _], y.dark), B(e, [0.3, 0.25, 3.5], [v - 2.7, -9.65, _], y.amber), B(e, [0.3, 0.25, 3.5], [v + 2.7, -9.65, _], y.cyan);
  }
  for (let v of [-70, 70]) {
    ve(e, [-63, -15, v], [63, -15, v], 4, y.edge, 15), Oe(e, 131, 10, 2, [0, -12, v], y.hull, 1.2);
    for (let _ = -58; _ <= 58; _ += 10) B(e, [5, 0.3, 0.4], [_, -9.7, v], y.amber);
  }
  let n = [];
  for (let v = 0; v < 5; v++) {
    let _ = -59 + v * 29.5, S = ot(t);
    ne(i, S, 0.08 + v * 0.09);
    for (let T of [-61, -23, 23, 61]) ve(S, [T, -11, _], [T, 25, _], 3.1, y.edge, 6), B(S, [5, 2.3, 5], [T, 25, _], y.light), pt(S, [T, -8, _ - 4], [T, 8, _], 1.1, y.hull);
    ve(S, [-61, 25, _], [61, 25, _], 3.4, y.hull, 16);
    for (let T of [-42, 0, 42]) {
      B(S, [15, 0.5, 2], [T, 22.8, _], y.dark), B(S, [6, 0.3, 1.4], [T, 22.45, _], y.white);
      for (let R of [-11, 11]) pt(S, [T + R, 22, _], [T + R, 16, _], 0.45, y.copper), B(S, [3, 1.2, 3], [T + R, 15.5, _], y.edge);
    }
    if (v % 2 === 0) for (let T of [-1, 1]) {
      let R = hv(t, [T * 23, -8, _], -T);
      ne(i, R.base, 0.3 + v * 0.09), n.push(R);
    }
  }
  let s = ot(t);
  ne(i, s, 0.35);
  for (let v of [-42, 0, 42]) for (let _ of [-44, -12, 20, 46]) {
    pt(s, [v - 18, -11, _], [v + 18, -11, _], 1.6, y.edge);
    for (let S of [-10, 10]) pt(s, [v + S, -10, _], [v + S, -4, _], 1.2, y.hull), B(s, [4, 1, 4], [v + S, -4, _], y.copper);
  }
  let r = ot(t);
  ne(i, r, 0.48), r.name = "devourer-berth";
  let o = ot(t);
  ne(i, o, 0.72), uf(o, 0.56, true).position.set(-42, -2, -12), Bh(o, 1.9).position.set(42, -1, 34);
  for (let v of [-1, 1]) {
    let _ = ot(t);
    ne(i, _, 0.4 + (v + 1) * 0.16), Oe(_, 14, 58, 2, [v * 67, -11, 30], y.edge, 1.3);
    for (let S = 0; S < 5; S++) vo(_, [v * 67, -8.8, 7 + S * 10], 8, 5, 7.5, S % 2 ? y.light : y.hull);
    for (let S of [-54, -39, -24]) df(_, [v * 65, -8, S], 0.8);
    for (let S = -50; S < 60; S += 12) pt(_, [v * 63, 7, S], [v * 67, 7, S], 0.6, y.edge), B(_, [3, 2, 3], [v * 66, 7, S], y.dark), B(_, [0.18, 1.4, 2], [v * 64.4, 7, S], y.cyan);
  }
  let l = xn(ot(t, [0, 26, 0]));
  ne(i, l, 0.6), B(l, [30, 2.3, 5], [0, 0, 0], y.copper);
  for (let v of [-12, 12]) B(l, [4, 3.5, 6], [v, 0, 0], y.dark), Ct(l, 0.16, 0.16, 5.5, [v, -3.25, 0], y.edge, 8);
  let u = xn(Oe(l, 18, 9, 1, [0, -6, 0], y.light, 1));
  for (let v of [-7, 7]) pt(l, [v, -5.5, 0], [v * 1.7, -1, 0], 0.17, y.edge);
  let h = [];
  for (let v = 0; v < 7; v++) {
    let _ = xn(ot(t));
    ne(i, _, 0.6), B(_, [1.7, 1.1, 2.2], [0, 0, 0], y.light);
    for (let S of [-1.4, 1.4]) Ct(_, 0.42, 0.42, 1.8, [S, 0, 0], y.edge, 8, [Math.PI / 2, 0, 0]), B(_, [0.7, 0.3, 0.2], [S, 0, 1], y.blue);
    pt(_, [0, 0, -1], [0, -1.5, -2], 0.25, y.copper), B(_, [0.45, 0.3, 0.2], [0, -1.5, -2], y.white), h.push(_);
  }
  let d = 260, f = new Float32Array(d * 3), m = [];
  for (let v = 0; v < d; v++) m.push([Math.random(), Math.random(), Math.random()]);
  let x = new te();
  x.setAttribute("position", new Ae(f, 3));
  let g = new pn(x, new Cn({ color: 16762220, size: 0.38, transparent: true, opacity: 0.85, blending: Ce, depthWrite: false }));
  g.frustumCulled = false, i.effects.add(g);
  let p = [], A = new fn({ color: 12315903, transparent: true, opacity: 0.5, depthWrite: false, blending: Ce });
  for (let v = 0; v < 6; v++) {
    let _ = xn(Le(i.effects, new Ki(0.55, 1), A.clone(), [(v % 2 ? 1 : -1) * 10, 1, -42 + Math.floor(v / 2) * 36]));
    p.push(_);
  }
  return i.update = (v, _, S) => {
    let T = S.enabled === false ? 0 : ke.clamp(Math.round(S.effectLevel ?? 2), 0, 3), R = [0, 0.55, 1, 1.2][T];
    n.forEach((I, M) => {
      I.yaw.rotation.y = Math.sin(_ * 0.23 + M) * 0.18, I.elbow.rotation.z = Math.sin(_ * 0.37 + M) * 0.18;
    }), l.position.z = Math.sin(_ * 0.11) * 46, l.position.x = Math.sin(_ * 0.075) * 9, u.position.y = -6 + Math.sin(_ * 0.21), h.forEach((I, M) => {
      let b = _ * (0.16 + M * 8e-3) + M * en / 7;
      I.position.set(Math.cos(b) * (18 + M % 3 * 4), 8 + Math.sin(b * 1.7 + M) * 9, Math.sin(b) * 56), I.rotation.set(Math.sin(b) * 0.15, -b + Math.PI / 2, Math.cos(b) * 0.18);
    });
    for (let I = 0; I < d; I++) {
      let M = m[I], b = I % 6, D = (_ * (0.7 + M[0]) + M[1]) % 1, F = (b % 2 ? 1 : -1) * 10, U = -42 + Math.floor(b / 2) * 36, z = M[2] * en;
      f[I * 3] = F + Math.cos(z) * D * (1 + M[0] * 4), f[I * 3 + 1] = 1 + D * (2 + M[1] * 5) - D * D * 7, f[I * 3 + 2] = U + Math.sin(z) * D * 4;
    }
    x.attributes.position.needsUpdate = true, g.visible = S.progress > 0.48 && T > 0, g.material.opacity = Math.min(1, 0.85 * R), p.forEach((I, M) => {
      I.visible = S.progress > 0.48 && T > 0, I.scale.setScalar(0.6 + Math.max(0, Math.sin(_ * 23 + M * 4)) * 0.9), I.material.opacity = (0.2 + Math.max(0, Math.sin(_ * 31 + M * 2)) * 0.65) * R;
    });
  }, i;
}
var uv = new C(0, 1, 0), Dn = (i, t, e) => new C(i, t, e), yo = new Rn(1, 1, 1), Mo = new Se();
function So(i, t, e, n) {
  let s = new ri(t, e, n.length);
  for (let r = 0; r < n.length; r++) s.setMatrixAt(r, n[r]);
  return s.instanceMatrix.needsUpdate = true, s.computeBoundingSphere(), i.add(s), s;
}
function dv(i, t, e = [0, 0, 0]) {
  return Mo.position.fromArray(i), Mo.scale.fromArray(t), Mo.rotation.fromArray(e), Mo.updateMatrix(), Mo.matrix.clone();
}
function Li(i, t, e, n, s = 64) {
  let r = new Si(t.map((a) => a.isVector3 ? a : new C(...a))), o = Le(i, new Qr(r, s, e, 7, false), n);
  return { curve: r, mesh: o };
}
function or(i, t, e, n, s, r, o) {
  let a = [], c = Math.max(12, Math.ceil(Math.abs(n - e) * 22));
  for (let l = 0; l <= c; l++) {
    let u = e + (n - e) * l / c;
    a.push(Dn(Math.cos(u) * t, s, Math.sin(u) * t));
  }
  return Li(i, a, r, o, c).mesh;
}
function Hh(i, t, e, n, s = [0, 0, 0], r = y.solar) {
  let o = ot(i, n);
  o.rotation.fromArray(s), B(o, [t + 0.4, 0.4, e + 0.4], [0, 0, 0], y.edge), B(o, [t, 0.16, e], [0, 0.26, 0], r);
  for (let a = -t / 2; a <= t / 2 + 0.01; a += Math.max(0.8, t / 8)) B(o, [0.08, 0.12, e], [a, 0.4, 0], y.gold);
  for (let a = -e / 2; a <= e / 2 + 0.01; a += Math.max(1.2, e / 5)) B(o, [t, 0.12, 0.06], [0, 0.4, a], y.edge);
  return o;
}
function $l(i, t, e, n, s = 0.14, r = y.light) {
  for (let o = 0; o < n; o++) {
    let a = n === 1 ? 0 : o / (n - 1);
    Ct(i, s, s, 0.14, [t[0] + (e[0] - t[0]) * a, t[1] + (e[1] - t[1]) * a, t[2] + (e[2] - t[2]) * a], r, 6);
  }
}
function kh(i, t, e = 0.65) {
  return new ae({ transparent: true, depthWrite: false, blending: Ce, side: Ne, toneMapped: false, uniforms: { time: { value: 0 }, power: { value: 1 }, colorA: { value: new Ot(i) }, colorB: { value: new Ot(t) }, opacity: { value: e } }, vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `
      uniform float time,power,opacity;uniform vec3 colorA,colorB;varying vec2 vUv;
      void main(){
        float pulse=pow(.5+.5*sin(vUv.x*58.-time*5.2),5.);
        float fine=.72+.28*sin(vUv.x*213.-time*11.+vUv.y*13.);
        vec3 c=mix(colorA,colorB,pulse);
        gl_FragColor=vec4(c*(.75+1.45*pulse),opacity*power*fine);
      }` });
}
function _f() {
  let i = Gn("dyson_swarm", 96);
  i.viewDirection = Dn(1.2, 0.75, 1.45), i.detailFocus = Dn(73, 16, 8), i.detailRadius = 17;
  let t = [], e = [], n = [], s = kh("#ffad51", "#ffeec6", 0.38);
  [{ r: 53, n: 52, x: 0.34, z: -0.26, speed: 8e-3, start: 0.07 }, { r: 64, n: 68, x: -0.64, z: 0.31, speed: -55e-4, start: 0.18 }, { r: 75, n: 84, x: 1.04, z: -0.2, speed: 38e-4, start: 0.29 }].forEach((u, h) => {
    let d = ne(i, ot(i.group), u.start);
    d.rotation.set(u.x, 0, u.z);
    let f = ot(d);
    for (let U = 0; U < 3; U++) {
      let z = U * ce / 3 + 0.16, V = z + 1.32;
      or(f, u.r - 3.1, z, V, -2.6, 0.25, y.edge), or(f, u.r + 3.1, z, V, -2.6, 0.25, y.edge), or(f, u.r, z, V, -4.2, 0.32, y.light), or(f, u.r - 3.1, z, V, -2.2, 0.07, y.amber);
      for (let G = 0; G <= 12; G++) {
        let J = z + (V - z) * G / 12, W = Math.min(V, J + (V - z) / 12);
        pt(f, [(u.r - 3.1) * Math.cos(J), -2.6, (u.r - 3.1) * Math.sin(J)], [(u.r + 3.1) * Math.cos(J), -2.6, (u.r + 3.1) * Math.sin(J)], 0.22, y.edge), G < 12 && (pt(f, [(u.r - 3.1) * Math.cos(J), -2.6, (u.r - 3.1) * Math.sin(J)], [(u.r + 3.1) * Math.cos(W), -2.6, (u.r + 3.1) * Math.sin(W)], 0.17, y.gold), pt(f, [u.r * Math.cos(J), -4.2, u.r * Math.sin(J)], [(u.r - 3.1) * Math.cos(W), -2.6, (u.r - 3.1) * Math.sin(W)], 0.16, y.edge));
      }
    }
    let m = be(ot(d));
    t.push({ spin: m, speed: u.speed });
    let x = [], g = [], p = [], A = [], v = [], _ = new Se();
    function S(U, z, V) {
      U.push(_.matrix.clone().multiply(dv(z, V)));
    }
    for (let U = 0; U < u.n; U++) {
      let z = U / u.n * ce;
      if (!(U % 17 === 0 || h === 2 && U > 56 && U < 67)) {
        _.position.set(u.r * Math.cos(z), Math.sin(z * 3 + h) * 0.9, u.r * Math.sin(z)), _.up.copy(uv), _.lookAt(0, 0, 0), _.updateMatrix(), S(g, [0, 0, -0.16], [5.2, 3.75, 0.2]);
        for (let V = 0; V < 4; V++) for (let G = 0; G < 2; G++) {
          S(x, [(V - 1.5) * 1.22, (G - 0.5) * 1.73, 0.02], [1.1, 1.58, 0.1]);
          for (let J = 1; J < 4; J++) S(p, [(V - 1.5) * 1.22, (G - 0.5) * 1.73 - 0.79 + J * 0.395, 0.09], [1.1, 0.026, 0.025]);
        }
        for (let V of [-1.84, 0, 1.84]) S(p, [0, V, 0.1], [5.3, 0.09, 0.14]);
        for (let V of [-2.58, 2.58]) S(p, [V, 0, 0.1], [0.09, 3.7, 0.14]);
        S(v, [0, 0, -0.6], [0.7, 0.7, 0.8]), S(A, [0, -1.86, 0.16], [1, 0.07, 0.08]);
      }
    }
    let T = So(m, yo, y.solar, x), R = So(m, yo, y.dark, g), I = So(m, yo, y.gold, p), M = So(m, yo, y.light, v), b = So(m, yo, y.amber, A);
    e.push({ meshes: [T, R, I, M, b], counts: [x.length, g.length, p.length, v.length, A.length], start: u.start });
    let D = ot(i.effects);
    D.rotation.copy(d.rotation);
    let F = be(ot(D));
    n.push({ plane: D, spin: F, speed: u.speed, start: u.start });
    for (let U = 0; U < 3; U++) {
      let z = U * ce / 3 + 0.4, V = [u.r * Math.cos(z), 0, u.r * Math.sin(z)];
      Li(F, [V, [u.r * 0.88 * Math.cos(z + 0.12), 9 + h * 2, u.r * 0.88 * Math.sin(z + 0.12)], [Math.cos(z + 0.18) * 80, 12, Math.sin(z + 0.18) * 80]], 0.12, s, 32);
    }
  });
  let o = ne(i, ot(i.group), 0.46);
  o.rotation.z = 0.16;
  for (let u = 0; u < 2; u++) {
    let h = ot(o);
    h.rotation.set(Math.PI / 2, u * 1.45 + 0.25, 0.35);
    let d = -0.65, f = 1;
    or(h, 83, d, f, 0, 0.7, y.hull), or(h, 80.6, d, f, 0, 0.3, y.gold);
    for (let m = 0; m <= 18; m++) {
      let x = d + (f - d) * m / 18;
      if (pt(h, [80.6 * Math.cos(x), 0, 80.6 * Math.sin(x)], [83 * Math.cos(x), 0, 83 * Math.sin(x)], 0.35, y.dark), m % 3 === 0) {
        let g = ot(h, [83 * Math.cos(x), 0, 83 * Math.sin(x)]);
        g.rotation.y = Math.PI / 2 - x, B(g, [3, 2.7, 2.8], [0, 0, 0], y.light), B(g, [2.4, 0.2, 2.3], [0, 1.5, 0], y.dark), B(g, [1.2, 0.18, 0.3], [0, 1.65, 0], y.amber);
      }
    }
  }
  let a = ne(i, ot(i.group, [73, 16, 8]), 0.38);
  a.rotation.z = -0.2, B(a, [10, 8, 9], [0, 0, 0], y.dark), B(a, [8.5, 1, 8.5], [0, 4.4, 0], y.light), B(a, [8.5, 1, 8.5], [0, -4.4, 0], y.hull);
  for (let u of [-4.7, 4.7]) {
    B(a, [10.4, 4.5, 0.65], [0, 0, u], y.hull);
    for (let h = -3; h <= 3; h++) B(a, [0.4, 3.3, 0.22], [h * 1.25, 0, u * 1.08], y.gold);
  }
  Ct(a, 3, 3, 7, [0, 0, 0], y.copper, 20), Ct(a, 2.3, 2.3, 0.8, [0, 5.1, 0], y.amber, 24);
  for (let u of [-1, 1]) ve(a, [u * 4.3, 0, 0], [u * 13, 0, 0], 2.4, y.edge, 4), Hh(a, 5, 12, [u * 12, 0, 0], [0, 0, u * 0.25]);
  $l(a, [-4, 5.02, -3.4], [4, 5.02, -3.4], 7), $l(a, [-4, 5.02, 3.4], [4, 5.02, 3.4], 7);
  let c = i.setProgress.bind(i);
  i.setProgress = (u) => {
    c(u);
    for (let h of e) {
      let d = ls((u - h.start + 0.15) / 0.55, 0, 1);
      h.meshes.forEach((f, m) => {
        f.count = Math.floor(h.counts[m] * d);
      });
    }
  };
  let l = -1;
  return i.update = (u, h, d) => {
    for (let m of t) m.spin.rotation.y = h * m.speed;
    for (let m of n) m.spin.rotation.y = h * m.speed, m.plane.visible = d.progress > m.start + 0.03 && d.effectLevel >= 1;
    s.uniforms.time.value = h;
    let f = d.effectLevel >= 3 ? 1.3 : d.effectLevel >= 2 ? 1 : d.effectLevel >= 1 ? 0.65 : 0;
    s.uniforms.power.value = d.enabled ? (0.85 + 0.15 * Math.sin(h * 0.7)) * f : 0, d.progress !== l && (i.setProgress(d.progress), l = d.progress);
  }, i;
}
function xf(options={}) {
  if(options.detailed===false){const item=createLightExtractor(options);af(item.group);return item;}
  let i = Gn("stellar_lifting", 66);
  i.focus = Dn(0, 1, 0), i.viewDirection = Dn(-1.1, 0.7, -1.25), i.detailFocus = Dn(-19, 1, 12), i.detailRadius = 18;
  let t = ot(i.group);
  let e = ot(i.effects), n = ot(e);
  let s = ne(i, ot(t), 0.03), r = ne(i, ot(t), 0.24), o = ne(i, ot(t), 0.43), a = ne(i, ot(t), 0.62), c = [], l = [];
  for (let _ of [-7.8, 7.8]) for (let S of [-7.8, 7.8]) ve(s, [-33, _, S], [35, _, S], 1.8, y.edge, 12);
  for (let _ = -30; _ <= 30; _ += 12) {
    for (let S of [-7.8, 7.8]) pt(s, [_, S, -7.8], [_, S, 7.8], 0.7, y.hull);
    for (let S of [-7.8, 7.8]) pt(s, [_, -7.8, S], [_, 7.8, S], 0.7, y.hull);
    B(s, [2.4, 2.1, 18.2], [_, -9, 0], y.dark), B(s, [1.3, 0.15, 14], [_, -7.85, 0], y.amber);
  }
  B(s, [54, 2, 8.5], [4, -5.5, 0], y.dark), B(s, [52, 0.8, 7.6], [4, -4.2, 0], y.hull);
  for (let _ = -18; _ < 30; _ += 5) B(s, [4.5, 0.3, 5.8], [_, -3.65, 0], y.light), $l(s, [_ - 1.7, -3.4, -2.4], [_ + 1.7, -3.4, -2.4], 4, 0.15);
  let u = y.dark.clone();
  u.side = Ne, Le(r, new Mi(9.8, 7.2, 4.2, 12, 1, true), u, [-29, 0, 0], [0, 0, Math.PI / 2]), me(r, 9.5, 0.6, [-31.4, 0, 0], y.copper, [0, Math.PI / 2, 0]), me(r, 7.2, 0.5, [-26.7, 0, 0], y.hull, [0, Math.PI / 2, 0]);
  for (let _ = 0; _ < 8; _++) {
    let S = _ / 8 * ce, T = ot(r, [-30.8, Math.cos(S) * 8.1, Math.sin(S) * 8.1]);
    T.rotation.x = S, B(T, [6.8, 2.6, 3.3], [0, 0, 0], y.hull), B(T, [4.9, 0.55, 2.6], [-0.5, 1.6, 0], y.light), B(T, [0.25, 0.2, 2.3], [-2.2, 1.92, 0], y.amber);
    let R = be(ot(T, [-3, -0.8, 0]));
    B(R, [4.8, 0.45, 2.7], [-1.7, 0, 0], y.gold), pt(R, [-3.8, 0.35, -0.9], [0.1, 0.35, -0.9], 0.22, y.light), l.push({ object: R, offset: _ * 0.7 });
  }
  for (let [_, S] of [-20, -7, 6].entries()) {
    let T = ot(r, [S, 0, 0]);
    for (let I of [-1.8, 1.8]) me(T, 7, 0.7, [I, 0, 0], y.light, [0, Math.PI / 2, 0]);
    let R = be(ot(T));
    c.push({ object: R, sign: _ % 2 ? -1 : 1 }), me(R, 6.6, 0.42, [0, 0, 0], y.copper, [0, Math.PI / 2, 0]);
    for (let I = 0; I < 12; I++) {
      let M = I / 12 * ce, b = ot(R, [0, Math.cos(M) * 7, Math.sin(M) * 7]);
      b.rotation.x = M, B(b, [4.8, 1.7, 2.6], [0, 0, 0], y.dark), B(b, [3.2, 0.45, 2], [0, 1.05, 0], y.hull), B(b, [2.1, 0.2, 1.1], [0, -1, 0], y.amber);
    }
    for (let I of [-1, 1]) pt(r, [S, I * 7.8, -7.8], [S, I * 5.4, -5.4], 0.8, y.gold), pt(r, [S, I * 7.8, 7.8], [S, I * 5.4, 5.4], 0.8, y.gold);
    me(n, 5.8, 0.17, [S, 0, 0], _o("#ffbc70", 0.7), [0, Math.PI / 2, 0]);
  }
  B(o, [15, 15, 13], [25, 0, 0], y.dark);
  for (let _ of [-1, 1]) {
    B(o, [13, 1.1, 12], [25, _ * 8, 0], y.hull);
    for (let S = 0; S < 4; S++) B(o, [2.4, 0.4, 11], [20.2 + S * 3.2, _ * 8.8, 0], y.light);
    for (let S of [-4.8, 4.8]) {
      Ct(o, 3.2, 3.2, 17, [23, S, _ * 11.4], y.light, 16, [0, 0, Math.PI / 2]), Ct(o, 2.3, 3.2, 2, [13.5, S, _ * 11.4], y.hull, 16, [0, 0, -Math.PI / 2]), Ct(o, 2.3, 3.2, 2, [32.5, S, _ * 11.4], y.hull, 16, [0, 0, Math.PI / 2]);
      for (let T of [17, 23, 29]) me(o, 3.35, 0.3, [T, S, _ * 11.4], y.dark, [0, Math.PI / 2, 0]);
      pt(o, [18, S, _ * 7], [18, S, _ * 9.5], 1.1, y.copper), pt(o, [29, S, _ * 7], [29, S, _ * 9.5], 1.1, y.copper);
    }
    ve(a, [-10, 0, _ * 7], [-10, 0, _ * 23], 2.3, y.edge, 5), ve(a, [8, 0, _ * 7], [8, 0, _ * 23], 2.3, y.edge, 5);
    for (let S = 0; S < 5; S++) Hh(a, 5.2, 20, [-12 + S * 5.6, 0, _ * 23], [_ * 0.2, 0, 0]);
    B(a, [29, 1.2, 1.4], [0, -0.4, _ * 33.5], y.hull);
  }
  ve(o, [33, -3, 0], [45, -3, 0], 3.2, y.edge, 4), B(o, [12, 1, 14], [42, -5.3, 0], y.dark), B(o, [10, 0.3, 12], [42, -4.6, 0], y.hull);
  for (let _ of [-5.3, 5.3]) B(o, [10, 0.12, 0.2], [42, -4.38, _], y.amber);
  let h = di(o, 1.6);
  h.position.set(41, -2.8, 0), h.rotation.y = Math.PI / 2;
  let d = kh("#ff641e", "#fff3b5", 0.62), f = kh("#ffdb81", "#ffffff", 0.77);
  // Plasma conduits remain inside the processing body; the stellar connection is an open field.
  Li(n, [[-31, 0, 0], [-20, 0.2, 0], [-7, -0.2, 0], [8, 0, 0], [18, 0, 0]], 0.72, f, 70);
  for (let _ of [-1, 1]) for (let S of [-4.8, 4.8]) {
    let T = [[14, 0, 0], [18, S * 0.6, _ * 4], [21, S, _ * 9], [23, S, _ * 11.4]];
    Li(o, T, 0.55, y.dark, 24), Li(n, T, 0.28, d, 24);
  }
  i.update = (_, S, T) => {
    for (let M of c) M.object.rotation.x = S * 0.09 * M.sign;
    for (let M of l) M.object.rotation.z = -0.08 + Math.sin(S * 0.42 + M.offset) * 0.045;
    d.uniforms.time.value = S, f.uniforms.time.value = S;
    let R = 0.76 + 0.24 * Math.sin(S * 0.35), I = T.effectLevel >= 3 ? 1.3 : T.effectLevel >= 2 ? 1 : T.effectLevel >= 1 ? 0.65 : 0;
    d.uniforms.power.value = R * I, f.uniforms.power.value = R * I;
  };
  return attachStellarLifting(i,options);
}
function gf(i, t, e, n, s, r) {
  let a = [], c = [];
  function l(h, d, f) {
    a.push(...h, ...d, ...f);
    let m = Dn(...d).sub(Dn(...h)).cross(Dn(...f).sub(Dn(...h))).normalize();
    for (let x = 0; x < 3; x++) c.push(m.x, m.y, m.z);
  }
  for (let h = 0; h < 10; h++) {
    let d = e + (n - e) * h / 10, f = e + (n - e) * (h + 1) / 10, m = [i * Math.cos(d), s, i * Math.sin(d)], x = [i * Math.cos(f), s, i * Math.sin(f)], g = [t * Math.cos(d), s, t * Math.sin(d)], p = [t * Math.cos(f), s, t * Math.sin(f)];
    l(m, x, p), l(m, p, g);
    let A = [m[0], s - r, m[2]], v = [x[0], s - r, x[2]], _ = [g[0], s - r, g[2]], S = [p[0], s - r, p[2]];
    l(A, S, v), l(A, _, S), l(g, p, S), l(g, S, _), l(m, v, x), l(m, A, v), h === 0 && (l(m, g, _), l(m, _, A)), h === 9 && (l(x, v, S), l(x, S, p));
  }
  let u = new te();
  return u.setAttribute("position", new zt(a, 3)), u.setAttribute("normal", new zt(c, 3)), u;
}
function fv(i) {
  let t = ot(i);
  B(t, [5.9, 0.5, 3.8], [0, 0.3, 0], y.hull), B(t, [5.6, 0.22, 3.4], [0, 0.68, 0], y.glass);
  for (let a of [-2, -1, 0, 1, 2]) for (let c of [-0.9, 0.9]) B(t, [0.65, 0.55, 0.6], [a, 0.97, c], y.green), Ct(t, 0.24, 0.4, 0.65, [a, 1.45, c], y.glass, 7);
  let e = [], n = [], s = [], r = 18;
  for (let a = 0; a < r; a++) {
    let c = a * Math.PI / r, l = (a + 1) * Math.PI / r, u = [-2.9, 0.8 + Math.sin(c) * 1.8, Math.cos(c) * 1.8], h = [2.9, 0.8 + Math.sin(c) * 1.8, Math.cos(c) * 1.8], d = [2.9, 0.8 + Math.sin(l) * 1.8, Math.cos(l) * 1.8], f = [-2.9, 0.8 + Math.sin(l) * 1.8, Math.cos(l) * 1.8];
    e.push(...u, ...h, ...d, ...u, ...d, ...f);
    for (let m of [c, c, l, c, l, l]) n.push(0, Math.sin(m), Math.cos(m));
    s.push(0, a / r, 1, a / r, 1, (a + 1) / r, 0, a / r, 1, (a + 1) / r, 0, (a + 1) / r);
  }
  let o = new te();
  o.setAttribute("position", new zt(e, 3)), o.setAttribute("normal", new zt(n, 3)), o.setAttribute("uv", new zt(s, 2)), Le(t, o, y.glass);
  for (let a = -2.9; a < 3; a += 1.45) {
    let c = [];
    for (let l = 0; l <= 12; l++) c.push([a, 0.8 + Math.sin(l * Math.PI / 12) * 1.83, Math.cos(l * Math.PI / 12) * 1.83]);
    Li(t, c, 0.055, y.light, 12);
  }
  for (let a of [-1.82, 1.82]) B(t, [5.9, 0.12, 0.12], [0, 0.8, a], y.cyan);
  return t;
}
function zh(i, t, e, n, s, r, o) {
  let a = ot(i, [t, 0, e]);
  B(a, [n + 0.35, 0.4, s + 0.3], [0, 0.65, 0], y.dark), B(a, [n, r, s], [0, 0.9 + r / 2, 0], o % 3 === 0 ? y.light : y.hull), B(a, [n + 0.2, 0.2, s + 0.2], [0, r + 0.98, 0], y.dark), B(a, [n * 0.65, 0.4, s * 0.65], [0, r + 1.2, 0], y.edge), r > 2.8 && B(a, [n * 0.46, r * 0.2, s * 0.5], [0, r * 1.1 + 1.4, 0], y.light);
  let c = Math.max(1, Math.floor(r / 0.7));
  for (let l = 0; l < c; l++) {
    let u = 1.25 + l * 0.7;
    for (let h of [-1, 1]) B(a, [n * 0.72, 0.17, 0.045], [0, u, h * (s / 2 + 0.025)], (l + o) % 4 === 0 ? y.amber : y.cyan);
  }
  for (let l of [-1, 1]) B(a, [0.12, r + 0.15, s + 0.1], [l * n * 0.4, 0.9 + r / 2, 0], y.edge);
  return a;
}
function vf() {
  let i = Gn("habitat_ring", 57);
  i.viewDirection = Dn(1.2, 1.1, 1.35), i.detailFocus = Dn(34, 3, 2), i.detailRadius = 13;
  let t = ot(i.group);
  t.rotation.set(0.17, 0, 0.16);
  let e = be(ot(t)), n = ne(i, ot(t), 0.03), s = ot(i.effects);
  s.rotation.copy(t.rotation);
  let r = Di(48209), o = [];
  for (let h = 0; h < 12; h++) o.push(ne(i, ot(e), 0.1 + h * 0.065));
  for (let h of [30.3, 39.8]) me(n, h, 0.42, [0, -0.1, 0], y.edge), me(n, h, 0.28, [0, -2.1, 0], y.hull), me(n, h, 0.065, [0, 0.4, 0], y.cyan);
  for (let h = 0; h < 72; h++) {
    let d = ce * h / 72, f = ce * (h + 1) / 72;
    for (let m of [30.3, 39.8]) pt(n, [m * Math.cos(d), 0, m * Math.sin(d)], [m * Math.cos(f), -2.1, m * Math.sin(f)], 0.14, y.edge);
    h % 3 === 0 && pt(n, [30.3 * Math.cos(d), -1.3, 30.3 * Math.sin(d)], [39.8 * Math.cos(d), -1.3, 39.8 * Math.sin(d)], 0.45, y.hull);
  }
  for (let h = 0; h < 24; h++) {
    let d = ce * h / 24, f = 0.112, m = o[Math.floor(h / 2)];
    Le(m, gf(31.3, 38.7, d - f, d + f, 0.2, 1.2), y.hull), Le(m, gf(32.1, 37.8, d - f + 0.01, d + f - 0.01, 0.38, 0.1), y.dark);
    let x = ot(m, [35 * Math.cos(d), 0.1, 35 * Math.sin(d)]);
    x.rotation.y = Math.PI / 2 - d, B(x, [0.72, 0.1, 7.1], [0, 0.5, 0], y.edge);
    for (let g of [-1, 1]) B(x, [0.055, 0.08, 6.9], [g * 0.43, 0.58, 0], y.cyan), B(x, [7.6, 0.25, 0.18], [0, 0.65, g * 3.6], y.light);
    if (h % 4 === 0) {
      let g = fv(x);
      g.position.set(0, 0.1, 0), g.rotation.y = Math.PI / 2, zh(x, -2.35, -2.2, 1.5, 1.45, 2.2, h), zh(x, 2.35, 2.15, 1.5, 1.45, 1.5, h + 1);
    } else if (h % 4 === 2) for (let g of [-1, 1]) {
      B(x, [2.7, 1.4, 5.4], [g * 2, 1.25, 0], y.light);
      for (let p = 0; p < 3; p++) Ct(x, 0.48, 0.48, 3.4, [g * 2, 2.4, -1.6 + p * 1.6], y.copper, 12, [0, 0, Math.PI / 2]), B(x, [2.3, 0.12, 0.15], [g * 2, 3.05, -1.6 + p * 1.6], y.amber);
      pt(x, [g * 0.6, 1, -3.2], [g * 3.5, 1, -3.2], 0.3, y.edge);
    }
    else for (let g of [-1, 1]) for (let p of [-1, 1]) {
      let A = 1.7 + r() * 3.3;
      zh(x, g * 2.1, p * 1.75, 2.15 + r() * 0.35, 2.25, A, h + p);
    }
    B(x, [5.3, 1.9, 4.1], [0, -2.05, 0], y.dark);
    for (let g of [-1, 1]) B(x, [1.1, 1.2, 4.4], [g * 3, -1.75, 0], y.light), B(x, [0.1, 0.5, 3.6], [g * 3.6, -1.7, 0], y.amber);
    $l(x, [-3.3, 0.64, -3.25], [3.3, 0.64, -3.25], 7, 0.1);
  }
  let a = ne(i, ot(t), 0.3);
  for (let h = 0; h < 4; h++) {
    let d = h / 4 * ce + 0.13, f = ot(a, [42 * Math.cos(d), -1, 42 * Math.sin(d)]);
    f.rotation.y = Math.PI / 2 - d, ve(f, [0, 0, -3.5], [0, 0, 7.5], 2.6, y.edge, 5), B(f, [9, 1.3, 7.5], [0, 0, 6.8], y.dark), B(f, [8.4, 0.35, 7], [0, 0.9, 6.8], y.hull);
    for (let m of [-1, 1]) B(f, [0.18, 0.12, 6.5], [m * 3.3, 1.12, 6.8], y.amber), Hh(f, 4.8, 8.8, [m * 7, -1, 3.4], [0, 0, m * 0.3]), ve(f, [m * 1.5, -0.5, 3.2], [m * 6, -1, 3.2], 1.3, y.edge, 3);
    if (Ct(f, 1.3, 1.7, 3.5, [0, 2.6, 4.5], y.light, 12), Ct(f, 1.9, 1.9, 0.4, [0, 4.6, 4.5], y.dark, 12), B(f, [2.4, 0.8, 0.4], [0, 4, 6], y.glass), h % 2 === 0) {
      let m = di(f, 1);
      m.position.set(0, 1.7, 8.3), m.rotation.y = Math.PI;
    }
  }
  let c = be(ot(s)), l = [];
  for (let h = 0; h < 8; h++) {
    let d = be(ot(c));
    for (let f = 0; f < 3; f++) B(d, [0.5, 0.45, 1.15], [0, 0, f * 1.33], y.light), B(d, [0.53, 0.1, 0.8], [0, 0.15, f * 1.33], h % 2 ? y.amber : y.cyan);
    l.push({ group: d, radius: h % 2 ? 39.8 : 30.3, phase: h * ce / 8, direction: h % 2 ? -1 : 1 });
  }
  let u = [];
  for (let h = 0; h < 3; h++) {
    let d = be(di(s, 0.65));
    u.push(d);
  }
  return i.update = (h, d, f) => {
    e.rotation.y = d * 28e-4;
    for (let m of l) {
      let x = m.phase + d * 0.075 * m.direction;
      m.group.position.set(Math.cos(x) * m.radius, 1.1, Math.sin(x) * m.radius), m.group.rotation.y = -x;
    }
    c.visible = f.effectLevel >= 1 && f.progress > 0.1, u.forEach((m, x) => {
      let g = f.effectLevel >= 3, p = d * (0.035 + x * 6e-3) * (g ? 1.25 : 1) + x * ce / 3, A = 44.4 + x * 1.6;
      m.position.set(Math.cos(p) * A, 5.4 + Math.sin(p * 2) * (g ? 4.5 : 3), Math.sin(p) * A), m.rotation.set(0, -p, Math.sin(p) * 0.1), m.visible = f.effectLevel >= 2 && f.progress > 0.3;
    });
  }, i;
}
function pv(i, t, e, n = 24) {
  let s = [], r = [], o = [], a = e * ce / n + 9e-3, c = (e + 1) * ce / n - 9e-3, l = 8, u = 3, h = i * 0.065, d = (x, g) => new C(x * Math.cos(g), t * (x / i) ** 2, x * Math.sin(g));
  function f(x, g, p) {
    let A = g.clone().sub(x).cross(p.clone().sub(x)).normalize();
    A.y < 0 && A.negate();
    for (let v of [x, g, p]) s.push(v.x, v.y, v.z), r.push(A.x, A.y, A.z), o.push(v.x / i * 0.5 + 0.5, v.z / i * 0.5 + 0.5);
  }
  for (let x = 0; x < l; x++) for (let g = 0; g < u; g++) {
    let p = h + (i - h) * x / l, A = h + (i - h) * (x + 1) / l, v = a + (c - a) * g / u, _ = a + (c - a) * (g + 1) / u, S = d(p, v), T = d(p, _), R = d(A, _), I = d(A, v);
    f(S, R, T), f(S, I, R);
  }
  let m = new te();
  return m.setAttribute("position", new zt(s, 3)), m.setAttribute("normal", new zt(r, 3)), m.setAttribute("uv", new zt(o, 2)), m;
}
function yf(i, t, e = 0) {
  let n = ot(i), s = t * 0.32, r = new Ye({ color: 13161687, metalness: 0.78, roughness: 0.37, side: Ne }), o = new Ye({ color: 7441561, metalness: 0.76, roughness: 0.4, side: Ne });
  for (let l = 0; l < 24; l++) Le(n, pv(t, s, l), l % 6 === 0 ? o : r);
  for (let l of [0.3, 0.57, 0.8, 1]) me(n, t * l, 0.11, [0, s * l * l - 0.18, 0], y.edge);
  let a = 12;
  for (let l = 0; l < a; l++) {
    let u = l * ce / a, h = Math.cos(u), d = Math.sin(u), f = [t * h, s - 0.55, t * d];
    pt(n, [0, -1.2, 0], f, 0.22, y.edge), pt(n, [t * 0.45 * h, -1.2, t * 0.45 * d], f, 0.14, y.hull);
    let m = [t * 0.96 * h, s + 0.16, t * 0.96 * d];
    B(n, [0.7, 0.35, 0.42], m, l % 3 === 0 ? y.cyan : y.dark, [0, -u, 0]);
  }
  Ct(n, t * 0.17, t * 0.2, 1.8, [0, -1.5, 0], y.dark, 20), me(n, t * 0.19, 0.22, [0, -0.6, 0], y.gold);
  let c = t * 0.91;
  for (let l = 0; l < 3; l++) {
    let u = l * ce / 3 + e * 0.25, h = [t * 0.86 * Math.cos(u), s * 0.74, t * 0.86 * Math.sin(u)];
    pt(n, h, [0, c, 0], 0.28, y.light), pt(n, [h[0] * 0.9, h[1] - 0.6, h[2] * 0.9], [0, c - 0.8, 0], 0.14, y.edge);
  }
  return Ct(n, 0.75, 1.3, 1.6, [0, c, 0], y.gold, 12), Ct(n, 0.45, 0.75, 1.5, [0, c + 1.1, 0], y.dark, 12), Ct(n, 0.45, 0.45, 0.15, [0, c + 1.9, 0], y.cyan, 12), n;
}
function Kl(i, t, e, n, s = 0) {
  let r = ot(i, n);
  r.rotation.y = s, B(r, [t + 0.7, 0.4, e + 0.7], [0, 0, 0], y.dark);
  let o = Math.max(2, Math.round(t / 2)), a = Math.max(3, Math.round(e / 2.3));
  for (let c = 0; c < o; c++) for (let l = 0; l < a; l++) {
    let u = (c - (o - 1) / 2) * t / o, h = (l - (a - 1) / 2) * e / a;
    B(r, [t / o - 0.13, 0.12, e / a - 0.15], [u, 0.26, h], y.solar), B(r, [0.035, 0.03, e / a - 0.22], [u, 0.34, h], y.hull);
  }
  return pt(r, [-t / 2, -0.3, 0], [t / 2, -0.3, 0], 0.5, y.edge), r;
}
function mv(i, t, e = 36) {
  let n = new Float32Array(e * 3), s = new te();
  s.setAttribute("position", new Ae(n, 3));
  let r = new Cn({ color: 7727598, size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0.8, blending: Ce, depthWrite: false, toneMapped: false }), o = new pn(s, r);
  return o.frustumCulled = false, i.add(o), (a, c = 1) => {
    let l = t.filter((u, h) => c >= 0.11 + h * 0.105);
    if (o.visible = l.length > 0, !!l.length) {
      for (let u = 0; u < e; u++) {
        let h = l[u % l.length], d = (a * 0.17 + u / e) % 1;
        n[u * 3] = h.x * (1 - d), n[u * 3 + 1] = 5 + h.y * (1 - d) + Math.sin(d * Math.PI) * 2, n[u * 3 + 2] = h.z * (1 - d);
      }
      s.attributes.position.needsUpdate = true;
    }
  };
}
function Sf() {
  let i = Gn("deep_space_sensor", 72);
  i.focus.set(0, 12, 0), i.detailFocus = new C(0, 17, 0), i.detailRadius = 27, i.viewDirection = new C(1, 0.85, 1.3).normalize();
  let t = ot(i.group);
  Ct(t, 9.7, 11.8, 4.8, [0, 0, 0], y.dark, 6), Ct(t, 9.2, 9.7, 1.5, [0, 3.1, 0], y.light, 6), Ct(t, 8.4, 8.4, 0.32, [0, 4, 0], y.gold, 6), Ct(t, 5.4, 6.6, 4, [0, 5.7, 0], y.hull, 12), Ct(t, 3.2, 4.2, 5, [0, 10, 0], y.edge, 16);
  for (let h = 0; h < 6; h++) {
    let d = ce * h / 6, f = ot(t, [Math.cos(d) * 9.7, 1, Math.sin(d) * 9.7]);
    f.rotation.y = -d, B(f, [1.5, 2.7, 5.8], [0, 0, 0], y.hull), B(f, [0.13, 0.2, 4.8], [0.81, 0.8, 0], y.cyan);
    for (let m = 0; m < 5; m++) B(f, [0.17, 1.4, 0.25], [0.87, -0.45, -2 + m], y.dark);
    pt(t, [Math.cos(d) * 4.5, 5.8, Math.sin(d) * 4.5], [Math.cos(d) * 2.7, 13, Math.sin(d) * 2.7], 0.7, y.hull);
  }
  for (let h of [-1, 1]) B(t, [1.8, 8.5, 3.7], [h * 4, 12.2, 0], y.dark), Ct(t, 1.65, 1.65, 2, [h * 4.3, 15.5, 0], y.gold, 20, [0, 0, Math.PI / 2]), Ct(t, 1.1, 1.1, 2.1, [h * 4.4, 15.5, 0], y.edge, 20, [0, 0, Math.PI / 2]);
  let e = [], n = [], s = be(ot(t, [0, 15.5, 0]));
  yf(s, 17.5, 1), e.push({ pivot: s, pos: new C(0, 15.5, 0), index: 0, radius: 17.5 });
  let r = [[-40, 1, -25], [-38, -2, 29], [3, 0, 48], [40, 2, 26], [41, 0, -23], [0, -1, -45]];
  for (let h = 0; h < r.length; h++) {
    let d = r[h], f = ne(i, ot(i.group, d), 0.11 + h * 0.105);
    ve(f, [0, -1, 0], [0, 8.2, 0], 3.7, y.edge, 3), Ct(f, 5, 5.7, 2.8, [0, -1, 0], y.dark, 8), Ct(f, 5.1, 5.1, 0.45, [0, 0.6, 0], y.light, 8);
    for (let _ = 0; _ < 4; _++) {
      let S = _ * Math.PI / 2;
      B(f, [1.3, 2.1, 2.8], [Math.cos(S) * 4, -0.8, Math.sin(S) * 4], y.hull, [0, -S, 0]), B(f, [0.2, 0.25, 2.1], [Math.cos(S) * 4.72, 0.2, Math.sin(S) * 4.72], y.cyan, [0, -S, 0]);
    }
    Ct(f, 2.2, 2.7, 1.8, [0, 8.6, 0], y.hull, 16), me(f, 2.4, 0.23, [0, 9.4, 0], y.gold);
    for (let _ of [-1, 1]) B(f, [0.9, 3, 2], [_ * 2.7, 10.7, 0], y.edge), Ct(f, 0.85, 0.85, 1, [_ * 2.9, 12, 0], y.gold, 12, [0, 0, Math.PI / 2]);
    let m = be(ot(f, [0, 12, 0]));
    yf(m, h % 2 ? 9 : 10.7, h), e.push({ pivot: m, pos: new C(d[0], d[1] + 12, d[2]), index: h + 1, radius: h % 2 ? 9 : 10.7, phase: 0.11 + h * 0.105 });
    let x = new C(d[0], 0, d[2]).normalize(), g = x.clone().multiplyScalar(11), p = new C(d[0], d[1] - 1, d[2]);
    h % 2 === 0 && (ve(i.group, g.toArray(), p.toArray(), 1.7, y.edge, 9), pt(i.group, [g.x, -0.6, g.z], [p.x, p.y - 0.6, p.z], 0.14, y.copper));
    let A = ne(i, ot(i.group, [d[0] + x.x * 12, d[1] - 1, d[2] + x.z * 12]), 0.2 + h * 0.09);
    Kl(A, 7, 14, [0, 0, 0], Math.atan2(x.x, x.z)), pt(i.group, [d[0], d[1] - 2, d[2]], [A.position.x, A.position.y, A.position.z], 0.5, y.edge);
    let v = xo(i.effects, [[d[0], d[1] + 4, d[2]], [d[0] * 0.5, 5, d[2] * 0.5], [0, 5, 0]], "#609ca9", 0.19);
    n.push({ line: v, threshold: 0.11 + h * 0.105 });
  }
  for (let h of [-1, 1]) for (let d = 0; d < 2; d++) {
    let f = [h * (14 + d * 5.3), -3, 0];
    Kl(i.group, 3.8, 27, f, 0), pt(i.group, [h * 8, -3, 0], f, 0.6, y.edge);
  }
  let o = [], a = new ae({ uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 }, uColor: { value: new Ot("#43d4e0") } }, vertexShader: "varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "varying vec3 vP; uniform float uTime; uniform float uIntensity; uniform vec3 uColor; void main(){float y=(vP.y+20.)/40.;float w=pow(max(0.,sin(y*24.-uTime*1.5)),18.); float a=(.012+.055*w)*(1.-y)*uIntensity; gl_FragColor=vec4(uColor,a);}", side: Ne, transparent: true, depthWrite: false, blending: Ce });
  for (let h of e) {
    let d = ot(i.effects, h.pos.toArray()), f = Le(d, new Yi(h.radius * 0.8, 40, 40, 1, true), a, [0, 36, 0], [0, 0, Math.PI]);
    f.userData.keepMesh = true;
    let m = [];
    for (let x = 0; x < 3; x++) m.push(me(d, h.radius * 0.55, 0.045, [0, 19 + x * 9, 0], _o("#7ae6df", 0.2)));
    o.push({ fx: d, rings: m, entry: h });
  }
  let c = mv(i.effects, r.map((h) => new C(...h)), 42), l = be(di(i.group, 1.3)), u = i.setProgress.bind(i);
  return i.setProgress = (h) => {
    u(h);
    for (let d of o) d.fx.visible = h >= (d.entry.phase || 0);
    for (let d of n) d.line.visible = h >= d.threshold;
    c(i.time, h);
  }, i.update = (h, d, f) => {
    let m = f.effectLevel <= 0 ? 0 : f.effectLevel === 1 ? 0.55 : f.effectLevel === 2 ? 1 : 1.4;
    for (let x of e) x.pivot.rotation.z = -0.43 + Math.sin(d * 0.038 + x.index * 0.7) * 0.14, x.pivot.rotation.x = 0.18 + Math.cos(d * 0.029 + x.index * 0.8) * 0.12, x.pivot.rotation.y = Math.sin(d * 0.025 + x.index) * 0.13;
    for (let x of o) {
      x.fx.quaternion.copy(x.entry.pivot.quaternion), x.fx.visible = f.progress >= (x.entry.phase || 0);
      for (let g = 0; g < x.rings.length; g++) {
        let p = (d * 0.09 + g / 3) % 1, A = x.rings[g];
        A.position.y = 17 + p * 30, A.scale.setScalar(0.45 + p * 0.8), A.material.opacity = (1 - p) * 0.22 * m;
      }
    }
    a.uniforms.uTime.value = d, a.uniforms.uIntensity.value = m, c(d, f.progress), l.position.set(Math.cos(d * 0.07) * 26, 8 + Math.sin(d * 0.11) * 3, Math.sin(d * 0.07) * 26), l.rotation.y = -d * 0.07;
  }, i;
}
function Jl(i, t = 2) {
  let e = Di(i), n = new Ki(1, t), s = n.attributes.position, r = 0.85 + e() * 0.62, o = 0.65 + e() * 0.45, a = 0.83 + e() * 0.57, c = 3.5 + e() * 2.2, l = e() * 9;
  for (let u = 0; u < s.count; u++) {
    let h = s.getX(u), d = s.getY(u), f = s.getZ(u), m = 1 + 0.13 * Math.sin(h * c + l) * Math.cos(f * c * 1.7 - d * 3) + 0.1 * Math.sin(d * c * 2.4 + f * 4.3) + 0.055 * Math.cos(h * 17 - d * 11 + f * 14), x = 1 - 0.22 * Math.exp(-((h - 0.45) ** 2 + (d - 0.7) ** 2 + (f - 0.4) ** 2) / 0.15);
    s.setXYZ(u, h * m * r * x, d * m * o * x, f * m * a * x);
  }
  return n.computeVertexNormals(), n.computeBoundingSphere(), n;
}
function Mf(i, t = 1) {
  let e = be(ot(i));
  e.scale.setScalar(t), B(e, [1.4, 0.8, 2.2], [0, 0, 0], y.gold), B(e, [1, 0.42, 0.85], [0, 0.5, -0.4], y.glass), B(e, [2.3, 0.15, 1.1], [0, -0.45, 0.2], y.edge);
  for (let n of [-1, 1]) Ct(e, 0.25, 0.4, 1.5, [n * 0.9, -0.2, 0.7], y.dark, 8, [Math.PI / 2, 0, 0]), Ct(e, 0.22, 0.22, 0.1, [n * 0.9, -0.2, 1.5], y.cyan, 8, [Math.PI / 2, 0, 0]), pt(e, [n * 0.8, -0.2, -0.5], [n * 1.5, -0.7, -1.6], 0.16, y.hull), pt(e, [n * 1.5, -0.7, -1.6], [n * 0.65, -1, -2.4], 0.13, y.edge);
  return e;
}
function gv(i, t, e) {
  let n = Di(e), s = 34, r = new Float32Array(s * 3), o = [];
  for (let u = 0; u < s; u++) o.push([n() * 2 - 1, n() * 0.9 + 0.2, n() * 2 - 1, n()]);
  let a = new te();
  a.setAttribute("position", new Ae(r, 3));
  let c = new Cn({ color: 16759397, size: 0.22, transparent: true, opacity: 0.9, blending: Ce, depthWrite: false, toneMapped: false }), l = new pn(a, c);
  return l.position.fromArray(t), l.frustumCulled = false, i.add(l), (u, h = 1) => {
    for (let d = 0; d < s; d++) {
      let f = o[d], m = (u * 0.8 + f[3]) % 1;
      r[d * 3] = f[0] * m * 2.5, r[d * 3 + 1] = f[1] * m * 3.5 - m * m * 2.8, r[d * 3 + 2] = f[2] * m * 2.5;
    }
    a.attributes.position.needsUpdate = true, c.opacity = Math.min(1, (0.45 + 0.4 * Math.sin(u * 7 + e) ** 2) * h), a.setDrawRange(0, Math.floor(s * Math.min(1, h)));
  };
}
function bf(i, t, e, n) {
  let s = ot(i, n);
  B(s, [t, 1.1, e], [0, 0, 0], y.edge), B(s, [t - 0.5, 0.22, e - 0.5], [0, 0.65, 0], y.dark);
  for (let r = -t / 2 + 1; r < t / 2; r += 2.8) B(s, [0.65, 0.2, 1.2], [r, 0.8, e / 2 - 0.7], y.gold), B(s, [0.65, 0.2, 1.2], [r, 0.8, -e / 2 + 0.7], y.gold);
  for (let r of [-e / 2 + 0.7, e / 2 - 0.7]) {
    pt(s, [-t / 2, 1.8, r], [t / 2, 1.8, r], 0.13, y.hull);
    for (let o = -t / 2; o <= t / 2; o += 4) pt(s, [o, 0.7, r], [o, 1.8, r], 0.13, y.edge);
  }
  return s;
}
function Ef(i, t, e = 3) {
  let n = ot(i, t);
  for (let s = 0; s < e; s++) {
    let r = (s - (e - 1) / 2) * 3.6;
    Ct(n, 1.3, 1.3, 6.5, [r, 2.8, 0], y.hull, 14), Ct(n, 0.7, 1.3, 0.7, [r, 6.4, 0], y.light, 14), Ct(n, 1.3, 0.9, 0.7, [r, -0.8, 0], y.dark, 14);
    for (let o of [0.3, 4.9]) me(n, 1.35, 0.16, [r, o, 0], y.edge);
    B(n, [0.2, 3.8, 0.1], [r, 3, 1.32], y.cyan), pt(n, [r, -1, 0], [r, -1, 2], 0.35, y.copper);
  }
  return pt(n, [-(e - 1) * 1.8, -1, 2], [(e - 1) * 1.8, -1, 2], 0.6, y.copper), n;
}
function _v(i, t = 1) {
  let e = ot(i);
  e.scale.setScalar(t), bf(e, 24, 25, [0, 0, 0]);
  for (let n of [-9, 9]) for (let s of [-9, 9]) ve(e, [n, -6, s], [n, 0, s], 1.3, y.edge, 3);
  B(e, [8, 6, 15], [-5, 3.7, -2], y.hull), B(e, [8.3, 1.1, 15.2], [-5, 7.3, -2], y.dark);
  for (let n = -7; n <= 3; n += 2) B(e, [0.14, 1.2, 1.5], [-0.92, 5.6, n], y.cyan), B(e, [1.8, 0.5, 1.5], [-7, 8, n], y.edge);
  Ef(e, [6, 2, 2], 2), Ct(e, 3, 3.9, 8, [2, 4.5, -6.5], y.dark, 12), Ct(e, 2.6, 3, 1.6, [2, 9.3, -6.5], y.light, 12);
  for (let n = 0; n < 10; n++) {
    let s = n * ce / 10, r = ot(e, [2 + Math.cos(s) * 3.7, 4.5, -6.5 + Math.sin(s) * 3.7]);
    r.rotation.y = -s, B(r, [2, 0.32, 1.6], [0, -2, 0], y.copper), B(r, [2, 0.32, 1.6], [0, 0, 0], y.copper), B(r, [2, 0.32, 1.6], [0, 2, 0], y.copper), B(r, [0.3, 6, 0.4], [0.7, 0, 0], y.edge);
  }
  me(e, 2.75, 0.17, [2, 9.5, -6.5], y.amber);
  for (let n = 0; n < 3; n++) B(e, [5.5, 2.3, 3.2], [-5, 2, 8 + n * 3.6], n % 2 ? y.gold : y.edge);
  for (let n of [-1, 1]) {
    ve(e, [n * 9, -2, -1], [n * 21, -2, -1], 1.3, y.edge, 4);
    let s = Kl(e, 8, 20, [n * 21, -2, -1]);
    s.rotation.z = n * 0.2;
  }
  return e;
}
function Tf() {
  let i = Gn("asteroid_belt", 88), t = Di(7351), n = [-0.55, 0.24, 1.08, 1.94, 2.78, 3.7, 4.72].map((v, _) => ({ a: v, r: 331 + (_ % 3 - 1) * 7 })), s = n.map((v) => new C(Math.cos(v.a) * v.r, 0, Math.sin(v.a) * v.r));
  i.focus.copy(s[0]).add(new C(0, 12, 0)), i.detailFocus = s[0].clone().add(new C(0, 19, 0)), i.detailRadius = 34, i.extentRadius = 389, i.viewDirection = new C(0.7, 0.75, 1.1).normalize();
  let r = new Ye({ color: 7107192, roughness: 0.96, metalness: 0.13, flatShading: true }), o = new Ye({ color: 7826785, roughness: 0.93, metalness: 0.21, flatShading: true }), a = new Ye({ color: 10258015, roughness: 0.64, metalness: 0.52, flatShading: true }), c = new Ye({ color: 9212560, roughness: 0.9, metalness: 0.18, flatShading: true }), l = [r, o, r, c, a, r, o, c], u = [], h = new Se();
  for (let v = 0; v < 8; v++) {
    let S = Jl(110 + v * 27, 1), T = new ri(S, l[v], 176);
    T.name = "irregular-asteroids-" + v, T.instanceMatrix.setUsage(lh), T.frustumCulled = false, be(T), i.group.add(T);
    let R = [];
    for (let I = 0; I < 176; I++) {
      let M, b, D, F;
      for (let z = 0; z < 20 && (M = t() * ce, b = 309 + t() * 56, D = Math.cos(M) * b, F = Math.sin(M) * b, !s.every((V) => (D - V.x) ** 2 + (F - V.z) ** 2 > 33 ** 2)); z++) ;
      let U = 0.42 + Math.pow(t(), 2) * 3.2;
      R.push({ x: D, y: (t() - 0.5) * (6 + t() * 8), z: F, size: U, sx: 0.7 + t() * 0.9, sy: 0.6 + t() * 0.65, sz: 0.8 + t() * 0.7, rx: t() * ce, ry: t() * ce, rz: t() * ce, speed: (t() - 0.5) * 0.028 }), T.setColorAt(I, new Ot().setHSL(0.08 + t() * 0.04, 0.055 + t() * 0.08, 0.55 + t() * 0.32));
    }
    u.push({ field: T, data: R });
  }
  let d = [], f = [], m = [], x = [], g = [];
  for (let v = 0; v < n.length; v++) {
    let _ = n[v], S = s[v], T = ot(i.group, S.toArray());
    T.rotation.y = -_.a - Math.PI / 2;
    let R = v === 0 ? 19 : 12.5 + t() * 4.4, I = be(Le(T, Jl(700 + v * 31, 3), v % 2 ? o : r, [0, -1, 0], [0, 0, 0], [R, R, R]));
    for (let it = 0; it < 5; it++) {
      let Et = t() * ce, Vt = 24 + t() * 7, Yt = be(Le(T, Jl(v * 37 + it + 1300, 1), l[(v + it) % 8], [Math.cos(Et) * Vt, -3 + t() * 4, Math.sin(Et) * Vt], [t(), t(), t()], [1.8 + t() * 2, 1.5 + t() * 2, 2 + t() * 2]));
      d.push((Ht) => {
        Yt.rotation.y = Ht * 0.013 + it, Yt.rotation.x = Ht * 6e-3 + v;
      });
    }
    for (let it = 0; it < 6; it++) {
      let Et = [R * 0.7 - it * 0.5, 2 + it * 0.95, R * 0.28 + Math.sin(it * 1.7) * 2];
      Le(T, Jl(900 + it + v * 20, 0), a, Et, [0.3 + it * 0.3, 0.5, 0], [1.2, 0.45, 2.4]);
    }
    let M = v === 0 ? 13.2 : 10.8, b = 0.08 + v * 0.105, D = ne(i, ot(T), b), F = v === 0 ? 1 : 0.72;
    D.scale.setScalar(F);
    let U = M / F;
    bf(D, 28, 21, [0, U, 1]);
    for (let it of [-10, 10]) for (let Et of [-7, 8]) ve(D, [it, U - 7, Et], [it, U, Et], 1.3, y.edge, 3), Ct(D, 1.3, 2, 0.9, [it, U - 7, Et], y.dark, 8);
    B(D, [8, 5.4, 8], [-8, U + 3.2, -3], y.light), B(D, [8.4, 0.5, 8.4], [-8, U + 6.1, -3], y.dark), B(D, [0.12, 1.1, 6], [-3.94, U + 4.3, -3], y.glass);
    for (let it = 0; it < 5; it++) B(D, [1, 0.18, 0.12], [-10.7 + it * 1.35, U + 4.2, 1.06], y.cyan);
    Ef(D, [-8, U + 1.5, 7], 3), Kl(D, 10, 16, [-9, U - 2, -19], 0.1), ve(D, [-9, U - 2, -9], [-9, U - 2, -18], 1, y.edge, 3);
    let z = v === 0 ? 2 : 1;
    for (let it = 0; it < z; it++) {
      let Et = it === 0 ? 6 : 11, Vt = it === 0 ? -4 : 7;
      for (let q of [-1, 1]) ve(D, [Et + q * 2, U, Vt], [Et + q * 2, U + 19, Vt], 0.8, y.edge, 6);
      B(D, [6, 1, 3], [Et, U + 19, Vt], y.gold), pt(D, [Et - 1.4, U, Vt], [Et - 1.4, U + 19, Vt], 0.18, y.hull), pt(D, [Et + 1.4, U, Vt], [Et + 1.4, U + 19, Vt], 0.18, y.hull);
      let Yt = be(ot(D, [Et, U + 10, Vt]));
      B(Yt, [4.8, 3.1, 3.5], [0, 0, 0], y.gold);
      for (let q of [-1, 1]) B(Yt, [0.25, 1.8, 2.2], [q * 2.5, 0, 0], y.dark);
      Ct(Yt, 0.55, 0.55, 14, [0, -5.8, 0], y.edge, 12);
      let Ht = be(ot(Yt, [0, -12.1, 0]));
      Ct(Ht, 1.45, 0.15, 3.2, [0, 0, 0], y.dark, 12);
      for (let q = 0; q < 10; q++) {
        let tt = q * 0.85, yt = 1.25 * (1 - q / 14);
        B(Ht, [yt * 1.7, 0.22, 0.65], [Math.cos(tt) * yt * 0.36, 1.3 - q * 0.25, Math.sin(tt) * yt * 0.36], y.light, [0.1, -tt, 0.2]);
      }
      d.push((q) => {
        Yt.position.y = U + 10 + Math.sin(q * 0.33 + it + v) * 1.3, Ht.rotation.y = q * (1.1 + it * 0.3);
      });
    }
    let V = ot(D, [9, U, 8]);
    ve(V, [0, 0, 0], [0, 13, 0], 1.8, y.edge, 5);
    let G = be(ot(V, [0, 13, 0]));
    ve(G, [-3, 0, 0], [13, 0, 0], 1.35, y.gold, 6), pt(G, [0, 4, 0], [12, 0.7, 0], 0.13, y.hull), pt(G, [0, 4, 0], [-3, 0.7, 0], 0.13, y.hull), pt(G, [0, 0, 0], [0, 4, 0], 0.45, y.edge);
    let J = be(ot(G, [7, -0.8, 0]));
    B(J, [2, 0.8, 2], [0, 0, 0], y.dark);
    for (let it of [-0.7, 0.7]) pt(J, [it, -0.3, 0], [it, -5.4, 0], 0.06, y.hull);
    B(J, [2.7, 2.3, 2.4], [0, -6.5, 0], y.gold), B(J, [2.1, 0.4, 1.9], [0, -5.1, 0], y.black), d.push((it) => {
      G.rotation.y = 0.23 + Math.sin(it * 0.08 + v) * 0.3, J.position.x = 7 + Math.sin(it * 0.21 + v) * 3;
    });
    let W = ot(i.effects, S.toArray());
    W.rotation.y = T.rotation.y, f.push(gv(W, [6 * F, M - 1, -4 * F], 410 + v));
    let ft = pt(W, [18, M + 12, 5], [R * 0.74, 5, R * 0.25], 0.085, _o("#72e9d7", 0.7));
    ft.userData.keepMesh = true, g.push({ fx: W, threshold: b, laserMaterial: ft.material });
    let vt = Mf(T, v === 0 ? 1.3 : 1);
    if (vt.position.set(18, M + 12, 5), vt.rotation.x = 0.15, d.push((it) => {
      vt.position.y = M + 12 + Math.sin(it * 0.55 + v) * 0.4;
    }), v % 2 === 0) {
      let it = ne(i, ot(T, [48, M - 5, 0]), b + 0.06);
      _v(it, v === 0 ? 1 : 0.8);
      let Et = ne(i, ot(T), b + 0.06);
      ve(Et, [14, M - 0.6, 2], [38, M - 4, 2], 2.2, y.edge, 10), pt(Et, [14, M + 0.8, 2], [38, M - 2.6, 2], 2.1, y.black, 0.18), pt(Et, [14, M + 1, 1], [38, M - 2.4, 1], 0.13, y.amber), pt(Et, [14, M + 1, 3], [38, M - 2.4, 3], 0.13, y.amber);
      let Vt = [];
      for (let Ht = 0; Ht < 5; Ht++) {
        let q = be(ot(Et));
        B(q, [2, 0.9, 1.5], [0, 0, 0], y.gold), B(q, [1.6, 0.4, 1.2], [0, 0.5, 0], a), Vt.push(q);
      }
      x.push({ bins: Vt, baseY: M });
      for (let Ht = 0; Ht < 3; Ht++) {
        let q = be(di(T, 1.5));
        for (let tt = 0; tt < 2; tt++) B(q, [1.1, 0.5, 0.7], [0, 0.5, 0.4 + tt * 0.8], Ht % 2 ? y.copper : y.gold);
        m.push((tt) => {
          let yt = tt * 0.11 + Ht * ce / 3;
          q.position.set(25 + Math.cos(yt) * 31, M + 8 + Math.sin(yt * 2) * 2, Math.sin(yt) * 16 - 4), q.rotation.y = -yt + Math.PI / 2;
        });
      }
      let Yt = [];
      for (let Ht = 0; Ht <= 64; Ht++) {
        let q = ce * Ht / 64;
        Yt.push([25 + Math.cos(q) * 31, M + 8, Math.sin(q) * 16 - 4]);
      }
      xo(W, Yt, "#ca995d", 0.13);
    }
    for (let it = 0; it < 2; it++) {
      let Et = Mf(T, 0.9);
      m.push((Vt) => {
        let Yt = Vt * 0.13 + it * Math.PI + v;
        Et.position.set(Math.cos(Yt) * 23, M + 6 + Math.sin(Yt * 2) * 2, Math.sin(Yt) * 23), Et.rotation.y = -Yt;
      });
    }
  }
  let p = (v) => {
    for (let { field: _, data: S } of u) {
      for (let T = 0; T < S.length; T++) {
        let R = S[T];
        h.position.set(R.x, R.y, R.z), h.scale.set(R.size * R.sx, R.size * R.sy, R.size * R.sz), h.rotation.set(R.rx + v * R.speed, R.ry + v * R.speed * 0.7, R.rz + v * R.speed * 0.43), h.updateMatrix(), _.setMatrixAt(T, h.matrix);
      }
      _.instanceMatrix.needsUpdate = true;
    }
  };
  p(0);
  let A = i.setProgress.bind(i);
  return i.setProgress = (v) => {
    A(v);
    for (let { fx: _, threshold: S } of g) _.visible = v >= S;
  }, i.update = (v, _, S) => {
    let T = S.effectLevel <= 0 ? 0 : S.effectLevel === 1 ? 0.55 : S.effectLevel === 2 ? 1 : 1.4;
    p(_);
    for (let R of d) R(_);
    for (let R of m) R(_);
    for (let R of f) R(_, T);
    for (let { fx: R, threshold: I, laserMaterial: M } of g) R.visible = S.progress >= I, M.opacity = Math.min(1, 0.7 * T);
    for (let { bins: R, baseY: I } of x) for (let M = 0; M < R.length; M++) {
      let b = (_ * 0.06 + M / R.length) % 1;
      R[M].position.set(14 + b * 24, I + 1.5 - b * 3.4, 2);
    }
  }, i;
}
export {
  _f as createDyson,
  xf as createExtractor,
  pf as createGate,
  vf as createHabitat,
  Sf as createListener,
  ff as createLogistics,
  mf as createShipyard,
  af as mergeStaticMachinery
};
