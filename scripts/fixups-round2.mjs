/**
 * Corrections that the generic merge cannot express.
 *
 * 1. Oldham's street list is explicitly advisory. The council prints "for
 *    guidance purposes only... your street, although not appearing on the list
 *    may still be included". Without marking it indicative, a street absent from
 *    a 453-entry list would return a confident "not in area" that the council
 *    itself disclaims.
 *
 * 2. Oldham's ward list has two wards that are not in the designation notice.
 *    They came from a third-party listing, which is exactly the failure mode
 *    this dataset exists to beat, and they would tell landlords in Failsworth
 *    East and Saddleworth West & Lees that they need a licence they do not.
 *
 * 3. Conwy runs three additional licensing schemes and we hold one. Two live
 *    ward-defined designations were simply missing, so Colwyn Bay and Llandudno
 *    landlords were told nothing about schemes that apply to them.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

// 1 + 2. Oldham.
const oldham = data.find((c) => c.gss === "E08000004");
const oldhamScheme = oldham?.schemes?.find((s) => s.type === "selective" && s.status === "active");
if (!oldhamScheme) throw new Error("Oldham active selective scheme not found");

// Verbatim from the Notice of Designation.
const DESIGNATED = [
  "Alexandra", "St Mary's", "St James", "Waterhead", "Coldhurst",
  "Werneth", "Chadderton South", "Hollinwood", "Medlock Vale",
];
const norm = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const ons = JSON.parse(readFileSync("src/data/wards.json", "utf8"))["E08000004"] ?? [];
const resolved = DESIGNATED.map((w) => ons.find((o) => norm(o) === norm(w)) ?? w);
const unknown = resolved.filter((w) => !ons.some((o) => norm(o) === norm(w)));

const before = oldhamScheme.wards ?? [];
const dropped = before.filter((w) => !resolved.some((r) => norm(r) === norm(w)));
oldhamScheme.wards = resolved;
oldhamScheme.listIsIndicative = true;

console.log(`Oldham wards: ${before.length} -> ${resolved.length}`);
console.log(`  dropped (not in the designation notice): ${dropped.join(", ") || "none"}`);
if (unknown.length) console.log(`  WARNING, not matched to ONS: ${unknown.join(", ")}`);
console.log(`Oldham street list marked indicative (${(oldhamScheme.streets ?? []).length} streets)`);

// 3. Conwy's two missing ward-defined designations.
const conwy = data.find((c) => c.gss === "W06000003");
if (!conwy) throw new Error("Conwy record not found");

// The Welsh notice says "rhan o ward etholiadol" (PART of the electoral ward)
// where the English says "covering the electoral wards". Whole-ward coverage is
// therefore not established, so these carry the caveat rather than asserting it.
const MISSING = [
  {
    name: "Colwyn Bay",
    wards: ["Glyn", "Rhiw"],
    area: "Parts of the Glyn and Rhiw wards, Colwyn Bay. The Welsh-language notice describes this as part of the electoral ward, so confirm the exact address with the council.",
  },
  {
    name: "Llandudno and Craig y Don",
    wards: ["Craig-y-Don", "Tudno", "Gogarth Mostyn"],
    area: "Parts of the Craig y Don, Tudno and Gogarth Mostyn wards, Llandudno. The Welsh-language notice describes this as part of the electoral ward, so confirm the exact address with the council.",
  },
];

const conwyOns = JSON.parse(readFileSync("src/data/wards.json", "utf8"))["W06000003"] ?? [];
const template = conwy.schemes[0];
for (const m of MISSING) {
  const already = conwy.schemes.some((s) => s.start === "2026-04-01" && (s.areaDescription ?? "").includes(m.name));
  if (already) {
    console.log(`Conwy ${m.name}: already present, skipped`);
    continue;
  }
  const wards = m.wards.map((w) => conwyOns.find((o) => norm(o) === norm(w)) ?? null).filter(Boolean);
  const missing = m.wards.filter((w) => !conwyOns.some((o) => norm(o) === norm(w)));
  conwy.schemes.push({
    type: "additional",
    status: "active",
    start: "2026-04-01",
    end: "2031-03-31",
    coverage: "wards",
    wards,
    areaDescription: m.area,
    feeApprox: template.feeApprox ?? null,
    sourceUrl: template.sourceUrl,
  });
  console.log(`Conwy ${m.name}: added, ${wards.length}/${m.wards.length} wards matched to ONS${missing.length ? ` (unmatched: ${missing.join(", ")})` : ""}`);
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("Written.");
