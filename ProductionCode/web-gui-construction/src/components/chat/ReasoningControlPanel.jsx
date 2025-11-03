/**
 * ⚙️ REASONING CONTROL PANEL - LLM Reasoning Configuration
 * ========================================================
 * 
 * Advanced controls for setting detail level, reasoning methods,
 * and planning parameters
 */

import React from 'react';
import BlueprintPanel from '../shared/BlueprintPanel';

const ReasoningControlPanel = ({ config, onChange }) => {
  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  const toggleMethod = (method) => {
    updateConfig(method, !config[method]);
  };

  return (
    <BlueprintPanel title="⚙️ REASONING CONTROLS" variant="steel">
      <div className="space-y-6">
        {/* Detail Level Slider */}
        <div>
          <label className="block text-sm font-mono text-steel-300 mb-2 uppercase">
            Detail Level: {config.detailLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.detailLevel}
            onChange={(e) => updateConfig('detailLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-steel-600 rounded-lg appearance-none cursor-pointer accent-compliance-green"
          />
          <div className="flex justify-between text-xs font-mono text-steel-400 mt-1">
            <span>Brief</span>
            <span>Detailed</span>
            <span>Exhaustive</span>
          </div>
        </div>

        {/* Reasoning Methods */}
        <div>
          <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
            🧠 Reasoning Methods
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableCoT}
                onChange={() => toggleMethod('enableCoT')}
                className="w-5 h-5 accent-compliance-green"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-body text-sm">Chain-of-Thought (CoT)</div>
                  {config.enableCoT && (
                    <span className="ml-2 text-xs font-mono text-compliance-green animate-pulse-slow">● ACTIVE</span>
                  )}
                </div>
                <div className="text-xs font-mono text-steel-400">Step-by-step reasoning</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableCoA}
                onChange={() => toggleMethod('enableCoA')}
                className="w-5 h-5 accent-compliance-green"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-body text-sm">Chain-of-Agents (CoA)</div>
                  {config.enableCoA && (
                    <span className="ml-2 text-xs font-mono text-compliance-green animate-pulse-slow">● ACTIVE</span>
                  )}
                </div>
                <div className="text-xs font-mono text-steel-400">Multi-agent collaboration</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableToT}
                onChange={() => toggleMethod('enableToT')}
                className="w-5 h-5 accent-compliance-green"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-body text-sm">Tree-of-Thought (ToT)</div>
                  {config.enableToT && (
                    <span className="ml-2 text-xs font-mono text-compliance-green animate-pulse-slow">● ACTIVE</span>
                  )}
                </div>
                <div className="text-xs font-mono text-steel-400">Explore multiple paths</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableGoT}
                onChange={() => toggleMethod('enableGoT')}
                className="w-5 h-5 accent-compliance-green"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-body text-sm">Graph-of-Thought (GoT)</div>
                  {config.enableGoT && (
                    <span className="ml-2 text-xs font-mono text-compliance-green animate-pulse-slow">● ACTIVE</span>
                  )}
                </div>
                <div className="text-xs font-mono text-steel-400">Complex reasoning graphs</div>
              </div>
            </label>
          </div>
        </div>

        {/* Advanced Features */}
        <div>
          <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
            🚀 Advanced Features
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableDeepResearch}
                onChange={() => toggleMethod('enableDeepResearch')}
                className="w-5 h-5 accent-compliance-green"
              />
              <span className="font-body text-sm">Deep Research (Multi-source)</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableCreativity}
                onChange={() => toggleMethod('enableCreativity')}
                className="w-5 h-5 accent-compliance-green"
              />
              <span className="font-body text-sm">Creativity Enhancement</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableConceptTuning}
                onChange={() => toggleMethod('enableConceptTuning')}
                className="w-5 h-5 accent-compliance-green"
              />
              <span className="font-body text-sm">Concept Fine-tuning</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
              <input
                type="checkbox"
                checked={config.enableFormalVerification}
                onChange={() => toggleMethod('enableFormalVerification')}
                className="w-5 h-5 accent-compliance-green"
              />
              <span className="font-body text-sm">Formal Verification</span>
            </label>
          </div>
        </div>

        {/* Planning Settings */}
        <div>
          <h4 className="text-sm font-industrial font-bold text-construction-orange mb-3 uppercase">
            📋 Planning Settings
          </h4>
          
          {/* Planning Depth */}
          <div className="mb-4">
            <label className="block text-sm font-mono text-steel-300 mb-2">
              Planning Depth: {config.planningDepth} steps
            </label>
            <select
              value={config.planningDepth}
              onChange={(e) => updateConfig('planningDepth', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono text-sm"
            >
              {[3, 5, 7, 10, 15].map(depth => (
                <option key={depth} value={depth}>{depth} steps</option>
              ))}
            </select>
          </div>

          {/* Confidence Threshold */}
          <div className="mb-4">
            <label className="block text-sm font-mono text-steel-300 mb-2">
              Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={config.confidenceThreshold}
              onChange={(e) => updateConfig('confidenceThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-steel-600 rounded-lg appearance-none cursor-pointer accent-compliance-green"
            />
          </div>

          {/* Auto-present Plans */}
          <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-steel-600 rounded transition-colors">
            <input
              type="checkbox"
              checked={config.autoPresentPlans}
              onChange={() => toggleMethod('autoPresentPlans')}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body text-sm">Auto-present plans for review</span>
          </label>
        </div>

        {/* Temperature Control */}
        <div>
          <label className="block text-sm font-mono text-steel-300 mb-2">
            Temperature: {config.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-steel-600 rounded-lg appearance-none cursor-pointer accent-construction-orange"
          />
          <div className="flex justify-between text-xs font-mono text-steel-400 mt-1">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-mono text-steel-300 mb-2">
            Max Tokens: {config.maxTokens}
          </label>
          <select
            value={config.maxTokens}
            onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono text-sm"
          >
            <option value="500">500 (Brief)</option>
            <option value="1000">1000 (Standard)</option>
            <option value="2000">2000 (Detailed)</option>
            <option value="4000">4000 (Comprehensive)</option>
          </select>
        </div>

        {/* Preset Buttons */}
        <div className="mt-6 space-y-2">
          <div className="text-xs font-mono text-steel-300 uppercase mb-2">Quick Presets:</div>
          <button
            onClick={() => onChange({
              ...config,
              detailLevel: 3,
              enableCoT: false,
              temperature: 0.3,
              planningDepth: 3
            })}
            className="w-full px-3 py-2 bg-steel-600 hover:bg-steel-500 rounded text-sm font-mono border border-steel-400 transition-colors"
          >
            ⚡ Quick Response
          </button>
          <button
            onClick={() => onChange({
              ...config,
              detailLevel: 7,
              enableCoT: true,
              enableDeepResearch: true,
              temperature: 0.5,
              planningDepth: 7
            })}
            className="w-full px-3 py-2 bg-blueprint-accent hover:bg-blueprint-light rounded text-sm font-mono border border-blueprint-light transition-colors"
          >
            🧠 Balanced Analysis
          </button>
          <button
            onClick={() => onChange({
              ...config,
              detailLevel: 10,
              enableCoT: true,
              enableToT: true,
              enableDeepResearch: true,
              enableFormalVerification: true,
              temperature: 0.7,
              planningDepth: 15
            })}
            className="w-full px-3 py-2 bg-construction-orange hover:bg-safety-yellow rounded text-sm font-mono border border-construction-orange transition-colors"
          >
            🚀 Maximum Intelligence
          </button>
        </div>
      </div>
    </BlueprintPanel>
  );
};

export default ReasoningControlPanel;

