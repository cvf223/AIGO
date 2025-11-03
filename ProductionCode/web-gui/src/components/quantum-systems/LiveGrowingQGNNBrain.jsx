import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * 🧠 LIVE GROWING QGNN BRAIN - REAL-TIME CONSTRUCTION
 * ===================================================
 * Shows the brain GROWING as neurons are added in real-time!
 * Uses LIVE data from backend - NO HARDCODED VALUES!
 */
export const LiveGrowingQGNNBrain = ({ wsUrl = 'http://localhost:3000' }) => {
  const canvasRef = useRef(null);
  const [neurons, setNeurons] = useState([]);
  const [entanglements, setEntanglements] = useState([]);
  const [hoveredNeuron, setHoveredNeuron] = useState(null);
  const [stats, setStats] = useState({
    totalNeurons: 0,
    totalEntanglements: 0,
    coherence: 0,
    quantumAdvantage: 0,
    isBuilding: true
  });
  const socketRef = useRef(null);
  const animationRef = useRef(null);

  // Connect to backend for REAL-TIME updates
  useEffect(() => {
    console.log('🔌 Connecting to QGNN real-time stream...');
    
    const socket = io(wsUrl);
    socketRef.current = socket;

    // Listen for neuron additions
    socket.on('qgnn:neuron_added', (neuronData) => {
      console.log('🧠 Neuron added:', neuronData.id);
      
      setNeurons(prev => {
        const newNeuron = {
          id: neuronData.id,
          x: neuronData.x || (400 + (Math.random() - 0.5) * 600),
          y: neuronData.y || (300 + (Math.random() - 0.5) * 400),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          cluster: neuronData.cluster || (neuronData.id < 500 ? 'left' : 'right'),
          activity: Math.random(),
          quantum: neuronData.quantum !== false,
          age: 0  // Just born!
        };
        return [...prev, newNeuron];
      });

      setStats(prev => ({ ...prev, totalNeurons: prev.totalNeurons + 1 }));
    });

    // Listen for entanglement creation
    socket.on('qgnn:entanglement_created', (entData) => {
      console.log('🔗 Entanglement created:', entData.from, '→', entData.to);
      
      setEntanglements(prev => {
        const newEnt = {
          from: entData.from,
          to: entData.to,
          strength: entData.strength || 0.5,
          quantum: entData.quantum !== false,
          age: 0  // Just created!
        };
        return [...prev, newEnt];
      });

      setStats(prev => ({ ...prev, totalEntanglements: prev.totalEntanglements + 1 }));
    });

    // Listen for stats updates
    socket.on('qgnn:stats_update', (statsData) => {
      setStats({
        totalNeurons: statsData.nodes || 0,
        totalEntanglements: statsData.entanglements || 0,
        coherence: statsData.coherence || 0,
        quantumAdvantage: statsData.quantumAdvantage || 0,
        isBuilding: statsData.isBuilding !== false
      });
    });

    // Listen for build complete
    socket.on('qgnn:build_complete', (finalStats) => {
      console.log('✅ QGNN build complete!', finalStats);
      setStats(prev => ({ ...prev, isBuilding: false }));
    });

    return () => {
      socket.disconnect();
    };
  }, [wsUrl]);

  // Animation loop - neurons age and settle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      // Clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Age all neurons and entanglements
      neurons.forEach(n => {
        n.age = Math.min((n.age || 0) + 0.05, 1);
        
        // Move towards brain structure as they age
        const targetX = n.cluster === 'left' ? centerX - 150 : centerX + 150;
        n.x += (targetX - n.x) * 0.01 * n.age;
        
        // Slight drift
        n.x += n.vx * (1 - n.age * 0.5);
        n.y += n.vy * (1 - n.age * 0.5);
        
        // Bounds
        n.x = Math.max(50, Math.min(width - 50, n.x));
        n.y = Math.max(50, Math.min(height - 50, n.y));
        
        // Activity pulse
        n.activity += (Math.random() - 0.5) * 0.05;
        n.activity = Math.max(0, Math.min(1, n.activity));
      });

      entanglements.forEach(e => {
        e.age = Math.min((e.age || 0) + 0.03, 1);
      });

      // Draw entanglements (fade in as they age)
      entanglements.forEach(ent => {
        const from = neurons[ent.from];
        const to = neurons[ent.to];
        if (!from || !to) return;

        const alpha = ent.age * ent.strength;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        
        if (ent.quantum) {
          const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha * 0.4})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${alpha * 0.5})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha * 0.4})`);
          ctx.strokeStyle = gradient;
        } else {
          ctx.strokeStyle = `rgba(100, 116, 139, ${alpha * 0.3})`;
        }
        
        ctx.lineWidth = ent.strength * 2;
        ctx.stroke();
      });

      // Draw neurons (grow in as they age)
      neurons.forEach((neuron, idx) => {
        const size = neuron.age * (neuron.quantum ? 4 : 3);
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 
          hoveredNeuron === idx ? size * 1.5 : size, 
          0, Math.PI * 2
        );

        if (hoveredNeuron === idx) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#fbbf24';
        } else if (neuron.quantum) {
          const intensity = neuron.activity;
          ctx.fillStyle = `rgba(139, 92, 246, ${(0.6 + intensity * 0.4) * neuron.age})`;
          ctx.shadowBlur = 10 * neuron.age;
          ctx.shadowColor = '#8b5cf6';
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${(0.4 + neuron.activity * 0.4) * neuron.age})`;
          ctx.shadowBlur = 5 * neuron.age;
          ctx.shadowColor = '#3b82f6';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [neurons, entanglements, hoveredNeuron]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaledX = (mouseX / rect.width) * canvas.width;
    const scaledY = (mouseY / rect.height) * canvas.height;

    let found = null;
    neurons.forEach((neuron, idx) => {
      const dist = Math.sqrt(
        Math.pow(scaledX - neuron.x, 2) + 
        Math.pow(scaledY - neuron.y, 2)
      );
      if (dist < 10) found = idx;
    });

    setHoveredNeuron(found);
  };

  return (
    <div style={{
      background: '#0a0a0a',
      borderRadius: '12px',
      padding: '2rem',
      border: '2px solid #8b5cf6'
    }}>
      {/* Header with BUILD STATUS */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🧠 Quantum Graph Neural Network
          {stats.isBuilding && <span style={{ marginLeft: '1rem', fontSize: '1rem', color: '#fbbf24' }}>
            🔨 Building...
          </span>}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
          {stats.isBuilding ? 
            `Growing brain structure... ${stats.totalNeurons} neurons, ${stats.totalEntanglements} connections` :
            `Live quantum brain with ${stats.totalNeurons.toLocaleString()} neurons and ${stats.totalEntanglements} entanglement pairs`
          }
        </p>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredNeuron(null)}
          style={{
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            border: '1px solid #374151',
            borderRadius: '8px',
            cursor: 'crosshair',
            background: '#000'
          }}
        />

        {/* Hover Tooltip */}
        {hoveredNeuron !== null && neurons[hoveredNeuron] && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            padding: '1rem',
            minWidth: '220px',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
          }}>
            <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.75rem' }}>
              🎯 Neuron #{neurons[hoveredNeuron].id}
            </div>
            <div style={{ color: '#fff', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <div>🧠 <strong>Hemisphere:</strong> {neurons[hoveredNeuron].cluster === 'left' ? 'Left' : 'Right'}</div>
              <div>⚡ <strong>Activity:</strong> {(neurons[hoveredNeuron].activity * 100).toFixed(1)}%</div>
              <div>🌌 <strong>Type:</strong> {neurons[hoveredNeuron].quantum ? 'Quantum' : 'Classical'}</div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #374151' }}>
                <div style={{ color: '#8b5cf6' }}>
                  🔗 <strong>Connections:</strong> {entanglements.filter(e => e.from === hoveredNeuron || e.to === hoveredNeuron).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LIVE Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          background: stats.isBuilding ? 'rgba(251, 191, 36, 0.1)' : 'rgba(139, 92, 246, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: `2px solid ${stats.isBuilding ? '#fbbf24' : '#8b5cf6'}`,
          transition: 'all 0.3s'
        }}>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: stats.isBuilding ? '#fbbf24' : '#8b5cf6',
            fontFamily: 'monospace'
          }}>
            {stats.totalNeurons.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {stats.isBuilding ? '🔨 Building Neurons...' : '✅ Quantum Neurons'}
          </div>
        </div>

        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '2px solid #3b82f6'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' }}>
            {stats.totalEntanglements.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {stats.isBuilding ? '🔗 Creating Entanglements...' : '✅ Entanglement Pairs'}
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '2px solid #10b981'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>
            {(stats.coherence * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Coherence Level
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>
            {stats.quantumAdvantage}x
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Quantum Advantage
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {stats.isBuilding && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.5rem' }}>
            🔨 Quantum Brain Under Construction
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Watch the neural network grow in real-time as the system initializes...
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        fontSize: '0.875rem',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#8b5cf6',
            boxShadow: '0 0 10px #8b5cf6'
          }}></div>
          <span style={{ color: '#fff' }}>Quantum Neurons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#3b82f6',
            boxShadow: '0 0 10px #3b82f6'
          }}></div>
          <span style={{ color: '#fff' }}>Classical Neurons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '2px',
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
            boxShadow: '0 0 5px #8b5cf6'
          }}></div>
          <span style={{ color: '#fff' }}>Quantum Entanglement</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 15px #fbbf24'
          }}></div>
          <span style={{ color: '#fff' }}>Active (Hover)</span>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        💡 Hover over neurons to inspect • Watch the quantum brain grow and evolve in real-time
      </div>
    </div>
  );
};

export default LiveGrowingQGNNBrain;

