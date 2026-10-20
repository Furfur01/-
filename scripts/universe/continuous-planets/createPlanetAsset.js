import * as DefaultTHREE from 'three';
import { createTerrainField } from './fields.js';
import { surfaceNormal } from './cube.js';
import { TerrainLOD } from './TerrainLOD.js';
import { createSolidAtmosphere } from './Atmosphere.js';
import { createGasGiant } from './gas.js';
import { createDecorations } from './Decorations.js';
import { PLANET_DEFAULTS,qualityConfig } from './config.js';

/** Host-owned scene, renderer, camera, DOM and frame loop. All samples are LOCAL. */
export function createPlanetAsset(options={}){
 const {THREE=DefaultTHREE,type='terrestrial',quality='standard'}=options;
 if(!PLANET_DEFAULTS[type])throw new Error(`Unsupported planet type: ${type}`);
 const {seed=PLANET_DEFAULTS[type].seed,radius=PLANET_DEFAULTS[type].radius}=options;
 if(!Number.isFinite(radius)||radius<=0)throw new Error('radius must be positive scene units');qualityConfig(quality);
 const root=new THREE.Group();root.name=`planet:${type}:${seed}`;
 const groups={};for(const name of ['surface','liquid','decorations','clouds','atmosphere']){groups[name]=new THREE.Group();groups[name].name=name;root.add(groups[name]);}
 const field=type==='gas'?null:options.field||createTerrainField(type,seed);let terrain,atmosphere,gas,decorations;
 if(field){terrain=new TerrainLOD({THREE,field,type,seed,radius,quality,surface:groups.surface,liquid:groups.liquid,pool:options.pool,coverage:options.coverage});atmosphere=createSolidAtmosphere({THREE,type,seed,radius});groups.atmosphere.add(atmosphere.root);groups.clouds.add(atmosphere.clouds);decorations=createDecorations({THREE,field,type,seed,radius,quality});groups.decorations.add(decorations.root);}
 else{gas=createGasGiant({THREE,seed,radius,quality});groups.clouds.add(gas.groups.clouds);groups.atmosphere.add(gas.groups.atmosphere);}
 let visible=true,disposed=false,currentQuality=quality,weatherTime=0;
 const unit=new THREE.Vector3();
 const asset={root,groups,type,seed,radius,landmarks:field?.landmarks||gas.landmarks,ready:terrain?.ready||Promise.resolve(),
  sampleSurface(directionLocal){
   if(!field||disposed)return null;unit.copy(directionLocal?.isVector3?directionLocal:new THREE.Vector3(...directionLocal)).normalize();
   if(unit.lengthSq()===0)throw new Error('Surface direction must be nonzero');const s=field.sample(unit.x,unit.y,unit.z),normal=new THREE.Vector3(...surfaceNormal(field,unit.x,unit.y,unit.z));
   return {height:s.height*radius,normal,liquidHeight:s.liquidHeight===null?null:s.liquidHeight*radius,biomeWeights:s.biomeWeights,navigationHeight:Math.max(s.height*radius,terrain.navigationHeight(unit)??s.height*radius)};
  },
  setLighting(light){if(disposed)return;terrain?.setLighting(light);atmosphere?.setLighting(light);gas?.setLighting(light);decorations?.setLighting?.(light);},
  navigationHeight(direction){unit.copy(direction?.isVector3?direction:new THREE.Vector3(...direction)).normalize();return terrain?.navigationHeight(unit)??null;},
  renderedHeight(direction){return terrain?.renderedHeight(direction)??null;},
  setFacilityClearance(sites){gas?.setFacilityClearance(sites);},
  update(params){
   if(disposed)return;if(params.visible!==undefined&&params.visible!==visible)asset.setVisible(params.visible);if(!visible)return;
   weatherTime=params.weatherTime??params.time??weatherTime;
   const frame={...params,dt:Math.min(.1,params.dt||0),time:params.time||0,weatherTime,visible:true};terrain?.update(frame);atmosphere?.update(frame);gas?.update(frame);decorations?.update(frame);
  },
  setQuality(q){if(disposed)return;qualityConfig(q);currentQuality=q;terrain?.setQuality(q);gas?.setQuality(q);decorations?.setQuality(q);},
  setVisible(v){if(disposed||visible===Boolean(v))return;visible=Boolean(v);root.visible=visible;terrain?.setVisible(visible);gas?.setVisible?.(visible);if(!visible)decorations?.update({eyeLocal:new THREE.Vector3(radius*10,0,0),visible:false,dt:0,time:0});},
  getStats(){return {type,seed,radius,quality:currentQuality,visible,disposed,solidSurface:!!field,...(terrain?.getStats()||gas?.getStats()),decorations:decorations?.getStats()||null};},
  dispose(){if(disposed)return;disposed=true;terrain?.dispose();atmosphere?.dispose();gas?.dispose();decorations?.dispose();for(const g of Object.values(groups))g.clear();root.clear();root.removeFromParent();visible=false;},
 };
 return asset;
}
