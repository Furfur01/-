import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildSeating} from './seating.js';
import {buildAftBulkhead} from './aft.js';

// User-approved KEEL physical interior. No DOM, input listeners, game loop or world scenery.
export function createKeelInterior({renderer=null,staticBatching=true}={}){
const CONFIG = {
  width:13.0, aft:6.45, ceiling:4.85,
  pilot:[0,1.80,0.95], fov:64,
  exposure:1.12, maxPixelRatio:1.6, maxRenderPixels:2600000, ao:true,
  staticBatching
};
const scene = new T.Group(); scene.name="KEEL_CABIN_ROOT";
const interior = new T.Group(); interior.name='KEEL_INTERIOR'; scene.add(interior);
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
M.glass=new T.MeshPhysicalMaterial({name:'laminated_observation_glass',color:0x56747b,metalness:0,roughness:.10,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide,clearcoat:.6,clearcoatRoughness:.10,specularIntensity:.3,envMapIntensity:.45});
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
  const pmrem=new T.PMREMGenerator(renderer);const target=pmrem.fromScene(envScene,.035);for(const m of Object.values(M)){if(m.isMeshStandardMaterial){m.envMap=target.texture;m.envMapIntensity*=.48;m.needsUpdate=true;}}pmrem.dispose();envScene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return target;
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
    const replacement=new T.Group();replacement.name=assembly.name;replacement.position.copy(assembly.position);replacement.quaternion.copy(assembly.quaternion);replacement.scale.copy(assembly.scale);
    for(const b of buckets.values()){
      const g=mergeGeometries(b.geoms,false);b.geoms.forEach(x=>x.dispose());if(!g)continue;g.computeBoundingSphere();
      const o=new T.Mesh(g,b.mat);o.name=assembly.name+' / '+b.mat.name;o.castShadow=b.shadow;o.receiveShadow=b.receive;o.userData.parts=b.names;replacement.add(o);report.batches++;report.triangles+=g.attributes.position.count/3;
    }
    for(const o of keep){const g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));const copy=new T.Mesh(g,o.material);copy.name=o.name;copy.castShadow=o.castShadow;copy.receiveShadow=o.receiveShadow;replacement.add(copy);report.batches++;report.triangles+=(g.index?g.index.count:g.attributes.position.count)/3;}
    for(const a of anchors){const copy=new T.Group();copy.name=a.name;copy.userData={...a.userData};copy.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,a.matrixWorld));replacement.add(copy);}
    root.remove(assembly);root.add(replacement);
  }
  return report;
}


/* ===== architecture.js ===== */
function buildArchitecture(){
  const deck=group(interior,'01_DECKS_AND_CIRCULATION');
  const footprint=[[-5.7,-7.45],[5.7,-7.45],[6.5,-5.6],[6.5,6.55],[-6.5,6.55],[-6.5,-5.6]];
  deckPoly(deck,'pressure_deck',footprint,.24,-.06,M.structure);
  const well=[[-2.5,-3.5],[2.5,-3.5],[2.5,2.85],[1.85,3.4],[-1.85,3.4],[-2.5,2.85]];
  deckPoly(deck,'sunken_pilot_deck',well,.10,.012,M.floor);
  for(const s of [-1,1]){
    deckPoly(deck,'raised_side_deck',[[s*2.55,-3.45],[s*6.4,-5.5],[s*6.4,6.38],[s*2.55,6.38]],.35,.285,M.structure);
    for(let z=-3.0;z<6.0;z+=1.27){
      for(let j=0;j<3;j++){const x=s*(3.12+j*1.09);box(deck,'replaceable_deck_panel',1.062,.045,1.238,x,.303,z,M.floor,.012);}
      box(deck,'inboard_metal_deck_nosing',.07,.075,1.238,s*2.6,.307,z,M.deckEdge,.01);
      if(z<3.2)box(deck,'recessed_step_marker',.035,.024,.26,s*2.65,.345,z-.35,M.whiteLight,.006);
    }
  }
  deckPoly(deck,'bow_walkway',[[-6.3,-5.65],[-5.62,-7.36],[5.62,-7.36],[6.3,-5.65],[2.55,-3.48],[-2.55,-3.48]],.35,.28,M.structure);
  for(let x=-4.8;x<=4.8;x+=1.2)for(let z=-6.65;z<=-4.4;z+=1.12){if(Math.abs(x)>3.4&&z> -5.0)continue;box(deck,'bow_deck_panel',1.17,.04,1.08,x,.30,z,M.floor,.01);}
  box(deck,'aft_cross_aisle',5.10,.34,2.59,0,.11,5.075,M.structure,.03);
  for(let x=-1.88;x<2;x+=1.25)for(let z=4.42;z<6.4;z+=.94)box(deck,'aft_deck_panel',1.22,.04,.91,x,.302,z,M.floor,.012);
  for(let k=0;k<3;k++){
    const z=3.13+k*.27,h=(k+1)*.095;
    box(deck,'wide_aft_step',3.76,h,.275,0,h/2,z,M.structure,.018);
    box(deck,'step_tread_insert',3.56,.018,.22,0,h+.008,z-.018,M.floor,.006);
    box(deck,'step_nosing',3.70,.022,.035,0,h+.014,z-.131,M.titanium,.006);
  }
  for(let x=-1.78;x<2;x+=.895)for(let z=-2.95;z<2.65;z+=1.08){box(deck,'pilot_well_floor_panel',.869,.028,1.052,x,.03,z,M.floor,.008);}
  // Drainage and service access stay at the perimeter, clear of circulation.
  for(const s of [-1,1])for(let z=-4.0;z<5.5;z+=1.4){
    box(deck,'service_trench',.27,.015,1.22,s*5.99,.338,z,M.black,.01);
    for(let j=0;j<10;j++)box(deck,'trench_crossbar',.25,.018,.024,s*5.99,.35,z-.54+j*.12,M.secondary,.003);
  }
  // Physical attachment of the pilot island: rubber bed, load frame, metallic lip.
  deckPoly(deck,'pilot_island_isolator',[[-1.08,-2.25],[1.08,-2.25],[1.5,-1.50],[1.5,1.53],[.94,2.02],[-.94,2.02],[-1.5,1.53],[-1.5,-1.5]],.075,.086,M.rubber);
  deckPoly(deck,'pilot_island_pan',[[-1.03,-2.20],[1.03,-2.2],[1.43,-1.46],[1.43,1.5],[.90,1.96],[-.90,1.96],[-1.43,1.5],[-1.43,-1.46]],.04,.121,M.secondary);

  const shell=group(interior,'02_PRESSURE_SHELL_AND_LINERS');
  for(const s of [-1,1]){
    box(shell,'side_pressure_wall',.25,3.34,11.82,s*6.48,1.86,.48,M.structure,.04);
    for(let j=0;j<5;j++){
      const z=-4.38+j*2.19;
      box(shell,'lower_wall_kick_armor',.19,.54,2.13,s*6.24,.63,z,M.secondary,.035);
      box(shell,'upper_service_wall_liner',.13,1.19,2.13,s*6.28,2.75,z,M.cladding,.035);
      box(shell,'wall_liner_rebate',.17,.047,1.87,s*6.19,3.29,z,M.black,.01);
      for(const zz of [z-.86,z+.86])bolt(shell,s*6.185,2.31,zz,'x');
      // Angled shoulder panels bridge the vertical wall and flat crown.
      const shoulder=box(shell,'sloped_shoulder_liner',1.92,.12,2.1,s*5.64,4.08,z,M.cladding,.03);
      shoulder.rotation.z=-s*Math.atan2(1.43,1.43);
      box(shell,'shoulder_panel_edge',.055,.065,1.90,s*5.21,4.48,z,M.secondary,.009);
    }
    // Longitudinal trunk is tied to each structural frame.
    box(shell,'continuous_shoulder_service_trunk',.31,.33,11.24,s*5.90,3.31,.20,M.black,.03);
    for(const dy of [0,.12])tube(shell,'protected_longitudinal_conduit',[[s*5.70,3.19+dy,-5.31],[s*5.70,3.19+dy,5.88]],.028,M.secondary);
    for(let z=-4.95;z<6;z+=.74)box(shell,'conduit_saddle',.12,.32,.045,s*5.70,3.25,z,M.titanium,.008);
  }
  // A finished ceiling, broken into quiet panels rather than an exposed void.
  for(let x=-4.12;x<4.6;x+=1.66)for(let z=-5.10;z<6;z+=1.87){
    box(shell,'crown_acoustic_liner',1.63,.14,1.83,x,4.91,z,M.cladding,.025);
    box(shell,'ceiling_panel_recess',1.12,.035,1.26,x,4.825,z,M.secondary,.04);
  }
  box(shell,'crown_backing_plate',10.18,.25,12.55,0,5.08,.24,M.structure,.02);
  // Fore overhead slope fills the transition into the observation brow.
  polygon(shell,'forward_roof_armor',[[-5.60,4.48],[-4.8,4.97],[4.8,4.97],[5.6,4.48]],1.68,M.structure,0,0,-6.12,.025);

  const ribs=group(interior,'03_CONTINUOUS_LOAD_FRAMES');
  const cross=[[-6.15,.29],[-6.15,2.99],[-5.91,3.48],[-4.65,4.61],[4.65,4.61],[5.91,3.48],[6.15,2.99],[6.15,.29]];
  for(const z of [-4.65,-.45,3.82]){
    const g=group(ribs,'transverse_pressure_frame',0,0,z);
    for(let i=0;i<cross.length-1;i++){
      const a=cross[i],b=cross[i+1];
      beam(g,'main_box_girder',[a[0],a[1],0],[b[0],b[1],0],.34,.43,M.structure,.032);
      // A narrow inner flange makes each member read as a fabricated girder.
      beam(g,'frame_face_flange',[a[0],a[1],.245],[b[0],b[1],.245],.41,.055,M.secondary,.012);
      beam(g,'frame_rear_flange',[a[0],a[1],-.245],[b[0],b[1],-.245],.40,.055,M.structure,.012);
    }
    for(const s of [-1,1]){
      box(g,'frame_foot_socket',.62,.51,.77,s*6.03,.55,0,M.secondary,.04);
      polygon(g,'shoulder_connection_plate',[[s*6.11,3.02],[s*5.93,3.7],[s*5.2,4.22],[s*5.13,3.95],[s*5.72,3.38]],.065,M.titanium,0,0,.28,.025);
      for(let k=0;k<3;k++)bolt(g,s*(5.45+k*.21),3.89-k*.21,.323,'z',.027);
      for(const dz of [-.20,.20])bolt(g,s*6.06,.82,dz,'y',.027);
      box(g,'frame_inner_impact_pad',.20,1.21,.55,s*5.93,1.78,0,M.rubber,.055);
    }
  }
  // Two suspended central longitudinal keel members carry the tactical mount.
  for(const s of [-1,1]){
    box(ribs,'upper_keel_box_beam',.30,.38,11.86,s*1.87,4.52,.30,M.structure,.035);
    box(ribs,'upper_keel_lower_flange',.41,.045,11.89,s*1.87,4.303,.30,M.titanium,.012);
    for(let z=-4.65;z<5;z+=2.11){box(ribs,'keel_joining_collars',.42,.45,.12,s*1.87,4.53,z,M.secondary,.02);}
  }
  buildObservationWindows();
  buildForwardCompressionFrame();
  buildSideInstallations();
  buildArchitecturalLuminaires();
}

function buildForwardCompressionFrame(){
  const g=group(interior,'03B_FORWARD_COMPRESSION_YOKE');
  for(const s of [-1,1]){
    const x=s*4.31,z=-3.81;
    box(g,'yoke_deck_spreader',.91,.15,1.04,x,.39,z,M.structure,.045);
    box(g,'yoke_base_flange',.75,.095,.83,x,.502,z,M.titanium,.026);
    for(const dx of [-.28,.28])for(const dz of [-.29,.29]){
      cylinder(g,'base_bolt_washer',.042,.008,x+dx,.557,z+dz,M.black,16);
      bolt(g,x+dx,.568,z+dz,'y',.031);
    }
    const a=[s*4.31,.54,z],b=[s*5.24,3.32,z-.12],c=[s*2.09,4.47,z-.12];
    beam(g,'splayed_compression_box_member',a,b,.25,.42,M.structure,.032);
    beam(g,'compression_inner_face_flange',[a[0]-.014*s,a[1],a[2]+.25],[b[0]-.014*s,b[1],b[2]+.25],.31,.05,M.secondary,.012);
    beam(g,'compression_rear_face_flange',[a[0],a[1],a[2]-.25],[b[0],b[1],b[2]-.25],.30,.05,M.structure,.012);
    beam(g,'inward_raked_shoulder',b,c,.26,.42,M.structure,.028);
    beam(g,'shoulder_inner_flange',[b[0],b[1],b[2]+.25],[c[0],c[1],c[2]+.25],.31,.05,M.secondary,.012);
    const plate=[[s*5.03,3.06],[s*5.40,3.27],[s*5.24,3.62],[s*4.83,3.67],[s*4.78,3.43]];
    polygon(g,'shoulder_doubler_plate',plate,.06,M.titanium,0,0,z+.22,.020);
    for(const p of [[5.14,3.22],[5.25,3.43],[5.04,3.54],[4.89,3.48]])bolt(g,s*p[0],p[1],z+.265,'z',.024);
    // A removable inner wear plate leaves the girder's depth visible at both sides.
    beam(g,'lower_column_replaceable_armor',[s*4.42,.83,z+.28],[s*4.87,2.15,z+.235],.19,.03,M.cladding,.014);
    for(const yy of [.92,1.83]){
      const xx=s*(4.31+(yy-.54)*(.93/2.78));bolt(g,xx,yy,z+.31,'z',.018);
    }
    box(g,'upper_yoke_keel_socket',.65,.25,.77,s*1.94,4.46,z-.12,M.structure,.035);
    box(g,'yoke_service_coupling',.23,.31,.24,s*4.57,1.09,z-.11,M.black,.025);
    tube(g,'protected_column_service_line',[[s*4.45,.58,z-.25],[s*4.78,1.65,z-.30],[s*5.26,3.20,z-.36]],.026,M.secondary);
  }
  box(g,'forward_yoke_crown_tie',4.05,.21,.43,0,4.48,-3.93,M.structure,.024);
}

function buildObservationWindows(){
  const g=group(interior,'04_LAMINATED_OBSERVATION_ASSEMBLY');
  // A continuous forward pane keeps the combat sightline clear. Pressure frame,
  // replaceable seals and faceted side glazing retain the original construction.
  const panels=[{x:0,w:8.28,h:3.75,cy:2.525}];
  const front=group(g,'central_pressure_window',0,0,-7.07);front.rotation.x=.145;
  for(const p of panels){
    const outer=chamferRect(p.w+.20,p.h+.22,.21,p.x,p.cy),inner=chamferRect(p.w-.05,p.h-.02,.19,p.x,p.cy);
    frameShape(front,'deep_armored_window_reveal',outer,inner,.40,M.structure,0,0,0,.035);
    frameShape(front,'window_inner_retainer',chamferRect(p.w+.08,p.h+.11,.21,p.x,p.cy),chamferRect(p.w-.10,p.h-.075,.17,p.x,p.cy),.06,M.titanium,0,0,.253,.014);
    frameShape(front,'continuous_pressure_seal',chamferRect(p.w-.08,p.h-.055,.18,p.x,p.cy),chamferRect(p.w-.15,p.h-.12,.16,p.x,p.cy),.027,M.rubber,0,0,.278,.004);
    const glass=mesh(front,'observation_glazing',new T.ShapeGeometry(shape2(chamferRect(p.w-.14,p.h-.11,.17,p.x,p.cy))),M.glass,0,0,.13);glass.castShadow=false;
    for(const dx of [-p.w*.5-.035,p.w*.5+.035])for(const dy of [-p.h*.5-.035,0,p.h*.5+.035])bolt(front,p.x+dx,p.cy+dy,.305,'z',.028);
    box(front,'lower_glass_heater_sill',p.w-.18,.10,.13,p.x,p.cy-p.h/2+.04,.285,M.secondary,.018);
  }
  polygon(front,'window_lower_pressure_bulkhead',[[-4.29,.03],[4.29,.03],[4.29,.62],[-4.29,.62]],.45,M.structure,0,0,-.01,.03);
  for(let x=-3.35;x<4;x+=1.68){
    box(front,'bow_lower_service_panel',1.55,.36,.07,x,.32,.29,M.cladding,.03);
    slotBank(front,x,.32,.339,3,1.07,.065,'z');
    box(front,'panel_pull_recess',.18,.04,.025,x,.445,.335,M.black,.010);
  }
  box(front,'armored_window_brow',8.63,.22,.52,0,4.52,-.02,M.structure,.045);
  box(front,'brow_inner_return',8.05,.045,.10,0,4.38,.272,M.secondary,.012);
  for(const s of [-1,1]){
    const cheek=group(g,'faceted_side_window',s*5.12,0,-5.84);cheek.rotation.y=-s*.77;cheek.rotation.x=.10;
    const out=chamferRect(2.94,3.90,.27,0,2.48),inn=chamferRect(2.55,3.50,.23,0,2.48);
    frameShape(cheek,'cheek_deep_reveal',out,inn,.45,M.structure,0,0,0,.035);
    frameShape(cheek,'cheek_glazing_clamp',chamferRect(2.68,3.63,.23,0,2.48),chamferRect(2.54,3.49,.21,0,2.48),.065,M.titanium,0,0,.26,.014);
    frameShape(cheek,'cheek_elastomer_seal',chamferRect(2.55,3.51,.22,0,2.48),chamferRect(2.47,3.43,.20,0,2.48),.027,M.rubber,0,0,.29,.004);
    mesh(cheek,'cheek_glazing',new T.ShapeGeometry(shape2(inn)),M.glass,0,0,.12);
    box(cheek,'cheek_lower_wall',2.95,.62,.42,0,.33,0,M.structure,.035);
    box(cheek,'cheek_lower_panel',2.50,.30,.085,0,.34,.26,M.cladding,.025);
    for(const x of [-1.30,1.30])for(const y of [.82,2.48,4.12])bolt(cheek,x,y,.311,'z',.027);
    box(cheek,'cheek_brow',3.03,.21,.49,0,4.52,0,M.structure,.03);
    // Knee-height crash rail is attached to the bow walkway structure.
    tube(cheek,'window_protection_rail',[[-1.28,.40,.69],[-1.28,1.05,.69],[-1.10,1.18,.69],[1.10,1.18,.69],[1.28,1.05,.69],[1.28,.4,.69]],.032,M.secondary);
  }
  // Corner fillers seal the shell behind the heavy diagonal window jambs.
  for(const s of [-1,1]){
    beam(g,'forward_corner_stanchion',[s*4.31,.35,-6.53],[s*4.34,4.50,-6.32],.22,.35,M.structure,.035);
    box(g,'forward_outer_wall_return',.40,3.6,1.15,s*6.22,2.05,-4.78,M.structure,.04);
  }
}

function buildSideInstallations(){
  const g=group(interior,'05_WALL_EQUIPMENT_AND_WING_STATIONS');
  for(const s of [-1,1]){
    // Integrated wall cabinets follow one repeatable rack module.
    for(const z of [-2.98,1.33,4.83]){
      const rack=group(g,'wall_mounted_service_rack',s*5.77,.30,z);rack.rotation.y=-s*Math.PI/2;
      // Negative local Z reaches the pressure wall. Lower triangulated brackets
      // carry the rack mass; upper ties resist overturning without moving it.
      for(const x of [-.64,.64]){
        box(rack,'rack_lower_wall_anchor',.19,.43,.07,x,.35,-.603,M.secondary,.014);
        box(rack,'rack_lower_load_arm',.11,.10,.46,x,.40,-.365,M.structure,.012);
        beam(rack,'rack_lower_diagonal_gusset',[x,.16,-.579],[x,.37,-.155],.050,.055,M.titanium,.009);
        box(rack,'rack_upper_wall_anchor',.19,.25,.07,x,1.45,-.603,M.secondary,.014);
        box(rack,'rack_upper_restraint_tie',.10,.075,.46,x,1.45,-.365,M.structure,.010);
      }
      box(rack,'rack_welded_backframe',1.70,1.53,.30,0,.92,0,M.structure,.04);
      for(const x of [-.81,.81])box(rack,'rack_vertical_mounting_rail',.07,1.55,.44,x,.92,.03,M.titanium,.012);
      for(let j=0;j<3;j++){
        box(rack,'replaceable_system_cartridge',1.46,.405,.36,0,.40+j*.46,.205,j===1?M.cladding:M.secondary,.035);
        box(rack,'cartridge_end_recess',1.17,.255,.035,0,.40+j*.46,.402,M.black,.02);
        slotBank(rack,-.15,.40+j*.46,.428,4,.75,.047,'z');
        for(const x of [-.65,.65]){bolt(rack,x,.40+j*.46,.407,'z',.02);}
        box(rack,'recessed_lock_tab',.09,.16,.052,.57,.40+j*.46,.43,M.copper,.011);
      }
      box(rack,'rack_integrated_luminaire',1.12,.042,.10,0,1.75,.21,M.whiteLight,.012);
      for(let k=0;k<4;k++)box(rack,'connector_port',.06,.065,.07,.56,1.67-k*.105,.42,k===0?M.cyanLight:M.black,.009);
    }
    // Wall handrail is interrupted only at the equipment rack attachments.
    for(const z of [-.85,3.15]){
      for(const dz of [-.42,.42])box(g,'handhold_wall_anchor',.075,.15,.16,s*6.36,1.12,z+dz,M.secondary,.012);
      tube(g,'handhold',[[s*6.36,1.12,z-.42],[s*5.60,1.12,z-.42],[s*5.60,1.12,z+.42],[s*6.36,1.12,z+.42]],.028,M.titanium);
    }
    const station=group(g,'wing_operator_station',s*3.72,.31,-1.05);
    // Cross-section side cheeks are tapered fabricated parts, not boxes.
    for(const x of [-.72,.72]){
      polygon(station,'station_side_cheek',[[-.66,.1],[.40,.1],[.61,.65],[.42,.89],[-.61,.84],[-.77,.55]],.095,M.structure,x,0,0,.035,[0,Math.PI/2,0]);
      box(station,'station_floor_anchor',.26,.09,1.12,x,.07,.02,M.secondary,.025);
      for(const z of [-.4,.38])bolt(station,x,.124,z,'y',.025);
    }
    box(station,'station_lower_crossmember',1.51,.17,.34,0,.29,.28,M.structure,.035);
    box(station,'station_top_armor',1.57,.14,.94,0,.83,-.02,M.secondary,.065,[-.10,0,0]);
    box(station,'station_inset_blank_equipment_cover',1.33,.035,.61,0,.928,-.06,M.black,.04,[-.1,0,0]);
    box(station,'station_glazed_unpowered_surface',1.17,.012,.45,0,.946,-.08,M.lens,.035,[-.10,0,0]);
    for(const x of [-.64,.64]){
      box(station,'station_grab_grip',.052,.055,.50,x,.976,.01,M.rubber,.018,[-.1,0,0]);
      for(const z of [-.34,.30])bolt(station,x,.93,z,'y',.017);
    }
    // Deliberately physical controls with no markings or display content.
    for(let k=0;k<5;k++)cylinder(station,'guarded_rotary_control',.035,.028,-.43+k*.21,.976,.25,k===4?M.copper:M.titanium,12);
    tube(station,'flexible_power_loom',[[.60,.58,-.38],[.77,.46,-.44],[.65,.20,-.46],[.47,.12,-.42]],.026,M.rubber);
    // Two open access paths between island, wing seats and outer service band.
    const postZ=2.12;
    for(const z of [postZ,postZ+1.12]){
      box(g,'aisle_edge_stanchion',.07,.78,.10,s*2.68,.765,z,M.secondary,.014);
      box(g,'stanchion_foot',.24,.06,.28,s*2.68,.355,z,M.structure,.016);
    }
    tube(g,'short_aft_aisle_handrail',[[s*2.68,1.08,postZ-.05],[s*2.68,1.15,postZ+.07],[s*2.68,1.15,postZ+1.06],[s*2.68,1.08,postZ+1.20]],.028,M.titanium);
  }
}

function buildArchitecturalLuminaires(){
  const g=group(interior,'06_RECESSED_WORK_LIGHT_FIXTURES');
  for(const s of [-1,1])for(const z of [-3.21,1.67,5.03]){
    const fixture=group(g,'shielded_overhead_luminaire',s*3.86,4.70,z);
    box(fixture,'luminaire_recess',.68,.13,1.58,0,0,0,M.black,.04);
    box(fixture,'luminaire_bezel',.55,.075,1.44,0,-.048,0,M.titanium,.028);
    box(fixture,'frosted_diffuser',.44,.018,1.30,0,-.091,0,M.whiteLight,.02);
    for(const dz of [-.42,0,.42])box(fixture,'anti_glare_baffle',.47,.062,.027,0,-.12,dz,M.structure,.005);
  }
  for(const s of [-1,1])for(const z of [-2.25,2.15]){
    box(g,'wall_wash_hood',.16,.14,.9,s*5.88,3.01,z,M.structure,.022);
    box(g,'wall_wash_lens',.08,.034,.73,s*5.82,2.934,z,M.whiteLight,.012);
  }
}


/* ===== equipment.js ===== */
function buildPilotEquipment(){
  const g=group(interior,'07_PILOT_CONSOLES_AND_HOLOGRAPHIC_MOUNTS');
  for(const s of [-1,1]){
    const pod=group(g,s<0?'port_pilot_console':'starboard_pilot_console',s*1.48,.08,-.65);pod.rotation.y=-s*.09;pod.scale.y=.82;
    // A tapered, hollow-backed armored pod is carried by two real support webs.
    for(const z of [-.74,.43]){
      polygon(pod,'console_cantilever_web',[[-.32,.04],[.29,.04],[.37,.67],[.22,.78],[-.22,.70]],.10,M.structure,0,0,z,.025);
      box(pod,'console_floor_shoe',.79,.08,.32,0,.06,z,M.secondary,.025);
      for(const x of [-.29,.29])bolt(pod,x,.112,z,'y',.022);
      cylinder(pod,'console_isolation_bushing',.08,.13,-s*.14,.27,z,M.rubber,16,.08,[Math.PI/2,0,0]);
    }
    // Side profile gently rises toward the bow, with no floating intersecting blocks.
    for(const x of [-.40,.40]){
      const cheek=group(pod,'console_side_armor_and_access_hatch',x,0,0);cheek.rotation.y=Math.PI/2;
      const face=x<0?-1:1;
      const outline=[[-1.05,.61],[-1.10,.83],[-.86,.96],[.47,.83],[.70,.60],[.52,.40],[-.81,.43]];
      frameShape(cheek,'faceted_console_side_shell',outline,chamferRect(.86,.29,.035,-.13,.656),.075,M.secondary,0,0,0,.025);
      polygon(cheek,'recessed_hatch_gasket',chamferRect(.858,.288,.034,-.13,.656),.016,M.rubber,0,0,face*.014,.003);
      polygon(cheek,'removable_electronics_service_hatch',chamferRect(.811,.244,.026,-.13,.656),.018,M.structure,0,0,face*.034,.008);
      for(const xx of [-.61,.35])for(const yy of [.53,.79])bolt(cheek,xx,yy,face*.063,'z',.017);
      for(const xx of [-.45,.19])bolt(cheek,xx,.656,face*.053,'z',.013);
      box(cheek,'flush_hatch_handle_recess',.17,.051,.015,-.13,.636,face*.049,M.black,.008);
      box(cheek,'flush_hatch_pull',.114,.018,.017,-.13,.635,face*.060,M.titanium,.005);
      box(cheek,'hatch_lock_tab',.042,.060,.018,-.13,.735,face*.055,M.copper,.006);
    }
    box(pod,'console_inner_electronics_tray',.72,.16,1.52,0,.59,-.20,M.black,.04);
    box(pod,'console_deck_casting',.83,.16,1.79,0,.82,-.14,M.cladding,.065,[.075,0,0]);
    box(pod,'matte_inset_operator_surface',.66,.039,1.53,0,.916,-.16,M.black,.035,[.075,0,0]);
    box(pod,'near_wrist_roll',.63,.07,.17,0,.918,.54,M.rubber,.05);
    for(let j=0;j<3;j++){
      box(pod,'blank_removable_service_tile',.54,.025,.26,0,.913+j*.027,.30-j*.35,M.secondary,.026,[.075,0,0]);
      for(const x of [-.20,.20])bolt(pod,x,.932+j*.027,.30-j*.35,'y',.014);
    }
    // Physical switches remain sparse; there is no simulated interface.
    for(let j=0;j<3;j++){
      const zz=.30-j*.35,yy=.9255+j*.027;cylinder(pod,'control_recess',.047,.012,s*.16,yy+.006,zz,M.black,16);
      cylinder(pod,'knurled_selector',.033,.035,s*.16,yy+.0295,zz,j===2?M.copper:M.titanium,16);
    }
    for(let j=0;j<7;j++)box(pod,'underside_heat_exchanger_fin',.51,.07,.028,0,.48,-.72+j*.105,M.titanium,.005);
    tube(pod,'console_power_umbilical',[[s*.19,.48,-.79],[s*.22,.33,-.85],[s*.34,.20,-.71],[s*.33,.09,-.59]],.032,M.rubber);
    // Root -> trunnion -> articulated carrier -> projector bar.
    const mount=group(pod,'holographic_panel_mechanical_carrier',0,0,-.65);mount.rotation.y=-s*.13;
    box(mount,'projector_base_housing',.68,.105,.38,0,.99,0,M.structure,.04);
    cylinder(mount,'azimuth_bearing_flange',.16,.052,0,1.053,0,M.titanium,32);
    cylinder(mount,'azimuth_bearing_race',.126,.055,0,1.095,0,M.black,32);
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])bolt(mount,Math.cos(a)*.12,1.087,Math.sin(a)*.12,'y',.014);
    for(const x of [-.18,.18]){
      polygon(mount,'trunnion_fork_cheek',[[-.11,1.11],[.10,1.11],[.12,1.39],[-.02,1.44],[-.13,1.26]],.05,M.secondary,x,0,0,.016,[0,Math.PI/2,0]);
      cylinder(mount,'tilt_pivot_cap',.075,.053,x*1.19,1.337,-.025,M.titanium,24,.075,[0,0,Math.PI/2]);
    }
    const carrier=group(mount,'replaceable_holographic_emitter_bar',0,1.36,-.025);carrier.rotation.x=.18;
    box(carrier,'emitter_bar_backbone',.90,.105,.18,0,0,0,M.structure,.04);
    box(carrier,'emitter_optical_recess',.74,.025,.115,0,.059,0,M.black,.016);
    box(carrier,'dark_optical_emitter_window',.62,.012,.056,0,.078,-.018,M.lens,.013);
    for(const x of [-.37,.37]){
      polygon(carrier,'outboard_emitter_cheek',[[-.064,-.06],[.060,-.06],[.076,.23],[.015,.28],[-.052,.22]],.13,M.structure,x,0,0,.016);
      polygon(carrier,'narrow_machined_cheek_insert',[[-.041,.031],[-.009,.031],[.007,.21],[-.018,.233],[-.041,.21]],.017,M.titanium,x,0,.081,.005);
      box(carrier,'upright_optical_recess',.021,.16,.035,x+.024,.127,.079,M.black,.006);
      box(carrier,'small_optical_lens',.015,.037,.013,x+.024,.11,.102,M.lens,.004);
      bolt(carrier,x+.022,.238,.088,'z',.012);
      cylinder(carrier,'panel_trunnion_fastener',.026,.019,x,.01,.11,M.titanium,8,.026,[Math.PI/2,0,0]);
    }
    box(carrier,'single_status_lens',.028,.012,.027,.28,.08,.025,M.cyanLight,.007);
    const anchor=group(carrier,s<0?'EMPTY_PORT_HOLOGRAM_ANCHOR':'EMPTY_STARBOARD_HOLOGRAM_ANCHOR',0,.37,0);anchor.userData={purpose:'future holographic panel, no content',width:.70,height:.48};
    tube(mount,'shielded_hinge_cable',[[s*.22,1.005,-.08],[s*.26,1.18,-.17],[s*.25,1.35,-.10],[s*.23,1.37,.0]],.018,M.rubber);
  }
  buildCentralProjector();
  buildOverheadMount();
}

function buildCentralProjector(){
  const g=group(interior,'08_LOW_CENTRAL_HOLOGRAPHIC_DISC',0,0,-1.24);
  // Compact lathed pressure housing. No cone, beam or rendered hologram exists.
  const profile=[[0,.12],[.43,.12],[.49,.145],[.49,.19],[.40,.23],[.38,.43],[.45,.52],[.65,.60],[.77,.62],[.83,.66],[.84,.72],[.82,.765],[.74,.78],[0,.78]];
  mesh(g,'machined_projector_pressure_housing',new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),M.structure);
  cylinder(g,'isolation_drum',.39,.22,0,.32,0,M.rubber,48);
  ring(g,'lower_bearing_seal',.465,.017,0,.17,0,M.black);
  ring(g,'housing_parting_line',.817,.012,0,.725,0,M.black);
  ring(g,'machined_outer_retaining_lip',.798,.018,0,.774,0,M.titanium);
  cylinder(g,'optical_bed_recess',.75,.019,0,.782,0,M.black,96);
  cylinder(g,'inert_optical_disc',.656,.012,0,.795,0,M.lens,96);
  ring(g,'inner_disc_retainer',.646,.010,0,.805,0,M.titanium);
  cylinder(g,'center_ceramic_lens',.30,.011,0,.805,0,M.black,64);
  ring(g,'central_lens_seal',.307,.008,0,.814,0,M.secondary);
  // Replaceable radial optical cartridges and indexed captive bolts.
  for(let k=0;k<16;k++){
    const a=k*Math.PI/8,px=Math.cos(a),pz=Math.sin(a);
    const part=group(g,'radial_optical_cartridge',px*.713,.805,pz*.713);part.rotation.y=-a;
    box(part,'cartridge_beveled_cover',.095,.035,.138,0,0,0,M.secondary,.012);
    box(part,'cartridge_lens_well',.042,.012,.086,0,.025,0,M.black,.006);
    box(part,'projector_emitter_aperture',.025,.005,.059,0,.033,0,M.lens,.004);
    bolt(g,px*.775,.800,pz*.775,'y',.015);
    if(k%4===0){
      box(part,'indexing_tab',.032,.012,.030,-.029,.026,.069,M.copper,.004);
      box(part,'low_power_status_indicator',.014,.008,.019,0,.039,-.044,M.cyanLight,.004);
    }
  }
  for(let k=0;k<4;k++){
    const a=Math.PI/4+k*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
    beam(g,'pedestal_load_arm',[c*.28,.17,s*.28],[c*.56,.13,s*.56],.105,.13,M.secondary,.018);
    box(g,'pedestal_floor_attachment',.19,.055,.21,c*.57,.144,s*.57,M.titanium,.017,[0,-a,0]);
    bolt(g,c*.57,.18,s*.57,'y',.025);
    cylinder(g,'housing_radial_port',.072,.073,c*.476,.45,s*.476,M.secondary,16,.072,[s*Math.PI/2,0,-c*Math.PI/2]);
  }
  // Modest undercut heat sink; all vanes are functional and regularly spaced.
  for(let k=0;k<28;k++){
    const a=k*Math.PI*2/28;
    box(g,'underside_radial_heat_sink',.125,.052,.018,Math.cos(a)*.68,.60,Math.sin(a)*.68,M.titanium,.004,[0,-a,0]);
  }
  const anchor=group(g,'EMPTY_CENTRAL_HOLOGRAM_ANCHOR',0,.83,0);anchor.userData={purpose:'future circular holographic volume, intentionally empty',radius:.66};
}

function buildOverheadMount(){
  const g=group(interior,'09_OVERHEAD_TACTICAL_HOUSING',0,0,-1.10);
  box(g,'keel_to_screen_mount_crossmember',4.06,.16,.31,0,4.29,-1.65,M.structure,.025);
  for(const s of [-1,1]){
    box(g,'tactical_keel_attachment',.53,.16,.76,s*1.18,4.33,-1.65,M.structure,.03);
    for(const z of [-1.89,-1.42])bolt(g,s*1.18,4.234,z,'y',.028);
    beam(g,'suspended_tactical_carrier',[s*1.18,4.26,-1.63],[s*1.024,3.82,-1.92],.14,.18,M.secondary,.018);
    beam(g,'carrier_reaction_brace',[s*1.18,4.24,-1.32],[s*1.024,3.90,-1.87],.06,.07,M.titanium,.010);
    cylinder(g,'tactical_pitch_axis',.08,.18,s*1.152,3.796,-1.91,M.structure,24,.08,[0,0,Math.PI/2]);
    cylinder(g,'tactical_pivot_lock',.054,.02,s*1.26,3.796,-1.91,M.titanium,12,.054,[0,0,Math.PI/2]);
    tube(g,'tactical_power_loom',[[s*1.0,4.27,-1.70],[s*.96,4.15,-1.94],[s*.82,3.90,-2.10],[s*.824,3.79,-2.00]],.028,M.rubber);
  }
  const screen=group(g,'empty_tactical_screen_enclosure',0,3.48,-1.91);screen.rotation.x=.16;screen.scale.set(.8,.8,1);
  const outer=chamferRect(3.18,.92,.14),inner=chamferRect(2.83,.64,.08);
  frameShape(screen,'tactical_cast_outer_shell',outer,inner,.23,M.structure,0,0,0,.028);
  frameShape(screen,'tactical_inner_machined_bezel',chamferRect(2.94,.75,.10),inner,.056,M.titanium,0,0,.142,.012);
  frameShape(screen,'tactical_black_gasket',chamferRect(2.84,.65,.081),chamferRect(2.77,.58,.063),.020,M.rubber,0,0,.173,.004);
  polygon(screen,'unpowered_recess_backplate',chamferRect(2.87,.67,.085),.045,M.black,0,0,-.089,.012);
  // No pixels, marks, text, render target or simulated screen content.
  for(let k=0;k<7;k++)box(screen,'rear_cooling_rib',2.44,.023,.066,0,-.255+k*.085,-.155,M.secondary,.007);
  for(const x of [-1.43,1.43])for(const y of [-.285,.285])bolt(screen,x,y,.194,'z',.024);
  for(const x of [-1.24,1.24])box(screen,'screen_service_release_tab',.13,.060,.08,x,-.46,.006,M.copper,.009);
  const anchor=group(screen,'EMPTY_OVERHEAD_SCREEN_ANCHOR',0,0,.159);anchor.userData={width:2.77,height:.58,purpose:'future tactical screen, blank housing'};
}


function lightRig(){
  const lights=new T.Group();lights.name='12_LIGHTING_RIG';scene.add(lights);
  const ambient=new T.HemisphereLight(0xc4d1d3,0x46443e,1.00);ambient.name='soft_cabin_bounce';lights.add(ambient);
  const base=new T.AmbientLight(0x91a1a5,.10);base.name='minimum_shadow_detail';lights.add(base);
  function spot(name,color,intensity,x,y,z,tx,ty,tz,shadow=false){
    const l=new T.SpotLight(color,intensity,19,.93,.82,1.65);l.name=name;l.position.set(x,y,z);l.target.position.set(tx,ty,tz);lights.add(l,l.target);
    if(shadow){l.castShadow=true;l.shadow.mapSize.set(1536,1536);l.shadow.camera.near=.3;l.shadow.camera.far=18;l.shadow.bias=-.00014;l.shadow.normalBias=.025;l.shadow.radius=3;}
    return l;
  }
  spot('port_fore_diffuse_worklight',0xe8eee4,67,-3.83,4.48,-3.14,-1,.5,-1.6,true);
  spot('starboard_mid_diffuse_worklight',0xc8dce4,63,3.83,4.48,1.59,.2,.6,.8,true);
  spot('port_aft_worklight',0xe4e7df,57,-3.83,4.48,4.98,-2,1.6,4.7);
  spot('starboard_aft_worklight',0xd7e2df,50,3.83,4.48,4.98,2,1.7,4.8);
  spot('starboard_bow_worklight',0xdde6e2,40,3.83,4.48,-3.14,3,1.3,-5.2);
  spot('port_mid_worklight',0xdbe2dd,35,-3.83,4.48,1.59,-3.4,.7,0);
  const foreFill=new T.PointLight(0xa8c5d2,6.7,8,1.6);foreFill.name='brow_reflected_cabin_light';foreFill.position.set(0,3.9,-6.23);lights.add(foreFill);
  const cabinFill=new T.PointLight(0xdce3df,12.0,8,1.6);cabinFill.name='crown_indirect_fill';cabinFill.position.set(0,4.15,1.4);lights.add(cabinFill);
  for(const s of [-1,1]){
    const l=new T.PointLight(0xb82414,.65,2.0,2);l.name='aft_emergency_practical';l.position.set(s*1.29,2.74,5.75);lights.add(l);
    const task=new T.PointLight(0x7ca9bf,.38,1.2,2);task.name='projector_status_bounce';task.position.set(s*1.18,1.48,-.85);lights.add(task);
  }
  return lights;
}


  buildArchitecture();buildPilotEquipment();
  const seats=buildSeating({THREE:T,RoundedBoxGeometry,M});
  for(const chair of [...seats.children]){seats.remove(chair);if(Math.abs(chair.position.x)<.1)chair.position.y+=.125;chair.name='10_SEATING / '+chair.name;interior.add(chair);}
  const aft=buildAftBulkhead({THREE:T,RoundedBoxGeometry,M});aft.name='11_AFT_PRESSURE_BULKHEAD';interior.add(aft);
  const originalGeometry=new Set();interior.traverse(o=>{if(o.geometry)originalGeometry.add(o.geometry);});
  const stats=CONFIG.staticBatching?batchStatic(interior):{};
  if(CONFIG.staticBatching){const retained=new Set();interior.traverse(o=>{if(o.geometry)retained.add(o.geometry);});for(const g of originalGeometry)if(!retained.has(g))g.dispose();CACHE.clear();}
  const lights=lightRig(),environment=renderer?makeEnvironment(renderer):null;
  const baseline=new Map();lights.traverse(l=>{if(l.isLight)baseline.set(l,l.intensity);});
  const alarms=[];for(const side of [-1,1]){const l=new T.PointLight(0xf14b29,0,10,1.8);l.position.set(side*3,3,-1.6);lights.add(l);alarms.push(l);}
  const anchors={};interior.updateMatrixWorld(true);interior.traverse(o=>{if(o.name.startsWith('EMPTY_'))anchors[o.name]=o;});
  let disposed=false;
  return {root:scene,interior,lights,materials:M,config:CONFIG,stats,anchors,
    update({alert=false,flash=0}={},time=0){const pulse=alert?.5+.5*Math.sin(time*5):0;for(const [l,intensity]of baseline)l.intensity=intensity*(alert?.66:1)*(1-Math.min(.65,flash*.45));for(const l of alarms)l.intensity=pulse*32;M.redLight.emissiveIntensity=alert?1.4+pulse*1.8:1.4;},
    dispose(){if(disposed)return;disposed=true;const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);if(o.isLight)o.dispose?.();});for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const g of geometries)g.dispose();for(const t of textures)if(t!==environment?.texture)t.dispose();environment?.dispose();scene.clear();}
  };
}
