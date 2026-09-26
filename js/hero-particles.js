export function initHeroParticles({ reduced, lowPower }) {
  const canvas = document.querySelector('#hero-particles');
  if (!canvas || lowPower) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const host = canvas.parentElement;
  const count = innerWidth < 700 ? 1400 : 3000;
  const points = Array.from({ length: count }, (_, index) => {
    const latitude = Math.acos(1 - 2 * (index + .5) / count);
    const longitude = index * Math.PI * (3 - Math.sqrt(5));
    const ripple = 1 + .16 * Math.sin(longitude * 6 + latitude * 5)
      + .08 * Math.cos(latitude * 11 - longitude * 3);
    return {
      x: Math.sin(latitude) * Math.cos(longitude) * ripple,
      y: Math.cos(latitude) * ripple,
      z: Math.sin(latitude) * Math.sin(longitude) * ripple,
      size: .45 + (index % 13) / 15,
    };
  });
  let width = 0;
  let height = 0;
  let visible = true;
  let frame = 0;
  let raf = 0;

  function resize() {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const radius = Math.min(width * (width < 650 ? .45 : .28), height * .35);
    const centerX = width / 2;
    const centerY = height * (width < 650 ? .43 : .48);
    const halo = context.createRadialGradient(centerX, centerY, radius * .08, centerX, centerY, radius * 1.3);
    halo.addColorStop(0, 'rgba(36, 110, 255, .27)');
    halo.addColorStop(.56, 'rgba(24, 63, 201, .19)');
    halo.addColorStop(1, 'rgba(17, 44, 153, 0)');
    context.fillStyle = halo;
    context.fillRect(centerX - radius * 1.3, centerY - radius * 1.3, radius * 2.6, radius * 2.6);

    const turn = frame * .0024;
    const cosY = Math.cos(turn);
    const sinY = Math.sin(turn);
    const cosX = Math.cos(-.27 + Math.sin(turn * .7) * .12);
    const sinX = Math.sin(-.27 + Math.sin(turn * .7) * .12);
    const projected = points.map((point) => {
      const rotatedX = point.x * cosY - point.z * sinY;
      const rotatedZ = point.x * sinY + point.z * cosY;
      const rotatedY = point.y * cosX - rotatedZ * sinX;
      const depth = point.y * sinX + rotatedZ * cosX;
      const scale = 2.8 / (3.2 - depth * .42);
      return { x: centerX + rotatedX * radius * scale, y: centerY + rotatedY * radius * scale, depth, scale, size: point.size };
    }).sort((a, b) => a.depth - b.depth);

    projected.forEach((point) => {
      const brightness = (point.depth + 1.3) / 2.6;
      context.fillStyle = `rgba(${Math.round(38 + brightness * 66)}, ${Math.round(102 + brightness * 94)}, 255, ${(.31 + brightness * .67).toFixed(2)})`;
      context.beginPath();
      context.arc(point.x, point.y, point.size * point.scale * (width < 650 ? 1 : 1.25), 0, Math.PI * 2);
      context.fill();
    });
  }

  function tick() {
    if (!visible || document.hidden) { raf = 0; return; }
    frame += 1;
    draw();
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (!raf && !reduced && visible && !document.hidden) raf = requestAnimationFrame(tick);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  });
  observer.observe(host);
  document.addEventListener('visibilitychange', start);
  resize();
  start();
}
