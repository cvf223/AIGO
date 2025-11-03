-- =====================================================
-- TIMING & TRACKING SCHEMA FOR ARBITRAGE SYNDICATE
-- =====================================================
-- Support for gas price operation timing, fallback tracking,
-- flash loan selection logging, and agent awareness alerts

-- Gas Price Operations Tracking
-- ========================================
CREATE TABLE IF NOT EXISTS gas_price_operations (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    chain VARCHAR(50) NOT NULL,
    gas_price_gwei DECIMAL(20, 9),
    source VARCHAR(255) NOT NULL, -- API URL or 'FALLBACK' or 'ERROR'
    api_duration_ms INTEGER,
    total_duration_ms INTEGER NOT NULL,
    fallback_used BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_gas_ops_opportunity (opportunity_id),
    INDEX idx_gas_ops_chain (chain),
    INDEX idx_gas_ops_created (created_at),
    INDEX idx_gas_ops_fallback (fallback_used),
    INDEX idx_gas_ops_source (source)
);

-- Agent Awareness Alerts
-- ========================================
CREATE TABLE IF NOT EXISTS agent_awareness_alerts (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL, -- 'gas_price_fallback', 'calculation_error', etc.
    chain VARCHAR(50) NOT NULL,
    alert_data JSON NOT NULL, -- Full alert details
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_awareness_opportunity (opportunity_id),
    INDEX idx_awareness_type (alert_type),
    INDEX idx_awareness_chain (chain),
    INDEX idx_awareness_created (created_at),
    INDEX idx_awareness_resolved (resolved)
);

-- Flash Loan Selections
-- ========================================
CREATE TABLE IF NOT EXISTS flashloan_selections (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    chain VARCHAR(50) NOT NULL,
    token VARCHAR(20) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'balancer', 'aave', 'dydx', etc.
    position_size DECIMAL(20, 2) NOT NULL,
    capacity DECIMAL(20, 2) NOT NULL,
    fee_rate DECIMAL(10, 6) NOT NULL, -- 0.0005 = 0.05%
    fee_amount DECIMAL(20, 2) NOT NULL,
    agent_reward DECIMAL(20, 2) DEFAULT 0, -- Reward for choosing free providers
    is_free BOOLEAN DEFAULT FALSE,
    execution_successful BOOLEAN NULL, -- Updated after execution
    actual_fee_paid DECIMAL(20, 2) NULL, -- Actual fee if different
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_flashloan_opportunity (opportunity_id),
    INDEX idx_flashloan_chain (chain),
    INDEX idx_flashloan_token (token),
    INDEX idx_flashloan_provider (provider),
    INDEX idx_flashloan_created (created_at),
    INDEX idx_flashloan_free (is_free),
    INDEX idx_flashloan_success (execution_successful)
);

-- Agent Penalties (existing table reference)
-- ========================================
CREATE TABLE IF NOT EXISTS agent_penalties (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    penalty_type VARCHAR(100) NOT NULL,
    opportunity_id VARCHAR(255),
    expected_profit DECIMAL(20, 2),
    actual_profit DECIMAL(20, 2),
    difference DECIMAL(10, 6), -- Percentage difference
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    penalty_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_penalties_agent (agent_id),
    INDEX idx_penalties_type (penalty_type),
    INDEX idx_penalties_opportunity (opportunity_id),
    INDEX idx_penalties_severity (severity),
    INDEX idx_penalties_created (created_at)
);

-- Performance Analytics Views
-- ========================================

-- Gas Price Performance Summary
CREATE OR REPLACE VIEW gas_price_performance AS
SELECT 
    chain,
    DATE(created_at) as date,
    COUNT(*) as total_calls,
    AVG(total_duration_ms) as avg_duration_ms,
    AVG(api_duration_ms) as avg_api_duration_ms,
    SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END) as fallback_count,
    (SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as fallback_percentage,
    AVG(gas_price_gwei) as avg_gas_price_gwei,
    COUNT(DISTINCT source) as unique_sources
FROM gas_price_operations 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY chain, DATE(created_at)
ORDER BY date DESC, chain;

-- Flash Loan Provider Performance
CREATE OR REPLACE VIEW flashloan_provider_performance AS
SELECT 
    chain,
    token,
    provider,
    COUNT(*) as selections,
    SUM(position_size) as total_volume,
    AVG(position_size) as avg_position_size,
    AVG(fee_rate) as avg_fee_rate,
    SUM(fee_amount) as total_fees,
    SUM(agent_reward) as total_rewards,
    SUM(CASE WHEN is_free THEN 1 ELSE 0 END) as free_selections,
    AVG(CASE WHEN execution_successful = true THEN 1.0 ELSE 0.0 END) as success_rate
FROM flashloan_selections 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY chain, token, provider
ORDER BY total_volume DESC;

-- Agent Awareness Summary
CREATE OR REPLACE VIEW agent_awareness_summary AS
SELECT 
    chain,
    alert_type,
    DATE(created_at) as date,
    COUNT(*) as alert_count,
    SUM(CASE WHEN resolved THEN 1 ELSE 0 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time_seconds
FROM agent_awareness_alerts 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY chain, alert_type, DATE(created_at)
ORDER BY date DESC, alert_count DESC;

-- Human Escalations Table
-- ========================================
CREATE TABLE IF NOT EXISTS human_escalations (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    reason TEXT NOT NULL,
    impact TEXT,
    recent_similar_count INTEGER DEFAULT 0,
    agent_recommendation JSON,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_escalations_priority (priority),
    INDEX idx_escalations_status (status),
    INDEX idx_escalations_chain (chain),
    INDEX idx_escalations_created (created_at),
    INDEX idx_escalations_alert_type (alert_type)
);

-- Frontend Notifications Table
-- ========================================
CREATE TABLE IF NOT EXISTS frontend_notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL, -- 'HUMAN_ESCALATION', 'SYSTEM_ALERT', 'PERFORMANCE_WARNING', etc.
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- Additional notification data
    read_status VARCHAR(20) DEFAULT 'UNREAD', -- 'UNREAD', 'READ', 'DISMISSED'
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    
    -- Indexes for performance
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_status (read_status),
    INDEX idx_notifications_created (created_at),
    INDEX idx_notifications_expires (expires_at)
);

-- Critical Alert Queue Table
-- ========================================
CREATE TABLE IF NOT EXISTS critical_alert_queue (
    id SERIAL PRIMARY KEY,
    escalation_id INTEGER REFERENCES human_escalations(id),
    alert_message TEXT NOT NULL,
    delivery_method VARCHAR(50) NOT NULL, -- 'EMAIL', 'SMS', 'EMAIL_SMS', 'SLACK'
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED', 'RETRY'
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_alert_queue_status (status),
    INDEX idx_alert_queue_escalation (escalation_id),
    INDEX idx_alert_queue_method (delivery_method),
    INDEX idx_alert_queue_created (created_at)
);

-- Alert Threshold Configuration Table
-- ========================================
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id SERIAL PRIMARY KEY,
    threshold_name VARCHAR(100) NOT NULL UNIQUE,
    threshold_type VARCHAR(50) NOT NULL, -- 'fallback_rate', 'error_rate', 'latency', 'cost_deviation'
    chain VARCHAR(50), -- NULL for global thresholds
    warning_threshold DECIMAL(10, 6) NOT NULL,
    critical_threshold DECIMAL(10, 6) NOT NULL,
    time_window_minutes INTEGER DEFAULT 60, -- Time window for threshold evaluation
    enabled BOOLEAN DEFAULT TRUE,
    notify_channels JSON, -- ['frontend', 'email', 'sms']
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_thresholds_name (threshold_name),
    INDEX idx_thresholds_type (threshold_type),
    INDEX idx_thresholds_chain (chain),
    INDEX idx_thresholds_enabled (enabled)
);

-- Performance Analytics Views (Enhanced)
-- ========================================

-- Human Escalation Summary
CREATE OR REPLACE VIEW human_escalation_summary AS
SELECT 
    chain,
    alert_type,
    priority,
    DATE(created_at) as date,
    COUNT(*) as escalation_count,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time_seconds,
    AVG(recent_similar_count) as avg_similar_issues
FROM human_escalations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY chain, alert_type, priority, DATE(created_at)
ORDER BY date DESC, escalation_count DESC;

-- Alert Threshold Monitoring
CREATE OR REPLACE VIEW alert_threshold_status AS
SELECT 
    at.threshold_name,
    at.threshold_type,
    at.chain,
    at.warning_threshold,
    at.critical_threshold,
    at.time_window_minutes,
    CASE 
        WHEN at.threshold_type = 'fallback_rate' THEN (
            SELECT (SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
            FROM gas_price_operations 
            WHERE (at.chain IS NULL OR chain = at.chain)
            AND created_at > NOW() - INTERVAL '1 minute' * at.time_window_minutes
        )
        WHEN at.threshold_type = 'error_rate' THEN (
            SELECT (COUNT(*) * 100.0 / (
                SELECT COUNT(*) FROM agent_penalties 
                WHERE created_at > NOW() - INTERVAL '1 minute' * at.time_window_minutes
            ))
            FROM agent_penalties 
            WHERE severity IN ('HIGH', 'CRITICAL')
            AND created_at > NOW() - INTERVAL '1 minute' * at.time_window_minutes
        )
        ELSE 0
    END as current_value,
    CASE 
        WHEN current_value >= at.critical_threshold THEN 'CRITICAL'
        WHEN current_value >= at.warning_threshold THEN 'WARNING'
        ELSE 'OK'
    END as status
FROM alert_thresholds at
WHERE at.enabled = true;

-- Comments for documentation
COMMENT ON TABLE gas_price_operations IS 'Tracks timing and sources for all gas price API calls';
COMMENT ON TABLE agent_awareness_alerts IS 'Logs alerts sent to agent awareness system for learning';
COMMENT ON TABLE flashloan_selections IS 'Records all flash loan provider selections with rewards';
COMMENT ON TABLE human_escalations IS 'Human-in-the-loop escalations from agents';
COMMENT ON TABLE frontend_notifications IS 'Real-time notifications for web frontend';
COMMENT ON TABLE critical_alert_queue IS 'Queue for email/SMS critical alerts';
COMMENT ON TABLE alert_thresholds IS 'Configurable alert thresholds for automated monitoring';
COMMENT ON VIEW gas_price_performance IS 'Daily performance metrics for gas price operations by chain';
COMMENT ON VIEW flashloan_provider_performance IS 'Provider performance and selection statistics';
COMMENT ON VIEW agent_awareness_summary IS 'Agent awareness alert summary and resolution tracking';
-- Telegram Notification Queue Table
-- ========================================
CREATE TABLE IF NOT EXISTS telegram_notification_queue (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_telegram_queue_status (status),
    INDEX idx_telegram_queue_escalation (escalation_id),
    INDEX idx_telegram_queue_created (created_at)
);

-- Email Send Queue Table
-- ========================================
CREATE TABLE IF NOT EXISTS email_send_queue (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255),
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email_queue_status (status),
    INDEX idx_email_queue_escalation (escalation_id),
    INDEX idx_email_queue_recipient (recipient),
    INDEX idx_email_queue_created (created_at)
);

-- Insert default alert thresholds
-- ========================================
INSERT INTO alert_thresholds (threshold_name, threshold_type, warning_threshold, critical_threshold, notify_channels, created_at) 
VALUES 
    ('global_fallback_rate', 'fallback_rate', 2.0, 5.0, '["frontend", "telegram"]', NOW()),
    ('global_error_rate', 'error_rate', 3.0, 8.0, '["frontend", "telegram"]', NOW()),
    ('global_latency', 'latency', 800, 1200, '["frontend"]', NOW()),
    ('arbitrum_fallback_rate', 'fallback_rate', 1.0, 3.0, '["frontend", "telegram"]', NOW()),
    ('polygon_fallback_rate', 'fallback_rate', 2.0, 5.0, '["frontend", "telegram"]', NOW()),
    ('bsc_fallback_rate', 'fallback_rate', 2.5, 6.0, '["frontend", "telegram"]', NOW())
ON CONFLICT (threshold_name) DO NOTHING;

-- Capability Requests Table (for LLM-powered capability creation)
-- ===============================================================
CREATE TABLE IF NOT EXISTS capability_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    requesting_agent_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB NOT NULL,
    context_data JSONB DEFAULT '{}',
    validation_result JSONB DEFAULT '{}',
    assessment_data JSONB DEFAULT '{}',
    implementation_plan JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'PENDING_ASSESSMENT',
    -- Status values: PENDING_ASSESSMENT, ASSESSED, PLANNED, PENDING_HUMAN_APPROVAL, 
    --               APPROVED, PENDING_MANUAL_DEVELOPMENT, DEVELOPMENT_FAILED, 
    --               TESTING_FAILED, COMPLETED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessed_at TIMESTAMP NULL,
    planned_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_capability_requests_status (status),
    INDEX idx_capability_requests_agent (requesting_agent_id),
    INDEX idx_capability_requests_created (created_at)
);

COMMENT ON TABLE human_escalations IS 'Human-in-the-loop escalations from agents';
COMMENT ON TABLE frontend_notifications IS 'Real-time notifications for web frontend';
COMMENT ON TABLE critical_alert_queue IS 'Queue for email/SMS critical alerts';
COMMENT ON TABLE alert_thresholds IS 'Configurable alert thresholds for automated monitoring';
COMMENT ON TABLE telegram_notification_queue IS 'Queue for Telegram bot notifications';
COMMENT ON TABLE email_send_queue IS 'Queue for Gmail notifications';
COMMENT ON TABLE capability_requests IS 'LLM-powered capability creation requests with human approval workflow';
COMMENT ON VIEW gas_price_performance IS 'Daily performance metrics for gas price operations by chain';
COMMENT ON VIEW flashloan_provider_performance IS 'Provider performance and selection statistics';
COMMENT ON VIEW agent_awareness_summary IS 'Agent awareness alert summary and resolution tracking';
COMMENT ON VIEW human_escalation_summary IS 'Human escalation metrics and resolution tracking';
COMMENT ON VIEW alert_threshold_status IS 'Real-time alert threshold monitoring and status';
