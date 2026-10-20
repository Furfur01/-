export const SPACE_DESCRIPTIONS={
 Command_Center:{title:'指挥总部',tag:'多翼舰桥 · 通信桅杆 · 行政内院',description:'升起的中央舰桥统领两翼行政院落，前场承担人员集散。后侧数据舱、通信桅杆与补给保障组成独立服务带。',subjects:['中央舰桥与指挥穹顶','分层通信桅杆','侧翼会议舱'],features:['main','antenna','meeting'],detail:'main'},
 Crystal_Mine:{title:'晶体采研基地',tag:'晶脉采集 · 光学分选 · 提纯舱',description:'采集夹具沿裸露晶脉深入矿谷，分选站连接三座透明提纯舱。检测与成品储运占据谷口台地，原矿和成品各走独立入口。',subjects:['透明提纯舱与晶体核心','矿脉采集夹具','原矿光学分选站'],features:['purify','extract2','sort'],detail:'purify'},
 Gas_Mine:{title:'浮空采炼基地',tag:'云层采集 · 分离塔 · 独立储罐台',description:'采集浮台、分离净化主台、压缩与储罐平台分组悬浮。管桥贯通处理链，装卸台和控制人员区在外围独立连接。',subjects:['采集环与进气叶轮','三联分离净化塔','独立储罐平台'],features:['collector2','separator','tankA1'],detail:'separator'},
 Solar_Plant:{title:'太阳能阵列基地',tag:'展开阵列翼 · 汇流脊线 · 储能电芯',description:'三条错开的太阳能阵列带沿缓坡展开，枢轴与支架保持受光净空。汇流线沿阵列边缘接入储能电芯和配电设施，维护建筑集中在入口。',subjects:['储能电芯与转换主厂','展开太阳能翼','功率输出设施'],features:['battery','solarB4','switch'],detail:'battery'},
 Fusion_Reactor:{title:'聚变能源基地',tag:'双环磁约束 · 散热鳍阵 · 能量转换',description:'两座磁约束反应堆构成核心，散热鳍阵与能源转换分置两侧。粗管廊连接冷却循环与反应堆，配电区面向外部输出，控制维护位于前场。',subjects:['磁约束反应堆','散热鳍阵','能源转换大厅'],features:['reactor1','cool2','convert'],detail:'reactor1'},
 Nanite_Factory:{title:'纳米制造基地',tag:'悬置晶圆 · 密封多面舱 · 洁净材料线',description:'悬置晶圆与真空制程设备封装在完整的多面洁净舱内，透过斜面观察窗可见核心工位。材料制备、封装检测与精密仓储紧凑相连，人员气闸和物料入口各走独立通道。',subjects:['密封晶圆舱与真空工位','材料制备压力舱','多级人员气闸'],features:['clean','prep','change'],detail:'clean'},
 Radar_Facility:{title:'深空观测阵列',tag:'主反射碟 · 分布式接收 · 数据舱',description:'大型反射碟与三座接收站占据开阔脊线，保持观测净空。数据处理、校准和维护在坡脚分区组织，以支路和数据导管相连。',subjects:['深空主反射碟','分布式接收站','观测数据舱组'],features:['dish','array2','data'],detail:'dish'},
 Alliance_Depot:{title:'联盟物流枢纽',tag:'压力货仓 · 磁吊集散 · 模块化货箱',description:'主仓、周转仓和专用冷却仓共同面向贯通货运轴。货箱堆场与磁吊装卸站相对，调度舱朝向入口，维修与查验设施位于出口侧。',subjects:['大跨度综合主仓','磁吊装卸站','分层货箱组'],features:['warehouse1','loading','containerA2'],detail:'loading'},
 Shipyard:{title:'太空电梯船港',tag:'升轨核心 · 高位船坞 · 部件装配',description:'地面货运与大件装配分别汇向电梯基座。高位船坞与升降舱显示地面—轨道的连接关系，维修机库与集散大厅各有独立作业面。',subjects:['电梯与高位船坞','舰船部件装配','维修机库与艇体'],features:['base','assembly','hangar'],detail:'base'},
 Missile_Silo:{title:'行星保障基地',tag:'维修坞 · 月面车辆 · 独立储备舱',description:'维修总厂与车辆工位组成主体，备件仓、清洗和后勤调度围绕维修流程紧密组织。防务储备以装甲舱门布置在独立边缘区，保留隔离带。',subjects:['开放维修总厂','月面车辆工位','边缘装甲储备舱'],features:['main','vehicle','reserve1'],detail:'main'},
 Terraformer:{title:'行星环境工程基地',tag:'大气调节脊 · 封闭生态舱 · 水循环',description:'水处理与气候调节沿管廊串联，生态试验置于不同尺度的透明封闭舱。环境主楼面向生态区，工程维护和物料接收位于外侧入口。',subjects:['封闭生态试验舱','分层大气调节装置','环境控制穹顶'],features:['plot1','climate1','control'],detail:'control'}
};
for(const [i,d]of Object.values(SPACE_DESCRIPTIONS).entries())d.eyebrow=`AURORA / SPACE CAMPUS ${String(i+1).padStart(2,'0')}`;
export const ALL_IDS=['Command_Center','Research_Lab','Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Fusion_Reactor','Robotics_Facility','Nanite_Factory','Radar_Facility','Alliance_Depot','Shipyard','Missile_Silo','Terraformer'];
