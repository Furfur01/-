// Geological scenery follows the ground vertex by vertex. Excavation is an
// open hillside section; no circular district plinth or closed concentric pit.
function auroraGeologyFeatures(type){
 if(!auroraGeologyFeatures.cache)auroraGeologyFeatures.cache={
  metal:{face:[[-3.25,-1.25],[-2.97,-1.01],[-2.62,-1.18],[-2.21,-.86],[-1.85,-.65],[-1.53,-.61],[-1.25,-.89],[-.95,-1.22]],
   veins:[[-3.40,-2.48],[-2.92,-2.86],[-2.34,-2.63],[-1.75,-2.95],[-1.21,-2.60],[-.70,-2.89]]},
  crystal:{reef:[[-3.22,-.88],[-2.84,-1.43],[-2.43,-1.83],[-2.03,-2.33],[-1.51,-2.21],[-.99,-2.52],[-.45,-2.27]],
   sites:[[-2.91,-.97,1.26,.26,.16],[-2.55,-1.60,1.95,.39,.14],[-2.12,-2.14,2.55,.47,-.10],[-1.37,-2.28,1.74,.33,.25],[-.68,-2.20,1.28,.27,-.25],[.40,-1.44,.94,.23,-.10]]},
  gas:{channels:[
   {points:[[-2.70,-1.98],[-2.10,-2.20],[-1.42,-2.14],[-.85,-2.50],[-.30,-2.35],[.42,-2.66],[1.05,-2.24],[1.76,-2.13]],widths:[.12,.29,.20,.27,.17,.31,.23,.07]},
   {points:[[-2.55,2.04],[-2.00,2.19],[-1.30,2.03],[-.80,2.45],[.10,2.32],[.75,2.10],[1.55,2.46],[2.38,2.28]],widths:[.07,.20,.12,.25,.28,.14,.21,.06]}],
   wells:[[-1.87,-2.13],[-.26,-2.35],[1.10,-2.20]]}
 };
 return auroraGeologyFeatures.cache[type];
}

function auroraGeologySegmentDistance(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);
 return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}

function auroraGeologyPathDistance(x,z,path){
 let distance=Infinity;
 for(let i=0;i<path.length-1;i++)distance=Math.min(distance,auroraGeologySegmentDistance(x,z,path[i],path[i+1]));
 return distance;
}

function auroraGeologyInside(x,z,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[j],b=polygon[i];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}

// True only inside an actual mineral face, reef, wet channel or well footprint.
// The scene uses this to keep trees out of geometry without clearing a disk.
function auroraGeologyClearance(d,x,z,margin=.25){
 const f=auroraGeologyFeatures(d.type);if(!f)return false;
 if(d.type==='metal'){
  const polygon=[...f.face,...f.face.map(p=>[p[0],p[1]-1.45]).reverse()];
  if(auroraGeologyInside(x,z,polygon)||auroraGeologyPathDistance(x,z,[...polygon,polygon[0]])<margin)return true;
  if(auroraGeologyPathDistance(x,z,f.veins)<.22+margin)return true;
  if(Math.abs(x+1.62)<.23+margin&&z>-.50-margin&&z<.79+margin)return true;
  return x>-.35-margin&&x<.64+margin&&z>1.76-margin&&z<2.13+margin;
 }
 if(d.type==='crystal'){
  if(auroraGeologyPathDistance(x,z,f.reef)<.25+margin)return true;
  return f.sites.some(([cx,cz,h,r])=>Math.hypot(x-cx,z-cz)<r+.28+margin);
 }
 if(d.type==='gas')return f.channels.some(c=>auroraGeologyPathDistance(x,z,c.points)<.43+margin)
  ||f.wells.some(([cx,cz])=>Math.hypot(x-cx,z-cz)<.23+margin);
 return false;
}

function auroraGeologyGround(d,x,z,lift=0){return [x,localHeight(d,x,z)/SITE+lift,z];}

// A variable-width, ground-following ribbon. Irregular edges bury into the
// natural hillside; it never creates the vertical wall of a raised platform.
function auroraGeologyRibbon(a,d,points,widths,color,lift=.018){
 const surfaceLift=lift+.018,step=.10;
 const pairs=points.map((p,i)=>{
  const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
  const dx=after[0]-before[0],dz=after[1]-before[1],length=Math.hypot(dx,dz)||1,w=Array.isArray(widths)?widths[i]:widths;
  return [auroraGeologyGround(d,p[0]-dz/length*w,p[1]+dx/length*w,surfaceLift),auroraGeologyGround(d,p[0]+dz/length*w,p[1]-dx/length*w,surfaceLift)];
 });
 // Coarse endpoint-only quads cut through curved ground. Sample a small 2D
 // terrain mesh instead; equal cross-ribbon divisions also prevent T junctions.
 const across=Math.max(2,Math.ceil(Math.max(...pairs.map(p=>Math.hypot(p[1][0]-p[0][0],p[1][2]-p[0][2])))/step));
 for(let i=0;i<pairs.length-1;i++){
  const first=pairs[i],last=pairs[i+1];
  const along=Math.max(1,Math.ceil(Math.max(...[0,1].map(k=>Math.hypot(last[k][0]-first[k][0],last[k][2]-first[k][2])))/step));
  let previous=null;
  for(let j=0;j<=along;j++){
   const t=j/along,left=vlerp(first[0],last[0],t),right=vlerp(first[1],last[1],t),row=[];
   for(let k=0;k<=across;k++){
    const u=k/across;
    row.push(auroraGeologyGround(d,mix(left[0],right[0],u),mix(left[2],right[2],u),surfaceLift));
   }
   if(previous)for(let k=0;k<across;k++)quad(a,previous[k],row[k],row[k+1],previous[k+1],color.map(v=>v*(.95+(i%3)*.027)));
   previous=row;
  }
 }
 return pairs;
}

function auroraGeologyCrag(a,d,x,z,h,r,color,turn=.4){
 const g=[],raw=spheregeo(5,3),faceted=[];
 for(let i=0;i<raw.length;i+=33)tri(faceted,raw.slice(i,i+3),raw.slice(i+11,i+14),raw.slice(i+22,i+25),color);
 append(g,faceted,trs([0,h*.38,0],[0,turn,.10],[r,h*.55,r*.76]),color);
 append(a,g,trs(auroraGeologyGround(d,x,z,-.025)));
}

function auroraGeologyPipe(a,d,from,to){
 const count=Math.max(1,Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/.30));
 for(let i=0;i<count;i++){
  const p=[mix(from[0],to[0],i/count),mix(from[1],to[1],i/count)];
  const q=[mix(from[0],to[0],(i+1)/count),mix(from[1],to[1],(i+1)/count)];
  beam(a,auroraGeologyGround(d,...p,.24),auroraGeologyGround(d,...q,.24),.032,C.gas,8);
  if(i%2===0)beam(a,auroraGeologyGround(d,...p,.012),auroraGeologyGround(d,...p,.24),.023,C.roof,5);
 }
}

function districtGeology(d){
 const a=[],f=auroraGeologyFeatures(d.type);if(!f)return a;
 if(d.type==='metal'){
  // Three exposed rock benches cut diagonally across a hillside. Each end
  // tapers into natural terrain; the entire loading-facing side stays open.
  const rows=[[0,-.026],[.07,.18],[.34,.18],[.41,.39],[.72,.39],[.81,.62],[1.05,.62],[1.25,.31],[1.45,-.03]],seams=[];
  const points=rows.map(([depth,height],j)=>f.face.map(([x,z],i)=>{
   const taper=Math.pow(Math.sin(i/(f.face.length-1)*PI),.55);
   const zz=z-depth-(j>0?.035*Math.sin(i*2.1+j*.35):0);
   return auroraGeologyGround(d,x+.04*Math.sin(j*.7+i),zz,height*taper);
  }));
  for(let j=0;j<points.length-1;j++)for(let i=0;i<f.face.length-1;i++){
   let color=j%2?hex('bd955e'):hex('8b643f');
   if(j>5)color=hex('a18758');
   quad(a,points[j][i],points[j][i+1],points[j+1][i+1],points[j+1][i],color.map(v=>v*(.92+(i%3)*.045)));
   // Broken seams are confined to the rock face, never closed decorative rings.
   if((j===2||j===4)&&i%3!==0){
    const p=vlerp(points[j][i],points[j+1][i],.42),q=vlerp(points[j][i+1],points[j+1][i+1],.55);
    beam(seams,add(p,[0,.012,.013]),add(q,[0,.012,.013]),.016,i%2?C.metal:C.gold,4,.03);
   }
  }
  append(a,seams,ident());
  auroraGeologyRibbon(a,d,f.veins,[.12,.25,.17,.26,.19,.07],hex('9b7b55'),.016);
  for(let i=0;i<f.veins.length;i++){
   const [x,z]=f.veins[i];
   auroraGeologyCrag(a,d,x,z,.38+(i%3)*.13,.22+(i%2)*.09,hex(i%2?'9b7547':'8c7959'),i*.61);
   auroraGeologyRibbon(a,d,[[x-.11,z+.06],[x+.13,z-.09],[x+.21,z-.19]],[.020,.032,.015],C.metal,.025);
  }
  // Existing conveyor connection and loading apron remain at their authored X/Z.
  for(let k=0;k<13;k++){
   const z=-.44+k*.094,p=auroraGeologyGround(d,-1.62,z,.48-k*.012);
   box(a,p,[.37,.043,.08],k%3===0?C.metal:C.dark);
  }
  for(const z of [-.4,0,.4])for(const x of [-1.81,-1.43])beam(a,auroraGeologyGround(d,x,z,.025),auroraGeologyGround(d,x,z,.49-z*.08),.031,C.roof);
  for(let k=0;k<8;k++)auroraGeologyCrag(a,d,-.20+(k%4)*.21,1.93+Math.floor(k/4)*.15,.12,.13,k%2?C.gold:C.metal,k*.5);
 }
 if(d.type==='crystal'){
  // A discontinuous diagonal reef: grass and native slope remain between the
  // outcrops. The runtime owns the two drill-contact crystals near the robot paths.
  for(let i=0;i<f.reef.length;i++){
   const [x,z]=f.reef[i];
   auroraGeologyCrag(a,d,x,z,.26+(i%3)*.09,.23+(i%2)*.10,hex(i%2?'796d87':'777d7b'),i*.7);
   for(let j=0;j<3;j++){
    const xx=x-.15+j*.14,zz=z+.16*Math.sin(i*1.9+j);
    crystal(a,auroraGeologyGround(d,xx,zz,-.018),.20+((i+j)%3)*.10,.045+j*.012,j%2?C.crystal:C.purple,[.10,i*.48,.12]);
   }
  }
  for(const [x,z,h,r,rotation] of f.sites){
   crystal(a,auroraGeologyGround(d,x,z,-.024),h,r,C.crystal,[.06,.8*x,rotation]);
   const xx=x+r*.78,zz=z+r*.45;
   crystal(a,auroraGeologyGround(d,xx,zz,-.012),h*.43,r*.53,C.purple,[.1,0,-rotation]);
  }
  for(let i=0;i<6;i++){
   const x=-2.72+i*.29,z=-1.20-i*.22;
   auroraGeologyCrag(a,d,x+.20,z-.10,.12,.15,hex('8f9291'),i*.8);
  }
 }
 if(d.type==='gas'){
  // Seep-fed wetland channels with asymmetric banks. Their shallow surfaces
  // drape over terrain, instead of repeating three cylindrical pool pedestals.
  for(const c of f.channels){
   auroraGeologyRibbon(a,d,c.points,c.widths.map(w=>w+.13),hex('779477'),.009);
   auroraGeologyRibbon(a,d,c.points,c.widths,hex('387e72'),.018);
   auroraGeologyRibbon(a,d,c.points,c.widths.map((w,i)=>w*(i%2?.43:.60)),hex('4ba490'),.021);
   for(let i=1;i<c.points.length-1;i++){
    const [x,z]=c.points[i],side=i%2?1:-1;
    const xx=x+side*(c.widths[i]+.16),zz=z+side*.12;
    if(i%3!==0)auroraGeologyCrag(a,d,xx,zz,.13+(i%2)*.065,.12,hex('a0ac84'),i*.8);
    for(let j=0;j<3;j++){
     const rx=xx+(j-1)*.047,rz=zz+(j%2)*.055,h=.20+((j+i)%3)*.07;
     cyl(a,auroraGeologyGround(d,rx,rz,h/2-.01),.027,h,hex('69835c'),4,[0,0,.07*(j-1)],0);
    }
   }
  }
  for(let i=0;i<f.wells.length;i++){
   const [x,z]=f.wells[i],p=auroraGeologyGround(d,x,z);
   box(a,add(p,[0,.025,0]),[.31,.07,.29],C.base,[0,.17*i,0]);
   cyl(a,add(p,[0,.22,0]),.105,.34,C.roof,8);
   cyl(a,add(p,[0,.405,0]),.14,.045,C.gas,8);
   // Pipes descend to the existing collector line without a raised pond wall.
   beam(a,add(p,[0,.30,0]),add(p,[0,.24,0]),.032,C.gas,8);
   auroraGeologyPipe(a,d,[x,z],[x,-1.75]);
   auroraGeologyPipe(a,d,[x,-1.75],[.05,-1.75]);
  }
  for(let k=0;k<4;k++)auroraGeologyCrag(a,d,2.73+Math.sin(k*1.6)*.12,-.80+k*.37,.30,.24,hex('718a73'),k*.9);
 }
 // Sparse site beacons remain local fixtures, not a repeated enclosing fence.
 for(const [x,z] of [[2.63,-.88],[2.47,.18],[2.71,.96]]){
  const y=localHeight(d,x,z)/SITE;
  box(a,[x,y+.025,z],[.13,.08,.16],C.base);antenna(a,x,y+.065,z,.24);
 }
 return a;
}
