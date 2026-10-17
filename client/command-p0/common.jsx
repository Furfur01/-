import React from 'react';
import {Box,Diamond,Droplets,Check,Lock} from 'lucide-react';
import {number} from './data.mjs';
export const ResourceIcons=[Box,Diamond,Droplets];
export const resourceNames=['金属','晶体','气体'];
export function Resources({values,available,compact=false}){return <div className={'cost-list '+(compact?'compact':'')}>{values.map((n,i)=>{const Icon=ResourceIcons[i];return <div key={i} className={available&&n>available[i]?'insufficient':''}><Icon size={17}/><span>{resourceNames[i]}</span><strong>{number(n)}</strong>{available&&n>available[i]&&<small>缺 {number(n-available[i])}</small>}</div>;})}</div>;}
export function Requirements({items,onSelect}){return <div className="requirements">{items.map(r=><button key={r.id} className={r.current>=r.level?'met':'unmet'} disabled={!onSelect||!onSelect.ids?.includes(r.id)} onClick={()=>onSelect?.click(r.id)}>{r.current>=r.level?<Check size={14}/>:<Lock size={13}/>}<span>{r.name}</span><b>{r.current}<i> / {r.level}</i></b></button>)}</div>;}
export function SectionLabel({children,aside}){return <div className="section-label"><span>{children}</span>{aside&&<small>{aside}</small>}</div>;}
