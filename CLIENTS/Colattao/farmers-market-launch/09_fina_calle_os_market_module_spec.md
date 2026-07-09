# Fina Calle OS Market Module Spec

Status: technical spec only. Do not implement until Anthony resolves current production queue and migration numbering. Existing queue reserves next migration `0009` for game standardization.

## Product Goal

Add a Bazaar / Community Market module to Fina Calle OS so Anthony can manage the Colattao Community Market through the same software business that supports QR menus, customer requests, owner workflows, and local-business operations. The first use case is a small arts-and-crafts bazaar in the yellow parking-space patch; the long-term use case is a scalable coffee fest / coffee expo operating system.

## Proposed Routes

Admin/internal:

- `/customers/markets` - list markets and approval status.
- `/customers/markets/[id]` - market dashboard.
- `/customers/markets/[id]/vendors` - vendor applications and approvals.
- `/customers/markets/[id]/layout` - booth assignments and site map links.
- `/customers/markets/[id]/approvals` - landlord/city/fire/health/tenant evidence log.

Public:

- `/market/vendor-application` - vendor application form.
- `/market/[marketId]` - QR vendor directory.
- `/market/[marketId]/check-in` - market-day vendor check-in, protected by private/admin link.

## Data Model Draft

Use Supabase RLS and security-definer RPC patterns already used in the app.

Tables:

- `markets`
  - id
  - restaurant_id
  - name
  - property_address
  - status
  - proposed_date
  - rain_date
  - public_announcement_allowed
  - notes
- `market_events`
  - id
  - market_id
  - event_date
  - start_time
  - end_time
  - vendor_capacity
  - status
- `market_vendors`
  - id
  - market_id
  - business_name
  - contact_name
  - email
  - phone
  - category
  - products
  - food_vendor
  - prepared_food_method
  - status
  - booth_type
  - fee
- `vendor_documents`
  - id
  - vendor_id
  - document_type
  - file_url
  - status
- `booth_assignments`
  - id
  - event_id
  - vendor_id
  - zone
  - booth_number
  - load_in_time
- `approval_evidence`
  - id
  - market_id
  - contact_name
  - business_or_department
  - approval_group
  - approval_status
  - date_contacted
  - follow_up_needed
  - notes
- `market_risks`
  - id
  - market_id
  - risk
  - likelihood
  - impact
  - mitigation
  - owner
  - status
- `market_checkins`
  - id
  - event_id
  - vendor_id
  - checked_in_at
  - checked_in_by
  - notes

## Permissions

- Anthony/admin can manage all markets through `/customers`.
- Future restaurant owner access can be scoped by `restaurant_id`.
- Public vendor application can submit through a security-definer RPC, similar to customer request intake.
- Public QR directory returns approved vendors only.
- No public date display unless `public_announcement_allowed = true`.
- The software should distinguish yellow-zone bazaar vendors from inside approved tenants and separately approved food trucks.

## Minimum Useful Version

1. Static admin market dashboard for one Colattao market.
2. Public vendor application form.
3. Vendor list with statuses.
4. Approval evidence log.
5. QR vendor directory for approved vendors.
6. Market-day check-in.
7. Future coffee fest/expo mode for larger venues and regional coffee shops.

## Implementation Notes

- Do not touch `/m/[id]`, `/owner-preview`, `/conquest`, payment logic, auth allowlists, production env vars, or live Supabase without explicit approval.
- Use existing App Router patterns in `APP/web`.
- Reuse existing UI primitives from `APP/web/src/components/ui.tsx`.
- Keep database migration number after current queue resolution. If game standardization uses `0009`, this module should start at `0010`.
- Do not process booth payments in v1 unless Anthony approves Stripe/payment work.
