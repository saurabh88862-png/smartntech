// SmartNTech Translator: English ↔ Hindi and 20+ languages via the free MyMemory API (CORS-enabled).
// Long text is split into sentence chunks (the API takes up to ~500 characters per request).
(function () {
  const $ = (id) => document.getElementById(id);
  const API = 'https://api.mymemory.translated.net/get';
  // [code for API, name, speech/recognition locale]
  const LANGS = [
    ['en', 'English', 'en-IN'], ['hi', 'हिंदी Hindi', 'hi-IN'], ['bn', 'বাংলা Bengali', 'bn-IN'], ['mr', 'मराठी Marathi', 'mr-IN'],
    ['gu', 'ગુજરાતી Gujarati', 'gu-IN'], ['pa', 'ਪੰਜਾਬੀ Punjabi', 'pa-IN'], ['ta', 'தமிழ் Tamil', 'ta-IN'], ['te', 'తెలుగు Telugu', 'te-IN'],
    ['kn', 'ಕನ್ನಡ Kannada', 'kn-IN'], ['ml', 'മലയാളം Malayalam', 'ml-IN'], ['or', 'ଓଡ଼ିଆ Odia', 'or-IN'], ['ur', 'اردو Urdu', 'ur-IN'],
    ['ne', 'नेपाली Nepali', 'ne-NP'], ['es', 'Español Spanish', 'es-ES'], ['fr', 'Français French', 'fr-FR'], ['de', 'Deutsch German', 'de-DE'],
    ['ar', 'العربية Arabic', 'ar-SA'], ['zh-CN', '中文 Chinese', 'zh-CN'], ['ja', '日本語 Japanese', 'ja-JP'], ['ko', '한국어 Korean', 'ko-KR'],
    ['ru', 'Русский Russian', 'ru-RU'], ['pt', 'Português Portuguese', 'pt-PT'], ['it', 'Italiano Italian', 'it-IT'],
  ];
  const locale = (code) => (LANGS.find((l) => l[0] === code) || [])[2] || code;
  const PHRASES = ['Good morning, how are you?', 'Thank you very much for your help.', 'What is your name?', 'Where is the nearest railway station?', 'Please send me the invoice today.', 'I will join the meeting at 10 AM.', 'How much does this cost?', 'Happy birthday! Have a wonderful year.'];
  const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };

  const css = document.createElement('style');
  css.textContent = `.tr-ic{width:2.1rem;height:2.1rem;border-radius:.7rem;display:grid;place-items:center;font-size:1rem;background:#fff;border:1px solid #e2e8f0}.dark .tr-ic{background:#1e293b;border-color:#334155}
  .tr-ic:hover{border-color:#7c3aed}.tr-ic.rec{background:#fee2e2;border-color:#ef4444;animation:tr-pulse 1s infinite}@keyframes tr-pulse{50%{box-shadow:0 0 0 6px rgba(239,68,68,.25)}}
  .tr-h{padding:.55rem .7rem;border-radius:.75rem;background:#f8fafc;border:1px solid #e2e8f0;cursor:pointer}.dark .tr-h{background:#020617;border-color:#1e293b}.tr-h:hover{border-color:#7c3aed}`;
  document.head.prepend(css);

  const opts = LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join('');
  $('tr-from').innerHTML = opts; $('tr-to').innerHTML = opts;
  const saved = LS.get('snt_tr_pair', ['en', 'hi']);
  $('tr-from').value = saved[0]; $('tr-to').value = saved[1];
  $('tr-phrases').innerHTML = PHRASES.map((p) => `<button class="calc-chip !text-left" data-p="${p}">${p}</button>`).join('');

  const escH = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function chunks(text) {
    const parts = text.match(/[^.!?।\n]+[.!?।]*\s*|\n+/g) || [text];
    const out = []; let cur = '';
    for (const p of parts) {
      if ((cur + p).length > 450 && cur) { out.push(cur); cur = ''; }
      if (p.length > 450) { for (let i = 0; i < p.length; i += 450) out.push(p.slice(i, i + 450)); } else cur += p;
    }
    if (cur) out.push(cur);
    return out;
  }
  let seq = 0, lastOut = '';
  async function translate() {
    const text = $('tr-in').value.trim(), from = $('tr-from').value, to = $('tr-to').value;
    LS.set('snt_tr_pair', [from, to]);
    if (!text) { $('tr-out').innerHTML = '<span class="text-slate-400">Translation appears here</span>'; $('tr-status').textContent = ''; lastOut = ''; return; }
    if (from === to) { $('tr-out').textContent = text; lastOut = text; $('tr-status').textContent = 'Same language'; return; }
    const my = ++seq;
    $('tr-status').textContent = 'Translating…';
    try {
      const pieces = chunks(text), res = [];
      for (const piece of pieces) {
        if (!piece.trim()) { res.push(piece); continue; }
        const r = await fetch(`${API}?q=${encodeURIComponent(piece.trim())}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`);
        if (r.status === 429) throw new Error('limit');
        const d = await r.json();
        const t = d && d.responseData && d.responseData.translatedText || '';
        if (d.quotaFinished || /MYMEMORY WARNING|YOU USED ALL AVAILABLE/i.test(t)) throw new Error('limit');
        if (+d.responseStatus !== 200) throw new Error(d.responseDetails || 'error');
        res.push(t + (/\s$/.test(piece) ? ' ' : ''));
        if (my !== seq) return; // a newer request started
      }
      lastOut = res.join('').trim();
      $('tr-out').textContent = lastOut;
      $('tr-status').textContent = `✓ ${LANGS.find((l) => l[0] === to)[1].split(' ').pop()}`;
      addHistory(text, lastOut, from, to);
    } catch (e) {
      if (my !== seq) return;
      $('tr-status').textContent = '';
      $('tr-out').innerHTML = `<span class="text-rose-500 font-semibold">${e.message === 'limit' ? 'The free daily translation limit is reached on this internet connection. Please try again tomorrow.' : !navigator.onLine ? 'You are offline. Connect to the internet to translate.' : 'Could not translate right now. Please try again in a moment.'}</span>`;
    }
  }
  function addHistory(src, out, from, to) {
    const h = LS.get('snt_tr_hist', []).filter((x) => !(x.s === src && x.to === to));
    h.unshift({ s: src.slice(0, 300), o: out.slice(0, 300), from, to });
    LS.set('snt_tr_hist', h.slice(0, 10)); paintHistory();
  }
  function paintHistory() {
    const h = LS.get('snt_tr_hist', []);
    $('tr-hist').innerHTML = h.length ? h.map((x, i) => `<div class="tr-h" data-h="${i}"><div class="text-xs text-slate-400">${x.from} → ${x.to}</div><div class="font-semibold text-slate-900 dark:text-white truncate">${escH(x.s)}</div><div class="truncate">${escH(x.o)}</div></div>`).join('') : '<p class="text-slate-400">Your last 10 translations appear here (saved only in this browser).</p>';
  }

  // ---- events
  let timer;
  $('tr-in').addEventListener('input', () => {
    $('tr-count').textContent = `${$('tr-in').value.length} / 3000`;
    if ($('tr-auto').checked) { clearTimeout(timer); timer = setTimeout(translate, 900); }
  });
  $('tr-in').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); translate(); } });
  $('tr-go').addEventListener('click', translate);
  $('tr-from').addEventListener('change', translate); $('tr-to').addEventListener('change', translate);
  $('tr-swap').addEventListener('click', () => {
    const f = $('tr-from').value; $('tr-from').value = $('tr-to').value; $('tr-to').value = f;
    if (lastOut) { $('tr-in').value = lastOut; $('tr-count').textContent = `${lastOut.length} / 3000`; }
    translate();
  });
  $('tr-clear').addEventListener('click', () => { $('tr-in').value = ''; $('tr-count').textContent = '0 / 3000'; translate(); $('tr-in').focus(); });
  $('tr-copy').addEventListener('click', async () => { if (!lastOut) return; try { await navigator.clipboard.writeText(lastOut); $('tr-status').textContent = '✓ Copied'; } catch { prompt('Copy:', lastOut); } });
  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]'); if (p) { $('tr-in').value = p.dataset.p; $('tr-count').textContent = `${p.dataset.p.length} / 3000`; translate(); return; }
    const h = e.target.closest('[data-h]'); if (h) { const x = LS.get('snt_tr_hist', [])[+h.dataset.h]; if (x) { $('tr-from').value = x.from; $('tr-to').value = x.to; $('tr-in').value = x.s; $('tr-out').textContent = x.o; lastOut = x.o; } }
  });
  $('tr-hist-clear').addEventListener('click', () => { LS.set('snt_tr_hist', []); paintHistory(); });

  // ---- speech: listen (text-to-speech) and voice input
  function say(text, code) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = locale(code);
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(locale(code).slice(0, 2).toLowerCase()));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  $('tr-say-in').addEventListener('click', () => say($('tr-in').value, $('tr-from').value));
  $('tr-say-out').addEventListener('click', () => say(lastOut, $('tr-to').value));
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) $('tr-mic').classList.add('hidden');
  else {
    let rec = null;
    $('tr-mic').addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = locale($('tr-from').value); rec.interimResults = true;
      const base = $('tr-in').value ? $('tr-in').value.trim() + ' ' : '';
      rec.onresult = (ev) => { const t = [...ev.results].map((r) => r[0].transcript).join(''); $('tr-in').value = base + t; $('tr-count').textContent = `${$('tr-in').value.length} / 3000`; };
      rec.onend = () => { $('tr-mic').classList.remove('rec'); rec = null; translate(); };
      rec.onerror = () => { $('tr-mic').classList.remove('rec'); };
      $('tr-mic').classList.add('rec'); rec.start();
    });
  }
  paintHistory();
})();
