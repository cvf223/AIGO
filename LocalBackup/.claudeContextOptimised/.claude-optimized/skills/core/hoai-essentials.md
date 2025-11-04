# Hoai-essentials - Essential Patterns

## Core Implementation
```javascript
// hoai-compliance-engine.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { WebSocket } from 'ws';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class HOAIComplianceEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // HOAI 2021 configuration
        this.config = {
            version: 'HOAI_2021',
            baseFeeTable: config.baseFeeTable || 'default',
            difficultyFactors: config.difficultyFactors || {},
            regionalFactors: config.regionalFactors || {},
            inflationIndex: config.inflationIndex || 1.0,
            ...config
        };
        
        this.id = config.id || uuidv4();
        this.state = 'uninitialized';
        
        // Database connection
        this.dbPool = null;
        
        // WebSocket for real-time updates
        this.ws = null;
        this.syncEnabled = config.syncEnabled !== false;
        
        // Cache for performance
        this.cache = {
            feeCalculations: new Map(),
            phaseTemplates: new Map(),
            complianceRules: new Map()
        };
        
        // Metrics
        this.metrics = {
            totalCalculations: 0,
            totalValidations: 0,
            complianceRate: 1.0,
            averageCalculationTime: 0
        };
        
        // HOAI phase definitions
        this.phases = {
            LP1: { name: 'Grundlagenermittlung', percentage: 0.02 },
            LP2: { name: 'Vorplanung', percentage: 0.07 },
            LP3: { name: 'Entwurfsplanung', percentage: 0.15 },
            LP4: { name: 'Genehmigungsplanung', percentage: 0.03 },
            LP5: { name: 'Ausführungsplanung', percentage: 0.25 },
            LP6: { name: 'Vorbereitung der Vergabe', percentage: 0.10 },
            LP7: { name: 'Mitwirkung bei der Vergabe', percentage: 0.04 },
            LP8: { name: 'Objektüberwachung', percentage: 0.32 },
            LP9: { name: 'Objektbetreuung', percentage: 0.02 }
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load HOAI tables and rules
            await this.loadHOAIData();
            
            // Initialize WebSocket
            if (this.syncEnabled) {
                await this.initializeWebSocket();
            }
            
            // Load compliance rules
            await this.loadComplianceRules();
            
            this.state = 'initialized';
            this.emit('initialized', { engineId: this.id });
            
            console.log(`HOAI Engine ${this.id} initialized successfully`);
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            application_name: `hoai_engine_${this.id}`
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // HOAI fee tables
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_fee_tables (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    version VARCHAR(20) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    zone INTEGER NOT NULL,
                    cost_min DECIMAL(15,2) NOT NULL,
                    cost_max DECIMAL(15,2) NOT NULL,
                    fee_min DECIMAL(15,2) NOT NULL,
                    fee_max DECIMAL(15,2) NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    CONSTRAINT unique_fee_entry UNIQUE(version, category, zone, cost_min)
                );
                
                CREATE INDEX IF NOT EXISTS idx_fee_tables_lookup 
                ON hoai_fee_tables(version, category, zone);
            `);
            
            // Project phase tracking
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_project_phases (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    phase VARCHAR(10) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    start_date DATE,
                    end_date DATE,
                    percentage_complete DECIMAL(5,2) DEFAULT 0,
                    fee_calculated DECIMAL(15,2),
                    documents JSONB DEFAULT '[]'::jsonb,
                    compliance_status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    CONSTRAINT unique_project_phase UNIQUE(project_id, phase)
                );
                
                CREATE INDEX IF NOT EXISTS idx_project_phases 
                ON hoai_project_phases(project_id, phase);
            `);
            
            // Fee calculations
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_fee_calculations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    calculation_type VARCHAR(50) NOT NULL,
                    base_cost DECIMAL(15,2) NOT NULL,
                    difficulty_factor DECIMAL(5,3) DEFAULT 1.0,
                    regional_factor DECIMAL(5,3) DEFAULT 1.0,
                    special_services JSONB DEFAULT '[]'::jsonb,
                    base_fee DECIMAL(15,2) NOT NULL,
                    adjusted_fee DECIMAL(15,2) NOT NULL,
                    vat_amount DECIMAL(15,2) NOT NULL,
                    total_fee DECIMAL(15,2) NOT NULL,
                    calculation_details JSONB NOT NULL,
                    approved BOOLEAN DEFAULT false,
                    approved_by UUID,
                    approved_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_fee_calculations 
                ON hoai_fee_calculations(project_id, created_at DESC);
            `);
            
            // Compliance validations
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_compliance_validations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    phase VARCHAR(10) NOT NULL,
                    validation_type VARCHAR(50) NOT NULL,
                    rule_id VARCHAR(100) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    message TEXT NOT NULL,
                    details JSONB DEFAULT '{}'::jsonb,
                    resolved BOOLEAN DEFAULT false,
                    resolved_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_compliance_validations 
                ON hoai_compliance_validations(project_id, phase, status);
            `);
            
            // Document templates
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_document_templates (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    phase VARCHAR(10) NOT NULL,
                    document_type VARCHAR(100) NOT NULL,
                    template_name VARCHAR(200) NOT NULL,
                    template_content TEXT NOT NULL,
                    variables JSONB DEFAULT '[]'::jsonb,
                    version VARCHAR(20) NOT NULL,
                    active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_template UNIQUE(phase, document_type, version)
                );
            `);
            
            // Vergabeterminplan (Tender Schedule)
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_vergabeterminplan (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    tender_package VARCHAR(200) NOT NULL,
                    planned_start DATE NOT NULL,
                    planned_end DATE NOT NULL,
                    actual_start DATE,
                    actual_end DATE,
                    status VARCHAR(50) NOT NULL,
                    dependencies JSONB DEFAULT '[]'::jsonb,
                    critical_path BOOLEAN DEFAULT false,
                    delay_days INTEGER DEFAULT 0,
                    responsible_party VARCHAR(200),
                    documents JSONB DEFAULT '[]'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_vergabeterminplan 
                ON hoai_vergabeterminplan(project_id, planned_start);
            `);
            
            // Mengenermittlung (Quantity Takeoff)
            await client.query(`
                CREATE TABLE IF NOT EXISTS hoai_mengenermittlung (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    position VARCHAR(50) NOT NULL,
                    description TEXT NOT NULL,
                    unit VARCHAR(20) NOT NULL,
                    quantity DECIMAL(15,3) NOT NULL,
                    unit_price DECIMAL(15,2),
                    total_price DECIMAL(15,2),
                    work_section VARCHAR(100) NOT NULL,
                    material_type VARCHAR(100),
                    din_reference VARCHAR(50),
                    calculation_method TEXT,
                    verified BOOLEAN DEFAULT false,
                    verified_by UUID,
                    verified_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_mengenermittlung 
                ON hoai_mengenermittlung(project_id, work_section);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Database schema creation failed: ${error.message}`);
        } finally {
            client.release();
        }
    }
    
    async loadHOAIData() {
        // Load fee tables
        const client = await this.dbPool.connect();
        try {
            // Check if data exists
            const result = await client.query(
                'SELECT COUNT(*) FROM hoai_fee_tables WHERE version = $1',
                [this.config.version]
            );
            
            if (result.rows[0].count === '0') {
                // Load default HOAI 2021 fee tables
                await this.loadDefaultFeeTables(client);
            }
            
        } finally {
            client.release();
        }
    }
    
    async loadDefaultFeeTables(client) {
        // HOAI 2021 fee table data (simplified example)
        const feeData = [
            // Zone I - Very simple
            { zone: 1, cost_min: 0, cost_max: 25000, fee_min: 3000, fee_max: 3500 },
            { zone: 1, cost_min: 25000, cost_max: 50000, fee_min: 3500, fee_max: 6000 },
            // ... more entries
            
            // Zone V - Very complex
            { zone: 5, cost_min: 10000000, cost_max: 25000000, fee_min: 850000, fee_max: 1200000 },
            // ... complete table
        ];
        
        for (const entry of feeData) {
            await client.query(`
                INSERT INTO hoai_fee_tables 
                (version, category, zone, cost_min, cost_max, fee_min, fee_max)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (version, category, zone, cost_min) DO NOTHING
            `, [
                this.config.version,
                'building',
                entry.zone,
                entry.cost_min,
                entry.cost_max,
                entry.fee_min,
                entry.fee_max
            ]);
        }
    }
    
    async initializeWebSocket() {
        const wsUrl = process.env.WEBSOCKET_URL || 'ws://localhost:3001';
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.on('open', () => {
            console.log(`HOAI Engine ${this.id} connected to WebSocket`);
            this.ws.send(JSON.stringify({
                type: 'register',
                engineId: this.id,
                engineType: 'hoai_compliance'
            }));
        });
        
        this.ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);
                await this.handleWebSocketMessage(message);
            } catch (error) {
                this.handleError('websocket_message', error);
            }
        });
        
        this.ws.on('error', (error) => {
            this.handleError('websocket', error);
        });
        
        this.ws.on('close', () => {
            console.log(`HOAI Engine ${this.id} WebSocket disconnected`);
            if (this.syncEnabled && this.state !== 'shutting_down') {
                setTimeout(() => this.initializeWebSocket(), 5000);
            }
        });
    }
    
    async handleWebSocketMessage(message) {
        switch (message.type) {
            case 'calculation_request':
                await this.handleCalculationRequest(message);
                break;
                
            case 'validation_request':
                await this.handleValidationRequest(message);
                break;
                
            case 'document_generation':
                await this.handleDocumentGeneration(message);
                break;
                
            default:
                console.log(`Unknown message type: ${message.type}`);
        }
    }
    
    // Fee Calculation Methods
    
    async calculateProjectFees(project) {
        const startTime = Date.now();
        
        try {
            // Check cache first
            const cacheKey = this.getCacheKey(project);
            if (this.cache.feeCalculations.has(cacheKey)) {
                return this.cache.feeCalculations.get(cacheKey);
            }
            
            // Extract project parameters
            const {
                constructionCost,
                projectType,
                difficultyZone,
                location,
                specialServices = []
            } = project;
            
            // Validate inputs
            this.validateProjectInputs(project);
            
            // Calculate base fee
            const baseFee = await this.calculateBaseFee(
                constructionCost,
                projectType,
                difficultyZone
            );
            
            // Apply adjustments
            const difficultyFactor = this.getDifficultyFactor(difficultyZone);
            const regionalFactor = this.getRegionalFactor(location);
            
            // Calculate special services
            const specialServicesFee = await this.calculateSpecialServices(
                specialServices,
                baseFee
            );
            
            // Calculate phase fees
            const phaseFees = this.calculatePhaseFees(baseFee);
            
            // Final calculation
            const adjustedFee = baseFee * difficultyFactor * regionalFactor;
            const subtotal = adjustedFee + specialServicesFee;
            const vatRate = 0.19; // German VAT
            const vatAmount = subtotal * vatRate;
            const totalFee = subtotal + vatAmount;
            
            const calculation = {
                projectId: project.id,
                baseFee,
                difficultyFactor,
                regionalFactor,
                specialServicesFee,
                adjustedFee,
                subtotal,
                vatAmount,
                totalFee,
                phaseFees,
                breakdown: {
                    phases: this.generatePhaseBreakdown(phaseFees),
                    specialServices: specialServices
                },
                calculationDate: new Date().toISOString(),
                validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
            };
            
            // Save to database
            await this.saveFeeCalculation(project, calculation);
            
            // Cache result
            this.cache.feeCalculations.set(cacheKey, calculation);
            
            // Broadcast update
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'fee_calculated',
                    projectId: project.id,
                    totalFee
                }));
            }
            
            this.recordMetric('fee_calculation', Date.now() - startTime);
            
            return calculation;
            
        } catch (error) {
            this.handleError('fee_calculation', error);
            throw error;
        }
    }
    
    validateProjectInputs(project) {
        const required = ['constructionCost', 'projectType', 'difficultyZone'];
        
        for (const field of required) {
            if (!project[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (project.constructionCost < 0) {
            throw new Error('Construction cost cannot be negative');
        }
        
        if (project.difficultyZone < 1 || project.difficultyZone > 5) {
            throw new Error('Difficulty zone must be between 1 and 5');
        }
    }
    
    async calculateBaseFee(constructionCost, projectType, difficultyZone) {
        const client = await this.dbPool.connect();
        try {
            // Find appropriate fee range
            const result = await client.query(`
                SELECT fee_min, fee_max, cost_min, cost_max
                FROM hoai_fee_tables
                WHERE version = $1
                  AND category = $2
                  AND zone = $3
                  AND cost_min <= $4
                  AND cost_max >= $4
                ORDER BY cost_min DESC
                LIMIT 1
            `, [this.config.version, projectType, difficultyZone, constructionCost]);
            
            if (result.rows.length === 0) {
                // Use interpolation for values outside table
                return await this.interpolateFee(
                    constructionCost,
                    projectType,
                    difficultyZone,
                    client
                );
            }
            
            const { fee_min, fee_max, cost_min, cost_max } = result.rows[0];
            
            // Linear interpolation within range
            const costRatio = (constructionCost - cost_min) / (cost_max - cost_min);
            const baseFee = fee_min + (fee_max - fee_min) * costRatio;
            
            return Math.round(baseFee * 100) / 100;
            
        } finally {
            client.release();
        }
    }
    
    async interpolateFee(cost, projectType, zone, client) {
        // Get nearest ranges for interpolation
        const below = await client.query(`
            SELECT * FROM hoai_fee_tables
            WHERE version = $1 AND category = $2 AND zone = $3 AND cost_max < $4
            ORDER BY cost_max DESC LIMIT 1
        `, [this.config.version, projectType, zone, cost]);
        
        const above = await client.query(`
            SELECT * FROM hoai_fee_tables
            WHERE version = $1 AND category = $2 AND zone = $3 AND cost_min > $4
            ORDER BY cost_min ASC LIMIT 1
        `, [this.config.version, projectType, zone, cost]);
        
        if (below.rows.length > 0 && above.rows.length > 0) {
            // Extrapolate between ranges
            const slope = (above.rows[0].fee_min - below.rows[0].fee_max) /
                         (above.rows[0].cost_min - below.rows[0].cost_max);
            const fee = below.rows[0].fee_max + slope * (cost - below.rows[0].cost_max);
            return Math.round(fee * 100) / 100;
        }
        
        throw new Error('Cannot calculate fee - cost outside all ranges');
    }
    
    getDifficultyFactor(zone) {
        // HOAI difficulty factors
        const factors = {
            1: 0.85,  // Very simple
            2: 0.925, // Simple
            3: 1.0,   // Average
            4: 1.075, // Complex
            5: 1.15   // Very complex
        };
        
        return factors[zone] || 1.0;
    }
    
    getRegionalFactor(location) {
        // Regional cost factors for Germany
        const regionalFactors = {
            'munich': 1.15,
            'frankfurt': 1.12,
            'stuttgart': 1.10,
            'hamburg': 1.08,
            'berlin': 1.05,
            'cologne': 1.03,
            'leipzig': 0.95,
            'dresden': 0.93,
            // ... more cities
        };
        
        const city = location.toLowerCase();
        return regionalFactors[city] || 1.0;
    }
    
    async calculateSpecialServices(services, baseFee) {
        let totalSpecialFee = 0;
        
        for (const service of services) {
            switch (service.type) {
                case 'thermal_simulation':
                    totalSpecialFee += baseFee * 0.05;
                    break;
                    
                case 'bim_coordination':
                    totalSpecialFee += baseFee * 0.08;
                    break;
                    
                case 'sustainability_certification':
                    totalSpecialFee += baseFee * 0.06;
                    break;
                    
                case 'complex_foundation':
                    totalSpecialFee += baseFee * 0.04;
                    break;
                    
                case 'historic_preservation':
                    totalSpecialFee += baseFee * 0.07;
                    break;
                    
                default:
                    // Custom service with specified percentage
                    if (service.percentage) {
                        totalSpecialFee += baseFee * service.percentage;
                    }
            }
        }
        
        return Math.round(totalSpecialFee * 100) / 100;
    }
    
    calculatePhaseFees(baseFee) {
        const phaseFees = {};
        
        for (const [phase, info] of Object.entries(this.phases)) {
            phaseFees[phase] = {
                name: info.name,
                percentage: info.percentage,
                fee: Math.round(baseFee * info.percentage * 100) / 100
            };
        }
        
        return phaseFees;
    }
    
    generatePhaseBreakdown(phaseFees) {
        const breakdown = [];
        
        for (const [phase, info] of Object.entries(phaseFees)) {
            breakdown.push({
                phase,
                name: info.name,
                percentage: (info.percentage * 100).toFixed(1) + '%',
                fee: info.fee,
                services: this.getPhaseServices(phase)
            });
        }
        
        return breakdown;
    }
    
    getPhaseServices(phase) {
        const phaseServices = {
            LP1: [
                'Klären der Aufgabenstellung',
                'Standortanalyse',
                'Betriebsplanung',
                'Grundlagenermittlung'
            ],
            LP2: [
                'Analyse der Grundlagen',
                'Abstimmen der Zielvorstellungen',
                'Vorplanung Konzept',
                'Kostenschätzung DIN 276'
            ],
            LP3: [
                'Erarbeiten Entwurf',
                'Objektbeschreibung',
                'Kostenberechnung DIN 276',
                'Terminplanung'
            ],
            LP4: [
                'Genehmigungsplanung',
                'Bauantrag erstellen',
                'Nachweise führen',
                'Anpassungen'
            ],
            LP5: [
                'Ausführungsplanung',
                'Detailzeichnungen',
                'Materiallisten',
                'Fortschreiben Kostenberechnung'
            ],
            LP6: [
                'Leistungsbeschreibung',
                'Mengenermittlung',
                'Kostenkontrolle',
                'Vergabeunterlagen'
            ],
            LP7: [
                'Angebotsauswertung',
                'Preisprüfung',
                'Vergabevorschlag',
                'Kostenanschlag'
            ],
            LP8: [
                'Bauüberwachung',
                'Kostenfeststellung',
                'Terminüberwachung',
                'Abnahme'
            ],
            LP9: [
                'Objektbegehung',
                'Mängelbeseitigung',
                'Gewährleistung',
                'Dokumentation'
            ]
        };
        
        return phaseServices[phase] || [];
    }
    
    async saveFeeCalculation(project, calculation) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO hoai_fee_calculations
                (project_id, calculation_type, base_cost, difficulty_factor,
                 regional_factor, special_services, base_fee, adjusted_fee,
                 vat_amount, total_fee, calculation_details)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                project.id,
                'standard',
                project.constructionCost,
                calculation.difficultyFactor,
                calculation.regionalFactor,
                JSON.stringify(project.specialServices || []),
                calculation.baseFee,
                calculation.adjustedFee,
                calculation.vatAmount,
                calculation.totalFee,
                JSON.stringify(calculation)
            ]);
            
            calculation.id = result.rows[0].id;
            
            this.metrics.totalCalculations++;
            
        } finally {
            client.release();
        }
    }
    
    getCacheKey(project) {
        const key = `${project.id}_${project.constructionCost}_${project.difficultyZone}`;
        return crypto.createHash('sha256').update(key).digest('hex');
    }
    
    // Compliance Validation Methods
    
    async validatePhaseCompliance(projectId, phase) {
        const startTime = Date.now();
        
        try {
            const validations = [];
            
            // Load phase data
            const phaseData = await this.loadPhaseData(projectId, phase);
            
            // Run validation rules
            const rules = await this.getPhaseRules(phase);
            
            for (const rule of rules) {
                const validation = await this.runValidationRule(
                    rule,
                    phaseData,
                    projectId,
                    phase
                );
                validations.push(validation);
            }
            
            // Save validations
            await this.saveValidations(validations);
            
            // Calculate compliance score
            const complianceScore = this.calculateComplianceScore(validations);
            
            // Update metrics
            this.updateComplianceMetrics(complianceScore);
            
            this.recordMetric('compliance_validation', Date.now() - startTime);
            
            return {
                projectId,
                phase,
                validations,
                complianceScore,
                compliant: complianceScore >= 0.95,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.handleError('compliance_validation', error);
            throw error;
        }
    }
    
    async loadPhaseData(projectId, phase) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM hoai_project_phases
                WHERE project_id = $1 AND phase = $2
            `, [projectId, phase]);
            
            if (result.rows.length === 0) {
                throw new Error(`Phase ${phase} not found for project ${projectId}`);
            }
            
            return result.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    async getPhaseRules(phase) {
        // Check cache
        if (this.cache.complianceRules.has(phase)) {
            return this.cache.complianceRules.get(phase);
        }
        
        // Phase-specific validation rules
        const rules = {
            LP1: [
                {
                    id: 'LP1_001',
                    name: 'Grundlagenermittlung vollständig',
                    check: 'documentsComplete',
                    required: ['standortanalyse', 'raumprogramm', 'kostenrahmen'],
                    severity: 'error'
                },
                {
                    id: 'LP1_002',
                    name: 'Auftraggeber Abstimmung',
                    check: 'approvalExists',
                    required: ['client_approval'],
                    severity: 'warning'
                }
            ],
            LP2: [
                {
                    id: 'LP2_001',
                    name: 'Kostenschätzung DIN 276',
                    check: 'costEstimateValid',
                    tolerance: 0.3,
                    severity: 'error'
                },
                {
                    id: 'LP2_002',
                    name: 'Vorplanung Zeichnungen',
                    check: 'drawingsComplete',
                    required: ['lageplan', 'grundrisse', 'schnitte', 'ansichten'],
                    severity: 'error'
                }
            ],
            LP3: [
                {
                    id: 'LP3_001',
                    name: 'Kostenberechnung DIN 276',
                    check: 'costCalculationValid',
                    tolerance: 0.2,
                    severity: 'error'
                },
                {
                    id: 'LP3_002',
                    name: 'Entwurfsplanung vollständig',
                    check: 'designComplete',
                    required: ['werkplanung', 'details', 'materialkonzept'],
                    severity: 'error'
                }
            ],
            LP4: [
                {
                    id: 'LP4_001',
                    name: 'Bauantrag vollständig',
                    check: 'permitApplicationComplete',
                    required: ['bauantrag', 'nachweise', 'berechnungen'],
                    severity: 'error'
                },
                {
                    id: 'LP4_002',
                    name: 'Behördliche Auflagen',
                    check: 'authorityRequirements',
                    severity: 'warning'
                }
            ],
            LP5: [
                {
                    id: 'LP5_001',
                    name: 'Ausführungsplanung komplett',
                    check: 'executionDrawingsComplete',
                    required: ['ausfuehrungsplaene', 'details_1_50', 'details_1_20'],
                    severity: 'error'
                },
                {
                    id: 'LP5_002',
                    name: 'Kostenverfolgung',
                    check: 'costTracking',
                    tolerance: 0.1,
                    severity: 'warning'
                }
            ],
            LP6: [
                {
                    id: 'LP6_001',
                    name: 'Leistungsverzeichnis vollständig',
                    check: 'tenderDocumentsComplete',
                    required: ['lv_rohbau', 'lv_ausbau', 'lv_technik'],
                    severity: 'error'
                },
                {
                    id: 'LP6_002',
                    name: 'Mengenermittlung geprüft',
                    check: 'quantityTakeoffVerified',
                    severity: 'error'
                }
            ],
            LP7: [
                {
                    id: 'LP7_001',
                    name: 'Angebotsauswertung',
                    check: 'bidEvaluationComplete',
                    required: ['preisspiegel', 'bewertungsmatrix'],
                    severity: 'error'
                },
                {
                    id: 'LP7_002',
                    name: 'Vergabevorschlag',
                    check: 'awardProposal',
                    severity: 'warning'
                }
            ],
            LP8: [
                {
                    id: 'LP8_001',
                    name: 'Bauüberwachung Protokolle',
                    check: 'supervisionProtocols',
                    frequency: 'weekly',
                    severity: 'error'
                },
                {
                    id: 'LP8_002',
                    name: 'Kostenfeststellung',
                    check: 'costDetermination',
                    tolerance: 0.05,
                    severity: 'error'
                }
            ],
            LP9: [
                {
                    id: 'LP9_001',
                    name: 'Abnahmeprotokoll',
                    check: 'acceptanceProtocol',
                    required: ['abnahmeprotokoll', 'maengelliste'],
                    severity: 'error'
                },
                {
                    id: 'LP9_002',
                    name: 'Dokumentation übergeben',
                    check: 'documentationHandover',
                    severity: 'warning'
                }
            ]
        };
        
        const phaseRules = rules[phase] || [];
        
        // Cache rules
        this.cache.complianceRules.set(phase, phaseRules);
        
        return phaseRules;
    }
    
    async runValidationRule(rule, phaseData, projectId, phase) {
        let status = 'passed';
        let message = '';
        let details = {};
        
        switch (rule.check) {
            case 'documentsComplete':
                const missingDocs = rule.required.filter(
                    doc => !phaseData.documents.includes(doc)
                );
                if (missingDocs.length > 0) {
                    status = 'failed';
                    message = `Missing required documents: ${missingDocs.join(', ')}`;
                    details = { missingDocuments: missingDocs };
                }
                break;
                
            case 'costEstimateValid':
                const deviation = await this.checkCostDeviation(projectId, phase);
                if (Math.abs(deviation) > rule.tolerance) {
                    status = 'failed';
                    message = `Cost deviation ${(deviation * 100).toFixed(1)}% exceeds tolerance`;
                    details = { deviation, tolerance: rule.tolerance };
                }
                break;
                
            case 'approvalExists':
                const approvals = await this.checkApprovals(projectId, phase, rule.required);
                if (!approvals.allPresent) {
                    status = 'failed';
                    message = `Missing approvals: ${approvals.missing.join(', ')}`;
                    details = { missingApprovals: approvals.missing };
                }
                break;
                
            case 'quantityTakeoffVerified':
                const verified = await this.checkQuantityTakeoff(projectId);
                if (!verified) {
                    status = 'failed';
                    message = 'Quantity takeoff not verified';
                    details = { verificationRequired: true };
                }
                break;
                
            // ... more validation checks
        }
        
        return {
            projectId,
            phase,
            validationType: rule.check,
            ruleId: rule.id,
            status,
            severity: rule.severity,
            message: message || `${rule.name} validation passed`,
            details,
            timestamp: new Date().toISOString()
        };
    }
    
    async checkCostDeviation(projectId, phase) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    initial_estimate,
                    current_estimate,
                    (current_estimate - initial_estimate) / initial_estimate as deviation
                FROM project_costs
                WHERE project_id = $1 AND phase = $2
            `, [projectId, phase]);
            
            return result.rows[0]?.deviation || 0;
            
        } finally {
            client.release();
        }
    }
    
    async checkApprovals(projectId, phase, required) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT approval_type
                FROM project_approvals
                WHERE project_id = $1 AND phase = $2 AND approved = true
            `, [projectId, phase]);
            
            const existing = result.rows.map(r => r.approval_type);
            const missing = required.filter(r => !existing.includes(r));
            
            return {
                allPresent: missing.length === 0,
                missing
            };
            
        } finally {
            client.release();
        }
    }
    
    async checkQuantityTakeoff(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT COUNT(*) as total, COUNT(verified) as verified
                FROM hoai_mengenermittlung
                WHERE project_id = $1
            `, [projectId]);
            
            const { total, verified } = result.rows[0];
            return total > 0 && total === verified;
            
        } finally {
            client.release();
        }
    }
    
    async saveValidations(validations) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            for (const validation of validations) {
                await client.query(`
                    INSERT INTO hoai_compliance_validations
                    (project_id, phase, validation_type, rule_id, status,
                     severity, message, details)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    validation.projectId,
                    validation.phase,
                    validation.validationType,
                    validation.ruleId,
                    validation.status,
                    validation.severity,
                    validation.message,
                    JSON.stringify(validation.details)
                ]);
            }
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    calculateComplianceScore(validations) {
        if (validations.length === 0) return 1.0;
        
        let score = 0;
        let weight = 0;
        
        for (const validation of validations) {
            const severityWeight = {
                'error': 3,
                'warning': 1,
                'info': 0.5
            }[validation.severity] || 1;
            
            if (validation.status === 'passed') {
                score += severityWeight;
            }
            
            weight += severityWeight;
        }
        
        return weight > 0 ? score / weight : 1.0;
    }
    
    updateComplianceMetrics(score) {
        this.metrics.totalValidations++;
        this.metrics.complianceRate = 
            (this.metrics.complianceRate * (this.metrics.totalValidations - 1) + score) /
            this.metrics.totalValidations;
    }
    
    // Document Generation Methods
    
    async generatePhaseDocument(projectId, phase, documentType) {
        const startTime = Date.now();
        
        try {
            // Load template
            const template = await this.loadDocumentTemplate(phase, documentType);
            
            // Load project data
            const projectData = await this.loadProjectData(projectId);
            const phaseData = await this.loadPhaseData(projectId, phase);
            
            // Prepare variables
            const variables = await this.prepareDocumentVariables(
                projectData,
                phaseData,
                phase
            );
            
            // Generate document
            const document = await this.renderDocument(template, variables);
            
            // Generate PDF
            const pdf = await this.generatePDF(document);
            
            // Save document
            const documentId = await this.saveDocument(
                projectId,
                phase,
                documentType,
                pdf
            );
            
            this.recordMetric('document_generation', Date.now() - startTime);
            
            return {
                documentId,
                type: documentType,
                phase,
                size: pdf.length,
                generated: new Date().toISOString()
            };
            
        } catch (error) {
            this.handleError('document_generation', error);
            throw error;
        }
    }
    
    async loadDocumentTemplate(phase, documentType) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT template_content, variables
                FROM hoai_document_templates
                WHERE phase = $1 AND document_type = $2 AND active = true
                AND version = $3
                ORDER BY updated_at DESC
                LIMIT 1
            `, [phase, documentType, this.config.version]);
            
            if (result.rows.length === 0) {
                throw new Error(`Template not found for ${phase}/${documentType}`);
            }
            
            return result.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    async loadProjectData(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    p.*,
                    c.name as client_name,
                    c.address as client_address,
                    a.name as architect_name,
                    a.registration_number
                FROM projects p
                JOIN clients c ON p.client_id = c.id
                JOIN architects a ON p.architect_id = a.id
                WHERE p.id = $1
            `, [projectId]);
            
            return result.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    async prepareDocumentVariables(projectData, phaseData, phase) {
        const variables = {
            // Project information
            project: {
                name: projectData.name,
                number: projectData.project_number,
                address: projectData.address,
                type: projectData.type,
                constructionCost: this.formatCurrency(projectData.construction_cost)
            },
            
            // Client information
            client: {
                name: projectData.client_name,
                address: projectData.client_address
            },
            
            // Architect information
            architect: {
                name: projectData.architect_name,
                registrationNumber: projectData.registration_number
            },
            
            // Phase information
            phase: {
                code: phase,
                name: this.phases[phase].name,
                startDate: this.formatDate(phaseData.start_date),
                endDate: this.formatDate(phaseData.end_date),
                percentageComplete: phaseData.percentage_complete
            },
            
            // Date information
            date: {
                current: this.formatDate(new Date()),
                year: new Date().getFullYear()
            },
            
            // Fee information
            fees: await this.getProjectFees(projectData.id, phase)
        };
        
        // Add phase-specific variables
        switch (phase) {
            case 'LP1':
                variables.grundlagen = await this.getGrundlagenData(projectData.id);
                break;
                
            case 'LP2':
                variables.kostenschaetzung = await this.getKostenschaetzung(projectData.id);
                break;
                
            case 'LP6':
                variables.vergabe = await this.getVergabeData(projectData.id);
                break;
                
            // ... more phase-specific data
        }
        
        return variables;
    }
    
    async renderDocument(template, variables) {
        let content = template.template_content;
        
        // Replace variables in template
        const replaceVariables = (str, vars, prefix = '') => {
            for (const [key, value] of Object.entries(vars)) {
                const varKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null) {
                    str = replaceVariables(str, value, varKey);
                } else {
                    const regex = new RegExp(`\\{\\{\\s*${varKey}\\s*\\}\\}`, 'g');
                    str = str.replace(regex, value || '');
                }
            }
            return str;
        };
        
        content = replaceVariables(content, variables);
        
        // Process conditionals
        content = this.processConditionals(content, variables);
        
        // Process loops
        content = this.processLoops(content, variables);
        
        return content;
    }
    
    processConditionals(content, variables) {
        const conditionalRegex = /\{\{#if\s+(.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        return content.replace(conditionalRegex, (match, condition, body) => {
            const result = this.evaluateCondition(condition, variables);
            return result ? body : '';
        });
    }
    
    processLoops(content, variables) {
        const loopRegex = /\{\{#each\s+(.+?)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        
        return content.replace(loopRegex, (match, arrayPath, body) => {
            const array = this.getValueByPath(arrayPath, variables);
            if (!Array.isArray(array)) return '';
            
            return array.map((item, index) => {
                let itemBody = body;
                itemBody = itemBody.replace(/\{\{this\}\}/g, item);
                itemBody = itemBody.replace(/\{\{@index\}\}/g, index);
                return itemBody;
            }).join('');
        });
    }
    
    evaluateCondition(condition, variables) {
        // Simple condition evaluation (can be enhanced)
        const value = this.getValueByPath(condition, variables);
        return !!value;
    }
    
    getValueByPath(path, obj) {
        return path.split('.').reduce((current, part) => 
            current && current[part], obj);
    }
    
    async generatePDF(content) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: 'HOAI Document',
                    Author: 'HOAI Compliance Engine',
                    Subject: 'Construction Project Documentation',
                    CreationDate: new Date()
                }
            });
            
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Add header
            doc.fontSize(10)
               .text('HOAI Compliance Document', 50, 50)
               .moveDown();
            
            // Add content (HTML to PDF conversion would be more sophisticated)
            doc.fontSize(12)
               .text(content, {
                   align: 'justify',
                   lineGap: 2
               });
            
            doc.end();
        });
    }
    
    async saveDocument(projectId, phase, documentType, pdfBuffer) {
        const client = await this.dbPool.connect();
        try {
            // Store in database or file system
            const documentId = uuidv4();
            
            // Update phase documents
            await client.query(`
                UPDATE hoai_project_phases
                SET documents = documents || $1::jsonb,
                    updated_at = NOW()
                WHERE project_id = $2 AND phase = $3
            `, [
                JSON.stringify([{
                    id: documentId,
                    type: documentType,
                    size: pdfBuffer.length,
                    created: new Date().toISOString()
                }]),
                projectId,
                phase
            ]);
            
            // Store PDF (simplified - would use proper storage service)
            // await storageService.save(documentId, pdfBuffer);
            
            return documentId;
            
        } finally {
            client.release();
        }
    }
    
    // Vergabeterminplan Methods
    
    async createVergabeterminplan(projectId, tenderPackages) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            for (const package of tenderPackages) {
                await client.query(`
                    INSERT INTO hoai_vergabeterminplan
                    (project_id, tender_package, planned_start, planned_end,
                     status, dependencies, responsible_party)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    projectId,
                    package.name,
                    package.plannedStart,
                    package.plannedEnd,
                    'planned',
                    JSON.stringify(package.dependencies || []),
                    package.responsibleParty
                ]);
            }
            
            // Calculate critical path
            await this.calculateCriticalPath(projectId);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async calculateCriticalPath(projectId) {
        // Implement critical path method (CPM) algorithm
        const packages = await this.loadTenderPackages(projectId);
        
        // Build dependency graph
        const graph = this.buildDependencyGraph(packages);
        
        // Calculate earliest start/finish times
        const earliestTimes = this.calculateEarliestTimes(graph);
        
        // Calculate latest start/finish times
        const latestTimes = this.calculateLatestTimes(graph, earliestTimes);
        
        // Identify critical path
        const criticalPath = this.identifyCriticalPath(
            earliestTimes,
            latestTimes
        );
        
        // Update database
        await this.updateCriticalPath(projectId, criticalPath);
    }
    
    // Mengenermittlung Methods
    
    async createMengenermittlung(projectId, quantities) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            for (const item of quantities) {
                const totalPrice = item.quantity * (item.unitPrice || 0);
                
                await client.query(`
                    INSERT INTO hoai_mengenermittlung
                    (project_id, position, description, unit, quantity,
                     unit_price, total_price, work_section, material_type,
                     din_reference, calculation_method)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [
                    projectId,
                    item.position,
                    item.description,
                    item.unit,
                    item.quantity,
                    item.unitPrice,
                    totalPrice,
                    item.workSection,
                    item.materialType,
                    item.dinReference,
                    item.calculationMethod
                ]);
            }
            
            await client.query('COMMIT');
            
            // Trigger verification workflow
            await this.triggerQuantityVerification(projectId);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async verifyMengenermittlung(projectId, position, verifierId) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE hoai_mengenermittlung
                SET verified = true,
                    verified_by = $1,
                    verified_at = NOW()
                WHERE project_id = $2 AND position = $3
            `, [verifierId, projectId, position]);
            
            // Check if all quantities are verified
            const result = await client.query(`
                SELECT COUNT(*) as total,
                       COUNT(CASE WHEN verified THEN 1 END) as verified
                FROM hoai_mengenermittlung
                WHERE project_id = $1
            `, [projectId]);
            
            const { total, verified } = result.rows[0];
            
            if (total === verified) {
                // All verified - update project phase
                await this.updatePhaseStatus(projectId, 'LP6', 'quantities_verified');
            }
            
        } finally {
            client.release();
        }
    }
    
    // Utility Methods
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
    
    formatDate(date) {
        if (!date) return '';
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(date));
    }
    
    async loadComplianceRules() {
        // Load all compliance rules into cache
        const rules = {
            documentRequirements: await this.loadDocumentRequirements(),
            costTolerances: await this.loadCostTolerances(),
            timelineRequirements: await this.loadTimelineRequirements(),
            qualityStandards: await this.loadQualityStandards()
        };
        
        this.complianceRules = rules;
    }
    
    handleError(operation, error) {
        console.error(`HOAI Engine ${this.id} error in ${operation}:`, error);
        
        this.emit('error', {
            engineId: this.id,
            operation,
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
    
    recordMetric(operation, duration) {
        this.metrics.averageCalculationTime = 
            (this.metrics.averageCalculationTime * 
             (this.metrics.totalCalculations + this.metrics.totalValidations - 1) + 
             duration) / 
            (this.metrics.totalCalculations + this.metrics.totalValidations);
            
        this.emit('metric', {
            engineId: this.id,
            operation,
            duration
        });
    }
    
    async shutdown() {
        this.state = 'shutting_down';
        
        // Close WebSocket
        if (this.ws) {
            this.ws.close();
        }
        
        // Clear cache
        this.cache.feeCalculations.clear();
        this.cache.phaseTemplates.clear();
        this.cache.complianceRules.clear();
        
        // Close database pool
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log(`HOAI Engine ${this.id} shut down`);
    }
}

// Export factory function
export function createHOAIComplianceEngine(config) {
    return new HOAIComplianceEngine(config);
}
```

```javascript
// hoai-usage-example.js
import { createHOAIComplianceEngine } from './hoai-compliance-engine.js';

async function main() {
    // Initialize HOAI engine
    const hoaiEngine = createHOAIComplianceEngine({
        version: 'HOAI_2021',
        syncEnabled: true
    });
    
    try {
        await hoaiEngine.initialize();
        
        // Example project
        const project = {
            id: 'project-123',
            constructionCost: 5000000, // 5 million EUR
            projectType: 'building',
            difficultyZone: 3, // Average complexity
            location: 'Munich',
            specialServices: [
                { type: 'bim_coordination' },
                { type: 'sustainability_certification' }
            ]
        };
        
        // Calculate fees
        const feeCalculation = await hoaiEngine.calculateProjectFees(project);
        
        console.log('Fee Calculation:', {
            baseFee: feeCalculation.baseFee,
            totalFee: feeCalculation.totalFee,
            phases: feeCalculation.phaseFees
        });
        
        // Validate phase compliance
        const compliance = await hoaiEngine.validatePhaseCompliance(
            project.id,
            'LP3'
        );
        
        console.log('Compliance Check:', {
            compliant: compliance.compliant,
            score: compliance.complianceScore,
            issues: compliance.validations.filter(v => v.status === 'failed')
        });
        
        // Generate document
        const document = await hoaiEngine.generatePhaseDocument(
            project.id,
            'LP3',
            'kostenberechnung'
        );
        
        console.log('Document Generated:', document);
        
        // Create Vergabeterminplan
        await hoaiEngine.createVergabeterminplan(project.id, [
            {
                name: 'Rohbau',
                plannedStart: new Date('2024-03-01'),
                plannedEnd: new Date('2024-08-31'),
                responsibleParty: 'Bauleiter Schmidt'
            },
            {
                name: 'Haustechnik',
                plannedStart: new Date('2024-06-01'),
                plannedEnd: new Date('2024-10-31'),
                dependencies: ['Rohbau'],
                responsibleParty: 'Ing. Mueller'
            }
        ]);
        
        // Create Mengenermittlung
        await hoaiEngine.createMengenermittlung(project.id, [
            {
                position: '03.01.010',
                description: 'Beton C25/30 für Bodenplatte',
                unit: 'm³',
                quantity: 450,
                unitPrice: 120,
                workSection: 'Rohbau',
                materialType: 'Beton',
                dinReference: 'DIN EN 206-1',
                calculationMethod: 'Fläche x Dicke'
            }
        ]);
        
    } catch (error) {
        console.error('HOAI Error:', error);
    } finally {
        await hoaiEngine.shutdown();
    }
}

main();
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
with Construction System

```javascript
// hoai-system-integration.js
import { createHOAIComplianceEngine } from './hoai-compliance-engine.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';
import { EventEmitter } from 'events';

export class HOAISystemService extends EventEm...

## Extended Resources
- **Full Implementation**: `/skills/hoai-essentials-detailed.md`
- **Code Examples**: `/examples/hoai-essentials-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*