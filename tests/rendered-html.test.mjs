import assert from "node:assert/strict";
import test from "node:test";

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
    ["/archive/frequency-shift-001", /Photography placeholders \/ final edit pending/],
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
    "/archive/frequency-shift-001",
    "/archive/frequency-shift-002",
    "/archive/frequency-shift-003",
    "/archive/frequency-shift-004",
    "/archive/frequency-shift-005",
    "/archive/world-cup",
    "/archive/solstice",
    "/archive/dopamine",
  ];

  for (const path of archiveRoutes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /12(?:<!-- -->)? image slots/i, path);
  }
});
