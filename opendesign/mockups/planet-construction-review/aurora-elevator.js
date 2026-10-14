// AURORA space elevator. Insert inside the original renderer IIFE, after its
// geometry helpers. Everything uses the same ivory / slate / amber palette.
// GPU buffers are built once; animated parts only update their model matrices.
function elevatorTerminalModel(){
 const a=[];
 box(a,[0,.13,0],[1.50,.18,1.22],C.dark);
 box(a,[0,.235,0],[1.43,.035,1.15],C.roof);
 for(const side of [-1,1]){
  block(a,[side*.59,.44,.10],[.40,.42,.76]);
  box(a,[side*.59,.67,.10],[.35,.035,.62],C.gold);
  box(a,[side*.41,.80,-.16],[.14,1.06,.22],C.ivory);
  box(a,[side*.41,.93,-.035],[.08,.58,.026],C.dark);
  beam(a,[side*.68,.26,-.39],[side*.41,1.28,-.16],.048,C.roof);
  box(a,[side*.24,.43,.24],[.28,.30,.018],C.black);
  for(let j=0;j<4;j++)box(a,[side*.24,.33+j*.075,.254],[.24,.016,.012],C.gold);
  box(a,[side*.24,1.37,0],[.14,.08,.22],C.roof);
 }
 box(a,[0,1.30,-.16],[.96,.16,.29],C.ivory);
 box(a,[0,1.405,-.16],[.55,.050,.24],C.gold);
 box(a,[0,.51,-.38],[.49,.48,.23],C.roof);
 box(a,[0,.60,-.504],[.38,.065,.012],C.teal,[0,0,0],.5);
 box(a,[0,.27,.60],[.52,.035,.34],C.base);
 for(let j=0;j<4;j++)box(a,[(j-1.5)*.125,.294,.59],[.045,.012,.30],C.gold);
 for(const x of [-.68,.68])antenna(a,x,.68,-.18,.30);
 return a;
}

// Surface shipyard becomes a shipment depot. No hull, engines or launch pad.
function shipyardLogisticsModel(){
 const a=[];
 block(a,[0,.38,-.19],[1.37,.62,.72]);
 box(a,[0,.735,-.19],[1.45,.09,.79],C.roof);
 for(const x of [-.43,0,.43]){
  box(a,[x,.32,.18],[.30,.36,.018],C.black);
  for(let j=0;j<5;j++)box(a,[x,.18+j*.065,.194],[.28,.014,.012],C.gold);
  box(a,[x,.56,.202],[.25,.024,.02],C.teal,[0,0,0],.4);
 }
 box(a,[0,.095,.51],[1.52,.10,.40],C.dark);
 for(const x of [-.52,-.28,.22,.46]){
  const h=x<0?.19:.28;
  box(a,[x,.15+h/2,.51],[.19,h,.28],x<0?C.base:C.metal);
  for(const s of [-1,1])box(a,[x+s*.061,.15+h/2,.655],[.015,h*.88,.012],C.gold);
 }
 for(const x of [-.80,.80]){
  box(a,[x,.63,.28],[.10,1.12,.14],C.ivory);
  beam(a,[x,.20,-.13],[x,.98,.28],.025,C.roof);
 }
 box(a,[0,1.20,.28],[1.75,.13,.19],C.roof);
 box(a,[-.24,1.11,.28],[.29,.095,.25],C.gold);
 beam(a,[-.24,1.08,.28],[-.24,.79,.28],.012,C.dark);
 box(a,[-.24,.77,.28],[.21,.045,.19],C.gold);
 antenna(a,.54,.80,-.33,.35);
 return a;
}

function elevatorBounds(a){
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<a.length;i+=STRIDE)for(let j=0;j<3;j++){min[j]=Math.min(min[j],a[i+j]);max[j]=Math.max(max[j],a[i+j]);}
 return {min,max};
}

function createSpaceElevator(b){
 if(b.elevator)return b.elevator;
 const fixed=[],station=[],wire=[],cabin=[],cargo=[],keel=[],panels=[],arm=[],joint=[],spark=[];
 const stationCenter=[0,5.60,0],lowerHeight=1.37,upperHeight=4.84;
 const cableEndpoints=[-.24,.24].map(x=>({bottom:[x,lowerHeight,0],top:[x,upperHeight,0]}));
 for(const cable of cableEndpoints){
  beam(fixed,cable.bottom,cable.top,.027,C.ivory,6);
  beam(fixed,add(cable.bottom,[0,0,-.065]),add(cable.top,[0,0,-.065]),.009,C.gold,5);
  for(const y of [lowerHeight,upperHeight])box(fixed,[cable.bottom[0],y,0],[.16,.11,.21],C.roof);
 }
 // Tapered underside takes the twin rails into the orbiting dock's transfer hub.
 cyl(station,[0,4.90,0],.37,.17,C.roof,8,[0,0,0],.51);
 box(station,[0,5.035,0],[.95,.15,.70],C.ivory);
 box(station,[0,5.125,0],[1.18,.045,.72],C.gold);
 for(const s of [-1,1]){
  beam(station,[s*.26,4.91,0],[s*1.14,5.28,0],.085,C.ivory,6);
  box(station,[s*.75,5.21,0],[.36,.10,.36],C.roof);
 }
 // Icon-inspired twin armored dock spines: open central bay, segmented shoulders,
 // dog-legged perimeter ribs, cranes and exposed service decks, not a torus.
 for(const s of [-1,1]){
  box(station,[s*1.27,5.43,0],[.52,.40,2.98],C.dark);
  box(station,[s*1.27,5.71,0],[.47,.16,2.82],C.ivory);
  box(station,[s*1.53,5.40,0],[.055,.15,2.45],C.glass);
  for(let j=0;j<5;j++){
   const z=(j-2)*.56;
   box(station,[s*1.34,5.80,z],[.39,.09,.42],j%2?C.roof:C.ivory);
   box(station,[s*1.58,5.41,z],[.12,.29,.26],C.roof);
   box(station,[s*1.65,5.47,z],[.026,.04,.12],C.gold,[0,0,0],.7);
   box(station,[s*1.06,5.86,z],[.055,.09,.35],C.gold);
  }
  for(const z of [-1.32,0,1.32]){
   beam(station,[s*1.39,5.29,z],[s*1.64,5.95,z],.095,C.roof,4);
   beam(station,[s*1.64,5.95,z],[s*1.26,6.33,z],.10,C.ivory,4);
   beam(station,[s*1.26,6.33,z],[s*.90,6.42,z],.07,C.ivory,4);
   box(station,[s*1.63,5.94,z],[.16,.21,.21],C.gold);
   box(station,[s*1.36,5.24,z],[.40,.14,.24],C.base);
  }
  // Folded radiators and comms shelves make the station broader than the terminal.
  box(station,[s*1.91,5.44,.57],[.55,.08,1.18],C.roof);
  for(let j=0;j<5;j++)box(station,[s*1.91,5.493,.12+j*.22],[.43,.024,.09],C.glass);
  beam(station,[s*1.42,5.27,.94],[s*2.16,5.43,.94],.04,C.ivory);
  box(station,[s*1.34,6.06,-.88],[.26,.44,.34],C.roof);
  antenna(station,s*1.34,6.29,-.88,.39);
  box(station,[s*1.50,5.70,-1.42],[.30,.34,.19],C.ivory);
  box(station,[s*1.50,5.74,-1.524],[.19,.06,.02],C.teal,[0,0,0],.5);
 }
 for(const z of [-1.32,1.32]){
  box(station,[0,6.42,z],[1.95,.13,.20],C.roof);
  for(const x of [-.60,0,.60])box(station,[x,6.50,z],[.27,.035,.13],C.gold);
  box(station,[0,5.26,z],[2.75,.12,.25],C.roof);
  for(const x of [-.84,.84])box(station,[x,5.37,z],[.12,.06,.27],C.gold);
 }
 // Rear control bridge / windows; the forward aperture remains completely open.
 block(station,[0,6.14,1.42],[1.13,.37,.45],C.ivory);
 box(station,[0,6.165,1.183],[.83,.10,.015],C.glass,[0,0,0],.25);
 antenna(station,.34,6.35,1.44,.27);
 box(station,[0,5.71,1.62],[.66,.18,.20],C.dark);
 for(const x of [-.19,.19])box(station,[x,5.71,1.726],[.09,.05,.014],C.teal,[0,0,0],.6);
 append(fixed,station,ident());
 // Two rail-hugging lift cabins; their outer windows and cargo rack face the viewer.
 box(cabin,[0,0,.065],[.29,.35,.24],C.ivory);
 box(cabin,[0,.035,.193],[.22,.12,.018],C.glass,[0,0,0],.3);
 box(cabin,[0,.215,.058],[.34,.06,.29],C.roof);
 box(cabin,[0,-.215,.058],[.34,.06,.29],C.roof);
 for(const y of [-.14,.14])box(cabin,[0,y,-.073],[.12,.05,.09],C.gold);
 box(cabin,[0,-.095,.20],[.22,.025,.025],C.gold);
 box(cargo,[0,0,.068],[.17,.09,.15],C.metal);
 for(const x of [-.057,.057])box(cargo,[x,0,.15],[.012,.083,.014],C.gold);
 // Station-only ship skeleton points through the open forward gate (-Z).
 box(keel,[0,5.70,-.08],[.18,.15,2.28],C.dark);
 for(let j=0;j<6;j++){
  const z=-.92+j*.35,w=j<2?.48:.68;
  box(keel,[0,5.75,z],[w,.065,.10],C.roof);
  for(const s of [-1,1])beam(keel,[s*w/2,5.73,z],[s*w*.31,5.98,z],.025,C.ivory,5);
 }
 append(keel,cylgeo(0,.17,.37,4),trs([0,5.75,-1.37],[-PI/2,0,PI/4]),C.ivory);
 for(const x of [-.26,.26]){
  cyl(keel,[x,5.78,.93],.14,.40,C.roof,8,[PI/2,0,0]);
  cyl(keel,[x,5.78,1.138],.10,.02,C.black,8,[PI/2,0,0]);
 }
 for(let j=0;j<6;j++){
  const p=[],z=-.94+j*.34,w=j<2?.39:.64;
  for(const s of [-1,1]){
   box(p,[s*w*.37,5.82,z],[w*.48,.14,.275],C.ivory,[0,0,s*-.17]);
   box(p,[s*w*.59,5.77,z],[.045,.13,.25],j%2?C.roof:C.base);
  }
  if(j===3){box(p,[0,5.98,z],[.27,.12,.38],C.roof);box(p,[0,6.01,z-.198],[.20,.052,.014],C.glass);}
  panels.push(upload(p));
 }
 cyl(arm,[0,.5,0],.047,1,C.gold,6);
 cyl(joint,[0,0,0],.075,.09,C.roof,8,[PI/2,0,0]);
 sphere(spark,[0,0,0],[.045,.045,.045],C.white,1.4);
 for(const cable of cableEndpoints)for(const p of [cable.bottom,cable.top])pushv(wire,p,[0,0,1],C.teal,.6);
 const corners=[[-1.66,5.22,-1.53],[1.66,5.22,-1.53],[1.66,6.46,-1.53],[-1.66,6.46,-1.53],[-1.66,5.22,1.65],[1.66,5.22,1.65],[1.66,6.46,1.65],[-1.66,6.46,1.65]];
 for(const [i,j] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])for(const k of [i,j])pushv(wire,corners[k],[0,1,0],C.teal,.5);
 const e={b,lowerHeight,upperHeight,stationCenter,stationWorldCenter:pt(b.m,stationCenter),
  cableEndpoints,cables:cableEndpoints.map(c=>({bottom:pt(b.m,c.bottom),top:pt(b.m,c.top)})),
  bounds:elevatorBounds(fixed),stationBounds:elevatorBounds(station),source:fixed,
  geo:upload(fixed),wire:upload(wire,gl.LINES),cabin:upload(cabin),cargo:upload(cargo),
  keel:upload(keel),panels,arm:upload(arm),joint:upload(joint),spark:upload(spark),
  clock:0,lastTime:null,rate:1,phase:'龙骨定位',buildProgress:.16,
  actors:[{kind:'lift',lane:-.24,offset:0,position:[-.24,1.65,0],phase:'上行',cargo:1},{kind:'lift',lane:.24,offset:.5,position:[.24,4.55,0],phase:'下行',cargo:0}],
  arms:[],recommendedView:{target:[0,3.8,0],direction:[4,2,-6],stationTarget:[0,5.7,0]}};
 e.stationCenterWorld=e.stationWorldCenter;
 e.snapshot=()=>spaceElevatorSnapshot(e);
 b.elevator=e;return e;
}

function updateSpaceElevator(e,time){
 const state=e.b.state;
 e.rate=state==='lowpower'?.35:state==='upgrade'?.7:state==='active'?1:0;
 if(e.lastTime!==null)e.clock+=Math.max(0,time-e.lastTime)*e.rate;
 e.lastTime=time;
 e.buildProgress=clamp(.16+e.clock/70,.16,.94);
 if(e.gameQueue!==undefined){
  const q=e.gameQueue,now=e.gameNow||Date.now();
  e.buildProgress=q?clamp((now-q.start)/Math.max(1,q.end-q.start),.04,1):0;
 }
 e.phase=state==='unbuilt'?'等待建造':state==='construction'?'铺设缆索与船坞框架':state==='paused'?'电梯与船坞暂停':state==='full'?'等待货运仓位':e.buildProgress<.35?'龙骨定位':e.buildProgress<.63?'舷侧装甲拼装':e.buildProgress<.90?'推进段与舰桥对接':'总装检查';
 for(const a of e.actors){
  const t=(e.clock/22+a.offset)%1;
  let h,phase;
  if(t<.08){h=1.66;phase='地面装载';}
  else if(t<.45){h=mix(1.66,4.52,smooth(.08,.45,t));phase='上行运料';}
  else if(t<.58){h=4.52;phase='轨道卸料';}
  else if(t<.95){h=mix(4.52,1.66,smooth(.58,.95,t));phase='下行返回';}
  else{h=1.66;phase='地面装载';}
  a.position=[a.lane,h,0];a.worldPosition=pt(e.b.m,a.position);
  a.phase=e.rate?phase:'停靠等待';a.cargo=t<.50?1:0;
 }
 e.arms=[-1,1].map((side,i)=>{
  const panelIndex=Math.max(0,Math.floor(e.buildProgress*6-.65)-i);
  const z=-.94+panelIndex*.34+Math.sin(e.clock*.65+i*PI)*.055;
  return {base:[side*1.03,5.86,z],elbow:[side*.83,6.22,z+.10],tip:[side*(panelIndex<2?.18:.30),5.89,z],panelIndex,welding:e.rate>0&&(e.gameQueue===undefined||!!e.gameQueue)};
 });
 return e;
}

function spaceElevatorSnapshot(e){
 return {state:e.b.state,clock:e.clock,rate:e.rate,phase:e.phase,buildProgress:e.buildProgress,
  lowerHeight:e.lowerHeight,upperHeight:e.upperHeight,stationCenter:[...e.stationCenter],
  stationCenterWorld:[...e.stationCenterWorld],bounds:e.bounds,stationBounds:e.stationBounds,
  rails:e.cableEndpoints.map(c=>({bottom:[...c.bottom],top:[...c.top]})),
  cables:e.cables.map(c=>({bottom:[...c.bottom],top:[...c.top]})),
  cabins:e.actors.map(a=>({lane:a.lane,position:[...a.position],worldPosition:pt(e.b.m,a.position),phase:a.phase,cargo:a.cargo})),
  arms:e.arms.map(a=>({base:[...a.base],elbow:[...a.elbow],tip:[...a.tip],panelIndex:a.panelIndex,welding:a.welding})),
  camera:e.recommendedView};
}

function drawSpaceElevator(e,time,shadowPass=false){
 updateSpaceElevator(e,time);
 const b=e.b,s=b.state,dim=['paused','full','lowpower'].includes(s)?1:0;
 if(s==='unbuilt'){if(!shadowPass)draw(e.wire,b.m,.35);return;}
 if(s==='construction'){
  draw(e.geo,b.m,1,0,mix(e.lowerHeight,e.bounds.max[1],clamp(b.progress||0,0,1)));
  if(!shadowPass)draw(e.wire,b.m,.28);
  return;
 }
 draw(e.geo,b.m,1,dim);if(e.gameQueue===undefined||e.gameQueue)draw(e.keel,b.m,1,dim);
 for(let i=0;i<e.panels.length;i++){
  const fitted=smooth(i/e.panels.length,(i+.65)/e.panels.length,e.buildProgress);
  if(fitted>0)draw(e.panels[i],mm(b.m,trs([0,(1-fitted)*.20,0])),1,dim);
 }
 for(const a of e.actors){
  const m=mm(b.m,trs(a.position));draw(e.cabin,m,1,dim);
  if(a.cargo)draw(e.cargo,mm(m,trs([0,-.05,0])),1,dim);
 }
 for(const a of e.arms){
  for(const [p,q] of [[a.base,a.elbow],[a.elbow,a.tip]]){
   const m=mm(frame(norm(sub(q,p)),p),trs([0,0,0],[0,0,0],[1,len(sub(q,p)),1]));
   draw(e.arm,mm(b.m,m),1,dim);
  }
  for(const p of [a.base,a.elbow])draw(e.joint,mm(b.m,trs(p)),1,dim);
  if(a.welding&&!shadowPass){
   const pulse=.50+.50*Math.pow(Math.sin(e.clock*31),2);
   draw(e.spark,mm(b.m,trs(a.tip,[0,0,0],[pulse,pulse,pulse])),1);
  }
 }
 if(s==='upgrade'&&!shadowPass)draw(e.wire,b.m,.22);
}
