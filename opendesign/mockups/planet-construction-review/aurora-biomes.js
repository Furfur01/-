// Environment hooks for the shared AURORA renderer. Geometry remains native
// WebGL, deterministic, and independent of the economy or save format.
const auroraBiomeAlias={moon:'moon',earth:'terrestrial',terrestrial:'terrestrial',metal:'mercury',mercury:'mercury',mars:'mars',gas:'gas',jupiter:'gas'};
const auroraBiomeRequested=(typeof options!=='undefined'?options.biome:window.__AURORA_CONFIG?.biome)||'terrestrial';
const auroraBiome=auroraBiomeAlias[auroraBiomeRequested]||'terrestrial';
const auroraBiomeInfo={moon:{name:'月球',features:['陨石坑','灰色高地']},
 terrestrial:{name:'类地行星',features:['连续大陆','海洋与森林']},
 mercury:{name:'熔岩金属星',features:['熔岩大陆边界','活火山与喷发']},
 mars:{name:'裂谷火星',features:['赤色断裂高原','发光晶体峡谷']},
 gas:{name:'木星型气态行星',features:['多层差速云带','巨型旋转风暴','浮空建设平台']}
}[auroraBiome];
const auroraBiomeEffects={volcanoes:[],cloudLayers:[],storms:[],lavaParticle:null,ashParticle:null,riftGlow:null,stats:{}};
if(auroraBiome==='mercury'){C.base=hex('55515c');C.roof=hex('414451');C.ivory=hex('d8dad0');}
if(auroraBiome==='mars'){C.base=hex('71635d');C.roof=hex('4d5261');C.ivory=hex('e3d4b7');}
if(auroraBiome==='gas'){C.base=hex('465369');C.roof=hex('3c5069');C.ivory=hex('e7e3d1');}

function auroraBiomeWorkBlend(n){
 let strongest=0,target=0,weight=0;
 for(const d of districts){
  if(dot(n,d.n)<.78)continue;
  const [x,z]=auroraDistrictLocal(n,d),blend=auroraWorkMask(d,x,z);
  if(blend<=0)continue;
  const co=dot(n,d.n);target+=((R+PAD)/co-R)*blend;weight+=blend;strongest=Math.max(strongest,blend);
 }
 return {blend:strongest,target:weight?target/weight:0};
}

// Seventeen irregular crustal plates, wholly independent of the construction
// districts. Distance to their continuous boundaries creates a connected
// network of long gorges rather than isolated circles or a few painted lines.
const auroraBiomePlates=Array.from({length:17},(_,i)=>{const y=1-2*(i+.5)/17,t=i*GOLDEN+1.24,rr=Math.sqrt(1-y*y);return norm([Math.cos(t)*rr+.075*Math.sin(i*1.7),y+.04*Math.cos(i*2.8),Math.sin(t)*rr]);});
const auroraBiomeLavaLevel=-1.48;
function auroraBiomeFault(n){
 const warp=[noise(n[0]*4.1+9,n[1]*4.1,n[2]*4.1),noise(n[0]*4.1,n[1]*4.1+15,n[2]*4.1),noise(n[0]*4.1,n[1]*4.1,n[2]*4.1-8)];
 const p=norm(add(n,mul(warp,.078)));let first=-Infinity,second=-Infinity,near=0,next=1;
 for(let i=0;i<auroraBiomePlates.length;i++){const value=dot(p,auroraBiomePlates[i]);if(value>first){second=first;next=near;first=value;near=i;}else if(value>second){second=value;next=i;}}
 const edgeNormalLength=len(sub(auroraBiomePlates[near],auroraBiomePlates[next]));
 return {distance:Math.asin(clamp((first-second)/edgeNormalLength,0,1))*R,plate:near};
}
function auroraBiomeFaultDistance(n){return auroraBiomeFault(n).distance;}
function auroraBiomeRiftDistance(n){return auroraBiomeFaultDistance(n);}

function auroraBiomeTerrain(n){
 if(auroraBiome==='moon')return auroraMoonHeight(n);
 if(auroraBiome==='terrestrial')return null;
 const work=auroraBiomeWorkBlend(n);
 if(auroraBiome==='gas'){
  // A virtual contact surface supports actors, while the visible atmosphere
  // below is drawn separately. No terrain columns connect floating hulls.
  for(const d of districts){const co=dot(n,d.n);if(co<.78)continue;
   const [x,z]=auroraDistrictLocal(n,d);
   if(auroraBiomePlatformContains(d,x,z))return (R+PAD)/co-R;
  }
  return -1.65;
 }
 let h;
 if(auroraBiome==='mercury'){
  const fault=auroraBiomeFaultDistance(n)/1.55,plateau=.60+fbm(n,5.5)*.19+Math.max(0,fbm(n,18))*.11;
  // Broad molten channels divide basalt plates, with stepped cliff banks.
  // Work-site blending below keeps existing owned construction pads stable.
  h=-2.10+.12*fbm(n,17);
  h=mix(h,-1.91,smooth(.23,.31,fault));
  h=mix(h,-.47,smooth(.32,.53,fault));
  h=mix(h,-.37,smooth(.57,.66,fault));
  h=mix(h,plateau,smooth(.67,.86,fault));
 }else{
  const fault=auroraBiomeRiftDistance(n),plateau=.63+fbm(n,4.3)*.22+Math.max(0,fbm(n,18))*.12;
  // A broad floor and two narrow erosion shelves divide ~4-world-unit walls.
  h=-3.32+fbm(n,15)*.15;
  h=mix(h,-2.86,smooth(.34,.51,fault));
  h=mix(h,-1.74,smooth(.53,.77,fault));
  h=mix(h,-1.65,smooth(.80,.91,fault));
  h=mix(h,-.38,smooth(.94,1.16,fault));
  h=mix(h,plateau,smooth(1.19,1.36,fault));
 }
 return mix(h,work.target,work.blend);
}

const auroraBiomeResourceHull=[[-3.5,-2.78],[-2.5,-3.16],[-.12,-3.08],[1.15,-2.28],[2.63,-1.63],[2.98,.78],[2.45,2.10],[.93,2.45],[-1.32,2.31],[-2.80,1.53],[-3.49,.34]];
function auroraBiomePlatformOutline(d){
 return d.resource?auroraBiomeResourceHull:[[-1.90,-.90],[-1.15,-1.63],[1.12,-1.63],[1.89,-.9],[1.89,.87],[1.12,1.62],[-1.15,1.62],[-1.9,.88]];
}
function auroraBiomePlatformContains(d,x,z){
 const p=auroraBiomePlatformOutline(d);let inside=false;
 for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside;
 return inside;
}

function auroraBiomeColor(n,h){
 if(auroraBiome==='gas'){
  const wave=n[1]*23+.65*Math.sin(Math.atan2(n[2],n[0])*4+n[1]*10)+fbm(n,16)*.42;
  const stripe=.5+.5*Math.sin(wave),wisps=.5+.5*fbm(n,29);
  const c=vlerp(hex('94563f'),hex('eeddb4'),smooth(.18,.78,stripe));
  return vlerp(c,hex('cb9b71'),wisps*.26);
 }
 if(auroraBiome==='mercury'){
  const fault=auroraBiomeFaultDistance(n),grain=fbm(n,25);
  let c=vlerp(hex('171a20'),hex('414247'),clamp(.46+fbm(n,8)*.55,0,1));
  if(h<.35){const layer=.5+.5*Math.sin(h*17+grain*.65);c=vlerp(hex('241c22'),hex('4b3430'),layer*.60);c=vlerp(c,hex('ab3419'),(1-smooth(.18,.75,fault))*.22);}
  return c.map(v=>v*(.94+grain*.12));
 }
 const fault=auroraBiomeRiftDistance(n),grain=fbm(n,16);
 let c=vlerp(hex('b1482c'),hex('df8952'),clamp(.48+grain*.65,0,1));
 if(h<.26){const layer=.5+.5*Math.sin(h*15.7+grain*.55);c=vlerp(hex('452f49'),hex('9b523d'),smooth(-3.0,.20,h));c=vlerp(c,hex('d18255'),layer*.19);}
 if(fault<.34)c=vlerp(c,hex('252c46'),.46);
 return c;
}

function auroraBiomeSurfaceVertex(dst,n,h,c,type=0,emit=0){pushv(dst,mul(n,R+h),n,c,emit,type);}
function auroraBiomeCreatePlanet(){
 if(auroraBiome==='moon')return auroraMoonCreate();
 if(auroraBiome==='terrestrial')return null;
 const earth=[],sea=[],dec=[],lat=auroraBiome==='gas'?144:192,lon=lat*2,rows=[];
 for(let j=0;j<=lat;j++){const row=[];for(let i=0;i<=lon;i++){
  const ph=j/lat*PI,th=i/lon*TAU,n=[Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)];
  const h=auroraBiome==='gas'?-1.65:terrain(n);row.push({n,h});
 }rows.push(row);}
 const triangle=(p,q,r)=>{
  const n=norm(add(add(p.n,q.n),r.n)),h=(p.h+q.h+r.h)/3,c=auroraBiomeColor(n,h);
  if(auroraBiome==='gas')for(const v of [p,r,q])auroraBiomeSurfaceVertex(earth,v.n,v.h,c,3);
  else tri(earth,mul(p.n,R+p.h),mul(r.n,R+r.h),mul(q.n,R+q.h),c);
  if(auroraBiome==='mercury'&&Math.min(p.h,q.h,r.h)<auroraBiomeLavaLevel){
   const heat=.5+.5*noise(n[0]*20,n[1]*20,n[2]*20),lava=vlerp(hex('eb3d0c'),hex('ffbc3a'),heat*.7);
   for(const v of [p,r,q])auroraBiomeSurfaceVertex(sea,v.n,auroraBiomeLavaLevel,lava,2,1.0);
  }
 };
 for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){const p=rows[j][i],q=rows[j+1][i],r=rows[j+1][i+1],s=rows[j][i+1];triangle(p,q,r);triangle(p,r,s);}
 terrainGeo=upload(earth);oceanGeo=upload(sea);cloudGeo=upload([]);
 if(auroraBiome==='mercury')auroraBiomeCreateVolcanoes(dec);
 if(auroraBiome==='mars')auroraBiomeCreateRifts(dec);
 if(auroraBiome==='gas')auroraBiomeCreateCloudLayers();
 // Geological chips give dry worlds scale without importing terrestrial trees.
 if(auroraBiome!=='gas')for(let k=0;k<300;k++){
  const y=1-2*(k+.5)/300,t=k*GOLDEN+.74,n=[Math.sqrt(1-y*y)*Math.cos(t),y,Math.sqrt(1-y*y)*Math.sin(t)],h=terrain(n);
  if(h<.05||auroraBiomeWorkBlend(n).blend>.08)continue;
  const rock=[],size=.16+(.5+.5*hash(k,7,2))*.27;
  append(rock,spheregeo(5,3),trs([0,.06,0],[.17,k*.81,.13],[size,size*.68,size*.87]),auroraBiome==='mars'?hex('c48560'):hex('66616e'));
  append(dec,rock,frame(n,ground(n,-.025)));
 }
 auroraBiomeEffects.stats.terrainVertices=earth.length/STRIDE;
 if(typeof auroraBiomeTransportBridges==='function')auroraBiomeTransportBridges(dec);
 return dec;
}

function auroraBiomeSurfaceOffset(m,x,z){
 const base=Math.hypot(m[12],m[13],m[14]);let h=0;
 for(let i=0;i<12;i++){const radius=R+terrain(norm(pt(m,[x,h,z]))),next=Math.sqrt(Math.max(0,radius*radius-x*x-z*z))-base;if(Math.abs(h-next)<.00001)return next;h=next;}
 return h;
}
function auroraBiomeCreateVolcanoes(dec){auroraVolcanoBuild(dec);}

function auroraBiomeRiftCrystal(a,p,h,r,purple=false,rotation=[0,0,0]){
 const g=[],root=hex(purple?'211a46':'102445'),body=hex(purple?'644091':'2867a4'),tip=hex(purple?'ad91dc':'63bed9'),point=hex(purple?'d3c0ec':'b3e5ee');
 crystal(g,p,h,r,body,rotation);
 for(let k=0;k<g.length;k+=STRIDE){
  const f=clamp((g[k+1]-p[1])/h,0,1),facet=.66+.34*clamp((g[k+3]*-.7+g[k+5]*.72+1)*.5,0,1);
  let color=vlerp(root,body,smooth(.02,.65,f));color=vlerp(color,tip,smooth(.62,.93,f));color=vlerp(color,point,smooth(.94,1,f)*.72);
  for(let c=0;c<3;c++)g[k+6+c]=color[c]*facet;
  g[k+9]=.025+smooth(.65,.90,f)*.085+smooth(.91,1,f)*.24;g[k+10]=4;
 }
 append(a,g,ident());
}
function auroraBiomeVisibleGround(n){
 // The canyon is a faceted 192 × 384 mesh. Intersect its actual triangle so
 // crystals cannot float over a steep facet between analytic height samples.
 const lat=192,lon=384,ph=Math.acos(clamp(n[1],-1,1))/PI*lat,th=((Math.atan2(n[2],n[0])+TAU)%TAU)/TAU*lon;
 const j=Math.min(lat-1,Math.floor(ph)),i=Math.floor(th),u=th-i,v=ph-j;
 const vertex=(jj,ii)=>{const p=jj/lat*PI,t=ii/lon*TAU,nn=[Math.sin(p)*Math.cos(t),Math.cos(p),Math.sin(p)*Math.sin(t)];return ground(nn);};
 const p=vertex(j,i),q=v>=u?vertex(j+1,i):vertex(j+1,i+1),r=v>=u?vertex(j+1,i+1):vertex(j,i+1),normal=cross(sub(q,p),sub(r,p)),denominator=dot(normal,n);
 return Math.abs(denominator)<1e-8?ground(n):mul(n,dot(normal,p)/denominator);
}
function auroraBiomeRiftAnchor(n,r,floor){
 const surface=auroraBiomeVisibleGround(n),base=frame(n,surface),epsilon=.055;
 const sample=(x,z)=>auroraBiomeVisibleGround(norm(pt(base,[x,0,z])));
 let slope=norm(cross(sub(sample(0,epsilon),sample(0,-epsilon)),sub(sample(epsilon,0),sample(-epsilon,0))));
 if(dot(slope,n)<0)slope=mul(slope,-1);
 const axis=floor?norm(vlerp(slope,n,.75)):norm(vlerp(slope,n,.38)),depth=r*(floor?.48:.9)+.13;
 let root=sub(surface,mul(axis,depth));
 // A finite step along the normal can cross a concave erosion shelf. Recheck
 // the actual height field at the root and sink it into that rock as well.
 const rootDirection=norm(root),insideRadius=Math.min(R+terrain(rootDirection),len(auroraBiomeVisibleGround(rootDirection)))-Math.max(.09,r*.38);
 if(len(root)>insideRadius)root=mul(rootDirection,insideRadius);
 return {m:frame(axis,root),depth,axis};
}
function auroraBiomeCreateRifts(dec){
 let count=0,tall=0,wall=0;const glow=[];auroraBiomeEffects.riftAnchors=[];
 for(let i=0;i<9400;i++){
  const y=1-2*(i+.5)/9400,t=i*GOLDEN+.22,n=[Math.sqrt(1-y*y)*Math.cos(t),y,Math.sqrt(1-y*y)*Math.sin(t)],fault=auroraBiomeRiftDistance(n);
  if(fault>1.17||auroraBiomeWorkBlend(n).blend>.025)continue;
  const density=.5+.5*noise(n[0]*8+8,n[1]*8,n[2]*8);if(density<.20&&i%3!==0)continue;
  const a=[],floor=fault<.51,hero=floor&&i%7===0,small=i%5===0;
  if(!floor&&(i%2!==0||small))continue;
  const h=hero?2.5+(i%4)*.31:small?.31+(i%4)*.13:floor?1.02+(i%7)*.19:.55+(i%4)*.19;
  const r=hero?.30+(i%3)*.05:small?.075+(i%3)*.020:.155+(i%4)*.044;
  const purple=i%4===0,color=hex(purple?'a286d5':'62b3dd'),lean=floor?.08:.05;
  const anchor=auroraBiomeRiftAnchor(n,r,floor),m=anchor.m;
  // Dark fractured roots emerge from the rock around the prism base. Wall
  // clusters lean along the actual cliff normal and are sunk into that wall.
  if(!small){append(a,spheregeo(5,3),trs([0,anchor.depth*.70,0],[0,i*.41,.16],[r*1.45,r*.49,r*1.20]),hex(purple?'382b4a':'30334a'));}
  auroraBiomeRiftCrystal(a,[0,0,0],h,r,purple,[lean*(i%3-1),i*.3,lean*(i%2?1:-1)]);
  if(!small){auroraBiomeRiftCrystal(a,[r*.80,-.045,r*.38],h*.48,r*.62,purple,[.10,0,.20]);if(i%2===0)auroraBiomeRiftCrystal(a,[-r*.68,-.08,-r*.28],h*.35,r*.44,false,[-.10,.3,-.17]);}
  append(dec,a,m);auroraBiomeEffects.riftAnchors.push({position:m.slice(12,15),direction:[...anchor.axis],wall:!floor});count++;if(hero){tall++;const score=n[2]-.65*Math.abs(n[1]);if(!auroraBiomeEffects.focusDirection||score>auroraBiomeEffects.focusScore){auroraBiomeEffects.focusDirection=[...n];auroraBiomeEffects.focusScore=score;}}if(!floor)wall++;
  if(!small&&i%3===0){const halo=[];append(halo,spheregeo(8,6),trs([0,h*.67,0],[0,0,0],[r*1.8,h*.29,r*1.8]),color,0,5);append(glow,halo,m);}
 }
 auroraBiomeEffects.riftGlow=upload(glow);
 Object.assign(auroraBiomeEffects.stats,{riftCrystals:count,tallRiftCrystals:tall,wallCrystals:wall});
}

function auroraBiomeSphericalPoint(latitude,longitude,radius){const rr=Math.cos(latitude);return [Math.cos(longitude)*rr*radius,Math.sin(latitude)*radius,Math.sin(longitude)*rr*radius];}
function auroraBiomeGreatStorm(a,size){
 const radius=R-1.05,steps=96,rings=12;
 const surface=(x,z,lift=0)=>[x,-(x*x+z*z)/(2*radius)+.035+lift,z];
 // A broad, asymmetric red-brown cloud mass under the eye wall. Its shading
 // follows wind-sheared wisps instead of radial bands or concentric rings.
 const point=(ring,k)=>{const t=(k%steps)/steps*TAU,u=ring/rings,edge=1+.043*Math.sin(t*3+.8)+.024*Math.sin(t*7);
  const x=Math.cos(t)*2.28*size*u*edge+.11*size*(1-u*u),z=Math.sin(t)*1.31*size*u*edge+.09*size*Math.sin(t*2)*u;
  return surface(x,z,.075*(1-u*u));};
 for(let j=0;j<rings;j++)for(let i=0;i<steps;i++){
  const p=point(j,i),q=point(j+1,i),r=point(j+1,i+1),s=point(j,i+1),x=(p[0]+q[0]+r[0]+s[0])/4,z=(p[2]+q[2]+r[2]+s[2])/4;
  const shear=.5+.5*Math.sin(x*3.7+Math.sin(z*4.5)*.9+z*1.2),edge=j/rings;
  let c=vlerp(hex('a34f39'),hex('d78d60'),.36+shear*.35);
  c=vlerp(c,hex('d8ad80'),smooth(.76,1,edge)*.65);
  const eye=Math.exp(-((x-.17*size)**2/(.44*size)**2+(z+.04*size)**2/(.29*size)**2));
  c=vlerp(c,hex('edc793'),eye*.83);
  quad(a,p,q,r,s,c,.045,3);
 }
 // Three broad raised rolls sweep into an offset eye. Their widening, uneven
 // cross sections produce thick cloud curls with shadowed red lower edges.
 for(let arm=0;arm<3;arm++)for(let i=0;i<100;i++){
  const point=(k,across)=>{const u=k/100,angle=u*TAU*1.17+arm*TAU/3+.32,r=(.08+u*1.65)*size;
   const width=(.11+.17*Math.sin(PI*u))*(.32+.68*Math.sin(PI*Math.min(1,u*1.16)))*size;
   const rr=r+across*width,x=Math.cos(angle)*rr*1.34+.12*size*(1-u),z=Math.sin(angle)*rr*.79;
   return surface(x,z,.075+.105*Math.sqrt(Math.max(0,1-across*across))+.018*Math.sin(u*26+arm));};
  for(let section=0;section<5;section++){
   const left=-1+section*.4,right=left+.4,shade=section/4;
   const c=vlerp(hex(arm===1?'bd6748':'b85c42'),hex(arm===1?'f0cb96':'deaa78'),Math.sin(shade*PI)*.72+.10);
   quad(a,point(i,left),point(i+1,left),point(i+1,right),point(i,right),c,.045,3);
  }
 }
}
function auroraBiomeCreateCloudLayers(){
 for(let layer=0;layer<3;layer++){
  const a=[],rad=R-1.34+layer*.43;
  for(let band=0;band<11;band++){
   const lat=-1.29+band*.245+(layer-1)*.062,width=.035+.013*((band+layer)%3);
   for(let i=0;i<150;i++){
    const t=i/150*TAU,tt=(i+1)/150*TAU;
    const warp=u=>.017*Math.sin(u*(3+band%3)+band)+.009*Math.sin(u*13-band);
    const c=(band+layer)%3===0?hex('f2deb9'):(band+layer)%3===1?hex('b67d60'):hex('e4bb8b');
    const point=(u,side)=>auroraBiomeSphericalPoint(lat+warp(u)+width*side,u,rad);
    quad(a,point(t,-1),point(tt,-1),point(tt,1),point(t,1),c,0,3);
   }
  }
  auroraBiomeEffects.cloudLayers.push({geo:upload(a),speed:(layer===1?-.007:.004)*(layer+1),opacity:[.28,.24,.18][layer],radius:rad});
 }
 const centers=[[-.34,1.20,.98],[.39,3.28,.62],[-.58,-1.03,.53],[.74,.16,.38]];
 for(let index=0;index<centers.length;index++){
  const [lat,lon,size]=centers[index],n=norm(auroraBiomeSphericalPoint(lat,lon,1)),m=frame(n,mul(n,R-1.05)),a=[];
  // The primary cyclone has a substantial red eye wall; smaller secondary
  // vortices retain the lighter spiral detail in the surrounding cloud belts.
  if(index===0)auroraBiomeGreatStorm(a,size);
  else for(let arm=0;arm<4;arm++)for(let i=0;i<78;i++){
   const point=(k,side)=>{const u=k/78,angle=u*TAU*1.85+arm*TAU/4,r=.10+u*1.50*size+side*.075*size;
    const x=Math.cos(angle)*r*1.35,z=Math.sin(angle)*r*.82,y=-((x*x+z*z)/(2*(R-1.05)))+.035;
    return [x,y,z];};
   quad(a,point(i,-1),point(i+1,-1),point(i+1,1),point(i,1),hex('e8d9b4'),.04,3);
  }
  auroraBiomeEffects.storms.push({geo:upload(a),m,phase:index*1.4,speed:index%2?-.033:.023,size,opacity:index===0?.96:.78});
 }
 auroraBiomeEffects.stats.cloudLayers=3;auroraBiomeEffects.stats.storms=centers.length;
}

function auroraBiomeFloatingDistrict(d){
 const a=[],outline=auroraBiomePlatformOutline(d),cx=outline.reduce((s,p)=>s+p[0],0)/outline.length,cz=outline.reduce((s,p)=>s+p[1],0)/outline.length;
 for(let i=0;i<outline.length;i++){
  const p=outline[i],q=outline[(i+1)%outline.length],p3=[p[0],-.012,p[1]],q3=[q[0],-.012,q[1]],pb=[mix(p[0],cx,.09),-.30,mix(p[1],cz,.09)],qb=[mix(q[0],cx,.09),-.30,mix(q[1],cz,.09)];
  tri(a,[cx,-.012,cz],q3,p3,hex(i%3===0?'64727a':'596975'));
  quad(a,p3,q3,qb,pb,hex(i%2?'3d4b5b':'88949b'));
  tri(a,[cx,-.30,cz],pb,qb,hex('253849'));
  beam(a,[p[0],.025,p[1]],[q[0],.025,q[1]],.026,C.roof,6);
  const mid=[mix(p[0],q[0],.5),mix(p[1],q[1],.5)];
  beam(a,[mid[0]-.10,.045,mid[1]],[mid[0]+.10,.045,mid[1]],.018,C.teal,5,.55);
  if(i%2===0){const x=mix(p[0],cx,.22),z=mix(p[1],cz,.22);
   cyl(a,[x,-.33,z],.22,.28,C.dark,8,[0,0,0],.29);cyl(a,[x,-.495,z],.16,.032,C.teal,10,[0,0,0],null,.9);
   append(a,cylgeo(.08,.14,.35,8),trs([x,-.65,z]),C.teal,.7);
  }
 }
 // Separate docking wings and lifting cells break the outline into modules.
 if(d.resource){
  for(const [x,z] of [[-2.65,-1.92],[.0,-2.4],[2.16,.42]]){
   box(a,[x,-.19,z],[.68,.46,.59],C.dark);box(a,[x,.055,z],[.63,.035,.53],C.roof);
   for(let k=0;k<3;k++)box(a,[x+(k-1)*.15,.08,z],[.065,.035,.42],C.gold);
  }
  if(d.type==='metal')for(let i=0;i<11;i++){const x=-2.70+(i%4)*.23,z=-1.70-Math.floor(i/4)*.23;
   sphere(a,[x,.15+(i%3)*.028,z],[.17,.16,.14],i%2?C.metal:C.gold);}
  if(d.type==='crystal')for(let i=0;i<8;i++)crystal(a,[-2.65+(i%4)*.31,.08,-1.87-Math.floor(i/4)*.32],.36+(i%3)*.15,.09,C.purple,[0,.2*i,0]);
  if(d.type==='gas')for(const [x,z] of [[-2.64,-1.60],[-.20,-2.17],[2.12,-.92]]){
   cyl(a,[x,-.46,z],.11,.92,C.gas,10);cyl(a,[x,-.96,z],.28,.17,C.dark,12);
   for(let k=0;k<8;k++){const t=k/8*TAU;beam(a,[x+Math.cos(t)*.25,-1.02,z+Math.sin(t)*.25],[x,-1.23,z],.018,C.teal,5,.4);}
   beam(a,[x,.13,z],[x,.13,-.78],.041,C.gas,8);
  }
 }
 return a;
}

function auroraBiomeDistrictGeology(d){
 if(auroraBiome==='terrestrial')return null;
 if(auroraBiome==='gas')return auroraBiomeFloatingDistrict(d);
 if((auroraBiome==='mercury'&&d.type==='metal')||(auroraBiome==='mars'&&d.type==='crystal'))return null;
 // Other resource complexes are processing/storage facilities on this world;
 // do not import a terrestrial marsh or a resource this world cannot extract.
 const a=[];
 if(d.resource)for(const [x,z] of [[2.63,-.88],[2.47,.18],[2.71,.96]]){
  const y=localHeight(d,x,z)/SITE;box(a,[x,y+.025,z],[.13,.08,.16],C.base);antenna(a,x,y+.065,z,.24);
 }
 return a;
}

function auroraBiomeDraw(time,shadow){
 if(auroraBiome==='mercury')auroraVolcanoDraw(time,shadow);
 if(auroraBiome==='mars'&&!shadow&&auroraBiomeEffects.riftGlow){
  gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  draw(auroraBiomeEffects.riftGlow,ident(),.055);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
 }
 if(auroraBiome==='gas'&&!shadow){
  gl.depthMask(false);
  for(const layer of auroraBiomeEffects.cloudLayers)draw(layer.geo,trs([0,0,0],[0,time*layer.speed,0]),layer.opacity);
  for(const storm of auroraBiomeEffects.storms)draw(storm.geo,mm(storm.m,trs([0,0,0],[0,time*storm.speed+storm.phase,0])),storm.opacity);
  gl.depthMask(true);
 }
}

// Inject before tone mapping in the main surface shader. Attribute tags keep
// flowing lava / sheared cloud bands out of ordinary building materials.
const auroraBiomeSurfaceShader=`
 if(vType>1.5&&vType<2.5){
  float flow=sin(vPos.x*8.0+sin(vPos.z*5.0+uTime*.45)+uTime*.7)*sin(vPos.y*7.0-vPos.z*4.0-uTime*.33);
  float hot=pow(.5+.5*flow,4.0);finalc=col*(.82+hot*.28)+vec3(.29,.065,.008)+vec3(.28,.12,.018)*hot;
 }
 if(vType>2.5&&vType<3.5){
  vec3 cloudN=normalize(vPos);float lon=atan(cloudN.z,cloudN.x);
  float streak=sin(cloudN.y*167.0+sin(lon*11.0+cloudN.y*31.0+uTime*.016)*1.8+sin(lon*23.0-uTime*.014)*.4);
  finalc=col*(.62+.32*nd+.16*fill)+vec3(.08,.055,.022)*streak;
 }
 if(vType>3.5&&vType<4.5){
  float edge=pow(1.0-max(dot(n,v),0.0),2.0);finalc=col*(.48+nd*sh*.52+fill*.16+vColor.a*.42)+col*edge*.045+vec3(.10,.17,.20)*spec*.32;
 }
 if(vType>4.5&&vType<5.5){
  float soft=pow(max(dot(n,v),0.0),2.4);finalc=col*soft*.72;
 }
`;
const auroraBiomeAtmosphereColor=auroraBiome==='mercury'?[.84,.25,.08]:auroraBiome==='mars'?[.88,.42,.20]:auroraBiome==='gas'?[.76,.60,.37]:[.16,.58,.92];
const auroraBiomeAtmosphereShader=`precision highp float;varying vec3 vP;uniform vec3 uEye;void main(){vec3 n=normalize(vP),v=normalize(uEye-vP);float f=pow(1.-abs(dot(n,v)),3.1);gl_FragColor=vec4(${auroraBiomeAtmosphereColor.map(x=>x.toFixed(3)).join(',')},f*${auroraBiome==='gas'?'.36':'.44'});}`;
