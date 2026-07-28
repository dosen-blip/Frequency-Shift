#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const pluginRoot = resolve(scriptDirectory, "..");
const repoRoot = resolve(pluginRoot, "../..");
const skillNames = [
  "guide-frequency-shift-client",
  "manage-frequency-shift-site",
  "manage-frequency-shift-media",
  "coordinate-frequency-shift-git",
  "publish-frequency-shift-site",
];
const errors = [];

async function required(path) {
  try {
    await access(resolve(repoRoot, path));
  } catch {
    errors.push(`Missing ${path}`);
  }
}

await required("AGENTS.md");
await required(".agents/plugins/marketplace.json");
await required("plugins/frequency-shift-client/.codex-plugin/plugin.json");
await required("output/pdf/Frequency-Shift-Codex-Client-Brief.pdf");

const plugin = JSON.parse(
  await readFile(
    resolve(pluginRoot, ".codex-plugin/plugin.json"),
    "utf8",
  ),
);
if (plugin.name !== "frequency-shift-client") {
  errors.push("Plugin name does not match its folder.");
}
if (plugin.skills !== "./skills/") {
  errors.push("Plugin skill path is not ./skills/.");
}

const marketplace = JSON.parse(
  await readFile(
    resolve(repoRoot, ".agents/plugins/marketplace.json"),
    "utf8",
  ),
);
const entry = marketplace.plugins?.find(
  (candidate) => candidate.name === plugin.name,
);
if (!entry) errors.push("Marketplace does not list the client plugin.");
if (entry?.source?.path !== "./plugins/frequency-shift-client") {
  errors.push("Marketplace plugin source path is incorrect.");
}

for (const name of skillNames) {
  const skillPath = resolve(pluginRoot, "skills", name, "SKILL.md");
  const agentPath = resolve(pluginRoot, "skills", name, "agents/openai.yaml");
  await access(skillPath).catch(() => errors.push(`Missing skill ${name}`));
  await access(agentPath).catch(() => errors.push(`Missing UI metadata for ${name}`));
  try {
    const body = await readFile(skillPath, "utf8");
    if (!body.includes(`name: ${name}`)) {
      errors.push(`Frontmatter name mismatch for ${name}`);
    }
    if (body.includes("[TODO:")) errors.push(`TODO remains in ${name}`);
  } catch {
    // Missing file is already reported.
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Frequency Shift client pack is structurally complete (${skillNames.length} skills).`,
);
