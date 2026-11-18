/* RastaRoots cookie consent: Google Consent Mode v2.
   Analytics cookies stay off until the visitor chooses "Accept".
   The choice is stored in localStorage (rrCookieConsent = granted | denied). */
(function () {
  var KEY = 'rrCookieConsent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function g() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  function apply(v) {
    g('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
  }
  function css() {
    if (document.getElementById('rr-cc-style')) return;
    var s = document.createElement('style'); s.id = 'rr-cc-style';
    s.textContent = '#rr-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;background:#06170e;color:#fff9ee;border:1px solid #b68a33;border-radius:16px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.35);font:15px/1.55 Arial,Helvetica,sans-serif}'
      + '#rr-cc p{margin:0 0 12px}#rr-cc a{color:#f4d88a}'
      + '#rr-cc .rr-cc-actions{display:flex;gap:10px;flex-wrap:wrap}'
      + '#rr-cc button{flex:1 1 140px;min-height:44px;border-radius:999px;font:700 14px Arial,Helvetica,sans-serif;cursor:pointer;border:1px solid #f4d88a}'
      + '#rr-cc .rr-cc-yes{background:#f4d88a;color:#06170e}#rr-cc .rr-cc-no{background:transparent;color:#f4d88a}'
      + '#rr-cc button:focus-visible{outline:3px solid #fff;outline-offset:2px}'
      + '@media(max-width:640px){#rr-cc{bottom:86px}}';
    document.head.appendChild(s);
  }
  function close() { var b = document.getElementById('rr-cc'); if (b) b.remove(); }
  function show() {
    if (document.getElementById('rr-cc')) return;
    css();
    var b = document.createElement('div');
    b.id = 'rr-cc'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-live', 'polite'); b.setAttribute('aria-label', 'Cookie choice');
    b.innerHTML = '<p><strong>A quick one about cookies.</strong> We’d like to use analytics cookies to see which pages and guides help people most. Nothing for advertising, and you can change your mind any time. <a href="/privacy.html#privacy-details">Privacy</a></p>'
      + '<div class="rr-cc-actions"><button type="button" class="rr-cc-yes">Accept analytics</button><button type="button" class="rr-cc-no">No thanks</button></div>';
    b.querySelector('.rr-cc-yes').addEventListener('click', function () { set('granted'); apply('granted'); close(); });
    b.querySelector('.rr-cc-no').addEventListener('click', function () { set('denied'); apply('denied'); close(); });
    document.body.appendChild(b);
  }
  window.rrCookieSettings = function (e) { if (e && e.preventDefault) e.preventDefault(); show(); };
  function init() {
    var v = get();
    /* Banner paused 18 Nov 2026 until site updates are finished: it no longer pops up on first visit.
       Analytics stays off unless a visitor opts in via the footer "Cookie settings" link.
       To bring the pop-up back, restore: else { show(); } */
    if (v === 'granted' || v === 'denied') { apply(v); }
    document.querySelectorAll('[data-cookie-settings]').forEach(function (a) { a.addEventListener('click', window.rrCookieSettings); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
