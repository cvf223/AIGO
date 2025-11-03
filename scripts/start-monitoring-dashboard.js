#!/usr/bin/env node

/**
 * 🚀 MASSIVE MONITORING DASHBOARD STARTUP SCRIPT
 * ===============================================
 * 
 * Starts the comprehensive web monitoring GUI for the autonomous arbitrage agent
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

console.log('🚀 MASSIVE MONITORING DASHBOARD STARTUP');
console.log('=======================================');
console.log('');

async function startMonitoringDashboard() {
  try {
    // Check if monitoring directory exists
    const monitoringPath = './monitoring';
    try {
      await fs.access(monitoringPath);
    } catch (error) {
      console.error('❌ Monitoring directory not found!');
      console.log('📁 Expected: ./monitoring');
      process.exit(1);
    }

    console.log('📊 Starting comprehensive monitoring dashboard...');
    console.log('');
    console.log('Features:');
    console.log('  ✅ Real-time agent status');
    console.log('  ✅ Currently working on display');
    console.log('  ✅ Processes completed tracker');
    console.log('  ✅ Learning progress visualization');
    console.log('  ✅ Memory & knowledge viewer');
    console.log('  ✅ Performance metrics & charts');
    console.log('  ✅ System health monitoring');
    console.log('  ✅ Live log streaming');
    console.log('  ✅ Earnings & target tracking');
    console.log('');

    // Change to monitoring directory
    process.chdir(monitoringPath);

    // Check if node_modules exists, if not install dependencies
    try {
      await fs.access('./node_modules');
      console.log('📦 Dependencies already installed');
    } catch (error) {
      console.log('📦 Installing monitoring dashboard dependencies...');
      
      const installProcess = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Dependencies installed successfully');
            resolve();
          } else {
            console.error('❌ Failed to install dependencies');
            reject(new Error(`npm install failed with code ${code}`));
          }
        });
      });
    }

    // Start the monitoring server
    console.log('🚀 Starting monitoring web server...');
    
    const serverProcess = spawn('node', ['web-monitor-server.js'], {
      stdio: 'inherit',
      shell: true
    });

    serverProcess.on('close', (code) => {
      console.log(`📊 Monitoring dashboard stopped with code ${code}`);
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Error starting monitoring dashboard:', error);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down monitoring dashboard...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down monitoring dashboard...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting monitoring dashboard:', error);
    process.exit(1);
  }
}

// Start the dashboard
startMonitoringDashboard(); 