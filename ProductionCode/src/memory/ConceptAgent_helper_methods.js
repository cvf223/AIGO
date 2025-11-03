// Helper methods for ConceptAgent class
// These need to be added inside the ConceptAgent class

calculateTermImportance(term, content) {
    // Calculate importance based on frequency and position
    const words = content.toLowerCase().split(/\s+/);
    const frequency = words.filter(w => w === term).length;
    const firstPosition = words.indexOf(term);
    
    // Earlier position = higher importance
    const positionScore = 1 - (firstPosition / words.length);
    const frequencyScore = Math.min(1, frequency / 10);
    
    return (positionScore * 0.6 + frequencyScore * 0.4);
}

async extractContextualConcepts(context) {
    // Extract concepts from context object
    const concepts = [];
    
    if (context.domain) {
        concepts.push({
            term: context.domain,
            type: 'domain',
            confidence: 0.9,
            source: 'context'
        });
    }
    
    if (context.constraints) {
        context.constraints.forEach((constraint, idx) => {
            concepts.push({
                term: `constraint_${idx}`,
                value: constraint,
                type: 'constraint',
                confidence: 0.85,
                source: 'context'
            });
        });
    }
    
    return concepts;
}

deduplicateAndScoreConcepts(concepts) {
    // Deduplicate and combine scores
    const conceptMap = new Map();
    
    concepts.forEach(concept => {
        const key = concept.term.toLowerCase();
        if (conceptMap.has(key)) {
            const existing = conceptMap.get(key);
            existing.confidence = Math.max(existing.confidence, concept.confidence);
            existing.sources = [...new Set([...existing.sources || [existing.source], concept.source])];
        } else {
            conceptMap.set(key, { ...concept, sources: [concept.source] });
        }
    });
    
    return Array.from(conceptMap.values()).sort((a, b) => b.confidence - a.confidence);
}

calculateSiblingStrength(node1, node2) {
    // Calculate strength of sibling relationship
    let strength = 0.5; // Base sibling strength
    
    // Similar confidence levels
    const confDiff = Math.abs(node1.confidence - node2.confidence);
    strength += (1 - confDiff) * 0.2;
    
    // Similar types
    if (node1.concept?.type === node2.concept?.type) {
        strength += 0.2;
    }
    
    // Similar depth
    if (node1.depth === node2.depth) {
        strength += 0.1;
    }
    
    return Math.min(1.0, strength);
}

async extractSemanticRelationships(content) {
    // Extract relationships from content using patterns
    const relationships = [];
    const patterns = [
        { regex: /(\w+)\s+leads?\s+to\s+(\w+)/gi, type: 'causes' },
        { regex: /(\w+)\s+depends?\s+on\s+(\w+)/gi, type: 'depends_on' },
        { regex: /(\w+)\s+enables?\s+(\w+)/gi, type: 'enables' },
        { regex: /(\w+)\s+prevents?\s+(\w+)/gi, type: 'prevents' }
    ];
    
    patterns.forEach(({ regex, type }) => {
        let match;
        while ((match = regex.exec(content)) !== null) {
            relationships.push({
                type: type,
                source: match[1],
                target: match[2],
                strength: 0.7,
                bidirectional: false,
                evidence: match[0]
            });
        }
    });
    
    return relationships;
}

extractCausalRelationships(reasoning) {
    // Extract causal relationships from reasoning text
    const causalPatterns = [
        { regex: /because\s+(.+?)\s*[,\.]/gi, type: 'caused_by' },
        { regex: /therefore\s+(.+?)\s*[,\.]/gi, type: 'results_in' },
        { regex: /if\s+(.+?)\s+then\s+(.+?)\s*[,\.]/gi, type: 'conditional' }
    ];
    
    const relationships = [];
    causalPatterns.forEach(({ regex, type }) => {
        let match;
        while ((match = regex.exec(reasoning)) !== null) {
            relationships.push({
                type: type,
                source: 'current_node',
                target: match[1],
                strength: 0.8,
                bidirectional: false,
                evidence: match[0]
            });
        }
    });
    
    return relationships;
}

async parseGoalComponents(goal) {
    // Parse goal into structured components
    const components = {
        action: null,
        target: null,
        domain: null,
        constraints: []
    };
    
    // Extract action verb
    const actionMatch = goal.match(/^(\w+)/i);
    if (actionMatch) {
        components.action = actionMatch[1].toLowerCase();
    }
    
    // Extract domain
    const domainPatterns = [
        /(?:in|for|regarding)\s+(\w+)/i,
        /(\w+)\s+(?:protocol|market|system)/i
    ];
    
    for (const pattern of domainPatterns) {
        const match = goal.match(pattern);
        if (match) {
            components.domain = match[1].toLowerCase();
            break;
        }
    }
    
    // Extract constraints
    const constraintMatch = goal.match(/with\s+(.+?)(?:\.|$)/i);
    if (constraintMatch) {
        components.constraints = constraintMatch[1].split(/\s*,\s*/);
    }
    
    return components;
}

generateComparisonDirections(understanding, goalComponents) {
    // Generate directions for comparison tasks
    return [
        {
            type: 'comparative_analysis',
            name: 'Feature-by-feature comparison',
            reasoning: 'Compare entities across multiple dimensions',
            evidence: [],
            assumptions: ['Features are comparable']
        },
        {
            type: 'differential_analysis',
            name: 'Differential analysis',
            reasoning: 'Focus on key differences rather than similarities',
            evidence: [],
            assumptions: ['Differences are more informative']
        }
    ];
}

generateAnalysisDirections(understanding, goalComponents) {
    // Generate directions for analysis tasks
    return [
        {
            type: 'decomposition',
            name: 'Hierarchical decomposition',
            reasoning: 'Break down into components for detailed analysis',
            evidence: [],
            assumptions: ['System is decomposable']
        },
        {
            type: 'pattern_analysis',
            name: 'Pattern identification',
            reasoning: 'Identify recurring patterns and trends',
            evidence: [],
            assumptions: ['Patterns exist in the data']
        }
    ];
}

generateOptimizationDirections(understanding, goalComponents) {
    // Generate directions for optimization tasks
    return [
        {
            type: 'constraint_optimization',
            name: 'Constraint-based optimization',
            reasoning: 'Optimize within given constraints',
            evidence: [],
            assumptions: ['Constraints are well-defined']
        },
        {
            type: 'multi_objective',
            name: 'Multi-objective optimization',
            reasoning: 'Balance multiple competing objectives',
            evidence: [],
            assumptions: ['Trade-offs are acceptable']
        }
    ];
}

async generateDomainSpecificDirections(understanding, domain, goal) {
    // Generate domain-specific directions
    const directions = [];
    
    if (domain === 'arbitrage' || domain === 'defi') {
        directions.push({
            type: 'profit_maximization',
            name: 'Profit maximization strategy',
            reasoning: 'Focus on maximizing profit while managing risk',
            domain: 'defi',
            evidence: [],
            assumptions: ['Market inefficiencies exist']
        });
    }
    
    if (domain === 'security' || domain === 'risk') {
        directions.push({
            type: 'risk_mitigation',
            name: 'Risk mitigation approach',
            reasoning: 'Prioritize security and risk management',
            domain: 'security',
            evidence: [],
            assumptions: ['Risks can be identified and mitigated']
        });
    }
    
    return directions;
}

calculateSemanticSimilarity(text1, text2) {
    // Calculate semantic similarity between texts
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
}

async findRelevantEntanglements(understanding) {
    // Find relevant quantum entanglements
    if (!this.knowledgeGraph) return [];
    
    try {
        const entanglements = await this.knowledgeGraph.query(`
            SELECT e.*, n1.properties as props1, n2.properties as props2
            FROM kg_entanglements e
            JOIN kg_nodes n1 ON e.node_a_id = n1.node_id
            JOIN kg_nodes n2 ON e.node_b_id = n2.node_id
            WHERE e.entanglement_strength > 0.7
            ORDER BY e.entanglement_strength DESC
            LIMIT 10
        `);
        
        return entanglements.rows.map(row => ({
            domain_a: row.props1?.domain || 'unknown',
            domain_b: row.props2?.domain || 'unknown',
            insight: row.insight || 'Cross-domain connection',
            strength: row.entanglement_strength
        }));
    } catch (error) {
        console.error('Failed to find entanglements:', error);
        return [];
    }
}

async findAnalogies(understanding, goal) {
    // Find analogies from different domains
    const analogies = [];
    
    // Domain mapping for analogies
    const domainMappings = {
        'arbitrage': ['optimization', 'resource_allocation'],
        'protocol': ['system', 'architecture'],
        'liquidity': ['flow', 'resources'],
        'yield': ['returns', 'growth']
    };
    
    const goalDomain = this.identifyDomain(goal);
    const analogousDomains = domainMappings[goalDomain] || [];
    
    analogousDomains.forEach(targetDomain => {
        analogies.push({
            sourceDomain: goalDomain,
            targetDomain: targetDomain,
            mapping: `${goalDomain} optimization is like ${targetDomain} optimization`,
            noveltyScore: 0.7,
            implications: [`Apply ${targetDomain} strategies to ${goalDomain}`]
        });
    });
    
    return analogies;
}

generateInversions(understanding, goal) {
    // Generate inverted approaches
    return [
        {
            type: 'inversion',
            name: 'Inverse approach',
            reasoning: 'Consider what NOT to do and avoid those paths',
            novelty: 0.6,
            evidence: [],
            assumptions: ['Negative space is informative']
        }
    ];
}

async generateConceptCombinations(understanding) {
    // Generate novel concept combinations
    const combinations = [];
    
    if (understanding.concepts && understanding.concepts.length >= 2) {
        for (let i = 0; i < understanding.concepts.length - 1; i++) {
            for (let j = i + 1; j < understanding.concepts.length; j++) {
                const concept1 = understanding.concepts[i];
                const concept2 = understanding.concepts[j];
                
                combinations.push({
                    concept1: concept1.term,
                    concept2: concept2.term,
                    synergyReasoning: `Combining ${concept1.term} with ${concept2.term} may reveal new insights`,
                    unexpectedness: 1 - this.calculateConceptSimilarity(concept1, concept2),
                    opportunities: ['Novel solution space', 'Unexplored synergies']
                });
            }
        }
    }
    
    return combinations.slice(0, 3); // Limit to top 3 combinations
}

generateLateralApproaches(understanding, goal) {
    // Generate lateral thinking approaches
    return [
        {
            type: 'lateral',
            name: 'Indirect approach',
            reasoning: 'Approach the problem from an unexpected angle',
            novelty: 0.8,
            evidence: [],
            assumptions: ['Indirect paths may be more effective']
        }
    ];
}

identifyEmergentProperties(understanding) {
    // Identify emergent properties from relationships
    const emergent = [];
    
    if (understanding.relationships && understanding.relationships.length > 3) {
        emergent.push({
            type: 'emergent',
            name: 'System-level emergence',
            reasoning: 'Complex interactions may produce emergent behaviors',
            novelty: 0.85,
            evidence: understanding.relationships,
            assumptions: ['Whole is greater than sum of parts'],
            implications: ['New properties at system level']
        });
    }
    
    return emergent;
}

parseConstraints(constraints) {
    // Parse constraints into structured format
    return constraints.map((constraint, idx) => {
        const parsed = {
            id: idx,
            original: constraint,
            type: 'unknown',
            name: `constraint_${idx}`
        };
        
        // Identify constraint type
        if (constraint.includes('<') || constraint.includes('>')) {
            parsed.type = 'inequality';
        } else if (constraint.includes('=')) {
            parsed.type = 'equality';
        } else if (constraint.includes('must') || constraint.includes('should')) {
            parsed.type = 'requirement';
        }
        
        return parsed;
    });
}

generateConstraintCombinations(constraints) {
    // Generate combinations of constraints to check
    const combinations = [];
    
    // Single constraints
    constraints.forEach(c => combinations.push([c]));
    
    // Pairs of constraints
    for (let i = 0; i < constraints.length - 1; i++) {
        for (let j = i + 1; j < constraints.length; j++) {
            combinations.push([constraints[i], constraints[j]]);
        }
    }
    
    // All constraints together
    if (constraints.length > 2) {
        combinations.push(constraints);
    }
    
    return combinations;
}

async checkConstraintSatisfiability(constraintSet, understanding) {
    // Check if constraints can be satisfied
    const satisfiability = {
        isSatisfiable: true,
        solutionApproach: '',
        solutionSpace: 'bounded',
        feasibilityScore: 0.7,
        evidence: [],
        assumptions: [],
        risks: []
    };
    
    // Analyze each constraint
    constraintSet.forEach(constraint => {
        if (constraint.type === 'inequality') {
            satisfiability.solutionApproach += `Optimize within ${constraint.original}. `;
        } else if (constraint.type === 'requirement') {
            satisfiability.assumptions.push(`${constraint.original} is achievable`);
        }
    });
    
    // Check for conflicts
    if (this.hasConflictingConstraints(constraintSet)) {
        satisfiability.isSatisfiable = false;
        satisfiability.risks.push('Conflicting constraints detected');
    }
    
    return satisfiability;
}

hasConflictingConstraints(constraintSet) {
    // Simple conflict detection
    const values = new Map();
    
    for (const constraint of constraintSet) {
        if (constraint.type === 'equality') {
            const [var_, val] = constraint.original.split('=').map(s => s.trim());
            if (values.has(var_) && values.get(var_) !== val) {
                return true; // Conflict detected
            }
            values.set(var_, val);
        }
    }
    
    return false;
}

async generateRelaxedConstraintDirections(understanding, constraints) {
    // Generate directions with relaxed constraints
    return constraints.map(constraint => ({
        type: 'relaxed_constraint',
        name: `Relax: ${constraint.original}`,
        reasoning: `Consider relaxing ${constraint.original} to find feasible solutions`,
        evidence: [],
        assumptions: ['Some flexibility in constraints is acceptable'],
        risks: ['May not fully satisfy original requirements']
    }));
}

extractActionVerbs(text) {
    // Extract action verbs from text
    const verbPatterns = [
        /\b(analyze|compare|optimize|evaluate|assess|identify|find|create|develop)\b/gi
    ];
    
    const verbs = new Set();
    verbPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            verbs.add(match[1].toLowerCase());
        }
    });
    
    return Array.from(verbs);
}

calculateSetOverlap(set1, set2) {
    // Calculate overlap between two sets
    const arr1 = Array.from(set1);
    const arr2 = Array.from(set2);
    
    const intersection = arr1.filter(x => arr2.includes(x));
    const union = [...new Set([...arr1, ...arr2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
}

identifyDomain(text) {
    // Identify domain from text
    const domainKeywords = {
        'defi': ['arbitrage', 'protocol', 'liquidity', 'yield', 'swap'],
        'security': ['risk', 'vulnerability', 'attack', 'protect'],
        'optimization': ['maximize', 'minimize', 'optimal', 'efficient'],
        'analysis': ['analyze', 'evaluate', 'assess', 'compare']
    };
    
    const lowercaseText = text.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        if (keywords.some(keyword => lowercaseText.includes(keyword))) {
            return domain;
        }
    }
    
    return 'general';
}

areDomainsRelated(domain1, domain2) {
    // Check if domains are related
    const relatedDomains = {
        'defi': ['optimization', 'security', 'finance'],
        'security': ['risk', 'protection', 'defi'],
        'optimization': ['defi', 'efficiency', 'performance'],
        'analysis': ['research', 'evaluation', 'assessment']
    };
    
    return relatedDomains[domain1]?.includes(domain2) || 
           relatedDomains[domain2]?.includes(domain1);
}

calculateConceptSimilarity(concept1, concept2) {
    // Calculate similarity between concepts
    if (concept1.type === concept2.type) {
        return 0.5; // Same type = some similarity
    }
    
    if (concept1.source === concept2.source) {
        return 0.3; // Same source = some similarity
    }
    
    return 0.1; // Default low similarity
}

assessResourceAvailability(direction, resources) {
    // Assess if resources are available for direction
    let score = 0.5; // Base score
    
    if (resources.computational && direction.type === 'complex_analysis') {
        score += 0.3;
    }
    
    if (resources.time && direction.estimatedTime) {
        if (direction.estimatedTime <= resources.time) {
            score += 0.2;
        }
    }
    
    return score;
}

calculateTaskAlignment(concept, task) {
    // Calculate how well concept aligns with task
    const conceptDomain = this.identifyDomain(concept.content || '');
    const taskDomain = this.identifyDomain(task);
    
    if (conceptDomain === taskDomain) {
        return 0.8;
    } else if (this.areDomainsRelated(conceptDomain, taskDomain)) {
        return 0.5;
    }
    
    return 0.2;
}

assessTemporalRelevance(concept, timeframe) {
    // Assess temporal relevance
    if (timeframe === 'immediate' && concept.type === 'quick_action') {
        return 0.9;
    } else if (timeframe === 'long-term' && concept.type === 'strategic') {
        return 0.8;
    }
    
    return 0.5; // Default moderate relevance
}

assessResourceAlignment(concept, resources) {
    // Assess how well concept aligns with available resources
    let alignment = 0.5;
    
    if (concept.properties?.requirements) {
        const requirements = concept.properties.requirements;
        
        if (requirements.computational <= resources.computational) {
            alignment += 0.25;
        }
        
        if (requirements.memory <= resources.memory) {
            alignment += 0.25;
        }
    }
    
    return alignment;
}

async checkPriorContextSuccess(concept, context) {
    // Check prior success in similar contexts
    if (!this.knowledgeGraph) return 0.5;
    
    try {
        const result = await this.knowledgeGraph.query(`
            SELECT AVG(success_rate) as avg_success
            FROM concept_context_history
            WHERE concept_type = $1
            AND context_type = $2
            AND success_rate > 0
        `, [concept.type || 'unknown', context.type || 'general']);
        
        return result.rows[0]?.avg_success || 0.5;
    } catch (error) {
        return 0.5; // Default if query fails
    }
}

assessConstraintCompatibility(concept, constraints) {
    // Assess if concept is compatible with constraints
    let compatibility = 1.0;
    
    constraints.forEach(constraint => {
        if (constraint.includes('no') && concept.content?.includes(constraint.split('no')[1])) {
            compatibility -= 0.2; // Violates negative constraint
        }
    });
    
    return Math.max(0, compatibility);
}

getNthPrime(n) {
    // Get nth prime number for deterministic sequences
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
    if (n <= primes.length) {
        return primes[n - 1];
    }
    
    // Generate more primes if needed
    let candidate = primes[primes.length - 1] + 2;
    while (primes.length < n) {
        if (this.isPrime(candidate)) {
            primes.push(candidate);
        }
        candidate += 2;
    }
    
    return primes[n - 1];
}

isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    const sqrt = Math.sqrt(num);
    for (let i = 3; i <= sqrt; i += 2) {
        if (num % i === 0) return false;
    }
    
    return true;
}

calculateGoalAlignment(concept, goal) {
    // Calculate how well concept aligns with goal
    const conceptDomain = this.identifyDomain(concept.content || '');
    const goalDomain = this.identifyDomain(goal);
    
    let alignment = 0.5; // Base alignment
    
    if (conceptDomain === goalDomain) {
        alignment += 0.3;
    }
    
    // Check if concept addresses goal action
    const goalAction = goal.match(/^(\w+)/i)?.[1]?.toLowerCase();
    if (goalAction && concept.type === goalAction) {
        alignment += 0.2;
    }
    
    return Math.min(1.0, alignment);
}

calculateNovelty(concept, existingConcepts) {
    // Calculate novelty of concept
    let novelty = 1.0;
    
    existingConcepts.forEach(existing => {
        const similarity = this.calculateConceptSimilarity(concept, existing);
        novelty = Math.min(novelty, 1 - similarity);
    });
    
    return Math.max(0, novelty);
}

calculateFeasibility(concept, resources) {
    // Calculate feasibility of concept
    let feasibility = 0.5;
    
    // Check resource requirements
    if (concept.properties?.requirements) {
        const reqs = concept.properties.requirements;
        if (reqs.computational <= resources.computational) {
            feasibility += 0.25;
        }
        if (reqs.time <= resources.time) {
            feasibility += 0.25;
        }
    }
    
    return Math.min(1.0, feasibility);
}
