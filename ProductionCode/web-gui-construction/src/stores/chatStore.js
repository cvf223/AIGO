/**
 * 💬 CHAT STORE - Global Chat State Management
 * ============================================
 * 
 * Manages chat history, targets, and configurations
 */

import { create } from 'zustand';
import { wsService } from '../services/websocket';
import { apiConfig, apiCall } from '../config/api';

const useChatStore = create((set, get) => ({
  // Chat targets - NO HARDCODED DATA
  availableTargets: {
    agents: [],
    llms: [],  // Will be loaded from API
    coordinators: [
      { id: 'centralNervousSystem', name: 'Central Nervous System', type: 'coordinator' },
      { id: 'all-agents', name: 'ALL Agents (Broadcast)', type: 'broadcast' }
    ]
  },

  // Current chat state
  selectedTarget: {
    id: 'centralNervousSystem',
    name: 'Central Nervous System',
    type: 'coordinator'
  },
  
  chatHistories: new Map(), // targetId -> messages[]
  
  // Chat session management
  chatSessions: [], // Array of chat sessions with metadata
  currentSessionId: null,
  activeChatTabs: [], // Array of open chat tabs
  
  reasoningConfig: {
    detailLevel: 5,
    enableCoT: true,
    enableCoA: false,
    enableToT: false,
    enableGoT: false,
    enableDeepResearch: false,
    enableCreativity: false,
    enableConceptTuning: false,
    enableFormalVerification: false,
    planningDepth: 5,
    confidenceThreshold: 0.8,
    autoPresentPlans: true,
    temperature: 0.7,
    maxTokens: 2000
  },

  isConnected: false,
  isProcessing: false,
  streamingMessage: null,

  // Actions
  setSelectedTarget: (target) => set({ selectedTarget: target }),
  
  setReasoningConfig: (config) => set({ reasoningConfig: config }),
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),

  // Initialize agents from backend - FIXED FOR CURRENT BACKEND FORMAT
  initializeAgents: async () => {
    try {
      const data = await apiCall(apiConfig.endpoints.agents);
      
      // Backend returns { agents: [...], totalAgents: 7, activeAgents: 7 }
      if (data.agents && Array.isArray(data.agents)) {
        set(state => ({
          availableTargets: {
            ...state.availableTargets,
            agents: data.agents.map(agent => ({
              id: agent.id,
              name: agent.name,
              type: 'agent',
              role: agent.role || 'Construction Specialist',
              status: agent.status,
              accuracy: agent.accuracy,
              quantumBoost: agent.quantumBoost
            }))
          }
        }));
        
        console.log(`✅ Loaded agents: ${data.agents.length} construction specialists`);
      } else {
        console.log('⚠️ No agents found in backend response:', data);
      }
    } catch (error) {
      console.error('Failed to initialize agents:', error);
    }
  },

  // Initialize LLMs from backend - FIXED FOR CURRENT BACKEND FORMAT
  initializeLLMs: async () => {
    try {
      const response = await fetch(`${apiConfig.apiUrl}/api/llm/models`);
      const data = await response.json();
      
      // Backend returns { models: [{ name: 'llava:34b', status: 'active', accuracy: 98.5, type: 'vision' }], totalModels: 3 }
      if (data.models && Array.isArray(data.models)) {
        const llms = data.models.map(model => ({
          id: model.name,
          name: `${model.name} (${model.type}) - ${model.accuracy}% accuracy`,
          type: 'llm',
          modelName: model.name,
          modelType: model.type,
          accuracy: model.accuracy,
          status: model.status,
          quantumEnhanced: data.quantumEnhanced || false
        }));
        
        set(state => ({
          availableTargets: {
            ...state.availableTargets,
            llms
          }
        }));
        
        console.log(`✅ Loaded LLMs: ${llms.length} models available`);
      } else {
        console.log('⚠️ No LLMs found in backend response:', data);
      }
    } catch (error) {
      console.error('Failed to load LLMs:', error);
    }
  },

  // Get chat history for current session - UPDATED FOR SESSION MANAGEMENT
  getCurrentChatHistory: () => {
    const state = get();
    const sessionId = state.currentSessionId;
    return sessionId ? state.chatHistories.get(sessionId) || [] : [];
  },

  // Add message to chat history - UPDATED FOR SESSION MANAGEMENT
  addMessage: (message) => {
    const state = get();
    const sessionId = message.sessionId || state.currentSessionId || 'default';
    const history = state.chatHistories.get(sessionId) || [];
    
    const newHistory = [...history, {
      ...message,
      timestamp: message.timestamp || Date.now(),
      sessionId: sessionId
    }];
    
    const newHistories = new Map(state.chatHistories);
    newHistories.set(sessionId, newHistory);
    
    set({ chatHistories: newHistories });
    
    // Update session metadata if it exists
    const session = state.chatSessions.find(s => s.id === sessionId);
    if (session) {
      get().updateSessionMetadata(sessionId, {
        messageCount: newHistory.length,
        lastActive: new Date().toISOString()
      });
    }
  },

  // Update streaming message - UPDATED FOR SESSION MANAGEMENT
  updateStreamingMessage: (content) => {
    const state = get();
    const sessionId = state.currentSessionId;
    
    if (!state.streamingMessage) {
      // Create new streaming message for current session
      const message = {
        id: `stream-${Date.now()}`,
        from: state.selectedTarget.name,
        message: content,
        timestamp: Date.now(),
        isStreaming: true,
        sessionId: sessionId
      };
      
      set({ streamingMessage: message });
      state.addMessage(message);
    } else {
      // Update existing streaming message in current session
      const history = state.chatHistories.get(sessionId) || [];
      const updatedHistory = history.map(msg => 
        msg.id === state.streamingMessage.id 
          ? { ...msg, message: content }
          : msg
      );
      
      const newHistories = new Map(state.chatHistories);
      newHistories.set(sessionId, updatedHistory);
      
      set({ 
        chatHistories: newHistories,
        streamingMessage: { ...state.streamingMessage, message: content }
      });
    }
  },

  // Finish streaming - UPDATED FOR SESSION MANAGEMENT & PROCESSING FIX
  finishStreaming: () => {
    const state = get();
    
    if (state.streamingMessage) {
      const sessionId = state.currentSessionId;
      const history = state.chatHistories.get(sessionId) || [];
      const updatedHistory = history.map(msg => 
        msg.id === state.streamingMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      );
      
      const newHistories = new Map(state.chatHistories);
      newHistories.set(sessionId, updatedHistory);
      
      set({ 
        chatHistories: newHistories,
        streamingMessage: null,
        isProcessing: false // CRITICAL FIX: Clear processing state here
      });
      
      // Update session with final message
      get().updateSessionMetadata(sessionId, {
        lastActive: new Date().toISOString()
      });
      
      // Persist updated session
      get().persistChatSessions();
      
      console.log('✅ Chat response completed, processing cleared');
    } else {
      // SAFETY FIX: Clear processing even if no streaming message
      set({ isProcessing: false });
      console.log('⚠️ No streaming message found, but cleared processing state');
    }
  },

  // Send message with session management
  sendMessage: async (message) => {
    const state = get();
    
    // Ensure we have a current session
    if (!state.currentSessionId) {
      get().createNewChatSession();
    }
    
    // Add user message to current session history
    state.addMessage({
      from: 'user',
      message,
      timestamp: Date.now(),
      sessionId: state.currentSessionId
    });
    
    set({ isProcessing: true, streamingMessage: null });
    
    try {
      // Send via WebSocket with session info
      await wsService.sendChatMessage(
        state.selectedTarget,
        message,
        state.reasoningConfig,
        state.currentSessionId
      );
      
      // Update session metadata
      get().updateSessionMetadata(state.currentSessionId, {
        lastActive: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message to chat
      state.addMessage({
        from: 'system',
        message: `❌ Error: ${error.message}`,
        timestamp: Date.now(),
        isError: true,
        sessionId: state.currentSessionId
      });
      
      // CRITICAL FIX: Always clear processing state on error
      set({ isProcessing: false });
    }
    
    // NOTE: Don't set isProcessing: false here - wait for WebSocket response
  },

  // Clear chat history for current target
  clearCurrentChat: () => {
    const state = get();
    const targetId = state.selectedTarget.id;
    const newHistories = new Map(state.chatHistories);
    newHistories.delete(targetId);
    set({ chatHistories: newHistories });
  },

  // Clear all chat histories
  clearAllChats: () => {
    set({ chatHistories: new Map() });
  },

  // =============================================================================
  // CHAT SESSION MANAGEMENT & PERSISTENCE
  // =============================================================================
  
  // Create new chat session
  createNewChatSession: (target = null, title = null) => {
    const state = get();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const selectedTarget = target || state.selectedTarget;
    
    const newSession = {
      id: sessionId,
      title: title || `Chat with ${selectedTarget.name}`,
      target: selectedTarget,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      messageCount: 0,
      reasoningConfig: { ...state.reasoningConfig },
      isActive: true
    };
    
    const updatedSessions = [...state.chatSessions, newSession];
    const updatedTabs = [...state.activeChatTabs, newSession];
    
    // Initialize empty chat history for new session
    const newHistories = new Map(state.chatHistories);
    newHistories.set(sessionId, []);
    
    set({
      chatSessions: updatedSessions,
      activeChatTabs: updatedTabs,
      currentSessionId: sessionId,
      chatHistories: newHistories,
      selectedTarget: selectedTarget
    });
    
    // Persist sessions
    get().persistChatSessions();
    
    console.log(`✅ New chat session created: ${sessionId} with ${selectedTarget.name}`);
    return sessionId;
  },
  
  // Switch to existing chat session
  switchToChatSession: (sessionId) => {
    const state = get();
    const session = state.chatSessions.find(s => s.id === sessionId);
    
    if (session) {
      // Update session as active
      const updatedSessions = state.chatSessions.map(s => ({
        ...s,
        isActive: s.id === sessionId,
        lastActive: s.id === sessionId ? new Date().toISOString() : s.lastActive
      }));
      
      set({
        chatSessions: updatedSessions,
        currentSessionId: sessionId,
        selectedTarget: session.target,
        reasoningConfig: session.reasoningConfig
      });
      
      // Add to active tabs if not already there
      if (!state.activeChatTabs.find(tab => tab.id === sessionId)) {
        set(state => ({
          activeChatTabs: [...state.activeChatTabs, session]
        }));
      }
      
      get().persistChatSessions();
      
      console.log(`✅ Switched to chat session: ${sessionId}`);
      return true;
    }
    
    return false;
  },
  
  // Close chat tab
  closeChatTab: (sessionId) => {
    const state = get();
    const updatedTabs = state.activeChatTabs.filter(tab => tab.id !== sessionId);
    
    // If closing current session, switch to another or create new
    let newCurrentSessionId = state.currentSessionId;
    if (state.currentSessionId === sessionId) {
      if (updatedTabs.length > 0) {
        newCurrentSessionId = updatedTabs[0].id;
        get().switchToChatSession(newCurrentSessionId);
      } else {
        // No tabs left, create new session
        newCurrentSessionId = get().createNewChatSession();
      }
    }
    
    set({
      activeChatTabs: updatedTabs,
      currentSessionId: newCurrentSessionId
    });
    
    get().persistChatSessions();
  },
  
  // Update session metadata
  updateSessionMetadata: (sessionId, updates) => {
    const state = get();
    const updatedSessions = state.chatSessions.map(session => {
      if (session.id === sessionId) {
        const messageCount = state.chatHistories.get(sessionId)?.length || 0;
        return {
          ...session,
          ...updates,
          messageCount: messageCount,
          lastActive: new Date().toISOString()
        };
      }
      return session;
    });
    
    set({ chatSessions: updatedSessions });
    get().persistChatSessions();
  },
  
  // Persist chat sessions to localStorage
  persistChatSessions: () => {
    const state = get();
    
    try {
      const persistData = {
        sessions: state.chatSessions,
        activeTabs: state.activeChatTabs,
        currentSessionId: state.currentSessionId,
        chatHistories: Array.from(state.chatHistories.entries()), // Convert Map to Array for JSON
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('constructionChatSessions', JSON.stringify(persistData));
      console.log(`💾 Chat sessions persisted: ${state.chatSessions.length} sessions`);
    } catch (error) {
      console.error('Failed to persist chat sessions:', error);
    }
  },
  
  // Load chat sessions from localStorage
  loadChatSessions: () => {
    try {
      const persistedData = localStorage.getItem('constructionChatSessions');
      
      if (persistedData) {
        const data = JSON.parse(persistedData);
        
        set({
          chatSessions: data.sessions || [],
          activeChatTabs: data.activeTabs || [],
          currentSessionId: data.currentSessionId,
          chatHistories: new Map(data.chatHistories || []) // Convert Array back to Map
        });
        
        console.log(`📂 Loaded chat sessions: ${data.sessions?.length || 0} sessions`);
        
        // If no current session, create one
        if (!data.currentSessionId && data.sessions?.length === 0) {
          get().createNewChatSession();
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
    
    // Create initial session if no persisted data
    get().createNewChatSession();
    return false;
  },
  
  // Get current session info
  getCurrentSession: () => {
    const state = get();
    return state.chatSessions.find(s => s.id === state.currentSessionId);
  },
  
  // Get session chat history
  getSessionChatHistory: (sessionId) => {
    const state = get();
    return state.chatHistories.get(sessionId) || [];
  }
}));

export default useChatStore;
