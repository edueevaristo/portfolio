import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const expected = [
  "top",
  "about",
  "work",
  "capabilities",
  "experience",
  "contact",
];
const fragments = (markup) =>
  [...markup.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

test("menu and footer follow the page section order", () => {
  const navigation = html.match(
    /<nav aria-label="Navegação principal">([\s\S]*?)<\/nav>/,
  )[1];
  const footer = html.match(
    /<div class="footer-navigation">([\s\S]*?)<\/div>/,
  )[1];
  assert.deepEqual(fragments(navigation), expected);
  assert.deepEqual(fragments(footer), expected);
  const offsets = expected.map((id) => html.indexOf(`id="${id}"`));
  assert.deepEqual(
    offsets,
    [...offsets].sort((a, b) => a - b),
  );
});

test("all internal anchor destinations exist and IDs are unique", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  fragments(html).forEach((id) =>
    assert.ok(ids.includes(id), `Missing destination: ${id}`),
  );
});
