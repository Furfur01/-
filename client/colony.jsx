import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Globe,Settings,LocateFixed,Clock,Move,Plus,Minus,X,Lock,Check,Hammer,Building2,Ship,FlaskConical,Ellipsis} from 'lucide-react';
import {useGame,Sprite,Resource,compact,timeLeft,Progress,assetVersion,originalArt} from './common.jsx';
import {MAP_SIZE,FIXED_PLOTS,BUILD_POLYGON,BUILDING_WIDTHS,getLayout,validatePlacement} from '../game/layout.mjs';
import {OriginalCity} from './original-city.jsx';

const [WIDTH,HEIGHT]=MAP_SIZE;
const zones=[['metal','金属矿区',340,225],['crystal','晶体矿区',295,785],['gas','重氢采集区',1160,150],['port','航空港',1410,655]];
const sizeOf=id=>id==='Shipyard'?330:id==='Command_Center'||id==='Moon_Base'?245:210;

export function Base(){
  const {planet:p,state,catalog,now,setModal,setPage,act,busy}=useGame();
  const viewport=useRef(null),drag=useRef(null),suppress=useRef(false);
  const [anchors,setAnchors]=useState(originalArt.anchors);
  const [extent,setExtent]=useState({width:1200,height:700}),[zoom,setZoom]=useState(1),[pan,setPan]=useState([0,0]);
  const [editing,setEditing]=useState(false),[menu,setMenu]=useState(false),[placing,setPlacing]=useState(null),[preview,setPreview]=useState(null),[message,setMessage]=useState('');
  const positions=getLayout(p),fit=Math.min(extent.width/WIDTH,extent.height/HEIGHT),scale=fit*zoom;
  const origin=[(extent.width-WIDTH*scale)/2+pan[0],(extent.height-HEIGHT*scale)/2+pan[1]];
  const visible=Object.keys(positions).filter(id=>catalog.buildings[id]&&((!p.moon&&FIXED_PLOTS[id])||p.buildings[id]>0||p.buildQueue?.id===id));
  const available=Object.keys(positions).filter(id=>catalog.buildings[id]&&!p.buildings[id]&&p.buildQueue?.id!==id&&(p.moon||!FIXED_PLOTS[id]));
  const placementError=preview?validatePlacement(p,preview.id,preview.x,preview.y):'';

  useEffect(()=>{fetch(`./assets/buildings-v2/anchors.json?v=${assetVersion}`).then(r=>r.ok?r.json():{}).then(old=>setAnchors({...old,...originalArt.anchors})).catch(()=>{});},[]);
  useLayoutEffect(()=>{
    const element=viewport.current,resize=()=>setExtent({width:element.clientWidth,height:element.clientHeight});
    const observer=new ResizeObserver(resize);observer.observe(element);resize();return()=>observer.disconnect();
  },[]);
  useLayoutEffect(()=>{setPan([0,0]);setZoom(1);setPreview(null);setPlacing(null);setMenu(false);setEditing(false);},[p.id]);
  const mapPoint=e=>{const r=viewport.current.getBoundingClientRect();return[(e.clientX-r.left-origin[0])/scale,(e.clientY-r.top-origin[1])/scale];};
  function zoomBy(amount){setZoom(z=>Math.min(2.8,Math.max(1,z+amount)));}
  function down(e,id){
    if(e.button!==0||placing)return;
    suppress.current=false;
    if(editing&&id&&(p.moon||!FIXED_PLOTS[id])){
      const [x,y]=positions[id];drag.current={id,pointer:e.pointerId,start:[e.clientX,e.clientY],position:[x,y],moved:false};
    }else drag.current={pointer:e.pointerId,start:[e.clientX,e.clientY],pan:[...pan],moved:false};
    e.stopPropagation();
  }
  function move(e){
    if(placing){const[x,y]=mapPoint(e);setPreview({id:placing,x:Math.round(x/5)*5,y:Math.round(y/5)*5});return;}
    const d=drag.current;if(!d)return;
    const dx=e.clientX-d.start[0],dy=e.clientY-d.start[1];
    if(!d.moved&&Math.hypot(dx,dy)<5)return;
    d.moved=true;suppress.current=true;
    if(!viewport.current.hasPointerCapture(e.pointerId))viewport.current.setPointerCapture(e.pointerId);
    if(d.id)setPreview({id:d.id,x:Math.round((d.position[0]+dx/scale)/5)*5,y:Math.round((d.position[1]+dy/scale)/5)*5});
    else setPan([Math.max(-WIDTH*scale*.45,Math.min(WIDTH*scale*.45,d.pan[0]+dx)),Math.max(-HEIGHT*scale*.45,Math.min(HEIGHT*scale*.45,d.pan[1]+dy))]);
  }
  async function savePosition(id,x,y){
    const error=validatePlacement(p,id,x,y);
    if(error){setMessage(error);return false;}
    const ok=await act({type:'place',planet:p.id,id,x,y});if(ok)setMessage('');return ok;
  }
  async function up(e){
    const d=drag.current;drag.current=null;
    if(viewport.current.hasPointerCapture(e.pointerId))viewport.current.releasePointerCapture(e.pointerId);
    if(d?.id&&d.moved&&preview)await savePosition(d.id,preview.x,preview.y);
    if(!placing)setPreview(null);
  }
  function cancel(){drag.current=null;setPreview(null);setPlacing(null);setMessage('');}
  async function groundClick(e){
    if(suppress.current){suppress.current=false;return;}
    if(placing&&!busy){const[x,y]=mapPoint(e),id=placing;if(await savePosition(id,Math.round(x/5)*5,Math.round(y/5)*5)){cancel();setModal({type:'building',id});}}
  }
  function choose(id){setMenu(false);setEditing(false);setPlacing(id);const[x,y]=positions[id];setPreview({id,x,y});setMessage('');}
  function plot(id){
    const b=catalog.buildings[id],level=p.buildings[id]||0,q=p.buildQueue?.id===id?p.buildQueue:null;
    const research=id==='Research_Lab'&&state.player.researchQueue?.planet===p.id?state.player.researchQueue:null,ship=id==='Shipyard'?p.shipQueue[0]:null;
    const jobs=[q&&{...q,label:q.mode==='downgrade'?'拆除':'建造',kind:'build'},research&&{...research,label:catalog.tech[research.id].name,kind:'research'},ship&&{...ship,label:`${catalog.units[ship.id].name} ×${ship.remaining}`,kind:'ship'}].filter(Boolean);
    const moving=preview?.id===id,[x,y]=moving?[preview.x,preview.y]:positions[id],fixed=!p.moon&&!!FIXED_PLOTS[id],size=p.moon?sizeOf(id):(BUILDING_WIDTHS[id]||sizeOf(id));
    return <button key={id} data-plot={id} className={`zone-building ${level?'built':'vacant'} ${q?'constructing':''} ${moving?'moving':''} ${editing&&!fixed?'movable':''} ${moving&&placementError?'invalid':''}`} style={{left:x,top:y,width:size,height:size,transform:`translate(-${(anchors[id]?.[0]??.5)*100}%,-${(anchors[id]?.[1]??.68)*100}%)`,zIndex:Math.round(y)+(moving?2000:0)}} aria-label={`${b.name} ${level}级${!level?' 未建造':''}${fixed?' 固定位置':''}`} onPointerDown={e=>down(e,id)} onClick={e=>{e.stopPropagation();if(suppress.current){suppress.current=false;return;}if(!editing&&!placing)setModal({type:'building',id});}}>
      {level>0||moving?<Sprite id={id} atlas={b.atlas} className="zone-structure"/>:<span className={`empty-site ${id==='Shipyard'?'port-site':''}`}><Plus size={28}/><span>{b.name}</span></span>}
      {(level>0||moving)&&<span className="zone-building-label">{editing&&(fixed?<Lock size={12}/>:<Move size={12}/>)}{b.name}<b>{level?`Lv ${level}`:'建造'}</b></span>}
      {jobs.length>0&&<span className="zone-building-jobs">{jobs.map(job=><span key={job.kind} className={`zone-building-job ${job.kind}`}><span><Clock size={12}/>{job.label}<b>{timeLeft(job.end,now)}</b></span><i><em style={{width:`${Math.max(0,Math.min(100,(now-(job.start??job.end-job.each*1000))/(job.end-(job.start??job.end-job.each*1000))*100))}%`}}/></i></span>)}</span>}
    </button>;
  }
  return <div className={`base-view zoned-colony ${editing?'layout-editing':''}`}>
    <div className="colony-toolbar"><div><button className={menu?'active':''} onClick={()=>{cancel();setMenu(!menu);}}><Hammer size={25}/>建造设施</button><button className={editing?'active':''} onClick={()=>{cancel();setMenu(false);setEditing(!editing);}}>{editing?<Check size={25}/>:<Move size={25}/>}<span>{editing?'完成摆放':'调整布局'}</span></button><button onClick={()=>setPage('more')}><Ellipsis size={25}/>更多</button></div></div>
    <div ref={viewport} className={`zone-viewport ${p.moon?'lunar':''} ${placing?'placing':''}`} aria-label="星球基地地图" onPointerDown={e=>down(e)} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null;setPreview(null);}} onClick={groundClick} onWheel={e=>{if(e.ctrlKey)return;zoomBy(e.deltaY>0?-.15:.15);}}>
      <div className="zone-map" style={{'--map-scale':scale,width:WIDTH,height:HEIGHT,transform:`translate(${origin[0]}px,${origin[1]}px) scale(${scale})`}}>
        {p.moon?<div className="zone-terrain"/>:<OriginalCity/>}
        {(editing||placing)&&(p.moon?<div className="free-build-area" style={{left:220,top:180,width:1140,height:800}}/>:<svg className="original-build-area" width={WIDTH} height={HEIGHT}><polygon points={BUILD_POLYGON.map(p=>p.join(',')).join(' ')}/></svg>)}
        {visible.map(plot)}
        {placing&&!visible.includes(placing)&&plot(placing)}
        {!p.moon&&<OriginalCity foreground/>}
      </div>
    </div>
    <aside className="base-queues" aria-label="生产队列">{[
      ['建造',p.buildQueue,p.buildQueue&&`${catalog.buildings[p.buildQueue.id].name} · Lv ${p.buildQueue.level}`],
      ['造舰',p.shipQueue[0],p.shipQueue[0]&&`${catalog.units[p.shipQueue[0].id].name} ×${p.shipQueue[0].remaining}`],
      ['研究',state.player.researchQueue,state.player.researchQueue&&catalog.tech[state.player.researchQueue.id].name]
    ].map(([name,queue,label],i)=>{const Icon=[Building2,Ship,FlaskConical][i];return <div className="base-queue" key={name}><small><Icon size={20} strokeWidth={1.4}/>{name}</small>{queue?<Progress queue={queue} label={label}/>:<span>队列空闲</span>}</div>;})}</aside>
    {menu&&<div className="construction-drawer"><div className="drawer-title"><b>建设设施</b><small>方圆 {p.usedFields} / {p.fields}</small><button aria-label="关闭建设列表" onClick={()=>setMenu(false)}><X size={17}/></button></div><div className="construction-options">{available.length?available.map(id=><button key={id} onClick={()=>choose(id)}><Sprite id={id} atlas={catalog.buildings[id].atlas}/><span>{catalog.buildings[id].name}</span></button>):<p>全部设施已建造</p>}</div></div>}
    {(placing||editing||message)&&<div className={`placement-status ${message||placementError?'invalid':''}`}><span>{message||placementError||(placing?`${catalog.buildings[placing].name} · 点击空地放置`:'拖动建筑调整位置 · 资源设施与航空港位置固定')}</span><button aria-label="取消摆放" onClick={()=>{cancel();setEditing(false);}}><X size={15}/></button></div>}
    <div className="map-controls"><button aria-label="缩小地图" disabled={zoom<=1} onClick={()=>zoomBy(-.25)}><Minus size={17}/></button><button aria-label="显示完整星球" onClick={()=>{setZoom(1);setPan([0,0]);}}><LocateFixed size={17}/><span>{Math.round(zoom*100)}%</span></button><button aria-label="放大地图" disabled={zoom>=2.8} onClick={()=>zoomBy(.25)}><Plus size={17}/></button></div>
  </div>;
}
