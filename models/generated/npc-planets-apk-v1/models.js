import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Authorable mesh recipes. Radius = 1. All visible details are real geometry;
// no billboards, image planes, remote textures or game-state dependencies.
export const entries = [
  {id:'outpost',name:'废弃前哨',ref:18,color:'#d3c8b7',tag:'裂谷 · 残骸',description:'灰白岩壳被三道深裂谷切开，暗橙核心从破口透出。'},
  {id:'garrison',name:'赤铁守备站',ref:20,color:'#f25b4d',tag:'装甲 · 红色电路',description:'黑红装甲包覆球面，错层机械板与防御节点构成封闭要塞。'},
  {id:'charon',name:'卡戎舰队',ref:19,color:'#c492ff',tag:'放射 · 能量节点',description:'紫色球壳布满放射节点，长短不一的能量矛改变整个外轮廓。'},
  {id:'cargo',name:'遗落货仓',ref:28,color:'#b2bdd5',tag:'分瓣 · 开启舱口',description:'大块分瓣仓壳、赤道运输轨与开启舱门，露出内部货运设施。'},
  {id:'fracture',name:'苍穹裂隙',ref:34,color:'#63d8ff',tag:'断壳 · 蓝色裂环',description:'上下机械壳分离，蓝色能量穿过破碎赤道，圆形接口嵌入装甲。'},
];
const TAU=Math.PI*2, Y=new THREE.Vector3(0,1,0);
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const spherical=(a,b,r=1)=>v(Math.cos(b)*Math.sin(a)*r,Math.sin(b)*r,Math.cos(b)*Math.cos(a)*r);
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const noise=(x,y,z)=>Math.sin(x*17.1+y*8.3)*Math.sin(y*13.8-z*9.4)*.5+Math.sin(x*31.8+z*21.7)*.25;
function material(color,metalness=.5,roughness=.6,emission=null,intensity=1){
  return new THREE.MeshStandardMaterial({color,metalness,roughness,flatShading:true,...(emission?{emissive:emission,emissiveIntensity:intensity}:{})});
}
function builder(id){
  const bins=new Map(),root=new THREE.Group();root.name=id;
  function add(geometry,mat,name,position=null,quaternion=null,scale=null){
    if(position||quaternion||scale)geometry.applyMatrix4(new THREE.Matrix4().compose(position||v(0,0,0),quaternion||new THREE.Quaternion(),scale||v(1,1,1)));
    geometry=geometry.index?geometry.toNonIndexed():geometry;
    // All merged meshes share the same attribute schema and flat normals.
    geometry.deleteAttribute('uv');geometry.deleteAttribute('normal');geometry.computeVertexNormals();
    const key=name; if(!bins.has(key))bins.set(key,{mat,parts:[]});bins.get(key).parts.push(geometry);
  }
  const radial=(geo,mat,name,n,r=1)=>add(geo,mat,name,n.clone().multiplyScalar(r),new THREE.Quaternion().setFromUnitVectors(Y,n));
  const box=(p,size,mat,name,q=null)=>add(new THREE.BoxGeometry(...size),mat,name,p,q);
  const line=(points,r,mat,name,sides=5)=>{
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],delta=b.clone().sub(a);if(delta.length()<1e-6)continue;
      add(new THREE.CylinderGeometry(r,r,delta.length(),sides,1),mat,name,a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(Y,delta.normalize()));}
  };
  const ring=(n,radius,tube,mat,name,distance=1)=>{
    // Torus normal is +Z; ports therefore follow the local radial surface normal.
    add(new THREE.TorusGeometry(radius,tube,5,32),mat,name,n.clone().multiplyScalar(distance),new THREE.Quaternion().setFromUnitVectors(v(0,0,1),n));
  };
  function finish(){for(const[name,{mat,parts}]of bins){const geometry=mergeGeometries(parts,false);geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;root.add(mesh);parts.forEach(g=>g.dispose());}return root;}
  return{add,radial,box,line,ring,finish};
}

// Closed, genuinely thick curved armor patch (all six sides), with controlled
// angular gaps. Arbitrary radius profile supports torn hemispherical shells.
function patch(a0,a1,b0,b1,r=1.02,thickness=.045,segments=4,profile=null){
  const coords=[];
  const point=(a,b,outer)=>spherical(a,b,(profile?profile(a,b):r)-(outer?0:thickness));
  const tri=(a,b,c)=>coords.push(...a.toArray(),...b.toArray(),...c.toArray());
  const quad=(a,b,c,d,reverse=false)=>reverse?(tri(a,c,b),tri(a,d,c)):(tri(a,b,c),tri(a,c,d));
  for(let j=0;j<segments;j++)for(let i=0;i<segments;i++){
    const a=a0+(a1-a0)*i/segments,A=a0+(a1-a0)*(i+1)/segments,b=b0+(b1-b0)*j/segments,B=b0+(b1-b0)*(j+1)/segments;
    for(const outer of [true,false])quad(point(a,b,outer),point(A,b,outer),point(A,B,outer),point(a,B,outer),!outer);
  }
  for(let i=0;i<segments;i++){
    const a=a0+(a1-a0)*i/segments,A=a0+(a1-a0)*(i+1)/segments;
    quad(point(a,b0,true),point(a,b0,false),point(A,b0,false),point(A,b0,true));
    quad(point(a,b1,true),point(A,b1,true),point(A,b1,false),point(a,b1,false));
    const b=b0+(b1-b0)*i/segments,B=b0+(b1-b0)*(i+1)/segments;
    quad(point(a0,b,true),point(a0,B,true),point(a0,B,false),point(a0,b,false));
    quad(point(a1,b,true),point(a1,b,false),point(a1,B,false),point(a1,B,true));
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));g.computeVertexNormals();return g;
}
function arc(a0,a1,b,r=1.03,count=36){return Array.from({length:count+1},(_,i)=>spherical(a0+(a1-a0)*i/count,b,r));}
function meridian(a,b0,b1,r=1.03,count=24){return Array.from({length:count+1},(_,i)=>spherical(a,b0+(b1-b0)*i/count,r));}
function port(B,n,size,materials,distance=1.035){
  B.radial(new THREE.CylinderGeometry(size,size*.93,.055,24),materials.dark,'port-wells',n,distance-.018);
  B.ring(n,size,.019,materials.metal,'port-rims',distance+.015);
  B.ring(n,size*.77,.007,materials.light,'port-energy-rings',distance+.024);
  B.radial(new THREE.CylinderGeometry(size*.27,size*.27,.07,10),materials.metal,'port-spindles',n,distance+.015);
  const q=new THREE.Quaternion().setFromUnitVectors(Y,n);
  for(let j=0;j<6;j++){const a=j*TAU/6,local=v(Math.cos(a)*size*.55,.028,Math.sin(a)*size*.55);local.applyQuaternion(q).addScaledVector(n,distance);
    B.box(local,[size*.25,.02,size*.17],materials.metal,'port-internals',q);}
}

function outpost(){
  const B=builder('outpost'),random=rng(18);
  const shell=material('#a3a9ae',.18,.88),dark=material('#20282e',.4,.8),metal=material('#56616a',.65,.65),ember=material('#f57824',.1,.7,'#ff6b16',2.1);
  const cuts=[{a:-.5,start:-.65,end:1.18,phase:0},{a:.12,start:-.43,end:1.03,phase:2},{a:.74,start:-.6,end:.87,phase:4},{a:2.4,start:-.7,end:.9,phase:3},{a:-2,start:-1.05,end:.6,phase:1}];
  const crackA=(c,b)=>c.a+.095*Math.sin(b*5+c.phase)+.035*Math.sin(b*14+c.phase);
  const depth=(a,b)=>{
    let d=0;for(const c of cuts){if(b<c.start||b>c.end)continue;const da=Math.atan2(Math.sin(a-crackA(c,b)),Math.cos(a-crackA(c,b)))*Math.cos(b),t=(b-c.start)/(c.end-c.start),w=.015+.045*Math.sin(t*Math.PI);
      d=Math.max(d,.16*Math.exp(-Math.pow(da/w,4)));}return d;
  };
  const geo=new THREE.IcosahedronGeometry(1,20),pos=geo.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++){const n=v(pos.getX(i),pos.getY(i),pos.getZ(i)).normalize(),a=Math.atan2(n.x,n.z),b=Math.asin(n.y),d=depth(a,b),r=1+.017*noise(n.x,n.y,n.z)-d;pos.setXYZ(i,n.x*r,n.y*r,n.z*r);}
  for(let i=0;i<pos.count;i+=3){const center=v(0,0,0);for(let j=0;j<3;j++)center.add(v(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j)));center.divideScalar(3);const n=center.clone().normalize(),d=depth(Math.atan2(n.x,n.z),Math.asin(n.y));
    const c=new THREE.Color(d>.055?'#292d31':'#a5aeb5');c.multiplyScalar(.86+random()*.25);if(n.y<-.2)c.lerp(new THREE.Color('#344b59'),Math.min(.65,(-n.y-.2)*.9));for(let j=0;j<3;j++)colors.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));shell.vertexColors=true;B.add(geo,shell,'fractured-rock-crust');
  for(const c of cuts){const points=[];for(let i=0;i<60;i++){const b=c.start+.06+(c.end-c.start-.12)*i/59;points.push(spherical(crackA(c,b),b,.857));}B.line(points,.006,ember,'exposed-ember-seams');}
  // Sparse buried ruins; the fissures, not the architecture, remain the landmark.
  for(let i=0;i<12;i++){const a=random()*TAU,b=(random()-.5)*1.8,n=spherical(a,b),q=new THREE.Quaternion().setFromUnitVectors(Y,n);if(depth(a,b)>.01)continue;
    B.box(n.clone().multiplyScalar(1.018),[.08+random()*.04,.035+random()*.05,.055],i%2?metal:dark,i%2?'ruined-metal':'ruined-foundations',q);
    if(i%3===0)B.radial(new THREE.ConeGeometry(.014,.15,4),metal,'snapped-masts',n,1.08);}
  return B.finish();
}

function garrison(){
  const B=builder('garrison'),random=rng(20);
  const dark=material('#17212c',.78,.46),red=material('#922725',.72,.42),red2=material('#c43c31',.65,.5),edge=material('#424753',.85,.4),glow=material('#ec3026',.35,.4,'#ff2517',2.2);
  B.add(new THREE.IcosahedronGeometry(.97,4),dark,'inner-armored-core');
  for(let j=0;j<9;j++)for(let i=0;i<18;i++){
    const a=(i+(j%2)*.45)*TAU/18,b=-1.45+j*2.9/9,skip=(i*7+j*3)%19<3;
    if(skip)continue;const mat=(i+j)%4===0?dark:(i+j)%3?red:red2,name=mat===dark?'black-armor':mat===red?'red-armor':'red-highlight-armor';
    B.add(patch(a+.012,a+TAU/18-.012,b+.012,b+2.9/9-.012,1.012+random()*.026,.045,3),mat,name);
    if((i+j)%3===0){const stripe=arc(a+.045,a+TAU/18-.045,b+.055,1.047,6);B.line(stripe,.005,glow,'red-circuit-traces');}
    if((i+j)%4===0){const n=spherical(a+.12,b+.12);B.radial(new THREE.CylinderGeometry(.018,.018,.025,6),edge,'armor-fasteners',n,1.045);}
  }
  for(const b of [-.45,.27]){B.line(arc(0,TAU,b,1.047,96),.008,glow,'red-circuit-traces');B.line(arc(0,TAU,b+.028,1.04,96),.018,dark,'armored-channel-lips');}
  for(let i=0;i<8;i++){const a=i*TAU/8+.2,n=spherical(a,i%2?.65:-.6),q=new THREE.Quaternion().setFromUnitVectors(Y,n);
    B.radial(new THREE.CylinderGeometry(.06,.09,.065,6),edge,'defense-foundations',n,1.03);
    B.box(n.clone().multiplyScalar(1.095),[.115,.065,.08],dark,'defense-batteries',q);
    for(const side of [-1,1]){const p=v(side*.032,.11,0).applyQuaternion(q).addScaledVector(n,1.045);B.add(new THREE.CylinderGeometry(.009,.015,.12,6),edge,'paired-defense-barrels',p,q);}
  }
  // Recessed pole reactors hold a strong sphere silhouette.
  const pm={dark,metal:edge,light:glow};port(B,spherical(.25,1.15),.15,pm,1.025);port(B,spherical(3,-1.15),.12,pm,1.025);
  return B.finish();
}

function charon(){
  const B=builder('charon'),random=rng(19),shell=material('#593479',.55,.58),dark=material('#1d1630',.75,.4),metal=material('#71568e',.75,.4),glow=material('#691dc4',.15,.38,'#800aff',1.7),tip=material('#b85fff',.1,.3,'#bf55ff',2);
  const geo=new THREE.IcosahedronGeometry(.99,9),p=geo.attributes.position,colors=[];shell.vertexColors=true;
  for(let i=0;i<p.count;i++){const n=v(p.getX(i),p.getY(i),p.getZ(i)).normalize(),r=.99+noise(n.x,n.y,n.z)*.011;p.setXYZ(i,n.x*r,n.y*r,n.z*r);const c=new THREE.Color('#72529c').multiplyScalar(.65+random()*.55);colors.push(c.r,c.g,c.b);}geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));B.add(geo,shell,'violet-faceted-crust');
  const count=27;
  for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,a=i*2.399963,b=Math.asin(y),n=spherical(a,b),length=.16+(i%5)*.057;
    B.radial(new THREE.CylinderGeometry(.043,.073,.045,8),dark,'radial-sockets',n,1.005);
    B.ring(n,.044,.008,metal,'socket-collars',1.035);
    B.radial(new THREE.CylinderGeometry(.02,.034,.052,8),glow,'violet-node-cores',n,1.055);
    B.radial(new THREE.ConeGeometry(.017,length,5),glow,'radial-energy-lances',n,1.078+length*.5);
    B.radial(new THREE.IcosahedronGeometry(.023,1),tip,'bright-node-caps',n,1.082);
    const points=meridian(a,b-Math.min(.26,(b+1.5)*.4),b,1.008,12);B.line(points,.004,glow,'surface-energy-feeds');
  }
  for(let i=0;i<7;i++){const b=-1.1+i*.34;B.line(arc(i*.3,i*.3+1.05,b,1.008,22),.004,metal,'violet-shell-inscriptions');}
  return B.finish();
}

function cargo(){
  const B=builder('cargo'),random=rng(28),dark=material('#222934',.7,.65),metal=material('#65748e',.68,.55),lightMetal=material('#8791a5',.65,.5),glow=material('#c55330',.2,.55,'#e45b2a',1.7),yellow=material('#ad8651',.5,.68);
  B.add(new THREE.IcosahedronGeometry(.89,4),dark,'inner-storage-sphere');
  for(let j=0;j<5;j++)for(let i=0;i<10;i++){
    const a=(i+(j%2)*.5)*TAU/10,b=-1.46+j*2.92/5;
    const opening=(j===2&&i===0)||(j===3&&i===1)||(j===1&&i===6);
    if(opening){
      // Lift a real curved hatch about a local hinge; it exposes internal cargo.
      const geo=patch(a+.025,a+TAU/10-.025,b+.027,b+2.92/5-.027,1.028,.055,5);
      const hinge=spherical(a,b+2.92/5),axis=spherical(a+Math.PI/2,0),m=new THREE.Matrix4().makeTranslation(-hinge.x,-hinge.y,-hinge.z);
      geo.applyMatrix4(m);geo.applyMatrix4(new THREE.Matrix4().makeRotationAxis(axis,-.52));geo.translate(hinge.x,hinge.y,hinge.z);B.add(geo,lightMetal,'raised-cargo-hatches');
      const n=spherical(a+.3,b+.27),q=new THREE.Quaternion().setFromUnitVectors(Y,n);
      for(let k=0;k<4;k++){const offset=v((k%2-.5)*.1,-.035,Math.floor(k/2)*.1-.05).applyQuaternion(q).addScaledVector(n,.955);B.box(offset,[.085,.075,.085],yellow,'visible-cargo-crates',q);}
    }else B.add(patch(a+.022,a+TAU/10-.022,b+.025,b+2.92/5-.025,1.01+random()*.016,.055,5),(i+j)%3?metal:lightMetal,(i+j)%3?'large-storage-panels':'light-storage-panels');
    if((i+j)%3===0){const n=spherical(a+.17,b+.15),q=new THREE.Quaternion().setFromUnitVectors(Y,n);B.box(n.clone().multiplyScalar(1.035),[.07,.018,.024],dark,'recessed-identification-slots',q);B.box(n.clone().multiplyScalar(1.046),[.035,.006,.008],yellow,'cargo-status-lamps',q);}
  }
  for(const b of [-.08,.08])B.line(arc(0,TAU,b,1.035,120),.019,dark,'equatorial-freight-rails');
  B.line(arc(0,TAU,0,1.035,120),.006,glow,'equatorial-guidance-strip');
  for(let i=0;i<6;i++)B.line(meridian(i*TAU/6+.18,-.75,.8,1.031,40),.005,glow,'storage-panel-routing');
  return B.finish();
}

function fracture(){
  const B=builder('fracture'),random=rng(34),dark=material('#101c25',.78,.62),metal=material('#3d4a58',.8,.52),lightMetal=material('#667582',.75,.48),blue=material('#064397',.15,.5,'#0071ff',1.5),white=material('#178ed1',.1,.45,'#16b0ff',1.8);
  // The center is a narrow exposed reactor, never an intact underlying sphere.
  B.add(new THREE.IcosahedronGeometry(.48,3),dark,'exposed-reactor-core');
  B.ring(Y,.49,.018,blue,'reactor-equator',0);
  for(let i=0;i<8;i++){const a=i*TAU/8;B.line([spherical(a,-.12,.48),spherical(a,-.15,.76),spherical(a,-.28,.94)],.027,dark,'lower-reactor-ribs');B.line([spherical(a,.12,.48),spherical(a,.15,.76),spherical(a,.28,.94)],.025,metal,'upper-reactor-ribs');}
  // Irregular, mechanically torn equatorial rim; each sector has its own edge.
  for(const sign of [-1,1])for(let row=0;row<4;row++)for(let i=0;i<20;i++){
    const a=i*TAU/20+(row%2)*.035,gap=.14+random()*.09;
    let lo=row===0?gap:.19+row*.31,hi=.19+(row+1)*.31;hi=Math.min(1.51,hi);
    if(sign<0)[lo,hi]=[-hi,-lo];
    const radius=sign>0?1.015:.93;
    const geo=patch(a+.008,a+TAU/20-.008,lo+.008,hi-.008,radius,.085,4);
    geo.translate(0,sign*.065,0);
    const mat=(i+row)%5===0?lightMetal:(i+row)%4===0?dark:metal;
    B.add(geo,mat,mat===lightMetal?'bright-mechanical-plates':mat===dark?'recessed-shell-plates':'broken-hemisphere-armor');
    if(row===0){
      const n=spherical(a+.13,sign*gap,radius),q=new THREE.Quaternion().setFromUnitVectors(Y,n.clone().normalize());n.y+=sign*.065;
      B.box(n,[.045,.08+random()*.09,.055],dark,'torn-rim-teeth',q);
      B.line([spherical(a+.02,sign*gap,radius+.008).add(v(0,sign*.065,0)),spherical(a+.25,sign*(gap+.015),radius+.008).add(v(0,sign*.065,0))],.006,blue,'broken-rim-energy');
    }
  }
  const pm={dark,metal:lightMetal,light:blue};
  for(const [a,b,size]of [[.48,.46,.19],[-.65,.75,.13],[1.65,.65,.15],[2.8,.5,.16],[-2.1,.4,.16],[.1,-.65,.16],[2.5,-.5,.13]]){
    const n=spherical(a,b),dist=b>0?1.067:.995;port(B,n,size,pm,dist);
  }
  // Recessed trenches and little grouped greebles follow the sphere instead of
  // standing up like a city. The upper silhouette retains APK 34's few spires.
  for(let i=0;i<68;i++){
    const a=random()*TAU,b=.4+random()*.85,n=spherical(a,b),q=new THREE.Quaternion().setFromUnitVectors(Y,n);
    B.box(n.clone().multiplyScalar(1.063),[.025+random()*.07,.025+random()*.035,.025+random()*.07],i%3?dark:lightMetal,i%3?'recessed-machinery':'raised-machinery',q);
  }
  for(let i=0;i<9;i++){const n=spherical(i*2.4,.9+random()*.5);B.radial(new THREE.CylinderGeometry(.012,.027,.09+random()*.06,5),lightMetal,'polar-antenna-spires',n,1.13);}
  // Several interrupted uneven plasma arcs, not a smooth Saturn ring.
  for(let j=0;j<5;j++){
    const points=[];for(let i=0;i<95;i++){const a=i/94*TAU,r=1.12+j*.052+.035*Math.sin(a*13+j)+.02*Math.sin(a*31);points.push(v(Math.sin(a)*r,.018*Math.sin(a*19+j)+j*.008-.04,Math.cos(a)*r));}
    for(let part=0;part<5;part++)B.line(points.slice(part*19,part*19+16),j===2?.009:.005,j===2?white:blue,j===2?'hot-plasma-filament':'blue-plasma-filaments',4);
  }
  for(let i=0;i<100;i++){const a=random()*TAU,r=1.04+random()*.42,p=v(Math.sin(a)*r,(random()-.5)*.13,Math.cos(a)*r),size=.008+random()*.018;
    B.add(new THREE.IcosahedronGeometry(size,0),i%3?metal:blue,i%3?'orbiting-shell-fragments':'charged-fragments',p,new THREE.Quaternion().setFromEuler(new THREE.Euler(random()*3,random()*3,random()*3)),v(1+random()*2,.5+random(),1));}
  return B.finish();
}

export function createPlanet(id){
  const build={outpost,garrison,charon,cargo,fracture}[id];if(!build)throw new Error('Unknown planet '+id);
  const root=build();root.userData={...entries.find(e=>e.id===id),version:1,status:'review',source:'Hand-authored 3D adaptation of local APK planet icon; category assignment is project-specific.'};return root;
}
export function inspectModel(root){
  let triangles=0,meshes=0,finite=true;root.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;triangles+=(o.geometry.index?.count||p.count)/3;for(const n of p.array)if(!Number.isFinite(n))finite=false;});
  const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());return{meshes,triangles,finite,size:size.toArray()};
}
