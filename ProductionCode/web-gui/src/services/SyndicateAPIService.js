/**
 * 🌐 SYNDICATE API SERVICE - REAL BACKEND CONNECTION
 * ==================================================
 * 
 * Connects React frontend to elite-web-server.js backend
 * Provides real-time data instead of mock data
 */

import { io } from 'socket.io-client';

// Backend configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

class SyndicateAPIService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }
    
    /**
     * 🔗 CONNECT TO BACKEND
     * =====================
     */
    connect() {
        console.log(`🔗 Connecting to backend: ${WS_URL}`);
        
        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts
        });
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to Syndicate backend');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });
        
        this.socket.on('disconnect', () => {
            console.log('⚠️ Disconnected from backend');
            this.isConnected = false;
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
            this.reconnectAttempts++;
        });
        
        // Real-time event listeners
        this.socket.on('new_opportunity', (data) => {
            this.emit('opportunity', data);
        });
        
        this.socket.on('agent_activity', (data) => {
            this.emit('agent-decision', data);
        });
        
        this.socket.on('learning_update', (data) => {
            this.emit('learning', data);
        });
        
        this.socket.on('evolution_update', (data) => {
            this.emit('evolution', data);
        });
        
        this.socket.on('breakthrough', (data) => {
            this.emit('breakthrough', data);
        });
        
        return this;
    }
    
    /**
     * 📡 EMIT TO LISTENERS
     * ====================
     */
    emit(event, data) {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }
    
    /**
     * 👂 SUBSCRIBE TO EVENTS
     * ======================
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 🔌 DISCONNECT
     * =============
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
    
    // ========================================
    // API METHODS - REAL DATA FETCHING
    // ========================================
    
    /**
     * 📊 GET SYNDICATE STATUS
     */
    async getSyndicateStatus() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/syndicate/status`);
            if (!response.ok) throw new Error('Failed to fetch status');
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get syndicate status:', error);
            return this.getFallbackStatus();
        }
    }
    
    /**
     * 🤖 GET AGENTS
     */
    async getAgents() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/agents`);
            if (!response.ok) throw new Error('Failed to fetch agents');
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get agents:', error);
            return [];
        }
    }
    
    /**
     * 📈 GET AGENT PERFORMANCE
     */
    async getAgentPerformance(agentId) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/agents/${agentId}/performance`);
            if (!response.ok) throw new Error('Failed to fetch performance');
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error(`❌ Failed to get performance for ${agentId}:`, error);
            return null;
        }
    }
    
    /**
     * 💎 GET OPPORTUNITIES
     */
    async getOpportunities() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/opportunities`);
            if (!response.ok) throw new Error('Failed to fetch opportunities');
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get opportunities:', error);
            return [];
        }
    }
    
    /**
     * 🧬 GET ALPHAGNOME STATUS
     */
    async getAlphaGnomeStatus() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/learning/alphagnome`);
            if (!response.ok) throw new Error('Failed to fetch AlphaGnome');
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get AlphaGnome status:', error);
            return this.getFallbackAlphaGnome();
        }
    }
    
    /**
     * 📬 GET INBOX REQUESTS
     */
    async getInboxRequests() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/inbox/requests`);
            if (!response.ok) throw new Error('Failed to fetch inbox');
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('❌ Failed to get inbox:', error);
            return [];
        }
    }
    
    /**
     * ✉️ RESPOND TO REQUEST
     */
    async respondToRequest(requestId, response) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/inbox/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, response })
            });
            if (!res.ok) throw new Error('Failed to respond');
            return await res.json();
        } catch (error) {
            console.error('❌ Failed to respond:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ========================================
    // FALLBACK DATA (When backend unavailable)
    // ========================================
    
    getFallbackStatus() {
        return {
            status: 'initializing',
            agents: 0,
            opportunities: 0,
            uptime: 0,
            message: 'Connecting to backend...'
        };
    }
    
    getFallbackAlphaGnome() {
        return {
            generation: 0,
            fitness: 0,
            population: 0,
            status: 'initializing'
        };
    }
}

// Export singleton instance
const syndicateAPI = new SyndicateAPIService();
export default syndicateAPI;




