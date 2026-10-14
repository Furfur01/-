import fs from 'node:fs';
import assert from 'node:assert/strict';
// Shared flight runtime extension points. Practice has no controller and keeps its local simulation.
// Only the independent battlefield loader installs a controller factory.
export function upgradeLiveBattle(html){
 const impactMethods=fs.readFileSync(new URL('./hangar-source/weapon-impact-renderer.js',import.meta.url),'utf8');
 const replace=(a,b)=>{assert(html.includes(a),'Native battle integration anchor: '+a.slice(0,80));html=html.replace(a,()=>b);};
 replace('  function updateFlight(dt){',"  function updateFlight(dt){\n    if(globalThis.flightController)return globalThis.flightController.update(dt);");
 replace('    flight(s,time){','    flight(s,time){\n      if(globalThis.flightController?.overview)return globalThis.flightController.drawOverview(this,s,time);');
 replace('  function positionHUD(){','  function positionHUD(){\n    if(globalThis.flightController?.overview)return;');
 for(const [name,kind]of [['fireMain','primary'],['fireMissile','missile'],['fireTurrets','primary']])replace(`  function ${name}(){`,`  function ${name}(){\n    if(globalThis.flightController)return globalThis.flightController.fire('${kind}');`);
 replace('  function damageTarget(target,amount,point){','  function damageTarget(target,amount,point){\n    if(globalThis.flightController)return;');
 replace('    target.hp=Math.max(0,target.hp-amount);',`    if(target.hp>0&&amount>0)renderer.weaponImpact(state.flight,point||target.pos,{visual:state.flight.profile.visual,color:[1,.4,.06],shield:target.shield>0});
    target.hp=Math.max(0,target.hp-amount);`);
 replace('if(target.hp<=0){target.respawn=9;',`if(target.hp<=0){renderer.weaponImpact(state.flight,target.pos,{visual:{blastRadius:LAYOUTS[target.kind].length*.4,elite:LAYOUTS[target.kind].length>=50},destroy:true});target.respawn=9;`);
 replace('for(const {start,dir:f} of rays){burst(start,', 'for(const {start,dir:f} of rays){renderer.weaponImpact(p,start,{visual:c.visual,color:c.weaponColor,muzzle:true});burst(start,');
 replace('damageTarget(t,q.damage,q.previous.map((v,i)=>v+(q.pos[i]-v)*k));','q.pos=q.previous.map((v,i)=>v+(q.pos[i]-v)*k);damageTarget(t,q.damage,q.pos);');
 replace('    drawBeam(a,b,width,color,opacity=1){',`    drawBeam(a,b,width,color,opacity=1){
      if(width>=.4){const mid=V.scale(V.add(a,b),.5),pixel=V.length(V.sub(mid,this.eye))*2*Math.tan(this.fov/2)/this.height;width=Math.max(width,pixel*(width>=2?3.5:1.5));}`);

 replace('  function setTurretMode(mode){',"  function setTurretMode(mode){if(globalThis.flightController){notice('正式战场的自动炮塔与近防持续工作');return;}");
 replace('  function setAI(enabled){','  function setAI(enabled){if(globalThis.flightController){void globalThis.flightController.setAI(enabled);return;}');
 replace('  function switchCombatHull(index){','  function switchCombatHull(index){\n    if(globalThis.flightController){void globalThis.flightController.chooseType(SHIPS[index]?.id);return;}');
 replace("    if(to==='archive'){location.assign", "    if(to==='archive'&&globalThis.flightController){globalThis.flightController.leave();return;}\n    if(to==='archive'){location.assign");
 const line=html.match(/      for\(let t of p\.targets\)\{if\(t\.hp>0\)\{const model=.*?\}\}/)?.[0];assert(line,'native target render loop');
 replace(line,'      if(globalThis.flightController)globalThis.flightController.drawFleet(this);else '+line.trim());
 replace("if(state.mode==='flight')updateHUD()","if(state.mode==='flight'){updateHUD();globalThis.flightController?.syncHUD();}");
 replace('      this.environment(s,time);','      if(globalThis.flightController)globalThis.flightController.presentation.environment(this,time);else this.environment(s,time);');
 // Extract the original practice rendering once; battlefield observation uses these same methods.
 const exhaustStart=html.indexOf('      if(ownOpacity>.05&&blend>.04){');
 const effectsStart=html.indexOf('      for(let b of p.beams',exhaustStart);
 const effectsEnd=html.indexOf('      this.drawSpecial(p,time);',effectsStart)+'      this.drawSpecial(p,time);'.length;
 assert(exhaustStart>=0&&effectsStart>exhaustStart&&effectsEnd>effectsStart,'shared practice effects anchors');
 const exhaustBlock=html.slice(exhaustStart,effectsStart),effectsBlock=html.slice(effectsStart,effectsEnd);
 const exhaustBody=exhaustBlock.slice(exhaustBlock.indexOf('\n')+1,exhaustBlock.lastIndexOf('      }')).replaceAll('p.throttle','throttle').replaceAll('p.boostActive','boost');
 replace(exhaustBlock,'      if(ownOpacity>.05&&blend>.04)this.drawExhaust(s.shipIndex,own,p.throttle,p.boostActive,time,ownOpacity);\n');
 replace(effectsBlock,'      this.drawCombatEffects(p,time,own);if(globalThis.flightController&&!globalThis.flightController.fullDetail)globalThis.flightController.presentation.draw(this,globalThis.flightController,false);');
 replace('    flight(s,time){',`    drawExhaust(index,own,throttle,boost,time,ownOpacity=1){const gl=this.gl,layout=LAYOUTS[index];\n${exhaustBody}    }\n    ${impactMethods}    drawCombatEffects(p,time,own=this.ownModel){const gl=this.gl,layout=LAYOUTS[window.GalacticDemo.state.shipIndex];\n${effectsBlock}\n      this.drawWeaponImpacts(p);\n    }\n    flight(s,time){`);
 replace('      for(let b of p.beams||[]){this.drawBeam(b.start,b.end,b.width,b.color,Math.max(0,1-b.age/b.life));}', '      // Weapon beams join the shared impact batch for soft cores and halos.');
 // The original renderer, cockpit, cameras, plume shaders and weapon effects remain in use.
 replace('  window.GalacticDemo={state,renderer,renderShipData,', '  window.GalacticDemo={state,renderer,renderShipData,');
 const end='profiles:COMBAT};';replace(end,end+`\n  if(window.createFlightController){const live=window.createFlightController({state,renderer,SHIPS,COMBAT,LAYOUTS,keys,$,M,V,clamp,mix,shortAngle,notice,configureFlight,setView,selectedTarget,renderContacts,shipMatrix,tone,burst,updateCamera,forward,getMouseDown:()=>mouseDown});globalThis.flightController=live;live.start().catch(e=>live.fail(e));}`);
 replace('</style>',`\nbody.real-battle .ambient{background:radial-gradient(ellipse at 70% 32%,#201622 0%,#0a1422 35%,#020611 80%)!important}body.real-battle .vignette{opacity:.35}body.real-battle .grain{opacity:.015}body.real-battle .combat-selector{display:none!important}body.real-battle .scene-controls,body.real-battle .contact-summary,body.real-battle .flight-session{display:none}body.real-battle #formation-labels{position:fixed;inset:0;pointer-events:none;z-index:15}#formation-labels button{position:absolute;pointer-events:auto;background:#07121bdc;border:1px solid #43606c;border-radius:3px;padding:5px 8px;font:11px system-ui;cursor:pointer}body.battle-overview #flight>*:not(#flight-notice){visibility:hidden}body.battle-overview #native-battle-bar,body.battle-overview #formation-labels{visibility:visible}#native-battle-bar{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:30;display:flex;gap:7px;align-items:center;padding:8px 12px;background:#07121be8;border:1px solid #48606c;border-radius:5px;font:12px system-ui;color:#cce6ef;max-width:85vw;flex-wrap:wrap}#native-battle-bar button,#native-battle-bar select{background:#172936;color:#d5e8ee;border:1px solid #45616e;padding:6px;border-radius:3px;font:inherit}#native-battle-bar select{max-width:210px}body.real-battle .combat-identity{top:80px}body.real-battle .contacts{max-height:40vh;overflow:auto}body.real-battle .turret-controls{display:none}body.real-battle .combat-selector+div{pointer-events:auto}body.battle-overview .bridge-hud,body.battle-overview #bore-sight,body.battle-overview #director,body.battle-overview .flight-input-hint{opacity:0;pointer-events:none}\n</style>`);
 return html;
}
