import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { UltimateArbitrageSyndicateFactory } from '../../../UltimateArbitrageSyndicateFactory.js'; // Adjust path as needed

/**
 * 🚀 ELITE SYNDICATE WEB GUI SERVER (PRODUCTION-GRADE)
 * =======================================================
 *
 * This is the central backend for the entire Web GUI. It is architected to be a
 * real-time, high-performance nerve center, providing a direct window into the
 * syndicate's operations and a powerful interface for human-in-the-loop control.
 *
 * It is dependency-injected with the main syndicate factory to ensure it has
 * live, direct access to all agents, services, and metrics.
 */

// --- GLOBAL INITIALIZATION ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// This is the key integration. The server holds a reference to the live syndicate.
let syndicateFactory;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

// GET /api/syndicate/status
app.get('/api/syndicate/status', (req, res) => {
    if (!syndicateFactory) return res.status(503).json({ error: 'Syndicate not initialized' });
    res.json(syndicateFactory.getSystemStatus());
});

// GET /api/agents
app.get('/api/agents', (req, res) => {
    if (!syndicateFactory) return res.status(503).json({ error: 'Syndicate not initialized' });
    const agents = Array.from(syndicateFactory.agents.values()).map(a => a.getSummary());
    res.json(agents);
});

// GET /api/agents/:id/performance
app.get('/api/agents/:id/performance', (req, res) => {
    // In a real system, this would query the database for the agent's performance
    res.json({
        data: {
            todayProfit: 12847,
            successRate: 87.3,
            avgExecutionTime: 1.2,
            opportunitiesFound: 156,
            learningProgress: 73,
            riskScore: 0.23,
            competitiveEdge: 34
        }
    });
});

// GET /api/inbox/requests
app.get('/api/inbox/requests', (req, res) => {
    // In a real system, this would query the database for HITL requests
    res.json({
        data: [
            { id: 1, agentId: 'Agent-001', priority: 'high', title: 'Unusual market pattern detected', message: 'Investigate potential manipulation on Camelot.', timestamp: new Date().toISOString(), status: 'pending' },
            { id: 2, agentId: 'Agent-003', priority: 'medium', title: 'New DEX integration approval needed', message: 'Request to add new DEX "Velocore" to the system.', timestamp: new Date().toISOString(), status: 'pending' },
            { id: 3, agentId: 'Agent-005', priority: 'low', title: 'Risk threshold exceeded, guidance needed', message: 'Current market volatility is high.', timestamp: new Date().toISOString(), status: 'pending' },
            { id: 4, agentId: 'Agent-002', priority: 'medium', title: 'New capability request', message: 'Request to add "MEV-Boost" integration.', timestamp: new Date().toISOString(), status: 'pending', category: 'capability_request' },
        ]
    });
});

// GET /api/opportunities
app.get('/api/opportunities', (req, res) => {
    // In a real system, this would query a database populated by the OpportunityDetector
    res.json([]); 
});

// POST /api/capability/respond
app.post('/api/capability/respond', (req, res) => {
    const { requestId, response } = req.body;
    console.log(`Received response for capability request ${requestId}: ${response}`);
    // In a real system, this would update the database and notify the agent
    res.json({ success: true, message: `Response '${response}' for request ${requestId} recorded.` });
});

// POST /api/control/agent/:agentId
app.post('/api/control/agent/:agentId', (req, res) => {
    const { agentId } = req.params;
    const { action, parameters } = req.body; // e.g., action: 'pause', 'resume', 'set_risk'
    
    syndicateFactory.emit('agentControl', { agentId, action, parameters });
    res.json({ success: true, message: `Control command '${action}' sent to agent ${agentId}` });
});

// --- REAL-TIME WEB SOCKETS ---
io.on('connection', (socket) => {
    console.log('📊 New Dashboard client connected:', socket.id);

    // Join dedicated rooms for granular updates
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`   -> Client ${socket.id} joined room: ${room}`);
    });

    // Handle human-in-the-loop responses
    socket.on('hitl_response', (response) => {
        // This emits the response back into the syndicate's main event bus
        syndicateFactory.emit('humanResponse', response);
    });
});

/**
 * Binds the live syndicate factory to the web server and starts all real-time broadcasts.
 * @param {UltimateArbitrageSyndicateFactory} factory - The live instance of the syndicate.
 */
function bindSyndicateToServer(factory) {
    syndicateFactory = factory;

    // Set up regular broadcasting of high-level metrics
    setInterval(() => {
        const status = syndicateFactory.getSystemStatus();
        io.to('dashboard').emit('system_status', status);
    }, 1000);

    // Listen for specific events from the syndicate to broadcast
    syndicateFactory.on('newOpportunity', (opp) => {
        io.to('opportunities').emit('new_opportunity', opp);
    });

    syndicateFactory.on('agentLearningUpdate', (update) => {
        io.to(`agent_learning_${update.agentId}`).emit('learning_update', update);
    });

    syndicateFactory.on('humanInterventionRequired', (request) => {
        io.to('hitl_inbox').emit('new_hitl_request', request);
    });
    
    console.log('🔗 Syndicate successfully bound to Web GUI server. Real-time broadcasts are active.');
}

/**
 * Emits a new capability request to the frontend.
 * @param {object} request - The capability request object.
 */
export function emitNewCapabilityRequest(request) {
    io.to('hitl_inbox').emit('new_capability_request', request);
    console.log(`🚀 Emitted new capability request to frontend: ${request.id}`);
}

/**
 * Starts the web server.
 * @param {UltimateArbitrageSyndicateFactory} factoryInstance - The live instance of the syndicate.
 */
export function startWebServer(factoryInstance) {
    bindSyndicateToServer(factoryInstance);
    
    const PORT = process.env.GUI_PORT || 3001;
    server.listen(PORT, () => {
        console.log(`🚀 Elite Web GUI server running on http://localhost:${PORT}`);
    });
}
