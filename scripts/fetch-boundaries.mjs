/**
 * Fetch councils' published designation GEOMETRY and bundle it for the engine.
 *
 * Some designations are not a list of anything. They are a shape on a map, and
 * the shape IS the legal boundary. Where the council publishes that shape in a
 * machine-readable form, matching a property's coordinates against it answers
 * the question exactly, with no street name to derive and no ward to approximate.
 *
 * Sources are the councils' own services, the same files their own address
 * checkers load.
 *
 * Usage: node scripts/fetch-boundaries.mjs [--dry]
 * Output: src/data/scheme-boundaries.json
 */
import { writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PRSCheck/1.0";

/**
 * Simplification tolerance in degrees, roughly 5 metres at UK latitudes.
 *
 * Kept deliberately tight. The engine already refuses to answer near an edge,
 * but simplification error and that margin are different things: the margin
 * exists to absorb the postcode centroid being metres from the property, and
 * it should not also be absorbing avoidable sloppiness in the boundary itself.
 */
const TOLERANCE = 0.00005;

const SOURCES = [
  {
    gss: "E08000012",
    council: "Liverpool City Council",
    match: { type: "selective", start: "2022-04-01" },
    url: "https://liverpool.gov.uk/KML/SelectiveLicensingBoundary.kml",
    format: "kml",
    note: "The KML the council's own 'Do I need a selective licence?' checker loads.",
  },
  {
    gss: "E09000030",
    council: "London Borough of Tower Hamlets",
    match: { type: "selective", start: "2021-10-01" },
    url: "https://services1.arcgis.com/KZuCGRSe2K5BiG1Z/arcgis/rest/services/Internet_Private_Landlord_Licensing_areas/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson",
    format: "geojson",
    note: "The council's public feature service backing its own licensing map. Its designation uses pre-2014 ward names, so geometry is the only reliable match.",
  },
  // Gedling runs two designations and its map service publishes one layer per
  // designated area, so the layers are split between them rather than merged.
  // Merging would tell a Netherfield landlord they fall under the Phase 2
  // scheme as well, and a Carlton Hill one that Phase 1a applies to them. Both
  // still answer "licence required", but from the wrong designation, with the
  // wrong dates and the wrong fee on the report they paid for.
  {
    gss: "E07000173",
    council: "Gedling Borough Council (Phase 1a, Netherfield)",
    match: { type: "selective", start: "2025-01-05" },
    url: "https://gedlingmaps.gedling.gov.uk/arcgis/rest/services/AGOL/Selective_Licensing_area/MapServer",
    format: "arcgis-mapserver",
    layerFilter: (name) => /netherfield/i.test(name),
    note: "The council publishes no street or postcode list at all; the map layer is the only definition.",
  },
  {
    gss: "E07000173",
    council: "Gedling Borough Council (Phase 2)",
    match: { type: "selective", start: "2022-11-01" },
    url: "https://gedlingmaps.gedling.gov.uk/arcgis/rest/services/AGOL/Selective_Licensing_area/MapServer",
    format: "arcgis-mapserver",
    layerFilter: (name) => !/netherfield/i.test(name),
    note: "The council publishes no street or postcode list at all; the map layers are the only definition.",
  },
];

/**
 * Fetch with retries. Council map servers are small and time out under a burst
 * of layer queries, and a transient failure here silently drops a designation
 * from the bundle, which reads downstream as "we hold no boundary" rather than
 * as an error.
 */
async function get(url, asJson = true, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: asJson ? "application/json" : "*/*" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return asJson ? res.json() : res.text();
    } catch (e) {
      lastError = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error(`${lastError?.message ?? "failed"} for ${url}`);
}

/** KML holds one or more Placemarks, each with outer and optional inner rings. */
function parseKml(xml) {
  const polygons = [];
  for (const poly of xml.match(/<Polygon>[\s\S]*?<\/Polygon>/g) ?? []) {
    const outer = poly.match(/<outerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!outer) continue;
    const rings = [parseCoords(outer[1])];
    for (const inner of poly.match(/<innerBoundaryIs>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/g) ?? []) {
      const c = inner.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
      if (c) rings.push(parseCoords(c[1]));
    }
    polygons.push(rings);
  }
  return polygons;
}

function parseCoords(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((t) => t.split(",").map(Number))
    .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
    .map(([lon, lat]) => [lon, lat]);
}

/** GeoJSON FeatureCollection of Polygons and MultiPolygons. */
function parseGeoJson(json) {
  const polygons = [];
  for (const f of json.features ?? []) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon") polygons.push(g.coordinates);
    else if (g.type === "MultiPolygon") for (const p of g.coordinates) polygons.push(p);
  }
  return polygons;
}

/** Douglas-Peucker. Boundaries carry far more vertices than a yes/no needs. */
function simplifyRing(points, tolerance) {
  if (points.length < 4) return points;
  const sqTol = tolerance * tolerance;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;

  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxSq = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const sq = sqSegDist(points[i], points[first], points[last]);
      if (sq > maxSq) {
        maxSq = sq;
        index = i;
      }
    }
    if (maxSq > sqTol && index > 0) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function sqSegDist(p, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

/** Round to ~1cm. Full float precision is wasted bytes in a bundled file. */
const round = (n) => Math.round(n * 1e7) / 1e7;

const out = {};
let totalBefore = 0;
let totalAfter = 0;

for (const src of SOURCES) {
  try {
    let polygons;
    if (src.format === "kml") {
      polygons = parseKml(await get(src.url, false));
    } else if (src.format === "geojson") {
      polygons = parseGeoJson(await get(src.url));
    } else if (src.format === "arcgis-mapserver") {
      // Enumerate the service's layers; each designated area is its own layer.
      const meta = await get(`${src.url}?f=json`);
      polygons = [];
      for (const layer of meta.layers ?? []) {
        if (layer.geometryType !== "esriGeometryPolygon") continue;
        if (src.layerFilter && !src.layerFilter(layer.name)) continue;
        const q = `${src.url}/${layer.id}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`;
        try {
          polygons.push(...parseGeoJson(await get(q)));
          console.log(`  layer ${layer.id} "${layer.name}" ok`);
        } catch (e) {
          console.log(`  layer ${layer.id} "${layer.name}" FAILED: ${e.message}`);
        }
      }
    }

    if (!polygons || polygons.length === 0) {
      console.log(`${src.council}: no polygons parsed, SKIPPED`);
      continue;
    }

    const before = polygons.flat().reduce((n, r) => n + r.length, 0);
    const simplified = polygons
      .map((rings) => rings.map((r) => simplifyRing(r, TOLERANCE).map(([x, y]) => [round(x), round(y)])))
      // A ring needs at least a triangle to enclose anything.
      .map((rings) => rings.filter((r) => r.length >= 4))
      .filter((rings) => rings.length > 0);
    const after = simplified.flat().reduce((n, r) => n + r.length, 0);
    totalBefore += before;
    totalAfter += after;

    (out[src.gss] ??= []).push({
      match: src.match,
      source: src.url.split("?")[0],
      note: src.note,
      polygons: simplified,
    });
    console.log(
      `${src.council}: ${simplified.length} polygon(s), ${before} -> ${after} vertices (${Math.round((1 - after / before) * 100)}% fewer)`,
    );
  } catch (e) {
    console.log(`${src.council}: FAILED ${e.message}`);
  }
}

const json = JSON.stringify(out);
console.log(`\ntotal vertices ${totalBefore} -> ${totalAfter}, bundle ${Math.round(json.length / 1024)}KB`);

// Refuse to overwrite good data with a partial fetch. A council dropping out
// because its map server blipped would silently remove boundary answers we
// already had, and nothing downstream can tell that apart from "never had one".
const expected = new Set(SOURCES.map((s) => s.gss));
const got = new Set(Object.keys(out));
const missing = [...expected].filter((g) => !got.has(g));
if (missing.length > 0) {
  console.error(`\nFAILED: no boundary parsed for ${missing.join(", ")}. Not writing a partial bundle.`);
  process.exit(1);
}

if (DRY) {
  console.log("Dry run, nothing written.");
} else {
  writeFileSync("src/data/scheme-boundaries.json", JSON.stringify(out, null, 0) + "\n");
  console.log("Wrote src/data/scheme-boundaries.json");
}
