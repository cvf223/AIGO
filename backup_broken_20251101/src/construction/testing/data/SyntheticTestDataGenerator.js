/**
 * 🧪 SYNTHETIC TEST DATA GENERATOR
 * =================================
 * 
 * Generates valid synthetic test data for HOAI compliance
 * and integration testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SyntheticTestDataGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, 'synthetic');
    }
    
    /**
     * 🎯 GENERATE ALL SYNTHETIC TEST DATA
     */
    async generateAll() {
        console.log('🧪 Generating synthetic test data...');
        
        const files = [
            { name: 'project_complete_valid.json', generator: 'generateCompleteValid' },
            { name: 'project_missing_elements.json', generator: 'generateMissingElements' },
            { name: 'project_din276_violations.json', generator: 'generateDIN276Violations' },
            { name: 'project_hoai_noncompliant.json', generator: 'generateHOAINoncompliant' },
            { name: 'individual_plans_set.json', generator: 'generateIndividualPlans' },
            { name: 'edge_cases.json', generator: 'generateEdgeCases' }
        ];
        
        for (const file of files) {
            const data = this[file.generator]();
            this.saveJSON(file.name, data);
            console.log(`   ✅ Generated: ${file.name}`);
        }
        
        console.log('✅ Synthetic test data generation complete');
    }
    
    /**
     * 📄 GENERATE COMPLETE VALID PROJECT
     */
    generateCompleteValid() {
        return {
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
            
            plans: this.generateValidPlans(5),
            
            quantities: this.generateValidQuantities(),
            
            hoaiRequirements: {
                lp6: {
                    grundleistungen: this.generateLP6Grundleistungen(true),
                    besondereLeistungen: [],
                    completeness: 1.0,
                    compliance: true
                },
                lp7: {
                    grundleistungen: this.generateLP7Grundleistungen(true),
                    besondereLeistungen: [],
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
    }
    
    /**
     * ⚠️ GENERATE PROJECT WITH MISSING ELEMENTS
     */
    generateMissingElements() {
        const complete = this.generateCompleteValid();
        
        // Remove some LP6 requirements
        complete.hoaiRequirements.lp6.grundleistungen = complete.hoaiRequirements.lp6.grundleistungen.slice(0, 5);
        complete.hoaiRequirements.lp6.completeness = 5/7;
        complete.hoaiRequirements.lp6.compliance = false;
        
        // Add error indicating missing elements
        complete.errors = [{
            id: "ERR_001",
            type: "missing_lp6_requirement",
            severity: "HIGH",
            description: "LP6 Grundleistung 6 and 7 missing",
            location: null,
            suggestedSolutions: ["Complete missing Leistungsverzeichnis", "Add GAEB export"]
        }];
        
        complete.projectMetadata.id = "TEST_PROJ_MISSING_001";
        complete.projectMetadata.name = "Project with Missing LP6 Elements";
        
        return complete;
    }
    
    /**
     * 🚫 GENERATE DIN 276 VIOLATIONS
     */
    generateDIN276Violations() {
        const complete = this.generateCompleteValid();
        
        // Add invalid DIN 276 codes
        complete.quantities.din276Structure.kgr300.items[0].code = "INVALID_999";
        
        // Add error
        complete.errors = [{
            id: "ERR_002",
            type: "din276_violation",
            severity: "CRITICAL",
            description: "Invalid DIN 276 code used: INVALID_999",
            location: {
                planId: "PLAN_001",
                bbox: [100, 100, 200, 200]
            },
            suggestedSolutions: ["Use valid DIN 276 code from KGr 300-399"]
        }];
        
        complete.projectMetadata.id = "TEST_PROJ_DIN276_001";
        complete.projectMetadata.name = "Project with DIN 276 Violations";
        
        return complete;
    }
    
    /**
     * ❌ GENERATE HOAI NON-COMPLIANT PROJECT
     */
    generateHOAINoncompliant() {
        const complete = this.generateCompleteValid();
        
        // Make it non-compliant
        complete.hoaiRequirements.lp6.compliance = false;
        complete.hoaiRequirements.lp6.completeness = 0.5;
        complete.hoaiRequirements.lp7.compliance = false;
        complete.hoaiRequirements.lp7.completeness = 0.3;
        
        complete.errors = [{
            id: "ERR_003",
            type: "hoai_noncompliance",
            severity: "CRITICAL",
            description: "Project does not meet HOAI 2021 LP6 & LP7 requirements",
            location: null,
            suggestedSolutions: ["Complete all Grundleistungen", "Review HOAI 2021 requirements"]
        }];
        
        complete.projectMetadata.id = "TEST_PROJ_HOAI_NONCOMPL_001";
        complete.projectMetadata.name = "HOAI Non-Compliant Project";
        
        return complete;
    }
    
    /**
     * 📋 GENERATE INDIVIDUAL PLANS SET
     */
    generateIndividualPlans() {
        return {
            plans: Array.from({ length: 20 }, (_, i) => ({
                id: `IND_PLAN_${String(i + 1).padStart(3, '0')}`,
                filename: `test_plan_${i + 1}.pdf`,
                path: `/test/plans/plan_${i + 1}.pdf`,
                type: i % 3 === 0 ? 'floor_plan' : i % 3 === 1 ? 'section' : 'elevation',
                floor: `Floor_${i % 5}`,
                planType: i % 3 === 0 ? 'Grundriss' : i % 3 === 1 ? 'Schnitt' : 'Ansicht',
                metadata: {
                    scale: i % 2 === 0 ? '1:100' : '1:50',
                    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
                    revision: String.fromCharCode(65 + (i % 26)),
                    elements: 100 + (i * 10),
                    pageCount: 1,
                    dimensions: { width: 2970, height: 2100 }
                }
            }))
        };
    }
    
    /**
     * 🔬 GENERATE EDGE CASES
     */
    generateEdgeCases() {
        return {
            edgeCases: [
                {
                    name: "Empty plan",
                    projectMetadata: { id: "EDGE_001", name: "Empty" },
                    plans: [],
                    quantities: { din276Structure: {}, elements: [] },
                    hoaiRequirements: { lp6: {}, lp7: {} },
                    errors: []
                },
                {
                    name: "Plan with zero quantities",
                    projectMetadata: { id: "EDGE_002", name: "Zero Quantities" },
                    plans: [{ id: "P1", type: "floor_plan" }],
                    quantities: { elements: [], totalArea: 0, totalVolume: 0 },
                    hoaiRequirements: { lp6: {}, lp7: {} },
                    errors: []
                },
                {
                    name: "Plan with extreme values",
                    projectMetadata: { id: "EDGE_003", name: "Extreme Values", estimatedCost: 999999999 },
                    plans: [{ id: "P1", metadata: { elements: 100000 } }],
                    quantities: { totalArea: 1000000, totalVolume: 5000000 },
                    hoaiRequirements: { lp6: {}, lp7: {} },
                    errors: []
                }
            ]
        };
    }
    
    /**
     * 🏗️ GENERATE VALID PLANS
     */
    generateValidPlans(count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `PLAN_${String(i + 1).padStart(3, '0')}`,
            filename: `floor_plan_${i}.pdf`,
            path: `/test/plans/floor_${i}.pdf`,
            type: 'floor_plan',
            floor: i === 0 ? 'EG' : `OG${i}`,
            planType: 'Grundriss',
            metadata: {
                scale: '1:100',
                date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
                revision: String.fromCharCode(65 + i),
                elements: 200 + (i * 50),
                pageCount: 1,
                dimensions: { width: 2970, height: 2100 }
            }
        }));
    }
    
    /**
     * 📊 GENERATE VALID QUANTITIES
     */
    generateValidQuantities() {
        return {
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
                        },
                        {
                            code: "312.01",
                            description: "Innenwände",
                            quantity: 1250.0,
                            unit: "m²",
                            unitPrice: 280.0,
                            totalPrice: 350000.0
                        },
                        {
                            code: "332.01",
                            description: "Fenster",
                            quantity: 85.0,
                            unit: "Stück",
                            unitPrice: 1200.0,
                            totalPrice: 102000.0
                        }
                    ]
                },
                kgr400: {
                    total: 2500000.0,
                    items: [
                        {
                            code: "421.01",
                            description: "Heizungsanlage",
                            quantity: 1.0,
                            unit: "Pausch",
                            unitPrice: 850000.0,
                            totalPrice: 850000.0
                        }
                    ]
                },
                kgr500: {
                    total: 500000.0,
                    items: []
                }
            },
            totalVolume: 15750.0,
            totalArea: 4500.0,
            elements: [
                { type: "wall_external", quantity: 850.5, unit: "m²", din276Code: "311.01" },
                { type: "wall_internal", quantity: 1250.0, unit: "m²", din276Code: "312.01" },
                { type: "window", quantity: 85, unit: "Stück", din276Code: "332.01" },
                { type: "door", quantity: 45, unit: "Stück", din276Code: "334.01" }
            ]
        };
    }
    
    /**
     * ✅ GENERATE LP6 GRUNDLEISTUNGEN
     */
    generateLP6Grundleistungen(allCompleted = true) {
        const grundleistungen = [
            { id: "LP6.1", description: "Aufstellen eines Vergabeterminplans", completed: allCompleted, evidence: "Terminplan erstellt" },
            { id: "LP6.2", description: "Aufstellen von Leistungsbeschreibungen mit Leistungsverzeichnissen", completed: allCompleted, evidence: "LV erstellt" },
            { id: "LP6.3", description: "Ermitteln und Zusammenstellen von Mengen als Grundlage der Leistungsbeschreibung", completed: allCompleted, evidence: "Mengen ermittelt" },
            { id: "LP6.4", description: "Abstimmen und Koordinieren der Leistungsbeschreibungen", completed: allCompleted, evidence: "Koordination erfolgt" },
            { id: "LP6.5", description: "Ermitteln der Kosten", completed: allCompleted, evidence: "Kosten ermittelt" },
            { id: "LP6.6", description: "Zusammenstellen der Verdingungsunterlagen", completed: allCompleted, evidence: "Unterlagen zusammengestellt" },
            { id: "LP6.7", description: "Vorbereiten der GAEB-Daten", completed: allCompleted, evidence: "GAEB-Daten vorbereitet" }
        ];
        
        return grundleistungen;
    }
    
    /**
     * ✅ GENERATE LP7 GRUNDLEISTUNGEN
     */
    generateLP7Grundleistungen(allCompleted = true) {
        const grundleistungen = [
            { id: "LP7.1", description: "Koordinieren der Vergabe", completed: allCompleted, evidence: "Vergabe koordiniert" },
            { id: "LP7.2", description: "Einholen von Angeboten", completed: allCompleted, evidence: "Angebote eingeholt" },
            { id: "LP7.3", description: "Prüfen und Werten der Angebote", completed: allCompleted, evidence: "Angebote geprüft" },
            { id: "LP7.4", description: "Führen von Bietergesprächen", completed: allCompleted, evidence: "Gespräche geführt" },
            { id: "LP7.5", description: "Erstellen der Vergabevorschläge", completed: allCompleted, evidence: "Vorschläge erstellt" },
            { id: "LP7.6", description: "Mitwirken bei der Auftragserteilung", completed: allCompleted, evidence: "Auftrag erteilt" }
        ];
        
        return grundleistungen;
    }
    
    /**
     * 💾 SAVE JSON FILE
     */
    saveJSON(filename, data) {
        const filepath = path.join(this.outputDir, filename);
        writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new SyntheticTestDataGenerator();
    await generator.generateAll();
}

export default SyntheticTestDataGenerator;

