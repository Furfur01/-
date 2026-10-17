import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Building2,Shield,Navigation,Landmark,ChevronDown,RotateCcw,Pause,Play,Check,ChevronRight} from 'lucide-react';
import Construction from './Construction.jsx';
import Defense from './Defense.jsx';
import Fleet from './Fleet.jsx';
import Court,{Plan} from './Court.jsx';
import {fresh,action,advance,stock,compact,planetTypes} from './model.mjs';
import {resourceIcons} from './common.jsx';
const STORE='galaxy-empire-p1-independent-v1';
const screens=[['construction','殖民地建设',Building2,'CONSTRUCTION','建设与发展'],['defense','行星防务',Shield,'DEFENSE','行星防务'],['fleet','舰队行动',Navigation,'FLEET OPERATIONS','舰队行动'],['court','帝国王庭',Landmark,'IMPERIAL COURT','帝国内政']];
function load(){let saved;try{saved=JSON.parse(localStorage.getItem(STORE));}catch{}const s=saved?.version===1&&saved.planets?.length&&saved.missions&&saved.tech?saved:fresh();const route=location.hash.slice(1);if(screens.some(x=>x[0]===route))s.screen=route;return s;}
function App(){
 const [state,setState]=useState(load),[plan,setPlan]=useState(null),[toast,setToast]=useState(''),[fleetTab,setFleetTab]=useState('dispatch');
 const p=state.planets.find(p=>p.id===state.selected)||state.planets[0],current=screens.find(x=>x[0]===state.screen)||screens[0];
 useEffect(()=>{const t=setInterval(()=>setState(advance),1000);return()=>clearInterval(t);},[]);
 useEffect(()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}},[state]);
 useEffect(()=>{if(state.notice)setToast(state.notice);},[state.notice]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3600);return()=>clearTimeout(t);},[toast]);
 useEffect(()=>{const sync=()=>{const screen=location.hash.slice(1);if(screens.some(x=>x[0]===screen))setState(s=>({...s,screen}));};window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
 const go=screen=>{location.hash=screen;setState(s=>({...s,screen}));setPlan(null);};
 const send=a=>setState(s=>action(s,a));
 const openPlanet=id=>{send({type:'select',id});go('construction');};
 return <div className="command-app"><header className="app-header"><a className="brand" href="#construction"><span className="brand-mark"><i/><i/><i/></span><span>银河帝国<small>GALACTIC EMPIRE</small></span></a><nav className="primary-nav" aria-label="P1工作区">{screens.map(([id,title,Icon])=><button key={id} className={state.screen===id?'active':''} aria-current={state.screen===id?'page':undefined} onClick={()=>{if(id==='fleet')setFleetTab('dispatch');go(id);}}><Icon size={18}/><span>{title}</span></button>)}</nav><div className="header-resources">{stock(state,p).map((n,i)=>{const Icon=resourceIcons[i];return <div key={i}><Icon size={17}/><span><b>{compact(n)}</b><small>{['金属','晶体','气体'][i]}</small></span></div>;})}</div><span className="preview-badge"><i/>P1 预览</span></header>
 <div className="page-header"><div><span className="eyebrow">{current[3]}</span><h1>{current[4]}</h1></div><div className="planet-context"><img src={`assets/planets/${p.biome}.png`} alt=""/><label><span>当前殖民地</span><select aria-label="当前示例殖民地" value={p.id} onChange={e=>{send({type:'select',id:e.target.value});setFleetTab('dispatch');}}>{state.planets.map(x=><option key={x.id} value={x.id}>{x.name} · {x.position.join(':')}</option>)}</select></label><ChevronDown size={14}/><small>{planetTypes[p.biome].name}<br/>{p.position[1]===16?'同系共享库存':'独立库存'}</small></div></div>
 <main className="app-main">{state.screen==='construction'?<Construction key={p.id} state={state} p={p} send={send} onPlan={()=>setPlan(p.id)}/>:state.screen==='defense'?<Defense key={p.id} state={state} p={p} send={send}/>:state.screen==='fleet'?<Fleet key={p.id+'-'+fleetTab} state={state} p={p} send={send} initialTab={fleetTab}/>:<Court state={state} send={send} onOpenPlanet={openPlanet} onPlan={setPlan} onFleet={()=>{setFleetTab('missions');go('fleet');}}/>}</main>
 <footer className="app-footer"><span><i className="status-dot"/>P1 界面测试<ChevronRight size={12}/><span>独立示例 · 未接入正式存档</span></span><div className="demo-controls"><button aria-label={state.speed?'暂停演示':'继续演示'} onClick={()=>setState(s=>({...s,speed:s.speed?0:1}))}>{state.speed?<Pause size={14}/>:<Play size={14}/>}</button><label>模拟时间<select aria-label="演示速度" value={state.speed} onChange={e=>setState(s=>({...s,speed:Number(e.target.value)}))}><option value="0">暂停</option><option value="1">1×</option><option value="20">20×</option><option value="60">60×</option></select></label><button onClick={()=>{const s=fresh();s.screen=state.screen;setState(s);setPlan(null);setToast('示例已重置');}}><RotateCcw size={14}/>重置示例</button></div></footer>
 {plan&&<Plan state={state} planetId={plan} send={send} onClose={()=>setPlan(null)}/>} {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
