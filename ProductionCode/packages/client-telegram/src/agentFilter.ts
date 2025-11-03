export interface AgentInterestProfile {
  agentId: string;
  keywords: string[];
  topics: string[];
  minRelevanceScore: number;
  specialPatterns?: RegExp[];
}

export class AgentFilterService {
  private agentProfiles: Map<string, AgentInterestProfile>;
  
  constructor() {
    this.agentProfiles = new Map();
    this.initializeProfiles();
  }
  
  private initializeProfiles(): void {
    // Load from character configs
    this.agentProfiles.set('blockchain-analyst', {
      agentId: 'blockchain-analyst',
      keywords: ['blockchain', 'defi', 'protocol', 'tvl', 'gas', 'on-chain'],
      topics: ['technical-analysis', 'market-metrics', 'protocol-analysis'],
      minRelevanceScore: 0.6,
      specialPatterns: [/\$[A-Z]+/g, /0x[a-fA-F0-9]+/g] // Token symbols, addresses
    });
    
    this.agentProfiles.set('trading-agent', {
      agentId: 'trading-agent', 
      keywords: ['trade', 'buy', 'sell', 'price', 'pump', 'dump', 'arbitrage'],
      topics: ['trading', 'market-analysis', 'price-action'],
      minRelevanceScore: 0.7,
      specialPatterns: [/\d+%/g, /\$\d+/g] // Percentages, prices
    });
    
    // Add more agent profiles...
  }
  
  async filterAgentsForMessage(message: string, allAgentIds: string[]): Promise<string[]> {
    const relevantAgents: Array<{id: string, score: number}> = [];
    
    for (const agentId of allAgentIds) {
      const profile = this.agentProfiles.get(agentId);
      if (!profile) continue;
      
      const score = this.calculateRelevanceScore(message, profile);
      if (score >= profile.minRelevanceScore) {
        relevantAgents.push({ id: agentId, score });
      }
    }
    
    // Sort by relevance and return top agents
    return relevantAgents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Max 5 agents per message
      .map(a => a.id);
  }
  
  private calculateRelevanceScore(message: string, profile: AgentInterestProfile): number {
    const lowerMessage = message.toLowerCase();
    let score = 0;
    let matches = 0;
    
    // Keyword matching
    for (const keyword of profile.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 0.2;
        matches++;
      }
    }
    
    // Special pattern matching
    if (profile.specialPatterns) {
      for (const pattern of profile.specialPatterns) {
        if (pattern.test(message)) {
          score += 0.3;
          matches++;
        }
      }
    }
    
    // Normalize score
    return Math.min(score, 1.0);
  }
} 