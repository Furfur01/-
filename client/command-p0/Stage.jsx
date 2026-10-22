import React,{useEffect,useState,useRef} from 'react';
import {asset} from './data.mjs';
import {operationWorld,showOperationPreview,focusOperationFacility,bindSupportFrame} from './world-host.mjs';
import {LocateFixed,Rotate3D,Maximize} from 'lucide-react';
import {shipConstructionProgress,shipConstructionPhase} from '../../scripts/universe/ship-construction-state.js';

export default function Stage({id,name,planet,grounded=false,staticArt=false,buildQueue=null,buildName='',productionFacility='Shipyard',paused=false,now=Date.now()}){
 const modelFrame=useRef(null);
 const [connected,setConnected]=useState(false),[error,setError]=useState(false);
 const [watching,setWatching]=useState(false);
 useEffect(()=>{if(grounded)return bindSupportFrame(operationWorld(),modelFrame.current);},[grounded,planet.id]);
 const preview=()=>{const world=operationWorld();try{setConnected(showOperationPreview(world,{id,grounded,staticArt}));setError(false);}catch{setConnected(false);setError(true);}};
 useEffect(()=>{setWatching(!grounded&&(productionFacility==='Megastructure_Shipyard'&&planet.megaShipyard?.level>0||!!buildQueue&&buildQueue.id===id));},[id,planet.id,grounded,productionFacility,planet.megaShipyard?.level]);
 useEffect(()=>{if(!grounded&&buildQueue?.id===id)setWatching(true);},[buildQueue?.id]);
 useEffect(()=>{const world=operationWorld();if(watching){const focused=world?.focusConstruction?.(productionFacility);setConnected(productionFacility==='Megastructure_Shipyard'?!!focused:!!world);setError(false);}else preview();return()=>world?.hideShip?.();},[id,planet.id,grounded,staticArt,watching,productionFacility]);
 const reset=()=>{const world=operationWorld();world?.hideShip?.();if(watching)world?.focusConstruction?.(productionFacility);else preview();};
 const locate=()=>{const world=operationWorld();if(grounded)showOperationPreview(world,{id,grounded:true});else if(productionFacility==='Megastructure_Shipyard')world?.focusConstruction?.(productionFacility);else focusOperationFacility(world,'shipyard');};
 const progress=shipConstructionProgress(buildQueue,now);
 return <div className="ship-stage shared-world-stage" data-building-view={watching?'construction':'preview'} aria-label={grounded?'当前星球的行星防御设施':'当前星球轨道船坞中的舰船'}>
  {grounded&&<div ref={modelFrame} className="support-model-frame" aria-hidden="true" style={{position:'absolute',inset:'8px 8px 64px',pointerEvents:'none'}}/>}
  {(!connected||staticArt&&!grounded)&&<img className="stage-fallback" src={asset('ships',id)} alt={name}/>}
  {(grounded||!buildQueue&&!watching)&&<div className="stage-coordinate"><span>{grounded?'PLANETARY DEFENSE':'ORBITAL DOCK'}</span><span>{planet.name} · {grounded?'行星保障中心':productionFacility==='Megastructure_Shipyard'?'恒星系巨构船坞':productionFacility==='Flagship_Center'?'旗舰中心':'轨道船坞'}</span></div>}
  {!grounded&&(buildQueue||watching)&&<div className="construction-status"><div><span className="live-dot"></span><b>{buildQueue?buildName:'船坞待命'}</b>{buildQueue&&<span>{paused?'供能不足 · 施工暂停':shipConstructionPhase(progress)} · {Math.floor(progress*100)}%</span>}</div><button onClick={()=>setWatching(v=>!v)}>{watching?'查看舰型':'查看建造'}</button></div>}
  <div className="stage-controls"><span><Rotate3D size={14}/>{error?'模型暂不可用':connected?grounded?'保障中心 · 六边形模型展台':'拖动空间旋转 · 滚轮缩放':grounded?'设施参考图':'舰型参考图'}</span><button title="复位视角" aria-label={grounded?'复位防御设施视角':'复位舰船视角'} onClick={reset}><Maximize size={16}/></button><button title={grounded?'定位行星保障中心':productionFacility==='Megastructure_Shipyard'?'定位巨构船坞':'定位太空电梯'} aria-label={grounded?'定位行星保障中心':productionFacility==='Megastructure_Shipyard'?'定位巨构船坞':'定位太空电梯'} onClick={locate}><LocateFixed size={16}/></button></div>
 </div>;
}
