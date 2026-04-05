# PRSCheck

PRS enforcement SaaS platform for UK local authority housing teams. Council-focused B2B product.

**URL:** prscheck.co.uk
**Stack:** Next.js 16, Tailwind CSS v4, TypeScript strict mode
**Deployment:** Vercel (auto-deploy on push to main)

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
