/**
 * ⚙️ LOADING SPINNER - Construction-Themed Loading Indicator
 * ==========================================================
 */

import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClasses[size]} mb-4 animate-spin-slow`}>
        ⚙️
      </div>
      {text && (
        <div className="font-industrial text-lg text-steel-300">
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

