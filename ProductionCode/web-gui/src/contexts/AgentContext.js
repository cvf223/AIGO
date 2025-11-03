import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AgentContext = createContext();

export const useAgents = () => useContext(AgentContext);

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/agents`);
        setAgents(response.data);
        
        // Set first agent as selected by default if available
        if (response.data.length > 0 && !selectedAgent) {
          setSelectedAgent(response.data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to fetch agents. Please try again later.');
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Function to change selected agent
  const selectAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
    }
  };

  return (
    <AgentContext.Provider 
      value={{ 
        agents, 
        selectedAgent, 
        selectAgent, 
        loading, 
        error 
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export default AgentContext;
