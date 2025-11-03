#!/usr/bin/env node

/**
 * 🎨 CREATE TEST PLAN IMAGE
 * ========================
 * 
 * Creates a synthetic construction plan image for testing
 * the VLM Sequential Legend Analyzer
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🏗️ CREATE SYNTHETIC CONSTRUCTION PLAN
 */
async function createTestPlan() {
    console.log('🎨 Creating synthetic construction plan for testing...');
    
    // Create canvas (A3 size at 300 DPI)
    const width = 3508;  // A3 width in pixels at 300 DPI
    const height = 2480; // A3 height in pixels at 300 DPI
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Title block (top)
    ctx.fillStyle = 'black';
    ctx.font = 'bold 60px Arial';
    ctx.fillText('ERDGESCHOSS GRUNDRISS', 100, 100);
    ctx.font = '40px Arial';
    ctx.fillText('Projekt: Testgebäude Frankfurt', 100, 160);
    ctx.fillText('Maßstab 1:100', 100, 210);
    
    // Draw building outline (simplified floor plan)
    const buildingX = 400;
    const buildingY = 400;
    const buildingWidth = 2000;
    const buildingHeight = 1400;
    
    // Outer walls (thick lines)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 20;
    ctx.strokeRect(buildingX, buildingY, buildingWidth, buildingHeight);
    
    // Interior walls (medium lines)
    ctx.lineWidth = 15;
    // Vertical wall
    ctx.beginPath();
    ctx.moveTo(buildingX + buildingWidth/2, buildingY);
    ctx.lineTo(buildingX + buildingWidth/2, buildingY + buildingHeight);
    ctx.stroke();
    
    // Horizontal wall
    ctx.beginPath();
    ctx.moveTo(buildingX, buildingY + buildingHeight/2);
    ctx.lineTo(buildingX + buildingWidth, buildingY + buildingHeight/2);
    ctx.stroke();
    
    // Add some doors (openings in walls)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 25;
    // Door 1
    ctx.beginPath();
    ctx.moveTo(buildingX + 300, buildingY - 5);
    ctx.lineTo(buildingX + 400, buildingY - 5);
    ctx.stroke();
    
    // Door 2
    ctx.beginPath();
    ctx.moveTo(buildingX + buildingWidth/2 - 50, buildingY + buildingHeight/2 - 5);
    ctx.lineTo(buildingX + buildingWidth/2 + 50, buildingY + buildingHeight/2 - 5);
    ctx.stroke();
    
    // Add windows
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 8;
    // Window 1
    ctx.strokeRect(buildingX - 10, buildingY + 200, 30, 150);
    // Window 2
    ctx.strokeRect(buildingX - 10, buildingY + 500, 30, 150);
    
    // Draw legend (bottom-right corner)
    const legendX = width - 800;
    const legendY = height - 600;
    const legendWidth = 700;
    const legendHeight = 500;
    
    // Legend border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Legend title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('LEGENDE', legendX + 20, legendY + 40);
    
    // Legend items
    ctx.font = '24px Arial';
    let yPos = legendY + 80;
    
    // Wall patterns
    const patterns = [
        { type: 'line', width: 20, label: 'Stahlbeton' },
        { type: 'line', width: 15, label: 'MW KS 2.0' },
        { type: 'dashed', width: 10, label: 'Trockenbau' },
        { type: 'dots', width: 8, label: 'Dämmung' },
        { type: 'cross', width: 12, label: 'WD (Wanddurchbruch)' }
    ];
    
    for (const pattern of patterns) {
        // Draw pattern sample
        ctx.save();
        
        if (pattern.type === 'line') {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = pattern.width;
            ctx.beginPath();
            ctx.moveTo(legendX + 30, yPos);
            ctx.lineTo(legendX + 100, yPos);
            ctx.stroke();
        } else if (pattern.type === 'dashed') {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = pattern.width;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(legendX + 30, yPos);
            ctx.lineTo(legendX + 100, yPos);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (pattern.type === 'dots') {
            ctx.fillStyle = 'gray';
            for (let x = legendX + 30; x < legendX + 100; x += 15) {
                ctx.beginPath();
                ctx.arc(x, yPos, pattern.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern.type === 'cross') {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            const crossX = legendX + 65;
            ctx.beginPath();
            ctx.moveTo(crossX - 20, yPos - 20);
            ctx.lineTo(crossX + 20, yPos + 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(crossX - 20, yPos + 20);
            ctx.lineTo(crossX + 20, yPos - 20);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw label
        ctx.fillStyle = 'black';
        ctx.fillText(pattern.label, legendX + 130, yPos + 5);
        
        yPos += 60;
    }
    
    // Add dimensions
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'blue';
    
    // Horizontal dimension line
    ctx.beginPath();
    ctx.moveTo(buildingX, buildingY - 50);
    ctx.lineTo(buildingX + buildingWidth, buildingY - 50);
    ctx.stroke();
    
    // Dimension arrows
    ctx.beginPath();
    ctx.moveTo(buildingX, buildingY - 55);
    ctx.lineTo(buildingX, buildingY - 45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(buildingX + buildingWidth, buildingY - 55);
    ctx.lineTo(buildingX + buildingWidth, buildingY - 45);
    ctx.stroke();
    
    // Dimension text
    ctx.fillText('20.00 m', buildingX + buildingWidth/2 - 40, buildingY - 60);
    
    // Vertical dimension line
    ctx.beginPath();
    ctx.moveTo(buildingX - 50, buildingY);
    ctx.lineTo(buildingX - 50, buildingY + buildingHeight);
    ctx.stroke();
    
    // Dimension arrows
    ctx.beginPath();
    ctx.moveTo(buildingX - 55, buildingY);
    ctx.lineTo(buildingX - 45, buildingY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(buildingX - 55, buildingY + buildingHeight);
    ctx.lineTo(buildingX - 45, buildingY + buildingHeight);
    ctx.stroke();
    
    // Dimension text
    ctx.save();
    ctx.translate(buildingX - 70, buildingY + buildingHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('14.00 m', -30, 0);
    ctx.restore();
    
    // Add room labels
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('RAUM 1', buildingX + 200, buildingY + 300);
    ctx.fillText('RAUM 2', buildingX + buildingWidth/2 + 200, buildingY + 300);
    ctx.fillText('RAUM 3', buildingX + 200, buildingY + buildingHeight/2 + 300);
    ctx.fillText('RAUM 4', buildingX + buildingWidth/2 + 200, buildingY + buildingHeight/2 + 300);
    
    // Add footer with scale
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Maßstab: 1:100', 100, height - 100);
    ctx.fillText('Datum: 23.10.2025', 400, height - 100);
    ctx.fillText('Plan Nr: EG-001', 700, height - 100);
    
    // Add some hatching patterns to make it more realistic
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    
    // Hatch pattern in walls (simplified)
    for (let i = 0; i < 20; i++) {
        const offset = i * 10;
        // Top wall hatching
        ctx.beginPath();
        ctx.moveTo(buildingX + offset, buildingY);
        ctx.lineTo(buildingX + offset + 10, buildingY + 20);
        ctx.stroke();
    }
    
    // Save the image
    const outputDir = path.join(__dirname, 'test_plan_images');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'synthetic_plan.png');
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Test plan created: ${outputPath}`);
    console.log(`   Dimensions: ${width}×${height} pixels`);
    console.log(`   Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    return outputPath;
}

// Run
createTestPlan().catch(console.error);
