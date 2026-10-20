// Matchups apply only to nearby blast victims. Zero (including unlisted targets)
// means splash immunity; the directly hit ship still takes ordinary weapon damage.
export function splashMultiplier(unit,targetType){return unit.splashMultipliers?.[targetType]??0;}
export function criticalChance(unit,targetType){
  const rate=splashMultiplier(unit,targetType);
  return unit.id==='Annihilator'||unit.type==='Annihilator'||rate<=1?0:1-1/rate;
}
export function criticalChances(unit){return Object.fromEntries(Object.keys(unit.splashMultipliers||{}).map(id=>[id,criticalChance(unit,id)]));}
export function areaWeaponRules(unit){
  const ordinary=unit.attack>0&&!unit.missile&&unit.id!=='Annihilator';
  return {splashRadius:unit.splashRadius??(ordinary&&Object.values(unit.splashMultipliers||{}).some(n=>n>0)?60:0),
    criticalMultiplier:2};
}
export function rollCritical(unit,targetType,random){
  const chance=criticalChance(unit,targetType),critical=chance>0&&random()<chance;
  return {critical,criticalChance:chance,criticalMultiplier:critical?2:1};
}
export function splashDamage(base,unit,targetType,distance,radius){
  return radius>0&&distance<radius?base*splashMultiplier(unit,targetType)*Math.max(0,1-distance/radius):0;
}
