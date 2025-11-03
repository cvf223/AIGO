/**
 * @fileoverview Ingestion script for processing PDF construction plans.
 * This script will handle the conversion of PDF files to images using an
 * external command-line tool to avoid native dependency issues.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Renders a PDF file into a series of PNG images using the 'pdftocairo' command-line tool.
 *
 * NOTE: This function requires the 'poppler-utils' package to be installed on the system.
 * On macOS (using Homebrew): brew install poppler
 * On Debian/Ubuntu: sudo apt-get install poppler-utils
 *
 * @param {string} pdfPath The path to the input PDF file.
 * @param {string} outputDir The directory to save the output PNG files.
 */
export async function convertPdfToImages(pdfPath, outputDir) {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const outputPrefix = path.join(outputDir, path.basename(pdfPath, '.pdf'));

    // Command to convert all pages to PNG with high resolution
    const command = `pdftocairo -png -r 300 "${pdfPath}" "${outputPrefix}"`;

    console.log(`Executing command: ${command}`);

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn(`[pdftocairo stderr]: ${stderr}`);
    }
    console.log(`[pdftocairo stdout]: ${stdout}`);

    console.log(`PDF conversion complete for ${path.basename(pdfPath)}.`);
    console.log(`Please check the output directory: ${outputDir}`);

  } catch (error) {
    console.error(`Error processing PDF ${pdfPath}:`, error);
    console.error(`
      >>> IMPORTANT <<<
      This script requires the 'poppler-utils' package.
      Please make sure it is installed on your system.
      On macOS (using Homebrew): brew install poppler
      On Debian/Ubuntu: sudo apt-get install poppler-utils
    `);
    throw error;
  }
}
