/**
 * 🔌 WEBSOCKET HOOK - React Hook for WebSocket Connection
 * =======================================================
 * 
 * Custom React hook for managing WebSocket connections and subscriptions
 */

import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '../services/api';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect on mount
    wsClient.connect();

    wsClient.on('connected', () => {
      setIsConnected(true);
    });

    wsClient.on('disconnected', () => {
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const subscribe = useCallback((event, callback) => {
    wsClient.on(event, callback);
  }, []);

  const unsubscribe = useCallback((event, callback) => {
    // Would need to implement unsubscribe in wsClient
  }, []);

  const send = useCallback((event, data) => {
    if (wsClient.socket) {
      wsClient.socket.emit(event, data);
    }
  }, []);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    send,
    subscribeToSystem: wsClient.subscribeToSystem.bind(wsClient),
    unsubscribeFromSystem: wsClient.unsubscribeFromSystem.bind(wsClient)
  };
};

export default useWebSocket;

