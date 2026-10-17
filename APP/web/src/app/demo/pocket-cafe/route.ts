import { demoDocument } from './demo-document';

// A standalone document bypasses customer layouts. Optional anonymous pageviews
// are prepared behind the same explicit production activation as public pages.
// No cookies, database, reward APIs or customer identifiers are read or written.
export const dynamic = 'force-dynamic';

export function GET() {
  const active = process.env.VERCEL_ENV === 'production' && process.env.TRAFFIC_INGESTION_SOURCE === 'first-party';
  const document = active ? demoDocument.replace('</head>', '<meta name="fc-traffic-collector" content="first-party-v1"><script src="/traffic-collector.js" data-enabled="true" defer></script></head>') : demoDocument;
  return new Response(document, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': `default-src 'none'; style-src 'self'; img-src 'self'; frame-src 'self'; script-src ${active ? "'self'" : "'none'"}; connect-src ${active ? "'self'" : "'none'"}; base-uri 'none'; form-action 'none'; frame-ancestors 'self'`,
      'Referrer-Policy': 'no-referrer',
    },
  });
}
