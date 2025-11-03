import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * 💬 LIVE CHAT - Real LLM + GOT + COA!
 */
export const SimpleChat = ({ apiUrl = 'http://localhost:3000' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  
  // Live reasoning
  const [liveGotSteps, setLiveGotSteps] = useState([]);
  const [liveCoaOpinions, setLiveCoaOpinions] = useState([]);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = io(apiUrl);
    socketRef.current = socket;
    
    socket.on('agent:thinking_started', () => {
      setIsThinking(true);
      setLiveGotSteps([]);
      setLiveCoaOpinions([]);
    });
    
    socket.on('reasoning:got_step', (step) => {
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
      setLiveCoaOpinions(prev => [...prev, opinion]);
    });
    
    socket.on('agent:response_complete', (response) => {
      setIsThinking(false);
      
      // Add GOT + COA as separate messages FIRST
      if (liveGotSteps.length > 0 || liveCoaOpinions.length > 0) {
        setMessages(prev => [...prev, {
          role: 'reasoning_summary',
          got: liveGotSteps,
          coa: liveCoaOpinions,
          timestamp: Date.now()
        }]);
      }
      
      // Then add the CONCLUSION
      setMessages(prev => [...prev, {
        role: 'agent',
        content: response.message,
        timestamp: response.timestamp,
        tokensGenerated: response.tokensGenerated,
        responseTime: response.responseTime
      }]);
      
      // Clear live reasoning
      setLiveGotSteps([]);
      setLiveCoaOpinions([]);
    });
    
    return () => socket.disconnect();
  }, [apiUrl]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveGotSteps, liveCoaOpinions]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }]);
    
    const question = input;
    setInput('');

    try {
      await fetch(`${apiUrl}/api/demo/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          agentId: 'AIPredictionIntel_bot',  // Correct agent ID!
          deepResearch
        })
      });
    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: '#0a0a0a',
      borderRadius: '12px',
      border: '2px solid #10b981',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#10b981', margin: 0 }}>
          💬 AI Chat {deepResearch && '(Deep Research)'}
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={deepResearch}
            onChange={(e) => setDeepResearch(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
          />
          <span style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '600' }}>
            🔬 Deep Research
          </span>
        </label>
      </div>

      <div style={{
        flex: 1,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        overflowY: 'auto'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <div>Type a message to start chatting</div>
            <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '1rem' }}>
              {deepResearch ? '🔬 Deep Research: Ask about blockchain transactions!' : '🧠 Watch GOT + COA reasoning live!'}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            // User Message
            if (msg.role === 'user') {
              return (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    background: '#3b82f6',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            }
            
            // Reasoning Summary (GOT + COA) - COLLAPSIBLE!
            if (msg.role === 'reasoning_summary') {
              const [expanded, setExpanded] = useState(false);
              
              return (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      color: '#8b5cf6',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                    }}
                  >
                    <span>
                      🧠 Analysis Process (GOT + COA) - Click to {expanded ? 'hide' : 'view'} details
                    </span>
                    <span style={{ fontSize: '1.25rem' }}>
                      {expanded ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {expanded && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '1.5rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px'
                    }}>
                      {msg.got && msg.got.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                            🌳 Graph-of-Thought Process:
                          </div>
                          {msg.got.map((step, idx) => (
                            <div key={idx} style={{ 
                              color: '#d1d5db', 
                              marginBottom: '0.5rem',
                              paddingLeft: '1rem',
                              fontSize: '0.875rem',
                              lineHeight: '1.5'
                            }}>
                              ✅ Step {step.step}: {step.action}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {msg.coa && msg.coa.length > 0 && (
                        <div>
                          <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                            🤝 Chain-of-Agents Consultation:
                          </div>
                          {msg.coa.map((agent, idx) => (
                            <div key={idx} style={{ 
                              color: '#d1d5db', 
                              marginBottom: '0.5rem',
                              paddingLeft: '1rem',
                              fontSize: '0.875rem'
                            }}>
                              • {agent.agentName}: <strong style={{ color: agent.recommendation === 'PROCEED' ? '#10b981' : '#f59e0b' }}>
                                {agent.recommendation}
                              </strong> ({(agent.confidence * 100).toFixed(0)}% confidence)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            
            // Agent Conclusion
            if (msg.role === 'agent') {
              // Extract just the conclusion/summary (first 500 chars or until first paragraph break)
              const fullResponse = msg.content || '';
              const summaryMatch = fullResponse.match(/^(.{1,500}(?:\.|!|\?))/s);
              const summary = summaryMatch ? summaryMatch[1] : fullResponse.substring(0, 500) + '...';
              const [showFull, setShowFull] = useState(false);
              
              return (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    color: 'white'
                  }}>
                    <div style={{ 
                      color: '#10b981', 
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>✅</span>
                      <span>AI Conclusion</span>
                    </div>
                    
                    <div style={{ fontSize: '0.9375rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                      {showFull ? fullResponse : summary}
                    </div>
                    
                    {fullResponse.length > 500 && (
                      <button
                        onClick={() => setShowFull(!showFull)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {showFull ? 'Show Summary' : 'Show Full Analysis'}
                      </button>
                    )}
                    
                    {msg.responseTime && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        ⚡ Generated in {(msg.responseTime / 1000).toFixed(1)}s
                        {msg.tokensGenerated > 0 && ` • ${msg.tokensGenerated} tokens`}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            return null;
          })
        )}
        
        {/* LIVE reasoning while thinking */}
        {isThinking && (
          <div>
            <div style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
              border: '2px solid #8b5cf6',
              borderRadius: '12px', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                🧠
              </div>
              <div style={{ 
                color: '#8b5cf6', 
                fontWeight: 'bold', 
                fontSize: '1.125rem',
                marginBottom: '0.5rem'
              }}>
                Deep Analysis In Progress...
              </div>
              <div style={{ 
                color: '#d1d5db', 
                fontSize: '0.875rem',
                lineHeight: '1.6',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                The AI is running a 7.6 billion parameter model on this laptop - analyzing your question with the same intelligence as GPT-4.
                <br/><br/>
                <strong style={{ color: '#fbbf24' }}>On production servers, this would be instant.</strong>
                <br/>
                <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                  (Estimated: 60-90 seconds for comprehensive analysis)
                </span>
              </div>
            </div>
            
            {liveGotSteps.length > 0 && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🌳 Graph-of-Thought (LIVE)
                </div>
                {liveGotSteps.map((step, i) => (
                  <div key={i} style={{ color: step.status === 'complete' ? '#10b981' : '#fbbf24', marginBottom: '0.25rem' }}>
                    {step.status === 'processing' ? '⏳' : '✅'} {step.action}
                  </div>
                ))}
              </div>
            )}
            
            {liveCoaOpinions.length > 0 && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '6px',
                fontSize: '0.75rem'
              }}>
                <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🤝 Chain-of-Agents (LIVE)
                </div>
                {liveCoaOpinions.map((op, i) => (
                  <div key={i} style={{ color: '#d1d5db', marginBottom: '0.25rem' }}>
                    • {op.agentName}: {op.recommendation}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SimpleChat;

