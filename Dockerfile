# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use lockfile if present for reproducible builds)
COPY package*.json ./
RUN npm install

# Copy source and build the SSR bundle (outputs to /app/dist).
# NITRO_PRESET=node-server makes Nitro emit a self-listening Node server
# at dist/server/index.mjs (instead of a Cloudflare Workers module),
# which is what Cloud Run / generic Docker hosts need.
ENV NITRO_PRESET=node-server
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Cloud Run injects PORT (defaults to 8080) and expects the container
# to listen on 0.0.0.0 at that port. Nitro's node-server preset honors
# the standard NITRO_HOST / NITRO_PORT (and PORT) env vars.
ENV NITRO_HOST=0.0.0.0
ENV HOST=0.0.0.0
ENV PORT=8080

# The node-server preset bundles all runtime deps into dist/, so we don't
# need to reinstall node_modules in the runtime image.
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Start the self-listening Nitro Node server.
CMD ["node", "dist/server/index.mjs"]
