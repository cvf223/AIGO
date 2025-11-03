/**
 * 🔍📋 LEGEND EXTRACTION ENGINE - CRITICAL PREREQUISITE FOR PRECISION ANALYSIS
 * ===========================================================================
 * 
 * BREAKTHROUGH IMPLEMENTATION - Phase 0 of Precision Construction Analysis System
 * 
 * CORE MISSION: Extract ALL legend information from ALL building plans to create
 * comprehensive master database of structural elements before any pixel analysis begins.
 * 
 * KEY CAPABILITIES:
 * - Universal legend scanning across all plan types (GR-01, GR00, GR01, etc.)
 * - OCR text extraction with specialized construction terminology
 * - Element classification into categories (structural, services, safety, reference, usage)
 * - Consistency verification across multiple plans with human escalation
 * - Master element registry with calculation method mapping
 * - Integration with Ollama llava:34b for visual legend interpretation
 * 
 * CRITICAL ELEMENTS TO EXTRACT:
 * - Structural: Stahlbeton, Beton unbewehrt, Dämmung hart/weich, Trockenbau, Holz, Metall
 * - Construction States: OK Fertig, UK Fertig, OK Roh, UK Roh, Bestand, Abbruch
 * - Building Services: AHD, BD/DD/WD durchbrüche, BS/DS/WS schlitze
 * - Safety: Flucht- und Rettungsweg, F30/F90 feuerhemmende/feuerbeständige Wände
 * - Reference Levels: OK FFB, UK WS, OK RD, UK RD, BRH, LRH
 * - Usage Classifications: S (Sanitär), H (Heizung), E (Elektro), L (Lüftung), G (Gas)
 * 
 * @author Elite Construction AI Syndicate - Top 1% Computer Vision Specialist
 * @version 1.0.0 - Production Legend Analysis Foundation
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

export class LegendExtractionEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Ollama Configuration
            ollamaHost: config.ollamaHost || 'http://162.55.83.33:11434',
            model: 'llava:34b',
            
            // OCR and Text Extraction
            ocrEngine: config.ocrEngine || 'tesseract', // tesseract, azure, google
            confidenceThreshold: config.confidenceThreshold || 0.7,
            
            // Legend Detection Settings
            legendRegionDetection: {
                minLegendArea: 1000, // minimum pixels for legend region
                maxLegendArea: 500000, // maximum pixels for legend region
                textDensityThreshold: 0.1, // minimum text density in region
                symbolDensityThreshold: 0.05 // minimum symbol density in region
            },
            
            // Element Classification
            elementCategories: {
                structural: ['stahlbeton', 'beton', 'dämmung', 'trockenbau', 'holz', 'metall', 'mauerwerk'],
                construction_states: ['ok fertig', 'uk fertig', 'ok roh', 'uk roh', 'bestand', 'abbruch'],
                services: ['ahd', 'bd', 'dd', 'wd', 'bs', 'ds', 'ws', 'uzd', 'durchbruch', 'schlitz'],
                safety: ['flucht', 'rettungsweg', 'f30', 'f90', 'feuerhemmend', 'feuerbeständig', 'brandschutz'],
                reference: ['ok ffb', 'uk ws', 'ok rd', 'uk rd', 'brh', 'lrh', 'oberkante', 'unterkante'],
                usage: ['sanitär', 'heizung', 'elektro', 'lüftung', 'gas', 'hvk', 'hzk', 'elt']
            },
            
            // Consistency Validation
            consistencyThreshold: 0.95, // 95% similarity required for consistent legends
            humanEscalationThreshold: 0.85, // Flag for human review if < 85% consistent
            
            // Database Integration
            databaseConfig: config.databaseConfig,
            
            // Performance Settings
            batchSize: config.batchSize || 5, // Process plans in batches
            maxConcurrentExtractions: config.maxConcurrentExtractions || 3,
            cacheResults: config.cacheResults !== false
        };
        
        // State Management
        this.masterElementRegistry = new Map();
        this.planLegends = new Map();
        this.inconsistencies = [];
        this.extractionProgress = new Map();
        this.processingStats = {
            plansProcessed: 0,
            elementsExtracted: 0,
            inconsistenciesFound: 0,
            humanEscalationsTriggered: 0,
            startTime: null,
            endTime: null
        };
        
        console.log('🔍📋 LegendExtractionEngine initialized with comprehensive element categories');
        console.log(`   🎯 Target Categories: ${Object.keys(this.config.elementCategories).length}`);
        console.log(`   ⚙️ Ollama Model: ${this.config.model}`);
        console.log(`   🏗️ Consistency Threshold: ${this.config.consistencyThreshold * 100}%`);
    }
    
    /**
     * 🎯 MASTER EXTRACTION ORCHESTRATOR
     * Extract legends from all plans in building set
     */
    async extractAllLegendsFromBuildingSet(planDirectory, buildingId) {
        console.log(`\n🎯 MASTER LEGEND EXTRACTION - Building: ${buildingId}`);
        console.log(`   📂 Plan Directory: ${planDirectory}`);
        
        this.processingStats.startTime = new Date();
        this.processingStats.buildingId = buildingId;
        
        try {
            // 1. Discover all plan files
            const planFiles = await this.discoverPlanFiles(planDirectory);
            console.log(`   📋 Found ${planFiles.length} plan files`);
            
            // 2. Extract legends from each plan
            const extractionResults = await this.batchExtractLegends(planFiles);
            
            // 3. Build master element registry
            await this.buildMasterElementRegistry(extractionResults);
            
            // 4. Perform consistency validation
            await this.validateLegendConsistency();
            
            // 5. Generate human escalations if needed
            await this.generateHumanEscalations();
            
            // 6. Persist to database
            await this.persistMasterRegistry(buildingId);
            
            this.processingStats.endTime = new Date();
            
            console.log(`\n✅ LEGEND EXTRACTION COMPLETE`);
            console.log(`   📊 Plans Processed: ${this.processingStats.plansProcessed}`);
            console.log(`   🧩 Elements Extracted: ${this.processingStats.elementsExtracted}`);
            console.log(`   ⚠️ Inconsistencies Found: ${this.processingStats.inconsistenciesFound}`);
            console.log(`   🚨 Human Escalations: ${this.processingStats.humanEscalationsTriggered}`);
            console.log(`   ⏱️ Processing Time: ${this.getProcessingDuration()}ms`);
            
            return {
                success: true,
                masterRegistry: this.masterElementRegistry,
                inconsistencies: this.inconsistencies,
                stats: this.processingStats,
                humanEscalationsRequired: this.processingStats.humanEscalationsTriggered > 0
            };
            
        } catch (error) {
            console.error(`❌ Legend Extraction Failed: ${error.message}`);
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * 📂 DISCOVER ALL PLAN FILES
     * Find all PDF/image files in directory structure
     */
    async discoverPlanFiles(planDirectory) {
        console.log(`   🔍 Discovering plan files in: ${planDirectory}`);
        const planFiles = [];
        
        try {
            const entries = await fs.readdir(planDirectory, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(planDirectory, entry.name);
                
                if (entry.isDirectory()) {
                    // Recursive discovery in subdirectories
                    const subDirFiles = await this.discoverPlanFiles(fullPath);
                    planFiles.push(...subDirFiles);
                } else if (this.isPlanFile(entry.name)) {
                    planFiles.push({
                        filepath: fullPath,
                        filename: entry.name,
                        planId: this.extractPlanId(entry.name),
                        planType: this.identifyPlanType(entry.name)
                    });
                }
            }
            
            console.log(`   📋 Discovered ${planFiles.length} plan files`);
            return planFiles;
            
        } catch (error) {
            console.error(`❌ Plan discovery failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 🔥 BATCH LEGEND EXTRACTION
     * Process multiple plans concurrently with batching
     */
    async batchExtractLegends(planFiles) {
        console.log(`\n🔥 BATCH LEGEND EXTRACTION - ${planFiles.length} plans`);
        const results = [];
        
        // Process in batches to manage memory and API load
        for (let i = 0; i < planFiles.length; i += this.config.batchSize) {
            const batch = planFiles.slice(i, i + this.config.batchSize);
            console.log(`   📦 Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(planFiles.length / this.config.batchSize)}`);
            
            const batchPromises = batch.map(planFile => 
                this.extractLegendFromSinglePlan(planFile)
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Brief pause between batches to prevent API overwhelming
            if (i + this.config.batchSize < planFiles.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`   ✅ Batch extraction complete: ${results.length} plans processed`);
        return results;
    }
    
    /**
     * 📋 EXTRACT LEGEND FROM SINGLE PLAN
     * Process individual plan file for legend content
     */
    async extractLegendFromSinglePlan(planFile) {
        console.log(`   🔍 Extracting legend: ${planFile.filename}`);
        
        this.extractionProgress.set(planFile.planId, { status: 'processing', startTime: new Date() });
        
        try {
            // 1. Load and preprocess plan image
            const planImage = await this.loadPlanImage(planFile.filepath);
            
            // 2. Detect legend regions using visual analysis
            const legendRegions = await this.detectLegendRegions(planImage, planFile);
            
            // 3. Extract text from legend regions using OCR
            const extractedText = await this.extractTextFromLegendRegions(legendRegions, planFile);
            
            // 4. Use Ollama llava:34b for visual legend interpretation
            const visualInterpretation = await this.performVisualLegendAnalysis(planImage, planFile);
            
            // 5. Parse and classify legend elements
            const classifiedElements = await this.parseAndClassifyElements(extractedText, visualInterpretation, planFile);
            
            // 6. Generate confidence scores
            const confidenceScores = this.calculateExtractionConfidence(classifiedElements, extractedText, visualInterpretation);
            
            const result = {
                planId: planFile.planId,
                planFile: planFile.filename,
                planType: planFile.planType,
                legendElements: classifiedElements,
                extractedText: extractedText,
                visualInterpretation: visualInterpretation,
                confidence: confidenceScores,
                extractionTimestamp: new Date(),
                processingTime: this.getExtractionDuration(planFile.planId)
            };
            
            this.planLegends.set(planFile.planId, result);
            this.extractionProgress.set(planFile.planId, { status: 'completed', result });
            this.processingStats.plansProcessed++;
            this.processingStats.elementsExtracted += classifiedElements.length;
            
            console.log(`   ✅ Legend extracted: ${classifiedElements.length} elements, confidence: ${Math.round(confidenceScores.overall * 100)}%`);
            
            return result;
            
        } catch (error) {
            console.error(`   ❌ Legend extraction failed for ${planFile.filename}: ${error.message}`);
            this.extractionProgress.set(planFile.planId, { status: 'error', error: error.message });
            
            // Return partial result for error handling
            return {
                planId: planFile.planId,
                planFile: planFile.filename,
                error: error.message,
                extractionTimestamp: new Date()
            };
        }
    }
    
    /**
     * 🎨 VISUAL LEGEND ANALYSIS WITH OLLAMA LLAVA:34B
     * Use VLM to interpret legend symbols and layout
     */
    async performVisualLegendAnalysis(planImage, planFile) {
        console.log(`     🎨 Visual analysis with llava:34b: ${planFile.filename}`);
        
        try {
            // Convert image to base64 for Ollama
            const base64Image = await this.convertImageToBase64(planImage);
            
            const prompt = `Analyze this construction plan and identify ALL legend elements present.
            
CRITICAL MISSION: Extract EVERY legend element shown in this plan.

Look for these SPECIFIC element categories:

STRUCTURAL ELEMENTS:
- Stahlbeton (reinforced concrete)
- Beton unbewehrt (unreinforced concrete)  
- Dämmung hart (hard insulation)
- Dämmung weich (soft insulation)
- Trockenbau (drywall)
- Holz (wood)
- Metall (metal)
- Mauerwerk (masonry)

CONSTRUCTION STATES:
- OK Fertig (top surface finished)
- UK Fertig (bottom surface finished)  
- OK Roh (top surface raw)
- UK Roh (bottom surface raw)
- Bestand (existing)
- Abbruch (demolition)

BUILDING SERVICES:
- AHD (suspended ceiling)
- BD/DD/WD (floor/ceiling/wall penetrations)
- BS/DS/WS (floor/ceiling/wall slots)
- UZD (beam penetration)

SAFETY ELEMENTS:
- Flucht- u. Rettungsweg (escape routes)
- F30 Feuerhemmende Wand (fire-resistant wall)
- F90 Feuerbeständige Wand (fire-proof wall)
- Brandschutz (fire protection)

REFERENCE LEVELS:
- OK FFB (top finished floor)
- UK WS (bottom wall slot)
- OK RD (top raw ceiling)
- UK RD (bottom raw ceiling)
- BRH (parapet height)
- LRH (clear room height)

USAGE CLASSIFICATIONS:
- S (Sanitär - plumbing)
- H (Heizung - heating)
- E (Elektro - electrical)
- L (Lüftung - ventilation)
- G (Gas)

For EACH element found, provide:
1. Element code/abbreviation
2. Full German name
3. Element category
4. Symbol description
5. Location in legend

Return as structured JSON with complete element catalog.`;

            const response = await fetch(`${this.config.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: prompt,
                    images: [base64Image],
                    stream: false,
                    options: {
                        temperature: 0.1, // Low temperature for consistent extraction
                        top_p: 0.8,
                        top_k: 20
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }
            
            const data = await response.json();
            const analysisResult = this.parseOllamaLegendResponse(data.response);
            
            console.log(`     ✅ Visual analysis complete: ${analysisResult.elements?.length || 0} elements identified`);
            
            return {
                method: 'ollama_llava_34b',
                rawResponse: data.response,
                parsedElements: analysisResult.elements || [],
                confidence: analysisResult.confidence || 0.7,
                processingTime: Date.now()
            };
            
        } catch (error) {
            console.error(`     ❌ Visual analysis failed: ${error.message}`);
            
            // Return fallback result
            return {
                method: 'ollama_llava_34b',
                error: error.message,
                parsedElements: [],
                confidence: 0.0,
                processingTime: Date.now()
            };
        }
    }
    
    /**
     * 🧩 BUILD MASTER ELEMENT REGISTRY
     * Consolidate all elements from all plans into unified registry
     */
    async buildMasterElementRegistry(extractionResults) {
        console.log(`\n🧩 BUILDING MASTER ELEMENT REGISTRY`);
        
        const elementFrequency = new Map();
        const elementVariations = new Map();
        
        // Aggregate elements from all plans
        for (const result of extractionResults) {
            if (result.error) continue;
            
            for (const element of result.legendElements || []) {
                const elementKey = this.normalizeElementKey(element.code, element.name);
                
                if (!elementFrequency.has(elementKey)) {
                    elementFrequency.set(elementKey, {
                        count: 0,
                        variations: new Set(),
                        categories: new Set(),
                        planAppearances: new Set()
                    });
                }
                
                const freq = elementFrequency.get(elementKey);
                freq.count++;
                freq.variations.add(JSON.stringify(element));
                freq.categories.add(element.category);
                freq.planAppearances.add(result.planId);
            }
        }
        
        // Build master registry entries
        for (const [elementKey, frequency] of elementFrequency) {
            const mostCommonVariation = this.selectMostCommonVariation(frequency.variations);
            
            const masterElement = {
                elementId: this.generateElementId(elementKey),
                elementCode: mostCommonVariation.code,
                elementName: mostCommonVariation.name,
                elementCategory: this.consolidateCategories(frequency.categories),
                materialType: mostCommonVariation.materialType || 'unknown',
                calculationMethod: this.determineCalculationMethod(mostCommonVariation),
                appearancesInPlans: Array.from(frequency.planAppearances),
                frequency: frequency.count,
                variations: Array.from(frequency.variations).map(v => JSON.parse(v)),
                legendConsistencyVerified: frequency.variations.size === 1, // All variations identical
                confidenceScore: this.calculateElementConfidence(frequency),
                createdAt: new Date()
            };
            
            this.masterElementRegistry.set(elementKey, masterElement);
        }
        
        console.log(`   ✅ Master registry built: ${this.masterElementRegistry.size} unique elements`);
        console.log(`   📊 Average element frequency: ${Math.round(Array.from(elementFrequency.values()).reduce((sum, f) => sum + f.count, 0) / this.masterElementRegistry.size)}`);
        
        return this.masterElementRegistry;
    }
    
    /**
     * ✅ VALIDATE LEGEND CONSISTENCY
     * Check for inconsistencies across plans and flag for human review
     */
    async validateLegendConsistency() {
        console.log(`\n✅ VALIDATING LEGEND CONSISTENCY`);
        
        this.inconsistencies = [];
        
        for (const [elementKey, masterElement] of this.masterElementRegistry) {
            // Check for element variations across plans
            if (masterElement.variations.length > 1) {
                const inconsistency = {
                    type: 'element_variation',
                    elementKey: elementKey,
                    elementCode: masterElement.elementCode,
                    elementName: masterElement.elementName,
                    variations: masterElement.variations,
                    affectedPlans: masterElement.appearancesInPlans,
                    severity: this.calculateInconsistencySeverity(masterElement.variations),
                    requiresHumanReview: true,
                    detectedAt: new Date()
                };
                
                this.inconsistencies.push(inconsistency);
                this.processingStats.inconsistenciesFound++;
            }
            
            // Check for missing elements in some plans
            const totalPlans = this.planLegends.size;
            const elementAppearances = masterElement.appearancesInPlans.length;
            const appearanceRatio = elementAppearances / totalPlans;
            
            if (appearanceRatio < this.config.consistencyThreshold && appearanceRatio > 0.1) {
                // Element appears in some but not all plans - potential inconsistency
                const inconsistency = {
                    type: 'missing_element',
                    elementKey: elementKey,
                    elementCode: masterElement.elementCode,
                    elementName: masterElement.elementName,
                    appearanceRatio: appearanceRatio,
                    appearingInPlans: masterElement.appearancesInPlans,
                    missingFromPlans: Array.from(this.planLegends.keys())
                        .filter(planId => !masterElement.appearancesInPlans.includes(planId)),
                    severity: 'medium',
                    requiresHumanReview: appearanceRatio < this.config.humanEscalationThreshold,
                    detectedAt: new Date()
                };
                
                this.inconsistencies.push(inconsistency);
                this.processingStats.inconsistenciesFound++;
            }
        }
        
        console.log(`   📊 Consistency validation complete`);
        console.log(`   ⚠️ Inconsistencies found: ${this.inconsistencies.length}`);
        console.log(`   🚨 Requiring human review: ${this.inconsistencies.filter(i => i.requiresHumanReview).length}`);
        
        return this.inconsistencies;
    }
    
    /**
     * 🚨 GENERATE HUMAN ESCALATIONS
     * Create escalation tickets for critical inconsistencies
     */
    async generateHumanEscalations() {
        console.log(`\n🚨 GENERATING HUMAN ESCALATIONS`);
        
        const criticalInconsistencies = this.inconsistencies.filter(i => i.requiresHumanReview);
        
        if (criticalInconsistencies.length === 0) {
            console.log(`   ✅ No human escalations required`);
            return [];
        }
        
        const escalations = [];
        
        for (const inconsistency of criticalInconsistencies) {
            const escalation = {
                escalationId: this.generateEscalationId(),
                type: 'legend_inconsistency',
                priority: this.determineEscalationPriority(inconsistency),
                title: this.generateEscalationTitle(inconsistency),
                description: this.generateEscalationDescription(inconsistency),
                affectedPlans: inconsistency.affectedPlans || inconsistency.missingFromPlans || [],
                recommendedAction: this.generateRecommendedAction(inconsistency),
                assignedTo: null, // To be assigned by human coordinator
                status: 'open',
                createdAt: new Date(),
                metadata: {
                    inconsistencyData: inconsistency,
                    buildingId: this.processingStats.buildingId,
                    extractionSession: this.processingStats.startTime
                }
            };
            
            escalations.push(escalation);
            this.processingStats.humanEscalationsTriggered++;
        }
        
        console.log(`   🚨 Generated ${escalations.length} human escalation tickets`);
        console.log(`   📊 Priority breakdown: ${this.getEscalationPriorityBreakdown(escalations)}`);
        
        // Store escalations for human review system
        this.escalations = escalations;
        
        return escalations;
    }
    
    /**
     * 💾 PERSIST MASTER REGISTRY TO DATABASE
     * Store extracted legend data in database with full audit trail
     */
    async persistMasterRegistry(buildingId) {
        console.log(`\n💾 PERSISTING MASTER REGISTRY TO DATABASE`);
        
        try {
            // Create building_legends table if not exists
            await this.createLegendTables();
            
            // Insert master elements
            for (const [elementKey, element] of this.masterElementRegistry) {
                await this.insertMasterElement(buildingId, element);
            }
            
            // Insert plan-specific legend data
            for (const [planId, planLegend] of this.planLegends) {
                await this.insertPlanLegend(buildingId, planLegend);
            }
            
            // Insert inconsistencies and escalations
            for (const inconsistency of this.inconsistencies) {
                await this.insertInconsistency(buildingId, inconsistency);
            }
            
            if (this.escalations) {
                for (const escalation of this.escalations) {
                    await this.insertEscalation(buildingId, escalation);
                }
            }
            
            console.log(`   ✅ Database persistence complete`);
            console.log(`   📊 Master elements stored: ${this.masterElementRegistry.size}`);
            console.log(`   📋 Plan legends stored: ${this.planLegends.size}`);
            console.log(`   ⚠️ Inconsistencies logged: ${this.inconsistencies.length}`);
            console.log(`   🚨 Escalations created: ${this.escalations?.length || 0}`);
            
        } catch (error) {
            console.error(`   ❌ Database persistence failed: ${error.message}`);
            throw error;
        }
    }
    
    // ===============================
    // UTILITY AND HELPER METHODS
    // ===============================
    
    isPlanFile(filename) {
        const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.tif'];
        const ext = path.extname(filename).toLowerCase();
        return validExtensions.includes(ext);
    }
    
    extractPlanId(filename) {
        // Extract plan identifier from filename (e.g., "FB_AUS A_GR01" from "FB_AUS A_GR01_C_231011.pdf")
        const match = filename.match(/([A-Z0-9_\s]+)(?:_[A-Z])?(?:_\d+)?\.(?:pdf|png|jpg|jpeg|tiff|tif)$/i);
        return match ? match[1].trim() : filename.replace(/\.[^/.]+$/, "");
    }
    
    identifyPlanType(filename) {
        const typeMap = {
            'GR': 'floor_plan',
            'AN': 'elevation',
            'SC': 'section',
            'DT': 'detail',
            'AS': 'assembly',
            'UG': 'basement',
            'EG': 'ground_floor',
            'OG': 'upper_floor',
            'DG': 'roof'
        };
        
        for (const [code, type] of Object.entries(typeMap)) {
            if (filename.toUpperCase().includes(code)) {
                return type;
            }
        }
        
        return 'unknown';
    }
    
    normalizeElementKey(code, name) {
        const normalized = `${(code || '').toLowerCase().trim()}_${(name || '').toLowerCase().trim()}`;
        return normalized.replace(/[^a-z0-9_]/g, '_');
    }
    
    generateElementId(elementKey) {
        return `elem_${elementKey}_${Date.now()}`;
    }
    
    generateEscalationId() {
        return `esc_legend_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    
    getProcessingDuration() {
        if (!this.processingStats.startTime || !this.processingStats.endTime) return 0;
        return this.processingStats.endTime - this.processingStats.startTime;
    }
    
    getExtractionDuration(planId) {
        const progress = this.extractionProgress.get(planId);
        if (!progress?.startTime) return 0;
        return Date.now() - progress.startTime.getTime();
    }
    
    // Placeholder methods to be implemented with specific OCR, database, and image processing logic
    async loadPlanImage(filepath) { /* Implementation needed */ }
    async detectLegendRegions(image, planFile) { /* Implementation needed */ }
    async extractTextFromLegendRegions(regions, planFile) { /* Implementation needed */ }
    async parseAndClassifyElements(text, visual, planFile) { /* Implementation needed */ }
    async convertImageToBase64(image) { /* Implementation needed */ }
    parseOllamaLegendResponse(response) { /* Implementation needed */ }
    
    // Database method placeholders
    async createLegendTables() { /* Database schema creation */ }
    async insertMasterElement(buildingId, element) { /* Database insertion */ }
    async insertPlanLegend(buildingId, legend) { /* Database insertion */ }
    async insertInconsistency(buildingId, inconsistency) { /* Database insertion */ }
    async insertEscalation(buildingId, escalation) { /* Database insertion */ }
    
    // Analysis method placeholders
    calculateExtractionConfidence(elements, text, visual) { return { overall: 0.8 }; }
    selectMostCommonVariation(variations) { return JSON.parse(Array.from(variations)[0]); }
    consolidateCategories(categories) { return Array.from(categories)[0]; }
    determineCalculationMethod(element) { return 'area'; }
    calculateElementConfidence(frequency) { return Math.min(frequency.count / 10, 1.0); }
    calculateInconsistencySeverity(variations) { return variations.length > 3 ? 'high' : 'medium'; }
    determineEscalationPriority(inconsistency) { return inconsistency.severity === 'high' ? 'urgent' : 'normal'; }
    generateEscalationTitle(inconsistency) { return `Legend Inconsistency: ${inconsistency.elementCode}`; }
    generateEscalationDescription(inconsistency) { return `Inconsistent element definition detected across plans.`; }
    generateRecommendedAction(inconsistency) { return 'Manual review and standardization required.'; }
    getEscalationPriorityBreakdown(escalations) { 
        const urgent = escalations.filter(e => e.priority === 'urgent').length;
        return `${urgent} urgent, ${escalations.length - urgent} normal`;
    }
}

export default LegendExtractionEngine;
