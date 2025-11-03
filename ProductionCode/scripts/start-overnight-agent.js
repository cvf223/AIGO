#!/usr/bin/env node

/**
 * 🌙 OVERNIGHT AGENT LAUNCHER
 * ============================
 * 
 * Simple launcher for the autonomous overnight agent
 * Handles startup, monitoring, and automatic restarts
 */

import { AutonomousOvernightAgent } from './autonomous-overnight-agent.js';

console.log('🌙 LAUNCHING AUTONOMOUS OVERNIGHT AGENT');
console.log('=====================================');
console.log('🎯 Target: $14,000/week autonomous earnings');
console.log('⏰ Mode: 24/7 continuous operation');
console.log('🧠 Learning: Real-time adaptive improvement');
console.log('🔄 Recovery: Automatic error handling\n');

// Create and start the autonomous agent
const agent = new AutonomousOvernightAgent();

agent.start()
  .then(() => {
    console.log('🎉 AUTONOMOUS AGENT: FULLY OPERATIONAL! 🎉');
    console.log('💤 Running through the night...');
    console.log('📊 Monitor progress in real-time logs');
    console.log('🛑 Press Ctrl+C to stop gracefully\n');
  })
  .catch((error) => {
    console.error('💥 STARTUP FAILED:', error);
    console.error('🔧 Check configuration and try again');
    process.exit(1);
  }); 