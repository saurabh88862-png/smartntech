// SmartNTech — 3D / "4D" interactions shared by index.html and every page in /blog.
// Diamond gem buttons, spin-on-click, 3D card tilt, hero cube parallax and a cursor light.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GEM_SELECTOR = '.gem, .btn-primary, #c-btn, #adm-btn, #blog-more';
  const SPIN_SELECTOR = 'button, .gem, .m-link, .brand-spin, .spin-nav';
  const TILT_SELECTOR = '.tilt, #tool-cards > a, #articles-grid > a, .stat';

  function markGems() {
    document.querySelectorAll(GEM_SELECTOR).forEach((el) => el.classList.add('gem'));
  }

  // ---------- Spin in a circle on click (wide buttons flip in 3D instead, so text stays readable) ----------
  document.addEventListener('click', (e) => {
    if (reduceMotion) return;
    const el = e.target.closest(SPIN_SELECTOR);
    if (!el || el.disabled) return;
    const delaysNav = el.classList.contains('brand-spin') || el.classList.contains('spin-nav');
    const cls = delaysNav || el.offsetWidth <= 220 ? 'spin-click' : 'spin-flip';
    // Brand and topic links that open another page wait for the spin to finish before navigating.
    const href = delaysNav && el.tagName === 'A' ? el.getAttribute('href') : null;
    if (href && !href.startsWith('#') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setTimeout(() => { location.href = el.href; }, 650);
    }
    el.classList.remove('spin-click', 'spin-flip');
    void el.offsetWidth; // restart the animation if clicked again quickly
    el.classList.add(cls);
    const ring = document.createElement('span');
    ring.className = 'click-ripple';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
    document.body.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  }, true);
  document.addEventListener('animationend', (e) => {
    if (e.animationName === 'snt-spin' || e.animationName === 'snt-flip') e.target.classList.remove('spin-click', 'spin-flip');
  });

  // ---------- 3D tilt toward the cursor, with glare ----------
  let tilted = null;
  function resetTilt() { if (tilted) { tilted.classList.remove('tilt-on'); tilted = null; } }
  document.addEventListener('pointermove', (e) => {
    if (reduceMotion || e.pointerType === 'touch') return;
    const el = e.target.closest(TILT_SELECTOR);
    if (el !== tilted) resetTilt();
    if (!el) return;
    tilted = el;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', ((0.5 - py) * 14).toFixed(2) + 'deg');
    el.style.setProperty('--ry', ((px - 0.5) * 18).toFixed(2) + 'deg');
    el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    el.classList.add('tilt-on');
  }, { passive: true });
  document.addEventListener('pointerleave', resetTilt);
  window.addEventListener('blur', resetTilt);

  // ---------- Cursor light + hero parallax ----------
  function setupPointerFx() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    const scene = document.querySelector('.cube-scene');
    let frame = 0, x = 0, y = 0;
    document.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.style.opacity = 1;
        if (scene) {
          scene.style.setProperty('--mx', ((x / innerWidth) - 0.5).toFixed(3));
          scene.style.setProperty('--my', ((y / innerHeight) - 0.5).toFixed(3));
        }
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = 0; });
  }

  // ---------- Depth on section headings ----------
  function markHeadings() {
    document.querySelectorAll('main section h2.font-black, #hero-title, main > article > h1, main > h1').forEach((h) => h.classList.add('depth-text'));
  }

  // ---------- Logo + "SmartNTech" name blocks (header, footer, dashboard) spin on click ----------
  function markBrands() {
    document.querySelectorAll('img[alt="SmartNTech logo"]').forEach((img) => {
      const block = img.parentElement;
      if (block && block.querySelector('.grad-text')) block.classList.add('brand-spin'); // only the logo + wordmark pair
    });
  }

  // ---------- Click a floating diamond: it spins 10 times ----------
  // The diamonds are drawn on canvases behind the text, so find the one under the click point.
  const SKIES = [];
  const BURST_SECONDS = 3.4;
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, textarea, select, label, [contenteditable]')) return;
    let hit = null, best = Infinity;
    for (const sky of SKIES) {
      const r = sky.canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (const g of sky.gems) {
        const d = Math.hypot(x - g.x, y - g.y);
        if (d < g.r * 1.6 + 8 && d < best) { best = d; hit = { g, sky }; }
      }
    }
    if (!hit) return;
    hit.g.burst = hit.sky.time(); // drawGem adds 10 turns over BURST_SECONDS
    const ring = document.createElement('span');
    ring.className = 'click-ripple';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
    document.body.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  });

  // ---------- Auto-floating 3D diamonds with star sparkles ----------
  // A diamond is a 6-sided bipyramid (short crown, long pavilion), spun in 3D and shaded per facet.
  const GEM_VERTS = [[0, -0.7, 0], [0, 1.25, 0]];
  for (let k = 0; k < 6; k++) GEM_VERTS.push([Math.cos(k * Math.PI / 3), 0, Math.sin(k * Math.PI / 3)]);
  const GEM_FACES = [];
  for (let k = 0; k < 6; k++) { GEM_FACES.push([0, 2 + k, 2 + (k + 1) % 6]); GEM_FACES.push([1, 2 + (k + 1) % 6, 2 + k]); }
  const LIGHT = (() => { const l = [-0.45, -0.7, 0.65], n = Math.hypot(...l); return l.map((v) => v / n); })();
  const HUES = [190, 265, 285, 320, 45, 210];

  function drawSparkle(ctx, x, y, s, a, color) {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.12, x + s, y);
    ctx.quadraticCurveTo(x + s * 0.12, y + s * 0.12, x, y + s);
    ctx.quadraticCurveTo(x - s * 0.12, y + s * 0.12, x - s, y);
    ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.12, x, y - s);
    ctx.fill(); ctx.restore();
  }

  function drawGem(ctx, g, t, dark) {
    // Clicked: 10 extra full turns (20π, so it ends where it would have been) with ease-out, growing while it spins.
    let extra = 0, grow = 1;
    if (g.burst != null) {
      const p = (t - g.burst) / BURST_SECONDS;
      if (p >= 1) g.burst = null;
      else { extra = 20 * Math.PI * (1 - Math.pow(1 - p, 3)); grow = 1 + 0.8 * Math.sin(Math.PI * Math.min(1, p * 1.4)); }
    }
    const r0 = g.r; g.r = r0 * grow;
    try { drawGemAt(ctx, g, t, dark, extra); } finally { g.r = r0; }
  }

  function drawGemAt(ctx, g, t, dark, extra) {
    const ry = g.rot + t * g.spin + extra, cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(g.tilt), sx = Math.sin(g.tilt);
    const pts = GEM_VERTS.map(([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
    });
    const tw = 0.6 + 0.4 * Math.sin(t * g.tws + g.p);
    // soft glow behind the gem
    const glow = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 2.6);
    glow.addColorStop(0, `hsla(${g.h}, 95%, ${dark ? 68 : 55}%, ${(dark ? 0.32 : 0.45) * tw})`);
    glow.addColorStop(1, `hsla(${g.h}, 95%, ${dark ? 68 : 55}%, 0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 2.6, 0, Math.PI * 2); ctx.fill();
    // facets, back to front
    const faces = GEM_FACES.map((f) => {
      const [a, b, c] = f.map((i) => pts[i]);
      let n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
      const cen = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
      if (n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] < 0) n = n.map((v) => -v); // outward
      const len = Math.hypot(...n) || 1; n = n.map((v) => v / len);
      return { a, b, c, n, z: cen[2] };
    }).filter((f) => f.n[2] > -0.05).sort((p, q) => q.z - p.z);
    ctx.lineWidth = Math.max(0.6, g.r / 22); ctx.lineJoin = 'round';
    for (const f of faces) {
      const lit = Math.max(0, f.n[0] * LIGHT[0] + f.n[1] * LIGHT[1] + f.n[2] * LIGHT[2]);
      const spec = Math.pow(lit, 12);
      ctx.fillStyle = `hsla(${g.h + lit * 30}, 90%, ${(dark ? 28 : 24) + lit * (dark ? 46 : 42) + spec * 22}%, ${dark ? 0.92 : 0.97})`;
      // Day mode gets a dark outline on the facets so the gem stays crisp on a light background.
      ctx.strokeStyle = dark ? `rgba(255, 255, 255, ${0.25 + spec * 0.6})` : `rgba(46, 16, 101, ${0.45 - spec * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(g.x + f.a[0] * g.r, g.y + f.a[1] * g.r);
      ctx.lineTo(g.x + f.b[0] * g.r, g.y + f.b[1] * g.r);
      ctx.lineTo(g.x + f.c[0] * g.r, g.y + f.c[1] * g.r);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // star sparkle on the crown
    drawSparkle(ctx, g.x + g.r * 0.55, g.y - g.r * 0.75, g.r * 0.7 * tw, tw, dark ? '#ffffff' : '#f59e0b');
  }

  function gemSky(canvas, opts) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, gems = [], stars = [], last = performance.now(), t = 0;
    const rand = (a, b) => a + Math.random() * (b - a);
    const spawnX = () => opts.region(W, H);
    function makeGem(y) {
      return { x: spawnX(), y: y ?? rand(0, H), r: rand(opts.min, opts.max), h: HUES[Math.floor(Math.random() * HUES.length)] + rand(-10, 10),
        rot: rand(0, 6.3), spin: rand(0.5, 1.4) * (Math.random() < 0.5 ? -1 : 1), tilt: rand(0.15, 0.5),
        vy: rand(6, 16), sway: rand(4, 12), f: rand(0.3, 0.8), p: rand(0, 6.3), tws: rand(1.5, 3.5), x0: 0 };
    }
    function resize() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const active = opts.active(W);
      gems = active ? Array.from({ length: opts.count(W, H) }, () => makeGem()) : [];
      gems.forEach((g) => { g.x0 = g.x; });
      stars = active ? Array.from({ length: opts.stars(W, H) }, () => ({ x: spawnX(), y: rand(0, H), s: rand(0.8, 2.6), p: rand(0, 6.3), sp: rand(1, 3) })) : [];
    }
    // Phones with "reduce/remove animations" (often switched on by battery saver) still get the
    // diamonds and stars, just moving more gently.
    const speed = reduceMotion ? 0.4 : 1;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000) * speed; last = now; t += dt;
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.classList.contains('dark') || opts.alwaysDark;
      const LIGHT_STARS = ['#7c3aed', '#db2777', '#2563eb', '#9333ea'];
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.p));
        if (dark) {
          ctx.globalAlpha = a; ctx.fillStyle = '#e0e7ff';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
          if (s.s > 1.7) drawSparkle(ctx, s.x, s.y, s.s * 3.6, a * 0.85, '#ffffff');
        } else {
          // Day mode: deeper colours and more sparkles so they stand out on the light background.
          const c = LIGHT_STARS[i % LIGHT_STARS.length];
          ctx.globalAlpha = a; ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 1.2, 0, Math.PI * 2); ctx.fill();
          if (s.s > 1.3) drawSparkle(ctx, s.x, s.y, s.s * 4.2, a, c);
        }
      }
      ctx.globalAlpha = 1;
      for (const g of gems) {
        g.y -= g.vy * dt;
        g.x = g.x0 + Math.sin(t * g.f + g.p) * g.sway;
        if (g.y < -g.r * 3) { Object.assign(g, makeGem(H + g.r * 3)); g.x0 = g.x; }
        drawGem(ctx, g, t, dark);
      }
      requestAnimationFrame(frame);
    }
    resize();
    SKIES.push({ canvas, get gems() { return gems; }, time: () => t });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  function setupDiamonds() {
    // 1) Hero background: diamonds and stars across the whole hero, behind the text.
    document.querySelectorAll('.cube-scene').forEach((scene) => {
      const c = document.createElement('canvas');
      c.className = 'gem-sky';
      scene.prepend(c);
      gemSky(c, {
        alwaysDark: false, min: 15, max: 32,
        active: () => true,
        region: (W) => Math.random() * W,
        count: (W, H) => Math.round(Math.min(20, Math.max(8, (W * H) / 60000))),
        stars: (W, H) => Math.round(Math.min(160, (W * H) / 6000)),
      });
    });
    // 2) The empty space on the left and right of the page content, on every page.
    const c = document.createElement('canvas');
    c.className = 'gem-gutter';
    document.body.appendChild(c);
    const gutter = (W) => (W - Math.min(W, 1280)) / 2 + 22;
    gemSky(c, {
      min: 9, max: 17,
      active: (W) => W >= 900,
      region: (W) => { const g = gutter(W), x = 16 + Math.random() * Math.max(4, g - 34); return Math.random() < 0.5 ? x : W - x; },
      count: (W, H) => Math.round(Math.min(18, Math.max(6, H / 70) * Math.min(2, gutter(W) / 60))),
      stars: (W, H) => Math.round(Math.min(80, H / 14)),
    });
  }

  function init() { setupDiamonds(); markGems(); markHeadings(); markBrands(); setupPointerFx(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
