const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
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
