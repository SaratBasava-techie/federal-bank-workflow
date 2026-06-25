import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Allow overriding the Nitro preset at build time so the same project can
// deploy to Lovable (Cloudflare Workers, the default) or to a Node host
// like Cloud Run / Docker by running `NITRO_PRESET=node-server npm run build`.
const nodePreset = process.env.NITRO_PRESET;

export default defineConfig({
  vite: {
    base: "/",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  ...(nodePreset
    ? {
        nitro: {
          preset: nodePreset,
        },
      }
    : {}),
});