import {createShipModel,disposeShip,modelIds,legacyIds} from '../../opendesign/mockups/galactic-command/ship-models.js';
export {createShipModel,disposeShip,modelIds,legacyIds};

// Geometry belongs to the cache. View instances own their mutable materials only.
// Exporters can continue using createShipModel() for fully independent ownership.
export class ShipModelCache {
  constructor(){this.models=new Map();this.instances=new Set();}
  acquire(id){
    let source=this.models.get(id);
    if(!source){source=createShipModel(id);this.models.set(id,source);}
    const instance=source.clone(true),materials=new Map();
    instance.traverse(object=>{
      if(!object.material)return;
      const clone=material=>{if(!materials.has(material))materials.set(material,material.clone());return materials.get(material);};
      object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
    });
    this.instances.add(instance);return instance;
  }
  release(root){
    if(!root)return;
    if(this.instances.delete(root)){
      const materials=new Set();root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);if(o.isInstancedMesh)o.dispose();});
      for(const material of materials)material.dispose();root.removeFromParent();return;
    }
    // Scale-comparison groups contain leased hulls alongside owned labels.
    for(const child of [...root.children])if(this.instances.has(child))this.release(child);
    disposeShip(root);root.removeFromParent();
  }
  dispose(){for(const instance of [...this.instances])this.release(instance);for(const source of this.models.values())disposeShip(source);this.models.clear();}
}
