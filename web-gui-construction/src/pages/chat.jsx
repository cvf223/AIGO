/**
 * 💬 LLM CHAT PAGE - Elite Chat Interface
 * ========================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Advanced LLM chat with reasoning controls,
 * multi-target selection, and plan editing capabilities
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import LLMChatWindow from '../components/chat/LLMChatWindow';
import ReasoningControlPanel from '../components/chat/ReasoningControlPanel';
import useChatStore from '../stores/chatStore';
import wsService from '../services/websocket';

const ChatPage = () => {
  const {
    availableTargets,
    selectedTarget,
    setSelectedTarget,
    reasoningConfig,
    setReasoningConfig,
    isConnected,
    setIsConnected,
    isProcessing,
    getCurrentChatHistory,
    sendMessage,
    initializeAgents,
    initializeLLMs,
    updateStreamingMessage,
    finishStreaming,
    // Chat session management
    loadChatSessions,
    chatSessions,
    currentSessionId,
    activeChatTabs,
    createNewChatSession,
    switchToChatSession,
    closeChatTab,
    getCurrentSession
  } = useChatStore();

  const [expandedCategory, setExpandedCategory] = useState('coordinators');

  useEffect(() => {
    // Initialize chat sessions from persistence
    loadChatSessions();
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Initialize available agents and LLMs
    initializeAgents();
    initializeLLMs();

    // Setup WebSocket listeners
    const unsubscribers = [
      wsService.onChatResponse(handleChatResponse),
      wsService.onChatStreaming(handleChatStreaming),
      wsService.onAgentStatus(handleAgentStatus)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      await wsService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleChatResponse = (data) => {
    console.log('📨 Chat response received:', data);
    
    // CRITICAL FIX: Always finish streaming and clear processing
    finishStreaming();
    
    if (data.response) {
      useChatStore.getState().addMessage({
        from: data.from || selectedTarget.name,
        message: data.response,
        reasoning: data.reasoning,
        tokensUsed: data.tokensUsed,
        timestamp: data.timestamp || Date.now(),
        sessionId: currentSessionId // Add session tracking
      });
    }
    
    // SAFETY FIX: Ensure processing is definitely cleared
    setTimeout(() => {
      useChatStore.getState().setIsProcessing(false);
    }, 100);
  };

  const handleChatStreaming = (data) => {
    updateStreamingMessage(data.content);
  };

  const handleAgentStatus = (data) => {
    // Update agent status in available targets
    // This could trigger a re-fetch of agents
    initializeAgents();
  };

  const handleSendMessage = async (message) => {
    await sendMessage(message);
  };

  const renderTargetSection = (title, targets, icon, color) => {
    const isExpanded = expandedCategory === title.toLowerCase();
    
    return (
      <div className="mb-4">
        <button
          onClick={() => setExpandedCategory(isExpanded ? null : title.toLowerCase())}
          className="w-full flex items-center justify-between p-3 bg-steel-700 hover:bg-steel-600 rounded transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <span className="font-industrial font-bold text-sm uppercase">{title}</span>
            <span className="text-xs font-mono text-steel-400">({targets.length})</span>
          </div>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {targets.map(target => (
              <button
                key={target.id}
                onClick={() => setSelectedTarget(target)}
                className={`
                  w-full p-3 text-left rounded transition-all
                  ${selectedTarget.id === target.id
                    ? `bg-${color}-600 border-2 border-${color}-400`
                    : 'bg-steel-700 hover:bg-steel-600 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body text-sm">{target.name}</div>
                    {target.role && (
                      <div className="text-xs font-mono text-steel-400">{target.role}</div>
                    )}
                  </div>
                  {target.status && (
                    <div className={`
                      w-2 h-2 rounded-full
                      ${target.status === 'active' ? 'bg-compliance-green' : 'bg-steel-500'}
                    `} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-page">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-architectural text-compliance-green mb-2">
            💬 LLM CHAT INTERFACE
          </h1>
          <p className="text-steel-300 font-body">
            Advanced AI communication with reasoning controls and multi-target selection
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-compliance-green' : 'bg-error-red'} animate-pulse-slow`} />
          <span className="text-sm font-mono">
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Chat Session Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-industrial font-bold text-steel-200">💬 Chat Sessions</span>
            <span className="text-sm font-mono text-steel-400">({activeChatTabs.length} active)</span>
          </div>
          <button
            onClick={() => createNewChatSession()}
            className="px-4 py-2 bg-compliance-green hover:bg-compliance-green-dark rounded text-sm font-mono font-bold transition-colors"
          >
            ➕ New Chat
          </button>
        </div>
        
        {/* Chat Tabs */}
        <div className="flex space-x-1 overflow-x-auto">
          {activeChatTabs.map((session) => (
            <div
              key={session.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-t border-2 border-b-0 cursor-pointer transition-all ${
                session.id === currentSessionId
                  ? 'bg-blueprint-accent bg-opacity-20 border-blueprint-accent text-blueprint-accent'
                  : 'bg-steel-800 border-steel-600 text-steel-300 hover:bg-steel-700'
              }`}
              onClick={() => switchToChatSession(session.id)}
            >
              <span className="text-xs font-mono max-w-32 truncate">{session.title}</span>
              <span className="text-xs text-steel-400">({session.messageCount || 0})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeChatTab(session.id);
                }}
                className="text-xs text-error-red hover:text-error-red-light ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Target Selection */}
        <div className="lg:col-span-1 space-y-4">
          <BlueprintPanel title="🎯 CHAT TARGET" variant="steel">
            <div className="space-y-4">
              {/* Current Target Display */}
              <div className="p-4 bg-blueprint-accent bg-opacity-20 rounded border-2 border-blueprint-accent">
                <div className="text-xs font-mono text-steel-400 mb-1">CURRENT TARGET</div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {selectedTarget.type === 'agent' ? '🤖' : 
                     selectedTarget.type === 'llm' ? '🧠' : 
                     selectedTarget.type === 'broadcast' ? '📢' : '🏗️'}
                  </span>
                  <div>
                    <div className="font-industrial font-bold">{selectedTarget.name}</div>
                    <div className="text-xs font-mono text-steel-400">
                      Type: {selectedTarget.type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Categories */}
              {renderTargetSection('Coordinators', availableTargets.coordinators, '🏗️', 'blueprint')}
              {renderTargetSection('Agents', availableTargets.agents, '🤖', 'compliance')}
              {renderTargetSection('LLMs', availableTargets.llms, '🧠', 'construction')}
            </div>
          </BlueprintPanel>

          {/* Quick Actions */}
          <BlueprintPanel title="⚡ QUICK ACTIONS" variant="glass">
            <div className="space-y-2">
              <button 
                className="w-full p-2 bg-compliance-green hover:bg-compliance-green-dark rounded text-sm font-mono font-bold transition-colors"
                onClick={() => createNewChatSession()}
              >
                ➕ New Chat Session
              </button>
              
              <button 
                className="w-full p-2 bg-steel-700 hover:bg-steel-600 rounded text-sm font-mono transition-colors"
                onClick={() => useChatStore.getState().clearCurrentChat()}
              >
                🗑️ Clear Current Chat
              </button>
              <button 
                className="w-full p-2 bg-steel-700 hover:bg-steel-600 rounded text-sm font-mono transition-colors"
                onClick={() => {
                  const allAgents = availableTargets.coordinators.find(t => t.id === 'all-agents');
                  if (allAgents) setSelectedTarget(allAgents);
                }}
              >
                📢 Broadcast to All
              </button>
              <button 
                className="w-full p-2 bg-steel-700 hover:bg-steel-600 rounded text-sm font-mono transition-colors"
                onClick={connectWebSocket}
                disabled={isConnected}
              >
                🔌 Reconnect WebSocket
              </button>
            </div>
          </BlueprintPanel>
        </div>

        {/* Center - Chat Window */}
        <div className="lg:col-span-2">
          <LLMChatWindow
            target={selectedTarget}
            chatHistory={getCurrentChatHistory()}
            onSendMessage={handleSendMessage}
            reasoningConfig={reasoningConfig}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Sidebar - Reasoning Controls */}
        <div className="lg:col-span-1">
          <ReasoningControlPanel
            config={reasoningConfig}
            onChange={setReasoningConfig}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-4 bg-steel-700 bg-opacity-50 rounded border border-steel-500">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="text-steel-400">
              Active Agents: {availableTargets.agents.filter(a => a.status === 'active').length}/{availableTargets.agents.length}
            </span>
            <span className="text-steel-400">
              Messages: {getCurrentChatHistory().length}
            </span>
            <span className="text-steel-400">
              Detail Level: {reasoningConfig.detailLevel}/10
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-steel-400">
              Reasoning: {[
                reasoningConfig.enableCoT && 'CoT',
                reasoningConfig.enableCoA && 'CoA',
                reasoningConfig.enableToT && 'ToT', 
                reasoningConfig.enableGoT && 'GoT',
                reasoningConfig.enableZAP && 'ZAP'
              ].filter(Boolean).join(', ') || 'None'}
            </span>
            <span className={`${isProcessing ? 'text-construction-orange' : 'text-compliance-green'}`}>
              {isProcessing ? '⚙️ Processing...' : '✅ Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
