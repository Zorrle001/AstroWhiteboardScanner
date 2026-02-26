// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	prefetch: {
		defaultStrategy: "load",
	},
	vite: {
		server: {
			watch: {
				usePolling: true,
			},
		},
	},
	site: 'https://zorrle001.github.io',
  	base: '/AstroWhiteboardScanner',
});
