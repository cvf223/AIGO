/**
 * 🔌 API CLIENT - HTTP & WebSocket Communication
 * ==============================================
 * 
 * Centralized API client for all backend communication
 */

import io from 'socket.io-client';
import { apiConfig, apiCall, buildUrl } from '../config/api';

const API_URL = apiConfig.apiUrl;
const WS_URL = apiConfig.wsUrl;

/**
 * 🌐 HTTP API CLIENT
 */
export const api = {
  // System endpoints
  async getSystems() {
    const response = await fetch(`${API_URL}/api/systems`);
    return response.json();
  },

  async getSystemStatus(systemId) {
    const response = await fetch(`${API_URL}/api/systems/${systemId}/status`);
    return response.json();
  },

  async getSystemState(systemId, detailLevel = 'summary') {
    const response = await fetch(`${API_URL}/api/systems/${systemId}/state?detailLevel=${detailLevel}`);
    return response.json();
  },

  async getSystemMetrics(systemId) {
    const response = await fetch(`${API_URL}/api/systems/${systemId}/metrics`);
    return response.json();
  },

  async getSystemLogs(systemId, limit = 100) {
    const response = await fetch(`${API_URL}/api/systems/${systemId}/logs?limit=${limit}`);
    return response.json();
  },

  // Chat endpoints
  async sendChatMessage(target, message, reasoningConfig) {
    const response = await fetch(`${API_URL}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message, reasoningConfig })
    });
    return response.json();
  },

  async getChatHistory(agentId, limit = 50) {
    const response = await fetch(`${API_URL}/api/chat/history/${agentId}?limit=${limit}`);
    return response.json();
  },

  async configureLLM(config) {
    const response = await fetch(`${API_URL}/api/chat/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Human-in-loop endpoints
  async getNotifications() {
    const response = await fetch(`${API_URL}/api/humanloop/notifications`);
    return response.json();
  },

  async getMailbox() {
    const response = await fetch(`${API_URL}/api/humanloop/mailbox`);
    return response.json();
  },

  async respondToEscalation(escalationId, response, action) {
    const result = await fetch(`${API_URL}/api/humanloop/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escalationId, response, action })
    });
    return result.json();
  },

  async approvePlan(planId, action, edits, reconsiderationPrompt) {
    const response = await fetch(`${API_URL}/api/humanloop/approve-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, action, edits, reconsiderationPrompt })
    });
    return response.json();
  },

  // Construction endpoints
  async getProjects() {
    const response = await fetch(`${API_URL}/api/construction/projects`);
    return response.json();
  },

  async getPlanStatus() {
    const response = await fetch(`${API_URL}/api/construction/plans/status`);
    return response.json();
  }
};

/**
 * 🔌 WEBSOCKET CLIENT
 */
export class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected to', WS_URL);
      this.emit('connected', { timestamp: Date.now() });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.emit('error', { error: error.message });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.emit('disconnected', { timestamp: Date.now(), reason });
    });

    this.socket.on('systemUpdate', (data) => {
      this.emit('systemUpdate', data);
    });

    this.socket.on('chatMessage', (data) => {
      this.emit('chatMessage', data);
    });

    this.socket.on('escalation', (data) => {
      this.emit('escalation', data);
    });

    this.socket.on('planPresentation', (data) => {
      this.emit('planPresentation', data);
    });

    this.socket.on('notificationNew', (data) => {
      this.emit('notificationNew', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  subscribeToSystem(systemId) {
    if (this.socket) {
      this.socket.emit('subscribeToSystem', systemId);
    }
  }

  unsubscribeFromSystem(systemId) {
    if (this.socket) {
      this.socket.emit('unsubscribeFromSystem', systemId);
    }
  }

  sendChatMessage(data) {
    if (this.socket) {
      this.socket.emit('chatMessage', data);
    }
  }

  configureLLM(config) {
    if (this.socket) {
      this.socket.emit('configureLLM', config);
    }
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();

export default { api, wsClient };

