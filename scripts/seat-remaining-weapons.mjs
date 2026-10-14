import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Raycaster,Vector3} from 'three';
import {createRefinedShip} from '../opendesign/mockups/galactic-command/fleet-refined.js';
import {disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';
const mounts={
  Interceptor:{muzzles:[[0,-.36,-5.86]],caliber:.33,points:[...[-3,-.1,4.7].flatMap(z=>[-1,1].map(s=>[s*.56,5,z])),...[-1.7,1,4.9].flatMap(z=>[-1,1].map(s=>[s*.48,-1.3,z]))]},
  Devourer_Interceptor:{muzzles:[[-1.67,-1.05,-7.02],[1.67,-1.05,-7.02]],caliber:.3,points:[...[-4.8,-1.5].flatMap(z=>[-1,1].map(s=>[s*1.67,5,z])),...[-1,1].map(s=>[s*2.85,5,4.65])]},
  Titanenergetic_Frigate:{muzzles:[[0,-.4,-7.01]],caliber:.21,points:[.1,1.23].flatMap(z=>[-1,1].map(s=>[s*3.32,5,z]))},
};
const path=new URL('../game/ship-weapon-mounts.mjs',import.meta.url);let source=fs.readFileSync(path,'utf8');
for(const [id,{muzzles,caliber,points}]of Object.entries(mounts)){
  const model=createRefinedShip(id);model.updateMatrixWorld(true);
  const pointDefense=points.map(([x,y,z])=>{const hit=new Raycaster(new Vector3(x,y,z),new Vector3(0,-1,0)).intersectObject(model,true)[0];assert.ok(hit,id+' mount has no supporting hull');return[x,Math.round((hit.point.y-.004)*10000)/10000,z];});
  const layout={...shipWeaponLayouts[id],muzzles,caliber,pointDefense};
  const line=new RegExp('^  '+id+':.*$','m');assert.ok(line.test(source));source=source.replace(line,'  '+id+':'+JSON.stringify(layout)+',');disposeShip(model);
}
fs.writeFileSync(path,source);console.log('Seated three weapon layouts; other ships untouched.');
