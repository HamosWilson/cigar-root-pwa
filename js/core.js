/* Hamos 的烟草生活 — storage, domain helpers, charts and XLSX writer.
   Two boards: cigars ('cigar') and pipe tobacco ('pipe'). */
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const KEY = 'cigarrow.v1';
  const VERSION = 5;

  const DEFAULT_SETTINGS = {
    theme: 'light',
    zoom: 100,
    accent: '#a05a2c',
    currency: 'CNY',
    rates: { CNY: 1, USD: 6.67, EUR: 7.47 },
    ratesUpdated: '2026-10-23',
    grain: true,
    motion: true,
    enrich: { enabled: false, endpoint: '', token: '', timeout: 15000 }
  };

  const CURRENCIES = [
    { code: 'CNY', symbol: '¥', label: '人民币' },
    { code: 'USD', symbol: '$', label: '美元' },
    { code: 'EUR', symbol: '€', label: '欧元' }
  ];

  const SERIES = ['#b4655c', '#c08356', '#7f9271', '#5f8a86', '#7e7fa3', '#b99a5e', '#a76f5e', '#6f8f7c', '#8f7f9f', '#9a9a63', '#a58a72', '#6d8a9a'];

  let DB = null;

  /* ------------------------------------------------------------------ utils */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const normKind = (k) => (k === 'pipe' ? 'pipe' : 'cigar');

  function uid(prefix) {
    return (prefix || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function todayISO() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  function parseDate(iso) {
    if (!iso) return null;
    const parts = String(iso).slice(0, 10).split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function daysSince(iso) {
    const d = parseDate(iso);
    if (!d) return 0;
    const t = new Date();
    const a = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return Math.max(0, Math.round((a - d) / 86400000));
  }

  function fmtDate(iso, style) {
    const d = parseDate(iso);
    if (!d) return '—';
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    if (style === 'md') return m + '月' + day + '日';
    if (style === 'long') return y + '年' + m + '月' + day + '日';
    if (style === 'dot') return y + '.' + String(m).padStart(2, '0') + '.' + String(day).padStart(2, '0');
    if (style === 'ym') return y + '.' + String(m).padStart(2, '0');
    return y + '-' + String(m).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }

  function monthKey(iso) {
    return String(iso || '').slice(0, 7);
  }

  function monthLabel(key) {
    const p = String(key).split('-');
    return p.length === 2 ? Number(p[1]) + '月' : key;
  }

  function fmtNum(n, digits) {
    const d = digits == null ? 0 : digits;
    return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function money(cny, opt) {
    const s = (DB && DB.settings) || DEFAULT_SETTINGS;
    const code = (opt && opt.code) || s.currency || 'CNY';
    const rate = Number(s.rates && s.rates[code]) || 1;
    const v = Number(cny || 0) / rate;
    const cur = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    let digits = 2;
    if (!(opt && opt.round === false) && code === 'CNY') digits = Math.abs(v % 1) < 0.005 ? 0 : 2;
    return cur.symbol + fmtNum(v, digits);
  }

  function moneyRaw(cny) {
    const s = (DB && DB.settings) || DEFAULT_SETTINGS;
    const code = s.currency || 'CNY';
    const rate = Number(s.rates && s.rates[code]) || 1;
    return { symbol: (CURRENCIES.find((c) => c.code === code) || CURRENCIES[0]).symbol, value: Number(cny || 0) / rate, code };
  }

  /* --------------------------------------------------------------- storage */
  function seedDB() {
    const now = new Date().toISOString();
    return {
      meta: { version: VERSION, createdAt: now, updatedAt: now, seeded: true },
      settings: clone(DEFAULT_SETTINGS),
      cigars: clone(root.SEED.cigars || []),
      records: clone(root.SEED.records || []),
      pipes: clone(root.SEED.pipes || []),
      pipeRecords: clone(root.SEED.pipeRecords || []),
      smokingPipes: [],
      wiki: [],
      tags: []
    };
  }

  function normalize(d) {
    const db = d && typeof d === 'object' ? d : {};
    db.meta = Object.assign({ version: VERSION, createdAt: new Date().toISOString() }, db.meta || {});
    db.settings = Object.assign(clone(DEFAULT_SETTINGS), db.settings || {});
    db.settings.rates = Object.assign(clone(DEFAULT_SETTINGS.rates), (db.settings && db.settings.rates) || {});
    db.settings.enrich = Object.assign(clone(DEFAULT_SETTINGS.enrich), (db.settings && db.settings.enrich) || {});
    db.settings.zoom = clamp(Number(db.settings.zoom) || 100, 50, 200);
    if (!Array.isArray(db.cigars)) db.cigars = [];
    if (!Array.isArray(db.records)) db.records = [];
    if (!Array.isArray(db.pipes)) db.pipes = clone(root.SEED.pipes || []);
    if (!Array.isArray(db.pipeRecords)) db.pipeRecords = clone(root.SEED.pipeRecords || []);
    if (!Array.isArray(db.smokingPipes)) db.smokingPipes = [];
    if (!Array.isArray(db.wiki)) db.wiki = [];
    if (!Array.isArray(db.tags)) db.tags = [];

    db.cigars.forEach((c) => {
      c.id = c.id || uid('c');
      c.qty = Number(c.qty) || 0;
      c.price = Number(c.price) || 0;
      c.rating = Number(c.rating) || 0;
      c.flavors = Array.isArray(c.flavors) ? c.flavors : [];
      c.length = Number(c.length) || 0;
      c.ring = Number(c.ring) || 0;
      c.resting = !!c.resting;
    });
    db.records.forEach((r) => {
      r.id = r.id || uid('r');
      r.flavors = Array.isArray(r.flavors) ? r.flavors : [];
      r.rating = Number(r.rating) || 0;
      r.minutes = Number(r.minutes) || 0;
    });
    db.pipes.forEach((p) => {
      p.id = p.id || uid('p');
      p.qty = Number(p.qty) || 0;
      p.price = Number(p.price) || 0;
      p.rating = Number(p.rating) || 0;
      p.weight = Number(p.weight) || 50;
      p.strength = Number(p.strength) || 3;
      p.roomNote = Number(p.roomNote) || 3;
      p.bowls = Number(p.bowls) || 0;
      p.flavors = Array.isArray(p.flavors) ? p.flavors : [];
      p.components = Array.isArray(p.components) ? p.components : [];
      p.cellaring = !!p.cellaring;
      p.description = String(p.description || '');
      p.metaSource = p.metaSource && typeof p.metaSource === 'object' ? p.metaSource : null;
    });
    db.pipeRecords.forEach((r) => {
      r.id = r.id || uid('pr');
      r.flavors = Array.isArray(r.flavors) ? r.flavors : [];
      r.rating = Number(r.rating) || 0;
      r.minutes = Number(r.minutes) || 0;
      r.relights = Number(r.relights) || 0;
    });
    db.smokingPipes.forEach((p) => {
      p.id = p.id || uid('sp');
      p.name = String(p.name || '').trim();
      p.maker = String(p.maker || '').trim();
      p.shape = String(p.shape || '直斗');
      p.material = String(p.material || '石楠木');
      p.stem = String(p.stem || '');
      p.length = Number(p.length) || 0;
      p.weight = Number(p.weight) || 0;
      p.bowlDepth = Number(p.bowlDepth) || 0;
      p.chamber = Number(p.chamber) || 0;
      p.price = Number(p.price) || 0;
      p.rating = Number(p.rating) || 0;
      p.favorite = !!p.favorite;
      p.acquired = p.acquired || '';
      p.notes = String(p.notes || '');
      p.photo = typeof p.photo === 'string' && /^data:image\//.test(p.photo) ? p.photo : '';
    });
    db.wiki.forEach((w) => {
      w.kind = w.kind === 'pipe' ? 'pipe' : 'cigar';
    });
    db.meta.version = VERSION;
    return db;
  }

  function loadDB() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.cigars)) return normalize(parsed);
      }
    } catch (e) { /* bad json / private mode */ }
    const fresh = seedDB();
    try { root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) {}
    return fresh;
  }

  function initDB() {
    if (!DB) DB = loadDB();
    return DB;
  }

  function saveDB() {
    if (!DB) return false;
    DB.meta = DB.meta || {};
    DB.meta.updatedAt = new Date().toISOString();
    try {
      root.localStorage.setItem(KEY, JSON.stringify(DB));
      return true;
    } catch (e) {
      return false;
    }
  }

  function storageBytes() {
    try { return new Blob([JSON.stringify(DB || {})]).size; } catch (e) { return JSON.stringify(DB || {}).length; }
  }

  /* ---------------------------------------------------------------- domain */
  function items(kind) {
    initDB();
    return normKind(kind) === 'pipe' ? DB.pipes : DB.cigars;
  }

  function records(kind) {
    initDB();
    return normKind(kind) === 'pipe' ? DB.pipeRecords : DB.records;
  }

  function statusOf(item, kind) {
    if (!item || Number(item.qty) <= 0) return 'empty';
    if (normKind(kind) === 'pipe') return item.cellaring ? 'aging' : 'ready';
    return item.resting ? 'aging' : 'ready';
  }

  const STATUS = {
    ready: { label: '在柜', cls: 'ready' },
    aging: { label: '养护中', cls: 'aging' },
    empty: { label: '已空', cls: 'empty' }
  };

  function agingLabel(kind) {
    return normKind(kind) === 'pipe' ? '陈化中' : '养护中';
  }

  function unitOf(kind) {
    return normKind(kind) === 'pipe' ? '罐' : '支';
  }

  function paletteFor(brand) {
    const list = root.PALETTES || [{ tint: '#b4655c', ink: '#8a453c' }];
    let h = 0;
    const s = String(brand || '');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  }

  function pipeTypePalette(type) {
    const map = root.PIPE_TYPE_PALETTES || {};
    return map[type] || map['其他'] || { tint: '#e4e1da', ink: '#7a756b' };
  }

  function wrapperTone(type) {
    const W = root.WRAPPERS || {};
    return W[type] || W.habano || { body: '#7a4d2a', edge: '#5d3820' };
  }

  function cigarArt(c, cls) {
    const tone = wrapperTone(c && c.wrapperType);
    const gid = 'cg-' + esc(c && c.id || uid('a'));
    const band = (paletteFor(c && c.brand)).ink;
    return '<svg class="' + (cls || 'cigar-art') + '" viewBox="0 0 132 34" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + tone.body + '"/><stop offset=".45" stop-color="' + tone.edge + '"/><stop offset="1" stop-color="' + tone.body + '"/>' +
      '</linearGradient></defs>' +
      '<g transform="rotate(-6 66 17)">' +
      '<rect x="6" y="10" width="106" height="14" rx="7" fill="url(#' + gid + ')"/>' +
      '<rect x="6" y="10" width="106" height="14" rx="7" fill="none" stroke="rgba(255,255,255,.18)"/>' +
      '<rect x="78" y="10" width="22" height="14" fill="' + band + '" opacity=".92"/>' +
      '<rect x="78" y="10" width="22" height="14" fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>' +
      '<rect x="82" y="12.5" width="14" height="9" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>' +
      '<ellipse cx="112" cy="17" rx="4.5" ry="7" fill="#2c2016"/>' +
      '<ellipse cx="114" cy="17" rx="2.2" ry="4.4" fill="#c96a35"/>' +
      '<circle cx="115" cy="17" r="1.1" fill="#f2b26a"/>' +
      '</g></svg>';
  }

  function pipeArt(p, cls) {
    const tint = paletteFor(p && p.brand).ink;
    return '<svg class="' + (cls || 'pipe-art') + '" viewBox="0 0 132 40" aria-hidden="true">' +
      '<g fill="none" stroke="' + tint + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85">' +
      '<path d="M31 10h17a9 9 0 0 1 9 9v5a9 9 0 0 1-9 9H31a9 9 0 0 1-9-9v-5a9 9 0 0 1 9-9z"/>' +
      '<path d="M31 12v19"/>' +
      '<path d="M57 20h44c7 0 11 3 15 7"/>' +
      '<path d="M31 10c0-4 3-6 7-6s7 2 7 6"/>' +
      '</g>' +
      '<ellipse cx="33" cy="15" rx="6" ry="2.4" fill="' + tint + '" opacity=".35"/>' +
      '</svg>';
  }

  function stars(rating) {
    const pct = clamp(Number(rating) || 0, 0, 10) / 10 * 100;
    return '<span class="stars" style="--pct:' + pct.toFixed(1) + '%" aria-label="评分 ' + (Number(rating) || 0) + ' / 10">' +
      '<span class="stars-bg">★★★★★</span><span class="stars-fg">★★★★★</span></span>';
  }

  function strengthDots(level) {
    const n = clamp(Number(level) || 0, 0, 5);
    let out = '<span class="strength" title="浓度 ' + n + ' / 5">';
    for (let i = 1; i <= 5; i++) out += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return out + '</span>';
  }

  function allTags() {
    const custom = ((DB && DB.tags) || []).map((t) => ({ id: t.id, zh: t.zh, en: t.en || '', cat: t.cat || 'sweet', custom: true }));
    return (root.LEXICON || []).concat(custom);
  }

  function tag(id) {
    return allTags().find((t) => t.id === id) || { id: id, zh: id, en: '', cat: 'sweet' };
  }

  function tagChip(id, opt) {
    const t = tag(id);
    const cat = (root.LEXICON_CATS || []).find((c) => c.id === t.cat) || { color: '#8a7355' };
    return '<span class="tag' + (opt && opt.small ? ' tag-sm' : '') + '" style="--tc:' + cat.color + '">' +
      '<i></i>' + esc(t.zh) + (t.en ? '<em>' + esc(t.en) + '</em>' : '') + '</span>';
  }

  function tagsHTML(ids, max) {
    return (ids || []).slice(0, max || 3).map((id) => tagChip(id, { small: true })).join('');
  }

  function stats(kind) {
    const k = normKind(kind);
    const stock = items(k).filter((c) => Number(c.qty) > 0);
    let qty = 0, value = 0, rated = 0, ratingSum = 0, bowls = 0;
    stock.forEach((c) => {
      qty += Number(c.qty) || 0;
      value += (Number(c.qty) || 0) * (Number(c.price) || 0);
      if (Number(c.rating) > 0) { rated += Number(c.qty); ratingSum += Number(c.rating) * Number(c.qty); }
      bowls += Number(c.bowls) || 0;
    });
    const aging = stock.filter((c) => statusOf(c, k) === 'aging').length;
    const recs = records(k);
    return {
      kind: k,
      qty: qty,
      kinds: stock.length,
      value: value,
      aging: aging,
      bowls: bowls,
      avgPrice: qty ? value / qty : 0,
      avgRating: rated ? ratingSum / rated : 0,
      lots: items(k).length,
      records: recs.length,
      smoked: recs.length,
      minutes: recs.reduce((a, r) => a + (Number(r.minutes) || 0), 0)
    };
  }

  function uniq(list) {
    return Array.from(new Set(list.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));
  }

  function filterItems(kind, opt) {
    const k = normKind(kind);
    const o = opt || {};
    const q = String(o.q || '').trim().toLowerCase();
    let list = items(k).slice();

    if (q) {
      list = list.filter((c) => {
        const extra = k === 'pipe'
          ? [c.brand, c.blend, c.type, c.cut, c.topping, c.jar, c.notes].concat(c.components || [])
          : [c.brand, c.series, c.origin, c.wrapper, c.vitola, c.shape, c.box, c.notes];
        const hay = extra.concat((c.flavors || []).map((f) => tag(f).zh + ' ' + tag(f).en)).join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    if (o.brand) list = list.filter((c) => c.brand === o.brand);
    if (k === 'cigar') {
      if (o.origin) list = list.filter((c) => c.origin === o.origin);
      if (o.wrapper) list = list.filter((c) => c.wrapper === o.wrapper);
    } else {
      if (o.type) list = list.filter((c) => c.type === o.type);
      if (o.cut) list = list.filter((c) => c.cut === o.cut);
    }
    if (o.status === 'ready' || o.status === 'aging' || o.status === 'empty') {
      list = list.filter((c) => statusOf(c, k) === o.status);
    } else if (o.status === 'low') {
      list = list.filter((c) => Number(c.qty) > 0 && Number(c.qty) <= 1);
    } else if (o.status === 'top') {
      list = list.filter((c) => Number(c.rating) >= 9);
    }
    if (o.flavor) list = list.filter((c) => (c.flavors || []).indexOf(o.flavor) >= 0);

    const sort = o.sort || 'default';
    const by = {
      value: (a, b) => b.qty * b.price - a.qty * a.price,
      rating: (a, b) => b.rating - a.rating,
      qty: (a, b) => a.qty - b.qty,
      brand: (a, b) => String(a.brand).localeCompare(String(b.brand), 'zh-CN'),
      age: (a, b) => monthsAged(b) - monthsAged(a),
      acquired: (a, b) => String(b.acquired).localeCompare(String(a.acquired))
    }[sort];
    if (by) list.sort(by);
    else list.sort((a, b) => {
      const rank = { ready: 0, aging: 1, empty: 2 };
      if (rank[statusOf(a, k)] !== rank[statusOf(b, k)]) return rank[statusOf(a, k)] - rank[statusOf(b, k)];
      return String(b.acquired).localeCompare(String(a.acquired));
    });
    return list;
  }

  function filterCigars(opt) { return filterItems('cigar', opt); }
  function filterPipes(opt) { return filterItems('pipe', opt); }

  function byField(kind, field, limit) {
    const k = normKind(kind);
    const map = new Map();
    items(k).forEach((c) => {
      const key = c[field] || '未标注';
      const q = Number(c.qty) || 0;
      if (q <= 0) return;
      map.set(key, (map.get(key) || 0) + q);
    });
    let arr = Array.from(map, (entry, i) => ({ label: entry[0], value: entry[1], color: SERIES[i % SERIES.length] }))
      .sort((a, b) => b.value - a.value);
    const total = arr.reduce((a, x) => a + x.value, 0);
    const n = limit || 7;
    if (arr.length > n) {
      const rest = arr.slice(n).reduce((a, x) => a + x.value, 0);
      arr = arr.slice(0, n);
      if (rest > 0) arr.push({ label: '其他', value: rest, color: '#b7ab97' });
    }
    return { items: arr, total: total };
  }

  function ratingBuckets(kind) {
    const k = normKind(kind);
    const buckets = [
      { label: '未评', min: -1, max: 0.0001 },
      { label: '<7', min: 0, max: 7 },
      { label: '7', min: 7, max: 8 },
      { label: '8', min: 8, max: 9 },
      { label: '9', min: 9, max: 10 },
      { label: '10', min: 10, max: 99 }
    ];
    const out = buckets.map((b) => ({ label: b.label, value: 0 }));
    items(k).forEach((c) => {
      const q = Number(c.qty) || 0;
      if (q <= 0) return;
      const r = Number(c.rating) || 0;
      let i = 0;
      if (r <= 0) i = 0;
      else if (r < 7) i = 1;
      else if (r < 8) i = 2;
      else if (r < 9) i = 3;
      else if (r < 10) i = 4;
      else i = 5;
      out[i].value += q;
    });
    return out;
  }

  function monthlySpend(kind, n) {
    const k = normKind(kind);
    const count = n || 12;
    const now = new Date();
    const months = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: (d.getMonth() + 1) + '月', value: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));
    items(k).forEach((c) => {
      const key = monthKey(c.acquired || c.tinDate || c.boxDate);
      if (idx.has(key)) months[idx.get(key)].value += (Number(c.qty) || 0) * (Number(c.price) || 0);
    });
    return months;
  }

  function flavorProfile(kind) {
    const k = normKind(kind);
    const cats = root.LEXICON_CATS || [];
    const catOf = new Map(allTags().map((t) => [t.id, t.cat]));
    const counts = cats.map(() => 0);
    items(k).forEach((c) => {
      const q = Number(c.qty) || 0;
      if (q <= 0) return;
      const seen = new Set();
      (c.flavors || []).forEach((f) => {
        const cat = catOf.get(f);
        const i = cats.findIndex((x) => x.id === cat);
        if (i >= 0 && !seen.has(cat)) { counts[i] += q; seen.add(cat); }
      });
    });
    const max = Math.max.apply(null, counts.concat([1]));
    return cats.map((c, i) => ({
      id: c.id, label: c.zh, color: c.color, raw: counts[i],
      value: counts[i] ? Math.round(10 + (counts[i] / max) * 90) : 4
    }));
  }

  function topFlavors(kind, n) {
    const k = normKind(kind);
    const map = new Map();
    items(k).forEach((c) => {
      const q = Number(c.qty) || 0;
      if (q <= 0) return;
      (c.flavors || []).forEach((id) => map.set(id, (map.get(id) || 0) + q));
    });
    return Array.from(map, (entry) => {
      const t = tag(entry[0]);
      return { id: entry[0], zh: t.zh, en: t.en, cat: t.cat, count: entry[1] };
    }).sort((a, b) => b.count - a.count).slice(0, n || 10);
  }

  function monthsAged(item) {
    if (!item) return 0;
    const base = item.tinDate || item.boxDate || (item.acquired ? String(item.acquired).slice(0, 7) : '');
    if (!base) return 0;
    const d = parseDate(base + '-01');
    if (!d) return 0;
    const now = new Date();
    return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
  }

  function reminders(kind) {
    const k = normKind(kind);
    const out = [];
    const stock = items(k).filter((c) => Number(c.qty) > 0);
    const agingKey = k === 'pipe' ? 'cellaring' : 'resting';
    stock.filter((c) => c[agingKey]).sort((a, b) => monthsAged(b) - monthsAged(a)).slice(0, 2).forEach((c) => {
      const name = k === 'pipe' ? c.brand + ' · ' + c.blend : c.brand + ' · ' + c.series;
      const months = monthsAged(c);
      out.push({
        kind: 'aging',
        title: name,
        text: months >= 24
          ? (k === 'pipe' ? '已陈化 ' + months + ' 个月，可以开一罐了' : '已陈化 ' + months + ' 个月，可以试一支了')
          : (k === 'pipe' ? '陈化中 · 已 ' + months + ' 个月' : '静养中 · 已陈化 ' + months + ' 个月'),
        act: k + ':' + c.id
      });
    });
    stock.filter((c) => Number(c.qty) <= 1).slice(0, 2).forEach((c) => out.push({
      kind: 'low',
      title: k === 'pipe' ? c.brand + ' · ' + c.blend : c.brand + ' · ' + c.series,
      text: '仅剩 ' + c.qty + ' ' + unitOf(k) + '，考虑补货',
      act: k + ':' + c.id
    }));
    const rs = records(k).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const last = rs[0];
    if (!last || daysSince(last.date) > 14) {
      out.push({
        kind: 'journal',
        title: '该记一笔了',
        text: last ? '上次品吸在 ' + daysSince(last.date) + ' 天前' : (k === 'pipe' ? '还没有斗草品吸记录' : '还没有品吸记录'),
        act: 'page:records'
      });
    }
    if (!out.length) out.push({ kind: 'ok', title: '一切安好', text: '库存与养护状态都很稳定', act: 'page:inventory' });
    return out.slice(0, 4);
  }

  function recordStats(kind) {
    const k = normKind(kind);
    const rs = records(k);
    const rated = rs.filter((r) => Number(r.rating) > 0);
    const avg = rated.length ? rated.reduce((a, r) => a + Number(r.rating), 0) / rated.length : 0;
    const map = new Map();
    rs.forEach((r) => {
      const key = k === 'pipe' ? r.pipeUsed : r.pairing;
      if (key) map.set(key, (map.get(key) || 0) + 1);
    });
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      count: rs.length,
      avg: avg,
      minutes: rs.reduce((a, r) => a + (Number(r.minutes) || 0), 0),
      pairing: k === 'pipe' ? '—' : (top ? top[0] : '—'),
      tool: k === 'pipe' ? (top ? top[0] : '—') : '—',
      relights: rs.reduce((a, r) => a + (Number(r.relights) || 0), 0),
      best: rated.slice().sort((a, b) => Number(b.rating) - Number(a.rating))[0] || null
    };
  }

  function enrichedRecords(kind) {
    const k = normKind(kind);
    return records(k).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map((r) => {
      const item = items(k).find((x) => x.id === (k === 'pipe' ? r.pipeId : r.cigarId));
      return Object.assign({}, r, {
        item: item || null,
        cigar: k === 'cigar' ? (item || null) : null,
        pipe: k === 'pipe' ? (item || null) : null,
        name: item ? item.brand + ' · ' + (k === 'pipe' ? item.blend : item.series) : '已删除的' + (k === 'pipe' ? '斗草' : '雪茄')
      });
    });
  }

  function wikiCats(kind) {
    return normKind(kind) === 'pipe' ? (root.PIPE_WIKI_CATS || []) : (root.WIKI_CATS || []);
  }

  function wikiAll(kind) {
    const k = normKind(kind);
    const base = k === 'pipe' ? (root.PIPE_WIKI || []) : (root.WIKI || []);
    const custom = (DB.wiki || []).filter((w) => (w.kind || 'cigar') === k);
    return base.concat(custom);
  }

  function wikiCat(kind, id) {
    return wikiCats(kind).find((c) => c.id === id) || { zh: '知识', color: '#73603f', tint: '#efe8dc' };
  }

  function filterWiki(kind, q, cat) {
    const query = String(q || '').trim().toLowerCase();
    return wikiAll(kind).filter((w) => {
      if (cat && cat !== 'all' && w.cat !== cat) return false;
      if (!query) return true;
      return [w.title, w.excerpt, w.body].concat(w.tags || []).join(' ').toLowerCase().indexOf(query) >= 0;
    });
  }

  /* ---------------------------------------------------------------- charts */
  function smoothPath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return 'M' + pts[0][0] + ',' + pts[0][1];
    let d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) + ' ' + c2x.toFixed(2) + ',' + c2y.toFixed(2) + ' ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    }
    return d;
  }

  function donut(items, opt) {
    const o = opt || {};
    const size = o.size || 176;
    const stroke = o.stroke || 21;
    const cx = size / 2, cy = size / 2;
    const r = (size - stroke) / 2 - 3;
    const C = 2 * Math.PI * r;
    const total = items.reduce((a, x) => a + x.value, 0);
    let off = 0;
    let segs = '';
    if (!total) {
      segs = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="' + stroke + '"/>';
    } else {
      segs = items.map((it) => {
        const len = (it.value / total) * C;
        const dash = Math.max(len - 3.5, 0.6);
        const s = '<circle class="dseg" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + it.color + '" stroke-width="' + stroke +
          '" stroke-dasharray="' + dash.toFixed(2) + ' ' + (C - dash).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '">' +
          '<title>' + esc(it.label) + ' · ' + it.value + (o.unit || '') + '</title></circle>';
        off += len;
        return s;
      }).join('');
    }
    return '<div class="donut-wrap" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="0 0 ' + size + ' ' + size + '" class="donut" role="img" aria-label="' + esc(o.label || '分布图') + '">' +
      '<g transform="rotate(-90 ' + cx + ' ' + cy + ')">' + segs + '</g></svg>' +
      '<div class="donut-center"><b>' + (o.centerValue != null ? o.centerValue : fmtNum(total)) + '</b><span>' + esc(o.centerLabel || o.unit || '') + '</span></div>' +
      '</div>';
  }

  function legend(items, opt) {
    const o = opt || {};
    return '<ul class="legend' + (o.compact ? ' compact' : '') + '">' + items.map((it) =>
      '<li title="' + esc(it.label) + '">' +
      '<i style="background:' + it.color + '"></i>' +
      '<span>' + esc(it.label) + '</span>' +
      '<b>' + fmtNum(it.value) + '</b>' +
      '</li>').join('') + '</ul>';
  }

  function sparkline(values, opt) {
    const o = opt || {};
    const w = o.w || 320, h = o.h || 74;
    const pad = 4;
    const max = Math.max.apply(null, values.concat([1]));
    const pts = values.map((v, i) => [pad + (w - pad * 2) * (values.length <= 1 ? 0.5 : i / (values.length - 1)), h - pad - (h - pad * 2) * (v / max)]);
    const line = smoothPath(pts);
    const area = line + 'L' + (w - pad) + ',' + (h - pad) + 'L' + pad + ',' + (h - pad) + 'Z';
    const gid = 'sp' + Math.random().toString(36).slice(2, 8);
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--accent)" stop-opacity=".26"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="' + pts[pts.length - 1][0].toFixed(1) + '" cy="' + pts[pts.length - 1][1].toFixed(1) + '" r="3" fill="var(--accent)"/>' +
      '</svg>';
  }

  function lineChart(points, opt) {
    const o = opt || {};
    const w = o.w || 720, h = o.h || 210;
    const pad = { l: 14, r: 14, t: 18, b: 30 };
    const values = points.map((p) => p.value);
    const max = Math.max.apply(null, values.concat([1])) * 1.18;
    const x = (i) => pad.l + (w - pad.l - pad.r) * (points.length <= 1 ? 0.5 : i / (points.length - 1));
    const y = (v) => h - pad.b - (h - pad.t - pad.b) * (v / max);
    const pts = points.map((p, i) => [x(i), y(p.value)]);
    const line = smoothPath(pts);
    const area = line + 'L' + x(points.length - 1).toFixed(2) + ',' + (h - pad.b) + 'L' + x(0).toFixed(2) + ',' + (h - pad.b) + 'Z';
    const gid = 'lc' + Math.random().toString(36).slice(2, 8);
    let grid = '';
    for (let i = 0; i <= 3; i++) {
      const gy = pad.t + (h - pad.t - pad.b) * (i / 3);
      grid += '<line x1="' + pad.l + '" y1="' + gy + '" x2="' + (w - pad.r) + '" y2="' + gy + '" stroke="var(--line)" stroke-dasharray="' + (i === 3 ? '0' : '3 5') + '" stroke-opacity=".8"/>';
    }
    let dots = '';
    points.forEach((p, i) => {
      if (i % 2 === 0 || i === points.length - 1) {
        dots += '<text x="' + x(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle" class="axis-label">' + esc(p.label) + '</text>';
      }
      dots += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.value).toFixed(1) + '" r="9" fill="transparent"><title>' + esc(p.label) + ' · ' + fmtNum(p.value) + '</title></circle>';
    });
    const last = points[points.length - 1];
    return '<svg class="linechart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || '趋势图') + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--accent)" stop-opacity=".24"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".01"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/>' +
      dots +
      '<circle cx="' + x(points.length - 1).toFixed(1) + '" cy="' + y(last.value).toFixed(1) + '" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>' +
      '</svg>';
  }

  function barChart(itemsIn, opt) {
    const o = opt || {};
    const w = o.w || 420, h = o.h || 190;
    const pad = { l: 8, r: 8, t: 22, b: 28 };
    const max = Math.max.apply(null, itemsIn.map((i) => i.value).concat([1]));
    const slot = (w - pad.l - pad.r) / itemsIn.length;
    const bw = Math.min(30, slot * 0.54);
    let bars = '';
    itemsIn.forEach((it, i) => {
      const cx = pad.l + slot * (i + 0.5);
      const bh = Math.max(3, (h - pad.t - pad.b) * (it.value / max));
      const y = h - pad.b - bh;
      const active = it.value === max && it.value > 0;
      bars += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) +
        '" rx="5" fill="' + (active ? 'var(--accent)' : 'var(--bar)') + '"><title>' + esc(it.label) + ' · ' + it.value + '</title></rect>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" text-anchor="middle" class="bar-value">' + (it.value || '') + '</text>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (h - 9) + '" text-anchor="middle" class="axis-label">' + esc(it.label) + '</text>';
    });
    return '<svg class="barchart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="评分分布">' + bars + '</svg>';
  }

  function radar(itemsIn, opt) {
    const o = opt || {};
    const size = o.size || 330;
    const cx = size / 2, cy = size / 2 + 4;
    const R = size * 0.30;
    const n = itemsIn.length;
    const angle = (i) => -Math.PI / 2 + i * Math.PI * 2 / n;
    const pt = (i, val) => [cx + Math.cos(angle(i)) * R * val / 100, cy + Math.sin(angle(i)) * R * val / 100];
    let rings = '';
    [0.25, 0.5, 0.75, 1].forEach((lv) => {
      const p = itemsIn.map((x, i) => pt(i, lv * 100).map((v) => v.toFixed(1)).join(',')).join(' ');
      rings += '<polygon points="' + p + '" fill="none" stroke="var(--line)" stroke-width="1"/>';
    });
    let axes = '';
    for (let i = 0; i < n; i++) {
      const p = pt(i, 100);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="var(--line)"/>';
    }
    const poly = itemsIn.map((x, i) => pt(i, x.value).map((v) => v.toFixed(1)).join(',')).join(' ');
    let labels = '', dots = '';
    itemsIn.forEach((x, i) => {
      const p = pt(i, 118);
      const c = Math.cos(angle(i));
      const anchor = Math.abs(c) < 0.25 ? 'middle' : c > 0 ? 'start' : 'end';
      labels += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) + '" text-anchor="' + anchor + '" class="radar-label">' + esc(x.label) + '</text>';
      const d = pt(i, x.value);
      dots += '<circle cx="' + d[0].toFixed(1) + '" cy="' + d[1].toFixed(1) + '" r="2.6" fill="var(--accent)"><title>' + esc(x.label) + ' · ' + x.raw + '</title></circle>';
    });
    return '<svg class="radar" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="风味结构">' +
      rings + axes +
      '<polygon points="' + poly + '" fill="var(--accent)" fill-opacity=".17" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round"/>' +
      dots + labels + '</svg>';
  }

  function miniRing(pct, size) {
    const s = size || 58;
    const r = s / 2 - 5;
    const C = 2 * Math.PI * r;
    const v = clamp(pct, 0, 100);
    return '<div class="miniring" style="width:' + s + 'px;height:' + s + 'px">' +
      '<svg viewBox="0 0 ' + s + ' ' + s + '"><circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="4"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C * v / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 ' + s / 2 + ' ' + s / 2 + ')"/></svg>' +
      '<b>' + Math.round(v) + '<i>%</i></b></div>';
  }

  /* ---------------------------------------------------------------- XLSX */
  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function enc(str) {
    return new TextEncoder().encode(str);
  }

  function zipFiles(files) {
    const d = new Date();
    const dosTime = ((d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)) & 0xFFFF;
    const dosDate = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    const locals = [], centrals = [];
    let offset = 0;
    files.forEach((f) => {
      const name = enc(f.name);
      const data = f.data instanceof Uint8Array ? f.data : enc(String(f.data));
      const crc = crc32(data);
      const lh = new Uint8Array(30 + name.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, dosTime, true);
      lv.setUint16(12, dosDate, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, name.length, true);
      lv.setUint16(28, 0, true);
      lh.set(name, 30);
      locals.push(lh, data);

      const ch = new Uint8Array(46 + name.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      ch.set(name, 46);
      centrals.push(ch);
      offset += lh.length + data.length;
    });
    const centralSize = centrals.reduce((a, c) => a + c.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    const total = offset + centralSize + 22;
    const out = new Uint8Array(total);
    let pos = 0;
    locals.forEach((b) => { out.set(b, pos); pos += b.length; });
    centrals.forEach((b) => { out.set(b, pos); pos += b.length; });
    out.set(end, pos);
    return out;
  }

  function xmlEscape(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  }

  function colName(n) {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  function sheetXml(headers, rows, widths) {
    const all = [headers].concat(rows);
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="18"/>';
    if (widths && widths.length) {
      xml += '<cols>' + widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols>';
    }
    xml += '<sheetData>';
    all.forEach((row, ri) => {
      xml += '<row r="' + (ri + 1) + '"' + (ri === 0 ? ' ht="22" customHeight="1"' : '') + '>';
      row.forEach((val, ci) => {
        const ref = colName(ci + 1) + (ri + 1);
        if (typeof val === 'number' && isFinite(val)) {
          const style = ri === 0 ? 1 : (Math.abs(val % 1) > 1e-9 ? 2 : 0);
          xml += '<c r="' + ref + '" s="' + style + '"><v>' + val + '</v></c>';
        } else {
          xml += '<c r="' + ref + '" s="' + (ri === 0 ? 1 : 0) + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEscape(val) + '</t></is></c>';
        }
      });
      xml += '</row>';
    });
    xml += '</sheetData><autoFilter ref="A1:' + colName(headers.length) + Math.max(all.length, 1) + '"/>';
    xml += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>';
    return xml;
  }

  function buildXlsx() {
    const db = initDB();
    const cs = stats('cigar');
    const ps = stats('pipe');
    const statusText = { ready: '在柜', aging: '养护中', empty: '已空' };

    const cigarHeaders = ['品牌', '系列', '产地', '茄衣', '品型', '尺寸', '长度(英寸)', '环径', '数量', '单价(CNY)', '小计(CNY)', '评分', '状态', '入柜日期', '盒位', '风味', '备注'];
    const cigarRows = db.cigars.map((c) => [
      c.brand, c.series, c.origin, c.wrapper, c.vitola, c.shape,
      Number(c.length) || '', Number(c.ring) || '', Number(c.qty) || 0,
      Number(c.price) || 0, (Number(c.qty) || 0) * (Number(c.price) || 0),
      Number(c.rating) || '', statusText[statusOf(c, 'cigar')] || '',
      c.acquired || '', c.box || '',
      (c.flavors || []).map((f) => tag(f).zh).join('、'), c.notes || ''
    ]);

    const pipeHeaders = ['品牌', '调配', '类型', '裁切', '成分', '加香', '重量(g)', '罐数', '单价(CNY)', '小计(CNY)', '评分', '状态', '入罐日期', '罐码', '浓度', '室韵', '已抽(斗)', '风味', '备注', '资料简介'];
    const pipeRows = db.pipes.map((p) => [
      p.brand, p.blend, p.type, p.cut, (p.components || []).join('、'), p.topping || '无',
      Number(p.weight) || '', Number(p.qty) || 0,
      Number(p.price) || 0, (Number(p.qty) || 0) * (Number(p.price) || 0),
      Number(p.rating) || '', statusText[statusOf(p, 'pipe')] || '',
      p.acquired || '', p.jar || '', Number(p.strength) || '', Number(p.roomNote) || '', Number(p.bowls) || 0,
      (p.flavors || []).map((f) => tag(f).zh).join('、'), p.notes || '', p.description || ''
    ]);

    const cigarRecHeaders = ['日期', '雪茄', '评分', '时长(分钟)', '佐饮', '燃烧', '烟灰', '风味', '头段', '中段', '尾段', '地点'];
    const cigarRecRows = enrichedRecords('cigar').map((r) => [
      r.date, r.name, Number(r.rating) || '', Number(r.minutes) || '',
      r.pairing || '', r.burn || '', r.ash || '',
      (r.flavors || []).map((f) => tag(f).zh).join('、'),
      r.head || '', r.mid || '', r.finish || '', r.location || ''
    ]);

    const pipeRecHeaders = ['日期', '斗草', '评分', '时长(分钟)', '烟斗', '装填', '补火', '湿度', '佐饮', '风味', '前段', '中段', '后段', '地点'];
    const pipeRecRows = enrichedRecords('pipe').map((r) => [
      r.date, r.name, Number(r.rating) || '', Number(r.minutes) || '',
      r.pipeUsed || '', r.packing || '', Number(r.relights) || 0, r.moisture || '', r.pairing || '',
      (r.flavors || []).map((f) => tag(f).zh).join('、'),
      r.head || '', r.mid || '', r.finish || '', r.location || ''
    ]);

    const rackHeaders = ['名称', '制作者/品牌', '斗型', '材质', '烟嘴', '斗钵深(mm)', '钵径(mm)', '长度(mm)', '重量(g)', '入手日期', '价格(CNY)', '评分', '收藏', '有照片', '备注'];
    const rackRows = db.smokingPipes.map((p) => [
      p.name, p.maker || '', p.shape || '', p.material || '', p.stem || '',
      Number(p.bowlDepth) || '', Number(p.chamber) || '', Number(p.length) || '', Number(p.weight) || '',
      p.acquired || '', Number(p.price) || '', Number(p.rating) || '',
      p.favorite ? '是' : '', p.photo ? '是' : '否', p.notes || ''
    ]);
    const rackValue = db.smokingPipes.reduce((a, p) => a + (Number(p.price) || 0), 0);
    const rackFav = db.smokingPipes.filter((p) => p.favorite).length;

    const sumHeaders = ['指标', '数值', '备注'];
    const sumRows = [
      ['雪茄品种数', cs.kinds, '数量大于 0 的雪茄'],
      ['雪茄总支数', cs.qty, ''],
      ['雪茄总估值(CNY)', cs.value, '按当前单价计算'],
      ['雪茄平均评分', Number(cs.avgRating.toFixed(2)), '按数量加权'],
      ['雪茄品吸记录', cs.records, ''],
      ['斗草品种数', ps.kinds, '数量大于 0 的斗草'],
      ['斗草总罐数', ps.qty, ''],
      ['斗草总估值(CNY)', ps.value, '按当前单价计算'],
      ['斗草平均评分', Number(ps.avgRating.toFixed(2)), '按罐数加权'],
      ['斗草品吸记录', ps.records, ''],
      ['烟斗收藏(把)', db.smokingPipes.length, '陈列柜中的烟斗'],
      ['烟斗收藏总价值(CNY)', rackValue, '按入手价计算'],
      ['烟斗收藏中标记为喜欢的', rackFav, ''],
      ['累计品吸时长(分钟)', cs.minutes + ps.minutes, '雪茄 + 斗草'],
      ['导出时间', new Date().toLocaleString('zh-CN'), 'Hamos 的烟草生活']
    ];

    const sheetOverrides = [1, 2, 3, 4, 5, 6].map((n) =>
      '<Override PartName="/xl/worksheets/sheet' + n + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    ).join('');

    const files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + sheetOverrides + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="雪茄库存" sheetId="1" r:id="rId1"/><sheet name="雪茄记录" sheetId="2" r:id="rId2"/><sheet name="斗草库存" sheetId="3" r:id="rId3"/><sheet name="斗草记录" sheetId="4" r:id="rId4"/><sheet name="烟斗陈列" sheetId="5" r:id="rId5"/><sheet name="汇总" sheetId="6" r:id="rId6"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet5.xml"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet6.xml"/><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Microsoft YaHei"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2B2118"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>' },
      { name: 'xl/worksheets/sheet1.xml', data: sheetXml(cigarHeaders, cigarRows, [16, 24, 10, 22, 14, 12, 10, 8, 8, 12, 12, 8, 10, 12, 8, 30, 42]) },
      { name: 'xl/worksheets/sheet2.xml', data: sheetXml(cigarRecHeaders, cigarRecRows, [12, 30, 8, 12, 16, 10, 12, 26, 40, 40, 40, 14]) },
      { name: 'xl/worksheets/sheet3.xml', data: sheetXml(pipeHeaders, pipeRows, [16, 22, 10, 8, 30, 14, 8, 8, 12, 12, 8, 10, 12, 8, 8, 8, 8, 30, 42, 50]) },
      { name: 'xl/worksheets/sheet4.xml', data: sheetXml(pipeRecHeaders, pipeRecRows, [12, 28, 8, 12, 24, 10, 8, 8, 16, 26, 40, 40, 40, 14]) },
      { name: 'xl/worksheets/sheet5.xml', data: sheetXml(rackHeaders, rackRows, [24, 22, 10, 12, 12, 12, 10, 10, 10, 12, 12, 8, 8, 8, 42]) },
      { name: 'xl/worksheets/sheet6.xml', data: sheetXml(sumHeaders, sumRows, [26, 24, 28]) }
    ];
    return zipFiles(files);
  }

  function download(filename, data, mime) {
    let blob;
    if (data instanceof Blob) blob = data;
    else blob = new Blob([data], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 800);
  }

  /* --------------------------------------------------------------- export */
  const CR = {
    KEY: KEY,
    VERSION: VERSION,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    CURRENCIES: CURRENCIES,
    SERIES: SERIES,
    STATUS: STATUS,
    get db() { return initDB(); },
    init: initDB,
    save: saveDB,
    seedDB: seedDB,
    loadDB: loadDB,
    resetToSeed: function () { DB = seedDB(); saveDB(); return DB; },
    clearData: function () {
      DB.cigars = []; DB.records = []; DB.pipes = []; DB.pipeRecords = []; DB.smokingPipes = []; DB.wiki = []; DB.tags = [];
      saveDB();
    },
    setSettings: function (patch) {
      DB.settings = Object.assign({}, DB.settings, patch || {});
      saveDB();
    },
    storageBytes: storageBytes,
    esc: esc,
    uid: uid,
    clamp: clamp,
    clone: clone,
    normKind: normKind,
    items: items,
    records: records,
    todayISO: todayISO,
    fmtDate: fmtDate,
    monthKey: monthKey,
    monthLabel: monthLabel,
    fmtNum: fmtNum,
    money: money,
    moneyRaw: moneyRaw,
    daysSince: daysSince,
    parseDate: parseDate,
    statusOf: statusOf,
    agingLabel: agingLabel,
    unitOf: unitOf,
    paletteFor: paletteFor,
    pipeTypePalette: pipeTypePalette,
    wrapperTone: wrapperTone,
    cigarArt: cigarArt,
    pipeArt: pipeArt,
    stars: stars,
    strengthDots: strengthDots,
    allTags: allTags,
    tag: tag,
    tagChip: tagChip,
    tagsHTML: tagsHTML,
    stats: stats,
    uniq: uniq,
    filterItems: filterItems,
    filterCigars: filterCigars,
    filterPipes: filterPipes,
    byField: byField,
    ratingBuckets: ratingBuckets,
    monthlySpend: monthlySpend,
    flavorProfile: flavorProfile,
    topFlavors: topFlavors,
    monthsAged: monthsAged,
    reminders: reminders,
    recordStats: recordStats,
    enrichedRecords: enrichedRecords,
    wikiCats: wikiCats,
    wikiAll: wikiAll,
    wikiCat: wikiCat,
    filterWiki: filterWiki,
    donut: donut,
    legend: legend,
    sparkline: sparkline,
    lineChart: lineChart,
    barChart: barChart,
    radar: radar,
    miniRing: miniRing,
    buildXlsx: buildXlsx,
    download: download,
    exportJSON: function () {
      return JSON.stringify({
        app: 'Hamos的烟草生活', version: VERSION, exportedAt: new Date().toISOString(),
        settings: DB.settings, cigars: DB.cigars, records: DB.records,
        pipes: DB.pipes, pipeRecords: DB.pipeRecords, smokingPipes: DB.smokingPipes, wiki: DB.wiki, tags: DB.tags
      }, null, 2);
    },
    importJSON: function (text) {
      const d = JSON.parse(text);
      if (!d || (!Array.isArray(d.cigars) && !Array.isArray(d.pipes) && !Array.isArray(d.smokingPipes))) throw new Error('不是有效的 Hamos 备份');
      DB = normalize({
        meta: { version: VERSION, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), seeded: false },
        settings: Object.assign({}, DB.settings, d.settings || {}),
        cigars: d.cigars || [], records: d.records || [],
        pipes: d.pipes || [], pipeRecords: d.pipeRecords || [],
        smokingPipes: d.smokingPipes || [],
        wiki: d.wiki || [], tags: d.tags || []
      });
      saveDB();
      return DB;
    }
  };

  root.CigarRoot = CR;
  if (typeof module !== 'undefined' && module.exports) module.exports = CR;
})();
 
