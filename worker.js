export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const PREFIX = "/tools/shopify-to-medusa";

        if (url.pathname.startsWith(PREFIX)) {
            const newPath = url.pathname.replace(PREFIX, "") || "/";
            const assetUrl = new URL(newPath, request.url);

            return env.ASSETS.fetch(assetUrl, request);
        }

        return new Response("Not found", { status: 404 });
    }
}