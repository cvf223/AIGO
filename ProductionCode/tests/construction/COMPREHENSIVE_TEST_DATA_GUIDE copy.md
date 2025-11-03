# 🧪 Construction Syndicate - Comprehensive Test Data Setup Guide

## Overview
This guide explains how to set up test data for the comprehensive HOAI Compliance Test Suite (200+ cases) and Integration Test Suite we just implemented.

---

## 📁 Required Directory Structure

```
tests/construction/data/
├── hoai_compliance/
│   ├── lp6/
│   │   ├── valid/
│   │   │   ├── complete_lp6_001.json          # Perfect LP6 compliance
│   │   │   ├── complete_lp6_002.json
│   │   │   └── complete_lp6_010.json
│   │   ├── invalid/
│   │   │   ├── missing_schedule_001.json       # LP6.a failures
│   │   │   ├── incomplete_lv_001.json          # LP6.b failures
│   │   │   └── wrong_quantities_001.json       # LP6.c failures
│   │   └── edge_cases/
│   │       ├── empty_lv.json
│   │       ├── huge_project.json               # >€100M
│   │       └── tiny_project.json               # <€10K
│   ├── lp7/
│   │   ├── valid/
│   │   │   ├── complete_lp7_001.json          # Perfect LP7 with 20 bids
│   │   │   ├── complete_lp7_negotiation.json  # LP7.d optional negotiation
│   │   │   └── complete_lp7_010.json
│   │   ├── invalid/
│   │   │   ├── no_preisspiegel_001.json       # LP7.c missing
│   │   │   ├── poor_evaluation_001.json       # LP7.b incomplete
│   │   │   └── no_documentation_001.json      # LP7.f missing
│   │   └── edge_cases/
│   │       ├── zero_bids.json
│   │       ├── 100_bids.json                  # Stress test
│   │       └── collusion_pattern.json         # Known collusion
│   ├── din276/
│   │   ├── valid_structures/
│   │   │   ├── din276_full_001.json          # All 7 cost groups
│   │   │   └── din276_minimal_001.json        # Groups 300,400,500 only
│   │   └── invalid_structures/
│   │       ├── missing_group_300.json
│   │       └── wrong_hierarchy.json
│   └── vob/
│       ├── vob_a_compliant/
│       │   ├── vob_7_eindeutig.json          # Clear descriptions
│       │   ├── vob_8_vollstaendig.json        # Complete docs
│       │   └── vob_16_transparent.json        # Transparent evaluation
│       └── vob_violations/
│           ├── brand_names_without_equivalent.json
│           └── discriminatory_requirements.json
├── integration/
│   ├── workflows/
│   │   ├── full_lp6_pipeline.json            # Complete LP6 workflow
│   │   ├── full_lp7_pipeline.json            # Complete LP7 workflow
│   │   ├── vision_quantity_cost.json         # Vision → Quantity → Cost
│   │   ├── error_resolution.json             # Error → Solution → Implementation
│   │   └── tournament_workflow.json          # Multi-agent tournament
│   ├── transformer_tests/
│   │   ├── all_transformers_init.json
│   │   ├── service_registry_routing.json
│   │   ├── flash_attention_memory.json
│   │   ├── model_compression_4x.json
│   │   └── cross_task_attention.json
│   ├── quantum_tests/
│   │   ├── quantum_init.json
│   │   ├── quantum_gates.json
│   │   ├── amplitude_encoding.json
│   │   └── quantum_advantage.json
│   └── stress_tests/
│       ├── 1000_concurrent_plans.json
│       ├── 100_concurrent_bids.json
│       └── sustained_load_30s.json
└── performance/
    ├── benchmarks/
    │   ├── lp6_validation_5s.json
    │   ├── lp7_validation_5s.json
    │   ├── lv_generation_10s.json
    │   └── preisspiegel_15s_20bids.json
    └── baselines/
        └── expected_performance.json
```

---

## 📋 **LP6 Test Data Requirements (70 Test Cases)**

### **LP6.a - Vergabeterminplan (10 tests)**

**File**: `hoai_compliance/lp6/valid/complete_lp6_001.json`
```json
{
  "projectId": "test_lp6_001",
  "phase": "LP6",
  "vergabeterminplan": {
    "startDate": "2024-03-01",
    "endDate": "2024-09-30",
    "milestones": [
      { "name": "Tender Publication", "date": "2024-03-15", "dependencies": [] },
      { "name": "Site Visit", "date": "2024-04-01", "dependencies": ["Tender Publication"] },
      { "name": "Question Deadline", "date": "2024-04-15", "dependencies": ["Site Visit"] },
      { "name": "Bid Submission", "date": "2024-05-01", "dependencies": ["Question Deadline"] },
      { "name": "Bid Opening", "date": "2024-05-02", "dependencies": ["Bid Submission"] },
      { "name": "Evaluation Complete", "date": "2024-06-01", "dependencies": ["Bid Opening"] },
      { "name": "Award Decision", "date": "2024-06-15", "dependencies": ["Evaluation Complete"] },
      { "name": "Contract Signature", "date": "2024-07-01", "dependencies": ["Award Decision"] }
    ],
    "bidDeadline": "2024-05-01T12:00:00Z",
    "awardDate": "2024-06-15",
    "contractStart": "2024-08-01"
  }
}
```

**File**: `hoai_compliance/lp6/invalid/missing_schedule_001.json`
```json
{
  "projectId": "test_lp6_fail_001",
  "phase": "LP6",
  "vergabeterminplan": null,
  "expectedFailure": "LP6.a.001"
}
```

### **LP6.b - Leistungsverzeichnis (15 tests)**

**File**: `hoai_compliance/lp6/valid/complete_lp6_001.json` (continued)
```json
{
  "leistungsverzeichnis": {
    "positions": [
      {
        "oz": "330.001",
        "shortText": "Außenwand, Mauerwerk",
        "longText": "Außenwand aus Kalksandstein-Mauerwerk KS 20-2.0, 36,5cm stark, mit WDVS 16cm, Putz außen und innen, U-Wert 0,24 W/(m²K), inkl. Dämmung und Verputz beider Seiten",
        "unit": "m²",
        "quantity": 850.50,
        "din276Code": "330",
        "specifications": {
          "material": "Kalksandstein KS 20-2.0",
          "thickness": 365,
          "uValue": 0.24,
          "finish": "Putz"
        }
      },
      {
        "oz": "333.001",
        "shortText": "Stahlbetondecke",
        "longText": "Stahlbetondecke, C30/37, Dicke 20cm, inkl. Bewehrung BSt 500 S, Schalung, und Betonage",
        "unit": "m²",
        "quantity": 1250.75,
        "din276Code": "333"
      },
      {
        "oz": "336.001",
        "shortText": "Innentür, Standard",
        "longText": "Innentür, Holzrahmentür, Türblatt 40mm, Maße 1000x2100mm, inkl. Zarge, Beschläge, Schloss und Einbau",
        "unit": "St",
        "quantity": 28,
        "din276Code": "336"
      }
    ],
    "costGroups": {
      "300": { "subtotal": 1850000, "positions": 45 },
      "400": { "subtotal": 950000, "positions": 32 },
      "500": { "subtotal": 450000, "positions": 18 }
    },
    "totalPositions": 95,
    "totalValue": 3250000,
    "currency": "EUR",
    "priceDate": "2024-02-01"
  }
}
```

### **LP6.c - Mengenermittlung (10 tests)**

```json
{
  "quantities": {
    "verified": true,
    "method": "DIN 277 + VOB/C measurement rules",
    "din277": {
      "BGF": 2500.50,
      "KGF": 375.08,
      "NGF": 2125.42,
      "NUF": 1487.79,
      "TF": 212.54,
      "VF": 425.09
    },
    "areas": {
      "gross_floor_area": { "value": 2500.50, "unit": "m²", "confidence": 0.97 },
      "net_floor_area": { "value": 2125.42, "unit": "m²", "confidence": 0.95 },
      "wall_area": { "value": 850.50, "unit": "m²", "confidence": 0.93 }
    },
    "volumes": {
      "concrete": { "value": 425.30, "unit": "m³", "confidence": 0.90 },
      "earthwork": { "value": 1250.00, "unit": "m³", "confidence": 0.88 }
    },
    "counts": {
      "doors": { "value": 28, "unit": "pcs", "byType": { "Standard": 22, "T30": 6 } },
      "windows": { "value": 65, "unit": "pcs", "byType": { "F1": 40, "F2": 25 } }
    },
    "measurements": {
      "sourcePlans": ["floor_plan_01", "floor_plan_02", "section_aa"],
      "calculatedBy": "QuantityTakeoffEngine",
      "verifiedBy": "formal_reasoning",
      "timestamp": "2024-02-15T10:30:00Z"
    }
  }
}
```

---

## 📊 **LP7 Test Data Requirements (60 Test Cases)**

### **LP7.c - Preisspiegel (12 tests)**

**File**: `hoai_compliance/lp7/valid/complete_lp7_001.json`
```json
{
  "projectId": "test_lp7_001",
  "phase": "LP7",
  "bids": [
    {
      "id": "bid_001",
      "bidder": "Bauunternehmen Schmidt GmbH",
      "submissionTime": "2024-05-01T11:45:00Z",
      "totalPrice": 3180000,
      "priceBreakdown": {
        "positions": [
          { "oz": "330.001", "quantity": 850.50, "unitPrice": 285.00, "total": 242392.50 },
          { "oz": "333.001", "quantity": 1250.75, "unitPrice": 245.00, "total": 306433.75 },
          { "oz": "336.001", "quantity": 28, "unitPrice": 650.00, "total": 18200.00 }
        ],
        "subtotal": 3000000,
        "vat": 570000,
        "total": 3570000
      },
      "timeline": {
        "duration": 180,
        "startDate": "2024-08-01",
        "endDate": "2025-01-28"
      },
      "qualityScore": 85,
      "technicalScore": 78
    },
    {
      "id": "bid_002",
      "bidder": "Baufirma Müller AG",
      "submissionTime": "2024-05-01T11:52:00Z",
      "totalPrice": 3250000,
      "priceBreakdown": {
        "positions": [
          { "oz": "330.001", "quantity": 850.50, "unitPrice": 295.00, "total": 250897.50 },
          { "oz": "333.001", "quantity": 1250.75, "unitPrice": 250.00, "total": 312687.50 },
          { "oz": "336.001", "quantity": 28, "unitPrice": 680.00, "total": 19040.00 }
        ],
        "subtotal": 3070000,
        "vat": 583300,
        "total": 3653300
      },
      "timeline": { "duration": 175 },
      "qualityScore": 88,
      "technicalScore": 82
    }
    // ... 18 more bids for complete test
  ],
  "preisspiegel": {
    "matrix": {
      "330.001": {
        "prices": [285.00, 295.00, 278.00, 290.00],
        "average": 287.00,
        "median": 287.50,
        "stdDev": 7.35
      }
    },
    "statistics": {
      "mean": 3200000,
      "median": 3180000,
      "stdDev": 125000,
      "min": 2950000,
      "max": 3580000,
      "coefficientOfVariation": 0.039
    },
    "outliers": [
      { "bidId": "bid_015", "price": 2850000, "type": "LOW", "deviation": 2.8 }
    ],
    "anomalies": [
      {
        "bidId": "bid_015",
        "type": "ABNORMALLY_LOW",
        "anomalyScore": 0.73,
        "severity": "HIGH",
        "reasons": [
          { "type": "price_significantly_low", "description": "Price 10.9% below average" }
        ]
      }
    ],
    "collusionCheck": {
      "detected": [],
      "risk": 0.12,
      "patterns": []
    }
  },
  "evaluation": {
    "arithmeticCheck": { "passed": true, "errors": [] },
    "completenessCheck": { "passed": true },
    "technical": { "completed": true, "scores": {} },
    "price": { "completed": true },
    "time": { "completed": true }
  },
  "recommendation": {
    "bidder": "Bauunternehmen Schmidt GmbH",
    "bidId": "bid_001",
    "rank": 1,
    "score": 92.5,
    "confidence": 0.95,
    "justification": [
      "Best value with weighted score of 92.5",
      "Competitive price: €3,180,000",
      "Low risk profile: LOW"
    ],
    "warnings": [],
    "conditions": [],
    "alternatives": [
      { "rank": 2, "bidder": "Baufirma Müller AG", "score": 88.3 }
    ]
  }
}
```

---

## 🔬 **Edge Case Test Data (30 Tests)**

### **Empty/Null Cases**

**File**: `hoai_compliance/lp6/edge_cases/empty_lv.json`
```json
{
  "projectId": "edge_empty_001",
  "leistungsverzeichnis": {
    "positions": [],
    "totalPositions": 0,
    "totalValue": 0
  },
  "expectedResult": "should_handle_gracefully"
}
```

**File**: `hoai_compliance/lp6/edge_cases/null_costs.json`
```json
{
  "projectId": "edge_null_001",
  "costs": null,
  "expectedResult": "should_detect_missing_costs"
}
```

### **Boundary Cases**

**File**: `hoai_compliance/lp6/edge_cases/huge_project.json`
```json
{
  "projectId": "edge_large_001",
  "costs": {
    "total": 150000000,
    "costGroups": {
      "300": 75000000,
      "400": 50000000,
      "500": 25000000
    }
  },
  "leistungsverzeichnis": {
    "positions": [...],  // 1500+ positions
    "totalPositions": 1542
  },
  "expectedResult": "should_handle_large_scale"
}
```

### **Unicode/Special Characters**

**File**: `hoai_compliance/lp6/edge_cases/umlauts.json`
```json
{
  "projectId": "edge_unicode_001",
  "leistungsverzeichnis": {
    "positions": [
      {
        "oz": "330.001",
        "shortText": "Außenwand mit Wärmedämmung",
        "longText": "Außenwand gemäß DIN 4108, höchste Qualität, größte Präzision",
        "unit": "m²"
      },
      {
        "oz": "337.001",
        "shortText": "Fenster gemäß §15 Abs. 2 HOAI",
        "unit": "St"
      }
    ]
  },
  "expectedResult": "should_preserve_german_characters"
}
```

---

## 🔗 **Integration Test Data**

### **Workflow: Full LP6 Pipeline**

**File**: `integration/workflows/full_lp6_pipeline.json`
```json
{
  "workflowId": "lp6_pipeline_001",
  "name": "Complete LP6 Generation Pipeline",
  "steps": [
    {
      "step": 1,
      "name": "Load Construction Plans",
      "input": {
        "plans": [
          {
            "id": "plan_001",
            "type": "floor_plan",
            "imagePath": "./test-data/plans/floor_plan_01.png",
            "scale": "1:100",
            "elements": [
              { "id": "elem_001", "type": "wall", "dimensions": { "length": 12500, "height": 3000 } },
              { "id": "elem_002", "type": "door", "dimensions": { "width": 1000, "height": 2100 } }
            ]
          }
        ]
      },
      "expectedOutput": {
        "plansLoaded": 1,
        "elementsDetected": 2
      }
    },
    {
      "step": 2,
      "name": "Extract Quantities",
      "service": "QuantityTakeoffEngine",
      "expectedOutput": {
        "areas": { "gross_floor_area": { "value": 2500 } },
        "counts": { "doors": { "value": 28 } }
      }
    },
    {
      "step": 3,
      "name": "Detect Errors",
      "service": "ErrorDetectionEscalationService",
      "expectedOutput": {
        "errorsDetected": 0,
        "criticalErrors": 0
      }
    },
    {
      "step": 4,
      "name": "Generate Leistungsverzeichnis",
      "service": "LP6Generator",
      "expectedOutput": {
        "positionsGenerated": 95,
        "din276Compliant": true,
        "gaebExportReady": true
      }
    },
    {
      "step": 5,
      "name": "Validate HOAI Compliance",
      "service": "HOAIComplianceService",
      "expectedOutput": {
        "compliant": true,
        "phase": "LP6",
        "confidence": 0.95
      }
    },
    {
      "step": 6,
      "name": "Export to GAEB",
      "expectedOutput": {
        "format": "GAEB DA84",
        "xmlGenerated": true,
        "fileSize": ">100KB"
      }
    }
  ],
  "totalDurationThreshold": 15000,
  "successCriteria": {
    "allStepsPass": true,
    "withinTimeLimit": true,
    "outputValid": true
  }
}
```

---

## 🤖 **Transformer Integration Test Data**

### **Test: All Transformers Initialize**

**File**: `integration/transformer_tests/all_transformers_init.json`
```json
{
  "testId": "TRANS.001",
  "name": "All transformers initialize successfully",
  "requiredTransformers": [
    "UniversalConstructionTransformer",
    "VisionDecoder",
    "QuantityDecoder",
    "ErrorDecoder",
    "ComplianceDecoder",
    "BidDecoder",
    "PlanningDecoder",
    "HierarchicalVisionTransformer",
    "VLTransformer",
    "ErrorTransformer",
    "QuantityTransformer",
    "ComplianceTransformer",
    "BidTransformer",
    "ConstructionDecisionTransformer",
    "MultiAgentTransformer",
    "QuantumTransformer"
  ],
  "initializationConfig": {
    "d_model": 512,
    "numLayers": 6,
    "numHeads": 8
  },
  "successCriteria": {
    "allInitialized": true,
    "noErrors": true,
    "initTime": "<30s"
  }
}
```

### **Test: Flash Attention Memory Reduction**

**File**: `integration/transformer_tests/flash_attention_memory.json`
```json
{
  "testId": "TRANS.003",
  "name": "Flash Attention reduces memory usage",
  "input": {
    "seqLength": 1000,
    "headDim": 64,
    "numHeads": 8,
    "batchSize": 8
  },
  "expectedResults": {
    "memorySavingsPercent": ">50%",
    "speedupFactor": ">5x",
    "accuracyLoss": "<0.01%"
  },
  "testData": {
    "Q": "random_matrix_1000x64",
    "K": "random_matrix_1000x64",
    "V": "random_matrix_1000x64"
  }
}
```

---

## 🌌 **Quantum Integration Test Data**

**File**: `integration/quantum_tests/quantum_gates.json`
```json
{
  "testId": "QUANTUM.002",
  "name": "Quantum gates apply correctly",
  "circuit": [
    { "gate": "H", "qubits": [0] },
    { "gate": "CNOT", "qubits": [0, 1] }
  ],
  "expectedMeasurements": {
    "00": "~50%",
    "11": "~50%",
    "01": "~0%",
    "10": "~0%"
  },
  "tolerance": 0.05,
  "numShots": 1000
}
```

---

## ⚡ **Performance Test Data**

**File**: `performance/benchmarks/lp6_validation_5s.json`
```json
{
  "benchmarkId": "PERF.001",
  "name": "LP6 validation completes within 5 seconds",
  "testData": {
    "projectId": "perf_test_001",
    "phase": "LP6",
    "documents": {
      "vergabeterminplan": {},
      "leistungsverzeichnis": { "positions": 95 },
      "quantities": {},
      "coordination": {},
      "costs": {},
      "costControl": {},
      "tenderDocuments": {}
    }
  },
  "performanceThresholds": {
    "maxDuration": 5000,
    "maxMemoryMB": 512,
    "maxCPUPercent": 80
  },
  "iterations": 10,
  "warmupRuns": 2
}
```

---

## 💪 **Stress Test Data**

**File**: `integration/stress_tests/1000_concurrent_plans.json`
```json
{
  "testId": "STRESS.001",
  "name": "Handle 1000 plans concurrently",
  "concurrentPlans": 1000,
  "planTemplate": {
    "type": "floor_plan",
    "elements": 50,
    "dimensions": { "width": 15000, "height": 20000 }
  },
  "expectedResults": {
    "allProcessed": true,
    "avgProcessingTime": "<200ms",
    "peakMemoryMB": "<4096",
    "errorRate": "<1%"
  },
  "duration": 30000,
  "rampUp": 5000
}
```

---

## 🎯 **How to Use This Test Data**

### **1. Running HOAI Compliance Tests**

```javascript
import { HOAIComplianceTestSuite } from './src/construction/testing/HOAIComplianceTestSuite.js';
import { promises as fs } from 'fs';

// Load test documents
const testDocs = JSON.parse(
  await fs.readFile('./tests/construction/data/hoai_compliance/lp6/valid/complete_lp6_001.json', 'utf-8')
);

// Initialize and run tests
const testSuite = new HOAIComplianceTestSuite({ database });
await testSuite.initialize();

const results = await testSuite.runAllTests(testDocs);

console.log(`Passed: ${results.summary.passed}/${results.summary.total}`);
console.log(`Pass Rate: ${results.summary.passRate}`);
```

### **2. Running Integration Tests**

```javascript
import { IntegrationTestSuite } from './src/construction/testing/IntegrationTestSuite.js';

// Load services
const services = {
  QuantityTakeoffEngine: new QuantityTakeoffEngine(),
  ErrorDetectionEscalationService: new ErrorDetectionEscalationService(),
  LP6Generator: new LP6Generator(),
  HOAIComplianceService: new HOAIComplianceService(),
  FlashAttention2: new FlashAttention2(),
  ModelCompression: new ModelCompression(),
  TransformerServiceRegistry: new TransformerServiceRegistry(),
  QuantumTransformer: new QuantumTransformer()
  // ... all other services
};

// Initialize all services
for (const service of Object.values(services)) {
  await service.initialize();
}

// Run tests
const testSuite = new IntegrationTestSuite();
await testSuite.initialize();

const results = await testSuite.runAllTests(services);
```

### **3. Running Performance Benchmarks**

```javascript
// Load benchmark config
const benchmarkData = JSON.parse(
  await fs.readFile('./tests/construction/data/performance/benchmarks/lp6_validation_5s.json')
);

// Run benchmark
const suite = new HOAIComplianceTestSuite();
await suite.initialize();

const startTime = Date.now();
await suite.runAllTests(benchmarkData.testData);
const duration = Date.now() - startTime;

console.log(`Duration: ${duration}ms (threshold: ${benchmarkData.performanceThresholds.maxDuration}ms)`);
console.log(`Pass: ${duration < benchmarkData.performanceThresholds.maxDuration}`);
```

---

## 🔧 **Quick Setup Script**

Create `tests/construction/setupTestData.js`:

```javascript
import { promises as fs } from 'fs';
import path from 'path';

async function setupTestData() {
  const baseDir = './tests/construction/data';
  
  // Create directory structure
  const dirs = [
    'hoai_compliance/lp6/valid',
    'hoai_compliance/lp6/invalid',
    'hoai_compliance/lp6/edge_cases',
    'hoai_compliance/lp7/valid',
    'hoai_compliance/lp7/invalid',
    'hoai_compliance/lp7/edge_cases',
    'hoai_compliance/din276/valid_structures',
    'hoai_compliance/din276/invalid_structures',
    'hoai_compliance/vob/vob_a_compliant',
    'hoai_compliance/vob/vob_violations',
    'integration/workflows',
    'integration/transformer_tests',
    'integration/quantum_tests',
    'integration/stress_tests',
    'performance/benchmarks',
    'performance/baselines'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(path.join(baseDir, dir), { recursive: true });
  }
  
  console.log('✅ Test data directory structure created');
  
  // Generate sample test files
  await generateSampleTestFiles(baseDir);
}

setupTestData().catch(console.error);
```

Run with:
```bash
node tests/construction/setupTestData.js
```

---

## 📊 **Test Execution Checklist**

### **Before Running Tests:**
- [ ] All test data directories created
- [ ] At least 10 valid LP6 test documents
- [ ] At least 10 valid LP7 test documents with bids
- [ ] Edge case files created (30 total)
- [ ] Integration workflow JSONs ready (5 workflows)
- [ ] Performance benchmark data prepared
- [ ] Database connection configured (if using)
- [ ] All transformer services initialized

### **Running Tests:**
- [ ] Run HOAI Compliance Test Suite (200+ cases)
- [ ] Run Integration Test Suite (50+ cases)
- [ ] Run Performance Benchmarks (10 tests)
- [ ] Run Stress Tests (3 scenarios)
- [ ] Collect and analyze results

### **After Testing:**
- [ ] Review failed test cases
- [ ] Update test data if needed
- [ ] Document any edge cases discovered
- [ ] Generate test report
- [ ] Archive test results with timestamp

---

## 🎯 **Success Criteria**

**HOAI Compliance Tests:**
- ✅ Pass rate: >95% (190+ of 200+ tests)
- ✅ LP6 tests: 100% pass
- ✅ LP7 tests: 100% pass
- ✅ Edge cases: >80% pass

**Integration Tests:**
- ✅ All workflows complete successfully
- ✅ All transformers initialize
- ✅ Quantum integration functional
- ✅ No crashes or hangs

**Performance Tests:**
- ✅ All benchmarks within thresholds
- ✅ Memory usage <512MB per test
- ✅ CPU usage <80% average
- ✅ No memory leaks

---

## 📞 **Support & Resources**

**If test data is missing or unclear:**
1. Check `./tests/construction/examples/` for sample data
2. Review `HOAIComplianceTestSuite.js` for expected data structure
3. Use `generateTestData.js` script to create synthetic data
4. Consult HOAI 2021 standards for compliance requirements

**For test failures:**
1. Check test logs in `./tests/construction/logs/`
2. Review specific test case implementation
3. Validate test data format
4. Check service initialization

**Test data templates available in:**
- `./tests/construction/templates/lp6_template.json`
- `./tests/construction/templates/lp7_template.json`
- `./tests/construction/templates/preisspiegel_template.json`

This guide ensures the 200+ HOAI test cases and 50+ integration tests have proper data! 🎯

