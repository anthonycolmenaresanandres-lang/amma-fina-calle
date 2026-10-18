import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(process.env.OWNER_QUEUE_TEST_RUNTIME || import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let checks=0;
const check=(value,expected,label)=>{assert.deepEqual(value,expected,label);checks++;console.log(`PASS ${label}`)};
const rejected=async(p,label)=>{await assert.rejects(p);checks++;console.log(`PASS ${label}`)};
async function role(name='postgres',user=null,email='') {
  await db.exec('reset role'); if(name!=='postgres') await db.exec(`set role ${name}`);
  await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:user,email})]);
}
const owner=()=>role('authenticated',uid(1),'owner-a@example.test');
const authority=()=>role('authenticated',uid(3),'authority@example.test');
const worker=()=>role('service_role');
async function submit(n,{tenant='test-a',type='availability',item=uid(11),version=0,after=false,brief='Owner confirmed exact change',confirmed=true}={}) {
  return (await db.query('select public.submit_owner_request_v1($1,$2,$3,$4,$5,$6::jsonb,$7,$8) result',[tenant,uid(1000+n),type,item,version,after===null?null:JSON.stringify(after),brief,confirmed])).rows[0].result;
}
async function exec(id) {return(await db.query('select public.execute_owner_request_v1($1) result',[id])).rows[0].result;}
async function review(id,decision='approve'){return(await db.query('select public.review_owner_request_v1($1,$2) result',[id,decision])).rows[0].result;}
async function ack(id,action='confirm'){return(await db.query('select public.acknowledge_owner_request_v1($1,$2) result',[id,action])).rows[0].result;}
async function verify(id,value=false,path='/m/test-a'){return(await db.query('select public.verify_owner_request_v1($1,$2,$3::jsonb,$4) result',[id,path,JSON.stringify(value),'Synthetic source readback'])).rows[0].result;}
async function state(id){return(await db.query('select public.get_owner_request_v1($1) result',[id])).rows[0].result;}
async function seedItem(n=11){await role(); await db.query('insert into public.menu_items(id,category_id,restaurant_id,name,price,sort_order) values($1,$2,$3,$4,7,$5)',[uid(n),uid(21),'test-a',`Synthetic item ${n}`,n]);}
async function enroll(tenant='test-a',actor=uid(1)) {
 await role();await db.query(`insert into owner_request_private.enrollments(restaurant_id,owner_user_id,policy_version,allowed_types,authority_approval_reference,owner_consented_at,expires_at,source_kind,guest_path,source_verified_at,source_evidence)
 values($1,$2,'test-policy-v1',array['availability','display_order'],'SYNTHETIC APPROVAL',now(),now()+interval '1 day','supabase_public_menu_v1',$3,now(),'SYNTHETIC source proof') on conflict do nothing`,[tenant,actor,`/m/${tenant}`]);
}
try {
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb not null default '{}');
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 create function auth.uid() returns uuid language sql stable as $$select nullif(auth.jwt()->>'sub','')::uuid$$;
 grant usage on schema public,auth to anon,authenticated,service_role;`);
 for(const file of ['0001_owner_portal_foundation','0002_change_requests_intake','0004_admin_gating']) await db.exec(await readFile(new URL(`../supabase/migrations/${file}.sql`,import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/proposals/owner_request_queue_v1.sql',import.meta.url),'utf8'));
 await db.query(`insert into auth.users(id,email,email_confirmed_at) values($1,'owner-a@example.test',now()),($2,'owner-b@example.test',now()),($3,'authority@example.test',now()),($4,'staff@example.test',now())`,[uid(1),uid(2),uid(3),uid(4)]);
 await db.exec(`insert into public.restaurants(id,business_name) values('test-a','Synthetic A'),('test-b','Synthetic B'),('bodega','Synthetic static');
 insert into public.owner_emails(restaurant_id,email) values('test-a','owner-a@example.test'),('test-b','owner-b@example.test'),('bodega','owner-a@example.test');
 insert into public.admin_emails(email) values('authority@example.test'),('staff@example.test');
 update owner_request_private.settings set authority_email='authority@example.test';`);
 await db.query('insert into public.menu_categories(id,restaurant_id,name) values($1,\'test-a\',\'Synthetic\')',[uid(21)]);
 await seedItem();
 check((await db.query('select enabled,execution_enabled,notifications_enabled from owner_request_private.settings')).rows[0],{enabled:false,execution_enabled:false,notifications_enabled:false},'all gates default off');
 check((await db.query('select count(*)::int n from owner_request_private.enrollments')).rows[0].n,0,'no tenants enrolled');
 await owner(); await rejected(submit(1),'queue disabled at database even with authenticated owner');
 await role('anon');
 const legacy=tenant=>db.query('select public.submit_change_request($1,$2,$3,$4,$5,$6,$7,$8,$9)',['Claimed B','Spoofed','spoof@example.test','Menu/content update','Normal','Synthetic brief','/owner/test-b','AMMA-SYNTHETIC',tenant]);
 await rejected(legacy('test-b'),'anonymous caller cannot claim a tenant');
 await legacy(null); await role();
 check((await db.query("select restaurant_id,actor_user_id,attribution_kind from public.change_requests where reference_id='AMMA-SYNTHETIC'")).rows[0],{restaurant_id:null,actor_user_id:null,attribution_kind:'public_unverified'},'public inquiry remains tenantless and unverified');
 await owner(); await rejected(legacy('test-b'),'owner A cannot claim tenant B');await legacy('test-a');await role();
 check((await db.query("select business_name,contact_info,actor_user_id,attribution_kind from public.change_requests where attribution_kind='owner_verified'")).rows[0],{business_name:'Synthetic A',contact_info:'owner-a@example.test',actor_user_id:uid(1),attribution_kind:'owner_verified'},'legacy owner attribution derived from Auth and tenant registry');
 await db.query('update auth.users set email_confirmed_at=null where id=$1',[uid(1)]); await owner(); await rejected(legacy('test-a'),'unconfirmed Auth email cannot submit'); await role();
 await db.query("update auth.users set email_confirmed_at=now(),raw_app_meta_data='{\"owner_password_reset_required\":true}' where id=$1",[uid(1)]);await owner();await rejected(legacy('test-a'),'password-reset-required user blocked at RPC');await role();
 await db.query("update auth.users set raw_app_meta_data='{}' where id=$1",[uid(1)]);
 await db.exec("update owner_request_private.settings set enabled=true,intake_tenants=array['test-a','test-b','bodega'],execution_tenants=array['test-a','test-b','bodega']");await owner();
 for(const [name,opts] of [['wrong tenant',{tenant:'test-b'}],['unknown type',{type:'price'}],['missing confirmation',{confirmed:false}],['wrong item',{item:uid(99)}],['stale version',{version:9}],['bad boolean',{after:'false'}],['negative order',{type:'display_order',after:-1}],['excess order',{type:'display_order',after:10001}],['empty brief',{brief:''}]]) await rejected(submit(2,opts),`invalid request rejected: ${name}`);
 const first=await submit(3); check(first.status,'queued','structured request saved');
 check((await submit(3)).id,first.id,'retry returns same request id'); await rejected(submit(3,{brief:'Different brief'}),'idempotency key cannot change payload');
 await role();check((await db.query('select count(*)::int n from owner_request_private.events where request_id=$1',[first.id])).rows[0].n,1,'save/retry emits one event');
 check((await db.query('select count(*)::int n from owner_request_private.outbox where request_id=$1',[first.id])).rows[0].n,1,'save/retry emits one durable notification');
 for(const r of ['anon','authenticated','service_role']){await role(r,uid(1),'owner-a@example.test');await rejected(db.query('select * from owner_request_private.requests'),`${r} cannot select private queue`)}
 for(const r of ['anon','authenticated']){await role(r,uid(1),'owner-a@example.test');await rejected(exec(first.id),`${r} cannot invoke executor`);}
 await role('authenticated',uid(2),'owner-b@example.test');check(await state(first.id),null,'owner B cannot read owner A request');await rejected(ack(first.id),'owner B cannot confirm owner A request');
 await owner();await rejected(review(first.id),'owner cannot grant execution approval');await role('authenticated',uid(4),'staff@example.test');await rejected(review(first.id),'non-authority admin cannot approve');
 await owner();await rejected(db.query('select public.get_owner_request_review_v1($1)',[first.id]),'owner cannot read authority review payload');
 await role('authenticated',uid(4),'staff@example.test');await rejected(db.query('select public.get_owner_request_review_v1($1)',[first.id]),'other admins cannot read authority review payload');
 await authority();const reviewView=(await db.query('select public.get_owner_request_review_v1($1) result',[first.id])).rows[0].result;check({tenant:reviewView.restaurant_id,actor:reviewView.actor_user_id,before:reviewView.before,after:reviewView.after},{tenant:'test-a',actor:uid(1),before:true,after:false},'authority can inspect authenticated typed before/after before approval');
 await authority();await rejected(review(first.id),'authority cannot approve unenrolled tenant');
 await enroll();await authority();check(await review(first.id),'ready','authority approval binds enrolled policy');
 await worker();await rejected(exec(first.id),'execution gate remains off after approval');await role();await db.exec('update owner_request_private.settings set execution_enabled=true');
 // A separately queued request of the same version must conflict after the first applies.
 await owner();const competing=await submit(4);await authority();await review(competing.id);await worker();
 check(await exec(first.id),'awaiting_verification','bounded apply waits for real source verification');
 check(await exec(first.id),'awaiting_verification','replayed execute is idempotent');
 check(await exec(competing.id),'conflict','second request of old revision cannot overwrite');
 await role();check((await db.query('select is_available,owner_request_version from public.menu_items where id=$1',[uid(11)])).rows[0],{is_available:false,owner_request_version:1},'one atomic row/version update');
 check((await db.query('select count(*)::int n from public.audit_log where request_id=$1',[first.id])).rows[0].n,1,'one request-linked audit entry');
 await owner();await rejected(ack(first.id),'owner cannot complete before source verification');await worker();
 await rejected(verify(first.id,false,'/m/test-b'),'wrong guest destination cannot verify');check(await verify(first.id,true),'verification_pending','mismatched public observation stays pending');check(await verify(first.id),'awaiting_owner_ack','matching source proof waits for owner');
 await owner();check(await ack(first.id),'completed','original owner confirms completion');check(await ack(first.id),'completed','owner confirmation replay is idempotent');
 check(await ack(first.id,'rollback'),'rollback_requested','owner can request inverse change');await worker();
 check((await db.query('select public.rollback_owner_request_v1($1) result',[first.id])).rows[0].result,'rolled_back_pending_verification','rollback restores exact before value but needs readback');
 check((await db.query('select public.rollback_owner_request_v1($1) result',[first.id])).rows[0].result,'rolled_back_pending_verification','rollback replay cannot repeat write');
 check(await verify(first.id,true),'rolled_back','rollback source readback recorded');await owner();check(await ack(first.id),'rolled_back','owner can acknowledge rolled back result');
 // Every intervening legacy edit bumps revision, even when it changes another field.
 await seedItem(12);await owner();const stale=await submit(5,{item:uid(12)});await authority();await review(stale.id);await role();await db.query("update public.menu_items set description='Legacy edit' where id=$1",[uid(12)]);await worker();check(await exec(stale.id),'conflict','legacy content edits invalidate queued version');
 // A later edit must prevent automatic rollback from clobbering it.
 await seedItem(13);await owner();const rollbackConflict=await submit(6,{item:uid(13)});await authority();await review(rollbackConflict.id);await worker();await exec(rollbackConflict.id);await owner();await ack(rollbackConflict.id,'rollback');await role();await db.query("update public.menu_items set name='Later owner edit' where id=$1",[uid(13)]);await worker();check((await db.query('select public.rollback_owner_request_v1($1) result',[rollbackConflict.id])).rows[0].result,'rollback_conflict','rollback refuses later owner revision');
 await owner();const typo=await submit(7,{type:'name_typo',after:'Corrected name',version:2});check(typo.status,'needs_review','typos remain review-only');await authority();await rejected(review(typo.id),'typo cannot become executable under initial policy');
 await owner();const free=await submit(8,{type:'review',item:null,version:null,after:null});check(free.status,'needs_review','free text is data for review only');await authority();await rejected(review(free.id),'free text cannot execute');
 // Ensure a failed audit append rolls back both the content and revision write.
 await seedItem(14);await owner();const atomic=await submit(9,{item:uid(14)});await authority();await review(atomic.id);await role();
 await db.exec("create function public.test_fail_audit() returns trigger language plpgsql as $$begin raise exception 'synthetic audit failure';end$$;create trigger test_fail before insert on public.audit_log for each row execute function public.test_fail_audit();");
 await worker();await rejected(exec(atomic.id),'audit failure aborts apply transaction');await role();check((await db.query('select is_available,owner_request_version from public.menu_items where id=$1',[uid(14)])).rows[0],{is_available:true,owner_request_version:0},'failed audit leaves content and revision unchanged');await db.exec('drop trigger test_fail on public.audit_log;drop function public.test_fail_audit();');
 // Revocation and changed policy are evaluated again at execution, not only submission.
 await db.exec("update owner_request_private.enrollments set revoked_at=now() where restaurant_id='test-a'");await worker();await rejected(exec(atomic.id),'revoked enrollment prevents approved execution');await role();await db.exec("update owner_request_private.enrollments set revoked_at=null,policy_version='test-policy-v2' where restaurant_id='test-a'");await worker();await rejected(exec(atomic.id),'policy change invalidates old approval');await role();await db.exec("update owner_request_private.enrollments set policy_version='test-policy-v1'");
 await db.exec("delete from public.owner_emails where restaurant_id='test-a'");await worker();await rejected(exec(atomic.id),'removed owner cannot execute existing approved request');await role();await db.exec("insert into public.owner_emails(restaurant_id,email) values('test-a','owner-a@example.test')");
 // Additional source, bounded order, expiry and transactional outbox checks.
 await seedItem(16);await owner();const order=await submit(10,{item:uid(16),type:'display_order',after:100});await authority();await review(order.id);await worker();check(await exec(order.id),'awaiting_verification','single item order can use the approved bounded rail');
 await role();check((await db.query('select sort_order from public.menu_items where id=$1',[uid(16)])).rows[0].sort_order,100,'order updates only the requested position value');await worker();check(await verify(order.id,100),'awaiting_owner_ack','order requires matching public source proof');
 await seedItem(17);await owner();const collision=await submit(11,{item:uid(17),type:'display_order',after:12});await authority();await review(collision.id);await worker();check(await exec(collision.id),'conflict','occupied position is a conflict, not an implicit bulk reorder');
 await role();await db.query("insert into public.menu_categories(id,restaurant_id,name) values($1,'bodega','Static source')",[uid(25)]);await db.query("insert into public.menu_items(id,category_id,restaurant_id,name) values($1,$2,'bodega','Static item')",[uid(18),uid(25)]);await enroll('bodega');await owner();const staticRequest=await submit(12,{tenant:'bodega',item:uid(18)});await authority();await rejected(review(staticRequest.id),'static menu tenant cannot become executable through enrollment alone');
 await role();await db.exec("update owner_request_private.enrollments set expires_at=now()-interval '1 second' where restaurant_id='test-a'");await worker();await rejected(exec(atomic.id),'expired enrollment prevents execution');await role();await db.exec("update owner_request_private.enrollments set expires_at=now()+interval '1 day' where restaurant_id='test-a'");
 const countBefore=(await db.query("select count(*)::int n from public.change_requests where attribution_kind='owner_queue'")).rows[0].n;
 await db.exec("create function public.test_fail_outbox() returns trigger language plpgsql as $$begin raise exception 'synthetic outbox failure';end$$;create trigger test_fail before insert on owner_request_private.outbox for each row execute function public.test_fail_outbox();");
 await owner();await rejected(submit(13,{type:'review',item:null,version:null,after:null}),'outbox failure aborts request transaction');await role();check((await db.query("select count(*)::int n from public.change_requests where attribution_kind='owner_queue'")).rows[0].n,countBefore,'failed outbox leaves no false public receipt');await db.exec('drop trigger test_fail on owner_request_private.outbox;drop function public.test_fail_outbox();');
 await seedItem(19);await owner();const completionRace=await submit(14,{item:uid(19)});await authority();await review(completionRace.id);await worker();await exec(completionRace.id);await verify(completionRace.id);await role();await db.query("update public.menu_items set description='Changed after public readback' where id=$1",[uid(19)]);await owner();check(await ack(completionRace.id),'completion_conflict','completion cannot acknowledge an intervening edit');
 // Outbox lease fencing, crash recovery, bounded retries and global pause.
 await worker();await rejected(db.query('select public.claim_owner_request_notices_v1(1)'),'notification gate defaults off');await role();await db.exec("update owner_request_private.settings set notifications_enabled=true,notification_tenants=array['test-a','test-b','bodega']");await worker();await rejected(db.query('select public.claim_owner_request_notices_v1(11)'),'notification batches are bounded');
 await role();await db.exec("update owner_request_private.settings set notification_tenants=array['unselected-tenant']");const untouchedNotices=(await db.query('select id,status,attempt from owner_request_private.outbox order by id')).rows;await worker();check((await db.query('select public.claim_owner_request_notices_v1(1) jobs')).rows[0].jobs,[],'unselected tenant notices cannot be claimed');await role();check((await db.query('select id,status,attempt from owner_request_private.outbox order by id')).rows,untouchedNotices,'unselected tenant outbox remains unchanged');await db.exec("update owner_request_private.settings set notification_tenants=array['test-a','test-b','bodega']");await worker();
 const claim=async()=> (await db.query('select public.claim_owner_request_notices_v1(1) jobs')).rows[0].jobs;
 let job=(await claim())[0];assert.ok(job);checks++;
 const finish=(j,sent,error=null)=>db.query('select public.finish_owner_request_notice_v1($1,$2,$3,$4) ok',[j.id,j.lease_token,sent,error]);
 check((await finish({...job,lease_token:uid(999)},true)).rows[0].ok,false,'wrong lease token cannot acknowledge');
 await role();await db.query("update owner_request_private.outbox set lease_expires_at=now()-interval '1 second' where id=$1",[job.id]);await worker();check((await finish(job,true)).rows[0].ok,false,'expired worker cannot acknowledge');
 const replacement=(await claim())[0];check(replacement.id,job.id,'expired lease is reclaimed');assert.notEqual(replacement.lease_token,job.lease_token);checks++;
 check((await finish(replacement,false,'timeout')).rows[0].ok,true,'timeout becomes durable retry');
 await role();check((await db.query('select status,attempt from owner_request_private.outbox where id=$1',[job.id])).rows[0],{status:'retry_wait',attempt:2},'attempt count survives retry');
 await db.query("update owner_request_private.outbox set attempt=5,next_attempt_at=now()-interval '1 day' where id=$1",[job.id]);await worker();job=(await claim())[0];check(job.attempt,6,'last attempt is bounded');await finish(job,false,'provider_5xx');await role();check((await db.query('select status from owner_request_private.outbox where id=$1',[job.id])).rows[0].status,'dead_letter','six failures stop retries');
 await worker();job=(await claim())[0];await rejected(finish(job,false,'raw customer secret'),'error storage accepts fixed categories only');check((await finish(job,true)).rows[0].ok,true,'successful delivery recorded');check((await finish(job,true)).rows[0].ok,false,'delivery ack replay fenced');
 await role();const expiredNotice=(await db.query("select id from owner_request_private.outbox where status='pending' limit 1")).rows[0].id;await db.query("update owner_request_private.outbox set attempt=1,status='retry_wait',first_attempt_at=now()-interval '25 hours',next_attempt_at=now()-interval '1 hour' where id=$1",[expiredNotice]);await worker();await claim();await role();check((await db.query('select status,error_category from owner_request_private.outbox where id=$1',[expiredNotice])).rows[0],{status:'dead_letter',error_category:'retry_window_expired'},'retry stops before provider idempotency retention expires');
 await role();await db.exec('update owner_request_private.settings set notifications_enabled=false');await worker();await rejected(claim(),'notification pause blocks fresh claims');
 // All private tables have RLS; all sensitive entry points lose PUBLIC/anon execution.
 await role();check((await db.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='owner_request_private' and c.relkind='r' and c.relrowsecurity")).rows[0].n,5,'all five private tables have RLS');
 check((await db.query("select has_function_privilege('anon','public.execute_owner_request_v1(uuid)','execute') allowed")).rows[0].allowed,false,'anon cannot inherit executor execute via PUBLIC');
 check((await db.query("select has_function_privilege('authenticated','public.execute_owner_request_v1(uuid)','execute') allowed")).rows[0].allowed,false,'owners cannot inherit executor capability');
 await db.exec('delete from owner_request_private.settings');await owner();await rejected(submit(99),'missing settings fail closed');await worker();await rejected(exec(atomic.id),'missing settings cannot bypass execution kill switch');
 console.log(`${checks} queue SQL checks passed. Synthetic in-memory only. PGlite serializes one connection; live concurrent-role testing remains required.`);
} catch(error) { console.error("QUEUE TEST FAILURE", error.message, error.code, error.position, error.where); process.exitCode=1; } finally {await db.close();}
