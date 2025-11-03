declare module "@elizaos/core" {
  interface Character {
    alphaGoRL?: {
      enabled: boolean;
      learningRate: number;
      discountFactor: number;
      explorationRate: number;
      explorationDecay: number;
      replayBufferSize: number;
      rewardSystem: {
        successfulExecution: number;
        highProfitExecution: number;
        gasOptimization: number;
        competitorBeat: number;
        technicalInnovation: number;
        failedExecution: number;
        gasWaste: number;
        competitorLoss: number;
        slowExecution: number;
      };
      memoryTracking: {
        totalExecutions: string;
        successRate: string;
        totalProfit: string;
        avgGasCost: string;
        competitionWins: string;
        competitionLosses: string;
        rewardsEarned: string;
        learningEpisodes: string;
        currentScore: string;
      };
    };
    actions?: Array<{
      name: string;
      similes: string[];
      description: string;
      validate: string;
      handler: string;
    }>;
    evaluators?: Array<{
      name: string;
      similes: string[];
      description: string;
      validate: string;
      handler: string;
    }>;
    technicalSpecs?: {
      minimumProfitUSD: number;
      maximumGasGwei: number;
      flashLoanProviders: string[];
      executionTimeoutMs: number;
      slippageTolerance: number;
      competitorResponseTime: number;
    };
    decisionMaking?: {
      riskProfile: string;
      profitThreshold: number;
      confidenceThreshold: number;
      informationProcessing: string;
      timeHorizon: string;
      competitionApproach: string;
      teamRole: string;
      learningStyle: string;
    };
    gameTheoryProfile?: {
      cooperationStrategy: string;
      competitionStrategy: string;
      riskAttitude: string;
      timeDiscounting: string;
      informationSharing: string;
      allianceBuilding: string;
    };
    strategicWeights?: {
      profit_absolute: number;
      technical_mastery: number;
      execution_speed: number;
      gas_optimization: number;
      competition_beating: number;
      risk_tolerance: number;
      opportunity_size: number;
      team_coordination: number;
      individual_success: number;
      innovation: number;
    };
  }
} 