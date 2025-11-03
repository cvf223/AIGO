/**
 * 💬 AGENT CHAT & HUMAN-IN-THE-LOOP PAGE
 * ======================================
 * 
 * Implements the AGENT COMMUNICATION CENTER from 
 * COMPREHENSIVE_WEB_GUI_ARCHITECTURE.md
 * 
 * Features:
 * - Real-time chat with individual agents
 * - Human-in-the-loop inbox with task management
 * - Request categorization and priority scoring
 * - LLM translation cache status
 * - Collective discussions (A2A)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    MessageCircle,
    Send,
    Paperclip,
    Brain,
    Settings,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    User,
    Bot,
    Archive,
    Download,
    BarChart3
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'human' | 'agent';
    content: string;
    timestamp: string;
    translated?: boolean;
    rawProtocol?: string;
}

interface InboxRequest {
    id: string;
    agentId: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    timestamp: string;
    status: 'pending' | 'in_progress' | 'completed';
    category?: string;
}

const AgentChat: React.FC = () => {
    const { connected, agents, socket } = useSocket();
    const queryClient = useQueryClient();
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [selectedTab, setSelectedTab] = useState<'inbox' | 'chat' | 'collective'>('inbox');
    const [messageInput, setMessageInput] = useState<string>('');
    const [responseInput, setResponseInput] = useState<string>('');
    const [selectedRequest, setSelectedRequest] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Listen for new capability requests
    useEffect(() => {
        const handleNewRequest = (request: InboxRequest) => {
            queryClient.setQueryData(['inboxRequests'], (oldData: InboxRequest[] | undefined) => {
                return oldData ? [...oldData, request] : [request];
            });
        };

        socket.on('new_capability_request', handleNewRequest);

        return () => {
            socket.off('new_capability_request', handleNewRequest);
        };
    }, [socket, queryClient]);

    // Auto-select first agent
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0].id);
        }
    }, [agents, selectedAgent]);

    // Fetch inbox requests
    const { data: inboxRequests } = useQuery({
        queryKey: ['inboxRequests'],
        queryFn: async () => {
            const response = await axios.get('/api/inbox/requests');
            return response.data.data;
        },
        refetchInterval: 5000
    });

    // Fetch chat messages
    const { data: chatMessages } = useQuery({
        queryKey: ['chatMessages', selectedAgent],
        queryFn: async () => {
            if (!selectedAgent) return [];
            const response = await axios.get(`/api/chat/${selectedAgent}/messages`);
            return response.data.data;
        },
        enabled: !!selectedAgent,
        refetchInterval: 2000
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ agentId, message }: { agentId: string; message: string }) => {
            const response = await axios.post(`/api/chat/${agentId}/message`, { message });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedAgent] });
            setMessageInput('');
        }
    });

    // Respond to request mutation
    const respondToRequestMutation = useMutation({
        mutationFn: async ({ requestId, response }: { requestId: string; response: string }) => {
            const responseData = await axios.post('/api/inbox/response', { requestId, response });
            return responseData.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inboxRequests'] });
            setResponseInput('');
            setSelectedRequest('');
        }
    });

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const sendMessage = () => {
        if (!selectedAgent || !messageInput.trim()) return;
        sendMessageMutation.mutate({ agentId: selectedAgent, message: messageInput });
    };

    const respondToRequest = () => {
        if (!selectedRequest || !responseInput.trim()) return;
        respondToRequestMutation.mutate({ requestId: selectedRequest, response: responseInput });
    };

    const urgentRequests = inboxRequests?.filter((req: InboxRequest) => req.priority === 'high').length || 0;
    const pendingRequests = inboxRequests?.filter((req: InboxRequest) => req.priority === 'medium').length || 0;
    const completedRequests = inboxRequests?.filter((req: InboxRequest) => req.status === 'completed').length || 0;

    return (
        <div className="space-y-6 p-6">
            {/* 🏆 HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        💬 AGENT COMMUNICATION CENTER
                    </h1>
                    <p className="text-muted-foreground">
                        Real-time communication with Elite Arbitrage Syndicate agents
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${connected ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">Real-time: {connected ? 'ON' : 'OFF'}</span>
                    </div>
                </div>
            </div>

            {/* 📋 TAB SELECTOR */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <Button 
                    variant={selectedTab === 'inbox' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTab('inbox')}
                >
                    🚨 INBOX ({urgentRequests + pendingRequests})
                </Button>
                <Button 
                    variant={selectedTab === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTab('chat')}
                >
                    💬 DIRECT CHAT
                </Button>
                <Button 
                    variant={selectedTab === 'collective' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTab('collective')}
                >
                    🗣️ COLLECTIVE (A2A)
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 🚨 HUMAN-IN-THE-LOOP INBOX */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span>Human-in-the-Loop Inbox</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* 📊 INBOX STATS */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center p-2 border rounded">
                                <div className="text-lg font-bold text-red-500">{urgentRequests}</div>
                                <div className="text-xs text-muted-foreground">🔴 URGENT</div>
                            </div>
                            <div className="text-center p-2 border rounded">
                                <div className="text-lg font-bold text-yellow-500">{pendingRequests}</div>
                                <div className="text-xs text-muted-foreground">🟡 PENDING</div>
                            </div>
                            <div className="text-center p-2 border rounded">
                                <div className="text-lg font-bold text-green-500">{completedRequests}</div>
                                <div className="text-xs text-muted-foreground">🟢 COMPLETED</div>
                            </div>
                        </div>

                        {/* 📋 REQUESTS LIST */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {inboxRequests?.map((request: InboxRequest) => (
                                <div 
                                    key={request.id} 
                                    className={`p-3 border rounded cursor-pointer transition-colors hover:bg-muted/50 ${
                                        selectedRequest === request.id ? 'bg-muted border-primary' : ''
                                    }`}
                                    onClick={() => setSelectedRequest(request.id)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={
                                            request.priority === 'high' ? 'destructive' :
                                            request.priority === 'medium' ? 'default' : 'secondary'
                                        }>
                                            {request.priority === 'high' ? '🔥' : 
                                             request.priority === 'medium' ? '⚠️' : '📋'} {request.priority.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(request.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="font-medium text-sm">{request.agentId}: "{request.title}"</div>
                                    <div className="text-xs text-muted-foreground mt-1">{request.message}</div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {request.category || 'General'}
                                        </Badge>
                                        {request.status === 'completed' && (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        )}
                                    </div>
                                    {request.category === 'capability_request' && selectedRequest === request.id && (
                                        <div className="flex space-x-2 mt-2">
                                            <Button size="sm" onClick={() => respondToRequestMutation.mutate({ requestId: request.id, response: 'approve' })}>
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => respondToRequestMutation.mutate({ requestId: request.id, response: 'deny' })}>
                                                Deny
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 📝 RESPONSE AREA */}
                        {selectedRequest && !inboxRequests?.find(r => r.id === selectedRequest)?.category === 'capability_request' && (
                            <div className="mt-4 p-3 border rounded bg-muted/30">
                                <h4 className="font-medium mb-2">📝 Respond to Request</h4>
                                <Textarea 
                                    placeholder="Type your response..."
                                    value={responseInput}
                                    onChange={(e) => setResponseInput(e.target.value)}
                                    className="mb-2"
                                />
                                <div className="flex space-x-2">
                                    <Button 
                                        onClick={respondToRequest}
                                        disabled={!responseInput.trim() || respondToRequestMutation.isPending}
                                        size="sm"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Response
                                    </Button>
                                    <Button 
                                        onClick={() => setSelectedRequest('')}
                                        variant="outline" 
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2 mt-4">
                            <Button size="sm" variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button size="sm" variant="outline">
                                <Archive className="w-4 h-4 mr-2" />
                                Manage All
                            </Button>
                            <Button size="sm" variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 💬 DIRECT CHAT */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span>Direct Chat</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="Select Agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent: any) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        agent.status === 'online' ? 'bg-green-500' :
                                                        agent.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} />
                                                    <span>{agent.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Badge variant={connected ? 'default' : 'destructive'}>
                                    {connected ? '⚫ Online' : '🔴 Offline'}
                                </Badge>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* 💬 CHAT MESSAGES */}
                        <div className="border rounded-lg bg-muted/20 h-96 overflow-y-auto p-4 mb-4">
                            {chatMessages?.map((message: Message) => (
                                <div 
                                    key={message.id} 
                                    className={`mb-4 ${message.sender === 'human' ? 'text-right' : 'text-left'}`}
                                >
                                    <div className={`inline-block max-w-[70%] p-3 rounded-lg ${
                                        message.sender === 'human' 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-muted text-foreground'
                                    }`}>
                                        <div className="flex items-center space-x-2 mb-1">
                                            {message.sender === 'human' ? (
                                                <User className="w-3 h-3" />
                                            ) : (
                                                <Bot className="w-3 h-3" />
                                            )}
                                            <span className="text-xs opacity-75">
                                                [{new Date(message.timestamp).toLocaleTimeString()}]
                                            </span>
                                            {message.translated && (
                                                <Badge variant="outline" className="text-xs">
                                                    Translated
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm">{message.content}</div>
                                        {message.rawProtocol && (
                                            <div className="text-xs opacity-50 mt-1 font-mono">
                                                Raw: {message.rawProtocol.substring(0, 20)}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 📤 MESSAGE INPUT */}
                        <div className="flex space-x-2">
                            <Input 
                                placeholder="Type your message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                className="flex-1"
                            />
                            <Button 
                                onClick={sendMessage}
                                disabled={!selectedAgent || !messageInput.trim() || sendMessageMutation.isPending}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="outline">
                                <Paperclip className="w-4 h-4" />
                            </Button>
                            <Button variant="outline">
                                <Brain className="w-4 h-4" />
                            </Button>
                            <Button variant="outline">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* 📋 QUICK ACTIONS */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Button size="sm" variant="outline">
                                ✅ Approve Suggestion
                            </Button>
                            <Button size="sm" variant="outline">
                                ❌ Reject
                            </Button>
                            <Button size="sm" variant="outline">
                                ⚠️ Proceed with Caution
                            </Button>
                            <Button size="sm" variant="outline">
                                📊 Show Data
                            </Button>
                            <Button size="sm" variant="outline">
                                🎯 Set Custom Parameters
                            </Button>
                            <Button size="sm" variant="outline">
                                📈 View Performance
                            </Button>
                            <Button size="sm" variant="outline">
                                🔄 Request Update
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 💾 LLM TRANSLATION CACHE STATUS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5" />
                        <span>LLM Translation Cache Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-blue-500">87.3%</div>
                            <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-green-500">45ms</div>
                            <div className="text-xs text-muted-foreground">Avg Processing Time</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-yellow-500">3</div>
                            <div className="text-xs text-muted-foreground">Queue Size</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-purple-500">2.4MB</div>
                            <div className="text-xs text-muted-foreground">Cache Size</div>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 border rounded bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Translation Model:</span> OLLAMA Local LLM
                            </div>
                            <div>
                                <span className="font-medium">Confidence:</span> 98.7%
                            </div>
                            <div>
                                <span className="font-medium">Model:</span> llama3.1:70b-instruct-q4_0
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Local Instance:</span>
                                <Badge variant="default">✅ Running</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Clear Cache
                        </Button>
                        <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Model Settings
                        </Button>
                        <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Performance Stats
                        </Button>
                        <Button size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Switch Model
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 🗣️ COLLECTIVE DISCUSSION PREVIEW */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5" />
                        <span>Recent Collective Discussions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="p-3 border rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge>🤖 Agent-001</Badge>
                                <span className="text-xs text-muted-foreground">[14:23:15]</span>
                                <Badge variant="outline">💾 Cached</Badge>
                            </div>
                            <div className="text-sm mb-1">
                                📝 Translation: "I've detected a 2.3% arbitrage opportunity on WETH/USDC pair but gas costs are spiking. Recommend waiting 15-30 seconds."
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                                Raw Protocol: {'{BINARY_PROTOCOL_DATA} 0x4A7B...3F9E'}
                            </div>
                        </div>

                        <div className="p-3 border rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge>🤖 Agent-003</Badge>
                                <span className="text-xs text-muted-foreground">[14:23:18]</span>
                                <Badge variant="outline">⚡ Real-time</Badge>
                            </div>
                            <div className="text-sm mb-1">
                                📝 Translation: "Confirmed. My gas prediction model shows 23% reduction in 22 seconds. Also seeing similar pattern on SushiSwap route."
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                                Raw Protocol: {'{BINARY_PROTOCOL_DATA} 0x9C2D...8A1B'}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Join Discussion
                        </Button>
                        <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Log
                        </Button>
                        <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            View Raw Protocol
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AgentChat;
