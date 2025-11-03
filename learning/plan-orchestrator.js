// agent/scripts/plan-orchestrator.js
// Ready-to-run /plan orchestrator for multi-agent plan assignment and execution

import dotenv from 'dotenv';
dotenv.config();

import { agentCapabilities, assignCollaborativeSubtask } from './agent-capabilities.js';
import { saveAgentPlan } from './agent-memory-utils.js';
import { decomposeTaskWithLLM } from './agent-plan-utils.js';
import { allAgents } from './agents-registry.js';
import { Telegraf } from 'telegraf';

const TELEGRAM_BOT_TOKEN = process.env.MASTERMIND_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_GROUP_ID = process.env.MASTERMIND_GROUP_ID;
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Parse: /plan "Task name" "instructions"
function parsePlanCommand(text) {
  const match = text.match(/^\/plan\s+"([^"]+)"\s+"([^"]+)"/i);
  if (match) {
    return { task: match[1], instructions: match[2] };
  }
  return null;
}

async function handlePlanCommand(text) {
  const parsed = parsePlanCommand(text);
  if (!parsed) {
    console.log('Invalid /plan command format. Use: /plan "Task name" "instructions"');
    return;
  }
  const { task, instructions } = parsed;

  // 1. Decompose the plan
  console.log('Decomposing plan with LLM...');
  const plan = await decomposeTaskWithLLM(task, instructions, {
    capabilitys: agentCapabilities.map(c => c.name),
    expansionPossibility: []
  });
  console.log('Plan generated:', JSON.stringify(plan, null, 2));

  // 2. Detect collaborative subtasks and build per-agent plans
  const agentPlans = {};
  let reviewerAgent = null;
  for (const subtask of plan.subtasks) {
    if (subtask.assignedAgents && Array.isArray(subtask.assignedAgents) && subtask.assignedAgents.length > 0) {
      // Collaborative subtask: assign to each agent
      await assignCollaborativeSubtask(subtask, subtask.assignedAgents, instructions, TELEGRAM_GROUP_ID, bot);
      for (const agentId of subtask.assignedAgents) {
        if (!agentPlans[agentId]) agentPlans[agentId] = { ...plan, subtasks: [] };
        // Each agent gets their own copy
        agentPlans[agentId].subtasks.push({ ...subtask, assignedAgents: undefined });
      }
      // If a reviewer is specified, assign a review subtask
      if (subtask.reviewerAgent) {
        reviewerAgent = subtask.reviewerAgent;
        if (!agentPlans[reviewerAgent]) agentPlans[reviewerAgent] = { ...plan, subtasks: [] };
        agentPlans[reviewerAgent].subtasks.push({
          description: `Review and aggregate results for: ${subtask.description}`,
          method: 'reviewResults',
          dependsOn: subtask.assignedAgents,
          context: instructions,
          status: 'pending',
        });
      }
    } else if (subtask.assignedAgent) {
      // Single-agent subtask
      const agentId = subtask.assignedAgent;
      if (!agentPlans[agentId]) agentPlans[agentId] = { ...plan, subtasks: [] };
      agentPlans[agentId].subtasks.push(subtask);
    } else {
      // Fallback: assign to all selected agents (legacy behavior)
      const selectedAgents = getBestAgentsForPlan(plan, allAgents);
      for (const agent of selectedAgents) {
        if (!agentPlans[agent.id]) agentPlans[agent.id] = { ...plan, subtasks: [] };
        agentPlans[agent.id].subtasks.push(subtask);
      }
    }
  }

  // 3. Save and trigger per-agent plans
  for (const [agentId, agentPlan] of Object.entries(agentPlans)) {
    saveAgentPlan(agentId, agentPlan);
    if (typeof globalThis.executeAgentPlan === 'function') {
      await globalThis.executeAgentPlan(agentId);
    }
    await bot.telegram.sendMessage(
      TELEGRAM_GROUP_ID,
      `📋 Assigned plan to *${agentId}* with ${agentPlan.subtasks.length} subtasks.`,
      { parse_mode: 'MarkdownV2' }
    );
    console.log(`Assigned plan to agent ${agentId}`);
  }
}

// Helper: Select 3 agents with best fit and required diversity
function getBestAgentsForPlan(plan, agents) {
  // Score agents by specialty match
  const scored = agents.map(agent => ({
    ...agent,
    score: plan.subtasks.reduce((acc, st) =>
      acc + agent.specialties.filter(s => st.description.toLowerCase().includes(s)).length, 0)
  }));
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Try all combinations of 3 agents, pick one where at least one differs in LLM or risk profile
  const combos = getAllCombinations(scored, 3);
  for (const combo of combos) {
    const llms = new Set(combo.map(a => a.llm));
    const risks = new Set(combo.map(a => a.riskProfile));
    if (llms.size > 1 || risks.size > 1) {
      return combo;
    }
  }
  // Fallback: just pick top 3
  return scored.slice(0, 3);
}

function getAllCombinations(arr, k) {
  const results = [];
  function helper(start, combo) {
    if (combo.length === k) {
      results.push(combo);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      helper(i + 1, combo.concat([arr[i]]));
    }
  }
  helper(0, []);
  return results;
}

// CLI usage: node plan-orchestrator.js '/plan "Task name" "instructions"'
if (process.argv.length > 2) {
  const input = process.argv.slice(2).join(' ');
  handlePlanCommand(input).catch(err => {
    console.error('Error handling /plan command:', err);
    process.exit(1);
  });
} else {
  console.log('Usage: node agent/scripts/plan-orchestrator.js \'/plan "Task name" "instructions"\'');
  if (process.argv.length <= 2) {
    // If no CLI args, keep the process alive
    setInterval(() => {}, 1 << 30);
  }
}

export { handlePlanCommand, parsePlanCommand, getBestAgentsForPlan }; 