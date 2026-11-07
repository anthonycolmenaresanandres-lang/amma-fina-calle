import "server-only";
import { createPool } from "@vercel/postgres";
import { trafficDatabaseUrl } from "./store";

/** Fixed read-only application identity; never returns URLs, secrets or records. */
export async function inspectTrafficDatabase() {
  const connectionString = trafficDatabaseUrl();
  if (!connectionString) throw new Error("TRAFFIC_BINDING_UNAVAILABLE");
  const host = new URL(connectionString).hostname;
  if (!host.endsWith(".neon.tech")) throw new Error("TRAFFIC_BINDING_UNAVAILABLE");
  const endpointId = host.split(".")[0].replace(/-pooler$/, "");
  if (!/^ep-[a-z0-9-]{1,90}$/.test(endpointId)) throw new Error("TRAFFIC_BINDING_UNAVAILABLE");
  const pool = createPool({ connectionString, max: 1, connectionTimeoutMillis: 3000, query_timeout: 3000 });
  try {
    const result = await pool.query(`SELECT current_database() AS database,current_user AS role,
      has_table_privilege(current_user,'public.traffic_events','SELECT') AS event_select,
      has_table_privilege(current_user,'public.traffic_events','INSERT') AS event_insert,
      to_regclass('public.traffic_mail_deliveries') IS NOT NULL AS ledger_present,
      CASE WHEN to_regclass('public.traffic_mail_deliveries') IS NULL THEN false ELSE has_table_privilege(current_user,'public.traffic_mail_deliveries','SELECT') END AS ledger_select,
      CASE WHEN to_regclass('public.traffic_mail_deliveries') IS NULL THEN false ELSE has_table_privilege(current_user,'public.traffic_mail_deliveries','INSERT') END AS ledger_insert,
      CASE WHEN to_regclass('public.traffic_mail_deliveries') IS NULL THEN false ELSE has_table_privilege(current_user,'public.traffic_mail_deliveries','UPDATE') END AS ledger_update,
      EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid=to_regclass('public.traffic_mail_deliveries') AND tgname='traffic_mail_payload_immutable' AND tgenabled='O' AND NOT tgisinternal) AS ledger_guard`);
    const row = result.rows[0];
    if (!row || !/^[a-zA-Z0-9_-]{1,63}$/.test(row.database) || !/^[a-zA-Z0-9_-]{1,63}$/.test(row.role)) throw new Error("TRAFFIC_BINDING_UNAVAILABLE");
    return { database: row.database as string, role: row.role as string, endpointId,
      eventSelect: row.event_select === true, eventInsert: row.event_insert === true,
      ledgerPresent: row.ledger_present === true, ledgerSelect: row.ledger_select === true,
      ledgerInsert: row.ledger_insert === true, ledgerUpdate: row.ledger_update === true, ledgerGuard: row.ledger_guard === true };
  } finally { await pool.end(); }
}
