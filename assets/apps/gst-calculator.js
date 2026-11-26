// SmartNTech GST Calculator: add or remove GST, with CGST/SGST (same state) or IGST (other state) breakup.
(function () {
  const $ = (id) => document.getElementById(id);
  const N = window.SNTNum;
  const RATES = [5, 18, 40, 12, 28, 3, 0.25];
  const st = { mode: 'add', rate: 18, place: 'intra' };
  const r2 = (n) => Math.round(n * 100) / 100;

  $('g-rates').innerHTML = RATES.map((r) => `<button class="calc-chip" data-r="${r}">${r}%</button>`).join('');
  function paintChips() { [...$('g-rates').children].forEach((b) => b.classList.toggle('on', +b.dataset.r === st.rate && !$('g-custom').value)); }
  function seg(id, key) {
    $(id).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st[key] = b.dataset.v; [...$(id).children].forEach((x) => x.classList.toggle('on', x === b)); calc(); });
  }
  seg('g-mode', 'mode'); seg('g-place', 'place');
  $('g-rates').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; st.rate = +b.dataset.r; $('g-custom').value = ''; calc(); });
  $('g-custom').addEventListener('input', () => { const v = parseFloat($('g-custom').value); if (!isNaN(v) && v >= 0) st.rate = v; calc(); });
  $('g-amt').addEventListener('input', calc);
  $('g-reset').addEventListener('click', () => { $('g-amt').value = 1000; $('g-custom').value = ''; st.rate = 18; calc(); });

  let lastText = '';
  function calc() {
    paintChips();
    const amt = parseFloat($('g-amt').value) || 0, rate = st.rate;
    let net, gst, total;
    if (st.mode === 'add') { net = amt; gst = r2(amt * rate / 100); total = r2(net + gst); }
    else { total = amt; net = r2(amt * 100 / (100 + rate)); gst = r2(total - net); }
    const half = r2(gst / 2), halfRate = rate / 2;
    const rows = [
      ['Amount without GST', N.inr(net)],
      ...(st.place === 'intra'
        ? [[`CGST @ ${halfRate}%`, N.inr(half)], [`SGST @ ${halfRate}%`, N.inr(r2(gst - half))]]
        : [[`IGST @ ${rate}%`, N.inr(gst)]]),
      ['Total GST', N.inr(gst)],
    ];
    $('g-break').innerHTML = rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') + `<tr class="total"><td>Total amount (with GST)</td><td>${N.inr(total)}</td></tr>`;
    $('g-r-label').textContent = st.mode === 'add' ? `Total amount (with ${rate}% GST)` : `Amount without GST (removed ${rate}% GST)`;
    $('g-total').textContent = N.inr(st.mode === 'add' ? total : net);
    $('g-words').textContent = N.rupeesWords(st.mode === 'add' ? total : net);
    lastText = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\nTotal amount (with GST): ${N.inr(total)}`;
  }
  $('g-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(lastText); $('g-copy').textContent = '✓ Copied'; setTimeout(() => { $('g-copy').textContent = '📋 Copy breakup'; }, 1500); }
    catch { alert(lastText); }
  });
  calc();
})();
