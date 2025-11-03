#!/usr/bin/env node

/**
 * 💾 POST-TRAINING DATA CAPTURE - ELITE DATA COLLECTION SYSTEM
 * ===========================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION FOR POST-TRAINING DATA CAPTURE
 * 
 * This system provides:
 * - Optimized data capture for post-training
 * - Intelligent sampling and compression
 * - Replay capabilities for past events
 * - Correction and judgment mechanisms
 * - Storage optimization strategies
 * 
 * STORAGE OPTIMIZATION ANALYSIS:
 * ==============================
 * 
 * For 896GB Server with 200GB allocated for monitoring:
 * 
 * Data Categories & Priorities:
 * 1. CRITICAL (100% capture): Decisions, Errors, Interventions
 * 2. HIGH (50% capture): Reasoning chains, Tool executions
 * 3. MEDIUM (25% capture): Thoughts, Quantum states
 * 4. LOW (10% capture): Performance metrics
 * 
 * Estimated Daily Data Generation:
 * - Raw: ~50GB/day (full capture)
 * - Compressed (LZ4): ~15GB/day (70% compression)
 * - With sampling: ~8GB/day
 * - Monthly: ~240GB
 * 
 * Retention Strategy:
 * - Full resolution: 7 days (56GB)
 * - Aggregated: 30 days (80GB)
 * - Summaries: 90 days (20GB)
 * - Key learnings: Permanent (50GB)
 * Total: ~200GB allocated storage
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Production Powerhouse
 */

import { EventEmitter } from 'events';
import { compress, decompress } from 'lz4js';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

/**
 * 💾 POST-TRAINING DATA CAPTURE SYSTEM
 */
export class PostTrainingDataCapture extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Database connection
            dbPool: config.dbPool,
            
            // Capture settings
            enabled: config.enabled !== false,
            samplingRate: config.samplingRate || 1.0,
            compressionEnabled: config.compressionEnabled !== false,
            batchSize: config.batchSize || 1000,
            flushInterval: config.flushInterval || 5000, // 5 seconds
            
            // Storage limits
            maxStorageGB: config.maxStorageGB || 200,
            retentionDays: config.retentionDays || 90,
            
            // Capture priorities (0-1, higher = more important)
            capturePriorities: {
                decisions: 1.0,        // Always capture
                errors: 1.0,          // Always capture
                interventions: 1.0,   // Always capture
                reasoning: 0.5,       // 50% sampling
                toolExecutions: 0.5,  // 50% sampling
                thoughts: 0.25,       // 25% sampling
                quantumStates: 0.25,  // 25% sampling
                performance: 0.1      // 10% sampling
            },
            
            // Replay settings
            enableReplay: config.enableReplay !== false,
            replayBufferSize: config.replayBufferSize || 10000,
            
            // Correction tracking
            enableCorrections: config.enableCorrections !== false,
            
            ...config
        };
        
        // Data buffers
        this.buffers = {
            thoughts: [],
            decisions: [],
            quantumStates: [],
            toolExecutions: [],
            interventions: [],
            performance: [],
            errors: [],
            reasoning: []
        };
        
        // Replay system
        this.replayBuffer = [];
        this.replayIndex = new Map();
        
        // Metrics
        this.captureMetrics = {
            totalCaptured: 0,
            totalBytes: 0,
            compressedBytes: 0,
            compressionRatio: 0,
            capturedByType: {},
            droppedBySampling: 0,
            correctionsMade: 0,
            replaysRequested: 0
        };
        
        // Storage tracking
        this.storageMetrics = {
            currentUsageBytes: 0,
            dailyGrowthRate: 0,
            projectedMonthlyGB: 0,
            daysUntilFull: 0
        };
        
        console.log('💾 Post-Training Data Capture initialized');
    }
    
    /**
     * 🚀 INITIALIZE DATA CAPTURE
     */
    async initialize() {
        console.log('🚀 Initializing Post-Training Data Capture...');
        
        try {
            // Verify database connection
            if (!this.config.dbPool) {
                throw new Error('Database pool required for data capture');
            }
            
            // Calculate current storage usage
            await this.calculateStorageUsage();
            
            // Start flush interval
            this.startFlushInterval();
            
            // Start storage monitoring
            this.startStorageMonitoring();
            
            console.log('✅ Data capture initialized successfully');
            console.log(`💾 Storage allocated: ${this.config.maxStorageGB}GB`);
            console.log(`📊 Current usage: ${(this.storageMetrics.currentUsageBytes / (1024**3)).toFixed(2)}GB`);
            
        } catch (error) {
            console.error('❌ Failed to initialize data capture:', error);
            throw error;
        }
    }
    
    /**
     * 🧠 CAPTURE THOUGHT
     */
    async captureThought(thoughtData) {
        if (!this.shouldCapture('thoughts', this.config.capturePriorities.thoughts)) {
            return;
        }
        
        const captured = {
            id: uuidv4(),
            type: 'thought',
            agentId: thoughtData.agentId,
            data: this.compressIfNeeded(thoughtData),
            timestamp: new Date(),
            priority: this.calculatePriority(thoughtData)
        };
        
        this.buffers.thoughts.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('thoughts', captured);
        
        // Flush if buffer is full
        if (this.buffers.thoughts.length >= this.config.batchSize) {
            await this.flushBuffer('thoughts');
        }
    }
    
    /**
     * 🎯 CAPTURE DECISION
     */
    async captureDecision(decisionData) {
        // Decisions are always captured (priority 1.0)
        const captured = {
            id: uuidv4(),
            type: 'decision',
            agentId: decisionData.agentId,
            data: this.compressIfNeeded(decisionData),
            timestamp: new Date(),
            priority: 1.0,
            correctable: true // Decisions can be corrected later
        };
        
        this.buffers.decisions.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('decisions', captured);
        
        // Analyze decision for learning opportunities
        await this.analyzeForLearning(captured);
        
        if (this.buffers.decisions.length >= this.config.batchSize) {
            await this.flushBuffer('decisions');
        }
    }
    
    /**
     * ⚛️ CAPTURE QUANTUM STATE
     */
    async captureQuantumState(stateData) {
        if (!this.shouldCapture('quantumStates', this.config.capturePriorities.quantumStates)) {
            return;
        }
        
        const captured = {
            id: uuidv4(),
            type: 'quantumState',
            systemId: stateData.systemId,
            data: this.compressIfNeeded(stateData),
            timestamp: new Date(),
            priority: this.calculateQuantumPriority(stateData)
        };
        
        this.buffers.quantumStates.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('quantumStates', captured);
        
        if (this.buffers.quantumStates.length >= this.config.batchSize) {
            await this.flushBuffer('quantumStates');
        }
    }
    
    /**
     * 🛠️ CAPTURE TOOL EXECUTION
     */
    async captureToolExecution(executionData) {
        if (!this.shouldCapture('toolExecutions', this.config.capturePriorities.toolExecutions)) {
            return;
        }
        
        const captured = {
            id: uuidv4(),
            type: 'toolExecution',
            executorId: executionData.executorId,
            toolId: executionData.toolId,
            data: this.compressIfNeeded(executionData),
            timestamp: new Date(),
            priority: executionData.critical ? 1.0 : 0.5,
            correctable: true
        };
        
        this.buffers.toolExecutions.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('toolExecutions', captured);
        
        if (this.buffers.toolExecutions.length >= this.config.batchSize) {
            await this.flushBuffer('toolExecutions');
        }
    }
    
    /**
     * 🚨 CAPTURE INTERVENTION
     */
    async captureIntervention(interventionData) {
        // Interventions are always captured (priority 1.0)
        const captured = {
            id: uuidv4(),
            type: 'intervention',
            data: this.compressIfNeeded(interventionData),
            timestamp: new Date(),
            priority: 1.0,
            learningValue: 'high' // Interventions are high-value learning events
        };
        
        this.buffers.interventions.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('interventions', captured);
        
        // Immediately analyze for learning
        await this.extractLearningFromIntervention(captured);
        
        // Flush immediately for important events
        await this.flushBuffer('interventions');
    }
    
    /**
     * 📊 CAPTURE PERFORMANCE METRICS
     */
    async capturePerformanceMetrics(metricsData) {
        if (!this.shouldCapture('performance', this.config.capturePriorities.performance)) {
            return;
        }
        
        const captured = {
            id: uuidv4(),
            type: 'performance',
            componentId: metricsData.componentId,
            data: this.compressIfNeeded(metricsData),
            timestamp: new Date(),
            priority: 0.1
        };
        
        this.buffers.performance.push(captured);
        this.updateMetrics('performance', captured);
        
        if (this.buffers.performance.length >= this.config.batchSize) {
            await this.flushBuffer('performance');
        }
    }
    
    /**
     * 🔄 CAPTURE REASONING STEP
     */
    async captureReasoningStep(reasoningData) {
        if (!this.shouldCapture('reasoning', this.config.capturePriorities.reasoning)) {
            return;
        }
        
        const captured = {
            id: uuidv4(),
            type: 'reasoning',
            agentId: reasoningData.agentId,
            data: this.compressIfNeeded(reasoningData),
            timestamp: new Date(),
            priority: this.calculateReasoningPriority(reasoningData)
        };
        
        this.buffers.reasoning.push(captured);
        this.addToReplayBuffer(captured);
        this.updateMetrics('reasoning', captured);
        
        if (this.buffers.reasoning.length >= this.config.batchSize) {
            await this.flushBuffer('reasoning');
        }
    }
    
    /**
     * 🎬 REPLAY EVENTS
     */
    async replayEvents(criteria = {}) {
        console.log('🎬 Replaying events with criteria:', criteria);
        this.captureMetrics.replaysRequested++;
        
        try {
            let query = `
                SELECT * FROM (
                    SELECT 'thought' as event_type, * FROM monitoring_thoughts
                    WHERE captured_at >= $1 AND captured_at <= $2
                    ${criteria.agentId ? 'AND agent_id = $3' : ''}
                    UNION ALL
                    SELECT 'decision' as event_type, * FROM monitoring_decisions
                    WHERE captured_at >= $1 AND captured_at <= $2
                    ${criteria.agentId ? 'AND agent_id = $3' : ''}
                    UNION ALL
                    SELECT 'tool' as event_type, * FROM monitoring_tool_executions
                    WHERE captured_at >= $1 AND captured_at <= $2
                    ${criteria.executorId ? 'AND executor_id = $3' : ''}
                ) AS events
                ORDER BY captured_at ASC
                LIMIT $4
            `;
            
            const params = [
                criteria.startTime || new Date(Date.now() - 86400000), // Default: last 24h
                criteria.endTime || new Date(),
                criteria.agentId || criteria.executorId,
                criteria.limit || 1000
            ].filter(p => p !== undefined);
            
            const result = await this.config.dbPool.query(query, params);
            
            // Decompress and structure events
            const events = result.rows.map(row => {
                if (row.data && typeof row.data === 'string') {
                    row.data = this.decompress(row.data);
                }
                return row;
            });
            
            console.log(`✅ Replayed ${events.length} events`);
            
            // Emit replay events for visualization
            this.emit('replay:complete', { events, criteria });
            
            return events;
            
        } catch (error) {
            console.error('❌ Replay failed:', error);
            throw error;
        }
    }
    
    /**
     * ✏️ CORRECT PAST EVENT
     */
    async correctPastEvent(eventId, eventType, correction, reason) {
        console.log(`✏️ Correcting ${eventType} event: ${eventId}`);
        
        try {
            // Get original event
            let tableName;
            switch (eventType) {
                case 'decision': tableName = 'monitoring_decisions'; break;
                case 'thought': tableName = 'monitoring_thoughts'; break;
                case 'tool': tableName = 'monitoring_tool_executions'; break;
                default: throw new Error(`Unknown event type: ${eventType}`);
            }
            
            const originalResult = await this.config.dbPool.query(
                `SELECT * FROM ${tableName} WHERE ${eventType}_id = $1`,
                [eventId]
            );
            
            if (originalResult.rows.length === 0) {
                throw new Error(`Event not found: ${eventId}`);
            }
            
            const original = originalResult.rows[0];
            
            // Store correction
            await this.config.dbPool.query(
                `INSERT INTO monitoring_corrections 
                (original_event_id, event_type, original_data, corrected_data, correction_reason, corrected_by)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    eventId,
                    eventType,
                    JSON.stringify(original),
                    JSON.stringify(correction),
                    reason,
                    'human' // Could be agent ID if AI makes corrections
                ]
            );
            
            this.captureMetrics.correctionsMade++;
            
            // Emit correction event for learning
            this.emit('correction:made', {
                eventId,
                eventType,
                original,
                correction,
                reason
            });
            
            // Trigger re-learning from correction
            await this.learnFromCorrection(original, correction, reason);
            
            console.log(`✅ Correction stored for ${eventType} ${eventId}`);
            
            return {
                success: true,
                correctionId: uuidv4(),
                learningTriggered: true
            };
            
        } catch (error) {
            console.error('❌ Correction failed:', error);
            throw error;
        }
    }
    
    /**
     * 📚 EXTRACT KEY LEARNINGS
     */
    async extractKeyLearnings(timeRange = 86400000) {
        console.log('📚 Extracting key learnings...');
        
        try {
            // Get high-value events
            const learnings = [];
            
            // 1. Analyze interventions (highest learning value)
            const interventions = await this.config.dbPool.query(
                `SELECT * FROM monitoring_interventions 
                WHERE captured_at > NOW() - INTERVAL '${timeRange / 1000} seconds'
                ORDER BY captured_at DESC`
            );
            
            for (const intervention of interventions.rows) {
                learnings.push({
                    type: 'intervention',
                    learning: this.extractInterventionLearning(intervention),
                    importance: 1.0
                });
            }
            
            // 2. Analyze corrections
            const corrections = await this.config.dbPool.query(
                `SELECT * FROM monitoring_corrections 
                WHERE corrected_at > NOW() - INTERVAL '${timeRange / 1000} seconds'
                ORDER BY corrected_at DESC`
            );
            
            for (const correction of corrections.rows) {
                learnings.push({
                    type: 'correction',
                    learning: this.extractCorrectionLearning(correction),
                    importance: 0.9
                });
            }
            
            // 3. Analyze failed decisions
            const failedDecisions = await this.config.dbPool.query(
                `SELECT * FROM monitoring_decisions 
                WHERE captured_at > NOW() - INTERVAL '${timeRange / 1000} seconds'
                AND outcome->>'success' = 'false'
                ORDER BY captured_at DESC`
            );
            
            for (const decision of failedDecisions.rows) {
                learnings.push({
                    type: 'failed_decision',
                    learning: this.extractFailureLearning(decision),
                    importance: 0.8
                });
            }
            
            // Store permanent learnings
            for (const learning of learnings) {
                await this.storePermanentLearning(learning);
            }
            
            console.log(`✅ Extracted ${learnings.length} key learnings`);
            
            return learnings;
            
        } catch (error) {
            console.error('❌ Learning extraction failed:', error);
            return [];
        }
    }
    
    /**
     * 🎯 SHOULD CAPTURE (SAMPLING DECISION)
     */
    shouldCapture(type, priority) {
        if (!this.config.enabled) return false;
        
        // Always capture high priority items
        if (priority >= 1.0) return true;
        
        // Sample based on priority
        const sample = Math.random();
        const shouldCapture = sample < priority * this.config.samplingRate;
        
        if (!shouldCapture) {
            this.captureMetrics.droppedBySampling++;
        }
        
        return shouldCapture;
    }
    
    /**
     * 📊 CALCULATE PRIORITY
     */
    calculatePriority(data) {
        let priority = 0.5;
        
        // Increase priority for high confidence
        if (data.confidence > 0.8) priority += 0.2;
        
        // Increase priority for important events
        if (data.importance > 0.7) priority += 0.2;
        
        // Increase priority for decisions with many alternatives
        if (data.alternatives?.length > 5) priority += 0.1;
        
        return Math.min(priority, 1.0);
    }
    
    /**
     * ⚛️ CALCULATE QUANTUM PRIORITY
     */
    calculateQuantumPriority(stateData) {
        let priority = 0.25;
        
        // Higher priority for high coherence states
        if (stateData.coherence > 0.8) priority += 0.3;
        
        // Higher priority for entangled states
        if (stateData.entanglementDegree > 0.5) priority += 0.25;
        
        // Higher priority for quantum advantage
        if (stateData.quantumAdvantage > 0.7) priority += 0.2;
        
        return Math.min(priority, 1.0);
    }
    
    /**
     * 🧠 CALCULATE REASONING PRIORITY
     */
    calculateReasoningPriority(reasoningData) {
        let priority = 0.5;
        
        // Higher priority for deep reasoning
        if (reasoningData.depth > 5) priority += 0.2;
        
        // Higher priority for complex chains
        if (reasoningData.steps?.length > 10) priority += 0.2;
        
        // Higher priority for breakthrough moments
        if (reasoningData.step?.type === 'breakthrough') priority = 1.0;
        
        return Math.min(priority, 1.0);
    }
    
    /**
     * 🗜️ COMPRESS IF NEEDED
     */
    compressIfNeeded(data) {
        if (!this.config.compressionEnabled) return data;
        
        const serialized = JSON.stringify(data);
        const sizeBytes = Buffer.byteLength(serialized);
        
        // Only compress if > 1KB
        if (sizeBytes > 1024) {
            const compressed = compress(Buffer.from(serialized));
            const compressedStr = Buffer.from(compressed).toString('base64');
            
            this.captureMetrics.compressedBytes += Buffer.byteLength(compressedStr);
            this.captureMetrics.compressionRatio = 
                this.captureMetrics.compressedBytes / this.captureMetrics.totalBytes;
            
            return {
                _compressed: true,
                data: compressedStr
            };
        }
        
        return data;
    }
    
    /**
     * 📤 DECOMPRESS
     */
    decompress(data) {
        if (data._compressed) {
            const buffer = Buffer.from(data.data, 'base64');
            const decompressed = decompress(buffer);
            return JSON.parse(Buffer.from(decompressed).toString());
        }
        return data;
    }
    
    /**
     * 🔄 ADD TO REPLAY BUFFER
     */
    addToReplayBuffer(captured) {
        if (!this.config.enableReplay) return;
        
        this.replayBuffer.push(captured);
        this.replayIndex.set(captured.id, captured);
        
        // Limit buffer size
        if (this.replayBuffer.length > this.config.replayBufferSize) {
            const removed = this.replayBuffer.shift();
            this.replayIndex.delete(removed.id);
        }
    }
    
    /**
     * 💾 FLUSH BUFFER
     */
    async flushBuffer(bufferName) {
        const buffer = this.buffers[bufferName];
        if (buffer.length === 0) return;
        
        const items = buffer.splice(0, buffer.length);
        
        try {
            // Batch insert based on type
            switch (bufferName) {
                case 'thoughts':
                    await this.batchInsertThoughts(items);
                    break;
                case 'decisions':
                    await this.batchInsertDecisions(items);
                    break;
                case 'quantumStates':
                    await this.batchInsertQuantumStates(items);
                    break;
                case 'toolExecutions':
                    await this.batchInsertToolExecutions(items);
                    break;
                case 'interventions':
                    await this.batchInsertInterventions(items);
                    break;
                case 'performance':
                    await this.batchInsertPerformance(items);
                    break;
                case 'reasoning':
                    await this.batchInsertReasoning(items);
                    break;
            }
            
        } catch (error) {
            console.error(`Error flushing ${bufferName} buffer:`, error);
            // Re-add items to buffer on failure
            buffer.push(...items);
        }
    }
    
    /**
     * 💾 BATCH INSERT THOUGHTS
     */
    async batchInsertThoughts(items) {
        const values = items.map((item, index) => {
            const offset = index * 9;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
        }).join(',');
        
        const params = items.flatMap(item => [
            item.data.agentId,
            item.id,
            JSON.stringify(item.data.thought || item.data),
            item.data.layer,
            item.data.confidence,
            item.data.importance,
            JSON.stringify(item.data.reasoning),
            JSON.stringify(item.data.alternatives),
            JSON.stringify(item.data.metadata)
        ]);
        
        await this.config.dbPool.query(
            `INSERT INTO monitoring_thoughts 
            (agent_id, thought_id, thought, layer, confidence, importance, reasoning, alternatives, metadata)
            VALUES ${values}
            ON CONFLICT (thought_id) DO NOTHING`,
            params
        );
    }
    
    /**
     * 📊 UPDATE METRICS
     */
    updateMetrics(type, captured) {
        this.captureMetrics.totalCaptured++;
        
        if (!this.captureMetrics.capturedByType[type]) {
            this.captureMetrics.capturedByType[type] = 0;
        }
        this.captureMetrics.capturedByType[type]++;
        
        const dataSize = JSON.stringify(captured).length;
        this.captureMetrics.totalBytes += dataSize;
    }
    
    /**
     * ⏱️ START FLUSH INTERVAL
     */
    startFlushInterval() {
        setInterval(async () => {
            for (const bufferName of Object.keys(this.buffers)) {
                await this.flushBuffer(bufferName);
            }
        }, this.config.flushInterval);
    }
    
    /**
     * 💾 START STORAGE MONITORING
     */
    startStorageMonitoring() {
        setInterval(async () => {
            await this.calculateStorageUsage();
            await this.projectStorageGrowth();
        }, 60000); // Every minute
    }
    
    /**
     * 📊 CALCULATE STORAGE USAGE
     */
    async calculateStorageUsage() {
        try {
            const result = await this.config.dbPool.query(`
                SELECT 
                    SUM(pg_total_relation_size(tablename::regclass)) as total_bytes
                FROM pg_tables 
                WHERE tablename LIKE 'monitoring_%'
            `);
            
            this.storageMetrics.currentUsageBytes = parseInt(result.rows[0].total_bytes || 0);
            
        } catch (error) {
            console.error('Error calculating storage:', error);
        }
    }
    
    /**
     * 📈 PROJECT STORAGE GROWTH
     */
    async projectStorageGrowth() {
        // Calculate daily growth rate
        const captureRate = this.captureMetrics.totalBytes / (Date.now() - this.startTime);
        this.storageMetrics.dailyGrowthRate = captureRate * 86400000; // ms per day
        
        // Project monthly
        this.storageMetrics.projectedMonthlyGB = 
            (this.storageMetrics.dailyGrowthRate * 30) / (1024 ** 3);
        
        // Calculate days until full
        const remainingBytes = (this.config.maxStorageGB * 1024 ** 3) - this.storageMetrics.currentUsageBytes;
        this.storageMetrics.daysUntilFull = remainingBytes / this.storageMetrics.dailyGrowthRate;
    }
    
    /**
     * 🧹 AGGREGATE HOURLY DATA
     */
    async aggregateHourlyData() {
        console.log('📊 Aggregating hourly data...');
        
        const hour = new Date();
        hour.setMinutes(0, 0, 0);
        
        try {
            // Aggregate each metric type
            const aggregations = [
                { table: 'monitoring_thoughts', metric: 'confidence' },
                { table: 'monitoring_decisions', metric: 'confidence' },
                { table: 'monitoring_performance', metric: 'cpu_usage' }
            ];
            
            for (const agg of aggregations) {
                await this.config.dbPool.query(`
                    INSERT INTO monitoring_hourly_aggregates 
                    (hour, component_id, metric_type, count, avg_value, min_value, max_value, percentile_50, percentile_95, percentile_99)
                    SELECT 
                        $1 as hour,
                        agent_id as component_id,
                        $2 as metric_type,
                        COUNT(*),
                        AVG(${agg.metric}),
                        MIN(${agg.metric}),
                        MAX(${agg.metric}),
                        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${agg.metric}),
                        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${agg.metric}),
                        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ${agg.metric})
                    FROM ${agg.table}
                    WHERE captured_at >= $1 AND captured_at < $1 + INTERVAL '1 hour'
                    GROUP BY agent_id
                    ON CONFLICT (hour, component_id, metric_type) DO NOTHING
                `, [hour, agg.metric]);
            }
            
            console.log('✅ Hourly aggregation complete');
            
        } catch (error) {
            console.error('❌ Aggregation failed:', error);
        }
    }
    
    /**
     * 🧹 CLEANUP OLD DATA
     */
    async cleanupOldData(retentionDays) {
        console.log(`🧹 Cleaning data older than ${retentionDays} days...`);
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        try {
            const tables = [
                'monitoring_thoughts',
                'monitoring_decisions',
                'monitoring_quantum_states',
                'monitoring_tool_executions',
                'monitoring_performance'
            ];
            
            let totalDeleted = 0;
            
            for (const table of tables) {
                const result = await this.config.dbPool.query(
                    `DELETE FROM ${table} WHERE captured_at < $1`,
                    [cutoffDate]
                );
                totalDeleted += result.rowCount;
            }
            
            console.log(`✅ Cleaned ${totalDeleted} old records`);
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }
    
    /**
     * 💾 GET STORAGE USED
     */
    async getStorageUsed() {
        return this.storageMetrics.currentUsageBytes;
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return {
            capture: this.captureMetrics,
            storage: this.storageMetrics,
            buffers: Object.fromEntries(
                Object.entries(this.buffers).map(([name, buffer]) => [name, buffer.length])
            )
        };
    }
}

// Export for use
export default PostTrainingDataCapture;
