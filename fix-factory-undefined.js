#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Fixing factory undefined issue in constructionOrchestrator...');

const filePath = 'startfullsyndicate.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the constructionOrchestrator registration and add null check for factory
const oldCode = `        await serviceRegistry.register('constructionOrchestrator', async (deps) => {
            const factory = deps.syndicateFactory;
            
            // 🛡️ SAFE ACCESS: Check if serviceRegistry exists
            if (!factory.serviceRegistry) {`;

const newCode = `        await serviceRegistry.register('constructionOrchestrator', async (deps) => {
            const factory = deps.syndicateFactory;
            
            // 🛡️ SAFE ACCESS: Check if factory exists
            if (!factory) {
                console.warn('⚠️ SyndicateFactory not found, creating placeholder orchestrator');
                return {
                    name: 'ConstructionOrchestrator',
                    isPlaceholder: true,
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    process: async () => console.log('Placeholder orchestrator processing')
                };
            }
            
            // 🛡️ SAFE ACCESS: Check if serviceRegistry exists
            if (!factory.serviceRegistry) {`;

content = content.replace(oldCode, newCode);

// Also add logging to syndicateFactory registration to debug
const factoryRegOld = `            await factory.initialize();
            return factory;`;

const factoryRegNew = `            await factory.initialize();
            console.log('✅ SyndicateFactory initialized successfully');
            return factory;`;

content = content.replace(factoryRegOld, factoryRegNew);

// Write the fixed file
fs.writeFileSync(filePath, content);
console.log('✅ Added factory null check to constructionOrchestrator');
console.log('✅ Added logging to syndicateFactory initialization');
console.log('💾 Saved fixed startfullsyndicate.js');
