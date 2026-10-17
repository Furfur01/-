// Keep server quotes and the legacy client's fallback on the same cost curve.
export function costAt(item,level){
  const factor=item.factor||2,transition=item.costGrowthAfterLevel;
  if(transition&&level>transition){
    return item.cost.map(value=>{
      const anchor=Math.floor(value*factor**(transition-1)+1e-7);
      return Math.floor(anchor*item.costGrowthAfterFactor**(level-transition)+1e-7);
    });
  }
  return item.cost.map(value=>Math.floor(value*factor**(level-1)+1e-7));
}
