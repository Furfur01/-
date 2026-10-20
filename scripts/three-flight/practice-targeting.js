// Practice targets must use this same pose for drawing, aiming and collision.
export function practiceTargetMatrix(M,target){
 return M.compose(target.pos,[.035,target.heading??.2,-.045],[target.scale,target.scale,target.scale]);
}
export function practiceTargetCenter(M,target,layout){
 return M.transform(practiceTargetMatrix(M,target),layout.bounds.center);
}

// Constant-velocity interception, in world units/second. Beams have no flight time.
export function interceptPoint(origin,position,velocity,speed){
 if(!Number.isFinite(speed))return [...position];
 const r=position.map((v,i)=>v-origin[i]),dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
 const a=dot(velocity,velocity)-speed*speed,b=2*dot(r,velocity),c=dot(r,r),disc=b*b-4*a*c;
 const roots=Math.abs(a)<1e-8?(b<0?[-c/b]:[]):disc>=0?[(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)]:[];
 const times=roots.filter(t=>t>=0),time=times.length?Math.min(...times):0;
 return position.map((v,i)=>v+velocity[i]*time);
}

export function practiceTargetHit(M,start,end,target,layout,previousPosition=target.pos){
 if(target.hp<=0)return null;
 const matrix=practiceTargetMatrix(M,target),scale2=target.scale*target.scale,{center,half}=layout.bounds;
 const local=(point,pos)=>[0,4,8].map((j,i)=>(point.reduce((sum,v,k)=>sum+(v-pos[k])*matrix[j+k],0)/scale2-center[i])/half[i]);
 const p=local(start,previousPosition),q=local(end,target.pos),d=q.map((v,i)=>v-p[i]);
 const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),a=dot(d,d),b=2*dot(p,d),c=dot(p,p)-1;
 if(c<=0)return 0;if(a<1e-12)return null;
 const disc=b*b-4*a*c;if(disc<0)return null;
 const time=(-b-Math.sqrt(disc))/(2*a);return time>=0&&time<=1?time:null;
}
