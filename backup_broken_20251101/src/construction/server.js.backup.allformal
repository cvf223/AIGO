#!/usr/bin/env node

/**
 * 🚀 CONSTRUCTION AI SERVER - PRODUCTION ENTRY POINT
 * =================================================
 * 
 * This is the main entry point for running the construction analysis
 * system in production mode.
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Server
 */

import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import { ProductionDeploymentSystem } from './deployment/ProductionDeploymentSystem.js';

// Load environment variables
dotenv.config();

// Configuration
const ENABLE_CLUSTERING = process.env.CLUSTER_ENABLED === 'true';
const WORKER_COUNT = parseInt(process.env.WORKER_COUNT) || os.cpus().length;

/**
 * 🏗️ START MASTER PROCESS
 */
async function startMaster() {
    console.log('🚀 CONSTRUCTION AI SERVER - MASTER PROCESS');
    console.log('==========================================');
    console.log(`👷 Master ${process.pid} is running`);
    console.log(`🔧 Starting ${WORKER_COUNT} workers...`);
    console.log('');
    
    // Fork workers
    for (let i = 0; i < WORKER_COUNT; i++) {
        cluster.fork();
    }
    
    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
        console.log(`❌ Worker ${worker.process.pid} died (${signal || code})`);
        console.log('🔄 Starting a new worker...');
        cluster.fork();
    });
    
    cluster.on('online', (worker) => {
        console.log(`✅ Worker ${worker.process.pid} is online`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    async function gracefulShutdown() {
        console.log('\n🛑 Master received shutdown signal');
        
        // Disconnect all workers
        for (const id in cluster.workers) {
            cluster.workers[id].disconnect();
        }
        
        // Wait for workers to exit
        let workersAlive = Object.keys(cluster.workers).length;
        
        while (workersAlive > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
            workersAlive = Object.keys(cluster.workers).length;
        }
        
        console.log('👋 Master process exiting');
        process.exit(0);
    }
}

/**
 * 👷 START WORKER PROCESS
 */
async function startWorker() {
    console.log(`👷 Worker ${process.pid} starting...`);
    
    try {
        // Create deployment system
        const deployment = new ProductionDeploymentSystem();
        
        // Initialize systems
        await deployment.initialize();
        
        // Start server
        await deployment.startServer();
        
        console.log(`✅ Worker ${process.pid} ready to handle requests`);
        
    } catch (error) {
        console.error(`❌ Worker ${process.pid} failed to start:`, error);
        process.exit(1);
    }
}

/**
 * 🚀 MAIN ENTRY POINT
 */
async function main() {
    try {
        if (ENABLE_CLUSTERING && cluster.isPrimary) {
            // Start as master
            await startMaster();
        } else {
            // Start as worker
            await startWorker();
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
main();
