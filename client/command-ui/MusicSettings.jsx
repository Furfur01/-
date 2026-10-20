import React,{useEffect,useState} from 'react';
import {Music2,Volume2,VolumeX} from 'lucide-react';

export default function MusicSettings(){
  const music=window.EmpireMusic,[state,setState]=useState(()=>music.state);
  useEffect(()=>music.subscribe(setState),[music]);
  const label={playing:'正在播放',loading:'载入中',waiting:'点击页面后播放',paused:'已暂停',muted:'已静音',error:'播放失败'}[state.status];
  return <section className="panel sec-audio-settings" data-ui-sound="off">
    <div className="sec-panel-heading"><h3><Music2 size={18}/>背景音乐</h3><small>原版配乐 · 随场景切换</small></div>
    <div className="sec-audio-controls">
      <button type="button" className="secondary" aria-label="背景音乐" aria-pressed={state.enabled} onClick={()=>music.configure({enabled:!state.enabled})}>
        {state.enabled?<Volume2 size={17}/>:<VolumeX size={17}/>}音乐{state.enabled?'已开启':'已关闭'}
      </button>
      <label className="sec-audio-volume">音量<input aria-label="背景音乐音量" type="range" min="0" max="100" step="5" value={Math.round(state.volume*100)} disabled={!state.enabled} onChange={e=>music.configure({volume:Number(e.target.value)/100})}/><output>{Math.round(state.volume*100)}%</output></label>
      {state.status==='error'&&<button type="button" className="text-button" onClick={()=>void music.unlock()}>重试播放</button>}
    </div>
    <p className="sec-fineprint" role="status">{label} · {state.title}{state.status==='error'?' · '+state.error:''}</p>
  </section>;
}
