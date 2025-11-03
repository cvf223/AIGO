/**
 * 🎯 DYNAMIC VARIABLE INJECTOR
 * ============================
 * 
 * Injects real-time market variables and context into agent decision-making.
 * Replaces static parameters with dynamic, market-aware values.
 */

import { EventEmitter } from 'events';

export class DynamicVariableInjector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            updateInterval: config.updateInterval || 5000,
            smoothingFactor: config.smoothingFactor || 0.3,
            ...config
        };
        
        // Current market variables
        this.variables = {
            gasPrice: 30,
            marketVolatility: 0.3,
            competitorCount: 5,
            networkCongestion: 0.3,
            slippageTolerance: 0.005,
            minProfitThreshold: 10
        };
        
        // Data sources
        this.dataSources = {
            gasOracle: config.gasOracle || null,
            priceFeeds: config.priceFeeds || null,
            mempoolMonitor: config.mempoolMonitor || null
        };
        
        this.isRunning = false;
        console.log('🎯 Dynamic Variable Injector initialized');
    }
    
    /**
     * 🚀 Start dynamic variable updates
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🎯 Starting dynamic variable injection...');
        
        await this.updateAllVariables();
        
        this.updateInterval = setInterval(async () => {
            await this.updateAllVariables();
        }, this.config.updateInterval);
        
        return true;
    }
    
    /**
     * 🛑 Stop updates
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    }
    
    /**
     * 🔄 Update all variables from sources
     */
    async updateAllVariables() {
        try {
            // Update from real sources if available
            if (this.dataSources.gasOracle) {
                const gasData = await this.dataSources.gasOracle.getGasPrice();
                this.variables.gasPrice = gasData.standard || this.variables.gasPrice;
            }
            
            if (this.dataSources.priceFeeds) {
                const marketData = await this.dataSources.priceFeeds.getMarketMetrics();
                this.variables.marketVolatility = marketData.volatility || this.variables.marketVolatility;
            }
            
            if (this.dataSources.mempoolMonitor) {
                const mempoolData = await this.dataSources.mempoolMonitor.getMempoolStats();
                this.variables.networkCongestion = Math.min(1, mempoolData.pending / 5000);
            }
            
            // Apply smoothing
            this.smoothVariables();
            
            // Update thresholds based on conditions
            this.updateThresholds();
            
            // Emit update event
            this.emit('variablesUpdated', {
                variables: this.variables,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('❌ Error updating variables:', error);
            this.emit('updateError', error);
        }
    }
    
    /**
     * 📈 Smooth variables using EMA
     */
    smoothVariables() {
        const alpha = this.config.smoothingFactor;
        const previous = { ...this.variables };
        
        for (const key in this.variables) {
            if (typeof this.variables[key] === 'number' && previous[key]) {
                this.variables[key] = alpha * this.variables[key] + (1 - alpha) * previous[key];
            }
        }
    }
    
    /**
     * 🎯 Update adaptive thresholds
     */
    updateThresholds() {
        // Adjust profit threshold based on gas
        const gasImpact = this.variables.gasPrice / 30;
        this.variables.minProfitThreshold = 10 * gasImpact;
        
        // Adjust slippage based on volatility
        this.variables.slippageTolerance = 0.005 * (1 + this.variables.marketVolatility);
        
        // Increase competition awareness
        if (this.variables.competitorCount > 10) {
            this.variables.minProfitThreshold *= 0.8; // Lower threshold in high competition
        }
    }
    
    /**
     * 🎯 Inject variables into agent configuration
     */
    injectIntoAgent(agentConfig) {
        return {
            ...agentConfig,
            dynamicVariables: { ...this.variables },
            marketContext: {
                isHighGas: this.variables.gasPrice > 50,
                isVolatile: this.variables.marketVolatility > 0.5,
                isCongested: this.variables.networkCongestion > 0.7
            },
            recommendations: this.generateRecommendations()
        };
    }
    
    /**
     * 💡 Generate strategy recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.variables.gasPrice > 60) {
            recommendations.push({
                type: 'gas',
                action: 'wait',
                reason: 'High gas prices'
            });
        }
        
        if (this.variables.marketVolatility > 0.7) {
            recommendations.push({
                type: 'risk',
                action: 'reduce',
                reason: 'High volatility'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 📊 Get current status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            currentVariables: this.variables,
            recommendations: this.generateRecommendations()
        };
    }
}

export default DynamicVariableInjector;