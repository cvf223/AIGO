#!/usr/bin/env node

/**
 * 🏗️ ANALYZE REAL CONSTRUCTION PLANS - Command-Line Script
 * =========================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Analyze 28 real PDFs and generate LP6
 * 
 * USAGE:
 *   node analyze-real-plans.js                    # Analyze all 28 plans
 *   node analyze-real-plans.js AS38-42            # Analyze AS38-42 only
 *   node analyze-real-plans.js FB                 # Analyze FB only
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { MasterConstructionSyndicateOrchestrator } from './startfullsyndicate.js';
import { RealPlanAnalysisOrchestrator } from './src/construction/RealPlanAnalysisOrchestrator.js';

async function main() {
    console.log('🏗️ REAL PLAN ANALYSIS - CONSTRUCTION SYNDICATE');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    
    const projectArg = process.argv[2]; // AS38-42, FB, or undefined (all)
    
    try {
        // Initialize Construction Syndicate
        console.log('🚀 Initializing Construction Syndicate...');
        const orchestrator = new MasterConstructionSyndicateOrchestrator({
            mode: 'construction',
            enableVisionProcessing: true,
            enableWebInterface: false // Disable GUI for faster startup
        });
        
        await orchestrator.initialize();
        console.log('✅ Construction Syndicate initialized\n');
        
        // Create analysis orchestrator
        const analyzer = new RealPlanAnalysisOrchestrator(orchestrator);
        await analyzer.initialize();
        
        let results;
        
        if (projectArg === 'AS38-42') {
            // Analyze AS38-42 only
            console.log('📋 Analyzing Project AS38-42 (15 plans)...\n');
            results = await analyzer.analyzeProject('AS38-42');
            
        } else if (projectArg === 'FB') {
            // Analyze FB only
            console.log('📋 Analyzing Project FB (13 plans)...\n');
            results = await analyzer.analyzeProject('FB');
            
        } else {
            // Analyze both projects (all 28 plans)
            console.log('📋 Analyzing BOTH projects (28 plans total)...\n');
            results = await analyzer.analyzeAllPlans();
            
            // Generate combined LP6
            console.log('\n📄 Generating combined LP6 Leistungsverzeichnis...');
            const lp6Combined = await analyzer.generateCombinedLP6(results.projects);
            results.lp6Combined = lp6Combined;
        }
        
        // Save results
        const outputFile = projectArg 
            ? `analysis-results-${projectArg}.json`
            : 'analysis-results-all.json';
        
        await analyzer.saveResults(outputFile);
        
        // Print summary
        console.log('\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('✅ REAL PLAN ANALYSIS COMPLETE!');
        console.log('═══════════════════════════════════════════════════');
        
        if (results.projects) {
            // All projects
            results.projects.forEach(pr => {
                console.log(`\n${pr.projectId}:`);
                console.log(`   Plans analyzed: ${pr.plansAnalyzed}`);
                console.log(`   Elements detected: ${pr.visionResults.totalElements}`);
                console.log(`   Total cost: €${pr.quantities.totalCost.toLocaleString()}`);
                console.log(`   HOAI LP6: ${pr.compliance.lp6.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
                console.log(`   Errors found: ${pr.errors.length}`);
            });
            
            console.log(`\n📊 COMBINED TOTALS:`);
            console.log(`   Total plans: ${results.totalPlans}`);
            console.log(`   Total elements: ${results.totalElements}`);
            console.log(`   Total cost: €${results.totalCost.toLocaleString()}`);
            console.log(`   Analysis duration: ${(results.duration / 1000).toFixed(1)}s`);
            
        } else {
            // Single project
            console.log(`\n${results.projectId}:`);
            console.log(`   Plans analyzed: ${results.plansAnalyzed}`);
            console.log(`   Elements detected: ${results.visionResults.totalElements}`);
            console.log(`   Total cost: €${results.quantities.totalCost.toLocaleString()}`);
            console.log(`   HOAI LP6: ${results.compliance.lp6.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
            console.log(`   Errors found: ${results.errors.length}`);
            console.log(`   Duration: ${(results.duration / 1000).toFixed(1)}s`);
        }
        
        console.log(`\n💾 Results saved to: ${outputFile}`);
        console.log('');
        
        // Shutdown
        await orchestrator.shutdown();
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ANALYSIS FAILED:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

main();

