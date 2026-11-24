// SmartNTech Image Compressor app: bulk compress / resize / convert images in the browser.
(function () {
  const $ = (id) => document.getElementById(id);
  const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EXT = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
  const items = []; // { id, file, bitmap, origUrl, out: Blob, outUrl, status }
  let seq = 0, timer;

  function settings() {
    return { q: +$('ic-q').value / 100, fmt: $('ic-fmt').value, w: parseInt($('ic-w').value, 10) || 0, h: parseInt($('ic-h').value, 10) || 0 };
  }

  async function addFiles(files) {
    const imgs = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 50 - items.length);
    if (!imgs.length) return;
    for (const file of imgs) {
      const it = { id: ++seq, file, origUrl: URL.createObjectURL(file), status: 'Working…' };
      items.push(it);
      try { it.bitmap = await createImageBitmap(file); } catch { it.status = 'Could not read this image'; }
    }
    render(); await runAll();
  }

  function encode(it, s) {
    return new Promise((resolve) => {
      const bw = it.bitmap.width, bh = it.bitmap.height;
      let scale = 1;
      if (s.w && bw > s.w) scale = Math.min(scale, s.w / bw);
      if (s.h && bh > s.h) scale = Math.min(scale, s.h / bh);
      const w = Math.max(1, Math.round(bw * scale)), h = Math.max(1, Math.round(bh * scale));
      let fmt = s.fmt === 'auto' ? (EXT[it.file.type] ? it.file.type : 'image/jpeg') : s.fmt;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (fmt === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(it.bitmap, 0, 0, w, h);
      c.toBlob((b) => resolve({ blob: b, w, h, fmt }), fmt, s.q);
    });
  }

  // Each run gets a number; if settings change mid-run, the older run stops so it can't overwrite newer results.
  let runId = 0;
  async function runAll() {
    const my = ++runId;
    const s = settings();
    for (const it of items) {
      if (!it.bitmap) continue;
      const r = await encode(it, s);
      if (my !== runId) return;
      if (!r.blob) { it.status = 'This browser cannot make that format'; continue; }
      if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      it.out = r.blob; it.outUrl = URL.createObjectURL(r.blob); it.dim = `${r.w}×${r.h}`; it.fmt = r.fmt; it.status = '';
      paintCard(it);
    }
    summary();
  }

  function outName(it) { return it.file.name.replace(/\.[^.]+$/, '') + '-min.' + EXT[it.fmt || 'image/jpeg']; }

  function render() {
    $('ic-list').innerHTML = items.map((it) => `
      <div id="ic-card-${it.id}" class="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="relative h-44 bg-slate-100 dark:bg-slate-950"><img src="${it.origUrl}" alt="" class="w-full h-full object-contain" />
          <button data-rm="${it.id}" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-sm" aria-label="Remove">✕</button></div>
        <div class="p-4"><div class="font-semibold text-sm truncate text-slate-900 dark:text-white" title="${esc(it.file.name)}">${esc(it.file.name)}</div>
          <div class="ic-meta mt-1 text-xs text-slate-500">${fmtBytes(it.file.size)} · ${esc(it.status)}</div>
          <div class="ic-bar mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div class="h-full w-0 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"></div></div>
          <div class="mt-3 flex gap-2"><a class="ic-dl btn-primary flex-1 text-center pointer-events-none opacity-50">Download</a><button data-cmp="${it.id}" class="btn-soft">Compare</button></div>
        </div>
      </div>`).join('');
    items.forEach(paintCard);
    summary();
  }

  function paintCard(it) {
    const card = $('ic-card-' + it.id); if (!card) return;
    const meta = card.querySelector('.ic-meta'), bar = card.querySelector('.ic-bar div'), dl = card.querySelector('.ic-dl');
    if (!it.out) { meta.textContent = fmtBytes(it.file.size) + ' · ' + it.status; return; }
    const pct = Math.round((1 - it.out.size / it.file.size) * 100);
    meta.innerHTML = `${fmtBytes(it.file.size)} → <b class="${pct > 0 ? 'text-emerald-600' : 'text-amber-600'}">${fmtBytes(it.out.size)}</b> · ${pct > 0 ? pct + '% smaller' : 'not smaller'} · ${it.dim}`;
    bar.style.width = Math.max(4, Math.min(100, pct)) + '%';
    dl.href = it.outUrl; dl.download = outName(it); dl.classList.remove('pointer-events-none', 'opacity-50');
  }

  function summary() {
    const done = items.filter((i) => i.out);
    $('ic-summary').classList.toggle('hidden', !items.length);
    const b = done.reduce((s, i) => s + i.file.size, 0), a = done.reduce((s, i) => s + i.out.size, 0);
    $('ic-count').textContent = items.length; $('ic-before').textContent = fmtBytes(b); $('ic-after').textContent = fmtBytes(a);
    $('ic-saved').textContent = b ? Math.max(0, Math.round((1 - a / b) * 100)) + '%' : '0%';
  }

  // ---------- events ----------
  $('ic-file').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
  const drop = $('ic-drop');
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('border-blue-500'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('border-blue-500'); }));
  drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
  window.addEventListener('paste', (e) => { const f = [...(e.clipboardData || {}).files || []]; if (f.length) addFiles(f); });
  $('ic-q').addEventListener('input', () => { $('ic-qv').textContent = $('ic-q').value; clearTimeout(timer); timer = setTimeout(runAll, 250); });
  ['ic-fmt', 'ic-w', 'ic-h'].forEach((id) => $(id).addEventListener('change', runAll));
  $('ic-list').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]'), cmp = e.target.closest('[data-cmp]');
    if (rm) { const i = items.findIndex((x) => x.id === +rm.dataset.rm); if (i >= 0) { URL.revokeObjectURL(items[i].origUrl); if (items[i].outUrl) URL.revokeObjectURL(items[i].outUrl); items.splice(i, 1); render(); } }
    if (cmp) openCompare(items.find((x) => x.id === +cmp.dataset.cmp));
  });
  $('ic-clear').addEventListener('click', () => { items.forEach((i) => { URL.revokeObjectURL(i.origUrl); if (i.outUrl) URL.revokeObjectURL(i.outUrl); }); items.length = 0; render(); });

  // Download all as one ZIP (library loaded only when needed)
  $('ic-zip').addEventListener('click', async () => {
    const done = items.filter((i) => i.out); if (!done.length) return;
    const btn = $('ic-zip'); btn.textContent = 'Preparing ZIP…';
    try {
      if (!window.JSZip) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      const zip = new window.JSZip(), used = {};
      done.forEach((i) => { let n = outName(i); while (used[n]) n = n.replace(/(\.\w+)$/, '-1$1'); used[n] = 1; zip.file(n, i.out); });
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'smartntech-compressed-images.zip'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { alert('Could not create the ZIP. Check your internet connection and try again.'); }
    btn.textContent = '⬇ Download all (ZIP)';
  });

  // Before / after compare slider
  function openCompare(it) {
    if (!it || !it.outUrl) return;
    $('ic-cmp-a').src = it.origUrl; $('ic-cmp-b').src = it.outUrl; $('ic-cmp-name').textContent = it.file.name;
    $('ic-cmp-range').value = 50; setCmp(50);
    $('ic-cmp').classList.remove('hidden');
  }
  function setCmp(v) { $('ic-cmp-clip').style.clipPath = `inset(0 0 0 ${v}%)`; $('ic-cmp-line').style.left = v + '%'; }
  $('ic-cmp-range').addEventListener('input', (e) => setCmp(e.target.value));
  $('ic-cmp-box').addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'mouse') { const r = e.currentTarget.getBoundingClientRect(); const v = Math.round(((e.clientX - r.left) / r.width) * 100); $('ic-cmp-range').value = v; setCmp(v); } });
  $('ic-cmp-close').addEventListener('click', () => $('ic-cmp').classList.add('hidden'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('ic-cmp').classList.add('hidden'); });
})();
