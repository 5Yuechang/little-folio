(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const active=()=>!reduced.matches&&!document.body.classList.contains('motion-quiet');
  try{document.body.classList.toggle('motion-quiet',localStorage.getItem('folio-motion')==='off');}catch{}
  const toggle=document.createElement('button');toggle.type='button';toggle.className='motion-toggle';toggle.setAttribute('aria-label','切换动态效果');
  const controls=document.querySelector('.studio-nav-controls');controls.prepend(toggle);controls.prepend(document.querySelector('#view-switch'));
  function label(){toggle.textContent=active()?'动效开':'动效关';toggle.setAttribute('aria-pressed',String(active()));}
  toggle.addEventListener('click',()=>{document.body.classList.toggle('motion-quiet');try{localStorage.setItem('folio-motion',document.body.classList.contains('motion-quiet')?'off':'on');}catch{}document.querySelectorAll('dialog').forEach(d=>window.portfolioMotion?.clean(d));label();dispatchEvent(new Event('scroll'));});reduced.addEventListener('change',label);label();
  const menu=document.querySelector('#studio-menu'),header=document.querySelector('.sidebar');
  function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开导航');}
  menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航':'打开导航');});document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',closeMenu));addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();cancelRoute();}});
  const spotlight=document.querySelector('.spotlight-title');
  spotlight.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;const r=spotlight.getBoundingClientRect();spotlight.style.setProperty('--spot-x',`${e.clientX-r.left}px`);spotlight.style.setProperty('--spot-y',`${e.clientY-r.top}px`);spotlight.classList.add('spotlight-active');});spotlight.addEventListener('pointerleave',()=>spotlight.classList.remove('spotlight-active'));
  const cursor=document.createElement('span');cursor.className='work-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  const cards=[...document.querySelectorAll('.art-card,.product-image,[data-art-open]')];cards.forEach(card=>{card.classList.add('interactive-card');card.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;cursor.textContent=card.dataset.product?'探索项目 ↗':'查看作品 ↗';cursor.style.translate=`${e.clientX+18}px ${e.clientY+18}px`;cursor.classList.add('cursor-visible');});card.addEventListener('pointerleave',()=>cursor.classList.remove('cursor-visible'));card.addEventListener('click',()=>cursor.classList.remove('cursor-visible'));});
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('media-revealed');reveal.unobserve(e.target);}}),{threshold:.1});document.querySelectorAll('.art-preview,.product-image').forEach(e=>reveal.observe(e));
  function galleryLayout(){document.querySelectorAll('.art-card:not([hidden])').forEach((c,i)=>c.classList.toggle('art-feature',i%5===0));}galleryLayout();
  document.querySelectorAll('.art-filter,#expand-art').forEach(button=>button.addEventListener('click',()=>{const before=new Map([...document.querySelectorAll('.art-card:not([hidden])')].map(c=>[c,c.getBoundingClientRect()]));requestAnimationFrame(()=>{galleryLayout();if(!active())return;document.querySelectorAll('.art-card:not([hidden])').forEach(c=>{const r=c.getBoundingClientRect(),prior=before.get(c);c.getAnimations().forEach(a=>a.cancel());c.animate(prior?[{translate:`${prior.left-r.left}px ${prior.top-r.top}px`},{translate:'0 0'}]:[{opacity:0,clipPath:'inset(0 0 25%)'},{opacity:1,clipPath:'inset(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});});});},true));
  const curtain=document.createElement('div');curtain.className='studio-curtain';curtain.setAttribute('aria-hidden','true');curtain.innerHTML='<span></span>';document.body.append(curtain);let route=0,animation,timer;
  function cancelRoute(){route++;clearTimeout(timer);animation?.cancel();curtain.classList.remove('curtain-active');}
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',async e=>{
    if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||!active()||document.body.classList.contains('canvas-mode'))return;const hash=link.getAttribute('href');if(hash==='#main'||hash.length<2)return;const target=document.getElementById(hash.slice(1));if(!target)return;
    e.preventDefault();cancelRoute();closeMenu();const token=route;curtain.querySelector('span').textContent=target.querySelector('h2')?.textContent||'Shuo Yin';curtain.classList.add('curtain-active');timer=setTimeout(()=>{if(token===route)cancelRoute();},650);
    try{animation=curtain.animate([{translate:'0 100%'},{translate:'0 0'}],{duration:150,easing:'cubic-bezier(.7,0,.3,1)',fill:'forwards'});await animation.finished;if(token!==route)return;if(location.hash!==hash)history.pushState(null,'',hash);scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-80),behavior:'instant'});animation=curtain.animate([{translate:'0 0'},{translate:'0 -100%'}],{duration:210,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});await animation.finished;}catch{}finally{if(token===route)cancelRoute();}
  }));
  addEventListener('wheel',cancelRoute,{passive:true});addEventListener('touchstart',cancelRoute,{passive:true});addEventListener('popstate',cancelRoute);reduced.addEventListener('change',cancelRoute);toggle.addEventListener('click',()=>{cancelRoute();spotlight.classList.remove('spotlight-active');cursor.classList.remove('cursor-visible');if(!active())document.querySelectorAll('.art-card').forEach(c=>c.getAnimations().forEach(a=>a.cancel()));});
  const back=document.createElement('button');back.className='back-to-top';back.type='button';back.textContent='↑';back.setAttribute('aria-label','回到顶部');back.hidden=true;back.addEventListener('click',()=>scrollTo({top:0,behavior:active()?'smooth':'instant'}));document.body.append(back);let frame=false;
  function update(){frame=false;back.hidden=scrollY<600;const player=document.querySelector('.reel-player'),rect=player.getBoundingClientRect(),enter=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.65)));player.style.setProperty('--reel-closed',active()&&innerWidth>760&&!player.classList.contains('reel-live')?(1-enter).toFixed(3):'0');}function schedule(){if(!frame){frame=true;requestAnimationFrame(update);}}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule();
  const image=document.querySelector('#art-view-image'),dialog=document.querySelector('#art-dialog');let flip;function turn(sign){if(!active())return;flip?.cancel();flip=image.animate([{opacity:.3,translate:`${sign*30}px 0`},{opacity:1,translate:'0 0'}],{duration:240,easing:'ease-out'});}document.querySelector('#prev-art').addEventListener('click',()=>turn(-1));document.querySelector('#next-art').addEventListener('click',()=>turn(1));dialog.addEventListener('close',()=>flip?.cancel());
  let start;const imageStage=document.querySelector('.art-view-stage');imageStage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')start={x:e.clientX,y:e.clientY};});imageStage.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)document.querySelector(dx<0?'#next-art':'#prev-art').click();});imageStage.addEventListener('pointercancel',()=>start=null);
  // Project filters reflow like the gallery; project covers fly into their dialog; dialogs ease out on close.
  const projectCards=[...document.querySelectorAll('.project')],ease='cubic-bezier(.22,1,.36,1)';
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
    if(!active()||document.body.classList.contains('canvas-mode'))return;
    const before=new Map(projectCards.filter(c=>!c.hidden).map(c=>[c,c.getBoundingClientRect()]));
    requestAnimationFrame(()=>projectCards.filter(c=>!c.hidden).forEach(c=>{const r=c.getBoundingClientRect(),prior=before.get(c);c.getAnimations().forEach(a=>a.cancel());
      c.animate(prior?[{translate:`${prior.left-r.left}px ${prior.top-r.top}px`},{translate:'0 0'}]:[{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:340,easing:ease});}));
  },true));
  projectCards.forEach(card=>{
    card.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;const r=card.querySelector('.project-visual').getBoundingClientRect();
      card.style.setProperty('--cx',`${((e.clientX-r.left)/r.width-.5)*14}px`);card.style.setProperty('--cy',`${((e.clientY-r.top)/r.height-.5)*10}px`);});
    card.addEventListener('pointerleave',()=>{card.style.removeProperty('--cx');card.style.removeProperty('--cy');});
  });
  const projectDialog=document.querySelector('#project-dialog');let lastProject=null;
  projectCards.forEach(card=>card.addEventListener('click',()=>{lastProject=card;},true));
  new MutationObserver(()=>{
    const trigger=lastProject;lastProject=null;if(!projectDialog.open||!trigger||!active())return;
    const source=trigger.querySelector('.project-visual'),target=projectDialog.querySelector('#dialog-visual .project-visual');if(!source||!target)return;
    const s=source.getBoundingClientRect(),t=target.getBoundingClientRect();if(!s.width||!t.width||!t.height)return;
    target.animate([{transformOrigin:'0 0',transform:`translate(${s.left-t.left}px,${s.top-t.top}px) scale(${s.width/t.width},${s.height/t.height})`,borderRadius:'11px'},{transformOrigin:'0 0',transform:'none',borderRadius:'0'}],{duration:420,easing:ease});
    target.querySelector('.cover-type')?.animate([{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:340,delay:160,easing:'ease-out',fill:'backwards'});
  }).observe(projectDialog,{attributes:true,attributeFilter:['open']});
  document.querySelectorAll('dialog').forEach(d=>{
    const close=d.close.bind(d);let closing=null;
    d.close=function(value){
      if(!d.open)return;if(!active())return close(value);if(closing)return;
      const parts=[d.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 12px'}],{duration:160,easing:'ease-in',fill:'forwards'})];
      try{parts.push(d.animate([{opacity:1},{opacity:0}],{duration:160,easing:'ease-in',fill:'forwards',pseudoElement:'::backdrop'}));}catch{}
      closing=Promise.all(parts.map(a=>a.finished)).catch(()=>{}).then(()=>{closing=null;parts.forEach(a=>a.cancel());if(d.open)close(value);});
    };
    d.addEventListener('cancel',e=>{if(active()&&!closing){e.preventDefault();d.close();}});
  });
  // Reel opens like a window; once playing it stays fully open.
  const reelPlayer=document.querySelector('.reel-player'),reelVideo=document.querySelector('#showreel-video');
  reelVideo?.addEventListener('play',()=>{reelPlayer.classList.add('reel-live');reelPlayer.style.setProperty('--reel-closed','0');});
  // Exhibition numbering and staggered entrances for products and artworks.
  document.querySelectorAll('.product-card').forEach((card,i)=>{const no=document.createElement('span');no.className='exhibit-no';no.setAttribute('aria-hidden','true');no.textContent=`No.${String(i+1).padStart(2,'0')}`;card.querySelector('.product-card-body')?.prepend(no);card.querySelector('.product-image')?.style.setProperty('--stagger',`${(i%2)*110}ms`);});
  function staggerArt(){document.querySelectorAll('.art-card:not([hidden]) .art-preview').forEach((p,i)=>p.style.setProperty('--stagger',`${(i%3)*80}ms`));}staggerArt();
  document.querySelectorAll('.art-filter,#expand-art').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(staggerArt)));
  // Spotlight follows with a soft spring and swells on press.
  const spot={x:0,y:0,tx:0,ty:0,r:0,tr:0,raf:0};
  function spotFrame(){spot.x+=(spot.tx-spot.x)*.2;spot.y+=(spot.ty-spot.y)*.2;spot.r+=(spot.tr-spot.r)*.16;
    spotlight.style.setProperty('--sx',`${spot.x.toFixed(1)}px`);spotlight.style.setProperty('--sy',`${spot.y.toFixed(1)}px`);spotlight.style.setProperty('--spot-r',`${Math.max(0,spot.r).toFixed(1)}px`);
    if(Math.abs(spot.tx-spot.x)+Math.abs(spot.ty-spot.y)+Math.abs(spot.tr-spot.r)<.4){spot.raf=0;return;}spot.raf=requestAnimationFrame(spotFrame);}
  const kickSpot=()=>{if(!spot.raf)spot.raf=requestAnimationFrame(spotFrame);};
  const spotAt=e=>{const r=spotlight.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  spotlight.addEventListener('pointerenter',e=>{if(!active()||!fine.matches)return;[spot.tx,spot.ty]=spotAt(e);if(spot.r<1){spot.x=spot.tx;spot.y=spot.ty;}spot.tr=150;kickSpot();});
  spotlight.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;[spot.tx,spot.ty]=spotAt(e);if(spot.tr===0)spot.tr=150;kickSpot();});
  spotlight.addEventListener('pointerdown',()=>{if(spot.tr){spot.tr=230;kickSpot();}});
  spotlight.addEventListener('pointerup',()=>{if(spot.tr){spot.tr=150;kickSpot();}});
  spotlight.addEventListener('pointerleave',()=>{spot.tr=0;kickSpot();});
  // Section titles: a lime highlight follows the pointer.
  document.querySelectorAll('.section-heading h2').forEach(h=>{
    h.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;const r=h.getBoundingClientRect();h.style.setProperty('--hx',`${e.clientX-r.left}px`);h.style.setProperty('--hy',`${e.clientY-r.top}px`);h.classList.add('ink-on');});
    h.addEventListener('pointerleave',()=>h.classList.remove('ink-on'));
  });
  // Chapter meter: where you are on the page, and how far through this chapter.
  const chapterNames={home:'介绍',showreel:'Showreel',products:'交互项目',gallery:'视觉作品',resume:'经历摘要',work:'项目实践',about:'关于我',contact:'联系'};
  const chapters=[...document.querySelectorAll('main>section[id]')].filter(s=>chapterNames[s.id]),storyEl=document.querySelector('.story-scroll');
  const meter=document.createElement('div');meter.className='chapter-meter';meter.setAttribute('aria-hidden','true');
  meter.innerHTML=`<span class="chapter-count"><b>01</b><small>/${String(chapters.length).padStart(2,'0')}</small></span><span class="chapter-name"></span><span class="chapter-bar"><i></i></span>`;
  controls.prepend(meter);
  const meterNo=meter.querySelector('b'),meterName=meter.querySelector('.chapter-name'),meterBar=meter.querySelector('i');let lastChapter=-1,meterFrame=false;
  function meterUpdate(){meterFrame=false;const line=innerHeight*.35;let idx=0;chapters.forEach((s,i)=>{if(s.getBoundingClientRect().top<=line)idx=i;});
    const atEnd=scrollY+innerHeight>=document.documentElement.scrollHeight-4;if(atEnd)idx=chapters.length-1;
    const r=chapters[idx].getBoundingClientRect(),within=atEnd?1:Math.max(0,Math.min(1,(line-r.top)/Math.max(1,r.height)));meterBar.style.transform=`scaleX(${within.toFixed(3)})`;
    const sub=chapters[idx].id==='home'&&storyEl.classList.contains('story-enabled')?` · ${(+storyEl.dataset.chapter||0)+1}/3`:'';const name=chapterNames[chapters[idx].id]+sub;if(meterName.textContent!==name)meterName.textContent=name;
    if(idx!==lastChapter){meterNo.textContent=String(idx+1).padStart(2,'0');if(lastChapter>=0&&active())meterNo.animate([{translate:`0 ${idx>lastChapter?'':'-'}100%`,opacity:0},{translate:'0 0',opacity:1}],{duration:220,easing:ease});lastChapter=idx;}}
  const meterSchedule=()=>{if(!meterFrame){meterFrame=true;requestAnimationFrame(meterUpdate);}};addEventListener('scroll',meterSchedule,{passive:true});addEventListener('resize',meterSchedule);new MutationObserver(meterSchedule).observe(storyEl,{attributes:true,attributeFilter:['data-chapter','class']});meterUpdate();
})();
