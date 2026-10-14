import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createShipModel,disposeShip,legacyIds} from './ship-models.js';

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields={strength:'护甲',shield:'护盾',attack:'攻击',speed:'速度',cargo:'货舱',fuel:'燃料'};
const stage=$('#stage'),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;stage.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,500),controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.autoRotateSpeed=.6;
scene.add(new THREE.HemisphereLight(0xd7edf7,0x263743,2));
for(const[color,power,pos]of[[0xffead9,3,[-8,10,-6]],[0x8bdfff,2,[6,4,6]]]){const light=new THREE.DirectionalLight(color,power);light.position.set(...pos);scene.add(light);}
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.5;room.dispose();pmrem.dispose();
let ships=[],units={},tech={},proposal=null,current=null,selected=null,fitDistance=15,wireframe=false,active=true,selectionToken=0;
const target=new THREE.Vector3();
const make=id=>createShipModel(id);
const number=n=>n==null?'待取得':n.toLocaleString('en-US');
function inspect(view='perspective'){
  const direction=new THREE.Vector3(...({front:[0,.1,-1],side:[1,.15,0],top:[0,1,.001],perspective:[-1,.8,-1.2]}[view]));camera.position.copy(target).add(direction.normalize().multiplyScalar(fitDistance));controls.target.copy(target);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(current?.userData.revision&&$('#model-version').value==='new'){
    current.updateMatrixWorld(true);camera.updateMatrixWorld(true);const bounds=new THREE.Box2();const v=new THREE.Vector3();
    current.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(camera.matrixWorldInverse);bounds.expandByPoint(new THREE.Vector2(v.x,v.y));}}});
    const aspect=stage.clientWidth/stage.clientHeight,extent=Math.max(Math.abs(bounds.min.y),Math.abs(bounds.max.y),Math.abs(bounds.min.x)/aspect,Math.abs(bounds.max.x)/aspect)*1.2;camera.top=extent;camera.bottom=-extent;camera.right=extent*aspect;camera.left=-extent*aspect;camera.zoom=1;camera.updateProjectionMatrix();
  }
}
function fit(){if(!current)return;const box=new THREE.Box3().setFromObject(current),size=box.getSize(new THREE.Vector3());box.getCenter(target);const aspect=stage.clientWidth/stage.clientHeight,half=size.length()*.56/Math.min(1,aspect);camera.top=half;camera.bottom=-half;camera.right=half*aspect;camera.left=-half*aspect;camera.zoom=1;camera.updateProjectionMatrix();fitDistance=size.length()*2;controls.minZoom=.3;controls.maxZoom=4;inspect();}
function counterRows(entries){return entries.map(([id,rate])=>`<div class="counter"><button data-select="${esc(id)}">${esc(units[id]?.name||ships.find(s=>s.id===id)?.name||id)}</button><b>${rate}</b></div>`).join('');}
function renderData(){
  const ship=ships.find(s=>s.id===selected),u=units[selected];if(!ship)return;
  renderer.toneMappingExposure=current?.userData.revision&&$('#model-version').value==='new'?.94:1.3;
  $('#model-version option[value="new"]').textContent=selected==='Cruiser'?'巡洋舰精修样舰 01':current?.userData.preserved?'现有精细模型（保留）':'全舰队精修 01';
  if(selected==='Battleship'&&$('#model-version').value==='new')$('#model-version option[value="new"]').textContent='战列舰低矮炮座 03';
  $('#model-title').textContent=ship.name;$('#model-english').textContent=ship.id.replaceAll('_',' ').toUpperCase();$('#model-index').textContent=String(ships.indexOf(ship)+1).padStart(2,'0')+' / '+ships.length;
  $('#identity').textContent=ship.apkId?'type_'+ship.apkId+' · '+ship.constant:'旧版截图舰种 · APK 身份未确认';
  $('#reference-image').hidden=!ship.reference;if(ship.reference)$('#reference-image').src='assets/ship-references/'+ship.reference.split('/').at(-1);
  $('#reference-image').alt=ship.name+' APK 原图';
  $('#ship-stats').innerHTML=Object.entries(fields).map(([k,name])=>`<div class="stat"><span>${name}</span><b>${number(u?.[k]??ship.stats[k])}</b></div>`).join('');
  $('#source-note').textContent=u?'基础值来自已有截图校准；造价、前置和速射沿用当前规则，APK 服务器数值未取得。':'APK 身份与图标已对齐；服务器属性、造价和克制倍率未取得，暂不开放建造。';
  $('#requirements').textContent=u?`金属 ${number(u.cost[0])} / 晶体 ${number(u.cost[1])} / 气体 ${number(u.cost[2])}。前置：${u.req.map(([id,n])=>(tech[id]?.name||id)+' '+n+'级').join('、')}${u.parts?'；外星部件 '+u.parts:''}`:'待取得服务器配置';
  $('#counters').innerHTML=u?'<p>克制目标 · 速射值</p>'+(counterRows(Object.entries(u.rapid))||'<p>本地未配置额外速射</p>')+'<p>被以下单位克制</p>'+(counterRows(Object.values(units).filter(x=>x.rapid?.[selected]>1).map(x=>[x.id,x.rapid[selected]]))||'<p>本地未配置；不代表 APK 中无克制</p>')+'<p class="source-note">速射值 r：继续开火概率 1 − 1/r。与实际结算共用同一份数据。</p>':'<p>倍率待取得，不能按“没有克制”处理。</p>';
  if(selected==='Reaper')$('#counters').innerHTML+='<p>APK 已证实：免疫湮灭之星攻击，具有特殊攻击顺序（顺序细节未取得）。</p>';
  if(selected==='Annihilator')$('#counters').innerHTML+='<p>APK 已证实：进攻方在敌方同时有至少两种裂变者、深空吞噬者、噬能截击者、钛能守卫者时逐个引爆；无视护盾并造成群体伤害。Reaper 免疫。完整条件见下方原文。</p>';
  if($('#counter-version').value==='proposal'&&proposal){const row=proposal.ships.find(s=>s.id===selected);$('#counters').innerHTML='<p class="source-note">拟定方案 · 待你确认，尚未用于结算。'+esc(row.role)+'</p><p>克制目标 · 拟定速射值</p>'+(counterRows(Object.entries(row.rapid))||'<p>无额外普通速射</p>')+'<p>被以下单位克制</p>'+(counterRows(proposal.ships.filter(s=>s.rapid[selected]).map(s=>[s.id,s.rapid[selected]]))||'<p>无额外普通速射；特殊机制另列</p>')+'<p class="source-note">基础 bonus_damage_rate = 0。速射值不是直接伤害倍数。</p>';if(proposal.special[selected])$('#counters').innerHTML+='<p>'+esc(selected==='Reaper'?'免疫湮灭之星；拟定优先攻击深空吞噬者、钛能守卫者、噬能截击者。':'按 APK 文案逐个自爆、无视护盾；拟定对裂变者 / 深空吞噬者 / 噬能截击者 / 钛能守卫者伤害修正为 1.5 / 1.25 / 1 / 0.75，Reaper 为 0。')+'</p>';}
  $('#model-description').textContent=ship.description||'APK 已确认舰种编号；未提取到对应说明。';$('#model-note').textContent=$('#model-version').value==='preserved'?'保留的现有模型，未删除或替换。此版本可能存在原图形状错配。':ship.reference?'APK 重建草案；隐藏面与厚度为补建。90% 形状相似为待验收目标，尚未标为达标。':'无对应 APK 原图，当前为概念模型，不能进行原图相似度验收。';
  document.querySelectorAll('[data-model]').forEach(b=>{b.classList.toggle('active',b.dataset.model===selected);b.setAttribute('aria-pressed',String(b.dataset.model===selected));});
  if(current?.userData.revision==='fleet-refinement-01'&&$('#model-version').value==='new')$('#model-note').textContent=(ship.reference?'全舰队精修 01：按各自 APK 原图和概念稿细化，采用巡洋舰样舰的装甲、武器与机械细节标准；90% 相似度待验收。':'全舰队精修 01：沿用旧版概念轮廓细化，未找到对应 APK 原图，不能宣称原图还原。')+(selected==='Probe'?' 三组传感分支绕中心轴相隔 120°，无武器。':'');
  if(current?.userData.preserved&&$('#model-version').value==='new')$('#model-note').textContent='保留用户指定的现有精细模型。'+(selected==='Dreadnought'?'已将旧标签驱逐舰的模型对应到 APK 无畏舰。':'');
  if(selected==='Cruiser'&&$('#model-version').value==='new')$('#model-note').textContent='巡洋舰精修样舰 01：按 APK 原图和已生成的概念稿建模。可旋转检查分层装甲、炮塔、导弹舱、舰桥及尾喷口。外形相似度待验收。';
  if(selected==='Battleship'&&$('#model-version').value==='new')$('#model-note').textContent='战列舰低矮炮座 03：沿用已确认的异形装甲和错层色块，五座武器改为嵌入甲板的扁平双联炮座，降低外露高度、缩短炮管。外形相似度待验收。';
}
async function select(id){if(!ships.some(s=>s.id===id))return false;const token=++selectionToken;$('#model-loading').hidden=false;try{const next=$('#model-version').value==='preserved'?(await new GLTFLoader().loadAsync('assets/preserved-ships/'+id+'.glb')).scene:make(id);if(token!==selectionToken){disposeShip(next);return false;}selected=id;if(current){scene.remove(current);disposeShip(current);}current=next;current.traverse(o=>{if(o.isMesh)o.material.wireframe=wireframe;});scene.add(current);fit();renderData();let triangles=0;current.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});$('#model-stats').textContent=Math.round(triangles).toLocaleString()+' TRIANGLES';$('#model-loading').hidden=true;$('#export-status').textContent='';return true;}catch(e){if(token===selectionToken)$('#model-loading').textContent=e.message;return false;}}
function matrix(){
  const targets=[...ships,...Object.values(units).filter(u=>u.type==='defense'&&!u.missile)],draft=$('#counter-version').value==='proposal';
  $('#matrix-version').textContent=draft?'拟定方案 · 待确认':'现行结算规则';
  $('#matrix-scroll').innerHTML='<table><thead><tr><th>攻击方 ↓ / 目标 →</th>'+targets.map(s=>'<th>'+esc(s.name)+'</th>').join('')+'</tr></thead><tbody>'+ships.map(s=>'<tr><th>'+esc(s.name)+'</th>'+targets.map(t=>{const rate=draft?proposal.ships.find(x=>x.id===s.id).rapid[t.id]:units[s.id]?.rapid[t.id];return `<td ${rate?'data-rate="'+rate+'"':''}>${!draft&&(!units[s.id]||!units[t.id])?'?':rate||'—'}</td>`;}).join('')+'</tr>').join('')+'</tbody></table>';
  $('#counter-matrix').showModal();
}
async function exportModel(id=selected){if(!ships.some(s=>s.id===id))throw Error('未知舰船');if($('#model-version').value==='preserved'){const r=await fetch('assets/preserved-ships/'+id+'.glb');if(!r.ok)throw Error('现有模型读取失败');return r.arrayBuffer();}const model=make(id);model.userData={...model.userData,...ships.find(s=>s.id===id),units:'display units',revision:model.userData.revision||'preserved-detail-model',silhouetteTarget:.9,silhouetteVerified:false};try{return await new GLTFExporter().parseAsync(model,{binary:true,trs:true});}finally{disposeShip(model);}}
$('#ship-list').onclick=e=>{const b=e.target.closest('[data-model]');if(b)select(b.dataset.model);};$('#counters').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>inspect(b.dataset.view));$('#reset-view').onclick=()=>{controls.autoRotate=false;$('#auto-rotate').setAttribute('aria-pressed','false');fit();};
$('#auto-rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('#auto-rotate').setAttribute('aria-pressed',String(controls.autoRotate));};$('#wireframe').onclick=()=>{wireframe=!wireframe;current?.traverse(o=>{if(o.isMesh)o.material.wireframe=wireframe;});$('#wireframe').setAttribute('aria-pressed',String(wireframe));};
$('#matrix-open').onclick=matrix;$('#matrix-close').onclick=()=>$('#counter-matrix').close();
$('#model-version').onchange=()=>select(selected);$('#counter-version').onchange=renderData;
$('#export-model').onclick=async()=>{const b=$('#export-model');b.disabled=true;try{const id=selected,data=await exportModel(id),url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download=id+'.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#export-status').textContent='已导出 GLB';}catch(e){$('#export-status').textContent=e.message;}finally{b.disabled=false;}};
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h);fit();}new ResizeObserver(resize).observe(stage);resize();
renderer.setAnimationLoop(()=>{if(!active||document.hidden)return;controls.update();renderer.render(scene,camera);});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;const d=e.data;if(d?.type==='empire-visibility')active=!!d.active;if(d?.type==='empire-select')select(d.id||legacyIds[d.index]);if(d?.type==='empire-state'&&d.catalog){units=d.catalog.units;tech=d.catalog.tech;renderData();}});
if(parent!==window)document.body.classList.add('embedded');
if(new URLSearchParams(location.search).get('sample')==='1')document.body.classList.add('sample-review');
fetch('ships-data.json').then(r=>{if(!r.ok)throw Error('舰船数据读取失败');return r.json();}).then(async data=>{ships=data.ships;units=data.units;tech=data.tech;proposal=data.proposal;$('#ship-list').innerHTML=ships.map(s=>`<button data-model="${s.id}"><span>${s.apkId?String(s.apkId).padStart(2,'0'):'旧'}</span>${esc(s.name)}</button>`).join('');await select(new URLSearchParams(location.search).get('ship')||'Battleship');if(!current)await select('Battleship');window.ShipAtlas={ships,select,exportModel,renderer,scene,camera,controls,get current(){return current;},get selected(){return selected;}};parent.postMessage({type:'empire-hangar-ready'},location.origin);}).catch(e=>{$('#model-loading').textContent=e.message;});
