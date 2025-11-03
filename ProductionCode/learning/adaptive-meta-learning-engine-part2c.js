/**
 * Adaptive Meta-Learning and Few-Shot Intelligence Engine - Part 2C
 * Dynamic Learning Rate Optimization
 * 
 * Elite meta-learning system for rapid adaptation and few-shot learning
 * Designed for top 1% AI and blockchain developer capabilities
 * 
 * Part 2C Features:
 * - Dynamic learning rate adaptation
 * - Performance-based rate adjustment
 * - Task-specific learning rates
 * - Gradient-based rate optimization
 * - Adaptive momentum and decay
 */

import { 
  MetaLearningTask, 
  DataPoint,
  TaskType
} from './adaptive-meta-learning-engine-part1';

export interface LearningRateConfig {
  initialRate: number;
  minRate: number;
  maxRate: number;
  adaptationSpeed: number;
  decayFactor: number;
  warmupSteps: number;
  schedulerType: 'adaptive' | 'cosine' | 'exponential' | 'polynomial' | 'plateau';
}

export interface LearningRateScheduler {
  schedulerId: string;
  type: string;
  currentRate: number;
  initialRate: number;
  step: number;
  performance: SchedulerPerformance;
  parameters: SchedulerParameters;
}

export interface SchedulerParameters {
  decayRate: number;
  decaySteps: number;
  warmupSteps: number;
  minRate: number;
  maxRate: number;
  patience: number;
  threshold: number;
}

export interface SchedulerPerformance {
  avgConvergenceSpeed: number;
  stabilityScore: number;
  adaptationEffectiveness: number;
  totalSteps: number;
  bestRate: number;
  worstRate: number;
}

export interface AdaptiveLearningRate {
  taskId: string;
  innerRate: number;
  outerRate: number;
  momentum: number;
  velocity: number;
  adaptationHistory: RateAdaptation[];
  performanceGradient: number;
}

export interface RateAdaptation {
  step: number;
  oldRate: number;
  newRate: number;
  reason: 'performance' | 'gradient' | 'convergence' | 'oscillation' | 'schedule';
  performanceImprovement: number;
  timestamp: Date;
}

export interface GradientStatistics {
  gradientNorm: number;
  gradientVariance: number;
  gradientDirection: number[];
  historicalNorms: number[];
  stabilityMeasure: number;
  adaptationSignal: number;
}

export interface OptimizationState {
  velocity: number[];
  momentum: number[];
  adaptiveRates: number[];
  accumulatedGradients: number[];
  stepCount: number;
  bestLoss: number;
}

/**
 * Dynamic Learning Rate Optimizer - Part 2C
 * Handles adaptive learning rate optimization for meta-learning tasks
 */
export class DynamicLearningRateOptimizer {
  private learningRateConfig: LearningRateConfig;
  private schedulers: Map<string, LearningRateScheduler> = new Map();
  private adaptiveRates: Map<string, AdaptiveLearningRate> = new Map();
  private optimizationStates: Map<string, OptimizationState> = new Map();
  
  private gradientHistory: Map<string, GradientStatistics[]> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private totalOptimizationSteps: number = 0;

  constructor(config: LearningRateConfig) {
    this.learningRateConfig = config;
    this.initializeSchedulers();
    
    console.log('📈 Dynamic Learning Rate Optimizer initialized');
  }

  /**
   * Optimize learning rate for a specific task based on performance
   */
  async optimizeTaskLearningRate(
    taskId: string,
    currentLoss: number,
    gradients: number[],
    agentId: string
  ): Promise<AdaptiveLearningRate> {
    console.log(`📊 Optimizing learning rate for task ${taskId}...`);

    // Get or create adaptive learning rate for this task
    let adaptiveRate = this.adaptiveRates.get(taskId);
    if (!adaptiveRate) {
      adaptiveRate = this.createAdaptiveLearningRate(taskId);
      this.adaptiveRates.set(taskId, adaptiveRate);
    }

    // Analyze gradient statistics
    const gradientStats = await this.analyzeGradientStatistics(taskId, gradients);
    
    // Compute performance-based adaptation
    const performanceSignal = await this.computePerformanceSignal(taskId, currentLoss);
    
    // Update learning rates based on signals
    const rateUpdate = await this.updateLearningRates(
      adaptiveRate, 
      gradientStats, 
      performanceSignal
    );
    
    // Record adaptation
    this.recordRateAdaptation(taskId, rateUpdate);
    
    this.totalOptimizationSteps++;
    
    console.log(`✅ Learning rate optimized - Inner: ${rateUpdate.innerRate.toFixed(6)}, Outer: ${rateUpdate.outerRate.toFixed(6)}`);
    
    return rateUpdate;
  }

  /**
   * Apply scheduled learning rate decay
   */
  async applyScheduledDecay(
    schedulerType: string,
    step: number,
    performance: number
  ): Promise<number> {
    console.log(`⏰ Applying ${schedulerType} learning rate schedule at step ${step}...`);

    const scheduler = this.schedulers.get(schedulerType);
    if (!scheduler) {
      console.warn(`Scheduler ${schedulerType} not found, using default`);
      return this.learningRateConfig.initialRate;
    }

    let newRate = scheduler.currentRate;

    switch (scheduler.type) {
      case 'exponential':
        newRate = this.applyExponentialDecay(scheduler, step);
        break;
      case 'cosine':
        newRate = this.applyCosineDecay(scheduler, step);
        break;
      case 'plateau':
        newRate = this.applyPlateauDecay(scheduler, performance);
        break;
      case 'polynomial':
        newRate = this.applyPolynomialDecay(scheduler, step);
        break;
      default:
        newRate = this.applyAdaptiveDecay(scheduler, step, performance);
    }

    // Update scheduler state
    scheduler.currentRate = newRate;
    scheduler.step = step;
    
    // Update performance metrics
    this.updateSchedulerPerformance(schedulerType, newRate, performance);

    console.log(`✅ Applied ${schedulerType} decay - New rate: ${newRate.toFixed(6)}`);
    
    return newRate;
  }

  /**
   * Compute optimal learning rates for inner and outer loops
   */
  async computeOptimalRates(
    taskType: TaskType,
    gradientNorms: number[],
    lossHistory: number[]
  ): Promise<OptimalRates> {
    console.log(`🎯 Computing optimal learning rates for ${taskType.category} tasks...`);

    // Analyze gradient behavior
    const gradientBehavior = this.analyzeGradientBehavior(gradientNorms);
    
    // Analyze loss convergence
    const convergenceBehavior = this.analyzeLossConvergence(lossHistory);
    
    // Compute task-specific optimal rates
    const innerRate = this.computeInnerOptimalRate(gradientBehavior, convergenceBehavior);
    const outerRate = this.computeOuterOptimalRate(gradientBehavior, convergenceBehavior);
    
    // Apply task-type specific adjustments
    const adjustedRates = this.applyTaskTypeAdjustments(
      { innerRate, outerRate }, 
      taskType
    );

    const optimalRates: OptimalRates = {
      innerRate: adjustedRates.innerRate,
      outerRate: adjustedRates.outerRate,
      confidence: this.computeRateConfidence(gradientBehavior, convergenceBehavior),
      adaptationNeeded: gradientBehavior.isUnstable || convergenceBehavior.isStagnant,
      recommendedScheduler: this.recommendScheduler(gradientBehavior, convergenceBehavior)
    };

    console.log(`✅ Optimal rates computed - Inner: ${optimalRates.innerRate.toFixed(6)}, Outer: ${optimalRates.outerRate.toFixed(6)}`);
    
    return optimalRates;
  }

  /**
   * Adapt learning rate based on meta-gradient information
   */
  async adaptFromMetaGradients(
    taskId: string,
    metaGradients: number[],
    adaptationPerformance: number
  ): Promise<MetaAdaptedRates> {
    console.log(`🔄 Adapting learning rate from meta-gradients for task ${taskId}...`);

    const adaptiveRate = this.adaptiveRates.get(taskId);
    if (!adaptiveRate) {
      throw new Error(`No adaptive rate found for task ${taskId}`);
    }

    // Analyze meta-gradient patterns
    const metaGradientStats = this.analyzeMetaGradients(metaGradients);
    
    // Compute adaptation signal
    const adaptationSignal = this.computeMetaAdaptationSignal(
      metaGradientStats,
      adaptationPerformance
    );
    
    // Apply meta-gradient based updates
    const newInnerRate = this.updateInnerRateFromMeta(
      adaptiveRate.innerRate,
      adaptationSignal,
      metaGradientStats
    );
    
    const newOuterRate = this.updateOuterRateFromMeta(
      adaptiveRate.outerRate,
      adaptationSignal,
      metaGradientStats
    );

    // Update adaptive rate object
    adaptiveRate.innerRate = newInnerRate;
    adaptiveRate.outerRate = newOuterRate;
    adaptiveRate.performanceGradient = adaptationSignal.performanceGradient;

    const metaAdaptedRates: MetaAdaptedRates = {
      taskId,
      newInnerRate,
      newOuterRate,
      adaptationSignal: adaptationSignal.strength,
      metaGradientNorm: metaGradientStats.norm,
      performanceImprovement: adaptationSignal.performanceGradient,
      confidence: adaptationSignal.confidence
    };

    console.log(`✅ Meta-gradient adaptation completed - Signal strength: ${adaptationSignal.strength.toFixed(3)}`);
    
    return metaAdaptedRates;
  }

  /**
   * Get comprehensive optimizer status
   */
  public getOptimizerStatus(): OptimizerStatus {
    return {
      totalOptimizationSteps: this.totalOptimizationSteps,
      activeSchedulers: this.schedulers.size,
      adaptiveRates: this.adaptiveRates.size,
      optimizationStates: this.optimizationStates.size,
      avgPerformanceImprovement: this.calculateAveragePerformanceImprovement(),
      systemEfficiency: this.calculateSystemEfficiency(),
      systemHealth: this.totalOptimizationSteps > 100 ? 'optimizer_elite' : 'optimizer_active'
    };
  }

  // Private implementation methods

  private initializeSchedulers(): void {
    // Initialize different scheduler types
    const exponentialScheduler: LearningRateScheduler = {
      schedulerId: 'exp_scheduler',
      type: 'exponential',
      currentRate: this.learningRateConfig.initialRate,
      initialRate: this.learningRateConfig.initialRate,
      step: 0,
      performance: this.createDefaultPerformance(),
      parameters: {
        decayRate: 0.96,
        decaySteps: 100,
        warmupSteps: this.learningRateConfig.warmupSteps,
        minRate: this.learningRateConfig.minRate,
        maxRate: this.learningRateConfig.maxRate,
        patience: 10,
        threshold: 0.01
      }
    };

    const cosineScheduler: LearningRateScheduler = {
      schedulerId: 'cosine_scheduler',
      type: 'cosine',
      currentRate: this.learningRateConfig.initialRate,
      initialRate: this.learningRateConfig.initialRate,
      step: 0,
      performance: this.createDefaultPerformance(),
      parameters: {
        decayRate: 0.5,
        decaySteps: 1000,
        warmupSteps: this.learningRateConfig.warmupSteps,
        minRate: this.learningRateConfig.minRate,
        maxRate: this.learningRateConfig.maxRate,
        patience: 20,
        threshold: 0.005
      }
    };

    const adaptiveScheduler: LearningRateScheduler = {
      schedulerId: 'adaptive_scheduler',
      type: 'adaptive',
      currentRate: this.learningRateConfig.initialRate,
      initialRate: this.learningRateConfig.initialRate,
      step: 0,
      performance: this.createDefaultPerformance(),
      parameters: {
        decayRate: 0.8,
        decaySteps: 50,
        warmupSteps: this.learningRateConfig.warmupSteps,
        minRate: this.learningRateConfig.minRate,
        maxRate: this.learningRateConfig.maxRate,
        patience: 5,
        threshold: 0.02
      }
    };

    this.schedulers.set('exponential', exponentialScheduler);
    this.schedulers.set('cosine', cosineScheduler);
    this.schedulers.set('adaptive', adaptiveScheduler);
  }

  private createDefaultPerformance(): SchedulerPerformance {
    return {
      avgConvergenceSpeed: 0.5,
      stabilityScore: 0.7,
      adaptationEffectiveness: 0.6,
      totalSteps: 0,
      bestRate: this.learningRateConfig.initialRate,
      worstRate: this.learningRateConfig.initialRate
    };
  }

  private createAdaptiveLearningRate(taskId: string): AdaptiveLearningRate {
    return {
      taskId,
      innerRate: this.learningRateConfig.initialRate,
      outerRate: this.learningRateConfig.initialRate * 0.1, // Outer rate typically smaller
      momentum: 0.9,
      velocity: 0.0,
      adaptationHistory: [],
      performanceGradient: 0.0
    };
  }

  private async analyzeGradientStatistics(
    taskId: string,
    gradients: number[]
  ): Promise<GradientStatistics> {
    // Compute gradient norm
    const gradientNorm = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
    
    // Get historical gradient norms
    let history = this.gradientHistory.get(taskId) || [];
    
    // Compute gradient variance
    const gradientVariance = this.computeGradientVariance(gradients);
    
    // Update historical norms
    const historicalNorms = history.map(h => h.gradientNorm);
    historicalNorms.push(gradientNorm);
    
    // Keep only recent history
    if (historicalNorms.length > 50) {
      historicalNorms.splice(0, historicalNorms.length - 50);
    }
    
    // Compute stability measure
    const stabilityMeasure = this.computeStabilityMeasure(historicalNorms);
    
    // Compute adaptation signal
    const adaptationSignal = this.computeAdaptationSignal(gradientNorm, historicalNorms);

    const gradientStats: GradientStatistics = {
      gradientNorm,
      gradientVariance,
      gradientDirection: gradients.map(g => g / Math.max(gradientNorm, 1e-8)),
      historicalNorms,
      stabilityMeasure,
      adaptationSignal
    };

    // Update history
    history.push(gradientStats);
    this.gradientHistory.set(taskId, history);

    return gradientStats;
  }

  private async computePerformanceSignal(taskId: string, currentLoss: number): Promise<number> {
    // Get performance history
    let perfHistory = this.performanceHistory.get(taskId) || [];
    perfHistory.push(currentLoss);
    
    // Keep only recent history
    if (perfHistory.length > 20) {
      perfHistory = perfHistory.slice(-20);
    }
    
    this.performanceHistory.set(taskId, perfHistory);

    // Compute performance trend
    if (perfHistory.length < 2) {
      return 0; // No signal with insufficient data
    }

    // Simple moving average trend
    const recentAvg = perfHistory.slice(-5).reduce((sum, val) => sum + val, 0) / 5;
    const olderAvg = perfHistory.slice(-10, -5).reduce((sum, val) => sum + val, 0) / 5;
    
    // Positive signal means improving (decreasing loss)
    return olderAvg - recentAvg;
  }

  private async updateLearningRates(
    adaptiveRate: AdaptiveLearningRate,
    gradientStats: GradientStatistics,
    performanceSignal: number
  ): Promise<AdaptiveLearningRate> {
    // Compute adaptation factors
    const gradientFactor = this.computeGradientAdaptationFactor(gradientStats);
    const performanceFactor = this.computePerformanceAdaptationFactor(performanceSignal);
    
    // Update inner rate
    const innerAdaptation = gradientFactor * this.learningRateConfig.adaptationSpeed;
    let newInnerRate = adaptiveRate.innerRate * (1 + innerAdaptation);
    
    // Update outer rate
    const outerAdaptation = performanceFactor * this.learningRateConfig.adaptationSpeed * 0.5;
    let newOuterRate = adaptiveRate.outerRate * (1 + outerAdaptation);
    
    // Apply bounds
    newInnerRate = Math.max(this.learningRateConfig.minRate, 
                          Math.min(this.learningRateConfig.maxRate, newInnerRate));
    newOuterRate = Math.max(this.learningRateConfig.minRate * 0.1, 
                          Math.min(this.learningRateConfig.maxRate * 0.1, newOuterRate));

    // Update adaptive rate
    adaptiveRate.innerRate = newInnerRate;
    adaptiveRate.outerRate = newOuterRate;
    adaptiveRate.performanceGradient = performanceSignal;

    return adaptiveRate;
  }

  private recordRateAdaptation(taskId: string, adaptiveRate: AdaptiveLearningRate): void {
    const adaptation: RateAdaptation = {
      step: this.totalOptimizationSteps,
      oldRate: adaptiveRate.innerRate,
      newRate: adaptiveRate.innerRate,
      reason: 'performance',
      performanceImprovement: adaptiveRate.performanceGradient,
      timestamp: new Date()
    };

    adaptiveRate.adaptationHistory.push(adaptation);
    
    // Keep only recent history
    if (adaptiveRate.adaptationHistory.length > 100) {
      adaptiveRate.adaptationHistory = adaptiveRate.adaptationHistory.slice(-50);
    }
  }

  private applyExponentialDecay(scheduler: LearningRateScheduler, step: number): number {
    const decaySteps = scheduler.parameters.decaySteps;
    const decayRate = scheduler.parameters.decayRate;
    
    return scheduler.initialRate * Math.pow(decayRate, Math.floor(step / decaySteps));
  }

  private applyCosineDecay(scheduler: LearningRateScheduler, step: number): number {
    const totalSteps = scheduler.parameters.decaySteps;
    const minRate = scheduler.parameters.minRate;
    
    const cosineDecay = 0.5 * (1 + Math.cos(Math.PI * step / totalSteps));
    return minRate + (scheduler.initialRate - minRate) * cosineDecay;
  }

  private applyPlateauDecay(scheduler: LearningRateScheduler, performance: number): number {
    // Simple plateau detection - more sophisticated logic could be added
    const threshold = scheduler.parameters.threshold;
    const decayRate = scheduler.parameters.decayRate;
    
    // If performance improvement is below threshold, decay
    if (Math.abs(performance) < threshold) {
      return scheduler.currentRate * decayRate;
    }
    
    return scheduler.currentRate;
  }

  private applyPolynomialDecay(scheduler: LearningRateScheduler, step: number): number {
    const totalSteps = scheduler.parameters.decaySteps;
    const power = 0.9; // Polynomial power
    
    const decay = Math.pow(1 - step / totalSteps, power);
    return scheduler.initialRate * decay;
  }

  private applyAdaptiveDecay(scheduler: LearningRateScheduler, step: number, performance: number): number {
    // Adaptive decay based on performance
    const performanceThreshold = scheduler.parameters.threshold;
    const decayRate = scheduler.parameters.decayRate;
    
    if (performance > performanceThreshold) {
      // Good performance, slight increase
      return Math.min(scheduler.currentRate * 1.01, scheduler.parameters.maxRate);
    } else {
      // Poor performance, decay
      return Math.max(scheduler.currentRate * decayRate, scheduler.parameters.minRate);
    }
  }

  private updateSchedulerPerformance(schedulerType: string, newRate: number, performance: number): void {
    const scheduler = this.schedulers.get(schedulerType);
    if (scheduler) {
      scheduler.performance.totalSteps++;
      scheduler.performance.bestRate = Math.max(scheduler.performance.bestRate, newRate);
      scheduler.performance.worstRate = Math.min(scheduler.performance.worstRate, newRate);
      
      // Update running averages
      const alpha = 0.1; // Exponential moving average factor
      scheduler.performance.adaptationEffectiveness = 
        alpha * performance + (1 - alpha) * scheduler.performance.adaptationEffectiveness;
    }
  }

  private computeGradientVariance(gradients: number[]): number {
    const mean = gradients.reduce((sum, g) => sum + g, 0) / gradients.length;
    const variance = gradients.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / gradients.length;
    return variance;
  }

  private computeStabilityMeasure(historicalNorms: number[]): number {
    if (historicalNorms.length < 2) return 1.0;
    
    const variance = this.computeVariance(historicalNorms);
    return 1 / (1 + variance); // Higher variance = lower stability
  }

  private computeVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private computeAdaptationSignal(currentNorm: number, historicalNorms: number[]): number {
    if (historicalNorms.length < 5) return 0;
    
    const recentAvg = historicalNorms.slice(-5).reduce((sum, val) => sum + val, 0) / 5;
    return (currentNorm - recentAvg) / Math.max(recentAvg, 1e-8);
  }

  private computeGradientAdaptationFactor(gradientStats: GradientStatistics): number {
    // Combine gradient norm and stability for adaptation factor
    const normFactor = Math.min(gradientStats.gradientNorm, 1.0); // Clip large norms
    const stabilityFactor = gradientStats.stabilityMeasure;
    
    return (normFactor + stabilityFactor) / 2;
  }

  private computePerformanceAdaptationFactor(performanceSignal: number): number {
    // Convert performance signal to adaptation factor
    return Math.tanh(performanceSignal); // Bounded between -1 and 1
  }

  private analyzeGradientBehavior(gradientNorms: number[]): GradientBehavior {
    const variance = this.computeVariance(gradientNorms);
    const trend = this.computeTrend(gradientNorms);
    
    return {
      variance,
      trend,
      isUnstable: variance > 1.0,
      isIncreasing: trend > 0.1,
      isDecreasing: trend < -0.1
    };
  }

  private analyzeLossConvergence(lossHistory: number[]): ConvergenceBehavior {
    const trend = this.computeTrend(lossHistory);
    const recentVariance = this.computeVariance(lossHistory.slice(-10));
    
    return {
      trend,
      recentVariance,
      isConverging: trend < -0.01,
      isStagnant: Math.abs(trend) < 0.001,
      isOscillating: recentVariance > 0.1
    };
  }

  private computeTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear trend
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private computeInnerOptimalRate(
    gradientBehavior: GradientBehavior,
    convergenceBehavior: ConvergenceBehavior
  ): number {
    let rate = this.learningRateConfig.initialRate;
    
    if (gradientBehavior.isUnstable) {
      rate *= 0.5; // Reduce for stability
    }
    
    if (convergenceBehavior.isStagnant) {
      rate *= 1.5; // Increase to escape plateau
    }
    
    if (convergenceBehavior.isOscillating) {
      rate *= 0.7; // Reduce oscillations
    }
    
    return Math.max(this.learningRateConfig.minRate, 
                   Math.min(this.learningRateConfig.maxRate, rate));
  }

  private computeOuterOptimalRate(
    gradientBehavior: GradientBehavior,
    convergenceBehavior: ConvergenceBehavior
  ): number {
    // Outer rate is typically smaller than inner rate
    const innerRate = this.computeInnerOptimalRate(gradientBehavior, convergenceBehavior);
    return innerRate * 0.1;
  }

  private applyTaskTypeAdjustments(rates: { innerRate: number; outerRate: number }, taskType: TaskType): { innerRate: number; outerRate: number } {
    let multiplier = 1.0;
    
    // Adjust based on task complexity
    switch (taskType.complexity) {
      case 'simple':
        multiplier = 1.2;
        break;
      case 'complex':
        multiplier = 0.8;
        break;
      case 'expert':
        multiplier = 0.6;
        break;
      case 'elite':
        multiplier = 0.4;
        break;
    }
    
    return {
      innerRate: rates.innerRate * multiplier,
      outerRate: rates.outerRate * multiplier
    };
  }

  private computeRateConfidence(
    gradientBehavior: GradientBehavior,
    convergenceBehavior: ConvergenceBehavior
  ): number {
    let confidence = 0.5; // Base confidence
    
    if (!gradientBehavior.isUnstable) confidence += 0.2;
    if (convergenceBehavior.isConverging) confidence += 0.2;
    if (!convergenceBehavior.isOscillating) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  private recommendScheduler(
    gradientBehavior: GradientBehavior,
    convergenceBehavior: ConvergenceBehavior
  ): string {
    if (convergenceBehavior.isStagnant) {
      return 'adaptive';
    }
    
    if (gradientBehavior.isUnstable) {
      return 'exponential';
    }
    
    return 'cosine';
  }

  private analyzeMetaGradients(metaGradients: number[]): MetaGradientStats {
    const norm = Math.sqrt(metaGradients.reduce((sum, g) => sum + g * g, 0));
    const mean = metaGradients.reduce((sum, g) => sum + g, 0) / metaGradients.length;
    const variance = this.computeGradientVariance(metaGradients);
    
    return {
      norm,
      mean,
      variance,
      direction: metaGradients.map(g => g / Math.max(norm, 1e-8))
    };
  }

  private computeMetaAdaptationSignal(
    metaGradientStats: MetaGradientStats,
    adaptationPerformance: number
  ): AdaptationSignal {
    const strength = Math.min(metaGradientStats.norm, 1.0);
    const performanceGradient = adaptationPerformance;
    const confidence = 1 / (1 + metaGradientStats.variance);
    
    return {
      strength,
      performanceGradient,
      confidence,
      direction: metaGradientStats.direction
    };
  }

  private updateInnerRateFromMeta(
    currentRate: number,
    adaptationSignal: AdaptationSignal,
    metaGradientStats: MetaGradientStats
  ): number {
    const adaptationFactor = adaptationSignal.strength * adaptationSignal.confidence;
    const newRate = currentRate * (1 + adaptationFactor * 0.1);
    
    return Math.max(this.learningRateConfig.minRate,
                   Math.min(this.learningRateConfig.maxRate, newRate));
  }

  private updateOuterRateFromMeta(
    currentRate: number,
    adaptationSignal: AdaptationSignal,
    metaGradientStats: MetaGradientStats
  ): number {
    const adaptationFactor = adaptationSignal.performanceGradient * adaptationSignal.confidence;
    const newRate = currentRate * (1 + adaptationFactor * 0.05);
    
    return Math.max(this.learningRateConfig.minRate * 0.1,
                   Math.min(this.learningRateConfig.maxRate * 0.1, newRate));
  }

  private calculateAveragePerformanceImprovement(): number {
    let totalImprovement = 0;
    let count = 0;
    
    for (const [_, adaptiveRate] of this.adaptiveRates) {
      const recentAdaptations = adaptiveRate.adaptationHistory.slice(-10);
      for (const adaptation of recentAdaptations) {
        totalImprovement += adaptation.performanceImprovement;
        count++;
      }
    }
    
    return count > 0 ? totalImprovement / count : 0;
  }

  private calculateSystemEfficiency(): number {
    let totalEfficiency = 0;
    let count = 0;
    
    for (const [_, scheduler] of this.schedulers) {
      totalEfficiency += scheduler.performance.adaptationEffectiveness;
      count++;
    }
    
    return count > 0 ? totalEfficiency / count : 0.5;
  }
}

// Supporting interfaces for Part 2C

interface OptimalRates {
  innerRate: number;
  outerRate: number;
  confidence: number;
  adaptationNeeded: boolean;
  recommendedScheduler: string;
}

interface MetaAdaptedRates {
  taskId: string;
  newInnerRate: number;
  newOuterRate: number;
  adaptationSignal: number;
  metaGradientNorm: number;
  performanceImprovement: number;
  confidence: number;
}

interface OptimizerStatus {
  totalOptimizationSteps: number;
  activeSchedulers: number;
  adaptiveRates: number;
  optimizationStates: number;
  avgPerformanceImprovement: number;
  systemEfficiency: number;
  systemHealth: 'optimizer_basic' | 'optimizer_active' | 'optimizer_elite';
}

interface GradientBehavior {
  variance: number;
  trend: number;
  isUnstable: boolean;
  isIncreasing: boolean;
  isDecreasing: boolean;
}

interface ConvergenceBehavior {
  trend: number;
  recentVariance: number;
  isConverging: boolean;
  isStagnant: boolean;
  isOscillating: boolean;
}

interface MetaGradientStats {
  norm: number;
  mean: number;
  variance: number;
  direction: number[];
}

interface AdaptationSignal {
  strength: number;
  performanceGradient: number;
  confidence: number;
  direction: number[];
}

// File ends here - Part 2C complete 