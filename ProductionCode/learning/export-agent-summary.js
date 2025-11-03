#!/usr/bin/env node
// agent/scripts/export-agent-summary.js
// Usage: node export-agent-summary.js <agentId> <outputPath>
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { loadMemory } from './agent-memory-utils.js';

const [,, agentId, outputPath] = process.argv;
if (!agentId) {
  console.error('Usage: node export-agent-summary.js <agentId> <outputPath>');
  process.exit(1);
}
console.log(`[Export] Starting PDF export for agent: ${agentId}`);
const memory = loadMemory(agentId);
if (!memory) {
  console.log(`[Export] No memory found for agent: ${agentId}`);
}
const doc = new PDFDocument();
const outPath = outputPath || `${agentId}-summary.pdf`;
console.log(`[Export] Writing PDF to: ${outPath}`);
doc.pipe(fs.createWriteStream(outPath));

doc.fontSize(20).text(`Agent Summary: ${agentId}`, { underline: true });
doc.moveDown();

doc.fontSize(14).text('Key Takeaways:', { bold: true });
const keyTakeaways = (memory.keyTakeaways || []).slice(-10);
if (keyTakeaways.length === 0) {
  doc.text('No memory available for this category.');
} else {
  keyTakeaways.forEach((k, i) => doc.text(`${i+1}. ${k}`));
}
doc.moveDown();

doc.fontSize(14).text('Discoveries:', { bold: true });
const discoveries = (memory.discoveries || []).slice(-10);
if (discoveries.length === 0) {
  doc.text('No memory available for this category.');
} else {
  discoveries.forEach((d, i) => doc.text(`${i+1}. ${d}`));
}
doc.moveDown();

doc.fontSize(14).text('Personal Knowledge Base:', { bold: true });
const pkb = (memory.personalKnowledgeBase || []).slice(-10);
if (pkb.length === 0) {
  doc.text('No memory available for this category.');
} else {
  pkb.forEach((k, i) => doc.text(`${i+1}. ${k}`));
}
doc.moveDown();

doc.fontSize(14).text('Reviewed Key Takeaways:', { bold: true });
const reviewed = (memory.reviewedKeyTakeaways || []).slice(-5);
if (reviewed.length === 0) {
  doc.text('No memory available for this category.');
} else {
  reviewed.forEach((r, i) => doc.text(`${i+1}. ${typeof r === 'string' ? r : JSON.stringify(r)}`));
}
doc.end();

console.log(`[Export] PDF export complete for agent: ${agentId}`);
console.log(`PDF summary exported to ${outPath}`); 