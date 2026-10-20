import fs from 'node:fs';
import {writeBuildFile} from './write-build-file.mjs';
import path from 'node:path';
import {Box3,Vector3,Matrix3,Raycaster} from 'three';
import {enginePorts,shipPropulsion} from '../game/ship-propulsion.mjs';
import {installFlightArmament} from './flight-armament.mjs';
import {mainGunVisual} from '../game/ship-main-effects.mjs';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {shipWeaponLayouts,shipLengths,spinalMounts} from '../game/ship-weapon-mounts.mjs';
import {publicCatalog} from '../game/catalog.mjs';
import {weaponEffects} from '../opendesign/mockups/galactic-command/weapon-preview.js';

// The original flight renderer uses -X forward; the approved models use -Z.
const native=([x,y,z])=>[z,y,-x];
export function buildFlightFleet(dir){
  const ids=['Destroyer','Cruiser','Battleship','Heavy_Fighter','Dreadnought','Light_Fighter','Bomber','Titanenergetic_Frigate','Interceptor','Devourer_Interceptor','Iron_Behemoth','Reaper','Annihilator'];
  const chunks=[],ships=[],layouts=[],profiles=[],parts=[];let offset=0;
  for(const [index,id]of ids.entries()){
    const model=createShipModel(id),layout=model.userData.weaponLayout||shipWeaponLayouts[id],length=shipLengths[id],meta=publicCatalog.shipArchive.find(s=>s.id===id),fx=weaponEffects[layout.kind],vertices=[];
    model.updateMatrixWorld(true);const armament=installFlightArmament(model,id);const bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    model.traverse(mesh=>{
      if(!mesh.isMesh)return;
      let owner=mesh;while(owner&&!armament.owners.has(owner))owner=owner.parent;const jointList=armament.owners.get(owner);
      const g=mesh.geometry,normalMatrix=new Matrix3().getNormalMatrix(mesh.matrixWorld),mat=mesh.material,p=new Vector3(),n=new Vector3(),rgb=mat.color.clone().convertLinearToSRGB().toArray();
      const tag=/Point_defense/.test(mesh.name)?3:/missile/i.test(mesh.name)?2:/Primary|weapon|emitter/i.test(mesh.name)?1:0;
      for(let i=0;i<(g.index?.count||g.attributes.position.count);i++){
        const j=g.index?g.index.getX(i):i;p.fromBufferAttribute(g.attributes.position,j).applyMatrix4(mesh.matrixWorld);n.fromBufferAttribute(g.attributes.normal,j).applyNormalMatrix(normalMatrix);
        const c=g.attributes.color?[g.attributes.color.getX(j),g.attributes.color.getY(j),g.attributes.color.getZ(j)]:rgb;
        // A bounded depth tie-breaker favors the light armor over coincident dark backing.
        const layer=1+Math.round((c[0]*.2126+c[1]*.7152+c[2]*.0722)*15);
        const code=g.attributes.joint?.getX(j)||0,joint=code?jointList?.[Math.floor((code-1)/2)]:null;
        if(code&&!joint)throw Error('Missing articulated geometry owner: '+id+' '+mesh.name);
        const position=native(p.toArray());if(joint)for(let a=0;a<3;a++)position[a]-=joint.mount[a];
        if(joint?.neutralYaw){position[0]*=-1;position[2]*=-1;n.x*=-1;n.z*=-1;}
        (joint?joint.vertices[(code-1)%2]:vertices).push(...position,...native(n.toArray()),...c,mat.emissiveIntensity&&mat.emissive?.getHex()?Math.min(1,mat.emissiveIntensity):0,tag,-layer,0);
      }
    });
    const data=new Float32Array(vertices);chunks.push(Buffer.from(data.buffer));
    const convert=p=>native(model.localToWorld(new Vector3(...p)).toArray());
    const pdJoints=armament.joints.filter(t=>t.role==='pd');
    const pdScale=layout.pdScale||(id==='Iron_Behemoth'?.29:.34);
    const measured=[];
    model.traverse(owner=>{for(const e of owner.userData.engineNozzles||[]){const p=owner.localToWorld(new Vector3(...e.position)),direction=new Vector3(...e.direction).transformDirection(owner.matrixWorld);measured.push({position:native(p.toArray()),direction:native(direction.toArray()),radius:e.radius*owner.getWorldScale(new Vector3()).x,source:'modeled nozzle'});}});
    const engines=measured.length?measured:enginePorts[id].map(([x,y,z,r])=>{
      const pos=model.localToWorld(new Vector3(x,y,z));
      const ray=new Raycaster(new Vector3(pos.x,pos.y,bounds.max.z+length),new Vector3(0,0,-1));
      const hit=ray.intersectObject(model,true)[0];
      if(!hit)throw Error('Engine nozzle is not attached: '+id);
      pos.z=hit.point.z-r*model.scale.x*.015;
      return {position:native(pos.toArray()),direction:[1,0,0],radius:r*model.scale.x};
    });
    layouts.push({id,length,scale:1,bridge:[0,bounds.max.y+length*.025,center.z+length*.2],chase:[length*.6,length*.55,length*1.5],focus:[0,0,-length*.25],main:layout.muzzles.map(convert),tubes:[...(layout.missiles||[]),...armament.tubes].map(convert),tubeDirections:[...(layout.missiles||[]).map((_,i)=>native(layout.missileDirections?.[i]||layout.launchDirection||[0,0,-1])),...armament.tubes.map(()=>[0,1,0])],joints:armament.joints,mounts:pdJoints.map(t=>t.mount),pdMuzzles:pdJoints.map(t=>t.mount.map((v,i)=>v+t.muzzles[0][i])),engines,propulsion:shipPropulsion(meta),turretScale:model.scale.x*pdScale,bounds:{center:native(center.toArray()),half:[size.z/2,size.y/2,size.x/2]},archiveDistance:length*2.6});
    const color=fx?[((fx.color>>16)&255)/255,((fx.color>>8)&255)/255,(fx.color&255)/255]:[1,.77,.42],small=length<=5;
    profiles.push({role:meta.name,className:id.replaceAll('_',' ').toUpperCase(),length:'舰长比例 '+length,relativeLength:length,maxSpeed:small?280:length>=50?75:120,turnRate:small?1.0:length>=50?.14:.3,turnResponse:small?6:2.8,accel:small?1.2:.4,chargeTime:fx?.charge||0,mainCooldown:small?.32:layout.kind==='ion'?.4:3.4,mainDamage:small?5:layout.kind==='ion'?6:32,beamWidth:Math.max(.02,layout.caliber*Math.min(model.scale.x,Math.sqrt(model.scale.x))),salvo:layout.missiles?.length||0,missileCooldown:4,missileCapacity:(layout.missiles?.length||0)*4,missileDamage:5,turretDamage:.12,turretCooldown:.045,capital:!small,fixedPrimary:!!layout.muzzles.length&&!['shell','ion'].includes(layout.kind),spinal:!!spinalMounts[id],primaryName:layout.primary,primaryKind:layout.kind||'none',beam:!!fx?.beam,weaponColor:color,projectileSpeed:{plasma:180,nuclear:145,heavy:420,shell:620,ion:380,advanced:500}[layout.kind]||640});
    profiles.at(-1).salvo=layouts.at(-1).tubes.length;profiles.at(-1).missileCapacity=profiles.at(-1).salvo*4;profiles.at(-1).defenseOnly=id==='Iron_Behemoth';
    profiles.at(-1).secondary={kind:layout.kind==='laser'?'laser':layout.kind==='plasma'?'plasma':layout.kind==='heavy'?'heavy':'shell',color,range:id==='Iron_Behemoth'?160:800,speed:layout.kind==='plasma'?240:480,cooldown:id==='Iron_Behemoth'?1.4:.85,damage:1.2};
    profiles.at(-1).visual=mainGunVisual(layout.kind,length,layout.caliber*model.scale.x);
    if(id==='Reaper')Object.assign(profiles.at(-1),{special:'reaper',chargeTime:1.1,mainCooldown:5.5,mainDamage:115,beam:true,fixedPrimary:true,weaponColor:[.18,1,.68],trialShield:100});
    if(id==='Annihilator')Object.assign(profiles.at(-1),{special:'antimatter',capital:true,chargeTime:.85,mainCooldown:9,mainDamage:180,fixedPrimary:true,weaponColor:[.82,.35,1],maxSpeed:200,turnRate:1.2});
    const u=publicCatalog.units[id],weapons=[];
    if(layout.muzzles.length||id==='Annihilator')weapons.push([layout.primary,profiles.at(-1).special?'原创演练配置':'已确认舰载配置',String(layout.kind).toUpperCase(),null]);
    if(layouts.at(-1).tubes.length)weapons.push(['导弹齐射','原有发射口','MISSILES',null]);
    if(armament.joints.some(t=>t.role==='secondary'))weapons.push(['旋转副炮','中距支援 / 受射界限制','SECONDARY',null]);
    if(pdJoints.length)weapons.push(['近防机炮','慢弹丸 / 高射速','POINT DEFENSE',null]);
    ships.push({id,name:meta.name,en:id.replaceAll('_',' ').toUpperCase(),code:'APK '+meta.apkId,serial:String(meta.apkId).padStart(2,'0'),count:0,stats:['strength','shield','attack','speed','cargo','fuel'].map(k=>meta.stats[k]??null),statsSource:meta.statsSource,levels:weapons.map(()=>0),weapons,offset,floatCount:data.length,triangles:data.length/39,relativeLength:length});offset+=data.length;disposeShip(model);
  }
  // Same measured mounts drive practice visuals and authoritative battle launches.
  writeBuildFile(path.resolve(import.meta.dirname,'../game/ship-flight-hardpoints.json'),JSON.stringify(Object.fromEntries(layouts.map(l=>[l.id,{main:l.main,tubes:l.tubes,directions:l.tubeDirections,secondary:l.joints.filter(j=>j.role==='secondary').map(j=>j.mount),pd:l.joints.filter(j=>j.role==='pd').map(j=>j.mount)}])),null,2));
  for(const layout of layouts)for(const joint of layout.joints){for(const vertices of joint.vertices){const data=new Float32Array(vertices);joint.parts.push(parts.length);parts.push({offset,floatCount:data.length});chunks.push(Buffer.from(data.buffer));offset+=data.length;}delete joint.vertices;}
  writeBuildFile(path.join(dir,'flight-fleet.bin'),Buffer.concat(chunks));
  const result={ships,layouts,profiles,parts};writeBuildFile(path.join(dir,'flight-fleet.json'),JSON.stringify(result));return result;
}

