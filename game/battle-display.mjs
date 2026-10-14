// Presentation only: no mutations to authoritative rows, health or targeting.
export function groupBattleShips(metadata){
  const groups=new Map();
  for(const m of metadata){const key=m.formation;if(!groups.has(key))groups.set(key,{key,side:m.side,owner:m.owner,batch:m.batch,type:m.type,length:m.profile.length,ids:[]});groups.get(key).ids.push(m.id);}
  return [...groups.values()];
}
export function visibleBattleShips(groups,rows,{eye,height=1080,fov=1,quality=1,pinned=[],previous=new Map()}){
  const visible=new Set(),labels=[],levels=new Map();let alive=0;
  const focal=height/(2*Math.tan(fov/2));
  for(const group of groups){
    const ids=group.ids.filter(id=>rows[id]?.[6]>0);alive+=ids.length;if(!ids.length)continue;
    const center=[0,0,0];for(const id of ids)for(let i=0;i<3;i++)center[i]+=rows[id][i+1]/ids.length;
    const distance=Math.max(1,Math.hypot(...center.map((v,i)=>v-eye[i]))),pixels=group.length*focal/distance;
    const extent=Math.max(...ids.map(id=>Math.hypot(...center.map((v,i)=>v-rows[id][i+1]))));
    const far=ids.length>4&&pixels<(previous.get(group.key)==='far'?7:4)/quality&&extent*focal/distance<220;
    levels.set(group.key,far?'far':'individual');
    // Distance changes geometry detail, never fleet membership. Labels only aid selection.
    for(const id of ids)visible.add(id);
    if(far)labels.push({...group,ids,center,count:ids.length,distance});
  }
  return {visible,labels,levels,alive};
}
