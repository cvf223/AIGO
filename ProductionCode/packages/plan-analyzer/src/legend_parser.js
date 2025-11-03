/**
 * @fileoverview Parses legend images to create a structured world model.
 */

import { extractTextFromImage } from './ocr.js';

/**
 * Parses a text-based legend image (like legend_text.png).
 * Assumes a format of "ABBREVIATION Full Text Description" on each line.
 *
 * @param {string} imagePath The path to the text legend image.
 * @returns {Promise<object>} A promise that resolves to a key-value map of abbreviations.
 */
export async function parseTextLegend(imagePath) {
  const ocrData = await extractTextFromImage(imagePath);
  const legend = {};

  // Process each line of the OCR output
  for (const line of ocrData.lines) {
    const text = line.text.trim();
    if (!text) continue;

    const parts = text.split(/\s+/);
    if (parts.length >= 2) {
      const key = parts[0];
      const value = parts.slice(1).join(' ');
      // A simple check to avoid parsing random noise as a key
      if (key.length <= 5 && key.toUpperCase() === key) {
        legend[key] = value;
      }
    }
  }

  return legend;
}

/**
 * Parses a symbol-based legend image (like legend_symbols.png).
 * This is a more complex task and will start by just extracting the text labels.
 *
 * @param {string} imagePath The path to the symbol legend image.
 * @returns {Promise<Array<string>>} A promise that resolves to a list of symbol labels.
 */
export async function parseSymbolLegend(imagePath) {
  const ocrData = await extractTextFromImage(imagePath);
  const labels = [];

  // For now, we will extract all meaningful lines of text as potential labels.
  // The association with the actual symbol graphic will come later.
  for (const line of ocrData.lines) {
    const text = line.text.trim();
    // Filter out noise and very short, likely incorrect, OCR results
    if (text && text.length > 2) {
      labels.push(text);
    }
  }
  return labels;
}


