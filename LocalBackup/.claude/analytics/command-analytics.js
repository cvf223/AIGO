// command-analytics.js - Analytics and Monitoring for Construction Syndicate Commands
import { EventEmitter } from 'events';
import { DatabasePoolManager } from '../../src/core/DatabasePoolManager.js';
import { ServiceRegistry } from '../../src/core/ServiceRegistry.js';

export class CommandAnalytics extends EventEmitter {
    constructor() {
        super();
        
        this.dbPool = DatabasePoolManager.getInstance();
        this.registry = ServiceRegistry.getInstance();
        this.metrics = new Map();
        this.realTimeStats = new Map();
        
        this.initializeMetrics();
    }
    
    async initialize() {
        console.log('Initializing Command Analytics...');
        
        // Create analytics tables
        await this.createAnalyticsTables();
        
        // Load historical data
        await this.loadHistoricalData();
        
        // Start collectors
        this.startMetricsCollection();
        
        // Register with command server
        await this.registerWithCommandServer();
        
        console.log('Command Analytics initialized');
    }
    
    initializeMetrics() {
        // Command execution metrics
        this.metricsDefinitions = {
            command_executions: {
                type: 'counter',
                description: 'Total command executions',
                labels: ['command', 'status']
            },
            command_duration: {
                type: 'histogram',
                description: 'Command execution duration',
                labels: ['command'],
                buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
            },
            command_errors: {
                type: 'counter',
                description: 'Command execution errors',
                labels: ['command', 'error_type']
            },
            active_workflows: {
                type: 'gauge',
                description: 'Currently active workflows',
                labels: ['workflow_type']
            },
            user_satisfaction: {
                type: 'gauge',
                description: 'User satisfaction score',
                labels: ['command']
            }
        };
        
        // Initialize real-time stats
        this.realTimeStats.set('commandsPerMinute', 0);
        this.realTimeStats.set('averageResponseTime', 0);
        this.realTimeStats.set('errorRate', 0);
        this.realTimeStats.set('activeUsers', new Set());
    }
    
    async createAnalyticsTables() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Command usage analytics
            await client.query(`
                CREATE TABLE IF NOT EXISTS command_usage (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    command VARCHAR(50) NOT NULL,
                    user_id VARCHAR(255),
                    parameters JSONB,
                    execution_id VARCHAR(255),
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_command_usage_time 
                ON command_usage(command, timestamp DESC);
                
                CREATE INDEX IF NOT EXISTS idx_command_usage_user 
                ON command_usage(user_id, timestamp DESC);
            `);
            
            // Command results analytics
            await client.query(`
                CREATE TABLE IF NOT EXISTS command_results (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    command VARCHAR(50) NOT NULL,
                    execution_id VARCHAR(255),
                    success BOOLEAN NOT NULL,
                    duration_ms INTEGER,
                    error TEXT,
                    output_size INTEGER,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_command_results_time 
                ON command_results(command, timestamp DESC);
                
                CREATE INDEX IF NOT EXISTS idx_command_results_success 
                ON command_results(success, timestamp DESC);
            `);
            
            // User feedback
            await client.query(`
                CREATE TABLE IF NOT EXISTS command_feedback (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    command VARCHAR(50) NOT NULL,
                    execution_id VARCHAR(255),
                    user_id VARCHAR(255),
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    feedback TEXT,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_feedback_command 
                ON command_feedback(command, timestamp DESC);
            `);
            
            // Command patterns
            await client.query(`
                CREATE TABLE IF NOT EXISTS command_patterns (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    pattern_name VARCHAR(255) NOT NULL,
                    command_sequence TEXT[],
                    frequency INTEGER DEFAULT 1,
                    average_duration_ms INTEGER,
                    success_rate FLOAT,
                    last_used TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_patterns_frequency 
                ON command_patterns(frequency DESC);
            `);
            
            // Performance benchmarks
            await client.query(`
                CREATE TABLE IF NOT EXISTS command_benchmarks (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    command VARCHAR(50) NOT NULL,
                    benchmark_type VARCHAR(50),
                    metric_name VARCHAR(100),
                    metric_value FLOAT,
                    metadata JSONB,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_benchmarks_command 
                ON command_benchmarks(command, timestamp DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async registerWithCommandServer() {
        const commandServer = await this.registry.get('CommandsServer');
        if (!commandServer) return;
        
        // Listen to command events
        commandServer.on('command_executed', (data) => {
            this.trackCommandExecution(data);
        });
        
        commandServer.on('command_completed', (data) => {
            this.trackCommandCompletion(data);
        });
        
        commandServer.on('command_failed', (data) => {
            this.trackCommandError(data);
        });
    }
    
    // Tracking Methods
    
    async trackCommandExecution({ command, parameters, userId, executionId }) {
        // Update real-time stats
        this.updateRealTimeStats('execution', command);
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO command_usage
                (command, user_id, parameters, execution_id)
                VALUES ($1, $2, $3, $4)
            `, [command, userId, JSON.stringify(parameters), executionId]);
        } finally {
            client.release();
        }
        
        // Emit event for real-time dashboard
        this.emit('command_executed', {
            command,
            userId,
            timestamp: new Date()
        });
    }
    
    async trackCommandCompletion({ command, executionId, duration, result }) {
        // Update metrics
        this.updateMetric('command_executions', { command, status: 'success' }, 1);
        this.updateMetric('command_duration', { command }, duration / 1000);
        
        // Calculate output size
        const outputSize = JSON.stringify(result).length;
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO command_results
                (command, execution_id, success, duration_ms, output_size)
                VALUES ($1, $2, true, $3, $4)
            `, [command, executionId, duration, outputSize]);
        } finally {
            client.release();
        }
        
        // Update pattern detection
        await this.updatePatternDetection(command);
    }
    
    async trackCommandError({ command, executionId, error, duration }) {
        // Update metrics
        this.updateMetric('command_executions', { command, status: 'failed' }, 1);
        this.updateMetric('command_errors', { command, error_type: error.type || 'unknown' }, 1);
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO command_results
                (command, execution_id, success, duration_ms, error)
                VALUES ($1, $2, false, $3, $4)
            `, [command, executionId, duration, error.message]);
        } finally {
            client.release();
        }
        
        // Alert on high error rates
        await this.checkErrorThresholds(command);
    }
    
    // Analytics Methods
    
    async getCommandStats(timeRange = '24h') {
        const client = await this.dbPool.connect();
        try {
            const interval = this.parseTimeRange(timeRange);
            
            // Overall stats
            const overallStats = await client.query(`
                SELECT 
                    COUNT(*) as total_executions,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT command) as unique_commands,
                    AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate
                FROM command_results
                WHERE timestamp > NOW() - INTERVAL '${interval}'
            `);
            
            // Per-command stats
            const commandStats = await client.query(`
                SELECT 
                    r.command,
                    COUNT(*) as executions,
                    AVG(CASE WHEN r.success THEN 1 ELSE 0 END) as success_rate,
                    AVG(r.duration_ms) as avg_duration_ms,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY r.duration_ms) as p95_duration_ms,
                    COUNT(DISTINCT u.user_id) as unique_users,
                    AVG(f.rating) as avg_rating
                FROM command_results r
                LEFT JOIN command_usage u ON r.execution_id = u.execution_id
                LEFT JOIN command_feedback f ON r.execution_id = f.execution_id
                WHERE r.timestamp > NOW() - INTERVAL '${interval}'
                GROUP BY r.command
                ORDER BY executions DESC
            `);
            
            // Error analysis
            const errorAnalysis = await client.query(`
                SELECT 
                    command,
                    COUNT(*) as error_count,
                    error,
                    COUNT(*) as frequency
                FROM command_results
                WHERE success = false
                  AND timestamp > NOW() - INTERVAL '${interval}'
                GROUP BY command, error
                ORDER BY frequency DESC
                LIMIT 20
            `);
            
            // Usage patterns
            const patterns = await client.query(`
                SELECT 
                    pattern_name,
                    command_sequence,
                    frequency,
                    average_duration_ms,
                    success_rate
                FROM command_patterns
                WHERE last_used > NOW() - INTERVAL '${interval}'
                ORDER BY frequency DESC
                LIMIT 10
            `);
            
            return {
                timeRange,
                overall: overallStats.rows[0],
                commands: commandStats.rows,
                errors: errorAnalysis.rows,
                patterns: patterns.rows,
                realTime: this.getRealTimeStats()
            };
            
        } finally {
            client.release();
        }
    }
    
    async getCommandTimeSeries(command, timeRange = '24h', interval = '1h') {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    date_trunc('${interval}', timestamp) as time_bucket,
                    COUNT(*) as executions,
                    AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
                    AVG(duration_ms) as avg_duration_ms
                FROM command_results
                WHERE command = $1
                  AND timestamp > NOW() - INTERVAL '${this.parseTimeRange(timeRange)}'
                GROUP BY time_bucket
                ORDER BY time_bucket
            `, [command]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async getUserAnalytics(userId, timeRange = '7d') {
        const client = await this.dbPool.connect();
        try {
            const interval = this.parseTimeRange(timeRange);
            
            // User command usage
            const usage = await client.query(`
                SELECT 
                    u.command,
                    COUNT(*) as executions,
                    AVG(r.duration_ms) as avg_duration_ms,
                    AVG(CASE WHEN r.success THEN 1 ELSE 0 END) as success_rate,
                    MAX(u.timestamp) as last_used
                FROM command_usage u
                LEFT JOIN command_results r ON u.execution_id = r.execution_id
                WHERE u.user_id = $1
                  AND u.timestamp > NOW() - INTERVAL '${interval}'
                GROUP BY u.command
                ORDER BY executions DESC
            `, [userId]);
            
            // User patterns
            const sequences = await this.detectUserPatterns(userId, interval);
            
            // User satisfaction
            const satisfaction = await client.query(`
                SELECT 
                    AVG(rating) as avg_rating,
                    COUNT(*) as total_ratings
                FROM command_feedback
                WHERE user_id = $1
                  AND timestamp > NOW() - INTERVAL '${interval}'
            `, [userId]);
            
            return {
                userId,
                timeRange,
                commandUsage: usage.rows,
                patterns: sequences,
                satisfaction: satisfaction.rows[0],
                insights: this.generateUserInsights(usage.rows, sequences)
            };
            
        } finally {
            client.release();
        }
    }
    
    async detectUserPatterns(userId, interval) {
        const client = await this.dbPool.connect();
        try {
            // Get command sequences
            const result = await client.query(`
                SELECT 
                    command,
                    timestamp,
                    LAG(command) OVER (ORDER BY timestamp) as prev_command,
                    LEAD(command) OVER (ORDER BY timestamp) as next_command
                FROM command_usage
                WHERE user_id = $1
                  AND timestamp > NOW() - INTERVAL '${interval}'
                ORDER BY timestamp
            `, [userId]);
            
            // Analyze sequences
            const sequences = new Map();
            
            result.rows.forEach(row => {
                if (row.prev_command && row.command) {
                    const sequence = `${row.prev_command} -> ${row.command}`;
                    sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
                }
            });
            
            // Return top patterns
            return Array.from(sequences.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([sequence, count]) => ({
                    sequence,
                    frequency: count
                }));
                
        } finally {
            client.release();
        }
    }
    
    generateUserInsights(usage, patterns) {
        const insights = [];
        
        // Most used command
        if (usage.length > 0) {
            insights.push({
                type: 'most_used',
                message: `Most used command: /${usage[0].command} (${usage[0].executions} times)`,
                data: usage[0]
            });
        }
        
        // Success rate
        const avgSuccessRate = usage.reduce((sum, cmd) => sum + cmd.success_rate, 0) / usage.length;
        if (avgSuccessRate < 0.8) {
            insights.push({
                type: 'low_success_rate',
                message: `Success rate below 80% (${(avgSuccessRate * 100).toFixed(1)}%)`,
                recommendation: 'Consider reviewing command parameters or documentation'
            });
        }
        
        // Common patterns
        if (patterns.length > 0) {
            insights.push({
                type: 'common_pattern',
                message: `Most common workflow: ${patterns[0].sequence}`,
                recommendation: 'Consider creating a workflow automation for this pattern'
            });
        }
        
        // Performance
        const slowCommands = usage.filter(cmd => cmd.avg_duration_ms > 5000);
        if (slowCommands.length > 0) {
            insights.push({
                type: 'performance',
                message: `${slowCommands.length} commands take over 5 seconds on average`,
                data: slowCommands
            });
        }
        
        return insights;
    }
    
    async getWorkflowAnalytics(timeRange = '7d') {
        const client = await this.dbPool.connect();
        try {
            const interval = this.parseTimeRange(timeRange);
            
            const result = await client.query(`
                SELECT 
                    workflow_id,
                    COUNT(*) as executions,
                    AVG(CASE WHEN state = 'completed' THEN 1 ELSE 0 END) as success_rate,
                    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
                    COUNT(DISTINCT parameters->>'user_id') as unique_users
                FROM workflow_executions
                WHERE started_at > NOW() - INTERVAL '${interval}'
                GROUP BY workflow_id
                ORDER BY executions DESC
            `);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    // Performance Analysis
    
    async analyzePerformance(command) {
        const client = await this.dbPool.connect();
        try {
            // Get performance metrics over time
            const performanceData = await client.query(`
                SELECT 
                    date_trunc('hour', timestamp) as hour,
                    AVG(duration_ms) as avg_duration,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
                    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
                    COUNT(*) as sample_size
                FROM command_results
                WHERE command = $1
                  AND timestamp > NOW() - INTERVAL '7 days'
                  AND success = true
                GROUP BY hour
                ORDER BY hour
            `, [command]);
            
            // Identify performance degradation
            const degradation = this.detectPerformanceDegradation(performanceData.rows);
            
            // Get factors affecting performance
            const factors = await this.analyzePerformanceFactors(command);
            
            return {
                command,
                metrics: performanceData.rows,
                degradation,
                factors,
                recommendations: this.generatePerformanceRecommendations(
                    performanceData.rows,
                    factors
                )
            };
            
        } finally {
            client.release();
        }
    }
    
    detectPerformanceDegradation(performanceData) {
        if (performanceData.length < 24) return null;
        
        // Calculate trend
        const recentAvg = performanceData.slice(-6).reduce((sum, d) => sum + d.avg_duration, 0) / 6;
        const historicalAvg = performanceData.slice(0, -6).reduce((sum, d) => sum + d.avg_duration, 0) / (performanceData.length - 6);
        
        const degradationPercent = ((recentAvg - historicalAvg) / historicalAvg) * 100;
        
        if (degradationPercent > 20) {
            return {
                detected: true,
                severity: degradationPercent > 50 ? 'high' : 'medium',
                degradationPercent,
                recentAvg,
                historicalAvg
            };
        }
        
        return { detected: false };
    }
    
    async analyzePerformanceFactors(command) {
        const client = await this.dbPool.connect();
        try {
            // Analyze by parameter patterns
            const result = await client.query(`
                SELECT 
                    u.parameters,
                    AVG(r.duration_ms) as avg_duration,
                    COUNT(*) as count
                FROM command_usage u
                JOIN command_results r ON u.execution_id = r.execution_id
                WHERE u.command = $1
                  AND r.success = true
                  AND u.timestamp > NOW() - INTERVAL '7 days'
                GROUP BY u.parameters
                HAVING COUNT(*) > 5
                ORDER BY avg_duration DESC
                LIMIT 20
            `, [command]);
            
            return this.categorizePerformanceFactors(result.rows);
            
        } finally {
            client.release();
        }
    }
    
    categorizePerformanceFactors(data) {
        const factors = {
            parameterImpact: [],
            complexityCorrelation: null,
            sizeCorrelation: null
        };
        
        // Analyze parameter patterns
        data.forEach(row => {
            const params = row.parameters;
            
            // Check for size-related parameters
            if (params.limit && row.avg_duration > 1000) {
                factors.parameterImpact.push({
                    factor: 'high_limit',
                    impact: 'Increases duration',
                    example: params
                });
            }
            
            // Check for depth parameters
            if (params.depth === 'deep' && row.avg_duration > 2000) {
                factors.parameterImpact.push({
                    factor: 'deep_analysis',
                    impact: 'Significantly increases duration',
                    example: params
                });
            }
        });
        
        return factors;
    }
    
    generatePerformanceRecommendations(metrics, factors) {
        const recommendations = [];
        
        // Check for high P95
        const latestP95 = metrics[metrics.length - 1]?.p95 || 0;
        if (latestP95 > 5000) {
            recommendations.push({
                priority: 'high',
                type: 'performance',
                message: 'P95 latency exceeds 5 seconds',
                action: 'Consider implementing caching or optimizing the command'
            });
        }
        
        // Check for parameter impact
        factors.parameterImpact.forEach(impact => {
            if (impact.factor === 'deep_analysis') {
                recommendations.push({
                    priority: 'medium',
                    type: 'optimization',
                    message: 'Deep analysis significantly impacts performance',
                    action: 'Consider implementing progressive loading or background processing'
                });
            }
        });
        
        return recommendations;
    }
    
    // Real-time Monitoring
    
    updateRealTimeStats(event, command) {
        const now = Date.now();
        
        // Update commands per minute
        if (!this.commandTimestamps) this.commandTimestamps = [];
        this.commandTimestamps.push(now);
        
        // Clean old timestamps
        const oneMinuteAgo = now - 60000;
        this.commandTimestamps = this.commandTimestamps.filter(ts => ts > oneMinuteAgo);
        
        this.realTimeStats.set('commandsPerMinute', this.commandTimestamps.length);
        
        // Emit for real-time dashboards
        this.emit('realtime_update', {
            metric: 'commandsPerMinute',
            value: this.commandTimestamps.length,
            timestamp: new Date()
        });
    }
    
    getRealTimeStats() {
        return {
            commandsPerMinute: this.realTimeStats.get('commandsPerMinute'),
            averageResponseTime: this.realTimeStats.get('averageResponseTime'),
            errorRate: this.realTimeStats.get('errorRate'),
            activeUsers: this.realTimeStats.get('activeUsers').size
        };
    }
    
    // Alert Management
    
    async checkErrorThresholds(command) {
        const client = await this.dbPool.connect();
        try {
            // Check error rate in last 5 minutes
            const result = await client.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE success = false) as errors,
                    COUNT(*) as total
                FROM command_results
                WHERE command = $1
                  AND timestamp > NOW() - INTERVAL '5 minutes'
            `, [command]);
            
            const errorRate = result.rows[0].total > 0 ? 
                result.rows[0].errors / result.rows[0].total : 0;
            
            if (errorRate > 0.2 && result.rows[0].total > 10) {
                this.emit('high_error_rate', {
                    command,
                    errorRate,
                    errors: result.rows[0].errors,
                    total: result.rows[0].total
                });
            }
            
        } finally {
            client.release();
        }
    }
    
    // Pattern Detection
    
    async updatePatternDetection(command) {
        // Store recent command in session
        if (!this.recentCommands) this.recentCommands = [];
        this.recentCommands.push(command);
        
        // Keep last 10 commands
        if (this.recentCommands.length > 10) {
            this.recentCommands.shift();
        }
        
        // Detect patterns
        if (this.recentCommands.length >= 3) {
            const pattern = this.detectPattern(this.recentCommands);
            if (pattern) {
                await this.storePattern(pattern);
            }
        }
    }
    
    detectPattern(commands) {
        // Look for repeated sequences
        for (let len = 2; len <= Math.min(5, commands.length / 2); len++) {
            for (let i = 0; i <= commands.length - len * 2; i++) {
                const sequence = commands.slice(i, i + len);
                const nextSequence = commands.slice(i + len, i + len * 2);
                
                if (JSON.stringify(sequence) === JSON.stringify(nextSequence)) {
                    return {
                        sequence,
                        frequency: 2
                    };
                }
            }
        }
        
        return null;
    }
    
    async storePattern(pattern) {
        const client = await this.dbPool.connect();
        try {
            const patternName = pattern.sequence.join(' -> ');
            
            await client.query(`
                INSERT INTO command_patterns
                (pattern_name, command_sequence, frequency)
                VALUES ($1, $2, 1)
                ON CONFLICT (pattern_name) DO UPDATE
                SET frequency = command_patterns.frequency + 1,
                    last_used = NOW()
            `, [patternName, pattern.sequence]);
            
        } finally {
            client.release();
        }
    }
    
    // Utility Methods
    
    parseTimeRange(timeRange) {
        const units = {
            h: 'hours',
            d: 'days',
            w: 'weeks',
            m: 'months'
        };
        
        const match = timeRange.match(/^(\d+)([hdwm])$/);
        if (!match) return '24 hours';
        
        const [_, value, unit] = match;
        return `${value} ${units[unit]}`;
    }
    
    updateMetric(name, labels, value) {
        const key = `${name}:${JSON.stringify(labels)}`;
        
        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                name,
                labels,
                value: 0,
                samples: []
            });
        }
        
        const metric = this.metrics.get(key);
        
        if (this.metricsDefinitions[name]?.type === 'counter') {
            metric.value += value;
        } else if (this.metricsDefinitions[name]?.type === 'gauge') {
            metric.value = value;
        } else if (this.metricsDefinitions[name]?.type === 'histogram') {
            metric.samples.push(value);
        }
    }
    
    // Data Export
    
    async exportAnalytics(format = 'json', timeRange = '7d') {
        const data = await this.getCommandStats(timeRange);
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return this.convertToCSV(data);
                
            case 'prometheus':
                return this.convertToPrometheus(data);
                
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    
    convertToCSV(data) {
        // Convert command stats to CSV
        const headers = ['Command', 'Executions', 'Success Rate', 'Avg Duration', 'P95 Duration', 'Users', 'Rating'];
        const rows = data.commands.map(cmd => [
            cmd.command,
            cmd.executions,
            (cmd.success_rate * 100).toFixed(2) + '%',
            cmd.avg_duration_ms?.toFixed(0) + 'ms',
            cmd.p95_duration_ms?.toFixed(0) + 'ms',
            cmd.unique_users,
            cmd.avg_rating?.toFixed(2) || 'N/A'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    convertToPrometheus(data) {
        const lines = [];
        
        // Convert metrics to Prometheus format
        for (const [key, metric] of this.metrics) {
            const labelString = Object.entries(metric.labels)
                .map(([k, v]) => `${k}="${v}"`)
                .join(',');
            
            lines.push(`# HELP ${metric.name} ${this.metricsDefinitions[metric.name]?.description}`);
            lines.push(`# TYPE ${metric.name} ${this.metricsDefinitions[metric.name]?.type}`);
            lines.push(`${metric.name}{${labelString}} ${metric.value}`);
        }
        
        return lines.join('\n');
    }
    
    // Lifecycle
    
    startMetricsCollection() {
        // Periodic stats calculation
        setInterval(() => {
            this.calculateRealTimeStats();
        }, 5000); // Every 5 seconds
        
        // Periodic cleanup
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000); // Every hour
    }
    
    async calculateRealTimeStats() {
        const client = await this.dbPool.connect();
        try {
            // Calculate average response time
            const avgResponse = await client.query(`
                SELECT AVG(duration_ms) as avg
                FROM command_results
                WHERE timestamp > NOW() - INTERVAL '5 minutes'
                  AND success = true
            `);
            
            this.realTimeStats.set('averageResponseTime', avgResponse.rows[0]?.avg || 0);
            
            // Calculate error rate
            const errorRate = await client.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE success = false) as errors,
                    COUNT(*) as total
                FROM command_results
                WHERE timestamp > NOW() - INTERVAL '5 minutes'
            `);
            
            const rate = errorRate.rows[0].total > 0 ? 
                errorRate.rows[0].errors / errorRate.rows[0].total : 0;
            
            this.realTimeStats.set('errorRate', rate);
            
        } finally {
            client.release();
        }
    }
    
    async cleanupOldData() {
        const client = await this.dbPool.connect();
        try {
            // Keep detailed data for 30 days
            await client.query(`
                DELETE FROM command_usage
                WHERE timestamp < NOW() - INTERVAL '30 days'
            `);
            
            await client.query(`
                DELETE FROM command_results
                WHERE timestamp < NOW() - INTERVAL '30 days'
            `);
            
        } finally {
            client.release();
        }
    }
    
    async loadHistoricalData() {
        // Load recent patterns and benchmarks
        const client = await this.dbPool.connect();
        try {
            const patterns = await client.query(`
                SELECT * FROM command_patterns
                ORDER BY frequency DESC
                LIMIT 100
            `);
            
            console.log(`Loaded ${patterns.rows.length} command patterns`);
            
        } finally {
            client.release();
        }
    }
}

// Export factory
export function createCommandAnalytics() {
    return new CommandAnalytics();
}

export default CommandAnalytics;
