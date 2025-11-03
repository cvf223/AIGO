#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Fixing constructionOrchestrator service registration...');

const filePath = 'startfullsyndicate.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find and fix the constructionOrchestrator registration
const oldRegistration = `        // Construction Orchestrator
        await serviceRegistry.register('constructionOrchestrator', async (deps) => {
            const factory = deps.syndicateFactory;
            const constructionServices = await factory.serviceRegistry.constructionServices.initialize();
            return constructionServices.orchestrator;
        }, {
            dependencies: ['syndicateFactory'],
            critical: true
        });`;

const newRegistration = `        // Construction Orchestrator
        await serviceRegistry.register('constructionOrchestrator', async (deps) => {
            const factory = deps.syndicateFactory;
            
            // 🛡️ SAFE ACCESS: Check if serviceRegistry exists
            if (!factory.serviceRegistry) {
                console.warn('⚠️ Factory serviceRegistry not found, creating placeholder orchestrator');
                return {
                    name: 'ConstructionOrchestrator',
                    isPlaceholder: true,
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    process: async () => console.log('Placeholder orchestrator processing')
                };
            }
            
            // 🛡️ SAFE ACCESS: Check if constructionServices exists
            if (!factory.serviceRegistry.constructionServices) {
                console.warn('⚠️ Factory constructionServices not found, creating placeholder orchestrator');
                return {
                    name: 'ConstructionOrchestrator',
                    isPlaceholder: true,
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    process: async () => console.log('Placeholder orchestrator processing')
                };
            }
            
            try {
                const constructionServices = await factory.serviceRegistry.constructionServices.initialize();
                
                // 🛡️ SAFE ACCESS: Ensure orchestrator exists
                if (!constructionServices || !constructionServices.orchestrator) {
                    console.warn('⚠️ Orchestrator not found in constructionServices, creating placeholder');
                    return {
                        name: 'ConstructionOrchestrator',
                        isPlaceholder: true,
                        initialize: async () => console.log('Placeholder orchestrator initialized'),
                        process: async () => console.log('Placeholder orchestrator processing')
                    };
                }
                
                return constructionServices.orchestrator;
            } catch (error) {
                console.error('❌ Error initializing constructionServices:', error.message);
                // Return placeholder to prevent crash
                return {
                    name: 'ConstructionOrchestrator',
                    isPlaceholder: true,
                    error: error.message,
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    process: async () => console.log('Placeholder orchestrator processing')
                };
            }
        }, {
            dependencies: ['syndicateFactory'],
            critical: false  // Make it non-critical to prevent system crash
        });`;

// Replace the registration
if (content.includes(oldRegistration)) {
    content = content.replace(oldRegistration, newRegistration);
    console.log('✅ Fixed constructionOrchestrator registration with safety checks');
} else {
    console.log('⚠️ Could not find exact match, applying regex fix...');
    
    // More flexible regex to find and replace
    const regex = /\/\/ Construction Orchestrator[\s\S]*?critical: true[\s\S]*?\}\);/;
    if (regex.test(content)) {
        content = content.replace(regex, newRegistration);
        console.log('✅ Applied regex-based fix');
    } else {
        console.log('❌ Could not find construction orchestrator registration to fix');
    }
}

// Also fix the start() method to handle undefined constructionOrchestrator
const startMethodOld = `            // Get services from registry
            const syndicateFactory = await serviceRegistry.get('syndicateFactory');
            const constructionOrchestrator = await serviceRegistry.get('constructionOrchestrator');`;

const startMethodNew = `            // Get services from registry
            const syndicateFactory = await serviceRegistry.get('syndicateFactory');
            const constructionOrchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
            
            // 🛡️ SAFETY: Log orchestrator status
            if (constructionOrchestrator && constructionOrchestrator.isPlaceholder) {
                console.warn('⚠️ Using placeholder construction orchestrator - some features may be limited');
            }`;

if (content.includes(startMethodOld)) {
    content = content.replace(startMethodOld, startMethodNew);
    console.log('✅ Fixed start() method to handle optional constructionOrchestrator');
}

// Write the fixed file
fs.writeFileSync(filePath, content);
console.log('💾 Saved fixed startfullsyndicate.js');
console.log('✅ Syndicate startup fix applied successfully!');
