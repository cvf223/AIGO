export class LfoRunner {
    memory;
    plugins;
    expertCache = new Map();
    lastCacheUpdate = new Map();
    cacheExpiryHours = 24;
    constructor(memory, plugins) {
        this.memory = memory;
        this.plugins = plugins;
    }
    async runLFO(signal) {
        console.log(`🔍 Starting LFO routine for ${signal.domain} failure: ${signal.taskType}`);
        try {
            // Step 1: Select relevant experts
            const experts = await this.selectExperts(signal.domain, signal.taskType);
            // Step 2: Search for case studies and solutions
            const caseStudies = await this.searchCaseStudies(signal, experts);
            // Step 3: Distill actionable steps
            const distilledSteps = await this.distillLearnings(signal, caseStudies);
            // Step 4: Store in memory for future reference
            const memoryRecords = await this.storeKnowledge(signal, experts, caseStudies, distilledSteps);
            // Step 5: Generate retry strategy
            const retryStrategy = await this.generateRetryStrategy(signal, distilledSteps);
            const result = {
                success: true,
                expertsConsulted: experts,
                caseStudiesFound: caseStudies,
                distilledSteps,
                confidenceScore: this.calculateConfidence(caseStudies, distilledSteps),
                recommendedRetryStrategy: retryStrategy,
                memoryRecordsCreated: memoryRecords
            };
            console.log(`✅ LFO completed: ${experts.length} experts, ${caseStudies.length} studies, confidence: ${result.confidenceScore}`);
            return result;
        }
        catch (error) {
            console.error('❌ LFO routine failed:', error);
            return {
                success: false,
                expertsConsulted: [],
                caseStudiesFound: [],
                distilledSteps: [],
                confidenceScore: 0,
                recommendedRetryStrategy: 'manual-intervention-required',
                memoryRecordsCreated: 0
            };
        }
    }
    async selectExperts(domain, taskType) {
        // Check cache first
        const cacheKey = `${domain}-${taskType}`;
        const lastUpdate = this.lastCacheUpdate.get(cacheKey);
        const now = new Date();
        if (lastUpdate && (now.getTime() - lastUpdate.getTime()) < this.cacheExpiryHours * 3600000) {
            const cached = this.expertCache.get(cacheKey);
            if (cached)
                return cached;
        }
        // Load expert profiles from data files
        const experts = await this.loadExpertProfiles(domain);
        // Filter and rank by relevance to task type
        const relevantExperts = experts
            .filter(expert => expert.domain === domain ||
            expert.specialty.some(spec => taskType.toLowerCase().includes(spec.toLowerCase())))
            .sort((a, b) => b.reputation - a.reputation)
            .slice(0, 5); // Top 5 experts
        // Update cache
        this.expertCache.set(cacheKey, relevantExperts);
        this.lastCacheUpdate.set(cacheKey, now);
        return relevantExperts;
    }
    async loadExpertProfiles(domain) {
        try {
            // Try to load from data directory
            const result = await this.plugins.call('plugin-filesystem', 'readFile', [`data/experts/${domain}.yaml`]);
            const expertData = result.data;
            // Parse YAML (simplified - in production use proper YAML parser)
            const profiles = this.parseExpertYaml(expertData);
            return profiles;
        }
        catch (error) {
            console.warn(`No expert profiles found for domain: ${domain}, using defaults`);
            return this.getDefaultExperts(domain);
        }
    }
    parseExpertYaml(yamlData) {
        // Simplified YAML parsing - in production use js-yaml
        const profiles = [];
        // Add some default parsing logic
        const lines = yamlData.split('\n');
        let currentProfile = null;
        for (const line of lines) {
            if (line.trim().startsWith('- name:')) {
                if (currentProfile) {
                    profiles.push(currentProfile);
                }
                currentProfile = {
                    name: line.split('name:')[1].trim(),
                    domain: '',
                    specialty: [],
                    reputation: 0,
                    sources: {},
                    keyInsights: [],
                    lastUpdated: new Date()
                };
            }
            // Add more parsing logic as needed
        }
        if (currentProfile) {
            profiles.push(currentProfile);
        }
        return profiles;
    }
    getDefaultExperts(domain) {
        const defaultExperts = {
            'defi': [
                {
                    name: 'Andre Cronje',
                    domain: 'defi',
                    specialty: ['yield-farming', 'smart-contracts', 'tokenomics'],
                    reputation: 95,
                    sources: {
                        twitter: '@AndreCronjeTech',
                        github: 'andrecronje'
                    },
                    keyInsights: [
                        'Focus on sustainable yield generation',
                        'Risk-adjusted returns over raw APY',
                        'Smart contract security is paramount'
                    ],
                    lastUpdated: new Date()
                }
            ],
            'trading': [
                {
                    name: 'Alameda Research',
                    domain: 'trading',
                    specialty: ['arbitrage', 'market-making', 'risk-management'],
                    reputation: 90,
                    sources: {
                        blog: 'https://alameda-research.com/blog'
                    },
                    keyInsights: [
                        'Latency arbitrage in fragmented markets',
                        'Cross-exchange market making',
                        'Dynamic position sizing'
                    ],
                    lastUpdated: new Date()
                }
            ],
            'infrastructure': [
                {
                    name: 'Ethereum Foundation',
                    domain: 'infrastructure',
                    specialty: ['scaling', 'consensus', 'security'],
                    reputation: 100,
                    sources: {
                        github: 'ethereum',
                        blog: 'https://blog.ethereum.org'
                    },
                    keyInsights: [
                        'Layer 2 scaling solutions',
                        'Proof of Stake optimization',
                        'MEV protection strategies'
                    ],
                    lastUpdated: new Date()
                }
            ]
        };
        return defaultExperts[domain] || [];
    }
    async searchCaseStudies(signal, experts) {
        const caseStudies = [];
        // Search queries based on failure signal and expert insights
        const searchQueries = this.generateSearchQueries(signal, experts);
        for (const query of searchQueries) {
            try {
                const result = await this.plugins.call('plugin-web-search', 'search', [query, JSON.stringify({ limit: 10, domain_filter: ['github.com', 'medium.com', 'mirror.xyz'] })]);
                const searchResults = result.data;
                for (const searchResult of searchResults) {
                    const study = await this.extractCaseStudy(searchResult, signal.domain);
                    if (study && study.relevanceScore > 0.6) {
                        caseStudies.push(study);
                    }
                }
            }
            catch (error) {
                console.warn(`Search failed for query: ${query}`, error);
            }
        }
        return caseStudies
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10); // Top 10 most relevant
    }
    generateSearchQueries(signal, experts) {
        const queries = [];
        // Query based on error message
        queries.push(`"${signal.errorMessage}" ${signal.domain} solution`);
        // Query based on task type
        queries.push(`${signal.taskType} ${signal.domain} best practices`);
        // Queries based on expert insights
        for (const expert of experts) {
            for (const insight of expert.keyInsights.slice(0, 2)) {
                queries.push(`"${insight}" ${signal.domain} implementation`);
            }
        }
        // Domain-specific queries
        if (signal.domain === 'defi') {
            queries.push(`DeFi ${signal.taskType} common failures solutions`);
            queries.push(`Smart contract ${signal.taskType} security patterns`);
        }
        else if (signal.domain === 'trading') {
            queries.push(`Crypto trading ${signal.taskType} algorithms`);
            queries.push(`${signal.taskType} trading bot optimization`);
        }
        return queries.slice(0, 8); // Limit to prevent API overuse
    }
    async extractCaseStudy(searchResult, domain) {
        try {
            // Extract content from the search result
            const contentResult = await this.plugins.call('plugin-web-scraper', 'extractContent', [searchResult.url]);
            const content = contentResult.data;
            // Use AI to extract structured case study
            const extractionResult = await this.plugins.call('plugin-openai', 'analyze', [
                `Extract a case study from this content for domain "${domain}". 
         Focus on: problem statement, solution approach, outcome, and key techniques.
         Content: ${content.slice(0, 2000)}...`
            ]);
            const extraction = extractionResult.data;
            const relevanceScore = this.calculateRelevanceScore(extraction, domain);
            return {
                title: searchResult.title || 'Extracted Case Study',
                source: searchResult.url,
                domain,
                problem: extraction.problem || 'Problem not clearly defined',
                solution: extraction.solution || 'Solution not found',
                outcome: extraction.outcome || 'Outcome not specified',
                techniques: extraction.techniques || [],
                relevanceScore,
                extractedAt: new Date()
            };
        }
        catch (error) {
            console.warn('Failed to extract case study:', error);
            return null;
        }
    }
    calculateRelevanceScore(extraction, domain) {
        let score = 0.5; // Base score
        // Check if content is relevant to domain
        if (extraction.problem?.toLowerCase().includes(domain))
            score += 0.2;
        if (extraction.solution?.toLowerCase().includes(domain))
            score += 0.2;
        // Check for technical depth
        if (extraction.techniques && extraction.techniques.length > 0)
            score += 0.1;
        // Check for concrete outcomes
        if (extraction.outcome && extraction.outcome.length > 50)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    async distillLearnings(signal, caseStudies) {
        if (caseStudies.length === 0) {
            return [
                'Insufficient case studies found - consider manual research',
                'Review error logs for additional context',
                'Consult domain documentation'
            ];
        }
        // Combine all solutions and techniques
        const allSolutions = caseStudies.map(cs => cs.solution).join('\n\n');
        const allTechniques = caseStudies.flatMap(cs => cs.techniques);
        // Use AI to distill actionable steps
        try {
            const distillationResult = await this.plugins.call('plugin-openai', 'generate', [
                `Based on these case studies for ${signal.domain} domain, distill 5-7 actionable steps to solve: "${signal.errorMessage}"
         
         Case Studies Solutions:
         ${allSolutions}
         
         Common Techniques: ${allTechniques.join(', ')}
         
         Provide specific, implementable steps.`
            ]);
            const distillation = distillationResult.data;
            // Parse the response into steps
            return distillation
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(step => step.replace(/^\d+\.?\s*/, '').trim())
                .filter(step => step.length > 10)
                .slice(0, 7);
        }
        catch (error) {
            console.warn('AI distillation failed, using heuristic approach:', error);
            return this.heuristicDistillation(signal, caseStudies);
        }
    }
    heuristicDistillation(signal, caseStudies) {
        const steps = [];
        // Extract common techniques
        const techniqueFrequency = new Map();
        caseStudies.forEach(cs => {
            cs.techniques.forEach(tech => {
                techniqueFrequency.set(tech, (techniqueFrequency.get(tech) || 0) + 1);
            });
        });
        // Most common techniques become steps
        const topTechniques = Array.from(techniqueFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tech]) => `Implement ${tech} pattern`);
        steps.push(...topTechniques);
        // Add domain-specific steps
        if (signal.domain === 'defi') {
            steps.push('Increase slippage tolerance');
            steps.push('Add retry mechanism with exponential backoff');
            steps.push('Validate contract state before transaction');
        }
        else if (signal.domain === 'trading') {
            steps.push('Adjust position sizing algorithm');
            steps.push('Implement circuit breakers');
            steps.push('Add latency monitoring');
        }
        return steps.slice(0, 7);
    }
    async storeKnowledge(signal, experts, caseStudies, steps) {
        let recordCount = 0;
        const timestamp = Date.now();
        // Generate dummy UUIDs for the memory system
        const generateUUID = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const roomId = generateUUID();
        const agentId = signal.agentId;
        // Store expert profiles using store operation
        for (const expert of experts) {
            await this.memory.write({
                type: 'store',
                roomId,
                agentId,
                content: {
                    expert: expert,
                    dataType: 'expert-profile'
                },
                timestamp,
                metadata: {
                    domain: expert.domain,
                    reputation: expert.reputation,
                    specialty: expert.specialty
                }
            });
            recordCount++;
        }
        // Store case studies using store operation
        for (const study of caseStudies) {
            await this.memory.write({
                type: 'store',
                roomId,
                agentId,
                content: {
                    caseStudy: study,
                    dataType: 'case-study'
                },
                timestamp,
                metadata: {
                    domain: study.domain,
                    relevanceScore: study.relevanceScore,
                    source: study.source
                }
            });
            recordCount++;
        }
        // Store distilled learning using store operation
        await this.memory.write({
            type: 'store',
            roomId,
            agentId,
            content: {
                originalFailure: signal,
                distilledSteps: steps,
                confidence: this.calculateConfidence(caseStudies, steps),
                dataType: 'lfo-learning'
            },
            timestamp,
            metadata: {
                agentId: signal.agentId,
                domain: signal.domain,
                taskType: signal.taskType,
                learningDate: new Date().toISOString()
            }
        });
        recordCount++;
        return recordCount;
    }
    async generateRetryStrategy(signal, steps) {
        if (steps.length === 0) {
            return 'manual-intervention-required';
        }
        // Determine retry strategy based on failure severity and available steps
        if (signal.severity === 'critical' || signal.retryCount > 3) {
            return 'escalate-to-human';
        }
        if (signal.severity === 'high' || signal.retryCount > 1) {
            return 'apply-all-steps-with-monitoring';
        }
        return 'apply-top-steps-incrementally';
    }
    calculateConfidence(caseStudies, steps) {
        if (caseStudies.length === 0 || steps.length === 0)
            return 0;
        // Base confidence on number and quality of case studies
        const avgRelevance = caseStudies.reduce((sum, cs) => sum + cs.relevanceScore, 0) / caseStudies.length;
        const studyFactor = Math.min(caseStudies.length / 5, 1); // Max confidence at 5+ studies
        const stepsFactor = Math.min(steps.length / 5, 1); // Max confidence at 5+ steps
        return Math.round((avgRelevance * 0.5 + studyFactor * 0.3 + stepsFactor * 0.2) * 100) / 100;
    }
    // Helper method for agents to trigger LFO
    static async triggerLFO(memory, plugins, agentId, domain, taskType, error, context = {}, retryCount = 0) {
        const lfoRunner = new LfoRunner(memory, plugins);
        const signal = {
            agentId,
            domain,
            taskType,
            errorMessage: error.message,
            context,
            timestamp: new Date(),
            severity: retryCount > 2 ? 'high' : retryCount > 0 ? 'medium' : 'low',
            retryCount
        };
        return lfoRunner.runLFO(signal);
    }
}
export async function runLFO(signal) {
    // This is the main entry point referenced in the masterplan
    // Note: In production, these would be properly initialized from the runtime
    throw new Error('runLFO requires initialized MemorySpine and PluginMesh instances. Use LfoRunner.triggerLFO or create LfoRunner instance directly.');
}
//# sourceMappingURL=LfoRunner.js.map