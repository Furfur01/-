import catalog from '../catalog.json';
import {createTechLayout} from './tech-layout.mjs';
export const technologies=Object.values(catalog.tech);
export const techById=catalog.tech;
export const ships=catalog.ships;
export const buildingNames=catalog.buildingNames;
export const number=n=>Math.floor(n).toLocaleString('en-US');
export const compact=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':number(n);
export const clock=n=>{const s=Math.max(0,Math.ceil(n));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(v=>String(v).padStart(2,'0')).join(':');};
export const facilities={Research_Lab:9,Shipyard:9,Nanite_Factory:0};
export const initialLevels={Energy_Tech:6,Laser_Tech:6,Ion_Tech:4,Hyperspace_Tech:5,Plasma_Tech:0,Espionage_Tech:4,Computer_Tech:4,Astrophysics_Tech:4,Combustion_Drive:6,Impulse_Drive:4,Hyperspace_Drive:5,Weapons_Tech:4,Shielding_Tech:5,Strength_Tech:4,Intergalactic_Network:0,Graviton_Tech:0};
export const treeLayout=createTechLayout(technologies);
export const positions=treeLayout.positions;
export const roles={Light_Fighter:['快速突击','FIGHTER / F-01','轻巧敏捷的基础战机，适合组成规模化突击编队。'],Heavy_Fighter:['重装突击','FIGHTER / F-02','更强的舰体与火力，用于加强前线战机编队。'],Cruiser:['巡航 · 快速压制','CRUISER / C-03','兼顾速度与火力的巡航主力。离子武器适合压制轻型战机与火箭炮。'],Battleship:['主力 · 火力投射','BATTLESHIP / B-04','以重型舰炮和装甲构成舰队的正面火力。'],Dreadnought:['主力 · 高阶作战','DREADNOUGHT / D-05','强化护盾与激光武器，适合对抗大型主力舰。'],Bomber:['对地 · 防御压制','BOMBER / B-06','携带等离子武器，专注打击固定防御设施。'],Destroyer:['重装 · 舰队突破','DESTROYER / D-07','重装舰体与高攻击力，用于高强度舰队交战。'],Cargo_Ship:['运输 · 轻型货舱','CARGO / T-01','承担基础资源运输任务。'],Large_Cargo_Ship:['运输 · 大宗物资','CARGO / T-02','为跨星系运输提供更大的货舱。'],Colony_Ship:['探索 · 建立殖民地','COLONY / E-01','向新的星球运送建立殖民地所需的人员和设备。'],Recycler:['回收 · 轨道清理','RECYCLER / R-01','回收轨道残骸中的可用资源。'],Probe:['情报 · 快速侦察','PROBE / S-01','以高速航行完成目标侦察。'],Solar_Satellite:['能源 · 轨道供电','SATELLITE / P-01','部署在轨道上的太阳能收集设施。']};
export const initialOwned={Light_Fighter:48,Heavy_Fighter:16,Cruiser:8,Battleship:3,Dreadnought:0,Bomber:0,Destroyer:0,Cargo_Ship:12,Large_Cargo_Ship:6,Colony_Ship:1,Recycler:4,Probe:10,Solar_Satellite:20};
export function requirements(item,levels){return (item.req||[]).map(([id,level])=>({id,level,name:techById[id]?.name||buildingNames[id]||id,current:levels[id]??facilities[id]??0}));}
export function techCost(id,levels){return techById[id].cost.map(n=>Math.floor(n*(techById[id].factor||2)**(levels[id]||0)));}
export function buildSeconds(ship){return Math.max(2,Math.ceil((ship.cost[0]+ship.cost[1])*1.44/((facilities.Shipyard+1)*90)));}
export function newDemo(){return {version:1,screen:'research',levels:{...initialLevels},owned:{...initialOwned},resources:[1230000,1450000,520000],queue:[{key:'initial',id:'Cruiser',count:5,remaining:5,elapsed:14,each:44}],research:null,selectedTech:'Hyperspace_Drive',selectedShip:'Cruiser',goal:null,speed:1};}
