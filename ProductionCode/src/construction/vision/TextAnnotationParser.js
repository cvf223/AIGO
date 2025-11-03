/**
 * 📝 TEXT ANNOTATION PARSER
 * ========================
 * 
 * Parses and correlates text annotations from construction plans
 * using OCR and pattern matching
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import Tesseract from 'tesseract.js';
import LegendElementCatalog from '../models/LegendElementCatalog.js';

export default class TextAnnotationParser {
    constructor() {
        this.catalog = new LegendElementCatalog();
        this.annotations = this.catalog.getTextAnnotations();
        
        this.config = {
            ocr: {
                language: 'deu+eng',  // German + English
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜabcdefghijklmnopqrstuvwxyzäöüß0123456789 /-.,',
                preserve_interword_spaces: '1',
                min_confidence: 0.6
            },
            
            regions: {
                legend: { x: 0.7, y: 0.7, width: 0.25, height: 0.25 },  // Bottom right
                header: { x: 0, y: 0, width: 1, height: 0.1 },          // Top
                footer: { x: 0, y: 0.9, width: 1, height: 0.1 },        // Bottom
                planArea: { x: 0.1, y: 0.1, width: 0.6, height: 0.7 }   // Main plan area
            },
            
            patterns: {
                scale: /1\s*:\s*(\d+)/,
                dimension: /(\d+(?:\.\d+)?)\s*(mm|cm|m)/i,
                level: /(OK|UK)\s+(FFB|RFB|RD|G|WS|D|UZ|WD)/,
                fireProtection: /(F30|F90|T30|T90|RS)/,
                utility: /\b(H|E|L|G|S)\b/,
                opening: /(BD|DD|WD|BS|DSZ|WS|UZD)\s*(\d+(?:\.\d+)?)\s*[x/]\s*(\d+(?:\.\d+)?)/
            }
        };
        
        this.detectedAnnotations = [];
    }

    /**
     * 📖 PARSE TEXT FROM IMAGE REGION
     */
    async parseTextFromRegion(image, region) {
        try {
            // Extract region from image
            const regionImage = await this.extractRegion(image, region);
            
            // Run OCR
            const { data: { text, words } } = await Tesseract.recognize(
                regionImage,
                this.config.ocr.language,
                {
                    logger: m => {}, // Suppress logging
                    tessedit_char_whitelist: this.config.ocr.tessedit_char_whitelist,
                    preserve_interword_spaces: this.config.ocr.preserve_interword_spaces
                }
            );
            
            // Parse detected text
            const annotations = this.parseAnnotations(text, words);
            
            return {
                text: text,
                words: words.filter(w => w.confidence > this.config.ocr.min_confidence),
                annotations: annotations
            };
            
        } catch (error) {
            console.warn('OCR failed for region:', error.message);
            return {
                text: '',
                words: [],
                annotations: []
            };
        }
    }

    /**
     * 🔍 PARSE ANNOTATIONS FROM TEXT
     */
    parseAnnotations(text, words) {
        const found = [];
        
        // Parse scale
        const scaleMatch = text.match(this.config.patterns.scale);
        if (scaleMatch) {
            found.push({
                type: 'scale',
                value: `1:${scaleMatch[1]}`,
                confidence: 0.9
            });
        }
        
        // Parse dimensions
        const dimensionMatches = text.matchAll(this.config.patterns.dimension);
        for (const match of dimensionMatches) {
            found.push({
                type: 'dimension',
                value: parseFloat(match[1]),
                unit: match[2],
                text: match[0],
                confidence: 0.85
            });
        }
        
        // Parse levels
        const levelMatches = text.matchAll(this.config.patterns.level);
        for (const match of levelMatches) {
            found.push({
                type: 'level',
                category: match[1], // OK or UK
                subtype: match[2],  // FFB, RFB, etc.
                text: match[0],
                confidence: 0.8
            });
        }
        
        // Parse fire protection
        const fireMatches = text.matchAll(this.config.patterns.fireProtection);
        for (const match of fireMatches) {
            found.push({
                type: 'fireProtection',
                code: match[1],
                description: this.annotations.fireProtection[match[1]],
                confidence: 0.85
            });
        }
        
        // Parse utilities
        const utilityMatches = text.matchAll(this.config.patterns.utility);
        for (const match of utilityMatches) {
            const code = match[1];
            if (this.annotations.utilities[code]) {
                found.push({
                    type: 'utility',
                    code: code,
                    description: this.annotations.utilities[code],
                    confidence: 0.8
                });
            }
        }
        
        // Parse openings
        const openingMatches = text.matchAll(this.config.patterns.opening);
        for (const match of openingMatches) {
            found.push({
                type: 'opening',
                code: match[1],
                width: parseFloat(match[2]),
                height: parseFloat(match[3]),
                text: match[0],
                confidence: 0.85
            });
        }
        
        // Parse known abbreviations
        for (const [category, abbrevs] of Object.entries(this.annotations)) {
            for (const [abbr, description] of Object.entries(abbrevs)) {
                if (text.includes(abbr)) {
                    found.push({
                        type: 'annotation',
                        category: category,
                        code: abbr,
                        description: description,
                        confidence: 0.75
                    });
                }
            }
        }
        
        return found;
    }

    /**
     * 📏 EXTRACT SCALE FROM PLAN
     */
    async extractScale(planImage) {
        // Try footer first (most common location)
        const footerRegion = this.config.regions.footer;
        const footerResult = await this.parseTextFromRegion(planImage, footerRegion);
        
        const scaleAnnotation = footerResult.annotations.find(a => a.type === 'scale');
        if (scaleAnnotation) {
            return this.parseScaleToMetrics(scaleAnnotation.value);
        }
        
        // Try header
        const headerRegion = this.config.regions.header;
        const headerResult = await this.parseTextFromRegion(planImage, headerRegion);
        
        const headerScale = headerResult.annotations.find(a => a.type === 'scale');
        if (headerScale) {
            return this.parseScaleToMetrics(headerScale.value);
        }
        
        // Try legend area
        const legendRegion = this.config.regions.legend;
        const legendResult = await this.parseTextFromRegion(planImage, legendRegion);
        
        const legendScale = legendResult.annotations.find(a => a.type === 'scale');
        if (legendScale) {
            return this.parseScaleToMetrics(legendScale.value);
        }
        
        // Default to 1:100
        return {
            notation: '1:100',
            scale: 100,
            pixelsPerMeter: 300  // Assuming 300 DPI
        };
    }

    /**
     * 📐 PARSE SCALE TO METRICS
     */
    parseScaleToMetrics(scaleString) {
        const match = scaleString.match(/1:(\d+)/);
        if (!match) {
            return {
                notation: '1:100',
                scale: 100,
                pixelsPerMeter: 300
            };
        }
        
        const scale = parseInt(match[1]);
        
        // Calculate pixels per meter based on scale and assumed DPI
        // Assuming 300 DPI (dots per inch)
        // 1 inch = 25.4 mm
        // 300 DPI = 300 pixels/inch = 11.81 pixels/mm = 11811 pixels/m
        // At scale 1:100, 1m real = 10mm on paper = 118.11 pixels
        const pixelsPerMeter = 11811 / scale;
        
        return {
            notation: scaleString,
            scale: scale,
            pixelsPerMeter: pixelsPerMeter
        };
    }

    /**
     * 🏷️ CORRELATE ANNOTATIONS WITH ELEMENTS
     */
    correlateWithElements(annotations, detectedElements) {
        const correlated = [];
        
        for (const element of detectedElements) {
            // Find nearby annotations
            const nearbyAnnotations = this.findNearbyAnnotations(
                element.location,
                annotations
            );
            
            // Determine element type based on annotations
            let elementType = element.type;
            let additionalInfo = {};
            
            for (const annotation of nearbyAnnotations) {
                if (annotation.type === 'fireProtection') {
                    additionalInfo.fireProtection = annotation.code;
                } else if (annotation.type === 'utility') {
                    additionalInfo.utility = annotation.code;
                } else if (annotation.type === 'level') {
                    additionalInfo.level = annotation.text;
                } else if (annotation.type === 'opening' && 
                          element.type.includes('opening')) {
                    additionalInfo.dimensions = {
                        width: annotation.width,
                        height: annotation.height
                    };
                }
            }
            
            correlated.push({
                ...element,
                elementType: elementType,
                annotations: nearbyAnnotations,
                additionalInfo: additionalInfo
            });
        }
        
        return correlated;
    }

    /**
     * 📍 FIND NEARBY ANNOTATIONS
     */
    findNearbyAnnotations(elementLocation, annotations, maxDistance = 50) {
        const nearby = [];
        
        for (const annotation of annotations) {
            if (annotation.location) {
                const distance = this.calculateDistance(
                    elementLocation,
                    annotation.location
                );
                
                if (distance <= maxDistance) {
                    nearby.push({
                        ...annotation,
                        distance: distance
                    });
                }
            }
        }
        
        // Sort by distance
        return nearby.sort((a, b) => a.distance - b.distance);
    }

    /**
     * 📏 CALCULATE DISTANCE
     */
    calculateDistance(loc1, loc2) {
        const dx = loc1.x - loc2.x;
        const dy = loc1.y - loc2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 🖼️ EXTRACT REGION FROM IMAGE
     */
    async extractRegion(image, region) {
        const { createCanvas } = await import('canvas');
        
        // Calculate actual pixel coordinates
        const x = Math.floor(image.width * region.x);
        const y = Math.floor(image.height * region.y);
        const width = Math.floor(image.width * region.width);
        const height = Math.floor(image.height * region.height);
        
        // Create canvas for region
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Draw region
        ctx.drawImage(
            image,
            x, y, width, height,  // Source
            0, 0, width, height   // Destination
        );
        
        return canvas.toBuffer('image/png');
    }

    /**
     * 🔍 FIND TEXT IN PLAN
     */
    async findTextInPlan(planImage, searchText) {
        const normalizedSearch = this.normalizeText(searchText);
        const results = [];
        
        // Search in main plan area
        const planRegion = this.config.regions.planArea;
        const planResult = await this.parseTextFromRegion(planImage, planRegion);
        
        for (const word of planResult.words) {
            if (this.normalizeText(word.text).includes(normalizedSearch)) {
                results.push({
                    text: word.text,
                    location: {
                        x: word.bbox.x0,
                        y: word.bbox.y0,
                        width: word.bbox.x1 - word.bbox.x0,
                        height: word.bbox.y1 - word.bbox.y0
                    },
                    confidence: word.confidence
                });
            }
        }
        
        return results;
    }

    /**
     * 🔄 NORMALIZE TEXT
     */
    normalizeText(text) {
        return text
            .toUpperCase()
            .replace(/[\s\-_]/g, '')
            .replace(/Ä/g, 'AE')
            .replace(/Ö/g, 'OE')
            .replace(/Ü/g, 'UE')
            .replace(/ß/g, 'SS');
    }

    /**
     * 📋 GENERATE ANNOTATION SUMMARY
     */
    generateAnnotationSummary(annotations) {
        const summary = {
            scale: null,
            fireProtection: [],
            utilities: [],
            levels: [],
            openings: [],
            dimensions: [],
            other: []
        };
        
        for (const annotation of annotations) {
            switch (annotation.type) {
                case 'scale':
                    summary.scale = annotation.value;
                    break;
                case 'fireProtection':
                    summary.fireProtection.push(annotation);
                    break;
                case 'utility':
                    summary.utilities.push(annotation);
                    break;
                case 'level':
                    summary.levels.push(annotation);
                    break;
                case 'opening':
                    summary.openings.push(annotation);
                    break;
                case 'dimension':
                    summary.dimensions.push(annotation);
                    break;
                default:
                    summary.other.push(annotation);
            }
        }
        
        return summary;
    }
}

export { TextAnnotationParser };
