// SmartNTech Number to Words: Indian (lakh/crore) English, cheque format with paise, Hindi words, and international.
(function () {
  const $ = (id) => document.getElementById(id);
  const N = window.SNTNum;
  // Hindi words for 0–99 (each is unique in Hindi, so they are listed in full)
  const HI = ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
    'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस', 'तीस',
    'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस', 'चालीस',
    'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास', 'पचास',
    'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ', 'साठ',
    'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर', 'सत्तर',
    'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्यासी', 'अस्सी',
    'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी', 'नब्बे',
    'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'];
  function hindi(n) {
    n = Math.floor(n);
    if (n < 100) return HI[n];
    const parts = [];
    const units = [[1e9, 'अरब'], [1e7, 'करोड़'], [1e5, 'लाख'], [1e3, 'हज़ार'], [100, 'सौ']];
    for (const [v, name] of units) {
      if (n >= v) { const q = Math.floor(n / v); parts.push((q < 100 ? HI[q] : hindi(q)) + ' ' + name); n %= v; }
    }
    if (n) parts.push(HI[n]);
    return parts.join(' ');
  }
  let mode = 'title';
  const applyCase = (s) => (mode === 'upper' ? s.toUpperCase() : mode === 'lower' ? s.toLowerCase() : s);
  const box = (title, text, sub, cls = '') => `<div class="calc-card ${cls}"><div class="flex items-start justify-between gap-3"><div class="calc-l">${title}</div><button class="btn-blue shrink-0" data-copy="${encodeURIComponent(text)}">📋 Copy</button></div><div class="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">${text}</div>${sub ? `<div class="mt-1 text-xs text-slate-500">${sub}</div>` : ''}</div>`;

  function run() {
    const raw = $('nw-in').value.replace(/[,\s₹]/g, '');
    const err = $('nw-err');
    if (!raw) { $('nw-out').innerHTML = ''; err.classList.add('hidden'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) { err.textContent = 'Please type a valid number, like 125000 or 125000.50 (up to 2 decimals).'; err.classList.remove('hidden'); $('nw-out').innerHTML = ''; return; }
    const num = parseFloat(raw);
    if (num >= 1e15) { err.textContent = 'That number is too big. Please use less than 1,00,00,00,00,00,000.'; err.classList.remove('hidden'); $('nw-out').innerHTML = ''; return; }
    err.classList.add('hidden');
    const r = Math.floor(num), p = Math.round((num - r) * 100);
    const ind = N.wordsIN(r) + (p ? ' Point ' + String(raw.split('.')[1]).split('').map((d) => N.wordsIN(+d)).join(' ') : '');
    const hiWords = hindi(r) + (p ? ' रुपये ' + hindi(p) + ' पैसे' : '');
    const hiCheque = 'रुपये ' + hindi(r) + (p ? ' और ' + hindi(p) + ' पैसे' : '') + ' मात्र';
    $('nw-out').innerHTML = [
      box('💵 Cheque / invoice format', applyCase(N.rupeesWords(num)), 'Write this on cheques and invoices.', 'ring-2 ring-violet-400/60'),
      box('🇮🇳 Indian system (lakh, crore)', applyCase(ind), `Written as ${r.toLocaleString('en-IN')}${p ? '.' + String(p).padStart(2, '0') : ''}`),
      box('🕉️ हिंदी में', hiCheque, hiWords),
      box('🌍 International system (million, billion)', applyCase(N.wordsINTL(r) + (p ? ' and ' + N.wordsINTL(p) + ' Cents' : '')), `Written as ${r.toLocaleString('en-US')}${p ? '.' + String(p).padStart(2, '0') : ''}`),
    ].join('');
  }
  $('nw-in').addEventListener('input', run);
  document.addEventListener('click', async (e) => {
    const q = e.target.closest('[data-q]'); if (q) { $('nw-in').value = q.dataset.q; run(); return; }
    const c = e.target.closest('[data-copy]');
    if (c) { try { await navigator.clipboard.writeText(decodeURIComponent(c.dataset.copy)); c.textContent = '✓ Copied'; setTimeout(() => { c.textContent = '📋 Copy'; }, 1400); } catch { alert(decodeURIComponent(c.dataset.copy)); } }
  });
  $('nw-case').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.v; [...$('nw-case').children].forEach((x) => x.classList.toggle('on', x === b)); run(); });
  run();
})();
