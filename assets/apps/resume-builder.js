// SmartNTech Resume Builder: form → live A4 preview → PDF via the browser's "Save as PDF".
// Everything is saved in this browser (localStorage); nothing is uploaded.
(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = 'snt_resume_v1';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = (s) => String(s || '').split('\n').map((x) => x.replace(/^[\s•*-]+/, '').trim()).filter(Boolean);
  const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

  // ---------------------------------------------------------------- styles (form, paper, templates, print)
  const css = document.createElement('style');
  css.textContent = `
  .rb-card{padding:1.1rem;border-radius:1.25rem;background:#fff;border:1px solid #e2e8f0}.dark .rb-card{background:#0f172a;border-color:#1e293b}
  .rb-h{font-weight:800;color:#0f172a;margin-bottom:.75rem}.dark .rb-h{color:#fff}
  .rb-l{font-size:.75rem;font-weight:600;color:#475569}.dark .rb-l{color:#94a3b8}
  .rb-item{position:relative;padding:.85rem;border-radius:1rem;background:#f8fafc;border:1px solid #e2e8f0}.dark .rb-item{background:#020617;border-color:#1e293b}
  .rb-del{position:absolute;top:.4rem;right:.5rem;width:1.8rem;height:1.8rem;border-radius:.6rem;color:#e11d48;font-weight:800}.rb-del:hover{background:#ffe4e6}
  .rb-tpl{padding:.45rem .9rem;border-radius:.8rem;font-size:.8rem;font-weight:700;color:#475569}.dark .rb-tpl{color:#cbd5e1}
  .rb-tpl.on{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff}
  #rb-scale{transform-origin:top left}
  .rb-paper{width:794px;min-height:1123px;background:#fff;color:#1e293b;box-shadow:0 20px 50px -20px rgba(15,23,42,.45);font:13px/1.5 Inter,'Segoe UI',Arial,sans-serif;--ac:#4f46e5}
  .rb-paper h1{font-size:30px;font-weight:800;line-height:1.1;margin:0;color:#0f172a}.rb-paper .role{font-size:15px;font-weight:600;color:var(--ac);margin-top:4px}
  .rb-paper h3{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ac);margin:18px 0 8px}
  .rb-paper .it{margin-bottom:10px;break-inside:avoid}.rb-paper .row{display:flex;justify-content:space-between;gap:12px}.rb-paper .row b{color:#0f172a}
  .rb-paper .muted{color:#64748b;font-size:12px}.rb-paper ul{margin:4px 0 0 0;padding-left:16px}.rb-paper li{margin:2px 0}
  .rb-paper .chips{display:flex;flex-wrap:wrap;gap:6px}.rb-paper .chip{padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:600;background:color-mix(in srgb,var(--ac) 12%,#fff);color:var(--ac)}
  .rb-paper .contact{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:#475569;margin-top:8px}
  .rb-paper .empty{color:#94a3b8;text-align:center;padding:120px 40px;font-size:15px}
  /* Modern: coloured sidebar */
  .tpl-modern{display:grid;grid-template-columns:250px 1fr}
  .tpl-modern .side{background:var(--ac);color:#fff;padding:36px 24px}.tpl-modern .side h3{color:#fff;opacity:.85}.tpl-modern .side .chip{background:rgba(255,255,255,.18);color:#fff}
  .tpl-modern .side .contact{flex-direction:column;color:#fff;opacity:.95;margin:0}.tpl-modern .side .muted{color:rgba(255,255,255,.8)}
  .tpl-modern .main{padding:36px 32px}.tpl-modern .side h1{color:#fff;font-size:26px}.tpl-modern .side .role{color:#fff;opacity:.9}
  /* Classic: centred serif */
  .tpl-classic{padding:44px 52px;font-family:Georgia,'Times New Roman',serif}.tpl-classic header{text-align:center;border-bottom:2px solid var(--ac);padding-bottom:12px}
  .tpl-classic .contact{justify-content:center}.tpl-classic h3{border-bottom:1px solid #e2e8f0;padding-bottom:4px;letter-spacing:.08em}
  /* Minimal */
  .tpl-minimal{padding:48px 56px}.tpl-minimal h1{font-weight:300;font-size:34px;letter-spacing:-.5px}.tpl-minimal h3{color:#0f172a;letter-spacing:.2em;font-weight:700}
  .tpl-minimal .grid2{display:grid;grid-template-columns:140px 1fr;gap:8px 18px}
  @media print{
    @page{size:A4;margin:0}
    body *{visibility:hidden!important}
    #rb-paper,#rb-paper *{visibility:visible!important}
    #rb-paper{position:fixed;left:0;top:0;width:210mm;min-height:297mm;box-shadow:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    #rb-scale{transform:none!important}
    .cursor-glow,.gem-gutter,canvas{display:none!important}
  }`;
  document.head.prepend(css);

  // ---------------------------------------------------------------- state
  const BLANK = { tpl: 'modern', accent: '#4f46e5', name: '', title: '', email: '', phone: '', location: '', links: '', summary: '', skills: '', extras: '', langs: '', exp: [], edu: [], proj: [] };
  const SAMPLE = {
    tpl: 'modern', accent: '#4f46e5', name: 'Lakshmi Narayan Ray', title: 'Software Developer', email: 'lakshmi@example.com', phone: '+91 98765 43210',
    location: 'Noida, India', links: 'linkedin.com/in/your-name, github.com/your-name',
    summary: 'Software developer with 2+ years of experience building fast, accessible web apps with React and JavaScript. Enjoys turning complex workflows into simple interfaces and has shipped ERP modules used by 500+ users.',
    skills: 'JavaScript, React, HTML, CSS, Tailwind CSS, Java, SQL, Git, REST APIs', extras: 'Built SmartNTech: 12 free web tools and 89 tutorials\nWinner, college hackathon 2023', langs: 'English, Hindi',
    exp: [
      { role: 'ERP Developer', org: 'STAQO', dates: '2024 – Present', bullets: 'Built and maintained ERP modules for sales orders and packing slips\nReduced page load time by 40% by optimising API calls\nWorked with clients to turn requirements into features' },
      { role: 'Frontend Intern', org: 'Tech Startup', dates: '2023', bullets: 'Created reusable React components used across 3 products\nImproved Lighthouse accessibility score from 72 to 96' },
    ],
    edu: [{ degree: 'B.Tech, Computer Science', org: 'Your University', dates: '2019 – 2023', score: 'CGPA 8.2' }],
    proj: [
      { name: 'SmartNTech', link: 'saurabh88862-png.github.io/smartntech', desc: 'Free tools and tutorials website with dark mode, PWA support and Hindi/English switch.' },
      { name: 'Aadhaar Card UI', link: 'github.com/saurabh88862-png', desc: 'Responsive front and back card layout built with React and CSS.' },
    ],
  };
  const load = () => { try { return Object.assign({}, BLANK, JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch { return { ...BLANK }; } };
  let S = load();

  const FIELDS = {
    exp: [['role', 'Job title', 'Software Engineer'], ['org', 'Company', 'Company name'], ['dates', 'Dates', 'Jan 2024 – Present'], ['bullets', 'What you did (one point per line)', 'Built …\nImproved … by 30%', true]],
    edu: [['degree', 'Degree / course', 'B.Tech, Computer Science'], ['org', 'College / school', 'University name'], ['dates', 'Dates', '2019 – 2023'], ['score', 'Score (optional)', 'CGPA 8.2 / 85%']],
    proj: [['name', 'Project name', 'Portfolio website'], ['link', 'Link (optional)', 'github.com/you/project'], ['desc', 'Short description', 'What it does and the tech you used', true]],
  };

  // ---------------------------------------------------------------- form <-> state
  const form = $('rb-form');
  function renderLists() {
    Object.keys(FIELDS).forEach((k) => {
      $('rb-' + k).innerHTML = S[k].map((item, i) => `<div class="rb-item"><button class="rb-del" data-del="${k}:${i}" aria-label="Remove">✕</button>
        <div class="grid sm:grid-cols-2 gap-2 pr-6">${FIELDS[k].map(([f, label, ph, big]) => `<label class="rb-l ${big ? 'sm:col-span-2' : ''}">${label}${big
          ? `<textarea data-k="${k}" data-i="${i}" data-f="${f}" rows="3" class="field mt-1" placeholder="${esc(ph)}">${esc(item[f])}</textarea>`
          : `<input data-k="${k}" data-i="${i}" data-f="${f}" class="field mt-1" placeholder="${esc(ph)}" value="${esc(item[f])}" />`}</label>`).join('')}</div></div>`).join('')
        || `<p class="text-xs text-slate-400">Nothing added yet. Tap “+ Add”.</p>`;
    });
  }
  function fillForm() {
    ['name', 'title', 'email', 'phone', 'location', 'links', 'summary', 'skills', 'extras', 'langs'].forEach((n) => { form.elements[n].value = S[n] || ''; });
    $('rb-accent').value = S.accent;
    document.querySelectorAll('.rb-tpl').forEach((b) => b.classList.toggle('on', b.dataset.tpl === S.tpl));
    renderLists(); render();
  }
  let saveT;
  function save() {
    clearTimeout(saveT); $('rb-saved').textContent = 'Saving…';
    saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); $('rb-saved').textContent = '✓ Saved'; } catch { $('rb-saved').textContent = 'Not saved (private mode)'; } }, 300);
  }
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.k) S[t.dataset.k][+t.dataset.i][t.dataset.f] = t.value;
    else if (t.name) S[t.name] = t.value;
    render(); save();
  });
  form.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]'), del = e.target.closest('[data-del]');
    if (add) { const k = add.dataset.add; S[k].push(Object.fromEntries(FIELDS[k].map(([f]) => [f, '']))); renderLists(); render(); save(); const items = $('rb-' + k).querySelectorAll('.rb-item'); items[items.length - 1].querySelector('input,textarea').focus(); }
    if (del) { const [k, i] = del.dataset.del.split(':'); S[k].splice(+i, 1); renderLists(); render(); save(); }
  });
  $('rb-templates').addEventListener('click', (e) => { const b = e.target.closest('[data-tpl]'); if (!b) return; S.tpl = b.dataset.tpl; fillForm(); save(); });
  $('rb-accent').addEventListener('input', (e) => { S.accent = e.target.value; render(); save(); });
  $('rb-sample').addEventListener('click', () => { if (S.name && !confirm('Replace your details with the sample resume?')) return; S = JSON.parse(JSON.stringify(SAMPLE)); fillForm(); save(); });
  $('rb-clear').addEventListener('click', () => { if (!confirm('Clear the whole resume? This cannot be undone.')) return; S = JSON.parse(JSON.stringify(BLANK)); fillForm(); save(); });
  $('rb-pdf').addEventListener('click', () => {
    if (!S.name.trim()) { alert('Please add at least your name first.'); form.elements.name.focus(); return; }
    const old = document.title; document.title = (S.name.trim() + ' Resume').replace(/[^\w\s-]/g, ''); // becomes the PDF file name
    window.print(); setTimeout(() => { document.title = old; }, 1000);
  });

  // ---------------------------------------------------------------- preview
  const contact = () => [S.email, S.phone, S.location, ...list(S.links)].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('');
  const expHtml = () => S.exp.filter((x) => x.role || x.org).map((x) => `<div class="it"><div class="row"><b>${esc(x.role)}${x.org ? ' · ' + esc(x.org) : ''}</b><span class="muted">${esc(x.dates)}</span></div>${lines(x.bullets).length ? `<ul>${lines(x.bullets).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</div>`).join('');
  const eduHtml = () => S.edu.filter((x) => x.degree || x.org).map((x) => `<div class="it"><div class="row"><b>${esc(x.degree)}</b><span class="muted">${esc(x.dates)}</span></div><div class="muted">${esc(x.org)}${x.score ? ' · ' + esc(x.score) : ''}</div></div>`).join('');
  const projHtml = () => S.proj.filter((x) => x.name).map((x) => `<div class="it"><div class="row"><b>${esc(x.name)}</b><span class="muted">${esc(x.link)}</span></div>${x.desc ? `<div>${esc(x.desc)}</div>` : ''}</div>`).join('');
  const skillsHtml = () => list(S.skills).map((s) => `<span class="chip">${esc(s)}</span>`).join('');
  const sec = (title, html) => (html ? `<h3>${title}</h3>${html}` : '');
  function render() {
    const p = $('rb-paper');
    p.style.setProperty('--ac', S.accent);
    const has = S.name || S.title || S.summary || S.exp.length || S.edu.length;
    if (!has) { p.className = 'rb-paper'; p.innerHTML = '<div class="empty">Your resume preview appears here.<br><br>Start typing in the form, or tap <b>Fill sample</b> to see an example.</div>'; return fit(); }
    const extras = lines(S.extras).length ? `<ul>${lines(S.extras).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
    const langs = list(S.langs).join(' · ');
    if (S.tpl === 'modern') {
      p.className = 'rb-paper tpl-modern';
      p.innerHTML = `<aside class="side"><h1>${esc(S.name)}</h1><div class="role">${esc(S.title)}</div>
        ${sec('Contact', `<div class="contact">${contact()}</div>`)}${sec('Skills', skillsHtml() && `<div class="chips">${skillsHtml()}</div>`)}${sec('Languages', langs && `<div>${esc(langs)}</div>`)}</aside>
        <div class="main">${sec('Profile', S.summary && `<p>${esc(S.summary)}</p>`)}${sec('Experience', expHtml())}${sec('Projects', projHtml())}${sec('Education', eduHtml())}${sec('Achievements', extras)}</div>`;
    } else if (S.tpl === 'classic') {
      p.className = 'rb-paper tpl-classic';
      p.innerHTML = `<header><h1>${esc(S.name)}</h1><div class="role">${esc(S.title)}</div><div class="contact">${contact()}</div></header>
        ${sec('Summary', S.summary && `<p>${esc(S.summary)}</p>`)}${sec('Experience', expHtml())}${sec('Education', eduHtml())}${sec('Projects', projHtml())}
        ${sec('Skills', skillsHtml() && `<div class="chips">${skillsHtml()}</div>`)}${sec('Achievements', extras)}${sec('Languages', langs && `<div>${esc(langs)}</div>`)}`;
    } else {
      p.className = 'rb-paper tpl-minimal';
      p.innerHTML = `<h1>${esc(S.name)}</h1><div class="role">${esc(S.title)}</div><div class="contact">${contact()}</div>
        ${sec('About', S.summary && `<p>${esc(S.summary)}</p>`)}${sec('Experience', expHtml())}${sec('Education', eduHtml())}${sec('Projects', projHtml())}
        ${sec('Skills', list(S.skills).length && `<div>${esc(list(S.skills).join(' · '))}</div>`)}${sec('Achievements', extras)}${sec('Languages', langs && `<div>${esc(langs)}</div>`)}`;
    }
    fit();
  }
  // Scale the 794px-wide A4 paper to fit the preview column (phones included)
  function fit() {
    const stage = $('rb-stage'), scale = $('rb-scale'), p = $('rb-paper');
    const w = stage.clientWidth - 24, k = Math.min(1, w / 794);
    scale.style.transform = `scale(${k})`;
    scale.style.height = p.offsetHeight * k + 'px';
  }
  window.addEventListener('resize', fit);
  fillForm();
})();
