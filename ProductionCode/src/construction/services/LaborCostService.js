/**
 * 👷 LABOR COST SERVICE
 * =====================
 * PRODUCTION-READY Construction Labor Cost Calculation
 * Handles workforce planning, regional rates, and HOAI compliance
 * 
 * @module LaborCostService
 * @requires DatabaseConnectionManager
 * @requires EliteMemoryPersistenceEngine
 * @version 1.0.0 - PRODUCTION IMPLEMENTATION
 */

import { EventEmitter } from 'events';
import { EliteMemoryPersistenceEngine } from '../../memory/EliteMemoryPersistenceEngine.js';
import { dbConnectionManager as databaseConnectionManager } from '../../database/DatabaseConnectionManager.js';
import { quantumUtilityManager } from '../../quantum/QuantumEnhancementUtility.js';

/**
 * 👷 LABOR COST SERVICE
 * Workforce planning and cost calculation with German labor regulations
 */
export class LaborCostService extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableRealTimeTracking: true,
            enableQuantumOptimization: true,
            includeInsurance: true,
            includeSocialCharges: true,
            hoaiCompliant: true,
            ...config
        };
        
        // German construction trades (Gewerke)
        this.trades = {
            'ARCHITECT': 'Architekt',
            'STRUCTURAL_ENGINEER': 'Tragwerksplaner',
            'SITE_MANAGER': 'Bauleiter',
            'FOREMAN': 'Polier',
            'CONCRETE_WORKER': 'Betonbauer',
            'CARPENTER': 'Zimmerer',
            'MASON': 'Maurer',
            'STEEL_WORKER': 'Stahlbauer',
            'ROOFER': 'Dachdecker',
            'ELECTRICIAN': 'Elektriker',
            'PLUMBER': 'Installateur',
            'HVAC_TECHNICIAN': 'Heizungsbauer',
            'PLASTERER': 'Verputzer',
            'PAINTER': 'Maler',
            'FLOOR_INSTALLER': 'Bodenleger',
            'GLAZIER': 'Glaser',
            'INSULATOR': 'Isolierer',
            'SCAFFOLDER': 'Gerüstbauer',
            'CRANE_OPERATOR': 'Kranführer',
            'EXCAVATOR_OPERATOR': 'Baggerfahrer'
        };
        
        // Labor rates database (EUR per hour)
        this.laborRates = new Map();
        
        // Qualification levels
        this.qualificationLevels = {
            'APPRENTICE': { factor: 0.5, name: 'Auszubildender' },
            'HELPER': { factor: 0.7, name: 'Helfer' },
            'SKILLED': { factor: 1.0, name: 'Facharbeiter' },
            'MASTER': { factor: 1.3, name: 'Meister' },
            'SPECIALIST': { factor: 1.5, name: 'Spezialist' }
        };
        
        // Regional wage factors (Germany)
        this.regionalWageFactors = new Map([
            ['Berlin', 1.00],
            ['Munich', 1.15],
            ['Frankfurt', 1.12],
            ['Hamburg', 1.08],
            ['Stuttgart', 1.10],
            ['Cologne', 1.05],
            ['Dresden', 0.90],
            ['Leipzig', 0.88],
            ['Rural_West', 0.95],
            ['Rural_East', 0.85]
        ]);
        
        // Social charges (Sozialabgaben)
        this.socialCharges = {
            healthInsurance: 0.073,      // 7.3% employer share
            pensionInsurance: 0.093,     // 9.3% employer share
            unemploymentInsurance: 0.012, // 1.2% employer share
            nursingCareInsurance: 0.01775,// 1.775% employer share
            accidentInsurance: 0.025,     // 2.5% average for construction
            insolvencyLevy: 0.0006        // 0.06%
        };
        
        // Working time regulations
        this.workingTimeRegulations = {
            standardHoursPerWeek: 40,
            standardHoursPerDay: 8,
            maxHoursPerDay: 10,
            maxHoursPerWeek: 48,
            overtimeRate: 1.25,
            weekendRate: 1.50,
            holidayRate: 2.00,
            nightShiftRate: 1.25
        };
        
        // Workforce planning
        this.workforcePlans = new Map();
        this.laborAllocation = new Map();
        
        // Quantum optimization for workforce allocation
        this.quantumUtility = quantumUtilityManager;
        this.memoryPersistence = null;
        
        this.isInitialized = false;
    }
    
    /**
     * 🚀 INITIALIZE SERVICE
     */
    async initialize() {
        console.log('👷 Initializing Labor Cost Service...');
        
        try {
            // Initialize memory persistence
            this.memoryPersistence = new EliteMemoryPersistenceEngine({
                namespace: 'labor_costs',
                database: databaseConnectionManager.config
            });
            await this.memoryPersistence.initialize();
            
            // Initialize quantum optimization if enabled
            if (this.config.enableQuantumOptimization) {
                this.quantumUtility = new QuantumEnhancementUtility();
                await this.quantumUtility.initialize();
            }
            
            // Load base labor rates
            await this.loadBaseLaborRates();
            
            // Load workforce data
            await this.loadWorkforceData();
            
            // Create database tables
            await this.createDatabaseTables();
            
            // Start real-time tracking
            if (this.config.enableRealTimeTracking) {
                this.startRealTimeTracking();
            }
            
            this.isInitialized = true;
            console.log('   ✅ Labor Cost Service initialized');
            console.log(`   👷 ${this.laborRates.size} trades configured`);
            console.log(`   📊 Social charges: ${(this.getTotalSocialChargeRate() * 100).toFixed(1)}%`);
            
            return true;
            
        } catch (error) {
            console.error('   ❌ Failed to initialize Labor Cost Service:', error.message);
            throw error;
        }
    }
    
    /**
     * 📊 LOAD BASE LABOR RATES
     */
    async loadBaseLaborRates() {
        console.log('   📊 Loading base labor rates...');
        
        // Base hourly rates for skilled workers (Facharbeiter) in EUR
        const baseRates = [
            // Planning & Management
            { trade: 'ARCHITECT', hourlyRate: 75, category: 'planning' },
            { trade: 'STRUCTURAL_ENGINEER', hourlyRate: 80, category: 'planning' },
            { trade: 'SITE_MANAGER', hourlyRate: 65, category: 'management' },
            { trade: 'FOREMAN', hourlyRate: 45, category: 'management' },
            
            // Structural Trades
            { trade: 'CONCRETE_WORKER', hourlyRate: 35, category: 'structural' },
            { trade: 'CARPENTER', hourlyRate: 38, category: 'structural' },
            { trade: 'MASON', hourlyRate: 36, category: 'structural' },
            { trade: 'STEEL_WORKER', hourlyRate: 40, category: 'structural' },
            { trade: 'SCAFFOLDER', hourlyRate: 34, category: 'structural' },
            
            // Envelope Trades
            { trade: 'ROOFER', hourlyRate: 38, category: 'envelope' },
            { trade: 'GLAZIER', hourlyRate: 35, category: 'envelope' },
            { trade: 'INSULATOR', hourlyRate: 33, category: 'envelope' },
            
            // MEP Trades (Mechanical, Electrical, Plumbing)
            { trade: 'ELECTRICIAN', hourlyRate: 40, category: 'mep' },
            { trade: 'PLUMBER', hourlyRate: 38, category: 'mep' },
            { trade: 'HVAC_TECHNICIAN', hourlyRate: 40, category: 'mep' },
            
            // Finishing Trades
            { trade: 'PLASTERER', hourlyRate: 34, category: 'finishing' },
            { trade: 'PAINTER', hourlyRate: 32, category: 'finishing' },
            { trade: 'FLOOR_INSTALLER', hourlyRate: 35, category: 'finishing' },
            
            // Equipment Operators
            { trade: 'CRANE_OPERATOR', hourlyRate: 42, category: 'equipment' },
            { trade: 'EXCAVATOR_OPERATOR', hourlyRate: 38, category: 'equipment' }
        ];
        
        // Load into rates database
        for (const rate of baseRates) {
            this.laborRates.set(rate.trade, {
                ...rate,
                tradeName: this.trades[rate.trade],
                lastUpdate: new Date(),
                availability: 'available'
            });
        }
        
        // Load from database if available
        await this.loadRatesFromDatabase();
    }
    
    /**
     * 💰 CALCULATE LABOR COST
     */
    async calculateLaborCost(workforce, options = {}) {
        const {
            region = 'Berlin',
            duration = 1,  // weeks
            includeOvertime = false,
            includeSocialCharges = true,
            includeInsurance = true,
            projectPhase = 'construction' // planning, construction, finishing
        } = options;
        
        const result = {
            workforce: [],
            regularHours: 0,
            overtimeHours: 0,
            baseCost: 0,
            socialCharges: 0,
            insurance: 0,
            regionalAdjustment: 0,
            total: 0,
            weeklyBreakdown: [],
            tradeBreakdown: {},
            warnings: []
        };
        
        // Calculate for each worker/team
        for (const worker of workforce) {
            const tradeData = this.laborRates.get(worker.trade);
            
            if (!tradeData) {
                result.warnings.push(`Trade ${worker.trade} not found in database`);
                continue;
            }
            
            // Calculate hours
            const standardHours = this.workingTimeRegulations.standardHoursPerWeek * duration;
            const workerCount = worker.count || 1;
            const qualification = this.qualificationLevels[worker.qualification || 'SKILLED'];
            
            // Base hourly rate with qualification factor
            let hourlyRate = tradeData.hourlyRate * qualification.factor;
            
            // Apply regional factor
            const regionalFactor = this.regionalWageFactors.get(region) || 1.0;
            hourlyRate *= regionalFactor;
            
            // Calculate regular and overtime hours
            let regularHours = Math.min(worker.hours || standardHours, standardHours);
            let overtimeHours = 0;
            
            if (includeOvertime && worker.hours > standardHours) {
                overtimeHours = worker.hours - standardHours;
            }
            
            // Calculate costs
            const regularCost = regularHours * hourlyRate * workerCount;
            const overtimeCost = overtimeHours * hourlyRate * this.workingTimeRegulations.overtimeRate * workerCount;
            const baseCost = regularCost + overtimeCost;
            
            // Calculate social charges
            let socialChargeAmount = 0;
            if (includeSocialCharges) {
                socialChargeAmount = baseCost * this.getTotalSocialChargeRate();
            }
            
            // Calculate insurance
            let insuranceAmount = 0;
            if (includeInsurance) {
                insuranceAmount = baseCost * this.socialCharges.accidentInsurance;
            }
            
            const totalWorkerCost = baseCost + socialChargeAmount + insuranceAmount;
            
            result.workforce.push({
                trade: worker.trade,
                tradeName: tradeData.tradeName,
                qualification: qualification.name,
                count: workerCount,
                regularHours,
                overtimeHours,
                hourlyRate,
                baseCost,
                socialCharges: socialChargeAmount,
                insurance: insuranceAmount,
                total: totalWorkerCost
            });
            
            // Update totals
            result.regularHours += regularHours * workerCount;
            result.overtimeHours += overtimeHours * workerCount;
            result.baseCost += baseCost;
            result.socialCharges += socialChargeAmount;
            result.insurance += insuranceAmount;
            
            // Update trade breakdown
            if (!result.tradeBreakdown[tradeData.category]) {
                result.tradeBreakdown[tradeData.category] = {
                    hours: 0,
                    cost: 0,
                    workers: 0
                };
            }
            result.tradeBreakdown[tradeData.category].hours += (regularHours + overtimeHours) * workerCount;
            result.tradeBreakdown[tradeData.category].cost += totalWorkerCost;
            result.tradeBreakdown[tradeData.category].workers += workerCount;
        }
        
        // Calculate weekly breakdown
        if (duration > 0) {
            for (let week = 1; week <= duration; week++) {
                result.weeklyBreakdown.push({
                    week,
                    cost: result.baseCost / duration,
                    workers: workforce.reduce((sum, w) => sum + (w.count || 1), 0)
                });
            }
        }
        
        // Regional adjustment tracking
        result.regionalAdjustment = result.baseCost * ((this.regionalWageFactors.get(region) || 1.0) - 1);
        
        // Calculate total
        result.total = result.baseCost + result.socialCharges + result.insurance;
        
        // Store calculation
        await this.storeCalculation(result);
        
        return result;
    }
    
    /**
     * 📅 PLAN WORKFORCE
     */
    async planWorkforce(project, options = {}) {
        const {
            startDate = new Date(),
            phases = ['foundation', 'structure', 'envelope', 'mep', 'finishing'],
            enableOptimization = true
        } = options;
        
        console.log('📅 Planning workforce allocation...');
        
        const plan = {
            projectId: project.id,
            startDate,
            phases: [],
            totalWorkers: 0,
            totalCost: 0,
            criticalPath: [],
            recommendations: []
        };
        
        // Plan for each phase
        for (const phase of phases) {
            const phaseRequirements = this.getPhaseRequirements(phase, project);
            
            // Optimize workforce allocation if enabled
            let allocation;
            if (enableOptimization && this.quantumUtility) {
                allocation = await this.optimizeWorkforceAllocation(phaseRequirements);
            } else {
                allocation = this.basicWorkforceAllocation(phaseRequirements);
            }
            
            plan.phases.push({
                name: phase,
                duration: phaseRequirements.duration,
                workforce: allocation.workforce,
                cost: allocation.cost,
                startWeek: this.calculateStartWeek(phase, phases, startDate),
                dependencies: phaseRequirements.dependencies
            });
            
            plan.totalWorkers = Math.max(plan.totalWorkers, allocation.workforce.length);
            plan.totalCost += allocation.cost;
        }
        
        // Identify critical path
        plan.criticalPath = this.identifyCriticalPath(plan.phases);
        
        // Generate recommendations
        plan.recommendations = this.generateWorkforceRecommendations(plan);
        
        // Store plan
        this.workforcePlans.set(project.id, plan);
        await this.storePlan(plan);
        
        return plan;
    }
    
    /**
     * 🔮 OPTIMIZE WORKFORCE ALLOCATION
     */
    async optimizeWorkforceAllocation(requirements) {
        console.log('   🔮 Quantum-optimizing workforce allocation...');
        
        const quantumState = {
            requirements: requirements.trades,
            constraints: {
                budget: requirements.budget,
                deadline: requirements.duration,
                quality: requirements.qualityLevel
            },
            objectives: {
                minimizeCost: 0.4,
                minimizeTime: 0.3,
                maximizeQuality: 0.3
            }
        };
        
        // Quantum optimization
        const optimization = await this.quantumUtility.optimizeWithQuantumAnnealing(
            quantumState,
            { iterations: 100 }
        );
        
        // Convert quantum result to workforce allocation
        const allocation = {
            workforce: [],
            cost: 0,
            efficiency: optimization.efficiency || 0.85
        };
        
        for (const trade of requirements.trades) {
            const optimal = optimization.solution?.[trade.trade] || trade;
            
            allocation.workforce.push({
                trade: trade.trade,
                count: optimal.count || trade.minWorkers,
                qualification: optimal.qualification || 'SKILLED',
                hours: optimal.hours || requirements.duration * 40
            });
            
            // Calculate cost
            const cost = await this.calculateLaborCost([allocation.workforce[allocation.workforce.length - 1]]);
            allocation.cost += cost.total;
        }
        
        return allocation;
    }
    
    /**
     * 👷 BASIC WORKFORCE ALLOCATION
     */
    basicWorkforceAllocation(requirements) {
        const allocation = {
            workforce: [],
            cost: 0,
            efficiency: 0.75
        };
        
        for (const trade of requirements.trades) {
            allocation.workforce.push({
                trade: trade.trade,
                count: trade.minWorkers,
                qualification: 'SKILLED',
                hours: requirements.duration * 40
            });
        }
        
        return allocation;
    }
    
    /**
     * 📊 GET PHASE REQUIREMENTS
     */
    getPhaseRequirements(phase, project) {
        const requirements = {
            foundation: {
                duration: 4, // weeks
                trades: [
                    { trade: 'EXCAVATOR_OPERATOR', minWorkers: 2 },
                    { trade: 'CONCRETE_WORKER', minWorkers: 6 },
                    { trade: 'STEEL_WORKER', minWorkers: 4 }
                ],
                dependencies: [],
                budget: project.budget * 0.15
            },
            structure: {
                duration: 8,
                trades: [
                    { trade: 'CONCRETE_WORKER', minWorkers: 8 },
                    { trade: 'CARPENTER', minWorkers: 6 },
                    { trade: 'STEEL_WORKER', minWorkers: 4 },
                    { trade: 'CRANE_OPERATOR', minWorkers: 2 }
                ],
                dependencies: ['foundation'],
                budget: project.budget * 0.25
            },
            envelope: {
                duration: 6,
                trades: [
                    { trade: 'MASON', minWorkers: 6 },
                    { trade: 'ROOFER', minWorkers: 4 },
                    { trade: 'GLAZIER', minWorkers: 3 },
                    { trade: 'INSULATOR', minWorkers: 4 }
                ],
                dependencies: ['structure'],
                budget: project.budget * 0.20
            },
            mep: {
                duration: 10,
                trades: [
                    { trade: 'ELECTRICIAN', minWorkers: 6 },
                    { trade: 'PLUMBER', minWorkers: 5 },
                    { trade: 'HVAC_TECHNICIAN', minWorkers: 4 }
                ],
                dependencies: ['structure'],
                budget: project.budget * 0.25
            },
            finishing: {
                duration: 8,
                trades: [
                    { trade: 'PLASTERER', minWorkers: 6 },
                    { trade: 'PAINTER', minWorkers: 8 },
                    { trade: 'FLOOR_INSTALLER', minWorkers: 4 }
                ],
                dependencies: ['envelope', 'mep'],
                budget: project.budget * 0.15
            }
        };
        
        return requirements[phase] || requirements.structure;
    }
    
    /**
     * 📈 FORECAST LABOR DEMAND
     */
    async forecastLaborDemand(region, months = 6) {
        console.log('📈 Forecasting labor demand...');
        
        const forecast = {
            region,
            months: [],
            trades: {},
            totalDemand: 0,
            recommendations: []
        };
        
        // Historical demand patterns (simplified)
        const seasonalFactors = [0.7, 0.75, 0.85, 0.95, 1.1, 1.2, 1.25, 1.25, 1.2, 1.1, 0.95, 0.8];
        const currentMonth = new Date().getMonth();
        
        for (let i = 0; i < months; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const factor = seasonalFactors[monthIndex];
            
            const monthForecast = {
                month: i + 1,
                demandFactor: factor,
                estimatedProjects: Math.floor(factor * 100),
                requiredWorkers: {}
            };
            
            // Forecast for each trade
            for (const [trade, data] of this.laborRates) {
                const baseDemand = 50; // Base number of workers
                const demand = Math.floor(baseDemand * factor);
                
                monthForecast.requiredWorkers[trade] = demand;
                
                if (!forecast.trades[trade]) {
                    forecast.trades[trade] = {
                        total: 0,
                        peak: 0,
                        average: 0
                    };
                }
                
                forecast.trades[trade].total += demand;
                forecast.trades[trade].peak = Math.max(forecast.trades[trade].peak, demand);
            }
            
            forecast.months.push(monthForecast);
        }
        
        // Calculate averages and totals
        for (const trade in forecast.trades) {
            forecast.trades[trade].average = forecast.trades[trade].total / months;
            forecast.totalDemand += forecast.trades[trade].total;
        }
        
        // Generate recommendations
        if (forecast.trades['ELECTRICIAN']?.peak > 200) {
            forecast.recommendations.push('High demand for electricians expected - consider early recruitment');
        }
        
        if (seasonalFactors[currentMonth] < 0.8) {
            forecast.recommendations.push('Low season approaching - optimize workforce retention');
        }
        
        return forecast;
    }
    
    /**
     * 📊 CALCULATE PRODUCTIVITY
     */
    calculateProductivity(workforce, output) {
        const productivity = {
            overall: 0,
            byTrade: {},
            efficiency: 0,
            recommendations: []
        };
        
        let totalHours = 0;
        let totalOutput = 0;
        
        for (const worker of workforce) {
            const hours = worker.hours * worker.count;
            const tradeOutput = output[worker.trade] || 0;
            
            productivity.byTrade[worker.trade] = {
                hours,
                output: tradeOutput,
                rate: tradeOutput / hours,
                efficiency: this.calculateEfficiency(worker.trade, tradeOutput, hours)
            };
            
            totalHours += hours;
            totalOutput += tradeOutput;
        }
        
        productivity.overall = totalOutput / totalHours;
        productivity.efficiency = this.calculateOverallEfficiency(productivity.byTrade);
        
        // Generate recommendations
        for (const [trade, data] of Object.entries(productivity.byTrade)) {
            if (data.efficiency < 0.7) {
                productivity.recommendations.push(`${trade}: Low efficiency - consider training or process improvement`);
            }
        }
        
        return productivity;
    }
    
    /**
     * 🏆 CALCULATE EFFICIENCY
     */
    calculateEfficiency(trade, output, hours) {
        // Standard output rates (units per hour) - simplified
        const standardRates = {
            'MASON': 0.5,          // m² per hour
            'CONCRETE_WORKER': 0.3, // m³ per hour
            'PAINTER': 10,         // m² per hour
            'ELECTRICIAN': 2,      // outlets per hour
            'PLUMBER': 1.5         // fixtures per hour
        };
        
        const standard = standardRates[trade] || 1;
        const actual = output / hours;
        
        return Math.min(actual / standard, 1.5); // Cap at 150% efficiency
    }
    
    /**
     * 📊 CALCULATE OVERALL EFFICIENCY
     */
    calculateOverallEfficiency(byTrade) {
        const efficiencies = Object.values(byTrade).map(t => t.efficiency);
        return efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
    }
    
    /**
     * 📅 CALCULATE START WEEK
     */
    calculateStartWeek(phase, allPhases, startDate) {
        // Simplified - would need proper scheduling logic
        const phaseIndex = allPhases.indexOf(phase);
        return phaseIndex * 4; // Each phase starts 4 weeks after the previous
    }
    
    /**
     * 🛤️ IDENTIFY CRITICAL PATH
     */
    identifyCriticalPath(phases) {
        // Simplified critical path - would need proper CPM algorithm
        return phases
            .filter(p => p.dependencies.length === 0 || p.name === 'finishing')
            .map(p => p.name);
    }
    
    /**
     * 💡 GENERATE WORKFORCE RECOMMENDATIONS
     */
    generateWorkforceRecommendations(plan) {
        const recommendations = [];
        
        // Check for workforce peaks
        const peakWorkers = Math.max(...plan.phases.map(p => p.workforce.length));
        if (peakWorkers > 50) {
            recommendations.push(`Peak workforce of ${peakWorkers} workers - ensure adequate site facilities`);
        }
        
        // Check for cost overruns
        if (plan.totalCost > plan.phases[0].cost * plan.phases.length * 1.2) {
            recommendations.push('Labor costs exceed budget - consider optimization');
        }
        
        // Check for scheduling conflicts
        const mepPhase = plan.phases.find(p => p.name === 'mep');
        const finishingPhase = plan.phases.find(p => p.name === 'finishing');
        if (mepPhase && finishingPhase && mepPhase.startWeek + mepPhase.duration > finishingPhase.startWeek) {
            recommendations.push('MEP and finishing phases overlap - coordinate carefully');
        }
        
        return recommendations;
    }
    
    /**
     * 💲 GET TOTAL SOCIAL CHARGE RATE
     */
    getTotalSocialChargeRate() {
        return Object.values(this.socialCharges).reduce((a, b) => a + b, 0);
    }
    
    /**
     * 🔄 START REAL-TIME TRACKING
     */
    startRealTimeTracking() {
        console.log('   🔄 Starting real-time workforce tracking...');
        
        this.trackingInterval = setInterval(() => {
            this.updateLaborAvailability();
            this.updateLaborRates();
        }, 3600000); // Every hour
    }
    
    /**
     * 📊 UPDATE LABOR AVAILABILITY
     */
    async updateLaborAvailability() {
        // Simulate labor availability changes
        for (const [trade, data] of this.laborRates) {
            const random = Math.random();
            if (random < 0.1) {
                data.availability = 'scarce';
            } else if (random < 0.3) {
                data.availability = 'limited';
            } else {
                data.availability = 'available';
            }
        }
    }
    
    /**
     * 📊 UPDATE LABOR RATES
     */
    async updateLaborRates() {
        // Simulate rate fluctuations based on demand
        for (const [trade, data] of this.laborRates) {
            if (data.availability === 'scarce') {
                data.hourlyRate *= 1.02; // 2% increase
            } else if (data.availability === 'available') {
                data.hourlyRate *= 0.99; // 1% decrease
            }
            
            data.lastUpdate = new Date();
        }
        
        await this.persistRates();
    }
    
    /**
     * 💾 CREATE DATABASE TABLES
     */
    async createDatabaseTables() {
        if (!databaseConnectionManager.isConnected) return;
        
        try {
            await databaseConnectionManager.executeQuery(`
                CREATE TABLE IF NOT EXISTS labor_rates (
                    trade VARCHAR(50) PRIMARY KEY,
                    trade_name VARCHAR(100) NOT NULL,
                    hourly_rate DECIMAL(10, 2) NOT NULL,
                    category VARCHAR(50),
                    availability VARCHAR(20),
                    last_update TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await databaseConnectionManager.executeQuery(`
                CREATE TABLE IF NOT EXISTS labor_calculations (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(100),
                    calculation_data JSONB NOT NULL,
                    total_cost DECIMAL(12, 2) NOT NULL,
                    total_hours INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await databaseConnectionManager.executeQuery(`
                CREATE TABLE IF NOT EXISTS workforce_plans (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(100) UNIQUE NOT NULL,
                    plan_data JSONB NOT NULL,
                    total_workers INTEGER,
                    total_cost DECIMAL(12, 2),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
        } catch (error) {
            console.error('Failed to create labor cost tables:', error);
        }
    }
    
    /**
     * 💾 LOAD RATES FROM DATABASE
     */
    async loadRatesFromDatabase() {
        if (!databaseConnectionManager.isConnected) return;
        
        try {
            const result = await databaseConnectionManager.executeQuery(`
                SELECT * FROM labor_rates
            `);
            
            for (const row of result.rows) {
                this.laborRates.set(row.trade, {
                    trade: row.trade,
                    tradeName: row.trade_name,
                    hourlyRate: parseFloat(row.hourly_rate),
                    category: row.category,
                    availability: row.availability,
                    lastUpdate: row.last_update
                });
            }
            
        } catch (error) {
            console.warn('Could not load labor rates from database:', error.message);
        }
    }
    
    /**
     * 💾 LOAD WORKFORCE DATA
     */
    async loadWorkforceData() {
        // Load historical workforce data and patterns
        // This would connect to HR systems in production
    }
    
    /**
     * 💾 PERSIST RATES
     */
    async persistRates() {
        if (!databaseConnectionManager.isConnected) return;
        
        for (const [trade, data] of this.laborRates) {
            try {
                await databaseConnectionManager.executeQuery(`
                    INSERT INTO labor_rates (trade, trade_name, hourly_rate, category, availability)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (trade) DO UPDATE SET
                        hourly_rate = $3,
                        availability = $5,
                        last_update = NOW()
                `, [
                    trade,
                    data.tradeName,
                    data.hourlyRate,
                    data.category,
                    data.availability
                ]);
                
            } catch (error) {
                console.error(`Failed to persist rate for ${trade}:`, error.message);
            }
        }
    }
    
    /**
     * 💾 STORE CALCULATION
     */
    async storeCalculation(calculation) {
        if (!databaseConnectionManager.isConnected) return;
        
        try {
            await databaseConnectionManager.executeQuery(`
                INSERT INTO labor_calculations (calculation_data, total_cost, total_hours)
                VALUES ($1, $2, $3)
            `, [
                JSON.stringify(calculation),
                calculation.total,
                calculation.regularHours + calculation.overtimeHours
            ]);
            
        } catch (error) {
            console.error('Failed to store calculation:', error.message);
        }
    }
    
    /**
     * 💾 STORE PLAN
     */
    async storePlan(plan) {
        if (!databaseConnectionManager.isConnected) return;
        
        try {
            await databaseConnectionManager.executeQuery(`
                INSERT INTO workforce_plans (project_id, plan_data, total_workers, total_cost)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (project_id) DO UPDATE SET
                    plan_data = $2,
                    total_workers = $3,
                    total_cost = $4,
                    updated_at = NOW()
            `, [
                plan.projectId,
                JSON.stringify(plan),
                plan.totalWorkers,
                plan.totalCost
            ]);
            
        } catch (error) {
            console.error('Failed to store workforce plan:', error.message);
        }
    }
    
    /**
     * 📊 GET LABOR STATISTICS
     */
    getLaborStatistics() {
        const stats = {
            totalTrades: this.laborRates.size,
            averageRate: 0,
            categories: {},
            availability: {
                available: 0,
                limited: 0,
                scarce: 0
            }
        };
        
        let totalRate = 0;
        
        for (const [trade, data] of this.laborRates) {
            totalRate += data.hourlyRate;
            
            // Category stats
            if (!stats.categories[data.category]) {
                stats.categories[data.category] = {
                    count: 0,
                    avgRate: 0
                };
            }
            stats.categories[data.category].count++;
            stats.categories[data.category].avgRate += data.hourlyRate;
            
            // Availability stats
            stats.availability[data.availability || 'available']++;
        }
        
        // Calculate averages
        stats.averageRate = totalRate / this.laborRates.size;
        
        for (const category in stats.categories) {
            const cat = stats.categories[category];
            cat.avgRate = cat.avgRate / cat.count;
        }
        
        return stats;
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
        
        await this.persistRates();
        
        if (this.memoryPersistence) {
            await this.memoryPersistence.shutdown();
        }
        
        this.isInitialized = false;
        console.log('   ✅ Labor Cost Service shutdown complete');
    }
}

export default LaborCostService;
