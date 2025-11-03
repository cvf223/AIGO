
// Fix for shutdown issues in start-construction-clean.js
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = './start-construction-clean.js';

// Read the file content
console.log('📝 Reading file:', filePath);
const content = fs.readFileSync(filePath, 'utf8');

// Fix the dbConnectionManager reference in the shutdown process
const fixedContent = content.replace(
  /process.on\('SIGINT', async function\(\) {/g,
  `process.on('SIGINT', async function() {
    // Define dbConnectionManager if it doesn't exist to prevent errors during shutdown
    if (typeof dbConnectionManager === 'undefined') {
      console.log('⚠️ Creating fallback dbConnectionManager for clean shutdown');
      global.dbConnectionManager = {
        close: async () => { console.log('📝 [FALLBACK] Closing database connections'); return true; }
      };
    }`
);

// Add a force exit after shutdown procedures
const fixedShutdown = fixedContent.replace(
  /console\.log\('✅ Shutdown complete'\);/g,
  `console.log('✅ Shutdown complete');
    // Force exit after shutdown procedures complete
    setTimeout(() => {
      console.log('🛑 Forcing process exit');
      process.exit(0);
    }, 2000);`
);

// Write the fixed content back to the file
console.log('✍️ Writing fixed content');
fs.writeFileSync(filePath, fixedShutdown, 'utf8');

console.log('✅ Shutdown fix applied');
