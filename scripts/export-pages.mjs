import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const clientRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const outputRoot = fileURLToPath(new URL("../out/", import.meta.url));

function normalizeBasePath(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

const basePath = normalizeBasePath(
  process.env.PAGES_BASE_PATH ?? "/Frequency-Shift",
);
const pagesOrigin = (process.env.PAGES_ORIGIN ?? "https://dosen-blip.github.io").replace(
  /\/$/,
  "",
);

const navigationFallback = `
<script data-static-pages-navigation>
document.addEventListener("click", function (event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!(event.target instanceof Element)) return;
  const anchor = event.target.closest("a[href]");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.href = url.href;
}, true);
</script>`;

function prefixSrcset(value) {
  return value
    .split(",")
    .map((candidate) => {
      const match = candidate.match(/^(\s*)\/(?!\/)(.*)$/s);
      return match ? `${match[1]}${basePath}/${match[2]}` : candidate;
    })
    .join(",");
}

function rewriteHtml(html) {
  let rewritten = html.replace(
    /(\b(?:href|src|action|content|poster|data-rsc-css-href)=["'])\/(?!\/)/gi,
    `$1${basePath}/`,
  );

  rewritten = rewritten.replace(
    /(\b(?:srcset|imagesrcset)=["'])([^"']*)(["'])/gi,
    (_match, opening, value, closing) =>
      `${opening}${prefixSrcset(value)}${closing}`,
  );

  rewritten = rewritten.replace(/url\(\/(?!\/)/gi, `url(${basePath}/`);
  return rewritten.replace("</head>", `${navigationFallback}\n</head>`);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function routeOutputPath(pathname) {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, "");
  return cleanPath
    ? fileURLToPath(new URL(`../out/${cleanPath}/index.html`, import.meta.url))
    : fileURLToPath(new URL("../out/index.html", import.meta.url));
}

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("pages-export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);

const runtimeEnv = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const runtimeContext = {
  waitUntil() {},
  passThroughOnException() {},
};

async function fetchBuiltRoute(pathname) {
  return worker.fetch(
    new Request(`http://frequency-shift.local${pathname}`, {
      headers: { accept: "text/html" },
    }),
    runtimeEnv,
    runtimeContext,
  );
}

const sitemapResponse = await fetchBuiltRoute("/sitemap.xml");
if (!sitemapResponse.ok) {
  throw new Error(`Could not render sitemap.xml (${sitemapResponse.status})`);
}

const sourceSitemap = await sitemapResponse.text();
const routes = [
  ...new Set([
    "/",
    ...[...sourceSitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      ([, location]) => {
        const pathname = new URL(location).pathname;
        if (
          basePath &&
          (pathname === basePath || pathname.startsWith(`${basePath}/`))
        ) {
          return pathname.slice(basePath.length) || "/";
        }
        return pathname;
      },
    ),
  ]),
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true });

for (const route of routes) {
  const response = await fetchBuiltRoute(route);
  if (!response.ok) {
    throw new Error(`Could not render ${route} (${response.status})`);
  }

  const outputPath = routeOutputPath(route);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, rewriteHtml(await response.text()));
}

const notFoundResponse = await fetchBuiltRoute("/__static_pages_not_found__");
await writeFile(
  fileURLToPath(new URL("../out/404.html", import.meta.url)),
  rewriteHtml(await notFoundResponse.text()),
);
await writeFile(fileURLToPath(new URL("../out/.nojekyll", import.meta.url)), "");

const deployedSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const suffix = route === "/" ? "/" : route;
    return `  <url><loc>${escapeXml(`${pagesOrigin}${basePath}${suffix}`)}</loc></url>`;
  })
  .join("\n")}
</urlset>
`;
await writeFile(
  fileURLToPath(new URL("../out/sitemap.xml", import.meta.url)),
  deployedSitemap,
);

// Confirm the copied client bundle is present before reporting success.
await access(fileURLToPath(new URL("../out/assets/", import.meta.url)));

console.log(
  `Exported ${routes.length} routes from ${projectRoot} for ${pagesOrigin}${basePath}/`,
);
