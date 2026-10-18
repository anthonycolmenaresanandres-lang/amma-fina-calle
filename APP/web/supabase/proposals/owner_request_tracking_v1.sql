-- UNAPPLIED PROPOSAL, after owner_request_queue_v1.sql. No intake or execution enabled.
begin;
create index owner_requests_actor_tenant_created on owner_request_private.requests(actor_user_id,restaurant_id,created_at desc,id desc);
create function public.list_owner_requests_v1(p_restaurant_id text,p_before uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cursor_row owner_request_private.requests;result jsonb;next_id uuid;
begin
 perform owner_request_private.owner_identity(p_restaurant_id,auth.uid());
 if p_before is not null then
  select * into cursor_row from owner_request_private.requests where id=p_before and actor_user_id=auth.uid() and restaurant_id=p_restaurant_id;
  if not found then raise exception 'invalid private cursor' using errcode='42501';end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'restaurant_id',r.restaurant_id,'status',r.status,'change_type',r.change_type,'created_at',r.created_at,'reference_id',c.reference_id) order by r.created_at desc,r.id desc),'[]') into result from
 (select * from owner_request_private.requests where actor_user_id=auth.uid() and restaurant_id=p_restaurant_id and (p_before is null or (created_at,id)<(cursor_row.created_at,cursor_row.id)) order by created_at desc,id desc limit 26) r
 join public.change_requests c on c.id=r.id;
 if jsonb_array_length(result)>25 then next_id:=(result->24->>'id')::uuid;result:=result-25;end if;
 return jsonb_build_object('requests',result,'next_cursor',next_id);
end $$;
create or replace function public.get_owner_request_v1(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare q owner_request_private.requests;
begin
 select * into q from owner_request_private.requests where id=p_id and actor_user_id=auth.uid();
 if not found then return null;end if;
 perform owner_request_private.owner_identity(q.restaurant_id,auth.uid());
 return jsonb_build_object('id',q.id,'restaurant_id',q.restaurant_id,'status',q.status,'change_type',q.change_type,'item_id',coalesce(q.source_item_id,q.item_id),'created_at',q.created_at,
 'reference_id',(select reference_id from public.change_requests where id=q.id),
 'item_name',coalesce(q.item_label,(select name from public.menu_items where id=q.item_id and restaurant_id=q.restaurant_id)),
 'before',q.before_value,'after',q.after_value,'owner_acknowledged_at',q.owner_acknowledged_at,
 'events',coalesce((select jsonb_agg(jsonb_build_object('type',e.event_type,'at',e.created_at) order by e.id) from owner_request_private.events e where e.request_id=q.id),'[]'),
 'delivery',coalesce((select jsonb_agg(jsonb_build_object('status',o.status,'attempt',o.attempt,'next_attempt_at',o.next_attempt_at) order by o.event_id) from owner_request_private.outbox o where o.request_id=q.id),'[]'));
end $$;
create function public.get_owner_request_items_v1(p_restaurant_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform owner_request_private.owner_identity(p_restaurant_id,auth.uid());
 return owner_request_private.list_targets(p_restaurant_id);
end $$;
revoke all on function public.list_owner_requests_v1(text,uuid),public.get_owner_request_v1(uuid),public.get_owner_request_items_v1(text) from public,anon,authenticated,service_role;
grant execute on function public.list_owner_requests_v1(text,uuid),public.get_owner_request_v1(uuid),public.get_owner_request_items_v1(text) to authenticated;
commit;
