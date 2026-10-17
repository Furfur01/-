export function createTechLayout(technologies){
 const byId=Object.fromEntries(technologies.map(t=>[t.id,t]));
 const parents=Object.fromEntries(technologies.map(t=>[t.id,(t.req||[]).filter(([id])=>byId[id])]));
 const tiers={},visiting=new Set();
 function depth(id){
  if(tiers[id]!==undefined)return tiers[id];
  if(visiting.has(id))throw new Error(`科技前置存在循环：${id}`);
  visiting.add(id);
  tiers[id]=parents[id].length?1+Math.max(...parents[id].map(([parent])=>depth(parent))):0;
  visiting.delete(id);
  return tiers[id];
 }
 for(const t of technologies)depth(t.id);
 const children=Object.fromEntries(technologies.map(t=>[t.id,technologies.filter(child=>parents[child.id].some(([id])=>id===t.id)).map(child=>child.id)]));
 function descendantCount(id,result=new Set()){
  for(const child of children[id])if(!result.has(child)){result.add(child);descendantCount(child,result);}
  return result.size;
 }
 const rows={},positions={},columns=[];
 const nodeWidth=224,nodeHeight=88,columnStep=290,rowStep=106,left=34,top=72;
 const parentRow=id=>parents[id].length?parents[id].reduce((sum,[p])=>sum+rows[p],0)/parents[id].length:0;
 for(let tier=0;tier<=Math.max(...Object.values(tiers));tier++){
  const ids=technologies.filter(t=>tiers[t.id]===tier).map(t=>t.id);
  ids.sort((a,b)=>parentRow(a)-parentRow(b)||descendantCount(b)-descendantCount(a));
  ids.forEach((id,row)=>{rows[id]=row;positions[id]=[left+tier*columnStep,top+row*rowStep];});
  columns.push({tier,ids});
 }
 let longEdge=0;
 const edges=technologies.flatMap(t=>parents[t.id].map(([from,level])=>({from,to:t.id,level}))).map((edge,index)=>{
  const [x1,y1]=positions[edge.from],[x2,y2]=positions[edge.to];
  const start=x1+nodeWidth,sy=y1+nodeHeight/2,ty=y2+nodeHeight/2;
  const elbow=start+22+(index%3)*9;
  // Skip-tier prerequisites travel above the cards instead of crossing other nodes.
  const lane=42+(longEdge%5)*5;
  const d=tiers[edge.to]-tiers[edge.from]>1
   ?(longEdge++,`M ${start} ${sy} H ${elbow} V ${lane} H ${x2-16} V ${ty} H ${x2}`)
   :`M ${start} ${sy} H ${elbow} V ${ty} H ${x2}`;
  return {...edge,d};
 });
 return {tiers,positions,columns,edges,nodeWidth,nodeHeight,width:left*2+nodeWidth+(columns.length-1)*columnStep,height:top+nodeHeight+(Math.max(...columns.map(c=>c.ids.length))-1)*rowStep+64};
}
