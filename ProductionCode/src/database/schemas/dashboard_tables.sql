-- ===================================================================
-- CONSTRUCTION SYNDICATE DASHBOARD TABLES
-- ===================================================================
-- Production-grade schema for web GUI dashboard data
--
-- Tables:
-- 1. system_activity_log - Real-time system events for activity feed
-- 2. notifications - Human-in-the-loop notifications
-- 3. escalations - Critical issues requiring human approval
-- 4. construction_plans - Plan tracking and statistics
-- ===================================================================

-- Activity log for dashboard recent activity feed
CREATE TABLE IF NOT EXISTS system_activity_log (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    system_name TEXT NOT NULL,
    status TEXT DEFAULT 'success',
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_activity_created (created_at DESC)
);

-- Notifications for notification badge and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_notifications_unread (read, created_at DESC)
);

-- Escalations for human-in-the-loop mailbox
CREATE TABLE IF NOT EXISTS escalations (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by TEXT,
    INDEX idx_escalations_status (status, priority DESC, created_at ASC)
);

-- Construction plans for dashboard statistics
CREATE TABLE IF NOT EXISTS construction_plans (
    id SERIAL PRIMARY KEY,
    project_id TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'pending',
    compliance_score DECIMAL(3,2),
    quantity_data JSONB,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    INDEX idx_plans_status (status, created_at DESC),
    INDEX idx_plans_recent (created_at DESC)
);

-- Helper function to log activity
CREATE OR REPLACE FUNCTION log_system_activity(
    p_event_type TEXT,
    p_system_name TEXT,
    p_status TEXT DEFAULT 'success',
    p_details JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO system_activity_log (event_type, system_name, status, details)
    VALUES (p_event_type, p_system_name, p_status, p_details);
END;
$$ LANGUAGE plpgsql;

-- Helper function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type TEXT,
    p_message TEXT,
    p_severity TEXT DEFAULT 'info'
) RETURNS INTEGER AS $$
DECLARE
    notification_id INTEGER;
BEGIN
    INSERT INTO notifications (type, message, severity)
    VALUES (p_type, p_message, p_severity)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to create escalation
CREATE OR REPLACE FUNCTION create_escalation(
    p_type TEXT,
    p_content JSONB,
    p_priority INTEGER DEFAULT 5
) RETURNS INTEGER AS $$
DECLARE
    escalation_id INTEGER;
BEGIN
    INSERT INTO escalations (type, content, priority)
    VALUES (p_type, p_content, p_priority)
    RETURNING id INTO escalation_id;
    
    RETURN escalation_id;
END;
$$ LANGUAGE plpgsql;

