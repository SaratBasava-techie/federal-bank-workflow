# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
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

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/.output /app/.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
