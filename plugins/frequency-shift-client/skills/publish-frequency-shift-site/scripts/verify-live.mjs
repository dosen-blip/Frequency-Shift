#!/usr/bin/env node

const args = process.argv.slice(2);
const originArg = args.find((arg) => !arg.startsWith("--"));

if (!originArg) {
  console.error(
    "Usage: verify-live.mjs <origin> [--path /route] [--contains text] [--not-contains text]",
  );
  process.exit(2);
}

function values(flag) {
  const result = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === flag && args[index + 1]) result.push(args[index + 1]);
  }
  return result;
}

const paths = values("--path");
const required = values("--contains");
const forbidden = values("--not-contains");
const routes = paths.length ? paths : ["/"];
const origin = new URL(originArg);
const results = [];

for (const pathname of routes) {
  const url = new URL(pathname, origin);
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "frequency-shift-release-check/1.0" },
  });
  const body = await response.text();
  const missing = required.filter((text) => !body.includes(text));
  const presentForbidden = forbidden.filter((text) => body.includes(text));

  results.push({
    url: response.url,
    status: response.status,
    ok:
      response.ok &&
      missing.length === 0 &&
      presentForbidden.length === 0,
    missing,
    presentForbidden,
  });
}

console.log(JSON.stringify(results, null, 2));
process.exit(results.every((result) => result.ok) ? 0 : 1);
