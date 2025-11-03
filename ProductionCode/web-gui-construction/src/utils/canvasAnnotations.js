/**
 * Enhanced Canvas Annotations for Construction Plans
 */
import { createCanvas, loadImage } from 'canvas';

export class CanvasAnnotationEngine {
    constructor() {
        this.colors = {
            compliance: '#00ff00',
            error: '#ff0000',
            warning: '#ffaa00',
            info: '#0099ff',
            dimension: '#ff00ff'
        };
    }
    
    async annotateConstructionPlan(imagePath, annotations) {
        try {
            // Load the plan image
            const img = await loadImage(imagePath);
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            
            // Draw the original image
            ctx.drawImage(img, 0, 0);
            
            // Apply annotations
            for (const annotation of annotations) {
                await this.drawAnnotation(ctx, annotation);
            }
            
            // Return annotated image buffer
            return canvas.toBuffer('image/png');
        } catch (error) {
            console.error('Annotation error:', error);
            throw error;
        }
    }
    
    async drawAnnotation(ctx, annotation) {
        const { type, x, y, width, height, text, color } = annotation;
        
        ctx.strokeStyle = color || this.colors[type] || '#ffffff';
        ctx.lineWidth = 3;
        ctx.font = '16px Arial';
        
        // Draw bounding box
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        if (text) {
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = 20;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x, y - textHeight - 5, textWidth + 10, textHeight + 5);
            
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(text, x + 5, y - 8);
        }
    }
}

// Export singleton instance
export const annotationEngine = new CanvasAnnotationEngine();
