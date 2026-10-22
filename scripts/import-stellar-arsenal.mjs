// Import user-authored model factories only. No HTML, UI, renderer or bundled
// Three.js is shipped; the factories use the game's installed Three.js runtime.
// Usage: node scripts/import-stellar-arsenal.mjs <original.html> <v3.html>
import fs from 'node:fs';
import {transform} from 'esbuild';
const [original,v3]=process.argv.slice(2);
if(!original||!v3)throw Error('Provide the original and (3) HTML source paths');
const maps={original:{Tn:'MathUtils',ot:'AdditiveBlending',wt:'DoubleSide',Yt:'BackSide',en:'SRGBColorSpace',nt:'Float32BufferAttribute',It:'BufferAttribute'},v3:{mt:'AdditiveBlending',Lt:'DoubleSide',rt:'Float32BufferAttribute'}};
for(const [name,file]of [['original',original],['v3',v3]]){
 const html=fs.readFileSync(file,'utf8'),script=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
 const s=(await transform(script,{minify:false})).code;
 let body=name==='original'?s.slice(s.indexOf('  function Zs'),s.indexOf('  function ad'))+s.slice(s.indexOf('  function jc'),s.indexOf('  var Ze')):s.slice(s.indexOf('  function gu'),s.indexOf('  function vu'));
 const aliases={...maps[name]};
 for(const id of new Set([...body.matchAll(/new (\w+)/g)].map(m=>m[1]))){
  if(aliases[id])continue;
  const match=s.match(new RegExp('(?:var |, )'+id+' = class[^\\n]*'));if(!match)continue;
  const type=s.slice(match.index,match.index+650).match(/(?:\.is(\w+) = true|\.type = "(\w+)")/);
  if(!type)throw Error('Unmapped Three.js class: '+id);aliases[id]=type[1]||type[2];
 }
 if(name==='v3'){
  // Match velocity on both sides of the muzzle instead of easing to a stop.
  body=body.replace('return j.copy(ke).addScaledVector(je, ye * en(C));','if(C < 6) return j.set(missileFlight(C,ye).trackX,16.8,0);\n      return j.copy(ke).addScaledVector(je, missileFlight(C,ye).distance);')
   .replace('return Math.pow(p((C - 6) / (12.8 - 6)), 6);','return missileFlight(C,ye).progress;')
   .replace(/let j = p\(\(C - 6\) \/ 6\.800000000000001\);\s*return \{ position: Oe\.clone\(\)\.addScaledVector\(Le, ye \* Math\.pow\(j, 6\)\), direction: Le\.clone\(\), progress: Math\.pow\(j, 6\), speedFraction: Math\.pow\(j, 5\) \* 0\.9998, accelerationFraction: Math\.pow\(j, 4\), launched: C >= 6, impacted: C >= 12\.8 \};/,'const flight=missileFlight(C,ye);\n      return {position:E(st(C,new T())),direction:Le.clone(),progress:flight.progress,speedFraction:flight.speed/missileFlight(12.8,ye).speed*.9998,accelerationFraction:flight.acceleration/missileFlight(12.8,ye).acceleration,launched:C>=6,impacted:C>=12.8};')
   .replace('j.position.copy(ke).add(new T(-0.18','j.position.set(-77,16.8,0).add(new T(-0.18')
   .replace('Ft.object.position.copy(ke).add(new T(-0.18','Ft.object.position.set(-77,16.8,0).add(new T(-0.18')
   .replace('S(5, 5.95, Ve)','S(3.35, 3.7, Ve)')
   .replace('accelerationExponent: 6','accelerationExponent: 2');
  // Nearby targets arrive sooner; retaining a fixed transit duration would
  // require the projectile to brake after leaving the accelerator.
  body=body.replace(/\b12\.8\b/g,'(6+missileFlightTime(ye))');
 }else{
  // Keep the flash compact; expanding radiation shells and crust ejecta carry
  // the large-scale impact without removing or hiding the surviving planet.
  body=body.replace('let Ct = 1.7 + (1 - Math.exp(-ne * 1.8)) * 13;','let Ct = 0.8 + (1 - Math.exp(-ne * 1.8)) * 4.5;')
   .replace('let at = 45 + (1 - Math.exp(-ne * 2)) * 75;','let at = 6 + (1 - Math.exp(-ne * 2)) * 14;')
   .replace('muzzle: n.clone().multiplyScalar(r), duration: 24','beam:z,beamRings:pe,muzzle: n.clone().multiplyScalar(r), duration: 24')
   .replace('muzzle: _e, duration: 24','beam:w,muzzle: _e, duration: 24')
   .replace('group: n, update: Ie, reset: we, dispose: Mt','group: n, exitBeam:N, update: Ie, reset: we, dispose: Mt');
  // Replace the tangent tube which intersected the main ring with one real
  // three-way tangent junction and an independent magnetic barrel.
  const start=body.indexOf('  function eh'),end=body.indexOf('  function th');
  let electron=body.slice(start,end);
  electron=electron.replace('if (f === "ring") {','if (f === "ring") {\n        const arc=((W%l)+l)%l;if(arc<72||arc>l-22)return;')
   .replace('new on(178 - B, 0.23, 6, 384)','new on(178 - B, 0.23, 6, 384,Math.PI*2-94/178).rotateZ(s+22/178)')
   .replace('new on(178 - B - 0.12, 0.055, 4, 384)','new on(178 - B - 0.12, 0.055, 4, 384,Math.PI*2-94/178).rotateZ(s+22/178)')
   .replace(/    f = "extraction";[\s\S]*?    let Dt = \{\};/,'    const extraction=createElectronExtraction({junction:r,target:i});h.add(extraction.group);c=extraction.muzzle.distanceTo(i)-16.5;\n    let Dt = {};')
   .replace('new qi(13, 13)','new qi(9, 9)')
   .replace('vt.position.copy(r).addScaledVector(a, o + 1.7), vt.quaternion.copy(d)','vt.position.copy(extraction.muzzle), vt.quaternion.copy(extraction.orientation)')
   .replace('w.position.copy(r).addScaledVector(a, o + 1.7), w.quaternion.copy(d)','w.position.copy(extraction.muzzle), w.quaternion.copy(extraction.orientation)')
   .replace('let _e = r.clone().addScaledVector(a, o + 1.7)','let _e = extraction.muzzle')
   .replace('ye = r.clone().addScaledVector(a, o * 0.58), qe = Fe.clone().multiplyScalar(54).addScaledVector(a, 27).add(new T(0, 36, 0))','ye = extraction.focus, qe = extraction.cameraOffset')
   .replace('for (let z = 0; z < be; z++) Dt.lensCores','for (let z = 0; z < Dt.lensCores.count; z++) Dt.lensCores')
   .replace('for (let we = 0; we < be; we++) {','extraction.update(Ie,k,$);\n      for (let we = 0; we < Dt.lensCores.count; we++) {')
   .replace('let Mt = we / (be - 1)','let Mt = we / (Dt.lensCores.count - 1)')
   .replace('return N(), {','const ringPivot=new _t(),ringItems=new _t();ringPivot.position.copy(r);ringPivot.quaternion.setFromUnitVectors(new T(Math.sin(s),0,-Math.cos(s)),a);ringItems.position.copy(r).negate();for(const child of [...h.children])if(child!==extraction.group&&child!==vt&&child!==w)ringItems.add(child);ringPivot.add(ringItems);h.add(ringPivot);\n    return N(), {')
   .replace('beam:w,muzzle: _e','extraction,beam:w,muzzle: _e');
  body=body.slice(0,start)+electron+body.slice(end);
  body=body.replace('new Zt(1, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2)','new Zt(1, 96, 48, 0, Math.PI * 2, 0, Math.PI)')
   .replace('float edge=exp(-h*18.);','float edge=.18*exp(-abs(h)*12.);')
   .replace('let te = A(tt, rt(1), r, [0, e - 1.2, 0]), ae = A(tt, rt(0), r, [0, e - 0.9, 0]),','let te = A(tt, rt(1), r, [0, e - 1.2, 0]), ae = A(tt, rt(0), r, [0, e - 1.2, 0]), radiationThird=A(tt,rt(2),r,[0,e-1.2,0]),')
   .replace('te.scale.set(Ce, Xe, Ce), ae.scale.set(Ce * 0.78, Xe * 0.86, Ce * 0.78),','te.scale.setScalar(Ce), ae.scale.setScalar(.5+Math.max(0,1-Math.exp(-Math.max(0,ne-.35)*.73))*32), radiationThird.scale.setScalar(.5+Math.max(0,1-Math.exp(-Math.max(0,ne-.7)*.73))*25), radiationThird.material.uniforms.t.value=ne, radiationThird.material.uniforms.alpha.value=ct*.34*E(.7,1.1,ne),')
   .replace('te.material.uniforms.alpha.value = ct * 0.91, ae.material.uniforms.alpha.value = ct * 0.6','te.material.uniforms.alpha.value = ct * 0.48, ae.material.uniforms.alpha.value = ct * 0.34*E(.35,.7,ne)')
   .replace('float spread=.3+s.y;vec3 vel=vec3(cos(phi)*spread*(6.+s.z*15.),7.+s.y*22.,sin(phi)*spread*(6.+s.z*15.));','float spread=.45+s.y*1.15;vec3 vel=vec3(cos(phi)*spread*(8.+s.z*18.),10.+s.y*24.,sin(phi)*spread*(8.+s.z*18.));')
   .replace('+vel*age*.6;','+vel*age*.85;')
   .replace('col=mix(vec3(2.,.5,.05),vec3(.5,1.5,2.),step(.5,s.z));','float hue=fract(s.z*3.7);col=hue<.25?vec3(2.,.45,.03):hue<.5?vec3(.25,1.6,2.2):hue<.75?vec3(1.4,.45,2.1):vec3(2.,1.8,1.2);')
   .replace('size*290./max(1.,-mv.z)','size*(kind>.5&&kind<1.5?length(modelMatrix[0].xyz):1.)*290./max(1.,-mv.z)')
   .replace('L.setDrawRange(0, le === "balanced" ? 1900 : B)','L.setDrawRange(0, le === "balanced" && Ee!=="missile" ? 1900 : B)')
   .replace('Et.count = le === "balanced" ? 320 : Te, vt.count = le === "balanced" ? 144 : Ye','Et.count = Te, vt.count = Ye')
   .replace('group: n, exitBeam:N, update: Ie','group: n, radiationShells:[te,ae,radiationThird], exitBeam:N, update: Ie');
 }
 const header='// Extracted from the user-provided stellar_arsenal'+(name==='v3'?' (3)':'')+'.html.\n// Geometry and shaders retained; imported Three.js replaces the embedded library.\n';
 const imports=`import {${Object.entries(aliases).map(([id,type])=>`${type} as ${id}`).join(', ')}} from 'three';\n`+(name==='v3'?"import {missileFlight,missileFlightTime} from './arsenal-motion.js';\n":"import {createElectronExtraction} from './electron-extraction.js';\n");
 const exports=name==='original'?'export {jc as createPrismArray,Qc as createOriginalImpactor,eh as createElectronRing,th as createReferenceImpact,d_ as createGlowTexture};':'export {gu as createLaunchVessel};';
 fs.writeFileSync('scripts/universe/arsenal-'+name+'.js',header+imports+body+exports+'\n');
}
