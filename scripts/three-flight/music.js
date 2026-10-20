import {createBackgroundMusic,flightMusicState} from '../../client/background-music.mjs';

// Embedded replays borrow the command page's player: only one soundtrack is audible.
// Standalone replay/practice pages use the same controller and browser preferences.
export function installFlightMusic(){
  let shared;
  // External embeds cannot share a parent's player; retain standalone playback there.
  try{if(parent!==window)shared=parent.EmpireMusic;}catch{}
  const music=shared||createBackgroundMusic();
  window.EmpireMusic=music;
  const control=document.createElement('button');
  control.type='button';control.id='flight-music';control.className='text-action';
  control.setAttribute('aria-label','背景音乐');
  control.title='背景音乐；音量与帝国设置同步';
  document.querySelector('.flight-header').append(control);
  const render=()=>{control.textContent=music.settings.enabled?'音乐 · 开':'音乐 · 关';control.setAttribute('aria-pressed',String(music.settings.enabled));};
  control.onclick=()=>music.configure({enabled:!music.settings.enabled});
  const unsubscribe=music.subscribe(render);render();
  const activate=event=>{if(shared&&event.isTrusted)void music.unlock();};
  document.addEventListener('pointerdown',activate,true);
  document.addEventListener('keydown',activate,true);
  const update=()=>{
    // Fleet overview hides the flight header; keep the toggle in its visible playback bar.
    const host=document.getElementById('native-battle-bar')||document.querySelector('.flight-header');
    if(control.parentNode!==host)host.append(control);
    const state=flightMusicState(window.flightController);
    if(document.documentElement.dataset.ready==='error')state.active=false;
    window.EmpireFlightMusic=state;
    if(shared)parent.CommandApp?.syncMusic();
    else{music.setScene(state.scene);music.setActive(state.active);}
  };
  update();
  const timer=setInterval(update,250);
  window.addEventListener('pagehide',()=>{
    clearInterval(timer);unsubscribe();control.remove();
    document.removeEventListener('pointerdown',activate,true);
    document.removeEventListener('keydown',activate,true);
    delete window.EmpireFlightMusic;
    if(!shared)music.dispose();
  },{once:true});
}
