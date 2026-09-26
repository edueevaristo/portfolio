import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { gsap } from "gsap";
import { buildLab } from "./model.js";
import { domains } from "./data.js";

export function createLabScene({
  canvas,
  host,
  compact,
  reduced,
  onSelect,
  onFailure,
}) {
  const renderer = new T.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: compact ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.2;
  room.dispose();
  pmrem.dispose();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 70);
  camera.position.set(9, 10, 12);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.35;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.17;
  controls.minAzimuthAngle = -0.35;
  controls.maxAzimuthAngle = 1.5;
  controls.enabled = !compact;
  if (compact) canvas.style.touchAction = "pan-y";
  scene.add(new T.HemisphereLight(0xdce6ff, 0x030718, 1.8));
  const key = new T.DirectionalLight(0xf2f6ff, 4);
  key.position.set(-4, 8, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0x8cadff, 3);
  rim.position.set(3, 4, -4);
  scene.add(rim);
  const model = buildLab();
  scene.add(model.group);
  const composer = new EffectComposer(renderer);
  // Multisampling keeps tiny circuit traces crisp without a noisy grain filter.
  composer.renderTarget1.samples = compact ? 0 : 4;
  composer.renderTarget2.samples = compact ? 0 : 4;
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(new T.Vector2(700, 600), 0.18, 0.2, 1.8),
  );
  composer.addPass(new OutputPass());
  const clock = { value: 0 };
  const paths = domains.map((domain, index) => {
    const [x, , z] = domain.position;
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(x, -0.39, z),
      new T.Vector3(x * 0.64, -0.39, z * 0.64),
      new T.Vector3(x * 0.5, -0.39, z * 0.12),
      new T.Vector3(0, -0.39, 0),
    ]);
    const material = new T.ShaderMaterial({
      uniforms: {
        uTime: clock,
        uActive: { value: index === 0 ? 1 : 0 },
        uPhase: { value: index * 0.77 },
      },
      transparent: true,
      depthWrite: false,
      vertexShader:
        "varying float vT; void main(){vT=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying float vT;uniform float uTime,uActive,uPhase;void main(){float p=pow(max(0.,sin(vT*17.-uTime*2.+uPhase)),14.);vec3 c=mix(vec3(.06,.1,.2),vec3(.34,.56,1.),uActive);gl_FragColor=vec4(c*(.6+p*(.5+uActive*2.)),.75);}",
      toneMapped: false,
    });
    const mesh = new T.Mesh(
      new T.TubeGeometry(curve, 40, 0.018, 5, false),
      material,
    );
    model.group.add(mesh);
    return material;
  });
  let dead = false,
    inView = false,
    frame = 0,
    time = 0,
    last = 0,
    paused = reduced,
    active = 0,
    slow = 0,
    degraded = compact;
  const tweens = new Set();
  const tween = (target, vars) => {
    const t = gsap.to(target, {
      ...vars,
      onComplete() {
        tweens.delete(this);
      },
      onInterrupt() {
        tweens.delete(this);
      },
    });
    if (vars.duration) tweens.add(t);
  };
  function select(index, instant = false) {
    active = index;
    const duration = reduced || instant ? 0 : 1.05;
    model.modules.forEach((module, i) => {
      tween(module.group.position, {
        y: i === index ? 0.28 : 0,
        duration,
        ease: "power3.inOut",
        overwrite: true,
      });
      tween(module.edge, {
        emissiveIntensity: i === index ? 0.8 : 0.05,
        duration: duration ? 0.6 : 0,
        overwrite: true,
      });
      module.edge.color.set(i === index ? 0x8cadff : 0x30436a);
      tween(paths[i].uniforms.uActive, {
        value: i === index ? 1 : 0,
        duration: duration ? 0.6 : 0,
        overwrite: true,
      });
    });
    wake();
  }
  function resize() {
    if (!host.clientWidth || !host.clientHeight) return;
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    // Keep the complete installation visible in both wide and narrow canvases.
    const distance = camera.aspect < 1 ? 22 : camera.aspect < 1.2 ? 18.5 : 16.6;
    camera.position.set(9, 10, 12).normalize().multiplyScalar(distance);
    controls.update();
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    composer.setSize(host.clientWidth, host.clientHeight);
    wake();
  }
  function render(now) {
    frame = 0;
    if (dead || !inView || document.hidden) return;
    frame = requestAnimationFrame(render);
    if (now - last < (degraded ? 1000 / 30 : 1000 / 45)) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    slow = last && now - last > 70 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 24 && !degraded) {
      degraded = true;
      renderer.setPixelRatio(1);
      composer.setPixelRatio(1);
    }
    last = now;
    if (!paused) time += dt;
    clock.value = time;
    model.core.position.y = paused ? 0 : Math.sin(time * 0.7) * 0.025;
    const cameraChanged = controls.update();
    try {
      composer.render();
    } catch (error) {
      dispose();
      onFailure(error);
    }
    // Reduced motion and manual pause are genuinely idle, not a hidden GPU loop.
    if (paused && !cameraChanged && !tweens.size) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  function wake() {
    if (!frame && !dead && inView && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(render);
    }
  }
  controls.addEventListener("change", wake);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    },
    { threshold: 0.01 },
  );
  viewObserver.observe(host);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  };
  document.addEventListener("visibilitychange", visibility);
  let down = null;
  const raycaster = new T.Raycaster();
  const pointer = new T.Vector2();
  const onDown = (e) => {
    down = [e.clientX, e.clientY];
  };
  const onUp = (e) => {
    if (!down) return;
    const distance = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
    down = null;
    if (distance > 7) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(
      model.modules.map((module) => module.pick),
    )[0];
    if (hit) onSelect(hit.object.userData.domain);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  const onLoss = (e) => {
    e.preventDefault();
    dispose();
    onFailure();
  };
  canvas.addEventListener("webglcontextlost", onLoss);
  function dispose() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(frame);
    tweens.forEach((t) => t.kill());
    tweens.clear();
    controls.dispose();
    resizeObserver.disconnect();
    viewObserver.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("webglcontextlost", onLoss);
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) materials.add(o.material);
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => {
      if (m.map) textures.add(m.map);
      m.dispose();
    });
    textures.forEach((texture) => texture.dispose());
    environment.dispose();
    composer.passes.forEach((p) => p.dispose?.());
    composer.dispose();
    renderer.dispose();
  }
  resize();
  select(active, true);
  composer.render();
  return {
    select,
    setPaused(value) {
      paused = value;
      wake();
    },
    setReduced(value) {
      reduced = value;
      paused = value;
      wake();
    },
    reset() {
      camera.position
        .set(9, 10, 12)
        .normalize()
        .multiplyScalar(
          camera.aspect < 1 ? 22 : camera.aspect < 1.2 ? 18.5 : 16.6,
        );
      controls.target.set(0, 0, 0);
      controls.update();
      wake();
    },
    dispose,
  };
}
