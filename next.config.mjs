const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      // pdf.js' default build calls Promise.withResolvers, URL.parse and other
      // APIs that Chrome older than 119-126 lacks (school PCs on Windows 7/8
      // stop at Chrome 109). The legacy build ships its own polyfills.
      // scripts/copy-pdf-worker.mjs copies the matching legacy worker.
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs",
    },
  },
  images: {
    qualities: [50, 75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "n14jpqkv.api.sanity.io",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "storage.tatugaschool.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "development-storage.tatugaschool.com",
      },
    ],
  },
};

export default nextConfig;
