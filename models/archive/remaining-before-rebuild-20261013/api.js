(function () {
  'use strict';
  let state = null, catalog = null, selectedPlanet = '', error = '', busy = false;
  let loading = false, connected = false, sessionSource = '', offset = 0;
  let initPromise = null, refreshing = null, system = null, revision = 0, timer = null;
  const listeners = new Set();
  try { selectedPlanet = localStorage.getItem('galaxy.planet') || ''; } catch {}

  function notify() {
    for (const listener of listeners) {
      try { listener(api); } catch (cause) { console.error('界面更新失败', cause); }
    }
  }

  async function request(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options, signal: controller.signal });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || '操作失败');
      connected = true;
      return data;
    } catch (cause) {
      if (cause.name === 'AbortError' || cause.name === 'TypeError') connected = false;
      if (cause.name === 'AbortError') throw new Error('连接超时，请稍后重试');
      throw cause;
    } finally { clearTimeout(timeout); }
  }

  function update(data) {
    if (state && data.now < state.now) return;
    state = data;
    offset = data.now - Date.now();
    if (!data.planets.some(planet => planet.id === selectedPlanet)) selectedPlanet = data.player.home;
    error = '';
  }

  async function refresh(coordinates) {
    if (coordinates !== undefined) {
      if (!Array.isArray(coordinates) || coordinates.length !== 2 || !Number.isInteger(coordinates[0]) || !Number.isInteger(coordinates[1]) || coordinates[0] < 1 || coordinates[0] > 9 || coordinates[1] < 1 || coordinates[1] > 499) {
        error = '星系坐标无效'; notify(); return null;
      }
      system = coordinates.slice();
    }
    if (busy) return null;
    if (refreshing) {
      const pending = refreshing;
      const result = await pending;
      return coordinates !== undefined ? refresh() : result;
    }
    const version = revision;
    const query = system ? '?galaxy=' + system[0] + '&system=' + system[1] : '';
    refreshing = (async () => {
      try {
        const data = await request('/api/state' + query);
        if (version === revision && !busy) update(data);
        return data;
      } catch (cause) {
        if (version === revision) { error = cause.message || '连接中断，正在重连…'; connected = false; }
        return null;
      } finally { refreshing = null; notify(); }
    })();
    return refreshing;
  }

  async function action(payload) {
    if (busy) return null;
    if (!payload || typeof payload.type !== 'string') { error = '操作无效'; notify(); return null; }
    busy = true; revision++; error = ''; notify();
    try {
      const data = await request('/api/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planet: api.planet?.id, ...payload })
      });
      update(data);
      return data;
    } catch (cause) {
      error = cause.message || '操作失败';
      if (cause instanceof TypeError || cause.name === 'AbortError') connected = false;
      return null;
    } finally { busy = false; notify(); }
  }

  async function replay(id) {
    try { return await request('/api/replay/' + encodeURIComponent(id)); }
    catch (cause) { error = cause.message || '无法读取战报'; notify(); return null; }
  }

  function init() {
    if (initPromise) return initPromise;
    loading = true; notify();
    initPromise = (async () => {
      try {
        const session = await request('/api/session/local', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Empire-Client': 'galactic-command' }, body: '{}' });
        sessionSource = session.source;
        catalog = await request('/api/catalog');
        return await refresh();
      } catch (cause) {
        error = cause.message || '无法连接本地宇宙'; connected = false; return null;
      } finally {
        loading = false; initPromise = null; notify();
        if (!timer) timer = setInterval(() => {
          if (document.hidden || busy || loading) return;
          if (!catalog || !state) { void init(); return; }
          void refresh();
        }, 3000);
      }
    })();
    return initPromise;
  }

  const api = {
    init, refresh, action, replay,
    get state() { return state; },
    get catalog() { return catalog; },
    get planet() { return state?.planets.find(planet => planet.id === selectedPlanet) || state?.planets[0] || null; },
    get now() { return Date.now() + offset; },
    get busy() { return busy; },
    get loading() { return loading; },
    get error() { return error; },
    get connected() { return connected; },
    get sessionSource() { return sessionSource; },
    setPlanet(id) {
      if (!state?.planets.some(planet => planet.id === id)) return false;
      selectedPlanet = id;
      try { localStorage.setItem('galaxy.planet', id); } catch {}
      notify(); return true;
    },
    subscribe(listener) { listeners.add(listener); listener(api); return () => listeners.delete(listener); }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state) void refresh(); });
  window.EmpireAPI = api;
})();
