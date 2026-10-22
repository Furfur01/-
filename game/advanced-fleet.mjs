// Local single-player progression, approved 2026-10-18. Costs use ordinary resources.
import {communityShipStats,communityShipSource} from './ship-community-stats.mjs';
import {strategicRecipe} from './strategic-resources.mjs';
export const advancedTechnologies={
 Advanced_Ship_Engineering:{name:'先进舰船工程',cost:[100000,150000,50000],maxLevel:5,req:[['Research_Lab',10],['Strength_Tech',10],['Hyperspace_Tech',6]],description:'逐步解锁高级战斗舰、指挥母舰与战略武器。'},
 Quantum_Command:{name:'量子指挥',cost:[50000,200000,100000],maxLevel:3,req:[['Research_Lab',10],['Computer_Tech',10],['Espionage_Tech',6]],description:'1级支持裂变者火控；3级支持深空吞噬者的蜂群协同。高级舰在恒星系巨构船坞生产。'},
 Metamaterial_Tech:{name:'超构材料',cost:[180000,120000,40000],maxLevel:4,req:[['Research_Lab',10],['Strength_Tech',10],['Energy_Tech',8]],description:'2级支持钛能守卫者和深空吞噬者；4级支持收割者舰体。'},
 Phase_Energy:{name:'相位能量学',cost:[100000,240000,160000],maxLevel:3,req:[['Research_Lab',11],['Hyperspace_Tech',7],['Ion_Tech',7]],description:'2级支持噬能截击者；3级开放反物质约束研究。'},
 Antimatter_Containment:{name:'反物质约束',cost:[400000,600000,300000],maxLevel:3,req:[['Research_Lab',12],['Energy_Tech',12],['Plasma_Tech',8],['Phase_Energy',3]],description:'1级支持收割者抗湮灭结构；3级支持湮灭之星。'}
};
export const flagshipCenter={id:'Flagship_Center',name:'旗舰中心（已退役）',cost:[2000000,1500000,500000],factor:2,req:[['Moon_Base',4],['Advanced_Ship_Engineering',3],['Quantum_Command',3]],atlas:8,moon:true,retired:true,description:'高级舰制造已转移至恒星系巨构船坞。旧设施与已付款的旗舰订单保留，旧订单按原工期完成。'};
const hull=(id,name,cost,stats,req,description,extra={})=>({id,name,type:'combat',cost,...stats,req:[['Hyperspace_Tech',5],['Hyperspace_Drive',6],...req],description,splashMultipliers:{},atlas:0,...extra});
// Wiki base attributes; production and spatial weapon behavior remain single-player rules.
export const advancedShips={
 Interceptor:hull('Interceptor','裂变者',[240000,180000,60000],communityShipStats.Interceptor,[['Shipyard',10],['Advanced_Ship_Engineering',1],['Quantum_Command',1]],'分布式火控让多组武器同时追踪来袭目标，适合压制轻型舰群。'),
 Titanenergetic_Frigate:hull('Titanenergetic_Frigate','钛能守卫者',[60000,90000,40000],communityShipStats.Titanenergetic_Frigate,[['Shipyard',11],['Advanced_Ship_Engineering',2],['Metamaterial_Tech',2]],'以高强度超构舰体承受正面火力，搭载中央聚能主炮与十二个导弹口，是舰队阵线中的重装护卫舰。'),
 Devourer_Interceptor:hull('Devourer_Interceptor','噬能截击者',[260000,220000,100000],communityShipStats.Devourer_Interceptor,[['Shipyard',12],['Advanced_Ship_Engineering',3],['Phase_Energy',2],['Hyperspace_Drive',7]],'将相位能量集中为短促而凶猛的打击，是对付大型舰与高护盾目标的特种战舰。'),
 Iron_Behemoth:hull('Iron_Behemoth','深空吞噬者',[2400000,1800000,600000],communityShipStats.Iron_Behemoth,[['Flagship_Center',1],['Advanced_Ship_Engineering',3],['Quantum_Command',3],['Metamaterial_Tech',2],['Hyperspace_Drive',7]],'在月球旗舰中心组装的指挥母舰。蜂群出击、强制集火与不叠加的15%舰队攻击增益，使它成为混编舰队的指挥核心。',{moonOnly:true,productionFacility:'Flagship_Center'}),
 Reaper:hull('Reaper','收割者',[900000,700000,300000],{strength:165000,shield:6000,attack:48000,speed:4000,cargo:5000,fuel:4000},[['Shipyard',13],['Advanced_Ship_Engineering',4],['Metamaterial_Tech',4],['Antimatter_Containment',1],['Hyperspace_Drive',8]],'为猎杀大型战舰而建。超构舰体与反物质隔离结构使其免疫湮灭之星的爆炸。'),
 Annihilator:hull('Annihilator','湮灭之星',[1200000,1800000,600000],communityShipStats.Annihilator,[['Shipyard',14],['Advanced_Ship_Engineering',5],['Antimatter_Containment',3]],'一次性反物质战略武器，以自毁释放范围冲击。收割者免疫其爆炸；发射前务必考虑舰队配合和制造成本。')
};
for(const ship of Object.values(advancedShips)){
 ship.req=ship.req.filter(([id])=>!['Shipyard','Flagship_Center'].includes(id));
 ship.productionFacility='Megastructure_Shipyard';delete ship.moonOnly;
 ship.description=ship.description.replace('在月球旗舰中心组装','在恒星系巨构船坞组装');
 const [id,resource]=strategicRecipe(ship.id);ship.strategic={id,name:resource.name,amount:resource.amount};
 ship.statsSource=communityShipStats[ship.id]?communityShipSource.url:'game/advanced-fleet.mjs';
 ship.statsLabel=communityShipStats[ship.id]?'基础六维：Galaxy Empire Wiki':'基础六维：单机设计（Wiki 缺值）';
 ship.economyLabel='制造成本与前置：单机适配';
 // Collapse inherited drive thresholds so the UI has one unambiguous requirement per technology.
 ship.drive='Hyperspace_Drive';
 ship.req=Object.entries(ship.req.reduce((out,[id,level])=>({...out,[id]:Math.max(out[id]||0,level)}),{}));
}
