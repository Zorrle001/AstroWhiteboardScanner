// src/pages/cached-scripts/opencv.a4f92c1.js.ts

import type { APIRoute } from "astro";

export const prerender = false;

export const GET = (async ({ request }) => {
    const sourceUrl = new URL("/source-scripts/opencv.a4f92c1.js", request.url);

    const sourceResponse = await fetch(sourceUrl);

    if (!sourceResponse.ok || !sourceResponse.body) {
        return new Response("OpenCV script not found", {
            status: sourceResponse.status || 404,
        });
    }

    return new Response(sourceResponse.body, {
        status: 200,
        headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": "text/javascript; charset=utf-8",
        },
    });
}) satisfies APIRoute;
