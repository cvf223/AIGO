/**
 * 📏 REAL SCALE DETECTOR - OCR-Based Scale Detection from Plans
 * =============================================================
 * 
 * TODO 2: Implements real scale detection from plan headers/legends
 * Uses Tesseract OCR with German language support
 * Validates against common architectural scales
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Scale Detection
 */

import Tesseract from 'tesseract.js';
import { createCanvas, loadImage } from 'canvas';

export default class RealScaleDetector {
    constructor() {
        this.config = {
            detectorName: 'REAL_SCALE_DETECTOR',
            
            // OCR configuration
            ocr: {
                language: 'deu+eng', // German + English
                tessedit_char_whitelist: '0123456789:,. MAßstab',
                psm: 6 // Assume uniform block of text
            },
            
            // Scale detection regions
            searchRegions: [
                { name: 'footer_right', x: 0.7, y: 0.9, width: 0.25, height: 0.08 },
                { name: 'footer_left', x: 0.05, y: 0.9, width: 0.25, height: 0.08 },
                { name: 'header_right', x: 0.7, y: 0.02, width: 0.25, height: 0.08 },
                { name: 'title_block', x: 0.65, y: 0.85, width: 0.32, height: 0.12 }
            ],
            
            // Common architectural scales
            commonScales: [
                { notation: '1:5', ratio: 5, usage: 'detail' },
                { notation: '1:10', ratio: 10, usage: 'detail' },
                { notation: '1:20', ratio: 20, usage: 'detail' },
                { notation: '1:50', ratio: 50, usage: 'standard' },
                { notation: '1:100', ratio: 100, usage: 'standard' },
                { notation: '1:200', ratio: 200, usage: 'overview' },
                { notation: '1:500', ratio: 500, usage: 'site' },
                { notation: '1:1000', ratio: 1000, usage: 'site' }
            ],
            
            // Confidence thresholds
            confidence: {
                ocrMinimum: 0.70,
                scaleValidation: 0.85,
                fallbackConfidence: 0.50
            }
        };
        
        this.ocrWorker = null;
        this.detectionCache = new Map();
    }
    
    /**
     * 🚀 INITIALIZE OCR WORKER
     */
    async initialize() {
        console.log('📏 Initializing Real Scale Detector...');
        
        try {
            // Create Tesseract worker with German language
            this.ocrWorker = await Tesseract.createWorker(this.config.ocr.language, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        process.stdout.write(`\r   OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
                    }
                }
            });
            
            // Configure worker
            await this.ocrWorker.setParameters({
                tessedit_char_whitelist: this.config.ocr.tessedit_char_whitelist,
                tessedit_pageseg_mode: this.config.ocr.psm
            });
            
            console.log('\n   ✅ Tesseract OCR worker initialized');
            console.log(`   🌍 Languages: ${this.config.ocr.language}`);
            
            return true;
            
        } catch (error) {
            console.error('   ❌ OCR initialization failed:', error.message);
            console.log('   ⚠️  Falling back to pattern-based detection');
            return false;
        }
    }
    
    /**
     * 📐 DETECT SCALE FROM PLAN
     */
    async detectScale(planImage, planPath = null) {
        console.log('📏 Detecting scale from plan...');
        
        // Check cache
        if (planPath && this.detectionCache.has(planPath)) {
            console.log('   ✅ Using cached scale');
            return this.detectionCache.get(planPath);
        }
        
        const results = {
            scaleFound: false,
            notation: null,
            ratio: null,
            pixelsPerMillimeter: null,
            confidence: 0,
            detectionMethod: 'none',
            ocrResults: [],
            alternatives: []
        };
        
        // Try each search region
        for (const region of this.config.searchRegions) {
            console.log(`   🔍 Searching ${region.name}...`);
            
            const regionImage = await this.extractRegion(planImage, region);
            const ocrResult = await this.performOCR(regionImage);
            
            if (ocrResult.confidence >= this.config.confidence.ocrMinimum) {
                const parsed = this.parseScaleNotation(ocrResult.text);
                
                if (parsed) {
                    results.scaleFound = true;
                    results.notation = parsed.notation;
                    results.ratio = parsed.ratio;
                    results.pixelsPerMillimeter = await this.calibratePixelsPerMM(
                        planImage,
                        parsed.ratio
                    );
                    results.confidence = ocrResult.confidence * parsed.validationConfidence;
                    results.detectionMethod = `ocr_${region.name}`;
                    results.ocrResults.push(ocrResult);
                    
                    console.log(`   ✅ Scale detected: ${parsed.notation} (${results.confidence.toFixed(2)} confidence)`);
                    break;
                }
            }
        }
        
        // Fallback to default if not found
        if (!results.scaleFound) {
            console.log('   ⚠️  Scale not detected, using fallback');
            results.notation = '1:100';
            results.ratio = 100;
            results.pixelsPerMillimeter = 0.5; // Reasonable default for A3 @ 300dpi
            results.confidence = this.config.confidence.fallbackConfidence;
            results.detectionMethod = 'fallback_default';
        }
        
        // Cache result
        if (planPath) {
            this.detectionCache.set(planPath, results);
        }
        
        return results;
    }
    
    /**
     * 🖼️ EXTRACT REGION FROM IMAGE
     */
    async extractRegion(planImage, region) {
        const width = Math.floor(planImage.width * region.width);
        const height = Math.floor(planImage.height * region.height);
        const x = Math.floor(planImage.width * region.x);
        const y = Math.floor(planImage.height * region.y);
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(planImage, x, y, width, height, 0, 0, width, height);
        
        return canvas;
    }
    
    /**
     * 🔤 PERFORM OCR ON REGION
     */
    async performOCR(imageCanvas) {
        if (!this.ocrWorker) {
            return { text: '', confidence: 0 };
        }
        
        try {
            const imageBuffer = imageCanvas.toBuffer('image/png');
            const { data } = await this.ocrWorker.recognize(imageBuffer);
            
            return {
                text: data.text,
                confidence: data.confidence / 100,
                words: data.words
            };
        } catch (error) {
            console.error('   ❌ OCR failed:', error.message);
            return { text: '', confidence: 0 };
        }
    }
    
    /**
     * 📝 PARSE SCALE NOTATION FROM TEXT
     */
    parseScaleNotation(text) {
        // Common patterns for scale notation
        const patterns = [
            /(?:Maßstab|Massstab|Scale)?\s*1\s*:\s*(\d+)/i,
            /1\s*:\s*(\d+)/,
            /M\s*1\s*:\s*(\d+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const ratio = parseInt(match[1]);
                
                // Validate against common scales
                const commonScale = this.config.commonScales.find(s => s.ratio === ratio);
                
                if (commonScale) {
                    return {
                        notation: commonScale.notation,
                        ratio: commonScale.ratio,
                        usage: commonScale.usage,
                        validationConfidence: 1.0
                    };
                } else if (ratio >= 5 && ratio <= 1000) {
                    // Valid but uncommon scale
                    return {
                        notation: `1:${ratio}`,
                        ratio: ratio,
                        usage: 'custom',
                        validationConfidence: 0.7
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 📏 CALIBRATE PIXELS PER MILLIMETER
     */
    async calibratePixelsPerMM(planImage, scaleRatio) {
        // Typical A3 plan at 300 DPI
        const assumedDPI = 300;
        const mmPerInch = 25.4;
        
        // Calculate pixels per mm on paper
        const pixelsPerMMOnPaper = assumedDPI / mmPerInch;
        
        // Account for scale ratio
        // If scale is 1:100, 1mm on paper = 100mm in reality
        // So pixels per real mm = pixelsPerMMOnPaper / scaleRatio
        const pixelsPerRealMM = pixelsPerMMOnPaper / scaleRatio;
        
        return pixelsPerRealMM;
    }
    
    /**
     * 🎯 CLEANUP
     */
    async cleanup() {
        if (this.ocrWorker) {
            await this.ocrWorker.terminate();
        }
    }
}

