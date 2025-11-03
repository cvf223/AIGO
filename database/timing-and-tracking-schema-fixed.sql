-- ===============================================
-- TIMING & TRACKING SCHEMA - PRODUCTION READY
-- ===============================================
-- Fixed PostgreSQL syntax for production deployment

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for gas_price_operations
CREATE INDEX IF NOT EXISTS idx_gas_ops_opportunity ON gas_price_operations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_gas_ops_chain ON gas_price_operations(chain);
CREATE INDEX IF NOT EXISTS idx_gas_ops_created ON gas_price_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_gas_ops_fallback ON gas_price_operations(fallback_used);

-- Agent Awareness Alerts Table
-- ========================================
CREATE TABLE IF NOT EXISTS agent_awareness_alerts (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    agent_id VARCHAR(255) NOT NULL,
    alert_type VARCHAR(255) NOT NULL,
    chain VARCHAR(50),
    alert_data JSONB NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for agent_awareness_alerts
CREATE INDEX IF NOT EXISTS idx_awareness_opportunity ON agent_awareness_alerts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_awareness_agent ON agent_awareness_alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_awareness_type ON agent_awareness_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_awareness_chain ON agent_awareness_alerts(chain);
CREATE INDEX IF NOT EXISTS idx_awareness_created ON agent_awareness_alerts(created_at);

-- Flash Loan Provider Selection Tracking
-- ========================================
CREATE TABLE IF NOT EXISTS flashloan_selections (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    agent_id VARCHAR(255) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    token VARCHAR(100) NOT NULL,
    selected_provider VARCHAR(255) NOT NULL,
    provider_capacity DECIMAL(20, 2),
    fee_percentage DECIMAL(8, 6),
    agent_reward DECIMAL(20, 2) DEFAULT 0,
    is_free_provider BOOLEAN DEFAULT FALSE,
    selection_reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for flashloan_selections
CREATE INDEX IF NOT EXISTS idx_flashloan_opportunity ON flashloan_selections(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_flashloan_agent ON flashloan_selections(agent_id);
CREATE INDEX IF NOT EXISTS idx_flashloan_chain ON flashloan_selections(chain);
CREATE INDEX IF NOT EXISTS idx_flashloan_provider ON flashloan_selections(selected_provider);
CREATE INDEX IF NOT EXISTS idx_flashloan_created ON flashloan_selections(created_at);

-- Agent Penalties Tracking
-- ========================================
CREATE TABLE IF NOT EXISTS agent_penalties (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255),
    agent_id VARCHAR(255) NOT NULL,
    penalty_type VARCHAR(255) NOT NULL,
    penalty_reason TEXT NOT NULL,
    expected_profit DECIMAL(20, 8),
    actual_profit DECIMAL(20, 8),
    profit_difference_percentage DECIMAL(8, 4),
    severity VARCHAR(50) DEFAULT 'MEDIUM',
    learning_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for agent_penalties
CREATE INDEX IF NOT EXISTS idx_penalties_agent ON agent_penalties(agent_id);
CREATE INDEX IF NOT EXISTS idx_penalties_type ON agent_penalties(penalty_type);
CREATE INDEX IF NOT EXISTS idx_penalties_created ON agent_penalties(created_at);

-- Human Escalations Table
-- ========================================
CREATE TABLE IF NOT EXISTS human_escalations (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255) UNIQUE NOT NULL,
    opportunity_id VARCHAR(255),
    alert_type VARCHAR(255),
    chain VARCHAR(50),
    priority VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    reason TEXT NOT NULL,
    impact TEXT,
    recent_similar_count INTEGER DEFAULT 0,
    agent_recommendation TEXT,
    context_data JSONB DEFAULT '{}',
    pattern_data JSONB DEFAULT '{}',
    recommendations_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'
    response_target TIMESTAMP,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for human_escalations
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON human_escalations(priority);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON human_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_chain ON human_escalations(chain);
CREATE INDEX IF NOT EXISTS idx_escalations_created ON human_escalations(created_at);

-- Frontend Notifications Table
-- ========================================
CREATE TABLE IF NOT EXISTS frontend_notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_status VARCHAR(50) DEFAULT 'UNREAD', -- 'UNREAD', 'READ', 'DISMISSED'
    user_id VARCHAR(255) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for frontend_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_type ON frontend_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON frontend_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON frontend_notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON frontend_notifications(created_at);

-- Critical Alert Queue Table
-- ========================================
CREATE TABLE IF NOT EXISTS critical_alert_queue (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255),
    alert_message TEXT NOT NULL,
    delivery_method VARCHAR(100) NOT NULL, -- 'EMAIL', 'SMS', 'TELEGRAM', 'WEBHOOK'
    recipient VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED', 'DELIVERED'
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for critical_alert_queue
CREATE INDEX IF NOT EXISTS idx_alert_queue_status ON critical_alert_queue(status);
CREATE INDEX IF NOT EXISTS idx_alert_queue_escalation ON critical_alert_queue(escalation_id);
CREATE INDEX IF NOT EXISTS idx_alert_queue_method ON critical_alert_queue(delivery_method);
CREATE INDEX IF NOT EXISTS idx_alert_queue_created ON critical_alert_queue(created_at);

-- Alert Thresholds Table
-- ========================================
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id SERIAL PRIMARY KEY,
    threshold_name VARCHAR(255) UNIQUE NOT NULL,
    threshold_type VARCHAR(100) NOT NULL, -- 'fallback_rate', 'error_rate', 'latency', etc.
    chain VARCHAR(50), -- NULL for global thresholds
    warning_threshold DECIMAL(10, 4) NOT NULL,
    critical_threshold DECIMAL(10, 4) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    notify_channels JSONB DEFAULT '["frontend"]', -- Array of notification channels
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for alert_thresholds
CREATE INDEX IF NOT EXISTS idx_thresholds_name ON alert_thresholds(threshold_name);
CREATE INDEX IF NOT EXISTS idx_thresholds_type ON alert_thresholds(threshold_type);
CREATE INDEX IF NOT EXISTS idx_thresholds_chain ON alert_thresholds(chain);
CREATE INDEX IF NOT EXISTS idx_thresholds_enabled ON alert_thresholds(enabled);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for telegram_notification_queue
CREATE INDEX IF NOT EXISTS idx_telegram_queue_status ON telegram_notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_telegram_queue_escalation ON telegram_notification_queue(escalation_id);
CREATE INDEX IF NOT EXISTS idx_telegram_queue_created ON telegram_notification_queue(created_at);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for email_send_queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_send_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_escalation ON email_send_queue(escalation_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_send_queue(recipient);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_send_queue(created_at);

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for capability_requests
CREATE INDEX IF NOT EXISTS idx_capability_requests_status ON capability_requests(status);
CREATE INDEX IF NOT EXISTS idx_capability_requests_agent ON capability_requests(requesting_agent_id);
CREATE INDEX IF NOT EXISTS idx_capability_requests_created ON capability_requests(created_at);

-- Syndicate Capabilities Table (for existing capability tracking)
-- ===============================================================
CREATE TABLE IF NOT EXISTS syndicate_capabilities (
    id SERIAL PRIMARY KEY,
    capability_key VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'pending_approval', 'pending_enhancement', 'disabled'
    requested_by VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for syndicate_capabilities
CREATE INDEX IF NOT EXISTS idx_syndicate_caps_key ON syndicate_capabilities(capability_key);
CREATE INDEX IF NOT EXISTS idx_syndicate_caps_status ON syndicate_capabilities(status);
CREATE INDEX IF NOT EXISTS idx_syndicate_caps_enabled ON syndicate_capabilities(is_enabled);

-- Performance Views
-- ===============================================================

-- Gas Price Performance View
CREATE OR REPLACE VIEW gas_price_performance AS
SELECT 
    chain,
    DATE(created_at) as date,
    COUNT(*) as total_operations,
    AVG(api_duration_ms) as avg_api_duration,
    AVG(total_duration_ms) as avg_total_duration,
    SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END) as fallback_count,
    ROUND((SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2) as fallback_percentage
FROM gas_price_operations 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY chain, DATE(created_at)
ORDER BY date DESC, chain;

-- Flashloan Provider Performance View
CREATE OR REPLACE VIEW flashloan_provider_performance AS
SELECT 
    selected_provider,
    chain,
    token,
    COUNT(*) as selection_count,
    AVG(fee_percentage) as avg_fee,
    SUM(agent_reward) as total_rewards,
    SUM(CASE WHEN is_free_provider THEN 1 ELSE 0 END) as free_selections,
    AVG(provider_capacity) as avg_capacity
FROM flashloan_selections 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY selected_provider, chain, token
ORDER BY selection_count DESC;

-- Agent Awareness Summary View
CREATE OR REPLACE VIEW agent_awareness_summary AS
SELECT 
    agent_id,
    alert_type,
    chain,
    COUNT(*) as alert_count,
    SUM(CASE WHEN resolved THEN 1 ELSE 0 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time,
    MAX(created_at) as last_alert
FROM agent_awareness_alerts 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY agent_id, alert_type, chain
ORDER BY alert_count DESC;

-- Human Escalation Summary View
CREATE OR REPLACE VIEW human_escalation_summary AS
SELECT 
    priority,
    chain,
    alert_type,
    COUNT(*) as escalation_count,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time,
    MIN(created_at) as first_escalation,
    MAX(created_at) as last_escalation
FROM human_escalations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY priority, chain, alert_type
ORDER BY escalation_count DESC;

-- Alert Threshold Status View
CREATE OR REPLACE VIEW alert_threshold_status AS
SELECT 
    at.threshold_name,
    at.threshold_type,
    at.chain,
    at.warning_threshold,
    at.critical_threshold,
    at.enabled,
    CASE 
        WHEN gpo.fallback_percentage IS NOT NULL THEN gpo.fallback_percentage
        WHEN aaa.alert_rate IS NOT NULL THEN aaa.alert_rate
        ELSE 0
    END as current_value,
    CASE 
        WHEN gpo.fallback_percentage >= at.critical_threshold OR aaa.alert_rate >= at.critical_threshold THEN 'CRITICAL'
        WHEN gpo.fallback_percentage >= at.warning_threshold OR aaa.alert_rate >= at.warning_threshold THEN 'WARNING'
        ELSE 'OK'
    END as status
FROM alert_thresholds at
LEFT JOIN (
    SELECT chain, 
           ROUND((SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2) as fallback_percentage
    FROM gas_price_operations 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY chain
) gpo ON at.chain = gpo.chain AND at.threshold_type = 'fallback_rate'
LEFT JOIN (
    SELECT chain, 
           ROUND((COUNT(*)::decimal / 60), 2) as alert_rate -- alerts per minute
    FROM agent_awareness_alerts 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY chain
) aaa ON at.chain = aaa.chain AND at.threshold_type = 'error_rate';

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

-- Comments
-- ========================================
COMMENT ON TABLE gas_price_operations IS 'Tracks gas price API calls with timing and fallback data';
COMMENT ON TABLE agent_awareness_alerts IS 'Agent self-awareness alerts and notifications';
COMMENT ON TABLE flashloan_selections IS 'Flash loan provider selection tracking with rewards';
COMMENT ON TABLE agent_penalties IS 'Agent penalty tracking for learning and improvement';
COMMENT ON TABLE human_escalations IS 'Human-in-the-loop escalations from agents';
COMMENT ON TABLE frontend_notifications IS 'Real-time notifications for web frontend';
COMMENT ON TABLE critical_alert_queue IS 'Queue for email/SMS critical alerts';
COMMENT ON TABLE alert_thresholds IS 'Configurable alert thresholds for automated monitoring';
COMMENT ON TABLE telegram_notification_queue IS 'Queue for Telegram bot notifications';
COMMENT ON TABLE email_send_queue IS 'Queue for Gmail notifications';
COMMENT ON TABLE capability_requests IS 'LLM-powered capability creation requests with human approval workflow';
COMMENT ON TABLE syndicate_capabilities IS 'Registry of existing syndicate capabilities';
COMMENT ON VIEW gas_price_performance IS 'Daily performance metrics for gas price operations by chain';
COMMENT ON VIEW flashloan_provider_performance IS 'Provider performance and selection statistics';
COMMENT ON VIEW agent_awareness_summary IS 'Agent awareness alert summary and resolution tracking';
COMMENT ON VIEW human_escalation_summary IS 'Human escalation metrics and resolution tracking';
COMMENT ON VIEW alert_threshold_status IS 'Real-time alert threshold monitoring and status';
