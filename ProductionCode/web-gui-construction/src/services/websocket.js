/**
 * 🔌 WEBSOCKET SERVICE - Real-time Communication
 * ==============================================
 * 
 * Handles WebSocket connections for real-time chat and system updates
 */

import { io } from 'socket.io-client';
import { apiConfig } from '../config/api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connectionPromise = null;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(url = null) {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const wsUrl = url || apiConfig.wsUrl;
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 300000, // 5 minutes for advanced models
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected');
        this.setupBaseListeners();
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });
    });

    return this.connectionPromise;
  }

  /**
   * Setup base event listeners
   */
  setupBaseListeners() {
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 WebSocket reconnected after ${attemptNumber} attempts`);
    });
  }

  /**
   * Send chat message with session support
   */
  sendChatMessage(target, message, reasoningConfig = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('chat:send', {
        target,
        message,
        reasoningConfig,
        sessionId,
        timestamp: Date.now()
      }, (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  /**
   * Subscribe to chat responses
   */
  onChatResponse(callback) {
    this.on('chat:response', callback);
  }

  /**
   * Subscribe to chat streaming
   */
  onChatStreaming(callback) {
  }  /**   * Subscribe to chat keep-alive   */  onChatKeepAlive(callback) {    this.on("chat:keepalive", callback);
    this.on('chat:streaming', callback);
  }

  /**
   * Subscribe to system updates
   */
  onSystemUpdate(callback) {
    this.on('system:update', callback);
  }

  /**
   * Subscribe to agent status changes
   */
  onAgentStatus(callback) {
    this.on('agent:status', callback);
  }

  /**
   * Subscribe to analysis progress
   */
  onAnalysisProgress(callback) {
    this.on('analysis:progress', callback);
  }

  /**
   * Generic event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      
      if (this.socket) {
        this.socket.on(event, (...args) => {
          this.listeners.get(event)?.forEach(cb => cb(...args));
        });
      }
    }
    
    this.listeners.get(event).add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, queuing event:', event);
      return;
    }
    
    this.socket.emit(event, data);
  }

  /**
   * Request with acknowledgment
   */
  request(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for event: ${event}`));
      }, 30000);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
      this.listeners.clear();
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
