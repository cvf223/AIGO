import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { handlePlanCommand, parsePlanCommand, getBestAgentsForPlan } from './plan-orchestrator.js';
import { allAgents } from './agents-registry.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Send /plan "Task name" "instructions" to assign a plan to agents.'));

bot.hears(/^\/plan\s+"([^"]+)"\s+"([^"]+)"/, async (ctx) => {
  const text = ctx.message.text;
  const parsed = parsePlanCommand(text);
  if (!parsed) {
    ctx.reply('Invalid /plan command format. Use: /plan "Task name" "instructions"');
    return;
  }
  ctx.reply('Processing your plan...');
  try {
    // Monkey-patch console.log to capture output
    let output = '';
    const origLog = console.log;
    console.log = (...args) => { output += args.join(' ') + '\n'; origLog(...args); };
    await handlePlanCommand(text);
    console.log = origLog;

    // Compose agent selection summary
    const plan = output.match(/Plan generated: ([\s\S]+?)\nSelected agents:/);
    const planSummary = plan ? plan[1] : '';
    const selected = getBestAgentsForPlan(JSON.parse(planSummary), allAgents);
    let agentMsg = 'Selected agents for this plan:\n';
    for (const agent of selected) {
      // Calculate specialty match score
      const score = JSON.parse(planSummary).subtasks.reduce((acc, st) =>
        acc + agent.specialties.filter(s => st.description.toLowerCase().includes(s)).length, 0);
      agentMsg += `- ${agent.name} (LLM: ${agent.llm}, Risk: ${agent.riskProfile})\n  Reason: Specialty match score = ${score}\n`;
    }
    ctx.reply(agentMsg + '\nPlan summary:\n' + planSummary);
  } catch (err) {
    ctx.reply('Error processing plan: ' + err.message);
  }
});

bot.launch();

console.log('Plan Telegram bridge running.'); 