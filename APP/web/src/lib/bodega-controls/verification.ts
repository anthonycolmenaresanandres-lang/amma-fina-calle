import { QUEUE_UUID, ownerQueueEnabledForTenant } from "../owner/queue/client";
import { BODEGA_MANIFEST } from "./catalog";
import { bodegaControlsEnabled, parseBodegaSnapshot, type BodegaReader, type BodegaSnapshot } from "./overlay";
import { readBodegaPublicMenu } from "./readback";

type Options = Parameters<typeof readBodegaPublicMenu>[2];
type Result = { ok: true; status: "awaiting_owner_ack" | "rolled_back" } | { ok: false; reason: "disabled" | "unavailable" | "target_conflict" | "public_readback_unverified" | "outcome_unconfirmed" };
type Frame = { id: string; item_id: string; expected_version: number; status: string; publication_commit: string; snapshot: BodegaSnapshot };
const workerEnabled = (env: Record<string,string|undefined>, execute = false) => ownerQueueEnabledForTenant("bodega",env) && bodegaControlsEnabled(env) && env.BODEGA_READBACK_ENABLED === "true" && (!execute || env.BODEGA_EXECUTION_ENABLED === "true");
async function boundedRpc(client: BodegaReader,name: string,args: Record<string,unknown>) {
  const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<null>(resolve => { timer = setTimeout(() => { controller.abort(); resolve(null); },8000); });
    const operation = client.rpc(name,args);
    return await Promise.race([operation.abortSignal ? operation.abortSignal(controller.signal) : operation,timeout]);
  } finally { if (timer) clearTimeout(timer); }
}
function parseFrame(value: unknown,requestId: string): Frame | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string,unknown>;const snapshot = parseBodegaSnapshot(data.snapshot);
  if (data.id !== requestId || data.tenant !== "bodega" || data.manifest_hash !== BODEGA_MANIFEST.hash || typeof data.item_id !== "string" || !QUEUE_UUID.test(data.item_id) || typeof data.expected_version !== "number" || !Number.isSafeInteger(data.expected_version) || data.expected_version < 0 || typeof data.publication_commit !== "string" || !/^[a-f0-9]{40}$/.test(data.publication_commit) || !["ready","rollback_requested","awaiting_verification","awaiting_owner_ack","rolled_back_pending_verification","rolled_back"].includes(String(data.status)) || !snapshot) return null;
  return { id: requestId,item_id: data.item_id,expected_version: data.expected_version,status: String(data.status),publication_commit: data.publication_commit,snapshot };
}
async function recordConflict(client: BodegaReader,requestId: string): Promise<Result> {
  const result = await boundedRpc(client,"record_bodega_request_conflict_v1",{ p_id: requestId });
  return result && !result.error && ["conflict","completion_conflict","rollback_conflict"].includes(String(result.data)) ? { ok: false,reason: "target_conflict" } : { ok: false,reason: "outcome_unconfirmed" };
}
/** Trusted-worker library only. No HTTP route, scheduler, credentials or automatic caller. */
export async function verifyBodegaQueuedRequest(client: BodegaReader,requestId: string,options: Options = {}): Promise<Result> {
  if (!workerEnabled(options.env ?? process.env)) return { ok: false,reason: "disabled" };
  if (!QUEUE_UUID.test(requestId)) return { ok: false,reason: "unavailable" };
  try {
    const result = await boundedRpc(client,"get_bodega_request_readback_v1",{ p_id: requestId });
    const frame = result && !result.error && parseFrame(result.data,requestId);
    if (!frame || ["ready","rollback_requested"].includes(frame.status)) return { ok: false,reason: "unavailable" };
    if (frame.snapshot.items.find(i=>i.id===frame.item_id)?.version !== frame.expected_version) return recordConflict(client,requestId);
    const observed = await readBodegaPublicMenu(frame.snapshot,frame.item_id,{ ...options,expectedCommit: frame.publication_commit });
    if (!observed.ok) return { ok: false,reason: "public_readback_unverified" };
    const confirmed = await boundedRpc(client,"verify_bodega_owner_request_v1",{ p_id: requestId,p_proof: observed.proof });
    if (!confirmed || confirmed.error) return { ok: false,reason: "outcome_unconfirmed" };
    if (confirmed.data !== "awaiting_owner_ack" && confirmed.data !== "rolled_back") return { ok: false,reason: "target_conflict" };
    return { ok: true,status: confirmed.data };
  } catch { return { ok: false,reason: "outcome_unconfirmed" }; }
}
/** One approved/requested operation, preflight and postflight; retries never approve a request. */
export async function processBodegaQueuedRequest(client: BodegaReader,requestId: string,operation: "apply" | "rollback",options: Options = {}): Promise<Result> {
  if (!workerEnabled(options.env ?? process.env,true)) return { ok: false,reason: "disabled" };
  if (!QUEUE_UUID.test(requestId) || !["apply","rollback"].includes(operation)) return { ok: false,reason: "unavailable" };
  try {
    const result = await boundedRpc(client,"get_bodega_request_readback_v1",{ p_id: requestId });
    const frame = result && !result.error && parseFrame(result.data,requestId);
    if (!frame) return { ok: false,reason: "unavailable" };
    const waiting = operation === "apply" ? "ready" : "rollback_requested";
    const applied = operation === "apply" ? ["awaiting_verification","awaiting_owner_ack"] : ["rolled_back_pending_verification","rolled_back"];
    if (applied.includes(frame.status)) return verifyBodegaQueuedRequest(client,requestId,options);
    if (frame.status !== waiting) return { ok: false,reason: "target_conflict" };
    if (frame.snapshot.items.find(i=>i.id===frame.item_id)?.version !== frame.expected_version) return recordConflict(client,requestId);
    const preflight = await readBodegaPublicMenu(frame.snapshot,frame.item_id,{ ...options,expectedCommit: frame.publication_commit });
    if (!preflight.ok) return { ok: false,reason: "public_readback_unverified" };
    const changed = await boundedRpc(client,operation === "apply" ? "execute_owner_request_v1" : "rollback_owner_request_v1",{ p_id: requestId });
    if (!changed || changed.error) return { ok: false,reason: "outcome_unconfirmed" };
    if (!applied.includes(String(changed.data))) return { ok: false,reason: "target_conflict" };
    return verifyBodegaQueuedRequest(client,requestId,options);
  } catch { return { ok: false,reason: "outcome_unconfirmed" }; }
}
