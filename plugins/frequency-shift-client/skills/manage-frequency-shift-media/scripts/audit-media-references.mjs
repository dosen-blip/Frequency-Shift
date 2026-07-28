#!/usr/bin/env node

import { access, readFile, stat, readdir } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";

const args = process.argv.slice(2);
const json = args.includes("--json");
const targetArg = args.find((arg) => !arg.startsWith("--"));

if (!targetArg) {
  console.error("Usage: audit-media-references.mjs <public/media/file> [--json]");
  process.exit(2);
}

const root = process.cwd();
const target = resolve(root, targetArg);
const publicRoot = resolve(root, "public");

if (!target.startsWith(`${publicRoot}/`)) {
  console.error("The asset must be inside this repository's public directory.");
  process.exit(2);
}

await access(target);
const info = await stat(target);
if (!info.isFile()) {
  console.error("The supplied media path is not a file.");
  process.exit(2);
}

const publicUrl = `/${relative(publicRoot, target).split("\\").join("/")}`;
const searchRoots = ["app", "components", "content", "tests"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".json"]);
const references = [];

async function walk(directory) {
  let entries = [];
  try {
    entries = await readdir(resolve(root, directory), { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const child = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      await walk(child);
    } else if (textExtensions.has(extname(entry.name))) {
      const body = await readFile(resolve(root, child), "utf8");
      if (body.includes(publicUrl) || body.includes(relative(root, target))) {
        references.push(child);
      }
    }
  }
}

for (const directory of searchRoots) {
  await walk(directory);
}

const result = {
  file: relative(root, target),
  publicUrl,
  bytes: info.size,
  extension: extname(target).toLowerCase(),
  references: references.sort(),
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Asset: ${result.file}`);
  console.log(`Public URL: ${result.publicUrl}`);
  console.log(`Size: ${result.bytes} bytes`);
  console.log(
    result.references.length
      ? `Referenced by:\n${result.references.map((item) => `- ${item}`).join("\n")}`
      : "No source references found. Confirm the asset is intentionally unused before release.",
  );
}

process.exit(result.references.length ? 0 : 1);
