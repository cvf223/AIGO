#!/usr/bin/env node

/**
 * Trigger Watcher Script
 * Watches agent/data/triggers/ for new trigger files and processes them.
 * Template: Agents should extend this to decide how to respond, store memory, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const triggersDir = path.join(__dirname, '../data/triggers');

if (!fs.existsSync(triggersDir)) fs.mkdirSync(triggersDir, { recursive: true });

console.log(`[TriggerWatcher] Watching for triggers in: ${triggersDir}`);

fs.watch(triggersDir, (eventType, filename) => {
  if (eventType === 'rename' && filename.endsWith('.json')) {
    const filePath = path.join(triggersDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const trigger = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`[TriggerWatcher] New trigger:`, trigger);
        // TODO: Agent logic goes here (respond, store memory, etc.)
        fs.unlinkSync(filePath); // Remove after processing
        console.log(`[TriggerWatcher] Processed and deleted: ${filename}`);
      } catch (err) {
        console.error(`[TriggerWatcher] Error processing trigger ${filename}:`, err);
      }
    }
  }
}); 