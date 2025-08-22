// Lightweight particle background
(function(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({length: Math.min(120, Math.floor(w*h/14000))}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()*2-1)*0.4, vy: (Math.random()*2-1)*0.4,
      r: Math.random()*1.8+0.6
    }));
  }
  window.addEventListener('resize', resize); resize();

  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.globalAlpha = 0.8;
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
      ctx.globalAlpha = 0.06;
      ctx.fill();
    }
    // soft lines
    ctx.globalAlpha = 0.08;
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const d2=dx*dx+dy*dy;
        if(d2<110*110){
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
})();
