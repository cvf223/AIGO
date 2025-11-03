/**
 * 🎯 RESEARCH PROMPT TEMPLATES - ELITE RESEARCH GUIDANCE
 * ===================================================
 * 
 * High-quality prompt templates that guide the LLM to produce
 * comprehensive, trustworthy, and actionable research outputs.
 * Based on the examples of MEV authorities and DeFi education channels.
 */

export class ResearchPromptTemplates {
    constructor() {
        this.templates = {
            curated_list: this.getCuratedListTemplate(),
            credibility_analysis: this.getCredibilityAnalysisTemplate(),
            trust_framework: this.getTrustFrameworkTemplate(),
            trend_analysis: this.getTrendAnalysisTemplate(),
            competitive_intelligence: this.getCompetitiveIntelligenceTemplate(),
            strategy_extraction: this.getStrategyExtractionTemplate(),
            risk_assessment: this.getRiskAssessmentTemplate()
        };
    }

    /**
     * 🎯 GET TEMPLATE BY TYPE
     */
    getTemplate(type) {
        return this.templates[type] || this.getDefaultTemplate();
    }

    /**
     * 📋 CURATED LIST TEMPLATE - Like MEV Authorities or DeFi Channels
     */
    getCuratedListTemplate() {
        return `You are an elite research analyst specializing in curating high-quality information sources in the cryptocurrency and DeFi ecosystem. Your task is to create a comprehensive, tier-based list of the most credible and valuable sources.

ANALYSIS FRAMEWORK:

1. CREDIBILITY ASSESSMENT
   - Verifiable expertise and track record
   - Transparency of business model and incentives
   - History of accurate predictions/analysis
   - Conflicts of interest or red flags

2. VALUE PROPOSITION
   - Unique insights or information provided
   - Educational value vs speculation
   - Data-driven vs narrative-driven content
   - Actionable intelligence provided

3. TRUST TIER CLASSIFICATION
   Tier 1 (Highest Trust): Foundational education, pure data analysis, transparent models
   Tier 2 (High Trust): Specialized expertise, generally reliable, some limitations
   Tier 3 (Critical Consumption): Popular but requires skepticism, potential conflicts

4. RED FLAG IDENTIFICATION
   - Undisclosed promotions or pump-and-dump behavior
   - Vague/unfalsifiable predictions
   - Excessive hype language and clickbait
   - Opaque business models
   - Lack of verifiable expertise

FORMAT YOUR RESPONSE AS:
{
  "sources": [
    {
      "name": "Source Name",
      "handle": "@handle or channel name",
      "tier": 1-3,
      "specialization": "Primary focus area",
      "credibility_score": 0-100,
      "value_proposition": "What makes them valuable",
      "red_flags": ["Any concerns"],
      "business_model": "How they make money",
      "key_insights": ["Notable contributions"],
      "follow_recommendation": "Essential/Recommended/Caution"
    }
  ],
  "tier_summary": {
    "tier_1_count": number,
    "tier_2_count": number,
    "tier_3_count": number
  },
  "key_findings": ["Major insights from analysis"],
  "monitoring_strategy": "How to best utilize these sources"
}`;
    }

    /**
     * 🔍 CREDIBILITY ANALYSIS TEMPLATE
     */
    getCredibilityAnalysisTemplate() {
        return `You are conducting a deep credibility analysis of information sources in the crypto/DeFi space. Analyze with the rigor of an investigative journalist.

CREDIBILITY EVALUATION CRITERIA:

1. EXPERTISE VERIFICATION
   - Professional background and credentials
   - Demonstrable technical knowledge
   - Track record in the space
   - Peer recognition and respect

2. TRANSPARENCY ASSESSMENT
   - Disclosure of financial interests
   - Clear business model
   - Conflicts of interest acknowledgment
   - Sponsorship transparency

3. ACCURACY TRACKING
   - Historical prediction accuracy
   - Fact-checking record
   - Correction/retraction history
   - Community feedback and criticism

4. BEHAVIORAL PATTERNS
   - Consistency of messaging
   - Response to criticism
   - Engagement with community
   - Evolution of positions over time

PROVIDE ANALYSIS AS:
{
  "credibility_assessment": {
    "overall_score": 0-100,
    "expertise_level": "Expert/Knowledgeable/Amateur",
    "transparency_rating": "Full/Partial/Opaque",
    "accuracy_track_record": "Excellent/Good/Mixed/Poor",
    "trust_indicators": ["Positive signals"],
    "warning_signs": ["Negative signals"],
    "recommended_usage": "How to consume their content safely"
  },
  "detailed_findings": {
    "strengths": ["Key strengths"],
    "weaknesses": ["Key weaknesses"],
    "controversies": ["Any past issues"],
    "evolution": "How they've changed over time"
  },
  "comparative_analysis": "How they compare to peers",
  "final_verdict": "Summary recommendation"
}`;
    }

    /**
     * 🏛️ TRUST FRAMEWORK TEMPLATE
     */
    getTrustFrameworkTemplate() {
        return `Develop a comprehensive trust framework for evaluating information sources in the specified domain. Create a nuanced system that helps users navigate complex information landscapes.

TRUST FRAMEWORK COMPONENTS:

1. MULTI-DIMENSIONAL SCORING
   - Technical expertise (0-100)
   - Ethical alignment (0-100)
   - Historical reliability (0-100)
   - Community trust (0-100)
   - Transparency index (0-100)

2. CONTEXTUAL TRUST LEVELS
   - Educational content trust
   - Market analysis trust
   - Project evaluation trust
   - Technical explanation trust
   - Risk assessment trust

3. DYNAMIC TRUST FACTORS
   - Time-based trust decay
   - Event-based trust adjustments
   - Peer validation mechanisms
   - Self-correction bonus

4. USE CASE RECOMMENDATIONS
   - When to trust fully
   - When to verify independently
   - When to avoid entirely
   - How to cross-reference

STRUCTURE AS:
{
  "framework": {
    "scoring_methodology": {},
    "trust_tiers": [],
    "evaluation_criteria": [],
    "usage_guidelines": []
  },
  "application_examples": [],
  "maintenance_protocol": "How to keep framework current"
}`;
    }

    /**
     * 📈 TREND ANALYSIS TEMPLATE
     */
    getTrendAnalysisTemplate() {
        return `Conduct a comprehensive trend analysis in the specified domain, identifying emerging patterns, shifts in narrative, and predictive indicators.

TREND ANALYSIS FRAMEWORK:

1. PATTERN IDENTIFICATION
   - Emerging topics and technologies
   - Shifting sentiment patterns
   - Volume and velocity changes
   - Cross-platform trend correlation

2. INFLUENCER MAPPING
   - Who's driving narratives
   - Network effects and amplification
   - Contrarian voices gaining traction
   - Silent influencers (non-public)

3. PREDICTIVE INDICATORS
   - Early warning signals
   - Momentum indicators
   - Divergence patterns
   - Cycle identification

4. STRATEGIC IMPLICATIONS
   - Opportunities emerging
   - Risks developing
   - Timing considerations
   - Action recommendations

FORMAT AS:
{
  "current_trends": [
    {
      "trend": "Description",
      "strength": "Strong/Moderate/Emerging",
      "trajectory": "Accelerating/Stable/Declining",
      "key_drivers": ["Who/what is driving"],
      "implications": ["Strategic implications"]
    }
  ],
  "emerging_patterns": [],
  "predictive_signals": [],
  "strategic_recommendations": []
}`;
    }

    /**
     * 🕵️ COMPETITIVE INTELLIGENCE TEMPLATE
     */
    getCompetitiveIntelligenceTemplate() {
        return `Perform deep competitive intelligence analysis in the specified domain. Focus on actionable insights that provide strategic advantage.

INTELLIGENCE GATHERING FRAMEWORK:

1. COMPETITOR IDENTIFICATION
   - Direct competitors
   - Indirect competitors
   - Emerging threats
   - Potential collaborators

2. STRATEGY ANALYSIS
   - Core strategies employed
   - Resource allocation patterns
   - Technology stack and tools
   - Partnership networks

3. PERFORMANCE METRICS
   - Success rates and ROI
   - Market share evolution
   - Innovation velocity
   - Weaknesses and vulnerabilities

4. PREDICTIVE MODELING
   - Likely next moves
   - Response patterns
   - Adaptation strategies
   - Defensive measures

DELIVER INTELLIGENCE AS:
{
  "competitor_landscape": {
    "top_performers": [],
    "rising_stars": [],
    "declining_players": [],
    "wildcards": []
  },
  "strategy_patterns": {
    "successful_strategies": [],
    "failed_approaches": [],
    "innovative_tactics": [],
    "defensive_positions": []
  },
  "opportunity_matrix": {
    "immediate_opportunities": [],
    "medium_term_plays": [],
    "strategic_positioning": []
  },
  "risk_assessment": [],
  "action_plan": []
}`;
    }

    /**
     * 🎮 STRATEGY EXTRACTION TEMPLATE
     */
    getStrategyExtractionTemplate() {
        return `Extract and analyze strategies from the specified sources, focusing on actionable patterns that can be learned and potentially implemented.

STRATEGY EXTRACTION METHODOLOGY:

1. PATTERN RECOGNITION
   - Recurring successful tactics
   - Timing patterns
   - Resource optimization methods
   - Risk management approaches

2. STRATEGIC DECOMPOSITION
   - Core strategy elements
   - Implementation requirements
   - Success factors
   - Failure points

3. ADAPTABILITY ANALYSIS
   - Transferable elements
   - Context dependencies
   - Scaling considerations
   - Customization needs

4. IMPLEMENTATION ROADMAP
   - Prerequisites
   - Step-by-step approach
   - Resource requirements
   - Success metrics

STRUCTURE FINDINGS AS:
{
  "extracted_strategies": [
    {
      "strategy_name": "Descriptive name",
      "source": "Where observed",
      "success_rate": "Estimated effectiveness",
      "core_mechanics": ["Key components"],
      "requirements": {
        "technical": [],
        "resources": [],
        "skills": []
      },
      "implementation_guide": {},
      "risks": [],
      "optimization_tips": []
    }
  ],
  "meta_patterns": ["Higher-level insights"],
  "innovation_opportunities": ["Potential improvements"],
  "quick_wins": ["Immediately actionable strategies"]
}`;
    }

    /**
     * ⚠️ RISK ASSESSMENT TEMPLATE
     */
    getRiskAssessmentTemplate() {
        return `Conduct a comprehensive risk assessment for the specified domain, identifying threats, vulnerabilities, and mitigation strategies.

RISK ASSESSMENT FRAMEWORK:

1. THREAT IDENTIFICATION
   - Technical risks
   - Market risks
   - Regulatory risks
   - Operational risks
   - Reputational risks

2. VULNERABILITY ANALYSIS
   - System weaknesses
   - Process gaps
   - Knowledge deficits
   - Resource constraints

3. IMPACT EVALUATION
   - Probability assessment
   - Severity scoring
   - Cascade effects
   - Recovery difficulty

4. MITIGATION STRATEGIES
   - Preventive measures
   - Detective controls
   - Response protocols
   - Recovery plans

PRESENT ASSESSMENT AS:
{
  "risk_matrix": [
    {
      "risk_type": "Category",
      "description": "Detailed description",
      "probability": "High/Medium/Low",
      "impact": "Critical/Major/Minor",
      "current_controls": [],
      "gaps": [],
      "mitigation_recommendations": []
    }
  ],
  "priority_risks": ["Top risks requiring immediate attention"],
  "systemic_vulnerabilities": ["Cross-cutting issues"],
  "mitigation_roadmap": {
    "immediate_actions": [],
    "short_term_improvements": [],
    "long_term_strategic_changes": []
  },
  "monitoring_framework": "How to track risk evolution"
}`;
    }

    /**
     * 🌐 DEFAULT TEMPLATE
     */
    getDefaultTemplate() {
        return `You are an elite research analyst in the cryptocurrency and DeFi ecosystem. Conduct comprehensive research on the requested topic, providing actionable insights and maintaining the highest standards of accuracy and objectivity.

GENERAL RESEARCH GUIDELINES:
1. Prioritize verifiable facts over speculation
2. Identify and disclose potential biases
3. Provide confidence levels for assertions
4. Include actionable recommendations
5. Structure findings clearly

Provide your research in a well-structured JSON format appropriate to the research type.`;
    }

    /**
     * 🔧 TEMPLATE CUSTOMIZATION
     */
    customizeTemplate(baseTemplate, customizations) {
        return `${baseTemplate}

ADDITIONAL REQUIREMENTS:
${customizations.requirements || ''}

SPECIFIC FOCUS AREAS:
${customizations.focusAreas || ''}

EXCLUDE:
${customizations.exclusions || ''}

SPECIAL INSTRUCTIONS:
${customizations.specialInstructions || ''}`;
    }
}