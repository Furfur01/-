import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Box3,Vector3,Raycaster} from 'three';
import {shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {createWeaponPreview} from '../opendesign/mockups/galactic-command/weapon-preview.js';

test('user loadouts have matching installed primary and point-defense assemblies',()=>{
  for(const [id,l]of Object.entries(shipWeaponLayouts)){
    const m=createShipModel(id);assert.deepEqual(m.userData.weaponLayout,l);assert.ok(m.scale.x>0);
    if(l.install!==false)assert.ok(m.getObjectByName('Point_defense_'+l.pointDefense.length));
    if(l.install!==false)assert.ok(m.getObjectByName('Primary_'+(l.kind||'none')));
    assert.ok(new Box3().setFromObject(m).getSize(new Vector3()).toArray().every(Number.isFinite));disposeShip(m);
  }
  assert.equal(shipWeaponLayouts.Dreadnought.muzzles.length,2);assert.equal(shipWeaponLayouts.Destroyer.kind,'plasma');
  assert.equal(shipWeaponLayouts.Interceptor.kind,'nuclear');assert.equal(shipWeaponLayouts.Devourer_Interceptor.muzzles.length,2);
  assert.equal(shipWeaponLayouts.Iron_Behemoth.muzzles.length,0);assert.ok(shipWeaponLayouts.Iron_Behemoth.pointDefense.length>=12);
  assert.ok(shipWeaponLayouts.Iron_Behemoth.scale/shipWeaponLayouts.Titanenergetic_Frigate.scale>=7-1e-10);
});
test('flagship preview intercepts both threats without a primary flash and cleans up',()=>{
  const scene=new Scene(),m=createShipModel('Iron_Behemoth'),preview=createWeaponPreview(scene);scene.add(m);assert.ok(preview.start(m));
  const seen=new Set();for(let t=0;t<12;t+=.05){preview.update(t);scene.traverse(o=>seen.add(o.name));assert.ok(scene.getObjectByName('Weapon_visual_demo').children.length<250);}
  assert.ok(seen.has('Incoming_missile'));assert.ok(seen.has('Incoming_fighter'));assert.ok(seen.has('Point_defense_bullet'));assert.ok(!seen.has('Primary_flash'));
  preview.stop();assert.equal(scene.children.length,1);assert.equal(preview.active,false);disposeShip(m);
});

test('point defense fires dense separate rounds with visible travel before interception',()=>{
  const scene=new Scene(),m=createShipModel('Destroyer'),preview=createWeaponPreview(scene);scene.add(m);preview.start(m);
  for(let t=0;t<=.6;t+=.01)preview.update(t);
  const g=scene.getObjectByName('Weapon_visual_demo'),rounds=g.children.filter(o=>o.name==='Point_defense_bullet');
  assert.ok(rounds.length>=24);assert.equal(g.getObjectByName('Point_defense_tracer'),undefined);
  const round=rounds[0],before=round.position.clone();preview.update(.7);
  assert.ok(round.parent);assert.ok(round.position.distanceTo(before)>.1);assert.ok(g.getObjectByName('Incoming_missile'));
  for(let t=.71;t<1.5;t+=.01)preview.update(t);
  assert.equal(g.getObjectByName('Incoming_missile'),undefined);preview.stop();disposeShip(m);
});

test('point-defense bases contact the hull instead of floating above it',()=>{
  for(const [id,l] of Object.entries(shipWeaponLayouts)){
    if(l.install===false)continue;const m=createShipModel(id);m.updateMatrixWorld(true);
    const hull=m.children.filter(o=>o.name!=='Weapon_installations');
    for(const [x,y,z] of l.pointDefense){
      const origin=m.localToWorld(new Vector3(x,y+1,z));
      const hit=new Raycaster(origin,new Vector3(0,-1,0)).intersectObjects(hull,true)[0];
      assert.ok(hit,id+' missing hull under point defense');
      assert.ok(Math.abs(m.worldToLocal(hit.point).y-y)<.03,id+' detached point defense');
    }
    disposeShip(m);
  }
});

test('new hulls preserve recovered orthographic proportions and distinctive sections',()=>{
  const destroyer=createShipModel('Destroyer');destroyer.scale.setScalar(1);destroyer.updateMatrixWorld(true);
  const wings=[-1,1].map(s=>destroyer.getObjectByName('D04_Straight_downturned_tail_'+s));
  for(const wing of wings){
    assert.ok(wing);const box=new Box3().setFromObject(wing);
    assert.ok(box.max.y<1);assert.ok(box.getSize(new Vector3()).y>1);
    const heights=[2,4.9].map(x=>new Raycaster(new Vector3(Math.sign(box.min.x)*x,3,4.2),new Vector3(0,-1,0)).intersectObject(wing,true)[0].point.y);
    assert.ok(heights[1]<heights[0]-.2);
  }
  const a=new Box3().setFromObject(wings[0]),b=new Box3().setFromObject(wings[1]);assert.ok(Math.abs(a.min.z-b.min.z)<1e-6);assert.ok(Math.abs(a.max.z-b.max.z)<1e-6);
  const flagship=createShipModel('Iron_Behemoth');
  for(const [m,ref] of [[destroyer,[11.016845,4.606928,14]],[flagship,[8.285257,6.693148,14]]]){
    assert.equal(m.userData.rebuiltFromScratch,true);
    const bounds=new Box3().setFromObject(m).getSize(new Vector3()).divideScalar(m.scale.x).toArray();
    bounds.forEach((v,i)=>assert.ok(Math.abs(v/ref[i]-1)<.06,'normalized orthographic envelope'));
  }
  flagship.scale.setScalar(1);flagship.updateMatrixWorld(true);
  const core=flagship.getObjectByName('B01_Triangular_cross_section_hull');
  const height=x=>new Raycaster(new Vector3(x,6,-4),new Vector3(0,-1,0)).intersectObject(core,true)[0].point.y;
  assert.ok(height(0)-height(2.3)>1.8,'triangular front section');
  const leftLeg=new Box3().setFromObject(flagship.getObjectByName('B02_Deep_cranked_forward_leg_-1'));
  assert.ok(leftLeg.min.y<-3.25,'deep cranked legs');
  assert.ok(flagship.getObjectByName('B03_Narrow_neck_and_transverse_flag_bridge'));
  disposeShip(destroyer);disposeShip(flagship);
});
