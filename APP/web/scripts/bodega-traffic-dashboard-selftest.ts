import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function read(relative: string) {
  return readFile(path.resolve(relative), "utf8");
}

async function main() {
  const [lib, page, customers, env] = await Promise.all([
    read("src/lib/traffic/vercel-web-analytics.ts"),
    read("src/app/customers/bodega-traffic/page.tsx"),
    read("src/app/customers/page.tsx"),
    read(".env.example"),
  ]);

  assert.match(lib, /import "server-only"/);
  assert.match(lib, /requestHostname eq 'bodegacafe757\.com'/);
  assert.match(lib, /www\.bodegacafe757\.com/);
  assert.match(lib, /\/v1\/query\/web-analytics\/visits/);
  assert.match(lib, /requestPath eq '\/bodega-sessions-review'/);
  assert.match(lib, /VERCEL_WEB_ANALYTICS_TOKEN/);
  assert.match(lib, /VERCEL_OIDC_TOKEN/);
  assert(!lib.includes("NEXT_PUBLIC_VERCEL"), "Analytics credentials must stay server-only");

  assert.match(page, /getAdminContext\(\)/);
  assert.match(page, /admin\.state !== "authorized"/);
  assert.match(page, /getBodegaTrafficReport\(30\)/);
  assert.match(page, /Unique visitors/);
  assert.match(page, /Game opens/);
  assert.match(page, /not a guaranteed count of physical QR scans/);
  assert.match(customers, /href="\/customers\/bodega-traffic"/);
  assert.match(env, /VERCEL_WEB_ANALYTICS_TOKEN=/);

  console.log("PASS: Bodega traffic dashboard is admin-gated, Web Analytics-backed, hostname-scoped, server-authenticated, and explicit about QR-scan limits.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
