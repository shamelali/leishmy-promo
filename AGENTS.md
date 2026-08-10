# AGENTS.md — Leish! (leish.my)

## Quick Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Preview (build + start) | `pnpm preview` |
| Setup (install + DB push + seed) | `pnpm setup` |
| Typecheck | `pnpm typecheck` (tsc --noEmit) |
| Lint | `pnpm lint` |
| Lint fix | `pnpm lint:fix` |
| Full check | `pnpm check` (typecheck + lint) |
| E2E tests | `pnpm test:e2e` |
| Fresh dev (reset DB) | `pnpm dev:fresh` |
| DB generate | `pnpm db:generate` |
| DB push | `pnpm db:push` |
| DB migrate | `pnpm db:migrate` |
| DB seed | `pnpm db:seed` |
| DB studio | `pnpm db:studio` |
| Verify Cloudinary sign | `npx tsx scripts/verify-sign.ts` |

**Always run `pnpm check` before committing.** TypeScript and ESLint must pass.

## No i18n — Browser Translation Only

This project does NOT use `next-intl` or any server-side i18n framework. The `next-intl` multi-language module was intentionally removed (commit `b2edee0` "Remove next-intl multi-language module, use browser translation instead"). Do NOT add `next-intl`, `i18n/`, or any locale files back. There is no `src/i18n/`, no `src/locales/`, no `LanguageSwitcher.tsx`, no `useTranslations`, no `NextIntlClientProvider`. If you need multi-language support, use browser-based translation (Google Translate widget etc.).

## Architecture

### Stack
- **Framework**: Next.js 16.2.12 (App Router, Turbopack)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Package manager**: pnpm 11.15.1
- **Database**: Neon (serverless Postgres) + Drizzle ORM 0.45.2
- **Auth**: `@neondatabase/auth` (Neon Auth / Better Auth)
- **Payments**: Billplz (Malaysian payment gateway)
- **Email**: Brevo (`@getbrevo/brevo`)
- **Storage**: Cloudinary (images)
- **Styling**: Tailwind CSS 4.1.7
- **Monitoring**: Sentry (`@sentry/nextjs`)
- **Testing**: Playwright 1.61.1 (e2e only)
- **Deploy**: Vercel (auto-deploys from `main`)

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/app/api/` | REST API endpoints (~30 routes) |
| `src/app/dashboard/` | 3 dashboards: `admin/`, `artist/`, `studio/` |
| `src/app/api/auth/[...path]/` | Neon Auth handler (catch-all) |
| `src/app/api/cron/` | Vercel cron jobs (9 daily/weekly jobs) |
| `src/components/` | Shared React components |
| `src/components/home/` | Homepage section components |
| `src/lib/` | Business logic, utilities, integrations |
| `src/lib/auth/` | Neon Auth setup (`auth.ts`) |
| `src/lib/email/` | Brevo email templates/sending |
| `src/lib/env.ts` | Env validation with Zod (required + optional vars) |
| `src/lib/env-prefix.ts` | Prefixed env reader for Neon Auth config |
| `src/db/` | Drizzle schema (`schema.ts`), DB client (`index.ts`) |
| `src/context/` | React contexts: Auth, Favorites, Notifications, Toast |
| `src/instrumentation-client.ts` | Client-side Sentry init |
| `src/instrumentation.ts` | Server-side Sentry init |
| `drizzle/` | Drizzle migration SQL files (20+ migrations) |
| `scripts/` | One-off scripts (seed, sweep, backfill, verify) |
| `e2e/` | Playwright end-to-end tests (11 spec files) |
| `workers/` | Cloudflare Workers (`email/` has own `package.json`; `url-shortener/` shares root workspace) |

### Route Structure

- `/` — Homepage (Hero, Categories, Featured, Testimonials)
- `/artists` / `/studios` — Listing pages
- `/artists/[id]` / `/studios/[id]` — Detail pages with booking
- `/dashboard/admin` — Admin panel (overview, people, moderation, reports, settings)
- `/dashboard/artist` — Artist dashboard (profile, bookings, services, portfolio, analytics)
- `/dashboard/studio` — Studio dashboard (calendar, staff, inventory, finance)
- `/bookings` — User's active bookings
- `/login`, `/register`, `/profile`, `/favorites`, `/rewards`, `/events` — Standard pages
- `/admin` — Rewrites to `/dashboard/admin`

### Middleware (`src/proxy.ts` — not `middleware.ts`)

Next.js 16 deprecates `middleware.ts`. The file is named `src/proxy.ts` and exports `proxy` + `config`. It handles:
- Dashboard auth (Neon Auth session check)
- Public page cookie-based redirect to `/login`
- API rate limiting (Upstash Redis)
- CSP headers with nonce support (Cloudflare Insights, Cloudinary)

### Auth Flow

Uses `@neondatabase/auth/next/server`. Auth routes are at `/api/auth/[...path]`. Session can be checked server-side via `getSession()` from `src/lib/auth/auth.ts`. The session cookie name is `__Secure-neon-auth.session_token` or `neon-auth.session_token`. Auth config reads prefixed env vars via `src/lib/env-prefix.ts` (`prefixedEnvReader("NEON_AUTH_")`).

### Database

- **Schema**: Single file `src/db/schema.ts`
- **Migrations**: In `drizzle/` (numbered SQL files)
- **Client**: `import { db } from "@/db"` gives you a Drizzle client
- **Env**: `DATABASE_URL` must be set (Neon connection string)
- **Migration order**: `pnpm db:generate` → `pnpm db:migrate`

### CSP / Nonce Pattern

The root layout reads `x-nonce` from response headers (set by `src/proxy.ts`) and passes it to `<ThemeScript>` and `<Script>` tags. New inline scripts must follow this pattern:

```tsx
const hdrs = await headers();
const nonce = hdrs.get("x-nonce") || undefined;
```

### Env Validation

`src/lib/env.ts` validates required env vars at startup using Zod. Required vars: `DATABASE_URL`, `NEXT_PUBLIC_URL`, `CRON_SECRET`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`. Additional vars like `BREVO_API_KEY`, `BILLPLZ_*`, `CLOUDINARY_*` are optional in the schema but may be needed for full functionality in production.

### Payout Disbursement (Billplz V5 Payment Orders)

Real money transfers use the Billplz **V5** `payment_orders` API (`src/lib/billplz-payout.ts`), NOT the v3 collection API used for collecting customer bills.

- **Env**: `BILLPLZ_PAYMENT_ORDER_COLLECTION_ID` (the Payment Order Collection id, distinct from `BILLPLZ_COLLECTION_ID`). If unset, `createPayoutOrder` throws → auto-release keeps the payout `pending` for admin retry instead of transferring money.
- **Flow**: `auto-release-payments` cron resolves the recipient's bank details from `profiles` (`bankCode`, `accountNumber`, `accountHolder`), computes net (gross − commission), and dispatches a Payment Order with `total` = net in cents.
- **Idempotency**: `reference_id` = `payout-{paymentId}`, which Billplz dedupes per Payment Order Collection, so retries reuse the same key.
- **Bank code**: `resolveBankCode` accepts a SWIFT `bankCode` (preferred) or maps free-text `bankName` (e.g. Maybank → MBBEMYKL). Profiles capture `bankCode` via the register-bank forms/API.
- **Tracking**: `payouts` records `payoutOrderId`, `billplzPayoutStatus`, `dispatchedAmount` (net), `dispatchedAt`.
- **Failure handling**: missing bank details or a failed dispatch do NOT block escrow release — the payment is released and the payout stays `pending` for the admin `mark-payouts-paid` flow to handle.

### Vercel Cron Jobs

Defined in `vercel.json` — 9 cron jobs (all daily-or-less frequent, Hobby-compatible). Each uses `CRON_SECRET` for auth. Paths: `/api/cron/sync-auth-users`, `/api/cron/sweep-orphans`, `/api/cron/reconcile-payments`, `/api/cron/auto-release-payments`, `/api/cron/booking-reminders`, `/api/cron/send-second-payments`, `/api/cron/lead-follow-ups`, `/api/cron/inbound-email-ack` (daily 14:00 UTC, lookback 24h), `/api/cron/weekly-digest` (weekly Mon 01:00 UTC).

### Sentry

Sentry is initialized in `src/instrumentation-client.ts` (client) and `src/instrumentation.ts` (server). The root layout imports `@/instrumentation-client` and `@/lib/env` at the top. Client-side Sentry is only enabled in production when `SENTRY_DSN` is set.

## Code Master Agent

Use this when reading or changing code and you want the cleanest, most advanced, and most structured result with minimal back-and-forth.

- Read the relevant code paths first, then infer adjacent patterns before changing anything.
- Prefer the smallest change that fits the existing architecture, but do not settle for a weak implementation if a cleaner design is clearly better.
- Aim for explicit names, narrow functions, strong types, and low duplication.
- Separate behavior changes from refactors when that reduces risk.
- When a task spans multiple subsystems, split the work into independent slices and delegate only the slices that can truly stand alone.
- Validate with the project’s checks before finishing: `pnpm check`, plus build or focused tests when the change touches runtime behavior.
- When the repository or tool access is unclear, stop and verify rather than guessing.

## Dutaintegra Repo Access

To work on `shamelali/dutaintegraweb-main` or related dutaintegra repositories, the GitHub App must be installed with access to that specific repo.

- If repo tools return a 404 or an installation-access error, that usually means the app does not yet have access to that repository.
- The fix is to grant the GitHub App access to the repo, then retry the same request.
- Once access is active, I can inspect and edit the repo directly without extra setup.

## Current Known Issues

- **ESLint is clean** — all previous errors resolved.
- **Sitemap** now includes DB-driven dynamic routes (artists, studios, services, categories) — falls back to static routes if DB is unavailable at build time.
- **Manifest icons** compressed to WebP (<50K) with maskable icon added.
- **HeroSection** uses Cloudinary URL stored in admin setting `hero_bg_image` (no fallback).
- **Public/images** directory is now empty; images are served via Cloudinary.
- **Dashboard routes** use `cookies()` and required `export const dynamic = 'force-dynamic'` in layout files to avoid static generation errors (already applied to admin, artist, studio layouts).
- **Invoice PDF** now uses `@react-pdf/renderer` (pure-JS, serverless-safe) with legacy HTML fallback.
- **E2E tests** need a real Neon preview branch DB (dummy env causes ECONNREFUSED but fallback works).

## MCP Config

MCP servers are configured in `opencode.json` at the repo root. The `.opencode/` directory contains the OpenCode plugin (`@opencode-ai/plugin`). Do not edit `.opencode/node_modules` or `.opencode/package-lock.json`.

### Meta MCP Servers

Two remote MCP servers connect the project to Meta's developer platform:

| Server | URL | Purpose |
|--------|-----|---------|
| Meta Developer Tools | `https://mcp.facebook.com/devtools` | Manage Meta apps, webhooks, compliance, App Review, API health, changelog, doc search |
| Meta Ads | `https://mcp.facebook.com/ads` | Manage Meta Ads campaigns, ad sets, reporting, catalogs, A/B tests |

**OAuth setup** (required before MCP works):
1. Go to [developers.facebook.com](https://developers.facebook.com) and create a Meta app
2. Add the **Meta Developer Tools** and **Meta Ads** products to the app
3. Configure OAuth redirect URIs pointing to your opencode instance
4. Generate an access token with Read and Manage scopes per app
5. Grant access in Business Integrations settings (Read scope for viewing, Manage for webhook writes)

Both servers use OAuth-based authentication — no API keys stored in config. The `meta-devtools` server supports Read and Manage scopes; the `meta-ads` server uses standard Meta Ads API permissions.

### CSP Allowlist

`https://mcp.facebook.com` is included in the `connect-src` CSP directive in `src/proxy.ts` to allow MCP connections.

### WhatsApp Webhook

The project receives incoming WhatsApp messages via a Cloud API webhook at `/api/webhook/whatsapp`.

**Setup:**
1. In Meta Developer Portal, go to your WhatsApp app → Configuration → Webhook
2. Set URL to `https://leish.my/api/webhook/whatsapp`
3. Set Verify Token to the value of `WHATSAPP_WEBHOOK_SECRET` in your env
4. Subscribe to `messages` and `message_status` fields

**Webhook route:** `src/app/api/webhook/whatsapp/route.ts`
- Handles GET (Meta verification) and POST (incoming messages)
- Logs all events to `webhookEvents` table in the database
- Supports text, interactive, and status message types

## Notes

- **No GitHub Copilot autofix PRs** — Sentry generated some auto-PRs (PR ##6, ##7, ##8), but the codebase has moved since. Review manually before merging.
- **The `feat/multi-language` remote branch is stale** — 208 commits behind main, never merged. Do not use.
- **Outbound email** uses Brevo. **Inbound email** uses Cloudflare Email Routing (MX records) — not Brevo Inbound Parse.
- **`workers/`** contains standalone Cloudflare Workers: `email/` has its own `package.json` and `wrangler.jsonc`; `url-shortener/` shares the root workspace config and has its own `wrangler.jsonc` but no `package.json`.
- **CI** runs `pnpm typecheck`, `pnpm lint`, `pnpm build` on push/PR to `main`.
