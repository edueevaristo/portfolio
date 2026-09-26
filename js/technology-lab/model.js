import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { domains } from "./data.js";

// A miniature engineering installation, made from manufactured forms and PBR
// materials. The six modules share a real board, not floating text billboards.
export function buildLab() {
  const group = new T.Group();
  const graphite = new T.MeshStandardMaterial({
    color: 0x171c1c,
    metalness: 0.8,
    roughness: 0.32,
  });
  const ceramic = new T.MeshStandardMaterial({
    color: 0x07100b,
    metalness: 0.45,
    roughness: 0.32,
  });
  const aluminum = new T.MeshStandardMaterial({
    color: 0x76877f,
    metalness: 0.92,
    roughness: 0.25,
  });
  const light = new T.MeshStandardMaterial({
    color: 0x9dff6a,
    emissive: 0x74ff39,
    emissiveIntensity: 1.3,
    roughness: 0.3,
  });
  const glass = new T.MeshPhysicalMaterial({
    color: 0x6a9b7b,
    metalness: 0.1,
    roughness: 0.13,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: T.DoubleSide,
  });
  const geometries = new Map();
  function box(parent, size, position, material = graphite, radius = 0.06) {
    const key = [...size, radius].join(",");
    if (!geometries.has(key))
      geometries.set(key, new RoundedBoxGeometry(...size, 2, radius));
    const mesh = new T.Mesh(geometries.get(key), material);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }
  function cylinder(parent, radius, height, position, material = graphite) {
    const mesh = new T.Mesh(
      new T.CylinderGeometry(radius, radius, height, 40),
      material,
    );
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  }
  function line(points, material) {
    return new T.Line(
      new T.BufferGeometry().setFromPoints(
        points.map((p) => new T.Vector3(...p)),
      ),
      material,
    );
  }
  box(group, [7.85, 0.18, 7.65], [0, -0.62, 0], graphite, 0.16);
  box(group, [7.45, 0.09, 7.25], [0, -0.48, 0], ceramic, 0.08);
  const etched = new T.LineBasicMaterial({
    color: 0x20332b,
    transparent: true,
    opacity: 0.5,
  });
  for (let i = -7; i <= 7; i++) {
    const p = i * 0.48;
    group.add(
      line(
        [
          [p, -0.427, -3.45],
          [p, -0.427, 3.45],
        ],
        etched,
      ),
    );
    group.add(
      line(
        [
          [-3.5, -0.427, p],
          [3.5, -0.427, p],
        ],
        etched,
      ),
    );
  }
  for (const x of [-3.65, 3.65])
    for (const z of [-3.55, 3.55]) {
      cylinder(group, 0.07, 0.02, [x, -0.515, z], aluminum);
      box(group, [0.075, 0.023, 0.014], [x, -0.5, z], ceramic, 0.002);
    }
  const core = new T.Group();
  group.add(core);
  box(core, [1.75, 0.28, 1.75], [0, -0.16, 0], graphite);
  box(core, [1.57, 0.06, 1.57], [0, 0.03, 0], light, 0.035);
  box(core, [1.55, 0.2, 1.55], [0, 0.18, 0], aluminum);
  box(core, [1.42, 0.08, 1.42], [0, 0.36, 0], ceramic);
  box(core, [1.48, 0.2, 1.48], [0, 0.69, 0], glass);
  // Physical contact pins around the CPU, instanced in a single draw call.
  const pins = new T.InstancedMesh(
    new T.BoxGeometry(0.09, 0.07, 0.27),
    aluminum,
    48,
  );
  const dummy = new T.Object3D();
  let pin = 0;
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < 12; i++) {
      const a = (side * Math.PI) / 2,
        offset = (i - 5.5) * 0.125;
      dummy.position.set(
        Math.sin(a) * 0.98 + Math.cos(a) * offset,
        -0.18,
        Math.cos(a) * 0.98 - Math.sin(a) * offset,
      );
      dummy.rotation.y = a;
      dummy.updateMatrix();
      pins.setMatrixAt(pin++, dummy.matrix);
    }
  core.add(pins);
  const symbols = new T.Group();
  symbols.position.y = 0.845;
  core.add(symbols);
  const markMaterial = new T.LineBasicMaterial({ color: 0xcaffb3 });
  for (const direction of [-1, 1])
    symbols.add(
      line(
        [
          [direction * 0.22, 0, -0.2],
          [direction * 0.44, 0, 0],
          [direction * 0.22, 0, 0.2],
        ],
        markMaterial,
      ),
    );
  symbols.add(
    line(
      [
        [0.06, 0, -0.24],
        [-0.06, 0, 0.24],
      ],
      markMaterial,
    ),
  );
  const modules = domains.map((domain, index) => {
    const module = new T.Group();
    module.position.set(...domain.position);
    group.add(module);
    if (typeof document !== "undefined") {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    const labelContext = labelCanvas.getContext("2d");
    labelContext.fillStyle = "#08110b";
    labelContext.beginPath();
    labelContext.roundRect(3, 3, 506, 122, 16);
    labelContext.fill();
    labelContext.strokeStyle = "#597e54";
    labelContext.lineWidth = 3;
    labelContext.stroke();
    labelContext.textBaseline = "middle";
    labelContext.textAlign = "center";
    labelContext.fillStyle = "#d7fac4";
    labelContext.font = "600 48px monospace";
    labelContext.fillText(domain.highlight, 256, 67, 468);
    const labelTexture = new T.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = T.SRGBColorSpace;
    labelTexture.anisotropy = 4;
    const plaque = new T.Mesh(
      new T.PlaneGeometry(1.38, 0.35),
      new T.MeshBasicMaterial({ map: labelTexture, transparent: true }),
    );
    plaque.rotation.x = -Math.PI / 2;
    plaque.position.set(0, -0.415, 0.78);
    module.add(plaque);
    }
    const edge = light.clone();
    edge.emissiveIntensity = index === 0 ? 1.8 : 0.05;
    edge.color.set(index === 0 ? 0x9dff6a : 0x33463b);
    box(module, [1.37, 0.12, 1.17], [0, -0.27, 0], edge);
    box(module, [1.32, 0.18, 1.12], [0, -0.16, 0], graphite);
    box(module, [1.15, 0.035, 0.95], [0, -0.048, 0], ceramic);
    if (index === 0) {
      const screen = box(
        module,
        [1.04, 0.77, 0.07],
        [0, 0.39, -0.16],
        aluminum,
        0.035,
      );
      screen.rotation.x = -0.12;
      box(module, [0.96, 0.67, 0.05], [0, 0.4, -0.106], ceramic, 0.025);
      box(module, [0.82, 0.055, 0.025], [0, 0.62, -0.075], edge, 0.008);
      box(module, [0.27, 0.33, 0.026], [-0.24, 0.33, -0.07], glass, 0.025);
      for (let i = 0; i < 3; i++)
        box(
          module,
          [0.4 - i * 0.05, 0.035, 0.026],
          [0.15, 0.44 - i * 0.1, -0.065],
          aluminum,
          0.006,
        );
      box(module, [0.83, 0.028, 0.33], [0, 0.01, 0.23], graphite, 0.025);
    } else if (index === 1 || index === 5) {
      for (let i = 0; i < 3; i++) {
        box(
          module,
          [index === 1 ? 0.88 : 0.7, 0.18, 0.65],
          [0, 0.12 + i * 0.25, 0],
          index === 5 && i === 2 ? glass : graphite,
          0.025,
        );
        box(
          module,
          [0.44, 0.024, 0.018],
          [-0.12, 0.12 + i * 0.25, 0.335],
          aluminum,
          0.005,
        );
        box(
          module,
          [0.055, 0.055, 0.025],
          [0.3, 0.12 + i * 0.25, 0.34],
          edge,
          0.012,
        );
      }
    } else if (index === 2) {
      for (let i = 0; i < 4; i++) {
        cylinder(
          module,
          0.38,
          0.12,
          [0, 0.04 + i * 0.17, 0],
          i === 3 ? aluminum : graphite,
        );
        cylinder(module, 0.385, 0.018, [0, 0.105 + i * 0.17, 0], edge);
      }
    } else if (index === 3) {
      box(module, [0.42, 0.33, 0.42], [0, 0.14, 0], glass);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        box(
          module,
          [0.22, 0.13, 0.22],
          [Math.cos(a) * 0.43, 0.04, Math.sin(a) * 0.36],
          aluminum,
          0.025,
        );
        const link = line(
          [
            [0, 0.055, 0],
            [Math.cos(a) * 0.43, 0.055, Math.sin(a) * 0.36],
          ],
          new T.LineBasicMaterial({ color: 0x9dff6a }),
        );
        module.add(link);
      }
      box(module, [0.26, 0.025, 0.26], [0, 0.32, 0], edge);
    } else {
      for (let i = 0; i < 3; i++) {
        const pane = box(
          module,
          [0.68, 0.55, 0.045],
          [(i - 1) * 0.16, 0.34 + i * 0.05, (i - 1) * 0.18],
          i === 1 ? glass : graphite,
          0.04,
        );
        pane.rotation.y = -0.22;
        box(
          module,
          [0.25, 0.025, 0.055],
          [(i - 1) * 0.16, 0.48 + i * 0.05, (i - 1) * 0.18 + 0.045],
          edge,
          0.006,
        );
      }
    }
    const pick = box(
      module,
      [1.4, 1.25, 1.2],
      [0, 0.35, 0],
      new T.MeshBasicMaterial({ visible: false }),
    );
    pick.userData.domain = index;
    return { group: module, edge, pick };
  });
  return { group, core, modules, light };
}
