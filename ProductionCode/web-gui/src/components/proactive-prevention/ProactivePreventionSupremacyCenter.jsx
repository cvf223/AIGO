import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🛡️💎 PROACTIVE PREVENTION SUPREMACY CENTER
 * =======================================
 * 
 * Elite Threat Mitigation HQ featuring real-time threat landscape visualization,
 * agent-specific prevention tracking, and pitfall type classification excellence
 * 
 * Source: web-gui/src/components/proactive-prevention/ProactivePreventionSupremacyCenter.jsx
 */

const ProactivePreventionSupremacyCenter = () => {
  // 🛡️ PROACTIVE PREVENTION STATE
  const [preventionData, setPreventionData] = useState({
    status: "ACTIVE",
    threatsDetected: 12847,
    preventionSuccess: 0.987,
    threatZones: {
      secured: { prevention: 0.987, agents: 8, color: '#10b981' },
      warning: { prevention: 0.912, agents: 3, color: '#f59e0b' },
      critical: { prevention: 0.873, agents: 1, color: '#ef4444' }
    },
    agentPreventionPerformance: [
      { agent: "AI-Prediction", pitfallType: "Hallucination", prevented: 847, success: 0.987, tier: "ELITE" },
      { agent: "Elite-Developer", pitfallType: "Security Flaw", prevented: 234, success: 0.992, tier: "MASTER" },
      { agent: "LLM-Gardener", pitfallType: "Model Collapse", prevented: 89, success: 0.978, tier: "ELITE" },
      { agent: "Judge-Service", pitfallType: "Reward Hacking", prevented: 156, success: 0.964, tier: "EXPERT" },
      { agent: "Arbitrum-Flash", pitfallType: "MEV Sandwich", prevented: 456, success: 0.947, tier: "ADVANCED" }
    ],
    detailedPreventionSession: {
      sessionId: "PPS-2025-156891",
      agent: "Elite-Developer",
      threat: "Potential security vulnerability in new contract code",
      timestamp: "September 15, 2025 15:42:33",
      responseTime: 0.23,
      phases: [
        {
          phase: 1,
          name: "Credibility Pipeline Analysis",
          status: "PASSED",
          details: "Source validation: ✅ PASSED (Tier 1 source - vitalik.eth), Multi-source corroboration: ✅ PASSED (3 sources confirm), Knowledge quality: 97.3%, Credibility score: 0.97"
        },
        {
          phase: 2,
          name: "Inference Reliability Check", 
          status: "PASSED",
          details: "Uncertainty quantification: 0.03 (Low uncertainty), Self-correction loop: ✅ COMPLETED (2 iterations), Cross-modal validation: ✅ PASSED (Code + Documentation), Reliability score: 0.94"
        },
        {
          phase: 3,
          name: "Veracity Judge Validation",
          status: "RISK_DETECTED",
          details: "Security analysis: ⚠️ RISK DETECTED (Reentrancy vulnerability), Formal verification: ❌ FAILED (Proof incomplete), Code safety score: 0.67 (Below threshold 0.85), Judge decision: 🚨 PREVENTION TRIGGERED"
        },
        {
          phase: 4,
          name: "Prevention Action",
          status: "BLOCKED",
          details: "Code deployment: ❌ BLOCKED (Security risk), Agent notification: ✅ SENT (Improvement suggestions), Alternative generation: ✅ TRIGGERED (Secure version requested), Learning update: ✅ APPLIED (Vulnerability pattern learned)"
        }
      ],
      outcome: {
        success: "Security vulnerability prevented before deployment",
        economicImpact: 47830,
        learningOutcome: "Reentrancy detection improved by 23%"
      }
    },
    threatLandscape: {
      totalThreats: 12847,
      activeMonitoring: 487,
      preventionLayers: 5,
      responseTime: 0.23
    }
  });

  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedPitfall, setSelectedPitfall] = useState('all');
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🌍 3D THREAT LANDSCAPE VISUALIZATION
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeThreatLandscapeVisualization = async () => {
      try {
        console.log('🛡️ Initializing 3D Threat Landscape...');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current.clientWidth / mountRef.current.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x0a0a0a, 1);
        
        // Canvas styling
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '10';

        mountRef.current.appendChild(renderer.domElement);

        // 🛡️ CREATE THREAT LANDSCAPE MATRIX
        const createThreatLandscape = () => {
          const threatZones = [];
          
          // Create threat zone grid
          const gridSize = 12;
          for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
              const distance = Math.sqrt((x - gridSize/2) ** 2 + (z - gridSize/2) ** 2);
              
              // Determine zone type based on distance from center
              let zoneType, zoneColor, zoneHeight;
              if (distance < 2) {
                zoneType = 'critical';
                zoneColor = 0xff4444;
                zoneHeight = 2.0;
              } else if (distance < 4) {
                zoneType = 'warning';
                zoneColor = 0xffaa00;
                zoneHeight = 1.0;
              } else {
                zoneType = 'secured';
                zoneColor = 0x44ff44;
                zoneHeight = 0.5;
              }
              
              const cubeGeometry = new THREE.BoxGeometry(0.8, zoneHeight, 0.8);
              const cubeMaterial = new THREE.MeshBasicMaterial({
                color: zoneColor,
                transparent: true,
                opacity: 0.7
              });
              
              const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
              cube.position.set(
                (x - gridSize/2) * 1.2,
                zoneHeight / 2,
                (z - gridSize/2) * 1.2
              );
              cube.userData = { zoneType, x, z };
              scene.add(cube);
              threatZones.push(cube);
            }
          }

          // Add threat indicators (floating spheres)
          for (let i = 0; i < 20; i++) {
            const threatGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const threatMaterial = new THREE.MeshBasicMaterial({
              color: Math.random() > 0.7 ? 0xff0000 : 0xffff00,
              transparent: true,
              opacity: 0.8
            });
            
            const threat = new THREE.Mesh(threatGeometry, threatMaterial);
            threat.position.set(
              (Math.random() - 0.5) * 12,
              1 + Math.random() * 3,
              (Math.random() - 0.5) * 12
            );
            threat.userData = { 
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.02
              )
            };
            scene.add(threat);
            threatZones.push(threat);
          }

          console.log('🛡️ Created threat landscape with', threatZones.length, 'threat zones and indicators');
          return threatZones;
        };

        const threatZones = createThreatLandscape();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        // Camera position
        camera.position.set(8, 12, 8);
        camera.lookAt(0, 0, 0);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          try {
            // Animate threat indicators
            threatZones.forEach((zone) => {
              if (zone.userData.velocity) {
                // Moving threat indicators
                zone.position.add(zone.userData.velocity);
                
                // Boundary check
                if (Math.abs(zone.position.x) > 8 || Math.abs(zone.position.z) > 8) {
                  zone.position.set(
                    (Math.random() - 0.5) * 4,
                    1 + Math.random() * 3,
                    (Math.random() - 0.5) * 4
                  );
                }
                
                // Pulsing animation
                const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1;
                zone.scale.setScalar(pulse);
              } else {
                // Static zone pulsing
                const pulse = Math.sin(Date.now() * 0.002 + zone.userData.x + zone.userData.z) * 0.1 + 1;
                zone.scale.y = pulse;
              }
            });

            renderer.render(scene, camera);
          } catch (animError) {
            console.warn('Threat landscape animation error:', animError);
          }
        };

        animate();
        sceneRef.current = { scene, threatZones };
        setThreeJSLoaded(true);
        console.log('✅ 3D Threat Landscape loaded successfully!');

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
        console.error('❌ Threat landscape visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeThreatLandscapeVisualization();
  }, []);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'ELITE': return '#fbbf24';
      case 'MASTER': return '#10b981';
      case 'EXPERT': return '#06b6d4';
      case 'ADVANCED': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'ELITE': return '🏆';
      case 'MASTER': return '🏆';
      case 'EXPERT': return '🥈';
      case 'ADVANCED': return '🥉';
      default: return '⚪';
    }
  };

  return (
    <div className="proactive-prevention-center-container">
      {/* 👑 HEADER */}
      <div className="proactive-prevention-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🛡️ Proactive Prevention Supremacy Center
            </h1>
            <p className="subtitle">Elite Threat Mitigation HQ</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Threats Detected: {preventionData.threatsDetected.toLocaleString()}
            </div>
            <div className="metric-badge">
              Success: {(preventionData.preventionSuccess * 100).toFixed(1)}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="proactive-prevention-main-grid">
        
        {/* 🚨 REAL-TIME THREAT LANDSCAPE VISUALIZATION */}
        <div className="threat-landscape-panel">
          <div className="panel-header">
            <h2>🚨 Real-Time Threat Landscape Visualization</h2>
            <div className="landscape-controls">
              <button className="control-btn">🔄 Real-time</button>
              <button className="control-btn">🔍 Zoom Threats</button>
              <button className="control-btn">⚡ Animate</button>
              <button className="control-btn">📊 Analytics</button>
              <div className="webgl-status">
                {threeJSLoaded && <span className="webgl-success">🛡️ 3D ACTIVE</span>}
                {threeJSError && <span className="webgl-error">🚨 FALLBACK</span>}
                {!threeJSLoaded && !threeJSError && <span className="webgl-loading">🔄 LOADING</span>}
              </div>
            </div>
          </div>
          
          <div className="visualization-container" ref={mountRef}>
            {(!threeJSLoaded || threeJSError) && (
              <div className="placeholder-visualization">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🌍</div>
                  <h3>Live Threat Detection Matrix</h3>
                  <p>Real-time threat landscape monitoring</p>
                  <div className="threat-zones-preview">
                    <div className="zone-row">
                      <div className="zone secured-zone">🟢🟢🟢 SECURED ZONES</div>
                      <div className="zone warning-zone">🟡🟡🟡 WARNING ZONES</div>
                      <div className="zone critical-zone">🔴🔴 CRITICAL ZONES</div>
                    </div>
                    <div className="zone-stats">
                      <div>Prevention: 98.7% | 91.2% | 87.3%</div>
                      <div>Agents: 8 Protected | 3 Monitored | 1 Under Review</div>
                    </div>
                  </div>
                  <div className="placeholder-note">
                    {threeJSError ? 
                      "🚨 WebGL fallback mode - threat monitoring preserved" : 
                      "🔄 Loading 3D threat landscape..."
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Threat Zone Summary */}
          <div className="threat-zones-summary">
            <div className="zone-summary secured">
              <div className="zone-header">
                <span className="zone-icon">🟢</span>
                <span className="zone-title">SECURED ZONES</span>
              </div>
              <div className="zone-stats">
                <div>Prevention: {(preventionData.threatZones.secured.prevention * 100).toFixed(1)}%</div>
                <div>Agents: {preventionData.threatZones.secured.agents} Protected</div>
              </div>
            </div>
            <div className="zone-summary warning">
              <div className="zone-header">
                <span className="zone-icon">🟡</span>
                <span className="zone-title">WARNING ZONES</span>
              </div>
              <div className="zone-stats">
                <div>Prevention: {(preventionData.threatZones.warning.prevention * 100).toFixed(1)}%</div>
                <div>Agents: {preventionData.threatZones.warning.agents} Monitored</div>
              </div>
            </div>
            <div className="zone-summary critical">
              <div className="zone-header">
                <span className="zone-icon">🔴</span>
                <span className="zone-title">CRITICAL ZONES</span>
              </div>
              <div className="zone-stats">
                <div>Prevention: {(preventionData.threatZones.critical.prevention * 100).toFixed(1)}%</div>
                <div>Agents: {preventionData.threatZones.critical.agents} Under Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 DETAILED PREVENTION ANALYSIS */}
        <div className="prevention-analysis-panel">
          <div className="panel-header">
            <h2>🛡️ Detailed Prevention Analysis</h2>
          </div>
          
          <div className="prevention-session-detail">
            <h3>🎯 ELITE-DEVELOPER PROACTIVE PREVENTION SESSION #{preventionData.detailedPreventionSession.sessionId}</h3>
            
            <div className="session-overview">
              <div className="session-threat">
                🚨 THREAT DETECTED: {preventionData.detailedPreventionSession.threat}
              </div>
              <div className="session-meta">
                📅 Session: {preventionData.detailedPreventionSession.timestamp} | ⏱️ Response: {preventionData.detailedPreventionSession.responseTime}s
              </div>
            </div>

            <div className="prevention-process">
              <h4>🛡️ PROACTIVE PREVENTION PROCESS</h4>
              <div className="process-phases">
                {preventionData.detailedPreventionSession.phases.map((phase, index) => (
                  <div key={index} className={`prevention-phase phase-${phase.status.toLowerCase().replace('_', '-')}`}>
                    <div className="phase-header">
                      <span className="phase-number">Phase {phase.phase}:</span>
                      <span className="phase-name">{phase.name}</span>
                      <span className="phase-status">
                        {phase.status === 'PASSED' && '✅ PASSED'}
                        {phase.status === 'RISK_DETECTED' && '⚠️ RISK DETECTED'}
                        {phase.status === 'BLOCKED' && '❌ BLOCKED'}
                      </span>
                    </div>
                    <div className="phase-details">
                      {phase.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="prevention-outcome">
              <h4>🏆 PREVENTION SUCCESS</h4>
              <div className="outcome-details">
                <div className="outcome-item">
                  <span>Success:</span>
                  <span className="success-value">{preventionData.detailedPreventionSession.outcome.success}</span>
                </div>
                <div className="outcome-item">
                  <span>Economic Impact:</span>
                  <span className="economic-value">${preventionData.detailedPreventionSession.outcome.economicImpact.toLocaleString()} potential loss avoided</span>
                </div>
                <div className="outcome-item">
                  <span>Learning Outcome:</span>
                  <span className="learning-value">{preventionData.detailedPreventionSession.outcome.learningOutcome}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 📊 PROACTIVE PREVENTION ANALYTICS - AGENT SORTED */}
      <div className="prevention-analytics-panel">
        <div className="panel-header">
          <h2>📊 Proactive Prevention Analytics - Agent Sorted</h2>
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
            <select 
              value={selectedPitfall} 
              onChange={(e) => setSelectedPitfall(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Pitfall Types</option>
              <option value="Hallucination">🧠 Hallucination</option>
              <option value="Security Flaw">🔐 Security Flaw</option>
              <option value="Model Collapse">🌀 Model Collapse</option>
              <option value="Reward Hacking">🎭 Reward Hacking</option>
              <option value="MEV Sandwich">⚡ MEV Sandwich</option>
            </select>
          </div>
        </div>
        
        <div className="analytics-table">
          <div className="table-header">
            <div>Agent</div>
            <div>Pitfall Type Avoided</div>
            <div>Prevented Today</div>
            <div>Prevention Success Rate</div>
          </div>
          {preventionData.agentPreventionPerformance
            .filter(agent => (selectedAgent === 'all' || agent.agent === selectedAgent) && 
                           (selectedPitfall === 'all' || agent.pitfallType === selectedPitfall))
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
              <div className="pitfall-cell">
                {agent.pitfallType === 'Hallucination' && '🧠'} 
                {agent.pitfallType === 'Security Flaw' && '🔐'}
                {agent.pitfallType === 'Model Collapse' && '🌀'}
                {agent.pitfallType === 'Reward Hacking' && '🎭'}
                {agent.pitfallType === 'MEV Sandwich' && '⚡'}
                {agent.pitfallType}
              </div>
              <div className="prevented-count">{agent.prevented}</div>
              <div>
                <span 
                  className="success-rate" 
                  style={{ color: getTierColor(agent.tier) }}
                >
                  {(agent.success * 100).toFixed(1)}% {getTierIcon(agent.tier)} {agent.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .proactive-prevention-center-container {
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .proactive-prevention-header {
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
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
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

        .proactive-prevention-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .threat-landscape-panel, .prevention-analysis-panel, .prevention-analytics-panel {
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

        .landscape-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: rgba(239, 68, 68, 0.4);
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
          border: 1px solid rgba(239, 68, 68, 0.3);
          position: relative;
          background: #0a0a0a;
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
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%);
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
          color: #ef4444;
        }

        .placeholder-content p {
          margin: 0 0 1rem 0;
          opacity: 0.8;
        }

        .threat-zones-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }

        .zone-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .zone {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .secured-zone {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .warning-zone {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        .critical-zone {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .zone-stats {
          text-align: center;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .zone-stats div {
          margin-bottom: 0.25rem;
        }

        .placeholder-note {
          font-size: 0.875rem;
          opacity: 0.6;
          font-style: italic;
          margin-top: 1rem;
        }

        .threat-zones-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .zone-summary {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .zone-summary.secured {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .zone-summary.warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .zone-summary.critical {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .zone-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .zone-icon {
          font-size: 1.5rem;
        }

        .zone-title {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .zone-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .zone-stats div {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .prevention-session-detail {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .prevention-session-detail h3 {
          margin: 0 0 1rem 0;
          color: #fbbf24;
          font-size: 1.125rem;
        }

        .session-overview {
          margin-bottom: 1.5rem;
        }

        .session-threat {
          font-weight: 600;
          color: #ef4444;
          margin-bottom: 0.5rem;
        }

        .session-meta {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .prevention-process h4 {
          margin: 0 0 1rem 0;
          color: #ef4444;
        }

        .process-phases {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prevention-phase {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #6b7280;
        }

        .prevention-phase.phase-passed {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .prevention-phase.phase-risk-detected {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .prevention-phase.phase-blocked {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .phase-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .phase-number {
          font-weight: 600;
          color: #fbbf24;
        }

        .phase-name {
          flex: 1;
          font-weight: 600;
        }

        .phase-status {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .phase-details {
          font-size: 0.9rem;
          line-height: 1.6;
          opacity: 0.9;
        }

        .prevention-outcome {
          margin-top: 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #10b981;
        }

        .prevention-outcome h4 {
          margin: 0 0 1rem 0;
          color: #10b981;
        }

        .outcome-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .outcome-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .outcome-item span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .success-value {
          color: #10b981;
          font-weight: 600;
        }

        .economic-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .learning-value {
          color: #06b6d4;
          font-weight: 600;
        }

        .prevention-analytics-panel {
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
          grid-template-columns: 2fr 2fr 1fr 2fr;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .table-header {
          background: rgba(239, 68, 68, 0.2);
          font-weight: 600;
        }

        .table-row {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .agent-cell, .pitfall-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .prevented-count {
          color: #8b5cf6;
          font-weight: 600;
        }

        .success-rate {
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .proactive-prevention-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .threat-zones-summary {
            grid-template-columns: 1fr;
          }
          
          .zone-row {
            flex-direction: column;
            align-items: center;
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

export default ProactivePreventionSupremacyCenter;
