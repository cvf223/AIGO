import { EventEmitter } from 'events';
import { ExternalLinkAnalysisEngine } from './ExternalLinkAnalysisEngine.js';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR GENERIC NEWSLETTER ANALYSIS)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR GENERIC NEWSLETTER ANALYSIS)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../construction/prevention/ProactiveConstructionInferenceEngine.js';;

/**
 * 🔍 GENERIC NEWSLETTER ANALYSIS ENGINE - ENHANCED WITH EXTERNAL LINK ANALYSIS
 * ENHANCED with SPECIALIZED NEWSLETTER ANALYSIS Formal Reasoning & Proactive Prevention
 * ==========================================================================
 * 
 * FIXED: Now fetches and analyzes external sources for deep insights
 * NO MORE surface-level headline reading!
 */
export class GenericNewsletterAnalysis extends EventEmitter {
    constructor() {
        super();
        this.extractors = [
            this.extractStructuredData.bind(this),
            this.extractNumericalData.bind(this),
            this.extractTemporalData.bind(this),
            this.extractEntityMentions.bind(this),
            this.extractPatterns.bind(this),
            this.extractRelationships.bind(this),
            this.extractSentiment.bind(this),
            this.extractActionableItems.bind(this)
        ];
        
        // CRITICAL: Initialize external link analysis engine
        this.linkAnalyzer = new ExternalLinkAnalysisEngine(3, 8000); // 3 concurrent, 8s timeout
        
        // 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR GENERIC NEWSLETTER ANALYSIS)
        this.genericNewsletterAnalysisFormalReasoning = null;
        
        // 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR GENERIC NEWSLETTER ANALYSIS)
        this.genericNewsletterAnalysisCredibilityPipeline = null;
        this.genericNewsletterAnalysisInferenceReliability = null;
        this.genericNewsletterAnalysisVeracityJudge = null;
        this.genericNewsletterAnalysisSFTGovernor = null;
        
        console.log('🔍 Enhanced Newsletter Analysis with External Link Engine initialized');
    }

    /**
     * 🔍 ANALYZE NEWSLETTER CONTENT - ENHANCED WITH EXTERNAL SOURCES
     */
    async analyzeNewsletterContent(content, source = 'newsletter', metadata = {}) {
        console.log(`🔍 Analyzing newsletter content from ${source} WITH external source analysis...`);
        
        const analysis = {
            source,
            timestamp: Date.now(),
            metadata,
            rawContent: content,
            extractedData: {},
            dataTypes: new Set(),
            patterns: [],
            entities: [],
            relationships: [],
            summary: {},
            externalSources: null // NEW: External source analysis
        };

        // Run all extractors
        this.extractors.forEach((extractor, index) => {
            try {
                const extractorName = extractor.name || `extractor_${index}`;
                console.log(`   Running ${extractorName}...`);
                
                const extracted = extractor(content, analysis);
                if (extracted && Object.keys(extracted).length > 0) {
                    analysis.extractedData[extractorName] = extracted;
                    analysis.dataTypes.add(extractorName);
                }
            } catch (error) {
                console.warn(`   ⚠️ Extractor ${extractor.name} failed:`, error.message);
            }
        });

        // CRITICAL: Analyze external links for deep insights
        const structuredData = analysis.extractedData['bound extractStructuredData'];
        if (structuredData && structuredData.links && structuredData.links.length > 0) {
            console.log(`🔗 Found ${structuredData.links.length} external links - analyzing for deep insights...`);
            
            try {
                analysis.externalSources = await this.linkAnalyzer.analyzeExternalLinks(
                    structuredData.links, 
                    `${source}: ${content.substring(0, 200)}...`
                );
                
                // Merge external insights with main analysis
                this.mergeExternalInsights(analysis);
                
                console.log(`🔗 External analysis complete: ${analysis.externalSources.successfulAnalyses} sources analyzed`);
                console.log(`   💎 High-value sources: ${analysis.externalSources.highValueSources.length}`);
                console.log(`   ✅ Validated findings: ${analysis.externalSources.validatedFindings.length}`);
                
            } catch (error) {
                console.error(`❌ External link analysis failed: ${error.message}`);
                analysis.externalSources = { error: error.message };
            }
        } else {
            console.log('⚠️ No external links found - analysis limited to surface content');
            analysis.externalSources = { totalLinks: 0, note: 'No external links to analyze' };
        }

        // Generate enhanced summary with external data
        analysis.summary = this.generateEnhancedAnalysisSummary(analysis);
        
        console.log(`🔍 Enhanced analysis complete: ${analysis.dataTypes.size} data types, external sources: ${analysis.externalSources?.successfulAnalyses || 0}`);
        
        this.emit('analysisComplete', analysis);
        return analysis;
    }

    /**
     * 🔗 MERGE EXTERNAL INSIGHTS WITH MAIN ANALYSIS
     */
    mergeExternalInsights(analysis) {
        const externalSources = analysis.externalSources;
        if (!externalSources || !externalSources.linkAnalyses) return;
        
        // Add external financial data to numerical findings
        let totalExternalCurrencies = 0;
        let totalExternalPercentages = 0;
        
        externalSources.linkAnalyses.forEach(source => {
            if (source.financialData) {
                totalExternalCurrencies += source.financialData.currencies?.length || 0;
                totalExternalPercentages += source.financialData.percentages?.length || 0;
                
                // Add tokens to entity mentions
                if (source.financialData.tokens) {
                    const entityData = analysis.extractedData['bound extractEntityMentions'] || { tokens: [] };
                    source.financialData.tokens.forEach(token => {
                        entityData.tokens.push({
                            symbol: `$${token}`,
                            context: `Found in external source: ${source.title}`,
                            source: 'external_analysis',
                            url: source.url
                        });
                    });
                }
            }
        });
        
        // Add external data summary
        analysis.extractedData['externalSourceSummary'] = {
            totalSourcesAnalyzed: externalSources.successfulAnalyses,
            highValueSources: externalSources.highValueSources.length,
            crossReferences: externalSources.crossReferences.length,
            validatedFindings: externalSources.validatedFindings.length,
            additionalCurrencies: totalExternalCurrencies,
            additionalPercentages: totalExternalPercentages,
            valueMultiplier: this.calculateExternalValueMultiplier(externalSources)
        };
        
        console.log(`🔗 Merged external insights: +${totalExternalCurrencies} currencies, +${totalExternalPercentages} percentages`);
    }

    /**
     * 📊 CALCULATE EXTERNAL VALUE MULTIPLIER
     */
    calculateExternalValueMultiplier(externalSources) {
        let multiplier = 1.0; // Base multiplier
        
        // Boost for high-value sources
        multiplier += externalSources.highValueSources.length * 0.2;
        
        // Boost for cross-references (validated data)
        multiplier += externalSources.crossReferences.length * 0.3;
        
        // Boost for validated findings
        multiplier += externalSources.validatedFindings.length * 0.5;
        
        return Math.min(multiplier, 3.0); // Cap at 3x multiplier
    }

    /**
     * 📊 GENERATE ENHANCED ANALYSIS SUMMARY
     */
    generateEnhancedAnalysisSummary(analysis) {
        const baseDataPoints = Object.values(analysis.extractedData).reduce((sum, data) => {
            if (Array.isArray(data)) return sum + data.length;
            if (typeof data === 'object') return sum + Object.keys(data).length;
            return sum + 1;
        }, 0);
        
        const externalSummary = analysis.extractedData['externalSourceSummary'];
        const externalDataPoints = externalSummary ? 
            (externalSummary.additionalCurrencies + externalSummary.additionalPercentages) : 0;
        
        return {
            totalDataPoints: baseDataPoints + externalDataPoints,
            baseDataPoints,
            externalDataPoints,
            dataTypeBreakdown: Object.keys(analysis.extractedData).reduce((breakdown, key) => {
                const data = analysis.extractedData[key];
                breakdown[key] = Array.isArray(data) ? data.length : Object.keys(data).length;
                return breakdown;
            }, {}),
            externalAnalysis: externalSummary || null,
            analysisQuality: this.assessAnalysisQuality(analysis),
            topEntities: [],
            keyNumbers: [],
            timeReferences: [],
            sentiment: null
        };
    }

    /**
     * 📊 ASSESS ANALYSIS QUALITY
     */
    assessAnalysisQuality(analysis) {
        let quality = 0.5; // Base quality
        
        // Base data quality
        const dataTypes = analysis.dataTypes.size;
        quality += Math.min(dataTypes * 0.05, 0.3);
        
        // External source quality boost
        const externalSources = analysis.externalSources;
        if (externalSources && externalSources.successfulAnalyses > 0) {
            quality += 0.2; // Base external boost
            quality += externalSources.highValueSources.length * 0.1;
            quality += externalSources.validatedFindings.length * 0.15;
        }
        
        return Math.min(quality, 1.0);
    }

    /**
     * 📊 EXTRACT STRUCTURED DATA
     * Finds lists, tables, sections, headings
     */
    extractStructuredData(content) {
        const structured = {
            headings: [],
            lists: [],
            sections: [],
            tables: [],
            links: [],
            highlights: []
        };

        // Extract headings (various markdown and HTML formats)
        const headingPatterns = [
            /^#{1,6}\s+(.+)$/gm,          // Markdown headings
            /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi,  // HTML headings
            /^(.+)\n[=-]+$/gm,            // Underlined headings
            /^\*\*(.+)\*\*$/gm,           // Bold text as headings
            /^(.+):$/gm                   // Colon-ended lines
        ];

        headingPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                structured.headings.push({
                    text: match[1].trim(),
                    level: this.inferHeadingLevel(match[0]),
                    position: match.index
                });
            }
        });

        // Extract lists
        const listItems = content.match(/^[\s]*[-*+•]\s+(.+)$/gm);
        if (listItems) {
            structured.lists = listItems.map(item => ({
                text: item.replace(/^[\s]*[-*+•]\s+/, '').trim(),
                type: 'bullet'
            }));
        }

        const numberedItems = content.match(/^[\s]*\d+[\.)]\s+(.+)$/gm);
        if (numberedItems) {
            structured.lists.push(...numberedItems.map(item => ({
                text: item.replace(/^[\s]*\d+[\.)]\s+/, '').trim(),
                type: 'numbered'
            })));
        }

        // Extract links
        const linkPatterns = [
            /\[([^\]]+)\]\(([^)]+)\)/g,   // Markdown links
            /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, // HTML links
            /https?:\/\/[^\s]+/g          // Plain URLs
        ];

        linkPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                structured.links.push({
                    text: match[2] || match[1] || match[0],
                    url: match[1] || match[0],
                    position: match.index
                });
            }
        });

        // Extract highlights/emphasis
        const emphasisPatterns = [
            /\*\*([^*]+)\*\*/g,           // Bold
            /\*([^*]+)\*/g,               // Italic
            /_([^_]+)_/g,                 // Underscore
            /`([^`]+)`/g,                 // Code
            /==([^=]+)==/g                // Highlight
        ];

        emphasisPatterns.forEach((pattern, index) => {
            let match;
            const types = ['bold', 'italic', 'underscore', 'code', 'highlight'];
            while ((match = pattern.exec(content)) !== null) {
                structured.highlights.push({
                    text: match[1],
                    type: types[index],
                    position: match.index
                });
            }
        });

        return structured;
    }

    /**
     * 🔢 EXTRACT NUMERICAL DATA
     * Finds all numbers, currencies, percentages, dates
     */
    extractNumericalData(content) {
        const numerical = {
            currencies: [],
            percentages: [],
            numbers: [],
            dates: [],
            times: [],
            measurements: []
        };

        // Currency patterns - FIXED TO DETECT $600M, $4T etc
        const currencyPatterns = [
            { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'USD' },
            { regex: /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi, currency: 'USD' },
            { regex: /€(\d+(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'EUR' },
            { regex: /£(\d+(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'GBP' },
            { regex: /\$(\d+(?:\.\d+)?)\s*([KMBT])\b/gi, currency: 'scaled' }, // Fixed: added \$ and case insensitive
            { regex: /(\d+(?:\.\d+)?)\s*([KMBT])\b/gi, currency: 'scaled' }  // Also catch without $
        ];

        currencyPatterns.forEach(({ regex, currency }) => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                let value = parseFloat(match[1].replace(/,/g, ''));
                let scalingFactor = match[2]; // K, M, B, T
                
                if (currency === 'scaled' && scalingFactor) {
                    const multipliers = { K: 1000, M: 1000000, B: 1000000000, T: 1000000000000 };
                    value *= multipliers[scalingFactor.toUpperCase()] || 1;
                }
                
                // Skip obvious token symbols like $PUMP, $ETH, $BTC
                if (match[0].match(/\$[A-Z]{3,5}$/)) {
                    continue;
                }
                
                numerical.currencies.push({
                    value,
                    currency,
                    original: match[0],
                    context: this.getContext(content, match.index, 40),
                    position: match.index,
                    scalingFactor: scalingFactor || null
                });
            }
        });

        // Percentage patterns
        const percentageRegex = /(\d+(?:\.\d+)?)%/g;
        let match;
        while ((match = percentageRegex.exec(content)) !== null) {
            numerical.percentages.push({
                value: parseFloat(match[1]),
                original: match[0],
                context: this.getContext(content, match.index, 40),
                position: match.index
            });
        }

        // General numbers
        const numberRegex = /\b(\d+(?:,\d{3})*(?:\.\d+)?)\b/g;
        while ((match = numberRegex.exec(content)) !== null) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            if (value > 0) {
                numerical.numbers.push({
                    value,
                    original: match[0],
                    context: this.getContext(content, match.index, 40),
                    position: match.index
                });
            }
        }

        // Date patterns
        const datePatterns = [
            /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
            /\b(\d{4}-\d{2}-\d{2})\b/g,
            /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
            /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi
        ];

        datePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                numerical.dates.push({
                    text: match[0],
                    context: this.getContext(content, match.index, 30),
                    position: match.index
                });
            }
        });

        return numerical;
    }

    /**
     * ⏰ EXTRACT TEMPORAL DATA
     * Finds time references, durations, frequencies
     */
    extractTemporalData(content) {
        const temporal = {
            durations: [],
            frequencies: [],
            timeReferences: [],
            deadlines: []
        };

        // Duration patterns
        const durationPatterns = [
            /(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?|years?)/gi,
            /(\d+)\s*(sec|min|hr|mo|yr)s?\b/gi,
            /in\s+(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?|years?)/gi
        ];

        durationPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                temporal.durations.push({
                    value: parseInt(match[1]),
                    unit: match[2].toLowerCase(),
                    text: match[0],
                    context: this.getContext(content, match.index, 30),
                    position: match.index
                });
            }
        });

        // Frequency patterns
        const frequencyPatterns = [
            /(\d+)\s*times?\s*per\s*(day|week|month|year)/gi,
            /(\d+)\s*per\s*(day|week|month|year)/gi,
            /(daily|weekly|monthly|yearly|annually)/gi,
            /every\s*(\d+)?\s*(day|week|month|year)s?/gi
        ];

        frequencyPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                temporal.frequencies.push({
                    text: match[0],
                    context: this.getContext(content, match.index, 30),
                    position: match.index
                });
            }
        });

        return temporal;
    }

    /**
     * 🏷️ EXTRACT ENTITY MENTIONS
     * Finds companies, tokens, people, projects
     */
    extractEntityMentions(content) {
        const entities = {
            tokens: [],
            companies: [],
            people: [],
            projects: [],
            exchanges: [],
            protocols: []
        };

        // Token patterns
        const tokenRegex = /\$[A-Z]{2,6}(?!\s*(?:million|billion|trillion|thousand))/g;
        let match;
        while ((match = tokenRegex.exec(content)) !== null) {
            entities.tokens.push({
                symbol: match[0],
                context: this.getContext(content, match.index, 40),
                position: match.index
            });
        }

        // Company/Protocol patterns (capitalized words)
        const companyRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Labs|Protocol|Finance|Swap|Exchange))?\b/g;
        while ((match = companyRegex.exec(content)) !== null) {
            const entity = match[0];
            if (entity.length > 2 && !this.isCommonWord(entity)) {
                entities.companies.push({
                    name: entity,
                    context: this.getContext(content, match.index, 40),
                    position: match.index
                });
            }
        }

        // Known DeFi protocols and exchanges
        const knownEntities = [
            'Uniswap', 'Coinbase', 'Binance', 'Ethereum', 'Bitcoin', 'DeFi', 'NFT',
            'PancakeSwap', 'SushiSwap', 'Compound', 'Aave', 'MakerDAO', 'Curve',
            'Balancer', 'Yearn', 'Synthetix', 'Chainlink', 'Polygon', 'Arbitrum',
            'Optimism', 'Solana', 'Avalanche', 'Fantom', 'BSC'
        ];

        knownEntities.forEach(entity => {
            const regex = new RegExp(`\\b${entity}\\b`, 'gi');
            let match;
            while ((match = regex.exec(content)) !== null) {
                entities.protocols.push({
                    name: match[0],
                    context: this.getContext(content, match.index, 40),
                    position: match.index
                });
            }
        });

        return entities;
    }

    /**
     * 🔗 EXTRACT PATTERNS
     * Finds recurring patterns and structures
     */
    extractPatterns(content) {
        const patterns = {
            repeatedPhrases: [],
            numberedLists: [],
            bulletPoints: [],
            callsToAction: [],
            questions: []
        };

        // Find repeated phrases
        const words = content.toLowerCase().split(/\s+/);
        const phraseFreq = new Map();
        
        for (let i = 0; i < words.length - 2; i++) {
            const phrase = words.slice(i, i + 3).join(' ');
            phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1);
        }

        phraseFreq.forEach((count, phrase) => {
            if (count > 1 && phrase.length > 10) {
                patterns.repeatedPhrases.push({ phrase, count });
            }
        });

        // Extract questions
        const questionRegex = /[^.!?]*\?/g;
        let match;
        while ((match = questionRegex.exec(content)) !== null) {
            patterns.questions.push({
                text: match[0].trim(),
                position: match.index
            });
        }

        // Extract calls to action
        const ctaPatterns = [
            /\b(?:click|download|buy|sell|trade|invest|join|subscribe|sign up|get started|learn more|read more|try now)\b[^.!?]*/gi
        ];

        ctaPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                patterns.callsToAction.push({
                    text: match[0].trim(),
                    position: match.index
                });
            }
        });

        return patterns;
    }

    /**
     * 🔗 EXTRACT RELATIONSHIPS
     * Finds connections between entities and concepts
     */
    extractRelationships(content) {
        const relationships = [];
        
        // Simple relationship patterns
        const relationshipPatterns = [
            /(\w+)\s+(?:increased|decreased|rose|fell|dropped|gained|lost)\s+(?:by\s+)?([0-9.%$]+)/gi,
            /(\w+)\s+(?:launched|announced|released|introduced)\s+([^.!?]+)/gi,
            /(\w+)\s+(?:partnered with|collaborated with|acquired|merged with)\s+(\w+)/gi
        ];

        relationshipPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                relationships.push({
                    subject: match[1],
                    predicate: this.extractPredicate(match[0]),
                    object: match[2] || match[3],
                    text: match[0],
                    position: match.index
                });
            }
        });

        return { relationships };
    }

    /**
     * 😊 EXTRACT SENTIMENT
     * Basic sentiment analysis
     */
    extractSentiment(content) {
        const sentimentWords = {
            positive: ['good', 'great', 'excellent', 'amazing', 'bullish', 'up', 'gain', 'profit', 'success', 'boom', 'surge', 'rally'],
            negative: ['bad', 'terrible', 'awful', 'bearish', 'down', 'loss', 'fail', 'crash', 'dump', 'drop', 'decline']
        };

        let positiveScore = 0;
        let negativeScore = 0;
        const words = content.toLowerCase().split(/\s+/);

        words.forEach(word => {
            if (sentimentWords.positive.includes(word)) positiveScore++;
            if (sentimentWords.negative.includes(word)) negativeScore++;
        });

        const total = positiveScore + negativeScore;
        const sentiment = total === 0 ? 'neutral' : 
                         positiveScore > negativeScore ? 'positive' : 'negative';

        return {
            sentiment,
            positiveScore,
            negativeScore,
            confidence: total > 0 ? Math.abs(positiveScore - negativeScore) / total : 0
        };
    }

    /**
     * ✅ EXTRACT ACTIONABLE ITEMS
     * Finds items that suggest actions or market insights (DISCOVERIES)
     */
    extractActionableItems(content) {
        const actionable = {
            marketInsights: [],
            warnings: [],
            recommendations: [],
            deadlines: []
        };

        // Market insight patterns (DISCOVERIES, not opportunities)
        const insightPatterns = [
            /opportunity\s+to\s+([^.!?]+)/gi,
            /potential\s+(?:for\s+)?([^.!?]+)/gi,
            /could\s+(?:be\s+)?([^.!?]+)/gi,
            /might\s+(?:be\s+)?([^.!?]+)/gi
        ];

        insightPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                actionable.marketInsights.push({
                    text: match[0],
                    insight: match[1],
                    position: match.index
                });
            }
        });

        // Warning indicators
        const warningPatterns = [
            /(?:warning|caution|risk|danger|avoid)[:]\s*([^.!?]+)/gi,
            /be\s+careful\s+(?:of\s+)?([^.!?]+)/gi
        ];

        warningPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                actionable.warnings.push({
                    text: match[0],
                    warning: match[1],
                    position: match.index
                });
            }
        });

        return actionable;
    }

    /**
     * 📋 GENERATE ANALYSIS SUMMARY
     */
    generateAnalysisSummary(analysis) {
        const summary = {
            totalDataPoints: 0,
            dataTypeBreakdown: {},
            topEntities: [],
            keyNumbers: [],
            timeReferences: [],
            sentiment: null
        };

        // Count data points
        Object.entries(analysis.extractedData).forEach(([type, data]) => {
            const count = this.countDataPoints(data);
            summary.totalDataPoints += count;
            summary.dataTypeBreakdown[type] = count;
        });

        // Extract key information
        if (analysis.extractedData.extractNumericalData) {
            const numerical = analysis.extractedData.extractNumericalData;
            summary.keyNumbers = [
                ...(numerical.currencies || []).slice(0, 5),
                ...(numerical.percentages || []).slice(0, 3)
            ];
        }

        if (analysis.extractedData.extractEntityMentions) {
            const entities = analysis.extractedData.extractEntityMentions;
            summary.topEntities = [
                ...(entities.tokens || []).slice(0, 5),
                ...(entities.protocols || []).slice(0, 3)
            ];
        }

        if (analysis.extractedData.extractSentiment) {
            summary.sentiment = analysis.extractedData.extractSentiment.sentiment;
        }

        return summary;
    }

    // Helper methods
    getContext(text, index, length) {
        const start = Math.max(0, index - length);
        const end = Math.min(text.length, index + length);
        return text.substring(start, end);
    }

    inferHeadingLevel(text) {
        if (text.startsWith('######')) return 6;
        if (text.startsWith('#####')) return 5;
        if (text.startsWith('####')) return 4;
        if (text.startsWith('###')) return 3;
        if (text.startsWith('##')) return 2;
        if (text.startsWith('#')) return 1;
        if (text.includes('**')) return 2;
        return 1;
    }

    isCommonWord(word) {
        const commonWords = ['The', 'This', 'That', 'With', 'From', 'They', 'Have', 'Will', 'Been', 'Were'];
        return commonWords.includes(word);
    }

    extractPredicate(text) {
        const predicateMap = {
            'increased': 'increased',
            'decreased': 'decreased',
            'launched': 'launched',
            'announced': 'announced',
            'partnered': 'partnered_with'
        };
        
        for (const [key, value] of Object.entries(predicateMap)) {
            if (text.toLowerCase().includes(key)) return value;
        }
        return 'related_to';
    }

    countDataPoints(data) {
        if (Array.isArray(data)) return data.length;
        if (typeof data === 'object' && data !== null) {
            return Object.values(data).reduce((sum, value) => {
                return sum + this.countDataPoints(value);
            }, 0);
        }
        return 1;
    }
}

export default GenericNewsletterAnalysis; 