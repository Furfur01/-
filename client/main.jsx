import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Globe,Orbit,Rocket,Mail,Grid2X2,ShoppingBag,Settings,MessageCircle,ChevronDown,Shield,FlaskConical,ChevronRight,Plus,Volume2,TriangleAlert,Ship,Users} from 'lucide-react';
import {Game,Sprite,Resource,number,compact,Modal,Progress,timeLeft} from './common.jsx';
import {Base,BuildingModal,EconomyModal,Research,Shipyard,UnitModal} from './base.jsx';
import {Galaxy,Fleet,FlightList,MoonOperations} from './fleets.jsx';
import {Reports} from './battle.jsx';
import {More,SettingsModal,Alliance,Chat,Rankings,Shop} from './social.jsx';
import {OriginalArchive} from './archive.jsx';

function App(){
  const[state,setState]=useState(null),[catalog,setCatalog]=useState(null),[page,setPage]=useState('base'),[planetId,setPlanetId]=useState(localStorage.getItem('galaxy.planet')||''),[modal,setModal]=useState(null),[destination,setDestination]=useState(null),[busy,setBusy]=useState(false),[toast,setToast]=useState(''),[error,setError]=useState(''),[now,setNow]=useState(Date.now()),[notice,setNotice]=useState(false);
  const offset=useRef(0),latest=useRef(0),unreadBefore=useRef(null);
  function update(data){if(data.now<latest.current)return;latest.current=data.now;offset.current=data.now-Date.now();setState(data);setNow(data.now);const count=data.reports.filter(r=>!r.read).length;if(unreadBefore.current!==null&&count>unreadBefore.current){setNotice(true);setTimeout(()=>setNotice(false),5000);}unreadBefore.current=count;}
  useEffect(()=>{let alive=true,inflight=false;async function load(){if(inflight)return;inflight=true;try{const response=await fetch('/api/state');if(!response.ok)throw new Error();const data=await response.json();if(alive){update(data);setError('');}}catch{if(alive)setError('连接中断，正在重连…');}finally{inflight=false;}}fetch('/api/catalog').then(r=>r.json()).then(c=>alive&&setCatalog(c)).catch(()=>setError('无法读取游戏数据'));load();const timer=setInterval(load,1200),clock=setInterval(()=>setNow(Date.now()+offset.current),250);return()=>{alive=false;clearInterval(timer);clearInterval(clock);};},[]);
  async function act(action){if(busy)return false;setBusy(true);try{const res=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action)}),data=await res.json();if(!res.ok)throw new Error(data.error||'操作失败');update(data);return true;}catch(e){setToast(e.message);setTimeout(()=>setToast(''),3500);return false;}finally{setBusy(false);}}
  function switchPlanet(id){setPlanetId(id);localStorage.setItem('galaxy.planet',id);setModal(null);setDestination(null);setPage('base');}
  if(!state||!catalog)return <div className="loading-screen"><div className="loading-crest"><Orbit size={60}/></div><h1>银河帝国</h1><span>{error||'连接银河网络…'}</span><div className="loading-line"/></div>;
  const planet=state.planets.find(p=>p.id===planetId)||state.planets.find(p=>p.id===state.player.home)||state.planets[0],unread=state.reports.filter(r=>!r.read).length;
  const selectPage=value=>{setPage(value);setModal(null);};
  const context={state,catalog,planet,now,act,busy,setPage:selectPage,setModal,destination,setDestination};
  const pages={base:<Base/>,galaxy:<Galaxy/>,fleet:<Fleet key={planet.id}/>,research:<Research/>,shipyard:<Shipyard/>,reports:<Reports/>,more:<More/>,archive:<OriginalArchive/>,alliance:<Alliance/>,chat:<Chat/>,rankings:<Rankings/>,shop:<Shop/>,wormhole:<MoonOperations/>,scan:<MoonOperations scan/>};
  const nav=[['base','星球',Globe],['galaxy','星图',Orbit],['shipyard','造舰',Ship],['research','研究',FlaskConical],['fleet','舰队',Users],['reports','消息',MessageCircle]];
  const flying=state.missions.filter(m=>!m.inbound).length;
  return <Game.Provider value={context}><div className="space-backdrop"/><main className={`game-frame view-${page}`}>
    <header className="command-header"><button className="game-brand" onClick={()=>selectPage('base')}>银河帝国<small>GALAXY EMPIRE</small></button><div className="resource-grid">
      {['金属','晶体','重氢','能源','暗物质'].map((name,i)=><button className="resource-chip" key={name} aria-label={name+'资源详情'} onClick={()=>i===4?selectPage('shop'):setModal({type:'economy'})}><Resource type={[0,1,2,4,3][i]}><small>{name}</small><b className={i===3&&planet.economy.supply<planet.economy.demand?'negative':''}>{compact(i<3?planet.resources[i]:i===3?planet.economy.supply-planet.economy.demand:state.player.darkMatter)}</b></Resource></button>)}
    </div><button className="header-more" aria-label="更多" onClick={()=>selectPage('more')}><Settings size={20} strokeWidth={1.6}/><span>更多</span></button></header>
    <section className="game-content" key={planet.id+page}>{pages[page]||pages.base}</section>
    <button className="colony-switcher" onClick={()=>setModal({type:'planets'})} aria-label="切换星球"><span className={`planet-ball ${planet.moon?'moon':'planet-'+planet.position[2]%5}`}/><span><b>{planet.name}</b><small>[{planet.position.join(':')}] · 效率 {Math.round(planet.economy.ratio*100)}%</small></span><ChevronDown size={14}/></button>
    <nav className="bottom-nav" aria-label="主导航">{nav.map(([id,label,Icon])=><button key={id} aria-current={page===id?'page':undefined} className={page===id?'active':''} onClick={()=>selectPage(id)}><span><Icon size={21}/>{id==='reports'&&unread>0&&<i>{unread}</i>}{id==='fleet'&&flying>0&&<i>{flying}</i>}</span><b>{label}</b></button>)}</nav>
    {error&&<div className="connection-banner" role="status">{error}</div>}{notice&&page!=='reports'&&<button className="new-report" onClick={()=>{selectPage('reports');setNotice(false);}}><Mail size={20}/>收到新消息<ChevronRight size={17}/></button>}
    </main>{modal?.type==='building'&&<BuildingModal id={modal.id} onClose={()=>setModal(null)}/>} {modal?.type==='unit'&&<UnitModal id={modal.id} onClose={()=>setModal(null)}/>} {modal?.type==='economy'&&<EconomyModal onClose={()=>setModal(null)}/>} {modal?.type==='settings'&&<SettingsModal onClose={()=>setModal(null)}/>} {modal?.type==='planets'&&<Modal title="星球" onClose={()=>setModal(null)}>{state.planets.map(p=><button className={`modal-planet ${p.id===planet.id?'selected':''}`} key={p.id} onClick={()=>switchPlanet(p.id)}><span className={`planet-ball ${p.moon?'moon':'planet-'+p.position[2]%5}`}/><span><b>{p.name}{p.moon?' · 月球':''}</b><small>[{p.position.join(':')}]</small></span><ChevronRight/></button>)}</Modal>}{toast&&<div role="status" className="toast"><TriangleAlert size={18}/>{toast}</div>}</Game.Provider>;
}
createRoot(document.getElementById('root')).render(<App/>);
