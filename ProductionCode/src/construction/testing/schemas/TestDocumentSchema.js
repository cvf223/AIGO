/**
 * 📋 TEST DOCUMENT SCHEMA - Data Structure Definition
 * ==================================================
 * 
 * Defines the expected structure for test documents used in
 * HOAI compliance testing and integration testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

export const TestDocumentSchema = {
    // Project-level metadata
    projectMetadata: {
        id: String,                    // Unique project identifier
        name: String,                  // Project name
        type: String,                  // 'AS38-42' | 'FB' | 'office' | 'residential'
        buildingType: String,          // Bürogebäude, Wohngebäu, etc.
        floors: Number,                // Total number of floors
        totalArea: Number,             // Total area in m²
        estimatedCost: Number,         // Estimated cost in €
        location: String,              // Location/address
        client: String,                // Client name
        architect: String              // Architect name
    },
    
    // Plans array
    plans: [{
        id: String,                    // Unique plan identifier
        filename: String,              // PDF filename
        path: String,                  // Full path to PDF
        type: String,                  // 'floor_plan' | 'section' | 'elevation' | 'detail'
        floor: String,                 // Floor designation (EG, OG1, UG, Dach, etc.)
        planType: String,              // Grundriss, Schnitt, Ansicht
        metadata: {
            scale: String,             // 1:50, 1:100, 1:200
            date: Date,                // Plan date
            revision: String,          // Revision letter (A, B, C, etc.)
            elements: Number,          // Expected element count
            pageCount: Number,         // PDF page count
            dimensions: {              // Plan dimensions
                width: Number,
                height: Number
            }
        }
    }],
    
    // Quantities (DIN 276 structure)
    quantities: {
        din276Structure: {
            kgr300: {                  // Bauwerk - Baukonstruktionen
                total: Number,
                items: [{
                    code: String,       // DIN 276 code
                    description: String,
                    quantity: Number,
                    unit: String,
                    unitPrice: Number,
                    totalPrice: Number
                }]
            },
            kgr400: {                  // Bauwerk - Technische Anlagen
                total: Number,
                items: []
            },
            kgr500: {                  // Außenanlagen
                total: Number,
                items: []
            }
        },
        totalVolume: Number,           // Total building volume in m³
        totalArea: Number,             // Total area in m²
        elements: [{
            type: String,              // Element type (wall, window, door, etc.)
            quantity: Number,          // Quantity value
            unit: String,              // Unit (m², m³, Stück, etc.)
            din276Code: String,        // DIN 276 classification
            location: {                // Location on plan
                planId: String,
                bbox: [Number, Number, Number, Number]
            }
        }]
    },
    
    // HOAI requirements
    hoaiRequirements: {
        lp6: {
            grundleistungen: [         // 7 Grundleistungen of LP6
                {
                    id: String,
                    description: String,
                    completed: Boolean,
                    evidence: String
                }
            ],
            besondereLeistungen: [],   // Optional special services
            completeness: Number,      // 0.0 - 1.0
            compliance: Boolean
        },
        lp7: {
            grundleistungen: [         // 6 Grundleistungen of LP7
                {
                    id: String,
                    description: String,
                    completed: Boolean,
                    evidence: String
                }
            ],
            besondereLeistungen: [],
            completeness: Number,
            compliance: Boolean
        }
    },
    
    // Errors (if any)
    errors: [{
        id: String,
        type: String,                  // Type of error
        severity: String,              // LOW, MEDIUM, HIGH, CRITICAL
        description: String,
        location: {
            planId: String,
            bbox: [Number, Number, Number, Number]
        },
        suggestedSolutions: []
    }],
    
    // Analysis metadata
    analysisMetadata: {
        analyzedAt: Date,
        analyzedBy: String,            // AI agent or system
        duration: Number,              // Analysis duration in ms
        accuracy: Number,              // Confidence score
        version: String                // Analysis version
    }
};

/**
 * Validate test document against schema
 */
export function validateTestDocument(document) {
    const errors = [];
    
    if (!document.projectMetadata) {
        errors.push('Missing projectMetadata');
    }
    
    if (!document.plans || !Array.isArray(document.plans)) {
        errors.push('Missing or invalid plans array');
    }
    
    if (!document.quantities) {
        errors.push('Missing quantities');
    }
    
    if (!document.hoaiRequirements) {
        errors.push('Missing hoaiRequirements');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export default TestDocumentSchema;

