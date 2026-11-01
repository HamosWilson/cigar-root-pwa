/* PWA 胶水层：Service Worker 注册 + 独立窗口标记。不碰应用本身的数据逻辑。 */
(function () {
  var standalone =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (standalone) document.documentElement.classList.add('standalone');

  if (!('serviceWorker' in navigator)) return;
  // 只在 https / localhost 下有安全上下文，局域网 http 会静默跳过（能装，只是不离线）
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      reg.addEventListener('updatefound', function () {
        var sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', function () {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // 有新版本：下一轮打开就是新的，不打断正在看的东西
            console.log('[pwa] 新版本已缓存，下次打开生效');
          }
        });
      });
    }).catch(function (e) {
      console.log('[pwa] service worker 未注册（非 https 环境属正常）:', e && e.message);
    });
  });
})();
