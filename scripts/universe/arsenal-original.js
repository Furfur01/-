// Extracted from the user-provided stellar_arsenal.html.
// Geometry and shaders retained; imported Three.js replaces the embedded library.
import {MathUtils as Tn, AdditiveBlending as ot, DoubleSide as wt, BackSide as Yt, SRGBColorSpace as en, Float32BufferAttribute as nt, BufferAttribute as It, MeshLambertMaterial as Br, Vector3 as T, CanvasTexture as Rr, Sprite as Xi, SpriteMaterial as Ti, ShaderMaterial as st, Mesh as Je, SphereGeometry as Zt, Color as Ge, Group as _t, MeshStandardMaterial as bt, MeshBasicMaterial as yt, BoxGeometry as dn, CylinderGeometry as Qt, Object3D as Rt, Quaternion as Wt, Matrix4 as Tt, InstancedMesh as Nt, TorusGeometry as on, BufferGeometry as mt, IcosahedronGeometry as Wn, OctahedronGeometry as Nr, LineBasicMaterial as Sn, LineSegments as Kn, Points as En, CircleGeometry as Ir, RingGeometry as jn, PointLight as hi, PlaneGeometry as qi, TubeGeometry as Fr, CatmullRomCurve3 as Ls} from 'three';
import {createElectronExtraction} from './electron-extraction.js';
  function Zs(i) {
    return new Br({ color: 0, emissive: 16777215, emissiveIntensity: i });
  }
  var _n = new T(245, 6, 65), Sl = 17, Kc = Tn.clamp, pi = (i, e, t) => {
    let n = Kc((t - i) / (e - i), 0, 1);
    return n * n * (3 - 2 * n);
  };
  function u_(i = 91238) {
    let e = i >>> 0;
    return () => (e = e * 1664525 + 1013904223 >>> 0, e / 4294967296);
  }
  var Jc = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise3(p);p=p*2.03+vec3(12.4,3.2,7.1);a*=.5;}return v;}
`;
  function d_() {
    let i = document.createElement("canvas");
    i.width = i.height = 128;
    let e = i.getContext("2d"), t = e.createRadialGradient(64, 64, 0, 64, 64, 64);
    t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(0.1, "rgba(255,255,255,.95)"), t.addColorStop(0.28, "rgba(255,255,255,.32)"), t.addColorStop(0.6, "rgba(255,255,255,.065)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 128, 128);
    let n = new Rr(i);
    return n.colorSpace = en, n;
  }
  function id(i, e, t, n = 1) {
    let s = new Xi(new Ti({ map: i, color: e, transparent: true, opacity: n, blending: ot, depthWrite: false, toneMapped: false }));
    return s.scale.set(t, t, 1), s;
  }
  function sd(i, e, t = "rock") {
    let n = { uTime: { value: 0 }, uSeed: { value: e }, uType: { value: t === "gas" ? 1 : 0 }, uCenter: { value: new T() }, uSun: { value: new T() }, uHitDir: { value: new T(-1, 0, 0) }, uDamage: { value: 0 }, uHeat: { value: 0 }, uKind: { value: 0 }, uOpacity: { value: 1 } }, s = new st({ uniforms: n, vertexShader: "varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;void main(){vLocal=normalize(position);vWorld=(modelMatrix*vec4(position,1.)).xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}", fragmentShader: `${Jc}
 varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;
 uniform float uTime,uSeed,uType,uDamage,uHeat,uKind,uOpacity;uniform vec3 uSun,uCenter,uHitDir;
 void main(){
 vec3 n=normalize(vLocal),wn=normalize(vNormal),ld=normalize(uSun-vWorld),vd=normalize(cameraPosition-vWorld);
 float continent=fbm(n*3.25+uSeed),terrain=fbm(n*19.+uSeed),cloud=fbm(n*10.+vec3(uTime*.006,0,0));
 float land=smoothstep(.46,.53,continent);float polar=smoothstep(.77,.94,abs(n.y)+terrain*.1);
 vec3 ocean=mix(vec3(.011,.075,.13),vec3(.018,.18,.235),smoothstep(.39,.49,continent));
 vec3 ground=mix(vec3(.085,.15,.095),vec3(.34,.27,.135),smoothstep(.3,.65,terrain));
 vec3 col=mix(ocean,ground,land);col=mix(col,vec3(.58,.69,.71),polar);
 if(uType>.5){float band=.5+.5*sin(n.y*44.+fbm(n*8.+uSeed)*7.);col=mix(vec3(.12,.18,.25),vec3(.46,.34,.23),band);col=mix(col,vec3(.68,.62,.5),smoothstep(.67,.84,noise3(n*32.+uSeed)));}
 float day=max(dot(wn,ld),0.);float terminator=smoothstep(-.18,.65,dot(wn,ld));
 col*=.13+day*1.15;float spec=pow(max(dot(wn,normalize(ld+vd)),0.),72.)*(1.-land)*day;col+=vec3(.45,.63,.67)*spec;
 float clouds=smoothstep(.55,.72,cloud)*.52;col=mix(col,vec3(.56,.66,.68)*(.19+.8*day),clouds*(1.-uType));
 float cities=step(.79,noise3(n*270.))*step(.58,terrain)*land*(1.-terminator);col+=vec3(.95,.53,.2)*cities*.26;
 float angle=acos(clamp(dot(normalize(vWorld-uCenter),normalize(uHitDir)),-1.,1.));
 float region=exp(-angle*angle/max(.09,uDamage*3.7));float cracks=1.-smoothstep(.024,.068,abs(noise3(n*31.+uSeed)-.5));
 vec3 hot=uKind<.5?vec3(1.8,.55,.09):(uKind<1.5?vec3(2.2,.65,.12):vec3(.7,.3,2.2));
 col*=1.-uDamage*region*.7;col+=hot*cracks*uHeat*region*(.45+noise3(n*67.+uTime*.2));
 col+=hot*pow(region,7.)*uHeat*.13;
 gl_FragColor=vec4(col,uOpacity);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`, transparent: true, depthWrite: true }), r = new Je(new Zt(i, 80, 48), s);
    return r.userData.uniforms = n, r;
  }
  function rd(i, e = 5487089) {
    let t = new st({ uniforms: { uColor: { value: new Ge(e) }, uAlpha: { value: 1 } }, vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}", fragmentShader: "varying vec3 vN;varying vec3 vV;uniform vec3 uColor;uniform float uAlpha;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(uColor,f*.43*uAlpha);}", transparent: true, side: Yt, depthWrite: false, blending: ot });
    return new Je(new Zt(i * 1.065, 64, 36), t);
  }
  function jc({ target: i }) {
    let e = new _t();
    e.name = "HELIOS \xB7 \u6234\u68EE\u68F1\u955C\u9635\u5217";
    let t = new _t();
    e.add(t);
    let n = i.clone().normalize();
    t.quaternion.setFromUnitVectors(new T(0, 0, 1), n);
    let s = i.length() - 17.1, r = 58.8, a = new _t(), o = new _t(), l = new _t();
    t.add(a, o, l);
    let c = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set(), d = (ie) => (c.add(ie), ie), u = (ie) => (h.add(ie), ie), p = u(new bt({ color: 2704202, metalness: 0.82, roughness: 0.35 })), g = u(new bt({ color: 1055784, metalness: 0.72, roughness: 0.48 })), x = u(new bt({ color: 9335104, metalness: 0.85, roughness: 0.3 })), m = u(new bt({ color: 9877933, metalness: 0.73, roughness: 0.25 })), f = u(new bt({ color: 15908208, metalness: 0.75, roughness: 0.19, emissive: 6505755, emissiveIntensity: 0.5, side: wt })), E = u(new bt({ color: 10021044, metalness: 0.66, roughness: 0.14, emissive: 2993506, emissiveIntensity: 0.28, side: wt })), b = u(new yt({ color: 15187314, toneMapped: false, side: wt })), _ = u(new yt({ color: new Ge(7798687).multiplyScalar(2.1), toneMapped: false })), R = u(new yt({ color: new Ge(16758098).multiplyScalar(1.7), toneMapped: false })), A = d(new dn(1, 1, 1)), P = d(new Qt(1, 1, 1, 12, 1)), I = d(new Qt(1, 1, 1, 8, 1, true)), v = new Rt(), S = new T(), D = new Wt(), U = new T(0, 1, 0), X = new T(0, 0, 1), J = new Tt(), K = 32013, Z = () => (K = 1664525 * K + 1013904223 >>> 0, K / 4294967296), ee = (ie, le, ne) => Tn.smoothstep(ne, ie, le), H = (ie, le, ne, Re, ke = [1, 1, 1], Se) => {
      let Ce = new Je(ie, le);
      return Ce.position.set(...Re), Ce.scale.set(...ke), Se && Ce.rotation.set(...Se), ne.add(Ce), Ce;
    };
    function re(ie, le, ne, Re = o) {
      let ke = new Nt(ie, le, ne.length);
      return ne.forEach((Se, Ce) => {
        v.position.set(...Se.p), v.rotation.set(...Se.r || [0, 0, 0]), v.scale.set(...Se.s || [1, 1, 1]), v.updateMatrix(), ke.setMatrixAt(Ce, v.matrix);
      }), ke.instanceMatrix.needsUpdate = true, Re.add(ke), ke;
    }
    function oe(ie, le, ne, Re, ke = o) {
      let Se = new T(...ie), Ce = new T(...le), Xe = new Je(I, Re);
      return Xe.position.copy(Se).add(Ce).multiplyScalar(0.5), S.copy(Ce).sub(Se), Xe.scale.set(ne, S.length(), ne), Xe.quaternion.setFromUnitVectors(U, S.normalize()), ke.add(Xe), Xe;
    }
    function me(ie, le, ne, Re, ke = o, Se = 6, Ce = 96) {
      return H(d(new on(ie, le, Se, Ce)), ne, ke, [0, 0, Re]);
    }
    let He = [[0.22, -0.13], [1.14, -0.31], [1.67, -0.16], [1.52, 0.16], [0.66, 0.29], [0.22, 0.13]];
    function xe(ie = 1, le = 0.06, ne = false) {
      let Re = [];
      function ke(Ce, Xe, ct) {
        Re.push(...Ce, ...Xe, ...ct);
      }
      for (let Ce = 0; Ce < 6; Ce++) {
        let Xe = Ce * Math.PI / 3, ct = Math.cos(Xe), Ct = Math.sin(Xe), at = He.map(([O, G]) => {
          let Y = 0.82 + (O - 0.82) * ie, F = G * ie;
          return [Y * ct - F * Ct, Y * Ct + F * ct, le];
        }), M = [0.92 * ct, 0.92 * Ct, le + 0.035];
        for (let O = 0; O < at.length; O++) {
          let G = at[O], Y = at[(O + 1) % at.length];
          if (ne) {
            let F = M, ue = G.map((De, Le) => F[Le] + (De - F[Le]) * 0.92), Me = Y.map((De, Le) => F[Le] + (De - F[Le]) * 0.92);
            ke(ue, Me, F);
          } else {
            ke(G, Y, M);
            let F = [G[0], G[1], le - 0.12], ue = [Y[0], Y[1], le - 0.12];
            ke(G, F, ue), ke(G, ue, Y);
          }
        }
      }
      let Se = new mt();
      return Se.setAttribute("position", new nt(Re, 3)), Se.computeVertexNormals(), d(Se);
    }
    let tt = 928, rt = new Nt(xe(), g, tt), te = new Nt(xe(0.84, 0.078, true), f, tt), ae = new Nt(d(new Qt(0.19, 0.23, 0.23, 6)), x, tt), be = new Nt(d(new Wn(0.115, 0)), R, tt), ze = [], Be = new T();
    for (let ie = 0; ie < tt; ie++) {
      let le = -1 + 1.8 * (ie + 0.5) / tt, ne = ie * Math.PI * (3 - Math.sqrt(5)), Re = Math.sqrt(1 - le * le), ke = 38.3 + 2.5 * Math.sin(ie * 4.19) + ie % 3 * 0.45;
      Be.set(Math.cos(ne) * Re, Math.sin(ne) * Re, le), v.position.copy(Be).multiplyScalar(ke), v.quaternion.setFromUnitVectors(X, Be), v.rotateZ(ne * 0.29);
      let Se = 0.49 + Z() * 0.21;
      v.scale.setScalar(Se), v.updateMatrix(), rt.setMatrixAt(ie, v.matrix), te.setMatrixAt(ie, v.matrix);
      let Ce = new Ge().setHSL(0.085 + Z() * 0.065, 0.48 + Z() * 0.2, 0.43 + Z() * 0.26);
      te.setColorAt(ie, Ce), v.rotateX(Math.PI / 2), v.updateMatrix(), ae.setMatrixAt(ie, v.matrix), v.position.addScaledVector(Be, 0.15), v.updateMatrix(), be.setMatrixAt(ie, v.matrix), ie % 6 === 0 && le > -0.74 && ze.push(v.position.clone());
    }
    [rt, te, ae, be].forEach((ie) => {
      ie.instanceMatrix.needsUpdate = true, a.add(ie);
    });
    let lt = d(new Nr(0.22, 0)), Dt = 6144, C = new Nt(lt, b, Dt);
    for (let ie = 0; ie < Dt; ie++) {
      let le = -0.99 + 1.88 * Z(), ne = Z() * Math.PI * 2, Re = Math.sqrt(1 - le * le), ke = 34.8 + Z() * 8.7;
      v.position.set(Math.cos(ne) * Re * ke, Math.sin(ne) * Re * ke, le * ke), v.rotation.set(Z() * Math.PI, Z() * Math.PI, ne);
      let Se = 0.28 + Z() * 0.85;
      v.scale.set(Se, Se * 1.8, Se * 0.16), v.updateMatrix(), C.setMatrixAt(ie, v.matrix), C.setColorAt(ie, new Ge().setHSL(0.07 + Z() * 0.08, 0.5, 0.24 + Z() * 0.42));
    }
    a.add(C);
    let ut = u(new bt({ color: 3494743, metalness: 0.8, roughness: 0.4 })), je = [];
    for (let ie = 0; ie < 3; ie++) {
      let le = new _t(), ne = d(new on(43.5 + ie * 0.55, 0.18, 5, 160, Math.PI * 1.66));
      H(ne, ut, le, [0, 0, 0]);
      let Re = H(ne, x, le, [0, 0, 0], [1.012, 1.012, 1]);
      Re.rotation.z = 0.015, le.rotation.set(ie * 0.71 + 0.25, ie * 0.8, ie * 1.9), a.add(le), je.push(le);
    }
    let We = [], Pe = [], gt = [], Te = [], Ye = [], Et = [];
    [[45.6, 13.8, 1.6, 0.8], [51, 9, 1.15, 0.75], [55.3, 5.2, 0.85, 0.65], [58.4, 2.65, 0.62, 0.5]].forEach(([ie, le, ne, Re], ke) => {
      let Se = ke < 2 ? 24 : 18;
      for (let Xe = 0; Xe < Se; Xe++) {
        let ct = Xe * Math.PI * 2 / Se;
        We.push({ p: [Math.cos(ct) * le, Math.sin(ct) * le, ie], s: [ne, le * Math.PI * 1.65 / Se, Re], r: [0, 0, ct] }), Pe.push({ p: [Math.cos(ct) * (le + 0.18), Math.sin(ct) * (le + 0.18), ie + Re * 0.57], s: [ne * 0.42, 0.18, 0.23], r: [0, 0, ct] }), Te.push({ p: [Math.cos(ct) * (le - ne * 0.25), Math.sin(ct) * (le - ne * 0.25), ie + 0.06], s: [0.14, le * Math.PI / Se, 0.23], r: [0, 0, ct] });
      }
      let Ce = me(le - ne * 0.42, 0.065, _, ie + 0.13);
      Ce.userData.opticalRing = true, gt.push(Ce);
    }), re(A, p, We), re(A, x, Pe), re(A, _, Te);
    for (let ie = 0; ie < 8; ie++) {
      let le = ie * Math.PI / 4, ne = Math.cos(le), Re = Math.sin(le), ke = [ne * 14.3, Re * 14.3, 45.5], Se = [ne * 3, Re * 3, 57.7];
      oe(ke, Se, 0.24, x), oe([ne * 15, Re * 15, 45.5], [ne * 5.5, Re * 5.5, 55.1], 0.12, m);
      for (let Ce = 0; Ce < 7; Ce++) {
        let Xe = 15 + Ce * 0.5;
        Ye.push({ p: [ne * Xe, Re * Xe, 43.2], s: [0.21, 2.65, 5.3 - Ce * 0.38], r: [0, 0, le] }), Et.push({ p: [ne * Xe, Re * Xe, 45.9 - Ce * 0.19], s: [0.085, 2.4, 0.045], r: [0, 0, le] });
      }
      H(A, g, o, [ne * 16, Re * 16, 43.1], [3.6, 3.05, 0.6], [0, 0, le]), H(A, m, o, [ne * 14.7, Re * 14.7, 43.4], [1, 3.3, 3.6], [0, 0, le]);
    }
    re(A, x, Ye), re(A, R, Et);
    let w = new _t();
    o.add(w);
    let y = me(6.6, 0.19, m, 53.9, w, 6, 96), V = [];
    for (let ie = 0; ie < 12; ie++) {
      let le = ie * Math.PI / 6;
      V.push({ p: [Math.cos(le) * 6.6, Math.sin(le) * 6.6, 53.9], s: [0.95, 0.3, 0.8], r: [0, 0, le + 0.28] });
    }
    re(A, E, V, w);
    let Q = [], se = [], j = [];
    ze.forEach((ie, le) => {
      let ne = Math.atan2(ie.y, ie.x), Re = new T(Math.cos(ne) * 46.3, Math.sin(ne) * 46.3, 20 + le % 5 * 1.5), ke = new T(Math.cos(ne) * 12.8, Math.sin(ne) * 12.8, 45.5), Se = new T(0, 0, r), Ce = [ie, Re, ke, Se];
      Q.push(Ce);
      for (let Xe = 0; Xe < 3; Xe++) {
        se.push(...Ce[Xe].toArray(), ...Ce[Xe + 1].toArray());
        let ct = Xe === 0 ? [1, 0.55, 0.12] : [0.25, 1, 0.43], Ct = Xe === 2 ? [0.8, 1, 0.86] : [0.3, 1, 0.46];
        j.push(...ct, ...Ct);
      }
    });
    let Ue = d(new mt());
    Ue.setAttribute("position", new nt(se, 3)), Ue.setAttribute("color", new nt(j, 3));
    let _e = u(new Sn({ vertexColors: true, transparent: true, opacity: 0, blending: ot, depthWrite: false, toneMapped: false })), Ne = new Kn(Ue, _e);
    a.add(Ne);
    let Fe = [];
    for (let ie = 0; ie < 32; ie++) {
      let le = ie * Math.PI / 16;
      Fe.push({ a: new T(Math.cos(le) * 12.8, Math.sin(le) * 12.8, 45.8), b: new T(0, 0, r) });
    }
    let he = u(new yt({ color: 8257451, transparent: true, opacity: 0, depthWrite: false, blending: ot, toneMapped: false })), ye = new Nt(I, he, Fe.length);
    Fe.forEach((ie, le) => {
      v.position.copy(ie.a).add(ie.b).multiplyScalar(0.5), S.copy(ie.b).sub(ie.a), v.quaternion.setFromUnitVectors(U, S.clone().normalize()), v.scale.set(0.055, S.length(), 0.055), v.updateMatrix(), ye.setMatrixAt(le, v.matrix);
    }), l.add(ye);
    let qe = Q.length * 4, Oe = new Float32Array(qe * 3), ve = d(new mt());
    ve.setAttribute("position", new It(Oe, 3));
    let Ke = u(new st({ uniforms: { strength: { value: 0 }, pointScale: { value: 260 } }, vertexShader: "uniform float pointScale; varying float depth; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); depth=-p.z; gl_Position=projectionMatrix*p; gl_PointSize=clamp(pointScale/max(depth,1.0),1.5,7.0); }", fragmentShader: "uniform float strength; void main(){float r=length(gl_PointCoord-.5)*2.0; if(r>1.0)discard; float g=pow(1.0-r,2.0); gl_FragColor=vec4(vec3(.6,1.,.72)*2.,g*strength);}", transparent: true, depthWrite: false, blending: ot, toneMapped: false })), N = new En(ve, Ke);
    a.add(N), N.frustumCulled = false;
    function de(ie, le, ne) {
      return u(new st({ uniforms: { tint: { value: new Ge(ie) }, strength: { value: 0 }, opacity: { value: le }, time: { value: 0 }, speed: { value: ne } }, vertexShader: "varying vec2 u; varying vec3 n; varying vec3 eye; void main(){u=uv; vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}", fragmentShader: "uniform vec3 tint;uniform float strength;uniform float opacity;uniform float time;uniform float speed;varying vec2 u;varying vec3 n;varying vec3 eye;void main(){float bands=.82+.12*sin(u.y*94.-time*speed)+.06*sin(u.y*271.+time*7.);float side=pow(abs(dot(normalize(n),normalize(eye))),.5);float ends=smoothstep(0.,.012,u.y)*(1.-smoothstep(.985,1.,u.y));gl_FragColor=vec4(tint*bands*strength,opacity*(.25+.75*side)*ends*min(strength,1.));}", transparent: true, depthWrite: false, side: wt, blending: ot, toneMapped: false }));
    }
    let z = new _t();
    l.add(z), z.position.z = r;
    let q = d(new Qt(1, 1, 1, 32, 1, true)), B = [{ radius: 3.1, mat: de(2686823, 0.1, 15) }, { radius: 1.65, mat: de(5570438, 0.28, 26) }, { radius: 0.72, mat: de(13303771, 0.76, 45) }, { radius: 0.27, mat: de(16777215, 0.98, 65) }].map((ie) => {
      let le = new Je(q, ie.mat);
      return le.rotation.x = Math.PI / 2, z.add(le), { ...ie, mesh: le };
    }), W = u(new st({ uniforms: { strength: { value: 0 } }, vertexShader: "varying vec3 n;varying vec3 eye;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}", fragmentShader: "uniform float strength;varying vec3 n;varying vec3 eye;void main(){float a=pow(max(0.,dot(normalize(n),normalize(eye))),2.8);gl_FragColor=vec4(vec3(.5,1.,.63)*strength,a*.62*min(strength,1.));}", transparent: true, depthWrite: false, blending: ot, toneMapped: false })), ce = H(d(new Zt(1, 28, 16)), W, l, [0, 0, r], [5, 5, 4]), L = u(new yt({ color: 11796432, opacity: 0, transparent: true, side: wt, depthWrite: false, blending: ot, toneMapped: false })), k = H(d(new Ir(2.2, 64)), L, l, [0, 0, 58.8]), $ = u(new yt({ color: 8454051, opacity: 0, transparent: true, depthWrite: false, blending: ot, toneMapped: false })), pe = new Nt(d(new on(1, 0.018, 4, 64)), $, 10);
    l.add(pe), pe.frustumCulled = false;
    let Ie = false;
    function we({ time: ie = 0, shotTime: le = -1, selected: ne = false, quality: Re = "high" } = {}) {
      if (Ie) return;
      let ke = le, Se = ke >= 0, Ce = Se ? ee(0, 6.4, ke) * (1 - ee(15.2, 18.6, ke)) : 0, Xe = Se ? ee(3.7, 7.9, ke) * (1 - ee(15, 17.8, ke)) : 0, ct = Se ? ee(6.9, 8.1, ke) * (1 - ee(15.2, 17.5, ke)) : 0, Ct = 0.97 + 0.03 * Math.sin(ie * 27) * Math.sin(ie * 13.7);
      a.rotation.z = ie * 8e-3, w.rotation.z = ie * (0.035 + Ce * 0.38), f.emissiveIntensity = 0.42 + Ce * 1.7, E.emissiveIntensity = 0.22 + Ce * 2.8, _.color.setHex(7798687).multiplyScalar(0.65 + Ce * 2.8), R.color.setHex(16758098).multiplyScalar(0.65 + Ce * 1.25), b.color.setHex(Se && Ce > 0.45 ? 12054421 : 15187314), _e.opacity = Ce * (0.23 + Xe * 0.44), Ne.visible = Ce > 2e-3, he.opacity = Xe * 0.62, ye.visible = Xe > 2e-3, N.visible = Ce > 8e-3, Ke.uniforms.strength.value = Ce * 1.3;
      let at = 0.13 + Xe * 0.2, M = Se ? ke : ie;
      for (let F = 0; F < qe; F++) {
        let ue = Q[Math.floor(F / 4)], Me = (M * at + F % 4 * 0.25 + F * 0.071) % 1 * 3, De = Math.min(2, Math.floor(Me));
        S.lerpVectors(ue[De], ue[De + 1], Me - De), Oe[F * 3] = S.x, Oe[F * 3 + 1] = S.y, Oe[F * 3 + 2] = S.z;
      }
      ve.attributes.position.needsUpdate = true;
      let O = Se ? ee(6.9, 8, ke) : 0, G = Math.max(1e-3, (s - r) * O);
      z.visible = ct > 1e-3, B.forEach(({ mesh: F, radius: ue, mat: Me }, De) => {
        F.position.z = G * 0.5, F.scale.set(ue * Ct, G, ue * Ct), Me.uniforms.strength.value = ct * (De === 3 ? 3 : 1.55), Me.uniforms.time.value = ie;
      }), W.uniforms.strength.value = Xe * (1.1 + ct * 2.8), ce.visible = Xe > 1e-3;
      let Y = 2.8 + Xe * 2.5 + ct * 1.5;
      ce.scale.set(Y, Y, Y * 0.8), L.opacity = Xe * 0.7, k.visible = Xe > 1e-3, $.opacity = ct * 0.22, pe.visible = ct > 1e-3;
      for (let F = 0; F < 10; F++) {
        let ue = (ie * 0.35 + F * 0.1) % 1;
        v.position.set(0, 0, r + ue * G), v.rotation.set(0, 0, 0);
        let Me = 2.3 + (1 - ue) * 2.9;
        v.scale.set(Me, Me, Me), v.updateMatrix(), pe.setMatrixAt(F, v.matrix);
      }
      pe.instanceMatrix.needsUpdate = true, C.count = Re === "balanced" ? 4096 : Dt, be.visible = ne || Se;
    }
    function Mt() {
      we({ time: 0, shotTime: -1, selected: false });
    }
    function Ee() {
      Ie || (Ie = true, c.forEach((ie) => ie.dispose()), h.forEach((ie) => ie.dispose()), e.clear());
    }
    Mt();
    let Ve = n.clone().multiplyScalar(9), ht = n.clone().multiplyScalar(48.5);
    return { id: "laser", group: e, focus: Ve, cameraOffset: new T(106, 83, 125), detailFocus: ht, detailOffset: new T(32, 28, 47), beam:z,beamRings:pe,muzzle: n.clone().multiplyScalar(r), duration: 24, impactAt: 8, update: we, reset: Mt, dispose: Ee };
  }
  function Qc({ target: i }) {
    let e = new _t();
    e.name = "02 \xB7 \u76F8\u5BF9\u8BBA\u5BFC\u5F39 / \u8F68\u9053\u53D1\u5C04\u5668";
    let t = new T(-145, 55, 105), n = i.clone().sub(t).normalize(), s = new Wt().setFromUnitVectors(new T(1, 0, 0), n);
    e.position.copy(t), e.quaternion.copy(s);
    let r = i.distanceTo(t), a = (L, k = 0, $ = 0) => new T(L, k, $).applyQuaternion(s).add(t), o = (L, k, $) => {
      let pe = Tn.clamp(($ - L) / (k - L), 0, 1);
      return pe * pe * (3 - 2 * pe);
    }, l = (L) => Math.max(0, L), c = 0, h = new bt({ color: 12766164, metalness: 0.74, roughness: 0.31 }), d = new bt({ color: 2108224, metalness: 0.8, roughness: 0.4 }), u = new bt({ color: 4148065, metalness: 0.67, roughness: 0.36 }), p = new bt({ color: 1186603, metalness: 0.35, roughness: 0.64 }), g = new bt({ color: 11958586, metalness: 0.83, roughness: 0.28 }), x = new bt({ color: 15055194, metalness: 0.64, roughness: 0.32 }), m = new bt({ color: 13489357, metalness: 0.56, roughness: 0.31 }), f = new yt({ color: 16754749, toneMapped: false }), E = new yt({ color: 6475775, toneMapped: false }), b = new yt({ color: 13234175, toneMapped: false }), _ = new _t();
    _.name = "Orbital split-rail launcher", e.add(_);
    let R = new dn(1, 1, 1), A = new Qt(1, 1, 1, 20);
    A.rotateZ(-Math.PI / 2);
    let P = new on(1, 0.045, 6, 40);
    P.rotateY(Math.PI / 2);
    let I = /* @__PURE__ */ new Map(), v = new Rt(), S = new Wt();
    function D(L, k, $, pe, Ie = S, we = _) {
      let Mt = L + ":" + k.uuid + ":" + we.uuid, Ee = I.get(Mt);
      Ee || (Ee = { kind: L, material: k, holder: we, matrices: [] }, I.set(Mt, Ee)), v.position.set(...$), v.scale.set(...pe), v.quaternion.copy(Ie), v.updateMatrix(), Ee.matrices.push(v.matrix.clone());
    }
    let U = (L, k, $, pe, Ie) => D("box", L, k, $, pe, Ie), X = (L, k, $, pe, Ie = _) => D("cylinder", L, k, [$, pe, pe], S, Ie), J = (L, k, $, pe = _) => D("torus", L, k, [$, $, $], S, pe);
    function K(L, k, $, pe, Ie = _) {
      let we = new T(...k), Mt = new T(...$), Ee = Mt.sub(we), Ve = new Wt().setFromUnitVectors(new T(1, 0, 0), Ee.clone().normalize());
      U(L, we.addScaledVector(Ee, 0.5).toArray(), [Ee.length(), pe, pe], Ve, Ie);
    }
    let Z = (L) => new Wt().setFromAxisAngle(new T(1, 0, 0), L);
    for (let L of [-4.8, 4.8]) {
      U(d, [0, -3.7, L], [74, 1.45, 1.6]), U(h, [0, -2.9, L], [74, 0.33, 1.78]), U(u, [0, 2.7, L], [71, 0.9, 1.2]), U(g, [0, 2.1, L], [70, 0.14, 0.45]), U(f, [0, -2.7, L - Math.sign(L) * 0.65], [69, 0.085, 0.09]);
      for (let k = 0; k < 17; k++) {
        let $ = -33 + k * 4.1;
        U(h, [$, -4.5, L], [1.55, 0.3, 2.15]), U(x, [$, 3.28, L], [0.46, 0.15, 1.3]), U(p, [$, -3.6, L + Math.sign(L) * 0.9], [2.4, 0.85, 0.2]), U(u, [$, -2.1, L - Math.sign(L) * 0.8], [1, 1.3, 0.5]), U(E, [$, -1.7, L - Math.sign(L) * 1.1], [0.65, 0.12, 0.08]);
      }
    }
    for (let L = 0; L < 7; L++) {
      let k = -32 + L * 10.5;
      U(u, [k, -5, 0], [1.9, 1.15, 11.5]), U(h, [k, -5.65, 0], [1.6, 0.2, 13.4]);
      for (let $ of [-1, 1]) {
        U(h, [k, -0.7, $ * 6.1], [1.65, 8.4, 0.85]), U(d, [k, 3.45, $ * 5.2], [1.75, 0.6, 2.6]), U(x, [k + 0.2, -0.7, $ * 6.65], [0.7, 5.8, 0.24]), K(h, [k, -4.9, $ * 6], [k, -7.5, $ * 9.8], 0.65);
        for (let pe = 0; pe < 4; pe++) X(g, [k - 0.92, -4.2 + pe * 2.1, $ * 6.12], 0.14, 0.2);
      }
      if (L < 6) for (let $ of [-1, 1]) K(u, [k, -4.6, $ * 5.9], [k + 10.5, 2.9, $ * 5.9], 0.33), K(u, [k, 2.9, $ * 5.9], [k + 10.5, -4.6, $ * 5.9], 0.33);
    }
    U(d, [-5, -7, 0], [58, 2.3, 5.3]), U(h, [-5, -8.2, 0], [59, 0.22, 5.9]);
    for (let L = 0; L < 13; L++) {
      let k = -31 + L * 4.1;
      U(g, [k, -8.45, 0], [0.24, 0.35, 5.3]), U(f, [k, -6.2, -2.72], [0.8, 0.18, 0.08]), U(f, [k, -6.2, 2.72], [0.8, 0.18, 0.08]);
    }
    for (let L = 0; L < 4; L++) {
      let k = -24 + L * 15.2;
      for (let $ of [-1, 1]) {
        let pe = $ * 0.36, Ie = Z(pe), we = $ * 12.7;
        U(h, [k, -7.5, we], [12, 0.45, 9.8], Ie), U(p, [k, -7.15, we], [11.25, 0.22, 9.2], Ie);
        for (let Mt = 0; Mt < 14; Mt++) U(g, [k - 5.2 + Mt * 0.8, -6.94, we], [0.07, 0.06, 8.6], Ie);
        U(g, [k, -6.85, we], [11.4, 0.12, 0.35], Ie), U(f, [k, -6.7, we + $ * 4.45], [10.6, 0.045, 0.07], Ie);
      }
    }
    U(u, [-31.5, -10.4, 0], [13, 4.5, 12]), U(m, [-32, -12.8, 0], [12.7, 0.35, 11.4]), U(d, [-38.1, -10.4, 0], [0.5, 3.8, 10.1]);
    for (let L of [-1, 1]) {
      U(h, [-26, -10.2, L * 9.9], [21, 0.7, 4]);
      for (let k = 0; k < 6; k++) {
        let $ = -35 + k * 3.6;
        X(d, [$, -9.6, L * 9.9], 2.9, 1.65), X(x, [$ - 1.1, -9.6, L * 9.9], 0.36, 1.75), X(h, [$ + 1.1, -9.6, L * 9.9], 0.3, 1.75), J(f, [$ + 1.29, -9.6, L * 9.9], 1.46), K(g, [$, -9.6, L * 8.3], [$, -7, L * 5.2], 0.22);
      }
      for (let k = 0; k < 4; k++) U(E, [-36 + k * 2.1, -9.4, L * 6.07], [0.8, 0.22, 0.08]);
      K(h, [-33, -11.5, L * 5.3], [-40, -16, L * 12.5], 0.35), U(u, [-40, -16, L * 12.5], [3.5, 1.2, 2.5]), U(f, [-41.8, -15.6, L * 12.5], [0.1, 0.2, 1.4]);
    }
    K(h, [-33, -9, 0], [-38, 4.8, 0], 0.25), J(g, [-38, 5.3, 0], 1.6), X(u, [-38, 5.3, 0], 0.42, 0.7), U(f, [-38, 7, 0], [0.32, 0.25, 0.32]);
    for (let L of [28.5, 33, 37.5]) {
      for (let k = 0; k < 8; k++) {
        let $ = k / 8 * Math.PI * 2;
        U(h, [L, Math.sin($) * 5.4, Math.cos($) * 5.4], [1.2, 1.7, 1], Z(-$)), U(x, [L + 0.65, Math.sin($) * 5.4, Math.cos($) * 5.4], [0.12, 1.32, 0.82], Z(-$));
      }
      J(E, [L, 0, 0], 4.8), J(u, [L - 0.2, 0, 0], 5.4);
    }
    let ee = new yt({ color: 16777215, transparent: true, opacity: 0.4, blending: ot, depthWrite: false, toneMapped: false }), H = new on(3.8, 0.045, 5, 40);
    H.rotateY(Math.PI / 2);
    let re = new Nt(H, ee, 20), oe = new Ge();
    for (let L = 0; L < 20; L++) v.position.set(-32 + L * 3.5, 0, 0), v.quaternion.identity(), v.scale.setScalar(1), v.updateMatrix(), re.setMatrixAt(L, v.matrix), re.setColorAt(L, oe.setRGB(0.07, 0.2, 0.3));
    re.name = "Sequential induction field", _.add(re);
    let me = [], He = new dn(1, 1, 1);
    for (let L of [-5.8, 5.8]) for (let k of [-1, 1]) {
      let $ = new _t();
      $.position.set(L, -2.1, k * 3);
      let pe = new Je(He, h);
      pe.position.set(0, 0.25, -k * 0.7), pe.scale.set(1.5, 0.65, 2.1);
      let Ie = new Je(He, p);
      Ie.position.set(0, 0.85, -k * 1.55), Ie.scale.set(1.8, 1, 0.6);
      let we = new Je(He, f);
      we.position.set(0, 1.39, -k * 1.55), we.scale.set(1.1, 0.08, 0.5), $.add(pe, Ie, we), _.add($), me.push({ pivot: $, side: k });
    }
    let xe = new _t();
    xe.name = "Asterion / relativistic penetrator", e.add(xe), X(p, [0, 0, 0], 20, 0.94, xe);
    let tt = [-7.4, -4, -0.6, 2.8, 6.2];
    for (let L = 0; L < tt.length; L++) {
      let k = tt[L];
      X(L === 0 ? u : m, [k, 0, 0], 2.82, 1.05 + (L === 0 ? 0.14 : 0), xe), X(g, [k - 1.46, 0, 0], 0.14, 1.16, xe), X(d, [k + 1.42, 0, 0], 0.19, 1.15, xe), J(E, [k + 1.54, 0, 0], 1.1, xe);
      for (let $ = 0; $ < 8; $++) {
        let pe = $ * Math.PI / 4;
        U(u, [k, Math.sin(pe) * 1.07, Math.cos(pe) * 1.07], [2.37, 0.39, 0.1], Z(-pe), xe), U(x, [k - 0.8, Math.sin(pe) * 1.13, Math.cos(pe) * 1.13], [0.19, 0.37, 0.1], Z(-pe), xe), $ % 2 === 0 && U(E, [k + 0.63, Math.sin(pe) * 1.14, Math.cos(pe) * 1.14], [0.5, 0.16, 0.07], Z(-pe), xe);
      }
    }
    for (let L = 0; L < 4; L++) {
      let k = (L + 0.5) * Math.PI / 2;
      K(g, [-8.8, Math.sin(k) * 1.16, Math.cos(k) * 1.16], [7.8, Math.sin(k) * 1.16, Math.cos(k) * 1.16], 0.065, xe);
    }
    let rt = new Qt(0.13, 0.98, 3.7, 24);
    rt.rotateZ(-Math.PI / 2);
    let te = new Je(rt, h);
    te.position.x = 9.35, xe.add(te), X(x, [7.55, 0, 0], 0.24, 1.1, xe), X(u, [10.9, 0, 0], 0.6, 0.3, xe), J(E, [10.7, 0, 0], 0.36, xe), X(b, [11.25, 0, 0], 0.28, 0.16, xe), X(d, [-9.65, 0, 0], 1.6, 1.38, xe), X(g, [-10.4, 0, 0], 0.35, 1.49, xe), J(b, [-10.75, 0, 0], 0.88, xe);
    for (let L = 0; L < 6; L++) {
      let k = -10.6 - L * 0.82, $ = 1.1 + L * 0.19;
      J(h, [k, 0, 0], $ + 0.14, xe), J(E, [k - 0.09, 0, 0], $, xe);
      for (let pe = 0; pe < 4; pe++) {
        let Ie = Math.PI * pe / 2;
        U(d, [k, Math.sin(Ie) * ($ + 0.15), Math.cos(Ie) * ($ + 0.15)], [0.4, 0.3, 0.6], Z(-Ie), xe);
      }
    }
    for (let L = 0; L < 6; L++) {
      let k = Math.PI * L / 3;
      K(g, [-10.5, Math.sin(k) * 1.2, Math.cos(k) * 1.2], [-14.8, Math.sin(k) * 2.1, Math.cos(k) * 2.1], 0.1, xe);
    }
    let ae = new st({ uniforms: { uTime: { value: 0 }, uPower: { value: 0.45 }, uColor: { value: new Ge(5680383) } }, vertexShader: `varying vec3 vLocal; varying vec3 vNormal; varying vec3 vView;
      void main(){ vLocal=position; vec4 mv=modelViewMatrix*vec4(position,1.0); vView=-mv.xyz;
      vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*mv; }`, fragmentShader: `uniform float uTime; uniform float uPower; uniform vec3 uColor;
      varying vec3 vLocal; varying vec3 vNormal; varying vec3 vView;
      float hex(vec2 p){p=abs(p);return max(dot(p,normalize(vec2(1.0,1.732))),p.x);}
      void main(){ float fres=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),2.5);
      vec2 uv=vLocal.yz*9.0; vec2 h=vec2(1.0,1.732); vec2 a=mod(uv,h)-h*.5; vec2 b=mod(uv+h*.5,h)-h*.5;
      vec2 p=dot(a,a)<dot(b,b)?a:b; float cells=1.0-smoothstep(.42,.49,hex(p));
      float line=1.0-smoothstep(.015,.05,abs(hex(p)-.45));
      float scan=pow(max(0.0,sin(length(vLocal.yz)*29.0-uTime*3.1)),22.0);
      float alpha=(.018+fres*.28+line*.055+scan*.12)*uPower;
      gl_FragColor=vec4(uColor*(.55+fres*.9+scan*.8),alpha); }`, transparent: true, depthWrite: false, side: wt, blending: ot, toneMapped: false }), be = new Zt(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.46);
    be.rotateZ(-Math.PI / 2);
    let ze = new _t();
    ze.name = "Seven forward debris-deflection layers", xe.add(ze);
    let Be = new yt({ color: 7834623, transparent: true, opacity: 0.4, depthWrite: false, blending: ot, toneMapped: false });
    for (let L = 0; L < 7; L++) {
      let k = new Je(be, ae), $ = 1.45 + L * 0.41;
      k.position.x = 12.3 + L * 1.8, k.scale.set(0.9 + L * 0.12, $, $), ze.add(k);
      let pe = new Je(P, Be);
      pe.position.x = k.position.x + (0.9 + L * 0.12) * Math.cos(Math.PI * 0.46), pe.scale.setScalar($ * Math.sin(Math.PI * 0.46)), ze.add(pe);
    }
    let lt = [];
    for (let L = 0; L < 6; L++) {
      let k = L * Math.PI / 3, $ = [];
      for (let pe = 0; pe < 24; pe++) {
        let Ie = pe / 23;
        $.push(new T(11.3 + 12.4 * Ie, Math.sin(k) * (0.1 + 3.7 * Ie), Math.cos(k) * (0.1 + 3.7 * Ie)));
      }
      lt.push(...$.flatMap((pe, Ie) => Ie < $.length - 1 ? [pe, $[Ie + 1]] : []));
    }
    let Dt = new mt().setFromPoints(lt), C = new Sn({ color: 7431679, transparent: true, opacity: 0.18, depthWrite: false, blending: ot, toneMapped: false });
    xe.add(new Kn(Dt, C));
    let ut = new _t();
    ut.position.x = -12.8, xe.add(ut);
    function je(L, k, $ = 52) {
      let pe = [], Ie = [], we = [];
      for (let Ve = 0; Ve <= $; Ve++) {
        let ht = Ve / $, ie = k * (0.13 + Math.sin(Math.PI * Math.pow(ht, 0.55)) * 0.87) * (1 - ht * 0.55);
        for (let le = 0; le <= 20; le++) {
          let ne = le / 20 * Math.PI * 2;
          if (pe.push(-ht * L, Math.cos(ne) * ie, Math.sin(ne) * ie), Ie.push(ht, le / 20), Ve < $ && le < 20) {
            let Re = Ve * 21 + le;
            we.push(Re, Re + 1, Re + 20 + 1, Re + 1, Re + 20 + 2, Re + 20 + 1);
          }
        }
      }
      let Ee = new mt();
      return Ee.setAttribute("position", new nt(pe, 3)), Ee.setAttribute("uv", new nt(Ie, 2)), Ee.setIndex(we), Ee.computeVertexNormals(), Ee;
    }
    let We = new st({ uniforms: { uTime: { value: 0 }, uPower: { value: 0.05 } }, vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `uniform float uTime; uniform float uPower; varying vec2 vUv;
      void main(){float u=vUv.x; float diamonds=pow(max(0.,sin(u*48.0-uTime*8.0)),7.0);
      float streak=.65+.35*sin(vUv.y*75.4+u*31.-uTime*10.);
      float fade=pow(1.-u,1.6)*smoothstep(0.,.04,u);
      vec3 c=mix(vec3(.72,.92,1.5),vec3(.14,.25,1.2),smoothstep(.05,.8,u));
      gl_FragColor=vec4(c*(.8+diamonds*1.8),fade*(.12+diamonds*.45)*streak*uPower);}`, transparent: true, depthWrite: false, side: wt, blending: ot, toneMapped: false }), Pe = new Je(je(42, 2.6), We), gt = new Je(je(34, 0.85), We);
    gt.rotation.x = 0.63, ut.add(Pe, gt);
    let Te = new Qt(0.04, 0.42, 28, 12, 1, true);
    Te.rotateZ(Math.PI / 2);
    let Ye = new yt({ color: 11135487, transparent: true, opacity: 0.05, blending: ot, depthWrite: false, toneMapped: false }), Et = new Je(Te, Ye);
    Et.position.x = -14, ut.add(Et);
    let vt = 420, w = new mt(), y = new Float32Array(vt * 3), V = new Float32Array(vt * 3);
    for (let L = 0; L < vt; L++) y.set([L * 0.754877666 % 1, L * 0.569840296 % 1, L * 0.438289 % 1], L * 3);
    w.setAttribute("position", new It(V, 3)), w.setAttribute("aSeed", new It(y, 3));
    let Q = new st({ uniforms: { uTime: { value: 0 }, uPower: { value: 0.1 } }, vertexShader: `attribute vec3 aSeed; uniform float uTime; uniform float uPower; varying float vAlpha;
      void main(){float t=fract(aSeed.x+uTime*(.7+aSeed.z*.6));float a=aSeed.y*6.283;
      float r=(.2+t*4.)*sqrt(aSeed.z);vec3 p=vec3(-t*(28.+uPower*24.),cos(a)*r,sin(a)*r);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp((.9+aSeed.z*1.7)*100./max(1.,-mv.z),1.,14.);vAlpha=pow(1.-t,2.)*uPower;}`, fragmentShader: `varying float vAlpha; void main(){float r=length(gl_PointCoord-.5);float a=exp(-r*r*22.)*vAlpha;
      if(r>.5)discard;gl_FragColor=vec4(.36,.68,1.25,a);}`, transparent: true, depthWrite: false, blending: ot, toneMapped: false }), se = new En(w, Q);
    se.frustumCulled = false, ut.add(se);
    let j = new _t();
    xe.add(j);
    let Ue = new Wn(1, 0), _e = new bt({ color: 7367803, metalness: 0.1, roughness: 0.94 }), Ne = new Nt(Ue, _e, 14);
    Ne.frustumCulled = false, j.add(Ne);
    let Fe = new mt(), he = new Float32Array(84);
    Fe.setAttribute("position", new It(he, 3));
    let ye = new Sn({ color: 7719679, transparent: true, opacity: 0.4, depthWrite: false, blending: ot, toneMapped: false }), qe = new Kn(Fe, ye);
    qe.frustumCulled = false, j.add(qe);
    let Oe = new yt({ color: 12377855, transparent: true, opacity: 0.3, depthWrite: false, blending: ot, toneMapped: false }), ve = new Nt(new Zt(1, 8, 6), Oe, 14);
    ve.frustumCulled = false, j.add(ve);
    let Ke = new yt({ color: 7592191, transparent: true, opacity: 0, depthWrite: false, blending: ot, side: wt, toneMapped: false }), N = new jn(3, 3.8, 64);
    N.rotateY(Math.PI / 2);
    let de = new Je(N, Ke);
    de.position.x = 38.1, e.add(de);
    for (let L of I.values()) {
      let k = L.kind === "box" ? R : L.kind === "cylinder" ? A : P, $ = new Nt(k, L.material, L.matrices.length);
      L.matrices.forEach((pe, Ie) => $.setMatrixAt(Ie, pe)), $.instanceMatrix.needsUpdate = true, $.computeBoundingSphere(), L.holder.add($);
    }
    let z = new hi(6732543, 1, 18, 1.5);
    z.position.x = -12, xe.add(z);
    let q = false;
    function B({ time: L = 0, shotTime: k = -1, selected: $ = false, quality: pe = "high" } = {}) {
      let Ie = k >= 0, we = Ie ? k : -1, Mt = Ie ? o(0, 4.5, we) * (1 - o(5.8, 7, we)) : 0, Ve = Ie && we >= 5 && we < 10, ht = o(5, 6, we), ie = 0;
      we >= 5 && we < 6 ? ie = ht * 48 : we >= 6 && (ie = 48 + (r - 17 - 11.25 - 48) * Math.pow(Tn.clamp((we - 6) / 4, 0, 1), 1.65)), c = ie, xe.position.x = ie, xe.visible = !Ie || we < 10;
      let le = Ve ? 0.45 + o(5, 7.8, we) * 0.9 : we >= 0 && we < 5 ? 0.04 + Mt * 0.14 : 0.035;
      We.uniforms.uTime.value = L, We.uniforms.uPower.value = le, Q.uniforms.uTime.value = L, Q.uniforms.uPower.value = le, ut.scale.x = Ve ? 0.7 + o(5, 9, we) * 0.9 : 0.22, ut.scale.y = ut.scale.z = Ve ? 0.85 + le * 0.27 : 0.45, Ye.opacity = Ve ? 0.34 + le * 0.25 : 0.02, z.intensity = Ve ? 7 + le * 6 : 0.45, se.visible = pe === "high" || Ve, ae.uniforms.uTime.value = L, ae.uniforms.uPower.value = Ve ? 0.85 + o(5, 7, we) * 0.55 : $ ? 0.62 : 0.4, Be.opacity = Ve ? 0.65 : $ ? 0.27 : 0.16, C.opacity = Ve ? 0.24 : 0.075;
      for (let { pivot: Re, side: ke } of me) Re.rotation.x = ke * o(4.7, 5.35, we) * 0.95;
      ee.opacity = 0.14 + Mt * 0.58;
      for (let Re = 0; Re < 20; Re++) {
        let ke = Math.pow(Math.max(0, Math.sin(Re * 0.48 - L * (1 + Mt * 7))), 8), Se = 0.1 + Mt * (0.5 + ke * 1.7);
        oe.setRGB(Se * 0.25, Se * 0.7, Se), re.setColorAt(Re, oe);
      }
      re.instanceColor && (re.instanceColor.needsUpdate = true);
      let ne = Ve ? Math.exp(-Math.pow((we - 5.95) * 4, 2)) : 0;
      Ke.opacity = ne * 0.7, de.scale.setScalar(1 + l(we - 5.9) * 2.4), de.visible = ne > 5e-3, j.visible = $ || Ve, ye.opacity = Ve ? 0.7 : 0.23, Oe.opacity = Ve ? 0.75 : 0.35;
      for (let Re = 0; Re < 14; Re++) {
        let ke = (L * (Ve ? 0.42 : 0.09) + Re * 0.2871) % 1, Se = Re * 2.399963, Ce = o(0.48, 1, ke), Xe = 2.7 + Ce * (7 + Re % 4), ct = 39 - ke * 29, Ct = Math.cos(Se) * Xe, at = Math.sin(Se) * Xe, M = (0.13 + Re % 3 * 0.045) * (Ve ? 1.3 : 1);
        v.position.set(ct, Ct, at), v.rotation.set(L * 0.6 + Re, Re * 1.1, L * 0.3), v.scale.set(M, M * 0.65, M * 1.3), v.updateMatrix(), Ne.setMatrixAt(Re, v.matrix);
        let O = Math.exp(-Math.pow((ke - 0.52) * 25, 2));
        v.position.set(23.8, Math.cos(Se) * 3, Math.sin(Se) * 3), v.scale.setScalar(0.015 + O * 0.5), v.updateMatrix(), ve.setMatrixAt(Re, v.matrix);
        let G = Re * 6;
        he[G] = ct, he[G + 1] = Ct, he[G + 2] = at, he[G + 3] = ct + (Ce > 0.02 ? 1.6 : 0.5), he[G + 4] = Ct - Math.cos(Se) * Ce * 1.4, he[G + 5] = at - Math.sin(Se) * Ce * 1.4;
      }
      Ne.instanceMatrix.needsUpdate = true, ve.instanceMatrix.needsUpdate = true, Fe.attributes.position.needsUpdate = true;
    }
    function W() {
      B({ time: 0, shotTime: -1, selected: false, quality: "high" });
    }
    function ce() {
      if (q) return;
      q = true;
      let L = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Set();
      e.traverse(($) => {
        $.geometry && L.add($.geometry), $.material && (Array.isArray($.material) ? $.material : [$.material]).forEach((pe) => k.add(pe));
      }), L.forEach(($) => $.dispose()), k.forEach(($) => $.dispose()), e.removeFromParent();
    }
    return W(), { id: "missile", group: e, focus: a(-2, -3, 0), cameraOffset: new T(62, 46, 90), detailFocus: a(2.5, 0, 0), detailOffset: new T(16, 19, 39), muzzle: a(38, 0, 0), duration: 24, impactAt: 10, update: B, reset: W, dispose: ce, getFlightFocus: () => a(c, 0, 0), userData: { modelLength: 74, missileLength: 26, shieldLayers: 7, reference: "segmented axial projectile with open magnetic nozzle" } };
  }
  function eh({ target: i }) {
    let n = Math.hypot(i.x, i.z), s = Math.atan2(i.z, i.x) + Math.acos(178 / n), r = new T(Math.cos(s) * 178, -9, Math.sin(s) * 178), a = i.clone().sub(r).normalize(), o = 42, l = Math.PI * 2 * 178, c = r.distanceTo(i) - o - 16.5, h = new _t();
    h.name = "ULTRARELATIVISTIC_ELECTRON_RING";
    let d = new Wt().setFromUnitVectors(new T(0, 0, 1), a), u = { shell: new bt({ color: 3222869, metalness: 0.76, roughness: 0.32, emissive: 1050910, emissiveIntensity: 0.22 }), armor: new bt({ color: 8028571, metalness: 0.82, roughness: 0.27 }), dark: new bt({ color: 1121068, metalness: 0.65, roughness: 0.47 }), copper: new bt({ color: 11038547, metalness: 0.88, roughness: 0.29 }), panel: new bt({ color: 1387076, metalness: 0.58, roughness: 0.38, emissive: 267562, emissiveIntensity: 0.35, side: wt }), violet: new yt({ color: 10583295, toneMapped: false }), cyan: new yt({ color: 6347775, toneMapped: false }), amber: new yt({ color: 16759906, toneMapped: false }), white: new yt({ color: 14282751, toneMapped: false }) }, p = new Rt(), g = new Ge(), x = /* @__PURE__ */ new Map(), m = (z, q, B) => (x.has(z) || x.set(z, { geometry: q, material: B, entries: [] }), x.get(z)), f = "ring", E = new Rt(), b = new Tt(), _ = (z, q, B, W, ce = 1, L = 1, k = 1, $ = 0, pe = 0, Ie = 0) => {
      if (f === "ring") {
        const arc=((W%l)+l)%l;if(arc<72||arc>l-22)return;
        let we = s + (l - W) / 178;
        E.position.set(Math.cos(we) * 178, -9, Math.sin(we) * 178), E.rotation.set(0, Math.PI - we, 0), p.position.set(q, B, 0);
      } else E.position.copy(r), E.quaternion.copy(d), p.position.set(q, B, W - l);
      E.scale.set(1, 1, 1), E.updateMatrix(), p.rotation.set($, pe, Ie), p.scale.set(ce, L, k), p.updateMatrix(), z.entries.push(b.multiplyMatrices(E.matrix, p.matrix).clone());
    }, R = (z, q, B, W = 16, ce = false) => new Qt(z, q, B, W, 1, ce).rotateX(Math.PI / 2), A = (z, q = 0.15, B = 32) => new on(z, q, 6, B), P = new dn(1, 1, 1), I = m("chassis", R(2.8, 2.8, 1, 12, true), u.shell), v = m("internal", R(2.25, 2.25, 1, 12, true), u.dark), S = m("edges", A(2.85, 0.22), u.armor), D = m("lenses", A(3.6, 0.32, 40), u.armor), U = m("lensCores", A(3.05, 0.13, 40), new yt({ color: 16777215, toneMapped: false })), X = m("lensYokes", P, u.dark), J = m("copperClamps", P, u.copper), K = m("ribs", P, u.armor), Z = m("panelRibs", P, u.copper), ee = m("serviceBoxes", P, u.dark), H = m("panels", P, u.panel), re = m("vents", P, u.dark), oe = m("windows", P, u.cyan), me = m("markings", P, u.amber), He = m("largeShells", R(6.3, 6.3, 1, 12, true), u.shell), xe = m("largeRims", A(6.4, 0.38, 48), u.armor), tt = m("hubLights", A(6.5, 0.09, 48), u.cyan), rt = m("nozzleShells", R(7.2, 6.2, 1, 16, true), u.dark), te = m("nozzleRings", A(7.6, 0.35, 48), u.armor), ae = m("nozzleLights", A(6.3, 0.13, 48), u.violet), be = 144, ze = l / be, Be = [];
    for (let z = 0; z < be; z++) {
      let q = z * ze;
      Be.push(q), _(I, 0, 0, q, 1, 1, ze * 0.68), _(v, 0, 0, q, 1, 1, ze * 0.98), _(S, 0, 0, q - ze * 0.33), _(S, 0, 0, q + ze * 0.33), _(D, 0, 0, q), _(U, 0, 0, q + 0.55);
      for (let W = 0; W < 8; W++) {
        let ce = W * Math.PI / 4, L = Math.cos(ce), k = Math.sin(ce);
        _(X, L * 3.54, k * 3.54, q, 1.2, 0.84, 1.95, 0, 0, ce), _(J, L * 3.92, k * 3.92, q, 0.25, 0.72, 1.35, 0, 0, ce), _(K, L * 2.85, k * 2.85, q, 0.16, 0.38, ze * 0.6, 0, 0, ce);
      }
      let B = z % 2 ? 1 : -1;
      _(ee, B * 4.25, 0, q + 1.65, 1.4, 2.2, 2.8), _(oe, B * 5, 0.3, q + 1.65, 0.08, 0.3, 1.3), _(me, 0, 3.02, q + ze * 0.23, 0.75, 0.08, 0.28);
    }
    for (let z = 0; z < 4; z++) {
      let q = Math.PI / 4 + z * Math.PI / 2, B = Math.cos(q) * 5.2, W = Math.sin(q) * 5.2, ce = new Je(new on(178 - B, 0.23, 6, 384,Math.PI*2-94/178).rotateZ(s+22/178), u.copper);
      ce.rotation.x = Math.PI / 2, ce.position.y = -9 + W, h.add(ce);
      let L = new Je(new on(178 - B - 0.12, 0.055, 4, 384,Math.PI*2-94/178).rotateZ(s+22/178), u.cyan);
      L.rotation.x = Math.PI / 2, L.position.y = -9 + W + 0.12, h.add(L);
      for (let k = 0; k < be; k += 2) {
        let $ = k * ze;
        _(K, B * 0.84, W * 0.84, $, 0.3, 2.7, 0.3, 0, 0, q - Math.PI / 2);
      }
    }
    let lt = [];
    for (let z = 0; z < 12; z++) {
      let q = 22 + l * z / 12;
      lt.push(q);
      let B = z === 3 || z === 9 ? 24 : 17;
      _(He, 0, 0, q, 1, 1, 5.6), _(xe, 0, 0, q - 2.9), _(xe, 0, 0, q + 2.9), _(tt, 0, 0, q - 2.4), _(tt, 0, 0, q + 2.4);
      for (let W = 0; W < 4; W++) {
        let ce = W * Math.PI / 2 + (z % 2 ? Math.PI / 4 : 0), L = Math.cos(ce), k = Math.sin(ce);
        _(K, L * (B / 2 + 5.8), k * (B / 2 + 5.8), q, B, 0.55, 8.3, 0, 0, ce), _(H, L * (B / 2 + 5.8), k * (B / 2 + 5.8), q, B - 0.7, 0.65, 7.6, 0, 0, ce);
        for (let pe = 0; pe <= 6; pe++) {
          let Ie = 6 + pe * (B - 0.6) / 6;
          _(Z, L * Ie, k * Ie, q, 0.16, 0.78, 7.8, 0, 0, ce);
        }
        for (let pe of [-3.95, 3.95]) _(K, L * (B / 2 + 5.8), k * (B / 2 + 5.8), q + pe, B, 0.92, 0.25, 0, 0, ce), _(oe, L * (B / 2 + 5.8), k * (B / 2 + 5.8), q + pe * 1.04, B * 0.88, 0.18, 0.07, 0, 0, ce);
        let $ = B + 5.6;
        _(me, L * $, k * $, q, 0.6, 0.85, 7.5, 0, 0, ce);
        for (let pe of [-7.1, 7.1]) {
          _(ee, L * 6, k * 6, q + pe, 2.6, 3.3, 5.2, 0, 0, ce);
          for (let Ie = 0; Ie < 4; Ie++) _(re, L * 7.72, k * 7.72, q + pe + (Ie - 1.5) * 0.75, 0.12, 2.7, 0.2, 0, 0, ce);
          _(oe, L * 7.45, k * 7.45, q + pe - 2.05, 0.09, 2.3, 0.24, 0, 0, ce);
        }
      }
    }
    for (let z of [4, l * 0.43, l * 0.57]) {
      _(ee, 0, -9, z, 8.6, 5, 12.3), _(K, -3, -5.3, z, 0.7, 5.2, 0.7), _(K, 3, -5.3, z, 0.7, 5.2, 0.7), _(I, 0, -9, z, 1.35, 1.35, 15.2);
      for (let q = 0; q < 7; q++) _(oe, -2.7 + q * 0.9, -11.56, z + 3.4, 0.48, 0.07, 1.6);
      _(me, 0, -11.6, z - 3.1, 5.2, 0.06, 0.5);
    }
    const extraction=createElectronExtraction({junction:r,target:i});h.add(extraction.group);c=extraction.muzzle.distanceTo(i)-16.5;
    let Dt = {};
    for (let [z, q] of x) {
      let B = new Nt(q.geometry, q.material, q.entries.length);
      B.name = `accelerator_${z}`;
      for (let W = 0; W < q.entries.length; W++) B.setMatrixAt(W, q.entries[W]);
      B.instanceMatrix.needsUpdate = true, h.add(B), Dt[z] = B;
    }
    for (let z = 0; z < Dt.lensCores.count; z++) Dt.lensCores.setColorAt(z, new Ge(1065567));
    let C = 560, ut = new mt(), je = new Float32Array(C * 3), We = new Float32Array(C * 3);
    for (let z = 0; z < C; z++) {
      let q = z * 0.61803398875 % 1;
      We[z * 3] = q, We[z * 3 + 1] = z * 0.754877666 % 1, We[z * 3 + 2] = z * 0.569840291 % 1;
    }
    ut.setAttribute("position", new It(je, 3)), ut.setAttribute("aSeed", new It(We, 3));
    let Pe = new st({ transparent: true, depthWrite: false, blending: ot, toneMapped: false, uniforms: { uTime: { value: 0 }, uCharge: { value: 0 }, uLength: { value: l }, uRadius: { value: 178 }, uExit: { value: s }, uHeight: { value: -9 }, uPixelRatio: { value: 1.4 } }, vertexShader: `
      attribute vec3 aSeed;
      uniform float uTime, uCharge, uLength, uRadius, uExit, uHeight, uPixelRatio;
      varying float vAlpha, vHue;
      void main(){
        float progress=fract(aSeed.x+uTime*(0.09+uCharge*0.4));
        float angle=aSeed.y*6.2831853+uTime*2.0;
        float r=0.45+1.0*aSeed.z;
        float theta=uExit+(1.0-progress)*6.2831853;
        float rr=uRadius-cos(angle)*r;
        vec3 p=vec3(cos(theta)*rr,uHeight+sin(angle)*r,sin(theta)*rr);
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp((2.0+uCharge*3.0)*uPixelRatio*95.0/max(8.0,-mv.z),1.0,8.0);
        vAlpha=(0.05+uCharge*0.95)*pow(sin(progress*3.14159),0.3);
        vHue=aSeed.z;
      }`, fragmentShader: `
      varying float vAlpha, vHue;
      void main(){
        float d=length(gl_PointCoord-0.5)*2.0;
        float a=pow(max(0.0,1.0-d),2.0)*vAlpha;
        gl_FragColor=vec4(mix(vec3(0.25,0.66,1.0),vec3(0.8,0.45,1.0),vHue)*1.5,a);
      }` }), gt = new En(ut, Pe);
    gt.frustumCulled = false, gt.name = "internal_electron_packets", h.add(gt);
    let Te = new yt({ color: 10075391, transparent: true, opacity: 0.6, depthWrite: false, blending: ot, toneMapped: false }), Ye = new Nt(new Zt(1, 10, 6), Te, 12);
    Ye.name = "circulating_bunch_monitors", Ye.frustumCulled = false, h.add(Ye);
    let Et = new st({ transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false, uniforms: { uTime: { value: 0 }, uPower: { value: 0 } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}", fragmentShader: `
      varying vec2 vUv; uniform float uTime,uPower;
      void main(){
        vec2 p=vUv*2.0-1.0; float r=length(p);
        float core=pow(max(0.0,1.0-r),3.0);
        float rings=pow(max(0.0,1.0-abs(r-0.73)*20.0),2.0);
        float stripes=0.65+0.35*sin(atan(p.y,p.x)*24.0-uTime*3.0);
        float a=(core*1.2+rings*stripes*.55)*uPower;
        gl_FragColor=vec4(mix(vec3(.37,.15,1.2),vec3(.76,1.,1.4),core),a);
      }` }), vt = new Je(new qi(9, 9), Et);
    vt.position.copy(extraction.muzzle), vt.quaternion.copy(extraction.orientation), h.add(vt);
    let w = new _t();
    w.name = "electron_extraction_beam", w.position.copy(extraction.muzzle), w.quaternion.copy(extraction.orientation), h.add(w);
    let y = new Qt(1, 1, 1, 16, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5), V = (z, q, B = false) => new st({ transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false, uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uColor: { value: new Ge(z) }, uOpacity: { value: q }, uCore: { value: B ? 1 : 0 } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}", fragmentShader: `
      varying vec2 vUv;uniform float uTime,uPower,uOpacity,uCore;uniform vec3 uColor;
      void main(){
        float pulses=0.72+0.28*sin(vUv.y*180.0-uTime*40.0);
        float longitudinal=smoothstep(0.,.02,vUv.y)*(1.0-smoothstep(.97,1.,vUv.y));
        float profile=pow(abs(sin(vUv.x*6.2831853)),1.4);
        float a=(0.16+profile*.84)*pulses*longitudinal*uPower*uOpacity;
        gl_FragColor=vec4(uColor*(1.2+uCore),a);
      }` }), Q = [V(15656703, 0.94, true), V(6666239, 0.38), V(9126399, 0.11)], se = Q.map((z, q) => {
      let B = new Je(y, z), W = [0.17, 0.6, 1.65][q];
      return B.scale.set(W, W, c), B.frustumCulled = false, w.add(B), B;
    }), j = new yt({ color: 14081023, transparent: true, opacity: 0.8, blending: ot, depthWrite: false, toneMapped: false }), Ue = new Nt(new Zt(1, 8, 6), j, 14);
    Ue.frustumCulled = false, w.add(Ue);
    let _e = extraction.muzzle, Ne = new T(0, -9, 0), Fe = new T(a.z, 0, -a.x).normalize(), he = new T(240, 340, 335), ye = extraction.focus, qe = extraction.cameraOffset, Oe = (z) => Math.min(1, Math.max(0, z)), ve = (z) => (z = Oe(z), z * z * (3 - 2 * z));
    function Ke({ time: z = 0, shotTime: q = -1, selected: B = false, quality: W = "high" } = {}) {
      let ce = q >= 0, L = ce ? q : 0, k = ce ? ve(L / 7) * (1 - ve((L - 17) / 3)) : 0, $ = ce ? ve((L - 7) / 1.1) * (1 - ve((L - 16) / 1.6)) : 0, pe = ce ? ve((L - 7) / 2) : 0, Ie = ce ? q : z;
      extraction.update(Ie,k,$);
      for (let we = 0; we < Dt.lensCores.count; we++) {
        let Mt = we / (Dt.lensCores.count - 1), Ee = ce ? ve((L / 7 - Mt) * 5 + 0.5) : 0, Ve = Math.pow(Math.max(0, Math.sin(z * 1.2 - we * 0.3)), 10), ht = ce ? 0.55 + 0.45 * Math.sin(Ie * 12 - we * 0.7) ** 2 : 0.2 + Ve * 0.3, ie = 0.15 + Ee * k * ht * 1.7 + (B ? 0.08 : 0);
        g.setRGB(0.24 * ie, 0.63 * ie, ie), Dt.lensCores.setColorAt(we, g);
      }
      Dt.lensCores.instanceColor.needsUpdate = true, Pe.uniforms.uTime.value = Ie, Pe.uniforms.uCharge.value = k, Pe.uniforms.uPixelRatio.value = W === "high" ? 1.7 : 1.25, gt.visible = B || ce, Ye.visible = k > 0.02, Te.opacity = k * 0.68;
      for (let we = 0; we < 12; we++) {
        let Mt = s + Math.PI * 2 * (1 - (Ie * (0.11 + k * 0.29) + we / 12) % 1);
        p.position.set(Math.cos(Mt) * (178 + 5.6), -9 + 3.7, Math.sin(Mt) * (178 + 5.6)), p.rotation.set(0, Math.PI - Mt, 0), p.scale.set(0.48 + k * 0.28, 0.48 + k * 0.28, 3.5 + k * 2.4), p.updateMatrix(), Ye.setMatrixAt(we, p.matrix);
      }
      Ye.instanceMatrix.needsUpdate = true, Et.uniforms.uTime.value = Ie, Et.uniforms.uPower.value = 0.15 + k * 0.95 + $ * 0.75, w.visible = $ > 1e-3;
      for (let we = 0; we < se.length; we++) se[we].scale.z = Math.max(0.01, c * pe), Q[we].uniforms.uTime.value = Ie, Q[we].uniforms.uPower.value = $ * (0.9 + 0.1 * Math.sin(Ie * 44));
      j.opacity = $ * 0.9;
      for (let we = 0; we < 14; we++) {
        let Mt = ((Ie - 7) * 0.8 + we / 14) % 1;
        p.position.set(0, 0, Math.max(0, Mt) * c * pe), p.rotation.set(0, 0, 0);
        let Ee = 0.24 + 0.14 * Math.sin(we * 1.72) ** 2;
        p.scale.set(Ee, Ee, 1.25 + we % 3 * 0.4), p.updateMatrix(), Ue.setMatrixAt(we, p.matrix);
      }
      Ue.instanceMatrix.needsUpdate = true, u.violet.color.setRGB(0.44 + k * 0.55, 0.2 + k * 0.32, 0.8 + k * 0.45);
    }
    function N() {
      Ke({ time: 0, shotTime: -1, selected: false });
    }
    function de() {
      let z = /* @__PURE__ */ new Set(), q = /* @__PURE__ */ new Set();
      h.traverse((B) => {
        B.geometry && z.add(B.geometry), B.material && (Array.isArray(B.material) ? B.material : [B.material]).forEach((W) => q.add(W));
      }), z.forEach((B) => B.dispose()), q.forEach((B) => B.dispose()), h.removeFromParent();
    }
    const ringPivot=new _t(),ringItems=new _t();ringPivot.position.copy(r);ringPivot.quaternion.setFromUnitVectors(new T(Math.sin(s),0,-Math.cos(s)),a);ringItems.position.copy(r).negate();for(const child of [...h.children])if(child!==extraction.group&&child!==vt&&child!==w)ringItems.add(child);ringPivot.add(ringItems);h.add(ringPivot);
    return N(), { id: "accelerator", group: h, focus: Ne, cameraOffset: he, detailFocus: ye, detailOffset: qe, extraction,beam:w,muzzle: _e, duration: 24, impactAt: 9, update: Ke, reset: N, dispose: de };
  }
  function th({ center: i, radius: e = 17, texture: t }) {
    let n = new _t();
    n.name = "Planetary impact effects", n.position.copy(i);
    let s = new _t(), r = new _t(), a = new _t();
    n.add(s, r, a);
    let o = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), c = (Ee) => (o.add(Ee), Ee), h = (Ee) => (l.add(Ee), Ee), d = new T(0, 1, 0), u = new T(), p = new T(), g = new Rt(), x = 51981, m = () => (x = Math.imul(x, 1664525) + 1013904223 >>> 0, x / 4294967296), f = Tn.clamp, E = (Ee, Ve, ht) => Tn.smoothstep(ht, Ee, Ve), b = `
  float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `, _ = "varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}", R = (Ee, Ve = 1) => h(new yt({ color: Ee, transparent: true, opacity: Ve, blending: ot, depthWrite: false, toneMapped: false, side: wt }));
    function A(Ee, Ve, ht, ie = [0, 0, 0]) {
      let le = new Je(Ee, Ve);
      return le.position.set(...ie), ht.add(le), le;
    }
    function P(Ee, Ve, ht, ie) {
      if (!t) return null;
      let le = h(new Ti({ map: t, color: Ve, transparent: true, opacity: ie, blending: ot, depthWrite: false, toneMapped: false })), ne = new Xi(le);
      return ne.position.y = e, ne.scale.set(ht, ht, 1), Ee.add(ne), ne;
    }
    let I = c(new on(1, 0.018, 6, 160)), v = c(new Zt(1, 64, 40)), S = c(new Qt(1, 1, 1, 16, 1, true));
    function D(Ee, Ve, ht, ie) {
      let le = Ve.map((ne, Re) => {
        let ke = A(I, R(ne, 0.8), Ee);
        return ke.rotation.x = Math.PI / 2, { mesh: ke, delay: ht[Re], speed: ie };
      });
      return { update(ne, Re = 1) {
        le.forEach((ke) => {
          let Se = ne - ke.delay, Ce = Se * ke.speed;
          ke.mesh.visible = Se > 0 && Ce < Math.PI;
          let Xe = Math.max(0.01, Math.sin(f(Ce, 0, Math.PI)) * (e + 0.28));
          ke.mesh.position.y = Math.cos(Ce) * (e + 0.28), ke.mesh.scale.setScalar(Xe), ke.mesh.material.opacity = Re * 0.85 * E(0, 0.18, Se) * (1 - E(Math.PI - 0.45, Math.PI, Ce));
        });
      } };
    }
    let U = P(s, 9043886, 25, 0), X = h(new st({ uniforms: { t: { value: 0 }, alpha: { value: 0 } }, vertexShader: _, fragmentShader: `${b}uniform float t,alpha;varying vec3 vP,vN,vV;void main(){float f=pow(max(dot(normalize(vN),normalize(vV)),0.),.8);float n=n3(vP*6.+vec3(0,t*3.,0));vec3 c=mix(vec3(.1,1.2,.4),vec3(2.2,2.5,1.8),n);gl_FragColor=vec4(c,alpha*(.35+.65*f));}`, transparent: true, depthWrite: false, blending: ot, toneMapped: false })), J = A(v, X, s, [0, e + 0.2, 0]);
    J.scale.set(3.5, 1.6, 3.5);
    let K = h(new st({ uniforms: { t: { value: 0 }, alpha: { value: 0 } }, vertexShader: "varying vec3 vP;varying vec2 vUv;varying vec3 vN,vV;void main(){vP=position;vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}", fragmentShader: `${b}uniform float t,alpha;varying vec3 vP,vN,vV;varying vec2 vUv;void main(){float h=vUv.y;float n=n3(vec3(vP.x*4.,h*12.-t*2.,vP.z*4.));float side=pow(abs(dot(normalize(vN),normalize(vV))),.7);float a=pow(1.-h,1.6)*smoothstep(.02,.15,h)*(.25+.75*n)*side;vec3 c=mix(vec3(.16,.65,.38),vec3(1.2,1.65,.72),1.-h);gl_FragColor=vec4(c,a*alpha);}`, transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false })), Z = A(c(new Qt(8, 2.6, 1, 40, 12, true)), K, s), ee = R(16758359, 0.75), H = A(I, ee, s, [0, e + 0.35, 0]);
    H.rotation.x = Math.PI / 2;
    let re = D(s, [16755798, 9174985], [0, 1.4], 0.22), oe = 96, me = R(16759394, 0.7), He = new Nt(S, me, oe);
    s.add(He), He.frustumCulled = false;
    let xe = Array.from({ length: oe }, () => ({ phi: m() * Math.PI * 2, spread: 0.25 + m() * 0.75, speed: 8 + m() * 13, phase: m() * 2.8, length: 1.4 + m() * 4.5 })), tt = c(new Zt(1, 96, 48, 0, Math.PI * 2, 0, Math.PI));
    function rt(Ee) {
      return h(new st({ uniforms: { t: { value: 0 }, alpha: { value: 0 }, layer: { value: Ee } }, vertexShader: _, fragmentShader: `${b}uniform float t,alpha,layer;varying vec3 vP,vN,vV;void main(){vec3 n=normalize(vN),v=normalize(vV);float rim=pow(max(0.,1.-abs(dot(n,v))),2.1);float h=normalize(vP).y;float turbulence=n3(vP*13.+vec3(0,-t*.7,0));float filament=pow(.5+.5*sin(h*49.+turbulence*7.-t*4.),7.);float edge=.18*exp(-abs(h)*12.);vec3 blue=mix(vec3(.05,.5,1.4),vec3(.6,1.6,1.8),rim);vec3 c=mix(blue,vec3(2.6,2.65,1.8),rim*.6+filament*.32);c=mix(c,vec3(2.3,1.3,.16),edge*.8);float a=(.055+rim*.62+filament*.11+edge*.4)*alpha;if(layer<.5){c=mix(vec3(.3,.9,1.35),vec3(1.8,2.1,2.),.6);a=(.08+.19*rim+.08*turbulence)*alpha;}gl_FragColor=vec4(c,a);}`, transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false }));
    }
    let te = A(tt, rt(1), r, [0, e - 1.2, 0]), ae = A(tt, rt(0), r, [0, e - 1.2, 0]), radiationThird=A(tt,rt(2),r,[0,e-1.2,0]), be = R(16768112, 0.85), ze = A(I, be, r, [0, e - 1, 0]);
    ze.rotation.x = Math.PI / 2;
    let Be = P(r, 12119551, 70, 0), lt = h(new st({ uniforms: { alpha: { value: 0 }, t: { value: 0 } }, vertexShader: _, fragmentShader: `${b}uniform float alpha,t;varying vec3 vP,vN,vV;void main(){float f=pow(max(0.,dot(normalize(vN),normalize(vV))),1.1);float n=n3(vP*9.-t*.5);vec3 c=mix(vec3(.2,1.1,1.6),vec3(3.,2.8,1.8),n);gl_FragColor=vec4(c,f*alpha);}`, transparent: true, depthWrite: false, blending: ot, toneMapped: false })), Dt = A(v, lt, r, [0, e + 0.4, 0]), C = h(new st({ uniforms: { alpha: { value: 0 }, t: { value: 0 } }, vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform float alpha,t;varying vec3 vP;void main(){float r=length(vP.xy);float w=pow(max(0.,sin((r-.72)/.28*3.14159)),2.);float ray=.6+.4*sin(atan(vP.y,vP.x)*90.+t*.5);gl_FragColor=vec4(vec3(.2,1.1,1.7),w*ray*alpha);}", transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false })), ut = A(c(new jn(0.72, 1, 192, 1)), C, r, [0, e - 0.4, 0]);
    ut.rotation.x = -Math.PI / 2;
    let je = D(r, [12054271, 16763487, 4376831], [0, 0.45, 0.9], 0.77), We = c(new Wn(1, 0)), Pe = h(new bt({ color: 4535608, metalness: 0.12, roughness: 0.94, emissive: 16733720, emissiveIntensity: 0.12, transparent: true })), gt = h(new bt({ color: 6107169, metalness: 0.15, roughness: 0.7, emissive: 16734996, emissiveIntensity: 1.6, transparent: true })), Te = 480, Ye = 224, Et = new Nt(We, Pe, Te), vt = new Nt(We, gt, Ye);
    r.add(Et, vt), Et.frustumCulled = vt.frustumCulled = false;
    let w = [];
    for (let Ee = 0; Ee < Te + Ye; Ee++) {
      let Ve = Ee >= Te || Ee % 4 === 0, ht = m() * Math.PI * 2, ie = Ve ? m() * 0.54 : Math.acos(2 * m() - 1), le = new T(Math.sin(ie) * Math.cos(ht), Math.cos(ie), Math.sin(ie) * Math.sin(ht)).multiplyScalar(e * (0.94 + m() * 0.1)), ne = le.clone().normalize().multiplyScalar(Ve ? 3 + m() * 12 : 0.8 + m() * 3.7);
      ne.y += Ve ? 4 + m() * 11 : 1 + m() * 2.5;
      let Re = Ve ? 0.17 + Math.pow(m(), 2) * 1.8 : 0.5 + Math.pow(m(), 2) * 2.2;
      w.push({ origin: le, velocity: ne, size: Re, delay: Ve ? m() * 0.8 : 0.8 + m() * 2.4, r: [m() * 6, m() * 6, m() * 6], spin: [m() - 0.5, m() - 0.5, m() - 0.5], shape: [0.55 + m() * 0.9, 0.5 + m(), 0.5 + m()] });
    }
    let y = [], V = [], Q = [], se = [], j = [], Ue = [], _e = [];
    function Ne(Ee, Ve, ht = 0.6) {
      return new T(Math.sin(Ee) * Math.cos(Ve), Math.cos(Ee), Math.sin(Ee) * Math.sin(Ve)).multiplyScalar(e + ht);
    }
    function Fe(Ee, Ve, ht, ie, le, ne, Re) {
      let ke = [];
      for (let Se = 0; Se <= ne; Se++) {
        let Ce = Se / ne, Xe = Ve + (ht - Ve) * Ce, ct = Math.sin(Se * 4.9 + le * 18) * 0.08 + Math.sin(Se * 2.3) * 0.04, Ct = Ne(Xe, Ee + ct + Math.sin(Xe * 3 + le) * 0.14, 0.55 + m() * 0.38);
        ke.push(Ct), Se > 0 && (y.push(...ke[Se - 1].toArray(), ...Ct.toArray()), V.push((Ve + (ht - Ve) * (Se - 1) / ne) / Math.PI, Xe / Math.PI), Q.push(le, le));
      }
      if (Re) {
        let Se = new Fr(new Ls(ke), ne * 2, ie, 4, false), Ce = Se.toNonIndexed();
        Se.dispose();
        let Xe = Ce.attributes.position, ct = Ce.attributes.normal, Ct = Ce.attributes.uv;
        for (let at = 0; at < Xe.count; at++) se.push(Xe.getX(at), Xe.getY(at), Xe.getZ(at)), j.push(ct.getX(at), ct.getY(at), ct.getZ(at)), Ue.push((Ve + Ct.getX(at) * (ht - Ve)) / Math.PI), _e.push(le);
        Ce.dispose();
      }
      return ke;
    }
    for (let Ee = 0; Ee < 18; Ee++) {
      let Ve = Ee / 18 * Math.PI * 2;
      Fe(Ve, 0.025, Math.PI * (0.78 + m() * 0.2), 0.045 + m() * 0.045, m(), 44, true);
      for (let ht = 0; ht < 5; ht++) {
        let ie = 0.3 + ht * 0.4;
        Fe(Ve + (m() - 0.5) * 0.4, ie, Math.min(Math.PI, ie + 0.4 + m() * 0.45), 0.025, m(), 14, ht % 2 === 0);
      }
    }
    function he(Ee, Ve, ht, ie) {
      let le = new mt();
      return le.setAttribute("position", new nt(Ee, 3)), le.setAttribute("aProgress", new nt(Ve, 1)), le.setAttribute("aSeed", new nt(ht, 1)), ie && le.setAttribute("normal", new nt(ie, 3)), c(le);
    }
    let ye = h(new st({ uniforms: { t: { value: 0 }, front: { value: 0 }, alpha: { value: 0 } }, vertexShader: "attribute float aProgress,aSeed;varying float p,s;void main(){p=aProgress;s=aSeed;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform float t,front,alpha;varying float p,s;void main(){float arcActive=1.-smoothstep(front-.03,front+.025,p);float energy=.55+.45*pow(.5+.5*sin(t*11.+s*41.+p*36.),5.);vec3 c=mix(vec3(.46,.11,2.),vec3(1.5,1.7,2.3),energy*.72);gl_FragColor=vec4(c,arcActive*energy*alpha);}", transparent: true, depthWrite: false, blending: ot, toneMapped: false }));
    a.add(new Kn(he(y, V, Q), ye)), A(he(se, Ue, _e, j), ye, a);
    let qe = h(new st({ uniforms: { t: { value: 0 }, alpha: { value: 0 }, front: { value: 0 } }, vertexShader: _, fragmentShader: `${b}uniform float t,alpha,front;varying vec3 vP,vN,vV;void main(){float lat=acos(clamp(normalize(vP).y,-1.,1.))/3.14159265;float spread=1.-smoothstep(front-.1,front+.1,lat);float rim=pow(max(0.,1.-abs(dot(normalize(vN),normalize(vV)))),2.4);float n=n3(vP*7.+vec3(0,t*.3,0));float ribs=pow(.5+.5*sin(vP.y*44.+n*7.-t*2.),8.);vec3 c=mix(vec3(.19,.15,1.2),vec3(.7,.3,1.7),n);gl_FragColor=vec4(c,(rim*.55+ribs*.1)*alpha*spread);}`, transparent: true, depthWrite: false, blending: ot, side: wt, toneMapped: false })), Oe = A(v, qe, a);
    Oe.scale.setScalar(e * 1.12);
    let ve = P(a, 12421887, 37, 0), Ke = D(a, [13544191, 8485887], [0, 0.68], 0.57), N = new _t();
    N.position.y = -e, a.add(N);
    let z = [R(8140799, 0.15), R(12166911, 0.5), R(15919871, 0.9)].map((Ee, Ve) => ({ mesh: A(S, Ee, N), width: [1.8, 0.6, 0.17][Ve] })), q = A(v, R(12364287, 0.55), N);
    q.scale.set(2.8, 1.2, 2.8);
    let B = 3200, W = new Float32Array(B * 4), ce = new Float32Array(B * 3);
    for (let Ee = 0; Ee < B; Ee++) W.set([m(), m(), m(), m()], Ee * 4);
    let L = c(new mt());
    L.setAttribute("position", new It(ce, 3)), L.setAttribute("aSeed", new It(W, 4));
    let k = h(new st({ uniforms: { t: { value: 0 }, kind: { value: 0 }, radius: { value: e }, alpha: { value: 0 } }, vertexShader: `attribute vec4 aSeed;uniform float t,kind,radius,alpha;varying vec3 col;varying float opacity;void main(){vec4 s=aSeed;float phi=s.x*6.2831853;vec3 p;float age;float life;float size;float fade;
      if(kind<.5){life=1.8+s.z*2.;age=mod(t+s.y*life,life);float spread=.14+s.w*.75;p=vec3(cos(phi)*spread*age*11.,radius+age*(8.+s.z*16.),sin(phi)*spread*age*11.);p.y-=age*age*.9;fade=(1.-age/life)*smoothstep(0.,.13,t);size=1.3+s.w*2.4;col=mix(vec3(1.8,.5,.08),vec3(.9,1.9,1.2),s.z*.65);}
      else if(kind<1.5){age=max(0.,t-s.w*1.2);life=8.+s.z*12.;float spread=.45+s.y*1.15;vec3 vel=vec3(cos(phi)*spread*(8.+s.z*18.),10.+s.y*24.,sin(phi)*spread*(8.+s.z*18.));p=vec3(cos(phi)*s.y*6.,radius,sin(phi)*s.y*6.)+vel*age*.85;fade=(1.-smoothstep(life*.3,life,age))*step(s.w*1.2,t);size=1.4+s.w*4.;float hue=fract(s.z*3.7);col=hue<.25?vec3(2.,.45,.03):hue<.5?vec3(.25,1.6,2.2):hue<.75?vec3(1.4,.45,2.1):vec3(2.,1.8,1.2);}
      else{life=1.2+s.z*1.5;age=mod(t+s.y*life,life);float theta=s.y*3.14159265;float front=clamp(t/3.2,0.,1.);vec3 normal=vec3(sin(theta)*cos(phi),cos(theta),sin(theta)*sin(phi));p=normal*(radius+age*(2.+s.z*6.));fade=(1.-age/life)*step(s.y,front);size=1.+s.w*2.6;col=mix(vec3(.6,.15,2.),vec3(1.3,1.6,2.2),s.z);}
      opacity=clamp(fade,0.,1.)*alpha;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*(kind>.5&&kind<1.5?length(modelMatrix[0].xyz):1.)*290./max(1.,-mv.z),1.,14.);if(opacity<.001)gl_PointSize=0.;}`, fragmentShader: "varying vec3 col;varying float opacity;void main(){vec2 p=gl_PointCoord-.5;float r=length(p)*2.;if(r>1.)discard;float a=pow(1.-r,2.);gl_FragColor=vec4(col,a*opacity);}", transparent: true, depthWrite: false, blending: ot, toneMapped: false })), $ = new En(L, k);
    $.frustumCulled = false, n.add($);
    let pe = false;
    function Ie({ kind: Ee = "laser", time: Ve = -1, direction: ht, globalTime: ie = 0, quality: le = "high" } = {}) {
      if (pe) return;
      let ne = Ve, Re = ne >= 0;
      if (n.visible = Re, !Re) return;
      ht && ht.lengthSq() > 1e-4 && n.quaternion.setFromUnitVectors(d, p.copy(ht).normalize()), s.visible = Ee === "laser", r.visible = Ee === "missile", a.visible = Ee === "accelerator";
      let ke = Ee === "laser" ? 0 : Ee === "missile" ? 1 : 2;
      if (k.uniforms.t.value = ne, k.uniforms.kind.value = ke, k.uniforms.alpha.value = Ee === "laser" ? 1 - E(7, 11, ne) : Ee === "missile" ? 1 - E(11, 18, ne) : 1 - E(8, 14, ne), L.setDrawRange(0, le === "balanced" && Ee!=="missile" ? 1900 : B), s.visible) {
        let Se = E(0, 0.18, ne) * (1 - E(7, 10.5, ne)), Ce = 0.94 + 0.06 * Math.sin(ne * 29) * Math.sin(ne * 13.1);
        X.uniforms.t.value = ne, X.uniforms.alpha.value = Se * 0.9, J.scale.set(3 + ne * 0.16, 1.45, 3 + ne * 0.16), K.uniforms.t.value = ne, K.uniforms.alpha.value = Se * 0.5;
        let Xe = 10 + E(0, 2, ne) * 22;
        Z.scale.set(1, Xe, 1), Z.position.y = e + Xe * 0.5;
        let ct = 3.2 + E(0, 6, ne) * 4.2;
        H.scale.setScalar(ct), ee.opacity = Se * 0.72, U && (U.material.opacity = Se * 0.63 * Ce), re.update(ne, Se * 0.55), me.opacity = Se * 0.7;
        for (let Ct = 0; Ct < oe; Ct++) {
          let at = xe[Ct], M = (ne + at.phase) % 2.8;
          p.set(Math.cos(at.phi) * at.spread, 1.05, Math.sin(at.phi) * at.spread).normalize(), u.copy(p).multiplyScalar(M * at.speed), u.y += e, u.y -= M * M * 0.55, g.position.copy(u), g.quaternion.setFromUnitVectors(d, p);
          let O = Math.max(1e-3, 1 - M / 2.8);
          g.scale.set(0.035 * O, at.length * O, 0.035 * O), g.updateMatrix(), He.setMatrixAt(Ct, g.matrix);
        }
        He.instanceMatrix.needsUpdate = true;
      }
      if (r.visible) {
        let Se = 1 - Math.exp(-Math.max(0, ne) * 0.73), Ce = 0.5 + Se * 39, Xe = 0.6 + Se * 43, ct = E(0, 0.09, ne) * (1 - E(3.9, 8.8, ne));
        te.scale.setScalar(Ce), ae.scale.setScalar(.5+Math.max(0,1-Math.exp(-Math.max(0,ne-.35)*.73))*32), radiationThird.scale.setScalar(.5+Math.max(0,1-Math.exp(-Math.max(0,ne-.7)*.73))*25), radiationThird.material.uniforms.t.value=ne, radiationThird.material.uniforms.alpha.value=ct*.34*E(.7,1.1,ne), te.material.uniforms.t.value = ae.material.uniforms.t.value = ne, te.material.uniforms.alpha.value = ct * 0.48, ae.material.uniforms.alpha.value = ct * 0.34*E(.35,.7,ne), ze.scale.setScalar(Ce), be.opacity = ct * 0.94;
        let Ct = 0.8 + (1 - Math.exp(-ne * 1.8)) * 4.5;
        if (Dt.scale.set(Ct, Ct * 1.3, Ct), lt.uniforms.t.value = ne, lt.uniforms.alpha.value = E(0, 0.07, ne) * (1 - E(0.8, 3.2, ne)) * 0.52, Be) {
          Be.material.opacity = E(0, 0.04, ne) * (1 - E(0.5, 2.8, ne)) * 0.68;
          let at = 6 + (1 - Math.exp(-ne * 2)) * 14;
          Be.scale.set(at, at, 1);
        }
        ut.scale.setScalar(3 + ne * 15), C.uniforms.t.value = ne, C.uniforms.alpha.value = E(0, 0.06, ne) * (1 - E(1.4, 4.4, ne)) * 0.46, je.update(ne), Pe.emissiveIntensity = 0.09 + Math.exp(-ne * 0.25) * 0.5, gt.emissiveIntensity = 0.23 + Math.exp(-ne * 0.22) * 2.6, Pe.opacity = 1 - E(14, 22, ne) * 0.55, gt.opacity = 1 - E(12, 21, ne) * 0.75;
        for (let at = 0; at < w.length; at++) {
          let M = w[at], O = Math.max(0, ne - M.delay);
          g.position.copy(M.origin).addScaledVector(M.velocity, O * 0.55), g.rotation.set(M.r[0] + O * M.spin[0], M.r[1] + O * M.spin[1], M.r[2] + O * M.spin[2]);
          let G = ne < M.delay ? 1e-5 : Math.max(1e-5, M.size * E(0, 0.25, O));
          g.scale.set(G * M.shape[0], G * M.shape[1], G * M.shape[2]), g.updateMatrix(), at < Te ? Et.setMatrixAt(at, g.matrix) : vt.setMatrixAt(at - Te, g.matrix);
        }
        Et.instanceMatrix.needsUpdate = vt.instanceMatrix.needsUpdate = true, Et.count = Te, vt.count = Ye;
      }
      if (a.visible) {
        let Se = E(0, 0.12, ne) * (1 - E(7.6, 13.8, ne)), Ce = f(ne / 3.2 + 0.025, 0, 1.12);
        ye.uniforms.t.value = ne, ye.uniforms.front.value = Ce, ye.uniforms.alpha.value = Se, qe.uniforms.t.value = ne, qe.uniforms.alpha.value = Se, qe.uniforms.front.value = Ce, Oe.scale.setScalar(e * (1.1 + Math.sin(ne * 0.5) * 0.015)), ve && (ve.material.opacity = Se * (0.33 + 0.1 * Math.sin(ne * 17) ** 2)), Ke.update(ne, Se * 0.8);
        let Xe = E(0.6, 1.2, ne) * (1 - E(7.8, 10.5, ne)), ct = 0.65 + 0.35 * Math.sin(ne * 8.5) ** 4, Ct = 65 * E(0.65, 1.8, ne);
        N.visible = Xe > 1e-3, z.forEach((at, M) => {
          at.mesh.position.y = -Ct * 0.5, at.mesh.scale.set(at.width, Math.max(1e-3, Ct), at.width), at.mesh.material.opacity = [0.13, 0.48, 0.85][M] * Xe * ct;
        }), q.material.opacity = Xe * 0.5;
      }
    }
    function we() {
      n.visible = false;
    }
    function Mt() {
      pe || (pe = true, o.forEach((Ee) => Ee.dispose()), l.forEach((Ee) => Ee.dispose()), n.clear());
    }
    return we(), { group: n, radiationShells:[te,ae,radiationThird], exitBeam:N, update: Ie, reset: we, dispose: Mt };
  }
export {jc as createPrismArray,Qc as createOriginalImpactor,eh as createElectronRing,th as createReferenceImpact,d_ as createGlowTexture};
