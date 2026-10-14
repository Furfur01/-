import React,{useRef,useState,useEffect} from 'react';
import {useGame,PageHead,Tabs,originalArt,assetVersion} from './common.jsx';

const groups=[['fleet','战舰与飞船'],['technology','科技'],['defense','防御设施'],['building','建筑'],['scenes','场景'],['audio','原声']];
export function OriginalArchive(){
  const {setPage,catalog}=useGame(),[group,setGroup]=useState('fleet'),[track,setTrack]=useState(null),audio=useRef(null);
  useEffect(()=>{setTrack(null);},[group]);
  const rows=group==='scenes'?originalArt.scenes:originalArt.archive.filter(row=>row.category===group);
  return <div className="page original-archive"><PageHead title="原版图鉴" back={()=>setPage('more')}><span className="facility-level">68 枚图标 · 33 段原声</span></PageHead><Tabs items={groups} value={group} onChange={setGroup}/><p className="archive-note">来自银河帝国安装包的原始美术与声音。图鉴也收录尚未开放建造的舰船和设施。</p><div className="scroll-content">
    {group==='audio'?<><div className="archive-player"><b>{track?.name||'选择一段原声试听'}</b><audio ref={audio} key={track?.asset||'idle'} controls autoPlay={!!track} src={track?`./assets/${track.asset}`:undefined} onEnded={()=>setTrack(null)}/></div><div className="archive-tracks">{originalArt.audio.map(row=><button className={track?.asset===row.asset?'active':''} key={row.asset} onClick={()=>setTrack(row)}>{row.name}<span>试听</span></button>)}</div></>:<div className={`archive-grid ${group==='scenes'?'archive-scenes':''}`}>{rows.map(row=>{const item=(catalog.units[row.gameId]||catalog.tech[row.gameId]||catalog.buildings[row.gameId]);return <figure key={row.asset}><img src={`./assets/${row.asset}?v=${assetVersion}`} alt={item?.name||row.name} loading="lazy"/><figcaption>{item?.name||row.name}</figcaption>{group==='scenes'?<small>{row.width} × {row.height}{row.composition?' · 地表与星空合成展示':''}</small>:!item&&<small>图鉴收藏</small>}</figure>;})}</div>}
  </div></div>;
}
