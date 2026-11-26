// SmartNTech EMI / Loan Calculator with sliders, a principal-vs-interest chart and a yearly schedule.
(function () {
  const $ = (id) => document.getElementById(id);
  const N = window.SNTNum;
  // Typical ranges and example rates per loan type (users can change everything)
  const TYPES = {
    home: { p: [100000, 20000000, 50000, 3000000], r: 8.5, t: [1, 30, 20] },
    car: { p: [50000, 5000000, 10000, 800000], r: 9.5, t: [1, 8, 5] },
    personal: { p: [10000, 4000000, 5000, 300000], r: 13, t: [1, 7, 3] },
    edu: { p: [10000, 10000000, 10000, 1000000], r: 10.5, t: [1, 15, 7] },
  };
  let type = 'home', unit = 'y';
  const P = $('e-p'), R = $('e-r'), T = $('e-t');

  function setType(t) {
    type = t; const c = TYPES[t];
    P.min = c.p[0]; P.max = c.p[1]; P.step = c.p[2]; P.value = c.p[3];
    $('e-p-min').textContent = N.inr(c.p[0]); $('e-p-max').textContent = N.inr(c.p[1]);
    R.value = c.r; unit = 'y'; [...$('e-unit').children].forEach((x) => x.classList.toggle('on', x.dataset.v === 'y'));
    T.min = c.t[0]; T.max = c.t[1]; T.step = 1; T.value = c.t[2];
    sync(); calc();
  }
  function sync() { $('e-p-n').value = P.value; $('e-r-n').value = R.value; $('e-t-n').value = T.value; }
  [[P, 'e-p-n'], [R, 'e-r-n'], [T, 'e-t-n']].forEach(([range, num]) => {
    range.addEventListener('input', () => { $(num).value = range.value; calc(); });
    $(num).addEventListener('input', () => { const v = parseFloat($(num).value); if (!isNaN(v)) { if (v > +range.max) range.max = v; range.value = v; } calc(); });
  });
  $('e-type').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; [...$('e-type').children].forEach((x) => x.classList.toggle('on', x === b)); setType(b.dataset.v); });
  $('e-unit').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.v === unit) return;
    [...$('e-unit').children].forEach((x) => x.classList.toggle('on', x === b));
    const c = TYPES[type], cur = parseFloat($('e-t-n').value) || 1;
    unit = b.dataset.v;
    if (unit === 'm') { T.min = 6; T.max = c.t[1] * 12; T.value = Math.round(cur * 12); } else { T.min = c.t[0]; T.max = c.t[1]; T.value = Math.max(1, Math.round(cur / 12)); }
    $('e-t-n').value = T.value; calc();
  });

  let rows = [];
  function calc() {
    const p = parseFloat($('e-p-n').value) || 0, yr = parseFloat($('e-r-n').value) || 0;
    const n = Math.max(1, Math.round((parseFloat($('e-t-n').value) || 1) * (unit === 'y' ? 12 : 1)));
    const r = yr / 12 / 100;
    const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n, interest = total - p;
    $('e-emi').textContent = N.inr(Math.round(emi), 0);
    $('e-prin').textContent = N.inr(Math.round(p), 0); $('e-int').textContent = N.inr(Math.round(interest), 0); $('e-tot').textContent = N.inr(Math.round(total), 0);
    const pct = total ? (interest / total) * 100 : 0;
    $('e-pie').style.background = `conic-gradient(#ec4899 0 ${pct}%, #2563eb ${pct}% 100%)`;
    $('e-pct').textContent = pct.toFixed(1) + '%';
    // yearly schedule
    rows = []; let bal = p, y = 0;
    for (let m = 1; m <= n; m++) {
      const int = bal * r, prin = Math.min(bal, emi - int); bal = Math.max(0, bal - prin);
      if ((m - 1) % 12 === 0) rows.push({ year: ++y, prin: 0, int: 0, bal: 0 });
      const row = rows[rows.length - 1]; row.prin += prin; row.int += int; row.bal = bal;
    }
    $('e-sched').innerHTML = rows.map((x) => `<tr class="border-t border-slate-100 dark:border-slate-800"><td class="py-2 font-semibold">Year ${x.year}</td><td class="text-right">${N.inr(Math.round(x.prin), 0)}</td><td class="text-right text-pink-600">${N.inr(Math.round(x.int), 0)}</td><td class="text-right">${N.inr(Math.round(x.prin + x.int), 0)}</td><td class="text-right font-bold">${N.inr(Math.round(x.bal), 0)}</td></tr>`).join('');
  }
  $('e-csv').addEventListener('click', () => {
    const csv = 'Year,Principal paid,Interest paid,Total paid,Balance left\n' + rows.map((x) => [x.year, Math.round(x.prin), Math.round(x.int), Math.round(x.prin + x.int), Math.round(x.bal)].join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'emi-schedule.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  setType('home');
})();
