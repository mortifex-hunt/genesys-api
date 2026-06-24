FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime
FROM node:20-bookworm-slim

WORKDIR /app

# Install curl and gnupg (required for downloading and verifying zrok)
RUN apt-get update && apt-get install -y curl gnupg && rm -rf /var/lib/apt/lists/*

# Install zrok using official installation script
RUN curl -sSf https://get.openziti.io/install.bash | bash -s zrok

# Set NODE_ENV to production
ENV NODE_ENV=production
# Default port for Cloud Run
ENV PORT=8080

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copy the generated Prisma Client from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy the compiled build from the builder stage
COPY --from=builder /app/dist ./dist

# Copy start.sh script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 8080

CMD ["./start.sh"]
