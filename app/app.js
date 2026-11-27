// DealOrDud — renders the checked deals, the spotlight, the finder with its
// search and filters, the mirage watch and one page per deal.
import { DEALS, VERDICTS, CATEGORIES, STORES, CHECKED } from './deals.js';

const $ = (id) => document.getElementById(id);
const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const pct = (d) => Math.round((1 - d.price / d.was) * 100);
const VRANK = { record: 0, strong: 1, solid: 2, modest: 3, mirage: 4 };

function stamp(d) {
  return `<span class="stamp v-${d.verdict}">${VERDICTS[d.verdict].label}</span>`;
}

function card(d) {
  const off = pct(d);
  const unit = d.unit ?? '';
  return `<article class="card">
    <div class="top"><span class="store-chip">${d.store}</span>${stamp(d)}</div>
    <span class="cat">${d.cat}</span>
    <h3><a href="#/deal/${d.id}">${d.name}</a></h3>
    <p class="blurb">${d.blurb}</p>
    <div class="price-row"><span class="price">${money(d.price)}<small>${unit}</small></span>
      <span class="was">${money(d.was)}${unit}</span><span class="off">−${off}%</span></div>
    ${d.verdict === 'mirage'
      ? '<span class="save" style="color:var(--red)">No honest saving figure — the “was” price is a reference value</span>'
      : `<span class="save">You save ${money(d.was - d.price)}${unit ? ' every month' : ''}</span>`}
    <p class="evidence">${d.evidence}</p>
    <p class="meta">Checked <b>${CHECKED}</b><br>Price read via ${d.source}</p>
    <span><a class="store-link" href="${d.link}" target="_blank" rel="noopener">See it at ${d.store} →</a></span>
  </article>`;
}

/* ---------- stats + spotlight ---------- */
function renderStats() {
  const stores = new Set(DEALS.map((d) => d.store)).size;
  const records = DEALS.filter((d) => d.verdict === 'record').length;
  const avg = Math.round(DEALS.reduce((s, d) => s + pct(d), 0) / DEALS.length);
  const saved = DEALS.reduce((s, d) => s + (d.was - d.price), 0);
  $('stats').innerHTML = [
    [DEALS.length, 'deals checked'], [stores, 'stores'], [records, 'record lows'],
    [`${avg}%`, 'average cut'], [`$${Math.round(saved).toLocaleString('en-US')}`, 'total savings on the page'],
  ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');
  $('checked-stamp').textContent = `PRICES CHECKED ${CHECKED}`;
  $('method-checked').textContent = CHECKED;
  $('foot-checked').textContent = CHECKED;
}

function renderSpotlight() {
  const top = DEALS.filter((d) => d.verdict === 'record').sort((a, b) => pct(b) - pct(a)).slice(0, 3);
  $('spotlight').innerHTML = top.map((d) => `<div class="spot">
    <div class="pct">−${pct(d)}%</div>
    <h3>${d.name}</h3>
    <p>${d.evidence}</p>
    <div class="prices">Now <b>${money(d.price)}${d.unit ?? ''}</b> at ${d.store} · was ${money(d.was)}${d.unit ?? ''}</div>
    <a href="#/deal/${d.id}">Why it earns the stamp →</a>
  </div>`).join('');
}

/* ---------- finder ---------- */
const state = { q: '', cat: 'All', store: 'All stores', disc: 0, verdict: '', sort: 'pct' };

function matches(d) {
  if (state.cat !== 'All' && d.cat !== state.cat) return false;
  if (state.store !== 'All stores' && d.store !== state.store) return false;
  if (pct(d) < state.disc) return false;
  if (state.verdict === 'record' && d.verdict !== 'record') return false;
  if (state.verdict === 'strong' && !(d.verdict === 'record' || d.verdict === 'strong')) return false;
  if (state.verdict === 'mirage' && d.verdict !== 'mirage' && d.verdict !== 'modest') return false;
  if (state.q) {
    const hay = `${d.name} ${d.store} ${d.cat} ${d.blurb}`.toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}

function renderGrid() {
  const list = DEALS.filter(matches);
  const by = {
    pct: (a, b) => pct(b) - pct(a),
    save: (a, b) => (b.was - b.price) - (a.was - a.price),
    price: (a, b) => a.price - b.price,
    verdict: (a, b) => VRANK[a.verdict] - VRANK[b.verdict] || pct(b) - pct(a),
  }[state.sort];
  list.sort(by);
  $('grid').innerHTML = list.map(card).join('');
  $('empty').hidden = list.length > 0;
  $('result-count').textContent = `Showing ${list.length} of ${DEALS.length} checked deals — every card carries its check time and the source its price was read from.`;
}

function renderMirage() {
  const list = DEALS.filter((d) => d.verdict === 'mirage' || d.verdict === 'modest');
  $('mirage-grid').innerHTML = list.map(card).join('');
}

function wireFinder() {
  $('cat-chips').innerHTML = CATEGORIES.map((c) =>
    `<button class="chip" data-cat="${c}" aria-pressed="${c === 'All'}">${c}</button>`).join('');
  $('f-store').innerHTML = STORES.map((s) => `<option>${s}</option>`).join('');
  $('cat-chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.dataset.cat;
    for (const el of $('cat-chips').children) el.setAttribute('aria-pressed', String(el === b));
    renderGrid();
  });
  $('q').addEventListener('input', () => { state.q = $('q').value; renderGrid(); });
  $('f-store').addEventListener('change', () => { state.store = $('f-store').value; renderGrid(); });
  $('f-disc').addEventListener('change', () => { state.disc = Number($('f-disc').value); renderGrid(); });
  $('f-verdict').addEventListener('change', () => { state.verdict = $('f-verdict').value; renderGrid(); });
  $('f-sort').addEventListener('change', () => { state.sort = $('f-sort').value; renderGrid(); });
}

/* ---------- deal detail ---------- */
function renderDeal(id) {
  const d = DEALS.find((x) => x.id === id);
  const el = $('view-deal');
  if (!d) { el.innerHTML = `<p class="empty">No such deal. <a href="#/">Back to the deals</a></p>`; return; }
  const v = VERDICTS[d.verdict];
  el.innerHTML = `<article class="detail">
    <div class="top"><span class="store-chip">${d.store}</span>${stamp(d)}</div>
    <h2>${d.name}</h2>
    <p class="blurb">${d.blurb}</p>
    <div class="price-row"><span class="price">${money(d.price)}<small>${d.unit ?? ''}</small></span>
      <span class="was">${money(d.was)}${d.unit ?? ''}</span><span class="off">−${pct(d)}%</span>
      ${d.verdict === 'mirage'
        ? '<span class="save" style="color:var(--red)">No honest saving figure — the “was” price is a reference value</span>'
        : `<span class="save">You save ${money(d.was - d.price)}${d.unit ? ' every month' : ''}</span>`}</div>
    <div class="detail-grid">
      <div><h3>Why this verdict — ${v.label}</h3>
        <p>${d.evidence}</p><p>${v.note}</p>
        <p><a class="store-link" href="${d.link}" target="_blank" rel="noopener">See it at ${d.store} →</a></p></div>
      <div><h3>The check</h3>
        <p>Price checked <b>${CHECKED}</b>.<br>Read via <b>${d.source}</b>.<br>
        Category: ${d.cat} · Store: ${d.store}.<br>
        Black Friday prices move by the hour — if the store shows a different number now, that number is the live one.</p></div>
    </div>
    <a class="back" href="#/">← All deals</a>
  </article>`;
}

/* ---------- router ---------- */
function route() {
  const hash = location.hash || '#/';
  const views = { home: $('view-home'), deal: $('view-deal'), mirage: $('view-mirage'), method: $('view-method') };
  for (const el of Object.values(views)) el.hidden = true;
  if (hash.startsWith('#/deal/')) { renderDeal(hash.slice(7)); views.deal.hidden = false; }
  else if (hash === '#/mirage') { views.mirage.hidden = false; }
  else if (hash === '#/method') { views.method.hidden = false; }
  else { views.home.hidden = false; }
  window.scrollTo(0, 0);
}

renderStats();
renderSpotlight();
wireFinder();
renderGrid();
renderMirage();
window.addEventListener('hashchange', route);
route();
