/**
 * 📊 SYSTEMS MONITORING PAGE - Comprehensive System Overview
 * ==========================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Monitor all 60+ systems with
 * adaptive detail levels and real-time updates
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import SystemSelector from '../components/monitoring/SystemSelector';
import SystemDetailView from '../components/monitoring/SystemDetailView';
import io from 'socket.io-client';

const SystemsPage = () => {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [detailLevel, setDetailLevel] = useState('summary');
  const [systemData, setSystemData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial systems list
    fetchSystemsList();

    // Setup WebSocket connection
    const socketInstance = io('http://localhost:3001');
    
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('systemUpdate', (update) => {
      // Update system data if it's the currently selected system
      if (selectedSystem && update.systemId === selectedSystem) {
        setSystemData(update.data);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    // Subscribe to system updates when selection changes
    if (socket && selectedSystem) {
      socket.emit('subscribeToSystem', selectedSystem);
      fetchSystemData(selectedSystem, detailLevel);

      return () => {
        socket.emit('unsubscribeFromSystem', selectedSystem);
      };
    }
  }, [socket, selectedSystem, detailLevel]);

  const fetchSystemsList = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/systems');
      const data = await response.json();
      
      if (data.success) {
        setSystems(data.systems);
        
        // Auto-select first system
        if (data.systems.length > 0 && !selectedSystem) {
          setSelectedSystem(data.systems[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch systems:', error);
    }
  };

  const fetchSystemData = async (systemId, level) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/systems/${systemId}/state?detailLevel=${level}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSystemData(data.state);
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    }
  };

  const handleSystemChange = (systemId) => {
    setSelectedSystem(systemId);
    setSystemData(null); // Clear while loading
  };

  const handleDetailLevelChange = (level) => {
    setDetailLevel(level);
    if (selectedSystem) {
      fetchSystemData(selectedSystem, level);
    }
  };

  return (
    <div className="systems-page space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-architectural text-compliance-green mb-2">
            📊 SYSTEM MONITORING CENTER
          </h1>
          <p className="text-steel-300 font-body">
            Comprehensive real-time monitoring of all 60+ systems
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-compliance-green' : 'bg-error-red'} animate-pulse-slow`} />
          <span className="text-sm font-mono">
            {isConnected ? 'REAL-TIME ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* System Selector */}
      <BlueprintPanel>
        <SystemSelector
          systems={systems}
          selectedSystem={selectedSystem}
          onSystemChange={handleSystemChange}
        />
      </BlueprintPanel>

      {/* Detail Level Controls */}
      <BlueprintPanel title="🎛️ DETAIL LEVEL" variant="glass">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleDetailLevelChange('summary')}
            className={`
              px-6 py-2 rounded font-industrial font-bold border-2 transition-all
              ${detailLevel === 'summary'
                ? 'bg-compliance-green border-compliance-green text-blueprint-dark'
                : 'bg-steel-700 border-steel-500 hover:border-compliance-green'}
            `}
          >
            📄 SUMMARY
          </button>
          <button
            onClick={() => handleDetailLevelChange('detailed')}
            className={`
              px-6 py-2 rounded font-industrial font-bold border-2 transition-all
              ${detailLevel === 'detailed'
                ? 'bg-construction-orange border-construction-orange text-blueprint-dark'
                : 'bg-steel-700 border-steel-500 hover:border-construction-orange'}
            `}
          >
            📊 DETAILED
          </button>
          <button
            onClick={() => handleDetailLevelChange('deep')}
            className={`
              px-6 py-2 rounded font-industrial font-bold border-2 transition-all
              ${detailLevel === 'deep'
                ? 'bg-error-red border-error-red text-white'
                : 'bg-steel-700 border-steel-500 hover:border-error-red'}
            `}
          >
            🔬 DEEP STATE
          </button>
          
          <div className="flex-1" />
          
          <div className="text-xs font-mono text-steel-400">
            {detailLevel === 'summary' && '⚡ Lightweight - Fast loading'}
            {detailLevel === 'detailed' && '📊 Comprehensive - Full metrics'}
            {detailLevel === 'deep' && '🔬 Complete - Full internal state'}
          </div>
        </div>
      </BlueprintPanel>

      {/* System Detail View */}
      {selectedSystem && systemData && (
        <SystemDetailView
          systemId={selectedSystem}
          systemData={systemData}
          detailLevel={detailLevel}
        />
      )}

      {/* Loading State */}
      {selectedSystem && !systemData && (
        <BlueprintPanel>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-spin-slow">⚙️</div>
              <div className="font-industrial text-xl">Loading System Data...</div>
              <div className="text-sm font-mono text-steel-400 mt-2">
                {selectedSystem} - {detailLevel} level
              </div>
            </div>
          </div>
        </BlueprintPanel>
      )}
    </div>
  );
};

export default SystemsPage;

