import {EXTENT,footprint,doorPoint,polygonArea} from './plans.js';
export function contains(poly,x,y){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
const samples=points=>points.slice(1).flatMap((b,i)=>{const a=points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*2);return Array.from({length:n+1},(_,j)=>[a[0]+(b[0]-a[0])*j/(n||1),a[1]+(b[1]-a[1])*j/(n||1)]);});
function simplify(points){return points.filter((p,i)=>i===0||i===points.length-1||(p[0]-points[i-1][0])*(points[i+1][1]-p[1])!==(p[1]-points[i-1][1])*(points[i+1][0]-p[0]));}
const W=EXTENT[0]+1,H=EXTENT[1]+1,key=(x,y)=>y*W+x,xy=k=>[k%W,Math.floor(k/W)];
function nearestFree(p,blocked){const [cx,cy]=p.map(Math.round);for(let r=0;r<8;r++)for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){if(x<2||y<2||x>=W-2||y>=H-2)continue;if(!blocked[key(x,y)])return key(x,y);}return -1;}
function route(start,end,blocked,existing){
  const a=nearestFree(start,blocked),b=end?nearestFree(end,blocked):-1;if(a<0)return null;
  // A bounded Dijkstra search prefers a shared, planned road over a new spur.
  const dist=new Float64Array(W*H).fill(Infinity),prev=new Int32Array(W*H).fill(-1),heap=[];
  const push=(k,d)=>{heap.push([k,d]);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j][1]<=d)break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}};
  const pop=()=>{const out=heap[0],tail=heap.pop();if(heap.length){heap[0]=tail;let i=0;for(;;){let j=i*2+1;if(j>=heap.length)break;if(j+1<heap.length&&heap[j+1][1]<heap[j][1])j++;if(heap[i][1]<=heap[j][1])break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}}return out;};
  dist[a]=0;push(a,0);let found=-1;
  while(heap.length){const [at,cost]=pop();if(cost!==dist[at])continue;if(end?at===b:existing.has(at)){found=at;break;}const [x,y]=xy(at);
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=W-2||ny>=H-2)continue;const nk=key(nx,ny);if(blocked[nk])continue;const next=cost+(existing.has(nk)?.28:1);if(next<dist[nk]){dist[nk]=next;prev[nk]=at;push(nk,next);}}
  }
  if(found<0)return null;const path=[];for(let at=found;at!==-1;at=prev[at]){path.push(xy(at));if(at===a)break;}return simplify(path.reverse());
}
function equipmentPort(node,other,side){
  if(!node.w)return node.point;
  if(!side){const dx=other.x-node.x,dy=other.y-node.y;side=Math.abs(dx)/node.w>Math.abs(dy)/node.d?(dx>0?'e':'w'):(dy>0?'s':'n');}
  return doorPoint({...node,door:side},2);
}
function processRoute(a,b,connection,blocked){
  const start=equipmentPort(a,b,connection?.fromSide),end=equipmentPort(b,a,connection?.toSide);
  const clear=pts=>samples(pts).every(([x,y])=>x>=0&&y>=0&&x<W&&y<H&&!blocked[key(Math.round(x),Math.round(y))]);
  if(connection?.via){const pts=[start,...connection.via,end];return clear(pts)?pts:null;}
  const candidates=[[start,end],[start,[end[0],start[1]],end],[start,[start[0],end[1]],end]];
  return candidates.find(clear)||route(start,end,blocked,new Set());
}
export function prepare(p){
  if(p.prepared)return p;
  const blocked=new Uint8Array(W*H),roadCells=new Set(),walkCells=new Set(),errors=[];
  for(const b of p.buildings){b.polygon=footprint(b);b.area=polygonArea(b.polygon);for(let y=Math.max(0,Math.floor(b.y-b.d/2-1));y<=Math.min(H-1,Math.ceil(b.y+b.d/2+1));y++)for(let x=Math.max(0,Math.floor(b.x-b.w/2-1));x<=Math.min(W-1,Math.ceil(b.x+b.w/2+1));x++){
    if(contains(b.polygon,x,y)||b.polygon.some((a,i)=>segmentDistance(x,y,a,b.polygon[(i+1)%b.polygon.length])<.8))blocked[key(x,y)]=1;
  }}
  for(const r of p.roads)for(const [x,y]of samples(r.points)){if(p.buildings.some(b=>contains(b.polygon,x,y)))errors.push(`主通道穿过建筑 ${x.toFixed(1)},${y.toFixed(1)}`);const k=key(Math.round(x),Math.round(y));roadCells.add(k);if(r.kind==='walk')walkCells.add(k);}
  p.access=[];
  for(const b of p.buildings){const door=doorPoint(b),outside=doorPoint(b,2),path=route(outside,null,blocked,roadCells);if(!path){errors.push(`${b.id} 无可达入口`);continue;}const points=[door,outside,...path];p.access.push({building:b.id,kind:b.role==='equipment'?'service':'access',points});b.access=points;
    for(const [x,y]of samples(points))roadCells.add(key(Math.round(x),Math.round(y)));
  }
  const nodes=new Map([...p.buildings.map(b=>[b.id,{...b,point:doorPoint(b,2)}]),...p.entries.map(e=>[e.id,{...e,point:[e.x,e.y]}])]);
  p.routedFlows=[];
  for(const f of p.flows){const segments=[];for(let i=1;i<f.ids.length;i++){const a=nodes.get(f.ids[i-1]),b=nodes.get(f.ids[i]);if(!a||!b){errors.push(`流程节点不存在 ${f.ids[i-1]} / ${f.ids[i]}`);continue;}
      const technical=!['walk','freight'].includes(f.kind),connection=f.connections?.find(c=>c.from===a.id&&c.to===b.id);
      const path=technical?processRoute(a,b,connection,blocked):route(a.point,b.point,blocked,roadCells);if(!path)errors.push(`流程不可达 ${a.id} → ${b.id}`);else segments.push({from:a.id,to:b.id,points:path});
    }p.routedFlows.push({...f,segments});
  }
  p.validation={errors:[...new Set(errors)],accessCount:p.access.length,buildingCount:p.buildings.length};p.prepared=true;return p;
}
export const ORIGINAL_NAMES={Command_Center:'主基地',Research_Lab:'研究实验室',Metal_Mine:'金属开采综合体',Crystal_Mine:'晶体开采综合体',Gas_Mine:'气体开采综合体',Solar_Plant:'太阳能电站',Fusion_Reactor:'聚变反应堆',Robotics_Facility:'机器人工厂',Nanite_Factory:'纳米工厂',Radar_Facility:'雷达站',Alliance_Depot:'联盟设施',Shipyard:'太空电梯',Missile_Silo:'行星保障中心',Terraformer:'地形改造器'};
const references={Command_Center:'archive',Research_Lab:'mat2',Metal_Mine:'parts',Crystal_Mine:'supply',Gas_Mine:'repair',Solar_Plant:'repair',Fusion_Reactor:'store',Robotics_Facility:'spares',Nanite_Factory:'water',Radar_Facility:'parts',Alliance_Depot:'parts',Shipyard:'parts',Missile_Silo:'recycle',Terraformer:'pump'};
export function scalePair(p){const main=p.buildings.filter(b=>b.role==='primary'&&b.shape!=='dish').sort((a,b)=>b.area-a.area)[0],support=p.buildings.find(b=>b.id===references[p.id]);return {main,support,areaRatio:main.area/support.area,heightRatio:main.h/support.h};}
