export interface GuideSection {
  heading: string;
  body: string[];
}

export interface GuideFAQ {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFAQ[];
}

export const GUIDES: Guide[] = [
  {
    slug: "landlord-licensing",
    title: "Landlord licensing explained",
    metaTitle: "Landlord Licensing Explained (2026): Do You Need a Licence?",
    metaDescription:
      "A plain-English guide to the three types of UK landlord licence: mandatory HMO, additional and selective. How to tell which your property needs, and the penalties for getting it wrong.",
    intro:
      "There are three kinds of property licence a private landlord in the UK might need. Two are set by your local council for specific areas, and one applies nationwide. Getting this wrong is expensive, so here is how the whole system fits together.",
    sections: [
      {
        heading: "The three licence types",
        body: [
          "Mandatory HMO licensing applies everywhere in England. Any property let to 5 or more people forming 2 or more households who share a kitchen, bathroom or toilet needs one. There is no storey requirement any more (that was removed in October 2018).",
          "Additional HMO licensing is a discretionary scheme a council can bring in to cover smaller HMOs, typically those let to 3 or 4 sharers, that fall below the mandatory threshold. It only applies where the council has designated it.",
          "Selective licensing is a discretionary scheme covering ordinary private rented homes (not just HMOs) within a designated area, often a few streets or wards with housing or antisocial-behaviour problems. If your let is in the designated area, you need a licence even for a single family tenant.",
        ],
      },
      {
        heading: "How to tell which you need",
        body: [
          "Start with occupancy. Five or more people in two or more households almost always means mandatory HMO licensing, wherever the property is.",
          "Then check your council. If it runs an additional licensing scheme and you let a 3-4 person HMO, you likely need an additional licence. If it runs a selective scheme and your address is inside the designated area, you need a selective licence even for a single household.",
          "Because selective and additional schemes are frequently designated at street or part-ward level, the only reliable way to know is to check your specific address against the council's designation map. Our postcode checker does the first pass for you and the paid report gives the property-specific verdict.",
        ],
      },
      {
        heading: "Wales, Scotland and Northern Ireland",
        body: [
          // Wales was described here as a national regime ONLY, which is false
          // and points in the dangerous direction: nine of its twenty-two
          // councils run live additional licensing schemes, several county-wide,
          // with fees over £2,000. The Housing Act 2004 extends to England AND
          // Wales (s.270(11)), so Welsh councils hold the same designation
          // powers as English ones.
          "Wales has both. Every landlord must register with Rent Smart Wales, and self-managing landlords need a licence with training, backed by fixed penalties, unlimited fines and rent stopping orders. On top of that, Welsh councils hold exactly the same powers as English ones to designate selective and additional licensing schemes, because the Housing Act 2004 extends to England and Wales. Nine of the twenty-two Welsh councils currently run one, several of them county-wide, with fees running past £2,000. Registering with Rent Smart Wales does not cover you for those.",
          "Wales also kept the three-storey test for mandatory HMO licensing that England dropped in 2018, so a Welsh property needs a mandatory licence only where it has three or more storeys as well as 5 or more occupants in 2 or more households.",
          "Scotland requires all landlords to register with each council where they let, renewing every three years, with fines up to £50,000 for letting unregistered. HMO licensing is stricter than England's: a licence is needed where 3 or more people from 3 or more households share, not England's 5 in 2. Scottish councils cannot run selective or additional licensing at all, because the Housing Act 2004 does not extend to Scotland.",
          "Northern Ireland has a landlord registration scheme plus HMO licensing, administered by the NIHMO Unit at Belfast City Council for all eleven councils. An HMO licence is needed where 3 or more people forming more than two households occupy the property, again a lower threshold than England's. Northern Irish councils cannot run selective or additional licensing either.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need a licence to rent out a single flat?",
        a: "Only if your council runs a selective licensing scheme covering that address. Councils in England and Wales can both designate one, so a Welsh single-household let can need a council licence as well as Rent Smart Wales registration. In Scotland and Northern Ireland no council can designate a selective scheme, but landlord registration is compulsory in both. Outside a designated area in England, a single-household let usually needs no licence, though you should still confirm your exact address against the council's map, because these schemes are often designated street by street.",
      },
      {
        q: "What counts as a household?",
        a: "A household is one person or members of the same family living together (including couples). Five unrelated tenants sharing a house are five households. A couple plus one lodger is two households.",
      },
      {
        q: "How long does a licence last?",
        a: "Mandatory and additional HMO licences last up to five years. Selective licences run for the length of the designation, up to five years. Councils set their own fees.",
      },
    ],
  },
  {
    slug: "selective-licensing",
    title: "Selective licensing",
    metaTitle: "Selective Licensing 2026: What It Is and Where It Applies",
    metaDescription:
      "Selective licensing explained: what it covers, which councils and areas run schemes, typical fees, and how to check whether your rental address is inside a designated area.",
    intro:
      "Selective licensing lets a council require a licence for ordinary private rented homes, not just HMOs, within a designated area. It is the scheme most likely to catch landlords by surprise, because it can apply to a single-family let on one side of a street and not the other.",
    sections: [
      {
        heading: "What selective licensing covers",
        body: [
          "Under Part 3 of the Housing Act 2004, a council can designate an area where most or all privately rented homes must be licensed. It is used to tackle low housing demand, antisocial behaviour, deprivation, poor property conditions or migration pressures.",
          "Unlike HMO licensing, it does not depend on how many people share the property. A house let to a single family still needs a selective licence if it sits in the designated area.",
        ],
      },
      {
        heading: "Where it applies",
        body: [
          "Schemes are designated street by street or ward by ward, so coverage is very local. Cities like Nottingham, Liverpool, Birmingham, Newham and County Durham run large schemes; many others cover just a handful of streets.",
          "Since December 2024 councils no longer need Secretary of State approval to designate schemes of any size, which is driving rapid growth. Always check the current designation map for your exact address rather than assuming a whole town is or is not covered.",
        ],
      },
      {
        heading: "Fees and how to apply",
        body: [
          "Selective licence fees typically range from around £500 to £1,000 for five years, usually split into a Part A application fee and a Part B fee payable on grant. Many councils offer discounts for accredited landlords or good EPC ratings.",
          "You apply through the council (or its delivery partner). You will need to be a fit and proper person and meet management and safety conditions, including gas and electrical safety certificates and working alarms.",
        ],
      },
    ],
    faq: [
      {
        q: "How do I know if my property is in a selective licensing area?",
        a: "Check your address against the council's designation map or street list. Because schemes are often drawn at street level, a postcode alone is not always enough. Our checker identifies whether your council runs a scheme, and the paid report gives the property-specific position with the council source link.",
      },
      {
        q: "What happens if I let an unlicensed property in a selective area?",
        a: "You risk a civil penalty of up to £40,000, a rent repayment order of up to 24 months' rent, and prosecution with an unlimited fine. You may also be unable to regain possession while unlicensed.",
      },
    ],
  },
  {
    slug: "hmo-licensing",
    title: "HMO licensing: mandatory and additional",
    metaTitle: "HMO Licensing 2026: Mandatory vs Additional Explained",
    metaDescription:
      "When does an HMO need a licence? The mandatory 5-person rule, additional licensing for smaller HMOs, fees, conditions and penalties, explained for landlords.",
    intro:
      "A house in multiple occupation (HMO) is a property shared by people who are not all one household. Some HMOs need a licence automatically; others only need one where the council has brought in an additional scheme.",
    sections: [
      {
        heading: "Mandatory HMO licensing",
        body: [
          "Mandatory HMO licensing applies across all of England. A property needs a licence if it is let to 5 or more people forming 2 or more households, and those people share a toilet, bathroom or kitchen, with at least one paying rent.",
          "The old requirement that the property be three or more storeys was removed in October 2018, so a two-storey house shared by five people now needs a mandatory licence.",
        ],
      },
      {
        heading: "Additional HMO licensing",
        body: [
          "Additional licensing is a discretionary scheme that extends HMO licensing to smaller HMOs, typically those let to 3 or 4 sharers, and sometimes to certain converted blocks of flats (section 257 HMOs).",
          "It only applies where a council has designated it. Cities including Birmingham, Coventry, Nottingham, Manchester's neighbours and many London boroughs run additional schemes, often borough-wide. Check whether your council runs one before letting a smaller shared house.",
        ],
      },
      {
        heading: "Conditions and fees",
        body: [
          "HMO licences last up to five years and carry conditions: a fit and proper licence holder, annual gas safety checks, electrical safety certificates, working smoke and carbon monoxide alarms, and minimum room sizes and amenity standards.",
          "Fees vary widely by council, commonly £700 to £1,500 or more, often split into two parts. Note that Wales keeps a three-storey test for mandatory HMO licensing, and Scotland's HMO threshold is three or more unrelated occupants.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a property shared by 3 people an HMO that needs a licence?",
        a: "It is an HMO, but it only needs a licence if your council runs an additional licensing scheme covering it (or if it is in a selective area). Three sharers are below the mandatory 5-person threshold. Check your council's schemes to be sure.",
      },
      {
        q: "Does a live-in landlord with lodgers need an HMO licence?",
        a: "Usually not, if you and up to two lodgers share your own home, but the rules are nuanced and additional schemes can change the picture. Check your specific situation against your council's scheme.",
      },
    ],
  },
  {
    slug: "renters-rights-act",
    title: "The Renters' Rights Act 2025",
    metaTitle: "Renters' Rights Act 2025: What Landlords Need to Know",
    metaDescription:
      "The Renters' Rights Act 2025 explained for landlords: the end of Section 21, £40,000 civil penalties, 24-month rent repayment orders, the PRS Database and the timeline.",
    intro:
      "The Renters' Rights Act 2025 is the biggest change to private renting in a generation. It abolished Section 21, raised penalties, and is introducing a national database every landlord must join. Here is what matters and when.",
    sections: [
      {
        heading: "What changed on 1 May 2026",
        body: [
          "Section 21 'no fault' evictions were abolished for private landlords, and all assured tenancies became periodic.",
          "The maximum civil penalty for offences such as operating an unlicensed property rose from £30,000 to £40,000 per offence. Rent repayment orders were extended from 12 to 24 months' rent and can now reach superior landlords in rent-to-rent arrangements.",
          "Rental bidding and demands for large amounts of rent in advance were banned, and new discrimination protections for tenants on benefits or with children came in.",
        ],
      },
      {
        heading: "The PRS Database",
        body: [
          "A national Private Rented Sector Database is being rolled out from late 2026, with full mandatory registration expected during 2027. Every landlord will need to register their details and each let property, including safety certificates.",
          "Failing to register, or marketing an unregistered property, can bring a civil penalty of up to £7,000, rising to £40,000 and possible prosecution for repeat or serious breaches. Once the database is live, courts can refuse to grant possession to landlords who are not registered.",
        ],
      },
      {
        heading: "Why licensing matters more now",
        body: [
          "The Act gave councils new investigatory powers and made it easier and faster to designate selective licensing schemes. Combined with higher penalties and longer rent repayment orders, the cost of missing a licence has gone up sharply.",
          "Staying compliant means knowing exactly which licences your property needs today, and watching for new schemes in your area. That is what PRSCheck is built to do.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Section 21 really gone?",
        a: "Yes. From 1 May 2026 private landlords can no longer use Section 21 no-fault notices. Possession must be sought on specific grounds under Section 8, some of which are new.",
      },
      {
        q: "When do I have to register on the PRS Database?",
        a: "Registration is rolling out from late 2026, with full mandatory registration expected during 2027. Exact dates and fees are being confirmed by the government; being unregistered will eventually block possession claims and carry penalties.",
      },
    ],
  },
  {
    slug: "penalties",
    title: "Penalties for unlicensed letting",
    metaTitle: "Penalties for Renting Without a Licence (2026)",
    metaDescription:
      "The penalties for operating an unlicensed rental property: civil penalties up to £40,000, rent repayment orders up to 24 months, banning orders and prosecution. How to avoid them.",
    intro:
      "Letting a property that needs a licence without one is a serious matter, and the penalties increased in 2026. Here is exactly what you are exposed to, and how to avoid it.",
    sections: [
      {
        heading: "Civil penalties and fines",
        body: [
          "A council can impose a civil penalty of up to £40,000 per offence as an alternative to prosecution (raised from £30,000 on 1 May 2026). Alternatively it can prosecute, and the court can impose an unlimited fine.",
          "Related breaches carry their own penalties: failing to register on the PRS Database can bring up to £7,000, rising to £40,000 for serious or repeat breaches.",
        ],
      },
      {
        heading: "Rent repayment orders",
        body: [
          "A tenant (or the council) can apply to the tribunal for a rent repayment order. For offences committed on or after 1 May 2026 this can be up to 24 months' rent, doubled from the previous 12-month cap.",
          "This means an unlicensed landlord could be ordered to repay up to two years of rent, on top of any civil penalty, and superior landlords in rent-to-rent chains can now be caught too.",
        ],
      },
      {
        heading: "Banning orders and possession",
        body: [
          "Serious or repeat offenders can be given a banning order preventing them from letting property, and be entered on a national rogue landlord database.",
          "Being unlicensed also affects possession. While unlicensed you cannot rely on certain possession routes, and once the PRS Database is live, courts can refuse possession to unregistered landlords.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I be penalised even if I didn't know I needed a licence?",
        a: "Yes. Not knowing about a local scheme is generally not a defence. Because selective and additional schemes change frequently and apply street by street, it is your responsibility to check. That is exactly what a licence check is for.",
      },
      {
        q: "How do I fix it if I've been letting without a licence?",
        a: "Apply for the required licence as soon as possible and take advice. Applying does not erase past liability, but demonstrating prompt action can help. Our report tells you which licence you need and the steps to take.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
