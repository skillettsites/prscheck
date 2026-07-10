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
    else if (path.startsWith('/councils/')) { priority = 0.75; changefreq = 'weekly'; }
    else if (path.startsWith('/guides/')) { priority = 0.8; changefreq = 'monthly'; }
    else if (['/pricing', '/demo', '/solutions', '/contact'].includes(path)) { priority = 0.9; }
    else if (path === '/platform') { priority = 0.9; }
    else if (path.startsWith('/platform/')) { priority = 0.8; }
    else if (path.startsWith('/solutions/')) { priority = 0.8; }
    else if (path.startsWith('/resources/') && path !== '/resources') { priority = 0.7; changefreq = 'monthly'; }
    else if (['/about', '/api-docs', '/resources'].includes(path)) { priority = 0.6; }
    else if (['/privacy', '/terms'].includes(path)) { priority = 0.3; changefreq = 'monthly'; }

    return { loc: path, lastmod: new Date().toISOString(), changefreq, priority };
  },

  additionalPaths: async (config) => {
    const now = new Date().toISOString();
    const paths = [];

    // /check reads searchParams so it renders dynamically and next-sitemap
    // does not auto-discover it. It is the primary conversion page, so add it.
    paths.push({ loc: '/check', lastmod: now, changefreq: 'weekly', priority: 0.95 });

    // Platform pages
    const platformPages = [
      'compliance-screening', 'hmo-detection', 'enforcement-pipeline',
      'tenant-complaints', 'reporting', 'prs-database',
      'civil-penalties', 'selective-licensing',
    ];
    for (const slug of platformPages) {
      paths.push({ loc: `/platform/${slug}`, lastmod: now, changefreq: 'weekly', priority: 0.8 });
    }
    paths.push({ loc: '/platform', lastmod: now, changefreq: 'weekly', priority: 0.9 });

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
      paths.push({ loc: `/resources/${slug}`, lastmod: now, changefreq: 'monthly', priority: 0.7 });
    }

    return paths;
  },
}
