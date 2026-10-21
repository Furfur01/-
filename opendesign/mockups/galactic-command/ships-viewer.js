import * as THREE from 'three';
import '../../shared/space-sky.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createShipModel,disposeShip,legacyIds,ShipModelCache} from '../../../scripts/three-flight/shared-models.js';
import {prepareShipPreviewMaterials} from '../../../scripts/three-flight/ship-preview-materials.js';
import {createWeaponPreview} from './weapon-preview.js';
import {createFiringRange} from './ship-range.js';
import {shipLengths} from '../../../game/ship-weapon-mounts.mjs';

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reviewMode=location.pathname.endsWith('/ships-review.html');
const modelVersion=()=>reviewMode?$('#model-version').value:'new';
const fields={strength:'基础舰体',shield:'基础护盾',attack:'基础攻击',speed:'战略基础航速',cargo:'货舱',fuel:'基础燃耗'};
const statSource=u=>[u.statsLabel,u.statsNote,u.economyLabel,'科技加成前；溅射与暴击采用单机规则。'].filter(Boolean).join(' ');
const stage=$('#stage'),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;stage.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,500),controls=new OrbitControls(camera,renderer.domElement);
new THREE.TextureLoader().load(SpaceSky.panorama,texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;scene.background=texture;scene.backgroundIntensity=.7;});
const weaponPreview=createWeaponPreview(scene);
const rangeMode=new URLSearchParams(location.search).get('mode')==='range',firingRange=rangeMode?createFiringRange(scene,weaponPreview):null;
if(rangeMode){document.body.classList.add('range-mode');document.title='新版舰船靶场 · 银河帝国';$('.header-title').textContent='舰船试射靶场';}
controls.enableDamping=true;controls.autoRotateSpeed=.6;
scene.add(new THREE.HemisphereLight(0xd7edf7,0x263743,2));
for(const[color,power,pos]of[[0xffead9,3,[-8,10,-6]],[0x8bdfff,2,[6,4,6]]]){const light=new THREE.DirectionalLight(color,power);light.position.set(...pos);scene.add(light);}
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.5;room.dispose();pmrem.dispose();
let ships=[],units={},tech={},current=null,selected=null,fitDistance=15,wireframe=false,active=true,selectionToken=0,comparing=false;
const displayName=s=>units[s.id]?.name||(s.id==='Reaper'?'收割者':s.name);
const target=new THREE.Vector3();
const modelCache=new ShipModelCache();
const make=id=>prepareShipPreviewMaterials(modelCache.acquire(id));
window.addEventListener('pagehide',()=>{weaponPreview.stop();renderer.setAnimationLoop(null);if(current)modelCache.release(current);modelCache.dispose();controls.dispose();renderer.dispose();});
const number=n=>n==null?'待取得':n.toLocaleString('en-US');
function inspect(view='perspective'){
  const direction=new THREE.Vector3(...({front:[0,0,-1],side:[1,0,0],top:[0,1,.000001],perspective:[-1,.8,-1.2]}[view]));camera.position.copy(target).add(direction.normalize().multiplyScalar(fitDistance));controls.target.copy(target);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(!rangeMode&&current?.userData.revision&&modelVersion()==='new'){
    current.updateMatrixWorld(true);camera.updateMatrixWorld(true);const bounds=new THREE.Box2();const v=new THREE.Vector3();
    current.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(camera.matrixWorldInverse);bounds.expandByPoint(new THREE.Vector2(v.x,v.y));}}});
    const aspect=stage.clientWidth/stage.clientHeight,extent=Math.max(Math.abs(bounds.min.y),Math.abs(bounds.max.y),Math.abs(bounds.min.x)/aspect,Math.abs(bounds.max.x)/aspect)*1.2;camera.top=extent;camera.bottom=-extent;camera.right=extent*aspect;camera.left=-extent*aspect;camera.zoom=1;camera.updateProjectionMatrix();
  }
}
function fit(){if(!current)return;const box=new THREE.Box3().setFromObject(current);if(firingRange?.target)box.union(new THREE.Box3().setFromObject(firingRange.target));const size=box.getSize(new THREE.Vector3());box.getCenter(target);const aspect=stage.clientWidth/stage.clientHeight,half=size.length()*.56/Math.min(1,aspect);camera.top=half;camera.bottom=-half;camera.right=half*aspect;camera.left=-half*aspect;camera.zoom=1;fitDistance=size.length()*2;camera.near=Math.max(.001,fitDistance/1000);camera.far=fitDistance*8;camera.updateProjectionMatrix();controls.minZoom=.3;controls.maxZoom=4;inspect();}
function damageRows(entries,incoming=false){return entries.map(([id,rate])=>`<div class="counter"><button data-select="${esc(id)}">${esc(units[id]?.name||id)}</button><b>×${rate} / ${Math.round((incoming?units[id]?.criticalChances?.[selected]||0:units[selected]?.criticalChances?.[id]||0)*1e4)/100}%</b></div>`).join('')||'<p>无溅射目标</p>';}
function renderReviewData(){
  const ship=ships.find(s=>s.id===selected),u=units[selected];if(!ship)return;
  renderer.toneMappingExposure=current?.userData.revision&&modelVersion()==='new'?.94:1.3;
  if(current?.userData.referenceGeometry)renderer.toneMappingExposure=.85;
  scene.environmentIntensity=current?.userData.referenceGeometry?.22:.5;
  $('#model-version option[value="new"]').textContent=current?.userData.preserved?'原有风格基准（保留）':current?.userData.revision==='fleet-sculpted-02'?'异形装甲与武器 02':'全舰队精修 01';
  if(selected==='Battleship'&&modelVersion()==='new')$('#model-version option[value="new"]').textContent='战列舰低矮炮座 03';
    if(current?.userData.rebuiltFromScratch)$('#model-version option[value="new"]').textContent=!ship.reference?'概念模型重建 01':current.userData.referenceViews==='interpreted'?'原图全新重建 01':'三视图全新重建 01';
    if(current?.userData.detailPass)$('#model-version option[value="new"]').textContent='异形装甲 · 结构细化 02';
  $('#model-title').textContent=ship.name;$('#model-english').textContent=ship.id.replaceAll('_',' ').toUpperCase();$('#model-index').textContent=String(ships.indexOf(ship)+1).padStart(2,'0')+' / '+ships.length;
  $('#identity').textContent=ship.apkId?'type_'+ship.apkId+' · '+ship.constant:'旧版截图舰种 · APK 身份未确认';
  $('#identity').textContent+=ship.spinalMount?' · 内置同轴重炮':' · 无同轴大炮';
  const loadout=current?.userData.weaponLayout;
  $('#weapon-fit-note').textContent=loadout?`${loadout.role} · ${loadout.primary} · ${loadout.pointDefense.length} 座近防炮${loadout.missiles?.length?` · ${loadout.missiles.length} 个导弹口`:""} · 舰长比例 ${shipLengths[selected]}。武器演示为视觉预览，不改变正式战斗结算。`:'';
  $('#weapon-demo').hidden=rangeMode||!current?.userData.weaponLayout||selected==='Annihilator';
  $('#enter-range').href=(rangeMode?'ships.html?ship=':'hangar-three.html?entry=direct-flight-01&ship=')+selected;$('#enter-range').textContent=rangeMode?'返回舰船档案 ↗':'进入靶场 ↗';
  $('#reference-image').hidden=!ship.reference;if(ship.reference)$('#reference-image').src='assets/ship-references/'+ship.reference.split('/').at(-1);
  $('#reference-image').alt=ship.name+' APK 原图';
  $('#ship-stats').innerHTML=Object.entries(fields).map(([k,name])=>`<div class="stat"><span>${name}</span><b>${number(u?.[k]??ship.stats[k])}</b></div>`).join('');
  $('#source-note').textContent=u?statSource(u):'社区基础资料；尚未开放制造。';
  $('#requirements').textContent=u?`金属 ${number(u.cost[0])} / 晶体 ${number(u.cost[1])} / 气体 ${number(u.cost[2])}。前置：${u.req.map(([id,n])=>(tech[id]?.name||id)+' '+n+'级').join('、')}${u.parts?'；外星部件 '+u.parts:''}`:'待取得服务器配置';
  $('#counters').innerHTML=u?'<p>溅射半径 '+number(u.splashRadius||0)+' · 暴击伤害 ×2'+'</p><p>暴击率 = 1 − 1 ÷ 倍率；倍率 0、1 均不暴击。</p><p>溅射倍率 / 暴击率 · 对以下目标</p>'+damageRows(Object.entries(u.splashMultipliers||{}))+'<p>受到以下单位的溅射倍率 / 暴击率</p>'+damageRows(Object.values(units).filter(x=>x.splashMultipliers?.[selected]>0).map(x=>[x.id,x.splashMultipliers[selected]]),true)+'<p class="source-note">倍率 ×0 免疫溅射和暴击，直击只受基础伤害；溅射随距离线性衰减。</p>':'<p>暂未开放</p>';
  if(selected==='Reaper')$('#counters').innerHTML+='<p>APK 已证实：免疫湮灭之星攻击，具有特殊攻击顺序（顺序细节未取得）。</p>';
  if(selected==='Annihilator')$('#counters').innerHTML+='<p>APK 已证实：进攻方在敌方同时有至少两种裂变者、深空吞噬者、噬能截击者、钛能守卫者时逐个引爆；无视护盾并造成群体伤害。Reaper 免疫。完整条件见下方原文。</p>';
  $('#model-description').textContent=ship.description||'APK 已确认舰种编号；未提取到对应说明。';$('#model-note').textContent=modelVersion()==='preserved'?'保留的现有模型，未删除或替换。此版本可能存在原图形状错配。':ship.reference?'APK 重建草案；隐藏面与厚度为补建。90% 形状相似为待验收目标，尚未标为达标。':'无对应 APK 原图，当前为概念模型，不能进行原图相似度验收。';
  if(current?.userData.revision==='fleet-sculpted-02'&&modelVersion()==='new')$('#model-note').textContent=(ship.reference?'异形装甲 02：按各自原图轮廓，以大块异形装甲错层叠压，武器采用低矮炮座。90% 外形相似度待验收。':'异形装甲 02：保留旧版概念轮廓，无对应 APK 原图。')+(selected==='Probe'?' 三组传感分支绕中心轴相隔 120°，无武器。':'')+(ship.spinalMount?' '+ship.spinalMount.reason:' 未安装同轴大炮。');
  if(current?.userData.rebuiltFromScratch){
      const remaining=current.userData.revision==='remaining-three-view-01',interpreted=current.userData.referenceViews==='interpreted';
      $('#model-note').textContent=!ship.reference?'概念模型重建：无对应 APK 原图，不能进行原图相似度验收。 ':interpreted?'按 APK 原图重建；侧面、背面与厚度为补建，外形相似度待验收。 ':'三视图全新重建：从空白几何制作，对照找回的 Tripo 正面、侧面、俯视图。外形相似度待验收。 ';
      const link=document.createElement('a');link.href='assets/'+(remaining?'remaining-fleet-rebuild':current.userData.revision==='fleet-three-view-01'?'light-cruiser-rebuild':'three-view-rebuild')+'/'+selected+'-comparison.png';link.target='_blank';link.rel='noopener';link.textContent='查看原图与三视图对照 ↗';$('#model-note').append(link);
      if(current.userData.detailPass)$('#model-note').prepend('结构细化 02：对照原三维图补齐各舰特有的舱段、装甲层级、凹槽和机械结构，以无畏舰为画风基准。 ');
  }
  if(current?.userData.preserved&&modelVersion()==='new')$('#model-note').textContent='保留用户指定的现有精细模型。'+(selected==='Dreadnought'?'已将旧标签驱逐舰的模型对应到 APK 无畏舰。':'');
  if(current?.userData.revision==='death-star-user-01'){
    $('#model-version option[value="new"]').textContent='用户死星模型';
    $('#model-note').textContent='采用你提供的 Death_Star_Threejs 模型：保留装甲纹理、表面机械结构、赤道壕沟、凹面主炮和八组发射器。可旋转、缩放及导出 GLB。';
  }
  if(current?.userData.revision==='four-ships-transports-01'){
    $('#model-version option[value="new"]').textContent=selected==='Cargo_Ship'?'用户 T02 小型运输船':'用户 T03 大型运输船';
    $('#model-note').textContent='采用 Four_Ships_ThreeJS_Offline.html 中的原始造型与配色，保留开放货舱、侧舱结构和四个喷口。可旋转、缩放及导出 GLB。';
  }
  if(current?.userData.revision==='october-user-models-01'){
    $('#model-version option[value="new"]').textContent='用户提供模型';
    $('#model-note').textContent='采用你指定的 HTML 模型，保留原始造型与配色；喷口、舰载武器位置和舰队远景模型已同步。可旋转、缩放及导出 GLB。';
  }
  if(current?.userData.specialDesign){
    $('#model-version option[value="new"]').textContent=current.userData.design;
    $('#model-note').textContent=selected==='Reaper'?'用户模型接入：直接采用 starfighter_model.html 的原始几何与配色，保留双尾翼、镂空翼舱和红色腹甲；补齐结构连接、低矮炮座与导弹口。双束收割和护盾回收特效保留，舰长比例仍为 90。':'装甲弹体 02：封闭式反物质战斗部、尖锥弹头与四片短尾翼，无驾驶舱、无炮塔。进入靶场，锁定后按 Space 自行突击；接近目标引爆，范围冲击忽略护盾，收割者免疫。尺寸与演练伤害为设计值。';
    $('#identity').textContent+=' · 原创试装';
  }
    if(current?.userData.weaponLayout&&modelVersion()==='new')$('#model-version option[value="new"]').textContent+=' · 武器 03';
    if(selected==='Battleship'&&modelVersion()==='new'&&!current?.userData.rebuiltFromScratch)$('#model-note').textContent='战列舰低矮炮座 03：沿用已确认的异形装甲和错层色块，五座武器改为嵌入甲板的扁平双联炮座，降低外露高度、缩短炮管。外形相似度待验收。';
}
function renderData(){
  document.querySelectorAll('[data-model]').forEach(b=>{b.classList.toggle('active',b.dataset.model===selected);b.setAttribute('aria-pressed',String(b.dataset.model===selected));});
  if(reviewMode){renderReviewData();return;}
  const ship=ships.find(s=>s.id===selected),u=units[selected];if(!ship)return;
  renderer.toneMappingExposure=current?.userData.referenceGeometry?.85:current?.userData.revision?.94:1.3;
  scene.environmentIntensity=current?.userData.referenceGeometry?.22:.5;
  $('#model-title').textContent=displayName(ship);$('#model-english').textContent='';
  const loadout=current?.userData.weaponLayout;
  $('#weapon-fit-note').textContent=loadout?[loadout.role,loadout.primary].filter(Boolean).join(' · '):'';
  $('#weapon-demo').hidden=rangeMode||!loadout||selected==='Annihilator';
  $('#enter-range').href=(rangeMode?'ships.html?ship=':'hangar-three.html?entry=direct-flight-01&ship=')+selected;
  $('#enter-range').textContent=rangeMode?'返回舰船档案 ↗':'进入靶场 ↗';
  $('#ship-stats').innerHTML=Object.entries(fields).map(([key,label])=>`<div class="stat"><span>${label}</span><b>${u?number(u[key]):'—'}</b></div>`).join('');
  $('#source-note').textContent=u?statSource(u):'尚未开放';
  $('#availability').textContent=u?.fleetAvailable!==false&&u?'':'暂未开放制造';$('#availability').hidden=!!u&&u.fleetAvailable!==false;
  $('#requirements').textContent=u?`金属 ${number(u.cost[0])} / 晶体 ${number(u.cost[1])} / 气体 ${number(u.cost[2])}。前置：${u.req.map(([id,n])=>(tech[id]?.name||({Shipyard:'太空电梯',Missile_Silo:'导弹发射井'})[id]||'设施')+' '+n+' 级').join('、')}${u.parts?'；外星部件 '+u.parts:''}`:'暂未开放';
  // Player-facing values use the same damage multiplier fields as settlement.
  $('#counters').innerHTML=u?'<p>溅射半径 '+number(u.splashRadius||0)+' · 暴击伤害 ×2'+'</p><p>暴击率 = 1 − 1 ÷ 倍率；倍率 0、1 均不暴击。</p><p>溅射倍率 / 暴击率 · 对以下目标</p>'+damageRows(Object.entries(u.splashMultipliers||{}))+'<p>受到以下单位的溅射倍率 / 暴击率</p>'+damageRows(Object.values(units).filter(x=>x.splashMultipliers?.[selected]>0).map(x=>[x.id,x.splashMultipliers[selected]]),true)+'<p class="source-note">倍率 ×0 免疫溅射和暴击，直击只受基础伤害；溅射随距离线性衰减。</p>':'<p>暂未开放</p>';
}
async function select(id){if(!ships.some(s=>s.id===id))return false;comparing=false;$('#scale-compare').setAttribute('aria-pressed','false');if(reviewMode)$('#export-model').hidden=false;weaponPreview.stop();$('#weapon-demo').setAttribute('aria-pressed','false');$('#weapon-demo').textContent='武器演示';const token=++selectionToken;$('#model-loading').hidden=false;try{const next=modelVersion()==='preserved'?(await new GLTFLoader().loadAsync('assets/preserved-ships/'+id+'.glb')).scene:make(id);if(token!==selectionToken){modelCache.release(next);return false;}selected=id;if(current){scene.remove(current);modelCache.release(current);}current=prepareShipPreviewMaterials(next);current.traverse(o=>{if(o.isMesh)o.material.wireframe=wireframe;});scene.add(current);firingRange?.select(current);fit();renderData();if(reviewMode){let triangles=0;current.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});$('#model-stats').textContent=Math.round(triangles).toLocaleString()+' TRIANGLES'+(shipLengths[id]?' · 舰长 '+shipLengths[id]:'');}$('#model-loading').hidden=true;if(reviewMode)$('#export-status').textContent='';return true;}catch(e){if(token===selectionToken)$('#model-loading').textContent=e.message;return false;}}
function compareScale(){
  if(comparing){select(selected);return;}
  ++selectionToken;comparing=true;weaponPreview.stop();controls.autoRotate=false;$('#auto-rotate').setAttribute('aria-pressed','false');
  if(current){scene.remove(current);modelCache.release(current);}
  current=new THREE.Group();current.name='True_scale_fleet';current.userData.revision='scale-comparison';let row=0;
  for(const [id,length]of Object.entries(shipLengths)){
    const m=make(id);m.rotation.y=Math.PI/2;m.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(m),width=bounds.max.z-bounds.min.z;
    m.position.set(-bounds.min.x,0,row-bounds.min.z);current.add(m);
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#dce9ed';ctx.font='32px sans-serif';ctx.textAlign='right';ctx.fillText((ships.find(s=>s.id===id)?.name||id)+'  '+length,505,55);
    const texture=new THREE.CanvasTexture(canvas),label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));label.position.set(-19,1,row+Math.min(width/2,4));label.scale.set(34,6.375,1);current.add(label);row+=width+4;
  }
  scene.add(current);fit();inspect('top');
  $('#model-title').textContent='同尺度舰队';$('#model-english').textContent='轻战 1 · 深空吞噬者 200';
  if(reviewMode)$('#model-stats').textContent='统一尺度 · 滚轮放大查看战机';$('#weapon-demo').hidden=true;if(reviewMode)$('#export-model').hidden=true;
  $('#scale-compare').setAttribute('aria-pressed','true');$('#model-loading').hidden=true;
  $('#weapon-fit-note').textContent='所有舰船按实际舰长排列。轻战、重战和钛能无炮台；点击左侧舰种返回单舰。';
}
function matrix(){
 const rows=ships.filter(s=>units[s.id]),targets=[...rows,...Object.values(units).filter(u=>u.type==='defense'&&!u.missile)];
 $('#matrix-version').textContent='当前规则';
 $('#matrix-scroll').innerHTML='<table><thead><tr><th>攻击方 ↓ / 目标 →</th>'+targets.map(s=>'<th>'+esc(s.name)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(s=>'<tr><th>'+esc(displayName(s))+'</th>'+targets.map(t=>'<td>×'+number(units[s.id].splashMultipliers?.[t.id]??0)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 $('#counter-matrix').showModal();
}
async function exportModel(id=selected){if(!ships.some(s=>s.id===id))throw Error('未知舰船');if(modelVersion()==='preserved'){const r=await fetch('assets/preserved-ships/'+id+'.glb');if(!r.ok)throw Error('现有模型读取失败');return r.arrayBuffer();}const model=createShipModel(id);model.userData={...model.userData,...ships.find(s=>s.id===id),units:shipLengths[id]?'relative hull length; Light_Fighter = 1':'display units',revision:model.userData.revision||'preserved-detail-model',silhouetteTarget:.9,silhouetteVerified:false};try{return await new GLTFExporter().parseAsync(model,{binary:true,trs:true});}finally{disposeShip(model);}}
$('#ship-list').onclick=e=>{const b=e.target.closest('[data-model]');if(b)select(b.dataset.model);};$('#counters').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>inspect(b.dataset.view));$('#reset-view').onclick=()=>{controls.autoRotate=false;$('#auto-rotate').setAttribute('aria-pressed','false');fit();};
$('#auto-rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('#auto-rotate').setAttribute('aria-pressed',String(controls.autoRotate));};if(reviewMode)$('#wireframe').onclick=()=>{wireframe=!wireframe;current?.traverse(o=>{if(o.isMesh)o.material.wireframe=wireframe;});$('#wireframe').setAttribute('aria-pressed',String(wireframe));};
$('#scale-compare').onclick=compareScale;
$('#matrix-open').onclick=matrix;$('#matrix-close').onclick=()=>$('#counter-matrix').close();
if(reviewMode){$('#model-version').onchange=()=>select(selected);}
  $('#weapon-demo').onclick=()=>{if(weaponPreview.active){weaponPreview.stop();fit();}else{weaponPreview.start(current);fit();camera.zoom=.74;camera.updateProjectionMatrix();}$('#weapon-demo').setAttribute('aria-pressed',String(weaponPreview.active));$('#weapon-demo').textContent=weaponPreview.active?'停止武器演示':'武器演示';};
if(reviewMode)$('#export-model').onclick=async()=>{const b=$('#export-model');b.disabled=true;try{const id=selected,data=await exportModel(id),url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download=id+'.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#export-status').textContent='已导出 GLB';}catch(e){$('#export-status').textContent=e.message;}finally{b.disabled=false;}};
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);fit();}new ResizeObserver(resize).observe(stage);resize();
renderer.setAnimationLoop(time=>{if(!active||document.hidden)return;weaponPreview.update(time/1000);controls.update();renderer.render(scene,camera);});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const d=e.data;if(d?.type==='empire-visibility')active=!!d.active;if(d?.type==='empire-select')select(d.id||legacyIds[d.index]);if(d?.type==='empire-state'&&d.catalog){units=d.catalog.units;tech=d.catalog.tech;renderData();}});
if(parent!==window)document.body.classList.add('embedded');
if(new URLSearchParams(location.search).get('sample')==='1')document.body.classList.add('sample-review');
fetch('ships-data.json').then(r=>{if(!r.ok)throw Error('舰船数据读取失败');return r.json();}).then(async data=>{ships=data.ships.filter(s=>data.units[s.id]?.fleetAvailable!==false&&(!rangeMode||shipLengths[s.id]));units=data.units;tech=data.tech;$('#ship-list').innerHTML=ships.map(s=>`<button data-model="${s.id}">${reviewMode?`<span>${s.apkId?String(s.apkId).padStart(2,'0'):'旧'}</span>`:''}${esc(reviewMode?s.name:displayName(s))}</button>`).join('');await select(new URLSearchParams(location.search).get('ship')||'Battleship');if(!current)await select('Battleship');window.ShipAtlas={ships,select,exportModel,renderer,scene,camera,controls,get current(){return current;},get selected(){return selected;}};parent.postMessage({type:'empire-hangar-ready'},location.origin);}).catch(e=>{$('#model-loading').textContent=e.message;});
