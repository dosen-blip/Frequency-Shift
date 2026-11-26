import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const LOCAL_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const pagesBasePath = process.env.PAGES_BASE_PATH?.trim();
const publicBase = pagesBasePath
  ? `/${pagesBasePath.replace(/^\/+|\/+$/g, "")}/`
  : "/";

function localGlassLab() {
  return {
    name: "frequency-shift-local-glass-lab",
    apply: "serve" as const,
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname
          .replace(/\/+$/, "") || "/";
        if (pathname !== "/glass-lab") {
          next();
          return;
        }

        try {
          const source = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Glass Material Lab</title>
  </head>
  <body>
    <div id="glass-lab-root"></div>
    <script type="module" src="/app/glass-lab/dev-entry.tsx"></script>
  </body>
</html>`;
          const html = await server.transformIndexHtml(request.url ?? "/glass-lab", source);
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

// The laser room lab: a dev-only page for building and judging the WebGL hero layer by layer. Like the glass
// lab, it is served by middleware and never built into the site.
function localLaserLab() {
  return {
    name: "frequency-shift-local-laser-lab",
    apply: "serve" as const,
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname
          .replace(/\/+$/, "") || "/";
        // frames the lab posts for judging away from a visible browser (see __snap in the lab), saved to a temp folder
        if (pathname === "/laser-lab/snapshot" && request.method === "POST") {
          const { mkdir, writeFile } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { tmpdir } = await import("node:os");
          const chunks: Buffer[] = [];
          for await (const chunk of request) chunks.push(chunk as Buffer);
          const name = (new URL(request.url ?? "", "http://localhost").searchParams.get("name") ?? "frame")
            .replace(/[^\w.-]/g, "_");
          const dir = process.env.LASER_LAB_SNAPSHOTS ?? join(tmpdir(), "laser-lab");
          await mkdir(dir, { recursive: true });
          const data = Buffer.concat(chunks).toString().replace(/^data:image\/\w+;base64,/, "");
          const file = join(dir, `${name}.jpg`);
          await writeFile(file, Buffer.from(data, "base64"));
          response.setHeader("Content-Type", "text/plain");
          response.end(file);
          return;
        }
        if (pathname !== "/laser-lab") {
          next();
          return;
        }

        try {
          const source = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Laser Room Lab</title>
  </head>
  <body>
    <div id="laser-lab-root"></div>
    <script type="module" src="/app/laser-lab/dev-entry.ts"></script>
  </body>
</html>`;
          const html = await server.transformIndexHtml(request.url ?? "/laser-lab", source);
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: LOCAL_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    base: publicBase,
    build: {
      // Keep the client executable on older iPhones and embedded WebViews.
      // The explicit CSS target also preserves legacy max-width media queries
      // instead of emitting Media Queries Level 4 range syntax.
      target: "safari13",
      cssTarget: "safari13",
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      localGlassLab(),
      localLaserLab(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
