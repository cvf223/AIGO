/**
 * 📄 PDF PLAN PROCESSOR - Real PDF to Image Pipeline
 * =================================================
 */

import fs from 'fs/promises';
import { createCanvas, loadImage } from 'canvas';
import { fromPath } from 'pdf2pic';
import path from 'path';

export default class PDFPlanProcessor {
    constructor() {
        this.config = {
            conversion: {
                density: 300, // DPI
                format: 'png',
                width: 6000,
                height: 4500,
                savePath: './temp_plan_images'
            }
        };
    }
    
    async convertPDFToImage(pdfPath) {
        console.log(`   📄 Converting PDF to image...`);
        
        try {
            // Create temp directory
            await fs.mkdir(this.config.conversion.savePath, { recursive: true });
            
            const options = {
                density: this.config.conversion.density,
                saveFilename: path.basename(pdfPath, '.pdf'),
                savePath: this.config.conversion.savePath,
                format: this.config.conversion.format,
                width: this.config.conversion.width,
                height: this.config.conversion.height
            };
            
            const convert = fromPath(pdfPath, options);
            const pageToConvertAsImage = 1;
            
            const result = await convert(pageToConvertAsImage, {bulk: false});
            
            if (result && result.path) {
                console.log(`      ✅ Converted to: ${result.path}`);
                return result.path;
            }
            
        } catch (error) {
            console.warn(`      ⚠️  PDF conversion failed: ${error.message}`);
        }
        
        // Fallback: Try to load PDF directly as image (for already-converted files)
        return pdfPath;
    }
    
    async loadPlanImage(imagePath) {
        try {
            const image = await loadImage(imagePath);
            console.log(`      ✅ Image loaded: ${image.width}×${image.height}`);
            return image;
        } catch (error) {
            console.error(`      ❌ Failed to load image: ${error.message}`);
            throw error;
        }
    }
}
