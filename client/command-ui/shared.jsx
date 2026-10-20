import React,{useEffect,useId,useRef} from 'react';
import {Box,Diamond,Droplets,Check,Lock,X} from 'lucide-react';

export const names=['金属','晶体','气体'];
export const number=n=>Math.floor(Number(n)||0).toLocaleString('zh-CN');
export const compact=n=>Math.abs(n)>=1e6?(n/1e6).toFixed(2)+' M':Math.abs(n)>=1e3?(n/1e3).toFixed(1)+' K':number(n);
export function duration(n){const s=Math.max(0,Math.ceil(Number(n)||0));return s>=3600?`${Math.floor(s/3600)}时 ${Math.floor(s%3600/60)}分`:s>=60?`${Math.floor(s/60)}分 ${s%60}秒`:`${s}秒`;}
export const remaining=(end,now=Date.now())=>duration((end-now)/1000);
export const stock=p=>p.availableResources||p.storage?.resources||p.resources||[0,0,0];
export function label(api,id,p=api.planet){
 const special={Shipyard:'太空电梯',Missile_Silo:'行星保障中心',Command_Center:p?.id===api.state.player.home?'市政中心':'指挥中心'};
 const resource=['Metal_Mine','Crystal_Mine','Gas_Mine'].indexOf(id);
 return !p?.moon&&resource>=0?names[resource]+'开采综合体':special[id]||api.catalog.buildings[id]?.name||api.catalog.units[id]?.name||api.catalog.tech[id]?.name||id;
}
const base='/opendesign/mockups/galactic-command/assets';
export function asset(group,id){return group==='units'||group==='ships'?`${base}/p0/ships/${id}.png`:group==='tech'?`${base}/p0/tech/${id}.png`:group==='models'?`${base}/p0/models/${id}.glb`:group==='planets'?`${base}/planet-thumbs/${id}.png`:`${base}/p1/buildings/${id}.png`;}
export const planetArt=p=>asset('planets',p?.moon?'moon':p?.biome||'terrestrial');
const icons=[Box,Diamond,Droplets];
export function Resources({values=[0,0,0],available,small=false}){return <div className={'resource-cost '+(small?'compact-cost':'')}>{values.map((value,i)=>{const Icon=icons[i]||Box,missing=available&&value>available[i];return <div key={i} className={missing?'danger':''} title={number(value)}><Icon size={15}/><span>{names[i]}</span><b>{small?compact(value):number(value)}</b>{missing&&<small>缺 {compact(value-available[i])}</small>}</div>;})}</div>;}
export function Progress({value=0,green=false}){const percent=Math.max(0,Math.min(1,Number.isFinite(value)?value:0))*100;return <div className={'progress '+(green?'green':'')} role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${percent}%`}}/></div>;}
export function Pill({tone='mint',children}){return <span className={'pill '+tone}>{children}</span>;}
export function Section({children,aside}){return <div className="section-label"><span>{children}</span>{aside&&<small>{aside}</small>}</div>;}
export function Empty({children}){return <div className="empty-state"><Box size={25}/><div>{children}</div></div>;}
export function Requirements({items=[]}){return <div className="requirements">{items.length?items.map(r=><div key={r.id||r.name} className={r.current<r.level?'danger':''}>{r.current>=r.level?<Check size={14}/>:<Lock size={14}/>}<span>{r.name}</span><b>{r.current} / {r.level}</b></div>):<small>无额外前置条件</small>}</div>;}
export function Dialog({title,onClose,children,wide=false}){
 const ref=useRef(null),titleId=useId();
 useEffect(()=>{const d=ref.current,previous=d.getRootNode().activeElement||document.activeElement;d.showModal();return()=>{d.close();if(previous?.isConnected)previous.focus?.();};},[]);
 return <dialog ref={ref} className={'dialog '+(wide?'wide':'')} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current){const r=ref.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}><header className="dialog-title"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="关闭面板" onClick={onClose}><X size={20}/></button></header>{children}</dialog>;
}
