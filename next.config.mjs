/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  serverExternalPackages: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb", "@aws-sdk/client-scheduler", "@aws-sdk/client-bedrock-runtime"],
  turbopack: {
    root: import.meta.dirname
  }
};

export default nextConfig;
