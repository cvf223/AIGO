/**
 * 📱 TELEGRAM CAPITAL REQUEST NOTIFICATION SERVICE
 * ==============================================
 * 
 * 🎯 PURPOSE: Push time-sensitive capital request approvals to Telegram
 * 🚨 CRITICAL: Enables instant human response for profitable opportunities
 * ⏰ TIME-SENSITIVE: Perfect for multi-chain arbitrage windows
 * 
 * 🤝 HUMAN-IN-THE-LOOP INTEGRATION:
 * • Instant notifications with business case details
 * • Inline approval/rejection buttons
 * • Urgency-based formatting and emojis
 * • Direct integration with PortfolioManager
 */

import TelegramBot from 'node-telegram-bot-api';
import { EventEmitter } from 'events';

export class TelegramCapitalRequestService extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            botToken: config.botToken || process.env.TELEGRAM_BOT_TOKEN,
            chatId: config.chatId || process.env.TELEGRAM_CHAT_ID,
            webAppUrl: config.webAppUrl || process.env.WEB_APP_URL || 'http://localhost:3000',
            enableInlineButtons: config.enableInlineButtons !== false,
            urgencyEmojis: {
                'CRITICAL': '🚨⚡',
                'HIGH': '🔥📈',
                'MEDIUM': '💡📊',
                'LOW': '📋💭'
            },
            ...config
        };
        
        this.bot = null;
        this.activeRequests = new Map(); // requestId -> message details
        this.isInitialized = false;
        
        console.log('📱 Telegram Capital Request Service initialized');
    }
    
    /**
     * 🚀 INITIALIZE TELEGRAM BOT
     */
    async initialize() {
        try {
            if (!this.config.botToken) {
                throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
            }
            
            if (!this.config.chatId) {
                throw new Error('TELEGRAM_CHAT_ID environment variable is required');
            }
            
            this.bot = new TelegramBot(this.config.botToken, { polling: true });
            
            // Set up command handlers
            this.setupCommandHandlers();
            
            // Test connection
            const me = await this.bot.getMe();
            console.log(`✅ Telegram bot connected: @${me.username}`);
            
            // Send startup notification
            await this.sendStartupNotification();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Telegram bot:', error);
            throw error;
        }
    }
    
    /**
     * 🎯 SETUP COMMAND HANDLERS
     */
    setupCommandHandlers() {
        // Handle callback queries (button presses)
        this.bot.on('callback_query', async (callbackQuery) => {
            try {
                await this.handleCallbackQuery(callbackQuery);
            } catch (error) {
                console.error('❌ Error handling callback query:', error);
            }
        });
        
        // Handle text commands
        this.bot.on('message', async (msg) => {
            try {
                if (msg.text && msg.text.startsWith('/')) {
                    await this.handleCommand(msg);
                }
            } catch (error) {
                console.error('❌ Error handling command:', error);
            }
        });
    }
    
    /**
     * 🚨 SEND CAPITAL REQUEST NOTIFICATION
     * Main function called by PortfolioManager
     */
    async sendCapitalRequestNotification(requestData) {
        try {
            if (!this.isInitialized) {
                console.log('⚠️ Telegram service not initialized - skipping notification');
                return;
            }
            
            const {
                requestId,
                amount,
                roi,
                urgency,
                reason,
                securedProfitsAvailable,
                requestingAgent,
                businessCase,
                expiresAt
            } = requestData;
            
            // Format the message
            const message = this.formatCapitalRequestMessage({
                requestId,
                amount,
                roi,
                urgency,
                reason,
                securedProfitsAvailable,
                requestingAgent,
                businessCase,
                expiresAt
            });
            
            // Create inline keyboard for quick actions
            const keyboard = this.createCapitalRequestKeyboard(requestId, urgency);
            
            // Send notification
            const sentMessage = await this.bot.sendMessage(
                this.config.chatId,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard,
                    disable_notification: urgency === 'LOW' // Only notify for important requests
                }
            );
            
            // Store message details for later updates
            this.activeRequests.set(requestId, {
                messageId: sentMessage.message_id,
                chatId: this.config.chatId,
                timestamp: Date.now(),
                urgency: urgency
            });
            
            console.log(`📱 Telegram notification sent for capital request: ${requestId}`);
            console.log(`   💰 Amount: $${amount.toLocaleString()}`);
            console.log(`   🎯 ROI: ${roi.toFixed(2)}%`);
            console.log(`   ⏰ Urgency: ${urgency}`);
            
        } catch (error) {
            console.error('❌ Error sending Telegram notification:', error);
        }
    }
    
    /**
     * 📝 FORMAT CAPITAL REQUEST MESSAGE
     */
    formatCapitalRequestMessage(data) {
        const {
            requestId,
            amount,
            roi,
            urgency,
            reason,
            securedProfitsAvailable,
            requestingAgent,
            businessCase,
            expiresAt
        } = data;
        
        const urgencyEmoji = this.config.urgencyEmojis[urgency] || '📋';
        const timeLeft = Math.ceil((expiresAt - Date.now()) / (1000 * 60)); // minutes
        
        let message = `${urgencyEmoji} *CAPITAL REQUEST - ${urgency} PRIORITY*\n\n`;
        
        message += `🤖 *Agent:* ${requestingAgent}\n`;
        message += `💰 *Amount Needed:* $${amount.toLocaleString()}\n`;
        message += `🎯 *Expected ROI:* ${roi.toFixed(2)}%\n`;
        message += `⏰ *Time Left:* ${timeLeft} minutes\n`;
        message += `🔒 *Available:* $${securedProfitsAvailable.toLocaleString()}\n\n`;
        
        message += `📊 *Opportunity:*\n${reason}\n\n`;
        
        if (businessCase) {
            message += `💡 *Business Case:*\n`;
            message += `• Risk-Adjusted ROI: ${businessCase.riskAdjustedROI?.toFixed(2) || 'N/A'}%\n`;
            message += `• Confidence: ${((businessCase.confidence || 0.8) * 100).toFixed(0)}%\n`;
            message += `• Chains: ${businessCase.chainsInvolved?.join(' ↔ ') || 'Multi-chain'}\n`;
            message += `• Recommendation: ${businessCase.recommendation || 'REVIEW'}\n\n`;
        }
        
        message += `🆔 \`${requestId}\`\n`;
        message += `🌐 [Open Web Interface](${this.config.webAppUrl}/capital-requests)`;
        
        return message;
    }
    
    /**
     * ⌨️ CREATE INLINE KEYBOARD FOR CAPITAL REQUEST
     */
    createCapitalRequestKeyboard(requestId, urgency) {
        if (!this.config.enableInlineButtons) {
            return undefined;
        }
        
        const buttons = [];
        
        if (urgency === 'CRITICAL' || urgency === 'HIGH') {
            // Quick approve buttons for urgent requests
            buttons.push([
                { text: '✅ APPROVE FULL', callback_data: `approve_full_${requestId}` },
                { text: '❌ REJECT', callback_data: `reject_${requestId}` }
            ]);
            buttons.push([
                { text: '💰 APPROVE 50%', callback_data: `approve_half_${requestId}` },
                { text: '📊 MORE INFO', callback_data: `info_${requestId}` }
            ]);
        } else {
            // Standard buttons for normal requests
            buttons.push([
                { text: '✅ APPROVE', callback_data: `approve_full_${requestId}` },
                { text: '❌ REJECT', callback_data: `reject_${requestId}` }
            ]);
            buttons.push([
                { text: '📊 DETAILS', callback_data: `info_${requestId}` },
                { text: '🌐 WEB UI', url: `${this.config.webAppUrl}/capital-requests/${requestId}` }
            ]);
        }
        
        return { inline_keyboard: buttons };
    }
    
    /**
     * 📱 HANDLE CALLBACK QUERY (BUTTON PRESS)
     */
    async handleCallbackQuery(callbackQuery) {
        const { data: callbackData, message, from } = callbackQuery;
        const [action, param, requestId] = callbackData.split('_');
        
        try {
            // Acknowledge the callback query
            await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Processing...'
            });
            
            console.log(`📱 Telegram action: ${action} for request ${requestId} by ${from.username}`);
            
            switch (action) {
                case 'approve':
                    await this.handleApprovalAction(requestId, param, message, from);
                    break;
                    
                case 'reject':
                    await this.handleRejectionAction(requestId, message, from);
                    break;
                    
                case 'info':
                    await this.handleInfoAction(requestId, message);
                    break;
                    
                default:
                    console.log(`⚠️ Unknown callback action: ${action}`);
            }
            
        } catch (error) {
            console.error('❌ Error processing callback query:', error);
            
            await this.bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Error processing request. Please use web interface.',
                show_alert: true
            });
        }
    }
    
    /**
     * ✅ HANDLE APPROVAL ACTION
     */
    async handleApprovalAction(requestId, amountType, message, user) {
        try {
            // Emit approval event to PortfolioManager
            const approvalData = {
                requestId: requestId,
                amountType: amountType, // 'full' or 'half'
                approvedBy: user.username || user.first_name,
                approvalSource: 'telegram',
                timestamp: Date.now()
            };
            
            this.emit('capitalRequestApproved', approvalData);
            
            // Update the message
            await this.updateMessageWithResult(requestId, 'approved', {
                approvedBy: user.username || user.first_name,
                amountType: amountType
            });
            
        } catch (error) {
            console.error('❌ Error handling approval:', error);
        }
    }
    
    /**
     * ❌ HANDLE REJECTION ACTION  
     */
    async handleRejectionAction(requestId, message, user) {
        try {
            // Emit rejection event to PortfolioManager
            const rejectionData = {
                requestId: requestId,
                rejectedBy: user.username || user.first_name,
                rejectionSource: 'telegram',
                rejectionReason: 'Rejected via Telegram',
                timestamp: Date.now()
            };
            
            this.emit('capitalRequestRejected', rejectionData);
            
            // Update the message
            await this.updateMessageWithResult(requestId, 'rejected', {
                rejectedBy: user.username || user.first_name
            });
            
        } catch (error) {
            console.error('❌ Error handling rejection:', error);
        }
    }
    
    /**
     * 📊 HANDLE INFO ACTION
     */
    async handleInfoAction(requestId, message) {
        try {
            // Send detailed information about the request
            let infoMessage = `📊 *Request Details: ${requestId}*\n\n`;
            infoMessage += `For complete details and advanced options, please use the web interface:\n`;
            infoMessage += `🌐 ${this.config.webAppUrl}/capital-requests/${requestId}`;
            
            await this.bot.sendMessage(
                message.chat.id,
                infoMessage,
                { parse_mode: 'Markdown' }
            );
            
        } catch (error) {
            console.error('❌ Error showing info:', error);
        }
    }
    
    /**
     * 🔄 UPDATE MESSAGE WITH RESULT
     */
    async updateMessageWithResult(requestId, result, details) {
        try {
            const messageData = this.activeRequests.get(requestId);
            if (!messageData) return;
            
            let resultText = '';
            if (result === 'approved') {
                resultText = `✅ *APPROVED* by @${details.approvedBy}\n`;
                resultText += `💰 Amount: ${details.amountType === 'full' ? 'Full amount' : '50% of requested'}\n`;
                resultText += `⏰ Approved at: ${new Date().toLocaleTimeString()}`;
            } else if (result === 'rejected') {
                resultText = `❌ *REJECTED* by @${details.rejectedBy}\n`;
                resultText += `⏰ Rejected at: ${new Date().toLocaleTimeString()}`;
            }
            
            // Edit the original message to show the result
            await this.bot.editMessageReplyMarkup({}, {
                chat_id: messageData.chatId,
                message_id: messageData.messageId
            });
            
            // Send follow-up message with result
            await this.bot.sendMessage(
                messageData.chatId,
                resultText,
                { parse_mode: 'Markdown' }
            );
            
            // Remove from active requests
            this.activeRequests.delete(requestId);
            
        } catch (error) {
            console.error('❌ Error updating message:', error);
        }
    }
    
    /**
     * 🎬 SEND STARTUP NOTIFICATION
     */
    async sendStartupNotification() {
        try {
            let message = `🚀 *Elite Syndicate Capital Request System Online*\n\n`;
            message += `✅ Human-in-the-loop capital requests activated\n`;
            message += `📱 Telegram notifications enabled\n`;
            message += `⚡ Time-sensitive approval system ready\n`;
            message += `🔒 Secure fund movement tracking active\n\n`;
            message += `🌐 Web Interface: ${this.config.webAppUrl}`;
            
            await this.bot.sendMessage(
                this.config.chatId,
                message,
                { parse_mode: 'Markdown' }
            );
            
        } catch (error) {
            console.error('❌ Error sending startup notification:', error);
        }
    }
    
    /**
     * 💬 HANDLE TEXT COMMANDS
     */
    async handleCommand(msg) {
        const command = msg.text.toLowerCase();
        
        switch (command) {
            case '/status':
                await this.sendStatusUpdate(msg.chat.id);
                break;
                
            case '/requests':
                await this.sendActiveRequests(msg.chat.id);
                break;
                
            case '/help':
                await this.sendHelpMessage(msg.chat.id);
                break;
                
            default:
                console.log(`⚠️ Unknown command: ${command}`);
        }
    }
    
    /**
     * 📊 SEND STATUS UPDATE
     */
    async sendStatusUpdate(chatId) {
        try {
            const activeCount = this.activeRequests.size;
            
            let message = `📊 *Elite Syndicate Status*\n\n`;
            message += `🤝 Active Capital Requests: ${activeCount}\n`;
            message += `📱 Telegram Service: ✅ Online\n`;
            message += `🔔 Notifications: ✅ Enabled\n`;
            message += `⏰ Last Update: ${new Date().toLocaleTimeString()}\n\n`;
            message += `🌐 [Open Web Interface](${this.config.webAppUrl})`;
            
            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('❌ Error sending status:', error);
        }
    }
    
    /**
     * 📋 SEND ACTIVE REQUESTS
     */
    async sendActiveRequests(chatId) {
        try {
            const activeRequests = Array.from(this.activeRequests.entries());
            
            let message = `📋 *Active Capital Requests*\n\n`;
            
            if (activeRequests.length === 0) {
                message += `No active requests at the moment.\n\n`;
            } else {
                activeRequests.forEach(([requestId, data], index) => {
                    const timeAgo = Math.floor((Date.now() - data.timestamp) / (1000 * 60));
                    message += `${index + 1}. \`${requestId.substring(0, 12)}...\`\n`;
                    message += `   ⏰ ${timeAgo} min ago (${data.urgency})\n\n`;
                });
            }
            
            message += `🌐 [View All Details](${this.config.webAppUrl}/capital-requests)`;
            
            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('❌ Error sending active requests:', error);
        }
    }
    
    /**
     * ❓ SEND HELP MESSAGE
     */
    async sendHelpMessage(chatId) {
        try {
            let message = `❓ *Elite Syndicate Help*\n\n`;
            message += `*Available Commands:*\n`;
            message += `/status - Show system status\n`;
            message += `/requests - List active capital requests\n`;
            message += `/help - Show this help message\n\n`;
            message += `*Inline Buttons:*\n`;
            message += `✅ APPROVE - Approve full amount\n`;
            message += `💰 APPROVE 50% - Approve half amount\n`;
            message += `❌ REJECT - Reject the request\n`;
            message += `📊 DETAILS - Show more information\n\n`;
            message += `🌐 [Web Interface](${this.config.webAppUrl})`;
            
            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('❌ Error sending help:', error);
        }
    }
    
    /**
     * 🔄 CLEAN UP EXPIRED REQUESTS
     */
    cleanupExpiredRequests() {
        const now = Date.now();
        const expiredRequests = [];
        
        for (const [requestId, data] of this.activeRequests.entries()) {
            // Remove requests older than 1 hour
            if (now - data.timestamp > 3600000) {
                expiredRequests.push(requestId);
            }
        }
        
        expiredRequests.forEach(requestId => {
            this.activeRequests.delete(requestId);
            console.log(`🗑️ Cleaned up expired Telegram request: ${requestId}`);
        });
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        try {
            if (this.bot) {
                await this.bot.stopPolling();
                console.log('📱 Telegram bot stopped');
            }
        } catch (error) {
            console.error('❌ Error shutting down Telegram service:', error);
        }
    }
}

// Export for ES modules
export default TelegramCapitalRequestService;
