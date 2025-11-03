#!/usr/bin/env node

/**
 * This script detects circular dependencies in the codebase
 * and exits with an error if any are found.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function detectCircularDependencies(targetPath) {
  console.log(`Checking for circular dependencies in ${targetPath}...`);
  
  try {
    // Run madge to detect circular dependencies
    const result = execSync(`npx madge --circular --json ${targetPath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse the JSON output
    const circularDeps = JSON.parse(result);
    
    // If there are circular dependencies, print them and exit with error
    if (circularDeps && Object.keys(circularDeps).length > 0) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Circular dependencies detected:');
      
      Object.entries(circularDeps).forEach(([key, value]) => {
        console.error(`\x1b[33m${key}\x1b[0m depends on:`);
        value.forEach(dep => {
          console.error(`  - \x1b[33m${dep}\x1b[0m`);
        });
      });
      
      console.error('\nCircular dependencies must be resolved before building.');
      process.exit(1);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ No circular dependencies found.');
      return true;
    }
  } catch (error) {
    if (error.stderr && error.stderr.includes('circular')) {
      // Madge found circular dependencies in its error output
      console.error('\x1b[31m%s\x1b[0m', '❌ Circular dependencies detected:');
      console.error(error.stderr);
      process.exit(1);
    } else {
      console.error('\x1b[31m%s\x1b[0m', '❌ Error checking for circular dependencies:');
      console.error(error.message || error);
      process.exit(1);
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const targetPath = args[0] || '.';

detectCircularDependencies(targetPath); 