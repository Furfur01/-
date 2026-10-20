import React,{useEffect,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';

export default function AudioSettings(){
  const audio=window.EmpireUIAudio,[settings,setSettings]=useState(()=>audio.settings);
  useEffect(()=>audio.subscribe(setSettings),[audio]);
  const audible=settings.enabled&&settings.volume>0;
  return <section className="panel sec-audio-settings" data-ui-sound="off">
    <div className="sec-panel-heading"><h3><Volume2 size={18}/>UI 音效</h3><small>APK 原声 · 轻量</small></div>
    <div className="sec-audio-controls">
      <button type="button" className="secondary" aria-label="UI 音效" aria-pressed={settings.enabled} onClick={()=>{audio.configure({enabled:!settings.enabled});if(!settings.enabled)void audio.play('click');}}>
        {settings.enabled?<Volume2 size={17}/>:<VolumeX size={17}/>}音效{settings.enabled?'已开启':'已关闭'}
      </button>
      <label className="sec-audio-volume">音量<input aria-label="UI 音效音量" type="range" min="0" max="100" step="5" value={Math.round(settings.volume*100)} disabled={!settings.enabled} onChange={e=>audio.configure({volume:Number(e.target.value)/100})}/><output>{Math.round(settings.volume*100)}%</output></label>
      <button type="button" className="text-button" disabled={!audible} onClick={()=>void audio.play('click')}>试听</button>
    </div>
    <p className="sec-fineprint">轻点击与短确认音。设置自动保存在当前浏览器。</p>
  </section>;
}
