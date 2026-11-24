// SmartNTech: six extra tools (QR code, image compressor, colour picker, Markdown editor,
// regex tester, unit converter). Panels are injected into the Tools box on index.html before
// the main script runs, so switchTool('qr') etc. work like the original six tools.
// Libraries (QR, Markdown) load only when their tool is first opened.
(function () {
  const $id = (id) => document.getElementById(id);
  const escH = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (m, err) => (window.showToast ? window.showToast(m, err) : console.log(m));
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); toast((label || 'Copied') + ' ✓'); }
    catch { toast('Could not copy. Select the text and press Ctrl+C.', true); }
  };
  const scripts = {};
  const loadScript = (src) => scripts[src] || (scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => { delete scripts[src]; rej(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  }));
  const LIB = {
    qr: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    marked: 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js',
    purify: 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js',
  };
  const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB');
  const head = (title, badge, badgeCls, desc) => `
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${title}</h3>
            <span class="text-xs font-semibold ${badgeCls} px-2.5 py-1 rounded-full">${badge}</span>
          </div>
          <p class="text-sm text-slate-500 mb-4">${desc}</p>`;

  // ---------------------------------------------------------------- panels
  const PANELS = {
    qr: head('QR Code Generator', 'New', 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600', 'Turn any link or text into a QR code. Download it as a PNG.') + `
          <div class="grid lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div><label for="qr-text" class="text-xs font-semibold">Text or URL</label>
                <textarea id="qr-text" rows="4" class="field mt-1" placeholder="https://saurabh88862-png.github.io/smartntech/" oninput="SNTX.qr()"></textarea></div>
              <div class="grid grid-cols-3 gap-3">
                <div><label for="qr-size" class="text-xs font-semibold">Size</label>
                  <select id="qr-size" class="field mt-1" onchange="SNTX.qr()"><option value="160">Small</option><option value="256" selected>Medium</option><option value="384">Large</option></select></div>
                <div><label for="qr-fg" class="text-xs font-semibold">Colour</label><input id="qr-fg" type="color" value="#1e1b4b" class="field mt-1 h-11 p-1" oninput="SNTX.qr()" /></div>
                <div><label for="qr-bg" class="text-xs font-semibold">Background</label><input id="qr-bg" type="color" value="#ffffff" class="field mt-1 h-11 p-1" oninput="SNTX.qr()" /></div>
              </div>
              <div class="flex flex-wrap gap-2"><button onclick="SNTX.qrDownload()" class="btn-primary">Download PNG</button><button onclick="SNTX.qrSample()" class="btn-soft">Use my website link</button></div>
            </div>
            <div class="flex items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 min-h-[260px]">
              <div id="qr-out" class="bg-white p-3 rounded-xl shadow"></div>
              <p id="qr-empty" class="text-sm text-slate-400">Type something to create a QR code.</p>
            </div>
          </div>`,

    img: head('Image Compressor', 'New', 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600', 'Shrink JPG, PNG and WebP images in your browser. The image is never uploaded.') + `
          <label for="img-file" class="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 cursor-pointer hover:border-blue-400 transition text-center">
            <span class="text-3xl">🖼️</span><span class="text-sm font-semibold">Tap to choose an image</span><span class="text-xs text-slate-400">JPG, PNG or WebP</span>
            <input id="img-file" type="file" accept="image/*" class="hidden" onchange="SNTX.imgLoad(this.files[0])" />
          </label>
          <div class="grid sm:grid-cols-3 gap-4 mt-4">
            <div><label for="img-q" class="text-xs font-semibold">Quality: <span id="img-qv">75</span>%</label><input id="img-q" type="range" min="10" max="100" value="75" class="w-full mt-2 accent-blue-600" oninput="$('img-qv').textContent=this.value;SNTX.imgRun()" /></div>
            <div><label for="img-w" class="text-xs font-semibold">Max width (px)</label><input id="img-w" type="number" min="16" placeholder="Keep original" class="field mt-1" onchange="SNTX.imgRun()" /></div>
            <div><label for="img-fmt" class="text-xs font-semibold">Format</label><select id="img-fmt" class="field mt-1" onchange="SNTX.imgRun()"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></div>
          </div>
          <div id="img-result" class="hidden mt-5 grid sm:grid-cols-2 gap-4">
            <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-800"><div class="text-xs font-semibold text-slate-500 mb-2">Original · <span id="img-o-size"></span></div><img id="img-o" alt="Original image" class="w-full max-h-64 object-contain rounded-lg" /></div>
            <div class="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900"><div class="text-xs font-semibold text-emerald-600 mb-2">Compressed · <span id="img-c-size"></span> <span id="img-save"></span></div><img id="img-c" alt="Compressed image" class="w-full max-h-64 object-contain rounded-lg" /></div>
            <div class="sm:col-span-2"><a id="img-dl" class="btn-primary inline-block" download="compressed.jpg">Download compressed image</a></div>
          </div>`,

    color: head('Color Picker & Converter', 'New', 'bg-pink-50 dark:bg-pink-950/50 text-pink-600', 'Pick a colour and get HEX, RGB and HSL codes, shades and a contrast check.') + `
          <div class="grid lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input id="col-pick" type="color" value="#7c3aed" class="w-20 h-20 rounded-2xl cursor-pointer border border-slate-300 dark:border-slate-700 p-1 bg-transparent" oninput="SNTX.color(this.value)" />
                <div class="flex-1"><label for="col-hex" class="text-xs font-semibold">HEX code</label><input id="col-hex" class="field mt-1 font-mono" value="#7c3aed" oninput="SNTX.color(this.value)" /></div>
              </div>
              <button id="col-eye" onclick="SNTX.eyedrop()" class="btn-soft hidden">🎯 Pick a colour from the screen</button>
              <div id="col-codes" class="space-y-2"></div>
            </div>
            <div>
              <div id="col-swatch" class="h-28 rounded-2xl shadow-inner flex items-end p-3 gap-2"></div>
              <div class="text-xs font-semibold mt-4 mb-2">Shades (tap to copy)</div>
              <div id="col-shades" class="grid grid-cols-9 gap-1.5"></div>
            </div>
          </div>`,

    md: head('Markdown Editor', 'New', 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', 'Write Markdown on the left and see the formatted result live on the right.') + `
          <div class="flex flex-wrap gap-2 mb-3">
            <button onclick="SNTX.mdWrap('**','**')" class="btn-soft font-bold">B</button><button onclick="SNTX.mdWrap('*','*')" class="btn-soft italic">I</button>
            <button onclick="SNTX.mdWrap('\\n## ','')" class="btn-soft">H2</button><button onclick="SNTX.mdWrap('[','](https://)')" class="btn-soft">Link</button>
            <button onclick="SNTX.mdWrap('\\n- ','')" class="btn-soft">List</button><button onclick="SNTX.mdWrap('\`','\`')" class="btn-soft font-mono">code</button>
            <span class="flex-1"></span>
            <button onclick="SNTX.mdCopyHtml()" class="btn-blue">Copy HTML</button><button onclick="SNTX.mdDownload()" class="btn-violet">Download .md</button>
          </div>
          <div class="grid lg:grid-cols-2 gap-4">
            <textarea id="md-in" rows="14" class="field font-mono text-xs leading-relaxed" oninput="SNTX.md()"></textarea>
            <div id="md-out" class="md-preview p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-auto max-h-[420px] text-sm"></div>
          </div>`,

    regex: head('Regex Tester', 'New', 'bg-amber-50 dark:bg-amber-950/50 text-amber-600', 'Test regular expressions live. Matches are highlighted and groups are listed.') + `
          <div class="flex flex-wrap items-end gap-3">
            <div class="flex-1 min-w-[220px]"><label for="rx-pat" class="text-xs font-semibold">Pattern</label>
              <div class="flex items-center mt-1 font-mono"><span class="px-2 text-slate-400">/</span><input id="rx-pat" class="field font-mono" value="\\b\\w+@\\w+\\.\\w+\\b" oninput="SNTX.regex()" /><span class="px-2 text-slate-400">/</span></div></div>
            <div class="flex flex-wrap gap-1.5 text-xs font-mono">${['g', 'i', 'm', 's', 'u'].map((f) => `<label class="chk !py-1.5 !px-2.5"><input type="checkbox" id="rx-${f}" ${f === 'g' || f === 'i' ? 'checked' : ''} onchange="SNTX.regex()" />${f}</label>`).join('')}</div>
          </div>
          <p id="rx-err" class="hidden mt-2 text-xs font-semibold text-rose-500"></p>
          <div class="grid lg:grid-cols-2 gap-4 mt-4">
            <div><label for="rx-text" class="text-xs font-semibold">Test text</label><textarea id="rx-text" rows="7" class="field mt-1 font-mono text-xs" oninput="SNTX.regex()">Contact us at hello@smartntech.dev or support@example.com.
Phone: +91 98765 43210</textarea></div>
            <div><div class="text-xs font-semibold mb-1">Highlighted <span id="rx-count" class="ml-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"></span></div>
              <div id="rx-hl" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs whitespace-pre-wrap break-words min-h-[150px]"></div></div>
          </div>
          <div class="grid lg:grid-cols-2 gap-4 mt-4">
            <div><div class="text-xs font-semibold mb-1">Matches & groups</div><div id="rx-list" class="space-y-1 max-h-48 overflow-auto text-xs font-mono"></div></div>
            <div><label for="rx-rep" class="text-xs font-semibold">Replace with (optional, use $1 for groups)</label><input id="rx-rep" class="field mt-1 font-mono" placeholder="[hidden]" oninput="SNTX.regex()" />
              <div id="rx-out" class="mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap break-words"></div></div>
          </div>`,

    unit: head('Unit Converter', 'New', 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600', 'Convert length, weight, temperature, data, speed, area, volume and time.') + `
          <div class="flex flex-wrap gap-2 mb-4" id="unit-cats"></div>
          <div class="grid sm:grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div><label for="unit-from" class="text-xs font-semibold">From</label><input id="unit-val" type="number" value="1" class="field mt-1 text-lg font-bold" oninput="SNTX.unit()" /><select id="unit-from" class="field mt-2" onchange="SNTX.unit()"></select></div>
            <button onclick="SNTX.unitSwap()" class="btn3d mx-auto mb-1" aria-label="Swap units"><span>⇄</span></button>
            <div><label for="unit-to" class="text-xs font-semibold">To</label><div id="unit-res" class="field mt-1 text-lg font-bold text-blue-600 truncate">0</div><select id="unit-to" class="field mt-2" onchange="SNTX.unit()"></select></div>
          </div>
          <div class="mt-5"><div class="text-xs font-semibold mb-2">All conversions</div><div id="unit-all" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs"></div></div>`,
  };

  // Inject panels into the Tools box (right after the last existing panel).
  const ageP = $id('panel-age');
  if (ageP) {
    let after = ageP;
    Object.entries(PANELS).forEach(([id, html]) => {
      const d = document.createElement('div');
      d.id = 'panel-' + id; d.className = 'tool-panel hidden p-5 sm:p-8'; d.innerHTML = html;
      after.after(d); after = d;
    });
  }
  // Markdown preview styles
  const st = document.createElement('style');
  st.textContent = `.md-preview h1{font-size:1.6em;font-weight:800;margin:.4em 0}.md-preview h2{font-size:1.3em;font-weight:700;margin:.8em 0 .3em}.md-preview h3{font-size:1.1em;font-weight:700;margin:.8em 0 .3em}
  .md-preview p{margin:.5em 0}.md-preview ul{list-style:disc;padding-left:1.4em}.md-preview ol{list-style:decimal;padding-left:1.4em}.md-preview a{color:#2563eb;text-decoration:underline}
  .md-preview code{font-family:'JetBrains Mono',monospace;font-size:.9em;background:rgba(124,58,237,.1);padding:.1em .35em;border-radius:.3em}.md-preview pre{background:#0f172a;color:#e2e8f0;padding:.8em;border-radius:.6em;overflow:auto}.md-preview pre code{background:none;padding:0}
  .md-preview blockquote{border-left:4px solid #a78bfa;padding-left:.8em;color:#64748b}.md-preview table{border-collapse:collapse}.md-preview th,.md-preview td{border:1px solid #cbd5e1;padding:.3em .6em}.md-preview hr{margin:1em 0;border-color:#cbd5e1}
  mark.rx{background:#fde68a;color:#78350f;border-radius:.2em;padding:0 .1em}.dark mark.rx{background:#b45309;color:#fff}`;
  document.head.prepend(st);

  // ---------------------------------------------------------------- QR code
  let qrTimer;
  async function qr() {
    clearTimeout(qrTimer);
    qrTimer = setTimeout(async () => {
      const text = $id('qr-text').value.trim();
      $id('qr-empty').classList.toggle('hidden', !!text);
      $id('qr-out').classList.toggle('hidden', !text);
      if (!text) return;
      try { await loadScript(LIB.qr); } catch (e) { toast('QR library could not load. Check your internet.', true); return; }
      const size = +$id('qr-size').value;
      $id('qr-out').innerHTML = '';
      new window.QRCode($id('qr-out'), { text, width: size, height: size, colorDark: $id('qr-fg').value, colorLight: $id('qr-bg').value, correctLevel: window.QRCode.CorrectLevel.M });
    }, 150);
  }
  function qrDownload() {
    const c = $id('qr-out').querySelector('canvas');
    if (!c || !$id('qr-text').value.trim()) return toast('Type some text first.', true);
    const a = document.createElement('a'); a.download = 'smartntech-qr.png'; a.href = c.toDataURL('image/png'); a.click();
  }
  function qrSample() { $id('qr-text').value = location.hostname.endsWith('github.io') ? location.origin + location.pathname.replace(/index\.html$/, '') : 'https://saurabh88862-png.github.io/smartntech/'; qr(); }

  // ---------------------------------------------------------------- image compressor
  let imgSrc = null, imgName = 'image', imgOrigSize = 0, imgUrl = null;
  function imgLoad(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Please choose an image file.', true);
    imgName = file.name.replace(/\.[^.]+$/, ''); imgOrigSize = file.size;
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { imgSrc = im; $id('img-o').src = r.result; $id('img-o-size').textContent = fmtBytes(file.size) + ` · ${im.naturalWidth}×${im.naturalHeight}`; imgRun(); }; im.src = r.result; };
    r.readAsDataURL(file);
  }
  function imgRun() {
    if (!imgSrc) return;
    const maxW = parseInt($id('img-w').value, 10);
    const scale = maxW && maxW < imgSrc.naturalWidth ? maxW / imgSrc.naturalWidth : 1;
    const w = Math.max(1, Math.round(imgSrc.naturalWidth * scale)), h = Math.max(1, Math.round(imgSrc.naturalHeight * scale));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const fmt = $id('img-fmt').value;
    if (fmt === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); } // JPG has no transparency
    ctx.drawImage(imgSrc, 0, 0, w, h);
    c.toBlob((blob) => {
      if (!blob) return toast('This browser cannot create that format. Try JPG.', true);
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      imgUrl = URL.createObjectURL(blob);
      $id('img-c').src = imgUrl;
      $id('img-c-size').textContent = fmtBytes(blob.size) + ` · ${w}×${h}`;
      const pct = Math.round((1 - blob.size / imgOrigSize) * 100);
      $id('img-save').textContent = pct > 0 ? `(${pct}% smaller)` : '(not smaller, try lower quality or JPG/WebP)';
      const ext = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[fmt];
      $id('img-dl').href = imgUrl; $id('img-dl').download = imgName + '-compressed.' + ext;
      $id('img-result').classList.remove('hidden');
    }, fmt, +$id('img-q').value / 100);
  }

  // ---------------------------------------------------------------- colour
  const hexToRgb = (hex) => { let h = hex.replace('#', '').trim(); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const rgbToHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  function color(v) {
    const rgb = hexToRgb(v || ''); if (!rgb) return;
    const hex = rgbToHex(...rgb), [h, s, l] = rgbToHsl(...rgb);
    if ($id('col-pick').value !== hex) $id('col-pick').value = hex;
    if (document.activeElement !== $id('col-hex')) $id('col-hex').value = hex;
    const codes = [['HEX', hex.toUpperCase()], ['RGB', `rgb(${rgb.join(', ')})`], ['HSL', `hsl(${h}, ${s}%, ${l}%)`], ['CSS var', `--brand: ${hex};`]];
    $id('col-codes').innerHTML = codes.map(([k, val]) => `<div class="flex items-center gap-2"><span class="w-16 text-xs font-bold text-slate-500">${k}</span><code class="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs">${escH(val)}</code><button class="btn-soft" onclick="SNTX.copy('${escH(val)}','${k} copied')">Copy</button></div>`).join('');
    const cw = contrast(rgb, [255, 255, 255]), cb = contrast(rgb, [0, 0, 0]);
    const grade = (c) => (c >= 7 ? 'AAA' : c >= 4.5 ? 'AA' : c >= 3 ? 'AA large' : 'Fail');
    $id('col-swatch').style.background = hex;
    $id('col-swatch').innerHTML = `<span class="px-2 py-1 rounded-lg text-xs font-bold bg-white/90 text-slate-900">White text ${cw.toFixed(2)}:1 · ${grade(cw)}</span><span class="px-2 py-1 rounded-lg text-xs font-bold bg-black/80 text-white">Black text ${cb.toFixed(2)}:1 · ${grade(cb)}</span>`;
    const shades = [95, 85, 75, 65, l, 40, 30, 20, 10].map((L) => { const [r2, g2, b2] = hslToRgb(h, s, L); return rgbToHex(r2, g2, b2); });
    $id('col-shades').innerHTML = shades.map((c) => `<button title="${c}" onclick="SNTX.color('${c}');SNTX.copy('${c}','${c} copied')" class="aspect-square rounded-lg border border-black/10 hover:scale-110 transition" style="background:${c}"></button>`).join('');
  }
  function hslToRgb(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255]; }
  async function eyedrop() { try { const r = await new window.EyeDropper().open(); color(r.sRGBHex); } catch { /* cancelled */ } }

  // ---------------------------------------------------------------- markdown
  const MD_SAMPLE = `# Hello from SmartNTech 👋

Write **bold**, *italic* and \`inline code\`.

## A list
- Fast and free
- Works offline
- [Visit the blog](https://saurabh88862-png.github.io/smartntech/)

> Tip: everything stays in your browser.

\`\`\`js
console.log('Hello, Markdown!');
\`\`\`
`;
  let mdReady = null, mdTimer;
  function md() {
    clearTimeout(mdTimer);
    mdTimer = setTimeout(async () => {
      try { mdReady = mdReady || Promise.all([loadScript(LIB.marked), loadScript(LIB.purify)]); await mdReady; }
      catch { mdReady = null; $id('md-out').textContent = 'Preview needs an internet connection the first time.'; return; }
      $id('md-out').innerHTML = window.DOMPurify.sanitize(window.marked.parse($id('md-in').value));
    }, 120);
  }
  function mdWrap(a, b) {
    const t = $id('md-in'), s = t.selectionStart, e = t.selectionEnd, sel = t.value.slice(s, e) || 'text';
    t.value = t.value.slice(0, s) + a + sel + b + t.value.slice(e);
    t.focus(); t.setSelectionRange(s + a.length, s + a.length + sel.length); md();
  }
  function mdDownload() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([$id('md-in').value], { type: 'text/markdown' })); a.download = 'document.md'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

  // ---------------------------------------------------------------- regex
  function regex() {
    const pat = $id('rx-pat').value, text = $id('rx-text').value;
    const flags = ['g', 'i', 'm', 's', 'u'].filter((f) => $id('rx-' + f).checked).join('');
    const err = $id('rx-err');
    let re;
    try { re = new RegExp(pat, flags.includes('g') ? flags : flags + 'g'); err.classList.add('hidden'); }
    catch (e) { err.textContent = e.message; err.classList.remove('hidden'); $id('rx-hl').textContent = text; $id('rx-count').textContent = '0 matches'; $id('rx-list').innerHTML = ''; $id('rx-out').textContent = ''; return; }
    const matches = pat ? [...text.matchAll(re)].slice(0, 500) : [];
    const shown = flags.includes('g') ? matches : matches.slice(0, 1);
    let html = '', last = 0;
    shown.forEach((m) => { if (m[0] === '') return; html += escH(text.slice(last, m.index)) + `<mark class="rx">${escH(m[0])}</mark>`; last = m.index + m[0].length; });
    $id('rx-hl').innerHTML = html + escH(text.slice(last));
    $id('rx-count').textContent = shown.length + (shown.length === 1 ? ' match' : ' matches');
    $id('rx-list').innerHTML = shown.length ? shown.map((m, i) => `<div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"><b>#${i + 1}</b> “${escH(m[0])}” <span class="text-slate-400">at ${m.index}</span>${m.length > 1 ? '<br>' + m.slice(1).map((g, j) => `<span class="text-violet-600">$${j + 1}</span> = ${g === undefined ? '<i>none</i>' : '“' + escH(g) + '”'}`).join(' · ') : ''}</div>`).join('') : '<p class="text-slate-400">No matches.</p>';
    const rep = $id('rx-rep').value;
    $id('rx-out').textContent = rep ? text.replace(new RegExp(pat, flags), rep) : 'Type a replacement to preview the result.';
  }

  // ---------------------------------------------------------------- units
  const UNITS = {
    Length: { m: ['Metre', 1], km: ['Kilometre', 1000], cm: ['Centimetre', 0.01], mm: ['Millimetre', 0.001], mi: ['Mile', 1609.344], yd: ['Yard', 0.9144], ft: ['Foot', 0.3048], in: ['Inch', 0.0254] },
    Weight: { kg: ['Kilogram', 1], g: ['Gram', 0.001], mg: ['Milligram', 1e-6], t: ['Tonne', 1000], lb: ['Pound', 0.45359237], oz: ['Ounce', 0.028349523125] },
    Temperature: { c: ['Celsius'], f: ['Fahrenheit'], k: ['Kelvin'] },
    Data: { B: ['Byte', 1], KB: ['Kilobyte', 1024], MB: ['Megabyte', 1048576], GB: ['Gigabyte', 1073741824], TB: ['Terabyte', 1099511627776], bit: ['Bit', 0.125] },
    Speed: { kmh: ['km/h', 1 / 3.6], ms: ['m/s', 1], mph: ['mph', 0.44704], kn: ['Knot', 0.514444] },
    Area: { m2: ['Square metre', 1], km2: ['Square km', 1e6], ha: ['Hectare', 10000], acre: ['Acre', 4046.8564224], ft2: ['Square foot', 0.09290304], sqyd: ['Square yard', 0.83612736] },
    Volume: { l: ['Litre', 1], ml: ['Millilitre', 0.001], m3: ['Cubic metre', 1000], gal: ['US gallon', 3.785411784], cup: ['Cup (US)', 0.2365882365] },
    Time: { s: ['Second', 1], min: ['Minute', 60], h: ['Hour', 3600], d: ['Day', 86400], wk: ['Week', 604800], yr: ['Year (365 d)', 31536000] },
  };
  let unitCat = 'Length';
  const toC = (v, u) => (u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15);
  const fromC = (v, u) => (u === 'c' ? v : u === 'f' ? v * 9 / 5 + 32 : v + 273.15);
  const conv = (v, from, to) => (unitCat === 'Temperature' ? fromC(toC(v, from), to) : v * UNITS[unitCat][from][1] / UNITS[unitCat][to][1]);
  const nice = (n) => (!isFinite(n) ? '—' : Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-6 && n !== 0) ? n.toExponential(4) : (+n.toPrecision(10)).toLocaleString(undefined, { maximumFractionDigits: 8 }));
  function unitSetCat(cat) {
    unitCat = cat;
    $id('unit-cats').innerHTML = Object.keys(UNITS).map((c) => `<button onclick="SNTX.unitSetCat('${c}')" class="px-3 py-1.5 rounded-full text-xs font-semibold border transition ${c === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400'}">${c}</button>`).join('');
    const opts = Object.entries(UNITS[cat]).map(([k, [name]]) => `<option value="${k}">${name}</option>`).join('');
    $id('unit-from').innerHTML = opts; $id('unit-to').innerHTML = opts;
    $id('unit-to').selectedIndex = 1;
    unit();
  }
  function unit() {
    const v = parseFloat($id('unit-val').value), from = $id('unit-from').value, to = $id('unit-to').value;
    if (isNaN(v)) { $id('unit-res').textContent = '—'; $id('unit-all').innerHTML = ''; return; }
    $id('unit-res').textContent = nice(conv(v, from, to)) + ' ' + UNITS[unitCat][to][0];
    $id('unit-all').innerHTML = Object.entries(UNITS[unitCat]).map(([k, [name]]) => `<div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"><div class="font-bold text-slate-900 dark:text-white truncate">${nice(conv(v, from, k))}</div><div class="text-slate-500">${name}</div></div>`).join('');
  }
  function unitSwap() { const f = $id('unit-from'), t = $id('unit-to'), x = f.value; f.value = t.value; t.value = x; unit(); }

  // ---------------------------------------------------------------- init
  if ($id('panel-qr')) {
    if ('EyeDropper' in window) $id('col-eye').classList.remove('hidden');
    $id('md-in').value = MD_SAMPLE;
    color('#7c3aed');
    unitSetCat('Length');
    regex();
    // Load the libraries and draw the first QR / Markdown preview only when those tools are opened.
    const lazy = { qr: () => { if (!$id('qr-text').value) qrSample(); else qr(); }, md: () => md() };
    const seen = {};
    new MutationObserver(() => Object.keys(lazy).forEach((id) => { if (!seen[id] && !$id('panel-' + id).classList.contains('hidden')) { seen[id] = true; lazy[id](); } }))
      .observe($id('panel-qr').parentElement, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  window.SNTX = { copy, qr, qrDownload, qrSample, imgLoad, imgRun, color, eyedrop, md, mdWrap, mdDownload, mdCopyHtml: () => copy($id('md-out').innerHTML, 'HTML copied'), regex, unit, unitSetCat, unitSwap };
  window.SNT_EXTRA_TOOLS = [
    { id: 'qr', name: 'QR Code Generator', icon: '🔳', desc: 'Make a QR code for any link or text and download it.' },
    { id: 'img', name: 'Image Compressor', icon: '🗜️', desc: 'Shrink images in your browser, nothing is uploaded.' },
    { id: 'color', name: 'Color Picker', icon: '🎨', desc: 'HEX, RGB, HSL, shades and a contrast checker.' },
    { id: 'md', name: 'Markdown Editor', icon: '✍️', desc: 'Write Markdown with a live formatted preview.' },
    { id: 'regex', name: 'Regex Tester', icon: '🧪', desc: 'Test patterns with highlighted matches and groups.' },
    { id: 'unit', name: 'Unit Converter', icon: '📏', desc: 'Length, weight, temperature, data, speed and more.' },
  ];
})();
