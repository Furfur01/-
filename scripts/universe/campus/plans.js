// Approved institution plans shared by the game renderer and the visual review.
// Pure geometry data: no gameplay values, account state, or API access.
export const VERSION='aurora-campus-planning-1';
export const EXTENT=[160,140];
const plans=[];
function plan(id,title,subtitle,idea,terrain,adaptation){const p={id,title,subtitle,idea,terrain,adaptation,zones:[],buildings:[],roads:[],flows:[],entries:[],landscape:[]};plans.push(p);return p;}
function zone(p,id,name,x,y,w,d,note){p.zones.push({id,name,bounds:[x,y,w,d],note});}
function b(p,id,zone,name,x,y,w,d,h=2.4,shape='bar',role='support',door='s'){p.buildings.push({id,zone,name,x,y,w,d,h,shape,role,door});return id;}
function row(p,prefix,zone,name,x,y,n,dx,dy,w,d,h,shape,role='equipment'){for(let i=0;i<n;i++)b(p,`${prefix}${i+1}`,zone,`${name} ${i+1}`,x+i*dx,y+i*dy,w,d,h,shape,role);}
function road(p,kind,points){p.roads.push({kind,points});}
function entry(p,id,label,x,y,kind='freight'){p.entries.push({id,label,x,y,kind});}
function flow(p,kind,label,ids,connections=[]){p.flows.push({kind,label,ids,connections});}
function land(p,kind,points,label=''){p.landscape.push({kind,points,label});}
const gasNote='按功能区组织大小不同的浮台；主通道改为连接桥，设备管线随桥连接。';

{
const p=plan('Command_Center','指挥总部园区','总部 · 庭院 · 行政组团','入口广场建立主轴，总部是唯一视觉中心；行政围绕两侧庭院，通信与后勤在后场。','缓坡台地；总部与广场局部整平，两翼之间保留绿地。',gasNote);
zone(p,'hq','指挥核心',58,34,44,38,'多翼主楼面向南侧广场；连廊围合内庭。');
zone(p,'west','西侧行政院落',23,44,29,39,'办事大厅与办公楼围绕共享庭院。');
zone(p,'east','东侧行政院落',109,45,29,38,'行政与会议设施共用步行庭院。');
zone(p,'comms','通信与档案',45,10,62,18,'低矮机房与独立通信设备，避免挤占前场。');
zone(p,'service','后场保障',115,10,34,24,'接收补给、设备维修与勤务仓储。');
zone(p,'plaza','入口广场',55,82,51,34,'前场留白承担集散和步行，不填充小楼。');
b(p,'main','hq','多翼指挥总部',80,52,32,24,3.6,'u','primary');
b(p,'admin1','west','行政办公楼',33,54,10,12,2.4,'l','specialist','e');b(p,'admin2','west','办事大厅',40,75,16,8,2.4,'bar','specialist','n');
b(p,'admin3','east','行政办公楼',126,55,10,12,2.4,'l','specialist','w');b(p,'meeting','east','会议中心',123,75,18,8,2.4,'bar','specialist','n');
b(p,'data','comms','通信数据中心',60,19,20,10,2.4,'bar','specialist');b(p,'archive','comms','档案馆',85,19,12,10,2.4,'bar','specialist');b(p,'antenna','comms','通信节点',101,19,7,7,3.2,'dish','equipment');
b(p,'supply','service','勤务仓库',126,20,8,8);b(p,'repair','service','设备维修间',141,20,8,8);b(p,'gate','plaza','入口服务亭',111,109,6,6,1.8);
road(p,'freight',[[150,32],[112,32],[16,32],[16,95],[144,95],[144,32]]);road(p,'walk',[[80,134],[80,68]]);road(p,'walk',[[80,82],[53,82],[53,65],[40,65]]);road(p,'walk',[[80,82],[108,82],[108,65],[123,65]]);
entry(p,'public','人员入口',80,134,'walk');entry(p,'supplyGate','后勤入口',150,32);flow(p,'walk','入口 → 广场 → 总部 / 两侧行政庭院',['public','main','admin1','admin3']);flow(p,'freight','后勤入口 → 仓储 → 设备保障',['supplyGate','supply','repair','data']);
land(p,'green',[[59,84],[101,84],[101,112],[59,112]],'集散广场');land(p,'ridge',[[6,7],[35,7],[30,28],[8,43]],'北侧缓坡');
}
{
const p=plan('Research_Lab','综合研究所','主楼 · 三个分院 · 共享仪器','主楼连接三个专业分院；人员围绕庭院步行，实验物料从北侧后勤道路进入。','中央缓坡院落；东侧开阔试验场与实验建筑保持间隔。',gasNote+'试验区使用独立隔离浮台。');
zone(p,'main','研究所主楼',56,78,45,29,'主楼向南迎接来访，向北连接各专业分院。');
zone(p,'materials','材料实验分院',18,43,33,28,'制备实验楼与材料检测楼共享院落。');
zone(p,'energy','能源实验分院',58,13,43,27,'能源实验楼与隔离实验室成组。');
zone(p,'systems','系统实验分院',105,43,35,26,'系统实验楼与计算实验室通过短连廊联系。');
zone(p,'shared','共享仪器',59,48,38,20,'位于三个分院之间，减少重复配套。');
zone(p,'test','室外试验场',109,82,38,32,'开阔场地配少量测试设备，不盖满建筑。');
zone(p,'service','设备与物料保障',12,13,36,24,'货物接收、设备维护与实验物料库。');
b(p,'main','main','研究所多翼主楼',79,92,30,20,3.6,'u','primary');
b(p,'mat1','materials','材料制备实验楼',29,53,14,12,2.4,'l','specialist','e');b(p,'mat2','materials','材料检测楼',42,65,10,8,2.4,'bar','specialist','n');
b(p,'energy1','energy','能源实验楼',74,24,22,12,2.4,'l','specialist');b(p,'energy2','energy','隔离实验室',94,26,8,8,2.4,'octagon','specialist');
b(p,'sys1','systems','系统实验楼',119,52,20,10,2.4,'l','specialist');b(p,'sys2','systems','计算实验室',132,63,10,8,2.4,'bar','specialist','w');
b(p,'shared','shared','共享仪器中心',78,57,28,12,2.8,'bar','specialist');
b(p,'testControl','test','试验观测室',137,89,8,8);b(p,'testRig','test','室外测试台',122,101,10,10,1.2,'octagon','equipment');
b(p,'store','service','实验物料库',23,23,10,10);b(p,'service','service','仪器维护间',39,23,8,8);b(p,'entry','main','访客接待',104,118,8,8);
road(p,'freight',[[7,8],[151,8],[151,119],[112,119]]);road(p,'freight',[[7,8],[7,75],[52,75],[52,8]]);
road(p,'walk',[[79,134],[79,106],[103,106],[103,73],[53,73],[53,45],[103,45],[103,73]]);
entry(p,'public','人员入口',79,134,'walk');entry(p,'delivery','物料入口',7,8);flow(p,'walk','人员入口 → 主楼 → 共享仪器',['public','main','shared']);for(const [id,label] of [['mat1','材料分院'],['energy1','能源分院'],['sys1','系统分院']])flow(p,'walk',`共享仪器 → ${label}`,['shared',id]);flow(p,'freight','接收 → 物料库 → 专业分院 → 室外试验场',['delivery','store','mat2','testControl']);
land(p,'test',[[111,84],[145,84],[145,112],[111,112]],'室外试验场');land(p,'green',[[57,70],[100,70],[100,77],[57,77]],'共享庭院');land(p,'ridge',[[111,5],[155,5],[155,35],[143,27]],'外缘缓坡');
}
{
const p=plan('Metal_Mine','金属矿业基地','山体采场 → 处理 → 储运','开采、破碎、加工和装运按地势逐级展开；维修位于重载交通一侧。','西侧矿山与梯级露天采场；东侧两级工业台地。','采场改为独立矿物捕集与接收平台；保留破碎、处理、储运的顺序，不生成山体。');
zone(p,'extract','山体采场',8,10,51,70,'采掘设备沿采坑作业台阶布置。');zone(p,'crush','破碎筛分',64,16,33,31,'紧邻采场出口，通过输送带接收矿石。');zone(p,'process','加工厂区',64,56,49,27,'大跨度加工大厅承担主要处理。');zone(p,'stock','矿石堆存',119,48,32,40,'分堆存放，留出装载通道。');zone(p,'load','成品装运',100,100,50,25,'装运靠近独立货运出口。');zone(p,'repair','维修与调度',18,99,57,25,'车辆维修、备件库与作业调度集中在南侧。');
b(p,'exc1','extract','采掘工作站',45,29,10,8,2.4,'rig','equipment','e');b(p,'exc2','extract','采掘工作站',43,63,10,8,2.4,'rig','equipment','e');
b(p,'crusher','crush','破碎筛分站',80,32,22,20,3.6,'industrial','primary','s');b(p,'process','process','矿石加工大厅',86,69,36,18,3.6,'industrial','primary','s');
b(p,'stock1','stock','原矿料仓',130,60,12,12,1.8,'stock','equipment');b(p,'stock2','stock','分级料仓',140,78,12,12,1.8,'stock','equipment');
b(p,'load','load','装运站',124,110,32,10,2.4,'warehouse','specialist','s');b(p,'weigh','load','计量站',144,121,8,6,1.8);
b(p,'repair','repair','重载维修车间',34,111,24,12,2.4,'warehouse','specialist','n');b(p,'parts','repair','备件库',58,111,10,10);b(p,'control','repair','矿区调度楼',72,118,8,8);
road(p,'freight',[[153,132],[92,132],[92,91],[60,91],[60,49],[112,49],[112,91],[153,91],[153,132]]);road(p,'freight',[[15,91],[92,91]]);
entry(p,'out','矿产运输出口',153,132);entry(p,'staff','作业人员入口',15,91,'walk');flow(p,'belt','采场 → 破碎筛分 → 加工',['exc1','crusher','process']);flow(p,'freight','加工 → 堆存 → 装运 → 出口',['process','stock1','load','out']);flow(p,'freight','维修 → 采掘 / 加工设备',['repair','exc2','process']);
land(p,'mountain',[[6,6],[47,6],[60,18],[53,80],[13,90],[6,69]],'矿山');land(p,'pit',[[17,24],[36,16],[50,36],[43,65],[21,74],[13,51]],'露天采场');
}
{
const p=plan('Crystal_Mine','晶体采研基地','矿谷 → 分选 → 提纯 → 检测','采掘沿斜向矿脉展开；谷口分选与提纯相邻，检测和成品库位于安静的东南台地。','西北—东南向矿谷；加工区落在谷口，成品库使用低坡台地。','矿谷改为晶体捕集及样品接收平台；沿同一物料顺序连接独立处理浮台。');
zone(p,'vein','矿脉采掘带',9,10,49,76,'小型采掘点沿矿脉分布，禁止填平矿谷。');zone(p,'sort','谷口分选',58,47,31,28,'分选设施接收多个采掘点的原矿。');zone(p,'purify','提纯主厂',95,59,40,31,'提纯大厅位于物料线路中段。');zone(p,'lab','检测与样品',100,18,40,26,'检测楼、样品档案与操作办公集中一侧。');zone(p,'storage','成品储运',87,104,59,24,'成品库装卸面朝向南侧出口。');zone(p,'service','维修与接收',16,99,49,25,'原矿运输与维修车辆从西侧进出。');
b(p,'extract1','vein','北段采掘站',25,24,8,8,2.2,'rig','equipment');b(p,'extract2','vein','中段采掘站',33,47,8,8,2.2,'rig','equipment');b(p,'extract3','vein','谷口采掘站',47,71,8,8,2.2,'rig','equipment','e');
b(p,'sort','sort','原矿分选站',73,61,22,18,2.8,'industrial','specialist','s');b(p,'purify','purify','晶体提纯大厅',115,75,30,22,3.6,'industrial','primary','s');
b(p,'lab','lab','纯度检测楼',114,30,20,14,2.4,'l','specialist','s');b(p,'sample','lab','样品档案室',134,30,8,8);b(p,'storage','storage','成品晶体库',110,116,34,14,2.4,'warehouse','specialist');b(p,'dispatch','storage','出货计量站',137,116,10,8);
b(p,'repair','service','采掘设备维修',32,111,24,12,2.4,'warehouse','specialist','n');b(p,'supply','service','物料接收间',55,111,10,10);
road(p,'freight',[[8,132],[8,91],[91,91],[91,12],[148,12],[148,132],[91,132],[91,91]]);
entry(p,'raw','原矿与维修入口',8,132);entry(p,'clean','成品出口',148,132);flow(p,'belt','沿矿脉采掘 → 谷口分选 → 提纯',['extract1','extract2','extract3','sort','purify']);flow(p,'freight','提纯 → 检测 → 成品库 → 出口',['purify','lab','storage','clean']);
land(p,'mountain',[[5,6],[53,6],[66,39],[58,86],[39,88],[15,59]],'矿谷山脊');land(p,'valley',[[17,12],[29,10],[52,72],[44,83],[31,52]],'斜向晶脉');
}
{
const p=plan('Gas_Mine','气体采炼基地','采集 → 分离 → 压缩 → 储运','工艺设备由西向东推进，罐区与控制楼分离；管线贯通设备，检修道路沿外侧通过。','低洼采集盆地连接稍高的处理台地；储罐区保持平整和防护间隔。','采集头下探云层；处理主平台、独立罐区平台和装卸平台由管桥连接。');
zone(p,'collect','采集区',12,23,30,56,'多点采集汇入同一分离处理段。');zone(p,'separate','分离净化',49,27,37,33,'主体工艺大厅与低矮分离设备。');zone(p,'compress','压缩区',93,27,24,35,'压缩设备位于净化与储罐之间。');zone(p,'tanks','分组储罐',123,26,29,61,'储罐按介质分组，组间保留检修通道。');zone(p,'load','装卸与计量',99,102,51,23,'靠近货运出口。');zone(p,'control','控制与维修',21,102,58,23,'人员区位于工艺区外缘。');
row(p,'collector','collect','采集站',26,33,3,0,18,12,10,2.2,'rig');b(p,'separator','separate','分离净化主厂',67,44,28,24,3.6,'industrial','primary');
row(p,'compressor','compress','压缩机组',105,37,2,0,17,14,10,2.2,'industrial');row(p,'tankA','tanks','北组储罐',131,36,2,14,0,9,9,2.8,'tank');row(p,'tankB','tanks','南组储罐',131,67,2,14,0,9,9,2.8,'tank');
b(p,'load','load','气体装卸站',118,114,28,12,2.4,'warehouse','specialist');b(p,'meter','load','计量室',144,114,8,8);b(p,'control','control','生产控制楼',35,114,20,12,2.4,'l','specialist','n');b(p,'repair','control','设备维修间',61,114,10,10);b(p,'parts','control','备件库',75,114,8,8);
road(p,'freight',[[154,132],[154,94],[8,94],[8,14],[154,14],[154,94]]);road(p,'freight',[[118,94],[118,14]]);road(p,'walk',[[35,134],[35,124]]);
entry(p,'goods','装卸入口',154,132);entry(p,'people','人员入口',35,134,'walk');flow(p,'pipe','采集 → 净化 → 压缩 → 储罐 → 装卸',['collector2','separator','compressor1','tankA1','load'],[{from:'tankA1',to:'load',fromSide:'s',toSide:'n',via:[[131,45],[121,45],[121,98],[118,98]]}]);flow(p,'freight','备件 → 设备维护',['parts','repair','compressor2']);
land(p,'basin',[[5,16],[38,8],[44,18],[46,76],[32,87],[7,79]],'采集盆地');land(p,'buffer',[[90,80],[151,80],[151,90],[90,90]],'设备隔离带');
}
{
const p=plan('Solar_Plant','坡地能源园','阵列带 · 汇流 · 储能','三条阵列带顺坡展开；建筑集中在入口，电力经过汇流设施进入储能与配电区。','保留三条宽缓坡带，只有支架落点、检修路和设备地基局部平整。',gasNote+'阵列展开在平台边缘，保持日照净空。');
zone(p,'arrayA','上坡阵列带',17,13,123,20,'面板同向，顺坡分组，组间保留检修通路。');zone(p,'arrayB','中坡阵列带',26,45,123,20,'与上坡组错开，不形成全场棋盘。');zone(p,'arrayC','下坡阵列带',13,77,120,20,'沿地形收窄，末端接汇流设备。');zone(p,'energy','储能与配电',81,109,65,23,'低矮储能大厅连接配电设备。');zone(p,'service','入口维护',14,109,55,23,'维护站、备件库和控制室面向入口。');
row(p,'solarA','arrayA','上坡面板组',26,23,7,17,0,13,11,1.4,'solar');row(p,'solarB','arrayB','中坡面板组',35,55,7,17,0,13,11,1.4,'solar');row(p,'solarC','arrayC','下坡面板组',22,87,7,17,0,13,11,1.4,'solar');
b(p,'battery','energy','储能转换大厅',102,121,34,16,3.2,'industrial','primary','s');b(p,'switch','energy','配电站',136,121,14,12,2.2,'industrial','specialist');b(p,'control','service','运行控制楼',27,121,18,12,2.2,'l','specialist');b(p,'repair','service','支架维修间',50,121,10,10,2.2);b(p,'parts','service','备件库',65,121,8,8,2.2);
row(p,'combiner','arrayA','汇流柜',147,23,3,0,32,5,6,1.5,'bar');road(p,'freight',[[6,135],[6,38],[154,38],[154,70],[6,70],[6,103],[154,103],[154,135],[6,135]]);
entry(p,'gate','维护入口',6,135);flow(p,'power','上坡阵列 → 汇流 → 储能 → 配电',['solarA4','combiner1','battery','switch'],[{from:'solarA4',to:'combiner1',fromSide:'s',toSide:'s',via:[[77,32],[147,32]]},{from:'combiner1',to:'battery',fromSide:'e',toSide:'n',via:[[152,23],[152,104],[102,104]]}]);
for(const [source,target,x,y]of [['solarB4','combiner2',86,64],['solarC4','combiner3',73,96]])flow(p,'power',`${source==='solarB4'?'中坡':'下坡'}阵列 → 汇流 → 储能`,[source,target,'battery'],[{from:source,to:target,fromSide:'s',toSide:'s',via:[[x,y],[147,y]]},{from:target,to:'battery',fromSide:'e',toSide:'n',via:[[152,y-9],[152,104],[102,104]]}]);flow(p,'freight','维护站 → 三条阵列带',['repair','solarA1','solarB1','solarC1']);
land(p,'slope',[[8,8],[143,8],[151,33],[17,34]],'上坡台地');land(p,'slope',[[18,43],[150,43],[154,66],[27,67]],'中坡台地');land(p,'slope',[[7,76],[132,76],[141,98],[14,99]],'下坡台地');
}
{
const p=plan('Fusion_Reactor','聚变能源基地','双堆核心 · 冷却 · 转换 · 配电','两个反应堆构成双核心；冷却在西、能源转换在东，控制维护区位于南侧。','双堆使用独立稳定地基；冷却区与设备管廊连接，不大面积削平外围地形。',gasNote+'双堆采用分离承载平台，冷却设备悬挂在背阴侧。');
zone(p,'reactors','双堆核心',55,24,35,68,'两个低矮反应堆通过管廊接入转换大厅。');zone(p,'cooling','冷却与循环',14,28,27,61,'冷却设备成对布置，预留维护间隔。');zone(p,'conversion','能源转换',106,43,38,27,'转换大厅作为次主体。');zone(p,'grid','配电设施',108,82,38,18,'分组配电设备连接输出端。');zone(p,'control','控制与保障',34,111,87,21,'操作人员从南侧进入，配套仓储不占反应堆周边。');
b(p,'reactor1','reactors','一号反应堆',73,42,26,26,3.6,'octagon','primary');b(p,'reactor2','reactors','二号反应堆',73,76,26,26,3.6,'octagon','primary');
row(p,'cool','cooling','循环冷却机组',27,39,3,0,21,18,12,2.8,'tank');b(p,'convert','conversion','能源转换大厅',125,57,30,18,2.8,'industrial','specialist');row(p,'grid','grid','配电设备',117,91,2,20,0,12,10,1.8,'industrial');
b(p,'control','control','能源控制楼',51,121,26,14,2.4,'l','specialist','n');b(p,'repair','control','维护车间',85,121,12,12);b(p,'store','control','设备备件库',111,121,10,10);
road(p,'freight',[[7,135],[7,15],[153,15],[153,105],[7,105]]);road(p,'freight',[[97,15],[97,105]]);entry(p,'gate','维护入口',7,135);flow(p,'pipe','循环冷却 → 一号反应堆 → 能源转换',['cool2','reactor1','convert']);flow(p,'pipe','循环冷却 → 二号反应堆 → 能源转换',['cool3','reactor2','convert']);flow(p,'power','转换大厅 → 配电输出',['convert','grid1']);flow(p,'freight','维修 → 双堆服务区',['repair','reactor2']);
land(p,'buffer',[[46,18],[97,18],[97,99],[46,99]],'反应堆维护净空');land(p,'ridge',[[6,5],[50,5],[44,19],[8,25]],'外围低脊');
}
{
const p=plan('Robotics_Facility','机器人制造基地','原料 → 加工 → 装配 → 测试 → 出货','两座长厂房定义生产轴；原料和成品分处两端，测试场紧邻装配出口。','阶梯式工业台地沿生产轴展开；区间保留排水绿带。',gasNote+'重载装配浮台与测试浮台直接连接。');
zone(p,'raw','原料接收',11,15,33,28,'原料库装卸面朝向西侧货运入口。');zone(p,'parts','零件加工',55,14,43,28,'大跨度加工大厅连接两座专用车间。');zone(p,'assembly','整机装配',56,57,45,27,'装配大厅为视觉主楼。');zone(p,'test','整机测试',113,52,35,42,'室外测试场配观测间，保持空地。');zone(p,'finished','成品储运',105,108,44,23,'出货站与成品库位于流程末端。');zone(p,'support','工具与维修',13,102,72,24,'工具库、维修车间和操作办公集中靠近人员入口。');
b(p,'raw','raw','原料仓库',27,29,24,18,2.4,'warehouse','specialist','w');b(p,'machine','parts','零部件加工大厅',77,28,36,18,3.6,'industrial','primary');b(p,'assembly','assembly','机器人装配大厅',78,70,36,18,3.6,'industrial','primary');
b(p,'precision','parts','精密加工间',104,22,10,10);b(p,'tool','parts','工装准备间',104,36,10,10);b(p,'testcontrol','test','测试观测室',139,61,10,10);b(p,'testrig','test','负载测试台',128,80,18,12,1.5,'test','equipment');b(p,'finished','finished','成品库与出货站',126,120,34,16,2.4,'warehouse','specialist');
b(p,'repair','support','机床维修车间',29,115,24,14,2.4,'warehouse','specialist','n');b(p,'spares','support','工装工具库',55,115,10,10);b(p,'office','support','生产调度室',76,115,12,10);
road(p,'freight',[[6,6],[6,94],[152,94],[152,135],[6,135],[6,94]]);road(p,'freight',[[6,48],[113,48],[113,94]]);road(p,'walk',[[46,135],[46,94]]);
entry(p,'rawGate','原料入口',6,6);entry(p,'out','成品出口',152,135);entry(p,'staff','人员入口',46,135,'walk');flow(p,'production','原料 → 加工 → 装配 → 测试 → 成品',['raw','machine','assembly','testrig','finished'],[{from:'raw',to:'machine',fromSide:'e',toSide:'w'},{from:'machine',to:'assembly',fromSide:'s',toSide:'n'},{from:'assembly',to:'testrig',fromSide:'e',toSide:'w'},{from:'testrig',to:'finished',fromSide:'s',toSide:'n'}]);flow(p,'freight','原料入口 → 仓库接收面',['rawGate','raw']);flow(p,'freight','成品库 → 出货出口',['finished','out']);
land(p,'test',[[115,54],[147,54],[147,92],[115,92]],'整机测试场');land(p,'green',[[58,86],[99,86],[99,91],[58,91]],'排水绿带');
}
{
const p=plan('Nanite_Factory','纳米制造院区','制备 · 洁净制造 · 封装检测','制造主楼与专业附属楼围合洁净内院；物料由北侧进入，人员从南侧进入。','紧凑台地，外围保留坡地；设备服务带位于院落背面。',gasNote+'洁净主平台与设备保障平台用封闭管桥连接。');
zone(p,'clean','洁净制造核心',54,49,49,39,'低矮多翼主楼围合内院，保持进出分区。');zone(p,'prep','材料制备',18,28,29,44,'原料预处理与洁净材料制备成组。');zone(p,'pack','封装与检测',111,30,30,45,'封装与精密检测沿生产顺序布置。');zone(p,'store','精密仓储',106,100,36,26,'成品库靠近独立物料出口。');zone(p,'utility','设备服务带',57,12,49,23,'气体、纯水和设备维护位于主楼背面。');zone(p,'entry','人员服务',28,104,51,24,'更衣与人员入口集中在南侧。');
b(p,'clean','clean','洁净制造主楼',79,67,40,28,3.6,'u','primary');b(p,'prep','prep','材料制备楼',33,44,20,20,2.4,'l','specialist','e');b(p,'raw','prep','原料净化间',33,65,12,10,2.4,'bar','specialist','e');
b(p,'pack','pack','封装车间',126,43,22,16,2.4,'bar','specialist','w');b(p,'inspect','pack','精密检测楼',127,67,20,12,2.4,'l','specialist','w');b(p,'store','store','精密成品库',125,114,28,18,2.4,'warehouse','specialist');
b(p,'water','utility','纯水设备间',67,23,12,12);b(p,'gas','utility','工艺气体设备',85,23,10,10,2.4,'tank','equipment');b(p,'repair','utility','维护间',101,23,8,8);b(p,'change','entry','更衣与人员接待',47,116,30,14,2.4,'bar','specialist');b(p,'office','entry','运行办公',73,116,8,8);
road(p,'freight',[[7,7],[151,7],[151,135],[96,135],[96,95],[7,95],[7,7]]);road(p,'walk',[[47,135],[47,126],[25,126],[25,97],[79,97],[79,84]]);
entry(p,'material','物料入口',7,7);entry(p,'staff','人员入口',47,135,'walk');entry(p,'out','成品出口',151,135);flow(p,'production','材料制备 → 洁净制造 → 封装 → 检测 → 成品',['prep','clean','pack','inspect','store'],[{from:'prep',to:'clean',fromSide:'e',toSide:'w'},{from:'clean',to:'pack',fromSide:'e',toSide:'w'},{from:'pack',to:'inspect',fromSide:'s',toSide:'n'},{from:'inspect',to:'store',fromSide:'s',toSide:'n'}]);flow(p,'freight','物料接收 → 制备',['material','prep']);flow(p,'freight','成品库 → 出口',['store','out']);flow(p,'walk','人员入口 → 更衣 → 洁净内院',['staff','change','clean']);flow(p,'pipe','设备服务带 → 制造主楼',['water','gas','clean']);
land(p,'green',[[54,37],[106,37],[106,45],[54,45]],'服务隔离绿带');land(p,'ridge',[[7,98],[21,96],[25,134],[7,134]],'外围坡地');
}
{
const p=plan('Radar_Facility','深空观测园区','主天线 · 分布阵列 · 数据中心','主天线占据高地，辅助天线分散在不同观测点；数据与维修建筑集中在坡脚。','北侧开阔脊线设天线；支路顺坡，南侧坡脚设低矮建筑。',gasNote+'天线平台向不同观测方向伸展，保持遮挡净空。');
zone(p,'main','主观测阵地',55,13,44,43,'单一主天线具有最大识别轮廓，周围留出开阔地。');zone(p,'array','分布式天线',16,30,128,50,'三个独立观测点，不填满天线之间的空地。');zone(p,'data','数据与控制',58,98,45,29,'处理大厅位于坡脚，连接各观测站。');zone(p,'calibration','校准场',112,92,35,35,'开阔校准区保留视线通道。');zone(p,'maintenance','维修与仓储',14,103,34,25,'车辆在坡脚停靠，支路到达观测点。');
b(p,'dish','main','主观测天线',77,34,30,30,4.5,'dish','primary');b(p,'array1','array','西侧辅助天线',29,45,14,14,2.8,'dish','equipment');b(p,'array2','array','东侧辅助天线',132,46,14,14,2.8,'dish','equipment');b(p,'array3','array','南侧辅助天线',93,75,14,14,2.8,'dish','equipment');
b(p,'data','data','观测数据中心',80,113,36,20,3.6,'l','primary');b(p,'calibration','calibration','校准目标台',128,106,12,12,1.5,'octagon','equipment');b(p,'control','calibration','校准控制间',139,120,8,8);b(p,'repair','maintenance','天线维修车间',26,116,16,16,2.4,'warehouse','specialist');b(p,'parts','maintenance','设备备件库',42,116,8,8);
road(p,'freight',[[7,135],[7,89],[153,89],[153,135]]);road(p,'freight',[[50,89],[50,61],[17,61]]);road(p,'freight',[[50,61],[77,61],[77,55]]);road(p,'freight',[[111,89],[111,61],[145,61]]);entry(p,'gate','观测站入口',7,135);for(const [id,label] of [['dish','主天线'],['array1','西侧站'],['array2','东侧站'],['array3','南侧站']])flow(p,'data',`${label} → 数据处理中心`,[id,'data']);flow(p,'freight','维修 → 坡脚支路 → 天线设备',['repair','dish']);
land(p,'ridge',[[8,12],[52,5],[107,8],[151,29],[143,72],[96,88],[40,77],[10,59]],'开阔观测脊线');land(p,'test',[[114,95],[146,95],[146,126],[114,126]],'校准净空');
}
{
const p=plan('Alliance_Depot','联盟物流枢纽','接收 · 分类仓储 · 集散出货','两座主仓与专用仓围绕贯通货运轴；装卸面一致朝向通道，调度中心面向入口。','宽缓物流台地；外围保留绿带与坡地，装卸场地保持连续。',gasNote+'仓储浮台按货物类别分组，集散平台位于连接桥交汇处。');
zone(p,'main','大型综合仓',15,19,65,31,'两座不同长度的仓库朝南侧装卸通道开门。');zone(p,'special','专用仓储',91,16,55,34,'冷却与精密货物使用独立仓。');zone(p,'yard','集装箱堆场',18,69,58,30,'集装箱按装卸作业分组，场内留出通道。');zone(p,'dispatch','装卸集散',95,70,50,31,'装卸站与堆场相对，便于短途转运。');zone(p,'control','调度与保障',25,112,113,20,'调度面向来车方向，维修与备件位于边侧。');
b(p,'warehouse1','main','综合主仓',36,34,36,24,3.6,'warehouse','primary');b(p,'warehouse2','main','周转仓',68,34,18,24,2.8,'warehouse','specialist');b(p,'cold','special','专用冷却仓',108,32,26,24,2.8,'warehouse','specialist');b(p,'precision','special','精密货物仓',136,32,16,20,2.4,'warehouse','specialist');
row(p,'containerA','yard','集装箱组',27,77,4,13,0,9,6,1.6,'container');row(p,'containerB','yard','集装箱组',27,92,4,13,0,9,6,1.6,'container');b(p,'loading','dispatch','集散装卸站',119,84,40,18,2.8,'warehouse','specialist','w');
b(p,'control','control','物流调度中心',43,122,28,12,2.4,'l','specialist');b(p,'repair','control','装卸设备维修',82,122,20,12,2.4,'warehouse','specialist');b(p,'parts','control','备件库',107,122,10,10);b(p,'gate','control','计量与查验',130,122,10,10);
road(p,'freight',[[7,58],[153,58],[153,106],[7,106],[7,58]]);road(p,'freight',[[85,58],[85,106]]);road(p,'freight',[[7,106],[7,135],[153,135],[153,106]]);entry(p,'in','到货入口',7,58);entry(p,'out','出货出口',153,106);flow(p,'freight','到货 → 分类入库 → 集散装卸 → 出货',['in','warehouse1','loading','out']);flow(p,'freight','堆场 → 装卸站',['containerA2','loading']);
land(p,'yard',[[17,68],[76,68],[76,100],[17,100]],'集装箱操作场');land(p,'green',[[10,7],[147,7],[147,12],[10,12]],'外围绿带');
}
{
const p=plan('Shipyard','太空电梯地面港','集散 · 大件装配 · 电梯 · 轨道','货物集散和大件装配分别接入电梯基座；维修机库靠外侧，地面流线汇向升轨核心。','中心基座使用稳定地基；大件运输通道保持连续坡度，外围绿地保留。',gasNote+'电梯基座由独立承载平台支撑，货运与装配平台分置两翼。');
zone(p,'base','电梯基座',61,44,39,40,'基座为地面核心，塔缆连接已有轨道船坞。');zone(p,'cargo','货物集散',17,91,40,31,'补给仓与集散大厅服务常规货物。');zone(p,'assembly','大件装配',105,28,44,31,'长厂房连接大件运输通道。');zone(p,'hangar','维修机库',106,88,42,32,'机库面向独立维护作业场。');zone(p,'support','运行与备件',16,20,34,48,'调度、备件和电梯维护集中在西侧。');
b(p,'base','base','太空电梯基座',80,64,30,30,3.6,'octagon','primary');b(p,'cargo','cargo','货物集散大厅',37,106,32,20,3.6,'warehouse','primary','e');b(p,'assembly','assembly','舰船部件装配厂',127,44,36,22,2.8,'industrial','specialist','s');b(p,'hangar','hangar','维修机库',127,103,34,22,2.8,'warehouse','specialist','n');
b(p,'control','support','升轨调度中心',32,30,24,14,2.4,'l','specialist');b(p,'parts','support','电梯备件库',24,55,10,10);b(p,'repair','support','驱动维护间',40,55,10,10);b(p,'supply','cargo','补给接收站',25,127,10,8);b(p,'cargoControl','cargo','装载控制室',48,127,10,8);
road(p,'freight',[[7,134],[7,76],[58,76],[58,12],[153,12],[153,76],[102,76],[102,134],[7,134]]);road(p,'freight',[[58,76],[58,134]]);road(p,'freight',[[58,86],[102,86]]);
entry(p,'goods','地面货运入口',7,134);entry(p,'partsGate','大件入口',153,12);flow(p,'freight','常规补给 → 集散 → 电梯基座',['goods','cargo','base']);flow(p,'freight','大件接收 → 装配 → 电梯基座',['partsGate','assembly','base']);flow(p,'orbital','电梯基座 ↑ 轨道船坞',['base']);
land(p,'yard',[[105,61],[149,61],[149,86],[105,86]],'大件转运场');land(p,'green',[[63,91],[96,91],[96,127],[63,127]],'电梯维护净空');
}
{
const p=plan('Missile_Silo','行星维修保障基地','维修为主 · 后勤调度 · 边缘储备','维修总厂占据中心；备件仓与车辆场服务日常维护，防务储存独立放在东北边缘。','主厂与车辆场局部整平；防务区由低脊与绿带分隔。',gasNote+'防务储备使用远离人员主平台的独立平台。');
zone(p,'main','维修总厂',56,51,44,31,'多工位大跨度厂房是主视觉。');zone(p,'vehicles','车辆维护场',17,55,32,36,'车辆检修和露天作业场紧邻主厂。');zone(p,'parts','备件与仓储',17,19,64,25,'大小不同的备件仓按供应关系布置。');zone(p,'dispatch','后勤调度',49,110,44,22,'调度楼面向南侧入口。');zone(p,'reserve','独立防务储存',110,13,39,40,'低矮地下储存入口，限定在边缘小区。');zone(p,'service','辅助设备',111,92,36,32,'设备清洗与回收库靠近作业出口。');
b(p,'main','main','维修总厂',78,66,36,22,3.6,'industrial','primary');b(p,'vehicle','vehicles','车辆维修棚',32,66,22,14,2.4,'warehouse','specialist','e');b(p,'test','vehicles','车辆维护台',32,84,20,8,1,'test','equipment');
b(p,'parts','parts','综合备件仓',37,31,32,16,2.4,'warehouse','specialist');b(p,'tools','parts','专用工具库',70,31,16,14,2.4,'warehouse','specialist');b(p,'dispatch','dispatch','后勤调度楼',70,121,34,14,2.4,'l','specialist');
row(p,'reserve','reserve','防务储存入口',121,26,2,19,0,11,11,1.5,'octagon');b(p,'reserveControl','reserve','储存值守室',131,45,8,8);b(p,'wash','service','设备清洗间',125,103,20,12,2.4,'industrial','specialist');b(p,'recycle','service','回收备件库',137,118,12,10);
road(p,'freight',[[7,134],[7,45],[100,45],[100,86],[153,86],[153,134],[7,134]]);road(p,'freight',[[7,99],[100,99],[100,8],[153,8],[153,86]]);
entry(p,'gate','维修接收入口',7,134);entry(p,'secure','储备维护入口',153,8);flow(p,'freight','维修接收 → 主厂 / 车辆场 → 清洗交付',['gate','main','vehicle','wash']);flow(p,'freight','备件仓 → 维修工位',['parts','main']);flow(p,'freight','独立维护入口 → 防务储存',['secure','reserve1']);
land(p,'buffer',[[108,57],[149,57],[149,77],[108,77]],'防务区隔离低脊');land(p,'yard',[[17,76],[48,76],[48,94],[17,94]],'车辆作业场');
}
{
const p=plan('Terraformer','环境工程与生态基地','水处理 → 环境调节 → 生态试验','水处理和环境调节组成设备链，生态试验田顺地形展开；工程车辆从西侧进入。','保留浅谷水系和三块试验台地；仅控制楼与处理设施局部整平。',gasNote+'试验田改为封闭生态舱；水处理、气候设备及工程维护各用独立平台。');
zone(p,'control','环境控制中心',63,91,42,35,'低矮多翼主楼面对入口和生态试验区。');zone(p,'water','水处理区',15,20,39,39,'两级处理池与泵房顺水路排列。');zone(p,'climate','气候调节区',66,18,29,62,'调节装置沿设备管廊分组布置。');zone(p,'eco','生态试验田',109,17,38,70,'不同试验田按坡向错开，田间留步道。');zone(p,'works','工程设备场',15,94,37,35,'工程维修、物料接收与车辆停放靠外侧入口。');
b(p,'control','control','环境工程主楼',84,108,34,26,3.6,'u','primary');b(p,'water1','water','一级处理池',29,31,20,16,1.2,'basin','equipment');b(p,'water2','water','二级处理池',40,51,20,12,1.2,'basin','equipment');b(p,'pump','water','泵房与检测',24,70,12,10,2.4,'industrial','specialist');
row(p,'climate','climate','气候调节装置',80,31,3,0,20,18,14,2.8,'octagon');b(p,'plot1','eco','高坡生态试验田',128,29,30,18,.5,'field','equipment');b(p,'plot2','eco','中坡生态试验田',125,53,26,18,.5,'field','equipment');b(p,'plot3','eco','低坡生态试验田',132,77,24,14,.5,'field','equipment');
b(p,'works','works','工程维护车间',33,108,28,18,2.4,'warehouse','specialist','e');b(p,'store','works','工程材料库',24,126,10,8);b(p,'lab','works','环境样品检测间',44,126,10,8);
road(p,'freight',[[6,135],[6,89],[57,89],[57,7],[105,7],[105,89],[153,89],[153,135],[6,135]]);road(p,'walk',[[84,135],[84,124]]);
entry(p,'worksGate','工程车辆入口',6,135);entry(p,'public','人员入口',84,135,'walk');flow(p,'pipe','水源 → 两级处理 → 泵房 → 气候调节',['water1','water2','pump','climate2']);flow(p,'walk','控制中心 → 生态试验与监测',['control','plot1','plot2','plot3']);flow(p,'freight','工程接收 → 维修 → 处理设备',['worksGate','works','pump']);
land(p,'water',[[8,9],[17,7],[20,20],[16,57],[10,77],[6,71]],'浅谷水系');land(p,'slope',[[105,13],[146,13],[153,83],[111,88]],'生态台地');
}

// Explicit label anchors avoid conflating the main observation antenna with its distributed stations.
plans.find(p=>p.id==='Radar_Facility').zones.find(z=>z.id==='array').labelAt=[29,75];
plans.find(p=>p.id==='Research_Lab').entries.find(e=>e.id==='delivery').labelAt=[18,3];
plans.find(p=>p.id==='Missile_Silo').entries.find(e=>e.id==='secure').labelAt=[139,3];
export const PLANS=Object.freeze(plans);
export function footprint(b){
  const w=b.w/2,d=b.d/2;
  let pts=b.shape==='u'?[[-w,-d],[w,-d],[w,d],[w*.48,d],[w*.48,-d*.12],[-w*.48,-d*.12],[-w*.48,d],[-w,d]]:
    b.shape==='l'?[[-w,-d],[w,-d],[w,-d*.12],[-w*.18,-d*.12],[-w*.18,d],[-w,d]]:
    ['octagon','dish','tank'].includes(b.shape)?Array.from({length:12},(_,i)=>[Math.cos(i*Math.PI/6)*w,Math.sin(i*Math.PI/6)*d]):[[-w,-d],[w,-d],[w,d],[-w,d]];
  return pts.map(([x,y])=>[x+b.x,y+b.y]);
}
export function polygonArea(points){return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2);}
export function doorPoint(b,offset=0){return b.door==='n'?[b.x,b.y-b.d/2-offset]:b.door==='e'?[b.x+b.w/2+offset,b.y]:b.door==='w'?[b.x-b.w/2-offset,b.y]:[b.x,b.y+b.d/2+offset];}
