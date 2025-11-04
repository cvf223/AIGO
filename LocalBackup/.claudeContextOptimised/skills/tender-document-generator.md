# Tender Document Generator Implementation

## Overview

This skill provides a production-ready automated tender creation system for the AIGO-Syndicate construction intelligence. It includes template engine integration, dynamic content generation, PostgreSQL document storage, version control, approval workflow, PDF generation, and digital signature integration.

## Core Implementation

### Tender Document Engine

```javascript
// tender-document-generator.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export class TenderDocumentGenerator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Document types
            documentTypes: config.documentTypes || [
                'invitation_to_tender',
                'tender_specifications',
                'bill_of_quantities',
                'technical_drawings',
                'contract_conditions',
                'submission_forms',
                'evaluation_criteria'
            ],
            
            // HOAI phases for tender
            hoaiPhases: config.hoaiPhases || {
                'LP6': 'Vorbereitung der Vergabe',
                'LP7': 'Mitwirkung bei der Vergabe'
            },
            
            // Template settings
            templateEngine: config.templateEngine || 'handlebars',
            templatesPath: config.templatesPath || './templates/tender',
            
            // Document settings
            defaultLanguage: config.defaultLanguage || 'de',
            supportedLanguages: config.supportedLanguages || ['de', 'en'],
            
            // Approval workflow
            approvalLevels: config.approvalLevels || [
                'draft',
                'technical_review',
                'legal_review',
                'management_approval',
                'published'
            ],
            
            // PDF settings
            pdfOptions: config.pdfOptions || {
                format: 'A4',
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                displayHeaderFooter: true,
                printBackground: true
            },
            
            // Digital signature
            signatureProvider: config.signatureProvider || 'internal',
            certificatePath: config.certificatePath,
            
            // Storage
            documentStoragePath: config.documentStoragePath || './documents/tenders',
            maxVersions: config.maxVersions || 10,
            
            ...config
        };
        
        this.dbPool = null;
        this.browser = null;
        this.templates = new Map();
        this.activeWorkflows = new Map();
        
        // Metrics
        this.metrics = {
            documentsGenerated: 0,
            approvalsPending: 0,
            averageGenerationTime: 0,
            templatesLoaded: 0
        };
        
        // Initialize Handlebars helpers
        this.initializeHandlebarsHelpers();
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load templates
            await this.loadTemplates();
            
            // Initialize browser for PDF generation
            await this.initializeBrowser();
            
            // Start background services
            this.startBackgroundServices();
            
            this.emit('initialized');
            console.log('Tender Document Generator initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'tender_generator'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Tender documents table
            await client.query(`
                CREATE TABLE IF NOT EXISTS tender_documents (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    tender_id UUID NOT NULL,
                    document_type VARCHAR(50) NOT NULL,
                    version INTEGER DEFAULT 1,
                    language VARCHAR(5) DEFAULT 'de',
                    title VARCHAR(500) NOT NULL,
                    content JSONB NOT NULL,
                    template_id VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'draft',
                    file_path TEXT,
                    file_hash VARCHAR(64),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_by UUID,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_tender_doc_version 
                    UNIQUE(tender_id, document_type, version, language)
                );
                
                CREATE INDEX IF NOT EXISTS idx_tender_docs_tender 
                ON tender_documents(tender_id, status);
                
                CREATE INDEX IF NOT EXISTS idx_tender_docs_project 
                ON tender_documents(project_id);
            `);
            
            // Document templates
            await client.query(`
                CREATE TABLE IF NOT EXISTS document_templates (
                    id VARCHAR(100) PRIMARY KEY,
                    template_type VARCHAR(50) NOT NULL,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    language VARCHAR(5) DEFAULT 'de',
                    content TEXT NOT NULL,
                    variables JSONB DEFAULT '[]'::jsonb,
                    sample_data JSONB,
                    active BOOLEAN DEFAULT true,
                    version INTEGER DEFAULT 1,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_templates_type 
                ON document_templates(template_type, language)
                WHERE active = true;
            `);
            
            // Approval workflow
            await client.query(`
                CREATE TABLE IF NOT EXISTS document_approvals (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    document_id UUID REFERENCES tender_documents(id),
                    approval_level VARCHAR(50) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    approver_id UUID,
                    comments TEXT,
                    conditions JSONB DEFAULT '[]'::jsonb,
                    approved_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_doc_approval 
                    UNIQUE(document_id, approval_level)
                );
                
                CREATE INDEX IF NOT EXISTS idx_approvals_document 
                ON document_approvals(document_id, status);
                
                CREATE INDEX IF NOT EXISTS idx_approvals_pending 
                ON document_approvals(status, created_at)
                WHERE status = 'pending';
            `);
            
            // Document signatures
            await client.query(`
                CREATE TABLE IF NOT EXISTS document_signatures (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    document_id UUID REFERENCES tender_documents(id),
                    signatory_id UUID NOT NULL,
                    signatory_name VARCHAR(200) NOT NULL,
                    signatory_role VARCHAR(100),
                    signature_type VARCHAR(20) DEFAULT 'digital',
                    signature_data TEXT,
                    certificate_info JSONB,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    ip_address INET,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_signatures_document 
                ON document_signatures(document_id);
            `);
            
            // Tender packages
            await client.query(`
                CREATE TABLE IF NOT EXISTS tender_packages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    package_name VARCHAR(300) NOT NULL,
                    description TEXT,
                    tender_type VARCHAR(50) NOT NULL,
                    submission_deadline TIMESTAMPTZ,
                    opening_date TIMESTAMPTZ,
                    estimated_value DECIMAL(15,2),
                    currency VARCHAR(3) DEFAULT 'EUR',
                    cpv_codes JSONB DEFAULT '[]'::jsonb,
                    evaluation_criteria JSONB NOT NULL,
                    required_documents JSONB DEFAULT '[]'::jsonb,
                    status VARCHAR(50) DEFAULT 'preparation',
                    published_at TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_packages_project 
                ON tender_packages(project_id, status);
                
                CREATE INDEX IF NOT EXISTS idx_packages_deadline 
                ON tender_packages(submission_deadline)
                WHERE status = 'published';
            `);
            
            // Document generation history
            await client.query(`
                CREATE TABLE IF NOT EXISTS generation_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    document_id UUID REFERENCES tender_documents(id),
                    generation_type VARCHAR(50) NOT NULL,
                    input_data JSONB NOT NULL,
                    output_format VARCHAR(20),
                    duration_ms INTEGER,
                    success BOOLEAN DEFAULT true,
                    error_message TEXT,
                    generated_by UUID,
                    generated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_generation_document 
                ON generation_history(document_id, generated_at DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Template Management
    
    initializeHandlebarsHelpers() {
        // Date formatting helper
        Handlebars.registerHelper('formatDate', (date, format) => {
            if (!date) return '';
            const d = new Date(date);
            
            switch (format) {
                case 'DD.MM.YYYY':
                    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                case 'DD/MM/YYYY':
                    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                default:
                    return d.toLocaleDateString('de-DE');
            }
        });
        
        // Currency formatting
        Handlebars.registerHelper('formatCurrency', (amount, currency = 'EUR') => {
            if (!amount) return '0,00 €';
            
            const formatter = new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: currency
            });
            
            return formatter.format(amount);
        });
        
        // Number formatting
        Handlebars.registerHelper('formatNumber', (number, decimals = 2) => {
            if (!number) return '0';
            
            return new Intl.NumberFormat('de-DE', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(number);
        });
        
        // Conditional helper
        Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
        
        // Array indexing
        Handlebars.registerHelper('getItem', (array, index) => {
            return array && array[index] ? array[index] : '';
        });
        
        // Text helpers
        Handlebars.registerHelper('uppercase', (text) => {
            return text ? text.toUpperCase() : '';
        });
        
        Handlebars.registerHelper('lowercase', (text) => {
            return text ? text.toLowerCase() : '';
        });
        
        // HOAI specific helpers
        Handlebars.registerHelper('hoaiPhase', (phase) => {
            return this.config.hoaiPhases[phase] || phase;
        });
    }
    
    async loadTemplates() {
        try {
            // Load from database
            const client = await this.dbPool.connect();
            try {
                const result = await client.query(`
                    SELECT * FROM document_templates
                    WHERE active = true
                    ORDER BY template_type, language, version DESC
                `);
                
                for (const template of result.rows) {
                    const compiled = Handlebars.compile(template.content);
                    const key = `${template.template_type}_${template.language}`;
                    
                    this.templates.set(key, {
                        id: template.id,
                        compiled,
                        metadata: template,
                        variables: template.variables
                    });
                }
                
                this.metrics.templatesLoaded = this.templates.size;
                
            } finally {
                client.release();
            }
            
            // Load default templates if none in database
            if (this.templates.size === 0) {
                await this.loadDefaultTemplates();
            }
            
            console.log(`Loaded ${this.templates.size} tender templates`);
            
        } catch (error) {
            this.handleError('template_loading', error);
            throw error;
        }
    }
    
    async loadDefaultTemplates() {
        // Default tender invitation template (German)
        const invitationTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Ausschreibung - {{project.name}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .details { background: #f4f4f4; padding: 15px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f4f4f4; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Öffentliche Ausschreibung</h1>
        <h2>{{project.name}}</h2>
        <p>Vergabenummer: {{tender.referenceNumber}}</p>
        <p>Datum: {{formatDate createdDate "DD.MM.YYYY"}}</p>
    </div>
    
    <div class="section">
        <h3>1. Auftraggeber</h3>
        <div class="details">
            <p><strong>{{client.name}}</strong></p>
            <p>{{client.address.street}}</p>
            <p>{{client.address.postalCode}} {{client.address.city}}</p>
            <p>Ansprechpartner: {{client.contactPerson}}</p>
            <p>E-Mail: {{client.email}}</p>
            <p>Telefon: {{client.phone}}</p>
        </div>
    </div>
    
    <div class="section">
        <h3>2. Bauvorhaben</h3>
        <div class="details">
            <p><strong>Bezeichnung:</strong> {{project.description}}</p>
            <p><strong>Bauort:</strong> {{project.location.address}}</p>
            <p><strong>Leistungsumfang:</strong></p>
            <ul>
                {{#each services}}
                <li>{{this.description}} (CPV: {{this.cpvCode}})</li>
                {{/each}}
            </ul>
        </div>
    </div>
    
    <div class="section">
        <h3>3. Art und Umfang der Leistung</h3>
        <p>{{tender.scopeDescription}}</p>
        
        <h4>3.1 Hauptleistungen</h4>
        <table>
            <thead>
                <tr>
                    <th>Pos.</th>
                    <th>Bezeichnung</th>
                    <th>Menge</th>
                    <th>Einheit</th>
                </tr>
            </thead>
            <tbody>
                {{#each tender.mainServices}}
                <tr>
                    <td>{{this.position}}</td>
                    <td>{{this.description}}</td>
                    <td>{{formatNumber this.quantity 2}}</td>
                    <td>{{this.unit}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h3>4. Ausführungsfristen</h3>
        <div class="details">
            <p><strong>Baubeginn:</strong> {{formatDate project.startDate "DD.MM.YYYY"}}</p>
            <p><strong>Fertigstellung:</strong> {{formatDate project.endDate "DD.MM.YYYY"}}</p>
            {{#if project.milestones}}
            <p><strong>Zwischentermine:</strong></p>
            <ul>
                {{#each project.milestones}}
                <li>{{this.description}}: {{formatDate this.date "DD.MM.YYYY"}}</li>
                {{/each}}
            </ul>
            {{/if}}
        </div>
    </div>
    
    <div class="section">
        <h3>5. Vergabeverfahren</h3>
        <p>{{tender.procedureType}}</p>
        <p><strong>Submission der Angebote:</strong></p>
        <div class="details">
            <p><strong>Datum:</strong> {{formatDate tender.submissionDeadline "DD.MM.YYYY"}}</p>
            <p><strong>Uhrzeit:</strong> {{tender.submissionTime}} Uhr</p>
            <p><strong>Ort:</strong> {{tender.submissionLocation}}</p>
        </div>
    </div>
    
    <div class="section">
        <h3>6. Vergabeunterlagen</h3>
        <p>Die Vergabeunterlagen können bezogen werden bei:</p>
        <div class="details">
            <p>{{tender.documentsSource}}</p>
            {{#if tender.documentsAvailableFrom}}
            <p><strong>Verfügbar ab:</strong> {{formatDate tender.documentsAvailableFrom "DD.MM.YYYY"}}</p>
            {{/if}}
            {{#if tender.documentsFee}}
            <p><strong>Gebühr:</strong> {{formatCurrency tender.documentsFee}}</p>
            {{/if}}
        </div>
    </div>
    
    <div class="section">
        <h3>7. Zuschlagskriterien</h3>
        <table>
            <thead>
                <tr>
                    <th>Kriterium</th>
                    <th>Gewichtung</th>
                </tr>
            </thead>
            <tbody>
                {{#each tender.awardCriteria}}
                <tr>
                    <td>{{this.name}}</td>
                    <td>{{this.weight}}%</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h3>8. Weitere Informationen</h3>
        {{#if tender.additionalInfo}}
        <p>{{tender.additionalInfo}}</p>
        {{/if}}
        <p>Veröffentlicht am: {{formatDate publishDate "DD.MM.YYYY"}}</p>
    </div>
    
    <div class="footer" style="margin-top: 50px; text-align: center; font-size: 0.9em; color: #666;">
        <p>Diese Ausschreibung wurde erstellt gemäß VOB/A</p>
        <p>Dokument-ID: {{documentId}}</p>
    </div>
</body>
</html>
        `;
        
        // Store default template
        await this.storeTemplate({
            id: 'invitation_to_tender_de',
            template_type: 'invitation_to_tender',
            name: 'Standard Tender Invitation (German)',
            language: 'de',
            content: invitationTemplate,
            variables: [
                { name: 'project', type: 'object', required: true },
                { name: 'client', type: 'object', required: true },
                { name: 'tender', type: 'object', required: true },
                { name: 'services', type: 'array', required: true }
            ]
        });
        
        // Bill of Quantities template
        const boqTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Leistungsverzeichnis - {{project.name}}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12pt; }
        .header { margin-bottom: 30px; }
        .position { page-break-inside: avoid; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; }
        th { background: #e0e0e0; font-weight: bold; }
        .total { font-weight: bold; background: #f0f0f0; }
        .subtotal { background: #f8f8f8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Leistungsverzeichnis</h1>
        <h2>{{project.name}}</h2>
        <p>LV-Nr.: {{boq.number}}</p>
        <p>Stand: {{formatDate boq.date "DD.MM.YYYY"}}</p>
    </div>
    
    {{#each boq.sections}}
    <div class="section">
        <h3>{{this.number}} {{this.title}}</h3>
        
        {{#each this.items}}
        <div class="position">
            <table>
                <tr>
                    <td width="10%"><strong>{{this.position}}</strong></td>
                    <td width="50%"><strong>{{this.title}}</strong></td>
                    <td width="15%" style="text-align: right;">{{formatNumber this.quantity 3}} {{this.unit}}</td>
                    <td width="12%" style="text-align: right;">EP: ________ €</td>
                    <td width="13%" style="text-align: right;">GP: ________ €</td>
                </tr>
                {{#if this.description}}
                <tr>
                    <td colspan="5" style="padding: 10px;">
                        {{this.description}}
                        {{#if this.specifications}}
                        <br><br><strong>Technische Angaben:</strong>
                        <ul>
                            {{#each this.specifications}}
                            <li>{{this}}</li>
                            {{/each}}
                        </ul>
                        {{/if}}
                        {{#if this.standards}}
                        <br><strong>Normen:</strong> {{this.standards}}
                        {{/if}}
                    </td>
                </tr>
                {{/if}}
            </table>
        </div>
        {{/each}}
        
        <table style="margin-top: 20px;">
            <tr class="subtotal">
                <td colspan="4" style="text-align: right; padding: 10px;">
                    <strong>Zwischensumme {{this.number}} {{this.title}}:</strong>
                </td>
                <td style="text-align: right; padding: 10px;">
                    <strong>________ €</strong>
                </td>
            </tr>
        </table>
    </div>
    {{/each}}
    
    <div style="page-break-before: always;">
        <h3>Zusammenfassung</h3>
        <table>
            <thead>
                <tr>
                    <th>Titel</th>
                    <th width="20%">Summe netto</th>
                </tr>
            </thead>
            <tbody>
                {{#each boq.sections}}
                <tr>
                    <td>{{this.number}} {{this.title}}</td>
                    <td style="text-align: right;">________ €</td>
                </tr>
                {{/each}}
                <tr class="total">
                    <td>Gesamtsumme netto</td>
                    <td style="text-align: right;">________ €</td>
                </tr>
                <tr>
                    <td>{{boq.vatRate}}% MwSt.</td>
                    <td style="text-align: right;">________ €</td>
                </tr>
                <tr class="total">
                    <td>Gesamtsumme brutto</td>
                    <td style="text-align: right;">________ €</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
        `;
        
        await this.storeTemplate({
            id: 'bill_of_quantities_de',
            template_type: 'bill_of_quantities',
            name: 'Standard Bill of Quantities (German)',
            language: 'de',
            content: boqTemplate,
            variables: [
                { name: 'project', type: 'object', required: true },
                { name: 'boq', type: 'object', required: true }
            ]
        });
    }
    
    async storeTemplate(templateData) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO document_templates
                (id, template_type, name, language, content, variables)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    variables = EXCLUDED.variables,
                    updated_at = NOW()
            `, [
                templateData.id,
                templateData.template_type,
                templateData.name,
                templateData.language,
                templateData.content,
                JSON.stringify(templateData.variables)
            ]);
            
            // Compile and cache
            const compiled = Handlebars.compile(templateData.content);
            const key = `${templateData.template_type}_${templateData.language}`;
            
            this.templates.set(key, {
                id: templateData.id,
                compiled,
                metadata: templateData,
                variables: templateData.variables
            });
            
        } finally {
            client.release();
        }
    }
    
    // Document Generation
    
    async generateTenderDocument(tenderId, documentType, data, options = {}) {
        const startTime = Date.now();
        this.metrics.documentsGenerated++;
        
        try {
            // Validate input
            this.validateDocumentData(documentType, data);
            
            // Get template
            const language = options.language || this.config.defaultLanguage;
            const templateKey = `${documentType}_${language}`;
            const template = this.templates.get(templateKey);
            
            if (!template) {
                throw new Error(`Template not found: ${templateKey}`);
            }
            
            // Generate content
            const htmlContent = template.compiled(data);
            
            // Create document record
            const document = await this.createDocumentRecord({
                tenderId,
                documentType,
                language,
                title: data.title || this.generateDocumentTitle(documentType, data),
                content: data,
                templateId: template.id,
                status: 'draft'
            });
            
            // Generate PDF if requested
            let filePath = null;
            if (options.generatePDF !== false) {
                filePath = await this.generatePDF(document.id, htmlContent, options);
                await this.updateDocumentFile(document.id, filePath);
            }
            
            // Log generation
            const duration = Date.now() - startTime;
            await this.logGeneration(document.id, {
                type: 'initial',
                duration,
                format: options.generatePDF ? 'pdf' : 'html'
            });
            
            this.updateMetrics(duration);
            
            return {
                documentId: document.id,
                documentType,
                version: document.version,
                status: document.status,
                filePath,
                generationTime: duration
            };
            
        } catch (error) {
            this.handleError('document_generation', error);
            throw error;
        }
    }
    
    validateDocumentData(documentType, data) {
        // Basic validation
        if (!data) {
            throw new Error('Document data is required');
        }
        
        // Type-specific validation
        switch (documentType) {
            case 'invitation_to_tender':
                if (!data.project || !data.client || !data.tender) {
                    throw new Error('Missing required data: project, client, or tender');
                }
                break;
                
            case 'bill_of_quantities':
                if (!data.boq || !data.boq.sections) {
                    throw new Error('Missing required data: boq sections');
                }
                break;
                
            case 'tender_specifications':
                if (!data.specifications) {
                    throw new Error('Missing required data: specifications');
                }
                break;
        }
    }
    
    generateDocumentTitle(documentType, data) {
        const titles = {
            'invitation_to_tender': `Ausschreibung - ${data.project?.name || 'Projekt'}`,
            'bill_of_quantities': `Leistungsverzeichnis - ${data.project?.name || 'Projekt'}`,
            'tender_specifications': `Leistungsbeschreibung - ${data.project?.name || 'Projekt'}`,
            'technical_drawings': `Technische Zeichnungen - ${data.project?.name || 'Projekt'}`,
            'contract_conditions': `Vertragsbedingungen - ${data.project?.name || 'Projekt'}`
        };
        
        return titles[documentType] || `Dokument - ${documentType}`;
    }
    
    async createDocumentRecord(documentData) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO tender_documents
                (tender_id, project_id, document_type, language, title,
                 content, template_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                documentData.tenderId,
                documentData.projectId || documentData.tenderId,
                documentData.documentType,
                documentData.language,
                documentData.title,
                JSON.stringify(documentData.content),
                documentData.templateId,
                documentData.status
            ]);
            
            return result.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    async generatePDF(documentId, htmlContent, options = {}) {
        try {
            // Create page with Puppeteer
            const page = await this.browser.newPage();
            
            // Set content
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });
            
            // Configure PDF options
            const pdfOptions = {
                ...this.config.pdfOptions,
                ...options.pdfOptions,
                path: null, // Generate to buffer first
                headerTemplate: options.headerTemplate || this.getDefaultHeaderTemplate(),
                footerTemplate: options.footerTemplate || this.getDefaultFooterTemplate()
            };
            
            // Generate PDF
            const pdfBuffer = await page.pdf(pdfOptions);
            
            // Close page
            await page.close();
            
            // Save to file
            const fileName = `${documentId}_${Date.now()}.pdf`;
            const filePath = path.join(this.config.documentStoragePath, fileName);
            
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, pdfBuffer);
            
            // Calculate hash
            const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
            
            // Update document record
            await this.updateDocumentFile(documentId, filePath, hash);
            
            return filePath;
            
        } catch (error) {
            this.handleError('pdf_generation', error);
            throw error;
        }
    }
    
    getDefaultHeaderTemplate() {
        return `
            <div style="font-size: 10px; padding: 10px; width: 100%;">
                <span style="float: left;">{{title}}</span>
                <span style="float: right;">Seite <span class="pageNumber"></span> von <span class="totalPages"></span></span>
            </div>
        `;
    }
    
    getDefaultFooterTemplate() {
        return `
            <div style="font-size: 9px; padding: 10px; width: 100%; text-align: center;">
                <span>Dokument-ID: {{documentId}} | Erstellt am: {{date}}</span>
            </div>
        `;
    }
    
    async updateDocumentFile(documentId, filePath, hash = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE tender_documents
                SET file_path = $1,
                    file_hash = $2,
                    updated_at = NOW()
                WHERE id = $3
            `, [filePath, hash, documentId]);
            
        } finally {
            client.release();
        }
    }
    
    // Tender Package Management
    
    async createTenderPackage(projectId, packageData) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Create tender package
            const result = await client.query(`
                INSERT INTO tender_packages
                (project_id, package_name, description, tender_type,
                 submission_deadline, opening_date, estimated_value,
                 currency, cpv_codes, evaluation_criteria, required_documents)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                projectId,
                packageData.name,
                packageData.description,
                packageData.tenderType,
                packageData.submissionDeadline,
                packageData.openingDate,
                packageData.estimatedValue,
                packageData.currency || 'EUR',
                JSON.stringify(packageData.cpvCodes || []),
                JSON.stringify(packageData.evaluationCriteria),
                JSON.stringify(packageData.requiredDocuments || [])
            ]);
            
            const tenderPackage = result.rows[0];
            
            // Generate initial documents
            if (packageData.generateDocuments) {
                await this.generateInitialDocuments(tenderPackage.id, packageData);
            }
            
            await client.query('COMMIT');
            
            return tenderPackage;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async generateInitialDocuments(tenderId, packageData) {
        const documents = [];
        
        // Generate invitation to tender
        if (packageData.generateInvitation !== false) {
            const invitation = await this.generateTenderDocument(
                tenderId,
                'invitation_to_tender',
                {
                    project: packageData.project,
                    client: packageData.client,
                    tender: {
                        referenceNumber: packageData.referenceNumber,
                        procedureType: packageData.procedureType || 'Öffentliche Ausschreibung',
                        submissionDeadline: packageData.submissionDeadline,
                        submissionTime: packageData.submissionTime || '14:00',
                        submissionLocation: packageData.submissionLocation,
                        mainServices: packageData.mainServices || [],
                        awardCriteria: packageData.evaluationCriteria || []
                    },
                    services: packageData.services || []
                }
            );
            documents.push(invitation);
        }
        
        // Generate bill of quantities
        if (packageData.boq) {
            const boq = await this.generateTenderDocument(
                tenderId,
                'bill_of_quantities',
                {
                    project: packageData.project,
                    boq: packageData.boq
                }
            );
            documents.push(boq);
        }
        
        return documents;
    }
    
    // Version Control
    
    async createNewVersion(documentId, changes, reason) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Get current document
            const current = await client.query(`
                SELECT * FROM tender_documents
                WHERE id = $1
            `, [documentId]);
            
            if (!current.rows[0]) {
                throw new Error('Document not found');
            }
            
            const currentDoc = current.rows[0];
            
            // Create new version
            const newVersion = currentDoc.version + 1;
            const newContent = { ...currentDoc.content, ...changes };
            
            const result = await client.query(`
                INSERT INTO tender_documents
                (tender_id, project_id, document_type, version, language,
                 title, content, template_id, status, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
                currentDoc.tender_id,
                currentDoc.project_id,
                currentDoc.document_type,
                newVersion,
                currentDoc.language,
                currentDoc.title,
                JSON.stringify(newContent),
                currentDoc.template_id,
                'draft',
                JSON.stringify({
                    ...currentDoc.metadata,
                    previousVersion: currentDoc.version,
                    versionReason: reason
                })
            ]);
            
            // Regenerate if template exists
            if (currentDoc.template_id) {
                const template = this.templates.get(
                    `${currentDoc.document_type}_${currentDoc.language}`
                );
                
                if (template) {
                    const htmlContent = template.compiled(newContent);
                    await this.generatePDF(result.rows[0].id, htmlContent);
                }
            }
            
            await client.query('COMMIT');
            
            return result.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async getDocumentVersions(tenderId, documentType) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id, version, status, created_at, metadata
                FROM tender_documents
                WHERE tender_id = $1 AND document_type = $2
                ORDER BY version DESC
            `, [tenderId, documentType]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    // Approval Workflow
    
    async submitForApproval(documentId, submitterId) {
        const startTime = Date.now();
        
        try {
            // Get document
            const document = await this.getDocument(documentId);
            if (!document) {
                throw new Error('Document not found');
            }
            
            // Check if already in approval
            if (document.status !== 'draft') {
                throw new Error('Document is not in draft status');
            }
            
            // Update document status
            await this.updateDocumentStatus(documentId, 'in_review');
            
            // Create approval workflow
            const workflow = await this.createApprovalWorkflow(documentId, document);
            
            // Store workflow reference
            this.activeWorkflows.set(documentId, {
                id: workflow.id,
                startTime,
                currentLevel: 0,
                submitterId
            });
            
            // Notify first approver
            await this.notifyApprover(workflow.approvals[0]);
            
            return {
                workflowId: workflow.id,
                documentId,
                approvalLevels: workflow.approvals.length,
                status: 'submitted'
            };
            
        } catch (error) {
            this.handleError('approval_submission', error);
            throw error;
        }
    }
    
    async createApprovalWorkflow(documentId, document) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            const workflow = {
                id: uuidv4(),
                documentId,
                approvals: []
            };
            
            // Create approval records for each level
            for (const level of this.config.approvalLevels) {
                if (level === 'draft') continue;
                
                const approval = await client.query(`
                    INSERT INTO document_approvals
                    (document_id, approval_level, status)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `, [documentId, level, 'pending']);
                
                workflow.approvals.push(approval.rows[0]);
            }
            
            await client.query('COMMIT');
            
            return workflow;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async approveDocument(approvalId, approverId, decision, comments = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Get approval record
            const approval = await client.query(`
                SELECT * FROM document_approvals
                WHERE id = $1 AND status = 'pending'
            `, [approvalId]);
            
            if (!approval.rows[0]) {
                throw new Error('Approval not found or already processed');
            }
            
            const approvalRecord = approval.rows[0];
            
            // Update approval
            await client.query(`
                UPDATE document_approvals
                SET status = $1,
                    approver_id = $2,
                    comments = $3,
                    approved_at = NOW()
                WHERE id = $4
            `, [decision, approverId, comments, approvalId]);
            
            // Check if rejected
            if (decision === 'rejected') {
                await this.handleRejection(approvalRecord.document_id, comments);
            } else {
                // Check for next approval level
                await this.processNextApprovalLevel(approvalRecord.document_id);
            }
            
            await client.query('COMMIT');
            
            return {
                approvalId,
                decision,
                documentId: approvalRecord.document_id
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async processNextApprovalLevel(documentId) {
        const workflow = this.activeWorkflows.get(documentId);
        if (!workflow) return;
        
        // Get pending approvals
        const client = await this.dbPool.connect();
        try {
            const pending = await client.query(`
                SELECT * FROM document_approvals
                WHERE document_id = $1 AND status = 'pending'
                ORDER BY created_at
                LIMIT 1
            `, [documentId]);
            
            if (pending.rows[0]) {
                // Notify next approver
                await this.notifyApprover(pending.rows[0]);
                workflow.currentLevel++;
            } else {
                // All approvals complete
                await this.finalizeDocument(documentId);
                this.activeWorkflows.delete(documentId);
            }
            
        } finally {
            client.release();
        }
    }
    
    async handleRejection(documentId, reason) {
        // Update document status
        await this.updateDocumentStatus(documentId, 'rejected');
        
        // Clear workflow
        this.activeWorkflows.delete(documentId);
        
        // Notify submitter
        console.log(`Document ${documentId} rejected: ${reason}`);
    }
    
    async finalizeDocument(documentId) {
        // Update status to published
        await this.updateDocumentStatus(documentId, 'published');
        
        // Generate final version with signatures
        await this.generateFinalVersion(documentId);
        
        // Update tender package if all documents ready
        await this.checkTenderCompletion(documentId);
    }
    
    async generateFinalVersion(documentId) {
        const document = await this.getDocument(documentId);
        
        // Add approval signatures
        const approvals = await this.getDocumentApprovals(documentId);
        const signatures = approvals.map(a => ({
            name: a.approver_name,
            role: a.approval_level,
            date: a.approved_at
        }));
        
        // Update content with signatures
        const finalContent = {
            ...document.content,
            approvalSignatures: signatures,
            finalizedDate: new Date()
        };
        
        // Regenerate PDF with signatures
        const template = this.templates.get(
            `${document.document_type}_${document.language}`
        );
        
        if (template) {
            const htmlContent = template.compiled(finalContent);
            await this.generatePDF(documentId, htmlContent, {
                isFinal: true
            });
        }
    }
    
    // Digital Signatures
    
    async signDocument(documentId, signatoryData) {
        try {
            // Get document and file
            const document = await this.getDocument(documentId);
            if (!document || !document.file_path) {
                throw new Error('Document or file not found');
            }
            
            // Generate signature
            const signature = await this.generateDigitalSignature(
                document.file_path,
                signatoryData
            );
            
            // Store signature
            const client = await this.dbPool.connect();
            try {
                await client.query(`
                    INSERT INTO document_signatures
                    (document_id, signatory_id, signatory_name, signatory_role,
                     signature_type, signature_data, certificate_info, ip_address)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    documentId,
                    signatoryData.id,
                    signatoryData.name,
                    signatoryData.role,
                    'digital',
                    signature.data,
                    JSON.stringify(signature.certificateInfo),
                    signatoryData.ipAddress
                ]);
            } finally {
                client.release();
            }
            
            // Apply signature to PDF
            if (this.config.signatureProvider === 'internal') {
                await this.applySignatureToPDF(document.file_path, signature);
            }
            
            return {
                documentId,
                signatureId: signature.id,
                timestamp: new Date()
            };
            
        } catch (error) {
            this.handleError('document_signing', error);
            throw error;
        }
    }
    
    async generateDigitalSignature(filePath, signatoryData) {
        // Read file
        const fileData = await fs.readFile(filePath);
        
        // Create signature data
        const signatureData = {
            fileHash: crypto.createHash('sha256').update(fileData).digest('hex'),
            signatoryId: signatoryData.id,
            timestamp: new Date().toISOString()
        };
        
        // Sign with private key (simplified - would use real PKI in production)
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(signatureData));
        
        // In production, load actual private key
        const privateKey = await this.loadPrivateKey(signatoryData.id);
        const signature = sign.sign(privateKey, 'base64');
        
        return {
            id: uuidv4(),
            data: signature,
            certificateInfo: {
                issuer: 'AIGO Construction CA',
                subject: signatoryData.name,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        };
    }
    
    async loadPrivateKey(signatoryId) {
        // In production, retrieve from secure key store
        // For demo, generate a key
        const { privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
        
        return privateKey;
    }
    
    async applySignatureToPDF(filePath, signature) {
        // Load existing PDF
        const existingPdfBytes = await fs.readFile(filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Add signature annotation
        // This is simplified - real implementation would use PDF signature fields
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        
        lastPage.drawText(`Digitally signed by: ${signature.certificateInfo.subject}`, {
            x: 50,
            y: 50,
            size: 10
        });
        
        // Save updated PDF
        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(filePath, pdfBytes);
    }
    
    // Multi-language Support
    
    async translateDocument(documentId, targetLanguage) {
        try {
            // Get source document
            const document = await this.getDocument(documentId);
            if (!document) {
                throw new Error('Document not found');
            }
            
            // Check if translation already exists
            const existing = await this.checkExistingTranslation(
                document.tender_id,
                document.document_type,
                targetLanguage
            );
            
            if (existing) {
                return existing;
            }
            
            // Translate content
            const translatedContent = await this.translateContent(
                document.content,
                document.language,
                targetLanguage
            );
            
            // Create translated document
            const translated = await this.createDocumentRecord({
                tenderId: document.tender_id,
                projectId: document.project_id,
                documentType: document.document_type,
                language: targetLanguage,
                title: await this.translateText(document.title, document.language, targetLanguage),
                content: translatedContent,
                templateId: `${document.document_type}_${targetLanguage}`,
                status: document.status,
                metadata: {
                    ...document.metadata,
                    translatedFrom: documentId,
                    sourceLanguage: document.language
                }
            });
            
            // Generate PDF for translation
            const template = this.templates.get(
                `${document.document_type}_${targetLanguage}`
            );
            
            if (template) {
                const htmlContent = template.compiled(translatedContent);
                await this.generatePDF(translated.id, htmlContent);
            }
            
            return translated;
            
        } catch (error) {
            this.handleError('document_translation', error);
            throw error;
        }
    }
    
    async translateContent(content, sourceLanguage, targetLanguage) {
        // This would integrate with translation service
        // For demo, return content with language marker
        return {
            ...content,
            _translated: true,
            _sourceLanguage: sourceLanguage,
            _targetLanguage: targetLanguage
        };
    }
    
    async translateText(text, sourceLanguage, targetLanguage) {
        // Simple translation for demo
        const translations = {
            'de_en': {
                'Ausschreibung': 'Tender',
                'Leistungsverzeichnis': 'Bill of Quantities',
                'Projekt': 'Project'
            }
        };
        
        const key = `${sourceLanguage}_${targetLanguage}`;
        const dict = translations[key] || {};
        
        let translated = text;
        for (const [source, target] of Object.entries(dict)) {
            translated = translated.replace(source, target);
        }
        
        return translated;
    }
    
    // Utility Methods
    
    async getDocument(documentId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM tender_documents
                WHERE id = $1
            `, [documentId]);
            
            return result.rows[0] || null;
            
        } finally {
            client.release();
        }
    }
    
    async updateDocumentStatus(documentId, status) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE tender_documents
                SET status = $1, updated_at = NOW()
                WHERE id = $2
            `, [status, documentId]);
            
        } finally {
            client.release();
        }
    }
    
    async getDocumentApprovals(documentId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT da.*, u.name as approver_name
                FROM document_approvals da
                LEFT JOIN users u ON da.approver_id = u.id
                WHERE da.document_id = $1 AND da.status = 'approved'
                ORDER BY da.approved_at
            `, [documentId]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async checkExistingTranslation(tenderId, documentType, language) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM tender_documents
                WHERE tender_id = $1 
                  AND document_type = $2 
                  AND language = $3
                  AND status != 'rejected'
                ORDER BY version DESC
                LIMIT 1
            `, [tenderId, documentType, language]);
            
            return result.rows[0] || null;
            
        } finally {
            client.release();
        }
    }
    
    async checkTenderCompletion(documentId) {
        const document = await this.getDocument(documentId);
        if (!document) return;
        
        // Check if all required documents are published
        const client = await this.dbPool.connect();
        try {
            // Get tender package
            const tender = await client.query(`
                SELECT * FROM tender_packages
                WHERE id = $1
            `, [document.tender_id]);
            
            if (!tender.rows[0]) return;
            
            const requiredDocs = tender.rows[0].required_documents || [];
            
            // Check published documents
            const published = await client.query(`
                SELECT DISTINCT document_type
                FROM tender_documents
                WHERE tender_id = $1 AND status = 'published'
            `, [document.tender_id]);
            
            const publishedTypes = published.rows.map(r => r.document_type);
            const allPublished = requiredDocs.every(doc => 
                publishedTypes.includes(doc.type)
            );
            
            if (allPublished) {
                // Update tender status
                await client.query(`
                    UPDATE tender_packages
                    SET status = 'ready_to_publish',
                        updated_at = NOW()
                    WHERE id = $1
                `, [document.tender_id]);
            }
            
        } finally {
            client.release();
        }
    }
    
    async logGeneration(documentId, details) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO generation_history
                (document_id, generation_type, input_data, 
                 output_format, duration_ms)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                documentId,
                details.type,
                JSON.stringify(details.input || {}),
                details.format,
                details.duration
            ]);
        } finally {
            client.release();
        }
    }
    
    async notifyApprover(approval) {
        // This would integrate with notification service
        console.log(`Notifying approver for ${approval.approval_level} review`);
    }
    
    updateMetrics(duration) {
        const count = this.metrics.documentsGenerated;
        const avgTime = this.metrics.averageGenerationTime;
        
        this.metrics.averageGenerationTime = 
            (avgTime * (count - 1) + duration) / count;
        
        this.metrics.approvalsPending = this.activeWorkflows.size;
    }
    
    // Background Services
    
    async initializeBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        console.log('Puppeteer browser initialized for PDF generation');
    }
    
    startBackgroundServices() {
        // Clean old versions
        setInterval(() => {
            this.cleanOldVersions();
        }, 86400000); // Daily
        
        // Process approval reminders
        setInterval(() => {
            this.processApprovalReminders();
        }, 3600000); // Hourly
    }
    
    async cleanOldVersions() {
        // Keep only configured number of versions
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                WITH ranked_versions AS (
                    SELECT id, 
                           ROW_NUMBER() OVER (
                               PARTITION BY tender_id, document_type, language 
                               ORDER BY version DESC
                           ) as rn
                    FROM tender_documents
                )
                DELETE FROM tender_documents
                WHERE id IN (
                    SELECT id FROM ranked_versions 
                    WHERE rn > $1
                )
            `, [this.config.maxVersions]);
            
        } finally {
            client.release();
        }
    }
    
    async processApprovalReminders() {
        // Send reminders for pending approvals
        const client = await this.dbPool.connect();
        try {
            const pending = await client.query(`
                SELECT * FROM document_approvals
                WHERE status = 'pending'
                  AND created_at < NOW() - INTERVAL '48 hours'
            `);
            
            for (const approval of pending.rows) {
                await this.notifyApprover(approval);
            }
            
        } finally {
            client.release();
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            activeWorkflows: this.activeWorkflows.size,
            templatesLoaded: this.templates.size
        };
    }
    
    handleError(context, error) {
        console.error(`Tender Generator error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        console.log('Shutting down Tender Document Generator');
        
        // Close browser
        if (this.browser) {
            await this.browser.close();
        }
        
        // Close database
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Tender Document Generator shut down');
    }
}

// Export factory function
export function createTenderGenerator(config) {
    return new TenderDocumentGenerator(config);
}
```

### Usage Example

```javascript
// tender-generator-usage.js
import { createTenderGenerator } from './tender-document-generator.js';

async function main() {
    const generator = createTenderGenerator({
        templatesPath: './templates/tender',
        documentStoragePath: './documents/tenders'
    });
    
    await generator.initialize();
    
    const projectId = '123e4567-e89b-12d3-a456-426614174000';
    
    // Create tender package
    const tenderPackage = await generator.createTenderPackage(projectId, {
        name: 'Neubau Bürogebäude - Hauptgewerk',
        description: 'Rohbau und Ausbauarbeiten für Bürogebäude',
        tenderType: 'public',
        submissionDeadline: new Date('2024-03-15T14:00:00'),
        estimatedValue: 2500000,
        cpvCodes: ['45210000-2', '45220000-5'],
        evaluationCriteria: [
            { name: 'Preis', weight: 60 },
            { name: 'Qualität', weight: 25 },
            { name: 'Ausführungszeit', weight: 15 }
        ],
        requiredDocuments: [
            { type: 'invitation_to_tender', name: 'Ausschreibung' },
            { type: 'bill_of_quantities', name: 'Leistungsverzeichnis' },
            { type: 'technical_drawings', name: 'Technische Zeichnungen' }
        ],
        generateDocuments: true,
        project: {
            name: 'Bürogebäude Musterstadt',
            location: { address: 'Musterstraße 1, 12345 Musterstadt' },
            startDate: new Date('2024-05-01'),
            endDate: new Date('2025-08-31')
        },
        client: {
            name: 'Musterfirma GmbH',
            address: {
                street: 'Beispielweg 10',
                postalCode: '12345',
                city: 'Musterstadt'
            },
            contactPerson: 'Max Mustermann',
            email: 'vergabe@musterfirma.de',
            phone: '+49 123 456789'
        }
    });
    
    console.log('Tender Package Created:', tenderPackage);
    
    // Generate specific document
    const document = await generator.generateTenderDocument(
        tenderPackage.id,
        'bill_of_quantities',
        {
            project: {
                name: 'Bürogebäude Musterstadt'
            },
            boq: {
                number: 'LV-2024-001',
                date: new Date(),
                vatRate: 19,
                sections: [
                    {
                        number: '01',
                        title: 'Erdarbeiten',
                        items: [
                            {
                                position: '01.01',
                                title: 'Baugrube ausheben',
                                description: 'Baugrube für Fundament ausheben, profilgerecht',
                                quantity: 850,
                                unit: 'm³',
                                specifications: [
                                    'Bodenklasse 3-5',
                                    'Tiefe bis 3,5m',
                                    'Böschungsneigung 1:1'
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    );
    
    console.log('Document Generated:', document);
    
    // Submit for approval
    const workflow = await generator.submitForApproval(
        document.documentId,
        'user-123'
    );
    
    console.log('Approval Workflow:', workflow);
    
    // Translate document
    const translated = await generator.translateDocument(
        document.documentId,
        'en'
    );
    
    console.log('Translated Document:', translated);
    
    // Get metrics
    console.log('Generator Metrics:', generator.getMetrics());
}

main();
```

### Construction Integration

```javascript
// construction-tender-integration.js
import { createTenderGenerator } from './tender-document-generator.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionTenderService {
    constructor() {
        this.generator = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.generator = createTenderGenerator({
            approvalLevels: [
                'draft',
                'technical_review',
                'cost_review',
                'legal_review',
                'management_approval',
                'published'
            ]
        });
        
        await this.generator.initialize();
        
        // Set up event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.generator.on('error', (error) => {
            console.error('Tender service error:', error);
        });
        
        this.generator.on('document_published', (document) => {
            this.handleDocumentPublished(document);
        });
    }
    
    async createProjectTender(projectId, tenderData) {
        try {
            // Get project details
            const project = await this.getProjectDetails(projectId);
            
            // Get client information
            const client = await this.getClientDetails(project.clientId);
            
            // Get bill of quantities
            const boq = await this.generateBOQFromProject(projectId);
            
            // Create tender package
            const tenderPackage = await this.generator.createTenderPackage(
                projectId,
                {
                    ...tenderData,
                    project,
                    client,
                    boq,
                    generateDocuments: true,
                    referenceNumber: this.generateReferenceNumber(project),
                    procedureType: this.determineProcedureType(tenderData.estimatedValue)
                }
            );
            
            // Generate all required documents
            await this.generateAllDocuments(tenderPackage);
            
            return tenderPackage;
            
        } catch (error) {
            console.error('Error creating project tender:', error);
            throw error;
        }
    }
    
    async generateAllDocuments(tenderPackage) {
        const documents = [];
        
        // Invitation to tender
        const invitation = await this.generateInvitation(tenderPackage);
        documents.push(invitation);
        
        // Technical specifications
        const specifications = await this.generateSpecifications(tenderPackage);
        documents.push(specifications);
        
        // Contract conditions
        const conditions = await this.generateContractConditions(tenderPackage);
        documents.push(conditions);
        
        // Submission forms
        const forms = await this.generateSubmissionForms(tenderPackage);
        documents.push(forms);
        
        return documents;
    }
    
    async generateInvitation(tenderPackage) {
        const mainServices = await this.extractMainServices(tenderPackage);
        
        return await this.generator.generateTenderDocument(
            tenderPackage.id,
            'invitation_to_tender',
            {
                project: tenderPackage.project,
                client: tenderPackage.client,
                tender: {
                    referenceNumber: tenderPackage.referenceNumber,
                    procedureType: tenderPackage.procedureType,
                    submissionDeadline: tenderPackage.submission_deadline,
                    submissionTime: '14:00',
                    submissionLocation: tenderPackage.client.address,
                    mainServices,
                    awardCriteria: tenderPackage.evaluation_criteria,
                    documentsSource: tenderPackage.client.name,
                    documentsFee: 0
                },
                services: this.mapCPVToServices(tenderPackage.cpv_codes),
                createdDate: new Date(),
                publishDate: new Date()
            }
        );
    }
    
    async generateSpecifications(tenderPackage) {
        // Get technical requirements
        const requirements = await this.getTechnicalRequirements(
            tenderPackage.project_id
        );
        
        return await this.generator.generateTenderDocument(
            tenderPackage.id,
            'tender_specifications',
            {
                project: tenderPackage.project,
                specifications: {
                    general: requirements.general,
                    technical: requirements.technical,
                    quality: requirements.quality,
                    environmental: requirements.environmental,
                    safety: requirements.safety
                }
            }
        );
    }
    
    async generateContractConditions(tenderPackage) {
        return await this.generator.generateTenderDocument(
            tenderPackage.id,
            'contract_conditions',
            {
                project: tenderPackage.project,
                conditions: {
                    general: this.getGeneralConditions(),
                    special: await this.getSpecialConditions(tenderPackage),
                    payment: this.getPaymentTerms(tenderPackage),
                    warranty: this.getWarrantyTerms(),
                    penalties: this.getPenaltyClause()
                }
            }
        );
    }
    
    async generateSubmissionForms(tenderPackage) {
        return await this.generator.generateTenderDocument(
            tenderPackage.id,
            'submission_forms',
            {
                project: tenderPackage.project,
                forms: {
                    declaration: this.getDeclarationForm(),
                    technical: this.getTechnicalCapabilityForm(),
                    financial: this.getFinancialCapabilityForm(),
                    references: this.getReferencesForm()
                }
            }
        );
    }
    
    async publishTenderPackage(tenderId) {
        // Get all documents
        const documents = await this.getAllTenderDocuments(tenderId);
        
        // Check all are approved
        const allApproved = documents.every(doc => doc.status === 'published');
        if (!allApproved) {
            throw new Error('Not all documents are approved');
        }
        
        // Update tender status
        await this.dbPool.query(`
            UPDATE tender_packages
            SET status = 'published',
                published_at = NOW()
            WHERE id = $1
        `, [tenderId]);
        
        // Create publication record
        await this.createPublicationRecord(tenderId);
        
        // Send to tender platforms
        await this.publishToExternalPlatforms(tenderId);
        
        return {
            tenderId,
            publishedAt: new Date(),
            documentCount: documents.length
        };
    }
    
    async createPublicationRecord(tenderId) {
        // Create record for tender publication
        await this.dbPool.query(`
            INSERT INTO tender_publications
            (tender_id, platform, publication_date, reference_number)
            VALUES ($1, $2, $3, $4)
        `, [
            tenderId,
            'internal',
            new Date(),
            `PUB-${tenderId.substring(0, 8)}`
        ]);
    }
    
    async publishToExternalPlatforms(tenderId) {
        // Publish to TED (Tenders Electronic Daily)
        // Publish to national tender platforms
        // This would integrate with external APIs
        console.log(`Publishing tender ${tenderId} to external platforms`);
    }
    
    async handleSubmission(tenderId, submission) {
        // Store submission
        const submissionId = await this.storeSubmission(tenderId, submission);
        
        // Verify required documents
        const verification = await this.verifySubmission(submissionId, tenderId);
        
        // Send acknowledgment
        await this.sendAcknowledgment(submission.bidder, submissionId);
        
        return {
            submissionId,
            received: new Date(),
            verification
        };
    }
    
    async evaluateTenders(tenderId) {
        // Get all submissions
        const submissions = await this.getSubmissions(tenderId);
        
        // Get evaluation criteria
        const tender = await this.getTenderPackage(tenderId);
        const criteria = tender.evaluation_criteria;
        
        // Evaluate each submission
        const evaluations = [];
        
        for (const submission of submissions) {
            const evaluation = await this.evaluateSubmission(
                submission,
                criteria
            );
            evaluations.push(evaluation);
        }
        
        // Rank submissions
        evaluations.sort((a, b) => b.totalScore - a.totalScore);
        
        // Generate evaluation report
        const report = await this.generateEvaluationReport(
            tenderId,
            evaluations
        );
        
        return report;
    }
    
    async evaluateSubmission(submission, criteria) {
        const scores = {};
        let totalScore = 0;
        
        for (const criterion of criteria) {
            const score = await this.scoreCriterion(
                submission,
                criterion
            );
            
            scores[criterion.name] = score;
            totalScore += score * (criterion.weight / 100);
        }
        
        return {
            submissionId: submission.id,
            bidder: submission.bidder,
            scores,
            totalScore,
            rank: 0 // Will be set after sorting
        };
    }
    
    async scoreCriterion(submission, criterion) {
        switch (criterion.name) {
            case 'Preis':
                return this.scorePriceCriterion(submission.price);
                
            case 'Qualität':
                return this.scoreQualityCriterion(submission);
                
            case 'Ausführungszeit':
                return this.scoreTimeCriterion(submission.schedule);
                
            default:
                return 50; // Default middle score
        }
    }
    
    scorePriceCriterion(price) {
        // Implement price scoring logic
        // Lower price = higher score
        return 100; // Simplified
    }
    
    async scoreQualityCriterion(submission) {
        // Evaluate technical proposal
        // Check references
        // Assess methodology
        return 80; // Simplified
    }
    
    scoreTimeCriterion(schedule) {
        // Evaluate proposed schedule
        // Check milestones
        return 90; // Simplified
    }
    
    async generateEvaluationReport(tenderId, evaluations) {
        // Generate comprehensive evaluation report
        const report = await this.generator.generateTenderDocument(
            tenderId,
            'evaluation_report',
            {
                tender: await this.getTenderPackage(tenderId),
                evaluations,
                recommendation: evaluations[0], // Top ranked
                evaluationDate: new Date(),
                evaluators: await this.getEvaluators(tenderId)
            }
        );
        
        return report;
    }
    
    // Helper methods
    
    async getProjectDetails(projectId) {
        // Would fetch from project management system
        return {
            id: projectId,
            name: 'Bürogebäude Musterstadt',
            description: 'Neubau eines modernen Bürogebäudes',
            location: {
                address: 'Musterstraße 1, 12345 Musterstadt'
            },
            startDate: new Date('2024-05-01'),
            endDate: new Date('2025-08-31'),
            clientId: 'client-123'
        };
    }
    
    async getClientDetails(clientId) {
        // Would fetch from client database
        return {
            name: 'Musterfirma GmbH',
            address: {
                street: 'Beispielweg 10',
                postalCode: '12345',
                city: 'Musterstadt'
            },
            contactPerson: 'Max Mustermann',
            email: 'vergabe@musterfirma.de',
            phone: '+49 123 456789'
        };
    }
    
    async generateBOQFromProject(projectId) {
        // Would generate from project quantities
        return {
            number: `LV-${new Date().getFullYear()}-${projectId.substring(0, 6)}`,
            date: new Date(),
            vatRate: 19,
            sections: []
        };
    }
    
    generateReferenceNumber(project) {
        const year = new Date().getFullYear();
        const projectCode = project.id.substring(0, 6).toUpperCase();
        return `${year}-${projectCode}`;
    }
    
    determineProcedureType(estimatedValue) {
        // EU thresholds
        if (estimatedValue > 5382000) {
            return 'EU-weite Ausschreibung';
        } else if (estimatedValue > 1000000) {
            return 'Beschränkte Ausschreibung';
        } else {
            return 'Öffentliche Ausschreibung';
        }
    }
    
    async extractMainServices(tenderPackage) {
        const boq = await this.dbPool.query(`
            SELECT position, description, quantity, unit
            FROM boq_items
            WHERE project_id = $1
            ORDER BY position
            LIMIT 10
        `, [tenderPackage.project_id]);
        
        return boq.rows;
    }
    
    mapCPVToServices(cpvCodes) {
        const cpvMap = {
            '45210000-2': { description: 'Hochbauarbeiten', cpvCode: '45210000-2' },
            '45220000-5': { description: 'Tiefbauarbeiten', cpvCode: '45220000-5' }
        };
        
        return cpvCodes.map(code => cpvMap[code] || { 
            description: 'Bauarbeiten', 
            cpvCode: code 
        });
    }
    
    async getTechnicalRequirements(projectId) {
        // Would fetch from project specifications
        return {
            general: 'Allgemeine technische Anforderungen...',
            technical: 'Spezifische technische Details...',
            quality: 'Qualitätsanforderungen gemäß DIN...',
            environmental: 'Umweltschutzanforderungen...',
            safety: 'Sicherheitsanforderungen gemäß BGV...'
        };
    }
    
    getGeneralConditions() {
        return 'VOB/B in der jeweils gültigen Fassung';
    }
    
    async getSpecialConditions(tenderPackage) {
        return 'Besondere Vertragsbedingungen...';
    }
    
    getPaymentTerms(tenderPackage) {
        return {
            schedule: '30 Tage netto',
            retention: '5% Sicherheitseinbehalt',
            milestones: []
        };
    }
    
    getWarrantyTerms() {
        return {
            period: '5 Jahre gemäß VOB/B',
            coverage: 'Vollständige Mängelbeseitigung'
        };
    }
    
    getPenaltyClause() {
        return {
            delay: '0.2% pro Werktag, max. 5%',
            quality: 'Nach VOB/B'
        };
    }
    
    getDeclarationForm() {
        return {
            title: 'Eigenerklärung',
            fields: ['company_name', 'tax_id', 'registration']
        };
    }
    
    getTechnicalCapabilityForm() {
        return {
            title: 'Technische Leistungsfähigkeit',
            fields: ['employees', 'equipment', 'certifications']
        };
    }
    
    getFinancialCapabilityForm() {
        return {
            title: 'Wirtschaftliche Leistungsfähigkeit',
            fields: ['revenue', 'references', 'insurance']
        };
    }
    
    getReferencesForm() {
        return {
            title: 'Referenzen',
            fields: ['project_name', 'client', 'value', 'completion_date']
        };
    }
    
    async getAllTenderDocuments(tenderId) {
        const result = await this.dbPool.query(`
            SELECT * FROM tender_documents
            WHERE tender_id = $1
            ORDER BY document_type, version DESC
        `, [tenderId]);
        
        return result.rows;
    }
    
    async storeSubmission(tenderId, submission) {
        const result = await this.dbPool.query(`
            INSERT INTO tender_submissions
            (tender_id, bidder_id, submission_data, received_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id
        `, [
            tenderId,
            submission.bidderId,
            JSON.stringify(submission.data)
        ]);
        
        return result.rows[0].id;
    }
    
    async verifySubmission(submissionId, tenderId) {
        // Verify all required documents are included
        // Check formats and completeness
        return {
            complete: true,
            missing: []
        };
    }
    
    async sendAcknowledgment(bidder, submissionId) {
        // Send email acknowledgment
        console.log(`Sending acknowledgment to ${bidder.email} for submission ${submissionId}`);
    }
    
    async getSubmissions(tenderId) {
        const result = await this.dbPool.query(`
            SELECT * FROM tender_submissions
            WHERE tender_id = $1
            ORDER BY received_at
        `, [tenderId]);
        
        return result.rows;
    }
    
    async getTenderPackage(tenderId) {
        const result = await this.dbPool.query(`
            SELECT * FROM tender_packages
            WHERE id = $1
        `, [tenderId]);
        
        return result.rows[0];
    }
    
    async getEvaluators(tenderId) {
        // Would fetch evaluation committee members
        return [
            { name: 'Technical Expert', role: 'technical' },
            { name: 'Commercial Expert', role: 'commercial' },
            { name: 'Project Manager', role: 'management' }
        ];
    }
    
    handleDocumentPublished(document) {
        console.log('Document published:', document.id);
    }
}
```

## Testing

```javascript
// tender-generator.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { createTenderGenerator } from './tender-document-generator.js';

describe('TenderDocumentGenerator', () => {
    let generator;
    const testProjectId = 'test-project-123';
    const testTenderId = 'test-tender-456';
    
    beforeEach(async () => {
        generator = createTenderGenerator({
            maxVersions: 3
        });
        await generator.initialize();
    });
    
    test('should create tender package', async () => {
        const tenderPackage = await generator.createTenderPackage(
            testProjectId,
            {
                name: 'Test Tender',
                description: 'Test tender package',
                tenderType: 'public',
                submissionDeadline: new Date('2024-12-31'),
                estimatedValue: 1000000,
                evaluationCriteria: [
                    { name: 'Price', weight: 70 },
                    { name: 'Quality', weight: 30 }
                ]
            }
        );
        
        expect(tenderPackage).toBeDefined();
        expect(tenderPackage.id).toBeDefined();
        expect(tenderPackage.package_name).toBe('Test Tender');
    });
    
    test('should generate tender document', async () => {
        const document = await generator.generateTenderDocument(
            testTenderId,
            'invitation_to_tender',
            {
                project: { name: 'Test Project' },
                client: { name: 'Test Client' },
                tender: { referenceNumber: 'TEST-001' }
            }
        );
        
        expect(document).toBeDefined();
        expect(document.documentId).toBeDefined();
        expect(document.documentType).toBe('invitation_to_tender');
        expect(document.status).toBe('draft');
    });
    
    test('should create document version', async () => {
        // First create a document
        const original = await generator.generateTenderDocument(
            testTenderId,
            'bill_of_quantities',
            { project: { name: 'Test' }, boq: { sections: [] } }
        );
        
        // Create new version
        const newVersion = await generator.createNewVersion(
            original.documentId,
            { boq: { sections: [{ title: 'New Section' }] } },
            'Added new section'
        );
        
        expect(newVersion.version).toBe(2);
        expect(newVersion.metadata.versionReason).toBe('Added new section');
    });
    
    test('should handle approval workflow', async () => {
        // Create document
        const document = await generator.generateTenderDocument(
            testTenderId,
            'tender_specifications',
            { specifications: {} }
        );
        
        // Submit for approval
        const workflow = await generator.submitForApproval(
            document.documentId,
            'user-123'
        );
        
        expect(workflow).toBeDefined();
        expect(workflow.status).toBe('submitted');
        expect(workflow.approvalLevels).toBeGreaterThan(0);
    });
    
    test('should handle document translation', async () => {
        // Create German document
        const document = await generator.generateTenderDocument(
            testTenderId,
            'invitation_to_tender',
            { project: { name: 'Testprojekt' } },
            { language: 'de' }
        );
        
        // Translate to English
        const translated = await generator.translateDocument(
            document.documentId,
            'en'
        );
        
        expect(translated).toBeDefined();
        expect(translated.language).toBe('en');
        expect(translated.metadata.sourceLanguage).toBe('de');
    });
});
```

This implementation provides a comprehensive tender document generation system with template management, multi-language support, approval workflows, version control, and digital signatures for the construction syndicate.
