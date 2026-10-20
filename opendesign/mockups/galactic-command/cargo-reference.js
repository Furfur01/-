import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createTransportSource} from './cargo-reference-geometry.js';

// Preserve the existing in-game longitudinal sizes, not the demo's arbitrary units.
export const transportLengths={Cargo_Ship:13.896999835968018,Large_Cargo_Ship:14.177000045776367};
export const transportRevision='four-ships-transports-01';

// Distant fleets retain the actual open cargo bay, side modules / broad decks,
// bridge and all four drives. Tiny fittings remain in the full model only.
const lowParts=new Set(['Armored_Cargo_Keel','Main_Load_Bearing_Deck','Deep_Center_Keel',
  'Longitudinal_Load_Deck','Main_Longitudinal_Girder','Pale_Forward_Cheek','Pale_Fore_Cargo_Cheek',
  'Sealed_Freight_Pod','Wide_Stepped_Freight_Platform','Reinforced_Bulkhead','Aft_Machinery_Cover',
  'Aft_Reactor_Superstructure','Raised_Aft_Spine','Bridge_Pressure_Cabin','Bridge_Roof',
  'Angular_Engine_Cowling','Exhaust_armour_lip','Thrust_ceramic','Deck_Pan']);
const isLowPart=name=>lowParts.has(name)||/^(Armored_Fore_Pillar_|Diagonal_Load_Strut_|Diagonal_Cargo_Frame_|Suspended_Service_Box_)/.test(name);

export function createReferenceTransport(id){
  const source=createTransportSource(THREE,id),root=new THREE.Group(),hull=new THREE.Group();
  root.name=id;hull.name=source.name;root.add(hull);source.updateMatrixWorld(true);
  const buckets=new Map(),originalGeometries=new Set(),engineNozzles=[];
  let triangles=0,parts=0;
  source.traverse(mesh=>{
    if(!mesh.isMesh)return;
    parts++;originalGeometries.add(mesh.geometry);
    // The aft cap of each actual ceramic cylinder is the exhaust origin.
    if(mesh.name==='Thrust_ceramic'){
      const {height,radiusTop}=mesh.geometry.parameters;
      engineNozzles.push({position:mesh.localToWorld(new THREE.Vector3(0,height/2,0)).toArray(),
        direction:new THREE.Vector3(0,1,0).transformDirection(mesh.matrixWorld).toArray(),radius:radiusTop});
    }
    const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
    for(const attribute of Object.keys(geometry.attributes))if(!['position','normal'].includes(attribute))geometry.deleteAttribute(attribute);
    geometry.applyMatrix4(mesh.matrixWorld);
    const count=geometry.attributes.position.count/3,material=mesh.material;
    if(!buckets.has(material))buckets.set(material,{geometries:[],ranges:[],offset:0});
    const bucket=buckets.get(material);
    if(isLowPart(mesh.name))bucket.ranges.push([bucket.offset,count]);
    bucket.geometries.push(geometry);bucket.offset+=count;triangles+=count;
  });
  // Like the supplied viewer, batch by material: preserve every original triangle
  // and color without hundreds of draw calls per ship.
  for(const [material,bucket]of buckets){
    const mesh=new THREE.Mesh(mergeGeometries(bucket.geometries),material);
    mesh.name=hull.name+' / '+material.name;mesh.castShadow=true;mesh.receiveShadow=true;
    if(bucket.ranges.length)mesh.userData.fleetLODRanges=bucket.ranges;
    material.userData.emission=material.emissive.getHex()?Math.min(1,material.emissiveIntensity):0;
    hull.add(mesh);bucket.geometries.forEach(g=>g.dispose());
  }
  originalGeometries.forEach(g=>g.dispose());
  hull.userData.engineNozzles=engineNozzles;
  const bounds=new THREE.Box3().setFromObject(hull);
  hull.position.sub(bounds.getCenter(new THREE.Vector3()));
  root.scale.setScalar(transportLengths[id]/(bounds.max.z-bounds.min.z));
  root.userData={modelId:id,revision:transportRevision,referenceGeometry:true,
    designSource:'User Four_Ships_ThreeJS_Offline.html; original T02 / T03 geometry and palette',
    sourceFile:'models/reference/four-ships/Four_Ships_ThreeJS_Offline.html',
    sourceModel:source.name,sourceTriangles:triangles,sourceParts:parts,units:'display units',forward:'-Z'};
  root.updateMatrixWorld(true);
  return root;
}
