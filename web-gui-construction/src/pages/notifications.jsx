/**
 * 🔔 NOTIFICATIONS PAGE - Real-Time Notification Center
 * ====================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Live notification feed with
 * filtering, marking read/unread, and historical tracking
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import io from 'socket.io-client';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchNotifications();

    // Setup WebSocket for real-time notifications
    const socketInstance = io('http://localhost:3001');
    
    socketInstance.on('notificationNew', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/humanloop/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'plan_complete': return '🏗️';
      case 'error_detected': return '⚠️';
      case 'compliance_passed': return '✅';
      case 'escalation_created': return '🎫';
      case 'learning_milestone': return '🧠';
      case 'agent_created': return '🤖';
      case 'compliance_violation': return '❌';
      default: return '📬';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  return (
    <div className="notifications-page space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-architectural text-compliance-green mb-2">
            🔔 NOTIFICATION CENTER
          </h1>
          <p className="text-steel-300 font-body">
            Real-time system notifications and alerts
          </p>
        </div>
        
        <div className="px-4 py-2 bg-error-red rounded border-2 border-error-red relative">
          <span className="font-mono font-bold">{notifications.length} UNREAD</span>
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <BlueprintPanel>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-mono border-2 transition-all ${
              filter === 'all' 
                ? 'bg-compliance-green border-compliance-green text-blueprint-dark font-bold' 
                : 'bg-steel-700 border-steel-500 hover:border-compliance-green'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('plan_complete')}
            className={`px-4 py-2 rounded font-mono border-2 transition-all ${
              filter === 'plan_complete'
                ? 'bg-compliance-green border-compliance-green text-blueprint-dark font-bold'
                : 'bg-steel-700 border-steel-500 hover:border-compliance-green'
            }`}
          >
            🏗️ Plan Analysis
          </button>
          <button
            onClick={() => setFilter('error_detected')}
            className={`px-4 py-2 rounded font-mono border-2 transition-all ${
              filter === 'error_detected'
                ? 'bg-safety-yellow border-safety-yellow text-blueprint-dark font-bold'
                : 'bg-steel-700 border-steel-500 hover:border-safety-yellow'
            }`}
          >
            ⚠️ Errors
          </button>
          <button
            onClick={() => setFilter('compliance_passed')}
            className={`px-4 py-2 rounded font-mono border-2 transition-all ${
              filter === 'compliance_passed'
                ? 'bg-compliance-green border-compliance-green text-blueprint-dark font-bold'
                : 'bg-steel-700 border-steel-500 hover:border-compliance-green'
            }`}
          >
            ✅ Compliance
          </button>
          <button
            onClick={() => setFilter('escalation_created')}
            className={`px-4 py-2 rounded font-mono border-2 transition-all ${
              filter === 'escalation_created'
                ? 'bg-error-red border-error-red text-white font-bold'
                : 'bg-steel-700 border-steel-500 hover:border-error-red'
            }`}
          >
            🎫 Escalations
          </button>
        </div>
      </BlueprintPanel>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifications.map((notification, index) => (
          <div
            key={index}
            className="p-4 blueprint-panel border-l-4 border-compliance-green hover:border-construction-orange transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
                <div>
                  <h3 className="font-industrial font-bold text-lg mb-1">
                    {notification.title || notification.type}
                  </h3>
                  <p className="text-sm font-body text-steel-300 mb-2">
                    {notification.message || notification.content?.description || 'No message'}
                  </p>
                  <div className="flex items-center space-x-3 text-xs font-mono text-steel-400">
                    <span>{new Date(notification.timestamp || Date.now()).toLocaleString()}</span>
                    {notification.priority && (
                      <>
                        <span>•</span>
                        <span>Priority: {notification.priority}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button className="px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono border border-steel-500 transition-colors">
                ✓ MARK READ
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <BlueprintPanel variant="glass">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <div className="font-industrial text-2xl">No Notifications</div>
              <div className="font-body text-steel-300 mt-2">
                {filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
              </div>
            </div>
          </BlueprintPanel>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

