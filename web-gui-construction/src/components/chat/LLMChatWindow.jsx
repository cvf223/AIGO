/**
 * 💬 LLM CHAT WINDOW - Main Chat Interface
 * ========================================
 * 
 * Real-time chat with markdown rendering, file attachments,
 * and streaming response support
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import BlueprintPanel from '../shared/BlueprintPanel';

const LLMChatWindow = ({ target, chatHistory, onSendMessage, reasoningConfig, isProcessing }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [localProcessing, setLocalProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    setLocalProcessing(true);
    await onSendMessage(inputMessage);
    setInputMessage('');
    setLocalProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <BlueprintPanel title="💬 CHAT WINDOW" icon={target.type === 'agent' ? '🤖' : target.type === 'ollama' ? '🧠' : '🏗️'}>
      {/* Chat Messages Container */}
      <div className="chat-messages-container h-96 overflow-y-auto mb-4 p-4 bg-steel-700 bg-opacity-20 rounded border border-steel-500">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-steel-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <div className="font-body">Start a conversation with {target.name}</div>
              <div className="text-sm font-mono mt-2">Type your message below</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`
                chat-message
                ${msg.from === 'user' ? 'chat-message-user ml-auto' : 'chat-message-agent'}
              `}>
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-steel-300">
                    {msg.from === 'user' ? '👤 You' : `🤖 ${msg.from}`}
                  </span>
                  <span className="text-xs font-mono text-steel-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Message Content */}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.message}
                  </ReactMarkdown>
                </div>

                {/* Reasoning Info (if available) */}
                {msg.reasoning && (
                  <div className="mt-2 pt-2 border-t border-steel-500 text-xs font-mono text-steel-400">
                    <div>Methods: {[
                      msg.reasoning.enableCoT && 'CoT',
                      msg.reasoning.enableCoA && 'CoA',
                      msg.reasoning.enableToT && 'ToT'
                    ].filter(Boolean).join(', ')}</div>
                    {msg.tokensUsed && (
                      <div>Tokens: {msg.tokensUsed}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="flex items-end space-x-3">
          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
              className="w-full px-4 py-3 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-body text-white resize-none"
              rows={3}
              disabled={isProcessing}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isProcessing}
            className={`
              btn-industrial px-6 py-3 h-auto
              ${(!inputMessage.trim() || isProcessing) && 'opacity-50 cursor-not-allowed'}
            `}
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin">⚙️</span>
                <span>PROCESSING...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>📤</span>
                <span>SEND</span>
              </span>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center space-x-2">
          <button className="px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono border border-steel-500 transition-colors">
            📎 Attach Plan
          </button>
          <button className="px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono border border-steel-500 transition-colors">
            🎤 Voice Input
          </button>
          <button className="px-3 py-1 bg-steel-700 hover:bg-steel-600 rounded text-xs font-mono border border-steel-500 transition-colors">
            📋 Use Template
          </button>
        </div>
      </div>
    </BlueprintPanel>
  );
};

export default LLMChatWindow;

