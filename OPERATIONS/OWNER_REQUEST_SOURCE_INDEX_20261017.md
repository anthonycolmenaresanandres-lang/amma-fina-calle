# Owner request source index

Snapshot: `e0b44dd` plus this task's local fixes. Line numbers refer to this isolated checkout.

## APP/web/src/lib/owner/auth.ts

- [20](../APP/web/src/lib/owner/auth.ts#L20): `export async function getOwnerContext(restaurantId: string): Promise<OwnerContext> {`
- [26](../APP/web/src/lib/owner/auth.ts#L26): `} = await supabase.auth.getUser();`
- [30](../APP/web/src/lib/owner/auth.ts#L30): `const { data: allowed } = await supabase.rpc("is_email_allowed", {`

## APP/web/src/lib/owner/actions.ts

- [21](../APP/web/src/lib/owner/actions.ts#L21): `export async function requestMagicLink(`
- [118](../APP/web/src/lib/owner/actions.ts#L118): `return signInOwnerWithPasswordAt(restaurantId, "dashboard", _prev, formData);`
- [259](../APP/web/src/lib/owner/actions.ts#L259): `async function assertOwner(restaurantId: string) {`
- [272](../APP/web/src/lib/owner/actions.ts#L272): `export async function updateItemText(`

## APP/web/src/lib/owner/menu-control.ts

- [37](../APP/web/src/lib/owner/menu-control.ts#L37): `export function validateMenuEdit(input: MenuEdit): MenuEdit {`
- [21](../APP/web/src/lib/owner/menu-control.ts#L21): `export function normalizedMenuValue(field: MenuEditField, value: unknown): string {`

## APP/web/src/lib/owner/menu-control-actions.ts

- [12](../APP/web/src/lib/owner/menu-control-actions.ts#L12): `export async function saveOwnerMenuEdit(input: MenuEdit): Promise<MenuEditResult> {`
- [30](../APP/web/src/lib/owner/menu-control-actions.ts#L30): `if (normalizedMenuValue(change.field, current) !== change.expectedValue) {`
- [6](../APP/web/src/lib/owner/menu-control-actions.ts#L6): `import { applyOwnerChange, applyOwnerSizePrice } from "./rail";`

## APP/web/src/app/owner/[id]/MenuQuickEdit.tsx

- [45](../APP/web/src/app/owner/[id]/MenuQuickEdit.tsx#L45): `function review(event: React.FormEvent) {`
- [57](../APP/web/src/app/owner/[id]/MenuQuickEdit.tsx#L57): `function confirm() {`
- [101](../APP/web/src/app/owner/[id]/MenuQuickEdit.tsx#L101): `<dl><div><dt>Current</dt><dd>{displayMenuValue(proposal.field, proposal.expectedValue)}</dd></div><div><dt>After saving</dt><dd>{displayMenuValue(proposal.field, proposal.value)}</dd></div></dl>`

## APP/web/src/app/owner/[id]/OwnerDashboard.tsx

- [54](../APP/web/src/app/owner/[id]/OwnerDashboard.tsx#L54): `export type DashboardData = {`
- [132](../APP/web/src/app/owner/[id]/OwnerDashboard.tsx#L132): `const requestSection = (`
- [248](../APP/web/src/app/owner/[id]/OwnerDashboard.tsx#L248): `{data.audit.map((entry) => (`

## APP/web/src/lib/owner/request-desk/actions.ts

- [69](../APP/web/src/lib/owner/request-desk/actions.ts#L69): `export async function triageOwnerRequest(`
- [127](../APP/web/src/lib/owner/request-desk/actions.ts#L127): `export async function confirmOwnerRequest(`
- [155](../APP/web/src/lib/owner/request-desk/actions.ts#L155): `if (!isOwnerPreviewCurrent(`
- [189](../APP/web/src/lib/owner/request-desk/actions.ts#L189): `export async function sendOwnerReview(`
- [254](../APP/web/src/lib/owner/request-desk/actions.ts#L254): `message: notification.sent`

## APP/web/src/lib/owner/request-desk/preview.ts

- [8](../APP/web/src/lib/owner/request-desk/preview.ts#L8): `export function ownerPreviewFingerprint(`
- [22](../APP/web/src/lib/owner/request-desk/preview.ts#L22): `export function isOwnerPreviewCurrent(expected: unknown, current: string): boolean {`

## APP/web/src/lib/owner/request-desk/menu.ts

- [28](../APP/web/src/lib/owner/request-desk/menu.ts#L28): `export async function readOwnerMenu(`
- [48](../APP/web/src/lib/owner/request-desk/menu.ts#L48): `if (restaurantRes.error || categoriesRes.error || itemsRes.error || hoursRes.error || !restaurantRes.data) {`

## APP/web/src/lib/owner/request-desk/triage.ts

- [537](../APP/web/src/lib/owner/request-desk/triage.ts#L537): `export function triageRequest(text: string, snap: MenuSnapshot): TriageResult {`
- [553](../APP/web/src/lib/owner/request-desk/triage.ts#L553): `// Food safety and health claims always need a person to verify the facts.`
- [561](../APP/web/src/lib/owner/request-desk/triage.ts#L561): `if (snap.restaurantId === "colattao") {`

## APP/web/src/lib/requests/intake.ts

- [26](../APP/web/src/lib/requests/intake.ts#L26): `export async function persistChangeRequest(`
- [125](../APP/web/src/lib/requests/intake.ts#L125): `export async function storeOwnerRequestAttachment(`
- [260](../APP/web/src/lib/requests/intake.ts#L260): `export async function sendChangeRequestEmail(`
- [292](../APP/web/src/lib/requests/intake.ts#L292): `const response = await fetch(RESEND_ENDPOINT, {`

## APP/web/src/app/api/customer-requests/route.ts

- [54](../APP/web/src/app/api/customer-requests/route.ts#L54): `export async function POST(request: Request) {`
- [149](../APP/web/src/app/api/customer-requests/route.ts#L149): `const referenceId = `AMMA-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;`
- [175](../APP/web/src/app/api/customer-requests/route.ts#L175): `const receipt = requestReceipt(persistResult.persisted, emailResult.sent);`

## APP/web/src/lib/requests/receipt.ts

- [2](../APP/web/src/lib/requests/receipt.ts#L2): `export function requestReceipt(persisted: boolean, emailSent: boolean) {`

## APP/web/src/data/customers.ts

- [99](../APP/web/src/data/customers.ts#L99): `export async function getCustomers(): Promise<CustomerSummary[]> {`
- [104](../APP/web/src/data/customers.ts#L104): `const { data, error } = await supabase.rpc("get_client_ledger");`
- [108](../APP/web/src/data/customers.ts#L108): `const legacy = await supabase.rpc("get_customer_registry");`

## APP/web/src/data/requests.ts

- [84](../APP/web/src/data/requests.ts#L84): `export async function getChangeRequests(): Promise<ChangeRequestSummary[]> {`
- [94](../APP/web/src/data/requests.ts#L94): `export async function getChangeRequestById(`
- [66](../APP/web/src/data/requests.ts#L66): `const SIGNED_URL_TTL_SECONDS = 300;`

## APP/web/src/app/api/owner/[id]/requests/[referenceId]/attachments/route.ts

- [49](../APP/web/src/app/api/owner/[id]/requests/[referenceId]/attachments/route.ts#L49): `const owner = await getOwnerContext(id);`
- [69](../APP/web/src/app/api/owner/[id]/requests/[referenceId]/attachments/route.ts#L69): `.eq("restaurant_id", id)`
- [6](../APP/web/src/app/api/owner/[id]/requests/[referenceId]/attachments/route.ts#L6): `hasOwnerRequestFileSignature,`

## APP/web/supabase/migrations/0001_owner_portal_foundation.sql

- [23](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L23): `create table if not exists public.owner_emails (`
- [72](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L72): `create table if not exists public.change_requests (`
- [84](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L84): `create table if not exists public.audit_log (`
- [105](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L105): `create or replace function public.is_owner_email(p_restaurant_id text)`
- [121](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L121): `create or replace function public.is_email_allowed(p_restaurant_id text, p_email text)`
- [188](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L188): `create or replace function public.apply_owner_change(`
- [237](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L237): `-- Capture the old value (also confirms the row belongs to this restaurant).`
- [266](../APP/web/supabase/migrations/0001_owner_portal_foundation.sql#L266): `create or replace function public.get_public_menu(p_restaurant_id text)`

## APP/web/supabase/migrations/0002_change_requests_intake.sql

- [11](../APP/web/supabase/migrations/0002_change_requests_intake.sql#L11): `create or replace function public.submit_change_request(`
- [20](../APP/web/supabase/migrations/0002_change_requests_intake.sql#L20): `p_restaurant_id text default null`
- [38](../APP/web/supabase/migrations/0002_change_requests_intake.sql#L38): `grant execute on function public.submit_change_request(`

## APP/web/supabase/migrations/0003_customer_registry_reads.sql

- [9](../APP/web/supabase/migrations/0003_customer_registry_reads.sql#L9): `create or replace function public.get_customer_registry()`
- [29](../APP/web/supabase/migrations/0003_customer_registry_reads.sql#L29): `create or replace function public.get_customer(p_id text)`

## APP/web/supabase/migrations/0004_admin_gating.sql

- [73](../APP/web/supabase/migrations/0004_admin_gating.sql#L73): `where public.is_current_user_admin()`
- [105](../APP/web/supabase/migrations/0004_admin_gating.sql#L105): `revoke execute on function public.get_customer_registry() from anon;`

## APP/web/supabase/migrations/0006_private_uploads_and_admin.sql

- [17](../APP/web/supabase/migrations/0006_private_uploads_and_admin.sql#L17): `update storage.buckets set public = false where id = 'request-uploads';`
- [33](../APP/web/supabase/migrations/0006_private_uploads_and_admin.sql#L33): `create or replace function public.add_change_request_attachment(`
- [78](../APP/web/supabase/migrations/0006_private_uploads_and_admin.sql#L78): `create or replace function public.get_change_request(p_id uuid)`

## APP/web/supabase/migrations/0008_apply_owner_size_price.sql

- [21](../APP/web/supabase/migrations/0008_apply_owner_size_price.sql#L21): `create or replace function public.apply_owner_size_price(`
- [38](../APP/web/supabase/migrations/0008_apply_owner_size_price.sql#L38): `if not exists (`
- [95](../APP/web/supabase/migrations/0008_apply_owner_size_price.sql#L95): `-- Audit in the same transaction (field name records which size changed).`

## APP/web/supabase/migrations/0011_client_ledger_and_team_access.sql

- [45](../APP/web/supabase/migrations/0011_client_ledger_and_team_access.sql#L45): `create or replace function public.is_current_user_admin()`
- [74](../APP/web/supabase/migrations/0011_client_ledger_and_team_access.sql#L74): `create or replace function public.get_client_ledger()`
- [127](../APP/web/supabase/migrations/0011_client_ledger_and_team_access.sql#L127): `create or replace function public.get_client_account(p_id text)`
- [304](../APP/web/supabase/migrations/0011_client_ledger_and_team_access.sql#L304): `revoke execute on function public.get_customer_registry() from authenticated;`

## APP/web/supabase/proposals/owner_request_queue_v1.sql

- [8](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L8): `create table owner_request_private.settings (`
- [17](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L17): `create table owner_request_private.enrollments (`
- [160](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L160): `create or replace function public.submit_change_request(`
- [186](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L186): `create function public.submit_owner_request_v1(`
- [246](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L246): `create function public.review_owner_request_v1(p_id uuid,p_decision text) returns text`
- [291](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L291): `create function public.execute_owner_request_v1(p_id uuid) returns text`
- [307](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L307): `create function public.verify_owner_request_v1(p_id uuid,p_guest_path text,p_observed_value jsonb,p_evidence text) returns text`
- [328](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L328): `create function public.acknowledge_owner_request_v1(p_id uuid,p_action text) returns text`
- [355](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L355): `create function public.rollback_owner_request_v1(p_id uuid) returns text`
- [370](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L370): `create function public.get_owner_request_v1(p_id uuid) returns jsonb`
- [383](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L383): `create function public.claim_owner_request_notices_v1(p_limit integer) returns jsonb`
- [403](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L403): `create function public.finish_owner_request_notice_v1(p_id uuid,p_lease_token uuid,p_sent boolean,p_error text) returns boolean`

## APP/web/src/lib/owner/queue/client.ts

- [8](../APP/web/src/lib/owner/queue/client.ts#L8): `export function ownerQueueEnabled(env: Record<string, string | undefined> = process.env): boolean {`
- [15](../APP/web/src/lib/owner/queue/client.ts#L15): `export function validateStructuredQueueInput(input: StructuredQueueInput): StructuredQueueInput {`
- [39](../APP/web/src/lib/owner/queue/client.ts#L39): `export async function submitOwnerReviewToQueue(client: QueueClient, input: { restaurantId: string; clientKey: string; brief: string }, env: Record<string, string | undefined> = process.env): Promise<QueueResult> {`
- [44](../APP/web/src/lib/owner/queue/client.ts#L44): `export async function submitStructuredQueueRequest(client: QueueClient, input: StructuredQueueInput, env: Record<string, string | undefined> = process.env): Promise<QueueResult> {`

## APP/web/src/lib/owner/queue/actions.ts

- [7](../APP/web/src/lib/owner/queue/actions.ts#L7): `export async function queueStructuredOwnerRequest(input: StructuredQueueInput): Promise<QueueResult> {`
- [19](../APP/web/src/lib/owner/queue/actions.ts#L19): `export async function acknowledgeQueuedOwnerRequest(restaurantId: string, requestId: string, action: "confirm" | "rollback"): Promise<{ ok: boolean; message: string }> {`

## APP/web/src/lib/owner/queue/sources.ts

- [4](../APP/web/src/lib/owner/queue/sources.ts#L4): `export function ownerQueueSourceAssessment(restaurantId: string) {`

## APP/web/src/lib/owner/queue/notifications.ts

- [23](../APP/web/src/lib/owner/queue/notifications.ts#L23): `export async function deliverOwnerRequestNotice(job: Notice, env: Env, fetcher: typeof fetch = fetch, timeoutMs = 8000): Promise<Delivery> {`
- [41](../APP/web/src/lib/owner/queue/notifications.ts#L41): `export async function drainOwnerRequestNotices(client: QueueClient, env: Env = process.env, fetcher: typeof fetch = fetch, limit = 1) {`

## Authority review read

- [232](../APP/web/supabase/proposals/owner_request_queue_v1.sql#L232): `create function public.get_owner_request_review_v1(p_id uuid) returns jsonb`
