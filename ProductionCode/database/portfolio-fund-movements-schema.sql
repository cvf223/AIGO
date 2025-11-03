-- 🔐 PORTFOLIO FUND MOVEMENTS TRACKING SCHEMA
-- ============================================
-- 
-- This schema tracks all fund movements between hot wallet and cold storage
-- to maintain accurate performance metrics regardless of security transfers.

-- Portfolio Fund Movements Table
CREATE TABLE IF NOT EXISTS portfolio_fund_movements (
    id SERIAL PRIMARY KEY,
    movement_id VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('WITHDRAWAL', 'DEPOSIT', 'PROFIT_SECURING')),
    amount DECIMAL(20, 8) NOT NULL,
    description TEXT,
    cold_storage_address VARCHAR(42),
    timestamp BIGINT NOT NULL,
    block_number BIGINT,
    tx_hash VARCHAR(66),
    balance_before DECIMAL(20, 8),
    balance_after DECIMAL(20, 8),
    proof_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Trading Performance Table
CREATE TABLE IF NOT EXISTS portfolio_trading_performance (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    timestamp BIGINT NOT NULL,
    active_trading_capital DECIMAL(20, 8) NOT NULL,
    secured_profits DECIMAL(20, 8) NOT NULL,
    gross_profit DECIMAL(20, 8) NOT NULL,
    net_profit DECIMAL(20, 8) NOT NULL,
    return_on_capital DECIMAL(10, 4),
    profit_efficiency DECIMAL(20, 8),
    capital_utilization DECIMAL(10, 4),
    total_deposits DECIMAL(20, 8),
    total_withdrawals DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_fund_movements_wallet_timestamp ON portfolio_fund_movements(wallet_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fund_movements_type ON portfolio_fund_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_trading_performance_wallet_timestamp ON portfolio_trading_performance(wallet_address, timestamp DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on fund movements
CREATE TRIGGER update_fund_movements_updated_at
    BEFORE UPDATE ON portfolio_fund_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views for Easy Querying

-- Current Portfolio Status View
CREATE OR REPLACE VIEW portfolio_current_status AS
SELECT 
    wallet_address,
    SUM(CASE WHEN movement_type = 'DEPOSIT' THEN amount ELSE 0 END) as total_deposits,
    SUM(CASE WHEN movement_type IN ('WITHDRAWAL', 'PROFIT_SECURING') THEN amount ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN movement_type = 'DEPOSIT' THEN amount ELSE -amount END) as net_position,
    COUNT(*) as total_movements,
    MAX(timestamp) as last_movement_timestamp
FROM portfolio_fund_movements
GROUP BY wallet_address;

-- Performance Summary View
CREATE OR REPLACE VIEW portfolio_performance_summary AS
SELECT 
    p.wallet_address,
    p.active_trading_capital,
    p.secured_profits,
    p.gross_profit,
    p.return_on_capital,
    s.total_deposits,
    s.total_withdrawals,
    s.total_movements,
    p.timestamp,
    p.created_at
FROM portfolio_trading_performance p
JOIN portfolio_current_status s ON p.wallet_address = s.wallet_address
WHERE p.timestamp = (
    SELECT MAX(timestamp) 
    FROM portfolio_trading_performance p2 
    WHERE p2.wallet_address = p.wallet_address
);

-- Insert initial baseline data function
CREATE OR REPLACE FUNCTION initialize_portfolio_baseline(
    p_wallet_address VARCHAR(42),
    p_initial_amount DECIMAL(20, 8),
    p_description TEXT DEFAULT 'Initial capital deposit'
)
RETURNS VOID AS $$
BEGIN
    -- Insert initial deposit record
    INSERT INTO portfolio_fund_movements (
        movement_id,
        wallet_address,
        movement_type,
        amount,
        description,
        timestamp,
        balance_before,
        balance_after
    ) VALUES (
        'initial-' || p_wallet_address || '-' || EXTRACT(EPOCH FROM NOW()),
        p_wallet_address,
        'DEPOSIT',
        p_initial_amount,
        p_description,
        EXTRACT(EPOCH FROM NOW()) * 1000,
        0,
        p_initial_amount
    );
    
    -- Insert initial performance record
    INSERT INTO portfolio_trading_performance (
        wallet_address,
        timestamp,
        active_trading_capital,
        secured_profits,
        gross_profit,
        net_profit,
        return_on_capital,
        profit_efficiency,
        capital_utilization,
        total_deposits,
        total_withdrawals
    ) VALUES (
        p_wallet_address,
        EXTRACT(EPOCH FROM NOW()) * 1000,
        p_initial_amount,
        0,
        0,
        0,
        0,
        0,
        0,
        p_initial_amount,
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Capital Requests Table (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS capital_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    requesting_agent VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    current_capital DECIMAL(20, 8) NOT NULL,
    required_capital DECIMAL(20, 8) NOT NULL,
    requested_amount DECIMAL(20, 8) NOT NULL,
    opportunity_data JSONB NOT NULL,
    business_case JSONB NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    timestamp BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    approved_amount DECIMAL(20, 8) DEFAULT 0,
    approval_note TEXT,
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Capital Requests
CREATE INDEX IF NOT EXISTS idx_capital_requests_wallet_status ON capital_requests(wallet_address, status);
CREATE INDEX IF NOT EXISTS idx_capital_requests_timestamp ON capital_requests(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_capital_requests_urgency ON capital_requests(urgency_level, status);
CREATE INDEX IF NOT EXISTS idx_capital_requests_expires ON capital_requests(expires_at);

-- Trigger for capital requests updated_at
CREATE TRIGGER update_capital_requests_updated_at
    BEFORE UPDATE ON capital_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for Active Capital Requests
CREATE OR REPLACE VIEW active_capital_requests AS
SELECT 
    request_id,
    requesting_agent,
    wallet_address,
    requested_amount,
    urgency_level,
    (business_case->>'projectedROI')::DECIMAL as projected_roi,
    business_case->>'summary' as summary,
    opportunity_data->>'type' as opportunity_type,
    timestamp,
    expires_at,
    CASE 
        WHEN expires_at < EXTRACT(EPOCH FROM NOW()) * 1000 THEN 'EXPIRED'
        ELSE status 
    END as current_status
FROM capital_requests
WHERE status = 'PENDING'
ORDER BY urgency_level DESC, (business_case->>'projectedROI')::DECIMAL DESC;

-- Function to clean up expired requests
CREATE OR REPLACE FUNCTION cleanup_expired_capital_requests()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE capital_requests 
    SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'PENDING' 
    AND expires_at < EXTRACT(EPOCH FROM NOW()) * 1000;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT initialize_portfolio_baseline('0x2673a5F9468BEd33Bc7CF47d03BBC13Be2E93F5e', 10000.0, 'Initial trading capital');
-- SELECT cleanup_expired_capital_requests(); -- Clean up expired requests

COMMENT ON TABLE portfolio_fund_movements IS 'Tracks all fund movements between hot wallet and cold storage for accurate performance calculation';
COMMENT ON TABLE portfolio_trading_performance IS 'Stores calculated trading performance metrics that exclude fund movements';
COMMENT ON TABLE capital_requests IS 'Human-in-the-loop capital requests when agents need more funds for profitable opportunities';
COMMENT ON VIEW portfolio_current_status IS 'Current aggregated status of portfolio fund movements';
COMMENT ON VIEW portfolio_performance_summary IS 'Latest performance summary combining trading metrics and fund movement data';
COMMENT ON VIEW active_capital_requests IS 'Currently active capital requests requiring human attention';
