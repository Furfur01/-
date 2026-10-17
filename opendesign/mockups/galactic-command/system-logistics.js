(function(){
  'use strict';
  window.createSystemLogistics=function({api,esc,compact,time,act}){
    const names=['金属','晶体','气体'],chosen=new Map();
    const systemLabel=s=>'恒星系 '+s.position.join(' : ');
    function render(coords=null){
      if(!api.state.logistics)return '<p class="info-note">重启银河帝国启动器后可建设恒星系物流中心。</p>';
      const systems=api.state.logistics.filter(s=>!coords||s.position.join(':')===coords.join(':'));
      return `<section class="logistics-panel" aria-label="恒星系物流中心"><div class="section-title"><div><div class="overline">SYSTEM LOGISTICS</div><h2>恒星系物流中心</h2></div><button class="text-button" data-page="empire">帝国总览 ↗</button></div><p class="info-note">每个恒星系建设一座，即可让本方行星与月球共用库存及仓储容量。建设、计划、研究、造舰和舰队补给直接扣用共享资源，新殖民地自动接入。跨恒星系仍需运输。</p><div class="logistics-grid">${systems.map(s=>{
        const planets=s.members.map(id=>api.state.planets.find(p=>p.id===id)).filter(Boolean),hosts=planets.filter(p=>!p.moon),host=hosts.find(p=>p.id===(chosen.get(s.key)||s.host))||hosts[0],active=s.level===1,queue=s.queue;
        const canAfford=s.cost.every((v,i)=>host.resources[i]>=v);
        return `<article class="logistics-card ${active?'connected':''}" data-logistics-system="${esc(s.key)}"><div class="section-title"><h3>${systemLabel(s)} ${active||queue?`<button class="logistics-locate" data-logistics-view="${esc(s.key)}" title="在星图定位" aria-label="定位${systemLabel(s)}物流中心">⌖</button>`:''}</h3><span class="logistics-status">${active?'共享仓库已连通':queue?'物流中心建设中':'尚未建设'}</span></div><p class="info-note">${planets.map(p=>esc(p.name)+(p.moon?'（月球）':'')).join(' · ')}<br>${planets.length} 处基地${active?'共用以下库存':' · 建成后合并以下库存与容量'}</p><div class="logistics-resources">${s.resources.map((n,i)=>`<div><span>${names[i]}</span><b>${compact(n)} <small>/ ${compact(s.capacity[i])}</small></b><small>${s.rate[i]>=0?'+':''}${compact(s.rate[i])}/h · 全系净产量</small></div>`).join('')}</div>${active?'<p class="info-note">在任意接入星球消费，无需同系运输。</p>':queue?`<div class="empire-current"><span>施工剩余 <b data-countdown="${queue.end}">${time(queue.end)}</b></span><button class="text-button" data-logistics-cancel="${esc(queue.planet)}" ${api.busy?'disabled':''}>取消建设 · 退还全部资源</button></div>`:`<p class="info-note">建设费用：${s.cost.map((n,i)=>names[i]+' '+compact(n)).join(' / ')} · ${s.seconds} 秒<br>建设费由所选星球本地库存支付，不占行星建筑队列。</p><div class="logistics-build"><label>出资星球<select data-logistics-host="${esc(s.key)}">${hosts.map(p=>`<option value="${esc(p.id)}" ${p.id===host.id?'selected':''}>${esc(p.name)}${s.cost.every((n,i)=>p.resources[i]>=n)?' · 可建设':' · 资源不足'}</option>`).join('')}</select></label><button class="primary" data-logistics-build="${esc(s.key)}" ${api.busy||!canAfford?'disabled':''}>${canAfford?'建设物流中心':'出资星球资源不足'} ↗</button></div>`}</article>`;
      }).join('')||'<p class="empty">本恒星系还没有本方殖民地。建立殖民地后即可建设物流中心。</p>'}</div></section>`;
    }
    document.addEventListener('change',e=>{
      if(!e.target.dataset.logisticsHost)return;
      chosen.set(e.target.dataset.logisticsHost,e.target.value);
      const card=e.target.closest('.logistics-card'),s=api.state.logistics.find(s=>s.key===e.target.dataset.logisticsHost),p=api.state.planets.find(p=>p.id===e.target.value),button=card.querySelector('[data-logistics-build]'),ready=s.cost.every((n,i)=>p.resources[i]>=n);
      button.disabled=api.busy||!ready;button.textContent=ready?'建设物流中心 ↗':'出资星球资源不足';
    });
    document.addEventListener('click',async e=>{
      const button=e.target.closest('button');if(!button||button.disabled)return;
      if(button.dataset.logisticsBuild){const planet=button.closest('.logistics-card').querySelector('[data-logistics-host]').value;await act({type:'logistics',planet,mode:'build'},'物流中心开始建设，完成后自动接通本恒星系仓库');}
      if(button.dataset.logisticsCancel)await act({type:'logistics',planet:button.dataset.logisticsCancel,mode:'cancel'},'物流中心建设已取消，资源已返还');
    });
    return {render};
  };
})();
