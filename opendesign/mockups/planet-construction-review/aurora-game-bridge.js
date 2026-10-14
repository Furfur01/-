// Same-origin presentation bridge. The parent owns all API calls and settlement.
const gameBuildingIds={metal:'Metal_Mine',metalstore:'Metal_Mine',crystal:'Crystal_Mine',crystalstore:'Crystal_Mine',gas:'Gas_Mine',gasstore:'Gas_Mine',capital:'Command_Center',solar:'Solar_Plant',fusion:'Fusion_Reactor',robotics:'Robotics_Facility',spaceport:'Shipyard',research:'Research_Lab',radar:'Radar_Facility',shipyard:'Alliance_Depot',nano:'Nanite_Factory',shield:'Terraformer',support:'Missile_Silo'};
if(auroraBiome==='moon')Object.assign(gameBuildingIds,{capital:'Moon_Base',metal:'Metal_Storage',metalstore:'Metal_Storage',crystal:'Crystal_Storage',crystalstore:'Crystal_Storage',gas:'Gas_Storage',gasstore:'Gas_Storage',shield:'The_EU_X_Radar',support:'Wormhole_Generator'});
let gamePlanet=null,gameCatalog=null,gameNowOffset=0,gameActive=true,gameReady=false,gameSelectionMuted=false;
const gameResourceIndex=d=>({metal:0,crystal:1,gas:2})[d.type];
function gameNotifySelection(b){if(productionMode&&b&&!gameSelectionMuted)window.dispatchEvent(new CustomEvent('aurora-building',{detail:{id:gameBuildingIds[b.type]}}));}
function selectGameBuilding(id){const b=buildings.find(b=>gameBuildingIds[b.type]===id&&!b.type.endsWith('store'));if(!b)return;gameSelectionMuted=true;try{focusBuilding(b);}finally{gameSelectionMuted=false;}}
function applyGamePlanet(planet,catalog,now=Date.now()){
 if(!productionMode||!planet)return;
 gamePlanet=planet;gameCatalog=catalog;gameNowOffset=now-Date.now();
 if(!gameReady)return;
 const biome=catalog.planetTypes?.[planet.biome],multipliers=biome?.multipliers||[1,1,1],ratio=clamp(planet.economy?.ratio??1,0,1);
 for(const d of districts){
  const i=gameResourceIndex(d),id=gameBuildingIds[d.type],level=planet.buildings[id]||0;
  d.enabled=!planet.moon&&(!d.resource||multipliers[i]>0);
  d.name=catalog.buildings[id]?.name||d.name;
  const names=d.label?.querySelectorAll('span');if(names?.[1])names[1].textContent=d.name;
  for(const b of d.buildings){
   b.gameId=id;b.name=d.name;b.level=level;b.operationRate=d.resource?ratio:1;
   const store=b.type.endsWith('store'),legacy=['Metal_Storage','Crystal_Storage','Gas_Storage'][i];
   const visualLevel=store?Math.max(level,planet.buildings[legacy]||0):level;
   const q=planet.buildQueue,building=q&&(q.id===id||store&&q.id===legacy);
   b.state=visualLevel>0?'active':'unbuilt';
   if(building){b.state=visualLevel>0?'upgrade':'construction';b.progress=clamp((now-q.start)/Math.max(1,q.end-q.start),0,1);}
   else if(d.resource&&visualLevel>0){
    if(!store&&!d.enabled)b.state='paused';
    else if(planet.resources[i]>=(planet.economy?.capacity?.[i]??Infinity))b.state='full';
    else if(!store&&ratio<.999)b.state=ratio>0?'lowpower':'paused';
   }
   if(b.elevator){const head=planet.shipQueue?.[0];b.elevator.gameQueue=head&&gameCatalog.units?.[head.id]?.type!=='defense'?head:null;b.elevator.gameNow=now;}
  }
  if(names?.[2])names[2].textContent='Lv '+level;
 }
 shadowDirty=true;if(!detailOnly){updateActors(0);updateRotors(0);updateLabels();}
}
function updateGameProgress(){
 if(!productionMode||!gamePlanet)return;const now=Date.now()+gameNowOffset,q=gamePlanet.buildQueue;
 if(q)for(const b of buildings)if(['construction','upgrade'].includes(b.state))b.progress=clamp((now-q.start)/Math.max(1,q.end-q.start),0,1);
 for(const e of elevators)e.gameNow=now;
}
function setGameActive(active){gameActive=!!active;last=0;}
function setGameViewport(sidebar=false){viewShift=productionMode&&W>760?(sidebar?.45:.04):W>760?.105:0;}
