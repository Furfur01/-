// Shared civic rules. Unlocks persist; only one programme can be active.
export const CIVIC_COOLDOWN=10*60*1000;
export const civicTracks=[
 {id:'administration',name:'行政协同',description:'公开决策，让知识跨越星球边界。'},
 {id:'welfare',name:'公共服务',description:'以普惠基础设施支撑殖民地的日常生活。'},
 {id:'commerce',name:'开放商贸',description:'让专业分工与开放市场连接群星。'}
];
export const civicPolicies=[
 {id:'open_science',track:'administration',tier:1,name:'开放科学议程',description:'公共研究数据共享；工业预算向科研倾斜。',production:[-.08,0,0],research:.15,quote:'知识只有被分享，才真正属于文明。'},
 {id:'deliberative_network',track:'administration',tier:2,requires:'open_science',name:'星际协商网络',description:'公民议会与科研机构共同配置跨星球研究资源。',production:[-.12,0,0],research:.25,quote:'距离可以延迟回答，不该取消发言的权利。'},
 {id:'universal_services',track:'welfare',tier:1,name:'普惠公共服务',description:'优先保障能源、交通与居住服务；科研资源适度让渡。',production:[.08,.08,.08],research:-.10,quote:'文明的尺度，是最遥远的居所也有灯光。'},
 {id:'resilient_habitat',track:'welfare',tier:2,requires:'universal_services',name:'韧性栖居网络',description:'跨殖民地公共设施协作；更多人才投入长期民用建设。',production:[.14,.14,.14],research:-.16,quote:'我们建设的不是避难所，而是值得留下的家园。'},
 {id:'free_ports',track:'commerce',tier:1,name:'星际自由港',description:'开放工业贸易与专业分工；燃料供应承担额外周转成本。',production:[.18,.10,-.12],research:0,quote:'港口的意义，不在于守住多少货物，而在于迎来多少可能。'},
 {id:'common_market',track:'commerce',tier:2,requires:'free_ports',name:'星际共同市场',description:'统一贸易标准与公共结算网络，扩大产出并增加燃料周转负担。',production:[.28,.18,-.20],research:0,quote:'共同的规则，让陌生的星球成为可以信赖的邻居。'}
].map(p=>({...p,cost:p.tier===1?[12000,8000,4000]:[48000,32000,16000]}));
export const civicPolicy=id=>civicPolicies.find(p=>p.id===id);
export const civicState=player=>({unlocked:player?.civics?.unlocked||[],active:player?.civics?.active||null,nextChangeAt:player?.civics?.nextChangeAt||0});
export function civicEffects(player){const state=civicState(player),policy=state.unlocked.includes(state.active)?civicPolicy(state.active):null;return {production:policy?.production||[0,0,0],research:policy?.research||0};}
export function civicAction(player,action,now,pay){
 const state=civicState(player),policy=civicPolicy(action.id);
 if(action.mode==='unlock'){
  if(!policy)throw Error('市政方案不存在');
  if(state.unlocked.includes(policy.id))throw Error('该市政方案已解锁');
  if(policy.requires&&!state.unlocked.includes(policy.requires))throw Error('请先解锁本路线的前置方案');
  pay(policy.cost);player.civics={...state,unlocked:[...state.unlocked,policy.id]};
 }else if(action.mode==='adopt'){
  if(action.id!==null&&(!policy||!state.unlocked.includes(action.id)))throw Error('请先解锁市政方案');
  if(action.id===state.active)throw Error('该施政方针已生效');
  if(now<state.nextChangeAt)throw Error('施政调整冷却中');
  player.civics={...state,active:action.id,nextChangeAt:now+CIVIC_COOLDOWN};
 }else throw Error('市政操作无效');
}
