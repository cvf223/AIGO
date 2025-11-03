
// 🛡️ ELITE TYPE SAFETY GUARDS
function ensurePoolConfig(config) {
    if (!config) return {};
    if (typeof config === 'string') {
        try { return JSON.parse(config); } catch { return {}; }
    }
    if (typeof config.connect === 'function') return config; // Already a Pool
    return typeof config === 'object' ? config : {};
}

function ensureStringArg(arg, fallback = '') {
    return typeof arg === 'string' ? arg : (arg ? String(arg) : fallback);
}

function ensureObjectArg(arg, fallback = {}) {
    return (arg && typeof arg === 'object' && !Array.isArray(arg)) ? arg : fallback;
}

// TYPE_SAFETY_APPLIED
/**
 * 🗄️ CONTRACT ADVANCEMENT DATABASE LAYER
 * =====================================
 * 
 * Production PostgreSQL database operations for smart contract advancement
 * analysis, benchmark tracking, and evolution pattern storage
 * 
 * This module provides:
 * - Database connection management
 * - CRUD operations for all contract advancement tables
 * - Benchmark tracking and analysis
 * - Evolution pattern storage and retrieval
 * - Competitive intelligence data management
 * - Audit logging and performance monitoring
 */

import pg from 'pg';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

const { Pool } = pg;

// Database events
class DatabaseEvents extends EventEmitter {}
export const dbEvents = new DatabaseEvents();

// Database configuration from environment
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'construction_syndicate',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
let pool = null;

/**
 * 🚀 Initialize Database Connection
 */
export async function initializeDatabase() {
  try {
    console.log('🗄️ [DATABASE] Initializing PostgreSQL connection...');
    console.log(`   Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}`);
    
    pool = new Pool(typeof DB_CONFIG === 'object' && DB_CONFIG.connect ? DB_CONFIG : (typeof DB_CONFIG === 'string' ? JSON.parse(DB_CONFIG) : DB_CONFIG));
    
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    console.log('✅ [DATABASE] PostgreSQL connection established successfully');
    console.log(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' ')[1]}`);
    console.log(`   Current Time: ${result.rows[0].current_time}`);
    
    // Emit connection success event
    dbEvents.emit('databaseConnected', {
      timestamp: Date.now(),
      config: { ...DB_CONFIG, password: '[HIDDEN]' },
      version: result.rows[0].pg_version
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ [DATABASE] Failed to initialize database connection:', error.message);
    
    dbEvents.emit('databaseConnectionError', {
      error: error.message,
      timestamp: Date.now(),
      config: { ...DB_CONFIG, password: '[HIDDEN]' }
    });
    
    throw error;
  }
}

/**
 * 📋 Execute Database Query
 */
export async function executeQuery(query, params = []) {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  
  const client = await pool.connect();
  
  try {
    const startTime = Date.now();
    const result = await client.query(query, params);
    const executionTime = Date.now() - startTime;
    
    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`⚠️ [DATABASE] Slow query detected: ${executionTime}ms`);
      console.warn(`   Query: ${query.substring(0, 100)}...`);
    }
    
    // Emit query execution event
    dbEvents.emit('queryExecuted', {
      query: query.substring(0, 200),
      params: params.length,
      executionTime,
      rowCount: result.rowCount,
      timestamp: Date.now()
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ [DATABASE] Query execution failed:', error.message);
    console.error(`   Query: ${query.substring(0, 200)}...`);
    console.error(`   Params: ${JSON.stringify(params)}`);
    
    dbEvents.emit('queryError', {
      error: error.message,
      query: query.substring(0, 200),
      params: params.length,
      timestamp: Date.now()
    });
    
    throw error;
    
  } finally {
    client.release();
  }
}

/**
 * 🏆 Contract Performance Operations
 */
export class ContractPerformanceDB {
  
  /**
   * Store contract performance categorization
   */
  static async storePerformanceCategory(performanceData) {
    const query = `
      INSERT INTO contract_performance_categories (
        contract_address, network, performance_category, transaction_count,
        total_volume, success_rate, avg_profit, total_profit,
        gas_efficiency, execution_speed, mev_resistance, profit_efficiency,
        adaptability, percentile_rank, block_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `;
    
    const params = [
      performanceData.contractAddress,
      performanceData.network,
      performanceData.performanceCategory,
      performanceData.transactionCount,
      performanceData.totalVolume,
      performanceData.successRate,
      performanceData.avgProfit,
      performanceData.totalProfit,
      performanceData.gasEfficiency,
      performanceData.executionSpeed,
      performanceData.mevResistance,
      performanceData.profitEfficiency,
      performanceData.adaptability,
      performanceData.percentileRank,
      performanceData.blockNumber
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get top performers by category
   */
  static async getTopPerformers(category = 'elite', limit = 100) {
    const query = `
      SELECT * FROM contract_performance_categories
      WHERE performance_category = $1
      ORDER BY percentile_rank DESC, total_profit DESC
      LIMIT $2
    `;
    
    const result = await executeQuery(query, [category, limit]);
    return result.rows;
  }
  
  /**
   * Get performance evolution for a contract
   */
  static async getContractEvolution(contractAddress, network, timeframe = '30d') {
    const query = `
      SELECT * FROM contract_performance_categories
      WHERE contract_address = $1 AND network = $2
      AND analysis_timestamp >= NOW() - INTERVAL $3
      ORDER BY analysis_timestamp ASC
    `;
    
    const result = await executeQuery(query, [contractAddress, network, timeframe]);
    return result.rows;
  }
}

/**
 * 📊 Benchmark Operations
 */
export class BenchmarkDB {
  
  /**
   * Store agent benchmark history
   */
  static async storeBenchmarkHistory(benchmarkData) {
    const query = `
      INSERT INTO agent_benchmark_history (
        agent_id, timestamp, contract_benchmarks, performance_metrics,
        benchmark_position, top_performer_gap, improvement_areas, trend_data,
        timeframe, networks, data_quality, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    
    const params = [
      benchmarkData.agentId,
      benchmarkData.timestamp,
      JSON.stringify(benchmarkData.contractBenchmarks),
      JSON.stringify(benchmarkData.performanceMetrics),
      JSON.stringify(benchmarkData.benchmarkPosition),
      benchmarkData.topPerformerGap,
      JSON.stringify(benchmarkData.improvementAreas),
      JSON.stringify(benchmarkData.trendData),
      benchmarkData.timeframe,
      JSON.stringify(benchmarkData.networks),
      benchmarkData.dataQuality,
      benchmarkData.confidenceScore
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get agent benchmark history
   */
  static async getBenchmarkHistory(agentId, timeframe = '30d') {
    const query = `
      SELECT * FROM agent_benchmark_history
      WHERE agent_id = $1
      AND analysis_date >= NOW() - INTERVAL $2
      ORDER BY analysis_date DESC
    `;
    
    const result = await executeQuery(query, [agentId, timeframe]);
    return result.rows;
  }
  
  /**
   * Get benchmark trends
   */
  static async getBenchmarkTrends(agentId, days = 30) {
    const query = `
      SELECT 
        DATE_TRUNC('day', analysis_date) as day,
        AVG(top_performer_gap) as avg_gap,
        AVG((benchmark_position->>'overall')::DECIMAL) as avg_overall_score,
        COUNT(*) as data_points
      FROM agent_benchmark_history
      WHERE agent_id = $1
      AND analysis_date >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', analysis_date)
      ORDER BY day
    `;
    
    const result = await executeQuery(query, [agentId]);
    return result.rows;
  }
  
  /**
   * Get elite benchmark targets
   */
  static async getEliteBenchmarks() {
    const query = `
      SELECT * FROM elite_benchmark_targets
      ORDER BY target_score DESC
    `;
    
    const result = await executeQuery(query);
    return result.rows;
  }
}

/**
 * 🧬 Evolution Tracking Operations
 */
export class EvolutionDB {
  
  /**
   * Store contract evolution data
   */
  static async storeEvolutionHistory(evolutionData) {
    const query = `
      INSERT INTO contract_evolution_history (
        contract_address, network, timestamp, performance_category,
        evolution_pattern, adaptation_speed, benchmark_scores,
        code_patterns, optimization_techniques, mev_protection_methods,
        evolution_drivers, market_conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    
    const params = [
      evolutionData.contractAddress,
      evolutionData.network,
      evolutionData.timestamp,
      evolutionData.performanceCategory,
      JSON.stringify(evolutionData.evolutionPattern),
      evolutionData.adaptationSpeed,
      JSON.stringify(evolutionData.benchmarkScores),
      JSON.stringify(evolutionData.codePatterns),
      JSON.stringify(evolutionData.optimizationTechniques),
      JSON.stringify(evolutionData.mevProtectionMethods),
      JSON.stringify(evolutionData.evolutionDrivers),
      JSON.stringify(evolutionData.marketConditions)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Store technique evolution tracking
   */
  static async storeTechniqueEvolution(techniqueData) {
    const query = `
      INSERT INTO technique_evolution_tracking (
        technique_name, technique_category, evolution_status,
        adoption_rate, effectiveness_score, confidence_level,
        first_detected, trend_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (technique_name) 
      DO UPDATE SET 
        evolution_status = EXCLUDED.evolution_status,
        adoption_rate = EXCLUDED.adoption_rate,
        effectiveness_score = EXCLUDED.effectiveness_score,
        confidence_level = EXCLUDED.confidence_level,
        last_updated = NOW(),
        trend_data = EXCLUDED.trend_data
      RETURNING id
    `;
    
    const params = [
      techniqueData.techniqueName,
      techniqueData.techniqueCategory,
      techniqueData.evolutionStatus,
      techniqueData.adoptionRate,
      techniqueData.effectivenessScore,
      techniqueData.confidenceLevel,
      techniqueData.firstDetected,
      JSON.stringify(techniqueData.trendData)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get emerging techniques
   */
  static async getEmergingTechniques() {
    const query = `
      SELECT * FROM technique_evolution_tracking
      WHERE evolution_status = 'emerging'
      ORDER BY adoption_rate DESC, effectiveness_score DESC
    `;
    
    const result = await executeQuery(query);
    return result.rows;
  }
  
  /**
   * Get depreciating techniques
   */
  static async getDepreciatingTechniques() {
    const query = `
      SELECT * FROM technique_evolution_tracking
      WHERE evolution_status IN ('depreciating', 'obsolete')
      ORDER BY adoption_rate ASC, effectiveness_score ASC
    `;
    
    const result = await executeQuery(query);
    return result.rows;
  }
}

/**
 * 🔮 Landscape Prediction Operations
 */
export class PredictionDB {
  
  /**
   * Store landscape prediction
   */
  static async storePrediction(predictionData) {
    const query = `
      INSERT INTO landscape_predictions (
        prediction_type, prediction_category, prediction_description,
        confidence_score, time_to_impact, impact_magnitude,
        supporting_evidence, expected_validation_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const params = [
      predictionData.predictionType,
      predictionData.predictionCategory,
      predictionData.predictionDescription,
      predictionData.confidenceScore,
      predictionData.timeToImpact,
      predictionData.impactMagnitude,
      JSON.stringify(predictionData.supportingEvidence),
      predictionData.expectedValidationDate
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get active predictions
   */
  static async getActivePredictions(predictionType = null) {
    let query = `
      SELECT * FROM landscape_predictions
      WHERE validation_status = 'pending'
    `;
    
    const params = [];
    if (predictionType) {
      query += ` AND prediction_type = $1`;
      params.push(predictionType);
    }
    
    query += ` ORDER BY confidence_score DESC, expected_validation_date ASC`;
    
    const result = await executeQuery(query, params);
    return result.rows;
  }
  
  /**
   * Update prediction validation
   */
  static async updatePredictionValidation(predictionId, validationData) {
    const query = `
      UPDATE landscape_predictions
      SET 
        actual_validation_date = NOW(),
        prediction_accuracy = $2,
        validation_status = $3,
        feedback = $4
      WHERE id = $1
      RETURNING id
    `;
    
    const params = [
      predictionId,
      validationData.accuracy,
      validationData.status,
      JSON.stringify(validationData.feedback)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0];
  }
}

/**
 * 🏆 Competitive Intelligence Operations
 */
export class CompetitiveDB {
  
  /**
   * Store top performer pattern
   */
  static async storeTopPerformerPattern(patternData) {
    const query = `
      INSERT INTO top_performer_patterns (
        pattern_name, pattern_category, pattern_description,
        effectiveness_score, adoption_rate, complexity_level,
        implementation_cost, time_to_implement, risk_level,
        success_rate, pattern_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (pattern_name) 
      DO UPDATE SET 
        effectiveness_score = EXCLUDED.effectiveness_score,
        adoption_rate = EXCLUDED.adoption_rate,
        success_rate = EXCLUDED.success_rate,
        last_updated = NOW(),
        pattern_data = EXCLUDED.pattern_data
      RETURNING id
    `;
    
    const params = [
      patternData.patternName,
      patternData.patternCategory,
      patternData.patternDescription,
      patternData.effectivenessScore,
      patternData.adoptionRate,
      patternData.complexityLevel,
      patternData.implementationCost,
      patternData.timeToImplement,
      patternData.riskLevel,
      patternData.successRate,
      JSON.stringify(patternData.patternData)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Store competitive gap analysis
   */
  static async storeGapAnalysis(gapData) {
    const query = `
      INSERT INTO competitive_gap_analysis (
        agent_id, current_performance_level, current_percentile,
        gap_to_elite, gap_breakdown, improvement_potential,
        improvement_areas, timeline_to_elite, required_investments,
        competitor_analysis, market_positioning
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;
    
    const params = [
      gapData.agentId,
      gapData.currentPerformanceLevel,
      gapData.currentPercentile,
      gapData.gapToElite,
      JSON.stringify(gapData.gapBreakdown),
      gapData.improvementPotential,
      JSON.stringify(gapData.improvementAreas),
      gapData.timelineToElite,
      JSON.stringify(gapData.requiredInvestments),
      JSON.stringify(gapData.competitorAnalysis),
      JSON.stringify(gapData.marketPositioning)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get competitive gap analysis for agent
   */
  static async getGapAnalysis(agentId, limit = 10) {
    const query = `
      SELECT * FROM competitive_gap_analysis
      WHERE agent_id = $1
      ORDER BY analysis_date DESC
      LIMIT $2
    `;
    
    const result = await executeQuery(query, [agentId, limit]);
    return result.rows;
  }
}

/**
 * 🎯 Recommendation Operations
 */
export class RecommendationDB {
  
  /**
   * Store contract advancement recommendation
   */
  static async storeRecommendation(recommendationData) {
    const query = `
      INSERT INTO contract_advancement_recommendations (
        agent_id, recommendation_type, priority, area, recommendation,
        expected_impact, timeframe, difficulty, implementation_cost,
        risk_level, success_probability, supporting_evidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    
    const params = [
      recommendationData.agentId,
      recommendationData.recommendationType,
      recommendationData.priority,
      recommendationData.area,
      recommendationData.recommendation,
      recommendationData.expectedImpact,
      recommendationData.timeframe,
      recommendationData.difficulty,
      recommendationData.implementationCost,
      recommendationData.riskLevel,
      recommendationData.successProbability,
      JSON.stringify(recommendationData.supportingEvidence)
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get recommendations for agent
   */
  static async getRecommendations(agentId, recommendationType = null) {
    let query = `
      SELECT * FROM contract_advancement_recommendations
      WHERE agent_id = $1
    `;
    
    const params = [agentId];
    if (recommendationType) {
      query += ` AND recommendation_type = $2`;
      params.push(recommendationType);
    }
    
    query += ` ORDER BY priority DESC, success_probability DESC`;
    
    const result = await executeQuery(query, params);
    return result.rows;
  }
  
  /**
   * Update recommendation implementation status
   */
  static async updateRecommendationStatus(recommendationId, status, feedback = null) {
    const query = `
      UPDATE contract_advancement_recommendations
      SET 
        implementation_status = $2,
        feedback = $3
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await executeQuery(query, [recommendationId, status, JSON.stringify(feedback)]);
    return result.rows[0];
  }
}

/**
 * 📊 Audit and Monitoring Operations
 */
export class AuditDB {
  
  /**
   * Store audit log entry
   */
  static async logEvent(eventData) {
    const query = `
      INSERT INTO contract_advancement_audit_log (
        event_type, event_description, agent_id, contract_address,
        network, event_data, block_number, transaction_hash, severity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const params = [
      eventData.eventType,
      eventData.eventDescription,
      eventData.agentId || null,
      eventData.contractAddress || null,
      eventData.network || null,
      JSON.stringify(eventData.eventData),
      eventData.blockNumber || null,
      eventData.transactionHash || null,
      eventData.severity
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Store performance metric
   */
  static async storePerformanceMetric(metricData) {
    const query = `
      INSERT INTO contract_advancement_performance_metrics (
        metric_name, metric_value, metric_unit, agent_id,
        network, timeframe, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const params = [
      metricData.metricName,
      metricData.metricValue,
      metricData.metricUnit || null,
      metricData.agentId || null,
      metricData.network || null,
      metricData.timeframe || null,
      JSON.stringify(metricData.metadata || {})
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0].id;
  }
  
  /**
   * Get audit logs
   */
  static async getAuditLogs(filters = {}) {
    let query = `
      SELECT * FROM contract_advancement_audit_log
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (filters.eventType) {
      query += ` AND event_type = $${paramIndex++}`;
      params.push(filters.eventType);
    }
    
    if (filters.severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(filters.severity);
    }
    
    if (filters.agentId) {
      query += ` AND agent_id = $${paramIndex++}`;
      params.push(filters.agentId);
    }
    
    if (filters.startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    
    query += ` ORDER BY timestamp DESC LIMIT ${filters.limit || 100}`;
    
    const result = await executeQuery(query, params);
    return result.rows;
  }
}

/**
 * 🔧 Database Maintenance Operations
 */
export class MaintenanceDB {
  
  /**
   * Clean up old data
   */
  static async cleanupOldData(daysToKeep = 90) {
    const queries = [
      `DELETE FROM contract_performance_categories WHERE analysis_timestamp < NOW() - INTERVAL '${daysToKeep} days'`,
      `DELETE FROM agent_benchmark_history WHERE analysis_date < NOW() - INTERVAL '${daysToKeep} days'`,
      `DELETE FROM contract_evolution_history WHERE analysis_date < NOW() - INTERVAL '${daysToKeep} days'`,
      `DELETE FROM contract_advancement_audit_log WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'`,
      `DELETE FROM contract_advancement_performance_metrics WHERE measurement_date < NOW() - INTERVAL '${daysToKeep} days'`
    ];
    
    for (const query of queries) {
      await executeQuery(query);
    }
    
    console.log(`🗑️ [DATABASE] Cleaned up data older than ${daysToKeep} days`);
  }
  
  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    const queries = [
      'SELECT COUNT(*) as contract_performance_count FROM contract_performance_categories',
      'SELECT COUNT(*) as benchmark_history_count FROM agent_benchmark_history',
      'SELECT COUNT(*) as evolution_history_count FROM contract_evolution_history',
      'SELECT COUNT(*) as audit_log_count FROM contract_advancement_audit_log',
      'SELECT COUNT(*) as performance_metrics_count FROM contract_advancement_performance_metrics'
    ];
    
    const stats = {};
    
    for (const query of queries) {
      const result = await executeQuery(query);
      const tableName = query.match(/FROM (\w+)/)[1];
      stats[tableName] = parseInt(result.rows[0][Object.keys(result.rows[0])[0]]);
    }
    
    return stats;
  }
  
  /**
   * Create database indexes (if they don't exist)
   */
  static async createIndexes() {
    // This would be handled by the schema file, but we can add additional indexes here
    console.log('📊 [DATABASE] Database indexes are managed by schema file');
  }
}

/**
 * 🚪 Close Database Connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('🔌 [DATABASE] Database connection closed');
    
    dbEvents.emit('databaseClosed', {
      timestamp: Date.now()
    });
  }
} 