# PRSCheck

Two products on one site:
1. **Landlord Licence Check (flagship, consumer, from 2026-07-10):** postcode -> council -> does this rental need a selective / additional / mandatory HMO licence. Free scheme check + £9.99 property-specific report. This is the revenue product.
2. **PRS enforcement platform (secondary, B2B):** the original council-facing SaaS pitch (/platform, /pricing, /solutions, /demo). Kept, de-emphasised on the homepage.

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
npm run dev      # Local dev server
npm run build    # Production build
npm run lint     # ESLint
npx next-sitemap # Generate sitemap + robots.txt (run after build)
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
