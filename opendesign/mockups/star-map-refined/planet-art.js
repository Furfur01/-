(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const cache = new Map();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rand(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hash(x, y, z) {
    let v = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647); v = Math.imul(v ^ v >>> 13, 1274126177); return ((v ^ v >>> 16) >>> 0) / 4294967295;
  }
  function noise(x, y, z) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x -= X; y -= Y; z -= Z;
    x = x * x * (3 - 2 * x); y = y * y * (3 - 2 * y); z = z * z * (3 - 2 * z);
    const lerp = (a, b, t) => a + (b - a) * t;
    return lerp(lerp(lerp(hash(X, Y, Z), hash(X + 1, Y, Z), x), lerp(hash(X, Y + 1, Z), hash(X + 1, Y + 1, Z), x), y), lerp(lerp(hash(X, Y, Z + 1), hash(X + 1, Y, Z + 1), x), lerp(hash(X, Y + 1, Z + 1), hash(X + 1, Y + 1, Z + 1), x), y), z);
  }
  function fbm(x, y, z) {
    return noise(x, y, z) * .55 + noise(x * 2.12 + 8.5, y * 2.12, z * 2.12) * .26 + noise(x * 4.6, y * 4.6 + 3, z * 4.6) * .13 + noise(x * 9.3, y * 9.3, z * 9.3) * .06;
  }
  function resize(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, canvas.clientWidth || Number(canvas.getAttribute('width')) || 320);
    const h = Math.max(1, canvas.clientHeight || Number(canvas.getAttribute('height')) || 180);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
  }
  function texture(type, n = 256) {
    const key = type + n;
    if (cache.has(key)) return cache.get(key);
    const c = document.createElement('canvas'); c.width = c.height = n;
    const cx = c.getContext('2d'), im = cx.createImageData(n, n), data = im.data;
    for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
      const x = (px + .5) / n * 2 - 1, y = (py + .5) / n * 2 - 1;
      const d = x * x + y * y;
      if (d >= 1) continue;
      const z = Math.sqrt(1 - d);
      const sx = x * .88 + z * .47, sz = -x * .47 + z * .88;
      const v = fbm(sx * 3.5 + 7, y * 3.5 - 3, sz * 3.5 + 5);
      const detail = noise(sx * 65 + 5, y * 65, sz * 65);
      const light = clamp(-x * .70 - y * .38 + z * .60, 0, 1);
      const shade = .035 + Math.pow(light, .8) * .965;
      let r, g, b;
      if (type === 'earth') {
        const land = v > .52;
        if (land) {
          const arid = clamp((v - .52) * 5 + y * .3, 0, 1);
          r = 40 + 91 * arid + detail * 24; g = 65 + 61 * arid + detail * 19; b = 58 + 29 * arid;
        } else {
          const coast = clamp((v - .48) * 25, 0, 1);
          r = 12 + coast * 19; g = 49 + coast * 37; b = 78 + coast * 34;
        }
        const cloud = fbm(sx * 5.2 + y * 1.8 + 23, y * 5.2 - 8, sz * 5.2 + 3);
        const a = clamp((cloud - .53) * 6, 0, .86);
        r += (210 - r) * a; g += (224 - g) * a; b += (227 - b) * a;
        const ice = clamp((Math.abs(y) - .85 + v * .06) * 10, 0, 1);
        r += (194 - r) * ice; g += (210 - g) * ice; b += (219 - b) * ice;
      } else if (type === 'gas' || type === 'ring') {
        const bands = Math.sin(y * 35 + (noise(x * 3, y * 8, z * 4) - .5) * 5);
        const band = .5 + .5 * bands;
        r = 100 + band * 70 + v * 28; g = 116 + band * 48 + v * 18; b = 119 + band * 29;
        if (type === 'ring') { r += 26; g += 17; b -= 8; }
      } else {
        const craters = Math.pow(noise(sx * 18, y * 18, sz * 18), 3);
        r = 84 + v * 81 + detail * 24 - craters * 47; g = 71 + v * 72 + detail * 19 - craters * 40; b = 61 + v * 60 + detail * 15 - craters * 33;
      }
      r *= shade; g *= shade; b *= shade;
      if (type === 'earth') {
        const atm = Math.pow(1 - z, 5) * (.2 + light) * 100;
        r += atm * .18; g += atm * .75; b += atm;
      }
      const p = (py * n + px) * 4;
      data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = clamp((1 - d) * n * .6, 0, 1) * 255;
    }
    cx.putImageData(im, 0, 0); cache.set(key, c); return c;
  }
  function glow(ctx, x, y, radius, color, strength = 1) {
    ctx.save(); ctx.globalAlpha = strength;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color); g.addColorStop(.18, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
  }
  function sphere(ctx, x, y, r, type) {
    if (type === 'earth') {
      const halo = ctx.createRadialGradient(x, y, r * .93, x, y, r * 1.06);
      halo.addColorStop(0, 'rgba(55,149,201,0)'); halo.addColorStop(.44, 'rgba(72,179,234,.40)'); halo.addColorStop(1, 'rgba(45,157,238,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 1.06, 0, TAU); ctx.fill();
    }
    ctx.drawImage(texture(type, r > 40 ? 256 : 128), x - r, y - r, r * 2, r * 2);
  }
  function asteroid(ctx, x, y, r, seed) {
    const rng = rand(seed); ctx.save(); ctx.translate(x, y); ctx.rotate(rng() * TAU);
    ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr = r * (.65 + rng() * .4); const xx = Math.cos(a) * rr, yy = Math.sin(a) * rr; if (!k) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } ctx.closePath();
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#9a9283'); g.addColorStop(.3, '#5a5b57'); g.addColorStop(1, '#050b0e'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(156,181,185,.25)'; ctx.lineWidth = .4; ctx.stroke(); ctx.restore();
  }
  function drawHero(canvas, theme) {
    const { ctx, w, h } = resize(canvas); ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#020a10'; ctx.fillRect(0, 0, w, h);
    const rng = rand(38479); for (let i = 0; i < 260; i++) { const x = rng() * w, y = rng() * h, alpha = .12 + rng() * .42; ctx.fillStyle = 'rgba(157,200,221,' + alpha + ')'; ctx.fillRect(x, y, i % 31 === 0 ? 1.3 : .65, i % 31 === 0 ? 1.3 : .65); }
    glow(ctx, w * .33, h * .46, h * .78, 'rgba(61,82,100,.12)');
    const sx = w * .395, sy = h * .47;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-.24);
    for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(0, 0, h * (.10 + i * .099), h * (.036 + i * .035), 0, 0, TAU); ctx.strokeStyle = i < 3 ? 'rgba(217,189,129,.29)' : 'rgba(62,155,181,.22)'; ctx.lineWidth = .6; ctx.stroke(); }
    ctx.restore();
    glow(ctx, sx, sy, h * .47, 'rgba(247,164,62,.22)');
    glow(ctx, sx, sy, h * .24, 'rgba(255,190,88,.38)');
    const sun = ctx.createRadialGradient(sx - 1, sy - 1, 0, sx, sy, h * .071); sun.addColorStop(0, '#fffef1'); sun.addColorStop(.65, '#fff4c0'); sun.addColorStop(.9, '#ffc667'); sun.addColorStop(1, '#ffad4b'); ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sx, sy, h * .071, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const flare = ctx.createLinearGradient(sx - w * .3, 0, sx + w * .3, 0); flare.addColorStop(0, 'rgba(255,203,107,0)'); flare.addColorStop(.5, 'rgba(255,229,165,.45)'); flare.addColorStop(1, 'rgba(255,203,107,0)'); ctx.fillStyle = flare; ctx.fillRect(sx - w * .3, sy - .4, w * .6, .8); ctx.restore();
    sphere(ctx, w * .22, h * .40, h * .046, 'rock');
    sphere(ctx, w * .13, h * .64, h * .105, 'gas');
    sphere(ctx, w * .24, h * .82, h * .11, 'earth');
    sphere(ctx, w * .51, h * .20, h * .035, 'rock');
    sphere(ctx, w * .56, h * .72, h * .045, 'rock');
    for (let i = 0; i < 75; i++) { const x = w * (.36 + rng() * .50), y = h * (.99 - (x / w - .36) * .28 + (rng() - .5) * .09); asteroid(ctx, x, y, 1 + rng() * 3.6, i + 568); }
    sphere(ctx, w * .92, h * .48, h * .49, 'earth');
    // A small orbital installation gives the right-hand silhouette a machine scale.
    ctx.save(); ctx.translate(w * .88, h * .47); ctx.rotate(-.25); const sz = h * .0047;
    ctx.scale(sz, sz); ctx.strokeStyle = '#a2b6b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(47, 0); ctx.moveTo(-10, -21); ctx.lineTo(-10, 22); ctx.moveTo(20, -14); ctx.lineTo(20, 14); ctx.stroke();
    for (let i = -3; i <= 3; i++) { ctx.fillStyle = i % 2 ? '#4a575b' : '#8e9898'; ctx.fillRect(i * 11 - 3, -3, 7, 6); ctx.fillStyle = '#1e3442'; ctx.fillRect(i * 11 - 2, -11, 5, 7); ctx.fillRect(i * 11 - 2, 5, 5, 7); ctx.strokeStyle = '#879396'; ctx.strokeRect(i * 11 - 2, -11, 5, 7); ctx.strokeRect(i * 11 - 2, 5, 5, 7); }
    ctx.fillStyle = '#91e8f5'; ctx.fillRect(-18, -2, 2, 2); ctx.restore();
    const vignette = ctx.createLinearGradient(0, 0, 0, h); vignette.addColorStop(0, 'rgba(0,5,8,.06)'); vignette.addColorStop(.70, 'rgba(0,5,8,0)'); vignette.addColorStop(1, 'rgba(0,5,8,.55)'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
  }
  function drawPlanet(canvas, type = 'earth', selected = false) {
    const { ctx, w, h } = resize(canvas); ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * (type === 'ring' ? .28 : .34);
    if (selected) glow(ctx, cx, cy, r * 1.7, 'rgba(39,199,244,.15)');
    if (type === 'asteroid') {
      const rng = rand(3294); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; asteroid(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .85, 1.5 + rng() * 3, 72 + i); } asteroid(ctx, cx + 1, cy + 3, r * .43, 963); return;
    }
    if (type === 'ring') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.45);
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * (1.4 + i * .065), r * (.32 + i * .016), 0, 0, TAU); ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(174,182,182,' + (.18 + i * .045) + ')'; ctx.stroke(); } ctx.restore();
    }
    sphere(ctx, cx, cy, r, type);
    if (type === 'ring') {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.45);
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * (1.4 + i * .065), r * (.32 + i * .016), 0, 0, Math.PI); ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(168,182,187,' + (.16 + i * .038) + ')'; ctx.stroke(); } ctx.restore();
    }
  }
  function initOrrery(canvas, options = {}) {
    let selected = 0, dead = false, frame = 0, last = -1000, nodes = [], paused = options.animate === false;
    let previousFrame = performance.now(), orbitalTime = 0;
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    function render(now) {
      if (dead) return;
      frame = requestAnimationFrame(render);
      const elapsed = Math.min(60, Math.max(0, now - previousFrame));
      previousFrame = now;
      if (!paused && !reducedMotion.matches && !document.hidden) orbitalTime += elapsed;
      if (now - last < 32 || document.hidden) return;
      last = now;
      const { ctx, w, h } = resize(canvas); ctx.clearRect(0, 0, w, h);
      const cx = w * .48, cy = h * .53, maxR = Math.min(w * .43, h * 1.08), squash = .39;
      glow(ctx, cx, cy, maxR * .8, 'rgba(0,125,160,.12)');
      ctx.strokeStyle = 'rgba(44,176,205,.14)'; ctx.lineWidth = .6;
      for (let a = 0; a < TAU; a += TAU / 16) { ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * maxR * .11, cy + Math.sin(a) * maxR * .11 * squash); ctx.lineTo(cx + Math.cos(a) * maxR * 1.04, cy + Math.sin(a) * maxR * 1.04 * squash); ctx.stroke(); }
      const radii = [.23, .40, .57, .76, .97];
      nodes = [];
      for (let i = 0; i < radii.length; i++) {
        const r = maxR * radii[i];
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * squash, 0, 0, TAU);
        ctx.strokeStyle = selected === i ? 'rgba(64,224,249,.66)' : 'rgba(29,150,185,.42)'; ctx.lineWidth = selected === i ? 1 : .7; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, r + 4, (r + 4) * squash, 0, 0, TAU); ctx.strokeStyle = 'rgba(46,166,193,.10)'; ctx.lineWidth = .6; ctx.stroke();
        const a = [-2.6, -.8, 2.1, .55, -1.35][i] + orbitalTime * .000025 / (i + 1);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * squash;
        nodes.push({ x, y, r: 3 + i * .7 });
      }
      // Outer ranging ticks are broken rather than a solid decorative circle.
      for (let i = 0; i < 56; i++) {
        const a = i / 56 * TAU, r1 = maxR * 1.075, r2 = r1 + (i % 7 === 0 ? 4 : 1.7);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * squash); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 * squash); ctx.strokeStyle = i % 7 === 0 ? 'rgba(81,220,242,.6)' : 'rgba(51,162,186,.25)'; ctx.stroke();
      }
      glow(ctx, cx, cy, 24, 'rgba(18,206,244,.46)');
      glow(ctx, cx, cy, 10, 'rgba(90,241,255,.7)');
      ctx.fillStyle = '#d0fdff'; ctx.beginPath(); ctx.ellipse(cx, cy, 4, 5, 0, 0, TAU); ctx.fill();
      nodes.forEach((n, i) => {
        if (selected === i) glow(ctx, n.x, n.y, 12, 'rgba(33,222,251,.3)');
        const g = ctx.createRadialGradient(n.x - 1.5, n.y - 1.8, .1, n.x + 1, n.y + 1, n.r * 1.3); g.addColorStop(0, '#b6fcff'); g.addColorStop(.35, '#3ee3f3'); g.addColorStop(.70, '#058eb3'); g.addColorStop(1, '#052333'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.fill();
        if (selected === i) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3.3, 0, TAU); ctx.strokeStyle = 'rgba(126,244,255,.8)'; ctx.lineWidth = .65; ctx.stroke(); }
      });
      // Tiny wireframe fleet at the upper-right edge.
      ctx.save(); ctx.translate(w * .86, h * .22); ctx.rotate(-.20); ctx.strokeStyle = 'rgba(119,214,234,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-13, 3); ctx.lineTo(15, 0); ctx.lineTo(-8, -5); ctx.lineTo(-6, -1); ctx.lineTo(-13, 3); ctx.moveTo(-4, -1); ctx.lineTo(-4, -7); ctx.lineTo(2, -5); ctx.lineTo(7, 0); ctx.moveTo(-5, 2); ctx.lineTo(-8, 7); ctx.lineTo(2, 4); ctx.lineTo(6, 1); ctx.stroke(); ctx.restore();
    }
    function click(e) { const box = canvas.getBoundingClientRect(), x = (e.clientX - box.left) * canvas.clientWidth / (box.width || 1), y = (e.clientY - box.top) * canvas.clientHeight / (box.height || 1); let hit = -1, dist = 16; nodes.forEach((n, i) => { const d = Math.hypot(n.x - x, n.y - y); if (d < dist) { hit = i; dist = d; } }); if (hit >= 0) { selected = hit; if (options.onSelect) options.onSelect(hit); } }
    canvas.addEventListener('click', click); canvas.style.cursor = 'pointer'; frame = requestAnimationFrame(render);
    return { setSelected(index) { selected = clamp(Number(index) || 0, 0, 4); }, setAnimation(enabled) { paused = !enabled; }, destroy() { dead = true; cancelAnimationFrame(frame); canvas.removeEventListener('click', click); } };
  }
  window.GalacticArt = { drawHero, drawPlanet, initOrrery };
}());
