/** @type {import('next').NextConfig} */
const isMobile = process.env.BUILD_TARGET === "mobile";

const nextConfig = {
  transpilePackages: [
    "@buildcost/config",
    "@buildcost/types",
    "@buildcost/calculations",
    "@buildcost/validation"
  ],
  output: isMobile ? "export" : undefined,
  assetPrefix: isMobile ? "./" : undefined,
  images: {
    unoptimized: isMobile ? true : undefined
  },
  trailingSlash: isMobile ? true : undefined,
  reactStrictMode: true
};

export default nextConfig;
