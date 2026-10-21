// Dalešice – vizualizace ke schválení (statická stránka, GitHub Pages). Volby jen v prohlížeči, odeslání e-mailem.
const TOPICS = [
  { id: 'z17', title: 'Dům se zahradou', eyebrow: 'ZÁBĚR 17 · MALÝ DŮM SO02',
    description: 'Malý dům vlevo od vjezdu, rovný vjezd ke stání vedle domu, branka ke vchodu, ploty k sousedům i dozadu. Barevnost: varianta 1 Kašmírová.',
    options: [{ id: 'A', label: 'Varianta A · plot u silnice' }, { id: 'B', label: 'Varianta B · předzahrádka, plot v úrovni fasády' }],
    before: 'Výchozí záběr', img: o => `img/z17-${o}` },
  { id: 'z61', title: 'Druhý dům se zahradou', eyebrow: 'ZÁBĚR 61 · VELKÝ DŮM SO01',
    description: 'Velký dům pro kontrast, rovný vjezd ke stání vedle domu, sousední zahrady s ploty. Barevnost: varianta 8 Hřejivá vínová.',
    options: [{ id: 'A', label: 'Varianta A · lamelový plot u chodníku' }, { id: 'B', label: 'Varianta B · předzahrádka, brány v úrovni fasády' }],
    before: 'Výchozí záběr', img: o => `img/z61-${o}` },
  { id: 'v01', title: 'Zahrady · barevnost domů', eyebrow: 'CELKOVÝ POHLED · DOMY 17–22',
    description: 'Domy, které prodáváte, v barevných variantách architekta (bez modré a zelené ve verzích A a B), mírně posunuté cik-cak ±0,5 m. Parcely na pravé straně jako bílá hmota.',
    options: [{ id: 'A', label: 'Verze A · teplá paleta' }, { id: 'B', label: 'Verze B · světlá paleta' }, { id: 'C', label: 'Verze C · i s modrou a zelenou' }],
    before: 'Původní verze', img: o => `img/v01-${o}` },
];
const MAIL = 'honza@frantisekdron.cz';
const KEY = 'dalesice-vyjadreni-20261021';
const byId = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const state = { opt: {}, before: {}, picks: {}, cards: {} };
function load() { try { state.picks = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { state.picks = {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state.picks)); } catch { /* bez úložiště stránka funguje dál */ } }
const V = "?v=3"; const src = (t, w) => `${t.img(state.before[t.id] ? "start" : state.opt[t.id])}-${w}.jpg${V}`;
const optLabel = (t, id) => t.options.find(o => o.id === id)?.label || '';

function openLightbox(href, alt) {
  const prev = document.activeElement;
  const overlay = el('div', 'lightbox-backdrop'); const box = el('div', 'lightbox');
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', alt);
  const close = el('button', 'lightbox-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Zavřít zvětšený náhled');
  const img = document.createElement('img'); img.src = href; img.alt = alt;
  box.append(close, img); overlay.append(box); document.body.append(overlay);
  const finish = () => { overlay.remove(); document.removeEventListener('keydown', onKey); prev?.focus({ preventScroll: true }); };
  const onKey = e => { if (e.key === 'Escape') finish(); };
  close.addEventListener('click', finish); overlay.addEventListener('click', e => { if (e.target === overlay) finish(); });
  document.addEventListener('keydown', onKey); close.focus();
}
function buildCard(t) {
  const card = el('article', 'final-card'); card.id = `zaber-${t.id}`;
  const head = el('div', 'final-head'); const h = el('div');
  h.append(el('span', 'eyebrow', t.eyebrow), el('h3', 'final-title', t.title));
  const status = el('span', 'final-status'); head.append(h, status);
  const tabs = el('div', 'final-views'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', `Varianty · ${t.title}`);
  const optButtons = t.options.map(o => {
    const b = el('button', 'final-view', o.label); b.type = 'button';
    b.addEventListener('click', () => { state.opt[t.id] = o.id; state.before[t.id] = false; update(t); });
    tabs.append(b); return [o.id, b];
  });
  const fig = el('figure', 'final-figure');
  const open = el('button', 'image-open final-open'); open.type = 'button';
  const stage = el('span', 'image-stage'); const img = document.createElement('img'); img.decoding = 'async'; img.loading = 'lazy';
  stage.append(img); open.append(stage, el('span', 'zoom-label', 'Zvětšit'));
  open.addEventListener('click', () => openLightbox(src(t, 2400), img.alt));
  const ba = el('div', 'before-after'); ba.setAttribute('role', 'group'); ba.setAttribute('aria-label', 'Návrh nebo výchozí stav');
  const bA = el('button', '', 'Návrh'); bA.type = 'button'; const bB = el('button', '', t.before); bB.type = 'button';
  bA.addEventListener('click', () => { state.before[t.id] = false; update(t); });
  bB.addEventListener('click', () => { state.before[t.id] = true; update(t); });
  ba.append(bA, bB); const cap = el('figcaption', 'final-caption'); fig.append(open, ba, cap);
  const box = el('div', 'approval');
  const label = el('label', 'approval-label', 'Poznámka · co případně upravit'); label.htmlFor = `note-${t.id}`;
  const note = document.createElement('textarea'); note.id = `note-${t.id}`; note.maxLength = 1000; note.rows = 3; note.placeholder = 'Např. jiný plot, jiná barva fasády…';
  note.value = state.picks[t.id]?.note || '';
  const actions = el('div', 'approval-actions');
  const pickButtons = t.options.map(o => {
    const b = el('button', 'primary', `Vybírám ${o.id}`); b.type = 'button';
    b.addEventListener('click', () => setPick(t, o.id)); actions.append(b); return [o.id, b];
  });
  const change = el('button', 'secondary', 'Požaduji úpravu'); change.type = 'button'; actions.append(change);
  const msg = el('p', 'fineprint approval-msg'); msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
  change.addEventListener('click', () => {
    if (!note.value.trim()) { msg.textContent = 'Napište prosím do poznámky, co upravit.'; msg.classList.add('error'); note.focus(); return; }
    setPick(t, 'zmena');
  });
  note.addEventListener('input', () => { if (state.picks[t.id]) { state.picks[t.id].note = note.value.trim(); save(); updateSummary(); } });
  const clear = el('button', 'text-button approval-clear', 'Zrušit moje vyjádření'); clear.type = 'button';
  clear.addEventListener('click', () => { delete state.picks[t.id]; note.value = ''; save(); msg.textContent = 'Vyjádření je zrušené.'; update(t); updateSummary(); });
  box.append(label, note, actions, clear, msg);
  card.append(head, el('p', 'final-desc', t.description), tabs, fig, box);
  state.cards[t.id] = { card, status, optButtons, pickButtons, img, bA, bB, cap, change, clear, msg, note };
  return card;
}
function setPick(t, pick) {
  const c = state.cards[t.id];
  state.picks[t.id] = { pick, note: c.note.value.trim(), at: new Date().toISOString() }; save();
  c.msg.classList.remove('error');
  c.msg.textContent = pick === 'zmena' ? 'Požadavek na úpravu je připravený. Nezapomeňte vyjádření dole odeslat.' : `Vybráno: ${optLabel(t, pick)}. Nezapomeňte vyjádření dole odeslat.`;
  if (pick !== 'zmena') state.opt[t.id] = pick;
  update(t); updateSummary();
}
function update(t) {
  const c = state.cards[t.id]; const before = Boolean(state.before[t.id]); const o = state.opt[t.id];
  c.optButtons.forEach(([id, b]) => b.setAttribute('aria-pressed', String(!before && id === o)));
  c.img.src = src(t, 1200); c.img.srcset = `${src(t, 1200)} 1200w, ${src(t, 2400)} 2400w`; c.img.sizes = '(max-width: 700px) 100vw, 1080px';
  c.img.alt = `${t.title} · ${before ? t.before : optLabel(t, o)}`;
  c.bA.setAttribute('aria-pressed', String(!before)); c.bB.setAttribute('aria-pressed', String(before));
  c.cap.textContent = before ? t.before : optLabel(t, o);
  const p = state.picks[t.id];
  c.card.classList.toggle('is-approved', !!p && p.pick !== 'zmena'); c.card.classList.toggle('is-change', p?.pick === 'zmena');
  c.status.textContent = !p ? 'Čeká na vaše vyjádření' : p.pick === 'zmena' ? 'Požadována úprava' : `✓ Vybráno ${p.pick}`;
  c.pickButtons.forEach(([id, b]) => b.textContent = p?.pick === id ? `✓ Vybráno ${id}` : `Vybírám ${id}`);
  c.change.textContent = p?.pick === 'zmena' ? 'Upravit požadavek' : 'Požaduji úpravu';
  c.clear.hidden = !p;
}
function messageText() {
  const lines = ['Nad břehy Dalešic – vyjádření k upraveným vizualizacím:'];
  for (const t of TOPICS) {
    const p = state.picks[t.id];
    lines.push(`• ${t.title}: ${!p ? 'zatím bez vyjádření' : p.pick === 'zmena' ? 'PROSÍM UPRAVIT' : 'VYBÍRÁM – ' + optLabel(t, p.pick)}${p?.note ? ' – ' + p.note : ''}`);
  }
  return lines.join('\n');
}
function updateSummary() {
  const n = TOPICS.filter(t => state.picks[t.id] && state.picks[t.id].pick !== 'zmena').length;
  const z = TOPICS.filter(t => state.picks[t.id]?.pick === 'zmena').length;
  const root = byId('final-summary'); root.replaceChildren();
  const links = el('span', 'final-jump');
  TOPICS.forEach((t, i) => { const p = state.picks[t.id]; const a = el('a', !p ? '' : p.pick === 'zmena' ? 'change' : 'done', String(i + 1)); a.href = `#zaber-${t.id}`; a.title = t.title; links.append(a); });
  root.append(el('span', '', `Vybráno ${n} ze ${TOPICS.length}` + (z ? ` · úprava u ${z}` : '')), links);
  root.classList.toggle('all-done', n === TOPICS.length);
  const text = messageText(); byId('send-preview').textContent = text;
  byId('send-mail').href = `mailto:${MAIL}?subject=${encodeURIComponent('Nad břehy Dalešic – vyjádření k vizualizacím')}&body=${encodeURIComponent(text)}`;
}
async function copy() {
  const text = messageText(); const m = byId('send-msg');
  try { await navigator.clipboard.writeText(text); m.textContent = 'Text je zkopírovaný. Vložte ho prosím do e-mailu, který si píšeme.'; }
  catch { const r = document.createRange(); r.selectNodeContents(byId('send-preview')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); m.textContent = 'Text je označený – zkopírujte ho prosím a pošlete nám ho e-mailem.'; }
}
function init() {
  load();
  const list = byId('final-list');
  for (const t of TOPICS) { const p = state.picks[t.id]; state.opt[t.id] = p && p.pick !== 'zmena' ? p.pick : t.options[0].id; list.append(buildCard(t)); update(t); }
  updateSummary();
  byId('send-copy').addEventListener('click', copy);
}
init();
