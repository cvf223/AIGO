export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";
export declare class CircuitBreaker {
    private readonly config;
    private state;
    private failureCount;
    private lastFailureTime?;
    private halfOpenSuccesses;
    private readonly failureThreshold;
    private readonly resetTimeout;
    private readonly halfOpenMaxAttempts;
    constructor(config?: {
        failureThreshold?: number;
        resetTimeout?: number;
        halfOpenMaxAttempts?: number;
    });
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private handleFailure;
    private reset;
    getState(): "CLOSED" | "OPEN" | "HALF_OPEN";
}
//# sourceMappingURL=CircuitBreaker.d.ts.map