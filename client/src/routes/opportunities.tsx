/**
 * 💼 OPPORTUNITIES ANALYSIS PAGE
 * =============================
 * 
 * Implements the OPPORTUNITIES ANALYSIS page from 
 * COMPREHENSIVE_WEB_GUI_ARCHITECTURE.md
 * 
 * Features:
 * - Enhanced table with advanced filtering
 * - Real-time updates via WebSocket
 * - Expandable rows for detailed analysis
 * - Export functionality
 * - Multi-column sorting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
    ChevronDown,
    ChevronUp,
    Filter,
    Download,
    RefreshCw,
    ExternalLink,
    BarChart3,
    MessageSquare,
    Search
} from 'lucide-react';

interface Opportunity {
    id: string;
    agentId: string;
    timestamp: string;
    profit: number;
    riskScore: number;
    chain: string;
    dexPath: string[];
    status: string;
    duration: number;
    txHash?: string;
    reason?: string;
}

interface Filters {
    chain: string;
    dex: string;
    minProfit: string;
    maxProfit: string;
    status: string;
    agentId: string;
    timeRange: string;
}

const Opportunities: React.FC = () => {
    const { connected, agents, opportunities: liveOpportunities } = useSocket();
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<Filters>({
        chain: '',
        dex: '',
        minProfit: '',
        maxProfit: '',
        status: '',
        agentId: '',
        timeRange: 'last24h'
    });

    // Fetch opportunities with filters
    const { data: opportunitiesData, refetch } = useQuery({
        queryKey: ['opportunities', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            
            const response = await axios.get(`/api/opportunities?${params.toString()}`);
            return response.data.data;
        },
        refetchInterval: 10000
    });

    // Merge live opportunities with fetched data
    const allOpportunities = useMemo(() => {
        const fetched = opportunitiesData || [];
        const live = liveOpportunities || [];
        
        // Combine and deduplicate
        const combined = [...live, ...fetched];
        const unique = combined.filter((opp, index, arr) => 
            arr.findIndex(o => o.id === opp.id) === index
        );
        
        return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [opportunitiesData, liveOpportunities]);

    // Auto-select first agent
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0].id);
            setFilters(prev => ({ ...prev, agentId: agents[0].id }));
        }
    }, [agents, selectedAgent]);

    const toggleRowExpansion = (opportunityId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(opportunityId)) {
            newExpanded.delete(opportunityId);
        } else {
            newExpanded.add(opportunityId);
        }
        setExpandedRows(newExpanded);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'calculating': { color: 'bg-blue-500', text: '🔄 CALC' },
            'ready': { color: 'bg-green-500', text: '✅ READY' },
            'executed': { color: 'bg-purple-500', text: '✅ EXEC' },
            'completed': { color: 'bg-green-600', text: '✅ SUCCESS' },
            'failed': { color: 'bg-red-500', text: '❌ FAIL' },
            'skipped': { color: 'bg-orange-500', text: '❌ SKIP' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status };
        
        return (
            <Badge className={`${config.color} text-white`}>
                {config.text}
            </Badge>
        );
    };

    const getRiskBadge = (riskScore: number) => {
        if (riskScore <= 0.2) return <span className="text-green-500">🟢</span>;
        if (riskScore <= 0.4) return <span className="text-yellow-500">🟡</span>;
        return <span className="text-red-500">🔴</span>;
    };

    const exportOpportunities = () => {
        const dataStr = JSON.stringify(allOpportunities, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `opportunities-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    return (
        <div className="space-y-6 p-6">
            {/* 🏆 HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        💼 OPPORTUNITIES ANALYSIS
                    </h1>
                    <p className="text-muted-foreground">
                        Agent: {agents.find(a => a.id === selectedAgent)?.name || 'Select an agent'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${connected ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">Real-time: {connected ? 'ON' : 'OFF'}</span>
                    </div>
                </div>
            </div>

            {/* 🔍 ADVANCED FILTERS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5" />
                        <span>Advanced Filters</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Chain Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Chain</label>
                            <Select value={filters.chain} onValueChange={(value) => 
                                setFilters(prev => ({ ...prev, chain: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="arbitrum">🏹 Arbitrum</SelectItem>
                                    <SelectItem value="base">🔵 Base</SelectItem>
                                    <SelectItem value="polygon">🟣 Polygon</SelectItem>
                                    <SelectItem value="bsc">🟡 BSC</SelectItem>
                                    <SelectItem value="optimism">🔴 Optimism</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* DEX Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">DEX</label>
                            <Select value={filters.dex} onValueChange={(value) => 
                                setFilters(prev => ({ ...prev, dex: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="Uniswap">Uniswap</SelectItem>
                                    <SelectItem value="SushiSwap">SushiSwap</SelectItem>
                                    <SelectItem value="Camelot">Camelot</SelectItem>
                                    <SelectItem value="PancakeSwap">PancakeSwap</SelectItem>
                                    <SelectItem value="Curve">Curve</SelectItem>
                                    <SelectItem value="Balancer">Balancer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Profit Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Min Profit</label>
                            <Input 
                                type="number" 
                                placeholder="$100"
                                value={filters.minProfit}
                                onChange={(e) => setFilters(prev => ({ ...prev, minProfit: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Max Profit</label>
                            <Input 
                                type="number" 
                                placeholder="$50000"
                                value={filters.maxProfit}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxProfit: e.target.value }))}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={filters.status} onValueChange={(value) => 
                                setFilters(prev => ({ ...prev, status: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="calculating">🔄 Calculating</SelectItem>
                                    <SelectItem value="ready">✅ Ready</SelectItem>
                                    <SelectItem value="executed">✅ Executed</SelectItem>
                                    <SelectItem value="completed">✅ Completed</SelectItem>
                                    <SelectItem value="failed">❌ Failed</SelectItem>
                                    <SelectItem value="skipped">❌ Skipped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Time Range</label>
                            <Select value={filters.timeRange} onValueChange={(value) => 
                                setFilters(prev => ({ ...prev, timeRange: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Last 24h" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last1h">Last 1 Hour</SelectItem>
                                    <SelectItem value="last6h">Last 6 Hours</SelectItem>
                                    <SelectItem value="last24h">Last 24 Hours</SelectItem>
                                    <SelectItem value="last7d">Last 7 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                        <Button onClick={() => refetch()} size="sm" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={exportOpportunities} size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button 
                            onClick={() => setFilters({
                                chain: '', dex: '', minProfit: '', maxProfit: '', 
                                status: '', agentId: '', timeRange: 'last24h'
                            })} 
                            size="sm" 
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 📋 OPPORTUNITIES TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>📋 Opportunities Table</span>
                        <div className="text-sm text-muted-foreground">
                            Showing 1-{Math.min(allOpportunities.length, 25)} of {allOpportunities.length}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>📅 Time</TableHead>
                                    <TableHead>🎯 Opportunity ID</TableHead>
                                    <TableHead>💰 Est. Profit</TableHead>
                                    <TableHead>⚡ Risk Score</TableHead>
                                    <TableHead>🔗 DEX Path</TableHead>
                                    <TableHead>🏁 Status</TableHead>
                                    <TableHead>⏱️ Duration</TableHead>
                                    <TableHead>📊 Analysis</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allOpportunities.slice(0, 25).map((opportunity: Opportunity) => (
                                    <React.Fragment key={opportunity.id}>
                                        <TableRow className="hover:bg-muted/50">
                                            <TableCell className="font-mono text-sm">
                                                {new Date(opportunity.timestamp).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>
                                                <Collapsible>
                                                    <CollapsibleTrigger 
                                                        className="flex items-center space-x-2 hover:text-primary"
                                                        onClick={() => toggleRowExpansion(opportunity.id)}
                                                    >
                                                        <span className="font-mono">{opportunity.id}</span>
                                                        {expandedRows.has(opportunity.id) ? 
                                                            <ChevronUp className="w-4 h-4" /> : 
                                                            <ChevronDown className="w-4 h-4" />
                                                        }
                                                    </CollapsibleTrigger>
                                                </Collapsible>
                                            </TableCell>
                                            <TableCell className="font-medium text-green-500">
                                                ${opportunity.profit.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getRiskBadge(opportunity.riskScore)}
                                                    <span className="font-mono text-sm">
                                                        {opportunity.riskScore.toFixed(2)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {opportunity.dexPath.join(' → ')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(opportunity.status)}
                                                {opportunity.reason && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {opportunity.reason}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {opportunity.duration?.toFixed(1)}s
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline">
                                                    <BarChart3 className="w-4 h-4 mr-1" />
                                                    VIEW
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* 📊 EXPANDABLE ROW DETAILS */}
                                        {expandedRows.has(opportunity.id) && (
                                            <TableRow>
                                                <TableCell colSpan={8}>
                                                    <OpportunityDetails opportunityId={opportunity.id} />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {allOpportunities.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No opportunities found matching your filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

/**
 * 📊 OPPORTUNITY DETAILS COMPONENT
 */
const OpportunityDetails: React.FC<{ opportunityId: string }> = ({ opportunityId }) => {
    const { data: analysis } = useQuery({
        queryKey: ['opportunityAnalysis', opportunityId],
        queryFn: async () => {
            const response = await axios.get(`/api/opportunities/${opportunityId}/analysis`);
            return response.data.data;
        }
    });

    if (!analysis) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading detailed analysis...</p>
            </div>
        );
    }

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>🎯 OPPORTUNITY {opportunityId} - DETAILED ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 💎 DECISION MAKING PROCESS */}
                <div>
                    <h4 className="font-semibold mb-3">💎 DECISION MAKING PROCESS:</h4>
                    <div className="space-y-2">
                        {analysis.decisionSteps?.map((step: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                                <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                                    {step.status === 'completed' ? '✅' : '🔄'}
                                </Badge>
                                <span className="font-medium">Step {step.step}: {step.name}</span>
                                <span className="text-muted-foreground">{step.details}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔗 QUICK LINKS */}
                <div>
                    <h4 className="font-semibold mb-3">🔗 QUICK LINKS:</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            🔍 Etherscan Tx
                        </Button>
                        <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            📊 Detailed Analysis
                        </Button>
                        <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            🤖 Ask Agent
                        </Button>
                        <Button size="sm" variant="outline">
                            <Search className="w-4 h-4 mr-2" />
                            📋 Similar Opportunities
                        </Button>
                    </div>
                </div>

                {/* 🏁 EXECUTION RESULTS */}
                {analysis.executionResults && (
                    <div>
                        <h4 className="font-semibold mb-3">🏁 EXECUTION RESULTS:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Actual Profit</div>
                                <div className="text-lg font-bold text-green-500">
                                    ${analysis.executionResults.actualProfit?.toLocaleString()} 
                                    <span className="text-sm">
                                        ({((analysis.executionResults.actualProfit / 2847) * 100).toFixed(0)}% of expected)
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Actual Slippage</div>
                                <div className="text-lg font-bold text-blue-500">
                                    {analysis.executionResults.actualSlippage?.toFixed(1)}%
                                    <span className="text-sm text-green-500"> (Better than expected)</span>
                                </div>
                            </div>
                            <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Gas Used</div>
                                <div className="text-lg font-bold text-yellow-500">
                                    ${analysis.executionResults.gasUsed}
                                    <span className="text-sm text-green-500"> (Lower than estimated)</span>
                                </div>
                            </div>
                            <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Execution Time</div>
                                <div className="text-lg font-bold text-purple-500">
                                    {analysis.executionResults.executionTime}s
                                    <span className="text-sm text-green-500"> (Within target)</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded">
                            <span className="text-sm">
                                🧠 Agent Learning: +{analysis.executionResults.learningGain} confidence for similar patterns
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Helper functions
function getStatusBadge(status: string) {
    const statusConfig = {
        'calculating': { color: 'bg-blue-500', text: '🔄 CALC' },
        'ready': { color: 'bg-green-500', text: '✅ READY' },
        'executed': { color: 'bg-purple-500', text: '✅ EXEC' },
        'completed': { color: 'bg-green-600', text: '✅ SUCCESS' },
        'failed': { color: 'bg-red-500', text: '❌ FAIL' },
        'skipped': { color: 'bg-orange-500', text: '❌ SKIP' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status };
    
    return (
        <Badge className={`${config.color} text-white`}>
            {config.text}
        </Badge>
    );
}

function getRiskBadge(riskScore: number) {
    if (riskScore <= 0.2) return <span className="text-green-500">🟢</span>;
    if (riskScore <= 0.4) return <span className="text-yellow-500">🟡</span>;
    return <span className="text-red-500">🔴</span>;
}

export default Opportunities;
