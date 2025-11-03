# Elite Construction AI Syndicate API

Version: 1.0.0

🏗️ **Elite Construction AI Syndicate - Production API Documentation**

This API provides comprehensive endpoints for:
- Multi-agent AI orchestration
- Construction plan analysis with VLM
- Real-time WebSocket communication
- LLM chat interfaces
- Authentication and authorization
- System monitoring and metrics

**Key Features:**
- JWT-based authentication
- WebSocket support for real-time updates
- VLM (Visual Language Model) plan annotation
- Multi-target chat routing (agents, LLMs, coordinators)
- HOAI LP 6/7 compliance checking
- DIN 276 standard verification


## Servers

- **Production server**: https://api.construction-syndicate.ai
- **Staging server**: https://staging.construction-syndicate.ai
- **Development server**: http://localhost:3001

## Authentication

This API uses JWT Bearer authentication. Obtain a token via `/api/auth/login`.

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Authentication

#### Register new user

`POST /api/auth/register`

Create a new user account

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Responses:**

- **200**: Registration successful
- **400**: Bad request

---

#### Login user

`POST /api/auth/login`

Authenticate user and receive JWT tokens

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Responses:**

- **200**: Login successful
- **401**: Invalid credentials

---

#### Logout user

`POST /api/auth/logout`

Invalidate user session and tokens

**Responses:**

- **200**: Logout successful

---

#### Refresh access token

`POST /api/auth/refresh`

Use refresh token to get new access token

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Responses:**

- **200**: Token refreshed

---

#### Get current user

`GET /api/auth/me`

Retrieve current authenticated user information

**Responses:**

- **200**: User information

---

### Systems

#### List all systems

`GET /api/systems`

Get list of all agents, services, and coordinators

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| type | query | string | No | Filter by system type |
| status | query | string | No | Filter by status |

**Responses:**

- **200**: List of systems

---

#### Get system status

`GET /api/systems/{systemId}/status`

Get detailed status of a specific system

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| systemId | path | string | Yes | System identifier |

**Responses:**

- **200**: System status

---

#### Get system metrics

`GET /api/systems/{systemId}/metrics`

Get performance metrics for a specific system

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| systemId | path | string | Yes | - |
| period | query | string | No | - |

**Responses:**

- **200**: System metrics

---

### Chat

#### Send chat message

`POST /api/chat/send`

Send message to agent, LLM, or coordinator

**Request Body:**

```json
{
  "target": {
    "type": "agent",
    "id": "centralNervousSystem"
  },
  "message": "Analyze the latest arbitrage opportunities"
}
```

**Responses:**

- **200**: Message sent

---

#### Get chat history

`GET /api/chat/history/{targetId}`

Retrieve chat history with specific target

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| targetId | path | string | Yes | - |
| limit | query | integer | No | - |

**Responses:**

- **200**: Chat history

---

### Construction

#### Upload construction plan

`POST /api/construction/upload-plan`

Upload PDF or image file for analysis

**Request Body:**

**Responses:**

- **200**: Plan uploaded

---

#### Analyze construction plan

`POST /api/construction/analyze-plan`

Start AI analysis of uploaded plan

**Request Body:**

```json
{
  "planId": 1,
  "analysisType": "quick"
}
```

**Responses:**

- **200**: Analysis started

---

#### Get analysis progress

`GET /api/construction/analysis/{analysisId}/progress`

Check progress of plan analysis

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| analysisId | path | string | Yes | - |

**Responses:**

- **200**: Analysis progress

---

#### Get analysis results

`GET /api/construction/analysis/{analysisId}/results`

Retrieve completed analysis results

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| analysisId | path | string | Yes | - |

**Responses:**

- **200**: Analysis results

---

#### Generate annotated plan

`POST /api/construction/annotate-plan`

Create visual annotations on construction plan

**Request Body:**

```json
{
  "analysisId": "123e4567-e89b-12d3-a456-426614174000",
  "planId": 1
}
```

**Responses:**

- **200**: Annotation generated

---

### WebSocket

#### WebSocket connection

`GET /socket.io`

Establish WebSocket connection for real-time updates.

**Connection URL:** `wss://api.construction-syndicate.ai/socket.io/`

**Authentication:** Pass JWT token as query parameter or in handshake auth

**Events:**

**Emitted by Client:**
- `chat:message` - Send chat message
- `subscribeToSystem` - Subscribe to system updates
- `unsubscribeFromSystem` - Unsubscribe from system
- `configureLLM` - Configure LLM settings

**Received by Client:**
- `systemUpdate` - System status updates
- `chat:streaming` - Streaming chat response chunks
- `chat:response` - Final chat response
- `escalation` - Escalation notifications
- `notificationNew` - New notifications
- `planPresentation` - Plan presentation updates


**Responses:**

- **101**: Switching Protocols - WebSocket connection established

---

