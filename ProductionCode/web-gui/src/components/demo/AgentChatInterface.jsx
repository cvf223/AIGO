import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * 💬 AGENT CHAT INTERFACE - WITH LIVE GOT + COA REASONING!
 * =========================================================
 * Shows REAL AI thinking: Graph-of-Thought & Chain-of-Agents LIVE!
 */
export const AgentChatInterface = ({ apiUrl = 'http://localhost:3000' }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // LIVE REASONING STATE
  const [liveGotSteps, setLiveGotSteps] = useState([]);
  const [liveCoaOpinions, setLiveCoaOpinions] = useState([]);
  const [showReasoningPanel, setShowReasoningPanel] = useState(true);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Connect to backend for LIVE reasoning updates
  useEffect(() => {
    const socket = io(apiUrl);
    socketRef.current = socket;
    
    socket.on('agent:thinking_started', (data) => {
      console.log('🤔 Agent started thinking:', data);
      setIsThinking(true);
      setLiveGotSteps([]);
      setLiveCoaOpinions([]);
    });
    
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
    
    socket.on('reasoning:coa_opinion', (opinion) => {
      console.log('🤝 COA opinion:', opinion);
      setLiveCoaOpinions(prev => [...prev, opinion]);
    });
    
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
    
    return () => socket.disconnect();
  }, [apiUrl]);

  useEffect(() => {
    // Load available agents
    fetch(`${apiUrl}/api/demo/agents`)
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        if (data.length > 0) setSelectedAgent(data[0]);
      })
      .catch(err => console.error('Failed to load agents:', err));
  }, [apiUrl]);
  
  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveGotSteps, liveCoaOpinions]);

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
          agentId: selectedAgent.id
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      
      // Response will come via WebSocket with LIVE reasoning!

    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to get response from agent',
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '1rem',
      height: '700px',
      background: '#1a1a1a',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Agent Selector */}
      <div style={{
        background: '#0a0a0a',
        padding: '1rem',
        borderRight: '1px solid #333'
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, fontSize: '1rem', marginBottom: '1rem' }}>
          🤖 Select Agent
        </h3>
        {agents.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: selectedAgent?.id === agent.id ? '#8b5cf6' : '#374151',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: selectedAgent?.id === agent.id ? '2px solid #a78bfa' : '2px solid transparent'
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{agent.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
              {agent.status === 'active' ? '🟢 Active' : '🔴 Offline'}
            </div>
          </div>
        ))}
        
        {/* Reasoning Panel Toggle */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
          <button
            onClick={() => setShowReasoningPanel(!showReasoningPanel)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: showReasoningPanel ? '#8b5cf6' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
          >
            {showReasoningPanel ? '🧠 Hide Reasoning' : '🧠 Show Reasoning'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          padding: '1rem',
          background: '#000',
          borderRadius: '6px'
        }}>
          {messages.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
              <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                Start a conversation with {selectedAgent?.name || 'an agent'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '1rem' }}>
                🌳 Watch Graph-of-Thought & 🤝 Chain-of-Agents reasoning in real-time!
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  background: msg.role === 'user' ? '#1e40af' : '#374151',
                  marginLeft: msg.role === 'user' ? '2rem' : 0,
                  marginRight: msg.role === 'user' ? 0 : '2rem'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    marginBottom: '0.5rem',
                    color: '#fff'
                  }}>
                    {msg.role === 'user' ? '👤 You' : `🤖 ${msg.agentName || 'Agent'}`}
                    <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {msg.responseTime && (
                      <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>
                        ⚡ {msg.responseTime}ms
                      </span>
                    )}
                  </div>
                  <div style={{
                    color: '#fff',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.875rem'
                  }}>
                    {msg.content}
                  </div>
                  {msg.tokensGenerated > 0 && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#8b5cf6',
                      marginTop: '0.5rem'
                    }}>
                      🔢 {msg.tokensGenerated} tokens generated
                    </div>
                  )}
                </div>
                
                {/* Show GOT + COA reasoning if available */}
                {msg.role === 'agent' && showReasoningPanel && msg.reasoning && (
                  <div style={{
                    marginTop: '0.5rem',
                    marginRight: '2rem',
                    padding: '1rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid #8b5cf6',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                      🧠 Reasoning Process
                    </div>
                    
                    {msg.reasoning.got && msg.reasoning.got.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          🌳 Graph-of-Thought:
                        </div>
                        {msg.reasoning.got.map((step, i) => (
                          <div key={i} style={{ color: '#d1d5db', paddingLeft: '1rem', marginBottom: '0.25rem' }}>
                            {step.step}. {step.action} {step.status === 'complete' && '✅'}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {msg.reasoning.coa && msg.reasoning.coa.length > 0 && (
                      <div>
                        <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          🤝 Chain-of-Agents Consultation:
                        </div>
                        {msg.reasoning.coa.map((agent, i) => (
                          <div key={i} style={{ color: '#d1d5db', paddingLeft: '1rem', marginBottom: '0.25rem' }}>
                            • {agent.agentName}: {agent.recommendation} ({(agent.confidence * 100).toFixed(0)}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* LIVE REASONING DISPLAY while thinking */}
          {isThinking && (
            <div>
              <div style={{
                padding: '1rem',
                background: '#374151',
                borderRadius: '6px',
                marginRight: '2rem',
                marginBottom: '1rem',
                color: '#fff'
              }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  🤖 {selectedAgent?.name}
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  🧠 Thinking...
                </div>
              </div>
              
              {/* LIVE GOT Steps */}
              {showReasoningPanel && liveGotSteps.length > 0 && (
                <div style={{
                  padding: '1rem',
                  marginRight: '2rem',
                  marginBottom: '1rem',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    🌳 Graph-of-Thought Analysis (LIVE)
                  </div>
                  {liveGotSteps.map((step, i) => (
                    <div key={i} style={{
                      color: step.status === 'complete' ? '#10b981' : '#fbbf24',
                      marginBottom: '0.25rem',
                      paddingLeft: '1rem'
                    }}>
                      {step.status === 'processing' && '⏳ '}
                      {step.status === 'complete' && '✅ '}
                      {step.action}
                    </div>
                  ))}
                </div>
              )}
              
              {/* LIVE COA Opinions */}
              {showReasoningPanel && liveCoaOpinions.length > 0 && (
                <div style={{
                  padding: '1rem',
                  marginRight: '2rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    🤝 Chain-of-Agents Consultation (LIVE)
                  </div>
                  {liveCoaOpinions.map((opinion, i) => (
                    <div key={i} style={{
                      color: '#d1d5db',
                      marginBottom: '0.25rem',
                      paddingLeft: '1rem'
                    }}>
                      • {opinion.agentName}: {opinion.recommendation} ({(opinion.confidence * 100).toFixed(0)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Ask ${selectedAgent?.name || 'an agent'} a question...`}
            disabled={isThinking}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isThinking}
            style={{
              padding: '0.75rem 1.5rem',
              background: isThinking ? '#6b7280' : '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isThinking ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            {isThinking ? '⏳' : '📤'} Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatInterface;
