/**
 * PM2 ECOSYSTEM CONFIGURATION
 * ===========================
 * 
 * Production configuration for continuous runtime management
 * of AIGO-Syndicate with integrated monitoring
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --only aigo-syndicate
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
    apps: [
        {
            // Main AIGO-Syndicate with Monitoring
            name: 'aigo-syndicate',
            script: './startfullsyndicate-with-monitoring.js',
            instances: 1,
            exec_mode: 'fork',
            
            // Memory settings (using actual available RAM)
            max_memory_restart: '700G', // Leave ~196GB for OS/other processes
            node_args: '--max-old-space-size=716800 --expose-gc', // 700GB in MB
            
            // Environment
            env: {
                NODE_ENV: 'production',
                SERVER_HOST: '162.55.83.33',
                GUI_PORT: 3001,
                GRAPHQL_PORT: 4000,
                STREAMING_PORT: 3002,
                
                // Database
                DB_HOST: 'localhost',
                DB_PORT: 5432,
                DB_NAME: 'construction_syndicate',
                DB_USER: 'postgres',
                
                // Monitoring
                ENABLE_MONITORING: 'true',
                DATA_CAPTURE_ENABLED: 'true',
                RAM_STORAGE_GB: '20', // Last 7 days in RAM
                SSD_STORAGE_GB: '200', // Historical data on SSD
                
                // Performance
                UV_THREADPOOL_SIZE: '64',
                NODE_OPTIONS: '--max-old-space-size=716800' // 700GB
            },
            
            // Restart policies
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
            
            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/aigo-syndicate-error.log',
            out_file: './logs/aigo-syndicate-out.log',
            combine_logs: false,
            merge_logs: false,
            
            // Advanced features
            kill_timeout: 30000, // 30 seconds for graceful shutdown
            listen_timeout: 10000,
            shutdown_with_message: true,
            
            // Monitoring
            instance_var: 'INSTANCE_ID',
            vizion: true
        },
        
        {
            // Monitoring Dashboard (can run separately if needed)
            name: 'aigo-monitoring',
            script: './src/web/construction-gui-server.js',
            instances: 1,
            exec_mode: 'fork',
            
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                CORS_ORIGINS: 'http://162.55.83.33:3000,http://162.55.83.33:3001,http://162.55.83.33:3002'
            },
            
            max_memory_restart: '10G',
            autorestart: true,
            watch: false,
            
            error_file: './logs/monitoring-error.log',
            out_file: './logs/monitoring-out.log'
        },
        
        {
            // GraphQL Server (can run separately if needed)
            name: 'aigo-graphql',
            script: './src/web/GraphQLConstructionServer.js',
            instances: 1,
            exec_mode: 'fork',
            
            env: {
                NODE_ENV: 'production',
                PORT: 4000
            },
            
            max_memory_restart: '5G',
            autorestart: true,
            watch: false,
            
            error_file: './logs/graphql-error.log',
            out_file: './logs/graphql-out.log'
        },
        
        {
            // Health Monitor (checks system health every 30s)
            name: 'aigo-health',
            script: './scripts/health-monitor.js',
            instances: 1,
            exec_mode: 'fork',
            
            env: {
                CHECK_INTERVAL: 30000,
                ALERT_THRESHOLD: 3
            },
            
            max_memory_restart: '1G',
            autorestart: true,
            watch: false,
            
            error_file: './logs/health-error.log',
            out_file: './logs/health-out.log'
        }
    ],
    
    // Deploy configuration (for PM2 Plus)
    deploy: {
        production: {
            user: 'root',
            host: '162.55.83.33',
            ref: 'origin/main',
            repo: 'git@github.com:your-repo/aigo-syndicate.git',
            path: '/root/LocalBackup',
            'pre-deploy-local': 'echo "Starting deployment..."',
            'post-deploy': 'pnpm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': 'apt-get install -y build-essential',
            env: {
                NODE_ENV: 'production'
            }
        }
    }
};