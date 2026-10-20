import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export {THREE};
export const PALETTE={ivory:0xe9e8dc,white:0xfff4df,roof:0x233f5b,dark:0x162c3a,glass:0x147f9b,clearGlass:0x36bfd2,teal:0x4fdac6,energy:0x5ef3e5,steel:0x8fa6ac,gold:0xe9a82d,orange:0xc77c39,concrete:0xaebdb0,road:0x738b89,walk:0xc6cfb7,green:0x3f8358,leaf:0x6fa15d,trunk:0x846945,rock:0x898b76,ore:0xa87646};
export function materials(){return Object.fromEntries(Object.entries(PALETTE).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:['glass','clearGlass','steel'].includes(k)?.32:.77,metalness:['gold','steel'].includes(k)?.35:.08,flatShading:true,...(['glass','teal','energy'].includes(k)?{emissive:color,emissiveIntensity:k==='energy'?.85:.08}:{}),...(k==='clearGlass'?{transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide}: {})})]));}
const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.SphereGeometry(1,12,6),domeGeo=new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),cylGeo=new THREE.CylinderGeometry(1,1,1,12),coneGeo=new THREE.ConeGeometry(1,1,6);
export function chamfer(x,z,w,d,r=.4){r=Math.min(r,w/4,d/4);return [[x-w/2+r,z-d/2],[x+w/2-r,z-d/2],[x+w/2,z-d/2+r],[x+w/2,z+d/2-r],[x+w/2-r,z+d/2],[x-w/2+r,z+d/2],[x-w/2,z+d/2-r],[x-w/2,z-d/2+r]];}
export function builder(group,mats){
  const buckets=new Map(),temp=new THREE.Object3D();
  function add(geo,mat,p=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){const g=geo.index?geo.toNonIndexed():geo.clone();for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);temp.position.fromArray(p);temp.scale.fromArray(scale);temp.rotation.set(...rotation);temp.updateMatrix();g.applyMatrix4(temp.matrix);if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push(g);}
  const box=(p,s,mat='ivory',r=[0,0,0])=>add(boxGeo,mat,p,s,r);
  const cylinder=(p,r,h,mat='ivory',rotation=[0,0,0])=>add(cylGeo,mat,p,[r,h,r],rotation);
  const sphere=(p,s,mat='ivory')=>add(sphereGeo,mat,p,s);
  const dome=(p,s,mat='glass')=>add(domeGeo,mat,p,s);
  const cone=(p,r,h,mat='green')=>add(coneGeo,mat,p,[r,h,r]);
  function beam(a,b,r,mat='ivory'){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());add(cylGeo,mat,from.add(to).multiplyScalar(.5).toArray(),[r,delta.length(),r],new THREE.Euler().setFromQuaternion(q).toArray().slice(0,3));}
  function extrude(points,h,y=0,mat='ivory',bevel=.07){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.01,h),bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,steps:1,curveSegments:1});g.rotateX(-Math.PI/2);add(g,mat,[0,y,0]);g.dispose();}
  function roof(w,d,y,profile,mat='roof',x=0,z=0){const vertices=[];const tri=(a,b,c)=>vertices.push(...a,...b,...c);for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i],p=[x-w/2,y+a[1],z+a[0]*d],q=[x+w/2,y+a[1],z+a[0]*d],r=[x+w/2,y+b[1],z+b[0]*d],s=[x-w/2,y+b[1],z+b[0]*d];tri(p,r,q);tri(p,s,r);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();add(g,mat);g.dispose();
    for(const side of[-1,1]){const v=[];for(let i=1;i<profile.length;i++){const a=profile[side===1?i-1:i],b=profile[side===1?i:i-1];v.push(x+side*w/2,y,z,x+side*w/2,y+a[1],z+a[0]*d,x+side*w/2,y+b[1],z+b[0]*d);}const end=new THREE.BufferGeometry();end.setAttribute('position',new THREE.Float32BufferAttribute(v,3));end.computeVertexNormals();add(end,'ivory');end.dispose();}
  }
  function ring(p,r,t=.08,mat='teal',rotation=[Math.PI/2,0,0]){const g=new THREE.TorusGeometry(r,t,5,20);add(g,mat,p,[1,1,1],rotation);g.dispose();}
  function finish(){for(const [mat,geometries]of buckets){const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)throw Error('Geometry merge failed');const mesh=new THREE.Mesh(geometry,mats[mat]);mesh.name=mat;mesh.castShadow=!['walk','road'].includes(mat);mesh.receiveShadow=true;group.add(mesh);}buckets.clear();return group;}
  return {add,box,cylinder,sphere,dome,cone,beam,extrude,roof,ring,finish};
}
export function facade(g,points,h,{bays=true}={}){
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<2)continue;const nx=dz/len,nz=-dx/len,angle=-Math.atan2(dz,dx),x=(a[0]+b[0])/2+nx*.075,z=(a[1]+b[1])/2+nz*.075;
    g.box([x,h*.47,z],[len-.7,h*.24,.07],'glass',[0,angle,0]);g.box([x,h*.32,z],[len-.45,.10,.16],'roof',[0,angle,0]);
    if(bays)for(let s=1.1;s<len-.7;s+=2.15){g.box([a[0]+dx*s/len+nx*.1,h*.47,a[1]+dz*s/len+nz*.1],[.15,h*.3,.16],'ivory',[0,angle,0]);}
  }
}
export function roofVent(g,x,z,y,w=1.2){g.box([x,y+.14,z],[w,.28,w*.7],'roof');for(let i=0;i<4;i++)g.box([x-w*.3+i*w*.2,y+.3,z],[.08,.04,w*.6],'concrete');}
export function robotArm(g,x,z,base=0,scale=1,turn=1){const p=(dx,y,dz)=>[x+dx*scale,base+y*scale,z+dz*scale];g.cylinder(p(0,.2,0),.4*scale,.4*scale,'dark');g.cylinder(p(0,.52,0),.28*scale,.25*scale,'gold');g.beam(p(0,.6,0),p(.35*turn,1.4,0),.16*scale,'gold');g.sphere(p(.35*turn,1.4,0),[.22*scale,.22*scale,.22*scale],'roof');g.beam(p(.35*turn,1.4,0),p(.8*turn,.95,.2),.11*scale,'ivory');g.box(p(.8*turn,.88,.2),[.3*scale,.17*scale,.3*scale],'dark');}
export function tree(g,x,z,y,h=2){g.cylinder([x,y+h*.2,z],h*.06,h*.4,'trunk');g.cone([x,y+h*.59,z],h*.32,h*.82,'green');g.cone([x,y+h*.81,z],h*.25,h*.65,'leaf');}
export function labelSprite(text,{color='#274d57',background='#f0f3dfe8',size=1}={}){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.roundRect(4,4,504,88,14);ctx.fill();ctx.fillStyle=color;ctx.font='600 34px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));sprite.scale.set(13*size,2.44*size,1);sprite.renderOrder=30;return sprite;}
