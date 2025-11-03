#!/usr/bin/env node

/**
 * 🚀 TELEGRAM COORDINATION SYSTEM
 * ==============================
 * 
 * Multi-agent coordination via Telegram with individual bots per agent
 * - Real-time opportunity alerts
 * - Agent status monitoring
 * - Command execution
 * - Performance reporting
 */

import { Telegraf } from 'telegraf';
import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

// Load environment variables
dotenv.config();

// Create event emitter for coordination events
export const coordinationEvents = new EventEmitter();

// Constants
const WEBHOOK_PORT = parseInt(process.env.TELEGRAM_WEBHOOK_PORT || '8443');
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const ADMIN_CHAT_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').filter(Boolean);
const AGENT_CONFIG_DIR = path.join(process.cwd(), 'config', 'agents');

/**
 * 🤖 Telegram Agent Bot
 */
class TelegramAgentBot {
  constructor(config) {
    this.config = {
      name: 'unknown',
      token: '',
      chatIds: [],
      commands: new Map(),
      messageHandlers: new Map(),
      callbackHandlers: new Map(),
      ...config
    };

    this.bot = null;
    this.isInitialized = false;
    this.lastStatus = 'offline';
    this.messageQueue = [];
    this.maxQueueSize = 100;
  }

  /**
   * 🚀 Initialize the bot
   */
  async initialize() {
    if (!this.config.token) {
      throw new Error(`No token provided for bot ${this.config.name}`);
    }

    try {
      // Create bot instance
      this.bot = new Telegraf(this.config.token);
      
      // Set up command handlers
      this.setupCommands();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      // Set up callback handlers
      this.setupCallbackHandlers();
      
      // Set up error handling
      this.bot.catch((err, ctx) => {
        console.error(`Error in bot ${this.config.name}:`, err);
        ctx.reply(`❌ Error: ${err.message}`).catch(console.error);
      });
      
      // Mark as initialized
      this.isInitialized = true;
      this.lastStatus = 'online';
      
      console.log(`✅ Bot ${this.config.name} initialized`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize bot ${this.config.name}:`, error);
      return false;
    }
  }

  /**
   * 🔄 Set up command handlers
   */
  setupCommands() {
    // Default commands
    this.bot.command('start', (ctx) => {
      const message = `🤖 *${this.config.name}* is online and ready!\n\n` +
        `Type /help to see available commands.`;
      ctx.replyWithMarkdown(message).catch(console.error);
    });

    this.bot.command('help', (ctx) => {
      const commands = Array.from(this.config.commands.keys()).map(cmd => `/${cmd}`).join('\n');
      const message = `🤖 *${this.config.name}* - Available Commands:\n\n` +
        `${commands || 'No commands available'}`;
      ctx.replyWithMarkdown(message).catch(console.error);
    });

    this.bot.command('status', (ctx) => {
      const message = `🤖 *${this.config.name}* Status:\n\n` +
        `Status: ${this.lastStatus}\n` +
        `Uptime: ${this.getUptime()}\n` +
        `Message Queue: ${this.messageQueue.length}/${this.maxQueueSize}`;
      ctx.replyWithMarkdown(message).catch(console.error);
    });

    // Custom commands
    for (const [command, handler] of this.config.commands.entries()) {
      this.bot.command(command, handler);
    }
  }

  /**
   * 🔄 Set up message handlers
   */
  setupMessageHandlers() {
    // Default message handler
    this.bot.on('text', (ctx) => {
      const text = ctx.message.text;
      let handled = false;

      // Check if any handler matches
      for (const [pattern, handler] of this.config.messageHandlers.entries()) {
        if (text.match(new RegExp(pattern, 'i'))) {
          handler(ctx);
          handled = true;
          break;
        }
      }

      // If no handler matched, provide a default response
      if (!handled) {
        ctx.reply(`I don't understand that command. Type /help to see available commands.`)
          .catch(console.error);
      }
    });
  }

  /**
   * 🔄 Set up callback handlers
   */
  setupCallbackHandlers() {
    // Handle callback queries
    this.bot.on('callback_query', (ctx) => {
      const data = ctx.callbackQuery.data;
      let handled = false;

      // Check if any handler matches
      for (const [pattern, handler] of this.config.callbackHandlers.entries()) {
        if (data.match(new RegExp(pattern, 'i'))) {
          handler(ctx);
          handled = true;
          break;
        }
      }

      // If no handler matched, provide a default response
      if (!handled) {
        ctx.answerCbQuery('Unknown callback').catch(console.error);
      }
    });
  }

  /**
   * 📤 Send message to all registered chat IDs
   */
  async sendMessage(message, options = {}) {
    if (!this.isInitialized || !this.bot) {
      // Queue message for later
      if (this.messageQueue.length < this.maxQueueSize) {
        this.messageQueue.push({ message, options });
      }
      return false;
    }

    try {
      const results = [];
      for (const chatId of this.config.chatIds) {
        try {
          const result = await this.bot.telegram.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            ...options
          });
          results.push(result);
        } catch (error) {
          console.error(`Failed to send message to chat ${chatId}:`, error);
        }
      }
      return results.length > 0;
    } catch (error) {
      console.error(`Failed to send message:`, error);
      return false;
    }
  }

  /**
   * 📊 Send opportunity alert
   */
  async sendOpportunityAlert(opportunity) {
    const message = `🔥 *Arbitrage Opportunity Detected!*\n\n` +
      `Chain: ${opportunity.chain}\n` +
      `DEXes: ${opportunity.dexes.join(' → ')}\n` +
      `Tokens: ${opportunity.path.join(' → ')}\n` +
      `Profit: $${opportunity.profitUsd.toFixed(2)} (${(opportunity.profitPercent * 100).toFixed(2)}%)\n` +
      `Confidence: ${(opportunity.confidence * 100).toFixed(0)}%\n\n` +
      `Status: ${opportunity.status || 'Pending'}`;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Execute', callback_data: `execute:${opportunity.id}` },
            { text: '❌ Ignore', callback_data: `ignore:${opportunity.id}` }
          ],
          [
            { text: '🔍 Details', callback_data: `details:${opportunity.id}` }
          ]
        ]
      }
    };

    return this.sendMessage(message, options);
  }

  /**
   * 📊 Send performance report
   */
  async sendPerformanceReport(report) {
    const message = `📊 *Performance Report*\n\n` +
      `Period: ${report.period}\n` +
      `Opportunities Detected: ${report.opportunitiesDetected}\n` +
      `Opportunities Executed: ${report.opportunitiesExecuted}\n` +
      `Success Rate: ${(report.successRate * 100).toFixed(2)}%\n` +
      `Total Profit: $${report.totalProfitUsd.toFixed(2)}\n` +
      `Average Profit: $${report.averageProfitUsd.toFixed(2)}\n` +
      `Gas Spent: $${report.gasSpentUsd.toFixed(2)}\n` +
      `Net Profit: $${report.netProfitUsd.toFixed(2)}`;

    return this.sendMessage(message);
  }

  /**
   * 📊 Send status update
   */
  async sendStatusUpdate(status) {
    this.lastStatus = status.status;
    
    const message = `📡 *Status Update*\n\n` +
      `Agent: ${this.config.name}\n` +
      `Status: ${status.status}\n` +
      `Message: ${status.message || 'No message'}\n` +
      `Timestamp: ${new Date().toISOString()}`;

    return this.sendMessage(message);
  }

  /**
   * ⏱️ Get uptime
   */
  getUptime() {
    // This is a placeholder - in a real implementation you'd track the actual start time
    return '1h 23m 45s';
  }

  /**
   * 🧹 Process queued messages
   */
  async processQueue() {
    if (!this.isInitialized || !this.bot || this.messageQueue.length === 0) {
      return 0;
    }

    let processed = 0;
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const item of queue) {
      try {
        await this.sendMessage(item.message, item.options);
        processed++;
      } catch (error) {
        console.error('Failed to process queued message:', error);
        // Re-queue if we haven't exceeded the max queue size
        if (this.messageQueue.length < this.maxQueueSize) {
          this.messageQueue.push(item);
        }
      }
    }

    return processed;
  }

  /**
   * 🧹 Clean up resources
   */
  async shutdown() {
    if (this.bot) {
      try {
        await this.sendStatusUpdate({ status: 'offline', message: 'Bot is shutting down' });
        await this.bot.stop();
        console.log(`Bot ${this.config.name} shut down`);
      } catch (error) {
        console.error(`Failed to shut down bot ${this.config.name}:`, error);
      }
    }
    return true;
  }
}

/**
 * 🚀 Telegram Coordination System
 */
export class TelegramCoordinationSystem {
  constructor(config = {}) {
    this.config = {
      webhookPort: WEBHOOK_PORT,
      adminChatIds: ADMIN_CHAT_IDS,
      agentConfigDir: AGENT_CONFIG_DIR,
      ...config
    };

    // Initialize state
    this.agents = new Map();
    this.webhookServer = null;
    this.ngrokProcess = null;
    this.webhookUrl = null;
  }

  /**
   * 🚀 Initialize the coordination system
   */
  async initialize() {
    console.log('🚀 Initializing Telegram Coordination System...');
    
    try {
      // Create agent config directory if it doesn't exist
      await fs.mkdir(this.config.agentConfigDir, { recursive: true });
      
      // Start webhook server
      await this.startWebhookServer();
      
      // Start ngrok tunnel if needed
      if (!process.env.TELEGRAM_WEBHOOK_URL) {
        await this.startNgrokTunnel();
      } else {
        this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
      }
      
      // Load agent configurations
      await this.loadAgentConfigurations();
      
      // Initialize admin bot
      await this.initializeAdminBot();
      
      console.log('✅ Telegram Coordination System initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram Coordination System:', error);
      return false;
    }
  }

  /**
   * 🔄 Start webhook server
   */
  async startWebhookServer() {
    try {
      const app = express();
      
      // Set up middleware
      app.use(express.json());
      
      // Health check endpoint
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
      });
      
      // Dynamic webhook endpoint for each agent
      app.post('/telegram-webhook/:agentName', async (req, res) => {
        const { agentName } = req.params;
        const agent = this.agents.get(agentName);
        
        if (!agent || !agent.bot) {
          console.warn(`Received webhook for unknown agent: ${agentName}`);
          return res.status(404).json({ error: 'Agent not found' });
        }
        
        try {
          await agent.bot.handleUpdate(req.body);
          res.status(200).json({ status: 'ok' });
        } catch (error) {
          console.error(`Error handling webhook for agent ${agentName}:`, error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
      // Start the server
      this.webhookServer = app.listen(this.config.webhookPort, () => {
        console.log(`📡 Webhook server listening on port ${this.config.webhookPort}`);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start webhook server:', error);
      throw error;
    }
  }

  /**
   * 🔄 Start ngrok tunnel
   */
  async startNgrokTunnel() {
    return new Promise((resolve, reject) => {
      try {
        const ngrok = spawn('ngrok', ['http', this.config.webhookPort.toString(), '--log=stdout']);
        this.ngrokProcess = ngrok;
        
        ngrok.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`Ngrok: ${output}`);
          
          // Look for the forwarding URL in ngrok output
          const match = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
          if (match && !this.webhookUrl) {
            this.webhookUrl = match[0];
            console.log(`🔗 Ngrok tunnel established at: ${this.webhookUrl}`);
            resolve(this.webhookUrl);
          }
        });
        
        ngrok.stderr.on('data', (data) => {
          console.error(`Ngrok error: ${data}`);
        });
        
        ngrok.on('close', (code) => {
          if (code !== 0) {
            const error = new Error(`Ngrok process exited with code ${code}`);
            if (!this.webhookUrl) {
              reject(error);
            } else {
              console.error(error);
            }
          }
        });
        
        // Set a timeout in case ngrok doesn't start properly
        setTimeout(() => {
          if (!this.webhookUrl) {
            reject(new Error('Ngrok tunnel setup timed out'));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🔄 Load agent configurations
   */
  async loadAgentConfigurations() {
    try {
      // Check if agent config directory exists
      try {
        await fs.access(this.config.agentConfigDir);
      } catch (error) {
        console.log(`Creating agent config directory: ${this.config.agentConfigDir}`);
        await fs.mkdir(this.config.agentConfigDir, { recursive: true });
        return [];
      }
      
      // Read agent config files
      const files = await fs.readdir(this.config.agentConfigDir);
      const configFiles = files.filter(file => file.endsWith('.json'));
      
      if (configFiles.length === 0) {
        console.log('No agent configurations found');
        return [];
      }
      
      // Load each configuration
      const configs = [];
      for (const file of configFiles) {
        try {
          const configPath = path.join(this.config.agentConfigDir, file);
          const configJson = await fs.readFile(configPath, 'utf8');
          const config = JSON.parse(configJson);
          configs.push(config);
        } catch (error) {
          console.error(`Failed to load agent configuration from ${file}:`, error);
        }
      }
      
      return configs;
    } catch (error) {
      console.error('Failed to load agent configurations:', error);
      return [];
    }
  }

  /**
   * 🤖 Initialize admin bot
   */
  async initializeAdminBot() {
    if (!TELEGRAM_API_TOKEN) {
      console.warn('No Telegram API token provided for admin bot');
      return false;
    }
    
    try {
      const adminBot = new TelegramAgentBot({
        name: 'AdminBot',
        token: TELEGRAM_API_TOKEN,
        chatIds: this.config.adminChatIds,
        commands: new Map([
          ['agents', (ctx) => this.handleAdminAgentsCommand(ctx)],
          ['broadcast', (ctx) => this.handleAdminBroadcastCommand(ctx)],
          ['register', (ctx) => this.handleAdminRegisterCommand(ctx)]
        ])
      });
      
      await adminBot.initialize();
      this.agents.set('admin', adminBot);
      
      // Send startup message
      await adminBot.sendMessage('🚀 *Arbitrage Coordination System Online*\n\nType /help to see available commands.');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize admin bot:', error);
      return false;
    }
  }

  /**
   * 🤖 Handle admin /agents command
   */
  async handleAdminAgentsCommand(ctx) {
    const agents = Array.from(this.agents.entries())
      .map(([name, agent]) => `- ${name}: ${agent.lastStatus}`)
      .join('\n');
    
    const message = `🤖 *Registered Agents*\n\n${agents || 'No agents registered'}`;
    ctx.replyWithMarkdown(message).catch(console.error);
  }

  /**
   * 🤖 Handle admin /broadcast command
   */
  async handleAdminBroadcastCommand(ctx) {
    const text = ctx.message.text.replace(/^\/broadcast\s+/, '').trim();
    
    if (!text) {
      ctx.reply('Usage: /broadcast <message>').catch(console.error);
      return;
    }
    
    let successCount = 0;
    for (const [name, agent] of this.agents.entries()) {
      if (name !== 'admin') {
        const success = await agent.sendMessage(`📢 *Broadcast from Admin*\n\n${text}`);
        if (success) successCount++;
      }
    }
    
    ctx.reply(`Broadcast sent to ${successCount} agents`).catch(console.error);
  }

  /**
   * 🤖 Handle admin /register command
   */
  async handleAdminRegisterCommand(ctx) {
    const text = ctx.message.text.replace(/^\/register\s+/, '').trim();
    const parts = text.split(' ');
    
    if (parts.length < 2) {
      ctx.reply('Usage: /register <agent_name> <token>').catch(console.error);
      return;
    }
    
    const name = parts[0];
    const token = parts[1];
    
    try {
      // Create agent configuration
      const config = {
        name,
        token,
        chatIds: [ctx.message.chat.id],
        commands: new Map(),
        messageHandlers: new Map(),
        callbackHandlers: new Map()
      };
      
      // Save configuration
      const configPath = path.join(this.config.agentConfigDir, `${name}.json`);
      await fs.writeFile(configPath, JSON.stringify({
        name,
        token,
        chatIds: [ctx.message.chat.id]
      }, null, 2));
      
      // Initialize agent
      const agent = new TelegramAgentBot(config);
      await agent.initialize();
      
      // Register agent
      this.agents.set(name, agent);
      
      ctx.reply(`✅ Agent ${name} registered successfully`).catch(console.error);
    } catch (error) {
      console.error(`Failed to register agent ${name}:`, error);
      ctx.reply(`❌ Failed to register agent: ${error.message}`).catch(console.error);
    }
  }

  /**
   * 🤖 Register an agent
   */
  async registerAgent(config) {
    try {
      if (!config.name || !config.token) {
        throw new Error('Agent name and token are required');
      }
      
      // Check if agent already exists
      if (this.agents.has(config.name)) {
        throw new Error(`Agent ${config.name} already exists`);
      }
      
      // Create agent
      const agent = new TelegramAgentBot(config);
      await agent.initialize();
      
      // Register agent
      this.agents.set(config.name, agent);
      
      // Save configuration
      const configPath = path.join(this.config.agentConfigDir, `${config.name}.json`);
      await fs.writeFile(configPath, JSON.stringify({
        name: config.name,
        token: config.token,
        chatIds: config.chatIds || []
      }, null, 2));
      
      console.log(`✅ Agent ${config.name} registered`);
      
      // Notify admin
      const adminBot = this.agents.get('admin');
      if (adminBot) {
        await adminBot.sendMessage(`✅ Agent ${config.name} registered`);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to register agent:`, error);
      return false;
    }
  }

  /**
   * 📤 Send opportunity alert
   */
  async sendOpportunityAlert(agentName, opportunity) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      console.warn(`Agent ${agentName} not found for opportunity alert`);
      return false;
    }
    
    return agent.sendOpportunityAlert(opportunity);
  }

  /**
   * 📤 Send performance report
   */
  async sendPerformanceReport(agentName, report) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      console.warn(`Agent ${agentName} not found for performance report`);
      return false;
    }
    
    return agent.sendPerformanceReport(report);
  }

  /**
   * 📤 Send status update
   */
  async sendStatusUpdate(agentName, status) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      console.warn(`Agent ${agentName} not found for status update`);
      return false;
    }
    
    return agent.sendStatusUpdate(status);
  }

  /**
   * 📤 Broadcast message to all agents
   */
  async broadcastMessage(message, options = {}) {
    let successCount = 0;
    for (const [name, agent] of this.agents.entries()) {
      const success = await agent.sendMessage(message, options);
      if (success) successCount++;
    }
    return successCount;
  }

  /**
   * 🧹 Clean up resources
   */
  async shutdown() {
    console.log('🧹 Shutting down Telegram Coordination System...');
    
    // Shut down all agents
    for (const [name, agent] of this.agents.entries()) {
      try {
        await agent.shutdown();
      } catch (error) {
        console.error(`Failed to shut down agent ${name}:`, error);
      }
    }
    
    // Stop webhook server
    if (this.webhookServer) {
      try {
        this.webhookServer.close();
      } catch (error) {
        console.error('Failed to stop webhook server:', error);
      }
    }
    
    // Stop ngrok process
    if (this.ngrokProcess) {
      try {
        this.ngrokProcess.kill();
      } catch (error) {
        console.error('Failed to stop ngrok process:', error);
      }
    }
    
    console.log('✅ Telegram Coordination System shut down');
    return true;
  }
}

/**
 * 🚀 Create and initialize a coordination system instance
 */
export async function createCoordinationSystem(config = {}) {
  const system = new TelegramCoordinationSystem(config);
  await system.initialize();
  return system;
}

// Run as standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log('🚀 Starting Telegram Coordination System in standalone mode...');
      
      const system = await createCoordinationSystem();
      
      // Register test agent if token is provided
      const testToken = process.env.TELEGRAM_TEST_BOT_TOKEN;
      if (testToken) {
        await system.registerAgent({
          name: 'TestAgent',
          token: testToken,
          chatIds: ADMIN_CHAT_IDS
        });
        
        // Send test message
        await system.sendStatusUpdate('TestAgent', {
          status: 'testing',
          message: 'This is a test message'
        });
        
        // Send test opportunity
        await system.sendOpportunityAlert('TestAgent', {
          id: 'test-opportunity-1',
          chain: 'Arbitrum',
          dexes: ['Uniswap V3', 'SushiSwap'],
          path: ['WETH', 'USDC', 'WETH'],
          profitUsd: 123.45,
          profitPercent: 0.0234,
          confidence: 0.95,
          status: 'Detected'
        });
      }
      
      // Keep process alive
      console.log('🔄 Press Ctrl+C to exit...');
      
      // Handle shutdown
      process.on('SIGINT', async () => {
        console.log('Received SIGINT, shutting down...');
        await system.shutdown();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Error in standalone mode:', error);
      process.exit(1);
    }
  })();
} 