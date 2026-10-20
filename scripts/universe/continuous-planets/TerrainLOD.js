import { cubeDirection, directionFaceUV, tileBounds } from './cube.js';
import { qualityConfig } from './config.js';
import { createTerrainMaterial,createLiquidMaterial } from './materials.js';

const key=(face,l,x,y)=>`${face}/${l}/${x}/${y}`;
const descends=(node,ancestor)=>node.face===ancestor.face&&node.level>=ancestor.level&&Math.floor(node.x/2**(node.level-ancestor.level))===ancestor.x&&Math.floor(node.y/2**(node.level-ancestor.level))===ancestor.y;
class MaxHeap{
 constructor(){this.items=[];}
 push(node,score){const a=this.items,item={node,score};let i=a.length;a.push(item);while(i){const p=(i-1)>>1;if(a[p].score>=score)break;a[i]=a[p];i=p;}a[i]=item;}
 pop(){const a=this.items;if(!a.length)return null;const first=a[0],last=a.pop();if(a.length){let i=0;while(true){let c=i*2+1;if(c>=a.length)break;if(c+1<a.length&&a[c+1].score>a[c].score)c++;if(a[c].score<=last.score)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
 get length(){return this.items.length;}
}
export class TerrainLOD{
 constructor({THREE,field,type,seed,radius,quality,surface,liquid,pool,coverage}){
  Object.assign(this,{THREE,field,type,seed,radius,surface,liquid});this.config=qualityConfig(quality);this.quality=quality;
  this.material=createTerrainMaterial(THREE,type,radius,coverage);this.liquidMaterial=createLiquidMaterial(THREE,type,radius,coverage);
  this.pool=pool;if(!pool)throw new Error('The game supplies its shared terrain queue');this.nodes=new Map();this.roots=[];this.leaves=[];this.completions=[];this.frame=0;this.epoch=0;this.visible=true;this.disposed=false;
  this.eye=new THREE.Vector3();this.eyeDir=new THREE.Vector3();this.prevMap=new Map();this.leafMap=new Map();this.stats={};
  this.globalLeaves=[];this.desiredSplits=new Set();this.desiredNodes=new Set();this.desiredMap=new Map();this.planDirty=true;this.planState=null;
  this.outstanding=0;this.cacheCount=0;this.geometryBytes=0;this.frontierRepairs=0;this.topologyChanged=true;
  this.ready=new Promise(resolve=>this.resolveReady=resolve);
  for(let f=0;f<6;f++)this.roots.push(this.makeNode(f,0,0,0,null));
 }
 makeNode(face,level,x,y,parent){
  const b=tileBounds(level,x,y),d=cubeDirection(face,b.u+b.span/2,b.v+b.span/2),{THREE}=this;
  const a=Math.max(...[[0,0],[1,0],[0,1],[1,1]].map(([i,j])=>{const c=cubeDirection(face,b.u+i*b.span,b.v+j*b.span);return Math.acos(Math.min(1,d[0]*c[0]+d[1]*c[1]+d[2]*c[2]));}));
   const node={face,level,x,y,parent,key:key(face,level,x,y),...b,direction:new THREE.Vector3(...d),angle:a,detailScale:this.field.detailScale?.(d,a)??this.field.lodErrorScale??1,children:null,split:false,mesh:null,water:null,pending:false,morph:1,edges:new THREE.Vector4(),lastUsed:0,bytes:0};
  this.nodes.set(node.key,node);return node;
 }
 request(node,priority){
  if(node.mesh||node.pending||this.outstanding>=48||!this.visible||this.disposed)return;
  node.pending=true;this.outstanding++;const epoch=this.epoch;
  this.pool.request({face:node.face,level:node.level,x:node.x,y:node.y,grid:this.config.grid,radius:this.radius,type:this.type,seed:this.seed},priority).then(data=>{
   if(epoch!==this.epoch)return;if(data&&!this.disposed&&this.visible&&this.nodes.get(node.key)===node)this.completions.push({node,data});else{node.pending=false;this.outstanding=Math.max(0,this.outstanding-1);}
  });
 }
 commit(node,data){
  if(node.pending){node.pending=false;this.outstanding=Math.max(0,this.outstanding-1);}if(node.mesh)return;const {THREE}=this,g=new THREE.BufferGeometry();
  for(const [name,source,size] of [['position','position',3],['normal','normal',3],['color','color',3],['aCoarse','coarse',3],['aCoarseNormal','coarseNormal',3],['aEdge','edge',4],['aHints','hints',2]])g.setAttribute(name,new THREE.BufferAttribute(data[source],size));
  g.setIndex(new THREE.BufferAttribute(data.index,1));g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,this.material);mesh.name=`terrain:${node.key}`;mesh.position.fromArray(data.origin);mesh.visible=false;
  node.origin=new THREE.Vector3(...data.origin);node.mesh=mesh;node.data=data;node.bytes=Object.values(data).filter(ArrayBuffer.isView).reduce((s,x)=>s+x.byteLength,0);
  this.cacheCount++;this.geometryBytes+=node.bytes;node.lastUsed=this.frame;if(node.level===0)this.topologyChanged=true;
  mesh.onBeforeRender=()=>this.bind(this.material,node);this.surface.add(mesh);
  if(data.waterIndex?.length){
   const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(data.waterPosition,3));wg.setAttribute('aCoarse',new THREE.BufferAttribute(data.waterCoarse,3));
   // Buffer arrays may be shared; each geometry owns its own BufferAttribute wrapper.
   wg.setAttribute('aEdge',new THREE.BufferAttribute(data.edge,4));wg.setAttribute('aHints',new THREE.BufferAttribute(data.waterHints,2));wg.setIndex(new THREE.BufferAttribute(data.waterIndex,1));wg.computeBoundingSphere();
   const water=new THREE.Mesh(wg,this.liquidMaterial);water.name=`liquid:${node.key}`;water.position.copy(mesh.position);water.visible=false;water.onBeforeRender=()=>this.bind(this.liquidMaterial,node);this.liquid.add(water);node.water=water;
  }
  if(this.roots.every(n=>n.mesh)&&this.resolveReady){this.resolveReady();this.resolveReady=null;}
 }
 bind(material,node){material.uniforms.uOrigin.value.copy(node.origin);material.uniforms.uMorph.value=node.morph;material.uniforms.uEdges.value.copy(node.edges);material.uniformsNeedUpdate=true;}
 leafAt(face,u,v,map=this.prevMap){
  const a=Math.max(0,Math.min(.999999999,(u+1)/2)),b=Math.max(0,Math.min(.999999999,(v+1)/2));
  // These maps contain frontier leaves, never both an ancestor and descendant.
  // Most orbital tiles are shallow: avoid 10+ failed string/map probes per query.
  for(let l=0;l<=15;l++){const s=2**l,n=map.get(key(face,l,Math.floor(a*s),Math.floor(b*s)));if(n)return n;}return null;
 }
 topologyAt(face,u,v){
  const a=Math.max(0,Math.min(.999999999,(u+1)/2)),b=Math.max(0,Math.min(.999999999,(v+1)/2));let n=this.roots[face];
  while(n?.split&&n.children?.every(c=>c.mesh)){const s=2**(n.level+1),xx=Math.floor(a*s)&1,yy=Math.floor(b*s)&1;n=n.children[yy*2+xx];}return n;
 }
 neighbors(node,map=null){
  const out=[],gap=node.span*.00003;
  for(let e=0;e<4;e++){
   const list=[];for(const t of [.18,.5,.82]){
    const u=e===0?node.u-gap:e===1?node.u+node.span+gap:node.u+node.span*t;
    const v=e===2?node.v-gap:e===3?node.v+node.span+gap:node.v+node.span*t;
    const f=u>=-1&&u<=1&&v>=-1&&v<=1?[node.face,u,v]:directionFaceUV(...cubeDirection(node.face,u,v)),neighbor=map?this.leafAt(...f,map):this.topologyAt(...f);if(neighbor)list.push(neighbor);
   }out.push(list);
  }return out;
 }
 canSplit(node){return this.neighbors(node).flat().every(n=>n.level>=node.level&&(n.level>node.level||n.morph>.999));}
 canMerge(node){return this.neighbors(node).flat().every(n=>n.level<=node.level+1);}
 isCulled(node){
  const dot=node.direction.dot(this.eyeDir),horizon=Math.acos(Math.min(1,Math.max(0,(1+this.field.minHeight)/Math.max(1+this.field.minHeight,this.eye.length()/this.radius))));
  // Height allowance preserves distant mountain silhouettes above the nominal horizon.
  if(Math.acos(Math.max(-1,Math.min(1,dot)))>horizon+node.angle+.37)return true;
  if(this.viewDirection&&node.level>2){
   const cx=node.direction.x*this.radius-this.eye.x,cy=node.direction.y*this.radius-this.eye.y,cz=node.direction.z*this.radius-this.eye.z;
   const distance=Math.hypot(cx,cy,cz),sphere=this.radius*(Math.sin(node.angle)+this.field.maxHeight-this.field.minHeight);
   if(distance>sphere&&((cx*this.viewDirection.x+cy*this.viewDirection.y+cz*this.viewDirection.z)/distance)<Math.cos(this.coneAngle+Math.asin(Math.min(1,sphere/distance))))return true;
  }
  return false;
 }
 error(node){
  const angle=Math.acos(Math.max(-1,Math.min(1,node.direction.dot(this.eyeDir)))),lateral=2*this.radius*Math.sin(Math.max(0,angle-node.angle)*.5);
  const distance=Math.hypot(lateral,Math.max(this.radius*.000055,this.altitude));
  const cell=node.span/this.config.grid;
   return node.detailScale*this.focal*this.radius*(cell*.115+cell*cell*.45)/Math.max(distance,this.radius*.000055);
 }
 ensureChildren(node){if(!node.children)node.children=[this.makeNode(node.face,node.level+1,node.x*2,node.y*2,node),this.makeNode(node.face,node.level+1,node.x*2+1,node.y*2,node),this.makeNode(node.face,node.level+1,node.x*2,node.y*2+1,node),this.makeNode(node.face,node.level+1,node.x*2+1,node.y*2+1,node)];}
 plan(){
  const old=this.planState,view=this.viewDirection;
  const moved=!old||this.eyeDir.distanceToSquared(old.direction)>Math.max(.000004,this.altitude/this.radius*.07)**2;
  const altitudeChanged=!old||Math.abs(this.altitude-old.altitude)>Math.max(this.radius*.000015,Math.abs(old.altitude)*.055);
  const turned=!old||Boolean(view)!==Boolean(old.view)||(view&&view.dot(old.view)<.9997);
  if(!this.planDirty&&!moved&&!altitudeChanged&&!turned&&old.focal===this.focal)return;
  this.planDirty=false;this.planState={direction:this.eyeDir.clone(),altitude:this.altitude,view:view?.clone()||null,focal:this.focal};
  const map=new Map(this.roots.map(n=>[n.key,n])),splits=new Set(),heap=new MaxHeap();
  // A distant globe needs enough samples to describe its geological silhouette
  // and filtered lighting. This floor is disabled near the surface, where the
  // same finite leaf budget must go to the highest screen error near the eye.
  const score=n=>this.isCulled(n)?0:(this.altitude>this.radius*.15&&n.level<2?Math.max(this.error(n),1e6/(n.level+1)):this.error(n));
  for(const n of this.roots)heap.push(n,score(n));
  const split=n=>{
   if(!map.has(n.key))return true;if(n.level>=this.config.maxLevel||map.size+3>this.config.maxLeaves)return false;
   for(const other of new Set(this.neighbors(n,map).flat()))if(other.level<n.level&&!split(other))return false;
   if(map.size+3>this.config.maxLeaves)return false;
   this.ensureChildren(n);map.delete(n.key);splits.add(n.key);
   for(const c of n.children){map.set(c.key,c);heap.push(c,score(c));}return true;
  };
  while(heap.length&&map.size+3<=this.config.maxLeaves){const {node,score:value}=heap.pop();if(!map.has(node.key))continue;if(value<=this.config.errorPixels||node.level>=this.config.maxLevel)continue;split(node);}
  this.desiredMap=map;this.desiredSplits=splits;this.desiredNodes=new Set([...map.keys(),...splits]);
  // Obsolete queued jobs have no visible work to finish; running jobs may finish into the bounded cache.
  this.pool.queue=this.pool.queue.filter(task=>{const j=task.job;if(this.desiredNodes.has(key(j.face,j.level,j.x,j.y)))return true;task.resolve(null);return false;});
 }
 queueNeeded(){
  const candidates=[];for(const n of this.roots)if(!n.mesh&&!n.pending)candidates.push({node:n,score:1e12});
  for(const id of this.desiredSplits){const n=this.nodes.get(id);if(!n?.mesh)continue;
   // Only request the next useful frontier layer. Deep prefetch must not starve a
   // coarse balancing sibling whose readiness is required to reveal the detail.
   const owner=this.topologyAt(n.face,n.u+n.span/2,n.v+n.span/2);
   if(!n.split&&owner!==n)continue;
   for(const c of n.children)if(!c.mesh&&!c.pending)candidates.push({node:c,score:this.error(c)});
  }
  candidates.sort((a,b)=>b.score-a.score);for(const {node,score} of candidates){if(this.outstanding>=48)break;this.request(node,score);}
 }
 collapse(node){if(node.split){this.topologyChanged=true;this.neighborRevision=(this.neighborRevision||0)+1;}node.split=false;for(const c of node.children||[])if(c.split)this.collapse(c);}
 ordered(children){return [...children].sort((a,b)=>this.error(b)-this.error(a));}
 collect(node,forced=false){
  if(!node.mesh)return [];
  // Evicted child meshes must never hide the ready fallback parent.
  if(node.split&&node.children.some(c=>!c.mesh))this.collapse(node);
  const want=!forced&&this.desiredSplits.has(node.key);
  if(!node.split&&want&&node.morph>.999&&this.allowance>=3){
   this.ensureChildren(node);
   if(node.children.every(c=>c.mesh)&&this.canSplit(node)&&this.allowance>=3){node.split=true;this.topologyChanged=true;this.neighborRevision=(this.neighborRevision||0)+1;for(const c of node.children)c.morph=0;this.allowance-=3;}
  }
  if(node.split){
   if(want){for(const c of node.children)c.morph=Math.min(1,c.morph+this.dt/.32);return this.ordered(node.children).flatMap(c=>this.collect(c,false));}
   if(node.children.some(c=>c.split))return this.ordered(node.children).flatMap(c=>this.collect(c,true));
   if(this.canMerge(node)){
    for(const c of node.children)c.morph=Math.max(0,c.morph-this.dt/.26);
    if(node.children.every(c=>c.morph<=0)){this.collapse(node);this.allowance+=3;return [node];}
   }
   return node.children.filter(c=>c.mesh);
  }
  return [node];
 }
 repairFrontier(leaves){
  if(!this.topologyChanged&&leaves.length<=this.config.maxLeaves&&this.frame%60!==0)return leaves;
  let result=leaves;
  const replace=ancestor=>{this.collapse(ancestor);result=result.filter(n=>!descends(n,ancestor));result.push(ancestor);this.frontierRepairs++;};
  // Ready ancestor meshes are retained; even an exceptional topology repair never makes a hole.
  for(let pass=0;pass<18;pass++){
   const map=new Map(result.map(n=>[n.key,n]));let target=null;
   for(const n of result){for(const other of this.neighbors(n,map).flat())if(n.level>other.level+1){let p=n;while(p.level>other.level+1)p=p.parent;if(p.mesh){target=p;break;}}if(target)break;}
   if(!target)break;replace(target);
  }
  while(result.length>this.config.maxLeaves){
   const counts=new Map();for(const n of result){let p=n.parent;while(p){counts.set(p,(counts.get(p)||0)+1);p=p.parent;}}
   let candidate=null,best=Infinity;for(const [p,count] of counts)if(count>1&&p.mesh){const value=this.error(p);if(value<best){candidate=p;best=value;}}
   if(!candidate)break;replace(candidate);
  }
  // Budget coarsening can introduce another level mismatch; close that conservatively too.
  for(let pass=0;pass<30;pass++){
   const map=new Map(result.map(n=>[n.key,n]));let target=null;
   for(const n of result){for(const other of this.neighbors(n,map).flat())if(n.level>other.level+1){let p=n;while(p.level>other.level+1)p=p.parent;if(p.mesh){target=p;break;}}if(target)break;}
   if(!target)break;replace(target);
  }
  return result;
 }
 update({dt,time,eyeLocal,verticalFovRadians,viewportHeightPixels,viewDirectionLocal,aspectRatio=1.6}){
  if(this.disposed||!this.visible)return;
  this.frame++;this.topologyChanged=false;this.dt=Math.min(.06,Math.max(0,dt));this.eye.copy(eyeLocal);this.eyeDir.copy(eyeLocal).normalize();
  this.altitude=this.eye.length()-this.radius*(1+this.field.height(this.eyeDir.x,this.eyeDir.y,this.eyeDir.z));
  this.focal=viewportHeightPixels/(2*Math.tan(verticalFovRadians/2));this.viewDirection=viewDirectionLocal||null;this.coneAngle=Math.atan(Math.tan(verticalFovRadians/2)*Math.max(1,aspectRatio))+.25;
  for(const mat of [this.material,this.liquidMaterial]){mat.uniforms.uEye.value.copy(eyeLocal);mat.uniforms.uTime.value=time;}
  this.pool.tick(1.6,time);
  for(let i=0;i<this.config.commitsPerFrame&&this.completions.length;i++){const c=this.completions.shift();this.commit(c.node,c.data);}
  this.plan();this.queueNeeded();this.prevMap=this.leafMap;this.allowance=Math.max(0,this.config.maxLeaves-this.globalLeaves.length);
  for(const node of this.leaves){if(node.mesh)node.mesh.visible=false;if(node.water)node.water.visible=false;}
  this.globalLeaves=this.repairFrontier(this.ordered(this.roots).flatMap(n=>this.collect(n)));
  this.leaves=this.globalLeaves.filter(n=>!this.isCulled(n));this.leafMap=new Map(this.leaves.map(n=>[n.key,n]));
  for(const node of this.leaves){
   // Neighbor membership changes with topology; morph values still update every
   // frame. Avoid traversing the same quadtree 12 times per unchanged tile.
   const revision=this.neighborRevision||0;
   if(!node.edgeNeighbors||node.neighborRevision!==revision){node.edgeNeighbors=this.neighbors(node);node.neighborRevision=revision;}
   node.edges.set(...node.edgeNeighbors.map(ns=>ns.some(n=>n.level<node.level)?1:Math.max(0,...ns.filter(n=>n.level===node.level).map(n=>1-n.morph))));
   node.mesh.visible=true;if(node.water)node.water.visible=true;node.lastUsed=this.frame;
  }
  this.cacheTarget=this.altitude>this.radius*.15?Math.min(this.config.cacheTiles,Math.max(90,this.globalLeaves.length*2+24)):this.config.cacheTiles;
  if(this.cacheCount>this.cacheTarget||this.frame%30===0)this.trim(this.cacheTarget);
 }
 trim(max=this.config.cacheTiles){
  const keep=new Set(this.roots);for(const leaf of this.globalLeaves){let p=leaf;while(p){keep.add(p);p=p.parent;}}
  const all=[...this.nodes.values()].filter(n=>n.mesh),available=all.filter(n=>!keep.has(n)).sort((a,b)=>a.lastUsed-b.lastUsed);
  let count=all.length;for(const n of available){if(count<=max)break;this.freeNode(n);count--;}
  const drop=n=>{for(const c of n.children||[])drop(c);this.nodes.delete(n.key);};
  const prune=n=>{const children=n.children;if(!children)return !n.mesh&&!n.pending&&!this.desiredNodes.has(n.key);const empty=children.map(prune).every(Boolean);if(empty&&!n.split){for(const c of children)drop(c);n.children=null;}return !n.mesh&&!n.pending&&!n.children&&!this.desiredNodes.has(n.key);};
  for(const n of this.roots)prune(n);
 }
 freeNode(n){if(n.mesh){this.surface.remove(n.mesh);n.mesh.geometry.dispose();n.mesh=null;this.cacheCount--;this.geometryBytes-=n.bytes;}if(n.water){this.liquid.remove(n.water);n.water.geometry.dispose();n.water=null;}n.data=null;n.bytes=0;this.collapse(n);}
 navigationHeight(direction){
  const f=directionFaceUV(direction.x,direction.y,direction.z),node=this.leafAt(...f,this.leafMap);if(!node?.data)return null;
  const n=node.data.grid,stride=n+1,xx=Math.max(0,Math.min(n-.000001,(f[1]-node.u)/node.span*n)),yy=Math.max(0,Math.min(n-.000001,(f[2]-node.v)/node.span*n));
  const i=Math.floor(xx),j=Math.floor(yy),a=j*stride+i,b=a+1,c=a+stride,d=c+1;
  return Math.max(node.data.nav[a],node.data.nav[b],node.data.nav[c],node.data.nav[d])*this.radius;
 }
 // Exact plane of the currently displayed, edge-morphed triangle. Local campus
 // meshes use this only at their outer seam; their foundations never morph.
 renderedHeight(direction){
  const f=directionFaceUV(direction.x,direction.y,direction.z),node=this.leafAt(...f,this.leafMap);if(!node?.data)return null;
  const data=node.data,n=data.grid,stride=n+1,xx=Math.max(0,Math.min(n-.000001,(f[1]-node.u)/node.span*n)),yy=Math.max(0,Math.min(n-.000001,(f[2]-node.v)/node.span*n)),i=Math.floor(xx),j=Math.floor(yy),a=j*stride+i,b=a+1,c=a+stride,d=c+1,ids=xx-i+yy-j<=1?[a,b,c]:[b,d,c];
  const edges=node.edges.toArray(),vertices=ids.map(id=>{let m=1-node.morph;for(let k=0;k<4;k++)m=Math.max(m,data.edge[id*4+k]*edges[k]);return [0,1,2].map(k=>data.origin[k]+data.position[id*3+k]*(1-m)+data.coarse[id*3+k]*m);});
  const [p,q,r]=vertices,u=q.map((v,k)=>v-p[k]),v=r.map((a,k)=>a-p[k]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],den=normal[0]*direction.x+normal[1]*direction.y+normal[2]*direction.z;
  return Math.abs(den)>1e-15?normal.reduce((s,v,k)=>s+v*p[k],0)/den-this.radius:null;
 }
 setLighting({directionLocal}){for(const m of [this.material,this.liquidMaterial])m.uniforms.uSun.value.copy(directionLocal).normalize();}
 setQuality(q){this.config=qualityConfig(q);this.quality=q;this.planDirty=true;}
 setVisible(value){
  if(this.visible===value)return;this.visible=value;this.neighborRevision=(this.neighborRevision||0)+1;
  if(!value){this.epoch++;this.pool.pause();this.outstanding=0;this.completions=[];for(const n of this.nodes.values()){n.pending=false;if(n.level>0)this.freeNode(n);}for(const n of this.roots){n.children=null;n.split=false;if(n.mesh)n.mesh.visible=true;if(n.water)n.water.visible=true;}this.nodes=new Map(this.roots.map(n=>[n.key,n]));this.leaves=[];this.globalLeaves=[];this.desiredSplits.clear();this.desiredNodes.clear();this.desiredMap.clear();this.planDirty=true;this.planState=null;this.leafMap.clear();this.prevMap.clear();}
  else this.pool.resume();
 }
 getStats(){
  return {maxLod:Math.max(0,...this.leaves.map(n=>n.level)),lod:Math.max(0,...this.leaves.map(n=>n.level)),activeBlocks:this.leaves.length,activeTiles:this.leaves.length,globalFrontier:this.globalLeaves.length,cachedBlocks:this.cacheCount,cacheLimit:this.config.cacheTiles,cacheTarget:this.cacheTarget??this.config.cacheTiles,pendingJobs:this.outstanding,triangles:this.leaves.reduce((s,n)=>s+(n.mesh?.geometry.index.count||0)/3+(n.water?.geometry.index.count||0)/3,0),geometryBytes:Math.max(0,this.geometryBytes),workerMode:this.pool.fallback?'time-sliced main-thread fallback':'module Workers',workerError:this.pool.error,maxLevelBudget:this.config.maxLevel,maxLeavesBudget:this.config.maxLeaves,errorPixels:this.config.errorPixels,desiredMaxLod:Math.max(0,...[...this.desiredMap.values()].map(n=>n.level)),metadataNodes:this.nodes.size,frontierRepairs:this.frontierRepairs,ready:this.roots.every(n=>n.mesh)};
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.epoch++;this.pool.dispose();this.outstanding=0;for(const node of this.nodes.values())this.freeNode(node);this.material.dispose();this.liquidMaterial.dispose();this.nodes.clear();this.roots=[];this.leaves=[];this.globalLeaves=[];this.desiredSplits.clear();this.desiredNodes.clear();this.desiredMap.clear();this.completions=[];this.prevMap.clear();this.leafMap.clear();this.resolveReady?.();this.resolveReady=null;}
}
