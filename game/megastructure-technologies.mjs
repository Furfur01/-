import {arsenalFacilities} from './arsenal-rules.mjs';
// Foundational research for new construction; existing facilities and paid
// orders do not acquire retroactive research obligations.
export const retiredMegastructureTechnologies={
 Megastructure_Engineering:{name:'巨构工程',cost:[400000,300000,100000],maxLevel:8,req:[['Research_Lab',10],['Computer_Tech',6],['Energy_Tech',6],['Stellar_Physics',3]],atlas:7,icon:'technology-generated/Advanced_Ship_Engineering.png',description:'掌握恒星尺度工程的测量、模块装配与长期结构控制。5级开放多数巨构，6级开放巨构船坞。'},
 Macro_Materials:{name:'宏观先进材料',cost:[300000,400000,150000],maxLevel:8,req:[['Research_Lab',10],['Strength_Tech',6],['Shielding_Tech',6],['Energy_Tech',5]],atlas:7,icon:'technology-generated/Metamaterial_Tech.png',description:'制造可承受巨构应力与温差的宏观复合材料。5级支持能源、工业和居住工程，6级支持巨构船坞。'},
 Stellar_Physics:{name:'恒星物理',cost:[250000,500000,250000],maxLevel:8,req:[['Research_Lab',12],['Energy_Tech',6],['Laser_Tech',6],['Plasma_Tech',5]],atlas:3,icon:'technology-generated/Phase_Energy.png',description:'研究恒星辐射、等离子流与致密天体物质。5级支持戴森云，6级支持恒星资源提取器。'},
 Spacetime_Engineering:{name:'时空工程',cost:[400000,600000,400000],maxLevel:8,req:[['Research_Lab',12],['Hyperspace_Tech',6],['Computer_Tech',6],['Hyperspace_Drive',5],['Megastructure_Engineering',3]],atlas:15,icon:'technology-generated/Quantum_Command.png',description:'稳定远距离时空通道并校准深空信号。5级支持星门与深空监听阵列。'}
};
// Keep definitions for saved levels and paid research queues, not new research.
for(const item of Object.values(retiredMegastructureTechnologies)){
 item.retired=true;
 item.description='已停止新增研究。已掌握等级保留，已付款研究可按原工期完成或取消退款；巨构建设改用现有学科、自动化控制与生态工程。';
}
export const megastructureTechnologies={
 Automation_Control:{name:'自动化控制',cost:[80000,120000,40000],maxLevel:8,req:[['Research_Lab',8],['Computer_Tech',6],['Energy_Tech',4]],atlas:7,icon:'technology-generated/Automation_Control.png',description:'协调无人采矿、采能单元、恒星提取与舰船装配。3/5/7级支持工业带和提取器，4/6/8级支持戴森云和船坞；设施还需满足其他科技条件。'},
 Ecological_Engineering:{name:'生态工程',cost:[60000,100000,60000],maxLevel:6,req:[['Research_Lab',8],['Energy_Tech',6],['Astrophysics_Tech',4]],atlas:14,icon:'technology-generated/Ecological_Engineering.png',description:'建立空气、水和养分循环，维持长期太空居住。2/4/6级分别支持一至三级环轨居住带；还需满足材料、防护和能源条件。'}
};
// Each array lists the exact thresholds for facility levels 1 / 2 / 3.
const requirements={
 gate:{Hyperspace_Tech:[10],Energy_Tech:[12],Computer_Tech:[10]},
 dyson:{Energy_Tech:[10,12,14],Automation_Control:[4,6,8],Metamaterial_Tech:[1,2,3]},
 extractor:{Plasma_Tech:[6,8,10],Energy_Tech:[10,12,14],Shielding_Tech:[8,10,12],Automation_Control:[3,5,7]},
 shipyard:{Advanced_Ship_Engineering:[1,3,5],Metamaterial_Tech:[2,3,4],Automation_Control:[4,6,8],Energy_Tech:[10,12,14]},
 listener:{Espionage_Tech:[8,10,12],Computer_Tech:[8,10,12],Quantum_Command:[0,1,3],Hyperspace_Tech:[0,6,10]},
 industry:{Automation_Control:[3,5,7],Laser_Tech:[10,12,14],Strength_Tech:[8,10,12],Energy_Tech:[8,10,12]},
 habitat:{Ecological_Engineering:[2,4,6],Metamaterial_Tech:[1,2,3],Shielding_Tech:[6,8,10],Energy_Tech:[8,10,12]}
};
const stellarRequirements={
 white:{Astrophysics_Tech:[6,8,10],Metamaterial_Tech:[2,3,4]},
 magnetar:{Astrophysics_Tech:[8,10,12],Metamaterial_Tech:[3,4,4],Shielding_Tech:[12,14,16]}
};
export function megaRequiredTech(id,targetLevel,star='main'){
 if(arsenalFacilities[id])return arsenalFacilities[id].requirements;
 if(id==='dyson'&&targetLevel>=4)return targetLevel===4?[['Stellar_Energy_Mastery',1],['Energy_Tech',18],['Computer_Tech',16],['Metamaterial_Tech',4],['Automation_Control',8]]:[['Stellar_Energy_Mastery',3],['Energy_Tech',20],['Computer_Tech',18],['Shielding_Tech',18]];
 const result=new Map();
 for(const table of [requirements[id],...(id==='extractor'&&stellarRequirements[star]?[stellarRequirements[star]]:[])]){
  for(const [key,levels]of Object.entries(table)){
   const level=levels[targetLevel-1];if(level>0)result.set(key,Math.max(result.get(key)||0,level));
  }
 }
 return [...result];
}
