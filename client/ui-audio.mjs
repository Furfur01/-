// Reuse the APK originals; music and combat audio have separate ownership.
export const audioBase = '/opendesign/mockups/galaxy-empire/assets/original/audio/';
export const uiSounds = Object.freeze({
  click: 'sound_button_click.wav',
  build: 'SE_Building_Updating.mp3',
  cancelBuild: 'SE_Building_Update_Cancel.mp3',
  downgrade: 'SE_Demote.mp3',
  research: 'SE_Research_Tech_Update.mp3',
  cancelResearch: 'SE_Research_Tech_Update_Cancel.mp3',
  ship: 'SE_Construct_Fleet.mp3',
  dispatch: 'SE_Fleet_Dispatch.mp3',
  purchase: 'SE_Purchasing_Resources.mp3',
  scan: 'SE_Induction_Circle_Scan.mp3',
  jump: 'SE_Transfer_Circle.mp3'
});
// These originals have very different levels. Keep feedback brief and behind the UI,
// rather than replaying their multi-second sweeps on every interaction.
export const uiMix = Object.freeze({
  click: {level: .8, seconds: .09},
  build: {level: .12, seconds: .28},
  cancelBuild: {level: .1, seconds: .18},
  downgrade: {level: .1, seconds: .24},
  research: {level: .12, seconds: .3},
  cancelResearch: {level: .1, seconds: .18},
  ship: {level: .18, seconds: .3},
  dispatch: {level: .12, seconds: .35},
  purchase: {level: .1, seconds: .24},
  scan: {level: .1, seconds: .3},
  jump: {level: .1, seconds: .4}
});
const actionSounds = Object.freeze({
  build: 'build', downgrade: 'downgrade', research: 'research', ship: 'ship',
  dispatch: 'dispatch', purchase: 'purchase', scan: 'scan', jump: 'jump'
});
export function actionSound(payload) {
  if (payload.type === 'cancel') return {build: 'cancelBuild', research: 'cancelResearch'}[payload.kind];
  if (payload.type === 'logistics') return {build: 'build', cancel: 'cancelBuild'}[payload.mode];
  return actionSounds[payload.type];
}
export const audioSettingsKey = 'galaxy.ui-audio';

export function createUIAudio(env = window) {
  const doc = env.document, buffers = new Map(), listeners = new Set();
  let settings = {enabled: true, volume: .35}, context, gain, voice, ticket = 0, unlocked = false, warned = false;
  try {
    const saved = JSON.parse(env.localStorage.getItem(audioSettingsKey));
    if (typeof saved?.enabled === 'boolean') settings.enabled = saved.enabled;
    if (Number.isFinite(saved?.volume)) settings.volume = Math.max(0, Math.min(1, saved.volume));
  } catch {}
  const canPlay = () => unlocked && settings.enabled && settings.volume > 0 && !doc.hidden;
  function stop() {
    ticket++;
    voice?.stop();
    voice = null;
  }
  function warn(error) {
    if (!warned) { warned = true; env.console.warn('UI 音效暂不可用：', error); }
  }
  function unlock() {
    unlocked = true;
    if (!settings.enabled || settings.volume === 0) return;
    try {
      if (!context) {
        context = new env.AudioContext();
        gain = context.createGain();
        gain.gain.value = settings.volume;
        gain.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(warn);
    } catch (error) { warn(error); }
  }
  function buffer(key) {
    if (!buffers.has(key)) {
      const pending = env.fetch(audioBase + uiSounds[key])
        .then(response => { if (!response.ok) throw new Error('音频读取失败：' + response.status); return response.arrayBuffer(); })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(error => { buffers.delete(key); throw error; });
      buffers.set(key, pending);
    }
    return buffers.get(key);
  }
  async function play(key) {
    if (!Object.hasOwn(uiSounds, key) || !canPlay()) return false;
    unlock();
    if (!context) return false;
    const request = ++ticket;
    try {
      const decoded = await buffer(key);
      if (!canPlay() || context.state !== 'running' || ticket !== request) return false;
      voice?.stop();
      const source = context.createBufferSource(), envelope = context.createGain();
      const {level,seconds} = uiMix[key], duration = Math.min(decoded.duration, seconds), now = context.currentTime;
      const fade = Math.min(.09, duration * .45);
      source.buffer = decoded;
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(level, now + .004);
      envelope.gain.setValueAtTime(level, now + duration - fade);
      envelope.gain.linearRampToValueAtTime(0, now + duration);
      source.connect(envelope);
      envelope.connect(gain);
      source.onended = () => { source.disconnect(); envelope.disconnect(); if (voice === source) voice = null; };
      voice = source;
      source.start(now, 0, duration);
      return true;
    } catch (error) { warn(error); return false; }
  }
  function configure(patch) {
    if (typeof patch.enabled === 'boolean') settings.enabled = patch.enabled;
    if (Number.isFinite(patch.volume)) settings.volume = Math.max(0, Math.min(1, patch.volume));
    if (gain) gain.gain.value = settings.volume;
    if (!settings.enabled || settings.volume === 0) stop();
    try { env.localStorage.setItem(audioSettingsKey, JSON.stringify(settings)); } catch {}
    for (const listener of listeners) listener({...settings});
  }
  const activate = event => { if (event.isTrusted) unlock(); };
  const click = event => {
    if (!event.isTrusted) return;
    // composedPath reaches React controls inside the command workspace's Shadow DOM.
    const path = event.composedPath(), button = path.find(node => node.matches?.('button, [role="button"], summary, input[type="checkbox"], input[type="radio"]'));
    if (!button || button.matches(':disabled, [aria-disabled="true"]')) return;
    if (path.some(node => node.matches?.('[data-ui-sound="off"], [data-combat], #mass-battle, #map-pilot-hud, #map-combat-bar'))) return;
    if (button.matches('[data-chart="zoom-in"], [data-chart="zoom-out"]') ||
        path.some(node => node.matches?.('.tree-navigation, .minimap'))) return;
    unlock();
    void play('click');
  };
  const changed = event => {
    if (event.isTrusted && event.composedPath()[0]?.matches?.('select') &&
        !event.composedPath().some(node => node.matches?.('[data-combat], #mass-battle, #map-pilot-hud, #map-combat-bar'))) void play('click');
  };
  const action = event => { const key = actionSound(event.detail); if (key) void play(key); };
  const hidden = () => { if (doc.hidden) stop(); };
  const storage = event => {
    if (event.key !== audioSettingsKey) return;
    try {
      const next = JSON.parse(event.newValue);
      if (next) configure(next);
    } catch {}
  };
  doc.addEventListener('pointerdown', activate, true);
  doc.addEventListener('keydown', activate, true);
  doc.addEventListener('click', click, true);
  doc.addEventListener('change', changed, true);
  doc.addEventListener('visibilitychange', hidden);
  env.addEventListener('empire:action-success', action);
  env.addEventListener('storage', storage);
  return {
    play, unlock, configure,
    get settings() { return {...settings}; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    dispose() {
      stop();
      doc.removeEventListener('pointerdown', activate, true);
      doc.removeEventListener('keydown', activate, true);
      doc.removeEventListener('click', click, true);
      doc.removeEventListener('change', changed, true);
      doc.removeEventListener('visibilitychange', hidden);
      env.removeEventListener('empire:action-success', action);
      env.removeEventListener('storage', storage);
      listeners.clear();
      void context?.close();
    }
  };
}
