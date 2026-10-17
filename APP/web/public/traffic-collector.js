/* Optional anonymous pageviews. No cookie, persistent ID, IP, or fingerprint. */
(() => {
  try {
    if (window.__fcTrafficV1 || window.top !== window.self) return;
    window.__fcTrafficV1 = true;
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
    const script = document.currentScript;
    if (script?.getAttribute('data-enabled') !== 'true') return;
    const endpoint = script?.getAttribute('data-endpoint') || '/api/traffic/pageview';
    let previous = '';
    let internal = /(?:^|;\s*)traffic_internal=1(?:;|$)/.test(document.cookie);
    const send = () => {
      try {
        const query = new URLSearchParams(location.search);
        if (['traffic_test', 'internal_test', 'qa', 'e2e'].some(key => query.has(key))) {
          internal = true; sessionStorage.setItem('traffic-internal', '1');
        }
        if (internal || sessionStorage.getItem('traffic-internal') === '1') return;
        if (/^\/(api|auth|_next|owner|customers|command-center|lead-arcade|table-os|pilot)(\/|$)/i.test(location.pathname)) return;
        if (previous === location.pathname) return;
        previous = location.pathname;
        let referrer = null;
        try { referrer = new URL(document.referrer).origin; } catch { /* direct visit */ }
        const body = JSON.stringify({ id: crypto.randomUUID(), ts: Date.now(), hostname: location.hostname, path: location.pathname, referrer });
        // text/plain avoids a cross-origin preflight for the separate Colattao
        // app. credentials:omit ensures no private cookie is transmitted.
        void fetch(endpoint, { method: 'POST', body, mode: 'no-cors', credentials: 'omit', keepalive: true,
          headers: { 'Content-Type': 'text/plain' }, signal: AbortSignal.timeout(3000) }).catch(() => {});
      } catch { /* traffic is optional; menus and games always continue */ }
    };
    for (const key of ['pushState', 'replaceState']) {
      const original = history[key];
      history[key] = function (...args) { const result = original.apply(this, args); queueMicrotask(send); return result; };
    }
    addEventListener('popstate', send); send();
  } catch { /* no tracking dependency may break the page */ }
})();
