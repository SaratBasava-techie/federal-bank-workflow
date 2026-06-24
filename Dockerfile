# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/client ./dist/client
EXPOSE 8080
ENV PORT=8080
CMD ["serve", "dist/client", "-s", "-l", "8080"]