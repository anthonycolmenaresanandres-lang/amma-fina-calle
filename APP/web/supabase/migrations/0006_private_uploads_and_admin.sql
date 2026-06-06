-- Fina Calle OS — Phase E: lock down intake uploads + add the business admin.
-- Hardens the attachment path from 0005:
--   * request-uploads becomes PRIVATE; customer files are no longer reachable
--     by public URL. The admin inbox reads them via short-lived signed URLs.
--   * the anon write RPC stops trusting a client-supplied public_url and only
--     records bucket + path (validated), closing a stored-link injection vector
--     into the admin inbox.
--   * the detail read RPC returns bucket + path so the app can sign URLs itself.
-- Idempotent; same security-definer + is_current_user_admin() model as 0004–0005.

-- ---------------------------------------------------------------------------
-- 1. Make the bucket private and let only admins read its objects (so the
--    authenticated admin session can mint signed URLs). Anon keeps INSERT only
--    (the public intake uploads); no UPDATE/DELETE is granted to anyone.
-- ---------------------------------------------------------------------------

update storage.buckets set public = false where id = 'request-uploads';

drop policy if exists "admins read request files" on storage.objects;
create policy "admins read request files" on storage.objects
  for select to authenticated
  using (bucket_id = 'request-uploads' and public.is_current_user_admin());

-- ---------------------------------------------------------------------------
-- 2. Harden the write RPC: drop the public_url parameter, validate the bucket,
--    and store public_url as NULL going forward. Replaces the 0005 7-arg form.
-- ---------------------------------------------------------------------------

drop function if exists public.add_change_request_attachment(
  text, text, text, text, text, text, bigint
);

create or replace function public.add_change_request_attachment(
  p_reference_id text,
  p_bucket       text,
  p_path         text,
  p_file_name    text,
  p_content_type text,
  p_byte_size    bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
begin
  -- Only the intake bucket may be referenced; reject anything else.
  if p_bucket is distinct from 'request-uploads' then
    raise exception 'invalid bucket' using errcode = '22023';
  end if;

  select id into v_request_id
  from public.change_requests
  where reference_id = p_reference_id
  order by created_at desc
  limit 1;

  insert into public.change_request_attachments (
    request_id, reference_id, bucket, path, public_url,
    file_name, content_type, byte_size
  ) values (
    v_request_id, p_reference_id, p_bucket, p_path, null,
    p_file_name, p_content_type, p_byte_size
  );
end;
$$;

grant execute on function public.add_change_request_attachment(
  text, text, text, text, text, bigint
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Detail read returns bucket + path (not public_url) so the app signs URLs.
-- ---------------------------------------------------------------------------

create or replace function public.get_change_request(p_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not public.is_current_user_admin() then null
    else json_build_object(
      'id', cr.id,
      'reference_id', cr.reference_id,
      'business_name', cr.business_name,
      'contact_name', cr.contact_name,
      'contact_info', cr.contact_info,
      'request_type', cr.request_type,
      'priority', cr.priority,
      'status', cr.status,
      'message', cr.message,
      'source_page', cr.source_page,
      'created_at', cr.created_at,
      'attachments', coalesce((
        select json_agg(json_build_object(
          'id', at.id,
          'file_name', at.file_name,
          'bucket', at.bucket,
          'path', at.path,
          'content_type', at.content_type,
          'byte_size', at.byte_size,
          'created_at', at.created_at
        ) order by at.created_at)
        from public.change_request_attachments at
        where at.reference_id = cr.reference_id
      ), '[]'::json)
    )
  end
  from (select * from public.change_requests where id = p_id) cr;
$$;

revoke execute on function public.get_change_request(uuid) from anon;
grant execute on function public.get_change_request(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Add the AMMA Ventures business email as an admin (additive — the existing
--    admin from 0004 keeps access).
-- ---------------------------------------------------------------------------

insert into public.admin_emails (email)
values ('ammaventuresvb@gmail.com')
on conflict (email) do nothing;
