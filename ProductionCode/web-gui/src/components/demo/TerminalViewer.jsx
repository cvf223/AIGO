import React, { useState, useEffect, useRef } from 'react';

/**
 * 🖥️ LIVE TERMINAL VIEWER - Show Backend Logs in Browser
 * =======================================================
 * Displays real-time system logs for impressive demo visualization
 */
export const TerminalViewer = ({ apiUrl = 'http://localhost:3000' }) => {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Connect to log stream
    const connectToLogs = () => {
      const ws = new WebSocket(`ws://localhost:3000/logs`);
      
      ws.onmessage = (event) => {
        const logEntry = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-200), logEntry]); // Keep last 200 logs
      };
      
      ws.onerror = () => {
        console.error('WebSocket error - retrying...');
        setTimeout(connectToLogs, 5000);
      };
    };
    
    // Fallback: Fetch logs periodically
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/demo/logs`);
        const data = await response.json();
        if (data.logs) {
          setLogs(data.logs.slice(-200));
        }
      } catch (error) {
        console.error('Failed to fetch logs');
      }
    };
    
    // Try WebSocket first, fallback to polling
    try {
      connectToLogs();
    } catch {
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogColor = (log) => {
    if (log.includes('✅') || log.includes('SUCCESS')) return '#10b981';
    if (log.includes('❌') || log.includes('ERROR')) return '#ef4444';
    if (log.includes('⚠️') || log.includes('WARNING')) return '#f59e0b';
    if (log.includes('🧠') || log.includes('Agent')) return '#8b5cf6';
    if (log.includes('🔍') || log.includes('Analysis')) return '#06b6d4';
    return '#9ca3af';
  };

  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '1rem',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🖥️</span>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>Live System Terminal</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              padding: '0.25rem 0.75rem',
              background: autoScroll ? '#8b5cf6' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {autoScroll ? '📌 Auto-scroll ON' : '📌 Auto-scroll OFF'}
          </button>
          <button
            onClick={() => setLogs([])}
            style={{
              padding: '0.25rem 0.75rem',
              background: '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background: '#000',
          padding: '1rem',
          borderRadius: '4px'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', paddingTop: '2rem' }}>
            Waiting for system activity...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                color: getLogColor(log),
                marginBottom: '0.25rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#6b7280'
      }}>
        <span>{logs.length} log entries</span>
        <span>{autoScroll ? '🟢 Live' : '🔴 Paused'}</span>
      </div>
    </div>
  );
};

export default TerminalViewer;


