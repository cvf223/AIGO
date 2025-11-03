/**
 * 📏 ENHANCED SCALE DETECTOR - Footer-Based Scale Detection
 * =========================================================
 * 
 * PRODUCTION CODE - Real OCR with focus on FOOTER (bottom right corner)
 * Implements Tesseract with German language support
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Scale Detection
 */

import Tesseract from 'tesseract.js';
import { createCanvas } from 'canvas';

export default class EnhancedScaleDetector {
    constructor() {
        this.config = {
            detectorName: 'ENHANCED_SCALE_DETECTOR',
            
            // FOOTER regions to search (bottom right corner priority!)
            footerRegions: [
                { 
                    name: 'bottom_right_corner', 
                    x: 0.75, y: 0.92, width: 0.23, height: 0.07,
                    priority: 1 
                },
                { 
                    name: 'bottom_right_extended', 
                    x: 0.70, y: 0.88, width: 0.28, height: 0.11,
                    priority: 2 
                },
                { 
                    name: 'footer_center', 
                    x: 0.40, y: 0.92, width: 0.20, height: 0.07,
                    priority: 3 
                },
                { 
                    name: 'footer_left', 
                    x: 0.02, y: 0.92, width: 0.20, height: 0.07,
                    priority: 4 
                }
            ],
            
            // German scale patterns (Maßstab)
            scalePatterns: [
                /(?:Maßstab|Massstab|M\.?)\s*[:=]?\s*1\s*[:]\s*(\d+)/i,
                /1\s*:\s*(\d+)/,
                /Scale\s*1\s*:\s*(\d+)/i,
                /M\s*1\s*:\s*(\d+)/i
            ],
            
            // Valid architectural scales
            validScales: [
                { notation: '1:5', ratio: 5 },
                { notation: '1:10', ratio: 10 },
                { notation: '1:20', ratio: 20 },
                { notation: '1:25', ratio: 25 },
                { notation: '1:50', ratio: 50 },
                { notation: '1:75', ratio: 75 },
                { notation: '1:100', ratio: 100 },
                { notation: '1:200', ratio: 200 },
                { notation: '1:500', ratio: 500 }
            ],
            
            ocr: {
                language: 'deu+eng',
                tessdata: '/usr/share/tesseract-ocr/4.00/tessdata'
            }
        };
        
        this.worker = null;
        this.initialized = false;
    }
    
    /**
     * 🚀 INITIALIZE WITH TESSERACT
     */
    async initialize() {
        console.log('📏 Initializing Enhanced Scale Detector...');
        console.log('   🎯 Focus: FOOTER regions (bottom right corner priority)');
        
        try {
            this.worker = await Tesseract.createWorker(this.config.ocr.language);
            
            await this.worker.setParameters({
                tessedit_char_whitelist: '0123456789:, MAßstabmaSscle',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
            });
            
            this.initialized = true;
            console.log('   ✅ Tesseract worker initialized');
            console.log('   🌍 Language: German + English');
            
        } catch (error) {
            console.warn('   ⚠️  Tesseract init failed:', error.message);
            console.log('   📐 Will use pattern-based fallback');
        }
    }
    
    /**
     * 📐 DETECT SCALE FROM PLAN (FOOTER PRIORITY)
     */
    async detectScaleFromPlan(planImage) {
        console.log('📐 Detecting scale from FOOTER...');
        
        // Try footer regions in priority order
        for (const region of this.config.footerRegions) {
            console.log(`   🔍 Searching ${region.name} (priority ${region.priority})...`);
            
            const regionCanvas = this.extractFooterRegion(planImage, region);
            const ocrResult = await this.performOCR(regionCanvas);
            
            if (ocrResult.text && ocrResult.confidence > 0.5) {
                const scale = this.parseScaleFromText(ocrResult.text);
                
                if (scale) {
                    const pixelsPerMM = this.calculatePixelsPerMM(planImage, scale.ratio);
                    
                    console.log(`   ✅ Scale found: ${scale.notation}`);
                    console.log(`   📍 Location: ${region.name}`);
                    console.log(`   📏 Conversion: ${pixelsPerMM.toFixed(4)} px/mm`);
                    console.log(`   ✅ OCR Confidence: ${(ocrResult.confidence * 100).toFixed(1)}%`);
                    
                    return {
                        notation: scale.notation,
                        ratio: scale.ratio,
                        pixelsPerMillimeter: pixelsPerMM,
                        confidence: ocrResult.confidence,
                        detectedIn: region.name,
                        ocrText: ocrResult.text,
                        method: 'ocr_footer'
                    };
                }
            }
        }
        
        // Fallback to default
        console.log('   ⚠️  Scale not found in footer, using default 1:50');
        
        return {
            notation: '1:50',
            ratio: 50,
            pixelsPerMillimeter: this.calculatePixelsPerMM(planImage, 50),
            confidence: 0.50,
            detectedIn: 'fallback',
            method: 'default'
        };
    }
    
    /**
     * 🖼️ EXTRACT FOOTER REGION
     */
    extractFooterRegion(planImage, region) {
        const x = Math.floor(planImage.width * region.x);
        const y = Math.floor(planImage.height * region.y);
        const width = Math.floor(planImage.width * region.width);
        const height = Math.floor(planImage.height * region.height);
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Draw the region
        ctx.drawImage(planImage, x, y, width, height, 0, 0, width, height);
        
        // Enhance contrast for better OCR
        const imageData = ctx.getImageData(0, 0, width, height);
        this.enhanceContrast(imageData);
        ctx.putImageData(imageData, 0, 0);
        
        return canvas;
    }
    
    /**
     * 🔤 PERFORM OCR
     */
    async performOCR(imageCanvas) {
        if (!this.initialized || !this.worker) {
            return { text: '', confidence: 0 };
        }
        
        try {
            const imageBuffer = imageCanvas.toBuffer('image/png');
            const { data } = await this.worker.recognize(imageBuffer);
            
            return {
                text: data.text.trim(),
                confidence: data.confidence / 100,
                words: data.words
            };
        } catch (error) {
            return { text: '', confidence: 0 };
        }
    }
    
    /**
     * 📝 PARSE SCALE FROM TEXT
     */
    parseScaleFromText(text) {
        for (const pattern of this.config.scalePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const ratio = parseInt(match[1]);
                
                // Validate against known scales
                const validScale = this.config.validScales.find(s => s.ratio === ratio);
                if (validScale) {
                    return validScale;
                } else if (ratio >= 5 && ratio <= 1000) {
                    return { notation: `1:${ratio}`, ratio };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 📏 CALCULATE PIXELS PER MILLIMETER
     */
    calculatePixelsPerMM(planImage, scaleRatio) {
        // Assume A3 plan at 300 DPI (standard for construction plans)
        const dpi = 300;
        const mmPerInch = 25.4;
        const pixelsPerMMOnPaper = dpi / mmPerInch;
        
        // Account for scale ratio
        return pixelsPerMMOnPaper / scaleRatio;
    }
    
    /**
     * 🎨 ENHANCE CONTRAST
     */
    enhanceContrast(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Increase contrast
            const enhanced = gray < 128 ? gray * 0.5 : 255 - ((255 - gray) * 0.5);
            
            data[i] = data[i + 1] = data[i + 2] = enhanced;
        }
    }
    
    /**
     * 🧹 CLEANUP
     */
    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
        }
    }
}
