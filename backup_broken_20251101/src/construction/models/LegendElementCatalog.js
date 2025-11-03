/**
 * 🏗️ LEGEND ELEMENT CATALOG
 * ========================
 * 
 * Complete catalog of all construction legend elements
 * with proper categorization and measurement types
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

export default class LegendElementCatalog {
    constructor() {
        // Wall/Area Elements (measured in m²)
        this.wallElements = {
            'MW_KS_2.0': {
                name: 'MW KS 2.0',
                description: 'Mauerwerk Kalksandstein 2.0',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '342'
            },
            'MW_KS_2.2': {
                name: 'MW KS 2.2',
                description: 'Mauerwerk Kalksandstein 2.2',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '342'
            },
            'STAHLBETON': {
                name: 'Stahlbeton',
                description: 'Bewehrter Beton',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '341'
            },
            'BETON_UNBEWEHRT': {
                name: 'Beton unbewehrt',
                description: 'Unbewehrter Beton',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '341'
            },
            'DAEMMUNG_HART': {
                name: 'Dämmung hart',
                description: 'Harte Dämmung (XPS, PUR)',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '334'
            },
            'DAEMMUNG_WEICH': {
                name: 'Dämmung weich',
                description: 'Weiche Dämmung (Mineralwolle)',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '334'
            },
            'TROCKENBAU': {
                name: 'Trockenbau',
                description: 'Gipskarton Trockenbau',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '346'
            },
            'TROCKENBAU_IMPRAEGNIERT': {
                name: 'Trockenbau imprägniert',
                description: 'Imprägnierte Gipskartonplatten (Feuchtraum)',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '346'
            },
            'HOLZ': {
                name: 'Holz',
                description: 'Holzkonstruktion',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '360'
            },
            'METALL': {
                name: 'Metall',
                description: 'Metallkonstruktion',
                category: 'wall',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '360'
            },
            'ERDREICH': {
                name: 'Erdreich',
                description: 'Erdreich/Boden',
                category: 'ground',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '320'
            },
            'BESTAND': {
                name: 'Bestand',
                description: 'Bestehende Konstruktion',
                category: 'existing',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '399'
            },
            'ABBRUCH': {
                name: 'Abbruch',
                description: 'Abzubrechende Elemente',
                category: 'demolition',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '371'
            },
            'AHD': {
                name: 'AHD',
                description: 'Abhangdecke',
                category: 'ceiling',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '353'
            },
            'AHD_IMPRAEGNIERT': {
                name: 'AHD imprägniert',
                description: 'Imprägnierte Abhangdecke',
                category: 'ceiling',
                measurementType: 'area',
                unit: 'm²',
                dinCode: '353'
            }
        };

        // Discrete Elements (counted)
        this.openingElements = {
            'BD': {
                name: 'BD x/y',
                description: 'Bodendurchbruch',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'DD': {
                name: 'DD x/y',
                description: 'Deckendurchbruch',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'WD': {
                name: 'WD x/h',
                description: 'Wanddurchbruch',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'BS': {
                name: 'BS x/y/h',
                description: 'Bodenschlitz',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'DSZ': {
                name: 'DSZ x/y/h',
                description: 'Deckenschlitz',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'WS': {
                name: 'WS x/y/h',
                description: 'Wandschlitz',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'UZD': {
                name: 'UZD x/h',
                description: 'Unterzugdurchbruch',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '362'
            },
            'AUSSENLUFFDURCHLASS': {
                name: 'Außenluftdurchlass',
                description: 'Außenluftdurchlass',
                category: 'opening',
                measurementType: 'count',
                unit: 'Stück',
                dinCode: '431'
            }
        };

        // Reference Elements (for context, not measured)
        this.referenceElements = {
            'OK_FERTIG': {
                name: 'OK Fertig',
                description: 'Oberkante Fertig',
                category: 'reference',
                measurementType: 'none',
                unit: null
            },
            'UK_FERTIG': {
                name: 'UK Fertig',
                description: 'Unterkante Fertig',
                category: 'reference',
                measurementType: 'none',
                unit: null
            },
            'OK_ROH': {
                name: 'OK Roh',
                description: 'Oberkante Roh',
                category: 'reference',
                measurementType: 'none',
                unit: null
            },
            'UK_ROH': {
                name: 'UK Roh',
                description: 'Unterkante Roh',
                category: 'reference',
                measurementType: 'none',
                unit: null
            },
            'FLUCHTWEG': {
                name: 'Flucht- u. Rettungsweg',
                description: 'Flucht- und Rettungsweg',
                category: 'reference',
                measurementType: 'none',
                unit: null
            },
            'OFFENE_PUNKTE': {
                name: 'offene Punkte',
                description: 'Noch zu klärende Punkte',
                category: 'reference',
                measurementType: 'none',
                unit: null
            }
        };

        // Text Annotations for OCR
        this.textAnnotations = {
            fireProtection: {
                'BRANDSCHUTZ': 'Brandschutz Bereich',
                'DS': 'Dichtschließend',
                'F30': 'Feuerhemmende Wand',
                'F90': 'Feuerbeständige Wand',
                'F': 'Feuerlöscheinrichtung',
                'H': 'Hydrant',
                'RS': 'Rauchsicher/Rauchschutz',
                'T30': 'Feuerhemmende Tür',
                'T90': 'Brandschutz Tür'
            },
            levels: {
                'OK': 'Oberkante',
                'UK': 'Unterkante',
                'OK RD': 'Oberkante Rohdecke',
                'OK FFB': 'Oberkante Fertigfußboden',
                'OK RFB': 'Oberkante Rohfußboden',
                'OK G': 'Oberkante Gelände',
                'UK WS': 'Unterkante Wandschlitz',
                'UK D': 'Unterkante Decke',
                'UK RD': 'Unterkante Rohdecke',
                'UK UZ': 'Unterkante Unterzug',
                'UK WD': 'Unterkante Wärmedämmung',
                'VK': 'Vorderkante'
            },
            positions: {
                'aD': 'an Decke',
                'uD': 'unter Decke',
                'üB': 'über Boden',
                'üT': 'über Terrain',
                'uT': 'unter Terrain',
                'dg': 'durchgehend'
            },
            technical: {
                'AHD': 'Abhangdecke',
                'B': 'Boden',
                'BE': 'Bodeneinlauf',
                'BRH': 'Brüstungshöhe',
                'BK': 'Bodenkanal',
                'FD': 'Fundamentdurchbruch',
                'FS': 'Fundamentschlitz',
                'HP': 'Hochpunkt',
                'HZK': 'Heizkörper',
                'HKV': 'Heizkreisverteiler',
                'LFT': 'Lüftungsgitter',
                'LRH': 'Lichte Raumhöhe',
                'LS': 'Lüftungsschlitz',
                'REV': 'Revisionsöffnung',
                'ROLL': 'Rolladenkasten',
                'RW': 'Regenwasser',
                'RH': 'Rohrhülse',
                'STG': 'Steigung',
                'T': 'Telefon',
                'TP': 'Tiefpunkt',
                'UV': 'Unterverteilung ELT',
                'UZ': 'Unterzug',
                'ÜZ': 'Überzug',
                'VM': 'Vermauerung',
                'W': 'Wand'
            },
            utilities: {
                'S': 'Sanitär',
                'H': 'Heizung',
                'E': 'Elektro',
                'L': 'Lüftung',
                'G': 'Gas'
            }
        };

        // Combine all elements for easy access
        this.allElements = {
            ...this.wallElements,
            ...this.openingElements,
            ...this.referenceElements
        };
    }

    /**
     * 🔍 IDENTIFY ELEMENT BY NAME
     */
    identifyElement(name) {
        // Normalize the name
        const normalized = this.normalizeName(name);
        
        // Try exact match first
        for (const [key, element] of Object.entries(this.allElements)) {
            if (this.normalizeName(element.name) === normalized) {
                return element;
            }
        }
        
        // Try partial match
        for (const [key, element] of Object.entries(this.allElements)) {
            if (normalized.includes(this.normalizeName(element.name)) ||
                this.normalizeName(element.name).includes(normalized)) {
                return element;
            }
        }
        
        // Check text annotations
        for (const category of Object.values(this.textAnnotations)) {
            for (const [abbr, desc] of Object.entries(category)) {
                if (this.normalizeName(abbr) === normalized) {
                    return {
                        name: abbr,
                        description: desc,
                        category: 'annotation',
                        measurementType: 'none'
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 🔄 NORMALIZE NAME
     */
    normalizeName(name) {
        return name
            .toUpperCase()
            .replace(/[\s\-_\/]/g, '')
            .replace(/Ä/g, 'AE')
            .replace(/Ö/g, 'OE')
            .replace(/Ü/g, 'UE')
            .replace(/ß/g, 'SS');
    }

    /**
     * 📊 GET ELEMENTS BY CATEGORY
     */
    getElementsByCategory(category) {
        return Object.values(this.allElements)
            .filter(element => element.category === category);
    }

    /**
     * 📐 GET ELEMENTS BY MEASUREMENT TYPE
     */
    getElementsByMeasurementType(type) {
        return Object.values(this.allElements)
            .filter(element => element.measurementType === type);
    }

    /**
     * 🏷️ GET DIN CODE
     */
    getDinCode(elementName) {
        const element = this.identifyElement(elementName);
        return element ? element.dinCode : null;
    }

    /**
     * 📋 GET ALL WALL ELEMENTS
     */
    getWallElements() {
        return Object.values(this.wallElements);
    }

    /**
     * 🚪 GET ALL OPENING ELEMENTS
     */
    getOpeningElements() {
        return Object.values(this.openingElements);
    }

    /**
     * 📍 GET ALL REFERENCE ELEMENTS
     */
    getReferenceElements() {
        return Object.values(this.referenceElements);
    }

    /**
     * 🔤 GET ALL TEXT ANNOTATIONS
     */
    getTextAnnotations() {
        return this.textAnnotations;
    }

    /**
     * 📝 GENERATE ELEMENT PROMPT FOR VLM
     */
    generateVLMPrompt() {
        const wallList = this.getWallElements().map(e => e.name).join(', ');
        const openingList = this.getOpeningElements().map(e => e.name).join(', ');
        const referenceList = this.getReferenceElements().map(e => e.name).join(', ');
        
        return `
Analyze this construction legend pattern and identify what element it represents.

Known element categories:

WALL ELEMENTS (measure in m²):
${wallList}

OPENING ELEMENTS (count individually):
${openingList}

REFERENCE ELEMENTS (context only, not measured):
${referenceList}

Please identify:
1. What specific element does this pattern represent?
2. Category: Is it a wall material, opening/durchbruch, or reference marker?
3. Measurement type: Should it be measured in area (m²) or counted (#)?

Respond in JSON format:
{
    "elementType": "exact name from list",
    "category": "wall|opening|reference",
    "measurementType": "area|count|none",
    "confidence": 0.0-1.0
}`;
    }
}

export { LegendElementCatalog };

