// SmartNTech shared features for every page (index.html and /blog pages):
//  - Hindi / English language switch (UI text; articles get a Google-Translate Hindi link)
//  - Installable app (PWA): service worker + "Install app" button
//  - Saved articles (bookmarks) stored in this browser
//  - Article pages: Save, Like (shared counter), Share, Read in Hindi, comments (utterances)
//  - Blog index page: instant search + "Saved" list
(function () {
  // Site root, worked out from this script's own URL. Empty when the script is inlined (single-file copy):
  // then there is no service worker to register.
  const ROOT = document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/assets\/app\.js.*$/, '') : '';
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const toast = (m, err) => {
    if (window.showToast) return window.showToast(m, err);
    let t = document.getElementById('snt-toast');
    if (!t) { t = document.createElement('div'); t.id = 'snt-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99;padding:.7rem 1.1rem;border-radius:.8rem;background:#0f172a;color:#fff;font:600 14px Inter,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:opacity .3s'; document.body.appendChild(t); }
    t.textContent = m; t.style.opacity = 1; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = 0; }, 2400);
  };

  // =============================================================== Saved articles
  const Saved = {
    list() { return LS.get('snt_saved', []); },
    has(id) { return this.list().includes(id); },
    toggle(id) {
      const l = this.list(), i = l.indexOf(id);
      if (i >= 0) l.splice(i, 1); else l.unshift(id);
      LS.set('snt_saved', l);
      document.dispatchEvent(new CustomEvent('snt-saved', { detail: { id, saved: i < 0 } }));
      return i < 0;
    },
  };
  window.SNTSaved = Saved;

  // =============================================================== Hindi / English
  const HI = {
    // navigation
    'Home': 'होम', 'Tools': 'टूल्स', 'Blog': 'ब्लॉग', 'About': 'परिचय', 'FAQ': 'सवाल-जवाब', 'Contact': 'संपर्क',
    'Install app': 'ऐप इंस्टॉल करें', 'Admin': 'एडमिन', 'Apps': 'ऐप्स',
    // full-page apps
    'New · Full apps': 'नया · पूरे ऐप्स', 'Powerful free apps': 'दमदार मुफ़्त ऐप्स', 'Open app': 'ऐप खोलें', 'More free apps': 'और मुफ़्त ऐप्स',
    'Bigger tools with their own page. Everything runs on your device.': 'बड़े टूल्स, अपने अलग पेज के साथ। सब कुछ आपके डिवाइस पर चलता है।',
    'PDF Compressor': 'PDF कंप्रेसर', 'Compress PDF': 'PDF छोटा करें', 'Download compressed PDF': 'छोटा PDF डाउनलोड करें',
    'Drop a PDF here or tap to choose': 'PDF यहाँ डालें या चुनने के लिए टैप करें', 'Drop images here or tap to choose': 'इमेज यहाँ डालें या चुनने के लिए टैप करें',
    'Output format': 'आउटपुट फ़ॉर्मेट', 'Max height (px)': 'अधिकतम ऊँचाई (px)', 'Download': 'डाउनलोड', 'Compare': 'तुलना',
    'Contrast checker': 'कंट्रास्ट चेकर', 'Gradient maker': 'ग्रेडिएंट मेकर', 'Colours from a photo': 'फ़ोटो से रंग', 'Saved colours': 'सेव किए रंग',
    'Choose a photo': 'फ़ोटो चुनें', 'Clear all': 'सब हटाएँ', 'Save colour': 'रंग सेव करें', 'Text': 'टेक्स्ट', 'Swap': 'बदलें',
    // hero
    '12 free tools · 100% private': '12 मुफ़्त टूल्स · 100% प्राइवेट', 'Everyday tools for': 'रोज़ के काम के टूल्स —',
    'Explore Tools': 'टूल्स देखें', 'Read the blog': 'ब्लॉग पढ़ें', 'Popular topics: click to read': 'लोकप्रिय विषय: पढ़ने के लिए क्लिक करें',
    'Count words, beautify JSON, generate strong passwords, encode text and more. Fast, free and private. Nothing you type is sent to a server.': 'शब्द गिनें, JSON सुंदर बनाएँ, मज़बूत पासवर्ड बनाएँ, QR कोड, इमेज छोटी करें और भी बहुत कुछ। तेज़, मुफ़्त और प्राइवेट। आप जो लिखते हैं वह किसी सर्वर पर नहीं जाता।',
    'SmartNTech started as a small set of tools we kept rebuilding for our own projects. Today it is a free, privacy-first platform for writers, students and software engineers, paired with practical tutorials on Java, React, databases and SEO.': 'SmartNTech कुछ छोटे टूल्स से शुरू हुआ जिन्हें हम अपने प्रोजेक्ट्स के लिए बार-बार बनाते थे। आज यह लेखकों, छात्रों और सॉफ़्टवेयर इंजीनियरों के लिए एक मुफ़्त, प्राइवेसी-फ़र्स्ट प्लेटफ़ॉर्म है, साथ में Java, React, डेटाबेस और SEO पर उपयोगी ट्यूटोरियल।',
    'Every tool runs entirely in your browser. No tracking of what you type, no uploads, no paywalls.': 'हर टूल पूरी तरह आपके ब्राउज़र में चलता है। न आपके लिखे की ट्रैकिंग, न अपलोड, न कोई पेमेंट।',
    'writers & developers': 'लेखकों और डेवलपर्स के लिए', 'Java developers': 'Java डेवलपर्स के लिए', 'Python learners': 'Python सीखने वालों के लिए',
    'SQL experts': 'SQL एक्सपर्ट्स के लिए', 'AI builders': 'AI बनाने वालों के लिए', 'automation pros': 'ऑटोमेशन करने वालों के लिए',
    'Free tools': 'मुफ़्त टूल्स', 'Always free': 'हमेशा मुफ़्त', 'Data uploaded': 'डेटा अपलोड', 'Latest': 'ताज़ा',
    // tools
    'Tools Hub': 'टूल्स हब', 'Pick a tool and get it done': 'एक टूल चुनें और काम पूरा करें',
    'Fast, free and everything runs locally in your browser.': 'तेज़, मुफ़्त और सब कुछ आपके ब्राउज़र में ही चलता है।',
    'Word Counter': 'शब्द गणक', 'JSON Formatter': 'JSON फ़ॉर्मेटर', 'Password Generator': 'पासवर्ड जनरेटर', 'SEO Preview': 'SEO प्रीव्यू',
    'Age Calculator': 'उम्र कैलकुलेटर', 'QR Code Generator': 'QR कोड जनरेटर', 'Image Compressor': 'इमेज कंप्रेसर', 'Color Picker': 'कलर पिकर',
    'Markdown Editor': 'मार्कडाउन एडिटर', 'Regex Tester': 'रेगेक्स टेस्टर', 'Unit Converter': 'यूनिट कन्वर्टर', 'Open tool': 'टूल खोलें',
    'Word & Character Counter': 'शब्द और अक्षर गणक', 'Age & Date Difference Calculator': 'उम्र और तारीख़ का अंतर',
    'Color Picker & Converter': 'कलर पिकर और कन्वर्टर', 'Live Tool': 'लाइव टूल', 'Calculator': 'कैलकुलेटर', 'New': 'नया',
    'Download PNG': 'PNG डाउनलोड करें', 'Use my website link': 'मेरी वेबसाइट का लिंक', 'Text or URL': 'टेक्स्ट या लिंक', 'Size': 'साइज़',
    'Colour': 'रंग', 'Background': 'बैकग्राउंड', 'Type something to create a QR code.': 'QR कोड बनाने के लिए कुछ लिखें।',
    'Tap to choose an image': 'इमेज चुनने के लिए टैप करें', 'Format': 'फ़ॉर्मेट', 'Max width (px)': 'अधिकतम चौड़ाई (px)',
    'Download compressed image': 'छोटी की गई इमेज डाउनलोड करें', 'HEX code': 'HEX कोड', 'Copy': 'कॉपी', 'Copy HTML': 'HTML कॉपी',
    'Download .md': '.md डाउनलोड', 'Pattern': 'पैटर्न', 'Test text': 'टेस्ट टेक्स्ट', 'Highlighted': 'हाइलाइट', 'Matches & groups': 'मैच और ग्रुप',
    'From': 'से', 'To': 'तक', 'All conversions': 'सभी बदलाव', 'Clear': 'साफ़ करें',
    // feature band
    '100% private': '100% प्राइवेट', 'Your tool data never leaves your device.': 'आपका डेटा कभी आपके डिवाइस से बाहर नहीं जाता।',
    'Instant results': 'तुरंत नतीजे', 'No uploads, no waiting, no limits.': 'न अपलोड, न इंतज़ार, न कोई सीमा।',
    'Works everywhere': 'हर जगह चलता है', 'Phone, tablet or desktop, light or dark.': 'फ़ोन, टैबलेट या डेस्कटॉप, लाइट या डार्क।',
    'Free forever': 'हमेशा मुफ़्त', 'Every tool is free to use, with no limits.': 'हर टूल बिना किसी सीमा के मुफ़्त है।',
    // blog
    'Tech Blog': 'टेक ब्लॉग', 'Guides & tutorials': 'गाइड और ट्यूटोरियल', 'All': 'सभी', 'Saved': 'सेव किए', 'Read article': 'लेख पढ़ें',
    'Browse all articles': 'सभी लेख देखें', 'No matching articles found.': 'कोई मिलता-जुलता लेख नहीं मिला।',
    'Search Java, React, SQL, SEO...': 'Java, React, SQL, SEO खोजें...', 'Search articles...': 'लेख खोजें...',
    'Programming tutorials & guides': 'प्रोग्रामिंग ट्यूटोरियल और गाइड', 'Your saved articles': 'आपके सेव किए लेख',
    'No saved articles yet. Tap ☆ on any article to save it.': 'अभी कोई लेख सेव नहीं है। किसी भी लेख पर ☆ दबाकर सेव करें।',
    // about / faq / contact
    'About Us': 'हमारे बारे में', 'Built by developers, for everyone': 'डेवलपर्स द्वारा, सबके लिए', 'Founded': 'स्थापना', 'Tutorials': 'ट्यूटोरियल',
    'Our mission': 'हमारा मिशन', 'Clean, distraction-free utilities that save you minutes every day.': 'साफ़-सुथरे टूल्स जो रोज़ आपका समय बचाते हैं।',
    'Privacy first': 'प्राइवेसी पहले', 'Client-side processing by design, not as an afterthought.': 'सारा काम आपके ब्राउज़र में ही होता है।',
    'Learn by doing': 'करके सीखें', 'Every tool comes with guides that explain the why.': 'हर टूल के साथ गाइड, जो "क्यों" समझाती है।',
    'Community driven': 'समुदाय के साथ', 'New tools are picked from your suggestions.': 'नए टूल आपके सुझावों से चुने जाते हैं।',
    'Frequently asked questions': 'अक्सर पूछे जाने वाले सवाल',
    'Are SmartNTech tools really free?': 'क्या SmartNTech के टूल सच में मुफ़्त हैं?', 'Yes. Every tool is free to use with no limits.': 'हाँ। हर टूल बिना किसी सीमा के मुफ़्त है।',
    'Is my tool data sent to a server?': 'क्या मेरा डेटा किसी सर्वर पर जाता है?', 'No. All tools run in your browser with JavaScript. Text, JSON and passwords never leave your device.': 'नहीं। सभी टूल आपके ब्राउज़र में चलते हैं। टेक्स्ट, JSON और पासवर्ड आपके डिवाइस से बाहर नहीं जाते।',
    'How secure is the password generator?': 'पासवर्ड जनरेटर कितना सुरक्षित है?', 'It uses crypto.getRandomValues, the same cryptographic random source browsers use for security features.': 'यह crypto.getRandomValues का उपयोग करता है, वही सुरक्षित रैंडम स्रोत जो ब्राउज़र सुरक्षा के लिए इस्तेमाल करते हैं।',
    'Can I suggest a new tool?': 'क्या मैं नया टूल सुझा सकता हूँ?', 'Absolutely. Use the contact form and choose "Tool suggestion" as the subject.': 'बिल्कुल। संपर्क फ़ॉर्म में विषय "Tool suggestion" चुनें।',
    'Contact Us': 'संपर्क करें', "Let's talk": 'बात करते हैं',
    'Have a question, a tool suggestion or a business inquiry? Send us a message and we usually reply within 24 hours.': 'कोई सवाल, टूल का सुझाव या बिज़नेस से जुड़ी बात? हमें संदेश भेजें, हम आमतौर पर 24 घंटे में जवाब देते हैं।',
    'Email': 'ईमेल', 'Location': 'स्थान', 'Hours': 'समय', 'Your name': 'आपका नाम', 'Subject': 'विषय', 'Message': 'संदेश', 'Send message': 'संदेश भेजें',
    'How can we help you?': 'हम आपकी कैसे मदद कर सकते हैं?',
    // footer
    'Free, private, browser-based tools and tutorials for writers and developers.': 'लेखकों और डेवलपर्स के लिए मुफ़्त, प्राइवेट टूल्स और ट्यूटोरियल।',
    'Free, private developer tools and tutorials.': 'मुफ़्त, प्राइवेट डेवलपर टूल्स और ट्यूटोरियल।',
    'Company': 'कंपनी', 'Categories': 'श्रेणियाँ', 'Free Tools': 'मुफ़्त टूल्स', 'Privacy Policy': 'प्राइवेसी पॉलिसी', 'Terms & Conditions': 'नियम और शर्तें', 'Disclaimer': 'अस्वीकरण',
    // article pages
    'Previous': 'पिछला', 'Next': 'अगला', 'Try our free developer tools': 'हमारे मुफ़्त डेवलपर टूल्स आज़माएँ', 'Open tools': 'टूल्स खोलें',
    'Word counter, JSON formatter, password generator and more. 100% in your browser.': 'शब्द गणक, JSON फ़ॉर्मेटर, पासवर्ड जनरेटर और भी बहुत कुछ। 100% आपके ब्राउज़र में।',
    'Save': 'सेव करें', 'Like': 'पसंद', 'Liked': 'पसंद किया', 'Share': 'शेयर', 'Read in Hindi': 'हिंदी में पढ़ें', 'Comments': 'टिप्पणियाँ',
    'Sign in with GitHub to leave a comment or reply.': 'टिप्पणी करने के लिए GitHub से साइन इन करें।',
    'This article is in English.': 'यह लेख अंग्रेज़ी में है।', 'Read it in Hindi with Google Translate': 'Google Translate से हिंदी में पढ़ें',
  };
  const PATTERNS = [
    [/^Showing (\d+) of (\d+) articles?$/, (m) => `${m[2]} में से ${m[1]} लेख दिख रहे हैं`],
    [/^Load more articles \((\d+) more\)$/, (m) => `और लेख देखें (${m[1]} और)`],
    [/^More (.+) articles$/, (m) => `${m[1]} के और लेख`],
    [/^© (\d{4}) SmartNTech\. All rights reserved\.$/, (m) => `© ${m[1]} SmartNTech. सर्वाधिकार सुरक्षित।`],
    [/^Written by the (.+)$/, (m) => `लेखक: ${m[1]}`],
    [/^(\d+) free, in-depth articles across (\d+) topics\. Pick a category or browse everything below\.$/, (m) => `${m[2]} विषयों पर ${m[1]} मुफ़्त और विस्तृत लेख। कोई श्रेणी चुनें या नीचे सब देखें।`],
  ];
  function translate(s) {
    const t = s.trim(); if (!t) return null;
    if (HI[t]) return s.replace(t, HI[t]);
    // Allow a leading emoji/symbol ("📝 Word Counter") and a trailing arrow ("Open tool →").
    const m = t.match(/^([^\p{L}\p{N}"']*)(.*?)(\s*[→←↑]?)$/u);
    if (m && m[2] && HI[m[2]]) return s.replace(t, m[1] + HI[m[2]] + m[3]);
    for (const [re, fn] of PATTERNS) { const p = t.match(re); if (p) return s.replace(t, fn(p)); }
    return null;
  }
  const SKIP = 'script,style,code,pre,textarea,select,option,article,#dashboard,#modal-body,#articles-grid h3,#articles-grid p,.ticker,.no-i18n,#md-out,#rx-hl,#rx-out,#rx-list';
  const done = new Map();      // text node -> { o: original, t: translated }
  const attrDone = new Map();  // element -> original placeholder
  let lang = LS.get('snt_lang', 'en'), applying = false;
  function apply() {
    if (lang !== 'hi' || !document.body) return;
    applying = true;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const rec = done.get(n);
      if (rec && n.nodeValue === rec.t) continue;
      const tr = translate(n.nodeValue);
      if (tr && tr !== n.nodeValue) { done.set(n, { o: n.nodeValue, t: tr }); n.nodeValue = tr; }
    }
    document.querySelectorAll('[placeholder]').forEach((el) => {
      if (el.closest('#dashboard')) return;
      const cur = el.getAttribute('placeholder'), tr = translate(cur);
      if (tr && tr !== cur) { if (!attrDone.has(el)) attrDone.set(el, cur); el.setAttribute('placeholder', tr); }
    });
    applying = false;
  }
  function restore() {
    done.forEach((rec, n) => { if (n.nodeValue === rec.t) n.nodeValue = rec.o; });
    done.clear();
    attrDone.forEach((o, el) => el.setAttribute('placeholder', o));
    attrDone.clear();
  }
  let mo, moTimer;
  function setLang(l) {
    lang = l; LS.set('snt_lang', l);
    document.documentElement.lang = l === 'hi' ? 'hi' : 'en';
    if (l === 'hi') {
      apply();
      if (!mo) mo = new MutationObserver(() => { if (applying) return; clearTimeout(moTimer); moTimer = setTimeout(apply, 60); });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else { if (mo) mo.disconnect(); restore(); }
    document.querySelectorAll('.lang-btn span').forEach((s) => { s.textContent = l === 'hi' ? 'EN' : 'हिं'; });
    document.querySelectorAll('.lang-btn').forEach((b) => b.setAttribute('aria-label', l === 'hi' ? 'Switch to English' : 'हिंदी में देखें'));
    hindiBanner();
  }
  window.SNTLang = { set: setLang, get: () => lang, toggle: () => setLang(lang === 'hi' ? 'en' : 'hi') };

  // Translate-proxy link for article pages (only works on the public website, not localhost)
  function hindiUrl() {
    const h = location.hostname;
    if (!h || h === 'localhost' || /^[\d.]+$/.test(h)) return null;
    return location.protocol + '//' + h.replace(/-/g, '--').replace(/\./g, '-') + '.translate.goog' + location.pathname + '?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi';
  }
  function hindiBanner() {
    const art = document.querySelector('main[data-article-id] article');
    if (!art) return;
    let b = document.getElementById('hi-banner');
    if (lang !== 'hi') { if (b) b.remove(); return; }
    const url = hindiUrl();
    if (b || !url) return;
    b = document.createElement('a');
    b.id = 'hi-banner'; b.href = url; b.rel = 'noopener';
    b.className = 'no-i18n flex items-center gap-2 mb-5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-sm font-semibold text-amber-800 dark:text-amber-300';
    b.textContent = '🇮🇳 यह लेख अंग्रेज़ी में है। Google Translate से हिंदी में पढ़ें →';
    art.parentElement.insertBefore(b, art);
  }

  // =============================================================== Header buttons (language + install)
  let installEvt = null;
  function addHeaderButtons() {
    const theme = document.querySelector('button[aria-label="Toggle dark mode"]');
    if (theme && !document.querySelector('.lang-btn')) {
      const lb = document.createElement('button');
      lb.className = 'btn3d lang-btn'; // no type="button": Tailwind's reset would then remove the 3D background
      lb.innerHTML = '<span class="text-[11px] font-extrabold leading-none">हिं</span>';
      lb.addEventListener('click', () => window.SNTLang.toggle());
      theme.parentElement.insertBefore(lb, theme);
      const ib = document.createElement('button');
      ib.className = 'btn3d install-btn hidden'; ib.title = 'Install app'; ib.setAttribute('aria-label', 'Install app');
      ib.innerHTML = '<span class="text-base leading-none">📲</span>';
      ib.addEventListener('click', promptInstall);
      theme.parentElement.insertBefore(ib, lb);
    }
    const mm = document.getElementById('mobile-menu');
    if (mm && !mm.querySelector('.install-link')) {
      const a = document.createElement('a');
      a.href = '#'; a.className = 'm-link install-link hidden'; a.innerHTML = '<span>📲</span>Install app';
      a.addEventListener('click', (e) => { e.preventDefault(); promptInstall(); });
      mm.appendChild(a);
    }
  }
  function showInstall(on) {
    document.querySelectorAll('.install-btn').forEach((b) => b.classList.toggle('hidden', !on));
    document.querySelectorAll('.install-link').forEach((b) => b.classList.toggle('hidden', !on));
  }
  async function promptInstall() {
    if (!installEvt) { toast('Use your browser menu → "Install app" / "Add to Home screen".'); return; }
    installEvt.prompt();
    const r = await installEvt.userChoice.catch(() => null);
    if (r && r.outcome === 'accepted') toast('SmartNTech installed 🎉');
    installEvt = null; showInstall(false);
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; showInstall(true); });
  window.addEventListener('appinstalled', () => { installEvt = null; showInstall(false); });
  if (ROOT && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register(ROOT + 'sw.js').catch(() => {}));
  }

  // =============================================================== Article page actions
  const LIKES = 'https://abacus.jasoncameron.dev';
  const NS = 'smartntech-likes';
  function articlePage() {
    const main = document.querySelector('main[data-article-id]');
    if (!main) return;
    const id = main.dataset.articleId;
    const saveBtn = document.getElementById('act-save'), likeBtn = document.getElementById('act-like');
    const likeN = document.getElementById('like-count'), shareBtn = document.getElementById('act-share'), hiBtn = document.getElementById('act-hindi');
    const paintSave = () => { const s = Saved.has(id); saveBtn.querySelector('.ico').textContent = s ? '★' : '☆'; saveBtn.querySelector('.lbl').textContent = s ? 'Saved' : 'Save'; saveBtn.classList.toggle('on', s); };
    if (saveBtn) { paintSave(); saveBtn.addEventListener('click', () => { const s = Saved.toggle(id); paintSave(); toast(s ? 'Saved to your reading list ⭐' : 'Removed from your reading list'); }); }

    if (likeBtn) {
      const liked = () => LS.get('snt_liked', []).includes(id);
      const paintLike = () => { likeBtn.classList.toggle('on', liked()); likeBtn.querySelector('.ico').textContent = liked() ? '❤️' : '🤍'; likeBtn.querySelector('.lbl').textContent = liked() ? 'Liked' : 'Like'; };
      paintLike();
      fetch(`${LIKES}/get/${NS}/${encodeURIComponent(id)}`).then((r) => (r.ok ? r.json() : { value: 0 })).then((d) => { likeN.textContent = d.value || 0; }).catch(() => { likeN.textContent = '0'; });
      likeBtn.addEventListener('click', async () => {
        if (liked()) { toast('You already liked this article ❤️'); return; }
        LS.set('snt_liked', [...LS.get('snt_liked', []), id]); paintLike();
        likeN.textContent = (+likeN.textContent || 0) + 1;
        likeBtn.classList.add('pop'); setTimeout(() => likeBtn.classList.remove('pop'), 500);
        try { const r = await fetch(`${LIKES}/hit/${NS}/${encodeURIComponent(id)}`); const d = await r.json(); if (d.value) likeN.textContent = d.value; } catch { /* offline: kept locally */ }
      });
    }
    if (shareBtn) shareBtn.addEventListener('click', async () => {
      const data = { title: document.title, url: location.href.split('#')[0] };
      if (navigator.share) { try { await navigator.share(data); } catch { /* cancelled */ } return; }
      try { await navigator.clipboard.writeText(data.url); toast('Link copied 🔗'); } catch { toast('Copy the link from the address bar.'); }
    });
    if (hiBtn) {
      const url = hindiUrl();
      if (url) hiBtn.href = url; else hiBtn.classList.add('hidden');
    }
    // Comments (utterances, GitHub issues): loaded only when the reader scrolls near them.
    const box = document.getElementById('comments-box');
    if (box) {
      const load = () => {
        if (box.dataset.loaded) return; box.dataset.loaded = '1';
        const s = document.createElement('script');
        s.src = 'https://utteranc.es/client.js'; s.async = true; s.crossOrigin = 'anonymous';
        s.setAttribute('repo', box.dataset.repo); s.setAttribute('issue-term', 'pathname'); s.setAttribute('label', 'comments');
        s.setAttribute('theme', document.documentElement.classList.contains('dark') ? 'github-dark' : 'github-light');
        box.appendChild(s);
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '400px' });
        io.observe(box);
      } else load();
    }
  }

  // =============================================================== Blog index: search + saved list
  function blogIndexPage() {
    const input = document.getElementById('blog-page-search');
    if (!input) return;
    const cards = [...document.querySelectorAll('.cat-section .blog-card')];
    const sections = [...document.querySelectorAll('.cat-section')];
    const none = document.getElementById('blog-page-none');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      let shown = 0;
      cards.forEach((c) => { const ok = !q || (c.dataset.q || '').includes(q); c.classList.toggle('hidden', !ok); if (ok) shown++; });
      sections.forEach((s) => s.classList.toggle('hidden', !s.querySelector('.blog-card:not(.hidden)')));
      none.classList.toggle('hidden', shown > 0);
    });
    const savedWrap = document.getElementById('saved-grid'), savedSec = document.getElementById('saved-section');
    const paint = () => {
      const ids = Saved.list();
      const items = ids.map((id) => cards.find((c) => c.dataset.id === id)).filter(Boolean);
      savedSec.classList.toggle('hidden', !items.length);
      savedWrap.innerHTML = '';
      items.forEach((c) => savedWrap.appendChild(c.cloneNode(true)));
    };
    paint();
    document.addEventListener('snt-saved', paint);
  }

  // Star buttons on article cards (blog index + related articles), using data-id on .blog-card
  function cardStars() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.card-save'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const id = b.closest('[data-id]').dataset.id, s = Saved.toggle(id);
      toast(s ? 'Saved to your reading list ⭐' : 'Removed from your reading list');
    }, true);
    const paint = () => document.querySelectorAll('.card-save').forEach((b) => { const card = b.closest('[data-id]'); const s = card && Saved.has(card.dataset.id); b.textContent = s ? '★' : '☆'; b.classList.toggle('on', !!s); b.title = s ? 'Remove from saved' : 'Save for later'; });
    paint();
    document.addEventListener('snt-saved', paint);
  }

  // Small shared styles for the new controls
  const css = document.createElement('style');
  css.textContent = `.act-btn{display:inline-flex;align-items:center;gap:.45rem;padding:.55rem 1rem;border-radius:999px;font-size:.85rem;font-weight:700;border:1px solid #e2e8f0;background:#fff;color:#334155;transition:transform .15s,background .15s,border-color .15s}
  .act-btn:hover{transform:translateY(-1px);border-color:#a78bfa}.dark .act-btn{background:#0f172a;border-color:#334155;color:#e2e8f0}
  .act-btn.on{background:linear-gradient(135deg,#fdf2f8,#f5f3ff);border-color:#c4b5fd;color:#6d28d9}.dark .act-btn.on{background:rgba(124,58,237,.18);color:#c4b5fd}
  .act-btn.pop .ico{animation:snt-pop .5s cubic-bezier(.34,1.6,.5,1)}@keyframes snt-pop{40%{transform:scale(1.7)}}
  .card-save{position:absolute;top:.6rem;right:.6rem;z-index:3;width:2.1rem;height:2.1rem;display:grid;place-items:center;border-radius:999px;background:rgba(255,255,255,.9);color:#64748b;font-size:1.05rem;box-shadow:0 4px 12px rgba(15,23,42,.18);transition:transform .15s}
  .card-save:hover{transform:scale(1.12)}.card-save.on{color:#f59e0b}.dark .card-save{background:rgba(15,23,42,.85);color:#cbd5e1}.dark .card-save.on{color:#fbbf24}`;
  // Put these first in <head> so Tailwind utilities (e.g. "hidden") still win over them.
  document.head.prepend(css);

  function init() {
    addHeaderButtons();
    articlePage();
    blogIndexPage();
    cardStars();
    if (lang === 'hi') setLang('hi'); else document.querySelectorAll('.lang-btn').forEach((b) => b.setAttribute('aria-label', 'हिंदी में देखें'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
