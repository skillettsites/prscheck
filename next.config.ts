import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every UK council now has a page, so the build prerenders 456 static pages.
  // Next defaults to one worker per core (15 here) and each worker holds its own
  // copy of the council and licensing data, which was enough to exhaust memory
  // partway through generation. Capping the workers trades a slower build for
  // one that completes; Vercel's build machines are wide enough that this is
  // still comfortably fast.
  experimental: {
    cpus: 4,
  },
  async redirects() {
    return [
      // Canonicalise to apex: www 301 -> apex so only one host serves 200
      // (matches the canonical tag, which Google was overriding to www).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.prscheck.co.uk" }],
        destination: "https://prscheck.co.uk/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
