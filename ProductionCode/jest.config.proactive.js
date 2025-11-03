/**
 * 🧪⚡ JEST CONFIGURATION FOR PROACTIVE PREVENTION TESTING
 * ======================================================
 * 
 * Specialized Jest configuration for comprehensive proactive prevention test suite
 * Handles module conflicts and ensures proper test execution
 */

export default {
    // Test environment
    testEnvironment: 'node',
    
    // ESM module support
    preset: null,
    extensionsToTreatAsEsm: ['.js'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    
    // Test file patterns
    testMatch: [
        '**/test/**/ComprehensiveProactivePreventionTestSuite.js',
        '**/test/**/*ProactivePreventionTest*.js'
    ],
    
    // Ignore problematic directories causing Haste conflicts
    testPathIgnorePatterns: [
        '/node_modules/',
        '/AI-AGENT_Fresh_8AgentsWorking_needs_memoryfixing_SharedRoom_ID/',
        '/flash_loan_arbitrage/',
        '/agent/',
        '/client/',
        '/packages/cli/',
        '/packages/client-direct/',
        '/packages/dynamic-imports/',
        '/packages/plugin-bootstrap/',
        '/packages/client-telegram/',
        '/packages/plugin-evm/',
        '/packages/plugin-solana/',
        '/packages/plugin-tee/',
        '/packages/core/',
        '/scripts/'
    ],
    
    // Module directories
    moduleDirectories: ['node_modules'],
    
    // Haste configuration to avoid naming conflicts
    haste: {
        enableSymlinks: false,
        forceNodeFilesystemAPI: true
    },
    
    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: './coverage/proactive-prevention',
    coverageReporters: ['text', 'html'],
    collectCoverageFrom: [
        'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**'
    ],
    
    // Test execution
    verbose: true,
    detectOpenHandles: true,
    forceExit: true,
    maxWorkers: 1,
    testTimeout: 30000,
    
    // Setup and teardown
    globalSetup: undefined,
    globalTeardown: undefined,
    
    // Transform configuration
    transform: {
        '^.+\\.jsx?$': ['babel-jest', { 
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]] 
        }]
    },
    
    // Resolver configuration
    resolver: undefined,
    
    // Clear mocks
    clearMocks: true,
    resetMocks: false,
    restoreMocks: false
};
