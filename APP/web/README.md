This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Internal Admin Gate

The `/customers` and `/customers/[id]` routes are internal account surfaces. They require a valid Supabase Auth session and an email listed in:

```bash
INTERNAL_ADMIN_EMAILS=anthony@example.com,other@example.com
```

Required Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If these variables are missing, `/customers` fails closed by redirecting to `/`. Public routes remain public.

## Owner Billing

The `/owner/[id]` dashboard shows live balance and opens Stripe-hosted payment flows when these server-side variables are set:

```bash
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_endpoint
STRIPE_FINACALLE_OS_PRICE_ID=price_monthly_plan
STRIPE_COLATTAO_CUSTOMER_ID=cus_colattao
COLATTAO_BILLING_EMAIL=owner@example.com
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

Restaurant-specific keys use the restaurant id uppercased, for example `STRIPE_COLATTAO_CUSTOMER_ID` for `/owner/colattao`. Payments stay on Stripe-hosted Checkout, invoice, or Customer Portal pages; the app never collects card or bank details.

Run `supabase/migrations/0007_owner_billing_webhooks.sql` before enabling the Stripe webhook. The webhook endpoint is:

```bash
POST /api/stripe/webhook
```

Configure these Stripe events at minimum: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.finalized`, `invoice.updated`, `invoice.paid`, `invoice.payment_succeeded`, and `invoice.payment_failed`. The route verifies Stripe signatures, records each Stripe event once, and updates local billing state through one Supabase RPC.

## Owner Request AI

The `/owner/[id]` Request Desk uses the safe deterministic edit rail first. If `OPENAI_API_KEY` is present, review replies are polished with the OpenAI API before they are shown or sent to the team.

```bash
OPENAI_API_KEY=sk...
OWNER_REQUEST_AI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

`OWNER_REQUEST_AI_MODEL` and `OPENAI_BASE_URL` are optional. If the key is missing or the API call fails, the Request Desk keeps working with the deterministic fallback.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
