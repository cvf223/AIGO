/**
 * Domain-Specific Learning Goals and Curricula
 * 
 * 💡 WHY: Provides structured learning paths for each agent type to develop
 * measurable expertise in their specialized domains.
 * 
 * ⚙️ HOW: Defines learning goals, curricula, and assessment criteria for
 * systematic knowledge acquisition and skill development.
 */

export interface LearningCurriculum {
    domain: string;
    agentType: string;
    learningPath: LearningModule[];
    prerequisites: string[];
    estimatedTimeToCompetency: number; // weeks
    expertiseBenchmarks: ExpertiseBenchmark[];
}

export interface LearningModule {
    id: string;
    name: string;
    description: string;
    topics: string[];
    learningObjectives: string[];
    assessmentCriteria: string[];
    estimatedHours: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    prerequisites: string[];
    practicalExercises: string[];
    knowledgeSources: string[];
}

export interface ExpertiseBenchmark {
    level: number; // 0-100
    title: string;
    description: string;
    requiredKnowledge: string[];
    practicalSkills: string[];
    assessmentTasks: string[];
}

// DeFi Specialist Learning Curriculum
export const defiLearningCurriculum: LearningCurriculum = {
    domain: 'defi',
    agentType: 'defi-specialist',
    learningPath: [
        {
            id: 'defi_basics',
            name: 'DeFi Fundamentals',
            description: 'Core concepts of decentralized finance',
            topics: [
                'blockchain_basics',
                'smart_contracts',
                'decentralization_principles',
                'defi_vs_traditional_finance',
                'key_protocols_overview'
            ],
            learningObjectives: [
                'Understand blockchain and smart contract fundamentals',
                'Explain the difference between DeFi and traditional finance',
                'Identify major DeFi protocols and their purposes',
                'Recognize basic DeFi risks and opportunities'
            ],
            assessmentCriteria: [
                'Can explain DeFi concepts to a beginner',
                'Correctly identifies protocol types and use cases',
                'Understands basic risk factors'
            ],
            estimatedHours: 20,
            difficulty: 'beginner',
            prerequisites: [],
            practicalExercises: [
                'Analyze top 10 DeFi protocols by TVL',
                'Compare yield opportunities across protocols',
                'Identify arbitrage opportunities between DEXs'
            ],
            knowledgeSources: [
                'defipulse.com',
                'docs.aave.com',
                'uniswap.org/docs',
                'compound.finance/docs'
            ]
        },
        {
            id: 'liquidity_mechanisms',
            name: 'Liquidity and Market Making',
            description: 'Understanding liquidity provision and market dynamics',
            topics: [
                'automated_market_makers',
                'liquidity_pools',
                'impermanent_loss',
                'slippage_mechanics',
                'liquidity_mining',
                'concentrated_liquidity'
            ],
            learningObjectives: [
                'Master AMM mechanics and pricing formulas',
                'Calculate impermanent loss scenarios',
                'Optimize liquidity provision strategies',
                'Understand market impact and slippage'
            ],
            assessmentCriteria: [
                'Can calculate IL for various scenarios',
                'Optimizes LP positions for risk/reward',
                'Predicts market impact of large trades'
            ],
            estimatedHours: 30,
            difficulty: 'intermediate',
            prerequisites: ['defi_basics'],
            practicalExercises: [
                'Calculate optimal LP ranges for Uniswap V3',
                'Analyze IL vs fee earnings for different pairs',
                'Design market making strategies'
            ],
            knowledgeSources: [
                'uniswap.org/whitepaper',
                'curve.fi/whitepaper',
                'balancer.fi/whitepaper'
            ]
        },
        {
            id: 'yield_optimization',
            name: 'Yield Farming and Optimization',
            description: 'Advanced yield strategies and risk management',
            topics: [
                'yield_farming_strategies',
                'protocol_token_economics',
                'governance_tokens',
                'vault_strategies',
                'auto_compounding',
                'cross_protocol_strategies'
            ],
            learningObjectives: [
                'Design optimal yield farming strategies',
                'Assess protocol sustainability and risks',
                'Implement auto-compounding mechanisms',
                'Create cross-protocol yield strategies'
            ],
            assessmentCriteria: [
                'Designs profitable yield strategies',
                'Correctly assesses protocol risks',
                'Optimizes gas costs vs returns'
            ],
            estimatedHours: 40,
            difficulty: 'advanced',
            prerequisites: ['liquidity_mechanisms'],
            practicalExercises: [
                'Build yield optimization algorithm',
                'Analyze protocol sustainability metrics',
                'Design risk-adjusted yield strategies'
            ],
            knowledgeSources: [
                'yearn.finance/vaults',
                'convex.finance',
                'tokemak.xyz'
            ]
        },
        {
            id: 'mev_arbitrage',
            name: 'MEV and Arbitrage Strategies',
            description: 'Maximal Extractable Value and arbitrage opportunities',
            topics: [
                'mev_fundamentals',
                'arbitrage_detection',
                'flashloan_strategies',
                'sandwich_attacks',
                'liquidation_opportunities',
                'cross_dex_arbitrage'
            ],
            learningObjectives: [
                'Identify MEV opportunities in real-time',
                'Execute profitable arbitrage strategies',
                'Understand MEV protection mechanisms',
                'Optimize transaction ordering and timing'
            ],
            assessmentCriteria: [
                'Successfully identifies arbitrage opportunities',
                'Executes profitable MEV strategies',
                'Minimizes MEV exposure when needed'
            ],
            estimatedHours: 50,
            difficulty: 'expert',
            prerequisites: ['yield_optimization'],
            practicalExercises: [
                'Build arbitrage detection system',
                'Execute flashloan arbitrage',
                'Analyze MEV protection effectiveness'
            ],
            knowledgeSources: [
                'flashbots.net',
                'mev-explore.flashbots.net',
                'eigenphi.io'
            ]
        }
    ],
    prerequisites: ['blockchain_basics', 'smart_contract_fundamentals'],
    estimatedTimeToCompetency: 16, // weeks
    expertiseBenchmarks: [
        {
            level: 25,
            title: 'DeFi Novice',
            description: 'Understands basic DeFi concepts and can navigate major protocols',
            requiredKnowledge: ['defi_basics', 'major_protocols'],
            practicalSkills: ['protocol_interaction', 'basic_yield_farming'],
            assessmentTasks: ['Explain DeFi to newcomer', 'Compare protocol yields']
        },
        {
            level: 50,
            title: 'DeFi Practitioner',
            description: 'Can design and execute intermediate DeFi strategies',
            requiredKnowledge: ['liquidity_mechanics', 'yield_strategies'],
            practicalSkills: ['LP_optimization', 'risk_assessment'],
            assessmentTasks: ['Optimize LP position', 'Assess protocol risks']
        },
        {
            level: 75,
            title: 'DeFi Strategist',
            description: 'Develops advanced strategies and understands protocol economics',
            requiredKnowledge: ['tokenomics', 'governance', 'cross_protocol'],
            practicalSkills: ['strategy_design', 'risk_modeling'],
            assessmentTasks: ['Design yield strategy', 'Model protocol sustainability']
        },
        {
            level: 90,
            title: 'DeFi Expert',
            description: 'Masters MEV, arbitrage, and cutting-edge DeFi innovations',
            requiredKnowledge: ['mev_strategies', 'arbitrage', 'protocol_design'],
            practicalSkills: ['mev_execution', 'protocol_analysis'],
            assessmentTasks: ['Execute MEV strategy', 'Analyze new protocol']
        }
    ]
};

// Trading Specialist Learning Curriculum
export const tradingLearningCurriculum: LearningCurriculum = {
    domain: 'trading',
    agentType: 'trading-specialist',
    learningPath: [
        {
            id: 'market_fundamentals',
            name: 'Market Structure and Fundamentals',
            description: 'Understanding market mechanics and trading basics',
            topics: [
                'market_structure',
                'order_types',
                'bid_ask_spreads',
                'market_depth',
                'trading_venues',
                'latency_arbitrage'
            ],
            learningObjectives: [
                'Understand market microstructure',
                'Master different order types and execution',
                'Analyze market depth and liquidity',
                'Recognize market inefficiencies'
            ],
            assessmentCriteria: [
                'Correctly interprets order book data',
                'Chooses optimal order types for situations',
                'Identifies liquidity patterns'
            ],
            estimatedHours: 25,
            difficulty: 'beginner',
            prerequisites: [],
            practicalExercises: [
                'Analyze order book dynamics',
                'Compare execution across venues',
                'Identify arbitrage opportunities'
            ],
            knowledgeSources: [
                'binance.com/academy',
                'coinbase.com/learn',
                'tradingview.com/education'
            ]
        },
        {
            id: 'technical_analysis',
            name: 'Technical Analysis and Pattern Recognition',
            description: 'Chart analysis, indicators, and pattern recognition',
            topics: [
                'candlestick_patterns',
                'support_resistance',
                'trend_analysis',
                'technical_indicators',
                'volume_analysis',
                'momentum_indicators'
            ],
            learningObjectives: [
                'Identify chart patterns and trends',
                'Use technical indicators effectively',
                'Analyze volume and momentum',
                'Predict price movements'
            ],
            assessmentCriteria: [
                'Accurately identifies chart patterns',
                'Correctly interprets indicator signals',
                'Makes profitable predictions'
            ],
            estimatedHours: 35,
            difficulty: 'intermediate',
            prerequisites: ['market_fundamentals'],
            practicalExercises: [
                'Backtest technical strategies',
                'Identify breakout patterns',
                'Optimize indicator parameters'
            ],
            knowledgeSources: [
                'tradingview.com',
                'investopedia.com',
                'babypips.com'
            ]
        },
        {
            id: 'algorithmic_trading',
            name: 'Algorithmic Trading and Strategy Development',
            description: 'Automated trading systems and strategy development',
            topics: [
                'strategy_development',
                'backtesting_methods',
                'risk_management',
                'portfolio_optimization',
                'execution_algorithms',
                'performance_metrics'
            ],
            learningObjectives: [
                'Develop profitable trading algorithms',
                'Implement proper backtesting',
                'Manage risk and drawdowns',
                'Optimize portfolio allocation'
            ],
            assessmentCriteria: [
                'Creates profitable strategies',
                'Implements robust risk management',
                'Optimizes execution efficiency'
            ],
            estimatedHours: 45,
            difficulty: 'advanced',
            prerequisites: ['technical_analysis'],
            practicalExercises: [
                'Build momentum trading algorithm',
                'Implement risk management system',
                'Optimize execution algorithms'
            ],
            knowledgeSources: [
                'quantstart.com',
                'zipline.io',
                'backtrader.com'
            ]
        }
    ],
    prerequisites: ['market_basics', 'statistics'],
    estimatedTimeToCompetency: 14, // weeks
    expertiseBenchmarks: [
        {
            level: 25,
            title: 'Trading Novice',
            description: 'Understands market basics and can execute simple trades',
            requiredKnowledge: ['market_structure', 'order_types'],
            practicalSkills: ['order_execution', 'basic_analysis'],
            assessmentTasks: ['Execute trades efficiently', 'Read order books']
        },
        {
            level: 50,
            title: 'Technical Trader',
            description: 'Can perform technical analysis and identify patterns',
            requiredKnowledge: ['technical_analysis', 'chart_patterns'],
            practicalSkills: ['pattern_recognition', 'indicator_analysis'],
            assessmentTasks: ['Identify trading setups', 'Analyze market trends']
        },
        {
            level: 75,
            title: 'Algorithmic Trader',
            description: 'Develops and implements automated trading strategies',
            requiredKnowledge: ['strategy_development', 'backtesting'],
            practicalSkills: ['algorithm_development', 'risk_management'],
            assessmentTasks: ['Build trading algorithm', 'Optimize strategy performance']
        }
    ]
};

// Infrastructure Specialist Learning Curriculum
export const infrastructureLearningCurriculum: LearningCurriculum = {
    domain: 'infrastructure',
    agentType: 'infrastructure-specialist',
    learningPath: [
        {
            id: 'system_architecture',
            name: 'System Architecture and Design',
            description: 'Designing scalable and reliable systems',
            topics: [
                'distributed_systems',
                'microservices_architecture',
                'load_balancing',
                'caching_strategies',
                'database_design',
                'api_design'
            ],
            learningObjectives: [
                'Design scalable system architectures',
                'Implement effective caching strategies',
                'Optimize database performance',
                'Create robust API designs'
            ],
            assessmentCriteria: [
                'Designs systems that scale efficiently',
                'Implements appropriate caching',
                'Optimizes database queries'
            ],
            estimatedHours: 30,
            difficulty: 'intermediate',
            prerequisites: [],
            practicalExercises: [
                'Design high-throughput trading system',
                'Implement caching layer',
                'Optimize database schema'
            ],
            knowledgeSources: [
                'aws.amazon.com/architecture',
                'cloud.google.com/architecture',
                'docs.microsoft.com/azure'
            ]
        },
        {
            id: 'performance_optimization',
            name: 'Performance Optimization and Monitoring',
            description: 'System performance tuning and monitoring',
            topics: [
                'performance_profiling',
                'bottleneck_identification',
                'resource_optimization',
                'monitoring_systems',
                'alerting_strategies',
                'capacity_planning'
            ],
            learningObjectives: [
                'Identify and resolve performance bottlenecks',
                'Implement comprehensive monitoring',
                'Optimize resource utilization',
                'Plan for capacity growth'
            ],
            assessmentCriteria: [
                'Successfully identifies bottlenecks',
                'Implements effective monitoring',
                'Optimizes system performance'
            ],
            estimatedHours: 35,
            difficulty: 'advanced',
            prerequisites: ['system_architecture'],
            practicalExercises: [
                'Profile and optimize slow queries',
                'Set up monitoring dashboard',
                'Plan capacity for 10x growth'
            ],
            knowledgeSources: [
                'prometheus.io',
                'grafana.com',
                'datadog.com'
            ]
        }
    ],
    prerequisites: ['programming_fundamentals', 'system_administration'],
    estimatedTimeToCompetency: 12, // weeks
    expertiseBenchmarks: [
        {
            level: 25,
            title: 'Infrastructure Novice',
            description: 'Understands basic system concepts and can deploy simple applications',
            requiredKnowledge: ['system_basics', 'deployment'],
            practicalSkills: ['basic_deployment', 'monitoring_setup'],
            assessmentTasks: ['Deploy application', 'Set up basic monitoring']
        },
        {
            level: 50,
            title: 'System Administrator',
            description: 'Can design and manage production systems',
            requiredKnowledge: ['system_architecture', 'performance_tuning'],
            practicalSkills: ['system_design', 'performance_optimization'],
            assessmentTasks: ['Design scalable system', 'Optimize performance']
        }
    ]
};

// Blockchain Analyst Learning Curriculum
export const blockchainLearningCurriculum: LearningCurriculum = {
    domain: 'blockchain',
    agentType: 'blockchain-analyst',
    learningPath: [
        {
            id: 'blockchain_fundamentals',
            name: 'Blockchain Technology Fundamentals',
            description: 'Core blockchain concepts and mechanisms',
            topics: [
                'consensus_mechanisms',
                'cryptographic_primitives',
                'transaction_structure',
                'block_structure',
                'network_protocols',
                'security_models'
            ],
            learningObjectives: [
                'Understand consensus mechanisms deeply',
                'Analyze transaction and block structures',
                'Evaluate security properties',
                'Compare different blockchain architectures'
            ],
            assessmentCriteria: [
                'Explains consensus mechanisms accurately',
                'Analyzes blockchain security properties',
                'Compares different blockchain designs'
            ],
            estimatedHours: 40,
            difficulty: 'intermediate',
            prerequisites: [],
            practicalExercises: [
                'Analyze Bitcoin vs Ethereum consensus',
                'Trace transaction lifecycle',
                'Evaluate new blockchain proposals'
            ],
            knowledgeSources: [
                'ethereum.org/developers',
                'bitcoin.org/bitcoin.pdf',
                'docs.cosmos.network'
            ]
        },
        {
            id: 'onchain_analysis',
            name: 'On-Chain Data Analysis',
            description: 'Analyzing blockchain data for insights',
            topics: [
                'transaction_analysis',
                'address_clustering',
                'flow_analysis',
                'defi_analytics',
                'nft_analytics',
                'whale_tracking'
            ],
            learningObjectives: [
                'Perform comprehensive on-chain analysis',
                'Track fund flows and patterns',
                'Identify market trends from data',
                'Detect anomalous behavior'
            ],
            assessmentCriteria: [
                'Accurately analyzes transaction patterns',
                'Identifies market trends from data',
                'Detects suspicious activities'
            ],
            estimatedHours: 35,
            difficulty: 'advanced',
            prerequisites: ['blockchain_fundamentals'],
            practicalExercises: [
                'Analyze DeFi protocol usage patterns',
                'Track whale movements',
                'Identify arbitrage opportunities'
            ],
            knowledgeSources: [
                'dune.com',
                'nansen.ai',
                'chainalysis.com'
            ]
        }
    ],
    prerequisites: ['data_analysis', 'cryptography_basics'],
    estimatedTimeToCompetency: 10, // weeks
    expertiseBenchmarks: [
        {
            level: 25,
            title: 'Blockchain Novice',
            description: 'Understands basic blockchain concepts',
            requiredKnowledge: ['blockchain_basics', 'consensus'],
            practicalSkills: ['transaction_analysis', 'block_exploration'],
            assessmentTasks: ['Explain consensus mechanisms', 'Analyze transactions']
        },
        {
            level: 50,
            title: 'Blockchain Analyst',
            description: 'Can perform comprehensive on-chain analysis',
            requiredKnowledge: ['onchain_analysis', 'data_interpretation'],
            practicalSkills: ['pattern_recognition', 'trend_analysis'],
            assessmentTasks: ['Analyze protocol metrics', 'Identify market trends']
        }
    ]
};

// Export all curricula
export const domainCurricula = {
    defi: defiLearningCurriculum,
    trading: tradingLearningCurriculum,
    infrastructure: infrastructureLearningCurriculum,
    blockchain: blockchainLearningCurriculum
};

// Utility functions for curriculum management
export class CurriculumManager {
    static getCurriculumForAgent(agentType: string): LearningCurriculum | null {
        const typeMap: Record<string, string> = {
            'blockchain-analyst': 'blockchain',
            'market-analyst': 'trading',
            'flae-executer': 'defi',
            'opportunity-spotter': 'defi',
            'meme-coin-creator': 'trading',
            'social-media-manager': 'infrastructure',
            'chrissuperdev': 'infrastructure'
        };
        
        const domain = typeMap[agentType];
        return domain ? domainCurricula[domain as keyof typeof domainCurricula] : null;
    }
    
    static getNextLearningModule(agentType: string, currentLevel: number): LearningModule | null {
        const curriculum = this.getCurriculumForAgent(agentType);
        if (!curriculum) return null;
        
        // Find appropriate module based on current level
        for (const module of curriculum.learningPath) {
            const moduleLevel = this.getModuleLevel(module.difficulty);
            if (currentLevel < moduleLevel) {
                return module;
            }
        }
        
        return null; // Agent has completed all modules
    }
    
    private static getModuleLevel(difficulty: string): number {
        const levelMap = {
            'beginner': 25,
            'intermediate': 50,
            'advanced': 75,
            'expert': 90
        };
        return levelMap[difficulty as keyof typeof levelMap] || 0;
    }
    
    static assessModuleCompletion(module: LearningModule, knowledgeBase: any[]): boolean {
        // Simple assessment based on knowledge coverage
        const requiredTopics = module.topics;
        const coveredTopics = knowledgeBase.filter(kb => 
            requiredTopics.some(topic => 
                kb.content.toLowerCase().includes(topic.replace('_', ' '))
            )
        );
        
        // Require coverage of at least 70% of topics
        return (coveredTopics.length / requiredTopics.length) >= 0.7;
    }
} 