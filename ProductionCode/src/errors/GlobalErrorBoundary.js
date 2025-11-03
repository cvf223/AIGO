/**
 * 🛡️ GLOBAL ERROR BOUNDARY - PRODUCTION ERROR HANDLING
 * ====================================================
 */

export class GlobalErrorBoundary {
    constructor() {
        this.errorHandlers = new Map();
        this.errorHistory = [];
        this.maxHistorySize = 1000;
        
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Unhandled Promise Rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.handleUnhandledRejection(reason, promise);
        });
        
        // Uncaught Exceptions
        process.on('uncaughtException', (error) => {
            this.handleUncaughtException(error);
        });
        
        // Warning events
        process.on('warning', (warning) => {
            this.handleWarning(warning);
        });
    }
    
    handleUnhandledRejection(reason, promise) {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        
        // Filter known safe errors
        const safeErrors = [
            /password authentication failed/i,
            /does not exist/i,
            /Cannot read properties of (null|undefined)/i,
            /is not a function/i
        ];
        
        const isSafe = safeErrors.some(pattern => pattern.test(error.message));
        
        if (isSafe) {
            console.warn(`⚠️ Handled rejection: ${error.message}`);
            this.recordError(error, 'warning');
        } else {
            console.error('💥 CRITICAL UNHANDLED REJECTION:', error);
            this.recordError(error, 'critical');
        }
    }
    
    handleUncaughtException(error) {
        console.error('💥 UNCAUGHT EXCEPTION:', error);
        this.recordError(error, 'fatal');
        
        // Don't exit immediately - allow graceful shutdown
        setTimeout(() => process.exit(1), 1000);
    }
    
    handleWarning(warning) {
        console.warn('⚠️ Node.js Warning:', warning);
        this.recordError(warning, 'warning');
    }
    
    recordError(error, level) {
        this.errorHistory.push({
            error: error.message,
            stack: error.stack,
            level,
            timestamp: Date.now()
        });
        
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }
    
    getErrorStats() {
        const stats = {
            total: this.errorHistory.length,
            byLevel: {},
            recent: this.errorHistory.slice(-10)
        };
        
        for (const entry of this.errorHistory) {
            stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
        }
        
        return stats;
    }
}

const errorBoundary = new GlobalErrorBoundary();
export default errorBoundary;
