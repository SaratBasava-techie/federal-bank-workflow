# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the manifest and the patches/ dir first so the `postinstall`
# (patch-package) can run during `npm install`. The patch fixes a broken
# ESM export in nitro's vendored @vercel/nft that otherwise crashes the
# node-server build.
COPY package*.json ./
COPY patches ./patches
RUN npm install

COPY . .

ENV NITRO_PRESET=node-server
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Runtime deps only. --ignore-scripts skips the postinstall patch-package
# step (a devDependency, absent here); the runtime never rebuilds, so the
# patch is not needed in this stage.
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/.output /app/.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
