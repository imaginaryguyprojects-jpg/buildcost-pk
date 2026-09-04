/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@buildcost/config",
    "@buildcost/types",
    "@buildcost/calculations",
    "@buildcost/validation"
  ],
  reactStrictMode: true
};

export default nextConfig;
