import { cubeDirection, tileBounds, surfaceNormal } from './cube.js';

// The same builder runs in Workers or yields one row at a time in fallback mode.
export function* buildTile(field, job) {
  const {face,level,x,y,grid:n,radius:R}=job;
  const {u,v,span}=tileBounds(level,x,y),stride=n+1,main=stride*stride,total=main+4*stride;
  const dir=cubeDirection(face,u+span/2,v+span/2),rr=R*(1+field.height(...dir));
  const origin=dir.map(a=>a*rr);
  const position=new Float32Array(total*3),coarse=new Float32Array(total*3);
  const normal=new Float32Array(total*3),coarseNormal=new Float32Array(total*3),color=new Float32Array(total*3);
  // Shade only the frequencies this grid can resolve. The height field itself
  // remains identical at every LOD, including the unfiltered navigation query.
  const normalEpsilon=Math.max(.000025,Math.min(.02,span/n*.5));
  const parentEpsilon=Math.max(.000025,Math.min(.02,span/n));
  const parentNormal=level>0?new Float32Array(main*3):null;
  const edge=new Float32Array(total*4),hints=new Float32Array(total*2),nav=new Float32Array(main);
  const wet=new Uint8Array(total),waterHints=new Float32Array(total*2);let hasWater=false;
  const dirs=new Float64Array(main*3);
  for(let j=0;j<=n;j++){
    for(let i=0;i<=n;i++){
      const idx=j*stride+i,d=cubeDirection(face,u+i/n*span,v+j/n*span),s=field.sample(...d),r=R*(1+s.height);
      const norm=surfaceNormal(field,...d,normalEpsilon);
      for(let k=0;k<3;k++){position[idx*3+k]=d[k]*r-origin[k];normal[idx*3+k]=norm[k];color[idx*3+k]=s.color[k];dirs[idx*3+k]=d[k];}
      // Even vertices coincide exactly with the parent grid. Its normals use
      // the parent's filter width, not the child's sharper shading normals.
      if(parentNormal&&i%2===0&&j%2===0)parentNormal.set(surfaceNormal(field,...d,parentEpsilon),idx*3);
      edge[idx*4]=i===0?1:0;edge[idx*4+1]=i===n?1:0;edge[idx*4+2]=j===0?1:0;edge[idx*4+3]=j===n?1:0;
      hints[idx*2]=s.lava||0;hints[idx*2+1]=s.crystal||0;nav[idx]=s.height;
      wet[idx]=field.type==='terrestrial'?(s.height<.00002?1:0):field.type==='mercury'&&s.lava>.035?1:0;
      if(wet[idx])hasWater=true;waterHints[idx*2]=field.type==='mercury'?s.lava:1;waterHints[idx*2+1]=Math.max(0,-s.height);
    }
    yield null;
  }
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const idx=j*stride+i;
    if(level===0){coarse.set(position.subarray(idx*3,idx*3+3),idx*3);coarseNormal.set(normal.subarray(idx*3,idx*3+3),idx*3);continue;}
    const i0=Math.min(n-2,Math.floor(i/2)*2),j0=Math.min(n-2,Math.floor(j/2)*2),fx=(i-i0)/2,fy=(j-j0)/2;
    const a=j0*stride+i0,b=a+2,c=a+2*stride,d=c+2;
    const ids=fx+fy<=1?[a,b,c]:[d,c,b],weights=fx+fy<=1?[1-fx-fy,fx,fy]:[fx+fy-1,1-fx,1-fy];
    for(let k=0;k<3;k++){
      coarse[idx*3+k]=ids.reduce((sum,id,z)=>sum+position[id*3+k]*weights[z],0);
      coarseNormal[idx*3+k]=ids.reduce((sum,id,z)=>sum+parentNormal[id*3+k]*weights[z],0);
    }
    nav[idx]=Math.max(nav[idx],Math.hypot(coarse[idx*3]+origin[0],coarse[idx*3+1]+origin[1],coarse[idx*3+2]+origin[2])/R-1);
  }
  yield null;
  const indices=[];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*stride+i,b=a+1,c=a+stride,d=c+1;indices.push(a,b,c,b,d,c);}
  // Stitching is handled by edge morphing. These tiny skirts seal float roundoff only.
  const skirt=R*Math.min(.000025,span*.0006);
  const edges=[Array.from({length:stride},(_,i)=>i*stride),Array.from({length:stride},(_,i)=>i*stride+n),Array.from({length:stride},(_,i)=>i),Array.from({length:stride},(_,i)=>n*stride+i)];
  for(let e=0;e<4;e++)for(let i=0;i<=n;i++){
    const src=edges[e][i],dst=main+e*stride+i;
    for(let k=0;k<3;k++){position[dst*3+k]=position[src*3+k]-dirs[src*3+k]*skirt;coarse[dst*3+k]=coarse[src*3+k]-dirs[src*3+k]*skirt;normal[dst*3+k]=normal[src*3+k];coarseNormal[dst*3+k]=coarseNormal[src*3+k];color[dst*3+k]=color[src*3+k];}
    edge.set(edge.subarray(src*4,src*4+4),dst*4);hints.set(hints.subarray(src*2,src*2+2),dst*2);wet[dst]=wet[src];waterHints.set(waterHints.subarray(src*2,src*2+2),dst*2);
    if(i<n){const a=src,b=edges[e][i+1],c=dst,d=dst+1;indices.push(a,c,b,b,c,d);}
  }
  let waterPosition=null,waterCoarse=null,waterIndex=null;
  if(hasWater){
    waterPosition=new Float32Array(total*3);waterCoarse=new Float32Array(total*3);
    const wr=R*(field.type==='terrestrial'?1.000002:.984002);
    for(let i=0;i<main;i++)for(let k=0;k<3;k++)waterPosition[i*3+k]=dirs[i*3+k]*wr-origin[k];
    for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
      const idx=j*stride+i,i0=Math.min(n-2,Math.floor(i/2)*2),j0=Math.min(n-2,Math.floor(j/2)*2),fx=(i-i0)/2,fy=(j-j0)/2,a=j0*stride+i0,b=a+2,c=a+2*stride,d=c+2;
      const ids=fx+fy<=1?[a,b,c]:[d,c,b],ws=fx+fy<=1?[1-fx-fy,fx,fy]:[fx+fy-1,1-fx,1-fy];
      for(let k=0;k<3;k++)waterCoarse[idx*3+k]=level===0?waterPosition[idx*3+k]:ids.reduce((s,id,q)=>s+waterPosition[id*3+k]*ws[q],0);
    }
    for(let e=0;e<4;e++)for(let i=0;i<=n;i++){const src=edges[e][i],dst=main+e*stride+i;for(let k=0;k<3;k++){waterPosition[dst*3+k]=waterPosition[src*3+k]-dirs[src*3+k]*skirt;waterCoarse[dst*3+k]=waterCoarse[src*3+k]-dirs[src*3+k]*skirt;}}
    const wi=[];for(let i=0;i<indices.length;i+=3){if(wet[indices[i]]||wet[indices[i+1]]||wet[indices[i+2]])wi.push(indices[i],indices[i+1],indices[i+2]);}waterIndex=new Uint32Array(wi);
  }
  return {origin,position,coarse,normal,coarseNormal,color,edge,hints,nav,index:new Uint32Array(indices),waterPosition,waterCoarse,waterIndex,waterHints:hasWater?waterHints:null,grid:n,face,level,x,y};
}
export function transferableBuffers(data){return Object.values(data).filter(a=>ArrayBuffer.isView(a)).map(a=>a.buffer);}
