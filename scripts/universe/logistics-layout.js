// HELIOS uses the same local units for the hub and its roof-mounted stargate.
export const LOGISTICS_SCALE=20;
const HUB_OFFSET=[-3400,2600,-4000];
const GATE_OFFSET=[0,75*LOGISTICS_SCALE,-12*LOGISTICS_SCALE];

export function logisticsPose(center,star,centers=[]){
 const siblings=centers.filter(c=>(c.level||c.queue)&&c.position[0]===center.position[0]&&c.position[1]===center.position[1]).sort((a,b)=>a.key.localeCompare(b.key));
 const slot=Math.max(0,siblings.findIndex(c=>c.key===center.key));
 const position=star.position.map((v,i)=>v+HUB_OFFSET[i]+(i===0?slot*4200:0));
 return {id:center.key,key:center.key,owner:center.owner,ownerName:center.ownerName,planet:center.host,type:'logistics',name:center.ownerName?`${center.ownerName} · 恒星系物流中心`:'恒星系物流中心',position,radius:82*LOGISTICS_SCALE,scale:LOGISTICS_SCALE,system:center.position[1],slot,focusPosition:position.map((v,i)=>v+[0,600,-96][i]),focusRadius:2400};
}

export function logisticsGatePose(star,center={key:'',position:[1,star.id]},centers=[]){
 const hub=logisticsPose(center,star,centers);
 return {position:hub.position.map((v,i)=>v+GATE_OFFSET[i]),radius:58*LOGISTICS_SCALE,scale:LOGISTICS_SCALE,focusPosition:hub.focusPosition,focusRadius:hub.focusRadius};
}
