/**
 * 📊 PROJECT DASHBOARD - Unified Construction Analysis + TOT Visualization
 * =======================================================================
 * 
 * Revolutionary dashboard combining:
 * - Interactive construction plan viewer
 * - Tree-of-Thought decision visualization  
 * - Synchronized cross-references
 * - Toggleable view modes
 * 
 * Click element → See ALL AI reasoning
 * Click decision → Element highlights
 */

import React, { useState, useEffect } from 'react';
import InteractivePlanViewer from '../components/InteractivePlanViewer';
import TOTDecisionVisualizer from '../components/TOTDecisionVisualizer';

interface ProjectData {
  projectInfo: {
    projectNumber: string;
    name: string;
    totalArea: number;
    estimatedValue: number;
  };
  plans: Array<{
    planFile: string;
    planNumber: number;
    elements: any[];
  }>;
  decisions: any[];
  deliverables: {
    ausschreibung?: { status: string; path: string };
    lp6?: { status: string; count: number };
    verification?: { status: string; reports: number };
  };
}

export default function ProjectDashboard() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [currentPlan, setCurrentPlan] = useState(1);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'construction' | 'ai' | 'unified' | 'audit'>('unified');
  const [showTOT, setShowTOT] = useState(true);
  
  // Load project data
  useEffect(() => {
    loadProjectData();
  }, []);
  
  const loadProjectData = async () => {
    try {
      const response = await fetch('/api/v1/projects/FB-AUS-2024-001');
      const data = await response.json();
      setProjectData(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };
  
  // Handle element click - show related decisions
  const handleElementClick = (element: any) => {
    setSelectedElement(element);
    // Find decisions related to this element
    // This would query the cross-reference system
  };
  
  // Handle decision click - highlight element
  const handleDecisionClick = (decision: any) => {
    setSelectedDecision(decision);
    // Find and highlight related element
  };
  
  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }
  
  const currentPlanData = projectData.plans[currentPlan - 1];
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {projectData.projectInfo.name}
              </h1>
              <p className="text-sm text-gray-600">
                {projectData.projectInfo.projectNumber} • 
                €{(projectData.projectInfo.estimatedValue / 1000000).toFixed(1)}M • 
                {projectData.projectInfo.totalArea.toLocaleString()} m²
              </p>
            </div>
            
            {/* View mode switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('construction')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'construction' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Construction Focus
              </button>
              <button
                onClick={() => setViewMode('ai')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                AI Focus
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'unified' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('audit')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'audit' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Audit Trail
              </button>
            </div>
            
            {/* TOT Toggle */}
            <button
              onClick={() => setShowTOT(!showTOT)}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {showTOT ? 'Hide' : 'Show'} TOT
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Plan Viewer Section */}
        <div className={`
          ${viewMode === 'construction' ? 'w-full' : ''}
          ${viewMode === 'ai' ? 'w-1/4' : ''}
          ${viewMode === 'unified' ? 'w-1/2' : ''}
          ${viewMode === 'audit' ? 'w-1/3' : ''}
          border-r
        `}>
          <InteractivePlanViewer
            planImage={`/plans/${currentPlanData?.planFile || ''}`}
            elements={currentPlanData?.elements || []}
            planNumber={currentPlan}
            totalPlans={projectData.plans.length}
            onElementClick={handleElementClick}
            onPlanChange={setCurrentPlan}
          />
        </div>
        
        {/* TOT Decision Visualizer Section */}
        {showTOT && (
          <div className={`
            ${viewMode === 'construction' ? 'hidden' : ''}
            ${viewMode === 'ai' ? 'w-3/4' : ''}
            ${viewMode === 'unified' ? 'w-1/2' : ''}
            ${viewMode === 'audit' ? 'w-2/3' : ''}
          `}>
            <TOTDecisionVisualizer
              decisions={projectData.decisions || []}
              onNodeClick={handleDecisionClick}
              mode={viewMode}
              showAIMetaLayer={true}
            />
          </div>
        )}
      </div>
      
      {/* Deliverables Panel */}
      <div className="bg-white border-t p-4">
        <h3 className="font-bold mb-3">Generated Deliverables</h3>
        <div className="flex gap-4">
          {projectData.deliverables.ausschreibung && (
            <div className="flex-1 p-3 bg-blue-50 rounded">
              <p className="font-semibold">📄 Ausschreibung</p>
              <p className="text-sm text-gray-600">{projectData.deliverables.ausschreibung.status}</p>
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
                Download PDF
              </button>
            </div>
          )}
          
          {projectData.deliverables.lp6 && (
            <div className="flex-1 p-3 bg-green-50 rounded">
              <p className="font-semibold">📐 LP6 Package</p>
              <p className="text-sm text-gray-600">
                {projectData.deliverables.lp6.count} deliverables
              </p>
              <button className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm">
                Download Package
              </button>
            </div>
          )}
          
          {projectData.deliverables.verification && (
            <div className="flex-1 p-3 bg-purple-50 rounded">
              <p className="font-semibold">🔍 Verification</p>
              <p className="text-sm text-gray-600">
                {projectData.deliverables.verification.reports} reports
              </p>
              <button className="mt-2 px-3 py-1 bg-purple-500 text-white rounded text-sm">
                Open Interactive
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Element Cross-Reference */}
      {selectedElement && (
        <div className="absolute bottom-24 left-4 w-96 bg-white p-4 rounded-lg shadow-xl border-2 border-green-500">
          <h3 className="font-bold mb-2">Element: {selectedElement.classification}</h3>
          <p className="text-sm mb-2">ID: {selectedElement.id}</p>
          
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-sm">Dimensions:</span>
              <p className="text-sm">
                {selectedElement.dimensions?.width}mm × {selectedElement.dimensions?.height}mm
              </p>
            </div>
            
            <div>
              <span className="font-semibold text-sm">Area:</span>
              <p className="text-sm">{selectedElement.area?.toFixed(2)} m²</p>
            </div>
            
            <div>
              <span className="font-semibold text-sm">Related Decisions:</span>
              <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                View 5 decision nodes →
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedElement(null)}
            className="mt-3 w-full px-3 py-1 bg-gray-300 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

