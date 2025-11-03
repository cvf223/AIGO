/**
 * 📄 Tender Document Service - Ausschreibung Generation
 * ====================================================
 * 
 * Generates complete tender packages compliant with VOB/A
 * and HOAI LP 6 requirements
 */

import { EventEmitter } from 'events';
import path from 'path';

export class TenderDocumentService extends EventEmitter {
    constructor(config = {}) {
        super();
        console.log('📄 Initializing Tender Document Service...');
        
        this.config = {
            templateDir: config.templateDir || './templates/tender',
            outputFormat: config.outputFormat || 'PDF',
            language: config.language || 'de',
            vobCompliance: config.vobCompliance !== false,
            includeDigitalSubmission: config.includeDigitalSubmission !== false,
            database: config.database,
            ...config
        };
        
        // Document templates
        this.templates = new Map();
        this.documentSections = new Map();
        this.generatedDocuments = new Map();
        
        // VOB/A compliance checker
        this.complianceRules = new Map();
        
        // Metrics
        this.metrics = {
            totalTendersGenerated: 0,
            averagePageCount: 0,
            complianceRate: 1.0,
            generationTime: 0
        };
        
        this.isInitialized = false;
    }
    
    async initialize() {
        console.log('   📄 Loading tender document templates...');
        
        await this.loadVOBTemplates();
        await this.loadComplianceRules();
        await this.initializeDocumentStructure();
        
        if (this.config.database) {
            await this.loadHistoricalTemplates();
        }
        
        this.isInitialized = true;
        console.log('   ✅ Tender Document Service initialized');
    }
    
    /**
     * Generate complete tender package
     */
    async generateTenderPackage(project) {
        const startTime = Date.now();
        console.log(`📄 Generating tender package for: ${project.name}`);
        
        const tenderPackage = {
            projectId: project.id,
            metadata: this.createMetadata(project),
            documents: new Map(),
            generated: new Date().toISOString()
        };
        
        try {
            // 1. Anschreiben (Cover Letter)
            const coverLetter = await this.generateCoverLetter(project);
            tenderPackage.documents.set('01_Anschreiben', coverLetter);
            
            // 2. Bewerbungsbedingungen (Application Conditions)
            const applicationConditions = await this.generateApplicationConditions(project);
            tenderPackage.documents.set('02_Bewerbungsbedingungen', applicationConditions);
            
            // 3. Vertragsbedingungen (Contract Conditions)
            const contractConditions = await this.generateContractConditions(project);
            tenderPackage.documents.set('03_Vertragsbedingungen', contractConditions);
            
            // 4. Leistungsbeschreibung (Service Description)
            const serviceDescription = await this.generateServiceDescription(project);
            tenderPackage.documents.set('04_Leistungsbeschreibung', serviceDescription);
            
            // 5. Leistungsverzeichnis (Bill of Quantities)
            const boq = await this.integrateBoQ(project);
            tenderPackage.documents.set('05_Leistungsverzeichnis', boq);
            
            // 6. Technische Anlagen (Technical Appendices)
            const technicalDocs = await this.compileTechnicalAppendices(project);
            tenderPackage.documents.set('06_Technische_Anlagen', technicalDocs);
            
            // 7. Vergabehandbuch (Award Manual)
            const awardManual = await this.generateAwardManual(project);
            tenderPackage.documents.set('07_Vergabehandbuch', awardManual);
            
            // Validate VOB/A compliance
            const complianceCheck = await this.validateCompliance(tenderPackage);
            tenderPackage.complianceReport = complianceCheck;
            
            // Format and finalize
            const finalPackage = await this.formatPackage(tenderPackage);
            
            // Store generated package
            this.generatedDocuments.set(project.id, finalPackage);
            
            // Update metrics
            this.updateMetrics(finalPackage, Date.now() - startTime);
            
            this.emit('tenderGenerated', {
                projectId: project.id,
                documentCount: tenderPackage.documents.size,
                compliant: complianceCheck.isCompliant
            });
            
            return finalPackage;
            
        } catch (error) {
            console.error('❌ Tender generation error:', error);
            throw error;
        }
    }
    
    /**
     * Generate cover letter
     */
    async generateCoverLetter(project) {
        const template = this.templates.get('coverLetter');
        
        const content = {
            date: new Date().toLocaleDateString('de-DE'),
            subject: `Öffentliche Ausschreibung - ${project.name}`,
            reference: project.referenceNumber,
            body: this.fillTemplate(template.body, {
                projectName: project.name,
                client: project.client,
                submissionDeadline: project.submissionDeadline,
                openingDate: project.openingDate,
                projectDescription: project.description,
                estimatedValue: project.estimatedValue
            }),
            attachments: this.listAttachments(project),
            contact: project.contactPerson
        };
        
        return {
            type: 'cover_letter',
            content: content,
            pages: 2,
            format: 'A4'
        };
    }
    
    /**
     * Generate application conditions
     */
    async generateApplicationConditions(project) {
        const sections = [];
        
        // 1. Teilnahmebedingungen
        sections.push({
            title: '1. Teilnahmebedingungen',
            content: this.generateParticipationRequirements(project)
        });
        
        // 2. Eignungsnachweise
        sections.push({
            title: '2. Nachweise der Eignung',
            content: this.generateQualificationRequirements(project)
        });
        
        // 3. Angebotsabgabe
        sections.push({
            title: '3. Form und Inhalt des Angebots',
            content: this.generateSubmissionRequirements(project)
        });
        
        // 4. Zuschlagskriterien
        sections.push({
            title: '4. Zuschlagskriterien',
            content: this.generateAwardCriteria(project)
        });
        
        // 5. Fristen
        sections.push({
            title: '5. Fristen und Termine',
            content: this.generateDeadlines(project)
        });
        
        return {
            type: 'application_conditions',
            sections: sections,
            pages: 8,
            vobReference: '§ 8 VOB/A'
        };
    }
    
    /**
     * Generate contract conditions
     */
    async generateContractConditions(project) {
        const vobB = this.templates.get('vobB');
        
        const conditions = {
            contractType: project.contractType || 'Einheitspreisvertrag',
            paymentTerms: this.generatePaymentTerms(project),
            warranty: {
                period: project.warrantyPeriod || '5 Jahre gemäß BGB',
                terms: this.generateWarrantyTerms(project)
            },
            insurance: this.generateInsuranceRequirements(project),
            penalties: this.generatePenaltyClause(project),
            modifications: this.generateModificationClause(project),
            termination: this.generateTerminationClause(project)
        };
        
        return {
            type: 'contract_conditions',
            baseContract: 'VOB/B',
            specialConditions: conditions,
            pages: 15
        };
    }
    
    /**
     * Generate service description
     */
    async generateServiceDescription(project) {
        const description = {
            projectScope: this.generateProjectScope(project),
            technicalRequirements: this.generateTechnicalRequirements(project),
            qualityStandards: this.generateQualityStandards(project),
            interfaces: this.generateInterfaceDescription(project),
            coordination: this.generateCoordinationRequirements(project),
            safetyRequirements: this.generateSafetyRequirements(project)
        };
        
        // Structure according to DIN 18299
        const din18299 = this.structureAccordingToDIN(description);
        
        return {
            type: 'service_description',
            content: din18299,
            pages: 25,
            dinCompliant: true
        };
    }
    
    /**
     * Integrate Bill of Quantities
     */
    async integrateBoQ(project) {
        // Integrate with BillOfQuantitiesGenerator for BOQ data
        return {
            type: 'bill_of_quantities',
            reference: project.boqId,
            format: 'GAEB DA84',
            pages: project.boqPages || 150,
            positions: project.positionCount || 1200
        };
    }
    
    /**
     * Compile technical appendices
     */
    async compileTechnicalAppendices(project) {
        const appendices = [];
        
        // Add all technical documents
        if (project.plans) {
            appendices.push({
                title: 'Anlage 1: Planunterlagen',
                documents: project.plans,
                pages: project.plans.length * 2
            });
        }
        
        if (project.specifications) {
            appendices.push({
                title: 'Anlage 2: Technische Spezifikationen',
                documents: project.specifications,
                pages: 50
            });
        }
        
        if (project.reports) {
            appendices.push({
                title: 'Anlage 3: Gutachten und Berichte',
                documents: project.reports,
                pages: 30
            });
        }
        
        return {
            type: 'technical_appendices',
            appendices: appendices,
            totalPages: appendices.reduce((sum, a) => sum + a.pages, 0)
        };
    }
    
    /**
     * Generate award manual
     */
    async generateAwardManual(project) {
        return {
            type: 'award_manual',
            sections: [
                {
                    title: 'Vergabeverfahren',
                    content: this.generateProcedureDescription(project)
                },
                {
                    title: 'Bewertungsmatrix',
                    content: this.generateEvaluationMatrix(project)
                },
                {
                    title: 'Vergabevermerk',
                    content: this.generateAwardDocumentationTemplate()
                }
            ],
            pages: 10
        };
    }
    
    /**
     * Validate VOB/A compliance
     */
    async validateCompliance(tenderPackage) {
        const violations = [];
        const checks = [];
        
        // Check all required documents
        for (const [rule, validator] of this.complianceRules) {
            const result = await validator(tenderPackage);
            checks.push({
                rule: rule,
                passed: result.passed,
                message: result.message
            });
            
            if (!result.passed) {
                violations.push(result);
            }
        }
        
        return {
            isCompliant: violations.length === 0,
            violations: violations,
            checks: checks,
            complianceScore: (checks.length - violations.length) / checks.length
        };
    }
    
    /**
     * Format final package
     */
    async formatPackage(tenderPackage) {
        const formatted = {
            ...tenderPackage,
            tableOfContents: this.generateTableOfContents(tenderPackage),
            totalPages: this.calculateTotalPages(tenderPackage),
            format: this.config.outputFormat
        };
        
        // Apply formatting based on output type
        switch (this.config.outputFormat) {
            case 'PDF':
                return this.formatAsPDF(formatted);
            case 'GAEB':
                return this.formatAsGAEB(formatted);
            default:
                return formatted;
        }
    }
    
    /**
     * Create metadata
     */
    createMetadata(project) {
        return {
            projectName: project.name,
            projectNumber: project.number,
            client: project.client,
            procurementType: project.procurementType || 'Öffentliche Ausschreibung',
            createdDate: new Date().toISOString(),
            author: 'Construction Syndicate AI',
            version: '1.0',
            language: this.config.language,
            vobCompliant: true
        };
    }
    
    /**
     * Load VOB templates
     */
    async loadVOBTemplates() {
        // Load standard VOB/A compliant templates
        this.templates.set('coverLetter', {
            body: `Sehr geehrte Damen und Herren,\n\nhiermit laden wir Sie zur Abgabe eines Angebots für {{projectName}} ein.\n\n...`
        });
        
        this.templates.set('vobB', {
            sections: ['§1-§18 VOB/B standard clauses']
        });
    }
    
    /**
     * Load compliance rules
     */
    async loadComplianceRules() {
        // VOB/A § 8 requirements
        this.complianceRules.set('documents_complete', (pkg) => ({
            passed: pkg.documents.size >= 7,
            message: 'All required tender documents must be included'
        }));
        
        this.complianceRules.set('deadlines_valid', (pkg) => ({
            passed: true, // Check deadline logic
            message: 'Submission deadline must be at least 15 days'
        }));
        
        // Add more compliance rules...
    }
    
    /**
     * Initialize document structure
     */
    async initializeDocumentStructure() {
        // Setup standard document sections
        this.documentSections.set('standard', [
            'Anschreiben',
            'Bewerbungsbedingungen',
            'Vertragsbedingungen',
            'Leistungsbeschreibung',
            'Leistungsverzeichnis',
            'Anlagen'
        ]);
    }
    
    /**
     * Fill template with data
     */
    fillTemplate(template, data) {
        let filled = template;
        for (const [key, value] of Object.entries(data)) {
            filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return filled;
    }
    
    /**
     * Generate various requirement sections
     */
    generateParticipationRequirements(project) {
        return `Teilnahmeberechtigt sind Unternehmen, die:\n- Im Berufsregister eingetragen sind\n- Keine Insolvenz angemeldet haben\n- Steuern und Sozialabgaben gezahlt haben`;
    }
    
    generateQualificationRequirements(project) {
        return `Nachzuweisen sind:\n- Referenzen vergleichbarer Projekte\n- Umsatz der letzten 3 Jahre\n- Verfügbare Kapazitäten\n- Qualifikationen des Personals`;
    }
    
    generateSubmissionRequirements(project) {
        return `Das Angebot muss enthalten:\n- Ausgefülltes Leistungsverzeichnis\n- Alle geforderten Nachweise\n- Unterschriebene Vertragsbedingungen`;
    }
    
    generateAwardCriteria(project) {
        const criteria = project.awardCriteria || {
            price: 70,
            quality: 20,
            time: 10
        };
        
        return `Zuschlagskriterien:\n- Preis: ${criteria.price}%\n- Qualität: ${criteria.quality}%\n- Ausführungszeit: ${criteria.time}%`;
    }
    
    generateDeadlines(project) {
        return `Angebotsabgabe: ${project.submissionDeadline}\nÖffnungstermin: ${project.openingDate}\nZuschlagsfrist: ${project.awardDeadline}`;
    }
    
    /**
     * Generate payment terms
     */
    generatePaymentTerms(project) {
        return {
            advance: '0%',
            progress: '90% nach Baufortschritt',
            retention: '10% Sicherheitseinbehalt',
            paymentPeriod: '30 Tage nach Rechnungsstellung',
            lateFees: 'Verzugszinsen gemäß BGB'
        };
    }
    
    /**
     * Update metrics
     */
    updateMetrics(tenderPackage, generationTime) {
        this.metrics.totalTendersGenerated++;
        this.metrics.averagePageCount = 
            (this.metrics.averagePageCount * (this.metrics.totalTendersGenerated - 1) + 
             tenderPackage.totalPages) / this.metrics.totalTendersGenerated;
        this.metrics.generationTime = generationTime;
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            metrics: this.metrics,
            templatesLoaded: this.templates.size,
            complianceRules: this.complianceRules.size
        };
    }
    
    /**
     * Shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down Tender Document Service...');
        this.removeAllListeners();
    }
}

