/**
 * 🔬 DEEP STATE VIEW - Level 3 Complete Internal Inspection
 * =========================================================
 * 
 * Full transparency view with complete state, database data, and debugging tools
 */

import React, { useState } from 'react';
import BlueprintPanel from '../../shared/BlueprintPanel';

const DeepStateView = ({ systemId, systemData }) => {
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderJSON = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') {
      return (
        <span className="text-compliance-green">
          {JSON.stringify(obj)}
        </span>
      );
    }

    return (
      <div className={`ml-${Math.min(depth * 4, 12)}`}>
        {Object.entries(obj).slice(0, 100).map(([key, value]) => (
          <div key={key} className="my-1">
            <span className="text-construction-orange">{key}</span>
            <span className="text-steel-400">: </span>
            {typeof value === 'object' ? (
              <span className="text-steel-300">{Array.isArray(value) ? '[Array]' : '{Object}'}</span>
            ) : (
              <span className="text-compliance-green">
                {typeof value === 'string' ? `"${value}"` : String(value)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const sections = [
    { key: 'recoverableState', title: 'Recoverable State', data: systemData.recoverableState },
    { key: 'fullConfig', title: 'Full Configuration', data: systemData.fullConfig },
    { key: 'internalState', title: 'Internal State', data: systemData.internalState },
    { key: 'databaseData', title: 'Database Data', data: systemData.databaseData },
    { key: 'debugInfo', title: 'Debug Information', data: systemData.debugInfo }
  ];

  return (
    <div className="deep-state-view space-y-6">
      {/* Warning Banner */}
      <div className="p-4 bg-construction-orange bg-opacity-20 border-2 border-construction-orange rounded">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <div className="font-industrial font-bold">DEEP STATE INSPECTION MODE</div>
            <div className="text-sm font-mono text-steel-300">
              Complete internal state exposure - Use for debugging only
            </div>
          </div>
        </div>
      </div>

      {/* State Sections */}
      {sections.map((section) => (
        <BlueprintPanel 
          key={section.key}
          title={section.title.toUpperCase()}
          icon="🔍"
        >
          <div className="mb-3">
            <button
              onClick={() => toggleSection(section.key)}
              className="btn-industrial text-sm"
            >
              {expandedSections.has(section.key) ? '▼ COLLAPSE' : '▶ EXPAND'}
            </button>
          </div>

          {expandedSections.has(section.key) && (
            <div className="p-4 bg-black bg-opacity-40 rounded border border-steel-500 font-mono text-xs overflow-x-auto">
              {section.data ? (
                <pre className="text-compliance-green">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              ) : (
                <div className="text-steel-400 text-center py-4">
                  No data available
                </div>
              )}
            </div>
          )}
        </BlueprintPanel>
      ))}

      {/* Debug Information */}
      {systemData.debugInfo && (
        <BlueprintPanel title="🐛 DEBUG INFORMATION" icon="🔧" variant="steel">
          <div className="space-y-3">
            <div className="p-3 bg-steel-700 bg-opacity-30 rounded">
              <div className="text-sm font-mono text-steel-300 mb-2">Constructor:</div>
              <div className="text-lg font-mono text-compliance-green font-bold">
                {systemData.debugInfo.constructorName}
              </div>
            </div>

            <div className="p-3 bg-steel-700 bg-opacity-30 rounded">
              <div className="text-sm font-mono text-steel-300 mb-2">
                Properties ({systemData.debugInfo.properties?.length || 0}):
              </div>
              <div className="flex flex-wrap gap-2">
                {systemData.debugInfo.properties?.slice(0, 20).map((prop, index) => (
                  <span key={index} className="px-2 py-1 bg-blueprint-accent text-xs rounded font-mono">
                    {prop}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-steel-700 bg-opacity-30 rounded">
              <div className="text-sm font-mono text-steel-300 mb-2">
                Methods ({systemData.debugInfo.methods?.length || 0}):
              </div>
              <div className="flex flex-wrap gap-2">
                {systemData.debugInfo.methods?.slice(0, 20).map((method, index) => (
                  <span key={index} className="px-2 py-1 bg-construction-orange bg-opacity-30 text-xs rounded font-mono">
                    {method}()
                  </span>
                ))}
              </div>
            </div>
          </div>
        </BlueprintPanel>
      )}
    </div>
  );
};

export default DeepStateView;

