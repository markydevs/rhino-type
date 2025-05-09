import type { NextConfig } from "next";

const repoName = "rhino-type";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
	basePath: isProd ? `/${repoName}` : "",
	assetPrefix: isProd ? `/${repoName}/` : "",
	output: "export",
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
