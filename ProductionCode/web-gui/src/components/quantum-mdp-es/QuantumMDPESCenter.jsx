import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🌊💎 MDP & ES QUANTUM EXCELLENCE CENTER
 * ====================================
 * 
 * Elite Decision & Evolution Monitoring featuring quantum MDP framework monitoring,
 * evolutionary strategies analytics, and 3D quantum state space visualization
 * 
 * Source: web-gui/src/components/quantum-mdp-es/QuantumMDPESCenter.jsx
 */

const QuantumMDPESCenter = () => {
  // 🌊 QUANTUM MDP & ES STATE
  const [quantumMDPESData, setQuantumMDPESData] = useState({
    mdpDecisionQuality: 0.987,
    activeStates: 12847,
    transitions: 89234,
    quantumAdvantage: 789,
    classicalComparison: 234,
    mdpStateSpace: {
      optimalStates: { count: 3456, color: 0xfbbf24 },
      executionStates: { count: 2847, color: 0x3b82f6 },
      rewardStates: { count: 1923, color: 0x10b981 }
    },
    evolutionaryStrategies: {
      activeCycles: 23,
      geneticPerformance: 567, // vs classical
      agentFitnessImprovements: 0.893,
      mutationSuccessRate: 0.947,
      crossoverOptimization: 156, // % offspring quality
      selectionPressure: "Optimal (Pareto frontier maintained)"
    },
    quantumDecisionFlow: [
      { stage: "State Analysis", status: "ACTIVE", quantum: 0.94, classical: 0.67 },
      { stage: "Action Space Exploration", status: "ACTIVE", quantum: 0.89, classical: 0.72 },
      { stage: "Value Function Optimization", status: "ACTIVE", quantum: 0.96, classical: 0.74 },
      { stage: "Policy Gradient Enhancement", status: "ACTIVE", quantum: 0.92, classical: 0.69 },
      { stage: "Decision Synthesis", status: "ACTIVE", quantum: 0.98, classical: 0.71 }
    ],
    currentDecision: {
      problem: "Optimize cross-chain arbitrage with gas efficiency",
      mdpValue: 4567,
      esFitness: 0.89,
      quantumEnhancement: 789,
      expectedReward: 12847,
      confidence: 0.94
    }
  });

  const [viewMode, setViewMode] = useState('mdp'); // mdp, es, quantum
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🌌 3D MDP STATE SPACE VISUALIZATION
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeMDPStateSpaceVisualization = async () => {
      try {
        console.log('🌊 Initializing 3D MDP State Space...');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f1419);

        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current.clientWidth / mountRef.current.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x0f1419, 1);
        
        // Canvas styling
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '10';

        mountRef.current.appendChild(renderer.domElement);

        // 🌊 CREATE 3D MDP STATE SPACE
        const createMDPStateSpace = () => {
          const stateNodes = [];
          
          // Optimal states cluster (top)
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 3;
            const nodeGeometry = new THREE.TetrahedronGeometry(0.5);
            const nodeMaterial = new THREE.MeshBasicMaterial({
              color: 0xfbbf24,
              wireframe: false
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(
              Math.cos(angle) * radius,
              4,
              Math.sin(angle) * radius
            );
            node.userData = { type: 'optimal', angle, radius };
            scene.add(node);
            stateNodes.push(node);
          }

          // Execution states cluster (middle)
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 4;
            const nodeGeometry = new THREE.OctahedronGeometry(0.6);
            const nodeMaterial = new THREE.MeshBasicMaterial({
              color: 0x3b82f6,
              wireframe: false
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            );
            node.userData = { type: 'execution', angle, radius };
            scene.add(node);
            stateNodes.push(node);
          }

          // Reward states cluster (bottom)
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 2.5;
            const nodeGeometry = new THREE.IcosahedronGeometry(0.4);
            const nodeMaterial = new THREE.MeshBasicMaterial({
              color: 0x10b981,
              wireframe: false
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(
              Math.cos(angle) * radius,
              -4,
              Math.sin(angle) * radius
            );
            node.userData = { type: 'reward', angle, radius };
            scene.add(node);
            stateNodes.push(node);
          }

          // Create connections between layers
          const connections = [];
          for (let i = 0; i < 20; i++) {
            const startNode = stateNodes[Math.floor(Math.random() * stateNodes.length)];
            const endNode = stateNodes[Math.floor(Math.random() * stateNodes.length)];
            
            if (startNode !== endNode) {
              const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
                startNode.position,
                endNode.position
              ]);
              const connectionMaterial = new THREE.LineBasicMaterial({ 
                color: 0x8b5cf6, 
                transparent: true, 
                opacity: 0.3 
              });
              const connection = new THREE.Line(connectionGeometry, connectionMaterial);
              scene.add(connection);
              connections.push(connection);
            }
          }

          console.log('🌊 Created MDP state space with', stateNodes.length, 'states and', connections.length, 'transitions');
          return { stateNodes, connections };
        };

        const { stateNodes, connections } = createMDPStateSpace();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Camera position
        camera.position.set(10, 6, 10);
        camera.lookAt(0, 0, 0);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          try {
            // Rotate state nodes around their centers
            stateNodes.forEach((node, index) => {
              if (node.userData.type === 'optimal') {
                const time = Date.now() * 0.001;
                const newAngle = node.userData.angle + time * 0.5;
                node.position.x = Math.cos(newAngle) * node.userData.radius;
                node.position.z = Math.sin(newAngle) * node.userData.radius;
                node.rotation.y += 0.02;
              } else if (node.userData.type === 'execution') {
                const time = Date.now() * 0.001;
                const newAngle = node.userData.angle - time * 0.3;
                node.position.x = Math.cos(newAngle) * node.userData.radius;
                node.position.z = Math.sin(newAngle) * node.userData.radius;
                node.rotation.x += 0.015;
              } else if (node.userData.type === 'reward') {
                const time = Date.now() * 0.001;
                const newAngle = node.userData.angle + time * 0.8;
                node.position.x = Math.cos(newAngle) * node.userData.radius;
                node.position.z = Math.sin(newAngle) * node.userData.radius;
                
                // Pulsing reward nodes
                const pulse = Math.sin(time * 3 + index) * 0.3 + 1;
                node.scale.setScalar(pulse);
              }
            });

            renderer.render(scene, camera);
          } catch (animError) {
            console.warn('MDP state space animation error:', animError);
          }
        };

        animate();
        sceneRef.current = { scene, stateNodes, connections };
        setThreeJSLoaded(true);
        console.log('✅ 3D MDP State Space loaded successfully!');

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
        console.error('❌ MDP state space visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeMDPStateSpaceVisualization();
  }, [viewMode]);

  return (
    <div className="quantum-mdp-es-center-container">
      {/* 👑 HEADER */}
      <div className="quantum-mdp-es-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🌊 MDP & ES Quantum Excellence Center
            </h1>
            <p className="subtitle">Elite Decision & Evolution Monitoring</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Decision Quality: {(quantumMDPESData.mdpDecisionQuality * 100).toFixed(1)}%
            </div>
            <div className="metric-badge">
              Active States: {quantumMDPESData.activeStates.toLocaleString()}
            </div>
            <div className="metric-badge">
              Quantum Advantage: +{quantumMDPESData.quantumAdvantage}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="quantum-mdp-es-main-grid">
        
        {/* ⚖️ ELITE MDP FRAMEWORK MONITORING */}
        <div className="mdp-monitoring-panel">
          <div className="panel-header">
            <h2>⚖️ Elite MDP Framework Monitoring</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'mdp' ? 'active' : ''}`}
                onClick={() => setViewMode('mdp')}
              >
                ⚖️ MDP
              </button>
              <button 
                className={`view-btn ${viewMode === 'es' ? 'active' : ''}`}
                onClick={() => setViewMode('es')}
              >
                🧬 ES
              </button>
              <button 
                className={`view-btn ${viewMode === 'quantum' ? 'active' : ''}`}
                onClick={() => setViewMode('quantum')}
              >
                🌌 Quantum
              </button>
              <div className="webgl-status">
                {threeJSLoaded && <span className="webgl-success">🌊 3D ACTIVE</span>}
                {threeJSError && <span className="webgl-error">🚨 FALLBACK</span>}
                {!threeJSLoaded && !threeJSError && <span className="webgl-loading">🔄 LOADING</span>}
              </div>
            </div>
          </div>
          
          <div className="visualization-container" ref={mountRef}>
            {(!threeJSLoaded || threeJSError) && (
              <div className="placeholder-visualization">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🌌</div>
                  <h3>3D MDP State Space Visualization</h3>
                  <p>Quantum-Enhanced Decision Framework</p>
                  <div className="state-space-preview">
                    <div className="state-cluster">
                      <div className="state-node optimal">🎯 OPTIMAL STATES</div>
                      <div className="state-connections">/ | \</div>
                    </div>
                    <div className="state-cluster">
                      <div className="state-node execution">⚡ EXECUTION STATES</div>
                      <div className="state-connections">\ | /</div>
                    </div>
                    <div className="state-cluster">
                      <div className="state-node reward">💎 REWARD STATES</div>
                    </div>
                  </div>
                  <div className="quantum-metrics">
                    <span>Quantum-Enhanced: +{quantumMDPESData.quantumAdvantage}% vs classical</span>
                    <span>Decision Quality: {(quantumMDPESData.mdpDecisionQuality * 100).toFixed(1)}%</span>
                  </div>
                  <div className="placeholder-note">
                    {threeJSError ? 
                      "🚨 WebGL fallback mode - MDP preserved" : 
                      "🔄 Loading 3D state space..."
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Decision Info */}
          <div className="current-decision-info">
            <div className="decision-title">
              🎯 Current Decision: "{quantumMDPESData.currentDecision.problem}"
            </div>
            <div className="decision-details">
              <span>📊 MDP Value: ${quantumMDPESData.currentDecision.mdpValue.toLocaleString()}</span>
              <span>🧬 ES Fitness: {quantumMDPESData.currentDecision.esFitness}</span>
              <span>🌌 Quantum Enhancement: +{quantumMDPESData.currentDecision.quantumEnhancement}%</span>
              <span>💰 Expected Reward: ${quantumMDPESData.currentDecision.expectedReward.toLocaleString()}</span>
              <span>✅ Confidence: {(quantumMDPESData.currentDecision.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 🧬 EVOLUTIONARY STRATEGIES MONITORING */}
        <div className="es-monitoring-panel">
          <div className="panel-header">
            <h2>🧬 Evolutionary Strategies Monitoring</h2>
          </div>
          
          <div className="evolution-metrics">
            <h3>🧬 EVOLUTIONARY STRATEGIES MONITORING</h3>
            <div className="evolution-overview">
              <div className="evolution-metric">
                <span>Active Evolution Cycles:</span>
                <span className="metric-value">{quantumMDPESData.evolutionaryStrategies.activeCycles}</span>
              </div>
              <div className="evolution-metric">
                <span>Genetic Algorithm Performance:</span>
                <span className="performance-value">+{quantumMDPESData.evolutionaryStrategies.geneticPerformance}% vs classical</span>
              </div>
              <div className="evolution-metric">
                <span>Agent Fitness Improvements:</span>
                <span className="fitness-value">+{(quantumMDPESData.evolutionaryStrategies.agentFitnessImprovements * 100).toFixed(1)}% average</span>
              </div>
              <div className="evolution-metric">
                <span>Mutation Success Rate:</span>
                <span className="mutation-value">{(quantumMDPESData.evolutionaryStrategies.mutationSuccessRate * 100).toFixed(1)}%</span>
              </div>
              <div className="evolution-metric">
                <span>Crossover Optimization:</span>
                <span className="crossover-value">+{quantumMDPESData.evolutionaryStrategies.crossoverOptimization}% offspring quality</span>
              </div>
              <div className="evolution-metric">
                <span>Selection Pressure:</span>
                <span className="selection-value">{quantumMDPESData.evolutionaryStrategies.selectionPressure}</span>
              </div>
            </div>
          </div>

          {/* Quantum Decision Flow */}
          <div className="quantum-decision-flow">
            <h4>🌌 Quantum Decision Flow</h4>
            <div className="decision-flow-stages">
              {quantumMDPESData.quantumDecisionFlow.map((stage, index) => (
                <div key={index} className="flow-stage">
                  <div className="stage-header">
                    <span className="stage-name">{stage.stage}</span>
                    <span className="stage-status">✅ {stage.status}</span>
                  </div>
                  <div className="stage-comparison">
                    <div className="comparison-item">
                      <span>Quantum:</span>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill quantum-fill"
                          style={{ width: `${stage.quantum * 100}%` }}
                        ></div>
                      </div>
                      <span className="performance-value">{(stage.quantum * 100).toFixed(1)}%</span>
                    </div>
                    <div className="comparison-item">
                      <span>Classical:</span>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill classical-fill"
                          style={{ width: `${stage.classical * 100}%` }}
                        ></div>
                      </div>
                      <span className="performance-value">{(stage.classical * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .quantum-mdp-es-center-container {
          background: linear-gradient(135deg, #0f1419 0%, #1e3a5f 50%, #0f1419 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .quantum-mdp-es-header {
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
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #1d4ed8 100%);
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

        .status-badge, .metric-badge, .data-source-badge {
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
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .quantum-mdp-es-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .mdp-monitoring-panel, .es-monitoring-panel {
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
          align-items: center;
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
          height: 450px;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1px solid rgba(6, 182, 212, 0.3);
          position: relative;
          background: #0f1419;
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
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%);
          z-index: 1;
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

        .state-space-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
        }

        .state-cluster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .state-node {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .state-node.optimal {
          background: rgba(251, 191, 36, 0.3);
          border: 1px solid rgba(251, 191, 36, 0.5);
          color: #fbbf24;
        }

        .state-node.execution {
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .state-node.reward {
          background: rgba(16, 185, 129, 0.3);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #10b981;
        }

        .state-connections {
          font-size: 1.5rem;
          color: #6b7280;
          font-family: monospace;
        }

        .quantum-metrics {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .quantum-metrics span {
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .placeholder-note {
          font-size: 0.875rem;
          opacity: 0.6;
          font-style: italic;
          margin-top: 1rem;
        }

        .current-decision-info {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #06b6d4;
        }

        .decision-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fbbf24;
        }

        .decision-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .decision-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .evolution-metrics {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .evolution-metrics h3 {
          margin: 0 0 1rem 0;
          color: #06b6d4;
        }

        .evolution-overview {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .evolution-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .evolution-metric span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .metric-value {
          color: #06b6d4;
          font-weight: 600;
        }

        .performance-value {
          color: #10b981;
          font-weight: 600;
        }

        .fitness-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .mutation-value {
          color: #8b5cf6;
          font-weight: 600;
        }

        .crossover-value {
          color: #f59e0b;
          font-weight: 600;
        }

        .selection-value {
          color: #10b981;
          font-weight: 600;
        }

        .quantum-decision-flow {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .quantum-decision-flow h4 {
          margin: 0 0 1rem 0;
          color: #8b5cf6;
        }

        .decision-flow-stages {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .flow-stage {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #6b7280;
        }

        .stage-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .stage-name {
          font-weight: 600;
          color: #06b6d4;
        }

        .stage-status {
          font-size: 0.875rem;
          color: #10b981;
        }

        .stage-comparison {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .comparison-item {
          display: grid;
          grid-template-columns: 80px 1fr 60px;
          gap: 1rem;
          align-items: center;
        }

        .comparison-item span:first-child {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .performance-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .performance-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .quantum-fill {
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
        }

        .classical-fill {
          background: linear-gradient(90deg, #6b7280, #4b5563);
        }

        .performance-value {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 1024px) {
          .quantum-mdp-es-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .state-space-preview {
            gap: 0.5rem;
          }
          
          .quantum-metrics {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default QuantumMDPESCenter;
