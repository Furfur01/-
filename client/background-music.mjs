// Music owns its own gain, preferences and looping voices, separate from UI/weapon sounds.
const audioBase = '/opendesign/mockups/galaxy-empire/assets/original/audio/';
export const musicSettingsKey = 'galaxy.background-music';
export const musicFadeSeconds = 2;
export const musicTracks = Object.freeze({
  login: {file: 'ME_Login.mp3', title: '启航'},
  home: {file: 'ME_Home_Planet.mp3', title: '母星'},
  system: {file: 'BGS_Solar_System_Loop.mp3', title: '恒星系'},
  moon: {file: 'ME_Moon.mp3', title: '月球'},
  preparation: {file: 'ME_Fleet_Battle_Prep.mp3', title: '舰队备战'},
  battle: {file: 'ME_Battle.mp3', title: '舰队交战'}
});

export function commandMusicScene({ready, page, moon, combat}) {
  if (!ready) return 'login';
  if (['home', 'system', 'galaxy'].includes(page) && combat && combat.status !== 'finished') return 'battle';
  if (['fleet', 'hangar', 'battle'].includes(page)) return 'preparation';
  if (['galaxy', 'system'].includes(page)) return 'system';
  return moon || page === 'moon' ? 'moon' : 'home';
}

export function flightMusicState(controller) {
  if (controller?.replay) {
    const ended = controller.playTime >= controller.report.duration;
    return {scene: ended ? 'preparation' : 'battle', active: ended || !controller.paused};
  }
  return {scene: controller?.snapshot?.status === 'active' ? 'battle' : 'preparation', active: true};
}

export function createBackgroundMusic(env = window) {
  const doc = env.document, buffers = new Map(), voices = new Set(), listeners = new Set();
  let settings = {enabled: true, volume: .2}, scene = 'login', status = 'waiting', error = '';
  let context, master, current, pending, unlocked = false, active = true, disposed = false, generation = 0;
  let resume = null;
  const snapshot = () => ({...settings, scene, title: musicTracks[scene].title, status, error});
  const notify = () => { for (const listener of listeners) listener(snapshot()); };
  const canPlay = () => !disposed && unlocked && active && !doc.hidden && settings.enabled && settings.volume > 0;
  function readSettings(value) {
    if (typeof value?.enabled === 'boolean') settings.enabled = value.enabled;
    if (Number.isFinite(value?.volume)) settings.volume = Math.max(0, Math.min(1, value.volume));
  }
  try { readSettings(JSON.parse(env.localStorage.getItem(musicSettingsKey))); } catch {}
  function stopVoice(voice) {
    voice.source.stop();
    voice.source.disconnect();
    voice.gain.disconnect();
    voices.delete(voice);
  }
  function stop() {
    generation++;
    pending = null;
    if (current) resume = {scene: current.scene, offset: (current.offset + context.currentTime - current.started) % current.source.buffer.duration};
    for (const voice of [...voices]) stopVoice(voice);
    current = null;
  }
  function load(key) {
    if (!buffers.has(key)) {
      buffers.set(key, env.fetch(audioBase + musicTracks[key].file)
        .then(response => { if (!response.ok) throw Error('配乐读取失败：' + response.status); return response.arrayBuffer(); })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(cause => { buffers.delete(key); throw cause; }));
    }
    return buffers.get(key);
  }
  async function play() {
    if (!canPlay()) {
      stop();
      status = !settings.enabled || settings.volume === 0 ? 'muted' : !active || doc.hidden ? 'paused' : 'waiting';
      notify();
      return false;
    }
    if (current?.scene === scene) {
      if (status !== 'playing') { status = 'playing'; error = ''; notify(); }
      return true;
    }
    if (pending === scene) return true;
    const key = scene, ticket = ++generation;
    pending = key; status = 'loading'; error = ''; notify();
    try {
      if (!context) {
        context = new env.AudioContext();
        master = context.createGain();
        master.gain.value = settings.volume;
        master.connect(context.destination);
      }
      // resume is invoked in the trusted input handler, before the first await.
      const ready = context.state === 'running' ? Promise.resolve() : context.resume();
      const [buffer] = await Promise.all([load(key), ready]);
      if (ticket !== generation || !canPlay()) return false;
      if (context.state !== 'running') throw Error('请点击开启音乐');
      // Keep only the current voice and its incoming replacement, even during rapid navigation.
      for (const voice of [...voices]) if (voice !== current) stopVoice(voice);
      const source = context.createBufferSource(), gain = context.createGain(), now = context.currentTime;
      source.buffer = buffer; source.loop = true;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + musicFadeSeconds);
      source.connect(gain); gain.connect(master);
      const voice = {source, gain, scene: key, started: now, offset: resume?.scene === key ? resume.offset : 0};
      voices.add(voice);
      source.onended = () => { source.disconnect(); gain.disconnect(); voices.delete(voice); };
      source.start(now, voice.offset);
      if (current) {
        current.gain.gain.cancelAndHoldAtTime(now);
        current.gain.gain.linearRampToValueAtTime(0, now + musicFadeSeconds);
        current.source.stop(now + musicFadeSeconds);
      }
      current = voice; resume = null; pending = null; status = 'playing'; notify();
      return true;
    } catch (cause) {
      if (ticket !== generation || disposed) return false;
      stop(); error = cause.message || String(cause); status = 'error'; notify();
      env.console.warn('背景音乐暂不可用：', cause);
      return false;
    }
  }
  function unlock() { if (disposed) return Promise.resolve(false); unlocked = true; return play(); }
  function configure(patch, persist = true) {
    readSettings(patch);
    if (master) master.gain.value = settings.volume;
    if (persist) try { env.localStorage.setItem(musicSettingsKey, JSON.stringify(settings)); } catch {}
    void play(); notify();
  }
  function setScene(next) {
    if (!Object.hasOwn(musicTracks, next) || next === scene || disposed) return;
    scene = next; resume = null;
    // A pending fetch for the previous scene must never win a later navigation.
    generation++; pending = null;
    void play(); notify();
  }
  function setActive(value) { if (active !== value) { active = value; void play(); } }
  const activate = event => { if (event.isTrusted) void unlock(); };
  const visibility = () => { void play(); };
  const storage = event => {
    if (event.key !== musicSettingsKey) return;
    try { configure(event.newValue ? JSON.parse(event.newValue) : {enabled: true, volume: .2}, false); } catch {}
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true; stop(); listeners.clear();
    doc.removeEventListener('pointerdown', activate, true);
    doc.removeEventListener('keydown', activate, true);
    doc.removeEventListener('visibilitychange', visibility);
    env.removeEventListener('storage', storage);
    env.removeEventListener('pagehide', dispose);
    void context?.close();
  };
  doc.addEventListener('pointerdown', activate, true);
  doc.addEventListener('keydown', activate, true);
  doc.addEventListener('visibilitychange', visibility);
  env.addEventListener('storage', storage);
  env.addEventListener('pagehide', dispose);
  return {
    unlock, configure, setScene, setActive, dispose,
    get settings() { return {...settings}; },
    get state() { return snapshot(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
}
