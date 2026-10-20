import {costAt} from '../../game/economy-costs.mjs';

export const canPlan = p => !p.moon && p.position?.[0] === 1;
export const planOf = p => p.constructionPlan || {items:[],paused:false,revision:0};
const vectorSum = (rows, read) => rows.reduce((total, row) => total.map((value, i) => value + (Number(read(row)?.[i]) || 0)), [0,0,0]);

// Physical inventories remain unique even when several bases expose the same
// shared warehouse. Never sum availableResources or storage.resources here.
export function empireTotals(planets) {
  return {
    resources: vectorSum(planets, p => p.resources),
    capacity: vectorSum(planets, p => p.economy?.capacity),
    rate: vectorSum(planets, p => p.economy?.rate),
    systems: new Set(planets.map(p => p.position.slice(0,2).join(':'))).size,
    colonies: planets.filter(p => !p.moon).length,
    moons: planets.filter(p => p.moon).length,
    building: planets.filter(p => p.buildQueue).length,
    goals: planets.filter(canPlan).reduce((n,p) => n + planOf(p).items.length, 0)
  };
}

export const systemKey = p => p.position.slice(0,2).join(':');

export function empireSystems(state) {
  const groups=new Map();
  for(const p of state.planets) {
    const key=systemKey(p);
    if(!groups.has(key))groups.set(key,{key,position:p.position.slice(0,2),planets:[]});
    groups.get(key).planets.push(p);
  }
  return [...groups.values()].sort((a,b)=>a.position[0]-b.position[0]||a.position[1]-b.position[1]).map(s=>({
    ...s,totals:empireTotals(s.planets),
    attention:s.planets.filter(p=>colonyIssues(state,p).length).length,
    logistics:state.logistics?.find(center=>center.position.join(':')===s.key),
    home:s.planets.some(p=>p.id===state.player.home)
  }));
}

export function colonyIssues(state,p) {
  const list=[];
  if((state.battles||[]).some(b => b.target===p.id)) list.push({type:'battle',text:'正在交战',tone:'danger'});
  // The inbound snapshot exposes an orbital coordinate, not a target base ID.
  // Keep the warning at orbit level when a planet and moon share coordinates.
  if((state.missions||[]).some(m => m.inbound && ['attack','destroyMoon','missile'].includes(m.task) && ['outbound','engaged','waiting'].includes(m.phase) && m.position?.join(':')===p.position.join(':'))) list.push({type:'threat',text:'本轨道有来袭',tone:'danger'});
  if(canPlan(p)&&['blocked','waiting'].includes(p.planStatus?.state)) list.push({type:'plan',text:p.planStatus.reason,tone:'warning'});
  if((p.economy?.supply||0)<(p.economy?.demand||0)) list.push({type:'energy',text:'能源不足',tone:'warning'});
  const resource=p.storage?.resources||p.resources, capacity=p.storage?.capacity||p.economy?.capacity;
  if(resource?.some((n,i)=>capacity?.[i]>0&&n>=capacity[i]*.9)) list.push({type:'storage',text:p.storage?.shared?'共享仓储将满':'仓储将满',tone:'warning'});
  return list;
}

export function nextGoalLevel(p,id) {
  return Math.min(50,Math.max(p.buildings[id]||0,p.buildQueue?.id===id?p.buildQueue.level:0,...planOf(p).items.filter(x=>x.id===id).map(x=>x.level))+1);
}

export function estimatePlan(p,items,buildings) {
  const levels={...p.buildings},cost=[0,0,0]; let upgrades=0;
  if(p.buildQueue) levels[p.buildQueue.id]=p.buildQueue.level;
  for(const item of items) {
    if(!buildings[item.id]) continue;
    for(let level=(levels[item.id]||0)+1;level<=item.level;level++) {
      costAt(buildings[item.id],level).forEach((amount,i)=>cost[i]+=amount); upgrades++;
    }
    levels[item.id]=Math.max(levels[item.id]||0,item.level);
  }
  return {cost,upgrades};
}

export function templatePayload(preview) {
  const ids=preview.planets,rows=preview.previews;
  if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||!Array.isArray(rows)||rows.length!==ids.length||new Set(rows.map(p=>p.planet)).size!==rows.length||rows.some(p=>!ids.includes(p.planet)||!Number.isInteger(p.revision)||typeof p.basis!=='string')) throw Error('预览结果不完整，请重新生成计划');
  return {type:'applyTemplate',planets:[...ids],template:preview.template,mode:preview.mode,growth:preview.growth,bases:Object.fromEntries(rows.map(p=>[p.planet,p.basis])),revisions:Object.fromEntries(rows.map(p=>[p.planet,p.revision]))};
}

export function previewChanged(state,preview) {
  if(!preview) return false;
  return preview.previews.some(row=>{
    const p=state.planets.find(x=>x.id===row.planet);
    if(!p||!canPlan(p)||planOf(p).revision!==row.revision) return true;
    const current={...p.buildings};
    if(p.buildQueue) current[p.buildQueue.id]=p.buildQueue.level;
    if(preview.mode==='append') for(const item of planOf(p).items) current[item.id]=Math.max(current[item.id]||0,item.level);
    try {
      const basis=JSON.parse(row.basis),keys=new Set([...Object.keys(basis),...Object.keys(current)]);
      return [...keys].some(key=>basis[key]!==current[key]);
    } catch { return true; }
  });
}
