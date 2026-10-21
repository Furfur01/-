import {darkMatterRules} from '../../game/dark-matter.mjs';
export const resourceNames = ['金属', '晶体', '气体'];
export const reportNames = {battle:'战斗',spy:'侦察',fleet:'舰队',explore:'探索',scan:'雷达',missile:'导弹',system:'系统'};
export const reportName = r => reportNames[r.type] || '其他';
export const total = values => Object.values(values || {}).reduce((sum,n)=>sum+(Number(n)||0),0);
export const coordinates = p => (p?.position || []).join(' : ');
export const sameSystem = (a,b) => !!a?.position && !!b?.position && a.position[0]===b.position[0] && a.position[1]===b.position[1];
export const inRange = (origin,target,range) => !!target?.id && target.position[0]===origin.position[0] && Math.abs(target.position[1]-origin.position[1])<=range;
export const reportTitle = r => r.title || `${reportName(r)}报告`;
export function visibleReports(reports,category,unread,query){
  const term=query.trim().toLocaleLowerCase();
  return reports.filter(r=>(category==='all'||r.type===category)&&(!unread||!r.read)&&(!term||`${reportTitle(r)} ${r.body||''} ${(r.position||[]).join(':')} ${r.attackerName||''} ${r.defenderName||''}`.toLocaleLowerCase().includes(term))).sort((a,b)=>b.at-a.at);
}
export function jumpShips(api){return Object.entries(api.planet.ships||{}).filter(([id,n])=>n>0&&id!=='Solar_Satellite'&&api.catalog.units[id]?.type!=='defense'&&api.catalog.units[id]?.fleetAvailable!==false&&api.catalog.units[id]);}
export function jumpReason(api,target,selection){
  const p=api.planet;
  if(!p.moon)return '请选择本方月球';
  if(!p.buildings.Wormhole_Generator)return '需要虫洞发生器';
  if(!target?.moon||target.id===p.id||!target.buildings.Wormhole_Generator)return '请选择已建虫洞的本方月球';
  if((p.jumpReady||0)>api.now||(target.jumpReady||0)>api.now)return '等待两端虫洞冷却';
  if(!total(selection))return '请选择传送舰船';
  if(Object.entries(selection).some(([id,n])=>!Number.isInteger(n)||n<0||n>(p.ships[id]||0)||!api.catalog.units[id]||api.catalog.units[id].fleetAvailable===false||api.catalog.units[id].type==='defense'||id==='Solar_Satellite'))return '舰船数量无效';
  return '';
}
export function missileReason(api,target,count){
  const p=api.planet,range=5*(api.state.player.tech.Impulse_Drive||0)-1;
  if(range<0)return '需要脉冲引擎 1 级';
  if(!target||target.moon||target.owner===api.state.player.id)return '请选择其他势力的行星';
  if(!inRange(p,target,range))return '目标超出射程';
  if(!Number.isInteger(count)||count<1||count>(p.defense.Interplanetary_Missile||0))return '请输入库存范围内的整数';
  return '';
}
export function purchaseQuote(balance,resource,size,quantity){
  const valid=Number.isInteger(resource)&&resource>=0&&resource<=2&&[1,10,100].includes(size)&&Number.isInteger(quantity)&&quantity>=1&&quantity<=100;
  const cost=size*quantity,amount=cost*darkMatterRules.resourcePerUnit;
  return {cost,amount,reason:!valid?'兑换数量需为 1–100 的整数':cost>balance?'暗物质不足':''};
}
