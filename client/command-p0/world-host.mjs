// Operations only direct the persistent world camera. They never own a scene,
// graphics context, simulation entity, or rendering loop.
export const operationWorld=provided=>provided||globalThis.window?.CommandApp?.scene?.renderer||null;

// The world remains one canvas; management panels lend it their clear model area.
export function bindSupportFrame(world,element){
 if(!world||!element)return;
 world.supportFrame=element;
 return()=>{if(world.supportFrame===element)world.supportFrame=null;};
}

export function showOperationPreview(world,{id,grounded=false,staticArt=false}){
 if(!world)return false;
 if(grounded)return world.showDefense?.(id)===true;
 if(staticArt){world.hideShip?.();world.selectBuilding?.('Missile_Silo');return true;}
 if(typeof world.showShip!=='function')return false;
 world.showShip(id);return true;
}

export function focusOperationFacility(world,page){
 if(!world)return false;
 world.hideShip?.();world.selectBuilding?.(page==='research'?'Research_Lab':'Shipyard');return true;
}
