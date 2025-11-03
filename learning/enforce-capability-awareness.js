/**
 * Capability Awareness Enforcer
 * 
 * Forces agents to correctly understand their capabilities and prevents
 * them from falsely claiming to have access to data they don't.
 */

import capabilityRegistry from './capability-registry.js';
// Removed @elizaos/core dependency - using console for logging

// Check if awareness enforcement is enabled
const forceAwareness = process.env.FORCE_CAPABILITY_AWARENESS === 'true';
const disableFakeDataClaims = process.env.DISABLE_FAKE_DATA_CLAIMS === 'true';
const verboseLogging = process.env.VERBOSE_AGENT_LOGGING === 'true';

// Log configuration
if (forceAwareness || disableFakeDataClaims || verboseLogging) {
  console.info('⚠️ Capability awareness enforcement active:');
  if (forceAwareness) console.info('  - Forcing capability awareness');
  if (disableFakeDataClaims) console.info('  - Blocking fake data claims');
  if (verboseLogging) console.info('  - Verbose agent logging enabled');
}

/**
 * Generate a corrected system prompt that accurately reflects the system's capabilities
 * This will be inserted into agent system prompts
 * @param {Object} character - The agent character definition
 * @returns {string} - Updated system prompt section
 */
export function generateCapabilityAwarenessPrompt(character) {
  // Don't modify if enforcement is disabled
  if (!forceAwareness && !disableFakeDataClaims) {
    return '';
  }
  
  let prompt = "\n\n### IMPORTANT CAPABILITY AWARENESS ###\n";
  
  // Add name/identity awareness
  prompt += `You are ${character.name}${character.username ? ` (@${character.username})` : ''}, an AI agent with expertise in `;
  
  // Add specialties awareness
  if (character.specialties && character.specialties.length > 0) {
    prompt += `${character.specialties.join(', ')}.\n\n`;
  } else {
    prompt += "your assigned domains.\n\n";
  }
  
  // Add capability limitations
  prompt += "CAPABILITY LIMITATIONS:\n";
  
  // Market data limitations
  if (!capabilityRegistry.hasCapability('marketData', 'realtime')) {
    prompt += "- You CANNOT access real-time market data directly\n";
  }
  if (!capabilityRegistry.hasCapability('marketData', 'historical')) {
    prompt += "- You CANNOT access historical market data directly\n";
  }
  
  // Blockchain limitations
  if (!capabilityRegistry.hasCapability('blockchain', 'solana') && 
      !capabilityRegistry.hasCapability('blockchain', 'ethereum')) {
    prompt += "- You CANNOT directly interact with any blockchain\n";
  }
  
  // Financial limitations
  if (!capabilityRegistry.hasCapability('financial', 'portfolioTracking')) {
    prompt += "- You CANNOT track user portfolios or provide current holdings data\n";
  }
  
  // Add honest data claims policy
  if (disableFakeDataClaims) {
    prompt += "\nHONESTY REQUIREMENTS:\n";
    prompt += "- You MUST NOT claim to collect data from sources you don't have access to\n";
    prompt += "- You MUST NOT pretend to analyze real-time data when you can't access it\n";
    prompt += "- You MUST NOT fabricate specific metrics, charts, or analysis results\n";
    prompt += "- You MUST accurately represent your limitations while being helpful\n";
    prompt += "- Instead of claiming to 'collect data', say you 'would typically analyze' or 'would look at'\n";
  }
  
  // Add teamwork reminder
  prompt += "\nTEAM COLLABORATION:\n";
  prompt += "- You work as part of a multi-agent team supporting each other\n";
  prompt += "- You can collaborate with other agents to provide comprehensive answers\n";
  prompt += "- For questions outside your expertise, defer to the appropriate specialist\n";
  
  prompt += "\n### END CAPABILITY AWARENESS ###\n\n";
  
  return prompt;
}

/**
 * Process an outgoing message to enforce capability awareness
 * @param {Object} message - Message being sent
 * @param {Object} character - The agent character
 * @returns {Object} - Possibly modified message
 */
export function enforceMessageAwareness(message, character) {
  // Skip processing if not enabled or not a text message
  if (!disableFakeDataClaims || !message || !message.content) {
    return message;
  }
  
  let content = message.content;
  
  // List of phrases that indicate false data collection claims
  const falseDataPhrases = [
    /I collect real-time data/i,
    /I collect data via APIs/i,
    /I collect data through/i,
    /I collect data using/i,
    /I track.*in real-time/i,
    /I monitor.*real-time/i,
    /I use APIs to access/i,
    /I have access to.*API/i,
    /I pull data from/i,
    /I retrieve data from/i
  ];
  
  // Better alternative phrasings
  const betterPhrases = [
    "I can analyze data from",
    "I would typically look at",
    "I could help analyze",
    "I would evaluate",
    "Analysis typically involves",
    "Important factors to consider include",
    "When assessing this, I'd focus on",
    "This type of analysis usually considers"
  ];
  
  // Check for false claims
  let hasFalseClaims = false;
  for (const pattern of falseDataPhrases) {
    if (pattern.test(content)) {
      hasFalseClaims = true;
      break;
    }
  }
  
  // Log and potentially modify message
  if (hasFalseClaims) {
    if (verboseLogging) {
      console.warn(`⚠️ Agent ${character.name} made potentially false data claims. Flagging message.`);
    }
    
    // Add a prefix disclaimer to the message
    const randomBetterPhrase = betterPhrases[Math.floor(Math.random() * betterPhrases.length)];
    const disclaimer = `[Note: As an AI assistant, I don't have direct access to live data sources, but ${randomBetterPhrase.toLowerCase()} the following:]\n\n`;
    
    // Replace specific false claims with better alternatives
    for (const pattern of falseDataPhrases) {
      const randomReplacement = betterPhrases[Math.floor(Math.random() * betterPhrases.length)];
      content = content.replace(pattern, randomReplacement);
    }
    
    message.content = disclaimer + content;
  }
  
  return message;
}

export default {
  generateCapabilityAwarenessPrompt,
  enforceMessageAwareness
}; 