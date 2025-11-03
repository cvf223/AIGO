import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDefaultAgentMemory } from '../agent/scripts/agent-memory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memoryDir = path.join(__dirname, '../agent/data/memory-storage');

function validateAndFixMemoryFiles() {
  const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.json'));
  let fixed = 0;
  for (const file of files) {
    const filePath = path.join(memoryDir, file);
    let valid = true;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      JSON.parse(raw);
    } catch (err) {
      valid = false;
      console.warn(`[FIX] Corrupted JSON in ${file}: ${err.message}`);
    }
    if (!valid) {
      // Backup corrupted file
      const backupPath = filePath + '.corrupt-' + Date.now();
      fs.copyFileSync(filePath, backupPath);
      console.log(`[FIX] Backed up corrupted file to ${backupPath}`);
      // Replace with default memory
      const defaultMemory = getDefaultAgentMemory();
      fs.writeFileSync(filePath, JSON.stringify(defaultMemory, null, 2));
      console.log(`[FIX] Replaced ${file} with fresh default agent memory.`);
      fixed++;
    }
  }
  if (fixed === 0) {
    console.log('All memory files are valid.');
  } else {
    console.log(`Fixed ${fixed} corrupted memory file(s).`);
  }
}

validateAndFixMemoryFiles(); 