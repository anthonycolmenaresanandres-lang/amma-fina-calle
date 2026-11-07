import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createPool } from "@vercel/postgres";
import { trafficDatabaseUrl } from "./store";

export type DeliveryState = "pending" | "sending" | "accepted" | "unconfirmed" | "rejected";
export type DeliveryRecord = { state: DeliveryState; attempts: number; attempted_at: string | null; accepted_at: string | null };
export interface DeliveryLedger {
  status(key: string): Promise<DeliveryRecord | null>;
  freeze(key: string, payload: string): Promise<void>;
  claim(key: string): Promise<{ attemptId: string; payload: string } | null>;
  finish(key: string, attemptId: string, state: "pending" | "accepted" | "unconfirmed" | "rejected", reason: string | null, providerId?: string): Promise<void>;
}

/** Dedicated traffic DB only; never a filesystem/ephemeral production fallback. */
export class PostgresDeliveryLedger implements DeliveryLedger {
  constructor(private readonly pool: ReturnType<typeof createPool>) {}
  async status(key: string): Promise<DeliveryRecord | null> {
    const result = await this.pool.query<DeliveryRecord>(`SELECT state, attempts, attempted_at, accepted_at
      FROM traffic_mail_deliveries WHERE delivery_key=$1`, [key]);
    return result.rows[0] ?? null;
  }
  async freeze(key: string, payload: string) {
    if (Buffer.byteLength(payload) > 262144) throw new Error("DELIVERY_PAYLOAD_TOO_LARGE");
    await this.pool.query(`INSERT INTO traffic_mail_deliveries (delivery_key,payload,payload_hash)
      VALUES ($1,$2,$3) ON CONFLICT (delivery_key) DO NOTHING`,
    [key, payload, createHash("sha256").update(payload).digest("hex")]);
  }
  async claim(key: string) {
    const attemptId = randomUUID();
    const result = await this.pool.query<{ payload: string }>(`UPDATE traffic_mail_deliveries
      SET state='sending',attempt_id=$2,attempts=attempts+1,attempted_at=NOW(),reason=NULL
      WHERE delivery_key=$1 AND state='pending' AND attempts<3
        AND created_at>NOW()-INTERVAL '23 hours' RETURNING payload`, [key, attemptId]);
    return result.rows[0] ? { attemptId, payload: result.rows[0].payload } : null;
  }
  async finish(key: string, attemptId: string, state: "pending" | "accepted" | "unconfirmed" | "rejected", reason: string | null, providerId?: string) {
    const result = await this.pool.query(`UPDATE traffic_mail_deliveries SET state=$3,
      attempt_id=CASE WHEN $3='pending' THEN NULL ELSE attempt_id END,
      reason=$4,provider_id=$5,accepted_at=CASE WHEN $3='accepted' THEN NOW() ELSE NULL END
      WHERE delivery_key=$1 AND attempt_id=$2 AND state='sending' RETURNING delivery_key`,
    [key, attemptId, state, reason, providerId ?? null]);
    if (result.rows.length !== 1) throw new Error("DELIVERY_CLAIM_LOST");
  }
}

let cached: DeliveryLedger | undefined;
export function getDeliveryLedger(): DeliveryLedger {
  if (!cached) {
    const connectionString = trafficDatabaseUrl();
    if (!connectionString) throw new Error("DELIVERY_LEDGER_UNCONFIGURED");
    cached = new PostgresDeliveryLedger(createPool({ connectionString, max: 2, connectionTimeoutMillis: 3000, query_timeout: 3000, idleTimeoutMillis: 1000 }));
  }
  return cached;
}

export function trafficDeliveryKey(periods: Array<{ kind: string; first: string; last: string }>): string {
  return `fina-calle-traffic-${periods.map(p => `${p.kind}-${p.first}-${p.last}`).join("-and-")}`;
}
