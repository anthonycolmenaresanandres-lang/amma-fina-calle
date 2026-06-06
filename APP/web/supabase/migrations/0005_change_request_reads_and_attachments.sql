-- Fina Calle OS — Phase D: read the request inbox + persist intake attachments.
-- Completes the customer-interface loop. The public intake (0002) writes
-- change_requests via a security-definer RPC; here we add (1) an attachments
-- table + write RPC so the public intake can store uploaded files, and (2)
-- admin-only read RPCs so /customers/requests can list and open submitted
-- requests. RLS stays locked: no table gets a direct INSERT/SELECT policy;
-- every path goes through a security-definer function, exactly like 0002–0004.

-- ---------------------------------------------------------------------------
-- 1. Attachments table — one row per stored intake file, linked by the same
--    human reference_id the intake API generates (and by request_id when the
--    parent row resolves). RLS on, no policies: RPC-only access.
-- ---------------------------------------------------------------------------

create table if not exists public.change_request_attachments (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid references public.change_requests(id) on delete cascade,
  reference_id  text,
  bucket        text not null,
  path          text not null,
  public_url    text,
  file_name     text,
  content_type  text,
  byte_size     bigint,
  created_at    timestamptz not null default now()
);

create index if not exists idx_cra_reference on public.change_request_attachments(reference_id);
create index if not exists idx_cra_request on public.change_request_attachments(request_id);

alter table public.change_request_attachments enable row level security;
-- Intentionally no policies: only the security-definer RPCs below touch this.

-- ---------------------------------------------------------------------------
-- 2. Write RPC — records one stored attachment. Callable by anon because the
--    public intake API uses the anon client (same trust model as
--    submit_change_request in 0002). It only inserts metadata; the file bytes
--    are already in Storage by the time this runs.
-- ---------------------------------------------------------------------------

create or replace function public.add_change_request_attachment(
  p_reference_id text,
  p_bucket       text,
  p_path         text,
  p_public_url   text,
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
  -- Best-effort link to the parent request by its reference_id.
  select id into v_request_id
  from public.change_requests
  where reference_id = p_reference_id
  order by created_at desc
  limit 1;

  insert into public.change_request_attachments (
    request_id, reference_id, bucket, path, public_url,
    file_name, content_type, byte_size
  ) values (
    v_request_id, p_reference_id, p_bucket, p_path, p_public_url,
    p_file_name, p_content_type, p_byte_size
  );
end;
$$;

grant execute on function public.add_change_request_attachment(
  text, text, text, text, text, text, bigint
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Admin read — list view. Mirrors the get_customer_registry gating (0004):
--    fails closed (zero rows) for non-admins, anon execute revoked below.
-- ---------------------------------------------------------------------------

create or replace function public.get_change_requests()
returns table (
  id               uuid,
  reference_id     text,
  business_name    text,
  contact_name     text,
  contact_info     text,
  request_type     text,
  priority         text,
  status           text,
  source_page      text,
  created_at       timestamptz,
  attachment_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select cr.id, cr.reference_id, cr.business_name, cr.contact_name, cr.contact_info,
         cr.request_type, cr.priority, cr.status, cr.source_page, cr.created_at,
         coalesce(a.cnt, 0) as attachment_count
  from public.change_requests cr
  left join (
    select reference_id, count(*) as cnt
    from public.change_request_attachments
    group by reference_id
  ) a on a.reference_id = cr.reference_id
  where public.is_current_user_admin()
  order by cr.created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- 4. Admin read — detail view. Returns the full request plus its attachments
--    as JSON. Non-admins and unknown ids get null.
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
          'public_url', at.public_url,
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

-- Grants — anon may not read the inbox; only authenticated admins.
revoke execute on function public.get_change_requests() from anon;
revoke execute on function public.get_change_request(uuid) from anon;
grant execute on function public.get_change_requests() to authenticated;
grant execute on function public.get_change_request(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage bucket for intake uploads. Public-read (same model as the menu
--    image bucket: unguessable keys, served by public URL) so the admin inbox
--    can render attachments without signed-URL plumbing. Anon may INSERT
--    (the intake API uploads with the anon client); no UPDATE/DELETE granted.
--    NOTE: if these files are ever treated as sensitive, switch the bucket to
--    private and move the inbox to signed URLs.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('request-uploads', 'request-uploads', true)
on conflict (id) do nothing;

drop policy if exists "intake can upload request files" on storage.objects;
create policy "intake can upload request files" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'request-uploads');
