/**
 * 🧠 AIGO Construction Syndicate - Intelligent Context Loader
 * 
 * Loads optimal agent/skill combinations for specific tasks
 * Ensures context window efficiency while maintaining full functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIGOContextLoader {
  constructor() {
    this.maxContextSize = 100000; // 100KB limit
    this.loadedContent = new Map();
  }
  
  async loadSession(sessionType) {
    const config = await this.getSessionConfig(sessionType);
    
    console.log(`🎯 Loading ${sessionType} session...`);
    console.log(`📊 Estimated size: ${config.estimatedSize}`);
    
    const content = await Promise.all([
      this.loadAgents(config.agents),
      this.loadSkills(config.skills)
    ]);
    
    return this.validateContextSize(content.flat());
  }
  
  async loadAgents(agentList) {
    const agents = [];
    for (const agent of agentList) {
      const content = await this.loadAgent(agent);
      agents.push({ type: 'agent', name: agent, content });
    }
    return agents;
  }
  
  async loadSkills(skillList) {
    const skills = [];
    for (const skill of skillList) {
      const content = await this.loadSkill(skill);
      skills.push({ type: 'skill', name: skill, content });
    }
    return skills;
  }
  
  validateContextSize(content) {
    const totalSize = content.reduce((size, item) => size + item.content.length, 0);
    
    if (totalSize > this.maxContextSize) {
      console.warn(`⚠️  Context size (${Math.round(totalSize/1024)}KB) exceeds limit!`);
      return this.optimizeContext(content);
    }
    
    console.log(`✅ Context loaded successfully (${Math.round(totalSize/1024)}KB)`);
    return content;
  }
  
  async getSessionConfig(sessionType) {
    // Load session configuration  
    const configPath = path.join(__dirname, '../sessions/session-configs.json');
    const configData = await fs.promises.readFile(configPath, 'utf8');
    const configs = JSON.parse(configData);
    return configs[sessionType] || configs.construction; // Default fallback
  }
}

export default AIGOContextLoader;