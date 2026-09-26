import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { gsap } from "gsap";
import { buildTree } from "./geometry.js";
import { technologies } from "./data.js";

export function createKnowledgeScene({
  host,
  canvas,
  labels,
  compact,
  reduced,
  onSelect,
  onBack,
  onFailure,
}) {
  const scene = new T.Scene();
  scene.background = new T.Color(0);
  scene.fog = new T.FogExp2(0x011306, 0.012);
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: compact ? "low-power" : "high-performance",
  });
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  controls.rotateSpeed = 0.38;
  controls.enablePan = false;
  controls.zoomSpeed = 0.6;
  controls.minDistance = 2.1;
  controls.maxDistance = 42;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = 2.03;
  controls.autoRotateSpeed = 0.12;
  controls.target.set(0, 0.9, 0);
  scene.add(new T.HemisphereLight(0xb6edb5, 0x142011, 0.7));
  const key = new T.DirectionalLight(0xe9ffe1, 3.2);
  key.position.set(-4, 7, 7);
  scene.add(key);
  const rim = new T.DirectionalLight(0x66ff44, 2.5);
  rim.position.set(4, 4, -4);
  scene.add(rim);
  const fill = new T.PointLight(0x77ff36, 20, 14, 2);
  fill.position.set(0, 0.8, 3);
  scene.add(fill);
  const tree = buildTree(compact);
  scene.add(tree.group);

  const composer = new EffectComposer(renderer);
  const beauty = new RenderPass(scene, camera);
  composer.addPass(beauty);
  const ssao = compact ? null : new SSAOPass(scene, camera, 512, 512, 12);
  if (ssao) {
    ssao.kernelRadius = 4;
    ssao.minDistance = 0.003;
    ssao.maxDistance = 0.045;
    composer.addPass(ssao);
  }
  const bloom = new UnrealBloomPass(
    new T.Vector2(800, 800),
    compact ? 0.72 : 0.9,
    0.35,
    1.15,
  );
  composer.addPass(bloom);
  const finish = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uGrain: { value: reduced ? 0 : 0.012 },
    },
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform float uGrain; varying vec2 vUv;
      void main(){vec3 c=texture2D(tDiffuse,vUv).rgb; vec2 p=(vUv-.5)*1.3;
        float grain=fract(sin(dot(vUv+uTime*.001,vec2(12.9898,78.233)))*43758.5453)-.5;
        c*=1.-dot(p,p)*.27; c+=grain*uGrain*min(1.,max(c.r,max(c.g,c.b))*3.);
        gl_FragColor=vec4(max(c,vec3(0.)),1.);}`,
  });
  composer.addPass(finish);
  composer.addPass(new OutputPass());

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const ctx = glowCanvas.getContext("2d"),
    gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(224,255,174,1)");
  gradient.addColorStop(0.18, "rgba(123,255,66,.65)");
  gradient.addColorStop(0.5, "rgba(60,205,20,.13)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const glowMap = new T.CanvasTexture(glowCanvas);
  const orbGeometry = new T.SphereGeometry(0.29, 24, 16);
  const ringGeometry = new T.TorusGeometry(0.37, 0.009, 5, 48);
  const nodes = technologies.map((tech) => {
    const group = new T.Group();
    group.position.fromArray(tech.position);
    const material = new T.MeshStandardMaterial({
      color: 0x082711,
      emissive: 0x35bd16,
      emissiveIntensity: 0.5,
      roughness: 0.22,
      metalness: 0.65,
    });
    const sphere = new T.Mesh(orbGeometry, material);
    sphere.userData.tech = tech;
    group.add(sphere);
    const ring = new T.Mesh(
      ringGeometry,
      new T.MeshBasicMaterial({
        color: new T.Color(0.38, 1.7, 0.14),
        toneMapped: false,
      }),
    );
    group.add(ring);
    const halo = new T.Sprite(
      new T.SpriteMaterial({
        map: glowMap,
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        opacity: 0.38,
      }),
    );
    halo.scale.setScalar(1.28);
    group.add(halo);
    scene.add(group);
    const target = new T.Vector3(...tech.position);
    const from = new T.Vector3(
      tech.position[0] * 0.66,
      tech.position[1] + (tech.position[1] < -2 ? 0.45 : -0.18),
      tech.position[2] * 0.25,
    );
    const linkCurve = new T.CatmullRomCurve3([
      from,
      from
        .clone()
        .lerp(target, 0.48)
        .add(new T.Vector3(0, 0.2, 0)),
      target,
    ]);
    const linkMat = new T.ShaderMaterial({
      uniforms: { uTime: tree.clock, uBoost: { value: 1 } },
      toneMapped: false,
      vertexShader:
        "varying float vT; void main(){vT=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "uniform float uTime;uniform float uBoost;varying float vT;void main(){float p=pow(max(0.,sin(vT*18.-uTime*5.)),10.);gl_FragColor=vec4(vec3(.22,1.,.035)*(.8+p*4.)*uBoost,1.);}",
    });
    scene.add(
      new T.Mesh(new T.TubeGeometry(linkCurve, 24, 0.012, 4, false), linkMat),
    );
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tech-node";
    button.textContent = tech.name;
    button.setAttribute("aria-label", `Explorar ${tech.name}`);
    button.setAttribute("aria-pressed", "false");
    button.dataset.tech = String(tech.id);
    button.hidden = true;
    labels.append(button);
    button.addEventListener("click", () => onSelect(tech.id));
    return {
      tech,
      group,
      sphere,
      ring,
      halo,
      material,
      linkMat,
      button,
      screen: new T.Vector3(),
    };
  });

  const dustGeometry = new T.BufferGeometry(),
    dustPositions = [];
  for (let i = 0; i < (compact ? 160 : 450); i++) {
    const a = i * 2.39996,
      r = 1 + ((i * 37) % 100) / 20;
    dustPositions.push(
      Math.cos(a) * r,
      ((i * 67) % 101) / 10 - 4.2,
      Math.sin(a) * r * 0.65,
    );
  }
  dustGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(dustPositions, 3),
  );
  const dust = new T.Points(
    dustGeometry,
    new T.PointsMaterial({
      map: glowMap,
      color: 0x91ff6a,
      size: 0.075,
      transparent: true,
      opacity: 0.7,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(dust);

  let width = 1,
    height = 1,
    inView = true,
    frame = 0,
    last = 0,
    time = 0,
    selected = null,
    paused = reduced,
    transition = false,
    dead = false,
    lastInteraction = 0;
  let slowCount = 0,
    degraded = compact,
    restoreFocus = null;
  const homePosition = new T.Vector3(),
    homeTarget = new T.Vector3(0, 0.9, 0),
    savedPosition = new T.Vector3(),
    savedTarget = new T.Vector3();
  const animations = [];
  function killTweens() {
    animations.splice(0).forEach((t) => t.kill());
    transition = false;
    controls.enabled = true;
  }
  function fly(position, target, done) {
    killTweens();
    transition = true;
    controls.enabled = false;
    const duration = reduced ? 0.01 : 1.65;
    animations.push(
      gsap.to(camera.position, { ...position, duration, ease: "power3.inOut" }),
    );
    animations.push(
      gsap.to(controls.target, {
        ...target,
        duration,
        ease: "power3.inOut",
        onComplete: () => {
          transition = false;
          controls.enabled = true;
          lastInteraction = performance.now();
          done?.();
        },
      }),
    );
    resume();
  }
  function focus(id) {
    const node = nodes[id];
    if (!node) return;
    if (selected === null) {
      savedPosition.copy(camera.position);
      savedTarget.copy(controls.target);
      restoreFocus = node.button;
    }
    selected = id;
    const direction = camera.position.clone().sub(controls.target).normalize();
    const p = node.group.position.clone();
    const destination = p
      .clone()
      .addScaledVector(direction, width < 680 ? 5.1 : 3.7);
    const target = p.clone();
    if (width >= 680) target.x += 0.75;
    else target.y -= 0.85;
    fly(destination, target);
    nodes.forEach((n) =>
      n.button.setAttribute("aria-pressed", String(n === node)),
    );
  }
  function overview(reset = false) {
    if (selected === null && !reset) return;
    selected = null;
    nodes.forEach((n) => n.button.setAttribute("aria-pressed", "false"));
    fly(
      reset ? homePosition : savedPosition,
      reset ? homeTarget : savedTarget,
      () => {
        restoreFocus?.focus({ preventScroll: true });
        restoreFocus = null;
      },
    );
  }
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const distance = Math.max(22, 17 / camera.aspect);
    homePosition.set(0, 1.65, distance);
    if (selected === null && !transition) {
      camera.position.copy(homePosition);
      controls.target.copy(homeTarget);
    }
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    resume();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const observer = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      resume();
    },
    { threshold: 0.01 },
  );
  observer.observe(host);

  function render(now) {
    frame = 0;
    if (dead || !inView || document.hidden) return;
    frame = requestAnimationFrame(render);
    const delta = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    if (now - last < (degraded ? 1000 / 30 : 1000 / 50)) return;
    if (last && now - last > 65) slowCount++;
    else slowCount = Math.max(0, slowCount - 1);
    if (slowCount > 32 && !degraded) {
      degraded = true;
      renderer.setPixelRatio(1);
      if (ssao) {
        ssao.enabled = false;
        beauty.enabled = true;
      }
      composer.setPixelRatio(1);
      resize();
    }
    last = now;
    if (!paused) time += delta;
    tree.clock.value = time;
    finish.uniforms.uTime.value = time;
    controls.autoRotate =
      !paused &&
      !transition &&
      selected === null &&
      now - lastInteraction > 5000;
    controls.update(delta);
    dust.rotation.y = Math.sin(time * 0.13) * 0.06;
    dust.position.y = Math.sin(time * 0.4) * 0.06;
    tree.rootLod.update(camera);
    const occupied = [];
    nodes.forEach((node, i) => {
      const active = selected === i;
      const scale = active ? 1.26 : 1 + Math.sin(time * 1.35 + i) * 0.045;
      node.sphere.scale.setScalar(scale);
      node.ring.scale.setScalar(scale);
      node.ring.quaternion.copy(camera.quaternion);
      node.material.emissiveIntensity = T.MathUtils.lerp(
        node.material.emissiveIntensity,
        active ? 2.7 : 0.5,
        0.08,
      );
      node.halo.material.opacity = active
        ? 0.8
        : 0.33 + Math.sin(time * 1.5 + i) * 0.07;
      node.linkMat.uniforms.uBoost.value = active ? 2.6 : 1;
      node.screen.copy(node.group.position).project(camera);
      const visible =
        (selected === null || active) &&
        node.screen.z > -1 &&
        node.screen.z < 1 &&
        Math.abs(node.screen.x) < 1.1 &&
        Math.abs(node.screen.y) < 1.1;
      node.button.hidden = !visible;
      if (visible) {
        let x = (node.screen.x * 0.5 + 0.5) * width,
          y = (-node.screen.y * 0.5 + 0.5) * height;
        const labelWidth = node.button.offsetWidth || 70,
          labelHeight = node.button.offsetHeight || 24;
        x = T.MathUtils.clamp(
          x,
          labelWidth / 2 + 5,
          width - labelWidth / 2 - 5,
        );
        // Small labels remain legible at narrow widths without obscuring each other.
        if (width < 680 && selected === null) {
          for (let attempt = 0; attempt < 7; attempt++) {
            if (
              !occupied.some(
                (r) =>
                  Math.abs(x - r.x) < (labelWidth + r.w) / 2 + 2 &&
                  Math.abs(y - r.y) < labelHeight + 2,
              )
            )
              break;
            y += labelHeight + 2;
          }
        }
        occupied.push({ x, y, w: labelWidth });
        node.button.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
        node.button.style.zIndex = active
          ? "3"
          : String(1 + Math.round((1 - node.screen.z) * 100));
      }
    });
    try {
      composer.render();
    } catch (error) {
      fail(error);
    }
  }
  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!dead && inView && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  const activity = () => {
    lastInteraction = performance.now();
  };
  controls.addEventListener("start", activity);
  const raycaster = new T.Raycaster(),
    pointer = new T.Vector2();
  let down = null;
  const onDown = (e) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) return;
    down = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(nodes.map((n) => n.sphere))[0];
    if (hit) onSelect(hit.object.userData.tech.id);
    else if (selected !== null) onBack();
  };
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    tree.wind.value.set(
      (e.clientX - r.left) / r.width - 0.5,
      (e.clientY - r.top) / r.height - 0.5,
    );
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("visibilitychange", resume);
  const onLoss = (e) => {
    e.preventDefault();
    fail(new Error("WebGL context lost"));
  };
  canvas.addEventListener("webglcontextlost", onLoss);
  function fail(error) {
    dispose();
    onFailure(error);
  }
  function dispose() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(frame);
    killTweens();
    controls.dispose();
    ro.disconnect();
    observer.disconnect();
    document.removeEventListener("visibilitychange", resume);
    canvas.removeEventListener("webglcontextlost", onLoss);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointermove", onMove);
    const geometries = new Set(),
      materials = new Set();
    scene.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) materials.add(o.material);
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    glowMap.dispose();
    composer.passes.forEach((p) => p.dispose?.());
    composer.dispose();
    renderer.dispose();
    labels.replaceChildren();
  }
  resize();
  controls.update();
  composer.render();
  resume();
  return {
    focus,
    overview,
    dispose,
    setPaused(value) {
      paused = value;
      controls.autoRotate = false;
    },
    setReduced(value) {
      reduced = value;
      paused = value;
      finish.uniforms.uGrain.value = value ? 0 : 0.012;
    },
  };
}
