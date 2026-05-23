import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config) => {
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		}
		config.resolve.fallback = {
			...config.resolve.fallback,
			buffer: require.resolve("buffer/"),
			fs: false,
			path: false,
			crypto: false,
		}
		return config
	},
}

export default nextConfig
