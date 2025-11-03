import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * 💎 SUPERIOR AGENT CHAT INTERFACE - TOP 1% FRONTEND EXCELLENCE
 * ============================================================
 * Professional-grade UI with Deep Research + Blockchain Integration
 * 
 * Features:
 * - Deep Research mode with human-in-the-loop approval
 * - Real-time blockchain data with clickable explorer links
 * - Graph-of-Thought reasoning visualization
 * - Chain-of-Agents collaboration display
 * - Smooth animations and transitions
 * - Mobile-responsive design
 * - Instant feedback for all actions
 */
export const SuperiorAgentChatInterface = ({ apiUrl = 'http://localhost:3000' }) => {
  // Agent Management
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Deep Research State
  const [deepResearch, setDeepResearch] = useState(false);
  const [researchPlan, setResearchPlan] = useState(null);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [executingSteps, setExecutingSteps] = useState([]);
  
  // Live Reasoning State
  const [liveGotSteps, setLiveGotSteps] = useState([]);
  const [liveCoaOpinions, setLiveCoaOpinions] = useState([]);
  const [showReasoningPanel, setShowReasoningPanel] = useState(true);
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize WebSocket and load agents
  useEffect(() => {
    const socket = io(apiUrl);
    socketRef.current = socket;
    
    // Agent thinking events
    socket.on('agent:thinking_started', (data) => {
      console.log('🤔 Agent started thinking:', data);
      setIsThinking(true);
      setLiveGotSteps([]);
      setLiveCoaOpinions([]);
    });
    
    // GOT reasoning steps
    socket.on('reasoning:got_step', (step) => {
      console.log('🌳 GOT step:', step);
      setLiveGotSteps(prev => {
        const idx = prev.findIndex(s => s.step === step.step);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = step;
          return updated;
        }
        return [...prev, step];
      });
    });
    
    // COA opinions
    socket.on('reasoning:coa_opinion', (opinion) => {
      console.log('🤝 COA opinion:', opinion);
      setLiveCoaOpinions(prev => [...prev, opinion]);
    });
    
    // Agent response complete
    socket.on('agent:response_complete', (response) => {
      console.log('✅ Response complete:', response);
      setIsThinking(false);
      
      const agentMessage = {
        role: 'agent',
        agentName: response.agentName,
        content: response.message,
        reasoning: {
          got: response.graphOfThought || [],
          coa: response.chainOfAgents || []
        },
        responseTime: response.responseTime,
        tokensGenerated: response.tokensGenerated,
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, agentMessage]);
    });
    
    // Deep Research events
    socket.on('deep_research:plan_created', (data) => {
      console.log('📋 Research plan created:', data);
      setResearchPlan(data.plan);
      setCurrentPlanId(data.planId);
      setAwaitingApproval(true);
      setIsThinking(false);
      
      // Add plan to messages
      setMessages(prev => [...prev, {
        role: 'research_plan',
        plan: data.plan,
        planId: data.planId,
        query: data.query,
        timestamp: Date.now()
      }]);
    });
    
    socket.on('deep_research:execution_started', (data) => {
      console.log('🔬 Execution started:', data);
      setAwaitingApproval(false);
      setIsThinking(true);
      setExecutingSteps([]);
    });
    
    socket.on('deep_research:step_started', (data) => {
      console.log('⏳ Step started:', data);
      setExecutingSteps(prev => [...prev, { ...data, status: 'running' }]);
    });
    
    socket.on('deep_research:step_progress', (data) => {
      console.log('📊 Step progress:', data);
    });
    
    socket.on('deep_research:step_complete', (data) => {
      console.log('✅ Step complete:', data);
      setExecutingSteps(prev => prev.map(step => 
        step.stepNumber === data.stepNumber 
          ? { ...step, status: 'complete' }
          : step
      ));
    });
    
    socket.on('deep_research:complete', (data) => {
      console.log('🎉 Research complete:', data);
      setIsThinking(false);
      setExecutingSteps([]);
      
      const resultMessage = {
        role: 'blockchain_results',
        agentName: data.agentName,
        query: data.query,
        results: data.results,
        executionTime: data.executionTime,
        timestamp: data.timestamp
      };
      
      setMessages(prev => [...prev, resultMessage]);
    });
    
    // Load agents
    fetch(`${apiUrl}/api/demo/agents`)
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        if (data.length > 0) setSelectedAgent(data[0]);
      })
      .catch(err => console.error('Failed to load agents:', err));
    
    return () => socket.disconnect();
  }, [apiUrl]);
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveGotSteps, liveCoaOpinions, executingSteps]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = input;
    setInput('');

    try {
      const response = await fetch(`${apiUrl}/api/demo/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          agentId: selectedAgent.id,
          deepResearch
        })
      });

      if (!response.ok) throw new Error('Chat request failed');
      
      const data = await response.json();
      
      // If it's a research plan, it will come via WebSocket
      // Regular responses come via HTTP
      if (data.type === 'research_plan') {
        // Already handled by WebSocket
      }

    } catch (error) {
      console.error('❌ Chat error:', error);
      setIsThinking(false);
      
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to get response from agent. Please try again.',
        timestamp: Date.now()
      }]);
    }
  };
  
  // Approve research plan
  const approveResearch = async () => {
    if (!currentPlanId) return;
    
    setAwaitingApproval(false);
    setIsThinking(true);
    
    try {
      await fetch(`${apiUrl}/api/demo/approve-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: currentPlanId })
      });
    } catch (error) {
      console.error('❌ Approval error:', error);
      setIsThinking(false);
    }
  };
  
  // Cancel research
  const cancelResearch = () => {
    setAwaitingApproval(false);
    setResearchPlan(null);
    setCurrentPlanId(null);
    
    setMessages(prev => [...prev, {
      role: 'system',
      content: 'Research plan cancelled by user.',
      timestamp: Date.now()
    }]);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(250px, 280px) 1fr',
      gap: '1.5rem',
      height: '750px',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    }}>
      {/* LEFT SIDEBAR - Agent Selection */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        padding: '1.5rem',
        borderRight: '1px solid rgba(139, 92, 246, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header */}
        <div>
          <h3 style={{ 
            color: '#fff', 
            marginTop: 0, 
            fontSize: '1.125rem', 
            marginBottom: '0.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🤖 AI Agents
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '0.75rem', 
            color: 'rgba(255,255,255,0.6)' 
          }}>
            Select an agent to chat with
          </p>
        </div>

        {/* Agent List */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          overflowY: 'auto'
        }}>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              style={{
                padding: '1rem',
                background: selectedAgent?.id === agent.id 
                  ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: selectedAgent?.id === agent.id 
                  ? '2px solid rgba(139, 92, 246, 0.5)' 
                  : '2px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
                boxShadow: selectedAgent?.id === agent.id 
                  ? '0 8px 20px rgba(139, 92, 246, 0.3)' 
                  : 'none',
                transform: selectedAgent?.id === agent.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (selectedAgent?.id !== agent.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAgent?.id !== agent.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {agent.name}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: agent.status === 'active' ? '#10b981' : '#ef4444',
                  boxShadow: agent.status === 'active' ? '0 0 8px #10b981' : 'none'
                }}></span>
                {agent.status === 'active' ? 'Active' : 'Offline'}
              </div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Deep Research Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: deepResearch 
              ? 'rgba(139, 92, 246, 0.2)' 
              : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: deepResearch 
              ? '2px solid #8b5cf6' 
              : '2px solid transparent'
          }}>
            <input
              type="checkbox"
              checked={deepResearch}
              onChange={(e) => setDeepResearch(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#8b5cf6'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                color: deepResearch ? '#8b5cf6' : '#fff', 
                fontSize: '0.875rem', 
                fontWeight: '600',
                marginBottom: '0.125rem'
              }}>
                🔬 Deep Research
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                Blockchain + planning
              </div>
            </div>
          </label>

          {/* Reasoning Toggle */}
          <button
            onClick={() => setShowReasoningPanel(!showReasoningPanel)}
            style={{
              padding: '0.75rem',
              background: showReasoningPanel 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {showReasoningPanel ? '🧠 Hide Reasoning' : '🧠 Show Reasoning'}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE - Chat Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        gap: '1rem'
      }}>
        {/* Chat Header */}
        <div style={{
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            color: '#fff',
            fontWeight: '700'
          }}>
            💬 Chat with {selectedAgent?.name || 'Agent'}
          </h2>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.875rem', 
            color: 'rgba(255,255,255,0.6)' 
          }}>
            {deepResearch 
              ? '🔬 Deep Research Mode: Planning + blockchain data enabled'
              : '💬 Standard Mode: GOT + COA reasoning enabled'}
          </p>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {messages.length === 0 ? (
            <EmptyState deepResearch={deepResearch} />
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                message={msg} 
                showReasoningPanel={showReasoningPanel}
                approveResearch={approveResearch}
                cancelResearch={cancelResearch}
                awaitingApproval={awaitingApproval && msg.role === 'research_plan'}
              />
            ))
          )}

          {/* Live Thinking Indicator */}
          {isThinking && (
            <LiveThinkingIndicator 
              selectedAgent={selectedAgent}
              liveGotSteps={liveGotSteps}
              liveCoaOpinions={liveCoaOpinions}
              executingSteps={executingSteps}
              showReasoningPanel={showReasoningPanel}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={deepResearch 
              ? `Try: "Show me the last 10 atomic arbitrage on Arbitrum"...`
              : `Ask ${selectedAgent?.name || 'an agent'} a question...`}
            disabled={isThinking || awaitingApproval}
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isThinking || awaitingApproval}
            style={{
              padding: '1rem 2rem',
              background: (!input.trim() || isThinking || awaitingApproval) 
                ? 'rgba(107, 114, 128, 0.5)' 
                : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: (!input.trim() || isThinking || awaitingApproval) ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '0.9375rem',
              transition: 'all 0.3s ease',
              boxShadow: (!input.trim() || isThinking || awaitingApproval) 
                ? 'none' 
                : '0 4px 15px rgba(139, 92, 246, 0.4)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isThinking && !awaitingApproval) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = (!input.trim() || isThinking || awaitingApproval) 
                ? 'none' 
                : '0 4px 15px rgba(139, 92, 246, 0.4)';
            }}
          >
            {isThinking ? '⏳ Thinking...' : awaitingApproval ? '⏸️ Waiting...' : '📤 Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for empty state
const EmptyState = ({ deepResearch }) => (
  <div style={{
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'rgba(255,255,255,0.6)'
  }}>
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
      {deepResearch ? '🔬' : '💬'}
    </div>
    <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#fff' }}>
      {deepResearch ? 'Deep Research Mode Active' : 'Start a Conversation'}
    </div>
    <div style={{ fontSize: '0.9375rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
      {deepResearch ? (
        <>
          Ask about blockchain transactions and watch the AI:
          <br/>
          <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
            • Create a research plan<br/>
            • Wait for your approval<br/>
            • Execute and show real blockchain data
          </span>
        </>
      ) : (
        <>
          Ask questions and see:
          <br/>
          <span style={{ color: '#3b82f6', fontWeight: '600' }}>
            🌳 Graph-of-Thought • 🤝 Chain-of-Agents
          </span>
        </>
      )}
    </div>
  </div>
);

// Component for message bubbles
const MessageBubble = ({ message, showReasoningPanel, approveResearch, cancelResearch, awaitingApproval }) => {
  // Research Plan Message
  if (message.role === 'research_plan') {
    return (
      <ResearchPlanDisplay 
        plan={message.plan}
        query={message.query}
        awaiting={awaitingApproval}
        onApprove={approveResearch}
        onCancel={cancelResearch}
      />
    );
  }
  
  // Blockchain Results Message
  if (message.role === 'blockchain_results') {
    return (
      <BlockchainResultsDisplay 
        query={message.query}
        results={message.results}
        executionTime={message.executionTime}
      />
    );
  }
  
  // User Message
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <div style={{
          maxWidth: '70%',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '16px 16px 4px 16px',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
            {message.content}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }
  
  // Agent Message
  if (message.role === 'agent') {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          maxWidth: '75%',
          padding: '1rem 1.25rem',
          background: 'rgba(31, 41, 55, 0.6)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '16px 16px 16px 4px',
          color: '#fff',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#fbbf24', 
            fontWeight: '600',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🤖 {message.agentName}</span>
            {message.responseTime && (
              <span style={{ color: '#10b981' }}>⚡ {message.responseTime}ms</span>
            )}
          </div>
          
          <div style={{ fontSize: '0.9375rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
            {message.content}
          </div>
          
          {message.tokensGenerated > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.75rem' }}>
              🔢 {message.tokensGenerated} tokens generated
            </div>
          )}
          
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.5rem' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        {/* Reasoning Panel */}
        {showReasoningPanel && message.reasoning && (message.reasoning.got?.length > 0 || message.reasoning.coa?.length > 0) && (
          <div style={{
            maxWidth: '75%',
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            fontSize: '0.875rem'
          }}>
            <div style={{ color: '#8b5cf6', fontWeight: '600', marginBottom: '0.75rem' }}>
              🧠 Reasoning Process
            </div>
            
            {message.reasoning.got?.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🌳 Graph-of-Thought:
                </div>
                {message.reasoning.got.map((step, i) => (
                  <div key={i} style={{ color: '#d1d5db', paddingLeft: '1rem', marginBottom: '0.375rem' }}>
                    {step.step}. {step.action} {step.status === 'complete' && '✅'}
                  </div>
                ))}
              </div>
            )}
            
            {message.reasoning.coa?.length > 0 && (
              <div>
                <div style={{ color: '#10b981', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🤝 Chain-of-Agents:
                </div>
                {message.reasoning.coa.map((agent, i) => (
                  <div key={i} style={{ color: '#d1d5db', paddingLeft: '1rem', marginBottom: '0.375rem' }}>
                    • {agent.agentName}: {agent.recommendation} ({(agent.confidence * 100).toFixed(0)}%)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // System/Error Messages
  return (
    <div style={{ 
      textAlign: 'center', 
      margin: '1rem 0', 
      padding: '0.75rem',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      color: '#ef4444',
      fontSize: '0.875rem'
    }}>
      {message.content}
    </div>
  );
};

// Research Plan Display Component
const ResearchPlanDisplay = ({ plan, query, awaiting, onApprove, onCancel }) => (
  <div style={{
    marginBottom: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
    border: '2px solid #8b5cf6',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.2)'
  }}>
    <div style={{ 
      color: '#8b5cf6', 
      fontWeight: '700', 
      fontSize: '1.125rem', 
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <span>📋</span>
      <span>Research Plan</span>
      {awaiting && (
        <span style={{ 
          fontSize: '0.75rem', 
          background: '#fbbf24', 
          color: '#000', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '12px',
          fontWeight: '600'
        }}>
          AWAITING APPROVAL
        </span>
      )}
    </div>
    
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        🎯 Goal:
      </div>
      <div style={{ color: '#d1d5db', paddingLeft: '1rem', fontSize: '0.9375rem', lineHeight: '1.6' }}>
        {plan.goal}
      </div>
    </div>
    
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        📊 Steps ({plan.steps.length}):
      </div>
      {plan.steps.map((step, i) => (
        <div key={i} style={{
          color: '#d1d5db',
          paddingLeft: '1rem',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#8b5cf6',
            textAlign: 'center',
            lineHeight: '24px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {step.step}
          </span>
          <span>{step.action}</span>
          <span style={{ color: '#6b7280' }}>({step.estimatedTimeSeconds}s)</span>
        </div>
      ))}
    </div>
    
    <div style={{ 
      marginBottom: '1.25rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.875rem' }}>
        ⏱️ Estimated Time: <span style={{ color: '#10b981' }}>{plan.estimatedTimeSeconds} seconds</span>
      </div>
    </div>
    
    {awaiting && (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onApprove}
          style={{
            flex: '1 1 180px',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.9375rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
        >
          ✅ APPROVE & EXECUTE
        </button>
        
        <button
          onClick={onCancel}
          style={{
            flex: '1 1 180px',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.9375rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
          }}
        >
          ❌ CANCEL
        </button>
      </div>
    )}
  </div>
);

// Blockchain Results Display Component
const BlockchainResultsDisplay = ({ query, results, executionTime }) => (
  <div style={{
    marginBottom: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
    border: '2px solid #10b981',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
  }}>
    <div style={{ 
      color: '#10b981', 
      fontWeight: '700', 
      fontSize: '1.125rem', 
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <span>🔗</span>
      <span>Blockchain Research Results</span>
    </div>
    
    <div style={{ marginBottom: '1.25rem', fontSize: '0.9375rem' }}>
      <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
        Query: <span style={{ color: '#fff', fontWeight: '600' }}>{query}</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.7)' }}>
        Found <span style={{ color: '#10b981', fontWeight: '700' }}>{results.length}</span> transactions in {executionTime}ms
      </div>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {results.map((tx, i) => (
        <div key={i} style={{
          padding: '1.25rem',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        >
          <div style={{ 
            color: '#fff', 
            fontWeight: '600', 
            marginBottom: '0.75rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            #{i + 1}. {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700' }}>
                💰 ${tx.profit}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                {tx.profitPercent}% profit
              </div>
            </div>
            
            <div>
              <div style={{ color: '#fff', fontSize: '0.875rem' }}>
                🔄 {tx.tokens}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                {tx.dexes?.join(' → ')}
              </div>
            </div>
          </div>
          
          <a
            href={tx.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            🔗 View on Arbiscan
            <span>→</span>
          </a>
        </div>
      ))}
    </div>
  </div>
);

// Live Thinking Indicator Component
const LiveThinkingIndicator = ({ selectedAgent, liveGotSteps, liveCoaOpinions, executingSteps, showReasoningPanel }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    {/* Thinking Animation */}
    <div style={{
      maxWidth: '70%',
      padding: '1rem 1.25rem',
      background: 'rgba(31, 41, 55, 0.6)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '16px 16px 16px 4px',
      color: '#fff',
      backdropFilter: 'blur(10px)',
      marginBottom: '1rem'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '600', marginBottom: '0.5rem' }}>
        🤖 {selectedAgent?.name}
      </div>
      <div style={{ fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="thinking-pulse" style={{ 
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#8b5cf6',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}></span>
        Thinking...
      </div>
    </div>
    
    {/* Live GOT Steps */}
    {showReasoningPanel && liveGotSteps.length > 0 && (
      <div style={{
        maxWidth: '70%',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '0.75rem' }}>
          🌳 Graph-of-Thought Analysis (LIVE)
        </div>
        {liveGotSteps.map((step, i) => (
          <div key={i} style={{
            color: step.status === 'complete' ? '#10b981' : '#fbbf24',
            marginBottom: '0.5rem',
            paddingLeft: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {step.status === 'processing' && <span className="spinner">⏳</span>}
            {step.status === 'complete' && <span>✅</span>}
            <span>{step.action}</span>
          </div>
        ))}
      </div>
    )}
    
    {/* Live COA Opinions */}
    {showReasoningPanel && liveCoaOpinions.length > 0 && (
      <div style={{
        maxWidth: '70%',
        padding: '1rem',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid #10b981',
        borderRadius: '12px',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.75rem' }}>
          🤝 Chain-of-Agents Consultation (LIVE)
        </div>
        {liveCoaOpinions.map((opinion, i) => (
          <div key={i} style={{
            color: '#d1d5db',
            marginBottom: '0.5rem',
            paddingLeft: '1rem'
          }}>
            • {opinion.agentName}: <span style={{ 
              color: opinion.recommendation === 'PROCEED' ? '#10b981' : '#f59e0b',
              fontWeight: '600'
            }}>
              {opinion.recommendation}
            </span> ({(opinion.confidence * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    )}
    
    {/* Executing Research Steps */}
    {executingSteps.length > 0 && (
      <div style={{
        maxWidth: '70%',
        padding: '1rem',
        background: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid #8b5cf6',
        borderRadius: '12px',
        fontSize: '0.875rem'
      }}>
        <div style={{ color: '#8b5cf6', fontWeight: '600', marginBottom: '0.75rem' }}>
          🔬 Executing Research Plan
        </div>
        {executingSteps.map((step, i) => (
          <div key={i} style={{
            color: step.status === 'complete' ? '#10b981' : '#fbbf24',
            marginBottom: '0.5rem',
            paddingLeft: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {step.status === 'running' && <span className="spinner">⏳</span>}
            {step.status === 'complete' && <span>✅</span>}
            <span>{step.stepNumber}. {step.action}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SuperiorAgentChatInterface;


