import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  domains,
  technologyNames,
} from "../js/technology-lab/data.js";
import { buildLab } from "../js/technology-lab/model.js";

test("six domains preserve the complete set of 25 technologies without duplicates", () => {
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
  assert.equal(domains.length, 6);
  assert.equal(new Set(technologyNames).size, 25);
  assert.deepEqual([...technologyNames].sort(), expected.sort());
  domains.forEach((domain) =>
    assert.ok(domain.position.every(Number.isFinite)),
  );
  domains.forEach((domain) => assert.ok(domain.highlight.length > 5));
});

test("manufactured 3D model has six selectable modules and shared geometry", () => {
  const model = buildLab();
  assert.equal(model.modules.length, 6);
  const geometries = new Set(),
    materials = new Set();
  let meshes = 0,
    instanced = 0;
  model.modules.forEach((module, index) => {
    assert.equal(module.pick.userData.domain, index);
    assert.ok(module.group.children.length > 3);
  });
  model.group.traverse((object) => {
    if (object.isMesh) meshes++;
    if (object.isInstancedMesh) instanced += object.count;
    if (object.geometry) {
      geometries.add(object.geometry);
      assert.ok(
        object.geometry.attributes.position.array.every(Number.isFinite),
      );
    }
    if (object.material) materials.add(object.material);
  });
  assert.equal(instanced, 48);
  assert.ok(
    geometries.size < meshes,
    "repeated components must reuse geometry",
  );
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
});

test("page contains accessible tabs, fallback and no tree imagery or runtime", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
  assert.equal([...html.matchAll(/role="tab"/g)].length, 6);
  assert.ok(html.includes('role="tabpanel"'));
  assert.ok(html.includes('class="lab-blueprint"'));
  assert.ok(html.includes("Vue.js · React"));
  assert.ok(html.includes("PHP · Laravel"));
  assert.doesNotMatch(html, /CONTEÚDO SOBRE|css\/yggdrasil.css/);
  assert.doesNotMatch(
    html,
    /knowledge-tree|yggdrasil-isolated|tree-energy|Uma árvore/,
  );
  assert.doesNotMatch(main, /initKnowledgeTree|mountTreeEnergy/);
});
