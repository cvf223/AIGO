/**
 * 📊 DETAILED VIEW - Level 2 System Dashboard
 * ===========================================
 * 
 * Comprehensive view with full metrics, configuration, and performance graphs
 */

import React from 'react';
import BlueprintPanel from '../../shared/BlueprintPanel';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DetailedView = ({ systemId, systemData }) => {
  const fullMetrics = systemData.fullMetrics || {};
  const config = systemData.config || {};
  const performance = systemData.performance || {};
  const connections = systemData.connections || [];
  const eventLog = systemData.eventLog || [];

  // Mock performance data for charts
  const performanceData = [
    { time: '15:30', value: 87 },
    { time: '15:35', value: 92 },
    { time: '15:40', value: 89 },
    { time: '15:45', value: 94 },
    { time: '15:50', value: 91 }
  ];

  return (
    <div className="detailed-view space-y-6">
      {/* Full Metrics Grid */}
      <BlueprintPanel title="📊 COMPLETE METRICS" icon="📈">
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(fullMetrics).map(([key, value]) => (
            <div key={key} className="p-3 bg-steel-700 bg-opacity-30 rounded border border-steel-500">
              <div className="text-xs font-mono text-steel-300 uppercase mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-lg font-bold font-mono text-compliance-green">
                {typeof value === 'number' 
                  ? value.toLocaleString()
                  : typeof value === 'boolean'
                  ? (value ? '✅ Yes' : '❌ No')
                  : String(value).substring(0, 30)}
              </div>
            </div>
          ))}
        </div>
      </BlueprintPanel>

      {/* Performance Graph */}
      <BlueprintPanel title="📈 PERFORMANCE TRENDS" icon="📊" variant="glass">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.3)" />
            <XAxis dataKey="time" stroke="#A8A9AD" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
            <YAxis stroke="#A8A9AD" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#374151', 
                border: '2px solid #6B7280',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono'
              }} 
            />
            <Area type="monotone" dataKey="value" stroke="#00D9FF" strokeWidth={2} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </BlueprintPanel>

      {/* Configuration Display */}
      <BlueprintPanel title="⚙️ CONFIGURATION" icon="🔧">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(config).slice(0, 20).map(([key, value]) => (
            <div key={key} className="flex justify-between p-2 bg-steel-700 bg-opacity-20 rounded border-l-4 border-blueprint-accent">
              <span className="text-sm font-mono text-steel-300">
                {key}:
              </span>
              <span className="text-sm font-mono text-compliance-green font-bold">
                {typeof value === 'object' 
                  ? JSON.stringify(value).substring(0, 40) + '...'
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      </BlueprintPanel>

      {/* Connection Topology */}
      <BlueprintPanel title="🔗 SYSTEM CONNECTIONS" icon="🌐" variant="glass">
        {connections.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {connections.map((conn, index) => (
              <div key={index} className="p-3 bg-blueprint-accent bg-opacity-30 rounded border border-compliance-green">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <div className="font-industrial font-bold text-sm">{conn.name}</div>
                    <div className="text-xs font-mono text-steel-400">{conn.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-steel-400">
            <div className="text-4xl mb-2">🔗</div>
            <div className="font-body">No connections detected</div>
          </div>
        )}
      </BlueprintPanel>

      {/* Event Log Stream */}
      <BlueprintPanel title="📜 EVENT LOG" icon="📋">
        {eventLog.length > 0 ? (
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
            {eventLog.map((event, index) => (
              <div key={index} className="p-2 hover:bg-steel-700 hover:bg-opacity-30 rounded">
                <span className="text-steel-400">[{event.timestamp || 'unknown'}]</span>{' '}
                <span className="text-compliance-green">{event.level || 'INFO'}</span>{' '}
                <span className="text-white">{event.message || JSON.stringify(event)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-steel-400">
            <div className="text-4xl mb-2">📜</div>
            <div className="font-body">No event log available</div>
          </div>
        )}
      </BlueprintPanel>
    </div>
  );
};

export default DetailedView;

