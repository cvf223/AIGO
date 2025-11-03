/**
 * Awareness System
 * Multi-dimensional awareness system for AI-powered arbitrage
 */

import { EventEmitter } from 'events';

// Singleton instance
let _instance = null;

class AwarenessSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Singleton pattern
    if (_instance) {
      return _instance;
    }
    
    this.config = {
      updateInterval: 10000, // 10 seconds
      selfAwarenessWeight: 0.2,
      environmentAwarenessWeight: 0.4,
      competitiveAwarenessWeight: 0.3,
      metaAwarenessWeight: 0.1,
      ...config
    };
    
    // Dependencies
    this.blockchainConnector = config.blockchainConnector;
    
    // Awareness dimensions
    this.selfAwareness = this._initializeSelfAwareness();
    this.environmentAwareness = this._initializeEnvironmentAwareness();
    this.competitiveAwareness = this._initializeCompetitiveAwareness();
    this.metaAwareness = this._initializeMetaAwareness();
    
    // Monitoring state
    this.isMonitoring = false;
    this.updateInterval = null;
    
    _instance = this;
    
    console.log('🧠 Awareness System initialized');
  }
  
  /**
   * Initialize the awareness system
   */
  async initialize() {
    try {
      console.log('Initializing Awareness System...');
      
      // Validate dependencies
      if (!this.blockchainConnector) {
        throw new Error('Blockchain connector is required');
      }
      
      // Initialize awareness dimensions
      await this._initializeAwarenessDimensions();
      
      console.log('✅ Awareness System initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Awareness System:', error);
      return false;
    }
  }
  
  /**
   * Initialize awareness dimensions
   */
  async _initializeAwarenessDimensions() {
    try {
      // Initialize self awareness
      await this._updateSelfAwareness();
      
      // Initialize environment awareness
      await this._updateEnvironmentAwareness();
      
      // Initialize competitive awareness
      await this._updateCompetitiveAwareness();
      
      // Initialize meta awareness
      await this._updateMetaAwareness();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize awareness dimensions:', error);
      return false;
    }
  }
  
  /**
   * Start monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    console.log('Starting awareness monitoring...');
    
    // Update awareness every 10 seconds
    this.updateInterval = setInterval(() => {
      this._updateAwareness();
    }, this.config.updateInterval);
    
    this.isMonitoring = true;
    console.log('✅ Awareness monitoring started');
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('Stopping awareness monitoring...');
    
    // Clear update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('✅ Awareness monitoring stopped');
  }
  
  /**
   * Update awareness
   */
  async _updateAwareness() {
    try {
      // Update self awareness
      await this._updateSelfAwareness();
      
      // Update environment awareness
      await this._updateEnvironmentAwareness();
      
      // Update competitive awareness
      await this._updateCompetitiveAwareness();
      
      // Update meta awareness
      await this._updateMetaAwareness();
      
      // Emit awareness update event
      this.emit('awarenessUpdate', this.getAwarenessState());
    } catch (error) {
      console.error('Failed to update awareness:', error);
    }
  }
  
  /**
   * Initialize self awareness
   */
  _initializeSelfAwareness() {
    return {
      capabilities: {
        technical: {
          blockchain: {
            arbitrum: 0.9,
            ethereum: 0.8,
            multichain: 0.7,
            smartContracts: 0.8,
            gasOptimization: 0.8
          },
          arbitrage: {
            flashLoans: 0.9,
            spotArbitrage: 0.95,
            crossDexArbitrage: 0.9,
            triangularArbitrage: 0.85
          },
          trading: {
            priceDiscovery: 0.9,
            riskManagement: 0.8,
            positionSizing: 0.75,
            orderExecution: 0.85
          }
        },
        cognitive: {
          reasoning: {
            deduction: 0.85,
            induction: 0.8,
            strategicThinking: 0.9
          },
          learning: {
            patternRecognition: 0.9,
            adaptiveLearning: 0.85,
            reinforcementLearning: 0.8
          },
          prediction: {
            marketForecasting: 0.7,
            behaviorPrediction: 0.6,
            trendAnalysis: 0.8
          }
        }
      },
      performance: {
        accuracy: 0,
        speed: 0,
        efficiency: 0,
        reliability: 0,
        profitability: 0,
        adaptability: 0,
        trend: 'stable'
      },
      resources: {
        computationalCapacity: 0.8,
        memoryUtilization: 0.5,
        networkBandwidth: 0.7,
        apiQuotaRemaining: 1.0
      },
      limitations: [
        {
          type: 'technical',
          description: 'Gas price volatility sensitivity',
          severity: 0.6,
          mitigationStrategy: 'Adaptive gas price prediction'
        },
        {
          type: 'operational',
          description: 'Cross-chain arbitrage latency',
          severity: 0.7,
          mitigationStrategy: 'Parallel execution paths'
        }
      ]
    };
  }
  
  /**
   * Initialize environment awareness
   */
  _initializeEnvironmentAwareness() {
    return {
      market: {
        volatility: 0.5,
        liquidity: 0.7,
        sentiment: 'neutral',
        trends: [],
        recentSignificantEvents: []
      },
      blockchain: {
        network: 'arbitrum',
        gasPrice: 0,
        congestion: 0,
        blockTime: 0.25,
        mevActivity: 0.5,
        recentBlocks: []
      },
      opportunities: {
        currentOpportunities: 0,
        potentialProfit: 0,
        bestPairs: [],
        emergingOpportunities: [],
        historicalPerformance: {
          lastHour: {
            count: 0,
            averageProfit: 0,
            totalProfit: 0
          },
          lastDay: {
            count: 0,
            averageProfit: 0,
            totalProfit: 0
          }
        }
      },
      risks: {
        systemicRisks: [],
        operationalRisks: [],
        marketRisks: [],
        riskScore: 0.3
      }
    };
  }
  
  /**
   * Initialize competitive awareness
   */
  _initializeCompetitiveAwareness() {
    return {
      competitors: [],
      competitivePosition: {
        marketShare: 0.05,
        relativePerformance: 0.7,
        strategicPosition: 'specialized_niche'
      },
      competitorActions: {
        recentTransactions: [],
        patterns: [],
        predictedNextMoves: []
      },
      advantages: [
        {
          type: 'speed',
          strength: 0.9,
          sustainability: 0.7,
          description: 'Sub-50ms opportunity detection'
        },
        {
          type: 'multi_dimensional_awareness',
          strength: 0.8,
          sustainability: 0.9,
          description: 'Comprehensive awareness system'
        }
      ],
      threats: []
    };
  }
  
  /**
   * Initialize meta awareness
   */
  _initializeMetaAwareness() {
    return {
      awarenessLevel: 0.8,
      learningVelocity: 0.7,
      adaptationRate: 0.6,
      selfImprovement: {
        currentFocus: 'gas_optimization',
        improvementRate: 0.05,
        nextMilestone: 'cross_chain_arbitrage_mastery'
      },
      systemOptimization: {
        currentEfficiency: 0.75,
        bottlenecks: ['gas_price_volatility', 'execution_latency'],
        optimizationOpportunities: ['parallel_execution', 'predictive_gas_pricing']
      }
    };
  }
  
  /**
   * Update self awareness
   */
  async _updateSelfAwareness() {
    // Update performance metrics based on execution history
    // This would normally come from a performance monitoring system
    
    // Simulated performance update
    this.selfAwareness.performance = {
      accuracy: 0.92,
      speed: 0.85,
      efficiency: 0.78,
      reliability: 0.95,
      profitability: 0.88,
      adaptability: 0.82,
      trend: 'improving'
    };
    
    // Update resource utilization
    this.selfAwareness.resources = {
      computationalCapacity: 0.65,
      memoryUtilization: 0.45,
      networkBandwidth: 0.55,
      apiQuotaRemaining: 0.85
    };
    
    return this.selfAwareness;
  }
  
  /**
   * Update environment awareness
   */
  async _updateEnvironmentAwareness() {
    try {
      // Get blockchain state
      if (this.blockchainConnector) {
        // Get gas price
        const gasPrice = await this.blockchainConnector.getGasPrice('arbitrum');
        
        // Get latest block
        const latestBlock = await this.blockchainConnector.getLatestBlock('arbitrum');
        
        // Update blockchain state
        this.environmentAwareness.blockchain = {
          ...this.environmentAwareness.blockchain,
          gasPrice: parseFloat(gasPrice),
          congestion: this._calculateNetworkCongestion(gasPrice),
          lastBlockTime: latestBlock.timestamp,
          latestBlockNumber: latestBlock.number
        };
        
        // Add to recent blocks
        this.environmentAwareness.blockchain.recentBlocks.unshift({
          number: latestBlock.number,
          timestamp: latestBlock.timestamp,
          gasUsed: latestBlock.gasUsed.toString(),
          gasLimit: latestBlock.gasLimit.toString()
        });
        
        // Keep only last 10 blocks
        if (this.environmentAwareness.blockchain.recentBlocks.length > 10) {
          this.environmentAwareness.blockchain.recentBlocks.pop();
        }
      }
      
      // Update market state (simulated for now)
      this.environmentAwareness.market = {
        ...this.environmentAwareness.market,
        volatility: 0.65,
        liquidity: 0.8,
        sentiment: 'bullish',
        trends: [
          {
            asset: 'ETH',
            direction: 'up',
            strength: 0.7,
            duration: '2h'
          },
          {
            asset: 'ARB',
            direction: 'up',
            strength: 0.8,
            duration: '4h'
          }
        ]
      };
      
      // Update opportunities (simulated for now)
      this.environmentAwareness.opportunities = {
        ...this.environmentAwareness.opportunities,
        currentOpportunities: 12,
        potentialProfit: 75000,
        bestPairs: [
          {
            pair: 'ETH/USDC',
            exchanges: ['Uniswap', 'Sushiswap'],
            profitPotential: 0.8
          },
          {
            pair: 'ARB/USDC',
            exchanges: ['Camelot', 'Sushiswap'],
            profitPotential: 0.75
          }
        ]
      };
      
      return this.environmentAwareness;
    } catch (error) {
      console.error('Failed to update environment awareness:', error);
      return this.environmentAwareness;
    }
  }
  
  /**
   * Calculate network congestion
   */
  _calculateNetworkCongestion(gasPrice) {
    // Simple congestion calculation based on gas price
    // 0 = no congestion, 1 = extreme congestion
    const baseGasPrice = 0.1; // 0.1 gwei
    const maxGasPrice = 500; // 500 gwei
    
    const normalizedGasPrice = Math.min(parseFloat(gasPrice), maxGasPrice);
    return Math.min((normalizedGasPrice - baseGasPrice) / (maxGasPrice - baseGasPrice), 1);
  }
  
  /**
   * Update competitive awareness
   */
  async _updateCompetitiveAwareness() {
    // This would normally analyze on-chain data to detect competitor actions
    // Simulated update for now
    
    this.competitiveAwareness.competitors = [
      {
        id: 'competitor-1',
        address: '0x1234...5678',
        activity: 'high',
        lastSeen: Date.now() - 120000, // 2 minutes ago
        estimatedProfitability: 0.7,
        strategies: ['flash_loans', 'cross_dex']
      },
      {
        id: 'competitor-2',
        address: '0xabcd...efgh',
        activity: 'medium',
        lastSeen: Date.now() - 300000, // 5 minutes ago
        estimatedProfitability: 0.6,
        strategies: ['triangular_arbitrage']
      }
    ];
    
    this.competitiveAwareness.competitorActions.recentTransactions = [
      {
        competitor: 'competitor-1',
        txHash: '0x1234...5678',
        timestamp: Date.now() - 120000,
        type: 'arbitrage',
        estimatedProfit: 12500
      }
    ];
    
    return this.competitiveAwareness;
  }
  
  /**
   * Update meta awareness
   */
  async _updateMetaAwareness() {
    // Calculate overall awareness level
    const selfAwarenessScore = this._calculateSelfAwarenessScore();
    const environmentAwarenessScore = this._calculateEnvironmentAwarenessScore();
    const competitiveAwarenessScore = this._calculateCompetitiveAwarenessScore();
    
    // Update meta awareness
    this.metaAwareness.awarenessLevel = 
      (selfAwarenessScore * this.config.selfAwarenessWeight) +
      (environmentAwarenessScore * this.config.environmentAwarenessWeight) +
      (competitiveAwarenessScore * this.config.competitiveAwarenessWeight);
    
    // Update learning velocity based on recent improvements
    this.metaAwareness.learningVelocity = 0.75;
    
    // Update adaptation rate based on recent changes
    this.metaAwareness.adaptationRate = 0.68;
    
    return this.metaAwareness;
  }
  
  /**
   * Calculate self awareness score
   */
  _calculateSelfAwarenessScore() {
    const performance = this.selfAwareness.performance;
    
    // Average of performance metrics
    return (
      performance.accuracy +
      performance.speed +
      performance.efficiency +
      performance.reliability +
      performance.profitability +
      performance.adaptability
    ) / 6;
  }
  
  /**
   * Calculate environment awareness score
   */
  _calculateEnvironmentAwarenessScore() {
    // Based on completeness and recency of data
    const marketScore = this.environmentAwareness.market.trends.length > 0 ? 0.8 : 0.5;
    const blockchainScore = this.environmentAwareness.blockchain.recentBlocks.length > 0 ? 0.9 : 0.6;
    const opportunitiesScore = this.environmentAwareness.opportunities.bestPairs.length > 0 ? 0.85 : 0.5;
    
    return (marketScore + blockchainScore + opportunitiesScore) / 3;
  }
  
  /**
   * Calculate competitive awareness score
   */
  _calculateCompetitiveAwarenessScore() {
    // Based on competitor data
    return this.competitiveAwareness.competitors.length > 0 ? 0.75 : 0.4;
  }
  
  /**
   * Get awareness state
   */
  getAwarenessState() {
    return {
      selfAwareness: this.selfAwareness,
      environmentAwareness: this.environmentAwareness,
      competitiveAwareness: this.competitiveAwareness,
      metaAwareness: this.metaAwareness,
      timestamp: Date.now()
    };
  }
  
  /**
   * Validate opportunity
   */
  async validateOpportunity(opportunity) {
    try {
      // Check if opportunity is valid based on awareness
      
      // Check gas price
      const currentGasPrice = this.environmentAwareness.blockchain.gasPrice;
      const maxGasPrice = 100; // 100 gwei
      
      if (currentGasPrice > maxGasPrice) {
        return {
          valid: false,
          reason: `Gas price too high: ${currentGasPrice} gwei`
        };
      }
      
      // Check network congestion
      const congestion = this.environmentAwareness.blockchain.congestion;
      if (congestion > 0.8) {
        return {
          valid: false,
          reason: `Network congestion too high: ${congestion.toFixed(2)}`
        };
      }
      
      // Check for competing opportunities
      const competitorActivity = this.competitiveAwareness.competitors.some(c => c.activity === 'high');
      if (competitorActivity && opportunity.estimatedProfit < 60000) {
        return {
          valid: false,
          reason: 'High competitor activity and insufficient profit margin'
        };
      }
      
      // All checks passed
      return {
        valid: true
      };
    } catch (error) {
      console.error('Error validating opportunity:', error);
      return {
        valid: false,
        reason: 'Error validating opportunity'
      };
    }
  }
  
  /**
   * Update market state
   */
  async updateMarketState(update) {
    if (update.priceUpdates) {
      // Process price updates
      for (const priceUpdate of update.priceUpdates) {
        // Update market trends
        this._updateMarketTrends(priceUpdate);
      }
    }
  }
  
  /**
   * Update market trends
   */
  _updateMarketTrends(priceUpdate) {
    // Find existing trend for this asset
    const existingTrendIndex = this.environmentAwareness.market.trends.findIndex(
      t => t.asset === priceUpdate.asset
    );
    
    if (existingTrendIndex >= 0) {
      // Update existing trend
      const existingTrend = this.environmentAwareness.market.trends[existingTrendIndex];
      
      // Calculate new direction
      const newDirection = priceUpdate.price > priceUpdate.previousPrice ? 'up' : 'down';
      
      // If direction changed, create new trend
      if (existingTrend.direction !== newDirection) {
        this.environmentAwareness.market.trends[existingTrendIndex] = {
          asset: priceUpdate.asset,
          direction: newDirection,
          strength: 0.5,
          duration: '0h',
          startPrice: priceUpdate.previousPrice,
          currentPrice: priceUpdate.price,
          startTime: Date.now()
        };
      } else {
        // Update existing trend
        const durationMs = Date.now() - existingTrend.startTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        
        this.environmentAwareness.market.trends[existingTrendIndex] = {
          ...existingTrend,
          strength: Math.min(existingTrend.strength + 0.05, 1.0),
          duration: `${durationHours}h`,
          currentPrice: priceUpdate.price
        };
      }
    } else {
      // Create new trend
      this.environmentAwareness.market.trends.push({
        asset: priceUpdate.asset,
        direction: priceUpdate.price > priceUpdate.previousPrice ? 'up' : 'down',
        strength: 0.5,
        duration: '0h',
        startPrice: priceUpdate.previousPrice,
        currentPrice: priceUpdate.price,
        startTime: Date.now()
      });
    }
    
    // Keep only top 10 trends
    if (this.environmentAwareness.market.trends.length > 10) {
      // Sort by strength and keep top 10
      this.environmentAwareness.market.trends.sort((a, b) => b.strength - a.strength);
      this.environmentAwareness.market.trends = this.environmentAwareness.market.trends.slice(0, 10);
    }
  }
  
  /**
   * Update from execution result
   */
  async updateFromExecution(opportunity, result) {
    // Update self awareness based on execution result
    if (result.success) {
      // Increase accuracy and profitability
      this.selfAwareness.performance.accuracy = Math.min(this.selfAwareness.performance.accuracy + 0.01, 1.0);
      this.selfAwareness.performance.profitability = Math.min(this.selfAwareness.performance.profitability + 0.01, 1.0);
    } else {
      // Decrease accuracy and profitability
      this.selfAwareness.performance.accuracy = Math.max(this.selfAwareness.performance.accuracy - 0.01, 0.0);
      this.selfAwareness.performance.profitability = Math.max(this.selfAwareness.performance.profitability - 0.01, 0.0);
    }
    
    // Update environment awareness
    // Add to historical performance
    const hourlyPerformance = this.environmentAwareness.opportunities.historicalPerformance.lastHour;
    hourlyPerformance.count++;
    hourlyPerformance.totalProfit += result.profit;
    hourlyPerformance.averageProfit = hourlyPerformance.totalProfit / hourlyPerformance.count;
    
    const dailyPerformance = this.environmentAwareness.opportunities.historicalPerformance.lastDay;
    dailyPerformance.count++;
    dailyPerformance.totalProfit += result.profit;
    dailyPerformance.averageProfit = dailyPerformance.totalProfit / dailyPerformance.count;
    
    // Emit update event
    this.emit('awarenessUpdate', this.getAwarenessState());
  }
  
  /**
   * Update competitive awareness
   */
  updateCompetitiveAwareness(update) {
    if (update.competitorActions) {
      // Process competitor actions
      for (const action of update.competitorActions) {
        // Find competitor
        const competitorIndex = this.competitiveAwareness.competitors.findIndex(
          c => c.id === action.competitor
        );
        
        if (competitorIndex >= 0) {
          // Update competitor
          this.competitiveAwareness.competitors[competitorIndex] = {
            ...this.competitiveAwareness.competitors[competitorIndex],
            lastSeen: action.timestamp,
            activity: 'high'
          };
        }
        
        // Add to recent transactions
        this.competitiveAwareness.competitorActions.recentTransactions.unshift(action);
        
        // Keep only last 10 transactions
        if (this.competitiveAwareness.competitorActions.recentTransactions.length > 10) {
          this.competitiveAwareness.competitorActions.recentTransactions.pop();
        }
      }
    }
  }
}

export { AwarenessSystem }; 