import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const builtArchiveRoot = fileURLToPath(
  new URL("../dist/client/media/archive/", import.meta.url),
);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Frequency Shift homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Frequency Shift — Ottawa, Canada<\/title>/i);
  assert.match(html, /Underground dance music rituals/);
  assert.match(html, /Next Frequency Shift/);
  assert.match(html, /hero-crowd\.webp/);
  assert.match(html, /In case you/);
  assert.match(html, /Skip to content/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders the primary route scaffold", async () => {
  const routes = [
    ["/events", /Upcoming Frequency Shift events/],
    ["/events/next-frequency-shift", /Draft content record/],
    ["/archive", /Frequency Shift 001/],
    ["/archive/frequency-shift-001", /frequency-shift-001-01\.jpg/],
    ["/about", /Why Frequency Shift exists/],
    ["/contact", /Contact Frequency Shift/],
    ["/privacy", /<title>Privacy — Frequency Shift<\/title>/i],
    ["/terms", /<title>Terms — Frequency Shift<\/title>/i],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }
});

test("renders every requested archive slot", async () => {
  const archiveRoutes = [
    ["/archive/frequency-fest", /15(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-001", /20(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-002", /11(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-003", /16(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-004", /12(?:<!-- -->)? image slots/i],
    ["/archive/frequency-shift-005", /12(?:<!-- -->)? image slots/i],
    ["/archive/world-cup", /10(?:<!-- -->)? photographs/i],
    ["/archive/solstice", /12(?:<!-- -->)? image slots/i],
    ["/archive/dopamine", /20(?:<!-- -->)? photographs/i],
  ];

  for (const [path, expected] of archiveRoutes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }
});

test("uses event photography for completed archive cards and galleries", async () => {
  const indexResponse = await render("/archive");
  const indexHtml = await indexResponse.text();
  assert.match(indexHtml, /archive-card archive-card--featured/);
  assert.match(indexHtml, /frequency-fest-01\.jpg/);
  assert.ok(
    indexHtml.indexOf("Frequency Fest Vol. 1") < indexHtml.indexOf("Frequency Shift 001"),
  );
  assert.match(indexHtml, /frequency-shift-001-01\.jpg/);
  assert.match(indexHtml, /world-cup-01\.jpg/);
  assert.match(indexHtml, /dopamine-01\.jpg/);

  const photoArchive = await render("/archive/frequency-shift-003");
  const photoHtml = await photoArchive.text();
  assert.match(photoHtml, /frequency-shift-003-16\.jpg/);
  assert.doesNotMatch(photoHtml, /Photography placeholders \/ final edit pending/);

  const pendingArchive = await render("/archive/solstice");
  assert.match(
    await pendingArchive.text(),
    /Photography placeholders \/ final edit pending/,
  );
});

test("ships every declared archive photograph as a valid JPEG asset", async () => {
  const expectedCounts = {
    "frequency-fest": 15,
    "frequency-shift-001": 20,
    "frequency-shift-002": 11,
    "frequency-shift-003": 16,
    "world-cup": 10,
    dopamine: 20,
  };

  for (const [slug, count] of Object.entries(expectedCounts)) {
    const directory = `${builtArchiveRoot}${slug}`;
    const filenames = (await readdir(directory)).toSorted();
    assert.equal(filenames.length, count, slug);

    for (let index = 1; index <= count; index += 1) {
      const filename = `${slug}-${String(index).padStart(2, "0")}.jpg`;
      assert.equal(filenames[index - 1], filename, `${slug} sequence`);
      const image = await readFile(`${directory}/${filename}`);
      assert.ok(image.length > 3, filename);
      assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], filename);
    }
  }
});
