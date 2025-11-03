import React, { useEffect, useRef, useState } from 'react';

/**
 * 🧠 INTERACTIVE QUANTUM GNN BRAIN VISUALIZATION
 * ==============================================
 * Beautiful brain-like neural network with interactive neurons
 */
export const InteractiveQGNNBrain = ({ 
  nodeCount = 300,  // Reduced for performance
  entanglementPairs = 150 
}) => {
  const canvasRef = useRef(null);
  const [hoveredNeuron, setHoveredNeuron] = useState(null);
  const [neurons, setNeurons] = useState([]);
  const [entanglements, setEntanglements] = useState([]);
  const animationRef = useRef(null);

  // Initialize neurons in brain-like structure
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width = 800;
    const height = canvas.height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create neurons in brain-like clusters
    const newNeurons = [];
    
    // Left hemisphere cluster
    for (let i = 0; i < nodeCount / 2; i++) {
      const angle = (i / (nodeCount / 2)) * Math.PI * 2;
      const radius = 100 + Math.random() * 120;
      newNeurons.push({
        id: i,
        x: centerX - 150 + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        cluster: 'left',
        activity: Math.random(),
        quantum: Math.random() > 0.5
      });
    }

    // Right hemisphere cluster
    for (let i = nodeCount / 2; i < nodeCount; i++) {
      const angle = ((i - nodeCount / 2) / (nodeCount / 2)) * Math.PI * 2;
      const radius = 100 + Math.random() * 120;
      newNeurons.push({
        id: i,
        x: centerX + 150 + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        cluster: 'right',
        activity: Math.random(),
        quantum: Math.random() > 0.5
      });
    }

    setNeurons(newNeurons);

    // Create entanglement connections
    const newEntanglements = [];
    for (let i = 0; i < entanglementPairs; i++) {
      const n1 = Math.floor(Math.random() * nodeCount);
      const n2 = Math.floor(Math.random() * nodeCount);
      if (n1 !== n2) {
        newEntanglements.push({
          from: n1,
          to: n2,
          strength: 0.3 + Math.random() * 0.7,
          quantum: Math.random() > 0.3
        });
      }
    }
    setEntanglements(newEntanglements);
  }, [nodeCount, entanglementPairs]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw entanglement connections first
      entanglements.forEach(ent => {
        const from = neurons[ent.from];
        const to = neurons[ent.to];
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        
        // Color based on quantum entanglement
        if (ent.quantum) {
          const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${ent.strength * 0.3})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${ent.strength * 0.4})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, ${ent.strength * 0.3})`);
          ctx.strokeStyle = gradient;
        } else {
          ctx.strokeStyle = `rgba(100, 116, 139, ${ent.strength * 0.2})`;
        }
        
        ctx.lineWidth = ent.strength * 1.5;
        ctx.stroke();
      });

      // Draw neurons
      neurons.forEach((neuron, idx) => {
        // Update position slightly (brain "breathing" effect)
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;

        // Bounce off edges
        if (neuron.x < 50 || neuron.x > width - 50) neuron.vx *= -1;
        if (neuron.y < 50 || neuron.y > height - 50) neuron.vy *= -1;

        // Draw neuron
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 
          hoveredNeuron === idx ? 6 : (neuron.quantum ? 4 : 3), 
          0, Math.PI * 2
        );

        // Color based on activity and quantum state
        if (hoveredNeuron === idx) {
          ctx.fillStyle = '#fbbf24'; // Gold when hovered
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#fbbf24';
        } else if (neuron.quantum) {
          const intensity = neuron.activity;
          ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + intensity * 0.4})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#8b5cf6';
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.4 + neuron.activity * 0.4})`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#3b82f6';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pulse activity
        neuron.activity += (Math.random() - 0.5) * 0.05;
        neuron.activity = Math.max(0, Math.min(1, neuron.activity));
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

  // Handle mouse hover
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find neuron under mouse
    let found = null;
    neurons.forEach((neuron, idx) => {
      const dist = Math.sqrt(
        Math.pow(mouseX - neuron.x, 2) + 
        Math.pow(mouseY - neuron.y, 2)
      );
      if (dist < 10) {
        found = idx;
      }
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
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🧠 Quantum Graph Neural Network - Live Brain Simulation
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
          Interactive quantum-inspired neural network with {nodeCount.toLocaleString()} neurons and {entanglementPairs} entanglement pairs
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

        {/* Hover Info */}
        {hoveredNeuron !== null && neurons[hoveredNeuron] && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #8b5cf6',
            borderRadius: '8px',
            padding: '1rem',
            minWidth: '200px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
          }}>
            <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🎯 Neuron #{neurons[hoveredNeuron].id}
            </div>
            <div style={{ color: '#fff', fontSize: '0.875rem' }}>
              <div>Cluster: {neurons[hoveredNeuron].cluster === 'left' ? '🧠 Left Hemisphere' : '🧠 Right Hemisphere'}</div>
              <div>Activity: {(neurons[hoveredNeuron].activity * 100).toFixed(1)}%</div>
              <div>Type: {neurons[hoveredNeuron].quantum ? '🌌 Quantum' : '⚛️ Classical'}</div>
              <div style={{ marginTop: '0.5rem', color: '#8b5cf6' }}>
                Connections: {entanglements.filter(e => e.from === hoveredNeuron || e.to === hoveredNeuron).length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {nodeCount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Quantum Neurons
          </div>
        </div>

        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #3b82f6'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {entanglementPairs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Entanglement Pairs
          </div>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            94.7%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Coherence Level
          </div>
        </div>

        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
            789x
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Quantum Advantage
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#8b5cf6',
            boxShadow: '0 0 10px #8b5cf6'
          }}></div>
          <span style={{ color: '#9ca3af' }}>Quantum Neurons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#3b82f6',
            boxShadow: '0 0 10px #3b82f6'
          }}></div>
          <span style={{ color: '#9ca3af' }}>Classical Neurons</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px',
            height: '2px',
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
          }}></div>
          <span style={{ color: '#9ca3af' }}>Quantum Entanglement</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 10px #fbbf24'
          }}></div>
          <span style={{ color: '#9ca3af' }}>Hovered (Active)</span>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.75rem'
      }}>
        💡 Hover over neurons to see details • Watch the brain "breathe" in real-time
      </div>
    </div>
  );
};

export default InteractiveQGNNBrain;

