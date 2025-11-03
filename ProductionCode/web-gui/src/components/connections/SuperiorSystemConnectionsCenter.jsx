import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🔗💎 SUPERIOR SYSTEM CONNECTIONS SUPREMACY CENTER
 * ===============================================
 * 
 * Deep Integration Command Center featuring real-time system interconnection monitoring,
 * 7-layer connection orchestration, and quantum-enhanced communication excellence
 * 
 * Source: web-gui/src/components/connections/SuperiorSystemConnectionsCenter.jsx
 */

const SuperiorSystemConnectionsCenter = () => {
  // 🔗 CONNECTION SYSTEM STATE
  const [connectionData, setConnectionData] = useState({
    status: "ACTIVE",
    connections: 1247,
    systemsConnected: 487,
    connectionHealth: 0.987,
    layers: [
      { layer: 1, name: "Constitutional Validation", systems: 487, health: 1.000 },
      { layer: 2, name: "Formal Verification", systems: 89, health: 0.989 },
      { layer: 3, name: "Quantum Enhancement", systems: 67, health: 0.973 },
      { layer: 4, name: "Data Flow", systems: 134, health: 0.968 },
      { layer: 5, name: "Event Propagation", systems: 298, health: 0.982 },
      { layer: 6, name: "Collective Intelligence", systems: 156, health: 0.991 },
      { layer: 7, name: "Performance Optimization", systems: 487, health: 0.987 }
    ],
    connectionTypes: [
      { type: "Constitutional", activeLinks: 487, efficiency: 0.998, compliance: 1.000, enhancement: 789 },
      { type: "Formal Reasoning", activeLinks: 89, efficiency: 0.989, compliance: 0.992, enhancement: 634 },
      { type: "Quantum Enhanced", activeLinks: 67, efficiency: 0.973, compliance: 0.987, enhancement: 1247 },
      { type: "Data Flow", activeLinks: 134, efficiency: 0.968, compliance: 0.978, enhancement: 456 },
      { type: "Intelligence", activeLinks: 156, efficiency: 0.982, compliance: 0.991, enhancement: 567 }
    ],
    currentFocus: "Cross-Learning Intelligence Sharing Network",
    avgLatency: 23,
    quantumAdvantage: 1247
  });

  const [selectedLayer, setSelectedLayer] = useState(1);
  const [viewMode, setViewMode] = useState('network'); // network, flow, analytics
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🌊 3D CONNECTION NETWORK VISUALIZATION
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeConnectionVisualization = async () => {
      try {
        console.log('🔗 Initializing 3D Connection Network...');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);

        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current.clientWidth / mountRef.current.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x0a0a1a, 1);
        
        // Canvas styling
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '10';

        mountRef.current.appendChild(renderer.domElement);

        // 🔗 CREATE 7-LAYER CONNECTION NETWORK
        const layerNodes = [];
        const layerConnections = [];
        
        // Create nodes for each layer
        for (let layer = 0; layer < 7; layer++) {
          const layerRadius = 3 + layer * 1.5;
          const nodesInLayer = 6 + layer * 2;
          const layerColor = [0xff6b6b, 0xffa500, 0xffff00, 0x00ff00, 0x00ffff, 0x6666ff, 0xff00ff][layer];
          
          for (let i = 0; i < nodesInLayer; i++) {
            const angle = (i / nodesInLayer) * Math.PI * 2;
            const x = Math.cos(angle) * layerRadius;
            const z = Math.sin(angle) * layerRadius;
            const y = (layer - 3) * 2; // Spread layers vertically
            
            const nodeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const nodeMaterial = new THREE.MeshBasicMaterial({
              color: layerColor,
              transparent: true,
              opacity: 0.8
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(x, y, z);
            node.userData = { layer, index: i, originalPos: { x, y, z } };
            scene.add(node);
            layerNodes.push(node);
            
            // Create connections between layers
            if (layer > 0 && Math.random() > 0.6) {
              const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(0, 0, 0) // Connect to center
              ]);
              const connectionMaterial = new THREE.LineBasicMaterial({ 
                color: layerColor, 
                transparent: true, 
                opacity: 0.4 
              });
              const connection = new THREE.Line(connectionGeometry, connectionMaterial);
              scene.add(connection);
              layerConnections.push(connection);
            }
          }
        }

        // Central hub
        const hubGeometry = new THREE.IcosahedronGeometry(1.2);
        const hubMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: true
        });
        const centralHub = new THREE.Mesh(hubGeometry, hubMaterial);
        scene.add(centralHub);

        console.log('🔗 Created 7-layer network with', layerNodes.length, 'nodes and', layerConnections.length, 'connections');

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Camera position
        camera.position.set(12, 8, 12);
        camera.lookAt(0, 0, 0);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          try {
            // Rotate central hub
            if (centralHub) {
              centralHub.rotation.x += 0.01;
              centralHub.rotation.y += 0.015;
            }

            // Animate layer nodes
            layerNodes.forEach((node, index) => {
              const time = Date.now() * 0.001;
              const pulse = Math.sin(time * 2 + index * 0.1) * 0.1 + 1;
              node.scale.setScalar(pulse);
              
              // Subtle orbital motion
              const orbitSpeed = 0.2;
              const angle = time * orbitSpeed + index * 0.1;
              const originalPos = node.userData.originalPos;
              node.position.x = originalPos.x + Math.cos(angle) * 0.5;
              node.position.z = originalPos.z + Math.sin(angle) * 0.5;
            });

            renderer.render(scene, camera);
          } catch (animError) {
            console.warn('Connection animation error:', animError);
          }
        };

        animate();
        sceneRef.current = { scene, centralHub, layerNodes, layerConnections };
        setThreeJSLoaded(true);
        console.log('✅ Superior System Connections loaded successfully!');

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
        console.error('❌ Connection visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeConnectionVisualization();
  }, [viewMode]);

  return (
    <div className="connections-center-container">
      {/* 👑 HEADER */}
      <div className="connections-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🔗 Superior System Connections Supremacy Center
            </h1>
            <p className="subtitle">Deep Integration Command Center</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Connections: {connectionData.connections.toLocaleString()}
            </div>
            <div className="metric-badge">
              Systems: {connectionData.systemsConnected}
            </div>
            <div className="metric-badge">
              Health: {(connectionData.connectionHealth * 100).toFixed(1)}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="connections-main-grid">
        
        {/* 🔗 CONNECTION NETWORK VISUALIZATION */}
        <div className="network-visualization-panel">
          <div className="panel-header">
            <h2>🌊 Live System Interconnection Monitoring</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'network' ? 'active' : ''}`}
                onClick={() => setViewMode('network')}
              >
                🕸️ Network
              </button>
              <button 
                className={`view-btn ${viewMode === 'flow' ? 'active' : ''}`}
                onClick={() => setViewMode('flow')}
              >
                🌊 Flow
              </button>
              <button 
                className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
                onClick={() => setViewMode('analytics')}
              >
                📊 Analytics
              </button>
              <div className="webgl-status">
                {threeJSLoaded && <span className="webgl-success">🔗 3D ACTIVE</span>}
                {threeJSError && <span className="webgl-error">🚨 FALLBACK</span>}
                {!threeJSLoaded && !threeJSError && <span className="webgl-loading">🔄 LOADING</span>}
              </div>
            </div>
          </div>
          
          <div className="visualization-container" ref={mountRef}>
            {(!threeJSLoaded || threeJSError) && (
              <div className="placeholder-visualization">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🔗</div>
                  <h3>7-Layer Connection Orchestration Network</h3>
                  <p>Live System Interconnection Monitoring</p>
                  <div className="layer-preview">
                    <div className="layer-item">🏛️ LAYER 1: Constitutional Validation (487 systems)</div>
                    <div className="layer-item">🧮 LAYER 2: Formal Verification (89 systems)</div>
                    <div className="layer-item">🌊 LAYER 3: Quantum Enhancement (67 systems)</div>
                    <div className="layer-item">📊 LAYER 4: Data Flow (134 systems)</div>
                    <div className="layer-item">📡 LAYER 5: Event Propagation (298 systems)</div>
                    <div className="layer-item">🧠 LAYER 6: Collective Intelligence (156 systems)</div>
                    <div className="layer-item">📈 LAYER 7: Performance Optimization (487 systems)</div>
                  </div>
                  <div className="placeholder-note">
                    {threeJSError ? 
                      "🚨 WebGL fallback mode - connections preserved" : 
                      "🔄 Loading 3D connection visualization..."
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Focus Info */}
          <div className="current-focus-info">
            <div className="focus-title">
              🎯 Current Focus: "{connectionData.currentFocus}"
            </div>
            <div className="focus-details">
              <span>🔗 Active Connections: {connectionData.connections.toLocaleString()}</span>
              <span>⚡ Avg Latency: {connectionData.avgLatency}ms</span>
              <span>🌟 Health: {(connectionData.connectionHealth * 100).toFixed(1)}%</span>
              <span>🏛️ Constitutional: 100% validated</span>
              <span>🧮 Formal: 94.7% verified</span>
            </div>
          </div>
        </div>

        {/* 📊 7-LAYER ORCHESTRATION DETAILS */}
        <div className="layer-details-panel">
          <div className="panel-header">
            <h2>🌟 7-Layer Connection Orchestration</h2>
            <div className="layer-selector">
              {connectionData.layers.map((layer) => (
                <button
                  key={layer.layer}
                  className={`layer-btn ${selectedLayer === layer.layer ? 'active' : ''}`}
                  onClick={() => setSelectedLayer(layer.layer)}
                >
                  L{layer.layer}
                </button>
              ))}
            </div>
          </div>
          
          {connectionData.layers
            .filter(layer => layer.layer === selectedLayer)
            .map((layer) => (
              <div key={layer.layer} className="layer-analysis">
                <h3>🔗 LAYER {layer.layer}: {layer.name}</h3>
                <div className="layer-status">
                  <span className="status-active">✅ ACTIVE</span>
                  <span>Systems: {layer.systems}</span>
                  <span>Health: {(layer.health * 100).toFixed(1)}%</span>
                </div>
                
                <div className="layer-description">
                  {layer.layer === 1 && "Constitutional validation network ensuring all 487 systems comply with supreme authority oversight and truth rules enforcement."}
                  {layer.layer === 2 && "Cross-validation network between reasoning systems with mathematical proof sharing and formal verification protocols."}
                  {layer.layer === 3 && "Quantum-enhanced communication network with entanglement pairs and coherence maintenance for superior performance."}
                  {layer.layer === 4 && "Data flow orchestration between memory and decision systems with intelligent routing and optimization."}
                  {layer.layer === 5 && "Event propagation network ensuring all reactive systems receive updates with minimal latency and maximum reliability."}
                  {layer.layer === 6 && "Collective intelligence sharing network enabling cross-system learning and knowledge transfer optimization."}
                  {layer.layer === 7 && "Performance optimization network monitoring and enhancing all system interconnections for maximum efficiency."}
                </div>

                <div className="layer-metrics">
                  <div className="metric-item">
                    <span>Connected Systems:</span>
                    <span className="metric-value">{layer.systems}</span>
                  </div>
                  <div className="metric-item">
                    <span>Connection Health:</span>
                    <span className={layer.health > 0.99 ? 'health-perfect' : layer.health > 0.98 ? 'health-excellent' : 'health-good'}>
                      {(layer.health * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span>Quantum Enhancement:</span>
                    <span className="quantum-advantage">+{connectionData.quantumAdvantage}%</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

      </div>

      {/* 📊 CONNECTION TYPE ANALYTICS */}
      <div className="connection-analytics-panel">
        <div className="panel-header">
          <h2>📊 Connection Excellence Analytics</h2>
        </div>
        
        <div className="analytics-table">
          <div className="table-header">
            <div>Connection Type</div>
            <div>Active Links</div>
            <div>Performance Efficiency</div>
            <div>Constitutional Compliance</div>
            <div>Quantum Enhancement</div>
          </div>
          {connectionData.connectionTypes.map((type, index) => (
            <div key={index} className="table-row">
              <div className="type-cell">
                {type.type === 'Constitutional' && '🏛️'} 
                {type.type === 'Formal Reasoning' && '🧮'}
                {type.type === 'Quantum Enhanced' && '🌊'}
                {type.type === 'Data Flow' && '📊'}
                {type.type === 'Intelligence' && '🧠'}
                {type.type}
              </div>
              <div>{type.activeLinks}</div>
              <div>
                <span className={type.efficiency > 0.99 ? 'excellence-elite' : 
                               type.efficiency > 0.97 ? 'excellence-expert' : 'excellence-advanced'}>
                  {(type.efficiency * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className={type.compliance === 1.000 ? 'constitutional-perfect' : 
                               type.compliance > 0.99 ? 'constitutional-excellent' : 'constitutional-good'}>
                  {(type.compliance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="quantum-enhancement">+{type.enhancement}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .connections-center-container {
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .connections-header {
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
          background: linear-gradient(135deg, #00ffff 0%, #6366f1 50%, #8b5cf6 100%);
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

        .connections-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .network-visualization-panel, .layer-details-panel, .connection-analytics-panel {
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
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: rgba(99, 102, 241, 0.4);
          border-color: #6366f1;
        }

        .view-btn:hover {
          background: rgba(99, 102, 241, 0.4);
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
          border: 1px solid rgba(99, 102, 241, 0.3);
          position: relative;
          background: #0a0a1a;
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
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(0, 255, 255, 0.1) 100%);
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
          color: #6366f1;
        }

        .placeholder-content p {
          margin: 0 0 1rem 0;
          opacity: 0.8;
        }

        .layer-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .layer-item {
          padding: 0.25rem 0.5rem;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          text-align: left;
        }

        .placeholder-note {
          font-size: 0.875rem;
          opacity: 0.6;
          font-style: italic;
        }

        .current-focus-info {
          background: rgba(99, 102, 241, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #6366f1;
        }

        .focus-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fbbf24;
        }

        .focus-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .focus-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .layer-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .layer-btn {
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .layer-btn.active {
          background: rgba(99, 102, 241, 0.4);
          border-color: #6366f1;
        }

        .layer-analysis h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: #00ffff;
        }

        .layer-status {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .layer-status span {
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .layer-description {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          line-height: 1.6;
          font-size: 0.9rem;
        }

        .layer-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
        }

        .metric-item span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .metric-value {
          font-weight: 600;
          color: #6366f1;
        }

        .health-perfect {
          color: #fbbf24;
          font-weight: 700;
        }

        .health-excellent {
          color: #10b981;
          font-weight: 600;
        }

        .health-good {
          color: #8b5cf6;
          font-weight: 500;
        }

        .quantum-advantage {
          color: #00ffff;
          font-weight: 700;
        }

        .connection-analytics-panel {
          grid-column: 1 / -1;
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
          background: rgba(99, 102, 241, 0.2);
          font-weight: 600;
        }

        .table-row {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .type-cell {
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

        .constitutional-perfect {
          color: #fbbf24;
          font-weight: 700;
        }

        .constitutional-excellent {
          color: #10b981;
          font-weight: 600;
        }

        .constitutional-good {
          color: #8b5cf6;
          font-weight: 500;
        }

        .quantum-enhancement {
          color: #00ffff;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .connections-main-grid {
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

export default SuperiorSystemConnectionsCenter;
