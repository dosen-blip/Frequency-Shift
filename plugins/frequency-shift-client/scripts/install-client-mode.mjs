#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "../../..");
const profilePath = resolve(
  repoRoot,
  ".frequency-shift/client-profile.local.json",
);
const marketplacePath = resolve(repoRoot, ".agents/plugins/marketplace.json");
const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
const marketplaceName = marketplace.name;
const pluginName = "frequency-shift-client";
const pluginId = `${pluginName}@${marketplaceName}`;
const args = new Set(process.argv.slice(2));
const json = args.has("--json");

function codex(commandArgs, allowFailure = false) {
  const result = spawnSync("codex", commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0 && !allowFailure) {
    const message = result.stderr.trim() || result.stdout.trim();
    throw new Error(`codex ${commandArgs.join(" ")} failed: ${message}`);
  }

  return result;
}

function parseJsonOutput(result) {
  const start = result.stdout.indexOf("{");
  if (start === -1) return null;
  return JSON.parse(result.stdout.slice(start));
}

async function readProfile() {
  try {
    return JSON.parse(await readFile(profilePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeProfile(mode) {
  await mkdir(dirname(profilePath), { recursive: true });
  const profile = {
    mode,
    plugin: pluginId,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`);
  return profile;
}

function installedState() {
  const result = codex(["plugin", "list", "--available", "--json"], true);
  if (result.status !== 0) return { installed: false, available: false };
  const payload = parseJsonOutput(result) ?? {};
  const installed = (payload.installed ?? []).some(
    (plugin) => plugin.pluginId === pluginId && plugin.enabled,
  );
  const available = [...(payload.installed ?? []), ...(payload.available ?? [])].some(
    (plugin) => plugin.pluginId === pluginId,
  );
  return { installed, available };
}

async function status() {
  return {
    profile: await readProfile(),
    plugin: pluginId,
    ...installedState(),
    repoRoot,
  };
}

if (args.has("--maintainer")) {
  const profile = await writeProfile("maintainer");
  console.log(
    json
      ? JSON.stringify({ ok: true, profile }, null, 2)
      : "Maintainer mode recorded for this computer. Client onboarding will not be offered again.",
  );
  process.exit(0);
}

if (args.has("--decline")) {
  const profile = await writeProfile("declined");
  console.log(
    json
      ? JSON.stringify({ ok: true, profile }, null, 2)
      : "Client mode was not enabled. This choice is local to this computer.",
  );
  process.exit(0);
}

if (args.has("--disable")) {
  const current = installedState();
  if (current.installed) {
    codex(["plugin", "remove", pluginId, "--json"]);
  }
  const profile = await writeProfile("disabled");
  console.log(
    json
      ? JSON.stringify({ ok: true, profile }, null, 2)
      : "Frequency Shift client mode is disabled on this computer.",
  );
  process.exit(0);
}

if (args.has("--enable")) {
  const marketplaces = parseJsonOutput(
    codex(["plugin", "marketplace", "list", "--json"]),
  );
  const configured = (marketplaces?.marketplaces ?? []).some((entry) => {
    const source = entry.marketplaceSource?.source;
    return (
      (entry.root && resolve(entry.root) === repoRoot) ||
      (source && resolve(source) === repoRoot)
    );
  });

  if (!configured) {
    codex(["plugin", "marketplace", "add", repoRoot, "--json"]);
  }

  const current = installedState();
  if (!current.installed) {
    codex(["plugin", "add", pluginId, "--json"]);
  }

  const profile = await writeProfile("client");
  console.log(
    json
      ? JSON.stringify({ ok: true, profile, plugin: installedState() }, null, 2)
      : [
          "Frequency Shift client mode is enabled on this computer.",
          "Start a new Codex task in this repository so the five client skills load cleanly.",
          "Beginner guide: output/pdf/Frequency-Shift-Codex-Client-Brief.pdf",
        ].join("\n"),
  );
  process.exit(0);
}

const currentStatus = await status();
console.log(
  json
    ? JSON.stringify(currentStatus, null, 2)
    : [
        `Profile: ${currentStatus.profile?.mode ?? "not chosen"}`,
        `Plugin installed: ${currentStatus.installed ? "yes" : "no"}`,
        `Plugin available: ${currentStatus.available ? "yes" : "no"}`,
      ].join("\n"),
);
