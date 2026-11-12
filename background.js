/* Night Sky Aurora background: slow twinkling stars plus rare shooting stars, a comet,
   a satellite and nebula pulses. Runs only when the Night Sky background is selected. */
(() => {
  const cv = document.getElementById('skyCanvas'); if (!cv) return; const cx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr; const S = 1; // real speed
  const rnd = (a, b) => a + Math.random() * (b - a);
  function resize() { dpr = 1; /* soft haze and tiny stars look the same at 1x, and the canvas uses about a quarter of the memory */ W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); makeStars(); }

  // Aurora haze and horizon bloom drift very slowly
  const blobs = [
    { x: .38, y: .24, rx: .46, ry: .34, c: [15, 118, 110], a: .30, ph: 0 },
    { x: .72, y: .35, rx: .40, ry: .30, c: [29, 78, 216], a: .22, ph: 2 },
    { x: .50, y: 1.05, rx: .75, ry: .30, c: [56, 189, 248], a: .18, ph: 4 }
  ];
  function drawBackground(t) {
    const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#030712'); g.addColorStop(1, '#0a1428');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    for (const b of blobs) {
      const breathe = 1 + Math.sin(t / 9000 + b.ph) * .12, drift = Math.sin(t / 14000 + b.ph) * .03;
      const x = (b.x + drift) * W, y = b.y * H, rx = b.rx * W * breathe, ry = b.ry * H * breathe;
      cx.save(); cx.translate(x, y); cx.scale(1, ry / rx);
      const rg = cx.createRadialGradient(0, 0, 0, 0, 0, rx), [r, gg, bb] = b.c, a = b.a * (.85 + .15 * Math.sin(t / 7000 + b.ph));
      rg.addColorStop(0, `rgba(${r},${gg},${bb},${a})`); rg.addColorStop(.5, `rgba(${r},${gg},${bb},${a * .45})`); rg.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      cx.fillStyle = rg; cx.fillRect(-rx, -rx, rx * 2, rx * 2); cx.restore();
    }
  }

  // Stars: each twinkles on its own slow cycle; a few are brighter and larger
  let stars = [];
  function makeStars() {
    const n = Math.round(W * H / 14000); stars = [];
    for (let i = 0; i < n; i++) stars.push({ x: rnd(0, W), y: rnd(0, H * .8), r: Math.random() < .12 ? rnd(1.4, 2.1) : rnd(.5, 1.2),
      base: rnd(.25, .75), amp: rnd(.15, .5), per: rnd(3000, 11000), ph: rnd(0, 6.28), warm: Math.random() < .15 });
  }
  function drawStars(t) {
    for (const s of stars) {
      const a = Math.max(0, Math.min(1, s.base + s.amp * Math.sin(t / s.per * 6.283 + s.ph)));
      cx.fillStyle = s.warm ? `rgba(254,243,199,${a})` : `rgba(226,240,255,${a})`;
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill();
      if (s.r > 1.4) { cx.fillStyle = `rgba(186,230,253,${a * .12})`; cx.beginPath(); cx.arc(s.x, s.y, s.r * 4, 0, 6.283); cx.fill(); }
    }
  }

  // Occasional events: shooting star, comet, satellite, nebula pulse. Timers run on virtual time.
  const events = [];
  let vt = 0, nextCross = 6000, nextPulse = 25000;
  function spawnShoot() { const dir = Math.random() < .5 ? 1 : -1; const x = dir > 0 ? rnd(0, W * .6) : rnd(W * .4, W), y = rnd(0, H * .4);
    events.push({ k: 'shoot', x, y, vx: dir * rnd(900, 1300), vy: rnd(250, 450), life: 0, max: rnd(700, 1100), len: rnd(110, 200) }); }
  function spawnComet() { const dir = Math.random() < .5 ? 1 : -1; events.push({ k: 'comet', x: dir > 0 ? -100 : W + 100, y: rnd(H * .08, H * .35), vx: dir * rnd(55, 85), vy: rnd(18, 32), life: 0, max: 1e9 }); }
  function spawnSat() { const dir = Math.random() < .5 ? 1 : -1; events.push({ k: 'sat', x: dir > 0 ? -20 : W + 20, y: rnd(H * .1, H * .6), vx: dir * rnd(35, 55), vy: rnd(-6, 6), life: 0, max: 1e9 }); }
  function spawnPulse() { events.push({ k: 'pulse', x: rnd(W * .2, W * .8), y: rnd(H * .1, H * .5), life: 0, max: 9000 }); }

  function update(dtReal) {
    const dt = dtReal * S; vt += dt;
    // Only one thing crosses the sky at a time: shooting star, comet or satellite
    const crossing = events.some(e => e.k !== 'pulse');
    if (crossing) nextCross = vt + rnd(12000, 30000);
    else if (vt > nextCross) {
      const roll = Math.random();
      if (roll < .6) spawnShoot(); else if (roll < .88) spawnSat(); else spawnComet();
      nextCross = vt + 1e9; // set again once it has left
    }
    if (vt > nextPulse) { spawnPulse(); nextPulse = vt + rnd(45000, 90000); }
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i]; e.life += dt;
      if (e.k === 'shoot') { e.x += e.vx * dt / 1000; e.y += e.vy * dt / 1000; }
      else if (e.k === 'comet' || e.k === 'sat') { e.x += e.vx * dt / 1000; e.y += e.vy * dt / 1000; if (e.x < -250 || e.x > W + 250) events.splice(i, 1); continue; }
      if (e.life > e.max) events.splice(i, 1);
    }
  }
  function drawEvents() {
    for (const e of events) {
      if (e.k === 'shoot') {
        const f = e.life / e.max, a = Math.sin(Math.PI * Math.min(1, f)), n = Math.hypot(e.vx, e.vy), tx = e.x - e.vx / n * e.len, ty = e.y - e.vy / n * e.len;
        const g = cx.createLinearGradient(e.x, e.y, tx, ty); g.addColorStop(0, `rgba(255,255,255,${.9 * a})`); g.addColorStop(1, 'rgba(147,197,253,0)');
        cx.strokeStyle = g; cx.lineWidth = 1.6; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(tx, ty); cx.stroke();
      } else if (e.k === 'comet') {
        const n = Math.hypot(e.vx, e.vy), ux = -e.vx / n, uy = -e.vy / n, L = 260;
        const g = cx.createLinearGradient(e.x, e.y, e.x + ux * L, e.y + uy * L); g.addColorStop(0, 'rgba(186,230,253,.55)'); g.addColorStop(1, 'rgba(56,189,248,0)');
        cx.strokeStyle = g; cx.lineWidth = 3; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(e.x, e.y); cx.lineTo(e.x + ux * L, e.y + uy * L); cx.stroke();
        const hg = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 14); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(125,211,252,0)');
        cx.fillStyle = hg; cx.beginPath(); cx.arc(e.x, e.y, 14, 0, 6.283); cx.fill();
      } else if (e.k === 'sat') {
        const blink = (Math.sin(e.life / 500) > .6) ? 1 : .55; cx.fillStyle = `rgba(241,245,249,${.8 * blink})`; cx.beginPath(); cx.arc(e.x, e.y, 1.5, 0, 6.283); cx.fill();
      } else if (e.k === 'pulse') {
        const f = e.life / e.max, a = Math.sin(Math.PI * f) * .12, r = 160 + 240 * f;
        const g = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r); g.addColorStop(0, `rgba(94,234,212,${a})`); g.addColorStop(1, 'rgba(94,234,212,0)');
        cx.fillStyle = g; cx.fillRect(e.x - r, e.y - r, r * 2, r * 2);
      }
    }
  }

  let last = 0, clock = 0, running = false, raf = 0;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(64, now - last); last = now; clock += dt * S;
    drawBackground(clock); drawStars(clock);
    if (!reduce) { update(dt); drawEvents(); }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; cv.hidden = false; resize(); last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); cv.hidden = true; }
  addEventListener('resize', () => { if (running) resize(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { running = false; cancelAnimationFrame(raf); } else if (!cv.hidden) { running = false; start(); } });
  window.NightSky = { start, stop };
})();
