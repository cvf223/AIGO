/**
 * @file run-integration-tests.js
 * @description Script to run all integration tests for the pretraining system
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test files to run
const testFiles = [
  'integration/pretraining-system-test.js',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Runs a single test file
 * @param {string} testFile - Path to test file
 * @returns {Promise<boolean>} - Whether the test passed
 */
function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`${colors.blue}Running test: ${testFile}${colors.reset}`);
    
    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ Test passed: ${testFile}${colors.reset}`);
        resolve(true);
      } else {
        console.error(`${colors.red}✗ Test failed: ${testFile}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

/**
 * Runs all integration tests
 */
async function runAllTests() {
  console.log(`${colors.cyan}=== Running Integration Tests ===${colors.reset}`);
  
  let passedCount = 0;
  let failedCount = 0;
  const failedTests = [];
  
  for (const testFile of testFiles) {
    const passed = await runTest(testFile);
    if (passed) {
      passedCount++;
    } else {
      failedCount++;
      failedTests.push(testFile);
    }
  }
  
  // Print summary
  console.log(`\n${colors.cyan}=== Test Summary ===${colors.reset}`);
  console.log(`Total tests: ${testFiles.length}`);
  console.log(`${colors.green}Passed: ${passedCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedCount}${colors.reset}`);
  
  if (failedCount > 0) {
    console.log(`\n${colors.red}Failed tests:${colors.reset}`);
    failedTests.forEach((test) => {
      console.log(`${colors.red}- ${test}${colors.reset}`);
    });
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Run the tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  process.exit(1);
});
