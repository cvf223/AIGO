import React, { useState, useEffect } from 'react';

/**
 * 🌌💎 GNN & QNN QUANTUM NEURAL EXCELLENCE CENTER
 * ============================================
 * 
 * Neural Quantum Supremacy Center featuring quantum graph neural network visualization,
 * quantum neural network analytics, and real-time entanglement strength tracking
 * 
 * Source: web-gui/src/components/quantum-systems/QuantumNeuralNetworksCenter.jsx
 */

const QuantumNeuralNetworksCenter = () => {
  // 🌌 QUANTUM NEURAL NETWORKS STATE
  const [quantumNeuralData, setQuantumNeuralData] = useState({
    qgnnStatus: "ACTIVE",
    nodes: 12847,
    qubitsPerNode: 8,
    coherence: 0.947,
    currentProcessing: {
      task: "Market structure analysis",
      agent: "Elite-Developer",
      quantumAdvantage: 789,
      coherence: 0.947,
      messagePassingOps: 156789,
      processingTime: 0.8,
      quality: "ELITE"
    },
    quantumNetworks: [
      { network: "QGNN (8-layer)", performance: 0.947, baseline: 0.672, advantage: 789, impact: 47830 },
      { network: "Quantum NN", performance: 0.968, baseline: 0.734, advantage: 634, impact: 34567 },
      { network: "Quantum CNN", performance: 0.893, baseline: 0.658, advantage: 456, impact: 28901 },
      { network: "Quantum RNN", performance: 0.921, baseline: 0.697, advantage: 523, impact: 31234 },
      { network: "Quantum Attention", performance: 0.974, baseline: 0.789, advantage: 867, impact: 52678 }
    ],
    quantumVisualization: {
      graphEmbeddings: {
        nodes: 12847,
        qubits: 8,
        coherence: 0.947
      },
      quantumInterference: {
        frequency: "2.3 THz",
        amplitude: 0.89
      },
      entanglementPairs: {
        activePairs: 847,
        avgStrength: 0.94
      }
    },
    competitiveAnalysis: {
      quantumVsClassical: [
        { metric: "Processing Speed", quantum: 789, classical: 100, advantage: "+689%" },
        { metric: "Pattern Recognition", quantum: 634, classical: 100, advantage: "+534%" },
        { metric: "Memory Efficiency", quantum: 456, classical: 100, advantage: "+356%" },
        { metric: "Learning Convergence", quantum: 523, classical: 100, advantage: "+423%" },
        { metric: "Quantum Coherence", quantum: 867, classical: 0, advantage: "+∞%" }
      ]
    }
  });

  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [viewMode, setViewMode] = useState('network'); // network, performance, quantum

  return (
    <div className="quantum-neural-center-container">
      {/* 👑 HEADER */}
      <div className="quantum-neural-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              🌌 GNN & QNN Quantum Neural Excellence Center
            </h1>
            <p className="subtitle">Neural Quantum Supremacy Center</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Nodes: {quantumNeuralData.nodes.toLocaleString()}
            </div>
            <div className="metric-badge">
              Qubits: {quantumNeuralData.qubitsPerNode}/node
            </div>
            <div className="metric-badge">
              Coherence: {(quantumNeuralData.coherence * 100).toFixed(1)}%
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="quantum-neural-main-grid">
        
        {/* 🔬 QUANTUM GRAPH NEURAL NETWORK VISUALIZATION */}
        <div className="qgnn-visualization-panel">
          <div className="panel-header">
            <h2>🔬 Quantum Graph Neural Network Visualization</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'network' ? 'active' : ''}`}
                onClick={() => setViewMode('network')}
              >
                🕸️ Network
              </button>
              <button 
                className={`view-btn ${viewMode === 'performance' ? 'active' : ''}`}
                onClick={() => setViewMode('performance')}
              >
                📊 Performance
              </button>
              <button 
                className={`view-btn ${viewMode === 'quantum' ? 'active' : ''}`}
                onClick={() => setViewMode('quantum')}
              >
                🌌 Quantum
              </button>
            </div>
          </div>
          
          <div className="quantum-network-visualization">
            <h3>🌟 Live Quantum Neural Processing</h3>
            <div className="quantum-network-display">
              <h4>🌌 QUANTUM GRAPH NEURAL NETWORK</h4>
              <div className="quantum-layers">
                <div className="quantum-layer">
                  <div className="layer-title">GRAPH EMBEDDINGS</div>
                  <div className="quantum-nodes">
                    <div className="quantum-node-cluster">
                      {'●●●●●●●'.split('').map((dot, i) => (
                        <span key={i} className="quantum-dot graph-embedding">{dot}</span>
                      ))}
                    </div>
                  </div>
                  <div className="layer-stats">
                    <div>Nodes: {quantumNeuralData.quantumVisualization.graphEmbeddings.nodes.toLocaleString()}</div>
                    <div>Qubits: {quantumNeuralData.quantumVisualization.graphEmbeddings.qubits} per node</div>
                  </div>
                </div>

                <div className="quantum-layer">
                  <div className="layer-title">QUANTUM INTERFERENCE</div>
                  <div className="quantum-nodes">
                    <div className="quantum-node-cluster">
                      {'🌊🌊🌊🌊🌊'.split('🌊').map((wave, i) => (
                        <span key={i} className="quantum-wave">{i < 5 ? '🌊' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <div className="layer-stats">
                    <div>Frequency: {quantumNeuralData.quantumVisualization.quantumInterference.frequency}</div>
                    <div>Amplitude: +{quantumNeuralData.quantumVisualization.quantumInterference.amplitude}</div>
                  </div>
                </div>

                <div className="quantum-layer">
                  <div className="layer-title">ENTANGLEMENT PAIRS</div>
                  <div className="quantum-nodes">
                    <div className="quantum-node-cluster">
                      {'◐◑◐◑◐◑◐'.split('').map((pair, i) => (
                        <span key={i} className="entanglement-pair">{pair}</span>
                      ))}
                    </div>
                  </div>
                  <div className="layer-stats">
                    <div>Active Pairs: {quantumNeuralData.quantumVisualization.entanglementPairs.activePairs}</div>
                    <div>Strength: {quantumNeuralData.quantumVisualization.entanglementPairs.avgStrength} avg</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="current-processing-info">
              <div className="processing-title">
                🔥 Current Processing: {quantumNeuralData.currentProcessing.task} ({quantumNeuralData.currentProcessing.agent})
              </div>
              <div className="processing-details">
                <span>⚡ Quantum Advantage: +{quantumNeuralData.currentProcessing.quantumAdvantage}% vs classical GNN</span>
                <span>✅ Coherence: {(quantumNeuralData.currentProcessing.coherence * 100).toFixed(1)}%</span>
                <span>✅ Message Passing: {quantumNeuralData.currentProcessing.messagePassingOps.toLocaleString()} operations</span>
                <span>⏱️ Processing: {quantumNeuralData.currentProcessing.processingTime}s</span>
                <span>🌟 Quality: {quantumNeuralData.currentProcessing.quality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 QUANTUM ADVANTAGE ANALYTICS */}
        <div className="quantum-advantage-panel">
          <div className="panel-header">
            <h2>📊 Quantum vs Classical Advantage</h2>
          </div>
          
          <div className="competitive-analysis">
            <h3>🏆 Quantum Supremacy Metrics</h3>
            <div className="advantage-comparison">
              {quantumNeuralData.competitiveAnalysis.quantumVsClassical.map((comparison, index) => (
                <div key={index} className="comparison-item">
                  <div className="comparison-metric">{comparison.metric}</div>
                  <div className="comparison-bars">
                    <div className="bar-container">
                      <div className="bar-label">Quantum</div>
                      <div className="bar quantum-bar">
                        <div 
                          className="bar-fill quantum-fill"
                          style={{ width: `${Math.min(comparison.quantum / 10, 100)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{comparison.quantum}</div>
                    </div>
                    <div className="bar-container">
                      <div className="bar-label">Classical</div>
                      <div className="bar classical-bar">
                        <div 
                          className="bar-fill classical-fill"
                          style={{ width: `${comparison.classical}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{comparison.classical}</div>
                    </div>
                  </div>
                  <div className="advantage-value">{comparison.advantage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Coherence Tracking */}
          <div className="coherence-tracking">
            <h4>🌊 Quantum Coherence Lifetime Tracking</h4>
            <div className="coherence-metrics">
              <div className="coherence-gauge">
                <div className="gauge-container">
                  <div className="gauge-arc">
                    <div 
                      className="gauge-fill"
                      style={{ 
                        background: `conic-gradient(from 0deg, #10b981 0deg, #fbbf24 ${quantumNeuralData.coherence * 270}deg, transparent ${quantumNeuralData.coherence * 270}deg)`,
                        borderRadius: '50%'
                      }}
                    ></div>
                  </div>
                  <div className="gauge-center">
                    <div className="gauge-value">{(quantumNeuralData.coherence * 100).toFixed(1)}%</div>
                    <div className="gauge-label">Coherence</div>
                  </div>
                </div>
              </div>
              <div className="coherence-details">
                <div className="coherence-detail">
                  <span>Coherence Lifetime:</span>
                  <span className="lifetime-value">2.3ms (Excellent)</span>
                </div>
                <div className="coherence-detail">
                  <span>Decoherence Rate:</span>
                  <span className="rate-value">0.02/ms (Very Low)</span>
                </div>
                <div className="coherence-detail">
                  <span>Error Correction:</span>
                  <span className="correction-value">99.7% success</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 📊 QUANTUM NEURAL NETWORK ANALYTICS */}
      <div className="quantum-analytics-panel">
        <div className="panel-header">
          <h2>📊 Quantum Neural Network Analytics</h2>
          <div className="filters">
            <select 
              value={selectedNetwork} 
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Networks</option>
              <option value="QGNN">🌌 QGNN (8-layer)</option>
              <option value="Quantum NN">🧠 Quantum NN</option>
              <option value="Quantum CNN">🔬 Quantum CNN</option>
              <option value="Quantum RNN">⚡ Quantum RNN</option>
              <option value="Quantum Attention">🌊 Quantum Attention</option>
            </select>
          </div>
        </div>
        
        <div className="analytics-table">
          <div className="table-header">
            <div>Network Type</div>
            <div>Quantum Performance</div>
            <div>Classical Baseline</div>
            <div>Advantage Factor</div>
            <div>Economic Impact</div>
          </div>
          {quantumNeuralData.quantumNetworks
            .filter(network => selectedNetwork === 'all' || network.network.includes(selectedNetwork.split(' ')[0]))
            .map((network, index) => (
            <div key={index} className="table-row">
              <div className="network-cell">
                {network.network.includes('QGNN') && '🌌'} 
                {network.network.includes('Quantum NN') && '🧠'}
                {network.network.includes('Quantum CNN') && '🔬'}
                {network.network.includes('Quantum RNN') && '⚡'}
                {network.network.includes('Quantum Attention') && '🌊'}
                {network.network}
              </div>
              <div>
                <span className={network.performance > 0.96 ? 'performance-elite' : 
                               network.performance > 0.92 ? 'performance-expert' : 'performance-advanced'}>
                  {(network.performance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="baseline-value">{(network.baseline * 100).toFixed(1)}%</div>
              <div className="advantage-factor">+{network.advantage}%</div>
              <div className="economic-impact">+${network.impact.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Quantum Circuit Configuration */}
        <div className="quantum-circuit-config">
          <h3>⚙️ Quantum Circuit Configuration</h3>
          <div className="circuit-visualization">
            <div className="circuit-diagram">
              <div className="qubit-line">
                <span className="qubit-label">|q0⟩</span>
                <div className="quantum-gate h-gate">H</div>
                <div className="quantum-gate cnot-gate">CNOT</div>
                <div className="quantum-gate measure">📊</div>
              </div>
              <div className="qubit-line">
                <span className="qubit-label">|q1⟩</span>
                <div className="quantum-gate x-gate">X</div>
                <div className="quantum-gate cnot-target">●</div>
                <div className="quantum-gate measure">📊</div>
              </div>
              <div className="qubit-line">
                <span className="qubit-label">|q2⟩</span>
                <div className="quantum-gate ry-gate">RY</div>
                <div className="quantum-gate identity">I</div>
                <div className="quantum-gate measure">📊</div>
              </div>
            </div>
            <div className="circuit-metrics">
              <div className="circuit-metric">
                <span>Gate Fidelity:</span>
                <span className="fidelity-value">99.8%</span>
              </div>
              <div className="circuit-metric">
                <span>Circuit Depth:</span>
                <span className="depth-value">8 layers</span>
              </div>
              <div className="circuit-metric">
                <span>Quantum Volume:</span>
                <span className="volume-value">512</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .quantum-neural-center-container {
          background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0c0c1e 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .quantum-neural-header {
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
          background: linear-gradient(135deg, #00ffff 0%, #8b5cf6 50%, #6366f1 100%);
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

        .quantum-neural-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .qgnn-visualization-panel, .quantum-advantage-panel, .quantum-analytics-panel {
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
          background: rgba(0, 255, 255, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: rgba(0, 255, 255, 0.4);
          border-color: #00ffff;
        }

        .view-btn:hover {
          background: rgba(0, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .quantum-network-visualization {
          background: rgba(0, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #00ffff;
          margin-bottom: 1.5rem;
        }

        .quantum-network-visualization h3 {
          margin: 0 0 1rem 0;
          color: #00ffff;
          text-align: center;
        }

        .quantum-network-display h4 {
          margin: 0 0 1rem 0;
          color: #fbbf24;
          text-align: center;
        }

        .quantum-layers {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .quantum-layer {
          text-align: center;
          flex: 1;
          min-width: 150px;
        }

        .layer-title {
          font-weight: 600;
          color: #8b5cf6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .quantum-nodes {
          margin-bottom: 1rem;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quantum-node-cluster {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.25rem;
        }

        .quantum-dot {
          font-size: 1.5rem;
          color: #fbbf24;
          animation: quantumPulse 2s infinite;
        }

        .quantum-wave {
          font-size: 1.5rem;
          color: #06b6d4;
          animation: quantumWave 1.5s infinite;
        }

        .entanglement-pair {
          font-size: 1.5rem;
          color: #8b5cf6;
          animation: quantumEntangle 3s infinite;
        }

        @keyframes quantumPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes quantumWave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes quantumEntangle {
          0%, 100% { transform: rotate(0deg); }
          33% { transform: rotate(120deg); }
          66% { transform: rotate(240deg); }
        }

        .layer-stats {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .layer-stats div {
          margin-bottom: 0.25rem;
        }

        .current-processing-info {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .processing-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fbbf24;
        }

        .processing-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .processing-details span {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(0, 255, 255, 0.2);
          border-radius: 0.25rem;
        }

        .competitive-analysis {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .competitive-analysis h3 {
          margin: 0 0 1rem 0;
          color: #00ffff;
        }

        .advantage-comparison {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comparison-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .comparison-metric {
          font-weight: 600;
          margin-bottom: 1rem;
          color: #fbbf24;
          text-align: center;
        }

        .comparison-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .bar-container {
          display: grid;
          grid-template-columns: 80px 1fr 60px;
          gap: 1rem;
          align-items: center;
        }

        .bar-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .bar {
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .quantum-bar {
          background: rgba(0, 255, 255, 0.2);
        }

        .classical-bar {
          background: rgba(107, 114, 128, 0.3);
        }

        .bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        .quantum-fill {
          background: linear-gradient(90deg, #00ffff, #8b5cf6);
        }

        .classical-fill {
          background: linear-gradient(90deg, #6b7280, #4b5563);
        }

        .bar-value {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .advantage-value {
          text-align: center;
          font-weight: 700;
          font-size: 1.125rem;
          color: #10b981;
        }

        .coherence-tracking {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .coherence-tracking h4 {
          margin: 0 0 1rem 0;
          color: #06b6d4;
        }

        .coherence-metrics {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .coherence-gauge {
          flex-shrink: 0;
        }

        .gauge-container {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .gauge-arc {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .gauge-fill {
          width: 100%;
          height: 100%;
        }

        .gauge-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .gauge-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
        }

        .gauge-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .coherence-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .coherence-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .coherence-detail span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .lifetime-value {
          color: #10b981;
          font-weight: 600;
        }

        .rate-value {
          color: #06b6d4;
          font-weight: 600;
        }

        .correction-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .quantum-analytics-panel {
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
          background: rgba(0, 255, 255, 0.2);
          font-weight: 600;
        }

        .table-row {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .network-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .performance-elite {
          color: #fbbf24;
          font-weight: 600;
        }

        .performance-expert {
          color: #10b981;
          font-weight: 600;
        }

        .performance-advanced {
          color: #8b5cf6;
          font-weight: 600;
        }

        .baseline-value {
          color: #6b7280;
          font-weight: 500;
        }

        .advantage-factor {
          color: #00ffff;
          font-weight: 700;
        }

        .economic-impact {
          color: #10b981;
          font-weight: 600;
        }

        .quantum-circuit-config {
          margin-top: 2rem;
        }

        .quantum-circuit-config h3 {
          margin: 0 0 1rem 0;
          color: #8b5cf6;
        }

        .circuit-visualization {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .circuit-diagram {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .qubit-line {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qubit-label {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #00ffff;
          min-width: 40px;
        }

        .quantum-gate {
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.5);
          border-radius: 0.5rem;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          color: white;
          min-width: 50px;
          text-align: center;
        }

        .h-gate {
          background: rgba(251, 191, 36, 0.3);
          border-color: rgba(251, 191, 36, 0.5);
          color: #fbbf24;
        }

        .x-gate {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        .cnot-gate {
          background: rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .measure {
          background: rgba(16, 185, 129, 0.3);
          border-color: rgba(16, 185, 129, 0.5);
          color: #10b981;
        }

        .circuit-metrics {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .circuit-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .circuit-metric span:first-child {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .fidelity-value {
          color: #10b981;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .depth-value {
          color: #8b5cf6;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .volume-value {
          color: #00ffff;
          font-weight: 700;
          font-size: 1.125rem;
        }

        @media (max-width: 1024px) {
          .quantum-neural-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .quantum-layers {
            flex-direction: column;
            align-items: center;
          }
          
          .coherence-metrics {
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

export default QuantumNeuralNetworksCenter;
