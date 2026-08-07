# Council licensing data: progress and method

*Live working notes. Updated 5 August 2026.*

## Where this is up to

Started at **112/361** councils. **Now at 361/361 (100%).**

## ✅ COMPLETE: every UK council has a record and a page

| Nation | Councils | Status |
|---|---|---|
| England | 296 | Researched individually |
| Wales | 22 | Researched individually, **9 with live schemes** |
| Scotland | 32 | Resolved by statute (s.270(11)) |
| N. Ireland | 11 | Resolved by statute (s.270(11)) |

### Why "88% of councils" was the wrong number to chase

Coverage of *councils* is not coverage of *searches*. Three code gates meant a search could return nothing even where we held good data:

1. `determine()` returned `null` for any non-England council, so the engine never ran for Wales.
2. `generateStaticParams` built council pages for **England only**, leaving 65 councils with no landing page.
3. `/councils` listed English councils only, so even the pages that did exist were unlinked.

All three are fixed. England is ~84% of the UK population, so **England alone could never have hit a 90% target** no matter how good the research was.

### Nation-specific rules that had to be fixed at the same time

Enabling Wales would have shipped new wrong answers without these:

- **Wales kept the three-storey mandatory HMO test** England dropped in 2018 (WSI 2006/1712 (W.174)). `determine()` hardcoded England's test, so a two-storey Welsh five-person let would have been told a mandatory licence was definitely required. It now returns a conditional answer naming the storey test.
- **Penalties differ.** The £40,000 civil penalty and 24-month Rent Repayment Order are Housing Act 2004 s.249A powers that do not exist in Scotland (max £50,000 fine) or NI (£5,000 fixed penalty, £20,000 on summary conviction).
- **HMO thresholds differ.** Scotland: 3+ people from 3+ households. NI: more than two households, and licensing is run by a single NIHMO Unit at Belfast for all 11 councils.

### Build regression this caused, and the fix

Adding the full evidence trail to all 361 records took `licensing-schemes.json` to **828KB, 69% of it the `research` field** that is never rendered. Imported into 456 static pages, it exhausted build memory. `scripts/split-research.mjs` moved the audit trail to `scripts/licensing-research.json` (keyed by GSS, never bundled), taking the runtime file to **254KB**; `merge-schemes.mjs` now keeps them in step automatically, and `research` is typed `never` on the runtime interface so it cannot creep back. Worker count is capped at 4 in `next.config.ts` because 15 workers each holding a copy of the data was the remaining cause.

## ✅ ENGLAND IS COMPLETE: 296 of 296

Every English council now carries either a sourced scheme record or a sourced "we checked and there is no scheme" record. Only 2 of the 296 are genuinely unverified (Bury, East Riding of Yorkshire), and both tell the user to ring the council rather than asserting a negative.

## ✅ WALES IS COMPLETE: 22 of 22

### 🔴 Wales confirms the correctness bug is real and harmful

**Nine of the 22 Welsh councils (41%) run a LIVE additional licensing scheme**, six of them county- or city-wide:

| Council | Coverage | Runs to | Fee |
|---|---|---|---|
| **Newport** | City-wide, all wards | 12 Feb 2030 | from £1,439.78 |
| **Rhondda Cynon Taf** | All electoral wards | 31 Mar 2029 | not published |
| **Flintshire** | County-wide | 31 Mar 2031 | £849.40 |
| **Denbighshire** | County-wide | 31 Jan 2031 | £890 |
| **Ceredigion** | County-wide | 9 Jul 2029 | £334/room |
| **Wrexham** | County-borough-wide | **31 Dec 2026** ⚠️ | £898 |
| **Swansea** | Castle, Uplands, Waterfront, St Thomas | 14 Feb 2031 | £1,096-£2,456 |
| **Cardiff** | Cathays ward | 1 Feb 2028 | £390 |
| **Conwy** | Parts of Pensarn, Colwyn Bay, Llandudno | not published | £1,398 |

Every one is **s.56 additional**, not Part 3. Denbighshire and Flintshire both went county-wide in 2026.

The live site currently tells every one of those landlords that their nation "uses a national landlord registration and licensing regime rather than council-by-council schemes". That is false, and a Flintshire landlord acting on it faces an unlimited fine plus a rent repayment order of up to 12 months' rent.

**Two Welsh schemes have lapsed while the council still advertises them**, the same pattern as Sheffield and Stoke: Cardiff's **Plasnewydd** term ended 1 Jan 2026 and Gwynedd's county-wide designation ended 3 Jun 2026, yet both still publish present-tense text and live fees. Both are recorded `expired` with public notes telling landlords to ring the council rather than assume they are clear.

**Two genuine Part 3 selective designations have existed in Wales, and both have expired.** Carmarthenshire's covered the Tyisha ward of Llanelli to 2 Jul 2019 and was discoverable only on the Welsh-language page. **Neath Port Talbot's covered the White City area of Aberavon from 5 May 2009 to 4 May 2014**, confirmed verbatim from Cabinet Board minutes citing s.80(1) and s.88(4). So "no Part 3 scheme has ever existed in Wales" is FALSE, even though "none is live" is true.

**Three re-check dates now sit in the diary:**
- ⚠️ **Wrexham expires 31 Dec 2026** and no successor was found in the committee record. Re-check after the 15 Sep and 13 Oct 2026 Executive Board meetings, and again in early January 2027, or the product will assert a licence requirement after the designation lapses.
- **Vale of Glamorgan is recorded UNVERIFIED**, the only such record in Wales. Shared Regulatory Services still tells landlords a Castleland (Barry) additional licence is required, but the Vale's own register has a single sheet named "Public Sheet - Mandatory" and its fee page lists mandatory fees only with zero occurrences of "castleland". Needs a written enquiry to SRS, not more desk research.
- **Newport had a real gap**: its 2019 scheme expired 30 Jun 2024 and the current one began 13 Feb 2025. Nothing was in force between, so historic-liability questions in that window must not be answered from the current designation.

### Welsh-specific method notes

- **The statutory Welsh term is `trwyddedu dethol`, not `trwyddedu dewisol`.** Carmarthenshire's expired selective scheme was named only in Welsh, and searching for "dewisol" alone would have missed it. Grep for **both**, plus `ychwanegol` (additional) and `amlfeddiannaeth` (HMO).
- **Welsh homonyms generate almost all the noise**: `anghenion dysgu ychwanegol` (additional learning needs), `taliadau tai dewisol` (discretionary housing payments), `addysg ddewisol yn y cartref` (elective home education), and `cwcis dewisol` (optional cookies) in cookie banners.
- **Rent Smart Wales** (Housing (Wales) Act 2014) is the dominant Welsh false positive. Every Welsh landlord must register, so "you need a licence" is true everywhere in Wales for an entirely different reason.
- **Wales kept the three-storey test** (WSI 2006/1712 (W.174)), so the mandatory threshold differs from England's.
- **Cardiff, Bridgend and the Vale share `srs.wales`** (Shared Regulatory Services). It is their own statutory joint service, not an aggregator, but it publishes all three councils' positions on one site, which is a serious misattribution risk.
- **Ceredigion is county-wide despite naming eight wards.** Treating it as ward-limited would falsely clear every landlord in Cardigan and Lampeter. **Five of its eight named wards no longer exist** after the 2022 Welsh boundary review, so `wards` is null.
- **Caerphilly serves soft 404s** (HTTP 200 with homepage content for any unknown path), so URL guessing there is actively misleading.

Scotland and Northern Ireland need no per-council lookups: the Housing Act 2004 does not extend there, so all 43 are resolved by law via `national-rules.json`.

| Nation | Done | Remaining | Notes |
|---|---|---|---|
| England | **296 of 296** | **0** | ✅ **DONE.** |
| Wales | **22 of 22** | **0** | ✅ **DONE. 9 councils have LIVE schemes.** |
| Scotland | 0 of 32 | **32** | Cannot have schemes. No per-council research needed. |
| N. Ireland | 0 of 11 | **11** | Cannot have schemes. No per-council research needed. |

Of the 296: **102 with at least one scheme**, **192 confirmed no scheme with a source**, **2 genuinely unverified**.

Batches 08 to 15 returned **100 negatives**, plus Sheffield's and Stoke's expired schemes and one live Stoke proposal. The strongest negatives are councils that state it in their own words. The single best artefact found is **Trafford's completed DLUHC return**, which answers *"Do you run any Selective and/or Additional Licensing schemes in your area?"* with **"Neither"**. That is genuine, not laziness: the remaining English councils are increasingly rural districts and shire boroughs, and every record carries a quoted fee schedule or an explicit council statement.

### ⚠️ Calibrating priors: the Sheffield lesson

Batch 11's prompt asserted that **Sheffield "almost certainly HAS live selective licensing"** and told the researcher not to report it negative without extraordinary evidence. **The prior was wrong**, and the researcher was right to override it. Both Sheffield schemes have lapsed: Page Hall ran 22 Apr 2014 to 21 Apr 2019, and London Road / Abbeydale Road / Chesterfield Road ran 1 Nov 2018 to 31 Oct 2023. Sheffield's own landing page is headed *"Details about the now closed Selective Licensing scheme."* Independently re-verified by direct fetch.

The lesson generalises: **a scheme you remember is not a scheme that exists.** Designations last a statutory maximum of five years, so any recollection more than five years old is worthless without a current end date. State priors as "check this carefully", never as "this is almost certainly true", and always require the end date.

Note also that Sheffield's page is still **titled** "Apply for a Selective Licence" while its body says the scheme ended. Read the body, not the title.

## How to run a batch

1. Pick the next 12 unresearched English councils:
   ```bash
   cd C:/Users/daves/claude/prscheck
   python -c "
   import json
   c=json.load(open('src/data/councils.json',encoding='utf-8'))
   s=json.load(open('src/data/licensing-schemes.json',encoding='utf-8'))
   have={x['gss'] for x in s}
   eng=[x for x in c if x['gss'] not in have and x['nation']=='england']
   print('; '.join(f\"{x['name']}, {x['gss']}\" for x in eng[:12]))"
   ```
2. Dispatch a research agent using the prompt template in the section below.
3. Save the returned JSON to `scripts/incoming/batch-NN.json`.
4. Validate, then merge:
   ```bash
   node scripts/merge-schemes.mjs scripts/incoming/batch-NN.json --dry   # check first
   node scripts/merge-schemes.mjs scripts/incoming/batch-NN.json          # then merge
   npx tsc --noEmit
   ```

`merge-schemes.mjs` refuses anything malformed. It has already caught: schemes marked `active` with a past end date, `coverage: "wards"` with an empty ward list, unsourced negatives, invented keys, and research shorthand leaking into the public `notes` field.

## Two rules that protect the product

**1. A negative needs a source, exactly like a positive.** "We checked and found no scheme" and "we could not check" are different findings and must never be conflated. A wrong "no scheme" can leave a landlord operating an unlicensed HMO, facing an unlimited fine and a rent repayment order.

**2. `notes` is public, `research` is not.** `notes` renders verbatim on the council page, so it is capped at 280 characters, written for a member of the public, and must contain no internal shorthand. The full evidence trail goes in `research`.

## How precisely can we actually locate a property?

Of **168 schemes** held: 43 borough-wide, 12 district, 70 wards, 24 areas, 17 streets, 2 part-ward.

A postcode resolves council and ward, so **55 whole-district and 70 ward schemes are answerable from a postcode alone**. The gap is the **34 live schemes that designate streets, named areas or part-wards**, across roughly 24 councils including Manchester, Nottingham, Salford, Newcastle, Leicester, Tower Hamlets, Waltham Forest and Wirral. Those currently return `check-boundary`, which is honest but is also the exact moment the user is asked to pay.

Closing that gap needs address-level input, not just a postcode:
- **Streets (17 schemes)** need the thoroughfare name. postcodes.io does not return one; OS Places DPA does, along with the UPRN.
- **Areas / part (26 schemes)** need the designation polygon, which mostly exists only as a PDF map. Hardest category, and no address API solves it on its own.

HomeBuyerCheck already has the address layer worth reusing: `src/app/api/addresses/route.ts` queries **OS Places** (AddressBase Premium, `OS_DATA_HUB_KEY`, free £1k/mo credit) with the MHCLG EPC API as fallback, merges and dedupes. The same route dropped into PRSCheck gives an address picker, and OS Places returns the street name needed for the 17 street schemes.

## The competitive case for doing this properly

While verifying Warrington, three commercial aggregators were found asserting it operates selective licensing in *"Latchford, Fairfield and Howley, and Bewsey and Whitecross"*. That is **exactly Warrington's Article 4 ward list**. They have mistaken a planning direction for a licensing designation and are telling landlords they need a licence that does not exist.

That is the whole product thesis in one example. The false-positive catalogue below is not academic tidiness: it is the difference between this site and the ones already ranking. It also cuts the other way, and worse, since Sheffield and Stoke both still publish live-sounding pages for schemes that have expired, and anyone scraping titles will tell landlords a lapsed scheme still binds them.

## Method: never trust a council site search without a control query

Batch 10 was the clearest lesson. **Seven of twelve council searches failed a control test**, meaning a nil return for "selective licensing" proved nothing at all.

- **Always run a control query first**, on a phrase that certainly exists on the site (`"houses in multiple occupation"`). Pendle, Rochford and Redditch all return zero for the control, so their zero for "selective licensing" is worthless. North Tyneside's index is disabled outright ("Cannot search on a disabled index").
- **Fuzzy/stemmed searches are equally useless as nil tests.** Norwich returned 141 pages for "selective licensing" led by allotment policies and an article about drones. Plymouth returned 97 led by a library market day.
- **Where a search does pass its control**, it is strong evidence. North Warwickshire and Nuneaton both honour quoted phrases and report counts.
- **The sitemap sweep is the best substitute.** Pull `/sitemap.xml`, follow sub-sitemap indexes, grep every URL for "selective". Clean zeroes obtained across Ribble Valley (37,588 URLs), Pendle (11,252), Nuneaton (6,468), North Warwickshire (5,923), Plymouth (5,899), Rochford (959) and NW Leicestershire (923).
- **Some ModernGov endpoints ignore GET parameters entirely**, serving a byte-identical blank form for every query. Seen at North Tyneside (11,892 bytes) and Ribble Valley (13,114 bytes). NW Leicestershire's works but only via POST with the full hidden-field set plus a Referer header.
- **403 means retry with a browser user-agent.** Plymouth 403'd on everything until retried via curl with a browser UA, after which the full fee schedule was readable. Sunderland's Cloudflare interstitial needed Accept, Accept-Language, Referer and `--compressed` as well. Several councils serve 403 on `www.` and 200 on the bare host, or the reverse (Swale, Uttlesford, Tunbridge Wells).
- **Add a nonsense NEGATIVE control.** A search that returns the same count for gibberish as for a real term is returning its whole index regardless of query. Warrington's returned an identical "4041 results found" for both.
- **Committee systems move.** `trafford.moderngov.co.uk` and `warrington.moderngov.co.uk` both return Cloudflare 522 while the live systems are `democratic.trafford.gov.uk` and `cmis.warrington.gov.uk`. A 522 is not evidence.

## The false-positive catalogue

This is the most valuable output of the exercise. Every one of these was found in real council data and would have produced a wrong answer.

| Trap | What it looks like | Seen at |
|---|---|---|
| **Article 4 Directions** | Planning control over C3-to-C4 HMO conversion. Names wards or streets, carries commencement dates, looks exactly like a designation. **The single commonest error.** | Bromley, Canterbury, Cheltenham, Cheshire East, Crawley, Dartford, Broxtowe, Fenland, Gravesham, Harlow, Hertsmere, Ipswich, Hull, Eastbourne, Exeter |
| **Hertsmere's future-dated Article 4** | Names 4 wards AND has a **future** commencement (6 May 2027), so it reads as an `upcoming` scheme | Hertsmere |
| **Records-retention boilerplate** | Pages literally titled "Selective area housing licences" / "Selective housing areas". ESD retention stubs citing the Limitation Act 1980. Rank top on the council's own search. | Lewes, Eastbourne |
| **Civil-penalty boilerplate** | Contains the string "offences in relation to licensing of houses under Part 3 of the Act (selective licensing)". Statutory guidance text every council reproduces. | Kingston upon Thames, East Suffolk, Eastbourne |
| **Model-form wording** | Application form says it covers "mandatory licensing and additional licensing". National model form, not a designation. | Lichfield |
| **The s.254 definition** | "Three or more people forming more than one household" is the DEFINITION of an HMO, not the licensing threshold. Mandatory is five or more. | King's Lynn (which disambiguates it), Ipswich, Isle of Wight, Elmbridge, Braintree, Bromsgrove, Epping Forest, Bury |
| **"Additional fee" lines** | A per-room or per-letting surcharge on a mandatory licence, not Part 2 s.56 | Broadland, Forest of Dean, Hull |
| **Voluntary accreditation** | "Responsible Landlord Scheme", "Hull Accredited Landlord Scheme", RAPS, Cheshire Landlord Accreditation. Not designations. | Cornwall, Hull, Gosport, Cheshire West, Isles of Scilly |
| **Neighbour bleed** | A neighbouring council's scheme attributed across the boundary | Fylde (it's Blackpool's), Darlington (it's Durham's), Broxtowe (it's Nottingham's), Bury (Greater Manchester) |
| **Approved but never designated** | Cabinet approved, never commenced. No start date, no expiry, it simply never existed. | Barnsley, Dorset/Weymouth, Fenland/Wisbech, Blackburn/Hollins Bank |
| **Considered and declined** | Consulted then rejected | Bassetlaw, Boston, Guildford, Maidstone, Bolsover |
| **Great crested newt district licensing** | Genuinely the only "additional licensing" hit on one council's site | Isle of Wight |
| **HTTP 403** | Usually a robots.txt bot block against ClaudeBot/GPTBot, **not evidence**. Retry with a browser user-agent. | Isle of Wight, Dorset, City of London, Eastleigh, Bradford |
| **Stale meta descriptions** | Page metadata still advertises a scheme the body no longer mentions | Barnsley |
| **Redirects to unpublished pages** | `/selective-licensing` 307-redirects to a withdrawn consultation | Blackburn with Darwen |
| **A neighbour's scheme quoted in your own committee paper** | northwarks.gov.uk hosts the sentence "Coventry City ... have an Additional Licensing Scheme for small HMO's which took effect May 2025", plus a comparator table showing Oadby and Wigston "selective: Yes" and Warwick "additional: Yes". A domain-scoped keyword scrape misattributes all three. | North Warwickshire |
| **Borough-wide, future-dated Article 4** | Confirmed 2 March 2026, whole borough, C3-to-C4. Reads exactly like a designation; the sealed instrument contains **zero** occurrences of "licens". | North Warwickshire |
| **Working groups and scrutiny items** | A councillor working group inviting an external speaker "to provide information on selective licensing conditions", or a forward-plan item. Not a proposal, consultation or designation. | Nuneaton and Bedworth, Richmond upon Thames |
| **A policy consultation mistaken for a designation** | Norwich consulted in 2025 on its HMO *policy* (dropping 1- and 3-year licence options). Administration of the existing mandatory scheme, not a new scheme. | Norwich |
| **"Additional Provisions" Regulations 2007** | The Licensing and Management of HMOs (Additional Provisions) (England) Regulations 2007 is a management-standards instrument despite the word "Additional". | Norwich |
| **A fee table starting at 3 bedrooms** | Looks like an additional-licensing tell. Richmond's own footnote explains it: a 5-person HMO can be two doubles plus a single, so 3 rooms is the minimum in a *mandatory* licensable HMO. | Richmond upon Thames |
| **Neighbourhood-plan "designation approval"** | "Whalley - Designation Approval" sits inside a Neighbourhood Planning download record. | Ribble Valley |
| **Stale pre-2018 mandatory test** | A policy still reciting "three or more storeys, five or more occupants" indicates an out-of-date document, not a scheme. | Redditch |
| **Search-engine bleed** | Bing ignored the `site:` operator and returned Cardiff's Cathays and Plasnewydd additional licensing schemes for a Richmond query. | Richmond upon Thames |
| **Expired scheme, live-sounding page title** | Sheffield's page is still titled "**Apply for** a Selective Licence in London, Abbeydale or Chesterfield Road" though the body says it ended 31 Oct 2023. Read the body, not the title. | Sheffield |
| **Statutory-powers recital on a Part 2 *and 3* heading** | South Cambridgeshire has a live page headed "Housing Act 2004 Part 2 and 3 - Licensing of Houses in Multiple Occupation" saying the Act "includes powers to introduce additional licensing ... and also to selectively licence properties". Looks exactly like a true positive; it is pure recital. Its own FOI response says zero selective licences ever granted. | South Cambridgeshire, Sheffield (fee policy s.1.1), NW Leicestershire |
| **The disproof and the boilerplate in one document** | Shropshire's civil penalty policy lists the s.95 selective licensing offences AND is titled "for adoption by local authorities in England **(no selective licensing areas)**". | Shropshire |
| **Inherited district designations at a new unitary** | A pre-vesting-day district scheme could still be running. Somerset (vested 1 Apr 2023 from 4 districts) was cleared by sweeping all four retired domains via the Wayback CDX API. | Somerset |
| **Stale sitemap listing a retired domain** | South Derbyshire's sitemap lists only `south-derbys.gov.uk` and omits the live HMO page, so a clean sweep of it proves little. Supplement with a live crawl and an archive sweep. | South Derbyshire |
| **`rushmoor` contains the substring `hmo`** | A naive case-insensitive grep for "hmo" matches nearly every URL on that domain. Strip the council token before matching. | Rushmoor |
| **A GOV.UK link whose URL contains "selective-licensing"** | Stafford's HMO page had exactly ONE "selective" string in its HTML, inside an outbound link to national statutory guidance. The visible page text had none. Check the context of every hit. | Stafford |
| **Sitemap covers only the legacy site** | South Gloucestershire's `/wp-sitemap.xml` covers the old A-Z while the live service sits on `beta.southglos.gov.uk` with its own sitemap. A clean sweep of the wrong sitemap proves nothing. | South Gloucestershire |
| **Detail hidden in collapsed accordions** | Stevenage's licence tests and fees live in embedded page JSON that the rendered view hides. Grep the raw HTML, not the rendered text. | Stevenage |
| **Answer base64-encoded in a JavaScript variable** | Sunderland's explicit "does not currently operate any Additional or Selective Licensing schemes" was invisible in the rendered DOM, encoded inside `HMOLICENCEPAGEFormData`. Decode it. | Sunderland |
| **s.56 of the RENTERS' RIGHTS ACT 2025** | Not s.56 of the Housing Act 2004. The RRA s.56 concerns rent bidding. | Uttlesford |
| **"Selective schools" / "selective areas of activity"** | Grammar-school admissions papers, and the internal-audit stock phrase, both match a naive keyword grep. | Trafford, Wakefield |
| **Area-based proactive enforcement** | Wakefield's "Better Homes Agbrigg" targets a named area and overlaps two Article 4 areas, so it reads as a designation. It is an enforcement campaign. | Wakefield |
| **Base64 noise matching a statutory reference** | A grep hit for "S56" on Trafford's HMO page was random base64 inside a JavaScript blob. Always read the context of a raw-HTML hit. | Trafford |

## ⚠️ Ward names: a second live correctness issue (found 5 Aug 2026)

Ward names in designations are transcribed from council PDFs that often predate a boundary review. They were being matched against the ONS ward name postcodes.io returns using **bidirectional substring matching**, which was wrong in both directions.

Checked all 505 transcribed ward names against the current ONS ward set (`WD25_LAD25_UK_LU_v2`): **28 do not exist as current wards, 24 of them on active schemes.**

**False positives it produced** (told a landlord they need a licence when they do not):

| Council | Real ward | Wrongly matched scheme ward |
|---|---|---|
| Bristol | Ashley | "Bishopston and Ashley Down" |
| City of York | Heworth Without (rural) | "Heworth" |
| City of York | Rawcliffe & Clifton Without | "Clifton" |
| Birmingham | Handsworth Wood | "Handsworth" |
| Enfield | Southgate | "Southgate Green" |
| Wandsworth | Balham | "South Balham" |

**False negatives it produced** (told a landlord they are clear when a live selective scheme covers them): 13 designated wards no longer match anything, because the successor wards were renamed. Liverpool's scheme names **Central, Riverside, Picton and Warbreck**, none of which survived the 2023 review; Ealing names **Acton Central, Greenford Green, Hobbayne**; Enfield names **Chase, Enfield Highway, Turkey Street**; Lewisham names **Whitefoot**; Charnwood names **Loughborough Hastings** and **Loughborough Lemyngton**.

**Fixed:**
- `src/data/wards.json` — the current ONS ward set, 8,405 wards across all 361 councils. Regenerate with `node scripts/fetch-wards.mjs`.
- `wardMatches` is now an exact normalised match. Fuzzy matching is not appropriate for a controlled vocabulary.
- New `schemeWardsAreStale()`. Where a scheme's ward list contains names that no longer exist, a non-matching ward returns **`check-boundary`**, not `not-in-area`. We cannot trust a negative drawn from a stale list, so we say so. 7 live schemes currently hedge this way.
- `merge-schemes.mjs` now **warns** on any ward name absent from the ONS set, naming the offenders. Warn rather than fail: designations really do name abolished wards, and the hedge is the correct fallback.

**Outstanding:** research successor wards per council for those 7 schemes and record them, which restores a precise answer instead of a hedge. Liverpool, Ealing and Enfield are the valuable ones.

## ⚠️ Wales: a live correctness issue

`CheckClient.tsx` used to tell every non-England visitor that their nation "uses a national landlord registration and licensing regime rather than council-by-council schemes". **That is false for Wales.** Housing Act 2004 s.270(11): *"this Act extends to England and Wales only."* Welsh councils have identical powers to English ones and roughly a dozen use them (Swansea, Newport, Cardiff, Rhondda Cynon Taf, Flintshire, Denbighshire, Conwy, Ceredigion, Wrexham), with fees up to £2,456.

**Fixed in the copy on 4 August 2026, but three things remain open and are product decisions:**
1. `determine()` in `licensing.ts` returns `null` for any non-England council, so the engine cannot evaluate a Welsh property.
2. `generateStaticParams` in `councils/[slug]/page.tsx` builds pages for England only, so **Wales has no council pages at all**.
3. `api/checkout/route.ts` blocks paid reports outside England.

Wales is the cheapest expansion: 22 councils, identical legal machinery, about 12 schemes to track. Zero live selective schemes exist in Wales, only additional.

## Scotland and Northern Ireland

Neither can have selective or additional licensing; the Housing Act 2004 does not extend there. They do not need 43 individual lookups, they need one accurate national explanation each. `national-rules.json` was corrected on 5 August 2026 with:
- NI landlord registration transferred from DfC to councils on **1 March 2025**, hosted by **Lisburn and Castlereagh** for all 11.
- NI HMO licensing administered by a single **NIHMO Unit at Belfast City Council** for all 11 councils. Fee **£62 per person per year**; statutory max rose £45 to £75 on 1 August 2025.
- NI threshold is **more than two households**, narrower than England. Three sharers from two households are an HMO in England but NOT in NI.
- Wales mandatory HMO SI corrected from W.170 to **WSI 2006/1712 (W.174)**. Wales kept the **three-storey test** England abolished in 2018.
- Explicit "no discretionary licensing power" blocks for both Scotland and NI, citing s.270(11).

## Re-check diary

| When | What |
|---|---|
| **After 18 Oct 2026** | **Halton** selective licensing consultation closes. Recorded as `proposed` over 4 wards plus part of Highfield, ~3,485 households. |
| 2026-27 | **Harlow** corporate plan commits to introducing selective licensing borough-wide. No consultation yet. |
| Ongoing | **Blackburn with Darwen** postponed Hollins Bank pending a housing strategy that has now been published. |
| Ongoing | **Bath and North East Somerset** says it will update its page if a new additional scheme is consulted on. |
| Ongoing | **Lichfield** delivery plan action to research a scheme, status "Not started". |
| Ongoing | **Boston** deferred pending Renters' Rights Act statutory guidance. |
| **URGENT, from ~11 Aug 2026** | **Stoke-on-Trent** proposed a **city-wide additional licensing scheme** on 4 Aug 2026, going to cabinet "next week", then to statutory consultation. Recorded as `proposed`. This is the single most time-sensitive record in the dataset: if designated it makes every small HMO in the city licensable. Re-check after the cabinet decision. |
| Dormant | **Lancaster** refused a Morecambe West End scheme on 16 Apr 2024, but the resolution says "at this time from this consultation", which leaves the door open. |
| Dormant | **Newcastle-under-Lyme** resolved in Jan 2016 to consult on selective licensing at Galleys Bank and the Miners Estate, Kidsgrove. No confirmation, commencement or fee ever followed. Recorded as no scheme rather than proposed, since flagging a decade-dead consultation as live would mislead. |
| Ongoing | **Milton Keynes**, **North Hertfordshire**, **North Northamptonshire** and **Rochford** have each expressly ruled both powers out in a published policy, so they are the safest negatives in the dataset. |
| **22 Oct 2026** | **Richmond upon Thames** has "Regulation and licensing of HMOs" scheduled for scrutiny. Members asked to look at "selective licensing for smaller HMOs", which legally means s.56 additional licensing. |
| Ongoing | **Nuneaton and Bedworth** has a councillor working group gathering information on selective licensing. No proposal, area, dates or fee yet. |
| Ongoing | **North Tyneside**'s Private Sector Housing Plan 2023-2028 commits to "keep under review the need for selective and additional licensing". |
| Historic | **Pendle** ran selective licensing designations (Waterside 2016, proposed Colne 2017). Nothing since, and a designation lasts five years maximum, so anything commenced then expired by 2022. Street-based, not ward-based. Exact commencement and expiry dates were never established, so no expired scheme object was recorded. |

## Agent prompt template

Reuse the batch 09 prompt verbatim. It includes the full trap catalogue and the machine-enforced rules, and it explicitly instructs the agent to return all 12 records in one message. **That last instruction matters**: batches 02 and 08 both returned partial updates referring to earlier messages the orchestrator could not see, costing a round trip each.
