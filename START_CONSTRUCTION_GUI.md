# 🏗️ START CONSTRUCTION SYNDICATE GUI - QUICK START GUIDE

## 🚀 Three Simple Steps

### Step 1: Install Frontend Dependencies

```bash
cd web-gui-construction
pnpm install
```

**Expected output:**
```
✅ Dependencies installed
✅ Next.js 14 ready
✅ React 18 ready
✅ Socket.IO client ready
```

### Step 2: Start the Backend

```bash
# From project root
node startfullsyndicate.js
```

**Wait for these messages:**
```
✅ Construction GUI Server operational on http://localhost:3001
✅ Frontend accessible at http://localhost:3002
🔌 WebSocket real-time updates: Active
```

**Backend provides:**
- REST API on port 3001
- WebSocket server on port 3001
- Access to all 60+ systems
- LLM chat routing
- Database integration

### Step 3: Start the Frontend

```bash
# In a new terminal
cd web-gui-construction
pnpm dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3002, url: http://localhost:3002
✓ Compiled successfully
```

### Step 4: Access the GUI

Open your browser to: **http://localhost:3002**

---

## 🎯 What You'll See

### Dashboard (Homepage)

```
🏗️ CONSTRUCTION SYNDICATE COMMAND CENTER
═══════════════════════════════════════

📊 LIVE PROJECT METRICS
┌─────────────────────────────────────┐
│  23 Processing    847 Completed     │
│  12 Errors        98.7% Compliance  │
└─────────────────────────────────────┘

💬 LLM CHAT   📊 SYSTEM MONITOR   📬 MAILBOX
[Quick Access Panels]

🔧 FEATURED SYSTEMS
[Grid of system status cards]

📋 RECENT ACTIVITY
[Live activity stream]
```

---

## 🎮 Using the Features

### 💬 LLM Chat (`/chat`)

**1. Select Chat Target:**
- Click on agent, Ollama model, or Coordinator
- See selection confirmed below dropdown

**2. Configure Reasoning:**
- Adjust detail level slider (1-10)
- Check reasoning methods: ☑ CoT ☑ ToT
- Enable advanced features
- Set planning depth and confidence

**3. Send Message:**
- Type in text area
- Press Enter or click SEND
- See response with markdown formatting
- View reasoning info below messages

**Quick Presets:**
- ⚡ Quick Response - Fast, basic answers
- 🧠 Balanced Analysis - Thoughtful reasoning
- 🚀 Maximum Intelligence - All features enabled

### 📊 System Monitoring (`/systems`)

**1. Select System:**
- Search by name or ID
- Filter by category
- Click system card

**2. Choose Detail Level:**
- 📄 SUMMARY - Quick overview
- 📊 DETAILED - Full analysis
- 🔬 DEEP STATE - Complete inspection

**3. View System:**
- See status and metrics
- Watch real-time updates (green pulse = connected)
- Explore configuration
- Check connections
- Review event logs

**60+ Systems Available:**
- Core: centralNervousSystem, syndicateFactory, constructionOrchestrator
- LLM: ollamaService (7 models)
- Memory: sharedMemory, worldModel, contextEngine
- Learning: alphaGnome, quantumEvolution, ultraFastTransformer
- Quantum: quantumSuperpositionEngine, quantumCoherenceEngine
- Prevention: proactiveCredibilityMaster, formalReasoningMaster
- Construction: visionEngine, hoaiCompliance, quantityTakeoff, errorDetection

### 📬 Mailbox (`/mailbox`)

**1. View Escalations:**
- Sorted by priority (Critical → Low)
- Filter by category
- See badge counts in header

**2. Take Action:**
- Click message to expand details
- Use quick actions:
  - ✅ APPROVE - Accept escalation
  - ❌ REJECT - Decline escalation
  - ⏰ DEFER - Postpone decision
  - 💬 RESPOND - Write custom response

**3. Track Resolution:**
- Resolved items removed from list
- Action recorded in database
- Notification sent to system

### 🔔 Notifications (`/notifications`)

**Real-time Alerts:**
- Toast popups for urgent items
- Filterable feed by type
- Badge count in sidebar
- Mark as read/unread

**Categories:**
- 🏗️ Plan Analysis Complete
- ⚠️ Error Detected
- ✅ Compliance Check Passed
- 🎫 Escalation Created
- 🧠 Learning Milestone Reached

### 📋 Plan Review (`/plans`)

**1. View Pending Plans:**
- List of plans requiring review
- Click to select
- See confidence score and agent

**2. Review Plan:**
- HOAI LP 6 sections
- HOAI LP 7 sections
- All details displayed

**3. Take Action:**

**Reconsider:**
- 💰 Focus on Cost Optimization
- 📐 Increase LP 6 Detail
- 🔀 Add Alternatives
- ✏️ Custom prompt

**Approve/Reject:**
- ✅ APPROVE PLAN - Accept as-is
- ❌ REJECT PLAN - Decline
- 📝 EDIT mode - Make changes

### 🏗️ Projects (`/projects`)

**Pipeline Visualization:**
- 7 stages from upload to tender
- Current stage highlighted
- Progress bar showing capacity
- Real-time status updates

**Metrics:**
- Plans processing (0-30)
- Plans completed
- Errors detected
- Success rate %

---

## 🔍 Troubleshooting

### "Cannot connect to backend"

**Check:**
1. Is backend running? `curl http://localhost:3001/health`
2. Did it start successfully? Look for "Construction GUI Server operational"
3. Is port 3001 available? `lsof -i :3001`

**Solution:**
```bash
# Stop any process on 3001
kill -9 $(lsof -t -i:3001)

# Restart backend
node startfullsyndicate.js
```

### "Systems list is empty"

**Check:**
1. Did backend initialize all systems?
2. Was `connectOrchestrator()` called?
3. Query directly: `curl http://localhost:3001/api/systems`

**Solution:**
- Wait for full initialization (may take 30-60 seconds)
- Check console for initialization errors

### "WebSocket disconnected"

**Check:**
1. Backend WebSocket enabled?
2. CORS allows localhost:3002?
3. Browser console errors?

**Solution:**
- Refresh page to reconnect
- Check backend logs for WebSocket errors

### "No data in system view"

**Check:**
1. System initialized successfully?
2. Selected correct detail level?
3. Try "REFRESH DATA" button

**Solution:**
- Switch detail level (Summary → Detailed)
- Check system status is "operational"

---

## 💡 Pro Tips

1. **Start with Summary Level**
   - Faster loading
   - Real-time updates
   - Good for monitoring

2. **Use Detailed for Analysis**
   - When investigating issues
   - Reviewing performance
   - Checking configuration

3. **Deep State for Debugging Only**
   - Heavy operation
   - Complete transparency
   - Use sparingly

4. **Configure Chat Reasoning**
   - Simple questions: Detail=3
   - Analysis: Detail=7, CoT
   - Complex: Detail=10, All methods

5. **Watch Connection Status**
   - Green pulse = Connected
   - Red = Disconnected
   - Check top-right of pages

6. **Use Keyboard Shortcuts**
   - Enter: Send chat message
   - Shift+Enter: New line in chat
   - Escape: Close modals (future)

---

## 📞 Support

### Getting Help

1. Check documentation:
   - README.md - Main docs
   - SETUP_GUIDE.md - Installation
   - ARCHITECTURE.md - Technical details
   - INTEGRATION.md - System integration

2. Check browser console for errors

3. Check backend logs in terminal

4. Review API responses:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/api/systems
   ```

### Common Questions

**Q: Can I access GUI remotely?**
A: Yes, change host to `0.0.0.0` in backend config, update NEXT_PUBLIC_API_URL

**Q: How do I add a new system to monitor?**
A: Systems auto-discovered from orchestrator. No manual addition needed.

**Q: Can I customize the theme?**
A: Yes, edit `tailwind.config.js` color palette

**Q: Does it work with other LLMs?**
A: Currently Ollama only. Others require backend extension.

**Q: Is authentication required?**
A: Not yet - development mode. Future feature.

---

## 🎉 You're Ready!

The Construction Syndicate GUI is now fully operational.

**Access the interface:**
👉 **http://localhost:3002**

**Explore the features:**
- 💬 Chat with agents and LLMs
- 📊 Monitor all 60+ systems
- 📬 Manage escalations
- 📋 Review and approve plans
- 🏗️ Track construction projects

**Enjoy your TOP 1% Expert GUI!** 🏆

---

**Construction Syndicate GUI - Quick Start v1.0.0**

