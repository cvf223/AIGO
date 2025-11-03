/**
 * 📬 MAILBOX PAGE - Human-in-the-Loop Message Center
 * ==================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Escalation management with
 * priority sorting, quick actions, and response tracking
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import MailboxMessage from '../components/humanloop/MailboxMessage';

const MailboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all'); // all, critical, high, medium, low
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/humanloop/mailbox');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setIsLoading(false);
    }
  };

  const handleRespond = async (escalationId, response, action) => {
    try {
      const result = await fetch('http://localhost:3001/api/humanloop/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId, response, action })
      });

      const data = await result.json();
      
      if (data.success) {
        // Remove from list
        setMessages(messages.filter(msg => msg.id !== escalationId));
      }
    } catch (error) {
      console.error('Failed to respond:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesPriority = filter === 'all' || msg.priority === filter;
    const matchesCategory = category === 'all' || msg.category === category;
    return matchesPriority && matchesCategory;
  });

  const getPriorityCount = (priority) => {
    return messages.filter(msg => msg.priority === priority).length;
  };

  return (
    <div className="mailbox-page space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-architectural text-compliance-green mb-2">
            📬 HUMAN-IN-THE-LOOP MAILBOX
          </h1>
          <p className="text-steel-300 font-body">
            Escalations and requests requiring human review
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-error-red rounded border-2 border-error-red">
            <span className="font-mono font-bold">{getPriorityCount('critical')} CRITICAL</span>
          </div>
          <div className="px-4 py-2 bg-safety-yellow text-blueprint-dark rounded border-2 border-safety-yellow">
            <span className="font-mono font-bold">{getPriorityCount('high')} HIGH</span>
          </div>
          <div className="px-4 py-2 bg-blueprint-light rounded border-2 border-blueprint-light">
            <span className="font-mono font-bold">{messages.length} TOTAL</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BlueprintPanel>
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-mono text-steel-300 uppercase mb-2 block">
              Priority Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono"
            >
              <option value="all">All Priorities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟡 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-mono text-steel-300 uppercase mb-2 block">
              Category Filter:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono"
            >
              <option value="all">All Categories</option>
              <option value="plan_approval">📋 Plan Approvals</option>
              <option value="error_escalation">⚠️ Error Escalations</option>
              <option value="agent_request">🤖 Agent Requests</option>
              <option value="system_alert">🚨 System Alerts</option>
              <option value="compliance_issue">✅ Compliance Issues</option>
            </select>
          </div>

          <div className="flex-1" />

          <button
            onClick={fetchMessages}
            className="btn-industrial"
          >
            🔄 REFRESH
          </button>
        </div>
      </BlueprintPanel>

      {/* Messages List */}
      <div className="space-y-4">
        {isLoading ? (
          <BlueprintPanel>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-spin-slow">⚙️</div>
                <div className="font-industrial text-xl">Loading Messages...</div>
              </div>
            </div>
          </BlueprintPanel>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <MailboxMessage
              key={message.id}
              message={message}
              onRespond={handleRespond}
            />
          ))
        ) : (
          <BlueprintPanel variant="glass">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <div className="font-industrial text-2xl text-compliance-green">ALL CLEAR!</div>
              <div className="font-body text-steel-300 mt-2">
                No escalations requiring attention
              </div>
            </div>
          </BlueprintPanel>
        )}
      </div>
    </div>
  );
};

export default MailboxPage;

