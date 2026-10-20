import {campusHeightField} from './height.js';
import {THREE,builder,tree,PALETTE} from './primitives.js';
import {contains,segmentDistance} from './geometry.js';
import {floatingPlatforms,spaceOutcrops} from './space-environment.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const rand=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
export function createTerrain(p,mats,{gas,biome,renderGround=true}={}){
  const {height,surfaceHeight,pads,floating,mining}=campusHeightField(p,{gas});
  const ground=new THREE.Group();ground.name='lowpoly-ground';
  const positions=[],colors=[],color=new THREE.Color();const n=112,step=2,minX=-32,minZ=-42;
  const groundColor=(x,z,y,t)=>{if(p.space){color.setHex(p.environment==='crystal'?0x7c929d:p.environment==='ecology'?0x829589:0x8c999a);}else if(mining&&x<58&&z<86){color.setHex(y<1?0x8c795d:y>12?0xa7aa8e:0xb3a07b);}else{color.setHex(mining?0x88a778:0x90b779);}color.multiplyScalar(.94+(rand(t)*.12));return [color.r,color.g,color.b];};
  function tri(a,b,c,id){const mid=a.map((v,i)=>(v+b[i]+c[i])/3),col=groundColor(mid[0],mid[2],mid[1],id);for(const v of[a,b,c]){positions.push(v[0]-80,v[1],v[2]-70);colors.push(...col);}}
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=minX+i*step,z=minZ+j*step,a=[x,height(x,z),z],b=[x+step,height(x+step,z),z],c=[x,height(x,z+step),z+step],d=[x+step,height(x+step,z+step),z+step];tri(a,c,b,i+j*n);tri(b,c,d,i+j*n+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}),mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;if(!floating&&renderGround)ground.add(mesh);else{geo.dispose();mat.dispose();if(floating)floatingPlatforms(ground,p,mats,{clouds:renderGround});}
  const edge=builder(ground,mats);if(!floating&&renderGround)for(const [a,b]of [[[minX,minZ],[minX+n*step,minZ]],[[minX+n*step,minZ],[minX+n*step,minZ+n*step]],[[minX+n*step,minZ+n*step],[minX,minZ+n*step]],[[minX,minZ+n*step],[minX,minZ]]]){const len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let i=0;i<len;i+=4){const t=(i+2)/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,h=height(x,z);edge.box([x-80,(h-9)/2,z-70],[a[0]===b[0]?2:4,h+9,a[0]===b[0]?4:2],i%3?'rock':'concrete');}}edge.finish();
  const roads=new THREE.Group();roads.name='roads-and-walkways';
  const bridges=floating?builder(ground,mats):null;
  // Clip each road segment to the ground's actual triangles. A separately sampled
  // ribbon can cut through a lowpoly terrace even when its vertices look correct.
  function ribbon(points,width,material,offset=.1){const pos=[];
    function clip(poly,nx,nz,limit){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=a[0]*nx+a[1]*nz-limit,db=b[0]*nx+b[1]*nz-limit;if(da<=1e-8)out.push(a);if((da<0)!==(db<0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.01)continue;const dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len,nx=-dz,nz=dx,along=a[0]*dx+a[1]*dz,across=a[0]*nx+a[1]*nz;
      if(bridges)bridges.box([(a[0]+b[0])/2-80,5.7,(a[1]+b[1])/2-70],[len,.5,width+.6],'roof',[0,-Math.atan2(dz,dx),0]);
      const minx=Math.floor((Math.min(a[0],b[0])-width/2)/2)*2,maxx=Math.ceil((Math.max(a[0],b[0])+width/2)/2)*2,minz=Math.floor((Math.min(a[1],b[1])-width/2)/2)*2,maxz=Math.ceil((Math.max(a[1],b[1])+width/2)/2)*2;
      for(let x=minx;x<maxx;x+=2)for(let z=minz;z<maxz;z+=2)for(const triangle of[[[x,z],[x,z+2],[x+2,z]],[[x+2,z],[x,z+2],[x+2,z+2]]]){let poly=triangle;for(const [xx,zz,limit]of[[dx,dz,along+len],[-dx,-dz,-along],[nx,nz,across+width/2],[-nx,-nz,-across+width/2]]){poly=clip(poly,xx,zz,limit);if(poly.length<3)break;}for(let j=1;j<poly.length-1;j++)for(const v of[poly[0],poly[j],poly[j+1]])pos.push(v[0]-80,surfaceHeight(...v)+offset,v[1]-70);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();const m=new THREE.Mesh(g,mats[material]);m.receiveShadow=true;m.name=material;roads.add(m);
  }
  for(const [x,y,w,d]of p.courts||[])ribbon([[x,y+d/2],[x+w,y+d/2]],d,'concrete',.075);
  for(const r of p.roads)ribbon(r.points,r.kind==='walk'?1.4:2.6,r.kind==='walk'?'walk':'road',.12);
  for(const r of p.access)ribbon(r.points,.9,'walk',.15);
  // Shared routes have a deterministic surface priority. Freight covers a shared
  // pedestrian stroke instead of competing with a different material on the same plane.
  for(const f of p.routedFlows)if(['walk','freight','production'].includes(f.kind))for(const s of f.segments)ribbon(s.points,f.kind==='walk'?.9:1.3,f.kind==='walk'?'walk':'road',{walk:.17,production:.185,freight:.20}[f.kind]);
  const vegetation=new THREE.Group();vegetation.name='low-forest';const trees=builder(vegetation,mats),paths=[...p.roads.map(r=>r.points),...p.access.map(r=>r.points),...p.routedFlows.flatMap(f=>f.segments.map(s=>s.points)),...(p.previewWalkways||[])],segments=paths.flatMap(points=>points.slice(1).map((b,i)=>[points[i],b]));
  if(!floating&&!p.space&&(!biome||biome==='terrestrial'))for(let i=0;i<1500;i++){const x=-27+rand(i*3)*214,z=-36+rand(i*3+1)*214;if(mining&&x<61&&z<91)continue;if(pads.some(b=>Math.abs(x-b.x)<b.w/2+3&&Math.abs(z-b.y)<b.d/2+3))continue;if(segments.some(([a,b])=>segmentDistance(x,z,a,b)<3))continue;if(p.landscape.some(l=>['yard','test'].includes(l.kind)&&contains(l.points,x,z)))continue;
    if(p.courts?.some(([xx,zz,w,d])=>x>xx-1&&x<xx+w+1&&z>zz-1&&z<zz+d+1))continue;
    const inside=x>6&&x<154&&z>8&&z<132;if(inside&&rand(i+899)>.18)continue;const h=1.5+rand(i*3+2)*1.15;tree(trees,x-80,z-70,height(x,z),h);
  }trees.finish();
  if(p.space&&!floating)spaceOutcrops(vegetation,p,mats,height,(x,z)=>pads.some(b=>Math.abs(x-b.x)<b.w/2+4&&Math.abs(z-b.y)<b.d/2+4)||segments.some(([a,b])=>segmentDistance(x,z,a,b)<4)||(p.courts||[]).some(([xx,zz,w,d])=>x>xx-2&&x<xx+w+2&&z>zz-2&&z<zz+d+2));
  bridges?.finish();return {ground,roads,vegetation,height,surfaceHeight,pads,ribbon,dispose(){geo.dispose();mat.dispose();}};
}
