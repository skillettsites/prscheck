/**
 * Remove two schemes that do not exist.
 *
 * Both records came from commercial aggregators and both assert a licensing
 * requirement where none has ever been in force. That is the false-positive
 * direction, which is cheaper than the reverse, but it is still a paid product
 * telling a landlord to buy a licence they do not need, and it is precisely the
 * error we market ourselves on not making.
 *
 * 1. **Barnet selective.** Approved twice (Housing and Growth Committee, 17 Feb
 *    2022; Cabinet, 12 Dec 2023) and commenced neither time. The designation was
 *    never signed, so no selective licence has ever been required anywhere in
 *    Barnet. Recorded as `proposed` rather than deleted, because the council is
 *    re-consulting from a January 2026 business case and a real scheme is
 *    plausible from late 2026. `proposed` is the status that says "not now, but
 *    watch this", and the engine never treats it as requiring a licence.
 *
 * 2. **Hartlepool selective.** Our record claimed a designation running from 15
 *    Feb 2026, sourced from a commercial site. Hartlepool's last selective
 *    scheme expired on 5 July 2020 and nothing has replaced it; the 2026 date
 *    almost certainly comes from an HMO Article 4 planning direction misread as
 *    licensing. That is the same mistake aggregators made about Warrington.
 *    Deleted outright and replaced with a sourced "we checked, there is none",
 *    because leaving a phantom in as `proposed` would imply a designation is
 *    coming when nothing suggests one is.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "src/data/licensing-schemes.json";
const data = JSON.parse(readFileSync(path, "utf8"));

function findScheme(gss, predicate) {
  const council = data.find((c) => c.gss === gss);
  if (!council) throw new Error(`council ${gss} not found`);
  const index = (council.schemes ?? []).findIndex(predicate);
  return { council, index };
}

// 1. Barnet.
{
  const { council, index } = findScheme("E09000003", (s) => s.type === "selective");
  if (index === -1) {
    console.log("Barnet: no selective record found, nothing to do");
  } else {
    const s = council.schemes[index];
    console.log(`Barnet: was status=${s.status} wards=${JSON.stringify(s.wards)}`);
    s.status = "proposed";
    s.wards = null;
    s.coverage = "areas";
    s.start = null;
    s.end = null;
    s.areaDescription =
      "Approved by committee twice (17 February 2022 and 12 December 2023) but never signed or commenced, so no selective licence has ever been required in Barnet. The council is re-consulting from a January 2026 business case.";
    s.sourceUrl = "https://barnet.moderngov.co.uk/mgAi.aspx?ID=42340";
    council.notes =
      "Barnet has approved a selective licensing designation twice without ever commencing it, so no selective licence is currently required anywhere in the borough. Borough-wide additional (HMO) licensing IS in force. A new selective scheme is being consulted on and could be designated from late 2026.";
    console.log("Barnet: selective record demoted to proposed, ward list cleared");
  }
}

// 2. Hartlepool.
{
  const { council, index } = findScheme("E06000001", (s) => s.type === "selective");
  if (index === -1) {
    console.log("Hartlepool: no selective record found, nothing to do");
  } else {
    const s = council.schemes[index];
    console.log(`Hartlepool: removing status=${s.status} ${s.start}..${s.end} source=${s.sourceUrl}`);
    council.schemes.splice(index, 1);
    council.sourceUrl = "https://www.hartlepool.gov.uk/";
    council.verified = "2026-08-07";
    council.notes =
      "Hartlepool's selective licensing designation expired on 5 July 2020 and has not been replaced, so no selective licence is currently required. The council does operate an HMO Article 4 direction, which is a planning control and not a licensing requirement.";
    console.log(`Hartlepool: selective record deleted, ${council.schemes.length} scheme(s) remain`);
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("Written.");
