import { Pool } from 'pg';

// Simple database connection
const db = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'arbitrum_flash_specialist',
    user: 'epicbattlegods',
    password: 'your_password_here'
});

// Essential Arbitrum tokens only
const TOKENS = {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    '0x912ce59144191c1204e64559fe8253a0e49e6548': { symbol: 'ARB', name: 'Arbitrum', decimals: 18 },
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8 },
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': { symbol: 'LINK', name: 'Chainlink', decimals: 18 },
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 }
};

async function fixUnknownTokens() {
    console.log('🔧 Fixing UNKNOWN tokens issue...');
    
    try {
        // Create tokens table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS tokens (
                address VARCHAR(42) PRIMARY KEY,
                symbol VARCHAR(20) NOT NULL,
                name VARCHAR(255) NOT NULL,
                decimals INTEGER NOT NULL
            )
        `);
        
        // Insert known tokens
        for (const [address, token] of Object.entries(TOKENS)) {
            await db.query(
                `INSERT INTO tokens (address, symbol, name, decimals) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (address) DO UPDATE SET 
                 symbol = $2, name = $3, decimals = $4`,
                [address.toLowerCase(), token.symbol, token.name, token.decimals]
            );
        }
        
        console.log(`✅ Fixed ${Object.keys(TOKENS).length} tokens`);
        
        // Verify no UNKNOWN tokens remain
        const unknownCheck = await db.query(`
            SELECT COUNT(*) as count FROM tokens 
            WHERE symbol LIKE '%UNKNOWN%' OR name LIKE '%UNKNOWN%'
        `);
        
        if (unknownCheck.rows[0].count > 0) {
            throw new Error('UNKNOWN tokens still exist!');
        }
        
        console.log('✅ NO UNKNOWN TOKENS - Problem solved!');
        
    } catch (error) {
        console.error('❌ Failed:', error);
        throw error;
    } finally {
        await db.end();
    }
}

// Run the fix
fixUnknownTokens().catch(console.error);

export { fixUnknownTokens }; 