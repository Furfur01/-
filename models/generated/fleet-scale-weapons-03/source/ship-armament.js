import {createShipKit} from './ship-sculpted-kit.js';
import {shipWeaponLayouts,spinalMounts} from '../../../game/ship-weapon-mounts.mjs';

export function fitShipArmament(model,id){
  const layout=shipWeaponLayouts[id];if(!layout)return model;
  if(layout.install===false){model.userData.weaponLayout=layout;return model;}
  const color={laser:0x83e7ff,plasma:0xc592ff,nuclear:0xa2ff91,heavy:0xd19aff,advanced:0xffe6a0}[layout.kind]||0x83e7ff;
  const k=createShipKit('Weapon_installations',{core:color});
  k.section('Primary_'+(layout.kind||'none'),()=>{
    for(const [x,y,z]of layout.muzzles){
      const r=layout.caliber;
      k.cyl(r*1.27,.62,x,y,z+.34,'side','z');
      k.cyl(r*1.12,.12,x,y,z+.1,'steel','z');
      k.ring(r*1.01,r*.13,x,y,z+.025,'armor');
      k.cyl(r*.87,.022,x,y,z+.027,'black','z');
      k.ring(r*.69,r*.07,x,y,z+.011,'core');
      k.cyl(r*.32,.012,x,y,z+(model.userData.revision==='remaining-three-view-01'?.02:.008),'core','z');
      for(const s of[-1,1])k.loft([[z+.07,r*.18,y-r*.66,y+r*.55],[z+.3,r*.27,y-r*.94,y+r*.81],[z+1.15,r*.19,y-r*.76,y+r*.61]],'light',x+s*r*1.14);
      if(layout.kind==='nuclear'){
        k.cyl(r,7.6,x,y,z+4.45,'dark','z');
        for(const dz of[1.3,3.6,6.8]){k.ring(r*1.08,.045,x,y,z+dz,'steel');k.ring(r*1.01,.016,x,y,z+dz+.1,'core');}
      }
    }
  });
  k.section('Point_defense_'+layout.pointDefense.length,()=>{
    layout.pointDefense.forEach(([x,y,z])=>k.turret(x,y,z,id==='Iron_Behemoth'?.29:.34));
  });
  model.add(k.finish());model.scale.setScalar(layout.scale);
  model.userData={...model.userData,preserved:false,retainedHull:id==='Dreadnought',revision:model.userData.rebuiltFromScratch?model.userData.revision:'fleet-sculpted-02',weaponLayout:layout,spinalMount:spinalMounts[id]??null};
  return model;
}
