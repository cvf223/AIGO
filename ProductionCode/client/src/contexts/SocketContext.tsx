/**
 * 🔌 SOCKET.IO CONTEXT PROVIDER
 * ============================
 * 
 * Provides real-time WebSocket connection to all components
 * Handles automatic reconnection and data streaming
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    agents: any[];
    opportunities: any[];
    systemMetrics: any;
    subscribe: (event: string, callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
    emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    agents: [],
    opportunities: [],
    systemMetrics: {},
    subscribe: () => {},
    unsubscribe: () => {},
    emit: () => {}
});

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [systemMetrics, setSystemMetrics] = useState<any>({});

    useEffect(() => {
        // Create socket connection
        const socketInstance = io('http://localhost:3000', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(socketInstance);

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('🔌 Connected to Elite Web Server');
            setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from server:', reason);
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error);
            setConnected(false);
        });

        // Data event handlers
        socketInstance.on('initialData', (data) => {
            console.log('📊 Received initial data:', data);
            setAgents(data.agents || []);
            setSystemMetrics(data.systemMetrics || {});
        });

        socketInstance.on('newOpportunity', (opportunity) => {
            console.log('💼 New opportunity:', opportunity);
            setOpportunities(prev => [opportunity, ...prev.slice(0, 99)]);
        });

        socketInstance.on('agentUpdate', (agent) => {
            console.log('🤖 Agent update:', agent);
            setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
        });

        socketInstance.on('metricsUpdate', (metrics) => {
            console.log('📊 Metrics update:', metrics);
            setSystemMetrics(metrics);
        });

        // Cleanup
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const subscribe = (event: string, callback: (data: any) => void) => {
        if (socket) {
            socket.on(event, callback);
        }
    };

    const unsubscribe = (event: string) => {
        if (socket) {
            socket.off(event);
        }
    };

    const emit = (event: string, data?: any) => {
        if (socket && connected) {
            socket.emit(event, data);
        }
    };

    const value: SocketContextType = {
        socket,
        connected,
        agents,
        opportunities,
        systemMetrics,
        subscribe,
        unsubscribe,
        emit
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
