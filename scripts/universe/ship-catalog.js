const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>Number.isFinite(value)?Math.floor(value).toLocaleString('en-US'):'—';
const fields=[['strength','舰体'],['shield','护盾'],['attack','攻击'],['speed','战略航速'],['cargo','货舱'],['fuel','基础燃耗']];
const image=id=>'/opendesign/mockups/galactic-command/assets/p0/ships/'+encodeURIComponent(id)+'.png';

export function shipLoreHTML(archive){
 if(!archive?.description&&!archive?.quote)return '';
 const quote=archive.quote;
 return `<section class="ship-lore" aria-label="${archive.description?'舰型说明':'名言'}">${archive.description?`<h3>舰型说明</h3><p class="ship-description">${escape(archive.description)}</p>`:''}${quote?`<figure class="ship-quotation"><blockquote>“${escape(quote.text)}”</blockquote><figcaption>— ${escape(quote.author)}<a href="${escape(quote.url)}" target="_blank" rel="noopener noreferrer" title="${escape(quote.original||quote.work)}">${escape(quote.work)}${quote.translation?' · '+escape(quote.translation):''} ↗</a></figcaption></figure>`:''}</section>`;
}

// Public rules remain authoritative. Archive-only entries may be inspected, but
// never inherit draft/community numbers as playable ship stats.
export function shipCatalogEntries(catalog={}){
 const units=catalog.units||{},archive=catalog.shipArchive||catalog.ships||[],rows=new Map();
 for(const record of archive){if(units[record.id]?.fleetAvailable===false)continue;const unit=units[record.id];rows.set(record.id,{id:record.id,name:unit?.name||record.name||record.id,type:unit?.type||'archive',archive:record,unit:unit||null});}
 for(const unit of Object.values(units))if(unit.fleetAvailable!==false&&!rows.has(unit.id))rows.set(unit.id,{id:unit.id,name:unit.name||unit.id,type:unit.type,archive:null,unit});
 return [...rows.values()];
}

export function shipCatalogCounters(catalog,id){
 const units=catalog?.units||{},unit=units[id];
 if(!unit)return null;
 return {attacks:Object.entries(unit.splashMultipliers||{}).filter(([,rate])=>rate>0),receives:Object.values(units).filter(u=>u.splashMultipliers?.[id]>0).map(u=>[u.id,u.splashMultipliers[id]])};
}

const styles=`
.detail .ship-description{white-space:pre-line;font-size:13px;line-height:1.9;color:#b7cac2;overflow-wrap:anywhere}
.ship-quotation{margin:18px 0;padding:14px 12px;border-block:1px solid #b9d6c632;background:linear-gradient(100deg,#8fbbaa0d,transparent);color:#d7dfcf}
.ship-quotation blockquote{margin:0;text-wrap:balance;font:italic 15px/1.85 Georgia,"Noto Serif SC","Songti SC",SimSun,serif;overflow-wrap:anywhere}
.ship-quotation figcaption{margin-top:10px;text-align:right;color:#9cb3ad;font-size:12px;line-height:1.8}
.ship-quotation a{display:block;color:#91a69c;font-size:11px;overflow-wrap:anywhere}
.ship-quotation a:hover,.ship-quotation a:focus-visible{color:#b2e3ce;text-decoration:underline}

:host{display:block;height:100%;min-height:0;color:#deede7;font:13px Bahnschrift,"Microsoft YaHei",sans-serif;pointer-events:none}*{box-sizing:border-box}button,input{font:inherit;color:inherit}button{cursor:pointer;border:1px solid #a6dbc632;border-radius:3px;background:#182924;padding:9px 12px}button:hover,button:focus-visible{border-color:#a6dbc6;outline:none}button[aria-pressed=true]{background:#284137;color:#c8f8df}button:disabled{opacity:.5;cursor:default}input{width:100%;min-width:0;background:#0b151c;border:1px solid #a6dbc638;padding:10px;border-radius:3px}h2,h3,p{margin:0}h2{font-weight:500;font-size:27px}h3{font-weight:500;font-size:13px;margin:18px 0 9px}small,.muted{color:#9cb3ad;font-size:11px;line-height:1.8}a{color:#b2e3ce;text-decoration:none}img{object-fit:contain}header,.panel,.tools,dialog{pointer-events:auto;background:#0d191fe8;backdrop-filter:blur(8px)}.shell{height:100%;display:grid;grid-template-columns:220px minmax(0,1fr) 310px;grid-template-rows:auto minmax(0,1fr);gap:14px;padding:16px}.header{grid-column:1/-1;display:flex;align-items:center;gap:16px;padding:10px 14px;border:1px solid #a6dbc625}.header strong{font-size:18px;font-weight:500}.header small{margin-right:auto}.panel{min-height:0;border:1px solid #a6dbc62a;padding:14px;border-radius:4px}.catalog{display:flex;flex-direction:column;gap:12px}.list{overflow:auto;min-height:0;display:flex;flex-direction:column;gap:6px}.list button{display:flex;align-items:center;gap:8px;text-align:left;background:#16302a55;border-color:transparent;padding:7px}.list button[aria-pressed=true]{border-color:#a6dbc6a0;background:#25433780}.list img{width:64px;height:47px}.list span{display:flex;flex-direction:column;gap:4px}.list b{font-weight:500}.viewport{position:relative;min-width:0;pointer-events:none}.caption{margin:14px 12px;color:#c7d7d0;text-shadow:0 1px 4px #000}.caption p{margin-top:10px;line-height:1.6}.tools{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:8px;padding:10px;border:1px solid #a6dbc62a}.detail{overflow:auto}.stats{display:grid;grid-template-columns:1fr 1fr;gap:9px}.stat{padding:9px 0;border-bottom:1px solid #a6dbc624;display:flex;flex-direction:column;gap:5px}.stat b{font-size:18px;font-weight:500}.counter{display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid #a6dbc61b;padding:4px 0}.counter button{padding:5px 0;background:none;border:0;text-align:left}.detail p{line-height:1.8;color:#a4bbb3;font-size:12px}.status{position:absolute;top:100px;left:12px;right:12px;text-shadow:0 1px 4px #000}.status:empty{display:none}dialog{max-width:min(1100px,94vw);max-height:85vh;padding:18px;color:#deede7;border:1px solid #a6dbc64a;border-radius:4px}dialog::backdrop{background:#02090bc0}.dialog-header{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:15px}.table-scroll{overflow:auto;max-height:65vh}table{border-collapse:collapse;font-size:11px;white-space:nowrap}th,td{padding:10px;border:1px solid #a6dbc62a;text-align:right}th:first-child{text-align:left;position:sticky;left:0;background:#12222a}.empty{padding:24px 8px;color:#9cb3ad}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#85af9b55}@media(max-width:1000px){.shell{grid-template-columns:180px minmax(100px,1fr) 245px;padding:8px;gap:8px}.panel{padding:10px}.list img{width:45px}.header small{display:none}.header strong{margin-right:auto}.tools{flex-wrap:wrap}}@media(max-width:720px){.shell{grid-template-columns:145px minmax(0,1fr);grid-template-rows:auto 280px minmax(0,1fr);overflow:auto}.catalog{grid-row:2/4}.viewport{grid-column:2;grid-row:2}.detail{grid-column:2;grid-row:3}.header{padding:8px}.header strong{font-size:15px}.list img{display:none}.caption{margin:6px}.caption h2{font-size:22px}}
`;

/** A DOM-only inspector. WorldRuntime owns the model, camera and all rendering. */
export function mountShipCatalog(container,{catalog={},world,onClose=()=>{}}={}){
 const host=document.createElement('div');host.className='universe-ship-catalog';host.style.cssText='height:100%;pointer-events:none';container.replaceChildren(host);
 const shadow=host.attachShadow({mode:'open'});shadow.innerHTML=`<style>${styles}</style><section class="shell"><header class="header"><strong>舰船档案</strong><small>当前殖民地 · 轨道船坞</small><button data-action="compare">性能对照</button><button data-action="matrix">溅射倍率</button><button data-action="close">返回星图</button></header><aside class="panel catalog"><input type="search" aria-label="搜索舰船档案" placeholder="搜索舰型"><div class="list"></div></aside><section class="viewport" aria-label="轨道船坞中的选中舰船"><div class="caption"></div><p class="status" role="status"></p><div class="tools"><button data-action="focus">复位舰船视角</button><button data-action="dock">定位太空电梯</button></div></section><aside class="panel detail"></aside></section><dialog><div class="dialog-header"><h2></h2><button data-action="dismiss">关闭</button></div><div class="table-scroll"></div><p class="muted">基础目录参数；科技加成和实际任务会影响最终表现。</p></dialog>`;
 const $=selector=>shadow.querySelector(selector),list=$('.list'),detail=$('.detail'),caption=$('.caption'),status=$('.status'),dialog=$('dialog');
 let rows=shipCatalogEntries(catalog),selected=null,query='',disposed=false,selection=0;
 const label=id=>catalog.units?.[id]?.name||rows.find(row=>row.id===id)?.name||id;
 function renderList(){const filtered=rows.filter(row=>(row.name+' '+row.id).toLowerCase().includes(query.toLowerCase()));list.innerHTML=filtered.length?filtered.map(row=>`<button data-ship="${escape(row.id)}" aria-pressed="${row.id===selected}">${row.unit?`<img src="${image(row.id)}" alt="">`:""}<span><b>${escape(row.name)}</b><small>${escape({combat:'战斗舰船',civilian:'民用舰船',defense:'行星防御',archive:'舰船档案'}[row.type]||'舰船')}</small></span></button>`).join(''):'<p class="empty">没有匹配的舰型</p>';}
 const counterHTML=(entries,incoming=false)=>entries.length?entries.map(([id,rate])=>`<div class="counter"><button data-ship="${escape(id)}">${escape(label(id))}</button><b>×${number(rate)} / ${Math.round((incoming?catalog.units?.[id]?.criticalChances?.[selected]||0:catalog.units?.[selected]?.criticalChances?.[id]||0)*1e4)/100}%</b></div>`).join(''):'<p>无溅射目标</p>';
 function renderDetail(){
  const row=rows.find(row=>row.id===selected);if(!row){caption.innerHTML='';detail.innerHTML='<p class="empty">暂无舰船档案</p>';return;}
  const {unit,archive}=row,counters=shipCatalogCounters(catalog,selected);
  caption.innerHTML=`<h2>${escape(row.name)}</h2><p>${escape(archive?.weaponLayout?.role||'')}<br><small>${unit?.type==='defense'?'行星保障中心':'拖动空间旋转 · 滚轮缩放'}</small></p>`;
  detail.innerHTML=`<h3>基础参数 · 科技加成前</h3><div class="stats">${fields.map(([key,name])=>`<div class="stat"><small>${name}</small><b>${number(unit?.[key])}</b></div>`).join('')}</div>${unit?.statsLabel?`<p>${escape(unit.statsLabel)}${unit.statsNote?`<br>${escape(unit.statsNote)}`:""}<br>${escape(unit.economyLabel)}${unit.statsSource?.startsWith("https:")?` · <a href="${escape(unit.statsSource)}" target="_blank" rel="noopener">查看来源 ↗</a>`:""}</p>`:""}<h3>武器配置</h3><p>${escape((unit?.weapons||[]).map(w=>w.name).join(' · ')||archive?.weaponLayout?.primary||'未配置武器')}</p><h3>范围与暴击</h3><div class="stats"><div class="stat"><small>溅射半径 · 空间单位</small><b>${number(unit?.splashRadius??0)}</b></div><div class="stat"><small>暴击伤害</small><b>×2</b></div></div><p>暴击率 = 1 − 1 ÷ 倍率；倍率 0、1 均不暴击。</p><h3>建造要求</h3><p>${unit?['金属 '+number(unit.cost?.[0]),'晶体 '+number(unit.cost?.[1]),'气体 '+number(unit.cost?.[2])].join(' / '):'暂未开放建造'}</p>${unit?`<p>${(unit.req||[]).map(([id,level])=>escape(catalog.tech?.[id]?.name||catalog.buildings?.[id]?.name||({Shipyard:'太空电梯',Missile_Silo:'行星保障中心'})[id]||id)+' Lv '+number(level)).join(' · ')}${unit.parts?'<br>外星部件 '+number(unit.parts):''}</p>`:''}<h3>溅射倍率 / 暴击率 · 对以下目标</h3>${counters?counterHTML(counters.attacks):'<p>暂未开放</p>'}<h3>受到以下单位的溅射倍率 / 暴击率</h3>${counters?counterHTML(counters.receives,true):'<p>暂未开放</p>'}<p class="muted">仅周围目标受溅射：基础伤害 × 倍率 × 距离衰减。未列出的目标为 ×0，免疫溅射和暴击；直接命中只受基础伤害。</p>${shipLoreHTML(archive||unit)}${archive?.playable&&row.type!=='defense'?`<h3>演练工具</h3><a href="/opendesign/mockups/galactic-command/hangar-three.html?entry=direct-flight-01&amp;ship=${encodeURIComponent(row.id)}" target="_blank" rel="noopener">打开独立靶场 ↗</a>`:''}`;
 }
 async function select(id,{focus=true}={}){
  const row=rows.find(row=>row.id===id);if(disposed||!row)return false;const changed=selected!==id;selected=id;const token=++selection;renderList();renderDetail();if(changed)detail.scrollTop=0;status.textContent='';
  if(!focus)return true;
  try{
   if(row.type==='defense'||row.unit?.missile){world?.hideShip?.();world?.selectBuilding?.('Missile_Silo');return true;}
   if(typeof world?.showShip!=='function'){status.textContent='船坞正在准备，请稍后重试。';return false;}
   await world.showShip(id);return !disposed&&token===selection;
  }catch(error){if(!disposed&&token===selection)status.textContent='舰船模型暂不可用。';return false;}
 }
 function table(matrix){
  const available=rows.filter(row=>row.unit),targets=available.filter(row=>!row.unit.missile);
  dialog.querySelector('h2').textContent=matrix?'舰队溅射倍率表':'舰型性能对照';
  dialog.querySelector('.muted').textContent=matrix?'溅射倍率 r 对应暴击率 1 − 1/r，暴击伤害 ×2；r 为 0 或 1 时不暴击。×0 免疫溅射，直击仍受基础伤害。':'基础目录参数；科技加成和实际任务会影响最终表现。';
  $('.table-scroll').innerHTML=`<table><thead><tr><th>${matrix?'攻击方 ↓ / 目标 →':'舰型'}</th>${(matrix?targets.map(row=>row.name):fields.map(([,name])=>name)).map(name=>'<th>'+escape(name)+'</th>').join('')}</tr></thead><tbody>${available.map(row=>`<tr><th><button data-ship="${escape(row.id)}">${escape(row.name)}</button></th>${(matrix?targets.map(target=>'×'+number(row.unit.splashMultipliers?.[target.id]??0)):fields.map(([key])=>number(row.unit[key]))).map(value=>'<td>'+value+'</td>').join('')}</tr>`).join('')}</tbody></table>`;
  if(!dialog.open)dialog.showModal();
 }
 const click=event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.ship){if(dialog.open)dialog.close();void select(button.dataset.ship);return;}switch(button.dataset.action){case 'close':onClose();break;case 'focus':world?.hideShip?.();void select(selected);break;case 'dock':world?.hideShip?.();world?.selectBuilding?.('Shipyard');break;case 'compare':table(false);break;case 'matrix':table(true);break;case 'dismiss':dialog.close();break;}};
 shadow.addEventListener('click',click);$('input').addEventListener('input',event=>{query=event.target.value;renderList();});
 // Avoid broken optional artwork obscuring the functional DOM catalogue.
 shadow.addEventListener('error',event=>{if(event.target.tagName==='IMG')event.target.hidden=true;},true);
 renderList();renderDetail();void select(rows.some(row=>row.id===world?.previewId)?world.previewId:rows.some(row=>row.id==='Battleship')?'Battleship':rows[0]?.id);
 return {select,get selected(){return selected;},update(next){catalog=next||{};rows=shipCatalogEntries(catalog);if(rows.some(row=>row.id===selected)){renderList();renderDetail();}else if(rows.length)void select(rows[0].id);else{selected=null;selection++;world?.hideShip?.();renderList();renderDetail();}},dispose(){if(disposed)return;disposed=true;selection++;world?.hideShip?.();if(dialog.open)dialog.close();host.remove();}};
}
