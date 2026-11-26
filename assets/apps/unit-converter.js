// SmartNTech Indian Unit Converter: land (state-wise bigha/biswa/katha), length, weight, temperature, volume.
(function () {
  const $ = (id) => document.getElementById(id);
  // Typical (pucca) bigha and katha sizes in square feet. They vary locally; see the note on the page.
  const STATES = {
    'Uttar Pradesh': { bigha: 27000 },
    'Bihar': { bigha: 27225, katha: 1361.25 },      // 1 bigha = 20 katha, 1 katha = 20 dhur
    'Jharkhand': { bigha: 27225, katha: 1361.25 },
    'Rajasthan': { bigha: 27225 },
    'Madhya Pradesh': { bigha: 12000 },
    'Gujarat': { bigha: 17424 },
    'West Bengal': { bigha: 14400, katha: 720 },
    'Assam': { bigha: 14400, katha: 2880 },
    'Punjab': { bigha: 9070 },
    'Himachal Pradesh': { bigha: 8712 },
    'Uttarakhand': { bigha: 6804 },
  };
  let state = 'Uttar Pradesh';
  const land = () => {
    const s = STATES[state];
    const u = {
      sqft: ['Square foot (sq ft)', 1], sqm: ['Square metre (sq m)', 10.7639104], gaj: ['Gaj / Square yard', 9],
      bigha: [`Bigha (${state})`, s.bigha], biswa: [`Biswa (${state})`, s.bigha / 20],
      acre: ['Acre', 43560], hectare: ['Hectare', 107639.104], kanal: ['Kanal', 5445], marla: ['Marla', 272.25],
      guntha: ['Guntha', 1089], cent: ['Cent', 435.6], sqkm: ['Square kilometre', 10763910.4],
    };
    if (s.katha) { u.katha = [`Katha (${state})`, s.katha]; u.dhur = [`Dhur (${state})`, s.katha / 20]; }
    return u;
  };
  const CATS = {
    land: { name: '🌾 Land', units: land, def: ['bigha', 'sqft'] },
    length: { name: '📏 Length', units: () => ({ m: ['Metre', 1], cm: ['Centimetre', 0.01], mm: ['Millimetre', 0.001], km: ['Kilometre', 1000], in: ['Inch', 0.0254], ft: ['Foot', 0.3048], yd: ['Yard / Gaj', 0.9144], mi: ['Mile', 1609.344] }), def: ['cm', 'in'] },
    weight: { name: '⚖️ Weight', units: () => ({ kg: ['Kilogram', 1], g: ['Gram', 0.001], mg: ['Milligram', 1e-6], quintal: ['Quintal', 100], tonne: ['Tonne', 1000], lb: ['Pound', 0.45359237], oz: ['Ounce', 0.028349523125], tola: ['Tola (gold)', 0.0116638] }), def: ['kg', 'lb'] },
    temp: { name: '🌡️ Temperature', units: () => ({ c: ['Celsius °C'], f: ['Fahrenheit °F'], k: ['Kelvin K'] }), def: ['c', 'f'] },
    volume: { name: '🥛 Volume', units: () => ({ l: ['Litre', 1], ml: ['Millilitre', 0.001], m3: ['Cubic metre', 1000], gal: ['US gallon', 3.785411784], ukgal: ['UK gallon', 4.54609], cup: ['Cup (US)', 0.2365882365], tbsp: ['Tablespoon', 0.0147867648] }), def: ['l', 'gal'] },
  };
  let cat = 'land';
  const units = () => CATS[cat].units();
  const toC = (v, u) => (u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15);
  const fromC = (v, u) => (u === 'c' ? v : u === 'f' ? v * 9 / 5 + 32 : v + 273.15);
  const conv = (v, a, b) => { if (cat === 'temp') return fromC(toC(v, a), b); const U = units(); return v * U[a][1] / U[b][1]; };
  const nice = (n) => (!isFinite(n) ? '—' : Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0) ? n.toExponential(4) : (+n.toPrecision(10)).toLocaleString('en-IN', { maximumFractionDigits: 6 }));

  $('u-cat').innerHTML = Object.entries(CATS).map(([k, c]) => `<button data-v="${k}" class="${k === cat ? 'on' : ''}">${c.name}</button>`).join('');
  $('u-state').innerHTML = Object.keys(STATES).map((s) => `<option>${s}</option>`).join('');
  function fillUnits(keep) {
    const U = units(), opts = Object.entries(U).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('');
    const f = keep && $('u-from').value, t = keep && $('u-to').value;
    $('u-from').innerHTML = opts; $('u-to').innerHTML = opts;
    $('u-from').value = f && U[f] ? f : CATS[cat].def[0];
    $('u-to').value = t && U[t] ? t : CATS[cat].def[1];
    $('u-state-wrap').classList.toggle('hidden', cat !== 'land');
    run();
  }
  function run() {
    const v = parseFloat($('u-val').value), a = $('u-from').value, b = $('u-to').value, U = units();
    if (isNaN(v)) { $('u-res').textContent = '—'; $('u-all').innerHTML = ''; $('u-formula').textContent = ''; return; }
    $('u-res').textContent = nice(conv(v, a, b));
    $('u-formula').textContent = `${nice(v)} ${U[a][0]} = ${nice(conv(v, a, b))} ${U[b][0]}` + (cat !== 'temp' && v !== 1 ? `  ·  1 ${U[a][0]} = ${nice(conv(1, a, b))} ${U[b][0]}` : '');
    $('u-all').innerHTML = Object.entries(U).map(([k, [n]]) => `<div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${k === b ? 'ring-2 ring-blue-500' : ''}"><div class="font-black text-slate-900 dark:text-white truncate">${nice(conv(v, a, k))}</div><div class="text-xs text-slate-500">${n}</div></div>`).join('');
  }
  $('u-cat').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.v; [...$('u-cat').children].forEach((x) => x.classList.toggle('on', x === b)); fillUnits(false); });
  $('u-state').addEventListener('change', () => { state = $('u-state').value; fillUnits(true); });
  ['u-val', 'u-from', 'u-to'].forEach((id) => $(id).addEventListener('input', run));
  $('u-swap').addEventListener('click', () => { const f = $('u-from').value; $('u-from').value = $('u-to').value; $('u-to').value = f; run(); });
  fillUnits(false);
})();
