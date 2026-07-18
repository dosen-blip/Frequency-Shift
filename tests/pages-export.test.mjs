import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const output = (path) => fileURLToPath(new URL(`../out/${path}`, import.meta.url));

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
  assert.match(homepage, /href="\/Frequency-Shift\/archive"/);
  assert.match(homepage, /import\("\/Frequency-Shift\/assets\//);
  assert.match(archive, /href="\/Frequency-Shift\/archive\/frequency-fest"/);
  assert.match(homepage, /data-static-pages-navigation/);
  assert.doesNotMatch(homepage, /(?:href|src)="\/(?:assets|media)\//);
  assert.doesNotMatch(homepage, /import\("\/assets\//);
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
