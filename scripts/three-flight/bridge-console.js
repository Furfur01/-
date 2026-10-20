import * as THREE from 'three';
import {bridgeDisplays,bridgeHologram} from '../../game/bridge-layout.mjs';
import {FusionDisplays,hologramSurface} from './instruments/fusion-displays.js';
import {FusionRadar} from './instruments/fusion-radar.js';
export class BridgeConsole {
 constructor(kind){this.kind=kind;this.group=new THREE.Group();this.resources=[];
  this.displays=new FusionDisplays(canvas=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;this.resources.push(t);return t;},bridgeDisplays(kind));
  for(const d of this.displays.displays)this.group.add(hologramSurface(d,this.resources));
  this.radar=new FusionRadar(bridgeHologram(kind));this.holo=this.radar.group;this.group.add(this.holo);
 }
 update(s,t,camera){this.displays.update(s,t);this.radar.update(s,t,camera);this.group.updateMatrixWorld(true);}
 pick(origin,direction){const panel=this.displays.pick(origin.toArray(),direction.toArray()),radar=this.radar.pick(origin,direction);return radar&&(!panel||radar.distance<panel.distance)?radar:panel;}
 layout(project){return [...this.displays.layout(project),this.radar.layout(project)];}
 dispose(){this.radar.dispose();this.resources.forEach(r=>r.dispose());this.group.clear();}
}
