# 🏗️ Construction Syndicate Web GUI

## Elite Construction AI Interface - TOP 1% Expert Implementation

### Overview

State-of-the-art web interface for the Construction Syndicate featuring:
- **LLM Chat Interface** with reasoning control (CoT, CoA, ToT, GoT)
- **Comprehensive System Monitoring** for all 60+ systems with adaptive detail levels
- **Human-in-the-Loop** mailbox, notifications, and plan review
- **Construction-themed design** with blueprint aesthetics and industrial styling

### Architecture

**Frontend:**
- Next.js 14 with React 18
- JavaScript (ESM) - No TypeScript
- TailwindCSS with custom construction theme
- Socket.IO client for real-time updates
- Recharts for performance graphs
- React Markdown for chat rendering

**Backend:**
- Express.js server with Socket.IO
- PostgreSQL integration via UnifiedDatabaseConfig
- REST API + WebSocket for hybrid communication
- Real-time system monitoring with 2-second updates

### Setup & Installation

```bash
# Install dependencies
cd web-gui-construction
pnpm install

# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

### Ports

- **Frontend (Next.js):** http://localhost:3002
- **Backend API:** http://localhost:3001
- **WebSocket:** ws://localhost:3001

### Features

#### 1. LLM Chat Interface (`/chat`)

Chat with:
- **Individual Agents:** Head Architect, Quantity Surveyor, Error Auditor
- **LLM Services:** 7 Ollama models (primary, precision, reasoning, fast, vision, mathematical, german)
- **Master Coordinator:** Central Nervous System

**Reasoning Controls:**
- Detail level slider (1-10)
- Reasoning methods: CoT, CoA, ToT, GoT
- Advanced features: Deep Research, Creativity, Concept Tuning, Formal Verification
- Planning settings: Depth, confidence threshold, auto-present
- Temperature control (0-1)
- Max tokens selection

**Plan Editing:**
- Side-by-side editing
- Reconsideration triggers
- Approval workflow
- Version comparison

#### 2. System Monitoring (`/systems`)

Monitor all 60+ systems from `startfullsyndicate.js` and `UltimateArbitrageSyndicateFactory.js`:

**Categories:**
- Core Orchestration (4 systems)
- LLM Services (2 systems)
- Memory Systems (6 systems)
- Learning Systems (11 systems)
- Quantum Engines (5 systems)
- Formal Reasoning & Verification (3 systems)
- Proactive Prevention (5 systems)
- Construction Services (8 systems)
- Enhancement Systems (2 systems)

**Adaptive Detail Levels:**
- **Summary:** Status + 4-6 key metrics (lightweight, fast)
- **Detailed:** Full metrics + config + performance graphs + event log + connections
- **Deep State:** Complete internal state + database queries + debug info

#### 3. Human-in-the-Loop (`/mailbox`, `/notifications`, `/plans`)

**Mailbox:**
- Priority-sorted escalations (Critical, High, Medium, Low)
- Categories: Plan Approvals, Error Escalations, Agent Requests, System Alerts, Compliance Issues
- Quick actions: Approve, Reject, Defer, Respond
- Response templates

**Notifications:**
- Real-time toast notifications
- Filterable feed by type
- Mark as read/unread
- Categories: Plan Analysis, Errors, Compliance, Escalations, Learning Milestones

**Plan Review:**
- Interactive plan editor
- HOAI LP 6 & LP 7 phase breakdown
- Reconsideration triggers
- Approval workflow

#### 4. Construction Projects (`/projects`)

- HOAI LP 6 & 7 pipeline visualization
- Plan processing status (processing, completed, errors)
- Active project tracking
- Compliance rate monitoring

### Design System

**Construction Theme:**
- Blueprint dark background (#0A2647)
- Blueprint grid overlay
- Steel frame borders (#6B7280)
- Construction orange accents (#FF6B35)
- Compliance green highlights (#00D9FF)

**Typography:**
- Industrial: Roboto Condensed
- Body: Inter
- Mono: JetBrains Mono
- Architectural: Bebas Neue

**Components:**
- Blueprint panels with steel frames
- Metric gauges with circular progress
- Construction-themed progress bars
- Industrial buttons with clip-path styling

### API Endpoints

**System Monitoring:**
```
GET  /api/systems                    - List all 60+ systems
GET  /api/systems/:id/status         - System health
GET  /api/systems/:id/state          - Adaptive state (query: detailLevel=summary|detailed|deep)
GET  /api/systems/:id/metrics        - Performance metrics
GET  /api/systems/:id/logs           - System logs
```

**LLM Chat:**
```
POST /api/chat/send                  - Send message
GET  /api/chat/history/:agentId      - Chat history
POST /api/chat/configure             - Configure reasoning
```

**Human-in-Loop:**
```
GET  /api/humanloop/notifications    - Get notifications
GET  /api/humanloop/mailbox          - Get mailbox messages
POST /api/humanloop/respond          - Respond to escalation
POST /api/humanloop/approve-plan     - Approve/edit/reconsider plan
```

**Construction:**
```
GET  /api/construction/projects      - Active projects
GET  /api/construction/plans/status  - Plan processing status
GET  /api/construction/projects/logs - Construction logs
GET  /api/construction/plans/events  - Plan events
GET  /api/construction/escalations   - Error escalations
```

### WebSocket Events

**Client → Server:**
- `subscribeToSystem` - Subscribe to system updates
- `unsubscribeFromSystem` - Unsubscribe
- `chatMessage` - Send chat message
- `configureLLM` - Update LLM config

**Server → Client:**
- `systemUpdate` - Real-time system metrics
- `chatMessage` - LLM response
- `escalation` - New escalation created
- `planPresentation` - Plan requires review
- `notificationNew` - New notification

### Development

**File Structure:**
```
web-gui-construction/
├── src/
│   ├── components/
│   │   ├── chat/              # Chat components
│   │   ├── monitoring/        # System monitoring
│   │   ├── humanloop/         # Human-in-loop features
│   │   └── shared/            # Shared components
│   ├── pages/                 # Next.js pages
│   ├── styles/                # Global CSS
│   └── services/              # API clients
├── public/                    # Static assets
├── package.json
├── next.config.js
└── tailwind.config.js
```

### Next Steps

1. Start backend server: `node startfullsyndicate.js`
2. Start frontend: `cd web-gui-construction && pnpm dev`
3. Access GUI at http://localhost:3002
4. API available at http://localhost:3001

### Features Roadmap

- [ ] Advanced plan editing with HOAI phase editor
- [ ] D3.js visualizations for system topology
- [ ] Construction workflow visualizer
- [ ] Multi-system comparison view
- [ ] Export functionality (PDF, Excel)
- [ ] Voice input for chat
- [ ] File attachments for plans
- [ ] Desktop notifications
- [ ] Email integration
- [ ] Telegram notifications

---

**Built with TOP 1% Expert Development Standards**
Elite Construction AI Syndicate - v1.0.0

