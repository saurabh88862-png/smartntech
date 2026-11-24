// SmartNTech PDF Compressor (runs fully in the browser).
//  light:  re-save with pdf-lib (object streams, drops unused objects/metadata) — text stays selectable
//  medium / strong: render every page with pdf.js and rebuild the PDF from JPEG page images at the
//                   original page size — big savings for scans and image-heavy PDFs
(function () {
  const $ = (id) => document.getElementById(id);
  const LIBS = {
    pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    pdflib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  };
  const LEVELS = { medium: { dpi: 150, q: 0.7 }, strong: { dpi: 96, q: 0.5 } };
  const fmtBytes = (n) => (n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB');
  const load = (src) => new Promise((res, rej) => { if ([...document.scripts].some((s) => s.src === src)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); });
  const css = document.createElement('style');
  css.textContent = `.pc-level{display:block;cursor:pointer;padding:1.1rem;border-radius:1.25rem;border:2px solid #e2e8f0;background:#fff;transition:all .15s}.dark .pc-level{background:#0f172a;border-color:#1e293b}
  .pc-level b{display:block;color:#0f172a}.dark .pc-level b{color:#fff}.pc-level span{display:block;margin-top:.3rem;font-size:.8rem;color:#64748b}
  .pc-level:has(input:checked){border-color:#e11d48;box-shadow:0 10px 24px -14px rgba(225,29,72,.7)}`;
  document.head.prepend(css);

  let file = null, outUrl = null, workerUrl = null;
  function pick(f) {
    if (!f) return;
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { alert('Please choose a PDF file.'); return; }
    file = f; $('pc-fname').textContent = `${f.name} · ${fmtBytes(f.size)}`; $('pc-go').disabled = false;
    $('pc-result').classList.add('hidden');
  }
  const progress = (step, frac) => { $('pc-progress').classList.remove('hidden'); $('pc-step').textContent = step; const p = Math.round(frac * 100); $('pc-pct').textContent = p + '%'; $('pc-bar').style.width = p + '%'; };

  async function compress() {
    if (!file) return;
    const level = document.querySelector('input[name="pc-level"]:checked').value;
    $('pc-go').disabled = true; $('pc-result').classList.add('hidden');
    try {
      progress('Loading PDF tools…', 0.02);
      await load(LIBS.pdflib);
      const bytes = new Uint8Array(await file.arrayBuffer());
      let out;
      if (level === 'light') {
        progress('Optimising…', 0.4);
        const doc = await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
        doc.setProducer('SmartNTech PDF Compressor'); doc.setCreator('SmartNTech');
        out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
        progress('Finishing…', 0.95);
      } else {
        await load(LIBS.pdfjs);
        // Browsers refuse to start a worker straight from another site, and pdf.js would then fall back to
        // doing all the work on the page (freezing it). Loading the worker code into a same-origin blob fixes that.
        if (!workerUrl) {
          progress('Loading PDF tools…', 0.04);
          const code = await (await fetch(LIBS.worker)).text();
          workerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const src = await window.pdfjsLib.getDocument({ data: bytes.slice() }).promise;
        const { dpi, q } = LEVELS[level];
        const doc = await window.PDFLib.PDFDocument.create();
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        for (let i = 1; i <= src.numPages; i++) {
          progress(`Compressing page ${i} of ${src.numPages}…`, 0.05 + 0.9 * ((i - 1) / src.numPages));
          const page = await src.getPage(i);
          const base = page.getViewport({ scale: 1 }); // PDF points (1/72 inch)
          const vp = page.getViewport({ scale: dpi / 72 });
          canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          // intent 'print' renders without requestAnimationFrame, which browsers pause when the tab is hidden
          // (e.g. the user switches apps while a long PDF is being compressed).
          await page.render({ canvasContext: ctx, viewport: vp, intent: 'print' }).promise;
          const jpg = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q));
          const img = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
          const p = doc.addPage([base.width, base.height]);
          p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
          page.cleanup();
          await new Promise((r) => setTimeout(r, 0)); // let the page repaint the progress bar
        }
        doc.setProducer('SmartNTech PDF Compressor'); doc.setTitle(file.name.replace(/\.pdf$/i, ''));
        progress('Saving…', 0.97);
        out = await doc.save({ useObjectStreams: true });
      }
      let blob = new Blob([out], { type: 'application/pdf' }), note = '';
      // Text-only PDFs can get BIGGER when pages become images. Never hand back a bigger file:
      // try the light (text-keeping) method instead, and if nothing is smaller, keep the original.
      if (blob.size >= file.size && level !== 'light') {
        progress('Trying a better method for this PDF…', 0.98);
        try {
          const light = await (await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })).save({ useObjectStreams: true, addDefaultPage: false });
          if (light.length < blob.size) { blob = new Blob([light], { type: 'application/pdf' }); note = ' (used the Light method: it worked better for this PDF)'; }
        } catch { /* keep what we have */ }
      }
      let pct = Math.round((1 - blob.size / file.size) * 100);
      if (blob.size >= file.size) { blob = file; pct = 0; }
      progress('Done', 1);
      if (outUrl) URL.revokeObjectURL(outUrl);
      outUrl = URL.createObjectURL(blob);
      $('pc-before').textContent = fmtBytes(file.size); $('pc-after').textContent = fmtBytes(blob.size);
      $('pc-saved').textContent = pct > 0 ? `${pct}% smaller${note}` : 'This PDF is already as small as it can get (it is mostly text), so your original file is kept. Compression helps most with scanned pages and photos.';
      $('pc-dl').href = outUrl; $('pc-dl').download = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
      $('pc-result').classList.remove('hidden');
    } catch (e) {
      $('pc-step').textContent = /password|encrypt/i.test(e.message) ? 'This PDF is password-protected. Remove the password first.' : 'Could not compress this PDF: ' + e.message;
    }
    $('pc-go').disabled = false;
  }

  $('pc-file').addEventListener('change', (e) => pick(e.target.files[0]));
  const drop = $('pc-drop');
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('border-rose-500'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('border-rose-500'); }));
  drop.addEventListener('drop', (e) => pick(e.dataTransfer.files[0]));
  $('pc-go').addEventListener('click', compress);
})();
