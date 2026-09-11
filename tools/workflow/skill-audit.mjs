import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)));

// Explicit roots only; do not follow symlinks or inspect configuration/secrets.
export async function inventory(root) {
  const rows = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) await walk(path);
      if (entry.isFile() && entry.name === 'SKILL.md') {
        const body = await readFile(path, 'utf8');
        const normalized = body.replace(/\r\n/g, '\n');
        const name = normalized.match(/^name:\s*["']?([^\n"']+)["']?\s*$/m)?.[1]?.trim();
        rows.push({ name: name || relative(root, folder), path, bytes: Buffer.byteLength(body),
          sha256: createHash('sha256').update(normalized).digest('hex') });
      }
    }
  }
  await walk(resolve(root));
  return rows.sort((a, b) => a.path.localeCompare(b.path));
}

export function groupDuplicates(rows) {
  const groups = new Map();
  for (const row of rows) groups.set(row.name, [...(groups.get(row.name) || []), row]);
  return [...groups].filter(([, copies]) => copies.length > 1)
    .map(([name, copies]) => ({ name, identicalSkillText: new Set(copies.map(c => c.sha256)).size === 1, copies }));
}

export async function audit(roots) {
  const inventories = await Promise.all(roots.map(inventory));
  const rows = inventories.flat();
  return { roots, skillFiles: rows.length, duplicateNames: groupDuplicates(rows),
    note: 'Read-only SKILL.md comparison; mirrors are intentional. This does not compare supporting files or certify safety.' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const roots = process.argv.length > 2 ? process.argv.slice(2).map(p => resolve(p))
    : [resolve(repo, '.agents/skills'), resolve(repo, '.claude/skills')];
  try { console.log(JSON.stringify(await audit(roots), null, 2)); }
  catch (error) { console.error(`Skill audit failed: ${error.message}`); process.exitCode = 1; }
}
