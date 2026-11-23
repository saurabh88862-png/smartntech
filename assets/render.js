// SmartNTech — shared article helpers, used by index.html and tools/build-pages.html.
// Article bodies support: blank line = paragraph, "## " heading, "- " bullet, `code`, **bold**, ```lang fenced code```.

// Article data files in /articles call snt(category, colour, [[id, date, emoji, readTime, title, excerpt, body], ...])
window.SNT_ARTICLES = window.SNT_ARTICLES || [];
function snt(category, color, list) {
  list.forEach((a) => {
    window.SNT_ARTICLES.push({ id: a[0], date: a[1], emoji: a[2], readTime: a[3], title: a[4], excerpt: a[5], body: a[6], category, color });
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Article data files write inline code as [[code]] and code blocks as ~~~lang ... ~~~ (easier inside JS strings).
function normalizeBody(s) {
  return String(s || '').replace(/\[\[(.+?)\]\]/g, '`$1`').replace(/~~~/g, '```').trim();
}

function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fmtDate(d) {
  const x = new Date(d + 'T00:00:00');
  return isNaN(x) ? d : x.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

// headingTag lets full article pages use <h2> while the homepage pop-up uses <h4>.
function renderBody(text, headingTag = 'h4') {
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-slate-100 dark:bg-slate-800 text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Split out ```fenced code``` first: parts = [text, lang, code, text, lang, code, ...]
  const parts = String(text || '').split(/```(\w*)\n?([\s\S]*?)```/);
  let out = '';
  for (let i = 0; i < parts.length; i += 3) {
    out += renderText(parts[i] || '', inline, headingTag);
    if (i + 2 < parts.length) {
      const label = parts[i + 1] ? `<div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">${esc(parts[i + 1])}</div>` : '';
      out += `<div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">${label}<pre class="p-4 bg-slate-900 text-slate-100 text-xs leading-relaxed overflow-x-auto font-mono"><code>${esc(parts[i + 2].replace(/\n$/, ''))}</code></pre></div>`;
    }
  }
  return out;
}

function renderText(text, inline, headingTag) {
  const hClass = headingTag === 'h2' ? 'text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-4' : 'font-bold text-slate-900 dark:text-white';
  return text.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n').filter((l) => l.trim());
    let html = '', list = [];
    const flush = () => { if (list.length) { html += `<ul class="list-disc pl-5 space-y-1.5">${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`; list = []; } };
    lines.forEach((l) => {
      if (/^\s*-\s+/.test(l)) list.push(l.replace(/^\s*-\s+/, ''));
      else if (/^##\s+/.test(l)) { flush(); html += `<${headingTag} class="${hClass}">${inline(l.replace(/^##\s+/, ''))}</${headingTag}>`; }
      else { flush(); html += `<p>${inline(l)}</p>`; }
    });
    flush();
    return html;
  }).join('');
}
