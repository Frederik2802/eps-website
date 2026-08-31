/* ==========================================================================
   EPS consent manager  (GDPR / TTDSG)
   --------------------------------------------------------------------------
   HOW TO SWITCH ANALYTICS ON
   1. Pick a provider below and paste your ID or token into CONFIG.
   2. Commit. That is all.

   Cloudflare Web Analytics : free, cookieless.  Token from the Cloudflare
                              dashboard -> Web Analytics -> your site.
   Plausible                : ~9 EUR/month, EU hosted, cookieless.
                              domain = the domain you registered there.
   Google Analytics 4       : sets cookies. Set gateBehindConsent:true and it
                              will only load after the visitor opts in.
   ========================================================================== */
(function () {
"use strict";

var CONFIG = {
  analytics: {
    provider: 'none',          // 'none' | 'cloudflare' | 'plausible' | 'ga4'
    token: '',                 // Cloudflare beacon token
    domain: '',                // Plausible domain, e.g. eps-global.com
    measurementId: '',         // GA4, e.g. G-XXXXXXXXXX
    // Cookieless tools store nothing on the device, so they may run without
    // consent. Set true to require an opt-in anyway (mandatory for GA4).
    gateBehindConsent: false
  },
  marketing: {
    linkedInPartnerId: '',     // LinkedIn Insight Tag
    metaPixelId: ''            // Meta pixel
  },
  consentVersion: 1,
  cookieName: 'eps_consent',
  cookieDays: 182              // re-ask after six months
};

/* ---------- storage ---------- */
function readConsent() {
  var m = document.cookie.match(new RegExp('(?:^|; )' + CONFIG.cookieName + '=([^;]*)'));
  if (!m) return null;
  try {
    var v = JSON.parse(decodeURIComponent(m[1]));
    if (v.v !== CONFIG.consentVersion) return null;
    return v;
  } catch (e) { return null; }
}
function writeConsent(state) {
  var v = { v: CONFIG.consentVersion, analytics: !!state.analytics, marketing: !!state.marketing, ts: Date.now() };
  var exp = new Date(Date.now() + CONFIG.cookieDays * 864e5).toUTCString();
  document.cookie = CONFIG.cookieName + '=' + encodeURIComponent(JSON.stringify(v)) +
    ';expires=' + exp + ';path=/;SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : '');
  return v;
}
function clearConsent() {
  document.cookie = CONFIG.cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
}

/* ---------- signals ---------- */
var gpc = (navigator.globalPrivacyControl === true) || (navigator.doNotTrack === '1');

/* ---------- copy ---------- */
var DE = document.documentElement.lang === 'de';
var T = DE ? {
  title: 'Cookies und Analyse',
  body: 'Wir verwenden nur, was diese Website zum Funktionieren braucht. Optional messen wir anonym, welche Seiten aufgerufen werden, um die Website zu verbessern. Sie entscheiden.',
  accept: 'Alle akzeptieren', reject: 'Alle ablehnen', settings: 'Einstellungen', save: 'Auswahl speichern',
  necessary: 'Notwendig', necessaryTxt: 'Sprache, Farbschema und Ihre Cookie-Entscheidung. Ohne diese funktioniert die Seite nicht wie erwartet. Immer aktiv.',
  analytics: 'Analyse', analyticsTxt: 'Anonyme Reichweitenmessung: welche Seiten besucht werden und woher Besucher kommen. Keine Profile, keine Weitergabe.',
  marketing: 'Marketing', marketingTxt: 'Messung von Werbekampagnen und Retargeting. Derzeit nicht im Einsatz.',
  privacy: 'Datenschutz', close: 'Schließen', always: 'Immer aktiv'
} : {
  title: 'Cookies and analytics',
  body: 'We use only what this site needs to work. Optionally we measure anonymously which pages get visited so we can improve the site. Your choice.',
  accept: 'Accept all', reject: 'Reject all', settings: 'Settings', save: 'Save choice',
  necessary: 'Necessary', necessaryTxt: 'Language, colour theme and your cookie choice. Without these the site will not behave as expected. Always on.',
  analytics: 'Analytics', analyticsTxt: 'Anonymous audience measurement: which pages are visited and where visitors arrive from. No profiles, no sharing.',
  marketing: 'Marketing', marketingTxt: 'Advertising campaign measurement and retargeting. Not currently in use.',
  privacy: 'Privacy', close: 'Close', always: 'Always on'
};

/* ---------- script activation ---------- */
function activate(category) {
  document.querySelectorAll('script[type="text/plain"][data-consent="' + category + '"]').forEach(function (tpl) {
    var s = document.createElement('script');
    for (var i = 0; i < tpl.attributes.length; i++) {
      var a = tpl.attributes[i];
      if (a.name === 'type' || a.name === 'data-consent') continue;
      s.setAttribute(a.name === 'data-src' ? 'src' : a.name, a.value);
    }
    if (!tpl.getAttribute('data-src') && tpl.textContent.trim()) s.text = tpl.textContent;
    tpl.parentNode.insertBefore(s, tpl);
    tpl.remove();
  });
}

function loadAnalytics() {
  var a = CONFIG.analytics, s;
  if (a.provider === 'cloudflare' && a.token) {
    s = document.createElement('script');
    s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: a.token }));
    document.head.appendChild(s);
  } else if (a.provider === 'plausible' && a.domain) {
    s = document.createElement('script');
    s.defer = true; s.src = 'https://plausible.io/js/script.js';
    s.setAttribute('data-domain', a.domain);
    document.head.appendChild(s);
  } else if (a.provider === 'ga4' && a.measurementId) {
    s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + a.measurementId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', a.measurementId, { anonymize_ip: true });
  }
}
function loadMarketing() {
  var m = CONFIG.marketing, s;
  if (m.linkedInPartnerId) {
    window._linkedin_partner_id = m.linkedInPartnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(m.linkedInPartnerId);
    s = document.createElement('script'); s.async = true;
    s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(s);
  }
}

function apply(state) {
  if (state.analytics || (!CONFIG.analytics.gateBehindConsent && CONFIG.analytics.provider !== 'ga4')) {
    loadAnalytics(); activate('analytics');
  }
  if (state.marketing) { loadMarketing(); activate('marketing'); }
  document.dispatchEvent(new CustomEvent('eps:consent', { detail: state }));
}

/* ---------- UI ---------- */
function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function build() {
    var box = el('div', 'cc', '');
  box.id = 'cc';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-live', 'polite');
  box.setAttribute('aria-label', T.title);
  box.innerHTML =
    '<div class="cc-main">' +
      '<h2>' + T.title + '</h2>' +
      '<p>' + T.body + '</p>' +
      '<div class="cc-row">' +
        '<button class="btn btn-red btn-sm js-acc" type="button">' + T.accept + '</button>' +
        '<button class="btn btn-sm js-rej" type="button">' + T.reject + '</button>' +
        '<button class="cc-link js-set" type="button">' + T.settings + '</button>' +
        '<a class="cc-link" href="privacy.html#cookies">' + T.privacy + '</a>' +
      '</div>' +
    '</div>' +
    '<div class="cc-panel" hidden>' +
      '<div class="cc-cat"><div class="cc-cat-h"><b>' + T.necessary + '</b><span class="cc-always">' + T.always + '</span></div><p>' + T.necessaryTxt + '</p></div>' +
      '<div class="cc-cat"><div class="cc-cat-h"><b>' + T.analytics + '</b>' +
        '<label class="cc-sw"><input type="checkbox" class="js-an"><span></span></label></div><p>' + T.analyticsTxt + '</p></div>' +
      '<div class="cc-cat"><div class="cc-cat-h"><b>' + T.marketing + '</b>' +
        '<label class="cc-sw"><input type="checkbox" class="js-mk"><span></span></label></div><p>' + T.marketingTxt + '</p></div>' +
      '<div class="cc-row"><button class="btn btn-red btn-sm js-save" type="button">' + T.save + '</button>' +
        '<button class="cc-link js-back" type="button">' + T.close + '</button></div>' +
    '</div>';
  document.body.appendChild(box);

  var panel = box.querySelector('.cc-panel'),
      main = box.querySelector('.cc-main'),
      an = box.querySelector('.js-an'),
      mk = box.querySelector('.js-mk');

  function show() { requestAnimationFrame(function () { box.classList.add('show'); }); }
  function hide() { box.classList.remove('show'); }
  function decide(state) { apply(writeConsent(state)); hide(); }

  box.querySelector('.js-acc').onclick = function () { decide({ analytics: true, marketing: true }); };
  box.querySelector('.js-rej').onclick = function () { decide({ analytics: false, marketing: false }); };
  box.querySelector('.js-save').onclick = function () { decide({ analytics: an.checked, marketing: mk.checked }); };
  box.querySelector('.js-set').onclick = function () { main.hidden = true; panel.hidden = false; };
  box.querySelector('.js-back').onclick = function () { panel.hidden = true; main.hidden = false; };

  window.EPSConsent = {
    open: function () {
      var c = readConsent() || { analytics: false, marketing: false };
      an.checked = !!c.analytics; mk.checked = !!c.marketing;
      main.hidden = true; panel.hidden = false; show();
    },
    show: show, get: readConsent, reset: function () { clearConsent(); location.reload(); }
  };
  return { show: show, main: main, panel: panel, an: an, mk: mk };
}

document.addEventListener('DOMContentLoaded', function () {
  var ui = build();
  var saved = readConsent();

  if (saved) {
    apply(saved);
  } else if (gpc) {
    // Browser signals "do not track" — honour it without nagging.
    apply(writeConsent({ analytics: false, marketing: false }));
  } else {
    // Cookieless analytics that is not gated may run before a choice is made.
    if (!CONFIG.analytics.gateBehindConsent && CONFIG.analytics.provider !== 'ga4' && CONFIG.analytics.provider !== 'none') loadAnalytics();
    setTimeout(ui.show, 1200);
  }

  // footer link re-opens the settings panel
  document.querySelectorAll('.js-cookie-settings').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); window.EPSConsent.open(); });
  });
});
})();
