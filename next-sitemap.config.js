/**
 * LASTMOD IS DELIBERATELY OMITTED.
 *
 * Every entry used to carry `new Date().toISOString()`, so each build told
 * Google and Bing that all 447 URLs had changed, including the ~320 council
 * pages that had not. A sitemap that claims everything changed every time is a
 * sitemap crawlers learn to ignore, and lastmod is the one signal that gets a
 * genuinely updated page recrawled quickly. Omitting it is better than lying:
 * the crawler falls back to its own heuristics rather than distrusting ours.
 *
 * If per-page dates are wanted later, take them from the underlying data (a
 * scheme's `verified` date for a council page, for instance), never from the
 * build clock.
 */
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://prscheck.co.uk',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/opengraph-image', '/r/*', '/checkout/*'],

  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path.startsWith('/r/') || path.startsWith('/checkout')) return null;
    if (path === '/') { priority = 1.0; changefreq = 'daily'; }
    else if (path === '/check') { priority = 0.95; changefreq = 'weekly'; }
    else if (path === '/councils' || path === '/guides') { priority = 0.9; changefreq = 'weekly'; }
    // The two audience hubs are the top of their silos and the pages the rest
    // of each silo links up to, so they sit level with /councils and /guides.
    else if (path === '/tenants' || path === '/landlords') { priority = 0.9; changefreq = 'weekly'; }
    // The tenant money pages. /rent-repayment-order and its calculator are the
    // highest-intent pages on the site, above a council page.
    else if (path.startsWith('/tenants/') || path.startsWith('/landlords/')) { priority = 0.85; changefreq = 'monthly'; }
    else if (path.startsWith('/councils/')) { priority = 0.75; changefreq = 'weekly'; }
    else if (path.startsWith('/guides/')) { priority = 0.8; changefreq = 'monthly'; }
    else if (['/pricing', '/demo', '/solutions', '/contact'].includes(path)) { priority = 0.9; }
    else if (path === '/platform') { priority = 0.9; }
    else if (path.startsWith('/platform/')) { priority = 0.8; }
    else if (path.startsWith('/solutions/')) { priority = 0.8; }
    else if (path.startsWith('/resources/') && path !== '/resources') { priority = 0.7; changefreq = 'monthly'; }
    else if (['/about', '/api-docs', '/resources'].includes(path)) { priority = 0.6; }
    else if (['/privacy', '/terms'].includes(path)) { priority = 0.3; changefreq = 'monthly'; }

    return { loc: path, changefreq, priority };
  },

  additionalPaths: async (config) => {
    const paths = [];

    // /check reads searchParams so it renders dynamically and next-sitemap
    // does not auto-discover it. It is the primary conversion page, so add it.
    paths.push({ loc: '/check', changefreq: 'weekly', priority: 0.95 });
    paths.push({ loc: '/property-licence-check', changefreq: 'weekly', priority: 0.9 });

    // Audience silos. next-sitemap discovers these from the build output, but
    // listing them here is what guarantees the priorities above are applied
    // rather than falling through to the 0.7 default if discovery misses one.
    paths.push({ loc: '/landlords', changefreq: 'weekly', priority: 0.9 });
    paths.push({ loc: '/landlords/rent-repayment-orders', changefreq: 'monthly', priority: 0.85 });
    paths.push({ loc: '/tenants', changefreq: 'weekly', priority: 0.9 });
    for (const slug of [
      'rent-repayment-order',
      'rent-repayment-order-calculator',
      'is-my-landlord-licensed',
      'unlicensed-hmo',
    ]) {
      paths.push({ loc: `/tenants/${slug}`, changefreq: 'monthly', priority: 0.85 });
    }

    // Platform pages
    const platformPages = [
      'compliance-screening', 'hmo-detection', 'enforcement-pipeline',
      'tenant-complaints', 'reporting', 'prs-database',
      'civil-penalties', 'selective-licensing',
    ];
    for (const slug of platformPages) {
      paths.push({ loc: `/platform/${slug}`, changefreq: 'weekly', priority: 0.8 });
    }
    paths.push({ loc: '/platform', changefreq: 'weekly', priority: 0.9 });

    // Resource articles (batch 1)
    const batch1 = [
      'renters-rights-act-2025-council-guide', 'prs-database-implementation-guide',
      'civil-penalties-framework-2026', 'decent-homes-standard-prs',
      'awaabs-law-private-sector-enforcement', 'rent-repayment-orders-council-guide',
      'hmo-detection-methods', 'compliance-screening-at-scale',
      'enforcement-pipeline-management', 'tenant-complaint-triage-system',
      'civil-penalty-calculation-guide', 'proactive-vs-reactive-enforcement',
      'evidence-gathering-enforcement', 'gas-safety-compliance-monitoring',
      'electrical-safety-eicr-enforcement', 'epc-minimum-standards-enforcement',
      'deposit-protection-compliance', 'fire-safety-hmo-requirements',
      'damp-mould-enforcement-timeline', 'small-council-enforcement-strategy',
      'london-borough-enforcement-guide', 'university-town-hmo-enforcement',
      'new-enforcement-team-setup', 'measuring-enforcement-outcomes',
      'g-cloud-procurement-guide',
    ];

    // Resource articles (batch 2)
    const batch2 = [
      'hmo-licensing-requirements-2026', 'selective-licensing-setup-guide',
      'mandatory-landlord-registration', 'section-21-abolition-enforcement-impact',
      'prs-ombudsman-council-interaction', 'housing-act-2004-enforcement-powers',
      'epc-data-enforcement', 'council-tax-data-hmo-detection',
      'open-data-prs-enforcement', 'digital-enforcement-tools-comparison',
      'api-integration-council-systems', 'automated-compliance-checking',
      'overcrowding-standards-enforcement', 'property-licensing-compliance-tracking',
      'landlord-fitness-assessment', 'managing-agent-compliance',
      'hhsrs-assessment-guide', 'enforcement-notice-templates',
      'rural-council-prs-enforcement', 'enforcement-team-training-guide',
      'budget-allocation-prs-enforcement', 'councillor-briefing-prs-enforcement',
      'cross-council-enforcement-collaboration', 'data-sharing-between-councils',
      'gis-mapping-prs-properties',
    ];

    for (const slug of [...batch1, ...batch2]) {
      paths.push({ loc: `/resources/${slug}`, changefreq: 'monthly', priority: 0.7 });
    }

    return paths;
  },
}
