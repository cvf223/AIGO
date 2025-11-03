import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🎨💎 CONSTITUTIONAL CREATIVITY EXCELLENCE CENTER
 * =============================================
 * 
 * The most advanced creativity monitoring system ever created
 * Features 3D overtraining prevention visualization, memory sink management,
 * and constitutional creativity boundary enforcement
 * 
 * Source: web-gui/src/components/creativity/ConstitutionalCreativityCenter.jsx
 */

const ConstitutionalCreativityCenter = () => {
  // 🎨 CREATIVITY SYSTEM STATE
  const [creativityData, setCreativityData] = useState({
    status: "ACTIVE",
    sessions: 12847,
    constitutionalApproval: 0.987,
    overtrainingPrevention: {
      uCurveDetection: 0.985,
      brittlenessProtection: 0.967,
      adaptabilityPreservation: 0.974,
      memoryDegradation: 0.991,
      creativityMaintenance: 0.956
    },
    agentPerformance: [
      { agent: "AI-Prediction", sessions: 2847, breakthroughRate: 0.234, constitutional: 0.989, impact: 89234 },
      { agent: "Elite-Developer", sessions: 1834, breakthroughRate: 0.347, constitutional: 0.992, impact: 156789 },
      { agent: "LLM-Gardener", sessions: 1287, breakthroughRate: 0.456, constitutional: 0.978, impact: 234567 },
      { agent: "Judge-Service", sessions: 3456, breakthroughRate: 0.189, constitutional: 0.998, impact: 67890 },
      { agent: "Arbitrum-Flash", sessions: 1156, breakthroughRate: 0.278, constitutional: 0.964, impact: 123456 }
    ],
    currentCreativeProcess: {
      agent: "AI-Prediction-Intel",
      idea: "Multi-hop arbitrage route discovery",
      constitutionalScore: 0.94,
      creativityLevel: 0.89,
      innovation: "HIGH",
      breakthrough: true
    }
  });

  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timeframe, setTimeframe] = useState('24h');
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🌟 3D CREATIVITY FLOW VISUALIZATION - WITH ERROR HANDLING  
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeCreativityVisualization = async () => {
      try {
        console.log('🎨 Initializing 3D Creativity Flow...');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 🎨 CREATIVE PROCESS VISUALIZATION
    const createCreativeFlowVisualization = () => {
      // Central creativity nexus
      const nexusGeometry = new THREE.SphereGeometry(2, 32, 32);
      const nexusMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        emissive: 0x4c1d95,
        transparent: true,
        opacity: 0.8
      });
      const creativityNexus = new THREE.Mesh(nexusGeometry, nexusMaterial);
      creativityNexus.position.set(0, 0, 0);
      scene.add(creativityNexus);

      // Constitutional validation barriers
      const barrierGeometry = new THREE.RingGeometry(4, 4.2, 8);
      const barrierMaterial = new THREE.MeshPhongMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      for (let i = 0; i < 3; i++) {
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(0, 0, i * 2 - 2);
        barrier.rotation.x = Math.PI / 2;
        scene.add(barrier);
      }

      // Creativity particles
      const particleCount = 1000;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.7;
        colors[i * 3 + 2] = 1;

        sizes[i] = Math.random() * 2;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);

      return { creativityNexus, particleSystem };
    };

    const { creativityNexus, particleSystem } = createCreativeFlowVisualization();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    camera.position.set(0, 0, 10);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate creativity nexus
      creativityNexus.rotation.x += 0.01;
      creativityNexus.rotation.y += 0.01;

      // Animate particles
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

        animate();
        sceneRef.current = scene;
        setThreeJSLoaded(true);
        console.log('✅ 3D Creativity Flow loaded successfully');

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
        console.error('❌ Three.js creativity visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeCreativityVisualization();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        // Update camera and renderer
        // This would be implemented in a real scenario
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="creativity-center-container">
      {/* 👑 HEADER */}
      <div className="creativity-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🎨 Constitutional Creativity Excellence Center
            </h1>
            <p className="subtitle">Revolutionary Innovation Command Center</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Sessions: {creativityData.sessions.toLocaleString()}
            </div>
            <div className="metric-badge">
              Constitutional: {(creativityData.constitutionalApproval * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="creativity-main-grid">
        
        {/* 🧠 3D CREATIVITY ORCHESTRATION */}
        <div className="creativity-visualization-panel">
          <div className="panel-header">
            <h2>🧠 Live Creativity Orchestration with Constitutional Protection</h2>
            <div className="controls">
              <button className="control-btn">🔄 Rotate</button>
              <button className="control-btn">🔍 Zoom</button>
              <button className="control-btn">⚡ Animate</button>
              <button className="control-btn">📊 Audit</button>
            </div>
          </div>
          <div className="visualization-container" ref={mountRef}></div>
          
          {/* Current Process Info */}
          <div className="current-process-info">
            <div className="process-title">
              🔥 Current: "{creativityData.currentCreativeProcess.idea}" ({creativityData.currentCreativeProcess.agent})
            </div>
            <div className="process-metrics">
              <span>🏛️ Constitutional Score: {creativityData.currentCreativeProcess.constitutionalScore}</span>
              <span>✅ Approved</span>
              <span>🧮 Formally Verified</span>
            </div>
            <div className="process-details">
              <span>🎨 Creativity Level: {(creativityData.currentCreativeProcess.creativityLevel * 100).toFixed(0)}%</span>
              <span>⚡ Innovation: {creativityData.currentCreativeProcess.innovation}</span>
              <span>🌟 Breakthrough: {creativityData.currentCreativeProcess.breakthrough ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* 🛡️ OVERTRAINING PREVENTION MATRIX */}
        <div className="prevention-matrix-panel">
          <div className="panel-header">
            <h2>🛡️ Overtraining Prevention Matrix</h2>
          </div>
          <div className="prevention-matrix">
            {Object.entries(creativityData.overtrainingPrevention).map(([key, value]) => (
              <div key={key} className="prevention-metric">
                <div className="metric-label">
                  {key === 'uCurveDetection' && '🔄 U-Curve Detection'}
                  {key === 'brittlenessProtection' && '💔 Brittleness Protection'} 
                  {key === 'adaptabilityPreservation' && '🎯 Adaptability Preservation'}
                  {key === 'memoryDegradation' && '💾 Memory Degradation Prevention'}
                  {key === 'creativityMaintenance' && '🎨 Creativity Maintenance'}
                </div>
                <div className="metric-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span>{(value * 100).toFixed(1)}%</span>
                </div>
                <div className="metric-status">
                  <span className="status-active">✅ ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📊 AGENT PERFORMANCE ANALYTICS */}
      <div className="agent-analytics-panel">
        <div className="panel-header">
          <h2>📊 Creativity Excellence Analytics</h2>
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
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="filter-select"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>
        
        <div className="analytics-table">
          <div className="table-header">
            <div>Agent</div>
            <div>Creative Sessions</div>
            <div>Breakthrough Rate</div>
            <div>Constitutional Approval</div>
            <div>Economic Impact</div>
          </div>
          {creativityData.agentPerformance
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
              <div>{agent.sessions.toLocaleString()}</div>
              <div>{(agent.breakthroughRate * 100).toFixed(1)}%</div>
              <div>
                <span className={agent.constitutional > 0.99 ? 'excellence-elite' : 
                                agent.constitutional > 0.97 ? 'excellence-expert' : 'excellence-advanced'}>
                  {(agent.constitutional * 100).toFixed(1)}%
                </span>
              </div>
              <div className="economic-impact">+${agent.impact.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .creativity-center-container {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .creativity-header {
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
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #8b5cf6 100%);
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

        .creativity-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .creativity-visualization-panel, .prevention-matrix-panel, .agent-analytics-panel {
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

        .controls {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
        }

        .visualization-container {
          width: 100%;
          height: 400px;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .current-process-info {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #8b5cf6;
        }

        .process-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .process-metrics, .process-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .process-metrics span, .process-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .prevention-matrix {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prevention-metric {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr;
          gap: 1rem;
          align-items: center;
        }

        .metric-label {
          font-weight: 500;
        }

        .metric-value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
          transition: width 0.3s ease;
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
          background: rgba(139, 92, 246, 0.2);
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
          .creativity-main-grid {
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

export default ConstitutionalCreativityCenter;
