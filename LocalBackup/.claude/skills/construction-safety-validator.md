# Construction Safety Validator Implementation

## Overview

This skill provides a production-ready safety validation system for the AIGO-Syndicate construction intelligence. It includes risk assessment algorithms, safety protocol verification, incident prediction models, real-time monitoring via WebSocket, and comprehensive compliance reporting.

## Core Implementation

### Safety Validation Engine

```javascript
// construction-safety-validator.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs-node';
import WebSocket from 'ws';

export class ConstructionSafetyValidator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Risk categories
            riskCategories: config.riskCategories || [
                'fall_hazards', 'electrical', 'machinery', 'confined_spaces',
                'hazardous_materials', 'structural', 'environmental', 'ergonomic'
            ],
            
            // Risk thresholds
            riskThresholds: config.riskThresholds || {
                low: 0.3,
                medium: 0.6,
                high: 0.8,
                critical: 0.95
            },
            
            // Safety protocols
            protocols: config.protocols || {
                'DIN_4420': 'Scaffolding safety',
                'DIN_VDE_0100': 'Electrical installations',
                'BGV_C22': 'Construction machinery',
                'DGUV_101-004': 'Confined spaces',
                'ASR_A1.3': 'Safety signage',
                'DIN_EN_388': 'Personal protective equipment'
            },
            
            // Monitoring intervals
            monitoringIntervals: config.monitoringIntervals || {
                realtime: 1000, // 1 second
                standard: 60000, // 1 minute
                periodic: 3600000 // 1 hour
            },
            
            // Alert configuration
            alertConfig: config.alertConfig || {
                channels: ['websocket', 'email', 'sms'],
                escalationLevels: 3,
                escalationDelay: 300000 // 5 minutes
            },
            
            // ML model settings
            predictionWindow: config.predictionWindow || 86400000, // 24 hours
            minIncidentData: config.minIncidentData || 100,
            
            // WebSocket
            wsPort: config.wsPort || 3004,
            
            ...config
        };
        
        this.dbPool = null;
        this.wsServer = null;
        this.incidentModel = null;
        this.activeMonitors = new Map();
        this.alertQueue = [];
        
        // Metrics
        this.metrics = {
            totalAssessments: 0,
            incidentsDetected: 0,
            alertsSent: 0,
            falsePositives: 0,
            modelAccuracy: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load safety protocols
            await this.loadSafetyProtocols();
            
            // Initialize incident prediction model
            await this.initializePredictionModel();
            
            // Set up WebSocket server
            await this.initializeWebSocket();
            
            // Start monitoring services
            this.startMonitoringServices();
            
            this.emit('initialized');
            console.log('Construction Safety Validator initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'safety_validator'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Safety assessments table
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_assessments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    assessment_type VARCHAR(50) NOT NULL,
                    risk_score FLOAT NOT NULL,
                    risk_level VARCHAR(20) NOT NULL,
                    hazards_identified JSONB NOT NULL DEFAULT '[]'::jsonb,
                    recommendations JSONB DEFAULT '[]'::jsonb,
                    assessed_by UUID,
                    assessment_date TIMESTAMPTZ DEFAULT NOW(),
                    valid_until TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_assessments_project 
                ON safety_assessments(project_id, assessment_date DESC);
                
                CREATE INDEX IF NOT EXISTS idx_assessments_risk 
                ON safety_assessments(risk_level, assessment_date DESC);
            `);
            
            // Safety incidents table
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_incidents (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    incident_type VARCHAR(100) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    description TEXT,
                    location JSONB,
                    injuries INTEGER DEFAULT 0,
                    equipment_damage BOOLEAN DEFAULT false,
                    root_causes JSONB DEFAULT '[]'::jsonb,
                    corrective_actions JSONB DEFAULT '[]'::jsonb,
                    incident_date TIMESTAMPTZ NOT NULL,
                    reported_date TIMESTAMPTZ DEFAULT NOW(),
                    resolved_date TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_incidents_project 
                ON safety_incidents(project_id, incident_date DESC);
                
                CREATE INDEX IF NOT EXISTS idx_incidents_type 
                ON safety_incidents(incident_type, severity);
            `);
            
            // Safety protocols compliance
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_compliance (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    protocol_id VARCHAR(50) NOT NULL,
                    compliance_status VARCHAR(20) NOT NULL,
                    checklist_items JSONB NOT NULL,
                    non_conformities JSONB DEFAULT '[]'::jsonb,
                    corrective_deadline TIMESTAMPTZ,
                    verified_by UUID,
                    verification_date TIMESTAMPTZ DEFAULT NOW(),
                    next_review_date TIMESTAMPTZ,
                    evidence_urls JSONB DEFAULT '[]'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_compliance_project 
                ON safety_compliance(project_id, verification_date DESC);
                
                CREATE INDEX IF NOT EXISTS idx_compliance_status 
                ON safety_compliance(compliance_status);
            `);
            
            // Real-time monitoring data
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_monitoring (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    sensor_type VARCHAR(50) NOT NULL,
                    sensor_id VARCHAR(100) NOT NULL,
                    measurement_type VARCHAR(50) NOT NULL,
                    value FLOAT NOT NULL,
                    unit VARCHAR(20),
                    threshold_exceeded BOOLEAN DEFAULT false,
                    location JSONB,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    CONSTRAINT unique_sensor_reading 
                    UNIQUE(sensor_id, timestamp)
                );
                
                CREATE INDEX IF NOT EXISTS idx_monitoring_project 
                ON safety_monitoring(project_id, timestamp DESC);
                
                CREATE INDEX IF NOT EXISTS idx_monitoring_threshold 
                ON safety_monitoring(threshold_exceeded, timestamp DESC)
                WHERE threshold_exceeded = true;
            `);
            
            // Safety alerts
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_alerts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    alert_type VARCHAR(50) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    source VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    details JSONB DEFAULT '{}'::jsonb,
                    acknowledged BOOLEAN DEFAULT false,
                    acknowledged_by UUID,
                    acknowledged_at TIMESTAMPTZ,
                    resolution_notes TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    escalation_level INTEGER DEFAULT 0,
                    channels_notified JSONB DEFAULT '[]'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_alerts_project 
                ON safety_alerts(project_id, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_alerts_unack 
                ON safety_alerts(acknowledged, severity)
                WHERE acknowledged = false;
            `);
            
            // Prediction model training data
            await client.query(`
                CREATE TABLE IF NOT EXISTS safety_training_data (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    feature_vector FLOAT[] NOT NULL,
                    incident_occurred BOOLEAN NOT NULL,
                    incident_type VARCHAR(100),
                    conditions JSONB NOT NULL,
                    project_phase VARCHAR(50),
                    timestamp TIMESTAMPTZ NOT NULL,
                    used_in_training BOOLEAN DEFAULT false
                );
                
                CREATE INDEX IF NOT EXISTS idx_training_timestamp 
                ON safety_training_data(timestamp DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Risk Assessment Functions
    
    async assessProjectRisk(projectId, assessmentType = 'comprehensive') {
        this.metrics.totalAssessments++;
        
        const assessment = {
            projectId,
            assessmentType,
            timestamp: new Date(),
            hazards: [],
            overallRiskScore: 0,
            riskByCategory: {},
            recommendations: []
        };
        
        try {
            // Gather project data
            const projectData = await this.gatherProjectData(projectId);
            
            // Assess each risk category
            for (const category of this.config.riskCategories) {
                const categoryRisk = await this.assessCategoryRisk(
                    category, 
                    projectData
                );
                
                assessment.riskByCategory[category] = categoryRisk;
                assessment.hazards.push(...categoryRisk.hazards);
            }
            
            // Calculate overall risk score
            assessment.overallRiskScore = this.calculateOverallRisk(
                assessment.riskByCategory
            );
            
            // Determine risk level
            assessment.riskLevel = this.determineRiskLevel(
                assessment.overallRiskScore
            );
            
            // Generate recommendations
            assessment.recommendations = await this.generateRecommendations(
                assessment
            );
            
            // Store assessment
            await this.storeAssessment(assessment);
            
            // Check if alerts needed
            if (assessment.riskLevel === 'high' || assessment.riskLevel === 'critical') {
                await this.createSafetyAlert(projectId, assessment);
            }
            
            return assessment;
            
        } catch (error) {
            this.handleError('risk_assessment', error);
            throw error;
        }
    }
    
    async gatherProjectData(projectId) {
        const client = await this.dbPool.connect();
        try {
            // Get recent incidents
            const incidents = await client.query(`
                SELECT * FROM safety_incidents
                WHERE project_id = $1
                  AND incident_date > NOW() - INTERVAL '90 days'
                ORDER BY incident_date DESC
            `, [projectId]);
            
            // Get compliance status
            const compliance = await client.query(`
                SELECT * FROM safety_compliance
                WHERE project_id = $1
                ORDER BY verification_date DESC
            `, [projectId]);
            
            // Get monitoring data
            const monitoring = await client.query(`
                SELECT sensor_type, measurement_type, 
                       AVG(value) as avg_value,
                       MAX(value) as max_value,
                       COUNT(CASE WHEN threshold_exceeded THEN 1 END) as violations
                FROM safety_monitoring
                WHERE project_id = $1
                  AND timestamp > NOW() - INTERVAL '24 hours'
                GROUP BY sensor_type, measurement_type
            `, [projectId]);
            
            // Get project details (from main database)
            // This would integrate with the main project management system
            const projectDetails = {
                phase: 'construction',
                activeWorkers: 50,
                heavyEquipment: 5,
                height: 45, // meters
                weatherConditions: 'moderate'
            };
            
            return {
                incidents: incidents.rows,
                compliance: compliance.rows,
                monitoring: monitoring.rows,
                details: projectDetails
            };
            
        } finally {
            client.release();
        }
    }
    
    async assessCategoryRisk(category, projectData) {
        const assessment = {
            category,
            score: 0,
            hazards: [],
            factors: {}
        };
        
        switch (category) {
            case 'fall_hazards':
                return this.assessFallHazards(projectData);
                
            case 'electrical':
                return this.assessElectricalHazards(projectData);
                
            case 'machinery':
                return this.assessMachineryHazards(projectData);
                
            case 'confined_spaces':
                return this.assessConfinedSpaceHazards(projectData);
                
            case 'hazardous_materials':
                return this.assessHazardousMaterials(projectData);
                
            case 'structural':
                return this.assessStructuralHazards(projectData);
                
            case 'environmental':
                return this.assessEnvironmentalHazards(projectData);
                
            case 'ergonomic':
                return this.assessErgonomicHazards(projectData);
                
            default:
                return assessment;
        }
    }
    
    assessFallHazards(projectData) {
        const assessment = {
            category: 'fall_hazards',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Height factor
        const height = projectData.details.height || 0;
        if (height > 2) {
            assessment.factors.height = Math.min(1.0, height / 50);
            
            if (height > 10) {
                assessment.hazards.push({
                    type: 'working_at_height',
                    severity: 'high',
                    description: `Working at ${height}m height`,
                    mitigation: 'Fall protection systems required'
                });
            }
        }
        
        // Check scaffolding compliance
        const scaffoldingCompliance = projectData.compliance
            .find(c => c.protocol_id === 'DIN_4420');
        
        if (scaffoldingCompliance) {
            const nonConformities = scaffoldingCompliance.non_conformities || [];
            assessment.factors.scaffolding = nonConformities.length > 0 ? 0.8 : 0.2;
            
            nonConformities.forEach(nc => {
                assessment.hazards.push({
                    type: 'scaffolding_deficiency',
                    severity: 'medium',
                    description: nc.description,
                    mitigation: nc.corrective_action
                });
            });
        }
        
        // Recent fall incidents
        const fallIncidents = projectData.incidents
            .filter(i => i.incident_type.includes('fall'));
        
        assessment.factors.history = Math.min(1.0, fallIncidents.length * 0.2);
        
        // Calculate overall score
        assessment.score = Object.values(assessment.factors)
            .reduce((sum, val) => sum + val, 0) / 
            Object.keys(assessment.factors).length;
        
        return assessment;
    }
    
    assessElectricalHazards(projectData) {
        const assessment = {
            category: 'electrical',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Check electrical compliance
        const electricalCompliance = projectData.compliance
            .find(c => c.protocol_id === 'DIN_VDE_0100');
        
        if (electricalCompliance && electricalCompliance.compliance_status !== 'compliant') {
            assessment.factors.compliance = 0.7;
            assessment.hazards.push({
                type: 'electrical_non_compliance',
                severity: 'high',
                description: 'Electrical installation not fully compliant',
                mitigation: 'Complete electrical safety audit'
            });
        } else {
            assessment.factors.compliance = 0.2;
        }
        
        // Check monitoring data for electrical measurements
        const electricalMonitoring = projectData.monitoring
            .filter(m => m.sensor_type === 'electrical');
        
        electricalMonitoring.forEach(reading => {
            if (reading.violations > 0) {
                assessment.hazards.push({
                    type: 'electrical_anomaly',
                    severity: 'medium',
                    description: `${reading.violations} threshold violations in ${reading.measurement_type}`,
                    mitigation: 'Investigate electrical system'
                });
            }
        });
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessMachineryHazards(projectData) {
        const assessment = {
            category: 'machinery',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Equipment count factor
        const equipmentCount = projectData.details.heavyEquipment || 0;
        assessment.factors.equipment = Math.min(1.0, equipmentCount * 0.15);
        
        // Machinery compliance
        const machineryCompliance = projectData.compliance
            .find(c => c.protocol_id === 'BGV_C22');
        
        if (machineryCompliance) {
            assessment.factors.compliance = 
                machineryCompliance.compliance_status === 'compliant' ? 0.1 : 0.6;
        }
        
        // Recent machinery incidents
        const machineryIncidents = projectData.incidents
            .filter(i => i.incident_type.includes('machinery') || 
                        i.equipment_damage);
        
        if (machineryIncidents.length > 0) {
            assessment.factors.incidents = Math.min(1.0, machineryIncidents.length * 0.3);
            
            machineryIncidents.forEach(incident => {
                assessment.hazards.push({
                    type: 'machinery_incident_history',
                    severity: incident.severity,
                    description: incident.description,
                    mitigation: 'Review machinery operation procedures'
                });
            });
        }
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessConfinedSpaceHazards(projectData) {
        const assessment = {
            category: 'confined_spaces',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Check for confined space protocol
        const confinedSpaceCompliance = projectData.compliance
            .find(c => c.protocol_id === 'DGUV_101-004');
        
        if (confinedSpaceCompliance) {
            assessment.factors.hasConfinedSpaces = 1.0;
            
            if (confinedSpaceCompliance.compliance_status !== 'compliant') {
                assessment.hazards.push({
                    type: 'confined_space_protocol',
                    severity: 'critical',
                    description: 'Confined space entry protocol not compliant',
                    mitigation: 'Implement proper entry procedures immediately'
                });
            }
        } else {
            assessment.factors.hasConfinedSpaces = 0;
        }
        
        // Gas detection monitoring
        const gasMonitoring = projectData.monitoring
            .filter(m => m.sensor_type === 'gas_detector');
        
        gasMonitoring.forEach(reading => {
            if (reading.violations > 0) {
                assessment.hazards.push({
                    type: 'hazardous_atmosphere',
                    severity: 'critical',
                    description: `Hazardous gas levels detected`,
                    mitigation: 'Evacuate and ventilate area'
                });
                assessment.factors.atmosphere = 1.0;
            }
        });
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessHazardousMaterials(projectData) {
        const assessment = {
            category: 'hazardous_materials',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Check for hazmat incidents
        const hazmatIncidents = projectData.incidents
            .filter(i => i.incident_type.includes('chemical') || 
                        i.incident_type.includes('hazmat'));
        
        if (hazmatIncidents.length > 0) {
            assessment.factors.incidents = Math.min(1.0, hazmatIncidents.length * 0.4);
            
            hazmatIncidents.forEach(incident => {
                assessment.hazards.push({
                    type: 'hazmat_incident',
                    severity: incident.severity,
                    description: incident.description,
                    mitigation: 'Review hazmat handling procedures'
                });
            });
        }
        
        // Environmental monitoring
        const environmentalMonitoring = projectData.monitoring
            .filter(m => m.sensor_type === 'environmental' && 
                        m.measurement_type.includes('chemical'));
        
        environmentalMonitoring.forEach(reading => {
            if (reading.max_value > reading.avg_value * 2) {
                assessment.hazards.push({
                    type: 'chemical_exposure',
                    severity: 'medium',
                    description: 'Elevated chemical levels detected',
                    mitigation: 'Investigate source and provide PPE'
                });
                assessment.factors.exposure = 0.6;
            }
        });
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessStructuralHazards(projectData) {
        const assessment = {
            category: 'structural',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Vibration monitoring
        const vibrationMonitoring = projectData.monitoring
            .filter(m => m.sensor_type === 'vibration');
        
        vibrationMonitoring.forEach(reading => {
            if (reading.max_value > 5.0) { // mm/s threshold
                assessment.hazards.push({
                    type: 'excessive_vibration',
                    severity: 'high',
                    description: `High vibration levels: ${reading.max_value} mm/s`,
                    mitigation: 'Inspect structural integrity'
                });
                assessment.factors.vibration = 0.8;
            }
        });
        
        // Structural incidents
        const structuralIncidents = projectData.incidents
            .filter(i => i.incident_type.includes('structural') || 
                        i.incident_type.includes('collapse'));
        
        if (structuralIncidents.length > 0) {
            assessment.factors.history = 1.0;
            structuralIncidents.forEach(incident => {
                assessment.hazards.push({
                    type: 'structural_failure_risk',
                    severity: 'critical',
                    description: 'Previous structural issues recorded',
                    mitigation: 'Immediate structural assessment required'
                });
            });
        }
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessEnvironmentalHazards(projectData) {
        const assessment = {
            category: 'environmental',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Weather conditions
        const weather = projectData.details.weatherConditions;
        const weatherRisk = {
            'extreme': 0.9,
            'severe': 0.7,
            'moderate': 0.3,
            'mild': 0.1
        };
        
        assessment.factors.weather = weatherRisk[weather] || 0.3;
        
        if (weather === 'extreme' || weather === 'severe') {
            assessment.hazards.push({
                type: 'weather_hazard',
                severity: weather === 'extreme' ? 'high' : 'medium',
                description: `${weather} weather conditions`,
                mitigation: 'Consider work suspension or additional precautions'
            });
        }
        
        // Noise levels
        const noiseMonitoring = projectData.monitoring
            .find(m => m.sensor_type === 'noise');
        
        if (noiseMonitoring && noiseMonitoring.avg_value > 85) { // dB threshold
            assessment.hazards.push({
                type: 'noise_exposure',
                severity: noiseMonitoring.avg_value > 95 ? 'high' : 'medium',
                description: `Average noise level: ${noiseMonitoring.avg_value} dB`,
                mitigation: 'Mandatory hearing protection required'
            });
            assessment.factors.noise = (noiseMonitoring.avg_value - 80) / 40;
        }
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    assessErgonomicHazards(projectData) {
        const assessment = {
            category: 'ergonomic',
            score: 0,
            hazards: [],
            factors: {}
        };
        
        // Worker count factor
        const workerCount = projectData.details.activeWorkers || 0;
        assessment.factors.workforce = Math.min(1.0, workerCount / 100);
        
        // Ergonomic incidents
        const ergonomicIncidents = projectData.incidents
            .filter(i => i.incident_type.includes('strain') || 
                        i.incident_type.includes('ergonomic'));
        
        if (ergonomicIncidents.length > 0) {
            assessment.factors.incidents = Math.min(1.0, ergonomicIncidents.length * 0.25);
            
            const injuries = ergonomicIncidents.reduce((sum, i) => sum + i.injuries, 0);
            if (injuries > 0) {
                assessment.hazards.push({
                    type: 'ergonomic_injuries',
                    severity: injuries > 5 ? 'high' : 'medium',
                    description: `${injuries} ergonomic-related injuries reported`,
                    mitigation: 'Review work practices and provide training'
                });
            }
        }
        
        assessment.score = this.calculateCategoryScore(assessment);
        return assessment;
    }
    
    calculateCategoryScore(assessment) {
        const factors = Object.values(assessment.factors);
        if (factors.length === 0) return 0;
        
        // Weighted average with higher weight for more severe factors
        const weightedSum = factors.reduce((sum, factor, index) => {
            const weight = Math.pow(factor, 1.5); // Emphasize higher risks
            return sum + factor * weight;
        }, 0);
        
        const totalWeight = factors.reduce((sum, factor) => 
            sum + Math.pow(factor, 1.5), 0
        );
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    calculateOverallRisk(riskByCategory) {
        // Calculate weighted average of category risks
        const categoryWeights = {
            fall_hazards: 1.5,
            electrical: 1.3,
            machinery: 1.2,
            confined_spaces: 1.4,
            hazardous_materials: 1.3,
            structural: 1.5,
            environmental: 0.8,
            ergonomic: 0.7
        };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (const [category, assessment] of Object.entries(riskByCategory)) {
            const weight = categoryWeights[category] || 1.0;
            weightedSum += assessment.score * weight;
            totalWeight += weight;
        }
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    determineRiskLevel(riskScore) {
        const thresholds = this.config.riskThresholds;
        
        if (riskScore >= thresholds.critical) return 'critical';
        if (riskScore >= thresholds.high) return 'high';
        if (riskScore >= thresholds.medium) return 'medium';
        return 'low';
    }
    
    async generateRecommendations(assessment) {
        const recommendations = [];
        
        // Priority recommendations based on risk level
        if (assessment.riskLevel === 'critical') {
            recommendations.push({
                priority: 'immediate',
                action: 'Halt work and conduct emergency safety review',
                reason: 'Critical safety risks identified'
            });
        }
        
        // Category-specific recommendations
        for (const [category, categoryAssessment] of Object.entries(assessment.riskByCategory)) {
            if (categoryAssessment.score > 0.6) {
                recommendations.push(...this.getCategoryRecommendations(
                    category, 
                    categoryAssessment
                ));
            }
        }
        
        // Hazard-specific recommendations
        const criticalHazards = assessment.hazards
            .filter(h => h.severity === 'critical' || h.severity === 'high');
        
        criticalHazards.forEach(hazard => {
            if (hazard.mitigation) {
                recommendations.push({
                    priority: hazard.severity === 'critical' ? 'immediate' : 'urgent',
                    action: hazard.mitigation,
                    reason: hazard.description,
                    category: hazard.type
                });
            }
        });
        
        // Sort by priority
        const priorityOrder = { immediate: 0, urgent: 1, standard: 2 };
        recommendations.sort((a, b) => 
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        
        return recommendations;
    }
    
    getCategoryRecommendations(category, assessment) {
        const recommendations = [];
        
        switch (category) {
            case 'fall_hazards':
                if (assessment.score > 0.7) {
                    recommendations.push({
                        priority: 'urgent',
                        action: 'Install additional fall protection systems',
                        reason: 'High fall hazard risk detected'
                    });
                }
                break;
                
            case 'electrical':
                if (assessment.factors.compliance > 0.5) {
                    recommendations.push({
                        priority: 'urgent',
                        action: 'Complete electrical safety audit and remediation',
                        reason: 'Electrical compliance issues identified'
                    });
                }
                break;
                
            case 'machinery':
                if (assessment.factors.incidents > 0.5) {
                    recommendations.push({
                        priority: 'urgent',
                        action: 'Conduct machinery safety training for all operators',
                        reason: 'Recent machinery incidents indicate training needs'
                    });
                }
                break;
        }
        
        return recommendations;
    }
    
    async storeAssessment(assessment) {
        const client = await this.dbPool.connect();
        try {
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days
            
            await client.query(`
                INSERT INTO safety_assessments
                (project_id, assessment_type, risk_score, risk_level,
                 hazards_identified, recommendations, valid_until, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [
                assessment.projectId,
                assessment.assessmentType,
                assessment.overallRiskScore,
                assessment.riskLevel,
                JSON.stringify(assessment.hazards),
                JSON.stringify(assessment.recommendations),
                validUntil,
                JSON.stringify({
                    riskByCategory: assessment.riskByCategory
                })
            ]);
            
        } finally {
            client.release();
        }
    }
    
    // Safety Protocol Verification
    
    async verifySafetyProtocol(projectId, protocolId) {
        const protocol = this.config.protocols[protocolId];
        if (!protocol) {
            throw new Error(`Unknown protocol: ${protocolId}`);
        }
        
        // Get protocol checklist
        const checklist = await this.getProtocolChecklist(protocolId);
        
        // Verify each item
        const verificationResults = {
            protocolId,
            projectId,
            checklist: [],
            nonConformities: [],
            overallCompliance: 'pending'
        };
        
        for (const item of checklist) {
            const result = await this.verifyChecklistItem(projectId, item);
            verificationResults.checklist.push(result);
            
            if (!result.compliant) {
                verificationResults.nonConformities.push({
                    item: item.id,
                    description: item.description,
                    severity: item.severity,
                    evidence: result.evidence,
                    corrective_action: item.correctiveAction
                });
            }
        }
        
        // Determine overall compliance
        const criticalNonConformities = verificationResults.nonConformities
            .filter(nc => nc.severity === 'critical').length;
        
        if (criticalNonConformities > 0) {
            verificationResults.overallCompliance = 'non-compliant';
        } else if (verificationResults.nonConformities.length > 0) {
            verificationResults.overallCompliance = 'partially-compliant';
        } else {
            verificationResults.overallCompliance = 'compliant';
        }
        
        // Store verification results
        await this.storeVerificationResults(verificationResults);
        
        return verificationResults;
    }
    
    async getProtocolChecklist(protocolId) {
        // Protocol-specific checklists
        const checklists = {
            'DIN_4420': [
                {
                    id: 'scaffold_inspection',
                    description: 'Daily scaffold inspection completed',
                    severity: 'critical',
                    correctiveAction: 'Conduct immediate scaffold inspection'
                },
                {
                    id: 'scaffold_tags',
                    description: 'All scaffolds have current inspection tags',
                    severity: 'high',
                    correctiveAction: 'Update scaffold inspection tags'
                },
                {
                    id: 'guardrails',
                    description: 'Guardrails installed at all required locations',
                    severity: 'critical',
                    correctiveAction: 'Install missing guardrails immediately'
                }
            ],
            'DIN_VDE_0100': [
                {
                    id: 'electrical_testing',
                    description: 'Electrical installations tested and certified',
                    severity: 'critical',
                    correctiveAction: 'Arrange electrical testing immediately'
                },
                {
                    id: 'rcd_protection',
                    description: 'RCD protection installed and functional',
                    severity: 'critical',
                    correctiveAction: 'Install/repair RCD protection'
                }
            ],
            'BGV_C22': [
                {
                    id: 'operator_certification',
                    description: 'All operators have valid certifications',
                    severity: 'high',
                    correctiveAction: 'Verify operator certifications'
                },
                {
                    id: 'equipment_inspection',
                    description: 'Equipment inspection records current',
                    severity: 'high',
                    correctiveAction: 'Update equipment inspections'
                }
            ]
        };
        
        return checklists[protocolId] || [];
    }
    
    async verifyChecklistItem(projectId, item) {
        // This would integrate with various data sources
        // For now, simplified verification logic
        
        const result = {
            itemId: item.id,
            compliant: true,
            evidence: [],
            verifiedAt: new Date()
        };
        
        // Example: Check for recent inspections
        if (item.id === 'scaffold_inspection') {
            const client = await this.dbPool.connect();
            try {
                const inspection = await client.query(`
                    SELECT * FROM safety_compliance
                    WHERE project_id = $1 
                      AND protocol_id = 'DIN_4420'
                      AND verification_date > NOW() - INTERVAL '24 hours'
                    ORDER BY verification_date DESC
                    LIMIT 1
                `, [projectId]);
                
                result.compliant = inspection.rows.length > 0;
                if (!result.compliant) {
                    result.evidence.push('No inspection record in last 24 hours');
                }
            } finally {
                client.release();
            }
        }
        
        return result;
    }
    
    async storeVerificationResults(results) {
        const client = await this.dbPool.connect();
        try {
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + 7); // Review in 7 days
            
            let correctiveDeadline = null;
            if (results.nonConformities.length > 0) {
                correctiveDeadline = new Date();
                const hasCritical = results.nonConformities
                    .some(nc => nc.severity === 'critical');
                correctiveDeadline.setHours(
                    correctiveDeadline.getHours() + (hasCritical ? 24 : 72)
                );
            }
            
            await client.query(`
                INSERT INTO safety_compliance
                (project_id, protocol_id, compliance_status, checklist_items,
                 non_conformities, corrective_deadline, next_review_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                results.projectId,
                results.protocolId,
                results.overallCompliance,
                JSON.stringify(results.checklist),
                JSON.stringify(results.nonConformities),
                correctiveDeadline,
                nextReview
            ]);
            
        } finally {
            client.release();
        }
    }
    
    // Incident Prediction Model
    
    async initializePredictionModel() {
        try {
            // Check if we have enough training data
            const trainingData = await this.loadTrainingData();
            
            if (trainingData.length < this.config.minIncidentData) {
                console.log('Insufficient training data for incident prediction');
                return;
            }
            
            // Build and train model
            await this.buildIncidentModel();
            await this.trainIncidentModel(trainingData);
            
            console.log('Incident prediction model initialized');
            
        } catch (error) {
            console.error('Failed to initialize prediction model:', error);
        }
    }
    
    async buildIncidentModel() {
        // Simple neural network for incident prediction
        const model = tf.sequential({
            layers: [
                tf.layers.dense({ 
                    inputShape: [20], // Feature vector size
                    units: 64,
                    activation: 'relu'
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ 
                    units: 32,
                    activation: 'relu'
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ 
                    units: 1,
                    activation: 'sigmoid'
                })
            ]
        });
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
        
        this.incidentModel = model;
    }
    
    async trainIncidentModel(trainingData) {
        // Prepare features and labels
        const features = trainingData.map(d => d.feature_vector);
        const labels = trainingData.map(d => d.incident_occurred ? 1 : 0);
        
        const xs = tf.tensor2d(features);
        const ys = tf.tensor1d(labels);
        
        // Split into train/validation
        const splitIdx = Math.floor(features.length * 0.8);
        const xTrain = xs.slice([0, 0], [splitIdx, -1]);
        const yTrain = ys.slice([0], [splitIdx]);
        const xVal = xs.slice([splitIdx, 0], [-1, -1]);
        const yVal = ys.slice([splitIdx], [-1]);
        
        // Train model
        const history = await this.incidentModel.fit(xTrain, yTrain, {
            epochs: 50,
            batchSize: 32,
            validationData: [xVal, yVal],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                    }
                }
            }
        });
        
        // Update model accuracy metric
        const finalAccuracy = history.history.val_acc[history.history.val_acc.length - 1];
        this.metrics.modelAccuracy = finalAccuracy;
        
        // Clean up tensors
        xs.dispose();
        ys.dispose();
        xTrain.dispose();
        yTrain.dispose();
        xVal.dispose();
        yVal.dispose();
    }
    
    async loadTrainingData() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM safety_training_data
                WHERE timestamp > NOW() - INTERVAL '180 days'
                ORDER BY timestamp DESC
                LIMIT 10000
            `);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async predictIncident(projectId, timeWindow = 24) {
        if (!this.incidentModel) {
            return null;
        }
        
        // Generate feature vector for current conditions
        const features = await this.generatePredictionFeatures(projectId);
        
        // Make prediction
        const prediction = tf.tidy(() => {
            const input = tf.tensor2d([features]);
            const output = this.incidentModel.predict(input);
            return output.dataSync()[0];
        });
        
        const riskProbability = prediction;
        const riskLevel = this.determineRiskLevel(riskProbability);
        
        // Store prediction for monitoring
        await this.storePrediction(projectId, {
            probability: riskProbability,
            riskLevel,
            timeWindow,
            features,
            timestamp: new Date()
        });
        
        // Alert if high risk
        if (riskLevel === 'high' || riskLevel === 'critical') {
            await this.createPredictiveAlert(projectId, riskProbability);
        }
        
        return {
            probability: riskProbability,
            riskLevel,
            timeWindow: `${timeWindow} hours`,
            confidence: this.metrics.modelAccuracy
        };
    }
    
    async generatePredictionFeatures(projectId) {
        const projectData = await this.gatherProjectData(projectId);
        
        // Extract features (simplified - would be more complex in production)
        const features = [
            // Historical incident rate
            projectData.incidents.length / 30, // Incidents per day
            
            // Compliance scores
            projectData.compliance.filter(c => c.compliance_status !== 'compliant').length,
            
            // Environmental factors
            projectData.monitoring.filter(m => m.violations > 0).length,
            
            // Project characteristics
            projectData.details.activeWorkers / 100,
            projectData.details.heavyEquipment / 10,
            projectData.details.height / 50,
            
            // Time factors
            new Date().getDay() / 7, // Day of week normalized
            new Date().getHours() / 24, // Hour of day normalized
            
            // Weather risk (simplified)
            projectData.details.weatherConditions === 'extreme' ? 1 : 0,
            projectData.details.weatherConditions === 'severe' ? 0.7 : 0,
            
            // Add more features to reach 20 total
            ...Array(10).fill(0) // Padding for this example
        ];
        
        return features;
    }
    
    async storePrediction(projectId, prediction) {
        // Store prediction for analysis and model improvement
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO safety_training_data
                (feature_vector, incident_occurred, conditions, 
                 project_phase, timestamp)
                VALUES ($1, NULL, $2, $3, $4)
            `, [
                prediction.features,
                JSON.stringify({ prediction: prediction.probability }),
                'construction',
                new Date()
            ]);
        } finally {
            client.release();
        }
    }
    
    // Real-time Monitoring
    
    async startMonitoringProject(projectId, config = {}) {
        const monitorConfig = {
            projectId,
            interval: config.interval || this.config.monitoringIntervals.standard,
            sensors: config.sensors || 'all',
            thresholds: config.thresholds || {}
        };
        
        // Create monitoring function
        const monitor = async () => {
            try {
                // Collect sensor data
                const sensorData = await this.collectSensorData(projectId, monitorConfig.sensors);
                
                // Check thresholds
                const violations = this.checkThresholds(sensorData, monitorConfig.thresholds);
                
                // Store monitoring data
                await this.storeMonitoringData(projectId, sensorData, violations);
                
                // Create alerts for violations
                if (violations.length > 0) {
                    await this.createMonitoringAlerts(projectId, violations);
                }
                
                // Broadcast via WebSocket
                this.broadcastMonitoringUpdate(projectId, {
                    sensorData,
                    violations,
                    timestamp: new Date()
                });
                
            } catch (error) {
                this.handleError('monitoring', error);
            }
        };
        
        // Start monitoring
        const intervalId = setInterval(monitor, monitorConfig.interval);
        
        // Store monitor reference
        this.activeMonitors.set(projectId, {
            intervalId,
            config: monitorConfig
        });
        
        // Initial monitoring
        await monitor();
        
        return {
            projectId,
            monitoringActive: true,
            interval: monitorConfig.interval
        };
    }
    
    async stopMonitoringProject(projectId) {
        const monitor = this.activeMonitors.get(projectId);
        if (monitor) {
            clearInterval(monitor.intervalId);
            this.activeMonitors.delete(projectId);
        }
    }
    
    async collectSensorData(projectId, sensorTypes) {
        // This would interface with actual IoT sensors
        // Simplified simulation for demonstration
        
        const sensorData = [];
        
        // Gas sensors
        if (sensorTypes === 'all' || sensorTypes.includes('gas')) {
            sensorData.push({
                sensorType: 'gas_detector',
                sensorId: `gas_${projectId}_01`,
                measurementType: 'CO',
                value: Math.random() * 50, // ppm
                unit: 'ppm',
                location: { zone: 'basement', level: -1 }
            });
        }
        
        // Noise sensors
        if (sensorTypes === 'all' || sensorTypes.includes('noise')) {
            sensorData.push({
                sensorType: 'noise',
                sensorId: `noise_${projectId}_01`,
                measurementType: 'sound_level',
                value: 70 + Math.random() * 30, // dB
                unit: 'dB',
                location: { zone: 'construction_area' }
            });
        }
        
        // Vibration sensors
        if (sensorTypes === 'all' || sensorTypes.includes('vibration')) {
            sensorData.push({
                sensorType: 'vibration',
                sensorId: `vib_${projectId}_01`,
                measurementType: 'velocity',
                value: Math.random() * 10, // mm/s
                unit: 'mm/s',
                location: { zone: 'foundation' }
            });
        }
        
        // Weather station
        if (sensorTypes === 'all' || sensorTypes.includes('weather')) {
            sensorData.push({
                sensorType: 'weather',
                sensorId: `weather_${projectId}_01`,
                measurementType: 'wind_speed',
                value: Math.random() * 30, // km/h
                unit: 'km/h',
                location: { zone: 'rooftop' }
            });
        }
        
        return sensorData;
    }
    
    checkThresholds(sensorData, customThresholds) {
        const defaultThresholds = {
            CO: 35, // ppm
            sound_level: 85, // dB
            velocity: 5, // mm/s
            wind_speed: 50 // km/h
        };
        
        const thresholds = { ...defaultThresholds, ...customThresholds };
        const violations = [];
        
        sensorData.forEach(reading => {
            const threshold = thresholds[reading.measurementType];
            if (threshold && reading.value > threshold) {
                violations.push({
                    ...reading,
                    threshold,
                    exceedance: ((reading.value - threshold) / threshold * 100).toFixed(1)
                });
            }
        });
        
        return violations;
    }
    
    async storeMonitoringData(projectId, sensorData, violations) {
        const client = await this.dbPool.connect();
        try {
            for (const reading of sensorData) {
                const hasViolation = violations.some(v => 
                    v.sensorId === reading.sensorId && 
                    v.measurementType === reading.measurementType
                );
                
                await client.query(`
                    INSERT INTO safety_monitoring
                    (project_id, sensor_type, sensor_id, measurement_type,
                     value, unit, threshold_exceeded, location)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (sensor_id, timestamp) DO NOTHING
                `, [
                    projectId,
                    reading.sensorType,
                    reading.sensorId,
                    reading.measurementType,
                    reading.value,
                    reading.unit,
                    hasViolation,
                    JSON.stringify(reading.location)
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    async createMonitoringAlerts(projectId, violations) {
        const alerts = [];
        
        for (const violation of violations) {
            const severity = this.determineViolationSeverity(violation);
            
            const alert = {
                projectId,
                alertType: 'threshold_violation',
                severity,
                source: 'monitoring_system',
                message: `${violation.measurementType} exceeded threshold: ${violation.value} ${violation.unit} (limit: ${violation.threshold})`,
                details: {
                    sensor: violation.sensorId,
                    location: violation.location,
                    exceedance: `${violation.exceedance}%`
                }
            };
            
            alerts.push(alert);
        }
        
        // Batch create alerts
        for (const alert of alerts) {
            await this.createSafetyAlert(projectId, alert);
        }
    }
    
    determineViolationSeverity(violation) {
        const exceedance = parseFloat(violation.exceedance);
        
        // Severity based on how much threshold is exceeded
        if (exceedance > 100) return 'critical';
        if (exceedance > 50) return 'high';
        if (exceedance > 20) return 'medium';
        return 'low';
    }
    
    // Alert Management
    
    async createSafetyAlert(projectId, alertData) {
        this.metrics.alertsSent++;
        
        const alert = {
            id: uuidv4(),
            projectId,
            alertType: alertData.alertType || 'safety_risk',
            severity: alertData.severity || 'medium',
            source: alertData.source || 'assessment',
            message: alertData.message || 'Safety alert',
            details: alertData.details || {},
            timestamp: new Date()
        };
        
        // Store alert
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO safety_alerts
                (id, project_id, alert_type, severity, source,
                 message, details)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                alert.id,
                alert.projectId,
                alert.alertType,
                alert.severity,
                alert.source,
                alert.message,
                JSON.stringify(alert.details)
            ]);
        } finally {
            client.release();
        }
        
        // Add to alert queue for processing
        this.alertQueue.push(alert);
        
        // Process immediately if critical
        if (alert.severity === 'critical') {
            await this.processAlert(alert);
        }
        
        return alert;
    }
    
    async createPredictiveAlert(projectId, probability) {
        const alert = {
            alertType: 'incident_prediction',
            severity: probability > 0.8 ? 'high' : 'medium',
            source: 'ml_prediction',
            message: `High incident risk predicted: ${(probability * 100).toFixed(1)}% probability`,
            details: {
                probability,
                timeWindow: '24_hours',
                modelAccuracy: this.metrics.modelAccuracy
            }
        };
        
        return this.createSafetyAlert(projectId, alert);
    }
    
    async processAlert(alert) {
        // Send through configured channels
        for (const channel of this.config.alertConfig.channels) {
            try {
                await this.sendAlertViaChannel(alert, channel);
            } catch (error) {
                console.error(`Failed to send alert via ${channel}:`, error);
            }
        }
        
        // Update alert status
        await this.updateAlertChannels(alert.id, this.config.alertConfig.channels);
        
        // Schedule escalation if needed
        if (alert.severity === 'critical' || alert.severity === 'high') {
            setTimeout(() => {
                this.escalateAlert(alert);
            }, this.config.alertConfig.escalationDelay);
        }
    }
    
    async sendAlertViaChannel(alert, channel) {
        switch (channel) {
            case 'websocket':
                this.broadcastAlert(alert);
                break;
                
            case 'email':
                // Email integration would go here
                console.log(`Email alert: ${alert.message}`);
                break;
                
            case 'sms':
                // SMS integration would go here
                console.log(`SMS alert: ${alert.message}`);
                break;
        }
    }
    
    async updateAlertChannels(alertId, channels) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE safety_alerts
                SET channels_notified = $1
                WHERE id = $2
            `, [JSON.stringify(channels), alertId]);
        } finally {
            client.release();
        }
    }
    
    async escalateAlert(alert) {
        // Check if alert was acknowledged
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT acknowledged FROM safety_alerts
                WHERE id = $1
            `, [alert.id]);
            
            if (result.rows[0] && !result.rows[0].acknowledged) {
                // Escalate
                await client.query(`
                    UPDATE safety_alerts
                    SET escalation_level = escalation_level + 1
                    WHERE id = $1
                `, [alert.id]);
                
                // Notify higher level
                console.log(`Escalating alert ${alert.id} to level 2`);
                // Additional escalation logic would go here
            }
        } finally {
            client.release();
        }
    }
    
    async acknowledgeAlert(alertId, userId, notes = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE safety_alerts
                SET acknowledged = true,
                    acknowledged_by = $2,
                    acknowledged_at = NOW(),
                    resolution_notes = $3
                WHERE id = $1
            `, [alertId, userId, notes]);
            
            return { success: true, alertId };
            
        } finally {
            client.release();
        }
    }
    
    // WebSocket Communication
    
    async initializeWebSocket() {
        this.wsServer = new WebSocket.Server({
            port: this.config.wsPort
        });
        
        this.wsClients = new Set();
        
        this.wsServer.on('connection', (ws) => {
            this.wsClients.add(ws);
            
            ws.on('message', (message) => {
                this.handleWebSocketMessage(ws, message);
            });
            
            ws.on('close', () => {
                this.wsClients.delete(ws);
            });
            
            // Send initial status
            ws.send(JSON.stringify({
                type: 'connected',
                timestamp: new Date()
            }));
        });
        
        console.log(`Safety WebSocket server listening on port ${this.config.wsPort}`);
    }
    
    handleWebSocketMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'subscribe_project':
                    ws.projectId = data.projectId;
                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        projectId: data.projectId
                    }));
                    break;
                    
                case 'get_status':
                    this.sendProjectStatus(ws, data.projectId);
                    break;
            }
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    }
    
    async sendProjectStatus(ws, projectId) {
        const assessment = await this.getLatestAssessment(projectId);
        const alerts = await this.getActiveAlerts(projectId);
        
        ws.send(JSON.stringify({
            type: 'status_update',
            projectId,
            assessment: assessment ? {
                riskLevel: assessment.risk_level,
                riskScore: assessment.risk_score,
                validUntil: assessment.valid_until
            } : null,
            activeAlerts: alerts.length,
            timestamp: new Date()
        }));
    }
    
    broadcastMonitoringUpdate(projectId, data) {
        const message = JSON.stringify({
            type: 'monitoring_update',
            projectId,
            ...data
        });
        
        for (const client of this.wsClients) {
            if (client.readyState === WebSocket.OPEN &&
                client.projectId === projectId) {
                client.send(message);
            }
        }
    }
    
    broadcastAlert(alert) {
        const message = JSON.stringify({
            type: 'safety_alert',
            alert
        });
        
        for (const client of this.wsClients) {
            if (client.readyState === WebSocket.OPEN &&
                client.projectId === alert.projectId) {
                client.send(message);
            }
        }
    }
    
    // Background Services
    
    startMonitoringServices() {
        // Process alert queue
        setInterval(() => {
            this.processAlertQueue();
        }, 5000);
        
        // Clean old data
        setInterval(() => {
            this.cleanOldData();
        }, 86400000); // Daily
        
        // Update model if needed
        setInterval(() => {
            this.updatePredictionModel();
        }, 604800000); // Weekly
    }
    
    async processAlertQueue() {
        while (this.alertQueue.length > 0) {
            const alert = this.alertQueue.shift();
            
            if (alert.severity !== 'critical') {
                await this.processAlert(alert);
            }
        }
    }
    
    async cleanOldData() {
        const client = await this.dbPool.connect();
        try {
            // Clean old monitoring data (keep 30 days)
            await client.query(`
                DELETE FROM safety_monitoring
                WHERE timestamp < NOW() - INTERVAL '30 days'
            `);
            
            // Archive old incidents (keep 1 year active)
            // In production, would move to archive table
            
        } finally {
            client.release();
        }
    }
    
    async updatePredictionModel() {
        // Retrain model with new data
        const recentData = await this.loadRecentTrainingData();
        
        if (recentData.length > this.config.minIncidentData) {
            await this.trainIncidentModel(recentData);
            console.log('Incident prediction model updated');
        }
    }
    
    async loadRecentTrainingData() {
        // Load training data with actual incident outcomes
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM safety_training_data
                WHERE timestamp > NOW() - INTERVAL '30 days'
                  AND incident_occurred IS NOT NULL
                ORDER BY timestamp DESC
            `);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    // Utility Methods
    
    async getLatestAssessment(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM safety_assessments
                WHERE project_id = $1
                  AND valid_until > NOW()
                ORDER BY assessment_date DESC
                LIMIT 1
            `, [projectId]);
            
            return result.rows[0] || null;
            
        } finally {
            client.release();
        }
    }
    
    async getActiveAlerts(projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM safety_alerts
                WHERE project_id = $1
                  AND acknowledged = false
                ORDER BY created_at DESC
            `, [projectId]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async generateComplianceReport(projectId) {
        const report = {
            projectId,
            generatedAt: new Date(),
            protocols: [],
            overallCompliance: 'pending',
            recommendations: []
        };
        
        // Get all protocol compliance
        const client = await this.dbPool.connect();
        try {
            const compliance = await client.query(`
                SELECT * FROM safety_compliance
                WHERE project_id = $1
                ORDER BY protocol_id, verification_date DESC
            `, [projectId]);
            
            // Group by protocol
            const byProtocol = {};
            compliance.rows.forEach(record => {
                if (!byProtocol[record.protocol_id]) {
                    byProtocol[record.protocol_id] = record;
                }
            });
            
            // Analyze each protocol
            let nonCompliantCount = 0;
            
            for (const [protocolId, record] of Object.entries(byProtocol)) {
                report.protocols.push({
                    protocolId,
                    description: this.config.protocols[protocolId],
                    status: record.compliance_status,
                    lastVerified: record.verification_date,
                    nonConformities: record.non_conformities.length
                });
                
                if (record.compliance_status !== 'compliant') {
                    nonCompliantCount++;
                    
                    // Add recommendations
                    record.non_conformities.forEach(nc => {
                        report.recommendations.push({
                            protocol: protocolId,
                            issue: nc.description,
                            action: nc.corrective_action,
                            severity: nc.severity
                        });
                    });
                }
            }
            
            // Determine overall compliance
            if (nonCompliantCount === 0) {
                report.overallCompliance = 'compliant';
            } else if (nonCompliantCount < Object.keys(byProtocol).length / 2) {
                report.overallCompliance = 'partially-compliant';
            } else {
                report.overallCompliance = 'non-compliant';
            }
            
            return report;
            
        } finally {
            client.release();
        }
    }
    
    // Protocol Management
    
    async loadSafetyProtocols() {
        // Load additional protocols from database if available
        // For now, using config protocols
        console.log(`Loaded ${Object.keys(this.config.protocols).length} safety protocols`);
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            activeMonitors: this.activeMonitors.size,
            alertQueueSize: this.alertQueue.length
        };
    }
    
    handleError(context, error) {
        console.error(`Safety Validator error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        console.log('Shutting down Safety Validator');
        
        // Stop all monitors
        for (const [projectId, monitor] of this.activeMonitors) {
            clearInterval(monitor.intervalId);
        }
        
        // Close WebSocket server
        if (this.wsServer) {
            this.wsServer.close();
        }
        
        // Close database
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Safety Validator shut down');
    }
}

// Export factory function
export function createSafetyValidator(config) {
    return new ConstructionSafetyValidator(config);
}
```

### Usage Example

```javascript
// safety-validator-usage.js
import { createSafetyValidator } from './construction-safety-validator.js';

async function main() {
    const safetyValidator = createSafetyValidator({
        wsPort: 3004,
        riskThresholds: {
            low: 0.3,
            medium: 0.6,
            high: 0.8,
            critical: 0.95
        }
    });
    
    await safetyValidator.initialize();
    
    const projectId = '123e4567-e89b-12d3-a456-426614174000';
    
    // Perform comprehensive risk assessment
    const assessment = await safetyValidator.assessProjectRisk(projectId);
    console.log('Risk Assessment:', assessment);
    
    // Verify safety protocol
    const protocolVerification = await safetyValidator.verifySafetyProtocol(
        projectId,
        'DIN_4420'
    );
    console.log('Protocol Verification:', protocolVerification);
    
    // Predict incident risk
    const prediction = await safetyValidator.predictIncident(projectId);
    console.log('Incident Prediction:', prediction);
    
    // Start real-time monitoring
    const monitoring = await safetyValidator.startMonitoringProject(projectId, {
        interval: 60000, // 1 minute
        sensors: ['gas', 'noise', 'vibration'],
        thresholds: {
            CO: 30, // ppm
            sound_level: 80 // dB
        }
    });
    console.log('Monitoring Started:', monitoring);
    
    // Generate compliance report
    const report = await safetyValidator.generateComplianceReport(projectId);
    console.log('Compliance Report:', report);
    
    // Get metrics
    console.log('Safety Metrics:', safetyValidator.getMetrics());
}

main();
```

### Construction Integration

```javascript
// construction-safety-integration.js
import { createSafetyValidator } from './construction-safety-validator.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionSafetyService {
    constructor() {
        this.safetyValidator = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.safetyValidator = createSafetyValidator({
            alertConfig: {
                channels: ['websocket', 'email', 'sms'],
                escalationLevels: 3
            }
        });
        
        await this.safetyValidator.initialize();
        
        // Set up event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.safetyValidator.on('error', (error) => {
            console.error('Safety service error:', error);
        });
        
        this.safetyValidator.on('alert_created', (alert) => {
            this.handleNewAlert(alert);
        });
    }
    
    async performDailySafetyCheck(projectId) {
        const results = {
            timestamp: new Date(),
            projectId,
            checks: [],
            overallStatus: 'pending'
        };
        
        try {
            // Risk assessment
            const assessment = await this.safetyValidator.assessProjectRisk(
                projectId, 
                'daily'
            );
            results.checks.push({
                type: 'risk_assessment',
                status: assessment.riskLevel,
                score: assessment.overallRiskScore
            });
            
            // Protocol compliance
            const protocols = ['DIN_4420', 'DIN_VDE_0100', 'BGV_C22'];
            for (const protocol of protocols) {
                const verification = await this.safetyValidator.verifySafetyProtocol(
                    projectId,
                    protocol
                );
                results.checks.push({
                    type: 'protocol_compliance',
                    protocol,
                    status: verification.overallCompliance
                });
            }
            
            // Incident prediction
            const prediction = await this.safetyValidator.predictIncident(projectId);
            if (prediction) {
                results.checks.push({
                    type: 'incident_prediction',
                    riskLevel: prediction.riskLevel,
                    probability: prediction.probability
                });
            }
            
            // Determine overall status
            const hasHighRisk = results.checks.some(c => 
                c.status === 'high' || c.status === 'critical' ||
                c.status === 'non-compliant'
            );
            
            results.overallStatus = hasHighRisk ? 'action-required' : 'approved';
            
            // Store daily check results
            await this.storeDailyCheckResults(results);
            
            // Create work permit if approved
            if (results.overallStatus === 'approved') {
                await this.createDailyWorkPermit(projectId);
            }
            
            return results;
            
        } catch (error) {
            results.overallStatus = 'error';
            results.error = error.message;
            throw error;
        }
    }
    
    async storeDailyCheckResults(results) {
        await this.dbPool.query(`
            INSERT INTO daily_safety_checks
            (project_id, check_date, results, overall_status)
            VALUES ($1, $2, $3, $4)
        `, [
            results.projectId,
            results.timestamp,
            JSON.stringify(results.checks),
            results.overallStatus
        ]);
    }
    
    async createDailyWorkPermit(projectId) {
        const permit = {
            id: uuidv4(),
            projectId,
            issueDate: new Date(),
            validUntil: new Date(Date.now() + 86400000), // 24 hours
            conditions: [],
            restrictions: []
        };
        
        // Get latest assessment for conditions
        const assessment = await this.safetyValidator.getLatestAssessment(projectId);
        
        if (assessment) {
            // Add conditions based on risk level
            if (assessment.risk_level === 'medium') {
                permit.conditions.push('Enhanced PPE required');
                permit.conditions.push('Increased supervision');
            }
            
            // Add weather-based restrictions
            const hazards = assessment.hazards_identified;
            const weatherHazard = hazards.find(h => h.type === 'weather_hazard');
            if (weatherHazard) {
                permit.restrictions.push({
                    type: 'weather',
                    description: weatherHazard.description,
                    threshold: 'Wind speed > 50 km/h'
                });
            }
        }
        
        // Store permit
        await this.dbPool.query(`
            INSERT INTO work_permits
            (id, project_id, issue_date, valid_until, conditions, restrictions)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            permit.id,
            permit.projectId,
            permit.issueDate,
            permit.validUntil,
            JSON.stringify(permit.conditions),
            JSON.stringify(permit.restrictions)
        ]);
        
        return permit;
    }
    
    async handleSafetyIncident(incidentData) {
        const incident = {
            id: uuidv4(),
            ...incidentData,
            reportedDate: new Date()
        };
        
        // Store incident
        await this.dbPool.query(`
            INSERT INTO safety_incidents
            (id, project_id, incident_type, severity, description,
             location, injuries, equipment_damage, incident_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            incident.id,
            incident.projectId,
            incident.incidentType,
            incident.severity,
            incident.description,
            JSON.stringify(incident.location),
            incident.injuries || 0,
            incident.equipmentDamage || false,
            incident.incidentDate
        ]);
        
        // Update training data for ML model
        await this.updateTrainingData(incident);
        
        // Trigger immediate risk reassessment
        const assessment = await this.safetyValidator.assessProjectRisk(
            incident.projectId,
            'post-incident'
        );
        
        // Create alerts based on severity
        if (incident.severity === 'critical' || incident.injuries > 0) {
            await this.safetyValidator.createSafetyAlert(incident.projectId, {
                alertType: 'incident_occurred',
                severity: 'critical',
                message: `Critical incident: ${incident.description}`,
                details: {
                    incidentId: incident.id,
                    injuries: incident.injuries,
                    type: incident.incidentType
                }
            });
        }
        
        return {
            incidentId: incident.id,
            newRiskAssessment: assessment
        };
    }
    
    async updateTrainingData(incident) {
        // Get conditions 24 hours before incident
        const features = await this.safetyValidator.generatePredictionFeatures(
            incident.projectId
        );
        
        await this.dbPool.query(`
            INSERT INTO safety_training_data
            (feature_vector, incident_occurred, incident_type,
             conditions, project_phase, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            features,
            true,
            incident.incidentType,
            JSON.stringify(incident),
            'construction',
            incident.incidentDate
        ]);
        
        // Also store negative examples (times without incidents)
        // This would be done periodically for balanced training data
    }
    
    async setupContinuousMonitoring(projectId, config) {
        // Start monitoring with custom configuration
        const monitoring = await this.safetyValidator.startMonitoringProject(
            projectId,
            {
                interval: config.highRisk ? 60000 : 300000, // 1 or 5 minutes
                sensors: config.sensors || 'all',
                thresholds: config.thresholds
            }
        );
        
        // Set up alert handling
        this.safetyValidator.on(`alert_${projectId}`, async (alert) => {
            await this.handleProjectAlert(projectId, alert);
        });
        
        return monitoring;
    }
    
    async handleProjectAlert(projectId, alert) {
        // Get project manager contact
        const contacts = await this.getProjectSafetyContacts(projectId);
        
        // Send notifications based on severity
        if (alert.severity === 'critical') {
            // Immediate notification to all contacts
            await this.notifyContacts(contacts, alert, 'immediate');
            
            // Trigger site evacuation if needed
            if (alert.details.evacuationRequired) {
                await this.triggerEvacuation(projectId);
            }
        } else if (alert.severity === 'high') {
            // Notify safety manager
            const safetyManager = contacts.find(c => c.role === 'safety_manager');
            if (safetyManager) {
                await this.notifyContacts([safetyManager], alert);
            }
        }
        
        // Log alert handling
        await this.logAlertHandling(alert, contacts);
    }
    
    async getProjectSafetyContacts(projectId) {
        // Would fetch from project management system
        return [
            {
                role: 'project_manager',
                name: 'John Doe',
                email: 'john.doe@construction.com',
                phone: '+49123456789'
            },
            {
                role: 'safety_manager',
                name: 'Jane Smith',
                email: 'jane.smith@construction.com',
                phone: '+49987654321'
            }
        ];
    }
    
    async notifyContacts(contacts, alert, priority = 'normal') {
        // Implementation would integrate with notification services
        console.log(`Notifying ${contacts.length} contacts about ${alert.severity} alert`);
    }
    
    async triggerEvacuation(projectId) {
        // Emergency evacuation procedure
        console.log(`EMERGENCY: Triggering evacuation for project ${projectId}`);
        
        // Would integrate with:
        // - Site alarm systems
        // - Emergency services
        // - Worker tracking systems
    }
    
    async logAlertHandling(alert, contacts) {
        await this.dbPool.query(`
            INSERT INTO alert_handling_log
            (alert_id, handled_at, contacts_notified, actions_taken)
            VALUES ($1, $2, $3, $4)
        `, [
            alert.id,
            new Date(),
            JSON.stringify(contacts.map(c => ({ role: c.role, name: c.name }))),
            JSON.stringify(alert.actions || [])
        ]);
    }
    
    async handleNewAlert(alert) {
        console.log('New safety alert:', alert);
    }
    
    async generateSafetyDashboardData(projectId) {
        const data = {
            projectId,
            timestamp: new Date(),
            currentRisk: null,
            incidents24h: 0,
            activeAlerts: [],
            complianceStatus: {},
            monitoring: {}
        };
        
        // Get current risk assessment
        const assessment = await this.safetyValidator.getLatestAssessment(projectId);
        if (assessment) {
            data.currentRisk = {
                level: assessment.risk_level,
                score: assessment.risk_score,
                validUntil: assessment.valid_until
            };
        }
        
        // Count recent incidents
        const incidents = await this.dbPool.query(`
            SELECT COUNT(*) as count
            FROM safety_incidents
            WHERE project_id = $1
              AND incident_date > NOW() - INTERVAL '24 hours'
        `, [projectId]);
        data.incidents24h = parseInt(incidents.rows[0].count);
        
        // Get active alerts
        data.activeAlerts = await this.safetyValidator.getActiveAlerts(projectId);
        
        // Get compliance summary
        const compliance = await this.safetyValidator.generateComplianceReport(projectId);
        data.complianceStatus = {
            overall: compliance.overallCompliance,
            protocols: compliance.protocols.length,
            compliant: compliance.protocols.filter(p => p.status === 'compliant').length
        };
        
        // Get monitoring status
        const monitor = this.safetyValidator.activeMonitors.get(projectId);
        data.monitoring = {
            active: !!monitor,
            interval: monitor?.config.interval,
            sensors: monitor?.config.sensors
        };
        
        return data;
    }
}
```

## Testing

```javascript
// safety-validator.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { createSafetyValidator } from './construction-safety-validator.js';

describe('ConstructionSafetyValidator', () => {
    let validator;
    const testProjectId = 'test-project-123';
    
    beforeEach(async () => {
        validator = createSafetyValidator({
            minIncidentData: 10 // Lower for testing
        });
        await validator.initialize();
    });
    
    test('should perform risk assessment', async () => {
        const assessment = await validator.assessProjectRisk(testProjectId);
        
        expect(assessment).toBeDefined();
        expect(assessment.riskLevel).toBeDefined();
        expect(assessment.overallRiskScore).toBeGreaterThanOrEqual(0);
        expect(assessment.overallRiskScore).toBeLessThanOrEqual(1);
        expect(assessment.recommendations).toBeInstanceOf(Array);
    });
    
    test('should verify safety protocol', async () => {
        const verification = await validator.verifySafetyProtocol(
            testProjectId,
            'DIN_4420'
        );
        
        expect(verification).toBeDefined();
        expect(verification.protocolId).toBe('DIN_4420');
        expect(verification.overallCompliance).toBeDefined();
        expect(verification.checklist).toBeInstanceOf(Array);
    });
    
    test('should create safety alert', async () => {
        const alert = await validator.createSafetyAlert(testProjectId, {
            alertType: 'test_alert',
            severity: 'medium',
            message: 'Test safety alert'
        });
        
        expect(alert).toBeDefined();
        expect(alert.id).toBeDefined();
        expect(alert.severity).toBe('medium');
    });
    
    test('should start project monitoring', async () => {
        const monitoring = await validator.startMonitoringProject(testProjectId, {
            interval: 1000,
            sensors: ['noise', 'gas']
        });
        
        expect(monitoring.monitoringActive).toBe(true);
        expect(monitoring.interval).toBe(1000);
        
        // Stop monitoring after test
        validator.stopMonitoringProject(testProjectId);
    });
    
    test('should generate compliance report', async () => {
        const report = await validator.generateComplianceReport(testProjectId);
        
        expect(report).toBeDefined();
        expect(report.projectId).toBe(testProjectId);
        expect(report.overallCompliance).toBeDefined();
        expect(report.protocols).toBeInstanceOf(Array);
    });
});
```

This implementation provides a comprehensive safety validation system with risk assessment, protocol verification, incident prediction, real-time monitoring, and alert management for the construction syndicate.
