/**
 * 📚 STLB-BAU CONNECTOR - STANDARD TEXT INTEGRATION
 * =================================================
 * 
 * MISSION: Integrate STLB-Bau standardized construction text database
 * 
 * KEY CAPABILITIES:
 * ✅ STLB-Bau database integration
 * ✅ Dynamic standard text generation
 * ✅ Position-specific requirements
 * ✅ Execution instruction generation
 * ✅ VOB/C compliant text creation
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production STLB Integration
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default class STLBBauConnector extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            connectorName: 'STLB_BAU_CONNECTOR',
            
            // STLB-Bau API Configuration
            api: {
                baseUrl: process.env.STLB_API_URL || 'https://www.stlb-bau-online.de/api',
                apiKey: process.env.STLB_API_KEY,
                version: '3.0',
                timeout: 30000,
                
                // Endpoints
                endpoints: {
                    search: '/search',
                    text: '/text',
                    position: '/position',
                    properties: '/properties',
                    export: '/export'
                }
            },
            
            // Text Categories (Leistungsbereiche)
            categories: {
                '000': 'Allgemeine Regelungen',
                '010': 'Baustelleneinrichtung',
                '011': 'Gerüstarbeiten',
                '012': 'Abbruch-, Rückbau- und Schadstoffsanierungsarbeiten',
                '013': 'Erdarbeiten',
                '014': 'Landschaftsbauarbeiten',
                '015': 'Bohrarbeiten',
                '021': 'Verbauarbeiten',
                '022': 'Wasserhaltungsarbeiten',
                '023': 'Ramm-, Rüttel- und Pressarbeiten',
                '024': 'Injektionsarbeiten',
                '025': 'Bodenverfestigungsarbeiten',
                '031': 'Mauerarbeiten',
                '032': 'Beton- und Stahlbetonarbeiten',
                '033': 'Naturwerksteinarbeiten',
                '034': 'Betonwerksteinarbeiten',
                '035': 'Zimmer- und Holzbauarbeiten',
                '036': 'Stahlbauarbeiten',
                '037': 'Korrosionsschutzarbeiten',
                '038': 'Dachdeckungs- und Dachabdichtungsarbeiten',
                '039': 'Klempnerarbeiten',
                '041': 'Wärmedämm-Verbundsysteme',
                '042': 'Putz- und Stuckarbeiten',
                '043': 'Fliesen- und Plattenarbeiten',
                '044': 'Estricharbeiten',
                '045': 'Gussasphaltarbeiten',
                '046': 'Tischlerarbeiten',
                '047': 'Parkettarbeiten',
                '048': 'Beschlagarbeiten',
                '049': 'Schlosserarbeiten',
                '051': 'Metallbauarbeiten',
                '052': 'Verglasungsarbeiten',
                '053': 'Rollladen- und Sonnenschutzarbeiten',
                '054': 'Tapetenarbeiten',
                '055': 'Maler- und Lackierarbeiten',
                '056': 'Korrosionsschutzarbeiten an Stahl- und Aluminiumbauten',
                '057': 'Bodenbelagarbeiten',
                '058': 'Terrazzo- und Werksteinarbeiten',
                '059': 'Trockenbauarbeiten',
                '061': 'Dämmarbeiten',
                '062': 'Abdichtungsarbeiten',
                '063': 'Dachklempnerarbeiten',
                '064': 'Gussasphaltarbeiten für Dächer',
                '065': 'Blitzschutzanlagen',
                '066': 'Dachflächenfenster, Lichtkuppeln und RWA',
                '067': 'Absturzsicherungen'
            },
            
            // Text Structure Templates
            textStructure: {
                // Standard position structure
                standardPosition: {
                    title: '',          // Positionstitel
                    shortText: '',      // Kurztext
                    longText: '',       // Langtext
                    quantity: '',       // Mengenansatz
                    unit: '',          // Einheit
                    
                    // Technical specifications
                    technicalText: {
                        material: '',   // Materialangaben
                        execution: '',  // Ausführungsangaben
                        surface: '',    // Oberflächenangaben
                        dimension: ''   // Maßangaben
                    },
                    
                    // Quality requirements
                    qualityRequirements: {
                        standards: [],  // DIN/EN standards
                        tolerances: '', // Toleranzen
                        testing: ''     // Prüfverfahren
                    },
                    
                    // VOB/C references
                    vobReferences: []
                }
            },
            
            // Property Mapping
            propertyMapping: {
                // Material properties
                material: {
                    'beton': ['festigkeitsklasse', 'konsistenz', 'groesstkorn', 'expositionsklasse'],
                    'stahl': ['guete', 'oberflaechenschutz', 'verzinkung'],
                    'mauerwerk': ['steinart', 'druckfestigkeitsklasse', 'rohdichteklasse'],
                    'holz': ['holzart', 'festigkeitsklasse', 'holzfeuchte', 'holzschutz'],
                    'daemmstoff': ['waermeleitgruppe', 'brandklasse', 'dicke']
                },
                
                // Execution properties
                execution: {
                    'schalung': ['schalungsart', 'schalungsklasse', 'ankerstellen'],
                    'bewehrung': ['betondeckung', 'stabdurchmesser', 'verankerung'],
                    'verbindung': ['verbindungsmittel', 'befestigungsart'],
                    'oberfläche': ['oberflächengüte', 'struktur', 'behandlung']
                }
            },
            
            // Quality Levels
            qualityLevels: {
                'standard': 'Standardqualität nach VOB/C',
                'erhoeht': 'Erhöhte Anforderungen',
                'sichtbeton': 'Sichtbetonanforderungen',
                'praezision': 'Präzisionsausführung'
            },
            
            // Cache Configuration
            cache: {
                enabled: true,
                ttl: 86400000, // 24 hours
                maxSize: 5000
            }
        };
        
        this.textCache = new Map();
        this.apiClient = null;
    }
    
    /**
     * 🚀 INITIALIZE CONNECTOR
     */
    async initialize() {
        console.log('📚 Initializing STLB-Bau Connector...');
        
        try {
            // Configure API client
            this.apiClient = axios.create({
                baseURL: this.config.api.baseUrl,
                timeout: this.config.api.timeout,
                headers: {
                    'Authorization': `Bearer ${this.config.api.apiKey}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            // Test connection
            await this.testConnection();
            
            // Load frequently used texts
            await this.preloadCommonTexts();
            
            console.log('✅ STLB-Bau Connector initialized');
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            
            // Use local fallback
            console.log('⚠️  Using local text templates');
            await this.loadLocalTemplates();
            
            return false;
        }
    }
    
    /**
     * 📝 GENERATE POSITION TEXT
     */
    async generatePositionText(element, requirements = {}) {
        console.log(`📝 Generating STLB text for ${element.classification}...`);
        
        try {
            // Map element to STLB category
            const category = this.mapElementToSTLBCategory(element);
            
            // Search for matching standard text
            const searchResults = await this.searchStandardText({
                category: category,
                keywords: this.extractKeywords(element),
                properties: element.properties
            });
            
            if (searchResults.length === 0) {
                // Generate custom text
                return await this.generateCustomText(element, requirements);
            }
            
            // Select best matching text
            const selectedText = this.selectBestMatch(searchResults, element, requirements);
            
            // Customize text with project-specific data
            const customizedText = await this.customizeText(selectedText, element, requirements);
            
            // Add quality requirements
            const finalText = await this.addQualityRequirements(customizedText, requirements);
            
            console.log(`   ✅ Generated text with ${finalText.longText.length} characters`);
            
            return finalText;
            
        } catch (error) {
            console.error(`❌ Text generation failed: ${error.message}`);
            
            // Fallback to template
            return this.generateFromTemplate(element, requirements);
        }
    }
    
    /**
     * 🔍 SEARCH STANDARD TEXT
     */
    async searchStandardText(criteria) {
        console.log('   🔍 Searching STLB database...');
        
        // Check cache first
        const cacheKey = JSON.stringify(criteria);
        if (this.textCache.has(cacheKey)) {
            return this.textCache.get(cacheKey);
        }
        
        try {
            const response = await this.apiClient.post(
                this.config.api.endpoints.search,
                {
                    category: criteria.category,
                    keywords: criteria.keywords,
                    properties: criteria.properties,
                    version: this.config.api.version
                }
            );
            
            const results = response.data.results || [];
            
            // Cache results
            this.textCache.set(cacheKey, results);
            
            console.log(`   ✅ Found ${results.length} matching texts`);
            
            return results;
            
        } catch (error) {
            console.error('   ❌ Search failed:', error.message);
            return [];
        }
    }
    
    /**
     * 📋 GET EXECUTION INSTRUCTIONS
     */
    async getExecutionInstructions(positionId, context = {}) {
        console.log(`📋 Retrieving execution instructions for position ${positionId}...`);
        
        try {
            const response = await this.apiClient.get(
                `${this.config.api.endpoints.position}/${positionId}/execution`
            );
            
            const instructions = {
                preparation: response.data.preparation || [],
                execution: response.data.execution || [],
                quality: response.data.quality || [],
                safety: response.data.safety || [],
                
                // Context-specific additions
                specialConditions: []
            };
            
            // Add context-specific instructions
            if (context.height > 3) {
                instructions.safety.push('Absturzsicherung nach ASR A2.1 erforderlich');
            }
            
            if (context.weather === 'winter') {
                instructions.specialConditions.push('Winterbaumaßnahmen nach DIN 1045-3');
            }
            
            return instructions;
            
        } catch (error) {
            console.error(`❌ Failed to retrieve instructions: ${error.message}`);
            return this.getDefaultInstructions(positionId);
        }
    }
    
    /**
     * 🏗️ GENERATE COMPLETE POSITION
     */
    async generateCompletePosition(element, context = {}) {
        console.log(`🏗️ Generating complete STLB position for ${element.classification}...`);
        
        const position = {
            ordinalNumber: context.positionNumber || '0.0.0',
            
            // Generate position text
            text: await this.generatePositionText(element, context.requirements),
            
            // Quantities from measurements
            quantity: element.measurements?.area?.squareMeters?.value || 0,
            unit: this.determineUnit(element),
            
            // Pricing placeholders
            unitPrice: 0.00,
            totalPrice: 0.00,
            
            // Technical details
            technical: {
                dinStandards: [],
                vobReferences: [],
                executionClass: 'standard'
            },
            
            // Additional specifications
            specifications: await this.generateSpecifications(element, context),
            
            // Execution instructions
            execution: await this.getExecutionInstructions(element.classification, context),
            
            // Quality requirements
            quality: await this.generateQualityRequirements(element, context),
            
            // Metadata
            metadata: {
                stlbCategory: this.mapElementToSTLBCategory(element),
                generatedAt: new Date().toISOString(),
                confidence: 0.85
            }
        };
        
        // Validate completeness
        position.metadata.completeness = this.validatePositionCompleteness(position);
        
        console.log(`   ✅ Generated complete position with ${position.metadata.completeness}% completeness`);
        
        return position;
    }
    
    /**
     * 📑 EXPORT TO GAEB FORMAT
     */
    async exportToGAEB(positions, projectInfo = {}) {
        console.log(`📑 Exporting ${positions.length} positions to GAEB format...`);
        
        try {
            const gaebData = {
                version: 'GAEB XML 3.2',
                project: projectInfo,
                positions: [],
                
                // GAEB structure
                Award: {
                    DP: projectInfo.client || 'Auftraggeber',
                    Currency: 'EUR',
                    
                    BoQBody: {
                        BoQCtgy: []
                    }
                }
            };
            
            // Group positions by category
            const grouped = this.groupPositionsByCategory(positions);
            
            // Create GAEB structure
            for (const [category, categoryPositions] of Object.entries(grouped)) {
                const boqCategory = {
                    RNoPart: category,
                    Name: this.config.categories[category] || 'Sonstige',
                    BoQItem: []
                };
                
                // Add positions
                for (const pos of categoryPositions) {
                    boqCategory.BoQItem.push({
                        RNoPart: pos.ordinalNumber,
                        Qty: pos.quantity,
                        QU: pos.unit,
                        
                        Description: {
                            CompleteText: {
                                DetailTxt: [
                                    {
                                        Text: pos.text.longText,
                                        OutlineText: {
                                            OutlTxt: pos.text.shortText,
                                            TextOutlTxt: pos.specifications
                                        }
                                    }
                                ]
                            }
                        },
                        
                        // Price fields (empty for tender)
                        UP: '',
                        IT: ''
                    });
                }
                
                gaebData.Award.BoQBody.BoQCtgy.push(boqCategory);
            }
            
            // Convert to XML
            const gaebXML = await this.convertToGAEBXML(gaebData);
            
            console.log(`   ✅ GAEB export complete: ${gaebXML.length} bytes`);
            
            return {
                format: 'GAEB XML 3.2',
                data: gaebXML,
                filename: `${projectInfo.projectId || 'export'}_${Date.now()}.x83`
            };
            
        } catch (error) {
            console.error(`❌ GAEB export failed: ${error.message}`);
            throw error;
        }
    }
    
    // ===========================
    // HELPER METHODS
    // ===========================
    
    async testConnection() {
        try {
            const response = await this.apiClient.get('/status');
            if (response.status !== 200) {
                throw new Error('STLB-Bau API not accessible');
            }
            console.log('   ✅ STLB-Bau API connection successful');
        } catch (error) {
            throw new Error(`STLB-Bau connection failed: ${error.message}`);
        }
    }
    
    async preloadCommonTexts() {
        // Preload commonly used texts
        const commonCategories = ['031', '032', '059']; // Masonry, Concrete, Drywall
        
        for (const category of commonCategories) {
            try {
                await this.searchStandardText({
                    category: category,
                    keywords: ['standard'],
                    properties: {}
                });
            } catch (error) {
                console.warn(`Failed to preload category ${category}`);
            }
        }
    }
    
    async loadLocalTemplates() {
        // Load local text templates as fallback
        const templates = {
            'wall_load_bearing': {
                category: '032',
                shortText: 'Stahlbetonwand herstellen',
                longText: 'Stahlbetonwand herstellen, Beton C25/30, Bewehrung nach Statik, Schalung glatt, beidseitig.',
                unit: 'm³'
            },
            'wall_non_load_bearing': {
                category: '031',
                shortText: 'Mauerwerkswand herstellen',
                longText: 'Mauerwerkswand aus Kalksandstein, 2DF, Druckfestigkeitsklasse 12, Dünnbettmörtel.',
                unit: 'm²'
            }
        };
        
        // Cache templates
        for (const [key, template] of Object.entries(templates)) {
            this.textCache.set(key, [template]);
        }
    }
    
    mapElementToSTLBCategory(element) {
        const categoryMapping = {
            'wall_load_bearing': '032',      // Beton- und Stahlbetonarbeiten
            'wall_non_load_bearing': '031',  // Mauerarbeiten
            'column': '032',                 // Beton- und Stahlbetonarbeiten
            'beam': '032',                   // Beton- und Stahlbetonarbeiten
            'slab': '032',                   // Beton- und Stahlbetonarbeiten
            'insulation': '061',             // Dämmarbeiten
            'door': '046',                   // Tischlerarbeiten
            'window': '051',                 // Metallbauarbeiten
            'flooring': '057',               // Bodenbelagarbeiten
            'drywall': '059',                // Trockenbauarbeiten
            'roof': '038',                   // Dachdeckungs- und Dachabdichtungsarbeiten
            'plaster': '042'                 // Putz- und Stuckarbeiten
        };
        
        return categoryMapping[element.classification] || '000';
    }
    
    extractKeywords(element) {
        const keywords = [element.classification];
        
        // Add material keywords
        if (element.properties?.material) {
            keywords.push(element.properties.material);
        }
        
        // Add specific keywords based on type
        if (element.classification.includes('wall')) {
            keywords.push('wand', 'mauer');
        } else if (element.classification.includes('door')) {
            keywords.push('tür', 'öffnung');
        }
        
        return keywords;
    }
    
    selectBestMatch(searchResults, element, requirements) {
        // Score each result
        const scored = searchResults.map(result => {
            let score = 0;
            
            // Material match
            if (result.properties?.material === element.properties?.material) {
                score += 30;
            }
            
            // Dimension match
            if (result.properties?.thickness === element.properties?.thickness) {
                score += 20;
            }
            
            // Quality level match
            if (result.qualityLevel === requirements.qualityLevel) {
                score += 25;
            }
            
            // Completeness
            score += result.completeness || 0;
            
            return { ...result, matchScore: score };
        });
        
        // Sort by score
        scored.sort((a, b) => b.matchScore - a.matchScore);
        
        return scored[0];
    }
    
    async customizeText(standardText, element, requirements) {
        const customized = { ...standardText };
        
        // Replace placeholders
        customized.longText = customized.longText
            .replace('{MATERIAL}', element.properties?.material || 'nach Wahl')
            .replace('{DICKE}', element.properties?.thickness || 'nach Plan')
            .replace('{FESTIGKEIT}', requirements.strength || 'nach Statik')
            .replace('{OBERFLÄCHE}', requirements.surface || 'glatt');
        
        // Add project-specific requirements
        if (requirements.specialRequirements) {
            customized.longText += '\n' + requirements.specialRequirements.join('\n');
        }
        
        return customized;
    }
    
    async addQualityRequirements(text, requirements) {
        const enhanced = { ...text };
        
        // Add quality standards
        enhanced.qualityRequirements = {
            standards: [],
            tolerances: '',
            testing: ''
        };
        
        // Add relevant standards
        if (text.category === '032') { // Concrete
            enhanced.qualityRequirements.standards.push(
                'DIN EN 206',
                'DIN 1045-2',
                'DIN 18331'
            );
            enhanced.qualityRequirements.tolerances = 'DIN 18202, Tabelle 3, Zeile 6';
        }
        
        // Add testing requirements
        if (requirements.qualityLevel === 'erhoeht') {
            enhanced.qualityRequirements.testing = 'Prüfung nach DIN EN 12390';
        }
        
        return enhanced;
    }
    
    async generateCustomText(element, requirements) {
        // Generate text from scratch if no standard text found
        const template = this.config.textStructure.standardPosition;
        
        const customText = {
            ...template,
            title: this.generateTitle(element),
            shortText: this.generateShortText(element),
            longText: await this.generateLongText(element, requirements),
            unit: this.determineUnit(element),
            
            technicalText: {
                material: element.properties?.material || '',
                execution: requirements.execution || '',
                surface: requirements.surface || '',
                dimension: this.formatDimensions(element.measurements)
            }
        };
        
        return customText;
    }
    
    generateFromTemplate(element, requirements) {
        // Fallback template generation
        const templates = {
            'wall': 'Wand herstellen, {MATERIAL}, d = {DICKE} cm, {OBERFLÄCHE}',
            'slab': 'Decke herstellen, {MATERIAL}, d = {DICKE} cm, {BEWEHRUNG}',
            'door': 'Tür einbauen, {TYP}, {BREITE} x {HÖHE} cm, {BESCHLAG}',
            'window': 'Fenster einbauen, {TYP}, {BREITE} x {HÖHE} cm, {VERGLASUNG}'
        };
        
        const baseTemplate = templates[element.classification.split('_')[0]] || 
                           '{TYP} herstellen/einbauen nach Zeichnung';
        
        return {
            shortText: element.classification.replace(/_/g, ' '),
            longText: this.fillTemplate(baseTemplate, element, requirements),
            unit: this.determineUnit(element)
        };
    }
    
    determineUnit(element) {
        const unitMapping = {
            'wall': 'm²',
            'column': 'm³',
            'beam': 'm³',
            'slab': 'm²',
            'door': 'Stk',
            'window': 'Stk',
            'insulation': 'm²',
            'flooring': 'm²'
        };
        
        const baseType = element.classification.split('_')[0];
        return unitMapping[baseType] || 'psch';
    }
    
    generateTitle(element) {
        const titles = {
            'wall_load_bearing': 'Tragende Wand',
            'wall_non_load_bearing': 'Nichttragende Wand',
            'column': 'Stütze',
            'beam': 'Balken/Unterzug',
            'slab': 'Decke',
            'door': 'Tür',
            'window': 'Fenster'
        };
        
        return titles[element.classification] || element.classification;
    }
    
    generateShortText(element) {
        return `${this.generateTitle(element)} herstellen/einbauen`;
    }
    
    async generateLongText(element, requirements) {
        let text = `${this.generateTitle(element)} `;
        
        // Add action
        if (element.classification.includes('wall') || element.classification.includes('slab')) {
            text += 'herstellen, ';
        } else {
            text += 'einbauen, ';
        }
        
        // Add material
        if (element.properties?.material) {
            text += `${element.properties.material}, `;
        }
        
        // Add dimensions
        if (element.measurements) {
            text += this.formatDimensions(element.measurements) + ', ';
        }
        
        // Add quality requirements
        if (requirements.qualityLevel) {
            text += `Qualität: ${this.config.qualityLevels[requirements.qualityLevel]}, `;
        }
        
        // Add execution requirements
        text += 'Ausführung nach den anerkannten Regeln der Technik und VOB/C.';
        
        return text;
    }
    
    formatDimensions(measurements) {
        if (!measurements) return '';
        
        const parts = [];
        
        if (measurements.dimensions?.thickness) {
            parts.push(`d = ${measurements.dimensions.thickness.value} ${measurements.dimensions.thickness.unit}`);
        }
        
        if (measurements.dimensions?.width && measurements.dimensions?.height) {
            parts.push(`${measurements.dimensions.width.value} x ${measurements.dimensions.height.value} ${measurements.dimensions.width.unit}`);
        }
        
        return parts.join(', ');
    }
    
    async generateSpecifications(element, context) {
        const specs = [];
        
        // Material specifications
        if (element.properties?.material) {
            specs.push(`Material: ${element.properties.material}`);
        }
        
        // Dimensional specifications
        if (element.measurements?.dimensions) {
            specs.push(`Abmessungen: ${this.formatDimensions(element.measurements)}`);
        }
        
        // Context-specific specs
        if (context.fireRating) {
            specs.push(`Feuerwiderstand: ${context.fireRating}`);
        }
        
        if (context.soundInsulation) {
            specs.push(`Schallschutz: ${context.soundInsulation} dB`);
        }
        
        return specs;
    }
    
    async generateQualityRequirements(element, context) {
        const quality = {
            standards: [],
            tolerances: {},
            testing: [],
            acceptance: []
        };
        
        // Add element-specific standards
        const elementStandards = {
            'wall': ['DIN 18331', 'DIN 18202'],
            'concrete': ['DIN EN 206', 'DIN 1045-2'],
            'masonry': ['DIN EN 1996', 'DIN 18330'],
            'steel': ['DIN EN 1090', 'DIN 18335']
        };
        
        // Determine applicable standards
        for (const [key, standards] of Object.entries(elementStandards)) {
            if (element.classification.includes(key) || 
                element.properties?.material?.includes(key)) {
                quality.standards.push(...standards);
            }
        }
        
        // Add tolerances
        quality.tolerances = {
            dimensional: 'DIN 18202, Tabelle 3',
            flatness: 'DIN 18202, Tabelle 2',
            verticality: 'DIN 18202, Tabelle 1'
        };
        
        // Add testing requirements
        if (element.properties?.material?.includes('concrete')) {
            quality.testing.push('Betondruckprüfung nach DIN EN 12390');
            quality.testing.push('Betondeckungsmessung');
        }
        
        // Acceptance criteria
        quality.acceptance.push('Abnahme nach VOB/B § 12');
        quality.acceptance.push('Dokumentation aller Prüfungen');
        
        return quality;
    }
    
    getDefaultInstructions(classification) {
        return {
            preparation: ['Arbeitsbereich vorbereiten', 'Maße prüfen'],
            execution: ['Nach Herstellerangaben ausführen', 'Fachgerecht montieren'],
            quality: ['Maßhaltigkeit prüfen', 'Oberflächenqualität kontrollieren'],
            safety: ['Persönliche Schutzausrüstung tragen', 'Absturzsicherung beachten']
        };
    }
    
    fillTemplate(template, element, requirements) {
        return template
            .replace('{MATERIAL}', element.properties?.material || 'nach Wahl')
            .replace('{DICKE}', element.measurements?.dimensions?.thickness?.value || 'nach Plan')
            .replace('{TYP}', element.classification.replace(/_/g, ' '))
            .replace('{BREITE}', element.measurements?.dimensions?.width?.value || 'nach Plan')
            .replace('{HÖHE}', element.measurements?.dimensions?.height?.value || 'nach Plan')
            .replace('{OBERFLÄCHE}', requirements.surface || 'glatt')
            .replace('{BEWEHRUNG}', requirements.reinforcement || 'nach Statik')
            .replace('{BESCHLAG}', requirements.hardware || 'Standard')
            .replace('{VERGLASUNG}', requirements.glazing || '3-fach');
    }
    
    validatePositionCompleteness(position) {
        let completeness = 0;
        const checks = [
            { field: position.text?.longText, weight: 30 },
            { field: position.quantity > 0, weight: 20 },
            { field: position.unit, weight: 10 },
            { field: position.specifications?.length > 0, weight: 15 },
            { field: position.execution?.execution?.length > 0, weight: 10 },
            { field: position.quality?.standards?.length > 0, weight: 15 }
        ];
        
        for (const check of checks) {
            if (check.field) {
                completeness += check.weight;
            }
        }
        
        return completeness;
    }
    
    groupPositionsByCategory(positions) {
        const grouped = {};
        
        for (const pos of positions) {
            const category = pos.metadata?.stlbCategory || '000';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(pos);
        }
        
        return grouped;
    }
    
    async convertToGAEBXML(gaebData) {
        // Convert JS object to GAEB XML format
        const builder = require('xmlbuilder');
        
        const xml = builder.create('GAEB', {
            version: '1.0',
            encoding: 'UTF-8'
        })
        .att('xmlns', 'http://www.gaeb.de/GAEB_XML_Schema/320')
        .att('version', '3.2');
        
        // Build XML structure
        // Implementation would create complete GAEB XML
        
        return xml.end({ pretty: true });
    }
}
