// SmartNTech Color Picker app.
(function () {
  const $ = (id) => document.getElementById(id);
  const toast = (m) => (window.showToast ? window.showToast(m) : (window.__sntToast || console.log)(m));
  const copy = async (t, label) => { try { await navigator.clipboard.writeText(t); flash((label || t) + ' copied ✓'); } catch { flash('Could not copy'); } };
  function flash(m) {
    let t = $('cp-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cp-toast'; t.className = 'fixed left-1/2 bottom-6 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-xl transition-opacity'; document.body.appendChild(t); }
    t.textContent = m; t.style.opacity = 1; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = 0; }, 1800);
  }
  // ---------- colour maths ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hexToRgb = (hex) => { let h = String(hex).replace('#', '').trim(); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; }
  function hslToRgb(h, s, l) { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255]; }
  function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [((h * 60) + 360) % 360, mx ? (d / mx) * 100 : 0, mx * 100]; }
  function rgbToCmyk(r, g, b) { const k = 1 - Math.max(r, g, b) / 255; if (k >= 1) return [0, 0, 0, 100]; return [(1 - r / 255 - k) / (1 - k), (1 - g / 255 - k) / (1 - k), (1 - b / 255 - k) / (1 - k), k].map((v) => v * 100); }
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const fromHsl = (h, s, l) => rgbToHex(...hslToRgb(h, s, l));
  const NAMES = { red: [0, 10], orange: [10, 40], yellow: [40, 65], lime: [65, 90], green: [90, 150], teal: [150, 180], cyan: [180, 200], blue: [200, 250], indigo: [250, 270], violet: [270, 290], purple: [290, 320], pink: [320, 345], rose: [345, 360] };
  function nameOf(rgb) { const [h, s, l] = rgbToHsl(...rgb); if (s < 10) return l > 92 ? 'White' : l < 8 ? 'Black' : 'Grey'; const n = Object.entries(NAMES).find(([, [a, b]]) => h >= a && h < b)[0]; return (l < 30 ? 'Dark ' : l > 75 ? 'Light ' : '') + n[0].toUpperCase() + n.slice(1); }

  // ---------- main colour ----------
  let cur = '#7c3aed', mode = 'analogous';
  const MODES = {
    complementary: (h, s, l) => [[h, s, l], [h, s, Math.min(l + 20, 90)], [h + 180, s, l], [h + 180, s, Math.max(l - 20, 15)], [h + 180, s, Math.min(l + 20, 90)]],
    analogous: (h, s, l) => [[h - 40, s, l], [h - 20, s, l], [h, s, l], [h + 20, s, l], [h + 40, s, l]],
    triadic: (h, s, l) => [[h, s, l], [h + 120, s, l], [h + 240, s, l], [h + 120, s, Math.min(l + 20, 90)], [h + 240, s, Math.max(l - 20, 15)]],
    split: (h, s, l) => [[h, s, l], [h + 150, s, l], [h + 210, s, l], [h + 150, s, Math.min(l + 20, 90)], [h + 210, s, Math.max(l - 20, 15)]],
    tetradic: (h, s, l) => [[h, s, l], [h + 90, s, l], [h + 180, s, l], [h + 270, s, l], [h, s, Math.min(l + 25, 92)]],
    monochrome: (h, s, l) => [15, 30, 45, 60, 80].map((L) => [h, s, L]),
  };
  const MODE_LABEL = { complementary: 'Complementary', analogous: 'Analogous', triadic: 'Triadic', split: 'Split', tetradic: 'Tetradic', monochrome: 'Monochrome' };
  let palette = [];

  function setColor(hex, fromInput) {
    const rgb = hexToRgb(hex); if (!rgb) return;
    cur = rgbToHex(...rgb);
    if ($('cp-pick').value !== cur) $('cp-pick').value = cur;
    if (!fromInput) $('cp-hex').value = cur;
    const [h, s, l] = rgbToHsl(...rgb), [hv, sv, vv] = rgbToHsv(...rgb), cmyk = rgbToCmyk(...rgb);
    $('cp-big').style.background = cur;
    $('cp-big-name').textContent = nameOf(rgb) + ' · ' + cur.toUpperCase();
    const codes = [['HEX', cur.toUpperCase()], ['RGB', `rgb(${rgb.join(', ')})`], ['HSL', `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`], ['HSV', `hsv(${Math.round(hv)}, ${Math.round(sv)}%, ${Math.round(vv)}%)`], ['CMYK', `cmyk(${cmyk.map((v) => Math.round(v) + '%').join(', ')})`], ['RGBA', `rgba(${rgb.join(', ')}, 1)`]];
    $('cp-codes').innerHTML = codes.map(([k, v]) => `<div class="flex items-center gap-2"><span class="w-12 text-xs font-bold text-slate-500">${k}</span><code class="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs truncate">${v}</code><button class="btn-soft" data-copy="${v}">Copy</button></div>`).join('');
    // harmony
    $('cp-modes').innerHTML = Object.keys(MODES).map((m) => `<button data-mode="${m}" class="px-3 py-1.5 rounded-full text-xs font-semibold border transition ${m === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400'}">${MODE_LABEL[m]}</button>`).join('');
    palette = MODES[mode](h, s, l).map(([H, S, L]) => fromHsl(H, S, L));
    $('cp-harmony').innerHTML = palette.map((c) => `<button data-use="${c}" class="rounded-xl flex items-end justify-center pb-1.5 text-[10px] font-bold font-mono hover:scale-105 transition" style="background:${c};color:${contrast(hexToRgb(c), [255, 255, 255]) > 3 ? '#fff' : '#111'}">${c.toUpperCase()}</button>`).join('');
    const shades = [96, 90, 80, 70, 60, 50, 40, 30, 20, 12, 6].map((L) => fromHsl(h, s, L));
    $('cp-shades').innerHTML = shades.map((c) => `<button data-use="${c}" title="${c}" class="aspect-square rounded-lg border border-black/10 hover:scale-110 transition" style="background:${c}"></button>`).join('');
    // contrast follows the picked colour as background
    $('cc-bg').value = cur; $('cc-bg-p').value = cur; checkContrast();
    try { localStorage.setItem('cp_last', cur); } catch {}
  }

  // ---------- contrast ----------
  function checkContrast() {
    const fg = hexToRgb($('cc-fg').value), bg = hexToRgb($('cc-bg').value); if (!fg || !bg) return;
    const r = contrast(fg, bg);
    $('cc-prev').style.background = rgbToHex(...bg); $('cc-prev').style.color = rgbToHex(...fg);
    $('cc-ratio').textContent = r.toFixed(2) + ' : 1';
    const tests = [['AA text', r >= 4.5], ['AAA text', r >= 7], ['AA large', r >= 3], ['AAA large', r >= 4.5]];
    $('cc-badges').innerHTML = tests.map(([n, ok]) => `<span class="px-2 py-1 rounded-lg text-xs font-bold ${ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}">${ok ? '✓' : '✕'} ${n}</span>`).join('');
  }
  const pair = (txt, pick) => { $(txt).addEventListener('input', () => { if (hexToRgb($(txt).value)) { $(pick).value = rgbToHex(...hexToRgb($(txt).value)); checkContrast(); } }); $(pick).addEventListener('input', () => { $(txt).value = $(pick).value; checkContrast(); }); };
  pair('cc-fg', 'cc-fg-p'); pair('cc-bg', 'cc-bg-p');
  $('cc-swap').addEventListener('click', () => { const a = $('cc-fg').value; $('cc-fg').value = $('cc-bg').value; $('cc-bg').value = a; $('cc-fg-p').value = $('cc-fg').value; $('cc-bg-p').value = $('cc-bg').value; checkContrast(); });

  // ---------- gradient ----------
  function grad() {
    const css = `linear-gradient(${$('gr-ang').value}deg, ${$('gr-a').value}, ${$('gr-b').value})`;
    $('gr-prev').style.background = css; $('gr-css').textContent = 'background: ' + css + ';'; $('gr-angv').textContent = $('gr-ang').value;
  }
  ['gr-a', 'gr-b', 'gr-ang'].forEach((id) => $(id).addEventListener('input', grad));
  $('gr-copy').addEventListener('click', () => copy($('gr-css').textContent, 'CSS'));

  // ---------- image palette ----------
  const cv = $('ip-canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  $('ip-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const bmp = await createImageBitmap(f);
    const scale = Math.min(1, 900 / bmp.width); cv.width = Math.round(bmp.width * scale); cv.height = Math.round(bmp.height * scale);
    cx.drawImage(bmp, 0, 0, cv.width, cv.height); cv.classList.remove('hidden');
    // Simple colour quantisation: bucket pixels by 4 bits per channel, keep the most common distinct buckets.
    const d = cx.getImageData(0, 0, cv.width, cv.height).data, buckets = new Map();
    for (let i = 0; i < d.length; i += 16) { if (d[i + 3] < 128) continue; const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4); const b = buckets.get(k) || [0, 0, 0, 0]; b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++; buckets.set(k, b); }
    const sorted = [...buckets.values()].sort((a, b) => b[3] - a[3]).map((b) => [b[0] / b[3], b[1] / b[3], b[2] / b[3]]);
    const picked = [];
    for (const c of sorted) { if (picked.every((p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) > 48)) picked.push(c); if (picked.length === 8) break; }
    $('ip-colors').innerHTML = picked.map((c) => { const hx = rgbToHex(...c); return `<button data-use="${hx}" class="rounded-xl h-16 flex items-end justify-center pb-1 text-[10px] font-bold font-mono border border-black/10" style="background:${hx};color:${contrast(c, [255, 255, 255]) > 3 ? '#fff' : '#111'}">${hx.toUpperCase()}</button>`; }).join('');
  });
  cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) * cv.width / r.width), y = Math.floor((e.clientY - r.top) * cv.height / r.height); const p = cx.getImageData(x, y, 1, 1).data; setColor(rgbToHex(p[0], p[1], p[2])); flash('Picked ' + rgbToHex(p[0], p[1], p[2]).toUpperCase()); });

  // ---------- saved ----------
  const saved = () => { try { return JSON.parse(localStorage.getItem('cp_saved') || '[]'); } catch { return []; } };
  function paintSaved() {
    const s = saved();
    $('sv-list').innerHTML = s.length ? s.map((c) => `<div class="group relative"><button data-use="${c}" class="w-14 h-14 rounded-xl border border-black/10 shadow-sm" style="background:${c}" title="${c}"></button><button data-del="${c}" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] hidden group-hover:block">✕</button><div class="text-[10px] font-mono text-center mt-1">${c}</div></div>`).join('') : '<p class="text-sm text-slate-400">No saved colours yet. Use ☆ Save colour.</p>';
  }
  $('cp-save').addEventListener('click', () => { const s = saved().filter((c) => c !== cur); s.unshift(cur); localStorage.setItem('cp_saved', JSON.stringify(s.slice(0, 40))); paintSaved(); flash('Saved ' + cur.toUpperCase()); });
  $('sv-clear').addEventListener('click', () => { if (confirm('Remove all saved colours?')) { localStorage.removeItem('cp_saved'); paintSaved(); } });

  // ---------- export ----------
  function exportPalette(kind) {
    const names = ['primary', 'secondary', 'accent', 'muted', 'highlight'];
    const out = kind === 'css' ? ':root {\n' + palette.map((c, i) => `  --color-${names[i]}: ${c};`).join('\n') + '\n}'
      : kind === 'tw' ? 'colors: {\n' + palette.map((c, i) => `  ${names[i]}: '${c}',`).join('\n') + '\n}'
      : JSON.stringify(Object.fromEntries(palette.map((c, i) => [names[i], c])), null, 2);
    copy(out, { css: 'CSS variables', tw: 'Tailwind colours', json: 'JSON' }[kind]);
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-copy],[data-use],[data-mode],[data-del],[data-exp]'); if (!t) return;
    if (t.dataset.copy) copy(t.dataset.copy);
    else if (t.dataset.use) { setColor(t.dataset.use); copy(t.dataset.use); }
    else if (t.dataset.mode) { mode = t.dataset.mode; setColor(cur); }
    else if (t.dataset.del) { localStorage.setItem('cp_saved', JSON.stringify(saved().filter((c) => c !== t.dataset.del))); paintSaved(); }
    else if (t.dataset.exp) exportPalette(t.dataset.exp);
  });
  $('cp-pick').addEventListener('input', (e) => setColor(e.target.value));
  $('cp-hex').addEventListener('input', (e) => setColor(e.target.value, true));
  $('cp-rand').addEventListener('click', () => setColor(fromHsl(Math.random() * 360, 55 + Math.random() * 35, 40 + Math.random() * 25)));
  if ('EyeDropper' in window) { $('cp-eye').classList.remove('hidden'); $('cp-eye').addEventListener('click', async () => { try { const r = await new window.EyeDropper().open(); setColor(r.sRGBHex); } catch { /* cancelled */ } }); }

  let start = '#7c3aed'; try { start = localStorage.getItem('cp_last') || start; } catch {}
  setColor(start); grad(); paintSaved();
})();
