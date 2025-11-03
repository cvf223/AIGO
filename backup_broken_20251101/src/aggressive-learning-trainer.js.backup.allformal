import { EventEmitter } from 'events';

console.log('🧠 AGGRESSIVE LEARNING TRAINER');
console.log('==============================');

/**
 * 🔥 AGGRESSIVE LEARNING TRAINER
 * ==============================
 * 
 * This system implements BRUTAL aggressive learning with:
 * ✅ 45-second strategy switching (AGGRESSIVE!)
 * ✅ 75% exploration rate vs 25% exploitation
 * ✅ Real-time strategy evaluation every 30 seconds
 * ✅ Performance reviews every 2 minutes
 * 
 * BRUTAL TRUTH: This is the core learning engine!
 */
class AggressiveLearningTrainer extends EventEmitter {
    constructor() {
        super();
        
        // Aggressive learning configuration
        this.config = {
            opportunitySwitchInterval: 45000, // 45 seconds - AGGRESSIVE!
            strategyEvaluationInterval: 30000, // 30 seconds
            performanceReviewInterval: 120000, // 2 minutes
            
            baseLearningRate: 0.12, // 12% - AGGRESSIVE!
            explorationRate: 0.75, // 75% exploration - VERY AGGRESSIVE!
            
            minSuccessRate: 60,
            targetSuccessRate: 85,
            maxStrategyDuration: 180000, // 3 minutes max per strategy
            maxFailureStreak: 2
        };
        
        // Learning state
        this.learningState = {
            currentStrategy: null,
            strategyStartTime: null,
            opportunityCount: 0,
            successCount: 0,
            failureCount: 0,
            totalProfit: 0,
            learningCycles: 0,
            activeOpportunities: new Map(),
            strategyHistory: []
        };
        
        // Available strategies
        this.strategies = {
            'high_frequency_arbitrage': {
                name: 'High Frequency Arbitrage',
                targetOpportunities: ['arbitrage_execution', 'real_time_arbitrage'],
                minProfitThreshold: 0.3,
                aggressiveness: 0.9
            },
            'multi_dex_scanning': {
                name: 'Multi-DEX Scanning',
                targetOpportunities: ['market_research', 'competitive_analysis'],
                minProfitThreshold: 0.5,
                aggressiveness: 0.8
            },
            'volatility_exploitation': {
                name: 'Volatility Exploitation',
                targetOpportunities: ['risk_assessment', 'arbitrage_execution'],
                minProfitThreshold: 1.0,
                aggressiveness: 0.95
            }
        };
        
        this.intervals = {
            opportunitySwitch: null,
            strategyEvaluation: null,
            performanceReview: null
        };
        
        this.isActive = false;
    }

    /**
     * 🚀 START AGGRESSIVE LEARNING
     * ============================
     */
    async startAggressiveLearning() {
        console.log('🧠 STARTING AGGRESSIVE LEARNING & TRAINING SYSTEM');
        console.log('='.repeat(60));
        
        this.isActive = true;
        this.switchToNewStrategy();
        this.startOpportunitySwitch();
        this.startStrategyEvaluation();
        this.startPerformanceReview();
        
        console.log('🎯 Aggressive learning system ACTIVE!');
        return this.getLearningStatus();
    }

    /**
     * 🔄 START OPPORTUNITY SWITCH LOOP
     * ================================
     */
    startOpportunitySwitch() {
        this.intervals.opportunitySwitch = setInterval(() => {
            this.aggressiveOpportunitySwitch();
        }, this.config.opportunitySwitchInterval);
    }

    /**
     * 📊 START STRATEGY EVALUATION LOOP
     * =================================
     */
    startStrategyEvaluation() {
        this.intervals.strategyEvaluation = setInterval(() => {
            this.evaluateCurrentStrategy();
        }, this.config.strategyEvaluationInterval);
    }

    /**
     * 📈 START PERFORMANCE REVIEW LOOP
     * ================================
     */
    startPerformanceReview() {
        this.intervals.performanceReview = setInterval(() => {
            this.conductPerformanceReview();
        }, this.config.performanceReviewInterval);
    }

    /**
     * ⚡ AGGRESSIVE OPPORTUNITY SWITCH
     * ===============================
     */
    aggressiveOpportunitySwitch() {
        if (!this.isActive) return;
        
        const currentTime = Date.now();
        const strategyDuration = currentTime - this.learningState.strategyStartTime;
        
        console.log('\n⚡ AGGRESSIVE OPPORTUNITY SWITCH');
        
        if (this.shouldSwitchStrategy(strategyDuration)) {
            console.log('🔄 Switching to new strategy...');
            this.switchToNewStrategy();
        } else {
            console.log('📊 Generating new opportunities...');
            this.generateNewOpportunities();
        }
        
        this.emit('opportunitySwitch', {
            strategy: this.learningState.currentStrategy,
            opportunityCount: this.learningState.opportunityCount,
            successRate: this.calculateSuccessRate(),
            timestamp: new Date()
        });
    }

    /**
     * 🎯 SHOULD SWITCH STRATEGY
     * =========================
     */
    shouldSwitchStrategy(strategyDuration) {
        const state = this.learningState;
        
        if (strategyDuration > this.config.maxStrategyDuration) return true;
        if (state.failureCount >= this.config.maxFailureStreak) return true;
        if (Math.random() < 0.25) return true; // 25% random exploration
        
        return false;
    }

    /**
     * 🔄 SWITCH TO NEW STRATEGY
     * =========================
     */
    switchToNewStrategy() {
        if (this.learningState.currentStrategy) {
            this.saveStrategyPerformance();
        }
        
        const newStrategy = this.chooseNewStrategy();
        
        this.learningState.currentStrategy = newStrategy;
        this.learningState.strategyStartTime = Date.now();
        this.learningState.opportunityCount = 0;
        this.learningState.successCount = 0;
        this.learningState.failureCount = 0;
        this.learningState.learningCycles++;
        
        console.log(`🎯 NEW STRATEGY: ${newStrategy.name}`);
        this.generateNewOpportunities();
    }

    /**
     * 🎲 CHOOSE NEW STRATEGY
     * ======================
     */
    chooseNewStrategy() {
        const strategies = Object.values(this.strategies);
        
        if (Math.random() < this.config.explorationRate) {
            const sortedStrategies = strategies.sort((a, b) => b.aggressiveness - a.aggressiveness);
            return sortedStrategies[Math.floor(Math.random() * Math.min(3, sortedStrategies.length))];
        } else {
            return strategies[Math.floor(Math.random() * strategies.length)];
        }
    }

    /**
     * 📊 GENERATE NEW OPPORTUNITIES
     * =============================
     */
    generateNewOpportunities() {
        const strategy = this.learningState.currentStrategy;
        if (!strategy) return;
        
        console.log(`📊 Generating opportunities for: ${strategy.name}`);
        
        const opportunityCount = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < opportunityCount; i++) {
            const opportunity = this.createOpportunityFromStrategy(strategy);
            this.learningState.activeOpportunities.set(opportunity.id, opportunity);
            console.log(`   📋 ${opportunity.type} (${opportunity.expectedProfit}% profit)`);
        }
        
        this.emit('newOpportunities', {
            strategy: strategy.name,
            opportunities: Array.from(this.learningState.activeOpportunities.values()),
            timestamp: new Date()
        });
    }

    /**
     * 🎯 CREATE OPPORTUNITY FROM STRATEGY
     * ===================================
     */
    createOpportunityFromStrategy(strategy) {
        const targetTypes = strategy.targetOpportunities;
        const opportunityType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
        
        const baseProfit = strategy.minProfitThreshold;
        const variability = strategy.aggressiveness * 2;
        const expectedProfit = baseProfit + (Math.random() * variability);
        
        return {
            id: `opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: opportunityType,
            strategy: strategy.name,
            expectedProfit: parseFloat(expectedProfit.toFixed(3)),
            difficulty: Math.min(95, 40 + (expectedProfit * 10)),
            aggressiveness: strategy.aggressiveness,
            timestamp: new Date(),
            successThreshold: Math.max(60, 90 - (strategy.aggressiveness * 30))
        };
    }

    /**
     * 📊 EVALUATE CURRENT STRATEGY
     * ============================
     */
    evaluateCurrentStrategy() {
        if (!this.learningState.currentStrategy || !this.isActive) return;
        
        console.log('\n📊 STRATEGY EVALUATION');
        
        const state = this.learningState;
        const strategy = state.currentStrategy;
        const successRate = this.calculateSuccessRate();
        
        console.log(`   Strategy: ${strategy.name}`);
        console.log(`   Success rate: ${successRate.toFixed(1)}%`);
        console.log(`   Total profit: $${state.totalProfit.toFixed(2)}`);
        
        this.emit('strategyEvaluation', {
            strategy: strategy.name,
            successRate,
            totalProfit: state.totalProfit,
            timestamp: new Date()
        });
    }

    /**
     * 📈 CONDUCT PERFORMANCE REVIEW
     * =============================
     */
    conductPerformanceReview() {
        if (!this.isActive) return;
        
        console.log('\n📈 PERFORMANCE REVIEW');
        
        const metrics = this.calculatePerformanceMetrics();
        
        console.log(`   Success rate: ${metrics.successRate.toFixed(1)}%`);
        console.log(`   Learning cycles: ${this.learningState.learningCycles}`);
        
        this.emit('performanceReview', {
            metrics,
            timestamp: new Date()
        });
    }

    /**
     * 📊 CALCULATE PERFORMANCE METRICS
     * ================================
     */
    calculatePerformanceMetrics() {
        const state = this.learningState;
        
        return {
            successRate: this.calculateSuccessRate(),
            totalProfit: state.totalProfit,
            learningCycles: state.learningCycles,
            strategiesTested: new Set(state.strategyHistory.map(s => s.name)).size
        };
    }

    /**
     * 📝 RECORD OPPORTUNITY RESULT
     * ============================
     */
    recordOpportunityResult(opportunityId, result) {
        const opportunity = this.learningState.activeOpportunities.get(opportunityId);
        if (!opportunity) return;
        
        this.learningState.opportunityCount++;
        
        if (result.success) {
            this.learningState.successCount++;
            this.learningState.totalProfit += result.profit || 0;
            this.learningState.failureCount = 0;
        } else {
            this.learningState.failureCount++;
        }
        
        this.learningState.activeOpportunities.delete(opportunityId);
        console.log(`📝 Recorded result: ${result.success ? '✅ SUCCESS' : '❌ FAILURE'}`);
    }

    /**
     * 📊 HELPER METHODS
     * ================
     */
    calculateSuccessRate() {
        const total = this.learningState.opportunityCount;
        return total > 0 ? (this.learningState.successCount / total) * 100 : 0;
    }

    saveStrategyPerformance() {
        const state = this.learningState;
        if (!state.currentStrategy) return;
        
        this.learningState.strategyHistory.push({
            name: state.currentStrategy.name,
            opportunityCount: state.opportunityCount,
            successCount: state.successCount,
            totalProfit: state.totalProfit,
            duration: Date.now() - state.strategyStartTime,
            timestamp: new Date()
        });
    }

    getLearningStatus() {
        return {
            isActive: this.isActive,
            currentStrategy: this.learningState.currentStrategy?.name || 'None',
            opportunityCount: this.learningState.opportunityCount,
            successRate: this.calculateSuccessRate(),
            totalProfit: this.learningState.totalProfit,
            learningCycles: this.learningState.learningCycles,
            activeOpportunities: this.learningState.activeOpportunities.size
        };
    }

    /**
     * 🛑 SHUTDOWN
     * ==========
     */
    shutdown() {
        console.log('🛑 Shutting down aggressive learning system...');
        this.isActive = false;
        
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        console.log('✅ Aggressive learning system shutdown complete');
    }
}

// Export the trainer class and a factory function
async function startAggressiveLearningTrainer() {
    const trainer = new AggressiveLearningTrainer();
    await trainer.startAggressiveLearning();
    return trainer;
}

export { 
    AggressiveLearningTrainer,
    startAggressiveLearningTrainer
}; 