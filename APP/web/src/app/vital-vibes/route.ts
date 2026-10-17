import { vitalVibesDocument } from './document';

export const dynamic = 'force-dynamic';

export function GET() {
  const active = process.env.VERCEL_ENV === 'production' && process.env.TRAFFIC_INGESTION_SOURCE === 'first-party';
  const document = active ? vitalVibesDocument.replace('</head>', '<meta name="fc-traffic-collector" content="first-party-v1"><script src="/traffic-collector.js" data-enabled="true" defer></script></head>') : vitalVibesDocument;
  return new Response(document, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src ${active ? "'self'" : "'none'"}; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'`,
      'Referrer-Policy': 'no-referrer',
    },
  });
}
