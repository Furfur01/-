import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {mountBakedInterior} from './baked-interior.js';

// Shared physical materials and construction tools from the user-provided KEEL family.
// No viewer controls, DOM, independent renderer or simulation.
export function createFamilyInterior(builder,{renderer=null,staticBatching=true,baked=null}={}){
const CONFIG = {staticBatching};
const scene = new T.Group();
const interior = new T.Group(); interior.name='KEEL_FAMILY_INTERIOR'; scene.add(interior);
const M = {};
function finish(name,color,metalness,roughness,extra={}) {
  const m = new T.MeshStandardMaterial({color,metalness,roughness,...extra});
  m.name=name; M[name]=m; return m;
}
// Fine deterministic surface grain. It is a material texture, never a display.
function grainTexture(size=128,seed=712) {
  let a=seed; const data=new Uint8Array(size*size*4);
  for(let i=0;i<size*size;i++){a=(1664525*a+1013904223)>>>0;const g=116+(a>>>27);data[i*4]=data[i*4+1]=data[i*4+2]=g;data[i*4+3]=255;}
  const tex=new T.DataTexture(data,size,size,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(10,10);tex.needsUpdate=true;return tex;
}
const metalGrain=grainTexture(), fabricGrain=grainTexture(128,813);
fabricGrain.repeat.set(4,4);
finish('structure',0x354148,.62,.44,{bumpMap:metalGrain,bumpScale:.0015});
finish('cladding',0x939b94,.25,.55,{bumpMap:metalGrain,bumpScale:.001});
finish('secondary',0x58666c,.48,.46,{bumpMap:metalGrain,bumpScale:.0012});
finish('titanium',0x94a3a6,.88,.25);
finish('black',0x161f24,.35,.48);
finish('rubber',0x141919,0,.93);
finish('leather',0x40453f,0,.78,{bumpMap:fabricGrain,bumpScale:.004});
finish('stitch',0x8a8978,0,.8);
finish('copper',0x9f543a,.5,.42);
finish('floor',0x434c4f,.26,.7,{bumpMap:metalGrain,bumpScale:.004});
finish('deckEdge',0x768079,.6,.44);
finish('whiteLight',0xdfebeb,.05,.3,{emissive:0xd9e7e5,emissiveIntensity:2.4});
finish('cyanLight',0x7eafbb,.1,.3,{emissive:0x72adc0,emissiveIntensity:1.25});
finish('redLight',0x9c2d21,.05,.32,{emissive:0xe04223,emissiveIntensity:1.4});
finish('lens',0x192b30,.46,.28,{emissive:0x203942,emissiveIntensity:.06});
M.glass=new T.MeshPhysicalMaterial({name:'laminated_observation_glass',color:0x344a54,metalness:0,roughness:.18,transparent:true,opacity:.035,depthWrite:false,side:T.DoubleSide,clearcoat:0,clearcoatRoughness:.18,specularIntensity:0,envMapIntensity:.30});
M.contact=new T.MeshBasicMaterial({name:'contact_occlusion',color:0x090d10,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide});

const CACHE = new Map();
function group(parent,name,x=0,y=0,z=0){const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
function geometry(key,build){if(!CACHE.has(key))CACHE.set(key,build());return CACHE.get(key);}
function mesh(parent,name,geom,mat,x=0,y=0,z=0,rot){const o=new T.Mesh(geom,mat);o.name=name;o.position.set(x,y,z);if(rot)o.rotation.set(...rot);o.castShadow=!mat.transparent && !mat.emissive?.getHex();o.receiveShadow=true;parent.add(o);return o;}
function box(parent,name,w,h,d,x,y,z,mat=M.structure,r=.025,rot){
  r=Math.min(r,w*.23,h*.23,d*.23);
  const key=['box',w,h,d,r].join(':');
  return mesh(parent,name,geometry(key,()=>r>0?new RoundedBoxGeometry(w,h,d,1,r):new T.BoxGeometry(w,h,d)),mat,x,y,z,rot);
}
function shape2(points){const s=new T.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;}
function polygon(parent,name,points,depth,mat=M.cladding,x=0,y=0,z=0,bevel=.025,rot){
  const s=shape2(points);const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:1});g.translate(0,0,-depth/2);return mesh(parent,name,g,mat,x,y,z,rot);
}
function deckPoly(parent,name,points,thickness,top,mat){return polygon(parent,name,points.map(p=>[p[0],-p[1]]),thickness,mat,0,top-thickness*.5,0,.015,[-Math.PI/2,0,0]);}
function beam(parent,name,a,b,w,d,mat=M.structure,round=.02){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=box(parent,name,w,dir.length(),d,...av.add(bv).multiplyScalar(.5).toArray(),mat,round);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o;}
function cylinder(parent,name,r,h,x,y,z,mat=M.structure,segments=32,r2=r,rot){return mesh(parent,name,geometry(['cyl',r,h,r2,segments].join(':'),()=>new T.CylinderGeometry(r,r2,h,segments)),mat,x,y,z,rot);}
function ring(parent,name,r,tube,x,y,z,mat=M.titanium,rot=[Math.PI/2,0,0],arc=Math.PI*2){return mesh(parent,name,geometry(['ring',r,tube,arc].join(':'),()=>new T.TorusGeometry(r,tube,6,64,arc)),mat,x,y,z,rot);}
function tube(parent,name,points,r,mat=M.black){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(parent,name,new T.TubeGeometry(curve,Math.max(8,points.length*4),r,6,false),mat);}
function bolt(parent,x,y,z,axis='y',r=.023){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;const o=cylinder(parent,'captive_hex_fastener',r,.013,x,y,z,M.titanium,6,r,rot);return o;}
function slotBank(parent,x,y,z,n,width,spacing,axis='z'){
  for(let i=0;i<n;i++){const pos=(i-(n-1)/2)*spacing;
    if(axis==='z')box(parent,'recessed_vent',width,.024,.015,x,y+pos,z,M.black,.009);
    else box(parent,'recessed_vent',width,.015,.024,x,y,z+pos,M.black,.009);
  }
}
// A full-depth opening with a continuous bevel and a replaceable dark gasket.
function frameShape(parent,name,outer,inner,depth,mat,x=0,y=0,z=0,bevel=.02,rot){
  const s=shape2(outer),hole=new T.Path();inner.slice().reverse().forEach((p,i)=>i?hole.lineTo(...p):hole.moveTo(...p));hole.closePath();s.holes.push(hole);
  const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:1});g.translate(0,0,-depth/2);return mesh(parent,name,g,mat,x,y,z,rot);
}
function chamferRect(w,h,c=.08,cx=0,cy=0){return [[cx-w/2+c,cy-h/2],[cx+w/2-c,cy-h/2],[cx+w/2,cy-h/2+c],[cx+w/2,cy+h/2-c],[cx+w/2-c,cy+h/2],[cx-w/2+c,cy+h/2],[cx-w/2,cy+h/2-c],[cx-w/2,cy-h/2+c]];}

function makeEnvironment(renderer){
  const envScene=new T.Scene();envScene.background=new T.Color(0x6d787e);
  const p=(w,h,x,y,z,color,rx=0,ry=0)=>{const a=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));a.position.set(x,y,z);a.rotation.set(rx,ry,0);envScene.add(a);};
  p(5,14,-5,3,0,0xc8d2d5,0,Math.PI/2);p(5,14,5,3,0,0x87969d,0,-Math.PI/2);
  p(10,10,0,7,0,0xc0c4bb,Math.PI/2);p(14,10,0,-4,0,0x171d21,Math.PI/2);
  p(12,8,0,2,-9,0x202f38);p(6,6,0,2,9,0x535e62);
  const pmrem=new T.PMREMGenerator(renderer);const target=pmrem.fromScene(envScene,.035);for(const m of Object.values(M)){if(m.isMeshStandardMaterial){m.envMap=target.texture;m.envMapIntensity*=.48;}}pmrem.dispose();envScene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return target;
}

// Bake static transforms into material batches within semantic groups.
// The construction functions above remain the editable source of every part.
function batchStatic(root){
  root.updateMatrixWorld(true);
  const report={sourceMeshes:0,triangles:0,batches:0};
  for(const assembly of [...root.children]){
    if(!assembly.isGroup)continue;
    const inverse=new T.Matrix4().copy(assembly.matrixWorld).invert();const buckets=new Map();const keep=[];const anchors=[];
    assembly.traverse(o=>{
      if(!o.isMesh){if(o.name.startsWith('EMPTY_'))anchors.push(o);return;}report.sourceMeshes++;
      if(Array.isArray(o.material)||o.material.transparent||o.userData.noBatch){keep.push(o);return;}
      const mat=o.material;const k=mat.uuid+':'+o.castShadow+':'+o.receiveShadow;
      if(!buckets.has(k))buckets.set(k,{mat,shadow:o.castShadow,receive:o.receiveShadow,geoms:[],names:[]});
      const g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      const normalized=g.index?g.toNonIndexed():g;
      for(const key of Object.keys(normalized.attributes))if(!['position','normal','uv'].includes(key))normalized.deleteAttribute(key);
      if(!normalized.attributes.uv)normalized.setAttribute('uv',new T.BufferAttribute(new Float32Array(normalized.attributes.position.count*2),2));
      buckets.get(k).geoms.push(normalized);buckets.get(k).names.push(o.name);
      if(g!==normalized)g.dispose();
    });
    const replacement=new T.Group();replacement.name=assembly.name;replacement.userData={...assembly.userData};replacement.position.copy(assembly.position);replacement.quaternion.copy(assembly.quaternion);replacement.scale.copy(assembly.scale);
    for(const b of buckets.values()){
      const g=mergeGeometries(b.geoms,false);b.geoms.forEach(x=>x.dispose());if(!g)continue;g.computeBoundingSphere();
      const o=new T.Mesh(g,b.mat);o.name=assembly.name+' / '+b.mat.name;o.castShadow=b.shadow;o.receiveShadow=b.receive;o.userData.parts=b.names;replacement.add(o);report.batches++;report.triangles+=g.attributes.position.count/3;
    }
    for(const o of keep){const g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));const copy=new T.Mesh(g,o.material);copy.name=o.name;copy.userData={...o.userData};copy.castShadow=o.castShadow;copy.receiveShadow=o.receiveShadow;replacement.add(copy);report.batches++;report.triangles+=(g.index?g.index.count:g.attributes.position.count)/3;}
    for(const a of anchors){const copy=new T.Group();copy.name=a.name;copy.userData={...a.userData};copy.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,a.matrixWorld));replacement.add(copy);}
    root.remove(assembly);root.add(replacement);
  }
  return report;
}

 const {craft,build,light}=builder({T,interior,M,finish,grainTexture,group,geometry,mesh,box,shape2,polygon,deckPoly,beam,cylinder,ring,tube,bolt,slotBank,frameShape,chamferRect,makeEnvironment,batchStatic});
 Object.assign(CONFIG,{pilot:[...craft.eye],fov:craft.fov,exposure:craft.exposure,dimensions:craft.dimensions,bounds:craft.bounds});
 interior.name='KEEL_'+craft.id+'_INTERIOR';if(baked)mountBakedInterior(interior,M,baked);else build();
 const original=new Set();interior.traverse(o=>{if(o.geometry)original.add(o.geometry);});
 const stats=baked?baked.stats:staticBatching?batchStatic(interior):{};
 if(staticBatching&&!baked){const retained=new Set();interior.traverse(o=>{if(o.geometry)retained.add(o.geometry);});for(const g of original)if(!retained.has(g))g.dispose();CACHE.clear();}
 const lights=new T.Group();lights.name='KEEL_LIGHTS';scene.add(lights);light(lights);
 const environment=renderer?makeEnvironment(renderer):null,baseline=new Map();lights.traverse(l=>{if(l.isLight)baseline.set(l,l.intensity);});
 const alarm=new T.PointLight(0xf14b29,0,craft.id==='FIGHTER'?4:16,1.8);alarm.position.fromArray(craft.eye).add(new T.Vector3(0,.7,-1));lights.add(alarm);
 const anchors={};interior.updateMatrixWorld(true);interior.traverse(o=>{if(o.name.startsWith('EMPTY_'))anchors[o.name]=o;});let disposed=false;
 return {root:scene,interior,lights,materials:M,config:CONFIG,craft,stats,anchors,
 update({alert=false,flash=0}={},time=0){const pulse=alert?.5+.5*Math.sin(time*5):0;for(const [l,power]of baseline)l.intensity=power*(alert?.66:1)*(1-Math.min(.65,flash*.45));alarm.intensity=pulse*(craft.id==='FIGHTER'?3:32);M.redLight.emissiveIntensity=alert?1.4+pulse*1.8:1.4;},
 dispose(){if(disposed)return;disposed=true;const gs=new Set(),ms=new Set(Object.values(M)),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])ms.add(m);if(o.isLight)o.dispose?.();});for(const g of gs)g.dispose();for(const m of ms){for(const v of Object.values(m))if(v?.isTexture)ts.add(v);m.dispose();}for(const t of ts)if(t!==environment?.texture)t.dispose();environment?.dispose();scene.clear();}
 };
}
