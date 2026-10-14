import assert from 'node:assert/strict';
import {flightScenes,nearestHullPoint,addShieldHit,targetShieldCapacity} from '../game/flight-scenes.mjs';
import {sceneShader,sceneFragment} from './flight-scene-shaders.mjs';


export function upgradeFlightScenes(html){
  const replace=(a,b)=>{assert(html.includes(a),'Scene anchor: '+a.slice(0,90));html=html.replace(a,()=>b);};
  replace('uniform mat4 uModel; uniform mat4 uVP;', 'uniform mat4 uModel; uniform mat4 uVP; uniform float uShellOffset;');
  replace('uModel*vec4(aPosition,1.)','uModel*vec4(aPosition+aNormal*uShellOffset,1.)');
  replace('uniform float uFighter;','uniform float uFighter; uniform vec4 uImpact; uniform vec2 uShield;\n'+sceneShader);
  replace('if(uMode>3.5){','if(uMode>3.5&&uMode<4.5){');
  replace('      gl_FragColor=vec4(color*uExposure,alpha);',sceneFragment+'\n      gl_FragColor=vec4(color*uExposure,alpha);');
  replace("'uTint','uFighter']", "'uTint','uFighter','uShellOffset','uImpact','uShield']");
  replace('gl.uniform1f(u.uFighter,opts.fighter?1:0);','gl.uniform1f(u.uFighter,opts.fighter?1:0);gl.uniform1f(u.uShellOffset,opts.shellOffset||0);gl.uniform4fv(u.uImpact,opts.impact||[0,0,0,0]);gl.uniform2fv(u.uShield,opts.shield||[1,0]);');
  replace('  class Renderer {', nearestHullPoint.toString()+'\n'+addShieldHit.toString()+'\n  class Renderer {');
  replace('      this.grid=this.makeGrid();',`      this.rockMesh=this.makeRock().upload(gl);this.rocks=[];const rockRandom=seeded(8972);
      for(let i=0;i<90;i++){const a=rockRandom()*Math.PI*2,r=550+rockRandom()*3400,size=12+Math.pow(rockRandom(),2)*115;this.rocks.push({pos:[Math.cos(a)*r,(rockRandom()-.5)*700,Math.sin(a)*r],size,rot:[rockRandom()*6,rockRandom()*6,rockRandom()*6]});}
      this.grid=this.makeGrid();`);
  replace('this.drawFlat(this.grid,this.vp,false,.7*zoom);', 'this.cameraForward=V.norm(V.sub([0,centerY,0],eye));this.cameraUp=[0,1,0];this.fov=35*Math.PI/180;this.projectionShiftX=offset;this.projectionOffset=-.13;this.drawSpaceSky(.6);this.drawFlat(this.grid,this.vp,false,.7*zoom);');
  replace('this.projectionOffset=-.06;', 'this.projectionOffset=-.06;this.projectionShiftX=0;');
  replace('    makeGrid(){',`    makeRock(){
      const g=new Geometry().sphere(1,12,8);
      for(let i=0;i<g.data.length;i+=13){const p=g.data.slice(i,i+3),r=.83+.13*Math.sin(p[0]*8+p[1]*5)+.12*Math.cos(p[2]*9-p[0]*3);for(let j=0;j<3;j++)g.data[i+j]*=r;g.data[i+6]=.27+r*.08;g.data[i+7]=.25+r*.07;g.data[i+8]=.23+r*.06;}
      for(let i=0;i<g.data.length;i+=39){const a=g.data.slice(i,i+3),b=g.data.slice(i+13,i+16),c=g.data.slice(i+26,i+29),n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));for(let k=0;k<3;k++)for(let j=0;j<3;j++)g.data[i+k*13+3+j]=n[j];}return g;
    }
    environment(s,time){
      const gl=this.gl,kind=s.sceneIndex??0;
      this.drawSpaceSky(.85);
      if(kind===1){
        const pos=[-2000,-950,-3600],rot=[.1,.42,.18];
        this.drawMesh(this.moonMesh,M.compose(pos,rot,[2100,2100,2100]),{mode:7,light:[.6,.3,1]});
        gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        this.drawMesh(this.moonMesh,M.compose(pos,rot,[2132,2132,2132]),{mode:8});
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
        this.drawMesh(this.moonMesh,M.compose([1600,750,-5100],[0,.3,0],[230,230,230]),{mode:1,texture:this.moonTexture,light:[.6,.3,1]});
      }
      if(kind===3){
        for(const r of this.rocks){const pos=r.pos.map((v,i)=>v+Math.round((s.flight.pos[i]-v)/8000)*8000);this.drawMesh(this.rockMesh,M.compose(pos,[r.rot[0],r.rot[1]+time*.006,r.rot[2]],[r.size,r.size*.72,r.size*1.2]),{light:[.8,.25,.5]});}
        this.drawMesh(this.moonMesh,M.compose([3100,-1400,-6300],[0,.8,0],[1050,1050,1050]),{mode:1,texture:this.moonTexture,light:[.8,.25,.5]});
      }
    }
    drawSpaceSky(exposure=1){
      SpaceSky.create(this.gl).draw({forward:this.cameraForward,up:this.cameraUp,fov:this.fov,shift:[this.projectionShiftX||0,this.projectionOffset||0],exposure});
    }
    shieldImpact(vessel,index,model,point,amount,charge){
      if(!(charge>0)||!(amount>0))return;
      const delta=V.sub(point,[model[12],model[13],model[14]]),local=[0,1,2].map(i=>{const axis=[model[i*4],model[i*4+1],model[i*4+2]];return V.dot(delta,axis)/V.dot(axis,axis);});
      const surface=nearestHullPoint(window.FlightFleet.vertices,window.FlightFleet.ships[index],local);
      vessel.shieldHits??=[];addShieldHit(vessel.shieldHits,surface,this.time,amount,charge);
    }
    drawShield(vessel,index,model,opacity=1){
      vessel.shieldHits=(vessel.shieldHits||[]).filter(h=>this.time-h.time<.48);
      if(!vessel.shieldHits.length||opacity<.01)return;
      const gl=this.gl;gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
      for(const h of vessel.shieldHits)this.drawMesh(this.shipMeshes[index],model,{mode:5,tint:h.weak?[1,.42,.12]:[.08,.62,1],opacity,shellOffset:LAYOUTS[index].length*.002,impact:[...h.point,this.time-h.time],shield:[LAYOUTS[index].length,h.power]});
      gl.disable(gl.CULL_FACE);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }
    makeGrid(){`);
  const background="      gl.depthMask(false);this.drawFlat(this.stars,M.mul(this.vp,M.translate(...eye)),true,.9);gl.depthMask(true);";
  const from=html.indexOf(background),to=html.indexOf('      for(let t of p.targets)',from);assert(from>=0&&to>from);
  html=html.slice(0,from)+'      this.environment(s,time);\n'+html.slice(to);
  replace('for(let t of p.targets){if(t.hp>0)this.drawVessel(t.kind,M.compose(t.pos,[.035,t.heading||.2,-.045],[t.scale,t.scale,t.scale]),{light:[-.3,.65,1],exposure:.85})}', 'for(let t of p.targets){if(t.hp>0){const model=M.compose(t.pos,[.035,t.heading||.2,-.045],[t.scale,t.scale,t.scale]);this.drawVessel(t.kind,model,{light:[-.3,.65,1],exposure:.85});this.drawShield(t,t.kind,model);}}');
  replace('      // All exhaust starts', '      this.drawShield(p,s.shipIndex,own,ownOpacity);\n      // All exhaust starts');
  replace('missileLock:null,missileLockTime:0,','shieldHits:[],shieldRegenDelay:0,missileLock:null,missileLockTime:0,');
  replace('          p.shield=Math.max(0,p.shield-2.5);', '          if(p.shieldHits)renderer?.shieldImpact(p,state.shipIndex,model,q.pos,2.5,p.shield);\n          p.shieldRegenDelay=4;p.shield=Math.max(0,p.shield-2.5);');
  replace('  function damageTarget(target,amount){','  function damageTarget(target,amount,point){');
  replace('    target.hp=Math.max(0,target.hp-amount);',`    if(renderer&&point&&target.shield>0)renderer.shieldImpact(target,target.kind,M.compose(target.pos,[.035,target.heading||.2,-.045],[target.scale,target.scale,target.scale]),point,amount,100*target.shield/target.maxShield);
    target.shield=Math.max(0,(target.shield||0)-amount);
    target.hp=Math.max(0,target.hp-amount);`);
  replace('  function createTargets(){',targetShieldCapacity.toString()+'\n  function createTargets(){');
  replace('    ];p.targetIndex=0;', '    ];for(const t of p.targets){t.maxShield=targetShieldCapacity(SHIPS[t.kind].stats);t.shield=t.maxShield;t.shieldHits=[];}p.targetIndex=0;');
  replace('t.hp=100;}}','t.hp=100;t.shield=t.maxShield;t.shieldHits=[];}}');
  replace('p.shield=100;p.hull=100;', 'p.shield=SHIPS[index].stats[1]>0?100:0;p.hull=100;');
  replace('if(p.enemyAttack>2)p.shield=', 'p.shieldRegenDelay=Math.max(0,(p.shieldRegenDelay||0)-dt);if(p.enemyAttack>2&&p.shieldRegenDelay===0&&SHIPS[state.shipIndex].stats[1]>0)p.shield=');
  replace("Math.round(p.shield)+'%'", "(p.shield>0&&p.shield<1?'<1':Math.round(p.shield))+'%'");
  replace('damageTarget(t,q.damage);','damageTarget(t,q.damage,q.previous.map((v,i)=>v+(q.pos[i]-v)*k));');
  replace('damageTarget(target,c.mainDamage/layout.main.length);','damageTarget(target,c.mainDamage/layout.main.length,end);');
  replace('damageTarget(hit,c.damage);','damageTarget(hit,c.damage,end);');
  replace('<span id="flight-nav-label">母星近地轨道</span>', '<span id="flight-nav-label">吸积盘外缘</span>');
  replace('<div class="flight-session flight-reveal">',`<div class="scene-controls"><label for="scene-select">星域</label><select id="scene-select">${flightScenes.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select><button id="shield-test" type="button">护盾试射</button></div><div class="flight-session flight-reveal">`);
  replace('</style>',`\n.contacts,.director,.vessel-condition{background:#06101999;box-shadow:0 0 18px 12px #06101999}.scene-controls{position:absolute;right:var(--pad);top:7.8vh;display:flex;align-items:center;gap:9px;font-size:11px;z-index:12;color:#b6c6ca}.scene-controls select,.scene-controls button{background:#0b171ee8;border:1px solid #76909c77;color:#d7e2df;padding:7px 10px;font:inherit;border-radius:2px}.scene-controls select:focus-visible,.scene-controls button:focus-visible{outline:2px solid #b8e9f4;outline-offset:3px}@media(max-width:850px){.scene-controls{top:19vh}.flight-session{display:none}}\n</style>`);
  replace('  function bindEvents(){',`  const FLIGHT_SCENES=${JSON.stringify(flightScenes)};
  function selectScene(id){
    const index=FLIGHT_SCENES.findIndex(s=>s.id===id);state.sceneIndex=index<0?0:index;
    const scene=FLIGHT_SCENES[state.sceneIndex];$('#scene-select').value=scene.id;$('#flight-nav-label').textContent=scene.subtitle;
    const url=new URL(location.href);url.searchParams.set('map',scene.id);history.replaceState(null,'',url);notice('已进入 '+scene.name);
  }
  function testShield(){
    if(state.mode!=='flight'||state.transition)return;
    const p=state.flight,a=axes(p),length=LAYOUTS[state.shipIndex].length,start=V.add(p.pos,V.add(V.scale(a.right,length*1.6+15),V.scale(a.up,length*.12)));
    p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(V.norm(V.sub(p.pos,start)),230),age:0,life:8,hostile:true,missile:true,target:p,trail:[[...start]],trailClock:0,damage:0});notice('护盾试射 · 右舷来袭');
  }
  function bindEvents(){
    selectScene(new URLSearchParams(location.search).get('map'));
    $('#scene-select').addEventListener('change',e=>selectScene(e.target.value));$('#shield-test').addEventListener('click',testShield);`);
  replace("window.addEventListener('keydown',e=>{", "window.addEventListener('keydown',e=>{if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;");
  return html;
}
