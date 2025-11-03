
// 🔥 PERSISTENCE CONFIGURATION
// ============================

export const PERSISTENCE_CONFIG = {
    enabled: true,
    database: {
        connectionString: 'postgresql://epicbattlegods@localhost:5432/elite_agent_syndicate',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    },
    saveIntervals: {
        knowledgeGraph: 60000,      // Every minute
        memoryCheckpoint: 300000,    // Every 5 minutes
        systemHealth: 30000,         // Every 30 seconds
        breakthrough: 'immediate'    // Save immediately on breakthrough
    },
    batchSizes: {
        knowledgeNodes: 100,
        relationships: 200,
        memories: 50
    },
    retryPolicy: {
        maxAttempts: 3,
        backoffMs: 1000
    }
};

// Function to ensure saves happen
export async function ensurePersistence(db, data, tableName) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            // Force synchronous commit
            await db.query('SET synchronous_commit = on');
            
            // Save the data
            const result = await db.query(
                `INSERT INTO ${tableName} (data) VALUES ($1) RETURNING id`,
                [JSON.stringify(data)]
            );
            
            // Force checkpoint
            await db.query('CHECKPOINT');
            
            console.log(`✅ Persisted to ${tableName}: ${result.rows[0].id}`);
            return result.rows[0];
            
        } catch (error) {
            attempt++;
            console.error(`❌ Persistence attempt ${attempt} failed: ${error.message}`);
            
            if (attempt >= maxRetries) {
                // Write to local file as backup
                const backupPath = `./backups/${tableName}_${Date.now()}.json`;
                await fs.writeFile(backupPath, JSON.stringify(data), 'utf8');
                console.log(`💾 Saved to backup file: ${backupPath}`);
                throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
