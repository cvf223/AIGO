/**
 * 📋 BLUEPRINT PANEL - Construction-Themed Panel Component
 * ========================================================
 * 
 * Panel with blueprint paper texture and steel frame border
 */

import React from 'react';

const BlueprintPanel = ({ 
  children, 
  title, 
  icon, 
  className = '',
  variant = 'default' // default, steel, glass
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'steel':
        return 'steel-frame bg-steel-700';
      case 'glass':
        return 'glass-panel';
      default:
        return 'blueprint-panel';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {/* Panel Header */}
      {title && (
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-steel-500">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl font-industrial font-bold text-compliance-green">
            {title}
          </h2>
        </div>
      )}

      {/* Panel Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BlueprintPanel;

