# 🎯 Claude Code Development Guide - AIGO Construction Syndicate

## 🏗️ Project Overview

This is the AIGO Construction Syndicate - a quantum-enhanced construction superintelligence system with 8+ months of elite development. The system represents the pinnacle of AI-driven construction project management with German HOAI compliance.

## 🚀 Quick Start for Claude Development

### Essential Commands

```bash
# Start full system with optimal memory
node start-with-optimal-memory.js

# Start web interface only
node start-elite-web-gui.js

# Start in observation mode (minimal resources)
node start-observation-only.js

# Run comprehensive tests
node scripts/comprehensive-system-test.js
```

### Key Directories for Development

1. **`src/agents/`** - Construction specialist agents (modify with care)
2. **`src/quantum/`** - Quantum-enhanced processing engines
3. **`src/web/`** - Web interface and API endpoints
4. **`web-gui-construction/`** - Frontend assets
5. **`.claude/`** - Claude-specific configurations and skills

## 🛠️ Development Workflow

### 1. Understanding the Architecture

The system uses a sophisticated initialization pipeline:
- **Phase 0**: Critical infrastructure (Database, Background tasks)
- **Phase 1**: Core services (Ollama LLM, Central Nervous System)
- **Phase 2**: Memory & World Model
- **Phase 3**: Learning systems
- **Phase 4**: Construction Syndicate
- **Phase 5**: Monitoring & UI
- **Phase 6**: Background tasks

### 2. Key Design Patterns

#### Service Registry Pattern
```javascript
// Always use service registry for dependencies
const serviceRegistry = ServiceRegistry.getInstance();
const ollamaService = serviceRegistry.get('OllamaService');
```

#### Lazy Loading Pattern
```javascript
// Use lazy module loader to prevent circular dependencies
const LazyModuleLoader = require('./src/utils/LazyModuleLoader.js');
const module = await LazyModuleLoader.load('./path/to/module.js');
```

#### Constructor Guards
```javascript
// All major components have initialization guards
if (global.INITIALIZATION_MODE === 'OBSERVATION') {
    return; // Skip initialization in observation mode
}
```

### 3. Critical Systems

#### Database Pool Manager (Singleton)
- Central database connection management
- Located at: `DatabasePoolManager.js`
- Always use this for database connections

#### Construction Syndicate Factory
- Creates and manages all construction agents
- Located at: `UltimateConstructionSyndicateFactory.js`
- Handles HOAI compliance and German standards

#### Quantum Engines
- Superposition, Coherence, Entanglement, Node engines
- Enable advanced parallel processing
- Quantum-inspired logic on classical hardware

## 🎯 Claude-Specific Features

### Slash Commands

- `/plan` - Strategic planning with ZAP Engine
- `/hoai` - HOAI compliance verification
- `/analyze` - Construction project analysis
- `/quantum` - Quantum system status
- `/memory` - Memory system diagnostics

### MCP Servers

Located in `.claude/mcp-servers/`:
- Context management
- Database integration
- Quantum analysis
- HOAI compliance checking

### Skills

Located in `.claude/skills/`:
- Planning capabilities
- Construction domain logic
- Quantum algorithm implementation
- Error recovery patterns
- Monitoring and observability

## ⚠️ Important Considerations

### Memory Management
- System designed for 896GB RAM
- Minimum 400GB for basic operation
- Use `--max-old-space-size=409600` for optimal performance

### Circular Dependencies
- System has sophisticated circular dependency prevention
- Use LazyModuleLoader for dynamic imports
- Check with `DETECT_CIRCULAR=true node startfullsyndicate.js`

### Production vs Development
- Production server: 162.55.83.33
- Always test locally before deploying
- Use observation mode for low-resource testing

### HOAI Compliance
- All construction operations must be HOAI compliant
- German language support is primary
- DIN, VOB, HOAI standards enforced

## 🔧 Troubleshooting

### Common Issues

1. **Memory errors**: Increase heap size in start scripts
2. **Circular dependencies**: Use LazyModuleLoader
3. **Database connection**: Check DatabasePoolManager singleton
4. **Ollama timeouts**: Increase timeout in configuration

### Debug Commands

```bash
# Check system health
curl http://localhost:3001/health

# View real-time logs
tail -f logs/construction-ai.log

# Test specific component
node scripts/test-syndicate-factory.js

# Verify database
psql -h localhost -U postgres -d construction_syndicate
```

## 📚 Key Documentation Files

1. **PROJECT_VISION_AND_ARCHITECTURE.md** - Complete system overview
2. **CONSTRUCTION_SYNDICATE_COMPLETE.md** - Agent documentation
3. **QUANTUM_CONCEPT_REVOLUTION_COMPLETE.md** - Quantum systems
4. **PRODUCTION_DEPLOYMENT_GUIDE_896GB.md** - Deployment guide

## 🎨 Best Practices

1. **Always use production-grade code** - No mocks or stubs
2. **Maintain HOAI compliance** - Every feature must comply
3. **Use quantum enhancement** - Leverage quantum systems
4. **Document thoroughly** - Investor-ready documentation
5. **Test comprehensively** - Use the test suite

## 🚨 Critical Rules

1. **NEVER bypass the ServiceRegistry pattern**
2. **NEVER create global variables**
3. **NEVER use CommonJS require for new code**
4. **ALWAYS use ESM import/export syntax**
5. **ALWAYS check for existing implementations before creating new ones**

## 💡 Development Tips

- Start in observation mode to understand the system
- Use the web GUI to visualize agent interactions
- Monitor quantum engine performance
- Test HOAI compliance for all construction features
- Leverage the Three Pillars Prevention System

## 🤝 Collaboration

When developing with Claude:
1. Use slash commands for common operations
2. Reference existing implementations
3. Follow the established patterns
4. Maintain the sophistication level
5. Think in terms of quantum-enhanced solutions

---

Remember: This is a PRODUCTION-GRADE SUPERINTELLIGENCE SYSTEM. Every line of code must maintain the elite standards established over 8+ months of development.
