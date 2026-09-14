import * as THREE from 'three';
import { createTreePaths } from './tree-paths.js';

export function mountHeroScene(canvas) {
  if (!canvas) return;
  const host = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
  camera.position.set(0, .3, 12.8);
  camera.lookAt(0, .1, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  const world = new THREE.Group();
  scene.add(world);
  const paths = createTreePaths();
  const linePositions = [[], []];
  paths.forEach(({ curve, gold }) => {
    const points = curve.getPoints(80);
    for (let j = 1; j < points.length; j++) linePositions[gold ? 1 : 0].push(...points[j-1].toArray(), ...points[j].toArray());
  });
  linePositions.forEach((positions, i) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    world.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: i ? 0xddec8c : 0x69cc65, transparent: true, opacity: i ? .65 : .28, blending: THREE.AdditiveBlending, depthWrite: false })));
  });
  const surface = document.createElement('canvas'); surface.width = surface.height = 64;
  const ctx = surface.getContext('2d');
  const gradient = ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(245,255,210,1)'); gradient.addColorStop(.12,'rgba(180,255,120,.9)'); gradient.addColorStop(.35,'rgba(95,220,75,.25)'); gradient.addColorStop(1,'rgba(30,140,50,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const glow = new THREE.CanvasTexture(surface);
  const pulsePositions = new Float32Array(paths.length * 3);
  const pulseGeometry = new THREE.BufferGeometry();
  pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions,3));
  world.add(new THREE.Points(pulseGeometry,new THREE.PointsMaterial({ map:glow,color:0xcaff9a,size:.15,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false })));
  const dust=[];
  for(let i=0;i<600;i++) { const a=i*2.39996,r=1.2+3.9*((i*73%601)/601);dust.push(Math.cos(a)*r,((i*137%601)/601)*7-3.4,Math.sin(a)*r*.65); }
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));
  const stars=new THREE.Points(dustGeometry,new THREE.PointsMaterial({map:glow,color:0x8fbb73,size:.045,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));world.add(stars);
  const hub=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0x95ff73,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false}));hub.scale.set(2,3,1);hub.position.y=-.45;world.add(hub);
  const nodes=[];
  ['</>','API','{ }','SQL','UI','git'].forEach((label,i)=>{
    const path=paths[12+i*23];const point=path.curve.getPoint(.84);
    const badge=document.createElement('canvas');badge.width=badge.height=256;
    const context=badge.getContext('2d');
    context.fillStyle='rgba(9,22,15,.9)';context.strokeStyle='#bfe780';context.lineWidth=2;
    context.beginPath();context.arc(128,128,96,0,Math.PI*2);context.fill();context.stroke();
    context.strokeStyle='rgba(124,202,112,.4)';context.beginPath();context.arc(128,128,110,.2,5.3);context.stroke();
    context.fillStyle='#e1f5b2';context.font='500 44px monospace';context.textAlign='center';context.textBaseline='middle';context.fillText(label,128,130);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(badge),transparent:true,depthWrite:false}));sprite.position.copy(point);sprite.position.z+=.2;sprite.scale.setScalar(.68);world.add(sprite);nodes.push(sprite);
  });
  const target=new THREE.Vector2(),pointer=new THREE.Vector2();
  const fallback=host.querySelector('.hero-fallback');
  let inView=true,frame=0,last=0,disposed=false,slowFrames=0,interval=1000/45;
  function resize(){ const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.position.z=Math.max(12.8,9.2/camera.aspect);camera.updateProjectionMatrix();renderer.setSize(width,height,false); }
  const onPointer=e=>target.set((e.clientX/innerWidth-.5)*.35,(e.clientY/innerHeight-.5)*.09);
  function render(time){
    frame=0;if(disposed||!inView||document.hidden)return;
    frame=requestAnimationFrame(render);if(time-last<interval)return;
    slowFrames=last&&time-last>55?slowFrames+1:Math.max(0,slowFrames-1);
    if(slowFrames>40){renderer.setPixelRatio(1);interval=1000/30;slowFrames=0;}
    last=time;pointer.lerp(target,.035);world.rotation.y=Math.sin(time*.00008)*.12+pointer.x;world.rotation.x=pointer.y;
    paths.forEach(({curve},i)=>curve.getPoint((time*.000035+i*.618034)%1).toArray(pulsePositions,i*3));
    pulseGeometry.attributes.position.needsUpdate=true;
    hub.material.opacity=.25+Math.sin(time*.001)*.045;
    renderer.render(scene,camera);canvas.style.opacity='1';if(fallback)fallback.style.opacity='0';
  }
  function resume(){cancelAnimationFrame(frame);last=0;if(inView&&!document.hidden&&!disposed)frame=requestAnimationFrame(render);}
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;resume();},{threshold:.01});
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);observer.observe(host);
  document.addEventListener('visibilitychange',resume);window.addEventListener('pointermove',onPointer,{passive:true});
  const restore=event=>{event.preventDefault();canvas.style.opacity='0';if(fallback)fallback.style.opacity='1';dispose();};canvas.addEventListener('webglcontextlost',restore);
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();document.removeEventListener('visibilitychange',resume);window.removeEventListener('pointermove',onPointer);canvas.removeEventListener('webglcontextlost',restore);
    const materials=new Set(),textures=new Set();scene.traverse(node=>{node.geometry?.dispose();if(node.material)materials.add(node.material);});materials.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();
  }
  resize();resume();return dispose;
}
