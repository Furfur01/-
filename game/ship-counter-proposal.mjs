// Review-only balance proposal. Settlement continues to import catalog.mjs.
export function shipCounterProposal(units,archive){
  const rapid=Object.fromEntries(archive.map(s=>[s.id,{...(units[s.id]?.rapid||{})}]));
  Object.assign(rapid,{
    Interceptor:{Light_Fighter:12,Heavy_Fighter:6,Cruiser:3,Cargo_Ship:10,Large_Cargo_Ship:10,Probe:10,Solar_Satellite:10},
    Iron_Behemoth:{},
    Devourer_Interceptor:{Dreadnought:6,Destroyer:4,Titanenergetic_Frigate:4,Guardian:4,Death_Star:2,Iron_Behemoth:3,Probe:5,Solar_Satellite:5},
    Titanenergetic_Frigate:{Light_Fighter:4,Heavy_Fighter:3,Cruiser:2,Interceptor:4,Probe:5,Solar_Satellite:5},
    Annihilator:{},
    Reaper:{Iron_Behemoth:6,Titanenergetic_Frigate:4,Devourer_Interceptor:4,Death_Star:4,Guardian:3,Destroyer:3,Battleship:2,Probe:5,Solar_Satellite:5}
  });
  // Give existing heavy hulls explicit answers to the new fleet classes.
  Object.assign(rapid.Destroyer,{Interceptor:3});
  Object.assign(rapid.Death_Star,{Interceptor:10,Iron_Behemoth:3,Titanenergetic_Frigate:2});
  Object.assign(rapid.Guardian,{Devourer_Interceptor:2});
  const names=Object.fromEntries([...Object.values(units),...archive].map(s=>[s.id,s.name])),ids=Object.fromEntries(archive.map(s=>[s.id,s.apkId]));
  const roles={Interceptor:'反轻型舰群；主克轻战机和重战机，受驱逐舰与重型特殊舰制约。',Iron_Behemoth:'超巨型非战斗旗舰；无主炮，小型近防炮拦截导弹与战机；拦截参数待定。',Devourer_Interceptor:'反高护盾与大型舰；重点克制钛能守卫者，不额外拟造穿盾比例。',Titanenergetic_Frigate:'小型高级战机；中央聚能主炮与两侧十二个导弹口；无炮台；克制参数仍待确认。',Annihilator:'一次性群体打击；不用普通速射模拟爆炸，独立拟定伤害修正。',Reaper:'大型舰猎手；免疫湮灭之星，优先打击大型特殊舰。'};
  const ships=archive.map(s=>({id:s.id,apkId:s.apkId,name:s.name,role:roles[s.id]||'保留现有基础定位与已有速射值。',rapid:rapid[s.id],fatal_damage_list:[
    ...Object.entries(rapid[s.id]).map(([id,rate])=>({direction:'against',target_id:id,fleet_type:ids[id]??null,unit_name:names[id],damage_rate:rate,bonus_damage_rate:0})),
    ...Object.entries(rapid).filter(([,r])=>r[s.id]>1).map(([id,r])=>({direction:'from',target_id:id,fleet_type:ids[id]??null,unit_name:names[id],damage_rate:r[s.id],bonus_damage_rate:0}))
  ]}));
  return {status:'DRAFT_REQUIRES_USER_CONFIRMATION',appliedToCombat:false,interpretation:{damage_rate:'Local proposed rapid-fire r; continuation probability 1 - 1/r, not direct damage multiplication',bonus_damage_rate:'0 at base level; no invented enhancement progression',fatal_damage_list:'Derived outgoing and incoming relations; direction names are a local review format, not a recovered wire schema'},roles,ships,special:{
    Annihilator:{source:'menu.GC_bomb_description',trigger:{side:'attacker',atLeastDistinct:2,enemyTypes:['Titanenergetic_Frigate','Devourer_Interceptor','Interceptor','Iron_Behemoth']},bypassShield:true,immuneTargets:['Reaper'],maxOwned:200,recovery:false,damageProposal:{formula:'baseExplosionDamage × targetMultiplier × (1 + 0.05 × (initialBombCount - 1)) / sqrt(livingEnemyTypeCount)',baseExplosionDamage:null,multipliers:{Interceptor:1.5,Iron_Behemoth:1.25,Devourer_Interceptor:1,Titanenergetic_Frigate:.75,Reaper:0,default:.5},note:'Multipliers, attenuation and stacking are draft design. Base explosion value needs separate confirmation; not executable balance.'}},
    Reaper:{source:'menu.GC_reaper_description',immuneTo:['Annihilator'],proposedTargetPriority:['Iron_Behemoth','Titanenergetic_Frigate','Devourer_Interceptor','Death_Star','Guardian','Destroyer','Dreadnought','Battleship'],fallback:'Other living targets selected uniformly by ship count',prioritySource:'Draft ordering; APK confirms special ordering but does not supply it'}
  }};
}
