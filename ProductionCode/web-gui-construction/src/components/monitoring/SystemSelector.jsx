/**
 * 🎯 SYSTEM SELECTOR - System Selection Dropdown
 * ==============================================
 * 
 * Categorized dropdown for selecting from 60+ systems
 */

import React, { useState } from 'react';

const SystemSelector = ({ systems, selectedSystem, onSystemChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group systems by category
  const systemsByCategory = systems.reduce((acc, system) => {
    if (!acc[system.category]) {
      acc[system.category] = [];
    }
    acc[system.category].push(system);
    return acc;
  }, {});

  // Filter systems
  const filteredSystems = systems.filter(system => {
    const matchesSearch = system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         system.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Object.keys(systemsByCategory)];

  return (
    <div className="system-selector space-y-4">
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search systems..."
            className="w-full px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* System Count */}
        <div className="px-4 py-2 bg-blueprint-accent rounded border-2 border-blueprint-light">
          <span className="font-mono font-bold">{filteredSystems.length} Systems</span>
        </div>
      </div>

      {/* System Dropdown Grid */}
      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
        {filteredSystems.map((system) => {
          const isSelected = selectedSystem === system.id;
          const statusColor = 
            system.status === 'operational' ? 'border-compliance-green' :
            system.status === 'warning' ? 'border-safety-yellow' :
            system.status === 'error' ? 'border-error-red' :
            'border-steel-500';

          return (
            <button
              key={system.id}
              onClick={() => onSystemChange(system.id)}
              className={`
                text-left p-3 rounded border-2 transition-all
                ${isSelected
                  ? `bg-blueprint-accent ${statusColor} shadow-blueprint`
                  : `bg-steel-700 bg-opacity-50 border-steel-500 hover:${statusColor}`}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-steel-400">{system.category}</span>
                <span className="text-lg">
                  {system.status === 'operational' && '🟢'}
                  {system.status === 'warning' && '🟡'}
                  {system.status === 'error' && '🔴'}
                  {system.status === 'offline' && '⚫'}
                </span>
              </div>
              <div className="font-industrial font-bold text-sm mb-1">
                {system.name}
              </div>
              <div className="text-xs font-mono text-steel-400">
                {system.id}
              </div>
            </button>
          );
        })}
      </div>

      {/* No results */}
      {filteredSystems.length === 0 && (
        <div className="text-center py-8 text-steel-400">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-body">No systems match your search</div>
        </div>
      )}
    </div>
  );
};

export default SystemSelector;

