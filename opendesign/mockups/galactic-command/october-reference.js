import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createGuardianSource} from './guardian-reference-geometry.js';
import {createMissileSource} from './missile-reference-geometry.js';
import {createColonySource} from './colony-reference-geometry.js';
import {createShipKit} from './ship-sculpted-kit.js';
import {shipWeaponLayouts} from '../../../game/ship-weapon-mounts.mjs';

export const octoberRevision='october-user-models-01';
export const octoberSources={Devourer_Interceptor:createGuardianSource,Bomber:createMissileSource,Colony_Ship:createColonySource};
const files={Devourer_Interceptor:'titanium-guardian.html',Bomber:'spacecraft-threejs.html',Colony_Ship:'colony_ship.html'};
// Preserve the major original armor, open frames, pylons and every drive at fleet distance.
const lowNames={
 Devourer_Interceptor:/^(continuous_dark_load_path|bow_upper_armour|bow_lower_belt|main_armour_plate_|central_spine|central_nose_shield|tongue_armour|rear_transverse_armoured_shoulder|shoulder_upper_plate|main_citadel_lower|upper_citadel|command_bridge_shell|bridge_roof_plating|main_cantilever_beam|pylon_segment_|engine_core|front_end_armor|dorsal_armor_|flank_armor_|ventral_armor|octagonal_exhaust_bezel|thruster_luminous_backplane|midship_solid_pylon|midship_pylon_armour|reactor_aft_bulkhead)$/,
 Bomber:/^(Continuous flattened hexagonal bow hull|Recessed ventral keel|Bow dorsal armor|Central structural spine|Continuous midship side frame|Segmented upper longitudinal armor|Main armored cockpit hood|Amber faceted windshield|Solid cantilever fin frame|Fin upper fitted armor|Central continuous aft hull|Central raised dorsal armor|Upper nacelle pressure body|Upper nacelle top slab|Lower nacelle pressure body|Middle nacelle continuous casing|.* blue recessed core)/,
 Colony_Ship:/^(chamfered_primary_chassis|lower_keel_shadow|solid_deck_plate_|continuous_mustard_shoulder_rail|central_structural_spine|upper_sponson_main|upper_pressure_shell|aft_pressure_shell|lower_freight_cradle|freight_pressure_case|dorsal_foundation|fore_bridge_ramp|command_deck_core|bridge_top_shell|bridge_side_shell|wing_armor_edge|wing_upper_blue_inset|forward_fin_rim|forward_fin_blue_inset|Pod load-bearing angular body|Lower segmented armor jacket|Upper segmented armor jacket|Squared outer exhaust armor collar|Stern nozzle outer steel lip|Auxiliary exhaust outer housing|Auxiliary rectangular steel aperture)/
};

export function createOctoberReference(id){
 const source=octoberSources[id](),root=new THREE.Group();root.name=id;source.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(source,true),center=bounds.getCenter(new THREE.Vector3());
 const scale=(id==='Colony_Ship'?14.120800018310547:14)/(bounds.max.x-bounds.min.x);
 // Source -X bow -> game -Z bow. Bake conversion so all hardpoints are root-local.
 const transform=new THREE.Matrix4().makeRotationY(-Math.PI/2).multiply(new THREE.Matrix4().makeScale(scale,scale,scale)).multiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));
 const point=p=>new THREE.Vector3(...p).applyMatrix4(transform).toArray();
 const engines=[],articulations=[],turrets=new Map(),buckets=new Map(),oldGeometries=new Set();
 const addEngine=(p,r)=>engines.push({position:point(p),direction:[0,0,1],radius:r*scale});
 source.traverse(o=>{
  if(o.userData.part==='engine_pod'){
   const bezel=o.getObjectByName('octagonal_exhaust_bezel'),b=new THREE.Box3().setFromObject(bezel,true),p=b.getCenter(new THREE.Vector3());p.x=b.max.x;
   addEngine(p.toArray(),Math.min(o.userData.dimensions.width,o.userData.dimensions.height)*.32);
  }
  if(o.userData.part==='point_defense'){
   const s=o.userData.size,p=o.getWorldPosition(new THREE.Vector3()),rear=p.x>25;
   turrets.set(o,{index:articulations.length,size:s});
   articulations.push({matrix:new THREE.Matrix4().makeTranslation(...point(p.toArray())).toArray(),role:rear?'secondary':'pd',scale:s*scale,
    pivot:[-.66*s*scale,.49*s*scale,0],muzzles:[[-1.607*s*scale,.49*s*scale,-.235*s*scale],[-1.607*s*scale,.49*s*scale,.235*s*scale]],neutralYaw:rear?Math.PI:0});
  }
  if(id==='Bomber'&&o.isMesh&&o.name.endsWith(' blue recessed core')){
   const b=new THREE.Box3().setFromObject(o,true),p=b.getCenter(new THREE.Vector3());
   p.x+=.25;addEngine(p.toArray(),Math.min(b.max.y-b.min.y,b.max.z-b.min.z)*.42);
  }
 });
 if(id==='Colony_Ship'){
  for(const z of [-3.35,3.35])addEngine([10.86,.15,z],.64);
  for(const y of [-.33,-1])addEngine([11.02,y,0],.16);
 }
 let parts=0,triangles=0,lowTriangles=0;
 source.traverse(mesh=>{
  if(!mesh.isMesh)return;parts++;oldGeometries.add(mesh.geometry);
  const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
  for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(transform,mesh.matrixWorld));
  let owner=mesh.parent;while(owner&&!turrets.has(owner))owner=owner.parent;
  const turret=turrets.get(owner),code=turret?(turret.index*2+(/^(gun_mantlet|barrel_top_rail)$/.test(mesh.name)||mesh.position.x<-.7*turret.size?2:1)):0;
  g.setAttribute('joint',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(code),1));
  const material=mesh.material,n=g.attributes.position.count/3;
  if(!buckets.has(material))buckets.set(material,{geometries:[],ranges:[],offset:0});
  const b=buckets.get(material);
  const armorPrefix=id==='Devourer_Interceptor'&&/^(main_armour_plate_|pylon_segment_|dorsal_armor_)/.test(mesh.name);
  if(armorPrefix||lowNames[id].test(mesh.name)){b.ranges.push([b.offset,n]);lowTriangles+=n;}
  b.geometries.push(g);b.offset+=n;triangles+=n;
 });
 for(const [material,b]of buckets){
  const mesh=new THREE.Mesh(mergeGeometries(b.geometries),material);mesh.name=source.name+' / '+material.name;
  mesh.castShadow=mesh.receiveShadow=true;if(b.ranges.length)mesh.userData.fleetLODRanges=b.ranges;
  material.userData.emission=material.emissive.getHex()?Math.min(1,material.emissiveIntensity):0;
  root.add(mesh);b.geometries.forEach(g=>g.dispose());
 }
 oldGeometries.forEach(g=>g.dispose());
 root.userData={modelId:id,revision:octoberRevision,referenceGeometry:true,sourceFile:'models/reference/october-ships/'+files[id],sourceModel:source.name,
  sourceTriangles:triangles,sourceParts:parts,lowTriangles,units:'display units',forward:'-Z',engineNozzles:engines,articulations};
 if(id!=='Colony_Ship'){
  const layout=structuredClone(shipWeaponLayouts[id]),k=createShipKit('Reference_weapon_fittings');
  const sourcePort=(position,r,down=false)=>{
   const p=point(position),radius=r*scale;
   k.cyl(radius*1.2,.04*scale,p[0],p[1]+(down?.025*scale:0),p[2]+(down?0:.025*scale),'steel',down?'y':'z');
   k.cyl(radius,.01*scale,p[0],p[1],p[2],'black',down?'y':'z');return [p[0],p[1]-(down?.006*scale:0),p[2]-(down?0:.006*scale)];
  };
  if(id==='Devourer_Interceptor'){
   layout.muzzles=[-1,1].map(s=>sourcePort([-34.14,-.25,s*9.7],.44));
   layout.caliber=.44*scale;
   layout.pointDefense=articulations.filter(a=>a.role==='pd').map(a=>new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(a.matrix)).toArray());
   layout.pdMuzzles=articulations.filter(a=>a.role==='pd').map(a=>{
    const p=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(a.matrix)),m=a.muzzles[0];
    return p.add(new THREE.Vector3(-m[2],m[1],m[0]-.001)).toArray();
   });
   layout.missiles=[];
   // The original four secondary missile channels use four of the supplied side batteries.
   const cores=[];source.traverse(o=>{if(o.name==='red_launcher_core')cores.push(o);});
   for(const side of [-1,1]){
    const chosen=cores.filter(o=>Math.sign(o.getWorldPosition(new THREE.Vector3()).z)===side).slice(0,2);
    for(const o of chosen){const p=o.getWorldPosition(new THREE.Vector3());p.z+=side*.015;layout.missiles.push(point(p.toArray()));}
   }
   layout.missileDirections=layout.missiles.map(p=>[Math.sign(p[0]),0,0]);
   layout.launchDirection=[0,1,0];
  }else{
   layout.missiles=[-1,1].flatMap(s=>Array.from({length:4},(_,j)=>sourcePort([-1.72+j*1.45,-.97,s*1.18],.085,true)));
   layout.launchDirection=[0,-1,0];
   layout.pdScale=.6*scale;
   layout.pointDefense=[];
   const box=new THREE.Box3().setFromObject(root);
   for(const [x,role]of [[-1,'pd'],[4.15,'secondary']])for(const side of [-1,1]){
    const p=point([x,0,side*1.66]),hit=new THREE.Raycaster(new THREE.Vector3(p[0],box.max.y+1,p[2]),new THREE.Vector3(0,-1,0)).intersectObject(root,true)[0];
    if(!hit)throw Error('Unseated missile-ship turret');p[1]=hit.point.y;
    k.turret(...p,.6*scale);if(role==='pd')layout.pointDefense.push(p);
   }
  }
  const fittings=k.finish();
  if(id==='Bomber')fittings.userData.articulations.forEach((a,i)=>a.role=i<2?'pd':'secondary');
  root.add(fittings);root.userData.weaponLayout=layout;
 }
 root.updateMatrixWorld(true);return root;
}
