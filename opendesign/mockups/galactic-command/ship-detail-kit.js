import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function createShipKit(name,colors={}){
  const root=new THREE.Group();root.name=name;
  const palette={armor:0x748899,light:0xa2b1bc,edge:0x576f82,side:0x3a5063,dark:0x202d38,black:0x0c151d,steel:0x647887,red:0x8e3c40,glass:0x72ceda,core:0xa4efff,...colors};
  const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>[key,new THREE.MeshStandardMaterial({name:key,color,metalness:['steel','edge','side'].includes(key)?.7:.4,roughness:key==='glass'?.22:.43,emissive:['glass','core'].includes(key)?color:0,emissiveIntensity:key==='core'?1.5:key==='glass'?.6:0})]));
  let part=root;const nozzles=[];
  const section=(name,fn)=>{const prev=part;part=new THREE.Group();part.name=name;prev.add(part);fn();const group=part;part=prev;return group;};
  const add=(geometry,material='armor',position=[0,0,0],rotation=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,materials[material]);mesh.position.set(...position);mesh.rotation.set(...rotation);part.add(mesh);return mesh;};
  function plate(points,y,depth,material='armor',bevel=.025){
    const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:1});g.rotateX(-Math.PI/2);return add(g,material,[0,y,0]);
  }
  function block(w,h,l,x,y,z,mat='armor',b=.03){const mesh=plate([[-w/2,-l/2],[w/2,-l/2],[w/2,l/2],[-w/2,l/2]],y-h/2,h,mat,Math.min(b,h*.22,w*.18,l*.18));mesh.position.x=x;mesh.position.z=z;return mesh;}
  function loft(rows,mat='armor',cx=0){
    const verts=[],indices=[];
    for(const[z,w,b,t]of rows){const c=Math.min(.16,(t-b)*.25,w*.24);for(const[x,y]of[[-w+c,t],[w-c,t],[w,t-c],[w,b+c],[w-c,b],[-w+c,b],[-w,b+c],[-w,t-c]])verts.push(x+cx,y,z);}
    for(let r=0;r<rows.length-1;r++)for(let i=0;i<8;i++){const a=r*8+i,b=r*8+(i+1)%8;indices.push(a,a+8,b,b,a+8,b+8);}
    for(let i=1;i<7;i++){indices.push(0,i,i+1);const a=(rows.length-1)*8;indices.push(a,a+i+1,a+i);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);const flat=g.toNonIndexed();flat.computeVertexNormals();g.dispose();return add(flat,mat);
  }
  function cyl(r,h,x,y,z,mat='steel',axis='y',r2=r,segments=24){return add(new THREE.CylinderGeometry(r,r2,h,segments),mat,[x,y,z],axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0]);}
  function ring(r,t,x,y,z,mat='steel',axis='z'){return add(new THREE.TorusGeometry(r,t,6,32),mat,[x,y,z],axis==='y'?[Math.PI/2,0,0]:axis==='x'?[0,Math.PI/2,0]:[0,0,0]);}
  function pipe(a,b,r=.03,mat='steel'){
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const m=add(new THREE.CylinderGeometry(r,r,delta.length(),8),mat,from.add(to).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
  }
  const mirror=(points,s)=>points.map(([x,z])=>[x*s,z]);
  function turret(x,y,z,scale=1){
    const previous=part,g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);g.name='Twin_turret';part.add(g);part=g;
    cyl(.39,.12,0,.06,0,'black');ring(.32,.032,0,.14,0,'steel','y');
    loft([[-.48,.23,.16,.35],[-.23,.38,.13,.56],[.35,.31,.13,.5]],'light');
    block(.27,.08,.38,0,.53,.02,'armor',.026);block(.22,.04,.13,0,.565,.04,'black',.008);
    for(const s of[-1,1]){
      cyl(.1,.18,s*.23,.34,-.34,'side','z');
      cyl(.058,.84,s*.23,.34,-.88,'steel','z');
      for(const zz of[-.55,-.7,-1.19])cyl(.076,.065,s*.23,.34,zz,'side','z');
      ring(.061,.017,s*.23,.34,-1.32,'light');cyl(.044,.011,s*.23,.34,-1.308,'black','z');
      block(.065,.15,.25,s*.38,.27,.1,'side',.015);
    }
    for(const xx of[-.17,.17])cyl(.02,.025,xx,.5,.22,'steel','y',.02,8);
    part=previous;
  }
  function engine(x,y,z,r){
    nozzles.push({group:part,position:[x,y,z+.172],radius:r*.53});
    cyl(r*.91,1.12,x,y,z-.47,'dark','z',r*.78);cyl(r,.2,x,y,z-.88,'edge','z');
    cyl(r,.34,x,y,z-.06,'steel','z',r*.92);ring(r*.89,.06,x,y,z+.1,'edge');
    cyl(r*.79,.025,x,y,z+.108,'black','z');ring(r*.64,.028,x,y,z+.13,'glass');cyl(r*.53,.025,x,y,z+.125,'core','z');
    for(let i=0;i<10;i++){const a=i*Math.PI/5,xx=x+Math.cos(a)*r*.9,yy=y+Math.sin(a)*r*.9;pipe([xx,yy,z-.7],[xx,yy,z+.06],r*.065,'side');}
    cyl(r*.15,.04,x,y,z+.15,'glass','z');
  }

  function finish(){
  root.updateMatrixWorld(true);
  root.userData.engineNozzles=nozzles.map(n=>({position:new THREE.Vector3(...n.position).applyMatrix4(n.group.matrixWorld).toArray(),direction:new THREE.Vector3(0,0,1).transformDirection(n.group.matrixWorld).toArray(),radius:n.radius}));
  // Merge within named assemblies: keep editable components without hundreds of draw calls.
  for(const group of [...root.children]){
    group.updateMatrixWorld(true);const buckets=new Map();
    group.traverse(mesh=>{if(!mesh.isMesh)return;let g=mesh.geometry.clone();g.applyMatrix4(mesh.matrixWorld);if(g.index){const flat=g.toNonIndexed();g.dispose();g=flat;}g.deleteAttribute('uv');const list=buckets.get(mesh.material)||[];list.push(g);buckets.set(mesh.material,list);});
    group.traverse(mesh=>{if(mesh.isMesh)mesh.geometry.dispose();});group.clear();group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.set(1,1,1);group.updateMatrixWorld(true);
    for(const[mat,geometries]of buckets){const g=mergeGeometries(geometries);geometries.forEach(x=>x.dispose());const mesh=new THREE.Mesh(g,mat);mesh.name=group.name+'_'+mat.name;group.add(mesh);}
  }

    return root;
  }
  return {root,section,add,plate,block,loft,cyl,ring,pipe,mirror,turret,engine,finish};
}

