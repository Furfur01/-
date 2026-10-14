// Four authored continental silhouettes. Coordinates are longitude/latitude,
// in degrees; their bays and peninsulas are independent of construction pads.
// No district can create land: earthworks only modify existing inland terrain.
const auroraContinents = [
 {name:'Meridian',center:20,points:[[-31,-81],[-39,-68],[-25,-56],[-17,-41],[-12,-25],[-26,-8],[-35,14],[-27,33],[-20,48],[-31,64],[-30,80],[51,83],[84,67],[88,49],[88,30],[80,17],[72,8],[70,-16],[59,-31],[42,-40],[35,-53],[48,-67],[45,-81]]},
 {name:'Aurora',center:145,points:[[75,-60],[62,-43],[67,-27],[81,-12],[92,5],[103,27],[103,39],[98,53],[104,66],[125,77],[170,79],[204,68],[212,51],[198,35],[170,30],[160,18],[151,2],[160,-8],[187,-7],[189,-24],[187,-35],[167,-36],[150,-30],[138,-35],[114,-43],[107,-57]]},
 {name:'Occident',center:-80,points:[[-120,57],[-103,62],[-79,57],[-59,55],[-47,46],[-47,31],[-56,20],[-54,10],[-69,0],[-72,-12],[-45,-10],[-26,-24],[-28,-41],[-45,-50],[-64,-45],[-76,-30],[-93,-20],[-108,-21],[-118,-12],[-124,8],[-112,22],[-108,36],[-121,47]]},
 {name:'Vesper',center:-150,points:[[-158,36],[-144,34],[-137,24],[-139,11],[-145,2],[-128,-10],[-124,-31],[-112,-43],[-111,-58],[-133,-68],[-156,-62],[-168,-49],[-163,-36],[-163,-24],[-167,-4],[-171,12],[-170,26]]}
];
const auroraDegrees=180/Math.PI;

// Signed distance to the entire polygon (positive inland), in surface units.
// Wrapping relative to each continent keeps the dateline seamless. The metric
// uses local latitude, so a coastal slope has a consistent physical width.
function auroraCoastDistance(n){
 const latitude=Math.asin(clamp(n[1],-1,1))*auroraDegrees;
 const longitude=Math.atan2(n[2],n[0])*auroraDegrees;
 const scaleX=Math.max(.10,Math.cos(latitude/auroraDegrees));
 let best=-1e6;
 for(const continent of auroraContinents){
  const x=continent.center+((longitude-continent.center+540)%360)-180;
  let inside=false,distance=1e6;
  const points=continent.points;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
   const a=points[j],b=points[i];
   if((a[1]>latitude)!==(b[1]>latitude)&&x<(b[0]-a[0])*(latitude-a[1])/(b[1]-a[1])+a[0])inside=!inside;
   const ax=(a[0]-x)*scaleX,ay=a[1]-latitude,bx=(b[0]-x)*scaleX,by=b[1]-latitude;
   const dx=bx-ax,dy=by-ay,t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);
   distance=Math.min(distance,Math.hypot(ax+dx*t,ay+dy*t));
  }
  best=Math.max(best,(inside?distance:-distance)*R/auroraDegrees);
 }
 // Small coastal inlets on otherwise broad, deliberately drawn landmasses.
 // This amplitude cannot merge continents or detach district-sized islands.
 return best+fbm(n,10.5)*.14;
}

function auroraNaturalHeight(n,coast=auroraCoastDistance(n)){
 if(coast<0)return -Math.min(1.3,-coast*.62+.035*smooth(0,1,-coast));
 const interior=.38+Math.max(0,fbm(n,3.1)+.16)*.76+Math.max(0,fbm(n,8.4))*.31;
 return interior*smooth(0,.76,coast);
}

// District-local coordinates match localPoint(), model geometry and animation
// lanes. Keeping this public lets vegetation and soil follow the actual work
// footprints rather than a district-sized circular clearing.
function auroraDistrictLocal(n,d){
 const co=dot(n,d.n),scale=(R+PAD)/(co*SITE*SITE);
 return [dot(n,d.m.slice(0,3))*scale,dot(n,d.m.slice(8,11))*scale];
}

const auroraWorkSites=new Map();
function auroraWorkSite(d){
 if(auroraWorkSites.has(d.type))return auroraWorkSites.get(d.type);
 const rectangles=[],lanes=[];
 const rectangle=(x,z,hx,hz,fade=.78)=>rectangles.push({x,z,hx,hz,fade});
 function lane(points,core=.39,fade=.62,curved=true){
  const pointsOnLane=curved?Array.from({length:65},(_,i)=>samplePath(points,i/64)):points;
  const segments=[];let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const p of pointsOnLane){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minZ=Math.min(minZ,p[1]);maxZ=Math.max(maxZ,p[1]);}
  for(let i=1;i<pointsOnLane.length;i++){const a=pointsOnLane[i-1],b=pointsOnLane[i],dx=b[0]-a[0],dz=b[1]-a[1];segments.push({x:a[0],z:a[1],dx,dz,lengthSquared:dx*dx+dz*dz});}
  lanes.push({segments,core,fade,minX:minX-core-fade,maxX:maxX+core+fade,minZ:minZ-core-fade,maxZ:maxZ+core+fade});
 }
 if(d.resource){
  // Separate, small foundations. The untouched spaces between geology, roads
  // and utilities remain natural slopes; there is no enclosing district pad.
  rectangle(1.65,.10,.94,.87);
  if(d.type==='metal'){
   rectangle(-.20,-.20,.94,.89);
   rectangle(-1.62,.16,.29,.70,.57); // conveyor and loading supports
   lane(outTruck);lane(backTruck);
   lane([[-.05,1.84],[.35,1.68],[.15,1.46],[-1.08,1.36],[-1.55,.70]]);
   lane([[-1.55,.70],[-.9,.76],[-.12,1.0],[.28,1.54],[-.05,1.84]]);
   lane([outTruck[0],[-.05,1.84]],.39,.62,false);
  }else if(d.type==='crystal'){
   rectangle(-1.55,-1.10,.96,.96);
   rectangle(-1.55,.23,.45,.47,.57); // first drill contacts
   rectangle(-.35,-.79,.45,.42,.57); // second drill contacts
   for(const path of robotPaths){lane(path);lane([[.22,1.83],...path.slice(1)]);}
   lane([robotPaths[0][0],[.22,1.83]],.39,.62,false);
  }else if(d.type==='gas'){
   rectangle(-1.55,-.12,1.05,.70);
   rectangle(.10,-.90,.40,.31,.58); // compressor
   rectangle(-.28,-1.68,.24,.29,.58); // extraction well
   for(const path of [[[-1.55,-.35],[-1.0,-.8],[.05,-.8],[.05,.48],[1.65,.48]],[[-1.55,.32],[-.72,.32],[-.72,.85],[1.3,.85],[1.3,.48]],[[.05,-.8],[.05,-1.7],[-.25,-1.7]]])lane(path,.14,.58,false);
  }
 }
 const site={rectangles,lanes};auroraWorkSites.set(d.type,site);return site;
}

function auroraWorkMask(d,x,z){
 if(!d.resource){const extent=3.35/SITE,envelope=Math.max(Math.abs(x)/extent,Math.abs(z)/extent,(Math.abs(x)+Math.abs(z))/(extent*1.52));return 1-smooth(1,1.30,envelope);}
 let influence=0;const site=auroraWorkSite(d);
 for(const r of site.rectangles){
  const dx=Math.max(0,Math.abs(x-r.x)-r.hx),dz=Math.max(0,Math.abs(z-r.z)-r.hz);
  const distance=Math.hypot(dx,dz);
  influence=Math.max(influence,1-smooth(0,r.fade,distance));
  if(influence===1)return 1;
 }
 for(const lane of site.lanes){
  if(x<lane.minX||x>lane.maxX||z<lane.minZ||z>lane.maxZ)continue;
  let nearest=Infinity;
  for(const s of lane.segments){
   const dx=x-s.x,dz=z-s.z,t=clamp((dx*s.dx+dz*s.dz)/(s.lengthSquared||1),0,1);
   nearest=Math.min(nearest,(dx-t*s.dx)**2+(dz-t*s.dz)**2);
  }
  influence=Math.max(influence,1-smooth(lane.core,lane.core+lane.fade,Math.sqrt(nearest)));
  if(influence===1)return 1;
 }
 return influence;
}

function auroraPadInfluence(n,d){
 const co=dot(n,d.n);if(co<.78)return null;
 const [x,z]=auroraDistrictLocal(n,d),blend=auroraWorkMask(d,x,z);
 if(blend===0)return null;
 return {height:(R+PAD)/co-R,blend};
}

function terrain(n){
 const variant=typeof auroraBiomeTerrain==='function'?auroraBiomeTerrain(n):null;if(variant!==null)return variant;
 const coast=auroraCoastDistance(n);
 let h=auroraNaturalHeight(n,coast);
 // Coastline and shallow sea are untouched by leveling. Full earthworks occur
 // only well inland; stable site coverage is checked against the land mask.
 const inland=smooth(.04,.48,coast);
 if(inland===0)return h;
 let target=0,weight=0,strongest=0;
 for(const d of districts){const pad=auroraPadInfluence(n,d);if(!pad)continue;
  target+=pad.height*pad.blend;weight+=pad.blend;strongest=Math.max(strongest,pad.blend);
 }
 if(weight)h=mix(h,target/weight,strongest*inland);
 return h;
}
