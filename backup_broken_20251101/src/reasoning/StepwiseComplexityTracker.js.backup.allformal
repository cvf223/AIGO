/**
 * 🎯 STEPWISE COMPLEXITY TRACKER - TRACK WHERE COLLAPSE ACTUALLY HAPPENS
 * ========================================================================
 * 
 * BRUTAL TRUTH: Tracks complexity at EACH STEP to know exactly where things fail
 */

import { EventEmitter } from 'events';

export class StepwiseComplexityTracker extends EventEmitter {
    constructor() {
        super();
        
        this.executionTrace = [];
        this.complexityHistory = [];
        this.currentStep = 0;
        this.collapsePoint = null;
        this.lastSafeStep = null;
    }
    
    /**
     * 🎯 START NEW EXECUTION PLAN
     */
    startExecution(plan) {
        this.executionTrace = [];
        this.complexityHistory = [];
        this.currentStep = 0;
        this.collapsePoint = null;
        
        console.log('📋 EXECUTION PLAN STARTED:');
        console.log(`   Total steps: ${plan.steps?.length || 'unknown'}`);
        console.log(`   Initial complexity: ${(plan.initialComplexity * 100).toFixed(1)}%\n`);
        
        return {
            planId: Date.now(),
            startTime: Date.now(),
            plan
        };
    }
    
    /**
     * 📊 RECORD STEP EXECUTION
     */
    recordStep(stepInfo) {
        const step = {
            stepNumber: ++this.currentStep,
            action: stepInfo.action,
            input: stepInfo.input,
            output: stepInfo.output,
            complexity: stepInfo.complexity,
            reasoning: stepInfo.reasoning,
            conclusions: stepInfo.conclusions,
            timestamp: Date.now()
        };
        
        this.executionTrace.push(step);
        this.complexityHistory.push({
            step: this.currentStep,
            complexity: stepInfo.complexity,
            delta: this.complexityHistory.length > 0 ? 
                stepInfo.complexity - this.complexityHistory[this.complexityHistory.length - 1].complexity : 0
        });
        
        // Check if complexity is increasing dangerously
        if (stepInfo.complexity < 0.5) {
            this.lastSafeStep = this.currentStep;
        }
        
        // Log step result
        console.log(`📍 Step ${this.currentStep}: ${stepInfo.action}`);
        console.log(`   Complexity: ${(stepInfo.complexity * 100).toFixed(1)}% ${this.getComplexityTrend()}`);
        if (stepInfo.reasoning) {
            console.log(`   Reasoning: ${stepInfo.reasoning}`);
        }
        if (stepInfo.conclusions) {
            console.log(`   Conclusions: ${stepInfo.conclusions}`);
        }
        
        return step;
    }
    
    /**
     * 🚨 RECORD COLLAPSE POINT
     */
    recordCollapse(reason, complexity) {
        this.collapsePoint = {
            step: this.currentStep,
            reason,
            complexity,
            lastSafeStep: this.lastSafeStep,
            trace: this.executionTrace.slice(-5) // Last 5 steps before collapse
        };
        
        console.error('\n🚨 COMPLEXITY COLLAPSE DETECTED!');
        console.error(`   At step: ${this.currentStep}`);
        console.error(`   Complexity: ${(complexity * 100).toFixed(1)}%`);
        console.error(`   Last safe step: ${this.lastSafeStep || 'none'}`);
        console.error(`   Reason: ${reason}\n`);
        
        return this.collapsePoint;
    }
    
    /**
     * 📝 GENERATE COLLAPSE REPORT FOR HUMAN
     */
    generateCollapseReport() {
        if (!this.collapsePoint) {
            return 'No collapse detected yet.';
        }
        
        let report = '\n════════════════════════════════════════════════════════\n';
        report += '🚨 COMPLEXITY COLLAPSE ANALYSIS REPORT 🚨\n';
        report += '════════════════════════════════════════════════════════\n\n';
        
        report += '📊 COMPLEXITY PROGRESSION:\n';
        report += '─────────────────────────\n';
        
        // Show complexity history
        for (const hist of this.complexityHistory.slice(-10)) {
            const bar = '█'.repeat(Math.floor(hist.complexity * 20));
            const trend = hist.delta > 0 ? '↗️' : hist.delta < 0 ? '↘️' : '➡️';
            report += `Step ${hist.step}: ${bar} ${(hist.complexity * 100).toFixed(1)}% ${trend}\n`;
        }
        
        report += '\n🔍 STEPS LEADING TO COLLAPSE:\n';
        report += '────────────────────────────\n';
        
        // Show last 5 steps before collapse
        for (const step of this.collapsePoint.trace) {
            report += `\nStep ${step.stepNumber}: ${step.action}\n`;
            report += `  Input: ${JSON.stringify(step.input).substring(0, 100)}...\n`;
            report += `  Reasoning: ${step.reasoning || 'none'}\n`;
            report += `  Conclusions: ${step.conclusions || 'none'}\n`;
            report += `  Complexity: ${(step.complexity * 100).toFixed(1)}%\n`;
            
            if (step.output) {
                report += `  Output: ${JSON.stringify(step.output).substring(0, 100)}...\n`;
            }
        }
        
        report += '\n❌ COLLAPSE POINT:\n';
        report += '─────────────────\n';
        report += `Step ${this.collapsePoint.step}: ${this.collapsePoint.reason}\n`;
        report += `Final Complexity: ${(this.collapsePoint.complexity * 100).toFixed(1)}%\n`;
        
        report += '\n💡 RECOMMENDATIONS:\n';
        report += '──────────────────\n';
        
        if (this.lastSafeStep) {
            report += `1. Rollback to step ${this.lastSafeStep} (last safe point)\n`;
        }
        report += '2. Break down the complex step into smaller sub-steps\n';
        report += '3. Add constraints to limit search space\n';
        report += '4. Consider alternative approaches\n';
        
        report += '\n❓ HUMAN GUIDANCE NEEDED:\n';
        report += '────────────────────────\n';
        report += '• Should we rollback to the last safe step?\n';
        report += '• Can you provide simpler constraints?\n';
        report += '• Is there a different approach we should try?\n';
        
        report += '\n════════════════════════════════════════════════════════\n';
        
        return report;
    }
    
    /**
     * 📈 GET COMPLEXITY TREND
     */
    getComplexityTrend() {
        if (this.complexityHistory.length < 2) return '';
        
        const recent = this.complexityHistory.slice(-3);
        const avgDelta = recent.reduce((sum, h) => sum + h.delta, 0) / recent.length;
        
        if (avgDelta > 0.1) return '📈 RISING FAST!';
        if (avgDelta > 0.05) return '↗️ rising';
        if (avgDelta < -0.05) return '↘️ falling';
        return '➡️ stable';
    }
    
    /**
     * 🔄 SUGGEST RECOVERY STRATEGY
     */
    suggestRecovery() {
        if (!this.collapsePoint) {
            return { strategy: 'continue', reason: 'No collapse detected' };
        }
        
        if (this.lastSafeStep && this.lastSafeStep > 0) {
            return {
                strategy: 'rollback',
                toStep: this.lastSafeStep,
                reason: `Rollback to step ${this.lastSafeStep} where complexity was manageable`
            };
        }
        
        return {
            strategy: 'restart',
            reason: 'No safe checkpoint found - suggest restart with simpler approach'
        };
    }
}

export default StepwiseComplexityTracker;

