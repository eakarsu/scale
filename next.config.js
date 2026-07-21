/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client"],
  turbopack: {
    root: __dirname,
  },
}
module.exports = nextConfig
