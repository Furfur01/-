// User-approved visual loadouts; these do not invent APK damage or interception rates.
const pairs=(x,y,zs)=>zs.flatMap(z=>[[-x,y,z],[x,y,z]]);
export const shipWeaponLayouts={
  Dreadnought:{role:'大型战舰',scale:1,primary:'前置双激光炮',kind:'laser',muzzles:pairs(1.48,-.92,[-6.19]),caliber:.11,pointDefense:[...pairs(.91,1.035,[-1.7]),...pairs(1.25,1.505,[1.3]),...pairs(.7,2.315,[2.65])]},
  Destroyer:{role:'重型战舰',scale:1,primary:'双等离子大炮',kind:'plasma',muzzles:pairs(.84,-.02,[-7.53]),caliber:.29,pointDefense:[...pairs(.83,.996,[-2.86]),...pairs(1.23,1.131,[.8]),...pairs(2.7,.410,[4.35])]},
  Interceptor:{role:'核子炮舰',scale:1,primary:'核子大炮',kind:'nuclear',muzzles:[[0,-.14,-6.1]],caliber:.43,pointDefense:[...pairs(1.12,1.905,[-2.1]),...pairs(1.12,2.127,[.8]),...pairs(1.12,2.118,[3.3]),...pairs(.6,-1.516,[-4.2]),...pairs(.6,-1.386,[-1.7,.8])]},
  Iron_Behemoth:{role:'超巨型非战斗旗舰',scale:2.8,primary:'无主炮 · 近防自卫',kind:null,muzzles:[],caliber:0,pointDefense:[...pairs(2.22,1.399,[-3.8]),...pairs(2.22,1.394,[-2]),...pairs(1.65,1.603,[-.2]),...pairs(1.12,1.636,[1.35]),...pairs(.47,2.455,[2.65,3.15]),...pairs(2.42,.182,[3.75])]},
  Devourer_Interceptor:{role:'双主炮截击舰',scale:1,primary:'双重型主炮',kind:'heavy',muzzles:pairs(1.99,-.03,[-8.73]),caliber:.43,pointDefense:[...pairs(1.97,.924,[-5.23]),...pairs(1.97,1.084,[-1.91]),...pairs(2.35,1.525,[4.4])]},
  Titanenergetic_Frigate:{role:'小型高级战机',scale:.4,primary:'中央主炮',kind:'advanced',muzzles:[[0,.27,-6.7]],caliber:.21,pointDefense:[...pairs(2.74,.859,[.33]),...pairs(2.74,1.031,[2.4])]},
};
export const spinalMounts=Object.fromEntries(['Destroyer','Interceptor','Devourer_Interceptor'].map(id=>[id,{name:shipWeaponLayouts[id].primary,reason:'主炮嵌入原有纵向炮舱，依照用户指定的武器配置。'}]));
