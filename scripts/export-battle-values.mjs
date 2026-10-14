import fs from 'node:fs';
import {trialCatalog} from '../game/battle-trial.mjs';
const {ships}=trialCatalog(),n=v=>v==null?'—':Number(v).toLocaleString('zh-CN',{maximumFractionDigits:2});
let md='# 全舰船战斗数值（2026-10-15）\n\n当前编队测试含 '+ships.length+' 种舰船。舰体与护盾科技均 50 级，实际值为基础 ×6；武器科技 0 级，攻击 ×1。只对新入场单位生效。\n\n理论总秒伤 = 攻击 / 6，未计速射、命中损失、导弹拦截与溅射；齐射伤害按炮口分摊，双光束不重复翻倍。\n\n| 舰型 | 基础舰体 | 基础盾 | 攻击 | 测试舰体 | 测试盾 | 理论总秒伤 | 主炮射程 | 周期(s) | 整轮主炮伤害 |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for(const s of ships){const v=s.stats;md+='| '+s.name+' | '+[v.base.hull,v.base.shield,v.attack,v.hull,v.shield,v.dps,v.primary?.range,v.primary?.cooldown,v.primary?.volley].map(n).join(' | ')+' |\n';}
md+='\n## 机动、尺寸与射界\n\n| 舰型 | 舰长 | 碰撞半径 | 速度 | 加力速度 | 转向 °/s | 固定主炮半射界 ° |\n|---|---:|---:|---:|---:|---:|---:|\n';
for(const s of ships){const v=s.stats;md+='| '+s.name+' | '+[v.length,v.radius,v.speed,v.boostSpeed,v.turnDegrees,v.arcHalfDegrees].map(n).join(' | ')+' |\n';}
md+='\n## 武器与完整参数\n\n主炮分配剩余火力；有副炮时副炮占 12%（深空吞噬者没有主炮，自卫炮占 82%、导弹占 18%，均为 350 射程），巡洋舰辅助导弹占 10%，每 16 秒 2 枚、800 射程；其余有辅助导弹的舰船占 18%。近防每 0.7 秒有一次拦截机会，140 射程，成功率 55%。每轮导弹间隔 0.15 秒出舱，0.2 秒后点火，以 180 单位/s² 提升目标速度，最终 210；实际速度平滑追踪目标。多管实弹主炮间隔 0.05 秒出膛。固定炮射界约 ±9.17°；护盾先吸收伤害，溢出进入舰体，不按回合回满。\n\n速射系数 = min(4, 1 + log₂(原速射值) × 0.35)，主炮周期除以此系数。下列秒伤均不含该系数。模拟步长 0.05 秒，实际开火周期向模拟步长取整；目标每 1 秒错峰重选。控制断连超过 2 秒恢复 AI，最长交战 600 秒。\n';
for(const s of ships){const v=s.stats;md+='\n### '+s.name+(s.experimental?'（试验舰）':'')+'\n\n';md+='| 武器 | 类型 | 每轮数量 | 射程 | 周期(s) | 整轮伤害 | 单弹/单束 | 理论秒伤 | 弹速 |\n|---|---|---:|---:|---:|---:|---:|---:|---:|\n';for(const [label,w] of [['主炮',v.primary],['自动副炮',v.secondary],['辅助导弹',v.missiles]])if(w)md+='| '+label+' | '+w.kind+' | '+[w.count,w.range,w.cooldown,w.volley,w.perRound,w.dps].map(n).join(' | ')+' | '+(w.speed==null?'即时光束':n(w.speed))+' |\n';
 if(v.splash)md+='\n溅射：半径 '+n(v.splash.radius)+'，额外伤害为每枚弹丸直击伤害的 '+n(v.splash.fraction*100)+'%，随距离线性衰减。不重复打直击目标，不伤友军。\n';
 if(v.blast)md+='\n湮灭之星：一次性自动突击，峰值伤害 '+n(v.blast.peak)+'，半径 '+n(v.blast.radius)+'，伤害 = 峰值 × (1 - 距离/半径)^0.65。穿盾，不伤友军，收割者免疫。2 秒准备，同阵营每枚错开 8 秒，起飞后 20 秒超时自毁。冲击延迟 0.28 秒，扩散 1.1 秒。不改变观察者镜头。\n';
 if(v.reaper)md+='\n相位主炮回盾：每轮伤害的 8%，上限为最大盾的 8%，不超过本舰最大盾；免疫反物质冲击。\n';
 md+='\n完整参数（经济属性仅正式舰有效，战斗与星际航行速度分别列出）：\n\n```json\n'+JSON.stringify({...v,economy:s.experimental?null:v.economy},null,2)+'\n```\n';}
fs.writeFileSync('output/fleet-combat-values.md',md);fs.writeFileSync('output/fleet-combat-values.json',JSON.stringify(ships.map(s=>({...s,stats:{...s.stats,economy:s.experimental?null:s.stats.economy}})),null,2));
