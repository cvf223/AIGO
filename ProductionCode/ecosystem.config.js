/**
 * 🚀 PM2 ECOSYSTEM CONFIGURATION
 * ==============================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Production deployment configuration
 * Optimized for AMD EPYC 7502P (32 cores) with 896GB RAM
 * 
 * FEATURES:
 * - Multi-process clustering for API servers
 * - CPU affinity for critical processes
 * - Memory limits and auto-restart
 * - Log rotation and monitoring
 * - Environment-specific configurations
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

module.exports = {
    apps: [
        // ===== MAIN ORCHESTRATOR =====
        {
            name: 'construction-syndicate',
            script: './startfullsyndicate.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '120G', // 120GB limit for main orchestrator
            node_args: '--max-old-space-size=122880', // 120GB heap
            env: {
                NODE_ENV: 'production',
                NODE_OPTIONS: '--max-old-space-size=122880 --enable-source-maps',
                UV_THREADPOOL_SIZE: '128',
                // CPU affinity: cores 0-15 for main orchestrator
                TASKSET_CPU_LIST: '0-15'
            },
            error_file: './logs/syndicate-error.log',
            out_file: './logs/syndicate-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            // Graceful shutdown with backup
            kill_timeout: 60000, // 60 seconds for backup to complete
            listen_timeout: 10000,
            // Shutdown hook - create backup before stopping
            pre_stop: './scripts/shutdown-backup.sh',
            // Monitoring
            pmx: true,
            instance_var: 'INSTANCE_ID'
        },
        
        // ===== CONSTRUCTION GUI API SERVER =====
        {
            name: 'construction-gui-api',
            script: './src/web/construction-gui-server.js',
            instances: 4, // 4 instances for load balancing
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '8G',
            node_args: '--max-old-space-size=8192',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                NODE_OPTIONS: '--max-old-space-size=8192',
                // CPU affinity: cores 16-19 for API servers
                TASKSET_CPU_LIST: '16-19'
            },
            error_file: './logs/api-error.log',
            out_file: './logs/api-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            // Load balancing
            instances_var: 'INSTANCE_ID',
            // Graceful reload
            wait_ready: true,
            listen_timeout: 5000,
            kill_timeout: 5000
        },
        
        // ===== CONSTRUCTION GUI FRONTEND =====
        {
            name: 'construction-gui-frontend',
            script: 'pnpm',
            args: 'start',
            cwd: './web-gui-construction',
            interpreter: 'none',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '4G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                NODE_OPTIONS: '--max-old-space-size=4096',
                // CPU affinity: cores 20-21 for frontend
                TASKSET_CPU_LIST: '20-21'
            },
            error_file: '../logs/frontend-error.log',
            out_file: '../logs/frontend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true
        },
        
        // ===== LOG MONITORING SERVER =====
        {
            name: 'log-monitoring-server',
            script: './src/monitoring/log-monitoring-server.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '2G',
            node_args: '--max-old-space-size=2048',
            env: {
                NODE_ENV: 'production',
                PORT: 3003,
                NODE_OPTIONS: '--max-old-space-size=2048',
                // CPU affinity: core 22 for log monitoring
                TASKSET_CPU_LIST: '22'
            },
            error_file: './logs/monitoring-error.log',
            out_file: './logs/monitoring-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true
        },
        
        // ===== DATABASE MIGRATION RUNNER =====
        {
            name: 'db-migrations',
            script: './src/database/migrations/migrate.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: 'production'
            },
            error_file: './logs/migrations-error.log',
            out_file: './logs/migrations-out.log',
            time: true
        },
        
        // ===== PROMETHEUS NODE EXPORTER =====
        {
            name: 'node-exporter',
            script: 'node_exporter',
            interpreter: 'none',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production'
            },
            error_file: './logs/node-exporter-error.log',
            out_file: './logs/node-exporter-out.log',
            time: true
        },
        
        // ===== SWAGGER UI DOCUMENTATION =====
        {
            name: 'swagger-ui',
            script: './src/web/swagger-ui.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            node_args: '--max-old-space-size=1024',
            env: {
                NODE_ENV: 'production',
                SWAGGER_PORT: 3004,
                API_URL: 'https://api.construction-syndicate.ai',
                NODE_OPTIONS: '--max-old-space-size=1024',
                // CPU affinity: core 23 for documentation
                TASKSET_CPU_LIST: '23'
            },
            error_file: './logs/swagger-error.log',
            out_file: './logs/swagger-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            time: true
        }
    ],
    
    // ===== DEPLOYMENT CONFIGURATION =====
    deploy: {
        production: {
            user: 'ubuntu',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:your-repo/multi-agent-ai-framework.git',
            path: '/home/ubuntu/construction-syndicate',
            'pre-deploy-local': '',
            'post-deploy': 'pnpm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            env: {
                NODE_ENV: 'production'
            }
        },
        
        staging: {
            user: 'ubuntu',
            host: 'staging-server-ip',
            ref: 'origin/develop',
            repo: 'git@github.com:your-repo/multi-agent-ai-framework.git',
            path: '/home/ubuntu/construction-syndicate-staging',
            'post-deploy': 'pnpm install && pm2 reload ecosystem.config.js --env staging',
            env: {
                NODE_ENV: 'staging'
            }
        }
    }
};

/**
 * USAGE:
 * ------
 * 
 * Start all services:
 * pm2 start ecosystem.config.js
 * 
 * Start specific service:
 * pm2 start ecosystem.config.js --only construction-syndicate
 * 
 * Stop all services:
 * pm2 stop ecosystem.config.js
 * 
 * Restart with reload (zero-downtime):
 * pm2 reload ecosystem.config.js
 * 
 * Monitor services:
 * pm2 monit
 * 
 * View logs:
 * pm2 logs
 * pm2 logs construction-syndicate --lines 100
 * 
 * Save PM2 process list:
 * pm2 save
 * 
 * Setup startup script:
 * pm2 startup
 * 
 * Deploy to production:
 * pm2 deploy production
 * 
 * CPU AFFINITY NOTES:
 * ------------------
 * The TASKSET_CPU_LIST environment variable is used to set CPU affinity.
 * You may need to run PM2 with sudo or configure capabilities:
 * 
 * sudo setcap cap_sys_nice=+ep /usr/bin/node
 * 
 * Or wrap the script execution with taskset:
 * taskset -c 0-15 node startfullsyndicate.js
 */
