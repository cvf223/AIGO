/**
 * 🔑 API CONFIGURATION MODULE
 * ==========================
 *
 * Centralized API key management for enhanced research capabilities
 * and inter-agent communication systems.
 */
export const API_CONFIG = {
    // Google Search API for autonomous web scraping
    GOOGLE_SEARCH_API_KEY: 'AIzaSyBj32pKS3455LepEUxD6OFXa8B3fB6VKew',
    GOOGLE_SEARCH_ENGINE_ID: 'your_search_engine_id', // Configure with your custom search engine
    // Whisper API for video transcription
    WHISPER_API_KEY: 'aaLOPRqatYMgP3VUEklK5sC6bJ5WvOZA',
    // Agent Collaboration Settings
    AGENT_COLLABORATION_ENABLED: true,
    INTER_AGENT_COMMUNICATION: true,
    DYNAMIC_WEIGHT_ADAPTATION: true,
    COLLECTIVE_LEARNING: true,
    // Performance Settings
    MAX_CONCURRENT_SEARCHES: 5,
    SEARCH_RATE_LIMIT: 100, // per day
    VIDEO_ANALYSIS_TIMEOUT: 300000, // 5 minutes
    AGENT_RESPONSE_TIMEOUT: 30000 // 30 seconds
};
export function validateAPIConfiguration() {
    const requiredKeys = [
        'GOOGLE_SEARCH_API_KEY',
        'WHISPER_API_KEY'
    ];
    for (const key of requiredKeys) {
        if (!API_CONFIG[key] || API_CONFIG[key] === 'your_api_key_here') {
            console.error(`❌ Missing API configuration: ${key}`);
            return false;
        }
    }
    console.log('✅ API Configuration validated successfully');
    return true;
}
export function getAPIStatus() {
    return {
        googleSearchAPI: API_CONFIG.GOOGLE_SEARCH_API_KEY ? 'CONFIGURED' : 'MISSING',
        whisperAPI: API_CONFIG.WHISPER_API_KEY ? 'CONFIGURED' : 'MISSING',
        agentCollaboration: API_CONFIG.AGENT_COLLABORATION_ENABLED ? 'ENABLED' : 'DISABLED',
        dynamicWeights: API_CONFIG.DYNAMIC_WEIGHT_ADAPTATION ? 'ENABLED' : 'DISABLED'
    };
}
