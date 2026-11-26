// SmartNTech Salary / In-hand Calculator (India).
// ▶ UPDATE EVERY YEAR AFTER THE BUDGET: only the TAX object below needs changing.
(function () {
  const TAX = {
    label: 'FY 2025-26 (AY 2026-27) rules from Budget 2025',
    new: { std: 75000, slabs: [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [Infinity, 30]], rebateUpTo: 1200000, surchargeCap: 25 },
    old: { std: 50000, slabs: [[250000, 0], [500000, 5], [1000000, 20], [Infinity, 30]], rebateUpTo: 500000, surchargeCap: 37 },
    surcharge: [[50000000, 37], [20000000, 25], [10000000, 15], [5000000, 10]], // income above → %
    cess: 4,
  };
  const $ = (id) => document.getElementById(id);
  const N = window.SNTNum;
  const money = (n) => N.inr(Math.round(n), 0);
  let regime = 'new';

  function slabTax(income, slabs) {
    let tax = 0, prev = 0;
    for (const [upto, rate] of slabs) { if (income > prev) tax += (Math.min(income, upto) - prev) * rate / 100; prev = upto; }
    return tax;
  }
  function incomeTax(taxable, R) {
    let tax = slabTax(taxable, R.slabs);
    if (taxable <= R.rebateUpTo) tax = 0; // Section 87A rebate
    else if (R === TAX.new) tax = Math.min(tax, taxable - R.rebateUpTo); // marginal relief just above the rebate limit
    let sc = 0;
    for (const [above, rate] of TAX.surcharge) if (taxable > above) { sc = Math.min(rate, R.surchargeCap); break; }
    const withSc = tax * (1 + sc / 100);
    return withSc * (1 + TAX.cess / 100);
  }
  function calc() {
    const ctc = Math.max(0, parseFloat($('s-ctc').value) || 0);
    const basicPct = +$('s-basic').value; $('s-basic-v').textContent = basicPct + '%';
    const basic = ctc * basicPct / 100;
    const pfBase = $('s-pfcap').checked ? Math.min(basic, 15000 * 12) : basic;
    const empPF = $('s-pf').checked ? pfBase * 0.12 : 0;   // employer share (inside CTC)
    const grat = $('s-grat').checked ? basic * 0.0481 : 0;
    const gross = Math.max(0, ctc - empPF - grat);
    const yourPF = pfBase * 0.12;                             // employee share (cut from salary)
    const pt = $('s-pt').checked ? 2400 : 0;
    const d80c = Math.min(150000, (parseFloat($('s-80c').value) || 0) + yourPF);
    const oldDed = d80c + (parseFloat($('s-80d').value) || 0) + (parseFloat($('s-hra').value) || 0) + (parseFloat($('s-oth').value) || 0);
    const taxableNew = Math.max(0, gross - TAX.new.std);
    const taxableOld = Math.max(0, gross - TAX.old.std - pt - oldDed);
    const taxNew = incomeTax(taxableNew, TAX.new), taxOld = incomeTax(taxableOld, TAX.old);
    const tax = regime === 'new' ? taxNew : taxOld;
    const inhand = Math.max(0, gross - yourPF - pt - tax);
    const inNew = gross - yourPF - pt - taxNew, inOld = gross - yourPF - pt - taxOld;

    $('s-inhand').textContent = money(inhand / 12);
    $('s-inhand-y').textContent = `${money(inhand)} per year · ${regime === 'new' ? 'New' : 'Old'} tax regime`;
    const diff = Math.abs(inNew - inOld);
    $('s-best').textContent = diff < 1 ? 'Both regimes give the same in-hand salary.' : `✅ ${inNew > inOld ? 'New' : 'Old'} regime is better for you: ${money(diff / 12)} more per month (${money(diff)} a year).`;
    const rows = [
      ['CTC', ctc],
      ['− Employer PF (in CTC)', -empPF],
      ['− Gratuity (in CTC)', -grat],
      ['Gross salary', gross, 'b'],
      ['− Your PF (12% of basic)', -yourPF],
      ['− Professional tax', -pt],
      [`− Income tax (${regime} regime)`, -tax],
      ['In-hand salary', inhand, 'total'],
    ];
    $('s-break').innerHTML = rows.map(([k, v, c]) => `<tr class="${c === 'total' ? 'total' : ''}"><td class="${c ? 'font-bold' : ''}">${k}</td><td class="text-right">${money(Math.abs(v) / 12)}</td><td>${money(Math.abs(v))}</td></tr>`).join('')
      + `<tr><td class="text-xs text-slate-500" colspan="3">Taxable income: ${money(regime === 'new' ? taxableNew : taxableOld)} · Tax under new regime ${money(taxNew)}, old regime ${money(taxOld)}</td></tr>`;
    $('s-rules').innerHTML = `<b>Tax rules used:</b> ${TAX.label}. New regime: standard deduction ₹75,000, no tax up to ₹12 lakh taxable income (87A rebate). Old regime: standard deduction ₹50,000, no tax up to ₹5 lakh.`;
  }
  document.querySelectorAll('[data-ctc]').forEach((b) => b.addEventListener('click', () => { $('s-ctc').value = b.dataset.ctc; calc(); }));
  ['s-ctc', 's-basic', 's-pf', 's-pfcap', 's-grat', 's-pt', 's-80c', 's-80d', 's-hra', 's-oth'].forEach((id) => $(id).addEventListener('input', calc));
  $('s-regime').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; regime = b.dataset.v; [...$('s-regime').children].forEach((x) => x.classList.toggle('on', x === b)); calc(); });
  calc();
})();
