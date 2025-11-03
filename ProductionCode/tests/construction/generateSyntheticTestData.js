/**
 * 🏗️ SYNTHETIC CONSTRUCTION TEST DATA GENERATOR
 * ==============================================
 * 
 * Generates synthetic construction plans and test data for
 * comprehensive testing of the Construction Syndicate
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SyntheticTestDataGenerator {
    constructor(config = {}) {
        this.config = {
            outputDir: config.outputDir || path.join(__dirname, '../../test-data/construction'),
            projectCount: config.projectCount || 3,
            plansPerProject: config.plansPerProject || 5,
            errorRate: config.errorRate || 0.15, // 15% of plans will have intentional errors
            includeGroundTruth: config.includeGroundTruth !== false,
            ...config
        };
        
        this.projectTypes = ['residential', 'commercial', 'industrial', 'mixed_use'];
        this.buildingTypes = ['apartment', 'office', 'warehouse', 'retail', 'hotel'];
        this.planTypes = ['floor_plan', 'elevation', 'section', 'detail', 'site_plan'];
        
        console.log('🏗️ Synthetic Test Data Generator initialized');
    }
    
    /**
     * 🚀 GENERATE ALL TEST DATA
     * =========================
     */
    async generateAllTestData() {
        console.log('\n🚀 GENERATING SYNTHETIC CONSTRUCTION TEST DATA');
        console.log('='.repeat(70));
        console.log(`📊 Configuration:`);
        console.log(`   Projects: ${this.config.projectCount}`);
        console.log(`   Plans per project: ${this.config.plansPerProject}`);
        console.log(`   Error rate: ${(this.config.errorRate * 100).toFixed(0)}%`);
        console.log(`   Output directory: ${this.config.outputDir}`);
        console.log('='.repeat(70));
        
        try {
            // Create directory structure
            await this.createDirectoryStructure();
            
            // Generate HOAI standards reference
            await this.generateHOAIStandards();
            
            // Generate projects
            for (let i = 1; i <= this.config.projectCount; i++) {
                await this.generateProject(i);
            }
            
            console.log('\n✅ SYNTHETIC TEST DATA GENERATION COMPLETE');
            console.log(`📁 Output location: ${this.config.outputDir}`);
            
        } catch (error) {
            console.error('❌ Failed to generate test data:', error);
            throw error;
        }
    }
    
    /**
     * 📁 CREATE DIRECTORY STRUCTURE
     * =============================
     */
    async createDirectoryStructure() {
        console.log('\n📁 Creating directory structure...');
        
        const directories = [
            '',
            'sample_projects',
            'hoai_standards',
            'ground_truth',
            'ground_truth/quantities',
            'ground_truth/errors',
            'ground_truth/compliance',
            'synthetic',
            'synthetic/generated_plans'
        ];
        
        for (const dir of directories) {
            const dirPath = path.join(this.config.outputDir, dir);
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`   ✅ Created: ${dirPath}`);
        }
    }
    
    /**
     * 📜 GENERATE HOAI STANDARDS REFERENCE
     * ====================================
     */
    async generateHOAIStandards() {
        console.log('\n📜 Generating HOAI standards reference...');
        
        // LP 6 Requirements
        const lp6Requirements = {
            phase: 'lp6',
            name: 'Ausschreibung (Tendering)',
            description: 'Preparation of tender documents and invitation to bid',
            requiredDocuments: [
                'tender_invitation',
                'bill_of_quantities',
                'technical_specifications',
                'contract_terms',
                'project_schedule',
                'cost_estimate',
                'site_information'
            ],
            regulations: {
                VOB_A: {
                    required: true,
                    description: 'Vergabe- und Vertragsordnung für Bauleistungen Teil A',
                    sections: ['§1', '§2', '§3', '§7', '§8']
                },
                VOB_B: {
                    required: true,
                    description: 'Allgemeine Vertragsbedingungen für die Ausführung von Bauleistungen',
                    sections: ['§1', '§2', '§4', '§5']
                },
                DIN_276: {
                    required: true,
                    description: 'Kosten im Bauwesen',
                    costCategories: ['300', '400', '500', '600', '700']
                },
                DIN_277: {
                    required: true,
                    description: 'Grundflächen und Rauminhalte',
                    areas: ['gross_floor_area', 'net_floor_area', 'usable_area']
                }
            },
            minimumCompleteness: 0.95,
            qualityStandards: ['ISO_19650', 'DIN_EN_ISO_7200'],
            feeRange: {
                min: 0.10,
                max: 0.12,
                description: 'Percentage of estimated construction cost'
            }
        };
        
        // LP 7 Requirements
        const lp7Requirements = {
            phase: 'lp7',
            name: 'Vergabe (Contract Award)',
            description: 'Evaluation of bids and contract awarding',
            requiredDocuments: [
                'bid_evaluation_report',
                'price_comparison',
                'award_recommendation',
                'contract_award_documentation',
                'notification_to_bidders'
            ],
            regulations: {
                VOB_A: {
                    required: true,
                    description: 'Award procedures',
                    sections: ['§16', '§19', '§20', '§24']
                },
                GWB: {
                    required: true,
                    description: 'Gesetz gegen Wettbewerbsbeschränkungen',
                    sections: ['§97', '§99', '§100', '§107']
                }
            },
            evaluationCriteria: [
                'price',
                'quality',
                'timeline',
                'experience',
                'references',
                'technical_capability'
            ],
            minimumCompleteness: 0.98,
            qualityStandards: ['ISO_19650', 'VOB_A_compliance'],
            feeRange: {
                min: 0.03,
                max: 0.04,
                description: 'Percentage of estimated construction cost'
            }
        };
        
        // Write files
        await fs.writeFile(
            path.join(this.config.outputDir, 'hoai_standards', 'lp6_requirements.json'),
            JSON.stringify(lp6Requirements, null, 2),
            'utf8'
        );
        
        await fs.writeFile(
            path.join(this.config.outputDir, 'hoai_standards', 'lp7_requirements.json'),
            JSON.stringify(lp7Requirements, null, 2),
            'utf8'
        );
        
        console.log('   ✅ Generated HOAI LP 6 requirements');
        console.log('   ✅ Generated HOAI LP 7 requirements');
    }
    
    /**
     * 🏗️ GENERATE SINGLE PROJECT
     * ==========================
     */
    async generateProject(projectIndex) {
        const projectId = `project_${String(projectIndex).padStart(3, '0')}`;
        const projectType = this.projectTypes[projectIndex % this.projectTypes.length];
        const buildingType = this.buildingTypes[projectIndex % this.buildingTypes.length];
        
        console.log(`\n🏗️ Generating Project ${projectIndex}: ${projectId}`);
        console.log(`   Type: ${projectType} - ${buildingType}`);
        
        const projectDir = path.join(this.config.outputDir, 'sample_projects', projectId);
        await fs.mkdir(projectDir, { recursive: true });
        
        // Generate project metadata
        const projectMetadata = this.generateProjectMetadata(projectId, projectType, buildingType);
        await fs.writeFile(
            path.join(projectDir, 'project_metadata.json'),
            JSON.stringify(projectMetadata, null, 2),
            'utf8'
        );
        
        // Generate plans
        const plans = [];
        for (let i = 0; i < this.config.plansPerProject; i++) {
            const plan = await this.generatePlan(projectId, projectDir, i, projectMetadata);
            plans.push(plan);
        }
        
        // Generate ground truth data
        if (this.config.includeGroundTruth) {
            await this.generateGroundTruthQuantities(projectId, projectMetadata, plans);
            await this.generateGroundTruthErrors(projectId, plans);
            await this.generateGroundTruthCompliance(projectId, projectMetadata);
        }
        
        console.log(`   ✅ Project ${projectId} complete`);
    }
    
    /**
     * 📋 GENERATE PROJECT METADATA
     * ============================
     */
    generateProjectMetadata(projectId, projectType, buildingType) {
        const floors = Math.floor(Math.random() * 10) + 2;
        const unitsPerFloor = Math.floor(Math.random() * 8) + 2;
        const totalArea = (Math.random() * 5000 + 500).toFixed(2);
        
        return {
            projectId,
            projectName: `${buildingType.charAt(0).toUpperCase() + buildingType.slice(1)} Building ${projectId}`,
            projectType,
            buildingType,
            location: {
                city: 'Berlin',
                district: 'Mitte',
                address: `Test Street ${projectId}`,
                coordinates: {
                    lat: 52.520008 + (Math.random() - 0.5) * 0.1,
                    lng: 13.404954 + (Math.random() - 0.5) * 0.1
                }
            },
            dimensions: {
                floors,
                unitsPerFloor,
                totalUnits: floors * unitsPerFloor,
                grossFloorArea: parseFloat(totalArea),
                netFloorArea: parseFloat(totalArea) * 0.85,
                height: floors * 3.0
            },
            costs: {
                estimated: parseFloat((totalArea * (Math.random() * 500 + 1500)).toFixed(2)),
                currency: 'EUR',
                costPerSqm: parseFloat((Math.random() * 500 + 1500).toFixed(2))
            },
            timeline: {
                planningStart: '2024-01-01',
                constructionStart: '2024-06-01',
                completionTarget: '2025-12-31',
                duration: '18 months'
            },
            hoaiPhases: ['lp6', 'lp7'],
            generatedAt: new Date().toISOString()
        };
    }
    
    /**
     * 📐 GENERATE SINGLE PLAN
     * =======================
     */
    async generatePlan(projectId, projectDir, planIndex, projectMetadata) {
        const planType = this.planTypes[planIndex % this.planTypes.length];
        const planId = `${projectId}_${planType}_${String(planIndex + 1).padStart(2, '0')}`;
        
        // Randomly introduce errors
        const hasError = Math.random() < this.config.errorRate;
        
        const planData = {
            planId,
            projectId,
            planType,
            fileName: `${planId}.txt`, // Placeholder - in real implementation would be PDF/DWG
            dimensions: this.generatePlanDimensions(planType, projectMetadata, hasError),
            elements: this.generatePlanElements(planType, projectMetadata),
            hasIntentionalError: hasError,
            errorDetails: hasError ? this.generateIntentionalError(planType) : null,
            metadata: {
                scale: '1:100',
                format: 'A1',
                revision: 'R01',
                date: '2024-01-15',
                drawnBy: 'Synthetic Generator'
            }
        };
        
        // Write plan data (placeholder text file)
        await fs.writeFile(
            path.join(projectDir, `${planId}.txt`),
            `SYNTHETIC CONSTRUCTION PLAN
Project: ${projectMetadata.projectName}
Plan Type: ${planType}
Plan ID: ${planId}

${JSON.stringify(planData, null, 2)}

Note: This is a synthetic test plan generated for testing purposes.
In production, this would be an actual PDF/DWG file with visual content.
`,
            'utf8'
        );
        
        console.log(`   📐 Generated plan: ${planId} ${hasError ? '(with error)' : ''}`);
        
        return planData;
    }
    
    /**
     * 📏 GENERATE PLAN DIMENSIONS
     * ===========================
     */
    generatePlanDimensions(planType, projectMetadata, hasError) {
        const baseWidth = 15 + Math.random() * 20;
        const baseHeight = 10 + Math.random() * 15;
        
        // Introduce dimensional errors if hasError is true
        const errorFactor = hasError ? (1 + (Math.random() - 0.5) * 0.1) : 1;
        
        return {
            width: parseFloat((baseWidth * errorFactor).toFixed(2)),
            height: parseFloat((baseHeight * errorFactor).toFixed(2)),
            unit: 'm',
            area: parseFloat((baseWidth * baseHeight * errorFactor).toFixed(2))
        };
    }
    
    /**
     * 🏢 GENERATE PLAN ELEMENTS
     * =========================
     */
    generatePlanElements(planType, projectMetadata) {
        if (planType === 'floor_plan') {
            return {
                rooms: Math.floor(Math.random() * 6) + 3,
                doors: Math.floor(Math.random() * 8) + 4,
                windows: Math.floor(Math.random() * 12) + 6,
                walls: Math.floor(Math.random() * 20) + 10,
                stairs: Math.floor(Math.random() * 2) + 1
            };
        } else if (planType === 'elevation') {
            return {
                windows: Math.floor(Math.random() * 15) + 8,
                doors: Math.floor(Math.random() * 3) + 1,
                floors: projectMetadata.dimensions.floors,
                height: projectMetadata.dimensions.height
            };
        } else {
            return {
                elementCount: Math.floor(Math.random() * 20) + 10
            };
        }
    }
    
    /**
     * ⚠️ GENERATE INTENTIONAL ERROR
     * =============================
     */
    generateIntentionalError(planType) {
        const errorTypes = [
            'dimension_mismatch',
            'missing_element',
            'scale_inconsistency',
            'material_conflict',
            'missing_reference'
        ];
        
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        return {
            type: errorType,
            severity: Math.random() > 0.5 ? 'critical' : 'high',
            description: `Intentional ${errorType} for testing error detection`,
            location: {
                page: 1,
                coordinates: [
                    Math.floor(Math.random() * 500),
                    Math.floor(Math.random() * 500)
                ]
            }
        };
    }
    
    /**
     * 📊 GENERATE GROUND TRUTH QUANTITIES
     * ===================================
     */
    async generateGroundTruthQuantities(projectId, projectMetadata, plans) {
        const quantities = {
            projectId,
            projectName: projectMetadata.projectName,
            quantities: {
                concrete: {
                    value: parseFloat((projectMetadata.dimensions.grossFloorArea * 0.3).toFixed(2)),
                    unit: 'm³',
                    category: 'structural'
                },
                steel: {
                    value: parseFloat((projectMetadata.dimensions.grossFloorArea * 50).toFixed(2)),
                    unit: 'kg',
                    category: 'structural'
                },
                bricks: {
                    value: Math.floor(projectMetadata.dimensions.grossFloorArea * 120),
                    unit: 'pieces',
                    category: 'masonry'
                },
                windows: {
                    value: plans.reduce((sum, plan) => sum + (plan.elements.windows || 0), 0),
                    unit: 'pieces',
                    category: 'finishes'
                },
                doors: {
                    value: plans.reduce((sum, plan) => sum + (plan.elements.doors || 0), 0),
                    unit: 'pieces',
                    category: 'finishes'
                },
                paint: {
                    value: parseFloat((projectMetadata.dimensions.grossFloorArea * 2.5).toFixed(2)),
                    unit: 'm²',
                    category: 'finishes'
                },
                flooring: {
                    value: parseFloat((projectMetadata.dimensions.netFloorArea * 0.85).toFixed(2)),
                    unit: 'm²',
                    category: 'finishes'
                }
            },
            totalEstimatedCost: projectMetadata.costs.estimated,
            boqReference: `${projectId}_boq.xlsx`,
            validatedBy: 'synthetic_generator',
            validationMethod: 'algorithmic_calculation',
            confidenceLevel: 0.95,
            date: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(this.config.outputDir, 'ground_truth', 'quantities', `${projectId}.json`),
            JSON.stringify(quantities, null, 2),
            'utf8'
        );
        
        console.log(`   📊 Generated ground truth quantities`);
    }
    
    /**
     * ⚠️ GENERATE GROUND TRUTH ERRORS
     * ===============================
     */
    async generateGroundTruthErrors(projectId, plans) {
        const knownErrors = plans
            .filter(plan => plan.hasIntentionalError)
            .map((plan, index) => ({
                errorId: `err_${projectId}_${String(index + 1).padStart(3, '0')}`,
                planId: plan.planId,
                type: plan.errorDetails.type,
                description: plan.errorDetails.description,
                severity: plan.errorDetails.severity,
                affectedPlans: [plan.planId],
                location: plan.errorDetails.location,
                correctSolution: `Apply standard correction for ${plan.errorDetails.type}`,
                detectedBy: 'synthetic_generator',
                date: new Date().toISOString()
            }));
        
        const errorData = {
            projectId,
            totalErrors: knownErrors.length,
            knownErrors,
            generatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(this.config.outputDir, 'ground_truth', 'errors', `${projectId}.json`),
            JSON.stringify(errorData, null, 2),
            'utf8'
        );
        
        console.log(`   ⚠️ Generated ground truth errors: ${knownErrors.length} errors`);
    }
    
    /**
     * ✅ GENERATE GROUND TRUTH COMPLIANCE
     * ===================================
     */
    async generateGroundTruthCompliance(projectId, projectMetadata) {
        // Randomly make some projects non-compliant for testing
        const compliant = Math.random() > 0.2; // 80% compliant
        
        const violations = compliant ? [] : [
            {
                violationId: `viol_${projectId}_001`,
                standard: 'VOB/A',
                section: '§3',
                description: 'Incomplete tender invitation documentation',
                severity: 'medium',
                remediation: 'Add missing documentation sections'
            }
        ];
        
        const complianceData = {
            projectId,
            projectName: projectMetadata.projectName,
            hoaiPhase: 'lp6',
            compliant,
            checkedStandards: ['VOB/A', 'VOB/B', 'DIN 276', 'DIN 277'],
            violations,
            completenessScore: compliant ? 1.0 : 0.92,
            qualityScore: compliant ? 0.95 : 0.85,
            validatedBy: 'synthetic_generator',
            validationMethod: 'rule_based_checking',
            date: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(this.config.outputDir, 'ground_truth', 'compliance', `${projectId}.json`),
            JSON.stringify(complianceData, null, 2),
            'utf8'
        );
        
        console.log(`   ✅ Generated ground truth compliance: ${compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const config = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--projects' && args[i + 1]) {
            config.projectCount = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--plans-per-project' && args[i + 1]) {
            config.plansPerProject = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--error-rate' && args[i + 1]) {
            config.errorRate = parseFloat(args[i + 1]);
            i++;
        } else if (args[i] === '--output-dir' && args[i + 1]) {
            config.outputDir = args[i + 1];
            i++;
        }
    }
    
    const generator = new SyntheticTestDataGenerator(config);
    await generator.generateAllTestData();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default SyntheticTestDataGenerator;

