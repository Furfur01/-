import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const menu=JSON.parse(fs.readFileSync(new URL('research/apk/zh-CN.json',root),'utf8')).menu;
const mapping={Energy_Tech:'energy',Laser_Tech:'laser',Ion_Tech:'ion',Hyperspace_Tech:'hyperspace',Plasma_Tech:'plasma',Espionage_Tech:'espionage',Computer_Tech:'computer',Astrophysics_Tech:'astrophysics',Weapons_Tech:'weapons',Shielding_Tech:'shielding',Strength_Tech:'armour'};
const lore={};
for(const [id,key]of Object.entries(mapping)){
 const apkKey=`${key}_tech_description`;let text=menu[apkKey];
 if(!text)throw Error(`Missing APK text: ${apkKey}`);
 // Keep the original setting but remove obsolete numerical promises. Effects are shown separately.
 if(id==='Energy_Tech')text='能量科技主要研究能量在各种环境下的存储和高效利用。能量科技是其他很多特定技术的研究前提。';
 if(id==='Computer_Tech')text=text.split('每提升2')[0];
 if(id==='Astrophysics_Tech')text=text.split('每2级')[0];
 lore[id]={text,source:'apk',apkKey};
}
for(const id of ['Combustion_Drive','Impulse_Drive','Hyperspace_Drive']){
 const apkKey=id.toLowerCase()+'_description';
 lore[id]={text:menu[apkKey].split('每提升1级')[0],source:'apk',apkKey};
}
Object.assign(lore,{
 Intergalactic_Network:{source:'original',text:'一颗星球上的实验室，可能要花十年才能发现另一颗星球昨天犯过的错误。星际研究网络把遥远的实验台接在一起：一处提出猜想，另一处验证，第三处负责提醒前两处检查单位。帝国的疆界因此也成了思想的疆界。'},
 Graviton_Tech:{source:'original',text:'引力让尘埃聚成星球，也让帝国的旗舰乖乖停在轨道上。研究员想知道：如果能把这只无形的手握在自己手里，会发生什么？实验室的第一条新规定是，测试期间所有人必须系好安全带。'},
 Advanced_Ship_Engineering:{source:'original',text:'把一艘驱逐舰放大十倍，并不会得到旗舰，只会得到十倍昂贵的残骸。先进舰船工程从龙骨、散热和损伤隔离重新设计战舰，让庞大的舰体在跃迁、齐射和挨打时仍然保持完整。船厂终于可以把“不可能”从图纸上擦掉，换成“预算不足”。'},
 Quantum_Command:{source:'original',text:'当一千艘战舰同时请求指令，最先崩溃的往往不是护盾，而是通讯频道。量子指挥核心用并行预测和同步校时，让分散的火控、蜂群与旗舰共享同一份战场图景。炮手看到的是目标，指挥官看到的则是下一秒。'},
 Metamaterial_Tech:{source:'original',text:'同样的原子，换一种排列，就可能拥有截然不同的脾气。超构材料把承力骨架、导热通道与微型缓冲层编织在一起，让装甲在需要时坚硬，在受冲击时懂得退让。工程师称之为结构设计；第一次撞上它的炮手有另一个名字。'},
 Phase_Energy:{source:'original',text:'普通武器努力把更多能量送到敌人面前，相位研究员却先问：敌人的护盾，究竟在哪一个“面前”？通过精密调节场的相位，实验装置能把能量聚集到原本难以触及的位置。实验室门口因此多了一块牌子：墙壁不再保证能挡住所有事故。'},
 Antimatter_Containment:{source:'original',text:'反物质不是一种适合洒出来再擦干净的燃料。磁约束、真空隔离与层层冗余让它第一次成为可运输的能源，也让收割者拥有抵御湮灭冲击的特殊结构。至于湮灭之星，设计师把所有努力反过来用：在正确的地点，让约束恰好失效。'}
});
fs.writeFileSync(new URL('game/technology-lore.json',root),JSON.stringify(lore,null,2)+'\n');
console.log(`Saved ${Object.keys(lore).length} technology descriptions (${Object.values(lore).filter(x=>x.source==='apk').length} from APK).`);
