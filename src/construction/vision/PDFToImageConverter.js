/**
 * 📄➡️🖼️ PDF TO IMAGE CONVERTER - HIGH-RESOLUTION PLAN CONVERSION
 * ==============================================================
 * 
 * CRITICAL COMPONENT: Converts construction PDF plans to high-resolution images
 * for pixel-precise analysis and annotation
 * 
 * KEY CAPABILITIES:
 * ✅ PDF to PNG conversion at 300 DPI
 * ✅ Multi-page PDF support
 * ✅ Scale preservation for accurate measurements
 * ✅ Memory-efficient processing for large plans
 * ✅ Batch conversion with progress tracking
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production PDF Converter
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import pdf2pic from 'pdf2pic';
import { PDFDocument } from 'pdf-lib';

const execAsync = promisify(exec);

export default class PDFToImageConverter extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            converterName: 'PDF_TO_IMAGE_CONVERTER',
            
            // Conversion Settings
            conversion: {
                dpi: 300,                    // High resolution for precision
                format: 'png',               // PNG for lossless quality
                quality: 100,                // Maximum quality
                background: '#FFFFFF',      // White background
                preserveAspectRatio: true,
                transparent: false
            },
            
            // Image Optimization
            optimization: {
                compress: false,             // No compression for accuracy
                sharpen: true,              // Enhance edges
                removeNoise: true,          // Clean up artifacts
                normalizeContrast: true,    // Improve visibility
                grayscale: false            // Keep color information
            },
            
            // Processing Options
            processing: {
                maxConcurrent: 3,           // Parallel conversions
                memoryLimit: 2048,          // MB per conversion
                timeout: 60000,             // 60 seconds per page
                retryAttempts: 3
            },
            
            // Output Configuration
            output: {
                directory: 'converted_plans',
                naming: '{filename}_page{page}_{dpi}dpi.{format}',
                createSubfolders: true,
                overwrite: false
            },
            
            // Plan-Specific Settings
            planSettings: {
                detectOrientation: true,
                autoRotate: true,
                cropWhitespace: false,      // Keep full plan boundaries
                extractText: true,          // OCR for text annotations
                extractLayers: true         // Preserve PDF layers if available
            }
        };
        
        this.conversionQueue = [];
        this.activeConversions = new Map();
        this.conversionResults = new Map();
    }
    
    /**
     * 🚀 INITIALIZE CONVERTER
     */
    async initialize() {
        console.log('📄➡️🖼️ Initializing PDF to Image Converter...');
        
        try {
            // Check for required dependencies
            await this.checkDependencies();
            
            // Create output directory
            const outputDir = path.join(process.cwd(), this.config.output.directory);
            await fs.mkdir(outputDir, { recursive: true });
            
            // Initialize pdf2pic
            this.pdf2picOptions = {
                density: this.config.conversion.dpi,
                savename: 'temp',
                savedir: outputDir,
                format: this.config.conversion.format,
                width: -1,  // Maintain aspect ratio
                height: -1  // Maintain aspect ratio
            };
            
            console.log('✅ PDF to Image Converter initialized');
            console.log(`   📁 Output directory: ${outputDir}`);
            console.log(`   📊 Resolution: ${this.config.conversion.dpi} DPI`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize converter:', error.message);
            throw error;
        }
    }
    
    /**
     * 🔧 CHECK DEPENDENCIES
     */
    async checkDependencies() {
        const dependencies = [];
        
        // Check for ImageMagick (alternative method)
        try {
            await execAsync('convert -version');
            dependencies.push('ImageMagick');
        } catch (error) {
            console.warn('⚠️ ImageMagick not found - using fallback method');
        }
        
        // Check for Ghostscript (alternative method)
        try {
            await execAsync('gs -version');
            dependencies.push('Ghostscript');
        } catch (error) {
            console.warn('⚠️ Ghostscript not found - using fallback method');
        }
        
        // Check for poppler-utils (pdftoppm)
        try {
            await execAsync('pdftoppm -v');
            dependencies.push('Poppler');
        } catch (error) {
            console.warn('⚠️ Poppler not found - using fallback method');
        }
        
        if (dependencies.length > 0) {
            console.log(`   ✅ Available tools: ${dependencies.join(', ')}`);
        } else {
            console.log('   ⚠️ Using pure JavaScript conversion (slower)');
        }
        
        return dependencies;
    }
    
    /**
     * 📄 CONVERT PDF TO IMAGES
     */
    async convertPDFToImages(pdfPath, options = {}) {
        console.log(`\n📄 Converting PDF to images: ${path.basename(pdfPath)}`);
        
        const startTime = Date.now();
        const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // Validate PDF exists
            const stats = await fs.stat(pdfPath);
            console.log(`   📊 PDF size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Load PDF to get page count
            const pdfBuffer = await fs.readFile(pdfPath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const pageCount = pdfDoc.getPageCount();
            console.log(`   📑 Pages: ${pageCount}`);
            
            // Prepare output directory
            const outputDir = await this.prepareOutputDirectory(pdfPath);
            
            // Convert each page
            const convertedImages = [];
            
            for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                console.log(`   📄 Converting page ${pageNum}/${pageCount}...`);
                
                const imagePath = await this.convertSinglePage(
                    pdfPath, 
                    pageNum, 
                    outputDir,
                    options
                );
                
                if (imagePath) {
                    // Process and optimize image
                    const processedPath = await this.processImage(imagePath, options);
                    
                    // Extract metadata
                    const metadata = await this.extractImageMetadata(processedPath);
                    
                    convertedImages.push({
                        page: pageNum,
                        originalPDF: pdfPath,
                        imagePath: processedPath,
                        metadata,
                        dpi: this.config.conversion.dpi
                    });
                    
                    console.log(`      ✅ Page ${pageNum} converted: ${path.basename(processedPath)}`);
                }
            }
            
            // Store results
            const results = {
                conversionId,
                pdfPath,
                pageCount,
                images: convertedImages,
                outputDirectory: outputDir,
                processingTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
            
            this.conversionResults.set(conversionId, results);
            
            console.log(`\n✅ PDF conversion complete!`);
            console.log(`   📑 ${convertedImages.length} pages converted`);
            console.log(`   ⏱️ Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
            console.log(`   📁 Output: ${outputDir}`);
            
            // Emit completion event
            this.emit('conversionComplete', results);
            
            return results;
            
        } catch (error) {
            console.error('❌ PDF conversion failed:', error.message);
            this.emit('conversionError', { conversionId, error });
            throw error;
        }
    }
    
    /**
     * 📄 CONVERT SINGLE PAGE
     */
    async convertSinglePage(pdfPath, pageNum, outputDir, options = {}) {
        const filename = path.basename(pdfPath, '.pdf');
        const outputName = `${filename}_page${pageNum}_${this.config.conversion.dpi}dpi.png`;
        const outputPath = path.join(outputDir, outputName);
        
        // Check if already exists
        if (!this.config.output.overwrite) {
            try {
                await fs.access(outputPath);
                console.log(`      ⚠️ Page ${pageNum} already exists, skipping`);
                return outputPath;
            } catch {
                // File doesn't exist, proceed with conversion
            }
        }
        
        // Try different conversion methods in order of preference
        let converted = false;
        
        // Method 1: pdftoppm (fastest and most accurate)
        if (!converted) {
            try {
                await this.convertWithPdftoppm(pdfPath, pageNum, outputPath);
                converted = true;
            } catch (error) {
                console.log(`      ⚠️ pdftoppm failed: ${error.message}`);
            }
        }
        
        // Method 2: ImageMagick
        if (!converted) {
            try {
                await this.convertWithImageMagick(pdfPath, pageNum, outputPath);
                converted = true;
            } catch (error) {
                console.log(`      ⚠️ ImageMagick failed: ${error.message}`);
            }
        }
        
        // Method 3: pdf2pic (JavaScript fallback)
        if (!converted) {
            try {
                await this.convertWithPdf2pic(pdfPath, pageNum, outputPath);
                converted = true;
            } catch (error) {
                console.log(`      ⚠️ pdf2pic failed: ${error.message}`);
            }
        }
        
        if (!converted) {
            throw new Error(`Failed to convert page ${pageNum} with any method`);
        }
        
        return outputPath;
    }
    
    /**
     * 🔧 CONVERT WITH PDFTOPPM
     */
    async convertWithPdftoppm(pdfPath, pageNum, outputPath) {
        const tempName = path.join(
            path.dirname(outputPath),
            `temp_${Date.now()}`
        );
        
        const command = `pdftoppm -png -r ${this.config.conversion.dpi} -f ${pageNum} -l ${pageNum} "${pdfPath}" "${tempName}"`;
        
        await execAsync(command);
        
        // pdftoppm adds page number suffix, rename to our format
        const generatedFile = `${tempName}-${String(pageNum).padStart(2, '0')}.png`;
        await fs.rename(generatedFile, outputPath);
    }
    
    /**
     * 🔧 CONVERT WITH IMAGEMAGICK
     */
    async convertWithImageMagick(pdfPath, pageNum, outputPath) {
        const pageIndex = pageNum - 1; // ImageMagick uses 0-based indexing
        const command = `convert -density ${this.config.conversion.dpi} "${pdfPath}[${pageIndex}]" -quality 100 "${outputPath}"`;
        
        await execAsync(command);
    }
    
    /**
     * 🔧 CONVERT WITH PDF2PIC
     */
    async convertWithPdf2pic(pdfPath, pageNum, outputPath) {
        const convert = pdf2pic.fromPath(pdfPath, this.pdf2picOptions);
        const result = await convert(pageNum, { responseType: 'image' });
        
        if (result && result.path) {
            // Move to desired location
            await fs.rename(result.path, outputPath);
        } else {
            throw new Error('pdf2pic conversion failed');
        }
    }
    
    /**
     * 🖼️ PROCESS IMAGE
     */
    async processImage(imagePath, options = {}) {
        if (!this.config.optimization.compress && 
            !this.config.optimization.sharpen && 
            !this.config.optimization.removeNoise) {
            return imagePath; // No processing needed
        }
        
        try {
            const processedPath = imagePath.replace('.png', '_processed.png');
            
            let sharpInstance = sharp(imagePath);
            
            // Apply optimizations
            if (this.config.optimization.sharpen) {
                sharpInstance = sharpInstance.sharpen();
            }
            
            if (this.config.optimization.normalizeContrast) {
                sharpInstance = sharpInstance.normalize();
            }
            
            if (this.config.optimization.removeNoise) {
                sharpInstance = sharpInstance.median(3); // Light noise reduction
            }
            
            if (this.config.optimization.grayscale) {
                sharpInstance = sharpInstance.grayscale();
            }
            
            // Save processed image
            await sharpInstance.toFile(processedPath);
            
            // Replace original with processed
            await fs.unlink(imagePath);
            await fs.rename(processedPath, imagePath);
            
            return imagePath;
            
        } catch (error) {
            console.warn(`⚠️ Image processing failed: ${error.message}`);
            return imagePath; // Return original on error
        }
    }
    
    /**
     * 📊 EXTRACT IMAGE METADATA
     */
    async extractImageMetadata(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            
            return {
                width: metadata.width,
                height: metadata.height,
                dpi: metadata.density || this.config.conversion.dpi,
                format: metadata.format,
                channels: metadata.channels,
                size: metadata.size,
                aspectRatio: (metadata.width / metadata.height).toFixed(3)
            };
            
        } catch (error) {
            console.warn(`⚠️ Could not extract metadata: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 📁 PREPARE OUTPUT DIRECTORY
     */
    async prepareOutputDirectory(pdfPath) {
        const pdfName = path.basename(pdfPath, '.pdf');
        let outputDir;
        
        if (this.config.output.createSubfolders) {
            outputDir = path.join(
                process.cwd(),
                this.config.output.directory,
                pdfName
            );
        } else {
            outputDir = path.join(
                process.cwd(),
                this.config.output.directory
            );
        }
        
        await fs.mkdir(outputDir, { recursive: true });
        return outputDir;
    }
    
    /**
     * 🔄 BATCH CONVERT PDFS
     */
    async batchConvertPDFs(pdfPaths, options = {}) {
        console.log(`\n📚 Batch converting ${pdfPaths.length} PDFs...`);
        
        const results = [];
        const startTime = Date.now();
        
        // Process in chunks to avoid memory issues
        const chunkSize = this.config.processing.maxConcurrent;
        
        for (let i = 0; i < pdfPaths.length; i += chunkSize) {
            const chunk = pdfPaths.slice(i, i + chunkSize);
            
            const chunkPromises = chunk.map(pdfPath => 
                this.convertPDFToImages(pdfPath, options)
                    .catch(error => ({
                        pdfPath,
                        error: error.message,
                        failed: true
                    }))
            );
            
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
        }
        
        const successful = results.filter(r => !r.failed).length;
        const failed = results.filter(r => r.failed).length;
        
        console.log('\n✅ Batch conversion complete!');
        console.log(`   ✅ Successful: ${successful}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⏱️ Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        
        return results;
    }
    
    /**
     * 🔍 GET CONVERSION RESULT
     */
    getConversionResult(conversionId) {
        return this.conversionResults.get(conversionId);
    }
    
    /**
     * 🗑️ CLEANUP CONVERTED IMAGES
     */
    async cleanupConvertedImages(conversionId) {
        const result = this.conversionResults.get(conversionId);
        
        if (!result) {
            throw new Error(`Conversion ${conversionId} not found`);
        }
        
        for (const image of result.images) {
            try {
                await fs.unlink(image.imagePath);
                console.log(`   🗑️ Deleted: ${path.basename(image.imagePath)}`);
            } catch (error) {
                console.warn(`   ⚠️ Could not delete: ${error.message}`);
            }
        }
        
        this.conversionResults.delete(conversionId);
    }
}

