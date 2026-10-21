(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const C = { cyan: '#5cdef9', gold: '#efbb72', violet: '#b587ec', green: '#65ccb4', red: '#f07c85', white: '#d5edff' };
  function random(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rgba(hex, alpha) { let a = hex.replace('#', ''); if (a.length === 3) a = a.split('').map(c => c + c).join(''); return 'rgba(' + parseInt(a.slice(0, 2), 16) + ',' + parseInt(a.slice(2, 4), 16) + ',' + parseInt(a.slice(4, 6), 16) + ',' + alpha + ')'; }
  function glow(ctx, x, y, r, color, alpha) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(color, alpha)); g.addColorStop(.18, rgba(color, alpha * .36)); g.addColorStop(.52, rgba(color, alpha * .12)); g.addColorStop(1, rgba(color, 0)); ctx.fillStyle = g; ctx.fillRect(x-r, y-r, r*2, r*2); }
  function emblem(ctx, x, y, s, color, alpha) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8; const pieces = [[[-1,-25],[-5,-7],[-4,12],[0,24],[4,12],[5,-7],[1,-25]], [[-9,-17],[-15,-4],[-13,8],[-6,16],[-8,6],[-7,-2]], [[9,-17],[15,-4],[13,8],[6,16],[8,6],[7,-2]], [[-18,-6],[-18,7],[-10,15],[-12,7]], [[18,-6],[18,7],[10,15],[12,7]]]; pieces.forEach(p => { ctx.beginPath(); p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.closePath(); ctx.fill(); }); ctx.restore(); }
  function fleet(ctx, x, y, angle, size, color) { ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.fillStyle = rgba(color,.95); ctx.shadowBlur = 9; ctx.shadowColor = color; ctx.beginPath(); ctx.moveTo(size,0); ctx.lineTo(-size*.65,-size*.42); ctx.lineTo(-size*.35,0); ctx.lineTo(-size*.65,size*.42); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const { systemData, territories } = window.StarMapData;


  window.initGalaxyMap = function initGalaxyMap(canvas, options) {
    options = options || {};
    const ctx = canvas.getContext('2d');
    const catalogue = window.GalaxyCatalogue;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let density = .76, palette = 'blue', selectedRoute = null;
    let W=1600,H=900,DPR=1, base=null, raf=0, dead=false, lastFrame=0, animationTime=0;
    let scale=1, panX=0, panY=0, selected='tianqiong', hovered=null, moving=false, pointer=null;
    const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const layers={territories:true,routes:true,fleets:true,labels:false,animation:!reduced};
    const systems = systemData.map((s, i)=>({id:s[0],name:s[1],x:s[2],y:s[3],owner:s[4],type:s[5],level:s[6],color:s[7],description:s[8],index:i, planets: 3+i%4, distance: i ? (3.4+i*1.67).toFixed(1) : '0.0'}));
    function buildPath(points,index) {
      const path = new Path2D(), rand=random(index*45+9821);
      points.forEach((p,i)=>{
        const q=points[(i+1)%points.length];
        if(!i)path.moveTo(p[0]*W,p[1]*H);
        for(let n=1;n<=4;n++) { const t=n/4; const jitter=n===4?0:(rand()-.5)*.012; const dx=q[0]-p[0],dy=q[1]-p[1]; path.lineTo((p[0]+dx*t-dy*jitter*20)*W,(p[1]+dy*t+dx*jitter*20)*H); }
      }); path.closePath(); return path;
    }
    let regionPaths=[];
  function paintStars(c, width, height, miniature = false) {
    c.fillStyle = '#040910'; c.fillRect(0, 0, width, height);
    const span = Math.min(width * 1.16, height * 1.9), cx = width * .435, cy = height * .505;
    const cos = Math.cos(.26), sin = Math.sin(.26);
    const cold = palette === 'blue' ? [130, 173, 201] : [185, 193, 203], warm = palette === 'blue' ? [213, 199, 175] : [213, 211, 202];
    // Retain the actual bar and dust gaps: sample existing points, never redraw a spiral.
    for (let i = 0; i < catalogue.length; i += 5) {
      const key = (Math.imul(i / 5 + 17, 2654435761) >>> 0) / 4294967296;
      if (key > density || (miniature && i % 20)) continue;
      const x = catalogue[i] / 64000, z = catalogue[i + 2] / 64000;
      const px = cx + (x * cos - z * sin) * span, py = cy + (x * sin + z * cos) * span * .68;
      const central = Math.max(0, 1 - Math.hypot(x, z) * 5);
      const rgb = cold.map((v, j) => Math.round(v + (warm[j] - v) * central)), brightness = catalogue[i + 4];
      const size = Math.max(miniature ? .35 : .55, catalogue[i + 3] * (miniature ? .18 : .48));
      c.fillStyle = `rgba(${rgb.join(',')},${clamp(brightness * (miniature ? 1.3 : .82), .04, .78)})`;
      c.fillRect(px, py, size, size);
      if (!miniature && brightness > .88 && key < .06) glow(c, px, py, size * 3.5, '#9cb8cf', .10);
    }
    if (!miniature) {
      const g = c.createRadialGradient(cx, cy, span * .18, cx, cy, span * .68);
      g.addColorStop(0, '#04091000'); g.addColorStop(1, '#040910c7');
      c.fillStyle = g; c.fillRect(0, 0, width, height);
    }
  }
    function paintBase() {
      if (!W || !H) return;
      base = document.createElement('canvas'); base.width = Math.ceil(W * DPR); base.height = Math.ceil(H * DPR);
      const c = base.getContext('2d'); c.scale(DPR, DPR); paintStars(c, W, H);
      regionPaths = territories.map((t, i) => buildPath(t.points, i));
    }
    function resize(){ const r=canvas.getBoundingClientRect();W=canvas.clientWidth||r.width||1672;H=canvas.clientHeight||r.height||941;DPR=Math.min(window.devicePixelRatio||1,1.7);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);paintBase(); }
    function transformPoint(s){ return {x:(s.x*W-W*.5)*scale+W*.5+panX,y:(s.y*H-H*.5)*scale+H*.5+panY}; }
    function worldPoint(x,y){return {x:(x-W*.5-panX)/scale+W*.5,y:(y-H*.5-panY)/scale+H*.5};}
    function orbitGuides(){ctx.save();ctx.translate(W*.473,H*.526);ctx.scale(1,.66);ctx.strokeStyle='rgba(108,182,208,.21)';ctx.lineWidth=.65;for(let r=95;r<690;r+=105){ctx.setLineDash(r%2?[2,6]:[1,9]);ctx.beginPath();ctx.arc(0,0,r*W/1600,0,TAU);ctx.stroke();}ctx.setLineDash([]);ctx.restore();}
    function drawRegions(){if(!layers.territories)return;territories.forEach((t,i)=>{const p=regionPaths[i];ctx.save();const grad=ctx.createRadialGradient(t.emblem[0]*W,t.emblem[1]*H,0,t.emblem[0]*W,t.emblem[1]*H,W*.24);grad.addColorStop(0,rgba(t.color,.1));grad.addColorStop(1,rgba(t.color,.025));ctx.fillStyle=grad;ctx.fill(p);ctx.shadowColor=t.color;ctx.shadowBlur=9;ctx.strokeStyle=rgba(t.color,.48);ctx.lineWidth=1.1/Math.sqrt(scale);ctx.stroke(p);ctx.shadowBlur=0;ctx.strokeStyle=rgba(t.color,.45);ctx.lineWidth=.55/Math.sqrt(scale);ctx.stroke(p);ctx.restore();if(i)emblem(ctx,t.emblem[0]*W,t.emblem[1]*H,W/1600*1.1,t.color,.72);});}
  const routes = [
    { id: 'patrol', name: '深空巡航编队', from: 'tianqiong', to: 'chenxi', kind: '巡航', color: '#86cddc', bend: .24, phase: .37, duration: 64000 },
    { id: 'transport', name: '星际运输编队', from: 'voyager', to: 'tianqiong', kind: '运输', color: '#ddc18c', bend: -.27, phase: .54, duration: 96000 },
    { id: 'alert', name: '边境巡逻编队', from: 'crimson', to: 'tianhe', kind: '警戒', color: '#db8c8c', bend: -.2, phase: .26, duration: 82000 }
  ];
  function geometry(route) {
    const from = systems.find(s => s.id === route.from), to = systems.find(s => s.id === route.to);
    const a = { x: from.x * W, y: from.y * H }, b = { x: to.x * W, y: to.y * H };
    return { a, b, c: { x: (a.x + b.x) / 2 - (b.y - a.y) * route.bend, y: (a.y + b.y) / 2 + (b.x - a.x) * route.bend } };
  }
  function point({ a, b, c }, t) { return { x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y }; }
    function drawRoutes() {
      if (!layers.routes) return;
      for (const route of routes) {
        const g = geometry(route), active = selectedRoute === route.id;
        ctx.beginPath(); ctx.moveTo(g.a.x, g.a.y); ctx.quadraticCurveTo(g.c.x, g.c.y, g.b.x, g.b.y);
        ctx.lineWidth = (active ? 1.7 : 1.1) / scale; ctx.strokeStyle = rgba(route.color, .2); ctx.stroke();
        ctx.setLineDash([3 / scale, 6 / scale]); ctx.lineDashOffset = -animationTime * .012 / scale;
        ctx.strokeStyle = rgba(route.color, active ? 1 : .78); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // Home indicator copied from the reference index; coordinates use this demo's existing home system.
    function drawHomeMarker(system, milliseconds) {
      const t = milliseconds / 1000, base = clamp(1.15 * Math.sqrt(scale), 1.2, 4.4);
      ctx.save(); ctx.translate(system.x * W, system.y * H); ctx.scale(1 / scale, 1 / scale);
      glow(ctx, 0, 0, 14 * base, '#ecc97f', .65);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, base * .55, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(236,201,127,.75)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(0, 0, base + 3.5, 0, TAU); ctx.stroke();
      for (let k = 0; k < 2; k++) {
        const ph = (t * .5 + k * .5) % 1;
        ctx.strokeStyle = `rgba(236,201,127,${(1-ph)*.7})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, base + 4 + ph * 22, 0, TAU); ctx.stroke();
      }
      ctx.save(); ctx.rotate(Math.PI / 4 + t * .4);
      ctx.strokeStyle = '#ffe2a3'; ctx.lineWidth = 1.4; const d = base + 7;
      ctx.strokeRect(-d, -d, d * 2, d * 2); ctx.restore();
      if (layers.labels || selected === system.id || hovered === system.id) {
        const x = base + 9, y = -base - 7, name = '◆ ' + system.name;
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.font = '700 12.5px "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei UI", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,.95)'; ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(name, x, y);
        const width = ctx.measureText(name).width;
        ctx.fillStyle = '#ecc97f'; ctx.fillText(name, x, y);
        ctx.font = '500 9.5px Consolas,"Cascadia Mono",monospace';
        ctx.fillStyle = 'rgba(170,190,198,.85)'; ctx.fillText('1:1', x + width + 6, y);
      }
      ctx.restore();
    }
    function drawSystems(t){systems.forEach(s=>{if(s.id==='tianqiong'){drawHomeMarker(s,t);return;}const x=s.x*W,y=s.y*H,active=s.id===selected,over=s.id===hovered;const factor=W/1600;const radius=(active?4.6:s.level>3?3:2.3)*factor/Math.pow(scale,.25);glow(ctx,x,y,(active?35:15)*factor,s.color,active?.82:.5);ctx.fillStyle=active?'#fff1cf':'#e8f5ff';ctx.shadowColor=s.color;ctx.shadowBlur=active?17:8;ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=rgba(s.color,active?.86:.55);ctx.lineWidth=.75/scale;if(s.level>3||over){ctx.beginPath();ctx.arc(x,y,(active?16:8)*factor,0,TAU);ctx.stroke();}if(over&&!active){ctx.strokeStyle='#b4f4ff';ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(x,y,16*factor,0,TAU);ctx.stroke();ctx.setLineDash([]);}if(active){ctx.save();ctx.translate(x,y);ctx.scale(1,.6);for(let i=0;i<3;i++){ctx.strokeStyle=rgba(C.cyan,.75-i*.14);ctx.lineWidth=.85/scale;ctx.beginPath();ctx.arc(0,0,(28+i*14)*factor,0,TAU);ctx.stroke();}ctx.rotate(t*.00014);ctx.strokeStyle='rgba(189,245,255,.95)';ctx.lineWidth=2/scale;for(let a=0;a<4;a++){ctx.beginPath();ctx.arc(0,0,56*factor,a*Math.PI/2,a*Math.PI/2+.38);ctx.stroke();}ctx.restore();ctx.strokeStyle='rgba(86,219,246,.3)';ctx.beginPath();ctx.moveTo(x-72*factor,y);ctx.lineTo(x+72*factor,y);ctx.moveTo(x,y-43*factor);ctx.lineTo(x,y+43*factor);ctx.stroke();emblem(ctx,x,y-49*factor,.95*factor,C.cyan,.95);}if(layers.labels||over){ctx.font=`${11/Math.max(.8,scale*.7)}px "Microsoft YaHei",sans-serif`;ctx.textAlign='center';ctx.fillStyle=over?'#e4faff':'#9fbecb';ctx.shadowColor='#00111c';ctx.shadowBlur=4;ctx.fillText(s.name,x,y+22*factor);ctx.shadowBlur=0;}});}
    function drawFleets(tick) {
      if (!layers.fleets || !layers.routes) return;
      for (const route of routes) {
        const g = geometry(route), t = (route.phase + tick / route.duration) % 1, p = point(g, t);
        const angle = Math.atan2(2 * (1 - t) * (g.c.y - g.a.y) + 2 * t * (g.b.y - g.c.y), 2 * (1 - t) * (g.c.x - g.a.x) + 2 * t * (g.b.x - g.c.x));
        glow(ctx, p.x, p.y, 13 / scale, route.color, .28);
        fleet(ctx, p.x, p.y, angle, 7 / scale, route.color);
        if (scale > 1.25 || selectedRoute === route.id) {
          ctx.font = `${10 / scale}px "Microsoft YaHei", sans-serif`; ctx.textAlign = 'left';
          ctx.fillStyle = route.color; ctx.shadowColor = '#03080f'; ctx.shadowBlur = 6;
          ctx.fillText(route.name, p.x + 12 / scale, p.y - 10 / scale); ctx.shadowBlur = 0;
        }
      }
    }
    function planets(){const x=W*.272,y=H*.215,r=W*.013;ctx.save();glow(ctx,x,y,r*2.3,'#497da8',.22);const g=ctx.createRadialGradient(x-r*.44,y-r*.42,0,x+r*.35,y+r*.2,r*1.3);g.addColorStop(0,'#72a3bd');g.addColorStop(.4,'#345975');g.addColorStop(.74,'#1a3044');g.addColorStop(1,'#02060c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='rgba(145,207,239,.54)';ctx.lineWidth=1;ctx.stroke();ctx.clip();ctx.globalAlpha=.3;ctx.strokeStyle='#b5b4a0';ctx.lineWidth=r*.22;ctx.beginPath();ctx.moveTo(x-r,y-r*.4);ctx.bezierCurveTo(x-r*.2,y+r*.4,x+r*.2,y-r*.4,x+r,y+r*.3);ctx.stroke();ctx.restore();const bx=W*.711,by=H*.707;ctx.save();ctx.translate(bx,by);ctx.rotate(-.26);ctx.scale(1,.57);glow(ctx,0,0,W*.04,'#6d83c4',.6);ctx.strokeStyle='rgba(157,183,240,.5)';ctx.lineWidth=W*.004;ctx.shadowColor='#7f9ee0';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(0,0,W*.016,0,TAU);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#01040a';ctx.beginPath();ctx.arc(0,0,W*.012,0,TAU);ctx.fill();ctx.restore();}
    function draw(t){if(dead)return;raf=requestAnimationFrame(draw);if(document.hidden){lastFrame=t;return;}if(t-lastFrame<32)return;if(layers.animation)animationTime+=Math.min(t-lastFrame,64);lastFrame=t;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle='#02060c';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W*.5+panX,H*.5+panY);ctx.scale(scale,scale);ctx.translate(-W*.5,-H*.5);if(base)ctx.drawImage(base,0,0,W,H);orbitGuides();drawRegions();drawRoutes();planets();drawFleets(animationTime);drawSystems(animationTime);ctx.restore();}
    function closest(x,y){let found=null,d=25;systems.forEach(s=>{const p=transformPoint(s),dist=Math.hypot(p.x-x,p.y-y);if(dist<d){found=s;d=dist;}});return found;}
    function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
    function down(e){if(e.button!==0)return;const p=position(e);pointer={id:e.pointerId,x:p.x,y:p.y,lastX:p.x,lastY:p.y};moving=false;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';}
    function move(e){const p=position(e);if(pointer){const dist=Math.hypot(p.x-pointer.x,p.y-pointer.y);if(dist>5)moving=true;if(moving){panX+=p.x-pointer.lastX;panY+=p.y-pointer.lastY;constrain();}pointer.lastX=p.x;pointer.lastY=p.y;return;}const s=closest(p.x,p.y);const id=s?s.id:null;if(id!==hovered){hovered=id;if(options.onHover)options.onHover(s,{x:p.x,y:p.y});}canvas.style.cursor=s?'pointer':'grab';}
    function up(e){if(!pointer)return;const p=position(e);if(!moving){const s=closest(p.x,p.y);if(s){selected=s.id;selectedRoute=null;if(options.onSelect)options.onSelect(s);}}pointer=null;moving=false;canvas.style.cursor='grab';try{canvas.releasePointerCapture(e.pointerId);}catch(_){} }
    function leave(){if(!pointer){hovered=null;if(options.onHover)options.onHover(null);}}
    function constrain(){panX=Math.max(-W*.65*scale,Math.min(W*.65*scale,panX));panY=Math.max(-H*.65*scale,Math.min(H*.65*scale,panY));}
    function zoomBy(factor, anchor){const before=scale;scale=Math.max(.72,Math.min(3.2,scale*factor));if(anchor){panX=anchor.x-W*.5-(anchor.x-W*.5-panX)*scale/before;panY=anchor.y-H*.5-(anchor.y-H*.5-panY)*scale/before;}constrain();return scale;}
    function wheel(e){e.preventDefault();zoomBy(Math.exp(-e.deltaY*.001),position(e));}
    function cancel(){pointer=null;moving=false;canvas.style.cursor='grab';}
    function dbl(e){const p=position(e),s=closest(p.x,p.y);if(s){selected=s.id;zoomBy(1.45,p);if(options.onSelect)options.onSelect(s);}}
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('dblclick',dbl);canvas.style.touchAction='none';canvas.style.cursor='grab';
    const ro=window.ResizeObserver?new ResizeObserver(resize):null;if(ro)ro.observe(canvas);else window.addEventListener('resize',resize);resize();raf=requestAnimationFrame(draw);
    return {
      reset(){scale=1;panX=panY=0;selectedRoute=null;},
      zoomBy,
      toggleLayer(name,value){const aliases={borders:'territories',territory:'territories',paths:'routes',connections:'routes',fleet:'fleets',names:'labels'};name=aliases[name]||name;if(!(name in layers))return false;layers[name]=typeof value==='boolean'?value:!layers[name];return layers[name];},
      selectSystem(id,silent){const s=systems.find(s=>s.id===id);if(!s)return null;selected=id;selectedRoute=null;if(!silent&&options.onSelect)options.onSelect(s);return s;},
      focusSystem(id){const s=systems.find(s=>s.id===id);if(!s)return null;selected=id;selectedRoute=null;panX=(W*.43-W*.5)-(s.x*W-W*.5)*scale;panY=(H*.49-H*.5)-(s.y*H-H*.5)*scale;if(options.onSelect)options.onSelect(s);return s;},
      getSystems(){return systems.map(s=>({...s}));},
      getState(){return {scale,panX,panY,selected,density,palette,layers:{...layers}};},
      getRoutes(){return routes.map(r=>({...r,fromName:systems.find(s=>s.id===r.from).name,toName:systems.find(s=>s.id===r.to).name}));},
      highlightRoute(id){selectedRoute=id;layers.routes=true;},
      setAppearance(next){if(next.density!==undefined)density=next.density;if(next.palette)palette=next.palette;paintBase();},
      drawMini(mini){const w=mini.clientWidth,h=mini.clientHeight;if(!w||!h)return;mini.width=w*DPR;mini.height=h*DPR;const c=mini.getContext('2d');c.scale(DPR,DPR);paintStars(c,w,h,true);},
      destroy(){dead=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('dblclick',dbl);}
    };
  };
})();
