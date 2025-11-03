/**
 * 🔌 WEBSOCKET CONTEXT - Real-Time Updates
 * ========================================
 * 
 * Live connection to production server for real-time analysis updates
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useProjectStore } from '../stores/projectStore';

const WS_URL = process.env.VITE_WS_URL || 'http://162.55.83.33:3000';

interface WebSocketContextValue {
  socket: Socket | null;
  connected: boolean;
  subscribeToJob: (jobId: string) => void;
  unsubscribeFromJob: (jobId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  connected: false,
  subscribeToJob: () => {},
  unsubscribeFromJob: () => {}
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { updateJob } = useProjectStore();
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    // Connect to WebSocket
    const newSocket = io(`${WS_URL}/construction`, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });
    
    // Analysis progress updates
    newSocket.on('analysis:progress', (data: any) => {
      console.log('📊 Analysis progress:', data);
      updateJob(data.jobId, {
        progress: data.progress,
        message: data.message,
        status: 'processing'
      });
    });
    
    // Analysis complete
    newSocket.on('analysis:complete', (data: any) => {
      console.log('✅ Analysis complete:', data);
      updateJob(data.jobId, {
        progress: 100,
        message: 'Complete!',
        status: 'complete',
        results: data.results
      });
    });
    
    // Analysis error
    newSocket.on('analysis:error', (data: any) => {
      console.error('❌ Analysis error:', data);
      updateJob(data.jobId, {
        status: 'error',
        message: data.error
      });
    });
    
    // Queue updates
    newSocket.on('queue:update', (data: any) => {
      console.log('📋 Queue update:', data);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  const subscribeToJob = (jobId: string) => {
    if (socket) {
      socket.emit('progress:subscribe', jobId);
      console.log(`📡 Subscribed to job: ${jobId}`);
    }
  };
  
  const unsubscribeFromJob = (jobId: string) => {
    if (socket) {
      socket.emit('progress:unsubscribe', jobId);
    }
  };
  
  return (
    <WebSocketContext.Provider value={{ socket, connected, subscribeToJob, unsubscribeFromJob }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);

