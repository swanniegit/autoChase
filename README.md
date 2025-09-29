AutoChase – Automatic Invoice Reminders

Overview
- Next.js + React + Tailwind (TypeScript) app scaffold for a micro‑SaaS that sends polite, scheduled payment reminders.
- MVP pages: Landing (/autochase), Dashboard (/autochase/dashboard), Settings (/autochase/settings).

Getting Started
- Install: npm install
- Dev: npm run dev (http://localhost:3000)
- Build: npm run build
- Start: npm start

Structure
- pages/: routes (_app.tsx, /, /autochase/*)
- components/: layout and minimal UI primitives
- styles/: Tailwind globals

Roadmap
- Email OAuth integration (Gmail/Outlook)
- Stripe/PayPal payment link injectors
- Rule engine + sending scheduler

PayFast Setup (Sandbox or Live)
- Create a PayFast account and get your Merchant ID, Merchant Key, and optional Passphrase.
- Use server-side env vars (do not expose secrets to client):
  - `PAYFAST_MERCHANT_ID=...`
  - `PAYFAST_MERCHANT_KEY=...`
  - `PAYFAST_PASSPHRASE=...`
  - `PAYFAST_SANDBOX=true`
  - `PAYFAST_IPS=196.33.227.,41.74.179.,197.97.145.` (optional allowlist prefixes)
- Start dev server and open `/autochase/checkout` to test.
- `notify_url` endpoint: `/api/payfast/notify` implements:
  - Signature verification (server-side passphrase)
  - Post-back validation to PayFast validate endpoint
  - Optional IP allowlist via `PAYFAST_IPS`
  - On COMPLETE, sets `plan` in Supabase `ac_settings`

Supabase Setup
- Create a Supabase project.
- Run the SQL in `supabase/schema.sql` in the SQL editor to create tables.
- In Vercel (or `.env.local` for local dev) add:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE=...` (server-side only)
  - `AC_WORKSPACE_ID=default` (or any identifier to partition data)
- When these env vars are present, the app uses Supabase via Next.js API routes; otherwise it falls back to localStorage.

Deploy to Vercel
- Push this repo to GitHub and import into Vercel.
- Set the following Environment Variables in Vercel Project Settings:
  - PayFast: `NEXT_PUBLIC_PAYFAST_MERCHANT_ID`, `NEXT_PUBLIC_PAYFAST_MERCHANT_KEY`, `NEXT_PUBLIC_PAYFAST_PASSPHRASE`, `NEXT_PUBLIC_PAYFAST_SANDBOX`
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `AC_WORKSPACE_ID`
- Framework Preset: Next.js (default). Build command `npm run build`, Output `.next`.
- After deploy, visit `/autochase/checkout` for subscription and `/autochase` for the app.
