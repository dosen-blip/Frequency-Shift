import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const output = (path) => fileURLToPath(new URL(`../out/${path}`, import.meta.url));
const outputRoot = fileURLToPath(new URL("../out/", import.meta.url));

test("exports the public routes and GitHub Pages control files", async () => {
  const expectedFiles = [
    "index.html",
    "events/frequency-shift-014/index.html",
    "events/frequency-fest/index.html",
    "events/world-cup/index.html",
    "events/frequency-shift-005/index.html",
    "events/solstice/index.html",
    "events/dopamine/index.html",
    "events/frequency-shift-004/index.html",
    "events/frequency-shift-003/index.html",
    "events/frequency-shift-002/index.html",
    "events/frequency-shift-001/index.html",
    "archive/index.html",
    "archive/techno-special/index.html",
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
  assert.match(archive, /href="\/Frequency-Shift\/archive\/techno-special\/"/);
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
  assert.match(sitemap, /\/archive\/techno-special\//);
});

test("exports playable Techno Special videos with still fallbacks and no autoplay", async () => {
  const html = await readFile(output("archive/techno-special/index.html"), "utf8");
  const videos = html.match(/<video\b[^>]*>/g) ?? [];
  assert.equal(videos.length, 6);
  for (const video of videos) {
    assert.match(video, /controls/);
    assert.match(video, /preload="none"/);
    assert.match(video, /playsinline/i);
    assert.match(video, /poster="\/Frequency-Shift\/media\/archive\/techno-special\//);
    assert.doesNotMatch(video, /autoplay/i);
  }
  for (let index = 1; index <= 6; index += 1) {
    const stem = `media/archive/techno-special/techno-special-clip-${String(index).padStart(2, "0")}-1080p`;
    assert.ok(html.includes(`src="/Frequency-Shift/${stem}.mp4"`));
    await access(output(`${stem}.mp4`));
    await access(output(`${stem}-poster.webp`));
  }
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

  assert.ok(Buffer.byteLength(homepage) < 14_500, "homepage HTML budget");
  assert.ok(Buffer.byteLength(runtime) < 15_000, "static runtime budget");
  assert.match(runtime, /prepareNeonCursor/);
  assert.doesNotMatch(homepage, /assets\/(?:framework|index)-[^"']+\.js/);
  assert.match(runtime, /mobile-neon-enabled/);
  assert.match(runtime, /is-mobile-neon-active/);
  assert.match(runtime, /prepareNeonProximity/);
  assert.match(runtime, /is-proximity-flicker/);
  assert.match(runtime, /neonLockup\.classList\.add\("is-neon-settled"\)/);
  assert.match(runtime, /}, 2600\)/);
});

test("excludes the local glass lab from Pages artifacts", async () => {
  const files = await readdir(outputRoot, { recursive: true });
  assert.doesNotMatch(
    files.join("\n"),
    /(?:glass-demo|glass-lab|realtime-glass|true-glass)/i,
  );

  const bundledText = (
    await Promise.all(
      files
        .filter((path) => /\.(?:js|css)$/.test(path))
        .map((path) => readFile(output(path), "utf8")),
    )
  ).join("\n");
  assert.doesNotMatch(bundledText, /True glass system|realtimeGlassLens|glass-lab-root/);
});

test("keeps legacy-compatible mobile media queries", async () => {
  const assetFiles = await readdir(output("assets"));
  const cssFile = assetFiles.find((path) => path.endsWith(".css"));
  assert.ok(cssFile);
  const css = await readFile(output(`assets/${cssFile}`), "utf8");
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.doesNotMatch(css, /@media\s*\(width\s*<=\s*760px\)/);
});
