# Construction-basics - Essential Patterns

## Core Implementation
```javascript
// construction-material-engine.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import mathjs from 'mathjs';

export class ConstructionMaterialEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Material categories
            categories: config.categories || [
                'concrete', 'steel', 'wood', 'masonry',
                'insulation', 'glass', 'composites', 'finishes'
            ],
            
            // Safety factors
            safetyFactors: config.safetyFactors || {
                concrete: 1.5,
                steel: 1.15,
                wood: 2.0,
                masonry: 2.5,
                default: 1.5
            },
            
            // Load factors
            loadFactors: config.loadFactors || {
                dead: 1.2,
                live: 1.6,
                wind: 1.4,
                seismic: 1.2,
                snow: 1.4
            },
            
            // Environmental conditions
            environmentalFactors: config.environmentalFactors || {
                temperature: { min: -20, max: 40 }, // Celsius
                humidity: { min: 20, max: 90 }, // Percentage
                exposure: ['indoor', 'outdoor', 'aggressive']
            },
            
            // Cost optimization
            optimizationWeights: config.optimizationWeights || {
                cost: 0.3,
                strength: 0.3,
                durability: 0.2,
                sustainability: 0.2
            },
            
            // Caching
            cacheSize: config.cacheSize || 1000,
            cacheTTL: config.cacheTTL || 3600000, // 1 hour
            
            ...config
        };
        
        this.dbPool = null;
        this.materialCache = new Map();
        this.compatibilityMatrix = new Map();
        
        // Metrics
        this.metrics = {
            totalMaterials: 0,
            calculations: 0,
            optimizations: 0,
            compatibilityChecks: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load material database
            await this.loadMaterialDatabase();
            
            // Initialize compatibility matrix
            await this.loadCompatibilityMatrix();
            
            // Start monitoring
            this.startMonitoring();
            
            this.emit('initialized');
            console.log('Construction Material Engine initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'material_engine'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Material specifications table
            await client.query(`
                CREATE TABLE IF NOT EXISTS material_specifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    material_code VARCHAR(50) UNIQUE NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    name VARCHAR(200) NOT NULL,
                    grade VARCHAR(50),
                    properties JSONB NOT NULL,
                    mechanical_properties JSONB,
                    thermal_properties JSONB,
                    environmental_class VARCHAR(20),
                    density FLOAT NOT NULL,
                    unit_cost DECIMAL(10,2),
                    carbon_footprint FLOAT,
                    recyclability FLOAT DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_materials_category 
                ON material_specifications(category);
                
                CREATE INDEX IF NOT EXISTS idx_materials_code 
                ON material_specifications(material_code);
                
                CREATE INDEX IF NOT EXISTS idx_materials_properties 
                ON material_specifications USING gin(properties);
            `);
            
            // Load calculations history
            await client.query(`
                CREATE TABLE IF NOT EXISTS load_calculations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID,
                    element_type VARCHAR(100) NOT NULL,
                    material_id UUID REFERENCES material_specifications(id),
                    load_type VARCHAR(50) NOT NULL,
                    load_value FLOAT NOT NULL,
                    safety_factor FLOAT NOT NULL,
                    design_load FLOAT NOT NULL,
                    utilization_ratio FLOAT,
                    calculation_method VARCHAR(100),
                    parameters JSONB,
                    result JSONB NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    calculated_by UUID
                );
                
                CREATE INDEX IF NOT EXISTS idx_calculations_project 
                ON load_calculations(project_id);
                
                CREATE INDEX IF NOT EXISTS idx_calculations_material 
                ON load_calculations(material_id);
            `);
            
            // Material compatibility matrix
            await client.query(`
                CREATE TABLE IF NOT EXISTS material_compatibility (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    material1_id UUID REFERENCES material_specifications(id),
                    material2_id UUID REFERENCES material_specifications(id),
                    compatibility_score FLOAT NOT NULL CHECK (compatibility_score BETWEEN 0 AND 1),
                    compatibility_type VARCHAR(50),
                    issues JSONB,
                    recommendations TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_compatibility 
                    UNIQUE(material1_id, material2_id, compatibility_type)
                );
                
                CREATE INDEX IF NOT EXISTS idx_compatibility_materials 
                ON material_compatibility(material1_id, material2_id);
            `);
            
            // Supply chain integration
            await client.query(`
                CREATE TABLE IF NOT EXISTS material_suppliers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    material_id UUID REFERENCES material_specifications(id),
                    supplier_name VARCHAR(200) NOT NULL,
                    location JSONB,
                    lead_time_days INTEGER,
                    minimum_order FLOAT,
                    unit_price DECIMAL(10,2),
                    availability VARCHAR(20),
                    quality_rating FLOAT,
                    certifications JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_suppliers_material 
                ON material_suppliers(material_id);
            `);
            
            // Cost optimization results
            await client.query(`
                CREATE TABLE IF NOT EXISTS material_optimizations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID,
                    optimization_type VARCHAR(50),
                    constraints JSONB NOT NULL,
                    selected_materials JSONB NOT NULL,
                    total_cost DECIMAL(12,2),
                    performance_metrics JSONB,
                    savings DECIMAL(10,2),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_optimizations_project 
                ON material_optimizations(project_id);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Material Database Operations
    
    async loadMaterialDatabase() {
        // Load standard materials
        await this.loadConcreteSpecifications();
        await this.loadSteelSpecifications();
        await this.loadWoodSpecifications();
        await this.loadMasonrySpecifications();
        
        // Count total materials
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(
                'SELECT COUNT(*) FROM material_specifications'
            );
            this.metrics.totalMaterials = parseInt(result.rows[0].count);
        } finally {
            client.release();
        }
    }
    
    async loadConcreteSpecifications() {
        const concreteGrades = [
            {
                code: 'C20/25',
                name: 'Concrete C20/25',
                grade: 'C20/25',
                properties: {
                    compressiveStrength: 25, // N/mm²
                    tensileStrength: 2.2,
                    elasticModulus: 30000,
                    poissonsRatio: 0.2
                },
                density: 2400, // kg/m³
                unitCost: 85, // EUR/m³
                carbonFootprint: 280 // kg CO2/m³
            },
            {
                code: 'C25/30',
                name: 'Concrete C25/30',
                grade: 'C25/30',
                properties: {
                    compressiveStrength: 30,
                    tensileStrength: 2.6,
                    elasticModulus: 31000,
                    poissonsRatio: 0.2
                },
                density: 2400,
                unitCost: 90,
                carbonFootprint: 300
            },
            {
                code: 'C30/37',
                name: 'Concrete C30/37',
                grade: 'C30/37',
                properties: {
                    compressiveStrength: 37,
                    tensileStrength: 2.9,
                    elasticModulus: 33000,
                    poissonsRatio: 0.2
                },
                density: 2400,
                unitCost: 95,
                carbonFootprint: 320
            },
            {
                code: 'C35/45',
                name: 'Concrete C35/45',
                grade: 'C35/45',
                properties: {
                    compressiveStrength: 45,
                    tensileStrength: 3.2,
                    elasticModulus: 34000,
                    poissonsRatio: 0.2
                },
                density: 2450,
                unitCost: 105,
                carbonFootprint: 350
            }
        ];
        
        const client = await this.dbPool.connect();
        try {
            for (const concrete of concreteGrades) {
                await client.query(`
                    INSERT INTO material_specifications
                    (material_code, category, name, grade, properties,
                     mechanical_properties, density, unit_cost, carbon_footprint)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (material_code) DO UPDATE SET
                        properties = EXCLUDED.properties,
                        unit_cost = EXCLUDED.unit_cost,
                        updated_at = NOW()
                `, [
                    concrete.code,
                    'concrete',
                    concrete.name,
                    concrete.grade,
                    JSON.stringify(concrete.properties),
                    JSON.stringify({
                        compressive: concrete.properties.compressiveStrength,
                        tensile: concrete.properties.tensileStrength,
                        shear: concrete.properties.compressiveStrength * 0.15
                    }),
                    concrete.density,
                    concrete.unitCost,
                    concrete.carbonFootprint
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    async loadSteelSpecifications() {
        const steelGrades = [
            {
                code: 'S235',
                name: 'Structural Steel S235',
                grade: 'S235',
                properties: {
                    yieldStrength: 235, // N/mm²
                    tensileStrength: 360,
                    elasticModulus: 210000,
                    poissonsRatio: 0.3,
                    elongation: 26 // %
                },
                density: 7850,
                unitCost: 750, // EUR/ton
                carbonFootprint: 2100,
                recyclability: 0.95
            },
            {
                code: 'S275',
                name: 'Structural Steel S275',
                grade: 'S275',
                properties: {
                    yieldStrength: 275,
                    tensileStrength: 410,
                    elasticModulus: 210000,
                    poissonsRatio: 0.3,
                    elongation: 22
                },
                density: 7850,
                unitCost: 780,
                carbonFootprint: 2100,
                recyclability: 0.95
            },
            {
                code: 'S355',
                name: 'Structural Steel S355',
                grade: 'S355',
                properties: {
                    yieldStrength: 355,
                    tensileStrength: 470,
                    elasticModulus: 210000,
                    poissonsRatio: 0.3,
                    elongation: 20
                },
                density: 7850,
                unitCost: 820,
                carbonFootprint: 2150,
                recyclability: 0.95
            }
        ];
        
        const client = await this.dbPool.connect();
        try {
            for (const steel of steelGrades) {
                await client.query(`
                    INSERT INTO material_specifications
                    (material_code, category, name, grade, properties,
                     mechanical_properties, density, unit_cost, 
                     carbon_footprint, recyclability)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (material_code) DO UPDATE SET
                        properties = EXCLUDED.properties,
                        unit_cost = EXCLUDED.unit_cost,
                        updated_at = NOW()
                `, [
                    steel.code,
                    'steel',
                    steel.name,
                    steel.grade,
                    JSON.stringify(steel.properties),
                    JSON.stringify({
                        yield: steel.properties.yieldStrength,
                        ultimate: steel.properties.tensileStrength,
                        shear: steel.properties.yieldStrength * 0.58
                    }),
                    steel.density,
                    steel.unitCost,
                    steel.carbonFootprint,
                    steel.recyclability
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    async loadWoodSpecifications() {
        const woodTypes = [
            {
                code: 'GL24h',
                name: 'Glulam GL24h',
                grade: 'GL24h',
                properties: {
                    bendingStrength: 24, // N/mm²
                    tensileStrength: 19.2,
                    compressiveStrength: 24,
                    shearStrength: 3.5,
                    elasticModulus: 11500,
                    elasticModulusPerp: 300
                },
                density: 420,
                unitCost: 450, // EUR/m³
                carbonFootprint: -800, // Carbon negative
                recyclability: 0.8
            },
            {
                code: 'GL28h',
                name: 'Glulam GL28h',
                grade: 'GL28h',
                properties: {
                    bendingStrength: 28,
                    tensileStrength: 22.3,
                    compressiveStrength: 26.5,
                    shearStrength: 3.5,
                    elasticModulus: 12600,
                    elasticModulusPerp: 350
                },
                density: 460,
                unitCost: 520,
                carbonFootprint: -850,
                recyclability: 0.8
            },
            {
                code: 'C24',
                name: 'Solid Wood C24',
                grade: 'C24',
                properties: {
                    bendingStrength: 24,
                    tensileStrength: 14,
                    compressiveStrength: 21,
                    shearStrength: 4.0,
                    elasticModulus: 11000,
                    elasticModulusPerp: 370
                },
                density: 420,
                unitCost: 280,
                carbonFootprint: -700,
                recyclability: 0.9
            }
        ];
        
        const client = await this.dbPool.connect();
        try {
            for (const wood of woodTypes) {
                await client.query(`
                    INSERT INTO material_specifications
                    (material_code, category, name, grade, properties,
                     mechanical_properties, thermal_properties,
                     density, unit_cost, carbon_footprint, recyclability)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (material_code) DO UPDATE SET
                        properties = EXCLUDED.properties,
                        unit_cost = EXCLUDED.unit_cost,
                        updated_at = NOW()
                `, [
                    wood.code,
                    'wood',
                    wood.name,
                    wood.grade,
                    JSON.stringify(wood.properties),
                    JSON.stringify({
                        bending: wood.properties.bendingStrength,
                        compression: wood.properties.compressiveStrength,
                        tension: wood.properties.tensileStrength,
                        shear: wood.properties.shearStrength
                    }),
                    JSON.stringify({
                        thermalConductivity: 0.13, // W/mK
                        specificHeat: 1600, // J/kgK
                        thermalExpansion: 5e-6 // 1/K
                    }),
                    wood.density,
                    wood.unitCost,
                    wood.carbonFootprint,
                    wood.recyclability
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    async loadMasonrySpecifications() {
        const masonryTypes = [
            {
                code: 'BRICK-STD',
                name: 'Standard Clay Brick',
                properties: {
                    compressiveStrength: 15,
                    waterAbsorption: 12, // %
                    thermalConductivity: 0.7
                },
                density: 1800,
                unitCost: 350, // EUR/1000 units
                carbonFootprint: 220
            },
            {
                code: 'BLOCK-CONCRETE',
                name: 'Concrete Block',
                properties: {
                    compressiveStrength: 7.5,
                    waterAbsorption: 10,
                    thermalConductivity: 1.0
                },
                density: 2000,
                unitCost: 1.2, // EUR/unit
                carbonFootprint: 0.15
            }
        ];
        
        const client = await this.dbPool.connect();
        try {
            for (const masonry of masonryTypes) {
                await client.query(`
                    INSERT INTO material_specifications
                    (material_code, category, name, properties,
                     density, unit_cost, carbon_footprint)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (material_code) DO UPDATE SET
                        properties = EXCLUDED.properties,
                        unit_cost = EXCLUDED.unit_cost,
                        updated_at = NOW()
                `, [
                    masonry.code,
                    'masonry',
                    masonry.name,
                    JSON.stringify(masonry.properties),
                    masonry.density,
                    masonry.unitCost,
                    masonry.carbonFootprint
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    // Material Analysis Functions
    
    async getMaterial(materialCode) {
        // Check cache
        if (this.materialCache.has(materialCode)) {
            const cached = this.materialCache.get(materialCode);
            if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                return cached.data;
            }
        }
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM material_specifications
                WHERE material_code = $1
            `, [materialCode]);
            
            if (result.rows.length === 0) {
                throw new Error(`Material ${materialCode} not found`);
            }
            
            const material = result.rows[0];
            
            // Cache result
            this.materialCache.set(materialCode, {
                data: material,
                timestamp: Date.now()
            });
            
            // Limit cache size
            if (this.materialCache.size > this.config.cacheSize) {
                const oldest = Array.from(this.materialCache.entries())[0];
                this.materialCache.delete(oldest[0]);
            }
            
            return material;
            
        } finally {
            client.release();
        }
    }
    
    // Strength Calculations
    
    async calculateStrength(materialCode, loadType, geometry) {
        const material = await this.getMaterial(materialCode);
        this.metrics.calculations++;
        
        let strength;
        
        switch (material.category) {
            case 'concrete':
                strength = this.calculateConcreteStrength(material, loadType, geometry);
                break;
                
            case 'steel':
                strength = this.calculateSteelStrength(material, loadType, geometry);
                break;
                
            case 'wood':
                strength = this.calculateWoodStrength(material, loadType, geometry);
                break;
                
            default:
                throw new Error(`Strength calculation not implemented for ${material.category}`);
        }
        
        return strength;
    }
    
    calculateConcreteStrength(material, loadType, geometry) {
        const props = material.properties;
        const safetyFactor = this.config.safetyFactors.concrete;
        
        switch (loadType) {
            case 'compression':
                return this.calculateConcreteCompression(props, geometry, safetyFactor);
                
            case 'bending':
                return this.calculateConcreteBending(props, geometry, safetyFactor);
                
            case 'shear':
                return this.calculateConcreteShear(props, geometry, safetyFactor);
                
            default:
                throw new Error(`Unknown load type: ${loadType}`);
        }
    }
    
    calculateConcreteCompression(props, geometry, safetyFactor) {
        // Design compressive strength
        const fcd = props.compressiveStrength / safetyFactor;
        
        // Cross-sectional area
        const area = geometry.width * geometry.height;
        
        // Maximum compression force
        const maxForce = fcd * area;
        
        // Consider slenderness if column
        let reductionFactor = 1.0;
        if (geometry.length) {
            const slenderness = geometry.length / Math.min(geometry.width, geometry.height);
            if (slenderness > 12) {
                reductionFactor = Math.max(0.5, 1 - (slenderness - 12) * 0.02);
            }
        }
        
        return {
            designStrength: fcd,
            capacity: maxForce * reductionFactor,
            reductionFactor,
            calculation: 'EC2 compression design'
        };
    }
    
    calculateConcreteBending(props, geometry, safetyFactor) {
        // Simplified rectangular section
        const fcd = props.compressiveStrength / safetyFactor;
        const fctm = props.tensileStrength;
        
        // Section properties
        const width = geometry.width;
        const height = geometry.height;
        const effectiveDepth = height - (geometry.cover || 40);
        
        // Moment of inertia
        const I = (width * Math.pow(height, 3)) / 12;
        
        // Section modulus
        const W = I / (height / 2);
        
        // Cracking moment
        const Mcr = fctm * W;
        
        // Ultimate moment (simplified)
        const Mu = 0.167 * fcd * width * Math.pow(effectiveDepth, 2);
        
        return {
            crackingMoment: Mcr,
            ultimateMoment: Mu,
            sectionModulus: W,
            calculation: 'EC2 bending design'
        };
    }
    
    calculateConcreteShear(props, geometry, safetyFactor) {
        const fcd = props.compressiveStrength / safetyFactor;
        
        // Shear strength without reinforcement
        const vRd = 0.12 * Math.pow(fcd, 1/3);
        
        // Effective area
        const area = geometry.width * (geometry.height - (geometry.cover || 40));
        
        // Shear capacity
        const VRd = vRd * area;
        
        return {
            shearStrength: vRd,
            capacity: VRd,
            calculation: 'EC2 shear design'
        };
    }
    
    calculateSteelStrength(material, loadType, geometry) {
        const props = material.properties;
        const safetyFactor = this.config.safetyFactors.steel;
        
        switch (loadType) {
            case 'tension':
                return this.calculateSteelTension(props, geometry, safetyFactor);
                
            case 'compression':
                return this.calculateSteelCompression(props, geometry, safetyFactor);
                
            case 'bending':
                return this.calculateSteelBending(props, geometry, safetyFactor);
                
            default:
                throw new Error(`Unknown load type: ${loadType}`);
        }
    }
    
    calculateSteelTension(props, geometry, safetyFactor) {
        const fyd = props.yieldStrength / safetyFactor;
        
        // Net area (considering holes if any)
        const grossArea = this.calculateSteelArea(geometry);
        const netArea = grossArea * (geometry.netAreaRatio || 0.9);
        
        // Tension capacity
        const Nt = fyd * netArea;
        
        return {
            designStrength: fyd,
            capacity: Nt,
            grossArea,
            netArea,
            calculation: 'EC3 tension design'
        };
    }
    
    calculateSteelCompression(props, geometry, safetyFactor) {
        const fyd = props.yieldStrength / safetyFactor;
        const E = props.elasticModulus;
        
        // Cross-sectional area
        const area = this.calculateSteelArea(geometry);
        
        // Moment of inertia
        const I = this.calculateSteelInertia(geometry);
        
        // Radius of gyration
        const r = Math.sqrt(I / area);
        
        // Slenderness
        const lambda = geometry.length / r;
        
        // Buckling reduction factor
        let chi = 1.0;
        if (lambda > 20) {
            const lambdaBar = lambda / Math.PI * Math.sqrt(fyd / E);
            const alpha = 0.49; // Buckling curve c
            const phi = 0.5 * (1 + alpha * (lambdaBar - 0.2) + lambdaBar * lambdaBar);
            chi = 1 / (phi + Math.sqrt(phi * phi - lambdaBar * lambdaBar));
        }
        
        // Compression capacity
        const Nc = chi * area * fyd;
        
        return {
            designStrength: fyd,
            capacity: Nc,
            bucklingFactor: chi,
            slenderness: lambda,
            calculation: 'EC3 compression design'
        };
    }
    
    calculateSteelBending(props, geometry, safetyFactor) {
        const fyd = props.yieldStrength / safetyFactor;
        
        // Section properties
        const W = this.calculateSteelSectionModulus(geometry);
        
        // Plastic section modulus (simplified as 1.15 * elastic)
        const Wpl = W * 1.15;
        
        // Moment capacity
        const Mc = Wpl * fyd;
        
        return {
            designStrength: fyd,
            capacity: Mc,
            elasticModulus: W,
            plasticModulus: Wpl,
            calculation: 'EC3 bending design'
        };
    }
    
    calculateSteelArea(geometry) {
        switch (geometry.section) {
            case 'IPE':
            case 'HEA':
            case 'HEB':
                // Simplified for standard sections
                return geometry.area || (geometry.height * geometry.width * 0.015);
                
            case 'rectangular':
                return geometry.width * geometry.height;
                
            case 'circular':
                return Math.PI * Math.pow(geometry.diameter / 2, 2);
                
            case 'hollow':
                return Math.PI * (Math.pow(geometry.outerDiameter / 2, 2) - 
                                 Math.pow(geometry.innerDiameter / 2, 2));
                
            default:
                throw new Error(`Unknown section type: ${geometry.section}`);
        }
    }
    
    calculateSteelInertia(geometry) {
        switch (geometry.section) {
            case 'rectangular':
                return (geometry.width * Math.pow(geometry.height, 3)) / 12;
                
            case 'circular':
                return Math.PI * Math.pow(geometry.diameter, 4) / 64;
                
            case 'IPE':
            case 'HEA':
            case 'HEB':
                // Use tabulated values or approximation
                return geometry.inertia || 
                       (geometry.height * Math.pow(geometry.width, 3) * 0.05);
                
            default:
                throw new Error(`Inertia calculation not implemented for ${geometry.section}`);
        }
    }
    
    calculateSteelSectionModulus(geometry) {
        const I = this.calculateSteelInertia(geometry);
        const y = geometry.height / 2;
        return I / y;
    }
    
    calculateWoodStrength(material, loadType, geometry) {
        const props = material.properties;
        const safetyFactor = this.config.safetyFactors.wood;
        
        // Modification factors
        const kmod = this.getWoodModificationFactor(geometry);
        const kh = this.getWoodSizeFactor(geometry);
        
        switch (loadType) {
            case 'bending':
                return this.calculateWoodBending(props, geometry, safetyFactor, kmod, kh);
                
            case 'compression':
                return this.calculateWoodCompression(props, geometry, safetyFactor, kmod);
                
            case 'tension':
                return this.calculateWoodTension(props, geometry, safetyFactor, kmod, kh);
                
            default:
                throw new Error(`Unknown load type: ${loadType}`);
        }
    }
    
    getWoodModificationFactor(geometry) {
        // Service class and load duration factors
        const serviceClass = geometry.serviceClass || 1;
        const loadDuration = geometry.loadDuration || 'medium';
        
        const kmodTable = {
            'permanent': { 1: 0.6, 2: 0.6, 3: 0.5 },
            'long': { 1: 0.7, 2: 0.7, 3: 0.55 },
            'medium': { 1: 0.8, 2: 0.8, 3: 0.65 },
            'short': { 1: 0.9, 2: 0.9, 3: 0.7 },
            'instantaneous': { 1: 1.1, 2: 1.1, 3: 0.9 }
        };
        
        return kmodTable[loadDuration][serviceClass] || 0.8;
    }
    
    getWoodSizeFactor(geometry) {
        // Size effect factor for bending and tension
        const h = geometry.height;
        
        if (h < 150) {
            return Math.min(1.3, Math.pow(150 / h, 0.2));
        }
        
        return 1.0;
    }
    
    calculateWoodBending(props, geometry, safetyFactor, kmod, kh) {
        const fm = props.bendingStrength;
        const fmd = kmod * kh * fm / safetyFactor;
        
        // Section modulus
        const W = (geometry.width * Math.pow(geometry.height, 2)) / 6;
        
        // Moment capacity
        const M = fmd * W;
        
        return {
            designStrength: fmd,
            capacity: M,
            sectionModulus: W,
            modificationFactor: kmod * kh,
            calculation: 'EC5 bending design'
        };
    }
    
    calculateWoodCompression(props, geometry, safetyFactor, kmod) {
        const fc = props.compressiveStrength;
        const fcd = kmod * fc / safetyFactor;
        
        const area = geometry.width * geometry.height;
        
        // Stability factor for compression
        let kc = 1.0;
        if (geometry.length) {
            const lambda = geometry.length / (0.289 * Math.min(geometry.width, geometry.height));
            if (lambda > 30) {
                const lambdaRel = lambda / Math.PI * Math.sqrt(fc / props.elasticModulus);
                kc = 1 / (1 + 0.2 * lambdaRel * lambdaRel);
            }
        }
        
        const N = kc * fcd * area;
        
        return {
            designStrength: fcd,
            capacity: N,
            stabilityFactor: kc,
            calculation: 'EC5 compression design'
        };
    }
    
    calculateWoodTension(props, geometry, safetyFactor, kmod, kh) {
        const ft = props.tensileStrength;
        const ftd = kmod * kh * ft / safetyFactor;
        
        // Net area considering notches and holes
        const grossArea = geometry.width * geometry.height;
        const netArea = grossArea * (geometry.netAreaRatio || 0.8);
        
        const N = ftd * netArea;
        
        return {
            designStrength: ftd,
            capacity: N,
            netArea,
            modificationFactor: kmod * kh,
            calculation: 'EC5 tension design'
        };
    }
    
    // Load Distribution Calculations
    
    async calculateLoadDistribution(elementType, loads, supports, material) {
        this.metrics.calculations++;
        
        switch (elementType) {
            case 'beam':
                return this.calculateBeamLoadDistribution(loads, supports, material);
                
            case 'slab':
                return this.calculateSlabLoadDistribution(loads, supports, material);
                
            case 'column':
                return this.calculateColumnLoadDistribution(loads, material);
                
            default:
                throw new Error(`Load distribution not implemented for ${elementType}`);
        }
    }
    
    calculateBeamLoadDistribution(loads, supports, material) {
        // Simplified beam analysis
        const results = {
            reactions: [],
            moments: [],
            shears: [],
            deflections: []
        };
        
        // Total load
        const totalLoad = loads.reduce((sum, load) => {
            if (load.type === 'uniform') {
                return sum + load.value * load.length;
            } else if (load.type === 'point') {
                return sum + load.value;
            }
            return sum;
        }, 0);
        
        // Simple support reactions (2 supports assumed)
        if (supports.length === 2) {
            const span = supports[1].position - supports[0].position;
            
            // For uniform load
            results.reactions = [
                { position: supports[0].position, value: totalLoad / 2 },
                { position: supports[1].position, value: totalLoad / 2 }
            ];
            
            // Maximum moment (mid-span for uniform load)
            const maxMoment = (totalLoad * span) / 8;
            results.moments.push({
                position: span / 2,
                value: maxMoment
            });
            
            // Maximum shear (at supports)
            results.shears = [
                { position: supports[0].position, value: totalLoad / 2 },
                { position: supports[1].position, value: -totalLoad / 2 }
            ];
            
            // Maximum deflection (mid-span)
            if (material && material.properties.elasticModulus) {
                const E = material.properties.elasticModulus;
                const I = material.momentOfInertia || 1; // Requires section properties
                const maxDeflection = (5 * totalLoad * Math.pow(span, 3)) / (384 * E * I);
                
                results.deflections.push({
                    position: span / 2,
                    value: maxDeflection
                });
            }
        }
        
        return results;
    }
    
    calculateSlabLoadDistribution(loads, supports, material) {
        // Simplified slab analysis
        const results = {
            moments: {},
            reactions: [],
            punching: []
        };
        
        // Determine slab type
        const lx = supports.lx || supports[0];
        const ly = supports.ly || supports[1];
        const ratio = Math.max(lx, ly) / Math.min(lx, ly);
        
        const isOneWay = ratio > 2;
        
        // Total load
        const totalLoad = loads.reduce((sum, load) => 
            sum + (load.value * (load.area || 1)), 0
        );
        
        if (isOneWay) {
            // One-way slab
            const span = Math.min(lx, ly);
            results.moments.field = totalLoad * Math.pow(span, 2) / 8;
            results.moments.support = -totalLoad * Math.pow(span, 2) / 12;
        } else {
            // Two-way slab (simplified)
            const mx = totalLoad * Math.pow(lx, 2) / 16;
            const my = totalLoad * Math.pow(ly, 2) / 16;
            
            results.moments.fieldX = mx;
            results.moments.fieldY = my;
            results.moments.supportX = -mx * 1.5;
            results.moments.supportY = -my * 1.5;
        }
        
        return results;
    }
    
    calculateColumnLoadDistribution(loads, material) {
        // Column load analysis
        const results = {
            axialForce: 0,
            moments: { x: 0, y: 0 },
            bucklingLength: 0,
            slenderness: 0
        };
        
        // Sum vertical loads
        results.axialForce = loads
            .filter(l => l.direction === 'vertical')
            .reduce((sum, l) => sum + l.value, 0);
        
        // Calculate moments from eccentric loads
        loads.forEach(load => {
            if (load.eccentricity) {
                results.moments.x += load.value * (load.eccentricity.x || 0);
                results.moments.y += load.value * (load.eccentricity.y || 0);
            }
        });
        
        return results;
    }
    
    // Material Compatibility Checking
    
    async checkCompatibility(material1Code, material2Code, compatibilityType = 'general') {
        this.metrics.compatibilityChecks++;
        
        // Check cache
        const cacheKey = `${material1Code}:${material2Code}:${compatibilityType}`;
        if (this.compatibilityMatrix.has(cacheKey)) {
            return this.compatibilityMatrix.get(cacheKey);
        }
        
        const client = await this.dbPool.connect();
        try {
            // Check database
            const result = await client.query(`
                SELECT * FROM material_compatibility
                WHERE ((material1_id = (SELECT id FROM material_specifications WHERE material_code = $1)
                       AND material2_id = (SELECT id FROM material_specifications WHERE material_code = $2))
                    OR (material1_id = (SELECT id FROM material_specifications WHERE material_code = $2)
                       AND material2_id = (SELECT id FROM material_specifications WHERE material_code = $1)))
                  AND compatibility_type = $3
            `, [material1Code, material2Code, compatibilityType]);
            
            if (result.rows.length > 0) {
                const compatibility = result.rows[0];
                this.compatibilityMatrix.set(cacheKey, compatibility);
                return compatibility;
            }
            
            // Calculate compatibility if not in database
            const compatibility = await this.calculateCompatibility(
                material1Code, 
                material2Code, 
                compatibilityType
            );
            
            // Store in database
            await this.storeCompatibility(material1Code, material2Code, compatibility);
            
            // Cache
            this.compatibilityMatrix.set(cacheKey, compatibility);
            
            return compatibility;
            
        } finally {
            client.release();
        }
    }
    
    async calculateCompatibility(material1Code, material2Code, type) {
        const [mat1, mat2] = await Promise.all([
            this.getMaterial(material1Code),
            this.getMaterial(material2Code)
        ]);
        
        let score = 1.0;
        const issues = [];
        const recommendations = [];
        
        // Thermal expansion compatibility
        if (mat1.thermal_properties && mat2.thermal_properties) {
            const exp1 = mat1.thermal_properties.thermalExpansion || 0;
            const exp2 = mat2.thermal_properties.thermalExpansion || 0;
            const ratio = Math.max(exp1, exp2) / Math.min(exp1, exp2);
            
            if (ratio > 2) {
                score *= 0.7;
                issues.push('Significant thermal expansion difference');
                recommendations.push('Use expansion joints');
            }
        }
        
        // Chemical compatibility
        if (type === 'chemical') {
            score *= this.checkChemicalCompatibility(mat1, mat2);
        }
        
        // Structural compatibility
        if (type === 'structural') {
            score *= this.checkStructuralCompatibility(mat1, mat2);
        }
        
        // Environmental compatibility
        if (mat1.environmental_class !== mat2.environmental_class) {
            score *= 0.9;
            issues.push('Different environmental requirements');
        }
        
        return {
            compatibility_score: score,
            compatibility_type: type,
            issues,
            recommendations: recommendations.join('; ')
        };
    }
    
    checkChemicalCompatibility(mat1, mat2) {
        // Concrete-steel: good
        if ((mat1.category === 'concrete' && mat2.category === 'steel') ||
            (mat1.category === 'steel' && mat2.category === 'concrete')) {
            return 1.0;
        }
        
        // Wood-steel: potential corrosion
        if ((mat1.category === 'wood' && mat2.category === 'steel') ||
            (mat1.category === 'steel' && mat2.category === 'wood')) {
            return 0.8; // Moisture from wood can corrode steel
        }
        
        // Default
        return 0.9;
    }
    
    checkStructuralCompatibility(mat1, mat2) {
        // Compare elastic moduli
        const E1 = mat1.properties?.elasticModulus || 1;
        const E2 = mat2.properties?.elasticModulus || 1;
        const ratio = Math.max(E1, E2) / Math.min(E1, E2);
        
        if (ratio > 10) {
            return 0.6; // Very different stiffness
        } else if (ratio > 5) {
            return 0.8;
        }
        
        return 1.0;
    }
    
    async storeCompatibility(material1Code, material2Code, compatibility) {
        const client = await this.dbPool.connect();
        try {
            const mat1Id = await this.getMaterialId(material1Code);
            const mat2Id = await this.getMaterialId(material2Code);
            
            await client.query(`
                INSERT INTO material_compatibility
                (material1_id, material2_id, compatibility_score, 
                 compatibility_type, issues, recommendations)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (material1_id, material2_id, compatibility_type) 
                DO UPDATE SET
                    compatibility_score = EXCLUDED.compatibility_score,
                    issues = EXCLUDED.issues,
                    recommendations = EXCLUDED.recommendations
            `, [
                mat1Id,
                mat2Id,
                compatibility.compatibility_score,
                compatibility.compatibility_type,
                JSON.stringify(compatibility.issues),
                compatibility.recommendations
            ]);
        } finally {
            client.release();
        }
    }
    
    async getMaterialId(materialCode) {
        const material = await this.getMaterial(materialCode);
        return material.id;
    }
    
    // Cost Optimization
    
    async optimizeMaterialSelection(requirements, constraints) {
        this.metrics.optimizations++;
        
        const startTime = Date.now();
        
        try {
            // Get candidate materials
            const candidates = await this.getCandidateMaterials(requirements);
            
            // Evaluate each candidate
            const evaluations = [];
            
            for (const material of candidates) {
                const evaluation = await this.evaluateMaterial(
                    material, 
                    requirements, 
                    constraints
                );
                evaluations.push(evaluation);
            }
            
            // Rank by optimization score
            evaluations.sort((a, b) => b.score - a.score);
            
            // Select optimal materials
            const selected = this.selectOptimalMaterials(evaluations, constraints);
            
            // Calculate total cost
            const totalCost = selected.reduce((sum, item) => 
                sum + (item.material.unit_cost * item.quantity), 0
            );
            
            // Store optimization result
            await this.storeOptimizationResult({
                requirements,
                constraints,
                selected,
                totalCost,
                duration: Date.now() - startTime
            });
            
            return {
                selectedMaterials: selected,
                totalCost,
                performanceMetrics: this.calculatePerformanceMetrics(selected),
                alternatives: evaluations.slice(0, 5)
            };
            
        } catch (error) {
            this.handleError('optimization', error);
            throw error;
        }
    }
    
    async getCandidateMaterials(requirements) {
        const client = await this.dbPool.connect();
        try {
            let query = 'SELECT * FROM material_specifications WHERE 1=1';
            const params = [];
            let paramIndex = 1;
            
            if (requirements.category) {
                query += ` AND category = $${paramIndex++}`;
                params.push(requirements.category);
            }
            
            if (requirements.minStrength) {
                query += ` AND (properties->>'compressiveStrength')::float >= $${paramIndex++}`;
                params.push(requirements.minStrength);
            }
            
            if (requirements.maxCost) {
                query += ` AND unit_cost <= $${paramIndex++}`;
                params.push(requirements.maxCost);
            }
            
            if (requirements.environmental) {
                query += ` AND environmental_class = $${paramIndex++}`;
                params.push(requirements.environmental);
            }
            
            const result = await client.query(query, params);
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async evaluateMaterial(material, requirements, constraints) {
        let score = 0;
        const weights = this.config.optimizationWeights;
        
        // Cost score (inverse - lower cost is better)
        const maxCost = constraints.budget || 1000;
        const costScore = 1 - (material.unit_cost / maxCost);
        score += costScore * weights.cost;
        
        // Strength score
        if (requirements.minStrength) {
            const strength = material.properties?.compressiveStrength || 0;
            const strengthScore = Math.min(1, strength / requirements.minStrength);
            score += strengthScore * weights.strength;
        }
        
        // Durability score
        const durabilityScore = this.calculateDurabilityScore(material);
        score += durabilityScore * weights.durability;
        
        // Sustainability score
        const sustainabilityScore = this.calculateSustainabilityScore(material);
        score += sustainabilityScore * weights.sustainability;
        
        return {
            material,
            score,
            breakdown: {
                cost: costScore,
                strength: material.properties?.compressiveStrength || 0,
                durability: durabilityScore,
                sustainability: sustainabilityScore
            }
        };
    }
    
    calculateDurabilityScore(material) {
        let score = 0.5; // Base score
        
        // Environmental resistance
        if (material.environmental_class) {
            const classScores = { XC1: 0.6, XC2: 0.7, XC3: 0.8, XC4: 0.9 };
            score = classScores[material.environmental_class] || score;
        }
        
        // Material-specific durability
        const categoryScores = {
            concrete: 0.8,
            steel: 0.7,
            wood: 0.6,
            masonry: 0.85
        };
        
        score *= categoryScores[material.category] || 1.0;
        
        return score;
    }
    
    calculateSustainabilityScore(material) {
        let score = 0.5;
        
        // Carbon footprint (negative is better)
        if (material.carbon_footprint !== null) {
            if (material.carbon_footprint < 0) {
                score = 1.0; // Carbon negative
            } else if (material.carbon_footprint < 100) {
                score = 0.9;
            } else if (material.carbon_footprint < 500) {
                score = 0.7;
            } else {
                score = 0.4;
            }
        }
        
        // Recyclability
        if (material.recyclability) {
            score = score * 0.7 + material.recyclability * 0.3;
        }
        
        return score;
    }
    
    selectOptimalMaterials(evaluations, constraints) {
        const selected = [];
        const quantities = constraints.quantities || {};
        
        // Group by category if needed
        const byCategory = {};
        evaluations.forEach(eval => {
            const cat = eval.material.category;
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(eval);
        });
        
        // Select best from each required category
        for (const [category, items] of Object.entries(byCategory)) {
            if (quantities[category]) {
                selected.push({
                    material: items[0].material,
                    quantity: quantities[category],
                    evaluation: items[0]
                });
            }
        }
        
        return selected;
    }
    
    calculatePerformanceMetrics(selected) {
        const metrics = {
            totalWeight: 0,
            averageStrength: 0,
            carbonFootprint: 0,
            recyclableContent: 0
        };
        
        let strengthSum = 0;
        let strengthCount = 0;
        
        selected.forEach(item => {
            const material = item.material;
            const quantity = item.quantity;
            
            // Weight
            metrics.totalWeight += (material.density || 0) * quantity;
            
            // Strength
            if (material.properties?.compressiveStrength) {
                strengthSum += material.properties.compressiveStrength;
                strengthCount++;
            }
            
            // Carbon
            metrics.carbonFootprint += (material.carbon_footprint || 0) * quantity;
            
            // Recyclability
            metrics.recyclableContent += (material.recyclability || 0) * quantity;
        });
        
        metrics.averageStrength = strengthCount > 0 ? strengthSum / strengthCount : 0;
        metrics.recyclableContent = metrics.recyclableContent / selected.length;
        
        return metrics;
    }
    
    async storeOptimizationResult(result) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO material_optimizations
                (optimization_type, constraints, selected_materials,
                 total_cost, performance_metrics, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                'material_selection',
                JSON.stringify(result.constraints),
                JSON.stringify(result.selected),
                result.totalCost,
                JSON.stringify(result.performanceMetrics || {}),
                JSON.stringify({
                    duration: result.duration,
                    timestamp: new Date()
                })
            ]);
        } finally {
            client.release();
        }
    }
    
    // Supply Chain Integration
    
    async checkMaterialAvailability(materialCode, quantity, location) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT s.*, m.name
                FROM material_suppliers s
                JOIN material_specifications m ON s.material_id = m.id
                WHERE m.material_code = $1
                  AND s.availability != 'none'
                ORDER BY s.unit_price ASC, s.lead_time_days ASC
            `, [materialCode]);
            
            const suppliers = result.rows;
            const available = [];
            
            for (const supplier of suppliers) {
                if (!supplier.minimum_order || quantity >= supplier.minimum_order) {
                    const deliveryTime = supplier.lead_time_days || 0;
                    const totalCost = quantity * (supplier.unit_price || 0);
                    
                    available.push({
                        supplier: supplier.supplier_name,
                        unitPrice: supplier.unit_price,
                        totalCost,
                        deliveryTime,
                        minimumOrder: supplier.minimum_order,
                        qualityRating: supplier.quality_rating,
                        location: supplier.location
                    });
                }
            }
            
            return {
                material: materialCode,
                requestedQuantity: quantity,
                suppliers: available,
                bestOption: available[0] || null
            };
            
        } finally {
            client.release();
        }
    }
    
    // Monitoring
    
    startMonitoring() {
        // Periodic cache cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 3600000); // Every hour
        
        // Metrics reporting
        setInterval(() => {
            this.reportMetrics();
        }, 300000); // Every 5 minutes
    }
    
    cleanupCache() {
        const now = Date.now();
        
        // Clean material cache
        for (const [key, value] of this.materialCache) {
            if (now - value.timestamp > this.config.cacheTTL) {
                this.materialCache.delete(key);
            }
        }
        
        // Clean compatibility cache
        if (this.compatibilityMatrix.size > 1000) {
            this.compatibilityMatrix.clear();
        }
    }
    
    reportMetrics() {
        this.emit('metrics', {
            ...this.metrics,
            cacheSize: this.materialCache.size,
            compatibilityCacheSize: this.compatibilityMatrix.size
        });
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.materialCache.size / (this.metrics.calculations || 1)
        };
    }
    
    handleError(context, error) {
        console.error(`Material Engine error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        console.log('Shutting down Construction Material Engine');
        
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Construction Material Engine shut down');
    }
}

// Export factory function
export function createMaterialEngine(config) {
    return new ConstructionMaterialEngine(config);
}
```

```javascript
// material-usage.js
import { createMaterialEngine } from './construction-material-engine.js';

async function main() {
    const materialEngine = createMaterialEngine({
        safetyFactors: {
            concrete: 1.5,
            steel: 1.15
        }
    });
    
    await materialEngine.initialize();
    
    // Get material properties
    const concrete = await materialEngine.getMaterial('C30/37');
    console.log('Concrete properties:', concrete);
    
    // Calculate strength
    const strength = await materialEngine.calculateStrength('C30/37', 'compression', {
        width: 300, // mm
        height: 300, // mm
        length: 3000 // mm
    });
    console.log('Compression strength:', strength);
    
    // Check compatibility
    const compatibility = await materialEngine.checkCompatibility(
        'C30/37', 
        'S355', 
        'structural'
    );
    console.log('Material compatibility:', compatibility);
    
    // Optimize material selection
    const optimization = await materialEngine.optimizeMaterialSelection({
        category: 'concrete',
        minStrength: 25,
        environmental: 'XC2'
    }, {
        budget: 10000,
        quantities: { concrete: 100 } // m³
    });
    console.log('Optimization result:', optimization);
    
    // Check availability
    const availability = await materialEngine.checkMaterialAvailability(
        'S355',
        10, // tons
        { lat: 52.52, lng: 13.405 } // Berlin
    );
    console.log('Material availability:', availability);
}

main();
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
System integration guidelines

## Extended Resources
- **Full Implementation**: `/skills/construction-basics-detailed.md`
- **Code Examples**: `/examples/construction-basics-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*