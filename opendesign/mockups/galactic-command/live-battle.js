import {battleStatsView} from './battle-stats-view.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Live combat opens on the map; history uses the read-only replay player.
class LiveBattle {
 constructor(root,catalog){Object.assign(this,{root,catalog,active:false});}
 mount(){
  this.root.innerHTML='<div class="battle-lobby"><header><small>FLEET ENGAGEMENT</small><h2>舰队战场</h2><p>舰队抵达后在目标星球旁实时交战。点击战斗可定位现场，战果和剩余资源可在星球档案查看。</p><a href="hangar-three.html?entry=direct-flight-01" target="_blank" rel="noopener">进入驾驶靶场 ↗</a></header><div class="battle-library"></div><iframe class="battle-frame" title="真实舰队战场" hidden></iframe><div class="battle-legacy" hidden></div></div>';
  this.rendererSelect=this.root.querySelector('[data-renderer]');this.frame=this.root.querySelector('iframe');this.library=this.root.querySelector('.battle-library');
  this.root.addEventListener('click',e=>{const b=e.target.closest('[data-open-battle],[data-open-replay]');if(b)(b.dataset.openBattle?this.open(b.dataset.openBattle):this.openReport(b.dataset.openReplay)).catch(err=>{this.library.textContent=err.message;});});
  this.onMessage=e=>{if(e.origin===location.origin&&e.source===this.frame.contentWindow&&e.data?.type==='battle-exit')this.showList();};window.addEventListener('message',this.onMessage);
  this.unsubscribe=window.EmpireAPI.subscribe(()=>this.refreshList());this.refreshList();this.mountTrial().catch(()=>{});return this;
 }
 async mountTrial(){
  const response=await fetch('/api/battle-trial',{headers:{'X-Empire-Client':'galactic-command'}});if(!response.ok)return;const settings=await response.json();if(!settings.enabled)return;
  const panel=document.createElement('section');panel.className='battle-trial';this.library.before(panel);
  panel.innerHTML=`<header><small>ISOLATED FLEET TEST</small><h3>自选编队测试</h3><p>分别设置双方舰型与数量，自动组成三维战列。主力在前、精英居中、轻舰侧翼骚扰。测试不消耗正式舰船和资源。</p></header><form><div class="trial-sides">${[['attacker','己方编队'],['defender','对方编队']].map(([side,label])=>`<fieldset data-side="${side}"><legend>${label} <output>0 艘</output></legend><label class="trial-preset">快速配比 <select aria-label="${label}配比"><option value="">自定义</option>${settings.presets.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join('')}</select></label>${settings.ships.map(s=>`<label class="trial-ship"><span>${esc(s.name)}${s.experimental?'<small>'+esc(s.note)+'</small>':''}</span><input aria-label="${label} ${esc(s.name)}" data-ship="${s.id}" type="number" min="0" max="10000" step="1" value="0" required></label>`).join('')}</fieldset>`).join('')}</div><div class="trial-actions"><label>战斗种子 <input name="seed" aria-label="战斗种子" type="number" min="0" max="4294967295" step="1" value="42" required></label><button type="button" data-copy>己方配比 → 对方</button><button type="submit">开始编队测试 ↗</button></div><p>默认采用常规舰队配比，每方 311 艘；也可选每方 500 艘（双方共 1000 艘）。近处显示精细舰体，拉远逐舰显示低模。巡洋舰每 16 秒发射 2 枚辅助导弹。精英主炮附带小范围衰减溅射；湮灭之星自动突进、一次性穿盾范围爆炸，收割者免疫。双方测试舰体／护盾科技固定为 50 级，武器科技为 0 级。</p><p role="status" class="trial-status"></p></form>`;
  panel.insertAdjacentHTML('beforeend',battleStatsView(settings));
  const form=panel.querySelector('form'),status=panel.querySelector('[role="status"]');
  const update=()=>{for(const field of panel.querySelectorAll('fieldset'))field.querySelector('output').textContent=[...field.querySelectorAll('[data-ship]')].reduce((sum,input)=>sum+(Number(input.value)||0),0)+' 艘';};
  const setFleet=(field,fleet)=>{for(const input of field.querySelectorAll('[data-ship]'))input.value=fleet[input.dataset.ship]||0;update();};
  const readFleet=field=>Object.fromEntries([...field.querySelectorAll('[data-ship]')].map(input=>[input.dataset.ship,Number(input.value)]));
  for(const field of panel.querySelectorAll('fieldset')){const select=field.querySelector('select');select.value='6';setFleet(field,settings.presets[6].fleet);select.onchange=()=>{if(select.value!=='')setFleet(field,settings.presets[Number(select.value)].fleet);};field.addEventListener('input',e=>{if(e.target.matches('[data-ship]'))select.value='';update();});}
  panel.querySelector('[data-copy]').onclick=()=>{const field=panel.querySelector('[data-side="defender"]');setFleet(field,readFleet(panel.querySelector('[data-side="attacker"]')));field.querySelector('select').value='';};
  form.onsubmit=async e=>{
   e.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('[type="submit"]');button.disabled=true;status.textContent='正在建立测试编队…';
   try{const response=await fetch('/api/battle-trial',{method:'POST',headers:{'X-Empire-Client':'galactic-command','Content-Type':'application/json'},body:JSON.stringify({attacker:readFleet(panel.querySelector('[data-side="attacker"]')),defender:readFleet(panel.querySelector('[data-side="defender"]')),seed:Number(form.elements.seed.value)})});const data=await response.json();if(!response.ok)throw Error(data.error);status.textContent='返回此处可修改配比并重开；上一次测试保留回放。';await this.open(data.id);}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
  };
 }
 refreshList(){const s=window.EmpireAPI.state;if(!s)return;this.library.innerHTML='<h3>正在交战</h3>'+((s.battles||[]).map(b=>`<button data-open-battle="${esc(b.id)}"><b>${esc(b.name)}</b><span>进攻 ${b.counts[0]} · 防守 ${b.counts[1]} · ${Math.floor(b.elapsed)} 秒</span><em>定位交战现场 ↗</em></button>`).join('')||'<p>暂无交战。派遣攻击舰队抵达后，战斗会在这里显示。</p>')+'<h3>历史战斗</h3>'+((s.reports||[]).filter(r=>r.type==='battle').slice(0,30).map(r=>`<button data-open-replay="${esc(r.id)}"><b>${esc(r.title)}</b><span>${new Date(r.at).toLocaleString('zh-CN')}</span><em>观看历史回放 ↗</em></button>`).join('')||'<p>暂无战报。</p>');}
 async open(id){if(window.CommandApp?.scene){window.dispatchEvent(new CustomEvent('open-map-battle',{detail:{id}}));return;}this.battleId=id;this.showFrame('battle='+encodeURIComponent(id));}
 showFrame(query){this.legacy?.setActive(false);this.root.querySelector('.battle-legacy').hidden=true;this.frame.hidden=false;this.root.classList.add('battle-open');this.frame.src=(this.rendererSelect?.value==='native'?'legacy-webgl/battlefield.html':'battlefield-three.html')+'?map=planet&'+query;}
 async openReport(id){if(window.CommandApp?.scene){window.dispatchEvent(new CustomEvent('open-map-replay',{detail:{id}}));return;}const data=await window.EmpireAPI.replay(id);return this.start(data);}
 async start({report}){
  if(/^spatial-v[12]$/.test(report.engine)){this.frame.title='历史战斗回放';this.showFrame('replay='+encodeURIComponent(report.id));return;}
  this.frame.src='about:blank';this.frame.hidden=true;this.root.classList.add('battle-open');const container=this.root.querySelector('.battle-legacy');container.hidden=false;
  if(!this.legacy){const view=document.createElement('div');container.append(view);this.legacy=new window.MassBattle(view,this.catalog).mount();const back=document.createElement('button');back.textContent='返回战斗列表';back.onclick=()=>this.showList();container.append(back);}this.legacy.start({report});this.legacy.setActive(true);
 }
 showList(){this.frame.contentWindow?.postMessage({type:'battle-visibility',active:false},location.origin);this.frame.src='about:blank';this.frame.hidden=true;this.legacy?.setActive(false);this.root.querySelector('.battle-legacy').hidden=true;this.root.classList.remove('battle-open');this.refreshList();}
 setActive(active){this.active=active;this.frame?.contentWindow?.postMessage({type:'battle-visibility',active},location.origin);this.legacy?.setActive(active&&!this.root.querySelector('.battle-legacy').hidden);}
}
window.LiveBattle=LiveBattle;
