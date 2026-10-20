import {createOriginalCapital,createModelToolkit} from './continuum-assets/capital-original.js';
import {CAPITAL_SIZE,CAPITAL_DISTRICTS,CAPITAL_VERSION,COLONY_ROADS} from './capital-layout.js';
import {installColonyNightMaterials,createColonyLightPools} from './colony-night-lighting.js';

/** The supplied CONTINUUM model is the asset. Additions own separate groups and
 * resources. All ten original modules, geometry buffers and mechanisms survive. */
export function createCapitalAsset({THREE:T,seed=17,ground,size,gas=false,connected=false}={}){
  const dimensions={width:Math.max(CAPITAL_SIZE.width,size?.width||0),depth:Math.max(CAPITAL_SIZE.depth,size?.depth||0)};
  const city=createOriginalCapital({THREE:T,seed,size:dimensions,ground});
  const originalUpdate=city.update,originalDispose=city.dispose,originalSet=city.setModuleState;
  const kit=createModelToolkit(T),{C,Batch,group}=kit;
  const additions=group(city.root,'CONTINUUM / capital extension');
  const streets=group(additions,'extension streets'),near=group(additions,'original-scale civic blocks'),far=group(additions,'civic block silhouettes');
  const command=city.modules.command.root,landmark=group(command,'extension / civic assembly hall'),landmarkFar=group(command,'extension / assembly silhouette');
  const architecture=new Batch('Assembly hall / beveled cladding and structural frames');
  const fine=new Batch('Assembly hall / galleries pipes handrails and plant');
  const coarse=new Batch('Assembly hall / distant masses');
  let disposed=false,detail='near';
  const sx=dimensions.width/120,sz=dimensions.depth/88;
  const lightPools=[];
  // A horizontal civic assembly hall behind the retained original headquarters.
  // Public terraces, a glazed chamber and exposed service structure replace spires.
  architecture.box([0,.2,-11],[23,.4,9],C.concrete,'concrete',.08);
  architecture.box([0,2.25,-11],[19,4.1,6.6],C.pale,'paint',.10);
  architecture.box([0,4.48,-11],[21,.35,8],C.pale,'paint',.08);
  architecture.box([0,4.75,-11],[16,.18,5.8],C.navy,'paint',.035);
  for(const side of [-1,1]){
    fine.box([0,2.5,-11+side*3.32],[17.8,2.8,.04],C.glass,'glass',.008);
    for(let x=-9;x<=9;x+=1.2){
      architecture.box([x,2.3,-11+side*3.5],[.18,4.1,.44],C.pale,'paint',.025);
      fine.box([x,4.3,-11+side*3.75],[.24,.08,.08],C.warm,'lamp',.01);
    }
    kit.rail(fine,[-9.5,4.7,-11+side*3.8],[9.5,4.7,-11+side*3.8],.24,.65);
    kit.ladder(fine,side*9.65,.2,-12,4.6,.22);
    kit.roofPlant(fine,side*6.8,4.85,-11,2.2,1.1);
    architecture.beam([side*7,2,-7.5],[side*7,2,-1.8],1.1,1.3,C.pale,'paint');
    fine.beam([side*7.55,2.15,-7.5],[side*7.55,2.15,-1.8],.04,.7,C.glass,'glass');
    for(let z=-7;z<-2;z+=1.2)architecture.ibeam([side*7,.1,z],[side*7,1.5,z],.12,.2,C.steel);
  }
  // The public entrance canopy has a light structural lattice, not a crown.
  for(let x=-9;x<=9;x+=1.5){
    architecture.beam([x,3.7,-7.5],[x,4.2,-5.9],.14,.2,C.steel);
    fine.pipe([x-.5,3.7,-7.5],[x+.5,4.2,-5.9],.018,C.alloy);
  }
  architecture.box([0,4.2,-5.9],[19.6,.16,.48],C.pale,'paint',.035);
  for(let x=-8.4;x<=8.4;x+=2.8)fine.box([x,4.35,-5.65],[.7,.12,.025],C.blueLight,'lamp',.015);
  coarse.box([0,2.3,-11],[21,4.6,8],C.pale,'paint',.06);
  architecture.finish(landmark);fine.finish(landmark);coarse.finish(landmarkFar);
  const civicBatch=new Batch('Expanded civic roads, plazas and transport connections');
  const road=(a,b,width=1.25)=>{
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);
    civicBatch.box([(a[0]+b[0])/2,.025,(a[1]+b[1])/2],[width,.04,length+.04],C.road,'concrete',0,[0,angle,0]);
    for(const side of [-1,1])civicBatch.box([(a[0]+b[0])/2+Math.cos(angle)*side*(width/2+.07),.06,(a[1]+b[1])/2-Math.sin(angle)*side*(width/2+.07)],[.10,.09,length+.05],C.concrete,'concrete',.008,[0,angle,0]);
    for(let f=.5;f<length;f+=.85)civicBatch.box([a[0]+dx*f/length,.049,a[1]+dz*f/length],[.025,.006,.32],C.pale,'paint',0,[0,angle,0]);
  };
  // Fill spaces opened by the source factory's size parameter using its own
  // detailed office/roof-plant/handrail generators, with original-size vehicles.
  const occupied=Object.values(city.modules).map(m=>({x:m.root.position.x,z:m.root.position.z,w:(m.bounds.max[0]-m.bounds.min[0])/2+1.4,d:(m.bounds.max[2]-m.bounds.min[2])/2+1.4}));
  occupied.push({x:0,z:-17,w:12,d:7},{x:0,z:17,w:12,d:16});
  const mainRoads=[{a:[-60,-23],b:[60,-23]},{a:[-60,21.6],b:[60,21.6]},{a:[14.4,-23],b:[14.4,21.6]},{a:[-14.4,-23],b:[-14.4,11.7]},{a:[-57,11.7],b:[-14.4,11.7]},{a:[-36.4,11.7],b:[-36.4,41]},{a:[14.4,2.36],b:[57,2.36]},{a:[0,10.5],b:[0,45]}];
  const segmentDistance=(x,z,{a,b})=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
  function connectEntry(x,z){const route=mainRoads.reduce((best,r)=>segmentDistance(x,z,r)<segmentDistance(x,z,best)?r:best),dx=route.b[0]-route.a[0],dz=route.b[1]-route.a[1],t=Math.max(0,Math.min(1,((x-route.a[0])*dx+(z-route.a[1])*dz)/(dx*dx+dz*dz))),end=[route.a[0]+dx*t,route.a[1]+dz*t];if(Math.hypot(end[0]-x,end[1]-z)>.05)road([x*sx,z*sz],[end[0]*sx,end[1]*sz],.9);}
  for(const module of Object.values(city.modules)){const p=module.anchors.entry.position;connectEntry(module.root.position.x+p[0],module.root.position.z+p[2]);}
  const placements=[[],[],[]];let added=1;
  for(let z=-37;z<=37;z+=8.2)for(let x=-51;x<=51;x+=8.5){
    if(occupied.some(o=>Math.abs(x-o.x)<o.w+2.8&&Math.abs(z-o.z)<o.d+2.1)||mainRoads.some(r=>segmentDistance(x,z,r)<4)||Math.abs(x)<10&&z>-24&&z<15)continue;
    const index=(Math.round(x*2+z*7)+seed>>>0)%3;
    placements[index].push({p:[x*sx,0,z*sz]});added++;connectEntry(x,z+2.7);
  }
  placements.forEach((items,index)=>{
    if(!items.length)return;
    const b=new Batch('Original CONTINUUM civic block '+index),f=new Batch('Civic silhouette '+index),h=2.3+index*1.25;
    kit.office(b,0,0,4.4,3.2,h,{color:index===1?C.pale:C.blueLight,floors:4+index*2});
    kit.ladder(b,2.3,.1,-.7,h+.1,.18);kit.rail(b,[-2,h+.2,-1.55],[2,h+.2,-1.55]);kit.planter(b,0,2.05,2.6,.35);
    f.box([0,h/2,0],[4.4,h,3.2],index===1?C.pale:C.blueLight,'paint',.02);
    kit.instance(b.geometry(),items,near,'CONTINUUM detailed civic block '+index);kit.instance(f.geometry(),items,far,'Civic silhouette '+index);
  });
  // Classical civic square translated to an orbital-age public space.
  const plaza=new Batch('Civic square / paving gardens benches and transit');
  plaza.box([0,.09,17],[22,.16,28],C.concrete,'concrete',.05);
  for(let x=-10;x<=10;x+=2)plaza.box([x,.175,17],[.025,.006,27],C.concreteDark,'concrete',0);
  for(let z=4;z<=30;z+=2)plaza.box([0,.175,z],[21,.006,.025],C.concreteDark,'concrete',0);
  for(const side of [-1,1])for(const z of [6,12,23,29]){
    kit.planter(plaza,side*9.2,z,1.5,2.1);
    plaza.box([side*7.7,.42,z],[.55,.12,1.8],C.pale,'paint',.035);
    for(const dz of [-.65,.65])plaza.box([side*7.7,.25,z+dz],[.3,.35,.16],C.steel,'steel',.015);
    plaza.pipe([side*10.4,.18,z],[side*10.4,1.8,z],.025,C.steel);
    plaza.box([side*10.4,1.8,z],[.16,.25,.16],C.blueLight,'lamp',.018);
    lightPools.push([side*9.7,.184,z,2.7,2.5,0xffc88f]);
  }
  for(const side of [-1,1])plaza.box([side*5.8,.183,17],[.032,.008,19],C.blueLight,'lamp',.002);
  // A planetarium globe and its navigation rings form the civic landmark.
  plaza.cyl([0,.35,17],2.9,.35,C.concreteDark,'concrete',64);
  plaza.cyl([0,.55,17],2.45,.12,C.pale,'paint',64);
  plaza.torus([0,.64,17],2.2,.045,C.blueLight,'lamp',[Math.PI/2,0,0],64);
  plaza.cyl([0,1.05,17],.48,.9,C.steel,'steel',32);
  plaza.ball([0,2.6,17],[1.15,1.15,1.15],C.blueLight,'glass');
  for(const angle of [0,Math.PI/3,-Math.PI/3])plaza.torus([0,2.6,17],1.23,.018,C.pale,'lamp',[Math.PI/2,angle,0],64);
  plaza.torus([0,2.6,17],1.75,.025,C.blueLight,'lamp',[.5,0,.25],64);
  lightPools.push([0,.184,17,4.2,4.2,0x76baff]);
  // Paired sheltered stops and small original-scale transport vehicles.
  for(const side of [-1,1]){
    plaza.box([side*7,.22,35],[4.8,.12,3],C.concrete,'concrete',.03);
    for(const x of [-1.9,1.9])plaza.pipe([side*7+x,.25,34],[side*7+x,1.8,34],.04,C.steel);
    plaza.box([side*7,1.85,35],[4.8,.12,2.6],C.pale,'paint',.05);
    plaza.box([side*7,1.1,34],[4.2,1.1,.03],C.glass,'glass',.008);
    plaza.box([side*7+1.8,1,35.5],[.45,1.5,.12],C.navy,'paint',.02);
    plaza.box([side*7+1.8,1.35,35.57],[.33,.6,.015],C.blueLight,'lamp',.005);
    plaza.box([side*7,1.78,35.6],[3.6,.025,.05],C.warm,'lamp',.005);
    lightPools.push([side*7,.287,35,3.1,2.1,0xffcc99]);
  }
  plaza.finish(streets,false);
  kit.instance(kit.vehicleGeometry(),[{p:[7,.15,37],r:[0,0,0]},{p:[-7,.15,37],r:[0,Math.PI,0]}],near,'Original CONTINUUM municipal service vehicles');
  if(connected)for(const points of COLONY_ROADS)for(let i=1;i<points.length;i++)road(points[i-1],points[i],1.5);
  if(connected&&gas)for(const points of [[[-74.5,-18],[-75.2,-18],[-75.2,-13]],[[-77.5,32.35],[-75.2,32.35],[-75.2,37]],[[77.5,-34.35],[75.2,-34.35],[75.2,-39]]])for(let i=1;i<points.length;i++)road(points[i-1],points[i],1.5);
  // Match the supplied original street-lamp positions, keeping their fixtures.
  const roadPool=(x,z)=>lightPools.push([x,city.heightAt(x,z)+.045,z,1.8,1.4,0xffc790]);
  for(let z=7.6;z<21;z+=2.6)for(const x of [-1.35,1.35])roadPool(x+.18,z*2*sz);
  for(let x=-26;x<=27;x+=4.2)for(const z of [-10.6,19.4])roadPool(x*2*sx+.18,z*2*sz);
  for(let z=-18;z<=18;z+=4.5)for(const x of [-27.38,27.38])roadPool(x*2*sx+.18,z*2*sz);
  if(connected)for(const points of COLONY_ROADS)for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    for(let d=2;d<len;d+=7){
      const x=a[0]+dx*d/len,z=a[1]+dz*d/len,px=x-dz/len*1.02,pz=z+dx/len*1.02;
      civicBatch.pipe([px,.08,pz],[px,1.75,pz],.024,C.steel);
      civicBatch.beam([px,1.75,pz],[x,1.72,z],.06,.08,C.pale,'paint');
      civicBatch.box([x,1.675,z],[.22,.024,.22],C.warm,'lamp',.004);
      lightPools.push([x,.052,z,2.6,2.6,0xffc790]);
    }
  }
  civicBatch.finish(streets,false);
  if(gas){const deck=new Batch('Suspended capital foundation');deck.box([0,-.8,0],[dimensions.width+3,1.5,dimensions.depth+3],C.dark,'steel',.15);for(let x=-50;x<=50;x+=10){deck.ibeam([x,-2,-42],[x,-2,42],.7,1.2);for(const z of [-35,0,35])deck.beam([x-4,-.8,z],[x,-3,z],.25,.3,C.steel);}deck.finish(additions);}
  const fullState=new Map();
  for(const [key,module] of Object.entries(city.modules))module.root.userData.buildingId=CAPITAL_DISTRICTS[key].id;
  function apply(){
    near.visible=detail!=='far';far.visible=detail==='far';const state=city.getModuleState('command');
    landmark.visible=detail!=='far'&&state.construction>=.22;landmarkFar.visible=detail==='far';landmarkFar.scale.y=.08+.92*state.construction;
    for(const [key,extra] of fullState)if(extra.upgrading&&detail!=='far')city.modules[key].root.getObjectByName('construction').visible=true;
  }
  city.setModuleState=(key,state={})=>{const before=fullState.get(key);if(before&&Object.keys(state).every(k=>before[k]===state[k]))return;fullState.set(key,{...before,...state});originalSet(key,state);apply();};
  const nightMaterials=installColonyNightMaterials({THREE:T,root:city.root,palette:C});
  const groundLighting=createColonyLightPools({THREE:T,parent:additions,pools:lightPools});
  city.update=(dt=0,opts={})=>{detail=opts.detail||'near';originalUpdate(dt,opts);additions.visible=opts.visible!==false;nightMaterials.update(opts.nightStrength??0);groundLighting.update(opts.nightStrength??0,opts.visible!==false&&detail!=='far');apply();};
  city.dispose=()=>{if(disposed)return;disposed=true;groundLighting.dispose();nightMaterials.dispose();kit.dispose(additions,[landmark,landmarkFar]);originalDispose();};
  const bounds=new T.Box3().setFromObject(city.root,true);city.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};
  city.modules.command.bounds={min:[-12,-.1,-16],max:[12,6,8]};
  city.views.whole={eye:[124,100,140],target:[0,3,-2],up:[0,1,0]};city.views.administration={eye:[23,16,43],target:[0,1,10],up:[0,1,0]};city.views.command=city.views.administration;
  city.meta={...city.meta,name:'CONTINUUM / 太空市政中心',version:CAPITAL_VERSION,source:'CONTINUUM-离线预览 (3).html',retainedOriginalModules:10,addedBuildings:added,nightLighting:{sourceWindows:true,sourceLamps:true,pools:groundLighting.count,realLights:0},city:{...city.meta.city,buildingCount:city.meta.city.buildingCount+added},views:city.views};
  // Keep geometries used by either the common extension or the attached landmark.
  const used=new Set();for(const owner of [additions,landmark,landmarkFar])owner.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of kit.geometries)if(!used.has(g)){g.dispose();kit.geometries.delete(g);}
  city.update(0);return city;
}
