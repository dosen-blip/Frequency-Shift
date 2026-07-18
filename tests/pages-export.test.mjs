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
  assert.match(homepage, /import\("\/Frequency-Shift\/assets\//);
  assert.match(archive, /href="\/Frequency-Shift\/archive\/frequency-fest\/"/);
  assert.match(homepage, /data-static-pages-navigation/);
  assert.match(homepage, /event\.stopImmediatePropagation\(\)/);
  assert.doesNotMatch(homepage, /event\.preventDefault\(\)/);
  assert.doesNotMatch(homepage, /window\.location\.href\s*=/);
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
    /https:\/\/dosen-blip\.github\.io\/Frequency-Shift\/archive\/frequency-fest/,
  );
  assert.doesNotMatch(sitemap, /frequency-shift\.local/);
});

test("keeps every exported document structurally intact", async () => {
  const htmlFiles = (await readdir(outputRoot, { recursive: true }))
    .filter((path) => path.endsWith(".html"));

  assert.ok(htmlFiles.length >= 16);
  for (const path of htmlFiles) {
    const html = await readFile(output(path), "utf8");
    assert.doesNotMatch(html, /\/Frequency-Shift\/>/, path);
  }
});

test("preloads only the visible Frequency Fest feature image", async () => {
  const archive = await readFile(output("archive/index.html"), "utf8");
  const featurePreloads = (archive.match(
    /<link[^>]+rel="preload"[^>]+frequency-fest[^>]+>/g,
  ) ?? []);

  assert.equal(featurePreloads.length, 1);
  assert.match(featurePreloads[0], /frequency-fest-01\.jpg/);
});

test("builds lazy client chunks against the Pages base path", async () => {
  const assetFiles = await readdir(output("assets"));
  const entryCandidates = assetFiles.filter((path) => /^index-.*\.js$/.test(path));
  let clientEntry = "";

  for (const path of entryCandidates) {
    const source = await readFile(output(`assets/${path}`), "utf8");
    if (source.includes("__vite__mapDeps")) {
      clientEntry = source;
      break;
    }
  }

  assert.ok(clientEntry);
  assert.match(clientEntry, /Frequency-Shift/);
  assert.doesNotMatch(clientEntry, /return`\/`\+e/);
});
