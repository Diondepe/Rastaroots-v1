/* RastaRoots cookie settings.
   No pop-up. We use Google Analytics for aggregate visit statistics only
   (UK PECR statistical-purposes exemption); advertising and Google signals are off.
   Visitors can switch analytics off or back on from "Cookie settings" in the footer.
   The choice is stored in localStorage (rrCookieConsent = granted | denied). */
(function () {
  var KEY = 'rrCookieConsent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function g() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  function isOn() { return get() !== 'denied'; }
  function apply(on) { g('consent', 'update', { analytics_storage: on ? 'granted' : 'denied' }); }
  function clearGa() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0) {
        ['', '; domain=.' + host, '; domain=' + location.hostname].forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }
  function css() {
    if (document.getElementById('rr-cc-css')) return;
    var s = document.createElement('style');
    s.id = 'rr-cc-css';
    s.textContent = '#rr-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:440px;margin:0 auto;background:#06170e;color:#fff9ee;border:1px solid rgba(244,216,138,.35);border-radius:14px;padding:18px 18px 16px;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.35)}' +
      '#rr-cc p{margin:0 0 12px}#rr-cc a{color:#f4d88a}#rr-cc strong{color:#f4d88a}' +
      '#rr-cc .rr-cc-row{display:flex;gap:10px;flex-wrap:wrap}' +
      '#rr-cc button{flex:1 1 auto;min-height:44px;border-radius:999px;padding:10px 16px;font:600 14px system-ui,sans-serif;cursor:pointer;border:1px solid #f4d88a}' +
      '#rr-cc .rr-cc-toggle{background:#f4d88a;color:#06170e}#rr-cc .rr-cc-close{background:transparent;color:#f4d88a}' +
      '@media (max-width:700px){#rr-cc{bottom:86px}}';
    document.head.appendChild(s);
  }
  function close() { var b = document.getElementById('rr-cc'); if (b) b.remove(); }
  function show() {
    css(); close();
    var on = isOn();
    var d = document.createElement('div');
    d.id = 'rr-cc';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Cookie settings');
    d.innerHTML = '<p><strong>Cookie settings</strong></p>' +
      '<p>We use Google Analytics cookies to count visits and see which pages people find useful. ' +
      'No advertising cookies, and nothing is used to target you. Analytics is currently <strong>' + (on ? 'on' : 'off') + '</strong>. ' +
      '<a href="/privacy.html#privacy-details">Privacy</a></p>' +
      '<div class="rr-cc-row"><button type="button" class="rr-cc-toggle">' + (on ? 'Turn analytics off' : 'Turn analytics on') + '</button>' +
      '<button type="button" class="rr-cc-close">Close</button></div>';
    document.body.appendChild(d);
    d.querySelector('.rr-cc-toggle').addEventListener('click', function () {
      var next = !isOn();
      set(next ? 'granted' : 'denied');
      apply(next);
      if (!next) clearGa();
      show();
    });
    d.querySelector('.rr-cc-close').addEventListener('click', close);
    d.querySelector('.rr-cc-toggle').focus();
  }
  window.rrCookieSettings = function (e) { if (e && e.preventDefault) e.preventDefault(); show(); };
  function init() {
    if (!isOn()) apply(false);
    document.querySelectorAll('[data-cookie-settings]').forEach(function (a) { a.addEventListener('click', window.rrCookieSettings); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
