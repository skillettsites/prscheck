import { NextRequest, NextResponse } from "next/server";

const NEW_API_BASE = "https://api.get-energy-performance-data.communities.gov.uk";
const LEGACY_API_BASE = "https://epc.opendatacommunities.org/api/v1/domestic/search";
const OS_PLACES_BASE = "https://api.os.uk/search/places/v1";

/**
 * One selectable address. `street` is the part that matters for licensing:
 * roughly 35 live selective/additional schemes are designated street by street
 * and a postcode alone cannot resolve them.
 */
export interface AddressItem {
  address: string;
  street: string | null;
  buildingNumber: string | null;
  uprn: string | null;
  /**
   * How the street was obtained, which decides how far the licensing engine
   * trusts it.
   *
   * - `os`: Ordnance Survey's structured THOROUGHFARE_NAME. Authoritative.
   * - `epc-numbered`: derived from an EPC address line that begins with a house
   *   number and ends in a thoroughfare suffix, e.g. "12 Askew Road". Stripping
   *   a leading number off that leaves exactly the street, so this is reliable
   *   enough to rule a designation out.
   * - `epc-derived`: derived some other way, with no house number to anchor it.
   *   This is the "Rose Cottage, Mill Lane" case, where the name we extract may
   *   be the property, not the street. May confirm a designation, never rules
   *   one out.
   */
  streetSource?: "os" | "epc-numbered" | "epc-derived";
}

function cleanEnv(v: string | undefined): string {
  return (v || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 5) return cleaned;
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
}

function toTitleCase(str: string): string {
  return str
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildAddress(rec: Record<string, string>): string {
  // New MHCLG API returns: addressLine1, addressLine2, addressLine3, addressLine4, postTown, postcode
  const newApiLines = [rec.addressLine1, rec.addressLine2, rec.addressLine3, rec.addressLine4]
    .filter((s) => s && String(s).trim().length > 0);
  if (newApiLines.length > 0) {
    const parts = newApiLines.map((s) => toTitleCase(String(s).trim()));
    if (rec.postTown) parts.push(toTitleCase(String(rec.postTown).trim()));
    return parts.join(", ");
  }

  // Legacy API: buildingName / buildingNumber / street / town fields
  const parts: string[] = [];
  const name = rec.buildingName || rec["building-name"];
  const num = rec.buildingNumber || rec["building-number"];
  const street = rec.street || rec["street"];
  const town = rec.town || rec["town"];
  if (name) parts.push(name);
  if (num && street) parts.push(`${num} ${street}`);
  else if (street) parts.push(street);
  else if (num) parts.push(num);
  if (town) parts.push(town);

  if (parts.length === 0 && (rec.address || rec["address"])) {
    return toTitleCase((rec.address || rec["address"]).trim());
  }
  return parts.map((p) => toTitleCase(p.trim())).join(", ");
}

/**
 * Thoroughfare suffixes used to sanity-check a street derived from an EPC
 * address line.
 *
 * Without this, "Rose Cottage" is returned as a street, fails to match any
 * designation schedule, and the engine reports a confident "not in the
 * designated area" for a property we actually know nothing about. Returning
 * null instead makes it fall back to "check the boundary", which is the safe
 * direction to be wrong in. A handful of real streets have no suffix
 * ("Broadway", "Cheapside") and will also fall back; that costs precision, not
 * correctness.
 */
const THOROUGHFARE_SUFFIXES = new Set([
  "road","street","lane","avenue","close","drive","way","place","court","crescent","gardens","grove","terrace",
  "walk","hill","park","rise","view","green","square","row","mount","vale","mews","parade","broadway","approach",
  "bank","brow","chase","circus","cliff","corner","croft","dale","end","fields","gate","glade","hall","heath",
  "meadow","moor","paddock","path","quay","ridge","side","spinney","strand","villas","wharf","wood","yard",
]);

function looksLikeStreet(name: string): boolean {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, " ").trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return !!last && THOROUGHFARE_SUFFIXES.has(last);
}

/**
 * Best-effort street name from an EPC record.
 *
 * OS Places gives a structured THOROUGHFARE_NAME, but no OS Data Hub key is
 * provisioned, so EPC is the live source. The legacy EPC API does carry a
 * `street` field; the newer MHCLG one does not, so the street is recovered from
 * the first address line by stripping a leading building number or flat
 * reference. This is a heuristic, which is why the response marks how the
 * street was obtained: a street-list match is only ever as good as this.
 */
/**
 * Split one address line into its house number and the thoroughfare after it.
 *
 * `number` is null when the line carries no house number, which is exactly the
 * case we must not trust: with no number to anchor on, whatever text remains
 * may be the property's name rather than its street.
 */
function splitAddressLine(line: string): { number: string | null; rest: string } {
  let t = line.trim();
  // "Flat 2, 12 Askew Road" / "Apt 4 Askew Road" -> drop the dwelling reference,
  // which is not the house number the council's schedules are written against.
  t = t.replace(/^(flat|apartment|apt|unit|room)\s*[0-9]*[a-z]?[,\s]+/i, "");
  // "12 Askew Road" / "12A Askew Road" / "12-14 Askew Road"
  const m = t.match(/^([0-9]+[a-z]?)(?:\s*[-/]\s*([0-9]+[a-z]?))?[,\s]+(.*)$/i);
  if (m) return { number: m[1], rest: m[3].replace(/^,+\s*/, "").trim() };
  return { number: null, rest: t.replace(/^,+\s*/, "").trim() };
}

/**
 * Best-effort street and house number from an EPC record, with an honest
 * confidence.
 *
 * `confident` is true only when the street was recovered from a line that began
 * with a house number, e.g. "12 Askew Road". Stripping "12" off that leaves
 * exactly the street, so it is as good as a structured field. It is false for
 * "Rose Cottage, Mill Lane", where the extracted name may be the house rather
 * than the road, and the licensing engine must not rule a designation out on it.
 */
function epcStreet(rec: Record<string, string>): {
  street: string | null;
  buildingNumber: string | null;
  confident: boolean;
} {
  const direct = rec.street || rec["street"];
  const directNum = rec.buildingNumber || rec["building-number"];
  if (direct && String(direct).trim()) {
    // The legacy API carries a structured street field, which needs no guessing.
    return {
      street: toTitleCase(String(direct).trim()),
      buildingNumber: directNum ? String(directNum).trim() : null,
      confident: true,
    };
  }

  // EPC splits an address across lines inconsistently. Usually line 1 holds
  // "12 Askew Road", but for a subdivided property it holds only "Flat 2" and
  // the thoroughfare drops to line 2. Try line 1 first and fall through to
  // line 2 when line 1 reduces to nothing usable, rather than assuming either.
  let fallback: { street: string; buildingNumber: string | null } | null = null;
  for (const raw of [rec.addressLine1, rec.addressLine2]) {
    if (!raw || !String(raw).trim()) continue;
    const { number, rest } = splitAddressLine(String(raw));
    if (rest.length <= 2) continue;
    const name = toTitleCase(rest);
    // Only trust a derived street that actually looks like a thoroughfare.
    if (!looksLikeStreet(name)) continue;
    if (number) return { street: name, buildingNumber: number, confident: true };
    // Looks like a street but has no house number anchoring it. Keep it as a
    // last resort: it can still confirm a designation, just not rule one out.
    fallback = fallback ?? { street: name, buildingNumber: null };
  }
  if (fallback) return { ...fallback, confident: false };
  return { street: null, buildingNumber: null, confident: false };
}

/** Shape an EPC record into an AddressItem, carrying the street's provenance. */
function epcItem(rec: Record<string, string>, address: string): AddressItem {
  const { street, buildingNumber, confident } = epcStreet(rec);
  return {
    address,
    street,
    buildingNumber,
    uprn: rec.uprn ? String(rec.uprn) : null,
    streetSource: confident ? "epc-numbered" : "epc-derived",
  };
}

async function fetchAddresses(postcode: string): Promise<AddressItem[]> {
  const formatted = formatPostcode(postcode);

  // Primary: new MHCLG API
  const token = cleanEnv(process.env.EPC_API_TOKEN);
  if (token) {
    try {
      const res = await fetch(
        `${NEW_API_BASE}/api/domestic/search?postcode=${encodeURIComponent(formatted)}&page_size=200`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const seen = new Set<string>();
          const addresses: AddressItem[] = [];
          for (const rec of json.data) {
            const addr = buildAddress(rec);
            if (!addr || addr.length < 3) continue;
            const k = addr.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
            if (!seen.has(k)) {
              seen.add(k);
              addresses.push(epcItem(rec, addr));
            }
          }
          return addresses.sort((a, b) => a.address.localeCompare(b.address, "en-GB"));
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Fallback: legacy EPC API (basic auth)
  const email = cleanEnv(process.env.EPC_API_EMAIL);
  const key = cleanEnv(process.env.EPC_API_KEY);
  if (email && key) {
    try {
      const cleaned = postcode.replace(/\s+/g, "");
      const res = await fetch(
        `${LEGACY_API_BASE}?postcode=${encodeURIComponent(cleaned)}&size=200`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const rows = json.rows;
        if (Array.isArray(rows) && rows.length > 0) {
          const seen = new Set<string>();
          const addresses: AddressItem[] = [];
          for (const row of rows) {
            const addr = buildAddress(row);
            const k = addr.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
            if (!seen.has(k)) {
              seen.add(k);
              addresses.push(epcItem(row, addr));
            }
          }
          return addresses.sort((a, b) => a.address.localeCompare(b.address, "en-GB"));
        }
      }
    } catch {
      /* return empty */
    }
  }

  return [];
}

/**
 * Ordnance Survey Places API, comprehensive AddressBase Premium.
 * Returns ALL UPRN-registered addresses for a postcode, including flats
 * within named buildings. Requires OS_DATA_HUB_KEY (Premium Plan, free
 * £1k/mo credit). Without the key, returns [] silently.
 */
async function fetchOsPlacesAddresses(postcode: string): Promise<AddressItem[]> {
  const key = cleanEnv(process.env.OS_DATA_HUB_KEY);
  if (!key) return [];
  try {
    const formatted = formatPostcode(postcode);
    const url = `${OS_PLACES_BASE}/postcode?postcode=${encodeURIComponent(formatted)}&key=${encodeURIComponent(key)}&dataset=DPA&maxresults=100`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.results ?? [];
    const out: AddressItem[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      const dpa = r.DPA;
      if (!dpa) continue;
      const full = String(dpa.ADDRESS ?? "");
      if (!full) continue;
      // ADDRESS often ends with ", POSTCODE"; trim it for cleaner display
      const cleaned = full.replace(/,\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").trim();
      const titleCased = toTitleCase(cleaned);
      const k = titleCased.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
      if (!seen.has(k)) {
        seen.add(k);
        out.push({
          address: titleCased,
          // THOROUGHFARE_NAME is the whole reason we prefer OS over EPC here:
          // ~35 live licensing schemes are designated street by street, and a
          // postcode cannot resolve them. DEPENDENT_THOROUGHFARE covers the
          // "Back Lane, off High Street" case; the parent street is the one
          // council schedules list, so it wins.
          street: dpa.THOROUGHFARE_NAME ? toTitleCase(String(dpa.THOROUGHFARE_NAME)) : null,
          streetSource: "os",
          buildingNumber: dpa.BUILDING_NUMBER ? String(dpa.BUILDING_NUMBER) : null,
          uprn: dpa.UPRN ? String(dpa.UPRN) : null,
        });
      }
    }
    return out.sort((a, b) => a.address.localeCompare(b.address, "en-GB", { numeric: true }));
  } catch {
    return [];
  }
}

function naturalSortAddresses(addresses: string[]): string[] {
  return [...addresses].sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }));
}

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json({ error: "postcode parameter is required" }, { status: 400 });
  }
  try {
    // Run OS Places + EPC in parallel; combine and dedupe.
    const [epc, os] = await Promise.allSettled([
      fetchAddresses(postcode),
      fetchOsPlacesAddresses(postcode),
    ]);
    const epcList = epc.status === "fulfilled" ? epc.value : [];
    const osList = os.status === "fulfilled" ? os.value : [];

    const seen = new Set<string>();
    const items: AddressItem[] = [];
    const key = (s: string) => s.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
    // OS results first: they are cleaner, more comprehensive, and the only
    // source that carries a separate street name.
    for (const a of osList) {
      if (a.address && !seen.has(key(a.address))) {
        seen.add(key(a.address));
        items.push(a);
      }
    }
    // EPC is the fallback where OS has no key or no coverage. It gives us a
    // display address but no structured street, so those entries cannot resolve
    // a street-level designation and will fall back to "check the boundary".
    for (const a of epcList) {
      if (a.address && !seen.has(key(a.address))) {
        seen.add(key(a.address));
        items.push(a);
      }
    }
    items.sort((a, b) => a.address.localeCompare(b.address, "en-GB", { numeric: true }));

    return NextResponse.json(
      {
        postcode: formatPostcode(postcode),
        // `addresses` is kept as a plain string list so existing callers keep
        // working; `items` carries the street needed for licensing matching.
        addresses: naturalSortAddresses(items.map((i) => i.address)),
        items,
        sources: {
          osPlaces: osList.length,
          epc: epcList.length,
          withStreet: items.filter((i) => i.street).length,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}
