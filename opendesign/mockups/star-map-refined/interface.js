(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = $('app');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layerState = {territories:true, routes:true, labels:false, fleets:true, animation:!reduced};
  const bookmarks = new Set();
  let currentSystem, currentPlanet = 0, orrery, toastTimer, currentModule = 'map';
  const planetKinds = ['类地行星','岩石行星','气态巨星','冰环行星','小行星群'];
  const planetBaseNames = ['天穹一号','赤砂二号','云海三号','星环四号','碎星带'];
  const modules = {
    fleet: {title:'舰队', en:'FLEET COMMAND', icon:'fleet',rows:[['第一远征舰队','天穹星系 · 旗舰编队','待命','fleet'],['深空巡航编队','晨曦航道 · 护卫编队','巡航','route'],['星际运输编队','帝国贸易航线','航行中','cube']]},
    civilization: {title:'文明',en:'IMPERIAL WORLDS',icon:'city',rows:[['天穹首都','核心世界 · 行政中枢','首都','city'],['晨曦工业区','轨道船坞 · 重工业基地','繁荣','ore'],['青岚殖民地','海洋世界 · 外环殖民地','发展中','globe']]},
    technology: {title:'科技',en:'RESEARCH DIRECTORATE',icon:'network',rows:[['跃迁理论','物理学 · 星际航行','III','network'],['轨道工程','工程学 · 巨型结构','IV','cube'],['生态适应','生命科学 · 星球改造','II','leaf']]},
    resources: {title:'资源',en:'RESOURCE NETWORK',icon:'resources',rows:[['金属','工业储备 · 主要产区：晨曦','48%','ore'],['晶体','战略储备 · 主要产区：黑曜','42%','crystal'],['能源','供能网络 · 星系覆盖','57%','power']]},
    strategy: {title:'战略',en:'STRATEGIC OVERVIEW',icon:'strategy',rows:[['帝国核心领土','天穹星系 · 内环防御网','安全','shield'],['北部边界','曙光联邦 · 外交接触区','中立','triangle'],['东部边界','赤焰联盟 · 边境监测区','警戒','strategy']]},
    diplomacy: {title:'外交',en:'DIPLOMATIC CHANNELS',icon:'diplomacy',rows:[['曙光联邦','金色疆域 · 联邦议会','中立','faction'],['苍翠共同体','绿色疆域 · 共同体议会','友好','leaf'],['星渊教团','紫色疆域 · 未知信仰','未知','explore']]},
    reports: {title:'情报',en:'INTELLIGENCE ARCHIVE',icon:'report',rows:[['外围星域测绘','远航星系 · 导航数据库','已归档','globe'],['银心异常信号','流光星系 · 深空扫描','待分析','explore'],['边境巡航记录','天狼星系 · 帝国巡航队','已接收','fleet']]}
  };
  function showToast(text) {
    clearTimeout(toastTimer); $('toast').textContent=text; $('toast').classList.add('show');
    toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2000);
  }
  function hideTip(){ $('tooltip').classList.remove('show'); $('homeTip').hidden=true; }
  function showHomeTip(kind,x,y) {
    $('tooltip').classList.remove('show');
    const tip=$('homeTip'),planet=kind==='planet';
    tip.querySelector('b').textContent=planet?'◆ 天穹一号':'◆ 天穹星系';
    tip.querySelector('small').textContent=planet?'类地行星 · 1:1:1':'1:1 · G2 V 型 · 母星所在';
    tip.querySelector('.home-tip-tag').textContent='银河帝国';
    tip.hidden=false;
    tip.style.left=Math.max(10,Math.min(app.clientWidth-tip.offsetWidth-10,x+18))+'px';
    tip.style.top=Math.max(10,Math.min(app.clientHeight-tip.offsetHeight-10,y+16))+'px';
  }
  function isHomePlanet(target) { return target.matches('[data-planet="0"]')&&currentSystem?.id==='tianqiong'; }
  function showTip(text,x,y,heading) {
    $('homeTip').hidden=true;
    const tip=$('tooltip'); tip.replaceChildren();
    if(heading){const b=document.createElement('b');b.textContent=heading;tip.appendChild(b);}
    tip.appendChild(document.createTextNode(text));
    tip.style.left=Math.max(8,Math.min(app.clientWidth-tip.offsetWidth-12,x+15))+'px';tip.style.top=Math.max(8,Math.min(app.clientHeight-tip.offsetHeight-12,y+18))+'px';tip.classList.add('show');
  }
  function local(e){const r=app.getBoundingClientRect();return{x:(e.clientX-r.left)*app.clientWidth/r.width,y:(e.clientY-r.top)*app.clientHeight/r.height};}
  app.addEventListener('pointerover',e=>{const target=e.target.closest('[data-tip]');if(target){const p=local(e);if(isHomePlanet(target))showHomeTip('planet',p.x,p.y);else showTip(target.dataset.tip,p.x,p.y);}});
  app.addEventListener('pointerout',e=>{if(e.target.closest('[data-tip]'))hideTip();});
  app.addEventListener('pointerdown',hideTip);
  app.addEventListener('focusin',e=>{const target=e.target.closest('[data-tip]');if(target){const r=target.getBoundingClientRect(),a=app.getBoundingClientRect(),x=(r.left-a.left)*app.clientWidth/a.width,y=(r.bottom-a.top)*app.clientHeight/a.height;if(isHomePlanet(target))showHomeTip('planet',x,y);else showTip(target.dataset.tip,x,y);}});
  app.addEventListener('focusout',hideTip);
  function showInspector(show){$('inspector').classList.toggle('closed',!show);$('inspector').inert=!show;$('reopenInspector').classList.toggle('visible',!show);if(!show)closeMenu();hideTip();}
  function updateSelection(system){
    if(!system)return;currentSystem=system;
    $('systemName').textContent=system.name;
    $('systemOwner').textContent=system.owner==='帝国核心领土'?'核心领土':system.owner;
    $('heroLabel').textContent=system.type+' · '+(['G2 V','K1 V','A3 V','F5 V'][system.index%4]);
    $('systemCode').textContent='SYS / '+String(system.index+1).padStart(4,'0');
    $('coordinate').textContent='X '+(system.x*120-60).toFixed(2)+' / Y '+(system.y*120-60).toFixed(2);
    $('favoriteBtn').setAttribute('aria-pressed',bookmarks.has(system.id));
    $('favoriteBtn').dataset.tip=bookmarks.has(system.id)?'取消关注':'关注星系';
    showInspector(true);setPlanet(0);updateMini();
  }
  const map=window.initGalaxyMap($('galaxy'),{
    onSelect:updateSelection,
    onHover(system,p){if(system?.id==='tianqiong'&&p)showHomeTip('system',p.x,p.y);else if(system&&p)showTip(system.owner+' · '+system.type,p.x,p.y,system.name);else hideTip();}
  });
  window.GalacticArt.drawHero($('systemHero'));
  document.querySelectorAll('.planet-button canvas').forEach((c,i)=>window.GalacticArt.drawPlanet(c,c.dataset.type,i===0));
  orrery=window.GalacticArt.initOrrery($('orrery'),{onSelect:setPlanet});
  const artObserver = new ResizeObserver(() => {
    window.GalacticArt.drawHero($('systemHero'));
    document.querySelectorAll('.planet-button canvas').forEach((c,i)=>window.GalacticArt.drawPlanet(c,c.dataset.type,i===currentPlanet));
    map.drawMini($('minimapBackground')); updateMini();
  });
  artObserver.observe($('systemHero')); artObserver.observe($('minimap'));

  function getPlanetName(index){if(!currentSystem||currentSystem.id==='tianqiong')return planetBaseNames[index];return index===4?'外围碎星带':currentSystem.name.replace(/星系$/,'')+' '+['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][index];}
  function setPlanet(index){
    currentPlanet=Number(index);const name=getPlanetName(currentPlanet);
    document.querySelectorAll('.planet-button').forEach((button,i)=>{const active=i===currentPlanet;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);button.dataset.tip=getPlanetName(i)+' · '+planetKinds[i];button.setAttribute('aria-label',button.dataset.tip);const c=button.querySelector('canvas');window.GalacticArt.drawPlanet(c,c.dataset.type,active);});
    $('planetName').textContent=name+' · '+planetKinds[currentPlanet];if(orrery)orrery.setSelected(currentPlanet);
    const values=[[48,42,65,57,25],[75,51,14,32,9],[14,28,8,91,6],[28,62,12,46,8],[92,78,0,18,0]][currentPlanet];
    const labels=['金属储量','晶体储量','生态适宜度','能源供应','人口容量'];
    document.querySelectorAll('.resource').forEach((r,i)=>{r.querySelector('.meter').style.setProperty('--value',values[i]+'%');r.dataset.tip=labels[i]+' · '+values[i]+'%';r.setAttribute('aria-label',r.dataset.tip);});
  }
  document.querySelectorAll('[data-planet]').forEach(b=>b.addEventListener('click',()=>setPlanet(b.dataset.planet)));
  function renderModule(key){
    const data=modules[key];if(!data)return;
    $('moduleTitle').textContent=data.title;$('moduleSubtitle').textContent=data.en;$('moduleIcon').setAttribute('href','#i-'+data.icon);$('moduleRows').replaceChildren();
    data.rows.forEach((row,i)=>{
      const button=document.createElement('button');button.className='module-row'+(i===0?' active':'');button.setAttribute('aria-pressed',i===0);
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+row[3]);svg.appendChild(use);
      const copy=document.createElement('div'),title=document.createElement('h3'),detail=document.createElement('p'),status=document.createElement('span');title.textContent=row[0];detail.textContent=row[1];status.textContent=row[2];status.className='row-status';copy.append(title,detail);button.append(svg,copy,status);
      button.addEventListener('click',()=>{
        $('moduleRows').querySelectorAll('.module-row').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button);});
        if(key==='fleet'){
          const route=map.getRoutes().find(r=>r.name===row[0]);
          if(route){map.focusSystem(route.to);map.highlightRoute(route.id);syncLayer('routes',true);syncLayer('fleets',true);}
          else map.focusSystem('tianqiong');
          updateMini();
        }
      });$('moduleRows').appendChild(button);
    });
  }
  function openModule(key){
    currentModule=key;const isMap=key==='map';
    document.querySelectorAll('.nav-tab,.rail-button[data-module],.top-tools [data-module]').forEach(b=>{const active=b.dataset.module===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
    $('breadcrumb').textContent=isMap?'星图':modules[key]?.title||'星图';
    $('modulePanel').hidden=isMap;closeSearch();closeSettings();closeMenu();
    if(!isMap)renderModule(key);
  }
  document.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.module)));
  $('closeModule').addEventListener('click',()=>openModule('map'));
  function syncLayer(name,value){
    layerState[name]=Boolean(value);map.toggleLayer(name,layerState[name]);
    document.querySelectorAll('[data-layer="'+name+'"]').forEach(b=>b.setAttribute('aria-pressed',layerState[name]));
    document.querySelectorAll('[data-setting="'+name+'"]').forEach(b=>b.setAttribute('aria-checked',layerState[name]));
    if(name==='routes')document.querySelector('[data-command="route"]').setAttribute('aria-pressed',layerState[name]);
    if(name==='animation'){app.classList.toggle('no-animation',!value);if(orrery.setAnimation)orrery.setAnimation(value);}
  }
  Object.entries(layerState).forEach(([name,value])=>syncLayer(name,value));
  $('densityRange').addEventListener('input',e=>{const value=Number(e.target.value);$('densityValue').value=value+'%';map.setAppearance({density:value/100});map.drawMini($('minimapBackground'));});
  document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-palette]').forEach(p=>p.setAttribute('aria-pressed',p===b));
    map.setAppearance({palette:b.dataset.palette});map.drawMini($('minimapBackground'));
  }));
  document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>syncLayer(b.dataset.layer,!layerState[b.dataset.layer])));
  document.querySelectorAll('[data-setting]').forEach(b=>b.addEventListener('click',()=>syncLayer(b.dataset.setting,!layerState[b.dataset.setting])));
  function closeSettings(){$('settingsPanel').hidden=true;$('settingsBtn').setAttribute('aria-expanded','false');}
  $('settingsBtn').addEventListener('click',()=>{const next=$('settingsPanel').hidden;closeSearch();closeMenu();$('settingsPanel').hidden=!next;$('settingsBtn').setAttribute('aria-expanded',next);});
  $('closeSettings').addEventListener('click',closeSettings);
  $('fullscreenBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){showToast('当前窗口不支持全屏，可按浏览器 F11 键');}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreenBtn').textContent=document.fullscreenElement?'退出全屏':'全屏查看';});
  $('closeInspector').addEventListener('click',()=>{showInspector(false);$('reopenInspector').focus({preventScroll:true});});
  $('reopenInspector').addEventListener('click',()=>{showInspector(true);$('closeInspector').focus({preventScroll:true});});
  function home(){map.reset();map.selectSystem('tianqiong');openModule('map');updateMini();}
  function reset(){map.reset();updateMini();}
  $('homeBtn').addEventListener('click',home);$('menuHome').addEventListener('click',home);
  $('resetBtn').addEventListener('click',reset);$('minimap').addEventListener('click',reset);
  $('focusBtn').addEventListener('click',()=>{if(currentSystem)map.focusSystem(currentSystem.id);updateMini();});
  $('zoomIn').addEventListener('click',()=>{map.zoomBy(1.2);updateMini();});$('zoomOut').addEventListener('click',()=>{map.zoomBy(1/1.2);updateMini();});
  $('galaxy').addEventListener('wheel',()=>{updateMini();hideTip();},{passive:true});$('galaxy').addEventListener('pointerup',updateMini);$('galaxy').addEventListener('dblclick',updateMini);
  function updateMini(){const state=map.getState();$('zoomReadout').textContent=Math.round(state.scale*100)+'%';const mini=app.querySelector('.mini-window');const w=43/state.scale,h=51/state.scale;mini.style.width=w+'%';mini.style.height=h+'%';mini.style.left=(51.5-w/2-state.panX/app.clientWidth*100/state.scale)+'%';mini.style.top=(50.5-h/2-state.panY/app.clientHeight*100/state.scale)+'%';if(currentSystem){const target=app.querySelector('.mini-target');target.style.left=currentSystem.x*100+'%';target.style.top=currentSystem.y*100+'%';}}
  function favorite(){if(!currentSystem)return;const id=currentSystem.id;if(bookmarks.has(id)){bookmarks.delete(id);showToast('已取消关注 · '+currentSystem.name);}else{bookmarks.add(id);showToast('已关注 · '+currentSystem.name);}$('favoriteBtn').setAttribute('aria-pressed',bookmarks.has(id));$('favoriteBtn').dataset.tip=bookmarks.has(id)?'取消关注':'关注星系';}
  $('favoriteBtn').addEventListener('click',favorite);
  function closeMenu(){$('contextMenu').hidden=true;$('moreBtn').setAttribute('aria-expanded','false');}
  $('moreBtn').addEventListener('click',()=>{const next=$('contextMenu').hidden;$('contextMenu').hidden=!next;$('moreBtn').setAttribute('aria-expanded',next);
    if(next){const button=$('moreBtn').getBoundingClientRect(),bounds=app.getBoundingClientRect(),menu=$('contextMenu');menu.style.top=Math.max(100,button.top-bounds.top-menu.offsetHeight-8)+'px';menu.style.right=Math.max(12,bounds.right-button.right)+'px';}
  });
  $('menuFocus').addEventListener('click',()=>{if(currentSystem)map.focusSystem(currentSystem.id);closeMenu();updateMini();});$('menuFavorite').addEventListener('click',()=>{favorite();closeMenu();});
  document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{const command=b.dataset.command;if(command==='route'){syncLayer('routes',!layerState.routes);b.setAttribute('aria-pressed',layerState.routes);}else openModule(command);}));
  function closeSearch(){$('searchPanel').hidden=true;$('searchBtn').setAttribute('aria-expanded','false');}
  function openSearch(){const show=$('searchPanel').hidden;closeSettings();closeMenu();$('searchPanel').hidden=!show;$('searchBtn').setAttribute('aria-expanded',show);if(show){renderSearch();$('searchInput').focus();}}
  function renderSearch(){const query=$('searchInput').value.trim().toLowerCase();const systems=map.getSystems().filter(s=>s.name.includes(query)||s.id.includes(query)||s.owner.includes(query));$('searchResults').replaceChildren();systems.slice(0,12).forEach(s=>{const button=document.createElement('button');button.className='search-result';const dot=document.createElement('i'),name=document.createElement('span'),info=document.createElement('small');dot.style.setProperty('--star-color',s.color);name.textContent=s.name;info.textContent=s.type;button.append(dot,name,info);button.addEventListener('click',()=>{map.focusSystem(s.id);closeSearch();updateMini();});$('searchResults').appendChild(button);});if(!systems.length){const p=document.createElement('p');p.className='search-empty';p.textContent='未找到匹配的星系';$('searchResults').appendChild(p);}}
  $('searchBtn').addEventListener('click',openSearch);$('closeSearch').addEventListener('click',closeSearch);$('searchInput').addEventListener('input',renderSearch);
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#settingsPanel,#settingsBtn'))closeSettings();if(!e.target.closest('#contextMenu,#moreBtn'))closeMenu();});
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeSettings();closeSearch();closeMenu();openModule('map');hideTip();return;}
    if(e.target.matches('input,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.toLowerCase();if(k==='h'){home();}else if(k==='r'){reset();}else if(k==='f'){e.preventDefault();openSearch();}else if(e.key==='+'||e.key==='='){map.zoomBy(1.2);updateMini();}else if(e.key==='-'){map.zoomBy(1/1.2);updateMini();}else if(e.target===$('galaxy')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){
      e.preventDefault();const list=map.getSystems(),i=list.findIndex(s=>s.id===currentSystem?.id);map.selectSystem(list[(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length].id);
    }
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted){map.destroy();orrery.destroy();artObserver.disconnect();}});
  map.selectSystem('tianqiong');openModule('map');map.drawMini($('minimapBackground'));
  if(matchMedia('(max-width: 640px)').matches)showInspector(false);
})();
