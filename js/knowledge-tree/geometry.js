import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Deterministic construction keeps the tree stable between visits and quality tiers.
export function buildTree(compact = false) {
  let seed = 82371;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const group = new T.Group();
  const wood = [],
    rootsHigh = [],
    rootsLow = [],
    veins = [],
    leafCenters = [];
  const clock = { value: 0 };
  const wind = { value: new T.Vector2() };
  const curve = (points) =>
    new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));

  // Tapered, fluted tubes are closed volumetric surfaces, not lines/billboards.
  function tube(
    path,
    radius,
    segments = 40,
    sides = 8,
    taper = 0.06,
    ridges = true,
  ) {
    const frames = path.computeFrenetFrames(segments, false);
    const positions = [],
      uvs = [],
      indices = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments,
        point = path.getPointAt(t);
      for (let j = 0; j <= sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        const detail = ridges
          ? 1 +
            0.11 * Math.sin(a * 5 + t * 23) +
            0.045 * Math.sin(a * 11 - t * 53)
          : 1;
        const r =
          radius * (taper + (1 - taper) * Math.pow(1 - t, 0.72)) * detail;
        positions.push(
          point.x +
            r *
              (frames.normals[i].x * Math.cos(a) +
                frames.binormals[i].x * Math.sin(a)),
          point.y +
            r *
              (frames.normals[i].y * Math.cos(a) +
                frames.binormals[i].y * Math.sin(a)),
          point.z +
            r *
              (frames.normals[i].z * Math.cos(a) +
                frames.binormals[i].z * Math.sin(a)),
        );
        uvs.push(t, j / sides);
        if (i < segments && j < sides) {
          const k = i * (sides + 1) + j;
          indices.push(
            k,
            k + 1,
            k + sides + 1,
            k + 1,
            k + sides + 2,
            k + sides + 1,
          );
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  // Follow the actual outside of the tapered bark, so opaque wood never hides
  // the energy. Frenet frames keep these strands attached from every orbit angle.
  function surfaceVeins(path, radius, count = 3, taper = 0.06) {
    const steps = 48,
      frames = path.computeFrenetFrames(steps, false);
    for (let strand = 0; strand < count; strand++) {
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps,
          a = (strand / count) * Math.PI * 2 + t * 2.3;
        const detail =
          1 +
          0.11 * Math.sin(a * 5 + t * 23) +
          0.045 * Math.sin(a * 11 - t * 53);
        const r =
          radius * (taper + (1 - taper) * Math.pow(1 - t, 0.72)) * detail +
          0.015;
        const p = path
          .getPointAt(t)
          .addScaledVector(frames.normals[i], Math.cos(a) * r)
          .addScaledVector(frames.binormals[i], Math.sin(a) * r);
        points.push(p);
      }
      veins.push(
        tube(
          new T.CatmullRomCurve3(points),
          0.007 + radius * 0.007,
          60,
          4,
          0.35,
          false,
        ),
      );
    }
  }

  const bark = new T.MeshStandardMaterial({
    color: 0x343323,
    roughness: 0.84,
    metalness: 0.14,
  });
  bark.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBark;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvBark = position;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBark;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float grain = sin(vBark.x*61.0 + sin(vBark.y*4.0)*3.0 + vBark.z*43.0);
        float fine = sin(vBark.x*217.0 + vBark.y*17.0 + vBark.z*139.0);
        diffuseColor.rgb *= .67 + .24*grain + .09*fine;`,
      );
  };
  const energy = new T.ShaderMaterial({
    uniforms: { uTime: clock },
    vertexShader: `varying vec2 vUv; varying vec3 vP;
      void main(){vUv=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; varying vec3 vP;
      void main(){float p=pow(max(0.,sin(vUv.x*24.-uTime*3.8+vP.y*.8)),12.);
        vec3 green=vec3(.24,1.,.055);gl_FragColor=vec4(green*(1.0+p*3.5),1.);}`,
    toneMapped: false,
  });

  // Braided trunk: thick central heartwood and interlaced secondary buttresses.
  const heartwood = curve([
    [0, -2.9, 0],
    [-0.14, -1.4, 0.08],
    [0.16, 0.2, -0.12],
    [-0.1, 1.5, 0],
    [0.25, 3, 0.05],
    [0, 4.8, 0],
  ]);
  wood.push(tube(heartwood, 0.76, 65, 16, 0.1));
  surfaceVeins(heartwood, 0.76, 9, 0.1);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const points = [];
    for (let j = 0; j < 12; j++) {
      const t = j / 11,
        r = 0.5 * (1 - t * 0.55);
      points.push([
        Math.cos(a + t * 3.7) * r,
        -2.85 + t * 6.45,
        Math.sin(a + t * 3.7) * r,
      ]);
    }
    const path = curve(points);
    wood.push(tube(path, 0.23, 54, 9, 0.22));
    surfaceVeins(path, 0.23, 3, 0.22);
    for (let k = 0; k < 3; k++) {
      const bright = points.map((p, j) => [
        p[0] + Math.cos(a + k * 1.8) * 0.22 * (1 - j / 15),
        p[1],
        p[2] + Math.sin(a + k * 1.8) * 0.22 * (1 - j / 15),
      ]);
      veins.push(tube(curve(bright), 0.009 + k * 0.002, 65, 4, 0.5, false));
    }
  }

  // Roots radiate around the entire trunk in X/Z; high and low detail share paths.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2,
      reach = 3.5 + random() * 2.3;
    const points = [
      [Math.cos(a + 0.7) * 0.4, -2.0, Math.sin(a + 0.7) * 0.4],
      [Math.cos(a + 0.35) * 1.0, -2.95, Math.sin(a + 0.35) * 1.0],
      [
        Math.cos(a) * reach * 0.5,
        -3.6 + random() * 0.25,
        Math.sin(a) * reach * 0.44,
      ],
      [
        Math.cos(a - 0.16) * reach,
        -4.05 - random() * 0.25,
        Math.sin(a - 0.16) * reach * 0.8,
      ],
    ];
    const path = curve(points),
      radius = 0.18 + random() * 0.17;
    rootsHigh.push(tube(path, radius, 42, 9));
    rootsLow.push(tube(path, radius, 18, 5));
    surfaceVeins(path, radius, 3);
    for (let k = 0; k < 2; k++) {
      const glowing = points.map((p) => [
        p[0] + (k ? -0.06 : 0.06),
        p[1] + radius * 0.65,
        p[2],
      ]);
      veins.push(tube(curve(glowing), 0.013, 40, 4, 0.12, false));
      const start = path.getPoint(0.52 + k * 0.12),
        tip = path.getPoint(0.94);
      const fork = curve([
        start.toArray(),
        [tip.x * 0.85, -3.85, tip.z + (k ? -0.35 : 0.35)],
        [tip.x + Math.cos(a + k) * 0.65, -4.35, tip.z + Math.sin(a + k) * 0.9],
      ]);
      rootsHigh.push(tube(fork, 0.075, 20, 6));
      rootsLow.push(tube(fork, 0.065, 10, 4));
    }
  }

  // Dense three-dimensional crown, with nested primary/secondary/twig branches.
  for (let i = 0; i < 28; i++) {
    const a = i * 2.39996,
      reach = 2.9 + random() * 2.5;
    const top = 2.35 + random() * 3.35,
      startY = 0.05 + random() * 2.5;
    const points = [
      [0, startY, 0],
      [Math.cos(a + 0.3) * 0.9, startY + 0.65, Math.sin(a + 0.3) * 0.6],
      [Math.cos(a) * reach * 0.65, top - 0.35, Math.sin(a) * reach * 0.48],
      [Math.cos(a) * reach, top, Math.sin(a) * reach * 0.68],
    ];
    const path = curve(points),
      radius = 0.19 + random() * 0.15;
    wood.push(tube(path, radius, 36, 8));
    surfaceVeins(path, radius, 3);
    veins.push(
      tube(
        curve(points.map((p) => [p[0], p[1] + radius * 0.64, p[2] + 0.06])),
        0.012,
        42,
        4,
        0.15,
        false,
      ),
    );
    for (let j = 0; j < 5; j++) {
      const t = 0.4 + j * 0.12,
        origin = path.getPoint(t),
        twist = a + (j % 2 ? -1 : 1) * (0.35 + random() * 0.5);
      const length = 0.65 + random() * 1.05;
      const end = origin
        .clone()
        .add(
          new T.Vector3(
            Math.cos(twist) * length,
            0.2 + random() * 0.65,
            Math.sin(twist) * length * 0.8,
          ),
        );
      const twig = curve([
        origin.toArray(),
        origin
          .clone()
          .lerp(end, 0.45)
          .add(new T.Vector3(0, 0.18, 0))
          .toArray(),
        end.toArray(),
      ]);
      wood.push(tube(twig, 0.065 + (1 - t) * 0.075, 18, 6));
      surfaceVeins(twig, 0.065 + (1 - t) * 0.075, 1);
      veins.push(tube(twig, 0.007, 20, 3, 0.2, false));
      leafCenters.push(end);
      for (let k = 0; k < 3; k++) {
        const base = twig.getPoint(0.42 + k * 0.23);
        const leafEnd = base
          .clone()
          .add(
            new T.Vector3(
              (random() - 0.5) * 0.7,
              0.25 + random() * 0.35,
              (random() - 0.5) * 0.7,
            ),
          );
        wood.push(
          tube(
            curve([
              base.toArray(),
              base.clone().lerp(leafEnd, 0.5).toArray(),
              leafEnd.toArray(),
            ]),
            0.025,
            8,
            4,
          ),
        );
        leafCenters.push(leafEnd);
      }
    }
  }

  function mergedMesh(parts, material) {
    const merged = mergeGeometries(parts);
    parts.forEach((g) => g.dispose());
    const mesh = new T.Mesh(merged, material);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return mesh;
  }
  group.add(mergedMesh(wood, bark));
  const rootLod = new T.LOD();
  rootLod.addLevel(mergedMesh(rootsHigh, bark), 0);
  rootLod.addLevel(mergedMesh(rootsLow, bark), 25);
  group.add(rootLod, mergedMesh(veins, energy));

  // Instanced folded leaf meshes: thousands of leaves in one draw call.
  const leafGeometry = new T.SphereGeometry(1, 6, 4);
  leafGeometry.scale(0.055, 0.125, 0.012);
  const leafMaterial = new T.MeshStandardMaterial({
    color: 0x284b1c,
    roughness: 0.68,
    metalness: 0.08,
    emissive: 0x061803,
    emissiveIntensity: 0.08,
    side: T.DoubleSide,
  });
  leafMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = clock;
    shader.uniforms.uWind = wind;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uTime; uniform vec2 uWind;",
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed.x += sin(uTime*.8+instanceMatrix[3].x*3.+instanceMatrix[3].z)*.025 + uWind.x*.018;
        transformed.z += cos(uTime*.65+instanceMatrix[3].y*4.)*.018 + uWind.y*.012;`,
      );
  };
  const perCluster = compact ? 5 : 11;
  const leaves = new T.InstancedMesh(
    leafGeometry,
    leafMaterial,
    leafCenters.length * perCluster,
  );
  const dummy = new T.Object3D();
  let leafIndex = 0;
  leafCenters.forEach((center) => {
    for (let k = 0; k < perCluster; k++) {
      dummy.position
        .copy(center)
        .add(
          new T.Vector3(
            (random() - 0.5) * 0.8,
            (random() - 0.5) * 0.5,
            (random() - 0.5) * 0.8,
          ),
        );
      dummy.rotation.set(
        random() * Math.PI,
        random() * Math.PI,
        random() * Math.PI,
      );
      dummy.scale.setScalar(0.65 + random() * 0.85);
      dummy.updateMatrix();
      leaves.setMatrixAt(leafIndex, dummy.matrix);
      leaves.setColorAt(
        leafIndex++,
        new T.Color().setHSL(0.24 + random() * 0.1, 0.6, 0.2 + random() * 0.22),
      );
    }
  });
  leaves.instanceMatrix.needsUpdate = true;
  leaves.computeBoundingSphere();
  group.add(leaves);
  return { group, clock, wind, rootLod };
}
