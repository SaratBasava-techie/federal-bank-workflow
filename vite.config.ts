import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/",
  },
  tanstackStart: {
    server: { entry: "server" },
    nitro: {
      preset: "node",
      serveStatic: true,        // ← serve static files from dist/client
      publicAssets: [
        {
          dir: "../client",
          maxAge: 31536000,
        }
      ],
    },
  },
});