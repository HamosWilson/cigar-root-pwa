/* Hamos 的烟草生活 — pipe tobacco reference lookup (local catalog + optional online endpoint). */
(function () {
  'use strict';

  const CACHE_KEY = 'hamos.enrich.v1';
  const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '');
  }

  function catalog() {
    return Array.isArray(window.PIPE_CATALOG) ? window.PIPE_CATALOG : [];
  }

  function matchScore(entry, brand, blend) {
    const b = norm(brand), l = norm(blend);
    if (!b || !l) return 0;
    const eb = norm(entry.brand), el = norm(entry.blend);
    const aliases = (entry.aliases || []).map(norm);
    if (eb === b && el === l) return 100;
    if (eb === b && aliases.indexOf(l) >= 0) return 96;
    if (el === l && aliases.indexOf(b) >= 0) return 94;
    if ((eb === b && el.indexOf(l) >= 0) || (eb.indexOf(b) >= 0 && el === l)) return 76;
    if (eb === b && (el.indexOf(l) >= 0 || l.indexOf(el) >= 0)) return 66;
    if ((eb.indexOf(b) >= 0 || b.indexOf(eb) >= 0) && (el.indexOf(l) >= 0 || l.indexOf(el) >= 0)) return 48;
    if (el === l || aliases.indexOf(l) >= 0) return 38;
    return 0;
  }

  function lookupLocal(brand, blend) {
    const b = String(brand || '').trim();
    const l = String(blend || '').trim();
    if (!b || !l) return [];
    return catalog()
      .map(function (entry) { return { entry: entry, score: matchScore(entry, b, l) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b2) { return b2.score - a.score; })
      .slice(0, 6)
      .map(function (x) {
        return Object.assign({}, x.entry, {
          _score: x.score,
          source: { kind: 'builtin', name: '内置资料库 · ' + (x.entry.brand || '') }
        });
      });
  }

  function cacheAll() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === 'object' ? obj : {};
    } catch (e) { return {}; }
  }

  function cacheGet(key) {
    const item = cacheAll()[key];
    if (!item || !Array.isArray(item.matches)) return null;
    if (Date.now() - Number(item.at || 0) > CACHE_TTL) return null;
    return item.matches;
  }

  function cacheSet(key, matches) {
    try {
      const all = cacheAll();
      all[key] = { at: Date.now(), matches: matches };
      const keys = Object.keys(all);
      if (keys.length > 120) {
        keys.sort(function (a, b) { return (all[a].at || 0) - (all[b].at || 0); });
        keys.slice(0, keys.length - 100).forEach(function (k) { delete all[k]; });
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function normalizeMatch(m) {
    if (!m || typeof m !== 'object') return null;
    const type = String(m.type || '').trim();
    const cut = String(m.cut || '').trim();
    return {
      brand: String(m.brand || '').trim(),
      blend: String(m.blend || '').trim(),
      aliases: Array.isArray(m.aliases) ? m.aliases : [],
      type: type,
      cut: cut,
      components: Array.isArray(m.components) ? m.components.filter(Boolean).map(String) : [],
      topping: String(m.topping || '无').trim() || '无',
      weight: Number(m.weight) || 0,
      strength: Math.min(5, Math.max(1, Math.round(Number(m.strength) || 0))) || 0,
      roomNote: Math.min(5, Math.max(1, Math.round(Number(m.roomNote) || 0))) || 0,
      flavors: Array.isArray(m.flavors) ? m.flavors.filter(Boolean).map(String) : [],
      description: String(m.description || m.notes || '').trim(),
      source: Object.assign({ kind: 'online', name: '联网资料' }, m.source || {}),
      confidence: Number(m.confidence) || 0
    };
  }

  async function lookupOnline(brand, blend) {
    const cfg = (window.CigarRoot && window.CigarRoot.db.settings.enrich) || {};
    if (!cfg.enabled) throw new Error('联网补全未开启');
    const endpoint = String(cfg.endpoint || '').trim();
    if (!endpoint) throw new Error('还没有配置联网接口地址');
    const key = norm(brand) + '|' + norm(blend);
    const body = { brand: String(brand || '').trim(), blend: String(blend || '').trim() };
    const headers = { 'content-type': 'application/json', accept: 'application/json' };
    if (cfg.token) headers.authorization = 'Bearer ' + cfg.token;
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, Math.max(5000, Number(cfg.timeout) || 15000));
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: headers, body: JSON.stringify(body), signal: controller.signal, cache: 'no-store'
      });
      if (!res.ok) throw new Error('接口返回 HTTP ' + res.status);
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (Array.isArray(data.matches) ? data.matches : (data.match ? [data.match] : [data]));
      const matches = raw.map(normalizeMatch).filter(Boolean).filter(function (m) { return m.brand || m.blend; });
      if (!matches.length) throw new Error('接口没有返回可用资料');
      matches.forEach(function (m) {
        if (!m.brand) m.brand = body.brand;
        if (!m.blend) m.blend = body.blend;
        m.source = Object.assign({ kind: 'online', name: '联网资料', url: endpoint }, m.source || {});
      });
      cacheSet(key, matches);
      return matches;
    } catch (e) {
      const cached = cacheGet(key);
      if (cached) {
        return cached.map(function (m) {
          return Object.assign({}, m, { source: Object.assign({ kind: 'cache', name: '联网缓存' }, m.source || {}) });
        });
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  window.PipeEnrich = {
    normalize: norm,
    lookupLocal: lookupLocal,
    lookupOnline: lookupOnline,
    catalog: catalog
  };
})();
