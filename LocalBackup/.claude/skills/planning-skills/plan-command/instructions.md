# /plan Command Instructions

## Overview
The `/plan` command creates comprehensive strategic plans using the ZAP Engine (Zero-shot Augmented Planning) for any aspect of the Construction Syndicate project.

## When to Use This Command
- Starting new features or systems
- Planning major refactoring
- Architecting complex integrations  
- Creating project roadmaps
- Planning HOAI phase transitions
- Designing multi-agent workflows

## Execution Steps

### 1. Parse Command Input
Extract the scope and any additional parameters from the user's request.

### 2. Analyze Current State
- Scan existing codebase for related systems
- Identify dependencies and constraints
- Check for similar implementations
- Review relevant documentation

### 3. Engage ZAP Engine
Use the ZAP Engine to create a multi-level strategic plan:
```javascript
const zapPlan = await ZAPEngine.createPlan({
  goal: scope,
  context: currentState,
  constraints: identifiedConstraints,
  strategy: 'comprehensive'
});
```

### 4. Task Decomposition
Break down the plan into actionable tasks:
- Identify atomic work units
- Establish dependencies
- Estimate complexity
- Assign to appropriate agents/roles

### 5. Risk Analysis
- Identify potential risks
- Assess probability and impact
- Create mitigation strategies
- Define fallback plans

### 6. HOAI Integration (if applicable)
- Map tasks to HOAI phases
- Ensure compliance requirements
- Calculate phase transitions
- Validate against regulations

### 7. Timeline Generation
Create a realistic timeline considering:
- Task dependencies
- Resource availability
- Complexity estimates
- Buffer for uncertainties

### 8. Format Output

## Output Format

```markdown
# Strategic Plan: [Scope]

## Executive Summary
[Brief overview of the plan and key objectives]

## Current State Analysis
- **Existing Systems**: [Related systems identified]
- **Dependencies**: [Key dependencies]
- **Constraints**: [Identified constraints]

## Strategic Approach
[High-level strategy using ZAP Engine recommendations]

## Implementation Plan

### Phase 1: [Phase Name] (Week 1-2)
**Objective**: [Phase objective]

**Tasks**:
1. **Task Name** [Complexity: High/Medium/Low]
   - Description: [What needs to be done]
   - Dependencies: [Prerequisites]
   - Assigned to: [Agent/Role]
   - Deliverables: [Expected outputs]

### Phase 2: [Phase Name] (Week 3-4)
[Continue pattern...]

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| [Risk description] | High/Medium/Low | High/Medium/Low | [Mitigation approach] |

## HOAI Compliance (if applicable)
- **Current Phase**: [LP1-LP9]
- **Target Phase**: [LP1-LP9]
- **Compliance Requirements**: [List requirements]
- **Validation Checkpoints**: [When to validate]

## Success Metrics
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Resource Requirements
- **Human Resources**: [Roles needed]
- **Technical Resources**: [Systems, tools, infrastructure]
- **Time Estimate**: [Total duration]

## Alternative Approaches
1. **Alternative 1**: [Brief description]
   - Pros: [Advantages]
   - Cons: [Disadvantages]

## Next Steps
1. Review and approve plan
2. Create detailed technical specifications
3. Set up development environment
4. Begin Phase 1 implementation

## Appendix
- [Relevant documentation links]
- [Reference architectures]
- [Technical specifications]
```

## Integration Points

### With Other Commands
- Use `/architect` for detailed system design
- Follow with `/implement` for code generation
- Use `/hoai` to validate compliance
- Apply `/test` for test planning

### With Claude's Capabilities
- Leverage codebase search for analysis
- Use file reading for documentation review
- Apply grep for pattern identification
- Utilize web search for best practices

## Best Practices
1. Always start with comprehensive analysis
2. Include alternative approaches
3. Consider both technical and business constraints
4. Plan for iterative refinement
5. Include clear success metrics
6. Document assumptions clearly

## Error Handling
- If ZAP Engine unavailable: Fall back to manual planning
- If scope too broad: Request clarification
- If constraints conflict: Present options to user
- If timeline unrealistic: Propose phased approach

## Examples

### Example 1: Feature Planning
```
/plan user authentication system

Result: Comprehensive plan including OAuth2 integration, session management, 
MFA support, with HOAI LP3-LP5 compliance requirements.
```

### Example 2: Architecture Planning
```
/plan microservices migration for quantum engine

Result: Detailed migration strategy with service decomposition, API gateway 
setup, distributed state management, and rollback procedures.
```

### Example 3: HOAI Phase Planning
```
/plan transition from LP3 to LP4 for Berlin office project

Result: Phase transition plan with compliance checklists, documentation 
requirements, fee calculations, and approval workflows.
```
