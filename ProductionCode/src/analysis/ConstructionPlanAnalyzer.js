import sharp from 'sharp';
// 🌌 SUPERIOR SOLUTION: Use QuantumTensorEngine instead of TensorFlow!
import tf from '../quantum/TensorFlowCompatibilityLayer.js';
// OpenCV disabled (not needed for initial deployment)
// import cv from '@u4/opencv4nodejs';
import { createCanvas, loadImage } from 'canvas';

export class ConstructionPlanAnalyzer {
  constructor(config = {}) {
    this.config = {
      // Color detection thresholds (BGR format for OpenCV)
      wireColors: {
        'CAT7_BLUE': { lower: [100, 50, 50], upper: [130, 255, 255] },
        'POWER_ORANGE': { lower: [5, 100, 100], upper: [25, 255, 255] },
        'JUNCTION_PURPLE': { lower: [140, 50, 50], upper: [170, 255, 255] }
      },
      // Component detection patterns
      symbolPatterns: {
        'OUTLET': { shape: 'circle', size: [15, 25] },
        'SWITCH': { shape: 'rectangle', size: [20, 30] },
        'JUNCTION_BOX': { shape: 'square', size: [25, 35] }
      },
      // Scale detection
      scaleIndicators: /(\d+)\s*(m|meter|cm)/gi,
      ...config
    };
    
    this.model = null;
    this.trainingData = [];
  }

  /**
   * 🎯 Main analysis method
   */
  async analyzePlan(imagePath) {
    console.log(`📐 Analyzing construction plan: ${imagePath}`);
    
    try {
      // 1. Load and preprocess image
      const image = await cv.imreadAsync(imagePath);
      const processedImage = await this.preprocessImage(image);
      
      // 2. Detect scale from plan
      const scale = await this.detectScale(processedImage);
      console.log(`📏 Detected scale: ${scale.ratio} pixels per meter`);
      
      // 3. Extract wire paths by color
      const wirePaths = await this.extractWirePaths(processedImage);
      
      // 4. Detect components/symbols
      const components = await this.detectComponents(processedImage);
      
      // 5. Calculate quantities
      const billOfMaterials = await this.calculateBOM(wirePaths, components, scale);
      
      // 6. Apply ML corrections if model is trained
      if (this.model) {
        billOfMaterials = await this.applyMLCorrections(billOfMaterials, processedImage);
      }
      
      return {
        success: true,
        imagePath,
        scale,
        wirePaths,
        components,
        billOfMaterials,
        confidence: this.calculateConfidence(wirePaths, components)
      };
      
    } catch (error) {
      console.error('❌ Plan analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🖼️ Preprocess image for analysis
   */
  async preprocessImage(image) {
    // Convert to HSV for better color detection
    const hsv = await image.cvtColorAsync(cv.COLOR_BGR2HSV);
    
    // Denoise
    const denoised = await hsv.medianBlurAsync(5);
    
    // Enhance contrast
    const enhanced = await denoised.equalizeHistAsync();
    
    return enhanced;
  }

  /**
   * 📏 Detect scale from plan annotations
   */
  async detectScale(image) {
    // Use OCR to find scale indicators
    const text = await this.extractText(image);
    const scaleMatches = text.match(this.config.scaleIndicators);
    
    if (scaleMatches && scaleMatches.length > 0) {
      // Parse the scale (e.g., "21m")
      const match = scaleMatches[0];
      const value = parseFloat(match.match(/\d+/)[0]);
      const unit = match.match(/[a-z]+/i)[0].toLowerCase();
      
      // Measure the line length in pixels associated with this scale
      const lineLength = await this.measureScaleLine(image, match);
      
      const metersValue = unit === 'cm' ? value / 100 : value;
      const pixelsPerMeter = lineLength / metersValue;
      
      return {
        ratio: pixelsPerMeter,
        unit: 'meter',
        confidence: 0.9
      };
    }
    
    // Fallback: estimate from standard door width (usually 90cm)
    const doorWidth = await this.detectStandardDoor(image);
    if (doorWidth) {
      return {
        ratio: doorWidth / 0.9, // 90cm standard door
        unit: 'meter',
        confidence: 0.7
      };
    }
    
    // Default assumption
    return {
      ratio: 50, // 50 pixels per meter
      unit: 'meter',
      confidence: 0.5
    };
  }

  /**
   * 🔌 Extract wire paths by color
   */
  async extractWirePaths(image) {
    const paths = {};
    
    for (const [wireType, colorRange] of Object.entries(this.config.wireColors)) {
      // Create mask for specific color
      const mask = await image.inRangeAsync(
        new cv.Vec3(...colorRange.lower),
        new cv.Vec3(...colorRange.upper)
      );
      
      // Find contours (wire paths)
      const contours = await mask.findContoursAsync(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      
      // Analyze each contour
      const wirePaths = [];
      for (const contour of contours) {
        const length = cv.arcLength(contour, false);
        
        // Filter noise (too small contours)
        if (length < 50) continue;
        
        // Approximate path to reduce points
        const approx = contour.approxPolyDP(3, false);
        
        // Calculate path segments
        const segments = [];
        for (let i = 0; i < approx.length - 1; i++) {
          segments.push({
            start: approx[i],
            end: approx[i + 1],
            length: this.calculateDistance(approx[i], approx[i + 1])
          });
        }
        
        wirePaths.push({
          type: wireType,
          contour: approx,
          segments,
          totalLength: length,
          boundingBox: contour.boundingRect()
        });
      }
      
      paths[wireType] = wirePaths;
    }
    
    return paths;
  }

  /**
   * 🔲 Detect electrical components
   */
  async detectComponents(image) {
    const components = [];
    
    // Convert to grayscale for shape detection
    const gray = await image.cvtColorAsync(cv.COLOR_HSV2GRAY);
    
    // Detect circles (outlets, junction boxes)
    const circles = await gray.houghCirclesAsync(
      cv.HOUGH_GRADIENT,
      1, // dp
      20, // minDist
      50, // param1
      30, // param2
      10, // minRadius
      30  // maxRadius
    );
    
    // Classify circles based on color at center
    for (const circle of circles) {
      const [x, y, radius] = circle;
      const color = await this.getColorAtPoint(image, x, y);
      
      const component = {
        type: this.classifyComponentByColor(color),
        position: { x, y },
        radius,
        shape: 'circle'
      };
      
      components.push(component);
    }
    
    // Detect rectangles (switches, panels)
    const rectangles = await this.detectRectangles(gray);
    components.push(...rectangles);
    
    return components;
  }

  /**
   * 📊 Calculate Bill of Materials
   */
  async calculateBOM(wirePaths, components, scale) {
    const bom = {
      wires: {},
      components: {},
      summary: {
        totalWireLength: 0,
        totalComponents: 0
      }
    };
    
    // Calculate wire quantities
    for (const [wireType, paths] of Object.entries(wirePaths)) {
      let totalLength = 0;
      
      for (const path of paths) {
        // Convert pixels to meters
        totalLength += path.totalLength / scale.ratio;
      }
      
      // Add safety margin (typically 10-15%)
      const safetyMargin = 1.15;
      totalLength *= safetyMargin;
      
      bom.wires[wireType] = {
        description: this.getWireDescription(wireType),
        quantity: Math.ceil(totalLength),
        unit: 'meters',
        segments: paths.length
      };
      
      bom.summary.totalWireLength += totalLength;
    }
    
    // Count components
    const componentCounts = {};
    for (const component of components) {
      componentCounts[component.type] = (componentCounts[component.type] || 0) + 1;
    }
    
    for (const [type, count] of Object.entries(componentCounts)) {
      bom.components[type] = {
        description: this.getComponentDescription(type),
        quantity: count,
        unit: 'pieces'
      };
      
      bom.summary.totalComponents += count;
    }
    
    return bom;
  }

  /**
   * 🧠 Train the model with your data
   */
  async trainModel(trainingDataPath) {
    console.log('🧠 Training construction plan analyzer...');
    
    // Load training data (plan images + expected BOMs)
    const trainingData = await this.loadTrainingData(trainingDataPath);
    
    // Create feature extraction pipeline
    const features = [];
    const labels = [];
    
    for (const sample of trainingData) {
      // Extract features from plan
      const planFeatures = await this.extractFeatures(sample.imagePath);
      features.push(planFeatures);
      
      // Expected BOM as labels
      labels.push(sample.expectedBOM);
    }
    
    // Build neural network
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [features[0].length], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: labels[0].length, activation: 'linear' })
      ]
    });
    
    // Compile model
    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
    
    // Train
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
        }
      }
    });
    
    console.log('✅ Model trained successfully!');
    
    // Save model
    await this.model.save('file://./models/construction-plan-analyzer');
  }

  /**
   * 🎯 Extract features for ML
   */
  async extractFeatures(imagePath) {
    const image = await cv.imreadAsync(imagePath);
    const features = [];
    
    // Color histogram features
    const hist = await this.calculateColorHistogram(image);
    features.push(...hist);
    
    // Edge density features
    const edgeDensity = await this.calculateEdgeDensity(image);
    features.push(edgeDensity);
    
    // Shape statistics
    const shapeStats = await this.calculateShapeStatistics(image);
    features.push(...shapeStats);
    
    // Texture features
    const textureFeatures = await this.calculateTextureFeatures(image);
    features.push(...textureFeatures);
    
    return features;
  }

  /**
   * 🔧 Helper methods
   */
  calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getWireDescription(wireType) {
    const descriptions = {
      'CAT7_BLUE': 'CAT7 UTP Network Cable',
      'POWER_ORANGE': 'Power Distribution Cable',
      'JUNCTION_PURPLE': 'Control/Signal Cable'
    };
    return descriptions[wireType] || wireType;
  }

  getComponentDescription(componentType) {
    const descriptions = {
      'OUTLET': 'Network/Power Outlet',
      'SWITCH': 'Switch/Distribution Box',
      'JUNCTION_BOX': 'Junction Box',
      'FIRE_SENSOR': 'Fire Protection Sensor'
    };
    return descriptions[componentType] || componentType;
  }

  calculateConfidence(wirePaths, components) {
    // Base confidence on detection quality
    let confidence = 0.5;
    
    // More detected elements = higher confidence
    const totalWires = Object.values(wirePaths).flat().length;
    const totalComponents = components.length;
    
    if (totalWires > 10) confidence += 0.2;
    if (totalComponents > 5) confidence += 0.2;
    
    // Check for reasonable ratios
    const ratio = totalComponents / Math.max(totalWires, 1);
    if (ratio > 0.1 && ratio < 2) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}

// 🚀 Example usage
export async function analyzeConstructionPlan(planPath, options = {}) {
  const analyzer = new ConstructionPlanAnalyzer(options);
  
  // Train if training data available
  if (options.trainingDataPath) {
    await analyzer.trainModel(options.trainingDataPath);
  }
  
  // Analyze plan
  const result = await analyzer.analyzePlan(planPath);
  
  if (result.success) {
    console.log('\n📋 BILL OF MATERIALS:');
    console.log('=====================================');
    
    console.log('\n🔌 WIRING:');
    for (const [type, details] of Object.entries(result.billOfMaterials.wires)) {
      console.log(`${details.description}: ${details.quantity} ${details.unit}`);
    }
    
    console.log('\n🔲 COMPONENTS:');
    for (const [type, details] of Object.entries(result.billOfMaterials.components)) {
      console.log(`${details.description}: ${details.quantity} ${details.unit}`);
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total Wire Length: ${result.billOfMaterials.summary.totalWireLength.toFixed(1)} meters`);
    console.log(`Total Components: ${result.billOfMaterials.summary.totalComponents} pieces`);
    console.log(`Analysis Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  }
  
  return result;
} 