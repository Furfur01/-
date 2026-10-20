import fs from 'node:fs';
import {spinalMounts,shipWeaponLayouts} from './ship-weapon-mounts.mjs';
import {communityShipStats,communityShipSource} from './ship-community-stats.mjs';
import {advancedShips} from './advanced-fleet.mjs';
import {shipQuotes} from './ship-quotes.mjs';
import {shipLoreSupplements} from './ship-lore.mjs';

const mapping=JSON.parse(fs.readFileSync(new URL('../models/reference/original-atlas-v1/name-map.json',import.meta.url),'utf8'));
const fields=['strength','shield','attack','speed','cargo','fuel'];
export function shipArchive(units){
  const rows=mapping.rows.filter(r=>r.category==='fleet').map(r=>{
    const id=r.project_or_reference_id,apkDescription=r.localization_cn||'',supplement=shipLoreSupplements[id];
    return {id,apkId:r.id,constant:r.enum_evidence.constant,name:r.name_zh,reference:r.file,referenceHash:r.sha256,description:[apkDescription,supplement].filter(Boolean).join('\n\n'),apkDescription,descriptionSource:supplement?'APK localization + local narrative extension':'APK localization',localizationKey:r.localization_key,identitySource:'APK enum + Fleets.tfs',modelSource:'APK sprite reconstruction; hidden surfaces interpreted'};
  });
  rows.push({id:'Death_Star',apkId:8,constant:'FT_DEAD_STAR',name:'死星',reference:null,description:'APK 定义了编号 8，但 Fleets.tfs 没有对应图标。当前采用用户提供的死星模型，包含程序化装甲、赤道壕沟、凹面主炮与八组聚焦发射器。',identitySource:'APK enum only',modelSource:'User supplied Death_Star_Threejs (1).html'});
  rows.sort((a,b)=>a.apkId-b.apkId);
  rows.push({id:'Guardian',apkId:null,constant:null,name:'守护者（旧版）',reference:null,description:'来自已有截图与旧版玩法。APK 未找到对应常量，不等同于 type_26 钛能守卫者。模型为概念补建。',identitySource:'Legacy screenshot; APK identity unconfirmed',modelSource:'Concept; no APK identity'});
  return rows.map(r=>{const u=units[r.id],community=communityShipStats[r.id];return {...r,quote:shipQuotes[r.id]??null,weaponLayout:shipWeaponLayouts[r.id]??null,spinalMount:spinalMounts[r.id]??null,playable:!!u,stats:Object.fromEntries(fields.map(k=>[k,u?.[k]??community?.[k]??null])),cost:u?.cost??null,requirements:u?.req??null,splashMultipliers:u?{...u.splashMultipliers}:null,splashRadius:u?.splashRadius??0,criticalChances:u?.criticalChances??{},criticalMultiplier:u?.criticalMultiplier??2,statsSource:advancedShips[r.id]?'game/advanced-fleet.mjs':u?'research/截图参数校准.md':community?communityShipSource.url:'Server data unavailable',communitySource:!u&&community?communityShipSource:null,splashMultiplierSource:u?'Local splash matchups and critical hits (2026-10-19)':null,apkStats:null,apkRapid:null};});
}
