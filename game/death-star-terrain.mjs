// All lengths are game units (Light_Fighter length = 1). No strategic state.
export const DEATH_STAR = Object.freeze({radius:10000,trenchWidth:120,trenchDepth:100,dishRadius:3100,dishDepth:1800,routeLength:2100,seed:19470525});
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,s)=>a.map(v=>v*s);
export const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
export const length=a=>Math.hypot(...a);
export const norm=a=>mul(a,1/(length(a)||1));
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const DISH_DIRECTION=norm([.31,.82,.48]);
export const DISH_EAST=norm(cross([0,0,1],DISH_DIRECTION));
export const DISH_NORTH=cross(DISH_DIRECTION,DISH_EAST);
export const DISH_RIM=Math.sqrt(DEATH_STAR.radius**2-DEATH_STAR.dishRadius**2);
export const bowlHeight=r=>DISH_RIM-DEATH_STAR.dishDepth+DEATH_STAR.dishDepth*(r/DEATH_STAR.dishRadius)**2;
export const surfacePoint=(a,b,r=DEATH_STAR.radius)=>[r*Math.cos(b)*Math.sin(a),r*Math.cos(b)*Math.cos(a),r*Math.sin(b)];
export const trenchPoint=(a,z=0,r=9900)=>[r*Math.sin(a),r*Math.cos(a),z];
export function dishPoint(r,a){return add(mul(DISH_DIRECTION,bowlHeight(r)),add(mul(DISH_EAST,r*Math.cos(a)),mul(DISH_NORTH,r*Math.sin(a))));}
export const emitterObstacles=Array.from({length:8},(_,i)=>({center:add(dishPoint(2300,(i+.5)*Math.PI/4),mul(DISH_DIRECTION,14)),axes:[DISH_EAST,DISH_NORTH,DISH_DIRECTION],half:[65,65,16]}));
export function turretObstacle(t){const radial=norm([t.pos[0],t.pos[1],0]);return {center:add(t.pos,mul(radial,t.hp>0?2:0)),axes:[[radial[1],-radial[0],0],radial,[0,0,1]],half:t.hp>0?[4,6,4]:[4,1,4]};}
export function solidDistance(p){
  const R=DEATH_STAR.radius,z=dot(p,DISH_DIRECTION),rho=length(sub(p,mul(DISH_DIRECTION,z)));
  // Conservative signed distances to the two removed volumes. The bowl's
  // gradient is bounded by 1.54; dividing avoids skipping a shallow impact.
  return Math.max(length(p)-R,Math.min(60-Math.abs(p[2]),Math.hypot(p[0],p[1])-9900),Math.min(3100-rho,(z-bowlHeight(rho))/1.54));
}
function roots(a,b,c){if(Math.abs(a)<1e-14)return Math.abs(b)<1e-14?[]:[-c/b];const d=b*b-4*a*c;if(d<0)return [];const s=Math.sqrt(d);return [(-b-s)/(2*a),(-b+s)/(2*a)];}
export function ellipsoidContact(a,b,center,half){const p=a.map((v,i)=>(v-center[i])/half[i]),v=b.map((n,i)=>(n-a[i])/half[i]),c=dot(p,p)-1;if(c<=0)return 0;const times=roots(dot(v,v),2*dot(p,v),c).filter(t=>t>=0&&t<=1);return times.length?Math.min(...times):null;}
function boxHit(a,b,box,pad){
  const local=p=>box.axes.map(axis=>dot(sub(p,box.center),axis)),x=local(a),v=sub(local(b),x);let lo=0,hi=1;
  for(let k=0;k<3;k++){const h=box.half[k]+pad;if(Math.abs(v[k])<1e-12){if(Math.abs(x[k])>h)return null;continue;}let t0=(-h-x[k])/v[k],t1=(h-x[k])/v[k];if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return null;}return lo;
}
export function segmentHit(a,b,padding=0,boxes=[]){
  const v=sub(b,a),dist=length(v);let best=null;
  // Swept sphere via a conservative distance field. Exact surface roots below
  // cover long unpadded laser segments, including grazing and exit/re-entry.
  if(padding>0){let t=0;for(let i=0;i<1024&&t<=1;i++){const d=solidDistance(add(a,mul(v,t)))-padding;if(d<.002){best=t;break;}if(dist<1e-12)break;t+=Math.max(.000001,d*.85)/dist;}}
  else {
    const az=dot(a,DISH_DIRECTION),vz=dot(v,DISH_DIRECTION),ar=sub(a,mul(DISH_DIRECTION,az)),vr=sub(v,mul(DISH_DIRECTION,vz)),k=1800/3100**2;
    const times=[0,1,...roots(dot(v,v),2*dot(a,v),dot(a,a)-10000**2),...roots(v[0]**2+v[1]**2,2*(a[0]*v[0]+a[1]*v[1]),a[0]**2+a[1]**2-9900**2),...roots(dot(vr,vr),2*dot(ar,vr),dot(ar,ar)-3100**2),...roots(k*dot(vr,vr),2*k*dot(ar,vr)-vz,DISH_RIM-1800+k*dot(ar,ar)-az)];
    if(Math.abs(v[2])>1e-12)times.push((60-a[2])/v[2],(-60-a[2])/v[2]);
    times.sort((a,b)=>a-b);
    for(const t of times)if(t>=0&&t<=1&&solidDistance(add(a,mul(v,Math.min(1,t+1e-7))))<=.0001){best=t;break;}
  }
  for(const box of [...emitterObstacles,...boxes]){const t=boxHit(a,b,box,padding);if(t!==null&&(best===null||t<best))best=t;}
  return best;
}
export function nearestContact(a,b,targets,hitTarget,boxes=[]){
  let fraction=segmentHit(a,b,0,boxes),target=null;
  for(const t of targets){const f=hitTarget(a,b,t);if(f!==null&&(fraction===null||f<fraction)){fraction=f;target=t;}}
  return fraction===null?null:{fraction,target,point:add(a,mul(sub(b,a),fraction))};
}
export function turretCanFire(t,p,boxes=[]){return t.hp>0&&length(sub(t.pos,p))<650&&segmentHit(t.pos,p,0,boxes)===null;}
export function createTurrets(){return [.045,.105,.165].flatMap((a,group)=>[-1,1].map((side,i)=>({terrainTurret:true,name:`壕沟炮台 ${group*2+i+1}`,code:'TRENCH / '+(group*2+i+1),kind:5,pos:trenchPoint(a,side*42,9912),angle:a,scale:1,hp:100,shield:0,maxShield:0,respawn:Infinity,velocity:[0,0,0],seed:group*2+i,heading:0,cooldown:1+group*.5+i*.3})));}
export function landmark(name){
  if(name==='overview')return {pos:[0,29000,9000],look:[0,0,0],overview:true};
  if(name==='surface')return {pos:surfacePoint(.05,.025,10012),look:surfacePoint(.06,.025,10012)};
  if(name==='dish'){const p=dishPoint(1800,0);return {pos:add(p,mul(DISH_DIRECTION,100)),look:dishPoint(1700,0)};}
  return {pos:trenchPoint(0,0,9950),look:trenchPoint(.01,0,9950)};
}

// Shared deterministic shell edges: matching parameter coordinates produce
// identical world vertices at all levels. Skirts seal mixed-resolution edges.
export function shellPatches(){
  const gap=Math.asin(60/10000),rows=12,cols=48,out=[];
  for(const side of [-1,1])for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const b0=gap+(Math.PI/2-gap)*y/rows,b1=gap+(Math.PI/2-gap)*(y+1)/rows;
    out.push({id:`${side}:${y}:${x}`,a0:x*2*Math.PI/cols,a1:(x+1)*2*Math.PI/cols,b0:side<0?-b1:b0,b1:side<0?-b0:b1});
  }return out;
}
export function patchGeometry(p,n){
  const origin=surfacePoint((p.a0+p.a1)/2,(p.b0+p.b1)/2),data=[];
  const vertex=(a,b,r=10000)=>{const world=surfacePoint(a,b,r);return [...sub(world,origin),...norm(world)];};
  const emit=(a,b,c)=>data.push(...a,...b,...c);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const a0=p.a0+(p.a1-p.a0)*i/n,a1=p.a0+(p.a1-p.a0)*(i+1)/n,b0=p.b0+(p.b1-p.b0)*j/n,b1=p.b0+(p.b1-p.b0)*(j+1)/n;
    const a=vertex(a0,b0),b=vertex(a1,b0),c=vertex(a1,b1),d=vertex(a0,b1);emit(a,b,c);emit(a,c,d);
  }
  for(let edge=0;edge<4;edge++)for(let i=0;i<n;i++){
    const uv=t=>edge<2?[p.a0+(p.a1-p.a0)*t,edge===0?p.b0:p.b1]:[edge===2?p.a0:p.a1,p.b0+(p.b1-p.b0)*t];
    const a=uv(i/n),b=uv((i+1)/n);emit(vertex(...a),vertex(...b),vertex(...a,9994));emit(vertex(...b),vertex(...b,9994),vertex(...a,9994));
  }
  return {origin,data:new Float32Array(data)};
}
export function detailLevel(p,eye,height,fov,previous=4){
  const center=surfacePoint((p.a0+p.a1)/2,(p.b0+p.b1)/2),distance=Math.max(5,length(sub(center,eye))-1000),pixels=1300*height/(2*Math.tan(fov/2)*distance);
  const thresholds=previous>=32?[105,380]:previous>=16?[105,480]:[140,480];
  return pixels>thresholds[1]?32:pixels>thresholds[0]?16:4;
}
export function localMachinery(eye){
  const out=[],r=Math.hypot(eye[0],eye[1]),a=Math.atan2(eye[0],eye[1]);
  // Dense detail is generated only around the observer. The same integer cell
  // always creates the same instance, irrespective of travel direction.
  if(Math.abs(eye[2])<95&&r>9850&&r<10100){
    const cell=Math.floor(a*9900/24);
    for(let i=cell-18;i<=cell+18;i++)for(const side of [-1,1]){
      const angle=(i+.5)*24/9900,radial=[Math.sin(angle),Math.cos(angle),0],tangent=[Math.cos(angle),-Math.sin(angle),0];
      const h=2+((i*17&31)/8),center=trenchPoint(angle,side*54,9900+h/2);
      out.push({id:`trench:${i}:${side}`,center,axes:[tangent,radial,[0,0,1]],half:[7,h/2,4],color:[.28,.31,.34]});
      if(i%4===0)out.push({id:`pipe:${i}:${side}`,center:trenchPoint(angle,side*58,9940),axes:[tangent,radial,[0,0,1]],half:[11,.8,.8],color:[.43,.45,.47]});
      if(i%11===0)out.push({id:`bay:${i}:${side}`,center:trenchPoint(angle,side*59,9920),axes:[tangent,radial,[0,0,1]],half:[9,8,.4],color:[.025,.035,.045]});
    }
  }else if(Math.abs(length(eye)-10000)<200){
    const u=Math.floor(a*10000/24),b=Math.asin(eye[2]/length(eye)),v=Math.floor(b*10000/24);
    for(let x=u-12;x<=u+12;x++)for(let y=v-12;y<=v+12;y++){
      const aa=(x+.5)*24/10000,bb=(y+.5)*24/10000,normal=norm(surfacePoint(aa,bb));if(Math.abs(normal[2]*10000)<65||dot(normal,DISH_DIRECTION)>DISH_RIM/10000)continue;
      const h=1+((x*13+y*7)&7),tangent=[Math.cos(aa),-Math.sin(aa),0];
      out.push({id:`shell:${x}:${y}`,center:mul(normal,10000+h/2),axes:[tangent,normal,norm(cross(tangent,normal))],half:[3+(x&3),h/2,3+(y&3)],color:[.27+.015*(y&7),.30+.015*(y&7),.33+.015*(y&7)]});
    }
  }return out;
}
