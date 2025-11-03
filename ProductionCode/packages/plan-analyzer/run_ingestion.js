import { convertPdfToImages } from './src/ingest.js';
import { extractTextFromImage } from './src/ocr.js';
import path from 'path';
import fs from 'fs';

// This is a simple runner script to demonstrate the PDF ingestion and OCR functionality.

async function main() {
  const inputPdfDir = 'DOOcs/BaubplanAnalysis/';
  const outputImageDir = 'packages/plan-analyzer/output_images';
  
  // Using a specific file for the proof of concept
  const pdfFile = 'FB_AUS A_GR-01_A_230828.pdf';
  const pdfPath = path.join(inputPdfDir, pdfFile);
  const baseName = path.basename(pdfPath, '.pdf');

  console.log(`Starting proof of concept for ${pdfFile}...`);
  
  // Stage 1: Convert PDF to Images
  await convertPdfToImages(pdfPath, outputImageDir);
  console.log('--- PDF to Image Conversion Complete ---');

  // Stage 3a: Extract text from the first page
  const firstPageImagePath = path.join(outputImageDir, `${baseName}-1.png`);

  if (fs.existsSync(firstPageImagePath)) {
    console.log(`--- Starting OCR on ${firstPageImagePath} ---`);
    const ocrData = await extractTextFromImage(firstPageImagePath);
    
    console.log('--- OCR Complete ---');
    console.log('Sample of extracted text:');
    console.log(ocrData.text.substring(0, 1000) + '...');
    
    // Optionally, save the full OCR data for inspection
    const ocrOutputPath = path.join(outputImageDir, `${baseName}-1-ocr.json`);
    await fs.promises.writeFile(ocrOutputPath, JSON.stringify(ocrData, null, 2));
    console.log(`Full OCR data saved to: ${ocrOutputPath}`);

  } else {
    console.error(`Could not find the expected image file: ${firstPageImagePath}`);
  }

  console.log(`Proof of concept complete.`);
}

main().catch(console.error);
