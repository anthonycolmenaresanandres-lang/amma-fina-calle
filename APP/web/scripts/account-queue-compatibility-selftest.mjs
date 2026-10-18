import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
// Reuse the established state-machine suite, changing only its synthetic setup.
// No production imports, network, credentials or writes to the source test.
const original = new URL('./owner-queue-selftest.mjs', import.meta.url);
let source = await readFile(original, 'utf8');
const setup = " await db.exec(await readFile(new URL('../supabase/proposals/owner_request_queue_v1.sql',import.meta.url),'utf8'));";
assert.equal(source.split(setup).length, 2, 'expected one queue setup anchor');
source = source.replace(setup, setup + "\n await db.exec(await readFile(new URL('../supabase/proposals/owner_request_tracking_v1.sql',import.meta.url),'utf8'));");
source = source.replaceAll('import.meta.url', JSON.stringify(original.href));
await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
