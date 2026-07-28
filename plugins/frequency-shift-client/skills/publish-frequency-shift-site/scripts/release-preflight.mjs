#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const full = process.argv.includes("--full");
const root = process.cwd();
const checks = [];

function run(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: full ? "inherit" : "pipe",
  });
  checks.push({ label, ok: result.status === 0 });
  if (result.status !== 0) {
    if (!full) {
      process.stderr.write(result.stdout || "");
      process.stderr.write(result.stderr || "");
    }
    throw new Error(`${label} failed`);
  }
}

await access(resolve(root, "package.json"));
const hosting = JSON.parse(
  await readFile(resolve(root, ".openai/hosting.json"), "utf8"),
);

if (typeof hosting.project_id !== "string" || !hosting.project_id) {
  throw new Error(".openai/hosting.json does not contain a valid project_id");
}

run("Git diff check", "git", ["diff", "--check"]);
run("Unresolved conflict check", "git", ["diff", "--quiet", "--diff-filter=U"]);

if (full) {
  run("Lint", "npm", ["run", "lint"]);
  run("Test suite", "npm", ["test"]);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      projectIdPresent: true,
      full,
      checks,
      note: "Source checks passed. Git synchronization, Sites deployment, and public verification are still required.",
    },
    null,
    2,
  ),
);
