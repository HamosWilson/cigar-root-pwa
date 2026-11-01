/* Hamos 的烟草生活 — shared view helpers + inventory / overview / flavour */
(function () {
  'use strict';

  const CR = window.CigarRoot;
  const esc = CR.esc;
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.4-3.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/>',
    upload: '<path d="M12 16V4"/><path d="M7 8l5-5 5 5"/><path d="M4 21h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3-2-5-3.5-7C14 6 13 4 13 2c-2 2-3 4-3 6-1 0-2-1-2-2-1.5 2-3 4-3 7C5 19.3 8 22 12 22z"/>',
    pipe: '<path d="M3 17h7a4 4 0 0 0 4-4V9"/><path d="M3 17c0-3 2-5 5-5h2"/><path d="M14 9h7"/><path d="M3 17h4"/>',
    rack: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M7 6h4M14 12h3M6 18h5"/>',
    camera: '<path d="M4 8h3l1.6-2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3z"/>',
    tag: '<path d="M20 13l-7 7-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7z"/>',
    journal: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/>',
    alert: '<path d="M12 3l9 17H3z"/><path d="M12 9v5M12 17h.01"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    refresh: '<path d="M20 11A8 8 0 0 0 6 6.5L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4.5l3-2.5"/><path d="M21 20v-5h-5"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v6H4V4h6"/>'
  };

  const BOARDS = {
    cigar: {
      id: 'cigar', zh: '雪茄', en: 'CIGAR', unit: '支', kicker: 'THE HUMIDOR',
      subtitle: '记录每一支雪茄的来处、状态与去处。价格、评分与风味都留在这里。',
      itemNew: '新增雪茄', smoke: '灰一支', aging: '养护中', ageWord: '入柜', slot: '盒位',
      empty: '你的雪茄窖还空着', emptyText: '添加第一支雪茄，开始记录它的来处、价格与风味。'
    },
    pipe: {
      id: 'pipe', zh: '烟斗草', en: 'PIPE TOBACCO', unit: '罐', kicker: 'THE CELLAR',
      subtitle: '记录每一罐斗草的调配、裁切与陈化。一斗四十分钟，慢慢来。',
      itemNew: '新增斗草', smoke: '抽一斗', aging: '陈化中', ageWord: '入罐', slot: '罐码',
      empty: '你的斗草柜还空着', emptyText: '添加第一罐烟斗草，记录配方、裁切与开罐感受。'
    }
  };

  function boardOf(state) {
    return BOARDS[state && state.board === 'pipe' ? 'pipe' : 'cigar'];
  }

  function ic(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  function head(kicker, title, sub, actions) {
    return '<header class="page-head">' +
      '<div class="head-copy"><div class="kicker">' + esc(kicker) + '</div>' +
      '<h1 class="title">' + title + '</h1>' +
      (sub ? '<p class="subtitle">' + sub + '</p>' : '') + '</div>' +
      (actions ? '<div class="head-actions">' + actions + '</div>' : '') +
      '</header>';
  }

  function emptyState(opts) {
    const o = opts || {};
    const rackArt = '<rect x="10" y="10" width="100" height="70" rx="5"/><path d="M10 34h100M10 58h100"/>' +
      '<path d="M22 30h17c5 0 8-4 8-9v-2"/><path d="M22 30c0-6 4-10 9-10h6"/><path d="M47 19h13"/>' +
      '<path d="M67 52h15c4 0 7-3 7-7v-2"/><path d="M67 52c0-5 3-8 7-8h5"/><path d="M89 43h10"/>' +
      '<ellipse cx="76" cy="50" rx="1.6" ry="1.6"/><ellipse cx="31" cy="26" rx="1.6" ry="1.6"/>';
    return '<div class="empty">' +
      '<svg class="art" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.1" style="color:var(--line-2)">' +
      (o.art === 'rack' ? rackArt :
        '<rect x="14" y="34" width="92" height="42" rx="5"/><path d="M14 47h92"/>' +
        '<rect x="26" y="24" width="52" height="10" rx="5" transform="rotate(-4 26 24)"/>' +
        '<rect x="38" y="52" width="34" height="8" rx="4"/><path d="M43 52v8M49 52v8M55 52v8M61 52v8M67 52v8" opacity=".5"/>' +
        '<path d="M82 20c3-5 1-9 4-12M88 24c2-4 0-7 3-10" opacity=".55"/>') +
      '</svg>' +
      '<h3>' + esc(o.title || '这里还是空的') + '</h3>' +
      '<p>' + (o.text || '添加第一支雪茄，开始建立你的私人雪茄窖。') + '</p>' +
      (o.action || '') + '</div>';
  }

  function statusPill(item, kind) {
    const st = CR.statusOf(item, kind);
    const label = st === 'aging' ? CR.agingLabel(kind) : CR.STATUS[st].label;
    return '<span class="pill ' + CR.STATUS[st].cls + '">' + label + '</span>';
  }

  function faviconMark() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c98a52"/><stop offset="1" stop-color="#8a4b2a"/></linearGradient></defs>' +
      '<g transform="rotate(-24 16 16)"><rect x="3" y="12" width="22" height="7" rx="3.5" fill="url(#bm)"/>' +
      '<rect x="16" y="12" width="6" height="7" fill="#3b2a1c"/>' +
      '<rect x="17.2" y="13" width="3.6" height="5" fill="none" stroke="#d9b47c" stroke-width=".5" opacity=".8"/>' +
      '<circle cx="25" cy="15.5" r="2.4" fill="#d98a45"/><circle cx="25.6" cy="15.5" r="1" fill="#f6d09a"/></g>' +
      '<path d="M24 9c1.6-2.6.4-4.7 2-6" stroke="#c98a52" stroke-width="1" stroke-linecap="round" opacity=".55" fill="none"/>' +
      '</svg>';
  }

  const NAV = [
    { id: 'inventory', zh: '库存', icon: 'box' },
    { id: 'overview', zh: '总览', icon: 'chart' },
    { id: 'flavor', zh: '风味', icon: 'leaf' },
    { id: 'records', zh: '记录', icon: 'journal' },
    { id: 'wiki', zh: '百科', icon: 'book' },
    { id: 'settings', zh: '设置', icon: 'sliders' }
  ];
  const CABINET_NAV = { id: 'cabinet', zh: '陈列柜', icon: 'rack', pipeOnly: true };

  function navFor(b) {
    const list = NAV.slice();
    if (b === 'pipe') list.splice(1, 0, CABINET_NAV);
    return list;
  }

  /* ============================================================== inventory */
  function cigarCard(c, i) {
    const p = CR.paletteFor(c.brand);
    const qty = Number(c.qty) || 0;
    const price = Number(c.price) || 0;
    const rating = Number(c.rating) || 0;
    const age = CR.daysSince(c.acquired);
    return '<article class="cigar-card' + (qty <= 0 ? ' is-empty' : '') + '" style="--tint:' + p.tint + ';--tint-ink:' + p.ink + ';--i:' + Math.min(i, 14) + '">' +
      '<div class="cc-top"><span class="cc-brand" title="' + esc(c.brand) + '">' + esc(c.brand) + '</span>' + statusPill(c, 'cigar') + '</div>' +
      '<h3 class="cc-series">' + esc(c.series) + '</h3>' +
      '<div class="cc-meta">' +
        '<div class="cc-line"><b>' + esc(c.origin) + '</b><span class="sep">·</span>茄衣 ' + esc(c.wrapper) + '</div>' +
        '<div class="cc-line">' + esc(c.vitola) + '<span class="sep">·</span>' + (Number(c.length) || '—') + '″ × ' + (Number(c.ring) || '—') + '<span class="sep">·</span>浓度 ' + CR.strengthDots(c.strength) + '</div>' +
        '<div class="cc-line">盒位 <b>' + esc(c.box || '—') + '</b><span class="sep">·</span>' + (c.resting ? '养护 ' + age + ' 天' : '入柜 ' + CR.fmtDate(c.acquired, 'ym')) + '</div>' +
      '</div>' +
      '<div class="cc-tags">' + CR.tagsHTML(c.flavors, 3) + '</div>' +
      '<div class="cc-foot">' +
        '<div class="cc-qty"><b>' + qty + '</b><span>支</span></div>' +
        '<div class="cc-rate">' + CR.stars(rating) + '<b>' + (rating ? rating.toFixed(1) : '—') + '</b></div>' +
        '<div class="cc-value"><b>' + CR.money(qty * price) + '</b><span>' + CR.money(price) + ' / 支</span></div>' +
      '</div>' +
      '<div class="cc-actions">' +
        '<button class="smoke" data-act="smoke:' + c.id + '"' + (qty <= 0 ? ' disabled' : '') + '>' + ic('flame') + '灰一支</button>' +
        '<button data-act="edit-cigar:' + c.id + '">' + ic('edit') + '编辑</button>' +
        '<button class="danger" data-act="del-cigar:' + c.id + '">' + ic('trash') + '删除</button>' +
      '</div>' +
      '</article>';
  }

  function pipeCard(p, i) {
    const pal = CR.pipeTypePalette(p.type);
    const qty = Number(p.qty) || 0;
    const price = Number(p.price) || 0;
    const rating = Number(p.rating) || 0;
    const aged = CR.monthsAged(p);
    const comps = (p.components || []).slice(0, 3).join(' · ');
    return '<article class="cigar-card pipe-card' + (qty <= 0 ? ' is-empty' : '') + '" style="--tint:' + pal.tint + ';--tint-ink:' + pal.ink + ';--i:' + Math.min(i, 14) + '">' +
      '<div class="cc-top"><span class="cc-brand" title="' + esc(p.brand) + '">' + esc(p.brand) + '</span>' + statusPill(p, 'pipe') + '</div>' +
      '<h3 class="cc-series">' + esc(p.blend) + '</h3>' +
      '<div class="cc-meta">' +
        '<div class="cc-line"><span class="type-dot" style="background:' + pal.ink + '"></span><b>' + esc(p.type) + '</b><span class="sep">·</span>' + esc(p.cut) + '<span class="sep">·</span>' + (Number(p.weight) || 50) + ' g</div>' +
        '<div class="cc-line">' + esc(comps) + (p.topping && p.topping !== '无' ? '<span class="sep">·</span>加香 ' + esc(p.topping) : '') + '</div>' +
        '<div class="cc-line">' + (p.cellaring ? '罐码 <b>' + esc(p.jar || '—') + '</b><span class="sep">·</span>陈化 ' + aged + ' 个月' : '罐码 <b>' + esc(p.jar || '—') + '</b><span class="sep">·</span>入罐 ' + CR.fmtDate(p.acquired, 'ym')) + '</div>' +
      '</div>' +
      '<div class="cc-tags">' + CR.tagsHTML(p.flavors, 3) + '</div>' +
      '<div class="cc-foot">' +
        '<div class="cc-qty"><b>' + qty + '</b><span>罐</span><em class="cc-bowls">已抽 ' + (Number(p.bowls) || 0) + ' 斗</em></div>' +
        '<div class="cc-rate">' + CR.stars(rating) + '<b>' + (rating ? rating.toFixed(1) : '—') + '</b></div>' +
        '<div class="cc-value"><b>' + CR.money(qty * price) + '</b><span>' + CR.money(price) + ' / 罐</span></div>' +
      '</div>' +
      '<div class="cc-actions">' +
        '<button class="smoke" data-act="bowl:' + p.id + '"' + (qty <= 0 ? ' disabled' : '') + '>' + ic('pipe') + '抽一斗</button>' +
        '<button data-act="edit-pipe:' + p.id + '">' + ic('edit') + '编辑</button>' +
        '<button class="danger" data-act="del-pipe:' + p.id + '">' + ic('trash') + '删除</button>' +
      '</div>' +
      '</article>';
  }

  function inventoryTable(list, board) {
    const unit = CR.unitOf(board);
    const rows = list.map((c) => {
      const st = CR.statusOf(c, board);
      if (board === 'pipe') {
        return '<tr>' +
          '<td><span class="b">' + esc(c.brand) + '</span><br><span class="muted">' + esc(c.blend) + '</span></td>' +
          '<td><span class="type-dot" style="background:' + CR.pipeTypePalette(c.type).ink + '"></span>' + esc(c.type) + '<br><span class="muted">' + esc(c.cut) + '</span></td>' +
          '<td>' + esc((c.components || []).join('、')) + '</td>' +
          '<td class="num">' + (Number(c.weight) || '—') + ' g</td>' +
          '<td class="num">' + (Number(c.qty) || 0) + '</td>' +
          '<td class="num">' + CR.money(c.price) + '</td>' +
          '<td class="num">' + CR.money((Number(c.qty) || 0) * (Number(c.price) || 0)) + '</td>' +
          '<td>' + (Number(c.rating) ? Number(c.rating).toFixed(1) : '—') + '</td>' +
          '<td><span class="pill ' + CR.STATUS[st].cls + '">' + CR.STATUS[st].label + '</span></td>' +
          '<td><div class="row-actions">' +
            '<button title="抽一斗" data-act="bowl:' + c.id + '"' + ((Number(c.qty) || 0) <= 0 ? ' disabled' : '') + '>' + ic('pipe') + '</button>' +
            '<button title="编辑" data-act="edit-pipe:' + c.id + '">' + ic('edit') + '</button>' +
            '<button class="danger" title="删除" data-act="del-pipe:' + c.id + '">' + ic('trash') + '</button>' +
          '</div></td></tr>';
      }
      return '<tr>' +
        '<td><span class="b">' + esc(c.brand) + '</span><br><span class="muted">' + esc(c.series) + '</span></td>' +
        '<td>' + esc(c.origin) + '<br><span class="muted">' + esc(c.wrapper) + '</span></td>' +
        '<td>' + esc(c.vitola) + '<br><span class="muted">' + (Number(c.length) || '—') + '″ × ' + (Number(c.ring) || '—') + '</span></td>' +
        '<td class="num">' + (Number(c.qty) || 0) + '</td>' +
        '<td class="num">' + CR.money(c.price) + '</td>' +
        '<td class="num">' + CR.money((Number(c.qty) || 0) * (Number(c.price) || 0)) + '</td>' +
        '<td>' + (Number(c.rating) ? Number(c.rating).toFixed(1) : '—') + '</td>' +
        '<td><span class="pill ' + CR.STATUS[st].cls + '">' + CR.STATUS[st].label + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button title="灰一支" data-act="smoke:' + c.id + '"' + ((Number(c.qty) || 0) <= 0 ? ' disabled' : '') + '>' + ic('flame') + '</button>' +
          '<button title="编辑" data-act="edit-cigar:' + c.id + '">' + ic('edit') + '</button>' +
          '<button class="danger" title="删除" data-act="del-cigar:' + c.id + '">' + ic('trash') + '</button>' +
        '</div></td></tr>';
    }).join('');
    const headers = board === 'pipe'
      ? ['斗草', '类型 / 裁切', '成分', '规格', '罐数', '单价', '小计', '评分', '状态', '']
      : ['雪茄', '产地 / 茄衣', '尺寸', '数量', '单价', '小计', '评分', '状态', ''];
    return '<div class="tablewrap"><table class="inv-table"><thead><tr>' +
      headers.map((h) => '<th>' + h + '</th>').join('') +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function inventoryResults(state) {
    const b = state.board === 'pipe' ? 'pipe' : 'cigar';
    const meta = BOARDS[b];
    const s = state.inv || {};
    const list = CR.filterItems(b, s);
    const qty = list.reduce((a, c) => a + (Number(c.qty) || 0), 0);
    const value = list.reduce((a, c) => a + (Number(c.qty) || 0) * (Number(c.price) || 0), 0);
    const statuses = [
      { id: 'all', label: '全部' }, { id: 'ready', label: '在柜' }, { id: 'aging', label: meta.aging },
      { id: 'low', label: '低库存' }, { id: 'top', label: '高分' }, { id: 'empty', label: '已空' }
    ];
    let body;
    if (!list.length) {
      const filtered = s.q || s.brand || s.status !== 'all' || s.type || s.cut || s.origin || s.wrapper;
      body = emptyState({
        title: filtered ? '没有符合条件的' + meta.zh : meta.empty,
        text: filtered ? '换个关键词或清除筛选条件再看看。' : meta.emptyText,
        action: '<button class="btn btn-primary" data-act="new-' + b + '">' + ic('plus') + meta.itemNew + '</button>'
      });
    } else {
      body = s.view === 'list'
        ? inventoryTable(list, b)
        : '<div class="grid">' + list.map((c, i) => b === 'pipe' ? pipeCard(c, i) : cigarCard(c, i)).join('') + '</div>';
    }
    return '<div class="inv-meta">' +
        '<span>当前 <b>' + list.length + '</b> 款 · <b>' + qty + '</b> ' + meta.unit + ' · 估值 <b>' + CR.money(value) + '</b></span>' +
        '<div class="chips">' + statuses.map(function (x) {
          return '<button class="chip' + ((s.status || 'all') === x.id ? ' on' : '') + '" data-act="status:' + x.id + '">' + x.label + '</button>';
        }).join('') + '</div>' +
        '<div class="view-toggle">' +
          '<button class="' + (s.view !== 'list' ? 'on' : '') + '" data-act="view:grid" title="卡片视图">' + ic('grid') + '</button>' +
          '<button class="' + (s.view === 'list' ? 'on' : '') + '" data-act="view:list" title="列表视图">' + ic('list') + '</button>' +
        '</div>' +
      '</div>' + body;
  }

  function inventory(state) {
    const b = state.board === 'pipe' ? 'pipe' : 'cigar';
    const meta = BOARDS[b];
    const s = state.inv || {};
    const st = CR.stats(b);
    const all = CR.items(b);
    const brands = CR.uniq(all.map((c) => c.brand));
    const origins = CR.uniq(all.map((c) => c.origin));
    const wrappers = CR.uniq(all.map((c) => c.wrapper));
    const types = CR.uniq(all.map((c) => c.type));
    const cuts = CR.uniq(all.map((c) => c.cut));
    const sel = function (val, cur) { return val === cur ? ' selected' : ''; };
    const opts = function (arr, cur) {
      return arr.map(function (x) { return '<option value="' + esc(x) + '"' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    };

    const actions = '<button class="btn" data-act="xlsx">' + ic('download') + '导出 Excel</button>' +
      '<button class="btn" data-act="backup">' + ic('db') + '备份</button>' +
      '<button class="btn btn-primary" data-act="new-' + b + '">' + ic('plus') + meta.itemNew + '</button>';

    const filters = b === 'pipe'
      ? '<select class="input" data-filter="brand"><option value="">全部品牌</option>' + opts(brands, s.brand) + '</select>' +
        '<select class="input" data-filter="type"><option value="">全部类型</option>' + opts(types, s.type) + '</select>' +
        '<select class="input" data-filter="cut"><option value="">全部裁切</option>' + opts(cuts, s.cut) + '</select>'
      : '<select class="input" data-filter="brand"><option value="">全部品牌</option>' + opts(brands, s.brand) + '</select>' +
        '<select class="input" data-filter="origin"><option value="">全部产地</option>' + opts(origins, s.origin) + '</select>' +
        '<select class="input" data-filter="wrapper"><option value="">全部茄衣</option>' + opts(wrappers, s.wrapper) + '</select>';

    const toolbar = '<div class="filterbar">' +
      '<div class="search">' + ic('search') +
        '<input class="input" id="inv-search" data-filter="q" placeholder="搜索' + (b === 'pipe' ? '品牌 / 调配 / 成分 / 风味…' : '品牌 / 系列 / 风味…') + '" value="' + esc(s.q || '') + '" autocomplete="off">' +
      '</div>' + filters +
      '<select class="input" data-filter="sort">' +
        '<option value="default"' + sel('default', s.sort) + '>默认排序</option>' +
        '<option value="value"' + sel('value', s.sort) + '>价值从高到低</option>' +
        '<option value="rating"' + sel('rating', s.sort) + '>评分从高到低</option>' +
        '<option value="acquired"' + sel('acquired', s.sort) + '>最近入库</option>' +
        '<option value="qty"' + sel('qty', s.sort) + '>数量从少到多</option>' +
        '<option value="brand"' + sel('brand', s.sort) + '>品牌 A–Z</option>' +
      '</select>' +
      '</div>';

    const summary = '<div class="summary">' +
      '<div class="sum-cell"><span class="k">在柜</span><b>' + st.qty + '</b><em>' + meta.unit + '</em></div>' +
      '<div class="sum-cell"><span class="k">品种</span><b>' + st.kinds + '</b><em>款</em></div>' +
      '<div class="sum-cell accent"><span class="k">估值</span><b>' + CR.money(st.value) + '</b></div>' +
      '<div class="sum-cell"><span class="k">' + meta.aging + '</span><b>' + st.aging + '</b><em>款</em></div>' +
      '<div class="sum-spacer"></div>' +
      '<div class="sum-cell note">' + CR.db.settings.currency + ' · 单价按当前汇率折算</div>' +
      '</div>';

    let typeLegend = '';
    if (b === 'pipe') {
      const counts = {};
      all.forEach(function (c) { counts[c.type] = (counts[c.type] || 0) + (Number(c.qty) || 0); });
      typeLegend = '<div class="type-legend">' +
        types.map(function (t) {
          const pal = CR.pipeTypePalette(t);
          return '<button class="type-chip' + (s.type === t ? ' on' : '') + '" data-act="inv-type:' + esc(t) + '">' +
            '<i style="background:' + pal.ink + '"></i>' + esc(t) + '<b>' + CR.fmtNum(counts[t] || 0) + '</b></button>';
        }).join('') +
        '<span class="type-legend-note">色块按斗草类型分类</span></div>';
    }

    return head(meta.kicker, '库存 <small>' + (b === 'pipe' ? 'Cellar' : 'Humidor') + '</small>', meta.subtitle, actions) +
      summary + typeLegend + toolbar +
      '<div id="inv-results">' + inventoryResults(state) + '</div>';
  }

  /* =============================================================== overview */
  function overview(state) {
    const b = state.board === 'pipe' ? 'pipe' : 'cigar';
    const meta = BOARDS[b];
    const st = CR.stats(b);
    const db = CR.db;
    const spend = CR.monthlySpend(b, 12);
    const spendTotal = spend.reduce(function (a, x) { return a + x.value; }, 0);
    const peak = spend.slice().sort(function (a, b2) { return b2.value - a.value; })[0];
    const brands = CR.byField(b, 'brand', 6);
    const field2 = b === 'pipe' ? 'type' : 'origin';
    const field3 = b === 'pipe' ? 'cut' : 'wrapper';
    const second = CR.byField(b, field2, 5);
    const third = CR.byField(b, field3, 5);
    const ratings = CR.ratingBuckets(b);
    const profile = CR.flavorProfile(b);
    const topCats = profile.slice().sort(function (a, c) { return c.raw - a.raw; }).slice(0, 2);
    const rem = CR.reminders(b);
    const recents = CR.enrichedRecords(b).slice(0, 4);
    const resting = CR.items(b).filter(function (c) { return (b === 'pipe' ? c.cellaring : c.resting) && Number(c.qty) > 0; });
    const avgMonths = resting.length ? Math.round(resting.reduce(function (a, c) { return a + CR.monthsAged(c); }, 0) / resting.length) : 0;
    const agingPct = Math.min(100, Math.round(avgMonths / 60 * 100));
    const readyQty = CR.items(b).filter(function (c) { return CR.statusOf(c, b) === 'ready'; }).reduce(function (a, c) { return a + Number(c.qty); }, 0);
    const agingQty = CR.items(b).filter(function (c) { return CR.statusOf(c, b) === 'aging'; }).reduce(function (a, c) { return a + Number(c.qty); }, 0);
    const topRated = CR.items(b).filter(function (c) { return Number(c.qty) > 0 && Number(c.rating) > 0; }).sort(function (a, c) { return c.rating - a.rating; })[0];
    const emptyLots = CR.items(b).filter(function (c) { return CR.statusOf(c, b) === 'empty'; }).length;
    const mv = CR.moneyRaw(st.value);
    const ratedCount = CR.records(b).filter(function (r) { return Number(r.rating) > 0; }).length;
    const ratingCount = ratings.reduce(function (a, r) { return a + r.value; }, 0);
    const nineUp = ratings[4].value + ratings[5].value;

    const hero = '<div class="card kpi kpi-hero">' +
      '<div class="kpi-label">' + ic('box') + '库存总估值</div>' +
      '<div class="big-money"><span class="cur">' + mv.symbol + '</span>' + CR.fmtNum(mv.value, mv.value % 1 ? 2 : 0) + '</div>' +
      '<div class="hero-meta"><b>' + st.kinds + '</b> 个品种<span class="dot"></span><b>' + st.qty + '</b> ' + meta.unit + '在柜<span class="dot"></span>均价 <b>' + CR.money(st.avgPrice) + '</b> / ' + meta.unit + '<span class="dot"></span>近 12 月入库 <b>' + CR.money(spendTotal) + '</b></div>' +
      CR.sparkline(spend.map(function (x) { return x.value; }), { w: 640, h: 74 }) +
      '<div class="spark-label"><span>近 12 个月入库支出</span><span></span></div>' +
      '</div>';

    const kpiKinds = '<div class="card kpi">' +
      '<div class="kpi-label">' + ic('grid') + '品种</div>' +
      '<div class="kpi-num">' + st.kinds + '<small>款</small></div>' +
      '<div class="kpi-sub">共 <b>' + st.qty + '</b> ' + meta.unit + ' · 平均 ' + st.avgRating.toFixed(1) + ' 分</div>' +
      '<div class="statusbar" title="在柜 ' + readyQty + ' ' + meta.unit + ' · ' + meta.aging + ' ' + agingQty + ' ' + meta.unit + ' · 空盒 ' + emptyLots + ' 款">' +
        '<i style="width:' + (readyQty / Math.max(1, st.qty) * 100) + '%;background:var(--good)"></i>' +
        '<i style="width:' + (agingQty / Math.max(1, st.qty) * 100) + '%;background:var(--warn)"></i>' +
      '</div>' +
      '</div>';

    const kpiAging = '<div class="card kpi">' +
      '<div class="kpi-label">' + ic('clock') + meta.aging + '</div>' +
      '<div class="kpi-foot"><div><div class="kpi-num">' + st.aging + '<small>款</small></div>' +
      '<div class="kpi-sub">平均陈化 <b>' + avgMonths + '</b> 个月</div></div>' +
      CR.miniRing(agingPct, 56) + '</div>' +
      '</div>';

    const kpiRating = '<div class="card kpi">' +
      '<div class="kpi-label">' + ic('star') + '平均评分</div>' +
      '<div class="kpi-num">' + (st.avgRating ? st.avgRating.toFixed(1) : '—') + '<small>/ 10</small></div>' +
      '<div class="kpi-sub">' + CR.stars(st.avgRating) + ' · ' + ratedCount + ' 次评分</div>' +
      '<div class="kpi-sub">' + st.records + ' 篇' + (b === 'pipe' ? '斗草' : '雪茄') + '记录</div>' +
      '<div class="kpi-foot"><span class="kpi-sub" style="margin:0">最高分 ' + (topRated ? topRated.rating.toFixed(1) : '—') + '</span>' +
        (topRated ? '<span class="chart-badge">' + esc(topRated.brand) + '</span>' : '') + '</div>' +
      '</div>';

    function legendAction(items, prefix) {
      return '<ul class="legend">' + items.map(function (it) {
        return '<li data-act="' + prefix + ':' + esc(it.label) + '" title="' + esc(it.label) + ' · ' + it.value + ' ' + meta.unit + '">' +
          '<i style="background:' + it.color + '"></i><span>' + esc(it.label) + '</span><b>' + CR.fmtNum(it.value) + '</b></li>';
      }).join('') + '</ul>';
    }

    function donutCard(title, data, sub, clickable) {
      return '<article class="card span-4">' +
        '<div class="card-head"><h3 class="card-title">' + title + '</h3><span class="card-total"><b>' + CR.fmtNum(data.total) + '</b> ' + meta.unit + '</span></div>' +
        '<div class="donut-body">' +
          CR.donut(data.items, { size: 148, stroke: 19, unit: ' ' + meta.unit, centerLabel: meta.unit, label: title }) +
          (clickable ? legendAction(data.items, 'inv-brand') : CR.legend(data.items)) +
        '</div>' +
        (sub ? '<div class="chart-foot">' + sub + '</div>' : '') +
        '</article>';
    }

    const brandCard = donutCard('按品牌', brands, '点击品牌可筛选库存', true);
    const secondCard = donutCard(b === 'pipe' ? '按调配类型' : '按产地', second, '');
    const thirdCard = donutCard(b === 'pipe' ? '按裁切' : '按茄衣', third, '');

    const trend = '<article class="card span-8">' +
      '<div class="card-head"><div><h3 class="card-title">入库支出</h3><p class="card-note" style="margin-top:4px">按入库日期统计 · 近 12 个月</p></div>' +
        '<span class="card-total">合计 <b>' + CR.money(spendTotal) + '</b></span></div>' +
      CR.lineChart(spend.map(function (x) { return { label: x.label, value: x.value }; }), { label: '入库支出趋势' }) +
      '<div class="chart-foot"><span>峰值 ' + peak.label + ' · ' + CR.money(peak.value) + '</span><span>' + CR.fmtDate(new Date().toISOString(), 'ym') + '</span></div>' +
      '</article>';

    const radarCard = '<article class="card span-4">' +
      '<div class="card-head"><h3 class="card-title">风味指纹</h3><span class="card-total">按数量加权</span></div>' +
      '<div class="radar-body">' + CR.radar(profile, { size: 315 }) + '</div>' +
      '<div class="profile-note">以 <b>' + esc(topCats[0].label) + '</b> 与 <b>' + esc(topCats[1].label) + '</b> 为主</div>' +
      '</article>';

    const ratingCard = '<article class="card span-4">' +
      '<div class="card-head"><h3 class="card-title">评分分布</h3><span class="card-total"><b>' + nineUp + '</b> ' + meta.unit + ' ≥ 9 分</span></div>' +
      CR.barChart(ratings) +
      '<div class="chart-foot"><span>共 ' + ratingCount + ' ' + meta.unit + '参与统计</span><span>满分 10</span></div>' +
      '</article>';

    const remCard = '<article class="card span-4">' +
      '<div class="card-head"><h3 class="card-title">' + (b === 'pipe' ? '陈化备忘' : '养护备忘') + '</h3><span class="card-total">' + rem.length + ' 条</span></div>' +
      '<div class="reminders">' + rem.map(function (r) {
        const ico = r.kind === 'aging' ? 'clock' : r.kind === 'low' ? 'alert' : r.kind === 'journal' ? 'journal' : 'check';
        return '<div class="remind ' + r.kind + '" data-act="goto:' + esc(r.act) + '">' +
          '<span class="ico">' + ic(ico) + '</span><span class="txt"><b>' + esc(r.title) + '</b><span>' + esc(r.text) + '</span></span></div>';
      }).join('') + '</div>' +
      '</article>';

    const recentCard = '<article class="card span-4">' +
      '<div class="card-head"><h3 class="card-title">最近品吸</h3><span class="card-total"><a href="#records" style="color:var(--accent)">全部记录 →</a></span></div>' +
      '<div class="recent">' + (recents.length ? recents.map(function (r) {
        const sub = b === 'pipe' ? (r.pipeUsed || '未记录烟斗') : (r.pairing || '无佐饮');
        return '<div class="recent-row" data-act="view-record:' + r.id + '">' +
          '<div class="d"><b>' + Number(String(r.date).slice(8, 10)) + '</b>' + Number(String(r.date).slice(5, 7)) + '月</div>' +
          '<div class="n"><b>' + esc(r.name) + '</b><span>' + esc(sub) + ' · ' + (r.minutes || 0) + ' 分钟</span></div>' +
          '<div class="r">' + (Number(r.rating) ? Number(r.rating).toFixed(1) : '—') + '</div>' +
          '</div>';
      }).join('') : '<p class="card-note" style="padding:14px 4px">还没有品吸记录，去写第一篇。</p>') + '</div>' +
      '</article>';

    return head('THE COLLECTION', '总览 <small>Overview</small>', b === 'pipe' ? '一眼看清斗草库存、配方结构与陈化节奏。' : '一眼看清你的雪茄资产、风味结构与养护节奏。') +
      '<div class="kpi-grid">' + hero + kpiKinds + kpiAging + kpiRating + '</div>' +
      '<div class="dash">' + brandCard + secondCard + thirdCard + trend + radarCard + ratingCard + remCard + recentCard + '</div>';
  }

  /* ================================================================ flavour */
  function flavor(state) {
    const b = state.board === 'pipe' ? 'pipe' : 'cigar';
    const meta = BOARDS[b];
    const selected = state.flavors || [];
    const stock = CR.items(b).filter(function (c) { return Number(c.qty) > 0; });
    const profile = CR.flavorProfile(b);
    const top = CR.topFlavors(b, 9);
    const max = Math.max.apply(null, top.map(function (x) { return x.count; }).concat([1]));
    const tagCounts = {};
    stock.forEach(function (c) {
      (c.flavors || []).forEach(function (f) { tagCounts[f] = (tagCounts[f] || 0) + (Number(c.qty) || 0); });
    });
    const cats = window.LEXICON_CATS || [];
    const tags = CR.allTags();
    const allMatched = stock.filter(function (c) {
      return !selected.length || (c.flavors || []).some(function (f) { return selected.indexOf(f) >= 0; });
    }).sort(function (a, c) { return (c.rating || 0) - (a.rating || 0); });
    const matched = allMatched.slice(0, 9);
    const topCats = profile.slice().sort(function (a, c) { return c.raw - a.raw; }).slice(0, 2);

    const selectedTray = '<div class="selection">' +
      (selected.length ? selected.map(function (id) {
        return '<button class="tag on" data-act="flavor:' + id + '" style="--tc:var(--accent)"><i></i>' + esc(CR.tag(id).zh) + ' ×</button>';
      }).join('') + '<button class="clear" data-act="flavor-clear">清空</button>'
        : '<span class="empty-hint">点选下方风味词，立刻筛出对应' + (b === 'pipe' ? '斗草' : '库存') + '。</span>') +
      '</div>';

    const lexicon = '<article class="card span-7">' +
      '<div class="card-head"><div><h3 class="card-title">风味词库</h3><p class="card-note" style="margin-top:4px">' + tags.length + ' 个描述词，覆盖 ' + cats.length + ' 个族</p></div><span class="card-total">' + selected.length + ' 个已选</span></div>' +
      selectedTray +
      '<div class="lex-cats">' + cats.map(function (cat) {
        return '<div class="lex-cat"><div class="h"><span>' + esc(cat.zh) + '</span><em>' + esc(cat.en) + '</em></div><div class="lex-tags">' +
          tags.filter(function (t) { return t.cat === cat.id; }).map(function (t) {
            const on = selected.indexOf(t.id) >= 0;
            return '<button class="lex-tag' + (on ? ' on' : '') + '" data-act="flavor:' + t.id + '" title="' + (tagCounts[t.id] || 0) + ' ' + meta.unit + '">' + esc(t.zh) + '<em>' + esc(t.en) + '</em></button>';
          }).join('') +
          '</div></div>';
      }).join('') + '</div>' +
      '</article>';

    const radar = '<article class="card span-5 radar-card">' +
      '<div class="card-head"><h3 class="card-title">风味指纹</h3><span class="card-total">' + stock.length + ' 款在柜</span></div>' +
      '<div class="radar-body">' + CR.radar(profile, { size: 320 }) + '</div>' +
      '<div class="profile-note">以 <b>' + esc(topCats[0].label) + '</b> 与 <b>' + esc(topCats[1].label) + '</b> 最突出</div>' +
      '<div class="section-divider" style="margin:16px 0 8px">收藏最多的风味</div>' +
      '<div class="tf-list">' + top.map(function (t) {
        return '<div class="tf-row" data-act="flavor:' + t.id + '" style="cursor:pointer">' +
          '<span class="lbl">' + esc(t.zh) + '<em>' + esc(t.en) + '</em></span>' +
          '<span class="tf-bar"><i style="width:' + Math.max(4, t.count / max * 100) + '%"></i></span>' +
          '<span class="n">' + t.count + '</span></div>';
      }).join('') + '</div>' +
      '</article>';

    const results = '<div class="span-12">' +
      '<div class="section-divider">' + (selected.length ? '含所选风味的' + meta.zh + ' · ' + allMatched.length + ' 款' : '高分' + meta.zh + ' · ' + allMatched.length + ' 款') + '</div>' +
      (matched.length ? '<div class="mini-grid">' + matched.map(function (c) {
        const p = CR.paletteFor(c.brand);
        const sub = b === 'pipe' ? (c.type + ' · ' + c.cut) : (c.series + ' · ' + c.vitola);
        return '<div class="mini" data-act="edit-' + b + ':' + c.id + '" style="--tint:' + p.tint + ';--tint-ink:' + p.ink + '">' +
          '<span class="bar"></span><div class="t"><b>' + esc(c.brand) + '</b><span>' + esc(sub) + '</span></div>' +
          '<div class="q">×' + c.qty + '</div></div>';
      }).join('') + '</div>' + (allMatched.length > matched.length ? '<p class="hint" style="margin-top:10px">按评分排序，仅显示前 9 款。</p>' : '') : emptyState({ title: '没有匹配的' + meta.zh, text: '换一个风味词，或者先去库存里补充几' + meta.unit + '。' })) +
      '</div>';

    return head('THE FLAVOUR MAP', '风味 <small>Flavour</small>', b === 'pipe' ? '把斗草翻译成气味与味道：烟熏、干草、柑橘还是香草。' : '把库存翻译成气味与味道：看看你的收藏偏向木质、甜感还是香料。') +
      '<div class="flavor-grid">' + radar + lexicon + results + '</div>';
  }

  window.Views = {
    ic: ic,
    head: head,
    emptyState: emptyState,
    faviconMark: faviconMark,
    NAV: NAV,
    CABINET_NAV: CABINET_NAV,
    navFor: navFor,
    BOARDS: BOARDS,
    boardOf: boardOf,
    inventory: inventory,
    inventoryResults: inventoryResults,
    cigarCard: cigarCard,
    pipeCard: pipeCard,
    overview: overview,
    flavor: flavor
  };
})();
