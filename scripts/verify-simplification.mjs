/**
 * Prove the bundled boundaries answer the same as the councils' originals.
 *
 * The published geometry is simplified before bundling, which trades vertices
 * for accuracy. This checks what that trade actually cost: it fetches the
 * council's own unsimplified boundary, runs a dense grid of points against both
 * versions, and reports every point where they disagree and how far from an
 * edge it sat.
 *
 * A disagreement more than the engine's 100m near-edge margin from the boundary
 * would be a real defect, because that is a point the engine answers
 * definitively. Disagreements inside the margin are expected and harmless: the
 * engine already refuses to answer there.
 *
 * Run with: node scripts/verify-simplification.mjs
 */
import { readFileSync } from "node:fs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PRSCheck/1.0";
const MARGIN = 100;

const bundled = JSON.parse(readFileSync("src/data/scheme-boundaries.json", "utf8"));

function parseCoords(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((t) => t.split(",").map(Number))
    .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
    .map(([lon, lat]) => [lon, lat]);
}

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

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inside(lon, lat, polygons) {
  for (const rings of polygons) {
    const [outer, ...holes] = rings;
    if (pointInRing(lon, lat, outer) && !holes.some((h) => pointInRing(lon, lat, h))) return true;
  }
  return false;
}

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distance(lon, lat, polygons) {
  const sx = 111320 * Math.cos((lat * Math.PI) / 180);
  const sy = 110574;
  const px = lon * sx;
  const py = lat * sy;
  let best = Infinity;
  for (const rings of polygons) {
    for (const ring of rings) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const d = distToSeg(px, py, ring[j][0] * sx, ring[j][1] * sy, ring[i][0] * sx, ring[i][1] * sy);
        if (d < best) best = d;
      }
    }
  }
  return best;
}

const res = await fetch("https://liverpool.gov.uk/KML/SelectiveLicensingBoundary.kml", {
  headers: { "User-Agent": UA },
});
const original = parseKml(await res.text());
const simplified = bundled["E08000012"][0].polygons;

console.log(
  `Liverpool: original ${original.flat().reduce((n, r) => n + r.length, 0)} vertices, ` +
    `bundled ${simplified.flat().reduce((n, r) => n + r.length, 0)}`,
);

// Dense grid over Liverpool's bounding box.
let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;
for (const r of original.flat()) {
  for (const [x, y] of r) {
    if (x < minLon) minLon = x;
    if (x > maxLon) maxLon = x;
    if (y < minLat) minLat = y;
    if (y > maxLat) maxLat = y;
  }
}

const STEPS = 300;
let tested = 0;
let disagree = 0;
let worstBeyondMargin = 0;
const offenders = [];

for (let i = 0; i <= STEPS; i++) {
  for (let j = 0; j <= STEPS; j++) {
    const lon = minLon + ((maxLon - minLon) * i) / STEPS;
    const lat = minLat + ((maxLat - minLat) * j) / STEPS;
    tested++;
    const a = inside(lon, lat, original);
    const b = inside(lon, lat, simplified);
    if (a === b) continue;
    disagree++;
    // How far is this point from the ORIGINAL boundary? That is what decides
    // whether the engine would have answered definitively here.
    const d = distance(lon, lat, original);
    if (d > MARGIN) {
      worstBeyondMargin = Math.max(worstBeyondMargin, d);
      if (offenders.length < 10) offenders.push({ lon, lat, d, original: a, bundled: b });
    }
  }
}

console.log(`\n${tested.toLocaleString()} grid points tested`);
console.log(`${disagree} disagreements (${((disagree / tested) * 100).toFixed(3)}%)`);
console.log(`disagreements more than ${MARGIN}m from the real edge: ${offenders.length === 0 ? 0 : offenders.length}+`);

if (offenders.length > 0) {
  console.log(`\nThese would be answered definitively AND wrongly, worst ${Math.round(worstBeyondMargin)}m from the edge:`);
  for (const o of offenders) {
    console.log(`  ${o.lat.toFixed(6)}, ${o.lon.toFixed(6)}  ${Math.round(o.d)}m  original=${o.original} bundled=${o.bundled}`);
  }
  process.exit(1);
}
console.log(`\nEvery disagreement sits inside the ${MARGIN}m margin, where the engine already refuses to answer.`);
