import { demoDocument } from './demo-document';

// A standalone GET document deliberately bypasses customer layouts/analytics.
// No cookies, database, reward APIs or customer identifiers are read or written.
export const dynamic = 'force-static';

export function GET() {
  return new Response(demoDocument, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': "default-src 'none'; style-src 'self'; img-src 'self'; frame-src 'self'; script-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
      'Referrer-Policy': 'no-referrer',
    },
  });
}
