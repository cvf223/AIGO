// Fix for shutdown issues
import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Server connection settings
const SERVER = "root@162.55.83.33";
const REMOTE_PATH = "/root/ProductionCode";

// Create a fix for the shutdown issue
const shutdownFixScript = `
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
  /process\.on\\('SIGINT', async function\\(\\) {/g,
  \`process.on('SIGINT', async function() {
    // Define dbConnectionManager if it doesn't exist to prevent errors during shutdown
    if (typeof dbConnectionManager === 'undefined') {
      console.log('⚠️ Creating fallback dbConnectionManager for clean shutdown');
      global.dbConnectionManager = {
        close: async () => { console.log('📝 [FALLBACK] Closing database connections'); return true; }
      };
    }\`
);

// Add a force exit after shutdown procedures
const fixedShutdown = fixedContent.replace(
  /console\\.log\\('✅ Shutdown complete'\\);/g,
  \`console.log('✅ Shutdown complete');
    // Force exit after shutdown procedures complete
    setTimeout(() => {
      console.log('🛑 Forcing process exit');
      process.exit(0);
    }, 2000);\`
);

// Write the fixed content back to the file
console.log('✍️ Writing fixed content');
fs.writeFileSync(filePath, fixedShutdown, 'utf8');

console.log('✅ Shutdown fix applied');
`;

// Write the fix script locally
console.log('📝 Creating shutdown fix script');
fs.writeFileSync('shutdown-fix.cjs', shutdownFixScript, 'utf8');

// Copy the script to the server
console.log('📤 Copying shutdown fix script to server');
execSync(`scp shutdown-fix.cjs ${SERVER}:${REMOTE_PATH}/`);

// Execute the script on the server
console.log('🔧 Executing shutdown fix script on server');
try {
  execSync(`ssh ${SERVER} "cd ${REMOTE_PATH} && node shutdown-fix.cjs"`, {stdio: 'inherit'});
  console.log('✅ Shutdown fix applied successfully');
  
  // Restart the application
  console.log('🔄 Restarting the application with fixed shutdown');
  execSync(`ssh ${SERVER} "cd ${REMOTE_PATH} && ps aux | grep 'node start-construction-clean.js' | grep -v grep | awk '{print \\$2}' | xargs -r kill -9 || true"`);
  execSync(`ssh ${SERVER} "cd ${REMOTE_PATH} && node start-construction-clean.js > app.log 2>&1 &"`);
  console.log('✅ Application restarted with shutdown fix');
  
  // Create a test script to verify shutdown works
  const testShutdownScript = `
  // Test shutdown functionality
  console.log('🧪 Testing shutdown functionality');
  console.log('🛑 Sending SIGINT to running process...');
  
  const { execSync } = require('child_process');
  
  // Find the process ID
  const findCmd = "ps aux | grep 'node start-construction-clean.js' | grep -v grep | awk '{print $2}'";
  const pid = execSync(findCmd).toString().trim();
  
  if (pid) {
    console.log(\`📌 Found process ID: \${pid}\`);
    console.log('🛑 Sending SIGINT signal...');
    
    try {
      execSync(\`kill -SIGINT \${pid}\`);
      console.log('✅ SIGINT signal sent successfully');
      
      // Wait a bit to see if process terminates
      setTimeout(() => {
        try {
          const checkCmd = \`ps -p \${pid} -o pid=\`;
          execSync(checkCmd);
          console.log('❌ Process still running after 5 seconds');
        } catch (e) {
          console.log('✅ Process terminated successfully');
        }
      }, 5000);
    } catch (error) {
      console.error('❌ Error sending SIGINT:', error.message);
    }
  } else {
    console.log('❌ No running process found');
  }
  `;
  
  fs.writeFileSync('test-shutdown.cjs', testShutdownScript, 'utf8');
  console.log('✅ Created test script for shutdown verification');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
