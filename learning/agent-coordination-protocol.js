/**
 * Agent Coordination Protocol
 * 
 * Provides structured mechanisms for agents to collaborate, request expertise,
 * and coordinate activities to solve complex problems together.
 */

// Removed @elizaos/core dependency - using console for logging
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMemory, getMemories } from './enhanced-memory-system.js';
import dependencies from './dependency-breaker.js';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Room ID for the mastermind group
const MASTERMIND_ROOM_ID = '00000000-0000-0000-0000-000000000001';

// Track active coordination requests
const activeRequests = new Map();

/**
 * Request expertise from other agents
 * @param {string} requestingAgentId - ID of the agent requesting help
 * @param {string} topic - Topic requiring expertise
 * @param {string} question - Specific question being asked
 * @param {Array<string>} targetAgentIds - IDs of agents being consulted (empty for all)
 * @returns {Promise<Object>} - Request metadata with ID
 */
async function requestExpertise(requestingAgentId, topic, question, targetAgentIds = []) {
  try {
    // Generate a unique request ID
    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create the request object
    const request = {
      id: requestId,
      requestingAgentId,
      topic,
      question,
      targetAgentIds: targetAgentIds.length > 0 ? targetAgentIds : null, // null means all agents
      timestamp: Date.now(),
      status: 'pending',
      responses: [],
      memoryId: null
    };
    
    // Store in active requests
    activeRequests.set(requestId, request);
    
    // Format as a coordination message
    const coordinationMessage = formatCoordinationMessage(requestingAgentId, requestId, topic, question);
    
    // Create memory for this request to notify other agents
    const memory = await createMemory(
      MASTERMIND_ROOM_ID,
      requestingAgentId,
      coordinationMessage,
      {
        type: 'expertise_request',
        requestId,
        topic,
        targetAgentIds: targetAgentIds.length > 0 ? targetAgentIds : null
      }
    );
    
    // Update the request with memory ID
    request.memoryId = memory.id;
    activeRequests.set(requestId, request);
    
    console.info(`Agent ${requestingAgentId} requested expertise on topic: ${topic}`);
    
    return {
      requestId,
      status: 'pending',
      memoryId: memory.id
    };
  } catch (error) {
    console.error(`Error requesting expertise: ${error.message}`);
    throw error;
  }
}

/**
 * Format a coordination message
 * @param {string} agentId - ID of the agent sending the message
 * @param {string} requestId - ID of the request
 * @param {string} topic - Topic of the request
 * @param {string} question - Question being asked
 * @returns {string} - Formatted message
 */
function formatCoordinationMessage(agentId, requestId, topic, question) {
  return `[COORDINATION REQUEST: ${requestId}]
REQUESTING AGENT: ${agentId}
TOPIC: ${topic}
QUESTION: ${question}

Please respond if you have expertise on this topic.
[END COORDINATION REQUEST]`;
}

/**
 * Submit a response to an expertise request
 * @param {string} requestId - ID of the request being responded to
 * @param {string} respondingAgentId - ID of the agent providing the response
 * @param {string} response - The response content
 * @param {number} confidenceScore - How confident the agent is in their response (0-1)
 * @returns {Promise<Object>} - Response metadata
 */
async function submitExpertiseResponse(requestId, respondingAgentId, response, confidenceScore) {
  try {
    // Check if the request exists
    if (!activeRequests.has(requestId)) {
      throw new Error(`Request ${requestId} not found`);
    }
    
    // Get the request
    const request = activeRequests.get(requestId);
    
    // Check if this agent is allowed to respond
    if (request.targetAgentIds && 
        !request.targetAgentIds.includes(respondingAgentId) && 
        respondingAgentId !== request.requestingAgentId) {
      throw new Error(`Agent ${respondingAgentId} is not a target for request ${requestId}`);
    }
    
    // Format as a coordination response
    const coordinationResponse = formatCoordinationResponse(requestId, respondingAgentId, response, confidenceScore);
    
    // Create memory for this response
    const memory = await createMemory(
      MASTERMIND_ROOM_ID,
      respondingAgentId,
      coordinationResponse,
      {
        type: 'expertise_response',
        requestId,
        confidenceScore
      }
    );
    
    // Add response to the request
    const responseObj = {
      agentId: respondingAgentId,
      response,
      confidenceScore,
      timestamp: Date.now(),
      memoryId: memory.id
    };
    
    request.responses.push(responseObj);
    activeRequests.set(requestId, request);
    
    console.info(`Agent ${respondingAgentId} responded to request ${requestId} with confidence ${confidenceScore}`);
    
    return {
      requestId,
      responseId: memory.id,
      status: 'submitted'
    };
  } catch (error) {
    console.error(`Error submitting expertise response: ${error.message}`);
    throw error;
  }
}

/**
 * Format a coordination response
 * @param {string} requestId - ID of the request
 * @param {string} agentId - ID of the responding agent
 * @param {string} response - Response content
 * @param {number} confidenceScore - Confidence score
 * @returns {string} - Formatted response
 */
function formatCoordinationResponse(requestId, agentId, response, confidenceScore) {
  return `[COORDINATION RESPONSE to ${requestId}]
RESPONDING AGENT: ${agentId}
CONFIDENCE: ${confidenceScore}

${response}
[END COORDINATION RESPONSE]`;
}

/**
 * Get responses for a specific expertise request
 * @param {string} requestId - ID of the request
 * @returns {Promise<Object>} - Request with all responses
 */
async function getExpertiseResponses(requestId) {
  try {
    // Check if the request exists
    if (!activeRequests.has(requestId)) {
      throw new Error(`Request ${requestId} not found`);
    }
    
    // Return the request with responses
    return activeRequests.get(requestId);
  } catch (error) {
    console.error(`Error getting expertise responses: ${error.message}`);
    throw error;
  }
}

/**
 * Process incoming messages to detect and handle coordination requests
 * @param {Object} message - Message to process
 * @param {Object} receivingAgent - Agent receiving the message
 * @returns {Promise<Object>} - Processing result
 */
async function processCoordinationMessage(message, receivingAgent) {
  try {
    // Skip if not a string content
    if (!message.content || typeof message.content !== 'string') {
      return { 
        isCoordinationMessage: false 
      };
    }
    
    // Check if this is a coordination request
    const isCoordinationRequest = message.content.includes('[COORDINATION REQUEST:');
    
    if (!isCoordinationRequest) {
      return { 
        isCoordinationMessage: false 
      };
    }
    
    // Extract request ID
    const requestIdMatch = message.content.match(/\[COORDINATION REQUEST: (req-[^\]]+)\]/);
    if (!requestIdMatch) {
      return { 
        isCoordinationMessage: false 
      };
    }
    
    const requestId = requestIdMatch[1];
    
    // Check if this agent should respond based on topic and expertise
    const topicMatch = message.content.match(/TOPIC: ([^\n]+)/);
    const questionMatch = message.content.match(/QUESTION: ([^\n]+)/);
    
    if (!topicMatch || !questionMatch) {
      return { 
        isCoordinationMessage: true,
        shouldRespond: false,
        reason: 'Malformed coordination request' 
      };
    }
    
    const topic = topicMatch[1];
    const question = questionMatch[1];
    const requestingAgentId = message.agentId || (message.content.match(/REQUESTING AGENT: ([^\n]+)/) || [])[1];
    
    // Don't respond to your own requests
    if (requestingAgentId === receivingAgent.id) {
      return { 
        isCoordinationMessage: true,
        shouldRespond: false,
        reason: 'Own request'
      };
    }
    
    // Check if this agent is specifically targeted
    if (message.metadata && message.metadata.targetAgentIds) {
      const isTargeted = message.metadata.targetAgentIds.includes(receivingAgent.id);
      if (!isTargeted) {
        return { 
          isCoordinationMessage: true,
          shouldRespond: false,
          reason: 'Not targeted'
        };
      }
    }
    
    // Check if this agent has expertise on the topic
    const expertiseMatch = checkAgentExpertise(receivingAgent, topic, question);
    
    return {
      isCoordinationMessage: true,
      shouldRespond: expertiseMatch.hasExpertise,
      requestId,
      topic,
      question,
      requestingAgentId,
      confidenceScore: expertiseMatch.confidenceScore,
      reason: expertiseMatch.hasExpertise ? 'Has expertise' : 'No expertise'
    };
  } catch (error) {
    console.error(`Error processing coordination message: ${error.message}`);
    return { 
      isCoordinationMessage: false,
      error: error.message
    };
  }
}

/**
 * Check if an agent has expertise on a topic
 * @param {Object} agent - Agent to check
 * @param {string} topic - Topic to check expertise for
 * @param {string} question - Question being asked
 * @returns {Object} - Result with hasExpertise and confidenceScore
 */
function checkAgentExpertise(agent, topic, question) {
  try {
    // If agent has no specialties, low confidence
    if (!agent.specialties || agent.specialties.length === 0) {
      return {
        hasExpertise: false,
        confidenceScore: 0.1,
        reason: 'No specialties defined'
      };
    }
    
    // Check for topic keywords in agent specialties
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const allWords = [...new Set([...topicWords, ...questionWords])];
    
    // Count matching specialties
    let matchCount = 0;
    const specialties = agent.specialties.map(s => s.toLowerCase());
    
    for (const word of allWords) {
      if (specialties.some(s => s.includes(word) || word.includes(s))) {
        matchCount++;
      }
    }
    
    // Calculate confidence based on matches
    let confidenceScore = matchCount / allWords.length;
    
    // Boost confidence if agent has highly specific matching specialties
    for (const specialty of specialties) {
      if (topic.toLowerCase().includes(specialty) || 
          specialties.some(s => questionWords.includes(s))) {
        confidenceScore = Math.min(confidenceScore + 0.3, 0.9);
        break;
      }
    }
    
    return {
      hasExpertise: confidenceScore > 0.3,
      confidenceScore,
      reason: confidenceScore > 0.3 ? 'Topic matches specialties' : 'Topic does not match specialties'
    };
  } catch (error) {
    console.error(`Error checking agent expertise: ${error.message}`);
    return {
      hasExpertise: false,
      confidenceScore: 0.1,
      reason: `Error: ${error.message}`
    };
  }
}

/**
 * Find the most qualified agent to address a topic
 * @param {string} topic - Topic needing expertise
 * @param {Array<Object>} agents - List of available agents
 * @returns {Object} - Best matching agent with confidence score
 */
function findExpertAgent(topic, agents) {
  try {
    let bestMatch = null;
    let highestScore = 0;
    
    for (const agent of agents) {
      const expertise = checkAgentExpertise(agent, topic, topic);
      
      if (expertise.confidenceScore > highestScore) {
        highestScore = expertise.confidenceScore;
        bestMatch = {
          agentId: agent.id,
          name: agent.name || agent.id,
          confidenceScore: expertise.confidenceScore
        };
      }
    }
    
    return bestMatch || { 
      agentId: null, 
      confidenceScore: 0, 
      message: 'No qualified expert found' 
    };
  } catch (error) {
    console.error(`Error finding expert agent: ${error.message}`);
    return { 
      agentId: null, 
      confidenceScore: 0, 
      error: error.message 
    };
  }
}

/**
 * Auto-generate a response using an expert agent
 * @param {string} requestingAgentId - Agent requesting the expertise
 * @param {string} topic - Topic for expertise
 * @param {string} question - Question being asked
 * @returns {Promise<Object>} - Response from the expert agent
 */
async function getExpertResponse(requestingAgentId, topic, question) {
  try {
    // Get all available agents
    const allAgents = [];
    const runtimeKeys = [...dependencies.getAllSystems().keys()]
      .filter(key => key.startsWith('runtime-'));
    
    // Collect agent info
    for (const runtimeKey of runtimeKeys) {
      const agentId = runtimeKey.replace('runtime-', '');
      const runtime = dependencies.getSystem(runtimeKey);
      
      if (runtime && runtime.character) {
        allAgents.push(runtime.character);
      }
    }
    
    // Find the best expert for this topic
    const expertAgent = findExpertAgent(topic, allAgents);
    
    if (!expertAgent.agentId) {
      return {
        success: false,
        message: 'No qualified expert found'
      };
    }
    
    // Create a formal request
    const requestResult = await requestExpertise(
      requestingAgentId,
      topic,
      question,
      [expertAgent.agentId]
    );
    
    // Wait a moment for the expert to process and respond
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get responses
    const requestWithResponses = await getExpertiseResponses(requestResult.requestId);
    
    if (requestWithResponses.responses.length === 0) {
      return {
        success: false,
        message: 'No response received from expert',
        expertAgentId: expertAgent.agentId
      };
    }
    
    // Return the highest confidence response
    const bestResponse = requestWithResponses.responses.reduce(
      (best, current) => current.confidenceScore > best.confidenceScore ? current : best,
      requestWithResponses.responses[0]
    );
    
    return {
      success: true,
      response: bestResponse.response,
      expertAgentId: bestResponse.agentId,
      confidenceScore: bestResponse.confidenceScore
    };
  } catch (error) {
    console.error(`Error getting expert response: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Agent coordination protocol class for compatibility
export class AgentCoordinationProtocol {
  static requestExpertise = requestExpertise;
  static submitExpertiseResponse = submitExpertiseResponse;
  static getExpertiseResponses = getExpertiseResponses;
  static processCoordinationMessage = processCoordinationMessage;
  static checkAgentExpertise = checkAgentExpertise;
  static findExpertAgent = findExpertAgent;
  static getExpertResponse = getExpertResponse;
}

// Export all functions
export default {
  requestExpertise,
  submitExpertiseResponse,
  getExpertiseResponses,
  processCoordinationMessage,
  checkAgentExpertise,
  findExpertAgent,
  getExpertResponse
};

export {
  requestExpertise,
  submitExpertiseResponse,
  getExpertiseResponses,
  processCoordinationMessage,
  checkAgentExpertise,
  findExpertAgent,
  getExpertResponse
}; 