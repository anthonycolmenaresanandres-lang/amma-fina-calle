// Offline behavioral tests. Every route dependency, environment and network
// boundary is replaced inside a VM; no credentials, database or email are used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';

function load(file, imports, env, fetch = async () => { throw new Error('Unexpected network call'); }) {
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    fileName: file,
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, process: { env }, Buffer, URL, AbortSignal, fetch,
    console: { error() {} },
    require(name) {
      if (!Object.hasOwn(imports, name)) throw new Error(`Unmocked dependency: ${name}`);
      return imports[name];
    },
  }, { filename: file });
  return exports;
}

const next = { NextResponse: { json: (body, init) => Response.json(body, init) } };
const registry = load('src/lib/traffic/sites.ts', {}, {});
const formatter = load('src/lib/traffic/morning-format.ts', { './sites': registry }, {});
const dates = load('src/lib/traffic/date.ts', {}, {});
const date = '2026-10-03';
const reports = registry.TRAFFIC_SITES.map((site, index) => index === 0 ? {
  state: 'ready', siteId: site.id, siteName: site.name, domains: site.domains,
  analyticsUrl: site.analyticsUrl, source: 'Vercel Web Analytics drain',
  since: '2026-10-03T04:00:00.000Z', until: '2026-10-04T04:00:00.000Z',
  firstObservedAt: '2026-10-03T12:00:00.000Z', lastUpdated: '2026-10-03T12:00:00.000Z',
  pageviews: 3, visitors: 2, daily: [], topPaths: [], topReferrers: [],
} : {
  state: 'waiting', siteId: site.id, siteName: site.name, domains: site.domains,
  analyticsUrl: site.analyticsUrl, reason: 'Synthetic missing feed',
});

async function main() {
  const env = {
    RESEND_API_KEY: 'fixture-shared-key', REQUESTS_FROM_EMAIL: 'shared@example.test',
    TRAFFIC_MORNING_REPORT_EMAIL: 'approved@example.test',
  };
  const requests = [];
  let providerStatus = 200;
  const mail = load('src/lib/traffic/morning-email.ts', {
    'server-only': {}, './morning-format': formatter,
  }, env, async (url, options) => {
    requests.push({ url, options });
    return new Response(null, { status: providerStatus });
  });
  assert.equal((await mail.sendMorningReport(date, reports)).sent, false);
  assert.equal(requests.length, 0, 'Shared credentials must not activate traffic email');
  env.TRAFFIC_RESEND_API_KEY = 'fixture-traffic-key';
  assert.equal((await mail.sendMorningReport(date, reports)).sent, false);
  assert.equal(requests.length, 0, 'Shared sender must not be used as fallback');
  env.TRAFFIC_FROM_EMAIL = 'Traffic <traffic@example.test>';
  assert.equal(mail.morningEmailStatus().configured, true);
  assert.equal((await mail.sendMorningReport(date, reports)).sent, true);
  const first = requests[0];
  assert.equal(first.url, 'https://api.resend.com/emails');
  assert.equal(first.options.headers.Authorization, 'Bearer fixture-traffic-key');
  assert.equal(first.options.headers['Idempotency-Key'], `fina-calle-traffic-${date}`);
  assert.equal(first.options.cache, 'no-store');
  const body = JSON.parse(first.options.body);
  assert.equal(body.from, env.TRAFFIC_FROM_EMAIL);
  assert.deepEqual(body.to, [env.TRAFFIC_MORNING_REPORT_EMAIL]);
  assert.equal((body.text.match(/Pageviews:/g) ?? []).length, 1);
  assert.equal((body.text.match(/Status: Synthetic missing feed/g) ?? []).length, 2);
  await mail.sendMorningReport(date, reports);
  assert.equal(requests[1].options.headers['Idempotency-Key'], first.options.headers['Idempotency-Key']);
  assert.equal(requests[1].options.body, first.options.body);
  providerStatus = 403;
  assert.equal((await mail.sendMorningReport(date, reports)).reason, 'email_http_403');
  env.TRAFFIC_MORNING_REPORT_EMAIL = 'invalid';
  assert.equal(mail.morningEmailStatus().configured, false);
  assert.equal((await mail.sendMorningReport(date, reports)).reason, 'invalid_report_recipient');
  assert.equal(requests.length, 3);

  let adminAuthorized = false;
  let reads = 0;
  let sends = 0;
  let figures = reports;
  let sent = true;
  let rejectSend = false;
  const cronEnv = {};
  const traffic = load('src/app/api/internal/traffic/morning/route.ts', {
    'node:crypto': crypto, 'next/server': next,
    '@/lib/admin/auth': { getAdminContext: async () => ({ state: adminAuthorized ? 'authorized' : 'signed-out' }) },
    '@/lib/traffic/morning-email': {
      morningEmailStatus: () => ({ configured: true, missing: [], recipientValid: true }),
      sendMorningReport: async () => { sends++; if (rejectSend) throw new Error('Synthetic failure'); return { sent, reason: 'email_not_configured' }; },
    },
    '@/lib/traffic/site-traffic': { getMorningTrafficReports: async () => { reads++; return { date, reports: figures }; } },
  }, cronEnv);
  const request = (path = '', auth) => new Request(`https://example.test/api/internal/traffic/morning${path}`, {
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  });
  assert.equal((await traffic.GET(request())).status, 503);
  cronEnv.CRON_SECRET = 'fixture-cron';
  for (const auth of [undefined, 'wrong-length', 'fixture-crox']) {
    assert.equal((await traffic.GET(request('', auth))).status, 401);
  }
  assert.equal(reads, 0);
  assert.equal(sends, 0);
  assert.equal((await traffic.GET(request('?dryRun=1', 'fixture-cron'))).status, 401);
  adminAuthorized = true;
  const preview = await traffic.GET(request('?dryRun=1'));
  const metadata = await preview.json();
  assert.equal(metadata.dryRun, true);
  assert.equal(metadata.date, date);
  assert.equal(metadata.readyToSend, true);
  assert.equal(metadata.squareRefreshEnabled, false);
  assert.equal(preview.headers.get('cache-control'), 'private, no-store');
  assert.equal(sends, 0, 'Readiness must never send');
  assert(!JSON.stringify(metadata).includes('fixture-cron'));
  assert(!JSON.stringify(metadata).includes('Pageviews'));
  delete cronEnv.CRON_SECRET;
  assert.equal((await (await traffic.GET(request('?dryRun=1'))).json()).readyToSend, false);
  cronEnv.CRON_SECRET = 'fixture-cron';
  const delivered = await traffic.GET(request('', 'fixture-cron'));
  assert.equal(delivered.status, 200);
  const delivery = await delivered.json();
  assert.deepEqual(delivery.sites, ['bodega']);
  assert.deepEqual(delivery.incomplete, ['fina-calle', 'colattao']);
  assert.equal(sends, 1);
  figures = reports.map(r => ({ ...r, state: 'waiting', reason: 'Synthetic missing feed' }));
  assert.equal((await traffic.GET(request('', 'fixture-cron'))).status, 503);
  assert.equal(sends, 1, 'No verified figures must block delivery');
  figures = reports;
  sent = false;
  assert.equal((await traffic.GET(request('', 'fixture-cron'))).status, 503);
  sent = true;
  rejectSend = true;
  assert.equal((await traffic.GET(request('', 'fixture-cron'))).status, 502);

  let refreshes = 0;
  const squareEnv = { CRON_SECRET: 'fixture-cron' };
  const square = load('src/app/api/integrations/square/refresh/route.ts', {
    'next/server': next,
    '@/lib/square/connection': { refreshDueSquareConnections: async () => { refreshes++; return { refreshed: 0 }; } },
  }, squareEnv);
  assert.equal((await square.GET(request())).status, 401);
  for (const flag of [undefined, 'false', 'TRUE', '1']) {
    if (flag === undefined) delete squareEnv.SQUARE_REFRESH_CRON_ENABLED;
    else squareEnv.SQUARE_REFRESH_CRON_ENABLED = flag;
    const response = await square.GET(request('', 'fixture-cron'));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).reason, 'square_refresh_disabled');
  }
  assert.equal(refreshes, 0, 'Report credential alone must never refresh Square');
  squareEnv.SQUARE_REFRESH_CRON_ENABLED = 'true';
  assert.equal((await square.GET(request('', 'wrong'))).status, 401);
  assert.equal((await square.GET(request('', 'fixture-cron'))).status, 200);
  assert.equal(refreshes, 1, 'Explicit Square opt-in preserves the existing refresh operation');

  for (const now of ['2026-10-04T12:12:00Z', '2026-11-01T12:12:00Z', '2026-03-09T12:12:00Z']) {
    const period = dates.previousEasternDay(Date.parse(now));
    assert(period.range.until <= now);
  }
  assert.equal(dates.previousEasternDay(Date.parse('2026-10-04T12:12:00Z')).date, date);
  const cron = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).crons;
  assert.deepEqual(cron, [
    { path: '/api/integrations/square/refresh', schedule: '17 9 * * *' },
    { path: '/api/internal/traffic/morning', schedule: '12 12 * * *' },
  ]);
  console.log('PASS: traffic-only mail credentials, private no-send readiness, cron authorization, partial figures, provider failure, daily idempotency and Square opt-in (offline fixtures only).');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
