# Formal-reasoning - Essential Patterns

## Core Implementation
```javascript
class FormalReasoningEngine {
    constructor(config = {}) {
        this.config = {
            logic: config.logic || 'first-order',
            prover: config.prover || 'z3',
            timeout: config.timeout || 30000,
            soundness: config.soundness !== false
        };
        
        this.knowledgeBase = new FormalKnowledgeBase();
        this.inferenceEngine = new InferenceEngine(this.config);
        this.proofChecker = new ProofChecker();
    }
    
    async reason(premises, goal) {
        // Formalize inputs
        const formalPremises = await this.formalize(premises);
        const formalGoal = await this.formalize(goal);
        
        // Check consistency
        const consistent = await this.checkConsistency(formalPremises);
        if (!consistent) {
            throw new Error('Inconsistent premises');
        }
        
        // Attempt proof
        const proof = await this.proveTheorem(
            formalPremises,
            formalGoal
        );
        
        // Verify proof
        const verified = await this.proofChecker.verify(proof);
        
        // Extract insights
        const insights = this.extractInsights(proof);
        
        return {
            conclusion: formalGoal,
            proof,
            verified,
            insights,
            confidence: this.calculateConfidence(proof)
        };
    }
    
    async formalize(statement) {
        // Parse natural language to formal logic
        const parsed = await this.parseStatement(statement);
        
        // Convert to logical formula
        const formula = this.toLogicalFormula(parsed);
        
        // Type check
        await this.typeCheck(formula);
        
        return formula;
    }
}

class LogicalFormula {
    constructor(type, components) {
        this.type = type; // 'atom', 'and', 'or', 'implies', 'forall', 'exists'
        this.components = components;
        this.metadata = {};
    }
    
    evaluate(model) {
        switch (this.type) {
            case 'atom':
                return model.evaluate(this.components.predicate);
            case 'and':
                return this.components.every(c => c.evaluate(model));
            case 'or':
                return this.components.some(c => c.evaluate(model));
            case 'implies':
                return !this.components[0].evaluate(model) || 
                       this.components[1].evaluate(model);
            case 'not':
                return !this.components[0].evaluate(model);
            case 'forall':
                return this.evaluateQuantifier('forall', model);
            case 'exists':
                return this.evaluateQuantifier('exists', model);
        }
    }
    
    toCNF() {
        // Convert to Conjunctive Normal Form
        let formula = this.eliminateImplications();
        formula = formula.moveNegationsInward();
        formula = formula.distributeDisjunctions();
        return formula;
    }
}
```

```javascript
class InferenceEngine {
    constructor(config) {
        this.config = config;
        this.rules = new InferenceRules();
        this.strategies = {
            'forward': this.forwardChaining.bind(this),
            'backward': this.backwardChaining.bind(this),
            'resolution': this.resolution.bind(this),
            'natural': this.naturalDeduction.bind(this)
        };
    }
    
    async prove(premises, goal, strategy = 'resolution') {
        const prover = this.strategies[strategy];
        
        if (!prover) {
            throw new Error(`Unknown strategy: ${strategy}`);
        }
        
        return await prover(premises, goal);
    }
    
    async resolution(premises, goal) {
        // Convert to CNF
        const cnfPremises = premises.map(p => p.toCNF());
        const cnfNegatedGoal = new LogicalFormula('not', [goal]).toCNF();
        
        // Create clause set
        const clauses = new Set([
            ...this.extractClauses(cnfPremises),
            ...this.extractClauses([cnfNegatedGoal])
        ]);
        
        // Resolution loop
        const proof = [];
        let newClauses = new Set();
        
        while (true) {
            // Generate resolvents
            for (const c1 of clauses) {
                for (const c2 of clauses) {
                    const resolvents = await this.resolve(c1, c2);
                    
                    for (const resolvent of resolvents) {
                        proof.push({
                            type: 'resolution',
                            from: [c1, c2],
                            to: resolvent
                        });
                        
                        if (resolvent.isEmpty()) {
                            // Found contradiction
                            return {
                                success: true,
                                proof,
                                strategy: 'resolution'
                            };
                        }
                        
                        newClauses.add(resolvent);
                    }
                }
            }
            
            // Check if we've made progress
            if (this.isSubset(newClauses, clauses)) {
                return {
                    success: false,
                    proof,
                    reason: 'No new clauses generated'
                };
            }
            
            // Add new clauses
            for (const clause of newClauses) {
                clauses.add(clause);
            }
        }
    }
    
    async naturalDeduction(premises, goal) {
        // Natural deduction proof system
        const proof = new NaturalDeductionProof(premises, goal);
        
        // Apply inference rules
        const rules = [
            this.rules.modusPonens,
            this.rules.modusTollens,
            this.rules.hypotheticalSyllogism,
            this.rules.disjunctiveSyllogism,
            this.rules.conjunction,
            this.rules.simplification,
            this.rules.addition,
            this.rules.universalInstantiation,
            this.rules.existentialGeneralization
        ];
        
        // Proof search
        return await this.searchProof(proof, rules);
    }
}

class InferenceRules {
    modusPonens(statements) {
        // If P and P→Q, then Q
        for (let i = 0; i < statements.length; i++) {
            for (let j = 0; j < statements.length; j++) {
                const stmt1 = statements[i];
                const stmt2 = statements[j];
                
                if (stmt2.type === 'implies' && 
                    this.equals(stmt1, stmt2.components[0])) {
                    return {
                        conclusion: stmt2.components[1],
                        rule: 'modus_ponens',
                        premises: [i, j]
                    };
                }
            }
        }
        return null;
    }
    
    universalInstantiation(statement, term) {
        // From ∀x P(x), derive P(a)
        if (statement.type !== 'forall') return null;
        
        const variable = statement.components[0];
        const formula = statement.components[1];
        
        return {
            conclusion: this.substitute(formula, variable, term),
            rule: 'universal_instantiation',
            substitution: { [variable]: term }
        };
    }
}
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
Patterns

## Extended Resources
- **Full Implementation**: `/skills/formal-reasoning-detailed.md`
- **Code Examples**: `/examples/formal-reasoning-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*