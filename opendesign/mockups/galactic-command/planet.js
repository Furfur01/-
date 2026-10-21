import {WorldRuntime} from '../../../scripts/universe/world.js';
import {installChartControls} from '../../../scripts/universe/chart-controls.js';
import {MapCombat} from './map-combat.js';
import galaxyLayout from '../planet-construction-review/galaxy-layout.json';
installChartControls();
// One persistent frame/context for the complete map, every biome and moons.
class PlanetScene {
 constructor(container,{onBuilding,onApproach,onNavigation}={}){
  Object.assign(this,{container,onBuilding,onApproach,onNavigation,mode:'galaxy',active:true,close:false,appearance:'terrestrial'});
  this.host=document.createElement('div');this.host.className='aurora-scene-host';container.append(this.host);
  this.controls=document.createElement('nav');this.controls.className='aurora-game-controls';this.controls.innerHTML='<button data-view="galaxy">银河</button><button data-view="system">恒星系</button><button data-view="home">当前殖民地</button><button data-view="environment">地貌</button><button data-building="Metal_Mine">金属</button><button data-building="Crystal_Mine">晶体</button><button data-building="Gas_Mine">气体</button><button data-building="Shipyard">太空电梯</button>';
  this.host.append(this.controls);this.controls.querySelectorAll('[data-building]').forEach(b=>b.hidden=true);this.controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.building){this.selectBuilding(b.dataset.building);this.onBuilding?.(b.dataset.building);}else if(b.dataset.view==='galaxy')this.showGalaxy();else if(b.dataset.view==='system')this.showSystem();else if(b.dataset.view==='environment')this.renderer?.toPlanet(this.mapSelectedId);else this.orbit();});
  this.world=new WorldRuntime(this.host,{onBuilding:id=>{if(this.active)this.onBuilding?.(id);},onNavigation:d=>{if(d.planetId)this.mapSelectedId=d.planetId;if(d.system)this.system=d.system.slice();this.navigationLevel=d.level;if(['system','level','select'].includes(d.type))this.combat?.sync();this.onNavigation?.(d);},onDismiss:()=>window.dispatchEvent(new CustomEvent('chart-dismiss',{cancelable:true}))});
  const qualityLabel=this.qualityLabel=document.createElement('label');qualityLabel.className='planet-quality';qualityLabel.innerHTML='星球画质 <select aria-label="星球画质"><option value="low">低</option><option value="standard">标准</option><option value="high">高</option></select>';(document.querySelector('#chart-view-menu .view-actions')||this.controls).append(qualityLabel);this.qualitySelect=qualityLabel.querySelector('select');this.qualitySelect.value=this.world.planetQuality;this.qualitySelect.addEventListener('change',()=>this.world.setPlanetQuality(this.qualitySelect.value));
  this.capitalButton=document.createElement('button');this.capitalButton.textContent='市政中心';this.capitalButton.className='text-button';this.capitalButton.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('chart-dismiss',{cancelable:true}));this.selectBuilding('Command_Center');});this.qualityLabel.before(this.capitalButton);
  this.elevatorViewButtons=[['full','太空电梯全景'],['shipyard','轨道造船厂']].map(([view,label])=>{const button=document.createElement('button');button.textContent=label;button.className='text-button';button.dataset.elevatorView=view;button.hidden=true;button.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('chart-dismiss',{cancelable:true}));this.focusElevator(view);});this.qualityLabel.before(button);return button;});
  this._visibility=()=>this.renderer?.setActive(this.active&&!document.hidden);document.addEventListener('visibilitychange',this._visibility);
  this.combat=new MapCombat(this);this.mapPromise=this.loadMap();
 }
 async loadMap(){try{const response=await fetch('/api/star-map');if(!response.ok)throw Error('星图目录读取失败');this.map=await response.json();this.mapUpdatedAt=Date.now();this.sync();if(this.pendingView&&this.renderer?.ready){const next=this.pendingView;this.pendingView=null;next();}this.onNavigation?.({type:'directory'});return this.map;}catch(e){this.mapError=e.message;console.error(e);return null;}}
 get renderer(){return this.world;}
 get snapshot(){return this.renderer?.snapshot;}
 // Historical server coordinates stay intact. Holdings and live routes take priority.
 // Display anchors are resolved stars from the selected image, shared with the point cloud.
 get chartSystems(){
  if(!this.map)return [];
  const required=new Set([this.system?.[1],...(this.universe?.battles||[]).map(b=>b.position?.[1]),...(this.universe?.planets||[]).filter(p=>p.position[0]===1).map(p=>p.position[1]),...(this.universe?.missions||[]).flatMap(m=>[m.position,m.fromPosition]).filter(p=>p?.[0]===1).map(p=>p[1])].filter(Number.isInteger));
  const stars=this.map.systems,territories=new Map();
  for(const p of this.universe?.map||[])if(p.position[0]===1&&p.systemOwner&&!territories.has(p.position[1])){const {systemOwner,systemOwnerName,systemColor}=p;territories.set(p.position[1],{systemOwner,systemOwnerName,systemColor});}
  for(const s of stars)if(s.systemOwner||s.expansionZone)required.add(s.id);
  for(const s of stars){if(required.size>=256)break;required.add(s.id);}
  return stars.filter(s=>required.has(s.id)).map(s=>({...s,...territories.get(s.id),position:galaxyLayout.systems[s.id-1].position.slice(),galaxyStar:{size:galaxyLayout.systems[s.id-1].size,brightness:galaxyLayout.systems[s.id-1].brightness}}));
 }

 isOwnedSelection(){const p=this.targets.find(p=>p.key===this.mapSelectedId||p.id===this.mapSelectedId);return !!this.universe?.planets.some(q=>q.id===p?.id);}
 get targets(){if(!this.map)return [];const records=new Map(this.map.planets.map(p=>[p.key,p]));for(const p of [...(this.universe?.map||[]),...(this.universe?.planets||[])]){if(p.position[0]!==1)continue;const key=p.moon?`moon:${p.id}`:p.position.join(':');const previous=records.get(key);records.set(key,{...previous,...p,biome:p.moon?'moon':p.biome,key,name:p.id?p.name:previous?.catalogName||p.name,catalogName:previous?.catalogName,ownerName:p.owner&&p.owner===this.universe?.player?.id?this.universe.player.name:p.ownerName||previous?.ownerName});}return [...records.values()];}
 sync(){const r=this.renderer;if(!r?.ready||!this.planet||!this.map)return;r.applyPlanet(this.planet,this.catalog,window.EmpireAPI?.now||Date.now());r.setNavigationState({astrophysics:this.universe?.player?.tech?.Astrophysics_Tech||0,logistics:this.universe?.logistics||[],battles:this.universe?.battles||[],systems:this.chartSystems,planets:this.targets,ownedPlanets:this.universe?.planets.filter(p=>p.position[0]===1)||[],missions:(this.universe?.missions||[]).filter(m=>['outbound','return','holding','waiting','engaged'].includes(m.phase)).map(m=>({...m,fromPosition:m.fromPosition||this.universe?.planets.find(p=>p.id===m.from)?.position,count:Object.values(m.ships||{}).reduce((a,b)=>a+b,0)})),activePlanetId:this.planet.id,playerId:this.universe?.player?.id,homePlanetId:this.universe?.player?.home});}
 updateNavigation(state,system){if(this.map&&Date.now()-(this.mapUpdatedAt||0)>15000&&!this.mapRefreshing){this.mapRefreshing=true;this.loadMap().finally(()=>{this.mapRefreshing=false;});}this.universe=state;if(!this.system&&system)this.system=system.slice();this.sync();this.combat.sync();}
 updatePlanet(planet,catalog,{sync=true}={}){if(!planet)return;this.planet=planet;this.catalog=catalog;this.capitalButton.hidden=!!planet.moon;for(const button of this.elevatorViewButtons)button.hidden=!!planet.moon;this.appearance=planet.moon?'moon':planet.biome;if(sync)this.sync();}
 navigate(fn){if(this.renderer?.ready&&this.map)fn();else this.pendingView=fn;}
 locateColony(id=this.universe?.player?.home){this.navigate(()=>this.renderer.locateColony(id));}
 fitColonies(){this.navigate(()=>this.renderer.fitColonies());}
 async prepareDeparture(){await this.mapPromise;await this.renderer.prepareMapFleet();}
 showDeparture(id){this.navigate(()=>this.renderer.focusMapMission(id));}
 showGalaxy(){this.navigate(()=>this.renderer.toGalaxy());}
 showSystem(){this.navigate(()=>this.renderer.focusSystem(this.system?.[1]||this.planet.position[1]));}
 showPlanet(){this.navigate(()=>this.renderer.toPlanet(this.planet.id,{orbit:true}));}
 selectPlanet(id){this.mapSelectedId=id;this.renderer?.selectNavigationPlanet(id,{focus:true});}
 enterPlanet(id){this.mapSelectedId=id;this.renderer?.toPlanet(id);}
 preparePlanetEntry(){}
 selectBuilding(id){this.close=true;this.renderer?.selectBuilding(id);this.onApproach?.(true);}
 focusElevator(view='full'){this.close=true;this.navigate(()=>this.renderer.focusElevator(view));this.onApproach?.(true);}
 approach(){this.close=true;this.renderer?.toPlanet(this.planet.id);this.onApproach?.(true);}
 orbit(){this.close=false;this.showPlanet();this.onApproach?.(false);}
 setMode(mode){this.mode=mode;this.active=mode!=='battle';this.host.style.visibility=this.active?'visible':'hidden';this.host.style.pointerEvents=this.active?'auto':'none';if(mode!=='hangar')this.renderer?.hideShip();this.renderer?.setActive(this.active&&!document.hidden);this.combat.sync();}
 dispose(){this.combat.dispose();this.renderer?.dispose();document.removeEventListener('visibilitychange',this._visibility);this.qualityLabel?.remove();this.capitalButton?.remove();for(const button of this.elevatorViewButtons)button.remove();this.host.remove();}
}
window.PlanetScene=PlanetScene;
