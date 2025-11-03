/**
 * 🎯 SYSTEM CARD - System Status Display Component
 * ================================================
 * 
 * Steel-framed status card with construction aesthetic
 * for displaying individual system information
 */

import React from 'react';

const SystemCard = ({ system, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-compliance-green border-compliance-green';
      case 'warning':
        return 'text-safety-yellow border-safety-yellow';
      case 'error':
        return 'text-error-red border-error-red';
      case 'offline':
        return 'text-steel-400 border-steel-400';
      default:
        return 'text-concrete-300 border-concrete-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      case 'offline': return '⚫';
      default: return '⚪';
    }
  };

  return (
    <div
      onClick={onClick}
      className="blueprint-panel p-4 cursor-pointer hover:border-compliance-green transition-all duration-300 hover:shadow-blueprint"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon(system.status)}</span>
          <div>
            <h3 className="font-industrial font-bold text-lg">{system.name}</h3>
            <p className="text-xs text-steel-300 font-mono">{system.id}</p>
          </div>
        </div>
        <div className={`
          px-3 py-1 rounded border-2 text-xs font-bold font-mono uppercase
          ${getStatusColor(system.status)}
        `}>
          {system.status}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-blueprint-accent text-xs rounded font-mono">
          {system.category}
        </span>
      </div>

      {/* Key Metrics */}
      {system.keyMetrics && Object.keys(system.keyMetrics).length > 0 && (
        <div className="space-y-2">
          {Object.entries(system.keyMetrics).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-steel-300 font-mono capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="font-mono font-bold text-compliance-green">
                {typeof value === 'number' 
                  ? value.toLocaleString() 
                  : String(value).substring(0, 20)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Activity Indicator */}
      {system.recentActivity && system.recentActivity.length > 0 && (
        <div className="mt-3 pt-3 border-t border-steel-500">
          <div className="text-xs text-steel-300 font-mono">
            Last activity: {new Date(system.recentActivity[0]?.timestamp || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Click to expand indicator */}
      <div className="mt-3 text-xs text-center text-construction-orange font-mono">
        Click for details →
      </div>
    </div>
  );
};

export default SystemCard;

