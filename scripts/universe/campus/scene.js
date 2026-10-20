import {THREE,materials,builder,chamfer,tree,labelSprite} from './primitives.js';
import {footprint} from './plans.js';
import {scalePair} from './geometry.js';
import {previewPlan} from './preview-plan.js';
import {createTerrain} from './terrain.js';
import {createBuilding} from './models.js';
import {ALL_IDS,SPACE_DESCRIPTIONS} from './catalogue.js';
import {conduit} from './forms.js';

export const IDS=ALL_IDS;
export const DESCRIPTIONS={
  Research_Lab:{eyebrow:'01 / RESEARCH INSTITUTE',title:'综合研究所',tag:'环形科研核心 · 多翼实验院落',description:'四段环形实验舱围绕共享仪器，玻璃连廊通向多翼主楼。材料压力舱、能源实验装置与系统分院各有轮廓，东侧保留室外校准场。',subjects:['环形科研核心与旋转仪器','多翼主楼与玻璃实验中庭','分瓣能源实验舱'],features:['shared','main','energy2'],detail:'shared',reference:'01-research-institute.png'},
  Metal_Mine:{eyebrow:'02 / METAL MINING CAMPUS',title:'金属矿业基地',tag:'矿壁切削 · 装甲破碎 · 透明精炼',description:'切削轮沿西侧矿壁作业，矿石经有支撑的输送带进入双颚破碎站，再送入可见内部处理设备的精炼大厅。堆料、装运与重载维修各据一侧。',subjects:['矿壁切削采掘装置','双颚破碎与筛分辊组','玻璃精炼大厅'],features:['exc1','crusher','process'],detail:'crusher',reference:'02-metal-mining-campus.png'},
  Robotics_Facility:{eyebrow:'03 / ROBOTICS WORKS',title:'机器人制造基地',tag:'精密加工 · 外骨架装配 · 实机测试',description:'六角加工舱连接外骨架装配大厅。开放屋顶和正面工作舱露出机械臂、机器人底盘与双线传送带；测试通过后进入成品出货区。',subjects:['外骨架大厅与开放装配线','六角精密加工舱','机器人测试场'],features:['assembly','machine','testrig'],detail:'assembly',reference:'03-robotics-manufacturing.png'}
};
Object.assign(DESCRIPTIONS,SPACE_DESCRIPTIONS);
const roles={primary:'主体',specialist:'专业设施',support:'配套',equipment:'设备'};
function points3(points,height,raise=.5){return points.map(([x,z])=>new THREE.Vector3(x-80,height(x,z)+raise,z-70));}
function truck(mats,kind){const root=new THREE.Group(),g=builder(root,mats);g.box([0,.39,0],[.9,.3,1.9],'roof');g.box([0,.75,-.6],[.9,.55,.7],'white');g.box([0,.82,-.96],[.7,.28,.06],'glass');g.box([0,.75,.37],[.85,.5,1.15],kind==='ore'?'gold':'teal');for(const x of[-.49,.49])for(const z of[-.6,.6])g.cylinder([x,.28,z],.25,.16,'dark',[0,0,Math.PI/2]);g.finish();return root;}
export function createCampus(id,{review=true,gas,biome,renderGround=true}={}){
  if(!IDS.includes(id))throw Error('Unsupported preview campus');
  const plan=previewPlan(id);
  if(gas){plan.landscape=[];plan.courts=plan.zones.filter(z=>plan.buildings.some(b=>b.zone===z.id)).map(z=>[...z.bounds]);}
  const mats=materials(),root=new THREE.Group(),terrain=createTerrain(plan,mats,{gas,biome,renderGround}),buildings=[],labels=new THREE.Group(),overlay=new THREE.Group(),dynamic=new THREE.Group();root.name=id;
  root.add(terrain.ground,terrain.roads,terrain.vegetation,labels,overlay,dynamic);labels.visible=false;overlay.visible=false;
  const details=new THREE.Group(),g=builder(details,mats);root.add(details);
  const featureLabels=[];
  for(const b of plan.buildings){const pad=terrain.pads.find(p=>p.id===b.id),group=createBuilding(b,plan,mats);group.position.set(b.x-80,pad.level+.08,b.y-70);group.userData.roleName=roles[b.role];root.add(group);buildings.push(group);
    const poly=footprint(b).map(([x,z])=>[x-80,z-70]);g.extrude(poly,.16,pad.level-.05,'concrete',.03);
    if(review){const label=labelSprite(b.name,{size:b.role==='primary'?1.12:.8});label.position.set(b.x-80,pad.level+b.h+2.1,b.y-70);labels.add(label);featureLabels.push({id:b.id,label,role:b.role,anchor:label.position.clone(),bounds:new THREE.Box3().setFromObject(group)});}
  }
  // Explicit outdoor spaces: a garden court, a clear experiment apron, or loading / testing yards.
  for(const l of plan.landscape.filter(l=>['test','yard','green'].includes(l.kind))){
    const x=l.points.reduce((a,p)=>a+p[0],0)/l.points.length,z=l.points.reduce((a,p)=>a+p[1],0)/l.points.length;
    if(l.kind==='test'){
      // Ground-following apron tiles do not bury the raised test facilities.
      const xmin=Math.min(...l.points.map(p=>p[0])),xmax=Math.max(...l.points.map(p=>p[0])),zmin=Math.min(...l.points.map(p=>p[1])),zmax=Math.max(...l.points.map(p=>p[1]));
      for(let xx=xmin;xx<xmax;xx+=2)for(let zz=zmin;zz<zmax;zz+=2){if(plan.buildings.some(b=>Math.abs(xx+1-b.x)<b.w/2+1&&Math.abs(zz+1-b.y)<b.d/2+1))continue;terrain.ribbon([[xx+.02,zz+1],[xx+1.98,zz+1]],1.96,'concrete',.08);}
    }else if(l.kind==='green'){
      for(const dx of[-13,-6,6,13]){const y=terrain.height(x+dx,z);g.extrude(chamfer(x+dx-80,z-70,3,2,.5),.3,y,'white');g.extrude(chamfer(x+dx-80,z-70,2.7,1.7,.5),.2,y+.3,'green');}
    }
  }
  if(id==='Research_Lab'){
    const y=terrain.pads.find(p=>p.id==='main').level;
    const main=plan.buildings.find(b=>b.id==='main'),cx=main.x-80,cz=main.y-65;
    g.extrude(chamfer(cx,cz,11.5,7,.8),.12,y+.01,'walk');g.cylinder([cx,y+.35,cz],1.75,.5,'white');g.cylinder([cx,y+.62,cz],1.5,.08,'glass');g.sphere([cx,y+.75,cz],[.6,.25,.6],'teal');
    for(const x of[cx-4,cx+4]){g.box([x,y+.45,cz+2.7],[2,.25,.6],'trunk');g.box([x,y+.22,cz+2.7],[1.7,.4,.4],'white');}
    for(const [x,z]of [[66,108],[92,108],[62,80],[96,80]]){const y=terrain.height(x,z);g.cylinder([x-80,y+.22,z-70],1.1,.4,'white');tree(g,x-80,z-70,y+.4,1.8);}
    // A secondary north door links the institute to shared instruments across the garden.
    const corridorPaths=plan.previewWalkways;
    for(const pts of corridorPaths){terrain.ribbon(pts,1.3,'walk',.24);for(let i=1;i<pts.length;i++){
      const a=pts[i-1],b=pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);
      for(let t=0;t<len;t+=2){const step=Math.min(2,len-t),k=(t+step/2)/len,x=a[0]+(b[0]-a[0])*k,z=a[1]+(b[1]-a[1])*k,y=terrain.height(x,z);g.box([x-80,y+1.8,z-70],[step+.05,.13,1.7],'clearGlass',[0,angle,0]);for(const s of[-1,1])g.box([x-80+Math.sin(angle)*s*.82,y+1.8,z-70+Math.cos(angle)*s*.82],[step+.05,.12,.12],'white',[0,angle,0]);}
      for(let t=0;t<=len;t+=4){const k=t/len,x=a[0]+(b[0]-a[0])*k,z=a[1]+(b[1]-a[1])*k,y=terrain.height(x,z);g.cylinder([x-80,y+.9,z-70],.1,1.8,'white');}
    }}
  }
  // Physical plant connections use the approved dedicated process ports, not pedestrian doors.
  for(const flow of plan.routedFlows.filter(f=>['belt','production'].includes(f.kind))){for(const segment of flow.segments){const pts=segment.points;
    const ends=[plan.buildings.find(b=>b.id===segment.from),plan.buildings.find(b=>b.id===segment.to)];
    const connector=ends.map((b,i)=>{const point=pts[i?pts.length-1:0],dx=point[0]-b.x,dz=point[1]-b.y;return Math.abs(dx)/b.w>Math.abs(dz)/b.d?[b.x+Math.sign(dx)*b.w/2,point[1]]:[point[0],b.y+Math.sign(dz)*b.d/2];});
    const control=[connector[0],...pts,connector[1]],full=[];
    for(let i=1;i<control.length;i++){const a=control[i-1],b=control[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));for(let j=0;j<n;j++)full.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}full.push(control.at(-1));
    for(let i=1;i<full.length;i++){const a=full[i-1],b=full[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.2)continue;const v1=[a[0]-80,terrain.height(...a)+.9,a[1]-70],v2=[b[0]-80,terrain.height(...b)+.9,b[1]-70],nx=-(b[1]-a[1])/len*.48,nz=(b[0]-a[0])/len*.48;
      const angle=-Math.atan2(b[1]-a[1],b[0]-a[0]),pitch=Math.atan2(v2[1]-v1[1],len);g.box([(v1[0]+v2[0])/2,(v1[1]+v2[1])/2,(v1[2]+v2[2])/2],[Math.hypot(len,v2[1]-v1[1]),.16,.94],'dark',[0,angle,pitch]);g.box([(v1[0]+v2[0])/2,(v1[1]+v2[1])/2+.1,(v1[2]+v2[2])/2],[.16,.05,.9],'steel',[0,angle,pitch]);
      for(const s of[-1,1])g.beam([v1[0]+nx*s,v1[1]+.2,v1[2]+nz*s],[v2[0]+nx*s,v2[1]+.2,v2[2]+nz*s],.065,flow.kind==='belt'?'gold':'teal');
      if(i%2===0){const x=a[0],z=a[1],y=v1[1];g.cylinder([x-80,(terrain.height(x,z)+y)/2,z-70],.1,y-terrain.height(x,z),'ivory');if(flow.kind==='belt')g.sphere([x-80,y+.27,z-70],[.24,.23,.25],'ore');else g.box([x-80,y+.25,z-70],[.5,.3,.5],'white');}
    }
  }}
  // Dedicated overhead process corridors keep pipes and power/data trunks clear of traffic.
  for(const f of plan.routedFlows.filter(f=>['pipe','power','data'].includes(f.kind)))for(const s of f.segments){
    const a=plan.buildings.find(b=>b.id===s.from),b=plan.buildings.find(b=>b.id===s.to),pts=s.points.map(p=>[...p]);
    for(const [node,index,insert]of[[a,0,'unshift'],[b,pts.length-1,'push']]){if(!node)continue;const pt=s.points[index===0?0:s.points.length-1],dx=pt[0]-node.x,dz=pt[1]-node.y,port=Math.abs(dx)/node.w>Math.abs(dz)/node.d?[node.x+Math.sign(dx)*node.w/2,pt[1]]:[pt[0],node.y+Math.sign(dz)*node.d/2];pts[insert](port);}
    const path=pts.map(([x,z])=>[x-80,terrain.surfaceHeight(x,z)+3,z-70]);conduit(g,path,f.kind==='pipe'?.24:.14,f.kind==='pipe'?'gold':f.kind==='power'?'teal':'glass');
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=4;d<len;d+=7){const x=a[0]+(b[0]-a[0])*d/len,z=a[1]+(b[1]-a[1])*d/len,y=terrain.surfaceHeight(x,z);g.beam([x-80,y+.2,z-70],[x-80,y+2.9,z-70],.11,'ivory');g.box([x-80,y+2.75,z-70],[.8,.18,.65],'roof');}}
  }
  if(plan.space)for(const f of plan.routedFlows.filter(f=>f.kind==='production'))for(const s of f.segments)for(let i=1;i<s.points.length;i++){const a=s.points[i-1],b=s.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);if(len<.1)continue;for(let d=0;d<len;d+=2){const size=Math.min(2,len-d),t=(d+size/2)/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=terrain.surfaceHeight(x,z);g.box([x-80,y+1.7,z-70],[size,1.4,1.7],'clearGlass',[0,angle,0]);g.box([x-80,y+2.45,z-70],[.13,.13,1.9],'ivory',[0,angle,0]);}}
  for(const e of plan.entries){const x=e.x-80,z=e.y-70,y=terrain.height(e.x,e.y);for(const dx of[-2,2])g.cylinder([x+dx,y+.7,z],.13,1.4,'ivory');g.box([x,y+1.45,z],[4.4,.2,.35],'teal');}
  g.finish();
  // Flow overlays are a review aid, separate from the physical transport geometry.
  const flowColors={walk:0x216e69,freight:0x92551c,belt:0xc4891d,production:0x117a95,pipe:0xd39c32,power:0x34bcae,data:0x6bafd5};
  if(review)for(const f of plan.routedFlows){for(const s of f.segments){const pts=points3(s.points,terrain.height,.65),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:flowColors[f.kind]||0x216e69,depthTest:false,transparent:true,opacity:.85}));line.renderOrder=5;overlay.add(line);
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],len=a.distanceTo(b);if(len<4)continue;for(let t=4;t<len;t+=9){const v=a.clone().lerp(b,t/len),dir=b.clone().sub(a).normalize(),arrow=new THREE.ArrowHelper(dir,v,1.8,flowColors[f.kind]||0x216e69,1.1,.8);arrow.renderOrder=6;overlay.add(arrow);}}
  }}
  const movers=[];for(const f of plan.routedFlows.filter(f=>f.kind==='freight')){
    for(const s of f.segments.slice(0,3)){const path=points3(s.points,terrain.height,.19);if(path.length<2)continue;const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+path[i].distanceTo(path[i-1]));const length=lengths.at(-1);if(length<3)continue;const model=truck(mats,id==='Metal_Mine'?'ore':'cargo');dynamic.add(model);movers.push({model,path,lengths,length,phase:movers.length*19});}
  }
  const selection=new THREE.Group();root.add(selection);selection.visible=false;
  let selectedId=null;
  function select(b){selectedId=b?.id||null;selection.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});selection.clear();if(!b){selection.visible=false;return;}
    const poly=footprint(b).map(([x,z])=>[x,z]);poly.push(poly[0]);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points3(poly,terrain.height,.25)),new THREE.LineBasicMaterial({color:0xe5ac36,depthTest:false}));line.renderOrder=8;selection.add(line);selection.visible=true;
  }
  const actuators=buildings.flatMap(o=>o.userData.motion||[]);
  function update(time){for(const a of actuators){if(a.kind==='cut')a.object.rotation.x=-time*.7;else if(a.kind==='scan')a.object.rotation.y=time*.28;else if(a.kind==='lift')a.object.position.y=16+Math.sin(time*.3)*10;else a.object.rotation.y=Math.sin(time*.9+a.phase)*.4;}for(const m of movers){let d=(time*4+m.phase)%(m.length*2),reverse=d>m.length;if(reverse)d=m.length*2-d;let i=1;while(i<m.lengths.length-1&&m.lengths[i]<d)i++;const a=m.path[i-1],b=m.path[i],t=(d-m.lengths[i-1])/(m.lengths[i]-m.lengths[i-1]||1);m.model.position.copy(a).lerp(b,t);m.model.position.y=terrain.surfaceHeight(m.model.position.x+80,m.model.position.z+70)+.22;const dir=b.clone().sub(a).multiplyScalar(reverse?-1:1);m.model.rotation.y=Math.atan2(-dir.x,-dir.z);}}
  function updateLabels(camera,w,h){if(!labels.visible)return;const used=[],unit=(camera.top-camera.bottom)/(camera.zoom*h),width=w<500?151:171,height=width*96/512,priority=f=>f.id===selectedId?-1:f.role==='primary'?0:f.role==='specialist'?1:2;
    for(const f of [...featureLabels].sort((a,b)=>priority(a)-priority(b))){f.label.position.copy(f.anchor);if(selectedId&&f.id!==selectedId){f.label.visible=false;continue;}if(f.id===selectedId){let top=-Infinity;for(const x of[f.bounds.min.x,f.bounds.max.x])for(const y of[f.bounds.min.y,f.bounds.max.y])for(const z of[f.bounds.min.z,f.bounds.max.z])top=Math.max(top,new THREE.Vector3(x,y,z).project(camera).y);const v=f.anchor.clone().project(camera);v.y=top+(height+18)/h;f.label.position.copy(v.unproject(camera));}const v=f.label.position.clone().project(camera),x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h,r={left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};f.label.scale.set(width*unit,height*unit,1);f.label.visible=v.z>-1&&v.z<1&&r.left>8&&r.right<w-8&&r.top>112&&r.bottom<h-70&&!used.some(a=>r.left<a.right+8&&r.right>a.left-8&&r.top<a.bottom+5&&r.bottom>a.top-5);if(f.label.visible)used.push(r);}
  }
  function dispose(){const geos=new Set(),ms=new Set(Object.values(mats)),textures=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){ms.add(m);if(m.map)textures.add(m.map);}});for(const x of[...geos,...textures,...ms])x.dispose();}
  const metrics={conceptVersion:'compact-scifi-20261018',composition:plan.composition,buildings:buildings.length,scale:scalePair(plan),forms:buildings.map(o=>({id:o.name,form:o.userData.form,role:o.userData.building.role,dimensions:new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).toArray()})),validation:plan.validation,movingVehicles:movers.length,actuators:actuators.length};
  return {root,plan,buildings,labels,overlay,terrain,mats,movers,actuators,dynamic,update,updateLabels,select,dispose,metrics};
}
