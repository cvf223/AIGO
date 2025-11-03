#!/usr/bin/env node

/**
 * 🔔 TELEGRAM OPPORTUNITY ALERTS
 * =============================
 * 
 * Real-time arbitrage opportunity alerts via Telegram
 * - Opportunity detection and notification
 * - Execution confirmation
 * - Performance reporting
 */

import { EventEmitter } from 'events';
import { createCoordinationSystem } from './telegram-coordination-system.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create event emitter for alert events
export const alertEvents = new EventEmitter();

// Constants
const ALERT_THRESHOLD_USD = parseFloat(process.env.ALERT_THRESHOLD_USD || '50');
const ALERT_THRESHOLD_PERCENT = parseFloat(process.env.ALERT_THRESHOLD_PERCENT || '0.5') / 100;
const ALERT_CONFIDENCE_THRESHOLD = parseFloat(process.env.ALERT_CONFIDENCE_THRESHOLD || '0.8');
const ALERT_COOLDOWN_MS = parseInt(process.env.ALERT_COOLDOWN_MS || '60000');
const MAX_ALERTS_PER_HOUR = parseInt(process.env.MAX_ALERTS_PER_HOUR || '20');

/**
 * 🔔 Telegram Opportunity Alert System
 */
export class TelegramOpportunityAlerts {
  constructor(config = {}) {
    this.config = {
      alertThresholdUsd: ALERT_THRESHOLD_USD,
      alertThresholdPercent: ALERT_THRESHOLD_PERCENT,
      alertConfidenceThreshold: ALERT_CONFIDENCE_THRESHOLD,
      alertCooldownMs: ALERT_COOLDOWN_MS,
      maxAlertsPerHour: MAX_ALERTS_PER_HOUR,
      ...config
    };

    // Initialize state
    this.coordinationSystem = null;
    this.isInitialized = false;
    this.lastAlertTime = 0;
    this.alertHistory = [];
    this.alertsThisHour = 0;
    this.hourlyResetInterval = null;
    this.pendingOpportunities = new Map();
    this.executedOpportunities = new Map();
  }

  /**
   * 🚀 Initialize the alert system
   */
  async initialize() {
    console.log('🔔 Initializing Telegram Opportunity Alerts...');
    
    try {
      // Initialize coordination system
      this.coordinationSystem = await createCoordinationSystem();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Set up hourly reset for alert count
      this.hourlyResetInterval = setInterval(() => {
        this.alertsThisHour = 0;
        console.log('🔄 Reset hourly alert count');
      }, 3600000);
      
      this.isInitialized = true;
      console.log('✅ Telegram Opportunity Alerts initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram Opportunity Alerts:', error);
      return false;
    }
  }

  /**
   * 🔄 Set up event handlers
   */
  setupEventHandlers() {
    // Handle opportunity detected events
    alertEvents.on('opportunityDetected', (opportunity) => {
      this.handleOpportunityDetected(opportunity);
    });
    
    // Handle opportunity executed events
    alertEvents.on('opportunityExecuted', (result) => {
      this.handleOpportunityExecuted(result);
    });
    
    // Handle opportunity expired events
    alertEvents.on('opportunityExpired', (opportunityId) => {
      this.handleOpportunityExpired(opportunityId);
    });
  }

  /**
   * 🔄 Handle opportunity detected
   */
  async handleOpportunityDetected(opportunity) {
    if (!this.isInitialized || !this.coordinationSystem) {
      console.warn('Alert system not initialized, skipping opportunity alert');
      return false;
    }
    
    // Check if we've reached the hourly alert limit
    if (this.alertsThisHour >= this.config.maxAlertsPerHour) {
      console.log(`⚠️ Hourly alert limit reached (${this.alertsThisHour}/${this.config.maxAlertsPerHour}), skipping alert`);
      return false;
    }
    
    // Check if we're in the cooldown period
    const now = Date.now();
    if (now - this.lastAlertTime < this.config.alertCooldownMs) {
      console.log('⏱️ Alert cooldown period active, skipping alert');
      return false;
    }
    
    // Check if opportunity meets thresholds
    if (
      opportunity.profitUsd < this.config.alertThresholdUsd ||
      opportunity.profitPercent < this.config.alertThresholdPercent ||
      opportunity.confidence < this.config.alertConfidenceThreshold
    ) {
      console.log(`⚠️ Opportunity doesn't meet alert thresholds, skipping alert`);
      return false;
    }
    
    try {
      // Store opportunity in pending list
      this.pendingOpportunities.set(opportunity.id, {
        ...opportunity,
        detectedAt: now,
        status: 'pending'
      });
      
      // Send alert to admin and specific agent if configured
      const adminResult = await this.coordinationSystem.sendOpportunityAlert('admin', opportunity);
      let agentResult = false;
      
      if (opportunity.agentName) {
        agentResult = await this.coordinationSystem.sendOpportunityAlert(opportunity.agentName, opportunity);
      }
      
      // Update state
      this.lastAlertTime = now;
      this.alertsThisHour++;
      this.alertHistory.push({
        id: opportunity.id,
        timestamp: now,
        opportunity,
        adminAlerted: adminResult,
        agentAlerted: agentResult
      });
      
      console.log(`🔔 Sent alert for opportunity ${opportunity.id} (${opportunity.profitUsd.toFixed(2)} USD)`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send opportunity alert:', error);
      return false;
    }
  }

  /**
   * 🔄 Handle opportunity executed
   */
  async handleOpportunityExecuted(result) {
    if (!this.isInitialized || !this.coordinationSystem) {
      console.warn('Alert system not initialized, skipping execution result');
      return false;
    }
    
    try {
      // Get the pending opportunity
      const pendingOpp = this.pendingOpportunities.get(result.opportunityId);
      if (!pendingOpp) {
        console.warn(`Unknown opportunity ID: ${result.opportunityId}`);
        return false;
      }
      
      // Update status
      pendingOpp.status = result.success ? 'executed' : 'failed';
      pendingOpp.executedAt = Date.now();
      pendingOpp.executionResult = result;
      
      // Move to executed list
      this.executedOpportunities.set(result.opportunityId, pendingOpp);
      this.pendingOpportunities.delete(result.opportunityId);
      
      // Create message
      const message = result.success
        ? `✅ *Opportunity Executed Successfully*\n\n` +
          `ID: ${result.opportunityId}\n` +
          `Chain: ${pendingOpp.chain}\n` +
          `Profit: $${result.actualProfitUsd.toFixed(2)} (${(result.actualProfitPercent * 100).toFixed(2)}%)\n` +
          `Gas Used: $${result.gasUsedUsd.toFixed(2)}\n` +
          `Net Profit: $${result.netProfitUsd.toFixed(2)}\n` +
          `Execution Time: ${result.executionTimeMs}ms\n` +
          `Transaction: [View](${result.transactionUrl || '#'})`
        : `❌ *Opportunity Execution Failed*\n\n` +
          `ID: ${result.opportunityId}\n` +
          `Chain: ${pendingOpp.chain}\n` +
          `Reason: ${result.failureReason || 'Unknown error'}\n` +
          `Gas Used: $${result.gasUsedUsd?.toFixed(2) || '0.00'}\n` +
          `Loss: $${result.lossUsd?.toFixed(2) || '0.00'}`;
      
      // Send message to admin and specific agent if configured
      await this.coordinationSystem.sendMessage('admin', message);
      
      if (pendingOpp.agentName) {
        await this.coordinationSystem.sendMessage(pendingOpp.agentName, message);
      }
      
      console.log(`📣 Sent execution ${result.success ? 'success' : 'failure'} notification for opportunity ${result.opportunityId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send execution result:', error);
      return false;
    }
  }

  /**
   * 🔄 Handle opportunity expired
   */
  async handleOpportunityExpired(opportunityId) {
    if (!this.isInitialized || !this.coordinationSystem) {
      console.warn('Alert system not initialized, skipping expiration notification');
      return false;
    }
    
    try {
      // Get the pending opportunity
      const pendingOpp = this.pendingOpportunities.get(opportunityId);
      if (!pendingOpp) {
        console.warn(`Unknown opportunity ID: ${opportunityId}`);
        return false;
      }
      
      // Update status
      pendingOpp.status = 'expired';
      pendingOpp.expiredAt = Date.now();
      
      // Move to executed list
      this.executedOpportunities.set(opportunityId, pendingOpp);
      this.pendingOpportunities.delete(opportunityId);
      
      // Create message
      const message = `⏱️ *Opportunity Expired*\n\n` +
        `ID: ${opportunityId}\n` +
        `Chain: ${pendingOpp.chain}\n` +
        `Potential Profit: $${pendingOpp.profitUsd.toFixed(2)} (${(pendingOpp.profitPercent * 100).toFixed(2)}%)\n` +
        `Detected At: ${new Date(pendingOpp.detectedAt).toISOString()}\n` +
        `Expired At: ${new Date(pendingOpp.expiredAt).toISOString()}\n` +
        `Duration: ${((pendingOpp.expiredAt - pendingOpp.detectedAt) / 1000).toFixed(1)}s`;
      
      // Send message to admin and specific agent if configured
      await this.coordinationSystem.sendMessage('admin', message);
      
      if (pendingOpp.agentName) {
        await this.coordinationSystem.sendMessage(pendingOpp.agentName, message);
      }
      
      console.log(`⏱️ Sent expiration notification for opportunity ${opportunityId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send expiration notification:', error);
      return false;
    }
  }

  /**
   * 📊 Send daily performance report
   */
  async sendDailyPerformanceReport() {
    if (!this.isInitialized || !this.coordinationSystem) {
      console.warn('Alert system not initialized, skipping performance report');
      return false;
    }
    
    try {
      // Calculate statistics
      const now = Date.now();
      const oneDayAgo = now - 86400000;
      
      // Filter opportunities from the last 24 hours
      const recentOpportunities = Array.from(this.executedOpportunities.values())
        .filter(opp => (opp.executedAt || opp.expiredAt || 0) >= oneDayAgo);
      
      if (recentOpportunities.length === 0) {
        console.log('No recent opportunities for performance report');
        return false;
      }
      
      // Calculate metrics
      const executed = recentOpportunities.filter(opp => opp.status === 'executed');
      const failed = recentOpportunities.filter(opp => opp.status === 'failed');
      const expired = recentOpportunities.filter(opp => opp.status === 'expired');
      
      const totalProfitUsd = executed.reduce((sum, opp) => sum + (opp.executionResult?.netProfitUsd || 0), 0);
      const totalGasUsd = executed.reduce((sum, opp) => sum + (opp.executionResult?.gasUsedUsd || 0), 0);
      const totalLossUsd = failed.reduce((sum, opp) => sum + (opp.executionResult?.lossUsd || 0), 0);
      
      const report = {
        period: '24 hours',
        opportunitiesDetected: recentOpportunities.length,
        opportunitiesExecuted: executed.length,
        opportunitiesFailed: failed.length,
        opportunitiesExpired: expired.length,
        successRate: executed.length / (executed.length + failed.length) || 0,
        totalProfitUsd,
        averageProfitUsd: totalProfitUsd / executed.length || 0,
        gasSpentUsd: totalGasUsd,
        lossesUsd: totalLossUsd,
        netProfitUsd: totalProfitUsd - totalLossUsd,
        timestamp: now
      };
      
      // Send report to admin
      await this.coordinationSystem.sendPerformanceReport('admin', report);
      
      console.log('📊 Sent daily performance report');
      return true;
    } catch (error) {
      console.error('❌ Failed to send performance report:', error);
      return false;
    }
  }

  /**
   * 🧹 Clean up resources
   */
  async shutdown() {
    console.log('🧹 Shutting down Telegram Opportunity Alerts...');
    
    // Clear intervals
    if (this.hourlyResetInterval) {
      clearInterval(this.hourlyResetInterval);
    }
    
    // Shut down coordination system
    if (this.coordinationSystem) {
      await this.coordinationSystem.shutdown();
    }
    
    console.log('✅ Telegram Opportunity Alerts shut down');
    return true;
  }
}

/**
 * 🚀 Create and initialize an alert system instance
 */
export async function createOpportunityAlerts(config = {}) {
  const alertSystem = new TelegramOpportunityAlerts(config);
  await alertSystem.initialize();
  return alertSystem;
}

// Helper function to generate a unique opportunity ID
export function generateOpportunityId() {
  return `opp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Run as standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log('🚀 Starting Telegram Opportunity Alerts in standalone mode...');
      
      const alertSystem = await createOpportunityAlerts();
      
      // Send a test opportunity after a short delay
      setTimeout(async () => {
        const opportunityId = generateOpportunityId();
        
        // Emit test opportunity detected event
        alertEvents.emit('opportunityDetected', {
          id: opportunityId,
          chain: 'Arbitrum',
          dexes: ['Uniswap V3', 'SushiSwap'],
          path: ['WETH', 'USDC', 'WETH'],
          profitUsd: 123.45,
          profitPercent: 0.0234,
          confidence: 0.95,
          status: 'Detected',
          agentName: 'admin' // Send to admin for testing
        });
        
        // Emit test opportunity executed event after a delay
        setTimeout(() => {
          alertEvents.emit('opportunityExecuted', {
            opportunityId,
            success: true,
            actualProfitUsd: 119.87,
            actualProfitPercent: 0.0228,
            gasUsedUsd: 12.34,
            netProfitUsd: 107.53,
            executionTimeMs: 3245,
            transactionUrl: 'https://arbiscan.io/tx/0x123456789'
          });
          
          // Send performance report after another delay
          setTimeout(() => {
            alertSystem.sendDailyPerformanceReport();
          }, 3000);
          
        }, 5000);
        
      }, 3000);
      
      // Keep process alive
      console.log('🔄 Press Ctrl+C to exit...');
      
      // Handle shutdown
      process.on('SIGINT', async () => {
        console.log('Received SIGINT, shutting down...');
        await alertSystem.shutdown();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Error in standalone mode:', error);
      process.exit(1);
    }
  })();
} 