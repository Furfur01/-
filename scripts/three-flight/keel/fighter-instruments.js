import * as THREE from 'three';
import {consolePoint} from '../fighter-console.js';
import {FusionDisplays,hologramSurface} from '../instruments/fusion-displays.js';
import {paintFlightInstrument} from '../instruments/flight-instruments.js';
export function fighterKeelDisplays(keel){
 const offset=keel.root.position;
 const physical=(id,name)=>{const a=keel.anchors[name],p=a.getWorldPosition(new THREE.Vector3()),q=a.getWorldQuaternion(new THREE.Quaternion()),r=new THREE.Euler().setFromQuaternion(q,'YXZ');p.add(new THREE.Vector3(0,0,.001).applyQuaternion(q));const size=a.userData.dimensions.slice(0,2);return {id,pos:p.toArray(),rotation:[r.x,r.y,r.z],size,width:1024,height:Math.round(1024*size[1]/size[0]),physical:true};};
 const holo=(id,side,y,h)=>({id,pos:[side*.96+offset.x,y+offset.y,-1.52+offset.z],size:[.62,h],rotation:[0,-side*.28,0],width:1024,height:Math.round(1024*h/.62),hologram:true});
 return [holo('defense',-1,1.49,.3875),holo('fire',1,1.49,.3875),holo('helm',-1,1.77,.13),holo('weaponsStatus',1,1.77,.13),physical('weapons','EMPTY_FIGHTER_PORT_DISPLAY'),physical('radar','EMPTY_FIGHTER_LOWER_MAIN_DISPLAY'),physical('systems','EMPTY_FIGHTER_STARBOARD_DISPLAY')];
}
class FlightDisplays extends FusionDisplays {
 update(s,t){super.update(s,t);}
 weapons(c,d,s,t){paintFlightInstrument(c,d,s,t);}
 systems(c,d,s,t){paintFlightInstrument(c,d,s,t);}
 radar(c,d,s,t){paintFlightInstrument(c,d,s,t);}
 weaponsStatus(c,d,s,t){super.weapons(c,d,s,t);}
}
export function createFighterInstruments(keel){
 const resources=[],group=new THREE.Group();keel.root.updateMatrixWorld(true);
 const displays=new FlightDisplays(canvas=>{const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;resources.push(texture);return texture;},fighterKeelDisplays(keel));
 for(const d of displays.displays){if(d.hologram){group.add(hologramSurface(d,resources));continue;}
  const [w,h]=d.size,r=.018,shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.lineTo(w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.lineTo(w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.lineTo(-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.closePath();
  const geometry=new THREE.ShapeGeometry(shape),material=new THREE.MeshBasicMaterial({map:d.texture,toneMapped:false,color:0xb4c8ba}),mesh=new THREE.Mesh(geometry,material),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/w+.5,uv.getY(i)/h+.5);
  mesh.position.fromArray(consolePoint(d,[0,0,.003]));mesh.rotation.set(...d.rotation,'YXZ');group.add(mesh);resources.push(geometry,material);
 }
 return {group,displays,update:(s,t)=>displays.update(s,t),pick:(o,d)=>displays.pick(o.toArray(),d.toArray()),layout:p=>displays.layout(p),dispose(){resources.forEach(r=>r.dispose());group.clear();}};
}
