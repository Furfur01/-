import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Orbit,Network,Image,RotateCcw,ArrowUpRight,Check,Pause,Play,ChevronRight} from 'lucide-react';
import Shipyard from './Shipyard.jsx';
import Research from './Research.jsx';
import {newDemo,ships,techById,techCost,buildSeconds,requirements,compact,number} from './data.js';
import {ResourceIcons,resourceNames} from './common.jsx';

const STORE='galaxy-empire-p0-independent-v1';
function load(){let data;try{data=JSON.parse(localStorage.getItem(STORE));}catch{}const initial=data?.version===1&&data.resources?.length===3&&data.levels&&Array.isArray(data.queue)?data:newDemo();const route=location.hash.slice(1);if(['research','shipyard','concepts'].includes(route))initial.screen=route;return initial;}
function advance(current){if(!current.speed)return current;let s={...current,owned:{...current.owned},queue:current.queue.map(q=>({...q})),levels:{...current.levels}};let elapsed=s.speed;
 while(elapsed>0&&s.queue.length){const q=s.queue[0],step=Math.min(elapsed,q.each-q.elapsed);q.elapsed+=step;elapsed-=step;if(q.elapsed>=q.each){q.elapsed=0;q.remaining--;s.owned[q.id]=(s.owned[q.id]||0)+1;if(q.remaining<=0)s.queue.shift();}else break;}
 if(s.research){s.research={...s.research,elapsed:s.research.elapsed+s.speed};if(s.research.elapsed>=s.research.duration){s.levels[s.research.id]++;s.research=null;}}
 return s;
}
function App(){
 const [demo,setDemo]=useState(load),[toast,setToast]=useState(''),[concept,setConcept]=useState('research');
 useEffect(()=>{const timer=setInterval(()=>setDemo(advance),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{localStorage.setItem(STORE,JSON.stringify(demo));},[demo]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer);},[toast]);
 useEffect(()=>{const hash=()=>{const route=location.hash.slice(1);if(['research','shipyard','concepts'].includes(route))setDemo(s=>({...s,screen:route}));};window.addEventListener('hashchange',hash);return()=>window.removeEventListener('hashchange',hash);},[]);
 const screen=page=>{location.hash=page;setDemo(s=>({...s,screen:page}));};
 const selectTech=id=>setDemo(s=>({...s,selectedTech:id}));
 const openTech=id=>{selectTech(id);screen('research');};
 const openShip=id=>{setDemo(s=>({...s,selectedShip:id}));screen('shipyard');};
 const build=(ship,count)=>{if(!Number.isInteger(count)||count<1)return;const cost=ship.cost.map(n=>n*count);if(cost.some((n,i)=>n>demo.resources[i])||requirements(ship,demo.levels).some(r=>r.current<r.level)||demo.queue.length>=8)return;setDemo(s=>({...s,resources:s.resources.map((n,i)=>n-cost[i]),queue:[...s.queue,{key:crypto.randomUUID(),id:ship.id,count,remaining:count,elapsed:0,each:buildSeconds(ship)}]}));setToast(`${ship.name} × ${count} 已加入示例队列`);};
 const cancelShip=key=>{setDemo(s=>{const q=s.queue.find(q=>q.key===key);if(!q)return s;const ship=ships.find(x=>x.id===q.id);return {...s,queue:s.queue.filter(q=>q.key!==key),resources:s.resources.map((n,i)=>n+ship.cost[i]*q.remaining)};});setToast('剩余批次已取消，示例资源已返还');};
 const startResearch=(id,duration)=>{const cost=techCost(id,demo.levels);if(demo.research||cost.some((n,i)=>n>demo.resources[i])||requirements(techById[id],demo.levels).some(r=>r.current<r.level)||(techById[id].energy||0)>12000)return;setDemo(s=>({...s,resources:s.resources.map((n,i)=>n-cost[i]),research:{id,duration,elapsed:0,cost}}));setToast(`${techById[id].name}已开始研究`);};
 const cancelResearch=()=>{setDemo(s=>s.research?{...s,resources:s.resources.map((n,i)=>n+s.research.cost[i]),research:null}:s);setToast('研究已取消，示例资源已返还');};
 const goal=id=>{setDemo(s=>({...s,goal:id}));if(id)setToast(`已标记目标：${techById[id].name}`);};
 const reset=()=>{const s=newDemo();s.screen=demo.screen;setDemo(s);setToast('示例数据已重置');};
 return <div className="command-app">
  <header className="app-header"><a className="brand" href="#research" aria-label="银河帝国科技树"><span className="brand-mark"><i></i><i></i><i></i></span><span>银河帝国<small>GALACTIC EMPIRE</small></span></a><nav className="primary-nav" aria-label="示意页导航">{[['shipyard','轨道船坞',Orbit],['research','科技树',Network]].map(([id,name,Icon])=><button key={id} className={demo.screen===id?'active':''} onClick={()=>screen(id)} aria-current={demo.screen===id?'page':undefined}><Icon size={20}/>{name}</button>)}</nav><div className="header-resources">{demo.resources.map((n,i)=>{const Icon=ResourceIcons[i];return <div key={i} title={`${resourceNames[i]} ${number(n)}`}><Icon size={21}/><span><strong>{compact(n)}</strong><small>{resourceNames[i]}</small></span></div>;})}</div><button aria-label="概念图" className={'concept-link '+(demo.screen==='concepts'?'active':'')} onClick={()=>screen('concepts')}><Image size={17}/><span>概念图</span></button><div className="preview-stamp"><i></i>独立预览<small>示例数据</small></div></header>
  <main className="app-main">{demo.screen==='shipyard'?<Shipyard demo={demo} onSelect={id=>setDemo(s=>({...s,selectedShip:id}))} onBuild={build} onCancel={cancelShip} onResearch={openTech}/>:demo.screen==='research'?<Research demo={demo} onSelect={selectTech} onStart={startResearch} onCancel={cancelResearch} onGoal={goal} onShip={openShip}/>:<div className="concept-screen screen-enter"><div className="concept-heading"><div><span className="eyebrow">IMAGEGEN / DESIGN EXPLORATION</span><h1>从视觉方向，到可操作界面</h1><p>两张原始概念图。可交互页面采用项目现有模型、原始图标和科技前置关系。</p></div><button className="secondary-action" onClick={()=>screen(concept)}>打开对应示意页<ArrowUpRight size={17}/></button></div><div className="concept-tabs"><button className={concept==='shipyard'?'active':''} onClick={()=>setConcept('shipyard')}>01 · 轨道船坞</button><button className={concept==='research'?'active':''} onClick={()=>setConcept('research')}>02 · 科技树</button><a href={`assets/concepts/${concept}.png`} target="_blank" rel="noreferrer">查看原图<ArrowUpRight size={14}/></a></div><img className="concept-image" src={`assets/concepts/${concept}.png`} alt={concept==='research'?'Imagegen 科技树概念图':'Imagegen 轨道船坞概念图'}/><p className="concept-caption">概念图中的文字、数值与连线用于探索视觉；独立页中的科技图标与前置关系以本项目目录为依据。</p></div>}</main>
  <footer className="app-footer"><span><i className="status-dot"></i>新地球<ChevronRight size={11}/>第一恒星系 · 轨道 07</span><p>独立设计示意 · 操作仅影响本页示例数据</p><div className="demo-controls"><button onClick={()=>setDemo(s=>({...s,speed:s.speed?0:1}))} aria-label={demo.speed?'暂停演示':'继续演示'}>{demo.speed?<Pause size={12}/>:<Play size={12}/>}</button><label>演示速度<select aria-label="演示速度" value={demo.speed} onChange={e=>setDemo(s=>({...s,speed:+e.target.value}))}><option value="0">暂停</option><option value="1">1×</option><option value="20">20×</option><option value="60">60×</option></select></label><button onClick={reset}><RotateCcw size={12}/>重置示例</button></div></footer>
  {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
