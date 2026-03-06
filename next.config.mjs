/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.11"],
  reactCompiler: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
