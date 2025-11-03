/**
 * Agent Interaction Protocol
 * 
 * Manages interactions between multiple agents, including:
 * - Expertise-based discussion triggers
 * - Collaborative fact-checking
 * - Knowledge sharing mechanisms
 * - Interaction logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Removed @elizaos/core dependency - using console for logging

// Import dependency breaker instead of direct imports
import dependencies from './dependency-breaker.js';

// Direct import for chat learning (no circular dependency)
import chatLearning from './chat-learning-utils.js';

import agentInterests from '../data/agent-interests.json' assert { type: 'json' };

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const INTERACTION_LOG_DIR = path.join(__dirname, '../data/interactions');
const FACT_CHECK_THRESHOLD = 0.7; // Minimum confidence to auto-approve facts
const MIN_EXPERTISE_MATCH = 0.4; // Minimum expertise match to trigger involvement

// Ensure log directory exists
if (!fs.existsSync(INTERACTION_LOG_DIR)) {
  fs.mkdirSync(INTERACTION_LOG_DIR, { recursive: true });
}

/**
 * Check if a message should trigger expertise-based discussion
 * @param {Object} message - Message to evaluate
 * @param {Array} agents - Available agents
 * @returns {Array} - Agents that should be involved based on expertise
 */
export async function getRelevantExpertsForMessage(message, agents) {
  try {
    // Skip if no message content or agents
    if (!message?.content || !agents?.length) {
      return [];
    }
    const messageText = typeof message.content === 'string' 
      ? message.content 
      : message.content.text || message.content.message || '';

    // Use agentInterests mapping for specialties
    const agentInterestMap = agentInterests.agents.reduce((acc, agent) => {
      acc[agent.id] = agent;
      return acc;
    }, {});

    // Extract keywords from message
    const keywords = messageText.toLowerCase().split(/\s+/).filter(word => word.length > 4);

    // Find agents with matching expertise
    const matchingAgents = [];
    for (const agent of agents) {
      const interestAgent = agentInterestMap[agent.id];
      if (!interestAgent || !interestAgent.specialties) continue;
      let matchScore = 0;
      let bestMatches = [];
      for (const specialty of interestAgent.specialties) {
        const specialtyLower = specialty.toLowerCase();
        for (const keyword of keywords) {
          if (specialtyLower.includes(keyword) || keyword.includes(specialtyLower)) {
            matchScore += 0.2;
            bestMatches.push(specialty);
          }
        }
        if (messageText.toLowerCase().includes(specialtyLower)) {
          matchScore += 0.3;
          bestMatches.push(specialty);
        }
      }
      // Also check tasks and individual_goals for matches
      if (interestAgent.tasks) {
        for (const task of interestAgent.tasks) {
          const taskLower = task.toLowerCase();
          for (const keyword of keywords) {
            if (taskLower.includes(keyword)) {
              matchScore += 0.1;
            }
          }
        }
      }
      if (interestAgent.individual_goals) {
        for (const goal of interestAgent.individual_goals) {
          const goalLower = goal.toLowerCase();
          for (const keyword of keywords) {
            if (goalLower.includes(keyword)) {
              matchScore += 0.1;
            }
          }
        }
      }
      if (matchScore >= MIN_EXPERTISE_MATCH) {
        matchingAgents.push({
          agentId: agent.id,
          name: agent.name,
          matchScore,
          relevantSpecialties: [...new Set(bestMatches)]
        });
      }
    }
    return matchingAgents.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error(`Error determining relevant experts: ${error.message}`);
    return [];
  }
}

/**
 * Collaborative fact-checking process
 * @param {Object} claim - The claim to be verified
 * @param {Array} agents - Available agents for verification
 * @returns {Object} - Verification result
 */
export async function collaborativeFactCheck(claim, agents) {
  try {
    // Validate input
    if (!claim?.content || !agents?.length) {
      return { verified: false, confidence: 0, reason: 'Invalid input' };
    }
    
    const claimText = typeof claim.content === 'string' 
      ? claim.content 
      : claim.content.text || '';
    
    // Get the relevant experts for this claim
    const relevantExperts = await getRelevantExpertsForMessage(claim, agents);
    
    // Skip if no relevant experts found
    if (relevantExperts.length === 0) {
      return { 
        verified: false, 
        confidence: 0.2, 
        reason: 'No relevant experts available for verification' 
      };
    }
    
    // Log verification request
    const verificationId = `verify-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Create log entry
    const verificationLog = {
      id: verificationId,
      timestamp: Date.now(),
      claim: claimText,
      claimedBy: claim.agentId || claim.userId,
      experts: relevantExperts.map(e => e.agentId),
      verifications: [],
      result: null
    };
    
    // In a real implementation, we would:
    // 1. Send verification requests to each relevant expert
    // 2. Collect their responses/ratings 
    // 3. Combine into a final verification
    
    // For this demo, we'll simulate verification with a confidence score
    // based on the expertise match of available agents
    let overallConfidence = 0;
    
    // Get total expertise match weight
    const totalMatchScore = relevantExperts.reduce((sum, expert) => sum + expert.matchScore, 0);
    
    if (totalMatchScore > 0) {
      // Simulate verification (in a real system, this would involve agent responses)
      const verifySim = relevantExperts.map(expert => {
        // Weight this expert's contribution by their match score
        const weight = expert.matchScore / totalMatchScore;
        // Simulate a verification confidence (could be replaced with actual agent responses)
        const simulatedConfidence = 0.5 + (Math.random() * 0.5);
        
        return {
          agentId: expert.agentId,
          expertise: expert.relevantSpecialties,
          confidence: simulatedConfidence,
          weight
        };
      });
      
      // Calculate weighted average confidence
      overallConfidence = verifySim.reduce((sum, v) => sum + (v.confidence * v.weight), 0);
      
      // Update log with simulated verifications
      verificationLog.verifications = verifySim;
    }
    
    // Determine final verification status
    const isVerified = overallConfidence >= FACT_CHECK_THRESHOLD;
    
    // Complete the verification result
    const result = {
      verified: isVerified,
      confidence: overallConfidence,
      reason: isVerified 
        ? 'Claim verified by expert consensus' 
        : 'Insufficient confidence in claim verification',
      expertCount: relevantExperts.length,
      verificationId
    };
    
    // Log the result
    verificationLog.result = result;
    fs.writeFileSync(
      path.join(INTERACTION_LOG_DIR, `${verificationId}.json`), 
      JSON.stringify(verificationLog, null, 2)
    );
    
    return result;
  } catch (error) {
    console.error(`Error in collaborative fact check: ${error.message}`);
    return { 
      verified: false, 
      confidence: 0, 
      reason: `Error during verification: ${error.message}` 
    };
  }
}

/**
 * Share knowledge between agents
 * @param {string} sourceAgentId - ID of agent sharing knowledge
 * @param {string} targetAgentId - ID of agent receiving knowledge
 * @param {string} topic - Topic of knowledge to share
 * @param {Object} runtime - Agent runtime
 * @returns {Object} - Result of knowledge sharing
 */
export async function shareKnowledge(sourceAgentId, targetAgentId, topic, runtime) {
  try {
    if (!sourceAgentId || !targetAgentId || !topic) {
      return { success: false, reason: 'Invalid input parameters' };
    }
    
    // Get knowledge on topic from source agent
    const knowledgeOnTopic = await chatLearning.getSharedKnowledgeOnTopic(topic, runtime);
    
    if (!knowledgeOnTopic.knowledge.length) {
      return { 
        success: false, 
        reason: `No knowledge found on topic: ${topic}`
      };
    }
    
    // Create a log of this knowledge sharing
    const sharingId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sharingLog = {
      id: sharingId,
      timestamp: Date.now(),
      sourceAgentId,
      targetAgentId,
      topic,
      knowledgeCount: knowledgeOnTopic.knowledge.length,
      knowledgeIds: knowledgeOnTopic.knowledge.map(k => k.id)
    };
    
    // Save log
    fs.writeFileSync(
      path.join(INTERACTION_LOG_DIR, `${sharingId}.json`), 
      JSON.stringify(sharingLog, null, 2)
    );
    
    // In a real implementation, we would directly share the knowledge
    // with the target agent through their runtime
    
    return {
      success: true,
      sharedItems: knowledgeOnTopic.knowledge.length,
      topic,
      sharingId
    };
  } catch (error) {
    console.error(`Error sharing knowledge: ${error.message}`);
    return { success: false, reason: `Error: ${error.message}` };
  }
}

/**
 * Log an interaction between agents
 * @param {Object} interaction - The interaction details
 * @returns {string} - ID of the logged interaction
 */
export async function logInteraction(interaction) {
  try {
    if (!interaction) {
      return null;
    }
    
    // Generate ID if not provided
    const interactionId = interaction.id || 
      `interaction-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Create standardized log structure
    const logEntry = {
      id: interactionId,
      timestamp: interaction.timestamp || Date.now(),
      type: interaction.type || 'general',
      participants: interaction.participants || [],
      content: interaction.content,
      metadata: interaction.metadata || {}
    };
    
    // Save to log file
    fs.writeFileSync(
      path.join(INTERACTION_LOG_DIR, `${interactionId}.json`), 
      JSON.stringify(logEntry, null, 2)
    );
    
    return interactionId;
  } catch (error) {
    console.error(`Error logging interaction: ${error.message}`);
    return null;
  }
}

/**
 * Determine if a message should trigger agent response based on specialties
 * @param {Object} message - The message to evaluate
 * @param {Object} agent - Agent configuration with specialties
 * @returns {Object} - Trigger result with reason
 */
export function shouldAgentRespond(message, agent) {
  try {
    if (!message?.content || !agent?.specialties) {
      return { shouldRespond: false, reason: 'Invalid input' };
    }
    
    const messageText = typeof message.content === 'string' 
      ? message.content 
      : message.content.text || message.content.message || '';
    
    // Skip empty messages
    if (!messageText.trim()) {
      return { shouldRespond: false, reason: 'Empty message' };
    }
    
    // If message directly mentions the agent, always respond
    if (agent.username && messageText.includes(`@${agent.username}`)) {
      return { shouldRespond: true, reason: 'Direct mention', confidence: 1.0 };
    }
    
    // Check specialties against message
    let highestMatchScore = 0;
    let bestSpecialty = '';
    
    for (const specialty of agent.specialties) {
      const specialtyLower = specialty.toLowerCase();
      const messageLower = messageText.toLowerCase();
      
      // Direct match
      if (messageLower.includes(specialtyLower)) {
        const matchScore = 0.8;
        if (matchScore > highestMatchScore) {
          highestMatchScore = matchScore;
          bestSpecialty = specialty;
        }
      }
      
      // Word-level matches
      const specialtyWords = specialtyLower.split(/\s+/);
      for (const word of specialtyWords) {
        if (word.length > 3 && messageLower.includes(word)) {
          const matchScore = 0.4;
          if (matchScore > highestMatchScore) {
            highestMatchScore = matchScore;
            bestSpecialty = specialty;
          }
        }
      }
    }
    
    // Also check interest keywords
    if (agent.interestKeywords && Array.isArray(agent.interestKeywords)) {
      for (const interest of agent.interestKeywords) {
        if (messageText.toLowerCase().includes(interest.toLowerCase())) {
          const matchScore = 0.6;
          if (matchScore > highestMatchScore) {
            highestMatchScore = matchScore;
            bestSpecialty = interest;
          }
        }
      }
    }
    
    // Decide based on match score
    if (highestMatchScore >= MIN_EXPERTISE_MATCH) {
      return { 
        shouldRespond: true, 
        reason: `Relevant to specialty: ${bestSpecialty}`, 
        confidence: highestMatchScore 
      };
    }
    
    return { 
      shouldRespond: false, 
      reason: 'No relevant specialty match', 
      confidence: highestMatchScore 
    };
  } catch (error) {
    console.error(`Error determining if agent should respond: ${error.message}`);
    return { shouldRespond: false, reason: `Error: ${error.message}` };
  }
}

// Create the interaction protocol object
const interactionProtocol = {
  getRelevantExpertsForMessage,
  collaborativeFactCheck,
  shareKnowledge,
  logInteraction,
  shouldAgentRespond
};

// Register this system in the dependency registry
dependencies.registerSystem('agent-interaction-protocol', interactionProtocol);

// Export all functions
export default interactionProtocol; 