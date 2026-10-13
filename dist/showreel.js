(() => {
  const video=document.querySelector('#showreel-video'),button=document.querySelector('#reel-start'),status=document.querySelector('#reel-status');
  let starting=false;
  button.addEventListener('click',async()=>{
    if(starting)return;starting=true;button.hidden=true;video.controls=true;status.textContent='正在加载 Showreel…';
    if(!video.getAttribute('src'))video.src=video.dataset.src;
    else if(video.error)video.load();
    try{await video.play();video.focus({preventScroll:true});}catch{button.hidden=false;status.textContent=video.error?'视频暂时未能播放，请重试或在新标签页打开。':'点击播放器或播放按钮继续观看。';}finally{starting=false;}
  });
  video.addEventListener('playing',()=>{button.hidden=true;status.textContent='正在播放 · 可使用播放器控件调节音量、进度和全屏。';});
  video.addEventListener('waiting',()=>{if(!video.paused)status.textContent='视频缓冲中…';});
  video.addEventListener('pause',()=>{if(!video.ended)status.textContent='已暂停，可使用播放器继续观看。';});
  video.addEventListener('ended',()=>{button.hidden=false;button.querySelector('.reel-play-copy').innerHTML='再看一次<small>02:54 · 完整 Showreel</small>';button.setAttribute('aria-label','重新播放 Showreel');status.textContent='播放结束。';});
  video.addEventListener('error',()=>{starting=false;button.hidden=false;status.textContent='视频暂时未能加载，请重试或在新标签页打开。';});
  const outsidePlayer=()=>document.fullscreenElement!==video&&!video.webkitDisplayingFullscreen&&document.pictureInPictureElement!==video;
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&!video.paused&&outsidePlayer())video.pause();},{threshold:0}).observe(video);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&document.pictureInPictureElement!==video)video.pause();});
})();
