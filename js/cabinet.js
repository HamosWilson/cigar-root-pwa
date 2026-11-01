/* Hamos 的烟草生活 — 烟斗陈列柜 / pipe rack with photos */
(function () {
  'use strict';

  const CR = window.CigarRoot;
  const esc = CR.esc;
  const V = window.Views;
  const ic = V.ic;
  const head = V.head;

  const SHAPES = ['直斗', '弯斗', '半弯', '加拿大', '都柏林', '苹果', '斗牛犬', '葫芦', '自由式', '玉米芯'];
  const MATERIALS = ['石楠木', '海泡石', '玉米芯', '陶土', '橄榄木', '樱桃木', '其他'];
  const STEMS = ['亚克力', '硫化橡胶', '坎伯兰', '木材', '其他'];

  function list() { return CR.db.smokingPipes || []; }

  function stats() {
    const all = list();
    return {
      count: all.length,
      value: all.reduce(function (a, p) { return a + (Number(p.price) || 0); }, 0),
      favorites: all.filter(function (p) { return p.favorite; }).length,
      photos: all.filter(function (p) { return p.photo; }).length,
      materials: CR.uniq(all.map(function (p) { return p.material; }).filter(Boolean))
    };
  }

  function filtered(state) {
    const f = state.rack || {};
    const q = String(f.q || '').trim().toLowerCase();
    let rows = list().slice();
    if (q) {
      rows = rows.filter(function (p) {
        return [p.name, p.maker, p.shape, p.material, p.stem, p.notes].join(' ').toLowerCase().indexOf(q) >= 0;
      });
    }
    if (f.shape) rows = rows.filter(function (p) { return p.shape === f.shape; });
    if (f.material) rows = rows.filter(function (p) { return p.material === f.material; });
    if (f.fav) rows = rows.filter(function (p) { return p.favorite; });
    const sort = f.sort || 'default';
    rows.sort(function (a, b) {
      if (sort === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sort === 'price') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN');
      if (sort === 'acquired') return String(b.acquired || '').localeCompare(String(a.acquired || ''));
      return (Number(b.favorite) - Number(a.favorite)) || String(b.acquired || '').localeCompare(String(a.acquired || ''));
    });
    return rows;
  }

  function silhouette() {
    return '<svg class="rack-silhouette" viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' +
      '<path d="M14 78h34c12 0 22-9 22-22V44"/><path d="M14 78c0-13 9-23 21-23h13"/><path d="M70 44h28"/>' +
      '<ellipse cx="74" cy="55" rx="2.4" ry="2.4"/><path d="M28 45c1-6 2-10 5-14" opacity=".5"/>' +
      '<path d="M8 86h104" opacity=".35"/></svg>';
  }

  function rackCard(p, i) {
    const pal = CR.paletteFor(p.maker || p.name);
    return '<article class="rack-card" data-act="view-rack:' + p.id + '" style="--tint:' + pal.tint + ';--tint-ink:' + pal.ink + ';--i:' + Math.min(i, 14) + '">' +
      '<div class="rack-photo">' +
        (p.photo
          ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">'
          : '<div class="rack-nophoto">' + silhouette() + '<span>还没有照片</span></div>') +
        (p.favorite ? '<span class="rack-star" title="喜欢的斗">★</span>' : '') +
        '<span class="rack-glint"></span>' +
      '</div>' +
      '<div class="rack-body">' +
        '<div class="rack-maker">' + esc(p.maker || '私人收藏') + '</div>' +
        '<h3 class="rack-name">' + esc(p.name) + '</h3>' +
        '<div class="rack-specs"><span>' + esc(p.shape) + '</span><span>' + esc(p.material) + '</span>' +
          (Number(p.length) ? '<span>' + p.length + ' mm</span>' : '') +
          (Number(p.weight) ? '<span>' + p.weight + ' g</span>' : '') + '</div>' +
        '<div class="rack-foot"><span>' + (p.acquired ? CR.fmtDate(p.acquired, 'ym') + ' 入手' : '未记入手') + '</span>' +
          '<b>' + CR.money(p.price) + '</b></div>' +
      '</div>' +
      '<div class="rack-actions">' +
        '<button data-act="rack-fav:' + p.id + '" title="' + (p.favorite ? '取消收藏' : '标记喜欢') + '" class="' + (p.favorite ? 'on' : '') + '">' + ic('star') + '</button>' +
        '<button data-act="edit-rack:' + p.id + '" title="编辑">' + ic('edit') + '</button>' +
        '<button class="danger" data-act="del-rack:' + p.id + '" title="删除">' + ic('trash') + '</button>' +
      '</div>' +
      '</article>';
  }

  function cabinetResults(state) {
    const rows = filtered(state);
    const all = list();
    if (!all.length) {
      return V.emptyState({
        art: 'rack',
        title: '陈列柜还空着',
        text: '把第一把斗放上来：拍张照片，记下斗型、材质和它的故事。',
        action: '<button class="btn btn-primary" data-act="new-rack">' + ic('camera') + '放进第一把斗</button>'
      });
    }
    if (!rows.length) {
      return V.emptyState({
        art: 'rack',
        title: '没有符合条件的斗',
        text: '换个关键词，或者清除筛选再看看。',
        action: '<button class="btn" data-act="rack-clear">清除筛选</button>'
      });
    }
    return '<div class="rack-grid">' + rows.map(rackCard).join('') +
      '<button class="rack-add-card" data-act="new-rack">' +
        '<span class="rack-add-ic">' + ic('camera') + '</span>' +
        '<b>再放一把斗</b><span>拍照 / 选择照片</span>' +
      '</button>' +
      '</div>' +
      '<p class="rack-note">' + rows.length + ' 把斗 · 点击卡片看大图与细节</p>';
  }

  function cabinetPage(state) {
    const s = stats();
    const f = state.rack || {};
    const shapes = CR.uniq(list().map(function (p) { return p.shape; }).filter(Boolean));
    const materials = CR.uniq(list().map(function (p) { return p.material; }).filter(Boolean));
    const opts = function (arr, cur) {
      return arr.map(function (x) { return '<option value="' + esc(x) + '"' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    };
    const actions = '<button class="btn" data-act="rack-show">' + ic('external') + '展示模式</button>' +
      '<button class="btn btn-primary" data-act="new-rack">' + ic('plus') + '新增烟斗</button>';
    const summary = '<div class="summary rack-summary">' +
      '<div class="sum-cell"><span class="k">收藏</span><b>' + s.count + '</b><em>把</em></div>' +
      '<div class="sum-cell"><span class="k">有照片</span><b>' + s.photos + '</b><em>把</em></div>' +
      '<div class="sum-cell"><span class="k">喜欢</span><b>' + s.favorites + '</b><em>把</em></div>' +
      '<div class="sum-cell accent"><span class="k">入手总值</span><b>' + CR.money(s.value) + '</b></div>' +
      '<div class="sum-spacer"></div>' +
      '<div class="sum-cell note">' + (s.materials.length ? s.materials.join(' · ') : '等待第一把斗') + '</div>' +
      '</div>';
    const toolbar = '<div class="filterbar rack-filterbar">' +
      '<div class="search">' + ic('search') + '<input class="input" id="rack-search" data-rack-filter="q" placeholder="搜索斗名 / 制作者 / 材质…" value="' + esc(f.q || '') + '" autocomplete="off"></div>' +
      '<select class="input" data-rack-filter="shape"><option value="">全部斗型</option>' + opts(shapes, f.shape) + '</select>' +
      '<select class="input" data-rack-filter="material"><option value="">全部材质</option>' + opts(materials, f.material) + '</select>' +
      '<select class="input" data-rack-filter="sort">' +
        '<option value="default"' + (f.sort === 'default' || !f.sort ? ' selected' : '') + '>收藏优先</option>' +
        '<option value="acquired"' + (f.sort === 'acquired' ? ' selected' : '') + '>最近入手</option>' +
        '<option value="rating"' + (f.sort === 'rating' ? ' selected' : '') + '>评分从高到低</option>' +
        '<option value="price"' + (f.sort === 'price' ? ' selected' : '') + '>价值从高到低</option>' +
        '<option value="name"' + (f.sort === 'name' ? ' selected' : '') + '>名称 A–Z</option>' +
      '</select>' +
      '<button class="chip rack-fav-chip' + (f.fav ? ' on' : '') + '" data-act="rack-fav-filter">' + ic('star') + '只看喜欢</button>' +
      '</div>';

    return head('THE PIPE RACK', '烟斗陈列柜 <small>Pipe Rack</small>',
      '把每一把斗摆出来：斗型、材质、尺寸，还有它自己的照片和故事。照片只存在本机。',
      actions) +
      summary + toolbar +
      '<div class="rack-shelf"><div class="shelf-line"></div><div id="rack-results">' + cabinetResults(state) + '</div></div>' +
      '<div class="rack-tip card"><span class="rack-tip-ic">' + ic('camera') + '</span><div><b>拍得好看一点</b><p>自然光、干净背景，斗钵朝上斜 45°；手机可以直接调用相机，桌面版会打开文件选择。建议一张照片不超过 1 MB。</p></div></div>';
  }

  function rackForm(p) {
    const isEdit = !!p;
    const d = p || {
      name: '', maker: '', shape: '直斗', material: '石楠木', stem: '亚克力',
      length: '', weight: '', bowlDepth: '', chamber: '',
      acquired: CR.todayISO(), price: 0, rating: 0, favorite: false, notes: '', photo: ''
    };
    const opts = function (arr, cur) {
      return arr.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
    };
    return '<form id="rack-form" data-kind="rack" data-id="' + (isEdit ? p.id : '') + '" autocomplete="off">' +
      '<div class="rack-form-photo">' +
        '<div class="rack-photo-preview" id="rack-photo-preview">' +
          (d.photo ? '<img src="' + esc(d.photo) + '" alt="烟斗照片">' : '<div class="rack-nophoto">' + silhouette() + '<span>还没有照片</span></div>') +
        '</div>' +
        '<div class="rack-photo-copy"><b>给它拍张照</b><p>手机端可以直接调用相机；桌面端选择本地图片。照片会自动压缩后保存在本机。</p>' +
          '<div class="rack-photo-actions">' +
            '<label class="btn btn-sm btn-primary">' + ic('camera') + '拍照 / 选择照片<input type="file" id="rack-photo-input" accept="image/*" capture="environment" hidden></label>' +
            '<button type="button" class="btn btn-sm" data-act="rack-photo-clear">移除照片</button>' +
          '</div>' +
        '</div>' +
        '<input type="hidden" name="photo" value="' + esc(d.photo || '') + '">' +
      '</div>' +
      '<div class="form-section">基本信息</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>斗名 <i>*</i></label><input class="input" name="name" required value="' + esc(d.name) + '" placeholder="例如：Savinelli 673 KS"></div>' +
        '<div class="field"><label>制作者 / 品牌</label><input class="input" name="maker" value="' + esc(d.maker) + '" placeholder="Savinelli / 手工斗作者"></div>' +
        '<div class="field"><label>斗型</label><select class="input" name="shape">' + opts(SHAPES, d.shape) + '</select></div>' +
        '<div class="field"><label>材质</label><select class="input" name="material">' + opts(MATERIALS, d.material) + '</select></div>' +
        '<div class="field"><label>烟嘴</label><select class="input" name="stem">' + opts(STEMS, d.stem) + '</select></div>' +
        '<div class="field"><label>入手日期</label><input class="input" name="acquired" type="date" value="' + esc(d.acquired || '') + '"></div>' +
      '</div>' +
      '<div class="form-section">尺寸与价格</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>长度（mm）</label><input class="input" name="length" type="number" min="0" step="1" value="' + (d.length || '') + '"></div>' +
        '<div class="field"><label>重量（g）</label><input class="input" name="weight" type="number" min="0" step="0.1" value="' + (d.weight || '') + '"></div>' +
        '<div class="field"><label>斗钵深（mm）</label><input class="input" name="bowlDepth" type="number" min="0" step="0.1" value="' + (d.bowlDepth || '') + '"></div>' +
        '<div class="field"><label>钵径（mm）</label><input class="input" name="chamber" type="number" min="0" step="0.1" value="' + (d.chamber || '') + '"></div>' +
        '<div class="field"><label>入手价（CNY）</label><input class="input" name="price" type="number" min="0" step="0.01" value="' + (d.price || 0) + '"></div>' +
        '<div class="field"><label>喜欢</label><label class="rack-check"><input type="checkbox" name="favorite"' + (d.favorite ? ' checked' : '') + '><span>放进「只看喜欢」</span></label></div>' +
      '</div>' +
      '<div class="form-section">评分与备注</div>' +
      '<div class="field"><div class="range-row"><input type="range" name="rating" min="0" max="10" step="0.1" value="' + (d.rating || 0) + '" data-range="rating"><span class="range-val" id="rating-val">' + (Number(d.rating) || 0).toFixed(1) + '</span></div>' +
        '<div class="range-scale"><span>0</span><span>5</span><span>10</span></div></div>' +
      '<div class="field" style="margin-top:12px"><label>备注</label><textarea class="input" name="notes" placeholder="抽什么草、手感、纹路、购买故事…">' + esc(d.notes || '') + '</textarea></div>' +
      '</form>';
  }

  function rackDetail(p) {
    const rows = [
      ['制作者', p.maker || '—'],
      ['斗型 / 材质', (p.shape || '—') + ' · ' + (p.material || '—')],
      ['烟嘴', p.stem || '—'],
      ['尺寸', [p.length ? p.length + ' mm' : '', p.weight ? p.weight + ' g' : ''].filter(Boolean).join(' · ') || '—'],
      ['斗钵', [p.bowlDepth ? '深 ' + p.bowlDepth + ' mm' : '', p.chamber ? '径 ' + p.chamber + ' mm' : ''].filter(Boolean).join(' · ') || '—'],
      ['入手', p.acquired ? CR.fmtDate(p.acquired, 'long') : '—'],
      ['入手价', p.price ? CR.money(p.price) : '—']
    ];
    return '<div class="rack-detail">' +
      '<div class="rack-detail-photo">' +
        (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">' : '<div class="rack-nophoto">' + silhouette() + '<span>还没有照片</span></div>') +
        (p.favorite ? '<span class="rack-star">★</span>' : '') +
      '</div>' +
      '<div class="rack-detail-info">' +
        '<div class="rack-detail-head"><div><span class="rack-detail-maker">' + esc(p.maker || '私人收藏') + '</span>' +
          '<h3>' + esc(p.name) + '</h3></div><span class="rack-detail-rate">' + (Number(p.rating) ? Number(p.rating).toFixed(1) : '—') + '</span></div>' +
        '<dl class="kv">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
        (p.notes ? '<div class="section-divider" style="margin:18px 0 8px">关于这把斗</div><p class="rack-detail-notes">' + esc(p.notes) + '</p>' : '') +
      '</div></div>';
  }

  function photoPicker(state) {
    const rows = filtered(state).filter(function (p) { return p.photo; });
    if (!rows.length) {
      return V.emptyState({ art: 'rack', title: '还没有带照片的斗', text: '先给一把斗拍张照，再回来展示。', action: '<button class="btn btn-primary" data-act="new-rack">' + ic('camera') + '新增烟斗</button>' });
    }
    return '<div class="rack-show-grid">' + rows.map(function (p) {
      return '<figure class="rack-show-item" data-act="view-rack:' + p.id + '"><img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '"><figcaption><b>' + esc(p.name) + '</b><span>' + esc(p.maker || '') + ' · ' + esc(p.shape) + '</span></figcaption></figure>';
    }).join('') + '</div>';
  }

  V.cabinet = cabinetPage;
  V.cabinetResults = cabinetResults;
  V.rackForm = rackForm;
  V.rackDetail = rackDetail;
  V.rackShow = photoPicker;
  V.rackStats = stats;
  V.RACK_SHAPES = SHAPES;
  V.RACK_MATERIALS = MATERIALS;
})();
