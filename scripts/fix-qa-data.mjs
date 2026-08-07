/**
 * Data fixes from the live QA pass.
 *
 * 1. **Two "address checker" links do not check addresses.** Lambeth's points at
 *    an ArcGIS experience titled "Wards, Polling Stations Exp Feb 2026" and
 *    Lewisham's dead-ends at a login wall. Both return HTTP 200, so nothing
 *    flagged them. Sending a landlord to the wrong map is worse than sending
 *    them nowhere, because the engine cites these as the way to resolve a
 *    boundary it will not answer.
 *
 * 2. **Westminster shows two designations in force on the same day.** The 2021
 *    scheme is recorded ending 31 August 2026 and its successor starting 31
 *    August 2026, so both are live on that date. The instrument says the old one
 *    ceases to have effect on 31 August, i.e. its last day is the 30th.
 *
 * 3. Sutton's note still carries research shorthand.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

function council(gss) {
  const c = data.find((x) => x.gss === gss);
  if (!c) throw new Error(`council ${gss} not found`);
  return c;
}

// 1. Remove checker links that do not resolve an address.
for (const [gss, why] of [
  ["E09000022", "points at a wards and polling stations map, not the licensing designation"],
  ["E09000023", "dead-ends at a login wall"],
]) {
  const c = council(gss);
  let removed = 0;
  for (const s of c.schemes ?? []) {
    if (s.checkerUrl) {
      delete s.checkerUrl;
      removed++;
    }
  }
  console.log(`${c.council}: removed ${removed} checker link(s), ${why}`);
}

// 2. Westminster's cutover.
{
  const c = council("E09000033");
  const old = (c.schemes ?? []).find((s) => s.type === "additional" && s.start === "2021-08-30");
  const next = (c.schemes ?? []).find((s) => s.type === "additional" && s.start === "2026-08-31");
  if (old && next) {
    console.log(`City of Westminster: 2021 additional end ${old.end} -> 2026-08-30 (successor starts ${next.start})`);
    old.end = "2026-08-30";
  } else {
    console.log("City of Westminster: could not find both additional designations, skipped");
  }
}

// 3. Sutton.
{
  const c = data.find((x) => x.council === "London Borough of Sutton");
  if (c) {
    c.notes =
      "Sutton runs no selective licensing scheme. The council does not publish an end date for its additional scheme, so the date shown is calculated from the standard five-year designation term.";
    console.log("London Borough of Sutton: note rewritten");
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("Written.");
