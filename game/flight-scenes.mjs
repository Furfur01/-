export const flightScenes=[
  {id:'gargantua',name:'多彩星云',subtitle:'深空练习区',kind:0},
  {id:'planet',name:'蔚蓝行星',subtitle:'晨昏线轨道',kind:1},
  {id:'nebula',name:'创生星云',subtitle:'电离云海',kind:2},
  {id:'belt',name:'碎星带',subtitle:'小行星航道',kind:3},
  {id:'death-star',name:'死星',subtitle:'巨型机械天体 · 壕沟演练',kind:4}
];

export function nearestHullPoint(vertices,mesh,point){
  let best=Infinity,result=[0,0,0];
  for(let i=mesh.offset;i<mesh.offset+mesh.floatCount;i+=13){
    const distance=(vertices[i]-point[0])**2+(vertices[i+1]-point[1])**2+(vertices[i+2]-point[2])**2;
    if(distance<best){best=distance;result=[vertices[i],vertices[i+1],vertices[i+2]];}
  }
  return result;
}

export function addShieldHit(hits,point,time,amount,charge){
  if(!(charge>0)||!(amount>0))return;
  hits.push({point:[...point],time,power:Math.min(1,.35+amount/12),weak:charge<25});
  while(hits.length>3)hits.shift();
}

export function targetShieldCapacity(stats){
  const shield=Math.max(0,stats?.[1]||0),armour=Math.max(0,stats?.[0]||0);
  return shield>0?100*shield/(armour+shield):0;
}
