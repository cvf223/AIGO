import { EventEmitter } from 'events';
import { elizaLogger } from '@elizaos/core';

export interface CircuitBreakerConfig {
  errorThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private errorCount = 0;
  private lastFailTime = 0;
  private successCount = 0;
  private resetTimer: NodeJS.Timeout | null = null;
  
  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      errorThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000 // 10 seconds
    }
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailTime < this.config.resetTimeout) {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      // Try half-open
      this.state = 'half-open';
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.errorCount = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'closed';
        this.successCount = 0;
        elizaLogger.info(`Circuit breaker ${this.name} is now CLOSED`);
      }
    }
  }
  
  private onError(): void {
    this.errorCount++;
    this.lastFailTime = Date.now();
    
    if (this.state === 'half-open') {
      this.state = 'open';
      this.successCount = 0;
      elizaLogger.warn(`Circuit breaker ${this.name} is now OPEN (half-open test failed)`);
    } else if (this.errorCount >= this.config.errorThreshold) {
      this.state = 'open';
      elizaLogger.warn(`Circuit breaker ${this.name} is now OPEN (threshold reached)`);
      
      // Schedule reset
      if (this.resetTimer) clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => {
        this.state = 'half-open';
        this.errorCount = 0;
        elizaLogger.info(`Circuit breaker ${this.name} is now HALF-OPEN`);
      }, this.config.resetTimeout);
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  reset(): void {
    this.state = 'closed';
    this.errorCount = 0;
    this.successCount = 0;
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}

export class RetryHandler {
  constructor(
    private config: RetryConfig = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    }
  ) {}
  
  async execute<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.config.initialDelay;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          elizaLogger.info(`Retry attempt ${attempt} for ${context} after ${delay}ms`);
          await this.sleep(delay);
        }
        
        return await operation();
      } catch (error) {
        lastError = error as Error;
        elizaLogger.warn(`Operation failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}): ${context}`, error);
        
        // Calculate next delay with exponential backoff
        delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
      }
    }
    
    throw new Error(`Operation failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication errors, validation errors, etc.
    const nonRetryableMessages = [
      'unauthorized',
      'forbidden',
      'invalid',
      'bad request',
      'not found'
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    return nonRetryableMessages.some(msg => errorMessage.includes(msg));
  }
}

export class ErrorRecoveryService extends EventEmitter {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryHandler: RetryHandler;
  private fallbackHandlers: Map<string, () => Promise<any>> = new Map();
  private failureHistory: Array<{name: string; timestamp: number; error: string}> = [];
  private autoRecoveryStrategies: Map<string, () => Promise<void>> = new Map();
  private recoveryCheckInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    this.retryHandler = new RetryHandler();
    this.startAutoRecovery();
  }
  
  async executeWithRecovery<T>(
    name: string,
    operation: () => Promise<T>,
    options: {
      useCircuitBreaker?: boolean;
      useRetry?: boolean;
      fallback?: () => Promise<T>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      useCircuitBreaker = true,
      useRetry = true,
      fallback,
      timeout = 30000
    } = options;
    
    try {
      // Apply timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation ${name} timed out`)), timeout);
      });
      
      // Main operation with recovery strategies
      let wrappedOperation = operation;
      
      // Wrap with retry logic
      if (useRetry) {
        wrappedOperation = () => this.retryHandler.execute(operation, name);
      }
      
      // Wrap with circuit breaker
      if (useCircuitBreaker) {
        const breaker = this.getOrCreateCircuitBreaker(name);
        const prevOperation = wrappedOperation;
        wrappedOperation = () => breaker.execute(prevOperation);
      }
      
      // Execute with timeout
      const result = await Promise.race([
        wrappedOperation(),
        timeoutPromise
      ]) as T;
      
      this.emit('operation-success', { name, timestamp: Date.now() });
      return result;
      
    } catch (error) {
      elizaLogger.error(`Operation ${name} failed:`, error);
      this.recordFailure(name, error as Error);
      this.emit('operation-failure', { name, error, timestamp: Date.now() });
      
      // Try fallback if available
      if (fallback || this.fallbackHandlers.has(name)) {
        const fallbackFn = fallback || this.fallbackHandlers.get(name)!;
        elizaLogger.info(`Executing fallback for ${name}`);
        try {
          const fallbackResult = await fallbackFn();
          this.emit('fallback-success', { name, timestamp: Date.now() });
          return fallbackResult;
        } catch (fallbackError) {
          elizaLogger.error(`Fallback for ${name} also failed:`, fallbackError);
          this.emit('fallback-failure', { name, error: fallbackError, timestamp: Date.now() });
        }
      }
      
      throw error;
    }
  }
  
  registerFallback(name: string, fallback: () => Promise<any>): void {
    this.fallbackHandlers.set(name, fallback);
  }
  
  registerAutoRecovery(name: string, strategy: () => Promise<void>): void {
    this.autoRecoveryStrategies.set(name, strategy);
  }
  
  getCircuitBreakerState(name: string): CircuitState | null {
    const breaker = this.circuitBreakers.get(name);
    return breaker ? breaker.getState() : null;
  }
  
  resetCircuitBreaker(name: string): void {
    const breaker = this.circuitBreakers.get(name);
    if (breaker) {
      breaker.reset();
      elizaLogger.info(`Circuit breaker ${name} manually reset`);
    }
  }
  
  getHealthReport(): {
    circuitBreakers: Array<{ name: string; state: CircuitState }>;
    recentFailures: number;
    failureRate: number;
    topFailures: Array<{ name: string; count: number }>;
    healthScore: number;
  } {
    const circuitBreakers = Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => ({
      name,
      state: breaker.getState()
    }));
    
    // Calculate recent failures (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentFailures = this.failureHistory.filter(f => f.timestamp > oneHourAgo).length;
    
    // Calculate failure rate
    const totalOperations = this.failureHistory.length + 100; // Assume some successes
    const failureRate = this.failureHistory.length / totalOperations;
    
    // Get top failures
    const failureCounts = new Map<string, number>();
    this.failureHistory.forEach(f => {
      failureCounts.set(f.name, (failureCounts.get(f.name) || 0) + 1);
    });
    
    const topFailures = Array.from(failureCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate health score (0-100)
    const openCircuits = circuitBreakers.filter(cb => cb.state === 'open').length;
    const circuitHealthScore = Math.max(0, 100 - (openCircuits * 20));
    const failureHealthScore = Math.max(0, 100 - (failureRate * 100));
    const healthScore = (circuitHealthScore + failureHealthScore) / 2;
    
    return {
      circuitBreakers,
      recentFailures,
      failureRate,
      topFailures,
      healthScore
    };
  }
  
  async runDiagnostics(): Promise<{
    service: string;
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
  }[]> {
    const diagnostics: Array<{
      service: string;
      status: 'healthy' | 'degraded' | 'critical';
      issues: string[];
    }> = [];
    
    // Check each circuit breaker
    for (const [name, breaker] of this.circuitBreakers) {
      const state = breaker.getState();
      const issues: string[] = [];
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      
      if (state === 'open') {
        status = 'critical';
        issues.push('Circuit breaker is open');
      } else if (state === 'half-open') {
        status = 'degraded';
        issues.push('Circuit breaker is half-open (testing recovery)');
      }
      
      // Check failure history
      const recentFailures = this.failureHistory.filter(
        f => f.name === name && f.timestamp > Date.now() - 60 * 60 * 1000
      ).length;
      
      if (recentFailures > 10) {
        status = status === 'healthy' ? 'degraded' : status;
        issues.push(`High failure rate: ${recentFailures} failures in last hour`);
      }
      
      diagnostics.push({ service: name, status, issues });
    }
    
    return diagnostics;
  }
  
  private recordFailure(name: string, error: Error): void {
    this.failureHistory.push({
      name,
      timestamp: Date.now(),
      error: error.message
    });
    
    // Keep only last 1000 failures
    if (this.failureHistory.length > 1000) {
      this.failureHistory = this.failureHistory.slice(-1000);
    }
  }
  
  private startAutoRecovery(): void {
    // Check for recovery opportunities every 5 minutes
    this.recoveryCheckInterval = setInterval(async () => {
      const report = this.getHealthReport();
      
      // Check each circuit breaker
      for (const cb of report.circuitBreakers) {
        if (cb.state === 'open') {
          // Check if we have an auto-recovery strategy
          const strategy = this.autoRecoveryStrategies.get(cb.name);
          if (strategy) {
            try {
              elizaLogger.info(`Attempting auto-recovery for ${cb.name}`);
              await strategy();
              
              // If successful, reset the circuit breaker
              this.resetCircuitBreaker(cb.name);
              this.emit('auto-recovery-success', { service: cb.name });
            } catch (error) {
              elizaLogger.error(`Auto-recovery failed for ${cb.name}:`, error);
              this.emit('auto-recovery-failure', { service: cb.name, error });
            }
          }
        }
      }
      
      // Clean old failure history
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      this.failureHistory = this.failureHistory.filter(f => f.timestamp > oneWeekAgo);
      
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  private getOrCreateCircuitBreaker(name: string): CircuitBreaker {
    let breaker = this.circuitBreakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker(name);
      this.circuitBreakers.set(name, breaker);
    }
    return breaker;
  }
  
  destroy(): void {
    if (this.recoveryCheckInterval) {
      clearInterval(this.recoveryCheckInterval);
      this.recoveryCheckInterval = null;
    }
    
    // Reset all circuit breakers
    this.circuitBreakers.forEach(breaker => breaker.reset());
    this.circuitBreakers.clear();
  }
} 