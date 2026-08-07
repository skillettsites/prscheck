/**
 * Regenerates src/data/wards.json from the ONS Open Geography Portal.
 * Ward names in scheme designations are transcribed from council PDFs that
 * often predate a boundary review, so they must be checked against the
 * current ward set rather than trusted. Re-run after each ONS ward vintage.
 */
import fs from "node:fs/promises";
const BASE =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/WD25_LAD25_UK_LU_v2/FeatureServer/0/query";
const rows = [];
for (let off = 0; ; off += 1000) {
  const r = await fetch(
    `${BASE}?where=1%3D1&outFields=WD25NM,LAD25CD&returnGeometry=false&resultOffset=${off}&resultRecordCount=1000&f=json`,
  );
  const j = await r.json();
  if (!j.features) throw new Error(JSON.stringify(j).slice(0, 300));
  rows.push(...j.features.map((f) => f.attributes));
  if (j.features.length < 1000) break;
}
const byLad = {};
for (const a of rows) (byLad[a.LAD25CD] ??= []).push(a.WD25NM);
for (const k of Object.keys(byLad)) byLad[k].sort((a, b) => a.localeCompare(b, "en-GB"));
await fs.writeFile("src/data/wards.json", JSON.stringify(byLad, null, 0) + "\n");
console.log(`wrote src/data/wards.json: ${rows.length} wards across ${Object.keys(byLad).length} councils`);
