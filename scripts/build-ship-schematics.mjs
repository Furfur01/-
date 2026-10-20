import fs from 'node:fs';
import * as THREE from 'three';
import {createShipModel,disposeShip,modelIds} from '../opendesign/mockups/galactic-command/ship-models.js';
// Trace the actual top-down mesh projection, including wings and separate pods.
const ids=modelIds;
const output={},N=160;
function contours(mask){
 const edges=new Map(),add=(x,y,a,b)=>{const k=x+','+y;if(!edges.has(k))edges.set(k,[]);edges.get(k).push([a,b]);};
 const at=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&mask[y*N+x];
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(at(x,y)){if(!at(x,y-1))add(x,y,x+1,y);if(!at(x+1,y))add(x+1,y,x+1,y+1);if(!at(x,y+1))add(x+1,y+1,x,y+1);if(!at(x-1,y))add(x,y+1,x,y);}
 const loops=[];while(edges.size){const start=edges.keys().next().value,points=[],first=start.split(',').map(Number);let p=first;
  for(let i=0;i<N*N*4;i++){points.push(p);const k=p.join(','),next=edges.get(k);if(!next?.length)break;p=next.pop();if(!next.length)edges.delete(k);if(p[0]===first[0]&&p[1]===first[1])break;}
  if(points.length>14){const simple=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});loops.push(simple.map(([x,y])=>[+(x/(N-8)*2-1-8/(N-8)).toFixed(3),+(y/(N-8)*2-1-8/(N-8)).toFixed(3)]));}
 }return loops;
}
for(const id of ids){
 const model=createShipModel(id);model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=(N-8)/Math.max(size.x,size.z),height=new Float32Array(N*N).fill(-Infinity),v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 model.traverse(o=>{if(!o.isMesh||!o.visible)return;const pos=o.geometry.attributes.position,index=o.geometry.index,count=index?index.count:pos.count;
  for(let i=0;i<count;i+=3){for(let j=0;j<3;j++){v[j].fromBufferAttribute(pos,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld);v[j].set((v[j].x-center.x)*scale+N/2,v[j].y,(v[j].z-center.z)*scale+N/2);}
   const [a,b,c]=v,den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(den)<1e-8)continue;
   for(let y=Math.max(0,Math.floor(Math.min(a.z,b.z,c.z)));y<=Math.min(N-1,Math.ceil(Math.max(a.z,b.z,c.z)));y++)for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x)));x<=Math.min(N-1,Math.ceil(Math.max(a.x,b.x,c.x)));x++){const u=((b.z-c.z)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.z))/den,w=((c.z-a.z)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.z))/den;if(u>=0&&w>=0&&u+w<=1)height[y*N+x]=Math.max(height[y*N+x],a.y*u+b.y*w+c.y*(1-u-w));}
  }
 });
 output[id]=[0,.42,.68].map(t=>contours(height.map(h=>Number(h>=box.min.y+size.y*t))));disposeShip(model);
}
fs.writeFileSync('scripts/three-flight/instruments/ship-outlines.js','// Generated from the actual ship meshes by build-ship-schematics.mjs.\nexport const shipOutlines='+JSON.stringify(output)+';\n');
console.log('Traced',ids.length,'ship schematics');
