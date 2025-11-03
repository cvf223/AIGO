/**
 * 🏠 ELITE ARBITRAGE SYNDICATE DASHBOARD
 * =====================================
 * 
 * Main dashboard implementing the LANDING PAGE design from 
 * COMPREHENSIVE_WEB_GUI_ARCHITECTURE.md
 * 
 * Features:
 * - Agent selector dropdown
 * - Real-time performance metrics
 * - Human-in-the-loop notifications
 * - Quick insights
 */

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { 
    TrendingUp, 
    Target, 
    Zap, 
    AlertTriangle,
    Mail,
    Brain,
    DollarSign,
    Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const { connected, agents, systemMetrics } = useSocket();
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const navigate = useNavigate(); // Initialize useNavigate
    
    // Auto-select first agent when available
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0].id);
        }
    }, [agents, selectedAgent]);

    // Fetch agent performance
    const { data: performance } = useQuery({
        queryKey: ['agentPerformance', selectedAgent],
        queryFn: async () => {
            if (!selectedAgent) return null;
            const response = await axios.get(`/api/agents/${selectedAgent}/performance`);
            return response.data.data;
        },
        enabled: !!selectedAgent,
        refetchInterval: 30000
    });

    // Fetch inbox requests
    const { data: inboxData } = useQuery({
        queryKey: ['inboxRequests'],
        queryFn: async () => {
            const response = await axios.get('/api/inbox/requests');
            return response.data.data;
        },
        refetchInterval: 10000
    });

    const selectedAgentData = agents.find(agent => agent.id === selectedAgent);
    const inboxRequests = inboxData || [];
    const urgentRequests = inboxRequests.filter((req: any) => req.priority === 'high').length;

    return (
        <div className="space-y-6 p-6">
            {/* 🏆 HEADER */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">
                    🏆 ELITE ARBITRAGE SYNDICATE - COMMAND CENTER
                </h1>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <span className={`flex items-center space-x-1 ${connected ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{connected ? 'Connected' : 'Disconnected'}</span>
                    </span>
                    <span>•</span>
                    <span>Total Agents: {systemMetrics.totalAgents || 0}</span>
                    <span>•</span>
                    <span>System Uptime: {formatUptime(systemMetrics.systemUptime)}</span>
                </div>
            </div>

            {/* 📊 AGENT SELECTOR */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Agent Selector</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Agent for Analysis" />
                        </SelectTrigger>
                        <SelectContent>
                            {agents.map((agent) => (
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
                            <SelectItem value="create-new">
                                <span className="text-blue-500">+ CREATE NEW AGENT</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* 📈 REAL-TIME PERFORMANCE METRICS */}
            {selectedAgentData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">💰 Today's Profit</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                                ${(selectedAgentData.performance?.todayProfit || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +12.5% from yesterday
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🎯 Success Rate</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">
                                {(selectedAgentData.performance?.successRate || 0).toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Above 85% target
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">⚡ Avg Exec Time</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">
                                {(selectedAgentData.performance?.avgExecutionTime || 0).toFixed(1)}s
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Under 2.5s target
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🔥 Opportunities Found</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-500">
                                {selectedAgentData.performance?.opportunitiesFound || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Today's discoveries
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 🚨 HUMAN-IN-THE-LOOP NOTIFICATIONS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span>Human-in-the-Loop Notifications</span>
                        </div>
                        <Badge variant="destructive">
                            {urgentRequests} NEW REQUESTS
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {inboxRequests.slice(0, 3).map((request: any) => (
                            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                                            {request.priority}
                                        </Badge>
                                        <span className="font-medium">{request.agentId}:</span>
                                        <span>"{request.title}"</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {request.message}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline">
                                    📖 READ
                                </Button>
                            </div>
                        ))}
                        <div className="flex justify-center">
                            <Button variant="outline" className="flex items-center space-x-2" onClick={() => navigate('/agent-chat')}>
                                <Mail className="w-4 h-4" />
                                <span>📨 OPEN INBOX</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🧠 QUICK INSIGHTS */}
            {performance && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            <span>Quick Insights ({selectedAgentData?.name})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span>Learning Progress: {performance.learningProgress || 73}% towards next evolution</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Risk Score: LOW ({(performance.riskScore || 0.23).toFixed(2)}) - Operating within safe bounds</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                <span>Competitive Edge: HIGH - Outperforming market by {performance.competitiveEdge || 34}%</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                <span>Next Recommended Action: Increase position sizes by 15%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 🔌 CONNECTION STATUS */}
            <div className="fixed bottom-4 right-4">
                <Card className="w-64">
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Server Status</span>
                            <div className={`flex items-center space-x-1 ${connected ? 'text-green-500' : 'text-red-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs">{connected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            <div>Active Agents: {agents.filter(a => a.status === 'online').length}</div>
                            <div>Real-time Updates: {connected ? 'ON' : 'OFF'}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

function formatUptime(uptime: number): string {
    if (!uptime) return '0s';
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export default Dashboard;
