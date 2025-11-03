/**
 * 📧 MAILBOX NEWSLETTER ENGINE
 * ===========================
 * 
 * DIRECT mailbox integration - no predictions, real email scanning
 * FOCUS-BASED analysis marking system
 * AGENT-DRIVEN focus creation and rotation
 * 
 * REAL WORLD: Connects to actual email accounts
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { EventEmitter } from 'events';

export class MailboxNewsletterEngine extends EventEmitter {
    constructor(emailConfig, learningEngine) {
        super();
        
        this.emailConfig = emailConfig;
        this.learningEngine = learningEngine;
        this.imapClient = null;
        this.isConnected = false;
        
        // FOCUS-BASED ANALYSIS TRACKING
        this.emailAnalysisStatus = new Map(); // emailId -> { focus1: true, focus2: false, etc }
        this.availableFocuses = new Set(['balanced_discovery']); // Agent can add more
        this.currentFocus = 'balanced_discovery';
        this.focusRotationQueue = [];
        
        // MAILBOX SCANNING STATE
        this.totalUnreadEmails = 0;
        this.newsletterEmails = [];
        this.lastScanTime = null;
        this.scanInProgress = false;
        
        console.log('📧 Mailbox Newsletter Engine initialized');
        console.log('   📬 Direct mailbox integration - NO predictions');
        console.log('   🎯 Focus-based analysis marking system');
        console.log('   🤖 Agent-driven focus creation enabled');
    }

    /**
     * 🔌 CONNECT TO MAILBOX
     */
    async connectToMailbox() {
        try {
            console.log('🔌 Connecting to mailbox...');
            
            this.imapClient = new ImapFlow({
                host: this.emailConfig.host,
                port: this.emailConfig.port || 993,
                secure: true,
                auth: {
                    user: this.emailConfig.username,
                    pass: this.emailConfig.password
                },
                logger: false // Disable logging for cleaner output
            });
            
            await this.imapClient.connect();
            this.isConnected = true;
            
            console.log('✅ Connected to mailbox successfully');
            console.log(`   📧 Account: ${this.emailConfig.username}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to connect to mailbox:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * 📬 SCAN MAILBOX FOR UNREAD NEWSLETTERS
     */
    async scanMailboxForNewsletters() {
        if (!this.isConnected) {
            console.log('⚠️ Not connected to mailbox - attempting connection...');
            const connected = await this.connectToMailbox();
            if (!connected) return null;
        }
        
        if (this.scanInProgress) {
            console.log('⚠️ Scan already in progress...');
            return null;
        }
        
        this.scanInProgress = true;
        console.log('📬 SCANNING MAILBOX for unread newsletters...');
        
        try {
            // Select INBOX
            let lock = await this.imapClient.getMailboxLock('INBOX');
            
            try {
                // Search for unread emails
                const searchResults = await this.imapClient.search({
                    unseen: true
                });
                
                console.log(`📊 Found ${searchResults.length} unread emails`);
                this.totalUnreadEmails = searchResults.length;
                
                if (searchResults.length === 0) {
                    console.log('📭 No unread emails found');
                    return { newsletters: [], totalUnread: 0 };
                }
                
                // Fetch email details
                const newsletters = [];
                
                for await (let message of this.imapClient.fetch(searchResults, {
                    envelope: true,
                    bodyStructure: true,
                    source: true,
                    uid: true
                })) {
                    
                    // Check if this looks like a newsletter
                    if (this.isNewsletterEmail(message)) {
                        const parsedEmail = await this.parseEmailContent(message);
                        
                        if (parsedEmail) {
                            // Check analysis status for this email
                            const analysisStatus = this.getEmailAnalysisStatus(message.uid);
                            
                            newsletters.push({
                                uid: message.uid,
                                subject: message.envelope.subject,
                                from: message.envelope.from[0],
                                date: message.envelope.date,
                                content: parsedEmail.text || parsedEmail.html || '',
                                analysisStatus,
                                needsAnalysis: this.needsAnalysisWithCurrentFocus(analysisStatus)
                            });
                        }
                    }
                }
                
                console.log(`📰 Identified ${newsletters.length} newsletter emails`);
                console.log(`🎯 ${newsletters.filter(n => n.needsAnalysis).length} need analysis with current focus: ${this.currentFocus}`);
                
                this.newsletterEmails = newsletters;
                this.lastScanTime = Date.now();
                
                return {
                    newsletters,
                    totalUnread: this.totalUnreadEmails,
                    needsAnalysis: newsletters.filter(n => n.needsAnalysis).length,
                    currentFocus: this.currentFocus
                };
                
            } finally {
                lock.release();
            }
            
        } catch (error) {
            console.error('❌ Failed to scan mailbox:', error.message);
            return null;
        } finally {
            this.scanInProgress = false;
        }
    }

    /**
     * 📧 CHECK IF EMAIL IS A NEWSLETTER
     */
    isNewsletterEmail(message) {
        const subject = message.envelope.subject?.toLowerCase() || '';
        const fromAddress = message.envelope.from[0]?.address?.toLowerCase() || '';
        const fromName = message.envelope.from[0]?.name?.toLowerCase() || '';
        
        // Newsletter indicators
        const newsletterIndicators = [
            // Subject indicators
            'newsletter', 'weekly', 'daily', 'digest', 'update', 'report',
            'crypto', 'defi', 'bitcoin', 'ethereum', 'blockchain',
            'milk road', 'the block', 'coindesk', 'decrypt',
            
            // From address indicators
            'newsletter', 'noreply', 'updates', 'news', 'digest',
            'substack', 'beehiiv', 'convertkit', 'mailchimp'
        ];
        
        // Check if any indicators match
        const hasIndicator = newsletterIndicators.some(indicator => 
            subject.includes(indicator) || fromAddress.includes(indicator) || fromName.includes(indicator)
        );
        
        // Additional checks for known newsletter patterns
        const isFromNewsletterService = [
            'substack.com', 'beehiiv.com', 'convertkit.com', 'mailchimp.com',
            'constantcontact.com', 'campaign-monitor.com'
        ].some(service => fromAddress.includes(service));
        
        return hasIndicator || isFromNewsletterService;
    }

    /**
     * 📄 PARSE EMAIL CONTENT
     */
    async parseEmailContent(message) {
        try {
            const parsed = await simpleParser(message.source);
            return {
                text: parsed.text,
                html: parsed.html,
                subject: parsed.subject,
                from: parsed.from
            };
        } catch (error) {
            console.log(`⚠️ Failed to parse email ${message.uid}:`, error.message);
            return null;
        }
    }

    /**
     * 📊 GET EMAIL ANALYSIS STATUS
     */
    getEmailAnalysisStatus(emailUid) {
        if (!this.emailAnalysisStatus.has(emailUid)) {
            // Initialize with all focuses as false
            const status = {};
            this.availableFocuses.forEach(focus => {
                status[focus] = false;
            });
            this.emailAnalysisStatus.set(emailUid, status);
        }
        
        return this.emailAnalysisStatus.get(emailUid);
    }

    /**
     * ✅ MARK EMAIL AS ANALYZED WITH FOCUS
     */
    markEmailAnalyzed(emailUid, focusName) {
        const status = this.getEmailAnalysisStatus(emailUid);
        status[focusName] = true;
        
        console.log(`✅ Email ${emailUid} marked as analyzed with focus: ${focusName}`);
        
        // Check if all emails are analyzed with current focus
        this.checkForFocusRotation();
    }

    /**
     * 🎯 CHECK IF EMAIL NEEDS ANALYSIS WITH CURRENT FOCUS
     */
    needsAnalysisWithCurrentFocus(analysisStatus) {
        return !analysisStatus[this.currentFocus];
    }

    /**
     * 🔄 CHECK FOR FOCUS ROTATION
     */
    checkForFocusRotation() {
        // Check if all newsletter emails are analyzed with current focus
        const emailsNeedingCurrentFocus = this.newsletterEmails.filter(email => 
            this.needsAnalysisWithCurrentFocus(email.analysisStatus)
        ).length;
        
        if (emailsNeedingCurrentFocus === 0) {
            console.log(`🎯 ALL EMAILS ANALYZED with focus: ${this.currentFocus}`);
            this.rotateFocus();
        } else {
            console.log(`📊 ${emailsNeedingCurrentFocus} emails still need analysis with focus: ${this.currentFocus}`);
        }
    }

    /**
     * 🔄 ROTATE TO NEXT FOCUS
     */
    rotateFocus() {
        const focusArray = Array.from(this.availableFocuses);
        const currentIndex = focusArray.indexOf(this.currentFocus);
        
        // Find next focus that has unanalyzed emails
        let nextFocusIndex = (currentIndex + 1) % focusArray.length;
        let nextFocus = focusArray[nextFocusIndex];
        
        // Check if any emails need analysis with this focus
        const emailsNeedingNextFocus = this.newsletterEmails.filter(email => 
            !email.analysisStatus[nextFocus]
        ).length;
        
        if (emailsNeedingNextFocus > 0) {
            console.log(`🔄 FOCUS ROTATION: ${this.currentFocus} → ${nextFocus}`);
            console.log(`📊 ${emailsNeedingNextFocus} emails need analysis with new focus`);
            
            this.currentFocus = nextFocus;
            
            // Update needs analysis for all emails
            this.newsletterEmails.forEach(email => {
                email.needsAnalysis = this.needsAnalysisWithCurrentFocus(email.analysisStatus);
            });
            
            this.emit('focusRotated', {
                previousFocus: focusArray[currentIndex],
                newFocus: nextFocus,
                emailsToAnalyze: emailsNeedingNextFocus
            });
            
            return true;
        } else {
            console.log(`🏁 ALL FOCUSES COMPLETE - All emails analyzed with all available focuses`);
            this.emit('allFocusesComplete', {
                totalEmails: this.newsletterEmails.length,
                totalFocuses: this.availableFocuses.size,
                completedAnalyses: this.newsletterEmails.length * this.availableFocuses.size
            });
            
            return false;
        }
    }

    /**
     * 🤖 AGENT CREATES NEW FOCUS
     */
    agentCreatesFocus(focusName, focusConfig, reasoning) {
        console.log(`🤖 AGENT CREATING NEW FOCUS: ${focusName}`);
        console.log(`   🧠 Reasoning: ${reasoning}`);
        console.log(`   ⚙️ Config:`, focusConfig);
        
        // Add to available focuses
        this.availableFocuses.add(focusName);
        
        // Initialize analysis status for all emails with this new focus
        this.newsletterEmails.forEach(email => {
            const status = this.getEmailAnalysisStatus(email.uid);
            status[focusName] = false; // Not analyzed with new focus yet
        });
        
        // Store focus configuration
        this.learningEngine.focusProfiles.set(focusName, {
            name: focusName,
            config: focusConfig,
            createdBy: 'agent',
            reasoning,
            createdAt: Date.now(),
            performance: {
                totalAnalyses: 0,
                avgValueScore: 0,
                discoveries: []
            }
        });
        
        console.log(`✅ New focus '${focusName}' created and added to rotation`);
        console.log(`📊 ${this.newsletterEmails.length} emails now need analysis with this focus`);
        
        this.emit('newFocusCreated', {
            focusName,
            focusConfig,
            reasoning,
            emailsToAnalyze: this.newsletterEmails.length
        });
        
        return true;
    }

    /**
     * 📋 GET EMAILS NEEDING ANALYSIS
     */
    getEmailsNeedingAnalysis() {
        return this.newsletterEmails.filter(email => email.needsAnalysis);
    }

    /**
     * 📊 GET ANALYSIS PROGRESS
     */
    getAnalysisProgress() {
        const totalEmails = this.newsletterEmails.length;
        const totalFocuses = this.availableFocuses.size;
        const totalPossibleAnalyses = totalEmails * totalFocuses;
        
        let completedAnalyses = 0;
        this.newsletterEmails.forEach(email => {
            this.availableFocuses.forEach(focus => {
                if (email.analysisStatus[focus]) {
                    completedAnalyses++;
                }
            });
        });
        
        const progressPercentage = totalPossibleAnalyses > 0 ? 
            (completedAnalyses / totalPossibleAnalyses) * 100 : 0;
        
        return {
            totalEmails,
            totalFocuses,
            totalPossibleAnalyses,
            completedAnalyses,
            progressPercentage: progressPercentage.toFixed(1),
            currentFocus: this.currentFocus,
            emailsNeedingCurrentFocus: this.getEmailsNeedingAnalysis().length
        };
    }

    /**
     * 🎯 GET AVAILABLE FOCUSES
     */
    getAvailableFocuses() {
        return Array.from(this.availableFocuses);
    }

    /**
     * 📊 GET FOCUS PERFORMANCE SUMMARY
     */
    getFocusPerformanceSummary() {
        const summary = {};
        
        this.availableFocuses.forEach(focus => {
            const focusProfile = this.learningEngine.focusProfiles.get(focus);
            const emailsAnalyzedWithFocus = this.newsletterEmails.filter(email => 
                email.analysisStatus[focus]
            ).length;
            
            summary[focus] = {
                emailsAnalyzed: emailsAnalyzedWithFocus,
                totalEmails: this.newsletterEmails.length,
                completionRate: this.newsletterEmails.length > 0 ? 
                    (emailsAnalyzedWithFocus / this.newsletterEmails.length) * 100 : 0,
                profile: focusProfile || null
            };
        });
        
        return summary;
    }

    /**
     * 🔌 DISCONNECT FROM MAILBOX
     */
    async disconnect() {
        if (this.imapClient && this.isConnected) {
            await this.imapClient.logout();
            this.isConnected = false;
            console.log('📧 Disconnected from mailbox');
        }
    }
} 