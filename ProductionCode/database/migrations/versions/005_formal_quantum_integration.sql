-- 🧠 FORMAL QUANTUM INTEGRATION MIGRATION
-- ======================================
-- Adds formal verification, autoformalization, and constitutional compliance
-- to the knowledge graph and quantum state systems

-- Add formal verification columns to knowledge nodes
ALTER TABLE kg_nodes 
ADD COLUMN IF NOT EXISTS formal_proof_id UUID,
ADD COLUMN IF NOT EXISTS formal_proof_status VARCHAR(50) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS autoformalization_text TEXT,
ADD COLUMN IF NOT EXISTS autoformalization_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mathematical_certainty DECIMAL(5,4) DEFAULT 0.0;

-- Add constitutional compliance to knowledge nodes
ALTER TABLE kg_nodes
ADD COLUMN IF NOT EXISTS constitutional_compliance JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ethical_alignment_score DECIMAL(5,4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS judge_consensus JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_chain JSONB DEFAULT '[]';

-- Create formal proofs table
CREATE TABLE IF NOT EXISTS formal_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_type VARCHAR(100) NOT NULL,
    natural_language_statement TEXT NOT NULL,
    formal_specification TEXT NOT NULL,
    proof_steps JSONB NOT NULL DEFAULT '[]',
    verification_status VARCHAR(50) DEFAULT 'pending',
    proof_engine VARCHAR(100),
    certainty_level DECIMAL(5,4) DEFAULT 0.0,
    quantum_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create judge decisions table
CREATE TABLE IF NOT EXISTS judge_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_type VARCHAR(100) NOT NULL,
    judge_system VARCHAR(100) NOT NULL,
    subject_id UUID NOT NULL,
    subject_type VARCHAR(100) NOT NULL,
    decision JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    reasoning TEXT,
    quantum_consensus BOOLEAN DEFAULT FALSE,
    ghz_state_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create constitutional compliance table
CREATE TABLE IF NOT EXISTS constitutional_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    compliance_check JSONB NOT NULL,
    ethical_principles JSONB NOT NULL DEFAULT '[]',
    violations JSONB DEFAULT '[]',
    alignment_score DECIMAL(5,4) NOT NULL,
    quantum_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add quantum formal states to quantum_states table (skip - table doesn't exist yet)
-- TODO: Create quantum_states table in a previous migration first
-- ALTER TABLE quantum_states
-- ADD COLUMN IF NOT EXISTS formal_verification_state JSONB DEFAULT '{}',
-- ADD COLUMN IF NOT EXISTS judge_consensus_state JSONB DEFAULT '{}',
-- ADD COLUMN IF NOT EXISTS constitutional_state JSONB DEFAULT '{}',
-- ADD COLUMN IF NOT EXISTS autoformalization_superposition JSONB DEFAULT '[]';

-- Create quantum formal entanglements table
CREATE TABLE IF NOT EXISTS quantum_formal_entanglements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entanglement_type VARCHAR(100) NOT NULL,
    system1_id VARCHAR(255) NOT NULL,
    system2_id VARCHAR(255) NOT NULL,
    formal_correlation JSONB NOT NULL,
    bell_inequality_violation DECIMAL(5,4),
    coherence_level DECIMAL(5,4) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create autoformalization cache table
CREATE TABLE IF NOT EXISTS autoformalization_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    natural_text_hash VARCHAR(64) UNIQUE NOT NULL,
    natural_text TEXT NOT NULL,
    formal_representation TEXT NOT NULL,
    domain VARCHAR(100),
    confidence DECIMAL(5,4) NOT NULL,
    quantum_enhanced BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_kg_nodes_formal_proof_id ON kg_nodes(formal_proof_id);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_formal_proof_status ON kg_nodes(formal_proof_status);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_constitutional_compliance ON kg_nodes USING GIN(constitutional_compliance);
CREATE INDEX IF NOT EXISTS idx_formal_proofs_verification_status ON formal_proofs(verification_status);
CREATE INDEX IF NOT EXISTS idx_judge_decisions_subject ON judge_decisions(subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_constitutional_compliance_entity ON constitutional_compliance(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_autoformalization_cache_hash ON autoformalization_cache(natural_text_hash);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_formal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formal_proofs_updated_at
    BEFORE UPDATE ON formal_proofs
    FOR EACH ROW
    EXECUTE FUNCTION update_formal_updated_at();

-- Comments for documentation
COMMENT ON TABLE formal_proofs IS 'Stores mathematical proofs and formal verifications with quantum enhancement';
COMMENT ON TABLE judge_decisions IS 'Records decisions from all judge systems with quantum consensus tracking';
COMMENT ON TABLE constitutional_compliance IS 'Tracks constitutional and ethical compliance for all entities';
COMMENT ON TABLE quantum_formal_entanglements IS 'Quantum entanglements between formal reasoning systems';
COMMENT ON TABLE autoformalization_cache IS 'Caches natural language to formal mathematics translations';

COMMENT ON COLUMN kg_nodes.formal_proof_id IS 'References formal mathematical proof if verified';
COMMENT ON COLUMN kg_nodes.mathematical_certainty IS 'Degree of mathematical certainty (0-1)';
COMMENT ON COLUMN kg_nodes.constitutional_compliance IS 'Constitutional compliance check results';
-- COMMENT ON COLUMN quantum_states.formal_verification_state IS 'Quantum superposition of formal verification states';

-- 🚀 FORMAL QUANTUM INTEGRATION COMPLETE!
