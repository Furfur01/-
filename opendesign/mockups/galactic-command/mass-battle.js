/* Standalone fleet exercise. Catalog values and FleetSim's 0.25 s damage clock;
   saved reports retain their recorded outcomes instead of being re-simulated. */
(function (scope) {
  'use strict';
  const STEP = .25, LIMIT = 20000, SIDES = ['attacker', 'defender'];
  const MIX = [['Light_Fighter',45],['Heavy_Fighter',20],['Cruiser',15],['Battleship',10],['Dreadnought',4],['Bomber',3],['Destroyer',3]];
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function random(seed) { let a=seed>>>0; return () => { a+=0x6D2B79F5; let t=a; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
  function roster(total, units) {
    const mix=MIX.filter(([id])=>units[id]);
    if (!mix.length) throw new Error('目录中缺少战斗舰船。');
    const weights=mix.reduce((s,p)=>s+p[1],0), result={}; let assigned=0;
    mix.forEach(([id,w],i)=> { const count=i===mix.length-1?total-assigned:Math.floor(total*w/weights); result[id]=count; assigned+=count; });
    return result;
  }
  function checkedFleet(fleet,units) {
    if (!fleet || typeof fleet!=='object' || Array.isArray(fleet)) throw new Error('舰队编组格式无效。');
    let count=0;
    for (const [id,n] of Object.entries(fleet)) {
      if (!Object.hasOwn(units,id)||units[id].missile||!Number.isSafeInteger(n)||n<0) throw new Error('舰队中有无效舰型或数量：'+id);
      for (const key of ['strength','shield','attack']) if (!Number.isFinite(units[id][key])||units[id][key]<0||(key==='strength'&&units[id][key]===0)) throw new Error('舰船数值无效：'+id);
      count+=n;
    }
    if (!Number.isSafeInteger(count)||count>LIMIT) throw new Error('单次演练上限为 20,000 艘。');
    return count;
  }
  function tier(id,stats) {
    if (id==='Light_Fighter'||id==='Probe') return 0;
    if (id==='Heavy_Fighter'||stats.strength<2000) return 1;
    if (stats.strength<7000) return 2;
    return 3;
  }

  class Simulation {
    constructor(catalog,options={}) {
      const supplied=catalog.units||catalog;
      this.units={...supplied};
      const report=options.report;
      if(report&&!report.initial)throw new Error('战报缺少初始舰队。');
      if (report?.unitStats) for (const [id,stats] of Object.entries(report.unitStats)) {
        if (!Object.hasOwn(supplied,id)) throw new Error('战报包含未知舰型：'+id);
        this.units[id]={...supplied[id],...stats};
      }
      const size=options.size??1000;
      if (!Number.isSafeInteger(size)||size<2||size>LIMIT) throw new Error('演练规模须为 2 至 20,000 艘。');
      this.initial=structuredClone(report?.initial||{attacker:options.attacker||roster(Math.ceil(size/2),this.units),defender:options.defender||roster(Math.floor(size/2),this.units)});
      this.initialCounts=SIDES.map(side=>checkedFleet(this.initial[side],this.units));
      this.total=this.initialCounts[0]+this.initialCounts[1];
      if (this.total<1||this.total>LIMIT) throw new Error('双方总数须为 1 至 20,000 艘。');
      this.technology=structuredClone(report?.technology||options.technology||{});
      for (const tech of Object.values(this.technology)) {
        if (!tech||typeof tech!=='object') throw new Error('科技数据无效。');
        for (const level of Object.values(tech)) if (!Number.isFinite(level)||level<0) throw new Error('科技等级无效。');
      }
      this.seed=report?.seed??options.seed??20261010;
      if (!Number.isSafeInteger(this.seed)) throw new Error('战斗种子无效。');
      this.rng=random(this.seed); this.tick=0; this.finished=false; this.winner=null; this.shots=0;
      this.alive=[[],[]]; this.groups=Array.from({length:4},()=>[]); this.ids=[]; this.byType=[{},{}];
      this.hp=new Float32Array(this.total); this.maxHP=new Float32Array(this.total);
      this.shield=new Float32Array(this.total); this.maxShield=new Float32Array(this.total); this.attack=new Float32Array(this.total);
      this.side=new Uint8Array(this.total); this.kind=new Uint8Array(this.total); this.slot=new Int32Array(this.total);
      this.positions=new Float32Array(this.total*3); this.scales=new Float32Array(this.total);
      this.pending=Array.from({length:4},()=>[]); this.visualShots=[];
      this.gap=Math.max(24,Math.sqrt(this.total)*1.45); this.extent=50;
      let id=0;
      for (let side=0;side<2;side++) {
        const total=this.initialCounts[side],cols=Math.max(1,Math.ceil(Math.sqrt(total)*1.35)), tech=this.technology[SIDES[side]]||{};
        let ordinal=0;
        for (const [name,count] of Object.entries(this.initial[SIDES[side]])) {
          const stats=this.units[name],kind=tier(name,stats),scale=[.68,.85,1.12,1.4][kind];
          this.byType[side][name]=[];
          for (let i=0;i<count;i++,id++,ordinal++) {
            this.ids.push(name); this.side[id]=side; this.kind[id]=kind; this.slot[id]=this.alive[side].length;
            this.alive[side].push(id); this.groups[kind].push(id); this.byType[side][name].push(id);
            this.hp[id]=this.maxHP[id]=stats.strength*(1+(tech.Strength_Tech||0)*.1);
            this.shield[id]=this.maxShield[id]=stats.shield*(1+(tech.Shielding_Tech||0)*.1);
            this.attack[id]=stats.attack*(1+(tech.Weapons_Tech||0)*.1);
            if(!Number.isFinite(this.hp[id])||!Number.isFinite(this.shield[id])||!Number.isFinite(this.attack[id]))throw new Error('舰船数值超出支持范围。');
            this.scales[id]=scale;
            const x=(this.gap+Math.floor(ordinal/cols)*7.3)*(side===0?-1:1),z=(ordinal%cols-(cols-1)*.5)*6.2;
            this.positions.set([x,(kind-1.5)*3+(ordinal%3-1)*.8,z],id*3);
            this.extent=Math.max(this.extent,Math.hypot(x,z));
          }
        }
      }
      this.report=report?structuredClone(report):null; this.round=0;
      if (this.report) {
        if(this.report.rounds&&!Array.isArray(this.report.rounds))throw new Error('战报回合格式无效。');
        this.inferredTiming=this.report.duration===undefined||(this.report.rounds||[]).some(round=>round.time===undefined);
        // shortcut: old reports have rounds but no timestamps; six-second display pacing is labeled as illustrative.
        let cursor=0;
        for(const round of this.report.rounds||[]){if(round.time===undefined)round.time=cursor+6;cursor=round.time;}
        if(this.report.duration===undefined)this.report.duration=cursor||6;
        this.validateReport();
      }
    }
    validateReport() {
      const r=this.report;
      if (!Number.isFinite(r.duration)||r.duration<0||r.duration>600||!['attacker','defender','draw'].includes(r.winner)) throw new Error('战报缺少有效的时长或胜负。');
      if(r.rounds&&!Array.isArray(r.rounds))throw new Error('战报回合格式无效。');
      let previous=this.initial,time=-1;
      for (const round of r.rounds||[]) {
        if (!Number.isFinite(round.time)||round.time<time||round.time>r.duration) throw new Error('战报时间顺序无效。');
        this.validateSurvivors(round.after,previous); previous=round.after; time=round.time;
      }
      this.validateSurvivors(r.survivors,previous);
    }
    validateSurvivors(fleets,previous) {
      for (const side of SIDES) {
        checkedFleet(fleets?.[side],this.units);
        for (const [id,count] of Object.entries(fleets[side])) if (count>(previous[side][id]||0)) throw new Error('战报存活数大于初始兵力。');
      }
    }
    remove(id) {
      if (this.slot[id]<0) return;
      const side=this.side[id],slot=this.slot[id],last=this.alive[side].pop();
      if (slot<this.alive[side].length) {this.alive[side][slot]=last; this.slot[last]=slot;}
      this.slot[id]=-1; this.hp[id]=0;
    }
    applySurvivors(fleets) {
      for (let side=0;side<2;side++) for (const [name,ids] of Object.entries(this.byType[side])) {
        let remain=fleets[SIDES[side]][name]||0;
        for (const id of ids) if (this.hp[id]>0) {if (remain>0) remain--; else this.remove(id);}
      }
    }
    step() {
      if (this.finished) return;
      this.tick++; this.visualShots=[];
      if (this.report) {
        while (this.round<(this.report.rounds||[]).length&&this.report.rounds[this.round].time<=this.tick*STEP) this.applySurvivors(this.report.rounds[this.round++].after);
        if (this.tick*STEP>=this.report.duration) {this.applySurvivors(this.report.survivors);this.finished=true;this.winner=this.report.winner;return;}
        for (let side=0;side<2;side++) {
          const enemies=this.alive[1-side],fleet=this.alive[side];
          if (!enemies.length) continue;
          for (let i=this.tick%8;i<fleet.length&&this.visualShots.length<48;i+=Math.max(8,Math.ceil(fleet.length/24))) this.visualShots.push([fleet[i],enemies[Math.floor(this.rng()*enemies.length)]]);
        }
        return;
      }
      const bucket=this.pending[this.tick%4];
      for (let i=0;i<bucket.length;i+=2) {
        const target=bucket[i],damage=bucket[i+1]; if (this.hp[target]<=0) continue;
        const absorbed=Math.min(this.shield[target],damage); this.shield[target]-=absorbed;
        this.hp[target]=Math.max(0,this.hp[target]-damage+absorbed);
        if (this.hp[target]<=0) this.remove(target);
      }
      bucket.length=0;
      if (this.tick%24===0) for (const fleet of this.alive) for (const id of fleet) this.shield[id]=this.maxShield[id];
      const queue=this.pending[(this.tick+3)%4],stride=Math.max(1,Math.ceil(this.total/8/48)); let firing=0;
      for (let id=this.tick%8;id<this.total;id+=8) {
        if (this.hp[id]<=0||this.attack[id]<=0) continue;
        const enemies=this.alive[1-this.side[id]]; if (!enemies.length) continue;
        const target=enemies[Math.floor(this.rng()*enemies.length)];
        queue.push(target,this.attack[id]); this.shots++;
        if (firing++%stride===this.tick%stride&&this.visualShots.length<48) this.visualShots.push([id,target]);
      }
      if ((!this.alive[0].length||!this.alive[1].length)&&this.pending.every(q=>q.length===0)||this.tick>=480) {
        this.finished=true;
        this.winner=this.alive[0].length&&!this.alive[1].length?'attacker':this.alive[1].length&&!this.alive[0].length?'defender':'draw';
      }
    }
    survivors() {
      const fleets={attacker:{},defender:{}};
      for (let side=0;side<2;side++) for (const id of this.alive[side]) {const fleet=fleets[SIDES[side]],key=this.ids[id];fleet[key]=(fleet[key]||0)+1;}
      return fleets;
    }
  }

  function matrix(yaw,pitch,distance,aspect) {
    const eye=[Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance];
    const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const z=norm(eye),x=norm(cross([0,1,0],z)),y=cross(z,x),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
    const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
    const f=1/Math.tan(.63/2),near=.1,far=Math.max(10000,distance*8),perspective=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],out=new Float32Array(16);
    for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=perspective[k*4+r]*view[c*4+k];
    return out;
  }
  function geometry(kind) {
    const data=[];
    function triangle(a,b,c,material=0) {
      const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
      for (const p of [a,b,c]) data.push(...p,...n.map(x=>x/length),material);
    }
    function quad(a,b,c,d,m=0){triangle(a,b,c,m);triangle(a,c,d,m);}
    function box(x,y,z,l,h,w,m=0){
      const a=[x-l/2,y-h/2,z-w/2],b=[x+l/2,y-h/2,z-w/2],c=[x+l/2,y+h/2,z-w/2],d=[x-l/2,y+h/2,z-w/2],e=[x-l/2,y-h/2,z+w/2],f=[x+l/2,y-h/2,z+w/2],g=[x+l/2,y+h/2,z+w/2],h1=[x-l/2,y+h/2,z+w/2];
      quad(a,d,c,b,m);quad(e,f,g,h1,m);quad(d,h1,g,c,m);quad(a,b,f,e,m);quad(a,e,h1,d,m);quad(b,c,g,f,m);
    }
    function hull(sections){
      const rings=sections.map(([x,w,h])=>[[x,-h*.7,-w*.72],[x,-h*.7,w*.72],[x,-h*.15,w],[x,h*.6,w*.72],[x,h*.6,-w*.72],[x,-h*.15,-w]]);
      for(let r=0;r<rings.length-1;r++)for(let j=0;j<6;j++)quad(rings[r][j],rings[r+1][j],rings[r+1][(j+1)%6],rings[r][(j+1)%6]);
      for(let j=1;j<5;j++){triangle(rings[0][0],rings[0][j],rings[0][j+1]);const last=rings.length-1;triangle(rings[last][0],rings[last][j+1],rings[last][j]);}
    }
    if (kind===0) {
      hull([[-1.9,.6,.6],[.65,.42,.5],[2.5,.08,.12]]);
      for(const s of [-1,1]) {quad([-1.5,0,s*.4],[-1.65,0,s*2],[.9,0,s*.5],[.5,.25,s*.3]);box(-1.93,0,s*.32,.05,.28,.29,1);}
      box(.35,.43,0,1,.16,.35,2);
    } else if (kind===1) {
      hull([[-2,.85,.8],[.75,.8,.65],[2.45,.25,.3]]);
      for(const s of [-1,1]) {box(-.3,-.1,s*1.18,3.8,.55,.48);box(-2.22,-.08,s*1.18,.04,.3,.31,1);quad([.45,0,s*.4],[-1.2,0,s*2.15],[-1.8,-.12,s*1.75],[-1.5,-.12,s*.4]);}
      box(.5,.52,0,.8,.2,.42,2);
    } else if(kind===2) {
      hull([[-2.8,.95,.7],[.7,.85,.65],[3.1,.25,.3]]);
      box(-.7,.58,0,2.1,.44,.88);
      for(const s of [-1,1]) {box(-.8,-.1,s*1.08,3.4,.62,.52);box(-2.53,-.05,s*1.08,.045,.35,.36,1);box(.32,.64,s*.34,.3,.17,.17,2);}
    } else {
      hull([[-3,1.1,1],[1.45,.95,.9],[3.3,.55,.65]]);
      box(-.7,.83,0,2.8,.5,1.2);box(-1.65,1.17,0,1.15,.25,.8);
      for(const s of [-1,1]) {box(-1,-.1,s*1.43,3.8,.76,.65);box(-2.94,0,s*1.43,.045,.43,.46,1);box(.77,.78,s*.73,1.1,.23,.35);box(1.3,.79,s*.73,.8,.09,.09,2);}
    }
    return new Float32Array(data);
  }
  const VERTEX=`precision highp float;
    attribute vec3 aPosition; attribute vec3 aNormal; attribute float aMaterial;
    attribute vec4 aOffset; attribute vec4 aInfo;
    uniform mat4 uMatrix; uniform float uTime; uniform float uApproach;
    varying vec3 vColor;
    void main(){
      float facing=aInfo.x; vec3 p=aPosition*aOffset.w; p.xz*=facing;
      p+=aOffset.xyz; p.x+=facing*uApproach; p.y+=sin(uTime*.35+aInfo.w)*.18;
      vec3 n=aNormal; n.xz*=facing;
      float light=.38+max(0.,dot(normalize(n),normalize(vec3(.25,.9,.5))))*.7;
      vec3 side=aInfo.y<.5?vec3(.20,.82,.95):vec3(1.,.42,.32);
      vec3 metal=mix(vec3(.36,.44,.54),side,.13)*light;
      vColor=aMaterial<.5?metal:aMaterial<1.5?vec3(.04,.84,1.)*1.2:mix(vec3(.95,.82,.53),side,.35);
      vColor*=mix(.7,1.,aInfo.z); gl_Position=uMatrix*vec4(p,1.);
    }`;
  const FRAGMENT=`precision mediump float; varying vec3 vColor; void main(){gl_FragColor=vec4(vColor,1.);}`;
  const LINE_VERTEX=`precision highp float;attribute vec3 aPosition;attribute vec3 aColor;uniform mat4 uMatrix;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uMatrix*vec4(aPosition,1.);gl_PointSize=1.5;}`;
  function program(gl,vertex,fragment) {
    const shaders=[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].map((type,i)=>{const s=gl.createShader(type);gl.shaderSource(s,i?fragment:vertex);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('着色器无法编译：'+gl.getShaderInfoLog(s));return s;});
    const p=gl.createProgram();shaders.forEach(s=>gl.attachShader(p,s));gl.linkProgram(p);shaders.forEach(s=>gl.deleteShader(s));
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('WebGL 程序无法链接。');return p;
  }
  const CSS=`
    .mb-root{position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:520px;background:#070f1c;color:#cad8e6;font:12px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;border:1px solid #1c2b3d;border-radius:8px}
    .mb-toolbar{display:flex;align-items:center;gap:8px;padding:13px 16px;border-bottom:1px solid #1c2b3d;background:#0b1422;z-index:1;flex-wrap:wrap}
    .mb-title{font-size:13px;font-weight:600;letter-spacing:1px;margin-right:auto}.mb-title small{display:block;color:#71869a;font-size:10px;font-weight:400;letter-spacing:.3px}
    .mb-root button,.mb-root select{color:#bacbda;background:#101e2d;border:1px solid #263a4d;border-radius:5px;padding:7px 10px;font:inherit;cursor:pointer;min-height:34px}
    .mb-root button:hover,.mb-root select:hover{border-color:#4b9aa8;color:#ddf7fb}.mb-root button:focus-visible,.mb-root select:focus-visible,.mb-root canvas:focus-visible{outline:2px solid #57d7e9;outline-offset:2px}
    .mb-root button[aria-pressed=true]{color:#5dd4e4;border-color:#367181}.mb-stage{flex:1;min-height:340px;position:relative;isolation:isolate}.mb-stage canvas{position:absolute;width:100%;height:100%;display:block;touch-action:none;cursor:grab}.mb-stage canvas:active{cursor:grabbing}
    .mb-metrics{position:absolute;left:17px;top:14px;color:#738ba0;pointer-events:none;line-height:1.9;font-variant-numeric:tabular-nums;font-size:11px}.mb-metrics b{font-weight:500;color:#adc6d6}.mb-mode{position:absolute;right:17px;top:15px;max-width:45%;text-align:right;color:#7892a6;font-size:10px;pointer-events:none}
    .mb-status{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);padding:7px 18px;border:1px solid #29404f;background:#0b1624dd;border-radius:4px;white-space:nowrap;color:#d7e9f5;pointer-events:none;letter-spacing:1px}.mb-message{position:absolute;inset:15% 10% auto;background:#132031;color:#f1be8a;padding:16px;border:1px solid #7d624a;border-radius:5px;z-index:3}
    .mb-footer{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;padding:13px 18px;border-top:1px solid #1c2b3d;background:#0b1422}.mb-team{font-variant-numeric:tabular-nums}.mb-team:last-child{text-align:right}.mb-team strong{font-weight:500;color:#55d4e7;letter-spacing:1px}.mb-team:last-child strong{color:#e9917e}.mb-team small{color:#788ea3;margin-left:8px}.mb-team span{color:#d7e5f0}.mb-hint{text-align:center;color:#657e93;font-size:10px;align-self:center}.mb-source{padding:7px 16px;color:#596f83;border-top:1px solid #142333;font-size:10px}
    @media(max-width:650px){.mb-root{min-height:570px}.mb-title{width:100%}.mb-footer{gap:8px;grid-template-columns:1fr 1fr}.mb-hint{grid-column:span 2;grid-row:2}.mb-mode{max-width:42%}.mb-toolbar{padding:10px}.mb-root button,.mb-root select{padding:6px 8px}.mb-team small{display:block;margin:0}.mb-team:last-child{grid-column:2;grid-row:1}}
  `;

  class MassBattle {
    constructor(container,catalog) {
      if (!container||!catalog) throw new Error('MassBattle 需要容器和舰船目录。');
      this.container=container;this.catalog=catalog;this.active=false;this.paused=false;this.speed=1;this.last=0;this.accumulator=0;this.frames=0;this.fpsStarted=0;
      this.metrics={fps:0,frameMs:0,simulationMs:0,drawCalls:0,instances:0,triangles:0};this.listeners=[];this.effects=[];this.yaw=.62;this.pitch=.69;
      this.frame=this.frame.bind(this);
    }
    mount() {
      if(this.root)return this;
      this.root=document.createElement('section');this.root.className='mb-root';this.root.setAttribute('aria-label','大规模舰队演练');
      this.root.innerHTML=`<style>${CSS}</style><div class="mb-toolbar"><div class="mb-title">舰队演练场<small>独立沙盘 · 不消耗实际舰船</small></div><label>规模 <select class="mb-size" aria-label="双方合计舰船数量"><option value="100">100 艘</option><option value="1000" selected>1,000 艘</option><option value="10000">10,000 艘</option><option value="20000">20,000 艘</option></select></label><button class="mb-pause" aria-pressed="false">暂停</button><button class="mb-restart">重新演练</button><select class="mb-speed" aria-label="演练速度"><option value="1">1× 速度</option><option value="2">2× 速度</option><option value="4">4× 速度</option><option value="8">8× 速度</option></select><button class="mb-camera">全局视角</button></div><div class="mb-stage"><canvas tabindex="0" aria-label="舰队三维战场，拖动旋转、滚轮缩放，方向键旋转，加减号缩放"></canvas><div class="mb-metrics"></div><div class="mb-mode"></div><div class="mb-status" role="status">等待部署</div><div class="mb-message" role="alert" hidden></div></div><div class="mb-footer"><div class="mb-team mb-blue"></div><div class="mb-hint">拖动旋转 · 滚轮缩放<br>方向键旋转 · + / − 缩放</div><div class="mb-team mb-red"></div></div><div class="mb-source">Godot 舰船数值 · 0.25 秒固定步长 · 每艘独立生命值与护盾 · 特效上限 144 束</div>`;
      this.container.appendChild(this.root);this.canvas=this.root.querySelector('canvas');
      this.dom={};for(const name of ['size','pause','restart','speed','camera','metrics','mode','status','message','blue','red','source'])this.dom[name]=this.root.querySelector('.mb-'+name);
      try {
        this.gl=this.canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});
        if (!this.gl) throw new Error('当前浏览器无法创建 WebGL。请开启硬件加速后重试。');
        this.extension=this.gl.getExtension('ANGLE_instanced_arrays');this.limit=this.extension?LIMIT:1000;
        this.initGL();
        if(!this.extension){for(const option of this.dom.size.options)if(+option.value>1000)option.disabled=true;this.dom.source.textContent='当前设备不支持实例化，逐舰绘制上限 1,000 艘；仍计算全部参演舰船。';}
        this.bind();this.start({size:1000});
      } catch(error) {this.showError(error.message);}
      return this;
    }
    on(target,event,handler,options) {target.addEventListener(event,handler,options);this.listeners.push(()=>target.removeEventListener(event,handler,options));}
    bind() {
      this.on(this.dom.size,'change',()=>this.start({size:+this.dom.size.value}));
      this.on(this.dom.pause,'click',()=>{this.paused=!this.paused;this.updateHUD();});
      this.on(this.dom.restart,'click',()=>this.start(this.options));
      this.on(this.dom.speed,'change',()=>{this.speed=+this.dom.speed.value;});
      this.on(this.dom.camera,'click',()=>this.resetCamera());
      this.on(this.canvas,'pointerdown',event=>{if(event.button!==0)return;this.drag={x:event.clientX,y:event.clientY,id:event.pointerId};this.canvas.setPointerCapture(event.pointerId);});
      this.on(this.canvas,'pointermove',event=>{if(!this.drag)return;this.yaw-=(event.clientX-this.drag.x)*.005;this.pitch=clamp(this.pitch+(event.clientY-this.drag.y)*.004,-1.35,1.35);this.drag.x=event.clientX;this.drag.y=event.clientY;});
      this.on(this.canvas,'pointerup',()=>{this.drag=null;});this.on(this.canvas,'pointercancel',()=>{this.drag=null;});
      this.on(this.canvas,'wheel',event=>{event.preventDefault();this.distance=clamp(this.distance*Math.exp(event.deltaY*.001),8,this.sim.extent*12);},{passive:false});
      this.on(this.canvas,'keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-',' '].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')this.yaw-=.1;if(event.key==='ArrowRight')this.yaw+=.1;if(event.key==='ArrowUp')this.pitch=clamp(this.pitch+.1,-1.35,1.35);if(event.key==='ArrowDown')this.pitch=clamp(this.pitch-.1,-1.35,1.35);if(event.key==='+'||event.key==='=')this.distance=clamp(this.distance*.85,8,this.sim.extent*12);if(event.key==='-')this.distance=clamp(this.distance*1.15,8,this.sim.extent*12);if(event.key===' '){this.paused=!this.paused;this.updateHUD();}});
      this.on(this.canvas,'webglcontextlost',event=>{event.preventDefault();this.setActive(false);this.showError('图形上下文已中断。请重新打开演练页；实际舰队与存档不受影响。');});
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.canvas);
    }
    initGL() {
      const gl=this.gl;this.shipProgram=program(gl,VERTEX,FRAGMENT);this.lineProgram=program(gl,LINE_VERTEX,FRAGMENT);
      this.attributes={};for(const name of ['aPosition','aNormal','aMaterial','aOffset','aInfo'])this.attributes[name]=gl.getAttribLocation(this.shipProgram,name);
      this.uniforms={};for(const name of ['uMatrix','uTime','uApproach'])this.uniforms[name]=gl.getUniformLocation(this.shipProgram,name);
      this.lineAttributes={position:gl.getAttribLocation(this.lineProgram,'aPosition'),color:gl.getAttribLocation(this.lineProgram,'aColor')};this.lineMatrix=gl.getUniformLocation(this.lineProgram,'uMatrix');
      this.meshes=Array.from({length:4},(_,kind)=>{const vertices=geometry(kind),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);return{buffer,vertices:vertices.length/7,instances:gl.createBuffer(),data:new Float32Array(0),count:0};});
      this.lineBuffer=gl.createBuffer();this.lineData=new Float32Array(144*12);
      this.starBuffer=gl.createBuffer();const rng=random(9),stars=[];
      for(let i=0;i<700;i++){const a=rng()*Math.PI*2,z=rng()*2-1,r=Math.sqrt(1-z*z),light=.1+rng()*.3;stars.push(Math.cos(a)*r*3400,z*3400,Math.sin(a)*r*3400,light*.65,light*.8,light);}
      gl.bindBuffer(gl.ARRAY_BUFFER,this.starBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(stars),gl.STATIC_DRAW);this.starCount=stars.length/6;
      gl.enable(gl.DEPTH_TEST);gl.clearColor(.018,.037,.067,1);
    }
    start(options={}) {
      if(!this.gl||!this.shipProgram)return false;
      try {
        const sim=new Simulation(this.catalog,options);
        if(sim.total>this.limit)throw new Error('当前设备不支持实例化，最多可绘制 1,000 艘。请缩小舰队规模。');
        this.sim=sim;this.options=structuredClone(options);this.paused=false;this.accumulator=0;this.effects=[];this.last=0;
        this.metrics.fps=0;this.frames=0;this.fpsStarted=0;this.dom.message.hidden=true;
        if([...this.dom.size.options].some(o=>+o.value===sim.total))this.dom.size.value=String(sim.total);
        else this.dom.size.selectedIndex=-1;
        this.dom.mode.textContent=sim.report?(sim.inferredTiming?'历史战报 · 兵力准确，时间与轨迹示意':'战报回放 · 兵力快照准确，轨迹示意'):`双方合计 ${sim.total.toLocaleString()} 艘 · 独立演练`;
        this.dom.source.textContent=sim.report?(sim.inferredTiming?'原始回合兵力与胜负 · 旧战报没有时间记录，按每回合 6 秒展示 · 时间与轨迹示意 · 不改写实际战果':'读取原始战报兵力快照与胜负 · 舰船轨迹、命中位置仅作示意 · 不改写实际战果'):this.extension?'Godot 舰船数值 · 0.25 秒固定步长 · 单舰生命值与护盾 · 独立演练规则，非正式战果 · 特效上限 144 束':'当前设备不支持实例化，逐舰绘制上限 1,000 艘；仍计算全部参演舰船。';
        this.uploadInstances();this.resetCamera();this.resize();this.render();this.updateHUD();return true;
      }catch(error){this.showError(error.message);return false;}
    }
    showError(message){if(this.dom){this.dom.message.textContent=message;this.dom.message.hidden=false;}}
    resetCamera(){if(!this.sim)return;this.yaw=.62;this.pitch=.69;this.distance=this.sim.extent*2.85;}
    resize(){if(!this.gl)return;const ratio=Math.min(scope.devicePixelRatio||1,1.5),w=Math.max(1,Math.round(this.canvas.clientWidth*ratio)),h=Math.max(1,Math.round(this.canvas.clientHeight*ratio));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.gl.viewport(0,0,w,h);}
    uploadInstances() {
      const gl=this.gl,s=this.sim;
      for(let kind=0;kind<4;kind++) {
        const mesh=this.meshes[kind],ids=s.groups[kind],required=ids.length*8;
        if(mesh.data.length<required)mesh.data=new Float32Array(required);
        let n=0;
        for(const id of ids)if(s.hp[id]>0){const p=id*3,i=n++*8;mesh.data[i]=s.positions[p];mesh.data[i+1]=s.positions[p+1];mesh.data[i+2]=s.positions[p+2];mesh.data[i+3]=s.scales[id];mesh.data[i+4]=s.side[id]===0?1:-1;mesh.data[i+5]=s.side[id];mesh.data[i+6]=s.hp[id]/s.maxHP[id];mesh.data[i+7]=id*.618;}
        mesh.count=n;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.instances);gl.bufferData(gl.ARRAY_BUFFER,mesh.data.subarray(0,n*8),gl.DYNAMIC_DRAW);
      }
    }
    addEffects() {
      const s=this.sim,t=s.tick*STEP,approach=this.approach();
      for(const [from,to] of s.visualShots) {
        if(this.effects.length>=144)this.effects.shift();
        const a=from*3,b=to*3;
        this.effects.push({a:[s.positions[a]+(s.side[from]===0?approach:-approach),s.positions[a+1],s.positions[a+2]],b:[s.positions[b]+(s.side[to]===0?approach:-approach),s.positions[b+1],s.positions[b+2]],side:s.side[from],at:t});
      }
      this.effects=this.effects.filter(e=>t-e.at<.75);
    }
    approach(){return Math.min(this.sim.tick*STEP*1.5,this.sim.gap*.48);}
    render() {
      if(!this.sim||!this.shipProgram)return;
      const gl=this.gl,m=matrix(this.yaw,this.pitch,this.distance,this.canvas.width/this.canvas.height),a=this.attributes;let draws=0,instances=0,triangles=0;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      globalThis.SpaceSky?.create(gl).draw({forward:[-Math.sin(this.yaw)*Math.cos(this.pitch),-Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch)],fov:.63,exposure:.8});draws++;
      gl.useProgram(this.shipProgram);gl.uniformMatrix4fv(this.uniforms.uMatrix,false,m);gl.uniform1f(this.uniforms.uTime,this.sim.tick*STEP);gl.uniform1f(this.uniforms.uApproach,this.approach());
      for(const mesh of this.meshes) {
        if(!mesh.count)continue;
        gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
        for(const [name,size,offset] of [['aPosition',3,0],['aNormal',3,12],['aMaterial',1,24]]){gl.enableVertexAttribArray(a[name]);gl.vertexAttribPointer(a[name],size,gl.FLOAT,false,28,offset);}
        if(this.extension){
          gl.bindBuffer(gl.ARRAY_BUFFER,mesh.instances);
          for(const [name,offset] of [['aOffset',0],['aInfo',16]]){gl.enableVertexAttribArray(a[name]);gl.vertexAttribPointer(a[name],4,gl.FLOAT,false,32,offset);this.extension.vertexAttribDivisorANGLE(a[name],1);}
          this.extension.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.vertices,mesh.count);draws++;
          for(const name of ['aOffset','aInfo']){this.extension.vertexAttribDivisorANGLE(a[name],0);gl.disableVertexAttribArray(a[name]);}
        }else{
          gl.disableVertexAttribArray(a.aOffset);gl.disableVertexAttribArray(a.aInfo);
          for(let i=0;i<mesh.count;i++){gl.vertexAttrib4fv(a.aOffset,mesh.data.subarray(i*8,i*8+4));gl.vertexAttrib4fv(a.aInfo,mesh.data.subarray(i*8+4,i*8+8));gl.drawArrays(gl.TRIANGLES,0,mesh.vertices);draws++;}
        }
        instances+=mesh.count;triangles+=mesh.count*mesh.vertices/3;
      }
      for(const name of ['aPosition','aNormal','aMaterial'])gl.disableVertexAttribArray(a[name]);
      let lineVertices=0;
      for(const effect of this.effects){
        const age=this.sim.tick*STEP-effect.at,progress=clamp(age/.75,0,1),length=.13;
        if(age>=.75)continue;
        const color=effect.side===0?[.12,.68,.87]:[.86,.36,.25];
        for(const fraction of [Math.max(0,progress-length),progress]){const i=lineVertices++*6;for(let axis=0;axis<3;axis++)this.lineData[i+axis]=effect.a[axis]+(effect.b[axis]-effect.a[axis])*fraction;this.lineData.set(color,i+3);}
      }
      if(lineVertices){gl.useProgram(this.lineProgram);gl.uniformMatrix4fv(this.lineMatrix,false,m);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.lineData.subarray(0,lineVertices*6),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(this.lineAttributes.position);gl.vertexAttribPointer(this.lineAttributes.position,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(this.lineAttributes.color);gl.vertexAttribPointer(this.lineAttributes.color,3,gl.FLOAT,false,24,12);gl.drawArrays(gl.LINES,0,lineVertices);draws++;}
      gl.disableVertexAttribArray(this.lineAttributes.position);gl.disableVertexAttribArray(this.lineAttributes.color);
      this.metrics.drawCalls=draws;this.metrics.instances=instances;this.metrics.triangles=triangles;
    }
    frame(now) {
      this.raf=0;if(!this.active||!this.sim)return;
      const elapsed=this.last?Math.min(.25,(now-this.last)/1000):0;this.last=now;
      if(!this.fpsStarted){this.fpsStarted=now;this.frames=0;}else this.frames++;
      if(now-this.fpsStarted>=800){this.metrics.fps=this.frames*1000/(now-this.fpsStarted);this.metrics.frameMs=(now-this.fpsStarted)/this.frames;this.frames=0;this.fpsStarted=now;}
      const before=performance.now();let stepped=false;
      if(!this.paused&&!this.sim.finished){this.accumulator+=elapsed*this.speed;let steps=0;while(this.accumulator>=STEP&&steps++<8){this.sim.step();this.addEffects();this.accumulator-=STEP;stepped=true;if(this.sim.finished){this.accumulator=0;break;}}}
      if(stepped){this.uploadInstances();this.metrics.simulationMs=performance.now()-before;}
      this.render();if(!this.lastHUD||now-this.lastHUD>200){this.updateHUD();this.lastHUD=now;}
      this.raf=requestAnimationFrame(this.frame);
    }
    updateHUD() {
      if(!this.sim)return;const s=this.sim,m=this.metrics;
      this.dom.pause.textContent=this.paused?'继续':'暂停';this.dom.pause.setAttribute('aria-pressed',String(this.paused));
      this.dom.metrics.innerHTML=`<b>${m.fps?m.fps.toFixed(0):'—'}</b> FPS · <b>${m.frameMs?m.frameMs.toFixed(1):'—'}</b> ms / frame<br>绘制舰船 <b>${m.instances.toLocaleString()}</b> / ${s.total.toLocaleString()}<br>Draw calls <b>${m.drawCalls}</b> · ${this.extension?'GPU 实例化':'逐舰兼容模式'}<br>${s.inferredTiming?'回放进度':'战斗时钟'} <b>${(s.tick*STEP).toFixed(1)} s</b> · ${m.triangles.toLocaleString()} 三角面`;
      for(let side=0;side<2;side++){const live=s.alive[side].length,lost=s.initialCounts[side]-live;this.dom[side===0?'blue':'red'].innerHTML=`<strong>${side===0?'蓝方舰队':'红方舰队'}</strong> <span>${live.toLocaleString()} 存活</span><small>${lost.toLocaleString()} 损失 / ${s.initialCounts[side].toLocaleString()} 初始</small>`;}
      this.dom.status.textContent=s.finished?(s.winner==='attacker'?'蓝方获胜':s.winner==='defender'?'红方获胜':s.alive[0].length||s.alive[1].length?'演练结束 · 平局':'演练结束 · 双方全灭'):this.paused?'演练已暂停':s.report?'战报回放中':'舰队交战中';
    }
    setActive(active) {
      this.active=Boolean(active);this.last=0;this.frames=0;this.fpsStarted=0;
      if(this.raf){cancelAnimationFrame(this.raf);this.raf=0;}
      if(this.active&&this.sim&&this.gl){this.resize();this.raf=requestAnimationFrame(this.frame);}return this;
    }
    snapshot(){return{...this.metrics,active:this.active,paused:this.paused,instanced:Boolean(this.extension),total:this.sim?.total||0,alive:this.sim?.alive.map(a=>a.length)||[],time:(this.sim?.tick||0)*STEP,winner:this.sim?.winner||null,finished:this.sim?.finished||false,mode:this.sim?.report?'report':'exercise'};}
    destroy() {
      this.setActive(false);this.resizeObserver?.disconnect();this.listeners.forEach(remove=>remove());this.listeners=[];
      if(this.gl){for(const mesh of this.meshes||[]){this.gl.deleteBuffer(mesh.buffer);this.gl.deleteBuffer(mesh.instances);}for(const buffer of [this.lineBuffer,this.starBuffer])if(buffer)this.gl.deleteBuffer(buffer);for(const p of [this.shipProgram,this.lineProgram])if(p)this.gl.deleteProgram(p);}
      this.root?.remove();this.root=null;this.gl=null;this.sim=null;
    }
  }
  MassBattle.Simulation=Simulation;MassBattle.geometry=geometry;MassBattle.STEP=STEP;MassBattle.LIMIT=LIMIT;
  scope.MassBattle=MassBattle;
})(typeof window!=='undefined'?window:globalThis);
