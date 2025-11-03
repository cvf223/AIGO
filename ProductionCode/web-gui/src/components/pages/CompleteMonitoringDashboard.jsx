import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * 📊 COMPLETE MONITORING DASHBOARD
 * Full-featured monitoring with competitor analysis & world model predictions
 */
export const CompleteMonitoringDashboard = ({ apiUrl = 'http://localhost:3000' }) => {
  // State
  const [activeTab, setActiveTab] = useState('alphagnome');
  const [alphaGnomeData, setAlphaGnomeData] = useState({
    generation: 0,
    bestFitness: 0,
    population: 0,
    breakthroughs: []
  });
  
  const [competitorData, setCompetitorData] = useState({
    transactions: [],
    bots: [],
    totalTx: 0,
    uniqueBots: 0
  });
  
  const [worldModelData, setWorldModelData] = useState({
    predictions: [],
    accuracy: 0,
    totalPredictions: 0
  });
  
  const [systemHealth, setSystemHealth] = useState({
    uptime: 0,
    memory: 0,
    components: {}
  });
  
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [filters, setFilters] = useState({
    chain: 'all',
    category: 'all',
    timeRange: '24h'
  });

  // Connect to backend
  useEffect(() => {
    const socket = io(apiUrl);
    
    // AlphaGnome updates
    socket.on('alphagnome:generation_complete', (data) => {
      setAlphaGnomeData(prev => ({
        ...prev,
        generation: data.generation,
        bestFitness: data.bestFitness
      }));
    });
    
    // Competitor updates
    socket.on('competitor:transaction_found', (tx) => {
      setCompetitorData(prev => ({
        ...prev,
        transactions: [tx, ...prev.transactions].slice(0, 100),
        totalTx: prev.totalTx + 1
      }));
    });
    
    // World model updates
    socket.on('worldmodel:prediction_verified', (pred) => {
      setWorldModelData(prev => ({
        ...prev,
        predictions: [pred, ...prev.predictions].slice(0, 100)
      }));
    });
    
    // System health updates
    socket.on('system:health_update', (health) => {
      setSystemHealth(health);
    });
    
    // Load initial data
    loadInitialData();
    
    return () => socket.disconnect();
  }, [apiUrl]);
  
  const loadInitialData = async () => {
    try {
      // Load AlphaGnome state
      const agRes = await fetch(`${apiUrl}/api/alphagnome/status`);
      if (agRes.ok) {
        const agData = await agRes.json();
        setAlphaGnomeData(agData);
      }
      
      // Load competitor data
      const compRes = await fetch(`${apiUrl}/api/competitors/recent?limit=100`);
      if (compRes.ok) {
        const compData = await compRes.json();
        setCompetitorData(compData);
      }
      
      // Load world model data
      const wmRes = await fetch(`${apiUrl}/api/worldmodel/accurate-predictions?limit=100`);
      if (wmRes.ok) {
        const wmData = await wmRes.json();
        setWorldModelData(wmData);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
      color: 'white',
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          📊 Syndicate Monitoring Dashboard
        </h1>
        <p style={{ color: '#9ca3af' }}>
          Real-time monitoring • MacBook Pro Backend • Air Frontend
        </p>
      </header>

      {/* System Health Bar */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid #10b981',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Uptime</div>
          <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 'bold' }}>
            {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Memory</div>
          <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 'bold' }}>
            {(systemHealth.memory / 1024).toFixed(1)}GB
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>AlphaGnome</div>
          <div style={{ fontSize: '1.25rem', color: '#8b5cf6', fontWeight: 'bold' }}>
            Gen {alphaGnomeData.generation}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Competitors</div>
          <div style={{ fontSize: '1.25rem', color: '#3b82f6', fontWeight: 'bold' }}>
            {competitorData.totalTx.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1rem'
      }}>
        {[
          { id: 'alphagnome', label: '🧬 AlphaGnome', color: '#8b5cf6' },
          { id: 'competitors', label: '🔍 Competitors', color: '#3b82f6' },
          { id: 'worldmodel', label: '🌍 World Model', color: '#10b981' },
          { id: 'controls', label: '🎮 Controls', color: '#f59e0b' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.05)',
              border: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div>
        {activeTab === 'alphagnome' && (
          <AlphaGnomeMonitor data={alphaGnomeData} />
        )}
        
        {activeTab === 'competitors' && (
          <CompetitorMonitor 
            data={competitorData}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            filters={filters}
            setFilters={setFilters}
          />
        )}
        
        {activeTab === 'worldmodel' && (
          <WorldModelMonitor
            data={worldModelData}
            selectedPrediction={selectedPrediction}
            setSelectedPrediction={setSelectedPrediction}
            filters={filters}
            setFilters={setFilters}
          />
        )}
        
        {activeTab === 'controls' && (
          <HumanControls />
        )}
      </div>
    </div>
  );
};

// AlphaGnome Monitor Component
const AlphaGnomeMonitor = ({ data }) => (
  <div>
    <h2 style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}>
      🧬 AlphaGnome Evolution Progress
    </h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <MetricCard label="Generation" value={data.generation} color="#8b5cf6" />
      <MetricCard label="Best Fitness" value={data.bestFitness.toFixed(4)} color="#10b981" />
      <MetricCard label="Population" value={data.population} color="#3b82f6" />
      <MetricCard label="Breakthroughs" value={data.breakthroughs?.length || 0} color="#fbbf24" />
    </div>
    
    <div style={{
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid #8b5cf6',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>Recent Activity</h3>
      <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
        System is evolving... Check back for updates!
      </div>
    </div>
  </div>
);

// Competitor Monitor Component  
const CompetitorMonitor = ({ data, selectedBot, setSelectedBot, filters, setFilters }) => {
  if (selectedBot) {
    return <BotProfileView bot={selectedBot} onClose={() => setSelectedBot(null)} />;
  }
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#3b82f6', margin: 0 }}>
          🔍 Competitor Atomic Arbitrage Transactions
        </h2>
        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          {data.totalTx.toLocaleString()} transactions • {data.uniqueBots} unique bots
        </div>
      </div>
      
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <select
          value={filters.chain}
          onChange={(e) => setFilters({...filters, chain: e.target.value})}
          style={{
            padding: '0.5rem 1rem',
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Chains</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="base">Base</option>
          <option value="polygon">Polygon</option>
          <option value="optimism">Optimism</option>
        </select>
      </div>
      
      {/* Transaction List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.transactions.map((tx, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.9375rem' }}>
                #{i + 1}. TX: {tx.hash?.substring(0, 10)}...{tx.hash?.substring(tx.hash.length - 8)}
              </div>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                ${tx.profit?.toFixed(2)} ({tx.profitPercent}%)
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Route</div>
                <div style={{ color: '#d1d5db' }}>{tx.tokens}</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{tx.dexes?.join(' → ')}</div>
              </div>
              <div>
                <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Bot</div>
                <div style={{ 
                  color: '#8b5cf6', 
                  fontFamily: 'monospace', 
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => setSelectedBot(tx.botAddress)}
                >
                  {tx.botAddress?.substring(0, 10)}... [View Profile]
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a
                href={tx.arbiscanUrl || `https://arbiscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  borderRadius: '6px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔗 Verify on Arbiscan →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bot Profile View
const BotProfileView = ({ bot, onClose }) => (
  <div style={{
    background: 'rgba(0,0,0,0.5)',
    border: '2px solid #8b5cf6',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative'
  }}>
    <button
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#ef4444',
        border: 'none',
        color: 'white',
        fontSize: '1.25rem',
        cursor: 'pointer'
      }}
    >
      ×
    </button>
    
    <h2 style={{ color: '#8b5cf6', marginBottom: '2rem' }}>
      🤖 Competitor Bot Profile
    </h2>
    
    <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
      <div>Bot Address: {bot}</div>
      <div>Profile data loading...</div>
    </div>
  </div>
);

// World Model Monitor
const WorldModelMonitor = ({ data, selectedPrediction, setSelectedPrediction, filters, setFilters }) => {
  if (selectedPrediction) {
    return <PredictionDetailView prediction={selectedPrediction} onClose={() => setSelectedPrediction(null)} />;
  }
  
  return (
    <div>
      <h2 style={{ color: '#10b981', marginBottom: '1.5rem' }}>
        🔮 World Model - Accurate Predictions
      </h2>
      
      {/* Category filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'price_movement', 'volume_spike', 'liquidity_shift'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilters({...filters, category: cat})}
            style={{
              padding: '0.5rem 1rem',
              background: filters.category === cat ? '#10b981' : '#374151',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      {/* Predictions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.predictions.map((pred, i) => (
          <div
            key={i}
            onClick={() => setSelectedPrediction(pred)}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
            }}
          >
            <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
              ✅ {pred.category} - {pred.confidence}% confidence
            </div>
            <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              {pred.summary || 'Click to view full reasoning chain'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Prediction Detail View
const PredictionDetailView = ({ prediction, onClose }) => (
  <div style={{
    background: 'rgba(0,0,0,0.5)',
    border: '2px solid #10b981',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative',
    maxHeight: '80vh',
    overflowY: 'auto'
  }}>
    <button
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#ef4444',
        border: 'none',
        color: 'white',
        fontSize: '1.25rem',
        cursor: 'pointer'
      }}
    >
      ×
    </button>
    
    <h2 style={{ color: '#10b981', marginBottom: '2rem' }}>
      🔮 Prediction Reasoning Chain
    </h2>
    
    <div style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.7' }}>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Prediction:</strong> {prediction.predictionText}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Outcome:</strong> ✅ {prediction.outcomeText}
      </div>
      <div>Full reasoning chain would display here...</div>
    </div>
  </div>
);

// Human Controls
const HumanControls = () => (
  <div>
    <h2 style={{ color: '#f59e0b', marginBottom: '1.5rem' }}>
      🎮 System Controls
    </h2>
    
    <div style={{
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid #f59e0b',
      borderRadius: '12px',
      padding: '2rem'
    }}>
      <div style={{ color: '#d1d5db' }}>
        Control panel coming soon...
      </div>
    </div>
  </div>
);

// Utility Component
const MetricCard = ({ label, value, color }) => (
  <div style={{
    background: `${color}20`,
    border: `1px solid ${color}40`,
    borderRadius: '8px',
    padding: '1rem'
  }}>
    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.5rem', color, fontWeight: 'bold' }}>
      {value}
    </div>
  </div>
);

export default CompleteMonitoringDashboard;

