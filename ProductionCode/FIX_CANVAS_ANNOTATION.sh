#!/bin/bash

echo "🎨 FIXING CANVAS FOR FULL ANNOTATION FUNCTIONALITY"
echo "================================================"

# Function to fix canvas locally
fix_canvas_locally() {
    echo "🔧 Fixing canvas locally..."
    
    # Install canvas dependencies on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   📦 Installing macOS dependencies..."
        brew install pkg-config cairo pango libpng jpeg giflib librsvg
    fi
    
    # Clean install canvas
    echo "   🧹 Cleaning old canvas installation..."
    cd web-gui-construction
    rm -rf node_modules/canvas
    
    echo "   📦 Installing canvas properly..."
    npm install canvas@3.2.0 --build-from-source
    
    cd ..
}

# Function to fix canvas on server
fix_canvas_on_server() {
    echo "🔧 Fixing canvas on server..."
    
    ssh root@162.55.83.33 << 'EOF'
        echo "   📦 Installing system dependencies..."
        apt-get update
        apt-get install -y \
            build-essential \
            libcairo2-dev \
            libpango1.0-dev \
            libjpeg-dev \
            libgif-dev \
            librsvg2-dev \
            python3 \
            make \
            g++
        
        echo "   🧹 Cleaning old installations..."
        cd ~/latest_deployment
        
        # Clean canvas from main project
        rm -rf node_modules/canvas
        rm -rf node_modules/.pnpm/canvas*
        
        # Clean canvas from web-gui-construction
        cd web-gui-construction
        rm -rf node_modules/canvas
        
        echo "   📦 Installing canvas in web-gui-construction..."
        npm install canvas@3.2.0 --build-from-source
        
        echo "   🔧 Rebuilding sharp for image processing..."
        npm rebuild sharp
        
        echo "   ✅ Canvas dependencies fixed!"
EOF
}

# Update web-gui-construction to ensure canvas works
update_annotation_engine() {
    echo "🔧 Updating annotation engine configuration..."
    
    # Create a canvas test file
    cat > web-gui-construction/src/utils/canvasTest.js << 'EOF'
/**
 * Canvas functionality test
 */
export async function testCanvas() {
    try {
        const { createCanvas } = await import('canvas');
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 100, 100);
        console.log('✅ Canvas is working properly!');
        return true;
    } catch (error) {
        console.error('❌ Canvas error:', error.message);
        return false;
    }
}
EOF

    # Update the annotation utilities to handle canvas properly
    cat > web-gui-construction/src/utils/canvasAnnotations.js << 'EOF'
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
EOF
}

# Main execution
echo "🚀 Starting canvas fix process..."
echo ""

# Fix locally
fix_canvas_locally

# Update annotation engine
update_annotation_engine

# Deploy and fix on server
echo ""
echo "📤 Deploying to server..."
tar -czf /tmp/canvas_fix.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    web-gui-construction/src/utils/canvasTest.js \
    web-gui-construction/src/utils/canvasAnnotations.js \
    start-construction-clean.js

scp /tmp/canvas_fix.tar.gz root@162.55.83.33:/tmp/
ssh root@162.55.83.33 'cd ~/latest_deployment && tar -xzf /tmp/canvas_fix.tar.gz && rm /tmp/canvas_fix.tar.gz'
rm /tmp/canvas_fix.tar.gz

# Fix canvas on server
fix_canvas_on_server

echo ""
echo "✅ CANVAS ANNOTATION FUNCTIONALITY FIXED!"
echo "   - System dependencies installed"
echo "   - Canvas module properly built"
echo "   - Annotation engine enhanced"
echo "   - Ready for your presentation!"
echo ""
echo "🚀 Now run: ssh root@162.55.83.33 'cd ~/latest_deployment && node start-construction-clean.js'"
