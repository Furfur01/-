/* ASTRAL bridge: the renderer owns cameras; the parent owns the game session.
   Public map records never include enemy resources, defenses or stationed ships. */
(() => {
  'use strict';
  let snapshot=null, selectedPlanet=null, catalog=null, galaxy=1, selectionId=null, mapSignature='';
  let active=true, initialized=false, requested='';
  const esc=escapeHTML;
  const pos=p=>p?.position||[];
  const sameSystem=p=>pos(p)[0]===galaxy&&pos(p)[1]===activeSystem.id+1;
  const own=p=>!!snapshot&&p?.owner===snapshot.player.id;
  const occupied=p=>!!(p?.owner||p?.npc);
  const resourceSummary=p=>p?.moon?'月球设施':catalog?.planetTypes?.[p?.biome]?.description||'类型待探明';
  const send=message=>{if(parent!==window)parent.postMessage(message,location.origin)};
  const getHome=()=>snapshot?.planets.find(p=>p.id===snapshot.player.home)||selectedPlanet;
  const pretty=value=>Number.isFinite(Number(value))?Math.floor(Number(value)).toLocaleString('zh-CN'):'—';
  const realTarget=()=>PLANET_DATA[state.planet]?.real;
  function notifySystem(force=false){
    const key=galaxy+':'+(activeSystem.id+1);
    if(snapshot&&(force||requested!==key)){requested=key;send({type:'astral-system',coordinates:[galaxy,activeSystem.id+1]})}
  }
  function updateSystems(){
    const bySystem=new Map();for(const p of snapshot?.map||[]){if(p.moon||pos(p)[0]!==galaxy)continue;const key=pos(p)[1];if(!bySystem.has(key))bySystem.set(key,[]);bySystem.get(key).push(p)}
    for(const s of systems){
      const planets=bySystem.get(s.id+1)||[];
      const owned=planets.find(own);
      s.name=owned?owned.name+'星系':'星系 '+pad(s.id+1,3);
      s.code=galaxy+' : '+(s.id+1);s.known=planets.length>0;s.danger=false;
    }
  }
  function applyMap(){
    updateSystems();
    const entries=snapshot?.map.filter(sameSystem)||[];
    PLANET_DATA.forEach((p,index)=>{
      const position=[galaxy,activeSystem.id+1,index+1];
      let record=entries.find(item=>!item.moon&&pos(item)[2]===index+1);
      if(selectedPlanet?.moon&&sameSystem(selectedPlanet)&&pos(selectedPlanet)[2]===index+1)record=selectedPlanet;
      if(record){const full=snapshot.planets.find(item=>item.id===record.id);record={...record,...full};record.isHome=record.id===snapshot.player.home}
      const appearance=record?.moon?'moon':record?.biome;
      p.originalVisual??={ring:p.ring,atmos:p.atmos};p.textureIndex=({terrestrial:7,mercury:0,mars:2,gas:4,moon:1})[appearance]??index;p.ring=appearance?false:p.originalVisual.ring;p.atmos=({terrestrial:'#71b5c7',mercury:'#c2a185',mars:'#be8164',gas:'#c5b38c',moon:'#7b9cab'})[appearance]||p.originalVisual.atmos;
      p.npcSkin=record?.npc&&!record.moon?(Object.hasOwn(NPC_PLANET_ASSETS,record.npcSkin)?record.npcSkin:17):null;if(p.npcSkin){p.atmos='#6fbfd6';p.ring=false;}
      p.real=record||(index===15?{name:'小行星带',position,kind:'belt'}:null);
      p.name=record?.name||(index===15?'小行星带':'未探明天体');
      p.en='[ '+position.join(' : ')+' ]';p.side=own(record)?'owned':occupied(record)?'hostile':'unknown';
      p.type=index===15?'小行星带':record?.moon?'月球':record?.npc?'野怪据点':catalog?.planetTypes?.[record?.biome]?.name||(record?'行星':'未探明天体');
      p.status=own(record)?'本方领地 · 数据已同步':occupied(record)?(record.ownerName||'守备舰队')+' · 驻军未侦察':index===15?'深空目标 · 可派遣探索':record?'无人占领 · 可殖民':'正在同步星系资料';
      p.desc=own(record)?resourceSummary(record)+'。进入该星球基地管理建筑与生产。':occupied(record)?(record.npc?'野怪据点。':resourceSummary(record)+'。')+'舰队和防御需要实际侦察。':index===15?'派遣舰队执行小行星采矿或银河中心探索。':record?resourceSummary(record)+'。殖民后保留这颗星球的矿产与地形。':'正在同步此轨道的真实星球资料。';
    });
    const signature=PLANET_DATA.map(p=>p.name+'|'+p.real?.id+'|'+p.side+'|'+p.textureIndex+'|'+p.npcSkin).join(';');
    if(signature!==mapSignature){mapSignature=signature;delete $('planet-list').dataset.mode}
  }
  function renderPanel(){
    const p=PLANET_DATA[state.planet],target=p.real,s=systems[state.system];
    $('special-content').replaceChildren();$('primary-action').disabled=false;$('secondary-action').disabled=false;
    $('secondary-action').hidden=state.level==='galaxy';
    $('object-status').style.color=p.side==='owned'?'var(--accent)':p.side==='hostile'?'var(--danger)':'var(--muted)';
    $('status-emblem').style.color=p.side==='hostile'?'var(--danger)':'var(--accent)';
    setHTML('status-emblem',p.side==='hostile'?skull:emblem);
    if(state.level==='galaxy'){
      const entries=snapshot?.map.filter(t=>!t.moon&&pos(t)[0]===galaxy&&pos(t)[1]===s.id+1)||[];
      setText('object-category','恒星系 / SYSTEM');setText('object-number',pad(s.id+1,3));setText('object-title',s.name);setText('object-subtitle','[ '+s.code+' ]');
      setText('object-status',entries.some(own)?'本方殖民地所在星系':s.known?'已同步公开星图':'待同步 · 可进入');
      setText('object-description','选择恒星系查看真实星球、归属与舰队目的地。银河位置和连线用于导航示意。');
      stats([['银河',galaxy],['恒星系',s.id+1],['已知星球',entries.length],['本方星球',entries.filter(own).length]]);
      setHTML('primary-action','进入恒星系 <span>↗</span>');$('secondary-action').disabled=true;setText('secondary-action','');setText('panel-footnote','点击恒星自动居中；滚轮朝选中的目标缩放。');return true;
    }
    setText('object-category',state.planet===15?'深空目标 / DEEP SPACE':target?.moon?'月球 / MOON':'行星档案 / PLANET');
    setText('object-number',pad(state.planet+1));setText('object-title',p.name);setText('object-subtitle',p.en);setText('object-status',snapshot?p.status:'等待指挥中心连接');setText('object-description',p.desc);
    let rows;
    if(state.planet===15)rows=[['目标类型','小行星带'],['轨道','16'],['采矿停留','1–4 小时'],['任务结果','以实际报告为准']];
    else if(own(target)){const type=catalog?.planetTypes?.[target.biome];rows=[['天体',target.moon?'月球':type?.name||'行星'],['本地矿产',target.moon?'无':type?.specialty==null?'金属 / 晶体 / 气体':['金属','晶体','气体'][type.specialty]+' ×3'],['已用方圆',pretty(target.usedFields)+' / '+pretty(target.fields)],['资源库存',(target.resources||[]).map(pretty).join(' / ')]];}
    else rows=[['类型',p.type],['归属',occupied(target)?target.ownerName||'守备舰队':target?'无人占领':'未同步'],['驻守舰队 / 防御',occupied(target)?'未侦察':'—'],['残骸',target?.debris?target.debris.map(pretty).join(' / '):'—']];
    stats(rows.map(row=>row.map(esc)));
    if(state.level==='system'){
      setHTML('primary-action',state.planet===15?'抵近小行星带 <span>↗</span>':'进入轨道视角 <span>↗</span>');
      setText('secondary-action',own(target)?'进入殖民地':state.planet===15?'派遣探索舰队':occupied(target)?'准备侦察':'准备殖民');
    }else{
      setHTML('primary-action',own(target)?'进入殖民地 <span>↓</span>':state.planet===15?'派遣采矿舰队 <span>↗</span>':occupied(target)?'准备攻击 <span>↗</span>':'准备殖民 <span>↗</span>');
      setText('secondary-action',own(target)?'返回恒星系总览':state.planet===15?'派遣探索舰队':occupied(target)?'准备侦察':'返回恒星系总览');
    }
    if(!snapshot||!target){$('secondary-action').disabled=true;if(state.level!=='system')$('primary-action').disabled=true}
    const moons=snapshot?.map.filter(item=>item.moon&&sameSystem(item)&&pos(item)[2]===state.planet+1)||[];
    if(moons.length){
      const fragment=document.createDocumentFragment();
      for(const moon of moons){const button=document.createElement('button');button.className='moon-link';button.textContent='◐ '+moon.name;button.onclick=()=>{
        const full=snapshot.planets.find(item=>item.id===moon.id);if(full)send({type:'astral-home',planetId:moon.id});else send({type:'astral-task',target:moon,task:'spy'});
      };fragment.appendChild(button)}
      $('special-content').appendChild(fragment);
    }
    setText('panel-footnote',own(target)?'星球名称、资源和建筑来自现有存档。':'舰队按钮打开派遣准备页，确认前不会执行任务。');
    return true;
  }
  function renderUI(){
    document.body.classList.toggle('astral-suspended',!active);
    const gal=state.level==='galaxy',p=PLANET_DATA[state.planet];
    $('galaxy-select').hidden=!gal;$('galaxy-select').value=String(galaxy);
    setText('scene-title',gal?'银河 '+galaxy:state.level==='system'?activeSystem.name:p.name);
    setText('scene-description',gal?'沿着星光，找到下一处目的地。':state.level==='system'?'真实坐标，与每一个可以抵达的世界。':p.type+' · '+p.en);
    setHTML('scene-tags',gal?'<span><i></i>银河 '+galaxy+'</span><span>499 个恒星系</span>':'<span><i></i>坐标 '+galaxy+' : '+(activeSystem.id+1)+'</span><span>15 个星球轨道</span><span class="warm">1 处探索区域</span>');
    setText('scale-note','星球与轨道采用展示比例');
    setText('control-hint',gal?'拖拽平移 · 滚轮 / 双指缩放 · 双击恒星进入':'拖拽环视 · 滚轮 / 双指连续缩放 · Esc 返回上级');
    const crumb=$('breadcrumbs').querySelector('[data-nav="galaxy"]');if(crumb)crumb.innerHTML=starIcon+'银河 '+galaxy;
    const legend=$('galaxy-legend');legend.innerHTML='<span><i class="owned"></i> 当前选中</span><span><i class="unknown"></i> 可进入星系</span><b>499 个恒星系</b>';
  }
  function task(task){
    const target=realTarget();if(!snapshot||!target){toast('星系资料尚未同步，请稍后');return true}
    send({type:'astral-task',target,task});return true;
  }
  function primary(){
    if(state.level==='system'||state.level==='galaxy')return false;
    const target=realTarget();if(own(target)){send({type:'astral-home',planetId:target.id});return true}
    return task(state.planet===15?'mine':occupied(target)?'attack':'colonize');
  }
  function secondary(){
    if(state.level==='galaxy')return true;
    const target=realTarget();
    if(own(target)){if(state.level==='system')send({type:'astral-home',planetId:target.id});else enterSystem();return true}
    if(state.planet===15)return task('explore');
    if(occupied(target))return task('spy');
    if(state.level==='system')return task('colonize');
    enterSystem();return true;
  }
  function home(){
    const planet=getHome();if(!planet){toast('正在等待指挥中心连接');return true}
    galaxy=pos(planet)[0];activeSystem=systems[pos(planet)[1]-1];state.system=activeSystem.id;state.planet=pos(planet)[2]-1;
    selectedPlanet=planet;systemViewMemory=null;galaxyViewMemory=null;applyMap();enterSystem(activeSystem.id);return true;
  }
  function receive(event){
    if(event.source!==parent||event.origin!==location.origin)return;
    const message=event.data;if(!message||typeof message!=='object')return;
    if(message.type==='empire-visibility'){active=message.active===true;lastTime=performance.now();document.body.classList.toggle('astral-suspended',!active);return}
    if(message.type!=='empire-state'||!message.state?.player||!Array.isArray(message.state.planets)||!Array.isArray(message.state.map))return;
    snapshot=message.state;catalog=message.catalog||null;
    const planet=message.planet||snapshot.planets.find(p=>p.id===snapshot.player.home)||snapshot.planets[0];
    const externalChange=planet&&planet.id!==selectionId;
    if(externalChange){selectedPlanet=planet;selectionId=planet.id;galaxy=pos(planet)[0];activeSystem=systems[pos(planet)[1]-1];state.system=activeSystem.id;state.planet=pos(planet)[2]-1;systemViewMemory=null;galaxyViewMemory=null;state.level='system';state.renderSurface=false;flight=null;state.flying=false}
    else if(selectedPlanet)selectedPlanet=snapshot.planets.find(p=>p.id===selectedPlanet.id)||selectedPlanet;
    applyMap();
    if(externalChange&&cam){cam=systemCam();goal=copyCam(cam)}
    updateUI();notifySystem();
  }
  function ready(){
    initialized=true;applyMap();updateUI();
    $('galaxy-select').onchange=e=>{galaxy=Number(e.target.value);requested='';systemViewMemory=null;galaxyViewMemory=null;applyMap();updateUI()};
    document.querySelector('.top-status .mono').textContent='LOCAL UNIVERSE';
    document.querySelector('.help-note').textContent='各恒星系随机分布类地星、金属岩星、晶体岩星和气态巨星。类型随星球固定，进入本方星球管理对应基地；无人星球需先殖民，敌方与野怪需侦察。点击恒星自动居中，滚轮朝选中目标缩放。';
    document.querySelector('.help-dialog>p').textContent='星球、恒星系与银河连续导航。舰队任务在指挥中心确认后执行。';
    document.querySelector('.footer-right').innerHTML='<span id="fps-label" class="mono">LOCAL / WEBGL 2</span><i></i><span>银河帝国</span>';
    const details=document.createElement('button');details.id='panel-details';details.textContent='详情';details.setAttribute('aria-expanded','false');details.onclick=()=>{const expanded=$('object-panel').classList.toggle('expanded');details.setAttribute('aria-expanded',String(expanded));details.textContent=expanded?'收起':'详情'};$('object-panel').appendChild(details);
    send({type:'astral-ready'});
  }
  window.AstralEmpire={get active(){return active},get galaxy(){return galaxy},get snapshot(){return snapshot},get catalog(){return catalog},get initialized(){return initialized},hasHomeSystem:()=>!!getHome()&&pos(getHome())[0]===galaxy,homeSystemId:()=>{const p=getHome();return p&&pos(p)[0]===galaxy?pos(p)[1]-1:15},renderPanel,renderUI,primary,secondary,home,enterSystem:()=>{applyMap();notifySystem(true)},ready};
  addEventListener('message',receive);
  // Clear the reference artwork's demonstration names before its texture loading completes.
  applyMap();
})();
