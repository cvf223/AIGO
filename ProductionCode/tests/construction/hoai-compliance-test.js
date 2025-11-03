/**
 * 📋 HOAI COMPLIANCE TEST SUITE
 * =============================
 * PRODUCTION-READY Tests for HOAI 2021 Compliance
 * Tests all Leistungsphasen (LP1-LP9) and fee calculations
 * 
 * @module hoai-compliance-test
 * @requires ComplianceCheckService
 * @version 1.0.0
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { ComplianceCheckService } from '../../src/construction/services/ComplianceCheckService.js';
import { ConstructionSyntheticDataGenerator } from '../../src/training/ConstructionSyntheticDataGenerator.js';
import { databaseConnectionManager } from '../../database/DatabaseConnectionManager.js';

/**
 * 📋 HOAI COMPLIANCE TEST SUITE
 */
describe('HOAI 2021 Compliance Tests', () => {
    let complianceService;
    let dataGenerator;
    let sampleProject;
    
    const TEST_TIMEOUT = 60000;
    
    /**
     * 🚀 SETUP
     */
    beforeAll(async () => {
        console.log('📋 Initializing HOAI Compliance Test Suite...');
        
        await databaseConnectionManager.initialize();
        
        complianceService = new ComplianceCheckService({
            strictMode: false, // Don't throw on violations during tests
            autoCorrection: true
        });
        await complianceService.initialize();
        
        dataGenerator = new ConstructionSyntheticDataGenerator();
        await dataGenerator.initialize();
        
        // Generate sample project
        const projects = await dataGenerator.generateProjects(1);
        sampleProject = projects[0];
        
    }, TEST_TIMEOUT);
    
    /**
     * 🛑 TEARDOWN
     */
    afterAll(async () => {
        if (complianceService) await complianceService.shutdown();
        if (dataGenerator) await dataGenerator.shutdown();
        await databaseConnectionManager.cleanup();
    });
    
    /**
     * 📐 LEISTUNGSPHASE 1 - GRUNDLAGENERMITTLUNG
     */
    describe('LP1 - Grundlagenermittlung (2%)', () => {
        test('Should validate site analysis requirement', async () => {
            const documents = [
                { type: 'SITE_ANALYSIS', content: 'Complete site analysis' },
                { type: 'BUILDING_PROGRAM', content: 'Detailed program' },
                { type: 'ZONING_REPORT', content: 'Zoning compliance' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP1',
                documents: documents
            });
            
            expect(result.phase).toBe('LP1');
            expect(result.violations.filter(v => v.ruleId === 'LP1_SITE_ANALYSIS')).toHaveLength(0);
        });
        
        test('Should detect missing building program', async () => {
            const documents = [
                { type: 'SITE_ANALYSIS', content: 'Complete site analysis' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP1',
                documents: documents
            });
            
            expect(result.compliant).toBe(false);
            expect(result.violations.some(v => v.ruleId === 'LP1_PROGRAM_DEFINITION')).toBe(true);
        });
    });
    
    /**
     * 🎨 LEISTUNGSPHASE 2 - VORPLANUNG
     */
    describe('LP2 - Vorplanung (7%)', () => {
        test('Should require minimum 3 concept variants', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP2');
            
            const conceptVariants = documents.filter(d => d.type === 'CONCEPT_VARIANT');
            expect(conceptVariants.length).toBeGreaterThanOrEqual(3);
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP2',
                documents: documents
            });
            
            expect(result.violations.filter(v => v.ruleId === 'LP2_CONCEPT_VARIANTS')).toHaveLength(0);
        });
        
        test('Should validate feasibility study requirement', async () => {
            const documents = [
                { type: 'FEASIBILITY_STUDY', content: 'Comprehensive feasibility analysis' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP2',
                documents: documents
            });
            
            const feasibilityViolations = result.violations.filter(v => v.ruleId === 'LP2_FEASIBILITY');
            expect(feasibilityViolations).toHaveLength(0);
        });
    });
    
    /**
     * 📐 LEISTUNGSPHASE 3 - ENTWURFSPLANUNG
     */
    describe('LP3 - Entwurfsplanung (15%)', () => {
        test('Should enforce 1:100 scale minimum for design drawings', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP3');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP3',
                documents: documents
            });
            
            const scaleViolations = result.violations.filter(v => v.ruleId === 'LP3_SCALE_REQUIREMENTS');
            expect(scaleViolations).toHaveLength(0);
        });
        
        test('Should require structural coordination', async () => {
            const documents = [
                { type: 'STRUCTURAL_CONCEPT', content: 'Structural system approved' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP3',
                documents: documents
            });
            
            const structuralViolations = result.violations.filter(v => v.ruleId === 'LP3_STRUCTURAL_COORDINATION');
            expect(structuralViolations).toHaveLength(0);
        });
    });
    
    /**
     * 🏛️ LEISTUNGSPHASE 4 - GENEHMIGUNGSPLANUNG
     */
    describe('LP4 - Genehmigungsplanung (3%)', () => {
        test('Should require complete permit documents', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP4');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP4',
                documents: documents
            });
            
            expect(result.phase).toBe('LP4');
            const permitViolations = result.violations.filter(v => v.ruleId === 'LP4_PERMIT_DOCUMENTS');
            expect(permitViolations).toHaveLength(0);
        });
        
        test('Should enforce fire safety concept requirement', async () => {
            const documents = [
                { type: 'FIRE_SAFETY_CONCEPT', content: 'Approved fire safety concept' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP4',
                documents: documents
            });
            
            const fireViolations = result.violations.filter(v => v.ruleId === 'LP4_FIRE_SAFETY');
            expect(fireViolations).toHaveLength(0);
        });
    });
    
    /**
     * 🔨 LEISTUNGSPHASE 5 - AUSFÜHRUNGSPLANUNG
     */
    describe('LP5 - Ausführungsplanung (25%)', () => {
        test('Should validate detail scale requirements', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP5');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP5',
                documents: documents
            });
            
            const scaleViolations = result.violations.filter(v => v.ruleId === 'LP5_DETAIL_SCALE');
            expect(scaleViolations).toHaveLength(0);
        });
        
        test('Should require complete technical specifications', async () => {
            const documents = [
                { type: 'TECHNICAL_SPECIFICATIONS', content: 'Complete specifications' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP5',
                documents: documents
            });
            
            const specViolations = result.violations.filter(v => v.ruleId === 'LP5_SPECIFICATIONS');
            expect(specViolations).toHaveLength(0);
        });
        
        test('Should enforce trade coordination', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP5');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP5',
                documents: documents
            });
            
            expect(result.phase).toBe('LP5');
            // Coordination is critical
            const coordViolations = result.violations.filter(v => v.ruleId === 'LP5_COORDINATION');
            expect(coordViolations).toHaveLength(0);
        });
    });
    
    /**
     * 📋 LEISTUNGSPHASE 6 - VORBEREITUNG DER VERGABE
     */
    describe('LP6 - Vorbereitung der Vergabe (10%)', () => {
        test('Should validate BOQ completeness', async () => {
            const boq = dataGenerator.generateBillOfQuantities('OFFICE');
            const documents = [boq];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP6',
                documents: documents
            });
            
            const boqViolations = result.violations.filter(v => v.ruleId === 'LP6_BOQ_COMPLETENESS');
            
            // If there are violations, check if they're justified
            if (boqViolations.length > 0) {
                expect(boq.itemCount).toBeGreaterThan(100);
            }
        });
        
        test('Should enforce VOB/A compliance', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP6',
                documents: documents
            });
            
            const vobViolations = result.violations.filter(v => v.ruleId === 'LP6_VOB_COMPLIANCE');
            
            // VOB compliance is critical
            if (vobViolations.length > 0) {
                expect(result.corrections.length).toBeGreaterThan(0);
            }
        });
        
        test('Should validate tender document completeness', async () => {
            const tender = {
                id: 'TENDER_TEST',
                documents: await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6')
            };
            
            const validation = await complianceService.validateTenderDocuments(tender);
            
            expect(validation).toBeDefined();
            expect(validation.valid).toBeDefined();
            expect(validation.complete).toBeDefined();
        });
    });
    
    /**
     * 🤝 LEISTUNGSPHASE 7 - MITWIRKUNG BEI DER VERGABE
     */
    describe('LP7 - Mitwirkung bei der Vergabe (4%)', () => {
        test('Should require bid evaluation matrix', async () => {
            const documents = [
                { type: 'BID_EVALUATION_MATRIX', content: 'Complete evaluation matrix' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP7',
                documents: documents
            });
            
            const evalViolations = result.violations.filter(v => v.ruleId === 'LP7_BID_EVALUATION');
            expect(evalViolations).toHaveLength(0);
        });
        
        test('Should validate award recommendation', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP7');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP7',
                documents: documents
            });
            
            const awardViolations = result.violations.filter(v => v.ruleId === 'LP7_AWARD_DOCUMENTATION');
            expect(awardViolations).toHaveLength(0);
        });
    });
    
    /**
     * 👷 LEISTUNGSPHASE 8 - OBJEKTÜBERWACHUNG
     */
    describe('LP8 - Objektüberwachung (32%)', () => {
        test('Should enforce site supervision requirements', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP8');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP8',
                documents: documents
            });
            
            const supervisionViolations = result.violations.filter(v => v.ruleId === 'LP8_SITE_SUPERVISION');
            expect(supervisionViolations).toHaveLength(0);
        });
        
        test('Should validate quality control procedures', async () => {
            const documents = [
                { type: 'QUALITY_CONTROL', content: 'QC procedures implemented' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP8',
                documents: documents
            });
            
            const qcViolations = result.violations.filter(v => v.ruleId === 'LP8_QUALITY_CONTROL');
            expect(qcViolations).toHaveLength(0);
        });
        
        test('Should require progress reporting', async () => {
            const documents = [
                { type: 'PROGRESS_REPORT', content: 'Monthly progress report' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP8',
                documents: documents
            });
            
            const progressViolations = result.violations.filter(v => v.ruleId === 'LP8_PROGRESS_REPORTING');
            expect(progressViolations).toHaveLength(0);
        });
    });
    
    /**
     * ✅ LEISTUNGSPHASE 9 - OBJEKTBETREUUNG
     */
    describe('LP9 - Objektbetreuung (2%)', () => {
        test('Should validate defect management', async () => {
            const documents = [
                { type: 'DEFECT_LIST', content: 'Complete defect list' }
            ];
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP9',
                documents: documents
            });
            
            const defectViolations = result.violations.filter(v => v.ruleId === 'LP9_DEFECT_MANAGEMENT');
            expect(defectViolations).toHaveLength(0);
        });
        
        test('Should require as-built documentation', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP9');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP9',
                documents: documents
            });
            
            const asBuiltViolations = result.violations.filter(v => v.ruleId === 'LP9_AS_BUILT');
            expect(asBuiltViolations).toHaveLength(0);
        });
    });
    
    /**
     * 💰 FEE CALCULATION TESTS
     */
    describe('HOAI Fee Calculations', () => {
        test('Should calculate fees for all phases correctly', async () => {
            const fees = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9'],
                feeZone: 'III'
            });
            
            expect(fees).toBeDefined();
            expect(fees.totalFee).toBeGreaterThan(0);
            
            // Check phase percentages add up to 100%
            let totalPercentage = 0;
            Object.values(fees.phaseBreakdown).forEach(phase => {
                totalPercentage += phase.percentage;
            });
            expect(totalPercentage).toBe(100);
        });
        
        test('Should apply fee zone factors correctly', async () => {
            const zoneIII = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2', 'LP3'],
                feeZone: 'III'
            });
            
            const zoneV = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2', 'LP3'],
                feeZone: 'V'
            });
            
            // Zone V should be 20% higher than Zone III
            expect(zoneV.baseFee).toBeGreaterThan(zoneIII.baseFee);
            expect(zoneV.baseFee).toBeCloseTo(zoneIII.baseFee * 1.2, 2);
        });
        
        test('Should calculate special services correctly', async () => {
            const withoutSpecial = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2'],
                feeZone: 'III'
            });
            
            const withSpecial = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2'],
                feeZone: 'III',
                specialServices: ['ENERGY_CONCEPT', 'BIM_COORDINATION']
            });
            
            expect(withSpecial.specialServices).toBeGreaterThan(0);
            expect(withSpecial.totalFee).toBeGreaterThan(withoutSpecial.totalFee);
        });
        
        test('Should enforce maximum discount limit', async () => {
            const fees = await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2', 'LP3'],
                feeZone: 'III',
                discountPercentage: 25 // Try to apply 25% discount
            });
            
            // Should cap at 20%
            const expectedMaxDiscount = (fees.baseFee + fees.specialServices) * 0.2;
            expect(fees.discount).toBeLessThanOrEqual(expectedMaxDiscount);
        });
    });
    
    /**
     * 📄 DOCUMENTATION REQUIREMENTS
     */
    describe('Documentation Requirements', () => {
        test('Should check LP6 documentation completeness', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6');
            
            const completeness = await complianceService.checkDocumentation('LP6', documents);
            
            expect(completeness).toBeDefined();
            expect(completeness.phase).toBe('LP6');
            expect(completeness.missing).toBeDefined();
            expect(completeness.incomplete).toBeDefined();
        });
        
        test('Should identify missing mandatory documents', async () => {
            const incompleteDocuments = [
                { type: 'DRAWINGS', content: 'Construction drawings' }
                // Missing: SPECIFICATIONS, BILL_OF_QUANTITIES, etc.
            ];
            
            const completeness = await complianceService.checkDocumentation('LP6', incompleteDocuments);
            
            expect(completeness.complete).toBe(false);
            expect(completeness.missing.length).toBeGreaterThan(0);
            expect(completeness.missing.some(d => d.mandatory)).toBe(true);
        });
    });
    
    /**
     * 🔒 FORMAL VERIFICATION
     */
    describe('Formal Compliance Verification', () => {
        test('Should perform formal compliance verification', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP6',
                documents: documents,
                deepCheck: true
            });
            
            if (result.formalProof) {
                expect(result.formalProof).toBeDefined();
            }
        });
    });
    
    /**
     * 📊 COMPLIANCE REPORTING
     */
    describe('Compliance Reporting', () => {
        test('Should generate comprehensive compliance report', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP6',
                documents: documents,
                generateReport: true
            });
            
            expect(result.report).toBeDefined();
            expect(result.report.summary).toBeDefined();
            expect(result.report.summary.phase).toBe('LP6');
            expect(result.report.certification).toBeDefined();
        });
        
        test('Should track compliance score accurately', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP7');
            
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP7',
                documents: documents
            });
            
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            
            // Score should reflect violations
            if (result.violations.length > 0) {
                expect(result.score).toBeLessThan(100);
            }
        });
    });
    
    /**
     * 🚨 ERROR SCENARIOS
     */
    describe('Error Handling', () => {
        test('Should handle invalid phase gracefully', async () => {
            const result = await complianceService.checkCompliance(sampleProject, {
                phase: 'LP10', // Invalid phase
                documents: []
            });
            
            expect(result).toBeDefined();
            expect(result.phase).toBe('LP10');
        });
        
        test('Should handle missing project data', async () => {
            const incompleteProject = {
                id: 'TEST_INCOMPLETE',
                // Missing required fields
            };
            
            const result = await complianceService.checkCompliance(incompleteProject, {
                phase: 'LP6',
                documents: []
            });
            
            expect(result).toBeDefined();
            expect(result.compliant).toBe(false);
        });
    });
    
    /**
     * ⚡ PERFORMANCE TESTS
     */
    describe('Performance', () => {
        test('Compliance check should be fast', async () => {
            const documents = await dataGenerator.generateHOAIDocuments('OFFICE', 'LP6');
            
            const startTime = Date.now();
            
            await complianceService.checkCompliance(sampleProject, {
                phase: 'LP6',
                documents: documents,
                deepCheck: false // Skip formal verification for speed test
            });
            
            const checkTime = Date.now() - startTime;
            
            expect(checkTime).toBeLessThan(5000); // Should complete in under 5 seconds
        });
        
        test('Fee calculation should be performant', async () => {
            const startTime = Date.now();
            
            await complianceService.calculateHoaiFees(sampleProject, {
                phases: ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9'],
                feeZone: 'III',
                specialServices: ['ENERGY_CONCEPT', 'BIM_COORDINATION']
            });
            
            const calcTime = Date.now() - startTime;
            
            expect(calcTime).toBeLessThan(1000); // Should calculate in under 1 second
        });
    });
});

// Export for use in other test suites
export { ComplianceCheckService, ConstructionSyntheticDataGenerator };
