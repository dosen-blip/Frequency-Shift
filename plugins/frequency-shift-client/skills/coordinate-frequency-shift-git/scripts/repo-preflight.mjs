#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const json = process.argv.includes("--json");

function git(args, optional = false) {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status !== 0 && !optional) {
    const message = result.stderr.trim() || result.stdout.trim();
    throw new Error(`git ${args.join(" ")} failed: ${message}`);
  }

  return result.status === 0 ? result.stdout.trim() : null;
}

const status = git(["status", "--short", "--branch"]);
const changed = git(["diff", "--name-only"]).split("\n").filter(Boolean);
const staged = git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
const unresolved = git(["diff", "--name-only", "--diff-filter=U"]).split("\n").filter(Boolean);
const untracked = git(["ls-files", "--others", "--exclude-standard"]).split("\n").filter(Boolean);
const branch = git(["branch", "--show-current"]);
const head = git(["rev-parse", "HEAD"]);
const originMain = git(["rev-parse", "origin/main"], true);
const remotes = git(["remote", "-v"]).split("\n").filter(Boolean);

const result = {
  branch: branch || "(detached)",
  head,
  originMain,
  headMatchesOriginMain: Boolean(originMain && head === originMain),
  changed,
  staged,
  unresolved,
  untracked,
  clean: changed.length === 0 && staged.length === 0 && untracked.length === 0,
  safeToStageBroadly:
    changed.length === 0 && staged.length === 0 && untracked.length === 0,
  remotes,
  status,
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Branch: ${result.branch}`);
  console.log(`HEAD: ${result.head}`);
  console.log(`origin/main: ${result.originMain ?? "not available"}`);
  console.log(`Working tree: ${result.clean ? "clean" : "has changes"}`);
  console.log(`Unresolved conflicts: ${result.unresolved.length}`);
  if (!result.clean) {
    console.log("\nRepository status:");
    console.log(result.status);
  }
  console.log("\nRemotes:");
  console.log(result.remotes.join("\n") || "(none)");
}

process.exit(unresolved.length ? 1 : 0);
