import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const runtime=readFileSync(new URL('aurora-runtime.js',root),'utf8');
const head=runtime.slice(0,runtime.indexOf('/*__AURORA_TERRAIN__*/')).replace('function createAuroraRuntime(options={}) {','((options={}) => {');
const terrainSource=readFileSync(new URL('aurora-terrain.js',root),'utf8');
const routes=runtime.slice(runtime.indexOf('function samplePath('),runtime.indexOf('// District scenery'));
const surfaceFunctions=runtime.slice(runtime.indexOf('function ground('),runtime.indexOf('const canvas='));
const api=vm.runInNewContext(`${head}\n${terrainSource}\n${surfaceFunctions}\n${routes}\nreturn {terrain,auroraNaturalHeight,auroraCoastDistance,auroraPadInfluence,auroraDistrictLocal,auroraWorkMask,localHeight,localPoint,districts,pt,norm,dot,R,PAD,SITE,samplePath,outTruck,backTruck,robotPaths};})();`,{console});
const nAt=(longitude,latitude)=>{const x=longitude*Math.PI/180,y=latitude*Math.PI/180;return [Math.cos(y)*Math.cos(x),Math.sin(y),Math.cos(y)*Math.sin(x)];};

function atlas(){
 const width=360,height=180,land=new Uint8Array(width*height);let total=0,area=0,north=0,south=0;
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){
  const lat=j-89.5,weight=Math.cos(lat*Math.PI/180),on=api.terrain(nAt(i-179.5,lat))>0;
  total+=weight;if(on){area+=weight;land[j*width+i]=1;if(lat>0)north+=weight;else south+=weight;}
 }
 const visited=new Uint8Array(land.length),components=[];
 for(let start=0;start<land.length;start++){
  if(!land[start]||visited[start])continue;
  const queue=[start];visited[start]=1;let componentArea=0;
  for(let at=0;at<queue.length;at++){
   const p=queue[at],x=p%width,y=Math.floor(p/width);componentArea+=Math.cos((y-89.5)*Math.PI/180);
   for(const [xx,yy] of [[(x+1)%width,y],[(x+width-1)%width,y],[x,y-1],[x,y+1]]){
    if(yy<0||yy>=height)continue;const q=yy*width+xx;if(land[q]&&!visited[q]){visited[q]=1;queue.push(q);}
   }
  }
  const districtNames=api.districts.filter(d=>{const lon=Math.atan2(d.n[2],d.n[0])*180/Math.PI,lat=Math.asin(d.n[1])*180/Math.PI;return queue.includes(Math.floor(lat+90)*width+Math.floor(lon+180));}).map(d=>d.type);
  components.push({area:componentArea/total,districtNames});
 }
 return {landFraction:area/total,northernLand:north/(total/2),southernLand:south/(total/2),continents:components.filter(x=>x.area>.001).sort((a,b)=>b.area-a.area),tinyIslands:components.filter(x=>x.area<=.001).length};
}

test('four connected continents leave substantial ocean in both hemispheres',()=>{
 const result=atlas();console.log('Aurora terrain atlas:',JSON.stringify(result));
 assert.equal(result.continents.length,4);
 assert(result.continents.every(c=>c.area>.035),'each continent must be geographically substantial');
 assert(result.landFraction>.35&&result.landFraction<.72,'land must not turn into one global construction platform');
 assert(result.northernLand>.30&&result.northernLand<.80);
 assert(result.southernLand>.30&&result.southernLand<.80);
 assert(result.tinyIslands<8,'coastal noise must not recreate scattered circular site islands');
});

test('ordinary building foundations remain on land and match their tangent plane',()=>{
 const failures=[];let minCoast=Infinity,maxError=0;
 for(const d of api.districts.filter(d=>!d.resource)){
  const radius=3.1;
  for(let ring=0;ring<=5;ring++)for(let k=0;k<64;k++){
   const a=k/64*Math.PI*2,r=radius*ring/5;
   const n=api.norm(api.pt(d.m,[Math.cos(a)*r/api.SITE,0,Math.sin(a)*r/api.SITE]));
   const coast=api.auroraCoastDistance(n),expected=(api.R+api.PAD)/api.dot(n,d.n)-api.R;
   const error=Math.abs(api.terrain(n)-expected);minCoast=Math.min(minCoast,coast);maxError=Math.max(maxError,error);
   if(coast<.48||error>.015)failures.push({district:d.type,r,angle:k*360/64,coast,error});
  }
 }
 console.log('Aurora site coverage:',{minCoast,maxError,failures:failures.slice(0,12),count:failures.length});
 assert.equal(failures.length,0,'ordinary building foundations need stable dry ground');
});

test('earthworks do not move coastlines and terrain is continuous across the dateline',()=>{
 let shoreSamples=0,maxStep=0;
 for(let j=-88;j<=88;j+=2)for(let i=-179;i<=179;i+=2){
  const n=nAt(i,j),coast=api.auroraCoastDistance(n),h=api.terrain(n);
  assert(Number.isFinite(h));
  assert.equal(h>0,coast>0,'leveling must preserve every land/ocean classification');
  if(Math.abs(coast)<.04){assert.equal(h,api.auroraNaturalHeight(n,coast));shoreSamples++;}
  const step=Math.abs(h-api.terrain(nAt(i+.0001,j)));maxStep=Math.max(maxStep,step);
 }
 assert(shoreSamples>30);assert(maxStep<.001,'terrain must have no seam between work areas and natural land');
 for(let lat=-89;lat<90;lat++)assert(Math.abs(api.terrain(nAt(179.999999,lat))-api.terrain(nAt(-180,lat)))<.00001);
});

test('only actual foundations, transport footprints, drill contacts and utility supports are level',()=>{
 const check=(type,x,z)=>{
  const d=api.districts.find(d=>d.type===type),n=api.norm(api.pt(d.m,[x,0,z]));
  const expected=(api.R+api.PAD)/api.dot(n,d.n)-api.R;
  assert(api.auroraCoastDistance(n)>.48,`${type} scenery at ${x},${z} must be inland`);
  assert(Math.abs(api.terrain(n)-expected)<.015,`${type} scenery at ${x},${z} must meet its original plane`);
 };
 for(const [type,paths] of [['metal',[api.outTruck,api.backTruck]],['crystal',api.robotPaths]]){
  for(const path of paths)for(let i=0;i<=120;i++){
   const [x,z]=api.samplePath(path,i/120);
   // Includes vehicle/robot body and road-edge clearance, not just a centerline.
   for(const dx of [-.26,0,.26])for(const dz of [-.26,0,.26])check(type,x+dx,z+dz);
  }
 }
 for(const type of ['metal','crystal','gas']){
  const mine=type==='metal'?[-.2,-.2,.81,.70]:type==='crystal'?[-1.55,-1.1,.89,.89]:[-1.55,-.12,.98,.64];
  for(const [x,z,hx,hz] of [mine,[1.65,.10,.81,.76]])for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)check(type,x+hx*i/4,z+hz*j/4);
 }
 for(const [x,z] of [[-1.55,.23],[-1.81,.16],[-1.31,.21],[-.35,-.79],[-.58,-.86],[-.17,-.94]])check('crystal',x,z);
 const pipes=[[[-1.55,-.35],[-1.0,-.8],[.05,-.8],[.05,.48],[1.65,.48]],[[-1.55,.32],[-.72,.32],[-.72,.85],[1.3,.85],[1.3,.48]],[[.05,-.8],[.05,-1.7],[-.25,-1.7]]];
 for(const path of pipes)for(let i=1;i<path.length;i++)for(let k=0;k<=20;k++){
  const [x,z]=path[i].map((v,j)=>path[i-1][j]+(v-path[i-1][j])*k/20);
  for(const [dx,dz] of [[.06,0],[-.06,0],[0,.06],[0,-.06]])check('gas',x+dx,z+dz);
 }
});

test('unused mining land retains natural slopes and no district-sized plateau or hard rim',()=>{
 const report=[];
 for(const d of api.districts.filter(d=>d.resource)){
  let count=0,level=0,natural=0,maxStep=0,minResidual=Infinity,maxResidual=-Infinity;
  const height=(x,z)=>{const n=api.norm(api.pt(d.m,[x,0,z]));return {n,height:api.terrain(n),plane:(api.R+api.PAD)/api.dot(n,d.n)-api.R};};
  for(let ix=-34;ix<=34;ix++)for(let iz=-34;iz<=34;iz++){
   const x=ix/10,z=iz/10,s=height(x,z),mask=api.auroraWorkMask(d,x,z);count++;
   const local=api.auroraDistrictLocal(s.n,d);assert(Math.abs(local[0]-x)<1e-10&&Math.abs(local[1]-z)<1e-10);
   if(mask===1)level++;
   if(mask===0){natural++;assert(Math.abs(s.height-api.auroraNaturalHeight(s.n))<1e-9);minResidual=Math.min(minResidual,s.height-s.plane);maxResidual=Math.max(maxResidual,s.height-s.plane);}
   maxStep=Math.max(maxStep,Math.abs(s.height-height(x+.002,z).height),Math.abs(s.height-height(x,z+.002).height));
  }
  const row={type:d.type,levelFraction:level/count,naturalFraction:natural/count,naturalRelief:maxResidual-minResidual,maxStep};report.push(row);
  assert(row.levelFraction<.36,'actual working footprints must not merge into a district-sized level pad');
  assert(row.naturalFraction>.30,'substantial unused mining land must be completely untouched');
  assert(row.naturalRelief>.6,'natural land must descend and rise through the mineral outskirts');
  assert(maxStep<.018,'local terraces must transition continuously without a sharp height rim');
  for(const [x,z] of [[-3.2,-2.5],[-2.9,2.9],[3.0,2.9],[0,-2.9]])assert(api.auroraWorkMask(d,x,z)<.1,'natural slopes must reach the district outskirts');
 }
 console.log('Localized mining earthworks:',JSON.stringify(report));
});

test('fixed local scenery coordinates intersect real uneven terrain within one centimeter',()=>{
 let largestResidual=0,oldRadialProjectionResidual=0,largestCorrection=0,samples=0;
 for(const d of api.districts.filter(d=>d.resource))for(let ix=-19;ix<=19;ix++)for(let iz=-19;iz<=19;iz++){
  const x=ix/5,z=iz/5,height=api.localHeight(d,x,z),point=api.pt(d.m,[x,height/api.SITE,z]);
  const residual=Math.abs(Math.hypot(...point)-api.R-api.terrain(api.norm(point)));
  largestResidual=Math.max(largestResidual,residual);samples++;
  assert(residual<.01,`${d.type} fixed scenery at ${x},${z} misses the actual surface by ${residual}`);
  // Reproduce the previous radial shortcut against the same production terrain.
  // It is deliberately not used as the expected value for the corrected solver.
  const radial=api.localPoint(d,x,z),origin=api.pt(d.m,[0,0,0]);
  const oldHeight=api.dot(radial.map((v,i)=>v-origin[i]),d.n),oldPoint=api.pt(d.m,[x,oldHeight/api.SITE,z]);
  oldRadialProjectionResidual=Math.max(oldRadialProjectionResidual,Math.abs(Math.hypot(...oldPoint)-api.R-api.terrain(api.norm(oldPoint))));
  largestCorrection=Math.max(largestCorrection,Math.abs(height-oldHeight));
 }
 assert(oldRadialProjectionResidual>.02,'sample must exercise genuine non-planar ground instead of an all-flat fixture');
 console.log('Fixed-coordinate scenery surface solve:',{samples,largestResidual,oldRadialProjectionResidual,largestCorrection});
});
