/**
 * 🏗️ PROJECTS PAGE - Construction Project Overview
 * =================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - HOAI LP 6 & 7 project tracking
 * with plan processing pipeline and compliance monitoring
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import MetricGauge from '../components/shared/MetricGauge';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [planStatus, setPlanStatus] = useState({
    processing: 0,
    completed: 0,
    errors: 0
  });

  useEffect(() => {
    fetchProjects();
    fetchPlanStatus();

    const interval = setInterval(() => {
      fetchProjects();
      fetchPlanStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/construction/projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchPlanStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/construction/plans/status');
      const data = await response.json();
      
      if (data.success) {
        setPlanStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch plan status:', error);
    }
  };

  return (
    <div className="projects-page space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-architectural text-compliance-green mb-2">
          🏗️ CONSTRUCTION PROJECTS
        </h1>
        <p className="text-steel-300 font-body">
          HOAI LP 6 & 7 project tracking and plan processing pipeline
        </p>
      </div>

      {/* Plan Processing Status */}
      <BlueprintPanel title="📊 PLAN PROCESSING STATUS" icon="📋">
        <div className="grid grid-cols-4 gap-6">
          <MetricGauge
            value={planStatus.processing}
            max={30}
            label="Currently Processing"
            color="#00D9FF"
          />
          <MetricGauge
            value={planStatus.completed}
            max={1000}
            label="Completed Plans"
            color="#00D9FF"
          />
          <MetricGauge
            value={planStatus.errors}
            max={50}
            label="Errors Detected"
            color="#FFB800"
          />
          <MetricGauge
            value={planStatus.completed > 0 
              ? ((planStatus.completed / (planStatus.completed + planStatus.errors)) * 100)
              : 0}
            max={100}
            label="Success Rate"
            unit="%"
            color="#00D9FF"
          />
        </div>
      </BlueprintPanel>

      {/* HOAI Pipeline Visualization */}
      <BlueprintPanel title="🔄 HOAI LP 6 & 7 PROCESSING PIPELINE" icon="🏗️" variant="glass">
        <div className="space-y-4">
          {/* Pipeline Stages */}
          <div className="flex items-center justify-between">
            {[
              { name: 'Plan Upload', icon: '📤', status: 'complete' },
              { name: 'Vision Processing', icon: '👁️', status: 'active' },
              { name: 'Error Detection', icon: '⚠️', status: 'active' },
              { name: 'Quantity Extraction', icon: '📐', status: 'pending' },
              { name: 'Compliance Check', icon: '✅', status: 'pending' },
              { name: 'BOQ Generation', icon: '📊', status: 'pending' },
              { name: 'Tender Creation', icon: '📋', status: 'pending' }
            ].map((stage, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl mb-2
                  ${stage.status === 'complete' ? 'bg-compliance-green border-compliance-green text-blueprint-dark' :
                    stage.status === 'active' ? 'bg-construction-orange border-construction-orange text-white animate-pulse-slow' :
                    'bg-steel-700 border-steel-500 text-steel-400'}
                `}>
                  {stage.icon}
                </div>
                <div className="text-xs font-mono text-center text-steel-300">
                  {stage.name}
                </div>
                {index < 6 && (
                  <div className="absolute w-8 h-1 bg-steel-500" style={{left: '50%', top: '2rem'}} />
                )}
              </div>
            ))}
          </div>

          {/* Active Plans in Pipeline */}
          <div className="mt-6 p-4 bg-blueprint-dark bg-opacity-50 rounded">
            <div className="text-sm font-mono text-steel-300 mb-3">
              {planStatus.processing} plans currently in pipeline
            </div>
            <div className="progress-construction">
              <div 
                className="progress-construction-fill"
                style={{ width: `${(planStatus.processing / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </BlueprintPanel>

      {/* Active Projects List */}
      <BlueprintPanel title="📋 ACTIVE PROJECTS" icon="🏗️">
        {projects.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {projects.map((project, index) => (
              <div key={index} className="p-4 bg-steel-700 bg-opacity-30 rounded border-2 border-steel-500 hover:border-compliance-green transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-industrial font-bold text-lg">{project.name || `Project ${project.id}`}</h3>
                  <span className="px-3 py-1 bg-compliance-green text-blueprint-dark rounded text-xs font-bold">
                    {project.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-steel-300">Plans Processed:</span>
                    <span className="text-compliance-green font-bold">{project.plansProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Compliance:</span>
                    <span className="text-compliance-green font-bold">{project.compliance || '100%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-300">Errors:</span>
                    <span className="text-safety-yellow font-bold">{project.errors || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-steel-400">
            <div className="text-6xl mb-4">🏗️</div>
            <div className="font-industrial text-2xl">NO ACTIVE PROJECTS</div>
            <div className="font-body mt-2">Start a new project to begin</div>
          </div>
        )}
      </BlueprintPanel>
    </div>
  );
};

export default ProjectsPage;

