import { DatabasePoolManager } from "./src/database/DatabasePoolManager.js";

async function testDbManager() {
    try {
        console.log("Testing DatabasePoolManager...");
        const dbManager = DatabasePoolManager.getInstance();
        console.log("✅ getInstance() worked");
        
        await dbManager.initialize();
        console.log("✅ initialize() worked");
        
        const pool = await dbManager.getPool();
        console.log("✅ getPool() worked, pool type:", typeof pool);
        
        // Test a simple query
        const result = await pool.query("SELECT version()");
        console.log("✅ Database query worked:", result.rows[0].version.substring(0, 50) + "...");
        
    } catch (error) {
        console.error("❌ DatabasePoolManager test failed:", error.message);
        console.error("Stack:", error.stack);
    }
}

testDbManager();
