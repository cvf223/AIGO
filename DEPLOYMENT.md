# 🚀 Construction AI Production Deployment Guide

## Prerequisites

- Node.js 20+ and pnpm
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 15+ (for database)
- Redis 7+ (for caching and queues)
- SSL certificates (for HTTPS)
- Domain name (for production access)

## Quick Start

### 1. Local Development

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Initialize database
psql -U postgres -f init-db.sql

# Start development server
pnpm run dev
```

### 2. Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f construction-server

# Stop services
docker-compose down
```

### 3. Production Deployment

#### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start src/construction/server.js --name construction-ai -i max

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Systemd

Create `/etc/systemd/system/construction-ai.service`:

```ini
[Unit]
Description=Construction AI Server
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/construction-ai
ExecStart=/usr/bin/node src/construction/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable construction-ai
sudo systemctl start construction-ai
```

## Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=construction_materials
DB_USER=construction_user
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# SSL (for HTTPS)
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# External APIs
STLB_API_KEY=your-api-key
ALCHEMY_API_KEY=your-api-key
```

### Nginx Configuration

For production, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /output/ {
        alias /opt/construction-ai/output/;
        autoindex off;
    }
}
```

## Database Setup

Initialize the PostgreSQL database:

```sql
-- Create database
CREATE DATABASE construction_materials;

-- Create user
CREATE USER construction_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE construction_materials TO construction_user;

-- Connect to database
\c construction_materials;

-- Create tables
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    properties JSONB,
    standards JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up backup strategy
- [ ] Enable monitoring and alerting
- [ ] Configure log rotation
- [ ] Implement DDoS protection

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

### Metrics

Access Prometheus metrics at:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### Logs

View logs in real-time:

```bash
# Docker logs
docker-compose logs -f construction-server

# PM2 logs
pm2 logs construction-ai

# System logs
tail -f /opt/construction-ai/logs/combined.log
```

## Backup Strategy

### Automated Backups

Create a backup script `/opt/construction-ai/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/construction-ai"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump -U construction_user construction_materials > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploaded files
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/construction-ai/uploads/

# Backup output files
tar -czf "$BACKUP_DIR/output_$DATE.tar.gz" /opt/construction-ai/output/

# Remove old backups (keep last 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete
```

Add to crontab:

```bash
0 2 * * * /opt/construction-ai/backup.sh
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use HAProxy or Nginx for load balancing
2. **Multiple Instances**: Run multiple server instances
3. **Shared Storage**: Use NFS or S3 for shared file storage
4. **Database Replication**: Set up PostgreSQL replication
5. **Redis Cluster**: Configure Redis cluster for high availability

### Vertical Scaling

Adjust Docker resources:

```yaml
services:
  construction-server:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify credentials in .env
   - Check firewall rules

3. **Out of Memory**
   - Increase Node.js heap size: `NODE_OPTIONS="--max-old-space-size=4096"`
   - Scale horizontally

4. **Slow Performance**
   - Enable Redis caching
   - Optimize database queries
   - Use CDN for static files

## Support

For production support:
- Documentation: [docs.construction-ai.com](https://docs.construction-ai.com)
- Email: support@construction-ai.com
- Monitoring: Check Grafana dashboards
- Logs: Check application and system logs
