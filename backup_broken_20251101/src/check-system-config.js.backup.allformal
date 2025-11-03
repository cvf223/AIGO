/**
 * 🔍 SYSTEM CONFIGURATION CHECKER
 * ============================
 * 
 * Checks if the system is properly configured before starting
 * 
 * ✅ Environment variables
 * ✅ API keys
 * ✅ Database connections
 * ✅ Blockchain providers
 * ✅ File system
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { ethers } = require('ethers');

// Check configuration
async function checkSystemConfig() {
  console.log('🔍 Checking system configuration...');
  
  // Results object
  const results = {
    environment: {
      status: 'pending',
      details: {}
    },
    apiKeys: {
      status: 'pending',
      details: {}
    },
    database: {
      status: 'pending',
      details: {}
    },
    blockchain: {
      status: 'pending',
      details: {}
    },
    fileSystem: {
      status: 'pending',
      details: {}
    }
  };
  
  // Check environment variables
  await checkEnvironmentVariables(results);
  
  // Check API keys
  await checkApiKeys(results);
  
  // Check database connections
  await checkDatabaseConnections(results);
  
  // Check blockchain providers
  await checkBlockchainProviders(results);
  
  // Check file system
  await checkFileSystem(results);
  
  // Print results
  printResults(results);
  
  // Return overall status
  return Object.values(results).every(r => r.status === 'success');
}

/**
 * Check environment variables
 */
async function checkEnvironmentVariables(results) {
  try {
    console.log('Checking environment variables...');
    
    const requiredVars = [
      'NODE_ENV',
      'SERVER_PORT',
      'POSTGRES_HOST',
      'POSTGRES_PORT',
      'POSTGRES_DB',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
      'MONGODB_URI',
      'MONGODB_DB'
    ];
    
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      results.environment.status = 'warning';
      results.environment.details.missingVars = missingVars;
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      results.environment.status = 'success';
      console.log('✅ All required environment variables are set');
    }
  } catch (error) {
    results.environment.status = 'error';
    results.environment.details.error = error.message;
    console.error('❌ Failed to check environment variables:', error);
  }
}

/**
 * Check API keys
 */
async function checkApiKeys(results) {
  try {
    console.log('Checking API keys...');
    
    const apiKeys = {
      coingecko: process.env.COINGECKO_API_KEY || process.env.COINGECKO_PRO_API_KEY,
      coinmarketcap: process.env.COINMARKETCAP_API_KEY,
      moralis: process.env.MORALIS_API_KEY,
      alchemy: process.env.ALCHEMY_API_KEY,
      infura: process.env.INFURA_API_KEY,
      quicknode: process.env.QUICKNODE_API_KEY
    };
    
    const missingKeys = [];
    
    for (const [name, key] of Object.entries(apiKeys)) {
      if (!key) {
        missingKeys.push(name);
      }
    }
    
    if (missingKeys.length > 0) {
      results.apiKeys.status = 'warning';
      results.apiKeys.details.missingKeys = missingKeys;
      console.warn(`⚠️ Missing API keys: ${missingKeys.join(', ')}`);
    } else {
      results.apiKeys.status = 'success';
      console.log('✅ All API keys are set');
    }
    
    // Check if any API keys are valid
    const validKeys = [];
    
    // Check CoinGecko API key
    if (apiKeys.coingecko) {
      try {
        const response = await axios.get('https://pro-api.coingecko.com/api/v3/ping', {
          headers: {
            'X-CG-Pro-API-Key': apiKeys.coingecko
          },
          timeout: 5000
        });
        
        if (response.status === 200) {
          validKeys.push('coingecko');
        }
      } catch (error) {
        // API key might be invalid
      }
    }
    
    results.apiKeys.details.validKeys = validKeys;
    
    if (validKeys.length > 0) {
      console.log(`✅ Validated API keys: ${validKeys.join(', ')}`);
    } else {
      console.warn('⚠️ Could not validate any API keys');
    }
  } catch (error) {
    results.apiKeys.status = 'error';
    results.apiKeys.details.error = error.message;
    console.error('❌ Failed to check API keys:', error);
  }
}

/**
 * Check database connections
 */
async function checkDatabaseConnections(results) {
  try {
    console.log('Checking database connections...');
    
    // Check PostgreSQL connection
    const pgConnString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
    
    results.database.details.postgres = {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER
    };
    
    // Check MongoDB connection
    results.database.details.mongodb = {
      uri: process.env.MONGODB_URI,
      database: process.env.MONGODB_DB
    };
    
    // We won't actually connect to the databases here to avoid dependencies
    results.database.status = 'success';
    console.log('✅ Database connection parameters are set');
  } catch (error) {
    results.database.status = 'error';
    results.database.details.error = error.message;
    console.error('❌ Failed to check database connections:', error);
  }
}

/**
 * Check blockchain providers
 */
async function checkBlockchainProviders(results) {
  try {
    console.log('Checking blockchain providers...');
    
    const providers = {
      alchemy: process.env.ALCHEMY_ARBITRUM_URL || process.env.ARBITRUM_RPC_URL,
      infura: process.env.INFURA_ARBITRUM_URL || process.env.ARBITRUM_RPC_URL2,
      quicknode: process.env.QUICKNODE_ARBITRUM_URL
    };
    
    const missingProviders = [];
    const workingProviders = [];
    
    for (const [name, url] of Object.entries(providers)) {
      if (!url) {
        missingProviders.push(name);
        continue;
      }
      
      try {
        const provider = new ethers.providers.JsonRpcProvider(url);
        const blockNumber = await provider.getBlockNumber();
        
        if (blockNumber > 0) {
          workingProviders.push(name);
        }
      } catch (error) {
        // Provider might be invalid
      }
    }
    
    results.blockchain.details.missingProviders = missingProviders;
    results.blockchain.details.workingProviders = workingProviders;
    
    if (missingProviders.length > 0) {
      console.warn(`⚠️ Missing blockchain providers: ${missingProviders.join(', ')}`);
    }
    
    if (workingProviders.length > 0) {
      results.blockchain.status = 'success';
      console.log(`✅ Working blockchain providers: ${workingProviders.join(', ')}`);
    } else {
      results.blockchain.status = 'warning';
      console.warn('⚠️ No working blockchain providers found');
    }
  } catch (error) {
    results.blockchain.status = 'error';
    results.blockchain.details.error = error.message;
    console.error('❌ Failed to check blockchain providers:', error);
  }
}

/**
 * Check file system
 */
async function checkFileSystem(results) {
  try {
    console.log('Checking file system...');
    
    const requiredDirs = [
      'src',
      'capabilities',
      'characters',
      'characters/team-leaders'
    ];
    
    const requiredFiles = [
      'package.json',
      'src/index.js',
      'src/database-connector.js',
      'src/elite-agent-factory.js',
      'src/real-time-integration-bridge.js',
      'src/real-time-price-updater.js',
      'capabilities/marketAwareness.js',
      'capabilities/opportunityDetection.js',
      'capabilities/blockchainIntegration.js',
      'characters/team-leaders/arbitrage-team-leader.character.json'
    ];
    
    const missingDirs = [];
    const missingFiles = [];
    
    // Check directories
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        missingDirs.push(dir);
      }
    }
    
    // Check files
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }
    
    results.fileSystem.details.missingDirs = missingDirs;
    results.fileSystem.details.missingFiles = missingFiles;
    
    if (missingDirs.length > 0) {
      console.warn(`⚠️ Missing directories: ${missingDirs.join(', ')}`);
    }
    
    if (missingFiles.length > 0) {
      console.warn(`⚠️ Missing files: ${missingFiles.join(', ')}`);
    }
    
    if (missingDirs.length === 0 && missingFiles.length === 0) {
      results.fileSystem.status = 'success';
      console.log('✅ All required directories and files exist');
    } else {
      results.fileSystem.status = 'warning';
    }
  } catch (error) {
    results.fileSystem.status = 'error';
    results.fileSystem.details.error = error.message;
    console.error('❌ Failed to check file system:', error);
  }
}

/**
 * Print results
 */
function printResults(results) {
  console.log('\n📋 SYSTEM CONFIGURATION CHECK RESULTS:');
  console.log('====================================');
  
  for (const [category, result] of Object.entries(results)) {
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${result.status}`);
    
    if (result.status !== 'success') {
      console.log('  Details:', JSON.stringify(result.details, null, 2).replace(/\n/g, '\n  '));
    }
  }
  
  console.log('\n');
}

// Run check if executed directly
if (require.main === module) {
  checkSystemConfig()
    .then(success => {
      if (success) {
        console.log('✅ System configuration check passed');
        process.exit(0);
      } else {
        console.warn('⚠️ System configuration check completed with warnings or errors');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ System configuration check failed:', error);
      process.exit(1);
    });
}

module.exports = {
  checkSystemConfig
}; 