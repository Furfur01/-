import React,{useEffect,useRef} from 'react';
import {Box,Diamond,Droplets,X,ArrowRight,Check,Lock} from 'lucide-react';
import {compact,number,names} from './model.mjs';
export const resourceIcons=[Box,Diamond,Droplets];
export function Resources({values,available,small=false}){return <div className={'resource-cost '+(small?'compact-cost':'')}>{values.map((n,i)=>{const Icon=resourceIcons[i],missing=available&&n>available[i];return <div key={i} className={missing?'danger':''}><Icon size={16}/><span>{names[i]}</span><b>{small?compact(n):number(n)}</b>{missing&&<small>缺 {compact(n-available[i])}</small>}</div>;})}</div>;}
export function Progress({value,green=false}){return <div className={'progress '+(green?'green':'')}><i style={{width:`${Math.max(0,Math.min(100,value*100))}%`}}/></div>;}
export function Pill({children,tone='mint'}){return <span className={'pill '+tone}>{children}</span>;}
export function Section({children,aside}){return <div className="section-label"><span>{children}</span>{aside&&<small>{aside}</small>}</div>;}
export function Empty({children}){return <div className="empty-state"><Box size={26}/><p>{children}</p></div>;}
export function Requirements({items}){return <div className="requirements">{items.map(r=><div key={r.id} className={r.current<r.level?'danger':''}>{r.current>=r.level?<Check size={14}/>:<Lock size={14}/>}<span>{r.name}</span><b>{r.current} / {r.level}</b></div>)}</div>;}
export function Compare({label,before,after,suffix='',bad=false}){return <div className="compare-row"><span>{label}</span><div><b>{typeof before==='number'?compact(before):before}{suffix}</b><ArrowRight size={14}/><strong className={bad?'danger':''}>{typeof after==='number'?compact(after):after}{suffix}</strong></div></div>;}
export function Dialog({title,onClose,children,wide=false}){
 const ref=useRef(null);useEffect(()=>{const d=ref.current,previous=document.activeElement;d.showModal();return()=>{d.close();previous?.focus?.();};},[]);
 return <dialog ref={ref} className={'dialog '+(wide?'wide':'')} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="dialog-title"><h2>{title}</h2><button className="icon-button" aria-label="关闭面板" onClick={onClose}><X size={20}/></button></div>{children}</dialog>;
}
