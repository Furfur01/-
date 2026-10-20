import Civics from './Civics.jsx';
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,Shield,Landmark,Package,Building2} from 'lucide-react';
import Construction from './Construction.jsx';
import Fleet from './Fleet.jsx';
import Defense from './Defense.jsx';
import Court,{Plan} from './Court.jsx';
import Secondary from './Secondary.jsx';
import {planetArt} from './shared.jsx';
import {createUIAudio} from '../ui-audio.mjs';
import {createBackgroundMusic,commandMusicScene} from '../background-music.mjs';

window.EmpireUIAudio=createUIAudio();
window.EmpireMusic=createBackgroundMusic();
window.EmpireMusic.commandScene=commandMusicScene;

export const pages={civics:['CIVIC HALL / PUBLIC POLICY','市政厅'],buildings:['COLONY / CONSTRUCTION','殖民地建设'],defense:['PLANETARY SUPPORT','行星保障中心'],fleet:['FLEET OPERATIONS','舰队行动'],empire:['CIVIC ADMINISTRATION','帝国总览'],logistics:['SYSTEM LOGISTICS','恒星系物流'],reports:['INTELLIGENCE & REPORTS','战报与消息'],more:['COMMAND CENTER','指挥中心'],rankings:['EMPIRE RANKINGS','帝国排名'],alliance:['ALLIANCE COMMAND','联盟'],chat:['COMMUNICATIONS','通讯频道'],shop:['SUPPLY EXCHANGE','物资兑换'],moon:['LUNAR OPERATIONS','月球行动'],missiles:['STRATEGIC WEAPONS','战略导弹'],settings:['EMPIRE SETTINGS','帝国设置']};
function Workspace({api,page,act,navigate,helpers={}}){
 const [,tick]=useState(0),[plan,setPlan]=useState(null);
 useEffect(()=>{const unsubscribe=api.subscribe(()=>tick(n=>n+1)),timer=setInterval(()=>tick(n=>n+1),500);return()=>{unsubscribe();clearInterval(timer);};},[api]);
 useEffect(()=>setPlan(null),[page,api.planet?.id]);
 const p=api.planet,meta=pages[page]||pages.more,shared={...helpers,openPlan:setPlan,openPlanet:id=>{api.setPlanet(id);navigate('buildings');}};
 const links=page==='buildings'?[['defense','行星防务',Shield],['empire','建设计划',Landmark]]:page==='defense'?[['shipyard','轨道船坞',Building2],['missiles','战略导弹',Shield]]:page==='fleet'?[['logistics','物流中心',Package],['missiles','战略导弹',Shield]]:page==='empire'?[['civics','市政厅',Landmark]]:[];
 return <div className="ui-app" data-page={page}><header className="ui-heading"><div><span className="eyebrow">{meta[0]}</span><h1>{meta[1]}</h1></div><nav className="ui-context-links" aria-label="相关工作区">{links.map(([id,title,Icon])=><button key={id} onClick={()=>id==='empire'&&page==='buildings'&&!p.moon?setPlan(p.id):navigate(id)}><Icon size={13}/> {title}</button>)}</nav>{page!=='empire'&&<div className="ui-heading-context"><img src={planetArt(p)} alt=""/><span>{p.name}<small>{p.position.join(' : ')}{p.storage?.shared?' · 同系共享仓库':''}</small></span></div>}<button className="text-button" onClick={()=>navigate('home')}><ArrowLeft size={15}/>返回星球</button></header><main className="ui-body">{page==='civics'?<Civics api={api} act={act}/>:page==='buildings'?<Construction key={p.id} api={api} act={act} navigate={navigate} helpers={shared}/>:page==='defense'?<Defense key={p.id+'-'+(helpers.initialFilter||'turret')} api={api} act={act} navigate={navigate} helpers={shared}/>:page==='fleet'?<Fleet key={p.id+'-'+(helpers.initialFilter||'dispatch')} api={api} act={act} navigate={navigate} helpers={shared}/>:page==='empire'?<Court api={api} act={act} navigate={navigate} helpers={shared}/>:<Secondary key={page+'-'+p.id} api={api} page={page} act={act} navigate={navigate} helpers={shared}/>}</main>{plan&&<Plan api={api} planetId={plan} act={act} onClose={()=>setPlan(null)} navigate={navigate} helpers={shared}/>}</div>;
}
let root,host;
function unmount(){root?.unmount();host?.remove();root=null;host=null;}
function show(container,options){
 if(!root||host?.parentNode!==container){unmount();host=document.createElement('div');host.className='command-ui-root';container.replaceChildren(host);const shadow=host.attachShadow({mode:'open'}),style=document.createElement('link');style.rel='stylesheet';style.href='/opendesign/mockups/galactic-command/command-ui.css';shadow.append(style);const mount=document.createElement('div');mount.className='ui-mount';shadow.append(mount);root=createRoot(mount);}
 host.dataset.page=options.page;root.render(<Workspace {...options}/>);
}
window.CommandUI={show,unmount,supports:page=>Object.hasOwn(pages,page)};
