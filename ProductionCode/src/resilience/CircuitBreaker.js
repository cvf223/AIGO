/**
 * ⚡ CIRCUIT BREAKER - FAILURE ISOLATION
 * =====================================
 */

export class CircuitBreaker {
    constructor(name, config = {}) {
        this.name = name;
        this.state = 'closed'; // closed, open, half-open
        this.failureCount = 0;
        this.successCount = 0;
        this.failureThreshold = config.failureThreshold || 5;
        this.successThreshold = config.successThreshold || 2;
        this.timeout = config.timeout || 60000;
        this.resetTimer = null;
    }
    
    async execute(fn) {
        if (this.state === 'open') {
            throw new Error(`Circuit breaker ${this.name} is OPEN`);
        }
        
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        
        if (this.state === 'half-open') {
            this.successCount++;
            
            if (this.successCount >= this.successThreshold) {
                this.state = 'closed';
                this.successCount = 0;
                console.log(`✅ Circuit breaker ${this.name}: CLOSED`);
            }
        }
    }
    
    onFailure() {
        this.failureCount++;
        this.successCount = 0;
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'open';
            console.error(`🚨 Circuit breaker ${this.name}: OPEN`);
            
            this.resetTimer = setTimeout(() => {
                this.state = 'half-open';
                console.log(`🔄 Circuit breaker ${this.name}: HALF-OPEN`);
            }, this.timeout);
        }
    }
    
    reset() {
        this.state = 'closed';
        this.failureCount = 0;
        this.successCount = 0;
        if (this.resetTimer) clearTimeout(this.resetTimer);
    }
}
