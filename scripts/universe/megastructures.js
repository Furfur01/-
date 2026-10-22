import {createEvolvedDyson} from './dyson-evolution.js';
import {createArsenalModel,arsenalKinds} from './arsenal-models.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createDyson,createGate,createShipyard,createHabitat,createExtractor,createListener,mergeStaticMachinery} from './megastructure-factories.js';
import {logisticsGatePose} from './logistics-layout.js';
import {createIndustry,industryFocus,INDUSTRY_RADIUS,INDUSTRY_FOCUS_RADIUS,INDUSTRY_SCALE} from './asteroid-industry.js';

const SCALE=100,TAU=Math.PI*2;
const factories={...Object.fromEntries(arsenalKinds.map(id=>[id,()=>createArsenalModel(id)])),dyson:createEvolvedDyson,gate:createGate,shipyard:createShipyard,habitat:createHabitat,extractor:createExtractor,listener:createListener,industry:createIndustry};
const offsets={laser:[0,0,0],accelerator:[0,0,0],missile:[125,24,-70],antimatterPlant:[-85,-12,60],gate:[-34,46,-43],dyson:[0,0,0],extractor:[32,8,-24],shipyard:[70,12,70],listener:[-110,20,-95],industry:[0,0,0]};
const scales={laser:12,accelerator:12,missile:10,antimatterPlant:18,gate:12,extractor:15,shipyard:20,listener:14,industry:INDUSTRY_SCALE};
const radii={laser:90,accelerator:200,missile:250,antimatterPlant:52,gate:58,dyson:96,extractor:66,shipyard:112,listener:72,industry:INDUSTRY_RADIUS,habitat:57};
const names={laser:'戴森棱镜阵列',accelerator:'恒星电子加速器',missile:'相对论导弹发射舰',antimatterPlant:'反物质合成设施',gate:'星门',dyson:'戴森云 / 戴森球',extractor:'恒星资源提取器',shipyard:'巨构船坞',listener:'深空监听阵列',industry:'小行星工业带',habitat:'环轨居住带'};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const clamp=v=>Math.max(0,Math.min(1,v));
const extractorAxis=new T.Vector3(32,8,-24).normalize();
const extractorRotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0),extractorAxis);

function machinery(){
 const group=new T.Group(),dark=new T.MeshStandardMaterial({color:0x243342,metalness:.82,roughness:.45}),edge=new T.MeshStandardMaterial({color:0x586776,metalness:.8,roughness:.4}),light=new T.MeshBasicMaterial({color:0x53e4ef,toneMapped:false});
 const box=(size,at,mat=dark,parent=group)=>{const o=new T.Mesh(new T.BoxGeometry(...size),mat);o.position.fromArray(at);parent.add(o);return o;};
 const ring=(radius,tube,at,mat=edge,parent=group)=>{const o=new T.Mesh(new T.TorusGeometry(radius,tube,5,48),mat);o.position.fromArray(at);o.rotation.x=Math.PI/2;parent.add(o);return o;};
 return {group,dark,edge,light,box,ring};
}

function distantModel(id){
 if(id==='industry')return createIndustry(false);
 const {group,box,ring,dark,edge,light}=machinery();
 // At system scale these are silhouettes, not unlit metallic miniatures.
 dark.metalness=.25;dark.color.setHex(0x536371);dark.emissive.setHex(0x14212c);
 edge.metalness=.25;edge.color.setHex(0x8394a2);edge.emissive.setHex(0x263a48);
 if(id==='dyson'){for(let i=0;i<3;i++){const r=ring(53+i*11,.7,[0,0,0]);r.rotation.set(.3+i*.7,.1,i*.32);}}
 else if(id==='habitat'){ring(35,2.2,[0,0,0]);ring(35,.15,[0,2.2,0],light);}
 else if(id==='gate'){const r=ring(31,3,[0,0,0]);r.rotation.x=0;const l=ring(27,.35,[0,0,2],light);l.rotation.x=0;box([18,30,6],[0,-40,0]);}
 else if(id==='shipyard'){for(const x of [-60,-23,23,60])box([4,6,144],[x,-12,0],edge);for(const z of [-60,0,60])box([126,3,3],[0,22,z]);box([32,5,100],[0,-3,0]);}
 else if(id==='listener'){box([12,18,12],[0,3,0]);const dish=new T.Mesh(new T.SphereGeometry(18,12,6,0,TAU,0,1.15),edge);dish.position.y=14;dish.rotation.z=.5;group.add(dish);box([1,28,1],[0,26,0],light);}
 else if(id==='laser'){for(let i=0;i<3;i++){const r=ring(32+i*18,1,[0,0,0],light);r.rotation.x=i*.6;}box([8,8,60],[0,0,55]);}
 else if(id==='accelerator'){ring(178,3,[0,0,0]);ring(178,.5,[0,1,0],light);box([40,5,8],[150,0,90]);}
 else if(id==='missile'){box([454,24,42],[0,0,0]);for(const z of [-55,55])box([320,30,25],[-45,0,z]);for(let i=0;i<10;i++){const r=ring(8,.9,[-77+i*29,16.8,0],light);r.rotation.set(0,Math.PI/2,0);}}
 else if(id==='antimatterPlant'){box([30,80,30],[0,0,0]);for(let i=0;i<5;i++)ring(25,1.5,[0,-30+i*15,0],light);}
 else if(id==='extractor'){box([65,12,15],[0,0,0]);for(const x of [-25,-10,10,25]){const r=ring(10,.6,[x,0,0],light);r.rotation.set(0,Math.PI/2,0);}}
 if(id==='dyson')for(let i=0;i<3;i++){const r=ring(53+i*11,.32,[0,0,0],light);r.rotation.set(.3+i*.7,.1,i*.32);}
 if(id==='shipyard'){
  for(const x of [-60,60])box([.6,.8,140],[x,-8,0],light);
  const triangle=new T.LineLoop(new T.BufferGeometry().setFromPoints([new T.Vector3(-12,0,-48),new T.Vector3(0,19,-48),new T.Vector3(12,0,-48)]),new T.LineBasicMaterial({color:0x53e4ef,toneMapped:false}));group.add(triangle);
 }
 mergeStaticMachinery(group);return {group,setProgress(){},update(){},parts:[]};
}

export function createMegastructures({scene,camera,shipEnvironment,onError=console.error}){
 const root=new T.Group();root.name='stellar-megastructures';scene.add(root);
 const entries=new Map(),resourceRefs=new Map(),loader=new GLTFLoader(),models=new Map(),modelLoads=new Map(),failedModels=new Set();
 const scratch=new T.Vector3(),bounds=new T.Sphere(),frustum=new T.Frustum(),matrix=new T.Matrix4();
 let suppressed=null;
 let state={},records=[],previewRecord=null,focused=null,showRange=false,disposed=false,frame=0,displayTargets=[];
 const markerGeometry=new T.BufferGeometry(),markerMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:'attribute float strength; attribute float selected; varying float vStrength; varying float vSelected; void main(){vStrength=strength;vSelected=selected;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=(selected>.5?11.:7.)*'+Math.min(globalThis.devicePixelRatio||1,2).toFixed(1)+';}',
  fragmentShader:'varying float vStrength; varying float vSelected; void main(){vec2 p=gl_PointCoord-.5;float r=length(p);float ring=smoothstep(.48,.36,r)*smoothstep(.22,.30,r);float core=(1.-smoothstep(.05,.15,r))*.6;gl_FragColor=vec4(mix(vec3(.30,.72,.78),vec3(.65,.95,1.),vSelected),max(ring,core)*vStrength);}' });
 const markers=new T.Points(markerGeometry,markerMaterial);markers.name='megastructure-distant-markers';markers.frustumCulled=false;root.add(markers);
 const rangeRoot=new T.Group();rangeRoot.name='listener-coverage';root.add(rangeRoot);
 const coverageMaterial=new T.LineBasicMaterial({color:0x54dbe4,transparent:true,opacity:.65,depthWrite:false});
 const ringPoints=Array.from({length:193},(_,i)=>new T.Vector3(Math.cos(i/192*TAU),0,Math.sin(i/192*TAU)));
 const coverage=new T.Line(new T.BufferGeometry().setFromPoints(ringPoints),coverageMaterial);rangeRoot.add(coverage);
 const contacts=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:0xffc777,size:5,sizeAttenuation:false,depthWrite:false}));rangeRoot.add(contacts);
 rangeRoot.visible=false;
 // Reflection maps belong to WorldRuntime and are shared with the normal ship viewer.
 function refs(object,delta){const resources=new Set();object.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){resources.add(m);for(const [key,v] of Object.entries(m))if(key!=='envMap'&&v?.isTexture)resources.add(v);}});for(const r of resources){const n=(resourceRefs.get(r)||0)+delta;if(n>0)resourceRefs.set(r,n);else{resourceRefs.delete(r);r.dispose();}}}
 function remove(key){const e=entries.get(key);if(!e)return;e.group.removeFromParent();refs(e.group,-1);entries.delete(key);}
 function systemRecord(system,id,star){
  const scale=id==='laser'?star.radius/12:id==='dyson'||id==='accelerator'?star.radius/30:id==='extractor'?Math.max(4,Math.min(15,star.radius/45)):scales[id];
  const record={id:`${system.key}:${id}`,key:system.key,owner:system.owner,kind:id,type:'megastructure',name:system.ownerName?`${system.ownerName} · ${names[id]}`:names[id],galaxy:system.position[0],system:system.position[1],planet:system.host,position:add(star.position,offsets[id].map(v=>v*SCALE)),starPosition:star.position,radius:radii[id]*scale,scale,structure:system.structures[id],systemData:system};
  if(id==='gate')Object.assign(record,logisticsGatePose(star,(state.logistics||[]).find(c=>c.key===system.key)||system,state.logistics||[]));
  if(id==='industry'){record.focusPosition=industryPosition(record);record.focusRadius=INDUSTRY_FOCUS_RADIUS*scale;}
  if(id==='extractor'){
   const separation=star.radius+31*scale+Math.max(star.radius*.75,16*scale);
   record.position=add(star.position,extractorAxis.toArray().map(v=>v*separation));
   record.extractor={starRadius:star.radius/scale,starDistance:separation/scale,dysonRadius:star.radius*2.5/scale};
   record.boundsRadius=separation+star.radius*2.6;
   record.focusPosition=add(star.position,extractorAxis.toArray().map(v=>v*separation*.6));
   record.focusRadius=Math.max(record.radius,separation*.65+star.radius*.7);
  }
  return record;
 }
 function habitatRecord(habitat,p){const scale=p.radius/20;return {id:`${p.id}:habitat`,key:`${habitat.owner}:${p.coordinates[0]}:${p.coordinates[1]}`,owner:habitat.owner,kind:'habitat',type:'megastructure',name:habitat.ownerName?`${habitat.ownerName} · ${names.habitat}`:names.habitat,galaxy:p.coordinates[0],system:p.coordinates[1],planet:p.id,position:p.position.slice(),radius:radii.habitat*scale,scale,structure:habitat.structure||habitat};}
 function pickTargets(){return previewRecord?[...records,previewRecord]:records;}
 function clearPreview(){const previous=previewRecord;if(previous){previewRecord=null;remove(previous.id);if(focused===previous.id)focused=null;}return previous;}
 function previewCandidate({system,id,planet,key,owner}){
  const player=state.playerId;if(!player||!factories[id]||(owner&&owner!==player))return null;
  let record;
  if(id==='habitat'){
   const p=(state.planets||[]).find(p=>p.id===planet||p.key===planet),habitat=(state.megastructures?.habitats||[]).find(h=>h.owner===player&&h.planet===p?.id);
   if(!p||!habitat||!(state.ownedPlanets||[]).some(owned=>owned.id===p.id))return null;
   if(system&&(p.coordinates[0]!==Number(system[0])||p.coordinates[1]!==Number(system[1])))return null;
   record=habitatRecord(habitat,p);
  }else{
   const ownedSystem=(state.megastructures?.systems||[]).find(s=>s.owner===player&&s.position[0]===Number(system?.[0])&&s.position[1]===Number(system?.[1]));
   const star=(state.systems||[]).find(s=>s.id===ownedSystem?.position[1]);
   if(!ownedSystem?.structures[id]||!star||!(state.ownedPlanets||[]).some(p=>p.position[0]===ownedSystem.position[0]&&p.position[1]===ownedSystem.position[1]))return null;
   record=systemRecord(ownedSystem,id,star);
  }
  return key&&record.key!==key?null:record;
 }
 function preview(detail){
  const record=previewCandidate(detail);clearPreview();if(!record)return null;
  if(record.structure.level||record.structure.queue)return records.find(r=>r.id===record.id)||null;
  previewRecord={...record,preview:true,name:`${names[record.kind]} · 建造预览`,structure:{level:0}};return previewRecord;
 }
 function setState(next){
  state=next;const stars=new Map((state.systems||[]).map(s=>[s.id,s])),planets=new Map((state.planets||[]).flatMap(p=>[[p.id,p],[p.key,p]]));records=[];
  for(const system of state.megastructures?.systems||[]){const star=stars.get(system.position[1]);if(!star)continue;for(const [id,structure]of Object.entries(system.structures||{})){if(!factories[id]||id==='habitat'||!(structure.level||structure.queue))continue;records.push(systemRecord(system,id,star));}}
  for(const habitat of state.megastructures?.habitats||[]){const p=planets.get(habitat.planet),structure=habitat.structure||habitat;if(!p||!(structure.level||structure.queue))continue;records.push(habitatRecord(habitat,p));}
  if(previewRecord){const previous=previewRecord,next=previewCandidate({system:[previous.galaxy,previous.system],id:previous.kind,planet:previous.planet,key:previous.key,owner:previous.owner});if(!next||next.structure.level||next.structure.queue){const keepFocus=focused===previous.id&&!!next;clearPreview();if(keepFocus)focused=previous.id;}else previewRecord={...next,preview:true,name:previous.name,structure:{level:0}};}
  const keys=new Set(pickTargets().map(r=>r.id));for(const key of entries.keys())if(!keys.has(key))remove(key);
  const listener=state.megastructures?.listener;rangeRoot.visible=showRange&&!!listener?.level;
  if(listener?.level){const points=(listener.contacts||[]).flatMap(c=>c.position.map(v=>v*SCALE));contacts.geometry.dispose();contacts.geometry=new T.BufferGeometry();contacts.geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));}
 }
 function loadModel(lod){if(models.has(lod)||modelLoads.has(lod)||failedModels.has(lod))return;const task=loader.loadAsync(`/opendesign/mockups/galactic-command/assets/megastructures/devourer-${lod}.glb`).then(gltf=>{if(disposed){refs(gltf.scene,1);refs(gltf.scene,-1);return;}const reflection=shipEnvironment?.();gltf.scene.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){if(m.name==='Devourer_Triangle_Emission'){m.color.set(0);m.emissive.setRGB(.005,.8,1);m.emissiveIntensity=1;m.toneMapped=false;m.metalness=0;m.roughness=1;}else if(reflection){m.envMap=reflection;m.envMapIntensity=.8;}}});models.set(lod,gltf.scene);refs(gltf.scene,1);}).catch(error=>{failedModels.add(lod);if(!disposed)onError(new Error('深空吞噬者船坞模型加载失败：'+error.message));}).finally(()=>modelLoads.delete(lod));modelLoads.set(lod,task);}
 function makeGhost(item){
  // Use independent material but shared geometry: blueprints cannot recolour built facilities.
  item.setProgress(1);item.update(0,0,{progress:1,level:1,effectLevel:0,enabled:false});const ghost=item.group.clone(true),material=new T.MeshBasicMaterial({color:0x58dbea,transparent:true,opacity:.23,wireframe:true,depthWrite:false,toneMapped:false});ghost.name='megastructure-blueprint';
  ghost.traverse(o=>{if(o.userData.effect||o.isLine||o.isPoints||o.isSprite)o.visible=false;else if(o.isMesh){if((Array.isArray(o.material)?o.material:[o.material]).some(m=>m.isShaderMaterial))o.visible=false;else o.material=material;}});return ghost;
 }
 function buildMode(record){return record.preview?'preview':!record.structure.level&&record.structure.queue?'construction':'built';}
 function make(record,detailed){const item=record.kind==='extractor'?createExtractor({...record.extractor,detailed}):detailed?factories[record.kind]():distantModel(record.kind);if(record.kind==='industry'&&detailed){const reflection=shipEnvironment?.();if(reflection)item.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])if(m.isMeshStandardMaterial){m.envMap=reflection;m.envMapIntensity=.8;}});}if(detailed&&!arsenalKinds.includes(record.kind))mergeStaticMachinery(item.group);const group=new T.Group(),mode=buildMode(record);group.name=record.id;group.add(item.group);if(mode!=='built')group.add(makeGhost(item));item.group.visible=mode==='built'||mode==='construction'&&detailed;group.scale.setScalar(record.scale);if(record.kind==='extractor')group.quaternion.copy(extractorRotation);root.add(group);refs(group,1);const e={group,item,detailed,mode,last:frame,ship:null,lod:null,time:0};entries.set(record.id,e);return e;}
 function setShip(e,lod){if(e.lod===lod)return;loadModel(lod);const model=models.get(lod);if(!model)return;if(e.ship){e.ship.removeFromParent();refs(e.ship,-1);}const berth=e.item.group.getObjectByName('devourer-berth');if(!berth)return;const hull=model.clone(true);hull.name='devourer-under-construction';hull.scale.setScalar(4.5);hull.position.set(0,4.5,0);berth.add(hull);refs(hull,1);e.ship=hull;e.lod=lod;}
 function update({time,origin,eye,height,distance,dt=.016}){
  if(disposed)return;frame++;displayTargets=[];matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);for(const e of entries.values())e.group.visible=false;
  const now=Date.now()+(state.gameNowOffset||0),visible=[],farSystems=new Map(),markerRows=[];
  for(const r of pickTargets()){
   if(suppressed?.key===r.key&&suppressed.kind===r.kind)continue;
   if(r.kind==='industry')r.focusPosition=industryPosition(r);
   const relative=sub(r.position,origin);scratch.fromArray(sub(r.kind==='industry'?r.focusPosition:r.position,origin)).applyMatrix4(camera.matrixWorldInverse);
   // An off-centre collector can be in view while the centre of its belt is behind the camera.
   const projectedRadius=r.kind==='industry'?r.focusRadius/Math.max(r.focusRadius,scratch.length()):scratch.z<0?r.radius/-scratch.z:0;
   const pixels=projectedRadius*camera.projectionMatrix.elements[5]*height/2;
   bounds.center.fromArray(relative);bounds.radius=r.boundsRadius||r.radius;
   if(!pixels||!frustum.intersectsSphere(bounds))continue;
   const selected=focused===r.id||r.preview;
   if(pixels<3&&!selected){
    let cluster=farSystems.get(r.key);if(!cluster){cluster={r,pixels,count:0};farSystems.set(r.key,cluster);}cluster.count++;if(pixels>cluster.pixels){cluster.r=r;cluster.pixels=pixels;}
   }else if(pixels<3){markerRows.push({r,pixels,selected:true});displayTargets.push(displayRecord(r));}
   else visible.push({r,pixels,selected});
  }
  for(const {r,pixels,count}of farSystems.values()){
   const target={...r,id:'cluster:'+r.key,cluster:true,name:(r.systemData?.ownerName?r.systemData.ownerName+' · ':'')+'巨构群 · '+count+'座',position:r.starPosition||r.position,radius:Math.max(r.radius,1000)};
   markerRows.push({r:target,pixels,selected:false});displayTargets.push(target);
  }
  visible.sort((a,b)=>Number(b.selected)-Number(a.selected)||b.pixels-a.pixels);
  let details=0;
  for(const [index,{r,pixels,selected}]of visible.entries()){
   if(index>=64){markerRows.push({r,pixels,selected});displayTargets.push(displayRecord(r));continue;}
   let e=entries.get(r.id);const detailed=details<10&&(pixels>(e?.detailed?22:30)||selected&&pixels>16);if(detailed)details++;
   if(e&&(e.detailed!==detailed||e.mode!==buildMode(r))){const elapsed=e.time;remove(r.id);e=make(r,detailed);e.time=elapsed;}e??=make(r,detailed);
   e.group.position.fromArray(sub(r.position,origin));e.group.visible=true;e.last=frame;displayTargets.push(displayRecord(r));if(r.preview)continue;
   const q=r.structure.queue,progress=r.structure.level?1:q?clamp((now-q.start)/Math.max(1,q.end-q.start)):1;e.item.setProgress(progress);if(e.item.effects)e.item.effects.visible=progress>.7;
   const yard=r.kind==='shipyard'?r.systemData.shipyard:null;const running=!!r.structure.level&&!r.systemData?.dormant&&(!yard||(yard.powered&&!yard.paused&&(yard.active??yard.queue?.length>0)));if(running)e.time+=dt;
   e.item.update(running?dt:0,e.time,{progress,level:Math.max(1,r.structure.level),effectLevel:running?(detailed?2:1):0,enabled:running,dysonLevel:r.systemData?.structures.dyson?.level||0});
   if(r.kind==='shipyard'&&detailed){setShip(e,pixels>270?'near':'mid');if(e.ship)e.ship.visible=progress>.35;}
  }
  const capacity=pickTargets().length;
  if(!markerGeometry.attributes.position||markerGeometry.attributes.position.count<capacity){
   markerGeometry.dispose(); // Release replaced GPU attributes before growing the shared marker buffer.
   markerGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(capacity*3),3).setUsage(T.DynamicDrawUsage));
   markerGeometry.setAttribute('strength',new T.BufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage));
   markerGeometry.setAttribute('selected',new T.BufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage));
  }
  const attributes=markerGeometry.attributes;
  markerRows.forEach(({r,pixels,selected},i)=>{attributes.position.setXYZ(i,...sub(r.kind==='industry'&&!r.cluster?industryPosition(r):r.position,origin));attributes.strength.setX(i,selected?1:.3+.55*clamp(pixels/.8));attributes.selected.setX(i,selected?1:0);});
  for(const a of Object.values(attributes))a.needsUpdate=true;markerGeometry.setDrawRange(0,markerRows.length);markers.visible=markerRows.length>0;
  if(entries.size>72)for(const[key,e]of [...entries].filter(([,e])=>!e.group.visible).sort((a,b)=>a[1].last-b[1].last)){if(entries.size<=72)break;remove(key);}
  const listener=state.megastructures?.listener;rangeRoot.visible=showRange&&!!listener?.level;
  if(rangeRoot.visible){coverage.position.fromArray(sub(listener.center.map(v=>v*SCALE),origin));coverage.scale.setScalar(listener.radius*SCALE);contacts.position.fromArray(origin.map(v=>-v));coverage.material.opacity=.5+Math.sin(time)*.1;}
 }
 function focus({system,id,planet,key,owner,showRange:range=false}){const record=pickTargets().find(r=>r.kind===id&&(!key||r.key===key)&&(!owner||r.owner===owner)&&(id==='habitat'?r.planet===planet:r.system===Number(system?.[1])));if(previewRecord&&previewRecord.id!==record?.id)clearPreview();focused=record?.id||null;showRange=range&&record?.kind==='listener'&&record.owner===state.playerId&&!!record.structure.level;return record;}
 function industryPosition(r){return add(r.position,industryFocus(r.preview?0:entries.get(r.id)?.time||0).map(v=>v*r.scale));}
 function displayRecord(r){return r.kind==='industry'?{...r,position:industryPosition(r),radius:r.focusRadius}:r;}
 function followPosition(id){const r=pickTargets().find(r=>r.id===id&&r.kind==='industry');return r?industryPosition(r):null;}
 function dispose(){disposed=true;for(const key of [...entries.keys()])remove(key);for(const model of models.values())refs(model,-1);models.clear();markerGeometry.dispose();markerMaterial.dispose();coverage.geometry.dispose();coverageMaterial.dispose();contacts.geometry.dispose();contacts.material.dispose();root.removeFromParent();}
 return {suppress(value){suppressed=value;},setState,update,focus,followPosition,preview,clearPreview,dispose,hideRange(){focused=null;showRange=false;rangeRoot.visible=false;},get listener(){return state.megastructures?.listener;},get pickTargets(){return displayTargets;},get stats(){return {facilities:records.length,visible:displayTargets.length,detailed:[...entries.values()].filter(e=>e.group.visible&&e.detailed).length,markers:markerGeometry.drawRange.count,cached:entries.size,models:[...models.keys()],range:showRange,preview:previewRecord?.kind||null};}};
}

export function createMagnetarEffects(){
 const group=new T.Group();group.name='magnetar-field';const field=new T.Group();field.rotation.z=.42;group.add(field);
 const lines=new T.LineBasicMaterial({color:0x8ac5ff,transparent:true,opacity:.42,depthWrite:false,blending:T.AdditiveBlending});
 for(let i=0;i<10;i++){const points=[];for(let j=0;j<=64;j++){const a=.12+j/64*(Math.PI-.24),r=1.7+Math.sin(a)**2*2.7;points.push(new T.Vector3(Math.sin(a)*r*Math.cos(i/10*TAU),Math.cos(a)*1.8,Math.sin(a)*r*Math.sin(i/10*TAU)));}field.add(new T.Line(new T.BufferGeometry().setFromPoints(points),lines));}
 const jetMaterial=new T.ShaderMaterial({uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
  vertexShader:'varying vec3 vNormal; varying vec3 vEye; varying vec2 vUv; void main(){vec4 p=modelViewMatrix*vec4(position,1.); vNormal=normalize(normalMatrix*normal); vEye=-p.xyz; vUv=uv; gl_Position=projectionMatrix*p;}',
  fragmentShader:'uniform float uTime; varying vec3 vNormal; varying vec3 vEye; varying vec2 vUv; void main(){float edge=pow(abs(dot(normalize(vNormal),normalize(vEye))),2.); float fade=smoothstep(0.,.12,vUv.y)*pow(1.-vUv.y,1.3); float pulse=.8+.2*sin(vUv.y*25.-uTime*4.); gl_FragColor=vec4(.35,.72,1.,edge*fade*pulse*.45);}'
 });
 for(const sign of [-1,1])for(const width of [.6,.12]){const jet=new T.Mesh(new T.ConeGeometry(width,15,24,1,true),jetMaterial);jet.position.y=sign*8;jet.rotation.z=sign===1?0:Math.PI;field.add(jet);}
 return {group,update(time){field.rotation.y=time*.28;lines.opacity=.3+Math.sin(time*1.7)*.09;jetMaterial.uniforms.uTime.value=time;},dispose(){const resources=new Set();group.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});for(const r of resources)r.dispose();}};
}
