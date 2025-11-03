/**
 * 🌐 API CONFIGURATION - Centralized URL Management
 * ================================================
 * 
 * Handles all API endpoints and WebSocket connections
 * with environment-based configuration
 */

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs from environment or defaults
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (isProduction ? 'https://api.your-domain.com' : 'http://localhost:3001');

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 
               (isProduction ? 'wss://api.your-domain.com' : 'ws://localhost:3001');

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                     (isProduction ? 'https://your-domain.com' : 'http://localhost:3002');

/**
 * API Configuration Object
 */
export const apiConfig = {
  // Base URLs
  apiUrl: API_URL,
  wsUrl: WS_URL,
  frontendUrl: FRONTEND_URL,
  
  // API Endpoints
  endpoints: {
    // Health & Status
    health: `${API_URL}/health`,
    systemHealth: `${API_URL}/api/system/health`,
    
    // Authentication
    login: `${API_URL}/api/auth/login`,
    logout: `${API_URL}/api/auth/logout`,
    refresh: `${API_URL}/api/auth/refresh`,
    verify: `${API_URL}/api/auth/verify`,
    
    // Agents
    agents: `${API_URL}/api/agents`,
    agentStatus: (agentId) => `${API_URL}/api/agents/${agentId}/status`,
    agentHealth: `${API_URL}/api/agents/health`,
    
    // Chat
    chatHistory: (targetId) => `${API_URL}/api/chat/history/${targetId}`,
    chatExport: (targetId) => `${API_URL}/api/chat/export/${targetId}`,
    
    // Systems
    systems: `${API_URL}/api/systems`,
    systemState: (systemId, detailLevel) => 
      `${API_URL}/api/systems/${systemId}/state?detailLevel=${detailLevel}`,
    
    // Construction Plans
    uploadPlan: `${API_URL}/api/construction/upload-plan`,
    analyzePlan: `${API_URL}/api/construction/analyze-plan`,
    analysisProgress: (analysisId) => 
      `${API_URL}/api/construction/analysis/${analysisId}/progress`,
    analysisResults: (analysisId) => 
      `${API_URL}/api/construction/analysis/${analysisId}/results`,
    annotatePlan: `${API_URL}/api/construction/annotate-plan`,
    downloadAnnotated: (analysisId, planId, format) =>
      `${API_URL}/api/construction/analysis/${analysisId}/download-annotated/${planId}?format=${format}`,
    
    // Projects
    projects: `${API_URL}/api/construction/projects`,
    plansStatus: `${API_URL}/api/construction/plans/status`,
    
    // Human-in-the-Loop
    mailbox: `${API_URL}/api/humanloop/mailbox`,
    respond: `${API_URL}/api/humanloop/respond`,
    notifications: `${API_URL}/api/humanloop/notifications`,
    approvePlan: `${API_URL}/api/humanloop/approve-plan`,
    
    // Metrics
    metrics: `${API_URL}/metrics`,
    agentMetrics: `${API_URL}/api/metrics/agents`,
    
    // LLM Configuration
    llmModels: `${API_URL}/api/llm/models`,
    
    // Advanced Chat Features
    chatCapabilities: `${API_URL}/api/chat/capabilities`,
    chatSpecialists: `${API_URL}/api/chat/specialists`,
    chatConcepts: `${API_URL}/api/chat/concepts`,
    chatReasoningTemplates: `${API_URL}/api/chat/reasoning-templates`,
    
    // Dashboard
    dashboardStats: `${API_URL}/api/dashboard/stats`,
    dashboardActivity: `${API_URL}/api/dashboard/activity`,
    
    // Documentation
    apiDocs: `${API_URL}/api-docs`
  },
  
  // WebSocket Events
  wsEvents: {
    // Connection
    connect: 'connect',
    disconnect: 'disconnect',
    error: 'error',
    reconnect: 'reconnect',
    
    // Chat - Updated to match backend
    chatMessage: 'chat:send',  // Backend listens for 'chat:send'
    chatResponse: 'chat:response',
    chatStreaming: 'chat:streaming',
    chatError: 'chat:error',
    chatSelectSpecialist: 'chat:selectSpecialist',
    chatUpdateReasoningConfig: 'chat:updateReasoningConfig',
    chatRequestCapabilities: 'chat:requestCapabilities',
    chatCapabilitiesResponse: 'chat:capabilitiesResponse',
    
    // System Updates
    systemUpdate: 'system:update',
    agentStatus: 'agent:status',
    agentRegistered: 'agent:registered',
    agentUnregistered: 'agent:unregistered',
    
    // Analysis
    analysisProgress: 'analysis:progress',
    analysisComplete: 'analysis:complete',
    analysisError: 'analysis:error',
    
    // Notifications
    notification: 'notification:new',
    escalation: 'escalation:required',
    
    // Plans
    planPresented: 'plan:presented',
    planApproved: 'plan:approved',
    planRejected: 'plan:rejected'
  },
  
  // Request Configuration
  requestConfig: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // File Upload Configuration
  uploadConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
    allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg']
  }
};

/**
 * Helper function to create authenticated headers
 */
export const getAuthHeaders = (token = null) => {
  const headers = { ...apiConfig.requestConfig.headers };
  
  const authToken = token || localStorage.getItem('auth_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * Helper function to make authenticated API calls
 */
export const apiCall = async (endpoint, options = {}) => {
  const config = (typeof { === "object" ? { : {})
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API call failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

/**
 * Helper to build URL with query params
 */
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

export default apiConfig;