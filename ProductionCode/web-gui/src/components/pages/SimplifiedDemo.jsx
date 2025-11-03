import React, { useState } from 'react';
import SimpleBrain from '../demo/SimpleBrain';
import SimpleChat from '../demo/SimpleChat';

/**
 * 🚀 SIMPLIFIED DEMO - No complex dependencies
 */
export const SimplifiedDemo = () => {
  const [activeTab, setActiveTab] = useState('brain');

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      color: 'white'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🚀 Elite Arbitrage Syndicate
        </h1>
        <p style={{ color: '#9ca3af' }}>
          Live Demo - Simplified Version
        </p>
      </header>

      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('brain')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'brain' ? '#8b5cf6' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🧠 Brain
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'chat' ? '#10b981' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          💬 Chat
        </button>
      </nav>

      <div>
        {activeTab === 'brain' && <SimpleBrain />}
        {activeTab === 'chat' && <SimpleChat />}
      </div>
    </div>
  );
};

export default SimplifiedDemo;


