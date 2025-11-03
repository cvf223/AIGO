// implementation.js - /hoai Command Implementation
import { HOAICalculator } from '../../../../src/compliance/HOAICalculator.js';
import { HOAIValidator } from '../../../../src/compliance/HOAIValidator.js';
import { DatabasePoolManager } from '../../../../src/core/DatabasePoolManager.js';
import { ServiceRegistry } from '../../../../src/core/ServiceRegistry.js';

export class HOAICommand {
    constructor() {
        this.calculator = new HOAICalculator();
        this.validator = new HOAIValidator();
        this.dbPool = DatabasePoolManager.getInstance();
        this.registry = ServiceRegistry.getInstance();
    }
    
    async initialize() {
        console.log('Initializing HOAI Command...');
        
        // Register with service registry
        await this.registry.register('HOAICommand', this);
        
        // Load HOAI configuration
        await this.loadHOAIConfig();
    }
    
    async execute(params) {
        const { action, phase, projectId } = params;
        
        console.log(`\n📋 Executing /hoai command: ${action}`);
        
        try {
            switch (action) {
                case 'check':
                    return await this.checkCompliance(phase, projectId);
                    
                case 'calculate':
                    return await this.calculateFees(projectId, phase);
                    
                case 'validate':
                    return await this.validateDocumentation(projectId, phase);
                    
                case 'report':
                    return await this.generateComplianceReport(projectId);
                    
                default:
                    return {
                        success: false,
                        error: `Unknown action: ${action}`,
                        validActions: ['check', 'calculate', 'validate', 'report']
                    };
            }
        } catch (error) {
            console.error('HOAI command failed:', error);
            return {
                success: false,
                error: error.message,
                suggestion: 'Check project data and phase validity'
            };
        }
    }
    
    async checkCompliance(phase, projectId) {
        console.log(`Checking HOAI compliance for phase ${phase}`);
        
        // Get project data if projectId provided
        let projectData = null;
        if (projectId) {
            projectData = await this.getProjectData(projectId);
        }
        
        // Validate phase
        const phaseValidation = await this.validator.validatePhase(phase, projectData);
        
        // Check requirements
        const requirements = await this.getPhaseRequirements(phase);
        
        // Check documentation
        const documentStatus = await this.checkPhaseDocuments(phase, projectId);
        
        // Check deliverables
        const deliverables = await this.checkPhaseDeliverables(phase, projectId);
        
        // Calculate compliance score
        const complianceScore = this.calculateComplianceScore({
            phaseValidation,
            documentStatus,
            deliverables
        });
        
        return {
            success: true,
            phase,
            compliant: complianceScore >= 0.95,
            complianceScore,
            details: {
                phaseValid: phaseValidation.valid,
                phaseDescription: this.getPhaseDescription(phase),
                requirements: requirements,
                documentStatus: documentStatus,
                deliverables: deliverables,
                missingItems: this.identifyMissingItems(documentStatus, deliverables),
                recommendations: this.generateRecommendations(complianceScore, phase)
            },
            nextSteps: this.getNextSteps(phase, complianceScore)
        };
    }
    
    async calculateFees(projectId, phase) {
        console.log(`Calculating HOAI fees for project ${projectId}, phase ${phase}`);
        
        // Get project data
        const project = await this.getProjectData(projectId);
        if (!project) {
            return {
                success: false,
                error: 'Project not found',
                suggestion: 'Verify project ID'
            };
        }
        
        // Calculate base fee
        const baseFee = await this.calculator.calculateBaseFee({
            constructionCost: project.constructionCost,
            difficultyLevel: project.difficultyLevel || 'III',
            zone: project.zone || 'IV'
        });
        
        // Calculate phase percentage
        const phasePercentage = this.getPhasePercentage(phase);
        
        // Calculate phase fee
        const phaseFee = baseFee * (phasePercentage / 100);
        
        // Apply modifiers
        const modifiers = await this.calculateModifiers(project, phase);
        const adjustedFee = phaseFee * modifiers.totalMultiplier;
        
        // Generate breakdown
        const breakdown = {
            baseFee,
            phasePercentage,
            phaseFee,
            modifiers: modifiers.details,
            adjustedFee,
            vat: adjustedFee * 0.19, // German VAT
            totalWithVAT: adjustedFee * 1.19
        };
        
        // Store calculation
        await this.storeCalculation(projectId, phase, breakdown);
        
        return {
            success: true,
            projectId,
            phase,
            calculation: {
                constructionCost: project.constructionCost,
                difficultyLevel: project.difficultyLevel,
                baseFee: this.formatCurrency(baseFee),
                phasePercentage: `${phasePercentage}%`,
                phaseFee: this.formatCurrency(phaseFee),
                adjustments: modifiers.summary,
                finalFee: this.formatCurrency(adjustedFee),
                vatAmount: this.formatCurrency(breakdown.vat),
                totalIncludingVAT: this.formatCurrency(breakdown.totalWithVAT)
            },
            breakdown,
            documentation: this.generateFeeDocumentation(project, phase, breakdown),
            legalNotes: this.getHOAILegalNotes(phase)
        };
    }
    
    async validateDocumentation(projectId, phase) {
        console.log(`Validating documentation for project ${projectId}, phase ${phase}`);
        
        // Get required documents for phase
        const requiredDocs = this.getRequiredDocuments(phase);
        
        // Check existing documents
        const existingDocs = await this.getProjectDocuments(projectId, phase);
        
        // Validate each document
        const validationResults = await Promise.all(
            requiredDocs.map(async (docType) => {
                const doc = existingDocs.find(d => d.type === docType);
                return await this.validateDocument(doc, docType, phase);
            })
        );
        
        // Calculate validation score
        const validDocs = validationResults.filter(r => r.valid).length;
        const validationScore = validDocs / requiredDocs.length;
        
        return {
            success: true,
            projectId,
            phase,
            valid: validationScore === 1,
            validationScore,
            results: {
                totalRequired: requiredDocs.length,
                validated: validDocs,
                missing: requiredDocs.length - existingDocs.length,
                invalid: validationResults.filter(r => !r.valid).length
            },
            documentStatus: validationResults.map(r => ({
                type: r.docType,
                status: r.valid ? '✅ Valid' : r.exists ? '⚠️ Invalid' : '❌ Missing',
                issues: r.issues || [],
                requirements: r.requirements
            })),
            recommendations: this.generateDocumentRecommendations(validationResults, phase),
            templates: this.getDocumentTemplates(
                validationResults.filter(r => !r.valid).map(r => r.docType)
            )
        };
    }
    
    async generateComplianceReport(projectId) {
        console.log(`Generating comprehensive HOAI compliance report for project ${projectId}`);
        
        const project = await this.getProjectData(projectId);
        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            };
        }
        
        // Check all phases
        const phaseReports = await Promise.all(
            ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9']
                .filter(phase => this.isPhaseApplicable(phase, project))
                .map(async (phase) => ({
                    phase,
                    compliance: await this.checkCompliance(phase, projectId),
                    fees: await this.calculateFees(projectId, phase),
                    documentation: await this.validateDocumentation(projectId, phase)
                }))
        );
        
        // Generate summary
        const summary = {
            projectName: project.name,
            currentPhase: project.currentPhase,
            overallCompliance: this.calculateOverallCompliance(phaseReports),
            totalFees: this.calculateTotalFees(phaseReports),
            criticalIssues: this.identifyCriticalIssues(phaseReports),
            upcomingDeadlines: await this.getUpcomingDeadlines(projectId)
        };
        
        // Format report
        const report = this.formatComplianceReport({
            project,
            summary,
            phaseReports,
            generatedAt: new Date()
        });
        
        // Store report
        await this.storeComplianceReport(projectId, report);
        
        return {
            success: true,
            projectId,
            report,
            summary,
            exportFormats: {
                markdown: `/reports/hoai-compliance-${projectId}.md`,
                pdf: `/reports/hoai-compliance-${projectId}.pdf`,
                html: `/reports/hoai-compliance-${projectId}.html`
            },
            actions: this.generateActionItems(phaseReports)
        };
    }
    
    // Helper Methods
    
    async loadHOAIConfig() {
        // Load HOAI configuration from database or config files
        this.config = {
            phases: {
                'LP1': { name: 'Grundlagenermittlung', percentage: 2 },
                'LP2': { name: 'Vorplanung', percentage: 7 },
                'LP3': { name: 'Entwurfsplanung', percentage: 15 },
                'LP4': { name: 'Genehmigungsplanung', percentage: 3 },
                'LP5': { name: 'Ausführungsplanung', percentage: 25 },
                'LP6': { name: 'Vorbereitung der Vergabe', percentage: 10 },
                'LP7': { name: 'Mitwirkung bei der Vergabe', percentage: 4 },
                'LP8': { name: 'Objektüberwachung', percentage: 32 },
                'LP9': { name: 'Objektbetreuung', percentage: 2 }
            },
            difficultyLevels: ['I', 'II', 'III', 'IV', 'V'],
            zones: ['I', 'II', 'III', 'IV', 'V']
        };
    }
    
    async getProjectData(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM projects
                WHERE id = $1
            `, [projectId]);
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }
    
    getPhaseDescription(phase) {
        return this.config.phases[phase]?.name || 'Unknown phase';
    }
    
    getPhasePercentage(phase) {
        return this.config.phases[phase]?.percentage || 0;
    }
    
    async getPhaseRequirements(phase) {
        // Phase-specific requirements
        const requirements = {
            'LP1': [
                'Project scope definition',
                'Site analysis',
                'Budget estimation',
                'Timeline planning'
            ],
            'LP2': [
                'Preliminary design concepts',
                'Feasibility study',
                'Cost estimation ±30%',
                'Basic project schedule'
            ],
            'LP3': [
                'Design development',
                'System integration planning',
                'Cost estimation ±20%',
                'Detailed drawings'
            ],
            'LP4': [
                'Building permit documents',
                'Authority approvals',
                'Environmental assessments',
                'Fire safety concept'
            ],
            'LP5': [
                'Construction documents',
                'Detailed specifications',
                'Material selections',
                'Construction details'
            ],
            'LP6': [
                'Tender documents',
                'Bill of quantities',
                'Technical specifications',
                'Contract templates'
            ],
            'LP7': [
                'Bid evaluation',
                'Contractor recommendations',
                'Contract negotiations',
                'Award documentation'
            ],
            'LP8': [
                'Construction supervision',
                'Quality control',
                'Progress monitoring',
                'Issue resolution'
            ],
            'LP9': [
                'Defect documentation',
                'Warranty management',
                'As-built documentation',
                'Operation manuals'
            ]
        };
        
        return requirements[phase] || [];
    }
    
    async checkPhaseDocuments(phase, projectId) {
        if (!projectId) {
            return { complete: false, documents: [] };
        }
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    document_type,
                    status,
                    last_updated,
                    validation_status
                FROM project_documents
                WHERE project_id = $1 AND phase = $2
            `, [projectId, phase]);
            
            const requiredDocs = this.getRequiredDocuments(phase);
            const existingDocs = result.rows;
            
            return {
                complete: requiredDocs.every(docType => 
                    existingDocs.some(doc => 
                        doc.document_type === docType && 
                        doc.validation_status === 'approved'
                    )
                ),
                documents: requiredDocs.map(docType => {
                    const doc = existingDocs.find(d => d.document_type === docType);
                    return {
                        type: docType,
                        status: doc ? doc.status : 'missing',
                        validated: doc?.validation_status === 'approved',
                        lastUpdated: doc?.last_updated
                    };
                })
            };
        } finally {
            client.release();
        }
    }
    
    async checkPhaseDeliverables(phase, projectId) {
        const deliverables = this.getPhaseDeliverables(phase);
        
        if (!projectId) {
            return deliverables.map(d => ({
                ...d,
                completed: false,
                completionDate: null
            }));
        }
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    deliverable_name,
                    completed,
                    completion_date,
                    approved_by
                FROM project_deliverables
                WHERE project_id = $1 AND phase = $2
            `, [projectId, phase]);
            
            const completedDeliverables = result.rows;
            
            return deliverables.map(deliverable => {
                const completed = completedDeliverables.find(
                    d => d.deliverable_name === deliverable.name
                );
                
                return {
                    ...deliverable,
                    completed: completed?.completed || false,
                    completionDate: completed?.completion_date,
                    approvedBy: completed?.approved_by
                };
            });
        } finally {
            client.release();
        }
    }
    
    getPhaseDeliverables(phase) {
        const deliverables = {
            'LP1': [
                { name: 'Scope Statement', required: true },
                { name: 'Site Analysis Report', required: true },
                { name: 'Initial Budget Estimate', required: true }
            ],
            'LP2': [
                { name: 'Concept Drawings', required: true },
                { name: 'Preliminary Cost Estimate', required: true },
                { name: 'Project Schedule', required: true }
            ],
            'LP3': [
                { name: 'Design Drawings', required: true },
                { name: 'System Coordination', required: true },
                { name: 'Updated Cost Estimate', required: true }
            ],
            // ... more phases
        };
        
        return deliverables[phase] || [];
    }
    
    calculateComplianceScore({ phaseValidation, documentStatus, deliverables }) {
        let score = 0;
        let weights = 0;
        
        // Phase validation (30%)
        if (phaseValidation.valid) {
            score += 0.3;
        }
        weights += 0.3;
        
        // Document completion (40%)
        if (documentStatus.complete) {
            score += 0.4;
        } else {
            const docScore = documentStatus.documents.filter(d => d.validated).length / 
                           documentStatus.documents.length;
            score += 0.4 * docScore;
        }
        weights += 0.4;
        
        // Deliverables (30%)
        const deliverableScore = deliverables.filter(d => d.completed).length / 
                               deliverables.length;
        score += 0.3 * deliverableScore;
        weights += 0.3;
        
        return score / weights;
    }
    
    identifyMissingItems(documentStatus, deliverables) {
        const missing = {
            documents: documentStatus.documents
                .filter(d => !d.validated)
                .map(d => d.type),
            deliverables: deliverables
                .filter(d => d.required && !d.completed)
                .map(d => d.name)
        };
        
        return missing;
    }
    
    generateRecommendations(complianceScore, phase) {
        const recommendations = [];
        
        if (complianceScore < 0.5) {
            recommendations.push({
                priority: 'high',
                action: 'Immediate attention required',
                description: 'Complete missing documents and deliverables urgently'
            });
        }
        
        if (complianceScore < 0.8) {
            recommendations.push({
                priority: 'medium',
                action: 'Review and update documentation',
                description: 'Ensure all phase requirements are properly documented'
            });
        }
        
        // Phase-specific recommendations
        if (phase === 'LP4') {
            recommendations.push({
                priority: 'high',
                action: 'Verify building permit status',
                description: 'Ensure all authority approvals are obtained'
            });
        }
        
        if (phase === 'LP5') {
            recommendations.push({
                priority: 'medium',
                action: 'Coordinate with specialists',
                description: 'Ensure all technical drawings are coordinated'
            });
        }
        
        return recommendations;
    }
    
    getNextSteps(phase, complianceScore) {
        const steps = [];
        
        if (complianceScore >= 0.95) {
            steps.push('Phase completion certificate can be issued');
            steps.push(`Prepare for ${this.getNextPhase(phase)}`);
        } else {
            steps.push('Complete missing requirements');
            steps.push('Schedule compliance review');
        }
        
        return steps;
    }
    
    getNextPhase(currentPhase) {
        const phases = ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9'];
        const currentIndex = phases.indexOf(currentPhase);
        return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : 'Project completion';
    }
    
    async calculateModifiers(project, phase) {
        const modifiers = {
            complexity: 1.0,
            urgency: 1.0,
            specialRequirements: 1.0
        };
        
        // Complexity modifier
        if (project.complexity === 'high') {
            modifiers.complexity = 1.2;
        }
        
        // Urgency modifier
        if (project.fastTrack) {
            modifiers.urgency = 1.15;
        }
        
        // Special requirements
        if (project.specialRequirements?.includes('heritage')) {
            modifiers.specialRequirements *= 1.3;
        }
        
        if (project.specialRequirements?.includes('sustainability')) {
            modifiers.specialRequirements *= 1.1;
        }
        
        const totalMultiplier = Object.values(modifiers).reduce((a, b) => a * b, 1);
        
        return {
            totalMultiplier,
            details: modifiers,
            summary: Object.entries(modifiers)
                .filter(([_, value]) => value !== 1.0)
                .map(([key, value]) => `${key}: ${((value - 1) * 100).toFixed(0)}%`)
        };
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
    
    async storeCalculation(projectId, phase, breakdown) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO hoai_calculations
                (project_id, phase, calculation_data, calculated_at)
                VALUES ($1, $2, $3, NOW())
            `, [projectId, phase, JSON.stringify(breakdown)]);
        } finally {
            client.release();
        }
    }
    
    generateFeeDocumentation(project, phase, breakdown) {
        return {
            title: `HOAI Fee Calculation - ${project.name} - ${phase}`,
            sections: [
                {
                    title: 'Project Information',
                    content: {
                        'Project': project.name,
                        'Phase': `${phase} - ${this.getPhaseDescription(phase)}`,
                        'Construction Cost': this.formatCurrency(project.constructionCost),
                        'Difficulty Level': project.difficultyLevel
                    }
                },
                {
                    title: 'Fee Calculation',
                    content: breakdown
                },
                {
                    title: 'Legal Basis',
                    content: 'Calculated according to HOAI 2021, §6-14'
                }
            ]
        };
    }
    
    getHOAILegalNotes(phase) {
        return [
            'Fees calculated according to HOAI 2021 regulations',
            'Subject to approval by relevant authorities',
            'Additional services not included in base fee',
            `Phase ${phase} specific regulations apply`
        ];
    }
    
    getRequiredDocuments(phase) {
        const documents = {
            'LP1': ['Project Brief', 'Site Survey', 'Budget Plan'],
            'LP2': ['Concept Sketches', 'Feasibility Report', 'Cost Estimate'],
            'LP3': ['Design Drawings', 'Material Specifications', 'Cost Calculation'],
            'LP4': ['Permit Application', 'Technical Drawings', 'Authority Forms'],
            'LP5': ['Construction Plans', 'Detail Drawings', 'Specifications'],
            'LP6': ['Tender Documents', 'BOQ', 'Contract Terms'],
            'LP7': ['Bid Analysis', 'Recommendation Report', 'Award Protocol'],
            'LP8': ['Site Reports', 'Quality Checks', 'Progress Documentation'],
            'LP9': ['Defect List', 'Handover Protocol', 'Maintenance Manual']
        };
        
        return documents[phase] || [];
    }
    
    async getProjectDocuments(projectId, phase) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM project_documents
                WHERE project_id = $1 AND phase = $2
            `, [projectId, phase]);
            
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    async validateDocument(doc, docType, phase) {
        if (!doc) {
            return {
                valid: false,
                exists: false,
                docType,
                requirements: this.getDocumentRequirements(docType, phase)
            };
        }
        
        const requirements = this.getDocumentRequirements(docType, phase);
        const issues = [];
        
        // Check completeness
        if (!doc.content || doc.content.length < 100) {
            issues.push('Document appears incomplete');
        }
        
        // Check signatures if required
        if (requirements.requiresSignature && !doc.signed) {
            issues.push('Missing required signature');
        }
        
        // Check format
        if (requirements.format && doc.format !== requirements.format) {
            issues.push(`Wrong format: expected ${requirements.format}`);
        }
        
        return {
            valid: issues.length === 0,
            exists: true,
            docType,
            issues,
            requirements
        };
    }
    
    getDocumentRequirements(docType, phase) {
        // Simplified - would be more detailed in production
        const requirements = {
            'Project Brief': {
                minLength: 1000,
                requiresSignature: true,
                format: 'pdf'
            },
            'Design Drawings': {
                minLength: 0,
                requiresSignature: true,
                format: 'dwg',
                scale: '1:100'
            }
            // ... more document types
        };
        
        return requirements[docType] || {
            minLength: 100,
            requiresSignature: false,
            format: 'any'
        };
    }
    
    generateDocumentRecommendations(validationResults, phase) {
        return validationResults
            .filter(r => !r.valid)
            .map(r => ({
                document: r.docType,
                action: r.exists ? 'Update and revalidate' : 'Create and submit',
                priority: this.getDocumentPriority(r.docType, phase),
                template: `/templates/${phase}/${r.docType.toLowerCase().replace(' ', '-')}`
            }));
    }
    
    getDocumentPriority(docType, phase) {
        // Critical documents for each phase
        const criticalDocs = {
            'LP4': ['Permit Application', 'Authority Forms'],
            'LP5': ['Construction Plans', 'Specifications'],
            'LP6': ['Tender Documents', 'BOQ']
        };
        
        return criticalDocs[phase]?.includes(docType) ? 'high' : 'medium';
    }
    
    getDocumentTemplates(docTypes) {
        return docTypes.map(docType => ({
            type: docType,
            template: `/templates/hoai/${docType.toLowerCase().replace(' ', '-')}.docx`,
            guidelines: `/guidelines/hoai/${docType.toLowerCase().replace(' ', '-')}.md`
        }));
    }
    
    isPhaseApplicable(phase, project) {
        // Some phases might not apply to all projects
        if (phase === 'LP9' && !project.includesMaintenance) {
            return false;
        }
        
        return true;
    }
    
    calculateOverallCompliance(phaseReports) {
        const scores = phaseReports.map(r => r.compliance.complianceScore);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
            score: average,
            rating: average >= 0.95 ? 'Excellent' : 
                   average >= 0.8 ? 'Good' : 
                   average >= 0.6 ? 'Fair' : 'Poor',
            compliantPhases: phaseReports.filter(r => r.compliance.compliant).length,
            totalPhases: phaseReports.length
        };
    }
    
    calculateTotalFees(phaseReports) {
        const total = phaseReports.reduce(
            (sum, report) => sum + (report.fees.breakdown?.adjustedFee || 0), 
            0
        );
        
        return {
            net: this.formatCurrency(total),
            vat: this.formatCurrency(total * 0.19),
            gross: this.formatCurrency(total * 1.19)
        };
    }
    
    identifyCriticalIssues(phaseReports) {
        const issues = [];
        
        phaseReports.forEach(report => {
            if (!report.compliance.compliant) {
                issues.push({
                    phase: report.phase,
                    type: 'compliance',
                    description: `Phase ${report.phase} not compliant`,
                    severity: 'high'
                });
            }
            
            if (report.documentation.results.missing > 0) {
                issues.push({
                    phase: report.phase,
                    type: 'documentation',
                    description: `${report.documentation.results.missing} documents missing`,
                    severity: 'medium'
                });
            }
        });
        
        return issues;
    }
    
    async getUpcomingDeadlines(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    phase,
                    deadline,
                    description
                FROM project_deadlines
                WHERE project_id = $1 
                  AND deadline > NOW()
                  AND deadline < NOW() + INTERVAL '30 days'
                ORDER BY deadline
            `, [projectId]);
            
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    formatComplianceReport({ project, summary, phaseReports, generatedAt }) {
        return `# HOAI Compliance Report

## Project: ${project.name}
**Generated**: ${generatedAt.toLocaleString('de-DE')}
**Current Phase**: ${project.currentPhase}

## Executive Summary
- **Overall Compliance**: ${summary.overallCompliance.rating} (${(summary.overallCompliance.score * 100).toFixed(1)}%)
- **Compliant Phases**: ${summary.overallCompliance.compliantPhases}/${summary.overallCompliance.totalPhases}
- **Total Fees**: ${summary.totalFees.gross}
- **Critical Issues**: ${summary.criticalIssues.length}

## Phase-by-Phase Analysis
${phaseReports.map(report => `
### ${report.phase} - ${this.getPhaseDescription(report.phase)}
- **Compliance**: ${report.compliance.compliant ? '✅ Compliant' : '❌ Non-compliant'} (${(report.compliance.complianceScore * 100).toFixed(1)}%)
- **Fee**: ${report.fees.calculation.finalFee}
- **Documents**: ${report.documentation.results.validated}/${report.documentation.results.totalRequired} validated
- **Issues**: ${report.compliance.details.missingItems.documents.length + report.compliance.details.missingItems.deliverables.length} items missing
`).join('\n')}

## Critical Issues
${summary.criticalIssues.map(issue => 
    `- **${issue.phase}** [${issue.severity}]: ${issue.description}`
).join('\n')}

## Upcoming Deadlines
${summary.upcomingDeadlines.map(d => 
    `- **${d.phase}** (${new Date(d.deadline).toLocaleDateString('de-DE')}): ${d.description}`
).join('\n')}

## Recommendations
${this.generateReportRecommendations(phaseReports)}

---
*This report was automatically generated by the HOAI Compliance System*`;
    }
    
    generateReportRecommendations(phaseReports) {
        const recommendations = new Set();
        
        phaseReports.forEach(report => {
            if (!report.compliance.compliant) {
                recommendations.add(`Complete ${report.phase} requirements urgently`);
            }
            
            if (report.documentation.results.missing > 0) {
                recommendations.add(`Submit missing ${report.phase} documentation`);
            }
        });
        
        return Array.from(recommendations).map(r => `- ${r}`).join('\n');
    }
    
    async storeComplianceReport(projectId, report) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO compliance_reports
                (project_id, report_type, report_data, generated_at)
                VALUES ($1, 'hoai_comprehensive', $2, NOW())
            `, [projectId, JSON.stringify(report)]);
        } finally {
            client.release();
        }
    }
    
    generateActionItems(phaseReports) {
        const actions = [];
        
        phaseReports.forEach(report => {
            if (!report.compliance.compliant) {
                report.compliance.details.missingItems.documents.forEach(doc => {
                    actions.push({
                        phase: report.phase,
                        type: 'document',
                        action: `Create and submit ${doc}`,
                        priority: 'high',
                        deadline: this.calculateDeadline('document', report.phase)
                    });
                });
                
                report.compliance.details.missingItems.deliverables.forEach(deliverable => {
                    actions.push({
                        phase: report.phase,
                        type: 'deliverable',
                        action: `Complete ${deliverable}`,
                        priority: 'high',
                        deadline: this.calculateDeadline('deliverable', report.phase)
                    });
                });
            }
        });
        
        return actions.sort((a, b) => a.deadline - b.deadline);
    }
    
    calculateDeadline(type, phase) {
        const baseDeadline = new Date();
        
        // Different deadlines based on type and phase
        const daysToAdd = type === 'document' ? 7 : 14;
        
        // Critical phases get shorter deadlines
        if (['LP4', 'LP5', 'LP6'].includes(phase)) {
            baseDeadline.setDate(baseDeadline.getDate() + Math.floor(daysToAdd / 2));
        } else {
            baseDeadline.setDate(baseDeadline.getDate() + daysToAdd);
        }
        
        return baseDeadline;
    }
}

// Export for skill usage
export default HOAICommand;
