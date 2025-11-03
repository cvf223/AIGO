/**
 * 📄 SUMMARY VIEW - Level 1 System Overview  
 * =========================================
 * 
 * Lightweight view with status and key metrics
 */

import React from 'react';
import BlueprintPanel from '../../shared/BlueprintPanel';
import MetricGauge from '../../shared/MetricGauge';

const SummaryView = ({ systemId, systemData }) => {
  const keyMetrics = systemData.keyMetrics || {};
  const recentActivity = systemData.recentActivity || [];

  return (
    <div className="summary-view space-y-6">
      {/* Key Metrics Gauges */}
      <BlueprintPanel title="🎯 KEY METRICS" icon="📊">
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(keyMetrics).slice(0, 6).map(([key, value]) => (
            <MetricGauge
              key={key}
              value={typeof value === 'number' ? value : 0}
              max={100}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              color="#00D9FF"
            />
          ))}
          
          {Object.keys(keyMetrics).length === 0 && (
            <div className="col-span-4 text-center py-8 text-steel-400">
              <div className="text-4xl mb-2">📊</div>
              <div className="font-body">No metrics available for this system</div>
            </div>
          )}
        </div>
      </BlueprintPanel>

      {/* Recent Activity Timeline */}
      <BlueprintPanel title="📋 RECENT ACTIVITY" icon="🔄" variant="glass">
        {recentActivity.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-steel-700 bg-opacity-30 rounded border-l-4 border-compliance-green"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-steel-300">
                    {activity.timestamp 
                      ? new Date(activity.timestamp).toLocaleTimeString()
                      : 'Recent'}
                  </span>
                  <span className="text-sm font-body">
                    {activity.description || activity.event || activity.type || 'Activity'}
                  </span>
                </div>
                <span className="text-xl">✅</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-steel-400">
            <div className="text-4xl mb-2">📋</div>
            <div className="font-body">No recent activity recorded</div>
          </div>
        )}
      </BlueprintPanel>

      {/* Quick Actions */}
      <BlueprintPanel title="⚡ QUICK ACTIONS" variant="glass">
        <div className="grid grid-cols-3 gap-3">
          <button className="btn-industrial">
            🔄 REFRESH DATA
          </button>
          <button className="btn-industrial">
            📊 VIEW LOGS
          </button>
          <button className="btn-industrial">
            ⚙️ CONFIGURE
          </button>
        </div>
      </BlueprintPanel>
    </div>
  );
};

export default SummaryView;
