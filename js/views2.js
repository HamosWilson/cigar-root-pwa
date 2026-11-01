/* Hamos 的烟草生活 — records / wiki / settings pages + modal forms */
(function () {
  'use strict';

  const CR = window.CigarRoot;
  const esc = CR.esc;
  const V = window.Views;
  const ic = V.ic;
  const head = V.head;

  function board(state) { return state.board === 'pipe' ? 'pipe' : 'cigar'; }
  function meta(b) { return V.BOARDS[b]; }

  /* ================================================================ records */
  function recordsPage(state) {
    const b = board(state);
    const m = meta(b);
    const st = CR.recordStats(b);
    const list = CR.enrichedRecords(b);
    const hours = Math.round(st.minutes / 6) / 10;
    const byMonth = {};
    list.forEach(function (r) {
      const k = String(r.date || '').slice(0, 7);
      (byMonth[k] = byMonth[k] || []).push(r);
    });

    const fourthLabel = b === 'pipe' ? '最常用斗' : '最常搭配';
    const fourthValue = b === 'pipe' ? st.tool : st.pairing;
    const stats = '<div class="stats4">' +
      '<div class="card stat"><div class="lbl">' + ic('journal') + '累计品吸</div><div class="val">' + st.count + '<small>' + (b === 'pipe' ? '斗' : '次') + '</small></div><div class="sub">每一' + (b === 'pipe' ? '斗' : '支') + '都值得被记住</div></div>' +
      '<div class="card stat"><div class="lbl">' + ic('star') + '平均评分</div><div class="val">' + (st.avg ? st.avg.toFixed(1) : '—') + '<small>/ 10</small></div><div class="sub">' + CR.stars(st.avg) + '</div></div>' +
      '<div class="card stat"><div class="lbl">' + ic('clock') + '累计时长</div><div class="val">' + (hours || 0) + '<small>小时</small></div><div class="sub">约 ' + st.minutes + ' 分钟的独处</div></div>' +
      '<div class="card stat"><div class="lbl">' + ic(b === 'pipe' ? 'pipe' : 'leaf') + fourthLabel + '</div><div class="val" style="font-size:18px;font-family:var(--sans);font-weight:600;letter-spacing:0">' + esc(fourthValue || '—') + '</div><div class="sub">' + (b === 'pipe' ? '一把顺手的斗，一罐顺口的草' : '好好喝一杯，也好好抽一支') + '</div></div>' +
      '</div>';

    const timeline = list.length ? Object.keys(byMonth).sort().reverse().map(function (key) {
      const rows = byMonth[key];
      const parts = key.split('-');
      return '<div class="month-head"><b>' + parts[0] + ' 年 ' + Number(parts[1]) + ' 月</b><span class="ln"></span><span>' + rows.length + ' ' + (b === 'pipe' ? '斗' : '次') + '</span></div>' +
        '<div class="record-grid">' + rows.map(function (r) {
          const d = CR.parseDate(r.date) || new Date();
          const rating = Number(r.rating) || 0;
          const note = r.head || r.mid || r.finish || '';
          const p = r.item ? CR.paletteFor(r.item.brand) : { tint: '#b4655c', ink: '#8a453c' };
          const metaLine = b === 'pipe'
            ? '<span>' + (r.minutes || 0) + ' 分钟</span><span class="sep">·</span><span>' + esc(r.pipeUsed || '未记录烟斗') + '</span>' +
              (r.packing ? '<span class="sep">·</span><span>' + esc(r.packing) + '</span>' : '') +
              (r.relights ? '<span class="sep">·</span><span>补火 ' + r.relights + ' 次</span>' : '') +
              (r.pairing ? '<span class="sep">·</span><span>' + esc(r.pairing) + '</span>' : '')
            : '<span>' + (r.minutes || 0) + ' 分钟</span><span class="sep">·</span><span>' + esc(r.pairing || '无佐饮') + '</span>' +
              (r.burn ? '<span class="sep">·</span><span>燃烧 ' + esc(r.burn) + '</span>' : '') +
              (r.location ? '<span class="sep">·</span><span>' + esc(r.location) + '</span>' : '');
          return '<article class="record" data-act="view-record:' + r.id + '" style="--tint:' + p.tint + ';--tint-ink:' + p.ink + '">' +
            '<div class="datebox"><b>' + d.getDate() + '</b><span>' + (d.getMonth() + 1) + ' 月</span></div>' +
            '<div class="r-main">' +
              '<div class="r-top"><h3>' + esc(r.name) + '</h3>' +
                '<span class="r-rate">' + CR.stars(rating) + '<b>' + (rating ? rating.toFixed(1) : '—') + '</b></span></div>' +
              '<div class="r-meta">' + metaLine + '</div>' +
              '<p class="r-note">' + esc(note) + '</p>' +
              '<div class="r-tags">' + CR.tagsHTML(r.flavors, 4) + '</div>' +
            '</div>' +
            '<div class="r-actions">' +
              '<button title="编辑" data-act="edit-record:' + r.id + '">' + ic('edit') + '</button>' +
              '<button class="danger" title="删除" data-act="del-record:' + r.id + '">' + ic('trash') + '</button>' +
            '</div>' +
            '</article>';
        }).join('') + '</div>';
    }).join('') : V.emptyState({
      title: b === 'pipe' ? '还没有斗草记录' : '还没有品吸记录',
      text: b === 'pipe' ? '下次装一斗的时候，记下草、斗、装填与味道。' : '下次灰一支的时候，顺手记下香气、搭配与心情。',
      action: '<button class="btn btn-primary" data-act="new-record">' + ic('plus') + '写第一篇</button>'
    });

    return head(b === 'pipe' ? 'THE PIPE JOURNAL' : 'THE SMOKING JOURNAL', '记录 <small>' + (b === 'pipe' ? 'Pipe Log' : 'Journal') + '</small>',
      b === 'pipe' ? '一斗草、一把斗、一次装填。把抽过的斗草都留下来。' : '一支雪茄的三段风味、一次搭配、一个下午。把抽过的都留下来。',
      '<button class="btn btn-primary" data-act="new-record">' + ic('plus') + '新增记录</button>') +
      stats + '<div class="timeline">' + timeline + '</div>';
  }

  /* =================================================================== wiki */
  function wikiResults(state) {
    const b = board(state);
    const s = state.wiki || {};
    const items = CR.filterWiki(b, s.q, s.cat);
    if (!items.length) {
      return V.emptyState({
        title: '没有找到相关词条',
        text: '试试更短的关键词，或换一个分类。',
        action: '<button class="btn" data-act="new-wiki">' + ic('plus') + '新增词条</button>'
      });
    }
    return '<div class="wiki-grid">' + items.map(function (w) {
      const cat = CR.wikiCat(b, w.cat);
      return '<article class="wiki-card' + (w.builtin ? '' : ' custom') + '" data-act="view-wiki:' + w.id + '" style="--wcat:' + cat.color + ';--wtint:' + cat.tint + '">' +
        '<span class="cat">' + esc(cat.zh) + '</span>' +
        '<h3>' + esc(w.title) + '</h3>' +
        '<p>' + esc(w.excerpt) + '</p>' +
        '<div class="wtag">' + (w.tags || []).slice(0, 3).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  function wikiPage(state) {
    const b = board(state);
    const s = state.wiki || {};
    const all = CR.wikiAll(b);
    const cats = [{ id: 'all', zh: '全部' }].concat(CR.wikiCats(b));
    const items = CR.filterWiki(b, s.q, s.cat);
    const counts = {};
    all.forEach(function (w) { counts[w.cat] = (counts[w.cat] || 0) + 1; });

    const toolbar = '<div class="wiki-toolbar">' +
      '<div class="search" style="max-width:340px">' + ic('search') +
        '<input class="input" id="wiki-search" data-filter="wiki-q" placeholder="搜索标题 / 内容 / 标签…" value="' + esc(s.q || '') + '" autocomplete="off">' +
      '</div>' +
      '<div class="wiki-cats">' + cats.map(function (c) {
        return '<button class="chip' + ((s.cat || 'all') === c.id ? ' on' : '') + '" data-act="wiki-cat:' + c.id + '">' + esc(c.zh) +
          (c.id === 'all' ? '' : '<span class="n">' + (counts[c.id] || 0) + '</span>') + '</button>';
      }).join('') + '</div>' +
      '<span class="wiki-count" id="wiki-count">' + items.length + ' 条</span>' +
      '</div>';

    return head('THE LEXICON', '百科 <small>' + (b === 'pipe' ? 'Pipe Lexicon' : 'Lexicon') + '</small>',
      (b === 'pipe' ? '关于斗草品牌、调配、裁切、烟斗与装填的随身笔记。' : '关于品牌、产区、烟叶、工艺与养护的随身笔记。') + all.length + ' 条，慢慢翻。',
      '<button class="btn" data-act="new-wiki">' + ic('plus') + '新增词条</button>') +
      toolbar + '<div id="wiki-results">' + wikiResults(state) + '</div>';
  }

  /* =============================================================== settings */
  function settingsPage(state) {
    const s = CR.db.settings;
    const db = CR.db;
    const bytes = CR.storageBytes();
    const kb = bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
    const pct = Math.min(100, bytes / (5 * 1024 * 1024) * 100);
    const accents = ['#a05a2c', '#7c3440', '#3f5c48', '#35506b', '#a8843c', '#6a4f68'];
    const theme = s.theme === 'dark' ? 'dark' : s.theme === 'auto' ? 'auto' : 'light';
    const zoom = Number(s.zoom) || 100;

    const appearance = '<section class="card set-card">' +
      '<h3>外观</h3><p class="desc">纸感、夜幕，或跟随系统的明暗设置；主色会同步影响图表与强调文字。</p>' +
      '<div class="set-row"><div class="info"><b>主题</b><span>跟随系统会自动响应 Windows 的浅色 / 深色设置。</span></div>' +
        '<div class="seg"><button class="' + (theme === 'light' ? 'on' : '') + '" data-act="set-theme:light">纸感</button><button class="' + (theme === 'dark' ? 'on' : '') + '" data-act="set-theme:dark">夜幕</button><button class="' + (theme === 'auto' ? 'on' : '') + '" data-act="set-theme:auto">跟随系统</button></div></div>' +
      '<div class="set-row zoom-row"><div class="info"><b>界面缩放</b><span>像浏览器一样自由缩放，50%–200% 连续可调；桌面版使用原生缩放，文字仍然清晰。</span></div>' +
        '<div class="zoom-control">' +
          '<button class="zoom-btn" data-act="zoom-step:-5" aria-label="缩小">−</button>' +
          '<input type="range" class="zoom-range" data-zoom-range min="50" max="200" step="1" value="' + zoom + '" style="--z:' + ((zoom - 50) / 150 * 100) + '%" aria-label="界面缩放比例">' +
          '<span class="zoom-val" data-zoom-val>' + zoom + '%</span>' +
          '<button class="zoom-btn" data-act="zoom-step:5" aria-label="放大">+</button>' +
          '<button class="zoom-reset" data-act="zoom-reset">重置</button>' +
        '</div></div>' +
        '<p class="hint zoom-hint">快捷键：Ctrl + 滚轮 / Ctrl + + / Ctrl + − / Ctrl + 0</p>' +
      '<div class="set-row"><div class="info"><b>主色</b><span>用于强调、图表与按钮细节。</span></div>' +
        '<div class="swatches">' + accents.map(function (c) {
          return '<button class="swatch' + (s.accent === c ? ' on' : '') + '" data-act="set-accent:' + c + '" style="background:' + c + '" title="' + c + '"></button>';
        }).join('') + '</div></div>' +
      '<div class="set-row"><div class="info"><b>纸纹</b><span>关闭后背景更干净，截图时更利落。</span></div>' +
        '<button class="switch' + (s.grain ? ' on' : '') + '" data-act="toggle:grain" aria-label="纸纹"></button></div>' +
      '<div class="set-row"><div class="info"><b>动效</b><span>关闭页面过渡与卡片入场动画。</span></div>' +
        '<button class="switch' + (s.motion ? ' on' : '') + '" data-act="toggle:motion" aria-label="动效"></button></div>' +
      '</section>';

    const lookup = '<section class="card set-card">' +
      '<h3>斗草资料补全</h3><p class="desc">新增斗草时先查内置资料库；找不到时才联网。接口只会收到品牌和调配名，不会上传库存、照片或个人备注。</p>' +
      '<div class="set-row"><div class="info"><b>联网查询</b><span>关闭时只使用内置资料库，完全离线。</span></div>' +
        '<button class="switch' + ((s.enrich && s.enrich.enabled) ? ' on' : '') + '" data-act="toggle-enrich" aria-label="联网查询"></button></div>' +
      '<div class="enrich-fields">' +
        '<label class="enrich-field"><span>接口地址</span><input class="input" data-enrich-field="endpoint" value="' + esc((s.enrich && s.enrich.endpoint) || '') + '" placeholder="https://your-worker.workers.dev"></label>' +
        '<label class="enrich-field"><span>访问令牌（可选）</span><input class="input" data-enrich-field="token" value="' + esc((s.enrich && s.enrich.token) || '') + '" placeholder="与服务端 ENRICH_TOKEN 一致"></label>' +
      '</div>' +
      '<div class="set-row"><div class="info"><b>接口状态</b><span id="enrich-status">' + ((s.enrich && s.enrich.endpoint) ? '已填写地址，可测试连接' : '未配置接口地址') + '</span></div>' +
        '<button class="btn btn-sm" data-act="test-enrich">' + ic('refresh') + '测试连接</button></div>' +
      '<p class="hint" style="margin-top:8px">接口源码在项目的 <b>server/enrich-worker.mjs</b>，部署到 Cloudflare Worker 后把地址填在这里。接口需要返回 JSON matches。</p>' +
      '</section>';

    const currency = '<section class="card set-card">' +
      '<h3>货币</h3><p class="desc">价格以人民币录入，界面按所选货币折算。汇率可手动维护，完全离线可用。</p>' +
      '<div class="set-row"><div class="info"><b>显示货币</b><span>切换后全站金额立即换算。</span></div>' +
        '<div class="seg">' + CR.CURRENCIES.map(function (c) {
          return '<button class="' + (s.currency === c.code ? 'on' : '') + '" data-act="set-currency:' + c.code + '">' + c.symbol + ' ' + c.code + '</button>';
        }).join('') + '</div></div>' +
      '<div class="rate-grid">' + CR.CURRENCIES.filter(function (c) { return c.code !== 'CNY'; }).map(function (c) {
        return '<label class="rate-field"><span class="cur">' + c.symbol + ' ' + c.code + '</span>' +
          '<input type="number" step="0.01" min="0.01" value="' + (s.rates[c.code] || '') + '" data-rate="' + c.code + '" aria-label="' + c.code + ' 汇率">' +
          '<span class="per">CNY</span></label>';
      }).join('') + '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap">' +
        '<p class="hint" style="margin:0">1 美元 / 欧元 折合多少人民币 · 上次更新 ' + esc(s.ratesUpdated || '—') + '</p>' +
        '<button class="btn btn-sm" data-act="refresh-rates" style="flex:none">' + ic('refresh') + '获取汇率</button></div>' +
      '<p class="hint" style="margin-top:6px">点击获取需要联网；离线时也可以直接手动填写。</p>' +
      '</section>';

    const data = '<section class="card set-card">' +
      '<h3>数据</h3><p class="desc">所有内容只保存在这台电脑的浏览器存储里。建议定期导出一份 JSON 备份。</p>' +
      '<div class="set-row"><div class="info"><b>导出完整备份</b><span>雪茄、斗草、记录、烟斗陈列与设置，一个 JSON 文件。</span></div>' +
        '<button class="btn btn-sm" data-act="backup">' + ic('download') + '导出</button></div>' +
      '<div class="set-row"><div class="info"><b>导出 Excel</b><span>六个工作表：雪茄库存、雪茄记录、斗草库存、斗草记录、烟斗陈列、汇总。</span></div>' +
        '<button class="btn btn-sm" data-act="xlsx">' + ic('download') + 'XLSX</button></div>' +
      '<div class="set-row"><div class="info"><b>导出当前板块 CSV</b><span>纯文本表格，适合导入其他工具。</span></div>' +
        '<button class="btn btn-sm" data-act="csv">' + ic('download') + 'CSV</button></div>' +
      '<div class="set-row"><div class="info"><b>读取备份</b><span>从 JSON 恢复，会覆盖当前数据。</span></div>' +
        '<button class="btn btn-sm" data-act="restore">' + ic('upload') + '读取</button></div>' +
      '<div class="set-row"><div class="info"><b>载入示例数据</b><span>恢复内置的 28 款雪茄、23 款斗草与品吸记录；不改动烟斗陈列柜。</span></div>' +
        '<button class="btn btn-sm" data-act="seed">' + ic('refresh') + '载入</button></div>' +
      '<div class="set-row"><div class="info"><b>清空所有数据</b><span>两个板块的库存、记录、自定义词条和烟斗陈列都会删除，设置保留。</span></div>' +
        '<button class="btn btn-sm btn-danger" data-act="clear">' + ic('trash') + '清空</button></div>' +
      '<div class="set-row" style="display:block"><div class="info"><b>本地占用</b><span>' + kb + ' · 雪茄 ' + db.cigars.length + ' 款 · 斗草 ' + db.pipes.length + ' 款 · 烟斗 ' + db.smokingPipes.length + ' 把 · 记录 ' + (db.records.length + db.pipeRecords.length) + ' 篇 · 词条 ' + (CR.wikiAll('cigar').length + CR.wikiAll('pipe').length) + ' 条</span></div>' +
        '<div class="storage-bar"><i style="width:' + pct + '%"></i></div></div>' +
      '</section>';

    const about = '<section class="card set-card">' +
      '<div class="about-mark"><span class="brand-mark">' + V.faviconMark() + '</span><div class="t"><b>HAMOS 的烟草生活</b><span>雪茄 · 烟斗草 · 品吸手记</span></div></div>' +
      '<div class="about-list">' +
        '<div class="about-row"><span>版本</span><b>1.3.0</b></div>' +
        '<div class="about-row"><span>数据位置</span><b>本机 · localStorage</b></div>' +
        '<div class="about-row"><span>数据键名</span><b>cigarrow.v1</b></div>' +
        '<div class="about-row"><span>运行方式</span><b>纯离线 · 无账户</b></div>' +
        '<div class="about-row"><span>灵感来源</span><b>Cigar Root</b></div>' +
      '</div>' +
      '<div class="section-divider" style="margin:18px 0 4px">快捷键</div>' +
      '<div class="shortcuts">' +
        '<div class="shortcut"><span>全局搜索</span><kbd>Ctrl K</kbd></div>' +
        '<div class="shortcut"><span>切换页面</span><kbd>1 – ' + (state.board === 'pipe' ? 7 : 6) + '</kbd></div>' +
        '<div class="shortcut"><span>自由缩放</span><kbd>Ctrl ± / 滚轮</kbd></div>' +
        '<div class="shortcut"><span>聚焦搜索</span><kbd>/</kbd></div>' +
        '<div class="shortcut"><span>关闭弹层</span><kbd>Esc</kbd></div>' +
      '</div>' +
      '<p class="hint" style="margin-top:16px">烟草有害健康。本工具只用于记录与管理，请理性享用。</p>' +
      '</section>';

    const tips = '<section class="card set-card">' +
      '<h3>使用建议</h3><p class="desc">一些让记录更顺手的小事。</p>' +
      '<div class="about-list">' +
        '<div class="about-row"><span>备份</span><b>每月导出一份 JSON</b></div>' +
        '<div class="about-row"><span>雪茄</span><b>65–69% RH · 18–21°C</b></div>' +
        '<div class="about-row"><span>斗草</span><b>密封、避光、阴凉陈化</b></div>' +
        '<div class="about-row"><span>记录</span><b>灰完当天写，细节最清楚</b></div>' +
      '</div>' +
      '<p class="hint" style="margin-top:12px">数据只在本机，换电脑或清理浏览器前，记得先导出备份。</p>' +
      '</section>';

    return head('PREFERENCES', '设置 <small>Preferences</small>', '主题、缩放、货币、备份与本地数据。一切都留在这台电脑上。') +
      '<div class="settings-grid"><div>' + appearance + lookup + data + '</div><div>' + currency + about + tips + '</div></div>';
  }

  /* ================================================================= modals */
  function cigarForm(c) {
    const isEdit = !!c;
    const d = c || { brand: '', series: '', origin: '古巴', wrapper: 'Cuban Habano', vitola: 'Robusto', shape: 'Robusto', length: 5.0, ring: 50, qty: 1, price: 300, rating: 0, resting: false, acquired: CR.todayISO(), boxDate: '', box: '', strength: 3, flavors: [], notes: '' };
    const db = CR.db;
    const brands = CR.uniq(db.cigars.map(function (x) { return x.brand; }));
    const origins = CR.uniq(['古巴', '尼加拉瓜', '多米尼加', '洪都拉斯', '中国', '墨西哥', '美国', '厄瓜多尔'].concat(db.cigars.map(function (x) { return x.origin; })));
    const wrappers = CR.uniq(['Cuban Habano', 'Nicaraguan Habano', 'Ecuador Habano', 'Connecticut Shade', 'Connecticut Broadleaf', 'Mexican San Andrés', 'Cameroon', 'Ecuador Sumatra', 'Corojo', 'Criollo 98'].concat(db.cigars.map(function (x) { return x.wrapper; })));
    const vitolas = CR.uniq(['Robusto', 'Toro', 'Churchill', 'Corona', 'Pirámide', 'Belicoso', 'Perfecto', 'Panatela', 'Lonsdale', 'Torpedo', 'Gigante'].concat(db.cigars.map(function (x) { return x.vitola; })));
    const selectedFlavors = d.flavors || [];
    const tagButtons = CR.allTags().map(function (t) {
      return '<button type="button" class="tag' + (selectedFlavors.indexOf(t.id) >= 0 ? ' on' : '') + '" data-tag="' + t.id + '" style="--tc:' + (window.LEXICON_CATS.find(function (x) { return x.id === t.cat; }) || {}).color + '"><i></i>' + esc(t.zh) + '<em>' + esc(t.en) + '</em></button>';
    }).join('');

    return '<form id="cigar-form" data-kind="cigar" data-id="' + (isEdit ? c.id : '') + '" autocomplete="off">' +
      '<div class="form-section">基本信息</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>品牌 <i>*</i></label><input class="input" name="brand" required value="' + esc(d.brand) + '" list="brand-list" placeholder="Cohiba"><datalist id="brand-list">' + brands.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field span2"><label>系列 / 型号 <i>*</i></label><input class="input" name="series" required value="' + esc(d.series) + '" placeholder="Siglo VI"></div>' +
        '<div class="field"><label>产地</label><input class="input" name="origin" value="' + esc(d.origin) + '" list="origin-list"><datalist id="origin-list">' + origins.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field"><label>茄衣</label><input class="input" name="wrapper" value="' + esc(d.wrapper) + '" list="wrapper-list"><datalist id="wrapper-list">' + wrappers.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field"><label>品型</label><input class="input" name="vitola" value="' + esc(d.vitola) + '" list="vitola-list"><datalist id="vitola-list">' + vitolas.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field"><label>长度（英寸）</label><input class="input" name="length" type="number" step="0.05" min="0" value="' + (d.length || '') + '"></div>' +
        '<div class="field"><label>环径（1/64 英寸）</label><input class="input" name="ring" type="number" step="1" min="0" value="' + (d.ring || '') + '"></div>' +
        '<div class="field"><label>浓度</label><select class="input" name="strength">' + [1, 2, 3, 4, 5].map(function (n) {
          return '<option value="' + n + '"' + (Number(d.strength) === n ? ' selected' : '') + '>' + n + ' / 5 · ' + ['极淡', '清淡', '中等', '浓郁', '极浓'][n - 1] + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field"><label>数量（支）</label><input class="input" name="qty" type="number" step="1" min="0" value="' + (d.qty != null ? d.qty : 1) + '"></div>' +
        '<div class="field"><label>单价（CNY / 支）</label><input class="input" name="price" type="number" step="0.01" min="0" value="' + (d.price || 0) + '"></div>' +
        '<div class="field"><label>状态</label><select class="input" name="resting"><option value="0"' + (!d.resting ? ' selected' : '') + '>在柜 · 可品吸</option><option value="1"' + (d.resting ? ' selected' : '') + '>养护中</option></select></div>' +
        '<div class="field"><label>入柜日期</label><input class="input" name="acquired" type="date" value="' + esc(d.acquired || CR.todayISO()) + '"></div>' +
        '<div class="field"><label>盒码（年月）</label><input class="input" name="boxDate" type="month" value="' + esc(d.boxDate || '') + '"></div>' +
        '<div class="field"><label>盒位</label><input class="input" name="box" value="' + esc(d.box || '') + '" placeholder="A-01"></div>' +
        '<input type="hidden" name="shape" value="' + esc(d.shape || d.vitola || '') + '">' +
      '</div>' +
      '<div class="form-section">评分</div>' +
      '<div class="field"><div class="range-row"><input type="range" name="rating" min="0" max="10" step="0.1" value="' + (d.rating || 0) + '" data-range="rating"><span class="range-val" id="rating-val">' + (Number(d.rating) || 0).toFixed(1) + '</span></div>' +
        '<div class="range-scale"><span>未评</span><span>5</span><span>10</span></div></div>' +
      '<div class="form-section">风味与备注</div>' +
      '<div class="picker" id="flavor-picker">' + tagButtons + '</div>' +
      '<input type="hidden" name="flavors" value="' + selectedFlavors.join(',') + '">' +
      '<div class="field" style="margin-top:12px"><label>备注</label><textarea class="input" name="notes" placeholder="盒码、购买渠道、陈化计划、抽吸印象…">' + esc(d.notes || '') + '</textarea></div>' +
      '</form>';
  }

  const PIPE_COMPONENTS = ['弗吉尼亚', '伯莱', '拉塔基亚', '佩里克', '东方', '肯塔基', '卡文迪什'];
  const PIPE_TYPES = ['英式', '弗吉尼亚', 'V/P', '伯莱', '调味', '巴尔干', '苏格兰', '肯塔基', '卡文迪什'];
  const PIPE_CUTS = ['细丝', '切片', '砖', '绳', '粗丝', '圆片'];

  function pipeForm(p) {
    const isEdit = !!p;
    const d = p || {
      brand: '', blend: '', type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方'],
      topping: '无', weight: 50, qty: 1, price: 200, rating: 0, cellaring: false,
      tinDate: '', acquired: CR.todayISO(), jar: '', strength: 3, roomNote: 3, flavors: [], notes: '', description: ''
    };
    const source = d.metaSource || {};
    const db = CR.db;
    const brands = CR.uniq(db.pipes.map(function (x) { return x.brand; }).concat(['Peterson', 'Samuel Gawith', 'Gawith Hoggarth', 'Cornell & Diehl', 'G.L. Pease', "Rattray's", 'Esoterica', 'Mac Baren', 'Orlik', 'Solani', 'Davidoff', 'Lane']));
    const selectedFlavors = d.flavors || [];
    const selectedComponents = d.components || [];
    const tagButtons = CR.allTags().map(function (t) {
      return '<button type="button" class="tag' + (selectedFlavors.indexOf(t.id) >= 0 ? ' on' : '') + '" data-tag="' + t.id + '" style="--tc:' + (window.LEXICON_CATS.find(function (x) { return x.id === t.cat; }) || {}).color + '"><i></i>' + esc(t.zh) + '<em>' + esc(t.en) + '</em></button>';
    }).join('');
    const compButtons = PIPE_COMPONENTS.map(function (c) {
      return '<button type="button" class="tag' + (selectedComponents.indexOf(c) >= 0 ? ' on' : '') + '" data-component="' + esc(c) + '"><i></i>' + esc(c) + '</button>';
    }).join('');

    return '<form id="pipe-form" class="pipe-form" data-kind="pipe" data-id="' + (isEdit ? p.id : '') + '" autocomplete="off">' +
      '<div class="lookup-bar">' +
        '<div class="lookup-copy"><b>只填品牌和调配名，剩下的交给资料库</b><span>内置资料优先；开启联网后会查询配置的接口。填充后仍可手动修改。</span></div>' +
        '<div class="lookup-actions"><button type="button" class="btn btn-sm btn-primary" data-act="enrich-pipe">' + ic('search') + '查资料并填充</button><button type="button" class="btn btn-sm" data-act="enrich-undo" hidden>撤销填充</button></div>' +
        '<div class="lookup-result" id="lookup-result"' + (source.name ? '' : ' hidden') + '>' + (source.name ? '资料：' + esc(source.name) + (source.confidence ? ' · 置信度 ' + Math.round(source.confidence * 100) + '%' : '') + ' · 请核对包装' : '') + '</div>' +
      '</div>' +
      '<input type="hidden" name="sourceName" value="' + esc(source.name || '') + '">' +
      '<input type="hidden" name="sourceUrl" value="' + esc(source.url || '') + '">' +
      '<input type="hidden" name="sourceKind" value="' + esc(source.kind || '') + '">' +
      '<input type="hidden" name="sourceConfidence" value="' + (Number(source.confidence) || 0) + '">' +
      '<div class="form-section">基本信息</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>品牌 <i>*</i></label><input class="input" name="brand" required value="' + esc(d.brand) + '" list="pipe-brand-list" placeholder="Peterson"><datalist id="pipe-brand-list">' + brands.map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>' +
        '<div class="field span2"><label>调配 / 款名 <i>*</i></label><input class="input" name="blend" required value="' + esc(d.blend) + '" placeholder="Nightcap"></div>' +
        '<div class="field"><label>类型</label><select class="input" name="type">' + PIPE_TYPES.map(function (x) { return '<option' + (d.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>裁切</label><select class="input" name="cut">' + PIPE_CUTS.map(function (x) { return '<option' + (d.cut === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>加香</label><input class="input" name="topping" value="' + esc(d.topping || '无') + '" list="topping-list" placeholder="无"><datalist id="topping-list"><option value="无"><option value="香草"><option value="可可"><option value="焦糖"><option value="朗姆"><option value="樱桃"><option value="枫糖"><option value="零陵香豆"></datalist></div>' +
        '<div class="field"><label>重量（g / 罐）</label><input class="input" name="weight" type="number" step="0.1" min="0" value="' + (d.weight || 50) + '"></div>' +
        '<div class="field"><label>罐数</label><input class="input" name="qty" type="number" step="1" min="0" value="' + (d.qty != null ? d.qty : 1) + '"></div>' +
        '<div class="field"><label>单价（CNY / 罐）</label><input class="input" name="price" type="number" step="0.01" min="0" value="' + (d.price || 0) + '"></div>' +
        '<div class="field"><label>状态</label><select class="input" name="cellaring"><option value="0"' + (!d.cellaring ? ' selected' : '') + '>在柜 · 可抽</option><option value="1"' + (d.cellaring ? ' selected' : '') + '>陈化中</option></select></div>' +
        '<div class="field"><label>入罐日期</label><input class="input" name="acquired" type="date" value="' + esc(d.acquired || CR.todayISO()) + '"></div>' +
        '<div class="field"><label>生产 / 装罐（年月）</label><input class="input" name="tinDate" type="month" value="' + esc(d.tinDate || '') + '"></div>' +
        '<div class="field"><label>罐码</label><input class="input" name="jar" value="' + esc(d.jar || '') + '" placeholder="P-01"></div>' +
        '<div class="field"><label>浓度</label><select class="input" name="strength">' + [1, 2, 3, 4, 5].map(function (n) {
          return '<option value="' + n + '"' + (Number(d.strength) === n ? ' selected' : '') + '>' + n + ' / 5 · ' + ['极淡', '清淡', '中等', '浓郁', '极浓'][n - 1] + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field"><label>室韵</label><select class="input" name="roomNote">' + [1, 2, 3, 4, 5].map(function (n) {
          return '<option value="' + n + '"' + (Number(d.roomNote) === n ? ' selected' : '') + '>' + n + ' / 5 · ' + ['很差', '偏重', '一般', '友好', '很好'][n - 1] + '</option>';
        }).join('') + '</select></div>' +
      '</div>' +
      '<div class="form-section">成分</div>' +
      '<div class="picker" id="component-picker">' + compButtons + '</div>' +
      '<input type="hidden" name="components" value="' + esc(selectedComponents.join(',')) + '">' +
      '<div class="form-section">评分</div>' +
      '<div class="field"><div class="range-row"><input type="range" name="rating" min="0" max="10" step="0.1" value="' + (d.rating || 0) + '" data-range="rating"><span class="range-val" id="rating-val">' + (Number(d.rating) || 0).toFixed(1) + '</span></div>' +
        '<div class="range-scale"><span>未评</span><span>5</span><span>10</span></div></div>' +
      '<div class="form-section">风味与备注</div>' +
      '<div class="picker" id="flavor-picker">' + tagButtons + '</div>' +
      '<input type="hidden" name="flavors" value="' + selectedFlavors.join(',') + '">' +
      '<div class="field" style="margin-top:12px"><label>备注</label><textarea class="input" name="notes" placeholder="开罐印象、装填习惯、陈化计划…">' + esc(d.notes || '') + '</textarea></div>' +
      '<div class="form-section">资料简介</div>' +
      '<div class="field"><textarea class="input" name="description" style="min-height:82px" placeholder="品牌/调配的参考资料、风味描述…">' + esc(d.description || '') + '</textarea></div>' +
      '</form>';
  }

  function cigarPreview(c) {
    if (!c) return '<div class="card-note" style="padding:10px 0">选择一支雪茄后显示库存信息。</div>';
    const p = CR.paletteFor(c.brand);
    return '<div class="cigar-preview" style="--tint:' + p.tint + ';--tint-ink:' + p.ink + '">' +
      CR.cigarArt(c, 'art') +
      '<div class="t"><b>' + esc(c.brand) + ' · ' + esc(c.series) + '</b><span>' + esc(c.origin) + ' · ' + esc(c.wrapper) + '</span><span>' + esc(c.vitola) + ' · ' + c.length + '″ × ' + c.ring + ' · 剩余 ' + c.qty + ' 支</span></div>' +
      '<div class="q">×' + c.qty + '</div></div>';
  }

  function pipePreview(p) {
    if (!p) return '<div class="card-note" style="padding:10px 0">选择一罐斗草后显示库存信息。</div>';
    const pal = CR.pipeTypePalette(p.type);
    return '<div class="cigar-preview" style="--tint:' + pal.tint + ';--tint-ink:' + pal.ink + '">' +
      CR.pipeArt(p, 'art') +
      '<div class="t"><b>' + esc(p.brand) + ' · ' + esc(p.blend) + '</b><span>' + esc(p.type) + ' · ' + esc(p.cut) + ' · ' + (p.components || []).join('、') + '</span><span>' + (Number(p.weight) || 50) + ' g · 剩余 ' + p.qty + ' 罐 · 已抽 ' + (p.bowls || 0) + ' 斗</span></div>' +
      '<div class="q">×' + p.qty + '</div></div>';
  }

  function recordForm(r, presetId, b) {
    const kind = b === 'pipe' ? 'pipe' : (r && r.pipeId ? 'pipe' : 'cigar');
    if (kind === 'pipe') return pipeRecordForm(r, presetId);
    const isEdit = !!r;
    const db = CR.db;
    const cigars = db.cigars.slice().sort(function (a, b2) { return String(a.brand).localeCompare(String(b2.brand), 'zh-CN'); });
    const selectedId = r ? r.cigarId : (presetId || (cigars.find(function (c) { return Number(c.qty) > 0; }) || {}).id);
    const selected = cigars.find(function (c) { return c.id === selectedId; }) || null;
    const d = r || { date: CR.todayISO(), rating: 8.5, minutes: 60, pairing: '', burn: '均匀', ash: '灰白紧实', location: '', flavors: selected ? selected.flavors : [], head: '', mid: '', finish: '' };
    const selectedFlavors = d.flavors || [];
    const tagButtons = CR.allTags().map(function (t) {
      return '<button type="button" class="tag' + (selectedFlavors.indexOf(t.id) >= 0 ? ' on' : '') + '" data-tag="' + t.id + '" style="--tc:' + (window.LEXICON_CATS.find(function (x) { return x.id === t.cat; }) || {}).color + '"><i></i>' + esc(t.zh) + '<em>' + esc(t.en) + '</em></button>';
    }).join('');

    return '<form id="record-form" data-kind="cigar" data-id="' + (isEdit ? r.id : '') + '" autocomplete="off">' +
      '<div class="form-section">关联雪茄</div>' +
      '<div class="field"><label>雪茄 <i>*</i></label><select class="input" name="cigarId" id="record-cigar">' +
        (cigars.length ? cigars.map(function (c) {
          return '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + (Number(c.qty) <= 0 && c.id !== selectedId ? ' disabled' : '') + '>' +
            esc(c.brand + ' · ' + c.series) + '（' + (Number(c.qty) || 0) + ' 支）</option>';
        }).join('') : '<option value="">库存为空</option>') +
      '</select></div>' +
      '<div id="record-preview">' + cigarPreview(selected) + '</div>' +
      '<div class="form-section">品吸</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>日期</label><input class="input" name="date" type="date" value="' + esc(d.date) + '"></div>' +
        '<div class="field"><label>时长（分钟）</label><input class="input" name="minutes" type="number" min="0" step="1" value="' + (d.minutes || 0) + '"></div>' +
        '<div class="field"><label>佐饮</label><input class="input" name="pairing" value="' + esc(d.pairing || '') + '" list="pairing-list" placeholder="单一麦芽威士忌"><datalist id="pairing-list"><option value="单一麦芽威士忌"><option value="陈年朗姆"><option value="冰美式"><option value="冷萃咖啡"><option value="正山小种"><option value="香槟"><option value="苏打水"><option value="冰水"></datalist></div>' +
        '<div class="field"><label>地点</label><input class="input" name="location" value="' + esc(d.location || '') + '" placeholder="家中阳台"></div>' +
        '<div class="field"><label>燃烧</label><select class="input" name="burn">' + ['均匀', '轻微斜烧', '需补火', '隧道烧'].map(function (x) { return '<option' + (d.burn === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>烟灰</label><select class="input" name="ash">' + ['灰白紧实', '灰白松散', '偏黑紧实', '偏黑松散'].map(function (x) { return '<option' + (d.ash === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
      '</div>' +
      '<div class="form-section">评分</div>' +
      '<div class="field"><div class="range-row"><input type="range" name="rating" min="0" max="10" step="0.1" value="' + (d.rating || 0) + '" data-range="rating"><span class="range-val" id="rating-val">' + (Number(d.rating) || 0).toFixed(1) + '</span></div>' +
        '<div class="range-scale"><span>0</span><span>5</span><span>10</span></div></div>' +
      '<div class="form-section">风味标签</div>' +
      '<div class="picker" id="flavor-picker">' + tagButtons + '</div>' +
      '<input type="hidden" name="flavors" value="' + selectedFlavors.join(',') + '">' +
      '<div class="form-section">三段笔记</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>头段</label><textarea class="input" name="head" placeholder="点燃后的第一印象…">' + esc(d.head || '') + '</textarea></div>' +
        '<div class="field"><label>中段</label><textarea class="input" name="mid" placeholder="主体风味与变化…">' + esc(d.mid || '') + '</textarea></div>' +
        '<div class="field full"><label>尾段</label><textarea class="input" name="finish" placeholder="收尾与余味…">' + esc(d.finish || '') + '</textarea></div>' +
      '</div>' +
      '</form>';
  }

  function pipeRecordForm(r, presetId) {
    const isEdit = !!r;
    const pipes = CR.db.pipes.slice().sort(function (a, b) { return String(a.brand).localeCompare(String(b.brand), 'zh-CN'); });
    const selectedId = r ? r.pipeId : (presetId || (pipes.find(function (p) { return Number(p.qty) > 0; }) || {}).id);
    const selected = pipes.find(function (p) { return p.id === selectedId; }) || null;
    const d = r || {
      date: CR.todayISO(), rating: 8.5, minutes: 45, relights: 2, pipeUsed: '',
      packing: '三层法', moisture: '适中', pairing: '', location: '', flavors: selected ? selected.flavors : [],
      head: '', mid: '', finish: ''
    };
    const selectedFlavors = d.flavors || [];
    const tagButtons = CR.allTags().map(function (t) {
      return '<button type="button" class="tag' + (selectedFlavors.indexOf(t.id) >= 0 ? ' on' : '') + '" data-tag="' + t.id + '" style="--tc:' + (window.LEXICON_CATS.find(function (x) { return x.id === t.cat; }) || {}).color + '"><i></i>' + esc(t.zh) + '<em>' + esc(t.en) + '</em></button>';
    }).join('');

    return '<form id="record-form" data-kind="pipe" data-id="' + (isEdit ? r.id : '') + '" autocomplete="off">' +
      '<div class="form-section">关联斗草</div>' +
      '<div class="field"><label>斗草 <i>*</i></label><select class="input" name="pipeId" id="record-pipe">' +
        (pipes.length ? pipes.map(function (p) {
          return '<option value="' + p.id + '"' + (p.id === selectedId ? ' selected' : '') + (Number(p.qty) <= 0 && p.id !== selectedId ? ' disabled' : '') + '>' +
            esc(p.brand + ' · ' + p.blend) + '（' + (Number(p.qty) || 0) + ' 罐）</option>';
        }).join('') : '<option value="">库存为空</option>') +
      '</select></div>' +
      '<div id="record-preview">' + pipePreview(selected) + '</div>' +
      '<div class="form-section">这一斗</div>' +
      '<div class="form-grid three">' +
        '<div class="field"><label>日期</label><input class="input" name="date" type="date" value="' + esc(d.date) + '"></div>' +
        '<div class="field"><label>时长（分钟）</label><input class="input" name="minutes" type="number" min="0" step="1" value="' + (d.minutes || 0) + '"></div>' +
        '<div class="field"><label>补火次数</label><input class="input" name="relights" type="number" min="0" step="1" value="' + (d.relights || 0) + '"></div>' +
        '<div class="field"><label>用的斗</label><input class="input" name="pipeUsed" value="' + esc(d.pipeUsed || '') + '" list="pipe-list" placeholder="Savinelli 673 KS"><datalist id="pipe-list"><option value="Savinelli 673 KS"><option value="Peterson 106"><option value="Dunhill Shell 3103"><option value="Missouri Meerschaum Legend"><option value="Falcon"><option value="Clay pipe"></datalist></div>' +
        '<div class="field"><label>装填</label><select class="input" name="packing">' + ['三层法', 'Frank 法', '旋转法', '折叠法', '随意'].map(function (x) { return '<option' + (d.packing === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>湿度</label><select class="input" name="moisture">' + ['偏湿', '适中', '偏干'].map(function (x) { return '<option' + (d.moisture === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>佐饮</label><input class="input" name="pairing" value="' + esc(d.pairing || '') + '" list="pipe-pairing-list" placeholder="单一麦芽威士忌"><datalist id="pipe-pairing-list"><option value="单一麦芽威士忌"><option value="陈年朗姆"><option value="冰美式"><option value="冷萃咖啡"><option value="正山小种"><option value="绿茶"><option value="冰水"></datalist></div>' +
        '<div class="field"><label>地点</label><input class="input" name="location" value="' + esc(d.location || '') + '" placeholder="书房"></div>' +
      '</div>' +
      '<div class="form-section">评分</div>' +
      '<div class="field"><div class="range-row"><input type="range" name="rating" min="0" max="10" step="0.1" value="' + (d.rating || 0) + '" data-range="rating"><span class="range-val" id="rating-val">' + (Number(d.rating) || 0).toFixed(1) + '</span></div>' +
        '<div class="range-scale"><span>0</span><span>5</span><span>10</span></div></div>' +
      '<div class="form-section">风味标签</div>' +
      '<div class="picker" id="flavor-picker">' + tagButtons + '</div>' +
      '<input type="hidden" name="flavors" value="' + selectedFlavors.join(',') + '">' +
      '<div class="form-section">一斗三段</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>前段</label><textarea class="input" name="head" placeholder="开斗的第一印象…">' + esc(d.head || '') + '</textarea></div>' +
        '<div class="field"><label>中段</label><textarea class="input" name="mid" placeholder="主体风味与变化…">' + esc(d.mid || '') + '</textarea></div>' +
        '<div class="field full"><label>尾段</label><textarea class="input" name="finish" placeholder="斗底与余味…">' + esc(d.finish || '') + '</textarea></div>' +
      '</div>' +
      '</form>';
  }

  function recordDetail(r, b) {
    const kind = b === 'pipe' ? 'pipe' : 'cigar';
    const item = r.item;
    if (kind === 'pipe') {
      const rows = [
        ['日期', CR.fmtDate(r.date, 'long')],
        ['时长', (r.minutes || 0) + ' 分钟'],
        ['用的斗', r.pipeUsed || '—'],
        ['装填 / 湿度', (r.packing || '—') + ' · ' + (r.moisture || '—')],
        ['补火', (r.relights || 0) + ' 次'],
        ['佐饮', r.pairing || '—'],
        ['地点', r.location || '—']
      ];
      return '<div class="record-detail">' +
        '<div class="cigar-preview" style="--tint:' + (item ? CR.paletteFor(item.brand).tint : '#b4655c') + ';--tint-ink:' + (item ? CR.paletteFor(item.brand).ink : '#8a453c') + '">' +
          (item ? CR.pipeArt(item, 'art') : '') +
          '<div class="t"><b>' + esc(r.name) + '</b><span>' + (item ? esc(item.type + ' · ' + item.cut + ' · ' + (item.components || []).join('、')) : '原始斗草已删除') + '</span></div>' +
          '<div class="q" style="font-size:19px">' + (Number(r.rating) ? Number(r.rating).toFixed(1) : '—') + '</div></div>' +
        '<dl class="kv">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
        '<div class="section-divider" style="margin:20px 0 10px">风味标签</div>' +
        '<div class="selection">' + (r.flavors && r.flavors.length ? r.flavors.map(function (f) { return CR.tagChip(f); }).join('') : '<span class="empty-hint">没有记录风味</span>') + '</div>' +
        ['head', 'mid', 'finish'].map(function (k) {
          const labels = { head: '前段', mid: '中段', finish: '尾段' };
          if (!r[k]) return '';
          return '<div class="form-section">' + labels[k] + '</div><p class="wiki-detail" style="margin:0">' + esc(r[k]) + '</p>';
        }).join('') +
        '</div>';
    }
    const rows = [
      ['日期', CR.fmtDate(r.date, 'long')],
      ['时长', (r.minutes || 0) + ' 分钟'],
      ['佐饮', r.pairing || '—'],
      ['燃烧 / 烟灰', (r.burn || '—') + ' · ' + (r.ash || '—')],
      ['地点', r.location || '—']
    ];
    return '<div class="record-detail">' +
      '<div class="cigar-preview" style="--tint:' + (item ? CR.paletteFor(item.brand).tint : '#b4655c') + ';--tint-ink:' + (item ? CR.paletteFor(item.brand).ink : '#8a453c') + '">' +
        (item ? CR.cigarArt(item, 'art') : '') +
        '<div class="t"><b>' + esc(r.name) + '</b><span>' + (item ? esc(item.origin + ' · ' + item.wrapper + ' · ' + item.vitola) : '原始雪茄已删除') + '</span></div>' +
        '<div class="q" style="font-size:19px">' + (Number(r.rating) ? Number(r.rating).toFixed(1) : '—') + '</div></div>' +
      '<dl class="kv">' + rows.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="section-divider" style="margin:20px 0 10px">风味标签</div>' +
      '<div class="selection">' + (r.flavors && r.flavors.length ? r.flavors.map(function (f) { return CR.tagChip(f); }).join('') : '<span class="empty-hint">没有记录风味</span>') + '</div>' +
      ['head', 'mid', 'finish'].map(function (k) {
        const labels = { head: '头段', mid: '中段', finish: '尾段' };
        if (!r[k]) return '';
        return '<div class="form-section">' + labels[k] + '</div><p class="wiki-detail" style="margin:0">' + esc(r[k]) + '</p>';
      }).join('') +
      '</div>';
  }

  function wikiDetail(w, b) {
    const cat = CR.wikiCat(b, w.cat);
    return '<div class="wiki-detail">' +
      '<div class="selection" style="margin-bottom:14px"><span class="tag" style="--tc:' + cat.color + '"><i></i>' + esc(cat.zh) + '</span>' +
        (w.builtin ? '<span class="empty-hint">内置词条</span>' : '<span class="empty-hint">我的词条</span>') + '</div>' +
      '<p class="lead">' + esc(w.excerpt) + '</p>' +
      '<p style="margin-top:14px">' + esc(w.body) + '</p>' +
      '<div class="wtag">' + (w.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</div>';
  }

  function wikiForm(w, b) {
    const cats = CR.wikiCats(b);
    const d = w || { title: '', cat: cats[0] ? cats[0].id : 'brand', excerpt: '', body: '', tags: [] };
    return '<form id="wiki-form" data-kind="' + b + '" data-id="' + (w ? w.id : '') + '" autocomplete="off">' +
      '<div class="form-grid">' +
        '<div class="field full"><label>标题 <i>*</i></label><input class="input" name="title" required value="' + esc(d.title) + '" placeholder="例如：装填的三层法"></div>' +
        '<div class="field"><label>分类</label><select class="input" name="cat">' + cats.map(function (c) {
          return '<option value="' + c.id + '"' + (d.cat === c.id ? ' selected' : '') + '>' + esc(c.zh) + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field"><label>标签（用逗号分隔）</label><input class="input" name="tags" value="' + esc((d.tags || []).join('，')) + '" placeholder="工艺，工具"></div>' +
        '<div class="field full"><label>摘要</label><textarea class="input" name="excerpt" placeholder="一两句话，卡片上会显示这段。">' + esc(d.excerpt) + '</textarea></div>' +
        '<div class="field full"><label>正文 <i>*</i></label><textarea class="input" name="body" required style="min-height:150px" placeholder="写下你想记住的知识…">' + esc(d.body) + '</textarea></div>' +
      '</div></form>';
  }

  function confirmBody(o) {
    return '<div class="confirm-body">' + (o.message || '') + '</div>' +
      (o.warning ? '<div class="warn-box">' + o.warning + '</div>' : '') +
      (o.phrase ? '<div class="confirm-input"><input class="input" id="confirm-phrase" placeholder="输入「' + esc(o.phrase) + '」以确认" autocomplete="off"></div>' : '');
  }

  function palette(q, groups, active) {
    return '<div class="overlay palette-overlay" data-act="palette-close">' +
      '<div class="palette" data-stop="1">' +
        '<div class="palette-input">' + ic('search') +
          '<input id="palette-input" placeholder="搜索雪茄、斗草、百科、页面或操作…" value="' + esc(q || '') + '" autocomplete="off" spellcheck="false">' +
          '<kbd>Esc</kbd></div>' +
        '<div class="palette-list" id="palette-list">' + paletteList(groups, active) + '</div>' +
      '</div></div>';
  }

  function paletteList(groups, active) {
    let idx = 0;
    if (!groups.length) return '<div class="pal-empty">没有找到匹配项</div>';
    return groups.map(function (g) {
      return '<div class="pal-group">' + esc(g.label) + '</div>' + g.items.map(function (it) {
        const i = idx++;
        return '<div class="pal-item' + (i === active ? ' on' : '') + '" data-act="' + it.act + '" data-i="' + i + '">' +
          '<span class="pi-ic">' + ic(it.icon || 'arrow') + '</span><span>' + esc(it.title) + '</span>' +
          (it.sub ? '<span class="pi-sub">' + esc(it.sub) + '</span>' : '') + '</div>';
      }).join('');
    }).join('');
  }

  window.Views.records = recordsPage;
  window.Views.wiki = wikiPage;
  window.Views.wikiResults = wikiResults;
  window.Views.settings = settingsPage;
  window.Views.cigarForm = cigarForm;
  window.Views.pipeForm = pipeForm;
  window.Views.cigarPreview = cigarPreview;
  window.Views.pipePreview = pipePreview;
  window.Views.recordForm = recordForm;
  window.Views.recordDetail = recordDetail;
  window.Views.wikiDetail = wikiDetail;
  window.Views.wikiForm = wikiForm;
  window.Views.confirmBody = confirmBody;
  window.Views.palette = palette;
  window.Views.paletteList = paletteList;
})();
