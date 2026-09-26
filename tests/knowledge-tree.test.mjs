import test from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { buildTree } from "../js/knowledge-tree/geometry.js";
import { technologies } from "../js/knowledge-tree/data.js";

test("requested technologies have unique IDs and explicit editable copy", () => {
  const expected = [
    "MySQL",
    "SQL",
    "PostgreSQL",
    "GraphQL",
    "REST",
    "Docker",
    "Git",
    "API",
    "PHP",
    "Laravel",
    "JavaScript",
    "Vue.js",
    "React",
    "Tailwind CSS",
    "Bootstrap",
    "GSAP",
    "Three.js",
    "Grafana",
    "Hubs",
    "ERPs",
    "Figma",
    "AWS",
    "WordPress",
    "Marketplaces",
    "NF-e / SEFAZ",
  ];
  assert.deepEqual(
    technologies.map((t) => t.name),
    expected,
  );
  assert.equal(new Set(technologies.map((t) => t.id)).size, 25);
  technologies.forEach((t) => {
    assert.equal(technologies[t.id], t);
    assert.ok(t.position.every(Number.isFinite));
    assert.match(t.content, /^\[CONTEÚDO SOBRE .+\]$/);
  });
  assert.ok(technologies[0].position[0] < technologies[1].position[0]);
  assert.ok(technologies[1].position[0] < technologies[2].position[0]);
  assert.ok(technologies[21].position[1] > technologies[7].position[1]);
});

for (const compact of [false, true]) {
  test(`volumetric geometry, outward normals, instancing and root LOD (${compact ? "compact" : "desktop"})`, () => {
    const tree = buildTree(compact);
    const bark = tree.group.children[0].geometry;
    const points = bark.getAttribute("position"),
      normals = bark.getAttribute("normal");
    // Regression: reversed winding made the trunk look hollow/transparent.
    const center = new Vector3();
    for (let i = 0; i < 16; i++)
      center.add(new Vector3().fromBufferAttribute(points, i));
    center.divideScalar(16);
    for (let i = 0; i < 16; i++) {
      const radial = new Vector3()
        .fromBufferAttribute(points, i)
        .sub(center)
        .normalize();
      assert.ok(
        radial.dot(new Vector3().fromBufferAttribute(normals, i)) > 0.7,
      );
    }
    bark.computeBoundingBox();
    const size = bark.boundingBox.getSize(new Vector3());
    assert.ok(
      size.x > 8 && size.y > 8 && size.z > 4,
      "tree must have real depth",
    );
    const lod = tree.rootLod;
    assert.equal(lod.levels.length, 2);
    assert.ok(
      lod.levels[0].object.geometry.attributes.position.count >
        lod.levels[1].object.geometry.attributes.position.count,
    );
    const leaves = tree.group.children.find((o) => o.isInstancedMesh);
    assert.ok(leaves.count > 2000);
    assert.ok(leaves.frustumCulled);
    const geometries = new Set(),
      materials = new Set();
    tree.group.traverse((o) => {
      if (o.geometry) {
        geometries.add(o.geometry);
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
      }
      if (o.material) materials.add(o.material);
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  });
}
