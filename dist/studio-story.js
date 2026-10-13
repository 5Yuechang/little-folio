(() => {
  const story=document.querySelector('.story-scroll'),stage=story.querySelector('.story-stage'),rail=story.querySelector('.story-rail');
  const scenes=[...story.querySelectorAll('[data-story-scene]')],steps=[...story.querySelectorAll('[data-story-step]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=false;
  const enabled=()=>!reduced.matches&&!document.body.classList.contains('motion-quiet')&&innerWidth>760&&innerHeight>=600;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function update(){frame=false;if(!story.classList.contains('story-enabled'))return;
    const progress=clamp((80-story.getBoundingClientRect().top)/Math.max(1,story.offsetHeight-stage.offsetHeight)),position=Math.min(2,progress*2.4),current=Math.round(position);
    rail.style.translate=`${-position*100}% 0`;story.dataset.chapter=current;story.style.setProperty('--story-progress',progress);
    scenes.forEach((scene,i)=>{scene.inert=i!==current;scene.setAttribute('aria-hidden',String(i!==current));});steps.forEach((step,i)=>step.setAttribute('aria-pressed',String(i===current)));
    story.querySelector('.story-scroll-hint').textContent=current===2?'继续下滑，观看 Showreel ↓':'下滑翻阅故事 ↓';
  }
  function schedule(){if(!frame){frame=true;requestAnimationFrame(update);}}
  function sync(){story.classList.toggle('story-enabled',enabled());if(!enabled()){rail.style.translate='';scenes.forEach(scene=>{scene.inert=false;scene.removeAttribute('aria-hidden');});}schedule();}
  steps.forEach((step,i)=>step.addEventListener('click',()=>{if(enabled())scrollTo({top:Math.max(0,story.getBoundingClientRect().top+scrollY-80+(story.offsetHeight-stage.offsetHeight)*i/2.4),behavior:'smooth'});else scenes[i].scrollIntoView({block:'start',behavior:reduced.matches||document.body.classList.contains('motion-quiet')?'instant':'smooth'});}));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',sync);reduced.addEventListener('change',sync);document.querySelector('.motion-toggle').addEventListener('click',sync);new ResizeObserver(schedule).observe(stage);sync();
})();
