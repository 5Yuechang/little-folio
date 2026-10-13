(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  function update(){scheduled=false;const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?Math.min(1,scrollY/range):0})`;}
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);new ResizeObserver(schedule).observe(document.querySelector('main'));
  const headings = document.querySelectorAll('main > section .section-heading');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('motion-visible', entry.isIntersecting);
  }), {threshold:.15});
  headings.forEach(h => {h.classList.add('motion-heading'); observer.observe(h);});
  reduced.addEventListener('change', schedule); update();

  // The opening is now driven by scroll in story.js.
  function clean(dialog) {
    dialog._motionSequence=(dialog._motionSequence || 0)+1;
    dialog._flight?.cancel(); dialog._flight=null;
    dialog.querySelectorAll('.image-flight').forEach(el=>el.remove());
    dialog.querySelectorAll('.flight-target').forEach(el=>el.classList.remove('flight-target'));
  }
  async function openImage(trigger, dialog, target) {
    clean(dialog);
    if ((reduced.matches || document.body.classList.contains("motion-quiet"))) return;
    const source = trigger?.querySelector('img') || trigger?.closest('article')?.querySelector('img');
    const start = source?.getBoundingClientRect(), sequence=dialog._motionSequence;
    if (!target.complete) {
      await Promise.race([target.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,350))]);
    }
    if (!dialog.open || sequence!==dialog._motionSequence || (reduced.matches || document.body.classList.contains("motion-quiet"))) return;
    const end = target?.getBoundingClientRect();
    if (!source || !start.width || !end?.width || !end.height) return;
    const clone = source.cloneNode(); clone.removeAttribute('id'); clone.alt=''; clone.setAttribute('aria-hidden','true');
    clone.className='image-flight';
    Object.assign(clone.style,{left:end.left+'px',top:end.top+'px',width:end.width+'px',height:end.height+'px'});
    dialog.append(clone); target.classList.add('flight-target');
    const animation=clone.animate([
      {transform:`translate(${start.left-end.left}px,${start.top-end.top}px) scale(${start.width/end.width},${start.height/end.height})`,opacity:1},
      {transform:'translate(0,0) scale(1)',opacity:1}
    ],{duration:340,easing:'cubic-bezier(.22,1,.36,1)'});
    dialog._flight=animation;
    animation.finished.then(()=>clean(dialog)).catch(()=>{});
  }
  window.portfolioMotion = {openImage, clean};
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>clean(dialog));
    dialog.addEventListener('cancel',()=>clean(dialog));
  });
  const stage=document.querySelector('.art-view-stage'), img=document.querySelector('#art-view-image');
  const status=document.createElement('span'); status.className='image-status'; status.setAttribute('role','status'); stage.append(status);
  function loaded() {stage.classList.remove('image-pending');status.textContent='';}
  img.addEventListener('load',loaded);
  img.addEventListener('error',()=>{stage.classList.remove('image-pending');status.textContent='图片暂时未能加载，可切换作品或重新打开。';});
  new MutationObserver(()=>{
    stage.classList.toggle('image-pending', !img.complete);
    status.textContent=img.complete?'':'正在加载完整作品…';
    if (!(reduced.matches || document.body.classList.contains("motion-quiet")) && img.complete) img.animate([{opacity:.35},{opacity:1}],{duration:180});
  }).observe(img,{attributes:true,attributeFilter:['src']});
})();
