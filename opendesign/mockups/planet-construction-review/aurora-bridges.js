// A few bank-to-bank viaducts make the fractured plates read as a connected
// colony. These are scenery; mining actors keep their existing local routes.
function auroraBiomeTransportBridges(dec){
 if(!['mercury','mars'].includes(auroraBiome))return;
 const candidates=[],seen=new Set(),accepted=[];
 for(const d of districts){
  const neighbors=districts.filter(q=>q!==d).sort((a,b)=>dot(d.n,b.n)-dot(d.n,a.n)).slice(0,4);
  for(const q of neighbors){const key=[d.i,q.i].sort((a,b)=>a-b).join(':');if(seen.has(key))continue;seen.add(key);candidates.push({d,q,key,distance:Math.acos(clamp(dot(d.n,q.n),-1,1))*R});}
 }
 candidates.sort((a,b)=>a.distance-b.distance);
 const bank=n=>terrain(n)>.40&&auroraBiomeWorkBlend(n).blend<.08;
 for(const {d,q,key} of candidates){
  const samples=Array.from({length:81},(_,i)=>{const t=i/80,n=norm(vlerp(d.n,q.n,t));return {t,n,h:terrain(n)};});
  const depth=auroraBiome==='mars'?-1.1:-.23;
  const gaps=samples.map((p,i)=>({p,i})).filter(({p})=>p.t>.17&&p.t<.83&&p.h<depth);
  if(!gaps.length)continue;
  const first=gaps[0].i,last=gaps.at(-1).i;
  let left=first,right=last;
  while(left>0&&!bank(samples[left].n))left--;
  while(right<80&&!bank(samples[right].n))right++;
  if(left<10||right>70||!bank(samples[left].n)||!bank(samples[right].n))continue;
  const a=samples[left],b=samples[right],angle=Math.acos(clamp(dot(a.n,b.n),-1,1)),length=angle*R;
  if(length<1.1||length>7.8)continue;
  const middle=norm(add(a.n,b.n));if(accepted.some(p=>dot(p,middle)>.98))continue;
  const points=Array.from({length:33},(_,i)=>{const t=i/32,n=norm(vlerp(a.n,b.n,t)),height=mix(a.h,b.h,t)+.09+Math.sin(t*PI)*.25;return {n,p:mul(n,R+height),height};});
  if(points.some(p=>p.height-terrain(p.n)<.055))continue;
  const tangent=norm(sub(points.at(-1).p,points[0].p)),width=.43;
  for(let i=0;i<points.length-1;i++){
   const p=points[i],q=points[i+1],side=mul(norm(cross(p.n,tangent)),width/2),nextSide=mul(norm(cross(q.n,tangent)),width/2);
   const l=add(p.p,side),r=sub(p.p,side),nl=add(q.p,nextSide),nr=sub(q.p,nextSide);
   quad(dec,l,nl,nr,r,C.roof);
   for(const sign of[-1,1]){
    const edge=add(p.p,mul(side,sign)),next=add(q.p,mul(nextSide,sign));
    const under=sub(edge,mul(p.n,.22)),nextUnder=sub(next,mul(q.n,.22));
    quad(dec,edge,under,nextUnder,next,C.dark);
    beam(dec,add(edge,mul(p.n,.09)),add(next,mul(q.n,.09)),.023,C.ivory,5);
    if(i%4===0){beam(dec,edge,add(next,mul(q.n,-.22)),.018,C.base,5);beam(dec,under,add(next,mul(q.n,.0)),.018,C.base,5);}
   }
   if(i%3!==2)beam(dec,p.p,q.p,.027,C.teal,5,.65);
  }
  // Flush end shoes connect to the actual rock rather than floating over it.
  for(const end of[points[0],points.at(-1)]){
   const footing=mul(end.n,R+terrain(end.n)-.045),m=frame(end.n,footing),shoe=[];
   box(shoe,[0,.065,0],[.60,.14,.45],C.base);append(dec,shoe,m);
  }
  accepted.push(middle);if(accepted.length===8)break;
 }
 auroraBiomeEffects.stats.bridges=accepted.length;
}
