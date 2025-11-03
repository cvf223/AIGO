import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🧮💎 FORMAL REASONING EXCELLENCE CENTER
 * ====================================
 * 
 * Mathematical Certainty Supremacy HQ featuring live formal verification orchestration,
 * 3D reasoning tree visualization, and agent-sortable formal reasoning analytics
 * 
 * Source: web-gui/src/components/formal-reasoning/FormalReasoningExcellenceCenter.jsx
 */

const FormalReasoningExcellenceCenter = () => {
  // 🧮 FORMAL REASONING STATE
  const [formalReasoningData, setFormalReasoningData] = useState({
    status: "ACTIVE",
    verificationsToday: 12847,
    certainty: 0.987,
    currentReasoning: {
      agent: "AI-Prediction-Intel",
      challenge: "Optimize gas efficiency for new flash loan contract",
      depth: 8,
      steps: 23,
      confidence: 0.973,
      duration: 1.2,
      accuracy: 0.987
    },
    reasoningTree: {
      rootHypothesis: "Gas optimization through assembly enhancement",
      logicalBranches: [
        { branch: "Assembly Optimization", evidence: 4, conclusion: "34% gas reduction", verified: true },
        { branch: "Storage Packing", evidence: 3, conclusion: "23% gas reduction", verified: true },
        { branch: "Loop Optimization", evidence: 5, conclusion: "18% gas reduction", verified: false }
      ],
      evidenceNodes: [
        { node: "Historical Data", strength: 0.94, type: "Empirical" },
        { node: "Formal Proof", strength: 0.98, type: "Mathematical" },
        { node: "Competitor Analysis", strength: 0.87, type: "Comparative" },
        { node: "Simulation Results", strength: 0.91, type: "Computational" }
      ],
      conclusionSynthesis: "Combined assembly + storage optimization yields 47% reduction",
      formalProof: "For all c in Contracts: Assembly(c) AND Storage(c) → GasReduction(c) >= 0.47"
    },
    reasoningSystems: [
      { system: "FormalReasoningCognitiveIntegration", sessions: 847, depth: 15.7, success: 0.987 },
      { system: "NeuroSymbolicScaffolding", sessions: 634, depth: 12.4, success: 0.962 },
      { system: "AutoformalizationEngine", sessions: 456, depth: 18.3, success: 0.974 },
      { system: "ChainOfAgentsOrchestrator", sessions: 523, depth: 9.8, success: 0.948 },
      { system: "StrategicCognitiveOrchestrator", sessions: 234, depth: 21.6, success: 0.991 }
    ],
    agentReasoningUsage: [
      { agent: "AI-Prediction", statements: 2847, proofs: 2456, theorems: 1234, certainty: 1.000 },
      { agent: "Elite-Developer", statements: 1834, proofs: 1723, theorems: 892, certainty: 1.000 },
      { agent: "LLM-Gardener", statements: 1287, proofs: 1156, theorems: 645, certainty: 0.998 },
      { agent: "Judge-Service", statements: 3456, proofs: 3234, theorems: 1567, certainty: 0.999 },
      { agent: "Arbitrum-Flash", statements: 1156, proofs: 1045, theorems: 523, certainty: 0.992 }
    ]
  });

  const [selectedSystem, setSelectedSystem] = useState('FormalReasoningCognitiveIntegration');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [threeJSLoaded, setThreeJSLoaded] = useState(false);
  const [threeJSError, setThreeJSError] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  // 🧮 3D REASONING TREE VISUALIZATION
  useEffect(() => {
    if (!mountRef.current) return;

    const initializeReasoningTreeVisualization = async () => {
      try {
        console.log('🧮 Initializing 3D Reasoning Tree...');

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0f1a);

        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current.clientWidth / mountRef.current.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setClearColor(0x0a0f1a, 1);
        
        // Canvas styling
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '10';

        mountRef.current.appendChild(renderer.domElement);

        // 🧮 CREATE 3D REASONING TREE STRUCTURE
        const createReasoningTree = () => {
          const treeNodes = [];
          const treeConnections = [];

          // Root hypothesis node (top)
          const rootGeometry = new THREE.SphereGeometry(1.5, 16, 16);
          const rootMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24, // GOLD
            wireframe: false
          });
          const rootNode = new THREE.Mesh(rootGeometry, rootMaterial);
          rootNode.position.set(0, 6, 0);
          scene.add(rootNode);
          treeNodes.push(rootNode);

          // Logical branch nodes (middle layer)
          const branchPositions = [
            { x: -4, y: 3, z: 2, color: 0x3b82f6 }, // Blue
            { x: 0, y: 3, z: -2, color: 0x8b5cf6 }, // Purple
            { x: 4, y: 3, z: 2, color: 0x10b981 }  // Green
          ];

          branchPositions.forEach((pos, index) => {
            const branchGeometry = new THREE.SphereGeometry(1.0, 16, 16);
            const branchMaterial = new THREE.MeshBasicMaterial({
              color: pos.color,
              wireframe: false
            });
            const branchNode = new THREE.Mesh(branchGeometry, branchMaterial);
            branchNode.position.set(pos.x, pos.y, pos.z);
            scene.add(branchNode);
            treeNodes.push(branchNode);

            // Connect to root
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
              rootNode.position,
              branchNode.position
            ]);
            const connectionMaterial = new THREE.LineBasicMaterial({ 
              color: pos.color, 
              linewidth: 2
            });
            const connection = new THREE.Line(connectionGeometry, connectionMaterial);
            scene.add(connection);
            treeConnections.push(connection);
          });

          // Evidence nodes (bottom layer)
          const evidencePositions = [
            { x: -6, y: 0, z: 0, color: 0xff6b6b },
            { x: -2, y: 0, z: 3, color: 0xff9f40 },
            { x: 2, y: 0, z: 3, color: 0x74c0fc },
            { x: 6, y: 0, z: 0, color: 0x51cf66 },
            { x: 0, y: 0, z: -4, color: 0xffd43b },
            { x: -3, y: 0, z: -2, color: 0xda77f2 }
          ];

          evidencePositions.forEach((pos, index) => {
            const evidenceGeometry = new THREE.SphereGeometry(0.7, 12, 12);
            const evidenceMaterial = new THREE.MeshBasicMaterial({
              color: pos.color,
              wireframe: false
            });
            const evidenceNode = new THREE.Mesh(evidenceGeometry, evidenceMaterial);
            evidenceNode.position.set(pos.x, pos.y, pos.z);
            scene.add(evidenceNode);
            treeNodes.push(evidenceNode);

            // Connect to appropriate branch
            const branchIndex = index % 3;
            const targetBranch = branchPositions[branchIndex];
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(targetBranch.x, targetBranch.y, targetBranch.z),
              evidenceNode.position
            ]);
            const connectionMaterial = new THREE.LineBasicMaterial({ 
              color: pos.color, 
              transparent: true, 
              opacity: 0.7
            });
            const connection = new THREE.Line(connectionGeometry, connectionMaterial);
            scene.add(connection);
            treeConnections.push(connection);
          });

          // Conclusion synthesis nodes (convergence layer)
          const synthesisPositions = [
            { x: -2, y: -3, z: 1, color: 0x06b6d4 },
            { x: 2, y: -3, z: 1, color: 0x8b5cf6 }
          ];

          synthesisPositions.forEach((pos, index) => {
            const synthesisGeometry = new THREE.OctahedronGeometry(0.8);
            const synthesisMaterial = new THREE.MeshBasicMaterial({
              color: pos.color,
              wireframe: false
            });
            const synthesisNode = new THREE.Mesh(synthesisGeometry, synthesisMaterial);
            synthesisNode.position.set(pos.x, pos.y, pos.z);
            scene.add(synthesisNode);
            treeNodes.push(synthesisNode);
          });

          // Final proof node (bottom)
          const proofGeometry = new THREE.DodecahedronGeometry(1.2);
          const proofMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // BRIGHT GREEN
            wireframe: false
          });
          const proofNode = new THREE.Mesh(proofGeometry, proofMaterial);
          proofNode.position.set(0, -6, 0);
          scene.add(proofNode);
          treeNodes.push(proofNode);

          // Connect synthesis to proof
          synthesisPositions.forEach((pos) => {
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(pos.x, pos.y, pos.z),
              proofNode.position
            ]);
            const connectionMaterial = new THREE.LineBasicMaterial({ 
              color: 0x00ff00, 
              linewidth: 3
            });
            const connection = new THREE.Line(connectionGeometry, connectionMaterial);
            scene.add(connection);
            treeConnections.push(connection);
          });

          console.log('🧮 Created reasoning tree with', treeNodes.length, 'nodes and', treeConnections.length, 'connections');
          return { treeNodes, treeConnections, rootNode, proofNode };
        };

        const { treeNodes, treeConnections, rootNode, proofNode } = createReasoningTree();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // Camera position
        camera.position.set(12, 4, 12);
        camera.lookAt(0, 0, 0);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          try {
            // Rotate root node (golden hypothesis)
            if (rootNode) {
              rootNode.rotation.x += 0.01;
              rootNode.rotation.y += 0.015;
            }

            // Pulse proof node (final result)
            if (proofNode) {
              const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 1;
              proofNode.scale.setScalar(pulse);
              proofNode.rotation.x += 0.02;
              proofNode.rotation.y += 0.02;
            }

            // Animate tree nodes
            treeNodes.forEach((node, index) => {
              if (node !== rootNode && node !== proofNode) {
                const bobbing = Math.sin(Date.now() * 0.003 + index) * 0.2;
                node.position.y += bobbing * 0.01;
                
                const rotation = Math.sin(Date.now() * 0.002 + index) * 0.01;
                node.rotation.y += rotation;
              }
            });

            renderer.render(scene, camera);
          } catch (animError) {
            console.warn('Reasoning tree animation error:', animError);
          }
        };

        animate();
        sceneRef.current = { scene, treeNodes, treeConnections, rootNode, proofNode };
        setThreeJSLoaded(true);
        console.log('✅ 3D Reasoning Tree loaded successfully!');

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
        console.error('❌ Reasoning tree visualization error:', error);
        setThreeJSError(true);
        setThreeJSLoaded(false);
      }
    };

    initializeReasoningTreeVisualization();
  }, [selectedSystem]);

  return (
    <div className="formal-reasoning-center-container">
      {/* 👑 HEADER */}
      <div className="formal-reasoning-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🧮 Formal Reasoning Excellence Center
            </h1>
            <p className="subtitle">Mathematical Certainty Supremacy HQ</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Verifications: {formalReasoningData.verificationsToday.toLocaleString()}
            </div>
            <div className="metric-badge">
              Certainty: {(formalReasoningData.certainty * 100).toFixed(1)}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="formal-reasoning-main-grid">
        
        {/* 🧮 3D REASONING TREE VISUALIZATION */}
        <div className="reasoning-tree-panel">
          <div className="panel-header">
            <h2>🧮 3D Reasoning Tree Visualization (WebGL Elite Rendering)</h2>
            <div className="system-selector">
              <select 
                value={selectedSystem} 
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="system-select"
              >
                <option value="FormalReasoningCognitiveIntegration">🧠 FormalReasoningCognitiveIntegration</option>
                <option value="NeuroSymbolicScaffolding">🧬 NeuroSymbolicScaffolding</option>
                <option value="AutoformalizationEngine">⚡ AutoformalizationEngine</option>
                <option value="ChainOfAgentsOrchestrator">🤖 ChainOfAgentsOrchestrator</option>
                <option value="StrategicCognitiveOrchestrator">🎯 StrategicCognitiveOrchestrator</option>
              </select>
              <div className="webgl-status">
                {threeJSLoaded && <span className="webgl-success">🧮 3D ACTIVE</span>}
                {threeJSError && <span className="webgl-error">🚨 FALLBACK</span>}
                {!threeJSLoaded && !threeJSError && <span className="webgl-loading">🔄 LOADING</span>}
              </div>
            </div>
          </div>
          
          <div className="visualization-container" ref={mountRef}>
            {(!threeJSLoaded || threeJSError) && (
              <div className="placeholder-visualization">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🧮</div>
                  <h3>3D Reasoning Tree Visualization</h3>
                  <p>Live Formal Reasoning Process</p>
                  <div className="tree-preview">
                    <div className="tree-level">
                      <div className="tree-node root">◉ ROOT HYPOTHESIS</div>
                    </div>
                    <div className="tree-connections">/ | \</div>
                    <div className="tree-level">
                      <div className="tree-node branch">◉ LOGICAL</div>
                      <div className="tree-node branch">◉ BRANCHES</div>
                      <div className="tree-node branch">◉ EVIDENCE</div>
                    </div>
                    <div className="tree-connections">\ | /</div>
                    <div className="tree-level">
                      <div className="tree-node synthesis">◉ SYNTHESIS</div>
                    </div>
                    <div className="tree-connections">|</div>
                    <div className="tree-level">
                      <div className="tree-node proof">◉ FORMAL PROOF</div>
                    </div>
                  </div>
                  <div className="placeholder-note">
                    {threeJSError ? 
                      "🚨 WebGL fallback mode - reasoning preserved" : 
                      "🔄 Loading 3D reasoning tree..."
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Current Reasoning Info */}
          <div className="current-reasoning-info">
            <div className="reasoning-title">
              🔥 Agent: {formalReasoningData.currentReasoning.agent} | 🎯 Reasoning Depth: {formalReasoningData.currentReasoning.depth} layers
            </div>
            <div className="reasoning-details">
              <span>⚡ Processing: Mathematical proof validation</span>
              <span>✅ Confidence: {(formalReasoningData.currentReasoning.confidence * 100).toFixed(1)}%</span>
              <span>🧮 Steps: {formalReasoningData.currentReasoning.steps} logical operations</span>
              <span>⏱️ Duration: {formalReasoningData.currentReasoning.duration}s</span>
              <span>🎯 Accuracy: {(formalReasoningData.currentReasoning.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 📊 REASONING PROCESS BREAKDOWN */}
        <div className="reasoning-process-panel">
          <div className="panel-header">
            <h2>📊 Reasoning Process Breakdown</h2>
          </div>
          
          <div className="reasoning-challenge">
            <h3>📝 REASONING CHALLENGE</h3>
            <div className="challenge-content">
              "{formalReasoningData.currentReasoning.challenge}"
            </div>
          </div>

          <div className="reasoning-breakdown">
            <h4>🧮 MULTI-STEP FORMAL REASONING PROCESS</h4>
            <div className="reasoning-steps">
              <div className="reasoning-step">
                <div className="step-header">
                  <span className="step-icon">📝</span>
                  <span className="step-name">Problem Formalization</span>
                </div>
                  <div className="step-content">
                    <div className="step-detail">├─ Input Analysis: Contract bytecode 0x742d35Cc6aF...</div>
                    <div className="step-detail">├─ Mathematical Model: Gas = f(opcodes, storage, loops)</div>
                    <div className="step-detail">├─ Formal Constraints: Safety AND Efficiency AND Correctness</div>
                    <div className="step-detail">└─ Success Criteria: Gas &lt; 284,567 AND Security = MAX</div>
                  </div>
              </div>

              <div className="reasoning-step">
                <div className="step-header">
                  <span className="step-icon">🧠</span>
                  <span className="step-name">Hypothesis Generation</span>
                </div>
                <div className="step-content">
                  <div className="step-detail">├─ H1: Assembly optimization → -34% gas cost</div>
                  <div className="step-detail">├─ H2: Storage packing → -23% gas cost</div>
                  <div className="step-detail">├─ H3: Loop unrolling → -18% gas cost</div>
                  <div className="step-detail">└─ H4: Custom errors → -12% gas cost</div>
                </div>
              </div>

              <div className="reasoning-step">
                <div className="step-header">
                  <span className="step-icon">✅</span>
                  <span className="step-name">Formal Validation</span>
                </div>
                  <div className="step-content">
                    <div className="step-detail">├─ H1 Proof: For all x in Opcodes, ASM(x) &lt; SOL(x) ✅ PROVEN</div>
                    <div className="step-detail">├─ H2 Proof: For all s in Storage, PACK(s) &lt; UNPACKED(s) ✅ PROVEN</div>
                    <div className="step-detail">├─ H3 Proof: For all l in Loops, UNROLL(l) requires analysis ⚠️ CONDITIONAL</div>
                    <div className="step-detail">└─ H4 Proof: For all e in Errors, CUSTOM(e) &lt; STRING(e) ✅ PROVEN</div>
                  </div>
              </div>

              <div className="reasoning-step final">
                <div className="step-header">
                  <span className="step-icon">🎯</span>
                  <span className="step-name">Solution Synthesis</span>
                </div>
                <div className="step-content">
                  <div className="step-detail">├─ Optimal Strategy: H1 + H2 + H4 (H3 case-by-case)</div>
                  <div className="step-detail">├─ Expected Gas Reduction: 47,234 gwei (-34.7% total)</div>
                  <div className="step-detail">├─ Security Validation: ✅ No vulnerabilities</div>
                  <div className="step-detail">└─ Implementation Confidence: 97.8% (Mathematical certainty)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Excellence Metrics */}
          <div className="reasoning-excellence">
            <h4>🏆 REASONING EXCELLENCE METRICS</h4>
            <div className="excellence-metrics">
              <div className="metric-item">
                <span>Logical Consistency:</span>
                <span className="metric-perfect">98.7% (Near perfect)</span>
              </div>
              <div className="metric-item">
                <span>Mathematical Rigor:</span>
                <span className="metric-excellent">97.3% (Formal proof standards)</span>
              </div>
              <div className="metric-item">
                <span>Evidence Quality:</span>
                <span className="metric-excellent">94.7% (High credibility sources)</span>
              </div>
              <div className="metric-item">
                <span>Solution Optimality:</span>
                <span className="metric-perfect">96.8% (Quantum-verified optimal)</span>
              </div>
              <div className="metric-item">
                <span>Implementation Viability:</span>
                <span className="metric-perfect">97.8% (Production-ready)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 📊 AGENT FORMAL REASONING USAGE ANALYTICS */}
      <div className="reasoning-analytics-panel">
        <div className="panel-header">
          <h2>📊 Agent Formal Reasoning Usage Analytics</h2>
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
            <div>Formal Statements</div>
            <div>Mathematical Proofs</div>
            <div>Lean 4 Theorems</div>
            <div>Certainty Level</div>
          </div>
          {formalReasoningData.agentReasoningUsage
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
              <div>{agent.statements.toLocaleString()}</div>
              <div className="proof-count">{agent.proofs.toLocaleString()}</div>
              <div className="theorem-count">{agent.theorems.toLocaleString()}</div>
              <div>
                <span className={agent.certainty === 1.000 ? 'certainty-perfect' : 
                               agent.certainty > 0.995 ? 'certainty-excellent' : 'certainty-good'}>
                  {(agent.certainty * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reasoning Systems Performance */}
        <div className="reasoning-systems-analytics">
          <h3>📊 Reasoning Systems Performance</h3>
          <div className="systems-grid">
            {formalReasoningData.reasoningSystems.map((system, index) => (
              <div key={index} className="system-card">
                <div className="system-header">
                  <div className="system-name">
                    {system.system.includes('Cognitive') && '🧠'} 
                    {system.system.includes('NeuroSymbolic') && '🧬'}
                    {system.system.includes('Autoformalization') && '⚡'}
                    {system.system.includes('ChainOfAgents') && '🤖'}
                    {system.system.includes('Strategic') && '🎯'}
                    {system.system.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
                <div className="system-metrics">
                  <div className="system-metric">
                    <span>Sessions:</span>
                    <span>{system.sessions}</span>
                  </div>
                  <div className="system-metric">
                    <span>Avg Depth:</span>
                    <span className="depth-value">{system.depth} steps</span>
                  </div>
                  <div className="system-metric">
                    <span>Success Rate:</span>
                    <span className={system.success > 0.98 ? 'success-elite' : 
                                   system.success > 0.96 ? 'success-expert' : 'success-advanced'}>
                      {(system.success * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .formal-reasoning-center-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .formal-reasoning-header {
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
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
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

        .formal-reasoning-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .reasoning-tree-panel, .reasoning-process-panel, .reasoning-analytics-panel {
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

        .system-selector {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .system-select {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }

        .webgl-status {
          display: flex;
          align-items: center;
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
          height: 500px;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
          background: #0a0f1a;
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%);
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
          color: #3b82f6;
        }

        .placeholder-content p {
          margin: 0 0 1rem 0;
          opacity: 0.8;
        }

        .tree-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0;
          font-family: monospace;
        }

        .tree-level {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tree-node {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .tree-node.root {
          background: rgba(251, 191, 36, 0.3);
          border: 1px solid rgba(251, 191, 36, 0.5);
          color: #fbbf24;
        }

        .tree-node.branch {
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .tree-node.synthesis {
          background: rgba(139, 92, 246, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.5);
          color: #8b5cf6;
        }

        .tree-node.proof {
          background: rgba(16, 185, 129, 0.3);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #10b981;
        }

        .tree-connections {
          font-size: 1.5rem;
          color: #6b7280;
          font-family: monospace;
        }

        .placeholder-note {
          font-size: 0.875rem;
          opacity: 0.6;
          font-style: italic;
          margin-top: 1rem;
        }

        .current-reasoning-info {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #3b82f6;
        }

        .reasoning-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fbbf24;
        }

        .reasoning-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .reasoning-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .reasoning-challenge {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #3b82f6;
          margin-bottom: 1.5rem;
        }

        .reasoning-challenge h3 {
          margin: 0 0 1rem 0;
          color: #3b82f6;
        }

        .challenge-content {
          font-style: italic;
          font-size: 1.125rem;
          line-height: 1.6;
        }

        .reasoning-breakdown {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .reasoning-breakdown h4 {
          margin: 0 0 1rem 0;
          color: #8b5cf6;
        }

        .reasoning-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reasoning-step {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #6b7280;
        }

        .reasoning-step.final {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .step-icon {
          font-size: 1.5rem;
        }

        .step-name {
          font-weight: 600;
          font-size: 1.125rem;
          color: #fbbf24;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-left: 2rem;
        }

        .step-detail {
          font-size: 0.9rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
        }

        .reasoning-excellence {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .reasoning-excellence h4 {
          margin: 0 0 1rem 0;
          color: #10b981;
        }

        .excellence-metrics {
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
          border-radius: 0.25rem;
        }

        .metric-item span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .metric-perfect {
          color: #fbbf24;
          font-weight: 700;
        }

        .metric-excellent {
          color: #10b981;
          font-weight: 600;
        }

        .reasoning-analytics-panel {
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
          margin-bottom: 2rem;
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
          background: rgba(59, 130, 246, 0.2);
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

        .proof-count, .theorem-count {
          color: #8b5cf6;
          font-weight: 600;
        }

        .certainty-perfect {
          color: #fbbf24;
          font-weight: 700;
        }

        .certainty-excellent {
          color: #10b981;
          font-weight: 600;
        }

        .certainty-good {
          color: #8b5cf6;
          font-weight: 500;
        }

        .reasoning-systems-analytics {
          margin-top: 2rem;
        }

        .reasoning-systems-analytics h3 {
          margin: 0 0 1rem 0;
          color: #3b82f6;
        }

        .systems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .system-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .system-header {
          margin-bottom: 1rem;
        }

        .system-name {
          font-weight: 600;
          color: #3b82f6;
          font-size: 0.9rem;
        }

        .system-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .system-metric {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .system-metric span:first-child {
          color: rgba(255, 255, 255, 0.8);
        }

        .depth-value {
          color: #8b5cf6;
          font-weight: 600;
        }

        .success-elite {
          color: #fbbf24;
          font-weight: 600;
        }

        .success-expert {
          color: #10b981;
          font-weight: 600;
        }

        .success-advanced {
          color: #8b5cf6;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .formal-reasoning-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .tree-level {
            flex-direction: column;
            align-items: center;
          }
          
          .systems-grid {
            grid-template-columns: 1fr;
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

export default FormalReasoningExcellenceCenter;
