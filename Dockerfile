# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use lockfile if present for reproducible builds)
COPY package*.json ./
RUN npm install

# Copy source and build the SSR bundle (outputs to /app/dist)
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Cloud Run injects PORT (defaults to 8080) and expects the container
# to listen on 0.0.0.0 at that port. Nitro's node preset honors HOST/PORT.
ENV HOST=0.0.0.0
ENV PORT=8080

# Only ship production deps + built output to keep the image small
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Start the TanStack Start SSR server
CMD ["node", "dist/server/server.js"]
