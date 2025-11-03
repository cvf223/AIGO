/**
 * 🔥 FIX: Patch for OvertrainingPreventionEngine
 * Adds the missing getCurrentTrainingMetrics method
 */

import { OvertrainingPreventionEngine as OriginalEngine } from './OvertrainingPreventionEngine.js';

// Add the missing method to the prototype
OriginalEngine.prototype.getCurrentTrainingMetrics = async function(agentId) {
    try {
        // Get metrics from database if available
        if (this.db) {
            const result = await this.db.query(`
                SELECT 
                    COUNT(*) as total_iterations,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as success_rate,
                    AVG(execution_time_ms) as avg_execution_time,
                    SUM(skill_improvement) as total_improvement,
                    MAX(timestamp) as last_training
                FROM agent_performance
                WHERE agent_id = $1
                AND timestamp > NOW() - INTERVAL '1 hour'
            `, [agentId]);
            
            if (result.rows[0]) {
                return {
                    iterations: parseInt(result.rows[0].total_iterations) || 0,
                    successRate: parseFloat(result.rows[0].success_rate) || 0,
                    avgExecutionTime: parseFloat(result.rows[0].avg_execution_time) || 0,
                    totalImprovement: parseFloat(result.rows[0].total_improvement) || 0,
                    lastTraining: result.rows[0].last_training,
                    tokenCount: this.agentTokenCounts?.get?.(agentId) || 0,
                    parameterCount: this.agentParameterCounts?.get?.(agentId) || 0
                };
            }
        }
        
        // Fallback to in-memory metrics
        return {
            iterations: this.agentIterations?.get?.(agentId) || 0,
            successRate: 0.5,
            avgExecutionTime: 100,
            totalImprovement: 0,
            lastTraining: new Date(),
            tokenCount: this.agentTokenCounts?.get?.(agentId) || 0,
            parameterCount: this.agentParameterCounts?.get?.(agentId) || 0
        };
        
    } catch (error) {
        console.warn(`⚠️ Failed to get training metrics for ${agentId}:`, error.message);
        return null;
    }
};

export { OriginalEngine as OvertrainingPreventionEngine };

