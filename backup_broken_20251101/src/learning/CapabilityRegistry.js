/**
 * 🛠️ Capability Registry
 * =======================
 *
 * This is the single source of truth for what the syndicate can actually DO.
 * It is a dynamic, constraint-aware system that maps abstract strategic goals
 * (like "FIND_NEW_STRATEGY") to concrete, executable capabilities with real-world
 * requirements (capital, tech stack, data sources).
 *
 * An agent must consult this registry before pursuing a long-term task to ensure
 * it is a productive use of its time.
 */
import { Pool } from 'pg';

class CapabilityRegistry {
    constructor(dbPool) {
        this.dbPool = dbPool;
        this.capabilities = new Map();
    }

    async initialize() {
        console.log('🛠️ Initializing Capability Registry...');
        await this.ensureCapabilityTableExists();
        await this.loadCapabilitiesFromDB();
        console.log(`✅ Capability Registry operational. Loaded ${this.capabilities.size} capabilities.`);
    }

    async ensureCapabilityTableExists() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS syndicate_capabilities (
                    capability_key VARCHAR(255) PRIMARY KEY,
                    description TEXT,
                    is_enabled BOOLEAN DEFAULT true,
                    requirements JSONB,
                    status VARCHAR(50) DEFAULT 'active', -- active, pending_enhancement, pending_approval
                    requested_by VARCHAR(255),
                    performance_score FLOAT DEFAULT 0.75,
                    last_used TIMESTAMPTZ
                );
            `);
            // Seed with our core capabilities
            await this.seedInitialCapabilities(client);
        } finally {
            client.release();
        }
    }
    
    async seedInitialCapabilities(client) {
        const initialCapabilities = [
            {
                key: 'EXECUTE_L2_FLASHLOAN_ARBITRAGE',
                desc: 'Execute a looped, atomic arbitrage transaction on an L2 using a flash loan.',
                req: { minCapitalUSD: 0, techStack: ['ethers', 'moralis', 'balancer'], dataSources: ['onchain_events'] }
            },
            {
                key: 'FIND_NEW_POOL',
                desc: 'Scan the blockchain for new liquidity pools that are not yet in our database.',
                req: { minCapitalUSD: 0, techStack: ['ethers', 'pool_discovery_engine'], dataSources: ['onchain_events'] }
            },
            {
                key: 'RESEARCH_COMPETITOR',
                desc: 'Perform deep forensic analysis of a competitor transaction.',
                req: { minCapitalUSD: 0, techStack: ['ethers', 'mev_decoder'], dataSources: ['archive_node_trace'] }
            },
            {
                key: 'SOCIAL_SENTIMENT_ANALYSIS_WITH_CORRELATION',
                desc: 'Analyze social media sentiment and correlate it with on-chain data.',
                req: { minCapitalUSD: 0, techStack: ['llm', 'world_model', 'onchain_verification'], dataSources: ['twitter_api', 'onchain_data'] }
            },
            {
                key: 'EXECUTE_ETH_SANDWICH_ATTACK',
                desc: 'Execute a sandwich attack on Ethereum mainnet.',
                req: { minCapitalUSD: 10000, techStack: ['flashbots_bundle'], dataSources: ['mempool_stream'], humanIntervention: true }
            },
            {
                key: 'BROWSE_WEB',
                desc: 'Browse a given URL and extract its textual content for analysis.',
                req: { minCapitalUSD: 0, techStack: ['puppeteer_browser'], dataSources: ['live_web'] }
            }
        ];
        
        const sql = `
            INSERT INTO syndicate_capabilities (capability_key, description, requirements) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (capability_key) DO NOTHING;
        `;
        for(const cap of initialCapabilities) {
            await client.query(sql, [cap.key, cap.desc, cap.req]);
        }
    }

    async loadCapabilitiesFromDB() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query('SELECT * FROM syndicate_capabilities WHERE is_enabled = true');
            this.capabilities.clear();
            for (const row of result.rows) {
                this.capabilities.set(row.capability_key, row);
            }
        } finally {
            client.release();
        }
    }

    /**
     * REFACTORED: The LLM agent now formulates the enhancement request.
     * This creates a "ticket" that requires human-in-the-loop approval.
     */
    async requestNewCapability(capabilityKey, description, requirements, requestingAgentId) {
        const status = 'pending_approval'; // All new capabilities must be approved by a human.

        console.log(`[Registry] Agent ${requestingAgentId} is requesting new capability: ${capabilityKey} (Status: ${status})`);
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(
                `INSERT INTO syndicate_capabilities (capability_key, description, requirements, status, requested_by, is_enabled) 
                 VALUES ($1, $2, $3, $4, $5, false) 
                 ON CONFLICT (capability_key) DO NOTHING RETURNING *`,
                [capabilityKey, description, requirements, status, requestingAgentId]
            );
             if (result.rows.length > 0) {
                const newCap = result.rows[0];
                this.capabilities.set(capabilityKey, newCap);
                // 💡 This would also trigger a notification to the Web GUI for the human operator
                return newCap;
            }
            return null;
        } finally {
            client.release();
        }
    }
    
    /**
     * 💡 NEW: A method for a human operator to approve a capability, moving it to development.
     */
    async approveCapability(capabilityKey, approverId = 'human_operator') {
        console.log(`[Registry] Human operator ${approverId} approved capability: ${capabilityKey}. Moving to development.`);
        const client = await this.dbPool.connect();
        try {
            await client.query(
                `UPDATE syndicate_capabilities SET status = 'pending_enhancement' WHERE capability_key = $1 AND status = 'pending_approval'`,
                [capabilityKey]
            );
            await this.loadCapabilitiesFromDB();
            // This would trigger a task for the Developer Agent
        } finally {
            client.release();
        }
    }

    /**
     * REFACTORED: Now called by the Developer agent or human after the work is done.
     */
    async activateCapability(capabilityKey, updatedDetails = {}) {
        console.log(`[Registry] Activating new capability: ${capabilityKey}`);
        
        const client = await this.dbPool.connect();
        try {
            const current = this.capabilities.get(capabilityKey);
            if (!current) return false;

            const newDescription = updatedDetails.description || current.description;
            const newRequirements = updatedDetails.requirements || current.requirements;

            await client.query(
                `UPDATE syndicate_capabilities 
                 SET status = 'active', is_enabled = true, description = $1, requirements = $2, updated_at = NOW()
                 WHERE capability_key = $3 AND status = 'pending_enhancement'`,
                [newDescription, newRequirements, capabilityKey]
            );
            
            // Reload the cache to reflect the change
            await this.loadCapabilitiesFromDB();
            return true;
        } finally {
            client.release();
        }
    }

    /**
     * Checks if the syndicate currently meets the requirements to execute a capability.
     * @param {string} capabilityKey - The key of the capability to check.
     * @param {object} syndicateState - The current state of the syndicate.
     * @returns {{isCapable: boolean, reason: string}}
     */
    checkCapability(capabilityKey, syndicateState) {
        const capability = this.capabilities.get(capabilityKey);
        if (!capability) {
            return { isCapable: false, reason: `Capability '${capabilityKey}' is not registered.` };
        }

        const reqs = capability.requirements || {};

        // Check Capital
        if (reqs.minCapitalUSD && syndicateState.availableCapital < reqs.minCapitalUSD) {
            return { isCapable: false, reason: `Insufficient capital. Requires ${reqs.minCapitalUSD}, have ${syndicateState.availableCapital}.` };
        }

        // Check Tech Stack
        if (reqs.techStack) {
            for (const tech of reqs.techStack) {
                if (!syndicateState.techStack.includes(tech)) {
                    return { isCapable: false, reason: `Missing required technology: '${tech}'.` };
                }
            }
        }
        
        // Check for Human Intervention
        if (reqs.humanIntervention) {
            return { isCapable: false, reason: `Capability requires human-in-the-loop confirmation.` };
        }

        return { isCapable: true, reason: 'Syndicate meets all requirements.' };
    }
}

export { CapabilityRegistry };
