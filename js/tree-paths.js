import * as THREE from 'three';

// Shared deterministic paths keep the lightweight illustration faithful to WebGL.
export function createTreePaths() {
  let seed = 731;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const paths = [];
  for (let i = 0; i < 180; i++) {
    const angle = random() * Math.PI * 2;
    const spread = 1.5 + random() * 2.5;
    const top = 1.5 + random() * 1.55;
    const root = i % 3 === 0;
    const twist = angle + 1.4;
    const points = root ? [
      [Math.cos(angle)*spread, -2.5-random()*.5, Math.sin(angle)*spread*.5],
      [Math.cos(angle)*spread*.6, -2.1, Math.sin(angle)*spread*.4],
      [Math.cos(twist)*.4, -1.3, Math.sin(twist)*.4],
      [Math.cos(twist+1)*.22, -.45, Math.sin(twist+1)*.22],
      [0, .1, 0],
    ] : [
      [Math.cos(angle)*.3, -1.9, Math.sin(angle)*.3],
      [Math.cos(twist)*.24, -.7, Math.sin(twist)*.24],
      [Math.cos(twist+.5)*.32, .2, Math.sin(twist+.5)*.32],
      [Math.cos(angle)*spread*.38, 1.2, Math.sin(angle)*spread*.32],
      [Math.cos(angle)*spread*.8, top, Math.sin(angle)*spread*.62],
      [Math.cos(angle)*spread, top + .1 + random()*.45, Math.sin(angle)*spread*.7],
    ];
    paths.push({ curve: new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), gold: i % 7 === 0, root });
  }
  return paths;
}
