import * as T from 'three';
import galaxyLayout from '../../opendesign/mockups/planet-construction-review/galaxy-layout.json' with {type:'json'};
import {buildLogisticsData,buildPatrolData,auroraAsteroidGeometry,auroraCometPosition,strategyData,territoryGeometry,constellationLinks} from './environment-geometry.js';
import {createStellarMaterials,createStellarNoise,createBlackHoleMaterial,createSkyMaterial,createNpcMaterial,createGalaxyMaterial,createCometMaterial} from './environment-materials.js';

export {strategyData,territoryGeometry,constellationLinks} from './environment-geometry.js';
export const WORLD_SCALE=100;
export const blackHole={id:'gargantua',key:'gargantua',type:'blackHole',name:'银心',position:[0,0,0],radius:650,scale:250};
export const npcTypes={outpost:{level:2,color:'#d4c8b1',symbol:'裂',patrols:3},garrison:{level:3,color:'#f36350',symbol:'堡',patrols:4},charon:{level:4,color:'#c18aff',symbol:'芒',patrols:5},cargo:{level:1,color:'#aabed5',symbol:'仓',patrols:2},fracture:{level:5,color:'#45c9ff',symbol:'环',patrols:7}};
const ASSETS='/opendesign/mockups/planet-construction-review/assets/';
const NPC_ASSETS='/opendesign/mockups/galactic-command/assets/npc-planets/';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
const distance=(a,b)=>Math.hypot(...subtract(a,b));
const vec=a=>Array.isArray(a)||ArrayBuffer.isView(a)?a:[a?.x||0,a?.y||0,a?.z||0];
const starType=id=>[0,1,2,3,0][Math.abs(Number(id)||0)%5];
const starColor=id=>[[1,.62,.24],[.60,.73,1],[1,.39,.16],[.79,.85,1]][starType(id)];
export const starRadius=id=>[7,10,12,1.4,7][Math.abs(Number(id)||0)%5]*WORLD_SCALE;
export function galaxyPresentation(distance,aspect=1){
 const d=distance/WORLD_SCALE/Math.max(1,1/aspect),near=smooth(1600,6000,d),far=smooth(38000,75000,d);
 return {background:.06+.22*smooth(4000,30000,d)+.44*smooth(30000,110000,d),rings:smooth(2500,8000,d)*(1-far),points:near*(1-.2*far),links:near*(1-.55*far)};
}
export function logisticsPose(center,star){return {id:center.key,key:center.key,type:'logistics',name:'恒星系物流中心',position:star.position.map((v,i)=>v+[-34,26,-40][i]*WORLD_SCALE),radius:16*WORLD_SCALE,system:center.position[1]};}
export function npcPatrolPose(body,time,index=0){
 const count=npcTypes[body.npcType]?.patrols||0,angle=time*(.12+(index%3)*.025)+index*Math.PI*2/Math.max(1,count)+(body.coordinates?.[1]||0)*.37;
 const radius=body.radius*(1.95+(index%2)*.32),tilt=index%2?.42:-.28;
 return {position:body.position.map((v,k)=>v+[Math.cos(angle)*radius,Math.sin(angle)*Math.sin(tilt)*radius,Math.sin(angle)*Math.cos(tilt)*radius][k]),yaw:-angle,pitch:-Math.atan2(Math.cos(angle)*Math.sin(tilt),Math.hypot(Math.sin(angle),Math.cos(angle)*Math.cos(tilt)))};
}

/** Imported arrays remain immutable and are uploaded only once, using Three attributes. */
export function geometryFromInterleaved(array,stride=11){
 if(!(array instanceof Float32Array)||!array.length||array.length%stride||!array.every(Number.isFinite))throw new Error('Invalid environment mesh data');
 const geometry=new T.BufferGeometry(),buffer=new T.InterleavedBuffer(array,stride);
 geometry.setAttribute('position',new T.InterleavedBufferAttribute(buffer,3,0));
 geometry.setAttribute('normal',new T.InterleavedBufferAttribute(buffer,3,3));
 geometry.setAttribute('color',new T.InterleavedBufferAttribute(buffer,3,6));
 if(stride===12)geometry.setAttribute('emission',new T.InterleavedBufferAttribute(buffer,3,9));
 geometry.computeBoundingSphere();return geometry;
}
function linesGeometry(positions,colors){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));if(colors)geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();return geometry;}
function disposeObject(object,{geometry=true,material=true}={}){object.removeFromParent();object.traverse(o=>{if(geometry)o.geometry?.dispose();if(material)for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});}

/** Scene contributor. The host alone owns renderer, canvas, camera, loop and UI. */
export function createWorldEnvironment({scene,camera,onError=console.error}={}){
 if(!scene?.isScene||!camera?.isCamera)throw new TypeError('Environment requires the shared scene and camera');
 const root=new T.Group();root.name='universe-environment';scene.add(root);
 const controller=new AbortController(),resources=new Set(),npcGeometry=new Map(),npcPending=new Map(),npcFailed=new Set();
 const stars=new Map(),npcs=new Map(),scenery=new Map(),ports=new Map();
 let state={systems:[],planets:[],ownedPlanets:[],logistics:[]},systemsById=new Map(),planetsBySystem=new Map(),disposed=false,territoriesVisible=true,territorySignature='',markerSignature='',pickTargets=[],frame=0;
 const info={galaxy:{version:galaxyLayout.version,source:galaxyLayout.source,sourceSha256:galaxyLayout.sourceSha256,loaded:false,pointCount:0},stars:[],npcs:{loaded:[],pending:[],failed:[],visible:[],patrols:[]},logistics:[],territories:{regions:0,borders:0,components:[]},decorations:[]};
 const own=resource=>(resources.add(resource),resource);
 const unitSphere=own(new T.SphereGeometry(1,32,20)),stellarBound=own(new T.SphereGeometry(2.6,24,16)),blackBound=own(new T.SphereGeometry(18,32,20));
 const noise=own(createStellarNoise()),blackMaterial=own(createBlackHoleMaterial());
 const hole=new T.Mesh(blackBound,blackMaterial);hole.name='gargantua';hole.scale.setScalar(blackHole.scale);hole.frustumCulled=false;root.add(hole);
 const sky=new T.Mesh(unitSphere,own(createSkyMaterial()));sky.name='procedural-space-sky';sky.renderOrder=-1000;sky.frustumCulled=false;root.add(sky);
 const galaxyMaterial=own(createGalaxyMaterial()),catalogueGeometry=new T.BufferGeometry(),galaxy=new T.Points(catalogueGeometry,galaxyMaterial);galaxy.name='barred-galaxy-b';galaxy.frustumCulled=false;root.add(galaxy);own(catalogueGeometry);
 const markersMaterial=own(createGalaxyMaterial()),markers=new T.Points(new T.BufferGeometry(),markersMaterial);markers.name='selectable-systems';markers.frustumCulled=false;root.add(markers);
 const territoryRoot=new T.Group();territoryRoot.name='sovereign-voronoi';root.add(territoryRoot);
 let territoryData={cells:[],vertices:[],borders:[],regions:[]},links=null;
 const forward=new T.Vector3(),projection=new T.Vector3(),light=new T.Vector3(),eyeLocal=new T.Vector3(),frustum=new T.Frustum(),matrix=new T.Matrix4(),bounds=new T.Sphere();
 const patrolGeometry=own(geometryFromInterleaved(buildPatrolData())),patrolMaterial=own(new T.MeshStandardMaterial({vertexColors:true,metalness:.55,roughness:.48}));
 // Only local shader lighting is used for NPCs; the host supplies physical lights for facilities.
 const logisticsGeometry=Object.fromEntries(Object.entries(buildLogisticsData()).map(([k,v])=>[k,own(geometryFromInterleaved(v))]));
 const portMaterial=own(new T.MeshStandardMaterial({vertexColors:true,metalness:.55,roughness:.52})),trafficMaterial=portMaterial;
 const asteroidData=auroraAsteroidGeometry(),asteroidBuffer=new T.InterleavedBuffer(asteroidData,7),asteroidGeometry=own(new T.BufferGeometry());
 asteroidGeometry.setAttribute('position',new T.InterleavedBufferAttribute(asteroidBuffer,3,0));asteroidGeometry.setAttribute('color',new T.InterleavedBufferAttribute(asteroidBuffer,3,3));asteroidGeometry.computeBoundingSphere();
 const tailPositions=[],tailColors=[],tailFade=[];for(let i=0;i<=420;i++){const t=i/420;tailPositions.push(t,i?Math.sin(i*2.39996)*Math.sqrt((i%17)/17):0,i?Math.cos(i*2.39996)*.6:0);tailColors.push(...(i?[.40,.72,1]:[.8,.94,1]));tailFade.push(i?Math.pow(1-t,1.8)*.56:1);}
 const tailGeometry=own(linesGeometry(tailPositions,tailColors));tailGeometry.setAttribute('fade',new T.Float32BufferAttribute(tailFade,1));
 const dustGeometry=own(tailGeometry.clone());dustGeometry.setAttribute('color',new T.Float32BufferAttribute(tailColors.map((v,i)=>[.82,.69,.46][i%3]),3));dustGeometry.setAttribute('fade',new T.Float32BufferAttribute(tailFade.map(v=>v*.42),1));

 // Keep one material owner for every delayed program until world disposal.
 // Clones below use these exact flags, so eviction of visible objects cannot
 // release the final compiled program and reintroduce a navigation compile stall.
 const beltMaterial=own(new T.MeshBasicMaterial({vertexColors:true,transparent:true}));
 const orbitMaterial=own(new T.LineBasicMaterial({color:0x708994,transparent:true,opacity:.13,depthWrite:false}));
 const portLightMaterial=own(new T.MeshBasicMaterial({color:0x4ddbb5}));
 const territoryFillMaterial=own(new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));
 const territoryBorderMaterial=own(new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.76,depthWrite:false}));
 const linksMaterial=own(new T.LineBasicMaterial({color:0x73989f,transparent:true,opacity:.25,depthWrite:false}));
 const warmStars=createStellarMaterials(noise);own(warmStars.surface);own(warmStars.corona);
 const warmNpc=own(createNpcMaterial()),warmComet=own(createCometMaterial(1)),warmDust=own(createCometMaterial(2));
 const colorProbe=own(linesGeometry([0,0,0,1,0,0,0,1,0],[1,1,1,1,1,1,1,1,1]));
 const lineProbe=own(linesGeometry([0,0,0,1,0,0]));
 const pointProbe=own(linesGeometry([0,0,0],[1,1,1]));pointProbe.setAttribute('star',new T.Float32BufferAttribute([3,1],2));
 const npcProbe=own(geometryFromInterleaved(new Float32Array([
  0,0,0,0,0,1,1,1,1,0,0,0,
  1,0,0,0,0,1,1,1,1,0,0,0,
  0,1,0,0,0,1,1,1,1,0,0,0
 ]),12));
 // This is a detached object group, not another world or a render pass. The host
 // calls renderer.compileAsync(prewarmRoot, camera, scene) before starting draw.
 const prewarmRoot=new T.Group();prewarmRoot.name='environment-prewarm';
 const warm=(name,object)=>{object.name=name;prewarmRoot.add(object);};
 warm('sky',new T.Mesh(unitSphere,sky.material));warm('black-hole',new T.Mesh(blackBound,blackMaterial));
 warm('galaxy',new T.Points(pointProbe,galaxyMaterial));warm('system-markers',new T.Points(pointProbe,markersMaterial));
 warm('stellar-surface',new T.Mesh(stellarBound,warmStars.surface));warm('stellar-corona',new T.Mesh(stellarBound,warmStars.corona));
 warm('npc',new T.Mesh(npcProbe,warmNpc));warm('patrol',new T.Mesh(patrolGeometry,patrolMaterial));
 warm('logistics',new T.Mesh(logisticsGeometry.frame,portMaterial));warm('logistics-lights',new T.Mesh(logisticsGeometry.lights,portLightMaterial));
 warm('asteroids',new T.Mesh(asteroidGeometry,beltMaterial));
 warm('comet-tail',new T.Points(tailGeometry,warmComet));warm('comet-dust',new T.Points(dustGeometry,warmDust));
 warm('orbit-guides',new T.LineSegments(lineProbe,orbitMaterial));
 warm('territory-fill',new T.Mesh(colorProbe,territoryFillMaterial));warm('territory-borders',new T.LineSegments(colorProbe,territoryBorderMaterial));
 warm('constellations',new T.LineSegments(lineProbe,linksMaterial));

 const report=(label,error)=>{if(!disposed&&error?.name!=='AbortError')onError(new Error(`${label}: ${error?.message||error}`,{cause:error}));};
 const ready=fetch(ASSETS+'galaxy-barred-b.points.bin',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.arrayBuffer();}).then(data=>{
  if(disposed)return;if(data.byteLength!==galaxyLayout.pointCount*20)throw Error('Galaxy B catalogue length mismatch');
  const source=new Float32Array(data),positions=new Float32Array(galaxyLayout.pointCount*3),points=new Float32Array(galaxyLayout.pointCount*2),colors=new Float32Array(galaxyLayout.pointCount*3).fill(1);
  for(let i=0;i<galaxyLayout.pointCount;i++){for(let j=0;j<3;j++)positions[i*3+j]=source[i*5+j]*WORLD_SCALE;points[i*2]=source[i*5+3];points[i*2+1]=source[i*5+4];}
  catalogueGeometry.setAttribute('position',new T.BufferAttribute(positions,3));catalogueGeometry.setAttribute('star',new T.BufferAttribute(points,2));catalogueGeometry.setAttribute('color',new T.BufferAttribute(colors,3));info.galaxy.loaded=true;info.galaxy.pointCount=galaxyLayout.pointCount;
 }).catch(error=>{info.galaxy.error=error.message;report('棒旋星图加载失败',error);});

 function loadNpc(type){
  if(npcGeometry.has(type)||npcPending.has(type)||npcFailed.has(type))return;
  const pending=fetch(NPC_ASSETS+type+'.bin?v=1',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.arrayBuffer();}).then(data=>{if(disposed)return;const a=new Float32Array(data);if(a.length%36)throw Error('Invalid NPC triangle stream');npcGeometry.set(type,own(geometryFromInterleaved(a,12)));}).catch(error=>{if(error.name!=='AbortError'){npcFailed.add(type);report('野怪模型加载失败 '+type,error);}}).finally(()=>npcPending.delete(type));npcPending.set(type,pending);
 }
 function relative(object,position,origin){object.position.set(position[0]-origin[0],position[1]-origin[1],position[2]-origin[2]);}
 function projected(position,radius,origin,height){projection.fromArray(subtract(position,origin)).applyMatrix4(camera.matrixWorldInverse);const depth=-projection.z;return depth>0?radius/depth/Math.tan(camera.fov*Math.PI/360)*height/2:0;}
 function visible(position,radius,origin){bounds.center.fromArray(subtract(position,origin));bounds.radius=radius;return frustum.intersectsSphere(bounds);}
 function makeStar(system){
  const materials=createStellarMaterials(noise,starType(system.id)),group=new T.Group();group.name='stellar-'+system.id;
  group.add(new T.Mesh(stellarBound,materials.surface),new T.Mesh(stellarBound,materials.corona));root.add(group);const entry={group,...materials,last:frame};stars.set(system.id,entry);return entry;
 }
 function makeScenery(system){
  const group=new T.Group();group.name='system-decorations-'+system.id;group.scale.setScalar(WORLD_SCALE);
  const belt=new T.Mesh(asteroidGeometry,beltMaterial.clone());group.add(belt);
  const comets=[];for(let i=0;i<2;i++)for(const mode of [2,1]){const p=new T.Points(mode===1?tailGeometry:dustGeometry,createCometMaterial(mode));p.frustumCulled=false;group.add(p);comets.push({object:p,index:i});}
  const orbitPositions=[];for(const p of planetsBySystem.get(system.id)||[]){if(p.moon||!p.orbit)continue;for(let i=0;i<128;i++)for(const a of [i/128*Math.PI*2,(i+1)/128*Math.PI*2])orbitPositions.push(Math.cos(a)*p.orbit/WORLD_SCALE,0,Math.sin(a)*p.orbit/WORLD_SCALE);}
  const orbit=new T.LineSegments(linesGeometry(orbitPositions),orbitMaterial.clone());group.add(orbit);root.add(group);
  const entry={group,belt,comets,orbit,signature:orbitSignature(system.id),last:frame};scenery.set(system.id,entry);return entry;
 }
 const orbitSignature=id=>JSON.stringify((planetsBySystem.get(id)||[]).filter(p=>!p.moon&&p.orbit).map(p=>[p.key,p.orbit]));
 function makeNpc(body,geometry){
  const group=new T.Group(),material=createNpcMaterial(),mesh=new T.Mesh(geometry,material);group.name='npc-'+body.key;group.add(mesh);
  const patrols=Array.from({length:npcTypes[body.npcType].patrols},()=>new T.Mesh(patrolGeometry,patrolMaterial));for(const p of patrols)root.add(p);root.add(group);
  const entry={group,mesh,material,patrols,type:body.npcType,last:frame};npcs.set(body.key,entry);return entry;
 }
 function makePort(center){
  // The retained port mesh uses the same legacy units as its star-relative pose.
  const group=new T.Group();group.name='logistics-'+center.key;group.rotation.y=-.22;group.scale.setScalar(WORLD_SCALE);
  const frameMesh=new T.Mesh(logisticsGeometry.frame,portMaterial),hullGeometry=logisticsGeometry.hull.clone(),hull=new T.Mesh(hullGeometry,portMaterial),lights=new T.Mesh(logisticsGeometry.lights,portLightMaterial.clone());
  group.add(frameMesh,hull,lights);const shuttles=Array.from({length:4},()=>new T.Mesh(logisticsGeometry.traffic,trafficMaterial));for(const p of shuttles)root.add(p);root.add(group);
  const entry={group,hull,lights,shuttles,last:frame};ports.set(center.key,entry);return entry;
 }
 function removeEntry(map,id){const e=map.get(id);if(!e)return;map.delete(id);
  e.group.removeFromParent();if(e.surface){e.surface.dispose();e.corona.dispose();}if(e.material)e.material.dispose();
  if(e.belt){e.belt.material.dispose();e.orbit.geometry.dispose();e.orbit.material.dispose();for(const c of e.comets)c.object.material.dispose();}
  if(e.hull){e.hull.geometry.dispose();e.lights.material.dispose();}for(const child of [...(e.patrols||[]),...(e.shuttles||[])])child.removeFromParent();
 }
 function setState(next={}){
  if(disposed)return;state={...state,...next};systemsById=new Map(state.systems.map(s=>[s.id,s]));planetsBySystem=new Map();
  for(const p of state.planets){const id=p.coordinates?.[1];if(!planetsBySystem.has(id))planetsBySystem.set(id,[]);planetsBySystem.get(id).push(p);}
  const bodies=new Map(state.planets.map(p=>[p.key,p]));for(const [key,e]of npcs)if(!bodies.has(key)||bodies.get(key).npcType!==e.type)removeEntry(npcs,key);
  for(const id of stars.keys())if(!systemsById.has(id))removeEntry(stars,id);
  // API polls return fresh arrays even when geometry is unchanged. Keep warmed
  // buffers/materials; only an actual orbit change invalidates that system.
  for(const [id,e]of scenery)if(!systemsById.has(id)||e.signature!==orbitSignature(id))removeEntry(scenery,id);
  const portIds=new Set(state.logistics.filter(c=>c.level||c.queue).map(c=>c.key));for(const id of ports.keys())if(!portIds.has(id))removeEntry(ports,id);
  const signature=JSON.stringify([state.playerId,state.systems.map(s=>[s.id,s.position,s.systemOwner,s.systemOwnerName,s.systemColor]),state.planets.filter(p=>p.owner&&!p.npc&&!p.moon).map(p=>[p.key,p.owner,p.ownerName])]);
  if(signature!==territorySignature){territorySignature=signature;const records=strategyData(state.systems,state.planets,state.playerId);territoryData=territoryGeometry(state.systems,records);for(const o of [...territoryRoot.children])disposeObject(o);
   const vertices=[],colors=[],edges=[],edgeColors=[];const rgb=c=>new T.Color(c).toArray();
   for(const cell of territoryData.cells){if(!cell.key)continue;const color=rgb(cell.color);for(let k=1;k<cell.vertices.length-1;k++)for(const j of [cell.vertices[0],cell.vertices[k],cell.vertices[k+1]]){vertices.push(...territoryData.vertices[j]);colors.push(...color);}}
   for(const edge of territoryData.borders){const owners=edge.cells.map(i=>territoryData.cells[i]).filter(c=>c.key);if(!owners.length)continue;const color=rgb(owners[0].color);if(owners.length===2){const b=rgb(owners[1].color);color.forEach((v,i)=>color[i]=(v+b[i])/2);}for(const j of [edge.u,edge.v]){edges.push(...territoryData.vertices[j]);edgeColors.push(...color);}}
   const fill=new T.Mesh(linesGeometry(vertices,colors),territoryFillMaterial.clone());fill.name='territory-fill';fill.renderOrder=-5;
   const border=new T.LineSegments(linesGeometry(edges,edgeColors),territoryBorderMaterial.clone());border.name='territory-boundaries';border.renderOrder=-4;territoryRoot.add(fill,border);
   info.territories={regions:territoryData.regions.length,borders:territoryData.borders.length,components:territoryData.regions,cells:records};
  }
  const nextMarkers=JSON.stringify(state.systems.map(s=>[s.id,s.position,s.galaxyStar?.size||3,s.galaxyStar?.brightness||1]));
  if(nextMarkers!==markerSignature){markerSignature=nextMarkers;markers.geometry.dispose();const positions=[],colors=[],attributes=[];for(const s of state.systems){positions.push(...s.position);colors.push(...starColor(s.id));attributes.push(s.galaxyStar?.size||3,s.galaxyStar?.brightness||1);}markers.geometry=linesGeometry(positions,colors);markers.geometry.setAttribute('star',new T.Float32BufferAttribute(attributes,2));
   if(links)disposeObject(links);const list=constellationLinks(state.systems),positions2=[];for(const link of list)for(const id of [link.a,link.b])positions2.push(...systemsById.get(id).position);links=new T.LineSegments(linesGeometry(positions2),linksMaterial.clone());links.name='constellation-links';root.add(links);info.constellations=list;
  }
  pickTargets=[{...blackHole},...state.systems.map(s=>({...s,id:s.id,type:'system',radius:s.radius||starRadius(s.id)})),...state.planets.filter(p=>p.npc&&!p.moon&&npcTypes[p.npcType]).map(p=>({...p,id:p.key,type:'planet'})),...state.logistics.filter(c=>(c.level||c.queue)&&systemsById.has(c.position[1])).map(c=>logisticsPose(c,systemsById.get(c.position[1])))];
 }

 function update({time=0,eye=[0,0,0],origin=[0,0,0],distance:cameraDistance=1,width=1,height=1}={}){
  if(disposed)return;frame++;eye=vec(eye);origin=vec(origin);camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);camera.getWorldDirection(forward);
  const appearance=galaxyPresentation(cameraDistance,width/Math.max(1,height)),dpr=Math.min(globalThis.devicePixelRatio||1,2);
  sky.position.copy(camera.position);sky.scale.setScalar(Math.min(camera.far*.8,Math.max(100000,cameraDistance*4)));relative(galaxy,[0,0,0],origin);relative(markers,[0,0,0],origin);relative(territoryRoot,[0,0,0],origin);if(links){relative(links,[0,0,0],origin);links.material.opacity=appearance.links*.4;links.visible=links.material.opacity>.001;}
  for(const [m,alpha]of [[galaxyMaterial,appearance.background],[markersMaterial,1]]){m.uniforms.uOpacity.value=alpha;m.uniforms.uDPR.value=dpr;m.uniforms.uZoom.value=clamp(Math.sqrt(100000*WORLD_SCALE/Math.max(cameraDistance,1000*WORLD_SCALE)),.7,1.6);}
  territoryRoot.visible=territoriesVisible&&cameraDistance>1600*WORLD_SCALE;for(const child of territoryRoot.children)child.material.opacity=clamp((cameraDistance/WORLD_SCALE-1600)/2200)*(child.isMesh?.13:.76);
  relative(hole,blackHole.position,origin);hole.visible=projected(blackHole.position,blackHole.radius,origin,height)>1.5&&visible(blackHole.position,18*blackHole.scale,origin);blackMaterial.uniforms.uEye.value.fromArray(eye).divideScalar(blackHole.scale);blackMaterial.uniforms.uForward.value.copy(forward);blackMaterial.uniforms.uTime.value=time;
  info.blackHole={visible:hole.visible,steps:220,position:blackHole.position,radius:blackHole.radius};
  info.stars=[];info.decorations=[];info.npcs.visible=[];info.npcs.patrols=[];info.logistics=[];
  for(const e of stars.values())e.group.visible=false;for(const e of scenery.values())e.group.visible=false;
  const candidates=state.systems.map(s=>({system:s,pixels:projected(s.position,s.radius||starRadius(s.id),origin,height)})).filter(c=>c.pixels>1&&visible(c.system.position,(c.system.radius||starRadius(c.system.id))*2.6,origin)).sort((a,b)=>b.pixels-a.pixels).slice(0,32);
  for(const {system:s,pixels}of candidates){const e=stars.get(s.id)||makeStar(s),radius=s.radius||starRadius(s.id);relative(e.group,s.position,origin);e.group.scale.setScalar(radius);e.group.visible=true;e.last=frame;e.uniforms.uEye.value.fromArray(subtract(eye,s.position)).divideScalar(radius);e.uniforms.uForward.value.copy(forward);e.uniforms.uRadius.value=radius;e.uniforms.uTime.value=time+Number(s.id);e.uniforms.uAlpha.value=smooth(1,5,pixels);info.stars.push({id:s.id,radius,pixels});}
  for(const s of state.systems){const d=distance(eye,s.position)/WORLD_SCALE;if(d>1800)continue;const e=scenery.get(s.id)||makeScenery(s);relative(e.group,s.position,origin);e.group.visible=true;e.last=frame;e.belt.visible=d<480;e.belt.rotation.y=s.id*.71+time*.0012;e.belt.material.opacity=1-smooth(170,480,d);e.orbit.material.opacity=.13*(1-smooth(500,1800,d));
   for(const c of e.comets){c.object.visible=d<480;if(!c.object.visible)continue;c.object.material.uniforms.uHead.value.fromArray(auroraCometPosition(s.id,time,c.index));c.object.material.uniforms.uOpacity.value=1-smooth(170,480,d);c.object.material.uniforms.uDPR.value=dpr;}info.decorations.push({system:s.id,asteroids:e.belt.visible?2200:0,comets:d<480?2:0});}
  for(const e of npcs.values()){e.group.visible=false;for(const p of e.patrols)p.visible=false;}
  for(const p of state.planets){if(!p.npc||p.moon||!npcTypes[p.npcType])continue;const pixels=projected(p.position,p.radius,origin,height);if(pixels<2||!visible(p.position,p.radius*2.5,origin))continue;loadNpc(p.npcType);const geometry=npcGeometry.get(p.npcType);info.npcs.visible.push({key:p.key,type:p.npcType,loaded:!!geometry,radius:pixels});if(!geometry)continue;
   const e=npcs.get(p.key)||makeNpc(p,geometry),scale=p.radius*Math.max(1,9/pixels),rotation=time*.027;e.last=frame;e.group.visible=true;relative(e.group,p.position,origin);e.group.rotation.y=rotation;e.group.scale.setScalar(scale);
   const star=systemsById.get(p.coordinates?.[1]);light.fromArray(subtract(star?.position||[0,0,0],p.position)).normalize().applyAxisAngle(T.Object3D.DEFAULT_UP,-rotation);eyeLocal.fromArray(subtract(eye,p.position)).divideScalar(scale).applyAxisAngle(T.Object3D.DEFAULT_UP,-rotation);e.material.uniforms.uLight.value.copy(light);e.material.uniforms.uEye.value.copy(eyeLocal);
   if(pixels>=8&&!state.battles?.some(b=>b.target===p.id))for(let i=0;i<e.patrols.length;i++){const pose=npcPatrolPose(p,time,i),ship=e.patrols[i];ship.visible=true;relative(ship,pose.position,origin);ship.rotation.set(pose.pitch,pose.yaw,0);ship.scale.setScalar(p.radius*.085);info.npcs.patrols.push({key:p.key,index:i,position:pose.position,decorative:true});}
  }
  for(const e of ports.values()){e.group.visible=false;for(const p of e.shuttles)p.visible=false;}
  for(const center of state.logistics){if(!(center.level||center.queue))continue;const star=systemsById.get(center.position[1]);if(!star)continue;const pose=logisticsPose(center,star),pixels=projected(pose.position,pose.radius,origin,height);if(pixels<2||!visible(pose.position,pose.radius,origin))continue;const e=ports.get(center.key)||makePort(center);relative(e.group,pose.position,origin);e.group.visible=true;e.last=frame;
   const clock=(Number.isFinite(state.now)?state.now:Date.now())+(state.gameNowOffset||0),progress=center.level?1:clamp((clock-center.queue.start)/Math.max(1,center.queue.end-center.queue.start));e.hull.geometry.setDrawRange(0,Math.floor(e.hull.geometry.attributes.position.count*progress/3)*3);e.lights.material.color.set(center.level?0x4ddbb5:0xeb9433);
   if(center.level&&pixels>14)for(let i=0;i<4;i++){const a=time*.045+i*Math.PI/2,position=pose.position.map((v,k)=>v+[Math.cos(a)*(15.4+i*.35),.3+Math.sin(a*2+i)*1.6,Math.sin(a)*(15.4+i*.35)][k]*WORLD_SCALE),ship=e.shuttles[i];relative(ship,position,origin);ship.rotation.y=-a;ship.scale.setScalar(.65*WORLD_SCALE);ship.visible=true;}
   info.logistics.push({...pose,projectedRadius:pixels,progress,shuttles:center.level&&pixels>14?4:0});
  }
  // Bounded LRU caches preserve revisited objects without accumulating worlds forever.
  for(const [map,limit]of [[stars,40],[scenery,8],[npcs,24],[ports,12]])if(map.size>limit)for(const [id]of [...map].filter(([,e])=>!e.group.visible).sort((a,b)=>a[1].last-b[1].last).slice(0,map.size-limit))removeEntry(map,id);
  info.npcs.loaded=[...npcGeometry.keys()];info.npcs.pending=[...npcPending.keys()];info.npcs.failed=[...npcFailed];
 }
 function dispose(){if(disposed)return;disposed=true;controller.abort();for(const map of [stars,scenery,npcs,ports])for(const id of [...map.keys()])removeEntry(map,id);for(const o of [...territoryRoot.children])disposeObject(o);if(links)disposeObject(links);markers.geometry.dispose();for(const resource of resources)resource.dispose();resources.clear();npcGeometry.clear();root.removeFromParent();root.clear();prewarmRoot.removeFromParent();prewarmRoot.clear();}
 return {root,prewarmRoot,ready,setState,update,dispose,cancelLoading(){controller.abort();},toggleTerritories(){territoriesVisible=!territoriesVisible;territoryRoot.visible=territoriesVisible;return territoriesVisible;},bodyObject(key){return key==='gargantua'?hole:npcs.get(key)?.group||stars.get(key)?.group||ports.get(key)?.group;},get pickTargets(){return pickTargets;},get stats(){return {...info,strategy:{...info.territories,constellations:info.constellations||[]},cache:{stars:stars.size,scenery:scenery.size,npcs:npcs.size,ports:ports.size},territoriesVisible};},get territoryData(){return territoryData;}};
}
