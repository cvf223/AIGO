// Fix script for EliteMemoryPersistenceEngine.js
import fs from 'fs';

// Define the path to the file
const filePath = './src/memory/EliteMemoryPersistenceEngine.js';

// Read the original file
console.log('📝 Reading original file...');
const content = fs.readFileSync(filePath, 'utf8');

// Extract class definition content (up to the last closing brace)
const classEndPos = content.lastIndexOf('}');
const classContent = content.substring(0, classEndPos);

// Add the fixed coordinateCreativityMemoryManagement method and close the class
const fixedContent = classContent + ;

// Write the fixed content back to the file
console.log('✍️ Writing fixed content...');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ File fixed successfully!');
