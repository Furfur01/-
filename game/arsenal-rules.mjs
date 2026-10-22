// Shared, single-source rules for the player's endgame industrial chain.
export const ARSENAL_VERSION=1;
export const arsenalCommon=[['Research_Lab',16],['Energy_Tech',20],['Computer_Tech',18],['Strength_Tech',18],['Shielding_Tech',18],['Hyperspace_Tech',14],['Astrophysics_Tech',14],['Automation_Control',8],['Metamaterial_Tech',4],['Quantum_Command',3],['Phase_Energy',3]];
const branches={laser:[['Laser_Tech',20],['Plasma_Tech',16]],missile:[['Weapons_Tech',18],['Antimatter_Containment',3],['Advanced_Ship_Engineering',5]],accelerator:[['Ion_Tech',18],['Plasma_Tech',16]]};
const technology=(name,cost,req,description,maxLevel=1)=>({name,cost,req,maxLevel,description,atlas:15,playerOnly:true});
export const arsenalTechnologies={
 Stellar_Energy_Mastery:technology('恒星能量统御',[4e7,8e7,4e7],[['Research_Lab',16],['Energy_Tech',18],['Computer_Tech',16],['Automation_Control',8],['Metamaterial_Tech',4]],'Ⅰ开放戴森球框架，Ⅱ掌握战略储能装配，Ⅲ开放完全体戴森球与恒星武库研究。',3),
 Stellar_Antimatter_Synthesis:technology('恒星反物质合成',[6e7,1e8,8e7],[['Research_Lab',16],['Stellar_Energy_Mastery',3],['Antimatter_Containment',3]],'以高阶戴森球能量和反物质前驱晶制造独立储存的反物质燃料，不改变湮灭之星配方。'),
 Stellar_Coherent_Optics:technology('恒星相干光学',[8e7,12e7,6e7],[...arsenalCommon,['Stellar_Energy_Mastery',3],...branches.laser],'同步棱镜与多级收束器，将恒星辐射集中为不可拦截的跨星系光束。'),
 Relativistic_Ballistics:technology('相对论弹道工程',[1e8,1e8,1e8],[...arsenalCommon,['Stellar_Energy_Mastery',3],...branches.missile],'从舰尾装填微型弹，贯穿全长加速轨道，以反物质推进完成不可拦截的行星打击。'),
 Extreme_Beam_Containment:technology('超高能束流约束',[8e7,15e7,1e8],[...arsenalCommon,['Stellar_Energy_Mastery',3],...branches.accelerator],'控制恒星级加速环中的超高能束团，以切向抽取实现跨星系辐照。')
};
const facility=(id,name,cost,materials,hours,research,dyson,extra=[])=>({id,name,cost,materials,seconds:hours*3600,maxLevel:1,arsenal:true,dyson,requirements:[...(id==='antimatterPlant'?[['Research_Lab',16]]:arsenalCommon),['Stellar_Energy_Mastery',3],[research,1],...extra]});
export const arsenalFacilities={
 antimatterPlant:facility('antimatterPlant','反物质合成设施',[3e8,5e8,3e8],[500,100],24,'Stellar_Antimatter_Synthesis',4),
 laser:facility('laser','戴森棱镜阵列',[15e8,25e8,10e8],[2000,400],72,'Stellar_Coherent_Optics',5,branches.laser),
 missile:facility('missile','相对论导弹发射舰',[25e8,15e8,15e8],[3000,600],72,'Relativistic_Ballistics',5,branches.missile),
 accelerator:facility('accelerator','恒星电子加速器',[20e8,30e8,15e8],[2500,800],96,'Extreme_Beam_Containment',5,branches.accelerator)
};
export const arsenalWeapons=['laser','missile','accelerator'];
export const calibrationSeconds=12*3600;
export const chargeSeconds={laser:4*3600,accelerator:6*3600};
export const arsenalRecipes={
 fuel:{name:'反物质燃料 × 24',facility:'antimatterPlant',cost:[1e7,3e7,5e7],precursor:24,fuel:0,amount:24,seconds:24*3600},
 missile:{name:'相对论导弹 × 1',facility:'missile',cost:[5e7,3e7,1e7],precursor:0,fuel:12,amount:1,seconds:6*3600}
};
export const deadWorldNames={laser:'玻璃化死寂行星',missile:'碎裂死寂行星',accelerator:'辐照死寂行星'};
