import {THREE,builder,chamfer,robotArm,tree} from './primitives.js';
import {loft,blockHull,arcBand,conduit,robotUnit,conveyor} from './forms.js';
import {PI,deck,airlock,solarWing,capsule,servicePod,hangar,vessel,crystal,dish,rover,dockingCollar,radiator} from './space-parts.js';

function command(g,b){
  if(b.id==='main'){
    deck(g,b);for(const x of[-12,12])capsule(g,x,1,7.3,20,4.8);capsule(g,0,-8,24,7.2,5.2);capsule(g,0,-2,16,12,6.7);
    g.dome([0,6.35,-2],[5.5,2.8,4.8],'glass');arcBand(g,6.1,5.4,.86,6.5,.35,0,PI*2,'ivory');
    for(const x of[-5.5,5.5]){g.box([x,7.4,-2],[.7,2,5.4],'white');g.box([x,8.45,-2],[.75,.15,4.6],'gold');}
    g.box([0,5.0,4.1],[10,1.6,.25],'glass');g.box([0,6.0,4.7],[12,.4,2.1],'ivory');airlock(g,0,5.2,3,3.4);dockingCollar(g,0,8.5,2.2,.6);return;
  }
  if(b.id==='antenna'){deck(g,b);g.cylinder([0,4.8,0],.62,9,'roof');for(const y of[3,6.5,9.5]){g.ring([0,y,0],2.5,.18,'ivory');g.cylinder([0,y,0],.85,.6,'gold');}for(const x of[-2.2,2.2])g.box([x,8,0],[.6,5,.5],'glass');g.cylinder([0,11.6,0],.3,.7,'energy');return;}
  if(b.id==='meeting'){deck(g,b);capsule(g,0,0,b.w*.95,b.d*.92,3.3);g.dome([0,3.0,0],[b.w*.32,1.8,b.d*.34],'clearGlass');airlock(g,0,b.d*.47,2.4);return;}
  servicePod(g,b,['data','archive'].includes(b.id)?'data':'habitat');
}
function extraction(g,b){
  deck(g,b);const h=b.h;crystal(g,0,0,1.55,h*.60,.5);dockingCollar(g,0,0,3,.6);
  for(let i=0;i<3;i++){const a=i*PI*2/3,x=Math.cos(a)*2.6,z=Math.sin(a)*2.6;g.beam([x,.5,z],[x*.75,h*.77,z*.75],.3,'ivory');g.beam([x*.75,h*.77,z*.75],[x*.22,h*.69,z*.22],.18,'gold');g.sphere([x*.23,h*.69,z*.23],[.25,.25,.25],'energy');}g.ring([0,h*.85,0],1.6,.16,'roof');
}
function crystalCampus(g,b){
  if(b.id.startsWith('extract'))return extraction(g,b);
  if(b.id==='purify'){
    deck(g,b);for(const [i,x]of[-9,0,9].entries()){
      capsule(g,x,-4,8,12,4.4);g.cylinder([x,1.1,3],3.2,1.4,'roof');crystal(g,x,3,1.4,5.4,1.8);g.cylinder([x,4.5,3],2.6,5.4,'clearGlass');dockingCollar(g,x,3,2.8,7.4);
      for(const dx of[-2.8,2.8])g.beam([x+dx,.6,3],[x+dx*.85,8.5,3],.24,'ivory');g.box([x,8.6,3],[6.1,.45,1.1],'white');
    }conveyor(g,[-14,8],[14,8],1.9,.9);return;
  }
  if(b.id==='sort'){
    deck(g,b);for(const x of[-6,0,6]){
      conveyor(g,[x,-6.4],[x,6.4],3.1,1.1);for(const z of[-4.8,4.8])crystal(g,x,z,.65,1.3,1.25);
      for(const z of[-2.6,2.6]){for(const dx of[-1.9,1.9])g.beam([x+dx,.5,z],[x+dx*.8,4.8,z],.19,'ivory');g.box([x,4.9,z],[4.2,.35,.65],'white');g.box([x,4.6,z],[2.6,.18,.3],'energy');}
      g.box([x,5.15,0],[3.5,.13,4.6],'clearGlass');crystal(g,x,0,1.1,2.8,1.35);g.ring([x,3.1,0],1.5,.12,'gold');g.cylinder([x,5.6,-2.6],.65,.8,'glass');
      for(const dx of[-1.8,1.8])g.box([x+dx,1.5,0],[.38,1.6,12.6],'roof');
    }conveyor(g,[-10,7.6],[10,7.6],1.1,.9);return;
  }
  if(['storage','repair'].includes(b.id))return hangar(g,b,{cargo:b.id==='storage',rover:b.id==='repair'});
  servicePod(g,b,b.id==='lab'?'data':'utility');
}
function gasCampus(g,b){
  if(b.id.startsWith('collector')){
    deck(g,b);g.cylinder([0,1.4,0],3.8,2.1,'ivory');g.cylinder([0,3.1,0],2.6,2.0,'glass');g.ring([0,4.5,0],3.7,.45,'roof');g.ring([0,4.7,0],3.0,.18,'energy');
    for(const x of[-4.3,4.3]){g.box([x,2.9,0],[1,5.2,5.2],'ivory');g.box([x,5.5,0],[1.4,.5,5.8],'gold');}g.cylinder([0,5.8,0],.4,1.5,'gold');return;
  }
  if(b.id==='separator'){
    deck(g,b);capsule(g,0,-6,25,10,4.7);for(const x of[-8,0,8])vessel(g,x,3,3.2,8.5,{bands:3});conduit(g,[[-11,1.4,9],[11,1.4,9]],.35,'gold');for(const x of[-8,0,8])conduit(g,[[x,1.4,9],[x,1.4,3],[x,7.5,3]],.16);return;
  }
  if(b.id.startsWith('compressor')){deck(g,b);for(const x of[-3.5,3.5]){g.cylinder([x,2.4,0],1.65,6.8,'ivory',[PI/2,0,0]);g.ring([x,2.4,3.5],1.55,.15,'gold',[0,0,0]);g.cylinder([x,2.4,3.65],1.0,.2,'glass',[PI/2,0,0]);}conduit(g,[[-5.5,.7,-3.5],[-5.5,4.5,-3.5],[5.5,4.5,-3.5],[5.5,.7,-3.5]],.24);return;}
  if(b.id.startsWith('tank')){deck(g,b);vessel(g,0,0,3.8,b.h-.15,{bands:3});return;}
  if(b.id==='load'){deck(g,b);for(const x of[-9,0,9]){vessel(g,x,0,2.4,4.5);g.box([x,5.2,0],[5.4,.35,9],'ivory');for(const z of[-4.5,4.5])g.beam([x,.4,z],[x,5.2,z],.18,'gold');}return;}
  servicePod(g,b,b.id==='control'?'data':'utility');
}
function solarCampus(g,b){
  if(b.id.startsWith('solar')){
    g.cylinder([0,1.2,0],.48,2.4,'roof');g.cylinder([0,2.3,0],.8,.4,'gold');solarWing(g,0,0,12.7,10.6,2.7,-.15);for(const x of[-4.5,4.5])g.beam([0,.4,0],[x,2.5,0],.15,'ivory');return;
  }
  if(b.id==='battery'){
    deck(g,b);capsule(g,0,-3,31,9,4.6);for(const x of[-11,-5.5,0,5.5,11]){g.cylinder([x,2.8,3],1.9,4.8,'roof');g.cylinder([x,3.1,3],1.48,4.5,'glass');for(const y of[1.3,3.0,4.7])g.ring([x,y,3],1.9,.13,'ivory');g.cylinder([x,5.9,3],2.0,.65,'white');g.cylinder([x,6.5,3],.75,.5,'energy');}return;
  }
  if(b.id==='switch'||b.id.startsWith('combiner')){deck(g,b);radiator(g,0,0,b.w*.85,b.d*.8,b.h-.15);return;}
  servicePod(g,b,b.id==='control'?'data':'utility');
}
function fusion(g,b){
  if(b.id.startsWith('reactor')){
    deck(g,b);const poly=chamfer(0,0,23,23,5.5);loft(g,[[.4,poly],[2.5,poly.map(([x,z])=>[x*.9,z*.9])],[3.1,poly.map(([x,z])=>[x*.74,z*.74])]],['ivory','roof'],'roof');
    g.ring([0,4.7,0],7.6,1.4,'glass');g.ring([0,4.7,0],7.6,.45,'energy');
    for(let i=0;i<8;i++){const a=i*PI/4,x=Math.cos(a)*7.6,z=Math.sin(a)*7.6;g.ring([x,4.9,z],2.0,.44,'ivory',[0,PI/2-a,0]);g.box([x,7.2,z],[1.5,.5,1.5],'gold');}
    g.cylinder([0,5.7,0],2.4,5.1,'roof');g.cylinder([0,6.0,0],1.9,5.5,'energy');g.cylinder([0,9,0],3.4,.65,'ivory');dockingCollar(g,0,0,3.3,9.5);return;
  }
  if(b.id.startsWith('cool')){deck(g,b);radiator(g,0,0,b.w*.94,b.d*.84,b.h-.2);return;}
  if(b.id==='convert'){deck(g,b);for(const x of[-9,0,9]){capsule(g,x,-2,8,12,5.8);g.cylinder([x,3.2,6],2.9,.6,'gold',[PI/2,0,0]);g.cylinder([x,3.2,6.5],1.6,.45,'glass',[PI/2,0,0]);}conduit(g,[[-14,6.3,-4],[14,6.3,-4]],.25,'steel');return;}
  if(b.id.startsWith('grid')){deck(g,b);for(const x of[-3,3])vessel(g,x,0,1.6,4.4,{color:'roof'});g.box([0,4.7,0],[10,.4,.9],'gold');return;}
  servicePod(g,b,b.id==='control'?'data':'utility');
}
function nanite(g,b){
  if(b.id==='clean'){
    deck(g,b);const poly=chamfer(0,0,37,25,5),scaled=(sx,sz)=>poly.map(([x,z])=>[x*sx,z*sz]);
    loft(g,[[.45,poly],[1.8,poly],[4.9,scaled(.97,.96)],[7.65,scaled(.81,.72)]],['roof','ivory','clearGlass'],'clearGlass');
    for(const x of[-16,16])for(const z of[-8.5,8.5])g.beam([x,.6,z],[x*.86,7.7,z*.94],.26,'ivory');
    for(const z of[-8.7,8.7])g.box([0,7.75,z],[28,.25,.55],'ivory');
    g.cylinder([0,1.1,0],7.7,1.25,'roof');g.cylinder([0,2.25,0],2.2,1.7,'steel');g.cylinder([0,4.0,0],6.7,.38,'glass');g.ring([0,4.25,0],6.45,.14,'gold');
    for(let i=-4;i<=4;i++){const span=2*Math.sqrt(5.9**2-(i*1.15)**2);g.box([i*1.15,4.22,0],[.07,.045,span],'teal');g.box([0,4.23,i*1.15],[span,.045,.07],'teal');}
    for(const x of[-12,12]){for(const z of[-5,5])vessel(g,x,z,2.4,5.4,{color:'roof'});robotArm(g,x*.65,0,1.2,2.1,-Math.sign(x));g.cylinder([x,7.75,0],1.5,.45,'ivory');g.cylinder([x,8.03,0],1.05,.13,'gold');}
    capsule(g,0,11,12,5.5,3.5,{glass:false});airlock(g,0,13.4,2.8,3.4);return;
  }
  if(b.id==='prep'){deck(g,b);capsule(g,-4,0,10,18,4.7);for(const z of[-5,4])vessel(g,5,z,2.4,5.3);return;}
  if(b.id==='pack'||b.id==='inspect'){deck(g,b);for(const x of[-b.w*.28,b.w*.28]){capsule(g,x,-1,b.w*.43,b.d*.88,b.h-.3);g.box([x,b.h*.6,b.d*.4],[b.w*.25,b.h*.35,.16],'clearGlass');}conveyor(g,[-b.w*.44,b.d*.42],[b.w*.44,b.d*.42],1.1,.7);return;}
  if(b.id==='store')return hangar(g,b,{cargo:true});
  if(b.id==='gas'){deck(g,b);vessel(g,0,0,b.w*.38,b.h-.1);return;}
  if(b.id==='change'){deck(g,b);capsule(g,0,0,b.w*.96,b.d*.92,b.h-.12);for(const x of[-9,0,9])airlock(g,x,b.d*.46,2.5,2.6);return;}
  servicePod(g,b,b.id==='water'?'utility':'data');
}
function radar(g,b){
  if(b.id==='dish'||b.id.startsWith('array'))return dish(g,b);
  if(b.id==='data'){deck(g,b);capsule(g,0,-4,34,11,5.3);for(const x of[-12,0,12]){capsule(g,x,4,9,10,4.2);solarWing(g,x,4,6.5,4.5,4.5);g.cylinder([x,5.4,-4],1.2,1.3,'glass');g.ring([x,6.1,-4],1.5,.15,'ivory');}return;}
  if(b.id==='calibration'){deck(g,b);dockingCollar(g,0,0,4.7,.7);g.box([0,1.6,0],[5,.5,5],'glass');for(const x of[-3.5,3.5])g.box([x,1.7,0],[.4,2.6,.4],'ivory');g.box([0,2.9,0],[7.5,.25,.35],'gold');return;}
  if(b.id==='repair')return hangar(g,b,{rover:true});servicePod(g,b,'data');
}
function logistics(g,b){
  if(b.id.startsWith('container')){deck(g,b);for(const y of[.55,1.98])for(const x of[-2.1,2.1]){g.box([x,y+.6,0],[3.7,1.18,5.2],'ivory');g.box([x,y+.7,2.65],[2.8,.7,.08],'roof');for(const z of[-2,0,2])g.box([x,y+1.23,z],[3.9,.16,.22],'gold');}return;}
  if(b.id==='loading'){
    deck(g,b);for(const x of[-b.w*.43,b.w*.43])for(const z of[-6.4,6.4])g.box([x,2.9,z],[1,5.4,1],'ivory');for(const z of[-6.4,6.4])g.box([0,5.6,z],[b.w*.91,.65,.8],'roof');g.box([0,5.6,0],[2,.7,14],'gold');g.box([0,4.5,0],[3.2,1.1,2.2],'steel');for(const x of[-12,0,12])capsule(g,x,0,8,9,2.8,{glass:false});return;
  }
  if(['warehouse1','warehouse2','cold','precision','repair'].includes(b.id)){hangar(g,b,{cargo:true});if(b.id==='cold')for(const x of[-7,0,7])g.cylinder([x,b.h-.5,-4],1.1,.7,'glass');return;}
  servicePod(g,b,b.id==='control'?'data':'utility');
}
function shuttle(g,y=0,s=1){
  const poly=[[-3,-10],[3,-10],[4.5,-2],[3,6],[0,11],[-3,6],[-4.5,-2]].map(([x,z])=>[x*s,z*s]);loft(g,[[y,poly],[y+1.7*s,poly],[y+3.1*s,poly.map(([x,z])=>[x*.6,z*.83])]],['ivory','roof'],'roof');g.box([0,y+2.7*s,4*s],[3*s,.5*s,5*s],'glass');
  for(const x of[-6.3,6.3]){g.extrude(chamfer(x*s,-2*s,5*s,7*s,1),.4*s,y+.6*s,'white');g.cylinder([x*s,y+1.3*s,-5*s],1*s,3*s,'roof',[PI/2,0,0]);g.cylinder([x*s,y+1.3*s,-6.6*s],.65*s,.12*s,'energy',[PI/2,0,0]);}
}
function shipyard(g,b){
  if(b.id==='base'){
    deck(g,b);const poly=chamfer(0,0,27,27,6);loft(g,[[.45,poly],[3,poly.map(([x,z])=>[x*.88,z*.88])],[4.3,poly.map(([x,z])=>[x*.62,z*.62])]],['ivory','roof'],'roof');
    for(const x of[-3.8,3.8])for(const z of[-3.8,3.8]){g.beam([x,3,z],[x*.65,30,z*.65],.65,'ivory');g.beam([x*.65,30,z*.65],[x*2.4,32,z*2.4],.35,'gold');}g.cylinder([0,17,0],1.8,27,'roof');g.cylinder([0,17,0],.6,27,'energy');
    for(const y of[7,14,22,29])dockingCollar(g,0,0,4.4,y);g.extrude(chamfer(0,0,28,27,3),1,31,'roof');g.box([0,32.1,0],[23,.2,24],'concrete');
    for(const x of[-12,12]){g.box([x,35.7,0],[1.1,7.4,23],'ivory');g.box([x,39.5,0],[1.6,.7,24],'roof');}for(const z of[-9,9])g.box([0,39.4,z],[25,.5,.7],'gold');shuttle(g,32.6,.85);airlock(g,0,13,3.1,3.4);return;
  }
  if(b.id==='assembly'){hangar(g,b,{cargo:false});for(const x of[-12,0,12]){g.box([x,3.1,0],[5,3.7,8],'ivory');g.cylinder([x,4.7,0],2.0,.7,'gold');robotArm(g,x-3.1,3,.6,2.2);}return;}
  if(b.id==='hangar'){hangar(g,b,{cargo:false});shuttle(g,.75,.65);return;}
  if(b.id==='cargo')return hangar(g,b,{cargo:true});servicePod(g,b,b.id==='control'?'data':'utility');
}
function supportBase(g,b){
  if(b.id==='main'){hangar(g,b,{rover:true});g.box([0,6.8,0],[31,.7,1],'gold');for(const x of[-12,12])g.box([x,3.5,0],[.75,6.4,.75],'ivory');g.box([0,5.7,0],[2,1.3,1.5],'steel');return;}
  if(b.id==='vehicle'){deck(g,b);rover(g,-4,0,.85);rover(g,5,0,.85);for(const x of[-9,9])g.box([x,2.5,-4],[.7,4.2,.8],'ivory');g.box([0,4.7,-4],[19,.5,1.3],'roof');return;}
  if(b.id==='test'){deck(g,b);for(const x of[-6,0,6]){g.box([x,.75,0],[4.2,.9,6],'roof');g.box([x,1.3,0],[3.5,.2,5.5],'gold');}rover(g,0,0,.65);return;}
  if(b.id.startsWith('reserve')&&b.id!=='reserveControl'){deck(g,b);const poly=chamfer(0,0,10,10,2.5);loft(g,[[.5,poly],[2.5,poly.map(([x,z])=>[x*.75,z*.75])],[2.8,poly.map(([x,z])=>[x*.7,z*.7])]],['concrete','roof'],'roof');for(const x of[-1.5,1.5])g.box([x,2.94,0],[2.7,.24,5.2],'ivory');g.box([0,3.10,0],[.12,.05,5.3],'gold');airlock(g,0,4.6,1.8,2.5);return;}
  if(['parts','tools','wash'].includes(b.id))return hangar(g,b,{cargo:b.id!=='wash',rover:b.id==='wash'});servicePod(g,b,b.id==='dispatch'?'data':'utility');
}
function biodome(g,b){
  deck(g,b);g.extrude(chamfer(0,0,b.w*.86,b.d*.85,2),.15,.5,'green');const rx=b.w*.46,rz=b.d*.46,h=b.h-.8;g.dome([0,.75,0],[rx,h,rz],'clearGlass');arcBand(g,rx,rz,.95,.55,.3,0,PI*2,'ivory');
  for(let j=0;j<2;j++)for(let i=1;i<=12;i++){const a=(i-1)*PI/12,c=i*PI/12,P=t=>j?[0,.75+Math.sin(t)*h,Math.cos(t)*rz]:[Math.cos(t)*rx,.75+Math.sin(t)*h,0];g.beam(P(a),P(c),.13,'white');}
  for(const x of[-rx*.5,rx*.5])for(const z of[-rz*.37,rz*.37]){g.box([x,.85,z],[rx*.6,.5,rz*.5],'ivory');g.box([x,1.15,z],[rx*.54,.1,rz*.45],'green');tree(g,x,z,1.2,2.2);}airlock(g,0,rz,2.3,2.8);
}
function terraformer(g,b){
  if(b.id.startsWith('plot'))return biodome(g,b);
  if(b.id.startsWith('climate')){
    deck(g,b);const h=b.h;g.cylinder([0,1.3,0],5.3,1.8,'ivory');g.cylinder([0,h*.5,0],2.3,h*.8,'glass');for(const k of[.32,.55,.78]){g.cylinder([0,h*k,0],4.4,.35,'roof');g.ring([0,h*k+.2,0],4.1,.16,'teal');}g.dome([0,h*.84,0],[2.6,h*.12,2.6],'white');for(const x of[-5.6,5.6])g.beam([x,.5,0],[x*.65,h*.72,0],.45,'ivory');return;
  }
  if(b.id.startsWith('water')){deck(g,b);for(const x of[-b.w*.25,b.w*.25]){g.cylinder([x,1.2,0],b.d*.34,1.6,'ivory');g.cylinder([x,2.05,0],b.d*.29,.1,'glass');g.box([x,2.4,0],[b.d*.65,.22,.45],'steel');g.cylinder([x,2.7,0],.35,.65,'gold');}return;}
  if(b.id==='control'){
    deck(g,b);arcBand(g,15.8,11.6,.64,.5,1.0,0,PI*2,'roof');arcBand(g,15.6,11.4,.66,1.5,2.8,0,PI*2,'glass');arcBand(g,15.7,11.5,.65,4.3,.55,0,PI*2,'ivory');
    for(let i=0;i<10;i++){const a=i*PI/5;g.beam([Math.cos(a)*15.4,.5,Math.sin(a)*11.2],[Math.cos(a)*15.4,4.8,Math.sin(a)*11.2],.18,'white');}
    g.cylinder([0,1.5,0],6.9,2,'roof');g.dome([0,2.5,0],[8,5.5,8],'clearGlass');g.cylinder([0,3.0,0],2,2,'steel');g.sphere([0,5.1,0],[2.6,2.6,2.6],'teal');g.ring([0,5.1,0],3.5,.18,'gold',[PI*.3,0,PI*.2]);
    for(const x of[-8,8])g.beam([x,2.5,0],[x*.5,8,0],.25,'ivory');g.box([0,8.2,0],[8.6,.3,.65],'white');capsule(g,0,10.3,7,4.8,3.5);airlock(g,0,12.1,2.7,3.2);return;
  }
  if(b.id==='works')return hangar(g,b,{rover:true});servicePod(g,b,b.id==='lab'?'data':'utility');
}
const draw={Command_Center:command,Crystal_Mine:crystalCampus,Gas_Mine:gasCampus,Solar_Plant:solarCampus,Fusion_Reactor:fusion,Nanite_Factory:nanite,Radar_Facility:radar,Alliance_Depot:logistics,Shipyard:shipyard,Missile_Silo:supportBase,Terraformer:terraformer};
const orientedHalls={Crystal_Mine:['storage','repair'],Nanite_Factory:['store'],Radar_Facility:['repair'],Alliance_Depot:['warehouse1','warehouse2','cold','precision','repair'],Shipyard:['cargo','assembly','hangar'],Missile_Silo:['main','parts','tools','wash'],Terraformer:['works']};
export function createSpaceBuilding(b,p,mats){
  const root=new THREE.Group();root.name=b.id;const g=builder(root,mats),oriented=orientedHalls[p.id]?.includes(b.id),sideways=oriented&&['e','w'].includes(b.door);draw[p.id](g,sideways?{...b,w:b.d,d:b.w}:b);g.finish();if(oriented)root.rotation.y={s:0,e:PI/2,n:PI,w:-PI/2}[b.door||'s'];root.userData={building:b,form:`${p.id}/${b.id}`,conceptVersion:'space-campuses-20261018',motion:[]};
  function motion(pos,kind,draw){const o=new THREE.Group(),mg=builder(o,mats);draw(mg);mg.finish();o.position.fromArray(pos);root.add(o);root.userData.motion.push({object:o,kind,phase:0});}
  if(p.id==='Gas_Mine'&&b.id.startsWith('collector'))motion([0,4.5,0],'scan',mg=>{for(let i=0;i<6;i++){const a=i*PI/3;mg.beam([Math.cos(a)*.6,0,Math.sin(a)*.6],[Math.cos(a+.3)*2.9,0,Math.sin(a+.3)*2.9],.16,'gold');}});
  if(p.id==='Radar_Facility'&&b.id==='dish')motion([0,b.h*.8,0],'scan',mg=>{mg.box([0,0,0],[4,.2,.4],'gold');mg.box([2,.2,0],[.5,.4,.5],'energy');});
  if(p.id==='Shipyard'&&b.id==='base')motion([0,12,0],'lift',mg=>{mg.box([0,0,0],[7,2.4,7],'ivory');for(const x of[-3.6,3.6])mg.box([x,0,0],[.15,1.5,5.5],'glass');});
  return root;
}
