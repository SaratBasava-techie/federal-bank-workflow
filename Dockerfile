FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Build project
RUN npm run build

# Cloud Run uses port 8080
ENV PORT=8080
EXPOSE 8080

# Start the SSR server
CMD ["npm", "start"]
