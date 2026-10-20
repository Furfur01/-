import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,Network,Orbit} from 'lucide-react';
import Research from './Research.jsx';
import Shipyard from './Shipyard.jsx';
import {createData,createView} from './data.mjs';
import {operationWorld,focusOperationFacility} from './world-host.mjs';

function Operations({api,page,navigate,act}){
 const [,tick]=useState(0),[selection,setSelection]=useState({selectedTech:'Energy_Tech',selectedShip:'Cruiser',goal:null});
 useEffect(()=>{const unsubscribe=api.subscribe(()=>tick(n=>n+1)),timer=setInterval(()=>tick(n=>n+1),500);return()=>{unsubscribe();clearInterval(timer);};},[api]);
 const p=api.planet,player=api.state.player;
 useEffect(()=>{if(page==='research')focusOperationFacility(operationWorld(),'research');},[page,p.id]);
 const data=useMemo(()=>createData(api.catalog,p,player),[api.catalog,p,player]);
 const view=createView(api,selection);
 const select=(key,id)=>setSelection(s=>({...s,[key]:id}));
 const research=id=>{select('selectedTech',id);navigate('research');};
 const ship=id=>{const item=api.catalog.units[id];if(item?.type==='defense'){navigate('defense',{defenseGroup:id});return;}select('selectedShip',id);navigate('shipyard');};
 return <div className="p0-app"><div className="operations-context"><button onClick={()=>navigate('home')}><ArrowLeft size={15}/>返回星球</button><span>{p.name} <small>[{p.position.join(':')}]</small></span><small>{page==='research'?`研究实验室 Lv ${p.buildings.Research_Lab||0}`:p.moon?`太空电梯 Lv ${p.buildings.Shipyard||0} · 旗舰中心 Lv ${p.buildings.Flagship_Center||0}`:`太空电梯 Lv ${p.buildings.Shipyard||0}`}{p.storage?.shared?' · 使用恒星系共享资源':''}</small><button onClick={()=>navigate(page==='research'?'shipyard':'research')}>{page==='research'?<Orbit size={16}/>:<Network size={16}/>} {page==='research'?'轨道船坞':'科技树'}</button></div>
  <div className="operations-body">{page==='research'?<Research data={data} view={view} onSelect={id=>select('selectedTech',id)} onGoal={id=>select('goal',id)} onShip={ship} onStart={id=>act({type:'research',id,planet:p.id},'研究已开始')} onCancel={()=>act({type:'cancel',kind:'research',planet:view.research.planet},'研究已取消，资源已返还')}/>:<Shipyard data={data} view={view} onSelect={id=>select('selectedShip',id)} onResearch={research} onBuild={(item,count)=>act({type:'ship',id:item.id,count,planet:p.id},'已加入生产队列')}/>}</div></div>;
}

let root=null,host=null;
function unmount(){if(root)root.unmount();host?.remove();root=null;host=null;}
function show(container,options){
 if(!root||host?.parentNode!==container){unmount();host=document.createElement('div');host.className='p0-operation-root';container.replaceChildren(host);const shadow=host.attachShadow({mode:'open'}),style=document.createElement('link');style.rel='stylesheet';style.href='/opendesign/mockups/galactic-command/operations.css';shadow.append(style);const mount=document.createElement('div');mount.className='p0-mount';shadow.append(mount);root=createRoot(mount);}
 root.render(<Operations {...options}/>);
}
window.CommandOperations={show,unmount};
