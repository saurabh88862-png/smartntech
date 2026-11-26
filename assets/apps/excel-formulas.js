// SmartNTech Excel Formula Helper: formula builder + searchable formula guide with simple Hindi examples.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------- formula guide
  // [name, category, syntax, Hindi meaning, example table rows (first row = header), formula, result, tip]
  const F = [
    ['VLOOKUP', 'Lookup', 'VLOOKUP(lookup_value, table, col_index, FALSE)', 'किसी list में एक value ढूँढकर उसी row से दूसरे column की value लाता है। जैसे employee ID से उसका नाम या salary।',
      [['A: ID', 'B: Name', 'C: Salary'], ['101', 'Ravi', '25000'], ['102', 'Priya', '32000']], '=VLOOKUP(102, A2:C3, 3, FALSE)', '32000', 'आख़िरी argument FALSE रखें ताकि exact match मिले। ढूँढा जाने वाला column हमेशा table का पहला column होना चाहिए।'],
    ['XLOOKUP', 'Lookup', 'XLOOKUP(lookup_value, lookup_range, return_range, "Not found")', 'VLOOKUP का नया और आसान रूप। किसी भी column में ढूँढ सकता है, बाएँ तरफ़ भी, और न मिलने पर अपना message दिखाता है।',
      [['A: Name', 'B: City'], ['Ravi', 'Delhi'], ['Priya', 'Pune']], '=XLOOKUP("Priya", A2:A3, B2:B3, "Not found")', 'Pune', 'Excel 2021 / Microsoft 365 और Google Sheets में चलता है। पुराने Excel में INDEX + MATCH इस्तेमाल करें।'],
    ['INDEX + MATCH', 'Lookup', 'INDEX(return_range, MATCH(lookup_value, lookup_range, 0))', 'MATCH बताता है value कौन-सी position पर है, INDEX उस position की value लाता है। VLOOKUP की तरह, पर किसी भी दिशा में काम करता है।',
      [['A: Code', 'B: Product'], ['P1', 'Pen'], ['P2', 'Notebook']], '=INDEX(B2:B3, MATCH("P2", A2:A3, 0))', 'Notebook', 'MATCH में आख़िरी argument 0 का मतलब exact match।'],
    ['IF', 'Logic', 'IF(condition, value_if_true, value_if_false)', 'शर्त सही हो तो एक जवाब, गलत हो तो दूसरा। जैसे marks 33 या ज़्यादा हैं तो "Pass", वरना "Fail"।',
      [['A: Student', 'B: Marks'], ['Aman', '72'], ['Neha', '28']], '=IF(B3>=33, "Pass", "Fail")', 'Fail', 'Text हमेशा " " के अंदर लिखें। Numbers के लिए quotes नहीं लगते।'],
    ['IFS', 'Logic', 'IFS(cond1, result1, cond2, result2, ..., TRUE, default)', 'कई शर्तें एक साथ। जैसे marks के हिसाब से grade: 90+ A, 75+ B, 50+ C, बाकी D।',
      [['B: Marks'], ['82']], '=IFS(B2>=90,"A", B2>=75,"B", B2>=50,"C", TRUE,"D")', 'B', 'शर्तें बड़े से छोटे क्रम में लिखें। आख़िर में TRUE "बाकी सब" के लिए है।'],
    ['AND / OR', 'Logic', 'IF(AND(cond1, cond2), yes, no)', 'AND: सारी शर्तें सही हों तो TRUE। OR: कोई एक भी सही हो तो TRUE। जैसे attendance 75%+ और marks 33+ हों तभी eligible।',
      [['B: Attendance', 'C: Marks'], ['80', '45']], '=IF(AND(B2>=75, C2>=33), "Eligible", "Not eligible")', 'Eligible', 'OR के लिए AND की जगह OR लिखें।'],
    ['IFERROR', 'Logic', 'IFERROR(formula, value_if_error)', 'Formula में error (#N/A, #DIV/0!) आए तो उसकी जगह अपना साफ़ message या 0 दिखाता है।',
      [['A: ID'], ['999']], '=IFERROR(VLOOKUP(A2, D2:E50, 2, FALSE), "Not found")', 'Not found', 'Report को साफ़ दिखाने के लिए VLOOKUP के चारों तरफ़ IFERROR लगाना आम तरीका है।'],
    ['SUM', 'Math', 'SUM(range)', 'Numbers का total जोड़ता है। जैसे पूरे महीने की बिक्री का कुल।',
      [['B: Sale'], ['1200'], ['800'], ['1500']], '=SUM(B2:B4)', '3500', 'Shortcut: Alt + = दबाने पर Excel अपने-आप SUM लगा देता है।'],
    ['SUMIF', 'Math', 'SUMIF(range, criteria, sum_range)', 'एक शर्त वाली rows का ही total। जैसे सिर्फ़ "Delhi" की बिक्री जोड़ना।',
      [['A: City', 'B: Sale'], ['Delhi', '500'], ['Mumbai', '300'], ['Delhi', '200']], '=SUMIF(A2:A4, "Delhi", B2:B4)', '700', 'Criteria में ">1000" जैसे शर्तें भी लिख सकते हैं।'],
    ['SUMIFS', 'Math', 'SUMIFS(sum_range, range1, criteria1, range2, criteria2)', 'कई शर्तों के साथ total। जैसे Delhi की और सिर्फ़ January की बिक्री।',
      [['A: City', 'B: Month', 'C: Sale'], ['Delhi', 'Jan', '500'], ['Delhi', 'Feb', '400'], ['Pune', 'Jan', '300']], '=SUMIFS(C2:C4, A2:A4, "Delhi", B2:B4, "Jan")', '500', 'SUMIFS में sum_range सबसे पहले आता है (SUMIF से उल्टा)।'],
    ['COUNTIF', 'Math', 'COUNTIF(range, criteria)', 'गिनता है कि कितनी cells शर्त पूरी करती हैं। जैसे कितने students "Pass" हुए।',
      [['A: Result'], ['Pass'], ['Fail'], ['Pass']], '=COUNTIF(A2:A4, "Pass")', '2', 'खाली cells गिनने के लिए COUNTBLANK, भरी cells के लिए COUNTA।'],
    ['AVERAGEIF', 'Math', 'AVERAGEIF(range, criteria, average_range)', 'शर्त वाली rows का average। जैसे सिर्फ़ Sales team की औसत salary।',
      [['A: Team', 'B: Salary'], ['Sales', '30000'], ['HR', '28000'], ['Sales', '34000']], '=AVERAGEIF(A2:A4, "Sales", B2:B4)', '32000', 'सिर्फ़ average के लिए AVERAGE(range)।'],
    ['ROUND', 'Math', 'ROUND(number, digits)', 'Number को दशमलव के बाद तय digits तक round करता है। जैसे GST amount को 2 decimal तक।',
      [['A: Amount'], ['1234.5678']], '=ROUND(A2, 2)', '1234.57', 'ROUNDUP हमेशा ऊपर, ROUNDDOWN हमेशा नीचे round करता है।'],
    ['CONCAT / TEXTJOIN', 'Text', 'TEXTJOIN(" ", TRUE, A2, B2)', 'कई cells का text जोड़कर एक बनाता है। जैसे First name और Last name से पूरा नाम।',
      [['A: First', 'B: Last'], ['Lakshmi', 'Ray']], '=TEXTJOIN(" ", TRUE, A2, B2)', 'Lakshmi Ray', 'आसान तरीका: =A2&" "&B2'],
    ['LEFT / RIGHT / MID', 'Text', 'LEFT(text, n) · RIGHT(text, n) · MID(text, start, n)', 'Text में से शुरू, आख़िर या बीच के अक्षर निकालता है। जैसे PAN या mobile number का हिस्सा।',
      [['A: Code'], ['INV-2026-0042']], '=RIGHT(A2, 4)', '0042', 'MID(A2, 5, 4) से "2026" मिलेगा।'],
    ['TRIM / UPPER / PROPER', 'Text', 'TRIM(text) · UPPER(text) · PROPER(text)', 'TRIM फ़ालतू spaces हटाता है (VLOOKUP के #N/A की आम वजह)। UPPER सब बड़े अक्षर, PROPER हर शब्द का पहला अक्षर बड़ा।',
      [['A: Name'], ['  ravi   kumar ']], '=PROPER(TRIM(A2))', 'Ravi Kumar', 'Data import के बाद TRIM ज़रूर चलाएँ।'],
    ['TODAY / DATEDIF', 'Date', 'TODAY() · DATEDIF(start, end, "Y")', 'TODAY आज की तारीख़ देता है। DATEDIF दो तारीख़ों के बीच साल ("Y"), महीने ("M") या दिन ("D") बताता है। जैसे उम्र या नौकरी के साल।',
      [['A: Joining date'], ['01-04-2020']], '=DATEDIF(A2, TODAY(), "Y")', '6 (साल)', 'Date cell का format "Date" होना चाहिए, text नहीं।'],
    ['EOMONTH / NETWORKDAYS', 'Date', 'EOMONTH(date, 0) · NETWORKDAYS(start, end)', 'EOMONTH महीने की आख़िरी तारीख़ देता है। NETWORKDAYS दो तारीख़ों के बीच working days (शनिवार-रविवार छोड़कर) गिनता है।',
      [['A: Start', 'B: End'], ['01-11-2026', '30-11-2026']], '=NETWORKDAYS(A2, B2)', '21', 'छुट्टियों की list तीसरे argument में दे सकते हैं।'],
    ['UNIQUE / FILTER', 'Lookup', 'UNIQUE(range) · FILTER(range, condition)', 'UNIQUE duplicate हटाकर अलग-अलग values की list देता है। FILTER शर्त के हिसाब से rows छाँटता है।',
      [['A: City'], ['Delhi'], ['Pune'], ['Delhi']], '=UNIQUE(A2:A4)', 'Delhi, Pune', 'Microsoft 365 / Excel 2021 और Google Sheets में चलता है।'],
  ];
  const CATS = ['All', 'Lookup', 'Logic', 'Math', 'Text', 'Date'];
  let cat = 'All';
  $('xf-cats').innerHTML = CATS.map((c) => `<button class="calc-chip ${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
  function list() {
    const q = $('xf-q').value.toLowerCase().trim();
    const items = F.filter(([n, c, s, h]) => (cat === 'All' || c === cat) && (!q || (n + ' ' + s + ' ' + h + ' ' + c).toLowerCase().includes(q)));
    $('xf-none').classList.toggle('hidden', items.length > 0);
    $('xf-list').innerHTML = items.map(([n, c, s, h, rows, f, r, tip]) => `
      <article class="calc-card">
        <div class="flex items-start justify-between gap-2"><h3 class="text-lg font-black text-slate-900 dark:text-white">${esc(n)}</h3><span class="calc-chip !py-1 !text-xs">${c}</span></div>
        <code class="block mt-2 text-xs font-mono text-violet-600 dark:text-violet-300 break-all">${esc(s)}</code>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${esc(h)}</p>
        <div class="mt-3 overflow-x-auto"><table class="text-xs font-mono border-collapse"><tbody>${rows.map((row, i) => `<tr>${row.map((cell) => `<td class="border border-slate-200 dark:border-slate-700 px-2 py-1 ${i === 0 ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="mt-3 flex flex-wrap items-center gap-2"><code class="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs break-all">${esc(f)}</code><button class="btn-blue" data-copy="${esc(f)}">Copy</button></div>
        <p class="mt-2 text-sm"><b class="text-slate-900 dark:text-white">Result:</b> <span class="font-bold text-emerald-600">${esc(r)}</span></p>
        <p class="mt-2 text-xs text-slate-500">💡 ${esc(tip)}</p>
      </article>`).join('');
  }
  $('xf-q').addEventListener('input', list);
  $('xf-cats').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; [...$('xf-cats').children].forEach((x) => x.classList.toggle('on', x === b)); list(); });

  // ---------------------------------------------------------------- builder
  const q = (v) => (v === '' ? '""' : /^-?\d+(\.\d+)?$/.test(v) || /^[A-Z]{1,3}\$?\d+$/i.test(v) || /^[<>=]/.test(v) && false ? v : `"${v.replace(/"/g, '""')}"`);
  const cellOrText = (v) => (/^\$?[A-Z]{1,3}\$?\d+$/i.test(v.trim()) || /^-?\d+(\.\d+)?$/.test(v.trim()) ? v.trim() : q(v));
  const B = {
    vlookup: { f: [['look', 'क्या ढूँढना है (value या cell)', 'A2'], ['table', 'Table range', '$E$2:$G$100'], ['col', 'कौन-सा column लाना है (number)', '3'], ['nf', 'न मिले तो क्या दिखाएँ (optional)', 'Not found']],
      build: (v) => { const core = `VLOOKUP(${cellOrText(v.look)}, ${v.table || 'E2:G100'}, ${parseInt(v.col, 10) || 2}, FALSE)`; return v.nf ? `=IFERROR(${core}, ${q(v.nf)})` : `=${core}`; },
      explain: (v) => `${v.look || 'value'} को ${v.table || 'table'} के पहले column में ढूँढेगा और उसी row का column ${v.col || 2} लाएगा।${v.nf ? ` न मिलने पर "${v.nf}" दिखाएगा।` : ''}` },
    if: { f: [['cell', 'कौन-सी cell चेक करनी है', 'B2'], ['op', 'शर्त (>=, >, =, <, <>)', '>='], ['val', 'किससे compare करें', '33'], ['yes', 'सही हो तो', 'Pass'], ['no', 'गलत हो तो', 'Fail']],
      build: (v) => `=IF(${v.cell || 'B2'}${v.op || '>='}${cellOrText(v.val || '0')}, ${q(v.yes)}, ${q(v.no)})`,
      explain: (v) => `अगर ${v.cell || 'B2'} ${v.op || '>='} ${v.val || 0} है तो "${v.yes}", वरना "${v.no}"।` },
    sumif: { f: [['range', 'शर्त वाला column', 'A2:A100'], ['crit', 'शर्त (जैसे Delhi या >1000)', 'Delhi'], ['sum', 'जोड़ने वाला column', 'B2:B100']],
      build: (v) => `=SUMIF(${v.range || 'A2:A100'}, ${/^[<>=]/.test(v.crit) ? `"${v.crit}"` : cellOrText(v.crit)}, ${v.sum || 'B2:B100'})`,
      explain: (v) => `${v.range || 'A2:A100'} में जहाँ "${v.crit}" है, उन rows का ${v.sum || 'B2:B100'} जोड़ेगा।` },
    countif: { f: [['range', 'कौन-सा range गिनना है', 'A2:A100'], ['crit', 'शर्त (जैसे Pass या >=33)', 'Pass']],
      build: (v) => `=COUNTIF(${v.range || 'A2:A100'}, ${/^[<>=]/.test(v.crit) ? `"${v.crit}"` : cellOrText(v.crit)})`,
      explain: (v) => `${v.range || 'A2:A100'} में कितनी cells "${v.crit}" हैं, यह गिनेगा।` },
  };
  let bt = 'vlookup';
  function renderBuilder() {
    $('xb-fields').innerHTML = B[bt].f.map(([k, label, def]) => `<label class="calc-l normal-case">${label}<input data-k="${k}" value="${esc(def)}" class="field mt-1 font-mono" /></label>`).join('');
    build();
  }
  function build() {
    const v = {}; $('xb-fields').querySelectorAll('[data-k]').forEach((i) => { v[i.dataset.k] = i.value; });
    $('xb-out').textContent = B[bt].build(v);
    $('xb-explain').textContent = '👉 ' + B[bt].explain(v);
  }
  $('xb-fields').addEventListener('input', build);
  $('xb-type').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; bt = b.dataset.v; [...$('xb-type').children].forEach((x) => x.classList.toggle('on', x === b)); renderBuilder(); });
  async function copyText(t, btn, label) {
    try { await navigator.clipboard.writeText(t); const o = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = label || o; }, 1400); } catch { prompt('Copy this formula:', t); }
  }
  $('xb-copy').addEventListener('click', () => copyText($('xb-out').textContent, $('xb-copy'), '📋 Copy formula'));
  document.addEventListener('click', (e) => { const c = e.target.closest('[data-copy]'); if (c) copyText(c.dataset.copy, c, 'Copy'); });
  renderBuilder(); list();
})();
