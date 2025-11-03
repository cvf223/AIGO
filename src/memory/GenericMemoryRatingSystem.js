import { EventEmitter } from 'events';

/**
 * 🧠 GENERIC MEMORY RATING SYSTEM
 * ===============================
 * 
 * Rates memory importance based on:
 * - Frequency of mentions across sources
 * - Numerical values (higher = more important)
 * - Recency of information (more recent = less competition)
 * - Connection to profit/goal keywords
 * 
 * NO HARDCODING - dynamically rates any memory content
 */
export class GenericMemoryRatingSystem extends EventEmitter {
    constructor(goalKeywords = [], competitionWindow = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        super();
        this.goalKeywords = goalKeywords.length > 0 ? goalKeywords : 
            ['profit', 'revenue', 'yield', 'return', 'earn', 'income', 'gain', 'mev', 'arbitrage', 'opportunity'];
        this.competitionWindow = competitionWindow;
        this.frequencyTracker = new Map(); // Track mentions across sources
        this.recencyMultiplier = 2.0; // More recent = better
        this.numericalWeight = 0.3;
        this.frequencyWeight = 0.25;
        this.recencyWeight = 0.25;
        this.goalWeight = 0.2;
    }

    /**
     * 📊 RATE MEMORY IMPORTANCE
     * Analyzes memory content and assigns importance rating
     */
    rateMemoryImportance(memoryId, content, metadata = {}) {
        console.log(`📊 Rating memory importance: ${memoryId}`);
        
        const rating = {
            memoryId,
            timestamp: Date.now(),
            scores: {
                frequency: this.calculateFrequencyScore(content, metadata.source),
                numerical: this.calculateNumericalScore(content),
                recency: this.calculateRecencyScore(metadata.timestamp || Date.now()),
                goalAlignment: this.calculateGoalAlignmentScore(content)
            },
            flags: [],
            sources: this.trackSources(content, metadata.source),
            extractedValues: this.extractValues(content),
            keywordMatches: this.findKeywordMatches(content)
        };
        
        // Calculate weighted total score
        rating.totalScore = this.calculateTotalScore(rating.scores);
        
        // Determine importance level
        rating.importance = this.determineImportanceLevel(rating.totalScore);
        
        // Add contextual flags
        this.addContextualFlags(rating, content, metadata);
        
        console.log(`📊 Memory rated: ${rating.importance} (score: ${rating.totalScore.toFixed(2)})`);
        
        this.emit('memoryRated', rating);
        return rating;
    }

    /**
     * 🔢 CALCULATE FREQUENCY SCORE
     * Higher frequency across different sources = higher importance
     */
    calculateFrequencyScore(content, source = 'unknown') {
        const contentHash = this.generateContentHash(content);
        const key = `content_${contentHash}`;
        
        if (!this.frequencyTracker.has(key)) {
            this.frequencyTracker.set(key, {
                count: 0,
                sources: new Set(),
                firstSeen: Date.now(),
                content: content
            });
        }
        
        const tracker = this.frequencyTracker.get(key);
        tracker.count++;
        tracker.sources.add(source);
        
        // Score based on unique sources and total mentions
        const uniqueSources = tracker.sources.size;
        const totalMentions = tracker.count;
        
        // Logarithmic scaling to prevent runaway scores
        const sourceScore = Math.log10(uniqueSources + 1);
        const mentionScore = Math.log10(totalMentions + 1) * 0.5;
        
        return Math.min(1.0, sourceScore + mentionScore);
    }

    /**
     * 💰 CALCULATE NUMERICAL SCORE
     * Extract and score numerical values for importance
     */
    calculateNumericalScore(content) {
        const numericalValues = this.extractNumericalValues(content);
        
        if (numericalValues.length === 0) {
            return 0.1; // Base score for non-numerical content
        }
        
        let score = 0;
        let maxValueScore = 0;
        let totalValueScore = 0;
        
        numericalValues.forEach(value => {
            const magnitude = this.calculateMagnitudeScore(value.number);
            const context = this.analyzeNumericalContext(value.context);
            const valueScore = magnitude * context;
            
            maxValueScore = Math.max(maxValueScore, valueScore);
            totalValueScore += valueScore;
        });
        
        // Combine max value importance with total numerical density
        score = maxValueScore * 0.7 + Math.min(0.3, totalValueScore * 0.1);
        
        return Math.min(1.0, score);
    }

    /**
     * ⏰ CALCULATE RECENCY SCORE
     * More recent = less competition = higher score
     */
    calculateRecencyScore(timestamp) {
        const now = Date.now();
        const age = now - timestamp;
        
        if (age < 0) return 1.0; // Future timestamp (just published)
        
        // Score decreases with age, but slowly
        const daysSincePublished = age / (24 * 60 * 60 * 1000);
        
        if (daysSincePublished < 1) {
            return 1.0; // Brand new = maximum score
        } else if (daysSincePublished < 7) {
            return 0.9 - (daysSincePublished * 0.1); // Slight decrease over week
        } else if (daysSincePublished < 30) {
            return 0.5 - (daysSincePublished * 0.01); // More decrease over month
        } else {
            return Math.max(0.1, 0.3 - (daysSincePublished * 0.001)); // Minimum threshold
        }
    }

    /**
     * 📊 CALCULATE GOAL ALIGNMENT SCORE
     */
    calculateGoalAlignmentScore(content) {
        // Type safety: ensure content is a string
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        } else if (content && typeof content === 'object') {
            contentStr = JSON.stringify(content);
        } else {
            contentStr = String(content || '');
        }
        
        const contentLower = contentStr.toLowerCase();
        let score = 0;
        let matches = 0;
        
        this.goalKeywords.forEach(keyword => {
            const keywordRegex = new RegExp(keyword, 'gi');
            const keywordMatches = contentLower.match(keywordRegex);
            
            if (keywordMatches) {
                matches += keywordMatches.length;
                score += keywordMatches.length * 0.1;
            }
        });
        
        return {
            score: Math.min(1.0, score),
            matches,
            keywordMatches: matches
        };
    }

    /**
     * 📈 EXTRACT NUMERICAL VALUES FROM CONTENT
     */
    extractNumericalValues(content) {
        const values = [];
        
        // Various numerical patterns
        const patterns = [
            { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, type: 'currency' },
            { regex: /(\d+(?:,\d{3})*)\s*(?:dollars?|USD)/gi, type: 'currency' },
            { regex: /(\d+(?:\.\d+)?)\s*([KMBT])\b/g, type: 'scaled' },
            { regex: /(\d+(?:\.\d+)?)%/g, type: 'percentage' },
            { regex: /(\d+(?:\.\d+)?)\s*(?:times?|x)/gi, type: 'multiplier' },
            { regex: /(\d+(?:\.\d+)?)\s*(?:per|\/)\s*(\w+)/gi, type: 'rate' }
        ];
        
        patterns.forEach(({ regex, type }) => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                let number = parseFloat(match[1].replace(/,/g, ''));
                
                // Apply scaling for K, M, B, T
                if (type === 'scaled' && match[2]) {
                    const multipliers = { K: 1000, M: 1000000, B: 1000000000, T: 1000000000000 };
                    number *= multipliers[match[2].toUpperCase()] || 1;
                }
                
                values.push({
                    number,
                    type,
                    original: match[0],
                    context: this.getContext(content, match.index, 30),
                    position: match.index
                });
            }
        });
        
        return values;
    }

    /**
     * 🔍 CALCULATE MAGNITUDE SCORE
     */
    calculateMagnitudeScore(number) {
        if (number <= 0) return 0;
        
        // Logarithmic scaling for magnitude
        if (number < 10) return 0.1;
        if (number < 100) return 0.3;
        if (number < 1000) return 0.5;
        if (number < 10000) return 0.7;
        if (number < 100000) return 0.8;
        if (number < 1000000) return 0.9;
        return 1.0; // Million or more
    }

    /**
     * 📝 ANALYZE NUMERICAL CONTEXT
     */
    analyzeNumericalContext(context) {
        const contextLower = context.toLowerCase();
        let score = 0.5; // Base context score
        
        // High value contexts
        const highValueTerms = ['profit', 'revenue', 'earn', 'gain', 'yield', 'return', 'income'];
        const mediumValueTerms = ['price', 'cost', 'fee', 'value', 'amount'];
        const lowValueTerms = ['users', 'followers', 'likes', 'views'];
        
        highValueTerms.forEach(term => {
            if (contextLower.includes(term)) score += 0.3;
        });
        
        mediumValueTerms.forEach(term => {
            if (contextLower.includes(term)) score += 0.2;
        });
        
        lowValueTerms.forEach(term => {
            if (contextLower.includes(term)) score -= 0.1;
        });
        
        return Math.max(0.1, Math.min(1.0, score));
    }

    /**
     * ⚖️ CALCULATE TOTAL SCORE
     */
    calculateTotalScore(scores) {
        return (
            scores.frequency * this.frequencyWeight +
            scores.numerical * this.numericalWeight +
            scores.recency * this.recencyWeight +
            scores.goalAlignment * this.goalWeight
        );
    }

    /**
     * 🏷️ DETERMINE IMPORTANCE LEVEL
     */
    determineImportanceLevel(totalScore) {
        if (totalScore >= 0.8) return 'legendary';
        if (totalScore >= 0.6) return 'valuable';
        if (totalScore >= 0.4) return 'important';
        if (totalScore >= 0.2) return 'basic';
        return 'minimal';
    }

    /**
     * 🚩 ADD CONTEXTUAL FLAGS
     */
    addContextualFlags(rating, content, metadata) {
        // Recency flags
        const age = Date.now() - (metadata.timestamp || Date.now());
        const hours = age / (60 * 60 * 1000);
        
        if (hours < 1) {
            rating.flags.push('breaking_news');
        } else if (hours < 24) {
            rating.flags.push('recent');
        }
        
        // Value flags
        if (rating.scores.numerical > 0.8) {
            rating.flags.push('high_numerical_value');
        }
        
        if (rating.scores.goalAlignment > 0.7) {
            rating.flags.push('highly_goal_relevant');
        }
        
        if (rating.scores.frequency > 0.7) {
            rating.flags.push('widely_mentioned');
        }
        
        // Competition flags
        if (rating.scores.recency > 0.9 && rating.scores.goalAlignment > 0.6) {
            rating.flags.push('low_competition_opportunity');
        }
    }

    /**
     * 📚 BATCH RATE MEMORIES
     */
    batchRateMemories(memories) {
        console.log(`📚 Batch rating ${memories.length} memories...`);
        
        const ratings = memories.map(memory => {
            return this.rateMemoryImportance(
                memory.id, 
                memory.content, 
                memory.metadata || {}
            );
        });
        
        // Sort by importance
        ratings.sort((a, b) => b.totalScore - a.totalScore);
        
        console.log(`📚 Batch rating complete. Top memory: ${ratings[0]?.importance || 'none'}`);
        
        return ratings;
    }

    // Helper methods
    generateContentHash(content) {
        // Simple hash for content similarity detection
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    trackSources(content, source) {
        const contentHash = this.generateContentHash(content);
        const tracker = this.frequencyTracker.get(`content_${contentHash}`);
        return tracker ? Array.from(tracker.sources) : [source];
    }

    extractValues(content) {
        return this.extractNumericalValues(content);
    }

    /**
     * 🔍 FIND KEYWORD MATCHES
     */
    findKeywordMatches(content) {
        // Type safety: ensure content is a string
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        } else if (content && typeof content === 'object') {
            contentStr = JSON.stringify(content);
        } else {
            contentStr = String(content || '');
        }
        
        const matches = [];
        this.goalKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const keywordMatches = contentStr.match(regex);
            if (keywordMatches) {
                matches.push({ keyword, count: keywordMatches.length });
            }
        });
        return matches;
    }

    getContext(text, index, length) {
        const start = Math.max(0, index - length);
        const end = Math.min(text.length, index + length);
        return text.substring(start, end);
    }
}

export default GenericMemoryRatingSystem; 