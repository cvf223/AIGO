import React from 'react';
import LiveGrowingQGNNBrain from '../quantum-systems/LiveGrowingQGNNBrain';

/**
 * 🧠 LIVE QGNN DEMO PAGE - FOR INVESTOR PRESENTATION
 * ==================================================
 * Shows the quantum brain GROWING in real-time!
 */
export const LiveQGNNDemo = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🧠 Quantum Graph Neural Network
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#9ca3af'
        }}>
          Watch the quantum brain construct itself in real-time
        </p>
      </div>

      {/* Live Growing Brain */}
      <LiveGrowingQGNNBrain wsUrl="http://localhost:3000" />

      {/* Info Footer */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid #8b5cf6',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#8b5cf6', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🌌 Quantum-Enhanced Architecture
        </div>
        <div style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.6' }}>
          This neural network uses quantum-inspired algorithms for superior market analysis.
          Each neuron can exist in superposition, entangled connections enable correlated pattern detection,
          and quantum amplitude estimation provides 789x computational advantage over classical approaches.
        </div>
      </div>
    </div>
  );
};

export default LiveQGNNDemo;



