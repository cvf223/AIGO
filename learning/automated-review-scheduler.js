#!/usr/bin/env node
// agent/scripts/automated-review-scheduler.js
// Top 0.1% expert-level automated review scheduler for 8–10 agents on Hetzner CCX23
import cron from 'node-cron';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadMemory, saveMemory, getDefaultAgentMemory } from './agent-memory-utils.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENT_IDS = [
  'chris-super-dev',
  'crypto-market-analyst',
  'blockchain-analyst',
  'fla-opportunity-bot',
  'fla-executer',
  'meme-coin-creator',
  'social-media-manager',
  'meme-market-analyst',
  // Add more agent IDs as needed
];

const MEMORY_CATEGORIES = ['discoveries', 'notToDoList', 'keyTakeaways', 'personalKnowledgeBase'];
const MAX_ENTRIES_PER_CATEGORY = 100; // Prune to top 100 for each category

function pruneMemory(agentId) {
  let memory = loadMemory(agentId);
  let changed = false;
  for (const cat of MEMORY_CATEGORIES) {
    if (Array.isArray(memory[cat]) && memory[cat].length > MAX_ENTRIES_PER_CATEGORY) {
      memory[cat] = memory[cat].slice(-MAX_ENTRIES_PER_CATEGORY);
      changed = true;
    }
  }
  if (changed) {
    saveMemory(agentId, memory);
    console.log(`[${agentId}] Pruned memory categories to top ${MAX_ENTRIES_PER_CATEGORY}`);
  }
}

function runReview(category, agent = 'all') {
  const scriptPath = path.join(__dirname, 'trigger-agent-review.js');
  const cmd = `node ${scriptPath} ${category} ${agent}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Scheduler] Review failed for ${category}: ${stderr || error.message}`);
    } else {
      console.log(`[Scheduler] Review complete for ${category}: ${stdout}`);
    }
  });
}

// Full review for all agents every 24h (deep summary)
cron.schedule('0 3 * * *', () => { // 3am server time
  console.log('[Scheduler] Running full 24h review for all agents');
  runReview('full', 'all');
  AGENT_IDS.forEach(pruneMemory);
});

// Category-specific review every 6h
cron.schedule('0 */6 * * *', () => {
  for (const cat of MEMORY_CATEGORIES) {
    console.log(`[Scheduler] Running 6h review for category: ${cat}`);
    runReview(cat, 'all');
  }
  AGENT_IDS.forEach(pruneMemory);
});

console.log('Automated review scheduler started.'); 