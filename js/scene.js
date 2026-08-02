import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function mountHeroScene(canvas) {
  if (!canvas) return;

  const host = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  pmrem.dispose();

  const sculpture = new THREE.Group();
  sculpture.scale.setScalar(0.52);
  sculpture.position.x = 1.28;
  scene.add(sculpture);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x465300,
    metalness: 0.12,
    roughness: 0.58,
    clearcoat: 0.42,
    clearcoatRoughness: 0.48,
  });

  async function tryLoadProductionModel() {
    const modelUrl = canvas.dataset.modelUrl;
    if (!modelUrl) return false;
    try {
      const response = await fetch(modelUrl, { cache: 'force-cache' });
      if (!response.ok) return false;
      const buffer = await response.arrayBuffer();
      const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(buffer, '', resolve, reject));
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.material = node.material || material;
          node.castShadow = false;
          node.receiveShadow = false;
        }
      });
      gltf.scene.scale.setScalar(1.55);
      sculpture.add(gltf.scene);
      return true;
    } catch {
      return false;
    }
  }

  if (!(await tryLoadProductionModel())) {
    const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.72, 0.56, 168, 24, 2, 3), material);
    core.rotation.set(0.45, -0.35, 0.2);
    sculpture.add(core);

    const ringMaterial = new THREE.MeshPhysicalMaterial({ color: 0x4f590e, metalness: 0.18, roughness: 0.56, transparent: true, opacity: 0.28 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.025, 10, 100), ringMaterial);
    ring.rotation.set(1.1, 0.35, 0.2);
    sculpture.add(ring);
  }

  const key = new THREE.DirectionalLight(0xf3f0e7, 1.05);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xdfff00, 3.5, 12);
  rim.position.set(-4, -1, 4);
  scene.add(rim);

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  let visible = true;
  let frame = 0;

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function onPointer(event) {
    target.x = (event.clientX / window.innerWidth - 0.5) * 0.85;
    target.y = (event.clientY / window.innerHeight - 0.5) * 0.65;
  }

  function render(time) {
    if (!visible) return;
    pointer.lerp(target, 0.045);
    sculpture.rotation.y = time * 0.00016 + pointer.x;
    sculpture.rotation.x = Math.sin(time * 0.00024) * 0.12 + pointer.y;
    sculpture.position.y = Math.sin(time * 0.0007) * 0.12;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(frame);
    if (visible) frame = requestAnimationFrame(render);
  }, { threshold: 0.01 });

  resize();
  observer.observe(host);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  canvas.style.opacity = '1';
  document.querySelector('.hero-fallback')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: 'forwards', easing: 'ease-out' });
  frame = requestAnimationFrame(render);
}
