// Shared by the rendered cabin and walking collision; local coordinates in metres.
export function bridgeDisplays(kind){const offset=kind==='bastion'?0:-3;return [
 {id:'operations',title:'OPERATIONS / 作战控制',pos:[-2.7,2.35,-3.25+offset],size:[2.8,1.7],rotation:[-.25,.14,0],height:560},
 {id:'contacts',title:'TARGET LINK / 目标链路',pos:[2.7,2.35,-3.25+offset],size:[2.8,1.7],rotation:[-.25,-.14,0],height:560},
 {id:'helm',title:'HELM / 航行与舰体',pos:[0,1.95,-3.05+offset],size:[2.12,1.32],rotation:[-.35,0,0]}
];}
export function bridgeHologram(kind){return {pos:[0,1.25,kind==='bastion'?-6:-9],radius:2.1,baseRadius:2.28};}
export const bridgeConsoleObstacles=[...bridgeDisplays('bastion').map(d=>({x:d.pos[0],z:d.pos[2],rx:d.size[0]/2+.1,rz:.65})),{x:0,z:bridgeHologram('bastion').pos[2],rx:2.28,rz:2.28}];
