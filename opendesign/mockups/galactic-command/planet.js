// One persistent frame/context for the complete map, every biome and moons.
class PlanetScene {
 constructor(container,{onBuilding,onApproach,onNavigation}={}){
  Object.assign(this,{container,onBuilding,onApproach,onNavigation,mode:'galaxy',active:true,close:false,appearance:'terrestrial'});
  this.host=document.createElement('div');this.host.className='aurora-scene-host';container.append(this.host);
  this.frame=document.createElement('iframe');this.frame.className='aurora-game-frame';this.frame.title='连续银河星图';this.frame.addEventListener('load',()=>this.connect());this.host.append(this.frame);
  this.controls=document.createElement('nav');this.controls.className='aurora-game-controls';this.controls.innerHTML='<button data-view="galaxy">银河</button><button data-view="system">恒星系</button><button data-view="home">本方星球</button><button data-view="environment">地貌</button><button data-building="Metal_Mine">金属</button><button data-building="Crystal_Mine">晶体</button><button data-building="Gas_Mine">气体</button><button data-building="Shipyard">太空电梯</button>';
  this.host.append(this.controls);this.controls.querySelectorAll('[data-building]').forEach(b=>b.hidden=true);this.controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.building){this.selectBuilding(b.dataset.building);this.onBuilding?.(b.dataset.building);}else if(b.dataset.view==='galaxy')this.showGalaxy();else if(b.dataset.view==='system')this.showSystem();else if(b.dataset.view==='environment')this.renderer?.toPlanet(this.mapSelectedId);else this.orbit();});
  this.frame.src='../planet-construction-review/index.html?mode=game&v=5';
  this._visibility=()=>this.renderer?.setActive(this.active&&!document.hidden);document.addEventListener('visibilitychange',this._visibility);
  this.mapPromise=this.loadMap();
 }
 async loadMap(){try{const response=await fetch('/api/star-map');if(!response.ok)throw Error('星图目录读取失败');this.map=await response.json();this.sync();if(this.pendingView&&this.renderer?.ready){const next=this.pendingView;this.pendingView=null;next();}return this.map;}catch(e){this.mapError=e.message;console.error(e);return null;}}
 get renderer(){return this.frame.contentWindow?.AURORA;}
 get snapshot(){return this.renderer?.snapshot;}
 connect(){const win=this.frame.contentWindow;const ready=()=>{this.sync();this.renderer?.setActive(this.active);if(this.pendingView){const view=this.pendingView;this.pendingView=null;view();}};win.addEventListener('aurora-ready',ready,{once:true});win.addEventListener('aurora-building',e=>{if(this.active)this.onBuilding?.(e.detail.id);});win.addEventListener('aurora-navigation',e=>{if(!this.active)return;const d=e.detail;if(d.planetId)this.mapSelectedId=d.planetId;if(d.system)this.system=d.system.slice();this.navigationLevel=d.level;this.controls.querySelectorAll('[data-building]').forEach(b=>b.hidden=d.level!=='planet'||!this.isOwnedSelection());this.onNavigation?.(d);});if(this.renderer?.ready)ready();}
 isOwnedSelection(){const p=this.targets.find(p=>p.key===this.mapSelectedId||p.id===this.mapSelectedId);return !!this.universe?.planets.some(q=>q.id===p?.id);}
 get targets(){if(!this.map)return [];const records=new Map(this.map.planets.map(p=>[p.key,p]));for(const p of this.universe?.map||[]){if(p.position[0]!==1)continue;const key=p.moon?`moon:${p.id}`:p.position.join(':');const previous=records.get(key);records.set(key,{...previous,...p,biome:p.moon?'moon':p.biome,key,name:p.id?p.name:previous?.catalogName||p.name,catalogName:previous?.catalogName});}return [...records.values()];}
 sync(){const r=this.renderer;if(!r?.ready||!this.planet||!this.map)return;r.applyPlanet(this.planet,this.catalog,window.EmpireAPI?.now||Date.now());r.setNavigationState({systems:this.map.systems,planets:this.targets,ownedPlanets:this.universe?.planets.filter(p=>p.position[0]===1)||[],missions:(this.universe?.missions||[]).filter(m=>['outbound','return'].includes(m.phase)).map(m=>({...m,fromPosition:m.fromPosition||this.universe?.planets.find(p=>p.id===m.from)?.position,count:Object.values(m.ships||{}).reduce((a,b)=>a+b,0)})),activePlanetId:this.planet.id,homePlanetId:this.universe?.player.home});}
 updateNavigation(state,system){this.universe=state;if(!this.system&&system)this.system=system.slice();this.sync();}
 updatePlanet(planet,catalog){if(!planet)return;this.planet=planet;this.catalog=catalog;this.appearance=planet.moon?'moon':planet.biome;this.sync();}
 navigate(fn){if(this.renderer?.ready&&this.map)fn();else this.pendingView=fn;}
 showGalaxy(){this.navigate(()=>this.renderer.toGalaxy());}
 showSystem(){this.navigate(()=>this.renderer.focusSystem(this.system?.[1]||this.planet.position[1]));}
 showPlanet(){this.navigate(()=>this.renderer.toPlanet(this.planet.id,{orbit:true}));}
 selectPlanet(id){this.mapSelectedId=id;this.renderer?.selectNavigationPlanet(id,{focus:true});}
 enterPlanet(id){this.mapSelectedId=id;this.renderer?.toPlanet(id);}
 preparePlanetEntry(){}
 selectBuilding(id){this.close=true;this.renderer?.selectBuilding(id);this.onApproach?.(true);}
 approach(){this.close=true;this.renderer?.toPlanet(this.planet.id);this.onApproach?.(true);}
 orbit(){this.close=false;this.showPlanet();this.onApproach?.(false);}
 setMode(mode){this.mode=mode;this.active=['home','system','galaxy','buildings','research','shipyard'].includes(mode);this.host.style.visibility=this.active?'visible':'hidden';this.host.style.pointerEvents=this.active?'auto':'none';this.renderer?.setActive(this.active&&!document.hidden);}
 dispose(){this.renderer?.dispose();document.removeEventListener('visibilitychange',this._visibility);this.host.remove();}
}
window.PlanetScene=PlanetScene;
