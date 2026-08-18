# PRSCheck

Three products on one site, two of them consumer, all driven by ONE determination engine:
1. **Landlord Licence Check (consumer, from 2026-07-10):** postcode -> council -> does this rental need a selective / additional / mandatory HMO licence. Free scheme check + £7.99 property-specific report and action plan.
2. **Tenant Rent Repayment Order Evidence Report (consumer, from 2026-08-18):** the same determination, read from the other side. Did the property require a licence, and is that evidence for a Rent Repayment Order claim. Free scheme check + £29 evidence report. Priced higher because the tenant is buying tribunal evidence for a claim worth thousands, not an answer they could get free from the council.
3. **PRS enforcement platform (secondary, B2B):** the original council-facing SaaS pitch (/platform, /pricing, /solutions, /demo). Kept, de-emphasised on the homepage.

## The two-audience architecture (2026-08-18)
- `src/lib/audience.ts` is the single source of truth for who the visitor is, what it costs and what it is called. `parseAudience` whitelists: anything not exactly `"tenant"` falls back to landlord, so a bad value can never upsell.
- `src/lib/rro.ts` holds every Rent Repayment Order fact and the award arithmetic. **It deliberately never publishes the statutory maximum as an expected recovery.** Awards follow Acheampong v Roman [2022] UKUT 239 (LC): whole rent for the period -> deduct utilities the tenant alone consumed -> apply a percentage for seriousness -> adjust for HPA 2016 s.44(4). We publish a 40-75% band with the working shown. `npm run verify:rro` gates the build on this arithmetic.
- `?for=tenant` on `/check` switches the question, the form (adds rent, months unlicensed, utilities), the price and the report. The canonical stays parameter-free so the two versions never compete in the index.
- Tenant silo: `/tenants` + `/tenants/rent-repayment-order` + `/tenants/rent-repayment-order-calculator` + `/tenants/is-my-landlord-licensed` + `/tenants/unlicensed-hmo`. Landlord silo: `/landlords` + `/landlords/rent-repayment-orders`. Both hubs link to each other, on purpose.
- All ~320 council pages carry a tenant FAQ (in FAQPage JSON-LD) and a tenant CTA, gated on `rroAvailable(nation)`: Scotland and NI have no such claim and must not be shown one.
- `reports.tier` stays `"licence_check"` for BOTH products. It is how PRSCheck rows are identified in the shared table; a new value would hide tenant sales from existing revenue queries. Separate them by `amount_paid` (799 vs 2900), the stored report's `audience`, or `conversion_events.event_type` (`licence_check_completed` vs `rro_evidence_completed`).
- `LicenceReportData.audience` and `.rro` are OPTIONAL and must stay optional: every report sold before 2026-08-18 has neither, and absent means landlord.

## Gotcha: JSX eats the space after an interpolation
`{total} English councils run ...` renders as "296English" whenever the text chunk that follows spans more than one line, because JSX trims the leading whitespace of a multi-line chunk. A single-line chunk keeps its space, which is why this appears at random. This was live on the homepage for months. Write `{total}{" "}` on the interpolation's own line. To find them, render the page and look for React's `<!-- -->` markers pressed straight against a word.

**URL:** prscheck.co.uk
**Stack:** Next.js 16, Tailwind CSS v4, TypeScript strict mode
**Deployment:** Vercel (auto-deploy on push to **master** — note: master, not main)

## Licence Check architecture
- Data: `src/data/councils.json` (361 UK councils, ONS GSS), `src/data/licensing-schemes.json` (90 councils with selective/additional schemes, verified against council pages 2026-07-10), `src/data/national-rules.json` (mandatory HMO + penalties + RRA timeline for England/Wales/Scotland/NI).
- Engine: `src/lib/licensing.ts` — `determine(gss, {occupants, households, wardName})` returns per-scheme verdicts (required / likely-required / check-boundary / upcoming / not-in-area); `councilSummary(gss)` for teaser + council pages. Ward matching normalises `&`/apostrophes; street/part-ward schemes return "check-boundary" (honest, since we can't resolve exact boundaries from a postcode).
- Flow: `/check` (CheckClient) -> `/api/free-check` (postcodes.io -> council + scheme counts) -> occupancy form -> `/api/checkout` (Stripe, England only) -> `/api/webhook` (fulfil: reports row + Resend email + Telegram + conversion_events) -> `/checkout/success` (polls `/api/report-status`) -> `/r/[token]` (permanent report).
- SEO/AI: `/councils` + 296 `/councils/[slug]` pages (generateStaticParams), `/guides` + 5 `/guides/[slug]`. FAQ + Article JSON-LD. llms.txt rewritten for consumer.
- Report data lives in shared Supabase project `noxczmrnyyosgvvjlqca` (reports/stripe_events/conversion_events/searches tables, site_id=prscheck).

## Env / infra notes
- **Stripe: reuses the PostcodeCheck Stripe account** (STRIPE_SECRET_KEY = STRIPE_KEY_POSTCODECHECK) — there was no dedicated PRSCheck account. Sales are separable via metadata `product=licence_check` + Supabase `site_id=prscheck`. Dedicated webhook endpoint `we_1TrdtSEXmRmmhuTE9fRHBN43` on that account -> STRIPE_WEBHOOK_SECRET. PCC's own webhook now ignores `product==="licence_check"`. **TODO: move to a dedicated PRSCheck Stripe account when convenient** (keeps revenue/accounting clean).
- Supabase/Resend/Telegram env vars pulled from CommandCenter .env.local, set on Vercel via `printf | vercel env add` (scope skillettsites-projects).
- Resend domain prscheck.co.uk added + Cloudflare DKIM/SPF/MX records added 2026-07-10; verifying. Email is non-blocking (report shows on-screen + permanent link regardless).
- GA: `NEXT_PUBLIC_GA_ID` not set yet (no GA4 property created). GoogleAnalytics component renders nothing until set.
- Regenerate sitemap after build: `npx next-sitemap` (the postbuild hook only runs on `npm run build`, not `npx next build`). `/check` is dynamic so it's added via additionalPaths.

## Data caveats (honest, in the data notes)
- Walsall "Scheme Two", East Riding Goole, Barnet selective, Hartlepool/Redcar Tees Valley schemes = flagged unverified/not-live where uncertain. Never mark uncertain schemes "active".
- Report + council pages state clearly: information service, not legal advice; confirm exact boundary with council.

## Commands

```bash
npm run dev             # Local dev server
npm run build           # Production build (prebuild gates on verify:verdicts + verify:rro)
npm run verify:verdicts # Licensing determination invariants
npm run verify:rro      # Rent repayment order arithmetic
npm run lint            # ESLint
npx next-sitemap        # Generate sitemap + robots.txt (run after build)
```

## Architecture

```
src/
  app/
    page.tsx              # Homepage (hero, stats, features, pricing, ROI calc, testimonials)
    layout.tsx            # Root layout with Header, Footer, Inter font, Vercel Analytics
    ROICalculator.tsx     # Client-side ROI calculator component
    globals.css           # Dark theme design system (navy/accent blue palette)
    pricing/page.tsx      # Pricing tiers + feature comparison table + FAQ
    demo/page.tsx         # Interactive dashboard demo with mock data
    about/page.tsx        # Mission, problem, values, team
    contact/page.tsx      # Contact form + info
    privacy/page.tsx      # UK GDPR privacy policy
    terms/page.tsx        # Terms of service
    api/register/route.ts # Registration endpoint (TODO: connect to DB)
  components/
    ui/Header.tsx         # Sticky nav with glass effect, mobile menu
    ui/Footer.tsx         # 5-column corporate footer
    RegisterInterestCTA.tsx # Reusable registration form (inline/banner variants)
```

## Design System

- Primary: deep navy (#0f172a to #1e293b)
- Accent: electric blue (#2563eb to #3b82f6)
- Success: #10b981, Warning: #f59e0b, Danger: #ef4444
- Dark theme throughout, professional/corporate aesthetic
- Font: Inter via next/font/google

## Revenue Model

B2B SaaS sold to local authorities via G-Cloud Digital Marketplace:
- Starter: 500/mo (up to 5,000 properties, 2 seats)
- Professional: 1,500/mo (up to 25,000 properties, 10 seats)
- Enterprise: Custom pricing

## Key Legislation

- Renters' Rights Act 2025
- Housing Act 2004
- PRS Database (expected launch late 2026)
- Civil penalty powers under s.249A Housing Act 2004

## Code Standards

- No em dashes in any output
- Professional, corporate tone throughout
- UK English (s not z: organisation, prioritisation)
- All content must be accurate per current legislation
