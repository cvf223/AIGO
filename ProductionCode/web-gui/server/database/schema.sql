-- Database schema for Arbitrage Syndicate Web GUI

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    profit DECIMAL(20,10) NOT NULL,
    execution_time INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    route JSONB DEFAULT '[]'::jsonb,
    decision JSONB DEFAULT '{}'::jsonb,
    trigger_tx VARCHAR(66),
    execution_tx VARCHAR(66),
    competitor_tx VARCHAR(66),
    gas_used INTEGER,
    gas_price DECIMAL(20,10),
    details JSONB DEFAULT '{}'::jsonb
);

-- Agent learnings table
CREATE TABLE IF NOT EXISTS learnings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    details TEXT,
    category VARCHAR(100),
    importance INTEGER DEFAULT 5,
    source VARCHAR(255),
    insights JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    related_learnings INTEGER[],
    related_learning_titles TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Agent requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    agent_name VARCHAR(255) NOT NULL,
    agent_avatar VARCHAR(255),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    attachments JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution JSONB DEFAULT '{}'::jsonb
);

-- Agent stats table
CREATE TABLE IF NOT EXISTS agent_stats (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    total_profit DECIMAL(20,10) DEFAULT 0,
    profit_change DECIMAL(10,2) DEFAULT 0,
    success_rate INTEGER DEFAULT 0,
    success_rate_change DECIMAL(10,2) DEFAULT 0,
    opportunities_count INTEGER DEFAULT 0,
    opportunities_change INTEGER DEFAULT 0,
    avg_execution_time INTEGER DEFAULT 0,
    execution_time_change DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_agent_id ON opportunities(agent_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_timestamp ON opportunities(timestamp);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_learnings_agent_id ON learnings(agent_id);
CREATE INDEX IF NOT EXISTS idx_learnings_category ON learnings(category);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_requests_agent_id ON requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_requests_is_resolved ON requests(is_resolved);

-- Sample data for testing
INSERT INTO agents (name, type, description) VALUES 
('ArbitrumFlashSpecialist', 'searcher', 'Specializes in flash loan arbitrage on Arbitrum'),
('ETHAnalyst', 'analyst', 'Analyzes Ethereum market conditions and opportunities'),
('PolygonTrader', 'searcher', 'Identifies and executes trades on Polygon'),
('MarketAI', 'prediction', 'AI-based market prediction and analysis'),
('MEVHunter', 'searcher', 'Specialized in capturing MEV opportunities')
ON CONFLICT DO NOTHING;
