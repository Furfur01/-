import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function createShipKit(name,colors={}){
  const root=new THREE.Group();root.name=name;
  const palette={armor:0x7e8d9b,light:0xb3bdc3,edge:0x5c6f80,side:0x3c4c5c,dark:0x252f3b,black:0x101b24,steel:0x647887,red:0x884b50,glass:0x88b9c7,core:0xa4efff,...colors};
  const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>[key,new THREE.MeshStandardMaterial({name:key,color,metalness:['steel','edge','side'].includes(key)?.7:.4,roughness:key==='glass'?.22:.43,emissive:['glass','core'].includes(key)?color:0,emissiveIntensity:key==='core'?1.5:key==='glass'?.6:0})]));
  let part=root;
  const section=(name,fn)=>{const prev=part;part=new THREE.Group();part.name=name;prev.add(part);fn();const group=part;part=prev;return group;};
  const add=(geometry,material='armor',position=[0,0,0],rotation=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,materials[material]);mesh.position.set(...position);mesh.rotation.set(...rotation);part.add(mesh);return mesh;};
  function plate(points,y,depth,material='armor',bevel=.025){
    const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:1});g.rotateX(-Math.PI/2);return add(g,material,[0,y,0]);
  }
  function block(w,h,l,x,y,z,mat='armor',b=.03){const mesh=plate([[-w/2,-l/2],[w/2,-l/2],[w/2,l/2],[-w/2,l/2]],y-h/2,h,mat,Math.min(b,h*.22,w*.18,l*.18));mesh.position.x=x;mesh.position.z=z;return mesh;}
  function loft(rows,mat='armor',cx=0){
    const verts=[],indices=[];
    for(const[z,w,b,t,shift=0]of rows){const c=Math.min(.16,(t-b)*.25,w*.24);for(const[x,y]of[[-w+c,t],[w-c,t],[w,t-c],[w,b+c],[w-c,b],[-w+c,b],[-w,b+c],[-w,t-c]])verts.push(x+cx+shift,y,z);}
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
    const g=section('Low_profile_twin_emitter',()=>{
      cyl(.38,.035,0,.005,0,'dark');
      loft([[-.52,.28,.015,.12],[-.22,.49,.01,.22],[.28,.42,.01,.23],[.43,.24,.015,.14]],'light');
      plate([[-.2,-.34],[.2,-.34],[.31,-.03],[.21,.27],[-.21,.27],[-.31,-.03]],.22,.028,'armor',.008);
      for(const s of[-1,1]){
        loft([[-.88,.095,.06,.13],[-.58,.12,.045,.18],[-.2,.135,.04,.19]],'side',s*.22);
        loft([[-.82,.062,.125,.15],[-.44,.08,.15,.195],[-.17,.085,.15,.2]],'steel',s*.22);
        block(.137,.072,.018,s*.22,.096,-.891,'black',.004);
        block(.086,.025,.01,s*.22,.096,-.905,'glass',.002);
        for(let j=0;j<3;j++)block(.1,.019,.026,s*.35,.236,.04+j*.063,'dark',.002);
      }
    });g.position.set(x,y,z);g.scale.setScalar(scale);
  }
  function engine(x,y,z,r){
    cyl(r*.91,1.12,x,y,z-.47,'dark','z',r*.78);cyl(r,.2,x,y,z-.88,'edge','z');
    cyl(r,.34,x,y,z-.06,'steel','z',r*.92);ring(r*.89,.06,x,y,z+.1,'edge');
    cyl(r*.79,.025,x,y,z+.108,'black','z');ring(r*.64,.028,x,y,z+.13,'glass');cyl(r*.53,.025,x,y,z+.125,'core','z');
    for(let i=0;i<10;i++){const a=i*Math.PI/5,xx=x+Math.cos(a)*r*.9,yy=y+Math.sin(a)*r*.9;pipe([xx,yy,z-.7],[xx,yy,z+.06],r*.065,'side');}
    cyl(r*.15,.04,x,y,z+.15,'glass','z');
  }

  function finish(){
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

