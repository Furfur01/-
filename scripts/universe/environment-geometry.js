// Preserved CPU mesh generators from the approved AURORA models.
// This module owns no renderer, GPU context, DOM, frame loop or gameplay state.
const PI=Math.PI,TAU=PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), mix=(a,b,t)=>a+(b-a)*t, smooth=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)}, add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], len=a=>Math.hypot(...a), norm=a=>mul(a,1/(len(a)||1)), vlerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));

function ident(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function mm(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function trs(t=[0,0,0],r=[0,0,0],s=[1,1,1]){const [x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);let mx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],my=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],mz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1],m=mm(mm(my,mx),mz);for(let j=0;j<3;j++)for(let i=0;i<3;i++)m[j*4+i]*=s[j];m[12]=t[0];m[13]=t[1];m[14]=t[2];return m}
function pt(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]}
function normal3(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),det=dot(a,bc)||1;return [...mul(bc,1/det),...mul(ca,1/det),...mul(ab,1/det)]}
function nt(m,p){return norm([m[0]*p[0]+m[3]*p[1]+m[6]*p[2],m[1]*p[0]+m[4]*p[1]+m[7]*p[2],m[2]*p[0]+m[5]*p[1]+m[8]*p[2]])}
function frame(up,pos){const x=norm(cross(Math.abs(up[1])>.98?[0,0,1]:[0,1,0],up)),z=norm(cross(x,up));return [x[0],x[1],x[2],0,up[0],up[1],up[2],0,z[0],z[1],z[2],0,...pos,1]}

// Every vertex stores position, normal, RGB, emissive factor, and surface type.
const STRIDE=11;function pushv(a,p,n,c,emit=0,type=0){a.push(...p,...n,...c,emit,type)}
function tri(a,p,q,r,c,emit=0,type=0,ns=null){const n=ns?null:norm(cross(sub(q,p),sub(r,p)));pushv(a,p,ns?ns[0]:n,c,emit,type);pushv(a,q,ns?ns[1]:n,c,emit,type);pushv(a,r,ns?ns[2]:n,c,emit,type)}
function quad(a,p,q,r,s,c,e=0,t=0){tri(a,p,q,r,c,e,t);tri(a,p,r,s,c,e,t)}
const GEO={};function boxgeo(){if(GEO.box)return GEO.box;const a=[],p=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];for(const f of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]])quad(a,...f.map(i=>p[i]),[1,1,1]);return GEO.box=a}
function cylgeo(rt=1,rb=1,h=1,n=12){const key=`c${rt},${rb},${h},${n}`;if(GEO[key])return GEO[key];const a=[];for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,p=[Math.cos(a0)*rb,-h/2,Math.sin(a0)*rb],q=[Math.cos(a1)*rb,-h/2,Math.sin(a1)*rb],r=[Math.cos(a1)*rt,h/2,Math.sin(a1)*rt],s=[Math.cos(a0)*rt,h/2,Math.sin(a0)*rt];quad(a,p,s,r,q,[1,1,1]);if(rt>0)tri(a,[0,h/2,0],r,s,[1,1,1]);if(rb>0)tri(a,[0,-h/2,0],p,q,[1,1,1])}return GEO[key]=a}
function spheregeo(seg=12,rings=8,half=false){const key=`s${seg},${rings},${half}`;if(GEO[key])return GEO[key];const a=[];for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){function v(k,l){let ph=k/rings*PI*(half?.5:1),th=l/seg*TAU;return [Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)]}const p=v(j,i),q=v(j+1,i),r=v(j+1,i+1),s=v(j,i+1);tri(a,p,q,r,[1,1,1],0,0,[p,q,r]);tri(a,p,r,s,[1,1,1],0,0,[p,r,s])}return GEO[key]=a}
function torusgeo(rad=1,tube=.06,seg=32,sides=6){const a=[];for(let i=0;i<seg;i++)for(let j=0;j<sides;j++){function v(k,l){let u=k/seg*TAU,v=l/sides*TAU;return [(rad+tube*Math.cos(v))*Math.cos(u),tube*Math.sin(v),(rad+tube*Math.cos(v))*Math.sin(u)]}quad(a,v(i,j),v(i+1,j),v(i+1,j+1),v(i,j+1),[1,1,1])}return a}
function append(dst,src,m,c=null,emit=null,type=null){const nm=normal3(m);for(let i=0;i<src.length;i+=STRIDE){const p=pt(m,src.slice(i,i+3)),n=nt(nm,src.slice(i+3,i+6));pushv(dst,p,n,c||src.slice(i+6,i+9),emit===null?src[i+9]:emit,type===null?src[i+10]:type)}}
function box(a,p,s,c,r=[0,0,0],e=0){append(a,boxgeo(),trs(p,r,s),c,e)}
function cyl(a,p,rad,h,c,n=12,r=[0,0,0],rt=null,e=0){append(a,cylgeo(rt===null?rad:rt,rad,h,n),trs(p,r),c,e)}
function sphere(a,p,s,c,e=0,half=false){append(a,spheregeo(12,8,half),trs(p,[0,0,0],s),c,e)}
function ring(a,p,rad,tube,c,r=[0,0,0],e=0,seg=40){append(a,torusgeo(rad,tube,seg,6),trs(p,r),c,e)}
function beam(a,p,q,rad,c,n=6,e=0){const d=sub(q,p),mid=mul(add(p,q),.5),m=frame(norm(d),mid);append(a,cylgeo(rad,rad,len(d),n),m,c,e)}

function rotateY(v,angle){const c=Math.cos(angle),s=Math.sin(angle);return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
export function buildLogisticsData(){
 const frame=[],hull=[],lights=[],traffic=[];
 const metal=[.57,.65,.66],ivory=[.78,.80,.72],dark=[.15,.23,.26],panel=[.29,.39,.41],brass=[.60,.44,.23];
 const polar=(r,a,y=0)=>[r*Math.cos(a),y,r*Math.sin(a)];
 function annulus(dst,inner,outer,y,height,color,segments=72){
  for(let i=0;i<segments;i++){
   const a=i/segments*TAU+.008,b=(i+1)/segments*TAU-.008;
   const p=polar(inner,a,y),q=polar(outer,a,y),r=polar(outer,b,y),s=polar(inner,b,y),top=v=>[v[0],v[1]+height,v[2]];
   quad(dst,top(p),top(s),top(r),top(q),color);quad(dst,p,q,r,s,color);
   quad(dst,q,top(q),top(r),r,color);quad(dst,s,top(s),top(p),p,color);
   quad(dst,p,top(p),top(q),q,color);quad(dst,r,top(r),top(s),s,color);
  }
 }
 // Two load-bearing rings and a six-spoke truss are visible from system altitude.
 ring(frame,[0,-.65,0],10.2,.16,metal,[0,0,0],0,72);
 ring(frame,[0,1.65,0],7.2,.12,metal,[0,0,0],0,60);
 annulus(hull,9.4,10.8,-.5,.85,ivory);
 annulus(hull,6.8,7.7,1.45,.6,metal,60);
 annulus(hull,3.2,4.2,.15,.8,dark,36);
 annulus(lights,9.48,9.57,.37,.045,[1,1,1]);
 annulus(lights,7.55,7.64,2.06,.04,[1,1,1],60);
 for(let i=0;i<6;i++){
  const a=i*TAU/6,rot=[0,-a,0];
  beam(frame,polar(2.1,a,-1),polar(10.3,a,-1),.23,metal);
  beam(frame,polar(3,a,1.9),polar(9.8,a,-.9),.12,metal);
  box(hull,polar(6,a,.3),[7.4,.5,.9],panel,rot);
  for(const side of [-1,1]){
   beam(frame,polar(4,a+side*.09,-.8),polar(10,a+side*.08,-.8),.10,brass);
   for(let j=0;j<4;j++)beam(frame,polar(4+j*1.5,a+side*.09,-.8),polar(5.4+j*1.5,a-side*.07,-.8),.065,metal);
  }
  // Warehouse blocks, roof ribs, docking mouths and crane gantries.
  box(hull,polar(11.4,a,.7),[4.5,2.3,2.7],dark,rot);
  box(hull,polar(11.4,a,1.9),[4.1,.32,2.85],ivory,rot);
  for(let j=0;j<5;j++)box(hull,polar(9.8+j*.8,a,2.15),[.12,.23,2.95],metal,rot);
  box(hull,polar(13.69,a,.55),[.12,1.55,2.02],[.035,.07,.085],rot);
  for(const side of [-1,1]){
   const edge=add(polar(13.8,a,.55),polar(.98,a+side*PI/2));
   box(lights,edge,[.10,1.48,.06],[1,1,1],rot);
   const foot=add(polar(11.4,a,2.5),polar(1.7,a+side*PI/2));
   box(frame,foot,[.2,1.1,.2],metal,rot);
  }
  box(frame,polar(11.4,a,3.1),[.25,.25,3.6],brass,rot);
  // Stacked freight containers on the inner apron.
  for(let j=0;j<3;j++)for(let layer=0;layer<2;layer++){
   const p=add(polar(8.5,a,.45+layer*.5),polar((j-1)*.7,a+PI/2));
   box(hull,p,[1.3,.43,.56],(j+i)%2?panel:brass,rot);
  }
  const b=a+PI/6;
  box(hull,polar(10.2,b,.65),[1.2,1.25,1.9],metal,[0,-b,0]);
  box(lights,polar(10.2,b,1.31),[.85,.06,1.3],[1,1,1],[0,-b,0]);
 }
 // Axial control tower, armored base, bridge crown and antenna mast.
 cyl(hull,[0,-.5,0],2.8,1.7,dark,12);
 cyl(hull,[0,1.1,0],2.1,2,metal,12,[0,0,0],1.6);
 cyl(hull,[0,2.8,0],1.45,2,ivory,6,[0,0,0],1.05);
 cyl(hull,[0,4.1,0],2.0,.65,dark,12);
 ring(lights,[0,4.22,0],2.03,.08,[1,1,1],[0,0,0],0,36);
 cyl(hull,[0,4.65,0],1.75,.5,ivory,12,[0,0,0],.85);
 cyl(frame,[0,5.8,0],.10,2,metal,8);
 sphere(lights,[0,6.85,0],[.15,.15,.15],[1,1,1]);
 for(let i=0;i<3;i++){const a=i*TAU/3;beam(frame,polar(.9,a,4.6),polar(1.8,a,6.0),.065,metal);}
 box(traffic,[0,0,0],[.55,.3,1.35],ivory);box(traffic,[0,.23,0],[.42,.16,.6],brass);
 for(const side of [-1,1])box(traffic,[side*.38,-.04,-.2],[.18,.22,1.2],dark);

return {frame:new Float32Array(frame),hull:new Float32Array(hull),lights:new Float32Array(lights),traffic:new Float32Array(traffic)};
}
export function buildPatrolData(){
 const patrolHull=[];box(patrolHull,[0,0,0],[.28,.18,1.4],[.4,.5,.6]);box(patrolHull,[0,.12,.18],[.2,.13,.37],[.12,.45,.65]);for(const side of [-1,1]){box(patrolHull,[side*.35,-.02,-.12],[.55,.07,.55],[.34,.4,.46],[0,side*.3,0]);box(patrolHull,[side*.23,0,-.7],[.16,.14,.18],[.12,.7,1]);}for(const points of [[[0,0,1.05],[-.14,-.09,.5],[.14,-.09,.5]],[[0,0,1.05],[.14,-.09,.5],[0,.12,.5]],[[0,0,1.05],[0,.12,.5],[-.14,-.09,.5]]])tri(patrolHull,...points,[.6,.7,.75]);

return new Float32Array(patrolHull);
}
export function auroraCometPosition(systemId,time,index=0){
 const a=110+index*35,e=.68,phase=time*(.012-index*.003)+systemId*.73+index*2.8;
 // Solve Kepler's equation: the star is at the focus and motion slows at aphelion.
 let E=phase;for(let i=0;i<6;i++)E-=(E-e*Math.sin(E)-phase)/(1-e*Math.cos(E));
 const x=a*(Math.cos(E)-e),z=a*Math.sqrt(1-e*e)*Math.sin(E),tilt=.24+index*.19;
 return rotateY([x,Math.sin(tilt)*z,Math.cos(tilt)*z],systemId*.47+index);
}
export function auroraAsteroidGeometry(){
 const vertices=[];let seed=7183;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<2200;i++){
  const outer=i<1650,angle=random()*TAU,radius=(outer?162:82)+(random()+random()-1)*(outer?4.5:2.0),size=.04+Math.pow(random(),2)*.13;
  const center=[Math.cos(angle)*radius,(random()-.5)*(outer?.55:.23),Math.sin(angle)*radius];
  const tips=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(v=>mul(v,size*(.65+random()*.7)));
  for(const face of [[0,2,4],[4,2,1],[1,2,5],[5,2,0],[0,4,3],[4,1,3],[1,5,3],[5,0,3]]){
   const [a,b,c]=face.map(j=>tips[j]),normal=norm(cross(sub(b,a),sub(c,a))),light=.42+.58*Math.max(0,dot(normal,norm(mul(center,-1)))),tone=.72+random()*.25;
   for(const v of [a,b,c])vertices.push(...add(center,v),tone*light*.72,tone*light*.65,tone*light*.53,1);
  }
 }
 return new Float32Array(vertices);
}

// ASTRAL planar territories: bounded Voronoi cells, shared edges, real owners.
function auroraTerritoryClip(poly,nx,nz,c){
 const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*nz-c,db=b[0]*nx+b[1]*nz-c,ia=da<=1e-12,ib=db<=1e-12;if(ia)out.push(a);if(ia!==ib){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;
}
function auroraTerritoryGeometry(systems,owned){
 const scale=31500,sites=systems.map(s=>[s.position[0]/scale,s.position[2]/scale]),records=new Map(owned.map(c=>[c.id,c]));
 // Neutral support sites bound the frontier and leave gaps in the spiral arms.
 for(let z=-39060;z<=39060;z+=2790)for(let x=-39060;x<=39060;x+=2790)if(systems.every(s=>Math.hypot(x-s.position[0],z-s.position[2])>4050))sites.push([x/scale,z/scale]);
 const vertices=[],vertexMap=new Map(),edgeMap=new Map(),cells=[];
 function vertex(p){const key=p.map(v=>Math.round(v*1e9)).join(',');if(!vertexMap.has(key)){vertexMap.set(key,vertices.length);vertices.push([p[0]*scale,0,p[1]*scale]);}return vertexMap.get(key);}
 for(let i=0;i<systems.length;i++){
  const a=sites[i];let poly=[[-1.6,-1.6],[1.6,-1.6],[1.6,1.6],[-1.6,1.6]];
  const nearest=sites.map((p,j)=>({j,d:(p[0]-a[0])**2+(p[1]-a[1])**2})).filter(p=>p.j!==i).sort((a,b)=>a.d-b.d);
  for(const {j}of nearest){const b=sites[j];poly=auroraTerritoryClip(poly,b[0]-a[0],b[1]-a[1],(b[0]**2+b[1]**2-a[0]**2-a[1]**2)/2);if(!poly.length)break;}
  const ids=poly.map(vertex).filter((id,k,arr)=>id!==arr[(k+arr.length-1)%arr.length]),record=records.get(systems[i].id),owners=record?.owners||[],ownerKey=owners.map(o=>o.id).join('|'),color=owners.length===1?owners[0].color:'#9faeba',key=owners.length?(record.territoryClass||color):'';
  let area=0,cx=0,cz=0;for(let k=0;k<ids.length;k++){const u=ids[k],v=ids[(k+1)%ids.length],p=vertices[u],q=vertices[v],cross=p[0]*q[2]-q[0]*p[2];area+=cross;cx+=(p[0]+q[0])*cross;cz+=(p[2]+q[2])*cross;const e=u<v?u+':'+v:v+':'+u;if(!edgeMap.has(e))edgeMap.set(e,{u,v,cells:[]});edgeMap.get(e).cells.push(i);}
  cells.push({id:systems[i].id,index:i,key,ownerKey,owners,vertices:ids,area:Math.abs(area)/2,center:area?[cx/(3*area),0,cz/(3*area)]:[systems[i].position[0],0,systems[i].position[2]],neighbors:[],color});
 }
 const edges=[...edgeMap.values()];for(const e of edges)if(e.cells.length===2){const[a,b]=e.cells;cells[a].neighbors.push(b);cells[b].neighbors.push(a);}
 const borders=edges.filter(e=>cells[e.cells[0]].key!==(e.cells.length===2?cells[e.cells[1]].key:'')),regions=[],seen=new Set();
 for(const cell of cells){if(!cell.key||seen.has(cell.index))continue;const ids=[cell.index];seen.add(cell.index);for(let k=0;k<ids.length;k++)for(const j of cells[ids[k]].neighbors)if(!seen.has(j)&&cells[j].key===cell.key){seen.add(j);ids.push(j);}
  const area=ids.reduce((sum,j)=>sum+cells[j].area,0),center=[0,1,2].map(k=>ids.reduce((sum,j)=>sum+cells[j].center[k]*cells[j].area,0)/Math.max(1,area));
  regions.push({key:cell.key+':'+cell.id,owners:[...new Map(ids.flatMap(j=>cells[j].owners).map(o=>[o.id,o])).values()],shared:cell.owners.length>1,color:cell.color,systemIds:ids.map(j=>cells[j].id),center,area});
 }
 return {cells,vertices,borders,regions};
}

// Markers describe exact ownership. The world renderer joins adjacent planar cells with the same owners.
function auroraStrategyData(systems,planets,playerId){
 const records=new Map(),palette=['#cc92dc','#82abef','#e5a771','#b6cb79','#db91a8'];
 const color=id=>{if(id===playerId)return '#67d9c3';let hash=0;for(const c of String(id))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return palette[hash%palette.length];};
 for(const p of planets){if(!p.owner||p.npc||p.moon||p.kind==='belt')continue;const id=(p.coordinates||p.position)[1];if(!records.has(id))records.set(id,{owners:new Map(),worlds:[]});const r=records.get(id);r.owners.set(p.owner,{id:p.owner,name:p.ownerName||String(p.owner),color:color(p.owner)});r.worlds.push(p);}
 for(const s of systems)if(s.systemOwner){const r=records.get(s.id)||{worlds:[]};r.territoryClass='sovereign:'+s.systemOwner;r.owners=new Map([[s.systemOwner,{id:s.systemOwner,name:s.systemOwnerName,color:s.systemOwner===playerId?'#67d9c3':s.systemColor||color(s.systemOwner)}]]);records.set(s.id,r);}
 return systems.filter(s=>records.has(s.id)).map(s=>({id:s.id,position:s.position.slice(),name:s.name,territoryClass:records.get(s.id).territoryClass,owners:[...records.get(s.id).owners.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id))),worlds:records.get(s.id).worlds}));
}
// Short, separate constellations join selectable systems only; these are visual guides.
function auroraConstellationLinks(systems){
 const stars=[...systems].sort((a,b)=>a.id-b.id),parent=stars.map((_,i)=>i),sizes=stars.map(()=>1),degree=stars.map(()=>0),candidates=[],links=[];
 const root=i=>{while(parent[i]!==i)i=parent[i];return i;};
 const turn=(a,b,c)=>(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
 for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
  const distance=Math.hypot(...stars[i].position.map((v,k)=>v-stars[j].position[k]));
  if(distance<=5400)candidates.push({i,j,distance});
 }
 candidates.sort((a,b)=>a.distance-b.distance||stars[a.i].id-stars[b.i].id||stars[a.j].id-stars[b.j].id);
 for(const edge of candidates){const {i,j}=edge,a=root(i),b=root(j);if(a===b||degree[i]>=3||degree[j]>=3||sizes[a]+sizes[b]>8)continue;
  const p=stars[i].position,q=stars[j].position;
  if(links.some(e=>{if([e.i,e.j].includes(i)||[e.i,e.j].includes(j))return false;const r=stars[e.i].position,s=stars[e.j].position;return turn(p,q,r)*turn(p,q,s)<0&&turn(r,s,p)*turn(r,s,q)<0;}))continue;
  parent[b]=a;sizes[a]+=sizes[b];degree[i]++;degree[j]++;links.push(edge);
 }
 return links.map(({i,j})=>({a:stars[i].id,b:stars[j].id,group:stars[root(i)].id}));
}

// The original planar algorithm operates in its catalogue coordinate units.
export function territoryGeometry(systems,records,worldScale=100){const data=auroraTerritoryGeometry(systems.map(s=>({...s,position:s.position.map(v=>v/worldScale)})),records);for(const v of data.vertices)for(let k=0;k<3;k++)v[k]*=worldScale;for(const list of [data.cells,data.regions])for(const cell of list){cell.center=cell.center.map(v=>v*worldScale);cell.area*=worldScale*worldScale;}return data;}
export const strategyData=auroraStrategyData;
export function constellationLinks(systems,worldScale=100){return auroraConstellationLinks(systems.map(s=>({...s,position:s.position.map(v=>v/worldScale)})));}
