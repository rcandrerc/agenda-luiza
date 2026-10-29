// Chuva de confete em tela cheia. Some sozinha em uns 3 segundos.
export function confete(quantidade = 140) {
  if (typeof document === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '50' });
  const dpr = window.devicePixelRatio || 1;
  const largura = window.innerWidth;
  const altura = window.innerHeight;
  canvas.width = largura * dpr;
  canvas.height = altura * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const cores = ['#ffb627', '#2f8fb8', '#2e9e6a', '#d9733a', '#7a5cc7', '#ff6fa3'];
  const pecas = Array.from({ length: quantidade }, () => ({
    x: largura / 2 + (Math.random() - 0.5) * largura * 0.3,
    y: altura * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    g: 0.35 + Math.random() * 0.15,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    r: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.4,
    cor: cores[Math.floor(Math.random() * cores.length)],
  }));

  const inicio = performance.now();
  function quadro(agora) {
    const t = agora - inicio;
    ctx.clearRect(0, 0, largura, altura);
    for (const p of pecas) {
      p.vy += p.g;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 2200) / 800);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < 3000) requestAnimationFrame(quadro);
    else canvas.remove();
  }
  requestAnimationFrame(quadro);
}
