/* EPS shared UI: progress, theme, mobile menu, back to top, cookie notice, video ready */
(function(){
"use strict";
var root=document.documentElement, P=window.EPS_PREFIX||'';

/* ---- theme ---- */
function applyTheme(t){ if(t==='dark'){root.setAttribute('data-theme','dark');}else{root.removeAttribute('data-theme');} }
var saved=null; try{saved=localStorage.getItem('eps-theme');}catch(e){}
if(saved) applyTheme(saved);
else if(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
function toggleTheme(){
  var dark=root.getAttribute('data-theme')==='dark';
  applyTheme(dark?'light':'dark');
  try{localStorage.setItem('eps-theme',dark?'light':'dark');}catch(e){}
  syncThemeBtn();
}
var SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>';
var MOON='<svg viewBox="0 0 24 24"><path d="M20 13.5A8 8 0 1 1 10.5 4a6.6 6.6 0 0 0 9.5 9.5z"/></svg>';
function syncThemeBtn(){
  var dark=root.getAttribute('data-theme')==='dark';
  document.querySelectorAll('.js-theme').forEach(function(b){
    b.innerHTML=dark?SUN:MOON;
    b.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    b.setAttribute('title',dark?'Light mode':'Dark mode');
  });
}

document.addEventListener('DOMContentLoaded',function(){
  var header=document.querySelector('header'),
      bar=document.querySelector('.bar'),
      nav=document.querySelector('nav[aria-label="Main"]'),
      lang=document.querySelector('.lang');
  var isDE=root.getAttribute('lang')==='de';
  var t={
    menu:isDE?'Menü':'Menu', close:isDE?'Schließen':'Close',
    top:isDE?'Nach oben':'Back to top',
    cookieText:isDE?'Diese Website verwendet keine Tracking- oder Werbe-Cookies. Nur Ihre Sprach- und Designeinstellung wird lokal in Ihrem Browser gespeichert.'
                   :'This site uses no tracking or advertising cookies. Only your theme and language preference are stored locally in your browser.',
    ok:isDE?'Verstanden':'Understood', privacy:isDE?'Datenschutz':'Privacy'
  };

  /* ---- progress bar ---- */
  var pb=document.createElement('div'); pb.id='progress'; document.body.appendChild(pb);

  /* ---- header utilities: theme + burger ---- */
  if(bar){
    var util=document.createElement('div'); util.className='util';
    var tb=document.createElement('button'); tb.className='iconbtn js-theme'; tb.type='button';
    tb.addEventListener('click',toggleTheme); util.appendChild(tb);
    var bg=document.createElement('button'); bg.className='iconbtn burger'; bg.type='button';
    bg.setAttribute('aria-label',t.menu); bg.setAttribute('aria-expanded','false');
    bg.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    util.appendChild(bg);
    if(lang) lang.parentNode.insertBefore(util,lang.nextSibling); else bar.appendChild(util);
    syncThemeBtn();

    /* ---- mobile menu ---- */
    var mob=document.createElement('div'); mob.id='mobnav'; mob.setAttribute('aria-hidden','true');
    var logo=document.querySelector('.bar .lg img');
    var links='';
    if(nav) nav.querySelectorAll('a').forEach(function(a){
      links+='<a class="mlink" href="'+a.getAttribute('href')+'">'+a.textContent.trim()+'</a>';
    });
    var quote=document.querySelector('.bar .btn-red');
    mob.innerHTML='<div class="mhead">'+(logo?'<img src="'+logo.getAttribute('src')+'" alt="EPS">':'<span></span>')+
      '<button class="iconbtn js-close" type="button" aria-label="'+t.close+'"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
      '<nav aria-label="Mobile">'+links+'</nav>'+
      '<div class="mfoot">'+(quote?'<a class="btn btn-red" href="'+quote.getAttribute('href')+'">'+quote.textContent.trim()+'</a>':'')+
      (lang?'<div class="lang">'+lang.innerHTML+'</div>':'')+'</div>';
    document.body.appendChild(mob);
    function setNav(open){
      mob.classList.toggle('open',open);
      document.body.classList.toggle('navopen',open);
      mob.setAttribute('aria-hidden',open?'false':'true');
      bg.setAttribute('aria-expanded',open?'true':'false');
      if(open){var f=mob.querySelector('.mlink'); if(f) f.focus();}
    }
    bg.addEventListener('click',function(){setNav(true);});
    mob.querySelector('.js-close').addEventListener('click',function(){setNav(false);});
    mob.addEventListener('click',function(e){if(e.target.classList.contains('mlink'))setNav(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mob.classList.contains('open'))setNav(false);});
    addEventListener('resize',function(){if(innerWidth>900&&mob.classList.contains('open'))setNav(false);});
  }

  /* ---- back to top ---- */
  var tt=document.createElement('button'); tt.id='totop'; tt.type='button';
  tt.setAttribute('aria-label',t.top); tt.setAttribute('title',t.top);
  tt.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  tt.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
  document.body.appendChild(tt);

  /* ---- scroll driven ---- */
  var ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      var d=document.documentElement,
          max=(d.scrollHeight-innerHeight)||1,
          pct=Math.min(100,Math.max(0,scrollY/max*100));
      pb.style.width=pct+'%';
      tt.classList.toggle('show',scrollY>600);
      ticking=false;
    });
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* ---- video ready: stop the shimmer once footage can play ---- */
  document.querySelectorAll('.machine').forEach(function(m){
    var v=m.querySelector('video');
    if(!v){m.classList.add('ready');return;}
    if(v.readyState>=2) m.classList.add('ready');
    ['loadeddata','canplay','error'].forEach(function(ev){
      v.addEventListener(ev,function(){m.classList.add('ready');});
    });
    setTimeout(function(){m.classList.add('ready');},4000);
  });
});
})();
