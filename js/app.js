/* Hamos 的烟草生活 — shell, router, events, modals, palette, exports */
(function () {
  'use strict';

  const CR = window.CigarRoot;
  const V = window.Views;
  const ic = V.ic;
  const esc = CR.esc;

  const state = {
    page: 'inventory',
    board: (function () {
      try { return localStorage.getItem('hamos.board') === 'pipe' ? 'pipe' : 'cigar'; } catch (e) { return 'cigar'; }
    })(),
    inv: { q: '', brand: '', origin: '', wrapper: '', type: '', cut: '', status: 'all', sort: 'default', view: 'grid' },
    rack: { q: '', shape: '', material: '', sort: 'default', fav: false },
    wiki: { q: '', cat: 'all' },
    flavors: [],
    palette: { q: '', active: 0, groups: [] }
  };

  let confirmCb = null;
  let confirmPhrase = '';
  let toastTimers = [];

  const app = document.getElementById('app');
  const overlay = document.getElementById('overlay');
  const toasts = document.getElementById('toasts');

  /* ------------------------------------------------------------------ settings */
  function effectiveTheme() {
    const t = CR.db.settings.theme;
    if (t === 'auto') {
      try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; }
    }
    return t === 'dark' ? 'dark' : 'light';
  }

  const ZOOM_MIN = 50;
  const ZOOM_MAX = 200;
  let zoomSaveTimer = null;

  function zoomValue() {
    return Math.round(CR.clamp(Number(CR.db.settings.zoom) || 100, ZOOM_MIN, ZOOM_MAX));
  }

  function applyZoom() {
    const z = zoomValue() / 100;
    if (window.hamosDesktop && window.hamosDesktop.setZoom) {
      document.documentElement.removeAttribute('data-zoom');
      window.hamosDesktop.setZoom(z);
    } else {
      document.documentElement.style.zoom = z === 1 ? '' : String(z);
      if (z >= 1.65) document.documentElement.dataset.zoom = 'far';
      else document.documentElement.removeAttribute('data-zoom');
    }
  }

  function updateZoomUI() {
    const z = zoomValue();
    document.querySelectorAll('[data-zoom-val]').forEach(function (el) { el.textContent = z + '%'; });
    const range = document.querySelector('[data-zoom-range]');
    if (range) {
      range.value = String(z);
      range.style.setProperty('--z', ((z - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN) * 100) + '%');
    }
  }

  function setZoom(v, save) {
    const z = Math.round(CR.clamp(Number(v) || 100, ZOOM_MIN, ZOOM_MAX));
    CR.db.settings.zoom = z;
    if (save === false) {
      clearTimeout(zoomSaveTimer);
      zoomSaveTimer = setTimeout(function () { CR.save(); }, 220);
    } else {
      CR.save();
    }
    applyZoom();
    updateZoomUI();
    return z;
  }

  function applySettings() {
    const s = CR.db.settings;
    document.documentElement.dataset.theme = effectiveTheme();
    document.documentElement.style.setProperty('--accent-user', s.accent || '#a05a2c');
    document.documentElement.dataset.grain = s.grain ? 'on' : 'off';
    document.documentElement.classList.toggle('no-motion', !s.motion);
    applyZoom();
    updateZoomUI();
  }

  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', function () {
      if (CR.db.settings.theme === 'auto') {
        document.documentElement.dataset.theme = effectiveTheme();
        renderAll(false);
      }
    });
  } catch (e) {}

  /* ------------------------------------------------------------------ shell */
  function boardCount(b) {
    return b === 'pipe' ? CR.db.pipes.length : CR.db.cigars.length;
  }

  function shell() {
    const s = CR.db.settings;
    const b = state.board;
    const nav = V.navFor(b).map(function (n) {
      return '<a href="#' + n.id + '" class="' + (state.page === n.id ? 'active' : '') + '">' + ic(n.icon) + '<span>' + n.zh + '</span></a>';
    }).join('');
    const cur = CR.CURRENCIES.map(function (c) {
      return '<button data-act="set-currency:' + c.code + '" class="' + (s.currency === c.code ? 'on' : '') + '" title="' + c.label + '">' + c.symbol + '</button>';
    }).join('');
    const boardBtn = function (id, label, icon) {
      return '<button class="board-btn ' + id + (b === id ? ' on' : '') + '" data-act="board:' + id + '" role="tab" aria-selected="' + (b === id) + '">' +
        ic(icon, 'bico') + '<span>' + label + '</span><b>' + boardCount(id) + '</b></button>';
    };
    return '<header class="topbar"><div class="topbar-inner">' +
      '<a class="brand" href="#inventory" aria-label="Hamos的烟草生活">' +
        '<span class="brand-mark">' + V.faviconMark() + '</span>' +
        '<span class="brand-type"><b class="brand-name"><em>Hamos</em>的烟草生活</b><i>烟草客</i></span>' +
      '</a>' +
      '<div class="board-switch" role="tablist" aria-label="板块">' +
        '<span class="board-label">板块</span>' +
        boardBtn('cigar', '雪茄', 'box') +
        boardBtn('pipe', '烟斗草', 'pipe') +
      '</div>' +
      '<nav class="nav" aria-label="主导航">' + nav + '</nav>' +
      '<div class="tools">' +
        '<button class="searchbtn" data-act="palette" title="搜索（Ctrl K）">' + ic('search') + '<span>搜索</span><kbd>Ctrl K</kbd></button>' +
        '<div class="currency" role="group" aria-label="货币">' + cur + '</div>' +
        '<button class="iconbtn" data-act="theme-toggle" title="切换主题">' + (effectiveTheme() === 'dark' ? ic('sun') : ic('moon')) + '</button>' +
      '</div>' +
      '</div></header>' +
      '<main id="view"></main>' +
      '<footer class="footer"><span><b>HAMOS</b> · 烟草生活 / 烟草客</span><span>数据只保存在本机 · 建议定期导出备份</span></footer>' +
      '<input type="file" id="import-file" accept=".json,application/json" hidden>';
  }

  function renderShell() {
    app.innerHTML = shell();
  }

  function viewHtml() {
    if (state.page === 'cabinet') return V.cabinet(state);
    if (state.page === 'overview') return V.overview(state);
    if (state.page === 'flavor') return V.flavor(state);
    if (state.page === 'records') return V.records(state);
    if (state.page === 'wiki') return V.wiki(state);
    if (state.page === 'settings') return V.settings(state);
    return V.inventory(state);
  }

  function renderPage(scroll) {
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = '<div class="page">' + viewHtml() + '</div>';
    if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderAll(scroll) {
    renderShell();
    renderPage(scroll);
  }

  function navActive() {
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + state.page);
    });
  }

  function setBoard(b) {
    if (b !== 'pipe' && b !== 'cigar') return;
    if (b === state.board) return;
    state.board = b;
    try { localStorage.setItem('hamos.board', b); } catch (e) {}
    state.inv = { q: '', brand: '', origin: '', wrapper: '', type: '', cut: '', status: 'all', sort: 'default', view: 'grid' };
    state.wiki = { q: '', cat: 'all' };
    state.flavors = [];
    if (b === 'cigar' && state.page === 'cabinet') {
      state.page = 'inventory';
      history.replaceState(null, '', '#inventory');
    }
    renderAll(true);
  }

  /* ----------------------------------------------------------------- router */
  function parseRoute() {
    const raw = (location.hash || '').replace(/^#/, '');
    const qi = raw.indexOf('?');
    let page = (qi >= 0 ? raw.slice(0, qi) : raw) || 'inventory';
    const params = new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : '');
    if (params.get('board') === 'pipe' || params.get('board') === 'cigar') {
      state.board = params.get('board');
      try { localStorage.setItem('hamos.board', state.board); } catch (e) {}
    }
    if (!V.navFor(state.board).some(function (n) { return n.id === page; })) page = 'inventory';
    if (page === 'cabinet' && state.board !== 'pipe') page = 'inventory';
    state.page = page;
    if (params.get('brand')) state.inv.brand = params.get('brand');
    if (params.get('status')) state.inv.status = params.get('status');
    if (params.get('q')) state.inv.q = params.get('q');
    return params;
  }

  function go(page, patch) {
    if (page === 'cabinet' && state.board !== 'pipe') page = 'inventory';
    if (page !== state.page) {
      state.page = page;
      history.replaceState(null, '', '#' + page);
      renderAll(true);
    } else {
      if (patch) Object.assign(state.inv, patch);
      renderPage(false);
    }
  }

  /* ------------------------------------------------------------------ toasts */
  function toast(message, opt) {
    const o = opt || {};
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="ti">' + ic(o.icon || 'check') + '</span><span>' + esc(message) + '</span>' +
      (o.action ? '<button type="button">' + esc(o.action.label) + '</button>' : '');
    toasts.appendChild(el);
    if (o.action) {
      el.querySelector('button').addEventListener('click', function () {
        o.action.fn();
        el.classList.add('out');
        setTimeout(function () { el.remove(); }, 220);
      });
    }
    const timer = setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 220);
    }, o.duration || 3200);
    toastTimers.push(timer);
    if (toastTimers.length > 6) clearTimeout(toastTimers.shift());
  }

  /* ------------------------------------------------------------------ modal */
  function openModal(o) {
    const wide = o.wide ? ' wide' : o.narrow ? ' narrow' : '';
    overlay.innerHTML = '<div class="overlay" role="dialog" aria-modal="true">' +
      '<div class="modal' + wide + '" data-stop="1">' +
        '<div class="modal-head"><div>' +
          (o.kicker ? '<div class="kicker">' + esc(o.kicker) + '</div>' : '') +
          '<h2 class="modal-title">' + o.title + '</h2>' +
          (o.sub ? '<p class="modal-sub">' + o.sub + '</p>' : '') +
        '</div><button class="xbtn" data-act="close-modal" aria-label="关闭">' + ic('x') + '</button></div>' +
        '<div class="modal-body">' + o.body + '</div>' +
        (o.foot ? '<div class="modal-foot">' + o.foot + '</div>' : '') +
      '</div></div>';
    document.body.style.overflow = 'hidden';
    const first = overlay.querySelector('input:not([type=hidden]), select, textarea');
    if (first) setTimeout(function () { first.focus(); }, 30);
    if (o.onMount) o.onMount(overlay);
  }

  function closeModal() {
    overlay.innerHTML = '';
    document.body.style.overflow = '';
    confirmCb = null;
    confirmPhrase = '';
  }

  function paintRange(el) {
    if (!el) return;
    const p = Math.max(0, Math.min(100, (Number(el.value) / 10) * 100));
    el.style.setProperty('--fill', p + '%');
  }

  function openCigarModal(c) {
    openModal({
      wide: true,
      kicker: c ? 'EDIT CIGAR' : 'NEW CIGAR',
      title: c ? '编辑雪茄' : '新增雪茄',
      sub: c ? '修改会立即保存到本机，不影响已有的品吸记录。' : '记录品牌、规格、价格与风味，之后可以随时调整。',
      body: V.cigarForm(c),
      foot: '<button class="btn" data-act="close-modal">取消</button><button class="btn btn-primary" type="submit" form="cigar-form">' + (c ? '保存修改' : '加入库存') + '</button>',
      onMount: function (el) { paintRange(el.querySelector('[data-range=rating]')); }
    });
  }

  function openPipeModal(p) {
    openModal({
      wide: true,
      kicker: p ? 'EDIT PIPE TOBACCO' : 'NEW PIPE TOBACCO',
      title: p ? '编辑斗草' : '新增斗草',
      sub: p ? '修改罐数、裁切或陈化状态。' : '记录品牌、调配、裁切与开罐计划。',
      body: V.pipeForm(p),
      foot: '<button class="btn" data-act="close-modal">取消</button><button class="btn btn-primary" type="submit" form="pipe-form">' + (p ? '保存修改' : '加入斗草柜') + '</button>',
      onMount: function (el) { paintRange(el.querySelector('[data-range=rating]')); }
    });
  }

  /* --------------------------------------------------- pipe reference lookup */
  function setPipePicker(form, selector, hiddenName, values, attr) {
    const wanted = Array.isArray(values) ? values : [];
    const picker = form.querySelector(selector);
    if (!picker) return;
    picker.querySelectorAll('.tag[' + attr + ']').forEach(function (btn) {
      btn.classList.toggle('on', wanted.indexOf(btn.getAttribute(attr)) >= 0);
    });
    const hidden = form.querySelector('input[name=' + hiddenName + ']');
    if (hidden) hidden.value = picker.querySelectorAll('.tag.on').length
      ? Array.from(picker.querySelectorAll('.tag.on')).map(function (b) { return b.getAttribute(attr); }).join(',')
      : '';
  }

  function snapshotPipeForm(form) {
    const fd = new FormData(form);
    const get = function (name) { return String(fd.get(name) || ''); };
    return JSON.stringify({
      type: get('type'), cut: get('cut'), topping: get('topping'), weight: get('weight'),
      strength: get('strength'), roomNote: get('roomNote'), components: get('components'),
      flavors: get('flavors'), description: get('description'), notes: get('notes'),
      sourceName: get('sourceName'), sourceUrl: get('sourceUrl'), sourceKind: get('sourceKind'),
      sourceConfidence: get('sourceConfidence')
    });
  }

  function restorePipeSnapshot(form) {
    let s = null;
    try { s = JSON.parse(form.dataset.preEnrich || 'null'); } catch (e) {}
    if (!s) return;
    ['type', 'cut', 'topping', 'weight', 'strength', 'roomNote', 'description', 'notes'].forEach(function (name) {
      const el = form.elements[name];
      if (el && s[name] != null) el.value = s[name];
    });
    setPipePicker(form, '#component-picker', 'components', String(s.components || '').split(',').filter(Boolean), 'data-component');
    setPipePicker(form, '#flavor-picker', 'flavors', String(s.flavors || '').split(',').filter(Boolean), 'data-tag');
    ['sourceName', 'sourceUrl', 'sourceKind', 'sourceConfidence'].forEach(function (name) {
      const el = form.elements[name];
      if (el && s[name] != null) el.value = s[name];
    });
    delete form.dataset.preEnrich;
    form.classList.remove('is-enriched');
    const undo = form.querySelector('[data-act=enrich-undo]');
    if (undo) undo.hidden = true;
    const box = form.querySelector('#lookup-result');
    if (box) { box.hidden = true; box.innerHTML = ''; }
  }

  function applyPipeEnrichment(form, match) {
    if (!form || !match) return;
    if (!form.dataset.preEnrich) form.dataset.preEnrich = snapshotPipeForm(form);
    const source = match.source || { kind: 'builtin', name: '内置资料库' };
    const tags = CR.allTags().map(function (t) { return t.id; });
    const comps = Array.from(form.querySelectorAll('#component-picker .tag[data-component]')).map(function (b) { return b.dataset.component; });

    if (match.type && Array.from(form.elements.type.options).some(function (o) { return o.value === match.type; })) form.elements.type.value = match.type;
    if (match.cut && Array.from(form.elements.cut.options).some(function (o) { return o.value === match.cut; })) form.elements.cut.value = match.cut;
    if (match.topping) form.elements.topping.value = match.topping;
    if (Number(match.weight) > 0) form.elements.weight.value = Number(match.weight);
    if (Number(match.strength) >= 1 && Number(match.strength) <= 5) form.elements.strength.value = String(Math.round(Number(match.strength)));
    if (Number(match.roomNote) >= 1 && Number(match.roomNote) <= 5) form.elements.roomNote.value = String(Math.round(Number(match.roomNote)));
    if (Array.isArray(match.components) && match.components.length) setPipePicker(form, '#component-picker', 'components', match.components.filter(function (c) { return comps.indexOf(c) >= 0; }), 'data-component');
    if (Array.isArray(match.flavors) && match.flavors.length) setPipePicker(form, '#flavor-picker', 'flavors', match.flavors.filter(function (f) { return tags.indexOf(f) >= 0; }), 'data-tag');
    if (match.description) form.elements.description.value = match.description;

    form.elements.sourceName.value = source.name || '';
    form.elements.sourceUrl.value = source.url || '';
    form.elements.sourceKind.value = source.kind || '';
    form.elements.sourceConfidence.value = Number(match.confidence) || 0;
    form.classList.add('is-enriched');

    const box = form.querySelector('#lookup-result');
    if (box) {
      box.hidden = false;
      box.innerHTML = '<b>' + esc(source.name || '资料已填充') + '</b>' +
        (match.confidence ? ' · 置信度 ' + Math.round(match.confidence * 100) + '%' : '') +
        ' · 已填 ' + [match.type, match.cut].filter(Boolean).join(' / ') + ' · 请核对包装';
    }
    const undo = form.querySelector('[data-act=enrich-undo]');
    if (undo) undo.hidden = false;
    toast('资料已填充，保存前请核对', { icon: 'book' });
  }

  function showPipeMatches(form, matches) {
    const box = form.querySelector('#lookup-result');
    if (!box) return;
    box.hidden = false;
    box.innerHTML = '<b>找到 ' + matches.length + ' 条可能，选一条</b><div class="lookup-matches">' +
      matches.map(function (m, i) {
        return '<button type="button" class="lookup-match" data-enrich-match="' + i + '"><b>' + esc(m.brand) + ' · ' + esc(m.blend) + '</b>' +
          '<span>' + esc(m.type || '未分类') + ' · ' + esc(m.cut || '未标注') + (m.components && m.components.length ? ' · ' + esc(m.components.join('、')) : '') + '</span></button>';
      }).join('') + '</div>';
    form._enrichMatches = matches;
    box.querySelectorAll('[data-enrich-match]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const m = form._enrichMatches[Number(btn.dataset.enrichMatch)];
        delete form._enrichMatches;
        if (m) applyPipeEnrichment(form, m);
      });
    });
  }

  function enrichPipeForm() {
    const form = document.getElementById('pipe-form');
    if (!form) return;
    const brand = form.elements.brand.value.trim();
    const blend = form.elements.blend.value.trim();
    if (!brand || !blend) { toast('先填品牌和调配名，再查资料', { icon: 'alert' }); return; }
    const box = form.querySelector('#lookup-result');
    const btn = form.querySelector('[data-act=enrich-pipe]');
    const old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '查询中…'; }
    if (box) { box.hidden = false; box.innerHTML = '<span class="lookup-loading">正在查内置资料…</span>'; }

    const local = window.PipeEnrich ? window.PipeEnrich.lookupLocal(brand, blend) : [];
    if (local.length === 1) {
      applyPipeEnrichment(form, local[0]);
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
      return;
    }
    if (local.length > 1) {
      showPipeMatches(form, local);
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
      return;
    }

    const cfg = CR.db.settings.enrich || {};
    if (!cfg.enabled || !cfg.endpoint) {
      if (box) box.innerHTML = '<b>内置资料库没有找到</b><span>可在设置 → 斗草资料补全里开启联网查询；现在也可以手动填写。</span>';
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
      return;
    }
    if (box) box.innerHTML = '<span class="lookup-loading">联网查询中，可能需要几秒…</span>';
    window.PipeEnrich.lookupOnline(brand, blend).then(function (matches) {
      if (matches.length === 1) applyPipeEnrichment(form, matches[0]);
      else if (matches.length > 1) showPipeMatches(form, matches);
      else if (box) box.innerHTML = '<b>没有查到可用资料</b><span>请手动填写，或换一个品牌/调配名。</span>';
    }).catch(function (e) {
      if (box) box.innerHTML = '<b>联网查询失败</b><span>' + esc(e.message || '请检查接口地址') + '，可手动填写。</span>';
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
    });
  }

  function openRecordModal(r, presetId) {
    const b = state.board;
    openModal({
      wide: true,
      kicker: r ? 'EDIT ENTRY' : 'NEW ENTRY',
      title: r ? '编辑品吸记录' : (b === 'pipe' ? '记录这一斗' : '新增记录'),
      sub: r ? '修改这篇记录，不会重复计数。' : (b === 'pipe' ? '保存后累计斗数 +1，不扣罐数。' : '保存后会自动从对应雪茄中扣减 1 支。'),
      body: V.recordForm(r, presetId, b),
      foot: '<button class="btn" data-act="close-modal">取消</button><button class="btn btn-primary" type="submit" form="record-form">' + (r ? '保存修改' : '保存记录') + '</button>',
      onMount: function (el) { paintRange(el.querySelector('[data-range=rating]')); }
    });
  }

  function openWikiModal(w) {
    const b = state.board;
    openModal({
      kicker: w ? 'EDIT ENTRY' : 'NEW ENTRY',
      title: w ? '编辑词条' : (b === 'pipe' ? '新增斗草词条' : '新增词条'),
      sub: '写下一条属于你的' + (b === 'pipe' ? '斗草' : '雪茄') + '知识。',
      body: V.wikiForm(w, b),
      foot: '<button class="btn" data-act="close-modal">取消</button><button class="btn btn-primary" type="submit" form="wiki-form">保存词条</button>'
    });
  }

  /* --------------------------------------------------------------- pipe rack */
  function rackPlaceholder() {
    return '<div class="rack-nophoto"><svg class="rack-silhouette" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' +
      '<path d="M14 78h34c12 0 22-9 22-22V44"/><path d="M14 78c0-13 9-23 21-23h13"/><path d="M70 44h28"/>' +
      '<ellipse cx="74" cy="55" rx="2.4" ry="2.4"/><path d="M28 45c1-6 2-10 5-14" opacity=".5"/><path d="M8 86h104" opacity=".35"/></svg>' +
      '<span>还没有照片</span></div>';
  }

  function compressPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('请选择图片文件')); return; }
      if (file.size > 15 * 1024 * 1024) { reject(new Error('照片太大了，请选择 15 MB 以内的图片')); return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        try {
          const max = 900;
          const scale = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round((img.width || max) * scale));
          const h = Math.max(1, Math.round((img.height || max) * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#f4eee2';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const data = canvas.toDataURL('image/jpeg', 0.76);
          URL.revokeObjectURL(url);
          resolve(data);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('这张图片无法读取，换一张试试'));
      };
      img.src = url;
    });
  }

  function wireRackPhoto(scope) {
    const input = scope.querySelector('#rack-photo-input');
    if (!input) return;
    input.addEventListener('change', function () {
      const file = input.files && input.files[0];
      if (!file) return;
      const form = scope.querySelector('#rack-form');
      const hidden = form.querySelector('input[name=photo]');
      const preview = scope.querySelector('#rack-photo-preview');
      toast('正在压缩照片…', { icon: 'camera', duration: 1400 });
      compressPhoto(file).then(function (data) {
        hidden.value = data;
        preview.innerHTML = '<img src="' + data + '" alt="烟斗照片">';
        input.value = '';
        toast('照片已添加 · ' + Math.round(data.length / 1024) + ' KB');
      }).catch(function (e) {
        input.value = '';
        toast(e.message || '照片处理失败', { icon: 'alert' });
      });
    });
  }

  function openRackModal(r) {
    if (state.board !== 'pipe') { setBoard('pipe'); go('cabinet'); }
    else if (state.page !== 'cabinet') go('cabinet');
    openModal({
      wide: true,
      kicker: r ? 'EDIT PIPE' : 'NEW PIPE',
      title: r ? '编辑这把斗' : '放进一把斗',
      sub: '照片只保存在本机，自动压缩后随备份一起导出。',
      body: V.rackForm(r),
      foot: '<button class="btn" data-act="close-modal">取消</button><button class="btn btn-primary" type="submit" form="rack-form">' + (r ? '保存修改' : '放进陈列柜') + '</button>',
      onMount: function (el) { wireRackPhoto(el); paintRange(el.querySelector('[data-range=rating]')); }
    });
  }

  function openRackDetail(r) {
    openModal({
      wide: true,
      kicker: 'PIPE IN THE RACK',
      title: esc(r.name),
      sub: [r.maker, r.shape, r.material].filter(Boolean).join(' · '),
      body: V.rackDetail(r),
      foot: '<span class="left">' +
          '<button class="btn btn-sm btn-danger" data-act="del-rack:' + r.id + '">' + ic('trash') + '删除</button>' +
          '<button class="btn btn-sm" data-act="rack-fav:' + r.id + '">' + ic('star') + (r.favorite ? '取消喜欢' : '标记喜欢') + '</button>' +
        '</span>' +
        '<button class="btn" data-act="edit-rack:' + r.id + '">' + ic('edit') + '编辑</button>' +
        '<button class="btn btn-primary" data-act="close-modal">关闭</button>'
    });
  }

  function openRackShow() {
    if (state.board !== 'pipe') { setBoard('pipe'); go('cabinet'); }
    else if (state.page !== 'cabinet') go('cabinet');
    openModal({
      wide: true,
      kicker: 'THE PIPE RACK',
      title: '陈列柜展示',
      sub: '只展示有照片的斗。点任意一张看细节。',
      body: V.rackShow(state),
      foot: '<button class="btn" data-act="new-rack">' + ic('camera') + '新增烟斗</button><button class="btn btn-primary" data-act="close-modal">关闭</button>'
    });
  }

  function saveRack(form) {
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    if (!name) { toast('斗名不能为空', { icon: 'alert' }); return; }
    const data = {
      name: name,
      maker: String(fd.get('maker') || '').trim(),
      shape: String(fd.get('shape') || '直斗'),
      material: String(fd.get('material') || '石楠木'),
      stem: String(fd.get('stem') || ''),
      length: Math.max(0, num(fd.get('length'))),
      weight: Math.max(0, num(fd.get('weight'))),
      bowlDepth: Math.max(0, num(fd.get('bowlDepth'))),
      chamber: Math.max(0, num(fd.get('chamber'))),
      acquired: String(fd.get('acquired') || ''),
      price: Math.max(0, num(fd.get('price'))),
      rating: Math.min(10, Math.max(0, num(fd.get('rating')))),
      favorite: String(fd.get('favorite')) === 'on',
      notes: String(fd.get('notes') || '').trim(),
      photo: String(fd.get('photo') || '')
    };
    const id = form.dataset.id;
    const snapshot = CR.clone(CR.db.smokingPipes);
    if (id) {
      const p = CR.db.smokingPipes.find(function (x) { return x.id === id; });
      if (p) Object.assign(p, data);
    } else {
      data.id = CR.uid('sp');
      CR.db.smokingPipes.unshift(data);
    }
    if (!CR.save()) {
      CR.db.smokingPipes = snapshot;
      toast('保存失败：本地空间可能已满。请先导出备份，再删除几张旧照片。', { icon: 'alert', duration: 6500 });
      return;
    }
    closeModal();
    renderAll(false);
    toast(id ? '这把斗已更新' : '已放进陈列柜 · ' + name);
  }

  function deleteRack(id) {
    const idx = CR.db.smokingPipes.findIndex(function (p) { return p.id === id; });
    if (idx < 0) return;
    const p = CR.db.smokingPipes[idx];
    confirmAction({
      title: '把这把斗移出陈列柜？',
      message: '将删除 <b>' + esc(p.name) + '</b> 的照片与记录。斗草库存和品吸记录不受影响。',
      okText: '删除',
      onOk: function () {
        CR.db.smokingPipes.splice(idx, 1);
        if (!CR.save()) {
          CR.db.smokingPipes.splice(idx, 0, p);
          closeModal();
          toast('删除失败，请稍后再试', { icon: 'alert' });
          return;
        }
        closeModal(); renderAll(false);
        toast('已移出陈列柜', {
          action: { label: '撤销', fn: function () { CR.db.smokingPipes.splice(idx, 0, p); CR.save(); renderAll(false); } }
        });
      }
    });
  }

  function toggleRackFav(id) {
    const p = CR.db.smokingPipes.find(function (x) { return x.id === id; });
    if (!p) return;
    p.favorite = !p.favorite;
    CR.save();
    if (document.querySelector('.rack-detail')) {
      const wasFav = p.favorite;
      openRackDetail(p);
      toast(wasFav ? '已标记喜欢' : '已取消喜欢');
      return;
    }
    renderPage(false);
  }

  function openRecordDetail(r) {
    openModal({
      kicker: state.board === 'pipe' ? 'PIPE NOTE' : 'SMOKING NOTE',
      title: r.name,
      sub: CR.fmtDate(r.date, 'long') + ' · ' + (r.minutes || 0) + ' 分钟 · 评分 ' + (Number(r.rating) ? Number(r.rating).toFixed(1) : '—'),
      body: V.recordDetail(r, state.board),
      foot: '<span class="left"><button class="btn btn-sm btn-danger" data-act="del-record:' + r.id + '">' + ic('trash') + '删除</button></span>' +
        '<button class="btn" data-act="edit-record:' + r.id + '">' + ic('edit') + '编辑</button>' +
        '<button class="btn btn-primary" data-act="close-modal">关闭</button>'
    });
  }

  function openWikiDetail(w) {
    const b = state.board;
    const cat = CR.wikiCat(b, w.cat);
    openModal({
      kicker: cat.zh.toUpperCase() + ' · LEXICON',
      title: w.title,
      sub: w.builtin ? '内置词条 · 可新增自己的补充' : '我的词条',
      body: V.wikiDetail(w, b),
      foot: (w.builtin ? '' : '<span class="left"><button class="btn btn-sm btn-danger" data-act="del-wiki:' + w.id + '">' + ic('trash') + '删除</button></span>' +
        '<button class="btn" data-act="edit-wiki:' + w.id + '">' + ic('edit') + '编辑</button>') +
        '<button class="btn btn-primary" data-act="close-modal">关闭</button>'
    });
  }

  function confirmAction(o) {
    confirmCb = o.onOk;
    confirmPhrase = o.phrase || '';
    openModal({
      narrow: true,
      kicker: 'CONFIRM',
      title: o.title || '确认操作',
      body: V.confirmBody(o),
      foot: '<button class="btn" data-act="close-modal">取消</button>' +
        '<button class="btn ' + (o.okClass || 'btn-danger') + '" data-act="confirm-ok"' + (o.phrase ? ' disabled' : '') + '>' + esc(o.okText || '确认') + '</button>'
    });
    if (o.phrase) {
      const input = document.getElementById('confirm-phrase');
      const btn = overlay.querySelector('[data-act=confirm-ok]');
      if (input && btn) {
        input.addEventListener('input', function () { btn.disabled = input.value.trim() !== o.phrase; });
        setTimeout(function () { input.focus(); }, 40);
      }
    }
  }

  /* ------------------------------------------------------------------ palette */
  function buildPalette(q) {
    const query = String(q || '').trim().toLowerCase();
    const groups = [];
    const b = state.board;
    const pages = V.navFor(b).filter(function (n) {
      return !query || n.zh.indexOf(query) >= 0 || n.id.indexOf(query) >= 0;
    });
    if (pages.length) {
      groups.push({ label: '页面', items: pages.map(function (n) {
        return { act: 'nav:' + n.id, title: n.zh, sub: n.id, icon: n.icon };
      }) });
    }
    const actions = [
      { act: 'new-cigar', title: '新增雪茄', sub: '雪茄', icon: 'plus', keys: '新增 添加 雪茄' },
      { act: 'new-pipe', title: '新增斗草', sub: '烟斗草', icon: 'plus', keys: '新增 添加 斗草 烟斗' },
      { act: 'new-rack', title: '新增烟斗', sub: '陈列柜', icon: 'rack', keys: '新增 添加 烟斗 陈列 拍照' },
      { act: 'rack-show', title: '打开陈列柜展示', sub: '陈列柜', icon: 'camera', keys: '展示 照片 陈列 烟斗' },
      { act: 'new-record', title: b === 'pipe' ? '记录一斗' : '新增品吸记录', sub: '记录', icon: 'journal', keys: '记录 品吸 斗' },
      { act: 'backup', title: '导出 JSON 备份', sub: '数据', icon: 'download', keys: '备份 导出' },
      { act: 'xlsx', title: '导出全部 Excel', sub: '数据', icon: 'download', keys: 'excel xlsx 导出' },
      { act: 'set-theme:toggle', title: '切换明暗主题', sub: '外观', icon: 'moon', keys: '主题 暗色 亮色' },
      { act: 'board:pipe', title: '切换到烟斗草', sub: '板块', icon: 'pipe', keys: '斗草 烟斗 切换' },
      { act: 'board:cigar', title: '切换到雪茄', sub: '板块', icon: 'box', keys: '雪茄 切换' }
    ].filter(function (a) {
      return !query || a.title.toLowerCase().indexOf(query) >= 0 || (a.keys || '').indexOf(query) >= 0;
    });
    if (actions.length) groups.push({ label: '操作', items: actions });

    const list = CR.items(b).filter(function (c) {
      if (!query) return Number(c.qty) > 0;
      const hay = b === 'pipe'
        ? [c.brand, c.blend, c.type, c.cut, c.topping, c.jar].join(' ')
        : [c.brand, c.series, c.origin, c.wrapper, c.box].join(' ');
      return hay.toLowerCase().indexOf(query) >= 0;
    }).slice(0, query ? 6 : 4).map(function (c) {
      return {
        act: 'edit-' + b + ':' + c.id,
        title: c.brand + ' · ' + (b === 'pipe' ? c.blend : c.series),
        sub: c.qty + ' ' + CR.unitOf(b) + ' · ' + (b === 'pipe' ? c.type : c.origin),
        icon: b === 'pipe' ? 'pipe' : 'box'
      };
    });
    if (list.length) groups.push({ label: query ? '当前板块' : '库存推荐', items: list });

    if (b === 'pipe') {
      const rack = CR.db.smokingPipes.filter(function (p) {
        if (!query) return true;
        return [p.name, p.maker, p.shape, p.material, p.notes].join(' ').toLowerCase().indexOf(query) >= 0;
      }).slice(0, query ? 5 : 3).map(function (p) {
        return {
          act: 'view-rack:' + p.id,
          title: p.name,
          sub: (p.maker ? p.maker + ' · ' : '') + (p.shape || '烟斗'),
          icon: 'rack'
        };
      });
      if (rack.length) groups.push({ label: '陈列柜', items: rack });
    }

    if (query) {
      const wiki = CR.filterWiki(b, query).slice(0, 5).map(function (w) {
        return { act: 'view-wiki:' + w.id, title: w.title, sub: CR.wikiCat(b, w.cat).zh, icon: 'book' };
      });
      if (wiki.length) groups.push({ label: '百科', items: wiki });
    } else {
      const wiki = CR.wikiAll(b).slice(0, 3).map(function (w) {
        return { act: 'view-wiki:' + w.id, title: w.title, sub: CR.wikiCat(b, w.cat).zh, icon: 'book' };
      });
      groups.push({ label: '百科', items: wiki });
    }
    return groups;
  }

  function paletteCount(groups) {
    return groups.reduce(function (a, g) { return a + g.items.length; }, 0);
  }

  function openPalette() {
    state.palette = { q: '', active: 0, groups: buildPalette('') };
    overlay.innerHTML = V.palette('', state.palette.groups, 0);
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('palette-input');
    if (input) setTimeout(function () { input.focus(); }, 30);
  }

  function closePalette() {
    if (overlay.querySelector('.palette')) {
      overlay.innerHTML = '';
      document.body.style.overflow = '';
    }
  }

  function refreshPaletteList() {
    const list = document.getElementById('palette-list');
    if (!list) return;
    list.innerHTML = V.paletteList(state.palette.groups, state.palette.active);
    const on = list.querySelector('.pal-item.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }

  function paletteMove(delta) {
    const total = paletteCount(state.palette.groups);
    if (!total) return;
    state.palette.active = (state.palette.active + delta + total) % total;
    refreshPaletteList();
  }

  /* ------------------------------------------------------------------ data actions */
  async function testEnrich() {
    const cfg = CR.db.settings.enrich || {};
    const endpoint = String(cfg.endpoint || '').trim();
    const status = document.getElementById('enrich-status');
    if (!endpoint) { toast('先填接口地址', { icon: 'alert' }); return; }
    if (status) status.textContent = '正在连接…';
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 15000);
    try {
      const headers = { 'content-type': 'application/json', accept: 'application/json' };
      if (cfg.token) headers.authorization = 'Bearer ' + cfg.token;
      const res = await fetch(endpoint, {
        method: 'POST', headers: headers, signal: controller.signal,
        body: JSON.stringify({ brand: 'Peterson', blend: 'Nightcap' })
      });
      const data = await res.json().catch(function () { return null; });
      if (!res.ok) throw new Error('HTTP ' + res.status + (data && data.error ? ' · ' + data.error : ''));
      if (!data || (!Array.isArray(data.matches) && !data.match)) throw new Error('返回格式不正确，需要 matches 数组');
      const n = Array.isArray(data.matches) ? data.matches.length : 1;
      if (status) status.textContent = '连接成功 · 测试返回 ' + n + ' 条资料';
      toast('联网接口连接成功', { icon: 'check' });
    } catch (e) {
      if (status) status.textContent = '连接失败：' + (e.name === 'AbortError' ? '超时' : e.message);
      toast('接口测试失败：' + (e.name === 'AbortError' ? '超时' : e.message), { icon: 'alert' });
    } finally {
      clearTimeout(timer);
    }
  }

  async function refreshRates() {
    toast('正在获取今日汇率…', { icon: 'refresh', duration: 2200 });
    const urls = [
      'https://api.frankfurter.dev/v1/latest?base=CNY&symbols=USD,EUR',
      'https://open.er-api.com/v6/latest/CNY'
    ];
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(urls[i], { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const d = await res.json();
        const usd = d.rates && d.rates.USD;
        const eur = d.rates && d.rates.EUR;
        if (!usd || !eur) throw new Error('没有返回汇率');
        CR.db.settings.rates.USD = Math.round((1 / usd) * 100) / 100;
        CR.db.settings.rates.EUR = Math.round((1 / eur) * 100) / 100;
        CR.db.settings.ratesUpdated = CR.todayISO();
        CR.save();
        renderAll(false);
        toast('汇率已更新 · USD ' + CR.db.settings.rates.USD + ' · EUR ' + CR.db.settings.rates.EUR);
        return;
      } catch (e) {}
    }
    toast('获取失败，请检查网络或手动填写', { icon: 'alert' });
  }

  function downloadCsv() {
    const b = state.board;
    if (state.page === 'cabinet') {
      const rows = [['名称', '制作者/品牌', '斗型', '材质', '烟嘴', '长度mm', '重量g', '斗钵深mm', '钵径mm', '入手日期', '入手价CNY', '评分', '喜欢', '有照片', '备注']];
      CR.db.smokingPipes.forEach(function (p) {
        rows.push([p.name, p.maker, p.shape, p.material, p.stem, p.length, p.weight, p.bowlDepth, p.chamber, p.acquired, p.price, p.rating, p.favorite ? '是' : '', p.photo ? '是' : '否', p.notes || '']);
      });
      const csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      CR.download('hamos-pipe-rack-' + CR.todayISO() + '.csv', '\ufeff' + csv, 'text/csv;charset=utf-8');
      toast('烟斗陈列 CSV 已导出');
      return;
    }
    if (b === 'pipe') {
      const rows = [['品牌', '调配', '类型', '裁切', '成分', '加香', '重量g', '罐数', '单价CNY', '小计CNY', '评分', '状态', '入罐日期', '罐码', '浓度', '室韵', '已抽斗数', '风味', '备注', '资料简介']];
      CR.db.pipes.forEach(function (p) {
        rows.push([p.brand, p.blend, p.type, p.cut, (p.components || []).join('、'), p.topping, p.weight, p.qty, p.price, (Number(p.qty) || 0) * (Number(p.price) || 0), p.rating, CR.STATUS[CR.statusOf(p, 'pipe')].label, p.acquired, p.jar, p.strength, p.roomNote, p.bowls, (p.flavors || []).map(function (f) { return CR.tag(f).zh; }).join('、'), p.notes || '', p.description || '']);
      });
      const csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      CR.download('hamos-pipe-' + CR.todayISO() + '.csv', '\ufeff' + csv, 'text/csv;charset=utf-8');
    } else {
      const rows = [['品牌', '系列', '产地', '茄衣', '品型', '长度', '环径', '数量', '单价CNY', '小计CNY', '评分', '状态', '入柜日期', '盒位', '风味', '备注']];
      CR.db.cigars.forEach(function (c) {
        rows.push([c.brand, c.series, c.origin, c.wrapper, c.vitola, c.length, c.ring, c.qty, c.price, (Number(c.qty) || 0) * (Number(c.price) || 0), c.rating, CR.STATUS[CR.statusOf(c, 'cigar')].label, c.acquired, c.box, (c.flavors || []).map(function (f) { return CR.tag(f).zh; }).join('、'), c.notes || '']);
      });
      const csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      CR.download('hamos-cigar-' + CR.todayISO() + '.csv', '\ufeff' + csv, 'text/csv;charset=utf-8');
    }
    toast('CSV 已导出');
  }

  function doBackup() {
    CR.download('hamos-backup-' + CR.todayISO() + '.json', CR.exportJSON(), 'application/json');
    toast('备份已导出');
  }

  function doXlsx() {
    try {
      const bytes = CR.buildXlsx();
      CR.download('hamos-tobacco-' + CR.todayISO() + '.xlsx', new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      toast('Excel 已导出 · 含 5 个工作表', { icon: 'download' });
    } catch (e) {
      toast('导出失败：' + e.message, { icon: 'alert' });
    }
  }

  /* ------------------------------------------------------------------ CRUD */
  function num(v, fallback) {
    const n = Number(v);
    return isFinite(n) ? n : (fallback || 0);
  }

  function saveCigar(form) {
    const fd = new FormData(form);
    const brand = String(fd.get('brand') || '').trim();
    const series = String(fd.get('series') || '').trim();
    if (!brand || !series) { toast('品牌和系列不能为空', { icon: 'alert' }); return; }
    const data = {
      brand: brand, series: series,
      origin: String(fd.get('origin') || '').trim() || '未标注',
      wrapper: String(fd.get('wrapper') || '').trim() || '未标注',
      vitola: String(fd.get('vitola') || '').trim() || '未标注',
      shape: String(fd.get('shape') || '').trim(),
      length: num(fd.get('length')), ring: num(fd.get('ring')),
      qty: Math.max(0, Math.round(num(fd.get('qty')))),
      price: Math.max(0, num(fd.get('price'))),
      rating: Math.min(10, Math.max(0, num(fd.get('rating')))),
      resting: String(fd.get('resting')) === '1',
      acquired: String(fd.get('acquired') || CR.todayISO()),
      boxDate: String(fd.get('boxDate') || ''),
      box: String(fd.get('box') || '').trim(),
      strength: Math.min(5, Math.max(1, Math.round(num(fd.get('strength'), 3)))),
      flavors: String(fd.get('flavors') || '').split(',').filter(Boolean),
      notes: String(fd.get('notes') || '').trim()
    };
    const id = form.dataset.id;
    if (id) {
      const c = CR.db.cigars.find(function (x) { return x.id === id; });
      if (c) Object.assign(c, data);
    } else {
      data.id = CR.uid('c');
      CR.db.cigars.unshift(data);
    }
    CR.save(); closeModal(); renderAll(false);
    toast(id ? '已保存修改' : '已加入库存 · ' + brand + ' · ' + series);
  }

  function savePipe(form) {
    const fd = new FormData(form);
    const brand = String(fd.get('brand') || '').trim();
    const blend = String(fd.get('blend') || '').trim();
    if (!brand || !blend) { toast('品牌和调配名不能为空', { icon: 'alert' }); return; }
    const data = {
      brand: brand, blend: blend,
      type: String(fd.get('type') || '英式'),
      cut: String(fd.get('cut') || '细丝'),
      components: String(fd.get('components') || '').split(',').filter(Boolean),
      topping: String(fd.get('topping') || '无').trim() || '无',
      weight: Math.max(0, num(fd.get('weight'), 50)),
      qty: Math.max(0, Math.round(num(fd.get('qty')))),
      price: Math.max(0, num(fd.get('price'))),
      rating: Math.min(10, Math.max(0, num(fd.get('rating')))),
      cellaring: String(fd.get('cellaring')) === '1',
      acquired: String(fd.get('acquired') || CR.todayISO()),
      tinDate: String(fd.get('tinDate') || ''),
      jar: String(fd.get('jar') || '').trim(),
      strength: Math.min(5, Math.max(1, Math.round(num(fd.get('strength'), 3)))),
      roomNote: Math.min(5, Math.max(1, Math.round(num(fd.get('roomNote'), 3)))),
      flavors: String(fd.get('flavors') || '').split(',').filter(Boolean),
      notes: String(fd.get('notes') || '').trim(),
      description: String(fd.get('description') || '').trim(),
      metaSource: {
        kind: String(fd.get('sourceKind') || ''),
        name: String(fd.get('sourceName') || ''),
        url: String(fd.get('sourceUrl') || ''),
        confidence: Number(fd.get('sourceConfidence')) || 0
      }
    };
    const id = form.dataset.id;
    if (id) {
      const p = CR.db.pipes.find(function (x) { return x.id === id; });
      if (p) Object.assign(p, data);
    } else {
      data.id = CR.uid('p');
      data.bowls = 0;
      CR.db.pipes.unshift(data);
    }
    CR.save(); closeModal(); renderAll(false);
    toast(id ? '已保存修改' : '已加入斗草柜 · ' + brand + ' · ' + blend);
  }

  function saveRecord(form) {
    const fd = new FormData(form);
    const kind = form.dataset.kind === 'pipe' ? 'pipe' : 'cigar';
    const id = form.dataset.id;
    if (kind === 'pipe') {
      const pipeId = String(fd.get('pipeId') || '');
      if (!pipeId) { toast('请先选择一罐斗草', { icon: 'alert' }); return; }
      const data = {
        pipeId: pipeId,
        date: String(fd.get('date') || CR.todayISO()),
        rating: Math.min(10, Math.max(0, num(fd.get('rating')))),
        minutes: Math.max(0, Math.round(num(fd.get('minutes')))),
        relights: Math.max(0, Math.round(num(fd.get('relights')))),
        pipeUsed: String(fd.get('pipeUsed') || '').trim(),
        packing: String(fd.get('packing') || ''),
        moisture: String(fd.get('moisture') || ''),
        pairing: String(fd.get('pairing') || '').trim(),
        location: String(fd.get('location') || '').trim(),
        flavors: String(fd.get('flavors') || '').split(',').filter(Boolean),
        head: String(fd.get('head') || '').trim(),
        mid: String(fd.get('mid') || '').trim(),
        finish: String(fd.get('finish') || '').trim()
      };
      const pipe = CR.db.pipes.find(function (x) { return x.id === pipeId; });
      if (id) {
        const r = CR.db.pipeRecords.find(function (x) { return x.id === id; });
        if (r) Object.assign(r, data);
        CR.save(); closeModal(); renderAll(false);
        toast('斗草记录已更新');
        return;
      }
      data.id = CR.uid('pr');
      CR.db.pipeRecords.push(data);
      if (pipe) pipe.bowls = (Number(pipe.bowls) || 0) + 1;
      CR.save(); closeModal(); go('records');
      toast('已记录 · ' + (pipe ? pipe.brand + ' 第 ' + pipe.bowls + ' 斗' : ''));
      return;
    }

    const cigarId = String(fd.get('cigarId') || '');
    if (!cigarId) { toast('请先选择一支雪茄', { icon: 'alert' }); return; }
    const data = {
      cigarId: cigarId,
      date: String(fd.get('date') || CR.todayISO()),
      rating: Math.min(10, Math.max(0, num(fd.get('rating')))),
      minutes: Math.max(0, Math.round(num(fd.get('minutes')))),
      pairing: String(fd.get('pairing') || '').trim(),
      burn: String(fd.get('burn') || ''),
      ash: String(fd.get('ash') || ''),
      location: String(fd.get('location') || '').trim(),
      flavors: String(fd.get('flavors') || '').split(',').filter(Boolean),
      head: String(fd.get('head') || '').trim(),
      mid: String(fd.get('mid') || '').trim(),
      finish: String(fd.get('finish') || '').trim()
    };
    const cigar = CR.db.cigars.find(function (x) { return x.id === cigarId; });
    if (id) {
      const r = CR.db.records.find(function (x) { return x.id === id; });
      if (r) Object.assign(r, data);
      CR.save(); closeModal(); renderAll(false);
      toast('记录已更新');
      return;
    }
    data.id = CR.uid('r');
    CR.db.records.push(data);
    let left = null;
    if (cigar) {
      if (cigar.qty > 0) cigar.qty -= 1;
      left = cigar.qty;
    }
    CR.save(); closeModal(); go('records');
    toast('已记录' + (cigar ? ' · ' + cigar.brand + ' 剩余 ' + left + ' 支' : ''));
  }

  function saveWiki(form) {
    const fd = new FormData(form);
    const kind = form.dataset.kind === 'pipe' ? 'pipe' : 'cigar';
    const title = String(fd.get('title') || '').trim();
    const body = String(fd.get('body') || '').trim();
    if (!title || !body) { toast('标题和正文不能为空', { icon: 'alert' }); return; }
    const excerpt = String(fd.get('excerpt') || '').trim() || body.slice(0, 54);
    const tags = String(fd.get('tags') || '').split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 4);
    const data = {
      title: title, cat: String(fd.get('cat') || 'brand'), excerpt: excerpt, body: body,
      tags: tags, builtin: false, kind: kind
    };
    const id = form.dataset.id;
    if (id) {
      const w = CR.db.wiki.find(function (x) { return x.id === id; });
      if (w) Object.assign(w, data);
    } else {
      data.id = CR.uid('w');
      CR.db.wiki.unshift(data);
    }
    CR.save(); closeModal(); renderAll(false);
    toast(id ? '词条已更新' : '已新增词条');
  }

  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form.id === 'cigar-form') { e.preventDefault(); saveCigar(form); return; }
    if (form.id === 'pipe-form') { e.preventDefault(); savePipe(form); return; }
    if (form.id === 'record-form') { e.preventDefault(); saveRecord(form); return; }
    if (form.id === 'wiki-form') { e.preventDefault(); saveWiki(form); return; }
    if (form.id === 'rack-form') { e.preventDefault(); saveRack(form); return; }
  });

  /* ------------------------------------------------------------------ delete */
  function deleteCigar(id) {
    const idx = CR.db.cigars.findIndex(function (c) { return c.id === id; });
    if (idx < 0) return;
    const c = CR.db.cigars[idx];
    confirmAction({
      title: '删除这支雪茄？',
      message: '将从库存中移除 <b>' + esc(c.brand + ' · ' + c.series) + '</b>（' + c.qty + ' 支）。已有的品吸记录会保留。',
      warning: '删除后可通过提示条在几秒内撤销。',
      okText: '删除',
      onOk: function () {
        CR.db.cigars.splice(idx, 1); CR.save(); renderAll(false);
        toast('已删除 ' + c.brand + ' · ' + c.series, {
          action: { label: '撤销', fn: function () { CR.db.cigars.splice(idx, 0, c); CR.save(); renderAll(false); } }
        });
      }
    });
  }

  function deletePipe(id) {
    const idx = CR.db.pipes.findIndex(function (p) { return p.id === id; });
    if (idx < 0) return;
    const p = CR.db.pipes[idx];
    confirmAction({
      title: '删除这罐斗草？',
      message: '将从斗草柜移除 <b>' + esc(p.brand + ' · ' + p.blend) + '</b>（' + p.qty + ' 罐）。已有的斗草记录会保留。',
      warning: '删除后可通过提示条在几秒内撤销。',
      okText: '删除',
      onOk: function () {
        CR.db.pipes.splice(idx, 1); CR.save(); renderAll(false);
        toast('已删除 ' + p.brand + ' · ' + p.blend, {
          action: { label: '撤销', fn: function () { CR.db.pipes.splice(idx, 0, p); CR.save(); renderAll(false); } }
        });
      }
    });
  }

  function deleteRecord(id) {
    const kind = state.board;
    const list = CR.records(kind);
    const idx = list.findIndex(function (r) { return r.id === id; });
    if (idx < 0) return;
    const r = list[idx];
    confirmAction({
      title: '删除这篇记录？',
      message: '将删除 <b>' + esc(CR.fmtDate(r.date, 'long')) + '</b> 的' + (kind === 'pipe' ? '斗草' : '品吸') + '记录。库存不会自动加回。',
      okText: '删除',
      onOk: function () {
        list.splice(idx, 1); CR.save(); closeModal(); renderAll(false);
        toast('记录已删除', {
          action: { label: '撤销', fn: function () { list.splice(idx, 0, r); CR.save(); renderAll(false); } }
        });
      }
    });
  }

  function deleteWiki(id) {
    const idx = CR.db.wiki.findIndex(function (w) { return w.id === id; });
    if (idx < 0) return;
    const w = CR.db.wiki[idx];
    confirmAction({
      title: '删除这个词条？',
      message: '将删除自定义词条 <b>' + esc(w.title) + '</b>。',
      okText: '删除',
      onOk: function () {
        CR.db.wiki.splice(idx, 1); CR.save(); closeModal(); renderAll(false);
        toast('词条已删除', {
          action: { label: '撤销', fn: function () { CR.db.wiki.splice(idx, 0, w); CR.save(); renderAll(false); } }
        });
      }
    });
  }

  /* ------------------------------------------------------------------ action */
  function handleAction(act) {
    const i = act.indexOf(':');
    const cmd = i >= 0 ? act.slice(0, i) : act;
    const arg = i >= 0 ? act.slice(i + 1) : '';

    if (cmd !== 'palette' && cmd !== 'palette-close') closePalette();

    if (cmd === 'nav') { go(arg); return; }
    if (cmd === 'board') { setBoard(arg); return; }
    if (cmd === 'palette') { openPalette(); return; }
    if (cmd === 'palette-close') { closePalette(); return; }
    if (cmd === 'close-modal') { closeModal(); return; }
    if (cmd === 'theme-toggle') {
      const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      CR.setSettings({ theme: next }); applySettings(); renderAll(false); return;
    }
    if (cmd === 'set-theme') {
      if (arg === 'toggle') { CR.setSettings({ theme: effectiveTheme() === 'dark' ? 'light' : 'dark' }); }
      else { CR.setSettings({ theme: arg }); }
      applySettings(); renderAll(false); return;
    }
    if (cmd === 'set-accent') { CR.setSettings({ accent: arg }); applySettings(); renderAll(false); return; }
    if (cmd === 'set-zoom') { setZoom(arg); return; }
    if (cmd === 'zoom-step') { setZoom(zoomValue() + Number(arg || 0), false); return; }
    if (cmd === 'zoom-reset') { setZoom(100); return; }
    if (cmd === 'set-currency') { CR.setSettings({ currency: arg }); renderAll(false); return; }
    if (cmd === 'toggle') {
      const patch = {}; patch[arg] = !CR.db.settings[arg];
      CR.setSettings(patch); applySettings(); renderAll(false); return;
    }
    if (cmd === 'new-cigar') { openCigarModal(null); return; }
    if (cmd === 'new-pipe') { openPipeModal(null); return; }
    if (cmd === 'enrich-pipe') { enrichPipeForm(); return; }
    if (cmd === 'enrich-undo') {
      const f = document.getElementById('pipe-form');
      if (f) { restorePipeSnapshot(f); toast('已撤销资料填充'); }
      return;
    }
    if (cmd === 'edit-cigar') {
      const c = CR.db.cigars.find(function (x) { return x.id === arg; });
      if (c) openCigarModal(c); return;
    }
    if (cmd === 'edit-pipe') {
      const p = CR.db.pipes.find(function (x) { return x.id === arg; });
      if (p) openPipeModal(p); return;
    }
    if (cmd === 'del-cigar') { deleteCigar(arg); return; }
    if (cmd === 'del-pipe') { deletePipe(arg); return; }
    if (cmd === 'smoke') { openRecordModal(null, arg); return; }
    if (cmd === 'bowl') { openRecordModal(null, arg); return; }
    if (cmd === 'new-record') { openRecordModal(null, null); return; }
    if (cmd === 'edit-record') {
      const r = CR.records(state.board).find(function (x) { return x.id === arg; });
      if (r) openRecordModal(r); return;
    }
    if (cmd === 'del-record') { deleteRecord(arg); return; }
    if (cmd === 'view-record') {
      const r = CR.enrichedRecords(state.board).find(function (x) { return x.id === arg; });
      if (r) openRecordDetail(r); return;
    }
    if (cmd === 'new-wiki') { openWikiModal(null); return; }
    if (cmd === 'view-wiki') {
      const w = CR.wikiAll(state.board).find(function (x) { return x.id === arg; });
      if (w) openWikiDetail(w); return;
    }
    if (cmd === 'edit-wiki') {
      const w = CR.db.wiki.find(function (x) { return x.id === arg; });
      if (w) openWikiModal(w); return;
    }
    if (cmd === 'del-wiki') { deleteWiki(arg); return; }
    if (cmd === 'new-rack') { openRackModal(null); return; }
    if (cmd === 'rack-show') { openRackShow(); return; }
    if (cmd === 'view-rack') {
      const p = CR.db.smokingPipes.find(function (x) { return x.id === arg; });
      if (p) openRackDetail(p); return;
    }
    if (cmd === 'edit-rack') {
      const p = CR.db.smokingPipes.find(function (x) { return x.id === arg; });
      if (p) openRackModal(p); return;
    }
    if (cmd === 'del-rack') { deleteRack(arg); return; }
    if (cmd === 'rack-fav') { toggleRackFav(arg); return; }
    if (cmd === 'rack-fav-filter') { state.rack.fav = !state.rack.fav; renderPage(false); return; }
    if (cmd === 'rack-clear') {
      state.rack = { q: '', shape: '', material: '', sort: 'default', fav: false };
      renderPage(false); return;
    }
    if (cmd === 'rack-photo-clear') {
      const form = document.getElementById('rack-form');
      if (form) {
        form.querySelector('input[name=photo]').value = '';
        const preview = document.getElementById('rack-photo-preview');
        if (preview) preview.innerHTML = rackPlaceholder();
        toast('照片已移除');
      }
      return;
    }
    if (cmd === 'wiki-cat') { state.wiki.cat = arg; renderPage(false); return; }
    if (cmd === 'status') {
      state.inv.status = arg;
      const box = document.getElementById('inv-results');
      if (box) box.innerHTML = V.inventoryResults(state);
      return;
    }
    if (cmd === 'view') {
      state.inv.view = arg;
      const box = document.getElementById('inv-results');
      if (box) box.innerHTML = V.inventoryResults(state);
      return;
    }
    if (cmd === 'flavor') {
      const idx = state.flavors.indexOf(arg);
      if (idx >= 0) state.flavors.splice(idx, 1); else state.flavors.push(arg);
      renderPage(false); return;
    }
    if (cmd === 'flavor-clear') { state.flavors = []; renderPage(false); return; }
    if (cmd === 'inv-brand') {
      if (arg === '其他') return;
      go('inventory', { brand: arg, status: 'all' }); return;
    }
    if (cmd === 'inv-type') {
      state.inv.type = state.inv.type === arg ? '' : arg;
      state.inv.status = 'all';
      renderPage(false); return;
    }
    if (cmd === 'goto') {
      if (arg.indexOf('cigar:') === 0) {
        const c = CR.db.cigars.find(function (x) { return x.id === arg.slice(6); });
        if (c) openCigarModal(c);
      } else if (arg.indexOf('pipe:') === 0) {
        const p = CR.db.pipes.find(function (x) { return x.id === arg.slice(5); });
        if (p) openPipeModal(p);
      } else if (arg.indexOf('page:') === 0) {
        go(arg.slice(5));
      }
      return;
    }
    if (cmd === 'backup') { doBackup(); return; }
    if (cmd === 'xlsx') { doXlsx(); return; }
    if (cmd === 'csv') { downloadCsv(); return; }
    if (cmd === 'refresh-rates') { refreshRates(); return; }
    if (cmd === 'toggle-enrich') {
      const e = CR.db.settings.enrich;
      e.enabled = !e.enabled;
      CR.save(); renderAll(false);
      toast(e.enabled ? '联网补全已开启' : '联网补全已关闭');
      return;
    }
    if (cmd === 'test-enrich') { testEnrich(); return; }
    if (cmd === 'restore') {
      const f = document.getElementById('import-file');
      if (f) { f.value = ''; f.click(); }
      return;
    }
    if (cmd === 'seed') {
      confirmAction({
        title: '载入示例数据？',
        message: '当前两个板块的库存与记录会被示例数据替换。建议先导出一份备份。',
        okText: '载入示例',
        onOk: function () {
          const keep = CR.db.settings;
          const rack = CR.db.smokingPipes;
          closeModal(); CR.resetToSeed(); CR.db.settings = keep; CR.db.smokingPipes = rack; CR.save();
          applySettings(); renderAll(false);
          toast('示例数据已载入');
        }
      });
      return;
    }
    if (cmd === 'clear') {
      confirmAction({
        title: '清空所有数据？',
        message: '雪茄、斗草、两份品吸记录、自定义词条都会被永久删除。内置百科与设置会保留。',
        warning: '这个操作无法撤销，请确认已经导出备份。',
        phrase: '清空',
        okText: '清空数据',
        onOk: function () {
          closeModal(); CR.clearData(); renderAll(false);
          toast('数据已清空');
        }
      });
      return;
    }
    if (cmd === 'confirm-ok') {
      const btn = overlay.querySelector('[data-act=confirm-ok]');
      if (btn && btn.disabled) return;
      const cb = confirmCb;
      confirmCb = null;
      closeModal();
      if (cb) cb();
      return;
    }
  }

  /* ------------------------------------------------------------------ events */
  document.addEventListener('click', function (e) {
    const overlayEl = e.target.closest('.overlay');
    if (overlayEl && !e.target.closest('[data-stop]') && !overlayEl.classList.contains('palette-overlay')) {
      closeModal();
      return;
    }
    if (e.target.classList.contains('palette-overlay')) { closePalette(); return; }

    const pickerTag = e.target.closest('#flavor-picker .tag[data-tag]');
    if (pickerTag) {
      pickerTag.classList.toggle('on');
      const form = pickerTag.closest('form');
      const picker = pickerTag.closest('#flavor-picker');
      form.querySelector('input[name=flavors]').value = Array.from(picker.querySelectorAll('.tag.on')).map(function (t) { return t.dataset.tag; }).join(',');
      return;
    }
    const compTag = e.target.closest('#component-picker .tag[data-component]');
    if (compTag) {
      compTag.classList.toggle('on');
      const form = compTag.closest('form');
      const picker = compTag.closest('#component-picker');
      form.querySelector('input[name=components]').value = Array.from(picker.querySelectorAll('.tag.on')).map(function (t) { return t.dataset.component; }).join(',');
      return;
    }

    const el = e.target.closest('[data-act]');
    if (!el) return;
    e.preventDefault();
    handleAction(el.dataset.act);
  });

  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.id === 'inv-search') {
      state.inv.q = t.value;
      const box = document.getElementById('inv-results');
      if (box) box.innerHTML = V.inventoryResults(state);
      return;
    }
    if (t.id === 'wiki-search') {
      state.wiki.q = t.value;
      const box = document.getElementById('wiki-results');
      if (box) box.innerHTML = V.wikiResults(state);
      const count = document.getElementById('wiki-count');
      if (count) count.textContent = CR.filterWiki(state.board, state.wiki.q, state.wiki.cat).length + ' 条';
      return;
    }
    if (t.id === 'rack-search') {
      state.rack.q = t.value;
      const box = document.getElementById('rack-results');
      if (box) box.innerHTML = V.cabinetResults(state);
      return;
    }
    if (t.matches('[data-zoom-range]')) {
      setZoom(t.value, false);
      return;
    }
    if (t.id === 'palette-input') {
      state.palette.q = t.value;
      state.palette.groups = buildPalette(t.value);
      state.palette.active = 0;
      refreshPaletteList();
      return;
    }
    if (t.id === 'confirm-phrase') {
      const btn = overlay.querySelector('[data-act=confirm-ok]');
      if (btn) btn.disabled = t.value.trim() !== confirmPhrase;
      return;
    }
    if (t.matches('[data-range=rating]')) {
      paintRange(t);
      const out = t.closest('.field').querySelector('.range-val');
      if (out) out.textContent = Number(t.value).toFixed(1);
      return;
    }
  });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.matches('select[data-filter]')) {
      state.inv[t.dataset.filter] = t.value;
      const box = document.getElementById('inv-results');
      if (box) box.innerHTML = V.inventoryResults(state);
      return;
    }
    if (t.matches('[data-rack-filter]')) {
      state.rack[t.dataset.rackFilter] = t.value;
      const box = document.getElementById('rack-results');
      if (box) box.innerHTML = V.cabinetResults(state);
      return;
    }
    if (t.id === 'record-cigar') {
      const c = CR.db.cigars.find(function (x) { return x.id === t.value; });
      const box = document.getElementById('record-preview');
      if (box) box.innerHTML = V.cigarPreview(c);
      return;
    }
    if (t.id === 'record-pipe') {
      const p = CR.db.pipes.find(function (x) { return x.id === t.value; });
      const box = document.getElementById('record-preview');
      if (box) box.innerHTML = V.pipePreview(p);
      return;
    }
    if (t.matches('[data-rate]')) {
      const v = Number(t.value);
      if (!isFinite(v) || v <= 0) { toast('汇率需要大于 0', { icon: 'alert' }); t.value = CR.db.settings.rates[t.dataset.rate]; return; }
      CR.db.settings.rates[t.dataset.rate] = v;
      CR.db.settings.ratesUpdated = CR.todayISO();
      CR.save();
      toast(t.dataset.rate + ' 汇率已更新');
      return;
    }
    if (t.matches('[data-enrich-field]')) {
      const field = t.dataset.enrichField;
      const cfg = CR.db.settings.enrich;
      cfg[field] = t.value.trim();
      CR.save();
      const status = document.getElementById('enrich-status');
      if (status) status.textContent = cfg.endpoint ? '地址已保存，可测试连接' : '未配置接口地址';
      return;
    }
    if (t.id === 'import-file' && t.files && t.files[0]) {
      const file = t.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        confirmAction({
          title: '读取这份备份？',
          message: '将用 <b>' + esc(file.name) + '</b> 覆盖当前的库存、记录、百科与设置。',
          warning: '当前数据不会自动备份。',
          okText: '覆盖并读取',
          okClass: 'btn-primary',
          onOk: function () {
            try {
              CR.importJSON(String(reader.result));
              closeModal(); applySettings(); renderAll(true);
              toast('备份已读取');
            } catch (err) {
              toast('读取失败：' + err.message, { icon: 'alert' });
            }
          }
        });
      };
      reader.readAsText(file);
      return;
    }
  });

  document.addEventListener('keydown', function (e) {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    const typing = /INPUT|TEXTAREA|SELECT/.test(tag);

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (document.getElementById('palette-input')) closePalette(); else openPalette();
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoomValue() + 10); return; }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(zoomValue() - 10); return; }
      if (e.key === '0') { e.preventDefault(); setZoom(100); return; }
    }
    if (e.key === 'Escape') {
      if (document.getElementById('palette-input')) { closePalette(); return; }
      if (overlay.innerHTML) { closeModal(); return; }
      return;
    }
    if (document.getElementById('palette-input')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteMove(1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); paletteMove(-1); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        const on = document.querySelector('#palette-list .pal-item.on');
        if (on) { const act = on.dataset.act; closePalette(); handleAction(act); }
        return;
      }
    }
    if (typing) return;
    if (e.key === '/') {
      e.preventDefault();
      if (state.page === 'inventory') {
        const box = document.getElementById('inv-search');
        if (box) box.focus();
      } else openPalette();
      return;
    }
    if (overlay.innerHTML) return;
    const nav = V.navFor(state.board);
    if (/^\d$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < nav.length) {
        e.preventDefault();
        go(nav[idx].id);
      }
    }
  });

  document.addEventListener('wheel', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setZoom(zoomValue() + (e.deltaY < 0 ? 5 : -5), false);
  }, { passive: false });

  window.addEventListener('hashchange', function () {
    const params = parseRoute();
    navActive();
    renderPage(true);
    if (params.get('new') === 'cigar') setTimeout(function () { openCigarModal(null); }, 60);
    if (params.get('new') === 'pipe') setTimeout(function () { openPipeModal(null); }, 60);
    if (params.get('new') === 'record') setTimeout(function () { openRecordModal(null, null); }, 60);
    if (params.get('new') === 'rack') setTimeout(function () { openRackModal(null); }, 60);
    if (params.get('show') === 'rack') setTimeout(function () { openRackShow(); }, 60);
    if (params.get('edit')) setTimeout(function () {
      const c = CR.db.cigars.find(function (x) { return x.id === params.get('edit'); });
      if (c) openCigarModal(c);
    }, 60);
  });

  /* --------------------------------------------------------------------- boot */
  function boot() {
    const search = new URLSearchParams(location.search);
    if (search.get('reset') === '1') {
      try { localStorage.removeItem(CR.KEY); } catch (e) {}
    }
    CR.init();
    if (search.get('theme') === 'dark') CR.db.settings.theme = 'dark';
    if (search.get('theme') === 'light') CR.db.settings.theme = 'light';
    if (search.get('theme') === 'auto') CR.db.settings.theme = 'auto';
    if (search.get('board') === 'pipe') state.board = 'pipe';
    if (search.get('board') === 'cigar') state.board = 'cigar';
    if (search.get('zoom')) CR.db.settings.zoom = CR.clamp(Number(search.get('zoom')) || 100, ZOOM_MIN, ZOOM_MAX);
    applySettings();

    const params = parseRoute();
    if (!location.hash) history.replaceState(null, '', '#inventory');
    renderAll(false);
    navActive();
    if (search.get('reset') === '1') {
      search.delete('reset');
      const q = search.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    }

    if (params.get('new') === 'cigar') setTimeout(function () { openCigarModal(null); }, 80);
    if (params.get('new') === 'pipe') setTimeout(function () { openPipeModal(null); }, 80);
    if (params.get('new') === 'record') setTimeout(function () { openRecordModal(null, null); }, 80);
    if (params.get('new') === 'rack') setTimeout(function () { openRackModal(null); }, 80);
    if (params.get('show') === 'rack') setTimeout(function () { openRackShow(); }, 80);
    if (params.get('edit')) setTimeout(function () {
      const c = CR.db.cigars.find(function (x) { return x.id === params.get('edit'); });
      if (c) openCigarModal(c);
    }, 80);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
