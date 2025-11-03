-- ============================================================================
-- AI FLASH LOAN ARBITRAGE SYNDICATE - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- Production-ready PostgreSQL schema for the entire syndicate system
-- Includes all tables for agents, arbitrage, quantum states, memory, and more
-- ============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- ============================================================================
-- CORE SYSTEM TABLES
-- ============================================================================

-- Master orchestrator state
CREATE TABLE IF NOT EXISTS master_orchestrator_state (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL UNIQUE,
    system_start_time TIMESTAMPTZ NOT NULL,
    initialization_complete BOOLEAN DEFAULT false,
    system_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    connected_systems JSONB NOT NULL DEFAULT '{}'::jsonb,
    performance_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orchestrator_heartbeat ON master_orchestrator_state(last_heartbeat DESC);

-- ============================================================================
-- AGENT MANAGEMENT TABLES
-- ============================================================================

-- Main agent registry
CREATE TABLE IF NOT EXISTS syndicate_agents (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    orchestrator_id VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    agent_name VARCHAR(255),
    specialization VARCHAR(100) NOT NULL,
    character_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'INACTIVE',
    is_active BOOLEAN DEFAULT false,
    chain_assignment VARCHAR(50),
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    quantum_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    collaboration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    background_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, orchestrator_id)
);

CREATE INDEX idx_agents_active ON syndicate_agents(is_active, status);
CREATE INDEX idx_agents_specialization ON syndicate_agents(specialization);
CREATE INDEX idx_agents_orchestrator ON syndicate_agents(orchestrator_id);

-- Agent memory storage with vector support
CREATE TABLE IF NOT EXISTS agent_memory (
    id SERIAL PRIMARY KEY,
    memory_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    agent_id VARCHAR(255) NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    memory_key VARCHAR(255),
    memory_content TEXT NOT NULL,
    memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    embeddings FLOAT[] DEFAULT NULL, -- For vector similarity search
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NULL,
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE CASCADE
);

CREATE INDEX idx_memory_agent ON agent_memory(agent_id);
CREATE INDEX idx_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_memory_key ON agent_memory(memory_key);
CREATE INDEX idx_memory_importance ON agent_memory(importance_score DESC);
CREATE INDEX idx_memory_expires ON agent_memory(expires_at) WHERE expires_at IS NOT NULL;

-- Agent complexity and cognitive cliff protection
CREATE TABLE IF NOT EXISTS agent_complexity_states (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    processing_mode VARCHAR(50) DEFAULT 'neural',
    cliff_risk_level DECIMAL(3,2) DEFAULT 0.0,
    emergency_mode BOOLEAN DEFAULT false,
    complexity_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_assessment TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(orchestrator_id, agent_id),
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE CASCADE
);

CREATE INDEX idx_complexity_risk ON agent_complexity_states(cliff_risk_level DESC);
CREATE INDEX idx_complexity_emergency ON agent_complexity_states(emergency_mode) WHERE emergency_mode = true;

-- LLM Agent specific state
CREATE TABLE IF NOT EXISTS llm_agent_complexity_state (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    agent_name VARCHAR(255),
    current_processing_mode VARCHAR(50) DEFAULT 'neural',
    cliff_protection_active BOOLEAN DEFAULT true,
    complexity_monitoring_enabled BOOLEAN DEFAULT true,
    quantum_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    cognitive_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    world_model_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_ecosystem_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    complexity_decision_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    emergency_events JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE CASCADE
);

-- ============================================================================
-- ARBITRAGE AND TRADING TABLES
-- ============================================================================

-- Arbitrage opportunities detection
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(255) NOT NULL UNIQUE,
    detected_by_agent VARCHAR(255),
    chain VARCHAR(50) NOT NULL,
    token_pair VARCHAR(100) NOT NULL,
    buy_dex VARCHAR(50) NOT NULL,
    sell_dex VARCHAR(50) NOT NULL,
    buy_price DECIMAL(30,18) NOT NULL,
    sell_price DECIMAL(30,18) NOT NULL,
    price_discrepancy DECIMAL(10,4) NOT NULL,
    estimated_profit_usd DECIMAL(20,2),
    route_data JSONB NOT NULL,
    market_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'DETECTED',
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    execution_window_ms INTEGER,
    FOREIGN KEY (detected_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

CREATE INDEX idx_opportunities_status ON arbitrage_opportunities(status);
CREATE INDEX idx_opportunities_chain ON arbitrage_opportunities(chain);
CREATE INDEX idx_opportunities_profit ON arbitrage_opportunities(estimated_profit_usd DESC);
CREATE INDEX idx_opportunities_detected ON arbitrage_opportunities(detected_at DESC);
CREATE INDEX idx_opportunities_agent ON arbitrage_opportunities(detected_by_agent);

-- Arbitrage execution tracking
CREATE TABLE IF NOT EXISTS arbitrage_executions (
    id SERIAL PRIMARY KEY,
    execution_id UUID DEFAULT uuid_generate_v4() UNIQUE,
    opportunity_id VARCHAR(255) NOT NULL,
    executed_by_agent VARCHAR(255),
    transaction_hash VARCHAR(66) UNIQUE,
    tx_hash VARCHAR(66), -- Alias for compatibility
    chain VARCHAR(50) NOT NULL,
    execution_status VARCHAR(50) DEFAULT 'PENDING',
    gas_price DECIMAL(20,9),
    gas_used INTEGER,
    gas_cost_usd DECIMAL(10,2),
    actual_profit_usd DECIMAL(20,2),
    profit_actual DECIMAL(20,2), -- Alias for compatibility
    execution_time INTEGER, -- milliseconds
    slippage_percent DECIMAL(5,2),
    mev_protection_used BOOLEAN DEFAULT false,
    execution_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (opportunity_id) REFERENCES arbitrage_opportunities(opportunity_id),
    FOREIGN KEY (executed_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

CREATE INDEX idx_executions_status ON arbitrage_executions(execution_status);
CREATE INDEX idx_executions_chain ON arbitrage_executions(chain);
CREATE INDEX idx_executions_profit ON arbitrage_executions(actual_profit_usd DESC);
CREATE INDEX idx_executions_time ON arbitrage_executions(executed_at DESC);
CREATE INDEX idx_executions_hash ON arbitrage_executions(transaction_hash);

-- Pool pricing data
CREATE TABLE IF NOT EXISTS pool_prices (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(42) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    dex VARCHAR(50) NOT NULL,
    token0_address VARCHAR(42) NOT NULL,
    token1_address VARCHAR(42) NOT NULL,
    token0_symbol VARCHAR(20),
    token1_symbol VARCHAR(20),
    price0 DECIMAL(30,18) NOT NULL,
    price1 DECIMAL(30,18) NOT NULL,
    liquidity_usd DECIMAL(20,2),
    volume_24h_usd DECIMAL(20,2),
    fee_tier DECIMAL(10,6),
    last_block_number BIGINT,
    last_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pool_address, chain)
);

CREATE INDEX idx_pool_prices_chain_dex ON pool_prices(chain, dex);
CREATE INDEX idx_pool_prices_tokens ON pool_prices(token0_address, token1_address);
CREATE INDEX idx_pool_prices_liquidity ON pool_prices(liquidity_usd DESC);
CREATE INDEX idx_pool_prices_update ON pool_prices(last_update DESC);

-- Current pool prices view (latest prices only)
CREATE TABLE IF NOT EXISTS current_pool_prices (
    pool_address VARCHAR(42) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    dex VARCHAR(50) NOT NULL,
    token0_address VARCHAR(42) NOT NULL,
    token1_address VARCHAR(42) NOT NULL,
    token0_symbol VARCHAR(20),
    token1_symbol VARCHAR(20),
    price0 DECIMAL(30,18) NOT NULL,
    price1 DECIMAL(30,18) NOT NULL,
    liquidity_usd DECIMAL(20,2),
    volume_24h_usd DECIMAL(20,2),
    fee DECIMAL(10,6),
    last_update TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pool_address, chain)
);

-- ============================================================================
-- COMPETITOR ANALYSIS TABLES
-- ============================================================================

-- Competitor bot tracking
CREATE TABLE IF NOT EXISTS competitor_bots (
    bot_address VARCHAR(42) PRIMARY KEY,
    contract_address VARCHAR(42),
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    total_profit_usd DECIMAL(20,2) DEFAULT 0,
    average_gas_premium DECIMAL(10,2),
    preferred_chains TEXT[],
    preferred_dexes TEXT[],
    strategy_patterns JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    threat_level VARCHAR(20) DEFAULT 'MEDIUM'
);

CREATE INDEX idx_competitor_active ON competitor_bots(is_active, threat_level);
CREATE INDEX idx_competitor_profit ON competitor_bots(total_profit_usd DESC);

-- Competitor transaction analysis
CREATE TABLE IF NOT EXISTS competitor_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE,
    block_number INTEGER,
    chain VARCHAR(50),
    bot_address VARCHAR(42),
    transaction_type VARCHAR(50),
    tokens_involved TEXT[],
    profit_usd DECIMAL(20,2),
    gas_price DECIMAL(20,9),
    gas_used INTEGER,
    miner_tip DECIMAL(20,9),
    execution_time_ms INTEGER,
    strategy_identified VARCHAR(100),
    opportunity_window_ms INTEGER,
    transaction_data JSONB,
    decoded_data JSONB,
    timestamp TIMESTAMPTZ,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (bot_address) REFERENCES competitor_bots(bot_address)
);

CREATE INDEX idx_competitor_tx_time ON competitor_transactions(timestamp DESC);
CREATE INDEX idx_competitor_tx_profit ON competitor_transactions(profit_usd DESC);
CREATE INDEX idx_competitor_tx_bot ON competitor_transactions(bot_address);

-- ============================================================================
-- LEARNING AND EVOLUTION TABLES
-- ============================================================================

-- AlphaGnome evolutionary system state
CREATE TABLE IF NOT EXISTS alphagnome_state_persistence (
    id SERIAL PRIMARY KEY,
    generation INTEGER NOT NULL,
    best_fitness DECIMAL(20,10),
    population_size INTEGER,
    state_data JSONB NOT NULL,
    learning_metrics JSONB,
    backup_reason VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alphagnome_generation ON alphagnome_state_persistence(generation DESC);

-- AlphaGnome learning knowledge base
CREATE TABLE IF NOT EXISTS alphagnome_learning (
    id SERIAL PRIMARY KEY,
    generation INTEGER,
    learning_type VARCHAR(50),
    knowledge_key VARCHAR(255) UNIQUE,
    knowledge_data JSONB NOT NULL,
    success_rate DECIMAL(5,2),
    application_count INTEGER DEFAULT 0,
    last_applied TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alphagnome_learning_type ON alphagnome_learning(learning_type);
CREATE INDEX idx_alphagnome_learning_success ON alphagnome_learning(success_rate DESC);

-- Historical analysis for AlphaGnome
CREATE TABLE IF NOT EXISTS alphagnome_historical_analysis (
    id SERIAL PRIMARY KEY,
    analysis_id VARCHAR(100) UNIQUE NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    chain VARCHAR(50),
    timeframe_start TIMESTAMPTZ,
    timeframe_end TIMESTAMPTZ,
    patterns_discovered JSONB NOT NULL DEFAULT '[]'::jsonb,
    opportunities_found INTEGER DEFAULT 0,
    total_potential_profit DECIMAL(20,2) DEFAULT 0,
    analysis_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evolution log for genetic algorithms
CREATE TABLE IF NOT EXISTS evolution_log (
    id SERIAL PRIMARY KEY,
    generation INT NOT NULL,
    fitness_scores JSONB NOT NULL,
    population_stats JSONB NOT NULL,
    mutations_applied JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Mutation strategies tracking
CREATE TABLE IF NOT EXISTS mutation_strategies (
    id SERIAL PRIMARY KEY,
    generation INT NOT NULL,
    strategy_type VARCHAR(100),
    success_rate DECIMAL(5,2),
    impact_score DECIMAL(5,2),
    usage_count INT DEFAULT 0,
    last_used TIMESTAMPTZ DEFAULT NOW()
);

-- Battlefield evaluations for genetic competition
CREATE TABLE IF NOT EXISTS battlefield_evaluations (
    battle_id VARCHAR(255) PRIMARY KEY,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    chain VARCHAR(50) NOT NULL,
    winner_genotype JSONB NOT NULL,
    losers JSONB NOT NULL DEFAULT '[]'::jsonb,
    profit_achieved DECIMAL(20,10),
    gas_efficiency DECIMAL(10,4),
    execution_speed_ms INTEGER,
    battle_conditions JSONB NOT NULL,
    evaluation_metrics JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battlefield_profit ON battlefield_evaluations(profit_achieved DESC);
CREATE INDEX idx_battlefield_chain ON battlefield_evaluations(chain);

-- Mutation knowledge base
CREATE TABLE IF NOT EXISTS mutation_knowledge (
    gene_key VARCHAR(255) PRIMARY KEY,
    successful_mutations JSONB NOT NULL,
    failed_mutations JSONB NOT NULL DEFAULT '[]'::jsonb,
    mutation_success_rate DECIMAL(5,2),
    optimal_ranges JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Profit generating traits
CREATE TABLE IF NOT EXISTS profit_generating_traits (
    gene_key VARCHAR(255) PRIMARY KEY,
    profit_correlations JSONB NOT NULL,
    average_profit_impact DECIMAL(20,10),
    occurrence_frequency DECIMAL(5,2),
    chain_specific_performance JSONB,
    last_analyzed TIMESTAMPTZ DEFAULT NOW()
);

-- Superior contracts discovered
CREATE TABLE IF NOT EXISTS superior_contracts (
    contract_address VARCHAR(42) PRIMARY KEY,
    efficiency_gains DECIMAL(10,2) NOT NULL,
    discovery_context JSONB NOT NULL,
    implementation_code TEXT,
    gas_optimization_level INTEGER,
    discovered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- QUANTUM AND WORLD MODEL TABLES
-- ============================================================================

-- Quantum state tracking
CREATE TABLE IF NOT EXISTS syndicate_quantum_state (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL UNIQUE,
    quantum_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    entangled_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
    superposition_states JSONB NOT NULL DEFAULT '{}'::jsonb,
    coherence_level DECIMAL(3,2) DEFAULT 1.0,
    decoherence_events INTEGER DEFAULT 0,
    last_measurement TIMESTAMPTZ DEFAULT NOW(),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- World model predictions
CREATE TABLE IF NOT EXISTS world_model_predictions (
    id SERIAL PRIMARY KEY,
    prediction_time TIMESTAMPTZ DEFAULT NOW(),
    category VARCHAR(50), -- price_movement, volume_spike, etc.
    target_entity VARCHAR(255), -- token address, pool, etc.
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    time_horizon_minutes INTEGER,
    was_accurate BOOLEAN,
    actual_outcome JSONB,
    accuracy_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ
);

CREATE INDEX idx_world_model_category ON world_model_predictions(category);
CREATE INDEX idx_world_model_accurate ON world_model_predictions(was_accurate, category);
CREATE INDEX idx_world_model_time ON world_model_predictions(prediction_time DESC);

-- Quantum graph neural network state
CREATE TABLE IF NOT EXISTS quantum_graph_state (
    id SERIAL PRIMARY KEY,
    graph_id VARCHAR(255) UNIQUE NOT NULL,
    node_count INTEGER NOT NULL,
    edge_count INTEGER NOT NULL,
    quantum_features JSONB NOT NULL,
    adjacency_matrix FLOAT[][],
    node_embeddings JSONB,
    graph_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FORMAL VERIFICATION AND MATHEMATICAL PROOF TABLES
-- ============================================================================

-- Formal theorems discovered and proved
CREATE TABLE IF NOT EXISTS formal_theorems (
    id SERIAL PRIMARY KEY,
    theorem_id VARCHAR(255) UNIQUE NOT NULL,
    theorem_statement TEXT NOT NULL,
    lean_specification TEXT,
    proof_status VARCHAR(50) DEFAULT 'UNPROVEN',
    proof_lean_code TEXT,
    proof_validation_result JSONB,
    discovered_by_agent VARCHAR(255),
    mathematical_domain VARCHAR(100),
    theorem_type VARCHAR(100),
    validation_confidence DECIMAL(3,2),
    computation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    proven_at TIMESTAMPTZ,
    FOREIGN KEY (discovered_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

CREATE INDEX idx_theorems_status ON formal_theorems(proof_status);
CREATE INDEX idx_theorems_domain ON formal_theorems(mathematical_domain);

-- Autoformalized theorems
CREATE TABLE IF NOT EXISTS autoformalized_theorems (
    id SERIAL PRIMARY KEY,
    theorem_name VARCHAR(255) UNIQUE NOT NULL,
    theorem_type VARCHAR(100),
    lean_code TEXT NOT NULL,
    translation_quality DECIMAL(3,2),
    mathematical_rigor DECIMAL(3,2),
    translation_time_ms INTEGER,
    ai_generated BOOLEAN DEFAULT false,
    discovered_by_agent VARCHAR(255),
    mathematical_domain VARCHAR(100),
    validation_status VARCHAR(50),
    validation_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (discovered_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

-- ============================================================================
-- ELITE SYSTEM MONITORING TABLES
-- ============================================================================

-- Elite system metrics
CREATE TABLE IF NOT EXISTS elite_system_metrics (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL,
    system_name VARCHAR(100) NOT NULL,
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'inactive',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(orchestrator_id, system_name)
);

CREATE INDEX idx_elite_metrics_system ON elite_system_metrics(system_name);
CREATE INDEX idx_elite_metrics_status ON elite_system_metrics(status);

-- Elite system status tracking
CREATE TABLE IF NOT EXISTS elite_system_status (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL,
    operational_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
    critical_failures JSONB NOT NULL DEFAULT '[]'::jsonb,
    performance_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Circuit breaker state
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL UNIQUE,
    breaker_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    trigger_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Elite agent performance with complexity
CREATE TABLE IF NOT EXISTS elite_agent_complexity_performance (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    average_complexity_handled DECIMAL(10,2),
    cognitive_cliff_encounters INTEGER DEFAULT 0,
    symbolic_fallback_usage INTEGER DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    profit_generated DECIMAL(20,2),
    max_complexity_threshold DECIMAL(10,2),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(orchestrator_id, agent_id),
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE CASCADE
);

-- Syndicate cognitive cliff protection state
CREATE TABLE IF NOT EXISTS syndicate_cognitive_cliff_state (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL UNIQUE,
    cognitive_cliff_protection JSONB NOT NULL,
    elite_system_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    global_processing_mode VARCHAR(50) DEFAULT 'neural',
    emergency_protocols_active BOOLEAN DEFAULT false,
    active_agents_count INTEGER DEFAULT 0,
    last_global_complexity_check TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE AND METRICS TABLES
-- ============================================================================

-- Syndicate performance metrics
CREATE TABLE IF NOT EXISTS syndicate_metrics (
    id SERIAL PRIMARY KEY,
    orchestrator_id VARCHAR(255) NOT NULL,
    metrics_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_syndicate_metrics_time ON syndicate_metrics(timestamp DESC);

-- Learning system performance
CREATE TABLE IF NOT EXISTS learning_system_performance (
    id SERIAL PRIMARY KEY,
    system_id VARCHAR(255) UNIQUE NOT NULL,
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    learning_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    adaptation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    evolution_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Gas price operations tracking
CREATE TABLE IF NOT EXISTS gas_price_operations (
    id SERIAL PRIMARY KEY,
    operation_id UUID DEFAULT uuid_generate_v4(),
    chain VARCHAR(50) NOT NULL,
    operation_type VARCHAR(50),
    base_fee DECIMAL(20,9),
    priority_fee DECIMAL(20,9),
    total_gas_price DECIMAL(20,9),
    estimation_method VARCHAR(50),
    accuracy_score DECIMAL(3,2),
    total_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gas_operations_chain ON gas_price_operations(chain);
CREATE INDEX idx_gas_operations_time ON gas_price_operations(created_at DESC);

-- Agent awareness alerts
CREATE TABLE IF NOT EXISTS agent_awareness_alerts (
    id SERIAL PRIMARY KEY,
    alert_id UUID DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255),
    opportunity_id VARCHAR(255),
    alert_type VARCHAR(50),
    alert_level VARCHAR(20),
    alert_data JSONB NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE CASCADE
);

CREATE INDEX idx_awareness_agent ON agent_awareness_alerts(agent_id);
CREATE INDEX idx_awareness_level ON agent_awareness_alerts(alert_level);

-- ============================================================================
-- MEMORY AND CACHE TABLES
-- ============================================================================

-- Memory cache for fast access
CREATE TABLE IF NOT EXISTS memory_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_data JSONB NOT NULL,
    memory_ids UUID[],
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cache_expires ON memory_cache(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_cache_hits ON memory_cache(hit_count DESC);

-- Shared memory across agents
CREATE TABLE IF NOT EXISTS shared_memory (
    id SERIAL PRIMARY KEY,
    memory_key VARCHAR(255) UNIQUE NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    memory_data JSONB NOT NULL,
    shared_by_agents TEXT[],
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    consensus_score DECIMAL(3,2) DEFAULT 0.0,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shared_memory_type ON shared_memory(memory_type);
CREATE INDEX idx_shared_memory_importance ON shared_memory(importance_score DESC);

-- Creativity value learning
CREATE TABLE IF NOT EXISTS creativity_learning_metrics (
    id SERIAL PRIMARY KEY,
    metric_key VARCHAR(255) UNIQUE NOT NULL,
    metric_data JSONB NOT NULL,
    learning_progress DECIMAL(5,2),
    creativity_score DECIMAL(3,2),
    novel_solutions_count INTEGER DEFAULT 0,
    last_breakthrough TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PREDICTION AND JUDGMENT TABLES
-- ============================================================================

-- Prediction cache for various systems
CREATE TABLE IF NOT EXISTS prediction_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    prediction_type VARCHAR(50),
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prediction_type ON prediction_cache(prediction_type);
CREATE INDEX idx_prediction_valid ON prediction_cache(valid_until) WHERE valid_until IS NOT NULL;

-- Judge validation results
CREATE TABLE IF NOT EXISTS judge_validations (
    id SERIAL PRIMARY KEY,
    validation_id UUID DEFAULT uuid_generate_v4(),
    judge_type VARCHAR(50) NOT NULL,
    target_entity VARCHAR(255),
    validation_result JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    improvements_suggested JSONB,
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_judge_type ON judge_validations(judge_type);
CREATE INDEX idx_judge_confidence ON judge_validations(confidence_score DESC);

-- ============================================================================
-- DEMO AND TESTING TABLES
-- ============================================================================

-- Demo scenarios for testing
CREATE TABLE IF NOT EXISTS demo_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(100) UNIQUE NOT NULL,
    chain VARCHAR(50),
    token_pair VARCHAR(100),
    dex_a VARCHAR(50),
    dex_b VARCHAR(50),
    price_discrepancy DECIMAL(10,4),
    estimated_profit DECIMAL(20,2),
    gas_cost DECIMAL(10,2),
    net_profit DECIMAL(20,2),
    recommended_action VARCHAR(50),
    scenario_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE GRAPH TABLES
-- ============================================================================

-- Core Knowledge Graph nodes
CREATE TABLE IF NOT EXISTS kg_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(50) NOT NULL,
    concept_embedding FLOAT[] NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    consolidation_ts TIMESTAMPTZ DEFAULT NOW(),
    last_retrieved_ts TIMESTAMPTZ DEFAULT NOW(),
    created_by_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (created_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

CREATE INDEX idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX idx_kg_nodes_confidence ON kg_nodes(confidence_score DESC);
CREATE INDEX idx_kg_nodes_retrieved ON kg_nodes(last_retrieved_ts DESC);

-- Knowledge Graph relationships
CREATE TABLE IF NOT EXISTS kg_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID NOT NULL,
    target_node_id UUID NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    provenance_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (source_node_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE
);

CREATE INDEX idx_kg_rel_source ON kg_relationships(source_node_id);
CREATE INDEX idx_kg_rel_target ON kg_relationships(target_node_id);
CREATE INDEX idx_kg_rel_type ON kg_relationships(relationship_type);

-- Quantum-inspired entanglements
CREATE TABLE IF NOT EXISTS kg_entanglements (
    entanglement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_a_id UUID NOT NULL,
    node_b_id UUID NOT NULL,
    entanglement_strength DECIMAL(3,2) NOT NULL,
    calculation_method VARCHAR(50),
    evidence_trajectories UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (node_a_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    FOREIGN KEY (node_b_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    UNIQUE(node_a_id, node_b_id)
);

CREATE INDEX idx_kg_entangle_strength ON kg_entanglements(entanglement_strength DESC);

-- Hyper-relational qualifiers
CREATE TABLE IF NOT EXISTS kg_qualifiers (
    qualifier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL,
    qualifier_key VARCHAR(100) NOT NULL,
    qualifier_value TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (relationship_id) REFERENCES kg_relationships(relationship_id) ON DELETE CASCADE
);

CREATE INDEX idx_kg_qual_rel ON kg_qualifiers(relationship_id);
CREATE INDEX idx_kg_qual_key ON kg_qualifiers(qualifier_key);

-- ============================================================================
-- AUDIT AND LOGGING TABLES
-- ============================================================================

-- System event log
CREATE TABLE IF NOT EXISTS system_events (
    id SERIAL PRIMARY KEY,
    event_id UUID DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(255),
    event_data JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON system_events(event_type);
CREATE INDEX idx_events_severity ON system_events(severity);
CREATE INDEX idx_events_time ON system_events(created_at DESC);

-- Transaction audit trail
CREATE TABLE IF NOT EXISTS transaction_audit (
    id SERIAL PRIMARY KEY,
    audit_id UUID DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(66),
    agent_id VARCHAR(255),
    action_type VARCHAR(50),
    chain VARCHAR(50),
    audit_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (agent_id) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_hash ON transaction_audit(transaction_hash);
CREATE INDEX idx_audit_agent ON transaction_audit(agent_id);
CREATE INDEX idx_audit_time ON transaction_audit(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_syndicate_agents_updated_at BEFORE UPDATE ON syndicate_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON agent_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_complexity_states_updated_at BEFORE UPDATE ON agent_complexity_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_memory_updated_at BEFORE UPDATE ON shared_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired memories
CREATE OR REPLACE FUNCTION clean_expired_memories()
RETURNS void AS $$
BEGIN
    DELETE FROM agent_memory WHERE expires_at < NOW();
    DELETE FROM memory_cache WHERE expires_at < NOW();
    DELETE FROM prediction_cache WHERE valid_until < NOW();
END;
$$ language 'plpgsql';

-- Function to calculate agent performance score
CREATE OR REPLACE FUNCTION calculate_agent_performance_score(p_agent_id VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL;
BEGIN
    SELECT 
        COALESCE(
            (successful_executions::DECIMAL / NULLIF(total_executions, 0) * 0.4) +
            (total_profit / NULLIF(total_executions, 0) * 0.3) +
            (1.0 / NULLIF(avg_execution_time, 1) * 0.3),
            0.0
        ) INTO v_score
    FROM (
        SELECT 
            COUNT(*) as total_executions,
            COUNT(CASE WHEN ae.execution_status = 'SUCCESS' THEN 1 END) as successful_executions,
            COALESCE(SUM(ae.actual_profit_usd), 0) as total_profit,
            COALESCE(AVG(ae.execution_time), 1000) as avg_execution_time
        FROM arbitrage_executions ae
        WHERE ae.executed_by_agent = p_agent_id
    ) stats;
    
    RETURN v_score;
END;
$$ language 'plpgsql';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active agent summary view
CREATE OR REPLACE VIEW v_active_agents AS
SELECT 
    sa.agent_id,
    sa.agent_name,
    sa.specialization,
    sa.status,
    sa.chain_assignment,
    calculate_agent_performance_score(sa.agent_id) as performance_score,
    COUNT(DISTINCT ao.opportunity_id) as opportunities_detected,
    COUNT(DISTINCT ae.execution_id) as executions_completed,
    COALESCE(SUM(ae.actual_profit_usd), 0) as total_profit,
    sa.last_active
FROM syndicate_agents sa
LEFT JOIN arbitrage_opportunities ao ON sa.agent_id = ao.detected_by_agent
LEFT JOIN arbitrage_executions ae ON sa.agent_id = ae.executed_by_agent
WHERE sa.is_active = true
GROUP BY sa.agent_id;

-- Recent arbitrage performance view
CREATE OR REPLACE VIEW v_recent_arbitrage_performance AS
SELECT 
    DATE(ao.detected_at) as date,
    COUNT(DISTINCT ao.opportunity_id) as opportunities_detected,
    COUNT(DISTINCT ae.execution_id) as executions_completed,
    COUNT(DISTINCT CASE WHEN ae.execution_status = 'SUCCESS' THEN ae.execution_id END) as successful_executions,
    COALESCE(SUM(ae.actual_profit_usd), 0) as total_profit,
    COALESCE(AVG(ae.gas_cost_usd), 0) as avg_gas_cost,
    COALESCE(AVG(ae.execution_time), 0) as avg_execution_time_ms
FROM arbitrage_opportunities ao
LEFT JOIN arbitrage_executions ae ON ao.opportunity_id = ae.opportunity_id
WHERE ao.detected_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ao.detected_at)
ORDER BY date DESC;

-- ============================================================================
-- PERMISSIONS (adjust as needed for your setup)
-- ============================================================================

-- Create read-only role for monitoring
CREATE ROLE syndicate_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO syndicate_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO syndicate_readonly;

-- Create application role with full access
CREATE ROLE syndicate_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO syndicate_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO syndicate_app;

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default orchestrator state
INSERT INTO master_orchestrator_state (orchestrator_id, system_start_time, initialization_complete)
VALUES ('master-orchestrator-' || gen_random_uuid(), NOW(), false)
ON CONFLICT (orchestrator_id) DO NOTHING;

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================
-- 1. Run VACUUM ANALYZE regularly on high-traffic tables
-- 2. Monitor index usage with pg_stat_user_indexes
-- 3. Set up partitioning for time-series tables if data grows large
-- 4. Configure autovacuum settings appropriately
-- 5. Set up regular backups with pg_dump or streaming replication
-- 6. Monitor table sizes and implement data retention policies
-- ============================================================================
