/**
 * @fileoverview Runner script to build the construction world model from legend images.
 */

import { parseTextLegend, parseSymbolLegend } from './src/legend_parser.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const legendsDir = 'packages/plan-analyzer/training_data/legends';
  const outputModelPath = 'packages/plan-analyzer/construction_world_model.json';

  const worldModel = {
    abbreviations: {},
    symbols: [],
  };

  console.log('Starting Construction World Model build process...');

  try {
    const files = await fs.readdir(legendsDir);

    for (const file of files) {
      const filePath = path.join(legendsDir, file);

      if (file.startsWith('legend_text')) {
        console.log(`- Parsing text legend: ${file}`);
        const abbreviations = await parseTextLegend(filePath);
        Object.assign(worldModel.abbreviations, abbreviations);
      } else if (file.startsWith('legend_symbols')) {
        console.log(`- Parsing symbol legend: ${file}`);
        const symbols = await parseSymbolLegend(filePath);
        // Add new symbols, avoiding duplicates
        worldModel.symbols = [...new Set([...worldModel.symbols, ...symbols])];
      }
    }

    await fs.writeFile(outputModelPath, JSON.stringify(worldModel, null, 2));
    console.log('------------------------------------------');
    console.log(`✅ Construction World Model built successfully!`);
    console.log(`- Total Abbreviations: ${Object.keys(worldModel.abbreviations).length}`);
    console.log(`- Total Symbol Labels: ${worldModel.symbols.length}`);
    console.log(`- Model saved to: ${outputModelPath}`);
    console.log('------------------------------------------');

  } catch (error) {
    console.error('Error building the world model:', error);
  }
}

main();
