import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {units,tech,publicCatalog} from '../game/catalog.mjs';
import {shipCounterProposal} from '../game/ship-counter-proposal.mjs';
import {spinalMounts,shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';

const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/galactic-command');
let html=fs.readFileSync(path.join(root,'scripts/hangar-source/galactic_fighter_v3.html'),'utf8').replace(/\r/g,'');
const replace=(a,b)=>{assert(html.includes(a),'Missing hangar anchor: '+a.slice(0,50));html=html.replace(a,()=>b);};
replace('  function cylinderY(',fs.readFileSync(path.join(root,'scripts/hangar-source/new-models.js'),'utf8')+'\n  function cylinderY(');
replace('buildShip(1),buildShip(2)','buildNewReferenceShip(1),buildNewReferenceShip(2)');
replace('fighter:index===3||index===0||index===4','fighter:true');
const a=html.indexOf('  const LAYOUTS = ['),b=html.indexOf('\n  ];',a)+5;
const context=vm.createContext({});vm.runInContext(html.slice(a,b)+'\nglobalThis.layouts=LAYOUTS;',context);
const updates=JSON.parse(fs.readFileSync(path.join(root,'scripts/hangar-source/new-layouts.json'),'utf8'));
for(const index of[1,2])context.layouts[index]=updates[index];
html=html.slice(0,a)+'  const LAYOUTS = '+JSON.stringify(context.layouts,null,2)+';'+html.slice(b);
replace("mode:'archive',shipIndex:0","mode:'archive',shipIndex:1");replace("configureFlight(0,true);screenVisible('archive')","configureFlight(1,true);screenVisible('archive')");
html=html.replaceAll('[37,28.3,20.2,23,39]','[37,35,33,23,39]');
replace('distance:37,targetYaw:.82,targetPitch:.5,targetDistance:37','distance:35,targetYaw:.82,targetPitch:.5,targetDistance:35');
replace('  function resetCamera(){',"  function resetCamera(){$$('[data-inspect]').forEach(b=>b.classList.toggle('active',b.dataset.inspect==='hero'));");
replace('if(s.shipIndex===3||s.shipIndex===0||s.shipIndex===4)proj[9]=-.13;','proj[9]=-.13;');
replace('  function frame(now){','  function frame(now){\n    if(window.commandSceneActive){lastTime=now;requestAnimationFrame(frame);return;}');
replace('  window.GalacticDemo={state,renderer,ships:SHIPS,','  window.GalacticDemo={state,renderer,renderShipData,ships:SHIPS,');
const shipIds=['Destroyer','Cruiser','Battleship','Heavy_Fighter','Dreadnought'];
replace('  const shortAngle =',`  COMBAT.forEach((c,i)=>{c.spinal=${JSON.stringify(shipIds.map(id=>!!spinalMounts[id]))}[i];c.fixedPrimary=${JSON.stringify(shipIds.map(id=>!!shipWeaponLayouts[id]?.muzzles.length&&shipWeaponLayouts[id]?.kind!=='shell'&&shipWeaponLayouts[id]?.kind!=='ion'))}[i];c.primaryName=${JSON.stringify(shipIds.map(id=>shipWeaponLayouts[id]?.primary||'炮塔齐射'))}[i];c.role=${JSON.stringify(shipIds.map(id=>units[id].name))}[i];});
  COMBAT[2].capital=true;COMBAT[2].turretDamage=.42;
  const shortAngle =`);
replace("if(p.profile.capital){p.charging=true;p.charge=0;tone('charge');}","if(p.profile.capital&&!p.profile.fixedPrimary){fireTurrets();return true;}\n    if(p.profile.fixedPrimary){p.charging=true;p.charge=0;tone('charge');}");
replace('    p.charging=false;p.charge=0;p.gunCooldown=c.mainCooldown;p.mainShots++;',"    if(c.capital&&!c.fixedPrimary){p.charging=false;p.charge=0;fireTurrets();return;}\n    p.charging=false;p.charge=0;p.gunCooldown=c.mainCooldown;p.mainShots++;");
replace("c.capital?'同轴主炮':", "c.capital?c.primaryName:");
replace("c.capital?'右键拖动转向　W / S 油门　Space 同轴主炮　R 导弹齐射'", "c.capital?'右键拖动转向　W / S 油门　Space '+c.primaryName+'　R 导弹齐射'");
replace("$('#weapon-missile-name').textContent=c.capital?'导弹阵列':'追踪导弹';", "$('#weapon-missile-name').textContent=c.capital?'导弹阵列':'追踪导弹';$('#fire-spinal > span:nth-child(2)').innerHTML=c.fixedPrimary?c.primaryName+'<small>前置固定炮口</small>':'炮塔齐射<small>依照各炮座射界</small>';");
replace("notice(hit.size?'同轴主炮命中':'同轴主炮已发射 · 沿舰艏轴线');","notice(c.primaryName+(hit.size?'命中':'已发射'));");
replace('<span>同轴主炮<small>固定舰艏轴线</small></span>','<span>炮塔齐射<small>依照各炮座射界</small></span>');
replace('<dt>同轴主炮 / 战斗机机炮</dt>','<dt>炮塔齐射 / 战斗机机炮</dt>');
replace('大型舰船主炮沿舰艏轴线发射，按 X 可持续对准选定目标。','无畏舰使用前置双激光炮，驱逐舰使用双等离子大炮，战列舰不配同轴大炮。按 X 可持续对准选定目标。');
const archiveData=shipIds.map(id=>{const u=units[id];return {name:u.name,count:0,stats:[u.strength,u.shield,u.attack,u.speed,u.cargo,u.fuel],levels:u.weapons.map(()=>0),weapons:u.weapons.map(w=>[w.name,tech[w.technology]?.name||w.technology||'无科技要求',w.kind.toUpperCase(),w.technology?0:null])};});
replace('  const STAT_LABELS=',`  ${JSON.stringify(archiveData)}.forEach((data,i)=>Object.assign(SHIPS[i],data));\n  const STAT_LABELS=`);
replace("const displayWeapons=state.shipIndex===3?[['固定机炮','机炮科技','FIXED AUTOCANNON'],['追踪导弹','制导科技','HOMING MISSILES']]:WEAPONS;","const displayWeapons=ship.weapons||[];");
replace("const WEAPONS=[['同轴主炮','磁轨科技','SPINAL RAILGUN'],['导弹发射阵列','制导科技','MISSILE ARRAY'],['旋转炮塔','火控科技','TRACKING TURRETS']];","const WEAPONS=[['主炮试射','主炮演练','SPINAL DEMO'],['导弹试射','导弹演练','MISSILE DEMO'],['炮塔试射','炮塔演练','TURRET DEMO']];");
replace('displayWeapons.map(([name,tech,en],i)=>','displayWeapons.map(([name,tech,en,level],i)=>');
replace('${tech}<b>Lv.${ship.levels[i]}</b>','${tech}${level===null?\'\':\'<b>Lv.\'+level+\'</b>\'}');
replace('<span>进入驾驶舱</span>','<span>进入试射驾驶舱</span>');
replace('<p>母星防线 · 虚拟接管</p>','<p>武器试射 · 主炮 / 导弹 / 炮塔演练</p>');
replace('<p class="help-note">','<p class="help-note">驾驶舱提供主炮、导弹与炮塔的通用试射方式。实际舰载武器与科技等级以舰船档案为准，演练不消耗舰船或资源。');
replace('</style>',`\n.brand,.session,.archive-footer nav,.archive-footer .footer-help{display:none}.archive-footer{border:0;justify-content:flex-end;bottom:2vh}.ship-sidebar{top:5vh}.ship-title{top:3vh}.model-meta{top:14vh}.model-controls{bottom:15vh}.model-hint{bottom:8vh}.small-screen-hint{display:none}\n</style>`);
const extra=`
(() => {
  const ids=['Destroyer','Cruiser','Battleship','Heavy_Fighter','Dreadnought'];
  const labels=['DESTROYER','CRUISER','BATTLESHIP','HEAVY FIGHTER','DREADNOUGHT'];
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==parent)return;
    const d=e.data,g=window.GalacticDemo;if(!g)return;
    if(d.type==='empire-visibility')window.commandSceneActive=!d.active;
    if(d.type==='empire-select'&&Number.isInteger(d.index)&&d.index>=0&&d.index<5)g.selectShip(d.index);
    if(d.type!=='empire-state'||!d.planet||!d.catalog)return;
    ids.forEach((id,i)=>{const u=d.catalog.units[id];if(!u)return;const weapons=(u.weapons||[]).map(w=>[w.name,d.catalog.tech[w.technology]?.name||w.technology||'无科技要求',String(w.kind).toUpperCase(),w.technology?(d.player.tech[w.technology]||0):null]);Object.assign(g.ships[i],{name:u.name,en:labels[i],count:d.planet.ships[id]||0,stats:[u.strength,u.shield,u.attack,u.speed,u.cargo,u.fuel],weapons,levels:weapons.map(w=>w[3]||0)});g.profiles[i].role=u.name;g.profiles[i].className=labels[i]+' / '+g.ships[i].code;});
    g.renderShipData();document.getElementById('station-location').textContent=d.planet.name+' ['+d.planet.position.join(':')+']';
  });
  document.getElementById('main-nav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;e.stopImmediatePropagation();parent.postMessage({type:'empire-navigate',page:b.dataset.tab},location.origin);},true);
  parent.postMessage({type:'empire-hangar-ready'},location.origin);
})();`;
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
new vm.Script(scripts[1][1]+'\n'+extra);
assert(!/磁轨科技|制导科技|火控科技|机炮科技/.test(scripts[1][1]));
assert.deepEqual(archiveData[1].weapons,[[units.Cruiser.weapons[0].name,tech.Ion_Tech.name,'ION',0]]);
assert.equal(scripts.length,2);fs.writeFileSync(path.join(dir,'ship-renderer.js'),scripts[0][1]);fs.writeFileSync(path.join(dir,'hangar.js'),scripts[1][1]+'\n'+extra);
html=html.replace(scripts[0][0],'<script src="ship-renderer.js"></script>').replace(scripts[1][0],'<script src="hangar.js"></script>');
fs.writeFileSync(path.join(dir,'hangar.html'),html);
await build({entryPoints:[path.join(dir,'planet.js')],bundle:true,format:'iife',minify:true,outfile:path.join(dir,'planet.bundle.js')});
await build({entryPoints:[path.join(dir,'buildings-viewer.js')],bundle:true,format:'iife',minify:true,outfile:path.join(dir,'buildings.bundle.js')});
await build({entryPoints:[path.join(dir,'ships-viewer.js')],bundle:true,format:'iife',minify:true,outfile:path.join(dir,'ships.bundle.js')});
fs.writeFileSync(path.join(dir,'ships-data.json'),JSON.stringify({ships:publicCatalog.shipArchive,units,tech,proposal:shipCounterProposal(units,publicCatalog.shipArchive)},null,2));
fs.mkdirSync(path.join(dir,'assets/ship-references'),{recursive:true});
for(const ship of publicCatalog.shipArchive)if(ship.reference)fs.copyFileSync(path.join(root,'models/reference/original-atlas-v1',ship.reference),path.join(dir,'assets/ship-references',path.basename(ship.reference)));
// New deliverables join the existing OpenDesign index without removing older work.
const catalog=[];for(const [id,label]of[['mockups','Mockups'],['design-systems','Design Systems']]){
  const base=path.join(root,'opendesign',id),groups=[];
  if(fs.existsSync(base))for(const sub of fs.readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory())){
    const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);
    const files=walk(path.join(base,sub.name)).filter(p=>id!=='mockups'||p.endsWith('.html')).map(p=>({label:path.basename(p),path:path.relative(path.join(root,'opendesign'),p).replaceAll('\\','/')}));if(files.length)groups.push({slug:sub.name,files});
  }
  catalog.push({id,label,groups});
}
fs.writeFileSync(path.join(root,'opendesign/manifest.json'),JSON.stringify({generated:new Date().toISOString(),sections:catalog},null,2));
console.log('Galactic Command built: /opendesign/mockups/galactic-command/');
