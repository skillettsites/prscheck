/**
 * Scan the research output for machine-readable boundary sources.
 *
 * Several councils publish the designation as geometry rather than as a list:
 * a KML, an ArcGIS feature service, a MapServer layer. That geometry is the
 * legal boundary itself, so matching a property's coordinates against it gives
 * an exact answer where no street or postcode schedule exists at all.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const INCOMING = "scripts/incoming";
const GEO = /arcgis|mapserver|featureserver|\.kml|geojson|maps\.|\/rest\/services|wfs|ows/i;
const URL_RE = /https?:\/\/[^\s,)\]"'<>]+/g;

for (const file of readdirSync(INCOMING).filter((f) => f.endsWith(".json")).sort()) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(join(INCOMING, file), "utf8"));
  } catch {
    continue;
  }
  const hits = new Set();
  let checker = null;
  for (const s of doc.schemes ?? []) {
    if (s.checkerUrl) checker = s.checkerUrl;
    const text = [s.boundaryDescription, s.evidence, s.checkerUrl, s.sourceUrl].filter(Boolean).join(" ");
    for (const u of text.match(URL_RE) ?? []) if (GEO.test(u)) hits.add(u.replace(/[.,;]$/, ""));
  }
  if (hits.size === 0 && !checker) continue;
  console.log(`\n== ${file} (${doc.council}) ==`);
  if (checker) console.log(`  checker: ${checker}`);
  for (const u of hits) console.log(`  GEO: ${u}`);
}
