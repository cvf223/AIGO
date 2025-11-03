/**
 * 🎨 ENHANCED ANNOTATION VIEWER - Visual Plan Analysis Display
 * ===========================================================
 * 
 * Canvas-based annotation overlay system for construction plans
 * with layer controls and real-time updates
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BlueprintPanel from '../shared/BlueprintPanel';

const EnhancedAnnotationViewer = ({ 
  planImage, 
  annotations, 
  analysisId,
  onAnnotationUpdate,
  onExport 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedLayers, setSelectedLayers] = useState(['measurements', 'materials', 'compliance']);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const [layerOpacity, setLayerOpacity] = useState({
    measurements: 1,
    materials: 1,
    compliance: 1,
    reasoning: 0.8,
    structural: 1,
    composite: 0
  });

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawAnnotations();
  }, [planImage, annotations, selectedLayers, zoom, pan, layerOpacity]);

  /**
   * 🎨 DRAW ANNOTATIONS
   */
  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !planImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply zoom and pan
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width / zoom, canvas.height / zoom);

      // Draw annotation layers
      if (annotations) {
        Object.entries(annotations).forEach(([layerName, layer]) => {
          if (selectedLayers.includes(layerName) && layer.annotations) {
            ctx.globalAlpha = layerOpacity[layerName] || 1;
            drawLayer(ctx, layer.annotations, layerName);
          }
        });
      }

      // Restore context state
      ctx.restore();
    };

    img.src = planImage;
  }, [planImage, annotations, selectedLayers, zoom, pan, layerOpacity]);

  /**
   * 📐 DRAW LAYER
   */
  const drawLayer = (ctx, annotations, layerName) => {
    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation, layerName);
    });
  };

  /**
   * ✏️ DRAW ANNOTATION
   */
  const drawAnnotation = (ctx, annotation, layerName) => {
    ctx.save();

    // Apply annotation styles
    const style = annotation.style || {};
    ctx.fillStyle = style.color || getLayerColor(layerName);
    ctx.strokeStyle = style.color || getLayerColor(layerName);
    ctx.lineWidth = style.lineWidth || 2;
    ctx.font = style.font || '14px Arial';

    if (style.strokeDashArray) {
      ctx.setLineDash(style.strokeDashArray);
    }

    // Draw based on type
    switch (annotation.type) {
      case 'text':
      case 'label':
        drawTextAnnotation(ctx, annotation);
        break;
      case 'rectangle':
        drawRectangleAnnotation(ctx, annotation);
        break;
      case 'circle':
        drawCircleAnnotation(ctx, annotation);
        break;
      case 'polygon':
        drawPolygonAnnotation(ctx, annotation);
        break;
      case 'badge':
        drawBadgeAnnotation(ctx, annotation);
        break;
      case 'line':
        drawLineAnnotation(ctx, annotation);
        break;
      case 'arrow':
        drawArrowAnnotation(ctx, annotation);
        break;
    }

    ctx.restore();
  };

  /**
   * 📝 TEXT ANNOTATION
   */
  const drawTextAnnotation = (ctx, annotation) => {
    const { position, content, style = {} } = annotation;

    if (style.backgroundColor) {
      const metrics = ctx.measureText(content);
      const padding = style.padding || 5;
      
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(
        position.x - padding,
        position.y - 20 - padding,
        metrics.width + padding * 2,
        25 + padding * 2
      );
    }

    ctx.fillStyle = style.color || ctx.fillStyle;
    ctx.fillText(content, position.x, position.y);
  };

  /**
   * 🟦 RECTANGLE ANNOTATION
   */
  const drawRectangleAnnotation = (ctx, annotation) => {
    const { position, style = {} } = annotation;
    const { x, y, w, h } = position;

    if (style.fillOpacity) {
      ctx.globalAlpha = style.fillOpacity;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
    }

    ctx.strokeRect(x, y, w, h);
  };

  /**
   * 🔵 CIRCLE ANNOTATION
   */
  const drawCircleAnnotation = (ctx, annotation) => {
    const { center, radius, style = {} } = annotation;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

    if (style.fillOpacity) {
      ctx.globalAlpha = style.fillOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.stroke();
  };

  /**
   * 🔺 POLYGON ANNOTATION
   */
  const drawPolygonAnnotation = (ctx, annotation) => {
    const { points, style = {} } = annotation;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();

    if (style.fillOpacity) {
      ctx.globalAlpha = style.fillOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.stroke();
  };

  /**
   * 🏷️ BADGE ANNOTATION
   */
  const drawBadgeAnnotation = (ctx, annotation) => {
    const { position, content, style = {} } = annotation;
    const padding = 8;
    const metrics = ctx.measureText(content);
    const width = metrics.width + padding * 2;
    const height = 25;

    // Background
    ctx.fillStyle = style.backgroundColor || 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(position.x, position.y, width, height, 5);
    ctx.fill();

    // Border
    ctx.strokeStyle = style.borderColor || style.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    if (style.icon) {
      ctx.fillStyle = style.color;
      ctx.font = '16px Arial';
      ctx.fillText(style.icon, position.x + 5, position.y + 18);
    }

    // Text
    ctx.fillStyle = style.color || '#FFFFFF';
    ctx.font = style.font || '12px Arial';
    ctx.fillText(content, position.x + padding + (style.icon ? 20 : 0), position.y + 18);
  };

  /**
   * 📏 LINE ANNOTATION
   */
  const drawLineAnnotation = (ctx, annotation) => {
    const { start, end } = annotation;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  /**
   * ➡️ ARROW ANNOTATION
   */
  const drawArrowAnnotation = (ctx, annotation) => {
    const { start, end, style = {} } = annotation;
    const headLength = style.headLength || 10;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  /**
   * 🎨 GET LAYER COLOR
   */
  const getLayerColor = (layerName) => {
    const colors = {
      measurements: '#00FF00',
      materials: '#FFD700',
      compliance: '#FF0000',
      reasoning: '#00BFFF',
      structural: '#8B4513',
      composite: '#FFFFFF'
    };
    return colors[layerName] || '#FFFFFF';
  };

  /**
   * 🖱️ HANDLE WHEEL (ZOOM)
   */
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  /**
   * 🖱️ HANDLE MOUSE DOWN (PAN START)
   */
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  /**
   * 🖱️ HANDLE MOUSE MOVE (PANNING)
   */
  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else {
      // Check for hover over annotations
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      // Find annotation at position
      let foundAnnotation = null;
      if (annotations) {
        Object.entries(annotations).forEach(([layerName, layer]) => {
          if (selectedLayers.includes(layerName) && layer.annotations) {
            layer.annotations.forEach(annotation => {
              if (isPointInAnnotation(x, y, annotation)) {
                foundAnnotation = annotation;
              }
            });
          }
        });
      }
      
      setHoveredAnnotation(foundAnnotation);
    }
  };

  /**
   * 🖱️ HANDLE MOUSE UP (PAN END)
   */
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  /**
   * 📍 CHECK POINT IN ANNOTATION
   */
  const isPointInAnnotation = (x, y, annotation) => {
    switch (annotation.type) {
      case 'rectangle':
        const { position } = annotation;
        return x >= position.x && x <= position.x + position.w &&
               y >= position.y && y <= position.y + position.h;
      case 'circle':
        const { center, radius } = annotation;
        const distance = Math.sqrt(
          Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
        );
        return distance <= radius;
      default:
        return false;
    }
  };

  /**
   * 🔄 TOGGLE LAYER
   */
  const toggleLayer = (layerName) => {
    setSelectedLayers(prev => {
      if (prev.includes(layerName)) {
        return prev.filter(l => l !== layerName);
      }
      return [...prev, layerName];
    });
  };

  /**
   * 🎚️ ADJUST LAYER OPACITY
   */
  const adjustLayerOpacity = (layerName, opacity) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layerName]: opacity
    }));
  };

  /**
   * 📤 EXPORT ANNOTATED IMAGE
   */
  const exportImage = async (format = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png') {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotated-plan-${analysisId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } else if (format === 'pdf') {
      // Call backend to generate PDF
      if (onExport) {
        onExport(format);
      }
    }
  };

  /**
   * 🔄 RESET VIEW
   */
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="enhanced-annotation-viewer">
      <div className="flex gap-6">
        {/* Canvas Container */}
        <div className="flex-1">
          <BlueprintPanel title="📐 ANNOTATED PLAN VIEW" variant="steel">
            <div 
              ref={containerRef}
              className="relative overflow-hidden bg-steel-800 rounded"
              style={{ height: '600px' }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="cursor-move"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {/* Hover Tooltip */}
              {hoveredAnnotation && (
                <div className="absolute bg-black bg-opacity-90 text-white p-2 rounded text-xs pointer-events-none"
                     style={{ 
                       left: hoveredAnnotation.position?.x || 0, 
                       top: hoveredAnnotation.position?.y || 0 
                     }}>
                  {hoveredAnnotation.content || hoveredAnnotation.type}
                </div>
              )}
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <button
                  onClick={() => setZoom(Math.min(3, zoom * 1.2))}
                  className="w-10 h-10 bg-steel-700 hover:bg-steel-600 rounded flex items-center justify-center text-white"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom * 0.8))}
                  className="w-10 h-10 bg-steel-700 hover:bg-steel-600 rounded flex items-center justify-center text-white"
                >
                  -
                </button>
                <button
                  onClick={resetView}
                  className="w-10 h-10 bg-steel-700 hover:bg-steel-600 rounded flex items-center justify-center text-white text-xs"
                >
                  ⟲
                </button>
              </div>
              
              {/* Zoom Indicator */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-mono">
                {Math.round(zoom * 100)}%
              </div>
            </div>
          </BlueprintPanel>
        </div>

        {/* Layer Controls */}
        <div className="w-80">
          <BlueprintPanel title="🎨 LAYER CONTROLS" variant="glass">
            <div className="space-y-4">
              {/* Layer Toggles */}
              <div>
                <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
                  Annotation Layers
                </h4>
                <div className="space-y-2">
                  {Object.entries(annotations || {}).map(([layerName, layer]) => (
                    <div key={layerName} className="space-y-2">
                      <label className="flex items-center justify-between p-2 bg-steel-700 rounded hover:bg-steel-600 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedLayers.includes(layerName)}
                            onChange={() => toggleLayer(layerName)}
                            className="w-5 h-5 accent-compliance-green"
                          />
                          <div>
                            <div className="font-body text-sm capitalize">{layerName}</div>
                            <div className="text-xs font-mono text-steel-400">
                              {layer.stats?.count || layer.annotations?.length || 0} items
                            </div>
                          </div>
                        </div>
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getLayerColor(layerName) }}
                        />
                      </label>
                      
                      {/* Opacity Slider */}
                      {selectedLayers.includes(layerName) && (
                        <div className="ml-8 mr-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={layerOpacity[layerName] || 1}
                            onChange={(e) => adjustLayerOpacity(layerName, parseFloat(e.target.value))}
                            className="w-full h-1 bg-steel-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              {annotations && (
                <div>
                  <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
                    Analysis Statistics
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    {annotations.measurements?.stats && (
                      <div className="flex justify-between">
                        <span className="text-steel-400">Avg Confidence:</span>
                        <span className="text-compliance-green">
                          {(annotations.measurements.stats.averageConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {annotations.compliance?.stats && (
                      <div className="flex justify-between">
                        <span className="text-steel-400">Compliance:</span>
                        <span className={annotations.compliance.stats.issues > 0 ? 'text-error-red' : 'text-compliance-green'}>
                          {annotations.compliance.stats.compliant}/{annotations.compliance.stats.total}
                        </span>
                      </div>
                    )}
                    {annotations.reasoning?.stats && (
                      <div className="flex justify-between">
                        <span className="text-steel-400">AI Confidence:</span>
                        <span className="text-blueprint-accent">
                          {(annotations.reasoning.stats.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div>
                <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
                  Export Options
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => exportImage('png')}
                    className="w-full px-4 py-2 bg-steel-700 hover:bg-steel-600 rounded text-sm font-mono transition-colors"
                  >
                    📸 Export as PNG
                  </button>
                  <button
                    onClick={() => exportImage('pdf')}
                    className="w-full px-4 py-2 bg-steel-700 hover:bg-steel-600 rounded text-sm font-mono transition-colors"
                  >
                    📄 Export as PDF
                  </button>
                  <button
                    onClick={() => onAnnotationUpdate && onAnnotationUpdate(annotations)}
                    className="w-full px-4 py-2 bg-construction-orange hover:bg-safety-yellow rounded text-sm font-mono transition-colors"
                  >
                    💾 Save Annotations
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedLayers(Object.keys(annotations || {}))}
                  className="w-full px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono transition-colors"
                >
                  Show All Layers
                </button>
                <button
                  onClick={() => setSelectedLayers([])}
                  className="w-full px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono transition-colors"
                >
                  Hide All Layers
                </button>
              </div>
            </div>
          </BlueprintPanel>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnnotationViewer;
