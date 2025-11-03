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
            // FULL SOPHISTICATED AIGO-SYNDICATE (ALL ENDLESS LOOPS FIXED!)
            name: 'aigo-syndicate-main',
            script: './startfullsyndicate.js',
            instances: 1,
            exec_mode: 'fork',
            
            // Memory settings (using actual available RAM)
            max_memory_restart: '700G', // Leave ~196GB for OS/other processes
            node_args: '--max-old-space-size=716800 --expose-gc', // 700GB in MB
            
            // Environment
            env: {
                NODE_ENV: 'production',
                SERVER_HOST: '162.55.83.33',
                CONSTRUCTION_GUI_PORT: '3001',
                
                // Database
                POSTGRES_HOST: 'localhost',
                POSTGRES_PORT: '5432',
                POSTGRES_DB: 'construction_syndicate',
                POSTGRES_USER: 'postgres',
                POSTGRES_PASSWORD: 'postgres',
                
                // Monitoring & Storage
                ENABLE_MONITORING: 'true',
                DATA_CAPTURE_ENABLED: 'true',
                RAM_STORAGE_GB: '20', // Last 7 days in RAM
                SSD_STORAGE_GB: '200', // Historical data on SSD
                HUMAN_APPROVAL_REQUIRED: 'true',
                
                // Performance
                UV_THREADPOOL_SIZE: '64',
                NODE_OPTIONS: '--max-old-space-size=716800' // 700GB
            },
            
            // Restart policies
            autorestart: true,
            watch: false,
            max_restarts: 5, // Reduced restarts - system should be stable
            min_uptime: '30s', // Longer startup time
            
            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/aigo-syndicate-integrated-error.log',
            out_file: './logs/aigo-syndicate-integrated-out.log',
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