// User-approved visual loadouts; these do not invent APK damage or interception rates.
const pairs=(x,y,zs)=>zs.flatMap(z=>[[-x,y,z],[x,y,z]]);
export const shipLengths={Light_Fighter:1,Heavy_Fighter:2,Titanenergetic_Frigate:5,Cruiser:10,Battleship:20,Bomber:20,Dreadnought:20,Destroyer:25,Interceptor:50,Devourer_Interceptor:50,Iron_Behemoth:200};
const turretMuzzles=(x,y,z,s)=>[-1,1].map(side=>[x+side*.22*s,y+.096*s,z-.905*s]);
export const shipWeaponLayouts={
  Light_Fighter:{role:'轻型战机',scale:1,install:false,primary:'固定轻型激光炮',kind:'light_laser',muzzles:pairs(1.79,-1.44,[-2.48]),caliber:.052,pointDefense:[]},
  Heavy_Fighter:{role:'重型战机',scale:1,install:false,primary:'固定重型激光炮',kind:'heavy_laser',muzzles:[[1.095,.445,-2.335]],caliber:.075,pointDefense:[]},
  Cruiser:{role:'离子巡洋舰',scale:1,install:false,primary:'双联离子炮',kind:'ion',muzzles:[-1,1].flatMap(s=>turretMuzzles(s*1.88,1.33,-.59,.38)),caliber:.07,pointDefense:pairs(1.88,1.33,[-.59]),pdScale:.38},
  Battleship:{role:'重型战列舰',scale:1,install:false,primary:'低矮舰炮分组齐射',kind:'shell',muzzles:[...[-1,1].flatMap(s=>turretMuzzles(s*1.26,.94,-1.43,.86)),...turretMuzzles(0,1.16,-.42,.66)],caliber:.1,pointDefense:pairs(1.45,1.11,[2.02]),pdScale:.6},
  Bomber:{role:'导弹舰',scale:1,install:false,primary:'激光制导等离子导弹',kind:'missile',muzzles:[],caliber:.13,pointDefense:pairs(.85,.65,[.25]),pdScale:.42,missiles:[-1,1].flatMap(s=>Array.from({length:4},(_,j)=>{const x=s*(1.55+j*.48),y=-.63;return [x*Math.cos(.27)+s*y*Math.sin(.27),-s*x*Math.sin(.27)+y*Math.cos(.27),-.58];})),launchDirection:[0,0,-1]},
  Dreadnought:{role:'大型战舰',scale:1,primary:'前置双激光炮',kind:'laser',muzzles:pairs(1.48,-.92,[-6.19]),caliber:.11,pointDefense:[...pairs(.91,1.035,[-1.7]),...pairs(1.25,1.505,[1.3]),...pairs(.7,2.315,[2.65])]},
  Destroyer:{role:'重型战舰',scale:1,primary:'双等离子大炮',kind:'plasma',muzzles:pairs(.62,-.33,[-7.25]),caliber:.23,pointDefense:[...pairs(.83,.997,[-3.3]),...pairs(2.6,0.322,[1.2]),...pairs(1.8,0.512,[5.7])]},
  Interceptor:{"role":"核子炮舰","scale":1,"primary":"核子大炮","kind":"nuclear","muzzles":[[0,-0.36,-5.86]],"caliber":0.33,"pointDefense":[[-0.56,1.9483,-3],[0.56,1.9483,-3],[-0.56,1.8838,-0.1],[0.56,1.8838,-0.1],[-0.56,1.802,4.7],[0.56,1.802,4.7],[-0.48,-2.259,-1.7],[0.48,-2.259,-1.7],[-0.48,-2.3317,1],[0.48,-2.3317,1],[-0.48,-2.05,4.9],[0.48,-2.05,4.9]]},
  Iron_Behemoth:{role:'超巨型指挥母舰',scale:2.8,primary:'无主炮 · 近防自卫',kind:null,muzzles:[],caliber:0,pointDefense:[...pairs(1.65,1.606,[-4.8]),...pairs(1.5,1.271,[-1.2]),...pairs(1.3,1.541,[1.1]),...pairs(.62,1.673,[3]),...pairs(2.2,.662,[5.25]),...pairs(3.53,.673,[5.7]),...pairs(.5,2.842,[5.75])]},
  Devourer_Interceptor:{"role":"双主炮截击舰","scale":1,"primary":"双重型主炮","kind":"heavy","muzzles":[[-1.67,-1.05,-7.02],[1.67,-1.05,-7.02]],"caliber":0.3,"pointDefense":[[-1.67,0.0547,-4.8],[1.67,0.0547,-4.8],[-1.67,-0.0534,-1.5],[1.67,-0.0534,-1.5],[-2.85,0.46,4.65],[2.85,0.46,4.65]]},
  Titanenergetic_Frigate:{"role":"小型高级战机","scale":0.4,"primary":"中央主炮","kind":"advanced","muzzles":[[0,-0.4,-7.01]],"caliber":0.21,"pointDefense":[[-3.32,0.8055,0.1],[3.32,0.8055,0.1],[-3.32,0.628,1.23],[3.32,0.628,1.23]]},
};
shipWeaponLayouts.Titanenergetic_Frigate.pointDefense=[];
shipWeaponLayouts.Titanenergetic_Frigate.primary='中央聚能主炮 + 两侧十二联导弹口';
shipWeaponLayouts.Titanenergetic_Frigate.missiles=[-1,1].flatMap(s=>[-.3,0,.3].flatMap(dx=>[-.9,-.56].map(y=>[s*3.35+dx,y,-.87])));
shipWeaponLayouts.Titanenergetic_Frigate.launchDirection=[0,0,-1];
export const spinalMounts=Object.fromEntries(['Destroyer','Interceptor','Devourer_Interceptor'].map(id=>[id,{name:shipWeaponLayouts[id].primary,reason:'主炮嵌入原有纵向炮舱，依照用户指定的武器配置。'}]));
// Original design scale / trial weapons, intentionally separate from APK statistics.
Object.assign(shipLengths,{Reaper:90,Annihilator:8});
Object.assign(shipWeaponLayouts,{
  Reaper:{role:'RAVEN 收割舰 · 参考模型',install:false,primary:'双束相位收割',kind:'reaper',muzzles:pairs(2.04,-.33,[-1.35]),caliber:.115,pointDefense:[[-1.3,1.016081,-.6],[1.3,1.016674,-.6],[-.44,1.11925,3.5],[.44,1.11925,3.5]],pdScale:.27,missiles:[[-1.18,1.003596,-1.6],[-1.18,1.051833,-1.2],[1.18,1.010117,-1.6],[1.18,1.055983,-1.2]],launchDirection:[0,1,0]},
  Annihilator:{role:'无人反物质自行导弹',install:false,primary:'锁定 / 自行突击',kind:'antimatter',muzzles:[],caliber:.3,pointDefense:[]}
});
