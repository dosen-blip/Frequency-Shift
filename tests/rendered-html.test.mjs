import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const builtArchiveRoot = fileURLToPath(
  new URL("../dist/client/media/archive/", import.meta.url),
);
const builtClientRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const globalStylesPath = fileURLToPath(
  new URL("../app/globals.css", import.meta.url),
);
const siteMotionPath = fileURLToPath(
  new URL("../components/site-motion.tsx", import.meta.url),
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
  assert.match(html, /For the love of house\./);
  assert.match(html, /The Experiment/);
  assert.match(html, /frequency-shift-wordmark-neon\.svg/);
  assert.match(html, /frequency-shift-wordmark-neon-mobile\.svg/);
  assert.match(
    html,
    /<img class="neon-wordmark__glow neon-wordmark__glow--logo" src="\/media\/brand\/fs-icon-neon-glow\.png"/,
  );
  assert.match(
    html,
    /<object class="neon-wordmark__asset" data="\/media\/brand\/fs-icon-neon\.svg"/,
  );
  assert.match(
    html,
    /frequency-shift-wordmark-neon-glow\.png/,
  );
  assert.match(
    html,
    /frequency-shift-wordmark-neon-mobile-glow\.png/,
  );
  assert.doesNotMatch(html, /neon-wordmark__layer--(?:ambient|bloom)/);
  assert.match(html, /event-tech\.webp/);
  assert.match(html, /In case you/);
  assert.match(html, /Skip to content/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders the hero glow without rectangular runtime filters", async () => {
  const styles = await readFile(globalStylesPath, "utf8");
  const glowRule = styles.match(/\.neon-wordmark__glow\s*\{([^}]*)\}/);
  const coreRule = styles.match(
    /\.neon-wordmark__layer--core\s*\{([^}]*)\}/,
  );

  assert.ok(glowRule, "Expected a static hero glow rule");
  assert.ok(coreRule, "Expected an animated hero core rule");
  assert.doesNotMatch(glowRule[1], /\bfilter\s*:/);
  assert.doesNotMatch(coreRule[1], /\bfilter\s*:/);
  assert.doesNotMatch(styles, /\.neon-wordmark__layer--(?:ambient|bloom)/);
});

test("renders the primary public routes", async () => {
  const routes = [
    ["/events", /Upcoming Frequency Shift events/],
    ["/archive", /Frequency Shift 001/],
    ["/archive/frequency-shift-001", /frequency-shift-001-01\.webp/],
    ["/about", /Built for the dancefloor/],
    ["/contact", /Contact Frequency Shift/],
    ["/events/the-experiment", /Yaan, Valium, Seb B, Balla/],
    ["/events/september-4", /returns to GRIDWRKS on September 4/],
    ["/events/boat-party", /heads onto the water for Boat Party/],
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
    ["/archive/frequency-fest", /27(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-001", /20(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-002", /11(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-003", /16(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-004", /2(?:<!-- -->)? photographs/i],
    ["/archive/frequency-shift-005", /Event record/i],
    ["/archive/world-cup", /10(?:<!-- -->)? photographs/i],
    ["/archive/solstice", /Event record/i],
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
  assert.match(indexHtml, /frequency-fest-01\.webp/);
  assert.ok(
    indexHtml.indexOf("Frequency Fest Vol. 1") < indexHtml.indexOf("Frequency Shift 001"),
  );
  assert.match(indexHtml, /frequency-shift-001-01\.webp/);
  assert.match(indexHtml, /world-cup-01\.webp/);
  assert.match(indexHtml, /dopamine-01\.webp/);
  assert.match(indexHtml, /two-stage mini festival at Club SAW/i);

  const photoArchive = await render("/archive/frequency-shift-003");
  const photoHtml = await photoArchive.text();
  assert.match(photoHtml, /frequency-shift-003-16\.webp/);
  assert.doesNotMatch(photoHtml, /placeholder|final edit pending/i);

  const reelArchive = await render("/archive/frequency-shift-004");
  const reelHtml = await reelArchive.text();
  assert.match(reelHtml, /frequency-shift-004-02\.webp/);
  assert.match(reelHtml, /event-night frames selected from that official recap/i);
  assert.doesNotMatch(reelHtml, /placeholder|final edit pending/i);

  const recordArchive = await render("/archive/solstice");
  const recordHtml = await recordArchive.text();
  assert.match(recordHtml, /Event announcement/);
  assert.doesNotMatch(recordHtml, /Event context|Record notes/);
  assert.doesNotMatch(recordHtml, /Context, lineup, venue, and original source posts are preserved here/);
  assert.doesNotMatch(recordHtml, /A documentary edit drawn from the original event record/);
  assert.doesNotMatch(recordHtml, /placeholder|image pending|image slots|final edit pending/i);
});

test("renders caption-grounded editorial and event facts", async () => {
  const homepage = await render("/");
  const homepageHtml = await homepage.text();
  assert.match(homepageHtml, /Ottawa’s underground,/);
  assert.match(homepageHtml, /on its own frequency/);
  assert.match(homepageHtml, /freedom, self-expression, and a community/i);
  assert.match(homepageHtml, /The Experiment/);
  assert.match(homepageHtml, /August 7, 2026/);
  assert.match(homepageHtml, /the-experiment\.webp/);

  const eventsPage = await render("/events");
  const eventsHtml = await eventsPage.text();
  assert.match(eventsHtml, /September 4, 2026/);
  assert.match(eventsHtml, /Boat Party/);
  assert.match(eventsHtml, /September 17, 2026/);
  assert.match(eventsHtml, /GRIDWRKS, Ottawa, Canada/);
  assert.doesNotMatch(eventsHtml, /Location to be announced|Details soon/i);

  const about = await render("/about");
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /intimacy of a local room/i);
  assert.match(aboutHtml, /Made together/i);
  assert.doesNotMatch(aboutHtml, /70 people|nearly 200/i);
  assert.match(aboutHtml, /DMdwuDnvnKH/);

  const contact = await render("/contact");
  const contactHtml = await contact.text();
  assert.match(contactHtml, /@frequency___shift/);
  assert.doesNotMatch(contactHtml, /Instagram is currently the active route/);

  const factChecks = [
    ["/archive/frequency-shift-003", /GRIDWRKS/],
    ["/archive/frequency-shift-004", /Maggie Tipenko/],
    ["/archive/frequency-shift-005", /opened at 10 PM/],
    ["/archive/world-cup", /free-entry edition ran from 9 PM to 2 AM/],
    ["/archive/solstice", /222 Slater Street/],
    ["/archive/dopamine", /8 PM opening/],
  ];

  for (const [path, expected] of factChecks) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }

  const ogs018 = await render("/archive/frequency-shift-003");
  const ogs018Html = await ogs018.text();
  assert.match(ogs018Html, /sets were later released in full/i);
  assert.match(ogs018Html, /DPAOdRxDzCV/);
  assert.match(ogs018Html, /DPNJv_KEW9M/);
  assert.match(ogs018Html, /DPXgfzYEZX9/);

  const ogs041 = await render("/archive/frequency-shift-004");
  const ogs041Html = await ogs041.text();
  assert.match(ogs041Html, /run-it-back/i);
  assert.match(ogs041Html, /DSfs0EuDE7I/);
});

test("publishes only finished event records in the sitemap", async () => {
  const response = await render("/sitemap.xml");
  assert.equal(response.status, 200);
  const sitemap = await response.text();
  assert.doesNotMatch(sitemap, /next-frequency-shift/);
  assert.match(sitemap, /events\/the-experiment/);
  assert.match(sitemap, /events\/september-4/);
  assert.match(sitemap, /events\/boat-party/);
  assert.match(sitemap, /archive\/frequency-fest/);
});

test("keeps scaffold language out of public pages", async () => {
  const routes = [
    "/events",
    "/events/september-4",
    "/events/boat-party",
    "/archive",
    "/archive/frequency-shift-005",
    "/archive/solstice",
    "/privacy",
    "/terms",
  ];
  const scaffoldLanguage =
    /placeholder|image pending|image slots|final edit pending|draft only|policy scaffold|content-ready shell|details soon|not yet available/i;

  for (const path of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.doesNotMatch(await response.text(), scaffoldLanguage, path);
  }
});

test("keeps reveal motion from clipping interactive glow effects", async () => {
  const styles = await readFile(globalStylesPath, "utf8");
  const generalRevealRule = styles.match(
    /\.motion-enabled \[data-reveal\]\.is-revealed\s*\{([^}]*)\}/,
  );

  assert.ok(generalRevealRule, "general revealed-state rule is present");
  assert.doesNotMatch(generalRevealRule[1], /clip-path/);
  assert.match(
    styles,
    /\.motion-enabled \[data-reveal="clip"\]\.is-revealed\s*\{[^}]*clip-path:\s*inset\(0\)/,
  );
});

test("gives touch devices scroll-driven neon states without horizontal spill", async () => {
  const [styles, motion] = await Promise.all([
    readFile(globalStylesPath, "utf8"),
    readFile(siteMotionPath, "utf8"),
  ]);

  assert.match(styles, /html\s*\{[^}]*overflow-x:\s*clip/);
  assert.match(styles, /\.mobile-neon-enabled \.button\.is-mobile-neon-active/);
  assert.match(styles, /\.mobile-neon-enabled \.event-card\.is-mobile-neon-active/);
  assert.match(motion, /mobileNeonObserver\s*=\s*new IntersectionObserver/);
  assert.match(motion, /rootMargin:\s*"-18% 0px -18% 0px"/);
  assert.match(motion, /is-mobile-neon-active/);
});

test("renders page titles without waiting for client-side reveal motion", async () => {
  const response = await render("/about");
  const html = await response.text();

  assert.match(html, /<h1 class="page-title">About<\/h1>/);
  assert.match(html, /<h2>Built for the dancefloor\.<\/h2>/);
  assert.match(html, /<h2>Made together\.<\/h2>/);
  assert.doesNotMatch(
    html,
    /<h1[^>]*class="page-title"[^>]*data-reveal/,
  );
});

test("keeps the glass material lab local-only", async () => {
  const response = await render("/glass-lab");
  assert.equal(response.status, 404);

  const sitemapResponse = await render("/sitemap.xml");
  assert.doesNotMatch(await sitemapResponse.text(), /glass-lab/);

  const clientFiles = await readdir(builtClientRoot, { recursive: true });
  assert.doesNotMatch(
    clientFiles.join("\n"),
    /(?:glass-demo|glass-lab|realtime-glass|true-glass)/i,
  );

  const clientText = (
    await Promise.all(
      clientFiles
        .filter((path) => /\.(?:js|css)$/.test(path))
        .map((path) => readFile(`${builtClientRoot}${path}`, "utf8")),
    )
  ).join("\n");
  assert.doesNotMatch(clientText, /True glass system|realtimeGlassLens|glass-lab-root/);
});

test("ships every declared archive photograph as responsive WebP assets", async () => {
  const expectedCounts = {
    "frequency-fest": 27,
    "frequency-shift-001": 20,
    "frequency-shift-002": 11,
    "frequency-shift-003": 16,
    "frequency-shift-004": 2,
    "world-cup": 10,
    dopamine: 20,
  };

  for (const [slug, count] of Object.entries(expectedCounts)) {
    const directory = `${builtArchiveRoot}${slug}`;
    const filenames = (await readdir(directory))
      .filter((filename) => /-\d{2}\.webp$/.test(filename))
      .toSorted();
    assert.equal(filenames.length, count, slug);

    for (let index = 1; index <= count; index += 1) {
      const filename = `${slug}-${String(index).padStart(2, "0")}.webp`;
      assert.equal(filenames[index - 1], filename, `${slug} sequence`);
      const image = await readFile(`${directory}/${filename}`);
      assert.ok(image.length > 12, filename);
      assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF", filename);
      assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP", filename);

      const mobileImage = await readFile(
        `${directory}/${slug}-${String(index).padStart(2, "0")}-480.webp`,
      );
      assert.equal(mobileImage.subarray(8, 12).toString("ascii"), "WEBP", filename);
    }
  }
});
