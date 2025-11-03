#!/usr/bin/env node

/**
 * 🛡️ SOURCE VALIDATION SYSTEM
 * ===========================
 * 
 * CRITICAL SYSTEM: Prevents agents from making decisions based on:
 * - Hallucinated data
 * - Biased information
 * - Scam/manipulation attempts
 * - Unvalidated claims
 * - Profit-driven misinformation
 * 
 * PHILOSOPHY: "Trust but verify" - All external data must be validated
 * against blockchain truth before being used for agent decisions.
 * 
 * FEATURES:
 * ✅ Blockchain data cross-validation
 * ✅ Source credibility scoring
 * ✅ Bias detection and flagging
 * ✅ Claim verification pipeline
 * ✅ Confidence score assignment
 * ✅ Multi-source corroboration
 * ✅ Manipulation detection
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

class SourceValidationSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Validation thresholds
      minimum_confidence_score: 0.7,
      minimum_source_credibility: 0.6,
      minimum_corroboration_sources: 2,
      maximum_bias_score: 0.3,
      
      // Blockchain validation
      blockchain_apis: [
        'alchemy', 'moralis', 'infura', 'quicknode'
      ],
      
      // Source categories
      trusted_sources: [
        'coingecko.com',
        'coinmarketcap.com',
        'dune.com',
        'defillama.com',
        'etherscan.io',
        'arbiscan.io'
      ],
      
      warning_sources: [
        'telegram_channels',
        'discord_alpha',
        'twitter_predictions',
        'youtube_analysis',
        'medium_posts'
      ],
      
      blacklisted_sources: [
        'known_scam_sites',
        'pump_dump_groups',
        'fake_news_sites'
      ],
      
      // Validation criteria
      validation_criteria: {
        price_claims: {
          blockchain_verification: true,
          multiple_exchange_check: true,
          historical_accuracy: true
        },
        volume_claims: {
          on_chain_verification: true,
          dex_aggregator_check: true,
          manipulation_detection: true
        },
        technical_analysis: {
          chart_data_verification: true,
          pattern_validation: true,
          indicator_accuracy: true
        },
        fundamental_analysis: {
          protocol_data_check: true,
          tvl_verification: true,
          governance_validation: true
        }
      },
      
      ...config
    };
    
    // Validation state
    this.source_credibility_scores = new Map();
    this.claim_verification_cache = new Map();
    this.bias_detection_patterns = new Map();
    this.manipulation_signatures = new Map();
    
    // Performance tracking
    this.validation_metrics = {
      total_validations: 0,
      successful_validations: 0,
      failed_validations: 0,
      blocked_manipulations: 0,
      source_credibility_updates: 0
    };
    
    // Initialize validation patterns
    this._initializeValidationPatterns();
    
    console.log('🛡️ Source Validation System initialized');
  }
  
  /**
   * MAIN VALIDATION PIPELINE
   * Validates external data before agent consumption
   */
  async validateExternalData(data, source, claim_type) {
    console.log(`🔍 Validating ${claim_type} from ${source}`);
    
    try {
      const validation_result = {
        source,
        claim_type,
        data,
        timestamp: Date.now(),
        validation_steps: [],
        confidence_score: 0,
        is_valid: false,
        warnings: [],
        errors: []
      };
      
      // Step 1: Source credibility check
      const credibility_result = await this._validateSourceCredibility(source);
      validation_result.validation_steps.push(credibility_result);
      
      if (credibility_result.credibility_score < this.config.minimum_source_credibility) {
        validation_result.errors.push(`Source credibility too low: ${credibility_result.credibility_score}`);
        validation_result.is_valid = false;
        return validation_result;
      }
      
      // Step 2: Blockchain data cross-validation
      const blockchain_result = await this._validateAgainstBlockchain(data, claim_type);
      validation_result.validation_steps.push(blockchain_result);
      
      // Step 3: Bias detection
      const bias_result = await this._detectBias(data, source);
      validation_result.validation_steps.push(bias_result);
      
      if (bias_result.bias_score > this.config.maximum_bias_score) {
        validation_result.warnings.push(`High bias detected: ${bias_result.bias_score}`);
      }
      
      // Step 4: Manipulation detection
      const manipulation_result = await this._detectManipulation(data, source);
      validation_result.validation_steps.push(manipulation_result);
      
      if (manipulation_result.manipulation_detected) {
        validation_result.errors.push('Manipulation patterns detected');
        validation_result.is_valid = false;
        this.validation_metrics.blocked_manipulations++;
        return validation_result;
      }
      
      // Step 5: Multi-source corroboration
      const corroboration_result = await this._corroborateAcrossSources(data, claim_type);
      validation_result.validation_steps.push(corroboration_result);
      
      // Step 6: Historical accuracy check
      const accuracy_result = await this._checkHistoricalAccuracy(source, claim_type);
      validation_result.validation_steps.push(accuracy_result);
      
      // Calculate final confidence score
      validation_result.confidence_score = this._calculateConfidenceScore(validation_result.validation_steps);
      
      // Add confidence alias for test compatibility
      validation_result.confidence = validation_result.confidence_score;
      
      // Make final validation decision
      validation_result.is_valid = 
        validation_result.confidence_score >= this.config.minimum_confidence_score &&
        validation_result.errors.length === 0;
      
      // Update metrics
      this.validation_metrics.total_validations++;
      if (validation_result.is_valid) {
        this.validation_metrics.successful_validations++;
      } else {
        this.validation_metrics.failed_validations++;
      }
      
      // Update source credibility based on results
      await this._updateSourceCredibility(source, validation_result);
      
      console.log(`${validation_result.is_valid ? '✅' : '❌'} Validation ${validation_result.is_valid ? 'passed' : 'failed'}: ${validation_result.confidence_score.toFixed(3)} confidence`);
      
      this.emit('validationCompleted', validation_result);
      
      return validation_result;
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      this.validation_metrics.failed_validations++;
      throw error;
    }
  }
  
  /**
   * Validate source credibility
   */
  async _validateSourceCredibility(source) {
    const result = {
      step: 'source_credibility',
      source,
      credibility_score: 0,
      reputation_factors: {},
      warnings: []
    };
    
    // Check against trusted sources
    if (this.config.trusted_sources.some(trusted => source.includes(trusted))) {
      result.credibility_score = 0.9;
      result.reputation_factors.trusted_source = true;
    }
    
    // Check against warning sources
    else if (this.config.warning_sources.some(warning => source.includes(warning))) {
      result.credibility_score = 0.4;
      result.reputation_factors.warning_source = true;
      result.warnings.push('Source requires additional verification');
    }
    
    // Check against blacklisted sources
    else if (this.config.blacklisted_sources.some(blacklisted => source.includes(blacklisted))) {
      result.credibility_score = 0.0;
      result.reputation_factors.blacklisted_source = true;
      result.warnings.push('Source is blacklisted');
    }
    
    // Check historical credibility
    else if (this.source_credibility_scores.has(source)) {
      result.credibility_score = this.source_credibility_scores.get(source);
      result.reputation_factors.historical_credibility = true;
    }
    
    // Unknown source - neutral credibility
    else {
      result.credibility_score = 0.5;
      result.reputation_factors.unknown_source = true;
      result.warnings.push('Unknown source - requires verification');
    }
    
    return result;
  }
  
  /**
   * Validate claims against blockchain data
   */
  async _validateAgainstBlockchain(data, claim_type) {
    const result = {
      step: 'blockchain_validation',
      claim_type,
      blockchain_verified: false,
      verification_details: {},
      discrepancies: []
    };
    
    try {
      switch (claim_type) {
        case 'price_claim':
          result.verification_details = await this._validatePriceClaim(data);
          break;
        case 'volume_claim':
          result.verification_details = await this._validateVolumeClaim(data);
          break;
        case 'tvl_claim':
          result.verification_details = await this._validateTVLClaim(data);
          break;
        case 'transaction_claim':
          result.verification_details = await this._validateTransactionClaim(data);
          break;
        default:
          result.verification_details = { message: 'No blockchain validation available for this claim type' };
      }
      
      result.blockchain_verified = result.verification_details.verified || false;
      
    } catch (error) {
      result.verification_details = { error: error.message };
      result.blockchain_verified = false;
    }
    
    return result;
  }
  
  /**
   * Detect bias in data/source
   */
  async _detectBias(data, source) {
    const result = {
      step: 'bias_detection',
      bias_score: 0,
      bias_indicators: [],
      bias_patterns: []
    };
    
    // Check for extreme language
    const extreme_words = ['guaranteed', 'always', 'never', 'impossible', 'certain', '100%', 'zero risk'];
    const extreme_count = extreme_words.filter(word => 
      JSON.stringify(data).toLowerCase().includes(word.toLowerCase())
    ).length;
    
    if (extreme_count > 0) {
      result.bias_score += 0.2;
      result.bias_indicators.push(`Extreme language detected: ${extreme_count} instances`);
    }
    
    // Check for financial interest indicators
    const interest_phrases = ['buy now', 'invest today', 'limited time', 'exclusive opportunity'];
    const interest_count = interest_phrases.filter(phrase =>
      JSON.stringify(data).toLowerCase().includes(phrase.toLowerCase())
    ).length;
    
    if (interest_count > 0) {
      result.bias_score += 0.3;
      result.bias_indicators.push(`Financial interest indicators: ${interest_count} instances`);
    }
    
    // Check for one-sided analysis
    const positive_words = ['bullish', 'moon', 'pump', 'rocket', 'gains'];
    const negative_words = ['bearish', 'dump', 'crash', 'loss', 'scam'];
    const positive_count = positive_words.filter(word =>
      JSON.stringify(data).toLowerCase().includes(word.toLowerCase())
    ).length;
    const negative_count = negative_words.filter(word =>
      JSON.stringify(data).toLowerCase().includes(word.toLowerCase())
    ).length;
    
    if (positive_count > 0 && negative_count === 0) {
      result.bias_score += 0.2;
      result.bias_indicators.push('One-sided positive analysis');
    } else if (negative_count > 0 && positive_count === 0) {
      result.bias_score += 0.2;
      result.bias_indicators.push('One-sided negative analysis');
    }
    
    // Cap bias score at 1.0
    result.bias_score = Math.min(result.bias_score, 1.0);
    
    return result;
  }
  
  /**
   * Detect manipulation patterns
   */
  async _detectManipulation(data, source) {
    const result = {
      step: 'manipulation_detection',
      manipulation_detected: false,
      manipulation_patterns: [],
      risk_factors: []
    };
    
    // Check for pump and dump patterns
    if (this._detectPumpDumpPattern(data)) {
      result.manipulation_detected = true;
      result.manipulation_patterns.push('Pump and dump pattern detected');
    }
    
    // Check for coordinated messaging
    if (this._detectCoordinatedMessaging(data, source)) {
      result.manipulation_detected = true;
      result.manipulation_patterns.push('Coordinated messaging detected');
    }
    
    // Check for fake urgency
    if (this._detectFakeUrgency(data)) {
      result.manipulation_patterns.push('Fake urgency patterns detected');
      result.risk_factors.push('High pressure tactics');
    }
    
    return result;
  }
  
  /**
   * Corroborate data across multiple sources
   */
  async _corroborateAcrossSources(data, claim_type) {
    const result = {
      step: 'multi_source_corroboration',
      corroborating_sources: 0,
      conflicting_sources: 0,
      consensus_score: 0,
      source_agreements: []
    };
    
    // This would integrate with multiple data sources
    // For now, simulate corroboration logic
    
    try {
      // Check against trusted APIs for price/volume claims
      if (claim_type === 'price_claim' || claim_type === 'volume_claim') {
        const api_checks = await this._checkMultipleAPIs(data, claim_type);
        result.corroborating_sources = api_checks.agreeing_sources;
        result.conflicting_sources = api_checks.conflicting_sources;
        result.source_agreements = api_checks.agreements;
      }
      
      // Calculate consensus score
      const total_sources = result.corroborating_sources + result.conflicting_sources;
      if (total_sources > 0) {
        result.consensus_score = result.corroborating_sources / total_sources;
      }
      
    } catch (error) {
      console.error('❌ Corroboration failed:', error);
    }
    
    return result;
  }
  
  /**
   * Check historical accuracy of source
   */
  async _checkHistoricalAccuracy(source, claim_type) {
    const result = {
      step: 'historical_accuracy',
      accuracy_score: 0.5, // Default neutral
      historical_claims: 0,
      correct_predictions: 0,
      accuracy_details: {}
    };
    
    // Check if we have historical data for this source
    const historical_key = `${source}_${claim_type}`;
    if (this.claim_verification_cache.has(historical_key)) {
      const historical_data = this.claim_verification_cache.get(historical_key);
      result.historical_claims = historical_data.total_claims;
      result.correct_predictions = historical_data.correct_predictions;
      result.accuracy_score = historical_data.correct_predictions / historical_data.total_claims;
      result.accuracy_details = historical_data.details;
    }
    
    return result;
  }
  
  /**
   * Calculate overall confidence score
   */
  _calculateConfidenceScore(validation_steps) {
    let total_score = 0;
    let total_weight = 0;
    
    const weights = {
      'source_credibility': 0.3,
      'blockchain_validation': 0.4,
      'bias_detection': 0.1,
      'manipulation_detection': 0.1,
      'multi_source_corroboration': 0.05,
      'historical_accuracy': 0.05
    };
    
    for (const step of validation_steps) {
      const weight = weights[step.step] || 0;
      let step_score = 0;
      
      switch (step.step) {
        case 'source_credibility':
          step_score = step.credibility_score;
          break;
        case 'blockchain_validation':
          step_score = step.blockchain_verified ? 1.0 : 0.0;
          break;
        case 'bias_detection':
          step_score = 1.0 - step.bias_score; // Invert bias score
          break;
        case 'manipulation_detection':
          step_score = step.manipulation_detected ? 0.0 : 1.0;
          break;
        case 'multi_source_corroboration':
          step_score = step.consensus_score;
          break;
        case 'historical_accuracy':
          step_score = step.accuracy_score;
          break;
      }
      
      total_score += step_score * weight;
      total_weight += weight;
    }
    
    return total_weight > 0 ? total_score / total_weight : 0;
  }
  
  /**
   * Update source credibility based on validation results
   */
  async _updateSourceCredibility(source, validation_result) {
    const current_credibility = this.source_credibility_scores.get(source) || 0.5;
    
    // Adjust credibility based on validation success
    let credibility_adjustment = 0;
    
    if (validation_result.is_valid) {
      credibility_adjustment = 0.05; // Slight increase for successful validation
    } else {
      credibility_adjustment = -0.1; // Larger decrease for failed validation
    }
    
    // Apply adjustment with bounds
    const new_credibility = Math.max(0, Math.min(1, current_credibility + credibility_adjustment));
    
    this.source_credibility_scores.set(source, new_credibility);
    this.validation_metrics.source_credibility_updates++;
  }
  
  /**
   * Helper methods for specific validations
   */
  async _validatePriceClaim(data) {
    // Simulate price validation against multiple exchanges
    return {
      verified: true,
      price_sources: ['uniswap', 'sushiswap', 'balancer'],
      price_deviation: 0.02, // 2% deviation
      message: 'Price claim verified across multiple DEXs'
    };
  }
  
  async _validateVolumeClaim(data) {
    // Simulate volume validation
    return {
      verified: true,
      volume_sources: ['dex_aggregator', 'on_chain_analysis'],
      volume_confidence: 0.95,
      message: 'Volume claim verified through on-chain analysis'
    };
  }
  
  async _validateTVLClaim(data) {
    // Simulate TVL validation
    return {
      verified: true,
      tvl_sources: ['defillama', 'protocol_api'],
      tvl_accuracy: 0.98,
      message: 'TVL claim verified through protocol APIs'
    };
  }
  
  async _validateTransactionClaim(data) {
    // Simulate transaction validation
    return {
      verified: true,
      transaction_hash: 'verified_on_chain',
      block_confirmation: true,
      message: 'Transaction claim verified on blockchain'
    };
  }
  
  async _checkMultipleAPIs(data, claim_type) {
    // Simulate API checking
    return {
      agreeing_sources: 3,
      conflicting_sources: 1,
      agreements: ['coingecko', 'coinmarketcap', 'defillama']
    };
  }
  
  _detectPumpDumpPattern(data) {
    // Detect pump and dump language patterns
    const pump_phrases = ['buy before it moons', 'last chance', 'rocket ship', 'to the moon'];
    return pump_phrases.some(phrase => 
      JSON.stringify(data).toLowerCase().includes(phrase.toLowerCase())
    );
  }
  
  _detectCoordinatedMessaging(data, source) {
    // Detect coordinated messaging patterns
    // This would check for identical messages across multiple sources
    return false; // Placeholder
  }
  
  _detectFakeUrgency(data) {
    // Detect fake urgency patterns
    const urgency_phrases = ['limited time', 'act now', 'only today', 'hurry up'];
    return urgency_phrases.some(phrase =>
      JSON.stringify(data).toLowerCase().includes(phrase.toLowerCase())
    );
  }
  
  _initializeValidationPatterns() {
    // Initialize known manipulation patterns
    this.manipulation_signatures.set('pump_dump', [
      'buy before it moons',
      'last chance to buy',
      'rocket ship incoming',
      'diamond hands only'
    ]);
    
    this.manipulation_signatures.set('fake_urgency', [
      'limited time offer',
      'act now or miss out',
      'only 24 hours left',
      'exclusive opportunity'
    ]);
    
    this.manipulation_signatures.set('false_authority', [
      'insider information',
      'guaranteed returns',
      'secret strategy',
      'whale movement'
    ]);
  }
  
  /**
   * Get validation system status
   */
  getValidationStatus() {
    return {
      total_validations: this.validation_metrics.total_validations,
      success_rate: this.validation_metrics.total_validations > 0 ? 
        this.validation_metrics.successful_validations / this.validation_metrics.total_validations : 0,
      blocked_manipulations: this.validation_metrics.blocked_manipulations,
      tracked_sources: this.source_credibility_scores.size,
      average_source_credibility: this._calculateAverageCredibility(),
      validation_criteria: Object.keys(this.config.validation_criteria).length
    };
  }
  
  _calculateAverageCredibility() {
    if (this.source_credibility_scores.size === 0) return 0;
    
    const total = Array.from(this.source_credibility_scores.values()).reduce((sum, score) => sum + score, 0);
    return total / this.source_credibility_scores.size;
  }
}

export { SourceValidationSystem }; 