/**
 * OPPORTUNITY IMPACT CONFIGURATION
 * ===============================
 * 
 * This file defines the thresholds for determining opportunity impact levels.
 * These thresholds are used to decide when to preempt memory operations.
 */

/**
 * Opportunity impact thresholds (as decimal percentages)
 * 
 * - NEGLIGIBLE: Below 0.001 (0.1%) - Barely worth considering
 * - LOW: 0.001 to 0.003 (0.1% to 0.3%) - Worth executing but not urgent
 * - MEDIUM: 0.003 to 0.005 (0.3% to 0.5%) - Standard opportunities
 * - HIGH: 0.005 to 0.01 (0.5% to 1%) - High priority opportunities
 * - CRITICAL: Above 0.01 (1%) - Extremely valuable opportunities
 */
const IMPACT_THRESHOLDS = {
  NEGLIGIBLE: 0.001,  // 0.1%
  LOW: 0.003,         // 0.3%
  MEDIUM: 0.005,      // 0.5%
  HIGH: 0.01,         // 1%
  CRITICAL: 0.02      // 2%
};

/**
 * Preemption thresholds for memory tiers
 * 
 * These define the minimum impact required to preempt memory operations
 * at different tiers.
 */
const PREEMPTION_THRESHOLDS = {
  // Tier 1 (Critical Historical Knowledge)
  // Only preempt for critical opportunities (>2%)
  TIER_1: IMPACT_THRESHOLDS.CRITICAL,
  
  // Tier 2 (Recent Discoveries)
  // Preempt for high impact opportunities (>0.5%)
  TIER_2: IMPACT_THRESHOLDS.MEDIUM,
  
  // Tier 3 (Current Task State)
  // Preempt for any non-negligible opportunity (>0.1%)
  TIER_3: IMPACT_THRESHOLDS.NEGLIGIBLE
};

/**
 * Calculate the impact level of an opportunity
 * @param {Object} opportunityData - Opportunity data
 * @returns {string} Impact level (NEGLIGIBLE, LOW, MEDIUM, HIGH, CRITICAL)
 */
function calculateImpactLevel(opportunityData) {
  const impact = calculateImpact(opportunityData);
  
  if (impact >= IMPACT_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (impact >= IMPACT_THRESHOLDS.HIGH) return 'HIGH';
  if (impact >= IMPACT_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (impact >= IMPACT_THRESHOLDS.LOW) return 'LOW';
  return 'NEGLIGIBLE';
}

/**
 * Calculate the numerical impact of an opportunity
 * @param {Object} opportunityData - Opportunity data
 * @returns {number} Impact value (0-1)
 */
function calculateImpact(opportunityData) {
  try {
    // If impact is already calculated
    if (typeof opportunityData.priceImpact === 'number') {
      return opportunityData.priceImpact;
    }
    
    // Calculate from profit and investment amount
    if (opportunityData.expectedProfit !== undefined && opportunityData.investmentAmount !== undefined) {
      const profit = parseFloat(opportunityData.expectedProfit);
      const investment = parseFloat(opportunityData.investmentAmount);
      
      if (!isNaN(profit) && !isNaN(investment) && investment > 0) {
        return profit / investment;
      }
    }
    
    // Calculate from price difference
    if (opportunityData.buyPrice !== undefined && opportunityData.sellPrice !== undefined) {
      const buyPrice = parseFloat(opportunityData.buyPrice);
      const sellPrice = parseFloat(opportunityData.sellPrice);
      
      if (!isNaN(buyPrice) && !isNaN(sellPrice) && buyPrice > 0) {
        return Math.abs(sellPrice - buyPrice) / buyPrice;
      }
    }
    
    // Calculate from token amounts and prices
    if (opportunityData.inputAmount !== undefined && 
        opportunityData.outputAmount !== undefined && 
        opportunityData.inputTokenPrice !== undefined && 
        opportunityData.outputTokenPrice !== undefined) {
      
      const inputAmount = parseFloat(opportunityData.inputAmount);
      const outputAmount = parseFloat(opportunityData.outputAmount);
      const inputTokenPrice = parseFloat(opportunityData.inputTokenPrice);
      const outputTokenPrice = parseFloat(opportunityData.outputTokenPrice);
      
      if (!isNaN(inputAmount) && !isNaN(outputAmount) && 
          !isNaN(inputTokenPrice) && !isNaN(outputTokenPrice) && 
          inputAmount > 0 && inputTokenPrice > 0) {
        
        const inputValue = inputAmount * inputTokenPrice;
        const outputValue = outputAmount * outputTokenPrice;
        
        return (outputValue - inputValue) / inputValue;
      }
    }
    
    // Calculate from gas costs and profit
    if (opportunityData.expectedProfit !== undefined && opportunityData.estimatedGasCost !== undefined) {
      const profit = parseFloat(opportunityData.expectedProfit);
      const gasCost = parseFloat(opportunityData.estimatedGasCost);
      
      if (!isNaN(profit) && !isNaN(gasCost) && gasCost > 0) {
        return (profit - gasCost) / gasCost;
      }
    }
    
    // Calculate from historical average profit
    if (opportunityData.expectedProfit !== undefined && opportunityData.historicalAverageProfit !== undefined) {
      const profit = parseFloat(opportunityData.expectedProfit);
      const avgProfit = parseFloat(opportunityData.historicalAverageProfit);
      
      if (!isNaN(profit) && !isNaN(avgProfit) && avgProfit > 0) {
        return profit / avgProfit;
      }
    }
    
    // If we have a raw impact value
    if (opportunityData.impact !== undefined) {
      const impact = parseFloat(opportunityData.impact);
      if (!isNaN(impact)) {
        return impact;
      }
    }
    
    // If we have a percentage impact value
    if (opportunityData.percentageImpact !== undefined) {
      const percentageImpact = parseFloat(opportunityData.percentageImpact);
      if (!isNaN(percentageImpact)) {
        return percentageImpact / 100; // Convert percentage to decimal
      }
    }
    
    // If we have a profit percentage value
    if (opportunityData.profitPercentage !== undefined) {
      const profitPercentage = parseFloat(opportunityData.profitPercentage);
      if (!isNaN(profitPercentage)) {
        return profitPercentage / 100; // Convert percentage to decimal
      }
    }
    
    // Default to negligible impact if we can't calculate
    return IMPACT_THRESHOLDS.NEGLIGIBLE;
  } catch (error) {
    console.error('Error calculating opportunity impact:', error);
    return IMPACT_THRESHOLDS.NEGLIGIBLE;
  }
}

/**
 * Determine if an opportunity should preempt a memory operation
 * @param {Object} opportunityData - Opportunity data
 * @param {string} memoryTier - Memory tier (TIER_1, TIER_2, TIER_3)
 * @returns {boolean} Whether to preempt
 */
function shouldPreemptMemoryOperation(opportunityData, memoryTier) {
  const impact = calculateImpact(opportunityData);
  const threshold = PREEMPTION_THRESHOLDS[memoryTier];
  
  if (!threshold) {
    console.warn(`Unknown memory tier: ${memoryTier}, defaulting to no preemption`);
    return false;
  }
  
  return impact >= threshold;
}

/**
 * Calculate the priority score for an opportunity
 * This is used for sorting opportunities in the queue
 * @param {Object} opportunityData - Opportunity data
 * @returns {number} Priority score (higher is more important)
 */
function calculatePriorityScore(opportunityData) {
  const impact = calculateImpact(opportunityData);
  
  // Base score is the impact
  let score = impact * 100;
  
  // Adjust based on opportunity type
  if (opportunityData.type === 'flash-loan') {
    score *= 1.2; // 20% bonus for flash loan opportunities
  } else if (opportunityData.type === 'cross-exchange') {
    score *= 1.1; // 10% bonus for cross-exchange opportunities
  }
  
  // Adjust based on chain
  if (opportunityData.chain === 'ethereum') {
    score *= 1.05; // 5% bonus for Ethereum opportunities
  } else if (opportunityData.chain === 'arbitrum') {
    score *= 1.1; // 10% bonus for Arbitrum opportunities
  }
  
  // Adjust based on gas cost if available
  if (opportunityData.estimatedGasCost !== undefined) {
    const gasCost = parseFloat(opportunityData.estimatedGasCost);
    if (!isNaN(gasCost) && gasCost > 0) {
      // Lower score for higher gas costs
      score = score / (1 + (gasCost / 10));
    }
  }
  
  // Adjust based on time sensitivity if available
  if (opportunityData.timeSensitivity !== undefined) {
    const timeSensitivity = parseFloat(opportunityData.timeSensitivity);
    if (!isNaN(timeSensitivity) && timeSensitivity > 0) {
      // Higher score for more time-sensitive opportunities
      score *= (1 + (timeSensitivity / 10));
    }
  }
  
  return score;
}

/**
 * Get a human-readable description of an opportunity's impact
 * @param {Object} opportunityData - Opportunity data
 * @returns {string} Human-readable description
 */
function getImpactDescription(opportunityData) {
  const impact = calculateImpact(opportunityData);
  const impactLevel = calculateImpactLevel(opportunityData);
  
  let description = `${impactLevel} impact (${(impact * 100).toFixed(2)}%)`;
  
  if (opportunityData.expectedProfit !== undefined) {
    description += ` with expected profit of ${opportunityData.expectedProfit}`;
  }
  
  if (opportunityData.chain !== undefined) {
    description += ` on ${opportunityData.chain}`;
  }
  
  if (opportunityData.type !== undefined) {
    description += ` (${opportunityData.type})`;
  }
  
  return description;
}

export {
  IMPACT_THRESHOLDS,
  PREEMPTION_THRESHOLDS,
  calculateImpactLevel,
  calculateImpact,
  shouldPreemptMemoryOperation,
  calculatePriorityScore,
  getImpactDescription
}; 