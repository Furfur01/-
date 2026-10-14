// Sculpted basalt volcanoes for the metal world. All geometry is built once;
// animation changes instance matrices only and has no connection to production.
function auroraVolcanoAngle(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function auroraVolcanoRadius(v,a){
 return v.radius*(1+.074*Math.sin(a*3+v.phase)+.049*Math.sin(a*7-v.phase*.7)+.023*Math.sin(a*11+1.2));
}
function auroraVolcanoFlowAngle(v,arm,u){
 return arm*TAU/8+v.phase*.29+.043*Math.sin(u*8+arm*1.7)+.035*Math.sin(u*17+arm);
}
function auroraVolcanoPoint(v,u,a,lift=0){
 // The low spreading apron blends into actual terrain. Eroded shoulders have
 // a different radius in each direction; no cylinder, annular base or cone.
 const rr=auroraVolcanoRadius(v,a)*u,off=(1-u)*.10*v.radius;
 const x=Math.cos(a)*rr*1.035+off,z=Math.sin(a)*rr*.965-off*.42;
 const profile=[[0,.75],[.09,.75],[.145,.78],[.225,1],[.30,.89],[.40,.66],[.53,.43],[.68,.21],[.83,.075],[1,0]];
 let h=0;
 for(let k=0;k<profile.length-1;k++)if(u>=profile[k][0]&&u<=profile[k+1][0]){
  const [a0,h0]=profile[k],[a1,h1]=profile[k+1];h=mix(h0,h1,(u-a0)/(a1-a0));break;
 }
 const ridge=(Math.sin(a*8+u*1.4+v.phase)*.5+.5);
 const erosion=(.020*Math.sin(a*19+u*27)+.024*Math.sin(a*11-u*19+v.phase)) * Math.sin(PI*u);
 const broken=Math.max(0,1-Math.abs(auroraVolcanoAngle(a-v.phase*.29-.07))/.30)*.16+
  Math.max(0,1-Math.abs(auroraVolcanoAngle(a-v.phase*.29-2.39))/.20)*.095;
 h+=Math.sin(PI*u)*(.080*ridge+.032*Math.sin(a*5+v.phase)+erosion);
 h-=Math.max(0,1-Math.abs(u-.225)/.16)*(broken+.030*(.5+.5*Math.sin(a*13+v.phase)));
 let groove=0;
 for(let arm=0;arm<8;arm++)groove=Math.max(groove,Math.max(0,1-Math.abs(auroraVolcanoAngle(a-auroraVolcanoFlowAngle(v,arm,u)))/(.043+.022*u)));
 h-=groove*.030*Math.sin(PI*u);
 const base=u>.57?auroraBiomeSurfaceOffset(v.m,x,z):0;
 const top=v.height*h+base*smooth(.57,1,u)-.045*smooth(.88,1,u);
 return [x,top+lift,z];
}
function auroraVolcanoRibbon(a,v,start,end,angle,width){
 const steps=Math.ceil((end-start)*92),bands=[{width:1.70,c:hex('5c180a'),lift:.012,e:.08},{width:1.05,c:hex('e23e0b'),lift:.025,e:.78},{width:.66,c:hex('ff7d13'),lift:.038,e:1.0},{width:.24,c:hex('ffda61'),lift:.049,e:1.0}];
 for(const band of bands)for(let k=0;k<steps;k++){
  const at=(j,side)=>{const u=mix(start,end,j/steps),ang=angle(u),w=width*(.83+.17*Math.sin(u*29+v.phase))*band.width;
   return auroraVolcanoPoint(v,u,ang+side*w/Math.max(.15,u*v.radius),band.lift);};
  quad(a,at(k,-1),at(k,1),at(k+1,1),at(k+1,-1),band.c,band.e,2);
 }
}
function auroraVolcanoMountain(v){
 const a=[],segments=80,rings=36,footings=[],rim=[];
 const grid=Array.from({length:rings+1},(_,j)=>Array.from({length:segments+1},(_,k)=>auroraVolcanoPoint(v,j/rings,k/segments*TAU)));
 for(let j=0;j<rings;j++)for(let k=0;k<segments;k++){
  const u=j/rings,w=(j+1)/rings,angle=k/segments*TAU,next=(k+1)/segments*TAU;
  const p=grid[j][k],q=grid[j+1][k],r=grid[j+1][k+1],s=grid[j][k+1];
  const grain=.5+.5*hash(k,j,Math.round(v.phase*19)),ridge=.5+.5*Math.sin(angle*8+w*1.4+v.phase);
  let color=vlerp(hex('171419'),hex('6c5a55'),.23+grain*.19+ridge*.30);
  if(u<.19)color=vlerp(hex('562316'),hex('98300c'),grain*.35);
  else if(u<.34)color=vlerp(color,hex('76311c'),(.5+.5*Math.sin(angle*9+v.phase))*.24);
  quad(a,p,s,r,q,color,u<.19?.16:0);
  if(j===rings-1)footings.push(pt(v.m,q));
 }
 // A small ragged molten throat, well below the broken rim. It never becomes
 // a flat glowing cap, and the inner wall retains an appreciable dark depth.
 const throat=[];
 for(let i=0;i<40;i++){
  const aa=i/40*TAU,bb=(i+1)/40*TAU;
  const center=auroraVolcanoPoint(v,0,0,.015),p=auroraVolcanoPoint(v,.13+.009*Math.sin(aa*7),aa,.022),q=auroraVolcanoPoint(v,.13+.009*Math.sin(bb*7),bb,.022);
  tri(a,center,q,p,i%4?hex('ff780c'):hex('ffb62c'),.96,2);
  throat.push(p);
 }
 for(let arm=0;arm<8;arm++){
  const end=arm%3===0?.995:.88+(arm%3)*.035,width=.059+(arm%3)*.010;
  auroraVolcanoRibbon(a,v,.125,end,u=>auroraVolcanoFlowAngle(v,arm,u),width);
  if(arm%2===0){const sign=arm%4===0?1:-1,start=.49+(arm%3)*.055;
   auroraVolcanoRibbon(a,v,start,.94,u=>auroraVolcanoFlowAngle(v,arm,u)+sign*Math.pow((u-start)/(.94-start),.85)*(.17+arm*.009),width*.55);
  }
 }
 // Individual basalt spurs and angular cooled bombs break the smooth radial
 // silhouette. Large fragments sit only on the broad low outer shoulders.
 const rock=spheregeo(5,3);
 for(let k=0;k<48;k++){
  const u=.59+(k%7)*.055,ang=k*GOLDEN+v.phase,p=auroraVolcanoPoint(v,u,ang,.006),sz=.060+(k%5)*.018;
  append(a,rock,trs([p[0],p[1]+sz*.30,p[2]],[.26,k*.7,.14],[sz,sz*(.64+k%3*.15),sz*.78]),hex(k%3?'302d32':'4c4441'));
 }
 v.footings=footings;v.throat=throat;v.lavaArms=8;v.lavaBranches=4;
 return a;
}
function auroraVolcanoSmokeGeometry(color,lit=false){
 const a=[],lumps=[[0,0,0,.73],[.44,.05,.08,.53],[-.42,.09,-.07,.58],[.09,.40,.06,.55],[-.03,-.33,.09,.49],[.12,.11,.43,.48],[-.13,.10,-.44,.48],[.35,.37,-.17,.33],[-.32,.38,.23,.35]];
 for(let k=0;k<lumps.length;k++){
  const [x,y,z,r]=lumps[k],c=lit?vlerp(hex('823921'),color,clamp(y*.65+.50,0,1)):vlerp(color,hex('75635a'),(y+.4)*.11);
  append(a,spheregeo(10,7),trs([x,y,z],[0,k*.83,0],[r,r*(.85+(k%3)*.1),r]),c,lit?.10:0);
 }
 return a;
}
function auroraVolcanoBuild(dec){
 const candidates=[],chosen=[];
 // Multiple size tiers avoid a row of matching cones. Dense sampling picks
 // the widest dry gaps between the real building and road clearances.
 for(let i=0;i<980;i++){
  const y=1-2*(i+.5)/980,t=i*GOLDEN+.57,n=[Math.sqrt(1-y*y)*Math.cos(t),y,Math.sqrt(1-y*y)*Math.sin(t)];
  const fault=typeof auroraBiomeFaultDistance==='function'?auroraBiomeFaultDistance(n):auroraCoastDistance(n);
  if(fault<1.12||terrain(n)<.12||auroraBiomeWorkBlend(n).blend>.005)continue;
  const clearance=Math.min(...districts.map(d=>Math.acos(clamp(dot(n,d.n),-1,1))*R-(d.resource?4.2:2.9)));
  if(clearance<2.3)continue;
  candidates.push({i,n,fault,clearance,score:clearance+fault*.11+Math.sin(i*1.11)*.12});
 }
 candidates.sort((a,b)=>b.score-a.score);
 const place=(candidate,desiredRadius,desiredHeight,minRadius)=>{
  const {i,n,clearance}=candidate;
  if(chosen.some(v=>dot(n,v.n)>.87))return false;
  const index=chosen.length,m=frame(n,ground(n,0));
  let radius=Math.min(clearance/1.32,desiredRadius),clear=false;
  // Test a full footprint, including its interior; the skirt can never cut
  // through an occupied fixed foundation or hang across a deep fault.
  for(;radius>=minRadius;radius-=.10){
   clear=true;
   for(let ring=0;ring<=4&&clear;ring++)for(let k=0;k<48;k++){
    const th=k/48*TAU,r=radius*1.28*ring/4,p=norm(pt(m,[Math.cos(th)*r,0,Math.sin(th)*r]));
    if(auroraBiomeWorkBlend(p).blend>.025||terrain(p)<-.3){clear=false;break;}
   }
   if(clear)break;
  }
  if(!clear)return false;
  const height=desiredHeight*radius/desiredRadius,v={n,m,height,radius,phase:(i*.731)%TAU,index};
  append(dec,auroraVolcanoMountain(v),m);chosen.push(v);return true;
 };
 // Reserve the widest real opening for one dominant mountain. If that exact
 // footprint cannot fit, secondary sizes are chosen without crossing roads.
 for(const c of candidates)if(place(c,3.12,3.78,2.79))break;
 for(const candidate of candidates){
  if(chosen.length>=6)break;
  const index=chosen.length;
  place(candidate,index%3===0?2.46:index%3===1?2.16:1.89,index%3===0?2.85:index%3===1?2.35:1.86,1.79);
 }
 const ember=[];append(ember,spheregeo(6,4),ident(),hex('ffb039'),1.4);
 auroraBiomeEffects.volcanoes=chosen;
 auroraBiomeEffects.lavaParticle=upload(ember);
 auroraBiomeEffects.ashParticle=upload(auroraVolcanoSmokeGeometry(hex('4b4242')));
 auroraBiomeEffects.hotAshParticle=upload(auroraVolcanoSmokeGeometry(hex('573b30'),true));
 auroraBiomeEffects.stats.volcanoes=chosen.length;
 auroraBiomeEffects.stats.volcanoLavaBranches=chosen.length*12;
 auroraBiomeEffects.stats.volcanoStyle='eroded-basalt-massifs';
}
function auroraVolcanoDraw(time,shadow){
 if(shadow)return;
 for(const v of auroraBiomeEffects.volcanoes){
  for(let i=0;i<11;i++){
   const p=((time*.24+i/11+v.phase)%1+1)%1,angle=i*GOLDEN+v.phase,reach=(.29+(i%4)*.17)*p,rise=(3.5+(i%3)*.28)*p*(1-p),size=.025+.022*(1-p);
   draw(auroraBiomeEffects.lavaParticle,mm(v.m,trs([Math.cos(angle)*reach+v.radius*.1,v.height*.79+rise,Math.sin(angle)*reach-v.radius*.042],[p*5,angle,p],[size,size*(1.35+Math.sin(p*PI)),size])),smooth(0,.08,p)*(1-smooth(.86,1,p)));
  }
 }
 gl.depthMask(false);
 for(const v of auroraBiomeEffects.volcanoes){
  // A coherent dense chimney grows into distinct cauliflower lobes. The
  // warm root is lit by the vent; charcoal upper puffs expand and disperse.
  for(let i=6;i>=0;i--){
   const p=((time*.060+i/7+v.phase*.17)%1+1)%1,size=.29+p*.72,head=smooth(.45,.92,p),drift=p*p*1.02;
   const x=v.radius*.10+drift+(.065+head*.24)*Math.sin(p*9+v.phase),y=v.height*.88+.18+p*3.1-head*.30,z=-v.radius*.042+p*.26+(.052+head*.18)*Math.sin(p*13+v.phase);
   const opacity=smooth(0,.07,p)*(1-smooth(.79,1,p))*.82;
   draw(p<.20?auroraBiomeEffects.hotAshParticle:auroraBiomeEffects.ashParticle,mm(v.m,trs([x,y,z],[p*.13,v.phase+p*.40,p*.08],[size*(1+head*.82),size*(1.03-head*.36),size*(.91+head*.49)])),opacity);
  }
 }
 gl.depthMask(true);
}
