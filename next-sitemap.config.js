/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://prscheck.co.uk',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*'],
}
