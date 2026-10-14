// User-approved visual loadouts; these do not invent APK damage or interception rates.
const pairs=(x,y,zs)=>zs.flatMap(z=>[[-x,y,z],[x,y,z]]);
export const shipWeaponLayouts={
  Dreadnought:{role:'大型战舰',scale:1,primary:'前置双激光炮',kind:'laser',muzzles:pairs(1.48,-.92,[-6.19]),caliber:.11,pointDefense:[...pairs(.91,1.035,[-1.7]),...pairs(1.25,1.505,[1.3]),...pairs(.7,2.315,[2.65])]},
  Destroyer:{role:'重型战舰',scale:1,primary:'双等离子大炮',kind:'plasma',muzzles:pairs(.62,-.33,[-7.25]),caliber:.23,pointDefense:[...pairs(.83,.997,[-3.3]),...pairs(2.6,0.322,[1.2]),...pairs(1.8,0.512,[5.7])]},
  Interceptor:{"role":"核子炮舰","scale":1,"primary":"核子大炮","kind":"nuclear","muzzles":[[0,-0.36,-5.86]],"caliber":0.33,"pointDefense":[[-0.56,1.9483,-3],[0.56,1.9483,-3],[-0.56,1.8838,-0.1],[0.56,1.8838,-0.1],[-0.56,1.802,4.7],[0.56,1.802,4.7],[-0.48,-2.259,-1.7],[0.48,-2.259,-1.7],[-0.48,-2.3317,1],[0.48,-2.3317,1],[-0.48,-2.05,4.9],[0.48,-2.05,4.9]]},
  Iron_Behemoth:{role:'超巨型非战斗旗舰',scale:2.8,primary:'无主炮 · 近防自卫',kind:null,muzzles:[],caliber:0,pointDefense:[...pairs(1.65,1.606,[-4.8]),...pairs(1.5,1.271,[-1.2]),...pairs(1.3,1.541,[1.1]),...pairs(.62,1.673,[3]),...pairs(2.2,.662,[5.25]),...pairs(3.53,.673,[5.7]),...pairs(.5,2.842,[5.75])]},
  Devourer_Interceptor:{"role":"双主炮截击舰","scale":1,"primary":"双重型主炮","kind":"heavy","muzzles":[[-1.67,-1.05,-7.02],[1.67,-1.05,-7.02]],"caliber":0.3,"pointDefense":[[-1.67,0.0547,-4.8],[1.67,0.0547,-4.8],[-1.67,-0.0534,-1.5],[1.67,-0.0534,-1.5],[-2.85,0.46,4.65],[2.85,0.46,4.65]]},
  Titanenergetic_Frigate:{"role":"小型高级战机","scale":0.4,"primary":"中央主炮","kind":"advanced","muzzles":[[0,-0.4,-7.01]],"caliber":0.21,"pointDefense":[[-3.32,0.8055,0.1],[3.32,0.8055,0.1],[-3.32,0.628,1.23],[3.32,0.628,1.23]]},
};
export const spinalMounts=Object.fromEntries(['Destroyer','Interceptor','Devourer_Interceptor'].map(id=>[id,{name:shipWeaponLayouts[id].primary,reason:'主炮嵌入原有纵向炮舱，依照用户指定的武器配置。'}]));
