#!/usr/bin/env node

/**
 * 🏥 HEALTH MONITOR - CONTINUOUS SYSTEM HEALTH CHECKER
 * ====================================================
 * 
 * Monitors AIGO-Syndicate system health and triggers alerts
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { DatabasePoolManager } from '../src/database/DatabasePoolManager.js';
import fetch from 'node-fetch';
import { EventEmitter } from 'events';

class HealthMonitor extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            checkInterval: parseInt(process.env.CHECK_INTERVAL) || 30000,
            alertThreshold: parseInt(process.env.ALERT_THRESHOLD) || 3,
            endpoints: {
                gui: 'http://localhost:3001/health',
                graphql: 'http://localhost:4000/graphql',
                orchestrator: 'http://localhost:3001/api/orchestrator/status'
            }
        };
        
        this.failureCount = {
            gui: 0,
            graphql: 0,
            orchestrator: 0,
            database: 0
        };
        
        this.lastAlert = null;
    }
    
    async start() {
        console.log('🏥 Health Monitor Started');
        console.log(`  Check interval: ${this.config.checkInterval}ms`);
        console.log(`  Alert threshold: ${this.config.alertThreshold} failures`);
        
        // Initial check
        await this.performHealthCheck();
        
        // Schedule recurring checks
        setInterval(() => {
            this.performHealthCheck().catch(console.error);
        }, this.config.checkInterval);
    }
    
    async performHealthCheck() {
        const results = {
            timestamp: new Date(),
            checks: {}
        };
        
        // Check GUI
        results.checks.gui = await this.checkEndpoint('gui', this.config.endpoints.gui);
        
        // Check GraphQL
        results.checks.graphql = await this.checkGraphQL();
        
        // Check Orchestrator
        results.checks.orchestrator = await this.checkEndpoint('orchestrator', this.config.endpoints.orchestrator);
        
        // Check Database
        results.checks.database = await this.checkDatabase();
        
        // Analyze results
        await this.analyzeHealth(results);
        
        // Log status
        this.logHealthStatus(results);
        
        return results;
    }
    
    async checkEndpoint(name, url) {
        try {
            const response = await fetch(url, { timeout: 5000 });
            const isHealthy = response.ok;
            
            if (isHealthy) {
                this.failureCount[name] = 0;
            } else {
                this.failureCount[name]++;
            }
            
            return {
                healthy: isHealthy,
                status: response.status,
                failures: this.failureCount[name]
            };
        } catch (error) {
            this.failureCount[name]++;
            return {
                healthy: false,
                error: error.message,
                failures: this.failureCount[name]
            };
        }
    }
    
    async checkGraphQL() {
        try {
            const response = await fetch(this.config.endpoints.graphql, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ __typename }' }),
                timeout: 5000
            });
            
            const isHealthy = response.ok;
            
            if (isHealthy) {
                this.failureCount.graphql = 0;
            } else {
                this.failureCount.graphql++;
            }
            
            return {
                healthy: isHealthy,
                status: response.status,
                failures: this.failureCount.graphql
            };
        } catch (error) {
            this.failureCount.graphql++;
            return {
                healthy: false,
                error: error.message,
                failures: this.failureCount.graphql
            };
        }
    }
    
    async checkDatabase() {
        try {
            const dbManager = DatabasePoolManager.getInstance();
            const pool = await dbManager.getPool();
            await pool.query('SELECT 1');
            
            this.failureCount.database = 0;
            
            return {
                healthy: true,
                failures: 0
            };
        } catch (error) {
            this.failureCount.database++;
            return {
                healthy: false,
                error: error.message,
                failures: this.failureCount.database
            };
        }
    }
    
    async analyzeHealth(results) {
        const criticalFailures = [];
        
        for (const [service, status] of Object.entries(results.checks)) {
            if (!status.healthy && status.failures >= this.config.alertThreshold) {
                criticalFailures.push({
                    service,
                    failures: status.failures,
                    error: status.error
                });
            }
        }
        
        if (criticalFailures.length > 0) {
            await this.triggerAlert(criticalFailures);
        }
    }
    
    async triggerAlert(failures) {
        // Rate limit alerts (max 1 per 5 minutes)
        const now = Date.now();
        if (this.lastAlert && (now - this.lastAlert) < 300000) {
            return;
        }
        
        this.lastAlert = now;
        
        console.error('🚨 CRITICAL HEALTH ALERT 🚨');
        console.error('Failed services:', failures);
        
        // Store alert in database
        try {
            const dbManager = DatabasePoolManager.getInstance();
            const pool = await dbManager.getPool();
            
            await pool.query(
                `INSERT INTO system_events (event_type, component, details)
                VALUES ('health_alert', 'health_monitor', $1)`,
                [JSON.stringify(failures)]
            );
        } catch (error) {
            console.error('Failed to store alert:', error);
        }
        
        // Attempt recovery
        await this.attemptRecovery(failures);
    }
    
    async attemptRecovery(failures) {
        console.log('🔧 Attempting automatic recovery...');
        
        for (const failure of failures) {
            switch (failure.service) {
                case 'gui':
                    console.log('  Attempting to restart GUI server...');
                    // PM2 will handle restart automatically
                    break;
                    
                case 'graphql':
                    console.log('  Attempting to restart GraphQL server...');
                    // PM2 will handle restart automatically
                    break;
                    
                case 'database':
                    console.log('  Database connection issue detected');
                    // Try to reinitialize connection pool
                    try {
                        const dbManager = DatabasePoolManager.getInstance();
                        await dbManager.reinitialize();
                        console.log('  ✅ Database connection reinitialized');
                    } catch (error) {
                        console.error('  ❌ Failed to reinitialize database:', error);
                    }
                    break;
            }
        }
    }
    
    logHealthStatus(results) {
        const healthIcon = (check) => check.healthy ? '✅' : '❌';
        
        const summary = [
            `GUI: ${healthIcon(results.checks.gui)}`,
            `GraphQL: ${healthIcon(results.checks.graphql)}`,
            `Orchestrator: ${healthIcon(results.checks.orchestrator)}`,
            `Database: ${healthIcon(results.checks.database)}`
        ];
        
        console.log(`[${new Date().toISOString()}] Health Check: ${summary.join(' | ')}`);
    }
}

// Start monitor
const monitor = new HealthMonitor();
monitor.start().catch(console.error);

// Keep process alive
process.on('SIGINT', () => {
    console.log('Health monitor shutting down...');
    process.exit(0);
});

export default HealthMonitor;
