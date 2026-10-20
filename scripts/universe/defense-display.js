import * as THREE from 'three';
import {createDefenseModel} from '../three-flight/defense-models.js';
import {disposeShip} from '../three-flight/shared-models.js';

// A small physical showroom next to the support centre, in the existing world.
// One unit is a sample, never a representation of the deployed inventory.
export function defenseDisplayUnit(planet,previewId,catalog={}){
 if(previewId)return previewId;
 if(!planet)return null;
 const turret=id=>catalog[id]?.type==='defense'&&!catalog[id].missile&&!id.endsWith('Shield_Dome');
 const owned=Object.keys(planet.defense||{}).find(id=>planet.defense[id]>0&&turret(id));
 const queued=planet.defenseQueue?.find(q=>q.remaining>0&&turret(q.id))?.id;
 return owned||queued||((planet.buildings?.Missile_Silo||0)>0?'Rocket_Launcher':null);
}
export function createDefenseDisplay(id){
 const root=new THREE.Group();root.name='support-defense-display';root.userData.unitId=id;
 const deck=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.09,6),new THREE.MeshStandardMaterial({color:0x35484b,metalness:.45,roughness:.7}));
 deck.name='hexagonal-display-pad';deck.position.y=.045;root.add(deck);
 const edgeGeometry=new THREE.EdgesGeometry(deck.geometry),edge=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:0xa6dbc6}));edge.position.copy(deck.position);root.add(edge);
 let model;
 if(id.endsWith('_Missile')){
  model=new THREE.Group();model.name=id;
  const material=new THREE.MeshStandardMaterial({color:0xb3c2bc,metalness:.45,roughness:.5});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,1.05,12),material);body.position.y=.7;
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.13,.32,12),material);nose.position.y=1.385;model.add(body,nose);
  for(let i=0;i<4;i++){const fin=new THREE.Mesh(new THREE.BoxGeometry(.34,.27,.025),material);fin.position.y=.25;fin.rotation.y=i*Math.PI/2;model.add(fin);}
 }else model=createDefenseModel(id);
 const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const fit=Math.min(1.36/Math.max(size.x,size.z),1.25/size.y);
 model.scale.setScalar(fit);model.position.set(-center.x*fit,.092-box.min.y*fit,-center.z*fit);root.add(model);
 return {root,dispose(){disposeShip(root);root.removeFromParent();}};
}
