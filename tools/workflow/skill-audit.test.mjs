import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupDuplicates, inventory } from './skill-audit.mjs';

test('unique names are not duplicates', () => assert.deepEqual(groupDuplicates([{ name: 'a', sha256: '1' }]), []));
test('identical mirrors are labeled, not removed', () => {
  const input = [{ name: 'a', sha256: '1' }, { name: 'a', sha256: '1' }];
  assert.equal(groupDuplicates(input)[0].identicalSkillText, true);
  assert.equal(input.length, 2);
});
test('different versions are visible', () => assert.equal(groupDuplicates([
  { name: 'a', sha256: '1' }, { name: 'a', sha256: '2' }, { name: 'b', sha256: '3' }
])[0].identicalSkillText, false));
test('missing roots fail explicitly', async () => {
  await assert.rejects(inventory(new URL('./not-a-skill-root', import.meta.url).pathname));
});
