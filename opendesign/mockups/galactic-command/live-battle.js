import {battleStatsView} from './battle-stats-view.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Live combat opens on the map; history uses the read-only replay player.
class LiveBattle {
 constructor(root,catalog){Object.assign(this,{root,catalog,active:false});}
 mount(){
  this.root.innerHTML='<div class="battle-lobby"><header><small>FLEET ENGAGEMENT</small><h2>舰队战场</h2><p>舰队抵达后在目标星球旁实时交战。点击战斗可定位现场，战果和剩余资源可在星球档案查看。</p><a href="hangar-three.html?entry=direct-flight-01" target="_blank" rel="noopener">进入驾驶靶场 ↗</a></header><div class="battle-library"></div><div class="battle-legacy" hidden></div></div>';
  this.rendererSelect=this.root.querySelector('[data-renderer]');this.frame=this.root.querySelector('iframe');this.library=this.root.querySelector('.battle-library');
  this.root.addEventListener('click',e=>{const b=e.target.closest('[data-open-battle],[data-open-replay]');if(b)(b.dataset.openBattle?this.open(b.dataset.openBattle):this.openReport(b.dataset.openReplay)).catch(err=>{this.library.textContent=err.message;});});
  this.onMessage=e=>{if(e.origin===location.origin&&e.source===this.frame?.contentWindow&&e.data?.type==='battle-exit')this.showList();};window.addEventListener('message',this.onMessage);
  this.unsubscribe=window.EmpireAPI.subscribe(()=>this.refreshList());this.refreshList();return this;
 }
 refreshList(){const s=window.EmpireAPI.state;if(!s)return;this.library.innerHTML='<h3>正在交战</h3>'+((s.battles||[]).map(b=>`<button data-open-battle="${esc(b.id)}"><b>${esc(b.name)}</b><span>进攻 ${b.counts[0]} · 防守 ${b.counts[1]} · ${Math.floor(b.elapsed)} 秒</span><em>定位交战现场 ↗</em></button>`).join('')||'<p>暂无交战。派遣攻击舰队抵达后，战斗会在这里显示。</p>')+'<h3>历史战斗</h3>'+((s.reports||[]).filter(r=>r.type==='battle').slice(0,30).map(r=>`<button data-open-replay="${esc(r.id)}"><b>${esc(r.title)}</b><span>${new Date(r.at).toLocaleString('zh-CN')}</span><em>观看历史回放 ↗</em></button>`).join('')||'<p>暂无战报。</p>');}
 async open(id){if(window.CommandApp?.scene){window.dispatchEvent(new CustomEvent('open-map-battle',{detail:{id}}));return;}this.battleId=id;this.showFrame('battle='+encodeURIComponent(id));}
 showFrame(query){if(!this.frame){this.frame=document.createElement("iframe");this.frame.className="battle-frame";this.frame.title="独立历史回放工具";this.root.querySelector(".battle-lobby").append(this.frame);}this.legacy?.setActive(false);this.root.querySelector('.battle-legacy').hidden=true;this.frame.hidden=false;this.root.classList.add('battle-open');this.frame.src='battlefield-three.html'+'?map=planet&'+query;}
 async openReport(id){if(window.CommandApp?.scene){window.dispatchEvent(new CustomEvent('open-map-replay',{detail:{id}}));return;}const data=await window.EmpireAPI.replay(id);return this.start(data);}
 async start({report}){
  if(/^spatial-v[1-5]$/.test(report.engine)){this.showFrame('replay='+encodeURIComponent(report.id));return;}
  if(this.frame){this.frame.src='about:blank';this.frame.hidden=true;}this.root.classList.add('battle-open');const container=this.root.querySelector('.battle-legacy');container.hidden=false;
  container.innerHTML='<p>此历史战报使用旧版战斗记录，请查看战果摘要。</p><button data-back>返回战斗列表</button>';container.querySelector('[data-back]').onclick=()=>this.showList();
 }
 showList(){if(this.frame){this.frame.contentWindow?.postMessage({type:'battle-visibility',active:false},location.origin);this.frame.src='about:blank';this.frame.hidden=true;}this.legacy?.setActive(false);this.root.querySelector('.battle-legacy').hidden=true;this.root.classList.remove('battle-open');this.refreshList();}
 setActive(active){this.active=active;this.frame?.contentWindow?.postMessage({type:'battle-visibility',active},location.origin);this.legacy?.setActive(active&&!this.root.querySelector('.battle-legacy').hidden);}
}
window.LiveBattle=LiveBattle;
