# 🏗️ Construction Syndicate - Test Data Setup Guide

## Overview
This guide explains how to set up test data for comprehensive testing of the Construction Syndicate's HOAI LP 6 & 7 capabilities.

## 📁 Directory Structure

```
test-data/
└── construction/
    ├── sample_projects/
    │   ├── project_001_residential/
    │   │   ├── floor_plans/
    │   │   ├── elevations/
    │   │   ├── sections/
    │   │   └── details/
    │   ├── project_002_commercial/
    │   └── project_003_industrial/
    ├── hoai_standards/
    │   ├── lp6_requirements.json
    │   └── lp7_requirements.json
    ├── ground_truth/
    │   ├── quantities/
    │   ├── errors/
    │   └── compliance/
    └── synthetic/
        └── generated_plans/
```

## 🎯 Test Data Requirements

### 1. Construction Plans (2D PDFs)
**Format**: PDF, DWG, or high-resolution images (PNG, JPEG)
**Minimum Requirements**:
- **Floor Plans**: At least 3-5 different floor plans per project
- **Elevations**: Front, back, and side views
- **Sections**: Cross-sections showing structural details
- **Details**: Close-up details of critical components

**Recommended Sources**:
- Sample architectural projects from open-source repositories
- Educational architectural datasets
- Synthetic plan generation (see below)
- Public domain construction documents

### 2. Ground Truth Data
For validation and accuracy testing, you need:

#### Quantity Ground Truth (`ground_truth/quantities/`)
```json
{
  "projectId": "project_001",
  "quantities": {
    "concrete": { "value": 450, "unit": "m³" },
    "steel": { "value": 12500, "unit": "kg" },
    "bricks": { "value": 25000, "unit": "pieces" },
    "windows": { "value": 45, "unit": "pieces" },
    "doors": { "value": 18, "unit": "pieces" }
  },
  "boq_reference": "standard_residential_boq.xlsx",
  "validated_by": "licensed_architect",
  "date": "2024-01-15"
}
```

#### Error Ground Truth (`ground_truth/errors/`)
```json
{
  "projectId": "project_001",
  "knownErrors": [
    {
      "errorId": "err_001",
      "type": "dimension_mismatch",
      "description": "Floor plan dimensions don't match elevation",
      "severity": "critical",
      "affectedPlans": ["floor_plan_01.pdf", "elevation_front.pdf"],
      "location": { "page": 1, "coordinates": [150, 200] },
      "correctSolution": "Use dimensions from floor plan"
    }
  ]
}
```

#### Compliance Ground Truth (`ground_truth/compliance/`)
```json
{
  "projectId": "project_001",
  "hoaiPhase": "lp6",
  "compliant": true,
  "checkedStandards": ["VOB/A", "VOB/B", "DIN 276", "DIN 277"],
  "violations": [],
  "completenessScore": 1.0,
  "validatedBy": "hoai_expert",
  "date": "2024-01-15"
}
```

### 3. HOAI Standards Reference
Store HOAI requirements in JSON format:

#### LP 6 Requirements (`hoai_standards/lp6_requirements.json`)
```json
{
  "phase": "lp6",
  "name": "Ausschreibung (Tendering)",
  "requiredDocuments": [
    "tender_invitation",
    "bill_of_quantities",
    "technical_specifications",
    "contract_terms",
    "project_schedule",
    "cost_estimate"
  ],
  "regulations": {
    "VOB_A": {
      "required": true,
      "sections": ["§1", "§2", "§3"]
    },
    "DIN_276": {
      "required": true,
      "costCategories": ["300", "400", "500"]
    }
  },
  "minimumCompleteness": 0.95,
  "qualityStandards": ["ISO_19650", "DIN_EN_ISO_7200"]
}
```

## 🤖 Generating Synthetic Test Data

### Option 1: Using the Synthetic Data Generator
```bash
node tests/construction/generateSyntheticTestData.js --projects 10 --plans-per-project 5
```

### Option 2: Using AI Generation
Use the included AI-powered plan generator:
```javascript
import { SyntheticPlanGenerator } from './SyntheticPlanGenerator.js';

const generator = new SyntheticPlanGenerator({
    projectType: 'residential',
    complexity: 'medium',
    errorRate: 0.1 // 10% of plans will have intentional errors
});

await generator.generateProject({
    projectId: 'synthetic_001',
    floors: 3,
    unitsPerFloor: 4,
    includeErrors: true
});
```

## 🧪 Running Tests with Real Data

### Basic Test Run
```bash
# Run all tests with default test data
node tests/construction/runConstructionTests.js
```

### Test with Specific Project
```javascript
import { LegendarySyndicateSystem } from '../../learning/LegendarySyndicateSystem.js';

const projectConfig = {
    projectId: 'real_project_001',
    projectName: 'Real Office Building Project',
    phase: 'lp6',
    planPaths: [
        '/path/to/real/floor_plan_01.pdf',
        '/path/to/real/floor_plan_02.pdf',
        '/path/to/real/elevation_front.pdf',
        '/path/to/real/elevation_back.pdf',
        '/path/to/real/section_aa.pdf'
    ],
    requirements: {
        hoaiPhase: 'lp6',
        projectType: 'commercial',
        buildingType: 'office',
        grossFloorArea: 2500,
        estimatedCost: 5000000,
        timeline: '18 months'
    }
};

const result = await syndicateSystem.processConstructionProject(projectConfig);
```

### Validation with Ground Truth
```javascript
import { validateAgainstGroundTruth } from './validation/GroundTruthValidator.js';

const groundTruth = require('./test-data/construction/ground_truth/quantities/project_001.json');

const validationResult = validateAgainstGroundTruth({
    syndicateResult: result,
    groundTruth: groundTruth,
    tolerances: {
        quantity: 0.05,  // 5% tolerance
        dimensions: 0.01, // 1% tolerance
        count: 0.0       // Exact match required
    }
});

console.log(`Validation Accuracy: ${validationResult.accuracy * 100}%`);
```

## 📊 Performance Benchmarking

### Benchmark Test Configuration
```javascript
const benchmarkConfig = {
    tests: [
        {
            name: 'Single Plan Processing',
            planCount: 1,
            iterations: 100,
            target: '<30s'
        },
        {
            name: 'Multi-Plan Processing',
            planCount: 30,
            iterations: 10,
            target: '<5min'
        },
        {
            name: 'Stress Test',
            planCount: 50,
            iterations: 5,
            target: '<10min'
        }
    ],
    metrics: [
        'processing_time',
        'memory_usage',
        'accuracy',
        'error_detection_rate',
        'escalation_count'
    ]
};
```

## 🔍 Test Scenarios

### Scenario 1: Perfect Plans (No Errors)
Test the system's ability to process error-free plans efficiently.
- **Expected**: High accuracy, no escalations, fast processing
- **Validation**: Compare extracted quantities with ground truth

### Scenario 2: Plans with Known Errors
Test error detection and escalation capabilities.
- **Expected**: All errors detected, appropriate escalations created
- **Validation**: Compare detected errors with ground truth errors

### Scenario 3: Incomplete Plans
Test handling of missing information.
- **Expected**: System identifies missing data, escalates for human input
- **Validation**: Verify all missing elements are flagged

### Scenario 4: Conflicting Information
Test cross-referencing capabilities.
- **Expected**: Conflicts detected, multiple solutions proposed
- **Validation**: Verify all conflicts found in ground truth are detected

### Scenario 5: Large-Scale Project (30+ Plans)
Test system scalability and performance.
- **Expected**: Linear or better scaling, maintained accuracy
- **Validation**: Performance metrics within targets

### Scenario 6: HOAI Compliance Edge Cases
Test compliance verification with borderline cases.
- **Expected**: Correct compliance assessment
- **Validation**: Compare with expert HOAI compliance review

## 🎯 Success Criteria

### Functional Requirements
- ✅ Plan ingestion: 100% success rate
- ✅ Visual analysis accuracy: >95%
- ✅ Quantity extraction accuracy: >90%
- ✅ Error detection rate: >90%
- ✅ Cross-reference accuracy: >95%
- ✅ HOAI compliance detection: >98%

### Performance Requirements
- ✅ Single plan processing: <30s
- ✅ Multi-plan (30) processing: <15min total (<30s average per plan)
- ✅ Memory efficiency: <2GB for 30 plans
- ✅ Quantum speedup: >3x vs classical methods
- ✅ Escalation response: <500ms

### Quality Requirements
- ✅ Zero false negatives for critical errors
- ✅ False positive rate: <5%
- ✅ Escalation relevance: >95%
- ✅ Solution quality: Average confidence >80%

## 📝 Test Reporting

### Automated Report Generation
After each test run, the system generates:

1. **Executive Summary**
   - Overall pass/fail rate
   - Key metrics
   - Critical issues

2. **Detailed Results**
   - Test-by-test breakdown
   - Performance benchmarks
   - Error analysis

3. **Comparison Reports**
   - Ground truth validation
   - Historical comparison
   - Regression detection

4. **Recommendations**
   - Areas for improvement
   - Training data needs
   - System optimizations

## 🚀 Next Steps

1. **Acquire Real Test Data**
   - Contact architectural firms for sample projects
   - Use public domain construction documents
   - Generate synthetic data as needed

2. **Set Up Ground Truth**
   - Have licensed architects validate quantities
   - Document known errors in test plans
   - Establish HOAI compliance baselines

3. **Run Comprehensive Tests**
   - Execute all test scenarios
   - Validate against ground truth
   - Analyze performance metrics

4. **Iterate and Improve**
   - Address detected issues
   - Retrain models with feedback
   - Optimize performance bottlenecks

5. **Production Readiness**
   - Final validation with real projects
   - Security and compliance review
   - Deployment configuration

## 🔗 Resources

- **HOAI Official Documentation**: [Link to HOAI standards]
- **VOB/A & VOB/B**: [Link to German construction regulations]
- **DIN Standards**: DIN 276, DIN 277, DIN EN ISO 7200
- **Sample Architectural Datasets**: [Links to open-source datasets]
- **QWEN 3-VL Documentation**: [Link to vision model docs]

## 📞 Support

For questions or issues with test data setup:
- Review existing test scenarios in `tests/construction/ConstructionSyndicateTestScenarios.js`
- Check integration tests in `tests/construction/runConstructionTests.js`
- Consult `CHANGELOG.md` for recent updates

