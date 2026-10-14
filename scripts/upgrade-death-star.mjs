import fs from 'node:fs';
import assert from 'node:assert/strict';
export function upgradeDeathStar(html){
 const replace=(a,b)=>{assert(html.includes(a),'Death Star anchor: '+a.slice(0,120));html=html.replace(a,()=>b);};
 const methods=fs.readFileSync(new URL('./hangar-source/death-star-flight.js',import.meta.url),'utf8');
 replace('  function configureFlight(index,reset=false){',methods+'\n  function configureFlight(index,reset=false){');
 replace('    renderShipData();syncCombatUI();updateHUD();','    renderShipData();syncCombatUI();updateHUD();if(deathActive()&&reset)deathLocate("trench",true);');
 replace('notice(\'已进入 \'+scene.name);','notice(\'已进入 \'+scene.name);deathSelection(scene.id);');
 replace('  function bindEvents(){',`  function bindEvents(){
    $('#death-controls').addEventListener('click',e=>{const name=e.target.closest('[data-death]')?.dataset.death;if(name)deathLocate(name==='reset'?'trench':name,name==='reset');});`);
 replace('  function canFire(){return ', '  function canFire(){return !(deathActive()&&(state.flight.deathOverview||state.flight.deathFailed))&&');
 replace('  function setAI(enabled){','  function setAI(enabled){if(deathActive()){notice("死星演练使用手动驾驶");return;}');
 replace('    if(globalThis.flightController)return globalThis.flightController.update(dt);','    if(globalThis.flightController)return globalThis.flightController.update(dt);if(deathActive()&&!deathTick(dt))return;');
 replace('    for(let t of p.targets){\n      if(t.hp<=0)', '    for(let t of p.targets){\n      if(t.terrainTurret)continue;\n      if(t.hp<=0)');
 replace('p.pos=V.add(p.pos,V.scale(p.velocity,dt));','p.pos=V.add(p.pos,V.scale(p.velocity,dt));if(deathActive()&&!deathAfterMove())return;');
 replace('      if(q.hostile){','      if(p.terrainProjectile){if(p.terrainProjectile(q))return false;return q.age<q.life;}\n      if(q.hostile){');
 replace('    if(t.hp<=0)return null;',`    if(t.hp<=0)return null;
    if(t.terrainTurret)return DeathStarTerrain.ellipsoidContact(a,b,t.pos,[5,5,5]);`);
 replace('      if(c.beam){','      if(c.beam&&deathActive()){deathBeam(start,V.add(start,V.scale(f,1800)),c.mainDamage/layout.main.length,c.weaponColor,c.beamWidth);continue;}\n      if(c.beam){');
 replace("      if(c.kind==='laser'){","      if(c.kind==='laser'&&deathActive()){deathBeam(start,V.add(start,V.scale(dir,c.range)),c.damage,color,t.scale*.07);continue;}\n      if(c.kind==='laser'){");
 replace('  function positionHUD(){','  function positionHUD(){if(deathActive()&&state.flight.deathOverview)return;');
 replace('  function renderContacts(){',"  function renderContacts(){$('.contacts h2 small').textContent=String(state.flight.targets.length).padStart(2,'0');");
 replace('else if(activePointer.button===2){',"else if(deathActive()&&state.flight.deathOverview){state.flight.orbitYaw+=dx*.005;state.flight.orbitPitch=clamp(state.flight.orbitPitch+dy*.004,-2.5,2.5);}else if(activePointer.button===2){");
 replace("if(state.mode==='archive')state.orbit.targetDistance=", "if(deathActive()&&state.flight.deathOverview)state.flight.cameraZoom=clamp(state.flight.cameraZoom+e.deltaY*.001,.5,2.5);else if(state.mode==='archive')state.orbit.targetDistance=");
 replace("(V.length(V.sub(t.pos,p.pos))*.008).toFixed(1)+' km'","(deathActive()?Math.round(V.length(V.sub(t.pos,p.pos)))+' 单位':(V.length(V.sub(t.pos,p.pos))*.008).toFixed(1)+' km')");
 replace("(distance*.008).toFixed(1)+' km'","(deathActive()?Math.round(distance)+' 单位':(distance*.008).toFixed(1)+' km')");
 replace("$('#speed-value').textContent=Math.round(p.speed);","$('#speed-value').textContent=deathActive()?Math.round(p.speed*.125):Math.round(p.speed);$('.speed-readout>span').textContent=deathActive()?'单位/s':'m/s';");
 replace("const initial=Math.max(0,SHIPS.findIndex(s=>s.id===new URLSearchParams(location.search).get('ship')))","const initial=deathActive()?SHIPS.findIndex(s=>s.id==='Light_Fighter'):Math.max(0,SHIPS.findIndex(s=>s.id===new URLSearchParams(location.search).get('ship')))");
 replace('profiles:COMBAT};','profiles:COMBAT,selectScene,deathLocate,deathFail,deathActive};');
 replace("screenVisible('flight');document.documentElement.dataset.ready", "screenVisible('flight');if(deathActive()){deathSelection('death-star');}document.documentElement.dataset.ready");
 // Terrain is part of the existing renderer and shares its WebGL context.
 replace('    environment(s,time){',`    environment(s,time){
      if(!globalThis.flightController&&s.sceneIndex===4){this.drawSpaceSky(.75);this.deathTerrain??=new DeathStarTerrain.TerrainRenderer(this.gl);this.deathTerrain.draw(this,s.flight.targets,time);return;}`);
 replace('    flight(s,time){',`    deathOverview(s,time){
      this.begin(time);const p=s.flight,r=V.length(p.pos)*p.cameraZoom,lat=clamp(Math.atan2(p.pos[2],Math.hypot(p.pos[0],p.pos[1]))+p.orbitPitch,-1.45,1.45),lon=Math.atan2(p.pos[0],p.pos[1])+p.orbitYaw;this.eye=DeathStarTerrain.surfacePoint(lon,lat,r);this.cameraForward=V.norm(V.scale(this.eye,-1));this.cameraUp=[0,0,1];this.fov=55*Math.PI/180;this.projectionOffset=0;this.deathRelativeVP=null;
      this.vp=M.mul(M.perspective(this.fov,this.width/this.height,2,100000),M.lookAt(this.eye,[0,0,0],this.cameraUp));this.environment(s,time);
    }
    flight(s,time){
      this.deathRelativeVP=null;if(!globalThis.flightController&&s.sceneIndex===4&&s.flight.deathOverview)return this.deathOverview(s,time);`);
 replace('gl.viewport(0,0,this.canvas.width,this.canvas.height);','gl.depthRange(0,1);gl.viewport(0,0,this.canvas.width,this.canvas.height);');
 replace('this.vp=M.mul(projection,M.lookAt(eye,V.add(eye,dir),up));','this.vp=M.mul(projection,M.lookAt(eye,V.add(eye,dir),up));if(!globalThis.flightController&&s.sceneIndex===4)this.deathRelativeVP=M.mul(projection,M.lookAt([0,0,0],dir,up));');
 replace('new Float32Array(M.mul(this.vp,M.translate(...this.eye)))','this.deathRelativeVP||new Float32Array(M.mul(this.vp,M.translate(...this.eye)))');
 replace('this.drawFlat({buffer:this.dynamic,count:data.length/7},M.mul(this.vp,M.translate(...this.eye)),points,alpha)', 'this.drawFlat({buffer:this.dynamic,count:data.length/7},this.deathRelativeVP||M.mul(this.vp,M.translate(...this.eye)),points,alpha)');
 replace('else for(let t of p.targets){if(t.hp>0)', 'else for(let t of p.targets){if(t.hp>0&&!t.terrainTurret)');
 replace('<div class="scene-controls">',`<div id="death-controls" hidden><div class="death-heading">死星 / 壕沟演练</div><div class="death-locations"><button data-death="overview">整体观察</button><button data-death="surface">表面飞行</button><button data-death="trench">壕沟入口</button><button data-death="dish">主炮近景</button><button data-death="reset">重置演练</button></div><p id="death-status"></p></div><div class="scene-controls">`);
 replace('</style>',`\n#death-controls{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:25;background:#09121be8;border:1px solid #64727f66;padding:12px 18px;color:#d9e4ec;max-width:94vw;width:max-content;font:12px system-ui}#death-controls[hidden]{display:none}.death-heading{letter-spacing:.18em;color:#abb9c5;margin-bottom:9px}.death-locations{display:flex;gap:7px;flex-wrap:wrap}#death-controls button{background:#182631;color:#d9e4ec;border:1px solid #526675;padding:7px 10px;cursor:pointer;font:inherit}#death-controls button:hover{background:#354654}#death-status{margin:9px 0 0;color:#a6b8c6}body.death-scene .flight-session,body.death-scene .combat-selector,body.death-scene .flight-input-hint{display:none}body.death-overview .bridge-hud,body.death-overview .contacts,body.death-overview .director,body.death-overview #bore-sight,body.death-overview .target-marker,body.death-overview .vessel-condition{visibility:hidden}@media(max-width:650px){#death-controls{bottom:8px;padding:8px;width:94vw}.death-locations{gap:4px}#death-controls button{padding:6px}.death-heading{margin-bottom:6px}}\n</style>`);
 replace('</style>','body.death-overview #flight>*:not(#death-controls):not(.scene-controls):not(.flight-header):not(#flight-notice){visibility:hidden}body.death-overview #death-controls,body.death-overview .scene-controls{visibility:visible}body.death-scene .contact-summary{display:none}\n</style>');
 return html;
}
