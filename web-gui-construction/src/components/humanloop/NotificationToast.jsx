/**
 * 🔔 NOTIFICATION TOAST - Pop-up Notification Component
 * ====================================================
 * 
 * Toast-style notifications for real-time alerts
 */

import React, { useEffect } from 'react';

const NotificationToast = ({ notification, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'error_detected':
        return 'bg-error-red border-error-red';
      case 'plan_complete':
        return 'bg-compliance-green border-compliance-green text-blueprint-dark';
      case 'compliance_passed':
        return 'bg-compliance-green border-compliance-green text-blueprint-dark';
      case 'escalation_created':
        return 'bg-safety-yellow border-safety-yellow text-blueprint-dark';
      default:
        return 'bg-blueprint-accent border-blueprint-light';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'error_detected': return '⚠️';
      case 'plan_complete': return '🏗️';
      case 'compliance_passed': return '✅';
      case 'escalation_created': return '🎫';
      case 'learning_milestone': return '🧠';
      default: return '📬';
    }
  };

  return (
    <div className={`
      notification-toast
      fixed top-20 right-6 z-50
      p-4 rounded-lg border-l-6 shadow-construction
      ${getTypeStyles(notification.type)}
      animate-slide-in-right
      max-w-md
    `}>
      <div className="flex items-start space-x-3">
        <span className="text-3xl">{getTypeIcon(notification.type)}</span>
        <div className="flex-1">
          <h4 className="font-industrial font-bold mb-1">
            {notification.title || notification.type}
          </h4>
          <p className="text-sm font-body">
            {notification.message || 'No message'}
          </p>
          <div className="text-xs font-mono mt-2 opacity-75">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:scale-125 transition-transform"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

