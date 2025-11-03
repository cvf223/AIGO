/**
 * 📊 SYSTEM DETAIL VIEW - Adaptive System Information Display
 * ===========================================================
 * 
 * Three-level adaptive display: Summary, Detailed, Deep State
 */

import React from 'react';
import BlueprintPanel from '../shared/BlueprintPanel';
import MetricGauge from '../shared/MetricGauge';
import SummaryView from './views/SummaryView';
import DetailedView from './views/DetailedView';
import DeepStateView from './views/DeepStateView';

const SystemDetailView = ({ systemId, systemData, detailLevel }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      case 'offline': return '⚫';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-compliance-green';
      case 'warning': return 'text-safety-yellow';
      case 'error': return 'text-error-red';
      case 'offline': return 'text-steel-400';
      default: return 'text-steel-300';
    }
  };

  return (
    <div className="system-detail-view space-y-6">
      {/* System Header */}
      <BlueprintPanel variant="steel">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-5xl">{getStatusIcon(systemData.status)}</span>
            <div>
              <h2 className="text-3xl font-architectural text-compliance-green">
                {systemData.name}
              </h2>
              <p className="text-steel-300 font-mono text-sm mt-1">
                System ID: {systemId}
              </p>
            </div>
          </div>
          
          <div className={`
            px-6 py-3 rounded border-3 font-industrial font-bold text-xl uppercase
            ${getStatusColor(systemData.status)}
            border-current
          `}>
            {systemData.status}
          </div>
        </div>
      </BlueprintPanel>

      {/* Adaptive Content Rendering */}
      {detailLevel === 'summary' && (
        <SummaryView systemId={systemId} systemData={systemData} />
      )}

      {detailLevel === 'detailed' && (
        <DetailedView systemId={systemId} systemData={systemData} />
      )}

      {detailLevel === 'deep' && (
        <DeepStateView systemId={systemId} systemData={systemData} />
      )}
    </div>
  );
};

export default SystemDetailView;

