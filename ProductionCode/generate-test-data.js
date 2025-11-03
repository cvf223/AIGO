#!/usr/bin/env node

/**
 * 🧪 GENERATE SYNTHETIC TEST DATA
 * ================================
 * 
 * Generates all 6 synthetic JSON test files
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, 'src/construction/testing/data/synthetic');

// Ensure directory exists
try {
    mkdirSync(outputDir, { recursive: true });
} catch (e) {}

console.log('🧪 Generating synthetic test data...');

// 1. Complete Valid Project
const completeValid = {
    projectMetadata: {
        id: "TEST_PROJ_COMPLETE_001",
        name: "Complete Test Office Building",
        type: "office",
        buildingType: "Bürogebäude",
        floors: 5,
        totalArea: 4500.0,
        estimatedCost: 12500000.0,
        location: "München, Bayern",
        client: "Test Client GmbH",
        architect: "Test Architect Firm"
    },
    
    plans: [
        {
            id: "PLAN_001",
            filename: "floor_eg.pdf",
            path: "/test/floor_eg.pdf",
            type: "floor_plan",
            floor: "EG",
            planType: "Grundriss",
            metadata: {
                scale: "1:100",
                date: "2024-01-15",
                revision: "A",
                elements: 234,
                pageCount: 1,
                dimensions: { width: 2970, height: 2100 }
            }
        }
    ],
    
    quantities: {
        din276Structure: {
            kgr300: {
                total: 8500000.0,
                items: [
                    {
                        code: "311.01",
                        description: "Außenwände",
                        quantity: 850.5,
                        unit: "m²",
                        unitPrice: 450.0,
                        totalPrice: 382725.0
                    }
                ]
            }
        },
        totalVolume: 15750.0,
        totalArea: 4500.0,
        elements: [
            { type: "wall_external", quantity: 850.5, unit: "m²", din276Code: "311.01" }
        ]
    },
    
    hoaiRequirements: {
        lp6: {
            grundleistungen: [
                { id: "LP6.1", description: "Aufstellen eines Vergabeterminplans", completed: true, evidence: "Terminplan erstellt" },
                { id: "LP6.2", description: "Aufstellen von Leistungsbeschreibungen", completed: true, evidence: "LV erstellt" },
                { id: "LP6.3", description: "Ermitteln und Zusammenstellen von Mengen", completed: true, evidence: "Mengen ermittelt" },
                { id: "LP6.4", description: "Abstimmen und Koordinieren", completed: true, evidence: "Koordination erfolgt" },
                { id: "LP6.5", description: "Ermitteln der Kosten", completed: true, evidence: "Kosten ermittelt" },
                { id: "LP6.6", description: "Zusammenstellen der Verdingungsunterlagen", completed: true, evidence: "Unterlagen zusammengestellt" },
                { id: "LP6.7", description: "Vorbereiten der GAEB-Daten", completed: true, evidence: "GAEB-Daten vorbereitet" }
            ],
            completeness: 1.0,
            compliance: true
        },
        lp7: {
            grundleistungen: [
                { id: "LP7.1", description: "Koordinieren der Vergabe", completed: true },
                { id: "LP7.2", description: "Einholen von Angeboten", completed: true },
                { id: "LP7.3", description: "Prüfen und Werten der Angebote", completed: true },
                { id: "LP7.4", description: "Führen von Bietergesprächen", completed: true },
                { id: "LP7.5", description: "Erstellen der Vergabevorschläge", completed: true },
                { id: "LP7.6", description: "Mitwirken bei der Auftragserteilung", completed: true }
            ],
            completeness: 1.0,
            compliance: true
        }
    },
    
    errors: [],
    
    analysisMetadata: {
        analyzedAt: new Date().toISOString(),
        analyzedBy: "SyntheticDataGenerator",
        duration: 0,
        accuracy: 1.0,
        version: "1.0.0"
    }
};

writeFileSync(join(outputDir, 'project_complete_valid.json'), JSON.stringify(completeValid, null, 2));
console.log('   ✅ Generated: project_complete_valid.json');

// 2. Project Missing Elements
const missingElements = JSON.parse(JSON.stringify(completeValid));
missingElements.projectMetadata.id = "TEST_PROJ_MISSING_001";
missingElements.projectMetadata.name = "Project with Missing LP6 Elements";
missingElements.hoaiRequirements.lp6.grundleistungen = missingElements.hoaiRequirements.lp6.grundleistungen.slice(0, 5);
missingElements.hoaiRequirements.lp6.completeness = 5/7;
missingElements.hoaiRequirements.lp6.compliance = false;
missingElements.errors = [{
    id: "ERR_001",
    type: "missing_lp6_requirement",
    severity: "HIGH",
    description: "LP6 Grundleistung 6 and 7 missing"
}];

writeFileSync(join(outputDir, 'project_missing_elements.json'), JSON.stringify(missingElements, null, 2));
console.log('   ✅ Generated: project_missing_elements.json');

// 3. DIN 276 Violations
const din276Violations = JSON.parse(JSON.stringify(completeValid));
din276Violations.projectMetadata.id = "TEST_PROJ_DIN276_001";
din276Violations.quantities.din276Structure.kgr300.items[0].code = "INVALID_999";
din276Violations.errors = [{
    id: "ERR_002",
    type: "din276_violation",
    severity: "CRITICAL",
    description: "Invalid DIN 276 code: INVALID_999"
}];

writeFileSync(join(outputDir, 'project_din276_violations.json'), JSON.stringify(din276Violations, null, 2));
console.log('   ✅ Generated: project_din276_violations.json');

// 4. HOAI Non-Compliant
const hoaiNoncompliant = JSON.parse(JSON.stringify(completeValid));
hoaiNoncompliant.projectMetadata.id = "TEST_PROJ_HOAI_NONCOMPL_001";
hoaiNoncompliant.hoaiRequirements.lp6.compliance = false;
hoaiNoncompliant.hoaiRequirements.lp6.completeness = 0.5;
hoaiNoncompliant.errors = [{
    id: "ERR_003",
    type: "hoai_noncompliance",
    severity: "CRITICAL",
    description: "Does not meet HOAI 2021 requirements"
}];

writeFileSync(join(outputDir, 'project_hoai_noncompliant.json'), JSON.stringify(hoaiNoncompliant, null, 2));
console.log('   ✅ Generated: project_hoai_noncompliant.json');

// 5. Individual Plans Set
const individualPlans = {
    plans: Array.from({ length: 20 }, (_, i) => ({
        id: `IND_PLAN_${String(i + 1).padStart(3, '0')}`,
        filename: `test_plan_${i + 1}.pdf`,
        type: i % 3 === 0 ? 'floor_plan' : i % 3 === 1 ? 'section' : 'elevation',
        floor: `Floor_${i % 5}`,
        metadata: {
            scale: i % 2 === 0 ? '1:100' : '1:50',
            date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
            revision: String.fromCharCode(65 + (i % 26)),
            elements: 100 + (i * 10)
        }
    }))
};

writeFileSync(join(outputDir, 'individual_plans_set.json'), JSON.stringify(individualPlans, null, 2));
console.log('   ✅ Generated: individual_plans_set.json');

// 6. Edge Cases
const edgeCases = {
    edgeCases: [
        {
            name: "Empty plan",
            projectMetadata: { id: "EDGE_001", name: "Empty" },
            plans: [],
            quantities: { elements: [] },
            hoaiRequirements: {}
        },
        {
            name: "Zero quantities",
            projectMetadata: { id: "EDGE_002" },
            quantities: { totalArea: 0, totalVolume: 0 }
        },
        {
            name: "Extreme values",
            projectMetadata: { id: "EDGE_003", estimatedCost: 999999999 }
        }
    ]
};

writeFileSync(join(outputDir, 'edge_cases.json'), JSON.stringify(edgeCases, null, 2));
console.log('   ✅ Generated: edge_cases.json');

console.log('✅ Synthetic test data generation complete!');
console.log(`   Output directory: ${outputDir}`);

