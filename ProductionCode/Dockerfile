# 🚀 CONSTRUCTION AI PRODUCTION DOCKERFILE
# =======================================

# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (production only)
FROM base AS deps
RUN pnpm install --prod --frozen-lockfile

# Install all dependencies (including dev)
FROM base AS dev-deps
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Create required directories
RUN mkdir -p uploads output logs golden_dataset

# Production stage
FROM base AS production

# Copy node modules and built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/output ./output
COPY --from=builder /app/logs ./logs
COPY --from=builder /app/golden_dataset ./golden_dataset
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "src/construction/server.js"]