import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const output = (path) => fileURLToPath(new URL(`../out/${path}`, import.meta.url));
const outputRoot = fileURLToPath(new URL("../out/", import.meta.url));

test("exports the public routes and GitHub Pages control files", async () => {
  const expectedFiles = [
    "index.html",
    "archive/index.html",
    "archive/frequency-fest/index.html",
    "archive/frequency-shift-005/index.html",
    "archive/world-cup/index.html",
    "archive/solstice/index.html",
    "archive/dopamine/index.html",
    "404.html",
    ".nojekyll",
    "static-pages.js",
    "sitemap.xml",
  ];

  await Promise.all(expectedFiles.map((path) => access(output(path))));
});

test("prefixes internal routes and assets with the project site path", async () => {
  const homepage = await readFile(output("index.html"), "utf8");
  const archive = await readFile(output("archive/index.html"), "utf8");

  assert.match(homepage, /(?:href|src)="\/Frequency-Shift\/assets\//);
  assert.match(homepage, /(?:href|src)="\/Frequency-Shift\/media\//);
  assert.match(homepage, /href="\/Frequency-Shift\/archive\/"/);
  assert.match(archive, /href="\/Frequency-Shift\/archive\/frequency-fest\/"/);
  assert.match(homepage, /src="\/Frequency-Shift\/static-pages\.js"/);
  assert.match(homepage, /data-static-pages-runtime/);
  assert.doesNotMatch(homepage, /data-static-pages-navigation/);
  assert.doesNotMatch(homepage, /\/Frequency-Shift\/>/);
  assert.doesNotMatch(archive, /\/Frequency-Shift\/>/);
  assert.doesNotMatch(homepage, /(?:href|src)="\/(?:assets|media)\//);
  assert.doesNotMatch(homepage, /import\("\/assets\//);
  assert.doesNotMatch(homepage, /\/Frequency-Shift\/Frequency-Shift\//);
  assert.doesNotMatch(archive, /href="\/archive(?:\/|\")/);
});

test("publishes a sitemap using the final GitHub Pages URLs", async () => {
  const sitemap = await readFile(output("sitemap.xml"), "utf8");
  assert.match(
    sitemap,
    /https:\/\/dosen-blip\.github\.io\/Frequency-Shift\/archive\/frequency-fest\//,
  );
  assert.doesNotMatch(sitemap, /<loc>[^<]*[^\/]<\/loc>/);
  assert.doesNotMatch(sitemap, /frequency-shift\.local/);
});

test("keeps every exported document structurally intact", async () => {
  const htmlFiles = (await readdir(outputRoot, { recursive: true }))
    .filter((path) => path.endsWith(".html"));

  assert.ok(htmlFiles.length >= 16);
  for (const path of htmlFiles) {
    const html = await readFile(output(path), "utf8");
    assert.doesNotMatch(html, /\/Frequency-Shift\/>/, path);
    assert.doesNotMatch(html, /rel="modulepreload"/, path);
    assert.doesNotMatch(html, /__VINEXT_/, path);
    assert.doesNotMatch(html, /id="_R_"/, path);
    assert.ok(html.trim().endsWith("</html>"), path);
  }
});

test("does not preload archive photography before it is needed", async () => {
  const archive = await readFile(output("archive/index.html"), "utf8");
  const featurePreloads = (archive.match(
    /<link[^>]+rel="preload"[^>]+frequency-fest[^>]+>/g,
  ) ?? []);

  assert.equal(featurePreloads.length, 0);
});

test("keeps the public boot path lightweight", async () => {
  const homepage = await readFile(output("index.html"), "utf8");
  const runtime = await readFile(output("static-pages.js"), "utf8");

  assert.ok(Buffer.byteLength(homepage) < 12_000, "homepage HTML budget");
  assert.ok(Buffer.byteLength(runtime) < 7_000, "static runtime budget");
  assert.doesNotMatch(homepage, /assets\/(?:framework|index)-[^"']+\.js/);
});

test("keeps legacy-compatible mobile media queries", async () => {
  const assetFiles = await readdir(output("assets"));
  const cssFile = assetFiles.find((path) => path.endsWith(".css"));
  assert.ok(cssFile);
  const css = await readFile(output(`assets/${cssFile}`), "utf8");
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.doesNotMatch(css, /@media\s*\(width\s*<=\s*760px\)/);
});
