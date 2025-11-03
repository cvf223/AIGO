#!/usr/bin/env node

/**
 * 📊 SYNDICATE METRICS EXPORTER
 * =============================
 * Custom Prometheus exporter for Construction Syndicate metrics
 */

import express from 'express';
import { register, Gauge, Counter, Histogram, Summary } from 'prom-client';
import { createPool } from '../src/database/UnifiedDatabaseConfig.js';

const app = express();
const PORT = process.env.METRICS_PORT || 9200;

// Initialize database connection
let dbPool;

// Define custom metrics
const metrics = {
    // Agent metrics
    agentHealth: new Gauge({
        name: 'syndicate_agent_health',
        help: 'Health status of syndicate agents (1=healthy, 0=unhealthy)',
        labelNames: ['agent_id', 'agent_name', 'agent_type']
    }),
    
    agentMemory: new Gauge({
        name: 'syndicate_agent_memory_bytes',
        help: 'Memory usage of individual agents',
        labelNames: ['agent_id', 'agent_name']
    }),
    
    agentErrors: new Counter({
        name: 'syndicate_agent_errors_total',
        help: 'Total errors per agent',
        labelNames: ['agent_id', 'agent_name', 'error_type']
    }),
    
    agentTasksCompleted: new Counter({
        name: 'syndicate_agent_tasks_completed_total',
        help: 'Total tasks completed by agents',
        labelNames: ['agent_id', 'agent_name', 'task_type']
    }),
    
    // Learning system metrics
    learningIterationDuration: new Histogram({
        name: 'syndicate_learning_iteration_duration_seconds',
        help: 'Duration of learning system iterations',
        labelNames: ['system', 'agent_id'],
        buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120]
    }),
    
    learningReward: new Gauge({
        name: 'syndicate_learning_reward',
        help: 'Current reward value in learning systems',
        labelNames: ['system', 'agent_id']
    }),
    
    memoryDistillationFailures: new Counter({
        name: 'syndicate_memory_distillation_failures_total',
        help: 'Total memory distillation failures',
        labelNames: ['agent_id', 'reason']
    }),
    
    // LLM metrics
    llmResponseTime: new Histogram({
        name: 'syndicate_llm_response_time_seconds',
        help: 'LLM response time',
        labelNames: ['model', 'operation'],
        buckets: [0.5, 1, 2, 5, 10, 20, 30, 60]
    }),
    
    llmTokensProcessed: new Counter({
        name: 'syndicate_llm_tokens_processed_total',
        help: 'Total tokens processed by LLM',
        labelNames: ['model', 'operation']
    }),
    
    // Quantization metrics
    quantizationMemorySaved: new Gauge({
        name: 'syndicate_quantization_memory_saved_bytes',
        help: 'Memory saved through quantization',
        labelNames: ['model']
    }),
    
    quantizationInferenceSpeedup: new Gauge({
        name: 'syndicate_quantization_inference_speedup',
        help: 'Inference speedup factor from quantization',
        labelNames: ['model']
    }),
    
    // Construction analysis metrics
    plansAnalyzed: new Counter({
        name: 'syndicate_plans_analyzed_total',
        help: 'Total construction plans analyzed',
        labelNames: ['project_type', 'analysis_type']
    }),
    
    analysisAccuracy: new Gauge({
        name: 'syndicate_analysis_accuracy',
        help: 'Accuracy of construction analysis',
        labelNames: ['analysis_type']
    }),
    
    // Three Pillars metrics
    knowledgeCredibilityScore: new Gauge({
        name: 'syndicate_knowledge_credibility_score',
        help: 'Knowledge credibility score from Three Pillars',
        labelNames: ['source']
    }),
    
    inferenceReliabilityScore: new Gauge({
        name: 'syndicate_inference_reliability_score',
        help: 'Inference reliability score from Three Pillars',
        labelNames: ['model']
    }),
    
    veracityJudgeDecisions: new Counter({
        name: 'syndicate_veracity_judge_decisions_total',
        help: 'Veracity judge decisions',
        labelNames: ['decision', 'reason']
    }),
    
    // System resource metrics
    numaMemoryAllocation: new Gauge({
        name: 'syndicate_numa_memory_allocation_bytes',
        help: 'NUMA node memory allocation',
        labelNames: ['node', 'process']
    }),
    
    cpuAffinity: new Gauge({
        name: 'syndicate_cpu_affinity',
        help: 'CPU affinity assignments',
        labelNames: ['process', 'cpu_list']
    })
};

/**
 * Collect metrics from database
 */
async function collectDatabaseMetrics() {
    try {
        // Agent health
        const agentHealthQuery = `
            SELECT agent_id, agent_name, agent_type, health_status, memory_usage
            FROM agent_status
            WHERE last_update > NOW() - INTERVAL '5 minutes'
        `;
        const agentHealthResult = await dbPool.query(agentHealthQuery);
        
        agentHealthResult.rows.forEach(row => {
            metrics.agentHealth.set(
                { agent_id: row.agent_id, agent_name: row.agent_name, agent_type: row.agent_type },
                row.health_status === 'healthy' ? 1 : 0
            );
            
            if (row.memory_usage) {
                metrics.agentMemory.set(
                    { agent_id: row.agent_id, agent_name: row.agent_name },
                    row.memory_usage
                );
            }
        });
        
        // Learning metrics
        const learningQuery = `
            SELECT system_name, agent_id, iteration_duration, current_reward
            FROM learning_metrics
            WHERE timestamp > NOW() - INTERVAL '5 minutes'
        `;
        const learningResult = await dbPool.query(learningQuery);
        
        learningResult.rows.forEach(row => {
            if (row.iteration_duration) {
                metrics.learningIterationDuration.observe(
                    { system: row.system_name, agent_id: row.agent_id },
                    row.iteration_duration
                );
            }
            
            if (row.current_reward !== null) {
                metrics.learningReward.set(
                    { system: row.system_name, agent_id: row.agent_id },
                    row.current_reward
                );
            }
        });
        
        // Analysis metrics
        const analysisQuery = `
            SELECT COUNT(*) as count, project_type, analysis_type
            FROM construction_analysis
            WHERE created_at > NOW() - INTERVAL '1 hour'
            GROUP BY project_type, analysis_type
        `;
        const analysisResult = await dbPool.query(analysisQuery);
        
        analysisResult.rows.forEach(row => {
            metrics.plansAnalyzed.inc(
                { project_type: row.project_type, analysis_type: row.analysis_type },
                parseInt(row.count)
            );
        });
        
    } catch (error) {
        console.error('Error collecting database metrics:', error);
    }
}

/**
 * Collect metrics from running services
 */
async function collectServiceMetrics() {
    try {
        // Simulate collecting metrics from running services
        // In production, this would query actual services via their APIs
        
        // Example: LLM response times
        metrics.llmResponseTime.observe({ model: 'llama3.1:70b', operation: 'generate' }, Math.random() * 10 + 2);
        metrics.llmResponseTime.observe({ model: 'llama3.1:70b', operation: 'embed' }, Math.random() * 2 + 0.5);
        
        // Example: Quantization savings
        metrics.quantizationMemorySaved.set({ model: 'llama3.1:70b' }, 150 * 1024 * 1024 * 1024); // 150GB
        metrics.quantizationInferenceSpeedup.set({ model: 'llama3.1:70b' }, 3.5);
        
        // Example: Three Pillars scores
        metrics.knowledgeCredibilityScore.set({ source: 'construction_docs' }, 0.95);
        metrics.inferenceReliabilityScore.set({ model: 'construction_transformer' }, 0.92);
        
        // Example: NUMA memory allocation
        for (let i = 0; i < 4; i++) {
            metrics.numaMemoryAllocation.set(
                { node: i.toString(), process: 'llm_inference' },
                224 * 1024 * 1024 * 1024 // 224GB per node
            );
        }
        
    } catch (error) {
        console.error('Error collecting service metrics:', error);
    }
}

/**
 * Initialize metrics collection
 */
async function initializeMetrics() {
    // Initialize database connection
    const dbConfig = await createPool();
    dbPool = dbConfig.pool;
    
    // Collect metrics every 30 seconds
    setInterval(async () => {
        await collectDatabaseMetrics();
        await collectServiceMetrics();
    }, 30000);
    
    // Initial collection
    await collectDatabaseMetrics();
    await collectServiceMetrics();
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    } catch (error) {
        res.status(500).end(error);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
    console.log(`📊 Syndicate Metrics Exporter listening on port ${PORT}`);
    await initializeMetrics();
});
