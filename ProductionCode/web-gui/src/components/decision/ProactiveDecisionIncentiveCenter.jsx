import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🎯💎 PROACTIVE DECISION & INCENTIVE ORCHESTRATION CENTER
 * ======================================================
 * 
 * Strategic Supremacy Command Center featuring real-time incentive formulation,
 * MDP & ES integration, multi-step execution tracking, and constitutional decision approval
 * 
 * Source: web-gui/src/components/decision/ProactiveDecisionIncentiveCenter.jsx
 */

const ProactiveDecisionIncentiveCenter = () => {
  // 🎯 DECISION ORCHESTRATION STATE
  const [decisionData, setDecisionData] = useState({
    status: "ACTIVE",
    incentives: 2847,
    decisions: 12456,
    successRate: 0.978,
    currentExecution: {
      title: "Execute arbitrage during gas price dip",
      agent: "Elite-Developer",
      incentiveScore: 0.94,
      constitutional: "APPROVED",
      formal: true,
      mdpValue: 4567,
      esFitness: 0.89,
      executionTime: 2.3,
      progress: 23,
      eta: 4.7,
      successProb: 0.947
    },
    executionSteps: [
      { step: 1, name: "Market Analysis", status: "COMPLETED", details: "Gas prices 23% below average" },
      { step: 2, name: "Route Calculation", status: "IN PROGRESS", details: "34% complete" },
      { step: 3, name: "Constitutional Validation", status: "PENDING", details: "" },
      { step: 4, name: "Formal Verification", status: "PENDING", details: "" },
      { step: 5, name: "Execution Authorization", status: "PENDING", details: "" },
      { step: 6, name: "Performance Analysis", status: "PENDING", details: "" },
      { step: 7, name: "Conclusion Drawing", status: "PENDING", details: "" }
    ],
    agentPerformance: [
      { agent: "AI-Prediction", incentives: 1847, decisions: 1623, multiStepSuccess: 0.978, impact: 123456 },
      { agent: "Elite-Developer", incentives: 1234, decisions: 1156, multiStepSuccess: 0.989, impact: 234567 },
      { agent: "LLM-Gardener", incentives: 987, decisions: 934, multiStepSuccess: 0.962, impact: 89012 },
      { agent: "Judge-Service", incentives: 2156, decisions: 2087, multiStepSuccess: 0.991, impact: 345678 },
      { agent: "Arbitrum-Flash", incentives: 756, decisions: 712, multiStepSuccess: 0.947, impact: 67890 }
    ]
  });

  const [selectedAgent, setSelectedAgent] = useState('all');
  const [viewMode, setViewMode] = useState('live'); // live, history, analytics
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🌊 3D DECISION ORCHESTRATION VISUALIZATION - WITH ERROR HANDLING
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeThreeJS = async () => {
      try {
        console.log('🎯 Initializing 3D Decision Orchestration...');

        // Scene setup with BRIGHT COLORS
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011); // VERY DARK BLUE FOR CONTRAST

        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current.clientWidth / mountRef.current.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x000011, 1); // ENSURE DARK BACKGROUND
        
        // Style the canvas to ensure it's visible
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '50'; // MUCH HIGHER THAN PLACEHOLDER

        mountRef.current.appendChild(renderer.domElement);
        
        // ADD VISUAL CONFIRMATION THAT CANVAS WAS ADDED
        const canvasElement = renderer.domElement;
        canvasElement.title = '3D Decision Orchestration Canvas';
        canvasElement.style.cursor = 'grab';
        
        console.log('🎨 Canvas DOM element added to container');
        console.log('🔍 Canvas element tag:', canvasElement.tagName);
        console.log('📐 Canvas actual size:', canvasElement.width, 'x', canvasElement.height);
        console.log('🎯 Canvas style z-index:', canvasElement.style.zIndex);

        // 🎯 COMPLETE DECISION ORCHESTRATION - NOW THAT 3D WORKS!
        // Central decision nexus - BRIGHT CYAN OCTAHEDRON
        const nexusGeometry = new THREE.OctahedronGeometry(2.5);
        const nexusMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff, // BRIGHT CYAN
          wireframe: false
        });
        const decisionNexus = new THREE.Mesh(nexusGeometry, nexusMaterial);
        decisionNexus.position.set(0, 0, 0);
        scene.add(decisionNexus);
        console.log('🎯 Added Central Decision Nexus (Bright Cyan Octahedron)');

        // MDP & ES Integration nodes - BRIGHT COLORS
        const nodePositions = [
          { x: -6, y: 4, z: 0, type: 'MDP', color: 0x0066ff }, // BRIGHT BLUE
          { x: 6, y: 4, z: 0, type: 'ES', color: 0xff00ff }, // BRIGHT MAGENTA
          { x: -4, y: -4, z: 4, type: 'Constitutional', color: 0xffff00 }, // BRIGHT YELLOW
          { x: 4, y: -4, z: 4, type: 'Formal', color: 0x00ff00 }, // BRIGHT GREEN
          { x: 0, y: 6, z: -4, type: 'Execution', color: 0xff4444 } // BRIGHT RED
        ];

        const integrationNodes = [];
        nodePositions.forEach((pos, index) => {
          const nodeGeometry = new THREE.SphereGeometry(1.8, 16, 16);
          const nodeMaterial = new THREE.MeshBasicMaterial({
            color: pos.color,
            wireframe: false
          });
          const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
          node.position.set(pos.x, pos.y, pos.z);
          scene.add(node);
          
          console.log(`🔵 Added ${pos.type} Node (${pos.color.toString(16)}) at (${pos.x},${pos.y},${pos.z})`);

          // Add connecting lines to central nexus
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            decisionNexus.position,
            node.position
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: pos.color,
            linewidth: 2
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);

          integrationNodes.push(node);
        });

        // Decision flow particles - BRIGHT WHITE DOTS
        const particleCount = 150;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

          // BRIGHT WHITE PARTICLES
          colors[i * 3] = 1;
          colors[i * 3 + 1] = 1;
          colors[i * 3 + 2] = 1;

          velocities[i * 3] = (Math.random() - 0.5) * 0.05;
          velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.userData = { velocities };

        const particleMaterial = new THREE.PointsMaterial({
          size: 8,
          vertexColors: true,
          transparent: false,
          opacity: 1.0,
          sizeAttenuation: false
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);
        
        console.log('✅ COMPLETE DECISION ORCHESTRATION: Nexus + 5 nodes + 150 particles');

        // BRIGHT LIGHTING for BasicMaterial objects
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // BRIGHT WHITE LIGHT
        scene.add(ambientLight);

        // OPTIMAL CAMERA POSITION for viewing complete orchestration
        camera.position.set(15, 10, 15);
        camera.lookAt(0, 0, 0);
        
        console.log('📷 Camera positioned at (15,10,15) for complete view');
        console.log('🔍 Scene objects count:', scene.children.length);

        // COMPLETE DECISION ORCHESTRATION ANIMATION
        const animate = () => {
          requestAnimationFrame(animate);

          try {
            // Rotate central decision nexus (CYAN OCTAHEDRON)
            if (decisionNexus) {
              decisionNexus.rotation.x += 0.015;
              decisionNexus.rotation.y += 0.02;
            }

            // Pulse integration nodes (COLORED SPHERES)
            if (integrationNodes && integrationNodes.length > 0) {
              integrationNodes.forEach((node, index) => {
                const pulse = Math.sin(Date.now() * 0.004 + index) * 0.3 + 1;
                node.scale.setScalar(pulse);
                
                // Orbital motion around center
                const time = Date.now() * 0.001;
                const radius = 2;
                const angle = time + index * (Math.PI * 2 / integrationNodes.length);
                const originalPos = nodePositions[index];
                node.position.x = originalPos.x + Math.cos(angle) * radius;
                node.position.z = originalPos.z + Math.sin(angle) * radius;
              });
            }

            // Animate decision particles (BRIGHT WHITE DOTS)
            if (particleSystem && particleSystem.geometry.attributes.position) {
              const positions = particleSystem.geometry.attributes.position.array;
              const velocities = particleSystem.userData.velocities;
              
              // PULSE PARTICLE SIZE
              const pulseSize = 6 + Math.sin(Date.now() * 0.005) * 3;
              particleSystem.material.size = pulseSize;
              
              for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                // Boundary check and reset
                if (Math.abs(positions[i]) > 15 || Math.abs(positions[i + 1]) > 15 || Math.abs(positions[i + 2]) > 15) {
                  positions[i] = (Math.random() - 0.5) * 4;
                  positions[i + 1] = (Math.random() - 0.5) * 4;
                  positions[i + 2] = (Math.random() - 0.5) * 4;
                }
              }
              particleSystem.geometry.attributes.position.needsUpdate = true;
            }

            renderer.render(scene, camera);
          } catch (animError) {
            console.error('❌ Animation error:', animError);
          }
        };

        animate();
        sceneRef.current = { scene, decisionNexus, integrationNodes, particleSystem, renderer, camera };
        
        // FORCE REACT UPDATE TO HIDE PLACEHOLDER
        setTimeout(() => {
          setThreeJSLoaded(true);
          console.log('✅ COMPLETE DECISION ORCHESTRATION loaded successfully!');
          console.log('   📊 Scene objects:', scene.children.length);
          console.log('   🎯 CYAN OCTAHEDRON: Central Decision Nexus at origin');
          console.log('   🔵 INTEGRATION NODES: 5 colored spheres with orbital motion');
          console.log('   💫 DECISION PARTICLES: 150 bright white flowing dots');
          console.log('   ⚡ CONNECTION LINES: Linking all nodes to center');
          console.log('   📷 Camera: (15,10,15) for complete orchestration view');
          console.log('   🌌 Background: DARK BLUE for maximum contrast');
        }, 100);

        // Cleanup
        return () => {
          try {
            if (mountRef.current && renderer.domElement) {
              mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
          } catch (cleanupError) {
            console.warn('Cleanup error:', cleanupError);
          }
        };

      } catch (error) {
        console.error('❌ Three.js visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeThreeJS();
  }, [viewMode]);

  // Handle window resize for 3D visualization
  useEffect(() => {
    const handleResize = () => {
      if (mountRef.current && sceneRef.current && threeJSLoaded) {
        try {
          const camera = sceneRef.current.getObjectByName('camera');
          const renderer = sceneRef.current.getObjectByName('renderer');
          
          if (camera && renderer) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        } catch (error) {
          console.warn('Resize handler error:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [threeJSLoaded]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'IN PROGRESS': return '#f59e0b';
      case 'PENDING': return '#6b7280';
      default: return '#ef4444';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return '✅';
      case 'IN PROGRESS': return '⏳';
      case 'PENDING': return '⏳';
      default: return '❌';
    }
  };

  return (
    <div className="decision-center-container">
      {/* 👑 HEADER */}
      <div className="decision-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🎯 Proactive Decision & Incentive Orchestration Center
            </h1>
            <p className="subtitle">Strategic Supremacy Command Center</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Incentives: {decisionData.incentives.toLocaleString()}
            </div>
            <div className="metric-badge">
              Decisions: {decisionData.decisions.toLocaleString()}
            </div>
            <div className="metric-badge">
              Success: {(decisionData.successRate * 100).toFixed(1)}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="decision-main-grid">
        
        {/* 🎯 DECISION ORCHESTRATION VISUALIZATION */}
        <div className="decision-visualization-panel">
          <div className="panel-header">
            <h2>🧠 Live Incentive Formulation & Decision Orchestration</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'live' ? 'active' : ''}`}
                onClick={() => setViewMode('live')}
              >
                🔴 Live
              </button>
              <button 
                className={`view-btn ${viewMode === 'history' ? 'active' : ''}`}
                onClick={() => setViewMode('history')}
              >
                📊 History
              </button>
              <button 
                className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
                onClick={() => setViewMode('analytics')}
              >
                📈 Analytics
              </button>
              <div className="webgl-status">
                {threeJSLoaded && <span className="webgl-success">🌊 3D ACTIVE</span>}
                {threeJSError && <span className="webgl-error">🚨 FALLBACK</span>}
                {!threeJSLoaded && !threeJSError && <span className="webgl-loading">🔄 LOADING</span>}
              </div>
            </div>
          </div>
          
          <div className="visualization-container" ref={mountRef}>
            {!threeJSLoaded && (
              <div className="placeholder-visualization loading">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🔄</div>
                  <h3>Loading 3D Decision Orchestration...</h3>
                  <p>Initializing WebGL Visualization</p>
                </div>
              </div>
            )}
            
            {threeJSError && (
              <div className="placeholder-visualization error">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🚨</div>
                  <h3>3D WebGL Error - Fallback Mode</h3>
                  <p>Functionality Preserved</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Execution Info */}
          <div className="current-execution-info">
            <div className="execution-title">
              🎯 Current: "{decisionData.currentExecution.title}" ({decisionData.currentExecution.agent})
            </div>
            <div className="execution-metrics">
              <span>🎯 Incentive Score: {decisionData.currentExecution.incentiveScore}</span>
              <span>⚖️ Constitutional: {decisionData.currentExecution.constitutional}</span>
              <span>🧮 Formal: {decisionData.currentExecution.formal ? '✅' : '❌'}</span>
            </div>
            <div className="execution-details">
              <span>📊 MDP Value: ${decisionData.currentExecution.mdpValue.toLocaleString()}</span>
              <span>🧬 ES Fitness: {decisionData.currentExecution.esFitness}</span>
              <span>⏱️ Execution: {decisionData.currentExecution.executionTime}s</span>
            </div>
          </div>
        </div>

        {/* 📋 MULTI-STEP EXECUTION TRACKING */}
        <div className="execution-tracking-panel">
          <div className="panel-header">
            <h2>📋 Multi-Step Execution Tracking</h2>
          </div>
          
          <div className="execution-progress">
            <div className="progress-header">
              <h3>🎯 Gas Price Optimization Strategy Execution</h3>
              <div className="progress-stats">
                <span>Progress: {decisionData.currentExecution.progress}%</span>
                <span>ETA: {decisionData.currentExecution.eta} minutes</span>
                <span>Success Prob: {(decisionData.currentExecution.successProb * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${decisionData.currentExecution.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="execution-steps">
              {decisionData.executionSteps.map((step, index) => (
                <div key={index} className={`execution-step step-${step.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="step-header">
                    <span className="step-icon">{getStatusIcon(step.status)}</span>
                    <span className="step-name">Step {step.step}: {step.name}</span>
                    <span className="step-status" style={{ color: getStatusColor(step.status) }}>
                      {step.status}
                    </span>
                  </div>
                  {step.details && (
                    <div className="step-details">
                      {step.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 📊 AGENT PERFORMANCE ANALYTICS */}
      <div className="agent-analytics-panel">
        <div className="panel-header">
          <h2>📊 Decision Orchestration Excellence Analytics</h2>
          <div className="filters">
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Agents</option>
              <option value="AI-Prediction">🧠 AI-Prediction</option>
              <option value="Elite-Developer">🎯 Elite-Developer</option>
              <option value="LLM-Gardener">🌱 LLM-Gardener</option>
              <option value="Judge-Service">⚖️ Judge-Service</option>
              <option value="Arbitrum-Flash">🏹 Arbitrum-Flash</option>
            </select>
          </div>
        </div>
        
        <div className="analytics-table">
          <div className="table-header">
            <div>Agent</div>
            <div>Incentives Formulated</div>
            <div>Decisions Executed</div>
            <div>Multi-Step Success</div>
            <div>Economic Impact</div>
          </div>
          {decisionData.agentPerformance
            .filter(agent => selectedAgent === 'all' || agent.agent === selectedAgent)
            .map((agent, index) => (
            <div key={index} className="table-row">
              <div className="agent-cell">
                {agent.agent === 'AI-Prediction' && '🧠'} 
                {agent.agent === 'Elite-Developer' && '🎯'}
                {agent.agent === 'LLM-Gardener' && '🌱'}
                {agent.agent === 'Judge-Service' && '⚖️'}
                {agent.agent === 'Arbitrum-Flash' && '🏹'}
                {agent.agent.replace('-', ' ')}
              </div>
              <div>{agent.incentives.toLocaleString()}</div>
              <div>{agent.decisions.toLocaleString()}</div>
              <div>
                <span className={agent.multiStepSuccess > 0.98 ? 'excellence-elite' : 
                                agent.multiStepSuccess > 0.96 ? 'excellence-expert' : 'excellence-advanced'}>
                  {(agent.multiStepSuccess * 100).toFixed(1)}%
                </span>
              </div>
              <div className="economic-impact">+${agent.impact.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .decision-center-container {
          background: linear-gradient(135deg, #0c1426 0%, #1e3a8a 50%, #0c1426 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .decision-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.125rem;
          opacity: 0.8;
          margin: 0.5rem 0 0 0;
        }

        .status-indicators {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .status-badge, .metric-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-active {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-badge {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .data-source-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .decision-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .decision-visualization-panel, .execution-tracking-panel, .agent-analytics-panel {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: rgba(6, 182, 212, 0.4);
          border-color: #06b6d4;
        }

        .view-btn:hover {
          background: rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }

        .webgl-status {
          display: flex;
          align-items: center;
          margin-left: 1rem;
        }

        .webgl-success {
          color: #10b981;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .webgl-error {
          color: #ef4444;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .webgl-loading {
          color: #f59e0b;
          font-weight: 600;
          font-size: 0.875rem;
          animation: pulse 1.5s infinite;
        }


        .visualization-container {
          width: 100%;
          height: 400px;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1px solid rgba(6, 182, 212, 0.3); /* PROFESSIONAL BORDER */
          position: relative;
          background: #000011; /* DARK BLUE BACKGROUND */
        }

        .placeholder-visualization {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%);
          z-index: 1; /* BELOW CANVAS */
        }

        .placeholder-visualization.loading {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(59, 130, 246, 0.2) 100%);
        }

        .placeholder-visualization.error {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 50%, rgba(6, 182, 212, 0.2) 100%);
        }


        .placeholder-content {
          text-align: center;
          padding: 2rem;
        }

        .placeholder-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .placeholder-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #06b6d4;
        }

        .placeholder-content p {
          margin: 0 0 1rem 0;
          opacity: 0.8;
        }

        .placeholder-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .placeholder-features span {
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .placeholder-note {
          font-size: 0.875rem;
          opacity: 0.6;
          font-style: italic;
        }


        .current-execution-info {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #06b6d4;
        }

        .execution-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fbbf24;
        }

        .execution-metrics, .execution-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .execution-metrics span, .execution-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .execution-progress {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .progress-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #06b6d4;
        }

        .progress-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .progress-stats span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
        }

        .progress-bar-container {
          margin-bottom: 1.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
          border-radius: 6px;
          transition: width 0.3s ease;
          animation: progressGlow 2s ease-in-out infinite alternate;
        }

        @keyframes progressGlow {
          0% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
          100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
        }

        .execution-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .execution-step {
          padding: 1rem;
          border-radius: 0.5rem;
          border-left: 4px solid #6b7280;
        }

        .step-completed {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .step-in-progress {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .step-pending {
          border-left-color: #6b7280;
          background: rgba(107, 114, 128, 0.1);
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .step-icon {
          font-size: 1.2rem;
        }

        .step-name {
          flex: 1;
          font-weight: 600;
        }

        .step-status {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .step-details {
          margin-left: 2rem;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .agent-analytics-panel {
          grid-column: 1 / -1;
        }

        .filters {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }

        .analytics-table {
          display: grid;
          gap: 1rem;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .table-header {
          background: rgba(6, 182, 212, 0.2);
          font-weight: 600;
        }

        .table-row {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .agent-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .excellence-elite {
          color: #fbbf24;
          font-weight: 600;
        }

        .excellence-expert {
          color: #10b981;
          font-weight: 600;
        }

        .excellence-advanced {
          color: #8b5cf6;
          font-weight: 600;
        }

        .economic-impact {
          color: #10b981;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .decision-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProactiveDecisionIncentiveCenter;
