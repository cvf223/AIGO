/**
 * 🌳 TOT DECISION VISUALIZER - Revolutionary AI Decision Tree Visualization
 * ========================================================================
 * 
 * D3.js-powered interactive decision tree that shows ALL AI reasoning
 * Click nodes to explore alternatives, trace confidence, see evidence
 * 
 * REVOLUTIONARY: First construction AI with visible decision-making!
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DecisionNode {
  id: string;
  type: string;
  chosen: string;
  confidence: number;
  timestamp: string;
  branches: Array<{
    option: string;
    confidence: number;
    reasoning: string[];
  }>;
  factors?: {
    geometric?: number;
    textural?: number;
    contextual?: number;
  };
}

interface TOTDecisionVisualizerProps {
  decisions: DecisionNode[];
  onNodeClick?: (node: DecisionNode) => void;
  mode: 'construction' | 'ai' | 'unified' | 'audit';
  showAIMetaLayer: boolean;
}

export default function TOTDecisionVisualizer({
  decisions,
  onNodeClick,
  mode = 'unified',
  showAIMetaLayer = false
}: TOTDecisionVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<DecisionNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DecisionNode | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || decisions.length === 0) return;
    
    drawDecisionTree();
  }, [decisions, mode, showAIMetaLayer]);
  
  const drawDecisionTree = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 1200;
    const height = 800;
    
    // Create force simulation
    const simulation = d3.forceSimulation(decisions as any)
      .force('link', d3.forceLink().id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Create links (decision dependencies)
    const links = buildLinks(decisions);
    
    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);
    
    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(decisions)
      .enter().append('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);
    
    // Node circles
    node.append('circle')
      .attr('r', (d: DecisionNode) => 20 + (d.confidence * 30))
      .attr('fill', (d: DecisionNode) => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .on('click', (event, d: DecisionNode) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseenter', (event, d: DecisionNode) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });
    
    // Node labels
    node.append('text')
      .text((d: DecisionNode) => d.type.split('_')[0])
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4);
    
    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  };
  
  // Build links between decisions
  const buildLinks = (decisions: DecisionNode[]) => {
    const links = [];
    for (let i = 0; i < decisions.length - 1; i++) {
      links.push({
        source: decisions[i].id,
        target: decisions[i + 1].id
      });
    }
    return links;
  };
  
  // Get node color based on type and confidence
  const getNodeColor = (node: DecisionNode) => {
    if (node.confidence >= 0.85) return '#10b981'; // Green
    if (node.confidence >= 0.70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };
  
  return (
    <div className="w-full h-full relative bg-white">
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1200 800"
      />
      
      {/* Decision Detail Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500">
          <h3 className="font-bold text-lg mb-2">Decision Details</h3>
          
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Type:</span>
              <span className="ml-2">{selectedNode.type}</span>
            </div>
            
            <div>
              <span className="font-semibold">Chosen:</span>
              <span className="ml-2 font-bold text-blue-600">{selectedNode.chosen}</span>
            </div>
            
            <div>
              <span className="font-semibold">Confidence:</span>
              <span className="ml-2">{Math.round(selectedNode.confidence * 100)}%</span>
              <div className="w-full bg-gray-200 rounded h-2 mt-1">
                <div
                  className={`h-2 rounded ${
                    selectedNode.confidence >= 0.85 ? 'bg-green-500' :
                    selectedNode.confidence >= 0.70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedNode.confidence * 100}%` }}
                />
              </div>
            </div>
            
            {selectedNode.branches && selectedNode.branches.length > 0 && (
              <div>
                <span className="font-semibold">Alternatives:</span>
                <ul className="mt-1 space-y-1">
                  {selectedNode.branches.map((branch, idx) => (
                    <li key={idx} className={`text-sm pl-2 ${
                      branch.option === selectedNode.chosen ? 'font-bold text-blue-600' : 'text-gray-600'
                    }`}>
                      {branch.option}: {Math.round(branch.confidence * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedNode.factors && (
              <div>
                <span className="font-semibold">Decision Factors:</span>
                <div className="mt-1 space-y-1">
                  {Object.entries(selectedNode.factors).map(([factor, weight]) => (
                    <div key={factor} className="flex items-center gap-2">
                      <span className="text-xs w-20">{factor}:</span>
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div
                          className="bg-blue-500 h-2 rounded"
                          style={{ width: `${(weight as number) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round((weight as number) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 w-full px-3 py-1 bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow">
        <h4 className="font-bold text-sm mb-2">Confidence Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>High (≥85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium (70-85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Low (&lt;70%)</span>
          </div>
        </div>
      </div>
      
      {/* Mode indicator */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
        <span className="text-sm font-semibold">Mode: {mode}</span>
      </div>
    </div>
  );
}

