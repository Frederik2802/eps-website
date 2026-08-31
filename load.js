/* EPS content loader — hydrates pages from content/en/{page}.json.
   Pages work without it (inline defaults); JSON overrides when present. */
(function(){
const page=document.body.dataset.page; if(!page) return;
const get=(o,p)=>p.split('.').reduce((a,k)=>a&&a[k],o);
fetch('content/en/'+page+'.json').then(r=>r.ok?r.json():null).then(j=>{
  if(!j) return;
  document.querySelectorAll('[data-c]').forEach(el=>{
    const v=get(j,el.dataset.c); if(typeof v==='string'&&v) el.innerHTML=v;
  });
  if(Array.isArray(j.sectors)) document.querySelectorAll('[data-si]').forEach(el=>{
    const s=j.sectors[+el.dataset.si]; if(!s) return;
    const h=el.querySelector('h3'); if(h&&s.title) h.textContent=s.title;
    const p=el.querySelector('p'); if(p&&s.desc) p.textContent=s.desc;
  });
  document.querySelectorAll('[data-vslot]').forEach(el=>{
    const v=j.videos&&j.videos[el.dataset.vslot]; if(!v||!v.video) return;
    const vid=document.createElement('video');
    vid.autoplay=true; vid.muted=true; vid.loop=true; vid.playsInline=true;
    vid.setAttribute('playsinline',''); vid.preload='metadata';
    vid.src=v.video; if(v.poster) vid.poster=v.poster;
    vid.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2';
    const f=el.querySelector('.footage'); if(f) f.replaceWith(vid); else el.prepend(vid);
  });
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  if(Array.isArray(j.products)){
    const pl=document.getElementById('plist');
    if(pl) pl.innerHTML=j.products.map(p=>`
<div class="prow" data-f="${esc(p.tag)}"><span class="pn"><a href="${esc(p.url||'#')}">${esc(p.name)}</a><span class="sub">${esc(p.sub)}</span></span><span class="grade">${esc(p.grade)}</span><span>${(p.approvals||[]).map(a=>`<span class="chip">${esc(a)}</span>`).join('')}</span><span class="packs">${esc(p.packs)}</span><span class="act">${p.tds?`<a href="${esc(p.tds)}">TDS</a>`:''}${p.sds?`<a href="${esc(p.sds)}">SDS</a>`:''}${p.url?`<a class="main" href="${esc(p.url)}">VIEW</a>`:''}</span></div>`).join('');
  }
  if(Array.isArray(j.docs)){
    const dl=document.getElementById('dlist');
    if(dl) dl.innerHTML=j.docs.map(d=>`
<div class="drow" data-f="${esc(d.type).toLowerCase()}"><span class="dn">${esc(d.name)}<span class="fam">${esc(d.family)}</span></span><span class="dt">${esc(d.type)} · PDF</span><span class="lang">${esc(d.lang||'EN')}</span><a class="get" href="${esc(d.file||'#')}">DOWNLOAD ↓</a></div>`).join('');
  }
}).catch(()=>{});
})();
