/**
 * 🚨 ERROR DETECTION & ESCALATION SERVICE EXTENSION
 * ================================================
 * 
 * Extends the ErrorDetectionEscalationService with additional error handling capabilities.
 */

import { ErrorDetectionEscalationService } from './ErrorDetectionEscalationService.js';

// Add the handleUnhandledRejection method to the class prototype
ErrorDetectionEscalationService.prototype.handleUnhandledRejection = async function(reason, promise) {
    console.log('⚠️ Error Detection Service handling unhandled rejection...');
    
    try {
        // Extract error details
        const errorMessage = reason instanceof Error ? reason.message : String(reason);
        const errorStack = reason instanceof Error ? reason.stack : 'No stack available';
        const errorSource = this._identifyErrorSource(errorStack);
        
        // Create error record
        const errorRecord = {
            type: 'unhandled_rejection',
            message: errorMessage,
            source: errorSource,
            severity: this._assessErrorSeverity(errorMessage, errorSource),
            timestamp: Date.now(),
            stack: errorStack,
            handledBy: 'error_detection_service'
        };
        
        // Store error in memory
        this.unhandledRejections = this.unhandledRejections || [];
        this.unhandledRejections.push(errorRecord);
        
        // Emit an event for listeners (like monitoring systems)
        this.emit('unhandled_rejection_handled', errorRecord);
        
        // For high-severity errors, trigger alerting
        if (errorRecord.severity === 'HIGH' || errorRecord.severity === 'CRITICAL') {
            this.emit('critical_error', errorRecord);
            
            // Create escalation ticket if the method exists
            if (typeof this.createEscalationTicket === 'function') {
                await this.createEscalationTicket({
                    ...errorRecord,
                    priority: 'HIGH',
                    requiresHumanReview: true
                });
            }
        }
        
        // Store error data for analysis
        if (this.memoryPersistence) {
            await this.memoryPersistence.storeMemory(
                `error_${Date.now()}`,
                errorRecord,
                { type: 'error_record', priority: errorRecord.severity }
            ).catch(err => console.warn('Error storing rejection:', err.message));
        }
        
        return errorRecord;
    } catch (error) {
        // Meta-error handling to prevent cascading failures
        console.error('❌ Error while handling unhandled rejection:', error);
        return { 
            type: 'meta_error', 
            message: 'Error while handling unhandled rejection',
            originalError: String(reason),
            metaError: error.message
        };
    }
};

// Add helper methods to the prototype
ErrorDetectionEscalationService.prototype._identifyErrorSource = function(stack) {
    if (!stack) return 'unknown';
    
    // Extract source file from stack trace
    const stackLines = stack.split('\n');
    
    // Look for first file path in the stack trace
    for (const line of stackLines) {
        const fileMatch = line.match(/\/(src\/[^:]+)\:/);
        if (fileMatch && fileMatch[1]) {
            return fileMatch[1];
        }
    }
    
    return 'unknown';
};

ErrorDetectionEscalationService.prototype._assessErrorSeverity = function(message, source) {
    // Database errors are high severity
    if (message.includes('database') || message.includes('DB') || message.includes('connection')) {
        return 'HIGH';
    }
    
    // Memory or quantum system errors are high severity
    if (message.includes('memory') || message.includes('quantum') || source.includes('quantum')) {
        return 'HIGH';
    }
    
    // Critical system components are highest severity
    if (source.includes('orchestrator') || source.includes('core')) {
        return 'CRITICAL';
    }
    
    // Default to medium severity for unhandled rejections
    return 'MEDIUM';
};

// Track error method (simple implementation if not available in the main class)
if (!ErrorDetectionEscalationService.prototype.trackError) {
    ErrorDetectionEscalationService.prototype.trackError = async function(error) {
        this.errors = this.errors || [];
        this.errors.push({
            ...error,
            tracked: true,
            trackTimestamp: Date.now()
        });
        
        console.log(`📝 Error tracked: ${error.message}`);
        return true;
    };
}

// Create recovery ticket method (simple implementation if not available in main class)
if (!ErrorDetectionEscalationService.prototype.createRecoveryTicket) {
    ErrorDetectionEscalationService.prototype.createRecoveryTicket = async function(error) {
        console.log(`🎫 Recovery ticket created for: ${error.message}`);
        this.recoveryTickets = this.recoveryTickets || [];
        
        const ticket = {
            id: `ticket-${Date.now()}`,
            error: error,
            status: 'open',
            created: Date.now(),
            assignedTo: null
        };
        
        this.recoveryTickets.push(ticket);
        this.emit('recovery_ticket_created', ticket);
        
        return ticket;
    };
}

// Export a patch function to apply these extensions
export function applyErrorHandlingExtensions() {
    console.log('🛡️ Applied error handling extensions to ErrorDetectionEscalationService');
    return true;
}
