/**
 * 📊 METRIC GAUGE - Construction-Style Metric Visualization
 * =========================================================
 * 
 * Circular gauge with industrial aesthetic for displaying metrics
 */

import React from 'react';

const MetricGauge = ({ 
  value, 
  max = 100, 
  label, 
  unit = '', 
  size = 120,
  color = '#00D9FF' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;

  const getColorByValue = (pct) => {
    if (pct >= 90) return '#00D9FF'; // compliance-green
    if (pct >= 70) return '#FFB800'; // safety-yellow
    return '#FF0044'; // error-red
  };

  const gaugeColor = color || getColorByValue(percentage);

  return (
    <div className="metric-gauge flex flex-col items-center">
      {/* SVG Gauge */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke={gaugeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${gaugeColor})`
          }}
        />
        
        {/* Center value text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="transform rotate-90 font-mono font-bold text-xl"
          fill={gaugeColor}
          style={{ transformOrigin: 'center' }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
      </svg>

      {/* Label */}
      <div className="mt-2 text-center">
        <div className="text-sm font-mono text-steel-300">
          {label}
        </div>
        {unit && (
          <div className="text-xs font-mono text-steel-400">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricGauge;

