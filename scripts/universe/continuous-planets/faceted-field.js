import {cubeDirection,directionFaceUV} from './cube.js';

/** Stable geological planes, independent of camera, render quality and LOD.
 * Fine terrain tiles subdivide these planes without adding gravel noise. */
export function createFacetedField(source,resolution=128){
  const corners=new Map(),limit=8192;
  function corner(face,x,y){
    const key=face*(resolution+1)**2+y*(resolution+1)+x;
    let c=corners.get(key);if(c)return c;
    const direction=cubeDirection(face,x/resolution*2-1,y/resolution*2-1),sample=source.sample(...direction);
    c={sample,point:direction.map(v=>v*(1+sample.height))};
    if(corners.size>=limit)corners.delete(corners.keys().next().value);
    corners.set(key,c);return c;
  }
  function evaluate(x,y,z,full){
    const [face,u,v]=directionFaceUV(x,y,z),gx=Math.min(resolution-1e-9,(u+1)*resolution/2),gy=Math.min(resolution-1e-9,(v+1)*resolution/2);
    const ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy;
    const a=corner(face,ix,iy),b=fx+fy<=1?corner(face,ix+1,iy):corner(face,ix+1,iy+1),c=corner(face,ix,iy+1);
    // Tile triangles use the lower-left to upper-right diagonal.
    const first=fx+fy<=1?a:corner(face,ix+1,iy),p=first.point,q=b.point,r=c.point;
    const ab=q.map((v,i)=>v-p[i]),ac=r.map((v,i)=>v-p[i]);
    const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    const height=(p[0]*n[0]+p[1]*n[1]+p[2]*n[2])/(x*n[0]+y*n[1]+z*n[2])-1;
    if(!full)return height;
    const weights=fx+fy<=1?[1-fx-fy,fx,fy]:[1-fy,fx+fy-1,1-fx],samples=[first.sample,b.sample,c.sample];
    const mix=key=>samples.reduce((s,t,i)=>s+(t[key]||0)*weights[i],0);
    const tint=.92+.14*((Math.sin(ix*127.1+iy*311.7+face*74.7)*43758.5453)%1+1)/2;
    return {...samples[weights.indexOf(Math.max(...weights))],height,
      color:[0,1,2].map(i=>samples.reduce((s,t)=>s+t.color[i]/3,0)*tint),
      lava:mix('lava'),crystal:mix('crystal'),
      liquidHeight:samples.some(s=>s.liquidHeight!==null)?samples.find(s=>s.liquidHeight!==null).liquidHeight:null};
  }
  return {...source,facets:{resolution,cacheLimit:limit},height:(x,y,z)=>evaluate(x,y,z,false),sample:(x,y,z)=>evaluate(x,y,z,true)};
}
