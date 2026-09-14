import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Real-time workstation, built locally without downloaded models or textures.
export function mountHeroScene(canvas) {
  if (!canvas) return;
  const host = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(7, 5.6, 10);
  camera.lookAt(0, 0.7, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const green = new THREE.MeshStandardMaterial({ color: 0xbad526, metalness: 0.45, roughness: 0.28 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x252e24, metalness: 0.45, roughness: 0.34 });
  const olive = new THREE.MeshStandardMaterial({ color: 0x52612a, metalness: 0.35, roughness: 0.4 });
  const signal = new THREE.MeshStandardMaterial({ color: 0xdfff00, emissive: 0xc0dc00, emissiveIntensity: 0.4, roughness: 0.3 });
  const world = new THREE.Group(); scene.add(world);
  const box = (w, h, d, material, x, y, z, parent = world) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(w,h,d) * 0.17), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  };
  box(6.4, 0.23, 4.8, graphite, 0, -0.55, 0);
  box(6.15, 0.05, 4.55, olive, 0, -0.41, 0);

  function screenTexture(type) {
    const surface = document.createElement('canvas'); surface.width = 768; surface.height = 512;
    const ctx = surface.getContext('2d');
    ctx.fillStyle = '#111910'; ctx.fillRect(0, 0, 768, 512);
    ctx.fillStyle = '#263120'; ctx.fillRect(0, 0, 768, 60);
    for (let n=0; n<3; n++) { ctx.beginPath(); ctx.arc(28+n*26,30,6,0,Math.PI*2); ctx.fillStyle=n===0?'#dfff00':'#687651'; ctx.fill(); }
    ctx.font='22px monospace'; ctx.fillStyle='#bbc5a4'; ctx.fillText(type === 'code' ? 'eduardo / workspace' : 'observability / metrics',140,38);
    if (type === 'code') {
      ctx.font='bold 48px monospace'; ctx.fillStyle='#dfff00'; ctx.fillText('< hello, world />',48,146);
      const lines = ['const developer = {', '  name: "Eduardo",', '  stack: ["PHP", "Vue", "React"],', '  passion: "building things"', '};', 'connect(ideas, people, code);'];
      ctx.font='25px monospace';
      lines.forEach((line,i)=>{ctx.fillStyle=i===5?'#dfff00':'#c7cfb5';ctx.fillText(line,48,214+i*44);});
    } else {
      ctx.font='bold 28px monospace'; ctx.fillStyle='#dfff00'; ctx.fillText('SYSTEM PULSE',40,122);
      ctx.strokeStyle='#354329';ctx.lineWidth=2;
      for(let y=180;y<460;y+=65){ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(724,y);ctx.stroke();}
      ctx.strokeStyle='#dfff00';ctx.lineWidth=7;ctx.beginPath();
      [360,344,365,288,315,220,235,164,184,135].forEach((y,i)=> i ? ctx.lineTo(48+i*73,y) : ctx.moveTo(48,y));ctx.stroke();
      ctx.font='22px monospace';ctx.fillStyle='#c7cfb5';ctx.fillText('logs   /   traces   /   metrics',40,477);
    }
    const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return new THREE.MeshBasicMaterial({ map: texture });
  }
  const terminal = new THREE.Group(); world.add(terminal); terminal.position.set(-0.4, 1.5, -0.65);
  box(3.45,2.35,0.24,green,0,0,0,terminal);
  const code = new THREE.Mesh(new THREE.PlaneGeometry(3.19,2.12),screenTexture('code'));
  code.position.z=0.135;terminal.add(code);
  box(0.24,0.83,0.25,olive,-0.4,0.1,-0.65); box(1.3,0.12,0.8,green,-0.4,-0.26,-0.55);
  box(2.6,0.12,0.85,graphite,-0.35,-0.26,1.03);
  for(let row=0;row<3;row++) for(let col=0;col<10;col++) box(0.18,0.04,0.16,(col+row)%7===0?signal:olive,-1.43+col*0.24,-0.175,0.78+row*0.24);
  const database = new THREE.Group(); database.position.set(-2.3,0,0.35);world.add(database);
  for(let i=0;i<3;i++){
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.57,0.57,0.36,40), i===2?green:olive);
    cylinder.position.y=i*0.43;database.add(cylinder);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.565,0.019,6,40),signal);
    rim.rotation.x=Math.PI/2;rim.position.y=i*0.43+0.17;database.add(rim);
  }
  const metrics = new THREE.Group();metrics.position.set(2.05,1.25,-0.2);metrics.rotation.y=-0.22;world.add(metrics);
  box(1.45,1.6,0.19,olive,0,0,0,metrics);
  const chart=new THREE.Mesh(new THREE.PlaneGeometry(1.27,1.41),screenTexture('metrics'));chart.position.z=0.103;metrics.add(chart);
  box(0.12,0.78,0.13,green,2.05,0.08,-0.2);box(1,0.65,0.8,green,2.05,-0.02,1.45);
  for(let i=0;i<3;i++) box(0.12,0.07,0.04,graphite,1.8+i*0.23,0.05,1.86);
  const routes=[
    [[-2.3,-0.24,0.45],[-2.3,-0.24,1.8],[0.3,-0.24,1.8],[2.05,-0.24,1.45]],
    [[2.05,-0.24,1.45],[2.8,-0.24,0.7],[2.8,-0.24,-1.35],[0.1,-0.24,-1.35]],
  ].map(points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',0.15));
  const packets=routes.map(curve=>{
    world.add(new THREE.Mesh(new THREE.TubeGeometry(curve,36,0.018,5,false),olive));
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.055,10,8),signal);world.add(dot);return {curve,dot};
  });
  const light=new THREE.DirectionalLight(0xf6ffdd,3);light.position.set(-3,7,5);scene.add(light);
  const rimLight=new THREE.DirectionalLight(0xdfff00,2);rimLight.position.set(4,3,-4);scene.add(rimLight);
  const target=new THREE.Vector2(),pointer=new THREE.Vector2();
  let inView=true, frame=0, last=0, slowFrames=0, disposed=false, interval=1000/45;
  const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);};
  const onPointer=e=>target.set((e.clientX/innerWidth-.5)*.18,(e.clientY/innerHeight-.5)*.08);
  const fallback=host.querySelector('.hero-fallback');
  function render(time){
    frame=0;if(disposed || !inView || document.hidden)return;
    frame=requestAnimationFrame(render);if(time-last<interval)return;
    if(last && time-last>55)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
    if(slowFrames>40){renderer.setPixelRatio(1);interval=1000/30;slowFrames=0;}
    last=time;pointer.lerp(target,.05);world.rotation.y=pointer.x;world.rotation.x=pointer.y;
    terminal.position.y=1.5+Math.sin(time*.0007)*.035;metrics.position.y=1.25+Math.sin(time*.0008+1)*.065;
    packets.forEach(({curve,dot},i)=>dot.position.copy(curve.getPointAt((time*.0001+i*.45)%1)));
    renderer.render(scene,camera);canvas.style.opacity='1';if(fallback)fallback.style.opacity='0';
  }
  function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(inView&&!document.hidden&&!disposed)frame=requestAnimationFrame(render);}
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;resume();},{threshold:.01});
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);observer.observe(host);
  document.addEventListener('visibilitychange',resume);window.addEventListener('pointermove',onPointer,{passive:true});
  const restore=event=>{event.preventDefault();canvas.style.opacity='0';if(fallback)fallback.style.opacity='1';dispose();};
  canvas.addEventListener('webglcontextlost',restore);
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();
    document.removeEventListener('visibilitychange',resume);window.removeEventListener('pointermove',onPointer);canvas.removeEventListener('webglcontextlost',restore);
    const materials=new Set();scene.traverse(node=>{node.geometry?.dispose();if(node.material)materials.add(node.material);});
    materials.forEach(m=>{m.map?.dispose();m.dispose();});environment.dispose();renderer.dispose();
  }
  resize();resume();return dispose;
}
