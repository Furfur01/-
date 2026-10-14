// Every listener, timeout and animation callback belongs to one page lifetime.
export function createLifetime(host = globalThis) {
  const abort = new AbortController();
  const timers = new Set(), frames = new Set();
  let disposed = false;
  return {
    get disposed() { return disposed; },
    signal: abort.signal,
    listen(target, type, listener, options = {}) {
      if (!target || disposed) return;
      target.addEventListener(type, listener, {
        ...(typeof options === 'boolean' ? {capture: options} : options),
        signal: abort.signal,
      });
    },
    later(callback, delay) {
      if (disposed) return null;
      const id = host.setTimeout(() => {
        timers.delete(id);
        if (!disposed) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    scheduleFrame(callback) {
      if (disposed) return null;
      const id = host.requestAnimationFrame(now => {
        frames.delete(id);
        if (!disposed) callback(now);
      });
      frames.add(id);
      return id;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      for (const id of timers) host.clearTimeout(id);
      for (const id of frames) host.cancelAnimationFrame(id);
      timers.clear();frames.clear();
    },
  };
}
