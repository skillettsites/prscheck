/**
 * One-off: reshape research output that does not map one-to-one onto our records.
 *
 * Two mismatches, both legitimate:
 *
 * 1. Rotherham's scheme is six separate s.80 designations made on the same day.
 *    The council presents them as six areas, and the research returned six
 *    objects, but we hold them as a single record. They share dates, source and
 *    status, so their street and postcode lists are unioned into one entry
 *    rather than six overwriting each other.
 *
 * 2. Indicative lists are flagged. A published street list is not automatically
 *    the legal boundary, and treating one as though it were asserts a licence
 *    requirement the council has not. Rotherham states verbatim that "not all
 *    properties within a street or postcode may be subject to Selective
 *    Licensing due to where the boundary falls". Doncaster's list comes from its
 *    consultation evidence base, not the designation instrument.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function load(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

// 1. Rotherham: union six designations into one entry.
const rotherhamPath = "scripts/incoming/areas-rotherham.json";
if (existsSync(rotherhamPath)) {
  const doc = load(rotherhamPath);
  if (doc.schemes.length > 1) {
    const streets = new Map();
    const postcodes = new Set();
    const areaNames = [];
    for (const s of doc.schemes) {
      for (const st of s.streets ?? []) {
        const name = String(st.name ?? "").trim();
        if (!name) continue;
        // Keep the entry that carries a number restriction, if any does.
        if (!streets.has(name.toLowerCase()) || st.numbers) streets.set(name.toLowerCase(), st);
      }
      for (const p of s.postcodes ?? []) postcodes.add(String(p).trim().toUpperCase());
      for (const a of s.areaNames ?? []) areaNames.push(a);
    }
    const first = doc.schemes[0];
    doc.schemes = [
      {
        ...first,
        match: { type: "selective", coverage: "areas" },
        streets: [...streets.values()],
        postcodes: [...postcodes],
        areaNames,
        listIsIndicative: true,
        evidence:
          `Union of the council's six separate s.80 designations, all made 14 Nov 2025 and in force 15 Feb 2026 to 14 Feb 2031. ` +
          `The council states verbatim that not all properties within a listed street or postcode are subject to licensing, because of where the boundary falls, so these lists are indicative. ` +
          (first.evidence ?? ""),
      },
    ];
    writeFileSync(rotherhamPath, JSON.stringify(doc, null, 2) + "\n");
    console.log(
      `Rotherham: 6 designations unioned -> ${doc.schemes[0].streets.length} streets, ${doc.schemes[0].postcodes.length} postcodes, marked indicative`,
    );
  }
}

// 2. Doncaster: street list is consultation evidence, not the designation.
const doncasterPath = "scripts/incoming/areas-doncaster.json";
if (existsSync(doncasterPath)) {
  const doc = load(doncasterPath);
  for (const s of doc.schemes) {
    if ((s.streets ?? []).length > 0) s.listIsIndicative = true;
  }
  writeFileSync(doncasterPath, JSON.stringify(doc, null, 2) + "\n");
  console.log(`Doncaster: street list marked indicative (${doc.schemes[0].streets.length} streets)`);
}
