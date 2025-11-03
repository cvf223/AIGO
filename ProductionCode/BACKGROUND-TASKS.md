# 🤖 Agent Background Task System

## Overview

The Agent Background Task System provides a robust framework for our arbitrage agents to perform continuous operations while monitoring blockchain events. This system integrates with Moralis Streams for real-time event monitoring and enables automatic opportunity detection and calculation when significant price impacts occur.

## 🚀 Key Features

- **Real-time Event Processing**: Monitors blockchain events through Moralis Streams
- **Automatic Opportunity Detection**: Identifies arbitrage opportunities from significant swaps
- **Agent-Specific Background Tasks**: Each agent type has specialized tasks
- **Continuous Learning**: Background tasks for performance analysis and improvement
- **Resource Management**: Automatic resource allocation and concurrency control
- **Auto-Saving**: Discoveries are automatically saved to disk

## 📋 System Components

### 1. Core Background Task System (`agent-background-tasks.js`)

The foundation of our background task system, providing:

- Task scheduling and execution
- Priority-based task management
- Performance monitoring
- Event-based communication
- Resource management

### 2. Arbitrage Tasks (`arbitrage-background-tasks.js`)

Specialized tasks for arbitrage operations:

- Price impact monitoring
- Opportunity discovery
- Historical price analysis
- Liquidity monitoring
- Gas price optimization

### 3. Agent-Specific Tasks (`agent-specialized-tasks.js`)

Tasks tailored to specific agent types:

- **Arbitrum Specialist**: Gas monitoring, sequencer analysis, MEV protection
- **Base Chain Specialist**: Fee monitoring, OP Stack optimization, liquidity mapping
- **Polygon Specialist**: MATIC gas analysis, block time analysis, bridge monitoring

### 4. Task Integration (`agent-task-integration.js`)

Connects background tasks with the agent system:

- Event handling
- Agent registration
- Opportunity distribution
- Status reporting

### 5. Moralis Integration (`moralis-task-integration.js`)

Integrates Moralis Streams with our background task system:

- Stream event processing
- Swap detection
- Stream health monitoring
- Event transformation

### 6. Integrated System Runner (`run-integrated-system.js`)

Runs the complete integrated system:

- Initializes Moralis Streams with ngrok for webhook delivery
- Sets up background tasks
- Initializes agents
- Provides status reporting

## 💡 How It Works

### Event Flow

1. **Moralis Streams** detect blockchain events (swaps, transfers, etc.)
2. Events are delivered via webhook to our system
3. `moralis-task-integration.js` processes these events
4. Significant events (>0.5% price impact) trigger opportunity calculation
5. Discovered opportunities are distributed to appropriate agents
6. Agents can act on these opportunities

### Background Task Execution

1. Tasks are registered with the background task manager
2. Each task has a priority level and execution interval
3. The task manager schedules and executes tasks based on priority
4. Task results are communicated through events
5. Agents can respond to task events

### Agent Integration

1. Agents register with the task system
2. Agent-specific tasks are initialized based on agent type
3. Agents receive events about opportunities and significant swaps
4. Agents can trigger specific tasks when needed

## 🛠️ Usage

### Starting the System

```bash
# Start the complete integrated system
npm run integrated-system

# Start just the background tasks
npm run tasks

# Start just the arbitrage tasks
npm run arb-tasks

# Start the Moralis task integration
npm run moralis-tasks

# Run a test of the background task system
npm run test-tasks

# Run a test of the arbitrage background tasks
npm run test-arb

# Run a test of the Moralis task integration
npm run test-moralis-tasks
```

### Adding New Tasks

To add a new task:

```javascript
import { backgroundTaskManager, PRIORITY } from './agent-background-tasks.js';

backgroundTaskManager.registerTask({
    name: 'My New Task',
    description: 'Description of what the task does',
    agentId: 'agent-id', // Optional, for agent-specific tasks
    priority: PRIORITY.MEDIUM,
    interval: 60000, // Run every minute
    handler: async (task) => {
        // Task implementation
        return { status: 'completed', result: 'some result' };
    }
});
```

### Handling Events

To listen for task events:

```javascript
import { taskEvents } from './agent-background-tasks.js';

// Listen for significant swaps
taskEvents.on('significantSwap', (data) => {
    console.log(`Significant swap detected with ${data.priceImpact}% impact`);
});

// Listen for discovered opportunities
taskEvents.on('opportunityDiscovered', (opportunity) => {
    console.log(`Opportunity discovered with $${opportunity.estimatedProfitUsd} profit potential`);
});
```

## 📊 Monitoring

The system provides several ways to monitor its operation:

- Console logs showing task execution and results
- Status reports generated at regular intervals
- Log files containing detailed execution history
- Event listeners for real-time monitoring

## 🚨 Error Handling

The system includes robust error handling:

- Failed tasks are logged but don't crash the system
- Task failures are counted and reported
- The system continues running even if individual tasks fail
- Stream health is monitored and reported

## 🔄 Moralis Streams Integration

Our system integrates with Moralis Streams for real-time blockchain event monitoring:

- **Multiple API Keys**: 4 Moralis API keys for load balancing and increased capacity
- **Webhook Delivery**: Events are delivered via webhook using ngrok
- **Event Processing**: Events are processed and transformed for our system
- **Health Monitoring**: Stream health is continuously monitored

## 🔍 Testing

The system includes comprehensive test scripts:

1. `test-background-tasks.js`: Tests the core background task system
2. `test-arbitrage-background-tasks.js`: Tests arbitrage-specific tasks
3. `moralis-task-integration.js`: Tests Moralis integration

These tests:
- Simulate swap events with various price impacts
- Test task scheduling and execution
- Verify event handling
- Test error handling
- Provide status reporting

## 📈 Future Enhancements

Planned enhancements for the background task system:

1. **Machine Learning Integration**: Incorporate ML models for opportunity prediction
2. **Cross-Chain Monitoring**: Expand to monitor more blockchain networks
3. **Advanced Analytics**: Add more sophisticated analysis of historical data
4. **Dynamic Task Adjustment**: Automatically adjust task intervals based on market conditions
5. **Distributed Task Execution**: Scale task execution across multiple nodes

## 📝 Task Configuration

Tasks can be configured with various parameters:

- **Priority**: LOW, MEDIUM, HIGH, CRITICAL
- **Interval**: How often the task should run (in milliseconds)
- **Agent ID**: Which agent the task belongs to
- **Enabled**: Whether the task is currently enabled
- **Handler**: The function that implements the task

## 🔒 Security Considerations

- API keys are securely managed through the configuration system
- Rate limiting prevents API abuse
- Error handling prevents system crashes
- Data validation ensures integrity

## 🧪 Testing the System

To test the background task system:

1. Run `npm run test-tasks` to execute the core test script
2. Run `npm run test-arb` to test arbitrage-specific tasks
3. Run `npm run test-moralis-tasks` to test Moralis integration

Each test will simulate events, task execution, and opportunity discovery, and provide status reports. 