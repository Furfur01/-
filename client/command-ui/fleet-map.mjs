// Shared by the dispatch controls and the star-map HUD; no gameplay state is changed here.
export const fleetColors={
  attack:'#db8c8c',destroyMoon:'#ed82ae',transport:'#83cdda',deploy:'#91aff1',
  colonize:'#a6d7ac',explore:'#c2a2e6',mine:'#e4bc7d',recycle:'#c2d78b',spy:'#d7cbb5'
};

export function fleetMapChoice(api,departure,draft,endpoint,pick){
  if(endpoint==='from'){
    const colony=api.state.planets.find(p=>p.id===pick.id);
    if(!colony||colony.position[0]!==1)return {error:'出发地只能选择自己的星球或月球'};
    return {departure:colony.id,patch:colony.id===departure.id?{}:{ships:{},cargo:[0,0,0],...(draft.task==='explore'?{position:[1,colony.position[1],16]}:{})}};
  }
  if(pick.kind==='core'){
    if(draft.task!=='explore')return {error:'银心用于探险，请先选择探险行动'};
    return {patch:{target:'',position:[1,departure.position[1],16],zone:pick.zone,destinationSet:true,destination:null}};
  }
  if(draft.task==='explore')return {error:'请在星图中点选银心的探索区域'};
  if(pick.id===departure.id)return {error:'目的地不能与出发地相同'};
  if(draft.task==='mine'&&pick.position[2]!==16)return {error:'采矿需要点选恒星系外缘的小行星带'};
  if(draft.task!=='mine'&&pick.position[2]===16)return {error:'小行星带用于采矿，请先选择采矿行动'};
  return {patch:{target:pick.id||'',position:[...pick.position],destinationSet:true,destination:{id:pick.id,name:pick.name,position:[...pick.position],moon:pick.moon,biome:pick.biome,kind:pick.kind}}};
}
