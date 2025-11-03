#!/usr/bin/env node
// agent/scripts/trigger-agent-review.js
// Usage: node trigger-agent-review.js <category> <agentId>
import { loadMemory, saveMemory, healSchema, getDefaultAgentMemory } from './agent-memory-utils.js';

const AGENT_IDS = [
  'chris-super-dev',
  'crypto-market-analyst',
  'blockchain-analyst',
  'fla-opportunity-bot',
  'fla-executer',
  'meme-coin-creator',
  'social-media-manager',
  'meme-market-analyst'
];

const [,, category, agentId] = process.argv;
if (!category) {
  console.error('Usage: node trigger-agent-review.js <category> <agentId>');
  process.exit(1);
}
if (!agentId) {
  console.error('Agent ID required. Use "all" to trigger for all agents.');
  process.exit(1);
}

function expertReview(agentId, category) {
  let memory = loadMemory(agentId);
  // Heal schema to ensure all fields
  healSchema(memory, getDefaultAgentMemory());
  const now = new Date().toISOString();
  if (!memory.reviewLog) memory.reviewLog = [];
  // Ensure all new fields exist
  memory.resources = memory.resources || [];
  memory.personalKnowledgeBase = memory.personalKnowledgeBase || [];
  memory.fieldSpecificTasks = memory.fieldSpecificTasks || [];
  memory.predictions = memory.predictions || [];
  memory.predictionReviews = memory.predictionReviews || [];

  // --- Agent-specific logic ---
  let summary = `Review (${category}) at ${now}:\n`;
  if (agentId === 'crypto-market-analyst') {
    // Review predictions and update predictionReviews
    const reviewed = [];
    for (const pred of memory.predictions.slice(-5)) {
      const review = {
        prediction: pred,
        outcome: pred.outcome || 'unknown',
        wasCorrect: pred.wasCorrect || false,
        reviewTime: now,
        notes: pred.reviewNotes || ''
      };
      memory.predictionReviews.push(review);
      reviewed.push(`Prediction: ${pred.coin} @ ${pred.time} - ${review.wasCorrect ? 'Correct' : 'Wrong'}`);
    }
    summary += `- Reviewed predictions: ${reviewed.join('; ')}\n`;
    // Learn from wrong predictions
    const wrongs = memory.predictionReviews.filter(r => !r.wasCorrect).slice(-3);
    for (const wrong of wrongs) {
      memory.keyTakeaways.push(`Learned from wrong prediction on ${wrong.prediction.coin}: ${wrong.notes}`);
    }
  }
  if (agentId === 'fla-executer') {
    // Log collaboration with FLA Opportunity Spotter
    memory.recentCollaborations = memory.recentCollaborations || [];
    memory.recentCollaborations.push({
      with: 'fla-opportunity-bot',
      time: now,
      topic: 'Flashloan arbitrage opportunity and execution strategy'
    });
    summary += `- Collaborated with FLA Opportunity Spotter\n`;
  }
  if (agentId === 'fla-opportunity-bot') {
    // Log collaboration with FLA Executer
    memory.recentCollaborations = memory.recentCollaborations || [];
    memory.recentCollaborations.push({
      with: 'fla-executer',
      time: now,
      topic: 'Flashloan arbitrage execution feedback'
    });
    summary += `- Collaborated with FLA Executer\n`;
  }
  if (agentId === 'meme-coin-creator') {
    // Log coordination with Social Media Manager and Meme Market Analyst
    memory.recentCollaborations = memory.recentCollaborations || [];
    memory.recentCollaborations.push({
      with: 'social-media-manager',
      time: now,
      topic: 'MemeCoin launch coordination'
    });
    memory.recentCollaborations.push({
      with: 'meme-market-analyst',
      time: now,
      topic: 'MemeCoin market analysis'
    });
    summary += `- Coordinated with Social Media Manager and Meme Market Analyst\n`;
  }
  if (agentId === 'meme-market-analyst') {
    // Log trend analysis
    memory.resources.push({
      type: 'trend-analysis',
      time: now,
      details: 'Analyzed meme trends and filtered scams.'
    });
    summary += `- Analyzed meme trends and filtered scams\n`;
  }
  if (agentId === 'social-media-manager') {
    // Log trend and influencer analysis
    memory.resources.push({
      type: 'influencer-analysis',
      time: now,
      details: 'Analyzed influencer scams and social trends.'
    });
    summary += `- Analyzed influencer scams and social trends\n`;
  }
  if (agentId === 'blockchain-analyst') {
    // Log exploration of Bitcoin L2
    memory.resources.push({
      type: 'btc-l2-exploration',
      time: now,
      details: 'Explored Bitcoin smart layer solutions and DeFi opportunities.'
    });
    summary += `- Explored Bitcoin L2 and DeFi opportunities\n`;
  }
  // For all agents: promote new resources and validated knowledge
  const newResources = memory.resources.slice(-2).map(r => r.details || r).join('; ');
  const newKnowledge = memory.personalKnowledgeBase.slice(-2).join('; ');
  summary += `- New resources: ${newResources}\n- New validated knowledge: ${newKnowledge}\n`;
  // Log review
  memory.reviewLog.push({ category, timestamp: now, summary });
  memory.lastReview = now;
  saveMemory(agentId, memory);
  console.log(`Expert review complete for agent: ${agentId}, category: ${category}`);
}

if (agentId === 'all') {
  for (const id of AGENT_IDS) {
    expertReview(id, category);
  }
  process.exit(0);
}

expertReview(agentId, category); 