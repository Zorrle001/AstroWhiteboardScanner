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
    site: "https://astrowhiteboardscanner.zorrle001.dev",
    trailingSlash: "always",
    adapter: node({ mode: "standalone" }),
    cache: {
        provider: memoryCache(),
    },
    routeRules: {
        "/api/[...path]": { swr: 600 },
        "/products/[...slug]": { maxAge: 3600, tags: ["products"] },
        "/blog/[...slug]": { maxAge: 300, swr: 60 },
    },
});
