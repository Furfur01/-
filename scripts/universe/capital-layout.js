export const CAPITAL_VERSION='continuum-civic-square-4';
export const CAPITAL_SIZE=Object.freeze({width:120,depth:88});
// Original CONTINUUM district translations at twice its 60 x 44 spacing.
export const CAPITAL_DISTRICTS=Object.freeze({
  command:{id:'Command_Center',label:'市政中心',x:0,z:-6,width:22,depth:30,height:6},
  research:{id:'Research_Lab',label:'科研院区',x:-35.2,z:-8,width:17.5,depth:13.7,height:3},
  robotics:{id:'Robotics_Facility',label:'机械制造园',x:36.2,z:12,width:18,depth:8.3,height:3},
  nanofab:{id:'Nanite_Factory',label:'精密制造院',x:35,z:-10.8,width:17.6,depth:10.8,height:3},
  solar:{id:'Solar_Plant',label:'太阳能阵列',x:-46.6,z:24.6,width:9.5,depth:14.1,height:1.5},
  fusion:{id:'Fusion_Reactor',label:'聚变能源区',x:-38,z:-33,width:16.2,depth:7,height:3},
  radar:{id:'Radar_Facility',label:'星际通讯阵列',x:-1.6,z:-33.2,width:14.8,depth:7,height:4},
  allianceLogistics:{id:'Alliance_Depot',label:'联盟协作区',x:-19,z:25.6,width:15.5,depth:10.1,height:3},
  terraforming:{id:'Terraformer',label:'环境工程区',x:40,z:-32,width:16,depth:8,height:3},
  planetarySupport:{id:'Missile_Silo',label:'行星保障区',x:34,z:31.4,width:18.4,depth:8.2,height:3}
});
export const CAPITAL_BY_ID=Object.freeze(Object.fromEntries(Object.entries(CAPITAL_DISTRICTS).map(([k,d])=>[d.id,k])));
export const COLONY_INDUSTRY=Object.freeze({
  Metal_Mine:{x:-103,z:-25,width:64,depth:46,scale:1},
  Crystal_Mine:{x:-103,z:25,width:60,depth:42,scale:1},
  Gas_Mine:{x:103,z:-27,width:60,depth:42,scale:1,yaw:Math.PI},
  Shipyard:{x:104,z:26,width:62,depth:48,scale:1}
});
// Join the ORIGINAL model's entry anchors. All facilities stay in one locality.
export const COLONY_ROADS=Object.freeze([
  [[-66.4,-23],[-69,-23],[-69,-18],[-74.5,-18]],
  [[-69,-18],[-69,32.35],[-77.5,32.35]],
  [[66.4,21.6],[69,21.6],[69,28.4],[74.13,28.4]],
  [[69,21.6],[69,-34.35],[77.5,-34.35]]
]);
