/**
 * @fileoverview OCR processing script for extracting text from plan images.
 */

import Tesseract from 'tesseract.js';

/**
 * Extracts detailed text data (including position) from an image using Tesseract.js.
 *
 * @param {string} imagePath The path to the input image file.
 * @returns {Promise<object>} A promise that resolves to the detailed OCR data from Tesseract.
 */
export async function extractTextFromImage(imagePath) {
  console.log(`Starting OCR process for ${imagePath}...`);

  const worker = await Tesseract.createWorker('eng+deu');

  try {
    const { data } = await worker.recognize(imagePath);
    console.log(`OCR process completed for ${imagePath}.`);
    return data;
  } catch (error) {
    console.error(`Error during OCR processing for ${imagePath}:`, error);
    throw error;
  } finally {
    await worker.terminate();
    console.log('Tesseract worker terminated.');
  }
}
