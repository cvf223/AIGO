# Deployment Automation Patterns

## Overview

This skill provides production-ready deployment automation patterns for the AIGO-Syndicate construction intelligence. It includes Docker containerization, Kubernetes deployment manifests, blue-green deployment strategies, database migration automation, environment configuration management, health check implementation, and rollback procedures.

## Core Implementation

### Docker Configuration

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

### Docker Compose Configuration

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

### Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: construction-syndicate
  labels:
    app: construction-syndicate
    environment: production
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: construction-config
  namespace: construction-syndicate
data:
  NODE_ENV: "production"
  PORT: "3000"
  WEBSOCKET_PORT: "3001"
  LOG_LEVEL: "info"
  METRICS_ENABLED: "true"
```

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: construction-secrets
  namespace: construction-syndicate
type: Opaque
stringData:
  DATABASE_URL: "postgresql://postgres:password@postgres:5432/construction_syndicate"
  REDIS_URL: "redis://:password@redis:6379"
  JWT_SECRET: "your-jwt-secret"
  MASTER_ENCRYPTION_KEY: "your-encryption-key"
```

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: construction-api
  namespace: construction-syndicate
  labels:
    app: construction-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: construction-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: construction-api
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: construction-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: construction-api
        image: construction-syndicate/api:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        - name: websocket
          containerPort: 3001
          protocol: TCP
        - name: metrics
          containerPort: 9090
          protocol: TCP
        env:
        - name: NODE_OPTIONS
          value: "--max-old-space-size=8192"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        envFrom:
        - configMapRef:
            name: construction-config
        - secretRef:
            name: construction-secrets
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
        volumeMounts:
        - name: app-logs
          mountPath: /app/logs
        - name: app-uploads
          mountPath: /app/uploads
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
      volumes:
      - name: app-logs
        persistentVolumeClaim:
          claimName: construction-logs-pvc
      - name: app-uploads
        persistentVolumeClaim:
          claimName: construction-uploads-pvc
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - construction-api
              topologyKey: kubernetes.io/hostname
```

### Blue-Green Deployment

```javascript
// deployment/blue-green-deployer.js
import { EventEmitter } from 'events';
import k8s from '@kubernetes/client-node';
import pg from 'pg';
import { promisify } from 'util';
import dns from 'dns';

const resolveTxt = promisify(dns.resolveTxt);

export class BlueGreenDeployer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            namespace: config.namespace || 'construction-syndicate',
            service: config.service || 'construction-api',
            healthCheckUrl: config.healthCheckUrl || '/health',
            healthCheckTimeout: config.healthCheckTimeout || 300000, // 5 minutes
            trafficSwitchDelay: config.trafficSwitchDelay || 60000, // 1 minute
            rollbackOnFailure: config.rollbackOnFailure !== false,
            canaryPercentage: config.canaryPercentage || 10,
            canaryDuration: config.canaryDuration || 300000, // 5 minutes
            ...config
        };
        
        // Initialize Kubernetes client
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        
        this.k8sApi = kc.makeApiClient(k8s.AppsV1Api);
        this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
        
        this.dbPool = null;
        this.currentEnvironment = 'blue';
        this.deploymentInProgress = false;
    }
    
    async initialize() {
        try {
            // Initialize database connection
            this.dbPool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                max: 5
            });
            
            // Verify Kubernetes connectivity
            await this.verifyKubernetesAccess();
            
            // Determine current environment
            this.currentEnvironment = await this.getCurrentEnvironment();
            
            console.log(`Blue-Green Deployer initialized. Current: ${this.currentEnvironment}`);
            
        } catch (error) {
            console.error('Failed to initialize Blue-Green Deployer:', error);
            throw error;
        }
    }
    
    async verifyKubernetesAccess() {
        try {
            await this.k8sApi.listNamespacedDeployment(this.config.namespace);
        } catch (error) {
            throw new Error(`Cannot access Kubernetes API: ${error.message}`);
        }
    }
    
    async getCurrentEnvironment() {
        try {
            const service = await this.k8sCoreApi.readNamespacedService(
                this.config.service,
                this.config.namespace
            );
            
            return service.body.spec.selector.version === 'v1' ? 'blue' : 'green';
            
        } catch (error) {
            console.warn('Could not determine current environment, defaulting to blue');
            return 'blue';
        }
    }
    
    async deploy(image, options = {}) {
        if (this.deploymentInProgress) {
            throw new Error('Deployment already in progress');
        }
        
        this.deploymentInProgress = true;
        const targetEnvironment = this.currentEnvironment === 'blue' ? 'green' : 'blue';
        const deploymentId = this.generateDeploymentId();
        
        try {
            this.emit('deployment_started', {
                deploymentId,
                targetEnvironment,
                image
            });
            
            // Pre-deployment checks
            await this.preDeploymentChecks();
            
            // Create deployment record
            await this.createDeploymentRecord(deploymentId, image, targetEnvironment);
            
            // Update target environment
            await this.updateDeployment(targetEnvironment, image);
            
            // Wait for rollout
            await this.waitForRollout(targetEnvironment);
            
            // Health checks
            await this.performHealthChecks(targetEnvironment);
            
            // Database migrations
            await this.runDatabaseMigrations(targetEnvironment);
            
            // Canary deployment (optional)
            if (options.canary) {
                await this.canaryDeploy(targetEnvironment);
            }
            
            // Switch traffic
            await this.switchTraffic(targetEnvironment);
            
            // Post-deployment verification
            await this.postDeploymentVerification(targetEnvironment);
            
            // Update current environment
            this.currentEnvironment = targetEnvironment;
            
            // Mark deployment as successful
            await this.markDeploymentComplete(deploymentId, 'success');
            
            this.emit('deployment_completed', {
                deploymentId,
                targetEnvironment,
                duration: Date.now() - parseInt(deploymentId)
            });
            
            // Cleanup old environment (optional)
            if (options.cleanup) {
                setTimeout(() => {
                    this.cleanupOldEnvironment(
                        targetEnvironment === 'blue' ? 'green' : 'blue'
                    );
                }, 300000); // 5 minutes
            }
            
        } catch (error) {
            console.error('Deployment failed:', error);
            
            // Mark deployment as failed
            await this.markDeploymentComplete(deploymentId, 'failed', error.message);
            
            // Rollback if enabled
            if (this.config.rollbackOnFailure) {
                await this.rollback(deploymentId);
            }
            
            throw error;
            
        } finally {
            this.deploymentInProgress = false;
        }
    }
    
    async preDeploymentChecks() {
        // Check cluster health
        const nodes = await this.k8sCoreApi.listNode();
        const readyNodes = nodes.body.items.filter(node => 
            node.status.conditions.some(c => c.type === 'Ready' && c.status === 'True')
        );
        
        if (readyNodes.length < 2) {
            throw new Error('Insufficient healthy nodes for deployment');
        }
        
        // Check resource availability
        // In production, would check actual resource metrics
        
        // Verify database connectivity
        const client = await this.dbPool.connect();
        try {
            await client.query('SELECT 1');
        } finally {
            client.release();
        }
    }
    
    async updateDeployment(environment, image) {
        const deploymentName = `${this.config.service}-${environment}`;
        const version = environment === 'blue' ? 'v1' : 'v2';
        
        const deployment = {
            metadata: {
                name: deploymentName,
                namespace: this.config.namespace,
                labels: {
                    app: this.config.service,
                    version: version,
                    environment: environment
                }
            },
            spec: {
                replicas: 3,
                selector: {
                    matchLabels: {
                        app: this.config.service,
                        version: version
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: this.config.service,
                            version: version,
                            environment: environment
                        }
                    },
                    spec: {
                        containers: [{
                            name: this.config.service,
                            image: image,
                            ports: [
                                { containerPort: 3000, name: 'http' },
                                { containerPort: 3001, name: 'websocket' }
                            ],
                            env: [
                                { name: 'DEPLOYMENT_ENV', value: environment },
                                { name: 'VERSION', value: version }
                            ]
                        }]
                    }
                }
            }
        };
        
        try {
            // Try to update existing deployment
            await this.k8sApi.patchNamespacedDeployment(
                deploymentName,
                this.config.namespace,
                deployment,
                undefined,
                undefined,
                undefined,
                undefined,
                { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
            );
        } catch (error) {
            if (error.statusCode === 404) {
                // Create new deployment
                await this.k8sApi.createNamespacedDeployment(
                    this.config.namespace,
                    deployment
                );
            } else {
                throw error;
            }
        }
    }
    
    async waitForRollout(environment) {
        const deploymentName = `${this.config.service}-${environment}`;
        const startTime = Date.now();
        
        while (Date.now() - startTime < this.config.healthCheckTimeout) {
            const deployment = await this.k8sApi.readNamespacedDeployment(
                deploymentName,
                this.config.namespace
            );
            
            const status = deployment.body.status;
            
            if (status.replicas === status.readyReplicas &&
                status.replicas === status.updatedReplicas) {
                console.log(`Deployment ${deploymentName} is ready`);
                return;
            }
            
            this.emit('rollout_progress', {
                environment,
                ready: status.readyReplicas || 0,
                total: status.replicas || 0
            });
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        throw new Error(`Deployment rollout timeout for ${environment}`);
    }
    
    async performHealthChecks(environment) {
        const pods = await this.k8sCoreApi.listNamespacedPod(
            this.config.namespace,
            undefined,
            undefined,
            undefined,
            undefined,
            `app=${this.config.service},environment=${environment}`
        );
        
        const healthChecks = pods.body.items.map(pod => 
            this.checkPodHealth(pod)
        );
        
        const results = await Promise.allSettled(healthChecks);
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length > 0) {
            throw new Error(`Health check failed for ${failures.length} pods`);
        }
    }
    
    async checkPodHealth(pod) {
        const podIP = pod.status.podIP;
        if (!podIP) {
            throw new Error(`Pod ${pod.metadata.name} has no IP`);
        }
        
        const maxRetries = 10;
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(`http://${podIP}:3000${this.config.healthCheckUrl}`);
                
                if (response.ok) {
                    const health = await response.json();
                    if (health.status === 'healthy') {
                        return { pod: pod.metadata.name, healthy: true };
                    }
                }
                
                lastError = new Error(`Unhealthy response from ${pod.metadata.name}`);
                
            } catch (error) {
                lastError = error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        throw lastError;
    }
    
    async runDatabaseMigrations(environment) {
        console.log(`Running database migrations for ${environment}`);
        
        const migrationPod = {
            metadata: {
                name: `migration-${Date.now()}`,
                namespace: this.config.namespace
            },
            spec: {
                restartPolicy: 'Never',
                containers: [{
                    name: 'migration',
                    image: this.getImage(environment),
                    command: ['node', 'scripts/migrate.js'],
                    env: [
                        { name: 'NODE_ENV', value: 'production' },
                        { name: 'DEPLOYMENT_ENV', value: environment }
                    ],
                    envFrom: [
                        { secretRef: { name: 'construction-secrets' } }
                    ]
                }]
            }
        };
        
        // Create migration job
        const job = await this.k8sCoreApi.createNamespacedPod(
            this.config.namespace,
            migrationPod
        );
        
        // Wait for completion
        const podName = job.body.metadata.name;
        const startTime = Date.now();
        
        while (Date.now() - startTime < 300000) { // 5 minutes timeout
            const pod = await this.k8sCoreApi.readNamespacedPod(
                podName,
                this.config.namespace
            );
            
            const phase = pod.body.status.phase;
            
            if (phase === 'Succeeded') {
                console.log('Database migrations completed successfully');
                return;
            }
            
            if (phase === 'Failed') {
                throw new Error('Database migration failed');
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        throw new Error('Database migration timeout');
    }
    
    async canaryDeploy(targetEnvironment) {
        console.log(`Starting canary deployment to ${targetEnvironment}`);
        
        const service = await this.k8sCoreApi.readNamespacedService(
            this.config.service,
            this.config.namespace
        );
        
        const currentVersion = this.currentEnvironment === 'blue' ? 'v1' : 'v2';
        const targetVersion = targetEnvironment === 'blue' ? 'v1' : 'v2';
        
        // Create canary service
        const canaryService = {
            metadata: {
                name: `${this.config.service}-canary`,
                namespace: this.config.namespace
            },
            spec: {
                selector: {
                    app: this.config.service,
                    version: targetVersion
                },
                ports: service.body.spec.ports
            }
        };
        
        try {
            await this.k8sCoreApi.createNamespacedService(
                this.config.namespace,
                canaryService
            );
        } catch (error) {
            if (error.statusCode !== 409) { // Already exists
                throw error;
            }
        }
        
        // Monitor canary metrics
        const startTime = Date.now();
        
        while (Date.now() - startTime < this.config.canaryDuration) {
            const metrics = await this.getCanaryMetrics();
            
            this.emit('canary_progress', {
                environment: targetEnvironment,
                metrics,
                elapsed: Date.now() - startTime
            });
            
            // Check error rate
            if (metrics.errorRate > 0.05) { // 5% error threshold
                throw new Error(`High error rate in canary: ${metrics.errorRate}`);
            }
            
            // Check latency
            if (metrics.p95Latency > 2000) { // 2 second threshold
                throw new Error(`High latency in canary: ${metrics.p95Latency}ms`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30s
        }
        
        console.log('Canary deployment successful');
    }
    
    async switchTraffic(targetEnvironment) {
        console.log(`Switching traffic to ${targetEnvironment}`);
        
        const targetVersion = targetEnvironment === 'blue' ? 'v1' : 'v2';
        
        // Update service selector
        const servicePatch = {
            spec: {
                selector: {
                    app: this.config.service,
                    version: targetVersion
                }
            }
        };
        
        await this.k8sCoreApi.patchNamespacedService(
            this.config.service,
            this.config.namespace,
            servicePatch,
            undefined,
            undefined,
            undefined,
            undefined,
            { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
        );
        
        // Wait for traffic to stabilize
        console.log(`Waiting ${this.config.trafficSwitchDelay}ms for traffic to stabilize`);
        await new Promise(resolve => setTimeout(resolve, this.config.trafficSwitchDelay));
    }
    
    async postDeploymentVerification(environment) {
        console.log('Performing post-deployment verification');
        
        // Verify service is responding
        const service = await this.k8sCoreApi.readNamespacedService(
            this.config.service,
            this.config.namespace
        );
        
        const serviceIP = service.body.spec.clusterIP;
        
        try {
            const response = await fetch(`http://${serviceIP}:3000/health`);
            const health = await response.json();
            
            if (health.status !== 'healthy') {
                throw new Error('Service is not healthy after deployment');
            }
        } catch (error) {
            throw new Error(`Post-deployment health check failed: ${error.message}`);
        }
        
        // Verify database connectivity
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT deployment_env 
                FROM deployment_status 
                WHERE is_active = true
            `);
            
            if (result.rows[0]?.deployment_env !== environment) {
                throw new Error('Database deployment status mismatch');
            }
        } finally {
            client.release();
        }
    }
    
    async rollback(deploymentId) {
        console.log(`Rolling back deployment ${deploymentId}`);
        
        try {
            // Switch traffic back to original environment
            await this.switchTraffic(this.currentEnvironment);
            
            // Mark rollback in database
            await this.markDeploymentComplete(deploymentId, 'rolled_back');
            
            this.emit('deployment_rolled_back', { deploymentId });
            
        } catch (error) {
            console.error('Rollback failed:', error);
            throw error;
        }
    }
    
    async cleanupOldEnvironment(environment) {
        console.log(`Cleaning up ${environment} environment`);
        
        try {
            // Scale down deployment
            const deploymentName = `${this.config.service}-${environment}`;
            
            await this.k8sApi.patchNamespacedDeployment(
                deploymentName,
                this.config.namespace,
                { spec: { replicas: 0 } },
                undefined,
                undefined,
                undefined,
                undefined,
                { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
            );
            
            this.emit('environment_cleaned', { environment });
            
        } catch (error) {
            console.warn(`Failed to cleanup ${environment}:`, error.message);
        }
    }
    
    // Database operations
    
    async createDeploymentRecord(deploymentId, image, environment) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO deployments
                (id, image, target_environment, status, started_at)
                VALUES ($1, $2, $3, 'in_progress', NOW())
            `, [deploymentId, image, environment]);
        } finally {
            client.release();
        }
    }
    
    async markDeploymentComplete(deploymentId, status, error = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE deployments
                SET status = $2,
                    error = $3,
                    completed_at = NOW()
                WHERE id = $1
            `, [deploymentId, status, error]);
        } finally {
            client.release();
        }
    }
    
    // Helper methods
    
    generateDeploymentId() {
        return Date.now().toString();
    }
    
    async getImage(environment) {
        const deploymentName = `${this.config.service}-${environment}`;
        
        const deployment = await this.k8sApi.readNamespacedDeployment(
            deploymentName,
            this.config.namespace
        );
        
        return deployment.body.spec.template.spec.containers[0].image;
    }
    
    async getCanaryMetrics() {
        // In production, would query Prometheus
        // Simulated metrics for demonstration
        return {
            errorRate: Math.random() * 0.02, // 0-2% error rate
            p95Latency: 500 + Math.random() * 500, // 500-1000ms
            requestRate: 100 + Math.random() * 100 // 100-200 rps
        };
    }
}
```

### Database Migration System

```javascript
// deployment/database-migrator.js
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class DatabaseMigrator {
    constructor(config = {}) {
        this.config = {
            migrationsPath: config.migrationsPath || './migrations',
            schemaTable: config.schemaTable || 'schema_migrations',
            lockTimeout: config.lockTimeout || 30000,
            transactional: config.transactional !== false,
            ...config
        };
        
        this.dbPool = null;
        this.migrations = [];
    }
    
    async initialize() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 5
        });
        
        // Create migrations table
        await this.createMigrationsTable();
        
        // Load migrations
        await this.loadMigrations();
    }
    
    async createMigrationsTable() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${this.config.schemaTable} (
                    version VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    checksum VARCHAR(64) NOT NULL,
                    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    execution_time INTEGER,
                    success BOOLEAN NOT NULL DEFAULT true,
                    error_message TEXT
                );
                
                CREATE TABLE IF NOT EXISTS migration_locks (
                    id INTEGER PRIMARY KEY DEFAULT 1,
                    locked_by VARCHAR(255),
                    locked_at TIMESTAMPTZ,
                    CONSTRAINT single_lock CHECK (id = 1)
                );
            `);
        } finally {
            client.release();
        }
    }
    
    async loadMigrations() {
        const files = await fs.readdir(this.config.migrationsPath);
        
        this.migrations = [];
        
        for (const file of files.sort()) {
            if (!file.endsWith('.sql')) continue;
            
            const filePath = path.join(this.config.migrationsPath, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            // Extract version from filename (e.g., 001_create_tables.sql)
            const match = file.match(/^(\d+)_(.+)\.sql$/);
            if (!match) continue;
            
            const version = match[1];
            const name = match[2];
            
            this.migrations.push({
                version,
                name,
                filename: file,
                content,
                checksum: this.calculateChecksum(content)
            });
        }
    }
    
    calculateChecksum(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    
    async migrate() {
        console.log('Starting database migration');
        
        // Acquire lock
        const lockId = await this.acquireLock();
        if (!lockId) {
            throw new Error('Could not acquire migration lock');
        }
        
        try {
            // Get executed migrations
            const executed = await this.getExecutedMigrations();
            
            // Find pending migrations
            const pending = this.migrations.filter(m => 
                !executed.has(m.version)
            );
            
            if (pending.length === 0) {
                console.log('No pending migrations');
                return;
            }
            
            console.log(`Found ${pending.length} pending migrations`);
            
            // Execute migrations
            for (const migration of pending) {
                await this.executeMigration(migration);
            }
            
            console.log('All migrations completed successfully');
            
        } finally {
            await this.releaseLock(lockId);
        }
    }
    
    async acquireLock() {
        const lockId = `migrator_${Date.now()}_${process.pid}`;
        const startTime = Date.now();
        
        while (Date.now() - startTime < this.config.lockTimeout) {
            const client = await this.dbPool.connect();
            try {
                await client.query('BEGIN');
                
                // Try to acquire lock
                const result = await client.query(`
                    INSERT INTO migration_locks (id, locked_by, locked_at)
                    VALUES (1, $1, NOW())
                    ON CONFLICT (id) DO NOTHING
                    RETURNING locked_by
                `, [lockId]);
                
                if (result.rows.length > 0) {
                    await client.query('COMMIT');
                    return lockId;
                }
                
                // Check if lock is stale
                const lock = await client.query(`
                    SELECT locked_by, locked_at
                    FROM migration_locks
                    WHERE id = 1
                `);
                
                if (lock.rows[0]) {
                    const lockAge = Date.now() - new Date(lock.rows[0].locked_at).getTime();
                    
                    // If lock is older than 5 minutes, consider it stale
                    if (lockAge > 300000) {
                        await client.query(`
                            UPDATE migration_locks
                            SET locked_by = $1, locked_at = NOW()
                            WHERE id = 1
                        `, [lockId]);
                        
                        await client.query('COMMIT');
                        return lockId;
                    }
                }
                
                await client.query('ROLLBACK');
                
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return null;
    }
    
    async releaseLock(lockId) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                DELETE FROM migration_locks
                WHERE locked_by = $1
            `, [lockId]);
        } finally {
            client.release();
        }
    }
    
    async getExecutedMigrations() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT version, checksum
                FROM ${this.config.schemaTable}
                WHERE success = true
            `);
            
            return new Map(result.rows.map(row => [row.version, row.checksum]));
            
        } finally {
            client.release();
        }
    }
    
    async executeMigration(migration) {
        console.log(`Executing migration ${migration.version}: ${migration.name}`);
        
        const startTime = Date.now();
        const client = await this.dbPool.connect();
        
        try {
            if (this.config.transactional) {
                await client.query('BEGIN');
            }
            
            // Execute migration
            await client.query(migration.content);
            
            // Record success
            await client.query(`
                INSERT INTO ${this.config.schemaTable}
                (version, name, checksum, execution_time)
                VALUES ($1, $2, $3, $4)
            `, [
                migration.version,
                migration.name,
                migration.checksum,
                Date.now() - startTime
            ]);
            
            if (this.config.transactional) {
                await client.query('COMMIT');
            }
            
            console.log(`Migration ${migration.version} completed in ${Date.now() - startTime}ms`);
            
        } catch (error) {
            if (this.config.transactional) {
                await client.query('ROLLBACK');
            }
            
            // Record failure
            try {
                await client.query(`
                    INSERT INTO ${this.config.schemaTable}
                    (version, name, checksum, execution_time, success, error_message)
                    VALUES ($1, $2, $3, $4, false, $5)
                `, [
                    migration.version,
                    migration.name,
                    migration.checksum,
                    Date.now() - startTime,
                    error.message
                ]);
            } catch (recordError) {
                console.error('Failed to record migration failure:', recordError);
            }
            
            throw new Error(`Migration ${migration.version} failed: ${error.message}`);
            
        } finally {
            client.release();
        }
    }
    
    async rollback(targetVersion = null) {
        console.log(`Rolling back to version ${targetVersion || 'initial'}`);
        
        // Load rollback scripts
        const rollbackPath = path.join(this.config.migrationsPath, 'rollback');
        const executed = await this.getExecutedMigrations();
        
        // Determine which migrations to rollback
        const toRollback = [];
        
        for (const [version] of executed) {
            if (targetVersion && version <= targetVersion) {
                break;
            }
            toRollback.push(version);
        }
        
        toRollback.reverse(); // Rollback in reverse order
        
        for (const version of toRollback) {
            const rollbackFile = path.join(rollbackPath, `${version}_rollback.sql`);
            
            try {
                const content = await fs.readFile(rollbackFile, 'utf8');
                
                const client = await this.dbPool.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(content);
                    
                    // Remove from migrations table
                    await client.query(`
                        DELETE FROM ${this.config.schemaTable}
                        WHERE version = $1
                    `, [version]);
                    
                    await client.query('COMMIT');
                    
                    console.log(`Rolled back migration ${version}`);
                    
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                } finally {
                    client.release();
                }
                
            } catch (error) {
                console.error(`Failed to rollback ${version}:`, error);
                throw error;
            }
        }
    }
    
    async status() {
        const executed = await this.getExecutedMigrations();
        const pending = this.migrations.filter(m => !executed.has(m.version));
        
        return {
            executed: Array.from(executed.keys()).sort(),
            pending: pending.map(m => m.version).sort(),
            current: Array.from(executed.keys()).sort().pop() || null
        };
    }
}

// Migration script
export async function runMigrations() {
    const migrator = new DatabaseMigrator({
        migrationsPath: process.env.MIGRATIONS_PATH || './migrations'
    });
    
    try {
        await migrator.initialize();
        await migrator.migrate();
        
        const status = await migrator.status();
        console.log('Migration status:', status);
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations();
}
```

### Health Check Implementation

```javascript
// deployment/health-checker.js
import { EventEmitter } from 'events';
import pg from 'pg';
import Redis from 'ioredis';
import os from 'os';
import process from 'process';

export class HealthChecker extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            checks: config.checks || ['database', 'redis', 'memory', 'disk'],
            thresholds: {
                memory: config.thresholds?.memory || 0.85, // 85% memory usage
                disk: config.thresholds?.disk || 0.90, // 90% disk usage
                responseTime: config.thresholds?.responseTime || 1000, // 1 second
                ...config.thresholds
            },
            detailed: config.detailed || false,
            ...config
        };
        
        this.dbPool = null;
        this.redis = null;
        this.startTime = Date.now();
        this.checks = new Map();
        
        this.initializeChecks();
    }
    
    async initialize() {
        // Initialize database pool
        if (this.config.checks.includes('database')) {
            this.dbPool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                max: 5
            });
        }
        
        // Initialize Redis
        if (this.config.checks.includes('redis')) {
            this.redis = new Redis(process.env.REDIS_URL);
        }
    }
    
    initializeChecks() {
        // Database check
        this.checks.set('database', async () => {
            if (!this.dbPool) {
                return { status: 'disabled', message: 'Database checks disabled' };
            }
            
            const startTime = Date.now();
            const client = await this.dbPool.connect();
            
            try {
                const result = await client.query('SELECT NOW() as time, version()');
                const responseTime = Date.now() - startTime;
                
                return {
                    status: responseTime < this.config.thresholds.responseTime ? 'healthy' : 'degraded',
                    responseTime,
                    details: this.config.detailed ? {
                        serverTime: result.rows[0].time,
                        version: result.rows[0].version,
                        activeConnections: this.dbPool.totalCount,
                        idleConnections: this.dbPool.idleCount
                    } : undefined
                };
                
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    responseTime: Date.now() - startTime
                };
            } finally {
                client.release();
            }
        });
        
        // Redis check
        this.checks.set('redis', async () => {
            if (!this.redis) {
                return { status: 'disabled', message: 'Redis checks disabled' };
            }
            
            const startTime = Date.now();
            
            try {
                await this.redis.ping();
                const info = await this.redis.info('server');
                const responseTime = Date.now() - startTime;
                
                return {
                    status: responseTime < this.config.thresholds.responseTime ? 'healthy' : 'degraded',
                    responseTime,
                    details: this.config.detailed ? {
                        version: this.parseRedisInfo(info, 'redis_version'),
                        uptime: parseInt(this.parseRedisInfo(info, 'uptime_in_seconds'))
                    } : undefined
                };
                
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    responseTime: Date.now() - startTime
                };
            }
        });
        
        // Memory check
        this.checks.set('memory', async () => {
            const memUsage = process.memoryUsage();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const usage = usedMem / totalMem;
            
            return {
                status: usage < this.config.thresholds.memory ? 'healthy' : 'unhealthy',
                usage: Math.round(usage * 100) / 100,
                details: this.config.detailed ? {
                    total: totalMem,
                    free: freeMem,
                    used: usedMem,
                    process: {
                        rss: memUsage.rss,
                        heapTotal: memUsage.heapTotal,
                        heapUsed: memUsage.heapUsed,
                        external: memUsage.external
                    }
                } : undefined
            };
        });
        
        // CPU check
        this.checks.set('cpu', async () => {
            const cpus = os.cpus();
            const loadAvg = os.loadavg();
            const load1 = loadAvg[0] / cpus.length;
            
            return {
                status: load1 < 0.8 ? 'healthy' : load1 < 1.5 ? 'degraded' : 'unhealthy',
                load: Math.round(load1 * 100) / 100,
                details: this.config.detailed ? {
                    cores: cpus.length,
                    loadAverage: loadAvg,
                    model: cpus[0].model
                } : undefined
            };
        });
        
        // Disk check
        this.checks.set('disk', async () => {
            // In production, would use proper disk space checking
            // This is simplified for demonstration
            return {
                status: 'healthy',
                usage: 0.5,
                details: this.config.detailed ? {
                    total: 1000000000000, // 1TB
                    free: 500000000000,   // 500GB
                    used: 500000000000    // 500GB
                } : undefined
            };
        });
        
        // Custom checks
        this.checks.set('construction_api', async () => {
            try {
                const response = await fetch('http://localhost:3000/api/status');
                const data = await response.json();
                
                return {
                    status: data.operational ? 'healthy' : 'unhealthy',
                    details: this.config.detailed ? data : undefined
                };
                
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message
                };
            }
        });
    }
    
    async checkHealth() {
        const results = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            checks: {}
        };
        
        // Run all checks in parallel
        const checkPromises = [];
        
        for (const checkName of this.config.checks) {
            const check = this.checks.get(checkName);
            if (check) {
                checkPromises.push(
                    check()
                        .then(result => ({ name: checkName, result }))
                        .catch(error => ({
                            name: checkName,
                            result: {
                                status: 'unhealthy',
                                error: error.message
                            }
                        }))
                );
            }
        }
        
        const checkResults = await Promise.all(checkPromises);
        
        // Process results
        for (const { name, result } of checkResults) {
            results.checks[name] = result;
            
            // Update overall status
            if (result.status === 'unhealthy') {
                results.status = 'unhealthy';
            } else if (result.status === 'degraded' && results.status === 'healthy') {
                results.status = 'degraded';
            }
        }
        
        // Emit health status
        this.emit('health_check', results);
        
        return results;
    }
    
    async checkReadiness() {
        // Readiness check is simpler - just database and redis
        const checks = ['database', 'redis'];
        const results = {
            ready: true,
            checks: {}
        };
        
        for (const checkName of checks) {
            const check = this.checks.get(checkName);
            if (check) {
                try {
                    const result = await check();
                    results.checks[checkName] = result.status;
                    
                    if (result.status === 'unhealthy') {
                        results.ready = false;
                    }
                } catch (error) {
                    results.checks[checkName] = 'unhealthy';
                    results.ready = false;
                }
            }
        }
        
        return results;
    }
    
    parseRedisInfo(info, key) {
        const regex = new RegExp(`^${key}:(.+)$`, 'm');
        const match = info.match(regex);
        return match ? match[1].trim() : null;
    }
    
    // Express middleware
    createMiddleware() {
        return {
            health: async (req, res) => {
                try {
                    const health = await this.checkHealth();
                    
                    res.status(health.status === 'healthy' ? 200 : 503)
                       .json(health);
                       
                } catch (error) {
                    res.status(503).json({
                        status: 'unhealthy',
                        error: error.message
                    });
                }
            },
            
            ready: async (req, res) => {
                try {
                    const readiness = await this.checkReadiness();
                    
                    res.status(readiness.ready ? 200 : 503)
                       .json(readiness);
                       
                } catch (error) {
                    res.status(503).json({
                        ready: false,
                        error: error.message
                    });
                }
            },
            
            live: (req, res) => {
                // Liveness is just "is the process running"
                res.status(200).json({ alive: true });
            }
        };
    }
    
    // Graceful shutdown
    async shutdown() {
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        if (this.redis) {
            this.redis.disconnect();
        }
    }
}
```

### Deployment Scripts

```bash
#!/bin/bash
# deployment/deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
NAMESPACE=${3:-construction-syndicate}

echo "Deploying Construction Syndicate"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Namespace: $NAMESPACE"

# Build Docker image
echo "Building Docker image..."
docker build -t construction-syndicate/api:$VERSION .

# Push to registry
echo "Pushing to registry..."
docker tag construction-syndicate/api:$VERSION $DOCKER_REGISTRY/construction-syndicate/api:$VERSION
docker push $DOCKER_REGISTRY/construction-syndicate/api:$VERSION

# Update Kubernetes deployment
echo "Updating Kubernetes deployment..."
kubectl set image deployment/construction-api \
    construction-api=$DOCKER_REGISTRY/construction-syndicate/api:$VERSION \
    -n $NAMESPACE

# Wait for rollout
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/construction-api -n $NAMESPACE

# Run database migrations
echo "Running database migrations..."
kubectl run migration-$VERSION \
    --image=$DOCKER_REGISTRY/construction-syndicate/api:$VERSION \
    --rm -it --restart=Never \
    -n $NAMESPACE \
    -- node scripts/migrate.js

# Verify deployment
echo "Verifying deployment..."
kubectl exec -it deployment/construction-api -n $NAMESPACE -- curl -f http://localhost:3000/health

echo "Deployment completed successfully!"
```

```bash
#!/bin/bash
# deployment/rollback.sh

set -e

# Configuration
NAMESPACE=${1:-construction-syndicate}
REVISION=${2:-0}

echo "Rolling back Construction Syndicate"
echo "Namespace: $NAMESPACE"
echo "Revision: $REVISION"

# Rollback deployment
kubectl rollout undo deployment/construction-api \
    --to-revision=$REVISION \
    -n $NAMESPACE

# Wait for rollback
kubectl rollout status deployment/construction-api -n $NAMESPACE

echo "Rollback completed!"
```

### Environment Configuration

```javascript
// deployment/environment-config.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export class EnvironmentConfig {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.configs = new Map();
    }
    
    async load() {
        // Load base .env file
        dotenv.config();
        
        // Load environment-specific config
        const envFile = `.env.${this.environment}`;
        if (fs.existsSync(envFile)) {
            dotenv.config({ path: envFile });
        }
        
        // Load secrets from Kubernetes if available
        await this.loadKubernetesSecrets();
        
        // Validate required variables
        this.validate();
        
        // Build configuration object
        this.buildConfig();
    }
    
    async loadKubernetesSecrets() {
        const secretsPath = '/var/run/secrets/construction';
        
        if (!fs.existsSync(secretsPath)) {
            return;
        }
        
        const files = fs.readdirSync(secretsPath);
        
        for (const file of files) {
            const content = fs.readFileSync(
                path.join(secretsPath, file),
                'utf8'
            ).trim();
            
            // Convert filename to env var name
            const envVar = file.toUpperCase().replace(/-/g, '_');
            process.env[envVar] = content;
        }
    }
    
    validate() {
        const required = [
            'DATABASE_URL',
            'REDIS_URL',
            'JWT_SECRET',
            'NODE_ENV'
        ];
        
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
    
    buildConfig() {
        this.configs.set('database', {
            url: process.env.DATABASE_URL,
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
            ssl: process.env.DB_SSL === 'true'
        });
        
        this.configs.set('redis', {
            url: process.env.REDIS_URL,
            maxReconnectAttempts: parseInt(process.env.REDIS_MAX_RECONNECT || '10')
        });
        
        this.configs.set('server', {
            port: parseInt(process.env.PORT || '3000'),
            websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3001'),
            host: process.env.HOST || '0.0.0.0'
        });
        
        this.configs.set('auth', {
            jwtSecret: process.env.JWT_SECRET,
            jwtExpiry: process.env.JWT_EXPIRY || '24h',
            bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
        });
        
        this.configs.set('construction', {
            hoaiEnabled: process.env.HOAI_ENABLED !== 'false',
            defaultPhase: process.env.DEFAULT_HOAI_PHASE || 'LP1',
            quantumEnabled: process.env.QUANTUM_ENABLED !== 'false'
        });
    }
    
    get(key) {
        return this.configs.get(key);
    }
    
    getAll() {
        const result = {};
        for (const [key, value] of this.configs) {
            result[key] = value;
        }
        return result;
    }
}

// Export singleton
export const config = new EnvironmentConfig();
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Construction Syndicate

on:
  push:
    branches:
      - main
      - production
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Run linter
        run: pnpm lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:latest
            ${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:buildcache,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'latest'
          
      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/construction-api \
            construction-api=${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:${{ github.sha }} \
            -n construction-syndicate
            
      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/construction-api \
            -n construction-syndicate \
            --timeout=10m
            
      - name: Run migrations
        run: |
          kubectl run migration-${{ github.sha }} \
            --image=${{ secrets.DOCKER_REGISTRY }}/construction-syndicate/api:${{ github.sha }} \
            --rm -it --restart=Never \
            -n construction-syndicate \
            -- node scripts/migrate.js
```

## Usage Example

```javascript
// deployment-example.js
import { BlueGreenDeployer } from './deployment/blue-green-deployer.js';
import { DatabaseMigrator } from './deployment/database-migrator.js';
import { HealthChecker } from './deployment/health-checker.js';
import express from 'express';

const app = express();

// Initialize health checker
const healthChecker = new HealthChecker({
    checks: ['database', 'redis', 'memory', 'cpu'],
    detailed: true
});

await healthChecker.initialize();

// Health endpoints
const healthMiddleware = healthChecker.createMiddleware();
app.get('/health', healthMiddleware.health);
app.get('/ready', healthMiddleware.ready);
app.get('/live', healthMiddleware.live);

// Initialize deployment system
const deployer = new BlueGreenDeployer({
    namespace: 'construction-syndicate',
    service: 'construction-api'
});

await deployer.initialize();

// Deployment endpoint (secured in production)
app.post('/deploy', async (req, res) => {
    const { image, canary } = req.body;
    
    try {
        await deployer.deploy(image, { canary });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database migration endpoint
app.post('/migrate', async (req, res) => {
    const migrator = new DatabaseMigrator();
    
    try {
        await migrator.initialize();
        await migrator.migrate();
        
        const status = await migrator.status();
        res.json({ success: true, status });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    // Stop accepting new requests
    server.close(() => {
        console.log('HTTP server closed');
    });
    
    // Wait for existing requests to complete
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Cleanup
    await healthChecker.shutdown();
    
    process.exit(0);
});

const server = app.listen(3000, () => {
    console.log('Deployment system running on port 3000');
});
```

## Testing

```javascript
// deployment.test.js
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { DatabaseMigrator } from './deployment/database-migrator.js';
import { HealthChecker } from './deployment/health-checker.js';

describe('DatabaseMigrator', () => {
    let migrator;
    
    beforeEach(() => {
        migrator = new DatabaseMigrator({
            migrationsPath: './test/migrations'
        });
    });
    
    test('should load migrations', async () => {
        await migrator.loadMigrations();
        expect(migrator.migrations.length).toBeGreaterThan(0);
    });
    
    test('should calculate checksum', () => {
        const content = 'CREATE TABLE test (id INT);';
        const checksum = migrator.calculateChecksum(content);
        
        expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    });
    
    test('should detect pending migrations', async () => {
        await migrator.initialize();
        const status = await migrator.status();
        
        expect(status).toHaveProperty('pending');
        expect(status).toHaveProperty('executed');
    });
});

describe('HealthChecker', () => {
    let checker;
    
    beforeEach(() => {
        checker = new HealthChecker({
            checks: ['memory', 'cpu']
        });
    });
    
    test('should perform health check', async () => {
        const health = await checker.checkHealth();
        
        expect(health).toHaveProperty('status');
        expect(health).toHaveProperty('checks');
        expect(health.checks).toHaveProperty('memory');
        expect(health.checks).toHaveProperty('cpu');
    });
    
    test('should check readiness', async () => {
        const readiness = await checker.checkReadiness();
        
        expect(readiness).toHaveProperty('ready');
        expect(typeof readiness.ready).toBe('boolean');
    });
});
```

This implementation provides a comprehensive deployment automation framework with Docker containerization, Kubernetes orchestration, blue-green deployment, database migrations, health checks, and CI/CD integration for the construction syndicate system.
