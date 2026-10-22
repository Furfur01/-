// Stable classifications shared by the economy, directory and stellar renderer.
const types={
 main:{id:'main',name:'主序星',colorIndex:0},
 blue:{id:'blue',name:'蓝巨星',colorIndex:1},
 red:{id:'red',name:'红巨星',colorIndex:2},
 white:{id:'white',name:'白矮星',colorIndex:3},
 magnetar:{id:'magnetar',name:'磁星',colorIndex:4}
};
export const stellarTypes=types;
export function stellarType(system){
 const id=Number(typeof system==='object'?system.id:system);
 return id>0&&id%37===0?types.magnetar:types[['main','blue','red','white','main'][Math.abs(id)%5]];
}
