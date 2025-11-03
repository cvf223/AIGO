import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({});
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();

  // Fetch initial notification counts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/notifications/unread`);
        
        // Transform to object with agent_id as keys
        const notifObj = {};
        response.data.forEach(item => {
          notifObj[item.agent_id] = item.count;
        });
        
        setNotifications(notifObj);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for new notification updates
    socket.on('update_notification', (data) => {
      setNotifications(prev => ({
        ...prev,
        [data.agent_id]: data.count
      }));
    });

    return () => {
      socket.off('update_notification');
    };
  }, [socket, connected]);

  // Mark notifications as read
  const markAsRead = async (agentId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/notifications/mark-read`, { agent_id: agentId });
      
      // Update local state
      setNotifications(prev => ({
        ...prev,
        [agentId]: 0
      }));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return Object.values(notifications).reduce((sum, count) => sum + count, 0);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        loading, 
        markAsRead,
        getTotalUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
