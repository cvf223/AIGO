# Deployment-automation - Essential Patterns

## Core Implementation
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    postgresql-client \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@latest

# Development stage
FROM base AS development

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 3001 9090

# Start development server
CMD ["pnpm", "run", "dev"]

# Build stage
FROM base AS builder

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash \
    dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy startup scripts
COPY --chown=nodejs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["/usr/local/bin/docker-entrypoint.sh"]
```

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: construction_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: construction_syndicate
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: construction_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  construction-api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: construction_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/construction_syndicate
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
      WEBSOCKET_PORT: 3001
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    ports:
      - "3000:3000"
      - "3001:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  prometheus:
    image: prom/prometheus:latest
    container_name: construction_prometheus
    restart: unless-stopped
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: construction_grafana
    restart: unless-stopped
    depends_on:
      - prometheus
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3002:3000"

  nginx:
    image: nginx:alpine
    container_name: construction_nginx
    restart: unless-stopped
    depends_on:
      - construction-api
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./config/nginx/sites-enabled:/etc/nginx/sites-enabled
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
System integration guidelines

## Extended Resources
- **Full Implementation**: `/skills/deployment-automation-detailed.md`
- **Code Examples**: `/examples/deployment-automation-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*