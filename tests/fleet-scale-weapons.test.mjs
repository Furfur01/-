import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3,Scene,Raycaster} from 'three';
import {shipLengths,shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {createWeaponPreview} from '../opendesign/mockups/galactic-command/weapon-preview.js';

test('ships use approved and trial hull lengths, small fighters have no PD turrets',()=>{
  assert.deepEqual(Object.values(shipLengths),[1,2,5,10,20,20,20,25,50,50,200,90,8]);
  for(const [id,length]of Object.entries(shipLengths)){
    const model=createShipModel(id),box=new Box3().setFromObject(model);
    assert.ok(Math.abs(box.max.z-box.min.z-length)<1e-8,id);
    assert.equal(model.userData.relativeLength,length);
    assert.equal(model.scale.x,model.scale.y);assert.equal(model.scale.x,model.scale.z);
    if(length<=5){assert.equal(model.userData.weaponLayout.pointDefense.length,0);assert.equal(model.getObjectByName('Point_defense_4'),undefined);}
    disposeShip(model);
  }
});

test('every cannon has clear forward fire and its muzzle touches existing geometry',()=>{
  for(const [id,layout]of Object.entries(shipWeaponLayouts)){
    const model=createShipModel(id);model.scale.setScalar(1);model.updateMatrixWorld(true);
    for(const p of [...layout.muzzles,...(layout.missiles||[])]){
      const origin=new Vector3(...p),direction=new Vector3(...((layout.missiles||[]).includes(p)?layout.launchDirection||[0,0,-1]:[0,0,-1]));
      assert.equal(new Raycaster(origin,direction,.005,15).intersectObject(model,true).length,0,id+' blocked muzzle');
      const rear=new Raycaster(origin,direction.clone().negate(),0,.08).intersectObject(model,true);
      assert.ok(rear.length,id+' floating muzzle');
    }
    disposeShip(model);
  }
});

test('all weapon families animate, Titan launches from all twelve ports, switching frees effects',()=>{
  const scene=new Scene(),preview=createWeaponPreview(scene);
  const expected={Light_Fighter:'Primary_light_laser_beam',Heavy_Fighter:'Primary_heavy_laser_beam',Cruiser:'Ion_impact_arcs',Battleship:'Primary_shell_projectile',Bomber:'Guided_missile',Dreadnought:'Primary_laser_beam',Destroyer:'Plasma_bloom',Interceptor:'Collapse_bloom',Devourer_Interceptor:'Shield_puncture',Titanenergetic_Frigate:'Primary_advanced_projectile',Iron_Behemoth:'Point_defense_bullet'};
  for(const [id,name]of Object.entries(expected)){
    const model=createShipModel(id);model.position.set(3,2,-4);scene.add(model);assert.ok(preview.start(model));
    const seen=new Set(),ports=new Set(),flashes=new Set();
    for(let i=0;i<330;i++){
      preview.update(i/60);
      scene.getObjectByName('Weapon_visual_demo').traverse(o=>{
        seen.add(o.name);
        assert.ok([...o.position.toArray(),...o.scale.toArray()].every(Number.isFinite),id);
        if(o.name==='Missile_port_flash'&&!flashes.has(o)){flashes.add(o);ports.add(model.worldToLocal(o.position.clone()).toArray().map(v=>v.toFixed(3)).join(','));}
      });
      assert.ok(scene.getObjectByName('Weapon_visual_demo').children.length<300);
    }
    assert.ok(seen.has(name),id+' missing '+name);
    if(id==='Titanenergetic_Frigate'){
      assert.deepEqual(ports,new Set(shipWeaponLayouts[id].missiles.map(p=>p.map(v=>v.toFixed(3)).join(','))));
      assert.equal(seen.has('Point_defense_bullet'),false);
    }
    if(id==='Iron_Behemoth')assert.equal([...seen].some(s=>s.startsWith('Primary_')),false);
    preview.stop();assert.equal(scene.children.length,1);model.removeFromParent();disposeShip(model);
  }
});

test('manual range waits for commands, separates main guns and missiles, records hits on its target plane',()=>{
  const scene=new Scene(),model=createShipModel('Titanenergetic_Frigate'),preview=createWeaponPreview(scene),hits=[];
  scene.add(model);preview.start(model,{automatic:false,defense:false,targetZ:-12,onHit:kind=>hits.push(kind)});
  preview.update(0);preview.update(1);
  assert.equal(scene.getObjectByName('Weapon_visual_demo').children.length,0);
  assert.equal(preview.firePrimary(),true);assert.equal(preview.firePrimary(),false);
  for(let i=101;i<240;i++)preview.update(i/100);
  assert.deepEqual(hits,['advanced','advanced']);
  assert.equal(scene.getObjectByName('Guided_missile'),undefined);
  assert.equal(preview.fireMissiles(),true);assert.equal(preview.fireMissiles(),false);
  let impactSamples=0;
  for(let i=240;i<630;i++){preview.update(i/100);for(const o of scene.getObjectByName('Weapon_visual_demo').children.filter(o=>o.name==='Impact_flash')){impactSamples++;assert.ok(Math.abs(model.worldToLocal(o.position.clone()).z+12)<1e-6);}}
  assert.ok(impactSamples>0);
  assert.equal(hits.filter(k=>k==='missile').length,12);

  preview.stop();disposeShip(model);
});
