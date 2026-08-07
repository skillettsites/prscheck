/**
 * Turn two buried caveats into records the product can actually carry.
 *
 * Vale of Glamorgan and East Riding both hold notes saying a council source
 * still refers to a live additional licensing scheme that we could not confirm.
 * But both records hold zero schemes, so every surface built on the data
 * declared them scheme-free: the council page headline said "does not currently
 * run a selective or additional licensing scheme", three panels above its own
 * note saying one may exist, and `/api/free-check` returned zero schemes with no
 * caveat at all, so the doubt never reached a paying customer.
 *
 * An `unverified` scheme is exactly the right shape for this. The engine never
 * treats it as requiring a licence, so nothing is over-claimed, but it stops the
 * council reading as confirmed clear.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

const ADDITIONS = [
  {
    gss: "W06000014",
    areaDescription:
      "Shared Regulatory Services states that an additional HMO licence is needed in the Castleland Renewal Area of Barry, but the council's own register and fee list show mandatory licences only, so we could not confirm this scheme is in force.",
    sourceUrl: "https://www.valeofglamorgan.gov.uk/",
    notes:
      "A council source still refers to an additional HMO licensing scheme in the Castleland Renewal Area of Barry, but the Vale's own licence register and fee schedule show mandatory licensing only. We could not confirm whether that scheme is in force. If you let an HMO in central Barry, confirm directly with the council before letting.",
  },
  {
    gss: "E06000011",
    areaDescription:
      "The council's HMO page refers to an additional licensing scheme in Goole but publishes no dates, and its April 2026 fee schedule lists mandatory HMO fees only, so we could not confirm this scheme is in force.",
    sourceUrl: "https://www.eastriding.gov.uk/",
    notes:
      "The council's HMO pages refer to an additional licensing scheme in Goole but give no dates, and its April 2026 fee schedule lists mandatory HMO fees only. We could not confirm whether that scheme is in force. If you let an HMO in Goole, confirm directly with the council before letting.",
  },
];

for (const add of ADDITIONS) {
  const council = data.find((c) => c.gss === add.gss);
  if (!council) {
    console.log(`SKIPPED, council ${add.gss} not found`);
    continue;
  }
  council.schemes ??= [];
  if (council.schemes.some((s) => s.status === "unverified")) {
    console.log(`${council.council}: already carries an unverified scheme, skipped`);
    continue;
  }
  council.schemes.push({
    type: "additional",
    status: "unverified",
    start: null,
    end: null,
    coverage: "areas",
    areaDescription: add.areaDescription,
    feeApprox: null,
    sourceUrl: add.sourceUrl,
  });
  // Drop the "UNVERIFIED:" prefix: it is research shorthand, and the scheme
  // record now carries that meaning structurally.
  council.notes = add.notes;
  console.log(`${council.council}: unverified additional scheme recorded, note rewritten`);
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("Written.");
