(() => {
  const story=document.querySelector('.story-scroll'),stage=story.querySelector('.story-stage'),rail=story.querySelector('.story-rail');
  const scenes=[...story.querySelectorAll('[data-story-scene]')],steps=[...story.querySelectorAll('[data-story-step]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=false;
  const enabled=()=>!reduced.matches&&!document.body.classList.contains('motion-quiet')&&innerWidth>760&&innerHeight>=600;
  const clamp=n=>Math.max(0,Math.min(1,n));
  // Each chapter holds while you read, then glides to the next one.
  const moves=[[.18,.41],[.59,.82]],stops=[0,.5,.9];
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const positionAt=p=>moves.reduce((pos,[a,b])=>pos+(p<=a?0:p>=b?1:ease((p-a)/(b-a))),0);
  function update(){frame=false;if(!story.classList.contains('story-enabled'))return;
    const progress=clamp((80-story.getBoundingClientRect().top)/Math.max(1,story.offsetHeight-stage.offsetHeight)),position=positionAt(progress),current=Math.round(position);
    rail.style.translate=`${-position*100}% 0`;story.dataset.chapter=current;story.style.setProperty('--story-progress',progress);
    scenes.forEach((scene,i)=>{const d=i-position;scene.style.setProperty('--d',d.toFixed(3));scene.style.setProperty('--fade',(1-Math.min(1,Math.abs(d))*.65).toFixed(3));scene.inert=i!==current;scene.setAttribute('aria-hidden',String(i!==current));});steps.forEach((step,i)=>step.setAttribute('aria-pressed',String(i===current)));
    story.querySelector('.story-scroll-hint').textContent=current===2?'继续下滑，观看 Showreel ↓':'下滑翻阅故事 ↓';
  }
  function schedule(){if(!frame){frame=true;requestAnimationFrame(update);}}
  function sync(){story.classList.toggle('story-enabled',enabled());if(!enabled()){rail.style.translate='';scenes.forEach(scene=>{scene.style.removeProperty('--d');scene.style.removeProperty('--fade');scene.inert=false;scene.removeAttribute('aria-hidden');});}schedule();}
  steps.forEach((step,i)=>step.addEventListener('click',()=>{if(enabled())scrollTo({top:Math.max(0,story.getBoundingClientRect().top+scrollY-80+(story.offsetHeight-stage.offsetHeight)*stops[i]),behavior:'smooth'});else scenes[i].scrollIntoView({block:'start',behavior:reduced.matches||document.body.classList.contains('motion-quiet')?'instant':'smooth'});}));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',sync);reduced.addEventListener('change',sync);document.querySelector('.motion-toggle').addEventListener('click',sync);new ResizeObserver(schedule).observe(stage);sync();
})();
