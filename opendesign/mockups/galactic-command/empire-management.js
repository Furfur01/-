(function(){
  'use strict';
  window.createEmpireManagement=function({api,esc,number,compact,time,act,go,openModal,logistics}){
    const selected=new Set(),names=['金属','晶体','气体'];
    let search='',filter='all',editor='',template='resource',mode='append',growth='fixed',preview=null,previewing=false;
    let draft={id:'Metal_Mine',level:1},editorRevision=0;
    const $=s=>document.querySelector(s);
    const buildings=()=>Object.values(api.catalog.buildings).filter(b=>api.catalog.surfaceLayout?.slots?.[b.id]);
    const label=id=>api.catalog.buildings[id]?.name||id;
    const eligible=()=>api.state.planets.filter(p=>!p.moon&&p.position[0]===1);
    function issues(p){
      const result=[];
      if(['blocked','waiting'].includes(p.planStatus.state))result.push(p.planStatus.reason);
      if(p.economy.supply<p.economy.demand)result.push('能源不足');
      if((p.storage?.resources||p.resources).some((n,i)=>n>=(p.storage?.capacity||p.economy.capacity)[i]*.9))result.push('仓储将满');
      if(api.state.missions.some(m=>m.inbound&&['attack','destroyMoon','missile'].includes(m.task)&&['outbound','engaged'].includes(m.phase)&&m.position.join(':')===p.position.join(':')))result.push('受到威胁');
      if(api.state.battles.some(b=>b.target===p.id))result.push('正在交战');
      return result;
    }
    function visible(){return eligible().filter(p=>{
      const text=(p.name+' '+p.position.join(':')).toLowerCase(),warning=issues(p);
      return text.includes(search.toLowerCase())&&(filter==='all'||filter==='attention'&&warning.length||filter==='idle'&&!p.buildQueue||filter==='energy'&&p.economy.supply<p.economy.demand||filter==='storage'&&(p.storage?.resources||p.resources).some((n,i)=>n>=(p.storage?.capacity||p.economy.capacity)[i]*.9));
    }).sort((a,b)=>Number(issues(b).length>0)-Number(issues(a).length>0)||a.position.join(':').localeCompare(b.position.join(':'),undefined,{numeric:true}));}
    const status=p=>p.constructionPlan.paused?(p.buildQueue?'施工中 · 后续已暂停':'计划已暂停'):p.planStatus.reason;
    const templateName=p=>(api.state.developmentTemplates.find(t=>t.id===p.constructionPlan.template)?.name||'自主建设')+(p.constructionPlan.growth==='incremental'?' · 增量发展':'');
    const growthDescription=()=>({resource:'优势矿产再升 5 级，机器人和辅助矿综合体再升 2 级。',industry:'太空电梯再升 5 级，机器人和三类综合体再升 2 级。',research:'实验室再升 5 级，机器人和三类综合体再升 2 级。',frontier:'太空电梯和雷达再升 5 级，机器人、保障中心和三类综合体再升 2 级。'})[template];
    function form(p){
      editorRevision=p.constructionPlan.revision;
      const plan=p.constructionPlan,q=p.buildQueue;
      return `<section class="empire-plan" aria-label="${esc(p.name)}建设计划"><div class="section-title"><div><div class="overline">CONSTRUCTION PLAN</div><h2>${esc(p.name)} · 建设计划</h2></div><button class="text-button" data-empire-close>收起 ×</button></div>
        ${plan.repairNote?`<p class="info-note">${esc(plan.repairNote)}</p>`:''}<p class="info-note">${esc(status(p))} · 每次只施工一项，开工时扣费。暂停只停止后续计划，当前施工继续。</p>
        ${q?`<div class="empire-current"><strong>正在施工：${esc(label(q.id))} → ${q.level} 级</strong><span data-countdown="${q.end}">${time(q.end)}</span><button class="text-button" data-empire-cancel="${esc(p.id)}">取消施工并暂停计划 · 退还资源</button></div>`:'<p class="muted">当前没有施工项目。</p>'}
        <div class="empire-actions-row"><button class="primary" data-empire-pause="${esc(p.id)}" ${api.busy?'disabled':''}>${plan.paused?'继续计划':'暂停计划'}</button><button class="text-button" data-empire-clear="${esc(p.id)}" ${!plan.items.length||api.busy?'disabled':''}>清空待建计划</button><button class="text-button" data-open-planet="${esc(p.id)}">进入星球 ↗</button></div>
        <form id="empire-add-plan" data-planet="${esc(p.id)}" class="empire-add"><label>建筑<select name="building" id="empire-building">${buildings().map(b=>`<option value="${b.id}" ${draft.id===b.id?'selected':''}>${esc(label(b.id))} · 当前 ${p.buildings[b.id]||0} 级</option>`).join('')}</select></label><label>目标等级<input name="level" id="empire-level" type="number" min="1" max="50" required value="${draft.level}"></label><button class="primary" ${api.busy?'disabled':''}>加入计划</button></form>
        <p class="info-note">按目标顺序逐级升级；可调整顺序、修改目标或移除。手动计划需要自行安排前置建筑。</p>
        <ol class="empire-plan-list">${plan.items.map((item,i)=>`<li><div><b>${esc(label(item.id))}</b><small>当前 ${p.buildings[item.id]||0} 级 → 目标 ${item.level} 级</small></div><label class="empire-goal-label">目标<input type="number" min="1" max="50" value="${item.level}" id="empire-goal-${i}" aria-label="第 ${i+1} 项目标等级"></label><button class="text-button" data-empire-level="${i}" aria-label="保存第 ${i+1} 项目标">保存</button><button class="text-button" data-empire-move="${i}" data-direction="-1" ${i===0?'disabled':''} aria-label="上移第 ${i+1} 项">↑</button><button class="text-button" data-empire-move="${i}" data-direction="1" ${i===plan.items.length-1?'disabled':''} aria-label="下移第 ${i+1} 项">↓</button><button class="text-button" data-empire-remove="${i}" aria-label="移除第 ${i+1} 项">移除</button></li>`).join('')||'<li class="empty">还没有待建项目。添加目标，或从上方应用发展模板。</li>'}</ol></section>`;
    }
    function render(){
      if(!api.state.developmentTemplates)return '<div class="empty">市政中心已就绪，请关闭并重新打开银河帝国启动器，以载入新的建设计划服务。</div>';
      const all=eligible(),rows=visible();for(const id of selected)if(!all.some(p=>p.id===id))selected.delete(id);
      const p=all.find(p=>p.id===editor),court=api.state.planets.find(p=>p.id===api.state.player.home);
      return `<section id="empire-management"><div class="empire-intro"><div><div class="overline">CIVIC ADMINISTRATION / 帝国内政</div><p>在市政中心统筹殖民地建设。发展模板生成有限计划，完成目标后停止。</p></div><button class="text-button" data-open-planet="${esc(court.id)}">返回母星市政中心 ↗</button></div>
        <div class="empire-metrics"><span>殖民地 <b>${all.length}</b></span><span>正在建设 <b>${all.filter(p=>p.buildQueue).length}</b></span><span>需要处理 <b>${all.filter(p=>issues(p).length).length}</b></span><span>待建目标 <b>${all.reduce((n,p)=>n+p.constructionPlan.items.length,0)}</b></span></div>
        ${logistics.render()}<div class="empire-toolbar"><label>搜索星球<input id="empire-search" type="search" placeholder="名称或坐标" value="${esc(search)}"></label><label>筛选<select id="empire-filter">${[['all','全部殖民地'],['attention','需要处理'],['idle','建设闲置'],['energy','能源不足'],['storage','仓储将满']].map(([id,name])=>`<option value="${id}" ${filter===id?'selected':''}>${name}</option>`).join('')}</select></label><button class="text-button" data-empire-select-all>选择当前结果</button><button class="text-button" data-empire-deselect>取消全部选择</button></div>
        <div class="empire-batch"><strong>已选 ${selected.size} 颗</strong><label>发展模板<select id="empire-template">${api.state.developmentTemplates.map(t=>`<option value="${t.id}" ${template===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label><label>计划类型<select id="empire-growth"><option value="fixed" ${growth==='fixed'?'selected':''}>基础目标计划</option><option value="incremental" ${growth==='incremental'?'selected':''} ${api.state.planGrowthModes?.includes('incremental')?'':'disabled'}>增量发展计划</option></select></label><label>应用方式<select id="empire-mode"><option value="append" ${mode==='append'?'selected':''}>追加到现有计划</option><option value="replace" ${mode==='replace'?'selected':''}>替换待建计划</option></select></label><button class="primary" data-empire-preview ${!selected.size||selected.size>200||api.busy||previewing?'disabled':''}>${previewing?'正在生成预览…':'预览批量计划'}</button><p class="info-note">${esc(growth==='incremental'?growthDescription()+' 自动补足能源和基础目标；以当前等级、正在施工及追加时已有计划为起点。每次确认都会再增加一轮，完成后停止。':api.state.developmentTemplates.find(t=>t.id===template)?.description||'')} ${api.state.planGrowthModes?.includes('incremental')?'':'重启启动器后可启用增量发展。'}每次最多选择 200 颗；保留当前施工与暂停状态。</p></div>
        <div class="empire-table-wrap"><table class="data-table empire-table"><thead><tr><th>选择</th><th>星球 / 定位</th><th>本地库存 · 本星每小时产量</th><th>当前施工 / 后续计划</th><th>需要处理</th><th>管理</th></tr></thead><tbody>${rows.map(p=>`<tr ${editor===p.id?'class="selected"':''}><td><input type="checkbox" data-empire-select="${esc(p.id)}" aria-label="选择${esc(p.name)}" ${selected.has(p.id)?'checked':''}></td><td><b>${esc(p.name)}</b><small>${p.position.join(':')} · ${esc(api.catalog.planetTypes[p.biome]?.name||'')}</small><small>${esc(templateName(p))}${p.id===api.state.player.home?' · 市政中心所在地':''}</small></td><td>${p.storage?.shared?'<small class="production-note">已接入同系共享仓库</small>':''}<small class="production-note">${api.catalog.planetTypes[p.biome]?.specialty===null?'均衡开采 ×1':'优势矿产 ×3 · 辅助矿产 ×0.1'}</small>${p.resources.map((n,i)=>`<small>${names[i]} ${compact(n)} / ${compact(p.economy.capacity[i])} <span>${p.economy.rate[i]>=0?'+':''}${compact(p.economy.rate[i])}/h</span>${p.economy.rate[i]===0?' · '+(!(p.buildings[['Metal_Mine','Crystal_Mine','Gas_Mine'][i]])?'未建开采设施':p.economy.ratio===0?'缺少能源':'净产量为零'):''}</small>`).join('')}</td><td>${p.buildQueue?`${esc(label(p.buildQueue.id))} → ${p.buildQueue.level} 级 <small data-countdown="${p.buildQueue.end}">${time(p.buildQueue.end)}</small>`:'暂无施工'}<small>${p.constructionPlan.items.length} 项目标 · ${esc(status(p))}</small></td><td>${issues(p).map(x=>`<small class="empire-warning">${esc(x)}</small>`).join('')||'<span class="muted">正常</span>'}</td><td><button class="text-button" data-empire-edit="${esc(p.id)}">建设计划 →</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">没有符合条件的殖民地。</td></tr>'}</tbody></table></div>
        ${p?form(p):'<p class="info-note">点击任意星球的「建设计划」直接管理，无需切换当前殖民地。月球继续通过月球行动管理。</p>'}</section>`;
    }
    function redraw(){if(window.CommandApp?.page==='empire')$('#page-body').innerHTML=render();}
    function showPreview(data){
      openModal(data.growth==='incremental'?'增量发展计划预览':'批量发展计划预览',`<p class="info-note">${esc(api.state.developmentTemplates.find(t=>t.id===data.template)?.name)} · ${data.mode==='replace'?'替换所选星球全部待建目标':'追加到现有待建目标'}。${data.growth==='incremental'?'本次将继续提高目标；再次应用会再增加一轮。':''}当前施工继续，暂停状态保留。以下为整个待建计划的估算费用，实际开工时逐次扣除，不会预扣。</p>${data.previews.map(p=>`<details class="empire-preview"><summary>${esc(p.name)} · 新增 ${p.added} 项 / 共 ${p.upgrades} 次升级${p.paused?' · 已暂停':''}</summary><p class="info-note">${p.cost.map((n,i)=>names[i]+' '+number(n)).join(' / ')}</p><ol>${p.items.map(x=>`<li>${esc(label(x.id))} → ${x.level} 级</li>`).join('')||'<li>目标均已达到，无需新增建设。</li>'}</ol></details>`).join('')}<p class="info-note">缺少资源会等待；空间或前置条件不足会停止并显示原因。专产星优势矿产 ×3，辅助矿产 ×0.1；每座综合体升级都会提高开采与仓储。</p><button class="primary filled" data-empire-apply ${api.busy?'disabled':''}>确认应用到 ${data.previews.length} 颗星球</button>`,'CIVIC ADMINISTRATION / DEVELOPMENT');
    }
    async function update(payload){const ok=await act({type:'plan',planet:editor,revision:editorRevision,...payload},'建设计划已更新');redraw();return ok;}
    document.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
      if(!Object.keys(d).some(k=>k.startsWith('empire')))return;
      if('empireEdit'in d){editor=d.empireEdit;const p=eligible().find(p=>p.id===editor);draft={id:'Metal_Mine',level:(p.buildings.Metal_Mine||0)+1};redraw();$('.empire-plan')?.scrollIntoView({block:'start',behavior:'smooth'});}
      if('empireClose'in d){editor='';redraw();}
      if('empireSelectAll'in d){visible().forEach(p=>selected.add(p.id));redraw();}
      if('empireDeselect'in d){selected.clear();redraw();}
      if('empirePause'in d)await update({mode:'pause',paused:!eligible().find(p=>p.id===editor).constructionPlan.paused});
      if('empireClear'in d)await update({mode:'clear'});
      if('empireCancel'in d){await act({type:'cancel',kind:'build',planet:d.empireCancel},'施工已取消并退费，后续计划已暂停');redraw();}
      if('empireRemove'in d)await update({mode:'remove',index:Number(d.empireRemove)});
      if('empireMove'in d)await update({mode:'move',index:Number(d.empireMove),direction:Number(d.direction)});
      if('empireLevel'in d){const input=$('#empire-goal-'+d.empireLevel);if(input.reportValidity())await update({mode:'level',index:Number(d.empireLevel),level:Number(input.value)});}
      if('empirePreview'in d){
        previewing=true;const request={planets:[...selected],template,mode,growth};redraw();
        try{const response=await api.previewPlan(request);preview={...request,...response};showPreview(preview);}catch(error){openModal('无法生成计划',`<p>${esc(error.message)}</p>`,'CIVIC ADMINISTRATION');}finally{previewing=false;redraw();}
      }
      if('empireApply'in d&&preview&&!api.busy){
        b.disabled=true;
        const ok=await act({type:'applyTemplate',planets:preview.planets,template:preview.template,mode:preview.mode,growth:preview.growth,bases:Object.fromEntries(preview.previews.map(p=>[p.planet,p.basis])),revisions:Object.fromEntries(preview.previews.map(p=>[p.planet,p.revision]))},'发展模板已应用');
        if(ok){$('#detail-modal').close();preview=null;redraw();}else {b.disabled=false;}
      }
    });
    document.addEventListener('input',e=>{
      if(e.target.id==='empire-search'){search=e.target.value;const pos=e.target.selectionStart;redraw();$('#empire-search').focus();$('#empire-search').setSelectionRange(pos,pos);}
      if(e.target.id==='empire-level')draft.level=e.target.value;
    });
    document.addEventListener('change',e=>{
      const d=e.target.dataset;
      if(d.empireSelect){e.target.checked?selected.add(d.empireSelect):selected.delete(d.empireSelect);redraw();}
      if(e.target.id==='empire-filter'){filter=e.target.value;redraw();}
      if(e.target.id==='empire-template'){template=e.target.value;redraw();}
      if(e.target.id==='empire-growth'){growth=e.target.value;redraw();}
      if(e.target.id==='empire-mode'){mode=e.target.value;redraw();}
      if(e.target.id==='empire-building'){const p=eligible().find(p=>p.id===editor),id=e.target.value;draft={id,level:Math.max(p.buildings[id]||0,p.buildQueue?.id===id?p.buildQueue.level:0,...p.constructionPlan.items.filter(x=>x.id===id).map(x=>x.level))+1};redraw();}
    });
    document.addEventListener('submit',async e=>{if(e.target.id!=='empire-add-plan')return;e.preventDefault();if(api.busy)return;await update({mode:'add',id:draft.id,level:Number(draft.level)});});
    return {render};
  };
})();
