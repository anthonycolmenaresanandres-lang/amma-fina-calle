// Rebuild the reviewed snapshot and local photo derivatives; never mutates a live menu.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
const evidence = process.argv[2];
if (!evidence) throw new Error('Supply the directory containing the direct browser snapshots.');
const read = async name => JSON.parse((await readFile(`${evidence}/${name}.json`, 'utf8')).replace(/^\uFEFF/, ''));
const snapshots = await Promise.all(['food-browser', 'drinks-browser'].map(read));
const notes = await Promise.all(['food-notes', 'drinks-notes'].map(read));
const root = 'src/table-os/menu/gran-patron';
const assets = 'public/assets/granpatron';
await mkdir(root, { recursive: true });
await mkdir(`${assets}/menu`, { recursive: true });
const clean = s => (s ?? '').replace(/\r/g, '').trim();
const sections = [];
const photos = [];
const structural = [];
for (const [sourceIndex, source] of snapshots.entries()) {
  for (const section of source.sections) {
    const groupId = section.group.match(/menu_(\d+)/)[1];
    const sourceGroup = source.tabs.find(t => t.url.endsWith(`=${groupId}`))?.text;
    const group = sourceIndex === 1 ? 'Drinks' : groupId === '1192868' ? 'Lunch' : groupId === '1192870' ? 'Dinner' : 'Food';
    const sharedPrice = /^\$\d+\.\d{2}$/.test(clean(section.description)) ? clean(section.description) : '';
    const itemNotes = section.items.filter(i => i.name === 'FILLING CHOICES:');
    structural.push(...itemNotes);
    const items = section.items.filter(i => !itemNotes.includes(i)).map(item => {
      const photoUrl = item.photo && !item.photo.includes('placeholder') ? new URL(item.photo, source.url).href : undefined;
      const photo = photoUrl ? `/assets/granpatron/menu/${item.id}.webp` : undefined;
      if (photoUrl) photos.push({ id: item.id, name: item.name, sourceUrl: photoUrl, path: photo });
      return { id: item.id, name: clean(item.name), description: clean(item.description), prices: item.prices.map(clean), sharedPrice, ...(photo ? { photo } : {}) };
    });
    sections.push({ id: `${groupId}-${section.index}`, group, sourceGroup, name: clean(section.title), note: [clean(section.description), ...itemNotes.map(i => `${i.name} ${i.description}`)].filter(Boolean).join('\n\n'), items });
  }
}
const manifest = {
  restaurant: 'Gran Patrón · Princess Anne', address: '5168 Princess Anne Rd, Ste 145, Virginia Beach',
  approval: 'PENDING_CLIENT_APPROVAL', sourceUrls: snapshots.map(s => s.url), retrievedAt: snapshots.map(s => s.retrievedAt),
  sourceRows: snapshots.map(s => s.sections.reduce((n, x) => n + x.items.length, 0)),
  displayedItems: sections.reduce((n,s) => n+s.items.length, 0), structuralRows: structural,
  foodNotice: notes[0].notes[0].text, lunchNotice: notes[0].notes[1].text, beerNotice: notes[1].notes[0].text,
  logo: { sourceUrl: 'https://static.spotapps.co/website_images/ab_websites/629773_website_v1/logo_v1.png', path: '/assets/granpatron/logo.png' }, photos,
};
for (const photo of photos) {
  const response = await fetch(photo.sourceUrl);
  if (!response.ok) throw new Error(`Photo ${photo.id}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(`${evidence}/originals`, { recursive: true });
  await writeFile(`${evidence}/originals/${photo.id}`, bytes);
  await sharp(bytes).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public${photo.path}`);
}
const logoResponse = await fetch(manifest.logo.sourceUrl);
if (!logoResponse.ok) throw new Error(`Logo: ${logoResponse.status}`);
await writeFile(`public${manifest.logo.path}`, Buffer.from(await logoResponse.arrayBuffer()));
await writeFile(`${root}/catalog.json`, JSON.stringify(sections, null, 2)+'\n');
await writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2)+'\n');
await writeFile(`${root}/source-snapshot.json`, JSON.stringify({ snapshots, notes }, null, 2)+'\n');
console.log(JSON.stringify({ sections: sections.length, items: manifest.displayedItems, sourceRows: manifest.sourceRows, structural: structural.length, photos: photos.length }));
