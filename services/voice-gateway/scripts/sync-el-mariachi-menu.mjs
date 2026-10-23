// Keep the gateway's Docker-contained menu byte-identical to the authoritative site snapshot.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const source = new URL('../../../APP/web/src/app/el-mariachi/jacksonville-menu.json', import.meta.url);
const target = new URL('../src/data/el-mariachi-jacksonville.json', import.meta.url);
const bytes = readFileSync(source);
const menu = JSON.parse(bytes.toString('utf8'));
const items = menu.categories.flatMap(category => category.items);
if (menu.itemCount !== items.length || menu.categoryCount !== menu.categories.length || new Set(items.map(item => item.id)).size !== items.length) throw Error('Invalid source menu counts or duplicate IDs');
if (process.argv.includes('--check')) {
  if (!bytes.equals(readFileSync(target))) throw Error('Voice menu differs from website source: run npm run sync:menu');
} else { writeFileSync(target, bytes); }
console.log(JSON.stringify({items: items.length, categories: menu.categories.length, sourceSha256: createHash('sha256').update(bytes).digest('hex'), unchanged: process.argv.includes('--check')}));
