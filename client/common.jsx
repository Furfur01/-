import React,{createContext,useContext,useState,useEffect,useRef,useId} from 'react';
import {X,ChevronLeft,Clock,Lock,ChevronRight,Box,Diamond,Droplet,CircleDot,Zap} from 'lucide-react';
import originalArt from '../game/original-assets.json';
import {costAt as getCost} from '../game/economy-costs.mjs';

export {originalArt};

export const Game=createContext(null);
export const useGame=()=>useContext(Game);
export const number=n=>Math.floor(n||0).toLocaleString('en-US');
export const compact=n=>Math.abs(n)>=1000000?(n/1000000).toFixed(2)+'M':Math.abs(n)>=10000?(n/1000).toFixed(1)+'K':number(n);
export function timeLeft(end,now=Date.now()){let s=Math.max(0,Math.ceil((end-now)/1000));return s>=3600?`${Math.floor(s/3600)}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`:`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
export const civilianIds=['Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Interceptor_Missile','Interplanetary_Missile'];
export const assetVersion=originalArt.version;
export function Sprite({id,atlas=0,ships=false,technology=false,className='',style={}}){
  const [failed,setFailed]=useState({}),extra=atlas>=16,index=extra?atlas-16:atlas,cols=extra?3:4;
  const directory=technology?'technologies-v2':ships?(civilianIds.includes(id)?'civilian':null):'buildings-v2';
  const original=originalArt[technology?'technology':ships?'units':'buildings'][id];
  const path=original&&!failed[original]?original:directory&&`${directory}/${id}.png`;
  const separate=!!id&&!!path&&!failed[path];
  return <span aria-hidden="true" className={`sprite ${ships?'ships':''} ${extra?'extras':''} ${separate?'separate-art':''} ${original&&path===original?'original-art':''} ${className}`} style={{backgroundPosition:`${index%cols*100/(cols-1)}% ${Math.floor(index/cols)*100/(cols-1)}%`,backgroundSize:`${cols*100}% ${cols*100}%`,...style}}>{separate&&<img src={`./assets/${path}?v=${assetVersion}`} draggable="false" alt="" onError={()=>setFailed(old=>({...old,[path]:true}))}/>}</span>;
}
export function Resource({type,children}){const Icon=[Box,Diamond,Droplet,CircleDot,Zap][type]||Box;return <span className="resource-inline"><Icon aria-hidden="true" size={20} strokeWidth={1.4}/>{children}</span>;}
export function Costs({values,available}){return <div className="costs">{values.map((v,i)=><span key={i} className={available&&available[i]<v?'insufficient':''}><Resource type={i}>{number(v)}</Resource></span>)}</div>;}
export function Progress({queue,label}){const {now}=useGame();return <div className="progress-box"><div className="progress-caption"><span>{label}</span><b>{timeLeft(queue.end,now)}</b></div><div className="progress-track"><i style={{width:`${Math.min(100,Math.max(0,(now-queue.start)/(queue.end-queue.start)*100))}%`}}/></div></div>;}
export function PageHead({title,back,children}){return <div className="page-head"><button className="icon-button" aria-label="返回" onClick={back}><ChevronLeft/></button><h2>{title}</h2><div>{children}</div></div>;}
export function Modal({title,children,onClose,wide=false,dossier=false}){
  const panel=useRef(null),close=useRef(onClose),titleId=useId();close.current=onClose;
  useEffect(()=>{const previous=document.activeElement;panel.current.querySelector('button')?.focus();const onKey=e=>{
    if(e.key==='Escape'){e.preventDefault();close.current();}
    if(e.key==='Tab'){const controls=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };window.addEventListener('keydown',onKey);return()=>{window.removeEventListener('keydown',onKey);if(previous?.isConnected)previous.focus();};},[]);
  return <div className={`modal-shade ${dossier?'dossier-shade':''}`} onClick={onClose}><section ref={panel} className={`modal ${wide?'wide':''} ${dossier?'dossier-modal':''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={e=>e.stopPropagation()}><div className="modal-title"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭"><X/></button></div><div className="modal-content">{children}</div></section></div>;
}
export {getCost};
export function getRequirements(item,p,player,catalog){return item.req.map(([id,level])=>({id,level,name:(catalog.buildings[id]||catalog.tech[id])?.name||id,current:catalog.tech[id]?(player.tech[id]||0):(p.buildings[id]||0)}));}
export function Requirements({list}){return <div className="requirements">{list.map(r=><span className={r.current>=r.level?'met':'unmet'} key={r.id}>{r.current>=r.level?<ChevronRight size={12}/>:<Lock size={12}/>} {r.name} {r.level}</span>)}</div>;}
export function Duration({seconds}){return <span className="duration"><Clock size={13}/>{timeLeft(Date.now()+seconds*1000)}</span>;}
export function buildSeconds(item,kind,p,level=1){
  const option=(kind==='tech'?p.researchOptions:kind==='build'?p.buildOptions:p.shipOptions)?.[item.id];
  if(option?.seconds!=null)return option.seconds;
  const c=kind==='ship'?item.cost:getCost(item,level),sum=c[0]+c[1];
  if(kind==='tech')return Math.max(20,Math.ceil(sum*3.6/((p.buildings.Research_Lab||0)+1)/60));
  return Math.max(kind==='ship'?2:12,Math.ceil(sum*1.44/(((p.buildings[kind==='ship'?'Shipyard':'Robotics_Facility']||0)+1)*2**(p.buildings.Nanite_Factory||0))/90));
}
export function FleetNames({ships}){const {catalog}=useGame();return <div className="fleet-names">{Object.entries(ships||{}).filter(([,n])=>n>0).map(([id,n])=><span key={id}>{catalog.units[id]?.name} <b>{number(n)}</b></span>)}</div>;}
export function Empty({children}){return <div className="empty-state">{children}</div>;}
export function Tabs({items,value,onChange}){return <div className="tabs">{items.map(([id,label])=><button key={id} className={value===id?'active':''} onClick={()=>onChange(id)}>{label}</button>)}</div>;}
