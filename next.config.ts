import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
