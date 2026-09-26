// Lightweight 2.5D enhancement: original rendered art + depth-projected sparks.
// The tree remains visible before this module runs, or if canvas is unavailable.
export function mountTreeEnergy({ reduceMotion, lowPowerDevice, precisePointer }) {
  const visual = document.querySelector('.hero-visual');
  const frame = visual?.querySelector('.hero-art-frame');
  const canvas = visual?.querySelector('.tree-energy');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!frame || !context) return;

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = lowPowerDevice || innerWidth < 760;
  const interval = 1000 / (compact ? 24 : 40);
  let visible = true;
  let request = 0;
  let lastTime = 0;
  let lastDraw = 0;
  let elapsed = 0;
  let width = 1;
  let height = 1;
  let rotationX = 0;
  let rotationY = 0;
  let targetX = 0;
  let targetY = 0;
  let reduced = reduceMotion;

  const tips = [[.16,.24],[.26,.14],[.38,.14],[.50,.09],[.64,.14],[.77,.17],[.85,.27],
    [.16,.35],[.28,.36],[.42,.27],[.58,.27],[.70,.37],[.85,.37]];
  const paths = tips.map(([x, y], index) => ({
    points: [[.50,.69],[.51,.44],[.47+(x-.5)*.45,.42],[x,y]],
    phase: index / tips.length,
    speed: .13 + (index % 3) * .02,
  }));
  for (let i = 0; i < 7; i++) {
    const x = .10 + i * .13;
    paths.push({ points: [[.50,.69],[.52,.81],[x,.86],[x,.95]], phase: i / 7, speed: .19 });
  }
  const sparks = Array.from({ length: compact ? 22 : 48 }, (_, i) => ({
    angle: i * 2.399963,
    phase: ((i * 37) % 101) / 101,
    speed: .08 + (i % 5) * .013,
    depth: .6 + (i % 7) / 7,
  }));

  function resize() {
    width = frame.clientWidth;
    height = frame.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, compact ? 1 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function curve(points, t) {
    const u = 1 - t;
    return [0, 1].map(axis => u*u*u*points[0][axis] + 3*u*u*t*points[1][axis] + 3*u*t*t*points[2][axis] + t*t*t*points[3][axis]);
  }

  function glow(x, y, radius, opacity) {
    const light = context.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, `rgba(245,255,223,${opacity})`);
    light.addColorStop(.15, `rgba(190,255,120,${opacity * .85})`);
    light.addColorStop(.45, `rgba(120,255,60,${opacity * .2})`);
    light.addColorStop(1, 'rgba(120,255,60,0)');
    context.fillStyle = light;
    context.fillRect(x-radius, y-radius, radius*2, radius*2);
  }

  function draw(now) {
    request = requestAnimationFrame(draw);
    if (now - lastDraw < interval) return;
    elapsed += Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    lastDraw = now;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';

    rotationX += (targetX - rotationX) * .08;
    rotationY += (targetY - rotationY) * .08;
    if (!compact) {
      frame.style.setProperty('--tree-rx', `${rotationX + Math.sin(elapsed * .4) * .45}deg`);
      frame.style.setProperty('--tree-ry', `${rotationY + Math.sin(elapsed * .3) * .65}deg`);
    }

    paths.forEach(({ points, phase, speed }, index) => {
      if (compact && index % 2) return;
      const progress = (elapsed * speed + phase) % 1;
      const intensity = Math.sin(progress * Math.PI) * .7;
      for (let tail = 0; tail < 6; tail++) {
        const t = Math.max(0, progress - tail * .013);
        const [x, y] = curve(points, t);
        glow(x * width, y * height, tail ? 2.2 : 7, intensity * (1 - tail / 7));
      }
    });

    sparks.forEach(({ angle, phase, speed, depth }) => {
      const life = (elapsed * speed + phase) % 1;
      const spread = .04 + life * .44;
      // Near particles project larger and travel faster than distant particles.
      const perspective = 1 / (1.1 - life * .2 * depth);
      const x = (.5 + Math.cos(angle) * spread * perspective) * width;
      const y = (.49 + Math.sin(angle) * spread * .9 - life * .06) * height;
      glow(x, y, (1.2 + depth * 2.2) * perspective, Math.sin(life * Math.PI) * .65);
    });
  }

  function update() {
    const running = visible && !document.hidden && !reduced;
    visual.classList.toggle('energy-running', running);
    if (running && !request) {
      lastTime = performance.now();
      request = requestAnimationFrame(draw);
    } else if (!running && request) {
      cancelAnimationFrame(request);
      request = 0;
      context.clearRect(0, 0, width, height);
      frame.style.removeProperty('--tree-rx');
      frame.style.removeProperty('--tree-ry');
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(frame);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: .05 });
  visibilityObserver.observe(visual);
  document.addEventListener('visibilitychange', update);
  motionQuery.addEventListener('change', event => { reduced = event.matches; update(); });
  if (precisePointer && !compact) {
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      targetX = ((event.clientY - rect.top) / rect.height - .5) * -4;
      targetY = ((event.clientX - rect.left) / rect.width - .5) * 5;
    }, { passive: true });
    visual.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  }
  window.addEventListener('pagehide', () => {
    visible = false;
    update();
  });
  window.addEventListener('pageshow', () => { visible = true; update(); });
  resize();
  update();
}
