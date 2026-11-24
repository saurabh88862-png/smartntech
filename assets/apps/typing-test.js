// SmartNTech Typing Speed Test: English and Hindi, 30/60/120 s, live WPM, accuracy and mistakes.
// WPM = (correct characters / 5) / minutes. Best scores are kept in this browser.
(function () {
  const $ = (id) => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
  .tt-seg{display:inline-flex;gap:.25rem;padding:.25rem;border-radius:1rem;background:#fff;border:1px solid #e2e8f0}.dark .tt-seg{background:#0f172a;border-color:#1e293b}
  .tt-seg button{padding:.45rem .9rem;border-radius:.75rem;font-size:.85rem;font-weight:700;color:#475569}.dark .tt-seg button{color:#cbd5e1}
  .tt-seg button.on{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff}
  .tt-stat{padding:.9rem;border-radius:1.1rem;text-align:center;background:#fff;border:1px solid #e2e8f0}.dark .tt-stat{background:#0f172a;border-color:#1e293b}
  .tt-stat div{font-size:1.9rem;font-weight:900;line-height:1.1}.tt-stat span{display:block;margin-top:.2rem;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
  .tt-box{height:9.6rem;overflow:hidden;padding:1.1rem 1.3rem;border-radius:1.5rem;background:#fff;border:2px solid #e2e8f0;cursor:text;font:500 1.45rem/2.4rem 'JetBrains Mono',ui-monospace,monospace;color:#94a3b8;position:relative;outline:none}
  .tt-box.hi{font-family:'Noto Sans Devanagari','Nirmala UI',Mangal,sans-serif;font-size:1.5rem}
  .dark .tt-box{background:#0f172a;border-color:#1e293b;color:#475569}
  .tt-box.focus{border-color:#7c3aed;box-shadow:0 0 0 5px rgba(124,58,237,.14)}
  #tt-text{position:relative;white-space:pre-wrap;word-break:break-word}
  #tt-text .ok{color:#0f172a}.dark #tt-text .ok{color:#f1f5f9}
  #tt-text .bad{color:#e11d48;background:rgba(244,63,94,.12);border-radius:.2rem}
  #tt-text .cur{border-left:2px solid #7c3aed;margin-left:-2px;animation:tt-blink 1s steps(1) infinite}
  @keyframes tt-blink{50%{border-color:transparent}}
  .tt-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;resize:none;cursor:text;font-size:16px}
  .tt-hint{position:absolute;left:50%;bottom:-.9rem;transform:translateX(-50%);width:max-content;max-width:92%;padding:.3rem .8rem;border-radius:999px;background:#7c3aed;color:#fff;font-size:.75rem;font-weight:700;text-align:center;pointer-events:none;transition:opacity .3s}
  .tt-hint.gone{opacity:0}`;
  document.head.prepend(css);

  const WORDS = {
    en: {
      easy: 'the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us life world hand part place case week company system program question number point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name team minute idea kid body information school face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education'.split(' '),
      hard: 'Practice daily, and your speed will grow. JavaScript, Python & SQL are popular languages! Can you type 60 words per minute? Accuracy matters more than speed. The quick brown fox jumps over the lazy dog. Email me at hello@example.com; the meeting is at 10:30 AM. Version 2.5 fixed 14 bugs, improved load time by 40% and added dark mode. "Keep going," she said, "you are almost there." Developers often write code, test it, and deploy it to the cloud.'.split(' '),
    },
    hi: {
      easy: 'मैं तुम हम वह यह और है के की को में से पर एक था थी थे हैं कर रहा रही लिए साथ घर काम दिन रात आज कल समय लोग बात बहुत अच्छा नया पानी खाना स्कूल पढ़ाई किताब दोस्त परिवार माता पिता भाई बहन शहर गांव देश भारत सुबह शाम खुश मेहनत सपना सफल जीवन प्यार सच्चा रास्ता मंजिल सीखना लिखना बोलना सुनना देखना चलना आना जाना देना लेना जानना करना होना पेड़ फूल बारिश धूप हवा आसमान धरती नदी पहाड़ समुद्र खेल मैदान बच्चे बड़े छोटे सवाल जवाब ज्ञान विज्ञान कंप्यूटर मोबाइल इंटरनेट'.split(' '),
      hard: 'रोज़ अभ्यास करने से टाइपिंग की गति बढ़ती है। भारत एक विशाल और विविधताओं से भरा देश है। सही उंगलियों का इस्तेमाल करें और कीबोर्ड की ओर न देखें। मेहनत, धैर्य और लगन से हर लक्ष्य पाया जा सकता है। कंप्यूटर और इंटरनेट ने हमारे काम करने का तरीका बदल दिया है। पहले शुद्धता पर ध्यान दें, गति अपने आप आ जाएगी।'.split(' '),
    },
  };
  const opt = { lang: 'en', time: 60, level: 'easy' };
  let target = '', typed = '', started = 0, timer = null, ended = false, mistakes = 0, prevLen = 0, spans = [];

  function makeText() {
    const pool = WORDS[opt.lang][opt.level];
    if (opt.level === 'hard') { const out = []; while (out.join(' ').length < 1400) out.push(...pool); return out.join(' '); }
    const out = []; let last = '';
    while (out.join(' ').length < 1400) { const w = pool[Math.floor(Math.random() * pool.length)]; if (w !== last) { out.push(w); last = w; } }
    return out.join(' ');
  }
  // Display: one span per user-perceived letter, so Hindi conjuncts/matras render joined (क्ष, कि).
  // Checking: per keystroke (code point), so a half-typed Hindi letter is "in progress", not a mistake.
  const seg = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const chars = (s) => (seg ? [...seg.segment(s)].map((x) => x.segment) : [...s]);
  let tChars = [], tCP = [], gStart = []; // graphemes, code points, code-point start index of each grapheme

  function reset() {
    clearInterval(timer); timer = null; started = 0; ended = false; mistakes = 0; typed = ''; prevLen = 0;
    target = makeText(); tChars = chars(target); tCP = [...target];
    gStart = []; let n = 0; tChars.forEach((g) => { gStart.push(n); n += [...g].length; }); gStart.push(n);
    const box = $('tt-text');
    box.innerHTML = tChars.map((c) => `<span>${c.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))}</span>`).join('');
    spans = [...box.children];
    $('tt-input').value = ''; $('tt-input').disabled = false;
    $('tt-box').classList.toggle('hi', opt.lang === 'hi'); $('tt-box').scrollTop = 0;
    $('tt-hi-note').classList.toggle('hidden', opt.lang !== 'hi');
    $('tt-left').textContent = opt.time; $('tt-wpm').textContent = '0'; $('tt-acc').textContent = '100%'; $('tt-err').textContent = '0';
    $('tt-result').classList.add('hidden'); $('tt-hint').classList.remove('gone');
    if (spans[0]) spans[0].classList.add('cur');
  }
  function stats() {
    const tp = [...typed]; let correct = 0;
    tp.forEach((c, i) => { if (c === tCP[i]) correct++; });
    const mins = started ? Math.max((Date.now() - started) / 60000, 1 / 60) : 1;
    return { wpm: Math.round(correct / 5 / mins), acc: tp.length ? Math.round((correct / tp.length) * 100) : 100, correct, total: tp.length };
  }
  // grapheme index that contains code point index cp
  const gOf = (cp) => { let lo = 0, hi = tChars.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (gStart[m] <= cp) lo = m; else hi = m - 1; } return lo; };
  function paint() {
    const tp = [...typed], L = tp.length;
    const g0 = Math.max(0, gOf(Math.max(0, Math.min(prevLen, L) - 1)) - 1), g1 = Math.min(spans.length - 1, gOf(Math.max(prevLen, L)) + 1);
    for (let g = g0; g <= g1; g++) {
      const a = gStart[g], b = gStart[g + 1], s = spans[g];
      let cls = '';
      if (L >= b) cls = tp.slice(a, b).every((c, j) => c === tCP[a + j]) ? 'ok' : 'bad';
      else if (L > a) cls = tp.slice(a, L).every((c, j) => c === tCP[a + j]) ? 'cur' : 'bad'; // letter half typed
      else if (L === a) cls = 'cur';
      s.className = cls;
    }
    // each newly typed wrong keystroke (not deleting) counts as a mistake
    if (L > prevLen) for (let i = prevLen; i < L; i++) if (tp[i] !== tCP[i]) mistakes++;
    prevLen = L;
    const cur = spans[Math.min(gOf(L), spans.length - 1)];
    if (cur) { const box = $('tt-box'); const lineH = parseFloat(getComputedStyle(box).lineHeight) || 38; box.scrollTop = Math.max(0, cur.offsetTop - lineH); }
    const st = stats();
    $('tt-wpm').textContent = st.wpm; $('tt-acc').textContent = st.acc + '%'; $('tt-err').textContent = mistakes;
    if (L >= tCP.length) finish();
  }
  function tick() {
    const left = Math.max(0, opt.time - Math.floor((Date.now() - started) / 1000));
    $('tt-left').textContent = left;
    $('tt-wpm').textContent = stats().wpm;
    if (left <= 0) finish();
  }
  function finish() {
    if (ended) return; ended = true; clearInterval(timer);
    $('tt-input').disabled = true; $('tt-input').blur();
    const st = stats();
    const key = `snt_typing_best_${opt.lang}_${opt.time}`;
    let best = 0; try { best = +localStorage.getItem(key) || 0; } catch { /* private mode */ }
    const isBest = st.wpm > best;
    if (isBest) try { localStorage.setItem(key, st.wpm); } catch { /* ignore */ }
    $('tt-r-wpm').textContent = st.wpm;
    $('tt-r-line').textContent = `Accuracy ${st.acc}% · ${st.correct} correct characters · ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'} · ${opt.lang === 'hi' ? 'Hindi' : 'English'}, ${opt.time}s`;
    $('tt-r-badge').textContent = st.wpm >= 70 ? '🏆 Excellent' : st.wpm >= 50 ? '🚀 Very good' : st.wpm >= 35 ? '👍 Good' : st.wpm >= 20 ? '🙂 Keep practising' : '🌱 Beginner';
    $('tt-r-best').textContent = isBest ? '🎉 New personal best!' : `Your best: ${best} WPM`;
    $('tt-result').classList.remove('hidden');
    $('tt-result').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const input = $('tt-input');
  input.addEventListener('input', () => {
    if (ended) return;
    if (!started) { started = Date.now(); timer = setInterval(tick, 250); $('tt-hint').classList.add('gone'); }
    typed = input.value.replace(/\n/g, ' ');
    paint();
  });
  input.addEventListener('focus', () => $('tt-box').classList.add('focus'));
  input.addEventListener('blur', () => $('tt-box').classList.remove('focus'));
  input.addEventListener('paste', (e) => e.preventDefault()); // no cheating
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { reset(); input.focus(); } });
  $('tt-restart').addEventListener('click', () => { reset(); input.focus(); });
  [['tt-lang', 'lang'], ['tt-time', 'time'], ['tt-level', 'level']].forEach(([id, k]) => {
    $(id).addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      opt[k] = k === 'time' ? +b.dataset.v : b.dataset.v;
      [...$(id).children].forEach((x) => x.classList.toggle('on', x === b));
      reset(); input.focus();
    });
  });
  reset();
})();
