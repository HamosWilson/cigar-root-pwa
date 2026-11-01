/* PWA 胶水层：Service Worker 注册 + 独立窗口标记 + 列表视图「点一行展开」。
   不动应用本身的数据逻辑，只在渲染完之后给表格补一层触屏排版。 */
(function () {
  var standalone =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (standalone) document.documentElement.classList.add('standalone');

  /* ── 一、列表视图：触屏上把表格行变成可展开的一条条 ── */
  var TOUCH_MQ = window.matchMedia('(max-width: 900px), (pointer: coarse) and (max-width: 1100px)');
  var pending = null;

  function isTouchLayout() { return TOUCH_MQ.matches; }

  function cellText(cell) {
    // 单元格里常有 <br> 和色点，直接 textContent 会把「英式」「砖」粘成「英式砖」
    var clone = cell.cloneNode(true);
    var brs = clone.querySelectorAll('br');
    for (var i = 0; i < brs.length; i++) brs[i].parentNode.replaceChild(document.createTextNode(' '), brs[i]);
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function enhance() {
    if (!isTouchLayout()) return;
    var tables = document.querySelectorAll('table.inv-table');
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      if (table.dataset.expandable) continue;
      table.dataset.expandable = '1';

      var heads = [];
      var ths = table.querySelectorAll('thead th');
      for (var h = 0; h < ths.length; h++) heads.push((ths[h].textContent || '').trim());

      var body = table.tBodies && table.tBodies[0];
      if (!body) continue;
      var rows = Array.prototype.slice.call(body.rows);
      for (var r = 0; r < rows.length; r++) {
        var tr = rows[r];
        if (tr.classList.contains('inv-detail')) continue;
        tr.classList.add('inv-row');
        var cells = Array.prototype.slice.call(tr.cells);
        var last = cells.length - 1;

        // 折叠时的一行摘要：挑几列压成「英式 · 切片 · 50 g · 1 · ¥120 · 在柜」
        // 太长的（成分）、重复的（小计）和数字型的（评分）留给展开看
        var SKIP = { '成分': 1, '小计': 1, '评分': 1 };
        var parts = [];
        for (var i = 1; i < last; i++) {
          var head = heads[i] || '';
          if (!head || SKIP[head]) continue;
          var txt = cellText(cells[i]);
          if (txt) parts.push(txt);
        }
        if (parts.length && cells[0]) {
          var sum = document.createElement('span');
          sum.className = 'mrow-sum';
          sum.textContent = parts.join(' · ');
          cells[0].appendChild(sum);
        }

        // 展开的详情行：标签取自表头，值直接搬原来的单元格（保留色点、状态胶囊）
        var det = document.createElement('tr');
        det.className = 'inv-detail';
        var td = document.createElement('td');
        td.colSpan = cells.length;
        var grid = document.createElement('div');
        grid.className = 'mrow-detail';
        for (var k = 0; k < cells.length; k++) {
          if (k === last) continue; // 操作列留在折叠行里
          if (k === 0) continue;    // 品牌/调配本来就在折叠行上
          var key = document.createElement('span');
          key.className = 'k';
          key.textContent = heads[k] || '';
          var val = document.createElement('span');
          val.className = 'v';
          val.innerHTML = cells[k].innerHTML;
          grid.appendChild(key);
          grid.appendChild(val);
        }
        td.appendChild(grid);
        det.appendChild(td);
        tr.parentNode.insertBefore(det, tr.nextSibling);
      }
    }
  }

  function schedule() {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = null;
      try { enhance(); } catch (e) { console.log('[pwa] 列表增强失败:', e && e.message); }
    });
  }

  // 点一行：展开 / 收起。点到按钮上就交给按钮，不抢它的动作。
  document.addEventListener('click', function (e) {
    if (!isTouchLayout()) return;
    var el = e.target;
    if (!el || !el.closest) return;
    if (el.closest('button, a, input, select, textarea, label')) return;
    var tr = el.closest('tr.inv-row');
    if (!tr) return;
    var det = tr.nextElementSibling;
    if (!det || !det.classList.contains('inv-detail')) return;
    var open = !tr.classList.contains('open');
    tr.classList.toggle('open', open);
    det.classList.toggle('open', open);
  }, true);

  if (document.body) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (TOUCH_MQ.addEventListener) TOUCH_MQ.addEventListener('change', schedule);
  else if (TOUCH_MQ.addListener) TOUCH_MQ.addListener(schedule);
  window.addEventListener('orientationchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();

  /* ── 二、Service Worker：离线缓存 + 自己换新 ── */
  if (!('serviceWorker' in navigator)) return;
  // 只在 https / localhost 下有安全上下文，局域网 http 会静默跳过（能装，只是不离线）
  window.addEventListener('load', function () {
    // 地址里带版本号：换了版本就是新地址，不会卡在 Pages 那十分钟的 HTTP 缓存上
    var BUILD = 'hamos-1.3.0-20261102h';
    navigator.serviceWorker.register('sw.js?v=' + BUILD, { updateViaCache: 'none' })
      .then(function (reg) {
        // 每次回到前台都问一句有没有新版本
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible' && reg.update) reg.update();
        });
        if (reg.update) reg.update();
      })
      .catch(function (e) {
        console.log('[pwa] service worker 未注册（非 https 环境属正常）:', e && e.message);
      });

    // 新版本接管后自动刷一次，不用他自己动手
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  });
})();
