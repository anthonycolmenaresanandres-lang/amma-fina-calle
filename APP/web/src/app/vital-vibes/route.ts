import { vitalVibesDocument } from './document';

export const dynamic = 'force-static';

export function GET() {
  return new Response(vitalVibesDocument, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
      'Referrer-Policy': 'no-referrer',
    },
  });
}
