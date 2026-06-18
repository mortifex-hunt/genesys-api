FROM node:20-alpine AS builder

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
FROM node:20-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production
# Default port for Cloud Run
ENV PORT=8080

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Generate Prisma Client again for the runtime environment
RUN npx prisma generate

# Copy the compiled build from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "start"]
