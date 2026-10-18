import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { publishedContent, publishedGroups, SOURCE_BINDINGS } from "../src/lib/bodega-controls/source";

// Manual local preparation only. Never run from a request, migration or deployment.
const digest = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const entries = publishedGroups().flatMap(group => {
  const bindings = SOURCE_BINDINGS[group.scope];
  if (!bindings || bindings.length !== group.items.length) throw new Error(`Review source bindings for ${group.scope}`);
  return group.items.map((item, index) => {
    const [sourceId, expectedName] = bindings[index];
    if (item.name !== expectedName) throw new Error(`Review the source identity at ${group.scope}/${sourceId}`);
    const hash = createHash("sha256").update(`fina-calle:bodega:controls:v1:${sourceId}`).digest("hex");
    const id = `${hash.slice(0,8)}-${hash.slice(8,12)}-8${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
    return { id, sourceId, scope: group.scope, name: item.name, baselineOrder: (index + 1) * 10, contentHash: digest(item) };
  });
});
if (new Set(entries.map(e => e.id)).size !== entries.length || new Set(entries.map(e => e.sourceId)).size !== entries.length) throw new Error("Duplicate source identities");
const manifest = { schema: "bodega-controls-v1", tenant: "bodega", guestPath: "/demo/bodega", hash: digest({ content: publishedContent(), entries }), entries };
writeFileSync(new URL("../src/lib/bodega-controls/manifest.json", import.meta.url), JSON.stringify(manifest, null, 2) + "\n");
const quote = (s: string) => `'${s.replaceAll("'", "''")}'`;
const seed = ["-- UNAPPLIED public-source manifest seed. No owner enrollment, certification or activation.", "begin;",
  `insert into bodega_menu_private.settings(manifest_hash,expected_count) values(${quote(manifest.hash)},${entries.length});`,
  `insert into bodega_menu_private.groups(group_key) values ${[...new Set(entries.map(e=>e.scope))].map(s=>`(${quote(s)})`).join(",")};`,
  `insert into bodega_menu_private.catalog(id,source_id,group_key,public_name,baseline_sort_order,content_hash) values\n${entries.map(e=>`(${quote(e.id)},${quote(e.sourceId)},${quote(e.scope)},${quote(e.name)},${e.baselineOrder},${quote(e.contentHash)})`).join(",\n")};`,
  "insert into bodega_menu_private.controls(item_id,group_key,sort_order) select id,group_key,baseline_sort_order from bodega_menu_private.catalog;", "commit;", ""].join("\n");
writeFileSync(new URL("../supabase/proposals/bodega_menu_manifest_v1.sql", import.meta.url), seed);
console.log(`Prepared ${entries.length} public-source bindings, manifest ${manifest.hash}. No database changed.`);
