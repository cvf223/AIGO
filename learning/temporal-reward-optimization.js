#!/usr/bin/env node

/**
 * ⏰ TEMPORAL REWARD OPTIMIZATION SYSTEM
 * =====================================
 * 
 * CRITICAL INSIGHT FROM PODCAST: Agents can become short-sighted (gamma = 0)
 * or far-sighted (gamma = 1). For arbitrage, we need BALANCED temporal thinking.
 * 
 * ARBITRAGE TEMPORAL REQUIREMENTS:
 * - Short-term: Immediate opportunity execution (seconds/minutes)
 * - Medium-term: Market trend analysis (hours/days)  
 * - Long-term: Strategy evolution and learning (weeks/months)
 * 
 * SOLUTION: Multi-timescale reward optimization with dynamic gamma adjustment
 * based on market conditions and agent objectives.
 */

import { EventEmitter } from 'events';

class TemporalRewardOptimization extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Multi-timescale gamma configurations
      gamma_configurations: {
        immediate_execution: {
          gamma: 0.1, // Short-sighted for immediate arbitrage
          timeframe: 'seconds',
          use_cases: ['arbitrage_execution', 'price_discrepancy_capture']
        },
        tactical_analysis: {
          gamma: 0.7, // Medium-term for market trends
          timeframe: 'hours',
          use_cases: ['market_trend_analysis', 'liquidity_optimization']
        },
        strategic_learning: {
          gamma: 0.95, // Long-term for strategy evolution
          timeframe: 'weeks',
          use_cases: ['strategy_development', 'collective_learning']
        },
        hybrid_balanced: {
          gamma: 0.85, // Balanced for most operations
          timeframe: 'mixed',
          use_cases: ['general_trading', 'risk_management']
        }
      },
      
      // Dynamic gamma adjustment factors
      adjustment_factors: {
        market_volatility: {
          high_volatility: -0.1, // More short-term focused
          low_volatility: +0.1    // More long-term focused
        },
        opportunity_scarcity: {
          high_scarcity: -0.05,   // More opportunistic
          low_scarcity: +0.05     // More patient
        },
        agent_experience: {
          novice: -0.05,          // More immediate feedback
          expert: +0.05           // More strategic thinking
        },
        team_coordination: {
          solo_operation: 0,      // No adjustment
          team_operation: +0.1    // More long-term coordination
        }
      },
      
      // Reward shaping parameters
      reward_shaping: {
        immediate_reward_multiplier: 1.0,
        medium_term_reward_multiplier: 0.8,
        long_term_reward_multiplier: 1.2,
        consistency_bonus: 0.1,
        learning_progress_bonus: 0.15
      },
      
      // Temporal credit assignment
      credit_assignment: {
        immediate_window: 5,     // 5 steps for immediate credit
        medium_window: 50,       // 50 steps for medium credit
        long_window: 500,        // 500 steps for long credit
        attention_decay: 0.9     // Attention weight decay
      },
      
      ...config
    };
    
    // Active gamma configurations per agent
    this.agent_gamma_configs = new Map();
    
    // Temporal reward tracking
    this.temporal_rewards = new Map();
    
    // Performance metrics
    this.performance_tracking = {
      short_term_successes: 0,
      medium_term_successes: 0,
      long_term_successes: 0,
      total_decisions: 0,
      temporal_balance_score: 0
    };
    
    console.log('⏰ Temporal Reward Optimization System initialized');
  }
  
  /**
   * Configure agent's temporal reward structure
   */
  async configureAgentTemporalRewards(agentId, agentType, marketConditions = {}) {
    console.log(`⏰ Configuring temporal rewards for agent ${agentId} (${agentType})`);
    
    try {
      // Determine base gamma configuration
      const baseConfig = this._determineBaseGammaConfig(agentType);
      
      // Apply dynamic adjustments
      const adjustedConfig = this._applyDynamicAdjustments(baseConfig, marketConditions, agentId);
      
      // Create multi-timescale reward structure
      const rewardStructure = this._createRewardStructure(adjustedConfig);
      
      // Store configuration
      this.agent_gamma_configs.set(agentId, {
        agent_type: agentType,
        base_config: baseConfig,
        adjusted_config: adjustedConfig,
        reward_structure: rewardStructure,
        market_conditions: marketConditions,
        last_updated: Date.now()
      });
      
      console.log(`✅ Agent ${agentId} configured with gamma: ${adjustedConfig.gamma.toFixed(3)}`);
      
      this.emit('agentTemporalConfigured', {
        agentId,
        agentType,
        gamma: adjustedConfig.gamma,
        timeframe: adjustedConfig.timeframe
      });
      
      return adjustedConfig;
      
    } catch (error) {
      console.error(`❌ Failed to configure temporal rewards for ${agentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate temporally-optimized reward
   */
  async calculateTemporalReward(agentId, immediateReward, context = {}) {
    try {
      const agentConfig = this.agent_gamma_configs.get(agentId);
      if (!agentConfig) {
        console.warn(`⚠️ No temporal config found for agent ${agentId}, using default`);
        return {
          adjusted_reward: immediateReward,
          temporal_breakdown: {
            immediate: immediateReward,
            medium_term: 0,
            long_term: 0
          },
          gamma: 0.8,
          agent_id: agentId,
          context
        };
      }
      
      const { reward_structure, adjusted_config } = agentConfig;
      
      // Multi-timescale reward calculation
      const temporal_reward = {
        immediate: immediateReward * reward_structure.immediate_multiplier,
        medium_term: this._calculateMediumTermReward(agentId, context) * reward_structure.medium_multiplier,
        long_term: this._calculateLongTermReward(agentId, context) * reward_structure.long_multiplier,
        gamma: adjusted_config.gamma
      };
      
      // Calculate total adjusted reward
      const total_adjusted = temporal_reward.immediate + temporal_reward.medium_term + temporal_reward.long_term;
      
      return {
        adjusted_reward: total_adjusted,
        temporal_breakdown: temporal_reward,
        gamma: adjusted_config.gamma,
        agent_id: agentId,
        context
      };
      
    } catch (error) {
      console.error('❌ Temporal reward calculation failed:', error);
      return {
        adjusted_reward: immediateReward,
        error: error.message,
        agent_id: agentId,
        context
      };
    }
  }
  
  /**
   * Determine base gamma configuration for agent type
   */
  _determineBaseGammaConfig(agentType) {
    const typeMapping = {
      'speed_arbitrage': 'immediate_execution',
      'market_analysis': 'tactical_analysis', 
      'strategy_development': 'strategic_learning',
      'general_trading': 'hybrid_balanced'
    };
    
    const configKey = typeMapping[agentType] || 'hybrid_balanced';
    return this.config.gamma_configurations[configKey];
  }
  
  /**
   * Apply dynamic adjustments to gamma based on conditions
   */
  _applyDynamicAdjustments(baseConfig, marketConditions, agentId) {
    let adjustedGamma = baseConfig.gamma;
    let adjustmentReasons = [];
    
    // Market volatility adjustment
    if (marketConditions.volatility === 'high') {
      adjustedGamma += this.config.adjustment_factors.market_volatility.high_volatility;
      adjustmentReasons.push('high_volatility_adjustment');
    } else if (marketConditions.volatility === 'low') {
      adjustedGamma += this.config.adjustment_factors.market_volatility.low_volatility;
      adjustmentReasons.push('low_volatility_adjustment');
    }
    
    // Opportunity scarcity adjustment
    if (marketConditions.opportunity_scarcity === 'high') {
      adjustedGamma += this.config.adjustment_factors.opportunity_scarcity.high_scarcity;
      adjustmentReasons.push('high_scarcity_adjustment');
    } else if (marketConditions.opportunity_scarcity === 'low') {
      adjustedGamma += this.config.adjustment_factors.opportunity_scarcity.low_scarcity;
      adjustmentReasons.push('low_scarcity_adjustment');
    }
    
    // Agent experience adjustment
    if (marketConditions.agent_experience === 'novice') {
      adjustedGamma += this.config.adjustment_factors.agent_experience.novice;
      adjustmentReasons.push('novice_adjustment');
    } else if (marketConditions.agent_experience === 'expert') {
      adjustedGamma += this.config.adjustment_factors.agent_experience.expert;
      adjustmentReasons.push('expert_adjustment');
    }
    
    // Team coordination adjustment
    if (marketConditions.team_operation) {
      adjustedGamma += this.config.adjustment_factors.team_coordination.team_operation;
      adjustmentReasons.push('team_coordination_adjustment');
    }
    
    // Ensure gamma stays within bounds [0, 1]
    adjustedGamma = Math.max(0, Math.min(1, adjustedGamma));
    
    return {
      ...baseConfig,
      gamma: adjustedGamma,
      original_gamma: baseConfig.gamma,
      adjustment_reasons: adjustmentReasons,
      adjustment_magnitude: adjustedGamma - baseConfig.gamma
    };
  }
  
  /**
   * Create reward structure with multipliers
   */
  _createRewardStructure(config) {
    const { reward_shaping } = this.config;
    
    return {
      immediate_multiplier: reward_shaping.immediate_reward_multiplier,
      medium_multiplier: reward_shaping.medium_term_reward_multiplier,
      long_multiplier: reward_shaping.long_term_reward_multiplier,
      consistency_bonus: reward_shaping.consistency_bonus,
      learning_bonus: reward_shaping.learning_progress_bonus,
      gamma: config.gamma,
      timeframe: config.timeframe
    };
  }
  
  /**
   * Calculate medium-term reward component
   */
  _calculateMediumTermReward(agentId, context) {
    // Track medium-term performance trends
    const recent_performance = this._getRecentPerformance(agentId, 'medium');
    const trend_reward = this._calculateTrendReward(recent_performance);
    
    return trend_reward;
  }
  
  /**
   * Calculate long-term reward component
   */
  _calculateLongTermReward(agentId, context) {
    // Track long-term learning progress and strategy evolution
    const learning_progress = this._getLearningProgress(agentId);
    const strategy_evolution = this._getStrategyEvolution(agentId);
    
    return (learning_progress + strategy_evolution) / 2;
  }
  
  /**
   * Calculate consistency bonus
   */
  _calculateConsistencyBonus(agentId) {
    const performance_history = this._getPerformanceHistory(agentId);
    if (performance_history.length < 10) return 0;
    
    // Calculate consistency (lower variance = higher consistency)
    const mean = performance_history.reduce((sum, p) => sum + p, 0) / performance_history.length;
    const variance = performance_history.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performance_history.length;
    const consistency_score = Math.max(0, 1 - variance);
    
    return consistency_score * this.config.reward_shaping.consistency_bonus;
  }
  
  /**
   * Calculate learning progress bonus
   */
  _calculateLearningProgressBonus(agentId) {
    const recent_improvements = this._getRecentImprovements(agentId);
    const improvement_rate = recent_improvements.reduce((sum, imp) => sum + imp, 0) / recent_improvements.length;
    
    return improvement_rate * this.config.reward_shaping.learning_progress_bonus;
  }
  
  /**
   * Track temporal reward for analysis
   */
  _trackTemporalReward(agentId, temporal_reward, final_reward) {
    if (!this.temporal_rewards.has(agentId)) {
      this.temporal_rewards.set(agentId, []);
    }
    
    const history = this.temporal_rewards.get(agentId);
    history.push({
      timestamp: Date.now(),
      temporal_reward,
      final_reward,
      immediate_ratio: temporal_reward.immediate / final_reward,
      medium_ratio: temporal_reward.medium_term / final_reward,
      long_ratio: temporal_reward.long_term / final_reward
    });
    
    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.temporal_rewards.set(agentId, history);
  }
  
  /**
   * Analyze temporal balance for agent
   */
  analyzeTemporalBalance(agentId) {
    const history = this.temporal_rewards.get(agentId);
    if (!history || history.length === 0) {
      return { balance: 'unknown', reason: 'no_data' };
    }
    
    const recent_history = history.slice(-100); // Last 100 rewards
    
    const avg_immediate = recent_history.reduce((sum, r) => sum + r.immediate_ratio, 0) / recent_history.length;
    const avg_medium = recent_history.reduce((sum, r) => sum + r.medium_ratio, 0) / recent_history.length;
    const avg_long = recent_history.reduce((sum, r) => sum + r.long_ratio, 0) / recent_history.length;
    
    // Determine balance
    let balance = 'balanced';
    let reason = 'optimal_temporal_distribution';
    
    if (avg_immediate > 0.7) {
      balance = 'short_term_biased';
      reason = 'excessive_immediate_focus';
    } else if (avg_long > 0.5) {
      balance = 'long_term_biased';
      reason = 'excessive_strategic_focus';
    } else if (avg_medium > 0.4) {
      balance = 'medium_term_biased';
      reason = 'tactical_focus';
    }
    
    return {
      balance,
      reason,
      ratios: {
        immediate: avg_immediate,
        medium: avg_medium,
        long: avg_long
      },
      recommendations: this._getBalanceRecommendations(balance, agentId)
    };
  }
  
  /**
   * Get balance recommendations
   */
  _getBalanceRecommendations(balance, agentId) {
    const config = this.agent_gamma_configs.get(agentId);
    
    switch (balance) {
      case 'short_term_biased':
        return ['increase_gamma_gradually', 'add_long_term_objectives', 'reduce_immediate_reward_weight'];
      case 'long_term_biased':
        return ['decrease_gamma_slightly', 'add_immediate_feedback', 'increase_short_term_opportunities'];
      case 'medium_term_biased':
        return ['balance_immediate_and_long_term', 'add_strategic_objectives'];
      default:
        return ['maintain_current_balance', 'monitor_performance'];
    }
  }
  
  /**
   * Helper methods for performance tracking
   */
  _getRecentPerformance(agentId, timeframe) {
    // Placeholder for performance tracking
    return Math.random() * 0.5; // Simulate recent performance
  }
  
  _calculateTrendReward(performance) {
    // Reward positive trends
    return performance > 0.3 ? 0.1 : -0.05;
  }
  
  _getLearningProgress(agentId) {
    // Placeholder for learning progress tracking
    return Math.random() * 0.3; // Simulate learning progress
  }
  
  _getStrategyEvolution(agentId) {
    // Placeholder for strategy evolution tracking
    return Math.random() * 0.2; // Simulate strategy evolution
  }
  
  _getPerformanceHistory(agentId) {
    // Placeholder for performance history
    return Array.from({length: 50}, () => Math.random());
  }
  
  _getRecentImprovements(agentId) {
    // Placeholder for recent improvements
    return Array.from({length: 10}, () => Math.random() * 0.1);
  }
  
  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      configured_agents: this.agent_gamma_configs.size,
      temporal_tracking: this.temporal_rewards.size,
      performance_metrics: this.performance_tracking,
      gamma_configurations: Object.keys(this.config.gamma_configurations).length,
      adjustment_factors: Object.keys(this.config.adjustment_factors).length
    };
  }
}

export { TemporalRewardOptimization }; 