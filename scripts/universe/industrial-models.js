import * as THREE from 'three';
import {shipConstructionProgress} from './ship-construction-state.js';
import {clamp} from './terrain.js';

const RESOURCE_INDEX={Metal_Mine:0,Crystal_Mine:1,Gas_Mine:2,Metal_Storage:0,Crystal_Storage:1,Gas_Storage:2};
const MERGED={Metal_Storage:'Metal_Mine',Crystal_Storage:'Crystal_Mine',Gas_Storage:'Gas_Mine'};
export function buildingState(planet,id,catalog={},now=Date.now()) {
  if(!planet)return {id,level:0,state:'unbuilt',rate:0,progress:0,queue:null};
  const ownerId=!planet.moon?MERGED[id]||id:id,level=Math.max(Number(planet.buildings?.[id])||0,Number(planet.buildings?.[ownerId])||0),q=planet.buildQueue;
  const ratio=clamp(planet.economy?.ratio??1),index=RESOURCE_INDEX[id],multiplier=catalog.planetTypes?.[planet.biome]?.multipliers?.[index]??1;
  let state=level?'active':'unbuilt',rate=level?1:0,progress=1;
  if(q&&(q.id===id||q.id===ownerId)){state=level?'upgrade':'construction';progress=clamp((now-q.start)/Math.max(1,q.end-q.start));}
  else if(index!==undefined&&level){const amount=(planet.storage?.resources||planet.resources||[])[index]??0,capacity=(planet.storage?.capacity||planet.economy?.capacity||[])[index]??Infinity;if(amount>=capacity)state='full';else if(planet.moon||!multiplier||ratio===0)state='paused';else if(ratio<.999)state='lowpower';}
  if(['unbuilt','construction','paused','full'].includes(state))rate=0;else if(index!==undefined)rate=ratio;
  const queue=id==='Flagship_Center'?planet.flagshipQueue?.[0]||null:id==='Shipyard'?planet.shipQueue?.[0]||null:id==='Missile_Silo'?planet.defenseQueue?.[0]||null:null;
  return {id,level,state,rate,progress,queue,queueProgress:shipConstructionProgress(queue,now),resources:index===undefined?undefined:(planet.storage?.resources||planet.resources||[])[index]};
}

export function createIndustrialResources() {
  const geometries={box:new THREE.BoxGeometry(1,1,1),tank:new THREE.CylinderGeometry(.5,.5,1,16),sphere:new THREE.SphereGeometry(.5,16,10),cone:new THREE.ConeGeometry(.5,1,12),torus:new THREE.TorusGeometry(.5,.075,6,32)};
  const palette={steel:0x71858b,dark:0x182c35,concrete:0x636968,roof:0x2e4651,pipe:0x9a9e91,ochre:0xa07d3f,solar:0x153952,light:0x7ebdcc};
  const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>[key,new THREE.MeshStandardMaterial({color,roughness:key==='pipe'?.45:.82,metalness:key==='pipe'?.65:.22,emissive:key==='light'?0x367985:0,emissiveIntensity:key==='light'?.8:0})]));
  return {geometries,materials,dispose(){for(const g of Object.values(geometries))g.dispose();for(const m of Object.values(materials))m.dispose();}};
}

/** Replaceable industrial draft. All dimensions are ordinary legacy building units, not planet radii. */
export function createIndustrialModel(id,{resources,gas=false,stationHeight=60}={}) {
  const owned=!resources;resources ||= createIndustrialResources();
  const root=new THREE.Group();root.name=`industrial/${id}`;root.userData={buildingId:id,artStatus:'procedural-integration-draft'};
  const near=new THREE.Group(),far=new THREE.Group(),effects=new THREE.Group(),station=new THREE.Group(),cable=new THREE.Group();
  near.name='near-detail';far.name='far-silhouette';effects.name='mechanisms';station.name='orbital-station';cable.name='elevator-cable';root.add(near,far,effects,station,cable);
  const batches=new Map(),matrix=new THREE.Matrix4(),temp=new THREE.Object3D(),animations=[];
  function part(shape,color,position,scale,rotation=[0,0,0],destination=near){const key=`${destination.uuid}/${shape}/${color}`;if(!batches.has(key))batches.set(key,{shape,color,destination,items:[]});batches.get(key).items.push({position,scale,rotation});}
  const box=(p,s,c='steel',r=[0,0,0],dest=near)=>part('box',c,p,s,r,dest);
  const tank=(x,z,r=.3,h=1.1,c='pipe')=>{part('tank',c,[x,h/2,z],[r*2,h,r*2]);part('sphere',c,[x,h,z],[r*2,.26,r*2]);box([x,h/2,z+r+.025],[.04,h,.055],'ochre');};
  const pipe=(a,b,r=.035,c='pipe',dest=near)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),rotation=new THREE.Euler().setFromQuaternion(q);part('tank',c,va.add(vb).multiplyScalar(.5).toArray(),[r*2,d.length(),r*2],rotation.toArray().slice(0,3),dest);};
  const hall=(x,z,w=1.4,d=1,h=.55)=>{box([x,h/2,z],[w,h,d]);box([x,h+.025,z],[w+.06,.05,d+.06],'roof');for(let j=0;j<4;j++)box([x-w/2+.13+j*w/4,h*.6,z+d/2+.012],[.14,.12,.025],'dark');box([x,h*.35,z-d/2-.012],[w*.5,h*.5,.025],'dark');};
  const crane=(x,z)=>{box([x,.7,z],[.08,1.4,.08],'ochre');box([x+.3,1.4,z],[1.2,.07,.08],'ochre');pipe([x-.25,1.35,z],[x+.65,1.35,z],.015,'steel');pipe([x+.65,1.35,z],[x+.65,.35,z],.008,'dark');};
  // Roads and narrow service foundations follow the prepared terrain; no decorative circular plinth.
  box([0,.012,1.7],[5.6,.025,.42],'dark');for(let x=-2.4;x<2.5;x+=.4)box([x,.028,1.7],[.15,.008,.025],'ochre');
  if(gas){box([0,-.18,0],[6,.24,4.3],'dark');for(const x of[-2.4,2.4])for(const z of[-1.6,1.6])part('sphere','steel',[x,-.37,z],[.72,.7,.72]);}
  if(id==='Metal_Mine'||id==='Crystal_Mine'){
    // Stepped excavation, crushing line, two conveyors, sorting hall, stockpiles and rail loading.
    if(gas){
      // Gas colonies keep their existing resource rules, with suspended intake
      // and processing equipment in place of an impossible open-pit excavation.
      for(const x of[-2.35,-1.55,-.75]){tank(x,-.5,.25,.9,'pipe');pipe([x,.1,-.5],[x,-1.2,-.5],.08);box([x,-1.2,-.5],[.38,.15,.38],'dark');}
      box([-1.55,1.2,-.5],[2.2,.12,.9],'roof');
    }else{
      const pit=new THREE.Group();pit.name='terraced-excavation';near.add(pit);
      for(let i=0;i<5;i++){const r=1.42-i*.2,g=new THREE.RingGeometry(r-.18,r,36),m=resources.materials[i%2?'concrete':'ochre'],mesh=new THREE.Mesh(g,m);mesh.rotation.x=-Math.PI/2;mesh.position.set(-1.45,.018-i*.085,-.15);mesh.userData.ownedGeometry=true;pit.add(mesh);}
    }
    hall(1.25,-.6,1.65,1.3,.68);hall(1.15,.8,1.55,.55,.4);tank(2.25,-1.1,.22,.8);
    box([-.1,.35,-.15],[1.4,.12,.22],'dark',[0,0,-.24]);box([.55,.55,-.15],[.5,.7,.45],'steel');
    for(let x=-.6;x<=.7;x+=.3)box([x,.16,-.15],[.035,.32,.32],'ochre');
    for(let i=0;i<5;i++)part(gas?'box':'cone',id==='Crystal_Mine'?'pipe':'ochre',[.6+i*.34,.18,1.15],[.5,.36,.45]);crane(2.35,.8);
  }else if(id==='Gas_Mine'||id==='Fusion_Reactor'){
    hall(-1.5,0,1.1,1.5,.55);for(let i=0;i<4;i++){const x=-.4+i*.65;tank(x,-.7,.23,1.05+(i%2)*.45);tank(x,.55,.26,.65);pipe([x,.25,-.7],[x,.25,.55]);pipe([x,.2,.55],[x-.65,.2,.55]);}for(const z of[-1.35,1.2])pipe([-2,.34,z],[2.25,.34,z],.055);
    if(id==='Gas_Mine'){for(const x of[-2.4,-1.8]){box([x,.06,-1.3],[.45,.12,.45],'concrete');pipe([x,.1,-1.3],[x,.55,-1.3],.045);pipe([x,.55,-1.3],[-1.2,.55,-1.3],.035);}}else part('torus','ochre',[.65,1.4,-.7],[1.2,1.2,1.2],[Math.PI/2,0,0]);
  }else if(id.endsWith('_Storage')){
    if(id==='Gas_Storage')for(const x of[-1.6,-.55,.55,1.6])for(const z of[-.7,.6])tank(x,z,.44,1.05);
    else{hall(-.75,-.3,2.5,1.8,.8);for(let i=0;i<12;i++)box([1+(i%3)*.4,.13+Math.floor(i/6)*.25,-.7+(Math.floor(i/3)%2)*.55],[.34,.24,.48],i%2?'steel':'ochre');}crane(2.1,1);
  }else if(id==='Solar_Plant'){
    for(let x=-2;x<=2;x+=.55)for(let z=-1.15;z<=1.1;z+=.55){box([x,.14,z],[.04,.28,.04],'steel');box([x,.29,z],[.48,.035,.43],'solar',[-.28,0,0]);}hall(2.6,0,.6,1.4,.35);
  }else if(id==='Shipyard'){
    hall(-1.8,-.5,1.4,1.8,.65);hall(1.8,-.5,1.4,1.8,.65);for(const x of[-.6,.6])box([x,1,0],[.24,2,.38],'steel');box([0,2,0],[1.65,.25,.6],'ochre');for(let i=0;i<10;i++)box([-2.3+(i%5)*.5,.14,.8+Math.floor(i/5)*.4],[.42,.28,.3],'steel');
    for(const x of[-.3,.3])pipe([x,1.9,0],[x,stationHeight,0],.018,'pipe',cable);
    for(const x of[-2,2]){box([x,stationHeight,0],[.65,.65,5.2],'steel',[0,0,0],station);box([x,stationHeight+.4,0],[.85,.14,5.4],'roof',[0,0,0],station);for(const z of[-2,0,2]){box([x*.5,stationHeight,z],[2.2,.13,.18],'ochre',[0,0,0],station);box([x,stationHeight+.75,z],[.07,1.3,.09],'pipe',[0,0,0],station);}}box([0,stationHeight,2.6],[3.7,.7,.8],'steel',[0,0,0],station);
    const lift=new THREE.Mesh(resources.geometries.box,resources.materials.ochre);lift.name='freight-elevator';lift.scale.set(.35,.5,.32);effects.add(lift);animations.push({kind:'lift',object:lift,height:stationHeight});
    const assembly=new THREE.Mesh(resources.geometries.box,resources.materials.steel);assembly.name='ship-production-keel';assembly.position.set(0,stationHeight+.1,0);assembly.scale.set(.5,.35,3.5);station.add(assembly);animations.push({kind:'assembly',object:assembly});
  }else if(id==='Flagship_Center'){
    hall(-1.9,0,1.1,2.6,.9);hall(1.9,0,1.1,2.6,.9);hall(0,-1.25,3,.6,1.1);
    for(const z of[-.8,0,.8]){box([0,1.5,z],[3.4,.12,.14],'ochre');for(const x of[-1.55,1.55])box([x,.7,z],[.1,1.4,.12],'steel');}
    const assembly=new THREE.Mesh(resources.geometries.box,resources.materials.steel);assembly.name='flagship-production-keel';assembly.position.set(0,.65,0);assembly.scale.set(.85,.45,2.4);near.add(assembly);animations.push({kind:'assembly',object:assembly});
    crane(-2.7,1);crane(2.4,1);
  }else if(['Radar_Facility','The_EU_X_Radar','Wormhole_Generator'].includes(id)){
    hall(-1.3,.15,1.2,1.4,.55);tank(.8,0,.65,.45);const moving=new THREE.Group();moving.position.set(.8,.5,0);effects.add(moving);
    if(id==='Wormhole_Generator'){const ring=new THREE.Mesh(resources.geometries.torus,resources.materials.pipe);ring.scale.setScalar(2.3);ring.position.y=1.1;moving.add(ring);}else{const antenna=new THREE.Mesh(resources.geometries.sphere,resources.materials.pipe);antenna.scale.set(1.8,.1,1.8);antenna.rotation.x=.55;antenna.position.y=.7;moving.add(antenna);const mast=new THREE.Mesh(resources.geometries.box,resources.materials.steel);mast.scale.set(.08,.7,.08);mast.position.y=.35;moving.add(mast);}animations.push({kind:'rotate',object:moving,speed:.16});
  }else{
    const research=['Research_Lab','Moon_Base','Terraformer','Command_Center'].includes(id);hall(-1.35,-.2,1.9,1.7,research?.8:.55);hall(1.2,-.3,1.5,1.35,.65);for(let i=0;i<4;i++)box([-.7+i*.48,.055,1.05],[.36,.11,.65],'dark');pipe([-1.35,.15,-1.15],[1.2,.15,-1.15],.05);
    if(research){for(const x of[-1.8,-.9,.9])part('sphere','pipe',[x,.83,-.2],[.65,.35,.65]);box([1.2,.8,-.3],[1.1,.08,.9],'solar');}else{crane(.3,.6);for(let i=0;i<5;i++)box([1.2,.82,-.8+i*.23],[.8,.12,.12],'pipe');}if(id==='Missile_Silo')for(const x of[-1.8,-.6,.6,1.8])part('tank','dark',[x,.025,1],[.5,.05,.5]);
  }
  box([0,.35,0],[4.9,.7,2.7],'roof',[0,0,0],far);
  for(const {shape,color,destination,items}of batches.values()){const mesh=new THREE.InstancedMesh(resources.geometries[shape],resources.materials[color],items.length);mesh.name=`${id}/${shape}/${color}`;mesh.userData.buildingId=id;items.forEach(({position,scale,rotation},i)=>{temp.position.fromArray(position);temp.scale.fromArray(scale);temp.rotation.set(...rotation);temp.updateMatrix();matrix.copy(temp.matrix);mesh.setMatrixAt(i,matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();destination.add(mesh);}
  const scaffold=new THREE.BoxHelper(new THREE.Mesh(resources.geometries.box),0xd9ae65);scaffold.name='construction-frame';scaffold.scale.set(5.8,1.5,3.8);scaffold.position.y=.75;root.add(scaffold);scaffold.visible=false;far.visible=false;
  let state={state:'unbuilt',rate:0,progress:0},clock=0,disposed=false;
  return {root,near,far,station,cable,effects,animations,footprint:[6,4],anchors:{ground:[0,0,0],view:[0,.6,0],station:id==='Shipyard'?[0,stationHeight,0]:null,dock:id==='Shipyard'?[0,stationHeight,0]:null},
    setState(next){state=next;root.userData.state={...state};scaffold.visible=['construction','upgrade'].includes(state.state);near.scale.y=state.state==='construction'?Math.max(.025,state.progress):1;},
    update(dt,{detail=true,visible=true,cableVisible=visible,stationVisible=visible}={}){if(disposed)return;const built=state.state!=='unbuilt',complete=!['unbuilt','construction'].includes(state.state);root.visible=visible||stationVisible||cableVisible;near.visible=visible&&detail&&built;far.visible=visible&&!detail&&built;effects.visible=visible&&detail&&complete;station.visible=stationVisible&&complete;cable.visible=cableVisible&&built;scaffold.visible=visible&&detail&&['unbuilt','construction','upgrade'].includes(state.state);scaffold.material.color.set(state.state==='unbuilt'?0x6a9eaa:0xd9ae65);for(const a of animations)if(a.kind==='assembly'){a.object.visible=!!state.queue&&complete;a.object.scale.z=3.5*Math.max(.05,state.queueProgress||0);}if(!visible||!detail||state.rate<=0)return;clock+=Math.min(.1,Math.max(0,dt))*state.rate;for(const a of animations){if(a.kind==='rotate')a.object.rotation.y=clock*a.speed;if(a.kind==='lift')a.object.position.set(.3,2+(a.height-2)*(.5-.5*Math.cos(clock*.16)),0);}},
    dispose(){if(disposed)return;disposed=true;root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.ownedGeometry)o.geometry.dispose();});scaffold.geometry.dispose();scaffold.material.dispose();root.clear();if(owned)resources.dispose();}};
}
