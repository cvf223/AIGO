import { executeQuery } from '../../database/contract-advancement-database.js';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR HINDSIGHT VERIFIER)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR HINDSIGHT VERIFIER)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../construction/prevention/ProactiveConstructionInferenceEngine.js';;

/**
 * 🧐 HINDSIGHT VERIFIER - THE TRUTH SEEKER
 * ENHANCED with SPECIALIZED HINDSIGHT VERIFIER Formal Reasoning & Proactive Prevention
 * ==========================================
 *
 * This elite service is the cornerstone of our "Hindsight is 20/20" learning
 * protocol. Its sole purpose is to systematically revisit past predictions made
 * by our LLM Judge, compare them to the actual, known market outcomes, and
 * update our World Model's memory with the ground truth.
 *
 * This creates the ultimate feedback loop, allowing the syndicate to learn not
 * just from its predictions, but from the accuracy of those predictions.
 */
export class HindsightVerifier {
    constructor(dependencies = {}) {
        this.llmAgent = dependencies.llmAgent;
        this.contextEngine = dependencies.contextEngine;
        console.log('🧐 HindsightVerifier (The Truth Seeker) initialized');
    }

    /**
     * Main method to run the verification process for past judgments.
     */
    async runVerificationCycle() {
        console.log('🧐 Starting Hindsight Verification cycle...');
        const unverifiedJudgments = await this.fetchUnverifiedJudgments();

        if (unverifiedJudgments.length === 0) {
            console.log('   -> No unverified judgments to process.');
            return;
        }

        console.log(`   -> Found ${unverifiedJudgments.length} unverified judgments to analyze.`);
        for (const judgment of unverifiedJudgments) {
            try {
                await this.verifyJudgment(judgment);
            } catch (error) {
                console.error(`❌ Failed to verify judgment ${judgment.id}:`, error.message);
            }
        }
        console.log('✅ Hindsight Verification cycle complete.');
    }

    async fetchUnverifiedJudgments() {
        const query = `
            SELECT id, timestamp, predicted_outcome
            FROM world_model_judgments
            WHERE verification_status = 'unverified'
            AND timestamp < NOW() - INTERVAL '1 day' -- Only check predictions older than 1 day
            ORDER BY timestamp ASC
            LIMIT 50; -- Process in batches
        `;
        const result = await executeQuery(query);
        return result.rows;
    }

    async verifyJudgment(judgment) {
        // 1. Fetch the actual market outcome for the day after the prediction
        const actualOutcomeDate = new Date(judgment.timestamp);
        actualOutcomeDate.setDate(actualOutcomeDate.getDate() + 1);
        
        const actualData = await this.fetchMarketDataForDate(actualOutcomeDate);
        if (!actualData) {
            console.log(`   -> No subsequent market data for judgment ${judgment.id}. Skipping.`);
            return;
        }

        // 2. Use the LLM Judge to compare prediction to reality
        const context = await this.contextEngine.buildContext(
            this.llmAgent,
            "Verify a past prediction against the actual outcome.",
            'VALIDATE_AND_CONCLUDE',
            {
                prediction: judgment.predicted_outcome,
                actualOutcome: actualData
            }
        );

        const verificationPrompt = `You are a meticulous truth verifier and market analyst. A prediction was made: "${judgment.predicted_outcome}". The actual, subsequent market state was: "${JSON.stringify(actualData)}". 

1.  **Verification:** Was the prediction correct, incorrect, or partially correct?
2.  **Causal Analysis:** What were the key drivers of the actual outcome?
3.  **Variance Analysis:** Why did the prediction succeed or fail? What did the original analysis miss?

Respond with a single JSON object: { "verification": "correct|incorrect|partial", "causal_reasoning": "Your deep analysis of the actual outcome.", "variance_analysis": "Your analysis of the prediction's accuracy." }`;

        const verificationResult = await this.llmAgent.performTask(verificationPrompt, context);
        const verification = JSON.parse(verificationResult);

        // 3. Update the database with the ground truth and the new, deeper analysis
        await this.updateJudgmentRecord(judgment.id, actualData, verification);
        console.log(`   -> Verified judgment ${judgment.id}: ${verification.verification}`);
    }

    async fetchMarketDataForDate(date) {
        const query = `SELECT * FROM daily_composite_indices WHERE timestamp::date = $1::date;`;
        const result = await executeQuery(query, [date]);
        return result.rows[0];
    }

    async updateJudgmentRecord(judgmentId, actualOutcome, verification) {
        const query = `
            UPDATE world_model_judgments
            SET
                actual_outcome = $1,
                verification_status = $2,
                judgment_text = judgment_text || '\n\n--- HINDSIGHT VERIFICATION ---\n' || $3
            WHERE id = $4;
        `;
        await executeQuery(query, [
            JSON.stringify(actualOutcome),
            `verified_${verification.verification}`,
            `Causal Reasoning: ${verification.causal_reasoning}\nVariance Analysis: ${verification.variance_analysis}`,
            judgmentId
        ]);
    }
}
